import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.004,
  WALK_SPEED: 0.08,
}

const LORD_COLORS = {
  skull: '#E8E8D8',
  skullDark: '#B8B8A8',
  skullLight: '#F8F8E8',
  skullShadow: '#8A8A7A',
  eyeHole: '#0A000A',
  eyeGlow: '#8800FF',
  eyeGlowLight: '#AA44FF',
  eyeCore: '#FFFFFF',
  tooth: '#F0F0E0',
  toothDark: '#C8C8B8',
  hood: '#0A000A',
  hoodDark: '#050005',
  hoodLight: '#1A0A1A',
  hoodPurple: '#1A0A2A',
  hoodPurpleLight: '#3A1A4A',
  collar: '#1A0A1A',
  collarDark: '#0A000A',
  collarLight: '#2A1A2A',
  darkBody: '#1A0A1A',
  darkBodyDark: '#0A000A',
  darkBodyLight: '#2A1A2A',
  darkBodyPurple: '#2A0A3A',
  darkBodyPurpleLight: '#4A1A5A',
  shadow: '#1A0A1A',
  shadowDark: '#0A000A',
  shadowLight: '#2A1A2A',
  smoke: '#2A1A3A',
  smokeLight: '#4A2A5A',
  mist: '#3A1A4A',
  mistLight: '#5A2A6A',
  darkEnergy: '#330099',
  darkEnergyGlow: '#5511BB',
  darkEnergyLight: '#7733DD',
  spark: '#9933FF',
  sparkLight: '#BB55FF',
  sparkWhite: '#FFFFFF',
  floatGlow: '#2A1A3A',
  floatGlowLight: '#4A2A5A',
  highlight: '#FFFFFF',
}

