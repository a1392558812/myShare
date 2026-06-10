import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.003,
  WALK_SPEED: 0.08,
}

// 巫妖王颜色（冰蓝/暗蓝 + 符文发光）
const LICH_COLORS = {
  // 头盔/皇冠
  crown: '#1A2A4A',         // 皇冠主色 - 暗蓝
  crownDark: '#0A1525',     // 皇冠暗
  crownLight: '#2A4A7A',    // 皇冠亮
  crownGem: '#00FFFF',      // 皇冠宝石 - 冰蓝
  crownGemGlow: '#80FFFF',  // 宝石发光
  horn: '#3A4A6A',          // 角
  hornDark: '#1A2A4A',      // 角暗
  // 面部/骷髅
  skull: '#B8C8D8',         // 骷髅主色
  skullDark: '#8A9AAC',     // 骷髅暗
  skullLight: '#D8E4F0',    // 骷髅亮
  jaw: '#A8B8C8',           // 下颚
  // 眼睛 - 冰蓝发光
  eye: '#00CCFF',           // 眼睛主色
  eyeGlow: '#80E0FF',       // 眼睛发光
  eyeInner: '#FFFFFF',      // 眼睛内核
  // 盔甲
  armor: '#2A3A5A',         // 盔甲主色
  armorDark: '#1A2540',     // 盔甲暗
  armorLight: '#4A5A7A',    // 盔甲亮
  plate: '#5A6A8A',         // 金属板
  plateLight: '#7A8EAF',    // 金属亮
  plateDark: '#3A4866',     // 金属暗
  // 符文
  rune: '#00FFFF',          // 符文 - 冰蓝
  runeGlow: '#80FFFF',      // 符文发光
  runeDark: '#0088AA',      // 符文暗
  // 披风
  cape: '#0A1525',          // 披风主色 - 极暗蓝
  capeDark: '#050A15',      // 披风暗
  capeLight: '#1A2A4A',     // 披风亮
  capeEdge: '#2A4A7A',      // 披风边缘
  // 剑 - 霜之哀伤风格
  sword: '#A0D0F0',         // 剑刃 - 冰蓝
  swordLight: '#D0E8FF',    // 剑刃亮
  swordGlow: '#80C8FF',     // 剑发光
  swordDark: '#6A8FB5',     // 剑暗
  swordRune: '#00FFFF',     // 剑上符文
  hilt: '#3A4A6A',          // 剑柄
  hiltDark: '#1A2A4A',      // 剑柄暗
  hiltGem: '#00FFFF',       // 剑柄宝石
  // 手/骨
  hand: '#A8B8C8',          // 手 - 骨色
  handDark: '#7A8AA8',      // 手暗
  // 其他
  belt: '#2A3A5A',          // 腰带
  boot: '#1A2540',          // 靴
  bootDark: '#0A1525',      // 靴暗
  bootLight: '#3A4A6A',     // 靴亮
  // 冰霜/灵气
  frost: '#80E0FF',         // 冰霜
  frostLight: '#C0F0FF',    // 冰霜亮
  frostDark: '#40A0D0',     // 冰霜暗
  spark: '#FFFFFF',         // 粒子
  // 盾
  shield: '#3A4A6A',        // 盾
  shieldDark: '#1A2A4A',    // 盾暗
  shieldLight: '#5A6A8A',   // 盾亮
  shieldRune: '#00FFFF',    // 盾符文
  highlight: '#FFFFFF',      // 高光
}

