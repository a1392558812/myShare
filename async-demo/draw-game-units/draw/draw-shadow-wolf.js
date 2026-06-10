import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.005, // 待机动画速度
  WALK_SPEED: 0.08,  // 行走动画速度
}

// 影狼颜色定义（紫黑色调，带紫色发光元素）
const WOLF_COLORS = {
  fur: '#1a1a2e',        // 主毛色 - 深紫黑
  furDark: '#0f0f1a',    // 深色毛
  furLight: '#2d2d4a',   // 浅毛
  belly: '#3a3a5c',      // 腹部颜色
  bellyLight: '#4a4a7c', // 腹部亮色
  eye: '#ff0066',        // 眼睛粉红
  eyeGlow: '#ff3385',    // 眼睛发光
  nose: '#1a1a2e',       // 鼻子
  teeth: '#f0f0f0',      // 牙齿
  tongue: '#cc3366',     // 舌头
  paw: '#0f0f1a',        // 爪子
  claw: '#2d2d4a',       // 爪尖
  glow: '#6633ff',       // 紫色发光效果
  glowLight: '#9966ff',  // 紫色亮发光
  tailTip: '#6633ff',    // 尾巴尖紫色
  earInner: '#3a3a5c',   // 耳朵内侧
  earOuter: '#1a1a2e',   // 耳朵外侧
  highlight: '#ffffff',   // 高光
}

// 影狼高精度头像（16x16网格，聚焦头部特写）
const WOLF_AVATAR = [
  // ===== 耳朵（顶部）=====
  [3, 0, WOLF_COLORS.earOuter], [4, 0, WOLF_COLORS.earOuter], [11, 0, WOLF_COLORS.earOuter], [12, 0, WOLF_COLORS.earOuter],
  [2, 1, WOLF_COLORS.earOuter], [3, 1, WOLF_COLORS.earInner], [4, 1, WOLF_COLORS.earInner], [11, 1, WOLF_COLORS.earInner], [12, 1, WOLF_COLORS.earInner], [13, 1, WOLF_COLORS.earOuter],
  [2, 2, WOLF_COLORS.earOuter], [3, 2, WOLF_COLORS.earInner], [4, 2, WOLF_COLORS.earInner], [11, 2, WOLF_COLORS.earInner], [12, 2, WOLF_COLORS.earInner], [13, 2, WOLF_COLORS.earOuter],
  [2, 3, WOLF_COLORS.earOuter], [3, 3, WOLF_COLORS.earInner], [4, 3, WOLF_COLORS.earInner], [11, 3, WOLF_COLORS.earInner], [12, 3, WOLF_COLORS.earInner], [13, 3, WOLF_COLORS.earOuter],

  // ===== 头顶毛发 ======
  [4, 2, WOLF_COLORS.furLight], [5, 2, WOLF_COLORS.furLight], [6, 2, WOLF_COLORS.fur], [7, 2, WOLF_COLORS.fur], [8, 2, WOLF_COLORS.fur], [9, 2, WOLF_COLORS.furLight], [10, 2, WOLF_COLORS.furLight], [11, 2, WOLF_COLORS.furLight],
  [3, 3, WOLF_COLORS.fur], [4, 3, WOLF_COLORS.furLight], [5, 3, WOLF_COLORS.fur], [6, 3, WOLF_COLORS.furLight], [7, 3, WOLF_COLORS.fur], [8, 3, WOLF_COLORS.furLight], [9, 3, WOLF_COLORS.fur], [10, 3, WOLF_COLORS.furLight], [11, 3, WOLF_COLORS.fur], [12, 3, WOLF_COLORS.fur],

  // ===== 头部两侧毛发 =====
  [2, 4, WOLF_COLORS.furDark], [3, 4, WOLF_COLORS.fur], [4, 4, WOLF_COLORS.fur], [5, 4, WOLF_COLORS.furLight], [6, 4, WOLF_COLORS.fur], [7, 4, WOLF_COLORS.fur], [8, 4, WOLF_COLORS.furLight], [9, 4, WOLF_COLORS.fur], [10, 4, WOLF_COLORS.furLight], [11, 4, WOLF_COLORS.fur], [12, 4, WOLF_COLORS.fur], [13, 4, WOLF_COLORS.furDark],

  // ===== 眼睛行 =====
  [2, 5, WOLF_COLORS.furDark], [3, 5, WOLF_COLORS.fur], [4, 5, WOLF_COLORS.eye], [5, 5, WOLF_COLORS.fur], [6, 5, WOLF_COLORS.furLight], [7, 5, WOLF_COLORS.fur], [8, 5, WOLF_COLORS.furLight], [9, 5, WOLF_COLORS.fur], [10, 5, WOLF_COLORS.furLight], [11, 5, WOLF_COLORS.eye], [12, 5, WOLF_COLORS.fur], [13, 5, WOLF_COLORS.furDark],
  // 眼睛高光
  [4, 4, WOLF_COLORS.highlight], [5, 4, WOLF_COLORS.highlight], [10, 4, WOLF_COLORS.highlight], [11, 4, WOLF_COLORS.highlight],
  // 眼睛发光效果
  [4, 5, WOLF_COLORS.eyeGlow], [5, 5, WOLF_COLORS.eyeGlow], [10, 5, WOLF_COLORS.eyeGlow], [11, 5, WOLF_COLORS.eyeGlow],

  // ===== 鼻子区域 =====
  [3, 6, WOLF_COLORS.fur], [4, 6, WOLF_COLORS.fur], [5, 6, WOLF_COLORS.nose], [6, 6, WOLF_COLORS.nose], [7, 6, WOLF_COLORS.nose], [8, 6, WOLF_COLORS.nose], [9, 6, WOLF_COLORS.nose], [10, 6, WOLF_COLORS.nose], [11, 6, WOLF_COLORS.fur], [12, 6, WOLF_COLORS.fur],
  [4, 7, WOLF_COLORS.fur], [5, 7, WOLF_COLORS.nose], [6, 7, WOLF_COLORS.nose], [7, 7, WOLF_COLORS.nose], [8, 7, WOLF_COLORS.nose], [9, 7, WOLF_COLORS.nose], [10, 7, WOLF_COLORS.fur],

  // ===== 嘴巴 + 牙齿 =====
  [3, 8, WOLF_COLORS.furDark], [4, 8, WOLF_COLORS.teeth], [5, 8, WOLF_COLORS.teeth], [6, 8, WOLF_COLORS.teeth], [7, 8, WOLF_COLORS.tongue], [8, 8, WOLF_COLORS.tongue], [9, 8, WOLF_COLORS.teeth], [10, 8, WOLF_COLORS.teeth], [11, 8, WOLF_COLORS.teeth], [12, 8, WOLF_COLORS.furDark],
  [4, 9, WOLF_COLORS.teeth], [5, 9, WOLF_COLORS.teeth], [6, 9, WOLF_COLORS.teeth], [7, 9, WOLF_COLORS.tongue], [8, 9, WOLF_COLORS.tongue], [9, 9, WOLF_COLORS.teeth], [10, 9, WOLF_COLORS.teeth], [11, 9, WOLF_COLORS.teeth],
  [5, 10, WOLF_COLORS.teeth], [6, 10, WOLF_COLORS.tongue], [7, 10, WOLF_COLORS.tongue], [8, 10, WOLF_COLORS.tongue], [9, 10, WOLF_COLORS.teeth], [10, 10, WOLF_COLORS.teeth],

  // ===== 下巴毛发 =====
  [4, 11, WOLF_COLORS.furDark], [5, 11, WOLF_COLORS.fur], [6, 11, WOLF_COLORS.fur], [7, 11, WOLF_COLORS.fur], [8, 11, WOLF_COLORS.fur], [9, 11, WOLF_COLORS.fur], [10, 11, WOLF_COLORS.fur], [11, 11, WOLF_COLORS.furDark],
  [5, 12, WOLF_COLORS.fur], [6, 12, WOLF_COLORS.furDark], [7, 12, WOLF_COLORS.furDark], [8, 12, WOLF_COLORS.furDark], [9, 12, WOLF_COLORS.fur], [10, 12, WOLF_COLORS.fur],

  // ===== 颈部毛发 =====
  [4, 13, WOLF_COLORS.fur], [5, 13, WOLF_COLORS.furLight], [6, 13, WOLF_COLORS.fur], [7, 13, WOLF_COLORS.fur], [8, 13, WOLF_COLORS.fur], [9, 13, WOLF_COLORS.furLight], [10, 13, WOLF_COLORS.fur],
  [5, 14, WOLF_COLORS.furDark], [6, 14, WOLF_COLORS.fur], [7, 14, WOLF_COLORS.furLight], [8, 14, WOLF_COLORS.furLight], [9, 14, WOLF_COLORS.fur], [10, 14, WOLF_COLORS.furDark],

  // ===== 紫色发光装饰 =====
  [3, 5, WOLF_COLORS.glow], [12, 5, WOLF_COLORS.glow],
  [4, 6, WOLF_COLORS.glowLight], [11, 6, WOLF_COLORS.glowLight],
  [5, 7, WOLF_COLORS.glow], [10, 7, WOLF_COLORS.glow],
  [6, 8, WOLF_COLORS.glowLight], [9, 8, WOLF_COLORS.glowLight],
]

