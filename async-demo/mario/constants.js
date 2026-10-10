/** 瓦片像素尺寸 */
export const TILE = 32
/** 视口列数（FC 原版同比例） */
export const VIEW_COLS = 25
/** 视口行数 */
export const VIEW_ROWS = 15
/** 视口宽 */
export const VIEW_W = VIEW_COLS * TILE
/** 视口高 */
export const VIEW_H = VIEW_ROWS * TILE

/** 关卡字符语义 */
export const T = {
  EMPTY: ' ',
  GROUND: '#',
  BRICK: 'B',
  HIDDEN: 'H',
  USED: 'U',
  COIN_BLOCK: '?',
  POWER_BLOCK: 'M',
  MULTI_BLOCK: '1',
  STONE: 'S',
  PLATFORM: '=',
  PIPE: 'p',
  PIPE_PLANT: 'P',
  WARP: 'W',
  BONUS_EXIT: 'X',
  MOVE_H: 'v',
  MOVE_V: '^',
  CHECKPOINT: 'm',
  COIN: 'o',
  FLAG_POLE: 'f',
  FLAG_BASE: 'F',
  CASTLE: 'C',
  GOOMBA: 'g',
  KOOPA: 'k',
  CROW: 'r',
  LAKITU: 'l',
  PLAYER: '@',
}

/** 实心瓦片集合（参与碰撞） */
export const SOLID = new Set([
  T.GROUND, T.BRICK, T.HIDDEN, T.USED, T.COIN_BLOCK, T.POWER_BLOCK,
  T.MULTI_BLOCK, T.STONE, T.PLATFORM, T.PIPE, T.PIPE_PLANT, T.WARP, T.BONUS_EXIT, T.CASTLE,
])

/** 顶出后变为已用块的字符 */
export const BUMPS_TO_USED = new Set([T.COIN_BLOCK, T.POWER_BLOCK, T.MULTI_BLOCK, T.HIDDEN])

/** 物理参数（单位：px / 帧，固定 60fps） */
export const PHYS = {
  gravity: 0.62,
  fallGravity: 0.74,
  holdGravity: 0.45,
  maxFall: 13,
  walkAccel: 0.5,
  runAccel: 0.64,
  airAccel: 0.36,
  friction: 0.42,
  maxWalk: 4.3,
  maxRun: 6.8,
  jumpVel: -11.6,
  jumpCut: -4.2,
  coyote: 6,
  buffer: 8,
  cornerAssist: 6,
  edgeAssist: 7,
  starSpeed: 1.32,
}

/** 角色尺寸 */
export const PLAYER = {
  smallW: 22,
  smallH: 28,
  bigW: 24,
  bigH: 44,
  stompBounce: -8.2,
  deathVel: -11,
}

/** 敌人尺寸与速度 */
export const ENEMY = {
  goomba: { w: 30, h: 30, speed: 0.85 },
  koopa: { w: 30, h: 44, speed: 0.9, shellH: 28, shellSpeed: 9 },
  spiny: { w: 28, h: 28, speed: 1.15 },
  crow: { w: 30, h: 24, speed: 1.5 },
  lakitu: { w: 34, h: 28, speed: 1.1 },
  // top：花探出管口的高度（1.4 格，保证「管道高 3 格 + 花」仍在满跳 144px 内可越过）
  // idle：完全缩回在管内的停留时间（随机区间），waitUp：探到顶后的停留时间
  piranha: { w: 30, h: 38, rise: 2.2, top: 44, waitUp: 90, idleMin: 48, idleMax: 132 },
}

/** 道具尺寸 */
export const ITEM = {
  w: 28,
  h: 28,
  speed: 1.5,
  emerge: 30,
}

/** 计分 */
export const SCORE = {
  coin: 100,
  blockCoin: 200,
  brick: 50,
  stompChain: [100, 200, 400, 800, 1000, 2000, 4000, 8000],
  mushroom: 1000,
  flower: 1000,
  star: 1000,
  shellKillChain: [200, 400, 800, 1000, 2000, 4000, 8000],
  poleBase: 200,
  poleStep: 80,
  timeBonus: 50,
}

/** 时长（帧） */
export const TIME = {
  star: 600,
  invuln: 96,
  dying: 84,
  clear: 150,
  level: 300,
  /** 触碰中途存档点补的时间（秒） */
  checkpointBonus: 90,
  fireCooldown: 12,
  multiCoinWindow: 40,
  /** 钻进/钻出管道的过场帧数 */
  warp: 42,
}

/** 规则数值 */
export const RULE = {
  lives: 3,
  coinsPerLife: 50,
  maxFireballs: 2,
}

/** 自包含配色（经典蘑菇王国） */
export const C = {
  sky: '#5c94fc',
  skyTop: '#7fb2ff',
  cloud: '#ffffff',
  cloudShade: '#dce8f8',
  hill: '#00a800',
  hillDark: '#006800',
  bush: '#00a800',
  bushDark: '#006800',
  ground: '#c0500c',
  groundTop: '#e07818',
  groundLine: '#7a2c00',
  brick: '#c84c0c',
  brickLine: '#7a2c00',
  brickHi: '#e07818',
  stone: '#a8a8a8',
  stoneLine: '#606060',
  question: '#f8b800',
  questionDark: '#a06800',
  used: '#a05a20',
  usedLine: '#6b3410',
  platform: '#c08040',
  platformLine: '#7a4c18',
  pipe: '#00a800',
  pipeLight: '#58d854',
  pipeDark: '#006800',
  coin: '#fcd800',
  coinDark: '#c89000',
  flag: '#e52521',
  flagPole: '#d8d8d8',
  flagBase: '#00a800',
  castle: '#b06a28',
  castleDark: '#683810',
  castleDoor: '#201008',
  marioHat: '#e52521',
  marioShirt: '#e52521',
  marioFireShirt: '#f8f8f8',
  marioOverall: '#2c3ce0',
  marioFireOverall: '#e52521',
  skin: '#fcb090',
  shoe: '#7a3c00',
  goomba: '#a04000',
  goombaDark: '#7a2c00',
  koopaShell: '#00a800',
  koopaShellDark: '#006800',
  koopaBody: '#fcd800',
  spiny: '#e45c10',
  spinyDark: '#a03000',
  crow: '#242424',
  crowBelly: '#f0f0f0',
  beak: '#f8b800',
  lakituCloud: '#ffffff',
  lakituShell: '#00a800',
  lakituSkin: '#fcd800',
  piranhaStem: '#00a800',
  piranhaHead: '#e52521',
  piranhaMouth: '#a00000',
  piranhaTeeth: '#ffffff',
  fireball: '#ff8c00',
  fireballCore: '#ffe000',
  bonusSky: '#1a1030',
  bonusSkyTop: '#2a1a4a',
  bonusWall: '#241338',
  bonusTile: '#33204c',
  exitPipe: '#b8860b',
  exitPipeLight: '#ffd24a',
  exitPipeDark: '#6b4a00',
  mushroomCap: '#e52521',
  mushroomStem: '#fcb090',
  flowerPetal: '#e52521',
  flowerCore: '#fcd800',
  flowerStem: '#00a800',
  star: '#fcd800',
  starDark: '#c89000',
  spark: '#fff8c0',
  dust: '#e8e0d0',
  ui: '#ffffff',
}
