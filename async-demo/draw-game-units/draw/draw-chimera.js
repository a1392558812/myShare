import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.005,
  WALK_SPEED: 0.08,
}

const CHIMERA_COLORS = {
  lionFur: '#DAA520',
  lionFurLight: '#FFD700',
  lionFurDark: '#8B6914',
  lionMane: '#B8860B',
  lionManeDark: '#6B4F0A',
  goatBody: '#CD853F',
  goatBodyLight: '#DEB887',
  goatBodyDark: '#8B4513',
  goatBelly: '#F4A460',
  eye: '#FF4500',
  eyeGlow: '#FF6B35',
  teeth: '#FFFFF0',
  horn: '#F5F5DC',
  hornDark: '#BDB76B',
  snake: '#228B22',
  snakeLight: '#32CD32',
  snakeDark: '#006400',
  snakeBelly: '#90EE90',
  claw: '#8B4513',
  paw: '#654321',
  wing: '#A0522D',
  wingLight: '#CD853F',
  wingDark: '#4A2C1F',
  flame: '#FF4500',
  flameLight: '#FFA500',
  nose: '#8B0000',
  tongue: '#DC143C',
  highlight: '#ffffff',
  snakeHead: '#228B22',
}

const CHIMERA_AVATAR = [
  [5, 0, CHIMERA_COLORS.horn], [6, 0, CHIMERA_COLORS.horn], [9, 0, CHIMERA_COLORS.horn], [10, 0, CHIMERA_COLORS.horn],
  [4, 1, CHIMERA_COLORS.hornDark], [5, 1, CHIMERA_COLORS.horn], [6, 1, CHIMERA_COLORS.lionFurLight], [9, 1, CHIMERA_COLORS.lionFurLight], [10, 1, CHIMERA_COLORS.horn], [11, 1, CHIMERA_COLORS.hornDark],
  [4, 2, CHIMERA_COLORS.horn], [5, 2, CHIMERA_COLORS.lionFurLight], [6, 2, CHIMERA_COLORS.lionFur], [9, 2, CHIMERA_COLORS.lionFur], [10, 2, CHIMERA_COLORS.lionFurLight], [11, 2, CHIMERA_COLORS.horn],

  [3, 2, CHIMERA_COLORS.lionManeDark], [4, 2, CHIMERA_COLORS.lionMane], [11, 2, CHIMERA_COLORS.lionMane], [12, 2, CHIMERA_COLORS.lionManeDark],
  [2, 3, CHIMERA_COLORS.lionManeDark], [3, 3, CHIMERA_COLORS.lionMane], [4, 3, CHIMERA_COLORS.lionFur], [5, 3, CHIMERA_COLORS.lionFurLight], [6, 3, CHIMERA_COLORS.lionFur], [7, 3, CHIMERA_COLORS.lionFurLight], [8, 3, CHIMERA_COLORS.lionFurLight], [9, 3, CHIMERA_COLORS.lionFur], [10, 3, CHIMERA_COLORS.lionFurLight], [11, 3, CHIMERA_COLORS.lionFur], [12, 3, CHIMERA_COLORS.lionMane], [13, 3, CHIMERA_COLORS.lionManeDark],
  [2, 4, CHIMERA_COLORS.lionManeDark], [3, 4, CHIMERA_COLORS.lionMane], [4, 4, CHIMERA_COLORS.lionFur], [5, 4, CHIMERA_COLORS.lionFurLight], [6, 4, CHIMERA_COLORS.lionFur], [7, 4, CHIMERA_COLORS.lionFurLight], [8, 4, CHIMERA_COLORS.lionFurLight], [9, 4, CHIMERA_COLORS.lionFur], [10, 4, CHIMERA_COLORS.lionFurLight], [11, 4, CHIMERA_COLORS.lionFur], [12, 4, CHIMERA_COLORS.lionMane], [13, 4, CHIMERA_COLORS.lionManeDark],

  [2, 5, CHIMERA_COLORS.lionManeDark], [3, 5, CHIMERA_COLORS.lionMane], [4, 5, CHIMERA_COLORS.eye], [5, 5, CHIMERA_COLORS.lionFur], [6, 5, CHIMERA_COLORS.lionFurLight], [7, 5, CHIMERA_COLORS.lionFurLight], [8, 5, CHIMERA_COLORS.lionFurLight], [9, 5, CHIMERA_COLORS.lionFur], [10, 5, CHIMERA_COLORS.eye], [11, 5, CHIMERA_COLORS.lionMane], [12, 5, CHIMERA_COLORS.lionManeDark],
  [4, 4, CHIMERA_COLORS.highlight], [5, 4, CHIMERA_COLORS.highlight], [10, 4, CHIMERA_COLORS.highlight], [11, 4, CHIMERA_COLORS.highlight],
  [4, 5, CHIMERA_COLORS.eyeGlow], [5, 5, CHIMERA_COLORS.eyeGlow], [10, 5, CHIMERA_COLORS.eyeGlow], [11, 5, CHIMERA_COLORS.eyeGlow],

  [3, 6, CHIMERA_COLORS.lionMane], [4, 6, CHIMERA_COLORS.lionFur], [5, 6, CHIMERA_COLORS.eyeGlow], [6, 6, CHIMERA_COLORS.nose], [7, 6, CHIMERA_COLORS.nose], [8, 6, CHIMERA_COLORS.nose], [9, 6, CHIMERA_COLORS.eyeGlow], [10, 6, CHIMERA_COLORS.lionFur], [11, 6, CHIMERA_COLORS.lionMane],
  [4, 7, CHIMERA_COLORS.lionFurDark], [5, 7, CHIMERA_COLORS.teeth], [6, 7, CHIMERA_COLORS.teeth], [7, 7, CHIMERA_COLORS.nose], [8, 7, CHIMERA_COLORS.teeth], [9, 7, CHIMERA_COLORS.teeth], [10, 7, CHIMERA_COLORS.lionFurDark],
  [5, 8, CHIMERA_COLORS.teeth], [6, 8, CHIMERA_COLORS.teeth], [7, 8, CHIMERA_COLORS.tongue], [8, 8, CHIMERA_COLORS.tongue], [9, 8, CHIMERA_COLORS.teeth],

  [4, 9, CHIMERA_COLORS.lionFurDark], [5, 9, CHIMERA_COLORS.teeth], [6, 9, CHIMERA_COLORS.teeth], [7, 9, CHIMERA_COLORS.tongue], [8, 9, CHIMERA_COLORS.tongue], [9, 9, CHIMERA_COLORS.teeth], [10, 9, CHIMERA_COLORS.teeth], [11, 9, CHIMERA_COLORS.lionFurDark],
  [5, 10, CHIMERA_COLORS.teeth], [6, 10, CHIMERA_COLORS.tongue], [7, 10, CHIMERA_COLORS.tongue], [8, 10, CHIMERA_COLORS.tongue], [9, 10, CHIMERA_COLORS.teeth], [10, 10, CHIMERA_COLORS.teeth],

  [4, 11, CHIMERA_COLORS.lionFurDark], [5, 11, CHIMERA_COLORS.lionFur], [6, 11, CHIMERA_COLORS.lionFur], [7, 11, CHIMERA_COLORS.lionFur], [8, 11, CHIMERA_COLORS.lionFur], [9, 11, CHIMERA_COLORS.lionFur], [10, 11, CHIMERA_COLORS.lionFurDark],
  [5, 12, CHIMERA_COLORS.lionFur], [6, 12, CHIMERA_COLORS.lionFurDark], [7, 12, CHIMERA_COLORS.lionFurDark], [8, 12, CHIMERA_COLORS.lionFurDark], [9, 12, CHIMERA_COLORS.lionFur],

  [4, 13, CHIMERA_COLORS.lionMane], [5, 13, CHIMERA_COLORS.lionFur], [6, 13, CHIMERA_COLORS.lionFur], [7, 13, CHIMERA_COLORS.lionFur], [8, 13, CHIMERA_COLORS.lionFur], [9, 13, CHIMERA_COLORS.lionFur], [10, 13, CHIMERA_COLORS.lionMane],
  [5, 14, CHIMERA_COLORS.lionManeDark], [6, 14, CHIMERA_COLORS.lionMane], [7, 14, CHIMERA_COLORS.lionMane], [8, 14, CHIMERA_COLORS.lionMane], [9, 14, CHIMERA_COLORS.lionManeDark],

  [6, 8, CHIMERA_COLORS.flame], [7, 8, CHIMERA_COLORS.flameLight],
  [6, 7, CHIMERA_COLORS.flameLight], [7, 7, CHIMERA_COLORS.flame],
]

