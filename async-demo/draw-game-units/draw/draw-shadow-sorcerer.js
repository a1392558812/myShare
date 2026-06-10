import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.003,
  WALK_SPEED: 0.08,
}

// 暗影法师颜色（紫黑主调 + 紫色魔法光辉）
const SORCERER_COLORS = {
  // 兜帽/袍
  hood: '#2A1A3D',        // 深紫 - 兜帽主色
  hoodDark: '#180A26',    // 更深紫 - 兜帽阴影
  hoodLight: '#4A2E6B',   // 紫色亮 - 兜帽高光
  robe: '#1F1430',        // 长袍主色 - 暗紫
  robeDark: '#120820',    // 长袍阴影
  robeLight: '#3A2456',   // 长袍亮色
  belt: '#5C3D8F',        // 腰带 - 紫
  beltBuckle: '#9966FF',  // 腰带扣 - 亮紫
  // 面巾/遮蔽
  veil: '#0A0515',        // 黑紫面巾
  // 眼睛（发光紫色）
  eye: '#CC66FF',         // 眼睛主色
  eyeGlow: '#FF99FF',     // 眼睛发光
  // 魔法效果
  magic: '#9933FF',       // 魔法球
  magicLight: '#CC66FF',  // 魔法亮
  magicSpark: '#FFCCFF',  // 魔法粒子
  // 手/骨
  hand: '#C8B8D8',        // 手 - 淡紫白
  handDark: '#8A7AA8',    // 手阴影
  // 法杖
  staff: '#3A2416',       // 法杖棕色
  staffDark: '#1F1208',   // 法杖深色
  staffLight: '#6B4423',  // 法杖亮
  orb: '#9933FF',         // 法杖顶球
  orbLight: '#CC99FF',    // 球亮
  orbGlow: '#FF99FF',     // 球发光
  // 鞋
  boot: '#0F0618',        // 深色鞋
  bootDark: '#000000',    // 鞋阴影
  bootLight: '#2A1A3D',   // 鞋亮
  // 符文/装饰
  rune: '#9966FF',        // 符文
  runeGlow: '#CC99FF',    // 符文发光
  highlight: '#ffffff',   // 高光
}

