import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.004,
  WALK_SPEED: 0.08,
}

const GOBLIN_COLORS = {
  skin: '#228B22',
  skinLight: '#32CD32',
  skinDark: '#006400',
  skinDarker: '#004d00',
  ear: '#006400',
  nose: '#006400',
  eye: '#000000',
  eyeWhite: '#2F2F2F',
  cloth: '#8B4513',
  clothDark: '#654321',
  clothLight: '#A0522D',
  pants: '#4B0082',
  pantsDark: '#2E0854',
  highlight: '#FFFFFF',
  tooth: '#FFFACD',
  mouth: '#8B0000',
  brow: '#004d00',
}

const GOBLIN_FACE_DOWN = [
  [4, 2, GOBLIN_COLORS.ear], [3, 3, GOBLIN_COLORS.ear],
  [14, 2, GOBLIN_COLORS.ear], [15, 3, GOBLIN_COLORS.ear],
  [6, 1, GOBLIN_COLORS.skinLight], [7, 1, GOBLIN_COLORS.skinLight], [8, 1, GOBLIN_COLORS.skinLight], [9, 1, GOBLIN_COLORS.skinLight],
  [5, 2, GOBLIN_COLORS.skinLight], [6, 2, GOBLIN_COLORS.skin], [7, 2, GOBLIN_COLORS.skin], [8, 2, GOBLIN_COLORS.skinLight], [9, 2, GOBLIN_COLORS.skinLight], [10, 2, GOBLIN_COLORS.skin], [11, 2, GOBLIN_COLORS.skin], [12, 2, GOBLIN_COLORS.skinLight],
  [5, 3, GOBLIN_COLORS.skin], [6, 3, GOBLIN_COLORS.skin], [7, 3, GOBLIN_COLORS.skinLight], [8, 3, GOBLIN_COLORS.skinLight], [9, 3, GOBLIN_COLORS.skinLight], [10, 3, GOBLIN_COLORS.skinLight], [11, 3, GOBLIN_COLORS.skin], [12, 3, GOBLIN_COLORS.skin],
  [5, 4, GOBLIN_COLORS.skin], [6, 4, GOBLIN_COLORS.skin], [7, 4, GOBLIN_COLORS.skinLight], [8, 4, GOBLIN_COLORS.skinLight], [9, 4, GOBLIN_COLORS.skinLight], [10, 4, GOBLIN_COLORS.skinLight], [11, 4, GOBLIN_COLORS.skin], [12, 4, GOBLIN_COLORS.skin],
  [5, 5, GOBLIN_COLORS.skin], [6, 5, GOBLIN_COLORS.eye], [7, 5, GOBLIN_COLORS.skin], [8, 5, GOBLIN_COLORS.skin], [9, 5, GOBLIN_COLORS.skin], [10, 5, GOBLIN_COLORS.skin], [11, 5, GOBLIN_COLORS.eye], [12, 5, GOBLIN_COLORS.skin],
  [6, 6, GOBLIN_COLORS.skin], [7, 6, GOBLIN_COLORS.nose], [8, 6, GOBLIN_COLORS.nose], [9, 6, GOBLIN_COLORS.nose], [10, 6, GOBLIN_COLORS.nose], [11, 6, GOBLIN_COLORS.skin],
  [6, 7, GOBLIN_COLORS.skin], [7, 7, GOBLIN_COLORS.nose], [8, 7, GOBLIN_COLORS.skinLight], [9, 7, GOBLIN_COLORS.skinLight], [10, 7, GOBLIN_COLORS.skinLight], [11, 7, GOBLIN_COLORS.nose], [12, 7, GOBLIN_COLORS.skin],
  [7, 8, GOBLIN_COLORS.skin], [8, 8, GOBLIN_COLORS.skin], [9, 8, GOBLIN_COLORS.skinDark], [10, 8, GOBLIN_COLORS.skin], [11, 8, GOBLIN_COLORS.skin],
  [7, 9, GOBLIN_COLORS.skin], [8, 9, GOBLIN_COLORS.skin], [9, 9, GOBLIN_COLORS.skin], [10, 9, GOBLIN_COLORS.skin], [11, 9, GOBLIN_COLORS.skin],
  [6, 10, GOBLIN_COLORS.cloth], [7, 10, GOBLIN_COLORS.cloth], [8, 10, GOBLIN_COLORS.cloth], [9, 10, GOBLIN_COLORS.clothDark], [10, 10, GOBLIN_COLORS.cloth], [11, 10, GOBLIN_COLORS.cloth],
  [5, 11, GOBLIN_COLORS.cloth], [6, 11, GOBLIN_COLORS.cloth], [7, 11, GOBLIN_COLORS.clothLight], [8, 11, GOBLIN_COLORS.clothLight], [9, 11, GOBLIN_COLORS.clothLight], [10, 11, GOBLIN_COLORS.clothLight], [11, 11, GOBLIN_COLORS.clothLight], [12, 11, GOBLIN_COLORS.cloth],
  [5, 12, GOBLIN_COLORS.cloth], [6, 12, GOBLIN_COLORS.clothDark], [7, 12, GOBLIN_COLORS.cloth], [8, 12, GOBLIN_COLORS.cloth], [9, 12, GOBLIN_COLORS.cloth], [10, 12, GOBLIN_COLORS.cloth], [11, 12, GOBLIN_COLORS.clothDark], [12, 12, GOBLIN_COLORS.cloth],
  [6, 13, GOBLIN_COLORS.clothDark], [7, 13, GOBLIN_COLORS.pantsDark], [8, 13, GOBLIN_COLORS.pants], [9, 13, GOBLIN_COLORS.pants], [10, 13, GOBLIN_COLORS.pants], [11, 13, GOBLIN_COLORS.pantsDark], [12, 13, GOBLIN_COLORS.clothDark],
  [6, 14, GOBLIN_COLORS.pantsDark], [7, 14, GOBLIN_COLORS.pants], [8, 14, GOBLIN_COLORS.pants], [9, 14, GOBLIN_COLORS.skinDark], [10, 14, GOBLIN_COLORS.pants], [11, 14, GOBLIN_COLORS.pants], [12, 14, GOBLIN_COLORS.pantsDark],
  [7, 15, GOBLIN_COLORS.pantsDark], [8, 15, GOBLIN_COLORS.pantsDark], [9, 15, GOBLIN_COLORS.skinDarker], [10, 15, GOBLIN_COLORS.pantsDark], [11, 15, GOBLIN_COLORS.pantsDark],
  [4, 10, GOBLIN_COLORS.skin], [4, 11, GOBLIN_COLORS.skin], [4, 12, GOBLIN_COLORS.skin],
  [13, 10, GOBLIN_COLORS.skin], [13, 11, GOBLIN_COLORS.skin], [13, 12, GOBLIN_COLORS.skin],
]

