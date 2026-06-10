import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.004,
  WALK_SPEED: 0.1,
}

// 冰霜巨龙颜色（冰白/冰蓝为主，带发光元素）
const WYRM_COLORS = {
  // 鳞片/身体主色
  body: '#B8D8F0',         // 主色 - 浅冰蓝
  bodyLight: '#E0F0FF',    // 亮色
  bodyDark: '#80A8CC',     // 暗色
  bodyShadow: '#5A7A9A',   // 阴影色
  // 背部尖刺/鳞
  spike: '#D0E8F8',        // 尖刺亮
  spikeDark: '#80A8CC',    // 尖刺暗
  // 腹部
  belly: '#E8F4FF',        // 腹部主色
  bellyLight: '#FFFFFF',   // 腹部亮
  // 角/牙
  horn: '#F0F8FF',         // 角 - 近白
  hornDark: '#B8D0E8',     // 角暗
  teeth: '#FFFFFF',        // 牙
  // 眼睛 - 冰蓝发光
  eye: '#00FFFF',          // 眼睛
  eyeGlow: '#80FFFF',      // 发光
  eyeInner: '#FFFFFF',     // 内核
  // 翼膜
  wing: '#C0E0F5',         // 翼膜主
  wingLight: '#E0F0FF',    // 翼膜亮
  wingDark: '#7A9FBE',     // 翼膜暗
  wingBone: '#E0F0FF',     // 翼骨
  // 爪
  claw: '#F0F8FF',         // 爪
  clawDark: '#A0C8E0',     // 爪暗
  // 冰霜/呼吸
  frost: '#80E0FF',        // 冰霜
  frostLight: '#C0F0FF',   // 冰霜亮
  frostDark: '#40A0D0',    // 冰霜暗
  // 龙鳞/魔法
  scale: '#D0E8F8',        // 鳞片
  magic: '#00FFFF',        // 魔法发光
  magicLight: '#80FFFF',   // 魔法亮
  rune: '#00CCFF',         // 符文
  spark: '#FFFFFF',        // 粒子
  highlight: '#FFFFFF',      // 高光
}

