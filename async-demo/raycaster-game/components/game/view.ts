/** 水平视野角 */
export const FOV = Math.PI / 3

/** 墙体视觉高度系数，越大越有“高墙”压迫感 */
export const WALL_HEIGHT_RATIO = 1.35

/** 每根射线渲染的列宽（CSS 像素），2 表示半分辨率列，性能与观感折中 */
export const COLUMN_WIDTH = 2

/** 视觉上的最远可见距离，超过后完全融入雾色 */
export const MAX_DEPTH = 26

/** 眼睛相对地面的高度，与墙高 1 的坐标系配合使用 */
export const EYE_HEIGHT = 0.5

/** 俯仰角上限（弧度），约 ±37°，再大透视会明显失真 */
export const MAX_PITCH = 0.65

/**
 * 俯仰带来的竖直投影位移（像素）。
 * 墙切片与地板 / 天花板必须共用这一个函数，否则墙脚会与地面错位。
 */
export const getPitchOffset = (pitch: number, height: number): number =>
  Math.tan(pitch) * height * WALL_HEIGHT_RATIO
