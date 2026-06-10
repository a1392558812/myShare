import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.003,
  WALK_SPEED: 0.08,
}

// 黑暗封印师颜色（暗紫/黑色为主，带堕落宗教元素）
const BINDER_COLORS = {
  // 兜帽/头部
  hood: '#2A1A3A',          // 兜帽主色 - 深紫黑
  hoodDark: '#1A0A2A',      // 兜帽暗
  hoodLight: '#3A2A4A',     // 兜帽亮
  hoodGlow: '#5A3A6A',      // 兜帽发光
  faceShadow: '#1A0A1A',    // 面部阴影
  // 眼睛 - 紫红发光
  eye: '#FF00FF',           // 眼睛 - 紫红
  eyeGlow: '#FF66FF',       // 眼睛发光
  eyeInner: '#FFFFFF',      // 内核
  // 长袍
  robe: '#2A1A2A',          // 长袍主色 - 深紫褐
  robeDark: '#1A0A1A',      // 长袍暗
  robeLight: '#3A2A3A',     // 长袍亮
  robePurple: '#4A2A4A',    // 长袍紫
  // 破损细节
  tatter: '#3A2A2A',        // 破布
  tatterDark: '#2A1A1A',    // 破布暗
  // 宗教元素
  cross: '#8A8A8A',         // 十字架 - 银色
  crossDark: '#5A5A5A',     // 十字架暗
  crossLight: '#AAAAAA',     // 十字架亮
  chain: '#6A6A6A',         // 链条
  // 黑暗魔法书
  book: '#3A1A1A',          // 书本封面 - 暗红黑
  bookDark: '#2A0A0A',      // 书本暗
  bookLight: '#5A2A2A',     // 书本亮
  bookGold: '#D4AF37',      // 金边
  bookRune: '#FF00FF',      // 书符文
  bookRuneGlow: '#FF66FF',  // 符文发光
  page: '#E8D8C8',          // 书页
  pageDark: '#C8B8A8',      // 书页暗
  pageRune: '#AA00AA',      // 页符文
  // 手
  hand: '#8A6A6A',          // 手 - 苍白
  handDark: '#6A4A4A',      // 手暗
  // 黑暗灵气
  darkness: '#4A0A4A',      // 黑暗
  darknessGlow: '#8A2A8A',  // 黑暗发光
  darkMist: '#3A1A3A',      // 黑雾
  spark: '#FF00FF',         // 魔法粒子
  // 靴子
  boot: '#2A1A1A',          // 靴
  bootDark: '#1A0A0A',      // 靴暗
  bootLight: '#3A2A2A',     // 靴亮
  // 符文/魔法
  rune: '#FF00FF',           // 符文 - 紫红
  runeGlow: '#FF66FF',      // 符文发光
  runeDark: '#AA00AA',      // 符文暗
  highlight: '#FFFFFF',       // 高光
}

