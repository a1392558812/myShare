import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.004,
  WALK_SPEED: 0.1,
}

const WYRM_COLORS = {
  body: '#B8D8F0',
  bodyLight: '#E0F0FF',
  bodyDark: '#80A8CC',
  bodyShadow: '#5A7A9A',
  spike: '#D0E8F8',
  spikeDark: '#80A8CC',
  belly: '#E8F4FF',
  bellyLight: '#FFFFFF',
  horn: '#F0F8FF',
  hornDark: '#B8D0E8',
  teeth: '#FFFFFF',
  eye: '#00FFFF',
  eyeGlow: '#80FFFF',
  eyeInner: '#FFFFFF',
  wing: '#C0E0F5',
  wingLight: '#E0F0FF',
  wingDark: '#7A9FBE',
  wingBone: '#E0F0FF',
  claw: '#F0F8FF',
  clawDark: '#A0C8E0',
  frost: '#80E0FF',
  frostLight: '#C0F0FF',
  frostDark: '#40A0D0',
  scale: '#D0E8F8',
  magic: '#00FFFF',
  magicLight: '#80FFFF',
  rune: '#00CCFF',
  spark: '#FFFFFF',
  highlight: '#FFFFFF',
}

const WYRM_AVATAR = [
  [4, 0, WYRM_COLORS.hornDark], [5, 0, WYRM_COLORS.horn], [6, 0, WYRM_COLORS.horn], [9, 0, WYRM_COLORS.horn], [10, 0, WYRM_COLORS.horn], [11, 0, WYRM_COLORS.hornDark],
  [4, 1, WYRM_COLORS.horn], [5, 1, WYRM_COLORS.hornDark], [6, 1, WYRM_COLORS.hornDark], [9, 1, WYRM_COLORS.hornDark], [10, 1, WYRM_COLORS.hornDark], [11, 1, WYRM_COLORS.horn],

  [3, 2, WYRM_COLORS.bodyDark], [4, 2, WYRM_COLORS.body], [5, 2, WYRM_COLORS.bodyLight], [6, 2, WYRM_COLORS.body], [7, 2, WYRM_COLORS.bodyLight], [8, 2, WYRM_COLORS.bodyLight], [9, 2, WYRM_COLORS.body], [10, 2, WYRM_COLORS.bodyLight], [11, 2, WYRM_COLORS.body], [12, 2, WYRM_COLORS.bodyDark],
  [3, 3, WYRM_COLORS.body], [4, 3, WYRM_COLORS.bodyLight], [5, 3, WYRM_COLORS.body], [6, 3, WYRM_COLORS.bodyLight], [7, 3, WYRM_COLORS.body], [8, 3, WYRM_COLORS.bodyLight], [9, 3, WYRM_COLORS.body], [10, 3, WYRM_COLORS.bodyLight], [11, 3, WYRM_COLORS.body], [12, 3, WYRM_COLORS.bodyDark],

  [2, 4, WYRM_COLORS.bodyDark], [3, 4, WYRM_COLORS.body], [4, 4, WYRM_COLORS.eye], [5, 4, WYRM_COLORS.eyeGlow], [6, 4, WYRM_COLORS.body], [7, 4, WYRM_COLORS.body], [8, 4, WYRM_COLORS.body], [9, 4, WYRM_COLORS.eyeGlow], [10, 4, WYRM_COLORS.eye], [11, 4, WYRM_COLORS.body], [12, 4, WYRM_COLORS.bodyDark],
  [4, 3, WYRM_COLORS.highlight], [5, 3, WYRM_COLORS.highlight], [9, 3, WYRM_COLORS.highlight], [10, 3, WYRM_COLORS.highlight],
  [4, 4, WYRM_COLORS.highlight], [10, 4, WYRM_COLORS.highlight],

  [4, 4, WYRM_COLORS.eyeGlow], [5, 4, WYRM_COLORS.eyeGlow], [9, 4, WYRM_COLORS.eyeGlow], [10, 4, WYRM_COLORS.eyeGlow],
  [5, 5, WYRM_COLORS.eyeInner], [6, 5, WYRM_COLORS.eyeInner], [9, 5, WYRM_COLORS.eyeInner], [10, 5, WYRM_COLORS.eyeInner],

  [3, 5, WYRM_COLORS.body], [4, 5, WYRM_COLORS.bodyLight], [5, 5, WYRM_COLORS.body], [6, 5, WYRM_COLORS.body], [7, 5, WYRM_COLORS.bodyLight], [8, 5, WYRM_COLORS.bodyLight], [9, 5, WYRM_COLORS.body], [10, 5, WYRM_COLORS.body], [11, 5, WYRM_COLORS.bodyDark],
  [3, 6, WYRM_COLORS.bodyLight], [4, 6, WYRM_COLORS.body], [5, 6, WYRM_COLORS.body], [6, 6, WYRM_COLORS.bodyLight], [7, 6, WYRM_COLORS.bodyLight], [8, 6, WYRM_COLORS.bodyLight], [9, 6, WYRM_COLORS.body], [10, 6, WYRM_COLORS.body], [11, 6, WYRM_COLORS.bodyLight],

  [4, 7, WYRM_COLORS.teeth], [5, 7, WYRM_COLORS.teeth], [6, 7, WYRM_COLORS.teeth], [7, 7, WYRM_COLORS.teeth], [8, 7, WYRM_COLORS.teeth], [9, 7, WYRM_COLORS.teeth], [10, 7, WYRM_COLORS.teeth],
  [5, 8, WYRM_COLORS.teeth], [6, 8, WYRM_COLORS.teeth], [7, 8, WYRM_COLORS.teeth], [8, 8, WYRM_COLORS.teeth], [9, 8, WYRM_COLORS.teeth],

  [4, 9, WYRM_COLORS.bodyDark], [5, 9, WYRM_COLORS.body], [6, 9, WYRM_COLORS.body], [7, 9, WYRM_COLORS.bodyLight], [8, 9, WYRM_COLORS.body], [9, 9, WYRM_COLORS.body], [10, 9, WYRM_COLORS.bodyDark],
  [5, 10, WYRM_COLORS.body], [6, 10, WYRM_COLORS.bodyLight], [7, 10, WYRM_COLORS.body], [8, 10, WYRM_COLORS.bodyLight], [9, 10, WYRM_COLORS.body],

  [4, 11, WYRM_COLORS.body], [5, 11, WYRM_COLORS.bodyLight], [6, 11, WYRM_COLORS.body], [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.bodyLight], [9, 11, WYRM_COLORS.body],
  [5, 12, WYRM_COLORS.bodyDark], [6, 12, WYRM_COLORS.body], [7, 12, WYRM_COLORS.bodyLight], [8, 12, WYRM_COLORS.body], [9, 12, WYRM_COLORS.bodyDark],

  [3, 10, WYRM_COLORS.frost], [4, 10, WYRM_COLORS.frostLight],
  [3, 11, WYRM_COLORS.frostLight], [4, 11, WYRM_COLORS.frost],
  [10, 10, WYRM_COLORS.frostLight], [11, 10, WYRM_COLORS.frost],
  [10, 11, WYRM_COLORS.frost], [11, 11, WYRM_COLORS.frostLight],

  [5, 12, WYRM_COLORS.rune], [6, 12, WYRM_COLORS.magicLight],
  [9, 12, WYRM_COLORS.magicLight], [10, 12, WYRM_COLORS.rune],

  [5, 13, WYRM_COLORS.belly], [6, 13, WYRM_COLORS.bellyLight], [7, 13, WYRM_COLORS.belly], [8, 13, WYRM_COLORS.bellyLight], [9, 13, WYRM_COLORS.belly],
  [6, 14, WYRM_COLORS.bellyLight], [7, 14, WYRM_COLORS.belly], [8, 14, WYRM_COLORS.bellyLight],

  [4, 6, WYRM_COLORS.frostLight], [11, 6, WYRM_COLORS.frostLight],
  [3, 8, WYRM_COLORS.frost], [12, 8, WYRM_COLORS.frost],
]

