/**
 * 绘制幽灵骑士怪物
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit 幽灵骑士位置和状态
 * @param {Number} currentUnit.x 幽灵骑士x坐标
 * @param {Number} currentUnit.y 幽灵骑士y坐标
 * @param {Number} currentUnit.size 幽灵骑士大小(px)
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

export const config = {
  IDLE_SPEED: 0.004,
  WALK_SPEED: 0.08,
}

// 幽灵骑士颜色（苍白色半透明幽灵 + 暗蓝盔甲 + 发光剑）
const KNIGHT_COLORS = {
  // 幽灵主体 - 苍白色/淡蓝
  phantom: '#E0E8F0',       // 幽灵主色 - 苍白
  phantomLight: '#F0F5FA',  // 幽灵亮色
  phantomDark: '#A8B5C4',   // 幽灵暗色
  phantomShadow: '#7A8FA6', // 幽灵阴影
  phantomGlow: '#B8D4F0',   // 幽灵发光
  // 盔甲 - 暗蓝/银色
  armor: '#4A5A7A',         // 盔甲主色
  armorLight: '#6B7E9E',    // 盔甲亮
  armorDark: '#2A3650',     // 盔甲暗
  armorEdge: '#1A2035',     // 盔甲边缘
  plate: '#8A9BBC',         // 金属板
  plateLight: '#AFC5E0',    // 金属亮
  // 头盔
  helmet: '#5A6A8A',        // 头盔
  helmetLight: '#7A8EAF',   // 头盔亮
  helmetDark: '#3A4866',    // 头盔暗
  visor: '#00FFAA',         // 护目镜发光 - 翠绿
  visorGlow: '#80FFCC',     // 护目镜强发光
  // 披风
  cape: '#1A3A5A',          // 披风主色
  capeDark: '#0A2040',      // 披风暗
  capeLight: '#2A4A7A',     // 披风亮
  // 剑 - 发光幽灵剑
  sword: '#C0D8F0',         // 剑刃
  swordLight: '#E8F4FF',    // 剑刃亮
  swordGlow: '#80CCFF',     // 剑发光
  swordDark: '#6A8FB5',     // 剑暗
  hilt: '#8B7355',          // 剑柄棕
  hiltDark: '#5A4530',      // 剑柄暗
  // 盾
  shield: '#5A6A8A',        // 盾
  shieldLight: '#7A8EAF',   // 盾亮
  shieldDark: '#3A4866',    // 盾暗
  shieldEmblem: '#FFD700',  // 盾纹章 - 金色
  // 其他
  belt: '#2A3650',          // 腰带
  chain: '#6B7E9E',         // 锁链
  hand: '#B8C8D8',          // 手
  boot: '#3A4866',          // 靴
  bootDark: '#1A2035',      // 靴暗
  // 幽灵气/粒子
  aura: '#80FFCC',          // 灵气
  auraLight: '#B8FFE0',     // 灵气亮
  spark: '#FFFFFF',         // 粒子
  highlight: '#FFFFFF',      // 高光
}

// 幽灵骑士高精度头像（16x16网格，聚焦头部特写）
const KNIGHT_AVATAR = [
  // ===== 头盔顶部边缘 =====
  [4, 0, KNIGHT_COLORS.helmetDark], [5, 0, KNIGHT_COLORS.helmet], [6, 0, KNIGHT_COLORS.helmetLight], [7, 0, KNIGHT_COLORS.helmetLight], [8, 0, KNIGHT_COLORS.helmetLight], [9, 0, KNIGHT_COLORS.helmet], [10, 0, KNIGHT_COLORS.helmetDark],
  [4, 1, KNIGHT_COLORS.helmet], [5, 1, KNIGHT_COLORS.helmetLight], [6, 1, KNIGHT_COLORS.helmet], [7, 1, KNIGHT_COLORS.helmetLight], [8, 1, KNIGHT_COLORS.helmetLight], [9, 1, KNIGHT_COLORS.helmet], [10, 1, KNIGHT_COLORS.helmetLight], [11, 1, KNIGHT_COLORS.helmet],

  // ===== 头盔第一层 =====
  [3, 2, KNIGHT_COLORS.helmetDark], [4, 2, KNIGHT_COLORS.helmet], [5, 2, KNIGHT_COLORS.helmetLight], [6, 2, KNIGHT_COLORS.helmet], [7, 2, KNIGHT_COLORS.helmetLight], [8, 2, KNIGHT_COLORS.helmetLight], [9, 2, KNIGHT_COLORS.helmet], [10, 2, KNIGHT_COLORS.helmetLight], [11, 2, KNIGHT_COLORS.helmet], [12, 2, KNIGHT_COLORS.helmetDark],
  [3, 3, KNIGHT_COLORS.helmetDark], [4, 3, KNIGHT_COLORS.helmet], [5, 3, KNIGHT_COLORS.helmetLight], [6, 3, KNIGHT_COLORS.helmet], [7, 3, KNIGHT_COLORS.helmetLight], [8, 3, KNIGHT_COLORS.helmetLight], [9, 3, KNIGHT_COLORS.helmet], [10, 3, KNIGHT_COLORS.helmetLight], [11, 3, KNIGHT_COLORS.helmet], [12, 3, KNIGHT_COLORS.helmetDark],

  // ===== 头盔主体 =====
  [2, 4, KNIGHT_COLORS.helmetDark], [3, 4, KNIGHT_COLORS.helmet], [4, 4, KNIGHT_COLORS.helmet], [5, 4, KNIGHT_COLORS.helmetLight], [6, 4, KNIGHT_COLORS.helmet], [7, 4, KNIGHT_COLORS.helmetLight], [8, 4, KNIGHT_COLORS.helmetLight], [9, 4, KNIGHT_COLORS.helmet], [10, 4, KNIGHT_COLORS.helmetLight], [11, 4, KNIGHT_COLORS.helmet], [12, 4, KNIGHT_COLORS.helmet], [13, 4, KNIGHT_COLORS.helmetDark],
  [2, 5, KNIGHT_COLORS.helmetDark], [3, 5, KNIGHT_COLORS.helmet], [4, 5, KNIGHT_COLORS.helmetLight], [5, 5, KNIGHT_COLORS.helmet], [6, 5, KNIGHT_COLORS.helmetLight], [7, 5, KNIGHT_COLORS.helmet], [8, 5, KNIGHT_COLORS.helmet], [9, 5, KNIGHT_COLORS.helmetLight], [10, 5, KNIGHT_COLORS.helmet], [11, 5, KNIGHT_COLORS.helmetLight], [12, 5, KNIGHT_COLORS.helmet], [13, 5, KNIGHT_COLORS.helmetDark],

  // ===== 护目镜区域 =====
  [2, 6, KNIGHT_COLORS.helmetDark], [3, 6, KNIGHT_COLORS.helmet], [4, 6, KNIGHT_COLORS.visor], [5, 6, KNIGHT_COLORS.visorGlow], [6, 6, KNIGHT_COLORS.visorGlow], [7, 6, KNIGHT_COLORS.visorGlow], [8, 6, KNIGHT_COLORS.visorGlow], [9, 6, KNIGHT_COLORS.visor], [10, 6, KNIGHT_COLORS.visorGlow], [11, 6, KNIGHT_COLORS.helmet], [12, 6, KNIGHT_COLORS.helmetDark],
  [3, 7, KNIGHT_COLORS.helmetDark], [4, 7, KNIGHT_COLORS.visorGlow], [5, 7, KNIGHT_COLORS.visor], [6, 7, KNIGHT_COLORS.visor], [7, 7, KNIGHT_COLORS.visor], [8, 7, KNIGHT_COLORS.visor], [9, 7, KNIGHT_COLORS.visorGlow], [10, 7, KNIGHT_COLORS.visor], [11, 7, KNIGHT_COLORS.helmetDark],
  // 护目镜高光
  [4, 6, KNIGHT_COLORS.highlight], [5, 6, KNIGHT_COLORS.highlight], [9, 6, KNIGHT_COLORS.highlight], [10, 6, KNIGHT_COLORS.highlight],
  [4, 7, KNIGHT_COLORS.highlight], [9, 7, KNIGHT_COLORS.highlight],

  // ===== 头盔底部 =====
  [3, 8, KNIGHT_COLORS.armorEdge], [4, 8, KNIGHT_COLORS.helmetDark], [5, 8, KNIGHT_COLORS.helmet], [6, 8, KNIGHT_COLORS.helmet], [7, 8, KNIGHT_COLORS.helmet], [8, 8, KNIGHT_COLORS.helmet], [9, 8, KNIGHT_COLORS.helmetDark], [10, 8, KNIGHT_COLORS.armorEdge],

  // ===== 肩甲 =====
  [2, 9, KNIGHT_COLORS.armorDark], [3, 9, KNIGHT_COLORS.armor], [4, 9, KNIGHT_COLORS.plate], [5, 9, KNIGHT_COLORS.plateLight], [6, 9, KNIGHT_COLORS.plate], [7, 9, KNIGHT_COLORS.plateLight], [8, 9, KNIGHT_COLORS.plate], [9, 9, KNIGHT_COLORS.plateLight], [10, 9, KNIGHT_COLORS.plate], [11, 9, KNIGHT_COLORS.armor], [12, 9, KNIGHT_COLORS.armorDark],

  // ===== 胸甲领口 =====
  [2, 10, KNIGHT_COLORS.armorDark], [3, 10, KNIGHT_COLORS.armor], [4, 10, KNIGHT_COLORS.armorLight], [5, 10, KNIGHT_COLORS.plate], [6, 10, KNIGHT_COLORS.plateLight], [7, 10, KNIGHT_COLORS.plateLight], [8, 10, KNIGHT_COLORS.plateLight], [9, 10, KNIGHT_COLORS.plate], [10, 10, KNIGHT_COLORS.armorLight], [11, 10, KNIGHT_COLORS.armor], [12, 10, KNIGHT_COLORS.armorDark],
  [3, 11, KNIGHT_COLORS.armorDark], [4, 11, KNIGHT_COLORS.armor], [5, 11, KNIGHT_COLORS.plateLight], [6, 11, KNIGHT_COLORS.plate], [7, 11, KNIGHT_COLORS.plate], [8, 11, KNIGHT_COLORS.plate], [9, 11, KNIGHT_COLORS.plateLight], [10, 11, KNIGHT_COLORS.armor], [11, 11, KNIGHT_COLORS.armorDark],

  // ===== 幽魂光芒装饰 =====
  [4, 10, KNIGHT_COLORS.phantomGlow], [5, 10, KNIGHT_COLORS.aura],
  [10, 10, KNIGHT_COLORS.phantomGlow], [9, 10, KNIGHT_COLORS.aura],
  [5, 11, KNIGHT_COLORS.auraLight], [10, 11, KNIGHT_COLORS.auraLight],

  // ===== 胸甲底部 =====
  [4, 12, KNIGHT_COLORS.belt], [5, 12, KNIGHT_COLORS.plateLight], [6, 12, KNIGHT_COLORS.plate], [7, 12, KNIGHT_COLORS.plate], [8, 12, KNIGHT_COLORS.plateLight], [9, 12, KNIGHT_COLORS.plate], [10, 12, KNIGHT_COLORS.belt],
  [4, 13, KNIGHT_COLORS.armorDark], [5, 13, KNIGHT_COLORS.armor], [6, 13, KNIGHT_COLORS.plateLight], [7, 13, KNIGHT_COLORS.plateLight], [8, 13, KNIGHT_COLORS.plateLight], [9, 13, KNIGHT_COLORS.armor], [10, 13, KNIGHT_COLORS.armorDark],

  // ===== 头盔底部边缘 =====
  [5, 14, KNIGHT_COLORS.helmetDark], [6, 14, KNIGHT_COLORS.helmet], [7, 14, KNIGHT_COLORS.helmetLight], [8, 14, KNIGHT_COLORS.helmetLight], [9, 14, KNIGHT_COLORS.helmet], [10, 14, KNIGHT_COLORS.helmetDark],
]

// 向下面朝 - 正面
const KNIGHT_FACE_DOWN = [
  // ===== 头盔顶部 =====
  [5, 0, KNIGHT_COLORS.helmet], [6, 0, KNIGHT_COLORS.helmetLight], [7, 0, KNIGHT_COLORS.helmetLight], [8, 0, KNIGHT_COLORS.helmet],
  [4, 1, KNIGHT_COLORS.helmet], [5, 1, KNIGHT_COLORS.helmetLight], [6, 1, KNIGHT_COLORS.helmet], [7, 1, KNIGHT_COLORS.helmet], [8, 1, KNIGHT_COLORS.helmetLight], [9, 1, KNIGHT_COLORS.helmet],
  [3, 2, KNIGHT_COLORS.helmetDark], [4, 2, KNIGHT_COLORS.helmet], [5, 2, KNIGHT_COLORS.helmetLight], [6, 2, KNIGHT_COLORS.helmet], [7, 2, KNIGHT_COLORS.helmet], [8, 2, KNIGHT_COLORS.helmetLight], [9, 2, KNIGHT_COLORS.helmet], [10, 2, KNIGHT_COLORS.helmetDark],

  // ===== 头盔主体 =====
  [3, 3, KNIGHT_COLORS.helmetDark], [4, 3, KNIGHT_COLORS.helmet], [5, 3, KNIGHT_COLORS.helmetLight], [6, 3, KNIGHT_COLORS.helmet], [7, 3, KNIGHT_COLORS.helmet], [8, 3, KNIGHT_COLORS.helmetLight], [9, 3, KNIGHT_COLORS.helmet], [10, 3, KNIGHT_COLORS.helmetDark],
  [3, 4, KNIGHT_COLORS.helmetDark], [4, 4, KNIGHT_COLORS.helmet], [5, 4, KNIGHT_COLORS.visor], [6, 4, KNIGHT_COLORS.visorGlow], [7, 4, KNIGHT_COLORS.visorGlow], [8, 4, KNIGHT_COLORS.visor], [9, 4, KNIGHT_COLORS.helmet], [10, 4, KNIGHT_COLORS.helmetDark],
  [3, 5, KNIGHT_COLORS.helmetDark], [4, 5, KNIGHT_COLORS.helmet], [5, 5, KNIGHT_COLORS.visorGlow], [6, 5, KNIGHT_COLORS.visor], [7, 5, KNIGHT_COLORS.visor], [8, 5, KNIGHT_COLORS.visorGlow], [9, 5, KNIGHT_COLORS.helmet], [10, 5, KNIGHT_COLORS.helmetDark],
  [4, 6, KNIGHT_COLORS.armorEdge], [5, 6, KNIGHT_COLORS.helmetDark], [6, 6, KNIGHT_COLORS.helmet], [7, 6, KNIGHT_COLORS.helmet], [8, 6, KNIGHT_COLORS.helmetDark], [9, 6, KNIGHT_COLORS.armorEdge],

  // ===== 颈部 + 肩甲 =====
  [3, 7, KNIGHT_COLORS.armorDark], [4, 7, KNIGHT_COLORS.armor], [5, 7, KNIGHT_COLORS.plate], [6, 7, KNIGHT_COLORS.plateLight], [7, 7, KNIGHT_COLORS.plateLight], [8, 7, KNIGHT_COLORS.plate], [9, 7, KNIGHT_COLORS.armor], [10, 7, KNIGHT_COLORS.armorDark],
  [2, 8, KNIGHT_COLORS.armorDark], [3, 8, KNIGHT_COLORS.armor], [4, 8, KNIGHT_COLORS.armorLight], [5, 8, KNIGHT_COLORS.plate], [6, 8, KNIGHT_COLORS.plateLight], [7, 8, KNIGHT_COLORS.plateLight], [8, 8, KNIGHT_COLORS.plate], [9, 8, KNIGHT_COLORS.armorLight], [10, 8, KNIGHT_COLORS.armor], [11, 8, KNIGHT_COLORS.armorDark],

  // ===== 胸甲 =====
  [2, 9, KNIGHT_COLORS.armorDark], [3, 9, KNIGHT_COLORS.armor], [4, 9, KNIGHT_COLORS.plate], [5, 9, KNIGHT_COLORS.plateLight], [6, 9, KNIGHT_COLORS.plate], [7, 9, KNIGHT_COLORS.plate], [8, 9, KNIGHT_COLORS.plateLight], [9, 9, KNIGHT_COLORS.plate], [10, 9, KNIGHT_COLORS.armor], [11, 9, KNIGHT_COLORS.armorDark],
  [2, 10, KNIGHT_COLORS.armorDark], [3, 10, KNIGHT_COLORS.armor], [4, 10, KNIGHT_COLORS.armorLight], [5, 10, KNIGHT_COLORS.plate], [6, 10, KNIGHT_COLORS.plateLight], [7, 10, KNIGHT_COLORS.plateLight], [8, 10, KNIGHT_COLORS.plate], [9, 10, KNIGHT_COLORS.armorLight], [10, 10, KNIGHT_COLORS.armor], [11, 10, KNIGHT_COLORS.armorDark],

  // ===== 腰甲 =====
  [3, 11, KNIGHT_COLORS.belt], [4, 11, KNIGHT_COLORS.belt], [5, 11, KNIGHT_COLORS.plateLight], [6, 11, KNIGHT_COLORS.plate], [7, 11, KNIGHT_COLORS.plate], [8, 11, KNIGHT_COLORS.plateLight], [9, 11, KNIGHT_COLORS.belt], [10, 11, KNIGHT_COLORS.belt],
  [3, 12, KNIGHT_COLORS.armor], [4, 12, KNIGHT_COLORS.armorDark], [5, 12, KNIGHT_COLORS.armor], [6, 12, KNIGHT_COLORS.armorLight], [7, 12, KNIGHT_COLORS.armorLight], [8, 12, KNIGHT_COLORS.armor], [9, 12, KNIGHT_COLORS.armorDark], [10, 12, KNIGHT_COLORS.armor],

  // ===== 腿甲 =====
  [4, 13, KNIGHT_COLORS.armor], [5, 13, KNIGHT_COLORS.plate], [6, 13, KNIGHT_COLORS.plateLight], [7, 13, KNIGHT_COLORS.plateLight], [8, 13, KNIGHT_COLORS.plate], [9, 13, KNIGHT_COLORS.armor],
  [4, 14, KNIGHT_COLORS.armorDark], [5, 14, KNIGHT_COLORS.armor], [6, 14, KNIGHT_COLORS.plate], [7, 14, KNIGHT_COLORS.plate], [8, 14, KNIGHT_COLORS.armor], [9, 14, KNIGHT_COLORS.armorDark],

  // ===== 靴子 =====
  [4, 15, KNIGHT_COLORS.boot], [5, 15, KNIGHT_COLORS.boot], [6, 15, KNIGHT_COLORS.bootDark], [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.boot], [9, 15, KNIGHT_COLORS.boot],

  // ===== 左手（持剑）=====
  [1, 9, KNIGHT_COLORS.armorDark], [2, 9, KNIGHT_COLORS.armor],
  [1, 10, KNIGHT_COLORS.hand], [2, 10, KNIGHT_COLORS.armor],
  [0, 11, KNIGHT_COLORS.hilt], [1, 11, KNIGHT_COLORS.hilt],
  [0, 12, KNIGHT_COLORS.hiltDark], [1, 12, KNIGHT_COLORS.hilt],

  // ===== 剑刃（向下/向前）=====
  [0, 7, KNIGHT_COLORS.swordGlow], [1, 7, KNIGHT_COLORS.swordLight],
  [0, 8, KNIGHT_COLORS.swordLight], [1, 8, KNIGHT_COLORS.sword],

  // ===== 右手（持盾）=====
  [11, 9, KNIGHT_COLORS.armor], [12, 9, KNIGHT_COLORS.armorDark],
  [11, 10, KNIGHT_COLORS.armor], [12, 10, KNIGHT_COLORS.hand],
  [12, 11, KNIGHT_COLORS.shield], [13, 11, KNIGHT_COLORS.shieldDark],
  [12, 12, KNIGHT_COLORS.shield], [13, 12, KNIGHT_COLORS.shieldDark],
  [12, 13, KNIGHT_COLORS.shieldLight], [13, 13, KNIGHT_COLORS.shieldEmblem],

  // ===== 幽灵气/发光（底部）=====
  [5, 15, KNIGHT_COLORS.aura], [8, 15, KNIGHT_COLORS.aura],
]

// 向上面朝 - 背面
const KNIGHT_FACE_UP = [
  // ===== 头盔顶部 =====
  [5, 0, KNIGHT_COLORS.helmet], [6, 0, KNIGHT_COLORS.helmetLight], [7, 0, KNIGHT_COLORS.helmetLight], [8, 0, KNIGHT_COLORS.helmet],
  [4, 1, KNIGHT_COLORS.helmet], [5, 1, KNIGHT_COLORS.helmetLight], [6, 1, KNIGHT_COLORS.helmet], [7, 1, KNIGHT_COLORS.helmet], [8, 1, KNIGHT_COLORS.helmetLight], [9, 1, KNIGHT_COLORS.helmet],
  [3, 2, KNIGHT_COLORS.helmetDark], [4, 2, KNIGHT_COLORS.helmet], [5, 2, KNIGHT_COLORS.helmetLight], [6, 2, KNIGHT_COLORS.helmet], [7, 2, KNIGHT_COLORS.helmet], [8, 2, KNIGHT_COLORS.helmetLight], [9, 2, KNIGHT_COLORS.helmet], [10, 2, KNIGHT_COLORS.helmetDark],

  // ===== 头盔背面 =====
  [3, 3, KNIGHT_COLORS.helmetDark], [4, 3, KNIGHT_COLORS.helmet], [5, 3, KNIGHT_COLORS.helmetLight], [6, 3, KNIGHT_COLORS.helmet], [7, 3, KNIGHT_COLORS.helmet], [8, 3, KNIGHT_COLORS.helmetLight], [9, 3, KNIGHT_COLORS.helmet], [10, 3, KNIGHT_COLORS.helmetDark],
  [3, 4, KNIGHT_COLORS.helmetDark], [4, 4, KNIGHT_COLORS.helmet], [5, 4, KNIGHT_COLORS.helmet], [6, 4, KNIGHT_COLORS.helmetLight], [7, 4, KNIGHT_COLORS.helmetLight], [8, 4, KNIGHT_COLORS.helmet], [9, 4, KNIGHT_COLORS.helmet], [10, 4, KNIGHT_COLORS.helmetDark],
  [3, 5, KNIGHT_COLORS.helmetDark], [4, 5, KNIGHT_COLORS.helmet], [5, 5, KNIGHT_COLORS.helmet], [6, 5, KNIGHT_COLORS.helmet], [7, 5, KNIGHT_COLORS.helmet], [8, 5, KNIGHT_COLORS.helmet], [9, 5, KNIGHT_COLORS.helmet], [10, 5, KNIGHT_COLORS.helmetDark],
  [4, 6, KNIGHT_COLORS.helmetDark], [5, 6, KNIGHT_COLORS.helmet], [6, 6, KNIGHT_COLORS.helmetDark], [7, 6, KNIGHT_COLORS.helmetDark], [8, 6, KNIGHT_COLORS.helmet], [9, 6, KNIGHT_COLORS.helmetDark],

  // ===== 颈部 + 披风 =====
  [2, 7, KNIGHT_COLORS.capeDark], [3, 7, KNIGHT_COLORS.cape], [4, 7, KNIGHT_COLORS.capeLight], [5, 7, KNIGHT_COLORS.cape], [6, 7, KNIGHT_COLORS.cape], [7, 7, KNIGHT_COLORS.cape], [8, 7, KNIGHT_COLORS.capeLight], [9, 7, KNIGHT_COLORS.cape], [10, 7, KNIGHT_COLORS.capeDark],
  [1, 8, KNIGHT_COLORS.capeDark], [2, 8, KNIGHT_COLORS.cape], [3, 8, KNIGHT_COLORS.capeLight], [4, 8, KNIGHT_COLORS.cape], [5, 8, KNIGHT_COLORS.cape], [6, 8, KNIGHT_COLORS.capeLight], [7, 8, KNIGHT_COLORS.cape], [8, 8, KNIGHT_COLORS.cape], [9, 8, KNIGHT_COLORS.capeLight], [10, 8, KNIGHT_COLORS.cape], [11, 8, KNIGHT_COLORS.capeDark],

  // ===== 披风主体（宽大）=====
  [1, 9, KNIGHT_COLORS.capeDark], [2, 9, KNIGHT_COLORS.cape], [3, 9, KNIGHT_COLORS.cape], [4, 9, KNIGHT_COLORS.capeLight], [5, 9, KNIGHT_COLORS.cape], [6, 9, KNIGHT_COLORS.cape], [7, 9, KNIGHT_COLORS.cape], [8, 9, KNIGHT_COLORS.capeLight], [9, 9, KNIGHT_COLORS.cape], [10, 9, KNIGHT_COLORS.cape], [11, 9, KNIGHT_COLORS.capeDark],
  [1, 10, KNIGHT_COLORS.capeDark], [2, 10, KNIGHT_COLORS.cape], [3, 10, KNIGHT_COLORS.capeLight], [4, 10, KNIGHT_COLORS.cape], [5, 10, KNIGHT_COLORS.cape], [6, 10, KNIGHT_COLORS.capeLight], [7, 10, KNIGHT_COLORS.capeLight], [8, 10, KNIGHT_COLORS.cape], [9, 10, KNIGHT_COLORS.cape], [10, 10, KNIGHT_COLORS.capeLight], [11, 10, KNIGHT_COLORS.cape], [12, 10, KNIGHT_COLORS.capeDark],
  [2, 11, KNIGHT_COLORS.capeDark], [3, 11, KNIGHT_COLORS.cape], [4, 11, KNIGHT_COLORS.cape], [5, 11, KNIGHT_COLORS.capeLight], [6, 11, KNIGHT_COLORS.cape], [7, 11, KNIGHT_COLORS.cape], [8, 11, KNIGHT_COLORS.capeLight], [9, 11, KNIGHT_COLORS.cape], [10, 11, KNIGHT_COLORS.cape], [11, 11, KNIGHT_COLORS.capeDark],
  [3, 12, KNIGHT_COLORS.capeDark], [4, 12, KNIGHT_COLORS.cape], [5, 12, KNIGHT_COLORS.capeLight], [6, 12, KNIGHT_COLORS.cape], [7, 12, KNIGHT_COLORS.cape], [8, 12, KNIGHT_COLORS.capeLight], [9, 12, KNIGHT_COLORS.cape], [10, 12, KNIGHT_COLORS.cape], [11, 12, KNIGHT_COLORS.capeDark],

  // ===== 腿甲背面 =====
  [4, 13, KNIGHT_COLORS.armorDark], [5, 13, KNIGHT_COLORS.armor], [6, 13, KNIGHT_COLORS.plate], [7, 13, KNIGHT_COLORS.plate], [8, 13, KNIGHT_COLORS.armor], [9, 13, KNIGHT_COLORS.armorDark],
  [4, 14, KNIGHT_COLORS.armor], [5, 14, KNIGHT_COLORS.armorDark], [6, 14, KNIGHT_COLORS.armor], [7, 14, KNIGHT_COLORS.armor], [8, 14, KNIGHT_COLORS.armorDark], [9, 14, KNIGHT_COLORS.armor],

  // ===== 靴子 =====
  [4, 15, KNIGHT_COLORS.bootDark], [5, 15, KNIGHT_COLORS.boot], [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.boot], [8, 15, KNIGHT_COLORS.boot], [9, 15, KNIGHT_COLORS.bootDark],

  // ===== 剑（背面侧放）=====
  [12, 5, KNIGHT_COLORS.swordGlow],
  [12, 6, KNIGHT_COLORS.swordLight],
  [12, 7, KNIGHT_COLORS.sword],
  [12, 8, KNIGHT_COLORS.swordDark],
  [12, 9, KNIGHT_COLORS.hilt],
  [12, 10, KNIGHT_COLORS.hiltDark],

  // ===== 幽灵气 =====
  [5, 15, KNIGHT_COLORS.aura], [8, 15, KNIGHT_COLORS.aura],
  [6, 15, KNIGHT_COLORS.auraLight], [7, 15, KNIGHT_COLORS.auraLight],
]

// 向左面朝 - 侧面
const KNIGHT_FACE_LEFT = [
  // ===== 头盔 =====
  [5, 0, KNIGHT_COLORS.helmet], [6, 0, KNIGHT_COLORS.helmetLight], [7, 0, KNIGHT_COLORS.helmet],
  [4, 1, KNIGHT_COLORS.helmet], [5, 1, KNIGHT_COLORS.helmetLight], [6, 1, KNIGHT_COLORS.helmet], [7, 1, KNIGHT_COLORS.helmetLight], [8, 1, KNIGHT_COLORS.helmet],
  [4, 2, KNIGHT_COLORS.helmetDark], [5, 2, KNIGHT_COLORS.helmet], [6, 2, KNIGHT_COLORS.helmetLight], [7, 2, KNIGHT_COLORS.helmet], [8, 2, KNIGHT_COLORS.helmetDark],
  [4, 3, KNIGHT_COLORS.helmetDark], [5, 3, KNIGHT_COLORS.helmet], [6, 3, KNIGHT_COLORS.helmetLight], [7, 3, KNIGHT_COLORS.helmet], [8, 3, KNIGHT_COLORS.helmetDark],

  // ===== 侧面护目镜（一只）=====
  [4, 4, KNIGHT_COLORS.helmetDark], [5, 4, KNIGHT_COLORS.visorGlow], [6, 4, KNIGHT_COLORS.visor], [7, 4, KNIGHT_COLORS.helmet], [8, 4, KNIGHT_COLORS.helmetDark],
  [4, 5, KNIGHT_COLORS.helmetDark], [5, 5, KNIGHT_COLORS.visor], [6, 5, KNIGHT_COLORS.visorGlow], [7, 5, KNIGHT_COLORS.helmet], [8, 5, KNIGHT_COLORS.helmetDark],
  [5, 6, KNIGHT_COLORS.armorEdge], [6, 6, KNIGHT_COLORS.helmetDark], [7, 6, KNIGHT_COLORS.helmet],

  // ===== 肩甲 =====
  [3, 7, KNIGHT_COLORS.armorDark], [4, 7, KNIGHT_COLORS.plate], [5, 7, KNIGHT_COLORS.plateLight], [6, 7, KNIGHT_COLORS.plate], [7, 7, KNIGHT_COLORS.plateLight], [8, 7, KNIGHT_COLORS.plate], [9, 7, KNIGHT_COLORS.armorDark],
  [2, 8, KNIGHT_COLORS.armorDark], [3, 8, KNIGHT_COLORS.armor], [4, 8, KNIGHT_COLORS.plate], [5, 8, KNIGHT_COLORS.plateLight], [6, 8, KNIGHT_COLORS.plate], [7, 8, KNIGHT_COLORS.plateLight], [8, 8, KNIGHT_COLORS.plate], [9, 8, KNIGHT_COLORS.armor], [10, 8, KNIGHT_COLORS.armorDark],

  // ===== 胸甲侧面 =====
  [2, 9, KNIGHT_COLORS.armorDark], [3, 9, KNIGHT_COLORS.armor], [4, 9, KNIGHT_COLORS.plate], [5, 9, KNIGHT_COLORS.plateLight], [6, 9, KNIGHT_COLORS.plate], [7, 9, KNIGHT_COLORS.plateLight], [8, 9, KNIGHT_COLORS.plate], [9, 9, KNIGHT_COLORS.armor], [10, 9, KNIGHT_COLORS.armorDark],
  [2, 10, KNIGHT_COLORS.armorDark], [3, 10, KNIGHT_COLORS.armor], [4, 10, KNIGHT_COLORS.plate], [5, 10, KNIGHT_COLORS.plateLight], [6, 10, KNIGHT_COLORS.armor], [7, 10, KNIGHT_COLORS.plate], [8, 10, KNIGHT_COLORS.plateLight], [9, 10, KNIGHT_COLORS.armor], [10, 10, KNIGHT_COLORS.armorDark],

  // ===== 腰甲 =====
  [3, 11, KNIGHT_COLORS.belt], [4, 11, KNIGHT_COLORS.plateLight], [5, 11, KNIGHT_COLORS.plate], [6, 11, KNIGHT_COLORS.plate], [7, 11, KNIGHT_COLORS.plateLight], [8, 11, KNIGHT_COLORS.belt], [9, 11, KNIGHT_COLORS.belt],
  [3, 12, KNIGHT_COLORS.armor], [4, 12, KNIGHT_COLORS.armorDark], [5, 12, KNIGHT_COLORS.armor], [6, 12, KNIGHT_COLORS.armorLight], [7, 12, KNIGHT_COLORS.armor], [8, 12, KNIGHT_COLORS.armorDark], [9, 12, KNIGHT_COLORS.armor],

  // ===== 腿甲 =====
  [4, 13, KNIGHT_COLORS.plate], [5, 13, KNIGHT_COLORS.plateLight], [6, 13, KNIGHT_COLORS.plate], [7, 13, KNIGHT_COLORS.plateLight], [8, 13, KNIGHT_COLORS.plate],
  [4, 14, KNIGHT_COLORS.armor], [5, 14, KNIGHT_COLORS.plate], [6, 14, KNIGHT_COLORS.plateLight], [7, 14, KNIGHT_COLORS.plate], [8, 14, KNIGHT_COLORS.armor],
  [4, 15, KNIGHT_COLORS.boot], [5, 15, KNIGHT_COLORS.bootDark], [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.boot],

  // ===== 剑（向前/左下指向）=====
  [0, 10, KNIGHT_COLORS.swordGlow],
  [0, 11, KNIGHT_COLORS.swordLight], [1, 11, KNIGHT_COLORS.sword],
  [0, 12, KNIGHT_COLORS.sword], [1, 12, KNIGHT_COLORS.swordDark],
  [1, 13, KNIGHT_COLORS.hilt],
  [1, 14, KNIGHT_COLORS.hiltDark],

  // ===== 盾（在身体后方/右侧）=====
  [9, 11, KNIGHT_COLORS.shield], [10, 11, KNIGHT_COLORS.shieldDark],
  [9, 12, KNIGHT_COLORS.shieldLight], [10, 12, KNIGHT_COLORS.shield],
  [9, 13, KNIGHT_COLORS.shield], [10, 13, KNIGHT_COLORS.shieldEmblem],

  // ===== 幽灵气 =====
  [5, 15, KNIGHT_COLORS.aura], [7, 15, KNIGHT_COLORS.aura],
]

// 向右面朝 - 侧面镜像
const KNIGHT_FACE_RIGHT = [
  // ===== 头盔 =====
  [5, 0, KNIGHT_COLORS.helmet], [6, 0, KNIGHT_COLORS.helmetLight], [7, 0, KNIGHT_COLORS.helmet],
  [4, 1, KNIGHT_COLORS.helmet], [5, 1, KNIGHT_COLORS.helmet], [6, 1, KNIGHT_COLORS.helmetLight], [7, 1, KNIGHT_COLORS.helmet], [8, 1, KNIGHT_COLORS.helmetLight],
  [4, 2, KNIGHT_COLORS.helmetDark], [5, 2, KNIGHT_COLORS.helmet], [6, 2, KNIGHT_COLORS.helmetLight], [7, 2, KNIGHT_COLORS.helmet], [8, 2, KNIGHT_COLORS.helmetDark],
  [4, 3, KNIGHT_COLORS.helmetDark], [5, 3, KNIGHT_COLORS.helmet], [6, 3, KNIGHT_COLORS.helmetLight], [7, 3, KNIGHT_COLORS.helmet], [8, 3, KNIGHT_COLORS.helmetDark],

  // ===== 侧面护目镜（一只）=====
  [4, 4, KNIGHT_COLORS.helmetDark], [5, 4, KNIGHT_COLORS.helmet], [6, 4, KNIGHT_COLORS.visor], [7, 4, KNIGHT_COLORS.visorGlow], [8, 4, KNIGHT_COLORS.helmetDark],
  [4, 5, KNIGHT_COLORS.helmetDark], [5, 5, KNIGHT_COLORS.helmet], [6, 5, KNIGHT_COLORS.visorGlow], [7, 5, KNIGHT_COLORS.visor], [8, 5, KNIGHT_COLORS.helmetDark],
  [5, 6, KNIGHT_COLORS.helmet], [6, 6, KNIGHT_COLORS.helmetDark], [7, 6, KNIGHT_COLORS.armorEdge],

  // ===== 肩甲 =====
  [3, 7, KNIGHT_COLORS.armorDark], [4, 7, KNIGHT_COLORS.plate], [5, 7, KNIGHT_COLORS.plateLight], [6, 7, KNIGHT_COLORS.plate], [7, 7, KNIGHT_COLORS.plateLight], [8, 7, KNIGHT_COLORS.plate], [9, 7, KNIGHT_COLORS.armorDark],
  [2, 8, KNIGHT_COLORS.armorDark], [3, 8, KNIGHT_COLORS.armor], [4, 8, KNIGHT_COLORS.plate], [5, 8, KNIGHT_COLORS.plateLight], [6, 8, KNIGHT_COLORS.plate], [7, 8, KNIGHT_COLORS.plateLight], [8, 8, KNIGHT_COLORS.plate], [9, 8, KNIGHT_COLORS.armor], [10, 8, KNIGHT_COLORS.armorDark],

  // ===== 胸甲侧面 =====
  [2, 9, KNIGHT_COLORS.armorDark], [3, 9, KNIGHT_COLORS.armor], [4, 9, KNIGHT_COLORS.plateLight], [5, 9, KNIGHT_COLORS.plate], [6, 9, KNIGHT_COLORS.plateLight], [7, 9, KNIGHT_COLORS.plate], [8, 9, KNIGHT_COLORS.plateLight], [9, 9, KNIGHT_COLORS.armor], [10, 9, KNIGHT_COLORS.armorDark],
  [2, 10, KNIGHT_COLORS.armorDark], [3, 10, KNIGHT_COLORS.armor], [4, 10, KNIGHT_COLORS.plateLight], [5, 10, KNIGHT_COLORS.plate], [6, 10, KNIGHT_COLORS.plateLight], [7, 10, KNIGHT_COLORS.plate], [8, 10, KNIGHT_COLORS.plateLight], [9, 10, KNIGHT_COLORS.armor], [10, 10, KNIGHT_COLORS.armorDark],

  // ===== 腰甲 =====
  [3, 11, KNIGHT_COLORS.belt], [4, 11, KNIGHT_COLORS.belt], [5, 11, KNIGHT_COLORS.plate], [6, 11, KNIGHT_COLORS.plateLight], [7, 11, KNIGHT_COLORS.plate], [8, 11, KNIGHT_COLORS.plateLight], [9, 11, KNIGHT_COLORS.belt],
  [3, 12, KNIGHT_COLORS.armor], [4, 12, KNIGHT_COLORS.armor], [5, 12, KNIGHT_COLORS.armorLight], [6, 12, KNIGHT_COLORS.armor], [7, 12, KNIGHT_COLORS.armorDark], [8, 12, KNIGHT_COLORS.armor], [9, 12, KNIGHT_COLORS.armorDark],

  // ===== 腿甲 =====
  [4, 13, KNIGHT_COLORS.plate], [5, 13, KNIGHT_COLORS.plateLight], [6, 13, KNIGHT_COLORS.plate], [7, 13, KNIGHT_COLORS.plateLight], [8, 13, KNIGHT_COLORS.plate],
  [4, 14, KNIGHT_COLORS.armor], [5, 14, KNIGHT_COLORS.plate], [6, 14, KNIGHT_COLORS.plateLight], [7, 14, KNIGHT_COLORS.plate], [8, 14, KNIGHT_COLORS.armor],
  [4, 15, KNIGHT_COLORS.boot], [5, 15, KNIGHT_COLORS.bootDark], [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.boot],

  // ===== 剑（向右/右下指向）=====
  [13, 10, KNIGHT_COLORS.swordGlow],
  [12, 11, KNIGHT_COLORS.sword], [13, 11, KNIGHT_COLORS.swordLight],
  [12, 12, KNIGHT_COLORS.swordDark], [13, 12, KNIGHT_COLORS.sword],
  [12, 13, KNIGHT_COLORS.hilt],
  [12, 14, KNIGHT_COLORS.hiltDark],

  // ===== 盾（在身体左前方）=====
  [2, 11, KNIGHT_COLORS.shieldDark], [3, 11, KNIGHT_COLORS.shield],
  [2, 12, KNIGHT_COLORS.shield], [3, 12, KNIGHT_COLORS.shieldLight],
  [2, 13, KNIGHT_COLORS.shieldEmblem], [3, 13, KNIGHT_COLORS.shield],

  // ===== 幽灵气 =====
  [5, 15, KNIGHT_COLORS.aura], [7, 15, KNIGHT_COLORS.aura],
]

// 待机动画帧
const KNIGHT_IDLE_FRAMES = [
  // 帧0 - 护目镜暗
  [
    { pixels: [
      [5, 4, KNIGHT_COLORS.visor], [8, 4, KNIGHT_COLORS.visor],
      [5, 5, KNIGHT_COLORS.visorGlow], [8, 5, KNIGHT_COLORS.visorGlow],
      [5, 15, KNIGHT_COLORS.aura], [8, 15, KNIGHT_COLORS.aura],
    ] }
  ],
  // 帧1 - 护目镜亮 + 灵气强
  [
    { pixels: [
      [5, 4, KNIGHT_COLORS.visorGlow], [8, 4, KNIGHT_COLORS.visorGlow],
      [5, 5, KNIGHT_COLORS.spark], [8, 5, KNIGHT_COLORS.spark],
      [5, 15, KNIGHT_COLORS.auraLight], [8, 15, KNIGHT_COLORS.auraLight],
      [6, 15, KNIGHT_COLORS.spark], [7, 15, KNIGHT_COLORS.spark],
    ] }
  ],
]

// 行走动画帧
const KNIGHT_WALK_FRAMES = [
  // 帧0 - 左脚前
  [
    { pixels: [
      [4, 15, KNIGHT_COLORS.bootDark], [5, 15, KNIGHT_COLORS.boot], [6, 15, KNIGHT_COLORS.bootDark], [7, 15, KNIGHT_COLORS.boot], [8, 15, KNIGHT_COLORS.bootDark], [9, 15, KNIGHT_COLORS.boot],
    ] }
  ],
  // 帧1 - 中间
  [
    { pixels: [
      [4, 15, KNIGHT_COLORS.boot], [5, 15, KNIGHT_COLORS.bootDark], [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.boot], [8, 15, KNIGHT_COLORS.bootDark], [9, 15, KNIGHT_COLORS.boot],
    ] }
  ],
  // 帧2 - 右脚前
  [
    { pixels: [
      [4, 15, KNIGHT_COLORS.boot], [5, 15, KNIGHT_COLORS.bootDark], [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.boot], [9, 15, KNIGHT_COLORS.bootDark],
    ] }
  ],
]

export const drawPhantomKnight = (canvasRef, currentUnit) => {
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

export const drawPhantomKnightAvatar = (canvasRef, currentUnit, avatarPos) => {
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