// ============================================================
// 向左面朝 - 狼左侧（头部在左，尾巴在右）
// x范围: 0-13，y范围: 0-15
// 0-3行: 耳朵 + 头顶
// 4-7行: 头部 + 身体上部
// 8-12行: 身体主体
// 13-15行: 腿 + 爪
// ============================================================
const WOLF_FACE_LEFT = [
  // ===== 耳朵（头部左上方）=====
  [2, 0, WOLF_COLORS.earOuter], [3, 0, WOLF_COLORS.earOuter],
  [1, 1, WOLF_COLORS.earOuter], [2, 1, WOLF_COLORS.earInner], [3, 1, WOLF_COLORS.earInner], [4, 1, WOLF_COLORS.earOuter],
  [1, 2, WOLF_COLORS.earOuter], [2, 2, WOLF_COLORS.earInner], [3, 2, WOLF_COLORS.earInner], [4, 2, WOLF_COLORS.earOuter],

  // ===== 头部（左）=====
  [0, 3, WOLF_COLORS.furDark], [1, 3, WOLF_COLORS.fur], [2, 3, WOLF_COLORS.furLight], [3, 3, WOLF_COLORS.fur], [4, 3, WOLF_COLORS.fur], [5, 3, WOLF_COLORS.furLight],
  [0, 4, WOLF_COLORS.fur], [1, 4, WOLF_COLORS.fur], [2, 4, WOLF_COLORS.furLight], [3, 4, WOLF_COLORS.eye], [4, 4, WOLF_COLORS.fur], [5, 4, WOLF_COLORS.fur],
  [0, 5, WOLF_COLORS.furDark], [1, 5, WOLF_COLORS.nose], [2, 5, WOLF_COLORS.fur], [3, 5, WOLF_COLORS.fur], [4, 5, WOLF_COLORS.fur], [5, 5, WOLF_COLORS.fur],
  [0, 6, WOLF_COLORS.furDark], [1, 6, WOLF_COLORS.teeth], [2, 6, WOLF_COLORS.teeth], [3, 6, WOLF_COLORS.tongue], [4, 6, WOLF_COLORS.teeth], [5, 6, WOLF_COLORS.fur],

  // ===== 颈部衔接 =====
  [3, 7, WOLF_COLORS.fur], [4, 7, WOLF_COLORS.fur], [5, 7, WOLF_COLORS.furLight], [6, 7, WOLF_COLORS.fur],
  [3, 8, WOLF_COLORS.furDark], [4, 8, WOLF_COLORS.fur], [5, 8, WOLF_COLORS.fur], [6, 8, WOLF_COLORS.furLight], [7, 8, WOLF_COLORS.fur],

  // ===== 身体前部（胸+腹上部）=====
  [3, 9, WOLF_COLORS.fur], [4, 9, WOLF_COLORS.fur], [5, 9, WOLF_COLORS.bellyLight], [6, 9, WOLF_COLORS.belly], [7, 9, WOLF_COLORS.bellyLight], [8, 9, WOLF_COLORS.fur],
  [2, 10, WOLF_COLORS.fur], [3, 10, WOLF_COLORS.fur], [4, 10, WOLF_COLORS.bellyLight], [5, 10, WOLF_COLORS.belly], [6, 10, WOLF_COLORS.bellyLight], [7, 10, WOLF_COLORS.belly], [8, 10, WOLF_COLORS.fur], [9, 10, WOLF_COLORS.fur],

  // ===== 身体中部（腹部主区）=====
  [2, 11, WOLF_COLORS.furDark], [3, 11, WOLF_COLORS.fur], [4, 11, WOLF_COLORS.belly], [5, 11, WOLF_COLORS.bellyLight], [6, 11, WOLF_COLORS.belly], [7, 11, WOLF_COLORS.bellyLight], [8, 11, WOLF_COLORS.belly], [9, 11, WOLF_COLORS.fur], [10, 11, WOLF_COLORS.furDark],
  [2, 12, WOLF_COLORS.furDark], [3, 12, WOLF_COLORS.fur], [4, 12, WOLF_COLORS.bellyLight], [5, 12, WOLF_COLORS.belly], [6, 12, WOLF_COLORS.bellyLight], [7, 12, WOLF_COLORS.belly], [8, 12, WOLF_COLORS.bellyLight], [9, 12, WOLF_COLORS.fur], [10, 12, WOLF_COLORS.furDark],

  // ===== 身体后部（臀部 + 尾巴根）=====
  [3, 13, WOLF_COLORS.fur], [4, 13, WOLF_COLORS.fur], [5, 13, WOLF_COLORS.belly], [6, 13, WOLF_COLORS.bellyLight], [7, 13, WOLF_COLORS.belly], [8, 13, WOLF_COLORS.fur], [9, 13, WOLF_COLORS.fur], [10, 13, WOLF_COLORS.furDark],
  [4, 14, WOLF_COLORS.fur], [5, 14, WOLF_COLORS.fur], [6, 14, WOLF_COLORS.belly], [7, 14, WOLF_COLORS.fur], [8, 14, WOLF_COLORS.fur], [9, 14, WOLF_COLORS.furDark],

  // ===== 尾巴（向右上翘起，带紫色尖端）=====
  [10, 9, WOLF_COLORS.fur], [11, 9, WOLF_COLORS.furDark],
  [11, 8, WOLF_COLORS.fur], [12, 8, WOLF_COLORS.furDark],
  [11, 7, WOLF_COLORS.fur], [12, 7, WOLF_COLORS.glow], [13, 7, WOLF_COLORS.tailTip],
  [12, 6, WOLF_COLORS.glow], [13, 6, WOLF_COLORS.glowLight],
  [12, 5, WOLF_COLORS.tailTip],

  // ===== 紫色发光装饰 =====
  [3, 5, WOLF_COLORS.eyeGlow],  // 眼睛发光

  // ===== 腿（在身体下方，动画层会覆盖）=====
  // 前腿位置（x: 3-4, y: 13-15）
  [3, 13, WOLF_COLORS.fur], [4, 13, WOLF_COLORS.furDark],
  [3, 14, WOLF_COLORS.paw], [4, 14, WOLF_COLORS.paw],
  [3, 15, WOLF_COLORS.claw], [4, 15, WOLF_COLORS.claw],
  // 后腿位置（x: 8-9, y: 13-15）
  [8, 13, WOLF_COLORS.fur], [9, 13, WOLF_COLORS.furDark],
  [8, 14, WOLF_COLORS.paw], [9, 14, WOLF_COLORS.paw],
  [8, 15, WOLF_COLORS.claw], [9, 15, WOLF_COLORS.claw],
]

