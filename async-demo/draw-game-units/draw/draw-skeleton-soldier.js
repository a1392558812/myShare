import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.004, // 待机动画速度
  WALK_SPEED: 0.08,  // 行走动画速度
}

// 骷髅士兵颜色定义
const SKELETON_COLORS = {
  bone: '#F5F5DC',          // 骨头主色（米白色）
  boneLight: '#FFFFF0',     // 骨头亮色
  boneDark: '#D3D3B8',      // 骨头深色
  boneShadow: '#A8A890',    // 骨头阴影
  eye: '#FF4500',           // 眼睛红色
  eyeGlow: '#FF0000',       // 眼睛发光
  helmet: '#708090',        // 头盔灰色
  helmetLight: '#A9A9A9',   // 头盔亮色
  helmetDark: '#4A4A4A',    // 头盔深色
  armor: '#696969',         // 盔甲灰色
  armorLight: '#808080',    // 盔甲亮色
  armorDark: '#363636',     // 盔甲深色
  cloth: '#8B0000',         // 暗红色披风/衣物
  clothDark: '#5C0000',     // 深红色
  weapon: '#C0C0C0',        // 武器银色
  weaponDark: '#708090',    // 武器深色
  shield: '#4A4A4A',        // 盾牌
  shieldGold: '#B8860B',    // 盾牌金边
  rib: '#E8E8D0',           // 肋骨色
  highlight: '#FFFFFF',     // 高光
  eyeInner: '#FFFF00',      // 眼睛内部黄色
  teeth: '#FFFFF0',         // 牙齿亮色
};

