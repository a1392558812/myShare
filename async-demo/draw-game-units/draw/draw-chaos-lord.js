import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.003,
  WALK_SPEED: 0.1,
}

// 混沌领主颜色（黑/紫/红混沌主题）
const LORD_COLORS = {
  // 头盔/头部
  helm: '#2A2A3A',         // 头盔主色 - 深灰紫
  helmDark: '#1A1A2A',     // 头盔暗
  helmLight: '#3A3A4A',     // 头盔亮
  helmAccent: '#8A2A2A',   // 头盔装饰 - 暗红
  helmAccentLight: '#AA4A4A', // 装饰亮
  // 角
  horn: '#4A4A5A',         // 角主色
  hornDark: '#3A3A4A',     // 角暗
  hornLight: '#6A6A7A',    // 角亮
  hornTip: '#AA3333',      // 角尖 - 红
  // 眼睛 - 混沌橙红
  eye: '#FF4400',           // 眼睛 - 橙红
  eyeGlow: '#FF8844',       // 眼睛发光
  eyeInner: '#FFCC00',     // 眼睛内核 - 金黄
  // 盔甲
  armor: '#3A3A4A',        // 盔甲主色
  armorDark: '#2A2A3A',    // 盔甲暗
  armorLight: '#5A5A6A',   // 盔甲亮
  armorPlate: '#4A4A5A',   // 金属板
  armorPlateLight: '#6A6A7A', // 板亮
  // 混沌符文
  chaos: '#FF4400',         // 混沌符文 - 橙红
  chaosGlow: '#FF8844',    // 符文发光
  chaosDark: '#AA2200',    // 符文暗
  rune: '#AA00AA',          // 副符文 - 紫
  runeGlow: '#DD44DD',     // 副符文发光
  // 披风
  cape: '#1A1A2A',        // 披风主色 - 极暗
  capeDark: '#0A0A1A',    // 披风暗
  capeLight: '#2A2A3A',   // 披风亮
  capeEdge: '#AA3333',    // 披风边缘 - 红
  // 战锤
  hammer: '#5A5A5A',      // 锤柄
  hammerDark: '#3A3A3A',  // 锤柄暗
  hammerHead: '#6A6A6A',  // 锤头
  hammerHeadDark: '#4A4A4A', // 锤头暗
  hammerHeadLight: '#8A8A8A', // 锤头亮
  hammerRune: '#FF4400',   // 锤符文
  // 手
  gauntlet: '#4A4A5A',    // 护手
  gauntletDark: '#3A3A4A', // 护手暗
  gauntletLight: '#6A6A7A', // 护手亮
  // 其他
  belt: '#3A3A4A',        // 腰带
  boot: '#2A2A3A',        // 靴
  bootDark: '#1A1A2A',    // 靴暗
  bootLight: '#4A4A5A',   // 靴亮
  // 混沌能量
  energy: '#FF8844',       // 混沌能量
  energyLight: '#FFAA66',  // 能量亮
  energyDark: '#AA4400',   // 能量暗
  spark: '#FFCC00',        // 火花 - 金黄
  sparkWhite: '#FFFFFF',   // 白火花
  // 盾牌
  shield: '#3A3A4A',      // 盾
  shieldDark: '#2A2A3A',  // 盾暗
  shieldLight: '#5A5A6A', // 盾亮
  shieldChaos: '#FF4400', // 盾混沌符文
  highlight: '#FFFFFF',      // 高光
}

