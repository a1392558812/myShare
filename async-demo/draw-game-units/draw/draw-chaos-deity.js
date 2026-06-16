import { drawUnit, drawAvatar } from '../draw-utils.js'
export const config = {
  IDLE_SPEED: 0.004,
  WALK_SPEED: 0.1,
}

const DEITY_COLORS = {
  helm: '#3A3A4A',
  helmDark: '#2A2A3A',
  helmLight: '#5A5A6A',
  helmGold: '#7A6A3A',
  helmGoldLight: '#9A8A5A',
  helmRust: '#5A4A3A',
  helmDirt: '#4A4A4A',
  
  eye: '#CC0000',
  eyeGlow: '#FF3333',
  eyeInner: '#FF6666',
  eyeChaos: '#CC00CC',
  eyeChaosGlow: '#FF44FF',
  
  armor: '#3A3A4A',
  armorDark: '#2A2A3A',
  armorLight: '#4A4A5A',
  armorPlate: '#4A4A5A',
  armorPlateLight: '#5A5A6A',
  armorCorrupt: '#1A0A2A',
  armorRust: '#5A4A3A',
  armorDirt: '#4A4A4A',
  armorScratch: '#2A2A2A',
  
  chaos: '#CC00CC',
  chaosGlow: '#FF44FF',
  chaosDark: '#880088',
  chaosLight: '#FF66FF',
  
  cape: '#1A0A1A',
  capeDark: '#0A000A',
  capeLight: '#2A1A2A',
  capeChaos: '#330088',
  
  sword: '#6A6A7A',
  swordDark: '#4A4A5A',
  swordLight: '#8A8A9A',
  swordHandle: '#4A3A2A',
  swordGuard: '#8A7A4A',
  swordChaos: '#CC00CC',
  swordRust: '#5A4A3A',
  
  shield: '#3A3A4A',
  shieldDark: '#2A2A3A',
  shieldLight: '#4A4A5A',
  shieldGold: '#8A7A4A',
  shieldChaos: '#CC00CC',
  shieldCrack: '#1A1A2A',
  
  gauntlet: '#4A4A5A',
  gauntletDark: '#3A3A4A',
  gauntletLight: '#5A5A6A',
  
  belt: '#3A3A4A',
  beltGold: '#8A7A4A',
  beltBuckle: '#7A6A3A',
  
  legArmor: '#3A3A4A',
  legArmorDark: '#2A2A3A',
  legArmorLight: '#4A4A5A',
  boot: '#2A2A3A',
  bootDark: '#1A1A2A',
  bootLight: '#3A3A4A',
  bootSteel: '#4A4A5A',
  
  chaosEnergy: '#CC00CC',
  chaosEnergyGlow: '#FF44FF',
  spark: '#FF66FF',
  sparkWhite: '#FFFFFF',
  
  crack: '#0A001A',
  crackGlow: '#CC00CC',
  highlight: '#FFFFFF',
}