// 冰霜巨龙高精度头像（16x16网格，聚焦龙头特写）
const WYRM_AVATAR = [
  // ===== 头顶角（顶部）=====
  [4, 0, WYRM_COLORS.hornDark], [5, 0, WYRM_COLORS.horn], [6, 0, WYRM_COLORS.horn], [9, 0, WYRM_COLORS.horn], [10, 0, WYRM_COLORS.horn], [11, 0, WYRM_COLORS.hornDark],
  [4, 1, WYRM_COLORS.horn], [5, 1, WYRM_COLORS.hornDark], [6, 1, WYRM_COLORS.hornDark], [9, 1, WYRM_COLORS.hornDark], [10, 1, WYRM_COLORS.hornDark], [11, 1, WYRM_COLORS.horn],

  // ===== 头顶鳞片/毛发 =====
  [3, 2, WYRM_COLORS.bodyDark], [4, 2, WYRM_COLORS.body], [5, 2, WYRM_COLORS.bodyLight], [6, 2, WYRM_COLORS.body], [7, 2, WYRM_COLORS.bodyLight], [8, 2, WYRM_COLORS.bodyLight], [9, 2, WYRM_COLORS.body], [10, 2, WYRM_COLORS.bodyLight], [11, 2, WYRM_COLORS.body], [12, 2, WYRM_COLORS.bodyDark],
  [3, 3, WYRM_COLORS.body], [4, 3, WYRM_COLORS.bodyLight], [5, 3, WYRM_COLORS.body], [6, 3, WYRM_COLORS.bodyLight], [7, 3, WYRM_COLORS.body], [8, 3, WYRM_COLORS.bodyLight], [9, 3, WYRM_COLORS.body], [10, 3, WYRM_COLORS.bodyLight], [11, 3, WYRM_COLORS.body], [12, 3, WYRM_COLORS.bodyDark],

  // ===== 眼睛行 =====
  [2, 4, WYRM_COLORS.bodyDark], [3, 4, WYRM_COLORS.body], [4, 4, WYRM_COLORS.eye], [5, 4, WYRM_COLORS.eyeGlow], [6, 4, WYRM_COLORS.body], [7, 4, WYRM_COLORS.body], [8, 4, WYRM_COLORS.body], [9, 4, WYRM_COLORS.eyeGlow], [10, 4, WYRM_COLORS.eye], [11, 4, WYRM_COLORS.body], [12, 4, WYRM_COLORS.bodyDark],
  // 眼睛高光
  [4, 3, WYRM_COLORS.highlight], [5, 3, WYRM_COLORS.highlight], [9, 3, WYRM_COLORS.highlight], [10, 3, WYRM_COLORS.highlight],
  [4, 4, WYRM_COLORS.highlight], [10, 4, WYRM_COLORS.highlight],

  // ===== 眼睛发光效果 =====
  [4, 4, WYRM_COLORS.eyeGlow], [5, 4, WYRM_COLORS.eyeGlow], [9, 4, WYRM_COLORS.eyeGlow], [10, 4, WYRM_COLORS.eyeGlow],
  [5, 5, WYRM_COLORS.eyeInner], [6, 5, WYRM_COLORS.eyeInner], [9, 5, WYRM_COLORS.eyeInner], [10, 5, WYRM_COLORS.eyeInner],

  // ===== 鼻部/嘴部 =====
  [3, 5, WYRM_COLORS.body], [4, 5, WYRM_COLORS.bodyLight], [5, 5, WYRM_COLORS.body], [6, 5, WYRM_COLORS.body], [7, 5, WYRM_COLORS.bodyLight], [8, 5, WYRM_COLORS.bodyLight], [9, 5, WYRM_COLORS.body], [10, 5, WYRM_COLORS.body], [11, 5, WYRM_COLORS.bodyDark],
  [3, 6, WYRM_COLORS.bodyLight], [4, 6, WYRM_COLORS.body], [5, 6, WYRM_COLORS.body], [6, 6, WYRM_COLORS.bodyLight], [7, 6, WYRM_COLORS.bodyLight], [8, 6, WYRM_COLORS.bodyLight], [9, 6, WYRM_COLORS.body], [10, 6, WYRM_COLORS.body], [11, 6, WYRM_COLORS.bodyLight],

  // ===== 牙齿 =====
  [4, 7, WYRM_COLORS.teeth], [5, 7, WYRM_COLORS.teeth], [6, 7, WYRM_COLORS.teeth], [7, 7, WYRM_COLORS.teeth], [8, 7, WYRM_COLORS.teeth], [9, 7, WYRM_COLORS.teeth], [10, 7, WYRM_COLORS.teeth],
  [5, 8, WYRM_COLORS.teeth], [6, 8, WYRM_COLORS.teeth], [7, 8, WYRM_COLORS.teeth], [8, 8, WYRM_COLORS.teeth], [9, 8, WYRM_COLORS.teeth],

  // ===== 下颚 =====
  [4, 9, WYRM_COLORS.bodyDark], [5, 9, WYRM_COLORS.body], [6, 9, WYRM_COLORS.body], [7, 9, WYRM_COLORS.bodyLight], [8, 9, WYRM_COLORS.body], [9, 9, WYRM_COLORS.body], [10, 9, WYRM_COLORS.bodyDark],
  [5, 10, WYRM_COLORS.body], [6, 10, WYRM_COLORS.bodyLight], [7, 10, WYRM_COLORS.body], [8, 10, WYRM_COLORS.bodyLight], [9, 10, WYRM_COLORS.body],

  // ===== 颈部 =====
  [4, 11, WYRM_COLORS.body], [5, 11, WYRM_COLORS.bodyLight], [6, 11, WYRM_COLORS.body], [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.bodyLight], [9, 11, WYRM_COLORS.body],
  [5, 12, WYRM_COLORS.bodyDark], [6, 12, WYRM_COLORS.body], [7, 12, WYRM_COLORS.bodyLight], [8, 12, WYRM_COLORS.body], [9, 12, WYRM_COLORS.bodyDark],

  // ===== 冰霜鬃毛 =====
  [3, 10, WYRM_COLORS.frost], [4, 10, WYRM_COLORS.frostLight],
  [3, 11, WYRM_COLORS.frostLight], [4, 11, WYRM_COLORS.frost],
  [10, 10, WYRM_COLORS.frostLight], [11, 10, WYRM_COLORS.frost],
  [10, 11, WYRM_COLORS.frost], [11, 11, WYRM_COLORS.frostLight],

  // ===== 魔法符文装饰 =====
  [5, 12, WYRM_COLORS.rune], [6, 12, WYRM_COLORS.magicLight],
  [9, 12, WYRM_COLORS.magicLight], [10, 12, WYRM_COLORS.rune],

  // ===== 腹部 =====
  [5, 13, WYRM_COLORS.belly], [6, 13, WYRM_COLORS.bellyLight], [7, 13, WYRM_COLORS.belly], [8, 13, WYRM_COLORS.bellyLight], [9, 13, WYRM_COLORS.belly],
  [6, 14, WYRM_COLORS.bellyLight], [7, 14, WYRM_COLORS.belly], [8, 14, WYRM_COLORS.bellyLight],

  // ===== 冰霜粒子 =====
  [4, 6, WYRM_COLORS.frostLight], [11, 6, WYRM_COLORS.frostLight],
  [3, 8, WYRM_COLORS.frost], [12, 8, WYRM_COLORS.frost],
]