// 骷髅士兵高精度头像（16x16网格，更丰富细节）
const SKELETON_AVATAR = [
  // ===== 头盔顶部边缘
  [4, 0, SKELETON_COLORS.helmetDark], [5, 0, SKELETON_COLORS.helmet], [6, 0, SKELETON_COLORS.helmetLight], [7, 0, SKELETON_COLORS.helmetLight], [8, 0, SKELETON_COLORS.helmetLight], [9, 0, SKELETON_COLORS.helmet], [10, 0, SKELETON_COLORS.helmetDark],
  // ===== 头盔第一层
  [3, 1, SKELETON_COLORS.helmetDark], [4, 1, SKELETON_COLORS.helmet], [5, 1, SKELETON_COLORS.helmetLight], [6, 1, SKELETON_COLORS.helmetLight], [7, 1, SKELETON_COLORS.helmetLight], [8, 1, SKELETON_COLORS.helmetLight], [9, 1, SKELETON_COLORS.helmetLight], [10, 1, SKELETON_COLORS.helmet], [11, 1, SKELETON_COLORS.helmetDark],
  // ===== 头顶骨头（额头区域）
  [5, 2, SKELETON_COLORS.boneLight], [6, 2, SKELETON_COLORS.boneLight], [7, 2, SKELETON_COLORS.boneLight], [8, 2, SKELETON_COLORS.boneLight],
  [4, 3, SKELETON_COLORS.bone], [5, 3, SKELETON_COLORS.boneLight], [6, 3, SKELETON_COLORS.boneLight], [7, 3, SKELETON_COLORS.boneLight], [8, 3, SKELETON_COLORS.boneLight], [9, 3, SKELETON_COLORS.bone],
  // ===== 头顶骨头高光
  [5, 2, SKELETON_COLORS.highlight], [6, 2, SKELETON_COLORS.highlight], [7, 2, SKELETON_COLORS.highlight], [8, 2, SKELETON_COLORS.highlight],
  // ===== 头部骨头（完整头部）
  [3, 4, SKELETON_COLORS.boneDark], [4, 4, SKELETON_COLORS.bone], [5, 4, SKELETON_COLORS.bone], [6, 4, SKELETON_COLORS.bone], [7, 4, SKELETON_COLORS.bone], [8, 4, SKELETON_COLORS.bone], [9, 4, SKELETON_COLORS.bone], [10, 4, SKELETON_COLORS.boneDark],
  [3, 5, SKELETON_COLORS.bone], [4, 5, SKELETON_COLORS.bone], [5, 5, SKELETON_COLORS.bone], [6, 5, SKELETON_COLORS.bone], [7, 5, SKELETON_COLORS.bone], [8, 5, SKELETON_COLORS.bone], [9, 5, SKELETON_COLORS.bone], [10, 5, SKELETON_COLORS.bone],
  // ===== 眼眶骨骼
  [3, 5, SKELETON_COLORS.boneDark], [10, 5, SKELETON_COLORS.boneDark],
  // ===== 眼睛区域（红色发光）
  [3, 6, SKELETON_COLORS.bone], [4, 6, SKELETON_COLORS.eye], [5, 6, SKELETON_COLORS.eye], [6, 6, SKELETON_COLORS.boneShadow], [7, 6, SKELETON_COLORS.boneShadow], [8, 6, SKELETON_COLORS.eye], [9, 6, SKELETON_COLORS.eye], [10, 6, SKELETON_COLORS.bone],
  // ===== 眼睛高光（发光效果）
  [4, 5, SKELETON_COLORS.highlight], [5, 5, SKELETON_COLORS.highlight], [8, 5, SKELETON_COLORS.highlight], [9, 5, SKELETON_COLORS.highlight],
  [4, 6, SKELETON_COLORS.eyeInner], [5, 6, SKELETON_COLORS.eyeInner], [8, 6, SKELETON_COLORS.eyeInner], [9, 6, SKELETON_COLORS.eyeInner],
  // ===== 鼻梁骨骼
  [4, 7, SKELETON_COLORS.bone], [5, 7, SKELETON_COLORS.boneDark], [6, 7, SKELETON_COLORS.boneShadow], [7, 7, SKELETON_COLORS.boneShadow], [8, 7, SKELETON_COLORS.boneDark], [9, 7, SKELETON_COLORS.bone],
  // ===== 上牙齿
  [4, 8, SKELETON_COLORS.bone], [5, 8, SKELETON_COLORS.teeth], [6, 8, SKELETON_COLORS.bone], [7, 8, SKELETON_COLORS.bone], [8, 8, SKELETON_COLORS.teeth], [9, 8, SKELETON_COLORS.bone],
  [4, 9, SKELETON_COLORS.boneDark], [5, 9, SKELETON_COLORS.bone], [6, 9, SKELETON_COLORS.bone], [7, 9, SKELETON_COLORS.bone], [8, 9, SKELETON_COLORS.bone], [9, 9, SKELETON_COLORS.boneDark],
  // ===== 下牙齿
  [5, 10, SKELETON_COLORS.teeth], [6, 10, SKELETON_COLORS.teeth], [7, 10, SKELETON_COLORS.teeth], [8, 10, SKELETON_COLORS.teeth],
  // ===== 下颚骨骼
  [5, 11, SKELETON_COLORS.boneShadow], [6, 11, SKELETON_COLORS.bone], [7, 11, SKELETON_COLORS.bone], [8, 11, SKELETON_COLORS.boneShadow],
  // ===== 颈部盔甲
  [4, 12, SKELETON_COLORS.armor], [5, 12, SKELETON_COLORS.armorLight], [6, 12, SKELETON_COLORS.armorLight], [7, 12, SKELETON_COLORS.armorLight], [8, 12, SKELETON_COLORS.armorLight], [9, 12, SKELETON_COLORS.armor],
  // ===== 盔甲边缘
  [3, 13, SKELETON_COLORS.armorDark], [4, 13, SKELETON_COLORS.armor], [5, 13, SKELETON_COLORS.armorLight], [6, 13, SKELETON_COLORS.armor], [7, 13, SKELETON_COLORS.armor], [8, 13, SKELETON_COLORS.armorLight], [9, 13, SKELETON_COLORS.armor], [10, 13, SKELETON_COLORS.armorDark],
  // ===== 盔甲装饰（骷髅图标）
  [4, 14, SKELETON_COLORS.armorDark], [5, 14, SKELETON_COLORS.bone], [6, 14, SKELETON_COLORS.bone], [7, 14, SKELETON_COLORS.bone], [8, 14, SKELETON_COLORS.bone], [9, 14, SKELETON_COLORS.armorDark],
  [5, 15, SKELETON_COLORS.armor], [6, 15, SKELETON_COLORS.armorDark], [7, 15, SKELETON_COLORS.armorDark], [8, 15, SKELETON_COLORS.armor],
];

