/**
 * 绘制暗影领主怪物 - 骷髅头+黑罩袍漂浮形态，黑气构成身体
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit 暗影领主位置和状态
 * @param {Number} currentUnit.x 暗影领主x坐标
 * @param {Number} currentUnit.y 暗影领主y坐标
 * @param {Number} currentUnit.size 暗影领主大小(px)
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

export const config = {
  IDLE_SPEED: 0.004,
  WALK_SPEED: 0.08,
}

// 暗影领主颜色（黑/紫/黑气）
const LORD_COLORS = {
  // 骷髅头
  skull: '#E8E8D8',         // 骷髅白
  skullDark: '#B8B8A8',     // 骷髅暗
  skullLight: '#F8F8E8',    // 骷髅亮
  skullShadow: '#8A8A7A',   // 骷髅阴影
  // 眼眶/眼洞
  eyeHole: '#0A000A',       // 眼洞 - 纯黑
  eyeGlow: '#8800FF',        // 眼睛发光 - 紫
  eyeGlowLight: '#AA44FF',   // 眼睛亮
  eyeCore: '#FFFFFF',        // 眼睛内核 - 白
  // 牙齿
  tooth: '#F0F0E0',         // 牙齿 - 白
  toothDark: '#C8C8B8',     // 牙齿暗
  // 黑罩袍（兜帽+长袍）
  hood: '#0A000A',          // 兜帽/罩袍主色 - 极暗黑
  hoodDark: '#050005',      // 兜帽暗
  hoodLight: '#1A0A1A',     // 兜帽亮
  hoodPurple: '#1A0A2A',    // 兜帽紫
  hoodPurpleLight: '#3A1A4A', // 兜帽紫亮
  // 领口
  collar: '#1A0A1A',        // 领口
  collarDark: '#0A000A',    // 领口暗
  collarLight: '#2A1A2A',   // 领口亮
  // 黑气/暗影身体
  darkBody: '#1A0A1A',      // 黑气身体主色
  darkBodyDark: '#0A000A',  // 黑气身体暗
  darkBodyLight: '#2A1A2A', // 黑气身体亮
  darkBodyPurple: '#2A0A3A', // 黑气紫
  darkBodyPurpleLight: '#4A1A5A', // 黑气紫亮
  // 暗影气息
  shadow: '#1A0A1A',        // 暗影
  shadowDark: '#0A000A',    // 暗影暗
  shadowLight: '#2A1A2A',   // 暗影亮
  smoke: '#2A1A3A',         // 烟雾
  smokeLight: '#4A2A5A',    // 烟雾亮
  mist: '#3A1A4A',          // 迷雾
  mistLight: '#5A2A6A',     // 迷雾亮
  // 黑暗能量
  darkEnergy: '#330099',     // 黑暗能量 - 深紫
  darkEnergyGlow: '#5511BB', // 黑暗能量发光
  darkEnergyLight: '#7733DD', // 黑暗能量亮
  // 粒子
  spark: '#9933FF',          // 粒子 - 紫
  sparkLight: '#BB55FF',     // 粒子亮
  sparkWhite: '#FFFFFF',     // 白粒子
  // 漂浮光晕
  floatGlow: '#2A1A3A',      // 漂浮光晕
  floatGlowLight: '#4A2A5A', // 漂浮光晕亮
  highlight: '#FFFFFF',          // 高光
}

// 暗影领主高精度头像（16x16网格，聚焦骷髅头部特写）
const LORD_AVATAR = [
  // ===== 兜帽顶部边缘 =====
  [4, 0, LORD_COLORS.hoodDark], [5, 0, LORD_COLORS.hood], [6, 0, LORD_COLORS.hoodLight], [7, 0, LORD_COLORS.hoodLight], [8, 0, LORD_COLORS.hood], [9, 0, LORD_COLORS.hoodDark],
  [3, 1, LORD_COLORS.hood], [4, 1, LORD_COLORS.hoodLight], [5, 1, LORD_COLORS.hood], [6, 1, LORD_COLORS.hoodPurple], [7, 1, LORD_COLORS.hoodPurple], [8, 1, LORD_COLORS.hood], [9, 1, LORD_COLORS.hoodLight], [10, 1, LORD_COLORS.hood],
  [3, 2, LORD_COLORS.hoodDark], [4, 2, LORD_COLORS.hood], [5, 2, LORD_COLORS.hoodLight], [6, 2, LORD_COLORS.hood], [7, 2, LORD_COLORS.hood], [8, 2, LORD_COLORS.hoodLight], [9, 2, LORD_COLORS.hood], [10, 2, LORD_COLORS.hoodDark],

  // ===== 兜帽开口处（骷髅头从中露出）=====
  [4, 3, LORD_COLORS.hood], [5, 3, LORD_COLORS.collarLight], [6, 3, LORD_COLORS.collar], [7, 3, LORD_COLORS.collar], [8, 3, LORD_COLORS.collarLight], [9, 3, LORD_COLORS.hood],
  [3, 4, LORD_COLORS.hoodDark], [4, 4, LORD_COLORS.hood], [5, 4, LORD_COLORS.skullShadow], [6, 4, LORD_COLORS.skull], [7, 4, LORD_COLORS.skull], [8, 4, LORD_COLORS.skullShadow], [9, 4, LORD_COLORS.hood], [10, 4, LORD_COLORS.hoodDark],

  // ===== 骷髅头主体 =====
  [3, 5, LORD_COLORS.skull], [4, 5, LORD_COLORS.skullLight], [5, 5, LORD_COLORS.skull], [6, 5, LORD_COLORS.skull], [7, 5, LORD_COLORS.skull], [8, 5, LORD_COLORS.skullLight], [9, 5, LORD_COLORS.skull], [10, 5, LORD_COLORS.skullDark],
  [3, 6, LORD_COLORS.skullDark], [4, 6, LORD_COLORS.skull], [5, 6, LORD_COLORS.skullLight], [6, 6, LORD_COLORS.skull], [7, 6, LORD_COLORS.skull], [8, 6, LORD_COLORS.skullLight], [9, 6, LORD_COLORS.skull], [10, 6, LORD_COLORS.skullDark],

  // ===== 眼眶（紫色发光）=====
  [3, 7, LORD_COLORS.skullDark], [4, 7, LORD_COLORS.skull], [5, 7, LORD_COLORS.eyeHole], [6, 7, LORD_COLORS.eyeGlow], [7, 7, LORD_COLORS.eyeGlow], [8, 7, LORD_COLORS.eyeHole], [9, 7, LORD_COLORS.skull], [10, 7, LORD_COLORS.skullDark],
  [4, 8, LORD_COLORS.skullDark], [5, 8, LORD_COLORS.eyeGlow], [6, 8, LORD_COLORS.eyeCore], [7, 8, LORD_COLORS.eyeCore], [8, 8, LORD_COLORS.eyeGlow], [9, 8, LORD_COLORS.skullDark],
  // 眼睛高光
  [6, 7, LORD_COLORS.highlight], [7, 7, LORD_COLORS.highlight],
  [6, 8, LORD_COLORS.highlight], [7, 8, LORD_COLORS.highlight],

  // ===== 眼睛下方细节 =====
  [3, 8, LORD_COLORS.skull], [4, 8, LORD_COLORS.eyeGlowLight], [5, 8, LORD_COLORS.eyeGlow], [9, 8, LORD_COLORS.eyeGlowLight], [10, 8, LORD_COLORS.skull],
  [3, 9, LORD_COLORS.skullDark], [4, 9, LORD_COLORS.skull], [5, 9, LORD_COLORS.skullShadow], [6, 9, LORD_COLORS.skullShadow], [7, 9, LORD_COLORS.skullShadow], [8, 9, LORD_COLORS.skullShadow], [9, 9, LORD_COLORS.skull], [10, 9, LORD_COLORS.skullDark],

  // ===== 鼻梁和面颊 =====
  [4, 10, LORD_COLORS.skull], [5, 10, LORD_COLORS.skullDark], [6, 10, LORD_COLORS.skullShadow], [7, 10, LORD_COLORS.skullShadow], [8, 10, LORD_COLORS.skullDark], [9, 10, LORD_COLORS.skull],
  [4, 11, LORD_COLORS.skullDark], [5, 11, LORD_COLORS.skull], [6, 11, LORD_COLORS.skullDark], [7, 11, LORD_COLORS.skullDark], [8, 11, LORD_COLORS.skull], [9, 11, LORD_COLORS.skullDark],

  // ===== 牙齿 =====
  [5, 12, LORD_COLORS.tooth], [6, 12, LORD_COLORS.tooth], [7, 12, LORD_COLORS.tooth], [8, 12, LORD_COLORS.tooth],
  [4, 13, LORD_COLORS.toothDark], [5, 13, LORD_COLORS.tooth], [6, 13, LORD_COLORS.toothDark], [7, 13, LORD_COLORS.toothDark], [8, 13, LORD_COLORS.tooth], [9, 13, LORD_COLORS.toothDark],
  [5, 14, LORD_COLORS.toothDark], [6, 14, LORD_COLORS.tooth], [7, 14, LORD_COLORS.tooth], [8, 14, LORD_COLORS.toothDark],

  // ===== 收紧的领口 =====
  [4, 15, LORD_COLORS.hood], [5, 15, LORD_COLORS.collarLight], [6, 15, LORD_COLORS.collar], [7, 15, LORD_COLORS.collar], [8, 15, LORD_COLORS.collarLight], [9, 15, LORD_COLORS.hood],
  [3, 16, LORD_COLORS.hoodDark], [4, 16, LORD_COLORS.collarDark], [5, 16, LORD_COLORS.collar], [6, 16, LORD_COLORS.collar], [7, 16, LORD_COLORS.collar], [8, 16, LORD_COLORS.collarDark], [9, 16, LORD_COLORS.hoodDark],
]

// 向下面朝 - 正面（兜帽戴起，黑气身体，下摆散开）
const LORD_FACE_DOWN = [
  // ===== 兜帽顶部 =====
  [4, 0, LORD_COLORS.hoodDark], [5, 0, LORD_COLORS.hood], [6, 0, LORD_COLORS.hoodLight], [7, 0, LORD_COLORS.hoodLight], [8, 0, LORD_COLORS.hood], [9, 0, LORD_COLORS.hoodDark],
  [3, 1, LORD_COLORS.hood], [4, 1, LORD_COLORS.hoodLight], [5, 1, LORD_COLORS.hood], [6, 1, LORD_COLORS.hoodPurple], [7, 1, LORD_COLORS.hoodPurple], [8, 1, LORD_COLORS.hood], [9, 1, LORD_COLORS.hoodLight], [10, 1, LORD_COLORS.hood],
  [3, 2, LORD_COLORS.hoodDark], [4, 2, LORD_COLORS.hood], [5, 2, LORD_COLORS.hoodLight], [6, 2, LORD_COLORS.hood], [7, 2, LORD_COLORS.hood], [8, 2, LORD_COLORS.hoodLight], [9, 2, LORD_COLORS.hood], [10, 2, LORD_COLORS.hoodDark],

  // ===== 兜帽开口处（骷髅头从中露出）=====
  [4, 3, LORD_COLORS.hood], [5, 3, LORD_COLORS.collarLight], [6, 3, LORD_COLORS.collar], [7, 3, LORD_COLORS.collar], [8, 3, LORD_COLORS.collarLight], [9, 3, LORD_COLORS.hood],
  [3, 4, LORD_COLORS.hoodDark], [4, 4, LORD_COLORS.hood], [5, 4, LORD_COLORS.skullShadow], [6, 4, LORD_COLORS.skull], [7, 4, LORD_COLORS.skull], [8, 4, LORD_COLORS.skullShadow], [9, 4, LORD_COLORS.hood], [10, 4, LORD_COLORS.hoodDark],

  // ===== 骷髅头（从兜帽中露出）=====
  [4, 5, LORD_COLORS.skull], [5, 5, LORD_COLORS.eyeHole], [6, 5, LORD_COLORS.eyeGlow], [7, 5, LORD_COLORS.eyeGlow], [8, 5, LORD_COLORS.eyeHole], [9, 5, LORD_COLORS.skull],
  [4, 6, LORD_COLORS.skullDark], [5, 6, LORD_COLORS.eyeGlow], [6, 6, LORD_COLORS.eyeCore], [7, 6, LORD_COLORS.eyeCore], [8, 6, LORD_COLORS.eyeGlow], [9, 6, LORD_COLORS.skullDark],
  [5, 7, LORD_COLORS.skull], [6, 7, LORD_COLORS.skullDark], [7, 7, LORD_COLORS.skullDark], [8, 7, LORD_COLORS.skull],
  [5, 8, LORD_COLORS.tooth], [6, 8, LORD_COLORS.toothDark], [7, 8, LORD_COLORS.toothDark], [8, 8, LORD_COLORS.tooth],

  // ===== 收紧的领口 =====
  [3, 8, LORD_COLORS.hood], [4, 8, LORD_COLORS.collar], [5, 8, LORD_COLORS.collarLight], [8, 8, LORD_COLORS.collarLight], [9, 8, LORD_COLORS.collar], [10, 8, LORD_COLORS.hood],
  [3, 9, LORD_COLORS.hoodDark], [4, 9, LORD_COLORS.collarDark], [5, 9, LORD_COLORS.collar], [8, 9, LORD_COLORS.collar], [9, 9, LORD_COLORS.collarDark], [10, 9, LORD_COLORS.hoodDark],

  // ===== 黑气构成的身体（从领口向下填充）=====
  [4, 10, LORD_COLORS.darkBodyDark], [5, 10, LORD_COLORS.darkBody], [6, 10, LORD_COLORS.darkBodyLight], [7, 10, LORD_COLORS.darkBodyLight], [8, 10, LORD_COLORS.darkBody], [9, 10, LORD_COLORS.darkBodyDark],
  [4, 11, LORD_COLORS.darkBody], [5, 11, LORD_COLORS.darkBodyPurple], [6, 11, LORD_COLORS.darkBodyPurpleLight], [7, 11, LORD_COLORS.darkBodyPurpleLight], [8, 11, LORD_COLORS.darkBodyPurple], [9, 11, LORD_COLORS.darkBody],
  [4, 12, LORD_COLORS.darkBodyDark], [5, 12, LORD_COLORS.darkBody], [6, 12, LORD_COLORS.darkBodyLight], [7, 12, LORD_COLORS.darkBodyLight], [8, 12, LORD_COLORS.darkBody], [9, 12, LORD_COLORS.darkBodyDark],
  [4, 13, LORD_COLORS.darkBody], [5, 13, LORD_COLORS.darkBodyPurple], [6, 13, LORD_COLORS.darkBody], [7, 13, LORD_COLORS.darkBody], [8, 13, LORD_COLORS.darkBodyPurple], [9, 13, LORD_COLORS.darkBody],

  // ===== 散开的下摆（黑气+罩袍）=====
  [2, 10, LORD_COLORS.hood], [3, 10, LORD_COLORS.hoodDark], [10, 10, LORD_COLORS.hoodDark], [11, 10, LORD_COLORS.hood],
  [1, 11, LORD_COLORS.hoodDark], [2, 11, LORD_COLORS.hood], [3, 11, LORD_COLORS.hoodLight], [10, 11, LORD_COLORS.hoodLight], [11, 11, LORD_COLORS.hood], [12, 11, LORD_COLORS.hoodDark],
  [1, 12, LORD_COLORS.hood], [2, 12, LORD_COLORS.hoodDark], [3, 12, LORD_COLORS.hood], [10, 12, LORD_COLORS.hood], [11, 12, LORD_COLORS.hoodDark], [12, 12, LORD_COLORS.hood],
  [0, 13, LORD_COLORS.hoodDark], [1, 13, LORD_COLORS.hood], [2, 13, LORD_COLORS.hoodLight], [3, 13, LORD_COLORS.hood], [10, 13, LORD_COLORS.hood], [11, 13, LORD_COLORS.hoodLight], [12, 13, LORD_COLORS.hood], [13, 13, LORD_COLORS.hoodDark],
  [0, 14, LORD_COLORS.hood], [1, 14, LORD_COLORS.hoodDark], [2, 14, LORD_COLORS.hood], [3, 14, LORD_COLORS.hoodLight], [10, 14, LORD_COLORS.hoodLight], [11, 14, LORD_COLORS.hood], [12, 14, LORD_COLORS.hoodDark], [13, 14, LORD_COLORS.hood],
  [1, 15, LORD_COLORS.hoodDark], [2, 15, LORD_COLORS.hood], [3, 15, LORD_COLORS.hoodLight], [10, 15, LORD_COLORS.hoodLight], [11, 15, LORD_COLORS.hood], [12, 15, LORD_COLORS.hoodDark],
  [2, 16, LORD_COLORS.hood], [3, 16, LORD_COLORS.hoodDark], [10, 16, LORD_COLORS.hoodDark], [11, 16, LORD_COLORS.hood],

  // ===== 底部黑气聚集 + 漂浮光晕 =====
  [3, 17, LORD_COLORS.floatGlow], [4, 17, LORD_COLORS.floatGlowLight], [5, 17, LORD_COLORS.darkBodyPurple], [6, 17, LORD_COLORS.darkBodyPurpleLight], [7, 17, LORD_COLORS.darkBodyPurpleLight], [8, 17, LORD_COLORS.darkBodyPurple], [9, 17, LORD_COLORS.floatGlowLight], [10, 17, LORD_COLORS.floatGlow],
  [4, 18, LORD_COLORS.floatGlow], [5, 18, LORD_COLORS.darkEnergy], [6, 18, LORD_COLORS.darkEnergyGlow], [7, 18, LORD_COLORS.darkEnergyGlow], [8, 18, LORD_COLORS.darkEnergy], [9, 18, LORD_COLORS.floatGlow],

  // ===== 环绕暗影气息 =====
  [0, 12, LORD_COLORS.smoke], [14, 12, LORD_COLORS.smoke],
  [0, 13, LORD_COLORS.mist], [14, 13, LORD_COLORS.mist],
  [1, 14, LORD_COLORS.shadowLight], [13, 14, LORD_COLORS.shadowLight],
]

// 向上面朝 - 背面（黑气身体）
const LORD_FACE_UP = [
  // ===== 兜帽顶部 =====
  [4, 0, LORD_COLORS.hoodDark], [5, 0, LORD_COLORS.hood], [6, 0, LORD_COLORS.hoodLight], [7, 0, LORD_COLORS.hoodLight], [8, 0, LORD_COLORS.hood], [9, 0, LORD_COLORS.hoodDark],
  [3, 1, LORD_COLORS.hood], [4, 1, LORD_COLORS.hoodLight], [5, 1, LORD_COLORS.hood], [6, 1, LORD_COLORS.hoodPurple], [7, 1, LORD_COLORS.hoodPurple], [8, 1, LORD_COLORS.hood], [9, 1, LORD_COLORS.hoodLight], [10, 1, LORD_COLORS.hood],
  [3, 2, LORD_COLORS.hoodDark], [4, 2, LORD_COLORS.hood], [5, 2, LORD_COLORS.hoodLight], [6, 2, LORD_COLORS.hood], [7, 2, LORD_COLORS.hood], [8, 2, LORD_COLORS.hoodLight], [9, 2, LORD_COLORS.hood], [10, 2, LORD_COLORS.hoodDark],

  // ===== 兜帽背面 =====
  [3, 3, LORD_COLORS.hoodDark], [4, 3, LORD_COLORS.hood], [5, 3, LORD_COLORS.hoodLight], [6, 3, LORD_COLORS.hood], [7, 3, LORD_COLORS.hood], [8, 3, LORD_COLORS.hoodLight], [9, 3, LORD_COLORS.hood], [10, 3, LORD_COLORS.hoodDark],
  [4, 4, LORD_COLORS.hood], [5, 4, LORD_COLORS.hoodLight], [6, 4, LORD_COLORS.hoodPurple], [7, 4, LORD_COLORS.hoodPurple], [8, 4, LORD_COLORS.hoodLight], [9, 4, LORD_COLORS.hood],

  // ===== 骷髅后脑勺（从兜帽中露出）=====
  [4, 5, LORD_COLORS.skullShadow], [5, 5, LORD_COLORS.skull], [6, 5, LORD_COLORS.skullLight], [7, 5, LORD_COLORS.skullLight], [8, 5, LORD_COLORS.skull], [9, 5, LORD_COLORS.skullShadow],
  [4, 6, LORD_COLORS.skull], [5, 6, LORD_COLORS.skullDark], [6, 6, LORD_COLORS.skull], [7, 6, LORD_COLORS.skull], [8, 6, LORD_COLORS.skullDark], [9, 6, LORD_COLORS.skull],

  // ===== 收紧的领口（背面）=====
  [3, 7, LORD_COLORS.hood], [4, 7, LORD_COLORS.collar], [5, 7, LORD_COLORS.collarLight], [8, 7, LORD_COLORS.collarLight], [9, 7, LORD_COLORS.collar], [10, 7, LORD_COLORS.hood],
  [3, 8, LORD_COLORS.hoodDark], [4, 8, LORD_COLORS.collarDark], [5, 8, LORD_COLORS.collar], [8, 8, LORD_COLORS.collar], [9, 8, LORD_COLORS.collarDark], [10, 8, LORD_COLORS.hoodDark],

  // ===== 黑气构成的身体（背面）=====
  [4, 9, LORD_COLORS.darkBodyDark], [5, 9, LORD_COLORS.darkBody], [6, 9, LORD_COLORS.darkBodyLight], [7, 9, LORD_COLORS.darkBodyLight], [8, 9, LORD_COLORS.darkBody], [9, 9, LORD_COLORS.darkBodyDark],
  [4, 10, LORD_COLORS.darkBody], [5, 10, LORD_COLORS.darkBodyPurple], [6, 10, LORD_COLORS.darkBodyPurpleLight], [7, 10, LORD_COLORS.darkBodyPurpleLight], [8, 10, LORD_COLORS.darkBodyPurple], [9, 10, LORD_COLORS.darkBody],
  [4, 11, LORD_COLORS.darkBodyDark], [5, 11, LORD_COLORS.darkBody], [6, 11, LORD_COLORS.darkBodyLight], [7, 11, LORD_COLORS.darkBodyLight], [8, 11, LORD_COLORS.darkBody], [9, 11, LORD_COLORS.darkBodyDark],
  [4, 12, LORD_COLORS.darkBody], [5, 12, LORD_COLORS.darkBodyPurple], [6, 12, LORD_COLORS.darkBody], [7, 12, LORD_COLORS.darkBody], [8, 12, LORD_COLORS.darkBodyPurple], [9, 12, LORD_COLORS.darkBody],

  // ===== 散开的下摆（背面）=====
  [2, 9, LORD_COLORS.hood], [3, 9, LORD_COLORS.hoodDark], [10, 9, LORD_COLORS.hoodDark], [11, 9, LORD_COLORS.hood],
  [1, 10, LORD_COLORS.hoodDark], [2, 10, LORD_COLORS.hood], [3, 10, LORD_COLORS.hoodLight], [10, 10, LORD_COLORS.hoodLight], [11, 10, LORD_COLORS.hood], [12, 10, LORD_COLORS.hoodDark],
  [1, 11, LORD_COLORS.hood], [2, 11, LORD_COLORS.hoodDark], [3, 11, LORD_COLORS.hood], [10, 11, LORD_COLORS.hood], [11, 11, LORD_COLORS.hoodDark], [12, 11, LORD_COLORS.hood],
  [0, 12, LORD_COLORS.hoodDark], [1, 12, LORD_COLORS.hood], [2, 12, LORD_COLORS.hoodLight], [3, 12, LORD_COLORS.hood], [10, 12, LORD_COLORS.hood], [11, 12, LORD_COLORS.hoodLight], [12, 12, LORD_COLORS.hood], [13, 12, LORD_COLORS.hoodDark],
  [0, 13, LORD_COLORS.hood], [1, 13, LORD_COLORS.hoodDark], [2, 13, LORD_COLORS.hood], [3, 13, LORD_COLORS.hoodLight], [10, 13, LORD_COLORS.hoodLight], [11, 13, LORD_COLORS.hood], [12, 13, LORD_COLORS.hoodDark], [13, 13, LORD_COLORS.hood],
  [1, 14, LORD_COLORS.hoodDark], [2, 14, LORD_COLORS.hood], [3, 14, LORD_COLORS.hoodLight], [10, 14, LORD_COLORS.hoodLight], [11, 14, LORD_COLORS.hood], [12, 14, LORD_COLORS.hoodDark],

  // ===== 底部黑气聚集 + 漂浮光晕 =====
  [3, 15, LORD_COLORS.floatGlow], [4, 15, LORD_COLORS.floatGlowLight], [5, 15, LORD_COLORS.darkBodyPurple], [6, 15, LORD_COLORS.darkBodyPurpleLight], [7, 15, LORD_COLORS.darkBodyPurpleLight], [8, 15, LORD_COLORS.darkBodyPurple], [9, 15, LORD_COLORS.floatGlowLight], [10, 15, LORD_COLORS.floatGlow],
  [4, 16, LORD_COLORS.floatGlow], [5, 16, LORD_COLORS.darkEnergy], [6, 16, LORD_COLORS.darkEnergyGlow], [7, 16, LORD_COLORS.darkEnergyGlow], [8, 16, LORD_COLORS.darkEnergy], [9, 16, LORD_COLORS.floatGlow],
]

// 向左面朝 - 侧面（黑气身体）
const LORD_FACE_LEFT = [
  // ===== 兜帽顶部（侧面）=====
  [5, 0, LORD_COLORS.hoodDark], [6, 0, LORD_COLORS.hood],
  [4, 1, LORD_COLORS.hood], [5, 1, LORD_COLORS.hoodLight], [6, 1, LORD_COLORS.hoodPurple],
  [4, 2, LORD_COLORS.hoodDark], [5, 2, LORD_COLORS.hood], [6, 2, LORD_COLORS.hoodLight],

  // ===== 兜帽开口 + 骷髅侧脸 =====
  [4, 3, LORD_COLORS.hood], [5, 3, LORD_COLORS.skullShadow], [6, 3, LORD_COLORS.skull],
  [4, 4, LORD_COLORS.hoodDark], [5, 4, LORD_COLORS.skull], [6, 4, LORD_COLORS.eyeGlow],
  [4, 5, LORD_COLORS.hood], [5, 5, LORD_COLORS.skullDark], [6, 5, LORD_COLORS.eyeCore],
  [4, 6, LORD_COLORS.hoodDark], [5, 6, LORD_COLORS.skull], [6, 6, LORD_COLORS.skull],
  [5, 7, LORD_COLORS.tooth], [6, 7, LORD_COLORS.toothDark],

  // ===== 收紧的领口（侧面）=====
  [4, 7, LORD_COLORS.collar], [5, 7, LORD_COLORS.collarLight], [6, 7, LORD_COLORS.hood],
  [4, 8, LORD_COLORS.collarDark], [5, 8, LORD_COLORS.collar], [6, 8, LORD_COLORS.hoodDark],

  // ===== 黑气构成的身体（侧面）=====
  [5, 9, LORD_COLORS.darkBodyDark], [6, 9, LORD_COLORS.darkBody],
  [5, 10, LORD_COLORS.darkBody], [6, 10, LORD_COLORS.darkBodyPurple],
  [5, 11, LORD_COLORS.darkBodyDark], [6, 11, LORD_COLORS.darkBody],
  [5, 12, LORD_COLORS.darkBody], [6, 12, LORD_COLORS.darkBodyPurple],

  // ===== 散开的下摆（侧面）=====
  [3, 8, LORD_COLORS.hood], [4, 8, LORD_COLORS.hoodDark], [7, 8, LORD_COLORS.hood], [8, 8, LORD_COLORS.hoodDark],
  [2, 9, LORD_COLORS.hoodDark], [3, 9, LORD_COLORS.hood], [4, 9, LORD_COLORS.hoodLight], [7, 9, LORD_COLORS.hoodLight], [8, 9, LORD_COLORS.hood], [9, 9, LORD_COLORS.hood], [10, 9, LORD_COLORS.hoodDark],
  [2, 10, LORD_COLORS.hood], [3, 10, LORD_COLORS.hoodDark], [4, 10, LORD_COLORS.hood], [7, 10, LORD_COLORS.hood], [8, 10, LORD_COLORS.hoodLight], [9, 10, LORD_COLORS.hood], [10, 10, LORD_COLORS.hoodDark],
  [1, 11, LORD_COLORS.hoodDark], [2, 11, LORD_COLORS.hood], [3, 11, LORD_COLORS.hoodLight], [4, 11, LORD_COLORS.hood], [7, 11, LORD_COLORS.hood], [8, 11, LORD_COLORS.hoodLight], [9, 11, LORD_COLORS.hood], [10, 11, LORD_COLORS.hood], [11, 11, LORD_COLORS.hoodDark],
  [1, 12, LORD_COLORS.hood], [2, 12, LORD_COLORS.hoodDark], [3, 12, LORD_COLORS.hood], [4, 12, LORD_COLORS.hoodLight], [7, 12, LORD_COLORS.hood], [8, 12, LORD_COLORS.hoodLight], [9, 12, LORD_COLORS.hood], [10, 12, LORD_COLORS.hoodDark], [11, 12, LORD_COLORS.hood],
  [2, 13, LORD_COLORS.hoodDark], [3, 13, LORD_COLORS.hood], [4, 13, LORD_COLORS.hoodLight], [7, 13, LORD_COLORS.hood], [8, 13, LORD_COLORS.hoodLight], [9, 13, LORD_COLORS.hood], [10, 13, LORD_COLORS.hoodDark],
  [3, 14, LORD_COLORS.hood], [4, 14, LORD_COLORS.hoodDark], [7, 14, LORD_COLORS.hood], [8, 14, LORD_COLORS.hoodDark], [9, 14, LORD_COLORS.hood],

  // ===== 底部黑气聚集 + 漂浮光晕 =====
  [4, 15, LORD_COLORS.floatGlow], [5, 15, LORD_COLORS.floatGlowLight], [6, 15, LORD_COLORS.darkBodyPurple], [7, 15, LORD_COLORS.floatGlowLight], [8, 15, LORD_COLORS.floatGlow],
  [5, 16, LORD_COLORS.floatGlow], [6, 16, LORD_COLORS.darkEnergy], [7, 16, LORD_COLORS.darkEnergyGlow], [8, 16, LORD_COLORS.floatGlow],
]

// 向右面朝 - 侧面镜像（黑气身体）
const LORD_FACE_RIGHT = [
  // ===== 兜帽顶部（侧面）=====
  [6, 0, LORD_COLORS.hood], [7, 0, LORD_COLORS.hoodDark],
  [6, 1, LORD_COLORS.hoodPurple], [7, 1, LORD_COLORS.hoodLight], [8, 1, LORD_COLORS.hood],
  [6, 2, LORD_COLORS.hoodLight], [7, 2, LORD_COLORS.hood], [8, 2, LORD_COLORS.hoodDark],

  // ===== 兜帽开口 + 骷髅侧脸 =====
  [6, 3, LORD_COLORS.skull], [7, 3, LORD_COLORS.skullShadow], [8, 3, LORD_COLORS.hood],
  [6, 4, LORD_COLORS.eyeGlow], [7, 4, LORD_COLORS.skull], [8, 4, LORD_COLORS.hoodDark],
  [6, 5, LORD_COLORS.eyeCore], [7, 5, LORD_COLORS.skullDark], [8, 5, LORD_COLORS.hood],
  [6, 6, LORD_COLORS.skull], [7, 6, LORD_COLORS.skull], [8, 6, LORD_COLORS.hoodDark],
  [6, 7, LORD_COLORS.toothDark], [7, 7, LORD_COLORS.tooth],

  // ===== 收紧的领口（侧面）=====
  [6, 7, LORD_COLORS.hood], [7, 7, LORD_COLORS.collarLight], [8, 7, LORD_COLORS.collar],
  [6, 8, LORD_COLORS.hoodDark], [7, 8, LORD_COLORS.collar], [8, 8, LORD_COLORS.collarDark],

  // ===== 黑气构成的身体（侧面）=====
  [6, 9, LORD_COLORS.darkBody], [7, 9, LORD_COLORS.darkBodyDark],
  [6, 10, LORD_COLORS.darkBodyPurple], [7, 10, LORD_COLORS.darkBody],
  [6, 11, LORD_COLORS.darkBody], [7, 11, LORD_COLORS.darkBodyDark],
  [6, 12, LORD_COLORS.darkBodyPurple], [7, 12, LORD_COLORS.darkBody],

  // ===== 散开的下摆（侧面）=====
  [4, 8, LORD_COLORS.hoodDark], [5, 8, LORD_COLORS.hood], [8, 8, LORD_COLORS.hood], [9, 8, LORD_COLORS.hoodDark],
  [2, 9, LORD_COLORS.hoodDark], [3, 9, LORD_COLORS.hood], [4, 9, LORD_COLORS.hoodLight], [5, 9, LORD_COLORS.hood], [6, 9, LORD_COLORS.hoodLight], [9, 9, LORD_COLORS.hood], [10, 9, LORD_COLORS.hood], [11, 9, LORD_COLORS.hoodDark],
  [2, 10, LORD_COLORS.hoodDark], [3, 10, LORD_COLORS.hood], [4, 10, LORD_COLORS.hood], [5, 10, LORD_COLORS.hoodLight], [6, 10, LORD_COLORS.hood], [9, 10, LORD_COLORS.hood], [10, 10, LORD_COLORS.hoodLight], [11, 10, LORD_COLORS.hoodDark],
  [1, 11, LORD_COLORS.hoodDark], [2, 11, LORD_COLORS.hood], [3, 11, LORD_COLORS.hoodLight], [4, 11, LORD_COLORS.hood], [5, 11, LORD_COLORS.hood], [8, 11, LORD_COLORS.hood], [9, 11, LORD_COLORS.hoodLight], [10, 11, LORD_COLORS.hood], [11, 11, LORD_COLORS.hood], [12, 11, LORD_COLORS.hoodDark],
  [1, 12, LORD_COLORS.hood], [2, 12, LORD_COLORS.hoodDark], [3, 12, LORD_COLORS.hood], [4, 12, LORD_COLORS.hoodLight], [5, 12, LORD_COLORS.hood], [8, 12, LORD_COLORS.hood], [9, 12, LORD_COLORS.hoodLight], [10, 12, LORD_COLORS.hood], [11, 12, LORD_COLORS.hoodDark], [12, 12, LORD_COLORS.hood],
  [2, 13, LORD_COLORS.hoodDark], [3, 13, LORD_COLORS.hood], [4, 13, LORD_COLORS.hoodLight], [5, 13, LORD_COLORS.hood], [8, 13, LORD_COLORS.hood], [9, 13, LORD_COLORS.hoodLight], [10, 13, LORD_COLORS.hood], [11, 13, LORD_COLORS.hoodDark],
  [3, 14, LORD_COLORS.hood], [4, 14, LORD_COLORS.hoodDark], [5, 14, LORD_COLORS.hood], [8, 14, LORD_COLORS.hood], [9, 14, LORD_COLORS.hoodDark], [10, 14, LORD_COLORS.hood],

  // ===== 底部黑气聚集 + 漂浮光晕 =====
  [4, 15, LORD_COLORS.floatGlow], [5, 15, LORD_COLORS.floatGlowLight], [6, 15, LORD_COLORS.darkBodyPurple], [7, 15, LORD_COLORS.floatGlowLight], [8, 15, LORD_COLORS.floatGlow],
  [5, 16, LORD_COLORS.floatGlow], [6, 16, LORD_COLORS.darkEnergy], [7, 16, LORD_COLORS.darkEnergyGlow], [8, 16, LORD_COLORS.floatGlow],
]

// 待机动画帧（眼睛发光 + 黑气脉动）
const LORD_IDLE_FRAMES = [
  // 帧0 - 暗
  [
    { pixels: [
      [6, 5, LORD_COLORS.eyeGlow], [7, 5, LORD_COLORS.eyeGlow],
      [6, 11, LORD_COLORS.darkBodyPurple], [7, 11, LORD_COLORS.darkBodyPurple],
      [5, 18, LORD_COLORS.darkEnergy], [6, 18, LORD_COLORS.darkEnergy], [7, 18, LORD_COLORS.darkEnergy], [8, 18, LORD_COLORS.darkEnergy],
    ] }
  ],
  // 帧1 - 亮（眼睛强发光 + 黑气涌动 + 粒子闪烁）
  [
    { pixels: [
      [6, 5, LORD_COLORS.eyeGlowLight], [7, 5, LORD_COLORS.eyeGlowLight],
      [6, 11, LORD_COLORS.darkBodyPurpleLight], [7, 11, LORD_COLORS.darkBodyPurpleLight],
      [5, 18, LORD_COLORS.darkEnergyGlow], [6, 18, LORD_COLORS.darkEnergyGlow], [7, 18, LORD_COLORS.darkEnergyGlow], [8, 18, LORD_COLORS.darkEnergyGlow],
      [6, 10, LORD_COLORS.spark], [7, 10, LORD_COLORS.spark],
      [6, 18, LORD_COLORS.sparkWhite], [7, 18, LORD_COLORS.sparkWhite],
    ] }
  ],
]

// 行走动画帧（黑气涌动变化）
const LORD_WALK_FRAMES = [
  // 帧0 - 黑气收缩
  [
    { pixels: [
      [6, 11, LORD_COLORS.darkBody], [7, 11, LORD_COLORS.darkBody],
      [5, 18, LORD_COLORS.darkEnergy], [6, 18, LORD_COLORS.darkEnergy], [7, 18, LORD_COLORS.darkEnergy], [8, 18, LORD_COLORS.darkEnergy],
    ] }
  ],
  // 帧1 - 中间
  [
    { pixels: [
      [6, 11, LORD_COLORS.darkBodyPurple], [7, 11, LORD_COLORS.darkBodyPurple],
      [5, 18, LORD_COLORS.darkEnergyGlow], [6, 18, LORD_COLORS.darkEnergyGlow], [7, 18, LORD_COLORS.darkEnergyGlow], [8, 18, LORD_COLORS.darkEnergyGlow],
    ] }
  ],
  // 帧2 - 黑气扩散
  [
    { pixels: [
      [6, 11, LORD_COLORS.darkBodyPurpleLight], [7, 11, LORD_COLORS.darkBodyPurpleLight],
      [5, 18, LORD_COLORS.darkEnergyLight], [6, 18, LORD_COLORS.darkEnergyLight], [7, 18, LORD_COLORS.darkEnergyLight], [8, 18, LORD_COLORS.darkEnergyLight],
      [6, 17, LORD_COLORS.spark], [7, 17, LORD_COLORS.spark],
    ] }
  ],
]

export const drawShadowLord = (canvasRef, currentUnit) => {
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

export const drawShadowLordAvatar = (canvasRef, currentUnit, avatarPos) => {
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