// 混沌领主高精度头像（16x16网格，聚焦头盔头部特写）
const LORD_AVATAR = [
  // ===== 头顶角（顶部）=====
  [5, 0, LORD_COLORS.hornDark], [6, 0, LORD_COLORS.horn], [7, 0, LORD_COLORS.horn], [8, 0, LORD_COLORS.hornDark],
  [4, 1, LORD_COLORS.horn], [5, 1, LORD_COLORS.hornLight], [6, 1, LORD_COLORS.hornTip], [7, 1, LORD_COLORS.hornTip], [8, 1, LORD_COLORS.hornLight], [9, 1, LORD_COLORS.horn],
  [3, 2, LORD_COLORS.hornDark], [4, 2, LORD_COLORS.hornLight], [5, 2, LORD_COLORS.horn], [6, 2, LORD_COLORS.hornTip], [7, 2, LORD_COLORS.hornTip], [8, 2, LORD_COLORS.horn], [9, 2, LORD_COLORS.hornLight], [10, 2, LORD_COLORS.hornDark],

  // ===== 头盔主体第一层 =====
  [2, 3, LORD_COLORS.helmDark], [3, 3, LORD_COLORS.helm], [4, 3, LORD_COLORS.helmLight], [5, 3, LORD_COLORS.helm], [6, 3, LORD_COLORS.helmAccent], [7, 3, LORD_COLORS.helmAccent], [8, 3, LORD_COLORS.helmLight], [9, 3, LORD_COLORS.helm], [10, 3, LORD_COLORS.helmDark],
  [2, 4, LORD_COLORS.helmDark], [3, 4, LORD_COLORS.helm], [4, 4, LORD_COLORS.helmLight], [5, 4, LORD_COLORS.helm], [6, 4, LORD_COLORS.helmAccent], [7, 4, LORD_COLORS.helmAccent], [8, 4, LORD_COLORS.helmLight], [9, 4, LORD_COLORS.helm], [10, 4, LORD_COLORS.helmDark],

  // ===== 眼睛行（混沌橙红）=====
  [2, 5, LORD_COLORS.helmDark], [3, 5, LORD_COLORS.helm], [4, 5, LORD_COLORS.eye], [5, 5, LORD_COLORS.eyeGlow], [6, 5, LORD_COLORS.eye], [7, 5, LORD_COLORS.eye], [8, 5, LORD_COLORS.eyeGlow], [9, 5, LORD_COLORS.eye], [10, 5, LORD_COLORS.helm], [11, 5, LORD_COLORS.helmDark],
  // 眼睛高光
  [4, 4, LORD_COLORS.highlight], [5, 4, LORD_COLORS.highlight], [8, 4, LORD_COLORS.highlight], [9, 4, LORD_COLORS.highlight],
  [4, 5, LORD_COLORS.highlight], [8, 5, LORD_COLORS.highlight],
  // 眼睛内核发光
  [4, 5, LORD_COLORS.eyeInner], [5, 5, LORD_COLORS.eyeInner], [8, 5, LORD_COLORS.eyeInner], [9, 5, LORD_COLORS.eyeInner],

  // ===== 眼睛下方细节 =====
  [2, 6, LORD_COLORS.helmDark], [3, 6, LORD_COLORS.helm], [4, 6, LORD_COLORS.eyeGlow], [5, 6, LORD_COLORS.eyeInner], [6, 6, LORD_COLORS.eyeInner], [7, 6, LORD_COLORS.eyeInner], [8, 6, LORD_COLORS.eyeGlow], [9, 6, LORD_COLORS.helm], [10, 6, LORD_COLORS.helmDark],
  [3, 7, LORD_COLORS.helmDark], [4, 7, LORD_COLORS.helm], [5, 7, LORD_COLORS.eyeGlow], [6, 7, LORD_COLORS.eyeGlow], [7, 7, LORD_COLORS.eyeGlow], [8, 7, LORD_COLORS.eyeGlow], [9, 7, LORD_COLORS.helm], [10, 7, LORD_COLORS.helmDark],

  // ===== 头盔底部边缘 =====
  [3, 8, LORD_COLORS.helm], [4, 8, LORD_COLORS.helmDark], [5, 8, LORD_COLORS.helm], [6, 8, LORD_COLORS.helmAccent], [7, 8, LORD_COLORS.helmAccent], [8, 8, LORD_COLORS.helm], [9, 8, LORD_COLORS.helmDark], [10, 8, LORD_COLORS.helm],
  [4, 9, LORD_COLORS.helmDark], [5, 9, LORD_COLORS.helm], [6, 9, LORD_COLORS.helmAccent], [7, 9, LORD_COLORS.helmAccent], [8, 9, LORD_COLORS.helm], [9, 9, LORD_COLORS.helmDark],

  // ===== 肩甲/颈部 =====
  [2, 10, LORD_COLORS.armorDark], [3, 10, LORD_COLORS.armor], [4, 10, LORD_COLORS.armorPlateLight], [5, 10, LORD_COLORS.armorPlate], [6, 10, LORD_COLORS.chaos], [7, 10, LORD_COLORS.chaos], [8, 10, LORD_COLORS.armorPlate], [9, 10, LORD_COLORS.armorPlateLight], [10, 10, LORD_COLORS.armor], [11, 10, LORD_COLORS.armorDark],
  [2, 11, LORD_COLORS.armorDark], [3, 11, LORD_COLORS.armorPlate], [4, 11, LORD_COLORS.armorPlateLight], [5, 11, LORD_COLORS.armorPlate], [6, 11, LORD_COLORS.armorPlateLight], [7, 11, LORD_COLORS.armorPlateLight], [8, 11, LORD_COLORS.armorPlate], [9, 11, LORD_COLORS.armorPlateLight], [10, 11, LORD_COLORS.armorPlate], [11, 11, LORD_COLORS.armorDark],

  // ===== 胸甲领口 =====
  [2, 12, LORD_COLORS.armorDark], [3, 12, LORD_COLORS.armor], [4, 12, LORD_COLORS.armorPlate], [5, 12, LORD_COLORS.chaosGlow], [6, 12, LORD_COLORS.armorPlateLight], [7, 12, LORD_COLORS.armorPlateLight], [8, 12, LORD_COLORS.chaosGlow], [9, 12, LORD_COLORS.armorPlate], [10, 12, LORD_COLORS.armor], [11, 12, LORD_COLORS.armorDark],

  // ===== 混沌符文装饰 =====
  [5, 10, LORD_COLORS.chaosGlow], [6, 10, LORD_COLORS.spark],
  [8, 10, LORD_COLORS.chaosGlow], [9, 10, LORD_COLORS.spark],
  [5, 12, LORD_COLORS.runeGlow], [8, 12, LORD_COLORS.runeGlow],
  [6, 11, LORD_COLORS.chaos], [7, 11, LORD_COLORS.chaos],

  // ===== 头盔下巴/护面 =====
  [4, 13, LORD_COLORS.helmDark], [5, 13, LORD_COLORS.helm], [6, 13, LORD_COLORS.helmAccent], [7, 13, LORD_COLORS.helmAccent], [8, 13, LORD_COLORS.helm], [9, 13, LORD_COLORS.helmDark],
  [4, 14, LORD_COLORS.helm], [5, 14, LORD_COLORS.helmLight], [6, 14, LORD_COLORS.helm], [7, 14, LORD_COLORS.helm], [8, 14, LORD_COLORS.helmLight], [9, 14, LORD_COLORS.helm],
  [5, 15, LORD_COLORS.helmDark], [6, 15, LORD_COLORS.helm], [7, 15, LORD_COLORS.helm], [8, 15, LORD_COLORS.helmDark],
]

