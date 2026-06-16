import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.003,
  WALK_SPEED: 0.08,
}

const BINDER_COLORS = {
  hood: '#2A1A3A',
  hoodDark: '#1A0A2A',
  hoodLight: '#3A2A4A',
  hoodGlow: '#5A3A6A',
  faceShadow: '#1A0A1A',
  eye: '#FF00FF',
  eyeGlow: '#FF66FF',
  eyeInner: '#FFFFFF',
  robe: '#2A1A2A',
  robeDark: '#1A0A1A',
  robeLight: '#3A2A3A',
  robePurple: '#4A2A4A',
  tatter: '#3A2A2A',
  tatterDark: '#2A1A1A',
  cross: '#8A8A8A',
  crossDark: '#5A5A5A',
  crossLight: '#AAAAAA',
  chain: '#6A6A6A',
  book: '#3A1A1A',
  bookDark: '#2A0A0A',
  bookLight: '#5A2A2A',
  bookGold: '#D4AF37',
  bookRune: '#FF00FF',
  bookRuneGlow: '#FF66FF',
  page: '#E8D8C8',
  pageDark: '#C8B8A8',
  pageRune: '#AA00AA',
  hand: '#8A6A6A',
  handDark: '#6A4A4A',
  darkness: '#4A0A4A',
  darknessGlow: '#8A2A8A',
  darkMist: '#3A1A3A',
  spark: '#FF00FF',
  boot: '#2A1A1A',
  bootDark: '#1A0A0A',
  bootLight: '#3A2A2A',
  rune: '#FF00FF',
  runeGlow: '#FF66FF',
  runeDark: '#AA00AA',
  highlight: '#FFFFFF',
}