// 向下面朝 - 正面
const SKELETON_FACE_DOWN = [
  // 头顶
  [5, 1, SKELETON_COLORS.boneLight], [6, 1, SKELETON_COLORS.boneLight], [7, 1, SKELETON_COLORS.boneLight], [8, 1, SKELETON_COLORS.boneLight],
  [4, 2, SKELETON_COLORS.bone], [5, 2, SKELETON_COLORS.boneLight], [6, 2, SKELETON_COLORS.boneLight], [7, 2, SKELETON_COLORS.boneLight], [8, 2, SKELETON_COLORS.boneLight], [9, 2, SKELETON_COLORS.bone],
  // 头部骨头
  [4, 3, SKELETON_COLORS.bone], [5, 3, SKELETON_COLORS.bone], [6, 3, SKELETON_COLORS.bone], [7, 3, SKELETON_COLORS.bone], [8, 3, SKELETON_COLORS.bone], [9, 3, SKELETON_COLORS.bone],
  [3, 4, SKELETON_COLORS.boneDark], [4, 4, SKELETON_COLORS.bone], [5, 4, SKELETON_COLORS.bone], [6, 4, SKELETON_COLORS.bone], [7, 4, SKELETON_COLORS.bone], [8, 4, SKELETON_COLORS.bone], [9, 4, SKELETON_COLORS.bone], [10, 4, SKELETON_COLORS.boneDark],
  // 眼睛（红色发光）
  [4, 5, SKELETON_COLORS.bone], [5, 5, SKELETON_COLORS.eye], [6, 5, SKELETON_COLORS.boneShadow], [7, 5, SKELETON_COLORS.boneShadow], [8, 5, SKELETON_COLORS.eye], [9, 5, SKELETON_COLORS.bone],
  // 鼻子
  [4, 6, SKELETON_COLORS.bone], [5, 6, SKELETON_COLORS.boneDark], [6, 6, SKELETON_COLORS.boneShadow], [7, 6, SKELETON_COLORS.boneShadow], [8, 6, SKELETON_COLORS.boneDark], [9, 6, SKELETON_COLORS.bone],
  // 牙齿/嘴
  [4, 7, SKELETON_COLORS.bone], [5, 7, SKELETON_COLORS.boneLight], [6, 7, SKELETON_COLORS.bone], [7, 7, SKELETON_COLORS.bone], [8, 7, SKELETON_COLORS.boneLight], [9, 7, SKELETON_COLORS.bone],
  [4, 8, SKELETON_COLORS.boneDark], [5, 8, SKELETON_COLORS.bone], [6, 8, SKELETON_COLORS.bone], [7, 8, SKELETON_COLORS.bone], [8, 8, SKELETON_COLORS.bone], [9, 8, SKELETON_COLORS.boneDark],
  // 下颚
  [5, 9, SKELETON_COLORS.boneShadow], [6, 9, SKELETON_COLORS.bone], [7, 9, SKELETON_COLORS.bone], [8, 9, SKELETON_COLORS.boneShadow],
  // 脖子
  [6, 10, SKELETON_COLORS.boneDark], [7, 10, SKELETON_COLORS.boneDark],
  // 盔甲身体
  [4, 11, SKELETON_COLORS.armor], [5, 11, SKELETON_COLORS.armorLight], [6, 11, SKELETON_COLORS.armor], [7, 11, SKELETON_COLORS.armor], [8, 11, SKELETON_COLORS.armorLight], [9, 11, SKELETON_COLORS.armor],
  [3, 12, SKELETON_COLORS.armorDark], [4, 12, SKELETON_COLORS.armor], [5, 12, SKELETON_COLORS.armor], [6, 12, SKELETON_COLORS.armorLight], [7, 12, SKELETON_COLORS.armorLight], [8, 12, SKELETON_COLORS.armor], [9, 12, SKELETON_COLORS.armor], [10, 12, SKELETON_COLORS.armorDark],
  [3, 13, SKELETON_COLORS.armorDark], [4, 13, SKELETON_COLORS.armor], [5, 13, SKELETON_COLORS.armorDark], [6, 13, SKELETON_COLORS.armor], [7, 13, SKELETON_COLORS.armor], [8, 13, SKELETON_COLORS.armorDark], [9, 13, SKELETON_COLORS.armor], [10, 13, SKELETON_COLORS.armorDark],
  // 腰带
  [4, 14, SKELETON_COLORS.armorDark], [5, 14, SKELETON_COLORS.shieldGold], [6, 14, SKELETON_COLORS.armorDark], [7, 14, SKELETON_COLORS.armorDark], [8, 14, SKELETON_COLORS.shieldGold], [9, 14, SKELETON_COLORS.armorDark],
  // 骨头腿
  [5, 15, SKELETON_COLORS.bone], [6, 15, SKELETON_COLORS.boneDark], [7, 15, SKELETON_COLORS.boneDark], [8, 15, SKELETON_COLORS.bone],
  // 双手（骨头手）
  [2, 11, SKELETON_COLORS.bone], [2, 12, SKELETON_COLORS.boneDark], [2, 13, SKELETON_COLORS.bone],
  [11, 11, SKELETON_COLORS.bone], [11, 12, SKELETON_COLORS.boneDark], [11, 13, SKELETON_COLORS.bone],
];