// 向左面朝 - 冰霜巨龙（头部在左，尾部在右）（已居中，x偏移+2）
const WYRM_FACE_LEFT = [
  // ===== 头部（最左侧）=====
  [2, 5, WYRM_COLORS.horn], [3, 5, WYRM_COLORS.horn],
  [2, 6, WYRM_COLORS.bodyLight], [3, 6, WYRM_COLORS.bodyLight], [4, 6, WYRM_COLORS.body],
  [2, 7, WYRM_COLORS.body], [3, 7, WYRM_COLORS.eye], [4, 7, WYRM_COLORS.eyeGlow], [5, 7, WYRM_COLORS.bodyLight],
  [2, 8, WYRM_COLORS.bodyDark], [3, 8, WYRM_COLORS.body], [4, 8, WYRM_COLORS.body], [5, 8, WYRM_COLORS.body], [6, 8, WYRM_COLORS.bodyLight],
  [3, 9, WYRM_COLORS.teeth], [4, 9, WYRM_COLORS.teeth], [5, 9, WYRM_COLORS.body], [6, 9, WYRM_COLORS.body], [7, 9, WYRM_COLORS.bodyLight],
  [3, 10, WYRM_COLORS.bodyDark], [4, 10, WYRM_COLORS.body], [5, 10, WYRM_COLORS.body], [6, 10, WYRM_COLORS.body], [7, 10, WYRM_COLORS.bodyLight],

  // ===== 颈部 =====
  [7, 7, WYRM_COLORS.bodyLight], [8, 7, WYRM_COLORS.body],
  [7, 8, WYRM_COLORS.body], [8, 8, WYRM_COLORS.bodyLight], [9, 8, WYRM_COLORS.body],
  [8, 9, WYRM_COLORS.body], [9, 9, WYRM_COLORS.bodyLight], [10, 9, WYRM_COLORS.body],
  [8, 10, WYRM_COLORS.bodyLight], [9, 10, WYRM_COLORS.body], [10, 10, WYRM_COLORS.bodyLight],

  // ===== 背部尖刺（上沿）=====
  [9, 6, WYRM_COLORS.spike],
  [10, 5, WYRM_COLORS.spike], [11, 5, WYRM_COLORS.spikeDark],
  [11, 6, WYRM_COLORS.spike], [12, 6, WYRM_COLORS.spikeDark],

  // ===== 身体（主体，占据中间大部分区域）=====
  [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.body], [9, 11, WYRM_COLORS.bodyLight], [10, 11, WYRM_COLORS.body], [11, 11, WYRM_COLORS.bodyLight], [12, 11, WYRM_COLORS.body], [13, 11, WYRM_COLORS.bodyLight],
  [6, 12, WYRM_COLORS.bodyDark], [7, 12, WYRM_COLORS.body], [8, 12, WYRM_COLORS.body], [9, 12, WYRM_COLORS.bodyLight], [10, 12, WYRM_COLORS.body], [11, 12, WYRM_COLORS.bodyLight], [12, 12, WYRM_COLORS.body], [13, 12, WYRM_COLORS.body], [14, 12, WYRM_COLORS.bodyDark],

  // ===== 腹部/下部 =====
  [5, 13, WYRM_COLORS.bodyDark], [6, 13, WYRM_COLORS.belly], [7, 13, WYRM_COLORS.bellyLight], [8, 13, WYRM_COLORS.belly], [9, 13, WYRM_COLORS.bellyLight], [10, 13, WYRM_COLORS.belly], [11, 13, WYRM_COLORS.bellyLight], [12, 13, WYRM_COLORS.belly], [13, 13, WYRM_COLORS.bodyLight], [14, 13, WYRM_COLORS.bodyDark],
  [6, 14, WYRM_COLORS.belly], [7, 14, WYRM_COLORS.bellyLight], [8, 14, WYRM_COLORS.belly], [9, 14, WYRM_COLORS.bellyLight], [10, 14, WYRM_COLORS.belly], [11, 14, WYRM_COLORS.bellyLight], [12, 14, WYRM_COLORS.belly], [13, 14, WYRM_COLORS.body],

  // ===== 腿/爪（前部腿）=====
  [5, 11, WYRM_COLORS.body],
  [5, 12, WYRM_COLORS.bodyDark],
  [4, 13, WYRM_COLORS.clawDark], [5, 13, WYRM_COLORS.claw],
  [4, 14, WYRM_COLORS.claw], [5, 14, WYRM_COLORS.claw],
  [4, 15, WYRM_COLORS.clawDark], [5, 15, WYRM_COLORS.clawDark],

  // ===== 腿/爪（后部腿）=====
  [14, 11, WYRM_COLORS.body], [15, 11, WYRM_COLORS.bodyLight],
  [14, 12, WYRM_COLORS.body], [15, 12, WYRM_COLORS.bodyDark],
  [15, 13, WYRM_COLORS.claw], [16, 13, WYRM_COLORS.clawDark],
  [15, 14, WYRM_COLORS.claw], [16, 14, WYRM_COLORS.claw],
  [15, 15, WYRM_COLORS.clawDark], [16, 15, WYRM_COLORS.clawDark],

  // ===== 翅膀（翼）=====
  [8, 4, WYRM_COLORS.wingBone], [9, 4, WYRM_COLORS.wingLight], [10, 4, WYRM_COLORS.wing],
  [7, 5, WYRM_COLORS.wing], [8, 5, WYRM_COLORS.wingLight], [9, 5, WYRM_COLORS.wing], [10, 5, WYRM_COLORS.wingLight], [11, 5, WYRM_COLORS.wing], [12, 5, WYRM_COLORS.wingDark],
  [6, 6, WYRM_COLORS.wingDark], [7, 6, WYRM_COLORS.wing], [8, 6, WYRM_COLORS.wingLight], [9, 6, WYRM_COLORS.wing], [10, 6, WYRM_COLORS.wingLight], [11, 6, WYRM_COLORS.wing], [12, 6, WYRM_COLORS.wingDark], [13, 6, WYRM_COLORS.wingDark],
  [10, 7, WYRM_COLORS.wing], [11, 7, WYRM_COLORS.wingLight], [12, 7, WYRM_COLORS.wing], [13, 7, WYRM_COLORS.wingDark],
  [11, 8, WYRM_COLORS.wingDark], [12, 8, WYRM_COLORS.wing], [13, 8, WYRM_COLORS.wingDark],

  // ===== 尾巴（向右延伸）=====
  [13, 10, WYRM_COLORS.bodyLight], [14, 10, WYRM_COLORS.body],
  [14, 11, WYRM_COLORS.body], [15, 11, WYRM_COLORS.bodyDark],
  [15, 12, WYRM_COLORS.tail], [16, 12, WYRM_COLORS.tailDark],
  [15, 13, WYRM_COLORS.tailLight], [16, 13, WYRM_COLORS.tail],
  [16, 14, WYRM_COLORS.tail], [17, 14, WYRM_COLORS.tailDark],
  [16, 15, WYRM_COLORS.tailLight], [17, 15, WYRM_COLORS.tail],

  // ===== 冰霜呼吸（嘴前）=====
  [2, 8, WYRM_COLORS.frost], [2, 9, WYRM_COLORS.frostLight],
  [1, 8, WYRM_COLORS.frostLight], [1, 9, WYRM_COLORS.frost],

  // ===== 发光点 =====
  [9, 12, WYRM_COLORS.magic], [10, 12, WYRM_COLORS.magicLight],
]