const WYRM_FACE_LEFT = [
  [2, 5, WYRM_COLORS.horn], [3, 5, WYRM_COLORS.horn],
  [2, 6, WYRM_COLORS.bodyLight], [3, 6, WYRM_COLORS.bodyLight], [4, 6, WYRM_COLORS.body],
  [2, 7, WYRM_COLORS.body], [3, 7, WYRM_COLORS.eye], [4, 7, WYRM_COLORS.eyeGlow], [5, 7, WYRM_COLORS.bodyLight],
  [2, 8, WYRM_COLORS.bodyDark], [3, 8, WYRM_COLORS.body], [4, 8, WYRM_COLORS.body], [5, 8, WYRM_COLORS.body], [6, 8, WYRM_COLORS.bodyLight],
  [3, 9, WYRM_COLORS.teeth], [4, 9, WYRM_COLORS.teeth], [5, 9, WYRM_COLORS.body], [6, 9, WYRM_COLORS.body], [7, 9, WYRM_COLORS.bodyLight],
  [3, 10, WYRM_COLORS.bodyDark], [4, 10, WYRM_COLORS.body], [5, 10, WYRM_COLORS.body], [6, 10, WYRM_COLORS.body], [7, 10, WYRM_COLORS.bodyLight],

  [7, 7, WYRM_COLORS.bodyLight], [8, 7, WYRM_COLORS.body],
  [7, 8, WYRM_COLORS.body], [8, 8, WYRM_COLORS.bodyLight], [9, 8, WYRM_COLORS.body],
  [8, 9, WYRM_COLORS.body], [9, 9, WYRM_COLORS.bodyLight], [10, 9, WYRM_COLORS.body],
  [8, 10, WYRM_COLORS.bodyLight], [9, 10, WYRM_COLORS.body], [10, 10, WYRM_COLORS.bodyLight],

  [9, 6, WYRM_COLORS.spike],
  [10, 5, WYRM_COLORS.spike], [11, 5, WYRM_COLORS.spikeDark],
  [11, 6, WYRM_COLORS.spike], [12, 6, WYRM_COLORS.spikeDark],

  [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.body], [9, 11, WYRM_COLORS.bodyLight], [10, 11, WYRM_COLORS.body], [11, 11, WYRM_COLORS.bodyLight], [12, 11, WYRM_COLORS.body], [13, 11, WYRM_COLORS.bodyLight],
  [6, 12, WYRM_COLORS.bodyDark], [7, 12, WYRM_COLORS.body], [8, 12, WYRM_COLORS.body], [9, 12, WYRM_COLORS.bodyLight], [10, 12, WYRM_COLORS.body], [11, 12, WYRM_COLORS.bodyLight], [12, 12, WYRM_COLORS.body], [13, 12, WYRM_COLORS.body], [14, 12, WYRM_COLORS.bodyDark],

  [5, 13, WYRM_COLORS.bodyDark], [6, 13, WYRM_COLORS.belly], [7, 13, WYRM_COLORS.bellyLight], [8, 13, WYRM_COLORS.belly], [9, 13, WYRM_COLORS.bellyLight], [10, 13, WYRM_COLORS.belly], [11, 13, WYRM_COLORS.bellyLight], [12, 13, WYRM_COLORS.belly], [13, 13, WYRM_COLORS.bodyLight], [14, 13, WYRM_COLORS.bodyDark],
  [6, 14, WYRM_COLORS.belly], [7, 14, WYRM_COLORS.bellyLight], [8, 14, WYRM_COLORS.belly], [9, 14, WYRM_COLORS.bellyLight], [10, 14, WYRM_COLORS.belly], [11, 14, WYRM_COLORS.bellyLight], [12, 14, WYRM_COLORS.belly], [13, 14, WYRM_COLORS.body],

  [5, 11, WYRM_COLORS.body],
  [5, 12, WYRM_COLORS.bodyDark],
  [4, 13, WYRM_COLORS.clawDark], [5, 13, WYRM_COLORS.claw],
  [4, 14, WYRM_COLORS.claw], [5, 14, WYRM_COLORS.claw],
  [4, 15, WYRM_COLORS.clawDark], [5, 15, WYRM_COLORS.clawDark],

  [14, 11, WYRM_COLORS.body], [15, 11, WYRM_COLORS.bodyLight],
  [14, 12, WYRM_COLORS.body], [15, 12, WYRM_COLORS.bodyDark],
  [15, 13, WYRM_COLORS.claw], [16, 13, WYRM_COLORS.clawDark],
  [15, 14, WYRM_COLORS.claw], [16, 14, WYRM_COLORS.claw],
  [15, 15, WYRM_COLORS.clawDark], [16, 15, WYRM_COLORS.clawDark],

  [8, 4, WYRM_COLORS.wingBone], [9, 4, WYRM_COLORS.wingLight], [10, 4, WYRM_COLORS.wing],
  [7, 5, WYRM_COLORS.wing], [8, 5, WYRM_COLORS.wingLight], [9, 5, WYRM_COLORS.wing], [10, 5, WYRM_COLORS.wingLight], [11, 5, WYRM_COLORS.wing], [12, 5, WYRM_COLORS.wingDark],
  [6, 6, WYRM_COLORS.wingDark], [7, 6, WYRM_COLORS.wing], [8, 6, WYRM_COLORS.wingLight], [9, 6, WYRM_COLORS.wing], [10, 6, WYRM_COLORS.wingLight], [11, 6, WYRM_COLORS.wing], [12, 6, WYRM_COLORS.wingDark], [13, 6, WYRM_COLORS.wingDark],
  [10, 7, WYRM_COLORS.wing], [11, 7, WYRM_COLORS.wingLight], [12, 7, WYRM_COLORS.wing], [13, 7, WYRM_COLORS.wingDark],
  [11, 8, WYRM_COLORS.wingDark], [12, 8, WYRM_COLORS.wing], [13, 8, WYRM_COLORS.wingDark],

  [13, 10, WYRM_COLORS.bodyLight], [14, 10, WYRM_COLORS.body],
  [14, 11, WYRM_COLORS.body], [15, 11, WYRM_COLORS.bodyDark],
  [15, 12, WYRM_COLORS.tail], [16, 12, WYRM_COLORS.tailDark],
  [15, 13, WYRM_COLORS.tailLight], [16, 13, WYRM_COLORS.tail],
  [16, 14, WYRM_COLORS.tail], [17, 14, WYRM_COLORS.tailDark],
  [16, 15, WYRM_COLORS.tailLight], [17, 15, WYRM_COLORS.tail],

  [2, 8, WYRM_COLORS.frost], [2, 9, WYRM_COLORS.frostLight],
  [1, 8, WYRM_COLORS.frostLight], [1, 9, WYRM_COLORS.frost],

  [9, 12, WYRM_COLORS.magic], [10, 12, WYRM_COLORS.magicLight],
]