const CHIMERA_FACE_LEFT = [
  [4, 0, CHIMERA_COLORS.lionMane], [5, 0, CHIMERA_COLORS.horn], [6, 0, CHIMERA_COLORS.horn],
  [3, 1, CHIMERA_COLORS.lionManeDark], [4, 1, CHIMERA_COLORS.lionMane], [5, 1, CHIMERA_COLORS.lionFurLight], [6, 1, CHIMERA_COLORS.lionFur],
  [3, 2, CHIMERA_COLORS.lionMane], [4, 2, CHIMERA_COLORS.lionMane], [5, 2, CHIMERA_COLORS.lionFurLight], [6, 2, CHIMERA_COLORS.lionFur],
  [2, 3, CHIMERA_COLORS.lionManeDark], [3, 3, CHIMERA_COLORS.lionMane], [4, 3, CHIMERA_COLORS.lionFur], [5, 3, CHIMERA_COLORS.lionFurLight], [6, 3, CHIMERA_COLORS.lionFur], [7, 3, CHIMERA_COLORS.lionFurLight],
  [2, 4, CHIMERA_COLORS.lionMane], [3, 4, CHIMERA_COLORS.lionMane], [4, 4, CHIMERA_COLORS.lionFur], [5, 4, CHIMERA_COLORS.eye], [6, 4, CHIMERA_COLORS.lionFur], [7, 4, CHIMERA_COLORS.lionFurLight],
  [2, 5, CHIMERA_COLORS.lionManeDark], [3, 5, CHIMERA_COLORS.lionMane], [4, 5, CHIMERA_COLORS.lionFur], [5, 5, CHIMERA_COLORS.eyeGlow], [6, 5, CHIMERA_COLORS.nose], [7, 5, CHIMERA_COLORS.lionFur],
  [2, 6, CHIMERA_COLORS.lionManeDark], [3, 6, CHIMERA_COLORS.lionMane], [4, 6, CHIMERA_COLORS.teeth], [5, 6, CHIMERA_COLORS.teeth], [6, 6, CHIMERA_COLORS.teeth], [7, 6, CHIMERA_COLORS.lionFur],
  [3, 7, CHIMERA_COLORS.lionMane], [4, 7, CHIMERA_COLORS.teeth], [5, 7, CHIMERA_COLORS.tongue], [6, 7, CHIMERA_COLORS.teeth], [7, 7, CHIMERA_COLORS.lionFurDark],

  [6, 8, CHIMERA_COLORS.goatBodyLight], [7, 8, CHIMERA_COLORS.goatBody],
  [5, 9, CHIMERA_COLORS.goatBody], [6, 9, CHIMERA_COLORS.goatBodyLight], [7, 9, CHIMERA_COLORS.goatBody], [8, 9, CHIMERA_COLORS.goatBodyLight],

  [4, 10, CHIMERA_COLORS.goatBodyDark], [5, 10, CHIMERA_COLORS.goatBody], [6, 10, CHIMERA_COLORS.goatBodyLight], [7, 10, CHIMERA_COLORS.goatBelly], [8, 10, CHIMERA_COLORS.goatBelly], [9, 10, CHIMERA_COLORS.goatBodyLight], [10, 10, CHIMERA_COLORS.goatBody],
  [4, 11, CHIMERA_COLORS.goatBodyDark], [5, 11, CHIMERA_COLORS.goatBody], [6, 11, CHIMERA_COLORS.goatBodyLight], [7, 11, CHIMERA_COLORS.goatBelly], [8, 11, CHIMERA_COLORS.goatBelly], [9, 11, CHIMERA_COLORS.goatBodyLight], [10, 11, CHIMERA_COLORS.goatBody], [11, 11, CHIMERA_COLORS.goatBodyDark],

  [5, 12, CHIMERA_COLORS.goatBodyDark], [6, 12, CHIMERA_COLORS.goatBody], [7, 12, CHIMERA_COLORS.goatBodyLight], [8, 12, CHIMERA_COLORS.goatBody], [9, 12, CHIMERA_COLORS.goatBodyLight], [10, 12, CHIMERA_COLORS.goatBody], [11, 12, CHIMERA_COLORS.goatBodyDark],
  [6, 13, CHIMERA_COLORS.goatBody], [7, 13, CHIMERA_COLORS.goatBodyLight], [8, 13, CHIMERA_COLORS.goatBelly], [9, 13, CHIMERA_COLORS.goatBody], [10, 13, CHIMERA_COLORS.goatBodyLight],

  [8, 7, CHIMERA_COLORS.wingDark], [9, 7, CHIMERA_COLORS.wing],
  [9, 8, CHIMERA_COLORS.wingLight], [10, 8, CHIMERA_COLORS.wingLight],
  [10, 8, CHIMERA_COLORS.wing], [11, 8, CHIMERA_COLORS.wingDark],
  [11, 9, CHIMERA_COLORS.wingDark],

  [11, 10, CHIMERA_COLORS.snakeDark], [12, 10, CHIMERA_COLORS.snake],
  [12, 11, CHIMERA_COLORS.snakeLight], [13, 11, CHIMERA_COLORS.snake],
  [13, 12, CHIMERA_COLORS.snakeLight], [14, 12, CHIMERA_COLORS.snake],
  [14, 13, CHIMERA_COLORS.snakeDark], [15, 13, CHIMERA_COLORS.snake],
  [15, 14, CHIMERA_COLORS.eye], [16, 14, CHIMERA_COLORS.snakeHead],

  [14, 15, CHIMERA_COLORS.snakeDark], [15, 15, CHIMERA_COLORS.snake], [16, 15, CHIMERA_COLORS.teeth],

  [5, 13, CHIMERA_COLORS.lionFur], [6, 13, CHIMERA_COLORS.lionFurDark],
  [5, 14, CHIMERA_COLORS.paw], [6, 14, CHIMERA_COLORS.paw],
  [5, 15, CHIMERA_COLORS.claw], [6, 15, CHIMERA_COLORS.claw],

  [9, 14, CHIMERA_COLORS.goatBodyDark], [10, 14, CHIMERA_COLORS.goatBody],
  [9, 15, CHIMERA_COLORS.claw], [10, 15, CHIMERA_COLORS.claw],

  [7, 6, CHIMERA_COLORS.flame],
]