const LORD_AVATAR = [
  [4, 0, LORD_COLORS.hoodDark], [5, 0, LORD_COLORS.hood], [6, 0, LORD_COLORS.hoodLight], [7, 0, LORD_COLORS.hoodLight], [8, 0, LORD_COLORS.hood], [9, 0, LORD_COLORS.hoodDark],
  [3, 1, LORD_COLORS.hood], [4, 1, LORD_COLORS.hoodLight], [5, 1, LORD_COLORS.hood], [6, 1, LORD_COLORS.hoodPurple], [7, 1, LORD_COLORS.hoodPurple], [8, 1, LORD_COLORS.hood], [9, 1, LORD_COLORS.hoodLight], [10, 1, LORD_COLORS.hood],
  [3, 2, LORD_COLORS.hoodDark], [4, 2, LORD_COLORS.hood], [5, 2, LORD_COLORS.hoodLight], [6, 2, LORD_COLORS.hood], [7, 2, LORD_COLORS.hood], [8, 2, LORD_COLORS.hoodLight], [9, 2, LORD_COLORS.hood], [10, 2, LORD_COLORS.hoodDark],
  [4, 3, LORD_COLORS.hood], [5, 3, LORD_COLORS.collarLight], [6, 3, LORD_COLORS.collar], [7, 3, LORD_COLORS.collar], [8, 3, LORD_COLORS.collarLight], [9, 3, LORD_COLORS.hood],
  [3, 4, LORD_COLORS.hoodDark], [4, 4, LORD_COLORS.hood], [5, 4, LORD_COLORS.skullShadow], [6, 4, LORD_COLORS.skull], [7, 4, LORD_COLORS.skull], [8, 4, LORD_COLORS.skullShadow], [9, 4, LORD_COLORS.hood], [10, 4, LORD_COLORS.hoodDark],
  [3, 5, LORD_COLORS.skull], [4, 5, LORD_COLORS.skullLight], [5, 5, LORD_COLORS.skull], [6, 5, LORD_COLORS.skull], [7, 5, LORD_COLORS.skull], [8, 5, LORD_COLORS.skullLight], [9, 5, LORD_COLORS.skull], [10, 5, LORD_COLORS.skullDark],
  [3, 6, LORD_COLORS.skullDark], [4, 6, LORD_COLORS.skull], [5, 6, LORD_COLORS.skullLight], [6, 6, LORD_COLORS.skull], [7, 6, LORD_COLORS.skull], [8, 6, LORD_COLORS.skullLight], [9, 6, LORD_COLORS.skull], [10, 6, LORD_COLORS.skullDark],
  [3, 7, LORD_COLORS.skullDark], [4, 7, LORD_COLORS.skull], [5, 7, LORD_COLORS.eyeHole], [6, 7, LORD_COLORS.eyeGlow], [7, 7, LORD_COLORS.eyeGlow], [8, 7, LORD_COLORS.eyeHole], [9, 7, LORD_COLORS.skull], [10, 7, LORD_COLORS.skullDark],
  [4, 8, LORD_COLORS.skullDark], [5, 8, LORD_COLORS.eyeGlow], [6, 8, LORD_COLORS.eyeCore], [7, 8, LORD_COLORS.eyeCore], [8, 8, LORD_COLORS.eyeGlow], [9, 8, LORD_COLORS.skullDark],
  [6, 7, LORD_COLORS.highlight], [7, 7, LORD_COLORS.highlight],
  [6, 8, LORD_COLORS.highlight], [7, 8, LORD_COLORS.highlight],
  [3, 8, LORD_COLORS.skull], [4, 8, LORD_COLORS.eyeGlowLight], [5, 8, LORD_COLORS.eyeGlow], [9, 8, LORD_COLORS.eyeGlowLight], [10, 8, LORD_COLORS.skull],
  [3, 9, LORD_COLORS.skullDark], [4, 9, LORD_COLORS.skull], [5, 9, LORD_COLORS.skullShadow], [6, 9, LORD_COLORS.skullShadow], [7, 9, LORD_COLORS.skullShadow], [8, 9, LORD_COLORS.skullShadow], [9, 9, LORD_COLORS.skull], [10, 9, LORD_COLORS.skullDark],
  [4, 10, LORD_COLORS.skull], [5, 10, LORD_COLORS.skullDark], [6, 10, LORD_COLORS.skullShadow], [7, 10, LORD_COLORS.skullShadow], [8, 10, LORD_COLORS.skullDark], [9, 10, LORD_COLORS.skull],
  [4, 11, LORD_COLORS.skullDark], [5, 11, LORD_COLORS.skull], [6, 11, LORD_COLORS.skullDark], [7, 11, LORD_COLORS.skullDark], [8, 11, LORD_COLORS.skull], [9, 11, LORD_COLORS.skullDark],
  [5, 12, LORD_COLORS.tooth], [6, 12, LORD_COLORS.tooth], [7, 12, LORD_COLORS.tooth], [8, 12, LORD_COLORS.tooth],
  [4, 13, LORD_COLORS.toothDark], [5, 13, LORD_COLORS.tooth], [6, 13, LORD_COLORS.toothDark], [7, 13, LORD_COLORS.toothDark], [8, 13, LORD_COLORS.tooth], [9, 13, LORD_COLORS.toothDark],
  [5, 14, LORD_COLORS.toothDark], [6, 14, LORD_COLORS.tooth], [7, 14, LORD_COLORS.tooth], [8, 14, LORD_COLORS.toothDark],
  [4, 15, LORD_COLORS.hood], [5, 15, LORD_COLORS.collarLight], [6, 15, LORD_COLORS.collar], [7, 15, LORD_COLORS.collar], [8, 15, LORD_COLORS.collarLight], [9, 15, LORD_COLORS.hood],
  [3, 16, LORD_COLORS.hoodDark], [4, 16, LORD_COLORS.collarDark], [5, 16, LORD_COLORS.collar], [6, 16, LORD_COLORS.collar], [7, 16, LORD_COLORS.collar], [8, 16, LORD_COLORS.collarDark], [9, 16, LORD_COLORS.hoodDark],
]