// ============================================================
// 向右面朝 - 狼右侧（头部在右，尾巴在左）
// ============================================================
const WOLF_FACE_RIGHT = [
  // ===== 耳朵（头部右上方）=====
  [12, 0, WOLF_COLORS.earOuter], [13, 0, WOLF_COLORS.earOuter],
  [11, 1, WOLF_COLORS.earOuter], [12, 1, WOLF_COLORS.earInner], [13, 1, WOLF_COLORS.earInner], [14, 1, WOLF_COLORS.earOuter],
  [11, 2, WOLF_COLORS.earOuter], [12, 2, WOLF_COLORS.earInner], [13, 2, WOLF_COLORS.earInner], [14, 2, WOLF_COLORS.earOuter],

  // ===== 头部（右）=====
  [10, 3, WOLF_COLORS.furLight], [11, 3, WOLF_COLORS.fur], [12, 3, WOLF_COLORS.furLight], [13, 3, WOLF_COLORS.fur], [14, 3, WOLF_COLORS.fur], [15, 3, WOLF_COLORS.furDark],
  [10, 4, WOLF_COLORS.fur], [11, 4, WOLF_COLORS.fur], [12, 4, WOLF_COLORS.eye], [13, 4, WOLF_COLORS.furLight], [14, 4, WOLF_COLORS.fur], [15, 4, WOLF_COLORS.fur],
  [10, 5, WOLF_COLORS.fur], [11, 5, WOLF_COLORS.fur], [12, 5, WOLF_COLORS.fur], [13, 5, WOLF_COLORS.fur], [14, 5, WOLF_COLORS.nose], [15, 5, WOLF_COLORS.furDark],
  [10, 6, WOLF_COLORS.fur], [11, 6, WOLF_COLORS.teeth], [12, 6, WOLF_COLORS.tongue], [13, 6, WOLF_COLORS.teeth], [14, 6, WOLF_COLORS.fur], [15, 6, WOLF_COLORS.furDark],

  // ===== 颈部衔接 =====
  [9, 7, WOLF_COLORS.fur], [10, 7, WOLF_COLORS.furLight], [11, 7, WOLF_COLORS.fur], [12, 7, WOLF_COLORS.fur],
  [8, 8, WOLF_COLORS.fur], [9, 8, WOLF_COLORS.furLight], [10, 8, WOLF_COLORS.fur], [11, 8, WOLF_COLORS.fur], [12, 8, WOLF_COLORS.furDark],

  // ===== 身体前部（胸+腹上部）=====
  [7, 9, WOLF_COLORS.fur], [8, 9, WOLF_COLORS.bellyLight], [9, 9, WOLF_COLORS.belly], [10, 9, WOLF_COLORS.bellyLight], [11, 9, WOLF_COLORS.fur], [12, 9, WOLF_COLORS.fur],
  [6, 10, WOLF_COLORS.fur], [7, 10, WOLF_COLORS.fur], [8, 10, WOLF_COLORS.belly], [9, 10, WOLF_COLORS.bellyLight], [10, 10, WOLF_COLORS.belly], [11, 10, WOLF_COLORS.bellyLight], [12, 10, WOLF_COLORS.fur], [13, 10, WOLF_COLORS.fur],

  // ===== 身体中部（腹部主区）=====
  [5, 11, WOLF_COLORS.furDark], [6, 11, WOLF_COLORS.fur], [7, 11, WOLF_COLORS.belly], [8, 11, WOLF_COLORS.bellyLight], [9, 11, WOLF_COLORS.belly], [10, 11, WOLF_COLORS.bellyLight], [11, 11, WOLF_COLORS.belly], [12, 11, WOLF_COLORS.fur], [13, 11, WOLF_COLORS.furDark],
  [5, 12, WOLF_COLORS.furDark], [6, 12, WOLF_COLORS.fur], [7, 12, WOLF_COLORS.bellyLight], [8, 12, WOLF_COLORS.belly], [9, 12, WOLF_COLORS.bellyLight], [10, 12, WOLF_COLORS.belly], [11, 12, WOLF_COLORS.bellyLight], [12, 12, WOLF_COLORS.fur], [13, 12, WOLF_COLORS.furDark],

  // ===== 身体后部（臀部 + 尾巴根）=====
  [5, 13, WOLF_COLORS.furDark], [6, 13, WOLF_COLORS.fur], [7, 13, WOLF_COLORS.fur], [8, 13, WOLF_COLORS.belly], [9, 13, WOLF_COLORS.bellyLight], [10, 13, WOLF_COLORS.belly], [11, 13, WOLF_COLORS.fur], [12, 13, WOLF_COLORS.fur],
  [6, 14, WOLF_COLORS.furDark], [7, 14, WOLF_COLORS.fur], [8, 14, WOLF_COLORS.fur], [9, 14, WOLF_COLORS.belly], [10, 14, WOLF_COLORS.fur], [11, 14, WOLF_COLORS.fur],

  // ===== 尾巴（向左上翘起）=====
  [4, 9, WOLF_COLORS.furDark], [3, 9, WOLF_COLORS.fur],
  [3, 8, WOLF_COLORS.furDark], [2, 8, WOLF_COLORS.fur],
  [3, 7, WOLF_COLORS.glow], [2, 7, WOLF_COLORS.fur], [1, 7, WOLF_COLORS.tailTip],
  [2, 6, WOLF_COLORS.glow], [1, 6, WOLF_COLORS.glowLight],
  [2, 5, WOLF_COLORS.tailTip],

  // ===== 紫色发光装饰 =====
  [12, 5, WOLF_COLORS.eyeGlow],  // 眼睛发光

  // ===== 腿 =====
  // 前腿（x: 11-12, y: 13-15）
  [11, 13, WOLF_COLORS.furDark], [12, 13, WOLF_COLORS.fur],
  [11, 14, WOLF_COLORS.paw], [12, 14, WOLF_COLORS.paw],
  [11, 15, WOLF_COLORS.claw], [12, 15, WOLF_COLORS.claw],
  // 后腿（x: 6-7, y: 13-15）
  [6, 13, WOLF_COLORS.fur], [7, 13, WOLF_COLORS.furDark],
  [6, 14, WOLF_COLORS.paw], [7, 14, WOLF_COLORS.paw],
  [6, 15, WOLF_COLORS.claw], [7, 15, WOLF_COLORS.claw],
]