// 黑暗封印师高精度头像（16x16网格，聚焦兜帽头部特写）
const BINDER_AVATAR = [
  // ===== 兜帽顶部边缘 =====
  [4, 0, BINDER_COLORS.hoodDark], [5, 0, BINDER_COLORS.hood], [6, 0, BINDER_COLORS.hood], [7, 0, BINDER_COLORS.hood], [8, 0, BINDER_COLORS.hood], [9, 0, BINDER_COLORS.hood], [10, 0, BINDER_COLORS.hoodDark],
  [3, 1, BINDER_COLORS.hoodDark], [4, 1, BINDER_COLORS.hood], [5, 1, BINDER_COLORS.hoodLight], [6, 1, BINDER_COLORS.hood], [7, 1, BINDER_COLORS.hood], [8, 1, BINDER_COLORS.hoodLight], [9, 1, BINDER_COLORS.hood], [10, 1, BINDER_COLORS.hoodLight], [11, 1, BINDER_COLORS.hood], [12, 1, BINDER_COLORS.hoodDark],

  // ===== 兜帽第一层 =====
  [3, 2, BINDER_COLORS.hoodDark], [4, 2, BINDER_COLORS.hood], [5, 2, BINDER_COLORS.hoodGlow], [6, 2, BINDER_COLORS.hood], [7, 2, BINDER_COLORS.hood], [8, 2, BINDER_COLORS.hood], [9, 2, BINDER_COLORS.hoodGlow], [10, 2, BINDER_COLORS.hood], [11, 2, BINDER_COLORS.hoodDark],
  [3, 3, BINDER_COLORS.hoodDark], [4, 3, BINDER_COLORS.hood], [5, 3, BINDER_COLORS.hoodLight], [6, 3, BINDER_COLORS.hood], [7, 3, BINDER_COLORS.hoodGlow], [8, 3, BINDER_COLORS.hoodGlow], [9, 3, BINDER_COLORS.hood], [10, 3, BINDER_COLORS.hoodLight], [11, 3, BINDER_COLORS.hood], [12, 3, BINDER_COLORS.hoodDark],

  // ===== 脸部区域（阴影遮蔽）=====
  [2, 4, BINDER_COLORS.hoodDark], [3, 4, BINDER_COLORS.hood], [4, 4, BINDER_COLORS.faceShadow], [5, 4, BINDER_COLORS.faceShadow], [6, 4, BINDER_COLORS.faceShadow], [7, 4, BINDER_COLORS.faceShadow], [8, 4, BINDER_COLORS.faceShadow], [9, 4, BINDER_COLORS.faceShadow], [10, 4, BINDER_COLORS.faceShadow], [11, 4, BINDER_COLORS.hood], [12, 4, BINDER_COLORS.hoodDark],
  [2, 5, BINDER_COLORS.hoodDark], [3, 5, BINDER_COLORS.hood], [4, 5, BINDER_COLORS.faceShadow], [5, 5, BINDER_COLORS.eye], [6, 5, BINDER_COLORS.eyeGlow], [7, 5, BINDER_COLORS.eyeGlow], [8, 5, BINDER_COLORS.eyeGlow], [9, 5, BINDER_COLORS.eyeGlow], [10, 5, BINDER_COLORS.eye], [11, 5, BINDER_COLORS.faceShadow], [12, 5, BINDER_COLORS.hood], [13, 5, BINDER_COLORS.hoodDark],

  // ===== 眼睛高光 =====
  [5, 4, BINDER_COLORS.highlight], [6, 4, BINDER_COLORS.highlight], [8, 4, BINDER_COLORS.highlight], [9, 4, BINDER_COLORS.highlight],
  [5, 5, BINDER_COLORS.highlight], [9, 5, BINDER_COLORS.highlight],

  // ===== 眼睛内核发光 =====
  [5, 5, BINDER_COLORS.eyeInner], [6, 5, BINDER_COLORS.eyeInner], [8, 5, BINDER_COLORS.eyeInner], [9, 5, BINDER_COLORS.eyeInner],

  // ===== 面部阴影 + 嘴巴区域 =====
  [3, 6, BINDER_COLORS.hoodDark], [4, 6, BINDER_COLORS.faceShadow], [5, 6, BINDER_COLORS.faceShadow], [6, 6, BINDER_COLORS.faceShadow], [7, 6, BINDER_COLORS.faceShadow], [8, 6, BINDER_COLORS.faceShadow], [9, 6, BINDER_COLORS.faceShadow], [10, 6, BINDER_COLORS.faceShadow], [11, 6, BINDER_COLORS.hoodDark],
  [4, 7, BINDER_COLORS.faceShadow], [5, 7, BINDER_COLORS.faceShadow], [6, 7, BINDER_COLORS.faceShadow], [7, 7, BINDER_COLORS.faceShadow], [8, 7, BINDER_COLORS.faceShadow], [9, 7, BINDER_COLORS.faceShadow], [10, 7, BINDER_COLORS.faceShadow],

  // ===== 兜帽底部 + 颈部 =====
  [3, 8, BINDER_COLORS.hoodDark], [4, 8, BINDER_COLORS.hood], [5, 8, BINDER_COLORS.hoodLight], [6, 8, BINDER_COLORS.hood], [7, 8, BINDER_COLORS.hood], [8, 8, BINDER_COLORS.hood], [9, 8, BINDER_COLORS.hoodLight], [10, 8, BINDER_COLORS.hood], [11, 8, BINDER_COLORS.hoodDark],
  [4, 9, BINDER_COLORS.hood], [5, 9, BINDER_COLORS.hoodLight], [6, 9, BINDER_COLORS.hoodGlow], [7, 9, BINDER_COLORS.hoodGlow], [8, 9, BINDER_COLORS.hoodGlow], [9, 9, BINDER_COLORS.hoodGlow], [10, 9, BINDER_COLORS.hoodLight], [11, 9, BINDER_COLORS.hood],

  // ===== 十字架项链 =====
  [5, 10, BINDER_COLORS.chain], [6, 10, BINDER_COLORS.chain], [7, 10, BINDER_COLORS.chain], [8, 10, BINDER_COLORS.chain], [9, 10, BINDER_COLORS.chain],
  [6, 11, BINDER_COLORS.cross], [7, 11, BINDER_COLORS.cross], [8, 11, BINDER_COLORS.cross],
  [5, 12, BINDER_COLORS.cross], [6, 12, BINDER_COLORS.crossDark], [7, 12, BINDER_COLORS.crossDark], [8, 12, BINDER_COLORS.crossDark], [9, 12, BINDER_COLORS.cross],
  [6, 13, BINDER_COLORS.crossLight], [7, 13, BINDER_COLORS.crossLight], [8, 13, BINDER_COLORS.crossLight],

  // ===== 长袍领口 =====
  [3, 10, BINDER_COLORS.robeDark], [4, 10, BINDER_COLORS.robe], [5, 10, BINDER_COLORS.robeLight], [10, 10, BINDER_COLORS.robeLight], [11, 10, BINDER_COLORS.robe], [12, 10, BINDER_COLORS.robeDark],
  [2, 11, BINDER_COLORS.robeDark], [3, 11, BINDER_COLORS.robe], [4, 11, BINDER_COLORS.robeLight], [11, 11, BINDER_COLORS.robeLight], [12, 11, BINDER_COLORS.robe], [13, 11, BINDER_COLORS.robeDark],

  // ===== 符文装饰 =====
  [5, 10, BINDER_COLORS.rune], [6, 10, BINDER_COLORS.runeGlow], [9, 10, BINDER_COLORS.runeGlow], [10, 10, BINDER_COLORS.rune],
  [6, 11, BINDER_COLORS.runeGlow], [9, 11, BINDER_COLORS.runeGlow],
  [5, 11, BINDER_COLORS.darknessGlow], [10, 11, BINDER_COLORS.darknessGlow],

  // ===== 兜帽底部边缘 =====
  [4, 14, BINDER_COLORS.hoodDark], [5, 14, BINDER_COLORS.hood], [6, 14, BINDER_COLORS.hoodLight], [7, 14, BINDER_COLORS.hoodLight], [8, 14, BINDER_COLORS.hoodLight], [9, 14, BINDER_COLORS.hood], [10, 14, BINDER_COLORS.hoodDark],
  [5, 15, BINDER_COLORS.hoodDark], [6, 15, BINDER_COLORS.hood], [7, 15, BINDER_COLORS.hood], [8, 15, BINDER_COLORS.hood], [9, 15, BINDER_COLORS.hoodDark],
]