const GOBLIN_FACE_UP = [
  [4, 2, GOBLIN_COLORS.ear], [3, 3, GOBLIN_COLORS.ear],
  [14, 2, GOBLIN_COLORS.ear], [15, 3, GOBLIN_COLORS.ear],
  [6, 1, GOBLIN_COLORS.skinLight], [7, 1, GOBLIN_COLORS.skinLight], [8, 1, GOBLIN_COLORS.skinLight], [9, 1, GOBLIN_COLORS.skinLight],
  [5, 2, GOBLIN_COLORS.skinLight], [6, 2, GOBLIN_COLORS.skin], [7, 2, GOBLIN_COLORS.skin], [8, 2, GOBLIN_COLORS.skin], [9, 2, GOBLIN_COLORS.skin], [10, 2, GOBLIN_COLORS.skin], [11, 2, GOBLIN_COLORS.skin], [12, 2, GOBLIN_COLORS.skinLight],
  [5, 3, GOBLIN_COLORS.skinDark], [6, 3, GOBLIN_COLORS.skinDark], [7, 3, GOBLIN_COLORS.skinDark], [8, 3, GOBLIN_COLORS.skinDark], [9, 3, GOBLIN_COLORS.skinDark], [10, 3, GOBLIN_COLORS.skinDark], [11, 3, GOBLIN_COLORS.skinDark], [12, 3, GOBLIN_COLORS.skinDark],
  [4, 4, GOBLIN_COLORS.skinDark], [5, 4, GOBLIN_COLORS.skinDark], [6, 4, GOBLIN_COLORS.skinDark], [7, 4, GOBLIN_COLORS.skinDark], [8, 4, GOBLIN_COLORS.skinDark], [9, 4, GOBLIN_COLORS.skinDark], [10, 4, GOBLIN_COLORS.skinDark], [11, 4, GOBLIN_COLORS.skinDark], [12, 4, GOBLIN_COLORS.skinDark],
  [4, 5, GOBLIN_COLORS.skinDark], [5, 5, GOBLIN_COLORS.skinDark], [6, 5, GOBLIN_COLORS.skinDark], [7, 5, GOBLIN_COLORS.skinDark], [8, 5, GOBLIN_COLORS.skinDark], [9, 5, GOBLIN_COLORS.skinDark], [10, 5, GOBLIN_COLORS.skinDark], [11, 5, GOBLIN_COLORS.skinDark], [12, 5, GOBLIN_COLORS.skinDark],
  [5, 6, GOBLIN_COLORS.skinDark], [6, 6, GOBLIN_COLORS.skinDark], [7, 6, GOBLIN_COLORS.skinDark], [8, 6, GOBLIN_COLORS.skinDark], [9, 6, GOBLIN_COLORS.skinDark], [10, 6, GOBLIN_COLORS.skinDark], [11, 6, GOBLIN_COLORS.skinDark],
  [6, 7, GOBLIN_COLORS.skinDark], [7, 7, GOBLIN_COLORS.skinDark], [8, 7, GOBLIN_COLORS.skinDark], [9, 7, GOBLIN_COLORS.skinDark], [10, 7, GOBLIN_COLORS.skinDark],
  [6, 8, GOBLIN_COLORS.cloth], [7, 8, GOBLIN_COLORS.cloth], [8, 8, GOBLIN_COLORS.cloth], [9, 8, GOBLIN_COLORS.clothDark], [10, 8, GOBLIN_COLORS.cloth], [11, 8, GOBLIN_COLORS.cloth],
  [5, 9, GOBLIN_COLORS.cloth], [6, 9, GOBLIN_COLORS.cloth], [7, 9, GOBLIN_COLORS.clothLight], [8, 9, GOBLIN_COLORS.clothLight], [9, 9, GOBLIN_COLORS.clothLight], [10, 9, GOBLIN_COLORS.clothLight], [11, 9, GOBLIN_COLORS.clothLight], [12, 9, GOBLIN_COLORS.cloth],
  [5, 10, GOBLIN_COLORS.cloth], [6, 10, GOBLIN_COLORS.clothDark], [7, 10, GOBLIN_COLORS.cloth], [8, 10, GOBLIN_COLORS.cloth], [9, 10, GOBLIN_COLORS.cloth], [10, 10, GOBLIN_COLORS.cloth], [11, 10, GOBLIN_COLORS.clothDark], [12, 10, GOBLIN_COLORS.cloth],
  [5, 11, GOBLIN_COLORS.cloth], [6, 11, GOBLIN_COLORS.clothDark], [7, 11, GOBLIN_COLORS.pantsDark], [8, 11, GOBLIN_COLORS.pants], [9, 11, GOBLIN_COLORS.pants], [10, 11, GOBLIN_COLORS.pants], [11, 11, GOBLIN_COLORS.pantsDark], [12, 11, GOBLIN_COLORS.clothDark],
  [6, 12, GOBLIN_COLORS.pantsDark], [7, 12, GOBLIN_COLORS.pants], [8, 12, GOBLIN_COLORS.pants], [9, 12, GOBLIN_COLORS.skinDark], [10, 12, GOBLIN_COLORS.pants], [11, 12, GOBLIN_COLORS.pants], [12, 12, GOBLIN_COLORS.pantsDark],
  [7, 13, GOBLIN_COLORS.pantsDark], [8, 13, GOBLIN_COLORS.pantsDark], [9, 13, GOBLIN_COLORS.skinDarker], [10, 13, GOBLIN_COLORS.pantsDark], [11, 13, GOBLIN_COLORS.pantsDark],
  [4, 9, GOBLIN_COLORS.skin], [4, 10, GOBLIN_COLORS.skin], [4, 11, GOBLIN_COLORS.skin],
  [13, 9, GOBLIN_COLORS.skin], [13, 10, GOBLIN_COLORS.skin], [13, 11, GOBLIN_COLORS.skin],
]

