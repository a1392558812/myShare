import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.003,
  WALK_SPEED: 0.1,
}

const QUEEN_COLORS = {
  crown: '#E8F0FF',
  crownDark: '#B8D0F0',
  crownLight: '#FFFFFF',
  crownGem: '#80D0FF',
  crownGemGlow: '#A0E8FF',
  crownGemLight: '#C0F0FF',
  hair: '#B8D8F8',
  hairDark: '#88A8D0',
  hairLight: '#E8F4FF',
  hairSilver: '#D0E0F0',
  skin: '#F8F0F0',
  skinDark: '#E8D8D8',
  skinLight: '#FFF8F8',
  eye: '#60A0E0',
  eyeGlow: '#80C0FF',
  eyeInner: '#C0E8FF',
  dress: '#C0E0FF',
  dressDark: '#88B8E0',
  dressLight: '#E8F4FF',
  dressIce: '#A0D0F0',
  dressWhite: '#FFFFFF',
  dressGold: '#D4AF37',
  cape: '#B0D0F0',
  capeDark: '#80A8D0',
  capeLight: '#E0F0FF',
  capeWhite: '#FFFFFF',
  crystal: '#80D0FF',
  crystalLight: '#C0F0FF',
  crystalGlow: '#A0E8FF',
  crystalDark: '#60A8D0',
  iceMagic: '#A0E0FF',
  iceMagicGlow: '#C0F0FF',
  iceMagicLight: '#E0F8FF',
  iceMagicDark: '#70B8E0',
  snow: '#FFFFFF',
  snowLight: '#F0F8FF',
  sparkle: '#C0E8FF',
  sparkleLight: '#E0F8FF',
  boot: '#B0C8E0',
  bootDark: '#88A0C0',
  bootLight: '#D0E0F0',
  staff: '#D0D8E0',
  staffDark: '#A0A8B0',
  staffLight: '#F0F4F8',
  staffGem: '#80D0FF',
  staffGemGlow: '#A0E8FF',
  highlight: '#FFFFFF',
}