// 向下面朝 - 正面（已居中，x偏移+2）
const BINDER_FACE_DOWN = [
  // ===== 兜帽顶部 =====
  [7, 0, BINDER_COLORS.hoodDark], [8, 0, BINDER_COLORS.hood], [9, 0, BINDER_COLORS.hood], [10, 0, BINDER_COLORS.hoodDark],
  [6, 1, BINDER_COLORS.hood], [7, 1, BINDER_COLORS.hoodLight], [8, 1, BINDER_COLORS.hood], [9, 1, BINDER_COLORS.hood], [10, 1, BINDER_COLORS.hoodLight], [11, 1, BINDER_COLORS.hood],
  [5, 2, BINDER_COLORS.hoodDark], [6, 2, BINDER_COLORS.hood], [7, 2, BINDER_COLORS.hoodGlow], [8, 2, BINDER_COLORS.faceShadow], [9, 2, BINDER_COLORS.faceShadow], [10, 2, BINDER_COLORS.hoodGlow], [11, 2, BINDER_COLORS.hood], [12, 2, BINDER_COLORS.hoodDark],

  // ===== 脸部区域（阴影 + 眼睛）=====
  [6, 3, BINDER_COLORS.hood], [7, 3, BINDER_COLORS.faceShadow], [8, 3, BINDER_COLORS.eye], [9, 3, BINDER_COLORS.eye], [10, 3, BINDER_COLORS.faceShadow], [11, 3, BINDER_COLORS.hood],
  [6, 4, BINDER_COLORS.hoodDark], [7, 4, BINDER_COLORS.faceShadow], [8, 4, BINDER_COLORS.eyeGlow], [9, 4, BINDER_COLORS.eyeGlow], [10, 4, BINDER_COLORS.faceShadow], [11, 4, BINDER_COLORS.hoodDark],
  [7, 5, BINDER_COLORS.eyeInner], [8, 5, BINDER_COLORS.faceShadow], [9, 5, BINDER_COLORS.faceShadow], [10, 5, BINDER_COLORS.eyeInner],
  [6, 6, BINDER_COLORS.hood], [7, 6, BINDER_COLORS.faceShadow], [8, 6, BINDER_COLORS.faceShadow], [9, 6, BINDER_COLORS.faceShadow], [10, 6, BINDER_COLORS.faceShadow], [11, 6, BINDER_COLORS.hood],

  // ===== 十字架项链 =====
  [8, 7, BINDER_COLORS.chain], [9, 7, BINDER_COLORS.chain],
  [8, 8, BINDER_COLORS.cross], [9, 8, BINDER_COLORS.cross],
  [7, 9, BINDER_COLORS.cross], [8, 9, BINDER_COLORS.crossDark], [9, 9, BINDER_COLORS.crossDark], [10, 9, BINDER_COLORS.cross],

  // ===== 长袍上身 =====
  [5, 6, BINDER_COLORS.robeDark], [6, 6, BINDER_COLORS.robe], [7, 6, BINDER_COLORS.robeLight], [11, 6, BINDER_COLORS.robeLight], [12, 6, BINDER_COLORS.robe], [13, 6, BINDER_COLORS.robeDark],
  [4, 7, BINDER_COLORS.robeDark], [5, 7, BINDER_COLORS.robe], [6, 7, BINDER_COLORS.robeLight], [7, 7, BINDER_COLORS.robe], [8, 7, BINDER_COLORS.robePurple], [9, 7, BINDER_COLORS.robePurple], [10, 7, BINDER_COLORS.robe], [11, 7, BINDER_COLORS.robeLight], [12, 7, BINDER_COLORS.robe], [13, 7, BINDER_COLORS.robeDark], [14, 7, BINDER_COLORS.robeDark],
  [4, 8, BINDER_COLORS.robeDark], [5, 8, BINDER_COLORS.robe], [6, 8, BINDER_COLORS.robeLight], [7, 8, BINDER_COLORS.robe], [8, 8, BINDER_COLORS.rune], [9, 8, BINDER_COLORS.rune], [10, 8, BINDER_COLORS.robe], [11, 8, BINDER_COLORS.robeLight], [12, 8, BINDER_COLORS.robe], [13, 8, BINDER_COLORS.robeDark], [14, 8, BINDER_COLORS.robeDark],
  [4, 9, BINDER_COLORS.robeDark], [5, 9, BINDER_COLORS.robe], [6, 9, BINDER_COLORS.robe], [7, 9, BINDER_COLORS.robeLight], [8, 9, BINDER_COLORS.robe], [9, 9, BINDER_COLORS.robe], [10, 9, BINDER_COLORS.robeLight], [11, 9, BINDER_COLORS.robe], [12, 9, BINDER_COLORS.robe], [13, 9, BINDER_COLORS.robeDark], [14, 9, BINDER_COLORS.robeDark],

  // ===== 长袍下摆 =====
  [5, 10, BINDER_COLORS.robe], [6, 10, BINDER_COLORS.robeDark], [7, 10, BINDER_COLORS.robe], [8, 10, BINDER_COLORS.runeGlow], [9, 10, BINDER_COLORS.runeGlow], [10, 10, BINDER_COLORS.robe], [11, 10, BINDER_COLORS.robeDark], [12, 10, BINDER_COLORS.robe],
  [5, 11, BINDER_COLORS.robeDark], [6, 11, BINDER_COLORS.robe], [7, 11, BINDER_COLORS.robeLight], [8, 11, BINDER_COLORS.robe], [9, 11, BINDER_COLORS.robe], [10, 11, BINDER_COLORS.robeLight], [11, 11, BINDER_COLORS.robe], [12, 11, BINDER_COLORS.robeDark],
  [6, 12, BINDER_COLORS.robe], [7, 12, BINDER_COLORS.robeDark], [8, 12, BINDER_COLORS.robe], [9, 12, BINDER_COLORS.robe], [10, 12, BINDER_COLORS.robe], [11, 12, BINDER_COLORS.robeDark], [12, 12, BINDER_COLORS.robe],

  // ===== 靴子 =====
  [7, 13, BINDER_COLORS.boot], [8, 13, BINDER_COLORS.bootLight], [9, 13, BINDER_COLORS.bootLight], [10, 13, BINDER_COLORS.boot],
  [7, 14, BINDER_COLORS.bootDark], [8, 14, BINDER_COLORS.boot], [9, 14, BINDER_COLORS.boot], [10, 14, BINDER_COLORS.bootDark],
  [7, 15, BINDER_COLORS.boot], [8, 15, BINDER_COLORS.bootLight], [9, 15, BINDER_COLORS.bootLight], [10, 15, BINDER_COLORS.boot],

  // ===== 左手（持魔法书）=====
  [2, 7, BINDER_COLORS.hand], [3, 7, BINDER_COLORS.handDark],
  [2, 8, BINDER_COLORS.hand], [3, 8, BINDER_COLORS.hand],
  [2, 9, BINDER_COLORS.handDark], [3, 9, BINDER_COLORS.hand],

  // ===== 黑暗魔法书（打开状态）=====
  [2, 10, BINDER_COLORS.book], [3, 10, BINDER_COLORS.bookGold], [4, 10, BINDER_COLORS.bookDark],
  [2, 11, BINDER_COLORS.page], [3, 11, BINDER_COLORS.pageRune], [4, 11, BINDER_COLORS.page],
  [2, 12, BINDER_COLORS.book], [3, 12, BINDER_COLORS.bookRune], [4, 12, BINDER_COLORS.book],
  [2, 13, BINDER_COLORS.bookDark], [3, 13, BINDER_COLORS.bookGold], [4, 13, BINDER_COLORS.bookDark],

  // ===== 右手（伸出施法）=====
  [14, 7, BINDER_COLORS.hand], [15, 7, BINDER_COLORS.handDark],
  [14, 8, BINDER_COLORS.hand], [15, 8, BINDER_COLORS.hand],
  [14, 9, BINDER_COLORS.handDark], [15, 9, BINDER_COLORS.hand],
  [15, 10, BINDER_COLORS.runeGlow],
  [15, 11, BINDER_COLORS.rune],

  // ===== 黑暗灵气 =====
  [6, 15, BINDER_COLORS.darkMist], [11, 15, BINDER_COLORS.darkMist],
  [7, 15, BINDER_COLORS.darknessGlow], [10, 15, BINDER_COLORS.darknessGlow],
]

