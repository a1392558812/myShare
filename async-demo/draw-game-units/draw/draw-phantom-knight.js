import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.004,
  WALK_SPEED: 0.08,
}

const KNIGHT_COLORS = {
  phantom: '#E0E8F0',
  phantomLight: '#F0F5FA',
  phantomDark: '#A8B5C4',
  phantomShadow: '#7A8FA6',
  phantomGlow: '#B8D4F0',
  armor: '#4A5A7A',
  armorLight: '#6B7E9E',
  armorDark: '#2A3650',
  armorEdge: '#1A2035',
  plate: '#8A9BBC',
  plateLight: '#AFC5E0',
  helmet: '#5A6A8A',
  helmetLight: '#7A8EAF',
  helmetDark: '#3A4866',
  visor: '#00FFAA',
  visorGlow: '#80FFCC',
  cape: '#1A3A5A',
  capeDark: '#0A2040',
  capeLight: '#2A4A7A',
  sword: '#C0D8F0',
  swordLight: '#E8F4FF',
  swordGlow: '#80CCFF',
  swordDark: '#6A8FB5',
  hilt: '#8B7355',
  hiltDark: '#5A4530',
  shield: '#5A6A8A',
  shieldLight: '#7A8EAF',
  shieldDark: '#3A4866',
  shieldEmblem: '#FFD700',
  belt: '#2A3650',
  chain: '#6B7E9E',
  hand: '#B8C8D8',
  boot: '#3A4866',
  bootDark: '#1A2035',
  aura: '#80FFCC',
  auraLight: '#B8FFE0',
  spark: '#FFFFFF',
  highlight: '#FFFFFF',
}