// 向上面朝 - 背面
const SKELETON_FACE_UP = [
  // 头盔顶
  [4, 1, SKELETON_COLORS.helmet], [5, 1, SKELETON_COLORS.helmetLight], [6, 1, SKELETON_COLORS.helmetLight], [7, 1, SKELETON_COLORS.helmetLight], [8, 1, SKELETON_COLORS.helmetLight], [9, 1, SKELETON_COLORS.helmet],
  [4, 2, SKELETON_COLORS.helmet], [5, 2, SKELETON_COLORS.helmetLight], [6, 2, SKELETON_COLORS.helmet], [7, 2, SKELETON_COLORS.helmet], [8, 2, SKELETON_COLORS.helmetLight], [9, 2, SKELETON_COLORS.helmet],
  // 头盔后部
  [3, 3, SKELETON_COLORS.helmetDark], [4, 3, SKELETON_COLORS.helmet], [5, 3, SKELETON_COLORS.helmet], [6, 3, SKELETON_COLORS.helmetLight], [7, 3, SKELETON_COLORS.helmetLight], [8, 3, SKELETON_COLORS.helmet], [9, 3, SKELETON_COLORS.helmet], [10, 3, SKELETON_COLORS.helmetDark],
  [3, 4, SKELETON_COLORS.helmetDark], [4, 4, SKELETON_COLORS.helmet], [5, 4, SKELETON_COLORS.helmet], [6, 4, SKELETON_COLORS.helmet], [7, 4, SKELETON_COLORS.helmet], [8, 4, SKELETON_COLORS.helmet], [9, 4, SKELETON_COLORS.helmet], [10, 4, SKELETON_COLORS.helmetDark],
  // 披风
  [3, 5, SKELETON_COLORS.cloth], [4, 5, SKELETON_COLORS.cloth], [5, 5, SKELETON_COLORS.clothDark], [6, 5, SKELETON_COLORS.cloth], [7, 5, SKELETON_COLORS.cloth], [8, 5, SKELETON_COLORS.clothDark], [9, 5, SKELETON_COLORS.cloth], [10, 5, SKELETON_COLORS.cloth],
  [3, 6, SKELETON_COLORS.clothDark], [4, 6, SKELETON_COLORS.cloth], [5, 6, SKELETON_COLORS.cloth], [6, 6, SKELETON_COLORS.clothDark], [7, 6, SKELETON_COLORS.clothDark], [8, 6, SKELETON_COLORS.cloth], [9, 6, SKELETON_COLORS.cloth], [10, 6, SKELETON_COLORS.clothDark],
  [4, 7, SKELETON_COLORS.cloth], [5, 7, SKELETON_COLORS.cloth], [6, 7, SKELETON_COLORS.clothDark], [7, 7, SKELETON_COLORS.clothDark], [8, 7, SKELETON_COLORS.cloth], [9, 7, SKELETON_COLORS.cloth],
  // 盔甲背部
  [4, 8, SKELETON_COLORS.armor], [5, 8, SKELETON_COLORS.armorLight], [6, 8, SKELETON_COLORS.armor], [7, 8, SKELETON_COLORS.armor], [8, 8, SKELETON_COLORS.armorLight], [9, 8, SKELETON_COLORS.armor],
  [3, 9, SKELETON_COLORS.armorDark], [4, 9, SKELETON_COLORS.armor], [5, 9, SKELETON_COLORS.armor], [6, 9, SKELETON_COLORS.armorLight], [7, 9, SKELETON_COLORS.armorLight], [8, 9, SKELETON_COLORS.armor], [9, 9, SKELETON_COLORS.armor], [10, 9, SKELETON_COLORS.armorDark],
  [3, 10, SKELETON_COLORS.armorDark], [4, 10, SKELETON_COLORS.armor], [5, 10, SKELETON_COLORS.armorDark], [6, 10, SKELETON_COLORS.armor], [7, 10, SKELETON_COLORS.armor], [8, 10, SKELETON_COLORS.armorDark], [9, 10, SKELETON_COLORS.armor], [10, 10, SKELETON_COLORS.armorDark],
  [3, 11, SKELETON_COLORS.armorDark], [4, 11, SKELETON_COLORS.armor], [5, 11, SKELETON_COLORS.armorDark], [6, 11, SKELETON_COLORS.armor], [7, 11, SKELETON_COLORS.armor], [8, 11, SKELETON_COLORS.armorDark], [9, 11, SKELETON_COLORS.armor], [10, 11, SKELETON_COLORS.armorDark],
  // 腰带
  [4, 12, SKELETON_COLORS.armorDark], [5, 12, SKELETON_COLORS.shieldGold], [6, 12, SKELETON_COLORS.armorDark], [7, 12, SKELETON_COLORS.armorDark], [8, 12, SKELETON_COLORS.shieldGold], [9, 12, SKELETON_COLORS.armorDark],
  // 骨头腿
  [4, 13, SKELETON_COLORS.bone], [5, 13, SKELETON_COLORS.boneDark], [8, 13, SKELETON_COLORS.boneDark], [9, 13, SKELETON_COLORS.bone],
  [4, 14, SKELETON_COLORS.boneDark], [5, 14, SKELETON_COLORS.bone], [8, 14, SKELETON_COLORS.bone], [9, 14, SKELETON_COLORS.boneDark],
  [5, 15, SKELETON_COLORS.bone], [6, 15, SKELETON_COLORS.boneDark], [7, 15, SKELETON_COLORS.boneDark], [8, 15, SKELETON_COLORS.bone],
  // 双手（骨头手）
  [2, 9, SKELETON_COLORS.bone], [2, 10, SKELETON_COLORS.boneDark], [2, 11, SKELETON_COLORS.bone],
  [11, 9, SKELETON_COLORS.bone], [11, 10, SKELETON_COLORS.boneDark], [11, 11, SKELETON_COLORS.bone],
];