const BINDER_AVATAR = [
  [4, 0, BINDER_COLORS.hoodDark], [5, 0, BINDER_COLORS.hood], [6, 0, BINDER_COLORS.hood], [7, 0, BINDER_COLORS.hood], [8, 0, BINDER_COLORS.hood], [9, 0, BINDER_COLORS.hood], [10, 0, BINDER_COLORS.hoodDark],
  [3, 1, BINDER_COLORS.hoodDark], [4, 1, BINDER_COLORS.hood], [5, 1, BINDER_COLORS.hoodLight], [6, 1, BINDER_COLORS.hood], [7, 1, BINDER_COLORS.hood], [8, 1, BINDER_COLORS.hoodLight], [9, 1, BINDER_COLORS.hood], [10, 1, BINDER_COLORS.hoodLight], [11, 1, BINDER_COLORS.hood], [12, 1, BINDER_COLORS.hoodDark],

  [3, 2, BINDER_COLORS.hoodDark], [4, 2, BINDER_COLORS.hood], [5, 2, BINDER_COLORS.hoodGlow], [6, 2, BINDER_COLORS.hood], [7, 2, BINDER_COLORS.hood], [8, 2, BINDER_COLORS.hood], [9, 2, BINDER_COLORS.hoodGlow], [10, 2, BINDER_COLORS.hood], [11, 2, BINDER_COLORS.hoodDark],
  [3, 3, BINDER_COLORS.hoodDark], [4, 3, BINDER_COLORS.hood], [5, 3, BINDER_COLORS.hoodLight], [6, 3, BINDER_COLORS.hood], [7, 3, BINDER_COLORS.hoodGlow], [8, 3, BINDER_COLORS.hoodGlow], [9, 3, BINDER_COLORS.hood], [10, 3, BINDER_COLORS.hoodLight], [11, 3, BINDER_COLORS.hood], [12, 3, BINDER_COLORS.hoodDark],

  [2, 4, BINDER_COLORS.hoodDark], [3, 4, BINDER_COLORS.hood], [4, 4, BINDER_COLORS.faceShadow], [5, 4, BINDER_COLORS.faceShadow], [6, 4, BINDER_COLORS.faceShadow], [7, 4, BINDER_COLORS.faceShadow], [8, 4, BINDER_COLORS.faceShadow], [9, 4, BINDER_COLORS.faceShadow], [10, 4, BINDER_COLORS.faceShadow], [11, 4, BINDER_COLORS.hood], [12, 4, BINDER_COLORS.hoodDark],
  [2, 5, BINDER_COLORS.hoodDark], [3, 5, BINDER_COLORS.hood], [4, 5, BINDER_COLORS.faceShadow], [5, 5, BINDER_COLORS.eye], [6, 5, BINDER_COLORS.eyeGlow], [7, 5, BINDER_COLORS.eyeGlow], [8, 5, BINDER_COLORS.eyeGlow], [9, 5, BINDER_COLORS.eyeGlow], [10, 5, BINDER_COLORS.eye], [11, 5, BINDER_COLORS.faceShadow], [12, 5, BINDER_COLORS.hood], [13, 5, BINDER_COLORS.hoodDark],

  [5, 4, BINDER_COLORS.highlight], [6, 4, BINDER_COLORS.highlight], [8, 4, BINDER_COLORS.highlight], [9, 4, BINDER_COLORS.highlight],
  [5, 5, BINDER_COLORS.highlight], [9, 5, BINDER_COLORS.highlight],

  [5, 5, BINDER_COLORS.eyeInner], [6, 5, BINDER_COLORS.eyeInner], [8, 5, BINDER_COLORS.eyeInner], [9, 5, BINDER_COLORS.eyeInner],

  [3, 6, BINDER_COLORS.hoodDark], [4, 6, BINDER_COLORS.faceShadow], [5, 6, BINDER_COLORS.faceShadow], [6, 6, BINDER_COLORS.faceShadow], [7, 6, BINDER_COLORS.faceShadow], [8, 6, BINDER_COLORS.faceShadow], [9, 6, BINDER_COLORS.faceShadow], [10, 6, BINDER_COLORS.faceShadow], [11, 6, BINDER_COLORS.hoodDark],
  [4, 7, BINDER_COLORS.faceShadow], [5, 7, BINDER_COLORS.faceShadow], [6, 7, BINDER_COLORS.faceShadow], [7, 7, BINDER_COLORS.faceShadow], [8, 7, BINDER_COLORS.faceShadow], [9, 7, BINDER_COLORS.faceShadow], [10, 7, BINDER_COLORS.faceShadow],

  [3, 8, BINDER_COLORS.hoodDark], [4, 8, BINDER_COLORS.hood], [5, 8, BINDER_COLORS.hoodLight], [6, 8, BINDER_COLORS.hood], [7, 8, BINDER_COLORS.hood], [8, 8, BINDER_COLORS.hood], [9, 8, BINDER_COLORS.hoodLight], [10, 8, BINDER_COLORS.hood], [11, 8, BINDER_COLORS.hoodDark],
  [4, 9, BINDER_COLORS.hood], [5, 9, BINDER_COLORS.hoodLight], [6, 9, BINDER_COLORS.hoodGlow], [7, 9, BINDER_COLORS.hoodGlow], [8, 9, BINDER_COLORS.hoodGlow], [9, 9, BINDER_COLORS.hoodGlow], [10, 9, BINDER_COLORS.hoodLight], [11, 9, BINDER_COLORS.hood],

  [5, 10, BINDER_COLORS.chain], [6, 10, BINDER_COLORS.chain], [7, 10, BINDER_COLORS.chain], [8, 10, BINDER_COLORS.chain], [9, 10, BINDER_COLORS.chain],
  [6, 11, BINDER_COLORS.cross], [7, 11, BINDER_COLORS.cross], [8, 11, BINDER_COLORS.cross],
  [5, 12, BINDER_COLORS.cross], [6, 12, BINDER_COLORS.crossDark], [7, 12, BINDER_COLORS.crossDark], [8, 12, BINDER_COLORS.crossDark], [9, 12, BINDER_COLORS.cross],
  [6, 13, BINDER_COLORS.crossLight], [7, 13, BINDER_COLORS.crossLight], [8, 13, BINDER_COLORS.crossLight],

  [3, 10, BINDER_COLORS.robeDark], [4, 10, BINDER_COLORS.robe], [5, 10, BINDER_COLORS.robeLight], [10, 10, BINDER_COLORS.robeLight], [11, 10, BINDER_COLORS.robe], [12, 10, BINDER_COLORS.robeDark],
  [2, 11, BINDER_COLORS.robeDark], [3, 11, BINDER_COLORS.robe], [4, 11, BINDER_COLORS.robeLight], [11, 11, BINDER_COLORS.robeLight], [12, 11, BINDER_COLORS.robe], [13, 11, BINDER_COLORS.robeDark],

  [5, 10, BINDER_COLORS.rune], [6, 10, BINDER_COLORS.runeGlow], [9, 10, BINDER_COLORS.runeGlow], [10, 10, BINDER_COLORS.rune],
  [6, 11, BINDER_COLORS.runeGlow], [9, 11, BINDER_COLORS.runeGlow],
  [5, 11, BINDER_COLORS.darknessGlow], [10, 11, BINDER_COLORS.darknessGlow],

  [4, 14, BINDER_COLORS.hoodDark], [5, 14, BINDER_COLORS.hood], [6, 14, BINDER_COLORS.hoodLight], [7, 14, BINDER_COLORS.hoodLight], [8, 14, BINDER_COLORS.hoodLight], [9, 14, BINDER_COLORS.hood], [10, 14, BINDER_COLORS.hoodDark],
  [5, 15, BINDER_COLORS.hoodDark], [6, 15, BINDER_COLORS.hood], [7, 15, BINDER_COLORS.hood], [8, 15, BINDER_COLORS.hood], [9, 15, BINDER_COLORS.hoodDark],
]

