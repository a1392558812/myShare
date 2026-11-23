
import { computed, onScopeDispose, ref, watch } from "vue";
import type { ComputedRef, Ref } from "vue";
import { rubberBandClamp } from "./rubberBand.ts";
import { createSpringValue } from "./spring.ts";
import type { SpringConfig } from "./types.ts";

/** 越界 / 惯性相关的可调项，全部可省略，省略则用默认值。 */
export type RubberBandScrollOptions = {
  /** 橡皮筋阻尼常数，等于起步跟手比例 f'(0)，甜区 0.45 ~ 0.65 */
  constant?: number;
  /** 惯性投影时长（秒）：把松手速度投影成一段距离 */
  projection?: number;
  /** 低于该速度不投影，直接回弹（px/s） */
  minFlingVelocity?: number;
  /** 速度上限（px/s）：触控板、多指、时钟抖动都能给出异常值 */
  maxVelocity?: number;
  /** 速度采样窗口（毫秒）：取窗口首尾差，别用最后两帧 */
  sampleWindow?: number;
  /** 弹簧参数，每次 to() 时重读，拖动滑杆可实时改手感 */
  spring?: Partial<SpringConfig>;
  /** 界内 1:1 滚动开关，默认 true。关闭后手势被忽略，但 scrollTo() 仍可用 */
  scrollable?: boolean;
  /** 顶部越界阻尼开关，默认 true。关闭后 raw 被硬钳制在 0 */
  overScrollTop?: boolean;
  /** 底部越界阻尼开关，默认 true。关闭后 raw 被硬钳制在 maxScroll */
  overScrollBottom?: boolean;
};

type ResolvedOptions = Required<Omit<RubberBandScrollOptions, "spring">> & {
  spring: Partial<SpringConfig>;
};

/** 组件里实际会用到的一切，包括模板事件绑定和 defineExpose 的成员。 */
export type RubberBandScrollApi = {
  readonly position: Ref<number>;
  readonly velocity: Ref<number>;
  readonly maxScroll: Ref<number>;
  readonly viewportSize: Ref<number>;
  readonly display: ComputedRef<number>;
  readonly translateY: ComputedRef<number>;
  readonly dragging: Ref<boolean>;
  readonly settling: Ref<boolean>;
  readonly onPointerDown: (event: PointerEvent) => void;
  readonly onPointerMove: (event: PointerEvent) => void;
  readonly onPointerUp: (event: PointerEvent) => void;
  readonly onPointerCancel: (event: PointerEvent) => void;
  /** 程序化滚动，返回本次动画的最终落点（被打断时就是打断处的值） */
  readonly scrollTo: (
    target: number,
    initialVelocity?: number,
    overrides?: Partial<SpringConfig>,
  ) => Promise<number>;
  /** 重新量一次容器与内容尺寸 */
  readonly measure: () => void;
};