const WYRM_FACE_RIGHT = [
  [16, 5, WYRM_COLORS.horn], [17, 5, WYRM_COLORS.horn],
  [16, 6, WYRM_COLORS.bodyLight], [17, 6, WYRM_COLORS.bodyLight],
  [14, 7, WYRM_COLORS.bodyLight], [15, 7, WYRM_COLORS.eyeGlow], [16, 7, WYRM_COLORS.eye], [17, 7, WYRM_COLORS.body],
  [13, 8, WYRM_COLORS.bodyLight], [14, 8, WYRM_COLORS.body], [15, 8, WYRM_COLORS.body], [16, 8, WYRM_COLORS.body], [17, 8, WYRM_COLORS.bodyDark],
  [12, 9, WYRM_COLORS.bodyLight], [13, 9, WYRM_COLORS.body], [14, 9, WYRM_COLORS.body], [15, 9, WYRM_COLORS.teeth], [16, 9, WYRM_COLORS.teeth],
  [12, 10, WYRM_COLORS.bodyLight], [13, 10, WYRM_COLORS.body], [14, 10, WYRM_COLORS.body], [15, 10, WYRM_COLORS.body], [16, 10, WYRM_COLORS.bodyDark],

  [11, 7, WYRM_COLORS.body], [12, 7, WYRM_COLORS.bodyLight],
  [10, 8, WYRM_COLORS.body], [11, 8, WYRM_COLORS.bodyLight], [12, 8, WYRM_COLORS.body],
  [9, 9, WYRM_COLORS.body], [10, 9, WYRM_COLORS.bodyLight], [11, 9, WYRM_COLORS.body],
  [9, 10, WYRM_COLORS.bodyLight], [10, 10, WYRM_COLORS.body], [11, 10, WYRM_COLORS.bodyLight],

  [10, 6, WYRM_COLORS.spike],
  [7, 5, WYRM_COLORS.spikeDark], [8, 5, WYRM_COLORS.spike],
  [6, 6, WYRM_COLORS.spikeDark], [7, 6, WYRM_COLORS.spike],

  [6, 11, WYRM_COLORS.bodyLight], [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.bodyLight], [9, 11, WYRM_COLORS.body], [10, 11, WYRM_COLORS.bodyLight], [11, 11, WYRM_COLORS.body], [12, 11, WYRM_COLORS.bodyLight],
  [5, 12, WYRM_COLORS.bodyDark], [6, 12, WYRM_COLORS.body], [7, 12, WYRM_COLORS.bodyLight], [8, 12, WYRM_COLORS.body], [9, 12, WYRM_COLORS.bodyLight], [10, 12, WYRM_COLORS.body], [11, 12, WYRM_COLORS.bodyLight], [12, 12, WYRM_COLORS.body], [13, 12, WYRM_COLORS.bodyDark],

  [5, 13, WYRM_COLORS.bodyDark], [6, 13, WYRM_COLORS.belly], [7, 13, WYRM_COLORS.bellyLight], [8, 13, WYRM_COLORS.belly], [9, 13, WYRM_COLORS.bellyLight], [10, 13, WYRM_COLORS.belly], [11, 13, WYRM_COLORS.bellyLight], [12, 13, WYRM_COLORS.belly], [13, 13, WYRM_COLORS.bodyLight], [14, 13, WYRM_COLORS.bodyDark],
  [6, 14, WYRM_COLORS.belly], [7, 14, WYRM_COLORS.bellyLight], [8, 14, WYRM_COLORS.belly], [9, 14, WYRM_COLORS.bellyLight], [10, 14, WYRM_COLORS.belly], [11, 14, WYRM_COLORS.bellyLight], [12, 14, WYRM_COLORS.belly], [13, 14, WYRM_COLORS.body],

  [14, 11, WYRM_COLORS.body],
  [14, 12, WYRM_COLORS.bodyDark],
  [14, 13, WYRM_COLORS.claw], [15, 13, WYRM_COLORS.clawDark],
  [14, 14, WYRM_COLORS.claw], [15, 14, WYRM_COLORS.claw],
  [14, 15, WYRM_COLORS.clawDark], [15, 15, WYRM_COLORS.clawDark],

  [4, 11, WYRM_COLORS.bodyLight], [5, 11, WYRM_COLORS.body],
  [4, 12, WYRM_COLORS.body], [5, 12, WYRM_COLORS.bodyDark],
  [3, 13, WYRM_COLORS.clawDark], [4, 13, WYRM_COLORS.claw],
  [3, 14, WYRM_COLORS.claw], [4, 14, WYRM_COLORS.claw],
  [3, 15, WYRM_COLORS.clawDark], [4, 15, WYRM_COLORS.clawDark],

  [9, 4, WYRM_COLORS.wing], [10, 4, WYRM_COLORS.wingLight], [11, 4, WYRM_COLORS.wingBone],
  [7, 5, WYRM_COLORS.wingDark], [8, 5, WYRM_COLORS.wing], [9, 5, WYRM_COLORS.wingLight], [10, 5, WYRM_COLORS.wing], [11, 5, WYRM_COLORS.wingLight], [12, 5, WYRM_COLORS.wing],
  [6, 6, WYRM_COLORS.wingDark], [7, 6, WYRM_COLORS.wingDark], [8, 6, WYRM_COLORS.wing], [9, 6, WYRM_COLORS.wingLight], [10, 6, WYRM_COLORS.wing], [11, 6, WYRM_COLORS.wingLight], [12, 6, WYRM_COLORS.wing], [13, 6, WYRM_COLORS.wingDark],
  [6, 7, WYRM_COLORS.wingDark], [7, 7, WYRM_COLORS.wing], [8, 7, WYRM_COLORS.wingLight], [9, 7, WYRM_COLORS.wing], [10, 7, WYRM_COLORS.wingLight], [11, 7, WYRM_COLORS.wingDark],
  [6, 8, WYRM_COLORS.wingDark], [7, 8, WYRM_COLORS.wing], [8, 8, WYRM_COLORS.wingDark],

  [5, 10, WYRM_COLORS.body], [6, 10, WYRM_COLORS.bodyLight],
  [4, 11, WYRM_COLORS.bodyDark], [5, 11, WYRM_COLORS.body],
  [3, 12, WYRM_COLORS.tailDark], [4, 12, WYRM_COLORS.tail],
  [3, 13, WYRM_COLORS.tail], [2, 13, WYRM_COLORS.tailLight],
  [2, 14, WYRM_COLORS.tail], [3, 14, WYRM_COLORS.tailLight],
  [2, 15, WYRM_COLORS.tail], [3, 15, WYRM_COLORS.tailDark],

  [17, 8, WYRM_COLORS.frost], [17, 9, WYRM_COLORS.frostLight],

  [9, 12, WYRM_COLORS.magicLight], [10, 12, WYRM_COLORS.magic],
]