const BINDER_FACE_DOWN = [
  [7, 0, BINDER_COLORS.hoodDark], [8, 0, BINDER_COLORS.hood], [9, 0, BINDER_COLORS.hood], [10, 0, BINDER_COLORS.hoodDark],
  [6, 1, BINDER_COLORS.hood], [7, 1, BINDER_COLORS.hoodLight], [8, 1, BINDER_COLORS.hood], [9, 1, BINDER_COLORS.hood], [10, 1, BINDER_COLORS.hoodLight], [11, 1, BINDER_COLORS.hood],
  [5, 2, BINDER_COLORS.hoodDark], [6, 2, BINDER_COLORS.hood], [7, 2, BINDER_COLORS.hoodGlow], [8, 2, BINDER_COLORS.faceShadow], [9, 2, BINDER_COLORS.faceShadow], [10, 2, BINDER_COLORS.hoodGlow], [11, 2, BINDER_COLORS.hood], [12, 2, BINDER_COLORS.hoodDark],

  [6, 3, BINDER_COLORS.hood], [7, 3, BINDER_COLORS.faceShadow], [8, 3, BINDER_COLORS.eye], [9, 3, BINDER_COLORS.eye], [10, 3, BINDER_COLORS.faceShadow], [11, 3, BINDER_COLORS.hood],
  [6, 4, BINDER_COLORS.hoodDark], [7, 4, BINDER_COLORS.faceShadow], [8, 4, BINDER_COLORS.eyeGlow], [9, 4, BINDER_COLORS.eyeGlow], [10, 4, BINDER_COLORS.faceShadow], [11, 4, BINDER_COLORS.hoodDark],
  [7, 5, BINDER_COLORS.eyeInner], [8, 5, BINDER_COLORS.faceShadow], [9, 5, BINDER_COLORS.faceShadow], [10, 5, BINDER_COLORS.eyeInner],
  [6, 6, BINDER_COLORS.hood], [7, 6, BINDER_COLORS.faceShadow], [8, 6, BINDER_COLORS.faceShadow], [9, 6, BINDER_COLORS.faceShadow], [10, 6, BINDER_COLORS.faceShadow], [11, 6, BINDER_COLORS.hood],

  [8, 7, BINDER_COLORS.chain], [9, 7, BINDER_COLORS.chain],
  [8, 8, BINDER_COLORS.cross], [9, 8, BINDER_COLORS.cross],
  [7, 9, BINDER_COLORS.cross], [8, 9, BINDER_COLORS.crossDark], [9, 9, BINDER_COLORS.crossDark], [10, 9, BINDER_COLORS.cross],

  [5, 6, BINDER_COLORS.robeDark], [6, 6, BINDER_COLORS.robe], [7, 6, BINDER_COLORS.robeLight], [11, 6, BINDER_COLORS.robeLight], [12, 6, BINDER_COLORS.robe], [13, 6, BINDER_COLORS.robeDark],
  [4, 7, BINDER_COLORS.robeDark], [5, 7, BINDER_COLORS.robe], [6, 7, BINDER_COLORS.robeLight], [7, 7, BINDER_COLORS.robe], [8, 7, BINDER_COLORS.robePurple], [9, 7, BINDER_COLORS.robePurple], [10, 7, BINDER_COLORS.robe], [11, 7, BINDER_COLORS.robeLight], [12, 7, BINDER_COLORS.robe], [13, 7, BINDER_COLORS.robeDark], [14, 7, BINDER_COLORS.robeDark],
  [4, 8, BINDER_COLORS.robeDark], [5, 8, BINDER_COLORS.robe], [6, 8, BINDER_COLORS.robeLight], [7, 8, BINDER_COLORS.robe], [8, 8, BINDER_COLORS.rune], [9, 8, BINDER_COLORS.rune], [10, 8, BINDER_COLORS.robe], [11, 8, BINDER_COLORS.robeLight], [12, 8, BINDER_COLORS.robe], [13, 8, BINDER_COLORS.robeDark], [14, 8, BINDER_COLORS.robeDark],
  [4, 9, BINDER_COLORS.robeDark], [5, 9, BINDER_COLORS.robe], [6, 9, BINDER_COLORS.robe], [7, 9, BINDER_COLORS.robeLight], [8, 9, BINDER_COLORS.robe], [9, 9, BINDER_COLORS.robe], [10, 9, BINDER_COLORS.robeLight], [11, 9, BINDER_COLORS.robe], [12, 9, BINDER_COLORS.robe], [13, 9, BINDER_COLORS.robeDark], [14, 9, BINDER_COLORS.robeDark],

  [5, 10, BINDER_COLORS.robe], [6, 10, BINDER_COLORS.robeDark], [7, 10, BINDER_COLORS.robe], [8, 10, BINDER_COLORS.runeGlow], [9, 10, BINDER_COLORS.runeGlow], [10, 10, BINDER_COLORS.robe], [11, 10, BINDER_COLORS.robeDark], [12, 10, BINDER_COLORS.robe],
  [5, 11, BINDER_COLORS.robeDark], [6, 11, BINDER_COLORS.robe], [7, 11, BINDER_COLORS.robeLight], [8, 11, BINDER_COLORS.robe], [9, 11, BINDER_COLORS.robe], [10, 11, BINDER_COLORS.robeLight], [11, 11, BINDER_COLORS.robe], [12, 11, BINDER_COLORS.robeDark],
  [6, 12, BINDER_COLORS.robe], [7, 12, BINDER_COLORS.robeDark], [8, 12, BINDER_COLORS.robe], [9, 12, BINDER_COLORS.robe], [10, 12, BINDER_COLORS.robe], [11, 12, BINDER_COLORS.robeDark], [12, 12, BINDER_COLORS.robe],

  [7, 13, BINDER_COLORS.boot], [8, 13, BINDER_COLORS.bootLight], [9, 13, BINDER_COLORS.bootLight], [10, 13, BINDER_COLORS.boot],
  [7, 14, BINDER_COLORS.bootDark], [8, 14, BINDER_COLORS.boot], [9, 14, BINDER_COLORS.boot], [10, 14, BINDER_COLORS.bootDark],
  [7, 15, BINDER_COLORS.boot], [8, 15, BINDER_COLORS.bootLight], [9, 15, BINDER_COLORS.bootLight], [10, 15, BINDER_COLORS.boot],

  [2, 7, BINDER_COLORS.hand], [3, 7, BINDER_COLORS.handDark],
  [2, 8, BINDER_COLORS.hand], [3, 8, BINDER_COLORS.hand],
  [2, 9, BINDER_COLORS.handDark], [3, 9, BINDER_COLORS.hand],

  [2, 10, BINDER_COLORS.book], [3, 10, BINDER_COLORS.bookGold], [4, 10, BINDER_COLORS.bookDark],
  [2, 11, BINDER_COLORS.page], [3, 11, BINDER_COLORS.pageRune], [4, 11, BINDER_COLORS.page],
  [2, 12, BINDER_COLORS.book], [3, 12, BINDER_COLORS.bookRune], [4, 12, BINDER_COLORS.book],
  [2, 13, BINDER_COLORS.bookDark], [3, 13, BINDER_COLORS.bookGold], [4, 13, BINDER_COLORS.bookDark],

  [14, 7, BINDER_COLORS.hand], [15, 7, BINDER_COLORS.handDark],
  [14, 8, BINDER_COLORS.hand], [15, 8, BINDER_COLORS.hand],
  [14, 9, BINDER_COLORS.handDark], [15, 9, BINDER_COLORS.hand],
  [15, 10, BINDER_COLORS.runeGlow],
  [15, 11, BINDER_COLORS.rune],

  [6, 15, BINDER_COLORS.darkMist], [11, 15, BINDER_COLORS.darkMist],
  [7, 15, BINDER_COLORS.darknessGlow], [10, 15, BINDER_COLORS.darknessGlow],
]

