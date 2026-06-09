/**
 * 绘制冰雪女王怪物 - 冰蓝色主题的冰雪女王
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit 冰雪女王位置和状态
 * @param {Number} currentUnit.x 冰雪女王x坐标
 * @param {Number} currentUnit.y 冰雪女王y坐标
 * @param {Number} currentUnit.size 冰雪女王大小(px)
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

export const config = {
  IDLE_SPEED: 0.003,
  WALK_SPEED: 0.1,
}

// 冰雪女王颜色（冰蓝/白/银/淡紫）
const QUEEN_COLORS = {
  // 皇冠/头饰
  crown: '#E8F0FF',         // 皇冠主色 - 冰白
  crownDark: '#B8D0F0',    // 皇冠暗
  crownLight: '#FFFFFF',    // 皇冠亮
  crownGem: '#80D0FF',      // 皇冠宝石 - 冰蓝
  crownGemGlow: '#A0E8FF',  // 宝石发光
  crownGemLight: '#C0F0FF', // 宝石亮
  // 头发
  hair: '#B8D8F8',         // 头发 - 冰蓝白
  hairDark: '#88A8D0',     // 头发暗
  hairLight: '#E8F4FF',    // 头发亮
  hairSilver: '#D0E0F0',   // 银发
  // 皮肤
  skin: '#F8F0F0',         // 皮肤 - 苍白
  skinDark: '#E8D8D8',     // 皮肤暗
  skinLight: '#FFF8F8',    // 皮肤亮
  // 眼睛 - 冰蓝发光
  eye: '#60A0E0',           // 眼睛 - 冰蓝
  eyeGlow: '#80C0FF',      // 眼睛发光
  eyeInner: '#C0E8FF',     // 眼睛内核
  // 长裙
  dress: '#C0E0FF',        // 长裙主色 - 淡蓝
  dressDark: '#88B8E0',    // 长裙暗
  dressLight: '#E8F4FF',   // 长裙亮
  dressIce: '#A0D0F0',     // 长裙冰色
  dressWhite: '#FFFFFF',   // 长裙白色
  dressGold: '#D4AF37',    // 长裙金边
  // 披风
  cape: '#B0D0F0',        // 披风 - 冰蓝
  capeDark: '#80A8D0',    // 披风暗
  capeLight: '#E0F0FF',   // 披风亮
  capeWhite: '#FFFFFF',   // 披风白色
  // 冰晶装饰
  crystal: '#80D0FF',      // 冰晶 - 冰蓝
  crystalLight: '#C0F0FF', // 冰晶亮
  crystalGlow: '#A0E8FF',  // 冰晶发光
  crystalDark: '#60A8D0',  // 冰晶暗
  // 冰雪魔法
  iceMagic: '#A0E0FF',     // 冰魔法 - 冰蓝
  iceMagicGlow: '#C0F0FF', // 魔法发光
  iceMagicLight: '#E0F8FF', // 魔法亮
  iceMagicDark: '#70B8E0', // 魔法暗
  // 粒子
  snow: '#FFFFFF',          // 雪花 - 白
  snowLight: '#F0F8FF',     // 雪花亮
  sparkle: '#C0E8FF',       // 冰晶闪光
  sparkleLight: '#E0F8FF',  // 闪光亮
  // 靴子/鞋子
  boot: '#B0C8E0',        // 靴子 - 冰蓝灰
  bootDark: '#88A0C0',    // 靴暗
  bootLight: '#D0E0F0',   // 靴亮
  // 权杖
  staff: '#D0D8E0',      // 权杖 - 银白
  staffDark: '#A0A8B0',   // 权杖暗
  staffLight: '#F0F4F8',  // 权杖亮
  staffGem: '#80D0FF',    // 权杖宝石
  staffGemGlow: '#A0E8FF', // 宝石发光
}

// 向下面朝 - 正面
const QUEEN_FACE_DOWN = [
  // ===== 皇冠 =====
  [5, 0, QUEEN_COLORS.crownDark], [6, 0, QUEEN_COLORS.crown], [7, 0, QUEEN_COLORS.crownLight], [8, 0, QUEEN_COLORS.crown], [9, 0, QUEEN_COLORS.crownDark],
  [4, 1, QUEEN_COLORS.crown], [5, 1, QUEEN_COLORS.crownLight], [6, 1, QUEEN_COLORS.crownGem], [7, 1, QUEEN_COLORS.crownGemGlow], [8, 1, QUEEN_COLORS.crownGem], [9, 1, QUEEN_COLORS.crownLight], [10, 1, QUEEN_COLORS.crown],
  [4, 2, QUEEN_COLORS.crownDark], [5, 2, QUEEN_COLORS.crown], [6, 2, QUEEN_COLORS.crownLight], [7, 2, QUEEN_COLORS.crown], [8, 2, QUEEN_COLORS.crownLight], [9, 2, QUEEN_COLORS.crown], [10, 2, QUEEN_COLORS.crownDark],
  [5, 3, QUEEN_COLORS.crownDark], [6, 3, QUEEN_COLORS.crown], [7, 3, QUEEN_COLORS.crownLight], [8, 3, QUEEN_COLORS.crown], [9, 3, QUEEN_COLORS.crownDark],

  // ===== 头发 + 脸部 =====
  [4, 4, QUEEN_COLORS.hair], [5, 4, QUEEN_COLORS.hairLight], [6, 4, QUEEN_COLORS.skin], [7, 4, QUEEN_COLORS.skin], [8, 4, QUEEN_COLORS.hairLight], [9, 4, QUEEN_COLORS.hair],
  [4, 5, QUEEN_COLORS.hairDark], [5, 5, QUEEN_COLORS.hair], [6, 5, QUEEN_COLORS.eye], [7, 5, QUEEN_COLORS.eyeGlow], [8, 5, QUEEN_COLORS.eye], [9, 5, QUEEN_COLORS.hair], [10, 5, QUEEN_COLORS.hairDark],
  [4, 6, QUEEN_COLORS.hair], [5, 6, QUEEN_COLORS.hairLight], [6, 6, QUEEN_COLORS.eyeGlow], [7, 6, QUEEN_COLORS.eyeInner], [8, 6, QUEEN_COLORS.eyeGlow], [9, 6, QUEEN_COLORS.hairLight], [10, 6, QUEEN_COLORS.hair],
  [4, 7, QUEEN_COLORS.hair], [5, 7, QUEEN_COLORS.skinLight], [6, 7, QUEEN_COLORS.skin], [7, 7, QUEEN_COLORS.skin], [8, 7, QUEEN_COLORS.skin], [9, 7, QUEEN_COLORS.skinLight], [10, 7, QUEEN_COLORS.hair],
  [5, 8, QUEEN_COLORS.hairDark], [6, 8, QUEEN_COLORS.skin], [7, 8, QUEEN_COLORS.skinDark], [8, 8, QUEEN_COLORS.skinDark], [9, 8, QUEEN_COLORS.skin], [10, 8, QUEEN_COLORS.hairDark],

  // ===== 颈 + 项链 =====
  [6, 9, QUEEN_COLORS.crownGem], [7, 9, QUEEN_COLORS.crownGemGlow], [8, 9, QUEEN_COLORS.crownGem],
  [5, 10, QUEEN_COLORS.dressLight], [6, 10, QUEEN_COLORS.crownGemLight], [7, 10, QUEEN_COLORS.crownGemGlow], [8, 10, QUEEN_COLORS.crownGemLight], [9, 10, QUEEN_COLORS.dressLight],

  // ===== 长裙上身 =====
  [4, 10, QUEEN_COLORS.dress], [5, 10, QUEEN_COLORS.dressIce], [9, 10, QUEEN_COLORS.dressIce], [10, 10, QUEEN_COLORS.dress],
  [4, 11, QUEEN_COLORS.dressDark], [5, 11, QUEEN_COLORS.dress], [6, 11, QUEEN_COLORS.dressLight], [7, 11, QUEEN_COLORS.dressLight], [8, 11, QUEEN_COLORS.dress], [9, 11, QUEEN_COLORS.dress], [10, 11, QUEEN_COLORS.dressDark],
  [3, 12, QUEEN_COLORS.dressDark], [4, 12, QUEEN_COLORS.dress], [5, 12, QUEEN_COLORS.dressIce], [6, 12, QUEEN_COLORS.dressWhite], [7, 12, QUEEN_COLORS.crystalGlow], [8, 12, QUEEN_COLORS.dressWhite], [9, 12, QUEEN_COLORS.dressIce], [10, 12, QUEEN_COLORS.dress], [11, 12, QUEEN_COLORS.dressDark],

  // ===== 长裙下身 =====
  [2, 13, QUEEN_COLORS.dressDark], [3, 13, QUEEN_COLORS.dress], [4, 13, QUEEN_COLORS.dressIce], [5, 13, QUEEN_COLORS.dressLight], [6, 13, QUEEN_COLORS.dressWhite], [7, 13, QUEEN_COLORS.crystalGlow], [8, 13, QUEEN_COLORS.dressWhite], [9, 13, QUEEN_COLORS.dressLight], [10, 13, QUEEN_COLORS.dressIce], [11, 13, QUEEN_COLORS.dress], [12, 13, QUEEN_COLORS.dressDark],
  [1, 14, QUEEN_COLORS.dressDark], [2, 14, QUEEN_COLORS.dress], [3, 14, QUEEN_COLORS.dressLight], [4, 14, QUEEN_COLORS.dressIce], [5, 14, QUEEN_COLORS.dressWhite], [6, 14, QUEEN_COLORS.dressLight], [7, 14, QUEEN_COLORS.crystal], [8, 14, QUEEN_COLORS.dressLight], [9, 14, QUEEN_COLORS.dressWhite], [10, 14, QUEEN_COLORS.dressIce], [11, 14, QUEEN_COLORS.dressLight], [12, 14, QUEEN_COLORS.dress], [13, 14, QUEEN_COLORS.dressDark],
  [1, 15, QUEEN_COLORS.dressDark], [2, 15, QUEEN_COLORS.dressLight], [3, 15, QUEEN_COLORS.dressIce], [4, 15, QUEEN_COLORS.dressLight], [5, 15, QUEEN_COLORS.dressIce], [6, 15, QUEEN_COLORS.dressLight], [7, 15, QUEEN_COLORS.crystalLight], [8, 15, QUEEN_COLORS.dressLight], [9, 15, QUEEN_COLORS.dressIce], [10, 15, QUEEN_COLORS.dressLight], [11, 15, QUEEN_COLORS.dressIce], [12, 15, QUEEN_COLORS.dressLight], [13, 15, QUEEN_COLORS.dressDark],
  [2, 16, QUEEN_COLORS.dressDark], [3, 16, QUEEN_COLORS.dressIce], [4, 16, QUEEN_COLORS.dressLight], [5, 16, QUEEN_COLORS.dressIce], [6, 16, QUEEN_COLORS.crystalGlow], [7, 16, QUEEN_COLORS.crystalLight], [8, 16, QUEEN_COLORS.crystalGlow], [9, 16, QUEEN_COLORS.dressIce], [10, 16, QUEEN_COLORS.dressLight], [11, 16, QUEEN_COLORS.dressIce], [12, 16, QUEEN_COLORS.dressDark],

  // ===== 左手（持权杖）=====
  [0, 11, QUEEN_COLORS.skinLight], [1, 11, QUEEN_COLORS.skin],
  [0, 12, QUEEN_COLORS.skin], [1, 12, QUEEN_COLORS.skinDark],
  [0, 13, QUEEN_COLORS.staffDark], [1, 13, QUEEN_COLORS.staff],
  [0, 14, QUEEN_COLORS.staff], [1, 14, QUEEN_COLORS.staffLight],
  [0, 15, QUEEN_COLORS.staffDark],
  [0, 16, QUEEN_COLORS.staffGem],
  [0, 17, QUEEN_COLORS.staffGemGlow], [1, 17, QUEEN_COLORS.staffGemLight],

  // ===== 右手 =====
  [13, 11, QUEEN_COLORS.skin], [14, 11, QUEEN_COLORS.skinLight],
  [13, 12, QUEEN_COLORS.skinDark], [14, 12, QUEEN_COLORS.skin],
  [14, 13, QUEEN_COLORS.crystalGlow],

  // ===== 冰雪魔法粒子 =====
  [6, 17, QUEEN_COLORS.iceMagic], [7, 17, QUEEN_COLORS.iceMagicGlow], [8, 17, QUEEN_COLORS.iceMagic],
  [5, 18, QUEEN_COLORS.snow], [6, 18, QUEEN_COLORS.snowLight], [7, 18, QUEEN_COLORS.sparkle], [8, 18, QUEEN_COLORS.snowLight], [9, 18, QUEEN_COLORS.snow],
]

// 向上面朝 - 背面
const QUEEN_FACE_UP = [
  // ===== 皇冠 =====
  [5, 0, QUEEN_COLORS.crownDark], [6, 0, QUEEN_COLORS.crown], [7, 0, QUEEN_COLORS.crownLight], [8, 0, QUEEN_COLORS.crown], [9, 0, QUEEN_COLORS.crownDark],
  [4, 1, QUEEN_COLORS.crown], [5, 1, QUEEN_COLORS.crownLight], [6, 1, QUEEN_COLORS.crownGem], [7, 1, QUEEN_COLORS.crownGemGlow], [8, 1, QUEEN_COLORS.crownGem], [9, 1, QUEEN_COLORS.crownLight], [10, 1, QUEEN_COLORS.crown],
  [4, 2, QUEEN_COLORS.crownDark], [5, 2, QUEEN_COLORS.crown], [6, 2, QUEEN_COLORS.crownLight], [7, 2, QUEEN_COLORS.crown], [8, 2, QUEEN_COLORS.crownLight], [9, 2, QUEEN_COLORS.crown], [10, 2, QUEEN_COLORS.crownDark],
  [5, 3, QUEEN_COLORS.crownDark], [6, 3, QUEEN_COLORS.crown], [7, 3, QUEEN_COLORS.crownLight], [8, 3, QUEEN_COLORS.crown], [9, 3, QUEEN_COLORS.crownDark],

  // ===== 头发背面 =====
  [4, 4, QUEEN_COLORS.hair], [5, 4, QUEEN_COLORS.hairLight], [6, 4, QUEEN_COLORS.hair], [7, 4, QUEEN_COLORS.hair], [8, 4, QUEEN_COLORS.hairLight], [9, 4, QUEEN_COLORS.hair],
  [3, 5, QUEEN_COLORS.hairDark], [4, 5, QUEEN_COLORS.hair], [5, 5, QUEEN_COLORS.hairLight], [6, 5, QUEEN_COLORS.hair], [7, 5, QUEEN_COLORS.hair], [8, 5, QUEEN_COLORS.hairLight], [9, 5, QUEEN_COLORS.hair], [10, 5, QUEEN_COLORS.hairDark],
  [3, 6, QUEEN_COLORS.hair], [4, 6, QUEEN_COLORS.hairLight], [5, 6, QUEEN_COLORS.hair], [6, 6, QUEEN_COLORS.hairLight], [7, 6, QUEEN_COLORS.hairLight], [8, 6, QUEEN_COLORS.hair], [9, 6, QUEEN_COLORS.hairLight], [10, 6, QUEEN_COLORS.hair],
  [3, 7, QUEEN_COLORS.hairDark], [4, 7, QUEEN_COLORS.hair], [5, 7, QUEEN_COLORS.hairLight], [6, 7, QUEEN_COLORS.hair], [7, 7, QUEEN_COLORS.hair], [8, 7, QUEEN_COLORS.hairLight], [9, 7, QUEEN_COLORS.hair], [10, 7, QUEEN_COLORS.hairDark],

  // ===== 长裙背面 =====
  [2, 8, QUEEN_COLORS.capeDark], [3, 8, QUEEN_COLORS.cape], [4, 8, QUEEN_COLORS.capeLight], [5, 8, QUEEN_COLORS.crystalGlow], [6, 8, QUEEN_COLORS.crystalLight], [7, 8, QUEEN_COLORS.crystalLight], [8, 8, QUEEN_COLORS.crystalGlow], [9, 8, QUEEN_COLORS.capeLight], [10, 8, QUEEN_COLORS.cape], [11, 8, QUEEN_COLORS.capeDark],
  [2, 9, QUEEN_COLORS.capeDark], [3, 9, QUEEN_COLORS.capeLight], [4, 9, QUEEN_COLORS.capeWhite], [5, 9, QUEEN_COLORS.capeLight], [6, 9, QUEEN_COLORS.crystal], [7, 9, QUEEN_COLORS.crystal], [8, 9, QUEEN_COLORS.capeLight], [9, 9, QUEEN_COLORS.capeWhite], [10, 9, QUEEN_COLORS.capeLight], [11, 9, QUEEN_COLORS.capeDark],
  [2, 10, QUEEN_COLORS.capeDark], [3, 10, QUEEN_COLORS.cape], [4, 10, QUEEN_COLORS.capeLight], [5, 10, QUEEN_COLORS.dressLight], [6, 10, QUEEN_COLORS.crystalGlow], [7, 10, QUEEN_COLORS.crystalGlow], [8, 10, QUEEN_COLORS.dressLight], [9, 10, QUEEN_COLORS.capeLight], [10, 10, QUEEN_COLORS.cape], [11, 10, QUEEN_COLORS.capeDark],
  [2, 11, QUEEN_COLORS.dressDark], [3, 11, QUEEN_COLORS.dress], [4, 11, QUEEN_COLORS.dressIce], [5, 11, QUEEN_COLORS.dressWhite], [6, 11, QUEEN_COLORS.dressLight], [7, 11, QUEEN_COLORS.dressLight], [8, 11, QUEEN_COLORS.dressWhite], [9, 11, QUEEN_COLORS.dressIce], [10, 11, QUEEN_COLORS.dress], [11, 11, QUEEN_COLORS.dressDark],

  // ===== 长裙下身（背面）=====
  [2, 12, QUEEN_COLORS.dressDark], [3, 12, QUEEN_COLORS.dress], [4, 12, QUEEN_COLORS.dressIce], [5, 12, QUEEN_COLORS.dressLight], [6, 12, QUEEN_COLORS.dressWhite], [7, 12, QUEEN_COLORS.crystalGlow], [8, 12, QUEEN_COLORS.dressWhite], [9, 12, QUEEN_COLORS.dressLight], [10, 12, QUEEN_COLORS.dressIce], [11, 12, QUEEN_COLORS.dress], [12, 12, QUEEN_COLORS.dressDark],
  [1, 13, QUEEN_COLORS.dressDark], [2, 13, QUEEN_COLORS.dress], [3, 13, QUEEN_COLORS.dressLight], [4, 13, QUEEN_COLORS.dressIce], [5, 13, QUEEN_COLORS.dressWhite], [6, 13, QUEEN_COLORS.dressLight], [7, 13, QUEEN_COLORS.crystal], [8, 13, QUEEN_COLORS.dressLight], [9, 13, QUEEN_COLORS.dressWhite], [10, 13, QUEEN_COLORS.dressIce], [11, 13, QUEEN_COLORS.dressLight], [12, 13, QUEEN_COLORS.dress], [13, 13, QUEEN_COLORS.dressDark],
  [1, 14, QUEEN_COLORS.dressDark], [2, 14, QUEEN_COLORS.dressLight], [3, 14, QUEEN_COLORS.dressIce], [4, 14, QUEEN_COLORS.dressLight], [5, 14, QUEEN_COLORS.dressIce], [6, 14, QUEEN_COLORS.dressLight], [7, 14, QUEEN_COLORS.crystalLight], [8, 14, QUEEN_COLORS.dressLight], [9, 14, QUEEN_COLORS.dressIce], [10, 14, QUEEN_COLORS.dressLight], [11, 14, QUEEN_COLORS.dressIce], [12, 14, QUEEN_COLORS.dressLight], [13, 14, QUEEN_COLORS.dressDark],
  [2, 15, QUEEN_COLORS.dressDark], [3, 15, QUEEN_COLORS.dressIce], [4, 15, QUEEN_COLORS.dressLight], [5, 15, QUEEN_COLORS.dressIce], [6, 15, QUEEN_COLORS.crystalGlow], [7, 15, QUEEN_COLORS.crystalLight], [8, 15, QUEEN_COLORS.crystalGlow], [9, 15, QUEEN_COLORS.dressIce], [10, 15, QUEEN_COLORS.dressLight], [11, 15, QUEEN_COLORS.dressIce], [12, 15, QUEEN_COLORS.dressDark],

  // ===== 武器（权杖背在身后）=====
  [12, 9, QUEEN_COLORS.staffDark],
  [12, 10, QUEEN_COLORS.staff],
  [12, 11, QUEEN_COLORS.staffLight],
  [12, 12, QUEEN_COLORS.staffGem],
  [12, 13, QUEEN_COLORS.staffGemGlow],

  // ===== 冰雪魔法粒子 =====
  [6, 15, QUEEN_COLORS.iceMagic], [7, 15, QUEEN_COLORS.iceMagicGlow], [8, 15, QUEEN_COLORS.iceMagic],
]

// 向左面朝 - 侧面
const QUEEN_FACE_LEFT = [
  // ===== 皇冠侧面 =====
  [5, 0, QUEEN_COLORS.crownDark], [6, 0, QUEEN_COLORS.crown],
  [4, 1, QUEEN_COLORS.crown], [5, 1, QUEEN_COLORS.crownLight], [6, 1, QUEEN_COLORS.crownGem],
  [4, 2, QUEEN_COLORS.crownDark], [5, 2, QUEEN_COLORS.crown], [6, 2, QUEEN_COLORS.crownLight],
  [4, 3, QUEEN_COLORS.crownDark], [5, 3, QUEEN_COLORS.crown], [6, 3, QUEEN_COLORS.crownLight],

  // ===== 头发侧面 + 脸部 =====
  [4, 4, QUEEN_COLORS.hair], [5, 4, QUEEN_COLORS.hairLight], [6, 4, QUEEN_COLORS.skin],
  [4, 5, QUEEN_COLORS.hairDark], [5, 5, QUEEN_COLORS.eye], [6, 5, QUEEN_COLORS.eyeGlow],
  [4, 6, QUEEN_COLORS.hair], [5, 6, QUEEN_COLORS.eyeGlow], [6, 6, QUEEN_COLORS.eyeInner],
  [4, 7, QUEEN_COLORS.hair], [5, 7, QUEEN_COLORS.skinLight], [6, 7, QUEEN_COLORS.skin],
  [5, 8, QUEEN_COLORS.hairDark], [6, 8, QUEEN_COLORS.skinDark],
  [5, 9, QUEEN_COLORS.hairDark], [6, 9, QUEEN_COLORS.crownGemLight],

  // ===== 长裙侧面 =====
  [4, 10, QUEEN_COLORS.dress], [5, 10, QUEEN_COLORS.dressIce], [6, 10, QUEEN_COLORS.dressLight],
  [3, 11, QUEEN_COLORS.dressDark], [4, 11, QUEEN_COLORS.dress], [5, 11, QUEEN_COLORS.dressIce], [6, 11, QUEEN_COLORS.dressWhite], [7, 11, QUEEN_COLORS.crystalGlow],
  [3, 12, QUEEN_COLORS.dressDark], [4, 12, QUEEN_COLORS.dressLight], [5, 12, QUEEN_COLORS.dressIce], [6, 12, QUEEN_COLORS.dressWhite], [7, 12, QUEEN_COLORS.crystal],
  [2, 13, QUEEN_COLORS.dressDark], [3, 13, QUEEN_COLORS.dress], [4, 13, QUEEN_COLORS.dressLight], [5, 13, QUEEN_COLORS.dressIce], [6, 13, QUEEN_COLORS.dressWhite], [7, 13, QUEEN_COLORS.dressLight], [8, 13, QUEEN_COLORS.dressIce], [9, 13, QUEEN_COLORS.dress],
  [2, 14, QUEEN_COLORS.dressDark], [3, 14, QUEEN_COLORS.dressLight], [4, 14, QUEEN_COLORS.dressIce], [5, 14, QUEEN_COLORS.dressLight], [6, 14, QUEEN_COLORS.dressIce], [7, 14, QUEEN_COLORS.crystalLight], [8, 14, QUEEN_COLORS.dressLight], [9, 14, QUEEN_COLORS.dress], [10, 14, QUEEN_COLORS.dressDark],
  [1, 15, QUEEN_COLORS.dressDark], [2, 15, QUEEN_COLORS.dressIce], [3, 15, QUEEN_COLORS.dressLight], [4, 15, QUEEN_COLORS.dressIce], [5, 15, QUEEN_COLORS.dressLight], [6, 15, QUEEN_COLORS.crystalGlow], [7, 15, QUEEN_COLORS.dressLight], [8, 15, QUEEN_COLORS.dressIce], [9, 15, QUEEN_COLORS.dressLight], [10, 15, QUEEN_COLORS.dress],
  [2, 16, QUEEN_COLORS.dressDark], [3, 16, QUEEN_COLORS.dressIce], [4, 16, QUEEN_COLORS.dressLight], [5, 16, QUEEN_COLORS.crystalGlow], [6, 16, QUEEN_COLORS.crystalLight], [7, 16, QUEEN_COLORS.crystalGlow], [8, 16, QUEEN_COLORS.dressIce], [9, 16, QUEEN_COLORS.dressLight], [10, 16, QUEEN_COLORS.dressDark],

  // ===== 左手（前伸持权杖）=====
  [0, 10, QUEEN_COLORS.skinLight], [1, 10, QUEEN_COLORS.skin],
  [0, 11, QUEEN_COLORS.skin], [1, 11, QUEEN_COLORS.staffDark],
  [0, 12, QUEEN_COLORS.staff], [1, 12, QUEEN_COLORS.staffLight],
  [0, 13, QUEEN_COLORS.staffDark],
  [0, 14, QUEEN_COLORS.staffGem],
  [0, 15, QUEEN_COLORS.staffGemGlow], [1, 15, QUEEN_COLORS.staffGemLight],
  [1, 16, QUEEN_COLORS.iceMagicGlow],

  // ===== 冰雪魔法粒子 =====
  [6, 17, QUEEN_COLORS.iceMagic], [7, 17, QUEEN_COLORS.iceMagicGlow],
  [5, 18, QUEEN_COLORS.snow], [6, 18, QUEEN_COLORS.snowLight], [7, 18, QUEEN_COLORS.sparkle],
]

// 向右面朝 - 侧面镜像
const QUEEN_FACE_RIGHT = [
  // ===== 皇冠侧面 =====
  [5, 0, QUEEN_COLORS.crown], [6, 0, QUEEN_COLORS.crownDark],
  [5, 1, QUEEN_COLORS.crownGem], [6, 1, QUEEN_COLORS.crownLight], [7, 1, QUEEN_COLORS.crown],
  [5, 2, QUEEN_COLORS.crownLight], [6, 2, QUEEN_COLORS.crown], [7, 2, QUEEN_COLORS.crownDark],
  [5, 3, QUEEN_COLORS.crownLight], [6, 3, QUEEN_COLORS.crown], [7, 3, QUEEN_COLORS.crownDark],

  // ===== 头发侧面 + 脸部 =====
  [5, 4, QUEEN_COLORS.skin], [6, 4, QUEEN_COLORS.hairLight], [7, 4, QUEEN_COLORS.hair],
  [5, 5, QUEEN_COLORS.eyeGlow], [6, 5, QUEEN_COLORS.eye], [7, 5, QUEEN_COLORS.hairDark],
  [5, 6, QUEEN_COLORS.eyeInner], [6, 6, QUEEN_COLORS.eyeGlow], [7, 6, QUEEN_COLORS.hair],
  [5, 7, QUEEN_COLORS.skin], [6, 7, QUEEN_COLORS.skinLight], [7, 7, QUEEN_COLORS.hair],
  [5, 8, QUEEN_COLORS.skinDark], [6, 8, QUEEN_COLORS.hairDark],
  [5, 9, QUEEN_COLORS.crownGemLight], [6, 9, QUEEN_COLORS.hairDark],

  // ===== 长裙侧面 =====
  [5, 10, QUEEN_COLORS.dressLight], [6, 10, QUEEN_COLORS.dressIce], [7, 10, QUEEN_COLORS.dress],
  [5, 11, QUEEN_COLORS.crystalGlow], [6, 11, QUEEN_COLORS.dressWhite], [7, 11, QUEEN_COLORS.dressIce], [8, 11, QUEEN_COLORS.dressDark],
  [5, 12, QUEEN_COLORS.crystal], [6, 12, QUEEN_COLORS.dressWhite], [7, 12, QUEEN_COLORS.dressIce], [8, 12, QUEEN_COLORS.dressLight], [9, 12, QUEEN_COLORS.dressDark],
  [5, 13, QUEEN_COLORS.dress], [6, 13, QUEEN_COLORS.dressLight], [7, 13, QUEEN_COLORS.dressIce], [8, 13, QUEEN_COLORS.dressLight], [9, 13, QUEEN_COLORS.dress], [10, 13, QUEEN_COLORS.dressDark],
  [4, 14, QUEEN_COLORS.dressDark], [5, 14, QUEEN_COLORS.dress], [6, 14, QUEEN_COLORS.dressLight], [7, 14, QUEEN_COLORS.crystalLight], [8, 14, QUEEN_COLORS.dressLight], [9, 14, QUEEN_COLORS.dressIce], [10, 14, QUEEN_COLORS.dressLight], [11, 14, QUEEN_COLORS.dressDark],
  [4, 15, QUEEN_COLORS.dress], [5, 15, QUEEN_COLORS.dressLight], [6, 15, QUEEN_COLORS.dressIce], [7, 15, QUEEN_COLORS.dressLight], [8, 15, QUEEN_COLORS.crystalGlow], [9, 15, QUEEN_COLORS.dressIce], [10, 15, QUEEN_COLORS.dressLight], [11, 15, QUEEN_COLORS.dressDark],
  [4, 16, QUEEN_COLORS.dressDark], [5, 16, QUEEN_COLORS.dressLight], [6, 16, QUEEN_COLORS.crystalGlow], [7, 16, QUEEN_COLORS.crystalLight], [8, 16, QUEEN_COLORS.crystalGlow], [9, 16, QUEEN_COLORS.dressIce], [10, 16, QUEEN_COLORS.dressLight], [11, 16, QUEEN_COLORS.dressDark],

  // ===== 右手（身后）=====
  [8, 10, QUEEN_COLORS.skinLight], [9, 10, QUEEN_COLORS.skin],
  [9, 11, QUEEN_COLORS.skin], [10, 11, QUEEN_COLORS.staffDark],
  [10, 12, QUEEN_COLORS.staff], [11, 12, QUEEN_COLORS.staffLight],
  [10, 13, QUEEN_COLORS.staffDark],
  [10, 14, QUEEN_COLORS.staffGem],
  [10, 15, QUEEN_COLORS.staffGemGlow], [11, 15, QUEEN_COLORS.staffGemLight],

  // ===== 冰雪魔法粒子 =====
  [6, 17, QUEEN_COLORS.iceMagicGlow], [7, 17, QUEEN_COLORS.iceMagic],
  [6, 18, QUEEN_COLORS.sparkle], [7, 18, QUEEN_COLORS.snowLight], [8, 18, QUEEN_COLORS.snow],
]

// 待机动画帧（眼睛发光 + 冰雪魔法脉动）
const QUEEN_IDLE_FRAMES = [
  // 帧0 - 暗
  [
    { pixels: [
      [6, 5, QUEEN_COLORS.eye], [7, 5, QUEEN_COLORS.eye],
      [6, 12, QUEEN_COLORS.crystal], [7, 12, QUEEN_COLORS.crystal],
      [6, 14, QUEEN_COLORS.crystal], [7, 14, QUEEN_COLORS.crystal],
      [6, 17, QUEEN_COLORS.iceMagic], [7, 17, QUEEN_COLORS.iceMagic],
      [6, 18, QUEEN_COLORS.snow], [7, 18, QUEEN_COLORS.snow],
    ] }
  ],
  // 帧1 - 亮（眼睛发光 + 冰晶闪烁 + 魔法能量）
  [
    { pixels: [
      [6, 5, QUEEN_COLORS.eyeGlow], [7, 5, QUEEN_COLORS.eyeGlow],
      [6, 12, QUEEN_COLORS.crystalGlow], [7, 12, QUEEN_COLORS.crystalGlow],
      [6, 14, QUEEN_COLORS.crystalGlow], [7, 14, QUEEN_COLORS.crystalGlow],
      [6, 17, QUEEN_COLORS.iceMagicGlow], [7, 17, QUEEN_COLORS.iceMagicGlow],
      [6, 18, QUEEN_COLORS.snowLight], [7, 18, QUEEN_COLORS.sparkleLight],
    ] }
  ],
]

// 行走动画帧（长裙摆动）
const QUEEN_WALK_FRAMES = [
  // 帧0 - 左脚前
  [
    { pixels: [
      [5, 15, QUEEN_COLORS.dressDark], [6, 15, QUEEN_COLORS.dressLight], [7, 15, QUEEN_COLORS.dressIce], [8, 15, QUEEN_COLORS.dressLight], [9, 15, QUEEN_COLORS.dress],
    ] }
  ],
  // 帧1 - 中间
  [
    { pixels: [
      [5, 15, QUEEN_COLORS.dressLight], [6, 15, QUEEN_COLORS.dressIce], [7, 15, QUEEN_COLORS.crystalGlow], [8, 15, QUEEN_COLORS.dressIce], [9, 15, QUEEN_COLORS.dressLight],
    ] }
  ],
  // 帧2 - 右脚前
  [
    { pixels: [
      [5, 15, QUEEN_COLORS.dress], [6, 15, QUEEN_COLORS.dressLight], [7, 15, QUEEN_COLORS.dressIce], [8, 15, QUEEN_COLORS.dressDark], [9, 15, QUEEN_COLORS.dressLight],
    ] }
  ],
]

export const drawFrostQueen = (canvasRef, currentUnit) => {
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
  let basePixels = QUEEN_FACE_DOWN
  if (direction === 'up') basePixels = QUEEN_FACE_UP
  else if (direction === 'left') basePixels = QUEEN_FACE_LEFT
  else if (direction === 'right') basePixels = QUEEN_FACE_RIGHT

  // 绘制基础角色
  for (let i = 0; i < basePixels.length; i++) {
    drawPixel(basePixels[i][0], basePixels[i][1], basePixels[i][2])
  }

  // 绘制动画层
  const isMoving = currentUnit.isMoving || false
  const frames = isMoving ? QUEEN_WALK_FRAMES : QUEEN_IDLE_FRAMES
  const frameIndex = Math.floor(frame) % frames.length
  const currentFrame = frames[frameIndex]

  for (const layer of currentFrame) {
    for (const pixel of layer.pixels) {
      drawPixel(pixel[0], pixel[1], pixel[2])
    }
  }
}