// 向下面朝 - 正面
const LORD_FACE_DOWN = [
  // ===== 头盔顶部 + 角 =====
  [5, 0, LORD_COLORS.hornDark], [6, 0, LORD_COLORS.horn], [7, 0, LORD_COLORS.horn], [8, 0, LORD_COLORS.hornDark],
  [4, 1, LORD_COLORS.horn], [5, 1, LORD_COLORS.hornLight], [6, 1, LORD_COLORS.hornTip], [7, 1, LORD_COLORS.hornTip], [8, 1, LORD_COLORS.hornLight], [9, 1, LORD_COLORS.horn],
  [3, 2, LORD_COLORS.hornDark], [4, 2, LORD_COLORS.hornLight], [5, 2, LORD_COLORS.horn], [6, 2, LORD_COLORS.hornTip], [7, 2, LORD_COLORS.hornTip], [8, 2, LORD_COLORS.horn], [9, 2, LORD_COLORS.hornLight], [10, 2, LORD_COLORS.hornDark],

  // ===== 头盔主体 =====
  [3, 3, LORD_COLORS.helmDark], [4, 3, LORD_COLORS.helm], [5, 3, LORD_COLORS.helmLight], [6, 3, LORD_COLORS.helmAccent], [7, 3, LORD_COLORS.helmAccent], [8, 3, LORD_COLORS.helmLight], [9, 3, LORD_COLORS.helm], [10, 3, LORD_COLORS.helmDark],
  [3, 4, LORD_COLORS.helmDark], [4, 4, LORD_COLORS.helm], [5, 4, LORD_COLORS.eye], [6, 4, LORD_COLORS.eyeGlow], [7, 4, LORD_COLORS.eyeGlow], [8, 4, LORD_COLORS.eye], [9, 4, LORD_COLORS.helm], [10, 4, LORD_COLORS.helmDark],
  [3, 5, LORD_COLORS.helmDark], [4, 5, LORD_COLORS.helm], [5, 5, LORD_COLORS.eyeGlow], [6, 5, LORD_COLORS.eyeInner], [7, 5, LORD_COLORS.eyeInner], [8, 5, LORD_COLORS.eyeGlow], [9, 5, LORD_COLORS.helm], [10, 5, LORD_COLORS.helmDark],
  [4, 6, LORD_COLORS.helm], [5, 6, LORD_COLORS.helmDark], [6, 6, LORD_COLORS.helm], [7, 6, LORD_COLORS.helm], [8, 6, LORD_COLORS.helmDark], [9, 6, LORD_COLORS.helm],
  [4, 7, LORD_COLORS.helmDark], [5, 7, LORD_COLORS.helm], [6, 7, LORD_COLORS.helmAccent], [7, 7, LORD_COLORS.helmAccent], [8, 7, LORD_COLORS.helm], [9, 7, LORD_COLORS.helmDark],

  // ===== 肩甲 + 颈 =====
  [2, 8, LORD_COLORS.armorDark], [3, 8, LORD_COLORS.armor], [4, 8, LORD_COLORS.armorPlateLight], [5, 8, LORD_COLORS.armorPlate], [6, 8, LORD_COLORS.chaos], [7, 8, LORD_COLORS.chaos], [8, 8, LORD_COLORS.armorPlate], [9, 8, LORD_COLORS.armorPlateLight], [10, 8, LORD_COLORS.armor], [11, 8, LORD_COLORS.armorDark],
  [2, 9, LORD_COLORS.armorDark], [3, 9, LORD_COLORS.armorPlate], [4, 9, LORD_COLORS.armorPlateLight], [5, 9, LORD_COLORS.armorPlate], [6, 9, LORD_COLORS.armorPlateLight], [7, 9, LORD_COLORS.armorPlateLight], [8, 9, LORD_COLORS.armorPlate], [9, 9, LORD_COLORS.armorPlateLight], [10, 9, LORD_COLORS.armorPlate], [11, 9, LORD_COLORS.armorDark],

  // ===== 胸甲 =====
  [2, 10, LORD_COLORS.armorDark], [3, 10, LORD_COLORS.armor], [4, 10, LORD_COLORS.armorPlate], [5, 10, LORD_COLORS.chaosGlow], [6, 10, LORD_COLORS.armorPlateLight], [7, 10, LORD_COLORS.armorPlateLight], [8, 10, LORD_COLORS.chaosGlow], [9, 10, LORD_COLORS.armorPlate], [10, 10, LORD_COLORS.armor], [11, 10, LORD_COLORS.armorDark],
  [2, 11, LORD_COLORS.armorDark], [3, 11, LORD_COLORS.armor], [4, 11, LORD_COLORS.armorPlateLight], [5, 11, LORD_COLORS.armorPlate], [6, 11, LORD_COLORS.chaos], [7, 11, LORD_COLORS.chaos], [8, 11, LORD_COLORS.armorPlate], [9, 11, LORD_COLORS.armorPlateLight], [10, 11, LORD_COLORS.armor], [11, 11, LORD_COLORS.armorDark],

  // ===== 腰带 =====
  [3, 12, LORD_COLORS.belt], [4, 12, LORD_COLORS.armorPlate], [5, 12, LORD_COLORS.armorPlateLight], [6, 12, LORD_COLORS.chaos], [7, 12, LORD_COLORS.chaos], [8, 12, LORD_COLORS.armorPlateLight], [9, 12, LORD_COLORS.armorPlate], [10, 12, LORD_COLORS.belt],

  // ===== 腿甲 =====
  [4, 13, LORD_COLORS.armorDark], [5, 13, LORD_COLORS.armorPlate], [6, 13, LORD_COLORS.armorPlateLight], [7, 13, LORD_COLORS.armorPlateLight], [8, 13, LORD_COLORS.armorPlate], [9, 13, LORD_COLORS.armorDark],
  [4, 14, LORD_COLORS.boot], [5, 14, LORD_COLORS.bootLight], [6, 14, LORD_COLORS.boot], [7, 14, LORD_COLORS.boot], [8, 14, LORD_COLORS.bootLight], [9, 14, LORD_COLORS.boot],
  [4, 15, LORD_COLORS.bootDark], [5, 15, LORD_COLORS.bootLight], [6, 15, LORD_COLORS.boot], [7, 15, LORD_COLORS.boot], [8, 15, LORD_COLORS.bootLight], [9, 15, LORD_COLORS.bootDark],

  // ===== 左手（持战锤）=====
  [0, 9, LORD_COLORS.gauntlet], [1, 9, LORD_COLORS.gauntletDark],
  [0, 10, LORD_COLORS.gauntletLight], [1, 10, LORD_COLORS.gauntlet],
  [0, 11, LORD_COLORS.gauntlet], [1, 11, LORD_COLORS.gauntletDark],
  [0, 12, LORD_COLORS.hammerDark],
  [0, 13, LORD_COLORS.hammer],
  [0, 14, LORD_COLORS.hammerDark],
  [0, 15, LORD_COLORS.hammerHeadDark],
  [1, 15, LORD_COLORS.hammerHead], [2, 15, LORD_COLORS.hammerHeadLight],
  [0, 16, LORD_COLORS.hammerHead], [2, 16, LORD_COLORS.hammerRune],
  [1, 17, LORD_COLORS.hammerHeadLight],

  // ===== 右手（持盾）=====
  [12, 9, LORD_COLORS.gauntletDark], [13, 9, LORD_COLORS.gauntlet],
  [12, 10, LORD_COLORS.gauntlet], [13, 10, LORD_COLORS.gauntletLight],
  [12, 11, LORD_COLORS.gauntletDark], [13, 11, LORD_COLORS.gauntlet],
  [13, 12, LORD_COLORS.shieldDark],
  [13, 13, LORD_COLORS.shield],
  [13, 14, LORD_COLORS.shieldLight],
  [13, 15, LORD_COLORS.shieldChaos],

  // ===== 混沌能量 =====
  [5, 15, LORD_COLORS.energy], [8, 15, LORD_COLORS.energy],
  [6, 15, LORD_COLORS.energyLight], [7, 15, LORD_COLORS.energyLight],
]

