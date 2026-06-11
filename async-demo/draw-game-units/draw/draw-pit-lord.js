import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.006,
  WALK_SPEED: 0.08,
}

const LORD_COLORS = {
  flesh: '#3A2A3A',
  fleshDark: '#2A1A2A',
  fleshLight: '#4A3A4A',
  fleshMid: '#352535',
  eyeWhite: '#E8D8D8',
  eyeWhiteDark: '#C8B8B8',
  eyeWhiteLight: '#FFF0F0',
  pupil: '#9933FF',
  pupilGlow: '#BB55FF',
  pupilDark: '#6600DD',
  pupilCore: '#FF00FF',
  tentacle: '#2A1A2A',
  tentacleLight: '#3A2A3A',
  tentacleDark: '#1A0A1A',
  tentacleTip: '#6600CC',
  tentacleSuction: '#4A3A4A',
  slime: '#3A1A3A',
  slimeLight: '#5A2A5A',
  slimeGlow: '#7733AA',
  abyss: '#5500AA',
  abyssGlow: '#7733CC',
  abyssLight: '#9944DD',
  particle: '#8833EE',
  particleLight: '#AA55FF',
  spark: '#FF00FF',
  vein: '#4A2A4A',
  veinGlow: '#6622AA',
  highlight: '#FFFFFF',
}