// 向上面朝 - 背面（已居中，x偏移+2）
const BINDER_FACE_UP = [
  // ===== 兜帽顶部 =====
  [7, 0, BINDER_COLORS.hoodDark], [8, 0, BINDER_COLORS.hood], [9, 0, BINDER_COLORS.hood], [10, 0, BINDER_COLORS.hoodDark],
  [6, 1, BINDER_COLORS.hood], [7, 1, BINDER_COLORS.hoodLight], [8, 1, BINDER_COLORS.hood], [9, 1, BINDER_COLORS.hood], [10, 1, BINDER_COLORS.hoodLight], [11, 1, BINDER_COLORS.hood],
  [5, 2, BINDER_COLORS.hoodDark], [6, 2, BINDER_COLORS.hood], [7, 2, BINDER_COLORS.hood], [8, 2, BINDER_COLORS.hoodGlow], [9, 2, BINDER_COLORS.hoodGlow], [10, 2, BINDER_COLORS.hood], [11, 2, BINDER_COLORS.hood], [12, 2, BINDER_COLORS.hoodDark],

  // ===== 兜帽背面 =====
  [6, 3, BINDER_COLORS.hood], [7, 3, BINDER_COLORS.hoodLight], [8, 3, BINDER_COLORS.hood], [9, 3, BINDER_COLORS.hood], [10, 3, BINDER_COLORS.hoodLight], [11, 3, BINDER_COLORS.hood],
  [6, 4, BINDER_COLORS.hoodDark], [7, 4, BINDER_COLORS.hood], [8, 4, BINDER_COLORS.hoodLight], [9, 4, BINDER_COLORS.hoodLight], [10, 4, BINDER_COLORS.hood], [11, 4, BINDER_COLORS.hoodDark],
  [7, 5, BINDER_COLORS.hood], [8, 5, BINDER_COLORS.hoodDark], [9, 5, BINDER_COLORS.hoodDark], [10, 5, BINDER_COLORS.hood],

  // ===== 长袍背面 =====
  [4, 6, BINDER_COLORS.robeDark], [5, 6, BINDER_COLORS.robe], [6, 6, BINDER_COLORS.robeLight], [7, 6, BINDER_COLORS.robe], [8, 6, BINDER_COLORS.rune], [9, 6, BINDER_COLORS.rune], [10, 6, BINDER_COLORS.robe], [11, 6, BINDER_COLORS.robeLight], [12, 6, BINDER_COLORS.robe], [13, 6, BINDER_COLORS.robeDark], [14, 6, BINDER_COLORS.robeDark],
  [4, 7, BINDER_COLORS.robeDark], [5, 7, BINDER_COLORS.robe], [6, 7, BINDER_COLORS.robe], [7, 7, BINDER_COLORS.robeLight], [8, 7, BINDER_COLORS.runeGlow], [9, 7, BINDER_COLORS.runeGlow], [10, 7, BINDER_COLORS.robeLight], [11, 7, BINDER_COLORS.robe], [12, 7, BINDER_COLORS.robe], [13, 7, BINDER_COLORS.robeDark], [14, 7, BINDER_COLORS.robeDark],
  [4, 8, BINDER_COLORS.robeDark], [5, 8, BINDER_COLORS.robe], [6, 8, BINDER_COLORS.robeLight], [7, 8, BINDER_COLORS.robe], [8, 8, BINDER_COLORS.robe], [9, 8, BINDER_COLORS.robe], [10, 8, BINDER_COLORS.robe], [11, 8, BINDER_COLORS.robeLight], [12, 8, BINDER_COLORS.robe], [13, 8, BINDER_COLORS.robeDark], [14, 8, BINDER_COLORS.robeDark],
  [5, 9, BINDER_COLORS.robe], [6, 9, BINDER_COLORS.robeDark], [7, 9, BINDER_COLORS.robe], [8, 9, BINDER_COLORS.robeLight], [9, 9, BINDER_COLORS.robeLight], [10, 9, BINDER_COLORS.robe], [11, 9, BINDER_COLORS.robeDark], [12, 9, BINDER_COLORS.robe],

  // ===== 长袍下摆 =====
  [5, 10, BINDER_COLORS.robeDark], [6, 10, BINDER_COLORS.robe], [7, 10, BINDER_COLORS.robeLight], [8, 10, BINDER_COLORS.robe], [9, 10, BINDER_COLORS.robe], [10, 10, BINDER_COLORS.robeLight], [11, 10, BINDER_COLORS.robe], [12, 10, BINDER_COLORS.robeDark],
  [6, 11, BINDER_COLORS.robe], [7, 11, BINDER_COLORS.robeDark], [8, 11, BINDER_COLORS.robe], [9, 11, BINDER_COLORS.robe], [10, 11, BINDER_COLORS.robe], [11, 11, BINDER_COLORS.robeDark], [12, 11, BINDER_COLORS.robe],
  [7, 12, BINDER_COLORS.robeDark], [8, 12, BINDER_COLORS.robe], [9, 12, BINDER_COLORS.robe], [10, 12, BINDER_COLORS.robe], [11, 12, BINDER_COLORS.robeDark],

  // ===== 靴子 =====
  [7, 13, BINDER_COLORS.boot], [8, 13, BINDER_COLORS.bootLight], [9, 13, BINDER_COLORS.bootLight], [10, 13, BINDER_COLORS.boot],
  [7, 14, BINDER_COLORS.bootDark], [8, 14, BINDER_COLORS.boot], [9, 14, BINDER_COLORS.boot], [10, 14, BINDER_COLORS.bootDark],
  [7, 15, BINDER_COLORS.boot], [8, 15, BINDER_COLORS.bootLight], [9, 15, BINDER_COLORS.bootLight], [10, 15, BINDER_COLORS.boot],

  // ===== 魔法书（背在身后）=====
  [15, 6, BINDER_COLORS.book],
  [15, 7, BINDER_COLORS.bookDark],
  [15, 8, BINDER_COLORS.bookGold],
  [15, 9, BINDER_COLORS.book],
  [15, 10, BINDER_COLORS.bookRune],

  // ===== 手臂（背面）=====
  [4, 5, BINDER_COLORS.robeDark], [3, 5, BINDER_COLORS.robe],
  [4, 6, BINDER_COLORS.robe], [3, 6, BINDER_COLORS.robeDark],

  [13, 5, BINDER_COLORS.robeDark], [14, 5, BINDER_COLORS.robe],
  [13, 6, BINDER_COLORS.robe], [14, 6, BINDER_COLORS.robeDark],

  // ===== 黑暗灵气 =====
  [7, 15, BINDER_COLORS.darkMist], [10, 15, BINDER_COLORS.darkMist],
]

