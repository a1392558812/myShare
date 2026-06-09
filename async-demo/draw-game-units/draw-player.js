/**
 * 绘制玩家 - 精细灵动版勇者
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit player 玩家位置
 * @param {Number} currentUnit.x 玩家x坐标
 * @param {Number} currentUnit.y 玩家y坐标
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

export const config = {
  IDLE_SPEED: 0.008,
  WALK_SPEED: 0.12,
}

// 精细勇者颜色定义
const COLORS = {
  helmet: { 
    gold: '#FFD700', 
    darkGold: '#DAA520', 
    bronze: '#B8860B',
    highlight: '#FFEC8B',
    shadow: '#B8860B'
  },
  hair: {
    brown: '#8B4513',
    dark: '#654321',
    light: '#A0522D',
    highlight: '#CD853F'
  },
  skin: { 
    normal: '#FFDAB9', 
    light: '#F5DEB3', 
    shadow: '#DEB887',
    highlight: '#FFE4C4'
  },
  face: { 
    normal: '#FFDAB9', 
    eye: '#2F2F2F',
    eyeLight: '#4A4A4A',
    brow: '#654321',
    mouth: '#CD5C5C',
    blush: '#FFB6C1'
  },
  armor: { 
    blue: '#4169E1', 
    light: '#6495ED',
    dark: '#1E3A8A',
    highlight: '#87CEEB',
    detail: '#2E4A9A'
  },
  belt: { 
    gold: '#DAA520', 
    yellow: '#FFD700',
    dark: '#B8860B'
  },
  leg: { 
    brown: '#8B4513', 
    dark: '#654321',
    light: '#A0522D',
    boot: '#3D2314'
  },
  shield: { 
    blue: '#4169E1', 
    gold: '#FFD700',
    dark: '#1E3A8A',
    highlight: '#6495ED'
  },
  sword: { 
    silver: '#E8E8E8', 
    gold: '#FFD700',
    dark: '#A9A9A9',
    highlight: '#FFFFFF'
  },
  feather: { 
    red: '#FF4500', 
    orange: '#FF6347',
    yellow: '#FFD700',
    dark: '#DC143C',
    highlight: '#FF6B6B'
  }
};

// 向下面朝 - 精细正面
const FACE_DOWN = [
  // ===== 头盔顶部 =====
  [5, 0, COLORS.helmet.darkGold], [6, 0, COLORS.helmet.darkGold], [7, 0, COLORS.helmet.darkGold], [8, 0, COLORS.helmet.darkGold],
  [4, 0, COLORS.helmet.gold], [9, 0, COLORS.helmet.gold],
  [3, 0, COLORS.helmet.highlight], [10, 0, COLORS.helmet.highlight],
  
  // ===== 头盔第二层 + 羽毛 =====
  [2, 1, COLORS.feather.red], [3, 1, COLORS.helmet.gold], [4, 1, COLORS.helmet.gold],
  [5, 1, COLORS.helmet.gold], [6, 1, COLORS.helmet.gold], [7, 1, COLORS.helmet.gold], [8, 1, COLORS.helmet.gold],
  [9, 1, COLORS.helmet.gold], [10, 1, COLORS.helmet.gold], [11, 1, COLORS.helmet.gold], [12, 1, COLORS.feather.red],
  [1, 1, COLORS.feather.orange], [13, 1, COLORS.feather.orange],
  [0, 1, COLORS.feather.yellow], [14, 1, COLORS.feather.yellow],
  
  // ===== 头盔第三层 + 羽毛高光 =====
  [2, 2, COLORS.feather.dark], [3, 2, COLORS.helmet.darkGold], [4, 2, COLORS.helmet.darkGold],
  [5, 2, COLORS.helmet.bronze], [6, 2, COLORS.helmet.bronze], [7, 2, COLORS.helmet.bronze], [8, 2, COLORS.helmet.bronze],
  [9, 2, COLORS.helmet.bronze], [10, 2, COLORS.helmet.darkGold], [11, 2, COLORS.helmet.darkGold], [12, 2, COLORS.feather.dark],
  [1, 2, COLORS.feather.red], [13, 2, COLORS.feather.red],
  
  // ===== 头盔 + 头部 =====
  [2, 3, COLORS.helmet.gold], [3, 3, COLORS.helmet.gold], [4, 3, COLORS.hair.brown],
  [5, 3, COLORS.hair.brown], [6, 3, COLORS.hair.dark], [7, 3, COLORS.hair.dark], [8, 3, COLORS.hair.dark],
  [9, 3, COLORS.hair.brown], [10, 3, COLORS.hair.brown], [11, 3, COLORS.helmet.gold], [12, 3, COLORS.helmet.gold],
  [1, 3, COLORS.feather.orange], [13, 3, COLORS.feather.orange],
  
  // ===== 刘海 + 脸部 =====
  [2, 4, COLORS.hair.light], [3, 4, COLORS.hair.brown], [4, 4, COLORS.hair.brown],
  [5, 4, COLORS.skin.light], [6, 4, COLORS.skin.normal], [7, 4, COLORS.skin.normal], [8, 4, COLORS.skin.normal],
  [9, 4, COLORS.skin.light], [10, 4, COLORS.hair.brown], [11, 4, COLORS.hair.brown], [12, 4, COLORS.hair.light],
  [1, 4, COLORS.feather.highlight], [13, 4, COLORS.feather.highlight],
  
  // ===== 眼睛 =====
  [3, 5, COLORS.skin.normal], [4, 5, COLORS.face.eye], [5, 5, COLORS.skin.light],
  [6, 5, COLORS.skin.normal], [7, 5, COLORS.skin.normal], [8, 5, COLORS.skin.normal],
  [9, 5, COLORS.skin.light], [10, 5, COLORS.face.eye], [11, 5, COLORS.skin.normal],
  [3, 5, COLORS.face.brow], [4, 5, COLORS.face.brow], [10, 5, COLORS.face.brow], [11, 5, COLORS.face.brow],
  
  // ===== 眨眼效果层 =====
  
  // ===== 嘴巴 + 腮红 =====
  [4, 6, COLORS.skin.normal], [5, 6, COLORS.face.mouth], [6, 6, COLORS.face.mouth],
  [7, 6, COLORS.skin.normal], [8, 6, COLORS.skin.normal], [9, 6, COLORS.face.mouth], [10, 6, COLORS.face.mouth],
  [4, 6, COLORS.face.blush], [11, 6, COLORS.face.blush],
  
  // ===== 下巴 =====
  [4, 7, COLORS.skin.shadow], [5, 7, COLORS.skin.normal], [6, 7, COLORS.skin.normal],
  [7, 7, COLORS.skin.normal], [8, 7, COLORS.skin.normal], [9, 7, COLORS.skin.normal], [10, 7, COLORS.skin.shadow],
  
  // ===== 颈部 + 领口 =====
  [5, 8, COLORS.armor.blue], [6, 8, COLORS.armor.blue], [7, 8, COLORS.armor.blue], [8, 8, COLORS.armor.blue], [9, 8, COLORS.armor.blue],
  [4, 8, COLORS.skin.shadow], [10, 8, COLORS.skin.shadow],
  
  // ===== 盔甲上层 =====
  [4, 9, COLORS.armor.dark], [5, 9, COLORS.armor.blue], [6, 9, COLORS.armor.light],
  [7, 9, COLORS.armor.light], [8, 9, COLORS.armor.light], [9, 9, COLORS.armor.blue], [10, 9, COLORS.armor.dark],
  [3, 9, COLORS.armor.dark], [11, 9, COLORS.armor.dark],
  
  // ===== 盔甲中层 + 腰带 =====
  [3, 10, COLORS.armor.blue], [4, 10, COLORS.armor.blue], [5, 10, COLORS.armor.blue],
  [6, 10, COLORS.belt.gold], [7, 10, COLORS.belt.yellow], [8, 10, COLORS.belt.yellow],
  [9, 10, COLORS.armor.blue], [10, 10, COLORS.armor.blue], [11, 10, COLORS.armor.blue],
  
  // ===== 盔甲下层 =====
  [3, 11, COLORS.armor.blue], [4, 11, COLORS.armor.detail], [5, 11, COLORS.armor.blue],
  [6, 11, COLORS.armor.blue], [7, 11, COLORS.armor.blue], [8, 11, COLORS.armor.blue],
  [9, 11, COLORS.armor.detail], [10, 11, COLORS.armor.blue], [11, 11, COLORS.armor.blue],
  
  // ===== 裙甲 =====
  [2, 12, COLORS.armor.dark], [3, 12, COLORS.armor.blue], [4, 12, COLORS.armor.blue],
  [5, 12, COLORS.armor.light], [6, 12, COLORS.armor.light], [7, 12, COLORS.armor.light],
  [8, 12, COLORS.armor.light], [9, 12, COLORS.armor.light], [10, 12, COLORS.armor.blue],
  [11, 12, COLORS.armor.blue], [12, 12, COLORS.armor.dark],
  
  // ===== 腰带 =====
  [3, 13, COLORS.belt.dark], [4, 13, COLORS.belt.gold], [5, 13, COLORS.belt.gold],
  [6, 13, COLORS.belt.yellow], [7, 13, COLORS.belt.yellow], [8, 13, COLORS.belt.yellow],
  [9, 13, COLORS.belt.gold], [10, 13, COLORS.belt.gold], [11, 13, COLORS.belt.dark],
  
  // ===== 腿部 =====
  [4, 14, COLORS.leg.dark], [5, 14, COLORS.leg.brown], [6, 14, COLORS.leg.brown],
  [7, 14, COLORS.leg.brown], [8, 14, COLORS.leg.brown], [9, 14, COLORS.leg.brown], [10, 14, COLORS.leg.dark],
  
  // ===== 靴子 =====
  [5, 15, COLORS.leg.boot], [6, 15, COLORS.leg.dark], [7, 15, COLORS.leg.dark], [8, 15, COLORS.leg.dark], [9, 15, COLORS.leg.boot],
  [4, 15, COLORS.leg.dark], [10, 15, COLORS.leg.dark],
];

// 向上面朝 - 精细背面
const FACE_UP = [
  // ===== 头盔顶部 =====
  [5, 0, COLORS.helmet.darkGold], [6, 0, COLORS.helmet.darkGold], [7, 0, COLORS.helmet.darkGold], [8, 0, COLORS.helmet.darkGold],
  [4, 0, COLORS.helmet.gold], [9, 0, COLORS.helmet.gold],
  [3, 0, COLORS.helmet.highlight], [10, 0, COLORS.helmet.highlight],
  
  // ===== 头盔背面 + 羽毛 =====
  [2, 1, COLORS.feather.red], [3, 1, COLORS.helmet.gold], [4, 1, COLORS.helmet.gold],
  [5, 1, COLORS.helmet.gold], [6, 1, COLORS.helmet.gold], [7, 1, COLORS.helmet.gold], [8, 1, COLORS.helmet.gold],
  [9, 1, COLORS.helmet.gold], [10, 1, COLORS.helmet.gold], [11, 1, COLORS.helmet.gold], [12, 1, COLORS.feather.red],
  [1, 1, COLORS.feather.orange], [13, 1, COLORS.feather.orange],
  [0, 1, COLORS.feather.yellow], [14, 1, COLORS.feather.yellow],
  
  // ===== 头盔背面 =====
  [2, 2, COLORS.feather.dark], [3, 2, COLORS.helmet.darkGold], [4, 2, COLORS.helmet.darkGold],
  [5, 2, COLORS.helmet.bronze], [6, 2, COLORS.helmet.bronze], [7, 2, COLORS.helmet.bronze], [8, 2, COLORS.helmet.bronze],
  [9, 2, COLORS.helmet.bronze], [10, 2, COLORS.helmet.darkGold], [11, 2, COLORS.helmet.darkGold], [12, 2, COLORS.feather.dark],
  [1, 2, COLORS.feather.red], [13, 2, COLORS.feather.red],
  
  // ===== 头盔后部 =====
  [2, 3, COLORS.helmet.gold], [3, 3, COLORS.helmet.gold], [4, 3, COLORS.helmet.darkGold],
  [5, 3, COLORS.helmet.darkGold], [6, 3, COLORS.helmet.darkGold], [7, 3, COLORS.helmet.darkGold],
  [8, 3, COLORS.helmet.darkGold], [9, 3, COLORS.helmet.darkGold], [10, 3, COLORS.helmet.darkGold],
  [11, 3, COLORS.helmet.gold], [12, 3, COLORS.helmet.gold],
  [1, 3, COLORS.feather.orange], [13, 3, COLORS.feather.orange],
  
  // ===== 头发后部 =====
  [3, 4, COLORS.hair.dark], [4, 4, COLORS.hair.brown], [5, 4, COLORS.hair.brown],
  [6, 4, COLORS.hair.dark], [7, 4, COLORS.hair.dark], [8, 4, COLORS.hair.dark],
  [9, 4, COLORS.hair.brown], [10, 4, COLORS.hair.brown], [11, 4, COLORS.hair.dark],
  [2, 4, COLORS.feather.highlight], [12, 4, COLORS.feather.highlight],
  
  // ===== 头发 =====
  [3, 5, COLORS.hair.dark], [4, 5, COLORS.hair.brown], [5, 5, COLORS.hair.brown],
  [6, 5, COLORS.hair.dark], [7, 5, COLORS.hair.dark], [8, 5, COLORS.hair.dark],
  [9, 5, COLORS.hair.brown], [10, 5, COLORS.hair.brown], [11, 5, COLORS.hair.dark],
  
  // ===== 颈背部 =====
  [4, 6, COLORS.armor.dark], [5, 6, COLORS.armor.dark], [6, 6, COLORS.armor.dark],
  [7, 6, COLORS.armor.dark], [8, 6, COLORS.armor.dark], [9, 6, COLORS.armor.dark],
  
  // ===== 背部盔甲 =====
  [4, 7, COLORS.armor.dark], [5, 7, COLORS.armor.blue], [6, 7, COLORS.armor.blue],
  [7, 7, COLORS.armor.blue], [8, 7, COLORS.armor.blue], [9, 7, COLORS.armor.blue], [10, 7, COLORS.armor.dark],
  [3, 7, COLORS.armor.dark], [11, 7, COLORS.armor.dark],
  
  // ===== 背部盔甲层 =====
  [3, 8, COLORS.armor.dark], [4, 8, COLORS.armor.blue], [5, 8, COLORS.armor.detail],
  [6, 8, COLORS.armor.blue], [7, 8, COLORS.armor.blue], [8, 8, COLORS.armor.blue],
  [9, 8, COLORS.armor.detail], [10, 8, COLORS.armor.blue], [11, 8, COLORS.armor.dark],
  
  // ===== 盔甲 + 腰带 =====
  [3, 9, COLORS.armor.blue], [4, 9, COLORS.armor.blue], [5, 9, COLORS.armor.blue],
  [6, 9, COLORS.belt.gold], [7, 9, COLORS.belt.yellow], [8, 9, COLORS.belt.yellow],
  [9, 9, COLORS.armor.blue], [10, 9, COLORS.armor.blue], [11, 9, COLORS.armor.blue],
  
  // ===== 盔甲下层 =====
  [3, 10, COLORS.armor.blue], [4, 10, COLORS.armor.detail], [5, 10, COLORS.armor.blue],
  [6, 10, COLORS.armor.blue], [7, 10, COLORS.armor.blue], [8, 10, COLORS.armor.blue],
  [9, 10, COLORS.armor.detail], [10, 10, COLORS.armor.blue], [11, 10, COLORS.armor.blue],
  
  // ===== 裙甲 =====
  [2, 11, COLORS.armor.dark], [3, 11, COLORS.armor.blue], [4, 11, COLORS.armor.blue],
  [5, 11, COLORS.armor.light], [6, 11, COLORS.armor.light], [7, 11, COLORS.armor.light],
  [8, 11, COLORS.armor.light], [9, 11, COLORS.armor.light], [10, 11, COLORS.armor.blue],
  [11, 11, COLORS.armor.blue], [12, 11, COLORS.armor.dark],
  
  // ===== 腰带 =====
  [3, 12, COLORS.belt.dark], [4, 12, COLORS.belt.gold], [5, 12, COLORS.belt.gold],
  [6, 12, COLORS.belt.yellow], [7, 12, COLORS.belt.yellow], [8, 12, COLORS.belt.yellow],
  [9, 12, COLORS.belt.gold], [10, 12, COLORS.belt.gold], [11, 12, COLORS.belt.dark],
  
  // ===== 腿部 =====
  [4, 13, COLORS.leg.dark], [5, 13, COLORS.leg.brown], [6, 13, COLORS.leg.brown],
  [7, 13, COLORS.leg.brown], [8, 13, COLORS.leg.brown], [9, 13, COLORS.leg.brown], [10, 13, COLORS.leg.dark],
  
  // ===== 靴子 =====
  [5, 14, COLORS.leg.boot], [6, 14, COLORS.leg.dark], [7, 14, COLORS.leg.dark], [8, 14, COLORS.leg.dark], [9, 14, COLORS.leg.boot],
  [4, 14, COLORS.leg.dark], [10, 14, COLORS.leg.dark],
  
  // ===== 剑（背在身后）=====
  [12, 5, COLORS.sword.dark],
  [12, 6, COLORS.sword.silver],
  [12, 7, COLORS.sword.highlight],
  [12, 8, COLORS.sword.silver],
  [12, 9, COLORS.sword.gold],
  [12, 10, COLORS.sword.gold],
  [12, 11, COLORS.sword.dark],
];

// 向左面朝 - 精细侧面
const FACE_LEFT = [
  // ===== 头盔 =====
  [5, 0, COLORS.helmet.darkGold], [6, 0, COLORS.helmet.darkGold], [7, 0, COLORS.helmet.darkGold],
  [8, 0, COLORS.helmet.gold], [9, 0, COLORS.helmet.gold],
  [10, 0, COLORS.helmet.highlight],
  
  // ===== 羽毛 =====
  [3, 1, COLORS.feather.red], [4, 1, COLORS.helmet.gold], [11, 1, COLORS.helmet.gold],
  [2, 1, COLORS.feather.orange], [12, 1, COLORS.feather.orange],
  [1, 1, COLORS.feather.yellow], [13, 1, COLORS.feather.yellow],
  [0, 1, COLORS.feather.highlight],
  
  // ===== 头盔层 =====
  [4, 2, COLORS.helmet.gold], [5, 2, COLORS.helmet.darkGold], [6, 2, COLORS.helmet.darkGold],
  [7, 2, COLORS.helmet.bronze], [8, 2, COLORS.helmet.bronze], [9, 2, COLORS.helmet.darkGold],
  [10, 2, COLORS.helmet.darkGold], [11, 2, COLORS.helmet.gold],
  [3, 2, COLORS.feather.dark], [12, 2, COLORS.feather.dark],
  
  // ===== 头发 =====
  [4, 3, COLORS.hair.brown], [5, 3, COLORS.hair.brown], [6, 3, COLORS.hair.dark],
  [7, 3, COLORS.hair.dark], [8, 3, COLORS.hair.brown], [9, 3, COLORS.helmet.darkGold],
  [10, 3, COLORS.helmet.darkGold], [11, 3, COLORS.helmet.gold],
  [3, 3, COLORS.feather.highlight], [12, 3, COLORS.feather.highlight],
  
  // ===== 脸部 =====
  [3, 4, COLORS.hair.light], [4, 4, COLORS.skin.light], [5, 4, COLORS.skin.normal],
  [6, 4, COLORS.skin.normal], [7, 4, COLORS.skin.normal], [8, 4, COLORS.skin.normal],
  [9, 4, COLORS.skin.shadow], [10, 4, COLORS.helmet.gold],
  
  // ===== 眼睛 =====
  [3, 5, COLORS.skin.normal], [4, 5, COLORS.face.eye], [5, 5, COLORS.skin.normal],
  [6, 5, COLORS.skin.normal], [7, 5, COLORS.skin.normal], [8, 5, COLORS.skin.normal],
  [9, 5, COLORS.skin.shadow],
  [3, 5, COLORS.face.brow], [4, 5, COLORS.face.brow],
  
  // ===== 嘴巴 =====
  [3, 6, COLORS.skin.normal], [4, 6, COLORS.face.mouth], [5, 6, COLORS.face.mouth],
  [6, 6, COLORS.skin.normal], [7, 6, COLORS.skin.normal], [8, 6, COLORS.skin.shadow],
  [3, 6, COLORS.face.blush],
  
  // ===== 下巴 =====
  [4, 7, COLORS.skin.shadow], [5, 7, COLORS.skin.normal], [6, 7, COLORS.skin.normal],
  [7, 7, COLORS.skin.shadow], [8, 7, COLORS.armor.blue],
  
  // ===== 颈部 =====
  [4, 8, COLORS.armor.blue], [5, 8, COLORS.armor.blue], [6, 8, COLORS.armor.blue],
  [7, 8, COLORS.armor.blue], [8, 8, COLORS.armor.dark],
  
  // ===== 盔甲 =====
  [3, 9, COLORS.armor.dark], [4, 9, COLORS.armor.blue], [5, 9, COLORS.armor.light],
  [6, 9, COLORS.armor.light], [7, 9, COLORS.armor.blue], [8, 9, COLORS.armor.dark],
  [9, 9, COLORS.armor.dark],
  
  // ===== 盔甲层 =====
  [3, 10, COLORS.armor.blue], [4, 10, COLORS.armor.blue], [5, 10, COLORS.armor.blue],
  [6, 10, COLORS.belt.gold], [7, 10, COLORS.belt.yellow], [8, 10, COLORS.belt.gold],
  [9, 10, COLORS.armor.dark],
  
  // ===== 盔甲下身 =====
  [3, 11, COLORS.armor.blue], [4, 11, COLORS.armor.detail], [5, 11, COLORS.armor.blue],
  [6, 11, COLORS.armor.blue], [7, 11, COLORS.armor.blue], [8, 11, COLORS.armor.dark],
  
  // ===== 裙甲 =====
  [2, 12, COLORS.armor.dark], [3, 12, COLORS.armor.blue], [4, 12, COLORS.armor.blue],
  [5, 12, COLORS.armor.light], [6, 12, COLORS.armor.light], [7, 12, COLORS.armor.blue],
  [8, 12, COLORS.armor.blue], [9, 12, COLORS.armor.dark],
  
  // ===== 腰带 =====
  [3, 13, COLORS.belt.dark], [4, 13, COLORS.belt.gold], [5, 13, COLORS.belt.yellow],
  [6, 13, COLORS.belt.yellow], [7, 13, COLORS.belt.gold], [8, 13, COLORS.belt.dark],
  
  // ===== 腿部 =====
  [4, 14, COLORS.leg.dark], [5, 14, COLORS.leg.brown], [6, 14, COLORS.leg.brown],
  [7, 14, COLORS.leg.brown], [8, 14, COLORS.leg.dark],
  
  // ===== 靴子 =====
  [5, 15, COLORS.leg.boot], [6, 15, COLORS.leg.dark], [7, 15, COLORS.leg.dark], [8, 15, COLORS.leg.boot],
  [4, 15, COLORS.leg.dark], [9, 15, COLORS.leg.dark],
  
  // ===== 剑（左侧）=====
  [0, 5, COLORS.sword.silver], [0, 6, COLORS.sword.silver], [0, 7, COLORS.sword.silver],
  [0, 8, COLORS.sword.silver], [0, 9, COLORS.sword.silver], [0, 10, COLORS.sword.silver],
  [1, 5, COLORS.sword.dark], [1, 6, COLORS.sword.gold], [1, 7, COLORS.sword.gold],
  [1, 8, COLORS.sword.gold], [1, 9, COLORS.sword.gold], [1, 10, COLORS.sword.dark],
];

// 向右面朝 - 精细侧面
const FACE_RIGHT = [
  // ===== 头盔 =====
  [4, 0, COLORS.helmet.darkGold], [5, 0, COLORS.helmet.darkGold], [6, 0, COLORS.helmet.darkGold],
  [7, 0, COLORS.helmet.gold], [8, 0, COLORS.helmet.gold],
  [3, 0, COLORS.helmet.highlight],
  
  // ===== 羽毛 =====
  [4, 1, COLORS.helmet.gold], [11, 1, COLORS.helmet.gold], [12, 1, COLORS.feather.red],
  [2, 1, COLORS.feather.orange], [13, 1, COLORS.feather.orange],
  [1, 1, COLORS.feather.yellow], [14, 1, COLORS.feather.yellow],
  [0, 1, COLORS.feather.highlight],
  
  // ===== 头盔层 =====
  [3, 2, COLORS.helmet.gold], [4, 2, COLORS.helmet.darkGold], [5, 2, COLORS.helmet.darkGold],
  [6, 2, COLORS.helmet.bronze], [7, 2, COLORS.helmet.bronze], [8, 2, COLORS.helmet.darkGold],
  [9, 2, COLORS.helmet.darkGold], [10, 2, COLORS.helmet.gold],
  [2, 2, COLORS.feather.dark], [11, 2, COLORS.feather.dark],
  
  // ===== 头发 =====
  [3, 3, COLORS.helmet.gold], [4, 3, COLORS.hair.brown], [5, 3, COLORS.hair.dark],
  [6, 3, COLORS.hair.dark], [7, 3, COLORS.hair.brown], [8, 3, COLORS.hair.brown],
  [9, 3, COLORS.helmet.darkGold], [10, 3, COLORS.hair.brown],
  [2, 3, COLORS.feather.highlight], [11, 3, COLORS.feather.highlight],
  
  // ===== 脸部 =====
  [4, 4, COLORS.helmet.gold], [5, 4, COLORS.skin.shadow], [6, 4, COLORS.skin.normal],
  [7, 4, COLORS.skin.normal], [8, 4, COLORS.skin.normal], [9, 4, COLORS.skin.light],
  [10, 4, COLORS.hair.light],
  
  // ===== 眼睛 =====
  [5, 5, COLORS.skin.normal], [6, 5, COLORS.skin.normal], [7, 5, COLORS.skin.normal],
  [8, 5, COLORS.skin.normal], [9, 5, COLORS.face.eye], [10, 5, COLORS.skin.normal],
  [9, 5, COLORS.face.brow], [10, 5, COLORS.face.brow],
  
  // ===== 嘴巴 =====
  [5, 6, COLORS.skin.shadow], [6, 6, COLORS.skin.normal], [7, 6, COLORS.face.mouth],
  [8, 6, COLORS.face.mouth], [9, 6, COLORS.skin.normal], [10, 6, COLORS.skin.normal],
  [10, 6, COLORS.face.blush],
  
  // ===== 下巴 =====
  [5, 7, COLORS.armor.blue], [6, 7, COLORS.skin.shadow], [7, 7, COLORS.skin.normal],
  [8, 7, COLORS.skin.normal], [9, 7, COLORS.skin.shadow],
  
  // ===== 颈部 =====
  [5, 8, COLORS.armor.dark], [6, 8, COLORS.armor.blue], [7, 8, COLORS.armor.blue],
  [8, 8, COLORS.armor.blue], [9, 8, COLORS.armor.blue],
  
  // ===== 盔甲 =====
  [5, 9, COLORS.armor.dark], [6, 9, COLORS.armor.blue], [7, 9, COLORS.armor.light],
  [8, 9, COLORS.armor.light], [9, 9, COLORS.armor.blue], [10, 9, COLORS.armor.dark],
  
  // ===== 盔甲层 =====
  [5, 10, COLORS.armor.dark], [6, 10, COLORS.belt.gold], [7, 10, COLORS.belt.yellow],
  [8, 10, COLORS.belt.gold], [9, 10, COLORS.armor.blue], [10, 10, COLORS.armor.blue],
  
  // ===== 盔甲下身 =====
  [5, 11, COLORS.armor.dark], [6, 11, COLORS.armor.blue], [7, 11, COLORS.armor.blue],
  [8, 11, COLORS.armor.detail], [9, 11, COLORS.armor.blue], [10, 11, COLORS.armor.blue],
  
  // ===== 裙甲 =====
  [5, 12, COLORS.armor.blue], [6, 12, COLORS.armor.light], [7, 12, COLORS.armor.light],
  [8, 12, COLORS.armor.blue], [9, 12, COLORS.armor.blue], [10, 12, COLORS.armor.dark],
  
  // ===== 腰带 =====
  [5, 13, COLORS.belt.gold], [6, 13, COLORS.belt.yellow], [7, 13, COLORS.belt.yellow],
  [8, 13, COLORS.belt.gold], [9, 13, COLORS.belt.dark], [10, 13, COLORS.belt.dark],
  
  // ===== 腿部 =====
  [5, 14, COLORS.leg.dark], [6, 14, COLORS.leg.brown], [7, 14, COLORS.leg.brown],
  [8, 14, COLORS.leg.brown], [9, 14, COLORS.leg.dark],
  
  // ===== 靴子 =====
  [5, 15, COLORS.leg.dark], [6, 15, COLORS.leg.boot], [7, 15, COLORS.leg.dark], [8, 15, COLORS.leg.dark], [9, 15, COLORS.leg.boot],
  
  // ===== 盾牌（右侧）=====
  [13, 6, COLORS.shield.blue], [13, 7, COLORS.shield.blue], [13, 8, COLORS.shield.blue],
  [13, 9, COLORS.shield.blue], [13, 10, COLORS.shield.blue],
  [14, 6, COLORS.shield.highlight], [14, 7, COLORS.shield.gold], [14, 8, COLORS.shield.gold],
  [14, 9, COLORS.shield.highlight], [14, 10, COLORS.shield.highlight],
  [15, 6, COLORS.shield.dark], [15, 7, COLORS.shield.blue], [15, 8, COLORS.shield.blue],
  [15, 9, COLORS.shield.dark], [15, 10, COLORS.shield.dark],
];

// 待机动画帧（呼吸效果 + 羽毛轻摆）
const IDLE_FRAMES = [
  // 帧0：正常姿态
  [
    { pixels: [
      [5, 14, COLORS.leg.dark], [6, 14, COLORS.leg.brown], [7, 14, COLORS.leg.brown], [8, 14, COLORS.leg.brown], [9, 14, COLORS.leg.dark],
      [0, 1, COLORS.feather.yellow], [14, 1, COLORS.feather.yellow],
    ] }
  ],
  // 帧1：微微下沉 + 羽毛摆动
  [
    { pixels: [
      [5, 14, COLORS.leg.dark], [6, 14, COLORS.leg.dark], [7, 14, COLORS.leg.dark], [8, 14, COLORS.leg.dark], [9, 14, COLORS.leg.dark],
      [0, 1, COLORS.feather.orange], [14, 1, COLORS.feather.orange],
    ] }
  ],
  // 帧2：恢复
  [
    { pixels: [
      [5, 14, COLORS.leg.dark], [6, 14, COLORS.leg.brown], [7, 14, COLORS.leg.brown], [8, 14, COLORS.leg.brown], [9, 14, COLORS.leg.dark],
      [1, 1, COLORS.feather.yellow], [13, 1, COLORS.feather.yellow],
    ] }
  ],
];

// 行走动画帧（步伐 + 身体起伏）
const WALK_FRAMES = [
  // 帧0：左脚前
  [
    { pixels: [
      [4, 14, COLORS.leg.dark], [5, 14, COLORS.leg.brown], [6, 14, COLORS.leg.brown], [7, 14, COLORS.leg.dark], [8, 14, COLORS.leg.dark],
      [5, 15, COLORS.leg.dark], [6, 15, COLORS.leg.boot], [7, 15, COLORS.leg.dark],
    ] }
  ],
  // 帧1：中间
  [
    { pixels: [
      [5, 14, COLORS.leg.dark], [6, 14, COLORS.leg.brown], [7, 14, COLORS.leg.brown], [8, 14, COLORS.leg.brown], [9, 14, COLORS.leg.dark],
      [5, 15, COLORS.leg.boot], [6, 15, COLORS.leg.dark], [7, 15, COLORS.leg.dark], [8, 15, COLORS.leg.boot],
    ] }
  ],
  // 帧2：右脚前
  [
    { pixels: [
      [4, 14, COLORS.leg.dark], [5, 14, COLORS.leg.dark], [6, 14, COLORS.leg.brown], [7, 14, COLORS.leg.brown], [8, 14, COLORS.leg.brown], [9, 14, COLORS.leg.dark],
      [6, 15, COLORS.leg.dark], [7, 15, COLORS.leg.boot], [8, 15, COLORS.leg.dark], [9, 15, COLORS.leg.boot],
    ] }
  ],
  // 帧3：恢复
  [
    { pixels: [
      [5, 14, COLORS.leg.dark], [6, 14, COLORS.leg.brown], [7, 14, COLORS.leg.brown], [8, 14, COLORS.leg.brown], [9, 14, COLORS.leg.dark],
      [5, 15, COLORS.leg.boot], [6, 15, COLORS.leg.dark], [7, 15, COLORS.leg.dark], [8, 15, COLORS.leg.boot],
    ] }
  ],
];

export const drawPlayer = (canvasRef, currentUnit) => {
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

  let basePixels = FACE_DOWN;
  if (direction === 'up') basePixels = FACE_UP;
  else if (direction === 'left') basePixels = FACE_LEFT;
  else if (direction === 'right') basePixels = FACE_RIGHT;

  for (let i = 0; i < basePixels.length; i++) {
    drawPixel(basePixels[i][0], basePixels[i][1], basePixels[i][2]);
  }

  const isMoving = currentUnit.isMoving || false;
  const frames = isMoving ? WALK_FRAMES : IDLE_FRAMES;
  const frameIndex = Math.floor(frame) % frames.length;
  const currentFrame = frames[frameIndex];

  for (const layer of currentFrame) {
    for (const pixel of layer.pixels) {
      drawPixel(pixel[0], pixel[1], pixel[2]);
    }
  }
}
