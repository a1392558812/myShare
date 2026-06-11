import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.004,
  WALK_SPEED: 0.08,
}

const SKELETON_COLORS = {
  bone: '#F5F5DC',
  boneLight: '#FFFFF0',
  boneDark: '#D3D3B8',
  boneShadow: '#A8A890',
  eye: '#FF4500',
  eyeGlow: '#FF0000',
  helmet: '#708090',
  helmetLight: '#A9A9A9',
  helmetDark: '#4A4A4A',
  armor: '#696969',
  armorLight: '#808080',
  armorDark: '#363636',
  cloth: '#8B0000',
  clothDark: '#5C0000',
  weapon: '#C0C0C0',
  weaponDark: '#708090',
  shield: '#4A4A4A',
  shieldGold: '#B8860B',
  rib: '#E8E8D0',
  highlight: '#FFFFFF',
  eyeInner: '#FFFF00',
  teeth: '#FFFFF0',
}

const SKELETON_AVATAR = [
  [5, 0, SKELETON_COLORS.helmetDark], [6, 0, SKELETON_COLORS.helmet], [7, 0, SKELETON_COLORS.helmetLight], [8, 0, SKELETON_COLORS.helmetLight], [9, 0, SKELETON_COLORS.helmetLight], [10, 0, SKELETON_COLORS.helmet], [11, 0, SKELETON_COLORS.helmetDark],
  [4, 1, SKELETON_COLORS.helmetDark], [5, 1, SKELETON_COLORS.helmet], [6, 1, SKELETON_COLORS.helmetLight], [7, 1, SKELETON_COLORS.helmetLight], [8, 1, SKELETON_COLORS.helmetLight], [9, 1, SKELETON_COLORS.helmetLight], [10, 1, SKELETON_COLORS.helmetLight], [11, 1, SKELETON_COLORS.helmet], [12, 1, SKELETON_COLORS.helmetDark],
  [6, 2, SKELETON_COLORS.boneLight], [7, 2, SKELETON_COLORS.boneLight], [8, 2, SKELETON_COLORS.boneLight], [9, 2, SKELETON_COLORS.boneLight],
  [5, 3, SKELETON_COLORS.bone], [6, 3, SKELETON_COLORS.boneLight], [7, 3, SKELETON_COLORS.boneLight], [8, 3, SKELETON_COLORS.boneLight], [9, 3, SKELETON_COLORS.boneLight], [10, 3, SKELETON_COLORS.bone],
  [6, 2, SKELETON_COLORS.highlight], [7, 2, SKELETON_COLORS.highlight], [8, 2, SKELETON_COLORS.highlight], [9, 2, SKELETON_COLORS.highlight],
  [4, 4, SKELETON_COLORS.boneDark], [5, 4, SKELETON_COLORS.bone], [6, 4, SKELETON_COLORS.bone], [7, 4, SKELETON_COLORS.bone], [8, 4, SKELETON_COLORS.bone], [9, 4, SKELETON_COLORS.bone], [10, 4, SKELETON_COLORS.bone], [11, 4, SKELETON_COLORS.boneDark],
  [4, 5, SKELETON_COLORS.bone], [5, 5, SKELETON_COLORS.bone], [6, 5, SKELETON_COLORS.bone], [7, 5, SKELETON_COLORS.bone], [8, 5, SKELETON_COLORS.bone], [9, 5, SKELETON_COLORS.bone], [10, 5, SKELETON_COLORS.bone], [11, 5, SKELETON_COLORS.bone],
  [4, 5, SKELETON_COLORS.boneDark], [11, 5, SKELETON_COLORS.boneDark],
  [4, 6, SKELETON_COLORS.bone], [5, 6, SKELETON_COLORS.eye], [6, 6, SKELETON_COLORS.eye], [7, 6, SKELETON_COLORS.boneShadow], [8, 6, SKELETON_COLORS.boneShadow], [9, 6, SKELETON_COLORS.eye], [10, 6, SKELETON_COLORS.eye], [11, 6, SKELETON_COLORS.bone],
  [5, 5, SKELETON_COLORS.highlight], [6, 5, SKELETON_COLORS.highlight], [9, 5, SKELETON_COLORS.highlight], [10, 5, SKELETON_COLORS.highlight],
  [5, 6, SKELETON_COLORS.eyeInner], [6, 6, SKELETON_COLORS.eyeInner], [9, 6, SKELETON_COLORS.eyeInner], [10, 6, SKELETON_COLORS.eyeInner],
  [5, 7, SKELETON_COLORS.bone], [6, 7, SKELETON_COLORS.boneDark], [7, 7, SKELETON_COLORS.boneShadow], [8, 7, SKELETON_COLORS.boneShadow], [9, 7, SKELETON_COLORS.boneDark], [10, 7, SKELETON_COLORS.bone],
  [5, 8, SKELETON_COLORS.bone], [6, 8, SKELETON_COLORS.teeth], [7, 8, SKELETON_COLORS.bone], [8, 8, SKELETON_COLORS.bone], [9, 8, SKELETON_COLORS.teeth], [10, 8, SKELETON_COLORS.bone],
  [5, 9, SKELETON_COLORS.boneDark], [6, 9, SKELETON_COLORS.bone], [7, 9, SKELETON_COLORS.bone], [8, 9, SKELETON_COLORS.bone], [9, 9, SKELETON_COLORS.bone], [10, 9, SKELETON_COLORS.boneDark],
  [6, 10, SKELETON_COLORS.teeth], [7, 10, SKELETON_COLORS.teeth], [8, 10, SKELETON_COLORS.teeth], [9, 10, SKELETON_COLORS.teeth],
  [6, 11, SKELETON_COLORS.boneShadow], [7, 11, SKELETON_COLORS.bone], [8, 11, SKELETON_COLORS.bone], [9, 11, SKELETON_COLORS.boneShadow],
  [5, 12, SKELETON_COLORS.armor], [6, 12, SKELETON_COLORS.armorLight], [7, 12, SKELETON_COLORS.armorLight], [8, 12, SKELETON_COLORS.armorLight], [9, 12, SKELETON_COLORS.armorLight], [10, 12, SKELETON_COLORS.armor],
  [4, 13, SKELETON_COLORS.armorDark], [5, 13, SKELETON_COLORS.armor], [6, 13, SKELETON_COLORS.armorLight], [7, 13, SKELETON_COLORS.armor], [8, 13, SKELETON_COLORS.armor], [9, 13, SKELETON_COLORS.armorLight], [10, 13, SKELETON_COLORS.armor], [11, 13, SKELETON_COLORS.armorDark],
  [5, 14, SKELETON_COLORS.armorDark], [6, 14, SKELETON_COLORS.bone], [7, 14, SKELETON_COLORS.bone], [8, 14, SKELETON_COLORS.bone], [9, 14, SKELETON_COLORS.bone], [10, 14, SKELETON_COLORS.armorDark],
  [6, 15, SKELETON_COLORS.armor], [7, 15, SKELETON_COLORS.armorDark], [8, 15, SKELETON_COLORS.armorDark], [9, 15, SKELETON_COLORS.armor],
]