// 向左面朝 - 侧面（已居中，x偏移+2）
const BINDER_FACE_LEFT = [
  // ===== 兜帽侧面 =====
  [6, 0, BINDER_COLORS.hood], [7, 0, BINDER_COLORS.hoodDark],
  [5, 1, BINDER_COLORS.hoodLight], [6, 1, BINDER_COLORS.hood], [7, 1, BINDER_COLORS.hood], [8, 1, BINDER_COLORS.hoodDark],
  [5, 2, BINDER_COLORS.hood], [6, 2, BINDER_COLORS.hoodGlow], [7, 2, BINDER_COLORS.faceShadow], [8, 2, BINDER_COLORS.hood],
  [5, 3, BINDER_COLORS.hoodDark], [6, 3, BINDER_COLORS.faceShadow], [7, 3, BINDER_COLORS.eye], [8, 3, BINDER_COLORS.hood],

  // ===== 脸部侧面 =====
  [5, 4, BINDER_COLORS.hood], [6, 4, BINDER_COLORS.eyeGlow], [7, 4, BINDER_COLORS.eyeInner], [8, 4, BINDER_COLORS.hood],
  [5, 5, BINDER_COLORS.hoodDark], [6, 5, BINDER_COLORS.faceShadow], [7, 5, BINDER_COLORS.faceShadow], [8, 5, BINDER_COLORS.hoodDark],

  // ===== 长袍侧面 =====
  [4, 5, BINDER_COLORS.robeDark], [5, 5, BINDER_COLORS.robe], [6, 5, BINDER_COLORS.robeLight], [7, 5, BINDER_COLORS.robe], [8, 5, BINDER_COLORS.robeDark],
  [4, 6, BINDER_COLORS.robeDark], [5, 6, BINDER_COLORS.robe], [6, 6, BINDER_COLORS.rune], [7, 6, BINDER_COLORS.robe], [8, 6, BINDER_COLORS.robeLight], [9, 6, BINDER_COLORS.robe], [10, 6, BINDER_COLORS.robeDark],
  [4, 7, BINDER_COLORS.robeDark], [5, 7, BINDER_COLORS.robe], [6, 7, BINDER_COLORS.runeGlow], [7, 7, BINDER_COLORS.robe], [8, 7, BINDER_COLORS.robeLight], [9, 7, BINDER_COLORS.robe], [10, 7, BINDER_COLORS.robeDark],
  [4, 8, BINDER_COLORS.robeDark], [5, 8, BINDER_COLORS.robe], [6, 8, BINDER_COLORS.robeLight], [7, 8, BINDER_COLORS.robe], [8, 8, BINDER_COLORS.robe], [9, 8, BINDER_COLORS.robeLight], [10, 8, BINDER_COLORS.robe], [11, 8, BINDER_COLORS.robeDark],

  // ===== 长袍下摆 =====
  [5, 9, BINDER_COLORS.robe], [6, 9, BINDER_COLORS.robeDark], [7, 9, BINDER_COLORS.robe], [8, 9, BINDER_COLORS.robe], [9, 9, BINDER_COLORS.robeDark], [10, 9, BINDER_COLORS.robe],
  [6, 10, BINDER_COLORS.robeDark], [7, 10, BINDER_COLORS.robe], [8, 10, BINDER_COLORS.robe], [9, 10, BINDER_COLORS.robe], [10, 10, BINDER_COLORS.robeDark],
  [7, 11, BINDER_COLORS.robe], [8, 11, BINDER_COLORS.robeDark], [9, 11, BINDER_COLORS.robe],

  // ===== 靴子 =====
  [7, 12, BINDER_COLORS.boot], [8, 12, BINDER_COLORS.bootLight], [9, 12, BINDER_COLORS.boot],
  [7, 13, BINDER_COLORS.bootDark], [8, 13, BINDER_COLORS.boot], [9, 13, BINDER_COLORS.bootDark],
  [7, 14, BINDER_COLORS.boot], [8, 14, BINDER_COLORS.bootLight], [9, 14, BINDER_COLORS.boot],
  [7, 15, BINDER_COLORS.boot], [8, 15, BINDER_COLORS.bootLight], [9, 15, BINDER_COLORS.boot],

  // ===== 左手（前伸持魔法书）=====
  [2, 5, BINDER_COLORS.hand],
  [2, 6, BINDER_COLORS.handDark],
  [2, 7, BINDER_COLORS.hand], [3, 7, BINDER_COLORS.book],
  [2, 8, BINDER_COLORS.hand], [3, 8, BINDER_COLORS.page], [4, 8, BINDER_COLORS.pageRune],
  [3, 9, BINDER_COLORS.bookDark], [4, 9, BINDER_COLORS.bookRune],
  [3, 10, BINDER_COLORS.bookGold],

  // ===== 右手（后方施法）=====
  [10, 6, BINDER_COLORS.hand], [11, 6, BINDER_COLORS.handDark],
  [10, 7, BINDER_COLORS.hand], [11, 7, BINDER_COLORS.hand],
  [11, 8, BINDER_COLORS.runeGlow],
  [11, 9, BINDER_COLORS.rune],

  // ===== 黑暗灵气 =====
  [7, 15, BINDER_COLORS.darkMist],
  [8, 15, BINDER_COLORS.darknessGlow],
]