const DEITY_AVATAR = [
  [3, 0, DEITY_COLORS.helmDark], [4, 0, DEITY_COLORS.helmDark], [5, 0, DEITY_COLORS.helm], [6, 0, DEITY_COLORS.helm], [7, 0, DEITY_COLORS.helm], [8, 0, DEITY_COLORS.helm], [9, 0, DEITY_COLORS.helmDark], [10, 0, DEITY_COLORS.helmDark], [11, 0, DEITY_COLORS.helmRust],
  [2, 1, DEITY_COLORS.helmDark], [3, 1, DEITY_COLORS.helm], [4, 1, DEITY_COLORS.helmLight], [5, 1, DEITY_COLORS.helm], [6, 1, DEITY_COLORS.helm], [7, 1, DEITY_COLORS.helm], [8, 1, DEITY_COLORS.helm], [9, 1, DEITY_COLORS.helmLight], [10, 1, DEITY_COLORS.helm], [11, 1, DEITY_COLORS.helmDark], [12, 1, DEITY_COLORS.helmRust],
  [2, 2, DEITY_COLORS.helmDark], [3, 2, DEITY_COLORS.helmGold], [4, 2, DEITY_COLORS.helm], [5, 2, DEITY_COLORS.helmLight], [6, 2, DEITY_COLORS.helmLight], [7, 2, DEITY_COLORS.helmLight], [8, 2, DEITY_COLORS.helm], [9, 2, DEITY_COLORS.helmGold], [10, 2, DEITY_COLORS.helmDark], [11, 2, DEITY_COLORS.helmRust], [12, 2, DEITY_COLORS.helmRust],

  [1, 3, DEITY_COLORS.helmDark], [2, 3, DEITY_COLORS.helm], [3, 3, DEITY_COLORS.helmGold], [4, 3, DEITY_COLORS.helm], [5, 3, DEITY_COLORS.helmLight], [6, 3, DEITY_COLORS.helm], [7, 3, DEITY_COLORS.helm], [8, 3, DEITY_COLORS.helmLight], [9, 3, DEITY_COLORS.helm], [10, 3, DEITY_COLORS.helmGold], [11, 3, DEITY_COLORS.helm], [12, 3, DEITY_COLORS.helmDark], [13, 3, DEITY_COLORS.helmRust],
  [1, 4, DEITY_COLORS.helmDark], [2, 4, DEITY_COLORS.helm], [3, 4, DEITY_COLORS.helmLight], [4, 4, DEITY_COLORS.helm], [5, 4, DEITY_COLORS.helmLight], [6, 4, DEITY_COLORS.helm], [7, 4, DEITY_COLORS.helm], [8, 4, DEITY_COLORS.helmLight], [9, 4, DEITY_COLORS.helm], [10, 4, DEITY_COLORS.helmLight], [11, 4, DEITY_COLORS.helm], [12, 4, DEITY_COLORS.helmDark], [13, 4, DEITY_COLORS.helmRust],

  [1, 5, DEITY_COLORS.helmDark], [2, 5, DEITY_COLORS.helm], [3, 5, DEITY_COLORS.eyeChaos], [4, 5, DEITY_COLORS.eyeChaosGlow], [5, 5, DEITY_COLORS.eyeGlow], [6, 5, DEITY_COLORS.eyeGlow], [7, 5, DEITY_COLORS.eyeGlow], [8, 5, DEITY_COLORS.eyeGlow], [9, 5, DEITY_COLORS.eyeChaosGlow], [10, 5, DEITY_COLORS.eyeChaos], [11, 5, DEITY_COLORS.helm], [12, 5, DEITY_COLORS.helmDark], [13, 5, DEITY_COLORS.helmRust],
  [4, 4, DEITY_COLORS.highlight], [5, 4, DEITY_COLORS.highlight], [9, 4, DEITY_COLORS.highlight], [10, 4, DEITY_COLORS.highlight],
  [4, 5, DEITY_COLORS.highlight], [10, 5, DEITY_COLORS.highlight],

  [4, 5, DEITY_COLORS.eyeChaosGlow], [5, 5, DEITY_COLORS.eyeChaosGlow], [9, 5, DEITY_COLORS.eyeChaosGlow], [10, 5, DEITY_COLORS.eyeChaosGlow],
  [4, 6, DEITY_COLORS.eyeInner], [5, 6, DEITY_COLORS.eyeInner], [9, 6, DEITY_COLORS.eyeInner], [10, 6, DEITY_COLORS.eyeInner],

  [1, 6, DEITY_COLORS.helmDark], [2, 6, DEITY_COLORS.helm], [3, 6, DEITY_COLORS.eyeChaosGlow], [4, 6, DEITY_COLORS.eyeInner], [5, 6, DEITY_COLORS.eyeInner], [6, 6, DEITY_COLORS.eye], [7, 6, DEITY_COLORS.eye], [8, 6, DEITY_COLORS.eye], [9, 6, DEITY_COLORS.eyeInner], [10, 6, DEITY_COLORS.eyeInner], [11, 6, DEITY_COLORS.eyeChaosGlow], [12, 6, DEITY_COLORS.helm], [13, 6, DEITY_COLORS.helmDark],
  [2, 7, DEITY_COLORS.helmDark], [3, 7, DEITY_COLORS.helm], [4, 7, DEITY_COLORS.chaosDark], [5, 7, DEITY_COLORS.chaos], [6, 7, DEITY_COLORS.chaosDark], [7, 7, DEITY_COLORS.chaosDark], [8, 7, DEITY_COLORS.chaosDark], [9, 7, DEITY_COLORS.chaos], [10, 7, DEITY_COLORS.chaosDark], [11, 7, DEITY_COLORS.helm], [12, 7, DEITY_COLORS.helmDark],

  [2, 8, DEITY_COLORS.helmRust], [3, 8, DEITY_COLORS.helmDark], [4, 8, DEITY_COLORS.chaosGlow], [5, 8, DEITY_COLORS.chaosDark], [6, 8, DEITY_COLORS.chaos], [7, 8, DEITY_COLORS.chaos], [8, 8, DEITY_COLORS.chaos], [9, 8, DEITY_COLORS.chaosDark], [10, 8, DEITY_COLORS.chaosGlow], [11, 8, DEITY_COLORS.helmDark], [12, 8, DEITY_COLORS.helmRust],
  [3, 9, DEITY_COLORS.helmRust], [4, 9, DEITY_COLORS.helmDirt], [5, 9, DEITY_COLORS.chaos], [6, 9, DEITY_COLORS.chaosDark], [7, 9, DEITY_COLORS.chaosDark], [8, 9, DEITY_COLORS.chaosDark], [9, 9, DEITY_COLORS.chaos], [10, 9, DEITY_COLORS.chaosDark], [11, 9, DEITY_COLORS.helmDirt], [12, 9, DEITY_COLORS.helmRust],

  [0, 10, DEITY_COLORS.armorDark], [1, 10, DEITY_COLORS.armor], [2, 10, DEITY_COLORS.armorPlate], [3, 10, DEITY_COLORS.armorPlateLight], [4, 10, DEITY_COLORS.chaos], [5, 10, DEITY_COLORS.chaosGlow], [6, 10, DEITY_COLORS.chaosGlow], [7, 10, DEITY_COLORS.chaosGlow], [8, 10, DEITY_COLORS.chaosGlow], [9, 10, DEITY_COLORS.chaos], [10, 10, DEITY_COLORS.armorPlateLight], [11, 10, DEITY_COLORS.armorPlate], [12, 10, DEITY_COLORS.armor], [13, 10, DEITY_COLORS.armorDark], [14, 10, DEITY_COLORS.armorDark],
  [0, 11, DEITY_COLORS.armorDark], [1, 11, DEITY_COLORS.armor], [2, 11, DEITY_COLORS.armorPlate], [3, 11, DEITY_COLORS.armorPlateLight], [4, 11, DEITY_COLORS.chaosDark], [5, 11, DEITY_COLORS.chaos], [6, 11, DEITY_COLORS.chaos], [7, 11, DEITY_COLORS.chaos], [8, 11, DEITY_COLORS.chaos], [9, 11, DEITY_COLORS.chaosDark], [10, 11, DEITY_COLORS.armorPlateLight], [11, 11, DEITY_COLORS.armorPlate], [12, 11, DEITY_COLORS.armor], [13, 11, DEITY_COLORS.armorDark], [14, 11, DEITY_COLORS.armorDark],

  [4, 8, DEITY_COLORS.crackGlow], [5, 9, DEITY_COLORS.crack], [9, 9, DEITY_COLORS.crack], [10, 8, DEITY_COLORS.crackGlow],
  [5, 10, DEITY_COLORS.sparkWhite], [6, 10, DEITY_COLORS.spark], [9, 10, DEITY_COLORS.spark], [10, 10, DEITY_COLORS.sparkWhite],

  [2, 12, DEITY_COLORS.armorDark], [3, 12, DEITY_COLORS.armor], [4, 12, DEITY_COLORS.armorPlate], [5, 12, DEITY_COLORS.chaosGlow], [6, 12, DEITY_COLORS.armorPlateLight], [7, 12, DEITY_COLORS.armorPlateLight], [8, 12, DEITY_COLORS.armorPlateLight], [9, 12, DEITY_COLORS.chaosGlow], [10, 12, DEITY_COLORS.armorPlate], [11, 12, DEITY_COLORS.armor], [12, 12, DEITY_COLORS.armorDark],
  [2, 13, DEITY_COLORS.armorDark], [3, 13, DEITY_COLORS.armorDark], [4, 13, DEITY_COLORS.armor], [5, 13, DEITY_COLORS.chaos], [6, 13, DEITY_COLORS.chaosDark], [7, 13, DEITY_COLORS.chaosDark], [8, 13, DEITY_COLORS.chaosDark], [9, 13, DEITY_COLORS.chaos], [10, 13, DEITY_COLORS.armor], [11, 13, DEITY_COLORS.armorDark], [12, 13, DEITY_COLORS.armorDark],

  [3, 14, DEITY_COLORS.belt], [4, 14, DEITY_COLORS.belt], [5, 14, DEITY_COLORS.beltGold], [6, 14, DEITY_COLORS.beltBuckle], [7, 14, DEITY_COLORS.beltBuckle], [8, 14, DEITY_COLORS.beltGold], [9, 14, DEITY_COLORS.belt], [10, 14, DEITY_COLORS.belt],
  [4, 15, DEITY_COLORS.armorDark], [5, 15, DEITY_COLORS.armor], [6, 15, DEITY_COLORS.armorRust], [7, 15, DEITY_COLORS.armorRust], [8, 15, DEITY_COLORS.armor], [9, 15, DEITY_COLORS.armorDark],
]