// 向左面朝
const SKELETON_FACE_LEFT = [
  // 头部（侧面）
  [5, 1, SKELETON_COLORS.boneLight], [6, 1, SKELETON_COLORS.boneLight], [7, 1, SKELETON_COLORS.boneLight],
  [4, 2, SKELETON_COLORS.bone], [5, 2, SKELETON_COLORS.boneLight], [6, 2, SKELETON_COLORS.bone], [7, 2, SKELETON_COLORS.bone],
  [3, 3, SKELETON_COLORS.boneDark], [4, 3, SKELETON_COLORS.bone], [5, 3, SKELETON_COLORS.bone], [6, 3, SKELETON_COLORS.bone], [7, 3, SKELETON_COLORS.bone],
  // 眼睛（侧面单个）
  [3, 4, SKELETON_COLORS.bone], [4, 4, SKELETON_COLORS.eye], [5, 4, SKELETON_COLORS.bone], [6, 4, SKELETON_COLORS.boneShadow], [7, 4, SKELETON_COLORS.bone],
  // 鼻子（侧面）
  [3, 5, SKELETON_COLORS.bone], [4, 5, SKELETON_COLORS.boneDark], [5, 5, SKELETON_COLORS.bone], [6, 5, SKELETON_COLORS.boneShadow],
  // 嘴（侧面）
  [3, 6, SKELETON_COLORS.bone], [4, 6, SKELETON_COLORS.boneLight], [5, 6, SKELETON_COLORS.bone], [6, 6, SKELETON_COLORS.bone],
  [3, 7, SKELETON_COLORS.boneDark], [4, 7, SKELETON_COLORS.bone], [5, 7, SKELETON_COLORS.boneShadow],
  // 下颚
  [4, 8, SKELETON_COLORS.bone], [5, 8, SKELETON_COLORS.boneShadow],
  // 脖子
  [5, 9, SKELETON_COLORS.boneDark], [6, 9, SKELETON_COLORS.boneDark],
  // 盔甲身体（侧面）
  [4, 10, SKELETON_COLORS.armorLight], [5, 10, SKELETON_COLORS.armor], [6, 10, SKELETON_COLORS.armorDark], [7, 10, SKELETON_COLORS.armorDark],
  [3, 11, SKELETON_COLORS.armor], [4, 11, SKELETON_COLORS.armor], [5, 11, SKELETON_COLORS.armorLight], [6, 11, SKELETON_COLORS.armor], [7, 11, SKELETON_COLORS.armorDark],
  [3, 12, SKELETON_COLORS.armorDark], [4, 12, SKELETON_COLORS.armor], [5, 12, SKELETON_COLORS.armor], [6, 12, SKELETON_COLORS.armorDark], [7, 12, SKELETON_COLORS.armorDark],
  [3, 13, SKELETON_COLORS.armorDark], [4, 13, SKELETON_COLORS.armorDark], [5, 13, SKELETON_COLORS.armorDark], [6, 13, SKELETON_COLORS.armorDark],
  // 腰带
  [4, 14, SKELETON_COLORS.shieldGold], [5, 14, SKELETON_COLORS.armorDark], [6, 14, SKELETON_COLORS.armorDark],
  // 腿（侧面）
  [5, 15, SKELETON_COLORS.bone], [6, 15, SKELETON_COLORS.boneDark],
  // 左手（侧面更长，骨头手）
  [2, 10, SKELETON_COLORS.bone], [2, 11, SKELETON_COLORS.boneDark], [2, 12, SKELETON_COLORS.bone], [2, 13, SKELETON_COLORS.boneDark],
];