// 巫妖王高精度头像（16x16网格，聚焦头部特写）
const LICH_AVATAR = [
  // ===== 皇冠顶部 + 角 =====
  [3, 0, LICH_COLORS.hornDark], [4, 0, LICH_COLORS.horn], [5, 0, LICH_COLORS.crown], [6, 0, LICH_COLORS.crownGem], [7, 0, LICH_COLORS.crownGem], [8, 0, LICH_COLORS.crownGem], [9, 0, LICH_COLORS.crown], [10, 0, LICH_COLORS.horn], [11, 0, LICH_COLORS.hornDark],
  [3, 1, LICH_COLORS.horn], [4, 1, LICH_COLORS.crownDark], [5, 1, LICH_COLORS.crown], [6, 1, LICH_COLORS.crownGemGlow], [7, 1, LICH_COLORS.crownGemGlow], [8, 1, LICH_COLORS.crownGemGlow], [9, 1, LICH_COLORS.crown], [10, 1, LICH_COLORS.crownDark], [11, 1, LICH_COLORS.horn],
  [3, 2, LICH_COLORS.hornDark], [4, 2, LICH_COLORS.crown], [5, 2, LICH_COLORS.crownLight], [6, 2, LICH_COLORS.crownGem], [7, 2, LICH_COLORS.crownGem], [8, 2, LICH_COLORS.crownGem], [9, 2, LICH_COLORS.crownLight], [10, 2, LICH_COLORS.crown], [11, 2, LICH_COLORS.hornDark],

  // ===== 头盔/骷髅头部 =====
  [2, 3, LICH_COLORS.armorDark], [3, 3, LICH_COLORS.armor], [4, 3, LICH_COLORS.skullLight], [5, 3, LICH_COLORS.skull], [6, 3, LICH_COLORS.skull], [7, 3, LICH_COLORS.skull], [8, 3, LICH_COLORS.skull], [9, 3, LICH_COLORS.skullLight], [10, 3, LICH_COLORS.armor], [11, 3, LICH_COLORS.armorDark],
  [2, 4, LICH_COLORS.armorDark], [3, 4, LICH_COLORS.armor], [4, 4, LICH_COLORS.skullLight], [5, 4, LICH_COLORS.eye], [6, 4, LICH_COLORS.eyeGlow], [7, 4, LICH_COLORS.eyeGlow], [8, 4, LICH_COLORS.eyeGlow], [9, 4, LICH_COLORS.eye], [10, 4, LICH_COLORS.skullLight], [11, 4, LICH_COLORS.armor], [12, 4, LICH_COLORS.armorDark],
  [2, 5, LICH_COLORS.armorDark], [3, 5, LICH_COLORS.skull], [4, 5, LICH_COLORS.eyeGlow], [5, 5, LICH_COLORS.eyeInner], [6, 5, LICH_COLORS.eyeInner], [7, 5, LICH_COLORS.eyeInner], [8, 5, LICH_COLORS.eyeInner], [9, 5, LICH_COLORS.eyeGlow], [10, 5, LICH_COLORS.skull], [11, 5, LICH_COLORS.armorDark],
  // 眼睛高光
  [5, 4, LICH_COLORS.highlight], [6, 4, LICH_COLORS.highlight], [8, 4, LICH_COLORS.highlight], [9, 4, LICH_COLORS.highlight],
  [5, 5, LICH_COLORS.highlight], [9, 5, LICH_COLORS.highlight],

  // ===== 鼻梁和面部 =====
  [3, 6, LICH_COLORS.armorDark], [4, 6, LICH_COLORS.skull], [5, 6, LICH_COLORS.skull], [6, 6, LICH_COLORS.skullDark], [7, 6, LICH_COLORS.skullDark], [8, 6, LICH_COLORS.skull], [9, 6, LICH_COLORS.skull], [10, 6, LICH_COLORS.armorDark],
  [4, 7, LICH_COLORS.skullDark], [5, 7, LICH_COLORS.skull], [6, 7, LICH_COLORS.skullDark], [7, 7, LICH_COLORS.skullDark], [8, 7, LICH_COLORS.skull], [9, 7, LICH_COLORS.skullDark],
  [4, 8, LICH_COLORS.skullDark], [5, 8, LICH_COLORS.skull], [6, 8, LICH_COLORS.skullDark], [7, 8, LICH_COLORS.skullDark], [8, 8, LICH_COLORS.skull], [9, 8, LICH_COLORS.skullDark],

  // ===== 下颚和牙齿 =====
  [5, 9, LICH_COLORS.jaw], [6, 9, LICH_COLORS.skullDark], [7, 9, LICH_COLORS.skullDark], [8, 9, LICH_COLORS.jaw],
  [4, 10, LICH_COLORS.skullDark], [5, 10, LICH_COLORS.skull], [6, 10, LICH_COLORS.skull], [7, 10, LICH_COLORS.skull], [8, 10, LICH_COLORS.skull], [9, 10, LICH_COLORS.skullDark],
  [5, 11, LICH_COLORS.skull], [6, 11, LICH_COLORS.skullDark], [7, 11, LICH_COLORS.skullDark], [8, 11, LICH_COLORS.skull],

  // ===== 肩甲 =====
  [2, 10, LICH_COLORS.armorDark], [3, 10, LICH_COLORS.armor], [4, 10, LICH_COLORS.plate], [5, 10, LICH_COLORS.plateLight], [6, 10, LICH_COLORS.rune], [7, 10, LICH_COLORS.rune], [8, 10, LICH_COLORS.plateLight], [9, 10, LICH_COLORS.plate], [10, 10, LICH_COLORS.armor], [11, 10, LICH_COLORS.armorDark],
  [2, 11, LICH_COLORS.armorDark], [3, 11, LICH_COLORS.armor], [4, 11, LICH_COLORS.plateLight], [5, 11, LICH_COLORS.plate], [6, 11, LICH_COLORS.runeGlow], [7, 11, LICH_COLORS.runeGlow], [8, 11, LICH_COLORS.plate], [9, 11, LICH_COLORS.plateLight], [10, 11, LICH_COLORS.armor], [11, 11, LICH_COLORS.armorDark],

  // ===== 符文装饰 =====
  [5, 10, LICH_COLORS.spark], [6, 10, LICH_COLORS.spark], [9, 10, LICH_COLORS.spark], [10, 10, LICH_COLORS.spark],
  [5, 11, LICH_COLORS.frostLight], [10, 11, LICH_COLORS.frostLight],

  // ===== 胸甲领口 =====
  [3, 12, LICH_COLORS.armorDark], [4, 12, LICH_COLORS.armor], [5, 12, LICH_COLORS.plate], [6, 12, LICH_COLORS.plateLight], [7, 12, LICH_COLORS.plateLight], [8, 12, LICH_COLORS.plate], [9, 12, LICH_COLORS.armor], [10, 12, LICH_COLORS.armorDark],
  [4, 13, LICH_COLORS.armor], [5, 13, LICH_COLORS.plateLight], [6, 13, LICH_COLORS.plate], [7, 13, LICH_COLORS.plate], [8, 13, LICH_COLORS.plateLight], [9, 13, LICH_COLORS.plate], [10, 13, LICH_COLORS.armor],

  // ===== 头盔底部边缘 =====
  [4, 14, LICH_COLORS.armorDark], [5, 14, LICH_COLORS.armor], [6, 14, LICH_COLORS.armorLight], [7, 14, LICH_COLORS.armorLight], [8, 14, LICH_COLORS.armor], [9, 14, LICH_COLORS.armorDark],
]

