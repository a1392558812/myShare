
export type RubberBandConfig = {
  /** 阻尼常数：1 表示完全不阻尼，iOS 实测值约 0.55 */
  readonly constant: number;
  /** 参考尺寸，必须取容器在该轴上的**可视长度**（clientHeight），不是内容高度 */
  readonly dimension: number;
};

/** 轴开关：控制顶部 / 底部越界阻尼是否生效 */
export type RubberBandAxisOptions = {
  /** 顶部越界是否允许，默认 true */
  readonly top?: boolean;
  /** 底部越界是否允许，默认 true */
  readonly bottom?: boolean;
};

/** 把"手指走了多少"映射成"内容该走多少" */
export const rubberBand = (
  offset: number,
  config: RubberBandConfig,
): number => {
  const { constant, dimension } = config;
  const distance = Math.abs(offset);
  if (distance === 0) return 0;
  if (dimension <= 0) return 0;
  const sign = offset < 0 ? -1 : 1;
  return (
    (sign * distance * dimension * constant) / (dimension + constant * distance)
  );
};

/** f'(x) = c·D² / (D + c|x|)²，用于把 display 速度换算回 raw 速度 */
export const rubberBandDerivative = (
  offset: number,
  config: RubberBandConfig,
): number => {
  const { constant, dimension } = config;
  const base = dimension + constant * Math.abs(offset);
  return (constant * dimension * dimension) / (base * base);
};

/**
 * 反函数 f⁻¹(y) = y·D / (c·(D - |y|))。
 * 本方案里用不到它（raw 一直留在手里），但「只持有 display 值」的场景必须靠它。
 */
export const rubberBandInverse = (
  banded: number,
  config: RubberBandConfig,
): number => {
  const { constant, dimension } = config;
  const sign = banded < 0 ? -1 : 1;
  // y 永远到不了 D，留 0.5% 余量避免除零
  const distance = Math.min(Math.abs(banded), dimension * 0.995);
  return (sign * dimension * distance) / (constant * (dimension - distance));
};

/**
 * 双端越界的完整映射：
 * 落在 [min, max] 内的位移 1:1 呈现，越界的部分压进橡皮筋。
 *
 * axis 控制哪一端允许越界：关闭的那一端会被硬钳制在边界上。
 * 默认两端都开启，与旧调用保持兼容。
 */
export const rubberBandClamp = (
  offset: number,
  min: number,
  max: number,
  config: RubberBandConfig,
  axis: RubberBandAxisOptions = {},
): number => {
  const { top = true, bottom = true } = axis;
  if (offset < min) {
    return top ? min + rubberBand(offset - min, config) : min;
  }
  if (offset > max) {
    return bottom ? max + rubberBand(offset - max, config) : max;
  }
  return offset;
};