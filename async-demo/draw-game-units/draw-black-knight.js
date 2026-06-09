/**
 * 绘制暗黑骑士怪物 - 被黑魔法侵蚀的王国骑士团长
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit 暗黑骑士位置和状态
 * @param {Number} currentUnit.x 暗黑骑士x坐标
 * @param {Number} currentUnit.y 暗黑骑士y坐标
 * @param {Number} currentUnit.size 暗黑骑士大小(px)
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

export const config = {
  IDLE_SPEED: 0.003,
  WALK_SPEED: 0.1,
}

// 暗黑骑士颜色（骑士盔甲 + 黑魔法侵蚀）
const KNIGHT_COLORS = {
  // 头盔
  helm: '#2A2A3A',         // 头盔主色 - 暗灰
  helmDark: '#1A1A2A',     // 头盔暗
  helmLight: '#3A3A4A',     // 头盔亮
  helmCrack: '#0A0A1A',    // 头盔裂缝
  // 眼睛 - 被侵蚀的红光
  eye: '#FF2222',           // 眼睛 - 血红
  eyeGlow: '#FF4444',       // 眼睛发光
  eyeInner: '#FF8888',     // 眼睛内核
  // 盔甲
  armor: '#3A3A4A',        // 盔甲主色
  armorDark: '#2A2A3A',    // 盔甲暗
  armorLight: '#4A4A5A',   // 盔甲亮
  armorPlate: '#4A4A5A',   // 金属板
  armorPlateLight: '#5A5A6A', // 板亮
  armorCrack: '#1A1A2A',    // 侵蚀裂缝
  // 黑魔法符文
  corruption: '#6600CC',     // 侵蚀 - 紫黑
  corruptionGlow: '#9933FF', // 侵蚀发光
  corruptionDark: '#440099', // 侵蚀暗
  corruptionLight: '#BB66FF', // 侵蚀亮
  rune: '#8800FF',           // 符文
  runeGlow: '#AA44FF',       // 符文发光
  runeDark: '#5500AA',      // 符文暗
  // 披风
  cape: '#1A0A1A',        // 披风主色 - 极暗黑紫
  capeDark: '#0A000A',    // 披风暗
  capeLight: '#2A1A2A',   // 披风亮
  capeCorrupt: '#330066',  // 侵蚀披风
  // 剑
  sword: '#6A6A7A',      // 剑刃 - 银灰
  swordDark: '#4A4A5A',  // 剑刃暗
  swordLight: '#8A8A9A', // 剑刃亮
  swordCorrupt: '#9933FF', // 剑上侵蚀符文
  swordHandle: '#4A3A2A', // 剑柄 - 棕
  swordGuard: '#8A7A3A',  // 剑格 - 金
  // 盾
  shield: '#3A3A4A',      // 盾
  shieldDark: '#2A2A3A',  // 盾暗
  shieldLight: '#4A4A5A', // 盾亮
  shieldCorrupt: '#6600CC', // 盾侵蚀符文
  // 护手
  gauntlet: '#4A4A5A',    // 护手
  gauntletDark: '#3A3A4A', // 护手暗
  gauntletLight: '#5A5A6A', // 护手亮
  // 腰带
  belt: '#3A3A4A',        // 腰带
  beltLight: '#4A4A5A',   // 腰带亮
  // 靴子
  boot: '#2A2A3A',        // 靴
  bootDark: '#1A1A2A',    // 靴暗
  bootLight: '#3A3A4A',   // 靴亮
  // 黑魔法能量
  darkEnergy: '#6600CC',     // 黑暗能量
  darkEnergyGlow: '#9933FF', // 能量发光
  spark: '#BB66FF',          // 火花 - 紫
  sparkWhite: '#FFFFFF',     // 白火花
  // 侵蚀裂缝效果
  crack: '#1A0A2A',          // 裂缝
  crackGlow: '#8800FF',     // 裂缝发光
  highlight: '#FFFFFF',          // 高光
}

// 暗黑骑士高精度头像（16x16网格，聚焦被侵蚀的头盔头部特写）
const KNIGHT_AVATAR = [
  // ===== 头盔顶部边缘 =====
  [4, 0, KNIGHT_COLORS.helmDark], [5, 0, KNIGHT_COLORS.helm], [6, 0, KNIGHT_COLORS.helmLight], [7, 0, KNIGHT_COLORS.helmLight], [8, 0, KNIGHT_COLORS.helm], [9, 0, KNIGHT_COLORS.helmDark],
  [3, 1, KNIGHT_COLORS.helm], [4, 1, KNIGHT_COLORS.helmLight], [5, 1, KNIGHT_COLORS.helm], [6, 1, KNIGHT_COLORS.corruption], [7, 1, KNIGHT_COLORS.corruption], [8, 1, KNIGHT_COLORS.helm], [9, 1, KNIGHT_COLORS.helmLight], [10, 1, KNIGHT_COLORS.helm],
  [3, 2, KNIGHT_COLORS.helmDark], [4, 2, KNIGHT_COLORS.helm], [5, 2, KNIGHT_COLORS.helmLight], [6, 2, KNIGHT_COLORS.helmLight], [7, 2, KNIGHT_COLORS.corruption], [8, 2, KNIGHT_COLORS.corruption], [9, 2, KNIGHT_COLORS.helmLight], [10, 2, KNIGHT_COLORS.helm], [11, 2, KNIGHT_COLORS.helmDark],

  // ===== 头盔主体 =====
  [2, 3, KNIGHT_COLORS.helmDark], [3, 3, KNIGHT_COLORS.helm], [4, 3, KNIGHT_COLORS.helmLight], [5, 3, KNIGHT_COLORS.helm], [6, 3, KNIGHT_COLORS.corruptionGlow], [7, 3, KNIGHT_COLORS.corruptionGlow], [8, 3, KNIGHT_COLORS.helm], [9, 3, KNIGHT_COLORS.helmLight], [10, 3, KNIGHT_COLORS.helm], [11, 3, KNIGHT_COLORS.helmDark],
  [2, 4, KNIGHT_COLORS.helmDark], [3, 4, KNIGHT_COLORS.helm], [4, 4, KNIGHT_COLORS.helmLight], [5, 4, KNIGHT_COLORS.helm], [6, 4, KNIGHT_COLORS.corruption], [7, 4, KNIGHT_COLORS.corruption], [8, 4, KNIGHT_COLORS.helm], [9, 4, KNIGHT_COLORS.helmLight], [10, 4, KNIGHT_COLORS.helm], [11, 4, KNIGHT_COLORS.helmDark],

  // ===== 眼睛行（血红侵蚀）=====
  [2, 5, KNIGHT_COLORS.helmDark], [3, 5, KNIGHT_COLORS.helm], [4, 5, KNIGHT_COLORS.eye], [5, 5, KNIGHT_COLORS.eyeGlow], [6, 5, KNIGHT_COLORS.corruption], [7, 5, KNIGHT_COLORS.corruption], [8, 5, KNIGHT_COLORS.eyeGlow], [9, 5, KNIGHT_COLORS.eye], [10, 5, KNIGHT_COLORS.helm], [11, 5, KNIGHT_COLORS.helmDark],
  // 眼睛高光
  [4, 4, KNIGHT_COLORS.highlight], [5, 4, KNIGHT_COLORS.highlight], [8, 4, KNIGHT_COLORS.highlight], [9, 4, KNIGHT_COLORS.highlight],
  [4, 5, KNIGHT_COLORS.highlight], [8, 5, KNIGHT_COLORS.highlight],

  // ===== 眼睛发光效果 =====
  [4, 5, KNIGHT_COLORS.eyeGlow], [5, 5, KNIGHT_COLORS.eyeGlow], [8, 5, KNIGHT_COLORS.eyeGlow], [9, 5, KNIGHT_COLORS.eyeGlow],
  [4, 6, KNIGHT_COLORS.eyeInner], [5, 6, KNIGHT_COLORS.eyeInner], [8, 6, KNIGHT_COLORS.eyeInner], [9, 6, KNIGHT_COLORS.eyeInner],

  // ===== 面罩/侵蚀细节 =====
  [2, 6, KNIGHT_COLORS.helmDark], [3, 6, KNIGHT_COLORS.helm], [4, 6, KNIGHT_COLORS.corruptionGlow], [5, 6, KNIGHT_COLORS.eyeGlow], [6, 6, KNIGHT_COLORS.corruption], [7, 6, KNIGHT_COLORS.corruption], [8, 6, KNIGHT_COLORS.eyeGlow], [9, 6, KNIGHT_COLORS.corruptionGlow], [10, 6, KNIGHT_COLORS.helm], [11, 6, KNIGHT_COLORS.helmDark],
  [2, 7, KNIGHT_COLORS.helmDark], [3, 7, KNIGHT_COLORS.helm], [4, 7, KNIGHT_COLORS.corruption], [5, 7, KNIGHT_COLORS.corruptionDark], [6, 7, KNIGHT_COLORS.corruption], [7, 7, KNIGHT_COLORS.corruptionDark], [8, 7, KNIGHT_COLORS.corruption], [9, 7, KNIGHT_COLORS.corruption], [10, 7, KNIGHT_COLORS.helm], [11, 7, KNIGHT_COLORS.helmDark],

  // ===== 侵蚀裂缝 =====
  [3, 8, KNIGHT_COLORS.helmDark], [4, 8, KNIGHT_COLORS.crackGlow], [5, 8, KNIGHT_COLORS.crack], [6, 8, KNIGHT_COLORS.corruption], [7, 8, KNIGHT_COLORS.corruption], [8, 8, KNIGHT_COLORS.crack], [9, 8, KNIGHT_COLORS.crackGlow], [10, 8, KNIGHT_COLORS.helmDark],
  [4, 9, KNIGHT_COLORS.crack], [5, 9, KNIGHT_COLORS.corruptionGlow], [6, 9, KNIGHT_COLORS.corruptionDark], [7, 9, KNIGHT_COLORS.corruptionDark], [8, 9, KNIGHT_COLORS.corruptionGlow], [9, 9, KNIGHT_COLORS.crack],

  // ===== 下颚/护面 =====
  [3, 10, KNIGHT_COLORS.helmDark], [4, 10, KNIGHT_COLORS.helm], [5, 10, KNIGHT_COLORS.corruption], [6, 10, KNIGHT_COLORS.corruptionDark], [7, 10, KNIGHT_COLORS.corruptionDark], [8, 10, KNIGHT_COLORS.corruption], [9, 10, KNIGHT_COLORS.helm], [10, 10, KNIGHT_COLORS.helmDark],
  [4, 11, KNIGHT_COLORS.helm], [5, 11, KNIGHT_COLORS.helmLight], [6, 11, KNIGHT_COLORS.corruption], [7, 11, KNIGHT_COLORS.corruption], [8, 11, KNIGHT_COLORS.helmLight], [9, 11, KNIGHT_COLORS.helm],
  [4, 12, KNIGHT_COLORS.helmDark], [5, 12, KNIGHT_COLORS.helm], [6, 12, KNIGHT_COLORS.corruptionGlow], [7, 12, KNIGHT_COLORS.corruptionGlow], [8, 12, KNIGHT_COLORS.helm], [9, 12, KNIGHT_COLORS.helmDark],

  // ===== 肩甲 =====
  [2, 13, KNIGHT_COLORS.armorDark], [3, 13, KNIGHT_COLORS.armor], [4, 13, KNIGHT_COLORS.armorPlateLight], [5, 13, KNIGHT_COLORS.corruption], [6, 13, KNIGHT_COLORS.corruptionGlow], [7, 13, KNIGHT_COLORS.corruptionGlow], [8, 13, KNIGHT_COLORS.corruption], [9, 13, KNIGHT_COLORS.armorPlateLight], [10, 13, KNIGHT_COLORS.armor], [11, 13, KNIGHT_COLORS.armorDark],
  [3, 14, KNIGHT_COLORS.armorDark], [4, 14, KNIGHT_COLORS.armorPlate], [5, 14, KNIGHT_COLORS.corruptionDark], [6, 14, KNIGHT_COLORS.corruption], [7, 14, KNIGHT_COLORS.corruption], [8, 14, KNIGHT_COLORS.corruptionDark], [9, 14, KNIGHT_COLORS.armorPlateLight], [10, 14, KNIGHT_COLORS.armorPlate], [11, 14, KNIGHT_COLORS.armorDark],

  // ===== 符文装饰 =====
  [5, 13, KNIGHT_COLORS.runeGlow], [6, 13, KNIGHT_COLORS.rune], [7, 13, KNIGHT_COLORS.rune], [8, 13, KNIGHT_COLORS.runeGlow],
  [6, 14, KNIGHT_COLORS.sparkWhite], [7, 14, KNIGHT_COLORS.sparkWhite],
]

// 向下面朝 - 正面
const KNIGHT_FACE_DOWN = [
  // ===== 头盔顶部 =====
  [5, 0, KNIGHT_COLORS.helmDark], [6, 0, KNIGHT_COLORS.helm], [7, 0, KNIGHT_COLORS.helm], [8, 0, KNIGHT_COLORS.helmDark],
  [4, 1, KNIGHT_COLORS.helm], [5, 1, KNIGHT_COLORS.helmLight], [6, 1, KNIGHT_COLORS.helm], [7, 1, KNIGHT_COLORS.helm], [8, 1, KNIGHT_COLORS.helmLight], [9, 1, KNIGHT_COLORS.helm],
  [4, 2, KNIGHT_COLORS.helmDark], [5, 2, KNIGHT_COLORS.helm], [6, 2, KNIGHT_COLORS.helmLight], [7, 2, KNIGHT_COLORS.helmLight], [8, 2, KNIGHT_COLORS.helm], [9, 2, KNIGHT_COLORS.helmDark],

  // ===== 头盔面罩 =====
  [4, 3, KNIGHT_COLORS.helmDark], [5, 3, KNIGHT_COLORS.helm], [6, 3, KNIGHT_COLORS.corruption], [7, 3, KNIGHT_COLORS.corruption], [8, 3, KNIGHT_COLORS.helm], [9, 3, KNIGHT_COLORS.helmDark],
  [4, 4, KNIGHT_COLORS.helmDark], [5, 4, KNIGHT_COLORS.eye], [6, 4, KNIGHT_COLORS.eyeGlow], [7, 4, KNIGHT_COLORS.eyeGlow], [8, 4, KNIGHT_COLORS.eye], [9, 4, KNIGHT_COLORS.helmDark],
  [4, 5, KNIGHT_COLORS.helmDark], [5, 5, KNIGHT_COLORS.eyeGlow], [6, 5, KNIGHT_COLORS.eyeInner], [7, 5, KNIGHT_COLORS.eyeInner], [8, 5, KNIGHT_COLORS.eyeGlow], [9, 5, KNIGHT_COLORS.helmDark],
  [5, 6, KNIGHT_COLORS.helm], [6, 6, KNIGHT_COLORS.corruption], [7, 6, KNIGHT_COLORS.corruption], [8, 6, KNIGHT_COLORS.helm],

  // ===== 肩甲 =====
  [2, 7, KNIGHT_COLORS.armorDark], [3, 7, KNIGHT_COLORS.armor], [4, 7, KNIGHT_COLORS.armorPlateLight], [5, 7, KNIGHT_COLORS.corruption], [6, 7, KNIGHT_COLORS.corruptionGlow], [7, 7, KNIGHT_COLORS.corruptionGlow], [8, 7, KNIGHT_COLORS.corruption], [9, 7, KNIGHT_COLORS.armorPlateLight], [10, 7, KNIGHT_COLORS.armor], [11, 7, KNIGHT_COLORS.armorDark],
  [2, 8, KNIGHT_COLORS.armorDark], [3, 8, KNIGHT_COLORS.armorPlate], [4, 8, KNIGHT_COLORS.armorPlateLight], [5, 8, KNIGHT_COLORS.corruptionDark], [6, 8, KNIGHT_COLORS.corruption], [7, 8, KNIGHT_COLORS.corruption], [8, 8, KNIGHT_COLORS.corruptionDark], [9, 8, KNIGHT_COLORS.armorPlateLight], [10, 8, KNIGHT_COLORS.armorPlate], [11, 8, KNIGHT_COLORS.armorDark],

  // ===== 胸甲 =====
  [3, 9, KNIGHT_COLORS.armorDark], [4, 9, KNIGHT_COLORS.armorPlate], [5, 9, KNIGHT_COLORS.corruptionGlow], [6, 9, KNIGHT_COLORS.armorPlateLight], [7, 9, KNIGHT_COLORS.armorPlateLight], [8, 9, KNIGHT_COLORS.corruptionGlow], [9, 9, KNIGHT_COLORS.armorPlate], [10, 9, KNIGHT_COLORS.armorDark],
  [3, 10, KNIGHT_COLORS.armorDark], [4, 10, KNIGHT_COLORS.armor], [5, 10, KNIGHT_COLORS.corruption], [6, 10, KNIGHT_COLORS.corruptionDark], [7, 10, KNIGHT_COLORS.corruptionDark], [8, 10, KNIGHT_COLORS.corruption], [9, 10, KNIGHT_COLORS.armor], [10, 10, KNIGHT_COLORS.armorDark],

  // ===== 腰带 =====
  [4, 11, KNIGHT_COLORS.belt], [5, 11, KNIGHT_COLORS.corruption], [6, 11, KNIGHT_COLORS.beltLight], [7, 11, KNIGHT_COLORS.beltLight], [8, 11, KNIGHT_COLORS.corruption], [9, 11, KNIGHT_COLORS.belt],

  // ===== 腿甲 =====
  [5, 12, KNIGHT_COLORS.armorDark], [6, 12, KNIGHT_COLORS.armorPlate], [7, 12, KNIGHT_COLORS.armorPlate], [8, 12, KNIGHT_COLORS.armorDark],
  [5, 13, KNIGHT_COLORS.boot], [6, 13, KNIGHT_COLORS.bootLight], [7, 13, KNIGHT_COLORS.bootLight], [8, 13, KNIGHT_COLORS.boot],
  [5, 14, KNIGHT_COLORS.bootDark], [6, 14, KNIGHT_COLORS.boot], [7, 14, KNIGHT_COLORS.boot], [8, 14, KNIGHT_COLORS.bootDark],
  [5, 15, KNIGHT_COLORS.boot], [6, 15, KNIGHT_COLORS.bootLight], [7, 15, KNIGHT_COLORS.bootLight], [8, 15, KNIGHT_COLORS.boot],

  // ===== 左手（持剑）=====
  [1, 8, KNIGHT_COLORS.gauntlet], [2, 8, KNIGHT_COLORS.gauntletDark],
  [1, 9, KNIGHT_COLORS.gauntletLight], [2, 9, KNIGHT_COLORS.gauntlet],
  [1, 10, KNIGHT_COLORS.gauntlet], [2, 10, KNIGHT_COLORS.gauntletDark],
  [1, 11, KNIGHT_COLORS.gauntletLight],
  [1, 12, KNIGHT_COLORS.swordHandle],
  [1, 13, KNIGHT_COLORS.swordGuard],
  [1, 14, KNIGHT_COLORS.swordHandle],
  [1, 15, KNIGHT_COLORS.swordDark],
  [1, 16, KNIGHT_COLORS.sword], [2, 16, KNIGHT_COLORS.corruption],
  [1, 17, KNIGHT_COLORS.swordLight],

  // ===== 右手（持盾）=====
  [12, 8, KNIGHT_COLORS.gauntletDark], [13, 8, KNIGHT_COLORS.gauntlet],
  [12, 9, KNIGHT_COLORS.gauntlet], [13, 9, KNIGHT_COLORS.gauntletLight],
  [12, 10, KNIGHT_COLORS.gauntletDark], [13, 10, KNIGHT_COLORS.gauntlet],
  [13, 11, KNIGHT_COLORS.shieldDark],
  [13, 12, KNIGHT_COLORS.shield],
  [13, 13, KNIGHT_COLORS.shieldLight],
  [13, 14, KNIGHT_COLORS.shieldCorrupt],

  // ===== 黑魔法能量 =====
  [6, 15, KNIGHT_COLORS.darkEnergy], [7, 15, KNIGHT_COLORS.darkEnergy],
  [5, 17, KNIGHT_COLORS.spark], [8, 17, KNIGHT_COLORS.spark],
]

// 向上面朝 - 背面
const KNIGHT_FACE_UP = [
  // ===== 头盔顶部 =====
  [5, 0, KNIGHT_COLORS.helmDark], [6, 0, KNIGHT_COLORS.helm], [7, 0, KNIGHT_COLORS.helm], [8, 0, KNIGHT_COLORS.helmDark],
  [4, 1, KNIGHT_COLORS.helm], [5, 1, KNIGHT_COLORS.helmLight], [6, 1, KNIGHT_COLORS.helm], [7, 1, KNIGHT_COLORS.helm], [8, 1, KNIGHT_COLORS.helmLight], [9, 1, KNIGHT_COLORS.helm],
  [4, 2, KNIGHT_COLORS.helmDark], [5, 2, KNIGHT_COLORS.helm], [6, 2, KNIGHT_COLORS.helmLight], [7, 2, KNIGHT_COLORS.helmLight], [8, 2, KNIGHT_COLORS.helm], [9, 2, KNIGHT_COLORS.helmDark],

  // ===== 头盔背面 =====
  [4, 3, KNIGHT_COLORS.helmDark], [5, 3, KNIGHT_COLORS.helm], [6, 3, KNIGHT_COLORS.corruption], [7, 3, KNIGHT_COLORS.corruption], [8, 3, KNIGHT_COLORS.helm], [9, 3, KNIGHT_COLORS.helmDark],
  [4, 4, KNIGHT_COLORS.helmDark], [5, 4, KNIGHT_COLORS.helm], [6, 4, KNIGHT_COLORS.helmLight], [7, 4, KNIGHT_COLORS.helmLight], [8, 4, KNIGHT_COLORS.helm], [9, 4, KNIGHT_COLORS.helmDark],
  [5, 5, KNIGHT_COLORS.helm], [6, 5, KNIGHT_COLORS.corruptionGlow], [7, 5, KNIGHT_COLORS.corruptionGlow], [8, 5, KNIGHT_COLORS.helm],

  // ===== 披风 =====
  [1, 6, KNIGHT_COLORS.capeDark], [2, 6, KNIGHT_COLORS.cape], [3, 6, KNIGHT_COLORS.capeLight], [4, 6, KNIGHT_COLORS.capeCorrupt], [5, 6, KNIGHT_COLORS.corruptionGlow], [6, 6, KNIGHT_COLORS.corruptionGlow], [7, 6, KNIGHT_COLORS.corruptionGlow], [8, 6, KNIGHT_COLORS.capeCorrupt], [9, 6, KNIGHT_COLORS.capeLight], [10, 6, KNIGHT_COLORS.cape], [11, 6, KNIGHT_COLORS.capeDark],
  [1, 7, KNIGHT_COLORS.capeDark], [2, 7, KNIGHT_COLORS.cape], [3, 7, KNIGHT_COLORS.capeLight], [4, 7, KNIGHT_COLORS.cape], [5, 7, KNIGHT_COLORS.corruptionDark], [6, 7, KNIGHT_COLORS.corruption], [7, 7, KNIGHT_COLORS.corruption], [8, 7, KNIGHT_COLORS.corruptionDark], [9, 7, KNIGHT_COLORS.cape], [10, 7, KNIGHT_COLORS.capeLight], [11, 7, KNIGHT_COLORS.cape], [12, 7, KNIGHT_COLORS.capeDark],
  [2, 8, KNIGHT_COLORS.capeDark], [3, 8, KNIGHT_COLORS.cape], [4, 8, KNIGHT_COLORS.capeLight], [5, 8, KNIGHT_COLORS.cape], [6, 8, KNIGHT_COLORS.corruptionDark], [7, 8, KNIGHT_COLORS.corruptionDark], [8, 8, KNIGHT_COLORS.cape], [9, 8, KNIGHT_COLORS.capeLight], [10, 8, KNIGHT_COLORS.cape], [11, 8, KNIGHT_COLORS.capeDark],
  [2, 9, KNIGHT_COLORS.capeDark], [3, 9, KNIGHT_COLORS.cape], [4, 9, KNIGHT_COLORS.capeLight], [5, 9, KNIGHT_COLORS.capeCorrupt], [6, 9, KNIGHT_COLORS.cape], [7, 9, KNIGHT_COLORS.cape], [8, 9, KNIGHT_COLORS.capeCorrupt], [9, 9, KNIGHT_COLORS.capeLight], [10, 9, KNIGHT_COLORS.cape], [11, 9, KNIGHT_COLORS.capeDark],

  // ===== 背甲 + 腿 =====
  [4, 10, KNIGHT_COLORS.armorDark], [5, 10, KNIGHT_COLORS.corruptionGlow], [6, 10, KNIGHT_COLORS.armorPlateLight], [7, 10, KNIGHT_COLORS.armorPlateLight], [8, 10, KNIGHT_COLORS.corruptionGlow], [9, 10, KNIGHT_COLORS.armorDark],
  [5, 11, KNIGHT_COLORS.armorDark], [6, 11, KNIGHT_COLORS.armorPlate], [7, 11, KNIGHT_COLORS.armorPlate], [8, 11, KNIGHT_COLORS.armorDark],
  [5, 12, KNIGHT_COLORS.boot], [6, 12, KNIGHT_COLORS.bootLight], [7, 12, KNIGHT_COLORS.bootLight], [8, 12, KNIGHT_COLORS.boot],
  [5, 13, KNIGHT_COLORS.bootDark], [6, 13, KNIGHT_COLORS.boot], [7, 13, KNIGHT_COLORS.boot], [8, 13, KNIGHT_COLORS.bootDark],
  [5, 14, KNIGHT_COLORS.boot], [6, 14, KNIGHT_COLORS.bootLight], [7, 14, KNIGHT_COLORS.bootLight], [8, 14, KNIGHT_COLORS.boot],

  // ===== 武器（剑背在身后）=====
  [12, 7, KNIGHT_COLORS.swordDark],
  [12, 8, KNIGHT_COLORS.sword],
  [12, 9, KNIGHT_COLORS.swordLight],
  [12, 10, KNIGHT_COLORS.swordGuard],
  [12, 11, KNIGHT_COLORS.swordHandle],

  // ===== 黑魔法能量 =====
  [6, 14, KNIGHT_COLORS.darkEnergy], [7, 14, KNIGHT_COLORS.darkEnergy],
]

// 向左面朝 - 侧面
const KNIGHT_FACE_LEFT = [
  // ===== 头盔侧面 =====
  [5, 0, KNIGHT_COLORS.helmDark], [6, 0, KNIGHT_COLORS.helm],
  [4, 1, KNIGHT_COLORS.helm], [5, 1, KNIGHT_COLORS.helmLight], [6, 1, KNIGHT_COLORS.corruption],
  [4, 2, KNIGHT_COLORS.helmDark], [5, 2, KNIGHT_COLORS.helm], [6, 2, KNIGHT_COLORS.helmLight],

  // ===== 头盔侧面 + 眼睛 =====
  [4, 3, KNIGHT_COLORS.helmDark], [5, 3, KNIGHT_COLORS.eye], [6, 3, KNIGHT_COLORS.eyeGlow], [7, 3, KNIGHT_COLORS.helm],
  [4, 4, KNIGHT_COLORS.helmDark], [5, 4, KNIGHT_COLORS.eyeGlow], [6, 4, KNIGHT_COLORS.eyeInner], [7, 4, KNIGHT_COLORS.helmDark],
  [4, 5, KNIGHT_COLORS.helm], [5, 5, KNIGHT_COLORS.corruption], [6, 5, KNIGHT_COLORS.helm], [7, 5, KNIGHT_COLORS.helmDark],

  // ===== 肩甲 =====
  [3, 6, KNIGHT_COLORS.armorDark], [4, 6, KNIGHT_COLORS.armorPlateLight], [5, 6, KNIGHT_COLORS.corruption], [6, 6, KNIGHT_COLORS.corruptionGlow], [7, 6, KNIGHT_COLORS.armorPlate], [8, 6, KNIGHT_COLORS.armorDark],
  [2, 7, KNIGHT_COLORS.armorDark], [3, 7, KNIGHT_COLORS.armor], [4, 7, KNIGHT_COLORS.corruptionDark], [5, 7, KNIGHT_COLORS.corruption], [6, 7, KNIGHT_COLORS.corruptionDark], [7, 7, KNIGHT_COLORS.armorPlateLight], [8, 7, KNIGHT_COLORS.armor], [9, 7, KNIGHT_COLORS.armorDark],

  // ===== 胸甲侧面 =====
  [2, 8, KNIGHT_COLORS.armorDark], [3, 8, KNIGHT_COLORS.armorPlate], [4, 8, KNIGHT_COLORS.corruptionGlow], [5, 8, KNIGHT_COLORS.corruption], [6, 8, KNIGHT_COLORS.corruptionDark], [7, 8, KNIGHT_COLORS.armorPlateLight], [8, 8, KNIGHT_COLORS.armor], [9, 8, KNIGHT_COLORS.armorDark],
  [2, 9, KNIGHT_COLORS.armorDark], [3, 9, KNIGHT_COLORS.armor], [4, 9, KNIGHT_COLORS.corruption], [5, 9, KNIGHT_COLORS.corruptionDark], [6, 9, KNIGHT_COLORS.corruptionDark], [7, 9, KNIGHT_COLORS.corruption], [8, 9, KNIGHT_COLORS.armor], [9, 9, KNIGHT_COLORS.armorDark],

  // ===== 腰带 =====
  [3, 10, KNIGHT_COLORS.belt], [4, 10, KNIGHT_COLORS.corruption], [5, 10, KNIGHT_COLORS.beltLight], [6, 10, KNIGHT_COLORS.corruption], [7, 10, KNIGHT_COLORS.beltLight], [8, 10, KNIGHT_COLORS.belt], [9, 10, KNIGHT_COLORS.belt],

  // ===== 腿甲 =====
  [5, 11, KNIGHT_COLORS.armorDark], [6, 11, KNIGHT_COLORS.armorPlate], [7, 11, KNIGHT_COLORS.armorPlate], [8, 11, KNIGHT_COLORS.armorDark],
  [5, 12, KNIGHT_COLORS.boot], [6, 12, KNIGHT_COLORS.bootLight], [7, 12, KNIGHT_COLORS.bootLight], [8, 12, KNIGHT_COLORS.boot],
  [5, 13, KNIGHT_COLORS.bootDark], [6, 13, KNIGHT_COLORS.boot], [7, 13, KNIGHT_COLORS.boot], [8, 13, KNIGHT_COLORS.bootDark],
  [5, 14, KNIGHT_COLORS.boot], [6, 14, KNIGHT_COLORS.bootLight], [7, 14, KNIGHT_COLORS.bootLight], [8, 14, KNIGHT_COLORS.boot],
  [5, 15, KNIGHT_COLORS.bootDark], [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.boot], [8, 15, KNIGHT_COLORS.bootDark],

  // ===== 左手（前伸持剑）=====
  [0, 7, KNIGHT_COLORS.gauntlet],
  [0, 8, KNIGHT_COLORS.gauntletLight], [1, 8, KNIGHT_COLORS.swordHandle],
  [0, 9, KNIGHT_COLORS.gauntlet], [1, 9, KNIGHT_COLORS.swordGuard],
  [0, 10, KNIGHT_COLORS.gauntletDark], [1, 10, KNIGHT_COLORS.swordHandle],
  [1, 11, KNIGHT_COLORS.swordDark], [2, 11, KNIGHT_COLORS.swordDark],
  [1, 12, KNIGHT_COLORS.sword], [2, 12, KNIGHT_COLORS.corruption],
  [1, 13, KNIGHT_COLORS.swordLight], [2, 13, KNIGHT_COLORS.sword],
  [2, 14, KNIGHT_COLORS.swordDark],

  // ===== 右手（盾在身后）=====
  [9, 8, KNIGHT_COLORS.gauntlet], [10, 8, KNIGHT_COLORS.gauntletDark],
  [9, 9, KNIGHT_COLORS.gauntletLight], [10, 9, KNIGHT_COLORS.gauntlet],
  [10, 10, KNIGHT_COLORS.shieldDark],
  [10, 11, KNIGHT_COLORS.shield],
  [10, 12, KNIGHT_COLORS.shieldLight],
  [10, 13, KNIGHT_COLORS.shieldCorrupt],

  // ===== 黑魔法能量 =====
  [6, 15, KNIGHT_COLORS.darkEnergy],
  [5, 15, KNIGHT_COLORS.spark],
]

// 向右面朝 - 侧面镜像
const KNIGHT_FACE_RIGHT = [
  // ===== 头盔侧面 =====
  [5, 0, KNIGHT_COLORS.helm], [6, 0, KNIGHT_COLORS.helmDark],
  [5, 1, KNIGHT_COLORS.corruption], [6, 1, KNIGHT_COLORS.helmLight], [7, 1, KNIGHT_COLORS.helm],
  [5, 2, KNIGHT_COLORS.helmLight], [6, 2, KNIGHT_COLORS.helm], [7, 2, KNIGHT_COLORS.helmDark],

  // ===== 头盔侧面 + 眼睛 =====
  [4, 3, KNIGHT_COLORS.helm], [5, 3, KNIGHT_COLORS.eyeGlow], [6, 3, KNIGHT_COLORS.eye], [7, 3, KNIGHT_COLORS.helmDark],
  [4, 4, KNIGHT_COLORS.helmDark], [5, 4, KNIGHT_COLORS.eyeInner], [6, 4, KNIGHT_COLORS.eyeGlow], [7, 4, KNIGHT_COLORS.helmDark],
  [4, 5, KNIGHT_COLORS.helmDark], [5, 5, KNIGHT_COLORS.helm], [6, 5, KNIGHT_COLORS.corruption], [7, 5, KNIGHT_COLORS.helm],

  // ===== 肩甲 =====
  [4, 6, KNIGHT_COLORS.armorDark], [5, 6, KNIGHT_COLORS.armorPlate], [6, 6, KNIGHT_COLORS.corruptionGlow], [7, 6, KNIGHT_COLORS.corruption], [8, 6, KNIGHT_COLORS.armorPlateLight], [9, 6, KNIGHT_COLORS.armorDark],
  [3, 7, KNIGHT_COLORS.armorDark], [4, 7, KNIGHT_COLORS.armor], [5, 7, KNIGHT_COLORS.corruptionDark], [6, 7, KNIGHT_COLORS.corruption], [7, 7, KNIGHT_COLORS.corruptionDark], [8, 7, KNIGHT_COLORS.armorPlate], [9, 7, KNIGHT_COLORS.armor], [10, 7, KNIGHT_COLORS.armorDark],

  // ===== 胸甲侧面 =====
  [3, 8, KNIGHT_COLORS.armorDark], [4, 8, KNIGHT_COLORS.armor], [5, 8, KNIGHT_COLORS.corruptionDark], [6, 8, KNIGHT_COLORS.corruption], [7, 8, KNIGHT_COLORS.corruptionGlow], [8, 8, KNIGHT_COLORS.armorPlate], [9, 8, KNIGHT_COLORS.armorPlate], [10, 8, KNIGHT_COLORS.armorDark],
  [3, 9, KNIGHT_COLORS.armorDark], [4, 9, KNIGHT_COLORS.armor], [5, 9, KNIGHT_COLORS.corruptionDark], [6, 9, KNIGHT_COLORS.corruptionDark], [7, 9, KNIGHT_COLORS.corruption], [8, 9, KNIGHT_COLORS.corruptionGlow], [9, 9, KNIGHT_COLORS.armor], [10, 9, KNIGHT_COLORS.armorDark],

  // ===== 腰带 =====
  [4, 10, KNIGHT_COLORS.belt], [5, 10, KNIGHT_COLORS.beltLight], [6, 10, KNIGHT_COLORS.corruption], [7, 10, KNIGHT_COLORS.beltLight], [8, 10, KNIGHT_COLORS.corruption], [9, 10, KNIGHT_COLORS.belt],

  // ===== 腿甲 =====
  [4, 11, KNIGHT_COLORS.armorDark], [5, 11, KNIGHT_COLORS.armorPlate], [6, 11, KNIGHT_COLORS.armorPlate], [7, 11, KNIGHT_COLORS.armorDark],
  [4, 12, KNIGHT_COLORS.boot], [5, 12, KNIGHT_COLORS.bootLight], [6, 12, KNIGHT_COLORS.bootLight], [7, 12, KNIGHT_COLORS.boot],
  [4, 13, KNIGHT_COLORS.bootDark], [5, 13, KNIGHT_COLORS.boot], [6, 13, KNIGHT_COLORS.boot], [7, 13, KNIGHT_COLORS.bootDark],
  [4, 14, KNIGHT_COLORS.boot], [5, 14, KNIGHT_COLORS.bootLight], [6, 14, KNIGHT_COLORS.bootLight], [7, 14, KNIGHT_COLORS.boot],
  [4, 15, KNIGHT_COLORS.bootDark], [5, 15, KNIGHT_COLORS.boot], [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.bootDark],

  // ===== 左手（盾在身后）=====
  [2, 8, KNIGHT_COLORS.gauntletDark], [3, 8, KNIGHT_COLORS.gauntlet],
  [2, 9, KNIGHT_COLORS.gauntlet], [3, 9, KNIGHT_COLORS.gauntletLight],
  [2, 10, KNIGHT_COLORS.shieldCorrupt],
  [2, 11, KNIGHT_COLORS.shieldLight],
  [2, 12, KNIGHT_COLORS.shield],
  [2, 13, KNIGHT_COLORS.shieldDark],

  // ===== 右手（前伸持剑）=====
  [11, 7, KNIGHT_COLORS.gauntlet],
  [12, 8, KNIGHT_COLORS.swordHandle], [13, 8, KNIGHT_COLORS.gauntletLight],
  [12, 9, KNIGHT_COLORS.swordGuard], [13, 9, KNIGHT_COLORS.gauntlet],
  [12, 10, KNIGHT_COLORS.swordHandle], [13, 10, KNIGHT_COLORS.gauntletDark],
  [12, 11, KNIGHT_COLORS.swordDark], [13, 11, KNIGHT_COLORS.swordDark],
  [13, 12, KNIGHT_COLORS.corruption], [14, 12, KNIGHT_COLORS.sword],
  [13, 13, KNIGHT_COLORS.sword], [14, 13, KNIGHT_COLORS.swordLight],
  [14, 14, KNIGHT_COLORS.swordDark],

  // ===== 黑魔法能量 =====
  [6, 15, KNIGHT_COLORS.darkEnergy],
  [7, 15, KNIGHT_COLORS.spark],
]

// 待机动画帧（眼睛发光 + 侵蚀脉动）
const KNIGHT_IDLE_FRAMES = [
  // 帧0 - 暗
  [
    { pixels: [
      [6, 4, KNIGHT_COLORS.eye], [7, 4, KNIGHT_COLORS.eye],
      [6, 3, KNIGHT_COLORS.corruption], [7, 3, KNIGHT_COLORS.corruption],
      [6, 7, KNIGHT_COLORS.corruption], [7, 7, KNIGHT_COLORS.corruption],
      [6, 9, KNIGHT_COLORS.corruption], [7, 9, KNIGHT_COLORS.corruption],
      [6, 15, KNIGHT_COLORS.darkEnergy], [7, 15, KNIGHT_COLORS.darkEnergy],
    ] }
  ],
  // 帧1 - 亮（侵蚀发光 + 能量爆发）
  [
    { pixels: [
      [6, 4, KNIGHT_COLORS.eyeGlow], [7, 4, KNIGHT_COLORS.eyeGlow],
      [6, 3, KNIGHT_COLORS.corruptionGlow], [7, 3, KNIGHT_COLORS.corruptionGlow],
      [6, 7, KNIGHT_COLORS.corruptionGlow], [7, 7, KNIGHT_COLORS.corruptionGlow],
      [6, 9, KNIGHT_COLORS.corruptionGlow], [7, 9, KNIGHT_COLORS.corruptionGlow],
      [6, 15, KNIGHT_COLORS.darkEnergyGlow], [7, 15, KNIGHT_COLORS.darkEnergyGlow],
      [5, 17, KNIGHT_COLORS.spark], [8, 17, KNIGHT_COLORS.spark],
    ] }
  ],
]

// 行走动画帧（步伐）
const KNIGHT_WALK_FRAMES = [
  // 帧0 - 左脚前
  [
    { pixels: [
      [5, 15, KNIGHT_COLORS.bootDark], [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.boot],
    ] }
  ],
  // 帧1 - 中间
  [
    { pixels: [
      [5, 15, KNIGHT_COLORS.boot], [6, 15, KNIGHT_COLORS.bootDark], [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.boot],
    ] }
  ],
  // 帧2 - 右脚前
  [
    { pixels: [
      [5, 15, KNIGHT_COLORS.boot], [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.bootDark],
    ] }
  ],
]

export const drawBlackKnight = (canvasRef, currentUnit) => {
  if (!canvasRef) return
  const ctx = canvasRef.getContext('2d')
  const x = currentUnit.x
  const y = currentUnit.y
  const unit = currentUnit.size / 16
  const direction = currentUnit.direction || 'down'
  const frame = currentUnit.frame || 0

  ctx.imageSmoothingEnabled = false

  const drawPixel = (px, py, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x + px * unit, y + py * unit, unit, unit)
  }

  // 选择基础像素数据
  let basePixels = KNIGHT_FACE_DOWN
  if (direction === 'up') basePixels = KNIGHT_FACE_UP
  else if (direction === 'left') basePixels = KNIGHT_FACE_LEFT
  else if (direction === 'right') basePixels = KNIGHT_FACE_RIGHT

  // 绘制基础角色
  for (let i = 0; i < basePixels.length; i++) {
    drawPixel(basePixels[i][0], basePixels[i][1], basePixels[i][2])
  }

  // 绘制动画层
  const isMoving = currentUnit.isMoving || false
  const frames = isMoving ? KNIGHT_WALK_FRAMES : KNIGHT_IDLE_FRAMES
  const frameIndex = Math.floor(frame) % frames.length
  const currentFrame = frames[frameIndex]

  for (const layer of currentFrame) {
    for (const pixel of layer.pixels) {
      drawPixel(pixel[0], pixel[1], pixel[2])
    }
  }
}

export const drawBlackKnightAvatar = (canvasRef, currentUnit, avatarPos) => {
  if (!canvasRef) return
  const ctx = canvasRef.getContext('2d')
  const x = avatarPos.x
  const y = avatarPos.y
  const unit = currentUnit.size / 16

  ctx.imageSmoothingEnabled = false

  const drawPixel = (px, py, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x + px * unit, y + py * unit, unit, unit)
  }

  for (let i = 0; i < KNIGHT_AVATAR.length; i++) {
    drawPixel(KNIGHT_AVATAR[i][0], KNIGHT_AVATAR[i][1], KNIGHT_AVATAR[i][2])
  }
}