const KNIGHT_AVATAR = [
  [4, 0, KNIGHT_COLORS.helmetDark], [5, 0, KNIGHT_COLORS.helmet], [6, 0, KNIGHT_COLORS.helmetLight], [7, 0, KNIGHT_COLORS.helmetLight], [8, 0, KNIGHT_COLORS.helmetLight], [9, 0, KNIGHT_COLORS.helmet], [10, 0, KNIGHT_COLORS.helmetDark],
  [4, 1, KNIGHT_COLORS.helmet], [5, 1, KNIGHT_COLORS.helmetLight], [6, 1, KNIGHT_COLORS.helmet], [7, 1, KNIGHT_COLORS.helmetLight], [8, 1, KNIGHT_COLORS.helmetLight], [9, 1, KNIGHT_COLORS.helmet], [10, 1, KNIGHT_COLORS.helmetLight], [11, 1, KNIGHT_COLORS.helmet],
  [3, 2, KNIGHT_COLORS.helmetDark], [4, 2, KNIGHT_COLORS.helmet], [5, 2, KNIGHT_COLORS.helmetLight], [6, 2, KNIGHT_COLORS.helmet], [7, 2, KNIGHT_COLORS.helmetLight], [8, 2, KNIGHT_COLORS.helmetLight], [9, 2, KNIGHT_COLORS.helmet], [10, 2, KNIGHT_COLORS.helmetLight], [11, 2, KNIGHT_COLORS.helmet], [12, 2, KNIGHT_COLORS.helmetDark],
  [3, 3, KNIGHT_COLORS.helmetDark], [4, 3, KNIGHT_COLORS.helmet], [5, 3, KNIGHT_COLORS.helmetLight], [6, 3, KNIGHT_COLORS.helmet], [7, 3, KNIGHT_COLORS.helmetLight], [8, 3, KNIGHT_COLORS.helmetLight], [9, 3, KNIGHT_COLORS.helmet], [10, 3, KNIGHT_COLORS.helmetLight], [11, 3, KNIGHT_COLORS.helmet], [12, 3, KNIGHT_COLORS.helmetDark],
  [2, 4, KNIGHT_COLORS.helmetDark], [3, 4, KNIGHT_COLORS.helmet], [4, 4, KNIGHT_COLORS.helmet], [5, 4, KNIGHT_COLORS.helmetLight], [6, 4, KNIGHT_COLORS.helmet], [7, 4, KNIGHT_COLORS.helmetLight], [8, 4, KNIGHT_COLORS.helmetLight], [9, 4, KNIGHT_COLORS.helmet], [10, 4, KNIGHT_COLORS.helmetLight], [11, 4, KNIGHT_COLORS.helmet], [12, 4, KNIGHT_COLORS.helmet], [13, 4, KNIGHT_COLORS.helmetDark],
  [2, 5, KNIGHT_COLORS.helmetDark], [3, 5, KNIGHT_COLORS.helmet], [4, 5, KNIGHT_COLORS.helmetLight], [5, 5, KNIGHT_COLORS.helmet], [6, 5, KNIGHT_COLORS.helmetLight], [7, 5, KNIGHT_COLORS.helmet], [8, 5, KNIGHT_COLORS.helmet], [9, 5, KNIGHT_COLORS.helmetLight], [10, 5, KNIGHT_COLORS.helmet], [11, 5, KNIGHT_COLORS.helmetLight], [12, 5, KNIGHT_COLORS.helmet], [13, 5, KNIGHT_COLORS.helmetDark],
  [2, 6, KNIGHT_COLORS.helmetDark], [3, 6, KNIGHT_COLORS.helmet], [4, 6, KNIGHT_COLORS.visor], [5, 6, KNIGHT_COLORS.visorGlow], [6, 6, KNIGHT_COLORS.visorGlow], [7, 6, KNIGHT_COLORS.visorGlow], [8, 6, KNIGHT_COLORS.visorGlow], [9, 6, KNIGHT_COLORS.visor], [10, 6, KNIGHT_COLORS.visorGlow], [11, 6, KNIGHT_COLORS.helmet], [12, 6, KNIGHT_COLORS.helmetDark],
  [3, 7, KNIGHT_COLORS.helmetDark], [4, 7, KNIGHT_COLORS.visorGlow], [5, 7, KNIGHT_COLORS.visor], [6, 7, KNIGHT_COLORS.visor], [7, 7, KNIGHT_COLORS.visor], [8, 7, KNIGHT_COLORS.visor], [9, 7, KNIGHT_COLORS.visorGlow], [10, 7, KNIGHT_COLORS.visor], [11, 7, KNIGHT_COLORS.helmetDark],
  [4, 6, KNIGHT_COLORS.highlight], [5, 6, KNIGHT_COLORS.highlight], [9, 6, KNIGHT_COLORS.highlight], [10, 6, KNIGHT_COLORS.highlight],
  [4, 7, KNIGHT_COLORS.highlight], [9, 7, KNIGHT_COLORS.highlight],
  [3, 8, KNIGHT_COLORS.armorEdge], [4, 8, KNIGHT_COLORS.helmetDark], [5, 8, KNIGHT_COLORS.helmet], [6, 8, KNIGHT_COLORS.helmet], [7, 8, KNIGHT_COLORS.helmet], [8, 8, KNIGHT_COLORS.helmet], [9, 8, KNIGHT_COLORS.helmetDark], [10, 8, KNIGHT_COLORS.armorEdge],
  [2, 9, KNIGHT_COLORS.armorDark], [3, 9, KNIGHT_COLORS.armor], [4, 9, KNIGHT_COLORS.plate], [5, 9, KNIGHT_COLORS.plateLight], [6, 9, KNIGHT_COLORS.plate], [7, 9, KNIGHT_COLORS.plateLight], [8, 9, KNIGHT_COLORS.plate], [9, 9, KNIGHT_COLORS.plateLight], [10, 9, KNIGHT_COLORS.plate], [11, 9, KNIGHT_COLORS.armor], [12, 9, KNIGHT_COLORS.armorDark],
  [2, 10, KNIGHT_COLORS.armorDark], [3, 10, KNIGHT_COLORS.armor], [4, 10, KNIGHT_COLORS.armorLight], [5, 10, KNIGHT_COLORS.plate], [6, 10, KNIGHT_COLORS.plateLight], [7, 10, KNIGHT_COLORS.plateLight], [8, 10, KNIGHT_COLORS.plateLight], [9, 10, KNIGHT_COLORS.plate], [10, 10, KNIGHT_COLORS.armorLight], [11, 10, KNIGHT_COLORS.armor], [12, 10, KNIGHT_COLORS.armorDark],
  [3, 11, KNIGHT_COLORS.armorDark], [4, 11, KNIGHT_COLORS.armor], [5, 11, KNIGHT_COLORS.plateLight], [6, 11, KNIGHT_COLORS.plate], [7, 11, KNIGHT_COLORS.plate], [8, 11, KNIGHT_COLORS.plate], [9, 11, KNIGHT_COLORS.plateLight], [10, 11, KNIGHT_COLORS.armor], [11, 11, KNIGHT_COLORS.armorDark],
  [4, 10, KNIGHT_COLORS.phantomGlow], [5, 10, KNIGHT_COLORS.aura],
  [10, 10, KNIGHT_COLORS.phantomGlow], [9, 10, KNIGHT_COLORS.aura],
  [5, 11, KNIGHT_COLORS.auraLight], [10, 11, KNIGHT_COLORS.auraLight],
  [4, 12, KNIGHT_COLORS.belt], [5, 12, KNIGHT_COLORS.plateLight], [6, 12, KNIGHT_COLORS.plate], [7, 12, KNIGHT_COLORS.plate], [8, 12, KNIGHT_COLORS.plateLight], [9, 12, KNIGHT_COLORS.plate], [10, 12, KNIGHT_COLORS.belt],
  [4, 13, KNIGHT_COLORS.armorDark], [5, 13, KNIGHT_COLORS.armor], [6, 13, KNIGHT_COLORS.plateLight], [7, 13, KNIGHT_COLORS.plateLight], [8, 13, KNIGHT_COLORS.plateLight], [9, 13, KNIGHT_COLORS.armor], [10, 13, KNIGHT_COLORS.armorDark],
  [5, 14, KNIGHT_COLORS.helmetDark], [6, 14, KNIGHT_COLORS.helmet], [7, 14, KNIGHT_COLORS.helmetLight], [8, 14, KNIGHT_COLORS.helmetLight], [9, 14, KNIGHT_COLORS.helmet], [10, 14, KNIGHT_COLORS.helmetDark],
]

