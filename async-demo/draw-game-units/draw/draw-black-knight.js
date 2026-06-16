import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.003,
  WALK_SPEED: 0.1,
}

const KNIGHT_COLORS = {
  helm: '#2A2A3A',
  helmDark: '#1A1A2A',
  helmLight: '#3A3A4A',
  helmCrack: '#0A0A1A',
  eye: '#FF2222',
  eyeGlow: '#FF4444',
  eyeInner: '#FF8888',
  armor: '#3A3A4A',
  armorDark: '#2A2A3A',
  armorLight: '#4A4A5A',
  armorPlate: '#4A4A5A',
  armorPlateLight: '#5A5A6A',
  armorCrack: '#1A1A2A',
  corruption: '#6600CC',
  corruptionGlow: '#9933FF',
  corruptionDark: '#440099',
  corruptionLight: '#BB66FF',
  rune: '#8800FF',
  runeGlow: '#AA44FF',
  runeDark: '#5500AA',
  cape: '#1A0A1A',
  capeDark: '#0A000A',
  capeLight: '#2A1A2A',
  capeCorrupt: '#330066',
  sword: '#6A6A7A',
  swordDark: '#4A4A5A',
  swordLight: '#8A8A9A',
  swordCorrupt: '#9933FF',
  swordHandle: '#4A3A2A',
  swordGuard: '#8A7A3A',
  shield: '#3A3A4A',
  shieldDark: '#2A2A3A',
  shieldLight: '#4A4A5A',
  shieldCorrupt: '#6600CC',
  gauntlet: '#4A4A5A',
  gauntletDark: '#3A3A4A',
  gauntletLight: '#5A5A6A',
  belt: '#3A3A4A',
  beltLight: '#4A4A5A',
  boot: '#2A2A3A',
  bootDark: '#1A1A2A',
  bootLight: '#3A3A4A',
  darkEnergy: '#6600CC',
  darkEnergyGlow: '#9933FF',
  spark: '#BB66FF',
  sparkWhite: '#FFFFFF',
  crack: '#1A0A2A',
  crackGlow: '#8800FF',
  highlight: '#FFFFFF',
}