const BINDER_FACE_UP = [
  [7, 0, BINDER_COLORS.hoodDark], [8, 0, BINDER_COLORS.hood], [9, 0, BINDER_COLORS.hood], [10, 0, BINDER_COLORS.hoodDark],
  [6, 1, BINDER_COLORS.hood], [7, 1, BINDER_COLORS.hoodLight], [8, 1, BINDER_COLORS.hood], [9, 1, BINDER_COLORS.hood], [10, 1, BINDER_COLORS.hoodLight], [11, 1, BINDER_COLORS.hood],
  [5, 2, BINDER_COLORS.hoodDark], [6, 2, BINDER_COLORS.hood], [7, 2, BINDER_COLORS.hood], [8, 2, BINDER_COLORS.hoodGlow], [9, 2, BINDER_COLORS.hoodGlow], [10, 2, BINDER_COLORS.hood], [11, 2, BINDER_COLORS.hood], [12, 2, BINDER_COLORS.hoodDark],

  [6, 3, BINDER_COLORS.hood], [7, 3, BINDER_COLORS.hoodLight], [8, 3, BINDER_COLORS.hood], [9, 3, BINDER_COLORS.hood], [10, 3, BINDER_COLORS.hoodLight], [11, 3, BINDER_COLORS.hood],
  [6, 4, BINDER_COLORS.hoodDark], [7, 4, BINDER_COLORS.hood], [8, 4, BINDER_COLORS.hoodLight], [9, 4, BINDER_COLORS.hoodLight], [10, 4, BINDER_COLORS.hood], [11, 4, BINDER_COLORS.hoodDark],
  [7, 5, BINDER_COLORS.hood], [8, 5, BINDER_COLORS.hoodDark], [9, 5, BINDER_COLORS.hoodDark], [10, 5, BINDER_COLORS.hood],

  [4, 6, BINDER_COLORS.robeDark], [5, 6, BINDER_COLORS.robe], [6, 6, BINDER_COLORS.robeLight], [7, 6, BINDER_COLORS.robe], [8, 6, BINDER_COLORS.rune], [9, 6, BINDER_COLORS.rune], [10, 6, BINDER_COLORS.robe], [11, 6, BINDER_COLORS.robeLight], [12, 6, BINDER_COLORS.robe], [13, 6, BINDER_COLORS.robeDark], [14, 6, BINDER_COLORS.robeDark],
  [4, 7, BINDER_COLORS.robeDark], [5, 7, BINDER_COLORS.robe], [6, 7, BINDER_COLORS.robe], [7, 7, BINDER_COLORS.robeLight], [8, 7, BINDER_COLORS.runeGlow], [9, 7, BINDER_COLORS.runeGlow], [10, 7, BINDER_COLORS.robeLight], [11, 7, BINDER_COLORS.robe], [12, 7, BINDER_COLORS.robe], [13, 7, BINDER_COLORS.robeDark], [14, 7, BINDER_COLORS.robeDark],
  [4, 8, BINDER_COLORS.robeDark], [5, 8, BINDER_COLORS.robe], [6, 8, BINDER_COLORS.robeLight], [7, 8, BINDER_COLORS.robe], [8, 8, BINDER_COLORS.robe], [9, 8, BINDER_COLORS.robe], [10, 8, BINDER_COLORS.robe], [11, 8, BINDER_COLORS.robeLight], [12, 8, BINDER_COLORS.robe], [13, 8, BINDER_COLORS.robeDark], [14, 8, BINDER_COLORS.robeDark],
  [5, 9, BINDER_COLORS.robe], [6, 9, BINDER_COLORS.robeDark], [7, 9, BINDER_COLORS.robe], [8, 9, BINDER_COLORS.robeLight], [9, 9, BINDER_COLORS.robeLight], [10, 9, BINDER_COLORS.robe], [11, 9, BINDER_COLORS.robeDark], [12, 9, BINDER_COLORS.robe],

  [5, 10, BINDER_COLORS.robeDark], [6, 10, BINDER_COLORS.robe], [7, 10, BINDER_COLORS.robeLight], [8, 10, BINDER_COLORS.robe], [9, 10, BINDER_COLORS.robe], [10, 10, BINDER_COLORS.robeLight], [11, 10, BINDER_COLORS.robe], [12, 10, BINDER_COLORS.robeDark],
  [6, 11, BINDER_COLORS.robe], [7, 11, BINDER_COLORS.robeDark], [8, 11, BINDER_COLORS.robe], [9, 11, BINDER_COLORS.robe], [10, 11, BINDER_COLORS.robe], [11, 11, BINDER_COLORS.robeDark], [12, 11, BINDER_COLORS.robe],
  [7, 12, BINDER_COLORS.robeDark], [8, 12, BINDER_COLORS.robe], [9, 12, BINDER_COLORS.robe], [10, 12, BINDER_COLORS.robe], [11, 12, BINDER_COLORS.robeDark],

  [7, 13, BINDER_COLORS.boot], [8, 13, BINDER_COLORS.bootLight], [9, 13, BINDER_COLORS.bootLight], [10, 13, BINDER_COLORS.boot],
  [7, 14, BINDER_COLORS.bootDark], [8, 14, BINDER_COLORS.boot], [9, 14, BINDER_COLORS.boot], [10, 14, BINDER_COLORS.bootDark],
  [7, 15, BINDER_COLORS.boot], [8, 15, BINDER_COLORS.bootLight], [9, 15, BINDER_COLORS.bootLight], [10, 15, BINDER_COLORS.boot],

  [15, 6, BINDER_COLORS.book],
  [15, 7, BINDER_COLORS.bookDark],
  [15, 8, BINDER_COLORS.bookGold],
  [15, 9, BINDER_COLORS.book],
  [15, 10, BINDER_COLORS.bookRune],

  [4, 5, BINDER_COLORS.robeDark], [3, 5, BINDER_COLORS.robe],
  [4, 6, BINDER_COLORS.robe], [3, 6, BINDER_COLORS.robeDark],

  [13, 5, BINDER_COLORS.robeDark], [14, 5, BINDER_COLORS.robe],
  [13, 6, BINDER_COLORS.robe], [14, 6, BINDER_COLORS.robeDark],

  [7, 15, BINDER_COLORS.darkMist], [10, 15, BINDER_COLORS.darkMist],
]