const KNIGHT_FACE_DOWN = [
  [7, 0, KNIGHT_COLORS.helmet], [8, 0, KNIGHT_COLORS.helmetLight], [9, 0, KNIGHT_COLORS.helmetLight], [10, 0, KNIGHT_COLORS.helmet],
  [6, 1, KNIGHT_COLORS.helmet], [7, 1, KNIGHT_COLORS.helmetLight], [8, 1, KNIGHT_COLORS.helmet], [9, 1, KNIGHT_COLORS.helmet], [10, 1, KNIGHT_COLORS.helmetLight], [11, 1, KNIGHT_COLORS.helmet],
  [5, 2, KNIGHT_COLORS.helmetDark], [6, 2, KNIGHT_COLORS.helmet], [7, 2, KNIGHT_COLORS.helmetLight], [8, 2, KNIGHT_COLORS.helmet], [9, 2, KNIGHT_COLORS.helmet], [10, 2, KNIGHT_COLORS.helmetLight], [11, 2, KNIGHT_COLORS.helmet], [12, 2, KNIGHT_COLORS.helmetDark],
  [5, 3, KNIGHT_COLORS.helmetDark], [6, 3, KNIGHT_COLORS.helmet], [7, 3, KNIGHT_COLORS.helmetLight], [8, 3, KNIGHT_COLORS.helmet], [9, 3, KNIGHT_COLORS.helmet], [10, 3, KNIGHT_COLORS.helmetLight], [11, 3, KNIGHT_COLORS.helmet], [12, 3, KNIGHT_COLORS.helmetDark],
  [5, 4, KNIGHT_COLORS.helmetDark], [6, 4, KNIGHT_COLORS.helmet], [7, 4, KNIGHT_COLORS.visor], [8, 4, KNIGHT_COLORS.visorGlow], [9, 4, KNIGHT_COLORS.visorGlow], [10, 4, KNIGHT_COLORS.visor], [11, 4, KNIGHT_COLORS.helmet], [12, 4, KNIGHT_COLORS.helmetDark],
  [5, 5, KNIGHT_COLORS.helmetDark], [6, 5, KNIGHT_COLORS.helmet], [7, 5, KNIGHT_COLORS.visorGlow], [8, 5, KNIGHT_COLORS.visor], [9, 5, KNIGHT_COLORS.visor], [10, 5, KNIGHT_COLORS.visorGlow], [11, 5, KNIGHT_COLORS.helmet], [12, 5, KNIGHT_COLORS.helmetDark],
  [6, 6, KNIGHT_COLORS.armorEdge], [7, 6, KNIGHT_COLORS.helmetDark], [8, 6, KNIGHT_COLORS.helmet], [9, 6, KNIGHT_COLORS.helmet], [10, 6, KNIGHT_COLORS.helmetDark], [11, 6, KNIGHT_COLORS.armorEdge],
  [5, 7, KNIGHT_COLORS.armorDark], [6, 7, KNIGHT_COLORS.armor], [7, 7, KNIGHT_COLORS.plate], [8, 7, KNIGHT_COLORS.plateLight], [9, 7, KNIGHT_COLORS.plateLight], [10, 7, KNIGHT_COLORS.plate], [11, 7, KNIGHT_COLORS.armor], [12, 7, KNIGHT_COLORS.armorDark],
  [4, 8, KNIGHT_COLORS.armorDark], [5, 8, KNIGHT_COLORS.armor], [6, 8, KNIGHT_COLORS.armorLight], [7, 8, KNIGHT_COLORS.plate], [8, 8, KNIGHT_COLORS.plateLight], [9, 8, KNIGHT_COLORS.plateLight], [10, 8, KNIGHT_COLORS.plate], [11, 8, KNIGHT_COLORS.armorLight], [12, 8, KNIGHT_COLORS.armor], [13, 8, KNIGHT_COLORS.armorDark],
  [4, 9, KNIGHT_COLORS.armorDark], [5, 9, KNIGHT_COLORS.armor], [6, 9, KNIGHT_COLORS.plate], [7, 9, KNIGHT_COLORS.plateLight], [8, 9, KNIGHT_COLORS.plate], [9, 9, KNIGHT_COLORS.plate], [10, 9, KNIGHT_COLORS.plateLight], [11, 9, KNIGHT_COLORS.plate], [12, 9, KNIGHT_COLORS.armor], [13, 9, KNIGHT_COLORS.armorDark],
  [4, 10, KNIGHT_COLORS.armorDark], [5, 10, KNIGHT_COLORS.armor], [6, 10, KNIGHT_COLORS.armorLight], [7, 10, KNIGHT_COLORS.plate], [8, 10, KNIGHT_COLORS.plateLight], [9, 10, KNIGHT_COLORS.plateLight], [10, 10, KNIGHT_COLORS.plate], [11, 10, KNIGHT_COLORS.armorLight], [12, 10, KNIGHT_COLORS.armor], [13, 10, KNIGHT_COLORS.armorDark],
  [5, 11, KNIGHT_COLORS.belt], [6, 11, KNIGHT_COLORS.belt], [7, 11, KNIGHT_COLORS.plateLight], [8, 11, KNIGHT_COLORS.plate], [9, 11, KNIGHT_COLORS.plate], [10, 11, KNIGHT_COLORS.plateLight], [11, 11, KNIGHT_COLORS.belt], [12, 11, KNIGHT_COLORS.belt],
  [5, 12, KNIGHT_COLORS.armor], [6, 12, KNIGHT_COLORS.armorDark], [7, 12, KNIGHT_COLORS.armor], [8, 12, KNIGHT_COLORS.armorLight], [9, 12, KNIGHT_COLORS.armorLight], [10, 12, KNIGHT_COLORS.armor], [11, 12, KNIGHT_COLORS.armorDark], [12, 12, KNIGHT_COLORS.armor],
  [6, 13, KNIGHT_COLORS.armor], [7, 13, KNIGHT_COLORS.plate], [8, 13, KNIGHT_COLORS.plateLight], [9, 13, KNIGHT_COLORS.plateLight], [10, 13, KNIGHT_COLORS.plate], [11, 13, KNIGHT_COLORS.armor],
  [6, 14, KNIGHT_COLORS.armorDark], [7, 14, KNIGHT_COLORS.armor], [8, 14, KNIGHT_COLORS.plate], [9, 14, KNIGHT_COLORS.plate], [10, 14, KNIGHT_COLORS.armor], [11, 14, KNIGHT_COLORS.armorDark],
  [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.boot], [8, 15, KNIGHT_COLORS.bootDark], [9, 15, KNIGHT_COLORS.bootDark], [10, 15, KNIGHT_COLORS.boot], [11, 15, KNIGHT_COLORS.boot],
  [3, 9, KNIGHT_COLORS.armorDark], [4, 9, KNIGHT_COLORS.armor],
  [3, 10, KNIGHT_COLORS.hand], [4, 10, KNIGHT_COLORS.armor],
  [2, 11, KNIGHT_COLORS.hilt], [3, 11, KNIGHT_COLORS.hilt],
  [2, 12, KNIGHT_COLORS.hiltDark], [3, 12, KNIGHT_COLORS.hilt],
  [2, 7, KNIGHT_COLORS.swordGlow], [3, 7, KNIGHT_COLORS.swordLight],
  [2, 8, KNIGHT_COLORS.swordLight], [3, 8, KNIGHT_COLORS.sword],
  [13, 9, KNIGHT_COLORS.armor], [14, 9, KNIGHT_COLORS.armorDark],
  [13, 10, KNIGHT_COLORS.armor], [14, 10, KNIGHT_COLORS.hand],
  [14, 11, KNIGHT_COLORS.shield], [15, 11, KNIGHT_COLORS.shieldDark],
  [14, 12, KNIGHT_COLORS.shield], [15, 12, KNIGHT_COLORS.shieldDark],
  [14, 13, KNIGHT_COLORS.shieldLight], [15, 13, KNIGHT_COLORS.shieldEmblem],
  [7, 15, KNIGHT_COLORS.aura], [10, 15, KNIGHT_COLORS.aura],
]