const KNIGHT_AVATAR = [
  [5, 0, KNIGHT_COLORS.helmDark], [6, 0, KNIGHT_COLORS.helm], [7, 0, KNIGHT_COLORS.helmLight], [8, 0, KNIGHT_COLORS.helmLight], [9, 0, KNIGHT_COLORS.helm], [10, 0, KNIGHT_COLORS.helmDark],
  [4, 1, KNIGHT_COLORS.helm], [5, 1, KNIGHT_COLORS.helmLight], [6, 1, KNIGHT_COLORS.helm], [7, 1, KNIGHT_COLORS.corruption], [8, 1, KNIGHT_COLORS.corruption], [9, 1, KNIGHT_COLORS.helm], [10, 1, KNIGHT_COLORS.helmLight], [11, 1, KNIGHT_COLORS.helm],
  [4, 2, KNIGHT_COLORS.helmDark], [5, 2, KNIGHT_COLORS.helm], [6, 2, KNIGHT_COLORS.helmLight], [7, 2, KNIGHT_COLORS.helmLight], [8, 2, KNIGHT_COLORS.corruption], [9, 2, KNIGHT_COLORS.corruption], [10, 2, KNIGHT_COLORS.helmLight], [11, 2, KNIGHT_COLORS.helm], [12, 2, KNIGHT_COLORS.helmDark],

  [3, 3, KNIGHT_COLORS.helmDark], [4, 3, KNIGHT_COLORS.helm], [5, 3, KNIGHT_COLORS.helmLight], [6, 3, KNIGHT_COLORS.helm], [7, 3, KNIGHT_COLORS.corruptionGlow], [8, 3, KNIGHT_COLORS.corruptionGlow], [9, 3, KNIGHT_COLORS.helm], [10, 3, KNIGHT_COLORS.helmLight], [11, 3, KNIGHT_COLORS.helm], [12, 3, KNIGHT_COLORS.helmDark],
  [3, 4, KNIGHT_COLORS.helmDark], [4, 4, KNIGHT_COLORS.helm], [5, 4, KNIGHT_COLORS.helmLight], [6, 4, KNIGHT_COLORS.helm], [7, 4, KNIGHT_COLORS.corruption], [8, 4, KNIGHT_COLORS.corruption], [9, 4, KNIGHT_COLORS.helm], [10, 4, KNIGHT_COLORS.helmLight], [11, 4, KNIGHT_COLORS.helm], [12, 4, KNIGHT_COLORS.helmDark],

  [3, 5, KNIGHT_COLORS.helmDark], [4, 5, KNIGHT_COLORS.helm], [5, 5, KNIGHT_COLORS.eye], [6, 5, KNIGHT_COLORS.eyeGlow], [7, 5, KNIGHT_COLORS.corruption], [8, 5, KNIGHT_COLORS.corruption], [9, 5, KNIGHT_COLORS.eyeGlow], [10, 5, KNIGHT_COLORS.eye], [11, 5, KNIGHT_COLORS.helm], [12, 5, KNIGHT_COLORS.helmDark],
  [5, 4, KNIGHT_COLORS.highlight], [6, 4, KNIGHT_COLORS.highlight], [9, 4, KNIGHT_COLORS.highlight], [10, 4, KNIGHT_COLORS.highlight],
  [5, 5, KNIGHT_COLORS.highlight], [9, 5, KNIGHT_COLORS.highlight],

  [5, 5, KNIGHT_COLORS.eyeGlow], [6, 5, KNIGHT_COLORS.eyeGlow], [9, 5, KNIGHT_COLORS.eyeGlow], [10, 5, KNIGHT_COLORS.eyeGlow],
  [5, 6, KNIGHT_COLORS.eyeInner], [6, 6, KNIGHT_COLORS.eyeInner], [9, 6, KNIGHT_COLORS.eyeInner], [10, 6, KNIGHT_COLORS.eyeInner],

  [3, 6, KNIGHT_COLORS.helmDark], [4, 6, KNIGHT_COLORS.helm], [5, 6, KNIGHT_COLORS.corruptionGlow], [6, 6, KNIGHT_COLORS.eyeGlow], [7, 6, KNIGHT_COLORS.corruption], [8, 6, KNIGHT_COLORS.corruption], [9, 6, KNIGHT_COLORS.eyeGlow], [10, 6, KNIGHT_COLORS.corruptionGlow], [11, 6, KNIGHT_COLORS.helm], [12, 6, KNIGHT_COLORS.helmDark],
  [3, 7, KNIGHT_COLORS.helmDark], [4, 7, KNIGHT_COLORS.helm], [5, 7, KNIGHT_COLORS.corruption], [6, 7, KNIGHT_COLORS.corruptionDark], [7, 7, KNIGHT_COLORS.corruption], [8, 7, KNIGHT_COLORS.corruptionDark], [9, 7, KNIGHT_COLORS.corruption], [10, 7, KNIGHT_COLORS.corruption], [11, 7, KNIGHT_COLORS.helm], [12, 7, KNIGHT_COLORS.helmDark],

  [4, 8, KNIGHT_COLORS.helmDark], [5, 8, KNIGHT_COLORS.crackGlow], [6, 8, KNIGHT_COLORS.crack], [7, 8, KNIGHT_COLORS.corruption], [8, 8, KNIGHT_COLORS.corruption], [9, 8, KNIGHT_COLORS.crack], [10, 8, KNIGHT_COLORS.crackGlow], [11, 8, KNIGHT_COLORS.helmDark],
  [5, 9, KNIGHT_COLORS.crack], [6, 9, KNIGHT_COLORS.corruptionGlow], [7, 9, KNIGHT_COLORS.corruptionDark], [8, 9, KNIGHT_COLORS.corruptionDark], [9, 9, KNIGHT_COLORS.corruptionGlow], [10, 9, KNIGHT_COLORS.crack],

  [4, 10, KNIGHT_COLORS.helmDark], [5, 10, KNIGHT_COLORS.helm], [6, 10, KNIGHT_COLORS.corruption], [7, 10, KNIGHT_COLORS.corruptionDark], [8, 10, KNIGHT_COLORS.corruptionDark], [9, 10, KNIGHT_COLORS.corruption], [10, 10, KNIGHT_COLORS.helm], [11, 10, KNIGHT_COLORS.helmDark],
  [5, 11, KNIGHT_COLORS.helm], [6, 11, KNIGHT_COLORS.helmLight], [7, 11, KNIGHT_COLORS.corruption], [8, 11, KNIGHT_COLORS.corruption], [9, 11, KNIGHT_COLORS.helmLight], [10, 11, KNIGHT_COLORS.helm],
  [5, 12, KNIGHT_COLORS.helmDark], [6, 12, KNIGHT_COLORS.helm], [7, 12, KNIGHT_COLORS.corruptionGlow], [8, 12, KNIGHT_COLORS.corruptionGlow], [9, 12, KNIGHT_COLORS.helm], [10, 12, KNIGHT_COLORS.helmDark],

  [3, 13, KNIGHT_COLORS.armorDark], [4, 13, KNIGHT_COLORS.armor], [5, 13, KNIGHT_COLORS.armorPlateLight], [6, 13, KNIGHT_COLORS.corruption], [7, 13, KNIGHT_COLORS.corruptionGlow], [8, 13, KNIGHT_COLORS.corruptionGlow], [9, 13, KNIGHT_COLORS.corruption], [10, 13, KNIGHT_COLORS.armorPlateLight], [11, 13, KNIGHT_COLORS.armor], [12, 13, KNIGHT_COLORS.armorDark],
  [4, 14, KNIGHT_COLORS.armorDark], [5, 14, KNIGHT_COLORS.armorPlate], [6, 14, KNIGHT_COLORS.corruptionDark], [7, 14, KNIGHT_COLORS.corruption], [8, 14, KNIGHT_COLORS.corruption], [9, 14, KNIGHT_COLORS.corruptionDark], [10, 14, KNIGHT_COLORS.armorPlateLight], [11, 14, KNIGHT_COLORS.armorPlate], [12, 14, KNIGHT_COLORS.armorDark],

  [6, 13, KNIGHT_COLORS.runeGlow], [7, 13, KNIGHT_COLORS.rune], [8, 13, KNIGHT_COLORS.rune], [9, 13, KNIGHT_COLORS.runeGlow],
  [7, 14, KNIGHT_COLORS.sparkWhite], [8, 14, KNIGHT_COLORS.sparkWhite],
]