// 向下面朝 - 正面
const LICH_FACE_DOWN = [
  // ===== 皇冠顶部 + 角 =====
  [4, 0, LICH_COLORS.hornDark], [5, 0, LICH_COLORS.crown], [6, 0, LICH_COLORS.crownGem], [7, 0, LICH_COLORS.crownGem], [8, 0, LICH_COLORS.crown], [9, 0, LICH_COLORS.hornDark],
  [3, 1, LICH_COLORS.horn], [4, 1, LICH_COLORS.crownDark], [5, 1, LICH_COLORS.crown], [6, 1, LICH_COLORS.crownGemGlow], [7, 1, LICH_COLORS.crownGemGlow], [8, 1, LICH_COLORS.crown], [9, 1, LICH_COLORS.crownDark], [10, 1, LICH_COLORS.horn],
  [3, 2, LICH_COLORS.hornDark], [4, 2, LICH_COLORS.crown], [5, 2, LICH_COLORS.crownLight], [6, 2, LICH_COLORS.crownGem], [7, 2, LICH_COLORS.crownGem], [8, 2, LICH_COLORS.crownLight], [9, 2, LICH_COLORS.crown], [10, 2, LICH_COLORS.hornDark],

  // ===== 头盔/骷髅头部 =====
  [3, 3, LICH_COLORS.armorDark], [4, 3, LICH_COLORS.armor], [5, 3, LICH_COLORS.skullLight], [6, 3, LICH_COLORS.skull], [7, 3, LICH_COLORS.skull], [8, 3, LICH_COLORS.skullLight], [9, 3, LICH_COLORS.armor], [10, 3, LICH_COLORS.armorDark],
  [3, 4, LICH_COLORS.armorDark], [4, 4, LICH_COLORS.armor], [5, 4, LICH_COLORS.eye], [6, 4, LICH_COLORS.eyeGlow], [7, 4, LICH_COLORS.eyeGlow], [8, 4, LICH_COLORS.eye], [9, 4, LICH_COLORS.armor], [10, 4, LICH_COLORS.armorDark],
  [3, 5, LICH_COLORS.armorDark], [4, 5, LICH_COLORS.skull], [5, 5, LICH_COLORS.eyeGlow], [6, 5, LICH_COLORS.eyeInner], [7, 5, LICH_COLORS.eyeInner], [8, 5, LICH_COLORS.eyeGlow], [9, 5, LICH_COLORS.skull], [10, 5, LICH_COLORS.armorDark],
  [4, 6, LICH_COLORS.skullDark], [5, 6, LICH_COLORS.skull], [6, 6, LICH_COLORS.skullDark], [7, 6, LICH_COLORS.skullDark], [8, 6, LICH_COLORS.skull], [9, 6, LICH_COLORS.skullDark],
  [5, 7, LICH_COLORS.jaw], [6, 7, LICH_COLORS.skullDark], [7, 7, LICH_COLORS.skullDark], [8, 7, LICH_COLORS.jaw],

  // ===== 颈部 + 肩甲 =====
  [3, 8, LICH_COLORS.armorDark], [4, 8, LICH_COLORS.plate], [5, 8, LICH_COLORS.plateLight], [6, 8, LICH_COLORS.rune], [7, 8, LICH_COLORS.rune], [8, 8, LICH_COLORS.plateLight], [9, 8, LICH_COLORS.plate], [10, 8, LICH_COLORS.armorDark],
  [2, 9, LICH_COLORS.armorDark], [3, 9, LICH_COLORS.armor], [4, 9, LICH_COLORS.plate], [5, 9, LICH_COLORS.plateLight], [6, 9, LICH_COLORS.plate], [7, 9, LICH_COLORS.plate], [8, 9, LICH_COLORS.plateLight], [9, 9, LICH_COLORS.plate], [10, 9, LICH_COLORS.armor], [11, 9, LICH_COLORS.armorDark],

  // ===== 胸甲 =====
  [2, 10, LICH_COLORS.armorDark], [3, 10, LICH_COLORS.armor], [4, 10, LICH_COLORS.plate], [5, 10, LICH_COLORS.runeGlow], [6, 10, LICH_COLORS.plateLight], [7, 10, LICH_COLORS.plateLight], [8, 10, LICH_COLORS.runeGlow], [9, 10, LICH_COLORS.plate], [10, 10, LICH_COLORS.armor], [11, 10, LICH_COLORS.armorDark],
  [2, 11, LICH_COLORS.armorDark], [3, 11, LICH_COLORS.armor], [4, 11, LICH_COLORS.plateLight], [5, 11, LICH_COLORS.plate], [6, 11, LICH_COLORS.rune], [7, 11, LICH_COLORS.rune], [8, 11, LICH_COLORS.plate], [9, 11, LICH_COLORS.plateLight], [10, 11, LICH_COLORS.armor], [11, 11, LICH_COLORS.armorDark],

  // ===== 腰甲 =====
  [3, 12, LICH_COLORS.belt], [4, 12, LICH_COLORS.plate], [5, 12, LICH_COLORS.plateLight], [6, 12, LICH_COLORS.runeGlow], [7, 12, LICH_COLORS.runeGlow], [8, 12, LICH_COLORS.plateLight], [9, 12, LICH_COLORS.plate], [10, 12, LICH_COLORS.belt],
  [3, 13, LICH_COLORS.armor], [4, 13, LICH_COLORS.armorDark], [5, 13, LICH_COLORS.armor], [6, 13, LICH_COLORS.armorLight], [7, 13, LICH_COLORS.armorLight], [8, 13, LICH_COLORS.armor], [9, 13, LICH_COLORS.armorDark], [10, 13, LICH_COLORS.armor],

  // ===== 腿甲 =====
  [4, 14, LICH_COLORS.plate], [5, 14, LICH_COLORS.plateLight], [6, 14, LICH_COLORS.rune], [7, 14, LICH_COLORS.rune], [8, 14, LICH_COLORS.plateLight], [9, 14, LICH_COLORS.plate],
  [4, 15, LICH_COLORS.boot], [5, 15, LICH_COLORS.bootLight], [6, 15, LICH_COLORS.boot], [7, 15, LICH_COLORS.boot], [8, 15, LICH_COLORS.bootLight], [9, 15, LICH_COLORS.boot],

  // ===== 左手（持剑）=====
  [1, 10, LICH_COLORS.armorDark], [2, 10, LICH_COLORS.armor],
  [1, 11, LICH_COLORS.hand], [2, 11, LICH_COLORS.armor],
  [0, 12, LICH_COLORS.hilt], [1, 12, LICH_COLORS.hiltGem],
  [0, 13, LICH_COLORS.hiltDark], [1, 13, LICH_COLORS.hilt],

  // ===== 剑刃（霜之哀伤风格，带符文）=====
  [0, 6, LICH_COLORS.swordGlow], [1, 6, LICH_COLORS.swordRune],
  [0, 7, LICH_COLORS.swordLight], [1, 7, LICH_COLORS.swordGlow],
  [0, 8, LICH_COLORS.sword], [1, 8, LICH_COLORS.swordRune],
  [0, 9, LICH_COLORS.swordDark], [1, 9, LICH_COLORS.swordLight],

  // ===== 右手（持盾）=====
  [11, 10, LICH_COLORS.armor], [12, 10, LICH_COLORS.armorDark],
  [11, 11, LICH_COLORS.armor], [12, 11, LICH_COLORS.hand],
  [12, 12, LICH_COLORS.shield], [13, 12, LICH_COLORS.shieldDark],
  [12, 13, LICH_COLORS.shieldLight], [13, 13, LICH_COLORS.shieldRune],
  [12, 14, LICH_COLORS.shield], [13, 14, LICH_COLORS.shieldDark],

  // ===== 冰霜灵气（底部）=====
  [5, 15, LICH_COLORS.frost], [8, 15, LICH_COLORS.frost],
]

