/**
 * 绘制奇美拉怪物（狮子头 + 山羊身 + 蛇尾）
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit 奇美拉位置和状态
 * @param {Number} currentUnit.x 奇美拉x坐标
 * @param {Number} currentUnit.y 奇美拉y坐标
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 * @param {Number} currentUnit.isMoving 是否在移动
 * @param {Number} currentUnit.size 怪物大小(px)
 */

export const config = {
  IDLE_SPEED: 0.005,
  WALK_SPEED: 0.08,
}

const CHIMERA_COLORS = {
  lionFur: '#DAA520',         // 狮子主毛 - 金色
  lionFurLight: '#FFD700',    // 狮子亮毛
  lionFurDark: '#8B6914',     // 狮子深毛
  lionMane: '#B8860B',        // 鬃毛 - 暗金
  lionManeDark: '#6B4F0A',    // 深鬃毛
  goatBody: '#CD853F',        // 山羊身体 - 秘鲁棕
  goatBodyLight: '#DEB887',   // 山羊亮色
  goatBodyDark: '#8B4513',    // 山羊深色
  goatBelly: '#F4A460',       // 山羊腹部 - 沙棕
  eye: '#FF4500',             // 眼睛 - 火焰橙红
  eyeGlow: '#FF6B35',         // 眼睛发光
  teeth: '#FFFFF0',           // 牙齿
  horn: '#F5F5DC',            // 羊角 - 米色
  hornDark: '#BDB76B',        // 深羊角
  snake: '#228B22',           // 蛇 - 森林绿
  snakeLight: '#32CD32',      // 蛇亮色
  snakeDark: '#006400',       // 蛇深色
  snakeBelly: '#90EE90',      // 蛇腹
  claw: '#8B4513',            // 爪
  paw: '#654321',             // 爪深
  wing: '#A0522D',            // 翅膀 - 赭色
  wingLight: '#CD853F',       // 翅膀亮
  wingDark: '#4A2C1F',        // 翅膀深
  flame: '#FF4500',           // 火焰 - 橙红
  flameLight: '#FFA500',      // 火焰亮
  nose: '#8B0000',            // 鼻子
  tongue: '#DC143C',          // 舌头
}