const KNIGHT_FACE_DOWN = [
  [7, 0, KNIGHT_COLORS.helmDark], [8, 0, KNIGHT_COLORS.helm], [9, 0, KNIGHT_COLORS.helm], [10, 0, KNIGHT_COLORS.helmDark],
  [6, 1, KNIGHT_COLORS.helm], [7, 1, KNIGHT_COLORS.helmLight], [8, 1, KNIGHT_COLORS.helm], [9, 1, KNIGHT_COLORS.helm], [10, 1, KNIGHT_COLORS.helmLight], [11, 1, KNIGHT_COLORS.helm],
  [6, 2, KNIGHT_COLORS.helmDark], [7, 2, KNIGHT_COLORS.helm], [8, 2, KNIGHT_COLORS.helmLight], [9, 2, KNIGHT_COLORS.helmLight], [10, 2, KNIGHT_COLORS.helm], [11, 2, KNIGHT_COLORS.helmDark],

  [6, 3, KNIGHT_COLORS.helmDark], [7, 3, KNIGHT_COLORS.helm], [8, 3, KNIGHT_COLORS.corruption], [9, 3, KNIGHT_COLORS.corruption], [10, 3, KNIGHT_COLORS.helm], [11, 3, KNIGHT_COLORS.helmDark],
  [6, 4, KNIGHT_COLORS.helmDark], [7, 4, KNIGHT_COLORS.eye], [8, 4, KNIGHT_COLORS.eyeGlow], [9, 4, KNIGHT_COLORS.eyeGlow], [10, 4, KNIGHT_COLORS.eye], [11, 4, KNIGHT_COLORS.helmDark],
  [6, 5, KNIGHT_COLORS.helmDark], [7, 5, KNIGHT_COLORS.eyeGlow], [8, 5, KNIGHT_COLORS.eyeInner], [9, 5, KNIGHT_COLORS.eyeInner], [10, 5, KNIGHT_COLORS.eyeGlow], [11, 5, KNIGHT_COLORS.helmDark],
  [7, 6, KNIGHT_COLORS.helm], [8, 6, KNIGHT_COLORS.corruption], [9, 6, KNIGHT_COLORS.corruption], [10, 6, KNIGHT_COLORS.helm],

  [4, 7, KNIGHT_COLORS.armorDark], [5, 7, KNIGHT_COLORS.armor], [6, 7, KNIGHT_COLORS.armorPlateLight], [7, 7, KNIGHT_COLORS.corruption], [8, 7, KNIGHT_COLORS.corruptionGlow], [9, 7, KNIGHT_COLORS.corruptionGlow], [10, 7, KNIGHT_COLORS.corruption], [11, 7, KNIGHT_COLORS.armorPlateLight], [12, 7, KNIGHT_COLORS.armor], [13, 7, KNIGHT_COLORS.armorDark],
  [4, 8, KNIGHT_COLORS.armorDark], [5, 8, KNIGHT_COLORS.armorPlate], [6, 8, KNIGHT_COLORS.armorPlateLight], [7, 8, KNIGHT_COLORS.corruptionDark], [8, 8, KNIGHT_COLORS.corruption], [9, 8, KNIGHT_COLORS.corruption], [10, 8, KNIGHT_COLORS.corruptionDark], [11, 8, KNIGHT_COLORS.armorPlateLight], [12, 8, KNIGHT_COLORS.armorPlate], [13, 8, KNIGHT_COLORS.armorDark],

  [5, 9, KNIGHT_COLORS.armorDark], [6, 9, KNIGHT_COLORS.armorPlate], [7, 9, KNIGHT_COLORS.corruptionGlow], [8, 9, KNIGHT_COLORS.armorPlateLight], [9, 9, KNIGHT_COLORS.armorPlateLight], [10, 9, KNIGHT_COLORS.corruptionGlow], [11, 9, KNIGHT_COLORS.armorPlate], [12, 9, KNIGHT_COLORS.armorDark],
  [5, 10, KNIGHT_COLORS.armorDark], [6, 10, KNIGHT_COLORS.armor], [7, 10, KNIGHT_COLORS.corruption], [8, 10, KNIGHT_COLORS.corruptionDark], [9, 10, KNIGHT_COLORS.corruptionDark], [10, 10, KNIGHT_COLORS.corruption], [11, 10, KNIGHT_COLORS.armor], [12, 10, KNIGHT_COLORS.armorDark],

  [6, 11, KNIGHT_COLORS.belt], [7, 11, KNIGHT_COLORS.corruption], [8, 11, KNIGHT_COLORS.beltLight], [9, 11, KNIGHT_COLORS.beltLight], [10, 11, KNIGHT_COLORS.corruption], [11, 11, KNIGHT_COLORS.belt],

  [7, 12, KNIGHT_COLORS.armorDark], [8, 12, KNIGHT_COLORS.armorPlate], [9, 12, KNIGHT_COLORS.armorPlate], [10, 12, KNIGHT_COLORS.armorDark],
  [7, 13, KNIGHT_COLORS.boot], [8, 13, KNIGHT_COLORS.bootLight], [9, 13, KNIGHT_COLORS.bootLight], [10, 13, KNIGHT_COLORS.boot],
  [7, 14, KNIGHT_COLORS.bootDark], [8, 14, KNIGHT_COLORS.boot], [9, 14, KNIGHT_COLORS.boot], [10, 14, KNIGHT_COLORS.bootDark],
  [7, 15, KNIGHT_COLORS.boot], [8, 15, KNIGHT_COLORS.bootLight], [9, 15, KNIGHT_COLORS.bootLight], [10, 15, KNIGHT_COLORS.boot],

  [3, 8, KNIGHT_COLORS.gauntlet], [4, 8, KNIGHT_COLORS.gauntletDark],
  [3, 9, KNIGHT_COLORS.gauntletLight], [4, 9, KNIGHT_COLORS.gauntlet],
  [3, 10, KNIGHT_COLORS.gauntlet], [4, 10, KNIGHT_COLORS.gauntletDark],
  [3, 11, KNIGHT_COLORS.gauntletLight],
  [3, 12, KNIGHT_COLORS.swordHandle],
  [3, 13, KNIGHT_COLORS.swordGuard],
  [3, 14, KNIGHT_COLORS.swordHandle],
  [3, 15, KNIGHT_COLORS.swordDark],
  [3, 16, KNIGHT_COLORS.sword], [4, 16, KNIGHT_COLORS.corruption],
  [3, 17, KNIGHT_COLORS.swordLight],

  [14, 8, KNIGHT_COLORS.gauntletDark], [15, 8, KNIGHT_COLORS.gauntlet],
  [14, 9, KNIGHT_COLORS.gauntlet], [15, 9, KNIGHT_COLORS.gauntletLight],
  [14, 10, KNIGHT_COLORS.gauntletDark], [15, 10, KNIGHT_COLORS.gauntlet],
  [15, 11, KNIGHT_COLORS.shieldDark],
  [15, 12, KNIGHT_COLORS.shield],
  [15, 13, KNIGHT_COLORS.shieldLight],
  [15, 14, KNIGHT_COLORS.shieldCorrupt],

  [8, 15, KNIGHT_COLORS.darkEnergy], [9, 15, KNIGHT_COLORS.darkEnergy],
  [7, 17, KNIGHT_COLORS.spark], [10, 17, KNIGHT_COLORS.spark],
]