// 暗影法师高精度头像（16x16网格，聚焦头部特写）
const SORCERER_AVATAR = [
  // ===== 兜帽顶部边缘 =====
  [4, 0, SORCERER_COLORS.hoodDark], [5, 0, SORCERER_COLORS.hood], [6, 0, SORCERER_COLORS.hoodLight], [7, 0, SORCERER_COLORS.hoodLight], [8, 0, SORCERER_COLORS.hoodLight], [9, 0, SORCERER_COLORS.hood], [10, 0, SORCERER_COLORS.hoodDark],
  [4, 1, SORCERER_COLORS.hood], [5, 1, SORCERER_COLORS.hoodLight], [6, 1, SORCERER_COLORS.hood], [7, 1, SORCERER_COLORS.hoodLight], [8, 1, SORCERER_COLORS.hoodLight], [9, 1, SORCERER_COLORS.hood], [10, 1, SORCERER_COLORS.hoodLight], [11, 1, SORCERER_COLORS.hood],

  // ===== 兜帽第一层 =====
  [3, 2, SORCERER_COLORS.hoodDark], [4, 2, SORCERER_COLORS.hood], [5, 2, SORCERER_COLORS.hoodLight], [6, 2, SORCERER_COLORS.hood], [7, 2, SORCERER_COLORS.hoodLight], [8, 2, SORCERER_COLORS.hoodLight], [9, 2, SORCERER_COLORS.hood], [10, 2, SORCERER_COLORS.hoodLight], [11, 2, SORCERER_COLORS.hood], [12, 2, SORCERER_COLORS.hoodDark],
  [3, 3, SORCERER_COLORS.hoodDark], [4, 3, SORCERER_COLORS.hood], [5, 3, SORCERER_COLORS.hoodLight], [6, 3, SORCERER_COLORS.hood], [7, 3, SORCERER_COLORS.hoodLight], [8, 3, SORCERER_COLORS.hoodLight], [9, 3, SORCERER_COLORS.hood], [10, 3, SORCERER_COLORS.hoodLight], [11, 3, SORCERER_COLORS.hood], [12, 3, SORCERER_COLORS.hoodDark],

  // ===== 兜帽主体 =====
  [2, 4, SORCERER_COLORS.hoodDark], [3, 4, SORCERER_COLORS.hood], [4, 4, SORCERER_COLORS.hood], [5, 4, SORCERER_COLORS.hoodLight], [6, 4, SORCERER_COLORS.hood], [7, 4, SORCERER_COLORS.hoodLight], [8, 4, SORCERER_COLORS.hoodLight], [9, 4, SORCERER_COLORS.hood], [10, 4, SORCERER_COLORS.hoodLight], [11, 4, SORCERER_COLORS.hood], [12, 4, SORCERER_COLORS.hood], [13, 4, SORCERER_COLORS.hoodDark],
  [2, 5, SORCERER_COLORS.hoodDark], [3, 5, SORCERER_COLORS.hood], [4, 5, SORCERER_COLORS.hoodLight], [5, 5, SORCERER_COLORS.hood], [6, 5, SORCERER_COLORS.hoodLight], [7, 5, SORCERER_COLORS.hood], [8, 5, SORCERER_COLORS.hood], [9, 5, SORCERER_COLORS.hoodLight], [10, 5, SORCERER_COLORS.hood], [11, 5, SORCERER_COLORS.hoodLight], [12, 5, SORCERER_COLORS.hood], [13, 5, SORCERER_COLORS.hoodDark],

  // ===== 面巾区域 =====
  [3, 6, SORCERER_COLORS.hoodDark], [4, 6, SORCERER_COLORS.veil], [5, 6, SORCERER_COLORS.eye], [6, 6, SORCERER_COLORS.eyeGlow], [7, 6, SORCERER_COLORS.eyeGlow], [8, 6, SORCERER_COLORS.eyeGlow], [9, 6, SORCERER_COLORS.eye], [10, 6, SORCERER_COLORS.veil], [11, 6, SORCERER_COLORS.hoodDark],
  [4, 7, SORCERER_COLORS.veil], [5, 7, SORCERER_COLORS.eyeGlow], [6, 7, SORCERER_COLORS.eye], [7, 7, SORCERER_COLORS.eye], [8, 7, SORCERER_COLORS.eye], [9, 7, SORCERER_COLORS.eyeGlow], [10, 7, SORCERER_COLORS.veil],
  // 眼睛高光
  [5, 6, SORCERER_COLORS.highlight], [6, 6, SORCERER_COLORS.highlight], [9, 6, SORCERER_COLORS.highlight], [10, 6, SORCERER_COLORS.highlight],
  [5, 7, SORCERER_COLORS.highlight], [9, 7, SORCERER_COLORS.highlight],

  // ===== 嘴部面巾 =====
  [3, 8, SORCERER_COLORS.hoodDark], [4, 8, SORCERER_COLORS.veil], [5, 8, SORCERER_COLORS.veil], [6, 8, SORCERER_COLORS.veil], [7, 8, SORCERER_COLORS.veil], [8, 8, SORCERER_COLORS.veil], [9, 8, SORCERER_COLORS.veil], [10, 8, SORCERER_COLORS.veil], [11, 8, SORCERER_COLORS.hoodDark],

  // ===== 颈部 =====
  [4, 9, SORCERER_COLORS.robe], [5, 9, SORCERER_COLORS.robeLight], [6, 9, SORCERER_COLORS.rune], [7, 9, SORCERER_COLORS.runeGlow], [8, 9, SORCERER_COLORS.runeGlow], [9, 9, SORCERER_COLORS.rune], [10, 9, SORCERER_COLORS.robeLight], [11, 9, SORCERER_COLORS.robe],

  // ===== 长袍领口 =====
  [3, 10, SORCERER_COLORS.robeDark], [4, 10, SORCERER_COLORS.robe], [5, 10, SORCERER_COLORS.robeLight], [6, 10, SORCERER_COLORS.robe], [7, 10, SORCERER_COLORS.robe], [8, 10, SORCERER_COLORS.robe], [9, 10, SORCERER_COLORS.robeLight], [10, 10, SORCERER_COLORS.robe], [11, 10, SORCERER_COLORS.robeDark],
  [3, 11, SORCERER_COLORS.robeDark], [4, 11, SORCERER_COLORS.robe], [5, 11, SORCERER_COLORS.robeLight], [6, 11, SORCERER_COLORS.rune], [7, 11, SORCERER_COLORS.rune], [8, 11, SORCERER_COLORS.rune], [9, 11, SORCERER_COLORS.robeLight], [10, 11, SORCERER_COLORS.robe], [11, 11, SORCERER_COLORS.robeDark],

  // ===== 魔法符文装饰 =====
  [5, 10, SORCERER_COLORS.magicSpark], [6, 10, SORCERER_COLORS.magicLight], [9, 10, SORCERER_COLORS.magicLight], [10, 10, SORCERER_COLORS.magicSpark],
  [6, 9, SORCERER_COLORS.magicSpark], [9, 9, SORCERER_COLORS.magicSpark],

  // ===== 兜帽底部边缘 =====
  [4, 12, SORCERER_COLORS.hoodDark], [5, 12, SORCERER_COLORS.hood], [6, 12, SORCERER_COLORS.hoodLight], [7, 12, SORCERER_COLORS.hood], [8, 12, SORCERER_COLORS.hoodLight], [9, 12, SORCERER_COLORS.hood], [10, 12, SORCERER_COLORS.hoodDark],
  [5, 13, SORCERER_COLORS.hoodDark], [6, 13, SORCERER_COLORS.hood], [7, 13, SORCERER_COLORS.hoodLight], [8, 13, SORCERER_COLORS.hoodLight], [9, 13, SORCERER_COLORS.hood], [10, 13, SORCERER_COLORS.hoodDark],
]