// 向左面朝 - 奇美拉（头部在左，蛇尾在右）
const CHIMERA_FACE_LEFT = [
  // ===== 狮子鬃毛与角 =====
  [2, 0, CHIMERA_COLORS.lionMane], [3, 0, CHIMERA_COLORS.horn], [4, 0, CHIMERA_COLORS.horn],
  [1, 1, CHIMERA_COLORS.lionManeDark], [2, 1, CHIMERA_COLORS.lionMane], [3, 1, CHIMERA_COLORS.lionFurLight], [4, 1, CHIMERA_COLORS.lionFur],
  [1, 2, CHIMERA_COLORS.lionMane], [2, 2, CHIMERA_COLORS.lionMane], [3, 2, CHIMERA_COLORS.lionFurLight], [4, 2, CHIMERA_COLORS.lionFur],
  // ===== 狮子头 =====
  [0, 3, CHIMERA_COLORS.lionManeDark], [1, 3, CHIMERA_COLORS.lionMane], [2, 3, CHIMERA_COLORS.lionFur], [3, 3, CHIMERA_COLORS.lionFurLight], [4, 3, CHIMERA_COLORS.lionFur], [5, 3, CHIMERA_COLORS.lionFurLight],
  [0, 4, CHIMERA_COLORS.lionMane], [1, 4, CHIMERA_COLORS.lionMane], [2, 4, CHIMERA_COLORS.lionFur], [3, 4, CHIMERA_COLORS.eye], [4, 4, CHIMERA_COLORS.lionFur], [5, 4, CHIMERA_COLORS.lionFurLight],
  [0, 5, CHIMERA_COLORS.lionManeDark], [1, 5, CHIMERA_COLORS.lionMane], [2, 5, CHIMERA_COLORS.lionFur], [3, 5, CHIMERA_COLORS.eyeGlow], [4, 5, CHIMERA_COLORS.nose], [5, 5, CHIMERA_COLORS.lionFur],
  [0, 6, CHIMERA_COLORS.lionManeDark], [1, 6, CHIMERA_COLORS.lionMane], [2, 6, CHIMERA_COLORS.teeth], [3, 6, CHIMERA_COLORS.teeth], [4, 6, CHIMERA_COLORS.teeth], [5, 6, CHIMERA_COLORS.lionFur],
  [1, 7, CHIMERA_COLORS.lionMane], [2, 7, CHIMERA_COLORS.teeth], [3, 7, CHIMERA_COLORS.tongue], [4, 7, CHIMERA_COLORS.teeth], [5, 7, CHIMERA_COLORS.lionFurDark],

  // ===== 颈部（山羊色过渡）=====
  [4, 8, CHIMERA_COLORS.goatBodyLight], [5, 8, CHIMERA_COLORS.goatBody],
  [3, 9, CHIMERA_COLORS.goatBody], [4, 9, CHIMERA_COLORS.goatBodyLight], [5, 9, CHIMERA_COLORS.goatBody], [6, 9, CHIMERA_COLORS.goatBodyLight],

  // ===== 山羊身体（前半）=====
  [2, 10, CHIMERA_COLORS.goatBodyDark], [3, 10, CHIMERA_COLORS.goatBody], [4, 10, CHIMERA_COLORS.goatBodyLight], [5, 10, CHIMERA_COLORS.goatBelly], [6, 10, CHIMERA_COLORS.goatBelly], [7, 10, CHIMERA_COLORS.goatBodyLight], [8, 10, CHIMERA_COLORS.goatBody],
  [2, 11, CHIMERA_COLORS.goatBodyDark], [3, 11, CHIMERA_COLORS.goatBody], [4, 11, CHIMERA_COLORS.goatBodyLight], [5, 11, CHIMERA_COLORS.goatBelly], [6, 11, CHIMERA_COLORS.goatBelly], [7, 11, CHIMERA_COLORS.goatBodyLight], [8, 11, CHIMERA_COLORS.goatBody], [9, 11, CHIMERA_COLORS.goatBodyDark],

  // ===== 山羊身体（后半，背部高一点）=====
  [3, 12, CHIMERA_COLORS.goatBodyDark], [4, 12, CHIMERA_COLORS.goatBody], [5, 12, CHIMERA_COLORS.goatBodyLight], [6, 12, CHIMERA_COLORS.goatBody], [7, 12, CHIMERA_COLORS.goatBodyLight], [8, 12, CHIMERA_COLORS.goatBody], [9, 12, CHIMERA_COLORS.goatBodyDark],
  [4, 13, CHIMERA_COLORS.goatBody], [5, 13, CHIMERA_COLORS.goatBodyLight], [6, 13, CHIMERA_COLORS.goatBelly], [7, 13, CHIMERA_COLORS.goatBody], [8, 13, CHIMERA_COLORS.goatBodyLight],

  // ===== 翅膀（在背上）=====
  [6, 7, CHIMERA_COLORS.wingDark], [7, 7, CHIMERA_COLORS.wing],
  [7, 8, CHIMERA_COLORS.wingLight], [8, 7, CHIMERA_COLORS.wingLight],
  [8, 8, CHIMERA_COLORS.wing], [9, 8, CHIMERA_COLORS.wingDark],
  [9, 9, CHIMERA_COLORS.wingDark],

  // ===== 蛇尾（向右蜿蜒）=====
  [9, 10, CHIMERA_COLORS.snakeDark], [10, 10, CHIMERA_COLORS.snake],
  [10, 11, CHIMERA_COLORS.snakeLight], [11, 11, CHIMERA_COLORS.snake],
  [11, 12, CHIMERA_COLORS.snakeLight], [12, 12, CHIMERA_COLORS.snake],
  [12, 13, CHIMERA_COLORS.snakeDark], [13, 13, CHIMERA_COLORS.snake],
  [13, 14, CHIMERA_COLORS.eye], [14, 14, CHIMERA_COLORS.snakeHead],

  // ===== 蛇头（带毒牙）=====
  [12, 15, CHIMERA_COLORS.snakeDark], [13, 15, CHIMERA_COLORS.snake], [14, 15, CHIMERA_COLORS.teeth],

  // ===== 前腿（狮子爪）=====
  [3, 13, CHIMERA_COLORS.lionFur], [4, 13, CHIMERA_COLORS.lionFurDark],
  [3, 14, CHIMERA_COLORS.paw], [4, 14, CHIMERA_COLORS.paw],
  [3, 15, CHIMERA_COLORS.claw], [4, 15, CHIMERA_COLORS.claw],

  // ===== 后腿（山羊蹄）=====
  [7, 14, CHIMERA_COLORS.goatBodyDark], [8, 14, CHIMERA_COLORS.goatBody],
  [7, 15, CHIMERA_COLORS.claw], [8, 15, CHIMERA_COLORS.claw],

  // ===== 火焰装饰（嘴边）=====
  [5, 6, CHIMERA_COLORS.flame],
]