const KNIGHT_FACE_UP = [
  [7, 0, KNIGHT_COLORS.helmDark], [8, 0, KNIGHT_COLORS.helm], [9, 0, KNIGHT_COLORS.helm], [10, 0, KNIGHT_COLORS.helmDark],
  [6, 1, KNIGHT_COLORS.helm], [7, 1, KNIGHT_COLORS.helmLight], [8, 1, KNIGHT_COLORS.helm], [9, 1, KNIGHT_COLORS.helm], [10, 1, KNIGHT_COLORS.helmLight], [11, 1, KNIGHT_COLORS.helm],
  [6, 2, KNIGHT_COLORS.helmDark], [7, 2, KNIGHT_COLORS.helm], [8, 2, KNIGHT_COLORS.helmLight], [9, 2, KNIGHT_COLORS.helmLight], [10, 2, KNIGHT_COLORS.helm], [11, 2, KNIGHT_COLORS.helmDark],

  [6, 3, KNIGHT_COLORS.helmDark], [7, 3, KNIGHT_COLORS.helm], [8, 3, KNIGHT_COLORS.corruption], [9, 3, KNIGHT_COLORS.corruption], [10, 3, KNIGHT_COLORS.helm], [11, 3, KNIGHT_COLORS.helmDark],
  [6, 4, KNIGHT_COLORS.helmDark], [7, 4, KNIGHT_COLORS.helm], [8, 4, KNIGHT_COLORS.helmLight], [9, 4, KNIGHT_COLORS.helmLight], [10, 4, KNIGHT_COLORS.helm], [11, 4, KNIGHT_COLORS.helmDark],
  [7, 5, KNIGHT_COLORS.helm], [8, 5, KNIGHT_COLORS.corruptionGlow], [9, 5, KNIGHT_COLORS.corruptionGlow], [10, 5, KNIGHT_COLORS.helm],

  [3, 6, KNIGHT_COLORS.capeDark], [4, 6, KNIGHT_COLORS.cape], [5, 6, KNIGHT_COLORS.capeLight], [6, 6, KNIGHT_COLORS.capeCorrupt], [7, 6, KNIGHT_COLORS.corruptionGlow], [8, 6, KNIGHT_COLORS.corruptionGlow], [9, 6, KNIGHT_COLORS.corruptionGlow], [10, 6, KNIGHT_COLORS.capeCorrupt], [11, 6, KNIGHT_COLORS.capeLight], [12, 6, KNIGHT_COLORS.cape], [13, 6, KNIGHT_COLORS.capeDark],
  [3, 7, KNIGHT_COLORS.capeDark], [4, 7, KNIGHT_COLORS.cape], [5, 7, KNIGHT_COLORS.capeLight], [6, 7, KNIGHT_COLORS.cape], [7, 7, KNIGHT_COLORS.corruptionDark], [8, 7, KNIGHT_COLORS.corruption], [9, 7, KNIGHT_COLORS.corruption], [10, 7, KNIGHT_COLORS.corruptionDark], [11, 7, KNIGHT_COLORS.cape], [12, 7, KNIGHT_COLORS.capeLight], [13, 7, KNIGHT_COLORS.cape], [14, 7, KNIGHT_COLORS.capeDark],
  [4, 8, KNIGHT_COLORS.capeDark], [5, 8, KNIGHT_COLORS.cape], [6, 8, KNIGHT_COLORS.capeLight], [7, 8, KNIGHT_COLORS.cape], [8, 8, KNIGHT_COLORS.corruptionDark], [9, 8, KNIGHT_COLORS.corruptionDark], [10, 8, KNIGHT_COLORS.cape], [11, 8, KNIGHT_COLORS.capeLight], [12, 8, KNIGHT_COLORS.cape], [13, 8, KNIGHT_COLORS.capeDark],
  [4, 9, KNIGHT_COLORS.capeDark], [5, 9, KNIGHT_COLORS.cape], [6, 9, KNIGHT_COLORS.capeLight], [7, 9, KNIGHT_COLORS.capeCorrupt], [8, 9, KNIGHT_COLORS.cape], [9, 9, KNIGHT_COLORS.cape], [10, 9, KNIGHT_COLORS.capeCorrupt], [11, 9, KNIGHT_COLORS.capeLight], [12, 9, KNIGHT_COLORS.cape], [13, 9, KNIGHT_COLORS.capeDark],

  [6, 10, KNIGHT_COLORS.armorDark], [7, 10, KNIGHT_COLORS.corruptionGlow], [8, 10, KNIGHT_COLORS.armorPlateLight], [9, 10, KNIGHT_COLORS.armorPlateLight], [10, 10, KNIGHT_COLORS.corruptionGlow], [11, 10, KNIGHT_COLORS.armorDark],
  [7, 11, KNIGHT_COLORS.armorDark], [8, 11, KNIGHT_COLORS.armorPlate], [9, 11, KNIGHT_COLORS.armorPlate], [10, 11, KNIGHT_COLORS.armorDark],
  [7, 12, KNIGHT_COLORS.boot], [8, 12, KNIGHT_COLORS.bootLight], [9, 12, KNIGHT_COLORS.bootLight], [10, 12, KNIGHT_COLORS.boot],
  [7, 13, KNIGHT_COLORS.bootDark], [8, 13, KNIGHT_COLORS.boot], [9, 13, KNIGHT_COLORS.boot], [10, 13, KNIGHT_COLORS.bootDark],
  [7, 14, KNIGHT_COLORS.boot], [8, 14, KNIGHT_COLORS.bootLight], [9, 14, KNIGHT_COLORS.bootLight], [10, 14, KNIGHT_COLORS.boot],

  [14, 7, KNIGHT_COLORS.swordDark],
  [14, 8, KNIGHT_COLORS.sword],
  [14, 9, KNIGHT_COLORS.swordLight],
  [14, 10, KNIGHT_COLORS.swordGuard],
  [14, 11, KNIGHT_COLORS.swordHandle],

  [8, 14, KNIGHT_COLORS.darkEnergy], [9, 14, KNIGHT_COLORS.darkEnergy],
]