const CHIMERA_FACE_RIGHT = [
  [13, 0, CHIMERA_COLORS.horn], [14, 0, CHIMERA_COLORS.horn], [15, 0, CHIMERA_COLORS.lionMane],
  [13, 1, CHIMERA_COLORS.lionFur], [14, 1, CHIMERA_COLORS.lionFurLight], [15, 1, CHIMERA_COLORS.lionMane], [16, 1, CHIMERA_COLORS.lionManeDark],
  [13, 2, CHIMERA_COLORS.lionFur], [14, 2, CHIMERA_COLORS.lionFurLight], [15, 2, CHIMERA_COLORS.lionMane], [16, 2, CHIMERA_COLORS.lionManeDark],
  [12, 3, CHIMERA_COLORS.lionFurLight], [13, 3, CHIMERA_COLORS.lionFurLight], [14, 3, CHIMERA_COLORS.lionFur], [15, 3, CHIMERA_COLORS.lionMane], [16, 3, CHIMERA_COLORS.lionManeDark], [17, 3, CHIMERA_COLORS.lionManeDark],
  [12, 4, CHIMERA_COLORS.lionFurLight], [13, 4, CHIMERA_COLORS.lionFur], [14, 4, CHIMERA_COLORS.eye], [15, 4, CHIMERA_COLORS.lionFur], [16, 4, CHIMERA_COLORS.lionMane], [17, 4, CHIMERA_COLORS.lionMane],
  [12, 5, CHIMERA_COLORS.lionFur], [13, 5, CHIMERA_COLORS.nose], [14, 5, CHIMERA_COLORS.eyeGlow], [15, 5, CHIMERA_COLORS.lionFur], [16, 5, CHIMERA_COLORS.lionMane], [17, 5, CHIMERA_COLORS.lionManeDark],
  [12, 6, CHIMERA_COLORS.lionFur], [13, 6, CHIMERA_COLORS.teeth], [14, 6, CHIMERA_COLORS.teeth], [15, 6, CHIMERA_COLORS.teeth], [16, 6, CHIMERA_COLORS.lionMane], [17, 6, CHIMERA_COLORS.lionManeDark],
  [12, 7, CHIMERA_COLORS.lionFurDark], [13, 7, CHIMERA_COLORS.teeth], [14, 7, CHIMERA_COLORS.tongue], [15, 7, CHIMERA_COLORS.teeth], [16, 7, CHIMERA_COLORS.lionMane],

  [12, 8, CHIMERA_COLORS.goatBody], [13, 8, CHIMERA_COLORS.goatBodyLight],
  [11, 9, CHIMERA_COLORS.goatBodyLight], [12, 9, CHIMERA_COLORS.goatBody], [13, 9, CHIMERA_COLORS.goatBodyLight], [14, 9, CHIMERA_COLORS.goatBody],

  [9, 10, CHIMERA_COLORS.goatBody], [10, 10, CHIMERA_COLORS.goatBodyLight], [11, 10, CHIMERA_COLORS.goatBelly], [12, 10, CHIMERA_COLORS.goatBelly], [13, 10, CHIMERA_COLORS.goatBodyLight], [14, 10, CHIMERA_COLORS.goatBody], [15, 10, CHIMERA_COLORS.goatBodyDark],
  [8, 11, CHIMERA_COLORS.goatBodyDark], [9, 11, CHIMERA_COLORS.goatBody], [10, 11, CHIMERA_COLORS.goatBodyLight], [11, 11, CHIMERA_COLORS.goatBelly], [12, 11, CHIMERA_COLORS.goatBelly], [13, 11, CHIMERA_COLORS.goatBodyLight], [14, 11, CHIMERA_COLORS.goatBody], [15, 11, CHIMERA_COLORS.goatBodyDark],

  [8, 12, CHIMERA_COLORS.goatBodyDark], [9, 12, CHIMERA_COLORS.goatBody], [10, 12, CHIMERA_COLORS.goatBodyLight], [11, 12, CHIMERA_COLORS.goatBody], [12, 12, CHIMERA_COLORS.goatBodyLight], [13, 12, CHIMERA_COLORS.goatBody], [14, 12, CHIMERA_COLORS.goatBodyDark],
  [9, 13, CHIMERA_COLORS.goatBodyLight], [10, 13, CHIMERA_COLORS.goatBody], [11, 13, CHIMERA_COLORS.goatBelly], [12, 13, CHIMERA_COLORS.goatBodyLight], [13, 13, CHIMERA_COLORS.goatBody],

  [9, 7, CHIMERA_COLORS.wing], [10, 7, CHIMERA_COLORS.wingDark],
  [9, 8, CHIMERA_COLORS.wingLight], [8, 7, CHIMERA_COLORS.wingLight],
  [8, 8, CHIMERA_COLORS.wing], [7, 8, CHIMERA_COLORS.wingDark],
  [7, 9, CHIMERA_COLORS.wingDark],

  [7, 10, CHIMERA_COLORS.snake], [6, 10, CHIMERA_COLORS.snakeDark],
  [6, 11, CHIMERA_COLORS.snake], [5, 11, CHIMERA_COLORS.snakeLight],
  [5, 12, CHIMERA_COLORS.snake], [4, 12, CHIMERA_COLORS.snakeLight],
  [4, 13, CHIMERA_COLORS.snake], [3, 13, CHIMERA_COLORS.snakeDark],
  [3, 14, CHIMERA_COLORS.snake], [2, 14, CHIMERA_COLORS.eye],

  [3, 15, CHIMERA_COLORS.teeth], [4, 15, CHIMERA_COLORS.snake], [5, 15, CHIMERA_COLORS.snakeDark],

  [13, 13, CHIMERA_COLORS.lionFurDark], [14, 13, CHIMERA_COLORS.lionFur],
  [13, 14, CHIMERA_COLORS.paw], [14, 14, CHIMERA_COLORS.paw],
  [13, 15, CHIMERA_COLORS.claw], [14, 15, CHIMERA_COLORS.claw],

  [9, 14, CHIMERA_COLORS.goatBody], [10, 14, CHIMERA_COLORS.goatBodyDark],
  [9, 15, CHIMERA_COLORS.claw], [10, 15, CHIMERA_COLORS.claw],

  [12, 6, CHIMERA_COLORS.flame],
]