// 向右面朝 - 奇美拉（头部在右，蛇尾在左）
const CHIMERA_FACE_RIGHT = [
  // ===== 狮子鬃毛与角 =====
  [11, 0, CHIMERA_COLORS.horn], [12, 0, CHIMERA_COLORS.horn], [13, 0, CHIMERA_COLORS.lionMane],
  [11, 1, CHIMERA_COLORS.lionFur], [12, 1, CHIMERA_COLORS.lionFurLight], [13, 1, CHIMERA_COLORS.lionMane], [14, 1, CHIMERA_COLORS.lionManeDark],
  [11, 2, CHIMERA_COLORS.lionFur], [12, 2, CHIMERA_COLORS.lionFurLight], [13, 2, CHIMERA_COLORS.lionMane], [14, 2, CHIMERA_COLORS.lionManeDark],
  // ===== 狮子头 =====
  [10, 3, CHIMERA_COLORS.lionFurLight], [11, 3, CHIMERA_COLORS.lionFurLight], [12, 3, CHIMERA_COLORS.lionFur], [13, 3, CHIMERA_COLORS.lionMane], [14, 3, CHIMERA_COLORS.lionManeDark], [15, 3, CHIMERA_COLORS.lionManeDark],
  [10, 4, CHIMERA_COLORS.lionFurLight], [11, 4, CHIMERA_COLORS.lionFur], [12, 4, CHIMERA_COLORS.eye], [13, 4, CHIMERA_COLORS.lionFur], [14, 4, CHIMERA_COLORS.lionMane], [15, 4, CHIMERA_COLORS.lionMane],
  [10, 5, CHIMERA_COLORS.lionFur], [11, 5, CHIMERA_COLORS.nose], [12, 5, CHIMERA_COLORS.eyeGlow], [13, 5, CHIMERA_COLORS.lionFur], [14, 5, CHIMERA_COLORS.lionMane], [15, 5, CHIMERA_COLORS.lionManeDark],
  [10, 6, CHIMERA_COLORS.lionFur], [11, 6, CHIMERA_COLORS.teeth], [12, 6, CHIMERA_COLORS.teeth], [13, 6, CHIMERA_COLORS.teeth], [14, 6, CHIMERA_COLORS.lionMane], [15, 6, CHIMERA_COLORS.lionManeDark],
  [10, 7, CHIMERA_COLORS.lionFurDark], [11, 7, CHIMERA_COLORS.teeth], [12, 7, CHIMERA_COLORS.tongue], [13, 7, CHIMERA_COLORS.teeth], [14, 7, CHIMERA_COLORS.lionMane],

  // ===== 颈部 =====
  [10, 8, CHIMERA_COLORS.goatBody], [11, 8, CHIMERA_COLORS.goatBodyLight],
  [9, 9, CHIMERA_COLORS.goatBodyLight], [10, 9, CHIMERA_COLORS.goatBody], [11, 9, CHIMERA_COLORS.goatBodyLight], [12, 9, CHIMERA_COLORS.goatBody],

  // ===== 山羊身体 =====
  [7, 10, CHIMERA_COLORS.goatBody], [8, 10, CHIMERA_COLORS.goatBodyLight], [9, 10, CHIMERA_COLORS.goatBelly], [10, 10, CHIMERA_COLORS.goatBelly], [11, 10, CHIMERA_COLORS.goatBodyLight], [12, 10, CHIMERA_COLORS.goatBody], [13, 10, CHIMERA_COLORS.goatBodyDark],
  [6, 11, CHIMERA_COLORS.goatBodyDark], [7, 11, CHIMERA_COLORS.goatBody], [8, 11, CHIMERA_COLORS.goatBodyLight], [9, 11, CHIMERA_COLORS.goatBelly], [10, 11, CHIMERA_COLORS.goatBelly], [11, 11, CHIMERA_COLORS.goatBodyLight], [12, 11, CHIMERA_COLORS.goatBody], [13, 11, CHIMERA_COLORS.goatBodyDark],

  // ===== 身体后半 =====
  [6, 12, CHIMERA_COLORS.goatBodyDark], [7, 12, CHIMERA_COLORS.goatBody], [8, 12, CHIMERA_COLORS.goatBodyLight], [9, 12, CHIMERA_COLORS.goatBody], [10, 12, CHIMERA_COLORS.goatBodyLight], [11, 12, CHIMERA_COLORS.goatBody], [12, 12, CHIMERA_COLORS.goatBodyDark],
  [7, 13, CHIMERA_COLORS.goatBodyLight], [8, 13, CHIMERA_COLORS.goatBody], [9, 13, CHIMERA_COLORS.goatBelly], [10, 13, CHIMERA_COLORS.goatBodyLight], [11, 13, CHIMERA_COLORS.goatBody],

  // ===== 翅膀 =====
  [7, 7, CHIMERA_COLORS.wing], [8, 7, CHIMERA_COLORS.wingDark],
  [7, 8, CHIMERA_COLORS.wingLight], [6, 7, CHIMERA_COLORS.wingLight],
  [6, 8, CHIMERA_COLORS.wing], [5, 8, CHIMERA_COLORS.wingDark],
  [5, 9, CHIMERA_COLORS.wingDark],

  // ===== 蛇尾（向左蜿蜒）=====
  [5, 10, CHIMERA_COLORS.snake], [4, 10, CHIMERA_COLORS.snakeDark],
  [4, 11, CHIMERA_COLORS.snake], [3, 11, CHIMERA_COLORS.snakeLight],
  [3, 12, CHIMERA_COLORS.snake], [2, 12, CHIMERA_COLORS.snakeLight],
  [2, 13, CHIMERA_COLORS.snake], [1, 13, CHIMERA_COLORS.snakeDark],
  [1, 14, CHIMERA_COLORS.snake], [0, 14, CHIMERA_COLORS.eye],

  // ===== 蛇头 =====
  [1, 15, CHIMERA_COLORS.teeth], [2, 15, CHIMERA_COLORS.snake], [3, 15, CHIMERA_COLORS.snakeDark],

  // ===== 前腿（狮子爪）=====
  [11, 13, CHIMERA_COLORS.lionFurDark], [12, 13, CHIMERA_COLORS.lionFur],
  [11, 14, CHIMERA_COLORS.paw], [12, 14, CHIMERA_COLORS.paw],
  [11, 15, CHIMERA_COLORS.claw], [12, 15, CHIMERA_COLORS.claw],

  // ===== 后腿（山羊蹄）=====
  [7, 14, CHIMERA_COLORS.goatBody], [8, 14, CHIMERA_COLORS.goatBodyDark],
  [7, 15, CHIMERA_COLORS.claw], [8, 15, CHIMERA_COLORS.claw],

  // ===== 火焰装饰 =====
  [10, 6, CHIMERA_COLORS.flame],
]