const LORD_FACE_DOWN = [
  [6, 0, LORD_COLORS.hoodDark], [7, 0, LORD_COLORS.hood], [8, 0, LORD_COLORS.hoodLight], [9, 0, LORD_COLORS.hoodLight], [10, 0, LORD_COLORS.hood], [11, 0, LORD_COLORS.hoodDark],
  [5, 1, LORD_COLORS.hood], [6, 1, LORD_COLORS.hoodLight], [7, 1, LORD_COLORS.hood], [8, 1, LORD_COLORS.hoodPurple], [9, 1, LORD_COLORS.hoodPurple], [10, 1, LORD_COLORS.hood], [11, 1, LORD_COLORS.hoodLight], [12, 1, LORD_COLORS.hood],
  [5, 2, LORD_COLORS.hoodDark], [6, 2, LORD_COLORS.hood], [7, 2, LORD_COLORS.hoodLight], [8, 2, LORD_COLORS.hood], [9, 2, LORD_COLORS.hood], [10, 2, LORD_COLORS.hoodLight], [11, 2, LORD_COLORS.hood], [12, 2, LORD_COLORS.hoodDark],
  [6, 3, LORD_COLORS.hood], [7, 3, LORD_COLORS.collarLight], [8, 3, LORD_COLORS.collar], [9, 3, LORD_COLORS.collar], [10, 3, LORD_COLORS.collarLight], [11, 3, LORD_COLORS.hood],
  [5, 4, LORD_COLORS.hoodDark], [6, 4, LORD_COLORS.hood], [7, 4, LORD_COLORS.skullShadow], [8, 4, LORD_COLORS.skull], [9, 4, LORD_COLORS.skull], [10, 4, LORD_COLORS.skullShadow], [11, 4, LORD_COLORS.hood], [12, 4, LORD_COLORS.hoodDark],
  [6, 5, LORD_COLORS.skull], [7, 5, LORD_COLORS.eyeHole], [8, 5, LORD_COLORS.eyeGlow], [9, 5, LORD_COLORS.eyeGlow], [10, 5, LORD_COLORS.eyeHole], [11, 5, LORD_COLORS.skull],
  [6, 6, LORD_COLORS.skullDark], [7, 6, LORD_COLORS.eyeGlow], [8, 6, LORD_COLORS.eyeCore], [9, 6, LORD_COLORS.eyeCore], [10, 6, LORD_COLORS.eyeGlow], [11, 6, LORD_COLORS.skullDark],
  [7, 7, LORD_COLORS.skull], [8, 7, LORD_COLORS.skullDark], [9, 7, LORD_COLORS.skullDark], [10, 7, LORD_COLORS.skull],
  [7, 8, LORD_COLORS.tooth], [8, 8, LORD_COLORS.toothDark], [9, 8, LORD_COLORS.toothDark], [10, 8, LORD_COLORS.tooth],
  [5, 8, LORD_COLORS.hood], [6, 8, LORD_COLORS.collar], [7, 8, LORD_COLORS.collarLight], [10, 8, LORD_COLORS.collarLight], [11, 8, LORD_COLORS.collar], [12, 8, LORD_COLORS.hood],
  [5, 9, LORD_COLORS.hoodDark], [6, 9, LORD_COLORS.collarDark], [7, 9, LORD_COLORS.collar], [10, 9, LORD_COLORS.collar], [11, 9, LORD_COLORS.collarDark], [12, 9, LORD_COLORS.hoodDark],
  [6, 10, LORD_COLORS.darkBodyDark], [7, 10, LORD_COLORS.darkBody], [8, 10, LORD_COLORS.darkBodyLight], [9, 10, LORD_COLORS.darkBodyLight], [10, 10, LORD_COLORS.darkBody], [11, 10, LORD_COLORS.darkBodyDark],
  [6, 11, LORD_COLORS.darkBody], [7, 11, LORD_COLORS.darkBodyPurple], [8, 11, LORD_COLORS.darkBodyPurpleLight], [9, 11, LORD_COLORS.darkBodyPurpleLight], [10, 11, LORD_COLORS.darkBodyPurple], [11, 11, LORD_COLORS.darkBody],
  [6, 12, LORD_COLORS.darkBodyDark], [7, 12, LORD_COLORS.darkBody], [8, 12, LORD_COLORS.darkBodyLight], [9, 12, LORD_COLORS.darkBodyLight], [10, 12, LORD_COLORS.darkBody], [11, 12, LORD_COLORS.darkBodyDark],
  [6, 13, LORD_COLORS.darkBody], [7, 13, LORD_COLORS.darkBodyPurple], [8, 13, LORD_COLORS.darkBody], [9, 13, LORD_COLORS.darkBody], [10, 13, LORD_COLORS.darkBodyPurple], [11, 13, LORD_COLORS.darkBody],
  [4, 10, LORD_COLORS.hood], [5, 10, LORD_COLORS.hoodDark], [12, 10, LORD_COLORS.hoodDark], [13, 10, LORD_COLORS.hood],
  [3, 11, LORD_COLORS.hoodDark], [4, 11, LORD_COLORS.hood], [5, 11, LORD_COLORS.hoodLight], [12, 11, LORD_COLORS.hoodLight], [13, 11, LORD_COLORS.hood], [14, 11, LORD_COLORS.hoodDark],
  [3, 12, LORD_COLORS.hood], [4, 12, LORD_COLORS.hoodDark], [5, 12, LORD_COLORS.hood], [12, 12, LORD_COLORS.hood], [13, 12, LORD_COLORS.hoodDark], [14, 12, LORD_COLORS.hood],
  [2, 13, LORD_COLORS.hoodDark], [3, 13, LORD_COLORS.hood], [4, 13, LORD_COLORS.hoodLight], [5, 13, LORD_COLORS.hood], [12, 13, LORD_COLORS.hood], [13, 13, LORD_COLORS.hoodLight], [14, 13, LORD_COLORS.hood], [15, 13, LORD_COLORS.hoodDark],
  [2, 14, LORD_COLORS.hood], [3, 14, LORD_COLORS.hoodDark], [4, 14, LORD_COLORS.hood], [5, 14, LORD_COLORS.hoodLight], [12, 14, LORD_COLORS.hoodLight], [13, 14, LORD_COLORS.hood], [14, 14, LORD_COLORS.hoodDark], [15, 14, LORD_COLORS.hood],
  [3, 15, LORD_COLORS.hoodDark], [4, 15, LORD_COLORS.hood], [5, 15, LORD_COLORS.hoodLight], [12, 15, LORD_COLORS.hoodLight], [13, 15, LORD_COLORS.hood], [14, 15, LORD_COLORS.hoodDark],
  [4, 16, LORD_COLORS.hood], [5, 16, LORD_COLORS.hoodDark], [12, 16, LORD_COLORS.hoodDark], [13, 16, LORD_COLORS.hood],
  [5, 17, LORD_COLORS.floatGlow], [6, 17, LORD_COLORS.floatGlowLight], [7, 17, LORD_COLORS.darkBodyPurple], [8, 17, LORD_COLORS.darkBodyPurpleLight], [9, 17, LORD_COLORS.darkBodyPurpleLight], [10, 17, LORD_COLORS.darkBodyPurple], [11, 17, LORD_COLORS.floatGlowLight], [12, 17, LORD_COLORS.floatGlow],
  [6, 18, LORD_COLORS.floatGlow], [7, 18, LORD_COLORS.darkEnergy], [8, 18, LORD_COLORS.darkEnergyGlow], [9, 18, LORD_COLORS.darkEnergyGlow], [10, 18, LORD_COLORS.darkEnergy], [11, 18, LORD_COLORS.floatGlow],
  [2, 12, LORD_COLORS.smoke], [16, 12, LORD_COLORS.smoke],
  [2, 13, LORD_COLORS.mist], [16, 13, LORD_COLORS.mist],
  [3, 14, LORD_COLORS.shadowLight], [15, 14, LORD_COLORS.shadowLight],
]