const CHIMERA_FACE_DOWN = [
  [7, 0, CHIMERA_COLORS.horn], [8, 0, CHIMERA_COLORS.horn], [11, 0, CHIMERA_COLORS.horn], [12, 0, CHIMERA_COLORS.horn],
  [7, 1, CHIMERA_COLORS.hornDark], [8, 1, CHIMERA_COLORS.lionFurLight], [11, 1, CHIMERA_COLORS.lionFurLight], [12, 1, CHIMERA_COLORS.hornDark],
  [5, 2, CHIMERA_COLORS.lionManeDark], [6, 2, CHIMERA_COLORS.lionMane], [7, 2, CHIMERA_COLORS.lionFurLight], [8, 2, CHIMERA_COLORS.lionFur], [9, 2, CHIMERA_COLORS.lionFurLight], [10, 2, CHIMERA_COLORS.lionFur], [11, 2, CHIMERA_COLORS.lionFurLight], [12, 2, CHIMERA_COLORS.lionMane], [13, 2, CHIMERA_COLORS.lionManeDark],
  [4, 3, CHIMERA_COLORS.lionManeDark], [5, 3, CHIMERA_COLORS.lionMane], [6, 3, CHIMERA_COLORS.lionFur], [7, 3, CHIMERA_COLORS.lionFurLight], [8, 3, CHIMERA_COLORS.lionFur], [9, 3, CHIMERA_COLORS.lionFurLight], [10, 3, CHIMERA_COLORS.lionFur], [11, 3, CHIMERA_COLORS.lionFurLight], [12, 3, CHIMERA_COLORS.lionFur], [13, 3, CHIMERA_COLORS.lionMane], [14, 3, CHIMERA_COLORS.lionManeDark],

  [5, 4, CHIMERA_COLORS.lionMane], [6, 4, CHIMERA_COLORS.lionFur], [7, 4, CHIMERA_COLORS.eye], [8, 4, CHIMERA_COLORS.lionFurLight], [9, 4, CHIMERA_COLORS.lionFurLight], [10, 4, CHIMERA_COLORS.lionFurLight], [11, 4, CHIMERA_COLORS.eye], [12, 4, CHIMERA_COLORS.lionFur], [13, 4, CHIMERA_COLORS.lionMane],
  [5, 5, CHIMERA_COLORS.lionMane], [6, 5, CHIMERA_COLORS.lionFur], [7, 5, CHIMERA_COLORS.eyeGlow], [8, 5, CHIMERA_COLORS.lionFur], [9, 5, CHIMERA_COLORS.nose], [10, 5, CHIMERA_COLORS.nose], [11, 5, CHIMERA_COLORS.eyeGlow], [12, 5, CHIMERA_COLORS.lionFur], [13, 5, CHIMERA_COLORS.lionMane],
  [6, 6, CHIMERA_COLORS.lionFurDark], [7, 6, CHIMERA_COLORS.teeth], [8, 6, CHIMERA_COLORS.teeth], [9, 6, CHIMERA_COLORS.nose], [10, 6, CHIMERA_COLORS.teeth], [11, 6, CHIMERA_COLORS.teeth], [12, 6, CHIMERA_COLORS.lionFurDark],
  [7, 7, CHIMERA_COLORS.teeth], [8, 7, CHIMERA_COLORS.tongue], [9, 7, CHIMERA_COLORS.tongue], [10, 7, CHIMERA_COLORS.tongue], [11, 7, CHIMERA_COLORS.teeth],

  [7, 8, CHIMERA_COLORS.goatBody], [8, 8, CHIMERA_COLORS.goatBodyLight], [9, 8, CHIMERA_COLORS.goatBodyLight], [10, 8, CHIMERA_COLORS.goatBody], [11, 8, CHIMERA_COLORS.goatBody],
  [6, 9, CHIMERA_COLORS.goatBody], [7, 9, CHIMERA_COLORS.goatBodyLight], [8, 9, CHIMERA_COLORS.goatBody], [9, 9, CHIMERA_COLORS.goatBody], [10, 9, CHIMERA_COLORS.goatBody], [11, 9, CHIMERA_COLORS.goatBodyLight], [12, 9, CHIMERA_COLORS.goatBody],

  [5, 10, CHIMERA_COLORS.goatBodyDark], [6, 10, CHIMERA_COLORS.goatBody], [7, 10, CHIMERA_COLORS.goatBodyLight], [8, 10, CHIMERA_COLORS.goatBelly], [9, 10, CHIMERA_COLORS.goatBelly], [10, 10, CHIMERA_COLORS.goatBelly], [11, 10, CHIMERA_COLORS.goatBodyLight], [12, 10, CHIMERA_COLORS.goatBody], [13, 10, CHIMERA_COLORS.goatBodyDark],
  [5, 11, CHIMERA_COLORS.goatBodyDark], [6, 11, CHIMERA_COLORS.goatBody], [7, 11, CHIMERA_COLORS.goatBodyLight], [8, 11, CHIMERA_COLORS.goatBelly], [9, 11, CHIMERA_COLORS.goatBelly], [10, 11, CHIMERA_COLORS.goatBelly], [11, 11, CHIMERA_COLORS.goatBodyLight], [12, 11, CHIMERA_COLORS.goatBody], [13, 11, CHIMERA_COLORS.goatBodyDark],

  [6, 12, CHIMERA_COLORS.goatBody], [7, 12, CHIMERA_COLORS.goatBodyLight], [8, 12, CHIMERA_COLORS.goatBelly], [9, 12, CHIMERA_COLORS.goatBelly], [10, 12, CHIMERA_COLORS.goatBelly], [11, 12, CHIMERA_COLORS.goatBodyLight], [12, 12, CHIMERA_COLORS.goatBody],
  [7, 13, CHIMERA_COLORS.goatBodyLight], [8, 13, CHIMERA_COLORS.goatBody], [9, 13, CHIMERA_COLORS.goatBodyLight], [10, 13, CHIMERA_COLORS.goatBody], [11, 13, CHIMERA_COLORS.goatBodyLight],

  [8, 14, CHIMERA_COLORS.snake], [9, 14, CHIMERA_COLORS.snakeLight], [10, 14, CHIMERA_COLORS.snake],
  [7, 15, CHIMERA_COLORS.snakeDark], [8, 15, CHIMERA_COLORS.snake], [9, 15, CHIMERA_COLORS.eye], [10, 15, CHIMERA_COLORS.snake], [11, 15, CHIMERA_COLORS.snakeDark],

  [4, 9, CHIMERA_COLORS.wingDark], [3, 10, CHIMERA_COLORS.wing],
  [3, 11, CHIMERA_COLORS.wingLight], [4, 11, CHIMERA_COLORS.wing],
  [14, 9, CHIMERA_COLORS.wingDark], [15, 10, CHIMERA_COLORS.wing],
  [15, 11, CHIMERA_COLORS.wingLight], [14, 11, CHIMERA_COLORS.wing],

  [6, 13, CHIMERA_COLORS.goatBodyDark], [7, 13, CHIMERA_COLORS.goatBody],
  [6, 14, CHIMERA_COLORS.paw], [7, 14, CHIMERA_COLORS.paw],
  [6, 15, CHIMERA_COLORS.claw], [7, 15, CHIMERA_COLORS.claw],
  [11, 13, CHIMERA_COLORS.goatBody], [12, 13, CHIMERA_COLORS.goatBodyDark],
  [11, 14, CHIMERA_COLORS.paw], [12, 14, CHIMERA_COLORS.paw],
  [11, 15, CHIMERA_COLORS.claw], [12, 15, CHIMERA_COLORS.claw],
  [8, 14, CHIMERA_COLORS.goatBody],
  [8, 15, CHIMERA_COLORS.claw],
  [10, 14, CHIMERA_COLORS.goatBody],
  [10, 15, CHIMERA_COLORS.claw],

  [9, 7, CHIMERA_COLORS.flameLight], [9, 6, CHIMERA_COLORS.flame],
]