const SKELETON_FACE_DOWN = [
  [7, 1, SKELETON_COLORS.boneLight], [8, 1, SKELETON_COLORS.boneLight], [9, 1, SKELETON_COLORS.boneLight], [10, 1, SKELETON_COLORS.boneLight],
  [6, 2, SKELETON_COLORS.bone], [7, 2, SKELETON_COLORS.boneLight], [8, 2, SKELETON_COLORS.boneLight], [9, 2, SKELETON_COLORS.boneLight], [10, 2, SKELETON_COLORS.boneLight], [11, 2, SKELETON_COLORS.bone],
  [6, 3, SKELETON_COLORS.bone], [7, 3, SKELETON_COLORS.bone], [8, 3, SKELETON_COLORS.bone], [9, 3, SKELETON_COLORS.bone], [10, 3, SKELETON_COLORS.bone], [11, 3, SKELETON_COLORS.bone],
  [5, 4, SKELETON_COLORS.boneDark], [6, 4, SKELETON_COLORS.bone], [7, 4, SKELETON_COLORS.bone], [8, 4, SKELETON_COLORS.bone], [9, 4, SKELETON_COLORS.bone], [10, 4, SKELETON_COLORS.bone], [11, 4, SKELETON_COLORS.bone], [12, 4, SKELETON_COLORS.boneDark],
  [6, 5, SKELETON_COLORS.bone], [7, 5, SKELETON_COLORS.eye], [8, 5, SKELETON_COLORS.boneShadow], [9, 5, SKELETON_COLORS.boneShadow], [10, 5, SKELETON_COLORS.eye], [11, 5, SKELETON_COLORS.bone],
  [6, 6, SKELETON_COLORS.bone], [7, 6, SKELETON_COLORS.boneDark], [8, 6, SKELETON_COLORS.boneShadow], [9, 6, SKELETON_COLORS.boneShadow], [10, 6, SKELETON_COLORS.boneDark], [11, 6, SKELETON_COLORS.bone],
  [6, 7, SKELETON_COLORS.bone], [7, 7, SKELETON_COLORS.boneLight], [8, 7, SKELETON_COLORS.bone], [9, 7, SKELETON_COLORS.bone], [10, 7, SKELETON_COLORS.boneLight], [11, 7, SKELETON_COLORS.bone],
  [6, 8, SKELETON_COLORS.boneDark], [7, 8, SKELETON_COLORS.bone], [8, 8, SKELETON_COLORS.bone], [9, 8, SKELETON_COLORS.bone], [10, 8, SKELETON_COLORS.bone], [11, 8, SKELETON_COLORS.boneDark],
  [7, 9, SKELETON_COLORS.boneShadow], [8, 9, SKELETON_COLORS.bone], [9, 9, SKELETON_COLORS.bone], [10, 9, SKELETON_COLORS.boneShadow],
  [8, 10, SKELETON_COLORS.boneDark], [9, 10, SKELETON_COLORS.boneDark],
  [6, 11, SKELETON_COLORS.armor], [7, 11, SKELETON_COLORS.armorLight], [8, 11, SKELETON_COLORS.armor], [9, 11, SKELETON_COLORS.armor], [10, 11, SKELETON_COLORS.armorLight], [11, 11, SKELETON_COLORS.armor],
  [5, 12, SKELETON_COLORS.armorDark], [6, 12, SKELETON_COLORS.armor], [7, 12, SKELETON_COLORS.armor], [8, 12, SKELETON_COLORS.armorLight], [9, 12, SKELETON_COLORS.armorLight], [10, 12, SKELETON_COLORS.armor], [11, 12, SKELETON_COLORS.armor], [12, 12, SKELETON_COLORS.armorDark],
  [5, 13, SKELETON_COLORS.armorDark], [6, 13, SKELETON_COLORS.armor], [7, 13, SKELETON_COLORS.armorDark], [8, 13, SKELETON_COLORS.armor], [9, 13, SKELETON_COLORS.armor], [10, 13, SKELETON_COLORS.armorDark], [11, 13, SKELETON_COLORS.armor], [12, 13, SKELETON_COLORS.armorDark],
  [6, 14, SKELETON_COLORS.armorDark], [7, 14, SKELETON_COLORS.shieldGold], [8, 14, SKELETON_COLORS.armorDark], [9, 14, SKELETON_COLORS.armorDark], [10, 14, SKELETON_COLORS.shieldGold], [11, 14, SKELETON_COLORS.armorDark],
  [7, 15, SKELETON_COLORS.bone], [8, 15, SKELETON_COLORS.boneDark], [9, 15, SKELETON_COLORS.boneDark], [10, 15, SKELETON_COLORS.bone],
  [4, 11, SKELETON_COLORS.bone], [4, 12, SKELETON_COLORS.boneDark], [4, 13, SKELETON_COLORS.bone],
  [13, 11, SKELETON_COLORS.bone], [13, 12, SKELETON_COLORS.boneDark], [13, 13, SKELETON_COLORS.bone],
]