// 向右面朝 - 侧面镜像（已居中，x偏移+2）
const BINDER_FACE_RIGHT = [
  // ===== 兜帽侧面 =====
  [7, 0, BINDER_COLORS.hoodDark], [8, 0, BINDER_COLORS.hood],
  [6, 1, BINDER_COLORS.hoodDark], [7, 1, BINDER_COLORS.hood], [8, 1, BINDER_COLORS.hood], [9, 1, BINDER_COLORS.hoodLight],
  [6, 2, BINDER_COLORS.hood], [7, 2, BINDER_COLORS.faceShadow], [8, 2, BINDER_COLORS.hoodGlow], [9, 2, BINDER_COLORS.hood],
  [6, 3, BINDER_COLORS.hood], [7, 3, BINDER_COLORS.eye], [8, 3, BINDER_COLORS.faceShadow], [9, 3, BINDER_COLORS.hoodDark],

  // ===== 脸部侧面 =====
  [6, 4, BINDER_COLORS.hood], [7, 4, BINDER_COLORS.eyeInner], [8, 4, BINDER_COLORS.eyeGlow], [9, 4, BINDER_COLORS.hood],
  [6, 5, BINDER_COLORS.hoodDark], [7, 5, BINDER_COLORS.faceShadow], [8, 5, BINDER_COLORS.faceShadow], [9, 5, BINDER_COLORS.hoodDark],

  // ===== 长袍侧面 =====
  [6, 5, BINDER_COLORS.robeDark], [7, 5, BINDER_COLORS.robe], [8, 5, BINDER_COLORS.robeLight], [9, 5, BINDER_COLORS.robe], [10, 5, BINDER_COLORS.robeDark],
  [6, 6, BINDER_COLORS.robeDark], [7, 6, BINDER_COLORS.robe], [8, 6, BINDER_COLORS.robeLight], [9, 6, BINDER_COLORS.robe], [10, 6, BINDER_COLORS.rune], [11, 6, BINDER_COLORS.robe], [12, 6, BINDER_COLORS.robeDark],
  [6, 7, BINDER_COLORS.robeDark], [7, 7, BINDER_COLORS.robe], [8, 7, BINDER_COLORS.robeLight], [9, 7, BINDER_COLORS.robe], [10, 7, BINDER_COLORS.runeGlow], [11, 7, BINDER_COLORS.robe], [12, 7, BINDER_COLORS.robeDark],
  [7, 8, BINDER_COLORS.robeDark], [8, 8, BINDER_COLORS.robe], [9, 8, BINDER_COLORS.robeLight], [10, 8, BINDER_COLORS.robe], [11, 8, BINDER_COLORS.robe], [12, 8, BINDER_COLORS.robeLight], [13, 8, BINDER_COLORS.robe], [14, 8, BINDER_COLORS.robeDark],

  // ===== 长袍下摆 =====
  [6, 9, BINDER_COLORS.robe], [7, 9, BINDER_COLORS.robeDark], [8, 9, BINDER_COLORS.robe], [9, 9, BINDER_COLORS.robe], [10, 9, BINDER_COLORS.robeDark], [11, 9, BINDER_COLORS.robe],
  [7, 10, BINDER_COLORS.robeDark], [8, 10, BINDER_COLORS.robe], [9, 10, BINDER_COLORS.robe], [10, 10, BINDER_COLORS.robe], [11, 10, BINDER_COLORS.robeDark],
  [8, 11, BINDER_COLORS.robe], [9, 11, BINDER_COLORS.robeDark], [10, 11, BINDER_COLORS.robe],

  // ===== 靴子 =====
  [8, 12, BINDER_COLORS.boot], [9, 12, BINDER_COLORS.bootLight], [10, 12, BINDER_COLORS.boot],
  [8, 13, BINDER_COLORS.bootDark], [9, 13, BINDER_COLORS.boot], [10, 13, BINDER_COLORS.bootDark],
  [8, 14, BINDER_COLORS.boot], [9, 14, BINDER_COLORS.bootLight], [10, 14, BINDER_COLORS.boot],
  [8, 15, BINDER_COLORS.boot], [9, 15, BINDER_COLORS.bootLight], [10, 15, BINDER_COLORS.boot],

  // ===== 左手（后方施法）=====
  [6, 6, BINDER_COLORS.hand], [5, 6, BINDER_COLORS.handDark],
  [6, 7, BINDER_COLORS.hand], [5, 7, BINDER_COLORS.hand],
  [5, 8, BINDER_COLORS.runeGlow],
  [5, 9, BINDER_COLORS.rune],

  // ===== 右手（前伸持魔法书）=====
  [12, 5, BINDER_COLORS.hand],
  [12, 6, BINDER_COLORS.handDark],
  [12, 7, BINDER_COLORS.hand], [13, 7, BINDER_COLORS.book],
  [12, 8, BINDER_COLORS.hand], [13, 8, BINDER_COLORS.page], [14, 8, BINDER_COLORS.pageRune],
  [13, 9, BINDER_COLORS.bookDark], [14, 9, BINDER_COLORS.bookRune],
  [13, 10, BINDER_COLORS.bookGold],

  // ===== 黑暗灵气 =====
  [9, 15, BINDER_COLORS.darkMist],
  [10, 15, BINDER_COLORS.darknessGlow],
]