const KNIGHT_FACE_LEFT = [
  [7, 0, KNIGHT_COLORS.helmDark], [8, 0, KNIGHT_COLORS.helm],
  [6, 1, KNIGHT_COLORS.helm], [7, 1, KNIGHT_COLORS.helmLight], [8, 1, KNIGHT_COLORS.corruption],
  [6, 2, KNIGHT_COLORS.helmDark], [7, 2, KNIGHT_COLORS.helm], [8, 2, KNIGHT_COLORS.helmLight],

  [6, 3, KNIGHT_COLORS.helmDark], [7, 3, KNIGHT_COLORS.eye], [8, 3, KNIGHT_COLORS.eyeGlow], [9, 3, KNIGHT_COLORS.helm],
  [6, 4, KNIGHT_COLORS.helmDark], [7, 4, KNIGHT_COLORS.eyeGlow], [8, 4, KNIGHT_COLORS.eyeInner], [9, 4, KNIGHT_COLORS.helmDark],
  [6, 5, KNIGHT_COLORS.helm], [7, 5, KNIGHT_COLORS.corruption], [8, 5, KNIGHT_COLORS.helm], [9, 5, KNIGHT_COLORS.helmDark],

  [5, 6, KNIGHT_COLORS.armorDark], [6, 6, KNIGHT_COLORS.armorPlateLight], [7, 6, KNIGHT_COLORS.corruption], [8, 6, KNIGHT_COLORS.corruptionGlow], [9, 6, KNIGHT_COLORS.armorPlate], [10, 6, KNIGHT_COLORS.armorDark],
  [4, 7, KNIGHT_COLORS.armorDark], [5, 7, KNIGHT_COLORS.armor], [6, 7, KNIGHT_COLORS.corruptionDark], [7, 7, KNIGHT_COLORS.corruption], [8, 7, KNIGHT_COLORS.corruptionDark], [9, 7, KNIGHT_COLORS.armorPlateLight], [10, 7, KNIGHT_COLORS.armor], [11, 7, KNIGHT_COLORS.armorDark],

  [4, 8, KNIGHT_COLORS.armorDark], [5, 8, KNIGHT_COLORS.armorPlate], [6, 8, KNIGHT_COLORS.corruptionGlow], [7, 8, KNIGHT_COLORS.corruption], [8, 8, KNIGHT_COLORS.corruptionDark], [9, 8, KNIGHT_COLORS.armorPlateLight], [10, 8, KNIGHT_COLORS.armor], [11, 8, KNIGHT_COLORS.armorDark],
  [4, 9, KNIGHT_COLORS.armorDark], [5, 9, KNIGHT_COLORS.armor], [6, 9, KNIGHT_COLORS.corruption], [7, 9, KNIGHT_COLORS.corruptionDark], [8, 9, KNIGHT_COLORS.corruptionDark], [9, 9, KNIGHT_COLORS.corruption], [10, 9, KNIGHT_COLORS.armor], [11, 9, KNIGHT_COLORS.armorDark],

  [5, 10, KNIGHT_COLORS.belt], [6, 10, KNIGHT_COLORS.corruption], [7, 10, KNIGHT_COLORS.beltLight], [8, 10, KNIGHT_COLORS.corruption], [9, 10, KNIGHT_COLORS.beltLight], [10, 10, KNIGHT_COLORS.belt], [11, 10, KNIGHT_COLORS.belt],

  [7, 11, KNIGHT_COLORS.armorDark], [8, 11, KNIGHT_COLORS.armorPlate], [9, 11, KNIGHT_COLORS.armorPlate], [10, 11, KNIGHT_COLORS.armorDark],
  [7, 12, KNIGHT_COLORS.boot], [8, 12, KNIGHT_COLORS.bootLight], [9, 12, KNIGHT_COLORS.bootLight], [10, 12, KNIGHT_COLORS.boot],
  [7, 13, KNIGHT_COLORS.bootDark], [8, 13, KNIGHT_COLORS.boot], [9, 13, KNIGHT_COLORS.boot], [10, 13, KNIGHT_COLORS.bootDark],
  [7, 14, KNIGHT_COLORS.boot], [8, 14, KNIGHT_COLORS.bootLight], [9, 14, KNIGHT_COLORS.bootLight], [10, 14, KNIGHT_COLORS.boot],
  [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.boot], [9, 15, KNIGHT_COLORS.boot], [10, 15, KNIGHT_COLORS.bootDark],

  [2, 7, KNIGHT_COLORS.gauntlet],
  [2, 8, KNIGHT_COLORS.gauntletLight], [3, 8, KNIGHT_COLORS.swordHandle],
  [2, 9, KNIGHT_COLORS.gauntlet], [3, 9, KNIGHT_COLORS.swordGuard],
  [2, 10, KNIGHT_COLORS.gauntletDark], [3, 10, KNIGHT_COLORS.swordHandle],
  [3, 11, KNIGHT_COLORS.swordDark], [4, 11, KNIGHT_COLORS.swordDark],
  [3, 12, KNIGHT_COLORS.sword], [4, 12, KNIGHT_COLORS.corruption],
  [3, 13, KNIGHT_COLORS.swordLight], [4, 13, KNIGHT_COLORS.sword],
  [4, 14, KNIGHT_COLORS.swordDark],

  [11, 8, KNIGHT_COLORS.gauntlet], [12, 8, KNIGHT_COLORS.gauntletDark],
  [11, 9, KNIGHT_COLORS.gauntletLight], [12, 9, KNIGHT_COLORS.gauntlet],
  [12, 10, KNIGHT_COLORS.shieldDark],
  [12, 11, KNIGHT_COLORS.shield],
  [12, 12, KNIGHT_COLORS.shieldLight],
  [12, 13, KNIGHT_COLORS.shieldCorrupt],

  [8, 15, KNIGHT_COLORS.darkEnergy],
  [7, 15, KNIGHT_COLORS.spark],
]