const SKELETON_FACE_UP = [
  [6, 1, SKELETON_COLORS.helmet], [7, 1, SKELETON_COLORS.helmetLight], [8, 1, SKELETON_COLORS.helmetLight], [9, 1, SKELETON_COLORS.helmetLight], [10, 1, SKELETON_COLORS.helmetLight], [11, 1, SKELETON_COLORS.helmet],
  [6, 2, SKELETON_COLORS.helmet], [7, 2, SKELETON_COLORS.helmetLight], [8, 2, SKELETON_COLORS.helmet], [9, 2, SKELETON_COLORS.helmet], [10, 2, SKELETON_COLORS.helmetLight], [11, 2, SKELETON_COLORS.helmet],
  [5, 3, SKELETON_COLORS.helmetDark], [6, 3, SKELETON_COLORS.helmet], [7, 3, SKELETON_COLORS.helmet], [8, 3, SKELETON_COLORS.helmetLight], [9, 3, SKELETON_COLORS.helmetLight], [10, 3, SKELETON_COLORS.helmet], [11, 3, SKELETON_COLORS.helmet], [12, 3, SKELETON_COLORS.helmetDark],
  [5, 4, SKELETON_COLORS.helmetDark], [6, 4, SKELETON_COLORS.helmet], [7, 4, SKELETON_COLORS.helmet], [8, 4, SKELETON_COLORS.helmet], [9, 4, SKELETON_COLORS.helmet], [10, 4, SKELETON_COLORS.helmet], [11, 4, SKELETON_COLORS.helmet], [12, 4, SKELETON_COLORS.helmetDark],
  [5, 5, SKELETON_COLORS.cloth], [6, 5, SKELETON_COLORS.cloth], [7, 5, SKELETON_COLORS.clothDark], [8, 5, SKELETON_COLORS.cloth], [9, 5, SKELETON_COLORS.cloth], [10, 5, SKELETON_COLORS.clothDark], [11, 5, SKELETON_COLORS.cloth], [12, 5, SKELETON_COLORS.cloth],
  [5, 6, SKELETON_COLORS.clothDark], [6, 6, SKELETON_COLORS.cloth], [7, 6, SKELETON_COLORS.cloth], [8, 6, SKELETON_COLORS.clothDark], [9, 6, SKELETON_COLORS.clothDark], [10, 6, SKELETON_COLORS.cloth], [11, 6, SKELETON_COLORS.cloth], [12, 6, SKELETON_COLORS.clothDark],
  [6, 7, SKELETON_COLORS.cloth], [7, 7, SKELETON_COLORS.cloth], [8, 7, SKELETON_COLORS.clothDark], [9, 7, SKELETON_COLORS.clothDark], [10, 7, SKELETON_COLORS.cloth], [11, 7, SKELETON_COLORS.cloth],
  [6, 8, SKELETON_COLORS.armor], [7, 8, SKELETON_COLORS.armorLight], [8, 8, SKELETON_COLORS.armor], [9, 8, SKELETON_COLORS.armor], [10, 8, SKELETON_COLORS.armorLight], [11, 8, SKELETON_COLORS.armor],
  [5, 9, SKELETON_COLORS.armorDark], [6, 9, SKELETON_COLORS.armor], [7, 9, SKELETON_COLORS.armor], [8, 9, SKELETON_COLORS.armorLight], [9, 9, SKELETON_COLORS.armorLight], [10, 9, SKELETON_COLORS.armor], [11, 9, SKELETON_COLORS.armor], [12, 9, SKELETON_COLORS.armorDark],
  [5, 10, SKELETON_COLORS.armorDark], [6, 10, SKELETON_COLORS.armor], [7, 10, SKELETON_COLORS.armorDark], [8, 10, SKELETON_COLORS.armor], [9, 10, SKELETON_COLORS.armor], [10, 10, SKELETON_COLORS.armorDark], [11, 10, SKELETON_COLORS.armor], [12, 10, SKELETON_COLORS.armorDark],
  [5, 11, SKELETON_COLORS.armorDark], [6, 11, SKELETON_COLORS.armor], [7, 11, SKELETON_COLORS.armorDark], [8, 11, SKELETON_COLORS.armor], [9, 11, SKELETON_COLORS.armor], [10, 11, SKELETON_COLORS.armorDark], [11, 11, SKELETON_COLORS.armor], [12, 11, SKELETON_COLORS.armorDark],
  [6, 12, SKELETON_COLORS.armorDark], [7, 12, SKELETON_COLORS.shieldGold], [8, 12, SKELETON_COLORS.armorDark], [9, 12, SKELETON_COLORS.armorDark], [10, 12, SKELETON_COLORS.shieldGold], [11, 12, SKELETON_COLORS.armorDark],
  [6, 13, SKELETON_COLORS.bone], [7, 13, SKELETON_COLORS.boneDark], [10, 13, SKELETON_COLORS.boneDark], [11, 13, SKELETON_COLORS.bone],
  [6, 14, SKELETON_COLORS.boneDark], [7, 14, SKELETON_COLORS.bone], [10, 14, SKELETON_COLORS.bone], [11, 14, SKELETON_COLORS.boneDark],
  [7, 15, SKELETON_COLORS.bone], [8, 15, SKELETON_COLORS.boneDark], [9, 15, SKELETON_COLORS.boneDark], [10, 15, SKELETON_COLORS.bone],
  [4, 9, SKELETON_COLORS.bone], [4, 10, SKELETON_COLORS.boneDark], [4, 11, SKELETON_COLORS.bone],
  [13, 9, SKELETON_COLORS.bone], [13, 10, SKELETON_COLORS.boneDark], [13, 11, SKELETON_COLORS.bone],
]