const WYRM_FACE_DOWN = [
  [7, 0, WYRM_COLORS.horn], [8, 0, WYRM_COLORS.horn], [11, 0, WYRM_COLORS.horn], [12, 0, WYRM_COLORS.horn],
  [6, 1, WYRM_COLORS.hornDark], [7, 1, WYRM_COLORS.bodyLight], [8, 1, WYRM_COLORS.body], [9, 1, WYRM_COLORS.body], [10, 1, WYRM_COLORS.body], [11, 1, WYRM_COLORS.bodyLight], [12, 1, WYRM_COLORS.body], [13, 1, WYRM_COLORS.hornDark],
  [5, 2, WYRM_COLORS.bodyLight], [6, 2, WYRM_COLORS.body], [7, 2, WYRM_COLORS.bodyLight], [8, 2, WYRM_COLORS.body], [9, 2, WYRM_COLORS.bodyLight], [10, 2, WYRM_COLORS.body], [11, 2, WYRM_COLORS.bodyLight], [12, 2, WYRM_COLORS.body], [13, 2, WYRM_COLORS.bodyLight],
  [5, 3, WYRM_COLORS.body], [6, 3, WYRM_COLORS.body], [7, 3, WYRM_COLORS.eye], [8, 3, WYRM_COLORS.eyeGlow], [9, 3, WYRM_COLORS.body], [10, 3, WYRM_COLORS.body], [11, 3, WYRM_COLORS.eyeGlow], [12, 3, WYRM_COLORS.eye], [13, 3, WYRM_COLORS.body], [14, 3, WYRM_COLORS.bodyDark],

  [6, 4, WYRM_COLORS.body], [7, 4, WYRM_COLORS.body], [8, 4, WYRM_COLORS.bodyLight], [9, 4, WYRM_COLORS.bodyLight], [10, 4, WYRM_COLORS.bodyLight], [11, 4, WYRM_COLORS.body], [12, 4, WYRM_COLORS.body],
  [7, 5, WYRM_COLORS.bodyLight], [8, 5, WYRM_COLORS.body], [9, 5, WYRM_COLORS.body], [10, 5, WYRM_COLORS.body], [11, 5, WYRM_COLORS.bodyLight],
  [7, 6, WYRM_COLORS.teeth], [8, 5, WYRM_COLORS.teeth], [9, 5, WYRM_COLORS.teeth], [10, 5, WYRM_COLORS.teeth], [11, 6, WYRM_COLORS.teeth],
  [7, 7, WYRM_COLORS.teeth], [8, 6, WYRM_COLORS.teeth], [9, 6, WYRM_COLORS.body], [10, 6, WYRM_COLORS.teeth], [11, 7, WYRM_COLORS.teeth],
  [8, 7, WYRM_COLORS.bodyDark], [9, 7, WYRM_COLORS.body], [10, 7, WYRM_COLORS.bodyDark],

  [6, 8, WYRM_COLORS.bodyLight], [7, 8, WYRM_COLORS.body], [8, 8, WYRM_COLORS.bodyLight], [9, 8, WYRM_COLORS.body], [10, 8, WYRM_COLORS.bodyLight], [11, 8, WYRM_COLORS.body], [12, 8, WYRM_COLORS.bodyLight], [13, 8, WYRM_COLORS.body],

  [5, 9, WYRM_COLORS.body], [6, 9, WYRM_COLORS.bodyLight], [7, 9, WYRM_COLORS.body], [8, 9, WYRM_COLORS.bodyLight], [9, 9, WYRM_COLORS.body], [10, 9, WYRM_COLORS.bodyLight], [11, 9, WYRM_COLORS.body], [12, 9, WYRM_COLORS.bodyLight], [13, 9, WYRM_COLORS.body], [14, 9, WYRM_COLORS.bodyDark],
  [4, 10, WYRM_COLORS.bodyDark], [5, 10, WYRM_COLORS.body], [6, 10, WYRM_COLORS.body], [7, 10, WYRM_COLORS.bodyLight], [8, 10, WYRM_COLORS.body], [9, 10, WYRM_COLORS.bodyLight], [10, 10, WYRM_COLORS.body], [11, 10, WYRM_COLORS.bodyLight], [12, 10, WYRM_COLORS.body], [13, 10, WYRM_COLORS.body], [14, 10, WYRM_COLORS.bodyDark],
  [4, 11, WYRM_COLORS.bodyDark], [5, 11, WYRM_COLORS.body], [6, 11, WYRM_COLORS.bodyLight], [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.bodyLight], [9, 11, WYRM_COLORS.body], [10, 11, WYRM_COLORS.bodyLight], [11, 11, WYRM_COLORS.body], [12, 11, WYRM_COLORS.bodyLight], [13, 11, WYRM_COLORS.body], [14, 11, WYRM_COLORS.bodyDark],

  [5, 12, WYRM_COLORS.bodyDark], [6, 12, WYRM_COLORS.belly], [7, 12, WYRM_COLORS.bellyLight], [8, 12, WYRM_COLORS.belly], [9, 12, WYRM_COLORS.bellyLight], [10, 12, WYRM_COLORS.belly], [11, 12, WYRM_COLORS.bellyLight], [12, 12, WYRM_COLORS.belly], [13, 12, WYRM_COLORS.bodyDark],
  [6, 13, WYRM_COLORS.belly], [7, 13, WYRM_COLORS.bellyLight], [8, 13, WYRM_COLORS.belly], [9, 13, WYRM_COLORS.bellyLight], [10, 13, WYRM_COLORS.belly], [11, 13, WYRM_COLORS.bellyLight], [12, 13, WYRM_COLORS.belly],
  [7, 14, WYRM_COLORS.belly], [8, 14, WYRM_COLORS.bellyLight], [9, 14, WYRM_COLORS.belly], [10, 14, WYRM_COLORS.bellyLight], [11, 14, WYRM_COLORS.belly],
  [8, 15, WYRM_COLORS.bellyLight], [9, 15, WYRM_COLORS.belly], [10, 15, WYRM_COLORS.bellyLight],

  [2, 6, WYRM_COLORS.wingDark], [3, 6, WYRM_COLORS.wing], [15, 6, WYRM_COLORS.wing], [16, 6, WYRM_COLORS.wingDark],
  [2, 7, WYRM_COLORS.wing], [3, 7, WYRM_COLORS.wingLight], [4, 7, WYRM_COLORS.wing], [14, 7, WYRM_COLORS.wing], [15, 7, WYRM_COLORS.wingLight], [16, 7, WYRM_COLORS.wing],
  [2, 8, WYRM_COLORS.wingDark], [3, 8, WYRM_COLORS.wing], [4, 8, WYRM_COLORS.wingLight], [14, 8, WYRM_COLORS.wingLight], [15, 8, WYRM_COLORS.wing], [16, 8, WYRM_COLORS.wingDark],
  [3, 9, WYRM_COLORS.wingDark], [4, 9, WYRM_COLORS.wing], [14, 9, WYRM_COLORS.wing], [15, 9, WYRM_COLORS.wingDark],

  [3, 12, WYRM_COLORS.clawDark], [4, 12, WYRM_COLORS.claw], [14, 12, WYRM_COLORS.claw], [15, 12, WYRM_COLORS.clawDark],
  [3, 13, WYRM_COLORS.claw], [4, 13, WYRM_COLORS.claw], [14, 13, WYRM_COLORS.claw], [15, 13, WYRM_COLORS.claw],
  [3, 14, WYRM_COLORS.clawDark], [4, 14, WYRM_COLORS.clawDark], [14, 14, WYRM_COLORS.clawDark], [15, 14, WYRM_COLORS.clawDark],

  [9, 10, WYRM_COLORS.magic], [8, 11, WYRM_COLORS.magicLight], [10, 11, WYRM_COLORS.magicLight],
  [7, 10, WYRM_COLORS.rune], [11, 10, WYRM_COLORS.rune],

  [9, 0, WYRM_COLORS.tail], [10, 0, WYRM_COLORS.tailLight],
]