const DEITY_FACE_DOWN = [
  [6, 0, DEITY_COLORS.helmDark], [7, 0, DEITY_COLORS.helmDark], [8, 0, DEITY_COLORS.helm], [9, 0, DEITY_COLORS.helm], [10, 0, DEITY_COLORS.helm], [11, 0, DEITY_COLORS.helmDark], [12, 0, DEITY_COLORS.helmDark],
  [5, 1, DEITY_COLORS.helmDark], [6, 1, DEITY_COLORS.helm], [7, 1, DEITY_COLORS.helmLight], [8, 1, DEITY_COLORS.helm], [9, 1, DEITY_COLORS.helm], [10, 1, DEITY_COLORS.helm], [11, 1, DEITY_COLORS.helmLight], [12, 1, DEITY_COLORS.helm], [13, 1, DEITY_COLORS.helmDark],
  [5, 2, DEITY_COLORS.helmDark], [6, 2, DEITY_COLORS.helmGold], [7, 2, DEITY_COLORS.helm], [8, 2, DEITY_COLORS.helmLight], [9, 2, DEITY_COLORS.helmLight], [10, 2, DEITY_COLORS.helm], [11, 2, DEITY_COLORS.helmGold], [12, 2, DEITY_COLORS.helmDark], [13, 2, DEITY_COLORS.helmRust],

  [4, 3, DEITY_COLORS.helmDark], [5, 3, DEITY_COLORS.helm], [6, 3, DEITY_COLORS.helmDark], [7, 3, DEITY_COLORS.chaos], [8, 3, DEITY_COLORS.chaos], [9, 3, DEITY_COLORS.chaos], [10, 3, DEITY_COLORS.chaos], [11, 3, DEITY_COLORS.helmDark], [12, 3, DEITY_COLORS.helm], [13, 3, DEITY_COLORS.helmDark],
  [4, 4, DEITY_COLORS.helmDark], [5, 4, DEITY_COLORS.helmDark], [6, 4, DEITY_COLORS.eyeChaos], [7, 4, DEITY_COLORS.eyeChaosGlow], [8, 4, DEITY_COLORS.eyeGlow], [9, 4, DEITY_COLORS.eyeGlow], [10, 4, DEITY_COLORS.eyeChaosGlow], [11, 4, DEITY_COLORS.eyeChaos], [12, 4, DEITY_COLORS.helmDark], [13, 4, DEITY_COLORS.helmDark],
  [4, 5, DEITY_COLORS.helmDark], [5, 5, DEITY_COLORS.helm], [6, 5, DEITY_COLORS.eyeChaosGlow], [7, 5, DEITY_COLORS.eyeInner], [8, 5, DEITY_COLORS.eye], [9, 5, DEITY_COLORS.eye], [10, 5, DEITY_COLORS.eyeInner], [11, 5, DEITY_COLORS.eyeChaosGlow], [12, 5, DEITY_COLORS.helm], [13, 5, DEITY_COLORS.helmDark],
  [5, 6, DEITY_COLORS.helm], [6, 6, DEITY_COLORS.helmDark], [7, 6, DEITY_COLORS.chaosDark], [8, 6, DEITY_COLORS.chaosDark], [9, 6, DEITY_COLORS.chaosDark], [10, 6, DEITY_COLORS.chaosDark], [11, 6, DEITY_COLORS.helmDark], [12, 6, DEITY_COLORS.helm],

  [2, 7, DEITY_COLORS.armorDark], [3, 7, DEITY_COLORS.armorDark], [4, 7, DEITY_COLORS.armor], [5, 7, DEITY_COLORS.armorPlate], [6, 7, DEITY_COLORS.chaos], [7, 7, DEITY_COLORS.chaosGlow], [8, 7, DEITY_COLORS.chaosGlow], [9, 7, DEITY_COLORS.chaosGlow], [10, 7, DEITY_COLORS.chaosGlow], [11, 7, DEITY_COLORS.chaos], [12, 7, DEITY_COLORS.armorPlate], [13, 7, DEITY_COLORS.armor], [14, 7, DEITY_COLORS.armorDark], [15, 7, DEITY_COLORS.armorDark],
  [2, 8, DEITY_COLORS.armorDark], [3, 8, DEITY_COLORS.armor], [4, 8, DEITY_COLORS.armorPlate], [5, 8, DEITY_COLORS.armorPlateLight], [6, 8, DEITY_COLORS.chaosDark], [7, 8, DEITY_COLORS.chaos], [8, 8, DEITY_COLORS.chaos], [9, 8, DEITY_COLORS.chaos], [10, 8, DEITY_COLORS.chaos], [11, 8, DEITY_COLORS.chaosDark], [12, 8, DEITY_COLORS.armorPlateLight], [13, 8, DEITY_COLORS.armorPlate], [14, 8, DEITY_COLORS.armor], [15, 8, DEITY_COLORS.armorDark],
  [3, 9, DEITY_COLORS.armorDark], [4, 9, DEITY_COLORS.armor], [5, 9, DEITY_COLORS.armorPlate], [6, 9, DEITY_COLORS.chaosGlow], [7, 9, DEITY_COLORS.chaos], [8, 9, DEITY_COLORS.chaosDark], [9, 9, DEITY_COLORS.chaosDark], [10, 9, DEITY_COLORS.chaos], [11, 9, DEITY_COLORS.chaosGlow], [12, 9, DEITY_COLORS.armorPlate], [13, 9, DEITY_COLORS.armor], [14, 9, DEITY_COLORS.armorDark],

  [4, 10, DEITY_COLORS.armorDark], [5, 10, DEITY_COLORS.armor], [6, 10, DEITY_COLORS.armorPlate], [7, 10, DEITY_COLORS.chaosGlow], [8, 10, DEITY_COLORS.armorPlateLight], [9, 10, DEITY_COLORS.armorPlateLight], [10, 10, DEITY_COLORS.armorPlateLight], [11, 10, DEITY_COLORS.chaosGlow], [12, 10, DEITY_COLORS.armorPlate], [13, 10, DEITY_COLORS.armor], [14, 10, DEITY_COLORS.armorDark],
  [4, 11, DEITY_COLORS.armorDark], [5, 11, DEITY_COLORS.armorDark], [6, 11, DEITY_COLORS.armor], [7, 11, DEITY_COLORS.chaos], [8, 11, DEITY_COLORS.chaosDark], [9, 11, DEITY_COLORS.chaosDark], [10, 11, DEITY_COLORS.chaosDark], [11, 11, DEITY_COLORS.chaos], [12, 11, DEITY_COLORS.armor], [13, 11, DEITY_COLORS.armorDark], [14, 11, DEITY_COLORS.armorDark],
  [5, 12, DEITY_COLORS.armorDark], [6, 12, DEITY_COLORS.armorScratch], [7, 12, DEITY_COLORS.armor], [8, 12, DEITY_COLORS.armorRust], [9, 12, DEITY_COLORS.armorRust], [10, 12, DEITY_COLORS.armor], [11, 12, DEITY_COLORS.armorScratch], [12, 12, DEITY_COLORS.armorDark],

  [5, 13, DEITY_COLORS.belt], [6, 13, DEITY_COLORS.belt], [7, 13, DEITY_COLORS.beltGold], [8, 13, DEITY_COLORS.beltBuckle], [9, 13, DEITY_COLORS.beltBuckle], [10, 13, DEITY_COLORS.beltGold], [11, 13, DEITY_COLORS.belt], [12, 13, DEITY_COLORS.belt],

  [6, 14, DEITY_COLORS.legArmorDark], [7, 14, DEITY_COLORS.legArmor], [8, 14, DEITY_COLORS.legArmorLight], [9, 14, DEITY_COLORS.legArmorLight], [10, 14, DEITY_COLORS.legArmor], [11, 14, DEITY_COLORS.legArmorDark],
  [6, 15, DEITY_COLORS.legArmorDark], [7, 15, DEITY_COLORS.legArmor], [8, 15, DEITY_COLORS.legArmor], [9, 15, DEITY_COLORS.legArmor], [10, 15, DEITY_COLORS.legArmor], [11, 15, DEITY_COLORS.legArmorDark],
  [6, 16, DEITY_COLORS.bootDark], [7, 16, DEITY_COLORS.boot], [8, 16, DEITY_COLORS.bootSteel], [9, 16, DEITY_COLORS.bootSteel], [10, 16, DEITY_COLORS.boot], [11, 16, DEITY_COLORS.bootDark],
  [7, 17, DEITY_COLORS.boot], [8, 17, DEITY_COLORS.bootLight], [9, 17, DEITY_COLORS.bootLight], [10, 17, DEITY_COLORS.boot],
  [7, 18, DEITY_COLORS.bootDark], [8, 18, DEITY_COLORS.boot], [9, 18, DEITY_COLORS.boot], [10, 18, DEITY_COLORS.bootDark],

  [2, 8, DEITY_COLORS.gauntletDark], [3, 8, DEITY_COLORS.gauntlet],
  [2, 9, DEITY_COLORS.gauntlet], [3, 9, DEITY_COLORS.gauntletLight],
  [2, 10, DEITY_COLORS.gauntletLight], [3, 10, DEITY_COLORS.gauntlet],
  [3, 11, DEITY_COLORS.gauntletDark],
  [3, 12, DEITY_COLORS.swordHandle],
  [3, 13, DEITY_COLORS.swordGuard],
  [3, 14, DEITY_COLORS.swordHandle],
  [3, 15, DEITY_COLORS.swordDark], [4, 15, DEITY_COLORS.swordDark],
  [3, 16, DEITY_COLORS.sword], [4, 16, DEITY_COLORS.swordChaos],
  [3, 17, DEITY_COLORS.swordLight], [4, 17, DEITY_COLORS.sword],
  [4, 18, DEITY_COLORS.swordDark],
  [4, 19, DEITY_COLORS.swordRust],

  [14, 8, DEITY_COLORS.gauntlet], [15, 8, DEITY_COLORS.gauntletDark],
  [14, 9, DEITY_COLORS.gauntletLight], [15, 9, DEITY_COLORS.gauntlet],
  [14, 10, DEITY_COLORS.gauntlet], [15, 10, DEITY_COLORS.gauntletDark],
  [16, 10, DEITY_COLORS.shieldDark],
  [16, 11, DEITY_COLORS.shield],
  [16, 12, DEITY_COLORS.shieldLight],
  [16, 13, DEITY_COLORS.shieldGold],
  [16, 14, DEITY_COLORS.shieldChaos],
  [17, 14, DEITY_COLORS.shieldCrack],
  [16, 15, DEITY_COLORS.shield],
  [16, 16, DEITY_COLORS.shieldDark],

  [7, 7, DEITY_COLORS.chaosEnergy], [10, 7, DEITY_COLORS.chaosEnergy],
  [8, 18, DEITY_COLORS.chaosEnergy], [9, 18, DEITY_COLORS.chaosEnergy],
  [6, 10, DEITY_COLORS.crack], [7, 11, DEITY_COLORS.crack],
  [11, 10, DEITY_COLORS.crack], [10, 11, DEITY_COLORS.crack],
  [7, 17, DEITY_COLORS.spark], [10, 17, DEITY_COLORS.spark],
]