const QUEEN_AVATAR = [
  [4, 0, QUEEN_COLORS.crownDark], [5, 0, QUEEN_COLORS.crown], [6, 0, QUEEN_COLORS.crownLight], [7, 0, QUEEN_COLORS.crownLight], [8, 0, QUEEN_COLORS.crownLight], [9, 0, QUEEN_COLORS.crown], [10, 0, QUEEN_COLORS.crownDark],
  [3, 1, QUEEN_COLORS.crown], [4, 1, QUEEN_COLORS.crownLight], [5, 1, QUEEN_COLORS.crown], [6, 1, QUEEN_COLORS.crownGem], [7, 1, QUEEN_COLORS.crownGemGlow], [8, 1, QUEEN_COLORS.crownGem], [9, 1, QUEEN_COLORS.crownLight], [10, 1, QUEEN_COLORS.crown], [11, 1, QUEEN_COLORS.crownDark],
  [3, 2, QUEEN_COLORS.crownDark], [4, 2, QUEEN_COLORS.crown], [5, 2, QUEEN_COLORS.crownLight], [6, 2, QUEEN_COLORS.crown], [7, 2, QUEEN_COLORS.crownLight], [8, 2, QUEEN_COLORS.crown], [9, 2, QUEEN_COLORS.crownLight], [10, 2, QUEEN_COLORS.crown], [11, 2, QUEEN_COLORS.crownDark],

  [2, 3, QUEEN_COLORS.hairDark], [3, 3, QUEEN_COLORS.hair], [4, 3, QUEEN_COLORS.hairLight], [5, 3, QUEEN_COLORS.hair], [6, 3, QUEEN_COLORS.skin], [7, 3, QUEEN_COLORS.skin], [8, 3, QUEEN_COLORS.skin], [9, 3, QUEEN_COLORS.hair], [10, 3, QUEEN_COLORS.hairLight], [11, 3, QUEEN_COLORS.hair], [12, 3, QUEEN_COLORS.hairDark],
  [2, 4, QUEEN_COLORS.hair], [3, 4, QUEEN_COLORS.hairLight], [4, 4, QUEEN_COLORS.hair], [5, 4, QUEEN_COLORS.hairLight], [6, 4, QUEEN_COLORS.skinLight], [7, 4, QUEEN_COLORS.skin], [8, 4, QUEEN_COLORS.skin], [9, 4, QUEEN_COLORS.skinLight], [10, 4, QUEEN_COLORS.hairLight], [11, 4, QUEEN_COLORS.hair], [12, 4, QUEEN_COLORS.hairDark],

  [2, 5, QUEEN_COLORS.hairDark], [3, 5, QUEEN_COLORS.hair], [4, 5, QUEEN_COLORS.eye], [5, 5, QUEEN_COLORS.eyeGlow], [6, 5, QUEEN_COLORS.skin], [7, 5, QUEEN_COLORS.skin], [8, 5, QUEEN_COLORS.skin], [9, 5, QUEEN_COLORS.eye], [10, 5, QUEEN_COLORS.eyeGlow], [11, 5, QUEEN_COLORS.hair], [12, 5, QUEEN_COLORS.hairDark],
  [4, 4, QUEEN_COLORS.highlight], [5, 4, QUEEN_COLORS.highlight], [9, 4, QUEEN_COLORS.highlight], [10, 4, QUEEN_COLORS.highlight],
  [4, 5, QUEEN_COLORS.highlight], [10, 5, QUEEN_COLORS.highlight],

  [4, 5, QUEEN_COLORS.eyeGlow], [5, 5, QUEEN_COLORS.eyeGlow], [9, 5, QUEEN_COLORS.eyeGlow], [10, 5, QUEEN_COLORS.eyeGlow],
  [4, 6, QUEEN_COLORS.eyeInner], [5, 6, QUEEN_COLORS.eyeInner], [9, 6, QUEEN_COLORS.eyeInner], [10, 6, QUEEN_COLORS.eyeInner],

  [2, 6, QUEEN_COLORS.hair], [3, 6, QUEEN_COLORS.hairLight], [4, 6, QUEEN_COLORS.eyeGlow], [5, 6, QUEEN_COLORS.eyeInner], [6, 6, QUEEN_COLORS.skin], [7, 6, QUEEN_COLORS.skin], [8, 6, QUEEN_COLORS.skin], [9, 6, QUEEN_COLORS.eyeInner], [10, 6, QUEEN_COLORS.eyeGlow], [11, 6, QUEEN_COLORS.hairLight], [12, 6, QUEEN_COLORS.hair],
  [3, 7, QUEEN_COLORS.hairDark], [4, 7, QUEEN_COLORS.hair], [5, 7, QUEEN_COLORS.eyeGlow], [6, 7, QUEEN_COLORS.skinLight], [7, 7, QUEEN_COLORS.skinDark], [8, 7, QUEEN_COLORS.skinDark], [9, 7, QUEEN_COLORS.skinLight], [10, 7, QUEEN_COLORS.eyeGlow], [11, 7, QUEEN_COLORS.hair], [12, 7, QUEEN_COLORS.hairDark],

  [3, 8, QUEEN_COLORS.hair], [4, 8, QUEEN_COLORS.hairLight], [5, 8, QUEEN_COLORS.skin], [6, 8, QUEEN_COLORS.skinDark], [7, 8, QUEEN_COLORS.skin], [8, 8, QUEEN_COLORS.skin], [9, 8, QUEEN_COLORS.skinDark], [10, 8, QUEEN_COLORS.skin], [11, 8, QUEEN_COLORS.hairLight], [12, 8, QUEEN_COLORS.hair],
  [4, 9, QUEEN_COLORS.hairDark], [5, 9, QUEEN_COLORS.skinLight], [6, 9, QUEEN_COLORS.skin], [7, 9, QUEEN_COLORS.skin], [8, 9, QUEEN_COLORS.skin], [9, 9, QUEEN_COLORS.skin], [10, 9, QUEEN_COLORS.skinLight], [11, 9, QUEEN_COLORS.hairDark],

  [4, 10, QUEEN_COLORS.hair], [5, 10, QUEEN_COLORS.skin], [6, 10, QUEEN_COLORS.skinLight], [7, 10, QUEEN_COLORS.crownGemLight], [8, 10, QUEEN_COLORS.skinLight], [9, 10, QUEEN_COLORS.skin], [10, 10, QUEEN_COLORS.hair],
  [5, 11, QUEEN_COLORS.crownGem], [6, 11, QUEEN_COLORS.crownGemGlow], [7, 11, QUEEN_COLORS.crownGemGlow], [8, 11, QUEEN_COLORS.crownGemGlow], [9, 11, QUEEN_COLORS.crownGem],

  [3, 12, QUEEN_COLORS.dressLight], [4, 12, QUEEN_COLORS.dress], [5, 12, QUEEN_COLORS.dressIce], [6, 12, QUEEN_COLORS.crystal], [7, 12, QUEEN_COLORS.crystalGlow], [8, 12, QUEEN_COLORS.crystal], [9, 12, QUEEN_COLORS.dressIce], [10, 12, QUEEN_COLORS.dress], [11, 12, QUEEN_COLORS.dressLight],
  [2, 13, QUEEN_COLORS.dressDark], [3, 13, QUEEN_COLORS.dress], [4, 13, QUEEN_COLORS.dressIce], [5, 13, QUEEN_COLORS.dressLight], [6, 13, QUEEN_COLORS.crystalGlow], [7, 13, QUEEN_COLORS.crystalLight], [8, 13, QUEEN_COLORS.crystalGlow], [9, 13, QUEEN_COLORS.dressLight], [10, 13, QUEEN_COLORS.dressIce], [11, 13, QUEEN_COLORS.dress], [12, 13, QUEEN_COLORS.dressDark],

  [6, 12, QUEEN_COLORS.sparkleLight], [7, 12, QUEEN_COLORS.sparkle], [8, 12, QUEEN_COLORS.sparkleLight],
  [6, 13, QUEEN_COLORS.sparkle], [7, 13, QUEEN_COLORS.snow], [8, 13, QUEEN_COLORS.sparkle],

  [4, 14, QUEEN_COLORS.dressDark], [5, 14, QUEEN_COLORS.dress], [6, 14, QUEEN_COLORS.dressLight], [7, 14, QUEEN_COLORS.crystalGlow], [8, 14, QUEEN_COLORS.dressLight], [9, 14, QUEEN_COLORS.dress], [10, 14, QUEEN_COLORS.dressDark],
  [4, 15, QUEEN_COLORS.dress], [5, 15, QUEEN_COLORS.dressIce], [6, 15, QUEEN_COLORS.crystal], [7, 15, QUEEN_COLORS.crystalGlow], [8, 15, QUEEN_COLORS.crystal], [9, 15, QUEEN_COLORS.dressIce], [10, 15, QUEEN_COLORS.dress],
]