const CHIMERA_FACE_UP = [
  [6, 0, CHIMERA_COLORS.lionManeDark], [7, 0, CHIMERA_COLORS.lionMane], [8, 0, CHIMERA_COLORS.lionMane], [9, 0, CHIMERA_COLORS.lionMane], [10, 0, CHIMERA_COLORS.lionMane], [11, 0, CHIMERA_COLORS.lionMane], [12, 0, CHIMERA_COLORS.lionManeDark],
  [5, 1, CHIMERA_COLORS.lionManeDark], [6, 1, CHIMERA_COLORS.lionMane], [7, 1, CHIMERA_COLORS.lionFurLight], [8, 1, CHIMERA_COLORS.lionFur], [9, 1, CHIMERA_COLORS.lionFurLight], [10, 1, CHIMERA_COLORS.lionFur], [11, 1, CHIMERA_COLORS.lionFurLight], [12, 1, CHIMERA_COLORS.lionMane], [13, 1, CHIMERA_COLORS.lionManeDark],
  [5, 2, CHIMERA_COLORS.lionManeDark], [6, 2, CHIMERA_COLORS.lionMane], [7, 2, CHIMERA_COLORS.lionFur], [8, 2, CHIMERA_COLORS.lionFurLight], [9, 2, CHIMERA_COLORS.lionFur], [10, 2, CHIMERA_COLORS.lionFurLight], [11, 2, CHIMERA_COLORS.lionFur], [12, 2, CHIMERA_COLORS.lionMane], [13, 2, CHIMERA_COLORS.lionManeDark],
  [5, 3, CHIMERA_COLORS.lionMane], [6, 3, CHIMERA_COLORS.lionFur], [7, 3, CHIMERA_COLORS.lionFur], [8, 3, CHIMERA_COLORS.lionFurLight], [9, 3, CHIMERA_COLORS.lionFur], [10, 3, CHIMERA_COLORS.lionFurLight], [11, 3, CHIMERA_COLORS.lionFur], [12, 3, CHIMERA_COLORS.lionFur], [13, 3, CHIMERA_COLORS.lionMane],

  [6, 4, CHIMERA_COLORS.goatBody], [7, 4, CHIMERA_COLORS.goatBodyLight], [8, 4, CHIMERA_COLORS.goatBody], [9, 4, CHIMERA_COLORS.goatBodyLight], [10, 4, CHIMERA_COLORS.goatBody], [11, 4, CHIMERA_COLORS.goatBodyLight], [12, 4, CHIMERA_COLORS.goatBody],
  [6, 5, CHIMERA_COLORS.goatBody], [7, 5, CHIMERA_COLORS.goatBody], [8, 5, CHIMERA_COLORS.goatBodyLight], [9, 5, CHIMERA_COLORS.goatBody], [10, 5, CHIMERA_COLORS.goatBodyLight], [11, 5, CHIMERA_COLORS.goatBody], [12, 5, CHIMERA_COLORS.goatBody],

  [5, 6, CHIMERA_COLORS.goatBodyDark], [6, 6, CHIMERA_COLORS.goatBody], [7, 6, CHIMERA_COLORS.goatBodyLight], [8, 6, CHIMERA_COLORS.goatBody], [9, 6, CHIMERA_COLORS.goatBodyLight], [10, 6, CHIMERA_COLORS.goatBody], [11, 6, CHIMERA_COLORS.goatBodyLight], [12, 6, CHIMERA_COLORS.goatBody], [13, 6, CHIMERA_COLORS.goatBodyDark],
  [4, 7, CHIMERA_COLORS.goatBodyDark], [5, 7, CHIMERA_COLORS.goatBody], [6, 7, CHIMERA_COLORS.goatBody], [7, 7, CHIMERA_COLORS.goatBodyLight], [8, 7, CHIMERA_COLORS.goatBody], [9, 7, CHIMERA_COLORS.goatBodyLight], [10, 7, CHIMERA_COLORS.goatBody], [11, 7, CHIMERA_COLORS.goatBodyLight], [12, 7, CHIMERA_COLORS.goatBody], [13, 7, CHIMERA_COLORS.goatBody], [14, 7, CHIMERA_COLORS.goatBodyDark],
  [4, 8, CHIMERA_COLORS.goatBodyDark], [5, 8, CHIMERA_COLORS.goatBody], [6, 8, CHIMERA_COLORS.goatBody], [7, 8, CHIMERA_COLORS.goatBody], [8, 8, CHIMERA_COLORS.goatBodyLight], [9, 8, CHIMERA_COLORS.goatBody], [10, 8, CHIMERA_COLORS.goatBodyLight], [11, 8, CHIMERA_COLORS.goatBody], [12, 8, CHIMERA_COLORS.goatBody], [13, 8, CHIMERA_COLORS.goatBody], [14, 8, CHIMERA_COLORS.goatBodyDark],
  [5, 9, CHIMERA_COLORS.goatBodyDark], [6, 9, CHIMERA_COLORS.goatBody], [7, 9, CHIMERA_COLORS.goatBodyLight], [8, 9, CHIMERA_COLORS.goatBody], [9, 9, CHIMERA_COLORS.goatBodyLight], [10, 9, CHIMERA_COLORS.goatBody], [11, 9, CHIMERA_COLORS.goatBodyLight], [12, 9, CHIMERA_COLORS.goatBody], [13, 9, CHIMERA_COLORS.goatBodyDark],

  [6, 10, CHIMERA_COLORS.goatBody], [7, 10, CHIMERA_COLORS.goatBodyLight], [8, 10, CHIMERA_COLORS.goatBody], [9, 10, CHIMERA_COLORS.goatBodyLight], [10, 10, CHIMERA_COLORS.goatBody], [11, 10, CHIMERA_COLORS.goatBodyLight], [12, 10, CHIMERA_COLORS.goatBody],
  [7, 11, CHIMERA_COLORS.goatBody], [8, 11, CHIMERA_COLORS.goatBody], [9, 11, CHIMERA_COLORS.goatBodyLight], [10, 11, CHIMERA_COLORS.goatBody], [11, 11, CHIMERA_COLORS.goatBody],

  [3, 5, CHIMERA_COLORS.wingDark], [4, 5, CHIMERA_COLORS.wing],
  [2, 6, CHIMERA_COLORS.wing], [3, 6, CHIMERA_COLORS.wingLight], [4, 6, CHIMERA_COLORS.wingLight],
  [2, 7, CHIMERA_COLORS.wingDark], [3, 7, CHIMERA_COLORS.wing],
  [14, 5, CHIMERA_COLORS.wing], [15, 5, CHIMERA_COLORS.wingDark],
  [14, 6, CHIMERA_COLORS.wingLight], [15, 6, CHIMERA_COLORS.wingLight], [16, 6, CHIMERA_COLORS.wing],
  [15, 7, CHIMERA_COLORS.wing], [16, 7, CHIMERA_COLORS.wingDark],

  [8, 12, CHIMERA_COLORS.snakeDark], [9, 12, CHIMERA_COLORS.snake], [10, 12, CHIMERA_COLORS.snakeDark],
  [7, 13, CHIMERA_COLORS.snake], [8, 13, CHIMERA_COLORS.snakeLight], [9, 13, CHIMERA_COLORS.snake], [10, 13, CHIMERA_COLORS.snakeLight], [11, 13, CHIMERA_COLORS.snake],
  [8, 14, CHIMERA_COLORS.snake], [9, 14, CHIMERA_COLORS.snakeLight], [10, 14, CHIMERA_COLORS.snake],
  [8, 15, CHIMERA_COLORS.snakeDark], [9, 15, CHIMERA_COLORS.eye], [10, 15, CHIMERA_COLORS.snakeDark],

  [6, 11, CHIMERA_COLORS.goatBodyDark], [7, 11, CHIMERA_COLORS.goatBody],
  [6, 12, CHIMERA_COLORS.paw], [7, 12, CHIMERA_COLORS.paw],
  [6, 13, CHIMERA_COLORS.claw], [7, 13, CHIMERA_COLORS.claw],
  [11, 11, CHIMERA_COLORS.goatBody], [12, 11, CHIMERA_COLORS.goatBodyDark],
  [11, 12, CHIMERA_COLORS.paw], [12, 12, CHIMERA_COLORS.paw],
  [11, 13, CHIMERA_COLORS.claw], [12, 13, CHIMERA_COLORS.claw],
  [8, 12, CHIMERA_COLORS.goatBody],
  [8, 13, CHIMERA_COLORS.paw],
  [8, 14, CHIMERA_COLORS.claw],
  [10, 12, CHIMERA_COLORS.goatBody],
  [10, 13, CHIMERA_COLORS.paw],
  [10, 14, CHIMERA_COLORS.claw],
]