// ============================================================
// 向上面朝 - 狼背面（看到背，看不到脸）
// x范围: 2-13, y范围: 0-15
// 顶部有两个耳朵 + 背部 + 身体下方四条腿 + 下方尾巴
// ============================================================
const WOLF_FACE_UP = [
  // ===== 双耳（顶部两侧）=====
  [3, 0, WOLF_COLORS.earOuter], [4, 0, WOLF_COLORS.earOuter], [11, 0, WOLF_COLORS.earOuter], [12, 0, WOLF_COLORS.earOuter],
  [3, 1, WOLF_COLORS.earInner], [4, 1, WOLF_COLORS.earInner], [11, 1, WOLF_COLORS.earInner], [12, 1, WOLF_COLORS.earInner],
  [3, 2, WOLF_COLORS.earOuter], [4, 2, WOLF_COLORS.earOuter], [11, 2, WOLF_COLORS.earOuter], [12, 2, WOLF_COLORS.earOuter],

  // ===== 头部背面 =====
  [4, 2, WOLF_COLORS.furLight], [5, 2, WOLF_COLORS.furLight], [6, 2, WOLF_COLORS.fur], [7, 2, WOLF_COLORS.fur], [8, 2, WOLF_COLORS.furLight], [9, 2, WOLF_COLORS.furLight], [10, 2, WOLF_COLORS.fur], [11, 2, WOLF_COLORS.fur],
  [3, 3, WOLF_COLORS.fur], [4, 3, WOLF_COLORS.fur], [5, 3, WOLF_COLORS.furLight], [6, 3, WOLF_COLORS.fur], [7, 3, WOLF_COLORS.fur], [8, 3, WOLF_COLORS.fur], [9, 3, WOLF_COLORS.furLight], [10, 3, WOLF_COLORS.fur], [11, 3, WOLF_COLORS.fur], [12, 3, WOLF_COLORS.fur],
  [3, 4, WOLF_COLORS.furDark], [4, 4, WOLF_COLORS.fur], [5, 4, WOLF_COLORS.fur], [6, 4, WOLF_COLORS.furLight], [7, 4, WOLF_COLORS.fur], [8, 4, WOLF_COLORS.fur], [9, 4, WOLF_COLORS.furLight], [10, 4, WOLF_COLORS.fur], [11, 4, WOLF_COLORS.fur], [12, 4, WOLF_COLORS.furDark],

  // ===== 颈部 =====
  [4, 5, WOLF_COLORS.fur], [5, 5, WOLF_COLORS.furLight], [6, 5, WOLF_COLORS.fur], [7, 5, WOLF_COLORS.furLight], [8, 5, WOLF_COLORS.fur], [9, 5, WOLF_COLORS.furLight], [10, 5, WOLF_COLORS.fur], [11, 5, WOLF_COLORS.fur],
  [4, 6, WOLF_COLORS.fur], [5, 6, WOLF_COLORS.fur], [6, 6, WOLF_COLORS.furLight], [7, 6, WOLF_COLORS.fur], [8, 6, WOLF_COLORS.furLight], [9, 6, WOLF_COLORS.fur], [10, 6, WOLF_COLORS.fur],

  // ===== 身体上部（肩背）=====
  [3, 7, WOLF_COLORS.fur], [4, 7, WOLF_COLORS.furLight], [5, 7, WOLF_COLORS.fur], [6, 7, WOLF_COLORS.furLight], [7, 7, WOLF_COLORS.fur], [8, 7, WOLF_COLORS.furLight], [9, 7, WOLF_COLORS.fur], [10, 7, WOLF_COLORS.furLight], [11, 7, WOLF_COLORS.fur], [12, 7, WOLF_COLORS.fur],
  [3, 8, WOLF_COLORS.furDark], [4, 8, WOLF_COLORS.fur], [5, 8, WOLF_COLORS.furLight], [6, 8, WOLF_COLORS.fur], [7, 8, WOLF_COLORS.furLight], [8, 8, WOLF_COLORS.furLight], [9, 8, WOLF_COLORS.fur], [10, 8, WOLF_COLORS.furLight], [11, 8, WOLF_COLORS.fur], [12, 8, WOLF_COLORS.furDark],

  // ===== 背部中段（最宽）=====
  [2, 9, WOLF_COLORS.furDark], [3, 9, WOLF_COLORS.fur], [4, 9, WOLF_COLORS.fur], [5, 9, WOLF_COLORS.furLight], [6, 9, WOLF_COLORS.fur], [7, 9, WOLF_COLORS.fur], [8, 9, WOLF_COLORS.fur], [9, 9, WOLF_COLORS.fur], [10, 9, WOLF_COLORS.furLight], [11, 9, WOLF_COLORS.fur], [12, 9, WOLF_COLORS.fur], [13, 9, WOLF_COLORS.furDark],
  [2, 10, WOLF_COLORS.furDark], [3, 10, WOLF_COLORS.fur], [4, 10, WOLF_COLORS.fur], [5, 10, WOLF_COLORS.fur], [6, 10, WOLF_COLORS.furLight], [7, 10, WOLF_COLORS.fur], [8, 10, WOLF_COLORS.furLight], [9, 10, WOLF_COLORS.fur], [10, 10, WOLF_COLORS.fur], [11, 10, WOLF_COLORS.fur], [12, 10, WOLF_COLORS.fur], [13, 10, WOLF_COLORS.furDark],
  [2, 11, WOLF_COLORS.furDark], [3, 11, WOLF_COLORS.fur], [4, 11, WOLF_COLORS.furLight], [5, 11, WOLF_COLORS.fur], [6, 11, WOLF_COLORS.fur], [7, 11, WOLF_COLORS.furLight], [8, 11, WOLF_COLORS.furLight], [9, 11, WOLF_COLORS.fur], [10, 11, WOLF_COLORS.fur], [11, 11, WOLF_COLORS.furLight], [12, 11, WOLF_COLORS.fur], [13, 11, WOLF_COLORS.furDark],

  // ===== 臀部 =====
  [3, 12, WOLF_COLORS.fur], [4, 12, WOLF_COLORS.fur], [5, 12, WOLF_COLORS.fur], [6, 12, WOLF_COLORS.furLight], [7, 12, WOLF_COLORS.fur], [8, 12, WOLF_COLORS.fur], [9, 12, WOLF_COLORS.furLight], [10, 12, WOLF_COLORS.fur], [11, 12, WOLF_COLORS.fur], [12, 12, WOLF_COLORS.fur],
  [4, 13, WOLF_COLORS.furDark], [5, 13, WOLF_COLORS.fur], [6, 13, WOLF_COLORS.fur], [7, 13, WOLF_COLORS.furLight], [8, 13, WOLF_COLORS.furLight], [9, 13, WOLF_COLORS.fur], [10, 13, WOLF_COLORS.fur], [11, 13, WOLF_COLORS.furDark],

  // ===== 尾巴（向下延伸，带紫色尖）=====
  [6, 14, WOLF_COLORS.fur], [7, 14, WOLF_COLORS.fur], [8, 14, WOLF_COLORS.fur], [9, 14, WOLF_COLORS.furDark],
  [6, 15, WOLF_COLORS.glow], [7, 15, WOLF_COLORS.tailTip], [8, 15, WOLF_COLORS.tailTip], [9, 15, WOLF_COLORS.glowLight],

  // ===== 紫色魔力纹（背上）=====
  [5, 5, WOLF_COLORS.glow], [10, 5, WOLF_COLORS.glow],
  [6, 8, WOLF_COLORS.glow], [9, 8, WOLF_COLORS.glow],
  [7, 11, WOLF_COLORS.glowLight], [8, 11, WOLF_COLORS.glowLight],

  // ===== 四条腿位置 =====
  // 左前腿 x: 4-5
  [4, 12, WOLF_COLORS.fur], [5, 12, WOLF_COLORS.furDark],
  [4, 13, WOLF_COLORS.paw], [5, 13, WOLF_COLORS.paw],
  [4, 14, WOLF_COLORS.claw], [5, 14, WOLF_COLORS.claw],
  // 右前腿 x: 10-11
  [10, 12, WOLF_COLORS.furDark], [11, 12, WOLF_COLORS.fur],
  [10, 13, WOLF_COLORS.paw], [11, 13, WOLF_COLORS.paw],
  [10, 14, WOLF_COLORS.claw], [11, 14, WOLF_COLORS.claw],
  // 左后腿 x: 6-7
  [6, 12, WOLF_COLORS.fur], [7, 12, WOLF_COLORS.furDark],
  [6, 13, WOLF_COLORS.paw], [7, 13, WOLF_COLORS.paw],
  [6, 14, WOLF_COLORS.claw], [7, 14, WOLF_COLORS.claw],
  // 右后腿 x: 8-9
  [8, 12, WOLF_COLORS.furDark], [9, 12, WOLF_COLORS.fur],
  [8, 13, WOLF_COLORS.paw], [9, 13, WOLF_COLORS.paw],
  [8, 14, WOLF_COLORS.claw], [9, 14, WOLF_COLORS.claw],
]