// 向右面朝 - 镜像（已居中，x偏移+2）
const WYRM_FACE_RIGHT = [
  // ===== 头部（最右侧）=====
  [16, 5, WYRM_COLORS.horn], [17, 5, WYRM_COLORS.horn],
  [16, 6, WYRM_COLORS.bodyLight], [17, 6, WYRM_COLORS.bodyLight],
  [14, 7, WYRM_COLORS.bodyLight], [15, 7, WYRM_COLORS.eyeGlow], [16, 7, WYRM_COLORS.eye], [17, 7, WYRM_COLORS.body],
  [13, 8, WYRM_COLORS.bodyLight], [14, 8, WYRM_COLORS.body], [15, 8, WYRM_COLORS.body], [16, 8, WYRM_COLORS.body], [17, 8, WYRM_COLORS.bodyDark],
  [12, 9, WYRM_COLORS.bodyLight], [13, 9, WYRM_COLORS.body], [14, 9, WYRM_COLORS.body], [15, 9, WYRM_COLORS.teeth], [16, 9, WYRM_COLORS.teeth],
  [12, 10, WYRM_COLORS.bodyLight], [13, 10, WYRM_COLORS.body], [14, 10, WYRM_COLORS.body], [15, 10, WYRM_COLORS.body], [16, 10, WYRM_COLORS.bodyDark],

  // ===== 颈部 =====
  [11, 7, WYRM_COLORS.body], [12, 7, WYRM_COLORS.bodyLight],
  [10, 8, WYRM_COLORS.body], [11, 8, WYRM_COLORS.bodyLight], [12, 8, WYRM_COLORS.body],
  [9, 9, WYRM_COLORS.body], [10, 9, WYRM_COLORS.bodyLight], [11, 9, WYRM_COLORS.body],
  [9, 10, WYRM_COLORS.bodyLight], [10, 10, WYRM_COLORS.body], [11, 10, WYRM_COLORS.bodyLight],

  // ===== 背部尖刺（上沿）=====
  [10, 6, WYRM_COLORS.spike],
  [7, 5, WYRM_COLORS.spikeDark], [8, 5, WYRM_COLORS.spike],
  [6, 6, WYRM_COLORS.spikeDark], [7, 6, WYRM_COLORS.spike],

  // ===== 身体（主体）=====
  [6, 11, WYRM_COLORS.bodyLight], [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.bodyLight], [9, 11, WYRM_COLORS.body], [10, 11, WYRM_COLORS.bodyLight], [11, 11, WYRM_COLORS.body], [12, 11, WYRM_COLORS.bodyLight],
  [5, 12, WYRM_COLORS.bodyDark], [6, 12, WYRM_COLORS.body], [7, 12, WYRM_COLORS.bodyLight], [8, 12, WYRM_COLORS.body], [9, 12, WYRM_COLORS.bodyLight], [10, 12, WYRM_COLORS.body], [11, 12, WYRM_COLORS.bodyLight], [12, 12, WYRM_COLORS.body], [13, 12, WYRM_COLORS.bodyDark],

  // ===== 腹部/下部 =====
  [5, 13, WYRM_COLORS.bodyDark], [6, 13, WYRM_COLORS.belly], [7, 13, WYRM_COLORS.bellyLight], [8, 13, WYRM_COLORS.belly], [9, 13, WYRM_COLORS.bellyLight], [10, 13, WYRM_COLORS.belly], [11, 13, WYRM_COLORS.bellyLight], [12, 13, WYRM_COLORS.belly], [13, 13, WYRM_COLORS.bodyLight], [14, 13, WYRM_COLORS.bodyDark],
  [6, 14, WYRM_COLORS.belly], [7, 14, WYRM_COLORS.bellyLight], [8, 14, WYRM_COLORS.belly], [9, 14, WYRM_COLORS.bellyLight], [10, 14, WYRM_COLORS.belly], [11, 14, WYRM_COLORS.bellyLight], [12, 14, WYRM_COLORS.belly], [13, 14, WYRM_COLORS.body],

  // ===== 腿/爪（前部腿 - 右侧）=====
  [14, 11, WYRM_COLORS.body],
  [14, 12, WYRM_COLORS.bodyDark],
  [14, 13, WYRM_COLORS.claw], [15, 13, WYRM_COLORS.clawDark],
  [14, 14, WYRM_COLORS.claw], [15, 14, WYRM_COLORS.claw],
  [14, 15, WYRM_COLORS.clawDark], [15, 15, WYRM_COLORS.clawDark],

  // ===== 腿/爪（后部腿 - 左侧）=====
  [4, 11, WYRM_COLORS.bodyLight], [5, 11, WYRM_COLORS.body],
  [4, 12, WYRM_COLORS.body], [5, 12, WYRM_COLORS.bodyDark],
  [3, 13, WYRM_COLORS.clawDark], [4, 13, WYRM_COLORS.claw],
  [3, 14, WYRM_COLORS.claw], [4, 14, WYRM_COLORS.claw],
  [3, 15, WYRM_COLORS.clawDark], [4, 15, WYRM_COLORS.clawDark],

  // ===== 翅膀 =====
  [9, 4, WYRM_COLORS.wing], [10, 4, WYRM_COLORS.wingLight], [11, 4, WYRM_COLORS.wingBone],
  [7, 5, WYRM_COLORS.wingDark], [8, 5, WYRM_COLORS.wing], [9, 5, WYRM_COLORS.wingLight], [10, 5, WYRM_COLORS.wing], [11, 5, WYRM_COLORS.wingLight], [12, 5, WYRM_COLORS.wing],
  [6, 6, WYRM_COLORS.wingDark], [7, 6, WYRM_COLORS.wingDark], [8, 6, WYRM_COLORS.wing], [9, 6, WYRM_COLORS.wingLight], [10, 6, WYRM_COLORS.wing], [11, 6, WYRM_COLORS.wingLight], [12, 6, WYRM_COLORS.wing], [13, 6, WYRM_COLORS.wingDark],
  [6, 7, WYRM_COLORS.wingDark], [7, 7, WYRM_COLORS.wing], [8, 7, WYRM_COLORS.wingLight], [9, 7, WYRM_COLORS.wing], [10, 7, WYRM_COLORS.wingLight], [11, 7, WYRM_COLORS.wingDark],
  [6, 8, WYRM_COLORS.wingDark], [7, 8, WYRM_COLORS.wing], [8, 8, WYRM_COLORS.wingDark],

  // ===== 尾巴（向左延伸）=====
  [5, 10, WYRM_COLORS.body], [6, 10, WYRM_COLORS.bodyLight],
  [4, 11, WYRM_COLORS.bodyDark], [5, 11, WYRM_COLORS.body],
  [3, 12, WYRM_COLORS.tailDark], [4, 12, WYRM_COLORS.tail],
  [3, 13, WYRM_COLORS.tail], [2, 13, WYRM_COLORS.tailLight],
  [2, 14, WYRM_COLORS.tail], [3, 14, WYRM_COLORS.tailLight],
  [2, 15, WYRM_COLORS.tail], [3, 15, WYRM_COLORS.tailDark],

  // ===== 冰霜呼吸（嘴前 - 右侧）=====
  [17, 8, WYRM_COLORS.frost], [17, 9, WYRM_COLORS.frostLight],

  // ===== 发光点 =====
  [9, 12, WYRM_COLORS.magicLight], [10, 12, WYRM_COLORS.magic],
]