const WYRM_FACE_UP = [
  [7, 0, WYRM_COLORS.bodyDark], [8, 0, WYRM_COLORS.horn], [9, 0, WYRM_COLORS.horn], [10, 0, WYRM_COLORS.horn], [11, 0, WYRM_COLORS.horn], [12, 0, WYRM_COLORS.bodyDark],
  [6, 1, WYRM_COLORS.bodyLight], [7, 1, WYRM_COLORS.body], [8, 1, WYRM_COLORS.bodyLight], [9, 1, WYRM_COLORS.body], [10, 1, WYRM_COLORS.body], [11, 1, WYRM_COLORS.bodyLight], [12, 1, WYRM_COLORS.body], [13, 1, WYRM_COLORS.bodyLight],
  [5, 2, WYRM_COLORS.bodyLight], [6, 2, WYRM_COLORS.body], [7, 2, WYRM_COLORS.bodyLight], [8, 2, WYRM_COLORS.body], [9, 2, WYRM_COLORS.bodyLight], [10, 2, WYRM_COLORS.body], [11, 2, WYRM_COLORS.bodyLight], [12, 2, WYRM_COLORS.body], [13, 2, WYRM_COLORS.bodyLight],
  [5, 3, WYRM_COLORS.body], [6, 3, WYRM_COLORS.body], [7, 3, WYRM_COLORS.body], [8, 3, WYRM_COLORS.bodyLight], [9, 3, WYRM_COLORS.body], [10, 3, WYRM_COLORS.bodyLight], [11, 3, WYRM_COLORS.body], [12, 3, WYRM_COLORS.body], [13, 3, WYRM_COLORS.body], [14, 3, WYRM_COLORS.bodyDark],

  [7, 4, WYRM_COLORS.spike], [8, 4, WYRM_COLORS.spikeDark], [9, 4, WYRM_COLORS.spike], [10, 4, WYRM_COLORS.spikeDark], [11, 4, WYRM_COLORS.spike],
  [6, 5, WYRM_COLORS.body], [7, 5, WYRM_COLORS.bodyLight], [8, 5, WYRM_COLORS.body], [9, 5, WYRM_COLORS.bodyLight], [10, 5, WYRM_COLORS.body], [11, 5, WYRM_COLORS.bodyLight], [12, 5, WYRM_COLORS.body],

  [5, 6, WYRM_COLORS.bodyDark], [6, 6, WYRM_COLORS.body], [7, 6, WYRM_COLORS.bodyLight], [8, 6, WYRM_COLORS.body], [9, 6, WYRM_COLORS.bodyLight], [10, 6, WYRM_COLORS.body], [11, 6, WYRM_COLORS.bodyLight], [12, 6, WYRM_COLORS.body], [13, 6, WYRM_COLORS.bodyDark],
  [4, 7, WYRM_COLORS.bodyDark], [5, 7, WYRM_COLORS.body], [6, 7, WYRM_COLORS.body], [7, 7, WYRM_COLORS.bodyLight], [8, 7, WYRM_COLORS.body], [9, 7, WYRM_COLORS.bodyLight], [10, 7, WYRM_COLORS.body], [11, 7, WYRM_COLORS.bodyLight], [12, 7, WYRM_COLORS.body], [13, 7, WYRM_COLORS.body], [14, 7, WYRM_COLORS.bodyDark],
  [4, 8, WYRM_COLORS.bodyDark], [5, 8, WYRM_COLORS.body], [6, 8, WYRM_COLORS.bodyLight], [7, 8, WYRM_COLORS.body], [8, 8, WYRM_COLORS.bodyLight], [9, 8, WYRM_COLORS.body], [10, 8, WYRM_COLORS.bodyLight], [11, 8, WYRM_COLORS.body], [12, 8, WYRM_COLORS.bodyLight], [13, 8, WYRM_COLORS.body], [14, 8, WYRM_COLORS.bodyDark],
  [4, 9, WYRM_COLORS.bodyDark], [5, 9, WYRM_COLORS.body], [6, 9, WYRM_COLORS.body], [7, 9, WYRM_COLORS.bodyLight], [8, 9, WYRM_COLORS.body], [9, 9, WYRM_COLORS.bodyLight], [10, 9, WYRM_COLORS.body], [11, 9, WYRM_COLORS.bodyLight], [12, 9, WYRM_COLORS.body], [13, 9, WYRM_COLORS.body], [14, 9, WYRM_COLORS.bodyDark],

  [5, 10, WYRM_COLORS.body], [6, 10, WYRM_COLORS.bodyLight], [7, 10, WYRM_COLORS.body], [8, 10, WYRM_COLORS.bodyLight], [9, 10, WYRM_COLORS.body], [10, 10, WYRM_COLORS.bodyLight], [11, 10, WYRM_COLORS.body], [12, 10, WYRM_COLORS.bodyLight], [13, 10, WYRM_COLORS.body],
  [6, 11, WYRM_COLORS.body], [7, 11, WYRM_COLORS.body], [8, 11, WYRM_COLORS.bodyLight], [9, 11, WYRM_COLORS.body], [10, 11, WYRM_COLORS.bodyLight], [11, 11, WYRM_COLORS.body], [12, 11, WYRM_COLORS.body],
  [7, 12, WYRM_COLORS.bodyDark], [8, 12, WYRM_COLORS.body], [9, 12, WYRM_COLORS.bodyLight], [10, 12, WYRM_COLORS.body], [11, 12, WYRM_COLORS.bodyDark],

  [8, 13, WYRM_COLORS.tail], [9, 13, WYRM_COLORS.tailLight], [10, 13, WYRM_COLORS.tail],
  [8, 14, WYRM_COLORS.tailDark], [9, 14, WYRM_COLORS.tail], [10, 14, WYRM_COLORS.tailDark],
  [9, 15, WYRM_COLORS.tail],

  [2, 5, WYRM_COLORS.wingDark], [3, 5, WYRM_COLORS.wing], [15, 5, WYRM_COLORS.wing], [16, 5, WYRM_COLORS.wingDark],
  [2, 6, WYRM_COLORS.wing], [3, 6, WYRM_COLORS.wingLight], [4, 6, WYRM_COLORS.wing], [14, 6, WYRM_COLORS.wing], [15, 6, WYRM_COLORS.wingLight], [16, 6, WYRM_COLORS.wing],
  [2, 7, WYRM_COLORS.wingDark], [3, 7, WYRM_COLORS.wing], [4, 7, WYRM_COLORS.wingLight], [14, 7, WYRM_COLORS.wingLight], [15, 7, WYRM_COLORS.wing], [16, 7, WYRM_COLORS.wingDark],
  [3, 8, WYRM_COLORS.wingDark], [4, 8, WYRM_COLORS.wing], [14, 8, WYRM_COLORS.wing], [15, 8, WYRM_COLORS.wingDark],
  [3, 9, WYRM_COLORS.wingDark], [4, 9, WYRM_COLORS.wingDark], [14, 9, WYRM_COLORS.wingDark], [15, 9, WYRM_COLORS.wingDark],

  [5, 11, WYRM_COLORS.clawDark], [6, 11, WYRM_COLORS.claw], [13, 11, WYRM_COLORS.claw], [14, 11, WYRM_COLORS.clawDark],
  [5, 12, WYRM_COLORS.claw], [6, 12, WYRM_COLORS.claw], [13, 12, WYRM_COLORS.claw], [14, 12, WYRM_COLORS.claw],
  [5, 13, WYRM_COLORS.clawDark], [6, 13, WYRM_COLORS.clawDark], [13, 13, WYRM_COLORS.clawDark], [14, 13, WYRM_COLORS.clawDark],
  [5, 14, WYRM_COLORS.claw], [6, 14, WYRM_COLORS.claw], [13, 14, WYRM_COLORS.claw], [14, 14, WYRM_COLORS.claw],
  [5, 15, WYRM_COLORS.clawDark], [6, 15, WYRM_COLORS.clawDark], [13, 15, WYRM_COLORS.clawDark], [14, 15, WYRM_COLORS.clawDark],

  [7, 13, WYRM_COLORS.clawDark], [8, 13, WYRM_COLORS.claw], [11, 13, WYRM_COLORS.claw], [12, 13, WYRM_COLORS.clawDark],
  [7, 14, WYRM_COLORS.claw], [8, 14, WYRM_COLORS.claw], [11, 14, WYRM_COLORS.claw], [12, 14, WYRM_COLORS.claw],
  [7, 15, WYRM_COLORS.clawDark], [8, 15, WYRM_COLORS.clawDark], [11, 15, WYRM_COLORS.clawDark], [12, 15, WYRM_COLORS.clawDark],

  [7, 7, WYRM_COLORS.rune], [12, 7, WYRM_COLORS.rune],
  [9, 8, WYRM_COLORS.magic], [10, 8, WYRM_COLORS.magicLight],
  [8, 9, WYRM_COLORS.magicLight], [11, 9, WYRM_COLORS.magic],
]