// 向下面朝 - 奇美拉正面
const CHIMERA_FACE_DOWN = [
  // ===== 顶部双角 =====
  [5, 0, CHIMERA_COLORS.horn], [6, 0, CHIMERA_COLORS.horn], [9, 0, CHIMERA_COLORS.horn], [10, 0, CHIMERA_COLORS.horn],
  [5, 1, CHIMERA_COLORS.hornDark], [6, 1, CHIMERA_COLORS.lionFurLight], [9, 1, CHIMERA_COLORS.lionFurLight], [10, 1, CHIMERA_COLORS.hornDark],
  // ===== 鬃毛 =====
  [3, 2, CHIMERA_COLORS.lionManeDark], [4, 2, CHIMERA_COLORS.lionMane], [5, 2, CHIMERA_COLORS.lionFurLight], [6, 2, CHIMERA_COLORS.lionFur], [7, 2, CHIMERA_COLORS.lionFurLight], [8, 2, CHIMERA_COLORS.lionFur], [9, 2, CHIMERA_COLORS.lionFurLight], [10, 2, CHIMERA_COLORS.lionMane], [11, 2, CHIMERA_COLORS.lionManeDark],
  [2, 3, CHIMERA_COLORS.lionManeDark], [3, 3, CHIMERA_COLORS.lionMane], [4, 3, CHIMERA_COLORS.lionFur], [5, 3, CHIMERA_COLORS.lionFurLight], [6, 3, CHIMERA_COLORS.lionFur], [7, 3, CHIMERA_COLORS.lionFurLight], [8, 3, CHIMERA_COLORS.lionFur], [9, 3, CHIMERA_COLORS.lionFurLight], [10, 3, CHIMERA_COLORS.lionFur], [11, 3, CHIMERA_COLORS.lionMane], [12, 3, CHIMERA_COLORS.lionManeDark],

  // ===== 狮子脸 =====
  [3, 4, CHIMERA_COLORS.lionMane], [4, 4, CHIMERA_COLORS.lionFur], [5, 4, CHIMERA_COLORS.eye], [6, 4, CHIMERA_COLORS.lionFurLight], [7, 4, CHIMERA_COLORS.lionFurLight], [8, 4, CHIMERA_COLORS.lionFurLight], [9, 4, CHIMERA_COLORS.eye], [10, 4, CHIMERA_COLORS.lionFur], [11, 4, CHIMERA_COLORS.lionMane],
  [3, 5, CHIMERA_COLORS.lionMane], [4, 5, CHIMERA_COLORS.lionFur], [5, 5, CHIMERA_COLORS.eyeGlow], [6, 5, CHIMERA_COLORS.lionFur], [7, 5, CHIMERA_COLORS.nose], [8, 5, CHIMERA_COLORS.nose], [9, 5, CHIMERA_COLORS.eyeGlow], [10, 5, CHIMERA_COLORS.lionFur], [11, 5, CHIMERA_COLORS.lionMane],
  [4, 6, CHIMERA_COLORS.lionFurDark], [5, 6, CHIMERA_COLORS.teeth], [6, 6, CHIMERA_COLORS.teeth], [7, 6, CHIMERA_COLORS.nose], [8, 6, CHIMERA_COLORS.teeth], [9, 6, CHIMERA_COLORS.teeth], [10, 6, CHIMERA_COLORS.lionFurDark],
  [5, 7, CHIMERA_COLORS.teeth], [6, 7, CHIMERA_COLORS.tongue], [7, 7, CHIMERA_COLORS.tongue], [8, 7, CHIMERA_COLORS.tongue], [9, 7, CHIMERA_COLORS.teeth],

  // ===== 颈部 =====
  [5, 8, CHIMERA_COLORS.goatBody], [6, 8, CHIMERA_COLORS.goatBodyLight], [7, 8, CHIMERA_COLORS.goatBodyLight], [8, 8, CHIMERA_COLORS.goatBody], [9, 8, CHIMERA_COLORS.goatBody],
  [4, 9, CHIMERA_COLORS.goatBody], [5, 9, CHIMERA_COLORS.goatBodyLight], [6, 9, CHIMERA_COLORS.goatBody], [7, 9, CHIMERA_COLORS.goatBody], [8, 9, CHIMERA_COLORS.goatBody], [9, 9, CHIMERA_COLORS.goatBodyLight], [10, 9, CHIMERA_COLORS.goatBody],

  // ===== 山羊身体（胸部）=====
  [3, 10, CHIMERA_COLORS.goatBodyDark], [4, 10, CHIMERA_COLORS.goatBody], [5, 10, CHIMERA_COLORS.goatBodyLight], [6, 10, CHIMERA_COLORS.goatBelly], [7, 10, CHIMERA_COLORS.goatBelly], [8, 10, CHIMERA_COLORS.goatBelly], [9, 10, CHIMERA_COLORS.goatBodyLight], [10, 10, CHIMERA_COLORS.goatBody], [11, 10, CHIMERA_COLORS.goatBodyDark],
  [3, 11, CHIMERA_COLORS.goatBodyDark], [4, 11, CHIMERA_COLORS.goatBody], [5, 11, CHIMERA_COLORS.goatBodyLight], [6, 11, CHIMERA_COLORS.goatBelly], [7, 11, CHIMERA_COLORS.goatBelly], [8, 11, CHIMERA_COLORS.goatBelly], [9, 11, CHIMERA_COLORS.goatBodyLight], [10, 11, CHIMERA_COLORS.goatBody], [11, 11, CHIMERA_COLORS.goatBodyDark],

  // ===== 身体中部 =====
  [4, 12, CHIMERA_COLORS.goatBody], [5, 12, CHIMERA_COLORS.goatBodyLight], [6, 12, CHIMERA_COLORS.goatBelly], [7, 12, CHIMERA_COLORS.goatBelly], [8, 12, CHIMERA_COLORS.goatBelly], [9, 12, CHIMERA_COLORS.goatBodyLight], [10, 12, CHIMERA_COLORS.goatBody],
  [5, 13, CHIMERA_COLORS.goatBodyLight], [6, 13, CHIMERA_COLORS.goatBody], [7, 13, CHIMERA_COLORS.goatBodyLight], [8, 13, CHIMERA_COLORS.goatBody], [9, 13, CHIMERA_COLORS.goatBodyLight],

  // ===== 蛇尾（向下中间）=====
  [6, 14, CHIMERA_COLORS.snake], [7, 14, CHIMERA_COLORS.snakeLight], [8, 14, CHIMERA_COLORS.snake],
  [5, 15, CHIMERA_COLORS.snakeDark], [6, 15, CHIMERA_COLORS.snake], [7, 15, CHIMERA_COLORS.eye], [8, 15, CHIMERA_COLORS.snake], [9, 15, CHIMERA_COLORS.snakeDark],

  // ===== 翅膀（两侧）=====
  [2, 9, CHIMERA_COLORS.wingDark], [1, 10, CHIMERA_COLORS.wing],
  [1, 11, CHIMERA_COLORS.wingLight], [2, 11, CHIMERA_COLORS.wing],
  [12, 9, CHIMERA_COLORS.wingDark], [13, 10, CHIMERA_COLORS.wing],
  [13, 11, CHIMERA_COLORS.wingLight], [12, 11, CHIMERA_COLORS.wing],

  // ===== 四条腿 =====
  // 左前腿
  [4, 13, CHIMERA_COLORS.goatBodyDark], [5, 13, CHIMERA_COLORS.goatBody],
  [4, 14, CHIMERA_COLORS.paw], [5, 14, CHIMERA_COLORS.paw],
  [4, 15, CHIMERA_COLORS.claw], [5, 15, CHIMERA_COLORS.claw],
  // 右前腿
  [9, 13, CHIMERA_COLORS.goatBody], [10, 13, CHIMERA_COLORS.goatBodyDark],
  [9, 14, CHIMERA_COLORS.paw], [10, 14, CHIMERA_COLORS.paw],
  [9, 15, CHIMERA_COLORS.claw], [10, 15, CHIMERA_COLORS.claw],
  // 左后腿
  [6, 14, CHIMERA_COLORS.goatBody],
  [6, 15, CHIMERA_COLORS.claw],
  // 右后腿
  [8, 14, CHIMERA_COLORS.goatBody],
  [8, 15, CHIMERA_COLORS.claw],

  // ===== 火焰（嘴边）=====
  [7, 7, CHIMERA_COLORS.flameLight], [7, 6, CHIMERA_COLORS.flame],
]