// ============================================================
// 向下面朝 - 狼正面（看到脸 + 胸腹部）
// x范围: 2-13, y范围: 0-15
// 顶部有两个耳朵 + 头部(双眼) + 鼻子嘴巴 + 胸腹 + 四条腿 + 尾巴
// ============================================================
const WOLF_FACE_DOWN = [
  // ===== 双耳 =====
  [3, 0, WOLF_COLORS.earOuter], [4, 0, WOLF_COLORS.earOuter], [11, 0, WOLF_COLORS.earOuter], [12, 0, WOLF_COLORS.earOuter],
  [3, 1, WOLF_COLORS.earInner], [4, 1, WOLF_COLORS.earInner], [11, 1, WOLF_COLORS.earInner], [12, 1, WOLF_COLORS.earInner],

  // ===== 头部正面 =====
  [4, 1, WOLF_COLORS.furLight], [5, 1, WOLF_COLORS.furLight], [6, 1, WOLF_COLORS.fur], [7, 1, WOLF_COLORS.fur], [8, 1, WOLF_COLORS.furLight], [9, 1, WOLF_COLORS.furLight], [10, 1, WOLF_COLORS.fur], [11, 1, WOLF_COLORS.fur],
  [3, 2, WOLF_COLORS.fur], [4, 2, WOLF_COLORS.furLight], [5, 2, WOLF_COLORS.fur], [6, 2, WOLF_COLORS.furLight], [7, 2, WOLF_COLORS.fur], [8, 2, WOLF_COLORS.furLight], [9, 2, WOLF_COLORS.fur], [10, 2, WOLF_COLORS.furLight], [11, 2, WOLF_COLORS.fur], [12, 2, WOLF_COLORS.fur],
  [3, 3, WOLF_COLORS.fur], [4, 3, WOLF_COLORS.fur], [5, 3, WOLF_COLORS.furLight], [6, 3, WOLF_COLORS.fur], [7, 3, WOLF_COLORS.fur], [8, 3, WOLF_COLORS.fur], [9, 3, WOLF_COLORS.furLight], [10, 3, WOLF_COLORS.fur], [11, 3, WOLF_COLORS.fur], [12, 3, WOLF_COLORS.fur],

  // ===== 眼睛行 =====
  [2, 4, WOLF_COLORS.furDark], [3, 4, WOLF_COLORS.fur], [4, 4, WOLF_COLORS.eye], [5, 4, WOLF_COLORS.fur], [6, 4, WOLF_COLORS.furLight], [7, 4, WOLF_COLORS.fur], [8, 4, WOLF_COLORS.furLight], [9, 4, WOLF_COLORS.fur], [10, 4, WOLF_COLORS.eye], [11, 4, WOLF_COLORS.fur], [12, 4, WOLF_COLORS.furDark],
  [2, 5, WOLF_COLORS.fur], [3, 5, WOLF_COLORS.fur], [4, 5, WOLF_COLORS.eyeGlow], [5, 5, WOLF_COLORS.fur], [6, 5, WOLF_COLORS.fur], [7, 5, WOLF_COLORS.fur], [8, 5, WOLF_COLORS.fur], [9, 5, WOLF_COLORS.fur], [10, 5, WOLF_COLORS.eyeGlow], [11, 5, WOLF_COLORS.fur], [12, 5, WOLF_COLORS.fur],

  // ===== 鼻子 =====
  [3, 6, WOLF_COLORS.fur], [4, 6, WOLF_COLORS.fur], [5, 6, WOLF_COLORS.nose], [6, 6, WOLF_COLORS.nose], [7, 6, WOLF_COLORS.nose], [8, 6, WOLF_COLORS.nose], [9, 6, WOLF_COLORS.nose], [10, 6, WOLF_COLORS.fur], [11, 6, WOLF_COLORS.fur],

  // ===== 嘴巴 + 牙齿 =====
  [3, 7, WOLF_COLORS.furDark], [4, 7, WOLF_COLORS.teeth], [5, 7, WOLF_COLORS.teeth], [6, 7, WOLF_COLORS.teeth], [7, 7, WOLF_COLORS.tongue], [8, 7, WOLF_COLORS.teeth], [9, 7, WOLF_COLORS.teeth], [10, 7, WOLF_COLORS.teeth], [11, 7, WOLF_COLORS.furDark],
  [4, 8, WOLF_COLORS.fur], [5, 8, WOLF_COLORS.teeth], [6, 8, WOLF_COLORS.tongue], [7, 8, WOLF_COLORS.tongue], [8, 8, WOLF_COLORS.tongue], [9, 8, WOLF_COLORS.teeth], [10, 8, WOLF_COLORS.fur],

  // ===== 颈部 =====
  [4, 9, WOLF_COLORS.fur], [5, 9, WOLF_COLORS.fur], [6, 9, WOLF_COLORS.furLight], [7, 9, WOLF_COLORS.furLight], [8, 9, WOLF_COLORS.furLight], [9, 9, WOLF_COLORS.fur], [10, 9, WOLF_COLORS.fur],

  // ===== 胸部 =====
  [3, 10, WOLF_COLORS.fur], [4, 10, WOLF_COLORS.furLight], [5, 10, WOLF_COLORS.bellyLight], [6, 10, WOLF_COLORS.belly], [7, 10, WOLF_COLORS.bellyLight], [8, 10, WOLF_COLORS.belly], [9, 10, WOLF_COLORS.bellyLight], [10, 10, WOLF_COLORS.furLight], [11, 10, WOLF_COLORS.fur],
  [2, 11, WOLF_COLORS.furDark], [3, 11, WOLF_COLORS.fur], [4, 11, WOLF_COLORS.belly], [5, 11, WOLF_COLORS.bellyLight], [6, 11, WOLF_COLORS.belly], [7, 11, WOLF_COLORS.bellyLight], [8, 11, WOLF_COLORS.belly], [9, 11, WOLF_COLORS.bellyLight], [10, 11, WOLF_COLORS.belly], [11, 11, WOLF_COLORS.fur], [12, 11, WOLF_COLORS.furDark],

  // ===== 腹部中段 =====
  [2, 12, WOLF_COLORS.furDark], [3, 12, WOLF_COLORS.fur], [4, 12, WOLF_COLORS.bellyLight], [5, 12, WOLF_COLORS.belly], [6, 12, WOLF_COLORS.bellyLight], [7, 12, WOLF_COLORS.belly], [8, 12, WOLF_COLORS.bellyLight], [9, 12, WOLF_COLORS.belly], [10, 12, WOLF_COLORS.bellyLight], [11, 12, WOLF_COLORS.fur], [12, 12, WOLF_COLORS.furDark],
  [3, 13, WOLF_COLORS.fur], [4, 13, WOLF_COLORS.belly], [5, 13, WOLF_COLORS.bellyLight], [6, 13, WOLF_COLORS.belly], [7, 13, WOLF_COLORS.bellyLight], [8, 13, WOLF_COLORS.belly], [9, 13, WOLF_COLORS.bellyLight], [10, 13, WOLF_COLORS.belly], [11, 13, WOLF_COLORS.fur],

  // ===== 腹部下端 =====
  [4, 14, WOLF_COLORS.bellyLight], [5, 14, WOLF_COLORS.belly], [6, 14, WOLF_COLORS.bellyLight], [7, 14, WOLF_COLORS.belly], [8, 14, WOLF_COLORS.bellyLight], [9, 14, WOLF_COLORS.belly], [10, 14, WOLF_COLORS.bellyLight],

  // ===== 尾巴（向下）=====
  [6, 15, WOLF_COLORS.glow], [7, 15, WOLF_COLORS.tailTip], [8, 15, WOLF_COLORS.tailTip], [9, 15, WOLF_COLORS.glowLight],

  // ===== 四条腿（在身体两侧）=====
  // 左前腿 x: 3-4
  [3, 12, WOLF_COLORS.fur], [4, 12, WOLF_COLORS.furDark],
  [3, 13, WOLF_COLORS.paw], [4, 13, WOLF_COLORS.paw],
  [3, 14, WOLF_COLORS.claw], [4, 14, WOLF_COLORS.claw],
  [3, 15, WOLF_COLORS.claw], [4, 15, WOLF_COLORS.claw],
  // 右前腿 x: 10-11
  [10, 12, WOLF_COLORS.furDark], [11, 12, WOLF_COLORS.fur],
  [10, 13, WOLF_COLORS.paw], [11, 13, WOLF_COLORS.paw],
  [10, 14, WOLF_COLORS.claw], [11, 14, WOLF_COLORS.claw],
  [10, 15, WOLF_COLORS.claw], [11, 15, WOLF_COLORS.claw],
  // 左后腿 x: 5-6
  [5, 13, WOLF_COLORS.fur], [6, 13, WOLF_COLORS.furDark],
  [5, 14, WOLF_COLORS.paw], [6, 14, WOLF_COLORS.paw],
  [5, 15, WOLF_COLORS.claw], [6, 15, WOLF_COLORS.claw],
  // 右后腿 x: 8-9
  [8, 13, WOLF_COLORS.furDark], [9, 13, WOLF_COLORS.fur],
  [8, 14, WOLF_COLORS.paw], [9, 14, WOLF_COLORS.paw],
  [8, 15, WOLF_COLORS.claw], [9, 15, WOLF_COLORS.claw],

  // ===== 紫色魔力装饰 =====
  [5, 11, WOLF_COLORS.glow], [10, 11, WOLF_COLORS.glow],
  [7, 12, WOLF_COLORS.glowLight],
]