// 待机动画帧（魔法书翻动 + 眼睛发光）（已居中，x偏移+2）
const BINDER_IDLE_FRAMES = [
  // 帧0 - 暗
  [
    { pixels: [
      [8, 3, BINDER_COLORS.eye], [9, 3, BINDER_COLORS.eye],
      [8, 10, BINDER_COLORS.rune], [9, 10, BINDER_COLORS.rune],
      [3, 11, BINDER_COLORS.page], [4, 11, BINDER_COLORS.pageRune],
      [7, 15, BINDER_COLORS.darkMist], [10, 15, BINDER_COLORS.darkMist],
    ] }
  ],
  // 帧1 - 亮（眼睛发光 + 魔法书翻页 + 符文发光）
  [
    { pixels: [
      [8, 3, BINDER_COLORS.eyeGlow], [9, 3, BINDER_COLORS.eyeGlow],
      [8, 10, BINDER_COLORS.runeGlow], [9, 10, BINDER_COLORS.runeGlow],
      [3, 11, BINDER_COLORS.pageDark], [4, 11, BINDER_COLORS.bookRune],
      [7, 15, BINDER_COLORS.darknessGlow], [10, 15, BINDER_COLORS.darknessGlow],
      [8, 15, BINDER_COLORS.spark], [9, 15, BINDER_COLORS.spark],
    ] }
  ],
]