// 向上面朝 - 背面
const LORD_FACE_UP = [
  // ===== 头盔顶部 + 角 =====
  [5, 0, LORD_COLORS.hornDark], [6, 0, LORD_COLORS.horn], [7, 0, LORD_COLORS.horn], [8, 0, LORD_COLORS.hornDark],
  [4, 1, LORD_COLORS.horn], [5, 1, LORD_COLORS.hornLight], [6, 1, LORD_COLORS.hornTip], [7, 1, LORD_COLORS.hornTip], [8, 1, LORD_COLORS.hornLight], [9, 1, LORD_COLORS.horn],
  [3, 2, LORD_COLORS.hornDark], [4, 2, LORD_COLORS.hornLight], [5, 2, LORD_COLORS.horn], [6, 2, LORD_COLORS.hornTip], [7, 2, LORD_COLORS.hornTip], [8, 2, LORD_COLORS.horn], [9, 2, LORD_COLORS.hornLight], [10, 2, LORD_COLORS.hornDark],

  // ===== 头盔背面 =====
  [3, 3, LORD_COLORS.helmDark], [4, 3, LORD_COLORS.helm], [5, 3, LORD_COLORS.helmLight], [6, 3, LORD_COLORS.helm], [7, 3, LORD_COLORS.helm], [8, 3, LORD_COLORS.helmLight], [9, 3, LORD_COLORS.helm], [10, 3, LORD_COLORS.helmDark],
  [3, 4, LORD_COLORS.helmDark], [4, 4, LORD_COLORS.helm], [5, 4, LORD_COLORS.helmLight], [6, 4, LORD_COLORS.helmAccent], [7, 4, LORD_COLORS.helmAccent], [8, 4, LORD_COLORS.helmLight], [9, 4, LORD_COLORS.helm], [10, 4, LORD_COLORS.helmDark],
  [4, 5, LORD_COLORS.helm], [5, 5, LORD_COLORS.helmDark], [6, 5, LORD_COLORS.helm], [7, 5, LORD_COLORS.helm], [8, 5, LORD_COLORS.helmDark], [9, 5, LORD_COLORS.helm],
  [4, 6, LORD_COLORS.helmDark], [5, 6, LORD_COLORS.helm], [6, 6, LORD_COLORS.helmAccent], [7, 6, LORD_COLORS.helmAccent], [8, 6, LORD_COLORS.helm], [9, 6, LORD_COLORS.helmDark],

  // ===== 披风 =====
  [1, 7, LORD_COLORS.capeDark], [2, 7, LORD_COLORS.cape], [3, 7, LORD_COLORS.capeLight], [4, 7, LORD_COLORS.capeEdge], [5, 7, LORD_COLORS.cape], [6, 7, LORD_COLORS.chaos], [7, 7, LORD_COLORS.chaos], [8, 7, LORD_COLORS.cape], [9, 7, LORD_COLORS.capeEdge], [10, 7, LORD_COLORS.capeLight], [11, 7, LORD_COLORS.cape], [12, 7, LORD_COLORS.capeDark],
  [1, 8, LORD_COLORS.capeDark], [2, 8, LORD_COLORS.cape], [3, 8, LORD_COLORS.capeLight], [4, 8, LORD_COLORS.cape], [5, 8, LORD_COLORS.capeEdge], [6, 8, LORD_COLORS.chaosGlow], [7, 8, LORD_COLORS.chaosGlow], [8, 8, LORD_COLORS.capeEdge], [9, 8, LORD_COLORS.cape], [10, 8, LORD_COLORS.capeLight], [11, 8, LORD_COLORS.cape], [12, 8, LORD_COLORS.capeDark],
  [2, 9, LORD_COLORS.capeDark], [3, 9, LORD_COLORS.cape], [4, 9, LORD_COLORS.capeLight], [5, 9, LORD_COLORS.cape], [6, 9, LORD_COLORS.cape], [7, 9, LORD_COLORS.cape], [8, 9, LORD_COLORS.cape], [9, 9, LORD_COLORS.capeLight], [10, 9, LORD_COLORS.cape], [11, 9, LORD_COLORS.capeDark],
  [2, 10, LORD_COLORS.capeDark], [3, 10, LORD_COLORS.cape], [4, 10, LORD_COLORS.capeLight], [5, 10, LORD_COLORS.cape], [6, 10, LORD_COLORS.rune], [7, 10, LORD_COLORS.rune], [8, 10, LORD_COLORS.cape], [9, 10, LORD_COLORS.capeLight], [10, 10, LORD_COLORS.cape], [11, 10, LORD_COLORS.capeDark],
  [3, 11, LORD_COLORS.capeDark], [4, 11, LORD_COLORS.cape], [5, 11, LORD_COLORS.capeLight], [6, 11, LORD_COLORS.cape], [7, 11, LORD_COLORS.cape], [8, 11, LORD_COLORS.capeLight], [9, 11, LORD_COLORS.cape], [10, 11, LORD_COLORS.capeDark],

  // ===== 背甲 + 腿 =====
  [3, 12, LORD_COLORS.armorDark], [4, 12, LORD_COLORS.armorPlate], [5, 12, LORD_COLORS.armorPlateLight], [6, 12, LORD_COLORS.chaos], [7, 12, LORD_COLORS.chaos], [8, 12, LORD_COLORS.armorPlateLight], [9, 12, LORD_COLORS.armorPlate], [10, 12, LORD_COLORS.armorDark],
  [4, 13, LORD_COLORS.armorDark], [5, 13, LORD_COLORS.armorPlate], [6, 13, LORD_COLORS.armorPlateLight], [7, 13, LORD_COLORS.armorPlateLight], [8, 13, LORD_COLORS.armorPlate], [9, 13, LORD_COLORS.armorDark],
  [4, 14, LORD_COLORS.boot], [5, 14, LORD_COLORS.bootLight], [6, 14, LORD_COLORS.boot], [7, 14, LORD_COLORS.boot], [8, 14, LORD_COLORS.bootLight], [9, 14, LORD_COLORS.boot],
  [4, 15, LORD_COLORS.bootDark], [5, 15, LORD_COLORS.bootLight], [6, 15, LORD_COLORS.boot], [7, 15, LORD_COLORS.boot], [8, 15, LORD_COLORS.bootLight], [9, 15, LORD_COLORS.bootDark],

  // ===== 武器（战锤背在身后）=====
  [13, 8, LORD_COLORS.hammerHead],
  [13, 9, LORD_COLORS.hammerRune],
  [13, 10, LORD_COLORS.hammerHeadLight],
  [13, 11, LORD_COLORS.hammerDark],
  [13, 12, LORD_COLORS.hammer],
  [13, 13, LORD_COLORS.hammerDark],

  // ===== 混沌能量 =====
  [5, 15, LORD_COLORS.energy], [8, 15, LORD_COLORS.energy],
]