const KNIGHT_FACE_UP = [
  [7, 0, KNIGHT_COLORS.helmet], [8, 0, KNIGHT_COLORS.helmetLight], [9, 0, KNIGHT_COLORS.helmetLight], [10, 0, KNIGHT_COLORS.helmet],
  [6, 1, KNIGHT_COLORS.helmet], [7, 1, KNIGHT_COLORS.helmetLight], [8, 1, KNIGHT_COLORS.helmet], [9, 1, KNIGHT_COLORS.helmet], [10, 1, KNIGHT_COLORS.helmetLight], [11, 1, KNIGHT_COLORS.helmet],
  [5, 2, KNIGHT_COLORS.helmetDark], [6, 2, KNIGHT_COLORS.helmet], [7, 2, KNIGHT_COLORS.helmetLight], [8, 2, KNIGHT_COLORS.helmet], [9, 2, KNIGHT_COLORS.helmet], [10, 2, KNIGHT_COLORS.helmetLight], [11, 2, KNIGHT_COLORS.helmet], [12, 2, KNIGHT_COLORS.helmetDark],
  [5, 3, KNIGHT_COLORS.helmetDark], [6, 3, KNIGHT_COLORS.helmet], [7, 3, KNIGHT_COLORS.helmetLight], [8, 3, KNIGHT_COLORS.helmet], [9, 3, KNIGHT_COLORS.helmet], [10, 3, KNIGHT_COLORS.helmetLight], [11, 3, KNIGHT_COLORS.helmet], [12, 3, KNIGHT_COLORS.helmetDark],
  [5, 4, KNIGHT_COLORS.helmetDark], [6, 4, KNIGHT_COLORS.helmet], [7, 4, KNIGHT_COLORS.helmet], [8, 4, KNIGHT_COLORS.helmetLight], [9, 4, KNIGHT_COLORS.helmetLight], [10, 4, KNIGHT_COLORS.helmet], [11, 4, KNIGHT_COLORS.helmet], [12, 4, KNIGHT_COLORS.helmetDark],
  [5, 5, KNIGHT_COLORS.helmetDark], [6, 5, KNIGHT_COLORS.helmet], [7, 5, KNIGHT_COLORS.helmet], [8, 5, KNIGHT_COLORS.helmet], [9, 5, KNIGHT_COLORS.helmet], [10, 5, KNIGHT_COLORS.helmet], [11, 5, KNIGHT_COLORS.helmet], [12, 5, KNIGHT_COLORS.helmetDark],
  [6, 6, KNIGHT_COLORS.helmetDark], [7, 6, KNIGHT_COLORS.helmet], [8, 6, KNIGHT_COLORS.helmetDark], [9, 6, KNIGHT_COLORS.helmetDark], [10, 6, KNIGHT_COLORS.helmet], [11, 6, KNIGHT_COLORS.helmetDark],
  [4, 7, KNIGHT_COLORS.capeDark], [5, 7, KNIGHT_COLORS.cape], [6, 7, KNIGHT_COLORS.capeLight], [7, 7, KNIGHT_COLORS.cape], [8, 7, KNIGHT_COLORS.cape], [9, 7, KNIGHT_COLORS.cape], [10, 7, KNIGHT_COLORS.capeLight], [11, 7, KNIGHT_COLORS.cape], [12, 7, KNIGHT_COLORS.capeDark],
  [3, 8, KNIGHT_COLORS.capeDark], [4, 8, KNIGHT_COLORS.cape], [5, 8, KNIGHT_COLORS.capeLight], [6, 8, KNIGHT_COLORS.cape], [7, 8, KNIGHT_COLORS.cape], [8, 8, KNIGHT_COLORS.capeLight], [9, 8, KNIGHT_COLORS.cape], [10, 8, KNIGHT_COLORS.cape], [11, 8, KNIGHT_COLORS.capeLight], [12, 8, KNIGHT_COLORS.cape], [13, 8, KNIGHT_COLORS.capeDark],
  [3, 9, KNIGHT_COLORS.capeDark], [4, 9, KNIGHT_COLORS.cape], [5, 9, KNIGHT_COLORS.cape], [6, 9, KNIGHT_COLORS.capeLight], [7, 9, KNIGHT_COLORS.cape], [8, 9, KNIGHT_COLORS.cape], [9, 9, KNIGHT_COLORS.cape], [10, 9, KNIGHT_COLORS.capeLight], [11, 9, KNIGHT_COLORS.cape], [12, 9, KNIGHT_COLORS.cape], [13, 9, KNIGHT_COLORS.capeDark],
  [3, 10, KNIGHT_COLORS.capeDark], [4, 10, KNIGHT_COLORS.cape], [5, 10, KNIGHT_COLORS.capeLight], [6, 10, KNIGHT_COLORS.cape], [7, 10, KNIGHT_COLORS.cape], [8, 10, KNIGHT_COLORS.capeLight], [9, 10, KNIGHT_COLORS.capeLight], [10, 10, KNIGHT_COLORS.cape], [11, 10, KNIGHT_COLORS.cape], [12, 10, KNIGHT_COLORS.capeLight], [13, 10, KNIGHT_COLORS.cape], [14, 10, KNIGHT_COLORS.capeDark],
  [4, 11, KNIGHT_COLORS.capeDark], [5, 11, KNIGHT_COLORS.cape], [6, 11, KNIGHT_COLORS.cape], [7, 11, KNIGHT_COLORS.capeLight], [8, 11, KNIGHT_COLORS.cape], [9, 11, KNIGHT_COLORS.cape], [10, 11, KNIGHT_COLORS.capeLight], [11, 11, KNIGHT_COLORS.cape], [12, 11, KNIGHT_COLORS.cape], [13, 11, KNIGHT_COLORS.capeDark],
  [5, 12, KNIGHT_COLORS.capeDark], [6, 12, KNIGHT_COLORS.cape], [7, 12, KNIGHT_COLORS.capeLight], [8, 12, KNIGHT_COLORS.cape], [9, 12, KNIGHT_COLORS.cape], [10, 12, KNIGHT_COLORS.capeLight], [11, 12, KNIGHT_COLORS.cape], [12, 12, KNIGHT_COLORS.cape], [13, 12, KNIGHT_COLORS.capeDark],
  [6, 13, KNIGHT_COLORS.armorDark], [7, 13, KNIGHT_COLORS.armor], [8, 13, KNIGHT_COLORS.plate], [9, 13, KNIGHT_COLORS.plate], [10, 13, KNIGHT_COLORS.armor], [11, 13, KNIGHT_COLORS.armorDark],
  [6, 14, KNIGHT_COLORS.armor], [7, 14, KNIGHT_COLORS.armorDark], [8, 14, KNIGHT_COLORS.armor], [9, 14, KNIGHT_COLORS.armor], [10, 14, KNIGHT_COLORS.armorDark], [11, 14, KNIGHT_COLORS.armor],
  [6, 15, KNIGHT_COLORS.bootDark], [7, 15, KNIGHT_COLORS.boot], [8, 15, KNIGHT_COLORS.boot], [9, 15, KNIGHT_COLORS.boot], [10, 15, KNIGHT_COLORS.boot], [11, 15, KNIGHT_COLORS.bootDark],
  [14, 5, KNIGHT_COLORS.swordGlow],
  [14, 6, KNIGHT_COLORS.swordLight],
  [14, 7, KNIGHT_COLORS.sword],
  [14, 8, KNIGHT_COLORS.swordDark],
  [14, 9, KNIGHT_COLORS.hilt],
  [14, 10, KNIGHT_COLORS.hiltDark],
  [7, 15, KNIGHT_COLORS.aura], [10, 15, KNIGHT_COLORS.aura],
  [8, 15, KNIGHT_COLORS.auraLight], [9, 15, KNIGHT_COLORS.auraLight],
]