const LORD_AVATAR = [
  [4, 1, LORD_COLORS.tentacleDark], [5, 1, LORD_COLORS.tentacle], [6, 1, LORD_COLORS.tentacleLight], [7, 1, LORD_COLORS.tentacleTip], [8, 1, LORD_COLORS.tentacleTip], [9, 1, LORD_COLORS.tentacleLight], [10, 1, LORD_COLORS.tentacle], [11, 1, LORD_COLORS.tentacleDark],
  [3, 2, LORD_COLORS.tentacle], [4, 2, LORD_COLORS.tentacleLight], [5, 2, LORD_COLORS.tentacle], [6, 2, LORD_COLORS.tentacleTip], [7, 2, LORD_COLORS.tentacleSuction], [8, 2, LORD_COLORS.tentacleSuction], [9, 2, LORD_COLORS.tentacleTip], [10, 2, LORD_COLORS.tentacle], [11, 2, LORD_COLORS.tentacleLight], [12, 2, LORD_COLORS.tentacle],
  [3, 3, LORD_COLORS.tentacleDark], [4, 3, LORD_COLORS.tentacle], [5, 3, LORD_COLORS.tentacleLight], [6, 3, LORD_COLORS.tentacle], [7, 3, LORD_COLORS.tentacleTip], [8, 3, LORD_COLORS.tentacleTip], [9, 3, LORD_COLORS.tentacle], [10, 3, LORD_COLORS.tentacleLight], [11, 3, LORD_COLORS.tentacle], [12, 3, LORD_COLORS.tentacleDark],
  [2, 4, LORD_COLORS.fleshDark], [3, 4, LORD_COLORS.flesh], [4, 4, LORD_COLORS.eyeWhite], [5, 4, LORD_COLORS.eyeWhite], [6, 4, LORD_COLORS.eyeWhite], [7, 4, LORD_COLORS.eyeWhite], [8, 4, LORD_COLORS.eyeWhite], [9, 4, LORD_COLORS.eyeWhite], [10, 4, LORD_COLORS.eyeWhite], [11, 4, LORD_COLORS.eyeWhite], [12, 4, LORD_COLORS.flesh], [13, 4, LORD_COLORS.fleshDark],
  [2, 5, LORD_COLORS.flesh], [3, 5, LORD_COLORS.eyeWhiteDark], [4, 5, LORD_COLORS.eyeWhite], [5, 5, LORD_COLORS.pupil], [6, 5, LORD_COLORS.pupilGlow], [7, 5, LORD_COLORS.pupilCore], [8, 5, LORD_COLORS.pupilCore], [9, 5, LORD_COLORS.pupilGlow], [10, 5, LORD_COLORS.pupil], [11, 5, LORD_COLORS.eyeWhite], [12, 5, LORD_COLORS.eyeWhiteDark], [13, 5, LORD_COLORS.flesh],
  [5, 4, LORD_COLORS.highlight], [6, 4, LORD_COLORS.highlight], [9, 4, LORD_COLORS.highlight], [10, 4, LORD_COLORS.highlight],
  [5, 5, LORD_COLORS.highlight], [10, 5, LORD_COLORS.highlight],
  [5, 5, LORD_COLORS.pupilGlow], [6, 5, LORD_COLORS.pupilGlow], [9, 5, LORD_COLORS.pupilGlow], [10, 5, LORD_COLORS.pupilGlow],
  [5, 6, LORD_COLORS.pupilCore], [6, 6, LORD_COLORS.pupilCore], [9, 6, LORD_COLORS.pupilCore], [10, 6, LORD_COLORS.pupilCore],
  [2, 6, LORD_COLORS.fleshDark], [3, 6, LORD_COLORS.eyeWhite], [4, 6, LORD_COLORS.eyeWhite], [5, 6, LORD_COLORS.pupilGlow], [6, 6, LORD_COLORS.pupilCore], [7, 6, LORD_COLORS.pupilGlow], [8, 6, LORD_COLORS.pupilGlow], [9, 6, LORD_COLORS.pupilCore], [10, 6, LORD_COLORS.pupilGlow], [11, 6, LORD_COLORS.eyeWhite], [12, 6, LORD_COLORS.eyeWhite], [13, 6, LORD_COLORS.fleshDark],
  [2, 7, LORD_COLORS.flesh], [3, 7, LORD_COLORS.eyeWhiteDark], [4, 7, LORD_COLORS.eyeWhite], [5, 7, LORD_COLORS.pupil], [6, 7, LORD_COLORS.pupilGlow], [7, 7, LORD_COLORS.pupil], [8, 7, LORD_COLORS.pupil], [9, 7, LORD_COLORS.pupilGlow], [10, 7, LORD_COLORS.pupil], [11, 7, LORD_COLORS.eyeWhite], [12, 7, LORD_COLORS.eyeWhiteDark], [13, 7, LORD_COLORS.flesh],
  [3, 8, LORD_COLORS.fleshDark], [4, 8, LORD_COLORS.fleshMid], [5, 8, LORD_COLORS.eyeWhiteDark], [6, 8, LORD_COLORS.pupilGlow], [7, 8, LORD_COLORS.pupilCore], [8, 8, LORD_COLORS.pupilCore], [9, 8, LORD_COLORS.pupilGlow], [10, 8, LORD_COLORS.eyeWhiteDark], [11, 8, LORD_COLORS.fleshMid], [12, 8, LORD_COLORS.fleshDark],
  [5, 9, LORD_COLORS.eyeWhiteDark], [6, 9, LORD_COLORS.eyeWhite], [7, 9, LORD_COLORS.pupilGlow], [8, 9, LORD_COLORS.eyeWhite], [9, 9, LORD_COLORS.eyeWhiteDark],
  [5, 10, LORD_COLORS.eyeWhite], [6, 10, LORD_COLORS.pupil], [7, 10, LORD_COLORS.pupilGlow], [8, 10, LORD_COLORS.pupil], [9, 10, LORD_COLORS.eyeWhite],
  [5, 11, LORD_COLORS.eyeWhiteDark], [6, 11, LORD_COLORS.eyeWhite], [7, 11, LORD_COLORS.pupil], [8, 11, LORD_COLORS.eyeWhite], [9, 11, LORD_COLORS.eyeWhiteDark],
  [2, 9, LORD_COLORS.tentacleDark], [3, 9, LORD_COLORS.tentacle], [4, 9, LORD_COLORS.fleshMid], [10, 9, LORD_COLORS.fleshMid], [11, 9, LORD_COLORS.tentacle], [12, 9, LORD_COLORS.tentacleDark],
  [2, 10, LORD_COLORS.tentacle], [3, 10, LORD_COLORS.tentacleLight], [4, 10, LORD_COLORS.tentacleSuction], [10, 10, LORD_COLORS.tentacleSuction], [11, 10, LORD_COLORS.tentacleLight], [12, 10, LORD_COLORS.tentacle],
  [3, 11, LORD_COLORS.tentacleDark], [4, 11, LORD_COLORS.tentacle], [5, 11, LORD_COLORS.tentacleTip], [6, 11, LORD_COLORS.slimeGlow], [7, 11, LORD_COLORS.slimeGlow], [8, 11, LORD_COLORS.slimeGlow], [9, 11, LORD_COLORS.tentacleTip], [10, 11, LORD_COLORS.tentacle], [11, 11, LORD_COLORS.tentacleDark],
  [3, 12, LORD_COLORS.tentacle], [4, 12, LORD_COLORS.tentacleLight], [5, 12, LORD_COLORS.tentacleTip], [6, 12, LORD_COLORS.slimeGlow], [7, 12, LORD_COLORS.tentacleTip], [8, 12, LORD_COLORS.slimeGlow], [9, 12, LORD_COLORS.tentacleTip], [10, 12, LORD_COLORS.tentacleLight], [11, 12, LORD_COLORS.tentacle],
  [4, 13, LORD_COLORS.tentacleDark], [5, 13, LORD_COLORS.tentacle], [6, 13, LORD_COLORS.slimeGlow], [7, 13, LORD_COLORS.tentacleTip], [8, 13, LORD_COLORS.tentacleTip], [9, 13, LORD_COLORS.slimeGlow], [10, 13, LORD_COLORS.tentacle], [11, 13, LORD_COLORS.tentacleDark],
  [0, 6, LORD_COLORS.particle], [1, 8, LORD_COLORS.particleLight], [14, 6, LORD_COLORS.particle], [13, 8, LORD_COLORS.particleLight],
  [0, 7, LORD_COLORS.spark], [14, 7, LORD_COLORS.spark],
]