const KNIGHT_FACE_RIGHT = [
  [8, 0, KNIGHT_COLORS.helm], [9, 0, KNIGHT_COLORS.helmDark],
  [8, 1, KNIGHT_COLORS.corruption], [9, 1, KNIGHT_COLORS.helmLight], [10, 1, KNIGHT_COLORS.helm],
  [8, 2, KNIGHT_COLORS.helmLight], [9, 2, KNIGHT_COLORS.helm], [10, 2, KNIGHT_COLORS.helmDark],

  [7, 3, KNIGHT_COLORS.helm], [8, 3, KNIGHT_COLORS.eyeGlow], [9, 3, KNIGHT_COLORS.eye], [10, 3, KNIGHT_COLORS.helmDark],
  [7, 4, KNIGHT_COLORS.helmDark], [8, 4, KNIGHT_COLORS.eyeInner], [9, 4, KNIGHT_COLORS.eyeGlow], [10, 4, KNIGHT_COLORS.helmDark],
  [7, 5, KNIGHT_COLORS.helmDark], [8, 5, KNIGHT_COLORS.helm], [9, 5, KNIGHT_COLORS.corruption], [10, 5, KNIGHT_COLORS.helm],

  [7, 6, KNIGHT_COLORS.armorDark], [8, 6, KNIGHT_COLORS.armorPlate], [9, 6, KNIGHT_COLORS.corruptionGlow], [10, 6, KNIGHT_COLORS.corruption], [11, 6, KNIGHT_COLORS.armorPlateLight], [12, 6, KNIGHT_COLORS.armorDark],
  [6, 7, KNIGHT_COLORS.armorDark], [7, 7, KNIGHT_COLORS.armor], [8, 7, KNIGHT_COLORS.corruptionDark], [9, 7, KNIGHT_COLORS.corruption], [10, 7, KNIGHT_COLORS.corruptionDark], [11, 7, KNIGHT_COLORS.armorPlate], [12, 7, KNIGHT_COLORS.armor], [13, 7, KNIGHT_COLORS.armorDark],

  [6, 8, KNIGHT_COLORS.armorDark], [7, 8, KNIGHT_COLORS.armor], [8, 8, KNIGHT_COLORS.corruptionDark], [9, 8, KNIGHT_COLORS.corruption], [10, 8, KNIGHT_COLORS.corruptionGlow], [11, 8, KNIGHT_COLORS.armorPlate], [12, 8, KNIGHT_COLORS.armorPlate], [13, 8, KNIGHT_COLORS.armorDark],
  [6, 9, KNIGHT_COLORS.armorDark], [7, 9, KNIGHT_COLORS.armor], [8, 9, KNIGHT_COLORS.corruptionDark], [9, 9, KNIGHT_COLORS.corruptionDark], [10, 9, KNIGHT_COLORS.corruption], [11, 9, KNIGHT_COLORS.corruptionGlow], [12, 9, KNIGHT_COLORS.armor], [13, 9, KNIGHT_COLORS.armorDark],

  [6, 10, KNIGHT_COLORS.belt], [7, 10, KNIGHT_COLORS.beltLight], [8, 10, KNIGHT_COLORS.corruption], [9, 10, KNIGHT_COLORS.beltLight], [10, 10, KNIGHT_COLORS.corruption], [11, 10, KNIGHT_COLORS.belt],

  [6, 11, KNIGHT_COLORS.armorDark], [7, 11, KNIGHT_COLORS.armorPlate], [8, 11, KNIGHT_COLORS.armorPlate], [9, 11, KNIGHT_COLORS.armorDark],
  [6, 12, KNIGHT_COLORS.boot], [7, 12, KNIGHT_COLORS.bootLight], [8, 12, KNIGHT_COLORS.bootLight], [9, 12, KNIGHT_COLORS.boot],
  [6, 13, KNIGHT_COLORS.bootDark], [7, 13, KNIGHT_COLORS.boot], [8, 13, KNIGHT_COLORS.boot], [9, 13, KNIGHT_COLORS.bootDark],
  [6, 14, KNIGHT_COLORS.boot], [7, 14, KNIGHT_COLORS.bootLight], [8, 14, KNIGHT_COLORS.bootLight], [9, 14, KNIGHT_COLORS.boot],
  [6, 15, KNIGHT_COLORS.bootDark], [7, 15, KNIGHT_COLORS.boot], [8, 15, KNIGHT_COLORS.boot], [9, 15, KNIGHT_COLORS.bootDark],

  [4, 8, KNIGHT_COLORS.gauntletDark], [5, 8, KNIGHT_COLORS.gauntlet],
  [4, 9, KNIGHT_COLORS.gauntlet], [5, 9, KNIGHT_COLORS.gauntletLight],
  [4, 10, KNIGHT_COLORS.shieldCorrupt],
  [4, 11, KNIGHT_COLORS.shieldLight],
  [4, 12, KNIGHT_COLORS.shield],
  [4, 13, KNIGHT_COLORS.shieldDark],

  [13, 7, KNIGHT_COLORS.gauntlet],
  [14, 8, KNIGHT_COLORS.swordHandle], [15, 8, KNIGHT_COLORS.gauntletLight],
  [14, 9, KNIGHT_COLORS.swordGuard], [15, 9, KNIGHT_COLORS.gauntlet],
  [14, 10, KNIGHT_COLORS.swordHandle], [15, 10, KNIGHT_COLORS.gauntletDark],
  [14, 11, KNIGHT_COLORS.swordDark], [15, 11, KNIGHT_COLORS.swordDark],
  [15, 12, KNIGHT_COLORS.corruption], [16, 12, KNIGHT_COLORS.sword],
  [15, 13, KNIGHT_COLORS.sword], [16, 13, KNIGHT_COLORS.swordLight],
  [16, 14, KNIGHT_COLORS.swordDark],

  [8, 15, KNIGHT_COLORS.darkEnergy],
  [9, 15, KNIGHT_COLORS.spark],
]