const QUEEN_FACE_DOWN = [
  [7, 0, QUEEN_COLORS.crownDark], [8, 0, QUEEN_COLORS.crown], [9, 0, QUEEN_COLORS.crownLight], [10, 0, QUEEN_COLORS.crown], [11, 0, QUEEN_COLORS.crownDark],
  [6, 1, QUEEN_COLORS.crown], [7, 1, QUEEN_COLORS.crownLight], [8, 1, QUEEN_COLORS.crownGem], [9, 1, QUEEN_COLORS.crownGemGlow], [10, 1, QUEEN_COLORS.crownGem], [11, 1, QUEEN_COLORS.crownLight], [12, 1, QUEEN_COLORS.crown],
  [6, 2, QUEEN_COLORS.crownDark], [7, 2, QUEEN_COLORS.crown], [8, 2, QUEEN_COLORS.crownLight], [9, 2, QUEEN_COLORS.crown], [10, 2, QUEEN_COLORS.crownLight], [11, 2, QUEEN_COLORS.crown], [12, 2, QUEEN_COLORS.crownDark],
  [7, 3, QUEEN_COLORS.crownDark], [8, 3, QUEEN_COLORS.crown], [9, 3, QUEEN_COLORS.crownLight], [10, 3, QUEEN_COLORS.crown], [11, 3, QUEEN_COLORS.crownDark],

  [6, 4, QUEEN_COLORS.hair], [7, 4, QUEEN_COLORS.hairLight], [8, 4, QUEEN_COLORS.skin], [9, 4, QUEEN_COLORS.skin], [10, 4, QUEEN_COLORS.hairLight], [11, 4, QUEEN_COLORS.hair],
  [6, 5, QUEEN_COLORS.hairDark], [7, 5, QUEEN_COLORS.hair], [8, 5, QUEEN_COLORS.eye], [9, 5, QUEEN_COLORS.eyeGlow], [10, 5, QUEEN_COLORS.eye], [11, 5, QUEEN_COLORS.hair], [12, 5, QUEEN_COLORS.hairDark],
  [6, 6, QUEEN_COLORS.hair], [7, 6, QUEEN_COLORS.hairLight], [8, 6, QUEEN_COLORS.eyeGlow], [9, 6, QUEEN_COLORS.eyeInner], [10, 6, QUEEN_COLORS.eyeGlow], [11, 6, QUEEN_COLORS.hairLight], [12, 6, QUEEN_COLORS.hair],
  [6, 7, QUEEN_COLORS.hair], [7, 7, QUEEN_COLORS.skinLight], [8, 7, QUEEN_COLORS.skin], [9, 7, QUEEN_COLORS.skin], [10, 7, QUEEN_COLORS.skin], [11, 7, QUEEN_COLORS.skinLight], [12, 7, QUEEN_COLORS.hair],
  [7, 8, QUEEN_COLORS.hairDark], [8, 8, QUEEN_COLORS.skin], [9, 8, QUEEN_COLORS.skinDark], [10, 8, QUEEN_COLORS.skinDark], [11, 8, QUEEN_COLORS.skin], [12, 8, QUEEN_COLORS.hairDark],

  [8, 9, QUEEN_COLORS.crownGem], [9, 9, QUEEN_COLORS.crownGemGlow], [10, 9, QUEEN_COLORS.crownGem],
  [7, 10, QUEEN_COLORS.dressLight], [8, 10, QUEEN_COLORS.crownGemLight], [9, 10, QUEEN_COLORS.crownGemGlow], [10, 10, QUEEN_COLORS.crownGemLight], [11, 10, QUEEN_COLORS.dressLight],

  [6, 10, QUEEN_COLORS.dress], [7, 10, QUEEN_COLORS.dressIce], [11, 10, QUEEN_COLORS.dressIce], [12, 10, QUEEN_COLORS.dress],
  [6, 11, QUEEN_COLORS.dressDark], [7, 11, QUEEN_COLORS.dress], [8, 11, QUEEN_COLORS.dressLight], [9, 11, QUEEN_COLORS.dressLight], [10, 11, QUEEN_COLORS.dress], [11, 11, QUEEN_COLORS.dress], [12, 11, QUEEN_COLORS.dressDark],
  [5, 12, QUEEN_COLORS.dressDark], [6, 12, QUEEN_COLORS.dress], [7, 12, QUEEN_COLORS.dressIce], [8, 12, QUEEN_COLORS.dressWhite], [9, 12, QUEEN_COLORS.crystalGlow], [10, 12, QUEEN_COLORS.dressWhite], [11, 12, QUEEN_COLORS.dressIce], [12, 12, QUEEN_COLORS.dress], [13, 12, QUEEN_COLORS.dressDark],

  [4, 13, QUEEN_COLORS.dressDark], [5, 13, QUEEN_COLORS.dress], [6, 13, QUEEN_COLORS.dressIce], [7, 13, QUEEN_COLORS.dressLight], [8, 13, QUEEN_COLORS.dressWhite], [9, 13, QUEEN_COLORS.crystalGlow], [10, 13, QUEEN_COLORS.dressWhite], [11, 13, QUEEN_COLORS.dressLight], [12, 13, QUEEN_COLORS.dressIce], [13, 13, QUEEN_COLORS.dress], [14, 13, QUEEN_COLORS.dressDark],
  [3, 14, QUEEN_COLORS.dressDark], [4, 14, QUEEN_COLORS.dress], [5, 14, QUEEN_COLORS.dressLight], [6, 14, QUEEN_COLORS.dressIce], [7, 14, QUEEN_COLORS.dressWhite], [8, 14, QUEEN_COLORS.dressLight], [9, 14, QUEEN_COLORS.crystal], [10, 14, QUEEN_COLORS.dressLight], [11, 14, QUEEN_COLORS.dressWhite], [12, 14, QUEEN_COLORS.dressIce], [13, 14, QUEEN_COLORS.dressLight], [14, 14, QUEEN_COLORS.dress], [15, 14, QUEEN_COLORS.dressDark],
  [3, 15, QUEEN_COLORS.dressDark], [4, 15, QUEEN_COLORS.dressLight], [5, 15, QUEEN_COLORS.dressIce], [6, 15, QUEEN_COLORS.dressLight], [7, 15, QUEEN_COLORS.dressIce], [8, 15, QUEEN_COLORS.dressLight], [9, 15, QUEEN_COLORS.crystalLight], [10, 15, QUEEN_COLORS.dressLight], [11, 15, QUEEN_COLORS.dressIce], [12, 15, QUEEN_COLORS.dressLight], [13, 15, QUEEN_COLORS.dressIce], [14, 15, QUEEN_COLORS.dressLight], [15, 15, QUEEN_COLORS.dressDark],
  [4, 16, QUEEN_COLORS.dressDark], [5, 16, QUEEN_COLORS.dressIce], [6, 16, QUEEN_COLORS.dressLight], [7, 16, QUEEN_COLORS.dressIce], [8, 16, QUEEN_COLORS.crystalGlow], [9, 16, QUEEN_COLORS.crystalLight], [10, 16, QUEEN_COLORS.crystalGlow], [11, 16, QUEEN_COLORS.dressIce], [12, 16, QUEEN_COLORS.dressLight], [13, 16, QUEEN_COLORS.dressIce], [14, 16, QUEEN_COLORS.dressDark],

  [2, 11, QUEEN_COLORS.skinLight], [3, 11, QUEEN_COLORS.skin],
  [2, 12, QUEEN_COLORS.skin], [3, 12, QUEEN_COLORS.skinDark],
  [2, 13, QUEEN_COLORS.staffDark], [3, 13, QUEEN_COLORS.staff],
  [2, 14, QUEEN_COLORS.staff], [3, 14, QUEEN_COLORS.staffLight],
  [2, 15, QUEEN_COLORS.staffDark],
  [2, 16, QUEEN_COLORS.staffGem],
  [2, 17, QUEEN_COLORS.staffGemGlow], [3, 17, QUEEN_COLORS.staffGemLight],

  [15, 11, QUEEN_COLORS.skin], [16, 11, QUEEN_COLORS.skinLight],
  [15, 12, QUEEN_COLORS.skinDark], [16, 12, QUEEN_COLORS.skin],
  [16, 13, QUEEN_COLORS.crystalGlow],

  [8, 17, QUEEN_COLORS.iceMagic], [9, 17, QUEEN_COLORS.iceMagicGlow], [10, 17, QUEEN_COLORS.iceMagic],
  [7, 18, QUEEN_COLORS.snow], [8, 18, QUEEN_COLORS.snowLight], [9, 18, QUEEN_COLORS.sparkle], [10, 18, QUEEN_COLORS.snowLight], [11, 18, QUEEN_COLORS.snow],
]