const LORD_FACE_DOWN = [
  [7, 2, LORD_COLORS.tentacle], [8, 2, LORD_COLORS.tentacleLight], [9, 2, LORD_COLORS.tentacleTip], [10, 2, LORD_COLORS.tentacleTip], [11, 2, LORD_COLORS.tentacleLight], [12, 2, LORD_COLORS.tentacle],
  [6, 3, LORD_COLORS.tentacleDark], [7, 3, LORD_COLORS.tentacle], [8, 3, LORD_COLORS.tentacleLight], [9, 3, LORD_COLORS.tentacleTip], [10, 3, LORD_COLORS.tentacleTip], [11, 3, LORD_COLORS.tentacleLight], [12, 3, LORD_COLORS.tentacle], [13, 3, LORD_COLORS.tentacleDark],
  [6, 4, LORD_COLORS.tentacle], [7, 4, LORD_COLORS.tentacleLight], [8, 4, LORD_COLORS.tentacle], [9, 4, LORD_COLORS.tentacleSuction], [10, 4, LORD_COLORS.tentacleSuction], [11, 4, LORD_COLORS.tentacle], [12, 4, LORD_COLORS.tentacleLight], [13, 4, LORD_COLORS.tentacle],
  [6, 5, LORD_COLORS.eyeWhiteDark], [7, 5, LORD_COLORS.eyeWhite], [8, 5, LORD_COLORS.eyeWhite], [9, 5, LORD_COLORS.eyeWhite], [10, 5, LORD_COLORS.eyeWhite], [11, 5, LORD_COLORS.eyeWhite], [12, 5, LORD_COLORS.eyeWhite], [13, 5, LORD_COLORS.eyeWhiteDark],
  [6, 6, LORD_COLORS.eyeWhite], [7, 6, LORD_COLORS.pupil], [8, 6, LORD_COLORS.pupilGlow], [9, 6, LORD_COLORS.pupilCore], [10, 6, LORD_COLORS.pupilCore], [11, 6, LORD_COLORS.pupilGlow], [12, 6, LORD_COLORS.pupil], [13, 6, LORD_COLORS.eyeWhite],
  [6, 7, LORD_COLORS.eyeWhite], [7, 7, LORD_COLORS.pupilGlow], [8, 7, LORD_COLORS.pupilCore], [9, 7, LORD_COLORS.pupilGlow], [10, 7, LORD_COLORS.pupilGlow], [11, 7, LORD_COLORS.pupilCore], [12, 7, LORD_COLORS.pupilGlow], [13, 7, LORD_COLORS.eyeWhite],
  [6, 8, LORD_COLORS.eyeWhiteDark], [7, 8, LORD_COLORS.pupil], [8, 8, LORD_COLORS.pupilGlow], [9, 8, LORD_COLORS.pupil], [10, 8, LORD_COLORS.pupil], [11, 8, LORD_COLORS.pupilGlow], [12, 8, LORD_COLORS.pupil], [13, 8, LORD_COLORS.eyeWhiteDark],
  [4, 6, LORD_COLORS.fleshDark], [5, 6, LORD_COLORS.flesh], [14, 6, LORD_COLORS.flesh], [15, 6, LORD_COLORS.fleshDark],
  [4, 7, LORD_COLORS.flesh], [5, 7, LORD_COLORS.fleshLight], [14, 7, LORD_COLORS.fleshLight], [15, 7, LORD_COLORS.flesh],
  [4, 8, LORD_COLORS.fleshDark], [5, 8, LORD_COLORS.fleshMid], [14, 8, LORD_COLORS.fleshMid], [15, 8, LORD_COLORS.fleshDark],
  [5, 9, LORD_COLORS.fleshDark], [6, 9, LORD_COLORS.fleshMid], [13, 9, LORD_COLORS.fleshMid], [14, 9, LORD_COLORS.fleshDark],
  [7, 9, LORD_COLORS.eyeWhiteDark], [8, 9, LORD_COLORS.eyeWhite], [9, 9, LORD_COLORS.pupilGlow], [10, 9, LORD_COLORS.eyeWhite], [11, 9, LORD_COLORS.eyeWhiteDark],
  [7, 10, LORD_COLORS.eyeWhite], [8, 10, LORD_COLORS.pupil], [9, 10, LORD_COLORS.pupilGlow], [10, 10, LORD_COLORS.pupil], [11, 10, LORD_COLORS.eyeWhite],
  [7, 11, LORD_COLORS.eyeWhiteDark], [8, 11, LORD_COLORS.eyeWhite], [9, 11, LORD_COLORS.pupil], [10, 11, LORD_COLORS.eyeWhite], [11, 11, LORD_COLORS.eyeWhiteDark],
  [5, 10, LORD_COLORS.tentacleDark], [6, 10, LORD_COLORS.tentacle], [12, 10, LORD_COLORS.tentacle], [13, 10, LORD_COLORS.tentacleDark],
  [5, 11, LORD_COLORS.tentacle], [6, 11, LORD_COLORS.tentacleLight], [7, 11, LORD_COLORS.tentacleSuction], [12, 11, LORD_COLORS.tentacleSuction], [13, 11, LORD_COLORS.tentacleLight], [14, 11, LORD_COLORS.tentacle],
  [4, 12, LORD_COLORS.tentacleDark], [5, 12, LORD_COLORS.tentacle], [6, 12, LORD_COLORS.tentacleLight], [7, 12, LORD_COLORS.tentacleTip], [12, 12, LORD_COLORS.tentacleTip], [13, 12, LORD_COLORS.tentacleLight], [14, 12, LORD_COLORS.tentacle], [15, 12, LORD_COLORS.tentacleDark],
  [4, 13, LORD_COLORS.tentacle], [5, 13, LORD_COLORS.tentacleLight], [6, 13, LORD_COLORS.tentacle], [7, 13, LORD_COLORS.tentacleTip], [12, 13, LORD_COLORS.tentacleTip], [13, 13, LORD_COLORS.tentacle], [14, 13, LORD_COLORS.tentacleLight], [15, 13, LORD_COLORS.tentacle],
  [5, 14, LORD_COLORS.tentacleDark], [6, 14, LORD_COLORS.tentacleLight], [7, 14, LORD_COLORS.tentacle], [8, 14, LORD_COLORS.tentacleTip], [9, 14, LORD_COLORS.tentacleTip], [10, 14, LORD_COLORS.tentacleTip], [11, 14, LORD_COLORS.tentacleTip], [12, 14, LORD_COLORS.tentacle], [13, 14, LORD_COLORS.tentacleLight], [14, 14, LORD_COLORS.tentacleDark],
  [6, 15, LORD_COLORS.tentacle], [7, 15, LORD_COLORS.tentacleLight], [8, 15, LORD_COLORS.tentacle], [9, 15, LORD_COLORS.slimeGlow], [10, 15, LORD_COLORS.slimeGlow], [11, 15, LORD_COLORS.tentacle], [12, 15, LORD_COLORS.tentacleLight], [13, 15, LORD_COLORS.tentacle],
  [2, 7, LORD_COLORS.particle], [16, 7, LORD_COLORS.particle],
  [3, 9, LORD_COLORS.particleLight], [15, 9, LORD_COLORS.particleLight],
  [8, 2, LORD_COLORS.abyssGlow], [10, 2, LORD_COLORS.abyssGlow],
]