const DEFAULTS: ResolvedOptions = {
  constant: 0.55,
  projection: 0.3,
  minFlingVelocity: 40,
  maxVelocity: 4000,
  sampleWindow: 100,
  spring: {},
  scrollable: true,
  overScrollTop: true,
  overScrollBottom: true,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const useRubberBandScroll = (
  viewportRef: Ref<HTMLElement | null>,
  contentRef: Ref<HTMLElement | null>,
  readOptions: () => RubberBandScrollOptions = () => ({}),
): RubberBandScrollApi => {
  const resolveOptions = (): ResolvedOptions => {
    const raw = readOptions();
    return {
      constant: raw.constant ?? DEFAULTS.constant,
      projection: raw.projection ?? DEFAULTS.projection,
      minFlingVelocity: raw.minFlingVelocity ?? DEFAULTS.minFlingVelocity,
      maxVelocity: raw.maxVelocity ?? DEFAULTS.maxVelocity,
      sampleWindow: raw.sampleWindow ?? DEFAULTS.sampleWindow,
      spring: raw.spring ?? DEFAULTS.spring,
      scrollable: raw.scrollable ?? DEFAULTS.scrollable,
      overScrollTop: raw.overScrollTop ?? DEFAULTS.overScrollTop,
      overScrollBottom: raw.overScrollBottom ?? DEFAULTS.overScrollBottom,
    };
  };

  // 注意：overrides 传的是函数，所以这里必须已经定义好 resolveOptions
  const spring = createSpringValue(0, () => resolveOptions().spring);

  /** 原始滚动位置：可以 < 0，也可以 > maxScroll，这是「越界量」的唯一真相 */
  const position = ref(0);
  const velocity = ref(0);
  const maxScroll = ref(0);
  const viewportSize = ref(1);
  const dragging = ref(false);
  const settling = ref(false);

  /** 自增版本号：用来丢弃被打断的过期 promise 回调 */
  let generation = 0;

  const unsubscribe = spring.onChange((value, speed) => {
    position.value = value;
    velocity.value = speed;
  });

  const display = computed(() => {
    const opts = resolveOptions();
    return rubberBandClamp(
      position.value,
      0,
      maxScroll.value,
      { constant: opts.constant, dimension: viewportSize.value },
      { top: opts.overScrollTop, bottom: opts.overScrollBottom },
    );
  });

  const translateY = computed(() => -display.value);

  /* ---------------- 速度采样 ---------------- */

  const samples: Array<{ time: number; value: number }> = [];

  /**
   * 裁剪窗口。两个作用：限制窗口长度；以及手指停住再松手时窗口里只剩
   * 一个样本，速度自然为 0 —— 这解决了「拖完停 200ms 再松手还触发惯性」。
   */
  const prune = (window: number): void => {
    const time = performance.now();
    // 至少留一个样本，避免窗口内全是旧数据时数组清空
    while (samples.length > 1 && time - samples[0].time > window)
      samples.shift();
  };

  const pushSample = (value: number): void => {
    samples.push({ time: performance.now(), value });
    prune(resolveOptions().sampleWindow);
  };

  /** 最近窗口的首尾差估速：单帧差在 120Hz 下会被放大十几倍 */
  const readVelocity = (): number => {
    const { sampleWindow, maxVelocity } = resolveOptions();
    prune(sampleWindow); // 必须在读之前再裁一次，否则停手松手会用到陈旧样本
    if (samples.length < 2) return 0;
    const first = samples[0];
    const last = samples[samples.length - 1];
    const seconds = (last.time - first.time) / 1000;
    if (seconds <= 0) return 0;
    const speed = (last.value - first.value) / seconds;
    return clamp(speed, -maxVelocity, maxVelocity);
  };

  /* ---------------- 测量 ---------------- */

  const measure = (): void => {
    const viewport = viewportRef.value;
    const content = contentRef.value;
    if (!viewport || !content) return;
    viewportSize.value = Math.max(viewport.clientHeight, 1);
    maxScroll.value = Math.max(content.offsetHeight - viewportSize.value, 0);
    if (dragging.value) return;
    // 内容被改短时把位置收回合法区间，否则下次拖动会先看到一段空白
    const next = clamp(position.value, 0, maxScroll.value);
    if (next !== position.value) spring.set(next);
  };

  /* ---------------- 动画 ---------------- */

  const animateTo = (
    target: number,
    initialVelocity = 0,
    overrides?: Partial<SpringConfig>,
  ): Promise<number> => {
    generation += 1;
    const id = generation;
    const nextTarget = clamp(target, 0, maxScroll.value);
    settling.value = true;
    return spring.to(nextTarget, initialVelocity, overrides).then((final) => {
      // 被打断时回调会晚到，别让它把新动画的状态误置为 false
      if (id !== generation) return final;
      position.value = final;
      settling.value = false;
      return final;
    });
  };

  const scrollTo = (
    target: number,
    initialVelocity = 0,
    overrides?: Partial<SpringConfig>,
  ): Promise<number> => animateTo(target, initialVelocity, overrides);

  /* ---------------- 手势 ---------------- */

  let pointerId: number | null = null;
  let startPointerY = 0;
  let startPosition = 0;

  const onPointerDown = (event: PointerEvent): void => {
    if (pointerId !== null || event.button !== 0) return;
    const element = event.currentTarget;
    if (!(element instanceof HTMLElement)) return;
    const opts = resolveOptions();

    generation += 1;
    // 任何按下都先停住正在跑的动画（程序化 scrollTo 也要能被手指打断）
    spring.stop();
    settling.value = false;

    // 正常滚动关闭：不进入拖动状态，pointerId 保持 null，
    // 后续 pointermove / pointerup 会因为 event.pointerId !== pointerId 直接 return。
    // 但若当前处于越界位置（例如上一段 scrollTo 未完成、或开关刚切换），
    // 让弹簧把它收回合法区间，而不是停在空白里。
    if (!opts.scrollable) {
      const next = clamp(position.value, 0, maxScroll.value);
      if (next !== position.value) void animateTo(next, 0);
      return;
    }

    dragging.value = true;
    pointerId = event.pointerId;
    startPointerY = event.clientY;
    startPosition = position.value;
    samples.length = 0;
    pushSample(position.value);
    // 手指移出元素后事件仍送到它身上，松手自动释放
    element.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    const opts = resolveOptions();
    if (!opts.scrollable) return; // 双保险（pointerId 已挡住，这里更清晰）

    // 手指上移 => 内容上移 => position 增大，所以是减法
    let next = startPosition - (event.clientY - startPointerY);

    // 关键：越界开关关闭时，直接在 raw 上钳死。
    // 这样 readVelocity() 在边界处读到的是 0，松手不会触发回弹。
    if (!opts.overScrollTop) next = Math.max(next, 0);
    if (!opts.overScrollBottom) next = Math.min(next, maxScroll.value);

    spring.set(next);
    pushSample(next);
  };

  /** pointerup 和 pointercancel 必须走同一个分支，否则 dragging 会永久为 true */
  const finishDrag = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    const element = event.currentTarget;
    if (
      element instanceof HTMLElement &&
      element.hasPointerCapture(event.pointerId)
    ) {
      element.releasePointerCapture(event.pointerId);
    }
    pointerId = null;
    dragging.value = false;

    // 被系统手势 / 多指 / 切 App 打断时不给惯性，否则会莫名其妙甩出去
    const speed = event.type === "pointerup" ? readVelocity() : 0;
    const { projection, minFlingVelocity } = resolveOptions();
    const projected =
      Math.abs(speed) < minFlingVelocity
        ? position.value
        : position.value + speed * projection;
    void animateTo(projected, speed);
  };

  const onPointerUp = (event: PointerEvent): void => finishDrag(event);
  const onPointerCancel = (event: PointerEvent): void => finishDrag(event);

  /* ---------------- 尺寸监听 & 清理 ---------------- */

  let observer: ResizeObserver | null = null;

  watch(
    [viewportRef, contentRef],
    ([viewport, content]) => {
      observer?.disconnect();
      observer = null;
      if (!viewport || !content) return;
      measure();
      // ResizeObserver 是异步批量回调的，别在 pointermove 里读 offsetHeight
      observer = new ResizeObserver(() => measure());
      observer.observe(viewport);
      observer.observe(content);
    },
    { immediate: true, flush: "post" },
  );

  /**
   * 运行时切换越界开关：如果当前 raw 处于「已被关闭的方向」，
   * 用弹簧平滑收回合法区间，而不是瞬间跳变。
   * 拖动中不处理（onPointerMove 会立即钳制，视觉上就是不动了）。
   */
  watch(
    [
      () => resolveOptions().overScrollTop,
      () => resolveOptions().overScrollBottom,
    ],
    ([top, bottom]) => {
      if (dragging.value) return;
      let next = position.value;
      if (!top) next = Math.max(next, 0);
      if (!bottom) next = Math.min(next, maxScroll.value);
      if (next !== position.value) void animateTo(next, 0);
    },
  );

  onScopeDispose(() => {
    observer?.disconnect();
    observer = null;
    unsubscribe();
    // 组件卸载要 cancelAnimationFrame，别让 rAF 在卸载后继续跑
    spring.stop();
  });

  return {
    position,
    velocity,
    maxScroll,
    viewportSize,
    display,
    translateY,
    dragging,
    settling,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    scrollTo,
    measure,
  };
};