const SKELETON_FACE_LEFT = [
  [7, 1, SKELETON_COLORS.boneLight], [8, 1, SKELETON_COLORS.boneLight], [9, 1, SKELETON_COLORS.boneLight],
  [6, 2, SKELETON_COLORS.bone], [7, 2, SKELETON_COLORS.boneLight], [8, 2, SKELETON_COLORS.bone], [9, 2, SKELETON_COLORS.bone],
  [5, 3, SKELETON_COLORS.boneDark], [6, 3, SKELETON_COLORS.bone], [7, 3, SKELETON_COLORS.bone], [8, 3, SKELETON_COLORS.bone], [9, 3, SKELETON_COLORS.bone],
  [5, 4, SKELETON_COLORS.bone], [6, 4, SKELETON_COLORS.eye], [7, 4, SKELETON_COLORS.bone], [8, 4, SKELETON_COLORS.boneShadow], [9, 4, SKELETON_COLORS.bone],
  [5, 5, SKELETON_COLORS.bone], [6, 5, SKELETON_COLORS.boneDark], [7, 5, SKELETON_COLORS.bone], [8, 5, SKELETON_COLORS.boneShadow],
  [5, 6, SKELETON_COLORS.bone], [6, 6, SKELETON_COLORS.boneLight], [7, 6, SKELETON_COLORS.bone], [8, 6, SKELETON_COLORS.bone],
  [5, 7, SKELETON_COLORS.boneDark], [6, 7, SKELETON_COLORS.bone], [7, 7, SKELETON_COLORS.boneShadow],
  [6, 8, SKELETON_COLORS.bone], [7, 8, SKELETON_COLORS.boneShadow],
  [7, 9, SKELETON_COLORS.boneDark], [8, 9, SKELETON_COLORS.boneDark],
  [6, 10, SKELETON_COLORS.armorLight], [7, 10, SKELETON_COLORS.armor], [8, 10, SKELETON_COLORS.armorDark], [9, 10, SKELETON_COLORS.armorDark],
  [5, 11, SKELETON_COLORS.armor], [6, 11, SKELETON_COLORS.armor], [7, 11, SKELETON_COLORS.armorLight], [8, 11, SKELETON_COLORS.armor], [9, 11, SKELETON_COLORS.armorDark],
  [5, 12, SKELETON_COLORS.armorDark], [6, 12, SKELETON_COLORS.armor], [7, 12, SKELETON_COLORS.armor], [8, 12, SKELETON_COLORS.armorDark], [9, 12, SKELETON_COLORS.armorDark],
  [5, 13, SKELETON_COLORS.armorDark], [6, 13, SKELETON_COLORS.armorDark], [7, 13, SKELETON_COLORS.armorDark], [8, 13, SKELETON_COLORS.armorDark],
  [6, 14, SKELETON_COLORS.shieldGold], [7, 14, SKELETON_COLORS.armorDark], [8, 14, SKELETON_COLORS.armorDark],
  [7, 15, SKELETON_COLORS.bone], [8, 15, SKELETON_COLORS.boneDark],
  [4, 10, SKELETON_COLORS.bone], [4, 11, SKELETON_COLORS.boneDark], [4, 12, SKELETON_COLORS.bone], [4, 13, SKELETON_COLORS.boneDark],
]