const LORD_FACE_UP = [
  [7, 2, LORD_COLORS.tentacle], [8, 2, LORD_COLORS.tentacleLight], [9, 2, LORD_COLORS.tentacleTip], [10, 2, LORD_COLORS.tentacleTip], [11, 2, LORD_COLORS.tentacleLight], [12, 2, LORD_COLORS.tentacle],
  [6, 3, LORD_COLORS.tentacleDark], [7, 3, LORD_COLORS.tentacle], [8, 3, LORD_COLORS.tentacleLight], [9, 3, LORD_COLORS.tentacleTip], [10, 3, LORD_COLORS.tentacleTip], [11, 3, LORD_COLORS.tentacleLight], [12, 3, LORD_COLORS.tentacle], [13, 3, LORD_COLORS.tentacleDark],
  [6, 4, LORD_COLORS.tentacle], [7, 4, LORD_COLORS.tentacleLight], [8, 4, LORD_COLORS.tentacleSuction], [9, 4, LORD_COLORS.tentacleSuction], [10, 4, LORD_COLORS.tentacleSuction], [11, 4, LORD_COLORS.tentacleLight], [12, 4, LORD_COLORS.tentacle],
  [5, 5, LORD_COLORS.fleshDark], [6, 5, LORD_COLORS.flesh], [7, 5, LORD_COLORS.fleshMid], [8, 5, LORD_COLORS.vein], [9, 5, LORD_COLORS.vein], [10, 5, LORD_COLORS.fleshMid], [11, 5, LORD_COLORS.flesh], [12, 5, LORD_COLORS.fleshDark],
  [4, 6, LORD_COLORS.fleshDark], [5, 6, LORD_COLORS.flesh], [6, 6, LORD_COLORS.vein], [7, 6, LORD_COLORS.fleshMid], [8, 6, LORD_COLORS.veinGlow], [9, 6, LORD_COLORS.veinGlow], [10, 6, LORD_COLORS.fleshMid], [11, 6, LORD_COLORS.vein], [12, 6, LORD_COLORS.flesh], [13, 6, LORD_COLORS.fleshDark],
  [4, 7, LORD_COLORS.flesh], [5, 7, LORD_COLORS.fleshLight], [6, 7, LORD_COLORS.fleshMid], [7, 7, LORD_COLORS.vein], [8, 7, LORD_COLORS.slime], [9, 7, LORD_COLORS.slime], [10, 7, LORD_COLORS.vein], [11, 7, LORD_COLORS.fleshMid], [12, 7, LORD_COLORS.fleshLight], [13, 7, LORD_COLORS.flesh],
  [4, 8, LORD_COLORS.fleshDark], [5, 8, LORD_COLORS.fleshMid], [6, 8, LORD_COLORS.slime], [7, 8, LORD_COLORS.vein], [8, 8, LORD_COLORS.slimeLight], [9, 8, LORD_COLORS.slimeLight], [10, 8, LORD_COLORS.vein], [11, 8, LORD_COLORS.slime], [12, 8, LORD_COLORS.fleshMid], [13, 8, LORD_COLORS.fleshDark],
  [5, 9, LORD_COLORS.fleshDark], [6, 9, LORD_COLORS.flesh], [7, 9, LORD_COLORS.fleshLight], [8, 9, LORD_COLORS.vein], [9, 9, LORD_COLORS.vein], [10, 9, LORD_COLORS.fleshLight], [11, 9, LORD_COLORS.flesh], [12, 9, LORD_COLORS.fleshDark],
  [5, 10, LORD_COLORS.fleshDark], [6, 10, LORD_COLORS.fleshMid], [7, 10, LORD_COLORS.vein], [8, 10, LORD_COLORS.fleshMid], [9, 10, LORD_COLORS.fleshMid], [10, 10, LORD_COLORS.vein], [11, 10, LORD_COLORS.fleshMid], [12, 10, LORD_COLORS.fleshDark],
  [7, 8, LORD_COLORS.eyeWhiteDark], [8, 8, LORD_COLORS.eyeWhite], [9, 8, LORD_COLORS.pupilGlow], [10, 8, LORD_COLORS.eyeWhite], [11, 8, LORD_COLORS.eyeWhiteDark],
  [5, 11, LORD_COLORS.tentacleDark], [6, 11, LORD_COLORS.tentacle], [7, 11, LORD_COLORS.tentacleLight], [8, 11, LORD_COLORS.tentacleTip], [9, 11, LORD_COLORS.tentacleTip], [10, 11, LORD_COLORS.tentacleTip], [11, 11, LORD_COLORS.tentacleLight], [12, 11, LORD_COLORS.tentacle], [13, 11, LORD_COLORS.tentacleDark],
  [4, 12, LORD_COLORS.tentacle], [5, 12, LORD_COLORS.tentacleLight], [6, 12, LORD_COLORS.tentacle], [7, 12, LORD_COLORS.tentacleTip], [8, 12, LORD_COLORS.tentacleSuction], [9, 12, LORD_COLORS.slimeGlow], [10, 12, LORD_COLORS.tentacleSuction], [11, 12, LORD_COLORS.tentacleTip], [12, 12, LORD_COLORS.tentacle], [13, 12, LORD_COLORS.tentacleLight], [14, 12, LORD_COLORS.tentacle],
  [4, 13, LORD_COLORS.tentacleDark], [5, 13, LORD_COLORS.tentacle], [6, 13, LORD_COLORS.tentacleLight], [7, 13, LORD_COLORS.tentacleTip], [12, 13, LORD_COLORS.tentacleTip], [13, 13, LORD_COLORS.tentacleLight], [14, 13, LORD_COLORS.tentacle], [15, 13, LORD_COLORS.tentacleDark],
  [5, 14, LORD_COLORS.tentacle], [6, 14, LORD_COLORS.tentacleLight], [7, 14, LORD_COLORS.tentacle], [8, 14, LORD_COLORS.tentacleTip], [9, 14, LORD_COLORS.slimeGlow], [10, 14, LORD_COLORS.slimeGlow], [11, 14, LORD_COLORS.tentacleTip], [12, 14, LORD_COLORS.tentacle], [13, 14, LORD_COLORS.tentacleLight], [14, 14, LORD_COLORS.tentacle],
]