// ============================================================
// 待机动画帧（腿部/尾巴微调）
// ============================================================
const WOLF_IDLE_FRAMES = [
  // 帧0：正常姿态（稍微压缩）
  [
    { pixels: [
      [6, 14, WOLF_COLORS.glow], [7, 14, WOLF_COLORS.tailTip], [8, 14, WOLF_COLORS.tailTip], [9, 14, WOLF_COLORS.glowLight],
    ] }
  ],
  // 帧1：尾巴轻抬
  [
    { pixels: [
      [6, 14, WOLF_COLORS.tailTip], [7, 14, WOLF_COLORS.glowLight], [8, 14, WOLF_COLORS.glowLight], [9, 14, WOLF_COLORS.tailTip],
    ] }
  ]
]

// ============================================================
// 行走动画帧（腿部交替）
// ============================================================
const WOLF_WALK_FRAMES = [
  // 帧0：前腿迈出
  [
    { pixels: [
      [2, 12, WOLF_COLORS.furDark], [3, 12, WOLF_COLORS.fur], [11, 12, WOLF_COLORS.fur], [12, 12, WOLF_COLORS.furDark],
      [2, 13, WOLF_COLORS.fur], [3, 13, WOLF_COLORS.paw], [11, 13, WOLF_COLORS.paw], [12, 13, WOLF_COLORS.fur],
      [2, 14, WOLF_COLORS.paw], [3, 14, WOLF_COLORS.claw], [11, 14, WOLF_COLORS.claw], [12, 14, WOLF_COLORS.paw],
      [2, 15, WOLF_COLORS.claw], [12, 15, WOLF_COLORS.claw],
    ] }
  ],
  // 帧1：中间
  [
    { pixels: [
      [3, 12, WOLF_COLORS.fur], [4, 12, WOLF_COLORS.furDark], [10, 12, WOLF_COLORS.furDark], [11, 12, WOLF_COLORS.fur],
      [3, 13, WOLF_COLORS.paw], [4, 13, WOLF_COLORS.paw], [10, 13, WOLF_COLORS.paw], [11, 13, WOLF_COLORS.paw],
      [3, 14, WOLF_COLORS.claw], [4, 14, WOLF_COLORS.claw], [10, 14, WOLF_COLORS.claw], [11, 14, WOLF_COLORS.claw],
      [3, 15, WOLF_COLORS.claw], [4, 15, WOLF_COLORS.claw], [10, 15, WOLF_COLORS.claw], [11, 15, WOLF_COLORS.claw],
    ] }
  ],
  // 帧2：后腿迈出
  [
    { pixels: [
      [4, 12, WOLF_COLORS.furDark], [5, 12, WOLF_COLORS.fur], [9, 12, WOLF_COLORS.fur], [10, 12, WOLF_COLORS.furDark],
      [4, 13, WOLF_COLORS.fur], [5, 13, WOLF_COLORS.paw], [9, 13, WOLF_COLORS.paw], [10, 13, WOLF_COLORS.fur],
      [4, 14, WOLF_COLORS.paw], [5, 14, WOLF_COLORS.claw], [9, 14, WOLF_COLORS.claw], [10, 14, WOLF_COLORS.paw],
      [5, 15, WOLF_COLORS.claw], [9, 15, WOLF_COLORS.claw],
    ] }
  ]
]

export const drawShadowWolf = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: WOLF_FACE_DOWN,
  up: WOLF_FACE_UP,
  left: WOLF_FACE_LEFT,
  right: WOLF_FACE_RIGHT,
  walk: WOLF_WALK_FRAMES,
  idle: WOLF_IDLE_FRAMES,
})


export const drawShadowWolfAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, WOLF_AVATAR)