// 向上面朝 - 背面
const LICH_FACE_UP = [
  // ===== 皇冠顶部 + 角 =====
  [4, 0, LICH_COLORS.hornDark], [5, 0, LICH_COLORS.crown], [6, 0, LICH_COLORS.crownGem], [7, 0, LICH_COLORS.crownGem], [8, 0, LICH_COLORS.crown], [9, 0, LICH_COLORS.hornDark],
  [3, 1, LICH_COLORS.horn], [4, 1, LICH_COLORS.crownDark], [5, 1, LICH_COLORS.crown], [6, 1, LICH_COLORS.crownGemGlow], [7, 1, LICH_COLORS.crownGemGlow], [8, 1, LICH_COLORS.crown], [9, 1, LICH_COLORS.crownDark], [10, 1, LICH_COLORS.horn],
  [3, 2, LICH_COLORS.hornDark], [4, 2, LICH_COLORS.crown], [5, 2, LICH_COLORS.crownLight], [6, 2, LICH_COLORS.crownGem], [7, 2, LICH_COLORS.crownGem], [8, 2, LICH_COLORS.crownLight], [9, 2, LICH_COLORS.crown], [10, 2, LICH_COLORS.hornDark],

  // ===== 头盔背面 =====
  [3, 3, LICH_COLORS.armorDark], [4, 3, LICH_COLORS.armor], [5, 3, LICH_COLORS.armorLight], [6, 3, LICH_COLORS.armor], [7, 3, LICH_COLORS.armor], [8, 3, LICH_COLORS.armorLight], [9, 3, LICH_COLORS.armor], [10, 3, LICH_COLORS.armorDark],
  [3, 4, LICH_COLORS.armorDark], [4, 4, LICH_COLORS.armor], [5, 4, LICH_COLORS.armorLight], [6, 4, LICH_COLORS.rune], [7, 4, LICH_COLORS.rune], [8, 4, LICH_COLORS.armorLight], [9, 4, LICH_COLORS.armor], [10, 4, LICH_COLORS.armorDark],
  [3, 5, LICH_COLORS.armorDark], [4, 5, LICH_COLORS.armor], [5, 5, LICH_COLORS.armor], [6, 5, LICH_COLORS.armorLight], [7, 5, LICH_COLORS.armorLight], [8, 5, LICH_COLORS.armor], [9, 5, LICH_COLORS.armor], [10, 5, LICH_COLORS.armorDark],
  [4, 6, LICH_COLORS.armorDark], [5, 6, LICH_COLORS.armor], [6, 6, LICH_COLORS.armor], [7, 6, LICH_COLORS.armor], [8, 6, LICH_COLORS.armor], [9, 6, LICH_COLORS.armorDark],

  // ===== 颈部 + 披风 =====
  [2, 7, LICH_COLORS.capeDark], [3, 7, LICH_COLORS.cape], [4, 7, LICH_COLORS.capeLight], [5, 7, LICH_COLORS.capeEdge], [6, 7, LICH_COLORS.cape], [7, 7, LICH_COLORS.cape], [8, 7, LICH_COLORS.capeEdge], [9, 7, LICH_COLORS.capeLight], [10, 7, LICH_COLORS.cape], [11, 7, LICH_COLORS.capeDark],
  [1, 8, LICH_COLORS.capeDark], [2, 8, LICH_COLORS.cape], [3, 8, LICH_COLORS.capeLight], [4, 8, LICH_COLORS.cape], [5, 8, LICH_COLORS.capeEdge], [6, 8, LICH_COLORS.cape], [7, 8, LICH_COLORS.cape], [8, 8, LICH_COLORS.capeEdge], [9, 8, LICH_COLORS.cape], [10, 8, LICH_COLORS.capeLight], [11, 8, LICH_COLORS.cape], [12, 8, LICH_COLORS.capeDark],

  // ===== 披风主体 =====
  [1, 9, LICH_COLORS.capeDark], [2, 9, LICH_COLORS.cape], [3, 9, LICH_COLORS.capeLight], [4, 9, LICH_COLORS.cape], [5, 9, LICH_COLORS.cape], [6, 9, LICH_COLORS.rune], [7, 9, LICH_COLORS.rune], [8, 9, LICH_COLORS.cape], [9, 9, LICH_COLORS.cape], [10, 9, LICH_COLORS.capeLight], [11, 9, LICH_COLORS.cape], [12, 9, LICH_COLORS.capeDark],
  [1, 10, LICH_COLORS.capeDark], [2, 10, LICH_COLORS.cape], [3, 10, LICH_COLORS.cape], [4, 10, LICH_COLORS.capeLight], [5, 10, LICH_COLORS.cape], [6, 10, LICH_COLORS.runeGlow], [7, 10, LICH_COLORS.runeGlow], [8, 10, LICH_COLORS.cape], [9, 10, LICH_COLORS.capeLight], [10, 10, LICH_COLORS.cape], [11, 10, LICH_COLORS.cape], [12, 10, LICH_COLORS.capeDark],
  [2, 11, LICH_COLORS.capeDark], [3, 11, LICH_COLORS.cape], [4, 11, LICH_COLORS.capeLight], [5, 11, LICH_COLORS.cape], [6, 11, LICH_COLORS.cape], [7, 11, LICH_COLORS.cape], [8, 11, LICH_COLORS.cape], [9, 11, LICH_COLORS.capeLight], [10, 11, LICH_COLORS.cape], [11, 11, LICH_COLORS.capeDark],
  [3, 12, LICH_COLORS.capeDark], [4, 12, LICH_COLORS.cape], [5, 12, LICH_COLORS.capeLight], [6, 12, LICH_COLORS.cape], [7, 12, LICH_COLORS.cape], [8, 12, LICH_COLORS.capeLight], [9, 12, LICH_COLORS.cape], [10, 12, LICH_COLORS.cape], [11, 12, LICH_COLORS.capeDark],

  // ===== 腿甲背面 =====
  [4, 13, LICH_COLORS.armorDark], [5, 13, LICH_COLORS.plate], [6, 13, LICH_COLORS.plateLight], [7, 13, LICH_COLORS.plateLight], [8, 13, LICH_COLORS.plate], [9, 13, LICH_COLORS.armorDark],
  [4, 14, LICH_COLORS.armor], [5, 14, LICH_COLORS.armorDark], [6, 14, LICH_COLORS.armor], [7, 14, LICH_COLORS.armor], [8, 14, LICH_COLORS.armorDark], [9, 14, LICH_COLORS.armor],
  [4, 15, LICH_COLORS.bootDark], [5, 15, LICH_COLORS.boot], [6, 15, LICH_COLORS.bootLight], [7, 15, LICH_COLORS.bootLight], [8, 15, LICH_COLORS.boot], [9, 15, LICH_COLORS.bootDark],

  // ===== 剑（背面侧放）=====
  [13, 6, LICH_COLORS.swordGlow],
  [13, 7, LICH_COLORS.swordRune],
  [13, 8, LICH_COLORS.swordLight],
  [13, 9, LICH_COLORS.sword],
  [13, 10, LICH_COLORS.hilt],
  [13, 11, LICH_COLORS.hiltGem],
  [13, 12, LICH_COLORS.hiltDark],

  // ===== 冰霜灵气 =====
  [5, 15, LICH_COLORS.frost], [8, 15, LICH_COLORS.frost],
  [6, 15, LICH_COLORS.frostLight], [7, 15, LICH_COLORS.frostLight],
]