const KNIGHT_IDLE_FRAMES = [
  [
    { pixels: [
      [8, 3, KNIGHT_COLORS.corruption], [9, 3, KNIGHT_COLORS.corruption],
      [8, 6, KNIGHT_COLORS.corruption], [9, 6, KNIGHT_COLORS.corruption],
      [7, 7, KNIGHT_COLORS.corruption], [8, 7, KNIGHT_COLORS.corruption], [9, 7, KNIGHT_COLORS.corruption], [10, 7, KNIGHT_COLORS.corruption],
      [7, 8, KNIGHT_COLORS.corruptionDark], [8, 8, KNIGHT_COLORS.corruption], [9, 8, KNIGHT_COLORS.corruption], [10, 8, KNIGHT_COLORS.corruptionDark],
      [7, 9, KNIGHT_COLORS.corruptionGlow], [8, 9, KNIGHT_COLORS.corruptionDark], [9, 9, KNIGHT_COLORS.corruptionDark], [10, 9, KNIGHT_COLORS.corruptionGlow],
    ] }
  ],
  [
    { pixels: [
      [8, 3, KNIGHT_COLORS.corruptionGlow], [9, 3, KNIGHT_COLORS.corruptionGlow],
      [8, 6, KNIGHT_COLORS.corruptionGlow], [9, 6, KNIGHT_COLORS.corruptionGlow],
      [7, 7, KNIGHT_COLORS.corruptionGlow], [8, 7, KNIGHT_COLORS.corruptionGlow], [9, 7, KNIGHT_COLORS.corruptionGlow], [10, 7, KNIGHT_COLORS.corruptionGlow],
      [7, 8, KNIGHT_COLORS.corruptionGlow], [8, 8, KNIGHT_COLORS.corruptionGlow], [9, 8, KNIGHT_COLORS.corruptionGlow], [10, 8, KNIGHT_COLORS.corruptionGlow],
      [7, 9, KNIGHT_COLORS.corruptionGlow], [8, 9, KNIGHT_COLORS.corruption], [9, 9, KNIGHT_COLORS.corruption], [10, 9, KNIGHT_COLORS.corruptionGlow],
      [8, 16, KNIGHT_COLORS.darkEnergy],
      [7, 16, KNIGHT_COLORS.spark], [9, 16, KNIGHT_COLORS.spark],
    ] }
  ],
]