const LORD_FACE_LEFT = [
  [7, 2, LORD_COLORS.tentacle], [8, 2, LORD_COLORS.tentacleLight],
  [6, 3, LORD_COLORS.tentacleDark], [7, 3, LORD_COLORS.tentacle], [8, 3, LORD_COLORS.tentacleTip],
  [6, 4, LORD_COLORS.tentacle], [7, 4, LORD_COLORS.tentacleLight], [8, 4, LORD_COLORS.tentacleSuction],
  [5, 5, LORD_COLORS.tentacleDark], [6, 5, LORD_COLORS.tentacle], [7, 5, LORD_COLORS.tentacleTip],
  [5, 6, LORD_COLORS.tentacle], [6, 6, LORD_COLORS.tentacleLight], [7, 6, LORD_COLORS.tentacleSuction],
  [6, 7, LORD_COLORS.eyeWhiteDark], [7, 7, LORD_COLORS.eyeWhite], [8, 7, LORD_COLORS.eyeWhite], [9, 7, LORD_COLORS.fleshDark],
  [6, 8, LORD_COLORS.eyeWhite], [7, 8, LORD_COLORS.pupilGlow], [8, 8, LORD_COLORS.pupilCore], [9, 8, LORD_COLORS.eyeWhiteDark],
  [6, 9, LORD_COLORS.eyeWhite], [7, 9, LORD_COLORS.pupil], [8, 9, LORD_COLORS.pupilGlow], [9, 9, LORD_COLORS.eyeWhite],
  [6, 10, LORD_COLORS.eyeWhiteDark], [7, 10, LORD_COLORS.eyeWhite], [8, 10, LORD_COLORS.pupil], [9, 10, LORD_COLORS.eyeWhiteDark],
  [6, 11, LORD_COLORS.fleshDark], [7, 11, LORD_COLORS.eyeWhite], [8, 11, LORD_COLORS.eyeWhite], [9, 11, LORD_COLORS.fleshDark],
  [5, 7, LORD_COLORS.flesh], [5, 8, LORD_COLORS.fleshLight], [5, 9, LORD_COLORS.fleshMid], [5, 10, LORD_COLORS.flesh],
  [10, 7, LORD_COLORS.fleshDark], [10, 8, LORD_COLORS.flesh], [10, 9, LORD_COLORS.fleshLight], [10, 10, LORD_COLORS.fleshDark],
  [4, 8, LORD_COLORS.fleshDark], [4, 9, LORD_COLORS.flesh], [4, 10, LORD_COLORS.fleshDark],
  [11, 8, LORD_COLORS.fleshDark], [11, 9, LORD_COLORS.flesh], [11, 10, LORD_COLORS.fleshDark],
  [4, 7, LORD_COLORS.tentacleDark], [4, 11, LORD_COLORS.tentacleDark],
  [11, 7, LORD_COLORS.tentacle], [11, 11, LORD_COLORS.tentacle],
  [5, 12, LORD_COLORS.tentacle], [6, 12, LORD_COLORS.tentacleLight], [7, 12, LORD_COLORS.tentacleTip],
  [5, 13, LORD_COLORS.tentacleDark], [6, 13, LORD_COLORS.tentacle], [7, 13, LORD_COLORS.tentacleLight], [8, 13, LORD_COLORS.tentacleTip],
  [6, 14, LORD_COLORS.tentacleDark], [7, 14, LORD_COLORS.tentacle], [8, 14, LORD_COLORS.tentacleLight], [9, 14, LORD_COLORS.slimeGlow],
  [7, 15, LORD_COLORS.tentacleDark], [8, 15, LORD_COLORS.tentacleLight], [9, 15, LORD_COLORS.tentacle], [10, 15, LORD_COLORS.tentacleDark],
  [2, 8, LORD_COLORS.particle], [2, 10, LORD_COLORS.particleLight],
  [12, 9, LORD_COLORS.abyssGlow],
]