// 向左面朝 - 侧面
const LICH_FACE_LEFT = [
  // ===== 皇冠 + 角 =====
  [5, 0, LICH_COLORS.crown], [6, 0, LICH_COLORS.crownGem], [7, 0, LICH_COLORS.hornDark],
  [4, 1, LICH_COLORS.crownDark], [5, 1, LICH_COLORS.crown], [6, 1, LICH_COLORS.crownGemGlow], [7, 1, LICH_COLORS.horn],
  [4, 2, LICH_COLORS.crown], [5, 2, LICH_COLORS.crownLight], [6, 2, LICH_COLORS.crownGem], [7, 2, LICH_COLORS.hornDark],
  [4, 3, LICH_COLORS.armorDark], [5, 3, LICH_COLORS.armor], [6, 3, LICH_COLORS.armorLight], [7, 3, LICH_COLORS.armorDark],

  // ===== 头盔/骷髅侧面 =====
  [4, 4, LICH_COLORS.armorDark], [5, 4, LICH_COLORS.skull], [6, 4, LICH_COLORS.eye], [7, 4, LICH_COLORS.armor],
  [4, 5, LICH_COLORS.armorDark], [5, 5, LICH_COLORS.skullLight], [6, 5, LICH_COLORS.eyeGlow], [7, 5, LICH_COLORS.armor],
  [4, 6, LICH_COLORS.armorDark], [5, 6, LICH_COLORS.skull], [6, 6, LICH_COLORS.eyeInner], [7, 6, LICH_COLORS.armorDark],
  [5, 7, LICH_COLORS.jaw], [6, 7, LICH_COLORS.skullDark],

  // ===== 肩甲 =====
  [3, 8, LICH_COLORS.armorDark], [4, 8, LICH_COLORS.plate], [5, 8, LICH_COLORS.plateLight], [6, 8, LICH_COLORS.rune], [7, 8, LICH_COLORS.plate], [8, 8, LICH_COLORS.armorDark],
  [2, 9, LICH_COLORS.armorDark], [3, 9, LICH_COLORS.armor], [4, 9, LICH_COLORS.plate], [5, 9, LICH_COLORS.plateLight], [6, 9, LICH_COLORS.plate], [7, 9, LICH_COLORS.plateLight], [8, 9, LICH_COLORS.plate], [9, 9, LICH_COLORS.armorDark],

  // ===== 胸甲侧面 =====
  [2, 10, LICH_COLORS.armorDark], [3, 10, LICH_COLORS.armor], [4, 10, LICH_COLORS.plate], [5, 10, LICH_COLORS.runeGlow], [6, 10, LICH_COLORS.plate], [7, 10, LICH_COLORS.plateLight], [8, 10, LICH_COLORS.plate], [9, 10, LICH_COLORS.armorDark],
  [2, 11, LICH_COLORS.armorDark], [3, 11, LICH_COLORS.armor], [4, 11, LICH_COLORS.plateLight], [5, 11, LICH_COLORS.plate], [6, 11, LICH_COLORS.rune], [7, 11, LICH_COLORS.plate], [8, 11, LICH_COLORS.plateLight], [9, 11, LICH_COLORS.armor], [10, 11, LICH_COLORS.armorDark],

  // ===== 腰甲 =====
  [3, 12, LICH_COLORS.belt], [4, 12, LICH_COLORS.plate], [5, 12, LICH_COLORS.plateLight], [6, 12, LICH_COLORS.runeGlow], [7, 12, LICH_COLORS.plate], [8, 12, LICH_COLORS.belt], [9, 12, LICH_COLORS.belt],
  [3, 13, LICH_COLORS.armor], [4, 13, LICH_COLORS.armorDark], [5, 13, LICH_COLORS.armor], [6, 13, LICH_COLORS.armorLight], [7, 13, LICH_COLORS.armor], [8, 13, LICH_COLORS.armorDark], [9, 13, LICH_COLORS.armor],

  // ===== 腿甲 =====
  [4, 14, LICH_COLORS.plate], [5, 14, LICH_COLORS.plateLight], [6, 14, LICH_COLORS.rune], [7, 14, LICH_COLORS.plateLight], [8, 14, LICH_COLORS.plate],
  [4, 15, LICH_COLORS.boot], [5, 15, LICH_COLORS.bootLight], [6, 15, LICH_COLORS.boot], [7, 15, LICH_COLORS.bootLight], [8, 15, LICH_COLORS.boot],

  // ===== 剑（向前/左下指向）=====
  [0, 11, LICH_COLORS.swordGlow],
  [0, 12, LICH_COLORS.swordRune], [1, 12, LICH_COLORS.swordLight],
  [0, 13, LICH_COLORS.sword], [1, 13, LICH_COLORS.swordGlow],
  [1, 14, LICH_COLORS.hilt],
  [1, 15, LICH_COLORS.hiltGem],

  // ===== 盾（在身体后方/右侧）=====
  [9, 12, LICH_COLORS.shield], [10, 12, LICH_COLORS.shieldDark],
  [9, 13, LICH_COLORS.shieldLight], [10, 13, LICH_COLORS.shieldRune],
  [9, 14, LICH_COLORS.shield], [10, 14, LICH_COLORS.shieldDark],

  // ===== 冰霜灵气 =====
  [5, 15, LICH_COLORS.frost], [7, 15, LICH_COLORS.frost],
]