// 正面 - 向下面朝
const SORCERER_FACE_DOWN = [
  // ===== 兜帽顶部 =====
  [5, 0, SORCERER_COLORS.hood], [6, 0, SORCERER_COLORS.hood], [7, 0, SORCERER_COLORS.hood], [8, 0, SORCERER_COLORS.hood], [9, 0, SORCERER_COLORS.hood],
  [4, 1, SORCERER_COLORS.hood], [5, 1, SORCERER_COLORS.hoodLight], [6, 1, SORCERER_COLORS.hood], [7, 1, SORCERER_COLORS.hood], [8, 1, SORCERER_COLORS.hood], [9, 1, SORCERER_COLORS.hoodLight], [10, 1, SORCERER_COLORS.hood],

  // ===== 兜帽主体 =====
  [3, 2, SORCERER_COLORS.hoodDark], [4, 2, SORCERER_COLORS.hood], [5, 2, SORCERER_COLORS.hoodLight], [6, 2, SORCERER_COLORS.hood], [7, 2, SORCERER_COLORS.hood], [8, 2, SORCERER_COLORS.hoodLight], [9, 2, SORCERER_COLORS.hood], [10, 2, SORCERER_COLORS.hoodDark],
  [3, 3, SORCERER_COLORS.hoodDark], [4, 3, SORCERER_COLORS.hood], [5, 3, SORCERER_COLORS.hoodLight], [6, 3, SORCERER_COLORS.hood], [7, 3, SORCERER_COLORS.hood], [8, 3, SORCERER_COLORS.hoodLight], [9, 3, SORCERER_COLORS.hood], [10, 3, SORCERER_COLORS.hoodDark],
  [2, 4, SORCERER_COLORS.hoodDark], [3, 4, SORCERER_COLORS.hood], [4, 4, SORCERER_COLORS.hood], [5, 4, SORCERER_COLORS.hoodLight], [6, 4, SORCERER_COLORS.hood], [7, 4, SORCERER_COLORS.hood], [8, 4, SORCERER_COLORS.hoodLight], [9, 4, SORCERER_COLORS.hood], [10, 4, SORCERER_COLORS.hood], [11, 4, SORCERER_COLORS.hoodDark],

  // ===== 面巾区（阴影中的脸）=====
  [4, 5, SORCERER_COLORS.veil], [5, 5, SORCERER_COLORS.eye], [6, 5, SORCERER_COLORS.eyeGlow], [7, 5, SORCERER_COLORS.eyeGlow], [8, 5, SORCERER_COLORS.eye], [9, 5, SORCERER_COLORS.veil],
  [4, 6, SORCERER_COLORS.veil], [5, 6, SORCERER_COLORS.eyeGlow], [6, 6, SORCERER_COLORS.eye], [7, 6, SORCERER_COLORS.eye], [8, 6, SORCERER_COLORS.eyeGlow], [9, 6, SORCERER_COLORS.veil],
  [3, 7, SORCERER_COLORS.hoodDark], [4, 7, SORCERER_COLORS.veil], [5, 7, SORCERER_COLORS.veil], [6, 7, SORCERER_COLORS.veil], [7, 7, SORCERER_COLORS.veil], [8, 7, SORCERER_COLORS.veil], [9, 7, SORCERER_COLORS.veil], [10, 7, SORCERER_COLORS.hoodDark],

  // ===== 颈部 + 长袍上部 =====
  [4, 8, SORCERER_COLORS.robe], [5, 8, SORCERER_COLORS.robeLight], [6, 8, SORCERER_COLORS.rune], [7, 8, SORCERER_COLORS.runeGlow], [8, 8, SORCERER_COLORS.robeLight], [9, 8, SORCERER_COLORS.robe],
  [3, 9, SORCERER_COLORS.robeDark], [4, 9, SORCERER_COLORS.robe], [5, 9, SORCERER_COLORS.robeLight], [6, 9, SORCERER_COLORS.robe], [7, 9, SORCERER_COLORS.robe], [8, 9, SORCERER_COLORS.robeLight], [9, 9, SORCERER_COLORS.robe], [10, 9, SORCERER_COLORS.robeDark],

  // ===== 长袍主体 =====
  [2, 10, SORCERER_COLORS.robeDark], [3, 10, SORCERER_COLORS.robe], [4, 10, SORCERER_COLORS.robeLight], [5, 10, SORCERER_COLORS.robe], [6, 10, SORCERER_COLORS.rune], [7, 10, SORCERER_COLORS.rune], [8, 10, SORCERER_COLORS.robe], [9, 10, SORCERER_COLORS.robeLight], [10, 10, SORCERER_COLORS.robe], [11, 10, SORCERER_COLORS.robeDark],
  [2, 11, SORCERER_COLORS.robeDark], [3, 11, SORCERER_COLORS.robe], [4, 11, SORCERER_COLORS.robe], [5, 11, SORCERER_COLORS.robeLight], [6, 11, SORCERER_COLORS.robe], [7, 11, SORCERER_COLORS.robe], [8, 11, SORCERER_COLORS.robeLight], [9, 11, SORCERER_COLORS.robe], [10, 11, SORCERER_COLORS.robe], [11, 11, SORCERER_COLORS.robeDark],
  [2, 12, SORCERER_COLORS.robeDark], [3, 12, SORCERER_COLORS.robe], [4, 12, SORCERER_COLORS.robe], [5, 12, SORCERER_COLORS.robeLight], [6, 12, SORCERER_COLORS.robe], [7, 12, SORCERER_COLORS.robe], [8, 12, SORCERER_COLORS.robeLight], [9, 12, SORCERER_COLORS.robe], [10, 12, SORCERER_COLORS.robe], [11, 12, SORCERER_COLORS.robeDark],

  // ===== 腰带 =====
  [3, 13, SORCERER_COLORS.belt], [4, 13, SORCERER_COLORS.belt], [5, 13, SORCERER_COLORS.beltBuckle], [6, 13, SORCERER_COLORS.runeGlow], [7, 13, SORCERER_COLORS.runeGlow], [8, 13, SORCERER_COLORS.beltBuckle], [9, 13, SORCERER_COLORS.belt], [10, 13, SORCERER_COLORS.belt],

  // ===== 长袍下部 =====
  [3, 14, SORCERER_COLORS.robe], [4, 14, SORCERER_COLORS.robeDark], [5, 14, SORCERER_COLORS.robe], [6, 14, SORCERER_COLORS.robeLight], [7, 14, SORCERER_COLORS.robeLight], [8, 14, SORCERER_COLORS.robe], [9, 14, SORCERER_COLORS.robeDark], [10, 14, SORCERER_COLORS.robe],
  [3, 15, SORCERER_COLORS.robeDark], [4, 15, SORCERER_COLORS.boot], [5, 15, SORCERER_COLORS.boot], [6, 15, SORCERER_COLORS.boot], [7, 15, SORCERER_COLORS.boot], [8, 15, SORCERER_COLORS.boot], [9, 15, SORCERER_COLORS.boot], [10, 15, SORCERER_COLORS.robeDark],

  // ===== 左手（持法杖）=====
  [1, 11, SORCERER_COLORS.hand], [0, 12, SORCERER_COLORS.handDark], [1, 12, SORCERER_COLORS.hand],
  [0, 13, SORCERER_COLORS.staff], [1, 13, SORCERER_COLORS.staffDark],
  [0, 14, SORCERER_COLORS.staff], [1, 14, SORCERER_COLORS.staff],
  [0, 15, SORCERER_COLORS.staffDark], [1, 15, SORCERER_COLORS.staff],

  // ===== 法杖顶（魔法球）=====
  [1, 9, SORCERER_COLORS.orbLight], [2, 9, SORCERER_COLORS.orb],
  [1, 10, SORCERER_COLORS.orbGlow], [2, 10, SORCERER_COLORS.orbLight],
]