// 向上面朝 - 奇美拉背面
const CHIMERA_FACE_UP = [
  // ===== 顶部（鬃毛 + 背部）=====
  [4, 0, CHIMERA_COLORS.lionManeDark], [5, 0, CHIMERA_COLORS.lionMane], [6, 0, CHIMERA_COLORS.lionMane], [7, 0, CHIMERA_COLORS.lionMane], [8, 0, CHIMERA_COLORS.lionMane], [9, 0, CHIMERA_COLORS.lionMane], [10, 0, CHIMERA_COLORS.lionManeDark],
  [3, 1, CHIMERA_COLORS.lionManeDark], [4, 1, CHIMERA_COLORS.lionMane], [5, 1, CHIMERA_COLORS.lionFurLight], [6, 1, CHIMERA_COLORS.lionFur], [7, 1, CHIMERA_COLORS.lionFurLight], [8, 1, CHIMERA_COLORS.lionFur], [9, 1, CHIMERA_COLORS.lionFurLight], [10, 1, CHIMERA_COLORS.lionMane], [11, 1, CHIMERA_COLORS.lionManeDark],
  [3, 2, CHIMERA_COLORS.lionManeDark], [4, 2, CHIMERA_COLORS.lionMane], [5, 2, CHIMERA_COLORS.lionFur], [6, 2, CHIMERA_COLORS.lionFurLight], [7, 2, CHIMERA_COLORS.lionFur], [8, 2, CHIMERA_COLORS.lionFurLight], [9, 2, CHIMERA_COLORS.lionFur], [10, 2, CHIMERA_COLORS.lionMane], [11, 2, CHIMERA_COLORS.lionManeDark],
  [3, 3, CHIMERA_COLORS.lionMane], [4, 3, CHIMERA_COLORS.lionFur], [5, 3, CHIMERA_COLORS.lionFur], [6, 3, CHIMERA_COLORS.lionFurLight], [7, 3, CHIMERA_COLORS.lionFur], [8, 3, CHIMERA_COLORS.lionFurLight], [9, 3, CHIMERA_COLORS.lionFur], [10, 3, CHIMERA_COLORS.lionFur], [11, 3, CHIMERA_COLORS.lionMane],

  // ===== 颈部（背面）=====
  [4, 4, CHIMERA_COLORS.goatBody], [5, 4, CHIMERA_COLORS.goatBodyLight], [6, 4, CHIMERA_COLORS.goatBody], [7, 4, CHIMERA_COLORS.goatBodyLight], [8, 4, CHIMERA_COLORS.goatBody], [9, 4, CHIMERA_COLORS.goatBodyLight], [10, 4, CHIMERA_COLORS.goatBody],
  [4, 5, CHIMERA_COLORS.goatBody], [5, 5, CHIMERA_COLORS.goatBody], [6, 5, CHIMERA_COLORS.goatBodyLight], [7, 5, CHIMERA_COLORS.goatBody], [8, 5, CHIMERA_COLORS.goatBodyLight], [9, 5, CHIMERA_COLORS.goatBody], [10, 5, CHIMERA_COLORS.goatBody],

  // ===== 山羊身体背部 =====
  [3, 6, CHIMERA_COLORS.goatBodyDark], [4, 6, CHIMERA_COLORS.goatBody], [5, 6, CHIMERA_COLORS.goatBodyLight], [6, 6, CHIMERA_COLORS.goatBody], [7, 6, CHIMERA_COLORS.goatBodyLight], [8, 6, CHIMERA_COLORS.goatBody], [9, 6, CHIMERA_COLORS.goatBodyLight], [10, 6, CHIMERA_COLORS.goatBody], [11, 6, CHIMERA_COLORS.goatBodyDark],
  [2, 7, CHIMERA_COLORS.goatBodyDark], [3, 7, CHIMERA_COLORS.goatBody], [4, 7, CHIMERA_COLORS.goatBody], [5, 7, CHIMERA_COLORS.goatBodyLight], [6, 7, CHIMERA_COLORS.goatBody], [7, 7, CHIMERA_COLORS.goatBodyLight], [8, 7, CHIMERA_COLORS.goatBody], [9, 7, CHIMERA_COLORS.goatBodyLight], [10, 7, CHIMERA_COLORS.goatBody], [11, 7, CHIMERA_COLORS.goatBody], [12, 7, CHIMERA_COLORS.goatBodyDark],
  [2, 8, CHIMERA_COLORS.goatBodyDark], [3, 8, CHIMERA_COLORS.goatBody], [4, 8, CHIMERA_COLORS.goatBody], [5, 8, CHIMERA_COLORS.goatBody], [6, 8, CHIMERA_COLORS.goatBodyLight], [7, 8, CHIMERA_COLORS.goatBody], [8, 8, CHIMERA_COLORS.goatBodyLight], [9, 8, CHIMERA_COLORS.goatBody], [10, 8, CHIMERA_COLORS.goatBody], [11, 8, CHIMERA_COLORS.goatBody], [12, 8, CHIMERA_COLORS.goatBodyDark],
  [3, 9, CHIMERA_COLORS.goatBodyDark], [4, 9, CHIMERA_COLORS.goatBody], [5, 9, CHIMERA_COLORS.goatBodyLight], [6, 9, CHIMERA_COLORS.goatBody], [7, 9, CHIMERA_COLORS.goatBodyLight], [8, 9, CHIMERA_COLORS.goatBody], [9, 9, CHIMERA_COLORS.goatBodyLight], [10, 9, CHIMERA_COLORS.goatBody], [11, 9, CHIMERA_COLORS.goatBodyDark],

  // ===== 身体后半（臀部）=====
  [4, 10, CHIMERA_COLORS.goatBody], [5, 10, CHIMERA_COLORS.goatBodyLight], [6, 10, CHIMERA_COLORS.goatBody], [7, 10, CHIMERA_COLORS.goatBodyLight], [8, 10, CHIMERA_COLORS.goatBody], [9, 10, CHIMERA_COLORS.goatBodyLight], [10, 10, CHIMERA_COLORS.goatBody],
  [5, 11, CHIMERA_COLORS.goatBody], [6, 11, CHIMERA_COLORS.goatBody], [7, 11, CHIMERA_COLORS.goatBodyLight], [8, 11, CHIMERA_COLORS.goatBody], [9, 11, CHIMERA_COLORS.goatBody],

  // ===== 翅膀 =====
  [1, 5, CHIMERA_COLORS.wingDark], [2, 5, CHIMERA_COLORS.wing],
  [0, 6, CHIMERA_COLORS.wing], [1, 6, CHIMERA_COLORS.wingLight], [2, 6, CHIMERA_COLORS.wingLight],
  [0, 7, CHIMERA_COLORS.wingDark], [1, 7, CHIMERA_COLORS.wing],
  [12, 5, CHIMERA_COLORS.wing], [13, 5, CHIMERA_COLORS.wingDark],
  [12, 6, CHIMERA_COLORS.wingLight], [13, 6, CHIMERA_COLORS.wingLight], [14, 6, CHIMERA_COLORS.wing],
  [13, 7, CHIMERA_COLORS.wing], [14, 7, CHIMERA_COLORS.wingDark],

  // ===== 蛇尾（向下蜿蜒）=====
  [6, 12, CHIMERA_COLORS.snakeDark], [7, 12, CHIMERA_COLORS.snake], [8, 12, CHIMERA_COLORS.snakeDark],
  [5, 13, CHIMERA_COLORS.snake], [6, 13, CHIMERA_COLORS.snakeLight], [7, 13, CHIMERA_COLORS.snake], [8, 13, CHIMERA_COLORS.snakeLight], [9, 13, CHIMERA_COLORS.snake],
  [6, 14, CHIMERA_COLORS.snake], [7, 14, CHIMERA_COLORS.snakeLight], [8, 14, CHIMERA_COLORS.snake],
  [6, 15, CHIMERA_COLORS.snakeDark], [7, 15, CHIMERA_COLORS.eye], [8, 15, CHIMERA_COLORS.snakeDark],

  // ===== 四条腿（背面看）=====
  // 左前腿
  [4, 11, CHIMERA_COLORS.goatBodyDark], [5, 11, CHIMERA_COLORS.goatBody],
  [4, 12, CHIMERA_COLORS.paw], [5, 12, CHIMERA_COLORS.paw],
  [4, 13, CHIMERA_COLORS.claw], [5, 13, CHIMERA_COLORS.claw],
  // 右前腿
  [9, 11, CHIMERA_COLORS.goatBody], [10, 11, CHIMERA_COLORS.goatBodyDark],
  [9, 12, CHIMERA_COLORS.paw], [10, 12, CHIMERA_COLORS.paw],
  [9, 13, CHIMERA_COLORS.claw], [10, 13, CHIMERA_COLORS.claw],
  // 左后腿
  [6, 12, CHIMERA_COLORS.goatBody],
  [6, 13, CHIMERA_COLORS.paw],
  [6, 14, CHIMERA_COLORS.claw],
  // 右后腿
  [8, 12, CHIMERA_COLORS.goatBody],
  [8, 13, CHIMERA_COLORS.paw],
  [8, 14, CHIMERA_COLORS.claw],
]