// 向右面朝 - 侧面镜像
const LICH_FACE_RIGHT = [
  // ===== 皇冠 + 角 =====
  [5, 0, LICH_COLORS.hornDark], [6, 0, LICH_COLORS.crownGem], [7, 0, LICH_COLORS.crown],
  [4, 1, LICH_COLORS.horn], [5, 1, LICH_COLORS.crownGemGlow], [6, 1, LICH_COLORS.crown], [7, 1, LICH_COLORS.crownDark],
  [4, 2, LICH_COLORS.hornDark], [5, 2, LICH_COLORS.crownGem], [6, 2, LICH_COLORS.crownLight], [7, 2, LICH_COLORS.crown],
  [4, 3, LICH_COLORS.armorDark], [5, 3, LICH_COLORS.armorLight], [6, 3, LICH_COLORS.armor], [7, 3, LICH_COLORS.armorDark],

  // ===== 头盔/骷髅侧面 =====
  [4, 4, LICH_COLORS.armor], [5, 4, LICH_COLORS.eye], [6, 4, LICH_COLORS.skull], [7, 4, LICH_COLORS.armorDark],
  [4, 5, LICH_COLORS.armor], [5, 5, LICH_COLORS.eyeGlow], [6, 5, LICH_COLORS.skullLight], [7, 5, LICH_COLORS.armorDark],
  [4, 6, LICH_COLORS.armorDark], [5, 6, LICH_COLORS.eyeInner], [6, 6, LICH_COLORS.skull], [7, 6, LICH_COLORS.armorDark],
  [5, 7, LICH_COLORS.skullDark], [6, 7, LICH_COLORS.jaw],

  // ===== 肩甲 =====
  [4, 8, LICH_COLORS.armorDark], [5, 8, LICH_COLORS.plate], [6, 8, LICH_COLORS.rune], [7, 8, LICH_COLORS.plateLight], [8, 8, LICH_COLORS.plate], [9, 8, LICH_COLORS.armorDark],
  [2, 9, LICH_COLORS.armorDark], [3, 9, LICH_COLORS.plate], [4, 9, LICH_COLORS.plateLight], [5, 9, LICH_COLORS.plate], [6, 9, LICH_COLORS.plateLight], [7, 9, LICH_COLORS.plate], [8, 9, LICH_COLORS.armor], [9, 9, LICH_COLORS.armorDark],

  // ===== 胸甲侧面 =====
  [2, 10, LICH_COLORS.armorDark], [3, 10, LICH_COLORS.plate], [4, 10, LICH_COLORS.plateLight], [5, 10, LICH_COLORS.plate], [6, 10, LICH_COLORS.runeGlow], [7, 10, LICH_COLORS.plate], [8, 10, LICH_COLORS.plateLight], [9, 10, LICH_COLORS.armor], [10, 10, LICH_COLORS.armorDark],
  [2, 11, LICH_COLORS.armorDark], [3, 11, LICH_COLORS.plateLight], [4, 11, LICH_COLORS.plate], [5, 11, LICH_COLORS.rune], [6, 11, LICH_COLORS.plate], [7, 11, LICH_COLORS.plateLight], [8, 11, LICH_COLORS.armor], [9, 11, LICH_COLORS.armor], [10, 11, LICH_COLORS.armorDark],

  // ===== 腰甲 =====
  [3, 12, LICH_COLORS.belt], [4, 12, LICH_COLORS.belt], [5, 12, LICH_COLORS.plate], [6, 12, LICH_COLORS.runeGlow], [7, 12, LICH_COLORS.plateLight], [8, 12, LICH_COLORS.plate], [9, 12, LICH_COLORS.belt],
  [3, 13, LICH_COLORS.armor], [4, 13, LICH_COLORS.armor], [5, 13, LICH_COLORS.armorLight], [6, 13, LICH_COLORS.armor], [7, 13, LICH_COLORS.armorDark], [8, 13, LICH_COLORS.armor], [9, 13, LICH_COLORS.armorDark],

  // ===== 腿甲 =====
  [4, 14, LICH_COLORS.plate], [5, 14, LICH_COLORS.plateLight], [6, 14, LICH_COLORS.rune], [7, 14, LICH_COLORS.plateLight], [8, 14, LICH_COLORS.plate],
  [4, 15, LICH_COLORS.boot], [5, 15, LICH_COLORS.bootLight], [6, 15, LICH_COLORS.boot], [7, 15, LICH_COLORS.bootLight], [8, 15, LICH_COLORS.boot],

  // ===== 剑（向右/右下指向）=====
  [13, 11, LICH_COLORS.swordGlow],
  [12, 12, LICH_COLORS.swordLight], [13, 12, LICH_COLORS.swordRune],
  [12, 13, LICH_COLORS.swordGlow], [13, 13, LICH_COLORS.sword],
  [12, 14, LICH_COLORS.hilt],
  [12, 15, LICH_COLORS.hiltGem],

  // ===== 盾（在身体左前方）=====
  [2, 12, LICH_COLORS.shieldDark], [3, 12, LICH_COLORS.shield],
  [2, 13, LICH_COLORS.shieldRune], [3, 13, LICH_COLORS.shieldLight],
  [2, 14, LICH_COLORS.shieldDark], [3, 14, LICH_COLORS.shield],

  // ===== 冰霜灵气 =====
  [5, 15, LICH_COLORS.frost], [7, 15, LICH_COLORS.frost],
]