// 向下面朝 - 冰霜巨龙正面（头部朝下方）（已居中，x偏移+2）
const WYRM_FACE_DOWN = [
  // ===== 头部（下方）=====
  [7, 0, WYRM_COLORS.horn], [8, 0, WYRM_COLORS.horn], [11, 0, WYRM_COLORS.horn], [12, 0, WYRM_COLORS.horn],
  [6, 1, WYRM_COLORS.hornDark], [7, 1, WYRM_COLORS.bodyLight], [8, 1, WYRM_COLORS.body], [9, 1, WYRM_COLORS.body], [10, 1, WYRM_COLORS.body], [11, 1, WYRM_COLORS.bodyLight], [12, 1, WYRM_COLORS.body], [13, 1, WYRM_COLORS.hornDark],
  [5, 2, WYRM_COLORS.bodyLight], [6, 2, WYRM_COLORS.body], [7, 2, WYRM_COLORS.bodyLight], [8, 2, WYRM_COLORS.body], [9, 2, WYRM_COLORS.bodyLight], [10, 2, WYRM_COLORS.body], [11, 2, WYRM_COLORS.bodyLight], [12, 2, WYRM_COLORS.body], [13, 2, WYRM_COLORS.bodyLight],
  [5, 3, WYRM_COLORS.body], [6, 3, WYRM_COLORS.body], [7, 3, WYRM_COLORS.eye], [8, 3, WYRM_COLORS.eyeGlow], [9, 3, WYRM_COLORS.body], [10, 3, WYRM_COLORS.body], [11, 3, WYRM_COLORS.eyeGlow], [12, 3, WYRM_COLORS.eye], [13, 3, WYRM_COLORS.body], [14, 3, WYRM_COLORS.bodyDark],

  // ===== 鼻部/嘴部 =====
  [6, 4, WYRM_COLORS.body], [7, 4, WYRM_COLORS.body], [8, 4, WYRM_COLORS.bodyLight], [9, 4, WYRM_COLORS.bodyLight], [10, 4, WYRM_COLORS.bodyLight], [11, 4, WYRM_COLORS.body], [12, 4, WYRM_COLORS.body],
  [7, 5, WYRM_COLORS.bodyLight], [8, 5, WYRM_COLORS.body], [9, 5, WYRM_COLORS.body], [10, 5, WYRM_COLORS.body], [11, 5, WYRM_COLORS.bodyLight],
  [7, 6, WYRM_COLORS.teeth], [8, 5, WYRM_COLORS.teeth], [9, 5, WYRM_COLORS.teeth], [10, 5, WYRM_COLORS.teeth], [11, 6, WYRM_COLORS.teeth],
  [7, 7, WYRM_COLORS.teeth], [8, 6, WYRM_COLORS.teeth], [9, 6, WYRM_COLORS.body], [10, 6, WYRM_COLORS.teeth], [11, 7, WYRM_COLORS.teeth],
  [8, 7, WYRM_COLORS.bodyDark], [9, 7, WYRM_COLORS.body], [10, 7, WYRM_COLORS.bodyDark],

  // ===== 颈部 =====
  [6, 8, WYRM_COLORS.bodyLight], [7, 8, WYRM_COLORS.body], [8, 8, WYRM_COLORS.bodyLight], [9, 8, WYRM_COLORS.body], [10, 8, WYRM_COLORS.bodyLight], [11, 8, WYRM_COLORS.body], [12, 8, WYRM_COLORS.bodyLight], [13, 8, WYRM_COLORS.body],

  // ===== 身体/胸部（中央）=====
  [5, 9, WYRM_COLORS.body], [6, 9, WYRM_COLORS.bodyLight], [7, 9, WYRM_COLORS.body], [8, 9, WYRM_COLORS.bodyLight], [9, 9, WYRM_COLORS.body], [10, 9, WYRM_COLORS.bodyLight], [11, 9, WYRM_COLORS.body], [12, 9, WYRM_COLORS.bodyLight], [13, 9, WYRM_COLORS.body], [14, 9, WYRM_COLORS.bodyDark],
  [4, 10, WYRM_COLORS.bodyDark], [5, 10, WYRM_COLORS.body], [6, 10, WYRM_COLORS.body], [7, 10, WYRM_COLORS.bodyLight], [8, 10, WYRM_COLORS.body], [9, 10, WYRM_COLORS.bodyLight], [10, 10, WYRM_COLORS.body], [11, 10, WYRM_COLORS.bodyLight], [12, 10, WYRM_COLORS.body], [13, 10, WYRM_COLORS.body], [14, 10, WYRM_COLORS.bodyDark],
  [4, 11, WYRM_COLORS.bodyDark], [5, 11, WYRM_COLORS.body], [6, 11, WYRM_COLORS.bodyLight], [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.bodyLight], [9, 11, WYRM_COLORS.body], [10, 11, WYRM_COLORS.bodyLight], [11, 11, WYRM_COLORS.body], [12, 11, WYRM_COLORS.bodyLight], [13, 11, WYRM_COLORS.body], [14, 11, WYRM_COLORS.bodyDark],

  // ===== 腹部 =====
  [5, 12, WYRM_COLORS.bodyDark], [6, 12, WYRM_COLORS.belly], [7, 12, WYRM_COLORS.bellyLight], [8, 12, WYRM_COLORS.belly], [9, 12, WYRM_COLORS.bellyLight], [10, 12, WYRM_COLORS.belly], [11, 12, WYRM_COLORS.bellyLight], [12, 12, WYRM_COLORS.belly], [13, 12, WYRM_COLORS.bodyDark],
  [6, 13, WYRM_COLORS.belly], [7, 13, WYRM_COLORS.bellyLight], [8, 13, WYRM_COLORS.belly], [9, 13, WYRM_COLORS.bellyLight], [10, 13, WYRM_COLORS.belly], [11, 13, WYRM_COLORS.bellyLight], [12, 13, WYRM_COLORS.belly],
  [7, 14, WYRM_COLORS.belly], [8, 14, WYRM_COLORS.bellyLight], [9, 14, WYRM_COLORS.belly], [10, 14, WYRM_COLORS.bellyLight], [11, 14, WYRM_COLORS.belly],
  [8, 15, WYRM_COLORS.bellyLight], [9, 15, WYRM_COLORS.belly], [10, 15, WYRM_COLORS.bellyLight],

  // ===== 翅膀（两侧展开）=====
  [2, 6, WYRM_COLORS.wingDark], [3, 6, WYRM_COLORS.wing], [15, 6, WYRM_COLORS.wing], [16, 6, WYRM_COLORS.wingDark],
  [2, 7, WYRM_COLORS.wing], [3, 7, WYRM_COLORS.wingLight], [4, 7, WYRM_COLORS.wing], [14, 7, WYRM_COLORS.wing], [15, 7, WYRM_COLORS.wingLight], [16, 7, WYRM_COLORS.wing],
  [2, 8, WYRM_COLORS.wingDark], [3, 8, WYRM_COLORS.wing], [4, 8, WYRM_COLORS.wingLight], [14, 8, WYRM_COLORS.wingLight], [15, 8, WYRM_COLORS.wing], [16, 8, WYRM_COLORS.wingDark],
  [3, 9, WYRM_COLORS.wingDark], [4, 9, WYRM_COLORS.wing], [14, 9, WYRM_COLORS.wing], [15, 9, WYRM_COLORS.wingDark],

  // ===== 腿/爪（前腿 - 两侧）=====
  [3, 12, WYRM_COLORS.clawDark], [4, 12, WYRM_COLORS.claw], [14, 12, WYRM_COLORS.claw], [15, 12, WYRM_COLORS.clawDark],
  [3, 13, WYRM_COLORS.claw], [4, 13, WYRM_COLORS.claw], [14, 13, WYRM_COLORS.claw], [15, 13, WYRM_COLORS.claw],
  [3, 14, WYRM_COLORS.clawDark], [4, 14, WYRM_COLORS.clawDark], [14, 14, WYRM_COLORS.clawDark], [15, 14, WYRM_COLORS.clawDark],

  // ===== 发光/魔法点 =====
  [9, 10, WYRM_COLORS.magic], [8, 11, WYRM_COLORS.magicLight], [10, 11, WYRM_COLORS.magicLight],
  [7, 10, WYRM_COLORS.rune], [11, 10, WYRM_COLORS.rune],

  // ===== 尾巴（向上，绕到头部后面）=====
  [9, 0, WYRM_COLORS.tail], [10, 0, WYRM_COLORS.tailLight],
]