const GOBLIN_FACE_LEFT = [
  [4, 2, GOBLIN_COLORS.ear], [3, 3, GOBLIN_COLORS.ear],
  [6, 1, GOBLIN_COLORS.skinLight], [7, 1, GOBLIN_COLORS.skinLight], [8, 1, GOBLIN_COLORS.skinLight], [9, 1, GOBLIN_COLORS.skinLight],
  [5, 2, GOBLIN_COLORS.skinLight], [6, 2, GOBLIN_COLORS.skin], [7, 2, GOBLIN_COLORS.skin], [8, 2, GOBLIN_COLORS.skinLight], [9, 2, GOBLIN_COLORS.skinLight], [10, 2, GOBLIN_COLORS.skin], [11, 2, GOBLIN_COLORS.skin],
  [5, 3, GOBLIN_COLORS.skin], [6, 3, GOBLIN_COLORS.skin], [7, 3, GOBLIN_COLORS.skinLight], [8, 3, GOBLIN_COLORS.skinLight], [9, 3, GOBLIN_COLORS.skinLight], [10, 3, GOBLIN_COLORS.skin], [11, 3, GOBLIN_COLORS.skin],
  [5, 4, GOBLIN_COLORS.skin], [6, 4, GOBLIN_COLORS.skin], [7, 4, GOBLIN_COLORS.skinLight], [8, 4, GOBLIN_COLORS.skinLight], [9, 4, GOBLIN_COLORS.skinLight], [10, 4, GOBLIN_COLORS.skin], [11, 4, GOBLIN_COLORS.skin],
  [5, 5, GOBLIN_COLORS.skin], [6, 5, GOBLIN_COLORS.eye], [7, 5, GOBLIN_COLORS.skin], [8, 5, GOBLIN_COLORS.skin], [9, 5, GOBLIN_COLORS.skin], [10, 5, GOBLIN_COLORS.skin],
  [5, 6, GOBLIN_COLORS.skin], [6, 6, GOBLIN_COLORS.nose], [7, 6, GOBLIN_COLORS.nose], [8, 6, GOBLIN_COLORS.nose], [9, 6, GOBLIN_COLORS.skin],
  [5, 7, GOBLIN_COLORS.skin], [6, 7, GOBLIN_COLORS.nose], [7, 7, GOBLIN_COLORS.skinLight], [8, 7, GOBLIN_COLORS.skinLight], [9, 7, GOBLIN_COLORS.skin],
  [5, 8, GOBLIN_COLORS.skin], [6, 8, GOBLIN_COLORS.skin], [7, 8, GOBLIN_COLORS.skinDark], [8, 8, GOBLIN_COLORS.skin],
  [6, 9, GOBLIN_COLORS.skin], [7, 9, GOBLIN_COLORS.skin], [8, 9, GOBLIN_COLORS.skin], [9, 9, GOBLIN_COLORS.skin],
  [6, 10, GOBLIN_COLORS.cloth], [7, 10, GOBLIN_COLORS.cloth], [8, 10, GOBLIN_COLORS.cloth], [9, 10, GOBLIN_COLORS.clothDark], [10, 10, GOBLIN_COLORS.clothDark],
  [5, 11, GOBLIN_COLORS.cloth], [6, 11, GOBLIN_COLORS.cloth], [7, 11, GOBLIN_COLORS.clothLight], [8, 11, GOBLIN_COLORS.clothLight], [9, 11, GOBLIN_COLORS.clothLight], [10, 11, GOBLIN_COLORS.clothDark],
  [5, 12, GOBLIN_COLORS.cloth], [6, 12, GOBLIN_COLORS.clothDark], [7, 12, GOBLIN_COLORS.cloth], [8, 12, GOBLIN_COLORS.cloth], [9, 12, GOBLIN_COLORS.cloth], [10, 12, GOBLIN_COLORS.clothDark],
  [6, 13, GOBLIN_COLORS.clothDark], [7, 13, GOBLIN_COLORS.pantsDark], [8, 13, GOBLIN_COLORS.pants], [9, 13, GOBLIN_COLORS.pants], [10, 13, GOBLIN_COLORS.pantsDark],
  [6, 14, GOBLIN_COLORS.pantsDark], [7, 14, GOBLIN_COLORS.pants], [8, 14, GOBLIN_COLORS.pants], [9, 14, GOBLIN_COLORS.skinDark], [10, 14, GOBLIN_COLORS.pantsDark],
  [6, 15, GOBLIN_COLORS.pantsDark], [7, 15, GOBLIN_COLORS.pantsDark], [8, 15, GOBLIN_COLORS.pantsDark], [9, 15, GOBLIN_COLORS.skinDarker],
  [4, 10, GOBLIN_COLORS.skin], [4, 11, GOBLIN_COLORS.skin], [4, 12, GOBLIN_COLORS.skin], [4, 13, GOBLIN_COLORS.skin],
]