const DEITY_FACE_UP = [
  [6, 0, DEITY_COLORS.helmDark], [7, 0, DEITY_COLORS.helmDark], [8, 0, DEITY_COLORS.helm], [9, 0, DEITY_COLORS.helm], [10, 0, DEITY_COLORS.helm], [11, 0, DEITY_COLORS.helmDark], [12, 0, DEITY_COLORS.helmDark],
  [5, 1, DEITY_COLORS.helmDark], [6, 1, DEITY_COLORS.helm], [7, 1, DEITY_COLORS.helmLight], [8, 1, DEITY_COLORS.helm], [9, 1, DEITY_COLORS.helm], [10, 1, DEITY_COLORS.helm], [11, 1, DEITY_COLORS.helmLight], [12, 1, DEITY_COLORS.helm], [13, 1, DEITY_COLORS.helmDark],
  [5, 2, DEITY_COLORS.helmDark], [6, 2, DEITY_COLORS.helm], [7, 2, DEITY_COLORS.helmLight], [8, 2, DEITY_COLORS.helm], [9, 2, DEITY_COLORS.helm], [10, 2, DEITY_COLORS.helmLight], [11, 2, DEITY_COLORS.helm], [12, 2, DEITY_COLORS.helmDark],

  [4, 3, DEITY_COLORS.helmDark], [5, 3, DEITY_COLORS.helm], [6, 3, DEITY_COLORS.helmDark], [7, 3, DEITY_COLORS.chaos], [8, 3, DEITY_COLORS.chaos], [9, 3, DEITY_COLORS.chaos], [10, 3, DEITY_COLORS.chaos], [11, 3, DEITY_COLORS.helmDark], [12, 3, DEITY_COLORS.helm], [13, 3, DEITY_COLORS.helmDark],
  [4, 4, DEITY_COLORS.helmDark], [5, 4, DEITY_COLORS.helm], [6, 4, DEITY_COLORS.helmDark], [7, 4, DEITY_COLORS.chaosGlow], [8, 4, DEITY_COLORS.chaos], [9, 4, DEITY_COLORS.chaos], [10, 4, DEITY_COLORS.chaosGlow], [11, 4, DEITY_COLORS.helmDark], [12, 4, DEITY_COLORS.helm], [13, 4, DEITY_COLORS.helmDark],
  [5, 5, DEITY_COLORS.helm], [6, 5, DEITY_COLORS.helmDark], [7, 5, DEITY_COLORS.chaosDark], [8, 5, DEITY_COLORS.chaosDark], [9, 5, DEITY_COLORS.chaosDark], [10, 5, DEITY_COLORS.chaosDark], [11, 5, DEITY_COLORS.helmDark], [12, 5, DEITY_COLORS.helm],

  [2, 6, DEITY_COLORS.capeDark], [3, 6, DEITY_COLORS.capeDark], [4, 6, DEITY_COLORS.cape], [5, 6, DEITY_COLORS.capeLight], [6, 6, DEITY_COLORS.capeChaos], [7, 6, DEITY_COLORS.chaosGlow], [8, 6, DEITY_COLORS.chaosGlow], [9, 6, DEITY_COLORS.chaosGlow], [10, 6, DEITY_COLORS.capeChaos], [11, 6, DEITY_COLORS.capeLight], [12, 6, DEITY_COLORS.cape], [13, 6, DEITY_COLORS.capeDark], [14, 6, DEITY_COLORS.capeDark],
  [2, 7, DEITY_COLORS.capeDark], [3, 7, DEITY_COLORS.cape], [4, 7, DEITY_COLORS.cape], [5, 7, DEITY_COLORS.capeLight], [6, 7, DEITY_COLORS.cape], [7, 7, DEITY_COLORS.chaosDark], [8, 7, DEITY_COLORS.chaos], [9, 7, DEITY_COLORS.chaos], [10, 7, DEITY_COLORS.chaosDark], [11, 7, DEITY_COLORS.cape], [12, 7, DEITY_COLORS.capeLight], [13, 7, DEITY_COLORS.cape], [14, 7, DEITY_COLORS.capeDark],
  [3, 8, DEITY_COLORS.capeDark], [4, 8, DEITY_COLORS.cape], [5, 8, DEITY_COLORS.capeLight], [6, 8, DEITY_COLORS.capeChaos], [7, 8, DEITY_COLORS.cape], [8, 8, DEITY_COLORS.chaosDark], [9, 8, DEITY_COLORS.chaosDark], [10, 8, DEITY_COLORS.cape], [11, 8, DEITY_COLORS.capeChaos], [12, 8, DEITY_COLORS.capeLight], [13, 8, DEITY_COLORS.cape], [14, 8, DEITY_COLORS.capeDark],
  [3, 9, DEITY_COLORS.capeDark], [4, 9, DEITY_COLORS.cape], [5, 9, DEITY_COLORS.cape], [6, 9, DEITY_COLORS.capeLight], [7, 9, DEITY_COLORS.capeChaos], [8, 9, DEITY_COLORS.cape], [9, 9, DEITY_COLORS.cape], [10, 9, DEITY_COLORS.capeChaos], [11, 9, DEITY_COLORS.capeLight], [12, 9, DEITY_COLORS.cape], [13, 9, DEITY_COLORS.capeDark],

  [5, 10, DEITY_COLORS.armorDark], [6, 10, DEITY_COLORS.armor], [7, 10, DEITY_COLORS.chaosGlow], [8, 10, DEITY_COLORS.armorPlateLight], [9, 10, DEITY_COLORS.armorPlateLight], [10, 10, DEITY_COLORS.chaosGlow], [11, 10, DEITY_COLORS.armor], [12, 10, DEITY_COLORS.armorDark],
  [6, 11, DEITY_COLORS.legArmorDark], [7, 11, DEITY_COLORS.legArmor], [8, 11, DEITY_COLORS.legArmorLight], [9, 11, DEITY_COLORS.legArmorLight], [10, 11, DEITY_COLORS.legArmor], [11, 11, DEITY_COLORS.legArmorDark],
  [6, 12, DEITY_COLORS.legArmorDark], [7, 12, DEITY_COLORS.legArmor], [8, 12, DEITY_COLORS.legArmor], [9, 12, DEITY_COLORS.legArmor], [10, 12, DEITY_COLORS.legArmor], [11, 12, DEITY_COLORS.legArmorDark],
  [6, 13, DEITY_COLORS.bootDark], [7, 13, DEITY_COLORS.boot], [8, 13, DEITY_COLORS.bootSteel], [9, 13, DEITY_COLORS.bootSteel], [10, 13, DEITY_COLORS.boot], [11, 13, DEITY_COLORS.bootDark],
  [7, 14, DEITY_COLORS.boot], [8, 14, DEITY_COLORS.bootLight], [9, 14, DEITY_COLORS.bootLight], [10, 14, DEITY_COLORS.boot],
  [7, 15, DEITY_COLORS.bootDark], [8, 15, DEITY_COLORS.boot], [9, 15, DEITY_COLORS.boot], [10, 15, DEITY_COLORS.bootDark],

  [14, 6, DEITY_COLORS.swordDark],
  [14, 7, DEITY_COLORS.sword],
  [14, 8, DEITY_COLORS.swordLight],
  [14, 9, DEITY_COLORS.swordGuard],
  [14, 10, DEITY_COLORS.swordHandle],
  [14, 11, DEITY_COLORS.swordDark],

  [8, 15, DEITY_COLORS.chaosEnergy], [9, 15, DEITY_COLORS.chaosEnergy],
]

