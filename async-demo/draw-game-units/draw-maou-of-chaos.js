/**
 * 绘制混沌魔王怪物 - 日式RPG魔王风格
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit 混沌魔王位置和状态
 * @param {Number} currentUnit.x 混沌魔王x坐标
 * @param {Number} currentUnit.y 混沌魔王y坐标
 * @param {Number} currentUnit.size 混沌魔王大小(px)
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

export const config = {
  IDLE_SPEED: 0.003,
  WALK_SPEED: 0.1,
}

// 混沌魔王颜色（日式RPG魔王：红金 + 暗紫 + 血红）
const LORD_COLORS = {
  // 头部/脸
  face: '#F0D8C0',         // 肤色 - 苍白
  faceDark: '#D8B890',     // 肤色暗
  faceLight: '#FFF0E0',    // 肤色亮
  skin: '#E8D0B8',         // 皮肤
  // 恶魔角
  horn: '#6A2A2A',         // 角主色 - 暗红
  hornDark: '#4A1A1A',     // 角暗
  hornLight: '#AA4444',    // 角亮
  hornTip: '#221111',     // 角尖 - 近黑
  // 眼睛 - 血红发光
  eye: '#FF2222',          // 眼睛 - 血红
  eyeGlow: '#FF6666',      // 眼睛发光
  eyeInner: '#FFEEEE',     // 眼睛内核 - 白
  // 头发 - 黑发/紫发
  hair: '#2A1A3A',         // 头发主色 - 深紫黑
  hairDark: '#1A0A1A',     // 头发暗
  hairLight: '#4A2A5A',    // 头发亮
  // 披风/袍
  cape: '#3A1A1A',         // 披风 - 暗红
  capeDark: '#2A0A0A',     // 披风暗
  capeLight: '#5A2A2A',    // 披风亮
  capePurple: '#5A1A5A',   // 紫色部分
  capePurpleLight: '#8A3A8A', // 紫亮
  // 装饰 - 金色
  gold: '#D4AF37',         // 金色装饰
  goldDark: '#9A7A20',     // 金色暗
  goldLight: '#F0CF50',    // 金色亮
  // 魔法符文 - 紫红
  rune: '#EE00FF',         // 符文
  runeGlow: '#FF66FF',     // 符文发光
  runeDark: '#AA00AA',     // 符文暗
  // 爪子/手
  claw: '#F0D8C0',         // 手 - 苍白
  clawDark: '#D8B890',     // 手暗
  clawLight: '#FFF0E0',    // 手亮
  nail: '#4A1A1A',         // 指甲 - 暗红黑
  // 三叉戟/权杖
  trident: '#6A6A6A',      // 三叉戟 - 银灰
  tridentDark: '#3A3A3A',  // 三叉戟暗
  tridentLight: '#A0A0A0', // 三叉戟亮
  tridentRed: '#AA2222',   // 三叉戟红色
  staffGold: '#D4AF37',    // 金杖
  staffGoldDark: '#9A7A20', // 金杖暗
  staffGoldLight: '#F0CF50', // 金杖亮
  gem: '#FF00FF',          // 宝石 - 紫红
  gemDark: '#AA00AA',      // 宝石暗
  gemGlow: '#FF66FF',      // 宝石发光
  // 混沌能量
  chaos: '#FF4444',        // 混沌 - 血红
  chaosGlow: '#FF8888',    // 混沌发光
  chaosDark: '#AA2222',    // 混沌暗
  energy: '#FF00FF',       // 能量 - 紫红
  energyLight: '#FF66FF',  // 能量亮
  spark: '#FFFF00',        // 火花 - 金黄
  // 靴子
  boot: '#2A1A1A',         // 靴
  bootDark: '#1A0A0A',     // 靴暗
  bootLight: '#4A2A2A',    // 靴亮
  bootGold: '#D4AF37',     // 靴金
  // 项链/首饰
  necklace: '#D4AF37',     // 项链 - 金
  gemRed: '#FF2222',       // 红宝石
  gemRedGlow: '#FF6666',   // 红宝石发光
  // 王冠
  crown: '#D4AF37',        // 王冠金
  crownDark: '#9A7A20',    // 王冠暗
  crownLight: '#F0CF50',   // 王冠亮
  crownGem: '#FF00FF',     // 王冠宝石
  crownGemGlow: '#FF66FF', // 宝石发光
  // 牙齿/獠牙
  fang: '#F8F0E0',         // 獠牙 - 白
  fangDark: '#C8B8A0',     // 獠牙暗
  highlight: '#FFFFFF',        // 高光
}

// 混沌魔王高精度头像（16x16网格，聚焦魔王面部特写）
const LORD_AVATAR = [
  // ===== 王冠顶部 =====
  [5, 0, LORD_COLORS.crownDark], [6, 0, LORD_COLORS.crown], [7, 0, LORD_COLORS.crown], [8, 0, LORD_COLORS.crown], [9, 0, LORD_COLORS.crownDark],
  [4, 1, LORD_COLORS.crown], [5, 1, LORD_COLORS.crownLight], [6, 1, LORD_COLORS.crownGem], [7, 1, LORD_COLORS.crownGemGlow], [8, 1, LORD_COLORS.crownGem], [9, 1, LORD_COLORS.crownLight], [10, 1, LORD_COLORS.crown],
  [3, 2, LORD_COLORS.crownDark], [4, 2, LORD_COLORS.crown], [5, 2, LORD_COLORS.crownLight], [6, 2, LORD_COLORS.crown], [7, 2, LORD_COLORS.crownLight], [8, 2, LORD_COLORS.crown], [9, 2, LORD_COLORS.crownLight], [10, 2, LORD_COLORS.crown], [11, 2, LORD_COLORS.crownDark],

  // ===== 恶魔角 =====
  [2, 0, LORD_COLORS.hornDark], [3, 0, LORD_COLORS.horn], [10, 0, LORD_COLORS.horn], [11, 0, LORD_COLORS.hornDark],
  [2, 1, LORD_COLORS.horn], [3, 1, LORD_COLORS.hornLight], [4, 1, LORD_COLORS.horn], [9, 1, LORD_COLORS.horn], [10, 1, LORD_COLORS.hornLight], [11, 1, LORD_COLORS.horn],
  [2, 2, LORD_COLORS.hornDark], [3, 2, LORD_COLORS.horn], [4, 2, LORD_COLORS.hornLight], [9, 2, LORD_COLORS.hornLight], [10, 2, LORD_COLORS.horn], [11, 2, LORD_COLORS.hornDark],
  [3, 3, LORD_COLORS.hornDark], [4, 3, LORD_COLORS.horn], [9, 3, LORD_COLORS.horn], [10, 3, LORD_COLORS.hornDark],

  // ===== 头发/头部装饰 =====
  [3, 3, LORD_COLORS.hair], [4, 3, LORD_COLORS.hairLight], [5, 3, LORD_COLORS.hairDark], [6, 3, LORD_COLORS.hair], [7, 3, LORD_COLORS.hair], [8, 3, LORD_COLORS.hairDark], [9, 3, LORD_COLORS.hairLight], [10, 3, LORD_COLORS.hair],
  [2, 4, LORD_COLORS.hairDark], [3, 4, LORD_COLORS.hair], [4, 4, LORD_COLORS.hairLight], [5, 4, LORD_COLORS.hair], [6, 4, LORD_COLORS.hairDark], [7, 4, LORD_COLORS.hairDark], [8, 4, LORD_COLORS.hair], [9, 4, LORD_COLORS.hairLight], [10, 4, LORD_COLORS.hair], [11, 4, LORD_COLORS.hairDark],
  [2, 5, LORD_COLORS.hair], [3, 5, LORD_COLORS.hairLight], [4, 5, LORD_COLORS.hair], [5, 5, LORD_COLORS.hairDark], [6, 5, LORD_COLORS.hair], [7, 5, LORD_COLORS.hair], [8, 5, LORD_COLORS.hairDark], [9, 5, LORD_COLORS.hair], [10, 5, LORD_COLORS.hairLight], [11, 5, LORD_COLORS.hair],

  // ===== 脸部 =====
  [3, 6, LORD_COLORS.face], [4, 6, LORD_COLORS.faceLight], [5, 6, LORD_COLORS.face], [6, 6, LORD_COLORS.face], [7, 6, LORD_COLORS.face], [8, 6, LORD_COLORS.faceLight], [9, 6, LORD_COLORS.face], [10, 6, LORD_COLORS.face],
  [3, 7, LORD_COLORS.faceLight], [4, 7, LORD_COLORS.eye], [5, 7, LORD_COLORS.eyeGlow], [6, 7, LORD_COLORS.eye], [7, 7, LORD_COLORS.eye], [8, 7, LORD_COLORS.eyeGlow], [9, 7, LORD_COLORS.eye], [10, 7, LORD_COLORS.faceLight],

  // ===== 眼睛（血红发光）=====
  [3, 8, LORD_COLORS.face], [4, 8, LORD_COLORS.eyeGlow], [5, 8, LORD_COLORS.eyeInner], [6, 8, LORD_COLORS.eyeInner], [7, 8, LORD_COLORS.eyeInner], [8, 8, LORD_COLORS.eyeInner], [9, 8, LORD_COLORS.eyeGlow], [10, 8, LORD_COLORS.face],
  // 眼睛高光
  [4, 7, LORD_COLORS.highlight], [5, 7, LORD_COLORS.highlight], [8, 7, LORD_COLORS.highlight], [9, 7, LORD_COLORS.highlight],
  [4, 8, LORD_COLORS.highlight], [9, 8, LORD_COLORS.highlight],

  // ===== 眼睛下方细节 =====
  [3, 9, LORD_COLORS.face], [4, 9, LORD_COLORS.eyeGlow], [5, 9, LORD_COLORS.eyeGlow], [6, 9, LORD_COLORS.eyeGlow], [7, 9, LORD_COLORS.eyeGlow], [8, 9, LORD_COLORS.eyeGlow], [9, 9, LORD_COLORS.eyeGlow], [10, 9, LORD_COLORS.face],
  [4, 10, LORD_COLORS.faceDark], [5, 10, LORD_COLORS.face], [6, 10, LORD_COLORS.faceDark], [7, 10, LORD_COLORS.faceDark], [8, 10, LORD_COLORS.face], [9, 10, LORD_COLORS.faceDark],

  // ===== 獠牙 =====
  [5, 11, LORD_COLORS.fang], [6, 11, LORD_COLORS.faceDark], [7, 11, LORD_COLORS.faceDark], [8, 11, LORD_COLORS.fang],
  [4, 12, LORD_COLORS.fangDark], [5, 12, LORD_COLORS.fang], [6, 12, LORD_COLORS.fang], [7, 12, LORD_COLORS.fang], [8, 12, LORD_COLORS.fang], [9, 12, LORD_COLORS.fangDark],

  // ===== 金项链 + 红宝石 =====
  [4, 13, LORD_COLORS.gold], [5, 13, LORD_COLORS.gemRedGlow], [6, 13, LORD_COLORS.goldLight], [7, 13, LORD_COLORS.goldLight], [8, 13, LORD_COLORS.gemRedGlow], [9, 13, LORD_COLORS.gold],
  [5, 14, LORD_COLORS.goldDark], [6, 14, LORD_COLORS.gemRed], [7, 14, LORD_COLORS.gemRed], [8, 14, LORD_COLORS.gemRed], [9, 14, LORD_COLORS.goldDark],

  // ===== 长袍领口 =====
  [3, 15, LORD_COLORS.cape], [4, 15, LORD_COLORS.capeLight], [5, 15, LORD_COLORS.capePurple], [6, 15, LORD_COLORS.rune], [7, 15, LORD_COLORS.rune], [8, 15, LORD_COLORS.capePurple], [9, 15, LORD_COLORS.capeLight], [10, 15, LORD_COLORS.cape],
]

// 向下面朝 - 正面
const LORD_FACE_DOWN = [
  // ===== 恶魔角 =====
  [2, 0, LORD_COLORS.hornDark], [3, 0, LORD_COLORS.horn], [8, 0, LORD_COLORS.horn], [9, 0, LORD_COLORS.hornDark],
  [2, 1, LORD_COLORS.horn], [3, 1, LORD_COLORS.hornLight], [4, 1, LORD_COLORS.horn], [8, 1, LORD_COLORS.horn], [9, 1, LORD_COLORS.hornLight], [10, 1, LORD_COLORS.horn],
  [3, 2, LORD_COLORS.hornDark], [4, 2, LORD_COLORS.horn], [5, 2, LORD_COLORS.hornLight], [7, 2, LORD_COLORS.hornLight], [8, 2, LORD_COLORS.horn], [9, 2, LORD_COLORS.hornDark],
  [4, 3, LORD_COLORS.hornDark], [5, 3, LORD_COLORS.horn], [7, 3, LORD_COLORS.horn], [8, 3, LORD_COLORS.hornDark],

  // ===== 头发/头部装饰 =====
  [3, 3, LORD_COLORS.hair], [4, 3, LORD_COLORS.hairDark], [5, 3, LORD_COLORS.hair], [6, 3, LORD_COLORS.hairLight], [7, 3, LORD_COLORS.hair], [8, 3, LORD_COLORS.hairDark], [9, 3, LORD_COLORS.hair],
  [2, 4, LORD_COLORS.hair], [3, 4, LORD_COLORS.hairLight], [4, 4, LORD_COLORS.hair], [5, 4, LORD_COLORS.hairDark], [6, 4, LORD_COLORS.hair], [7, 4, LORD_COLORS.hairDark], [8, 4, LORD_COLORS.hair], [9, 4, LORD_COLORS.hairLight], [10, 4, LORD_COLORS.hair],
  [2, 5, LORD_COLORS.hair], [3, 5, LORD_COLORS.hair], [4, 5, LORD_COLORS.hairLight], [9, 5, LORD_COLORS.hairLight], [10, 5, LORD_COLORS.hair],

  // ===== 脸部 =====
  [4, 5, LORD_COLORS.face], [5, 5, LORD_COLORS.faceLight], [6, 5, LORD_COLORS.face], [7, 5, LORD_COLORS.face], [8, 5, LORD_COLORS.faceLight], [9, 5, LORD_COLORS.face],
  [4, 6, LORD_COLORS.faceLight], [5, 6, LORD_COLORS.eye], [6, 6, LORD_COLORS.eyeGlow], [7, 6, LORD_COLORS.eyeGlow], [8, 6, LORD_COLORS.eye], [9, 6, LORD_COLORS.faceLight],
  [4, 7, LORD_COLORS.face], [5, 7, LORD_COLORS.eyeGlow], [6, 7, LORD_COLORS.eyeInner], [7, 7, LORD_COLORS.eyeInner], [8, 7, LORD_COLORS.eyeGlow], [9, 7, LORD_COLORS.face],
  [4, 8, LORD_COLORS.faceDark], [5, 8, LORD_COLORS.face], [6, 8, LORD_COLORS.faceDark], [7, 8, LORD_COLORS.faceDark], [8, 8, LORD_COLORS.face], [9, 8, LORD_COLORS.faceDark],
  [5, 9, LORD_COLORS.fang], [6, 9, LORD_COLORS.faceDark], [7, 9, LORD_COLORS.faceDark], [8, 9, LORD_COLORS.fang],

  // ===== 金项链 =====
  [5, 10, LORD_COLORS.gold], [6, 10, LORD_COLORS.gemRedGlow], [7, 10, LORD_COLORS.gemRedGlow], [8, 10, LORD_COLORS.gold],
  [6, 11, LORD_COLORS.gemRed], [7, 11, LORD_COLORS.gemRed],

  // ===== 长袍主体（红金）=====
  [2, 11, LORD_COLORS.cape], [3, 11, LORD_COLORS.capeLight], [4, 11, LORD_COLORS.cape], [5, 11, LORD_COLORS.capePurple], [8, 11, LORD_COLORS.capePurple], [9, 11, LORD_COLORS.cape], [10, 11, LORD_COLORS.capeLight], [11, 11, LORD_COLORS.cape],
  [1, 12, LORD_COLORS.capeDark], [2, 12, LORD_COLORS.cape], [3, 12, LORD_COLORS.capeLight], [4, 12, LORD_COLORS.cape], [5, 12, LORD_COLORS.capePurpleLight], [6, 12, LORD_COLORS.rune], [7, 12, LORD_COLORS.rune], [8, 12, LORD_COLORS.capePurpleLight], [9, 12, LORD_COLORS.cape], [10, 12, LORD_COLORS.capeLight], [11, 12, LORD_COLORS.cape], [12, 12, LORD_COLORS.capeDark],
  [1, 13, LORD_COLORS.capeDark], [2, 13, LORD_COLORS.cape], [3, 13, LORD_COLORS.cape], [4, 13, LORD_COLORS.capeLight], [5, 13, LORD_COLORS.capePurple], [6, 13, LORD_COLORS.capePurpleLight], [7, 13, LORD_COLORS.capePurpleLight], [8, 13, LORD_COLORS.capePurple], [9, 13, LORD_COLORS.capeLight], [10, 13, LORD_COLORS.cape], [11, 13, LORD_COLORS.cape], [12, 13, LORD_COLORS.capeDark],
  [2, 14, LORD_COLORS.capeDark], [3, 14, LORD_COLORS.cape], [4, 14, LORD_COLORS.cape], [5, 14, LORD_COLORS.capeLight], [6, 14, LORD_COLORS.capePurple], [7, 14, LORD_COLORS.capePurple], [8, 14, LORD_COLORS.capeLight], [9, 14, LORD_COLORS.cape], [10, 14, LORD_COLORS.cape], [11, 14, LORD_COLORS.capeDark],
  [3, 15, LORD_COLORS.capeDark], [4, 15, LORD_COLORS.cape], [5, 15, LORD_COLORS.capeLight], [6, 15, LORD_COLORS.capePurple], [7, 15, LORD_COLORS.capePurple], [8, 15, LORD_COLORS.capeLight], [9, 15, LORD_COLORS.cape], [10, 15, LORD_COLORS.capeDark],

  // ===== 金腰带装饰 =====
  [4, 13, LORD_COLORS.gold], [10, 13, LORD_COLORS.gold],

  // ===== 左手（持三叉戟/权杖）=====
  [0, 10, LORD_COLORS.claw], [1, 10, LORD_COLORS.clawLight],
  [0, 11, LORD_COLORS.clawDark], [1, 11, LORD_COLORS.claw],
  [0, 12, LORD_COLORS.claw], [1, 12, LORD_COLORS.clawLight],
  [0, 13, LORD_COLORS.staffGoldDark],
  [0, 14, LORD_COLORS.staffGold],
  [0, 15, LORD_COLORS.staffGoldLight],
  [0, 16, LORD_COLORS.tridentDark],
  [1, 16, LORD_COLORS.trident], [0, 17, LORD_COLORS.trident], [2, 16, LORD_COLORS.trident],
  [1, 17, LORD_COLORS.tridentLight], [2, 17, LORD_COLORS.tridentRed],
  [0, 18, LORD_COLORS.gemGlow], [1, 18, LORD_COLORS.gem], [2, 18, LORD_COLORS.gemGlow],

  // ===== 右手（施法手势）=====
  [12, 10, LORD_COLORS.clawLight], [13, 10, LORD_COLORS.claw],
  [12, 11, LORD_COLORS.claw], [13, 11, LORD_COLORS.clawDark],
  [12, 12, LORD_COLORS.clawDark], [13, 12, LORD_COLORS.claw],
  [13, 13, LORD_COLORS.energy],
  [13, 14, LORD_COLORS.energyLight],
  [14, 14, LORD_COLORS.spark],

  // ===== 混沌能量 =====
  [5, 15, LORD_COLORS.chaos], [8, 15, LORD_COLORS.chaos],
  [6, 15, LORD_COLORS.chaosGlow], [7, 15, LORD_COLORS.chaosGlow],
]

// 向上面朝 - 背面
const LORD_FACE_UP = [
  // ===== 恶魔角（背面可见的角尖）=====
  [2, 0, LORD_COLORS.hornDark], [3, 0, LORD_COLORS.horn], [8, 0, LORD_COLORS.horn], [9, 0, LORD_COLORS.hornDark],
  [2, 1, LORD_COLORS.horn], [3, 1, LORD_COLORS.hornLight], [4, 1, LORD_COLORS.horn], [8, 1, LORD_COLORS.horn], [9, 1, LORD_COLORS.hornLight], [10, 1, LORD_COLORS.horn],
  [3, 2, LORD_COLORS.hornDark], [4, 2, LORD_COLORS.horn], [5, 2, LORD_COLORS.hornLight], [7, 2, LORD_COLORS.hornLight], [8, 2, LORD_COLORS.horn], [9, 2, LORD_COLORS.hornDark],
  [4, 3, LORD_COLORS.hornDark], [5, 3, LORD_COLORS.horn], [7, 3, LORD_COLORS.horn], [8, 3, LORD_COLORS.hornDark],

  // ===== 头发/头部背面 =====
  [3, 3, LORD_COLORS.hair], [4, 3, LORD_COLORS.hairLight], [5, 3, LORD_COLORS.hair], [6, 3, LORD_COLORS.hairLight], [7, 3, LORD_COLORS.hair], [8, 3, LORD_COLORS.hairLight], [9, 3, LORD_COLORS.hair],
  [2, 4, LORD_COLORS.hair], [3, 4, LORD_COLORS.hair], [4, 4, LORD_COLORS.hairLight], [5, 4, LORD_COLORS.hair], [6, 4, LORD_COLORS.hairDark], [7, 4, LORD_COLORS.hair], [8, 4, LORD_COLORS.hairLight], [9, 4, LORD_COLORS.hair], [10, 4, LORD_COLORS.hair],
  [2, 5, LORD_COLORS.hairDark], [3, 5, LORD_COLORS.hair], [4, 5, LORD_COLORS.hair], [5, 5, LORD_COLORS.hairLight], [6, 5, LORD_COLORS.hair], [7, 5, LORD_COLORS.hairLight], [8, 5, LORD_COLORS.hair], [9, 5, LORD_COLORS.hair], [10, 5, LORD_COLORS.hairDark],
  [3, 6, LORD_COLORS.hair], [4, 6, LORD_COLORS.hairDark], [5, 6, LORD_COLORS.hair], [6, 6, LORD_COLORS.hair], [7, 6, LORD_COLORS.hair], [8, 6, LORD_COLORS.hairDark], [9, 6, LORD_COLORS.hair],

  // ===== 颈部 + 金饰 =====
  [4, 7, LORD_COLORS.necklace], [5, 7, LORD_COLORS.goldLight], [6, 7, LORD_COLORS.gold], [7, 7, LORD_COLORS.gold], [8, 7, LORD_COLORS.goldLight], [9, 7, LORD_COLORS.necklace],
  [5, 8, LORD_COLORS.cape], [6, 8, LORD_COLORS.capePurpleLight], [7, 8, LORD_COLORS.capePurpleLight], [8, 8, LORD_COLORS.cape],

  // ===== 长袍主体（背面）=====
  [1, 9, LORD_COLORS.capeDark], [2, 9, LORD_COLORS.cape], [3, 9, LORD_COLORS.capeLight], [4, 9, LORD_COLORS.cape], [5, 9, LORD_COLORS.capePurple], [6, 9, LORD_COLORS.runeGlow], [7, 9, LORD_COLORS.runeGlow], [8, 9, LORD_COLORS.capePurple], [9, 9, LORD_COLORS.cape], [10, 9, LORD_COLORS.capeLight], [11, 9, LORD_COLORS.cape], [12, 9, LORD_COLORS.capeDark],
  [1, 10, LORD_COLORS.capeDark], [2, 10, LORD_COLORS.cape], [3, 10, LORD_COLORS.capeLight], [4, 10, LORD_COLORS.cape], [5, 10, LORD_COLORS.capePurpleLight], [6, 10, LORD_COLORS.rune], [7, 10, LORD_COLORS.rune], [8, 10, LORD_COLORS.capePurpleLight], [9, 10, LORD_COLORS.cape], [10, 10, LORD_COLORS.capeLight], [11, 10, LORD_COLORS.cape], [12, 10, LORD_COLORS.capeDark],
  [2, 11, LORD_COLORS.capeDark], [3, 11, LORD_COLORS.cape], [4, 11, LORD_COLORS.cape], [5, 11, LORD_COLORS.capeLight], [6, 11, LORD_COLORS.capePurple], [7, 11, LORD_COLORS.capePurple], [8, 11, LORD_COLORS.capeLight], [9, 11, LORD_COLORS.cape], [10, 11, LORD_COLORS.cape], [11, 11, LORD_COLORS.capeDark],
  [2, 12, LORD_COLORS.capeDark], [3, 12, LORD_COLORS.cape], [4, 12, LORD_COLORS.cape], [5, 12, LORD_COLORS.capeLight], [6, 12, LORD_COLORS.capePurple], [7, 12, LORD_COLORS.capePurple], [8, 12, LORD_COLORS.capeLight], [9, 12, LORD_COLORS.cape], [10, 12, LORD_COLORS.cape], [11, 12, LORD_COLORS.capeDark],
  [3, 13, LORD_COLORS.capeDark], [4, 13, LORD_COLORS.cape], [5, 13, LORD_COLORS.capeLight], [6, 13, LORD_COLORS.capePurple], [7, 13, LORD_COLORS.capePurple], [8, 13, LORD_COLORS.capeLight], [9, 13, LORD_COLORS.cape], [10, 13, LORD_COLORS.capeDark],
  [3, 14, LORD_COLORS.capeDark], [4, 14, LORD_COLORS.cape], [5, 14, LORD_COLORS.cape], [6, 14, LORD_COLORS.capePurpleLight], [7, 14, LORD_COLORS.capePurpleLight], [8, 14, LORD_COLORS.cape], [9, 14, LORD_COLORS.cape], [10, 14, LORD_COLORS.capeDark],
  [4, 15, LORD_COLORS.capeDark], [5, 15, LORD_COLORS.cape], [6, 15, LORD_COLORS.capePurple], [7, 15, LORD_COLORS.capePurple], [8, 15, LORD_COLORS.cape], [9, 15, LORD_COLORS.capeDark],

  // ===== 金腰带（背面）=====
  [4, 12, LORD_COLORS.gold], [10, 12, LORD_COLORS.gold],

  // ===== 武器（背在身后）=====
  [13, 9, LORD_COLORS.tridentLight],
  [13, 10, LORD_COLORS.trident],
  [13, 11, LORD_COLORS.tridentRed],
  [13, 12, LORD_COLORS.staffGoldLight],
  [13, 13, LORD_COLORS.staffGold],
  [13, 14, LORD_COLORS.staffGoldDark],

  // ===== 混沌能量 =====
  [5, 15, LORD_COLORS.chaos], [8, 15, LORD_COLORS.chaos],
]

// 向左面朝 - 侧面
const LORD_FACE_LEFT = [
  // ===== 恶魔角（侧面）=====
  [2, 0, LORD_COLORS.hornDark],
  [2, 1, LORD_COLORS.horn], [3, 1, LORD_COLORS.hornLight],
  [2, 2, LORD_COLORS.hornDark], [3, 2, LORD_COLORS.horn], [4, 2, LORD_COLORS.hornLight],
  [3, 3, LORD_COLORS.hornDark], [4, 3, LORD_COLORS.horn],

  // ===== 头发/头部侧面 =====
  [3, 4, LORD_COLORS.hair], [4, 4, LORD_COLORS.hairLight], [5, 4, LORD_COLORS.hair],
  [3, 5, LORD_COLORS.hairLight], [4, 5, LORD_COLORS.hair], [5, 5, LORD_COLORS.hairDark],
  [3, 6, LORD_COLORS.hair], [4, 6, LORD_COLORS.hairLight], [5, 6, LORD_COLORS.hair],

  // ===== 脸部侧面 =====
  [4, 7, LORD_COLORS.face], [5, 7, LORD_COLORS.faceLight], [6, 7, LORD_COLORS.hair],
  [4, 8, LORD_COLORS.eye], [5, 8, LORD_COLORS.eyeGlow], [6, 8, LORD_COLORS.hair],
  [4, 9, LORD_COLORS.eyeGlow], [5, 9, LORD_COLORS.eyeInner], [6, 9, LORD_COLORS.hairDark],
  [4, 10, LORD_COLORS.face], [5, 10, LORD_COLORS.faceDark], [6, 10, LORD_COLORS.hair],
  [5, 11, LORD_COLORS.fang],

  // ===== 金项链 =====
  [4, 12, LORD_COLORS.gold], [5, 12, LORD_COLORS.gemRedGlow], [6, 12, LORD_COLORS.gold],
  [5, 13, LORD_COLORS.gemRed],

  // ===== 长袍主体 =====
  [3, 13, LORD_COLORS.cape], [4, 13, LORD_COLORS.capeLight], [5, 13, LORD_COLORS.capePurple], [6, 13, LORD_COLORS.cape], [7, 13, LORD_COLORS.capeDark],
  [2, 14, LORD_COLORS.capeDark], [3, 14, LORD_COLORS.cape], [4, 14, LORD_COLORS.capeLight], [5, 14, LORD_COLORS.capePurpleLight], [6, 14, LORD_COLORS.cape], [7, 14, LORD_COLORS.cape], [8, 14, LORD_COLORS.capeDark],
  [2, 15, LORD_COLORS.capeDark], [3, 15, LORD_COLORS.cape], [4, 15, LORD_COLORS.cape], [5, 15, LORD_COLORS.capePurple], [6, 15, LORD_COLORS.cape], [7, 15, LORD_COLORS.cape], [8, 15, LORD_COLORS.capeDark],

  // ===== 左手（前伸持三叉戟）=====
  [0, 7, LORD_COLORS.claw],
  [0, 8, LORD_COLORS.clawLight], [1, 8, LORD_COLORS.claw],
  [0, 9, LORD_COLORS.claw], [1, 9, LORD_COLORS.clawLight],
  [0, 10, LORD_COLORS.clawDark], [1, 10, LORD_COLORS.claw],
  [1, 11, LORD_COLORS.staffGoldDark],
  [1, 12, LORD_COLORS.staffGold],
  [1, 13, LORD_COLORS.staffGoldLight],
  [1, 14, LORD_COLORS.tridentDark],
  [0, 15, LORD_COLORS.trident], [1, 15, LORD_COLORS.tridentLight], [2, 15, LORD_COLORS.trident],
  [0, 16, LORD_COLORS.tridentRed], [1, 16, LORD_COLORS.trident], [2, 16, LORD_COLORS.tridentRed],
  [1, 17, LORD_COLORS.gem],
  [0, 18, LORD_COLORS.gemGlow], [2, 18, LORD_COLORS.gemGlow],

  // ===== 右手（身后）=====
  [8, 10, LORD_COLORS.claw], [9, 10, LORD_COLORS.clawDark],
  [8, 11, LORD_COLORS.clawLight], [9, 11, LORD_COLORS.claw],

  // ===== 混沌能量 =====
  [5, 15, LORD_COLORS.chaos],
  [6, 15, LORD_COLORS.chaosGlow],
]

// 向右面朝 - 侧面镜像
const LORD_FACE_RIGHT = [
  // ===== 恶魔角（侧面）=====
  [8, 0, LORD_COLORS.hornDark],
  [7, 1, LORD_COLORS.hornLight], [8, 1, LORD_COLORS.horn],
  [6, 2, LORD_COLORS.hornLight], [7, 2, LORD_COLORS.horn], [8, 2, LORD_COLORS.hornDark],
  [6, 3, LORD_COLORS.horn], [7, 3, LORD_COLORS.hornDark],

  // ===== 头发/头部侧面 =====
  [5, 4, LORD_COLORS.hair], [6, 4, LORD_COLORS.hairLight], [7, 4, LORD_COLORS.hair],
  [5, 5, LORD_COLORS.hairDark], [6, 5, LORD_COLORS.hair], [7, 5, LORD_COLORS.hairLight],
  [5, 6, LORD_COLORS.hair], [6, 6, LORD_COLORS.hairLight], [7, 6, LORD_COLORS.hair],

  // ===== 脸部侧面 =====
  [5, 7, LORD_COLORS.hair], [6, 7, LORD_COLORS.faceLight], [7, 7, LORD_COLORS.face],
  [5, 8, LORD_COLORS.hair], [6, 8, LORD_COLORS.eyeGlow], [7, 8, LORD_COLORS.eye],
  [5, 9, LORD_COLORS.hairDark], [6, 9, LORD_COLORS.eyeInner], [7, 9, LORD_COLORS.eyeGlow],
  [5, 10, LORD_COLORS.hair], [6, 10, LORD_COLORS.faceDark], [7, 10, LORD_COLORS.face],
  [6, 11, LORD_COLORS.fang],

  // ===== 金项链 =====
  [5, 12, LORD_COLORS.gold], [6, 12, LORD_COLORS.gemRedGlow], [7, 12, LORD_COLORS.gold],
  [6, 13, LORD_COLORS.gemRed],

  // ===== 长袍主体 =====
  [5, 13, LORD_COLORS.capeDark], [6, 13, LORD_COLORS.capePurple], [7, 13, LORD_COLORS.capeLight], [8, 13, LORD_COLORS.cape],
  [4, 14, LORD_COLORS.capeDark], [5, 14, LORD_COLORS.cape], [6, 14, LORD_COLORS.capePurpleLight], [7, 14, LORD_COLORS.capeLight], [8, 14, LORD_COLORS.cape], [9, 14, LORD_COLORS.capeDark],
  [4, 15, LORD_COLORS.capeDark], [5, 15, LORD_COLORS.cape], [6, 15, LORD_COLORS.capePurple], [7, 15, LORD_COLORS.cape], [8, 15, LORD_COLORS.cape], [9, 15, LORD_COLORS.capeDark],

  // ===== 左手（身后）=====
  [3, 10, LORD_COLORS.clawDark], [4, 10, LORD_COLORS.claw],
  [3, 11, LORD_COLORS.claw], [4, 11, LORD_COLORS.clawLight],

  // ===== 右手（前伸持三叉戟）=====
  [10, 7, LORD_COLORS.claw],
  [10, 8, LORD_COLORS.clawLight], [11, 8, LORD_COLORS.claw],
  [10, 9, LORD_COLORS.claw], [11, 9, LORD_COLORS.clawLight],
  [10, 10, LORD_COLORS.clawDark], [11, 10, LORD_COLORS.claw],
  [11, 11, LORD_COLORS.staffGoldDark],
  [11, 12, LORD_COLORS.staffGold],
  [11, 13, LORD_COLORS.staffGoldLight],
  [11, 14, LORD_COLORS.tridentDark],
  [10, 15, LORD_COLORS.trident], [11, 15, LORD_COLORS.tridentLight], [12, 15, LORD_COLORS.trident],
  [10, 16, LORD_COLORS.tridentRed], [11, 16, LORD_COLORS.trident], [12, 16, LORD_COLORS.tridentRed],
  [11, 17, LORD_COLORS.gem],
  [10, 18, LORD_COLORS.gemGlow], [12, 18, LORD_COLORS.gemGlow],

  // ===== 混沌能量 =====
  [6, 15, LORD_COLORS.chaosGlow],
  [7, 15, LORD_COLORS.chaos],
]

// 待机动画帧（眼睛发光 + 符文闪烁 + 能量脉冲）
const LORD_IDLE_FRAMES = [
  // 帧0 - 暗
  [
    { pixels: [
      [6, 6, LORD_COLORS.eye], [7, 6, LORD_COLORS.eye],
      [6, 10, LORD_COLORS.gemRed], [7, 10, LORD_COLORS.gemRed],
      [6, 12, LORD_COLORS.rune], [7, 12, LORD_COLORS.rune],
      [5, 15, LORD_COLORS.chaos], [8, 15, LORD_COLORS.chaos],
    ] }
  ],
  // 帧1 - 亮（眼睛发光 + 符文强发光 + 能量爆发）
  [
    { pixels: [
      [6, 6, LORD_COLORS.eyeGlow], [7, 6, LORD_COLORS.eyeGlow],
      [6, 10, LORD_COLORS.gemRedGlow], [7, 10, LORD_COLORS.gemRedGlow],
      [6, 12, LORD_COLORS.runeGlow], [7, 12, LORD_COLORS.runeGlow],
      [5, 15, LORD_COLORS.chaosGlow], [8, 15, LORD_COLORS.chaosGlow],
      [6, 15, LORD_COLORS.spark], [7, 15, LORD_COLORS.spark],
    ] }
  ],
]

// 行走动画帧（步伐）
const LORD_WALK_FRAMES = [
  // 帧0 - 左脚前
  [
    { pixels: [
      [5, 15, LORD_COLORS.bootDark], [6, 15, LORD_COLORS.capePurple], [7, 15, LORD_COLORS.capePurple], [8, 15, LORD_COLORS.bootDark],
    ] }
  ],
  // 帧1 - 中间
  [
    { pixels: [
      [5, 15, LORD_COLORS.capePurple], [6, 15, LORD_COLORS.bootDark], [7, 15, LORD_COLORS.bootDark], [8, 15, LORD_COLORS.capePurple],
    ] }
  ],
  // 帧2 - 右脚前
  [
    { pixels: [
      [5, 15, LORD_COLORS.capePurpleLight], [6, 15, LORD_COLORS.capePurple], [7, 15, LORD_COLORS.capePurple], [8, 15, LORD_COLORS.capePurpleLight],
    ] }
  ],
]

export const drawMaouOfChaos = (canvasRef, currentUnit) => {
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

export const drawMaouOfChaosAvatar = (canvasRef, currentUnit, avatarPos) => {
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