const LORD_FACE_UP = [
  [6, 0, LORD_COLORS.hoodDark], [7, 0, LORD_COLORS.hood], [8, 0, LORD_COLORS.hoodLight], [9, 0, LORD_COLORS.hoodLight], [10, 0, LORD_COLORS.hood], [11, 0, LORD_COLORS.hoodDark],
  [5, 1, LORD_COLORS.hood], [6, 1, LORD_COLORS.hoodLight], [7, 1, LORD_COLORS.hood], [8, 1, LORD_COLORS.hoodPurple], [9, 1, LORD_COLORS.hoodPurple], [10, 1, LORD_COLORS.hood], [11, 1, LORD_COLORS.hoodLight], [12, 1, LORD_COLORS.hood],
  [5, 2, LORD_COLORS.hoodDark], [6, 2, LORD_COLORS.hood], [7, 2, LORD_COLORS.hoodLight], [8, 2, LORD_COLORS.hood], [9, 2, LORD_COLORS.hood], [10, 2, LORD_COLORS.hoodLight], [11, 2, LORD_COLORS.hood], [12, 2, LORD_COLORS.hoodDark],
  [5, 3, LORD_COLORS.hoodDark], [6, 3, LORD_COLORS.hood], [7, 3, LORD_COLORS.hoodLight], [8, 3, LORD_COLORS.hood], [9, 3, LORD_COLORS.hood], [10, 3, LORD_COLORS.hoodLight], [11, 3, LORD_COLORS.hood], [12, 3, LORD_COLORS.hoodDark],
  [6, 4, LORD_COLORS.hood], [7, 4, LORD_COLORS.hoodLight], [8, 4, LORD_COLORS.hoodPurple], [9, 4, LORD_COLORS.hoodPurple], [10, 4, LORD_COLORS.hoodLight], [11, 4, LORD_COLORS.hood],
  [6, 5, LORD_COLORS.skullShadow], [7, 5, LORD_COLORS.skull], [8, 5, LORD_COLORS.skullLight], [9, 5, LORD_COLORS.skullLight], [10, 5, LORD_COLORS.skull], [11, 5, LORD_COLORS.skullShadow],
  [6, 6, LORD_COLORS.skull], [7, 6, LORD_COLORS.skullDark], [8, 6, LORD_COLORS.skull], [9, 6, LORD_COLORS.skull], [10, 6, LORD_COLORS.skullDark], [11, 6, LORD_COLORS.skull],
  [5, 7, LORD_COLORS.hood], [6, 7, LORD_COLORS.collar], [7, 7, LORD_COLORS.collarLight], [10, 7, LORD_COLORS.collarLight], [11, 7, LORD_COLORS.collar], [12, 7, LORD_COLORS.hood],
  [5, 8, LORD_COLORS.hoodDark], [6, 8, LORD_COLORS.collarDark], [7, 8, LORD_COLORS.collar], [10, 8, LORD_COLORS.collar], [11, 8, LORD_COLORS.collarDark], [12, 8, LORD_COLORS.hoodDark],
  [6, 9, LORD_COLORS.darkBodyDark], [7, 9, LORD_COLORS.darkBody], [8, 9, LORD_COLORS.darkBodyLight], [9, 9, LORD_COLORS.darkBodyLight], [10, 9, LORD_COLORS.darkBody], [11, 9, LORD_COLORS.darkBodyDark],
  [6, 10, LORD_COLORS.darkBody], [7, 10, LORD_COLORS.darkBodyPurple], [8, 10, LORD_COLORS.darkBodyPurpleLight], [9, 10, LORD_COLORS.darkBodyPurpleLight], [10, 10, LORD_COLORS.darkBodyPurple], [11, 10, LORD_COLORS.darkBody],
  [6, 11, LORD_COLORS.darkBodyDark], [7, 11, LORD_COLORS.darkBody], [8, 11, LORD_COLORS.darkBodyLight], [9, 11, LORD_COLORS.darkBodyLight], [10, 11, LORD_COLORS.darkBody], [11, 11, LORD_COLORS.darkBodyDark],
  [6, 12, LORD_COLORS.darkBody], [7, 12, LORD_COLORS.darkBodyPurple], [8, 12, LORD_COLORS.darkBody], [9, 12, LORD_COLORS.darkBody], [10, 12, LORD_COLORS.darkBodyPurple], [11, 12, LORD_COLORS.darkBody],
  [4, 9, LORD_COLORS.hood], [5, 9, LORD_COLORS.hoodDark], [12, 9, LORD_COLORS.hoodDark], [13, 9, LORD_COLORS.hood],
  [3, 10, LORD_COLORS.hoodDark], [4, 10, LORD_COLORS.hood], [5, 10, LORD_COLORS.hoodLight], [12, 10, LORD_COLORS.hoodLight], [13, 10, LORD_COLORS.hood], [14, 10, LORD_COLORS.hoodDark],
  [3, 11, LORD_COLORS.hood], [4, 11, LORD_COLORS.hoodDark], [5, 11, LORD_COLORS.hood], [12, 11, LORD_COLORS.hood], [13, 11, LORD_COLORS.hoodDark], [14, 11, LORD_COLORS.hood],
  [2, 12, LORD_COLORS.hoodDark], [3, 12, LORD_COLORS.hood], [4, 12, LORD_COLORS.hoodLight], [5, 12, LORD_COLORS.hood], [12, 12, LORD_COLORS.hood], [13, 12, LORD_COLORS.hoodLight], [14, 12, LORD_COLORS.hood], [15, 12, LORD_COLORS.hoodDark],
  [2, 13, LORD_COLORS.hood], [3, 13, LORD_COLORS.hoodDark], [4, 13, LORD_COLORS.hood], [5, 13, LORD_COLORS.hoodLight], [12, 13, LORD_COLORS.hoodLight], [13, 13, LORD_COLORS.hood], [14, 13, LORD_COLORS.hoodDark], [15, 13, LORD_COLORS.hood],
  [3, 14, LORD_COLORS.hoodDark], [4, 14, LORD_COLORS.hood], [5, 14, LORD_COLORS.hoodLight], [12, 14, LORD_COLORS.hoodLight], [13, 14, LORD_COLORS.hood], [14, 14, LORD_COLORS.hoodDark],
  [5, 15, LORD_COLORS.floatGlow], [6, 15, LORD_COLORS.floatGlowLight], [7, 15, LORD_COLORS.darkBodyPurple], [8, 15, LORD_COLORS.darkBodyPurpleLight], [9, 15, LORD_COLORS.darkBodyPurpleLight], [10, 15, LORD_COLORS.darkBodyPurple], [11, 15, LORD_COLORS.floatGlowLight], [12, 15, LORD_COLORS.floatGlow],
  [6, 16, LORD_COLORS.floatGlow], [7, 16, LORD_COLORS.darkEnergy], [8, 16, LORD_COLORS.darkEnergyGlow], [9, 16, LORD_COLORS.darkEnergyGlow], [10, 16, LORD_COLORS.darkEnergy], [11, 16, LORD_COLORS.floatGlow],
]

