
import type { SpringConfig, SpringState } from "./types.ts";

/** 建议默认值：0.42s 一个周期、ζ = 0.72，只冒 3.8% 的头 */
export const DEFAULT_SPRING: SpringConfig = {
  response: 0.42,
  dampingRatio: 0.72,
  restDelta: 0.5,
  restSpeed: 0.5,
};

/** 求解器的签名：时间 → 状态。可任意调用、可回放、可 scrub。 */
export type SpringSolver = (time: number) => SpringState;

/**
 * 三分支解析解：欠阻尼 / 临界 / 过阻尼。
 *
 * 给定 from / to / velocity / config，返回一个 t → state 的纯函数。
 * 帧率无关、零累积误差、可任意 seek、t=0 精确等于初值。
 */
export const createSpringSolver = (
  from: number,
  to: number,
  velocity: number,
  config: Pick<SpringConfig, "response" | "dampingRatio">,
): SpringSolver => {
  const omega = (2 * Math.PI) / Math.max(config.response, 1e-4);
  const zeta = Math.max(config.dampingRatio, 0);
  const delta = from - to;

  // 欠阻尼：一对共轭复根，振荡衰减
  if (zeta < 1) {
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    const decay = zeta * omega;
    const a = delta;
    const b = (velocity + decay * delta) / omegaD;

    return (time) => {
      const exp = Math.exp(-decay * time);
      const cos = Math.cos(omegaD * time);
      const sin = Math.sin(omegaD * time);
      return {
        value: to + exp * (a * cos + b * sin),
        velocity:
          exp *
          ((b * omegaD - decay * a) * cos - (a * omegaD + decay * b) * sin),
      };
    };
  }

  // 过阻尼：两个不相等的实根，纯指数收敛，绝不越过目标
  if (zeta > 1) {
    const spread = omega * Math.sqrt(zeta * zeta - 1);
    const rootA = -zeta * omega + spread;
    const rootB = -zeta * omega - spread;
    const coefA = (velocity - rootB * delta) / (rootA - rootB);
    const coefB = (rootA * delta - velocity) / (rootA - rootB);

    return (time) => {
      const expA = Math.exp(rootA * time);
      const expB = Math.exp(rootB * time);
      return {
        value: to + coefA * expA + coefB * expB,
        velocity: rootA * coefA * expA + rootB * coefB * expB,
      };
    };
  }

  // 临界阻尼：重根，速度单调趋零
  const a = delta;
  const b = velocity + omega * delta;

  return (time) => {
    const exp = Math.exp(-omega * time);
    return {
      value: to + (a + b * time) * exp,
      velocity: (b - omega * (a + b * time)) * exp,
    };
  };
};

/** 对外暴露的弹簧句柄：值 + 速度 + 目标 + 控制方法 + 订阅 */
export type SpringValue = {
  readonly value: number;
  readonly velocity: number;
  readonly target: number;
  readonly isAnimating: boolean;
  /** 去掉返回 promise，动画结束或被 stop() 打断时 resolve 成「最终落点」 */
  readonly to: (
    target: number,
    initialVelocity?: number,
    overrides?: Partial<SpringConfig>,
  ) => Promise<number>;
  /** 直接把值和目标钉到某个位置，不播动画 */
  readonly set: (value: number) => void;
  /** 就地停住：保留当前值和当前速度，供下一段动画接着算 */
  readonly stop: () => void;
  readonly onChange: (
    listener: (value: number, velocity: number) => void,
  ) => () => void;
};

/**
 * rAF 驱动 + promise 封装。
 *
 * overrides 传函数而不是对象：每次 to() 都重读一遍最新参数，
 * 配合 Vue 的响应式 props，拖动滑杆时手感实时变化，不必重建实例。
 */
export const createSpringValue = (
  initial: number,
  overrides: () => Partial<SpringConfig> = () => ({}),
): SpringValue => {
  const listeners = new Set<(value: number, velocity: number) => void>();

  let value = initial;
  let velocity = 0;
  let target = initial;
  let config: SpringConfig = { ...DEFAULT_SPRING, ...overrides() };
  let solver: SpringSolver | null = null;
  let startedAt = 0;
  let frame: number | null = null;
  let pending: ((value: number) => void) | null = null;

  const emit = (): void => {
    listeners.forEach((listener) => listener(value, velocity));
  };

  const halt = (finalValue: number): void => {
    value = finalValue;
    velocity = 0;
    solver = null;
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
    const resolve = pending;
    pending = null;
    emit();
    resolve?.(finalValue);
  };

  const step = (now: number): void => {
    if (!solver) return;
    // 用 elapsed 而不是累积 dt：掉帧、倍速、后台唤醒都不会让轨迹失真。
    // rAF 首帧时间戳可能略早于 startedAt，所以兜一个 0。
    const elapsed = Math.max((now - startedAt) / 1000, 0);
    const state = solver(elapsed);
    value = state.value;
    velocity = state.velocity;

    // 位移和速度都收敛才算停：只看速度会在过零点误判
    const settled =
      Math.abs(value - target) <= config.restDelta &&
      Math.abs(velocity) <= config.restSpeed;

    if (settled) {
      halt(target);
      return;
    }
    emit();
    frame = requestAnimationFrame(step);
  };

  const stop = (): void => {
    if (solver === null && frame === null) return;
    halt(value);
  };

  const set = (next: number): void => {
    stop();
    target = next;
    value = next;
    velocity = 0;
    emit();
  };

  const to = (
    nextTarget: number,
    initialVelocity = 0,
    callOverrides?: Partial<SpringConfig>,
  ): Promise<number> => {
    stop();
    config = { ...DEFAULT_SPRING, ...overrides(), ...(callOverrides ?? {}) };
    target = nextTarget;
    velocity = initialVelocity;

    const alreadyThere =
      Math.abs(value - nextTarget) <= config.restDelta &&
      Math.abs(initialVelocity) <= config.restSpeed;

    if (alreadyThere) {
      halt(nextTarget);
      return Promise.resolve(nextTarget);
    }

    solver = createSpringSolver(value, nextTarget, initialVelocity, config);
    startedAt = performance.now();
    frame = requestAnimationFrame(step);

    return new Promise<number>((resolve) => {
      pending = resolve;
    });
  };

  const onChange = (
    listener: (value: number, velocity: number) => void,
  ): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    get value() {
      return value;
    },
    get velocity() {
      return velocity;
    },
    get target() {
      return target;
    },
    get isAnimating() {
      return solver !== null;
    },
    to,
    set,
    stop,
    onChange,
  };
};