const GOBLIN_FACE_RIGHT = [
  [14, 2, GOBLIN_COLORS.ear], [15, 3, GOBLIN_COLORS.ear],
  [6, 1, GOBLIN_COLORS.skinLight], [7, 1, GOBLIN_COLORS.skinLight], [8, 1, GOBLIN_COLORS.skinLight], [9, 1, GOBLIN_COLORS.skinLight],
  [5, 2, GOBLIN_COLORS.skin], [6, 2, GOBLIN_COLORS.skin], [7, 2, GOBLIN_COLORS.skinLight], [8, 2, GOBLIN_COLORS.skinLight], [9, 2, GOBLIN_COLORS.skinLight], [10, 2, GOBLIN_COLORS.skin], [11, 2, GOBLIN_COLORS.skin], [12, 2, GOBLIN_COLORS.skinLight],
  [5, 3, GOBLIN_COLORS.skin], [6, 3, GOBLIN_COLORS.skin], [7, 3, GOBLIN_COLORS.skinLight], [8, 3, GOBLIN_COLORS.skinLight], [9, 3, GOBLIN_COLORS.skinLight], [10, 3, GOBLIN_COLORS.skin], [11, 3, GOBLIN_COLORS.skin], [12, 3, GOBLIN_COLORS.skin],
  [5, 4, GOBLIN_COLORS.skin], [6, 4, GOBLIN_COLORS.skin], [7, 4, GOBLIN_COLORS.skinLight], [8, 4, GOBLIN_COLORS.skinLight], [9, 4, GOBLIN_COLORS.skinLight], [10, 4, GOBLIN_COLORS.skin], [11, 4, GOBLIN_COLORS.skin], [12, 4, GOBLIN_COLORS.skin],
  [6, 5, GOBLIN_COLORS.skin], [7, 5, GOBLIN_COLORS.skin], [8, 5, GOBLIN_COLORS.skin], [9, 5, GOBLIN_COLORS.skin], [10, 5, GOBLIN_COLORS.eye], [11, 5, GOBLIN_COLORS.skin],
  [6, 6, GOBLIN_COLORS.skin], [7, 6, GOBLIN_COLORS.nose], [8, 6, GOBLIN_COLORS.nose], [9, 6, GOBLIN_COLORS.nose], [10, 6, GOBLIN_COLORS.skin],
  [6, 7, GOBLIN_COLORS.skin], [7, 7, GOBLIN_COLORS.skinLight], [8, 7, GOBLIN_COLORS.skinLight], [9, 7, GOBLIN_COLORS.nose], [10, 7, GOBLIN_COLORS.skin],
  [6, 8, GOBLIN_COLORS.skin], [7, 8, GOBLIN_COLORS.skinDark], [8, 8, GOBLIN_COLORS.skin], [9, 8, GOBLIN_COLORS.skin],
  [6, 9, GOBLIN_COLORS.skin], [7, 9, GOBLIN_COLORS.skin], [8, 9, GOBLIN_COLORS.skin], [9, 9, GOBLIN_COLORS.skin],
  [5, 10, GOBLIN_COLORS.clothDark], [6, 10, GOBLIN_COLORS.cloth], [7, 10, GOBLIN_COLORS.cloth], [8, 10, GOBLIN_COLORS.cloth], [9, 10, GOBLIN_COLORS.clothDark],
  [5, 11, GOBLIN_COLORS.clothDark], [6, 11, GOBLIN_COLORS.clothLight], [7, 11, GOBLIN_COLORS.clothLight], [8, 11, GOBLIN_COLORS.clothLight], [9, 11, GOBLIN_COLORS.cloth], [10, 11, GOBLIN_COLORS.cloth],
  [5, 12, GOBLIN_COLORS.clothDark], [6, 12, GOBLIN_COLORS.cloth], [7, 12, GOBLIN_COLORS.cloth], [8, 12, GOBLIN_COLORS.cloth], [9, 12, GOBLIN_COLORS.cloth], [10, 12, GOBLIN_COLORS.clothDark], [11, 12, GOBLIN_COLORS.cloth],
  [5, 13, GOBLIN_COLORS.pantsDark], [6, 13, GOBLIN_COLORS.pants], [7, 13, GOBLIN_COLORS.pants], [8, 13, GOBLIN_COLORS.pants], [9, 13, GOBLIN_COLORS.pants], [10, 13, GOBLIN_COLORS.clothDark],
  [5, 14, GOBLIN_COLORS.pantsDark], [6, 14, GOBLIN_COLORS.pants], [7, 14, GOBLIN_COLORS.skinDark], [8, 14, GOBLIN_COLORS.pants], [9, 14, GOBLIN_COLORS.pants], [10, 14, GOBLIN_COLORS.pantsDark],
  [6, 15, GOBLIN_COLORS.skinDarker], [7, 15, GOBLIN_COLORS.pantsDark], [8, 15, GOBLIN_COLORS.pantsDark], [9, 15, GOBLIN_COLORS.pantsDark],
  [13, 10, GOBLIN_COLORS.skin], [13, 11, GOBLIN_COLORS.skin], [13, 12, GOBLIN_COLORS.skin], [13, 13, GOBLIN_COLORS.skin],
]