const KNIGHT_FACE_LEFT = [
  [7, 0, KNIGHT_COLORS.helmet], [8, 0, KNIGHT_COLORS.helmetLight], [9, 0, KNIGHT_COLORS.helmet],
  [6, 1, KNIGHT_COLORS.helmet], [7, 1, KNIGHT_COLORS.helmetLight], [8, 1, KNIGHT_COLORS.helmet], [9, 1, KNIGHT_COLORS.helmetLight], [10, 1, KNIGHT_COLORS.helmet],
  [6, 2, KNIGHT_COLORS.helmetDark], [7, 2, KNIGHT_COLORS.helmet], [8, 2, KNIGHT_COLORS.helmetLight], [9, 2, KNIGHT_COLORS.helmet], [10, 2, KNIGHT_COLORS.helmetDark],
  [6, 3, KNIGHT_COLORS.helmetDark], [7, 3, KNIGHT_COLORS.helmet], [8, 3, KNIGHT_COLORS.helmetLight], [9, 3, KNIGHT_COLORS.helmet], [10, 3, KNIGHT_COLORS.helmetDark],
  [6, 4, KNIGHT_COLORS.helmetDark], [7, 4, KNIGHT_COLORS.visorGlow], [8, 4, KNIGHT_COLORS.visor], [9, 4, KNIGHT_COLORS.helmet], [10, 4, KNIGHT_COLORS.helmetDark],
  [6, 5, KNIGHT_COLORS.helmetDark], [7, 5, KNIGHT_COLORS.visor], [8, 5, KNIGHT_COLORS.visorGlow], [9, 5, KNIGHT_COLORS.helmet], [10, 5, KNIGHT_COLORS.helmetDark],
  [7, 6, KNIGHT_COLORS.armorEdge], [8, 6, KNIGHT_COLORS.helmetDark], [9, 6, KNIGHT_COLORS.helmet],
  [5, 7, KNIGHT_COLORS.armorDark], [6, 7, KNIGHT_COLORS.plate], [7, 7, KNIGHT_COLORS.plateLight], [8, 7, KNIGHT_COLORS.plate], [9, 7, KNIGHT_COLORS.plateLight], [10, 7, KNIGHT_COLORS.plate], [11, 7, KNIGHT_COLORS.armorDark],
  [4, 8, KNIGHT_COLORS.armorDark], [5, 8, KNIGHT_COLORS.armor], [6, 8, KNIGHT_COLORS.plate], [7, 8, KNIGHT_COLORS.plateLight], [8, 8, KNIGHT_COLORS.plate], [9, 8, KNIGHT_COLORS.plateLight], [10, 8, KNIGHT_COLORS.plate], [11, 8, KNIGHT_COLORS.armor], [12, 8, KNIGHT_COLORS.armorDark],
  [4, 9, KNIGHT_COLORS.armorDark], [5, 9, KNIGHT_COLORS.armor], [6, 9, KNIGHT_COLORS.plate], [7, 9, KNIGHT_COLORS.plateLight], [8, 9, KNIGHT_COLORS.plate], [9, 9, KNIGHT_COLORS.plateLight], [10, 9, KNIGHT_COLORS.plate], [11, 9, KNIGHT_COLORS.armor], [12, 9, KNIGHT_COLORS.armorDark],
  [4, 10, KNIGHT_COLORS.armorDark], [5, 10, KNIGHT_COLORS.armor], [6, 10, KNIGHT_COLORS.plate], [7, 10, KNIGHT_COLORS.plateLight], [8, 10, KNIGHT_COLORS.armor], [9, 10, KNIGHT_COLORS.plate], [10, 10, KNIGHT_COLORS.plateLight], [11, 10, KNIGHT_COLORS.armor], [12, 10, KNIGHT_COLORS.armorDark],
  [5, 11, KNIGHT_COLORS.belt], [6, 11, KNIGHT_COLORS.plateLight], [7, 11, KNIGHT_COLORS.plate], [8, 11, KNIGHT_COLORS.plate], [9, 11, KNIGHT_COLORS.plateLight], [10, 11, KNIGHT_COLORS.belt], [11, 11, KNIGHT_COLORS.belt],
  [5, 12, KNIGHT_COLORS.armor], [6, 12, KNIGHT_COLORS.armorDark], [7, 12, KNIGHT_COLORS.armor], [8, 12, KNIGHT_COLORS.armorLight], [9, 12, KNIGHT_COLORS.armor], [10, 12, KNIGHT_COLORS.armorDark], [11, 12, KNIGHT_COLORS.armor],
  [6, 13, KNIGHT_COLORS.plate], [7, 13, KNIGHT_COLORS.plateLight], [8, 13, KNIGHT_COLORS.plate], [9, 13, KNIGHT_COLORS.plateLight], [10, 13, KNIGHT_COLORS.plate],
  [6, 14, KNIGHT_COLORS.armor], [7, 14, KNIGHT_COLORS.plate], [8, 14, KNIGHT_COLORS.plateLight], [9, 14, KNIGHT_COLORS.plate], [10, 14, KNIGHT_COLORS.armor],
  [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.boot], [9, 15, KNIGHT_COLORS.bootDark], [10, 15, KNIGHT_COLORS.boot],
  [2, 10, KNIGHT_COLORS.swordGlow],
  [2, 11, KNIGHT_COLORS.swordLight], [3, 11, KNIGHT_COLORS.sword],
  [2, 12, KNIGHT_COLORS.sword], [3, 12, KNIGHT_COLORS.swordDark],
  [3, 13, KNIGHT_COLORS.hilt],
  [3, 14, KNIGHT_COLORS.hiltDark],
  [11, 11, KNIGHT_COLORS.shield], [12, 11, KNIGHT_COLORS.shieldDark],
  [11, 12, KNIGHT_COLORS.shieldLight], [12, 12, KNIGHT_COLORS.shield],
  [11, 13, KNIGHT_COLORS.shield], [12, 13, KNIGHT_COLORS.shieldEmblem],
  [7, 15, KNIGHT_COLORS.aura], [9, 15, KNIGHT_COLORS.aura],
]