const CHIMERA_IDLE_FRAMES = [
  [
    { pixels: [
      [9, 7, CHIMERA_COLORS.flame],
    ] }
  ],
  [
    { pixels: [
      [9, 8, CHIMERA_COLORS.flameLight],
    ] }
  ]
]

const CHIMERA_WALK_FRAMES = [
  [
    { pixels: [
      [5, 13, CHIMERA_COLORS.goatBody], [6, 13, CHIMERA_COLORS.goatBodyDark], [11, 13, CHIMERA_COLORS.goatBodyDark], [12, 13, CHIMERA_COLORS.goatBody],
      [5, 14, CHIMERA_COLORS.paw], [6, 14, CHIMERA_COLORS.paw], [11, 14, CHIMERA_COLORS.paw], [12, 14, CHIMERA_COLORS.paw],
      [5, 15, CHIMERA_COLORS.claw], [6, 15, CHIMERA_COLORS.claw], [11, 15, CHIMERA_COLORS.claw], [12, 15, CHIMERA_COLORS.claw],
    ] }
  ],
  [
    { pixels: [
      [6, 13, CHIMERA_COLORS.goatBody], [7, 13, CHIMERA_COLORS.goatBodyDark], [10, 13, CHIMERA_COLORS.goatBodyDark], [11, 13, CHIMERA_COLORS.goatBody],
      [6, 14, CHIMERA_COLORS.paw], [7, 14, CHIMERA_COLORS.paw], [10, 14, CHIMERA_COLORS.paw], [11, 14, CHIMERA_COLORS.paw],
      [6, 15, CHIMERA_COLORS.claw], [7, 15, CHIMERA_COLORS.claw], [10, 15, CHIMERA_COLORS.claw], [11, 15, CHIMERA_COLORS.claw],
    ] }
  ],
  [
    { pixels: [
      [7, 13, CHIMERA_COLORS.goatBodyDark], [8, 13, CHIMERA_COLORS.goatBody], [9, 13, CHIMERA_COLORS.goatBody], [10, 13, CHIMERA_COLORS.goatBodyDark],
      [7, 14, CHIMERA_COLORS.paw], [8, 14, CHIMERA_COLORS.paw], [9, 14, CHIMERA_COLORS.paw], [10, 14, CHIMERA_COLORS.paw],
      [7, 15, CHIMERA_COLORS.claw], [8, 15, CHIMERA_COLORS.claw], [9, 15, CHIMERA_COLORS.claw], [10, 15, CHIMERA_COLORS.claw],
    ] }
  ]
]

export const drawChimera = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: CHIMERA_FACE_DOWN,
  up: CHIMERA_FACE_UP,
  left: CHIMERA_FACE_LEFT,
  right: CHIMERA_FACE_RIGHT,
  walk: CHIMERA_WALK_FRAMES,
  idle: CHIMERA_IDLE_FRAMES,
})

export const drawChimeraAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, CHIMERA_AVATAR)