// 向左面朝 - 侧面
const LORD_FACE_LEFT = [
  // ===== 头盔侧面 + 角 =====
  [5, 0, LORD_COLORS.horn], [6, 0, LORD_COLORS.hornDark],
  [4, 1, LORD_COLORS.hornLight], [5, 1, LORD_COLORS.horn], [6, 1, LORD_COLORS.hornTip],
  [4, 2, LORD_COLORS.hornDark], [5, 2, LORD_COLORS.hornLight], [6, 2, LORD_COLORS.hornTip],
  [4, 3, LORD_COLORS.helmDark], [5, 3, LORD_COLORS.helm], [6, 3, LORD_COLORS.helmLight], [7, 3, LORD_COLORS.helmDark],

  // ===== 头盔侧面 =====
  [4, 4, LORD_COLORS.helmDark], [5, 4, LORD_COLORS.eye], [6, 4, LORD_COLORS.eyeGlow], [7, 4, LORD_COLORS.helm],
  [4, 5, LORD_COLORS.helmDark], [5, 5, LORD_COLORS.eyeGlow], [6, 5, LORD_COLORS.eyeInner], [7, 5, LORD_COLORS.helmDark],
  [4, 6, LORD_COLORS.helm], [5, 6, LORD_COLORS.helmDark], [6, 6, LORD_COLORS.helm], [7, 6, LORD_COLORS.helmDark],

  // ===== 肩甲 =====
  [3, 7, LORD_COLORS.armorDark], [4, 7, LORD_COLORS.armorPlateLight], [5, 7, LORD_COLORS.armorPlate], [6, 7, LORD_COLORS.chaos], [7, 7, LORD_COLORS.armorPlate], [8, 7, LORD_COLORS.armorDark],
  [2, 8, LORD_COLORS.armorDark], [3, 8, LORD_COLORS.armor], [4, 8, LORD_COLORS.armorPlateLight], [5, 8, LORD_COLORS.armorPlate], [6, 8, LORD_COLORS.armorPlateLight], [7, 8, LORD_COLORS.chaosGlow], [8, 8, LORD_COLORS.armorPlate], [9, 8, LORD_COLORS.armorDark],

  // ===== 胸甲侧面 =====
  [2, 9, LORD_COLORS.armorDark], [3, 9, LORD_COLORS.armorPlate], [4, 9, LORD_COLORS.armorPlateLight], [5, 9, LORD_COLORS.armorPlate], [6, 9, LORD_COLORS.chaos], [7, 9, LORD_COLORS.armorPlateLight], [8, 9, LORD_COLORS.armorPlate], [9, 9, LORD_COLORS.armorDark],
  [2, 10, LORD_COLORS.armorDark], [3, 10, LORD_COLORS.armor], [4, 10, LORD_COLORS.armorPlateLight], [5, 10, LORD_COLORS.armorPlate], [6, 10, LORD_COLORS.chaosGlow], [7, 10, LORD_COLORS.armorPlate], [8, 10, LORD_COLORS.armorPlateLight], [9, 10, LORD_COLORS.armor], [10, 10, LORD_COLORS.armorDark],

  // ===== 腰带 =====
  [3, 11, LORD_COLORS.belt], [4, 11, LORD_COLORS.armorPlate], [5, 11, LORD_COLORS.chaos], [6, 11, LORD_COLORS.armorPlateLight], [7, 11, LORD_COLORS.armorPlate], [8, 11, LORD_COLORS.belt], [9, 11, LORD_COLORS.belt],

  // ===== 腿甲 =====
  [4, 12, LORD_COLORS.armorDark], [5, 12, LORD_COLORS.armorPlate], [6, 12, LORD_COLORS.armorPlateLight], [7, 12, LORD_COLORS.armorPlate], [8, 12, LORD_COLORS.armorDark],
  [4, 13, LORD_COLORS.boot], [5, 13, LORD_COLORS.bootLight], [6, 13, LORD_COLORS.boot], [7, 13, LORD_COLORS.bootLight], [8, 13, LORD_COLORS.boot],
  [4, 14, LORD_COLORS.bootDark], [5, 14, LORD_COLORS.boot], [6, 14, LORD_COLORS.boot], [7, 14, LORD_COLORS.boot], [8, 14, LORD_COLORS.bootDark],
  [4, 15, LORD_COLORS.boot], [5, 15, LORD_COLORS.bootLight], [6, 15, LORD_COLORS.boot], [7, 15, LORD_COLORS.bootLight], [8, 15, LORD_COLORS.boot],

  // ===== 左手（前伸持战锤）=====
  [0, 8, LORD_COLORS.gauntlet],
  [0, 9, LORD_COLORS.gauntletLight], [1, 9, LORD_COLORS.hammerDark],
  [0, 10, LORD_COLORS.gauntlet], [1, 10, LORD_COLORS.hammer],
  [0, 11, LORD_COLORS.gauntletDark], [1, 11, LORD_COLORS.hammerDark],
  [1, 12, LORD_COLORS.hammer], [2, 12, LORD_COLORS.hammerDark],
  [1, 13, LORD_COLORS.hammerDark], [2, 13, LORD_COLORS.hammerHeadDark],
  [2, 14, LORD_COLORS.hammerHead], [3, 14, LORD_COLORS.hammerRune],
  [2, 15, LORD_COLORS.hammerHeadLight],

  // ===== 右手（盾在身后）=====
  [9, 9, LORD_COLORS.gauntlet], [10, 9, LORD_COLORS.gauntletDark],
  [9, 10, LORD_COLORS.gauntletLight], [10, 10, LORD_COLORS.gauntlet],
  [10, 11, LORD_COLORS.shieldDark],
  [10, 12, LORD_COLORS.shield],
  [10, 13, LORD_COLORS.shieldLight],
  [10, 14, LORD_COLORS.shieldChaos],

  // ===== 混沌能量 =====
  [5, 15, LORD_COLORS.energy],
  [6, 15, LORD_COLORS.energyLight],
]