const DEITY_FACE_LEFT = [
  [7, 0, DEITY_COLORS.helmDark], [8, 0, DEITY_COLORS.helmDark], [9, 0, DEITY_COLORS.helm],
  [6, 1, DEITY_COLORS.helmDark], [7, 1, DEITY_COLORS.helm], [8, 1, DEITY_COLORS.helmLight], [9, 1, DEITY_COLORS.chaos],
  [6, 2, DEITY_COLORS.helmDark], [7, 2, DEITY_COLORS.helmLight], [8, 2, DEITY_COLORS.helm], [9, 2, DEITY_COLORS.helmDark],

  [5, 3, DEITY_COLORS.helmDark], [6, 3, DEITY_COLORS.helm], [7, 3, DEITY_COLORS.eyeChaos], [8, 3, DEITY_COLORS.eyeChaosGlow], [9, 3, DEITY_COLORS.helm], [10, 3, DEITY_COLORS.helmDark],
  [5, 4, DEITY_COLORS.helmDark], [6, 4, DEITY_COLORS.helmDark], [7, 4, DEITY_COLORS.eyeChaosGlow], [8, 4, DEITY_COLORS.eyeGlow], [9, 4, DEITY_COLORS.helm], [10, 4, DEITY_COLORS.helmDark],
  [5, 5, DEITY_COLORS.helm], [6, 5, DEITY_COLORS.helm], [7, 5, DEITY_COLORS.chaosDark], [8, 5, DEITY_COLORS.helm], [9, 5, DEITY_COLORS.helmDark], [10, 5, DEITY_COLORS.helmDark],

  [4, 6, DEITY_COLORS.armorDark], [5, 6, DEITY_COLORS.armorPlate], [6, 6, DEITY_COLORS.armorPlateLight], [7, 6, DEITY_COLORS.chaos], [8, 6, DEITY_COLORS.chaosGlow], [9, 6, DEITY_COLORS.armor], [10, 6, DEITY_COLORS.armorPlate], [11, 6, DEITY_COLORS.armorDark],
  [3, 7, DEITY_COLORS.armorDark], [4, 7, DEITY_COLORS.armor], [5, 7, DEITY_COLORS.armorPlate], [6, 7, DEITY_COLORS.chaosDark], [7, 7, DEITY_COLORS.chaos], [8, 7, DEITY_COLORS.chaosDark], [9, 7, DEITY_COLORS.armorPlateLight], [10, 7, DEITY_COLORS.armor], [11, 7, DEITY_COLORS.armorDark], [12, 7, DEITY_COLORS.armorDark],
  [4, 8, DEITY_COLORS.armorDark], [5, 8, DEITY_COLORS.armor], [6, 8, DEITY_COLORS.armorPlate], [7, 8, DEITY_COLORS.chaosGlow], [8, 8, DEITY_COLORS.chaos], [9, 8, DEITY_COLORS.chaosDark], [10, 8, DEITY_COLORS.armorPlate], [11, 8, DEITY_COLORS.armor], [12, 8, DEITY_COLORS.armorDark],

  [4, 9, DEITY_COLORS.armorDark], [5, 9, DEITY_COLORS.armorPlate], [6, 9, DEITY_COLORS.chaosGlow], [7, 9, DEITY_COLORS.chaos], [8, 9, DEITY_COLORS.chaosDark], [9, 9, DEITY_COLORS.armorPlateLight], [10, 9, DEITY_COLORS.armor], [11, 9, DEITY_COLORS.armorDark],
  [4, 10, DEITY_COLORS.armorDark], [5, 10, DEITY_COLORS.armor], [6, 10, DEITY_COLORS.chaos], [7, 10, DEITY_COLORS.chaosDark], [8, 10, DEITY_COLORS.chaosDark], [9, 10, DEITY_COLORS.chaos], [10, 10, DEITY_COLORS.armor], [11, 10, DEITY_COLORS.armorDark],
  [5, 11, DEITY_COLORS.armorScratch], [6, 11, DEITY_COLORS.armorRust], [7, 11, DEITY_COLORS.armor], [8, 11, DEITY_COLORS.armor], [9, 11, DEITY_COLORS.armor], [10, 11, DEITY_COLORS.armorRust], [11, 11, DEITY_COLORS.armorScratch],

  [5, 12, DEITY_COLORS.belt], [6, 12, DEITY_COLORS.beltGold], [7, 12, DEITY_COLORS.beltBuckle], [8, 12, DEITY_COLORS.beltGold], [9, 12, DEITY_COLORS.beltGold], [10, 12, DEITY_COLORS.belt], [11, 12, DEITY_COLORS.belt],

  [6, 13, DEITY_COLORS.legArmorDark], [7, 13, DEITY_COLORS.legArmor], [8, 13, DEITY_COLORS.legArmorLight], [9, 13, DEITY_COLORS.legArmorLight], [10, 13, DEITY_COLORS.legArmor], [11, 13, DEITY_COLORS.legArmorDark],
  [6, 14, DEITY_COLORS.legArmorDark], [7, 14, DEITY_COLORS.legArmor], [8, 14, DEITY_COLORS.legArmor], [9, 14, DEITY_COLORS.legArmor], [10, 14, DEITY_COLORS.legArmor], [11, 14, DEITY_COLORS.legArmorDark],
  [6, 15, DEITY_COLORS.bootDark], [7, 15, DEITY_COLORS.boot], [8, 15, DEITY_COLORS.bootSteel], [9, 15, DEITY_COLORS.bootSteel], [10, 15, DEITY_COLORS.boot], [11, 15, DEITY_COLORS.bootDark],
  [7, 16, DEITY_COLORS.boot], [8, 16, DEITY_COLORS.bootLight], [9, 16, DEITY_COLORS.bootLight], [10, 16, DEITY_COLORS.boot],
  [7, 17, DEITY_COLORS.bootDark], [8, 17, DEITY_COLORS.boot], [9, 17, DEITY_COLORS.boot], [10, 17, DEITY_COLORS.bootDark],

  [2, 6, DEITY_COLORS.gauntletDark],
  [2, 7, DEITY_COLORS.gauntlet], [3, 7, DEITY_COLORS.gauntletLight],
  [2, 8, DEITY_COLORS.gauntletLight], [3, 8, DEITY_COLORS.swordHandle],
  [2, 9, DEITY_COLORS.gauntlet], [3, 9, DEITY_COLORS.swordGuard],
  [2, 10, DEITY_COLORS.gauntletDark], [3, 10, DEITY_COLORS.swordHandle],
  [3, 11, DEITY_COLORS.swordDark], [4, 11, DEITY_COLORS.swordDark],
  [3, 12, DEITY_COLORS.sword], [4, 12, DEITY_COLORS.swordChaos],
  [3, 13, DEITY_COLORS.swordLight], [4, 13, DEITY_COLORS.sword],
  [4, 14, DEITY_COLORS.swordDark], [5, 14, DEITY_COLORS.swordRust],

  [11, 8, DEITY_COLORS.gauntlet], [12, 8, DEITY_COLORS.gauntletDark],
  [11, 9, DEITY_COLORS.gauntletLight], [12, 9, DEITY_COLORS.gauntlet],
  [12, 10, DEITY_COLORS.shieldDark],
  [12, 11, DEITY_COLORS.shield],
  [12, 12, DEITY_COLORS.shieldLight],
  [12, 13, DEITY_COLORS.shieldGold],
  [12, 14, DEITY_COLORS.shieldChaos],
  [12, 15, DEITY_COLORS.shield],
  [12, 16, DEITY_COLORS.shieldDark],

  [8, 17, DEITY_COLORS.chaosEnergy],
  [7, 17, DEITY_COLORS.spark],
]