const WYRM_IDLE_FRAMES = [
  [
    { pixels: [
      [9, 12, WYRM_COLORS.belly], [10, 12, WYRM_COLORS.bellyLight],
      [7, 10, WYRM_COLORS.rune], [11, 10, WYRM_COLORS.rune],
    ] }
  ],
  [
    { pixels: [
      [9, 12, WYRM_COLORS.bellyLight], [10, 12, WYRM_COLORS.bellyLight],
      [7, 10, WYRM_COLORS.magic], [11, 10, WYRM_COLORS.magic],
      [8, 15, WYRM_COLORS.spark], [10, 15, WYRM_COLORS.spark],
    ] }
  ],
]

const WYRM_WALK_FRAMES = [
  [
    { pixels: [
      [4, 7, WYRM_COLORS.wingLight], [14, 7, WYRM_COLORS.wingLight],
      [9, 10, WYRM_COLORS.body], [10, 10, WYRM_COLORS.body],
    ] }
  ],
  [
    { pixels: [
      [3, 7, WYRM_COLORS.wing], [4, 7, WYRM_COLORS.wingLight], [14, 7, WYRM_COLORS.wingLight], [15, 7, WYRM_COLORS.wing],
      [9, 10, WYRM_COLORS.bodyLight], [10, 10, WYRM_COLORS.bodyLight],
    ] }
  ],
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