const BINDER_FACE_LEFT = [
  [6, 0, BINDER_COLORS.hood], [7, 0, BINDER_COLORS.hoodDark],
  [5, 1, BINDER_COLORS.hoodLight], [6, 1, BINDER_COLORS.hood], [7, 1, BINDER_COLORS.hood], [8, 1, BINDER_COLORS.hoodDark],
  [5, 2, BINDER_COLORS.hood], [6, 2, BINDER_COLORS.hoodGlow], [7, 2, BINDER_COLORS.faceShadow], [8, 2, BINDER_COLORS.hood],
  [5, 3, BINDER_COLORS.hoodDark], [6, 3, BINDER_COLORS.faceShadow], [7, 3, BINDER_COLORS.eye], [8, 3, BINDER_COLORS.hood],

  [5, 4, BINDER_COLORS.hood], [6, 4, BINDER_COLORS.eyeGlow], [7, 4, BINDER_COLORS.eyeInner], [8, 4, BINDER_COLORS.hood],
  [5, 5, BINDER_COLORS.hoodDark], [6, 5, BINDER_COLORS.faceShadow], [7, 5, BINDER_COLORS.faceShadow], [8, 5, BINDER_COLORS.hoodDark],

  [4, 5, BINDER_COLORS.robeDark], [5, 5, BINDER_COLORS.robe], [6, 5, BINDER_COLORS.robeLight], [7, 5, BINDER_COLORS.robe], [8, 5, BINDER_COLORS.robeDark],
  [4, 6, BINDER_COLORS.robeDark], [5, 6, BINDER_COLORS.robe], [6, 6, BINDER_COLORS.rune], [7, 6, BINDER_COLORS.robe], [8, 6, BINDER_COLORS.robeLight], [9, 6, BINDER_COLORS.robe], [10, 6, BINDER_COLORS.robeDark],
  [4, 7, BINDER_COLORS.robeDark], [5, 7, BINDER_COLORS.robe], [6, 7, BINDER_COLORS.runeGlow], [7, 7, BINDER_COLORS.robe], [8, 7, BINDER_COLORS.robeLight], [9, 7, BINDER_COLORS.robe], [10, 7, BINDER_COLORS.robeDark],
  [4, 8, BINDER_COLORS.robeDark], [5, 8, BINDER_COLORS.robe], [6, 8, BINDER_COLORS.robeLight], [7, 8, BINDER_COLORS.robe], [8, 8, BINDER_COLORS.robe], [9, 8, BINDER_COLORS.robeLight], [10, 8, BINDER_COLORS.robe], [11, 8, BINDER_COLORS.robeDark],

  [5, 9, BINDER_COLORS.robe], [6, 9, BINDER_COLORS.robeDark], [7, 9, BINDER_COLORS.robe], [8, 9, BINDER_COLORS.robe], [9, 9, BINDER_COLORS.robeDark], [10, 9, BINDER_COLORS.robe],
  [6, 10, BINDER_COLORS.robeDark], [7, 10, BINDER_COLORS.robe], [8, 10, BINDER_COLORS.robe], [9, 10, BINDER_COLORS.robe], [10, 10, BINDER_COLORS.robeDark],
  [7, 11, BINDER_COLORS.robe], [8, 11, BINDER_COLORS.robeDark], [9, 11, BINDER_COLORS.robe],

  [7, 12, BINDER_COLORS.boot], [8, 12, BINDER_COLORS.bootLight], [9, 12, BINDER_COLORS.boot],
  [7, 13, BINDER_COLORS.bootDark], [8, 13, BINDER_COLORS.boot], [9, 13, BINDER_COLORS.bootDark],
  [7, 14, BINDER_COLORS.boot], [8, 14, BINDER_COLORS.bootLight], [9, 14, BINDER_COLORS.boot],
  [7, 15, BINDER_COLORS.boot], [8, 15, BINDER_COLORS.bootLight], [9, 15, BINDER_COLORS.boot],

  [2, 5, BINDER_COLORS.hand],
  [2, 6, BINDER_COLORS.handDark],
  [2, 7, BINDER_COLORS.hand], [3, 7, BINDER_COLORS.book],
  [2, 8, BINDER_COLORS.hand], [3, 8, BINDER_COLORS.page], [4, 8, BINDER_COLORS.pageRune],
  [3, 9, BINDER_COLORS.bookDark], [4, 9, BINDER_COLORS.bookRune],
  [3, 10, BINDER_COLORS.bookGold],

  [10, 6, BINDER_COLORS.hand], [11, 6, BINDER_COLORS.handDark],
  [10, 7, BINDER_COLORS.hand], [11, 7, BINDER_COLORS.hand],
  [11, 8, BINDER_COLORS.runeGlow],
  [11, 9, BINDER_COLORS.rune],

  [7, 15, BINDER_COLORS.darkMist],
  [8, 15, BINDER_COLORS.darknessGlow],
]