const DEITY_FACE_RIGHT = [
  [7, 0, DEITY_COLORS.helm], [8, 0, DEITY_COLORS.helmDark], [9, 0, DEITY_COLORS.helmDark],
  [7, 1, DEITY_COLORS.chaos], [8, 1, DEITY_COLORS.helmLight], [9, 1, DEITY_COLORS.helm], [10, 1, DEITY_COLORS.helmDark],
  [7, 2, DEITY_COLORS.helmDark], [8, 2, DEITY_COLORS.helm], [9, 2, DEITY_COLORS.helmLight], [10, 2, DEITY_COLORS.helmDark],

  [6, 3, DEITY_COLORS.helmDark], [7, 3, DEITY_COLORS.helm], [8, 3, DEITY_COLORS.eyeChaosGlow], [9, 3, DEITY_COLORS.eyeChaos], [10, 3, DEITY_COLORS.helm], [11, 3, DEITY_COLORS.helmDark],
  [6, 4, DEITY_COLORS.helmDark], [7, 4, DEITY_COLORS.helm], [8, 4, DEITY_COLORS.eyeGlow], [9, 4, DEITY_COLORS.eyeChaosGlow], [10, 4, DEITY_COLORS.helmDark], [11, 4, DEITY_COLORS.helmDark],
  [6, 5, DEITY_COLORS.helmDark], [7, 5, DEITY_COLORS.helmDark], [8, 5, DEITY_COLORS.helm], [9, 5, DEITY_COLORS.chaosDark], [10, 5, DEITY_COLORS.helm], [11, 5, DEITY_COLORS.helm],

  [6, 6, DEITY_COLORS.armorDark], [7, 6, DEITY_COLORS.armorPlate], [8, 6, DEITY_COLORS.armor], [9, 6, DEITY_COLORS.chaosGlow], [10, 6, DEITY_COLORS.chaos], [11, 6, DEITY_COLORS.armorPlateLight], [12, 6, DEITY_COLORS.armorPlate], [13, 6, DEITY_COLORS.armorDark],
  [5, 7, DEITY_COLORS.armorDark], [6, 7, DEITY_COLORS.armorDark], [7, 7, DEITY_COLORS.armor], [8, 7, DEITY_COLORS.armorPlateLight], [9, 7, DEITY_COLORS.chaosDark], [10, 7, DEITY_COLORS.chaos], [11, 7, DEITY_COLORS.chaosDark], [12, 7, DEITY_COLORS.armorPlate], [13, 7, DEITY_COLORS.armor], [14, 7, DEITY_COLORS.armorDark],
  [5, 8, DEITY_COLORS.armorDark], [6, 8, DEITY_COLORS.armor], [7, 8, DEITY_COLORS.armorPlate], [8, 8, DEITY_COLORS.chaosDark], [9, 8, DEITY_COLORS.chaos], [10, 8, DEITY_COLORS.chaosGlow], [11, 8, DEITY_COLORS.armorPlate], [12, 8, DEITY_COLORS.armor], [13, 8, DEITY_COLORS.armorDark],

  [6, 9, DEITY_COLORS.armorDark], [7, 9, DEITY_COLORS.armor], [8, 9, DEITY_COLORS.armorPlateLight], [9, 9, DEITY_COLORS.chaosDark], [10, 9, DEITY_COLORS.chaos], [11, 9, DEITY_COLORS.chaosGlow], [12, 9, DEITY_COLORS.armorPlate], [13, 9, DEITY_COLORS.armorDark],
  [6, 10, DEITY_COLORS.armorDark], [7, 10, DEITY_COLORS.armor], [8, 10, DEITY_COLORS.chaosDark], [9, 10, DEITY_COLORS.chaosDark], [10, 10, DEITY_COLORS.chaos], [11, 10, DEITY_COLORS.chaosGlow], [12, 10, DEITY_COLORS.armor], [13, 10, DEITY_COLORS.armorDark],
  [6, 11, DEITY_COLORS.armorScratch], [7, 11, DEITY_COLORS.armorRust], [8, 11, DEITY_COLORS.armor], [9, 11, DEITY_COLORS.armor], [10, 11, DEITY_COLORS.armor], [11, 11, DEITY_COLORS.armorRust], [12, 11, DEITY_COLORS.armorScratch],

  [6, 12, DEITY_COLORS.belt], [7, 12, DEITY_COLORS.belt], [8, 12, DEITY_COLORS.beltGold], [9, 12, DEITY_COLORS.beltBuckle], [10, 12, DEITY_COLORS.beltGold], [11, 12, DEITY_COLORS.beltGold], [12, 12, DEITY_COLORS.belt],

  [6, 13, DEITY_COLORS.legArmorDark], [7, 13, DEITY_COLORS.legArmor], [8, 13, DEITY_COLORS.legArmorLight], [9, 13, DEITY_COLORS.legArmorLight], [10, 13, DEITY_COLORS.legArmor], [11, 13, DEITY_COLORS.legArmorDark],
  [6, 14, DEITY_COLORS.legArmorDark], [7, 14, DEITY_COLORS.legArmor], [8, 14, DEITY_COLORS.legArmor], [9, 14, DEITY_COLORS.legArmor], [10, 14, DEITY_COLORS.legArmor], [11, 14, DEITY_COLORS.legArmorDark],
  [6, 15, DEITY_COLORS.bootDark], [7, 15, DEITY_COLORS.boot], [8, 15, DEITY_COLORS.bootSteel], [9, 15, DEITY_COLORS.bootSteel], [10, 15, DEITY_COLORS.boot], [11, 15, DEITY_COLORS.bootDark],
  [6, 16, DEITY_COLORS.boot], [7, 16, DEITY_COLORS.bootLight], [8, 16, DEITY_COLORS.bootLight], [9, 16, DEITY_COLORS.boot],
  [6, 17, DEITY_COLORS.bootDark], [7, 17, DEITY_COLORS.boot], [8, 17, DEITY_COLORS.boot], [9, 17, DEITY_COLORS.bootDark],

  [4, 8, DEITY_COLORS.shieldDark],
  [4, 9, DEITY_COLORS.shield],
  [4, 10, DEITY_COLORS.shieldLight],
  [4, 11, DEITY_COLORS.shieldGold],
  [4, 12, DEITY_COLORS.shieldChaos],
  [4, 13, DEITY_COLORS.shield],
  [4, 14, DEITY_COLORS.shieldDark],
  [5, 8, DEITY_COLORS.gauntletDark], [6, 8, DEITY_COLORS.gauntlet],
  [5, 9, DEITY_COLORS.gauntlet], [6, 9, DEITY_COLORS.gauntletLight],

  [13, 6, DEITY_COLORS.gauntlet],
  [14, 7, DEITY_COLORS.swordHandle], [15, 7, DEITY_COLORS.gauntletLight],
  [14, 8, DEITY_COLORS.swordGuard], [15, 8, DEITY_COLORS.gauntlet],
  [14, 9, DEITY_COLORS.swordHandle], [15, 9, DEITY_COLORS.gauntletDark],
  [14, 10, DEITY_COLORS.swordDark], [15, 10, DEITY_COLORS.swordDark],
  [15, 11, DEITY_COLORS.swordChaos], [16, 11, DEITY_COLORS.sword],
  [15, 12, DEITY_COLORS.sword], [16, 12, DEITY_COLORS.swordLight],
  [16, 13, DEITY_COLORS.swordDark], [17, 13, DEITY_COLORS.swordRust],

  [8, 17, DEITY_COLORS.chaosEnergy],
  [9, 17, DEITY_COLORS.spark],
]