const LORD_FACE_LEFT = [
  [7, 0, LORD_COLORS.hoodDark], [8, 0, LORD_COLORS.hood],
  [6, 1, LORD_COLORS.hood], [7, 1, LORD_COLORS.hoodLight], [8, 1, LORD_COLORS.hoodPurple],
  [6, 2, LORD_COLORS.hoodDark], [7, 2, LORD_COLORS.hood], [8, 2, LORD_COLORS.hoodLight],
  [6, 3, LORD_COLORS.hood], [7, 3, LORD_COLORS.skullShadow], [8, 3, LORD_COLORS.skull],
  [6, 4, LORD_COLORS.hoodDark], [7, 4, LORD_COLORS.skull], [8, 4, LORD_COLORS.eyeGlow],
  [6, 5, LORD_COLORS.hood], [7, 5, LORD_COLORS.skullDark], [8, 5, LORD_COLORS.eyeCore],
  [6, 6, LORD_COLORS.hoodDark], [7, 6, LORD_COLORS.skull], [8, 6, LORD_COLORS.skull],
  [7, 7, LORD_COLORS.tooth], [8, 7, LORD_COLORS.toothDark],
  [6, 7, LORD_COLORS.collar], [7, 7, LORD_COLORS.collarLight], [8, 7, LORD_COLORS.hood],
  [6, 8, LORD_COLORS.collarDark], [7, 8, LORD_COLORS.collar], [8, 8, LORD_COLORS.hoodDark],
  [7, 9, LORD_COLORS.darkBodyDark], [8, 9, LORD_COLORS.darkBody],
  [7, 10, LORD_COLORS.darkBody], [8, 10, LORD_COLORS.darkBodyPurple],
  [7, 11, LORD_COLORS.darkBodyDark], [8, 11, LORD_COLORS.darkBody],
  [7, 12, LORD_COLORS.darkBody], [8, 12, LORD_COLORS.darkBodyPurple],
  [5, 8, LORD_COLORS.hood], [6, 8, LORD_COLORS.hoodDark], [9, 8, LORD_COLORS.hood], [10, 8, LORD_COLORS.hoodDark],
  [4, 9, LORD_COLORS.hoodDark], [5, 9, LORD_COLORS.hood], [6, 9, LORD_COLORS.hoodLight], [9, 9, LORD_COLORS.hoodLight], [10, 9, LORD_COLORS.hood], [11, 9, LORD_COLORS.hood], [12, 9, LORD_COLORS.hoodDark],
  [4, 10, LORD_COLORS.hood], [5, 10, LORD_COLORS.hoodDark], [6, 10, LORD_COLORS.hood], [9, 10, LORD_COLORS.hood], [10, 10, LORD_COLORS.hoodLight], [11, 10, LORD_COLORS.hood], [12, 10, LORD_COLORS.hoodDark],
  [3, 11, LORD_COLORS.hoodDark], [4, 11, LORD_COLORS.hood], [5, 11, LORD_COLORS.hoodLight], [6, 11, LORD_COLORS.hood], [9, 11, LORD_COLORS.hood], [10, 11, LORD_COLORS.hoodLight], [11, 11, LORD_COLORS.hood], [12, 11, LORD_COLORS.hood], [13, 11, LORD_COLORS.hoodDark],
  [3, 12, LORD_COLORS.hood], [4, 12, LORD_COLORS.hoodDark], [5, 12, LORD_COLORS.hood], [6, 12, LORD_COLORS.hoodLight], [9, 12, LORD_COLORS.hood], [10, 12, LORD_COLORS.hoodLight], [11, 12, LORD_COLORS.hood], [12, 12, LORD_COLORS.hoodDark], [13, 12, LORD_COLORS.hood],
  [4, 13, LORD_COLORS.hoodDark], [5, 13, LORD_COLORS.hood], [6, 13, LORD_COLORS.hoodLight], [9, 13, LORD_COLORS.hood], [10, 13, LORD_COLORS.hoodLight], [11, 13, LORD_COLORS.hood], [12, 13, LORD_COLORS.hoodDark],
  [5, 14, LORD_COLORS.hood], [6, 14, LORD_COLORS.hoodDark], [9, 14, LORD_COLORS.hood], [10, 14, LORD_COLORS.hoodDark], [11, 14, LORD_COLORS.hood],
  [6, 15, LORD_COLORS.floatGlow], [7, 15, LORD_COLORS.floatGlowLight], [8, 15, LORD_COLORS.darkBodyPurple], [9, 15, LORD_COLORS.floatGlowLight], [10, 15, LORD_COLORS.floatGlow],
  [7, 16, LORD_COLORS.floatGlow], [8, 16, LORD_COLORS.darkEnergy], [9, 16, LORD_COLORS.darkEnergyGlow], [10, 16, LORD_COLORS.floatGlow],
]