const KNIGHT_WALK_FRAMES = [
  [
    { pixels: [
      [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.boot], [9, 15, KNIGHT_COLORS.bootLight], [10, 15, KNIGHT_COLORS.boot],
      [8, 16, KNIGHT_COLORS.darkEnergy],
      [7, 16, KNIGHT_COLORS.spark],
    ] }
  ],
  [
    { pixels: [
      [7, 15, KNIGHT_COLORS.boot], [8, 15, KNIGHT_COLORS.bootLight], [9, 15, KNIGHT_COLORS.boot], [10, 15, KNIGHT_COLORS.bootDark],
      [9, 16, KNIGHT_COLORS.darkEnergy],
      [8, 16, KNIGHT_COLORS.spark], [10, 16, KNIGHT_COLORS.spark],
    ] }
  ],
  [
    { pixels: [
      [7, 15, KNIGHT_COLORS.bootLight], [8, 15, KNIGHT_COLORS.boot], [9, 15, KNIGHT_COLORS.boot], [10, 15, KNIGHT_COLORS.bootLight],
    ] }
  ],
]

export const drawBlackKnight = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: KNIGHT_FACE_DOWN,
  up: KNIGHT_FACE_UP,
  left: KNIGHT_FACE_LEFT,
  right: KNIGHT_FACE_RIGHT,
  walk: KNIGHT_WALK_FRAMES,
  idle: KNIGHT_IDLE_FRAMES,
})

export const drawBlackKnightAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, KNIGHT_AVATAR)
