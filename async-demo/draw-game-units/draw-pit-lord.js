/**
 * 绘制深渊魔王怪物 - 克苏鲁系非人形态，突出眼睛主题
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit 深渊魔王位置和状态
 * @param {Number} currentUnit.x 深渊魔王x坐标
 * @param {Number} currentUnit.y 深渊魔王y坐标
 * @param {Number} currentUnit.size 深渊魔王大小(px)
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

export const config = {
  IDLE_SPEED: 0.006,
  WALK_SPEED: 0.08,
}

// 克苏鲁系深渊魔王颜色（肉色/触手/发光眼睛）
const LORD_COLORS = {
  // 主体肉色
  flesh: '#3A2A3A',         // 肉色主体 - 暗紫灰
  fleshDark: '#2A1A2A',     // 肉色暗
  fleshLight: '#4A3A4A',   // 肉色亮
  fleshMid: '#352535',      // 肉色中间
  // 眼睛
  eyeWhite: '#E8D8D8',     // 眼白
  eyeWhiteDark: '#C8B8B8', // 眼白暗
  eyeWhiteLight: '#FFF0F0', // 眼白亮
  // 瞳孔 - 发光紫红
  pupil: '#9933FF',          // 瞳孔 - 深渊紫
  pupilGlow: '#BB55FF',     // 瞳孔发光
  pupilDark: '#6600DD',     // 瞳孔暗
  pupilCore: '#FF00FF',      // 瞳孔核心 - 品红
  // 触手
  tentacle: '#2A1A2A',     // 触手主色
  tentacleLight: '#3A2A3A', // 触手亮
  tentacleDark: '#1A0A1A',  // 触手暗
  tentacleTip: '#6600CC',   // 触手尖 - 发光紫
  tentacleSuction: '#4A3A4A', // 触手吸盘
  // 黏液
  slime: '#3A1A3A',         // 黏液
  slimeLight: '#5A2A5A',   // 黏液亮
  slimeGlow: '#7733AA',     // 黏液发光
  // 深渊能量
  abyss: '#5500AA',          // 深渊
  abyssGlow: '#7733CC',    // 深渊发光
  abyssLight: '#9944DD',    // 深渊亮
  // 粒子
  particle: '#8833EE',     // 粒子
  particleLight: '#AA55FF', // 粒子亮
  spark: '#FF00FF',        // 火花 - 品红
  // 其他
  vein: '#4A2A4A',          // 血管
  veinGlow: '#6622AA',     // 血管发光
  highlight: '#FFFFFF',          // 高光
}

// 深渊魔王高精度头像（16x16网格，聚焦克苏鲁大眼特写）
const LORD_AVATAR = [
  // ===== 顶部触手 =====
  [4, 0, LORD_COLORS.tentacleDark], [5, 0, LORD_COLORS.tentacle], [6, 0, LORD_COLORS.tentacleLight], [7, 0, LORD_COLORS.tentacleTip], [8, 0, LORD_COLORS.tentacleTip], [9, 0, LORD_COLORS.tentacleLight], [10, 0, LORD_COLORS.tentacle], [11, 0, LORD_COLORS.tentacleDark],
  [3, 1, LORD_COLORS.tentacle], [4, 1, LORD_COLORS.tentacleLight], [5, 1, LORD_COLORS.tentacle], [6, 1, LORD_COLORS.tentacleTip], [7, 1, LORD_COLORS.tentacleSuction], [8, 1, LORD_COLORS.tentacleSuction], [9, 1, LORD_COLORS.tentacleTip], [10, 1, LORD_COLORS.tentacle], [11, 1, LORD_COLORS.tentacleLight], [12, 1, LORD_COLORS.tentacle],
  [3, 2, LORD_COLORS.tentacleDark], [4, 2, LORD_COLORS.tentacle], [5, 2, LORD_COLORS.tentacleLight], [6, 2, LORD_COLORS.tentacle], [7, 2, LORD_COLORS.tentacleTip], [8, 2, LORD_COLORS.tentacleTip], [9, 2, LORD_COLORS.tentacle], [10, 2, LORD_COLORS.tentacleLight], [11, 2, LORD_COLORS.tentacle], [12, 2, LORD_COLORS.tentacleDark],

  // ===== 主眼睛（中心大眼）=====
  [2, 3, LORD_COLORS.fleshDark], [3, 3, LORD_COLORS.flesh], [4, 3, LORD_COLORS.eyeWhite], [5, 3, LORD_COLORS.eyeWhite], [6, 3, LORD_COLORS.eyeWhite], [7, 3, LORD_COLORS.eyeWhite], [8, 3, LORD_COLORS.eyeWhite], [9, 3, LORD_COLORS.eyeWhite], [10, 3, LORD_COLORS.eyeWhite], [11, 3, LORD_COLORS.eyeWhite], [12, 3, LORD_COLORS.flesh], [13, 3, LORD_COLORS.fleshDark],
  [2, 4, LORD_COLORS.flesh], [3, 4, LORD_COLORS.eyeWhiteDark], [4, 4, LORD_COLORS.eyeWhite], [5, 4, LORD_COLORS.pupil], [6, 4, LORD_COLORS.pupilGlow], [7, 4, LORD_COLORS.pupilCore], [8, 4, LORD_COLORS.pupilCore], [9, 4, LORD_COLORS.pupilGlow], [10, 4, LORD_COLORS.pupil], [11, 4, LORD_COLORS.eyeWhite], [12, 4, LORD_COLORS.eyeWhiteDark], [13, 4, LORD_COLORS.flesh],
  // 眼睛高光
  [5, 3, LORD_COLORS.highlight], [6, 3, LORD_COLORS.highlight], [9, 3, LORD_COLORS.highlight], [10, 3, LORD_COLORS.highlight],
  [5, 4, LORD_COLORS.highlight], [10, 4, LORD_COLORS.highlight],

  // ===== 眼睛发光效果 =====
  [5, 4, LORD_COLORS.pupilGlow], [6, 4, LORD_COLORS.pupilGlow], [9, 4, LORD_COLORS.pupilGlow], [10, 4, LORD_COLORS.pupilGlow],
  [5, 5, LORD_COLORS.pupilCore], [6, 5, LORD_COLORS.pupilCore], [9, 5, LORD_COLORS.pupilCore], [10, 5, LORD_COLORS.pupilCore],

  [2, 5, LORD_COLORS.fleshDark], [3, 5, LORD_COLORS.eyeWhite], [4, 5, LORD_COLORS.eyeWhite], [5, 5, LORD_COLORS.pupilGlow], [6, 5, LORD_COLORS.pupilCore], [7, 5, LORD_COLORS.pupilGlow], [8, 5, LORD_COLORS.pupilGlow], [9, 5, LORD_COLORS.pupilCore], [10, 5, LORD_COLORS.pupilGlow], [11, 5, LORD_COLORS.eyeWhite], [12, 5, LORD_COLORS.eyeWhite], [13, 5, LORD_COLORS.fleshDark],
  [2, 6, LORD_COLORS.flesh], [3, 6, LORD_COLORS.eyeWhiteDark], [4, 6, LORD_COLORS.eyeWhite], [5, 6, LORD_COLORS.pupil], [6, 6, LORD_COLORS.pupilGlow], [7, 6, LORD_COLORS.pupil], [8, 6, LORD_COLORS.pupil], [9, 6, LORD_COLORS.pupilGlow], [10, 6, LORD_COLORS.pupil], [11, 6, LORD_COLORS.eyeWhite], [12, 6, LORD_COLORS.eyeWhiteDark], [13, 6, LORD_COLORS.flesh],
  [3, 7, LORD_COLORS.fleshDark], [4, 7, LORD_COLORS.fleshMid], [5, 7, LORD_COLORS.eyeWhiteDark], [6, 7, LORD_COLORS.pupilGlow], [7, 7, LORD_COLORS.pupilCore], [8, 7, LORD_COLORS.pupilCore], [9, 7, LORD_COLORS.pupilGlow], [10, 7, LORD_COLORS.eyeWhiteDark], [11, 7, LORD_COLORS.fleshMid], [12, 7, LORD_COLORS.fleshDark],

  // ===== 小眼睛群 =====
  [5, 8, LORD_COLORS.eyeWhiteDark], [6, 8, LORD_COLORS.eyeWhite], [7, 8, LORD_COLORS.pupilGlow], [8, 8, LORD_COLORS.eyeWhite], [9, 8, LORD_COLORS.eyeWhiteDark],
  [5, 9, LORD_COLORS.eyeWhite], [6, 9, LORD_COLORS.pupil], [7, 9, LORD_COLORS.pupilGlow], [8, 9, LORD_COLORS.pupil], [9, 9, LORD_COLORS.eyeWhite],
  [5, 10, LORD_COLORS.eyeWhiteDark], [6, 10, LORD_COLORS.eyeWhite], [7, 10, LORD_COLORS.pupil], [8, 10, LORD_COLORS.eyeWhite], [9, 10, LORD_COLORS.eyeWhiteDark],

  // ===== 主体肉块 + 触手 =====
  [2, 8, LORD_COLORS.tentacleDark], [3, 8, LORD_COLORS.tentacle], [4, 8, LORD_COLORS.fleshMid], [10, 8, LORD_COLORS.fleshMid], [11, 8, LORD_COLORS.tentacle], [12, 8, LORD_COLORS.tentacleDark],
  [2, 9, LORD_COLORS.tentacle], [3, 9, LORD_COLORS.tentacleLight], [4, 9, LORD_COLORS.tentacleSuction], [10, 9, LORD_COLORS.tentacleSuction], [11, 9, LORD_COLORS.tentacleLight], [12, 9, LORD_COLORS.tentacle],
  [3, 10, LORD_COLORS.tentacleDark], [4, 10, LORD_COLORS.tentacle], [5, 10, LORD_COLORS.tentacleTip], [6, 10, LORD_COLORS.slimeGlow], [7, 10, LORD_COLORS.slimeGlow], [8, 10, LORD_COLORS.slimeGlow], [9, 10, LORD_COLORS.tentacleTip], [10, 10, LORD_COLORS.tentacle], [11, 10, LORD_COLORS.tentacleDark],

  // ===== 底部触手 =====
  [3, 11, LORD_COLORS.tentacle], [4, 11, LORD_COLORS.tentacleLight], [5, 11, LORD_COLORS.tentacleTip], [6, 11, LORD_COLORS.slimeGlow], [7, 11, LORD_COLORS.tentacleTip], [8, 11, LORD_COLORS.slimeGlow], [9, 11, LORD_COLORS.tentacleTip], [10, 11, LORD_COLORS.tentacleLight], [11, 11, LORD_COLORS.tentacle],
  [4, 12, LORD_COLORS.tentacleDark], [5, 12, LORD_COLORS.tentacle], [6, 12, LORD_COLORS.slimeGlow], [7, 12, LORD_COLORS.tentacleTip], [8, 12, LORD_COLORS.tentacleTip], [9, 12, LORD_COLORS.slimeGlow], [10, 12, LORD_COLORS.tentacle], [11, 12, LORD_COLORS.tentacleDark],

  // ===== 漂浮粒子 =====
  [0, 5, LORD_COLORS.particle], [1, 7, LORD_COLORS.particleLight], [14, 5, LORD_COLORS.particle], [13, 7, LORD_COLORS.particleLight],
  [0, 6, LORD_COLORS.spark], [14, 6, LORD_COLORS.spark],
]

// 向下面朝 - 正面（克苏鲁大眼怪正面）
const LORD_FACE_DOWN = [
  // ===== 顶部触手 =====
  [5, 0, LORD_COLORS.tentacle], [6, 0, LORD_COLORS.tentacleLight], [7, 0, LORD_COLORS.tentacleTip], [8, 0, LORD_COLORS.tentacleTip], [9, 0, LORD_COLORS.tentacleLight], [10, 0, LORD_COLORS.tentacle],
  [4, 1, LORD_COLORS.tentacleDark], [5, 1, LORD_COLORS.tentacle], [6, 1, LORD_COLORS.tentacleLight], [7, 1, LORD_COLORS.tentacleTip], [8, 1, LORD_COLORS.tentacleTip], [9, 1, LORD_COLORS.tentacleLight], [10, 1, LORD_COLORS.tentacle], [11, 1, LORD_COLORS.tentacleDark],
  [4, 2, LORD_COLORS.tentacle], [5, 2, LORD_COLORS.tentacleLight], [6, 2, LORD_COLORS.tentacle], [7, 2, LORD_COLORS.tentacleSuction], [8, 2, LORD_COLORS.tentacleSuction], [9, 2, LORD_COLORS.tentacle], [10, 2, LORD_COLORS.tentacleLight], [11, 2, LORD_COLORS.tentacle],

  // ===== 主眼睛（中心大眼）=====
  [4, 3, LORD_COLORS.eyeWhiteDark], [5, 3, LORD_COLORS.eyeWhite], [6, 3, LORD_COLORS.eyeWhite], [7, 3, LORD_COLORS.eyeWhite], [8, 3, LORD_COLORS.eyeWhite], [9, 3, LORD_COLORS.eyeWhite], [10, 3, LORD_COLORS.eyeWhite], [11, 3, LORD_COLORS.eyeWhiteDark],
  [4, 4, LORD_COLORS.eyeWhite], [5, 4, LORD_COLORS.pupil], [6, 4, LORD_COLORS.pupilGlow], [7, 4, LORD_COLORS.pupilCore], [8, 4, LORD_COLORS.pupilCore], [9, 4, LORD_COLORS.pupilGlow], [10, 4, LORD_COLORS.pupil], [11, 4, LORD_COLORS.eyeWhite],
  [4, 5, LORD_COLORS.eyeWhite], [5, 5, LORD_COLORS.pupilGlow], [6, 5, LORD_COLORS.pupilCore], [7, 5, LORD_COLORS.pupilGlow], [8, 5, LORD_COLORS.pupilGlow], [9, 5, LORD_COLORS.pupilCore], [10, 5, LORD_COLORS.pupilGlow], [11, 5, LORD_COLORS.eyeWhite],
  [4, 6, LORD_COLORS.eyeWhiteDark], [5, 6, LORD_COLORS.pupil], [6, 6, LORD_COLORS.pupilGlow], [7, 6, LORD_COLORS.pupil], [8, 6, LORD_COLORS.pupil], [9, 6, LORD_COLORS.pupilGlow], [10, 6, LORD_COLORS.pupil], [11, 6, LORD_COLORS.eyeWhiteDark],

  // ===== 主体肉块 =====
  [2, 4, LORD_COLORS.fleshDark], [3, 4, LORD_COLORS.flesh], [12, 4, LORD_COLORS.flesh], [13, 4, LORD_COLORS.fleshDark],
  [2, 5, LORD_COLORS.flesh], [3, 5, LORD_COLORS.fleshLight], [12, 5, LORD_COLORS.fleshLight], [13, 5, LORD_COLORS.flesh],
  [2, 6, LORD_COLORS.fleshDark], [3, 6, LORD_COLORS.fleshMid], [12, 6, LORD_COLORS.fleshMid], [13, 6, LORD_COLORS.fleshDark],
  [3, 7, LORD_COLORS.fleshDark], [4, 7, LORD_COLORS.fleshMid], [11, 7, LORD_COLORS.fleshMid], [12, 7, LORD_COLORS.fleshDark],

  // ===== 小眼睛群 =====
  [5, 7, LORD_COLORS.eyeWhiteDark], [6, 7, LORD_COLORS.eyeWhite], [7, 7, LORD_COLORS.pupilGlow], [8, 7, LORD_COLORS.eyeWhite], [9, 7, LORD_COLORS.eyeWhiteDark],
  [5, 8, LORD_COLORS.eyeWhite], [6, 8, LORD_COLORS.pupil], [7, 8, LORD_COLORS.pupilGlow], [8, 8, LORD_COLORS.pupil], [9, 8, LORD_COLORS.eyeWhite],
  [5, 9, LORD_COLORS.eyeWhiteDark], [6, 9, LORD_COLORS.eyeWhite], [7, 9, LORD_COLORS.pupil], [8, 9, LORD_COLORS.eyeWhite], [9, 9, LORD_COLORS.eyeWhiteDark],

  // ===== 底部触手 =====
  [3, 8, LORD_COLORS.tentacleDark], [4, 8, LORD_COLORS.tentacle], [10, 8, LORD_COLORS.tentacle], [11, 8, LORD_COLORS.tentacleDark],
  [3, 9, LORD_COLORS.tentacle], [4, 9, LORD_COLORS.tentacleLight], [5, 9, LORD_COLORS.tentacleSuction], [10, 9, LORD_COLORS.tentacleSuction], [11, 9, LORD_COLORS.tentacleLight], [12, 9, LORD_COLORS.tentacle],
  [2, 10, LORD_COLORS.tentacleDark], [3, 10, LORD_COLORS.tentacle], [4, 10, LORD_COLORS.tentacleLight], [5, 10, LORD_COLORS.tentacleTip], [10, 10, LORD_COLORS.tentacleTip], [11, 10, LORD_COLORS.tentacleLight], [12, 10, LORD_COLORS.tentacle], [13, 10, LORD_COLORS.tentacleDark],
  [2, 11, LORD_COLORS.tentacle], [3, 11, LORD_COLORS.tentacleLight], [4, 11, LORD_COLORS.tentacle], [5, 11, LORD_COLORS.tentacleTip], [10, 11, LORD_COLORS.tentacleTip], [11, 11, LORD_COLORS.tentacle], [12, 11, LORD_COLORS.tentacleLight], [13, 11, LORD_COLORS.tentacle],
  [3, 12, LORD_COLORS.tentacleDark], [4, 12, LORD_COLORS.tentacleLight], [5, 12, LORD_COLORS.tentacle], [6, 12, LORD_COLORS.tentacleTip], [7, 12, LORD_COLORS.tentacleTip], [8, 12, LORD_COLORS.tentacleTip], [9, 12, LORD_COLORS.tentacleTip], [10, 12, LORD_COLORS.tentacle], [11, 12, LORD_COLORS.tentacleLight], [12, 12, LORD_COLORS.tentacleDark],
  [4, 13, LORD_COLORS.tentacle], [5, 13, LORD_COLORS.tentacleLight], [6, 13, LORD_COLORS.tentacle], [7, 13, LORD_COLORS.slimeGlow], [8, 13, LORD_COLORS.slimeGlow], [9, 13, LORD_COLORS.tentacle], [10, 13, LORD_COLORS.tentacleLight], [11, 13, LORD_COLORS.tentacle],

  // ===== 漂浮粒子 =====
  [0, 5, LORD_COLORS.particle], [14, 5, LORD_COLORS.particle],
  [1, 7, LORD_COLORS.particleLight], [13, 7, LORD_COLORS.particleLight],
  [6, 0, LORD_COLORS.abyssGlow], [8, 0, LORD_COLORS.abyssGlow],
]

// 向上面朝 - 背面
const LORD_FACE_UP = [
  // ===== 顶部触手 =====
  [5, 0, LORD_COLORS.tentacle], [6, 0, LORD_COLORS.tentacleLight], [7, 0, LORD_COLORS.tentacleTip], [8, 0, LORD_COLORS.tentacleTip], [9, 0, LORD_COLORS.tentacleLight], [10, 0, LORD_COLORS.tentacle],
  [4, 1, LORD_COLORS.tentacleDark], [5, 1, LORD_COLORS.tentacle], [6, 1, LORD_COLORS.tentacleLight], [7, 1, LORD_COLORS.tentacleTip], [8, 1, LORD_COLORS.tentacleTip], [9, 1, LORD_COLORS.tentacleLight], [10, 1, LORD_COLORS.tentacle], [11, 1, LORD_COLORS.tentacleDark],
  [4, 2, LORD_COLORS.tentacle], [5, 2, LORD_COLORS.tentacleLight], [6, 2, LORD_COLORS.tentacleSuction], [7, 2, LORD_COLORS.tentacleSuction], [8, 2, LORD_COLORS.tentacleSuction], [9, 2, LORD_COLORS.tentacleLight], [10, 2, LORD_COLORS.tentacle],

  // ===== 背面主体纹理 ======
  [3, 3, LORD_COLORS.fleshDark], [4, 3, LORD_COLORS.flesh], [5, 3, LORD_COLORS.fleshMid], [6, 3, LORD_COLORS.vein], [7, 3, LORD_COLORS.vein], [8, 3, LORD_COLORS.fleshMid], [9, 3, LORD_COLORS.flesh], [10, 3, LORD_COLORS.fleshDark],
  [2, 4, LORD_COLORS.fleshDark], [3, 4, LORD_COLORS.flesh], [4, 4, LORD_COLORS.vein], [5, 4, LORD_COLORS.fleshMid], [6, 4, LORD_COLORS.veinGlow], [7, 4, LORD_COLORS.veinGlow], [8, 4, LORD_COLORS.fleshMid], [9, 4, LORD_COLORS.vein], [10, 4, LORD_COLORS.flesh], [11, 4, LORD_COLORS.fleshDark],
  [2, 5, LORD_COLORS.flesh], [3, 5, LORD_COLORS.fleshLight], [4, 5, LORD_COLORS.fleshMid], [5, 5, LORD_COLORS.vein], [6, 5, LORD_COLORS.slime], [7, 5, LORD_COLORS.slime], [8, 5, LORD_COLORS.vein], [9, 5, LORD_COLORS.fleshMid], [10, 5, LORD_COLORS.fleshLight], [11, 5, LORD_COLORS.flesh],
  [2, 6, LORD_COLORS.fleshDark], [3, 6, LORD_COLORS.fleshMid], [4, 6, LORD_COLORS.slime], [5, 6, LORD_COLORS.vein], [6, 6, LORD_COLORS.slimeLight], [7, 6, LORD_COLORS.slimeLight], [8, 6, LORD_COLORS.vein], [9, 6, LORD_COLORS.slime], [10, 6, LORD_COLORS.fleshMid], [11, 6, LORD_COLORS.fleshDark],
  [3, 7, LORD_COLORS.fleshDark], [4, 7, LORD_COLORS.flesh], [5, 7, LORD_COLORS.fleshLight], [6, 7, LORD_COLORS.vein], [7, 7, LORD_COLORS.vein], [8, 7, LORD_COLORS.fleshLight], [9, 7, LORD_COLORS.flesh], [10, 7, LORD_COLORS.fleshDark],
  [3, 8, LORD_COLORS.fleshDark], [4, 8, LORD_COLORS.fleshMid], [5, 8, LORD_COLORS.vein], [6, 8, LORD_COLORS.fleshMid], [7, 8, LORD_COLORS.fleshMid], [8, 8, LORD_COLORS.vein], [9, 8, LORD_COLORS.fleshMid], [10, 8, LORD_COLORS.fleshDark],

  // ===== 小眼睛群（背面也能看到一些）=====
  [5, 6, LORD_COLORS.eyeWhiteDark], [6, 6, LORD_COLORS.eyeWhite], [7, 6, LORD_COLORS.pupilGlow], [8, 6, LORD_COLORS.eyeWhite], [9, 6, LORD_COLORS.eyeWhiteDark],

  // ===== 底部触手 =====
  [3, 9, LORD_COLORS.tentacleDark], [4, 9, LORD_COLORS.tentacle], [5, 9, LORD_COLORS.tentacleLight], [6, 9, LORD_COLORS.tentacleTip], [7, 9, LORD_COLORS.tentacleTip], [8, 9, LORD_COLORS.tentacleTip], [9, 9, LORD_COLORS.tentacleLight], [10, 9, LORD_COLORS.tentacle], [11, 9, LORD_COLORS.tentacleDark],
  [2, 10, LORD_COLORS.tentacle], [3, 10, LORD_COLORS.tentacleLight], [4, 10, LORD_COLORS.tentacle], [5, 10, LORD_COLORS.tentacleTip], [6, 10, LORD_COLORS.tentacleSuction], [7, 10, LORD_COLORS.slimeGlow], [8, 10, LORD_COLORS.tentacleSuction], [9, 10, LORD_COLORS.tentacleTip], [10, 10, LORD_COLORS.tentacle], [11, 10, LORD_COLORS.tentacleLight], [12, 10, LORD_COLORS.tentacle],
  [2, 11, LORD_COLORS.tentacleDark], [3, 11, LORD_COLORS.tentacle], [4, 11, LORD_COLORS.tentacleLight], [5, 11, LORD_COLORS.tentacleTip], [10, 11, LORD_COLORS.tentacleTip], [11, 11, LORD_COLORS.tentacleLight], [12, 11, LORD_COLORS.tentacle], [13, 11, LORD_COLORS.tentacleDark],
  [3, 12, LORD_COLORS.tentacle], [4, 12, LORD_COLORS.tentacleLight], [5, 12, LORD_COLORS.tentacle], [6, 12, LORD_COLORS.tentacleTip], [7, 12, LORD_COLORS.slimeGlow], [8, 12, LORD_COLORS.slimeGlow], [9, 12, LORD_COLORS.tentacleTip], [10, 12, LORD_COLORS.tentacle], [11, 12, LORD_COLORS.tentacleLight], [12, 12, LORD_COLORS.tentacle],
]

// 向左面朝 - 侧面
const LORD_FACE_LEFT = [
  // ===== 触手 =====
  [5, 0, LORD_COLORS.tentacle], [6, 0, LORD_COLORS.tentacleLight],
  [4, 1, LORD_COLORS.tentacleDark], [5, 1, LORD_COLORS.tentacle], [6, 1, LORD_COLORS.tentacleTip],
  [4, 2, LORD_COLORS.tentacle], [5, 2, LORD_COLORS.tentacleLight], [6, 2, LORD_COLORS.tentacleSuction],
  [3, 3, LORD_COLORS.tentacleDark], [4, 3, LORD_COLORS.tentacle], [5, 3, LORD_COLORS.tentacleTip],
  [3, 4, LORD_COLORS.tentacle], [4, 4, LORD_COLORS.tentacleLight], [5, 4, LORD_COLORS.tentacleSuction],

  // ===== 大眼睛（侧面）=====
  [4, 5, LORD_COLORS.eyeWhiteDark], [5, 5, LORD_COLORS.eyeWhite], [6, 5, LORD_COLORS.eyeWhite], [7, 5, LORD_COLORS.fleshDark],
  [4, 6, LORD_COLORS.eyeWhite], [5, 6, LORD_COLORS.pupilGlow], [6, 6, LORD_COLORS.pupilCore], [7, 6, LORD_COLORS.eyeWhiteDark],
  [4, 7, LORD_COLORS.eyeWhite], [5, 7, LORD_COLORS.pupil], [6, 7, LORD_COLORS.pupilGlow], [7, 7, LORD_COLORS.eyeWhite],
  [4, 8, LORD_COLORS.eyeWhiteDark], [5, 8, LORD_COLORS.eyeWhite], [6, 8, LORD_COLORS.pupil], [7, 8, LORD_COLORS.eyeWhiteDark],
  [4, 9, LORD_COLORS.fleshDark], [5, 9, LORD_COLORS.eyeWhite], [6, 9, LORD_COLORS.eyeWhite], [7, 9, LORD_COLORS.fleshDark],

  // ===== 主体 ======
  [3, 5, LORD_COLORS.flesh], [3, 6, LORD_COLORS.fleshLight], [3, 7, LORD_COLORS.fleshMid], [3, 8, LORD_COLORS.flesh],
  [8, 5, LORD_COLORS.fleshDark], [8, 6, LORD_COLORS.flesh], [8, 7, LORD_COLORS.fleshLight], [8, 8, LORD_COLORS.fleshDark],
  [2, 6, LORD_COLORS.fleshDark], [2, 7, LORD_COLORS.flesh], [2, 8, LORD_COLORS.fleshDark],
  [9, 6, LORD_COLORS.fleshDark], [9, 7, LORD_COLORS.flesh], [9, 8, LORD_COLORS.fleshDark],

  // ===== 更多触手 ======
  [2, 5, LORD_COLORS.tentacleDark], [2, 9, LORD_COLORS.tentacleDark],
  [9, 5, LORD_COLORS.tentacle], [9, 9, LORD_COLORS.tentacle],
  [3, 10, LORD_COLORS.tentacle], [4, 10, LORD_COLORS.tentacleLight], [5, 10, LORD_COLORS.tentacleTip],
  [3, 11, LORD_COLORS.tentacleDark], [4, 11, LORD_COLORS.tentacle], [5, 11, LORD_COLORS.tentacleLight], [6, 11, LORD_COLORS.tentacleTip],
  [4, 12, LORD_COLORS.tentacleDark], [5, 12, LORD_COLORS.tentacle], [6, 12, LORD_COLORS.tentacleLight], [7, 12, LORD_COLORS.slimeGlow],
  [5, 13, LORD_COLORS.tentacleDark], [6, 13, LORD_COLORS.tentacleLight], [7, 13, LORD_COLORS.tentacle], [8, 13, LORD_COLORS.tentacleDark],
  [6, 14, LORD_COLORS.tentacle], [7, 14, LORD_COLORS.tentacleLight], [8, 14, LORD_COLORS.tentacle],
  [7, 15, LORD_COLORS.tentacleDark],

  // ===== 漂浮粒子 =====
  [0, 6, LORD_COLORS.particle], [0, 8, LORD_COLORS.particleLight],
  [10, 7, LORD_COLORS.abyssGlow],
]

// 向右面朝 - 侧面镜像
const LORD_FACE_RIGHT = [
  // ===== 触手 =====
  [6, 0, LORD_COLORS.tentacleLight], [7, 0, LORD_COLORS.tentacle],
  [6, 1, LORD_COLORS.tentacleTip], [7, 1, LORD_COLORS.tentacle], [8, 1, LORD_COLORS.tentacleDark],
  [6, 2, LORD_COLORS.tentacleSuction], [7, 2, LORD_COLORS.tentacleLight], [8, 2, LORD_COLORS.tentacle],
  [6, 3, LORD_COLORS.tentacleTip], [7, 3, LORD_COLORS.tentacle], [8, 3, LORD_COLORS.tentacleDark],
  [6, 4, LORD_COLORS.tentacleSuction], [7, 4, LORD_COLORS.tentacleLight], [8, 4, LORD_COLORS.tentacle],

  // ===== 大眼睛（侧面）=====
  [5, 5, LORD_COLORS.fleshDark], [6, 5, LORD_COLORS.eyeWhite], [7, 5, LORD_COLORS.eyeWhite], [8, 5, LORD_COLORS.eyeWhiteDark],
  [5, 6, LORD_COLORS.eyeWhiteDark], [6, 6, LORD_COLORS.pupilCore], [7, 6, LORD_COLORS.pupilGlow], [8, 6, LORD_COLORS.eyeWhite],
  [5, 7, LORD_COLORS.eyeWhite], [6, 7, LORD_COLORS.pupilGlow], [7, 7, LORD_COLORS.pupil], [8, 7, LORD_COLORS.eyeWhite],
  [5, 8, LORD_COLORS.eyeWhiteDark], [6, 8, LORD_COLORS.pupil], [7, 8, LORD_COLORS.eyeWhite], [8, 8, LORD_COLORS.eyeWhiteDark],
  [5, 9, LORD_COLORS.fleshDark], [6, 9, LORD_COLORS.eyeWhite], [7, 9, LORD_COLORS.eyeWhite], [8, 9, LORD_COLORS.fleshDark],

  // ===== 主体 ======
  [9, 5, LORD_COLORS.flesh], [9, 6, LORD_COLORS.fleshLight], [9, 7, LORD_COLORS.fleshMid], [9, 8, LORD_COLORS.flesh],
  [4, 5, LORD_COLORS.fleshDark], [4, 6, LORD_COLORS.flesh], [4, 7, LORD_COLORS.fleshLight], [4, 8, LORD_COLORS.fleshDark],
  [10, 6, LORD_COLORS.fleshDark], [10, 7, LORD_COLORS.flesh], [10, 8, LORD_COLORS.fleshDark],
  [3, 6, LORD_COLORS.fleshDark], [3, 7, LORD_COLORS.flesh], [3, 8, LORD_COLORS.fleshDark],

  // ===== 更多触手 ======
  [10, 5, LORD_COLORS.tentacleDark], [10, 9, LORD_COLORS.tentacleDark],
  [3, 5, LORD_COLORS.tentacle], [3, 9, LORD_COLORS.tentacle],
  [7, 10, LORD_COLORS.tentacleTip], [8, 10, LORD_COLORS.tentacleLight], [9, 10, LORD_COLORS.tentacle],
  [6, 11, LORD_COLORS.slimeGlow], [7, 11, LORD_COLORS.tentacleLight], [8, 11, LORD_COLORS.tentacle], [9, 11, LORD_COLORS.tentacleDark],
  [5, 12, LORD_COLORS.tentacleDark], [6, 12, LORD_COLORS.tentacleLight], [7, 12, LORD_COLORS.slimeGlow], [8, 12, LORD_COLORS.tentacle], [9, 12, LORD_COLORS.tentacleDark],
  [4, 13, LORD_COLORS.tentacleDark], [5, 13, LORD_COLORS.tentacleLight], [6, 13, LORD_COLORS.tentacle], [7, 13, LORD_COLORS.tentacleLight], [8, 13, LORD_COLORS.tentacle],
  [5, 14, LORD_COLORS.tentacle], [6, 14, LORD_COLORS.tentacleLight], [7, 14, LORD_COLORS.tentacle],
  [5, 15, LORD_COLORS.tentacleDark], [6, 15, LORD_COLORS.tentacleLight],

  // ===== 漂浮粒子 =====
  [12, 6, LORD_COLORS.particle], [12, 8, LORD_COLORS.particleLight],
  [2, 7, LORD_COLORS.abyssGlow],
]

// 待机动画帧（眼睛眨动 + 触手蠕动）
const LORD_IDLE_FRAMES = [
  // 帧0 - 正常
  [
    { pixels: [
      [6, 4, LORD_COLORS.pupilGlow], [7, 4, LORD_COLORS.pupilCore], [8, 4, LORD_COLORS.pupilCore], [9, 4, LORD_COLORS.pupilGlow],
      [6, 5, LORD_COLORS.pupilCore], [7, 5, LORD_COLORS.pupilGlow], [8, 5, LORD_COLORS.pupilGlow], [9, 5, LORD_COLORS.pupilCore],
      [6, 6, LORD_COLORS.pupilGlow], [7, 6, LORD_COLORS.pupil], [8, 6, LORD_COLORS.pupil], [9, 6, LORD_COLORS.pupilGlow],
    ] }
  ],
  // 帧1 - 瞳孔放大（可怕凝视）
  [
    { pixels: [
      [5, 4, LORD_COLORS.pupil], [6, 4, LORD_COLORS.pupilCore], [7, 4, LORD_COLORS.pupilCore], [8, 4, LORD_COLORS.pupilCore], [9, 4, LORD_COLORS.pupil],
      [5, 5, LORD_COLORS.pupilCore], [6, 5, LORD_COLORS.spark], [7, 5, LORD_COLORS.spark], [8, 5, LORD_COLORS.spark], [9, 5, LORD_COLORS.pupilCore],
      [5, 6, LORD_COLORS.pupil], [6, 6, LORD_COLORS.pupilCore], [7, 6, LORD_COLORS.pupilCore], [8, 6, LORD_COLORS.pupilCore], [9, 6, LORD_COLORS.pupil],
      [7, 0, LORD_COLORS.abyssGlow], [8, 0, LORD_COLORS.abyssGlow],
      [0, 5, LORD_COLORS.spark], [14, 5, LORD_COLORS.spark],
    ] }
  ],
]

// 移动动画帧（触手蠕动）
const LORD_WALK_FRAMES = [
  // 帧0 - 触手收缩
  [
    { pixels: [
      [5, 0, LORD_COLORS.tentacle], [6, 0, LORD_COLORS.tentacleLight], [9, 0, LORD_COLORS.tentacleLight],
    ] }
  ],
  // 帧1 - 触手伸展
  [
    { pixels: [
      [5, 0, LORD_COLORS.tentacleLight], [6, 0, LORD_COLORS.tentacleTip], [7, 0, LORD_COLORS.abyssGlow], [9, 0, LORD_COLORS.tentacleTip],
    ] }
  ],
  // 帧2 - 触手挥舞
  [
    { pixels: [
      [5, 0, LORD_COLORS.tentacle], [6, 0, LORD_COLORS.tentacleTip], [8, 0, LORD_COLORS.tentacleLight], [9, 0, LORD_COLORS.tentacle],
    ] }
  ],
]

export const drawPitLord = (canvasRef, currentUnit) => {
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
  let basePixels = LORD_FACE_DOWN
  if (direction === 'up') basePixels = LORD_FACE_UP
  else if (direction === 'left') basePixels = LORD_FACE_LEFT
  else if (direction === 'right') basePixels = LORD_FACE_RIGHT

  // 绘制基础角色
  for (let i = 0; i < basePixels.length; i++) {
    drawPixel(basePixels[i][0], basePixels[i][1], basePixels[i][2])
  }

  // 绘制动画层
  const isMoving = currentUnit.isMoving || false
  const frames = isMoving ? LORD_WALK_FRAMES : LORD_IDLE_FRAMES
  const frameIndex = Math.floor(frame) % frames.length
  const currentFrame = frames[frameIndex]

  for (const layer of currentFrame) {
    for (const pixel of layer.pixels) {
      drawPixel(pixel[0], pixel[1], pixel[2])
    }
  }
}

export const drawPitLordAvatar = (canvasRef, currentUnit, avatarPos) => {
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

  for (let i = 0; i < LORD_AVATAR.length; i++) {
    drawPixel(LORD_AVATAR[i][0], LORD_AVATAR[i][1], LORD_AVATAR[i][2])
  }
}