// 背面 - 向上面朝
const SORCERER_FACE_UP = [
  // ===== 兜帽顶部 =====
  [5, 0, SORCERER_COLORS.hood], [6, 0, SORCERER_COLORS.hood], [7, 0, SORCERER_COLORS.hood], [8, 0, SORCERER_COLORS.hood], [9, 0, SORCERER_COLORS.hood],
  [4, 1, SORCERER_COLORS.hood], [5, 1, SORCERER_COLORS.hoodLight], [6, 1, SORCERER_COLORS.hood], [7, 1, SORCERER_COLORS.hood], [8, 1, SORCERER_COLORS.hood], [9, 1, SORCERER_COLORS.hoodLight], [10, 1, SORCERER_COLORS.hood],

  // ===== 兜帽背面 =====
  [3, 2, SORCERER_COLORS.hoodDark], [4, 2, SORCERER_COLORS.hood], [5, 2, SORCERER_COLORS.hoodLight], [6, 2, SORCERER_COLORS.hood], [7, 2, SORCERER_COLORS.hood], [8, 2, SORCERER_COLORS.hoodLight], [9, 2, SORCERER_COLORS.hood], [10, 2, SORCERER_COLORS.hoodDark],
  [3, 3, SORCERER_COLORS.hoodDark], [4, 3, SORCERER_COLORS.hood], [5, 3, SORCERER_COLORS.hoodLight], [6, 3, SORCERER_COLORS.hood], [7, 3, SORCERER_COLORS.hood], [8, 3, SORCERER_COLORS.hoodLight], [9, 3, SORCERER_COLORS.hood], [10, 3, SORCERER_COLORS.hoodDark],
  [3, 4, SORCERER_COLORS.hoodDark], [4, 4, SORCERER_COLORS.hood], [5, 4, SORCERER_COLORS.hood], [6, 4, SORCERER_COLORS.hoodLight], [7, 4, SORCERER_COLORS.hood], [8, 4, SORCERER_COLORS.hood], [9, 4, SORCERER_COLORS.hoodLight], [10, 4, SORCERER_COLORS.hood], [11, 4, SORCERER_COLORS.hoodDark],
  [3, 5, SORCERER_COLORS.hoodDark], [4, 5, SORCERER_COLORS.hood], [5, 5, SORCERER_COLORS.hood], [6, 5, SORCERER_COLORS.hoodLight], [7, 5, SORCERER_COLORS.hood], [8, 5, SORCERER_COLORS.hood], [9, 5, SORCERER_COLORS.hoodLight], [10, 5, SORCERER_COLORS.hood], [11, 5, SORCERER_COLORS.hoodDark],
  [4, 6, SORCERER_COLORS.hoodDark], [5, 6, SORCERER_COLORS.hood], [6, 6, SORCERER_COLORS.hoodLight], [7, 6, SORCERER_COLORS.hood], [8, 6, SORCERER_COLORS.hoodLight], [9, 6, SORCERER_COLORS.hood], [10, 6, SORCERER_COLORS.hoodDark],

  // ===== 长袍颈部背面 =====
  [4, 7, SORCERER_COLORS.robe], [5, 7, SORCERER_COLORS.robeLight], [6, 7, SORCERER_COLORS.robe], [7, 7, SORCERER_COLORS.robe], [8, 7, SORCERER_COLORS.robeLight], [9, 7, SORCERER_COLORS.robe],

  // ===== 长袍背部主体 =====
  [3, 8, SORCERER_COLORS.robeDark], [4, 8, SORCERER_COLORS.robe], [5, 8, SORCERER_COLORS.robeLight], [6, 8, SORCERER_COLORS.rune], [7, 8, SORCERER_COLORS.runeGlow], [8, 8, SORCERER_COLORS.robeLight], [9, 8, SORCERER_COLORS.robe], [10, 8, SORCERER_COLORS.robeDark],
  [2, 9, SORCERER_COLORS.robeDark], [3, 9, SORCERER_COLORS.robe], [4, 9, SORCERER_COLORS.robe], [5, 9, SORCERER_COLORS.robeLight], [6, 9, SORCERER_COLORS.rune], [7, 9, SORCERER_COLORS.rune], [8, 9, SORCERER_COLORS.robeLight], [9, 9, SORCERER_COLORS.robe], [10, 9, SORCERER_COLORS.robe], [11, 9, SORCERER_COLORS.robeDark],
  [2, 10, SORCERER_COLORS.robeDark], [3, 10, SORCERER_COLORS.robe], [4, 10, SORCERER_COLORS.robeLight], [5, 10, SORCERER_COLORS.robe], [6, 10, SORCERER_COLORS.runeGlow], [7, 10, SORCERER_COLORS.runeGlow], [8, 10, SORCERER_COLORS.robe], [9, 10, SORCERER_COLORS.robeLight], [10, 10, SORCERER_COLORS.robe], [11, 10, SORCERER_COLORS.robeDark],
  [2, 11, SORCERER_COLORS.robeDark], [3, 11, SORCERER_COLORS.robe], [4, 11, SORCERER_COLORS.robe], [5, 11, SORCERER_COLORS.robeLight], [6, 11, SORCERER_COLORS.robe], [7, 11, SORCERER_COLORS.robe], [8, 11, SORCERER_COLORS.robeLight], [9, 11, SORCERER_COLORS.robe], [10, 11, SORCERER_COLORS.robe], [11, 11, SORCERER_COLORS.robeDark],
  [3, 12, SORCERER_COLORS.robeDark], [4, 12, SORCERER_COLORS.robe], [5, 12, SORCERER_COLORS.robe], [6, 12, SORCERER_COLORS.robeLight], [7, 12, SORCERER_COLORS.robe], [8, 12, SORCERER_COLORS.robeLight], [9, 12, SORCERER_COLORS.robe], [10, 12, SORCERER_COLORS.robe],

  // ===== 腰带 =====
  [4, 13, SORCERER_COLORS.belt], [5, 13, SORCERER_COLORS.belt], [6, 13, SORCERER_COLORS.beltBuckle], [7, 13, SORCERER_COLORS.beltBuckle], [8, 13, SORCERER_COLORS.belt], [9, 13, SORCERER_COLORS.belt],

  // ===== 长袍下部 =====
  [3, 14, SORCERER_COLORS.robe], [4, 14, SORCERER_COLORS.robeDark], [5, 14, SORCERER_COLORS.robe], [6, 14, SORCERER_COLORS.robeLight], [7, 14, SORCERER_COLORS.robeLight], [8, 14, SORCERER_COLORS.robe], [9, 14, SORCERER_COLORS.robeDark], [10, 14, SORCERER_COLORS.robe],
  [3, 15, SORCERER_COLORS.robeDark], [4, 15, SORCERER_COLORS.boot], [5, 15, SORCERER_COLORS.boot], [6, 15, SORCERER_COLORS.boot], [7, 15, SORCERER_COLORS.boot], [8, 15, SORCERER_COLORS.boot], [9, 15, SORCERER_COLORS.boot], [10, 15, SORCERER_COLORS.robeDark],

  // ===== 法杖（背面从右侧伸出）=====
  [12, 10, SORCERER_COLORS.orbLight], [13, 10, SORCERER_COLORS.orb],
  [12, 11, SORCERER_COLORS.orb], [13, 11, SORCERER_COLORS.orbGlow],
  [12, 12, SORCERER_COLORS.staff], [13, 12, SORCERER_COLORS.staffDark],
  [12, 13, SORCERER_COLORS.staff], [13, 13, SORCERER_COLORS.staff],
  [12, 14, SORCERER_COLORS.staffDark], [13, 14, SORCERER_COLORS.staff],
  [12, 15, SORCERER_COLORS.staffDark],
]

