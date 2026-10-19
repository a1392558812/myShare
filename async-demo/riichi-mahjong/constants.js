/** 牌桌逻辑分辨率（等比缩放到容器） */
export const DESIGN = { w: 1160, h: 760 }

/** 牌张尺寸：手牌 / 牌河 / 副露 / 牌背 */
export const TILE = {
  hand: { w: 52, h: 72 },
  river: { w: 36, h: 40 },
  meld: { w: 34, h: 46 },
  back: { w: 40, h: 54 },
  gap: 2,
}

/**
 * 牌河：8 列 × 6 行 = 48 个槽位
 * 一局打满（荒牌流局）实测每人 48 张，6 列只能装 36 张 —— 第 37 张会压到手牌上，
 * 所以改为横向扩容到 8 列（画布宽 1160，牌河仅用 304，右侧副露区仍有余量）
 */
export const RIVER = { cols: 8, rows: 6 }

/**
 * 纵向分区（累计高度 = 760）
 * 对手牌背 8–62 ｜ 对手牌河 68–318 ｜ 中央信息 338–390
 * 自己牌河 400–650 ｜ 自己手牌 676–748（中间留 26px，牌河再满也不会贴脸）
 */
export const ROW = {
  oppBack: 8,
  oppRiver: 68,
  center: 364,
  myRiver: 400,
  myHand: 676,
}

export const CENTER = { x: DESIGN.w / 2 }

/** 桌面配色（自包含，不依赖 theme.scss） */
export const C = {
  felt: '#12503a',
  feltDark: '#0b3527',
  feltLight: '#17705020',
  line: 'rgba(255,255,255,.09)',
  panel: 'rgba(0,0,0,.28)',
  gold: '#ffd93d',
  red: '#ff5f6d',
  green: '#3ddc84',
  blue: '#4aa8ff',
  purple: '#b77cff',
  text: '#f2efe6',
  dim: 'rgba(242,239,230,.55)',
  riichi: '#ff5f6d',
}

/** 牌面配色 */
export const FACE = {
  bg: '#fbf7ec',
  edge: '#d8cfb8',
  shadow: 'rgba(0,0,0,.35)',
  man: '#1d1a17',
  manChar: '#c0392b',
  pin: ['#c0392b', '#1f6fb2', '#2e8b57'],
  sou: '#1f7a45',
  souEdge: '#0f4a29',
  honor: '#1d1a17',
  honorRed: '#c0392b',
  honorBlue: '#1f6fb2',
  honorGreen: '#1f7a45',
  back: '#1a6b52',
  backEdge: '#0e3d2e',
}

/**
 * 动画时长
 * autoPass = 无可响应时自动过牌的停留时间
 * autoCut  = 立直锁牌后只有一张可打（摸切）时自动打出的停留时间
 */
export const ANIM = { discard: 150, draw: 100, call: 200, autoPass: 420, autoCut: 340 }

/** 宣告特效时长（横幅 + 光环） */
export const FX = { banner: 1200, ring: 900, flash: 600 }

/** 宣告种类配色：CALL=吃碰杠，RIICHI=立直，WIN=和牌 */
export const FX_COLOR = {
  call: '#ffd93d',
  riichi: '#ff5f6d',
  win: '#ff9d3d',
}

/** 难度与局制 */
export const DIFFICULTY = [
  { key: 'easy', name: '简单', desc: '只看牌效率，适合熟悉规则' },
  { key: 'normal', name: '普通', desc: '牌效率 + 役种规划 + 立直判断' },
  { key: 'hard', name: '困难', desc: '增加危险牌识别与弃和防守' },
]

export const MATCH_LENGTH = [
  { key: 'east', name: '东风战', desc: '東場 4 局' },
  { key: 'south', name: '半庄战', desc: '東場 + 南場 共 8 局' },
]

export const STORAGE_KEY = 'riichi-mahjong-settings'