// 向右面朝
const SKELETON_FACE_RIGHT = [
  // 头部（侧面）
  [6, 1, SKELETON_COLORS.boneLight], [7, 1, SKELETON_COLORS.boneLight], [8, 1, SKELETON_COLORS.boneLight],
  [6, 2, SKELETON_COLORS.bone], [7, 2, SKELETON_COLORS.bone], [8, 2, SKELETON_COLORS.boneLight], [9, 2, SKELETON_COLORS.bone],
  [6, 3, SKELETON_COLORS.bone], [7, 3, SKELETON_COLORS.bone], [8, 3, SKELETON_COLORS.bone], [9, 3, SKELETON_COLORS.bone], [10, 3, SKELETON_COLORS.boneDark],
  // 眼睛（侧面单个）
  [6, 4, SKELETON_COLORS.boneShadow], [7, 4, SKELETON_COLORS.bone], [8, 4, SKELETON_COLORS.bone], [9, 4, SKELETON_COLORS.eye], [10, 4, SKELETON_COLORS.bone],
  // 鼻子（侧面）
  [7, 5, SKELETON_COLORS.boneShadow], [8, 5, SKELETON_COLORS.bone], [9, 5, SKELETON_COLORS.boneDark], [10, 5, SKELETON_COLORS.bone],
  // 嘴（侧面）
  [7, 6, SKELETON_COLORS.bone], [8, 6, SKELETON_COLORS.bone], [9, 6, SKELETON_COLORS.boneLight], [10, 6, SKELETON_COLORS.bone],
  [8, 7, SKELETON_COLORS.boneShadow], [9, 7, SKELETON_COLORS.bone], [10, 7, SKELETON_COLORS.boneDark],
  // 下颚
  [8, 8, SKELETON_COLORS.boneShadow], [9, 8, SKELETON_COLORS.bone],
  // 脖子
  [7, 9, SKELETON_COLORS.boneDark], [8, 9, SKELETON_COLORS.boneDark],
  // 盔甲身体（侧面）
  [6, 10, SKELETON_COLORS.armorDark], [7, 10, SKELETON_COLORS.armorDark], [8, 10, SKELETON_COLORS.armor], [9, 10, SKELETON_COLORS.armorLight],
  [6, 11, SKELETON_COLORS.armorDark], [7, 11, SKELETON_COLORS.armor], [8, 11, SKELETON_COLORS.armorLight], [9, 11, SKELETON_COLORS.armor], [10, 11, SKELETON_COLORS.armor],
  [6, 12, SKELETON_COLORS.armorDark], [7, 12, SKELETON_COLORS.armorDark], [8, 12, SKELETON_COLORS.armor], [9, 12, SKELETON_COLORS.armor], [10, 12, SKELETON_COLORS.armorDark],
  [6, 13, SKELETON_COLORS.armorDark], [7, 13, SKELETON_COLORS.armorDark], [8, 13, SKELETON_COLORS.armorDark], [9, 13, SKELETON_COLORS.armorDark],
  // 腰带
  [7, 14, SKELETON_COLORS.armorDark], [8, 14, SKELETON_COLORS.armorDark], [9, 14, SKELETON_COLORS.shieldGold],
  // 腿（侧面）
  [7, 15, SKELETON_COLORS.boneDark], [8, 15, SKELETON_COLORS.bone],
  // 右手（侧面更长，骨头手）
  [11, 10, SKELETON_COLORS.bone], [11, 11, SKELETON_COLORS.boneDark], [11, 12, SKELETON_COLORS.bone], [11, 13, SKELETON_COLORS.boneDark],
];