const LORD_FACE_RIGHT = [
  [8, 2, LORD_COLORS.tentacleLight], [9, 2, LORD_COLORS.tentacle],
  [8, 3, LORD_COLORS.tentacleTip], [9, 3, LORD_COLORS.tentacle], [10, 3, LORD_COLORS.tentacleDark],
  [8, 4, LORD_COLORS.tentacleSuction], [9, 4, LORD_COLORS.tentacleLight], [10, 4, LORD_COLORS.tentacle],
  [8, 5, LORD_COLORS.tentacleTip], [9, 5, LORD_COLORS.tentacle], [10, 5, LORD_COLORS.tentacleDark],
  [8, 6, LORD_COLORS.tentacleSuction], [9, 6, LORD_COLORS.tentacleLight], [10, 6, LORD_COLORS.tentacle],
  [7, 7, LORD_COLORS.fleshDark], [8, 7, LORD_COLORS.eyeWhite], [9, 7, LORD_COLORS.eyeWhite], [10, 7, LORD_COLORS.eyeWhiteDark],
  [7, 8, LORD_COLORS.eyeWhiteDark], [8, 8, LORD_COLORS.pupilCore], [9, 8, LORD_COLORS.pupilGlow], [10, 8, LORD_COLORS.eyeWhite],
  [7, 9, LORD_COLORS.eyeWhite], [8, 9, LORD_COLORS.pupilGlow], [9, 9, LORD_COLORS.pupil], [10, 9, LORD_COLORS.eyeWhite],
  [7, 10, LORD_COLORS.eyeWhiteDark], [8, 10, LORD_COLORS.pupil], [9, 10, LORD_COLORS.eyeWhite], [10, 10, LORD_COLORS.eyeWhiteDark],
  [7, 11, LORD_COLORS.fleshDark], [8, 11, LORD_COLORS.eyeWhite], [9, 11, LORD_COLORS.eyeWhite], [10, 11, LORD_COLORS.fleshDark],
  [11, 7, LORD_COLORS.flesh], [11, 8, LORD_COLORS.fleshLight], [11, 9, LORD_COLORS.fleshMid], [11, 10, LORD_COLORS.flesh],
  [6, 7, LORD_COLORS.fleshDark], [6, 8, LORD_COLORS.flesh], [6, 9, LORD_COLORS.fleshLight], [6, 10, LORD_COLORS.fleshDark],
  [12, 8, LORD_COLORS.fleshDark], [12, 9, LORD_COLORS.flesh], [12, 10, LORD_COLORS.fleshDark],
  [5, 8, LORD_COLORS.fleshDark], [5, 9, LORD_COLORS.flesh], [5, 10, LORD_COLORS.fleshDark],
  [12, 7, LORD_COLORS.tentacleDark], [12, 11, LORD_COLORS.tentacleDark],
  [5, 7, LORD_COLORS.tentacle], [5, 11, LORD_COLORS.tentacle],
  [9, 12, LORD_COLORS.tentacleTip], [10, 12, LORD_COLORS.tentacleLight], [11, 12, LORD_COLORS.tentacle],
  [8, 13, LORD_COLORS.slimeGlow], [9, 13, LORD_COLORS.tentacleLight], [10, 13, LORD_COLORS.tentacle], [11, 13, LORD_COLORS.tentacleDark],
  [7, 14, LORD_COLORS.tentacleDark], [8, 14, LORD_COLORS.tentacleLight], [9, 14, LORD_COLORS.slimeGlow], [10, 14, LORD_COLORS.tentacle], [11, 14, LORD_COLORS.tentacleDark],
  [6, 15, LORD_COLORS.tentacleDark], [7, 15, LORD_COLORS.tentacleLight], [8, 15, LORD_COLORS.tentacle], [9, 15, LORD_COLORS.tentacleLight], [10, 15, LORD_COLORS.tentacle],
  [14, 8, LORD_COLORS.particle], [14, 10, LORD_COLORS.particleLight],
  [4, 9, LORD_COLORS.abyssGlow],
]