const QUEEN_FACE_UP = [
  [7, 0, QUEEN_COLORS.crownDark], [8, 0, QUEEN_COLORS.crown], [9, 0, QUEEN_COLORS.crownLight], [10, 0, QUEEN_COLORS.crown], [11, 0, QUEEN_COLORS.crownDark],
  [6, 1, QUEEN_COLORS.crown], [7, 1, QUEEN_COLORS.crownLight], [8, 1, QUEEN_COLORS.crownGem], [9, 1, QUEEN_COLORS.crownGemGlow], [10, 1, QUEEN_COLORS.crownGem], [11, 1, QUEEN_COLORS.crownLight], [12, 1, QUEEN_COLORS.crown],
  [6, 2, QUEEN_COLORS.crownDark], [7, 2, QUEEN_COLORS.crown], [8, 2, QUEEN_COLORS.crownLight], [9, 2, QUEEN_COLORS.crown], [10, 2, QUEEN_COLORS.crownLight], [11, 2, QUEEN_COLORS.crown], [12, 2, QUEEN_COLORS.crownDark],
  [7, 3, QUEEN_COLORS.crownDark], [8, 3, QUEEN_COLORS.crown], [9, 3, QUEEN_COLORS.crownLight], [10, 3, QUEEN_COLORS.crown], [11, 3, QUEEN_COLORS.crownDark],

  [6, 4, QUEEN_COLORS.hair], [7, 4, QUEEN_COLORS.hairLight], [8, 4, QUEEN_COLORS.hair], [9, 4, QUEEN_COLORS.hair], [10, 4, QUEEN_COLORS.hairLight], [11, 4, QUEEN_COLORS.hair],
  [5, 5, QUEEN_COLORS.hairDark], [6, 5, QUEEN_COLORS.hair], [7, 5, QUEEN_COLORS.hairLight], [8, 5, QUEEN_COLORS.hair], [9, 5, QUEEN_COLORS.hair], [10, 5, QUEEN_COLORS.hairLight], [11, 5, QUEEN_COLORS.hair], [12, 5, QUEEN_COLORS.hairDark],
  [5, 6, QUEEN_COLORS.hair], [6, 6, QUEEN_COLORS.hairLight], [7, 6, QUEEN_COLORS.hair], [8, 6, QUEEN_COLORS.hairLight], [9, 6, QUEEN_COLORS.hairLight], [10, 6, QUEEN_COLORS.hair], [11, 6, QUEEN_COLORS.hairLight], [12, 6, QUEEN_COLORS.hair],
  [5, 7, QUEEN_COLORS.hairDark], [6, 7, QUEEN_COLORS.hair], [7, 7, QUEEN_COLORS.hairLight], [8, 7, QUEEN_COLORS.hair], [9, 7, QUEEN_COLORS.hair], [10, 7, QUEEN_COLORS.hairLight], [11, 7, QUEEN_COLORS.hair], [12, 7, QUEEN_COLORS.hairDark],

  [4, 8, QUEEN_COLORS.capeDark], [5, 8, QUEEN_COLORS.cape], [6, 8, QUEEN_COLORS.capeLight], [7, 8, QUEEN_COLORS.crystalGlow], [8, 8, QUEEN_COLORS.crystalLight], [9, 8, QUEEN_COLORS.crystalLight], [10, 8, QUEEN_COLORS.crystalGlow], [11, 8, QUEEN_COLORS.capeLight], [12, 8, QUEEN_COLORS.cape], [13, 8, QUEEN_COLORS.capeDark],
  [4, 9, QUEEN_COLORS.capeDark], [5, 9, QUEEN_COLORS.capeLight], [6, 9, QUEEN_COLORS.capeWhite], [7, 9, QUEEN_COLORS.capeLight], [8, 9, QUEEN_COLORS.crystal], [9, 9, QUEEN_COLORS.crystal], [10, 9, QUEEN_COLORS.capeLight], [11, 9, QUEEN_COLORS.capeWhite], [12, 9, QUEEN_COLORS.capeLight], [13, 9, QUEEN_COLORS.capeDark],
  [4, 10, QUEEN_COLORS.capeDark], [5, 10, QUEEN_COLORS.cape], [6, 10, QUEEN_COLORS.capeLight], [7, 10, QUEEN_COLORS.dressLight], [8, 10, QUEEN_COLORS.crystalGlow], [9, 10, QUEEN_COLORS.crystalGlow], [10, 10, QUEEN_COLORS.dressLight], [11, 10, QUEEN_COLORS.capeLight], [12, 10, QUEEN_COLORS.cape], [13, 10, QUEEN_COLORS.capeDark],
  [4, 11, QUEEN_COLORS.dressDark], [5, 11, QUEEN_COLORS.dress], [6, 11, QUEEN_COLORS.dressIce], [7, 11, QUEEN_COLORS.dressWhite], [8, 11, QUEEN_COLORS.dressLight], [9, 11, QUEEN_COLORS.dressLight], [10, 11, QUEEN_COLORS.dressWhite], [11, 11, QUEEN_COLORS.dressIce], [12, 11, QUEEN_COLORS.dress], [13, 11, QUEEN_COLORS.dressDark],

  [4, 12, QUEEN_COLORS.dressDark], [5, 12, QUEEN_COLORS.dress], [6, 12, QUEEN_COLORS.dressIce], [7, 12, QUEEN_COLORS.dressLight], [8, 12, QUEEN_COLORS.dressWhite], [9, 12, QUEEN_COLORS.crystalGlow], [10, 12, QUEEN_COLORS.dressWhite], [11, 12, QUEEN_COLORS.dressLight], [12, 12, QUEEN_COLORS.dressIce], [13, 12, QUEEN_COLORS.dress], [14, 12, QUEEN_COLORS.dressDark],
  [3, 13, QUEEN_COLORS.dressDark], [4, 13, QUEEN_COLORS.dress], [5, 13, QUEEN_COLORS.dressLight], [6, 13, QUEEN_COLORS.dressIce], [7, 13, QUEEN_COLORS.dressWhite], [8, 13, QUEEN_COLORS.dressLight], [9, 13, QUEEN_COLORS.crystal], [10, 13, QUEEN_COLORS.dressLight], [11, 13, QUEEN_COLORS.dressWhite], [12, 13, QUEEN_COLORS.dressIce], [13, 13, QUEEN_COLORS.dressLight], [14, 13, QUEEN_COLORS.dress], [15, 13, QUEEN_COLORS.dressDark],
  [3, 14, QUEEN_COLORS.dressDark], [4, 14, QUEEN_COLORS.dressLight], [5, 14, QUEEN_COLORS.dressIce], [6, 14, QUEEN_COLORS.dressLight], [7, 14, QUEEN_COLORS.dressIce], [8, 14, QUEEN_COLORS.dressLight], [9, 14, QUEEN_COLORS.crystalLight], [10, 14, QUEEN_COLORS.dressLight], [11, 14, QUEEN_COLORS.dressIce], [12, 14, QUEEN_COLORS.dressLight], [13, 14, QUEEN_COLORS.dressIce], [14, 14, QUEEN_COLORS.dressLight], [15, 14, QUEEN_COLORS.dressDark],
  [4, 15, QUEEN_COLORS.dressDark], [5, 15, QUEEN_COLORS.dressIce], [6, 15, QUEEN_COLORS.dressLight], [7, 15, QUEEN_COLORS.dressIce], [8, 15, QUEEN_COLORS.crystalGlow], [9, 15, QUEEN_COLORS.crystalLight], [10, 15, QUEEN_COLORS.crystalGlow], [11, 15, QUEEN_COLORS.dressIce], [12, 15, QUEEN_COLORS.dressLight], [13, 15, QUEEN_COLORS.dressIce], [14, 15, QUEEN_COLORS.dressDark],

  [14, 9, QUEEN_COLORS.staffDark],
  [14, 10, QUEEN_COLORS.staff],
  [14, 11, QUEEN_COLORS.staffLight],
  [14, 12, QUEEN_COLORS.staffGem],
  [14, 13, QUEEN_COLORS.staffGemGlow],

  [8, 15, QUEEN_COLORS.iceMagic], [9, 15, QUEEN_COLORS.iceMagicGlow], [10, 15, QUEEN_COLORS.iceMagic],
]