// 向左面朝 - 侧面（兜帽覆盖侧脸，能看到一只眼）
const SORCERER_FACE_LEFT = [
  // ===== 兜帽顶部 =====
  [5, 0, SORCERER_COLORS.hood], [6, 0, SORCERER_COLORS.hood], [7, 0, SORCERER_COLORS.hood], [8, 0, SORCERER_COLORS.hood],
  [4, 1, SORCERER_COLORS.hood], [5, 1, SORCERER_COLORS.hoodLight], [6, 1, SORCERER_COLORS.hood], [7, 1, SORCERER_COLORS.hood], [8, 1, SORCERER_COLORS.hood], [9, 1, SORCERER_COLORS.hoodDark],

  // ===== 兜帽主体 =====
  [3, 2, SORCERER_COLORS.hoodDark], [4, 2, SORCERER_COLORS.hood], [5, 2, SORCERER_COLORS.hoodLight], [6, 2, SORCERER_COLORS.hood], [7, 2, SORCERER_COLORS.hood], [8, 2, SORCERER_COLORS.hoodLight], [9, 2, SORCERER_COLORS.hoodDark],
  [3, 3, SORCERER_COLORS.hoodDark], [4, 3, SORCERER_COLORS.hood], [5, 3, SORCERER_COLORS.hoodLight], [6, 3, SORCERER_COLORS.hood], [7, 3, SORCERER_COLORS.hood], [8, 3, SORCERER_COLORS.hood], [9, 3, SORCERER_COLORS.hoodDark],
  [2, 4, SORCERER_COLORS.hoodDark], [3, 4, SORCERER_COLORS.hood], [4, 4, SORCERER_COLORS.hood], [5, 4, SORCERER_COLORS.hoodLight], [6, 4, SORCERER_COLORS.hood], [7, 4, SORCERER_COLORS.hood], [8, 4, SORCERER_COLORS.hoodDark],

  // ===== 面巾 + 侧面一只眼睛 =====
  [3, 5, SORCERER_COLORS.hoodDark], [4, 5, SORCERER_COLORS.veil], [5, 5, SORCERER_COLORS.eye], [6, 5, SORCERER_COLORS.eyeGlow], [7, 5, SORCERER_COLORS.hood],
  [3, 6, SORCERER_COLORS.hoodDark], [4, 6, SORCERER_COLORS.veil], [5, 6, SORCERER_COLORS.eyeGlow], [6, 6, SORCERER_COLORS.veil], [7, 6, SORCERER_COLORS.hoodDark],
  [3, 7, SORCERER_COLORS.hoodDark], [4, 7, SORCERER_COLORS.veil], [5, 7, SORCERER_COLORS.veil], [6, 7, SORCERER_COLORS.veil], [7, 7, SORCERER_COLORS.hoodDark],

  // ===== 长袍上部（侧面）=====
  [3, 8, SORCERER_COLORS.robe], [4, 8, SORCERER_COLORS.robeLight], [5, 8, SORCERER_COLORS.robe], [6, 8, SORCERER_COLORS.robeLight], [7, 8, SORCERER_COLORS.robe],
  [2, 9, SORCERER_COLORS.robeDark], [3, 9, SORCERER_COLORS.robe], [4, 9, SORCERER_COLORS.robe], [5, 9, SORCERER_COLORS.robeLight], [6, 9, SORCERER_COLORS.robe], [7, 9, SORCERER_COLORS.robe], [8, 9, SORCERER_COLORS.robeDark],

  // ===== 长袍主体 =====
  [2, 10, SORCERER_COLORS.robeDark], [3, 10, SORCERER_COLORS.robe], [4, 10, SORCERER_COLORS.robeLight], [5, 10, SORCERER_COLORS.robe], [6, 10, SORCERER_COLORS.rune], [7, 10, SORCERER_COLORS.robe], [8, 10, SORCERER_COLORS.robeDark],
  [1, 11, SORCERER_COLORS.robeDark], [2, 11, SORCERER_COLORS.robe], [3, 11, SORCERER_COLORS.robe], [4, 11, SORCERER_COLORS.robeLight], [5, 11, SORCERER_COLORS.robe], [6, 11, SORCERER_COLORS.robe], [7, 11, SORCERER_COLORS.robeLight], [8, 11, SORCERER_COLORS.robe], [9, 11, SORCERER_COLORS.robeDark],
  [1, 12, SORCERER_COLORS.robeDark], [2, 12, SORCERER_COLORS.robe], [3, 12, SORCERER_COLORS.robe], [4, 12, SORCERER_COLORS.robe], [5, 12, SORCERER_COLORS.robeLight], [6, 12, SORCERER_COLORS.robe], [7, 12, SORCERER_COLORS.robe], [8, 12, SORCERER_COLORS.robe], [9, 12, SORCERER_COLORS.robeDark],

  // ===== 腰带 =====
  [2, 13, SORCERER_COLORS.belt], [3, 13, SORCERER_COLORS.belt], [4, 13, SORCERER_COLORS.beltBuckle], [5, 13, SORCERER_COLORS.runeGlow], [6, 13, SORCERER_COLORS.belt], [7, 13, SORCERER_COLORS.belt], [8, 13, SORCERER_COLORS.belt],

  // ===== 长袍下部 =====
  [2, 14, SORCERER_COLORS.robeDark], [3, 14, SORCERER_COLORS.robe], [4, 14, SORCERER_COLORS.robeLight], [5, 14, SORCERER_COLORS.robe], [6, 14, SORCERER_COLORS.robe], [7, 14, SORCERER_COLORS.robeLight], [8, 14, SORCERER_COLORS.robe], [9, 14, SORCERER_COLORS.robeDark],
  [2, 15, SORCERER_COLORS.robeDark], [3, 15, SORCERER_COLORS.boot], [4, 15, SORCERER_COLORS.boot], [5, 15, SORCERER_COLORS.boot], [6, 15, SORCERER_COLORS.boot], [7, 15, SORCERER_COLORS.boot], [8, 15, SORCERER_COLORS.boot], [9, 15, SORCERER_COLORS.robeDark],

  // ===== 法杖（向前/向左伸出）=====
  [0, 7, SORCERER_COLORS.orbGlow], [1, 7, SORCERER_COLORS.orbLight],
  [0, 8, SORCERER_COLORS.orbLight], [1, 8, SORCERER_COLORS.orb],
  [0, 9, SORCERER_COLORS.staff], [1, 9, SORCERER_COLORS.staffDark],
  [0, 10, SORCERER_COLORS.staff], [1, 10, SORCERER_COLORS.staff],

  // ===== 手（持法杖）=====
  [0, 11, SORCERER_COLORS.hand], [1, 11, SORCERER_COLORS.handDark],
]