const KNIGHT_FACE_RIGHT = [
  [7, 0, KNIGHT_COLORS.helmet], [8, 0, KNIGHT_COLORS.helmetLight], [9, 0, KNIGHT_COLORS.helmet],
  [6, 1, KNIGHT_COLORS.helmet], [7, 1, KNIGHT_COLORS.helmet], [8, 1, KNIGHT_COLORS.helmetLight], [9, 1, KNIGHT_COLORS.helmet], [10, 1, KNIGHT_COLORS.helmetLight],
  [6, 2, KNIGHT_COLORS.helmetDark], [7, 2, KNIGHT_COLORS.helmet], [8, 2, KNIGHT_COLORS.helmetLight], [9, 2, KNIGHT_COLORS.helmet], [10, 2, KNIGHT_COLORS.helmetDark],
  [6, 3, KNIGHT_COLORS.helmetDark], [7, 3, KNIGHT_COLORS.helmet], [8, 3, KNIGHT_COLORS.helmetLight], [9, 3, KNIGHT_COLORS.helmet], [10, 3, KNIGHT_COLORS.helmetDark],
  [6, 4, KNIGHT_COLORS.helmetDark], [7, 4, KNIGHT_COLORS.helmet], [8, 4, KNIGHT_COLORS.visor], [9, 4, KNIGHT_COLORS.visorGlow], [10, 4, KNIGHT_COLORS.helmetDark],
  [6, 5, KNIGHT_COLORS.helmetDark], [7, 5, KNIGHT_COLORS.helmet], [8, 5, KNIGHT_COLORS.visorGlow], [9, 5, KNIGHT_COLORS.visor], [10, 5, KNIGHT_COLORS.helmetDark],
  [7, 6, KNIGHT_COLORS.helmet], [8, 6, KNIGHT_COLORS.helmetDark], [9, 6, KNIGHT_COLORS.armorEdge],
  [5, 7, KNIGHT_COLORS.armorDark], [6, 7, KNIGHT_COLORS.plate], [7, 7, KNIGHT_COLORS.plateLight], [8, 7, KNIGHT_COLORS.plate], [9, 7, KNIGHT_COLORS.plateLight], [10, 7, KNIGHT_COLORS.plate], [11, 7, KNIGHT_COLORS.armorDark],
  [4, 8, KNIGHT_COLORS.armorDark], [5, 8, KNIGHT_COLORS.armor], [6, 8, KNIGHT_COLORS.plate], [7, 8, KNIGHT_COLORS.plateLight], [8, 8, KNIGHT_COLORS.plate], [9, 8, KNIGHT_COLORS.plateLight], [10, 8, KNIGHT_COLORS.plate], [11, 8, KNIGHT_COLORS.armor], [12, 8, KNIGHT_COLORS.armorDark],
  [4, 9, KNIGHT_COLORS.armorDark], [5, 9, KNIGHT_COLORS.armor], [6, 9, KNIGHT_COLORS.plateLight], [7, 9, KNIGHT_COLORS.plate], [8, 9, KNIGHT_COLORS.plateLight], [9, 9, KNIGHT_COLORS.plate], [10, 9, KNIGHT_COLORS.plateLight], [11, 9, KNIGHT_COLORS.armor], [12, 9, KNIGHT_COLORS.armorDark],
  [4, 10, KNIGHT_COLORS.armorDark], [5, 10, KNIGHT_COLORS.armor], [6, 10, KNIGHT_COLORS.plateLight], [7, 10, KNIGHT_COLORS.plate], [8, 10, KNIGHT_COLORS.plateLight], [9, 10, KNIGHT_COLORS.plate], [10, 10, KNIGHT_COLORS.plateLight], [11, 10, KNIGHT_COLORS.armor], [12, 10, KNIGHT_COLORS.armorDark],
  [5, 11, KNIGHT_COLORS.belt], [6, 11, KNIGHT_COLORS.belt], [7, 11, KNIGHT_COLORS.plate], [8, 11, KNIGHT_COLORS.plateLight], [9, 11, KNIGHT_COLORS.plate], [10, 11, KNIGHT_COLORS.plateLight], [11, 11, KNIGHT_COLORS.belt],
  [5, 12, KNIGHT_COLORS.armor], [6, 12, KNIGHT_COLORS.armor], [7, 12, KNIGHT_COLORS.armorLight], [8, 12, KNIGHT_COLORS.armor], [9, 12, KNIGHT_COLORS.armorDark], [10, 12, KNIGHT_COLORS.armor], [11, 12, KNIGHT_COLORS.armorDark],
  [6, 13, KNIGHT_COLORS.plate], [7, 13, KNIGHT_COLORS.plateLight], [8, 13, KNIGHT_COLORS.plate], [9, 13, KNIGHT_COLORS.plateLight], [10, 13, KNIGHT_COLORS.plate],
  [6, 14, KNIGHT_COLORS.armor], [7, 14, KNIGHT_COLORS.plate], [8, 14, KNIGHT_COLORS.plateLight], [9, 14, KNIGHT_COLORS.plate], [10, 14, KNIGHT_COLORS.armor],
  [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.boot], [9, 15, KNIGHT_COLORS.bootDark], [10, 15, KNIGHT_COLORS.boot],
  [15, 10, KNIGHT_COLORS.swordGlow],
  [14, 11, KNIGHT_COLORS.sword], [15, 11, KNIGHT_COLORS.swordLight],
  [14, 12, KNIGHT_COLORS.swordDark], [15, 12, KNIGHT_COLORS.sword],
  [14, 13, KNIGHT_COLORS.hilt],
  [14, 14, KNIGHT_COLORS.hiltDark],
  [4, 11, KNIGHT_COLORS.shieldDark], [5, 11, KNIGHT_COLORS.shield],
  [4, 12, KNIGHT_COLORS.shield], [5, 12, KNIGHT_COLORS.shieldLight],
  [4, 13, KNIGHT_COLORS.shieldEmblem], [5, 13, KNIGHT_COLORS.shield],
  [7, 15, KNIGHT_COLORS.aura], [9, 15, KNIGHT_COLORS.aura],
]

