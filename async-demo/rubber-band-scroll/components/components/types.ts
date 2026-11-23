
/** 一条列表数据。 */
export type ListItem = {
  readonly id: number;
  readonly title: string;
  readonly summary: string;
};

/**
 * 弹簧参数。
 *
 * 不用 k / c / m，而用「响应周期 + 阻尼比」：两个维度独立，调参不打架。
 * response 的物理含义是「走完一个完整振荡周期大约多久」（秒）。
 */
export type SpringConfig = {
  /** 角周期：ω = 2π / response */
  readonly response: number;
  /** 阻尼比 ζ：<1 欠阻尼、=1 临界、>1 过阻尼 */
  readonly dampingRatio: number;
  /** 位移收敛阈值（px），停下判据的一半 */
  readonly restDelta: number;
  /** 速度收敛阈值（px/s），停下判据的另一半 */
  readonly restSpeed: number;
};

/**
 * 解析解在 t 时刻的完整状态。
 *
 * velocity 是 value 对时间的真实一阶导数，不是差分近似 —— 它可以直接
 * 当成下一段动画的初速度喂回去，这是「可中断」的基础。
 */
export type SpringState = {
  readonly value: number;
  readonly velocity: number;
};