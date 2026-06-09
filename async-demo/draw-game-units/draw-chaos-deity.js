/**
 * 绘制混沌之神怪物 - 混沌力量夺舍的战神
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit 混沌之神位置和状态
 * @param {Number} currentUnit.x 混沌之神x坐标
 * @param {Number} currentUnit.y 混沌之神y坐标
 * @param {Number} currentUnit.size 混沌之神大小(px)
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

export const config = {
  IDLE_SPEED: 0.004,
  WALK_SPEED: 0.1,
}

const DEITY_COLORS = {
  // 战神头盔 - 厚重沧桑
  helm: '#3A3A4A',           // 头盔主色 - 深银灰
  helmDark: '#2A2A3A',       // 头盔暗 - 更暗更沧桑
  helmLight: '#5A5A6A',      // 头盔亮
  helmGold: '#7A6A3A',       // 头盔金饰 - 暗淡的金色
  helmGoldLight: '#9A8A5A',  // 金饰亮
  helmRust: '#5A4A3A',       // 锈迹
  helmDirt: '#4A4A4A',       // 污渍
  
  // 眼睛 - 混沌红
  eye: '#CC0000',            // 眼睛 - 深红
  eyeGlow: '#FF3333',        // 眼睛发光
  eyeInner: '#FF6666',       // 眼睛内核
  eyeChaos: '#CC00CC',       // 混沌红 - 夺舍痕迹
  eyeChaosGlow: '#FF44FF',   // 混沌发光
  
  // 盔甲（被侵蚀 + 厚重沧桑）
  armor: '#3A3A4A',          // 盔甲主色 - 更深
  armorDark: '#2A2A3A',      // 盔甲暗
  armorLight: '#4A4A5A',     // 盔甲亮
  armorPlate: '#4A4A5A',     // 金属板
  armorPlateLight: '#5A5A6A', // 板亮
  armorCorrupt: '#1A0A2A',   // 侵蚀色
  armorRust: '#5A4A3A',      // 盔甲锈迹
  armorDirt: '#4A4A4A',      // 盔甲污渍
  armorScratch: '#2A2A2A',   // 划痕
  
  // 混沌符文
  chaos: '#CC00CC',          // 混沌符文 - 品红
  chaosGlow: '#FF44FF',      // 混沌发光
  chaosDark: '#880088',      // 混沌暗
  chaosLight: '#FF66FF',     // 混沌亮
  
  // 披风（混沌侵蚀）
  cape: '#1A0A1A',           // 披风 - 暗紫黑
  capeDark: '#0A000A',       // 披风暗
  capeLight: '#2A1A2A',      // 披风亮
  capeChaos: '#330088',      // 披风混沌色
  
  // 战神之剑
  sword: '#6A6A7A',          // 剑刃 - 暗淡银
  swordDark: '#4A4A5A',      // 剑刃暗
  swordLight: '#8A8A9A',     // 剑刃亮
  swordHandle: '#4A3A2A',    // 剑柄 - 深棕
  swordGuard: '#8A7A4A',     // 剑格 - 暗淡金
  swordChaos: '#CC00CC',     // 剑上混沌
  swordRust: '#5A4A3A',      // 剑锈迹
  
  // 战神之盾
  shield: '#3A3A4A',         // 盾
  shieldDark: '#2A2A3A',     // 盾暗
  shieldLight: '#4A4A5A',    // 盾亮
  shieldGold: '#8A7A4A',     // 盾金
  shieldChaos: '#CC00CC',    // 盾混沌符
  shieldCrack: '#1A1A2A',    // 盾裂缝
  
  // 护手
  gauntlet: '#4A4A5A',       // 护手
  gauntletDark: '#3A3A4A',   // 护手暗
  gauntletLight: '#5A5A6A',  // 护手亮
  
  // 腰带
  belt: '#3A3A4A',           // 腰带
  beltGold: '#8A7A4A',       // 腰带金
  beltBuckle: '#7A6A3A',     // 带扣
  
  // 腿甲和靴子
  legArmor: '#3A3A4A',       // 腿甲
  legArmorDark: '#2A2A3A',   // 腿甲暗
  legArmorLight: '#4A4A5A',  // 腿甲亮
  boot: '#2A2A3A',           // 靴
  bootDark: '#1A1A2A',       // 靴暗
  bootLight: '#3A3A4A',      // 靴亮
  bootSteel: '#4A4A5A',      // 靴钢板
  
  // 混沌能量
  chaosEnergy: '#CC00CC',     // 混沌能量
  chaosEnergyGlow: '#FF44FF', // 能量发光
  spark: '#FF66FF',          // 火花
  sparkWhite: '#FFFFFF',     // 白火花
  
  // 混沌侵蚀裂缝
  crack: '#0A001A',          // 裂缝
  crackGlow: '#CC00CC',      // 裂缝发光
}

const DEITY_FACE_DOWN = [
  // ===== 厚重头盔顶部 =====
  [4, 0, DEITY_COLORS.helmDark], [5, 0, DEITY_COLORS.helmDark], [6, 0, DEITY_COLORS.helm], [7, 0, DEITY_COLORS.helm], [8, 0, DEITY_COLORS.helm], [9, 0, DEITY_COLORS.helmDark], [10, 0, DEITY_COLORS.helmDark],
  [3, 1, DEITY_COLORS.helmDark], [4, 1, DEITY_COLORS.helm], [5, 1, DEITY_COLORS.helmLight], [6, 1, DEITY_COLORS.helm], [7, 1, DEITY_COLORS.helm], [8, 1, DEITY_COLORS.helm], [9, 1, DEITY_COLORS.helmLight], [10, 1, DEITY_COLORS.helm], [11, 1, DEITY_COLORS.helmDark],
  [3, 2, DEITY_COLORS.helmDark], [4, 2, DEITY_COLORS.helmGold], [5, 2, DEITY_COLORS.helm], [6, 2, DEITY_COLORS.helmLight], [7, 2, DEITY_COLORS.helmLight], [8, 2, DEITY_COLORS.helm], [9, 2, DEITY_COLORS.helmGold], [10, 2, DEITY_COLORS.helmDark], [11, 2, DEITY_COLORS.helmRust],

  // ===== 头盔面罩 + 混沌之眼 =====
  [2, 3, DEITY_COLORS.helmDark], [3, 3, DEITY_COLORS.helm], [4, 3, DEITY_COLORS.helmDark], [5, 3, DEITY_COLORS.chaos], [6, 3, DEITY_COLORS.chaos], [7, 3, DEITY_COLORS.chaos], [8, 3, DEITY_COLORS.chaos], [9, 3, DEITY_COLORS.helmDark], [10, 3, DEITY_COLORS.helm], [11, 3, DEITY_COLORS.helmDark],
  [2, 4, DEITY_COLORS.helmDark], [3, 4, DEITY_COLORS.helmDark], [4, 4, DEITY_COLORS.eyeChaos], [5, 4, DEITY_COLORS.eyeChaosGlow], [6, 4, DEITY_COLORS.eyeGlow], [7, 4, DEITY_COLORS.eyeGlow], [8, 4, DEITY_COLORS.eyeChaosGlow], [9, 4, DEITY_COLORS.eyeChaos], [10, 4, DEITY_COLORS.helmDark], [11, 4, DEITY_COLORS.helmDark],
  [2, 5, DEITY_COLORS.helmDark], [3, 5, DEITY_COLORS.helm], [4, 5, DEITY_COLORS.eyeChaosGlow], [5, 5, DEITY_COLORS.eyeInner], [6, 5, DEITY_COLORS.eye], [7, 5, DEITY_COLORS.eye], [8, 5, DEITY_COLORS.eyeInner], [9, 5, DEITY_COLORS.eyeChaosGlow], [10, 5, DEITY_COLORS.helm], [11, 5, DEITY_COLORS.helmDark],
  [3, 6, DEITY_COLORS.helm], [4, 6, DEITY_COLORS.helmDark], [5, 6, DEITY_COLORS.chaosDark], [6, 6, DEITY_COLORS.chaosDark], [7, 6, DEITY_COLORS.chaosDark], [8, 6, DEITY_COLORS.chaosDark], [9, 6, DEITY_COLORS.helmDark], [10, 6, DEITY_COLORS.helm],

  // ===== 厚重肩甲（被混沌侵蚀）=====
  [0, 7, DEITY_COLORS.armorDark], [1, 7, DEITY_COLORS.armorDark], [2, 7, DEITY_COLORS.armor], [3, 7, DEITY_COLORS.armorPlate], [4, 7, DEITY_COLORS.chaos], [5, 7, DEITY_COLORS.chaosGlow], [6, 7, DEITY_COLORS.chaosGlow], [7, 7, DEITY_COLORS.chaosGlow], [8, 7, DEITY_COLORS.chaosGlow], [9, 7, DEITY_COLORS.chaos], [10, 7, DEITY_COLORS.armorPlate], [11, 7, DEITY_COLORS.armor], [12, 7, DEITY_COLORS.armorDark], [13, 7, DEITY_COLORS.armorDark],
  [0, 8, DEITY_COLORS.armorDark], [1, 8, DEITY_COLORS.armor], [2, 8, DEITY_COLORS.armorPlate], [3, 8, DEITY_COLORS.armorPlateLight], [4, 8, DEITY_COLORS.chaosDark], [5, 8, DEITY_COLORS.chaos], [6, 8, DEITY_COLORS.chaos], [7, 8, DEITY_COLORS.chaos], [8, 8, DEITY_COLORS.chaos], [9, 8, DEITY_COLORS.chaosDark], [10, 8, DEITY_COLORS.armorPlateLight], [11, 8, DEITY_COLORS.armorPlate], [12, 8, DEITY_COLORS.armor], [13, 8, DEITY_COLORS.armorDark],
  [1, 9, DEITY_COLORS.armorDark], [2, 9, DEITY_COLORS.armor], [3, 9, DEITY_COLORS.armorPlate], [4, 9, DEITY_COLORS.chaosGlow], [5, 9, DEITY_COLORS.chaos], [6, 9, DEITY_COLORS.chaosDark], [7, 9, DEITY_COLORS.chaosDark], [8, 9, DEITY_COLORS.chaos], [9, 9, DEITY_COLORS.chaosGlow], [10, 9, DEITY_COLORS.armorPlate], [11, 9, DEITY_COLORS.armor], [12, 9, DEITY_COLORS.armorDark],

  // ===== 厚重胸甲 =====
  [2, 10, DEITY_COLORS.armorDark], [3, 10, DEITY_COLORS.armor], [4, 10, DEITY_COLORS.armorPlate], [5, 10, DEITY_COLORS.chaosGlow], [6, 10, DEITY_COLORS.armorPlateLight], [7, 10, DEITY_COLORS.armorPlateLight], [8, 10, DEITY_COLORS.armorPlateLight], [9, 10, DEITY_COLORS.chaosGlow], [10, 10, DEITY_COLORS.armorPlate], [11, 10, DEITY_COLORS.armor], [12, 10, DEITY_COLORS.armorDark],
  [2, 11, DEITY_COLORS.armorDark], [3, 11, DEITY_COLORS.armorDark], [4, 11, DEITY_COLORS.armor], [5, 11, DEITY_COLORS.chaos], [6, 11, DEITY_COLORS.chaosDark], [7, 11, DEITY_COLORS.chaosDark], [8, 11, DEITY_COLORS.chaosDark], [9, 11, DEITY_COLORS.chaos], [10, 11, DEITY_COLORS.armor], [11, 11, DEITY_COLORS.armorDark], [12, 11, DEITY_COLORS.armorDark],
  [3, 12, DEITY_COLORS.armorDark], [4, 12, DEITY_COLORS.armorScratch], [5, 12, DEITY_COLORS.armor], [6, 12, DEITY_COLORS.armorRust], [7, 12, DEITY_COLORS.armorRust], [8, 12, DEITY_COLORS.armor], [9, 12, DEITY_COLORS.armorScratch], [10, 12, DEITY_COLORS.armorDark],

  // ===== 宽大腰带 =====
  [3, 13, DEITY_COLORS.belt], [4, 13, DEITY_COLORS.belt], [5, 13, DEITY_COLORS.beltGold], [6, 13, DEITY_COLORS.beltBuckle], [7, 13, DEITY_COLORS.beltBuckle], [8, 13, DEITY_COLORS.beltGold], [9, 13, DEITY_COLORS.belt], [10, 13, DEITY_COLORS.belt],

  // ===== 厚重腿甲 =====
  [4, 14, DEITY_COLORS.legArmorDark], [5, 14, DEITY_COLORS.legArmor], [6, 14, DEITY_COLORS.legArmorLight], [7, 14, DEITY_COLORS.legArmorLight], [8, 14, DEITY_COLORS.legArmor], [9, 14, DEITY_COLORS.legArmorDark],
  [4, 15, DEITY_COLORS.legArmorDark], [5, 15, DEITY_COLORS.legArmor], [6, 15, DEITY_COLORS.legArmor], [7, 15, DEITY_COLORS.legArmor], [8, 15, DEITY_COLORS.legArmor], [9, 15, DEITY_COLORS.legArmorDark],
  [4, 16, DEITY_COLORS.bootDark], [5, 16, DEITY_COLORS.boot], [6, 16, DEITY_COLORS.bootSteel], [7, 16, DEITY_COLORS.bootSteel], [8, 16, DEITY_COLORS.boot], [9, 16, DEITY_COLORS.bootDark],
  [5, 17, DEITY_COLORS.boot], [6, 17, DEITY_COLORS.bootLight], [7, 17, DEITY_COLORS.bootLight], [8, 17, DEITY_COLORS.boot],
  [5, 18, DEITY_COLORS.bootDark], [6, 18, DEITY_COLORS.boot], [7, 18, DEITY_COLORS.boot], [8, 18, DEITY_COLORS.bootDark],

  // ===== 左手（持战神之剑）=====
  [0, 8, DEITY_COLORS.gauntletDark], [1, 8, DEITY_COLORS.gauntlet],
  [0, 9, DEITY_COLORS.gauntlet], [1, 9, DEITY_COLORS.gauntletLight],
  [0, 10, DEITY_COLORS.gauntletLight], [1, 10, DEITY_COLORS.gauntlet],
  [1, 11, DEITY_COLORS.gauntletDark],
  [1, 12, DEITY_COLORS.swordHandle],
  [1, 13, DEITY_COLORS.swordGuard],
  [1, 14, DEITY_COLORS.swordHandle],
  [1, 15, DEITY_COLORS.swordDark], [2, 15, DEITY_COLORS.swordDark],
  [1, 16, DEITY_COLORS.sword], [2, 16, DEITY_COLORS.swordChaos],
  [1, 17, DEITY_COLORS.swordLight], [2, 17, DEITY_COLORS.sword],
  [2, 18, DEITY_COLORS.swordDark],
  [2, 19, DEITY_COLORS.swordRust],

  // ===== 右手（持盾）=====
  [12, 8, DEITY_COLORS.gauntlet], [13, 8, DEITY_COLORS.gauntletDark],
  [12, 9, DEITY_COLORS.gauntletLight], [13, 9, DEITY_COLORS.gauntlet],
  [12, 10, DEITY_COLORS.gauntlet], [13, 10, DEITY_COLORS.gauntletDark],
  [14, 10, DEITY_COLORS.shieldDark],
  [14, 11, DEITY_COLORS.shield],
  [14, 12, DEITY_COLORS.shieldLight],
  [14, 13, DEITY_COLORS.shieldGold],
  [14, 14, DEITY_COLORS.shieldChaos],
  [15, 14, DEITY_COLORS.shieldCrack],
  [14, 15, DEITY_COLORS.shield],
  [14, 16, DEITY_COLORS.shieldDark],

  // ===== 混沌能量和裂缝 =====
  [5, 7, DEITY_COLORS.chaosEnergy], [8, 7, DEITY_COLORS.chaosEnergy],
  [6, 18, DEITY_COLORS.chaosEnergy], [7, 18, DEITY_COLORS.chaosEnergy],
  [4, 10, DEITY_COLORS.crack], [5, 11, DEITY_COLORS.crack],
  [9, 10, DEITY_COLORS.crack], [8, 11, DEITY_COLORS.crack],
  [5, 17, DEITY_COLORS.spark], [8, 17, DEITY_COLORS.spark],
]

const DEITY_FACE_UP = [
  // ===== 厚重头盔顶部 =====
  [4, 0, DEITY_COLORS.helmDark], [5, 0, DEITY_COLORS.helmDark], [6, 0, DEITY_COLORS.helm], [7, 0, DEITY_COLORS.helm], [8, 0, DEITY_COLORS.helm], [9, 0, DEITY_COLORS.helmDark], [10, 0, DEITY_COLORS.helmDark],
  [3, 1, DEITY_COLORS.helmDark], [4, 1, DEITY_COLORS.helm], [5, 1, DEITY_COLORS.helmLight], [6, 1, DEITY_COLORS.helm], [7, 1, DEITY_COLORS.helm], [8, 1, DEITY_COLORS.helm], [9, 1, DEITY_COLORS.helmLight], [10, 1, DEITY_COLORS.helm], [11, 1, DEITY_COLORS.helmDark],
  [3, 2, DEITY_COLORS.helmDark], [4, 2, DEITY_COLORS.helm], [5, 2, DEITY_COLORS.helmLight], [6, 2, DEITY_COLORS.helm], [7, 2, DEITY_COLORS.helm], [8, 2, DEITY_COLORS.helmLight], [9, 2, DEITY_COLORS.helm], [10, 2, DEITY_COLORS.helmDark],

  // ===== 头盔背面 + 混沌侵蚀 =====
  [2, 3, DEITY_COLORS.helmDark], [3, 3, DEITY_COLORS.helm], [4, 3, DEITY_COLORS.helmDark], [5, 3, DEITY_COLORS.chaos], [6, 3, DEITY_COLORS.chaos], [7, 3, DEITY_COLORS.chaos], [8, 3, DEITY_COLORS.chaos], [9, 3, DEITY_COLORS.helmDark], [10, 3, DEITY_COLORS.helm], [11, 3, DEITY_COLORS.helmDark],
  [2, 4, DEITY_COLORS.helmDark], [3, 4, DEITY_COLORS.helm], [4, 4, DEITY_COLORS.helmDark], [5, 4, DEITY_COLORS.chaosGlow], [6, 4, DEITY_COLORS.chaos], [7, 4, DEITY_COLORS.chaos], [8, 4, DEITY_COLORS.chaosGlow], [9, 4, DEITY_COLORS.helmDark], [10, 4, DEITY_COLORS.helm], [11, 4, DEITY_COLORS.helmDark],
  [3, 5, DEITY_COLORS.helm], [4, 5, DEITY_COLORS.helmDark], [5, 5, DEITY_COLORS.chaosDark], [6, 5, DEITY_COLORS.chaosDark], [7, 5, DEITY_COLORS.chaosDark], [8, 5, DEITY_COLORS.chaosDark], [9, 5, DEITY_COLORS.helmDark], [10, 5, DEITY_COLORS.helm],

  // ===== 厚重混沌披风 =====
  [0, 6, DEITY_COLORS.capeDark], [1, 6, DEITY_COLORS.capeDark], [2, 6, DEITY_COLORS.cape], [3, 6, DEITY_COLORS.capeLight], [4, 6, DEITY_COLORS.capeChaos], [5, 6, DEITY_COLORS.chaosGlow], [6, 6, DEITY_COLORS.chaosGlow], [7, 6, DEITY_COLORS.chaosGlow], [8, 6, DEITY_COLORS.capeChaos], [9, 6, DEITY_COLORS.capeLight], [10, 6, DEITY_COLORS.cape], [11, 6, DEITY_COLORS.capeDark], [12, 6, DEITY_COLORS.capeDark],
  [0, 7, DEITY_COLORS.capeDark], [1, 7, DEITY_COLORS.cape], [2, 7, DEITY_COLORS.cape], [3, 7, DEITY_COLORS.capeLight], [4, 7, DEITY_COLORS.cape], [5, 7, DEITY_COLORS.chaosDark], [6, 7, DEITY_COLORS.chaos], [7, 7, DEITY_COLORS.chaos], [8, 7, DEITY_COLORS.chaosDark], [9, 7, DEITY_COLORS.cape], [10, 7, DEITY_COLORS.capeLight], [11, 7, DEITY_COLORS.cape], [12, 7, DEITY_COLORS.capeDark],
  [1, 8, DEITY_COLORS.capeDark], [2, 8, DEITY_COLORS.cape], [3, 8, DEITY_COLORS.capeLight], [4, 8, DEITY_COLORS.capeChaos], [5, 8, DEITY_COLORS.cape], [6, 8, DEITY_COLORS.chaosDark], [7, 8, DEITY_COLORS.chaosDark], [8, 8, DEITY_COLORS.cape], [9, 8, DEITY_COLORS.capeChaos], [10, 8, DEITY_COLORS.capeLight], [11, 8, DEITY_COLORS.cape], [12, 8, DEITY_COLORS.capeDark],
  [1, 9, DEITY_COLORS.capeDark], [2, 9, DEITY_COLORS.cape], [3, 9, DEITY_COLORS.cape], [4, 9, DEITY_COLORS.capeLight], [5, 9, DEITY_COLORS.capeChaos], [6, 9, DEITY_COLORS.cape], [7, 9, DEITY_COLORS.cape], [8, 9, DEITY_COLORS.capeChaos], [9, 9, DEITY_COLORS.capeLight], [10, 9, DEITY_COLORS.cape], [11, 9, DEITY_COLORS.capeDark],

  // ===== 背甲 + 腿 =====
  [3, 10, DEITY_COLORS.armorDark], [4, 10, DEITY_COLORS.armor], [5, 10, DEITY_COLORS.chaosGlow], [6, 10, DEITY_COLORS.armorPlateLight], [7, 10, DEITY_COLORS.armorPlateLight], [8, 10, DEITY_COLORS.chaosGlow], [9, 10, DEITY_COLORS.armor], [10, 10, DEITY_COLORS.armorDark],
  [4, 11, DEITY_COLORS.legArmorDark], [5, 11, DEITY_COLORS.legArmor], [6, 11, DEITY_COLORS.legArmorLight], [7, 11, DEITY_COLORS.legArmorLight], [8, 11, DEITY_COLORS.legArmor], [9, 11, DEITY_COLORS.legArmorDark],
  [4, 12, DEITY_COLORS.legArmorDark], [5, 12, DEITY_COLORS.legArmor], [6, 12, DEITY_COLORS.legArmor], [7, 12, DEITY_COLORS.legArmor], [8, 12, DEITY_COLORS.legArmor], [9, 12, DEITY_COLORS.legArmorDark],
  [4, 13, DEITY_COLORS.bootDark], [5, 13, DEITY_COLORS.boot], [6, 13, DEITY_COLORS.bootSteel], [7, 13, DEITY_COLORS.bootSteel], [8, 13, DEITY_COLORS.boot], [9, 13, DEITY_COLORS.bootDark],
  [5, 14, DEITY_COLORS.boot], [6, 14, DEITY_COLORS.bootLight], [7, 14, DEITY_COLORS.bootLight], [8, 14, DEITY_COLORS.boot],
  [5, 15, DEITY_COLORS.bootDark], [6, 15, DEITY_COLORS.boot], [7, 15, DEITY_COLORS.boot], [8, 15, DEITY_COLORS.bootDark],

  // ===== 武器（剑背在身后）=====
  [12, 6, DEITY_COLORS.swordDark],
  [12, 7, DEITY_COLORS.sword],
  [12, 8, DEITY_COLORS.swordLight],
  [12, 9, DEITY_COLORS.swordGuard],
  [12, 10, DEITY_COLORS.swordHandle],
  [12, 11, DEITY_COLORS.swordDark],

  // ===== 混沌能量 =====
  [6, 15, DEITY_COLORS.chaosEnergy], [7, 15, DEITY_COLORS.chaosEnergy],
]

const DEITY_FACE_LEFT = [
  // ===== 头盔侧面 =====
  [5, 0, DEITY_COLORS.helmDark], [6, 0, DEITY_COLORS.helmDark], [7, 0, DEITY_COLORS.helm],
  [4, 1, DEITY_COLORS.helmDark], [5, 1, DEITY_COLORS.helm], [6, 1, DEITY_COLORS.helmLight], [7, 1, DEITY_COLORS.chaos],
  [4, 2, DEITY_COLORS.helmDark], [5, 2, DEITY_COLORS.helmLight], [6, 2, DEITY_COLORS.helm], [7, 2, DEITY_COLORS.helmDark],

  // ===== 头盔侧面 + 混沌之眼 =====
  [3, 3, DEITY_COLORS.helmDark], [4, 3, DEITY_COLORS.helm], [5, 3, DEITY_COLORS.eyeChaos], [6, 3, DEITY_COLORS.eyeChaosGlow], [7, 3, DEITY_COLORS.helm], [8, 3, DEITY_COLORS.helmDark],
  [3, 4, DEITY_COLORS.helmDark], [4, 4, DEITY_COLORS.helmDark], [5, 4, DEITY_COLORS.eyeChaosGlow], [6, 4, DEITY_COLORS.eyeGlow], [7, 4, DEITY_COLORS.helm], [8, 4, DEITY_COLORS.helmDark],
  [3, 5, DEITY_COLORS.helm], [4, 5, DEITY_COLORS.helm], [5, 5, DEITY_COLORS.chaosDark], [6, 5, DEITY_COLORS.helm], [7, 5, DEITY_COLORS.helmDark], [8, 5, DEITY_COLORS.helmDark],

  // ===== 厚重肩甲 =====
  [2, 6, DEITY_COLORS.armorDark], [3, 6, DEITY_COLORS.armorPlate], [4, 6, DEITY_COLORS.armorPlateLight], [5, 6, DEITY_COLORS.chaos], [6, 6, DEITY_COLORS.chaosGlow], [7, 6, DEITY_COLORS.armor], [8, 6, DEITY_COLORS.armorPlate], [9, 6, DEITY_COLORS.armorDark],
  [1, 7, DEITY_COLORS.armorDark], [2, 7, DEITY_COLORS.armor], [3, 7, DEITY_COLORS.armorPlate], [4, 7, DEITY_COLORS.chaosDark], [5, 7, DEITY_COLORS.chaos], [6, 7, DEITY_COLORS.chaosDark], [7, 7, DEITY_COLORS.armorPlateLight], [8, 7, DEITY_COLORS.armor], [9, 7, DEITY_COLORS.armorDark], [10, 7, DEITY_COLORS.armorDark],
  [2, 8, DEITY_COLORS.armorDark], [3, 8, DEITY_COLORS.armor], [4, 8, DEITY_COLORS.armorPlate], [5, 8, DEITY_COLORS.chaosGlow], [6, 8, DEITY_COLORS.chaos], [7, 8, DEITY_COLORS.chaosDark], [8, 8, DEITY_COLORS.armorPlate], [9, 8, DEITY_COLORS.armor], [10, 8, DEITY_COLORS.armorDark],

  // ===== 胸甲侧面 =====
  [2, 9, DEITY_COLORS.armorDark], [3, 9, DEITY_COLORS.armorPlate], [4, 9, DEITY_COLORS.chaosGlow], [5, 9, DEITY_COLORS.chaos], [6, 9, DEITY_COLORS.chaosDark], [7, 9, DEITY_COLORS.armorPlateLight], [8, 9, DEITY_COLORS.armor], [9, 9, DEITY_COLORS.armorDark],
  [2, 10, DEITY_COLORS.armorDark], [3, 10, DEITY_COLORS.armor], [4, 10, DEITY_COLORS.chaos], [5, 10, DEITY_COLORS.chaosDark], [6, 10, DEITY_COLORS.chaosDark], [7, 10, DEITY_COLORS.chaos], [8, 10, DEITY_COLORS.armor], [9, 10, DEITY_COLORS.armorDark],
  [3, 11, DEITY_COLORS.armorScratch], [4, 11, DEITY_COLORS.armorRust], [5, 11, DEITY_COLORS.armor], [6, 11, DEITY_COLORS.armor], [7, 11, DEITY_COLORS.armor], [8, 11, DEITY_COLORS.armorRust], [9, 11, DEITY_COLORS.armorScratch],

  // ===== 宽大腰带 =====
  [3, 12, DEITY_COLORS.belt], [4, 12, DEITY_COLORS.beltGold], [5, 12, DEITY_COLORS.beltBuckle], [6, 12, DEITY_COLORS.beltGold], [7, 12, DEITY_COLORS.beltGold], [8, 12, DEITY_COLORS.belt], [9, 12, DEITY_COLORS.belt],

  // ===== 厚重腿甲 =====
  [4, 13, DEITY_COLORS.legArmorDark], [5, 13, DEITY_COLORS.legArmor], [6, 13, DEITY_COLORS.legArmorLight], [7, 13, DEITY_COLORS.legArmorLight], [8, 13, DEITY_COLORS.legArmor], [9, 13, DEITY_COLORS.legArmorDark],
  [4, 14, DEITY_COLORS.legArmorDark], [5, 14, DEITY_COLORS.legArmor], [6, 14, DEITY_COLORS.legArmor], [7, 14, DEITY_COLORS.legArmor], [8, 14, DEITY_COLORS.legArmor], [9, 14, DEITY_COLORS.legArmorDark],
  [4, 15, DEITY_COLORS.bootDark], [5, 15, DEITY_COLORS.boot], [6, 15, DEITY_COLORS.bootSteel], [7, 15, DEITY_COLORS.bootSteel], [8, 15, DEITY_COLORS.boot], [9, 15, DEITY_COLORS.bootDark],
  [5, 16, DEITY_COLORS.boot], [6, 16, DEITY_COLORS.bootLight], [7, 16, DEITY_COLORS.bootLight], [8, 16, DEITY_COLORS.boot],
  [5, 17, DEITY_COLORS.bootDark], [6, 17, DEITY_COLORS.boot], [7, 17, DEITY_COLORS.boot], [8, 17, DEITY_COLORS.bootDark],

  // ===== 左手（前伸持剑）=====
  [0, 6, DEITY_COLORS.gauntletDark],
  [0, 7, DEITY_COLORS.gauntlet], [1, 7, DEITY_COLORS.gauntletLight],
  [0, 8, DEITY_COLORS.gauntletLight], [1, 8, DEITY_COLORS.swordHandle],
  [0, 9, DEITY_COLORS.gauntlet], [1, 9, DEITY_COLORS.swordGuard],
  [0, 10, DEITY_COLORS.gauntletDark], [1, 10, DEITY_COLORS.swordHandle],
  [1, 11, DEITY_COLORS.swordDark], [2, 11, DEITY_COLORS.swordDark],
  [1, 12, DEITY_COLORS.sword], [2, 12, DEITY_COLORS.swordChaos],
  [1, 13, DEITY_COLORS.swordLight], [2, 13, DEITY_COLORS.sword],
  [2, 14, DEITY_COLORS.swordDark], [3, 14, DEITY_COLORS.swordRust],

  // ===== 右手（盾在身后）=====
  [9, 8, DEITY_COLORS.gauntlet], [10, 8, DEITY_COLORS.gauntletDark],
  [9, 9, DEITY_COLORS.gauntletLight], [10, 9, DEITY_COLORS.gauntlet],
  [10, 10, DEITY_COLORS.shieldDark],
  [10, 11, DEITY_COLORS.shield],
  [10, 12, DEITY_COLORS.shieldLight],
  [10, 13, DEITY_COLORS.shieldGold],
  [10, 14, DEITY_COLORS.shieldChaos],
  [10, 15, DEITY_COLORS.shield],
  [10, 16, DEITY_COLORS.shieldDark],

  // ===== 混沌能量 =====
  [6, 17, DEITY_COLORS.chaosEnergy],
  [5, 17, DEITY_COLORS.spark],
]

const DEITY_FACE_RIGHT = [
  // ===== 头盔侧面 =====
  [5, 0, DEITY_COLORS.helm], [6, 0, DEITY_COLORS.helmDark], [7, 0, DEITY_COLORS.helmDark],
  [5, 1, DEITY_COLORS.chaos], [6, 1, DEITY_COLORS.helmLight], [7, 1, DEITY_COLORS.helm], [8, 1, DEITY_COLORS.helmDark],
  [5, 2, DEITY_COLORS.helmDark], [6, 2, DEITY_COLORS.helm], [7, 2, DEITY_COLORS.helmLight], [8, 2, DEITY_COLORS.helmDark],

  // ===== 头盔侧面 + 混沌之眼 =====
  [4, 3, DEITY_COLORS.helmDark], [5, 3, DEITY_COLORS.helm], [6, 3, DEITY_COLORS.eyeChaosGlow], [7, 3, DEITY_COLORS.eyeChaos], [8, 3, DEITY_COLORS.helm], [9, 3, DEITY_COLORS.helmDark],
  [4, 4, DEITY_COLORS.helmDark], [5, 4, DEITY_COLORS.helm], [6, 4, DEITY_COLORS.eyeGlow], [7, 4, DEITY_COLORS.eyeChaosGlow], [8, 4, DEITY_COLORS.helmDark], [9, 4, DEITY_COLORS.helmDark],
  [4, 5, DEITY_COLORS.helmDark], [5, 5, DEITY_COLORS.helmDark], [6, 5, DEITY_COLORS.helm], [7, 5, DEITY_COLORS.chaosDark], [8, 5, DEITY_COLORS.helm], [9, 5, DEITY_COLORS.helm],

  // ===== 厚重肩甲 =====
  [4, 6, DEITY_COLORS.armorDark], [5, 6, DEITY_COLORS.armorPlate], [6, 6, DEITY_COLORS.armor], [7, 6, DEITY_COLORS.chaosGlow], [8, 6, DEITY_COLORS.chaos], [9, 6, DEITY_COLORS.armorPlateLight], [10, 6, DEITY_COLORS.armorPlate], [11, 6, DEITY_COLORS.armorDark],
  [3, 7, DEITY_COLORS.armorDark], [4, 7, DEITY_COLORS.armorDark], [5, 7, DEITY_COLORS.armor], [6, 7, DEITY_COLORS.armorPlateLight], [7, 7, DEITY_COLORS.chaosDark], [8, 7, DEITY_COLORS.chaos], [9, 7, DEITY_COLORS.chaosDark], [10, 7, DEITY_COLORS.armorPlate], [11, 7, DEITY_COLORS.armor], [12, 7, DEITY_COLORS.armorDark],
  [3, 8, DEITY_COLORS.armorDark], [4, 8, DEITY_COLORS.armor], [5, 8, DEITY_COLORS.armorPlate], [6, 8, DEITY_COLORS.chaosDark], [7, 8, DEITY_COLORS.chaos], [8, 8, DEITY_COLORS.chaosGlow], [9, 8, DEITY_COLORS.armorPlate], [10, 8, DEITY_COLORS.armor], [11, 8, DEITY_COLORS.armorDark],

  // ===== 胸甲侧面 =====
  [4, 9, DEITY_COLORS.armorDark], [5, 9, DEITY_COLORS.armor], [6, 9, DEITY_COLORS.armorPlateLight], [7, 9, DEITY_COLORS.chaosDark], [8, 9, DEITY_COLORS.chaos], [9, 9, DEITY_COLORS.chaosGlow], [10, 9, DEITY_COLORS.armorPlate], [11, 9, DEITY_COLORS.armorDark],
  [4, 10, DEITY_COLORS.armorDark], [5, 10, DEITY_COLORS.armor], [6, 10, DEITY_COLORS.chaosDark], [7, 10, DEITY_COLORS.chaosDark], [8, 10, DEITY_COLORS.chaos], [9, 10, DEITY_COLORS.chaosGlow], [10, 10, DEITY_COLORS.armor], [11, 10, DEITY_COLORS.armorDark],
  [4, 11, DEITY_COLORS.armorScratch], [5, 11, DEITY_COLORS.armorRust], [6, 11, DEITY_COLORS.armor], [7, 11, DEITY_COLORS.armor], [8, 11, DEITY_COLORS.armor], [9, 11, DEITY_COLORS.armorRust], [10, 11, DEITY_COLORS.armorScratch],

  // ===== 宽大腰带 =====
  [4, 12, DEITY_COLORS.belt], [5, 12, DEITY_COLORS.belt], [6, 12, DEITY_COLORS.beltGold], [7, 12, DEITY_COLORS.beltBuckle], [8, 12, DEITY_COLORS.beltGold], [9, 12, DEITY_COLORS.beltGold], [10, 12, DEITY_COLORS.belt],

  // ===== 厚重腿甲 =====
  [4, 13, DEITY_COLORS.legArmorDark], [5, 13, DEITY_COLORS.legArmor], [6, 13, DEITY_COLORS.legArmorLight], [7, 13, DEITY_COLORS.legArmorLight], [8, 13, DEITY_COLORS.legArmor], [9, 13, DEITY_COLORS.legArmorDark],
  [4, 14, DEITY_COLORS.legArmorDark], [5, 14, DEITY_COLORS.legArmor], [6, 14, DEITY_COLORS.legArmor], [7, 14, DEITY_COLORS.legArmor], [8, 14, DEITY_COLORS.legArmor], [9, 14, DEITY_COLORS.legArmorDark],
  [4, 15, DEITY_COLORS.bootDark], [5, 15, DEITY_COLORS.boot], [6, 15, DEITY_COLORS.bootSteel], [7, 15, DEITY_COLORS.bootSteel], [8, 15, DEITY_COLORS.boot], [9, 15, DEITY_COLORS.bootDark],
  [4, 16, DEITY_COLORS.boot], [5, 16, DEITY_COLORS.bootLight], [6, 16, DEITY_COLORS.bootLight], [7, 16, DEITY_COLORS.boot],
  [4, 17, DEITY_COLORS.bootDark], [5, 17, DEITY_COLORS.boot], [6, 17, DEITY_COLORS.boot], [7, 17, DEITY_COLORS.bootDark],

  // ===== 左手（盾在身后）=====
  [2, 8, DEITY_COLORS.shieldDark],
  [2, 9, DEITY_COLORS.shield],
  [2, 10, DEITY_COLORS.shieldLight],
  [2, 11, DEITY_COLORS.shieldGold],
  [2, 12, DEITY_COLORS.shieldChaos],
  [2, 13, DEITY_COLORS.shield],
  [2, 14, DEITY_COLORS.shieldDark],
  [3, 8, DEITY_COLORS.gauntletDark], [4, 8, DEITY_COLORS.gauntlet],
  [3, 9, DEITY_COLORS.gauntlet], [4, 9, DEITY_COLORS.gauntletLight],

  // ===== 右手（前伸持剑）=====
  [11, 6, DEITY_COLORS.gauntlet],
  [12, 7, DEITY_COLORS.swordHandle], [13, 7, DEITY_COLORS.gauntletLight],
  [12, 8, DEITY_COLORS.swordGuard], [13, 8, DEITY_COLORS.gauntlet],
  [12, 9, DEITY_COLORS.swordHandle], [13, 9, DEITY_COLORS.gauntletDark],
  [12, 10, DEITY_COLORS.swordDark], [13, 10, DEITY_COLORS.swordDark],
  [13, 11, DEITY_COLORS.swordChaos], [14, 11, DEITY_COLORS.sword],
  [13, 12, DEITY_COLORS.sword], [14, 12, DEITY_COLORS.swordLight],
  [14, 13, DEITY_COLORS.swordDark], [15, 13, DEITY_COLORS.swordRust],

  // ===== 混沌能量 =====
  [6, 17, DEITY_COLORS.chaosEnergy],
  [7, 17, DEITY_COLORS.spark],
]

const DEITY_IDLE_FRAMES = [
  [
    { pixels: [
      [5, 4, DEITY_COLORS.eyeChaos], [6, 4, DEITY_COLORS.eyeChaos], [7, 4, DEITY_COLORS.eyeChaos], [8, 4, DEITY_COLORS.eyeChaos],
      [5, 3, DEITY_COLORS.chaos], [6, 3, DEITY_COLORS.chaos], [7, 3, DEITY_COLORS.chaos], [8, 3, DEITY_COLORS.chaos],
      [5, 7, DEITY_COLORS.chaos], [8, 7, DEITY_COLORS.chaos],
      [6, 18, DEITY_COLORS.chaosEnergy], [7, 18, DEITY_COLORS.chaosEnergy],
    ] }
  ],
  [
    { pixels: [
      [5, 4, DEITY_COLORS.eyeChaosGlow], [6, 4, DEITY_COLORS.eyeChaosGlow], [7, 4, DEITY_COLORS.eyeChaosGlow], [8, 4, DEITY_COLORS.eyeChaosGlow],
      [5, 3, DEITY_COLORS.chaosGlow], [6, 3, DEITY_COLORS.chaosGlow], [7, 3, DEITY_COLORS.chaosGlow], [8, 3, DEITY_COLORS.chaosGlow],
      [5, 7, DEITY_COLORS.chaosGlow], [8, 7, DEITY_COLORS.chaosGlow],
      [6, 18, DEITY_COLORS.chaosEnergyGlow], [7, 18, DEITY_COLORS.chaosEnergyGlow],
      [5, 17, DEITY_COLORS.sparkWhite], [8, 17, DEITY_COLORS.sparkWhite],
    ] }
  ],
]

const DEITY_WALK_FRAMES = [
  [
    { pixels: [
      [5, 17, DEITY_COLORS.bootDark], [6, 17, DEITY_COLORS.boot], [7, 17, DEITY_COLORS.bootDark], [8, 17, DEITY_COLORS.boot],
    ] }
  ],
  [
    { pixels: [
      [5, 17, DEITY_COLORS.boot], [6, 17, DEITY_COLORS.bootDark], [7, 17, DEITY_COLORS.bootDark], [8, 17, DEITY_COLORS.boot],
    ] }
  ],
  [
    { pixels: [
      [5, 17, DEITY_COLORS.boot], [6, 17, DEITY_COLORS.boot], [7, 17, DEITY_COLORS.bootDark], [8, 17, DEITY_COLORS.bootDark],
    ] }
  ],
]

export const drawChaosDeity = (canvasRef, currentUnit) => {
  if (!canvasRef) return
  const ctx = canvasRef.getContext('2d')
  const x = currentUnit.x
  const y = currentUnit.y
  const unit = currentUnit.size / 18
  const direction = currentUnit.direction || 'down'
  const frame = currentUnit.frame || 0

  ctx.imageSmoothingEnabled = false

  const drawPixel = (px, py, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x + px * unit, y + py * unit, unit, unit)
  }

  let basePixels = DEITY_FACE_DOWN
  if (direction === 'up') basePixels = DEITY_FACE_UP
  else if (direction === 'left') basePixels = DEITY_FACE_LEFT
  else if (direction === 'right') basePixels = DEITY_FACE_RIGHT

  for (let i = 0; i < basePixels.length; i++) {
    drawPixel(basePixels[i][0], basePixels[i][1], basePixels[i][2])
  }

  const isMoving = currentUnit.isMoving || false
  const frames = isMoving ? DEITY_WALK_FRAMES : DEITY_IDLE_FRAMES
  const frameIndex = Math.floor(frame) % frames.length
  const currentFrame = frames[frameIndex]

  for (const layer of currentFrame) {
    for (const pixel of layer.pixels) {
      drawPixel(pixel[0], pixel[1], pixel[2])
    }
  }
}