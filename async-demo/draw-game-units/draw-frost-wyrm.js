/**
 * 绘制冰霜巨龙怪物
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit 冰霜巨龙位置和状态
 * @param {Number} currentUnit.x 冰霜巨龙x坐标
 * @param {Number} currentUnit.y 冰霜巨龙y坐标
 * @param {Number} currentUnit.size 冰霜巨龙大小(px)
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

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

// 向左面朝 - 冰霜巨龙（头部在左，尾部在右）
const WYRM_FACE_LEFT = [
  // ===== 头部（最左侧）=====
  [0, 5, WYRM_COLORS.horn], [1, 5, WYRM_COLORS.horn],
  [0, 6, WYRM_COLORS.bodyLight], [1, 6, WYRM_COLORS.bodyLight], [2, 6, WYRM_COLORS.body],
  [0, 7, WYRM_COLORS.body], [1, 7, WYRM_COLORS.eye], [2, 7, WYRM_COLORS.eyeGlow], [3, 7, WYRM_COLORS.bodyLight],
  [0, 8, WYRM_COLORS.bodyDark], [1, 8, WYRM_COLORS.body], [2, 8, WYRM_COLORS.body], [3, 8, WYRM_COLORS.body], [4, 8, WYRM_COLORS.bodyLight],
  [1, 9, WYRM_COLORS.teeth], [2, 9, WYRM_COLORS.teeth], [3, 9, WYRM_COLORS.body], [4, 9, WYRM_COLORS.body], [5, 9, WYRM_COLORS.bodyLight],
  [1, 10, WYRM_COLORS.bodyDark], [2, 10, WYRM_COLORS.body], [3, 10, WYRM_COLORS.body], [4, 10, WYRM_COLORS.body], [5, 10, WYRM_COLORS.bodyLight],

  // ===== 颈部 =====
  [5, 7, WYRM_COLORS.bodyLight], [6, 7, WYRM_COLORS.body],
  [5, 8, WYRM_COLORS.body], [6, 8, WYRM_COLORS.bodyLight], [7, 8, WYRM_COLORS.body],
  [6, 9, WYRM_COLORS.body], [7, 9, WYRM_COLORS.bodyLight], [8, 9, WYRM_COLORS.body],
  [6, 10, WYRM_COLORS.bodyLight], [7, 10, WYRM_COLORS.body], [8, 10, WYRM_COLORS.bodyLight],

  // ===== 背部尖刺（上沿）=====
  [7, 6, WYRM_COLORS.spike],
  [8, 5, WYRM_COLORS.spike], [9, 5, WYRM_COLORS.spikeDark],
  [9, 6, WYRM_COLORS.spike], [10, 6, WYRM_COLORS.spikeDark],

  // ===== 身体（主体，占据中间大部分区域）=====
  [5, 11, WYRM_COLORS.body], [6, 11, WYRM_COLORS.body], [7, 11, WYRM_COLORS.bodyLight], [8, 11, WYRM_COLORS.body], [9, 11, WYRM_COLORS.bodyLight], [10, 11, WYRM_COLORS.body], [11, 11, WYRM_COLORS.bodyLight],
  [4, 12, WYRM_COLORS.bodyDark], [5, 12, WYRM_COLORS.body], [6, 12, WYRM_COLORS.body], [7, 12, WYRM_COLORS.bodyLight], [8, 12, WYRM_COLORS.body], [9, 12, WYRM_COLORS.bodyLight], [10, 12, WYRM_COLORS.body], [11, 12, WYRM_COLORS.body], [12, 12, WYRM_COLORS.bodyDark],

  // ===== 腹部/下部 =====
  [3, 13, WYRM_COLORS.bodyDark], [4, 13, WYRM_COLORS.belly], [5, 13, WYRM_COLORS.bellyLight], [6, 13, WYRM_COLORS.belly], [7, 13, WYRM_COLORS.bellyLight], [8, 13, WYRM_COLORS.belly], [9, 13, WYRM_COLORS.bellyLight], [10, 13, WYRM_COLORS.belly], [11, 13, WYRM_COLORS.bodyLight], [12, 13, WYRM_COLORS.bodyDark],
  [4, 14, WYRM_COLORS.belly], [5, 14, WYRM_COLORS.bellyLight], [6, 14, WYRM_COLORS.belly], [7, 14, WYRM_COLORS.bellyLight], [8, 14, WYRM_COLORS.belly], [9, 14, WYRM_COLORS.bellyLight], [10, 14, WYRM_COLORS.belly], [11, 14, WYRM_COLORS.body],

  // ===== 腿/爪（前部腿）=====
  [3, 11, WYRM_COLORS.body],
  [3, 12, WYRM_COLORS.bodyDark],
  [2, 13, WYRM_COLORS.clawDark], [3, 13, WYRM_COLORS.claw],
  [2, 14, WYRM_COLORS.claw], [3, 14, WYRM_COLORS.claw],
  [2, 15, WYRM_COLORS.clawDark], [3, 15, WYRM_COLORS.clawDark],

  // ===== 腿/爪（后部腿）=====
  [12, 11, WYRM_COLORS.body], [13, 11, WYRM_COLORS.bodyLight],
  [12, 12, WYRM_COLORS.body], [13, 12, WYRM_COLORS.bodyDark],
  [13, 13, WYRM_COLORS.claw], [14, 13, WYRM_COLORS.clawDark],
  [13, 14, WYRM_COLORS.claw], [14, 14, WYRM_COLORS.claw],
  [13, 15, WYRM_COLORS.clawDark], [14, 15, WYRM_COLORS.clawDark],

  // ===== 翅膀（翼）=====
  [6, 4, WYRM_COLORS.wingBone], [7, 4, WYRM_COLORS.wingLight], [8, 4, WYRM_COLORS.wing],
  [5, 5, WYRM_COLORS.wing], [6, 5, WYRM_COLORS.wingLight], [7, 5, WYRM_COLORS.wing], [8, 5, WYRM_COLORS.wingLight], [9, 5, WYRM_COLORS.wing], [10, 5, WYRM_COLORS.wingDark],
  [4, 6, WYRM_COLORS.wingDark], [5, 6, WYRM_COLORS.wing], [6, 6, WYRM_COLORS.wingLight], [7, 6, WYRM_COLORS.wing], [8, 6, WYRM_COLORS.wingLight], [9, 6, WYRM_COLORS.wing], [10, 6, WYRM_COLORS.wingDark], [11, 6, WYRM_COLORS.wingDark],
  [8, 7, WYRM_COLORS.wing], [9, 7, WYRM_COLORS.wingLight], [10, 7, WYRM_COLORS.wing], [11, 7, WYRM_COLORS.wingDark],
  [9, 8, WYRM_COLORS.wingDark], [10, 8, WYRM_COLORS.wing], [11, 8, WYRM_COLORS.wingDark],

  // ===== 尾巴（向右延伸）=====
  [11, 10, WYRM_COLORS.bodyLight], [12, 10, WYRM_COLORS.body],
  [12, 11, WYRM_COLORS.body], [13, 11, WYRM_COLORS.bodyDark],
  [13, 12, WYRM_COLORS.tail], [14, 12, WYRM_COLORS.tailDark],
  [13, 13, WYRM_COLORS.tailLight], [14, 13, WYRM_COLORS.tail],
  [14, 14, WYRM_COLORS.tail], [15, 14, WYRM_COLORS.tailDark],
  [14, 15, WYRM_COLORS.tailLight], [15, 15, WYRM_COLORS.tail],

  // ===== 冰霜呼吸（嘴前）=====
  [0, 8, WYRM_COLORS.frost], [0, 9, WYRM_COLORS.frostLight],
  [-1, 8, WYRM_COLORS.frostLight], [-1, 9, WYRM_COLORS.frost],

  // ===== 发光点 =====
  [7, 12, WYRM_COLORS.magic], [8, 12, WYRM_COLORS.magicLight],
]

// 向右面朝 - 镜像
const WYRM_FACE_RIGHT = [
  // ===== 头部（最右侧）=====
  [14, 5, WYRM_COLORS.horn], [15, 5, WYRM_COLORS.horn],
  [14, 6, WYRM_COLORS.bodyLight], [15, 6, WYRM_COLORS.bodyLight],
  [12, 7, WYRM_COLORS.bodyLight], [13, 7, WYRM_COLORS.eyeGlow], [14, 7, WYRM_COLORS.eye], [15, 7, WYRM_COLORS.body],
  [11, 8, WYRM_COLORS.bodyLight], [12, 8, WYRM_COLORS.body], [13, 8, WYRM_COLORS.body], [14, 8, WYRM_COLORS.body], [15, 8, WYRM_COLORS.bodyDark],
  [10, 9, WYRM_COLORS.bodyLight], [11, 9, WYRM_COLORS.body], [12, 9, WYRM_COLORS.body], [13, 9, WYRM_COLORS.teeth], [14, 9, WYRM_COLORS.teeth],
  [10, 10, WYRM_COLORS.bodyLight], [11, 10, WYRM_COLORS.body], [12, 10, WYRM_COLORS.body], [13, 10, WYRM_COLORS.body], [14, 10, WYRM_COLORS.bodyDark],

  // ===== 颈部 =====
  [9, 7, WYRM_COLORS.body], [10, 7, WYRM_COLORS.bodyLight],
  [8, 8, WYRM_COLORS.body], [9, 8, WYRM_COLORS.bodyLight], [10, 8, WYRM_COLORS.body],
  [7, 9, WYRM_COLORS.body], [8, 9, WYRM_COLORS.bodyLight], [9, 9, WYRM_COLORS.body],
  [7, 10, WYRM_COLORS.bodyLight], [8, 10, WYRM_COLORS.body], [9, 10, WYRM_COLORS.bodyLight],

  // ===== 背部尖刺（上沿）=====
  [8, 6, WYRM_COLORS.spike],
  [5, 5, WYRM_COLORS.spikeDark], [6, 5, WYRM_COLORS.spike],
  [4, 6, WYRM_COLORS.spikeDark], [5, 6, WYRM_COLORS.spike],

  // ===== 身体（主体）=====
  [4, 11, WYRM_COLORS.bodyLight], [5, 11, WYRM_COLORS.body], [6, 11, WYRM_COLORS.bodyLight], [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.bodyLight], [9, 11, WYRM_COLORS.body], [10, 11, WYRM_COLORS.bodyLight],
  [3, 12, WYRM_COLORS.bodyDark], [4, 12, WYRM_COLORS.body], [5, 12, WYRM_COLORS.bodyLight], [6, 12, WYRM_COLORS.body], [7, 12, WYRM_COLORS.bodyLight], [8, 12, WYRM_COLORS.body], [9, 12, WYRM_COLORS.bodyLight], [10, 12, WYRM_COLORS.body], [11, 12, WYRM_COLORS.bodyDark],

  // ===== 腹部/下部 =====
  [3, 13, WYRM_COLORS.bodyDark], [4, 13, WYRM_COLORS.belly], [5, 13, WYRM_COLORS.bellyLight], [6, 13, WYRM_COLORS.belly], [7, 13, WYRM_COLORS.bellyLight], [8, 13, WYRM_COLORS.belly], [9, 13, WYRM_COLORS.bellyLight], [10, 13, WYRM_COLORS.belly], [11, 13, WYRM_COLORS.bodyLight], [12, 13, WYRM_COLORS.bodyDark],
  [4, 14, WYRM_COLORS.belly], [5, 14, WYRM_COLORS.bellyLight], [6, 14, WYRM_COLORS.belly], [7, 14, WYRM_COLORS.bellyLight], [8, 14, WYRM_COLORS.belly], [9, 14, WYRM_COLORS.bellyLight], [10, 14, WYRM_COLORS.belly], [11, 14, WYRM_COLORS.body],

  // ===== 腿/爪（前部腿 - 右侧）=====
  [12, 11, WYRM_COLORS.body],
  [12, 12, WYRM_COLORS.bodyDark],
  [12, 13, WYRM_COLORS.claw], [13, 13, WYRM_COLORS.clawDark],
  [12, 14, WYRM_COLORS.claw], [13, 14, WYRM_COLORS.claw],
  [12, 15, WYRM_COLORS.clawDark], [13, 15, WYRM_COLORS.clawDark],

  // ===== 腿/爪（后部腿 - 左侧）=====
  [2, 11, WYRM_COLORS.bodyLight], [3, 11, WYRM_COLORS.body],
  [2, 12, WYRM_COLORS.body], [3, 12, WYRM_COLORS.bodyDark],
  [1, 13, WYRM_COLORS.clawDark], [2, 13, WYRM_COLORS.claw],
  [1, 14, WYRM_COLORS.claw], [2, 14, WYRM_COLORS.claw],
  [1, 15, WYRM_COLORS.clawDark], [2, 15, WYRM_COLORS.clawDark],

  // ===== 翅膀 =====
  [7, 4, WYRM_COLORS.wing], [8, 4, WYRM_COLORS.wingLight], [9, 4, WYRM_COLORS.wingBone],
  [5, 5, WYRM_COLORS.wingDark], [6, 5, WYRM_COLORS.wing], [7, 5, WYRM_COLORS.wingLight], [8, 5, WYRM_COLORS.wing], [9, 5, WYRM_COLORS.wingLight], [10, 5, WYRM_COLORS.wing],
  [4, 6, WYRM_COLORS.wingDark], [5, 6, WYRM_COLORS.wingDark], [6, 6, WYRM_COLORS.wing], [7, 6, WYRM_COLORS.wingLight], [8, 6, WYRM_COLORS.wing], [9, 6, WYRM_COLORS.wingLight], [10, 6, WYRM_COLORS.wing], [11, 6, WYRM_COLORS.wingDark],
  [4, 7, WYRM_COLORS.wingDark], [5, 7, WYRM_COLORS.wing], [6, 7, WYRM_COLORS.wingLight], [7, 7, WYRM_COLORS.wing], [8, 7, WYRM_COLORS.wingLight], [9, 7, WYRM_COLORS.wingDark],
  [4, 8, WYRM_COLORS.wingDark], [5, 8, WYRM_COLORS.wing], [6, 8, WYRM_COLORS.wingDark],

  // ===== 尾巴（向左延伸）=====
  [3, 10, WYRM_COLORS.body], [4, 10, WYRM_COLORS.bodyLight],
  [2, 11, WYRM_COLORS.bodyDark], [3, 11, WYRM_COLORS.body],
  [1, 12, WYRM_COLORS.tailDark], [2, 12, WYRM_COLORS.tail],
  [1, 13, WYRM_COLORS.tail], [0, 13, WYRM_COLORS.tailLight],
  [0, 14, WYRM_COLORS.tail], [1, 14, WYRM_COLORS.tailLight],
  [0, 15, WYRM_COLORS.tail], [1, 15, WYRM_COLORS.tailDark],

  // ===== 冰霜呼吸（嘴前 - 右侧）=====
  [15, 8, WYRM_COLORS.frost], [15, 9, WYRM_COLORS.frostLight],

  // ===== 发光点 =====
  [7, 12, WYRM_COLORS.magicLight], [8, 12, WYRM_COLORS.magic],
]

// 向下面朝 - 冰霜巨龙正面（头部朝下方）
const WYRM_FACE_DOWN = [
  // ===== 头部（下方）=====
  [5, 0, WYRM_COLORS.horn], [6, 0, WYRM_COLORS.horn], [9, 0, WYRM_COLORS.horn], [10, 0, WYRM_COLORS.horn],
  [4, 1, WYRM_COLORS.hornDark], [5, 1, WYRM_COLORS.bodyLight], [6, 1, WYRM_COLORS.body], [7, 1, WYRM_COLORS.body], [8, 1, WYRM_COLORS.body], [9, 1, WYRM_COLORS.bodyLight], [10, 1, WYRM_COLORS.body], [11, 1, WYRM_COLORS.hornDark],
  [3, 2, WYRM_COLORS.bodyLight], [4, 2, WYRM_COLORS.body], [5, 2, WYRM_COLORS.bodyLight], [6, 2, WYRM_COLORS.body], [7, 2, WYRM_COLORS.bodyLight], [8, 2, WYRM_COLORS.body], [9, 2, WYRM_COLORS.bodyLight], [10, 2, WYRM_COLORS.body], [11, 2, WYRM_COLORS.bodyLight],
  [3, 3, WYRM_COLORS.body], [4, 3, WYRM_COLORS.body], [5, 3, WYRM_COLORS.eye], [6, 3, WYRM_COLORS.eyeGlow], [7, 3, WYRM_COLORS.body], [8, 3, WYRM_COLORS.body], [9, 3, WYRM_COLORS.eyeGlow], [10, 3, WYRM_COLORS.eye], [11, 3, WYRM_COLORS.body], [12, 3, WYRM_COLORS.bodyDark],

  // ===== 鼻部/嘴部 =====
  [4, 4, WYRM_COLORS.body], [5, 4, WYRM_COLORS.body], [6, 4, WYRM_COLORS.bodyLight], [7, 4, WYRM_COLORS.bodyLight], [8, 4, WYRM_COLORS.bodyLight], [9, 4, WYRM_COLORS.body], [10, 4, WYRM_COLORS.body],
  [5, 5, WYRM_COLORS.bodyLight], [6, 5, WYRM_COLORS.body], [7, 5, WYRM_COLORS.body], [8, 5, WYRM_COLORS.body], [9, 5, WYRM_COLORS.bodyLight],
  [5, 6, WYRM_COLORS.teeth], [6, 5, WYRM_COLORS.teeth], [7, 5, WYRM_COLORS.teeth], [8, 5, WYRM_COLORS.teeth], [9, 6, WYRM_COLORS.teeth],
  [5, 7, WYRM_COLORS.teeth], [6, 6, WYRM_COLORS.teeth], [7, 6, WYRM_COLORS.body], [8, 6, WYRM_COLORS.teeth], [9, 7, WYRM_COLORS.teeth],
  [6, 7, WYRM_COLORS.bodyDark], [7, 7, WYRM_COLORS.body], [8, 7, WYRM_COLORS.bodyDark],

  // ===== 颈部 =====
  [4, 8, WYRM_COLORS.bodyLight], [5, 8, WYRM_COLORS.body], [6, 8, WYRM_COLORS.bodyLight], [7, 8, WYRM_COLORS.body], [8, 8, WYRM_COLORS.bodyLight], [9, 8, WYRM_COLORS.body], [10, 8, WYRM_COLORS.bodyLight], [11, 8, WYRM_COLORS.body],

  // ===== 身体/胸部（中央）=====
  [3, 9, WYRM_COLORS.body], [4, 9, WYRM_COLORS.bodyLight], [5, 9, WYRM_COLORS.body], [6, 9, WYRM_COLORS.bodyLight], [7, 9, WYRM_COLORS.body], [8, 9, WYRM_COLORS.bodyLight], [9, 9, WYRM_COLORS.body], [10, 9, WYRM_COLORS.bodyLight], [11, 9, WYRM_COLORS.body], [12, 9, WYRM_COLORS.bodyDark],
  [2, 10, WYRM_COLORS.bodyDark], [3, 10, WYRM_COLORS.body], [4, 10, WYRM_COLORS.body], [5, 10, WYRM_COLORS.bodyLight], [6, 10, WYRM_COLORS.body], [7, 10, WYRM_COLORS.bodyLight], [8, 10, WYRM_COLORS.body], [9, 10, WYRM_COLORS.bodyLight], [10, 10, WYRM_COLORS.body], [11, 10, WYRM_COLORS.body], [12, 10, WYRM_COLORS.bodyDark],
  [2, 11, WYRM_COLORS.bodyDark], [3, 11, WYRM_COLORS.body], [4, 11, WYRM_COLORS.bodyLight], [5, 11, WYRM_COLORS.body], [6, 11, WYRM_COLORS.bodyLight], [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.bodyLight], [9, 11, WYRM_COLORS.body], [10, 11, WYRM_COLORS.bodyLight], [11, 11, WYRM_COLORS.body], [12, 11, WYRM_COLORS.bodyDark],

  // ===== 腹部 =====
  [3, 12, WYRM_COLORS.bodyDark], [4, 12, WYRM_COLORS.belly], [5, 12, WYRM_COLORS.bellyLight], [6, 12, WYRM_COLORS.belly], [7, 12, WYRM_COLORS.bellyLight], [8, 12, WYRM_COLORS.belly], [9, 12, WYRM_COLORS.bellyLight], [10, 12, WYRM_COLORS.belly], [11, 12, WYRM_COLORS.bodyDark],
  [4, 13, WYRM_COLORS.belly], [5, 13, WYRM_COLORS.bellyLight], [6, 13, WYRM_COLORS.belly], [7, 13, WYRM_COLORS.bellyLight], [8, 13, WYRM_COLORS.belly], [9, 13, WYRM_COLORS.bellyLight], [10, 13, WYRM_COLORS.belly],
  [5, 14, WYRM_COLORS.belly], [6, 14, WYRM_COLORS.bellyLight], [7, 14, WYRM_COLORS.belly], [8, 14, WYRM_COLORS.bellyLight], [9, 14, WYRM_COLORS.belly],
  [6, 15, WYRM_COLORS.bellyLight], [7, 15, WYRM_COLORS.belly], [8, 15, WYRM_COLORS.bellyLight],

  // ===== 翅膀（两侧展开）=====
  [0, 6, WYRM_COLORS.wingDark], [1, 6, WYRM_COLORS.wing], [13, 6, WYRM_COLORS.wing], [14, 6, WYRM_COLORS.wingDark],
  [0, 7, WYRM_COLORS.wing], [1, 7, WYRM_COLORS.wingLight], [2, 7, WYRM_COLORS.wing], [12, 7, WYRM_COLORS.wing], [13, 7, WYRM_COLORS.wingLight], [14, 7, WYRM_COLORS.wing],
  [0, 8, WYRM_COLORS.wingDark], [1, 8, WYRM_COLORS.wing], [2, 8, WYRM_COLORS.wingLight], [12, 8, WYRM_COLORS.wingLight], [13, 8, WYRM_COLORS.wing], [14, 8, WYRM_COLORS.wingDark],
  [1, 9, WYRM_COLORS.wingDark], [2, 9, WYRM_COLORS.wing], [12, 9, WYRM_COLORS.wing], [13, 9, WYRM_COLORS.wingDark],

  // ===== 腿/爪（前腿 - 两侧）=====
  [1, 12, WYRM_COLORS.clawDark], [2, 12, WYRM_COLORS.claw], [12, 12, WYRM_COLORS.claw], [13, 12, WYRM_COLORS.clawDark],
  [1, 13, WYRM_COLORS.claw], [2, 13, WYRM_COLORS.claw], [12, 13, WYRM_COLORS.claw], [13, 13, WYRM_COLORS.claw],
  [1, 14, WYRM_COLORS.clawDark], [2, 14, WYRM_COLORS.clawDark], [12, 14, WYRM_COLORS.clawDark], [13, 14, WYRM_COLORS.clawDark],

  // ===== 发光/魔法点 =====
  [7, 10, WYRM_COLORS.magic], [6, 11, WYRM_COLORS.magicLight], [8, 11, WYRM_COLORS.magicLight],
  [5, 10, WYRM_COLORS.rune], [9, 10, WYRM_COLORS.rune],

  // ===== 尾巴（向上，绕到头部后面）=====
  [7, 0, WYRM_COLORS.tail], [8, 0, WYRM_COLORS.tailLight],
]

// 向上面朝 - 冰霜巨龙背面（头部朝上方）
const WYRM_FACE_UP = [
  // ===== 头部背面（上方）=====
  [5, 0, WYRM_COLORS.bodyDark], [6, 0, WYRM_COLORS.horn], [7, 0, WYRM_COLORS.horn], [8, 0, WYRM_COLORS.horn], [9, 0, WYRM_COLORS.horn], [10, 0, WYRM_COLORS.bodyDark],
  [4, 1, WYRM_COLORS.bodyLight], [5, 1, WYRM_COLORS.body], [6, 1, WYRM_COLORS.bodyLight], [7, 1, WYRM_COLORS.body], [8, 1, WYRM_COLORS.body], [9, 1, WYRM_COLORS.bodyLight], [10, 1, WYRM_COLORS.body], [11, 1, WYRM_COLORS.bodyLight],
  [3, 2, WYRM_COLORS.bodyLight], [4, 2, WYRM_COLORS.body], [5, 2, WYRM_COLORS.bodyLight], [6, 2, WYRM_COLORS.body], [7, 2, WYRM_COLORS.bodyLight], [8, 2, WYRM_COLORS.body], [9, 2, WYRM_COLORS.bodyLight], [10, 2, WYRM_COLORS.body], [11, 2, WYRM_COLORS.bodyLight],
  [3, 3, WYRM_COLORS.body], [4, 3, WYRM_COLORS.body], [5, 3, WYRM_COLORS.body], [6, 3, WYRM_COLORS.bodyLight], [7, 3, WYRM_COLORS.body], [8, 3, WYRM_COLORS.bodyLight], [9, 3, WYRM_COLORS.body], [10, 3, WYRM_COLORS.body], [11, 3, WYRM_COLORS.body], [12, 3, WYRM_COLORS.bodyDark],

  // ===== 颈部/背部尖刺 =====
  [5, 4, WYRM_COLORS.spike], [6, 4, WYRM_COLORS.spikeDark], [7, 4, WYRM_COLORS.spike], [8, 4, WYRM_COLORS.spikeDark], [9, 4, WYRM_COLORS.spike],
  [4, 5, WYRM_COLORS.body], [5, 5, WYRM_COLORS.bodyLight], [6, 5, WYRM_COLORS.body], [7, 5, WYRM_COLORS.bodyLight], [8, 5, WYRM_COLORS.body], [9, 5, WYRM_COLORS.bodyLight], [10, 5, WYRM_COLORS.body],

  // ===== 身体背部 =====
  [3, 6, WYRM_COLORS.bodyDark], [4, 6, WYRM_COLORS.body], [5, 6, WYRM_COLORS.bodyLight], [6, 6, WYRM_COLORS.body], [7, 6, WYRM_COLORS.bodyLight], [8, 6, WYRM_COLORS.body], [9, 6, WYRM_COLORS.bodyLight], [10, 6, WYRM_COLORS.body], [11, 6, WYRM_COLORS.bodyDark],
  [2, 7, WYRM_COLORS.bodyDark], [3, 7, WYRM_COLORS.body], [4, 7, WYRM_COLORS.body], [5, 7, WYRM_COLORS.bodyLight], [6, 7, WYRM_COLORS.body], [7, 7, WYRM_COLORS.bodyLight], [8, 7, WYRM_COLORS.body], [9, 7, WYRM_COLORS.bodyLight], [10, 7, WYRM_COLORS.body], [11, 7, WYRM_COLORS.body], [12, 7, WYRM_COLORS.bodyDark],
  [2, 8, WYRM_COLORS.bodyDark], [3, 8, WYRM_COLORS.body], [4, 8, WYRM_COLORS.bodyLight], [5, 8, WYRM_COLORS.body], [6, 8, WYRM_COLORS.bodyLight], [7, 8, WYRM_COLORS.body], [8, 8, WYRM_COLORS.bodyLight], [9, 8, WYRM_COLORS.body], [10, 8, WYRM_COLORS.bodyLight], [11, 8, WYRM_COLORS.body], [12, 8, WYRM_COLORS.bodyDark],
  [2, 9, WYRM_COLORS.bodyDark], [3, 9, WYRM_COLORS.body], [4, 9, WYRM_COLORS.body], [5, 9, WYRM_COLORS.bodyLight], [6, 9, WYRM_COLORS.body], [7, 9, WYRM_COLORS.bodyLight], [8, 9, WYRM_COLORS.body], [9, 9, WYRM_COLORS.bodyLight], [10, 9, WYRM_COLORS.body], [11, 9, WYRM_COLORS.body], [12, 9, WYRM_COLORS.bodyDark],

  // ===== 身体下部/臀部 =====
  [3, 10, WYRM_COLORS.body], [4, 10, WYRM_COLORS.bodyLight], [5, 10, WYRM_COLORS.body], [6, 10, WYRM_COLORS.bodyLight], [7, 10, WYRM_COLORS.body], [8, 10, WYRM_COLORS.bodyLight], [9, 10, WYRM_COLORS.body], [10, 10, WYRM_COLORS.bodyLight], [11, 10, WYRM_COLORS.body],
  [4, 11, WYRM_COLORS.body], [5, 11, WYRM_COLORS.body], [6, 11, WYRM_COLORS.bodyLight], [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.bodyLight], [9, 11, WYRM_COLORS.body], [10, 11, WYRM_COLORS.body],
  [5, 12, WYRM_COLORS.bodyDark], [6, 12, WYRM_COLORS.body], [7, 12, WYRM_COLORS.bodyLight], [8, 12, WYRM_COLORS.body], [9, 12, WYRM_COLORS.bodyDark],

  // ===== 尾巴（向下延伸）=====
  [6, 13, WYRM_COLORS.tail], [7, 13, WYRM_COLORS.tailLight], [8, 13, WYRM_COLORS.tail],
  [6, 14, WYRM_COLORS.tailDark], [7, 14, WYRM_COLORS.tail], [8, 14, WYRM_COLORS.tailDark],
  [7, 15, WYRM_COLORS.tail],

  // ===== 翅膀（两侧展开）=====
  [0, 5, WYRM_COLORS.wingDark], [1, 5, WYRM_COLORS.wing], [14, 5, WYRM_COLORS.wing], [15, 5, WYRM_COLORS.wingDark],
  [0, 6, WYRM_COLORS.wing], [1, 6, WYRM_COLORS.wingLight], [2, 6, WYRM_COLORS.wing], [13, 6, WYRM_COLORS.wing], [14, 6, WYRM_COLORS.wingLight], [15, 6, WYRM_COLORS.wing],
  [0, 7, WYRM_COLORS.wingDark], [1, 7, WYRM_COLORS.wing], [2, 7, WYRM_COLORS.wingLight], [13, 7, WYRM_COLORS.wingLight], [14, 7, WYRM_COLORS.wing], [15, 7, WYRM_COLORS.wingDark],
  [1, 8, WYRM_COLORS.wingDark], [2, 8, WYRM_COLORS.wing], [13, 8, WYRM_COLORS.wing], [14, 8, WYRM_COLORS.wingDark],
  [1, 9, WYRM_COLORS.wingDark], [2, 9, WYRM_COLORS.wingDark], [13, 9, WYRM_COLORS.wingDark], [14, 9, WYRM_COLORS.wingDark],

  // ===== 腿/爪（前腿 - 两侧从身体伸出向下）=====
  [3, 11, WYRM_COLORS.clawDark], [4, 11, WYRM_COLORS.claw], [11, 11, WYRM_COLORS.claw], [12, 11, WYRM_COLORS.clawDark],
  [3, 12, WYRM_COLORS.claw], [4, 12, WYRM_COLORS.claw], [11, 12, WYRM_COLORS.claw], [12, 12, WYRM_COLORS.claw],
  [3, 13, WYRM_COLORS.clawDark], [4, 13, WYRM_COLORS.clawDark], [11, 13, WYRM_COLORS.clawDark], [12, 13, WYRM_COLORS.clawDark],
  [3, 14, WYRM_COLORS.claw], [4, 14, WYRM_COLORS.claw], [11, 14, WYRM_COLORS.claw], [12, 14, WYRM_COLORS.claw],
  [3, 15, WYRM_COLORS.clawDark], [4, 15, WYRM_COLORS.clawDark], [11, 15, WYRM_COLORS.clawDark], [12, 15, WYRM_COLORS.clawDark],

  // ===== 腿/爪（后腿 - 靠里）=====
  [5, 13, WYRM_COLORS.clawDark], [6, 13, WYRM_COLORS.claw], [9, 13, WYRM_COLORS.claw], [10, 13, WYRM_COLORS.clawDark],
  [5, 14, WYRM_COLORS.claw], [6, 14, WYRM_COLORS.claw], [9, 14, WYRM_COLORS.claw], [10, 14, WYRM_COLORS.claw],
  [5, 15, WYRM_COLORS.clawDark], [6, 15, WYRM_COLORS.clawDark], [9, 15, WYRM_COLORS.clawDark], [10, 15, WYRM_COLORS.clawDark],

  // ===== 背部魔法/符文 =====
  [5, 7, WYRM_COLORS.rune], [10, 7, WYRM_COLORS.rune],
  [7, 8, WYRM_COLORS.magic], [8, 8, WYRM_COLORS.magicLight],
  [6, 9, WYRM_COLORS.magicLight], [9, 9, WYRM_COLORS.magic],
]

// 待机/呼吸动画帧（翅膀拍动 + 呼吸起伏）
const WYRM_IDLE_FRAMES = [
  // 帧0 - 翅膀略向下
  [
    { pixels: [
      [7, 12, WYRM_COLORS.belly], [8, 12, WYRM_COLORS.bellyLight],
      [5, 10, WYRM_COLORS.rune], [9, 10, WYRM_COLORS.rune],
    ] }
  ],
  // 帧1 - 翅膀略向上，发光强
  [
    { pixels: [
      [7, 12, WYRM_COLORS.bellyLight], [8, 12, WYRM_COLORS.bellyLight],
      [5, 10, WYRM_COLORS.magic], [9, 10, WYRM_COLORS.magic],
      [6, 15, WYRM_COLORS.spark], [8, 15, WYRM_COLORS.spark],
    ] }
  ],
]

// 行走/飞行动画帧（翅膀大幅拍动）
const WYRM_WALK_FRAMES = [
  // 帧0 - 翅膀向上
  [
    { pixels: [
      [2, 7, WYRM_COLORS.wingLight], [12, 7, WYRM_COLORS.wingLight],
      [7, 10, WYRM_COLORS.body], [8, 10, WYRM_COLORS.body],
    ] }
  ],
  // 帧1 - 翅膀平展
  [
    { pixels: [
      [1, 7, WYRM_COLORS.wing], [2, 7, WYRM_COLORS.wingLight], [12, 7, WYRM_COLORS.wingLight], [13, 7, WYRM_COLORS.wing],
      [7, 10, WYRM_COLORS.bodyLight], [8, 10, WYRM_COLORS.bodyLight],
    ] }
  ],
  // 帧2 - 翅膀向下
  [
    { pixels: [
      [2, 8, WYRM_COLORS.wing], [12, 8, WYRM_COLORS.wing],
      [3, 9, WYRM_COLORS.wingDark], [12, 9, WYRM_COLORS.wingDark],
      [7, 10, WYRM_COLORS.body], [8, 10, WYRM_COLORS.body],
      [7, 15, WYRM_COLORS.spark],
    ] }
  ],
]

export const drawFrostWyrm = (canvasRef, currentUnit) => {
  if (!canvasRef) return
  const ctx = canvasRef.getContext('2d')
  const x = currentUnit.x
  const y = currentUnit.y
  const unit = currentUnit.size / 16
  const direction = currentUnit.direction || 'left'
  const frame = currentUnit.frame || 0

  ctx.imageSmoothingEnabled = false

  const drawPixel = (px, py, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x + px * unit, y + py * unit, unit, unit)
  }

  // 选择基础像素数据
  let basePixels = WYRM_FACE_LEFT
  if (direction === 'up') basePixels = WYRM_FACE_UP
  else if (direction === 'down') basePixels = WYRM_FACE_DOWN
  else if (direction === 'right') basePixels = WYRM_FACE_RIGHT

  // 绘制基础角色
  for (let i = 0; i < basePixels.length; i++) {
    drawPixel(basePixels[i][0], basePixels[i][1], basePixels[i][2])
  }

  // 绘制动画层
  const isMoving = currentUnit.isMoving || false
  const frames = isMoving ? WYRM_WALK_FRAMES : WYRM_IDLE_FRAMES
  const frameIndex = Math.floor(frame) % frames.length
  const currentFrame = frames[frameIndex]

  for (const layer of currentFrame) {
    for (const pixel of layer.pixels) {
      drawPixel(pixel[0], pixel[1], pixel[2])
    }
  }
}

export const drawFrostWyrmAvatar = (canvasRef, currentUnit, avatarPos) => {
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

  for (let i = 0; i < WYRM_AVATAR.length; i++) {
    drawPixel(WYRM_AVATAR[i][0], WYRM_AVATAR[i][1], WYRM_AVATAR[i][2])
  }
}