// 待机动画帧
const LICH_IDLE_FRAMES = [
  // 帧0 - 符文暗
  [
    { pixels: [
      [6, 3, LICH_COLORS.crownGem], [7, 3, LICH_COLORS.crownGem],
      [5, 4, LICH_COLORS.eye], [8, 4, LICH_COLORS.eye],
      [6, 10, LICH_COLORS.rune], [7, 10, LICH_COLORS.rune],
      [5, 15, LICH_COLORS.frost], [8, 15, LICH_COLORS.frost],
    ] }
  ],
  // 帧1 - 符文亮 + 灵气强
  [
    { pixels: [
      [6, 3, LICH_COLORS.crownGemGlow], [7, 3, LICH_COLORS.crownGemGlow],
      [5, 4, LICH_COLORS.eyeGlow], [8, 4, LICH_COLORS.eyeGlow],
      [6, 10, LICH_COLORS.runeGlow], [7, 10, LICH_COLORS.runeGlow],
      [5, 15, LICH_COLORS.frostLight], [8, 15, LICH_COLORS.frostLight],
      [6, 15, LICH_COLORS.spark], [7, 15, LICH_COLORS.spark],
    ] }
  ],
]

// 行走动画帧
const LICH_WALK_FRAMES = [
  // 帧0 - 左脚前
  [
    { pixels: [
      [4, 15, LICH_COLORS.bootDark], [5, 15, LICH_COLORS.boot], [6, 15, LICH_COLORS.bootDark], [7, 15, LICH_COLORS.boot], [8, 15, LICH_COLORS.bootDark], [9, 15, LICH_COLORS.boot],
    ] }
  ],
  // 帧1 - 中间
  [
    { pixels: [
      [4, 15, LICH_COLORS.boot], [5, 15, LICH_COLORS.bootDark], [6, 15, LICH_COLORS.boot], [7, 15, LICH_COLORS.boot], [8, 15, LICH_COLORS.bootDark], [9, 15, LICH_COLORS.boot],
    ] }
  ],
  // 帧2 - 右脚前
  [
    { pixels: [
      [4, 15, LICH_COLORS.boot], [5, 15, LICH_COLORS.bootDark], [6, 15, LICH_COLORS.bootDark], [7, 15, LICH_COLORS.boot], [8, 15, LICH_COLORS.boot], [9, 15, LICH_COLORS.bootDark],
    ] }
  ],
]

export const drawLichKing = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: LICH_FACE_DOWN,
  up: LICH_FACE_UP,
  left: LICH_FACE_LEFT,
  right: LICH_FACE_RIGHT,
  walk: LICH_WALK_FRAMES,
  idle: LICH_IDLE_FRAMES,
})

export const drawLichKingAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, LICH_AVATAR)