const KNIGHT_IDLE_FRAMES = [
  [
    { pixels: [
      [7, 4, KNIGHT_COLORS.visor], [10, 4, KNIGHT_COLORS.visor],
      [7, 5, KNIGHT_COLORS.visorGlow], [10, 5, KNIGHT_COLORS.visorGlow],
      [7, 15, KNIGHT_COLORS.aura], [10, 15, KNIGHT_COLORS.aura],
    ] }
  ],
  [
    { pixels: [
      [7, 4, KNIGHT_COLORS.visorGlow], [10, 4, KNIGHT_COLORS.visorGlow],
      [7, 5, KNIGHT_COLORS.spark], [10, 5, KNIGHT_COLORS.spark],
      [7, 15, KNIGHT_COLORS.auraLight], [10, 15, KNIGHT_COLORS.auraLight],
      [8, 15, KNIGHT_COLORS.spark], [9, 15, KNIGHT_COLORS.spark],
    ] }
  ],
]

const KNIGHT_WALK_FRAMES = [
  [
    { pixels: [
      [6, 15, KNIGHT_COLORS.bootDark], [7, 15, KNIGHT_COLORS.boot], [8, 15, KNIGHT_COLORS.bootDark], [9, 15, KNIGHT_COLORS.boot], [10, 15, KNIGHT_COLORS.bootDark], [11, 15, KNIGHT_COLORS.boot],
    ] }
  ],
  [
    { pixels: [
      [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.boot], [9, 15, KNIGHT_COLORS.boot], [10, 15, KNIGHT_COLORS.bootDark], [11, 15, KNIGHT_COLORS.boot],
    ] }
  ],
  [
    { pixels: [
      [6, 15, KNIGHT_COLORS.boot], [7, 15, KNIGHT_COLORS.bootDark], [8, 15, KNIGHT_COLORS.boot], [9, 15, KNIGHT_COLORS.bootDark], [10, 15, KNIGHT_COLORS.boot], [11, 15, KNIGHT_COLORS.bootDark],
    ] }
  ],
]

export const drawPhantomKnight = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: KNIGHT_FACE_DOWN,
  up: KNIGHT_FACE_UP,
  left: KNIGHT_FACE_LEFT,
  right: KNIGHT_FACE_RIGHT,
  walk: KNIGHT_WALK_FRAMES,
  idle: KNIGHT_IDLE_FRAMES,
})

export const drawPhantomKnightAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, KNIGHT_AVATAR)