// 行走动画帧（步伐）（已居中，x偏移+2）
const BINDER_WALK_FRAMES = [
  // 帧0 - 左脚前
  [
    { pixels: [
      [7, 15, BINDER_COLORS.bootDark], [8, 15, BINDER_COLORS.boot], [9, 15, BINDER_COLORS.boot], [10, 15, BINDER_COLORS.bootDark],
    ] }
  ],
  // 帧1 - 中间
  [
    { pixels: [
      [7, 15, BINDER_COLORS.boot], [8, 15, BINDER_COLORS.bootDark], [9, 15, BINDER_COLORS.bootDark], [10, 15, BINDER_COLORS.boot],
    ] }
  ],
  // 帧2 - 右脚前
  [
    { pixels: [
      [7, 15, BINDER_COLORS.boot], [8, 15, BINDER_COLORS.boot], [9, 15, BINDER_COLORS.boot], [10, 15, BINDER_COLORS.bootDark],
    ] }
  ],
]

export const drawDarknessBinder = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: BINDER_FACE_DOWN,
  up: BINDER_FACE_UP,
  left: BINDER_FACE_LEFT,
  right: BINDER_FACE_RIGHT,
  walk: BINDER_WALK_FRAMES,
  idle: BINDER_IDLE_FRAMES,
})

export const drawDarknessBinderAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, BINDER_AVATAR)