// 向右面朝 - 侧面镜像
const LORD_FACE_RIGHT = [
  // ===== 头盔侧面 + 角 =====
  [5, 0, LORD_COLORS.hornDark], [6, 0, LORD_COLORS.horn],
  [5, 1, LORD_COLORS.hornTip], [6, 1, LORD_COLORS.horn], [7, 1, LORD_COLORS.hornLight],
  [5, 2, LORD_COLORS.hornTip], [6, 2, LORD_COLORS.hornLight], [7, 2, LORD_COLORS.hornDark],
  [4, 3, LORD_COLORS.helmDark], [5, 3, LORD_COLORS.helmLight], [6, 3, LORD_COLORS.helm], [7, 3, LORD_COLORS.helmDark],

  // ===== 头盔侧面 =====
  [4, 4, LORD_COLORS.helm], [5, 4, LORD_COLORS.eyeGlow], [6, 4, LORD_COLORS.eye], [7, 4, LORD_COLORS.helmDark],
  [4, 5, LORD_COLORS.helmDark], [5, 5, LORD_COLORS.eyeInner], [6, 5, LORD_COLORS.eyeGlow], [7, 5, LORD_COLORS.helmDark],
  [4, 6, LORD_COLORS.helmDark], [5, 6, LORD_COLORS.helm], [6, 6, LORD_COLORS.helmDark], [7, 6, LORD_COLORS.helm],

  // ===== 肩甲 =====
  [4, 7, LORD_COLORS.armorDark], [5, 7, LORD_COLORS.armorPlate], [6, 7, LORD_COLORS.chaos], [7, 7, LORD_COLORS.armorPlateLight], [8, 7, LORD_COLORS.armorPlate], [9, 7, LORD_COLORS.armorDark],
  [3, 8, LORD_COLORS.armorDark], [4, 8, LORD_COLORS.armorPlate], [5, 8, LORD_COLORS.chaosGlow], [6, 8, LORD_COLORS.armorPlateLight], [7, 8, LORD_COLORS.armorPlate], [8, 8, LORD_COLORS.armorPlateLight], [9, 8, LORD_COLORS.armor], [10, 8, LORD_COLORS.armorDark],

  // ===== 胸甲侧面 =====
  [3, 9, LORD_COLORS.armorDark], [4, 9, LORD_COLORS.armorPlate], [5, 9, LORD_COLORS.armorPlateLight], [6, 9, LORD_COLORS.chaos], [7, 9, LORD_COLORS.armorPlate], [8, 9, LORD_COLORS.armorPlateLight], [9, 9, LORD_COLORS.armorPlate], [10, 9, LORD_COLORS.armorDark],
  [3, 10, LORD_COLORS.armorDark], [4, 10, LORD_COLORS.armorPlateLight], [5, 10, LORD_COLORS.chaosGlow], [6, 10, LORD_COLORS.armorPlate], [7, 10, LORD_COLORS.armorPlateLight], [8, 10, LORD_COLORS.armorPlate], [9, 10, LORD_COLORS.armor], [10, 10, LORD_COLORS.armorDark],

  // ===== 腰带 =====
  [4, 11, LORD_COLORS.belt], [5, 11, LORD_COLORS.belt], [6, 11, LORD_COLORS.armorPlateLight], [7, 11, LORD_COLORS.chaos], [8, 11, LORD_COLORS.armorPlate], [9, 11, LORD_COLORS.belt],

  // ===== 腿甲 =====
  [4, 12, LORD_COLORS.armorDark], [5, 12, LORD_COLORS.armorPlate], [6, 12, LORD_COLORS.armorPlateLight], [7, 12, LORD_COLORS.armorPlate], [8, 12, LORD_COLORS.armorDark],
  [4, 13, LORD_COLORS.boot], [5, 13, LORD_COLORS.bootLight], [6, 13, LORD_COLORS.boot], [7, 13, LORD_COLORS.bootLight], [8, 13, LORD_COLORS.boot],
  [4, 14, LORD_COLORS.bootDark], [5, 14, LORD_COLORS.boot], [6, 14, LORD_COLORS.boot], [7, 14, LORD_COLORS.boot], [8, 14, LORD_COLORS.bootDark],
  [4, 15, LORD_COLORS.boot], [5, 15, LORD_COLORS.bootLight], [6, 15, LORD_COLORS.boot], [7, 15, LORD_COLORS.bootLight], [8, 15, LORD_COLORS.boot],

  // ===== 左手（盾在身后）=====
  [3, 9, LORD_COLORS.gauntletDark], [4, 9, LORD_COLORS.gauntlet],
  [3, 10, LORD_COLORS.gauntlet], [4, 10, LORD_COLORS.gauntletLight],
  [3, 11, LORD_COLORS.shieldChaos],
  [3, 12, LORD_COLORS.shieldLight],
  [3, 13, LORD_COLORS.shield],
  [3, 14, LORD_COLORS.shieldDark],

  // ===== 右手（前伸持战锤）=====
  [11, 8, LORD_COLORS.gauntlet],
  [12, 9, LORD_COLORS.gauntletLight], [13, 9, LORD_COLORS.hammerDark],
  [12, 10, LORD_COLORS.gauntlet], [13, 10, LORD_COLORS.hammer],
  [12, 11, LORD_COLORS.gauntletDark], [13, 11, LORD_COLORS.hammerDark],
  [13, 12, LORD_COLORS.hammer], [14, 12, LORD_COLORS.hammerDark],
  [14, 13, LORD_COLORS.hammerHeadDark], [15, 13, LORD_COLORS.hammer],
  [14, 14, LORD_COLORS.hammerRune], [15, 14, LORD_COLORS.hammerHead],
  [15, 15, LORD_COLORS.hammerHeadLight],

  // ===== 混沌能量 =====
  [7, 15, LORD_COLORS.energyLight],
  [8, 15, LORD_COLORS.energy],
]