const LORD_IDLE_FRAMES = [
  [
    { pixels: [
      [8, 6, LORD_COLORS.pupilGlow], [9, 6, LORD_COLORS.pupilCore], [10, 6, LORD_COLORS.pupilCore], [11, 6, LORD_COLORS.pupilGlow],
      [8, 7, LORD_COLORS.pupilCore], [9, 7, LORD_COLORS.pupilGlow], [10, 7, LORD_COLORS.pupilGlow], [11, 7, LORD_COLORS.pupilCore],
      [8, 8, LORD_COLORS.pupilGlow], [9, 8, LORD_COLORS.pupil], [10, 8, LORD_COLORS.pupil], [11, 8, LORD_COLORS.pupilGlow],
    ] }
  ],
  [
    { pixels: [
      [7, 6, LORD_COLORS.pupil], [8, 6, LORD_COLORS.pupilCore], [9, 6, LORD_COLORS.pupilCore], [10, 6, LORD_COLORS.pupilCore], [11, 6, LORD_COLORS.pupil],
      [7, 7, LORD_COLORS.pupilCore], [8, 7, LORD_COLORS.spark], [9, 7, LORD_COLORS.spark], [10, 7, LORD_COLORS.spark], [11, 7, LORD_COLORS.pupilCore],
      [7, 8, LORD_COLORS.pupil], [8, 8, LORD_COLORS.pupilCore], [9, 8, LORD_COLORS.pupilCore], [10, 8, LORD_COLORS.pupilCore], [11, 8, LORD_COLORS.pupil],
      [9, 2, LORD_COLORS.abyssGlow], [10, 2, LORD_COLORS.abyssGlow],
      [2, 7, LORD_COLORS.spark], [16, 7, LORD_COLORS.spark],
    ] }
  ],
]

const LORD_WALK_FRAMES = [
  [
    { pixels: [
      [7, 2, LORD_COLORS.tentacle], [8, 2, LORD_COLORS.tentacleLight], [11, 2, LORD_COLORS.tentacleLight],
    ] }
  ],
  [
    { pixels: [
      [7, 2, LORD_COLORS.tentacleLight], [8, 2, LORD_COLORS.tentacleTip], [9, 2, LORD_COLORS.abyssGlow], [11, 2, LORD_COLORS.tentacleTip],
    ] }
  ],
  [
    { pixels: [
      [7, 2, LORD_COLORS.tentacle], [8, 2, LORD_COLORS.tentacleTip], [10, 2, LORD_COLORS.tentacleLight], [11, 2, LORD_COLORS.tentacle],
    ] }
  ],
]

export const drawPitLord = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: LORD_FACE_DOWN,
  up: LORD_FACE_UP,
  left: LORD_FACE_LEFT,
  right: LORD_FACE_RIGHT,
  walk: LORD_WALK_FRAMES,
  idle: LORD_IDLE_FRAMES,
})

export const drawPitLordAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, LORD_AVATAR)