// 待机帧动画 - 轻微呼吸
const CHIMERA_IDLE_FRAMES = [
  [
    { pixels: [
      [7, 7, CHIMERA_COLORS.flame],
    ] }
  ],
  [
    { pixels: [
      [7, 8, CHIMERA_COLORS.flameLight],
    ] }
  ]
]

// 行走帧动画
const CHIMERA_WALK_FRAMES = [
  [
    { pixels: [
      [3, 13, CHIMERA_COLORS.goatBody], [4, 13, CHIMERA_COLORS.goatBodyDark], [9, 13, CHIMERA_COLORS.goatBodyDark], [10, 13, CHIMERA_COLORS.goatBody],
      [3, 14, CHIMERA_COLORS.paw], [4, 14, CHIMERA_COLORS.paw], [9, 14, CHIMERA_COLORS.paw], [10, 14, CHIMERA_COLORS.paw],
      [3, 15, CHIMERA_COLORS.claw], [4, 15, CHIMERA_COLORS.claw], [9, 15, CHIMERA_COLORS.claw], [10, 15, CHIMERA_COLORS.claw],
    ] }
  ],
  [
    { pixels: [
      [4, 13, CHIMERA_COLORS.goatBody], [5, 13, CHIMERA_COLORS.goatBodyDark], [8, 13, CHIMERA_COLORS.goatBodyDark], [9, 13, CHIMERA_COLORS.goatBody],
      [4, 14, CHIMERA_COLORS.paw], [5, 14, CHIMERA_COLORS.paw], [8, 14, CHIMERA_COLORS.paw], [9, 14, CHIMERA_COLORS.paw],
      [4, 15, CHIMERA_COLORS.claw], [5, 15, CHIMERA_COLORS.claw], [8, 15, CHIMERA_COLORS.claw], [9, 15, CHIMERA_COLORS.claw],
    ] }
  ],
  [
    { pixels: [
      [5, 13, CHIMERA_COLORS.goatBodyDark], [6, 13, CHIMERA_COLORS.goatBody], [7, 13, CHIMERA_COLORS.goatBody], [8, 13, CHIMERA_COLORS.goatBodyDark],
      [5, 14, CHIMERA_COLORS.paw], [6, 14, CHIMERA_COLORS.paw], [7, 14, CHIMERA_COLORS.paw], [8, 14, CHIMERA_COLORS.paw],
      [5, 15, CHIMERA_COLORS.claw], [6, 15, CHIMERA_COLORS.claw], [7, 15, CHIMERA_COLORS.claw], [8, 15, CHIMERA_COLORS.claw],
    ] }
  ]
]

export const drawChimera = (canvasRef, currentUnit) => {
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
  let basePixels = CHIMERA_FACE_LEFT
  if (direction === 'up') basePixels = CHIMERA_FACE_UP
  else if (direction === 'down') basePixels = CHIMERA_FACE_DOWN
  else if (direction === 'right') basePixels = CHIMERA_FACE_RIGHT

  // 绘制基础角色
  for (let i = 0; i < basePixels.length; i++) {
    drawPixel(basePixels[i][0], basePixels[i][1], basePixels[i][2])
  }

  // 绘制动画层
  const isMoving = currentUnit.isMoving || false
  const frames = isMoving ? CHIMERA_WALK_FRAMES : CHIMERA_IDLE_FRAMES
  const frameIndex = Math.floor(frame) % frames.length
  const currentFrame = frames[frameIndex]

  for (const layer of currentFrame) {
    for (const pixel of layer.pixels) {
      drawPixel(pixel[0], pixel[1], pixel[2])
    }
  }
}