const SKELETON_FACE_RIGHT = [
  [8, 1, SKELETON_COLORS.boneLight], [9, 1, SKELETON_COLORS.boneLight], [10, 1, SKELETON_COLORS.boneLight],
  [8, 2, SKELETON_COLORS.bone], [9, 2, SKELETON_COLORS.bone], [10, 2, SKELETON_COLORS.boneLight], [11, 2, SKELETON_COLORS.bone],
  [8, 3, SKELETON_COLORS.bone], [9, 3, SKELETON_COLORS.bone], [10, 3, SKELETON_COLORS.bone], [11, 3, SKELETON_COLORS.bone], [12, 3, SKELETON_COLORS.boneDark],
  [8, 4, SKELETON_COLORS.boneShadow], [9, 4, SKELETON_COLORS.bone], [10, 4, SKELETON_COLORS.bone], [11, 4, SKELETON_COLORS.eye], [12, 4, SKELETON_COLORS.bone],
  [9, 5, SKELETON_COLORS.boneShadow], [10, 5, SKELETON_COLORS.bone], [11, 5, SKELETON_COLORS.boneDark], [12, 5, SKELETON_COLORS.bone],
  [9, 6, SKELETON_COLORS.bone], [10, 6, SKELETON_COLORS.bone], [11, 6, SKELETON_COLORS.boneLight], [12, 6, SKELETON_COLORS.bone],
  [10, 7, SKELETON_COLORS.boneShadow], [11, 7, SKELETON_COLORS.bone], [12, 7, SKELETON_COLORS.boneDark],
  [10, 8, SKELETON_COLORS.boneShadow], [11, 8, SKELETON_COLORS.bone],
  [9, 9, SKELETON_COLORS.boneDark], [10, 9, SKELETON_COLORS.boneDark],
  [8, 10, SKELETON_COLORS.armorDark], [9, 10, SKELETON_COLORS.armorDark], [10, 10, SKELETON_COLORS.armor], [11, 10, SKELETON_COLORS.armorLight],
  [8, 11, SKELETON_COLORS.armorDark], [9, 11, SKELETON_COLORS.armor], [10, 11, SKELETON_COLORS.armorLight], [11, 11, SKELETON_COLORS.armor], [12, 11, SKELETON_COLORS.armor],
  [8, 12, SKELETON_COLORS.armorDark], [9, 12, SKELETON_COLORS.armorDark], [10, 12, SKELETON_COLORS.armor], [11, 12, SKELETON_COLORS.armor], [12, 12, SKELETON_COLORS.armorDark],
  [8, 13, SKELETON_COLORS.armorDark], [9, 13, SKELETON_COLORS.armorDark], [10, 13, SKELETON_COLORS.armorDark], [11, 13, SKELETON_COLORS.armorDark],
  [9, 14, SKELETON_COLORS.armorDark], [10, 14, SKELETON_COLORS.armorDark], [11, 14, SKELETON_COLORS.shieldGold],
  [9, 15, SKELETON_COLORS.boneDark], [10, 15, SKELETON_COLORS.bone],
  [13, 10, SKELETON_COLORS.bone], [13, 11, SKELETON_COLORS.boneDark], [13, 12, SKELETON_COLORS.bone], [13, 13, SKELETON_COLORS.boneDark],
]