const QUEEN_FACE_LEFT = [
  [7, 0, QUEEN_COLORS.crownDark], [8, 0, QUEEN_COLORS.crown],
  [6, 1, QUEEN_COLORS.crown], [7, 1, QUEEN_COLORS.crownLight], [8, 1, QUEEN_COLORS.crownGem],
  [6, 2, QUEEN_COLORS.crownDark], [7, 2, QUEEN_COLORS.crown], [8, 2, QUEEN_COLORS.crownLight],
  [6, 3, QUEEN_COLORS.crownDark], [7, 3, QUEEN_COLORS.crown], [8, 3, QUEEN_COLORS.crownLight],

  [6, 4, QUEEN_COLORS.hair], [7, 4, QUEEN_COLORS.hairLight], [8, 4, QUEEN_COLORS.skin],
  [6, 5, QUEEN_COLORS.hairDark], [7, 5, QUEEN_COLORS.eye], [8, 5, QUEEN_COLORS.eyeGlow],
  [6, 6, QUEEN_COLORS.hair], [7, 6, QUEEN_COLORS.eyeGlow], [8, 6, QUEEN_COLORS.eyeInner],
  [6, 7, QUEEN_COLORS.hair], [7, 7, QUEEN_COLORS.skinLight], [8, 7, QUEEN_COLORS.skin],
  [7, 8, QUEEN_COLORS.hairDark], [8, 8, QUEEN_COLORS.skinDark],
  [7, 9, QUEEN_COLORS.hairDark], [8, 9, QUEEN_COLORS.crownGemLight],

  [6, 10, QUEEN_COLORS.dress], [7, 10, QUEEN_COLORS.dressIce], [8, 10, QUEEN_COLORS.dressLight],
  [5, 11, QUEEN_COLORS.dressDark], [6, 11, QUEEN_COLORS.dress], [7, 11, QUEEN_COLORS.dressIce], [8, 11, QUEEN_COLORS.dressWhite], [9, 11, QUEEN_COLORS.crystalGlow],
  [5, 12, QUEEN_COLORS.dressDark], [6, 12, QUEEN_COLORS.dressLight], [7, 12, QUEEN_COLORS.dressIce], [8, 12, QUEEN_COLORS.dressWhite], [9, 12, QUEEN_COLORS.crystal],
  [4, 13, QUEEN_COLORS.dressDark], [5, 13, QUEEN_COLORS.dress], [6, 13, QUEEN_COLORS.dressLight], [7, 13, QUEEN_COLORS.dressIce], [8, 13, QUEEN_COLORS.dressWhite], [9, 13, QUEEN_COLORS.dressLight], [10, 13, QUEEN_COLORS.dressIce], [11, 13, QUEEN_COLORS.dress],
  [4, 14, QUEEN_COLORS.dressDark], [5, 14, QUEEN_COLORS.dressLight], [6, 14, QUEEN_COLORS.dressIce], [7, 14, QUEEN_COLORS.dressLight], [8, 14, QUEEN_COLORS.dressIce], [9, 14, QUEEN_COLORS.crystalLight], [10, 14, QUEEN_COLORS.dressLight], [11, 14, QUEEN_COLORS.dress], [12, 14, QUEEN_COLORS.dressDark],
  [3, 15, QUEEN_COLORS.dressDark], [4, 15, QUEEN_COLORS.dressIce], [5, 15, QUEEN_COLORS.dressLight], [6, 15, QUEEN_COLORS.dressIce], [7, 15, QUEEN_COLORS.dressLight], [8, 15, QUEEN_COLORS.crystalGlow], [9, 15, QUEEN_COLORS.dressLight], [10, 15, QUEEN_COLORS.dressIce], [11, 15, QUEEN_COLORS.dressLight], [12, 15, QUEEN_COLORS.dress],
  [4, 16, QUEEN_COLORS.dressDark], [5, 16, QUEEN_COLORS.dressIce], [6, 16, QUEEN_COLORS.dressLight], [7, 16, QUEEN_COLORS.crystalGlow], [8, 16, QUEEN_COLORS.crystalLight], [9, 16, QUEEN_COLORS.crystalGlow], [10, 16, QUEEN_COLORS.dressIce], [11, 16, QUEEN_COLORS.dressLight], [12, 16, QUEEN_COLORS.dressDark],

  [2, 10, QUEEN_COLORS.skinLight], [3, 10, QUEEN_COLORS.skin],
  [2, 11, QUEEN_COLORS.skin], [3, 11, QUEEN_COLORS.staffDark],
  [2, 12, QUEEN_COLORS.staff], [3, 12, QUEEN_COLORS.staffLight],
  [2, 13, QUEEN_COLORS.staffDark],
  [2, 14, QUEEN_COLORS.staffGem],
  [2, 15, QUEEN_COLORS.staffGemGlow], [3, 15, QUEEN_COLORS.staffGemLight],
  [3, 16, QUEEN_COLORS.iceMagicGlow],

  [8, 17, QUEEN_COLORS.iceMagic], [9, 17, QUEEN_COLORS.iceMagicGlow],
  [7, 18, QUEEN_COLORS.snow], [8, 18, QUEEN_COLORS.snowLight], [9, 18, QUEEN_COLORS.sparkle],
]