const LORD_FACE_RIGHT = [
  [8, 0, LORD_COLORS.hood], [9, 0, LORD_COLORS.hoodDark],
  [8, 1, LORD_COLORS.hoodPurple], [9, 1, LORD_COLORS.hoodLight], [10, 1, LORD_COLORS.hood],
  [8, 2, LORD_COLORS.hoodLight], [9, 2, LORD_COLORS.hood], [10, 2, LORD_COLORS.hoodDark],
  [8, 3, LORD_COLORS.skull], [9, 3, LORD_COLORS.skullShadow], [10, 3, LORD_COLORS.hood],
  [8, 4, LORD_COLORS.eyeGlow], [9, 4, LORD_COLORS.skull], [10, 4, LORD_COLORS.hoodDark],
  [8, 5, LORD_COLORS.eyeCore], [9, 5, LORD_COLORS.skullDark], [10, 5, LORD_COLORS.hood],
  [8, 6, LORD_COLORS.skull], [9, 6, LORD_COLORS.skull], [10, 6, LORD_COLORS.hoodDark],
  [8, 7, LORD_COLORS.toothDark], [9, 7, LORD_COLORS.tooth],
  [8, 7, LORD_COLORS.hood], [9, 7, LORD_COLORS.collarLight], [10, 7, LORD_COLORS.collar],
  [8, 8, LORD_COLORS.hoodDark], [9, 8, LORD_COLORS.collar], [10, 8, LORD_COLORS.collarDark],
  [8, 9, LORD_COLORS.darkBody], [9, 9, LORD_COLORS.darkBodyDark],
  [8, 10, LORD_COLORS.darkBodyPurple], [9, 10, LORD_COLORS.darkBody],
  [8, 11, LORD_COLORS.darkBody], [9, 11, LORD_COLORS.darkBodyDark],
  [8, 12, LORD_COLORS.darkBodyPurple], [9, 12, LORD_COLORS.darkBody],
  [6, 8, LORD_COLORS.hoodDark], [7, 8, LORD_COLORS.hood], [10, 8, LORD_COLORS.hood], [11, 8, LORD_COLORS.hoodDark],
  [4, 9, LORD_COLORS.hoodDark], [5, 9, LORD_COLORS.hood], [6, 9, LORD_COLORS.hoodLight], [7, 9, LORD_COLORS.hood], [8, 9, LORD_COLORS.hoodLight], [11, 9, LORD_COLORS.hood], [12, 9, LORD_COLORS.hood], [13, 9, LORD_COLORS.hoodDark],
  [4, 10, LORD_COLORS.hoodDark], [5, 10, LORD_COLORS.hood], [6, 10, LORD_COLORS.hood], [7, 10, LORD_COLORS.hoodLight], [8, 10, LORD_COLORS.hood], [11, 10, LORD_COLORS.hood], [12, 10, LORD_COLORS.hoodLight], [13, 10, LORD_COLORS.hoodDark],
  [3, 11, LORD_COLORS.hoodDark], [4, 11, LORD_COLORS.hood], [5, 11, LORD_COLORS.hoodLight], [6, 11, LORD_COLORS.hood], [7, 11, LORD_COLORS.hood], [10, 11, LORD_COLORS.hood], [11, 11, LORD_COLORS.hoodLight], [12, 11, LORD_COLORS.hood], [13, 11, LORD_COLORS.hood], [14, 11, LORD_COLORS.hoodDark],
  [3, 12, LORD_COLORS.hood], [4, 12, LORD_COLORS.hoodDark], [5, 12, LORD_COLORS.hood], [6, 12, LORD_COLORS.hoodLight], [7, 12, LORD_COLORS.hood], [10, 12, LORD_COLORS.hood], [11, 12, LORD_COLORS.hoodLight], [12, 12, LORD_COLORS.hood], [13, 12, LORD_COLORS.hoodDark], [14, 12, LORD_COLORS.hood],
  [4, 13, LORD_COLORS.hoodDark], [5, 13, LORD_COLORS.hood], [6, 13, LORD_COLORS.hoodLight], [7, 13, LORD_COLORS.hood], [10, 13, LORD_COLORS.hood], [11, 13, LORD_COLORS.hoodLight], [12, 13, LORD_COLORS.hood], [13, 13, LORD_COLORS.hoodDark],
  [5, 14, LORD_COLORS.hood], [6, 14, LORD_COLORS.hoodDark], [7, 14, LORD_COLORS.hood], [10, 14, LORD_COLORS.hood], [11, 14, LORD_COLORS.hoodDark], [12, 14, LORD_COLORS.hood],
  [6, 15, LORD_COLORS.floatGlow], [7, 15, LORD_COLORS.floatGlowLight], [8, 15, LORD_COLORS.darkBodyPurple], [9, 15, LORD_COLORS.floatGlowLight], [10, 15, LORD_COLORS.floatGlow],
  [7, 16, LORD_COLORS.floatGlow], [8, 16, LORD_COLORS.darkEnergy], [9, 16, LORD_COLORS.darkEnergyGlow], [10, 16, LORD_COLORS.floatGlow],
]