// 向上面朝 - 冰霜巨龙背面（头部朝上方）（已居中，x偏移+2）
const WYRM_FACE_UP = [
  // ===== 头部背面（上方）=====
  [7, 0, WYRM_COLORS.bodyDark], [8, 0, WYRM_COLORS.horn], [9, 0, WYRM_COLORS.horn], [10, 0, WYRM_COLORS.horn], [11, 0, WYRM_COLORS.horn], [12, 0, WYRM_COLORS.bodyDark],
  [6, 1, WYRM_COLORS.bodyLight], [7, 1, WYRM_COLORS.body], [8, 1, WYRM_COLORS.bodyLight], [9, 1, WYRM_COLORS.body], [10, 1, WYRM_COLORS.body], [11, 1, WYRM_COLORS.bodyLight], [12, 1, WYRM_COLORS.body], [13, 1, WYRM_COLORS.bodyLight],
  [5, 2, WYRM_COLORS.bodyLight], [6, 2, WYRM_COLORS.body], [7, 2, WYRM_COLORS.bodyLight], [8, 2, WYRM_COLORS.body], [9, 2, WYRM_COLORS.bodyLight], [10, 2, WYRM_COLORS.body], [11, 2, WYRM_COLORS.bodyLight], [12, 2, WYRM_COLORS.body], [13, 2, WYRM_COLORS.bodyLight],
  [5, 3, WYRM_COLORS.body], [6, 3, WYRM_COLORS.body], [7, 3, WYRM_COLORS.body], [8, 3, WYRM_COLORS.bodyLight], [9, 3, WYRM_COLORS.body], [10, 3, WYRM_COLORS.bodyLight], [11, 3, WYRM_COLORS.body], [12, 3, WYRM_COLORS.body], [13, 3, WYRM_COLORS.body], [14, 3, WYRM_COLORS.bodyDark],

  // ===== 颈部/背部尖刺 =====
  [7, 4, WYRM_COLORS.spike], [8, 4, WYRM_COLORS.spikeDark], [9, 4, WYRM_COLORS.spike], [10, 4, WYRM_COLORS.spikeDark], [11, 4, WYRM_COLORS.spike],
  [6, 5, WYRM_COLORS.body], [7, 5, WYRM_COLORS.bodyLight], [8, 5, WYRM_COLORS.body], [9, 5, WYRM_COLORS.bodyLight], [10, 5, WYRM_COLORS.body], [11, 5, WYRM_COLORS.bodyLight], [12, 5, WYRM_COLORS.body],

  // ===== 身体背部 =====
  [5, 6, WYRM_COLORS.bodyDark], [6, 6, WYRM_COLORS.body], [7, 6, WYRM_COLORS.bodyLight], [8, 6, WYRM_COLORS.body], [9, 6, WYRM_COLORS.bodyLight], [10, 6, WYRM_COLORS.body], [11, 6, WYRM_COLORS.bodyLight], [12, 6, WYRM_COLORS.body], [13, 6, WYRM_COLORS.bodyDark],
  [4, 7, WYRM_COLORS.bodyDark], [5, 7, WYRM_COLORS.body], [6, 7, WYRM_COLORS.body], [7, 7, WYRM_COLORS.bodyLight], [8, 7, WYRM_COLORS.body], [9, 7, WYRM_COLORS.bodyLight], [10, 7, WYRM_COLORS.body], [11, 7, WYRM_COLORS.bodyLight], [12, 7, WYRM_COLORS.body], [13, 7, WYRM_COLORS.body], [14, 7, WYRM_COLORS.bodyDark],
  [4, 8, WYRM_COLORS.bodyDark], [5, 8, WYRM_COLORS.body], [6, 8, WYRM_COLORS.bodyLight], [7, 8, WYRM_COLORS.body], [8, 8, WYRM_COLORS.bodyLight], [9, 8, WYRM_COLORS.body], [10, 8, WYRM_COLORS.bodyLight], [11, 8, WYRM_COLORS.body], [12, 8, WYRM_COLORS.bodyLight], [13, 8, WYRM_COLORS.body], [14, 8, WYRM_COLORS.bodyDark],
  [4, 9, WYRM_COLORS.bodyDark], [5, 9, WYRM_COLORS.body], [6, 9, WYRM_COLORS.body], [7, 9, WYRM_COLORS.bodyLight], [8, 9, WYRM_COLORS.body], [9, 9, WYRM_COLORS.bodyLight], [10, 9, WYRM_COLORS.body], [11, 9, WYRM_COLORS.bodyLight], [12, 9, WYRM_COLORS.body], [13, 9, WYRM_COLORS.body], [14, 9, WYRM_COLORS.bodyDark],

  // ===== 身体下部/臀部 =====
  [5, 10, WYRM_COLORS.body], [6, 10, WYRM_COLORS.bodyLight], [7, 10, WYRM_COLORS.body], [8, 10, WYRM_COLORS.bodyLight], [9, 10, WYRM_COLORS.body], [10, 10, WYRM_COLORS.bodyLight], [11, 10, WYRM_COLORS.body], [12, 10, WYRM_COLORS.bodyLight], [13, 10, WYRM_COLORS.body],
  [6, 11, WYRM_COLORS.body], [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.bodyLight], [9, 11, WYRM_COLORS.body], [10, 11, WYRM_COLORS.bodyLight], [11, 11, WYRM_COLORS.body], [12, 11, WYRM_COLORS.body],
  [7, 12, WYRM_COLORS.bodyDark], [8, 12, WYRM_COLORS.body], [9, 12, WYRM_COLORS.bodyLight], [10, 12, WYRM_COLORS.body], [11, 12, WYRM_COLORS.bodyDark],

  // ===== 尾巴（向下延伸）=====
  [8, 13, WYRM_COLORS.tail], [9, 13, WYRM_COLORS.tailLight], [10, 13, WYRM_COLORS.tail],
  [8, 14, WYRM_COLORS.tailDark], [9, 14, WYRM_COLORS.tail], [10, 14, WYRM_COLORS.tailDark],
  [9, 15, WYRM_COLORS.tail],

  // ===== 翅膀（两侧展开）=====
  [2, 5, WYRM_COLORS.wingDark], [3, 5, WYRM_COLORS.wing], [15, 5, WYRM_COLORS.wing], [16, 5, WYRM_COLORS.wingDark],
  [2, 6, WYRM_COLORS.wing], [3, 6, WYRM_COLORS.wingLight], [4, 6, WYRM_COLORS.wing], [14, 6, WYRM_COLORS.wing], [15, 6, WYRM_COLORS.wingLight], [16, 6, WYRM_COLORS.wing],
  [2, 7, WYRM_COLORS.wingDark], [3, 7, WYRM_COLORS.wing], [4, 7, WYRM_COLORS.wingLight], [14, 7, WYRM_COLORS.wingLight], [15, 7, WYRM_COLORS.wing], [16, 7, WYRM_COLORS.wingDark],
  [3, 8, WYRM_COLORS.wingDark], [4, 8, WYRM_COLORS.wing], [14, 8, WYRM_COLORS.wing], [15, 8, WYRM_COLORS.wingDark],
  [3, 9, WYRM_COLORS.wingDark], [4, 9, WYRM_COLORS.wingDark], [14, 9, WYRM_COLORS.wingDark], [15, 9, WYRM_COLORS.wingDark],

  // ===== 腿/爪（前腿 - 两侧从身体伸出向下）=====
  [5, 11, WYRM_COLORS.clawDark], [6, 11, WYRM_COLORS.claw], [13, 11, WYRM_COLORS.claw], [14, 11, WYRM_COLORS.clawDark],
  [5, 12, WYRM_COLORS.claw], [6, 12, WYRM_COLORS.claw], [13, 12, WYRM_COLORS.claw], [14, 12, WYRM_COLORS.claw],
  [5, 13, WYRM_COLORS.clawDark], [6, 13, WYRM_COLORS.clawDark], [13, 13, WYRM_COLORS.clawDark], [14, 13, WYRM_COLORS.clawDark],
  [5, 14, WYRM_COLORS.claw], [6, 14, WYRM_COLORS.claw], [13, 14, WYRM_COLORS.claw], [14, 14, WYRM_COLORS.claw],
  [5, 15, WYRM_COLORS.clawDark], [6, 15, WYRM_COLORS.clawDark], [13, 15, WYRM_COLORS.clawDark], [14, 15, WYRM_COLORS.clawDark],

  // ===== 腿/爪（后腿 - 靠里）=====
  [7, 13, WYRM_COLORS.clawDark], [8, 13, WYRM_COLORS.claw], [11, 13, WYRM_COLORS.claw], [12, 13, WYRM_COLORS.clawDark],
  [7, 14, WYRM_COLORS.claw], [8, 14, WYRM_COLORS.claw], [11, 14, WYRM_COLORS.claw], [12, 14, WYRM_COLORS.claw],
  [7, 15, WYRM_COLORS.clawDark], [8, 15, WYRM_COLORS.clawDark], [11, 15, WYRM_COLORS.clawDark], [12, 15, WYRM_COLORS.clawDark],

  // ===== 背部魔法/符文 =====
  [7, 7, WYRM_COLORS.rune], [12, 7, WYRM_COLORS.rune],
  [9, 8, WYRM_COLORS.magic], [10, 8, WYRM_COLORS.magicLight],
  [8, 9, WYRM_COLORS.magicLight], [11, 9, WYRM_COLORS.magic],
]