const QUEEN_FACE_RIGHT = [
  [7, 0, QUEEN_COLORS.crown], [8, 0, QUEEN_COLORS.crownDark],
  [7, 1, QUEEN_COLORS.crownGem], [8, 1, QUEEN_COLORS.crownLight], [9, 1, QUEEN_COLORS.crown],
  [7, 2, QUEEN_COLORS.crownLight], [8, 2, QUEEN_COLORS.crown], [9, 2, QUEEN_COLORS.crownDark],
  [7, 3, QUEEN_COLORS.crownLight], [8, 3, QUEEN_COLORS.crown], [9, 3, QUEEN_COLORS.crownDark],

  [7, 4, QUEEN_COLORS.skin], [8, 4, QUEEN_COLORS.hairLight], [9, 4, QUEEN_COLORS.hair],
  [7, 5, QUEEN_COLORS.eyeGlow], [8, 5, QUEEN_COLORS.eye], [9, 5, QUEEN_COLORS.hairDark],
  [7, 6, QUEEN_COLORS.eyeInner], [8, 6, QUEEN_COLORS.eyeGlow], [9, 6, QUEEN_COLORS.hair],
  [7, 7, QUEEN_COLORS.skin], [8, 7, QUEEN_COLORS.skinLight], [9, 7, QUEEN_COLORS.hair],
  [7, 8, QUEEN_COLORS.skinDark], [8, 8, QUEEN_COLORS.hairDark],
  [7, 9, QUEEN_COLORS.crownGemLight], [8, 9, QUEEN_COLORS.hairDark],

  [7, 10, QUEEN_COLORS.dressLight], [8, 10, QUEEN_COLORS.dressIce], [9, 10, QUEEN_COLORS.dress],
  [7, 11, QUEEN_COLORS.crystalGlow], [8, 11, QUEEN_COLORS.dressWhite], [9, 11, QUEEN_COLORS.dressIce], [10, 11, QUEEN_COLORS.dressDark],
  [7, 12, QUEEN_COLORS.crystal], [8, 12, QUEEN_COLORS.dressWhite], [9, 12, QUEEN_COLORS.dressIce], [10, 12, QUEEN_COLORS.dressLight], [11, 12, QUEEN_COLORS.dressDark],
  [7, 13, QUEEN_COLORS.dress], [8, 13, QUEEN_COLORS.dressLight], [9, 13, QUEEN_COLORS.dressIce], [10, 13, QUEEN_COLORS.dressLight], [11, 13, QUEEN_COLORS.dress], [12, 13, QUEEN_COLORS.dressDark],
  [6, 14, QUEEN_COLORS.dressDark], [7, 14, QUEEN_COLORS.dress], [8, 14, QUEEN_COLORS.dressLight], [9, 14, QUEEN_COLORS.crystalLight], [10, 14, QUEEN_COLORS.dressLight], [11, 14, QUEEN_COLORS.dressIce], [12, 14, QUEEN_COLORS.dressLight], [13, 14, QUEEN_COLORS.dressDark],
  [6, 15, QUEEN_COLORS.dress], [7, 15, QUEEN_COLORS.dressLight], [8, 15, QUEEN_COLORS.dressIce], [9, 15, QUEEN_COLORS.dressLight], [10, 15, QUEEN_COLORS.crystalGlow], [11, 15, QUEEN_COLORS.dressIce], [12, 15, QUEEN_COLORS.dressLight], [13, 15, QUEEN_COLORS.dressDark],
  [6, 16, QUEEN_COLORS.dressDark], [7, 16, QUEEN_COLORS.dressLight], [8, 16, QUEEN_COLORS.crystalGlow], [9, 16, QUEEN_COLORS.crystalLight], [10, 16, QUEEN_COLORS.crystalGlow], [11, 16, QUEEN_COLORS.dressIce], [12, 16, QUEEN_COLORS.dressLight], [13, 16, QUEEN_COLORS.dressDark],

  [10, 10, QUEEN_COLORS.skinLight], [11, 10, QUEEN_COLORS.skin],
  [11, 11, QUEEN_COLORS.skin], [12, 11, QUEEN_COLORS.staffDark],
  [12, 12, QUEEN_COLORS.staff], [13, 12, QUEEN_COLORS.staffLight],
  [12, 13, QUEEN_COLORS.staffDark],
  [12, 14, QUEEN_COLORS.staffGem],
  [12, 15, QUEEN_COLORS.staffGemGlow], [13, 15, QUEEN_COLORS.staffGemLight],

  [8, 17, QUEEN_COLORS.iceMagicGlow], [9, 17, QUEEN_COLORS.iceMagic],
  [8, 18, QUEEN_COLORS.sparkle], [9, 18, QUEEN_COLORS.snowLight], [10, 18, QUEEN_COLORS.snow],
]