// 向右面朝 - 侧面镜像
const SORCERER_FACE_RIGHT = [
  // ===== 兜帽顶部 =====
  [6, 0, SORCERER_COLORS.hood], [7, 0, SORCERER_COLORS.hood], [8, 0, SORCERER_COLORS.hood], [9, 0, SORCERER_COLORS.hood],
  [5, 1, SORCERER_COLORS.hoodDark], [6, 1, SORCERER_COLORS.hood], [7, 1, SORCERER_COLORS.hood], [8, 1, SORCERER_COLORS.hood], [9, 1, SORCERER_COLORS.hoodLight], [10, 1, SORCERER_COLORS.hood],

  // ===== 兜帽主体 =====
  [5, 2, SORCERER_COLORS.hoodDark], [6, 2, SORCERER_COLORS.hoodLight], [7, 2, SORCERER_COLORS.hood], [8, 2, SORCERER_COLORS.hood], [9, 2, SORCERER_COLORS.hoodLight], [10, 2, SORCERER_COLORS.hood], [11, 2, SORCERER_COLORS.hoodDark],
  [5, 3, SORCERER_COLORS.hoodDark], [6, 3, SORCERER_COLORS.hood], [7, 3, SORCERER_COLORS.hood], [8, 3, SORCERER_COLORS.hoodLight], [9, 3, SORCERER_COLORS.hood], [10, 3, SORCERER_COLORS.hood], [11, 3, SORCERER_COLORS.hoodDark],
  [6, 4, SORCERER_COLORS.hoodDark], [7, 4, SORCERER_COLORS.hood], [8, 4, SORCERER_COLORS.hoodLight], [9, 4, SORCERER_COLORS.hood], [10, 4, SORCERER_COLORS.hood], [11, 4, SORCERER_COLORS.hood], [12, 4, SORCERER_COLORS.hoodDark],

  // ===== 面巾 + 侧面一只眼睛 =====
  [7, 5, SORCERER_COLORS.hood], [8, 5, SORCERER_COLORS.eyeGlow], [9, 5, SORCERER_COLORS.eye], [10, 5, SORCERER_COLORS.veil], [11, 5, SORCERER_COLORS.hoodDark],
  [7, 6, SORCERER_COLORS.hoodDark], [8, 6, SORCERER_COLORS.veil], [9, 6, SORCERER_COLORS.eyeGlow], [10, 6, SORCERER_COLORS.veil], [11, 6, SORCERER_COLORS.hoodDark],
  [7, 7, SORCERER_COLORS.hoodDark], [8, 7, SORCERER_COLORS.veil], [9, 7, SORCERER_COLORS.veil], [10, 7, SORCERER_COLORS.veil], [11, 7, SORCERER_COLORS.hoodDark],

  // ===== 长袍上部（侧面）=====
  [6, 8, SORCERER_COLORS.robe], [7, 8, SORCERER_COLORS.robeLight], [8, 8, SORCERER_COLORS.robe], [9, 8, SORCERER_COLORS.robeLight], [10, 8, SORCERER_COLORS.robe],
  [6, 9, SORCERER_COLORS.robeDark], [7, 9, SORCERER_COLORS.robe], [8, 9, SORCERER_COLORS.robeLight], [9, 9, SORCERER_COLORS.robe], [10, 9, SORCERER_COLORS.robe], [11, 9, SORCERER_COLORS.robe], [12, 9, SORCERER_COLORS.robeDark],

  // ===== 长袍主体 =====
  [6, 10, SORCERER_COLORS.robeDark], [7, 10, SORCERER_COLORS.robe], [8, 10, SORCERER_COLORS.rune], [9, 10, SORCERER_COLORS.robe], [10, 10, SORCERER_COLORS.robeLight], [11, 10, SORCERER_COLORS.robe], [12, 10, SORCERER_COLORS.robeDark],
  [5, 11, SORCERER_COLORS.robeDark], [6, 11, SORCERER_COLORS.robe], [7, 11, SORCERER_COLORS.robeLight], [8, 11, SORCERER_COLORS.robe], [9, 11, SORCERER_COLORS.robe], [10, 11, SORCERER_COLORS.robeLight], [11, 11, SORCERER_COLORS.robe], [12, 11, SORCERER_COLORS.robe], [13, 11, SORCERER_COLORS.robeDark],
  [5, 12, SORCERER_COLORS.robeDark], [6, 12, SORCERER_COLORS.robe], [7, 12, SORCERER_COLORS.robe], [8, 12, SORCERER_COLORS.robe], [9, 12, SORCERER_COLORS.robeLight], [10, 12, SORCERER_COLORS.robe], [11, 12, SORCERER_COLORS.robe], [12, 12, SORCERER_COLORS.robe], [13, 12, SORCERER_COLORS.robeDark],

  // ===== 腰带 =====
  [6, 13, SORCERER_COLORS.belt], [7, 13, SORCERER_COLORS.belt], [8, 13, SORCERER_COLORS.runeGlow], [9, 13, SORCERER_COLORS.beltBuckle], [10, 13, SORCERER_COLORS.belt], [11, 13, SORCERER_COLORS.belt], [12, 13, SORCERER_COLORS.belt],

  // ===== 长袍下部 =====
  [5, 14, SORCERER_COLORS.robeDark], [6, 14, SORCERER_COLORS.robe], [7, 14, SORCERER_COLORS.robeLight], [8, 14, SORCERER_COLORS.robe], [9, 14, SORCERER_COLORS.robe], [10, 14, SORCERER_COLORS.robeLight], [11, 14, SORCERER_COLORS.robe], [12, 14, SORCERER_COLORS.robeDark],
  [5, 15, SORCERER_COLORS.robeDark], [6, 15, SORCERER_COLORS.boot], [7, 15, SORCERER_COLORS.boot], [8, 15, SORCERER_COLORS.boot], [9, 15, SORCERER_COLORS.boot], [10, 15, SORCERER_COLORS.boot], [11, 15, SORCERER_COLORS.boot], [12, 15, SORCERER_COLORS.robeDark],

  // ===== 法杖（向右伸出）=====
  [13, 7, SORCERER_COLORS.orbLight], [14, 7, SORCERER_COLORS.orbGlow],
  [13, 8, SORCERER_COLORS.orb], [14, 8, SORCERER_COLORS.orbLight],
  [13, 9, SORCERER_COLORS.staffDark], [14, 9, SORCERER_COLORS.staff],
  [13, 10, SORCERER_COLORS.staff], [14, 10, SORCERER_COLORS.staff],

  // ===== 手（持法杖）=====
  [13, 11, SORCERER_COLORS.handDark], [14, 11, SORCERER_COLORS.hand],
]