const BINDER_FACE_RIGHT = [
  [7, 0, BINDER_COLORS.hoodDark], [8, 0, BINDER_COLORS.hood],
  [6, 1, BINDER_COLORS.hoodDark], [7, 1, BINDER_COLORS.hood], [8, 1, BINDER_COLORS.hood], [9, 1, BINDER_COLORS.hoodLight],
  [6, 2, BINDER_COLORS.hood], [7, 2, BINDER_COLORS.faceShadow], [8, 2, BINDER_COLORS.hoodGlow], [9, 2, BINDER_COLORS.hood],
  [6, 3, BINDER_COLORS.hood], [7, 3, BINDER_COLORS.eye], [8, 3, BINDER_COLORS.faceShadow], [9, 3, BINDER_COLORS.hoodDark],

  [6, 4, BINDER_COLORS.hood], [7, 4, BINDER_COLORS.eyeInner], [8, 4, BINDER_COLORS.eyeGlow], [9, 4, BINDER_COLORS.hood],
  [6, 5, BINDER_COLORS.hoodDark], [7, 5, BINDER_COLORS.faceShadow], [8, 5, BINDER_COLORS.faceShadow], [9, 5, BINDER_COLORS.hoodDark],

  [6, 5, BINDER_COLORS.robeDark], [7, 5, BINDER_COLORS.robe], [8, 5, BINDER_COLORS.robeLight], [9, 5, BINDER_COLORS.robe], [10, 5, BINDER_COLORS.robeDark],
  [6, 6, BINDER_COLORS.robeDark], [7, 6, BINDER_COLORS.robe], [8, 6, BINDER_COLORS.robeLight], [9, 6, BINDER_COLORS.robe], [10, 6, BINDER_COLORS.rune], [11, 6, BINDER_COLORS.robe], [12, 6, BINDER_COLORS.robeDark],
  [6, 7, BINDER_COLORS.robeDark], [7, 7, BINDER_COLORS.robe], [8, 7, BINDER_COLORS.robeLight], [9, 7, BINDER_COLORS.robe], [10, 7, BINDER_COLORS.runeGlow], [11, 7, BINDER_COLORS.robe], [12, 7, BINDER_COLORS.robeDark],
  [7, 8, BINDER_COLORS.robeDark], [8, 8, BINDER_COLORS.robe], [9, 8, BINDER_COLORS.robeLight], [10, 8, BINDER_COLORS.robe], [11, 8, BINDER_COLORS.robe], [12, 8, BINDER_COLORS.robeLight], [13, 8, BINDER_COLORS.robe], [14, 8, BINDER_COLORS.robeDark],

  [6, 9, BINDER_COLORS.robe], [7, 9, BINDER_COLORS.robeDark], [8, 9, BINDER_COLORS.robe], [9, 9, BINDER_COLORS.robe], [10, 9, BINDER_COLORS.robeDark], [11, 9, BINDER_COLORS.robe],
  [7, 10, BINDER_COLORS.robeDark], [8, 10, BINDER_COLORS.robe], [9, 10, BINDER_COLORS.robe], [10, 10, BINDER_COLORS.robe], [11, 10, BINDER_COLORS.robeDark],
  [8, 11, BINDER_COLORS.robe], [9, 11, BINDER_COLORS.robeDark], [10, 11, BINDER_COLORS.robe],

  [8, 12, BINDER_COLORS.boot], [9, 12, BINDER_COLORS.bootLight], [10, 12, BINDER_COLORS.boot],
  [8, 13, BINDER_COLORS.bootDark], [9, 13, BINDER_COLORS.boot], [10, 13, BINDER_COLORS.bootDark],
  [8, 14, BINDER_COLORS.boot], [9, 14, BINDER_COLORS.bootLight], [10, 14, BINDER_COLORS.boot],
  [8, 15, BINDER_COLORS.boot], [9, 15, BINDER_COLORS.bootLight], [10, 15, BINDER_COLORS.boot],

  [6, 6, BINDER_COLORS.hand], [5, 6, BINDER_COLORS.handDark],
  [6, 7, BINDER_COLORS.hand], [5, 7, BINDER_COLORS.hand],
  [5, 8, BINDER_COLORS.runeGlow],
  [5, 9, BINDER_COLORS.rune],

  [12, 5, BINDER_COLORS.hand],
  [12, 6, BINDER_COLORS.handDark],
  [12, 7, BINDER_COLORS.hand], [13, 7, BINDER_COLORS.book],
  [12, 8, BINDER_COLORS.hand], [13, 8, BINDER_COLORS.page], [14, 8, BINDER_COLORS.pageRune],
  [13, 9, BINDER_COLORS.bookDark], [14, 9, BINDER_COLORS.bookRune],
  [13, 10, BINDER_COLORS.bookGold],

  [9, 15, BINDER_COLORS.darkMist],
  [10, 15, BINDER_COLORS.darknessGlow],
]

