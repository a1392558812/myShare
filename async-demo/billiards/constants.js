/**
 * 台球 · 黑八 —— 常量配置
 * 所有尺寸均为「逻辑像素」，渲染时整体缩放到画布。
 */

/** 台面可击球区域（不含木边） */
export const TABLE = { W: 1000, H: 500 }

/** 木边（库边外框）宽度 */
export const RAIL = 34

/** 含木边的整块球台尺寸 */
export const BOARD = { W: TABLE.W + RAIL * 2, H: TABLE.H + RAIL * 2 }

/** 球半径 */
export const BALL_R = 11

/** 开球线（厨房区右边界） */
export const HEAD_LINE_X = TABLE.W * 0.25

/** 置球点（球堆顶点） */
export const FOOT_SPOT = { x: TABLE.W * 0.75, y: TABLE.H / 2 }

/**
 * 六个袋口（台面坐标系）
 * 角袋半径 24，中袋半径 20（中袋略浅，避免沿库球被过度吸入）
 */
export const POCKETS = [
  { x: 0, y: 0, r: 24, type: 'corner' },
  { x: TABLE.W / 2, y: 0, r: 20, type: 'side' },
  { x: TABLE.W, y: 0, r: 24, type: 'corner' },
  { x: 0, y: TABLE.H, r: 24, type: 'corner' },
  { x: TABLE.W / 2, y: TABLE.H, r: 20, type: 'side' },
  { x: TABLE.W, y: TABLE.H, r: 24, type: 'corner' },
]

/** 物理参数 */
export const PHYSICS = {
  /** 满力出球速度（px/s） */
  MAX_SPEED: 1500,
  /** 滚动摩擦：常数项 */
  FRICTION_BASE: 160,
  /** 滚动摩擦：与速度成正比项 */
  FRICTION_K: 0.06,
  /** 低于该速度直接归零 */
  STOP_SPEED: 6,
  /** 库边恢复系数 */
  CUSHION_REST: 0.72,
  /** 库边切向摩擦 */
  CUSHION_FRICTION: 0.96,
  /** 球球恢复系数 */
  BALL_REST: 0.94,
  /** 蓄力速度（1 = 1 秒满力） */
  CHARGE_RATE: 1,
  /** 连击 / 推杆判定窗口（秒） */
  PUSH_WINDOW: 0.12,
  /** AI 出手前思考时间（秒） */
  AI_DELAY: 0.9,
}

/** 球号 -> 主色 */
export const BALL_COLORS = {
  1: '#f4c400',
  2: '#1f4fd8',
  3: '#d42a2a',
  4: '#7b32c9',
  5: '#f0801a',
  6: '#1a8a45',
  7: '#8c2b2b',
  8: '#141414',
  9: '#f4c400',
  10: '#1f4fd8',
  11: '#d42a2a',
  12: '#7b32c9',
  13: '#f0801a',
  14: '#1a8a45',
  15: '#8c2b2b',
}

/** 母球色 */
export const CUE_COLOR = '#f8f5ec'

/** 台布 / 木框配色 */
export const THEME = {
  felt: '#1c7a51',
  feltDark: '#12603f',
  wood: '#6b3f1f',
  woodDark: '#35200d',
  pocket: '#0a0d0a',
  diamond: '#e8d9a8',
}