const QUEEN_IDLE_FRAMES = [
  [
    { pixels: [
      [8, 5, QUEEN_COLORS.eye], [9, 5, QUEEN_COLORS.eye],
      [8, 12, QUEEN_COLORS.crystal], [9, 12, QUEEN_COLORS.crystal],
      [8, 14, QUEEN_COLORS.crystal], [9, 14, QUEEN_COLORS.crystal],
      [8, 17, QUEEN_COLORS.iceMagic], [9, 17, QUEEN_COLORS.iceMagic],
      [8, 18, QUEEN_COLORS.snow], [9, 18, QUEEN_COLORS.snow],
    ] }
  ],
  [
    { pixels: [
      [8, 5, QUEEN_COLORS.eyeGlow], [9, 5, QUEEN_COLORS.eyeGlow],
      [8, 12, QUEEN_COLORS.crystalGlow], [9, 12, QUEEN_COLORS.crystalGlow],
      [8, 14, QUEEN_COLORS.crystalGlow], [9, 14, QUEEN_COLORS.crystalGlow],
      [8, 17, QUEEN_COLORS.iceMagicGlow], [9, 17, QUEEN_COLORS.iceMagicGlow],
      [8, 18, QUEEN_COLORS.snowLight], [9, 18, QUEEN_COLORS.sparkleLight],
    ] }
  ],
]

