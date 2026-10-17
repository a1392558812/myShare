/** 方块类型表：7 种颜色，emoji 动物 + 自包含配色（不依赖 theme.scss） */
export const TILE_TYPES = [
  { key: 'red', name: '红', emoji: '🐶', main: '#ff5f6d', light: '#ff9098', dark: '#b31f2c' },
  { key: 'orange', name: '橙', emoji: '🦊', main: '#ff9d3d', light: '#ffc178', dark: '#c25c00' },
  { key: 'blue', name: '蓝', emoji: '🐭', main: '#4aa8ff', light: '#8fcdff', dark: '#1157ad' },
  { key: 'green', name: '绿', emoji: '🐹', main: '#3ddc84', light: '#83f0b4', dark: '#128a45' },
  { key: 'purple', name: '紫', emoji: '🐼', main: '#b77cff', light: '#d6b0ff', dark: '#6a2fb5' },
  { key: 'yellow', name: '黄', emoji: '🐱', main: '#ffd93d', light: '#ffe985', dark: '#c99300' },
  { key: 'pink', name: '粉', emoji: '🐰', main: '#ff7ac6', light: '#ffb0e0', dark: '#b32b7a' },
]

/** 彩球：无颜色（color = -1），不参与连线匹配 */
export const RAINBOW = { key: 'rainbow', name: '彩球', emoji: '🌈', main: '#ffffff', light: '#ffe6fb', dark: '#8a5cff' }
export const NO_COLOR = -1

/** 特殊块类型 */
export const SPECIAL = { ROW: 'row', COL: 'col', AREA: 'area', RAINBOW: 'rainbow' }

/** 特殊块触发奖励（触发时结算，生成时不计） */
export const SPECIAL_BONUS = { row: 50, col: 50, area: 100, rainbow: 150 }

/** 计分 */
export const BASE_PER_TILE = 10
export const MAX_MULT = 8
/** cap 可由「连锁大师」强化抬到 16 */
export const multOf = (wave, cap = MAX_MULT) => Math.min(1 << Math.max(0, wave - 1), cap)

/** 动画时序（ms） */
export const TIME = {
  swap: 120,
  revert: 120,
  clear: 100,
  fallPerCell: 120,
  fallMax: 720,
  shuffle: 420,
  land: 130,
}

/** 棋盘渲染尺寸 */
export const CELL = 68
export const BOARD_PAD = 14

/** 星级线：1★=目标 2★=×1.5 3★=×2 */
export const starOf = (score, target) => {
  if (score >= target * 2) return 3
  if (score >= target * 1.5) return 2
  return 1
}

export const EMPTY_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji","Segoe UI Symbol",sans-serif'
