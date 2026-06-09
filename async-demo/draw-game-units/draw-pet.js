/**
 * 绘制宠物 - 可爱幼龙
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit pet 宠物位置
 * @param {Number} currentUnit.x 宠物x坐标
 * @param {Number} currentUnit.y 宠物y坐标
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

export const config = {
  IDLE_SPEED: 0.02,
  WALK_SPEED: 0.1,
}

// 可爱幼龙颜色定义
const DRAGON_COLORS = {
  // 身体主色（软萌紫蓝）
  body: '#9B8ACB',        // 主色
  bodyLight: '#B8A8DB',   // 亮色
  bodyDark: '#7A6AAB',    // 暗色
  bodyPink: '#E8C8D8',    // 肚皮粉

  // 鳍膜（透明感）
  fin: '#D8C8F0',         // 鳍膜
  finLight: '#E8E0F8',    // 鳍膜亮
  finDark: '#A898C0',     // 鳍膜暗

  // 眼睛（大而可爱）
  eye: '#5A4A8A',         // 眼色
  eyeLight: '#8A7AC0',    // 眼睛高光
  eyeWhite: '#FFFFFF',     // 眼白
  pupil: '#2A1A4A',       // 瞳孔
  pupilGlow: '#8060C0',   // 瞳孔发光

  // 可爱红晕
  blush: '#F0A0B0',        // 红晕
  blushLight: '#FFD0D8',   // 红晕亮

  // 小角
  horn: '#E8D8C0',        // 角
  hornDark: '#C8B8A0',    // 角暗
  hornTip: '#F8E8D0',     // 角尖

  // 翅膀
  wing: '#C8B8E0',        // 翅膀
  wingLight: '#E0D8F0',   // 翅膀亮
  wingDark: '#A898C8',    // 翅膀暗

  // 尾巴尖
  tailTip: '#F0A0B0',     // 尾巴尖粉色

  // 高光
  highlight: '#FFFFFF',    // 高光
  sparkle: '#FFE0F0',     // 闪亮
};

// ============================================================
// 向下面朝 - 幼龙正面（可爱大头）
const DRAGON_FACE_DOWN = [
  // ===== 头顶小角 =====
  [6, 0, DRAGON_COLORS.hornDark], [7, 0, DRAGON_COLORS.hornDark], [8, 0, DRAGON_COLORS.hornDark], [9, 0, DRAGON_COLORS.hornDark],
  [5, 1, DRAGON_COLORS.horn], [6, 1, DRAGON_COLORS.hornTip], [7, 1, DRAGON_COLORS.horn], [8, 1, DRAGON_COLORS.horn], [9, 1, DRAGON_COLORS.hornTip], [10, 1, DRAGON_COLORS.horn],
  [5, 2, DRAGON_COLORS.hornDark], [6, 2, DRAGON_COLORS.horn], [7, 2, DRAGON_COLORS.horn], [8, 2, DRAGON_COLORS.horn], [9, 2, DRAGON_COLORS.horn], [10, 2, DRAGON_COLORS.hornDark],

  // ===== 大脑袋（圆滚滚）=====
  [4, 3, DRAGON_COLORS.bodyLight], [5, 3, DRAGON_COLORS.bodyLight], [6, 3, DRAGON_COLORS.body], [7, 3, DRAGON_COLORS.body], [8, 3, DRAGON_COLORS.body], [9, 3, DRAGON_COLORS.body], [10, 3, DRAGON_COLORS.bodyLight], [11, 3, DRAGON_COLORS.bodyLight],
  [3, 4, DRAGON_COLORS.bodyLight], [4, 4, DRAGON_COLORS.body], [5, 4, DRAGON_COLORS.body], [6, 4, DRAGON_COLORS.bodyLight], [7, 4, DRAGON_COLORS.bodyLight], [8, 4, DRAGON_COLORS.bodyLight], [9, 4, DRAGON_COLORS.body], [10, 4, DRAGON_COLORS.body], [11, 4, DRAGON_COLORS.bodyLight], [12, 4, DRAGON_COLORS.bodyLight],
  [3, 5, DRAGON_COLORS.bodyLight], [4, 5, DRAGON_COLORS.body], [5, 5, DRAGON_COLORS.bodyLight], [6, 5, DRAGON_COLORS.body], [7, 5, DRAGON_COLORS.body], [8, 5, DRAGON_COLORS.body], [9, 5, DRAGON_COLORS.bodyLight], [10, 5, DRAGON_COLORS.body], [11, 5, DRAGON_COLORS.bodyLight], [12, 5, DRAGON_COLORS.bodyLight],

  // ===== 鳍状小耳朵 =====
  [2, 4, DRAGON_COLORS.fin], [2, 5, DRAGON_COLORS.finLight],
  [13, 4, DRAGON_COLORS.fin], [13, 5, DRAGON_COLORS.finLight],

  // ===== 大眼睛（超可爱）=====
  [4, 6, DRAGON_COLORS.bodyLight], [5, 6, DRAGON_COLORS.eyeWhite], [6, 6, DRAGON_COLORS.eyeWhite], [7, 6, DRAGON_COLORS.bodyDark], [8, 6, DRAGON_COLORS.bodyDark], [9, 6, DRAGON_COLORS.eyeWhite], [10, 6, DRAGON_COLORS.eyeWhite], [11, 6, DRAGON_COLORS.bodyLight],
  [4, 7, DRAGON_COLORS.eyeWhite], [5, 7, DRAGON_COLORS.eye], [6, 7, DRAGON_COLORS.eye], [7, 7, DRAGON_COLORS.pupil], [8, 7, DRAGON_COLORS.pupil], [9, 7, DRAGON_COLORS.eye], [10, 7, DRAGON_COLORS.eye], [11, 7, DRAGON_COLORS.eyeWhite],
  // 眼睛高光
  [5, 6, DRAGON_COLORS.highlight], [6, 6, DRAGON_COLORS.highlight], [9, 6, DRAGON_COLORS.highlight], [10, 6, DRAGON_COLORS.highlight],
  [5, 7, DRAGON_COLORS.sparkle], [10, 7, DRAGON_COLORS.sparkle],

  // ===== 可爱红晕 =====
  [3, 7, DRAGON_COLORS.blush], [4, 7, DRAGON_COLORS.blushLight],
  [11, 7, DRAGON_COLORS.blushLight], [12, 7, DRAGON_COLORS.blush],

  // ===== 嘴巴（微笑）=====
  [5, 8, DRAGON_COLORS.bodyDark], [6, 8, DRAGON_COLORS.bodyLight], [7, 8, DRAGON_COLORS.bodyLight], [8, 8, DRAGON_COLORS.bodyLight], [9, 8, DRAGON_COLORS.bodyLight], [10, 8, DRAGON_COLORS.bodyDark],
  [6, 9, DRAGON_COLORS.bodyPink], [7, 9, DRAGON_COLORS.bodyPink], [8, 9, DRAGON_COLORS.bodyPink], [9, 9, DRAGON_COLORS.bodyPink],

  // ===== 圆滚滚身体 =====
  [3, 10, DRAGON_COLORS.bodyDark], [4, 10, DRAGON_COLORS.body], [5, 10, DRAGON_COLORS.bodyLight], [6, 10, DRAGON_COLORS.bodyPink], [7, 10, DRAGON_COLORS.bodyPink], [8, 10, DRAGON_COLORS.bodyPink], [9, 10, DRAGON_COLORS.bodyPink], [10, 10, DRAGON_COLORS.bodyLight], [11, 10, DRAGON_COLORS.body], [12, 10, DRAGON_COLORS.bodyDark],
  [2, 11, DRAGON_COLORS.bodyDark], [3, 11, DRAGON_COLORS.body], [4, 11, DRAGON_COLORS.bodyLight], [5, 11, DRAGON_COLORS.bodyPink], [6, 11, DRAGON_COLORS.bodyPink], [7, 11, DRAGON_COLORS.bodyPink], [8, 11, DRAGON_COLORS.bodyPink], [9, 11, DRAGON_COLORS.bodyPink], [10, 11, DRAGON_COLORS.bodyLight], [11, 11, DRAGON_COLORS.body], [12, 11, DRAGON_COLORS.bodyDark],
  [2, 12, DRAGON_COLORS.bodyDark], [3, 12, DRAGON_COLORS.body], [4, 12, DRAGON_COLORS.bodyLight], [5, 12, DRAGON_COLORS.bodyLight], [6, 12, DRAGON_COLORS.body], [7, 12, DRAGON_COLORS.body], [8, 12, DRAGON_COLORS.body], [9, 12, DRAGON_COLORS.bodyLight], [10, 12, DRAGON_COLORS.bodyLight], [11, 12, DRAGON_COLORS.body], [12, 12, DRAGON_COLORS.bodyDark],

  // ===== 小爪子 =====
  [3, 13, DRAGON_COLORS.bodyDark], [4, 13, DRAGON_COLORS.bodyLight], [5, 13, DRAGON_COLORS.horn], [6, 13, DRAGON_COLORS.horn], [7, 13, DRAGON_COLORS.horn], [8, 13, DRAGON_COLORS.horn], [9, 13, DRAGON_COLORS.horn], [10, 13, DRAGON_COLORS.horn], [11, 13, DRAGON_COLORS.bodyLight], [12, 13, DRAGON_COLORS.bodyDark],
  [2, 14, DRAGON_COLORS.bodyDark], [3, 14, DRAGON_COLORS.bodyLight], [4, 14, DRAGON_COLORS.bodyLight], [5, 14, DRAGON_COLORS.hornDark], [6, 14, DRAGON_COLORS.hornDark], [7, 14, DRAGON_COLORS.hornDark], [8, 14, DRAGON_COLORS.hornDark], [9, 14, DRAGON_COLORS.hornDark], [10, 14, DRAGON_COLORS.hornDark], [11, 14, DRAGON_COLORS.bodyLight], [12, 14, DRAGON_COLORS.bodyLight], [13, 14, DRAGON_COLORS.bodyDark],

  // ===== 尾巴 =====
  [0, 12, DRAGON_COLORS.finDark], [1, 12, DRAGON_COLORS.fin],
  [0, 13, DRAGON_COLORS.fin], [1, 13, DRAGON_COLORS.finLight],
  [0, 14, DRAGON_COLORS.finDark], [1, 14, DRAGON_COLORS.tailTip], [2, 14, DRAGON_COLORS.tailTip],
  [0, 15, DRAGON_COLORS.fin], [1, 15, DRAGON_COLORS.tailTip],
];

// ============================================================
// 向左面朝 - 幼龙左侧
const DRAGON_FACE_LEFT = [
  // ===== 头顶小角 =====
  [6, 0, DRAGON_COLORS.hornDark], [7, 0, DRAGON_COLORS.hornDark], [8, 0, DRAGON_COLORS.hornTip],
  [5, 1, DRAGON_COLORS.horn], [6, 1, DRAGON_COLORS.horn], [7, 1, DRAGON_COLORS.hornTip], [8, 1, DRAGON_COLORS.horn], [9, 1, DRAGON_COLORS.hornDark],

  // ===== 大脑袋（左侧）=====
  [3, 2, DRAGON_COLORS.bodyLight], [4, 2, DRAGON_COLORS.body], [5, 2, DRAGON_COLORS.bodyLight], [6, 2, DRAGON_COLORS.body], [7, 2, DRAGON_COLORS.bodyLight], [8, 2, DRAGON_COLORS.body], [9, 2, DRAGON_COLORS.bodyDark],
  [2, 3, DRAGON_COLORS.bodyLight], [3, 3, DRAGON_COLORS.body], [4, 3, DRAGON_COLORS.bodyLight], [5, 3, DRAGON_COLORS.body], [6, 3, DRAGON_COLORS.bodyLight], [7, 3, DRAGON_COLORS.body], [8, 3, DRAGON_COLORS.bodyDark], [9, 3, DRAGON_COLORS.bodyDark],
  [2, 4, DRAGON_COLORS.bodyLight], [3, 4, DRAGON_COLORS.body], [4, 4, DRAGON_COLORS.bodyLight], [5, 4, DRAGON_COLORS.body], [6, 4, DRAGON_COLORS.bodyDark], [7, 4, DRAGON_COLORS.bodyDark], [8, 4, DRAGON_COLORS.bodyDark],

  // ===== 左鳍状耳朵 =====
  [1, 3, DRAGON_COLORS.fin], [1, 4, DRAGON_COLORS.finLight],

  // ===== 左侧大眼睛 =====
  [3, 5, DRAGON_COLORS.eyeWhite], [4, 5, DRAGON_COLORS.eye], [5, 5, DRAGON_COLORS.eye], [6, 5, DRAGON_COLORS.pupil], [7, 5, DRAGON_COLORS.bodyDark],
  [3, 6, DRAGON_COLORS.eyeWhite], [4, 6, DRAGON_COLORS.eye], [5, 6, DRAGON_COLORS.pupil], [6, 6, DRAGON_COLORS.pupil], [7, 6, DRAGON_COLORS.bodyDark],
  // 眼睛高光
  [4, 5, DRAGON_COLORS.highlight], [5, 5, DRAGON_COLORS.highlight],
  [4, 6, DRAGON_COLORS.sparkle],

  // ===== 左侧红晕 =====
  [2, 6, DRAGON_COLORS.blush], [2, 7, DRAGON_COLORS.blushLight],

  // ===== 微笑嘴 =====
  [4, 7, DRAGON_COLORS.bodyDark], [5, 7, DRAGON_COLORS.bodyLight], [6, 7, DRAGON_COLORS.bodyLight], [7, 7, DRAGON_COLORS.bodyDark],
  [5, 8, DRAGON_COLORS.bodyPink], [6, 8, DRAGON_COLORS.bodyPink],

  // ===== 身体左侧 =====
  [2, 9, DRAGON_COLORS.bodyDark], [3, 9, DRAGON_COLORS.body], [4, 9, DRAGON_COLORS.bodyLight], [5, 9, DRAGON_COLORS.bodyPink], [6, 9, DRAGON_COLORS.bodyPink], [7, 9, DRAGON_COLORS.bodyPink], [8, 9, DRAGON_COLORS.bodyDark],
  [1, 10, DRAGON_COLORS.bodyDark], [2, 10, DRAGON_COLORS.body], [3, 10, DRAGON_COLORS.bodyLight], [4, 10, DRAGON_COLORS.bodyLight], [5, 10, DRAGON_COLORS.bodyPink], [6, 10, DRAGON_COLORS.bodyPink], [7, 10, DRAGON_COLORS.bodyDark], [8, 10, DRAGON_COLORS.bodyDark], [9, 10, DRAGON_COLORS.bodyDark],
  [1, 11, DRAGON_COLORS.bodyDark], [2, 11, DRAGON_COLORS.body], [3, 11, DRAGON_COLORS.bodyLight], [4, 11, DRAGON_COLORS.bodyLight], [5, 11, DRAGON_COLORS.body], [6, 11, DRAGON_COLORS.bodyDark], [7, 11, DRAGON_COLORS.bodyDark], [8, 11, DRAGON_COLORS.bodyDark],

  // ===== 左后腿 =====
  [2, 12, DRAGON_COLORS.bodyDark], [3, 12, DRAGON_COLORS.bodyLight], [4, 12, DRAGON_COLORS.horn], [5, 12, DRAGON_COLORS.horn], [6, 12, DRAGON_COLORS.hornDark], [7, 12, DRAGON_COLORS.bodyDark],
  [1, 13, DRAGON_COLORS.bodyDark], [2, 13, DRAGON_COLORS.bodyLight], [3, 13, DRAGON_COLORS.hornDark], [4, 13, DRAGON_COLORS.hornDark], [5, 13, DRAGON_COLORS.hornDark], [6, 13, DRAGON_COLORS.bodyDark],

  // ===== 尾巴左侧 =====
  [0, 11, DRAGON_COLORS.finDark], [0, 12, DRAGON_COLORS.fin], [1, 12, DRAGON_COLORS.finLight],
  [0, 13, DRAGON_COLORS.finDark], [0, 14, DRAGON_COLORS.fin], [1, 14, DRAGON_COLORS.tailTip], [2, 14, DRAGON_COLORS.tailTip],
];

// ============================================================
// 向右面朝 - 幼龙右侧
const DRAGON_FACE_RIGHT = [
  // ===== 头顶小角 =====
  [7, 0, DRAGON_COLORS.hornTip], [8, 0, DRAGON_COLORS.hornDark], [9, 0, DRAGON_COLORS.hornDark],
  [6, 1, DRAGON_COLORS.horn], [7, 1, DRAGON_COLORS.hornTip], [8, 1, DRAGON_COLORS.horn], [9, 1, DRAGON_COLORS.horn], [10, 1, DRAGON_COLORS.horn],

  // ===== 大脑袋（右侧）=====
  [6, 2, DRAGON_COLORS.body], [7, 2, DRAGON_COLORS.bodyLight], [8, 2, DRAGON_COLORS.body], [9, 2, DRAGON_COLORS.bodyLight], [10, 2, DRAGON_COLORS.body], [11, 2, DRAGON_COLORS.bodyLight], [12, 2, DRAGON_COLORS.bodyLight],
  [6, 3, DRAGON_COLORS.bodyDark], [7, 3, DRAGON_COLORS.body], [8, 3, DRAGON_COLORS.bodyLight], [9, 3, DRAGON_COLORS.body], [10, 3, DRAGON_COLORS.bodyLight], [11, 3, DRAGON_COLORS.body], [12, 3, DRAGON_COLORS.bodyLight], [13, 3, DRAGON_COLORS.bodyLight],
  [7, 4, DRAGON_COLORS.bodyDark], [8, 4, DRAGON_COLORS.bodyDark], [9, 4, DRAGON_COLORS.bodyDark], [10, 4, DRAGON_COLORS.bodyLight], [11, 4, DRAGON_COLORS.body], [12, 4, DRAGON_COLORS.bodyLight], [13, 4, DRAGON_COLORS.bodyLight],

  // ===== 右鳍状耳朵 =====
  [14, 3, DRAGON_COLORS.finLight], [14, 4, DRAGON_COLORS.fin],

  // ===== 右侧大眼睛 =====
  [8, 5, DRAGON_COLORS.bodyDark], [9, 5, DRAGON_COLORS.pupil], [10, 5, DRAGON_COLORS.eye], [11, 5, DRAGON_COLORS.eye], [12, 5, DRAGON_COLORS.eyeWhite],
  [8, 6, DRAGON_COLORS.bodyDark], [9, 6, DRAGON_COLORS.pupil], [10, 6, DRAGON_COLORS.pupil], [11, 6, DRAGON_COLORS.eye], [12, 6, DRAGON_COLORS.eyeWhite],
  // 眼睛高光
  [10, 5, DRAGON_COLORS.highlight], [11, 5, DRAGON_COLORS.highlight],
  [11, 6, DRAGON_COLORS.sparkle],

  // ===== 右侧红晕 =====
  [13, 6, DRAGON_COLORS.blushLight], [13, 7, DRAGON_COLORS.blush],

  // ===== 微笑嘴 =====
  [8, 7, DRAGON_COLORS.bodyDark], [9, 7, DRAGON_COLORS.bodyLight], [10, 7, DRAGON_COLORS.bodyLight], [11, 7, DRAGON_COLORS.bodyDark],
  [9, 8, DRAGON_COLORS.bodyPink], [10, 8, DRAGON_COLORS.bodyPink],

  // ===== 身体右侧 =====
  [8, 9, DRAGON_COLORS.bodyDark], [9, 9, DRAGON_COLORS.bodyPink], [10, 9, DRAGON_COLORS.bodyPink], [11, 9, DRAGON_COLORS.bodyLight], [12, 9, DRAGON_COLORS.body], [13, 9, DRAGON_COLORS.bodyDark],
  [6, 10, DRAGON_COLORS.bodyDark], [7, 10, DRAGON_COLORS.bodyDark], [8, 10, DRAGON_COLORS.bodyDark], [9, 10, DRAGON_COLORS.bodyPink], [10, 10, DRAGON_COLORS.bodyPink], [11, 10, DRAGON_COLORS.bodyLight], [12, 10, DRAGON_COLORS.bodyLight], [13, 10, DRAGON_COLORS.body], [14, 10, DRAGON_COLORS.bodyDark],
  [8, 11, DRAGON_COLORS.bodyDark], [9, 11, DRAGON_COLORS.bodyDark], [10, 11, DRAGON_COLORS.body], [11, 11, DRAGON_COLORS.bodyLight], [12, 11, DRAGON_COLORS.bodyLight], [13, 11, DRAGON_COLORS.body], [14, 11, DRAGON_COLORS.bodyDark],

  // ===== 右后腿 =====
  [8, 12, DRAGON_COLORS.bodyDark], [9, 12, DRAGON_COLORS.hornDark], [10, 12, DRAGON_COLORS.horn], [11, 12, DRAGON_COLORS.horn], [12, 12, DRAGON_COLORS.bodyLight], [13, 12, DRAGON_COLORS.bodyDark],
  [8, 13, DRAGON_COLORS.bodyDark], [9, 13, DRAGON_COLORS.hornDark], [10, 13, DRAGON_COLORS.hornDark], [11, 13, DRAGON_COLORS.hornDark], [12, 13, DRAGON_COLORS.bodyLight], [13, 13, DRAGON_COLORS.bodyLight], [14, 13, DRAGON_COLORS.bodyDark],

  // ===== 尾巴右侧 =====
  [14, 11, DRAGON_COLORS.finDark], [15, 11, DRAGON_COLORS.fin], [15, 12, DRAGON_COLORS.finLight], [15, 12, DRAGON_COLORS.fin],
  [14, 13, DRAGON_COLORS.finDark], [14, 14, DRAGON_COLORS.tailTip], [15, 14, DRAGON_COLORS.fin],
];

// ============================================================
// 向上面朝 - 幼龙背面
const DRAGON_FACE_UP = [
  // ===== 头顶小角 =====
  [6, 0, DRAGON_COLORS.hornDark], [7, 0, DRAGON_COLORS.hornDark], [8, 0, DRAGON_COLORS.hornDark], [9, 0, DRAGON_COLORS.hornDark],
  [5, 1, DRAGON_COLORS.horn], [6, 1, DRAGON_COLORS.horn], [7, 1, DRAGON_COLORS.hornTip], [8, 1, DRAGON_COLORS.horn], [9, 1, DRAGON_COLORS.hornTip], [10, 1, DRAGON_COLORS.horn],
  [5, 2, DRAGON_COLORS.hornDark], [6, 2, DRAGON_COLORS.horn], [7, 2, DRAGON_COLORS.horn], [8, 2, DRAGON_COLORS.horn], [9, 2, DRAGON_COLORS.horn], [10, 2, DRAGON_COLORS.hornDark],

  // ===== 圆脑袋背部 =====
  [4, 3, DRAGON_COLORS.bodyLight], [5, 3, DRAGON_COLORS.body], [6, 3, DRAGON_COLORS.body], [7, 3, DRAGON_COLORS.body], [8, 3, DRAGON_COLORS.body], [9, 3, DRAGON_COLORS.body], [10, 3, DRAGON_COLORS.body], [11, 3, DRAGON_COLORS.bodyLight],
  [3, 4, DRAGON_COLORS.bodyLight], [4, 4, DRAGON_COLORS.body], [5, 4, DRAGON_COLORS.body], [6, 4, DRAGON_COLORS.bodyLight], [7, 4, DRAGON_COLORS.bodyLight], [8, 4, DRAGON_COLORS.bodyLight], [9, 4, DRAGON_COLORS.bodyLight], [10, 4, DRAGON_COLORS.body], [11, 4, DRAGON_COLORS.body], [12, 4, DRAGON_COLORS.bodyLight],
  [3, 5, DRAGON_COLORS.bodyLight], [4, 5, DRAGON_COLORS.body], [5, 5, DRAGON_COLORS.bodyLight], [6, 5, DRAGON_COLORS.body], [7, 5, DRAGON_COLORS.body], [8, 5, DRAGON_COLORS.body], [9, 5, DRAGON_COLORS.bodyLight], [10, 5, DRAGON_COLORS.body], [11, 5, DRAGON_COLORS.bodyLight], [12, 5, DRAGON_COLORS.bodyLight],

  // ===== 小背鳍 =====
  [6, 4, DRAGON_COLORS.fin], [7, 4, DRAGON_COLORS.finLight], [8, 4, DRAGON_COLORS.finLight], [9, 4, DRAGON_COLORS.fin],

  // ===== 身体背部 =====
  [3, 6, DRAGON_COLORS.bodyDark], [4, 6, DRAGON_COLORS.body], [5, 6, DRAGON_COLORS.bodyLight], [6, 6, DRAGON_COLORS.bodyLight], [7, 6, DRAGON_COLORS.bodyLight], [8, 6, DRAGON_COLORS.bodyLight], [9, 6, DRAGON_COLORS.bodyLight], [10, 6, DRAGON_COLORS.bodyLight], [11, 6, DRAGON_COLORS.body], [12, 6, DRAGON_COLORS.bodyDark],
  [2, 7, DRAGON_COLORS.bodyDark], [3, 7, DRAGON_COLORS.body], [4, 7, DRAGON_COLORS.bodyLight], [5, 7, DRAGON_COLORS.bodyLight], [6, 7, DRAGON_COLORS.bodyLight], [7, 7, DRAGON_COLORS.bodyLight], [8, 7, DRAGON_COLORS.bodyLight], [9, 7, DRAGON_COLORS.bodyLight], [10, 7, DRAGON_COLORS.bodyLight], [11, 7, DRAGON_COLORS.bodyLight], [12, 7, DRAGON_COLORS.body], [13, 7, DRAGON_COLORS.bodyDark],
  [2, 8, DRAGON_COLORS.bodyDark], [3, 8, DRAGON_COLORS.body], [4, 8, DRAGON_COLORS.bodyLight], [5, 8, DRAGON_COLORS.bodyLight], [6, 8, DRAGON_COLORS.body], [7, 8, DRAGON_COLORS.body], [8, 8, DRAGON_COLORS.body], [9, 8, DRAGON_COLORS.bodyLight], [10, 8, DRAGON_COLORS.bodyLight], [11, 8, DRAGON_COLORS.body], [12, 8, DRAGON_COLORS.bodyDark],

  // ===== 小爪子 =====
  [3, 9, DRAGON_COLORS.bodyDark], [4, 9, DRAGON_COLORS.bodyLight], [5, 9, DRAGON_COLORS.horn], [6, 9, DRAGON_COLORS.horn], [7, 9, DRAGON_COLORS.hornDark], [8, 9, DRAGON_COLORS.hornDark], [9, 9, DRAGON_COLORS.horn], [10, 9, DRAGON_COLORS.horn], [11, 9, DRAGON_COLORS.bodyLight], [12, 9, DRAGON_COLORS.bodyDark],
  [2, 10, DRAGON_COLORS.bodyDark], [3, 10, DRAGON_COLORS.bodyLight], [4, 10, DRAGON_COLORS.bodyLight], [5, 10, DRAGON_COLORS.hornDark], [6, 10, DRAGON_COLORS.hornDark], [7, 10, DRAGON_COLORS.hornDark], [8, 10, DRAGON_COLORS.hornDark], [9, 10, DRAGON_COLORS.hornDark], [10, 10, DRAGON_COLORS.hornDark], [11, 10, DRAGON_COLORS.bodyLight], [12, 10, DRAGON_COLORS.bodyLight], [13, 10, DRAGON_COLORS.bodyDark],

  // ===== 尾巴 =====
  [1, 8, DRAGON_COLORS.finDark], [0, 9, DRAGON_COLORS.fin], [0, 10, DRAGON_COLORS.finLight],
  [1, 9, DRAGON_COLORS.fin], [0, 11, DRAGON_COLORS.finDark], [0, 12, DRAGON_COLORS.fin], [1, 12, DRAGON_COLORS.tailTip],
  [1, 10, DRAGON_COLORS.finLight], [1, 11, DRAGON_COLORS.tailTip],
];

// ============================================================
// 待机动画帧
const IDLE_FRAMES = [
  { pixels: [] }, // 帧0：无变化
  { pixels: [] }, // 帧1：无变化
];

// ============================================================
// 行走动画帧
const WALK_FRAMES = [
  { pixels: [ // 帧0：左脚抬起
    [3, 14, DRAGON_COLORS.bodyLight], [4, 14, DRAGON_COLORS.bodyLight],
    [5, 13, DRAGON_COLORS.horn], [6, 13, DRAGON_COLORS.horn], [7, 13, DRAGON_COLORS.horn], [8, 13, DRAGON_COLORS.horn], [9, 13, DRAGON_COLORS.horn], [10, 13, DRAGON_COLORS.horn],
    [3, 14, DRAGON_COLORS.bodyDark], [4, 14, DRAGON_COLORS.bodyLight], [5, 14, DRAGON_COLORS.hornDark], [6, 14, DRAGON_COLORS.hornDark], [7, 14, DRAGON_COLORS.hornDark], [8, 14, DRAGON_COLORS.hornDark], [9, 14, DRAGON_COLORS.hornDark], [10, 14, DRAGON_COLORS.hornDark], [11, 14, DRAGON_COLORS.bodyLight], [12, 14, DRAGON_COLORS.bodyLight],
  ]},
  { pixels: [ // 帧1：右脚抬起
    [3, 13, DRAGON_COLORS.bodyDark], [4, 13, DRAGON_COLORS.bodyLight], [5, 13, DRAGON_COLORS.horn], [6, 13, DRAGON_COLORS.horn], [7, 13, DRAGON_COLORS.horn], [8, 13, DRAGON_COLORS.horn], [9, 13, DRAGON_COLORS.horn], [10, 13, DRAGON_COLORS.horn], [11, 13, DRAGON_COLORS.bodyLight], [12, 13, DRAGON_COLORS.bodyDark],
    [2, 14, DRAGON_COLORS.bodyDark], [3, 14, DRAGON_COLORS.bodyLight], [4, 14, DRAGON_COLORS.bodyLight], [5, 14, DRAGON_COLORS.hornDark], [6, 14, DRAGON_COLORS.hornDark], [7, 14, DRAGON_COLORS.hornDark], [8, 14, DRAGON_COLORS.hornDark], [9, 14, DRAGON_COLORS.hornDark], [10, 14, DRAGON_COLORS.hornDark], [11, 14, DRAGON_COLORS.bodyLight], [12, 14, DRAGON_COLORS.bodyLight], [13, 14, DRAGON_COLORS.bodyDark],
  ]},
];

// ============================================================
// 绘制函数
export const drawPet = (canvasRef, currentUnit) => {
  if (!canvasRef) return;
  const ctx = canvasRef.getContext('2d');
  const x = currentUnit.x;
  const y = currentUnit.y;
  const unit = currentUnit.size / 16;
  const direction = currentUnit.direction || 'down';
  const frame = currentUnit.frame || 0;

  ctx.imageSmoothingEnabled = false;

  const drawPixel = (px, py, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + px * unit, y + py * unit, unit, unit);
  };

  // 选择基础像素数据
  let basePixels = DRAGON_FACE_DOWN;
  if (direction === 'up') basePixels = DRAGON_FACE_UP;
  else if (direction === 'left') basePixels = DRAGON_FACE_LEFT;
  else if (direction === 'right') basePixels = DRAGON_FACE_RIGHT;

  // 绘制基础角色
  for (let i = 0; i < basePixels.length; i++) {
    drawPixel(basePixels[i][0], basePixels[i][1], basePixels[i][2]);
  }

  // 绘制腿部动画
  const isMoving = currentUnit.isMoving || false;
  const frames = isMoving ? WALK_FRAMES : IDLE_FRAMES;
  const frameIndex = Math.floor(frame) % frames.length;
  const currentFrame = frames[frameIndex];

  for (const pixel of currentFrame.pixels) {
    drawPixel(pixel[0], pixel[1], pixel[2]);
  }
};

// ============================================================
// 可爱幼龙头像（16x16）
const PET_AVATAR = [
  // ===== 头顶小角 =====
  [5, 0, DRAGON_COLORS.horn], [6, 0, DRAGON_COLORS.hornTip], [7, 0, DRAGON_COLORS.hornTip], [8, 0, DRAGON_COLORS.hornTip], [9, 0, DRAGON_COLORS.hornTip], [10, 0, DRAGON_COLORS.horn],
  [4, 1, DRAGON_COLORS.hornDark], [5, 1, DRAGON_COLORS.horn], [6, 1, DRAGON_COLORS.horn], [7, 1, DRAGON_COLORS.horn], [8, 1, DRAGON_COLORS.horn], [9, 1, DRAGON_COLORS.horn], [10, 1, DRAGON_COLORS.hornDark],

  // ===== 大脑袋 =====
  [3, 2, DRAGON_COLORS.bodyLight], [4, 2, DRAGON_COLORS.bodyLight], [5, 2, DRAGON_COLORS.body], [6, 2, DRAGON_COLORS.body], [7, 2, DRAGON_COLORS.body], [8, 2, DRAGON_COLORS.body], [9, 2, DRAGON_COLORS.body], [10, 2, DRAGON_COLORS.bodyLight], [11, 2, DRAGON_COLORS.bodyLight],
  [2, 3, DRAGON_COLORS.bodyLight], [3, 3, DRAGON_COLORS.body], [4, 3, DRAGON_COLORS.bodyLight], [5, 3, DRAGON_COLORS.bodyLight], [6, 3, DRAGON_COLORS.bodyLight], [7, 3, DRAGON_COLORS.bodyLight], [8, 3, DRAGON_COLORS.bodyLight], [9, 3, DRAGON_COLORS.bodyLight], [10, 3, DRAGON_COLORS.bodyLight], [11, 3, DRAGON_COLORS.bodyLight], [12, 3, DRAGON_COLORS.bodyLight],

  // ===== 鳍状耳朵 =====
  [1, 2, DRAGON_COLORS.finLight], [1, 3, DRAGON_COLORS.fin],
  [12, 2, DRAGON_COLORS.fin], [12, 3, DRAGON_COLORS.finLight],

  // ===== 超大眼睛 =====
  [3, 4, DRAGON_COLORS.eyeWhite], [4, 4, DRAGON_COLORS.eyeWhite], [5, 4, DRAGON_COLORS.eyeWhite], [6, 4, DRAGON_COLORS.eyeWhite], [7, 4, DRAGON_COLORS.eyeWhite], [8, 4, DRAGON_COLORS.eyeWhite], [9, 4, DRAGON_COLORS.eyeWhite], [10, 4, DRAGON_COLORS.eyeWhite], [11, 4, DRAGON_COLORS.eyeWhite],
  [3, 5, DRAGON_COLORS.eyeWhite], [4, 5, DRAGON_COLORS.eye], [5, 5, DRAGON_COLORS.eye], [6, 5, DRAGON_COLORS.eye], [7, 5, DRAGON_COLORS.eye], [8, 5, DRAGON_COLORS.eye], [9, 5, DRAGON_COLORS.eye], [10, 5, DRAGON_COLORS.eye], [11, 5, DRAGON_COLORS.eyeWhite],
  // 瞳孔
  [4, 5, DRAGON_COLORS.pupil], [5, 5, DRAGON_COLORS.pupil], [6, 5, DRAGON_COLORS.pupil], [7, 5, DRAGON_COLORS.pupil], [8, 5, DRAGON_COLORS.pupil], [9, 5, DRAGON_COLORS.pupil],
  // 高光
  [4, 4, DRAGON_COLORS.highlight], [5, 4, DRAGON_COLORS.highlight], [6, 4, DRAGON_COLORS.highlight], [8, 4, DRAGON_COLORS.highlight], [9, 4, DRAGON_COLORS.highlight], [10, 4, DRAGON_COLORS.highlight],
  [4, 5, DRAGON_COLORS.sparkle], [5, 5, DRAGON_COLORS.sparkle], [8, 5, DRAGON_COLORS.sparkle], [9, 5, DRAGON_COLORS.sparkle],

  // ===== 腮红 =====
  [2, 5, DRAGON_COLORS.blush], [2, 6, DRAGON_COLORS.blushLight],
  [11, 5, DRAGON_COLORS.blushLight], [11, 6, DRAGON_COLORS.blush],

  // ===== 眼睛下方 =====
  [3, 6, DRAGON_COLORS.eyeWhite], [4, 6, DRAGON_COLORS.eyeWhite], [5, 6, DRAGON_COLORS.eyeWhite], [6, 6, DRAGON_COLORS.eyeWhite], [7, 6, DRAGON_COLORS.eyeWhite], [8, 6, DRAGON_COLORS.eyeWhite], [9, 6, DRAGON_COLORS.eyeWhite], [10, 6, DRAGON_COLORS.eyeWhite], [11, 6, DRAGON_COLORS.eyeWhite],
  [4, 7, DRAGON_COLORS.bodyLight], [5, 7, DRAGON_COLORS.bodyLight], [6, 7, DRAGON_COLORS.bodyLight], [7, 7, DRAGON_COLORS.bodyLight], [8, 7, DRAGON_COLORS.bodyLight], [9, 7, DRAGON_COLORS.bodyLight], [10, 7, DRAGON_COLORS.bodyLight],

  // ===== 可爱微笑 =====
  [5, 8, DRAGON_COLORS.bodyDark], [6, 8, DRAGON_COLORS.bodyDark], [7, 8, DRAGON_COLORS.bodyDark], [8, 8, DRAGON_COLORS.bodyDark], [9, 8, DRAGON_COLORS.bodyDark],
  [6, 9, DRAGON_COLORS.bodyPink], [7, 9, DRAGON_COLORS.bodyPink], [8, 9, DRAGON_COLORS.bodyPink],

  // ===== 圆滚滚身体 =====
  [4, 10, DRAGON_COLORS.bodyDark], [5, 10, DRAGON_COLORS.bodyLight], [6, 10, DRAGON_COLORS.bodyPink], [7, 10, DRAGON_COLORS.bodyPink], [8, 10, DRAGON_COLORS.bodyPink], [9, 10, DRAGON_COLORS.bodyLight], [10, 10, DRAGON_COLORS.bodyDark],
  [3, 11, DRAGON_COLORS.bodyDark], [4, 11, DRAGON_COLORS.bodyLight], [5, 11, DRAGON_COLORS.bodyLight], [6, 11, DRAGON_COLORS.bodyLight], [7, 11, DRAGON_COLORS.bodyLight], [8, 11, DRAGON_COLORS.bodyLight], [9, 11, DRAGON_COLORS.bodyLight], [10, 11, DRAGON_COLORS.bodyLight], [11, 11, DRAGON_COLORS.bodyDark],

  // ===== 小爪子 =====
  [4, 12, DRAGON_COLORS.bodyLight], [5, 12, DRAGON_COLORS.horn], [6, 12, DRAGON_COLORS.horn], [7, 12, DRAGON_COLORS.horn], [8, 12, DRAGON_COLORS.horn], [9, 12, DRAGON_COLORS.horn], [10, 12, DRAGON_COLORS.bodyLight],
  [3, 13, DRAGON_COLORS.bodyLight], [4, 13, DRAGON_COLORS.hornDark], [5, 13, DRAGON_COLORS.hornDark], [6, 13, DRAGON_COLORS.hornDark], [7, 13, DRAGON_COLORS.hornDark], [8, 13, DRAGON_COLORS.hornDark], [9, 13, DRAGON_COLORS.hornDark], [10, 13, DRAGON_COLORS.bodyLight], [11, 13, DRAGON_COLORS.bodyLight],

  // ===== 尾巴 =====
  [1, 11, DRAGON_COLORS.finDark], [1, 12, DRAGON_COLORS.fin], [1, 13, DRAGON_COLORS.finLight],
  [0, 12, DRAGON_COLORS.fin], [0, 13, DRAGON_COLORS.finDark], [0, 14, DRAGON_COLORS.tailTip],
  [0, 15, DRAGON_COLORS.finLight],
];

export const drawPetAvatar = (canvasRef, currentUnit, avatarPos) => {
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

  for (let i = 0; i < PET_AVATAR.length; i++) {
    drawPixel(PET_AVATAR[i][0], PET_AVATAR[i][1], PET_AVATAR[i][2])
  }
}