// 待机动画帧（眼睛发光 + 混沌符文闪烁）
const LORD_IDLE_FRAMES = [
  // 帧0 - 暗
  [
    { pixels: [
      [6, 4, LORD_COLORS.eye], [7, 4, LORD_COLORS.eye],
      [6, 8, LORD_COLORS.chaos], [7, 8, LORD_COLORS.chaos],
      [6, 12, LORD_COLORS.chaos], [7, 12, LORD_COLORS.chaos],
      [5, 15, LORD_COLORS.energy], [8, 15, LORD_COLORS.energy],
    ] }
  ],
  // 帧1 - 亮（眼睛发光 + 符文强发光 + 能量爆发）
  [
    { pixels: [
      [6, 4, LORD_COLORS.eyeGlow], [7, 4, LORD_COLORS.eyeGlow],
      [6, 8, LORD_COLORS.chaosGlow], [7, 8, LORD_COLORS.chaosGlow],
      [6, 12, LORD_COLORS.chaosGlow], [7, 12, LORD_COLORS.chaosGlow],
      [5, 15, LORD_COLORS.energyLight], [8, 15, LORD_COLORS.energyLight],
      [6, 15, LORD_COLORS.spark], [7, 15, LORD_COLORS.spark],
    ] }
  ],
]

// 行走动画帧（步伐）
const LORD_WALK_FRAMES = [
  // 帧0 - 左脚前
  [
    { pixels: [
      [4, 15, LORD_COLORS.bootDark], [5, 15, LORD_COLORS.boot], [6, 15, LORD_COLORS.boot], [7, 15, LORD_COLORS.bootDark], [8, 15, LORD_COLORS.boot], [9, 15, LORD_COLORS.bootDark],
    ] }
  ],
  // 帧1 - 中间
  [
    { pixels: [
      [4, 15, LORD_COLORS.boot], [5, 15, LORD_COLORS.bootDark], [6, 15, LORD_COLORS.boot], [7, 15, LORD_COLORS.boot], [8, 15, LORD_COLORS.bootDark], [9, 15, LORD_COLORS.boot],
    ] }
  ],
  // 帧2 - 右脚前
  [
    { pixels: [
      [4, 15, LORD_COLORS.boot], [5, 15, LORD_COLORS.bootDark], [6, 15, LORD_COLORS.bootDark], [7, 15, LORD_COLORS.boot], [8, 15, LORD_COLORS.boot], [9, 15, LORD_COLORS.bootDark],
    ] }
  ],
]

export const drawChaosLord = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: LORD_FACE_DOWN,
  up: LORD_FACE_UP,
  left: LORD_FACE_LEFT,
  right: LORD_FACE_RIGHT,
  walk: LORD_WALK_FRAMES,
  idle: LORD_IDLE_FRAMES,
})

export const drawChaosLordAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, LORD_AVATAR)