const QUEEN_WALK_FRAMES = [
  [
    { pixels: [
      [7, 15, QUEEN_COLORS.dressDark], [8, 15, QUEEN_COLORS.dressLight], [9, 15, QUEEN_COLORS.dressIce], [10, 15, QUEEN_COLORS.dressLight], [11, 15, QUEEN_COLORS.dress],
    ] }
  ],
  [
    { pixels: [
      [7, 15, QUEEN_COLORS.dressLight], [8, 15, QUEEN_COLORS.dressIce], [9, 15, QUEEN_COLORS.crystalGlow], [10, 15, QUEEN_COLORS.dressIce], [11, 15, QUEEN_COLORS.dressLight],
    ] }
  ],
  [
    { pixels: [
      [7, 15, QUEEN_COLORS.dress], [8, 15, QUEEN_COLORS.dressLight], [9, 15, QUEEN_COLORS.dressIce], [10, 15, QUEEN_COLORS.dressDark], [11, 15, QUEEN_COLORS.dressLight],
    ] }
  ],
]

export const drawFrostQueen = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: QUEEN_FACE_DOWN,
  up: QUEEN_FACE_UP,
  left: QUEEN_FACE_LEFT,
  right: QUEEN_FACE_RIGHT,
  walk: QUEEN_WALK_FRAMES,
  idle: QUEEN_IDLE_FRAMES,
})

export const drawFrostQueenAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, QUEEN_AVATAR)