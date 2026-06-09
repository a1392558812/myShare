/**
 * 绘制黑暗封印师怪物 - 堕落修道士风格，手持黑暗魔法书
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit 黑暗封印师位置和状态
 * @param {Number} currentUnit.x 黑暗封印师x坐标
 * @param {Number} currentUnit.y 黑暗封印师y坐标
 * @param {Number} currentUnit.size 黑暗封印师大小(px)
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

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
}

// 向下面朝 - 正面
const BINDER_FACE_DOWN = [
  // ===== 兜帽顶部 =====
  [5, 0, BINDER_COLORS.hoodDark], [6, 0, BINDER_COLORS.hood], [7, 0, BINDER_COLORS.hood], [8, 0, BINDER_COLORS.hoodDark],
  [4, 1, BINDER_COLORS.hood], [5, 1, BINDER_COLORS.hoodLight], [6, 1, BINDER_COLORS.hood], [7, 1, BINDER_COLORS.hood], [8, 1, BINDER_COLORS.hoodLight], [9, 1, BINDER_COLORS.hood],
  [3, 2, BINDER_COLORS.hoodDark], [4, 2, BINDER_COLORS.hood], [5, 2, BINDER_COLORS.hoodGlow], [6, 2, BINDER_COLORS.faceShadow], [7, 2, BINDER_COLORS.faceShadow], [8, 2, BINDER_COLORS.hoodGlow], [9, 2, BINDER_COLORS.hood], [10, 2, BINDER_COLORS.hoodDark],

  // ===== 脸部区域（阴影 + 眼睛）=====
  [4, 3, BINDER_COLORS.hood], [5, 3, BINDER_COLORS.faceShadow], [6, 3, BINDER_COLORS.eye], [7, 3, BINDER_COLORS.eye], [8, 3, BINDER_COLORS.faceShadow], [9, 3, BINDER_COLORS.hood],
  [4, 4, BINDER_COLORS.hoodDark], [5, 4, BINDER_COLORS.faceShadow], [6, 4, BINDER_COLORS.eyeGlow], [7, 4, BINDER_COLORS.eyeGlow], [8, 4, BINDER_COLORS.faceShadow], [9, 4, BINDER_COLORS.hoodDark],
  [5, 5, BINDER_COLORS.eyeInner], [6, 5, BINDER_COLORS.faceShadow], [7, 5, BINDER_COLORS.faceShadow], [8, 5, BINDER_COLORS.eyeInner],
  [4, 6, BINDER_COLORS.hood], [5, 6, BINDER_COLORS.faceShadow], [6, 6, BINDER_COLORS.faceShadow], [7, 6, BINDER_COLORS.faceShadow], [8, 6, BINDER_COLORS.faceShadow], [9, 6, BINDER_COLORS.hood],

  // ===== 十字架项链 =====
  [6, 7, BINDER_COLORS.chain], [7, 7, BINDER_COLORS.chain],
  [6, 8, BINDER_COLORS.cross], [7, 8, BINDER_COLORS.cross],
  [5, 9, BINDER_COLORS.cross], [6, 9, BINDER_COLORS.crossDark], [7, 9, BINDER_COLORS.crossDark], [8, 9, BINDER_COLORS.cross],

  // ===== 长袍上身 =====
  [3, 6, BINDER_COLORS.robeDark], [4, 6, BINDER_COLORS.robe], [5, 6, BINDER_COLORS.robeLight], [9, 6, BINDER_COLORS.robeLight], [10, 6, BINDER_COLORS.robe], [11, 6, BINDER_COLORS.robeDark],
  [2, 7, BINDER_COLORS.robeDark], [3, 7, BINDER_COLORS.robe], [4, 7, BINDER_COLORS.robeLight], [5, 7, BINDER_COLORS.robe], [6, 7, BINDER_COLORS.robePurple], [7, 7, BINDER_COLORS.robePurple], [8, 7, BINDER_COLORS.robe], [9, 7, BINDER_COLORS.robeLight], [10, 7, BINDER_COLORS.robe], [11, 7, BINDER_COLORS.robeDark], [12, 7, BINDER_COLORS.robeDark],
  [2, 8, BINDER_COLORS.robeDark], [3, 8, BINDER_COLORS.robe], [4, 8, BINDER_COLORS.robeLight], [5, 8, BINDER_COLORS.robe], [6, 8, BINDER_COLORS.rune], [7, 8, BINDER_COLORS.rune], [8, 8, BINDER_COLORS.robe], [9, 8, BINDER_COLORS.robeLight], [10, 8, BINDER_COLORS.robe], [11, 8, BINDER_COLORS.robeDark], [12, 8, BINDER_COLORS.robeDark],
  [2, 9, BINDER_COLORS.robeDark], [3, 9, BINDER_COLORS.robe], [4, 9, BINDER_COLORS.robe], [5, 9, BINDER_COLORS.robeLight], [6, 9, BINDER_COLORS.robe], [7, 9, BINDER_COLORS.robe], [8, 9, BINDER_COLORS.robeLight], [9, 9, BINDER_COLORS.robe], [10, 9, BINDER_COLORS.robe], [11, 9, BINDER_COLORS.robeDark], [12, 9, BINDER_COLORS.robeDark],

  // ===== 长袍下摆 =====
  [3, 10, BINDER_COLORS.robe], [4, 10, BINDER_COLORS.robeDark], [5, 10, BINDER_COLORS.robe], [6, 10, BINDER_COLORS.runeGlow], [7, 10, BINDER_COLORS.runeGlow], [8, 10, BINDER_COLORS.robe], [9, 10, BINDER_COLORS.robeDark], [10, 10, BINDER_COLORS.robe],
  [3, 11, BINDER_COLORS.robeDark], [4, 11, BINDER_COLORS.robe], [5, 11, BINDER_COLORS.robeLight], [6, 11, BINDER_COLORS.robe], [7, 11, BINDER_COLORS.robe], [8, 11, BINDER_COLORS.robeLight], [9, 11, BINDER_COLORS.robe], [10, 11, BINDER_COLORS.robeDark],
  [4, 12, BINDER_COLORS.robe], [5, 12, BINDER_COLORS.robeDark], [6, 12, BINDER_COLORS.robe], [7, 12, BINDER_COLORS.robe], [8, 12, BINDER_COLORS.robe], [9, 12, BINDER_COLORS.robeDark], [10, 12, BINDER_COLORS.robe],

  // ===== 靴子 =====
  [5, 13, BINDER_COLORS.boot], [6, 13, BINDER_COLORS.bootLight], [7, 13, BINDER_COLORS.bootLight], [8, 13, BINDER_COLORS.boot],
  [5, 14, BINDER_COLORS.bootDark], [6, 14, BINDER_COLORS.boot], [7, 14, BINDER_COLORS.boot], [8, 14, BINDER_COLORS.bootDark],
  [5, 15, BINDER_COLORS.boot], [6, 15, BINDER_COLORS.bootLight], [7, 15, BINDER_COLORS.bootLight], [8, 15, BINDER_COLORS.boot],

  // ===== 左手（持魔法书）=====
  [0, 7, BINDER_COLORS.hand], [1, 7, BINDER_COLORS.handDark],
  [0, 8, BINDER_COLORS.hand], [1, 8, BINDER_COLORS.hand],
  [0, 9, BINDER_COLORS.handDark], [1, 9, BINDER_COLORS.hand],

  // ===== 黑暗魔法书（打开状态）=====
  [0, 10, BINDER_COLORS.book], [1, 10, BINDER_COLORS.bookGold], [2, 10, BINDER_COLORS.bookDark],
  [0, 11, BINDER_COLORS.page], [1, 11, BINDER_COLORS.pageRune], [2, 11, BINDER_COLORS.page],
  [0, 12, BINDER_COLORS.book], [1, 12, BINDER_COLORS.bookRune], [2, 12, BINDER_COLORS.book],
  [0, 13, BINDER_COLORS.bookDark], [1, 13, BINDER_COLORS.bookGold], [2, 13, BINDER_COLORS.bookDark],

  // ===== 右手（伸出施法）=====
  [12, 7, BINDER_COLORS.hand], [13, 7, BINDER_COLORS.handDark],
  [12, 8, BINDER_COLORS.hand], [13, 8, BINDER_COLORS.hand],
  [12, 9, BINDER_COLORS.handDark], [13, 9, BINDER_COLORS.hand],
  [13, 10, BINDER_COLORS.runeGlow],
  [13, 11, BINDER_COLORS.rune],

  // ===== 黑暗灵气 =====
  [4, 15, BINDER_COLORS.darkMist], [9, 15, BINDER_COLORS.darkMist],
  [5, 15, BINDER_COLORS.darknessGlow], [8, 15, BINDER_COLORS.darknessGlow],
]

// 向上面朝 - 背面
const BINDER_FACE_UP = [
  // ===== 兜帽顶部 =====
  [5, 0, BINDER_COLORS.hoodDark], [6, 0, BINDER_COLORS.hood], [7, 0, BINDER_COLORS.hood], [8, 0, BINDER_COLORS.hoodDark],
  [4, 1, BINDER_COLORS.hood], [5, 1, BINDER_COLORS.hoodLight], [6, 1, BINDER_COLORS.hood], [7, 1, BINDER_COLORS.hood], [8, 1, BINDER_COLORS.hoodLight], [9, 1, BINDER_COLORS.hood],
  [3, 2, BINDER_COLORS.hoodDark], [4, 2, BINDER_COLORS.hood], [5, 2, BINDER_COLORS.hood], [6, 2, BINDER_COLORS.hoodGlow], [7, 2, BINDER_COLORS.hoodGlow], [8, 2, BINDER_COLORS.hood], [9, 2, BINDER_COLORS.hood], [10, 2, BINDER_COLORS.hoodDark],

  // ===== 兜帽背面 =====
  [4, 3, BINDER_COLORS.hood], [5, 3, BINDER_COLORS.hoodLight], [6, 3, BINDER_COLORS.hood], [7, 3, BINDER_COLORS.hood], [8, 3, BINDER_COLORS.hoodLight], [9, 3, BINDER_COLORS.hood],
  [4, 4, BINDER_COLORS.hoodDark], [5, 4, BINDER_COLORS.hood], [6, 4, BINDER_COLORS.hoodLight], [7, 4, BINDER_COLORS.hoodLight], [8, 4, BINDER_COLORS.hood], [9, 4, BINDER_COLORS.hoodDark],
  [5, 5, BINDER_COLORS.hood], [6, 5, BINDER_COLORS.hoodDark], [7, 5, BINDER_COLORS.hoodDark], [8, 5, BINDER_COLORS.hood],

  // ===== 长袍背面 =====
  [2, 6, BINDER_COLORS.robeDark], [3, 6, BINDER_COLORS.robe], [4, 6, BINDER_COLORS.robeLight], [5, 6, BINDER_COLORS.robe], [6, 6, BINDER_COLORS.rune], [7, 6, BINDER_COLORS.rune], [8, 6, BINDER_COLORS.robe], [9, 6, BINDER_COLORS.robeLight], [10, 6, BINDER_COLORS.robe], [11, 6, BINDER_COLORS.robeDark], [12, 6, BINDER_COLORS.robeDark],
  [2, 7, BINDER_COLORS.robeDark], [3, 7, BINDER_COLORS.robe], [4, 7, BINDER_COLORS.robe], [5, 7, BINDER_COLORS.robeLight], [6, 7, BINDER_COLORS.runeGlow], [7, 7, BINDER_COLORS.runeGlow], [8, 7, BINDER_COLORS.robeLight], [9, 7, BINDER_COLORS.robe], [10, 7, BINDER_COLORS.robe], [11, 7, BINDER_COLORS.robeDark], [12, 7, BINDER_COLORS.robeDark],
  [2, 8, BINDER_COLORS.robeDark], [3, 8, BINDER_COLORS.robe], [4, 8, BINDER_COLORS.robeLight], [5, 8, BINDER_COLORS.robe], [6, 8, BINDER_COLORS.robe], [7, 8, BINDER_COLORS.robe], [8, 8, BINDER_COLORS.robe], [9, 8, BINDER_COLORS.robeLight], [10, 8, BINDER_COLORS.robe], [11, 8, BINDER_COLORS.robeDark], [12, 8, BINDER_COLORS.robeDark],
  [3, 9, BINDER_COLORS.robe], [4, 9, BINDER_COLORS.robeDark], [5, 9, BINDER_COLORS.robe], [6, 9, BINDER_COLORS.robeLight], [7, 9, BINDER_COLORS.robeLight], [8, 9, BINDER_COLORS.robe], [9, 9, BINDER_COLORS.robeDark], [10, 9, BINDER_COLORS.robe],

  // ===== 长袍下摆 =====
  [3, 10, BINDER_COLORS.robeDark], [4, 10, BINDER_COLORS.robe], [5, 10, BINDER_COLORS.robeLight], [6, 10, BINDER_COLORS.robe], [7, 10, BINDER_COLORS.robe], [8, 10, BINDER_COLORS.robeLight], [9, 10, BINDER_COLORS.robe], [10, 10, BINDER_COLORS.robeDark],
  [4, 11, BINDER_COLORS.robe], [5, 11, BINDER_COLORS.robeDark], [6, 11, BINDER_COLORS.robe], [7, 11, BINDER_COLORS.robe], [8, 11, BINDER_COLORS.robe], [9, 11, BINDER_COLORS.robeDark], [10, 11, BINDER_COLORS.robe],
  [5, 12, BINDER_COLORS.robeDark], [6, 12, BINDER_COLORS.robe], [7, 12, BINDER_COLORS.robe], [8, 12, BINDER_COLORS.robe], [9, 12, BINDER_COLORS.robeDark],

  // ===== 靴子 =====
  [5, 13, BINDER_COLORS.boot], [6, 13, BINDER_COLORS.bootLight], [7, 13, BINDER_COLORS.bootLight], [8, 13, BINDER_COLORS.boot],
  [5, 14, BINDER_COLORS.bootDark], [6, 14, BINDER_COLORS.boot], [7, 14, BINDER_COLORS.boot], [8, 14, BINDER_COLORS.bootDark],
  [5, 15, BINDER_COLORS.boot], [6, 15, BINDER_COLORS.bootLight], [7, 15, BINDER_COLORS.bootLight], [8, 15, BINDER_COLORS.boot],

  // ===== 魔法书（背在身后）=====
  [13, 6, BINDER_COLORS.book],
  [13, 7, BINDER_COLORS.bookDark],
  [13, 8, BINDER_COLORS.bookGold],
  [13, 9, BINDER_COLORS.book],
  [13, 10, BINDER_COLORS.bookRune],

  // ===== 手臂（背面）=====
  [2, 5, BINDER_COLORS.robeDark], [1, 5, BINDER_COLORS.robe],
  [2, 6, BINDER_COLORS.robe], [1, 6, BINDER_COLORS.robeDark],

  [11, 5, BINDER_COLORS.robeDark], [12, 5, BINDER_COLORS.robe],
  [11, 6, BINDER_COLORS.robe], [12, 6, BINDER_COLORS.robeDark],

  // ===== 黑暗灵气 =====
  [5, 15, BINDER_COLORS.darkMist], [8, 15, BINDER_COLORS.darkMist],
]

// 向左面朝 - 侧面
const BINDER_FACE_LEFT = [
  // ===== 兜帽侧面 =====
  [4, 0, BINDER_COLORS.hood], [5, 0, BINDER_COLORS.hoodDark],
  [3, 1, BINDER_COLORS.hoodLight], [4, 1, BINDER_COLORS.hood], [5, 1, BINDER_COLORS.hood], [6, 1, BINDER_COLORS.hoodDark],
  [3, 2, BINDER_COLORS.hood], [4, 2, BINDER_COLORS.hoodGlow], [5, 2, BINDER_COLORS.faceShadow], [6, 2, BINDER_COLORS.hood],
  [3, 3, BINDER_COLORS.hoodDark], [4, 3, BINDER_COLORS.faceShadow], [5, 3, BINDER_COLORS.eye], [6, 3, BINDER_COLORS.hood],

  // ===== 脸部侧面 =====
  [3, 4, BINDER_COLORS.hood], [4, 4, BINDER_COLORS.eyeGlow], [5, 4, BINDER_COLORS.eyeInner], [6, 4, BINDER_COLORS.hood],
  [3, 5, BINDER_COLORS.hoodDark], [4, 5, BINDER_COLORS.faceShadow], [5, 5, BINDER_COLORS.faceShadow], [6, 5, BINDER_COLORS.hoodDark],

  // ===== 长袍侧面 =====
  [2, 5, BINDER_COLORS.robeDark], [3, 5, BINDER_COLORS.robe], [4, 5, BINDER_COLORS.robeLight], [5, 5, BINDER_COLORS.robe], [6, 5, BINDER_COLORS.robeDark],
  [2, 6, BINDER_COLORS.robeDark], [3, 6, BINDER_COLORS.robe], [4, 6, BINDER_COLORS.rune], [5, 6, BINDER_COLORS.robe], [6, 6, BINDER_COLORS.robeLight], [7, 6, BINDER_COLORS.robe], [8, 6, BINDER_COLORS.robeDark],
  [2, 7, BINDER_COLORS.robeDark], [3, 7, BINDER_COLORS.robe], [4, 7, BINDER_COLORS.runeGlow], [5, 7, BINDER_COLORS.robe], [6, 7, BINDER_COLORS.robeLight], [7, 7, BINDER_COLORS.robe], [8, 7, BINDER_COLORS.robeDark],
  [2, 8, BINDER_COLORS.robeDark], [3, 8, BINDER_COLORS.robe], [4, 8, BINDER_COLORS.robeLight], [5, 8, BINDER_COLORS.robe], [6, 8, BINDER_COLORS.robe], [7, 8, BINDER_COLORS.robeLight], [8, 8, BINDER_COLORS.robe], [9, 8, BINDER_COLORS.robeDark],

  // ===== 长袍下摆 =====
  [3, 9, BINDER_COLORS.robe], [4, 9, BINDER_COLORS.robeDark], [5, 9, BINDER_COLORS.robe], [6, 9, BINDER_COLORS.robe], [7, 9, BINDER_COLORS.robeDark], [8, 9, BINDER_COLORS.robe],
  [4, 10, BINDER_COLORS.robeDark], [5, 10, BINDER_COLORS.robe], [6, 10, BINDER_COLORS.robe], [7, 10, BINDER_COLORS.robe], [8, 10, BINDER_COLORS.robeDark],
  [5, 11, BINDER_COLORS.robe], [6, 11, BINDER_COLORS.robeDark], [7, 11, BINDER_COLORS.robe],

  // ===== 靴子 =====
  [5, 12, BINDER_COLORS.boot], [6, 12, BINDER_COLORS.bootLight], [7, 12, BINDER_COLORS.boot],
  [5, 13, BINDER_COLORS.bootDark], [6, 13, BINDER_COLORS.boot], [7, 13, BINDER_COLORS.bootDark],
  [5, 14, BINDER_COLORS.boot], [6, 14, BINDER_COLORS.bootLight], [7, 14, BINDER_COLORS.boot],
  [5, 15, BINDER_COLORS.boot], [6, 15, BINDER_COLORS.bootLight], [7, 15, BINDER_COLORS.boot],

  // ===== 左手（前伸持魔法书）=====
  [0, 5, BINDER_COLORS.hand],
  [0, 6, BINDER_COLORS.handDark],
  [0, 7, BINDER_COLORS.hand], [1, 7, BINDER_COLORS.book],
  [0, 8, BINDER_COLORS.hand], [1, 8, BINDER_COLORS.page], [2, 8, BINDER_COLORS.pageRune],
  [1, 9, BINDER_COLORS.bookDark], [2, 9, BINDER_COLORS.bookRune],
  [1, 10, BINDER_COLORS.bookGold],

  // ===== 右手（后方施法）=====
  [8, 6, BINDER_COLORS.hand], [9, 6, BINDER_COLORS.handDark],
  [8, 7, BINDER_COLORS.hand], [9, 7, BINDER_COLORS.hand],
  [9, 8, BINDER_COLORS.runeGlow],
  [9, 9, BINDER_COLORS.rune],

  // ===== 黑暗灵气 =====
  [5, 15, BINDER_COLORS.darkMist],
  [6, 15, BINDER_COLORS.darknessGlow],
]

// 向右面朝 - 侧面镜像
const BINDER_FACE_RIGHT = [
  // ===== 兜帽侧面 =====
  [5, 0, BINDER_COLORS.hoodDark], [6, 0, BINDER_COLORS.hood],
  [4, 1, BINDER_COLORS.hoodDark], [5, 1, BINDER_COLORS.hood], [6, 1, BINDER_COLORS.hood], [7, 1, BINDER_COLORS.hoodLight],
  [4, 2, BINDER_COLORS.hood], [5, 2, BINDER_COLORS.faceShadow], [6, 2, BINDER_COLORS.hoodGlow], [7, 2, BINDER_COLORS.hood],
  [4, 3, BINDER_COLORS.hood], [5, 3, BINDER_COLORS.eye], [6, 3, BINDER_COLORS.faceShadow], [7, 3, BINDER_COLORS.hoodDark],

  // ===== 脸部侧面 =====
  [4, 4, BINDER_COLORS.hood], [5, 4, BINDER_COLORS.eyeInner], [6, 4, BINDER_COLORS.eyeGlow], [7, 4, BINDER_COLORS.hood],
  [4, 5, BINDER_COLORS.hoodDark], [5, 5, BINDER_COLORS.faceShadow], [6, 5, BINDER_COLORS.faceShadow], [7, 5, BINDER_COLORS.hoodDark],

  // ===== 长袍侧面 =====
  [4, 5, BINDER_COLORS.robeDark], [5, 5, BINDER_COLORS.robe], [6, 5, BINDER_COLORS.robeLight], [7, 5, BINDER_COLORS.robe], [8, 5, BINDER_COLORS.robeDark],
  [4, 6, BINDER_COLORS.robeDark], [5, 6, BINDER_COLORS.robe], [6, 6, BINDER_COLORS.robeLight], [7, 6, BINDER_COLORS.robe], [8, 6, BINDER_COLORS.rune], [9, 6, BINDER_COLORS.robe], [10, 6, BINDER_COLORS.robeDark],
  [4, 7, BINDER_COLORS.robeDark], [5, 7, BINDER_COLORS.robe], [6, 7, BINDER_COLORS.robeLight], [7, 7, BINDER_COLORS.robe], [8, 7, BINDER_COLORS.runeGlow], [9, 7, BINDER_COLORS.robe], [10, 7, BINDER_COLORS.robeDark],
  [5, 8, BINDER_COLORS.robeDark], [6, 8, BINDER_COLORS.robe], [7, 8, BINDER_COLORS.robeLight], [8, 8, BINDER_COLORS.robe], [9, 8, BINDER_COLORS.robe], [10, 8, BINDER_COLORS.robeLight], [11, 8, BINDER_COLORS.robe], [12, 8, BINDER_COLORS.robeDark],

  // ===== 长袍下摆 =====
  [4, 9, BINDER_COLORS.robe], [5, 9, BINDER_COLORS.robeDark], [6, 9, BINDER_COLORS.robe], [7, 9, BINDER_COLORS.robe], [8, 9, BINDER_COLORS.robeDark], [9, 9, BINDER_COLORS.robe],
  [5, 10, BINDER_COLORS.robeDark], [6, 10, BINDER_COLORS.robe], [7, 10, BINDER_COLORS.robe], [8, 10, BINDER_COLORS.robe], [9, 10, BINDER_COLORS.robeDark],
  [6, 11, BINDER_COLORS.robe], [7, 11, BINDER_COLORS.robeDark], [8, 11, BINDER_COLORS.robe],

  // ===== 靴子 =====
  [6, 12, BINDER_COLORS.boot], [7, 12, BINDER_COLORS.bootLight], [8, 12, BINDER_COLORS.boot],
  [6, 13, BINDER_COLORS.bootDark], [7, 13, BINDER_COLORS.boot], [8, 13, BINDER_COLORS.bootDark],
  [6, 14, BINDER_COLORS.boot], [7, 14, BINDER_COLORS.bootLight], [8, 14, BINDER_COLORS.boot],
  [6, 15, BINDER_COLORS.boot], [7, 15, BINDER_COLORS.bootLight], [8, 15, BINDER_COLORS.boot],

  // ===== 左手（后方施法）=====
  [4, 6, BINDER_COLORS.hand], [3, 6, BINDER_COLORS.handDark],
  [4, 7, BINDER_COLORS.hand], [3, 7, BINDER_COLORS.hand],
  [3, 8, BINDER_COLORS.runeGlow],
  [3, 9, BINDER_COLORS.rune],

  // ===== 右手（前伸持魔法书）=====
  [10, 5, BINDER_COLORS.hand],
  [10, 6, BINDER_COLORS.handDark],
  [10, 7, BINDER_COLORS.hand], [11, 7, BINDER_COLORS.book],
  [10, 8, BINDER_COLORS.hand], [11, 8, BINDER_COLORS.page], [12, 8, BINDER_COLORS.pageRune],
  [11, 9, BINDER_COLORS.bookDark], [12, 9, BINDER_COLORS.bookRune],
  [11, 10, BINDER_COLORS.bookGold],

  // ===== 黑暗灵气 =====
  [7, 15, BINDER_COLORS.darkMist],
  [8, 15, BINDER_COLORS.darknessGlow],
]

// 待机动画帧（魔法书翻动 + 眼睛发光）
const BINDER_IDLE_FRAMES = [
  // 帧0 - 暗
  [
    { pixels: [
      [6, 3, BINDER_COLORS.eye], [7, 3, BINDER_COLORS.eye],
      [6, 10, BINDER_COLORS.rune], [7, 10, BINDER_COLORS.rune],
      [1, 11, BINDER_COLORS.page], [2, 11, BINDER_COLORS.pageRune],
      [5, 15, BINDER_COLORS.darkMist], [8, 15, BINDER_COLORS.darkMist],
    ] }
  ],
  // 帧1 - 亮（眼睛发光 + 魔法书翻页 + 符文发光）
  [
    { pixels: [
      [6, 3, BINDER_COLORS.eyeGlow], [7, 3, BINDER_COLORS.eyeGlow],
      [6, 10, BINDER_COLORS.runeGlow], [7, 10, BINDER_COLORS.runeGlow],
      [1, 11, BINDER_COLORS.pageDark], [2, 11, BINDER_COLORS.bookRune],
      [5, 15, BINDER_COLORS.darknessGlow], [8, 15, BINDER_COLORS.darknessGlow],
      [6, 15, BINDER_COLORS.spark], [7, 15, BINDER_COLORS.spark],
    ] }
  ],
]

// 行走动画帧（步伐）
const BINDER_WALK_FRAMES = [
  // 帧0 - 左脚前
  [
    { pixels: [
      [5, 15, BINDER_COLORS.bootDark], [6, 15, BINDER_COLORS.boot], [7, 15, BINDER_COLORS.boot], [8, 15, BINDER_COLORS.bootDark],
    ] }
  ],
  // 帧1 - 中间
  [
    { pixels: [
      [5, 15, BINDER_COLORS.boot], [6, 15, BINDER_COLORS.bootDark], [7, 15, BINDER_COLORS.bootDark], [8, 15, BINDER_COLORS.boot],
    ] }
  ],
  // 帧2 - 右脚前
  [
    { pixels: [
      [5, 15, BINDER_COLORS.boot], [6, 15, BINDER_COLORS.boot], [7, 15, BINDER_COLORS.boot], [8, 15, BINDER_COLORS.bootDark],
    ] }
  ],
]

export const drawDarknessBinder = (canvasRef, currentUnit) => {
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
  let basePixels = BINDER_FACE_DOWN
  if (direction === 'up') basePixels = BINDER_FACE_UP
  else if (direction === 'left') basePixels = BINDER_FACE_LEFT
  else if (direction === 'right') basePixels = BINDER_FACE_RIGHT

  // 绘制基础角色
  for (let i = 0; i < basePixels.length; i++) {
    drawPixel(basePixels[i][0], basePixels[i][1], basePixels[i][2])
  }

  // 绘制动画层
  const isMoving = currentUnit.isMoving || false
  const frames = isMoving ? BINDER_WALK_FRAMES : BINDER_IDLE_FRAMES
  const frameIndex = Math.floor(frame) % frames.length
  const currentFrame = frames[frameIndex]

  for (const layer of currentFrame) {
    for (const pixel of layer.pixels) {
      drawPixel(pixel[0], pixel[1], pixel[2])
    }
  }
}