const SKELETON_IDLE_FRAMES = [
  [
    { pixels: [[7, 15, SKELETON_COLORS.bone], [8, 15, SKELETON_COLORS.boneDark], [9, 15, SKELETON_COLORS.boneDark], [10, 15, SKELETON_COLORS.bone]] }
  ],
  [
    { pixels: [[6, 15, SKELETON_COLORS.bone], [7, 15, SKELETON_COLORS.bone], [8, 15, SKELETON_COLORS.boneDark], [9, 15, SKELETON_COLORS.boneDark], [10, 15, SKELETON_COLORS.bone], [11, 15, SKELETON_COLORS.bone]] }
  ]
]

const SKELETON_WALK_FRAMES = [
  [
    { pixels: [[6, 15, SKELETON_COLORS.boneDark], [7, 15, SKELETON_COLORS.bone], [8, 15, SKELETON_COLORS.bone], [9, 15, SKELETON_COLORS.boneDark], [10, 15, SKELETON_COLORS.boneDark]] }
  ],
  [
    { pixels: [[7, 15, SKELETON_COLORS.bone], [8, 15, SKELETON_COLORS.boneDark], [9, 15, SKELETON_COLORS.boneDark], [10, 15, SKELETON_COLORS.bone]] }
  ],
  [
    { pixels: [[7, 15, SKELETON_COLORS.boneDark], [8, 15, SKELETON_COLORS.boneDark], [9, 15, SKELETON_COLORS.bone], [10, 15, SKELETON_COLORS.bone], [11, 15, SKELETON_COLORS.boneDark]] }
  ]
]

export const drawSkeletonSoldier = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: SKELETON_FACE_DOWN,
  up: SKELETON_FACE_UP,
  left: SKELETON_FACE_LEFT,
  right: SKELETON_FACE_RIGHT,
  idle: SKELETON_IDLE_FRAMES,
  walk: SKELETON_WALK_FRAMES,
})

export const drawSkeletonSoldierAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, SKELETON_AVATAR)