// 待机动画帧（魔法球闪烁 + 眼睛发光）
const SORCERER_IDLE_FRAMES = [
  // 帧0 - 魔法球暗
  [
    { pixels: [
      [6, 8, SORCERER_COLORS.rune], [7, 8, SORCERER_COLORS.runeGlow],
      [5, 5, SORCERER_COLORS.eye], [8, 5, SORCERER_COLORS.eye],
    ] }
  ],
  // 帧1 - 魔法球亮（闪光）
  [
    { pixels: [
      [6, 8, SORCERER_COLORS.runeGlow], [7, 8, SORCERER_COLORS.eyeGlow],
      [5, 5, SORCERER_COLORS.eyeGlow], [8, 5, SORCERER_COLORS.eyeGlow],
    ] }
  ],
]

// 行走动画帧（长袍下摆起伏）
const SORCERER_WALK_FRAMES = [
  // 帧0 - 左脚前
  [
    { pixels: [
      [3, 15, SORCERER_COLORS.boot], [4, 15, SORCERER_COLORS.bootDark], [5, 15, SORCERER_COLORS.boot], [6, 15, SORCERER_COLORS.bootLight], [7, 15, SORCERER_COLORS.boot], [8, 15, SORCERER_COLORS.bootDark], [9, 15, SORCERER_COLORS.boot], [10, 15, SORCERER_COLORS.robeDark],
    ] }
  ],
  // 帧1 - 中间
  [
    { pixels: [
      [3, 15, SORCERER_COLORS.robeDark], [4, 15, SORCERER_COLORS.boot], [5, 15, SORCERER_COLORS.boot], [6, 15, SORCERER_COLORS.boot], [7, 15, SORCERER_COLORS.boot], [8, 15, SORCERER_COLORS.boot], [9, 15, SORCERER_COLORS.boot], [10, 15, SORCERER_COLORS.robeDark],
    ] }
  ],
  // 帧2 - 右脚前
  [
    { pixels: [
      [3, 15, SORCERER_COLORS.robeDark], [4, 15, SORCERER_COLORS.boot], [5, 15, SORCERER_COLORS.bootDark], [6, 15, SORCERER_COLORS.boot], [7, 15, SORCERER_COLORS.boot], [8, 15, SORCERER_COLORS.bootLight], [9, 15, SORCERER_COLORS.boot], [10, 15, SORCERER_COLORS.bootDark],
    ] }
  ],
]

export const drawShadowSorcerer = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: SORCERER_FACE_DOWN,
  up: SORCERER_FACE_UP,
  left: SORCERER_FACE_LEFT,
  right: SORCERER_FACE_RIGHT,
  walk: SORCERER_WALK_FRAMES,
  idle: SORCERER_IDLE_FRAMES,
})


export const drawShadowSorcererAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, SORCERER_AVATAR)