// 待机/呼吸动画帧（翅膀拍动 + 呼吸起伏）（已居中，x偏移+2）
const WYRM_IDLE_FRAMES = [
  // 帧0 - 翅膀略向下
  [
    { pixels: [
      [9, 12, WYRM_COLORS.belly], [10, 12, WYRM_COLORS.bellyLight],
      [7, 10, WYRM_COLORS.rune], [11, 10, WYRM_COLORS.rune],
    ] }
  ],
  // 帧1 - 翅膀略向上，发光强
  [
    { pixels: [
      [9, 12, WYRM_COLORS.bellyLight], [10, 12, WYRM_COLORS.bellyLight],
      [7, 10, WYRM_COLORS.magic], [11, 10, WYRM_COLORS.magic],
      [8, 15, WYRM_COLORS.spark], [10, 15, WYRM_COLORS.spark],
    ] }
  ],
]

// 行走/飞行动画帧（翅膀大幅拍动）（已居中，x偏移+2）
const WYRM_WALK_FRAMES = [
  // 帧0 - 翅膀向上
  [
    { pixels: [
      [4, 7, WYRM_COLORS.wingLight], [14, 7, WYRM_COLORS.wingLight],
      [9, 10, WYRM_COLORS.body], [10, 10, WYRM_COLORS.body],
    ] }
  ],
  // 帧1 - 翅膀平展
  [
    { pixels: [
      [3, 7, WYRM_COLORS.wing], [4, 7, WYRM_COLORS.wingLight], [14, 7, WYRM_COLORS.wingLight], [15, 7, WYRM_COLORS.wing],
      [9, 10, WYRM_COLORS.bodyLight], [10, 10, WYRM_COLORS.bodyLight],
    ] }
  ],
  // 帧2 - 翅膀向下
  [
    { pixels: [
      [4, 8, WYRM_COLORS.wing], [14, 8, WYRM_COLORS.wing],
      [5, 9, WYRM_COLORS.wingDark], [14, 9, WYRM_COLORS.wingDark],
      [9, 10, WYRM_COLORS.body], [10, 10, WYRM_COLORS.body],
      [9, 15, WYRM_COLORS.spark],
    ] }
  ],
]

export const drawFrostWyrm = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: WYRM_FACE_DOWN,
  up: WYRM_FACE_UP,
  left: WYRM_FACE_LEFT,
  right: WYRM_FACE_RIGHT,
  walk: WYRM_WALK_FRAMES,
  idle: WYRM_IDLE_FRAMES,
})

export const drawFrostWyrmAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, WYRM_AVATAR)