const DEITY_IDLE_FRAMES = [
  [
    { pixels: [
      [7, 4, DEITY_COLORS.eyeChaos], [8, 4, DEITY_COLORS.eyeChaos], [9, 4, DEITY_COLORS.eyeChaos], [10, 4, DEITY_COLORS.eyeChaos],
      [7, 3, DEITY_COLORS.chaos], [8, 3, DEITY_COLORS.chaos], [9, 3, DEITY_COLORS.chaos], [10, 3, DEITY_COLORS.chaos],
      [7, 7, DEITY_COLORS.chaos], [10, 7, DEITY_COLORS.chaos],
      [8, 18, DEITY_COLORS.chaosEnergy], [9, 18, DEITY_COLORS.chaosEnergy],
    ] }
  ],
  [
    { pixels: [
      [7, 4, DEITY_COLORS.eyeChaosGlow], [8, 4, DEITY_COLORS.eyeChaosGlow], [9, 4, DEITY_COLORS.eyeChaosGlow], [10, 4, DEITY_COLORS.eyeChaosGlow],
      [7, 3, DEITY_COLORS.chaosGlow], [8, 3, DEITY_COLORS.chaosGlow], [9, 3, DEITY_COLORS.chaosGlow], [10, 3, DEITY_COLORS.chaosGlow],
      [7, 7, DEITY_COLORS.chaosGlow], [10, 7, DEITY_COLORS.chaosGlow],
      [8, 18, DEITY_COLORS.chaosEnergyGlow], [9, 18, DEITY_COLORS.chaosEnergyGlow],
      [7, 17, DEITY_COLORS.sparkWhite], [10, 17, DEITY_COLORS.sparkWhite],
    ] }
  ],
]

const DEITY_WALK_FRAMES = [
  [
    { pixels: [
      [7, 17, DEITY_COLORS.bootDark], [8, 17, DEITY_COLORS.boot], [9, 17, DEITY_COLORS.bootDark], [10, 17, DEITY_COLORS.boot],
    ] }
  ],
  [
    { pixels: [
      [7, 17, DEITY_COLORS.boot], [8, 17, DEITY_COLORS.bootDark], [9, 17, DEITY_COLORS.bootDark], [10, 17, DEITY_COLORS.boot],
    ] }
  ],
  [
    { pixels: [
      [7, 17, DEITY_COLORS.boot], [8, 17, DEITY_COLORS.boot], [9, 17, DEITY_COLORS.bootDark], [10, 17, DEITY_COLORS.bootDark],
    ] }
  ],
]

export const drawChaosDeity = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: DEITY_FACE_DOWN,
  up: DEITY_FACE_UP,
  left: DEITY_FACE_LEFT,
  right: DEITY_FACE_RIGHT,
  walk: DEITY_WALK_FRAMES,
  idle: DEITY_IDLE_FRAMES,
})


export const drawChaosDeityAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, DEITY_AVATAR)