// 待机动画帧
const SKELETON_IDLE_FRAMES = [
  // 帧0：正常姿态
  [
    { pixels: [[5, 15, SKELETON_COLORS.bone], [6, 15, SKELETON_COLORS.boneDark], [7, 15, SKELETON_COLORS.boneDark], [8, 15, SKELETON_COLORS.bone]] }
  ],
  // 帧1：微微下沉（呼吸效果）
  [
    { pixels: [[4, 15, SKELETON_COLORS.bone], [5, 15, SKELETON_COLORS.bone], [6, 15, SKELETON_COLORS.boneDark], [7, 15, SKELETON_COLORS.boneDark], [8, 15, SKELETON_COLORS.bone], [9, 15, SKELETON_COLORS.bone]] }
  ]
];

// 行走动画帧
const SKELETON_WALK_FRAMES = [
  // 帧0：左脚在前
  [
    { pixels: [[4, 15, SKELETON_COLORS.boneDark], [5, 15, SKELETON_COLORS.bone], [6, 15, SKELETON_COLORS.bone], [7, 15, SKELETON_COLORS.boneDark], [8, 15, SKELETON_COLORS.boneDark]] }
  ],
  // 帧1：中间
  [
    { pixels: [[5, 15, SKELETON_COLORS.bone], [6, 15, SKELETON_COLORS.boneDark], [7, 15, SKELETON_COLORS.boneDark], [8, 15, SKELETON_COLORS.bone]] }
  ],
  // 帧2：右脚在前
  [
    { pixels: [[5, 15, SKELETON_COLORS.boneDark], [6, 15, SKELETON_COLORS.boneDark], [7, 15, SKELETON_COLORS.bone], [8, 15, SKELETON_COLORS.bone], [9, 15, SKELETON_COLORS.boneDark]] }
  ]
];

export const drawSkeletonSoldier = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: SKELETON_FACE_DOWN,
  up: SKELETON_FACE_UP,
  left: SKELETON_FACE_LEFT,
  right: SKELETON_FACE_RIGHT,
  idle: SKELETON_IDLE_FRAMES,
  walk: SKELETON_WALK_FRAMES,
})


export const drawSkeletonSoldierAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, SKELETON_AVATAR)