const GOBLIN_IDLE_FRAMES = [
  [
    { pixels: [[7, 14, GOBLIN_COLORS.pants], [8, 14, GOBLIN_COLORS.pants], [9, 14, GOBLIN_COLORS.skinDark], [10, 14, GOBLIN_COLORS.pants]] },
    { pixels: [[7, 15, GOBLIN_COLORS.pantsDark], [8, 15, GOBLIN_COLORS.pantsDark], [9, 15, GOBLIN_COLORS.skinDarker], [10, 15, GOBLIN_COLORS.pantsDark]] }
  ],
  [
    { pixels: [[7, 14, GOBLIN_COLORS.pants], [8, 14, GOBLIN_COLORS.pants], [9, 14, GOBLIN_COLORS.skinDark], [10, 14, GOBLIN_COLORS.pants]] },
    { pixels: [[6, 15, GOBLIN_COLORS.pantsDark], [7, 15, GOBLIN_COLORS.pantsDark], [8, 15, GOBLIN_COLORS.skinDarker], [9, 15, GOBLIN_COLORS.skinDarker], [10, 15, GOBLIN_COLORS.pantsDark], [11, 15, GOBLIN_COLORS.pantsDark]] }
  ]
]

const GOBLIN_WALK_FRAMES = [
  [
    { pixels: [[6, 14, GOBLIN_COLORS.pantsDark], [7, 14, GOBLIN_COLORS.pants], [8, 14, GOBLIN_COLORS.pants], [9, 14, GOBLIN_COLORS.pants], [10, 14, GOBLIN_COLORS.skinDark]] },
    { pixels: [[5, 15, GOBLIN_COLORS.pantsDark], [6, 15, GOBLIN_COLORS.pantsDark], [8, 15, GOBLIN_COLORS.pantsDark], [10, 15, GOBLIN_COLORS.pantsDark], [11, 15, GOBLIN_COLORS.pantsDark]] }
  ],
  [
    { pixels: [[7, 14, GOBLIN_COLORS.pants], [8, 14, GOBLIN_COLORS.pants], [9, 14, GOBLIN_COLORS.pants], [10, 14, GOBLIN_COLORS.pants]] },
    { pixels: [[7, 15, GOBLIN_COLORS.pantsDark], [8, 15, GOBLIN_COLORS.pantsDark], [9, 15, GOBLIN_COLORS.skinDarker], [10, 15, GOBLIN_COLORS.pantsDark]] }
  ],
  [
    { pixels: [[6, 14, GOBLIN_COLORS.pants], [7, 14, GOBLIN_COLORS.pants], [8, 14, GOBLIN_COLORS.skinDark], [9, 14, GOBLIN_COLORS.pants], [10, 14, GOBLIN_COLORS.pants]] },
    { pixels: [[5, 15, GOBLIN_COLORS.pantsDark], [7, 15, GOBLIN_COLORS.pantsDark], [9, 15, GOBLIN_COLORS.pantsDark], [10, 15, GOBLIN_COLORS.pantsDark], [11, 15, GOBLIN_COLORS.pantsDark]] }
  ]
]