const LORD_IDLE_FRAMES = [
  [
    { pixels: [
      [8, 5, LORD_COLORS.eyeGlow], [9, 5, LORD_COLORS.eyeGlow],
      [8, 11, LORD_COLORS.darkBodyPurple], [9, 11, LORD_COLORS.darkBodyPurple],
      [7, 18, LORD_COLORS.darkEnergy], [8, 18, LORD_COLORS.darkEnergy], [9, 18, LORD_COLORS.darkEnergy], [10, 18, LORD_COLORS.darkEnergy],
    ] }
  ],
  [
    { pixels: [
      [8, 5, LORD_COLORS.eyeGlowLight], [9, 5, LORD_COLORS.eyeGlowLight],
      [8, 11, LORD_COLORS.darkBodyPurpleLight], [9, 11, LORD_COLORS.darkBodyPurpleLight],
      [7, 18, LORD_COLORS.darkEnergyGlow], [8, 18, LORD_COLORS.darkEnergyGlow], [9, 18, LORD_COLORS.darkEnergyGlow], [10, 18, LORD_COLORS.darkEnergyGlow],
      [8, 10, LORD_COLORS.spark], [9, 10, LORD_COLORS.spark],
      [8, 18, LORD_COLORS.sparkWhite], [9, 18, LORD_COLORS.sparkWhite],
    ] }
  ],
]