const BINDER_IDLE_FRAMES = [
  [
    { pixels: [
      [8, 3, BINDER_COLORS.eye], [9, 3, BINDER_COLORS.eye],
      [8, 10, BINDER_COLORS.rune], [9, 10, BINDER_COLORS.rune],
      [3, 11, BINDER_COLORS.page], [4, 11, BINDER_COLORS.pageRune],
      [7, 15, BINDER_COLORS.darkMist], [10, 15, BINDER_COLORS.darkMist],
    ] }
  ],
  [
    { pixels: [
      [8, 3, BINDER_COLORS.eyeGlow], [9, 3, BINDER_COLORS.eyeGlow],
      [8, 10, BINDER_COLORS.runeGlow], [9, 10, BINDER_COLORS.runeGlow],
      [3, 11, BINDER_COLORS.pageDark], [4, 11, BINDER_COLORS.bookRune],
      [7, 15, BINDER_COLORS.darknessGlow], [10, 15, BINDER_COLORS.darknessGlow],
      [8, 15, BINDER_COLORS.spark], [9, 15, BINDER_COLORS.spark],
    ] }
  ],
]

const BINDER_WALK_FRAMES = [
  [
    { pixels: [
      [7, 15, BINDER_COLORS.bootDark], [8, 15, BINDER_COLORS.boot], [9, 15, BINDER_COLORS.boot], [10, 15, BINDER_COLORS.bootDark],
    ] }
  ],
  [
    { pixels: [
      [7, 15, BINDER_COLORS.boot], [8, 15, BINDER_COLORS.bootDark], [9, 15, BINDER_COLORS.bootDark], [10, 15, BINDER_COLORS.boot],
    ] }
  ],
  [
    { pixels: [
      [7, 15, BINDER_COLORS.boot], [8, 15, BINDER_COLORS.boot], [9, 15, BINDER_COLORS.boot], [10, 15, BINDER_COLORS.bootDark],
    ] }
  ],
]

export const drawDarknessBinder = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: BINDER_FACE_DOWN,
  up: BINDER_FACE_UP,
  left: BINDER_FACE_LEFT,
  right: BINDER_FACE_RIGHT,
  walk: BINDER_WALK_FRAMES,
  idle: BINDER_IDLE_FRAMES,
})

export const drawDarknessBinderAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, BINDER_AVATAR)