export const drawGoblin = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: GOBLIN_FACE_DOWN,
  up: GOBLIN_FACE_UP,
  left: GOBLIN_FACE_LEFT,
  right: GOBLIN_FACE_RIGHT,
  walk: GOBLIN_WALK_FRAMES,
  idle: GOBLIN_IDLE_FRAMES,
})

const GOBLIN_AVATAR = [
  [0, 4, GOBLIN_COLORS.ear], [0, 5, GOBLIN_COLORS.ear],
  [1, 3, GOBLIN_COLORS.ear], [1, 4, GOBLIN_COLORS.ear], [1, 5, GOBLIN_COLORS.ear], [1, 6, GOBLIN_COLORS.ear],
  [2, 2, GOBLIN_COLORS.ear], [2, 3, GOBLIN_COLORS.ear], [2, 4, GOBLIN_COLORS.skinDark], [2, 5, GOBLIN_COLORS.skinDark],
  [15, 4, GOBLIN_COLORS.ear], [15, 5, GOBLIN_COLORS.ear],
  [14, 3, GOBLIN_COLORS.ear], [14, 4, GOBLIN_COLORS.ear], [14, 5, GOBLIN_COLORS.ear], [14, 6, GOBLIN_COLORS.ear],
  [13, 2, GOBLIN_COLORS.ear], [13, 3, GOBLIN_COLORS.ear], [13, 4, GOBLIN_COLORS.skinDark], [13, 5, GOBLIN_COLORS.skinDark],
  [7, 0, GOBLIN_COLORS.highlight], [8, 0, GOBLIN_COLORS.highlight],
  [4, 1, GOBLIN_COLORS.skinLight], [5, 1, GOBLIN_COLORS.skinLight], [6, 1, GOBLIN_COLORS.skinLight], [7, 1, GOBLIN_COLORS.skinLight], [8, 1, GOBLIN_COLORS.skinLight], [9, 1, GOBLIN_COLORS.skinLight], [10, 1, GOBLIN_COLORS.skinLight], [11, 1, GOBLIN_COLORS.skinLight],
  [3, 2, GOBLIN_COLORS.skinLight], [4, 2, GOBLIN_COLORS.skin], [5, 2, GOBLIN_COLORS.skinLight], [6, 2, GOBLIN_COLORS.skinLight], [7, 2, GOBLIN_COLORS.skinLight], [8, 2, GOBLIN_COLORS.skinLight], [9, 2, GOBLIN_COLORS.skinLight], [10, 2, GOBLIN_COLORS.skin], [11, 2, GOBLIN_COLORS.skin], [12, 2, GOBLIN_COLORS.skinLight],
  [2, 3, GOBLIN_COLORS.skin], [3, 3, GOBLIN_COLORS.skin], [4, 3, GOBLIN_COLORS.skinLight], [5, 3, GOBLIN_COLORS.skinLight], [6, 3, GOBLIN_COLORS.skinLight], [7, 3, GOBLIN_COLORS.skinLight], [8, 3, GOBLIN_COLORS.skinLight], [9, 3, GOBLIN_COLORS.skinLight], [10, 3, GOBLIN_COLORS.skinLight], [11, 3, GOBLIN_COLORS.skin], [12, 3, GOBLIN_COLORS.skin], [13, 3, GOBLIN_COLORS.skin],
  [2, 4, GOBLIN_COLORS.skin], [3, 4, GOBLIN_COLORS.skin], [4, 4, GOBLIN_COLORS.skinLight], [5, 4, GOBLIN_COLORS.skinLight], [6, 4, GOBLIN_COLORS.skinLight], [7, 4, GOBLIN_COLORS.skinLight], [8, 4, GOBLIN_COLORS.skinLight], [9, 4, GOBLIN_COLORS.skinLight], [10, 4, GOBLIN_COLORS.skinLight], [11, 4, GOBLIN_COLORS.skin], [12, 4, GOBLIN_COLORS.skin], [13, 4, GOBLIN_COLORS.skin],
  [2, 5, GOBLIN_COLORS.skinDark], [3, 5, GOBLIN_COLORS.skinDark], [4, 5, GOBLIN_COLORS.skinDark], [5, 5, GOBLIN_COLORS.skinDark], [10, 5, GOBLIN_COLORS.skinDark], [11, 5, GOBLIN_COLORS.skinDark], [12, 5, GOBLIN_COLORS.skinDark], [13, 5, GOBLIN_COLORS.skinDark],
  [2, 6, GOBLIN_COLORS.skin], [3, 6, GOBLIN_COLORS.eyeWhite], [4, 6, GOBLIN_COLORS.eye], [5, 6, GOBLIN_COLORS.eye], [6, 6, GOBLIN_COLORS.skin], [7, 6, GOBLIN_COLORS.skin], [8, 6, GOBLIN_COLORS.skin], [9, 6, GOBLIN_COLORS.eye], [10, 6, GOBLIN_COLORS.eye], [11, 6, GOBLIN_COLORS.eyeWhite], [12, 6, GOBLIN_COLORS.skin], [13, 6, GOBLIN_COLORS.skin],
  [4, 5, GOBLIN_COLORS.highlight], [5, 5, GOBLIN_COLORS.highlight], [9, 5, GOBLIN_COLORS.highlight], [10, 5, GOBLIN_COLORS.highlight],
  [5, 7, GOBLIN_COLORS.skinDark], [10, 7, GOBLIN_COLORS.skinDark],
  [3, 7, GOBLIN_COLORS.skin], [4, 7, GOBLIN_COLORS.skin], [5, 7, GOBLIN_COLORS.nose], [6, 7, GOBLIN_COLORS.nose], [7, 7, GOBLIN_COLORS.nose], [8, 7, GOBLIN_COLORS.nose], [9, 7, GOBLIN_COLORS.nose], [10, 7, GOBLIN_COLORS.nose], [11, 7, GOBLIN_COLORS.skin], [12, 7, GOBLIN_COLORS.skin],
  [3, 8, GOBLIN_COLORS.skin], [4, 8, GOBLIN_COLORS.skin], [5, 8, GOBLIN_COLORS.nose], [6, 8, GOBLIN_COLORS.skinLight], [7, 8, GOBLIN_COLORS.skinLight], [8, 8, GOBLIN_COLORS.skinLight], [9, 8, GOBLIN_COLORS.skinLight], [10, 8, GOBLIN_COLORS.nose], [11, 8, GOBLIN_COLORS.skin], [12, 8, GOBLIN_COLORS.skin],
  [5, 9, GOBLIN_COLORS.skinDark], [6, 9, GOBLIN_COLORS.skinDark], [9, 9, GOBLIN_COLORS.skinDark], [10, 9, GOBLIN_COLORS.skinDark],
  [3, 9, GOBLIN_COLORS.skin], [4, 9, GOBLIN_COLORS.skinDark], [5, 9, GOBLIN_COLORS.mouth], [6, 9, GOBLIN_COLORS.tooth], [7, 9, GOBLIN_COLORS.mouth], [8, 9, GOBLIN_COLORS.tooth], [9, 9, GOBLIN_COLORS.mouth], [10, 9, GOBLIN_COLORS.skinDark], [11, 9, GOBLIN_COLORS.skin], [12, 9, GOBLIN_COLORS.skin],
  [3, 10, GOBLIN_COLORS.skin], [4, 10, GOBLIN_COLORS.mouth], [5, 10, GOBLIN_COLORS.tooth], [6, 10, GOBLIN_COLORS.mouth], [7, 10, GOBLIN_COLORS.tooth], [8, 10, GOBLIN_COLORS.mouth], [9, 10, GOBLIN_COLORS.tooth], [10, 10, GOBLIN_COLORS.mouth], [11, 10, GOBLIN_COLORS.skin], [12, 10, GOBLIN_COLORS.skin],
  [4, 10, GOBLIN_COLORS.mouth], [5, 10, GOBLIN_COLORS.mouth], [6, 10, GOBLIN_COLORS.mouth], [7, 10, GOBLIN_COLORS.mouth], [8, 10, GOBLIN_COLORS.mouth], [9, 10, GOBLIN_COLORS.mouth], [10, 10, GOBLIN_COLORS.mouth], [11, 10, GOBLIN_COLORS.skin],
  [3, 11, GOBLIN_COLORS.skin], [4, 11, GOBLIN_COLORS.skin], [5, 11, GOBLIN_COLORS.skin], [6, 11, GOBLIN_COLORS.skin], [7, 11, GOBLIN_COLORS.skin], [8, 11, GOBLIN_COLORS.skin], [9, 11, GOBLIN_COLORS.skin], [10, 11, GOBLIN_COLORS.skin], [11, 11, GOBLIN_COLORS.skin], [12, 11, GOBLIN_COLORS.skin],
  [3, 12, GOBLIN_COLORS.skin], [4, 12, GOBLIN_COLORS.skinDark], [5, 12, GOBLIN_COLORS.skin], [6, 12, GOBLIN_COLORS.skin], [7, 12, GOBLIN_COLORS.skin], [8, 12, GOBLIN_COLORS.skin], [9, 12, GOBLIN_COLORS.skin], [10, 12, GOBLIN_COLORS.skin], [11, 12, GOBLIN_COLORS.skin], [12, 12, GOBLIN_COLORS.skin],
  [4, 13, GOBLIN_COLORS.skinDark], [5, 13, GOBLIN_COLORS.skinDark], [6, 13, GOBLIN_COLORS.skinDark], [7, 13, GOBLIN_COLORS.skinDark], [8, 13, GOBLIN_COLORS.skinDark], [9, 13, GOBLIN_COLORS.skinDark], [10, 13, GOBLIN_COLORS.skinDark], [11, 13, GOBLIN_COLORS.skinDark],
  [5, 14, GOBLIN_COLORS.skinDarker], [6, 14, GOBLIN_COLORS.skinDarker], [7, 14, GOBLIN_COLORS.skinDarker], [8, 14, GOBLIN_COLORS.skinDarker], [9, 14, GOBLIN_COLORS.skinDarker], [10, 14, GOBLIN_COLORS.skinDarker],
  [4, 15, GOBLIN_COLORS.cloth], [5, 15, GOBLIN_COLORS.clothDark], [6, 15, GOBLIN_COLORS.cloth], [7, 15, GOBLIN_COLORS.cloth], [8, 15, GOBLIN_COLORS.cloth], [9, 15, GOBLIN_COLORS.cloth], [10, 15, GOBLIN_COLORS.clothDark], [11, 15, GOBLIN_COLORS.cloth],
]

export const drawGoblinAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, GOBLIN_AVATAR)