const LORD_WALK_FRAMES = [
  [
    { pixels: [
      [8, 11, LORD_COLORS.darkBody], [9, 11, LORD_COLORS.darkBody],
      [7, 18, LORD_COLORS.darkEnergy], [8, 18, LORD_COLORS.darkEnergy], [9, 18, LORD_COLORS.darkEnergy], [10, 18, LORD_COLORS.darkEnergy],
    ] }
  ],
  [
    { pixels: [
      [8, 11, LORD_COLORS.darkBodyPurple], [9, 11, LORD_COLORS.darkBodyPurple],
      [7, 18, LORD_COLORS.darkEnergyGlow], [8, 18, LORD_COLORS.darkEnergyGlow], [9, 18, LORD_COLORS.darkEnergyGlow], [10, 18, LORD_COLORS.darkEnergyGlow],
    ] }
  ],
  [
    { pixels: [
      [8, 11, LORD_COLORS.darkBodyPurpleLight], [9, 11, LORD_COLORS.darkBodyPurpleLight],
      [7, 18, LORD_COLORS.darkEnergyLight], [8, 18, LORD_COLORS.darkEnergyLight], [9, 18, LORD_COLORS.darkEnergyLight], [10, 18, LORD_COLORS.darkEnergyLight],
      [8, 17, LORD_COLORS.spark], [9, 17, LORD_COLORS.spark],
    ] }
  ],
]

export const drawShadowLord = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: LORD_FACE_DOWN,
  up: LORD_FACE_UP,
  left: LORD_FACE_LEFT,
  right: LORD_FACE_RIGHT,
  walk: LORD_WALK_FRAMES,
  idle: LORD_IDLE_FRAMES,
})

export const drawShadowLordAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, LORD_AVATAR)