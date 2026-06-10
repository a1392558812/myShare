import { drawUnit, drawAvatar } from '../draw-utils.js'

export const config = {
  IDLE_SPEED: 0.005,
  WALK_SPEED: 0.08,
}

const WOLF_COLORS = {
  fur: '#1a1a2e',
  furDark: '#0f0f1a',
  furLight: '#2d2d4a',
  belly: '#3a3a5c',
  bellyLight: '#4a4a7c',
  eye: '#ff0066',
  eyeGlow: '#ff3385',
  nose: '#1a1a2e',
  teeth: '#f0f0f0',
  tongue: '#cc3366',
  paw: '#0f0f1a',
  claw: '#2d2d4a',
  glow: '#6633ff',
  glowLight: '#9966ff',
  tailTip: '#6633ff',
  earInner: '#3a3a5c',
  earOuter: '#1a1a2e',
  highlight: '#ffffff',
}

const WOLF_AVATAR = [
  [3, 0, WOLF_COLORS.earOuter], [4, 0, WOLF_COLORS.earOuter], [11, 0, WOLF_COLORS.earOuter], [12, 0, WOLF_COLORS.earOuter],
  [2, 1, WOLF_COLORS.earOuter], [3, 1, WOLF_COLORS.earInner], [4, 1, WOLF_COLORS.earInner], [11, 1, WOLF_COLORS.earInner], [12, 1, WOLF_COLORS.earInner], [13, 1, WOLF_COLORS.earOuter],
  [2, 2, WOLF_COLORS.earOuter], [3, 2, WOLF_COLORS.earInner], [4, 2, WOLF_COLORS.earInner], [11, 2, WOLF_COLORS.earInner], [12, 2, WOLF_COLORS.earInner], [13, 2, WOLF_COLORS.earOuter],
  [2, 3, WOLF_COLORS.earOuter], [3, 3, WOLF_COLORS.earInner], [4, 3, WOLF_COLORS.earInner], [11, 3, WOLF_COLORS.earInner], [12, 3, WOLF_COLORS.earInner], [13, 3, WOLF_COLORS.earOuter],
  [4, 2, WOLF_COLORS.furLight], [5, 2, WOLF_COLORS.furLight], [6, 2, WOLF_COLORS.fur], [7, 2, WOLF_COLORS.fur], [8, 2, WOLF_COLORS.fur], [9, 2, WOLF_COLORS.furLight], [10, 2, WOLF_COLORS.furLight], [11, 2, WOLF_COLORS.furLight],
  [3, 3, WOLF_COLORS.fur], [4, 3, WOLF_COLORS.furLight], [5, 3, WOLF_COLORS.fur], [6, 3, WOLF_COLORS.furLight], [7, 3, WOLF_COLORS.fur], [8, 3, WOLF_COLORS.furLight], [9, 3, WOLF_COLORS.fur], [10, 3, WOLF_COLORS.furLight], [11, 3, WOLF_COLORS.fur], [12, 3, WOLF_COLORS.fur],
  [2, 4, WOLF_COLORS.furDark], [3, 4, WOLF_COLORS.fur], [4, 4, WOLF_COLORS.fur], [5, 4, WOLF_COLORS.furLight], [6, 4, WOLF_COLORS.fur], [7, 4, WOLF_COLORS.fur], [8, 4, WOLF_COLORS.furLight], [9, 4, WOLF_COLORS.fur], [10, 4, WOLF_COLORS.furLight], [11, 4, WOLF_COLORS.fur], [12, 4, WOLF_COLORS.fur], [13, 4, WOLF_COLORS.furDark],
  [2, 5, WOLF_COLORS.furDark], [3, 5, WOLF_COLORS.fur], [4, 5, WOLF_COLORS.eye], [5, 5, WOLF_COLORS.fur], [6, 5, WOLF_COLORS.furLight], [7, 5, WOLF_COLORS.fur], [8, 5, WOLF_COLORS.furLight], [9, 5, WOLF_COLORS.fur], [10, 5, WOLF_COLORS.furLight], [11, 5, WOLF_COLORS.eye], [12, 5, WOLF_COLORS.fur], [13, 5, WOLF_COLORS.furDark],
  [4, 4, WOLF_COLORS.highlight], [5, 4, WOLF_COLORS.highlight], [10, 4, WOLF_COLORS.highlight], [11, 4, WOLF_COLORS.highlight],
  [4, 5, WOLF_COLORS.eyeGlow], [5, 5, WOLF_COLORS.eyeGlow], [10, 5, WOLF_COLORS.eyeGlow], [11, 5, WOLF_COLORS.eyeGlow],
  [3, 6, WOLF_COLORS.fur], [4, 6, WOLF_COLORS.fur], [5, 6, WOLF_COLORS.nose], [6, 6, WOLF_COLORS.nose], [7, 6, WOLF_COLORS.nose], [8, 6, WOLF_COLORS.nose], [9, 6, WOLF_COLORS.nose], [10, 6, WOLF_COLORS.nose], [11, 6, WOLF_COLORS.fur], [12, 6, WOLF_COLORS.fur],
  [4, 7, WOLF_COLORS.fur], [5, 7, WOLF_COLORS.nose], [6, 7, WOLF_COLORS.nose], [7, 7, WOLF_COLORS.nose], [8, 7, WOLF_COLORS.nose], [9, 7, WOLF_COLORS.nose], [10, 7, WOLF_COLORS.fur],
  [3, 8, WOLF_COLORS.furDark], [4, 8, WOLF_COLORS.teeth], [5, 8, WOLF_COLORS.teeth], [6, 8, WOLF_COLORS.teeth], [7, 8, WOLF_COLORS.tongue], [8, 8, WOLF_COLORS.tongue], [9, 8, WOLF_COLORS.teeth], [10, 8, WOLF_COLORS.teeth], [11, 8, WOLF_COLORS.teeth], [12, 8, WOLF_COLORS.furDark],
  [4, 9, WOLF_COLORS.teeth], [5, 9, WOLF_COLORS.teeth], [6, 9, WOLF_COLORS.teeth], [7, 9, WOLF_COLORS.tongue], [8, 9, WOLF_COLORS.tongue], [9, 9, WOLF_COLORS.teeth], [10, 9, WOLF_COLORS.teeth], [11, 9, WOLF_COLORS.teeth],
  [5, 10, WOLF_COLORS.teeth], [6, 10, WOLF_COLORS.tongue], [7, 10, WOLF_COLORS.tongue], [8, 10, WOLF_COLORS.tongue], [9, 10, WOLF_COLORS.teeth], [10, 10, WOLF_COLORS.teeth],
  [4, 11, WOLF_COLORS.furDark], [5, 11, WOLF_COLORS.fur], [6, 11, WOLF_COLORS.fur], [7, 11, WOLF_COLORS.fur], [8, 11, WOLF_COLORS.fur], [9, 11, WOLF_COLORS.fur], [10, 11, WOLF_COLORS.fur], [11, 11, WOLF_COLORS.furDark],
  [5, 12, WOLF_COLORS.fur], [6, 12, WOLF_COLORS.furDark], [7, 12, WOLF_COLORS.furDark], [8, 12, WOLF_COLORS.furDark], [9, 12, WOLF_COLORS.fur], [10, 12, WOLF_COLORS.fur],
  [4, 13, WOLF_COLORS.fur], [5, 13, WOLF_COLORS.furLight], [6, 13, WOLF_COLORS.fur], [7, 13, WOLF_COLORS.fur], [8, 13, WOLF_COLORS.fur], [9, 13, WOLF_COLORS.furLight], [10, 13, WOLF_COLORS.fur],
  [5, 14, WOLF_COLORS.furDark], [6, 14, WOLF_COLORS.fur], [7, 14, WOLF_COLORS.furLight], [8, 14, WOLF_COLORS.furLight], [9, 14, WOLF_COLORS.fur], [10, 14, WOLF_COLORS.furDark],
  [3, 5, WOLF_COLORS.glow], [12, 5, WOLF_COLORS.glow],
  [4, 6, WOLF_COLORS.glowLight], [11, 6, WOLF_COLORS.glowLight],
  [5, 7, WOLF_COLORS.glow], [10, 7, WOLF_COLORS.glow],
  [6, 8, WOLF_COLORS.glowLight], [9, 8, WOLF_COLORS.glowLight],
]

const WOLF_FACE_LEFT = [
  [4, 0, WOLF_COLORS.earOuter], [5, 0, WOLF_COLORS.earOuter],
  [3, 1, WOLF_COLORS.earOuter], [4, 1, WOLF_COLORS.earInner], [5, 1, WOLF_COLORS.earInner], [6, 1, WOLF_COLORS.earOuter],
  [3, 2, WOLF_COLORS.earOuter], [4, 2, WOLF_COLORS.earInner], [5, 2, WOLF_COLORS.earInner], [6, 2, WOLF_COLORS.earOuter],
  [2, 3, WOLF_COLORS.furDark], [3, 3, WOLF_COLORS.fur], [4, 3, WOLF_COLORS.furLight], [5, 3, WOLF_COLORS.fur], [6, 3, WOLF_COLORS.fur], [7, 3, WOLF_COLORS.furLight],
  [2, 4, WOLF_COLORS.fur], [3, 4, WOLF_COLORS.fur], [4, 4, WOLF_COLORS.furLight], [5, 4, WOLF_COLORS.eye], [6, 4, WOLF_COLORS.fur], [7, 4, WOLF_COLORS.fur],
  [2, 5, WOLF_COLORS.furDark], [3, 5, WOLF_COLORS.nose], [4, 5, WOLF_COLORS.fur], [5, 5, WOLF_COLORS.fur], [6, 5, WOLF_COLORS.fur], [7, 5, WOLF_COLORS.fur],
  [2, 6, WOLF_COLORS.furDark], [3, 6, WOLF_COLORS.teeth], [4, 6, WOLF_COLORS.teeth], [5, 6, WOLF_COLORS.tongue], [6, 6, WOLF_COLORS.teeth], [7, 6, WOLF_COLORS.fur],
  [5, 7, WOLF_COLORS.fur], [6, 7, WOLF_COLORS.fur], [7, 7, WOLF_COLORS.furLight], [8, 7, WOLF_COLORS.fur],
  [5, 8, WOLF_COLORS.furDark], [6, 8, WOLF_COLORS.fur], [7, 8, WOLF_COLORS.fur], [8, 8, WOLF_COLORS.furLight], [9, 8, WOLF_COLORS.fur],
  [5, 9, WOLF_COLORS.fur], [6, 9, WOLF_COLORS.fur], [7, 9, WOLF_COLORS.bellyLight], [8, 9, WOLF_COLORS.belly], [9, 9, WOLF_COLORS.bellyLight], [10, 9, WOLF_COLORS.fur],
  [4, 10, WOLF_COLORS.fur], [5, 10, WOLF_COLORS.fur], [6, 10, WOLF_COLORS.bellyLight], [7, 10, WOLF_COLORS.belly], [8, 10, WOLF_COLORS.bellyLight], [9, 10, WOLF_COLORS.belly], [10, 10, WOLF_COLORS.fur], [11, 10, WOLF_COLORS.fur],
  [4, 11, WOLF_COLORS.furDark], [5, 11, WOLF_COLORS.fur], [6, 11, WOLF_COLORS.belly], [7, 11, WOLF_COLORS.bellyLight], [8, 11, WOLF_COLORS.belly], [9, 11, WOLF_COLORS.bellyLight], [10, 11, WOLF_COLORS.belly], [11, 11, WOLF_COLORS.fur], [12, 11, WOLF_COLORS.furDark],
  [4, 12, WOLF_COLORS.furDark], [5, 12, WOLF_COLORS.fur], [6, 12, WOLF_COLORS.bellyLight], [7, 12, WOLF_COLORS.belly], [8, 12, WOLF_COLORS.bellyLight], [9, 12, WOLF_COLORS.belly], [10, 12, WOLF_COLORS.bellyLight], [11, 12, WOLF_COLORS.fur], [12, 12, WOLF_COLORS.furDark],
  [5, 13, WOLF_COLORS.fur], [6, 13, WOLF_COLORS.fur], [7, 13, WOLF_COLORS.belly], [8, 13, WOLF_COLORS.bellyLight], [9, 13, WOLF_COLORS.belly], [10, 13, WOLF_COLORS.fur], [11, 13, WOLF_COLORS.fur], [12, 13, WOLF_COLORS.furDark],
  [6, 14, WOLF_COLORS.fur], [7, 14, WOLF_COLORS.fur], [8, 14, WOLF_COLORS.belly], [9, 14, WOLF_COLORS.fur], [10, 14, WOLF_COLORS.fur], [11, 14, WOLF_COLORS.furDark],
  [12, 9, WOLF_COLORS.fur], [13, 9, WOLF_COLORS.furDark],
  [13, 8, WOLF_COLORS.fur], [14, 8, WOLF_COLORS.furDark],
  [13, 7, WOLF_COLORS.fur], [14, 7, WOLF_COLORS.glow], [15, 7, WOLF_COLORS.tailTip],
  [14, 6, WOLF_COLORS.glow], [15, 6, WOLF_COLORS.glowLight],
  [14, 5, WOLF_COLORS.tailTip],
  [5, 5, WOLF_COLORS.eyeGlow],
  [5, 13, WOLF_COLORS.fur], [6, 13, WOLF_COLORS.furDark],
  [5, 14, WOLF_COLORS.paw], [6, 14, WOLF_COLORS.paw],
  [5, 15, WOLF_COLORS.claw], [6, 15, WOLF_COLORS.claw],
  [10, 13, WOLF_COLORS.fur], [11, 13, WOLF_COLORS.furDark],
  [10, 14, WOLF_COLORS.paw], [11, 14, WOLF_COLORS.paw],
  [10, 15, WOLF_COLORS.claw], [11, 15, WOLF_COLORS.claw],
]

const WOLF_FACE_RIGHT = [
  [14, 0, WOLF_COLORS.earOuter], [15, 0, WOLF_COLORS.earOuter],
  [13, 1, WOLF_COLORS.earOuter], [14, 1, WOLF_COLORS.earInner], [15, 1, WOLF_COLORS.earInner], [16, 1, WOLF_COLORS.earOuter],
  [13, 2, WOLF_COLORS.earOuter], [14, 2, WOLF_COLORS.earInner], [15, 2, WOLF_COLORS.earInner], [16, 2, WOLF_COLORS.earOuter],
  [12, 3, WOLF_COLORS.furLight], [13, 3, WOLF_COLORS.fur], [14, 3, WOLF_COLORS.furLight], [15, 3, WOLF_COLORS.fur], [16, 3, WOLF_COLORS.fur], [17, 3, WOLF_COLORS.furDark],
  [12, 4, WOLF_COLORS.fur], [13, 4, WOLF_COLORS.fur], [14, 4, WOLF_COLORS.eye], [15, 4, WOLF_COLORS.furLight], [16, 4, WOLF_COLORS.fur], [17, 4, WOLF_COLORS.fur],
  [12, 5, WOLF_COLORS.fur], [13, 5, WOLF_COLORS.fur], [14, 5, WOLF_COLORS.fur], [15, 5, WOLF_COLORS.fur], [16, 5, WOLF_COLORS.nose], [17, 5, WOLF_COLORS.furDark],
  [12, 6, WOLF_COLORS.fur], [13, 6, WOLF_COLORS.teeth], [14, 6, WOLF_COLORS.tongue], [15, 6, WOLF_COLORS.teeth], [16, 6, WOLF_COLORS.fur], [17, 6, WOLF_COLORS.furDark],
  [11, 7, WOLF_COLORS.fur], [12, 7, WOLF_COLORS.furLight], [13, 7, WOLF_COLORS.fur], [14, 7, WOLF_COLORS.fur],
  [10, 8, WOLF_COLORS.fur], [11, 8, WOLF_COLORS.furLight], [12, 8, WOLF_COLORS.fur], [13, 8, WOLF_COLORS.fur], [14, 8, WOLF_COLORS.furDark],
  [9, 9, WOLF_COLORS.fur], [10, 9, WOLF_COLORS.bellyLight], [11, 9, WOLF_COLORS.belly], [12, 9, WOLF_COLORS.bellyLight], [13, 9, WOLF_COLORS.fur], [14, 9, WOLF_COLORS.fur],
  [8, 10, WOLF_COLORS.fur], [9, 10, WOLF_COLORS.fur], [10, 10, WOLF_COLORS.belly], [11, 10, WOLF_COLORS.bellyLight], [12, 10, WOLF_COLORS.belly], [13, 10, WOLF_COLORS.bellyLight], [14, 10, WOLF_COLORS.fur], [15, 10, WOLF_COLORS.fur],
  [7, 11, WOLF_COLORS.furDark], [8, 11, WOLF_COLORS.fur], [9, 11, WOLF_COLORS.belly], [10, 11, WOLF_COLORS.bellyLight], [11, 11, WOLF_COLORS.belly], [12, 11, WOLF_COLORS.bellyLight], [13, 11, WOLF_COLORS.belly], [14, 11, WOLF_COLORS.fur], [15, 11, WOLF_COLORS.furDark],
  [7, 12, WOLF_COLORS.furDark], [8, 12, WOLF_COLORS.fur], [9, 12, WOLF_COLORS.bellyLight], [10, 12, WOLF_COLORS.belly], [11, 12, WOLF_COLORS.bellyLight], [12, 12, WOLF_COLORS.belly], [13, 12, WOLF_COLORS.bellyLight], [14, 12, WOLF_COLORS.fur], [15, 12, WOLF_COLORS.furDark],
  [7, 13, WOLF_COLORS.furDark], [8, 13, WOLF_COLORS.fur], [9, 13, WOLF_COLORS.fur], [10, 13, WOLF_COLORS.belly], [11, 13, WOLF_COLORS.bellyLight], [12, 13, WOLF_COLORS.belly], [13, 13, WOLF_COLORS.fur], [14, 13, WOLF_COLORS.fur],
  [8, 14, WOLF_COLORS.furDark], [9, 14, WOLF_COLORS.fur], [10, 14, WOLF_COLORS.fur], [11, 14, WOLF_COLORS.belly], [12, 14, WOLF_COLORS.fur], [13, 14, WOLF_COLORS.fur],
  [6, 9, WOLF_COLORS.furDark], [5, 9, WOLF_COLORS.fur],
  [5, 8, WOLF_COLORS.furDark], [4, 8, WOLF_COLORS.fur],
  [5, 7, WOLF_COLORS.glow], [4, 7, WOLF_COLORS.fur], [3, 7, WOLF_COLORS.tailTip],
  [4, 6, WOLF_COLORS.glow], [3, 6, WOLF_COLORS.glowLight],
  [4, 5, WOLF_COLORS.tailTip],
  [14, 5, WOLF_COLORS.eyeGlow],
  [13, 13, WOLF_COLORS.furDark], [14, 13, WOLF_COLORS.fur],
  [13, 14, WOLF_COLORS.paw], [14, 14, WOLF_COLORS.paw],
  [13, 15, WOLF_COLORS.claw], [14, 15, WOLF_COLORS.claw],
  [8, 13, WOLF_COLORS.fur], [9, 13, WOLF_COLORS.furDark],
  [8, 14, WOLF_COLORS.paw], [9, 14, WOLF_COLORS.paw],
  [8, 15, WOLF_COLORS.claw], [9, 15, WOLF_COLORS.claw],
]

const WOLF_FACE_UP = [
  [5, 0, WOLF_COLORS.earOuter], [6, 0, WOLF_COLORS.earOuter], [13, 0, WOLF_COLORS.earOuter], [14, 0, WOLF_COLORS.earOuter],
  [5, 1, WOLF_COLORS.earInner], [6, 1, WOLF_COLORS.earInner], [13, 1, WOLF_COLORS.earInner], [14, 1, WOLF_COLORS.earInner],
  [5, 2, WOLF_COLORS.earOuter], [6, 2, WOLF_COLORS.earOuter], [13, 2, WOLF_COLORS.earOuter], [14, 2, WOLF_COLORS.earOuter],
  [6, 2, WOLF_COLORS.furLight], [7, 2, WOLF_COLORS.furLight], [8, 2, WOLF_COLORS.fur], [9, 2, WOLF_COLORS.fur], [10, 2, WOLF_COLORS.furLight], [11, 2, WOLF_COLORS.furLight], [12, 2, WOLF_COLORS.fur], [13, 2, WOLF_COLORS.fur],
  [5, 3, WOLF_COLORS.fur], [6, 3, WOLF_COLORS.fur], [7, 3, WOLF_COLORS.furLight], [8, 3, WOLF_COLORS.fur], [9, 3, WOLF_COLORS.fur], [10, 3, WOLF_COLORS.fur], [11, 3, WOLF_COLORS.furLight], [12, 3, WOLF_COLORS.fur], [13, 3, WOLF_COLORS.fur], [14, 3, WOLF_COLORS.fur],
  [5, 4, WOLF_COLORS.furDark], [6, 4, WOLF_COLORS.fur], [7, 4, WOLF_COLORS.fur], [8, 4, WOLF_COLORS.furLight], [9, 4, WOLF_COLORS.fur], [10, 4, WOLF_COLORS.fur], [11, 4, WOLF_COLORS.furLight], [12, 4, WOLF_COLORS.fur], [13, 4, WOLF_COLORS.fur], [14, 4, WOLF_COLORS.furDark],
  [6, 5, WOLF_COLORS.fur], [7, 5, WOLF_COLORS.furLight], [8, 5, WOLF_COLORS.fur], [9, 5, WOLF_COLORS.furLight], [10, 5, WOLF_COLORS.fur], [11, 5, WOLF_COLORS.furLight], [12, 5, WOLF_COLORS.fur], [13, 5, WOLF_COLORS.fur],
  [6, 6, WOLF_COLORS.fur], [7, 6, WOLF_COLORS.fur], [8, 6, WOLF_COLORS.furLight], [9, 6, WOLF_COLORS.fur], [10, 6, WOLF_COLORS.furLight], [11, 6, WOLF_COLORS.fur], [12, 6, WOLF_COLORS.fur],
  [5, 7, WOLF_COLORS.fur], [6, 7, WOLF_COLORS.furLight], [7, 7, WOLF_COLORS.fur], [8, 7, WOLF_COLORS.furLight], [9, 7, WOLF_COLORS.fur], [10, 7, WOLF_COLORS.furLight], [11, 7, WOLF_COLORS.fur], [12, 7, WOLF_COLORS.furLight], [13, 7, WOLF_COLORS.fur], [14, 7, WOLF_COLORS.fur],
  [5, 8, WOLF_COLORS.furDark], [6, 8, WOLF_COLORS.fur], [7, 8, WOLF_COLORS.furLight], [8, 8, WOLF_COLORS.fur], [9, 8, WOLF_COLORS.furLight], [10, 8, WOLF_COLORS.furLight], [11, 8, WOLF_COLORS.fur], [12, 8, WOLF_COLORS.furLight], [13, 8, WOLF_COLORS.fur], [14, 8, WOLF_COLORS.furDark],
  [4, 9, WOLF_COLORS.furDark], [5, 9, WOLF_COLORS.fur], [6, 9, WOLF_COLORS.fur], [7, 9, WOLF_COLORS.furLight], [8, 9, WOLF_COLORS.fur], [9, 9, WOLF_COLORS.fur], [10, 9, WOLF_COLORS.fur], [11, 9, WOLF_COLORS.fur], [12, 9, WOLF_COLORS.furLight], [13, 9, WOLF_COLORS.fur], [14, 9, WOLF_COLORS.fur], [15, 9, WOLF_COLORS.furDark],
  [4, 10, WOLF_COLORS.furDark], [5, 10, WOLF_COLORS.fur], [6, 10, WOLF_COLORS.fur], [7, 10, WOLF_COLORS.fur], [8, 10, WOLF_COLORS.furLight], [9, 10, WOLF_COLORS.fur], [10, 10, WOLF_COLORS.furLight], [11, 10, WOLF_COLORS.fur], [12, 10, WOLF_COLORS.fur], [13, 10, WOLF_COLORS.fur], [14, 10, WOLF_COLORS.fur], [15, 10, WOLF_COLORS.furDark],
  [4, 11, WOLF_COLORS.furDark], [5, 11, WOLF_COLORS.fur], [6, 11, WOLF_COLORS.furLight], [7, 11, WOLF_COLORS.fur], [8, 11, WOLF_COLORS.fur], [9, 11, WOLF_COLORS.furLight], [10, 11, WOLF_COLORS.furLight], [11, 11, WOLF_COLORS.fur], [12, 11, WOLF_COLORS.fur], [13, 11, WOLF_COLORS.furLight], [14, 11, WOLF_COLORS.fur], [15, 11, WOLF_COLORS.furDark],
  [5, 12, WOLF_COLORS.fur], [6, 12, WOLF_COLORS.fur], [7, 12, WOLF_COLORS.fur], [8, 12, WOLF_COLORS.furLight], [9, 12, WOLF_COLORS.fur], [10, 12, WOLF_COLORS.fur], [11, 12, WOLF_COLORS.furLight], [12, 12, WOLF_COLORS.fur], [13, 12, WOLF_COLORS.fur], [14, 12, WOLF_COLORS.fur],
  [6, 13, WOLF_COLORS.furDark], [7, 13, WOLF_COLORS.fur], [8, 13, WOLF_COLORS.fur], [9, 13, WOLF_COLORS.furLight], [10, 13, WOLF_COLORS.furLight], [11, 13, WOLF_COLORS.fur], [12, 13, WOLF_COLORS.fur], [13, 13, WOLF_COLORS.furDark],
  [8, 14, WOLF_COLORS.fur], [9, 14, WOLF_COLORS.fur], [10, 14, WOLF_COLORS.fur], [11, 14, WOLF_COLORS.furDark],
  [8, 15, WOLF_COLORS.glow], [9, 15, WOLF_COLORS.tailTip], [10, 15, WOLF_COLORS.tailTip], [11, 15, WOLF_COLORS.glowLight],
  [7, 5, WOLF_COLORS.glow], [12, 5, WOLF_COLORS.glow],
  [8, 8, WOLF_COLORS.glow], [11, 8, WOLF_COLORS.glow],
  [9, 11, WOLF_COLORS.glowLight], [10, 11, WOLF_COLORS.glowLight],
  [6, 12, WOLF_COLORS.fur], [7, 12, WOLF_COLORS.furDark],
  [6, 13, WOLF_COLORS.paw], [7, 13, WOLF_COLORS.paw],
  [6, 14, WOLF_COLORS.claw], [7, 14, WOLF_COLORS.claw],
  [12, 12, WOLF_COLORS.furDark], [13, 12, WOLF_COLORS.fur],
  [12, 13, WOLF_COLORS.paw], [13, 13, WOLF_COLORS.paw],
  [12, 14, WOLF_COLORS.claw], [13, 14, WOLF_COLORS.claw],
  [8, 12, WOLF_COLORS.fur], [9, 12, WOLF_COLORS.furDark],
  [8, 13, WOLF_COLORS.paw], [9, 13, WOLF_COLORS.paw],
  [8, 14, WOLF_COLORS.claw], [9, 14, WOLF_COLORS.claw],
  [10, 12, WOLF_COLORS.furDark], [11, 12, WOLF_COLORS.fur],
  [10, 13, WOLF_COLORS.paw], [11, 13, WOLF_COLORS.paw],
  [10, 14, WOLF_COLORS.claw], [11, 14, WOLF_COLORS.claw],
]

const WOLF_FACE_DOWN = [
  [5, 0, WOLF_COLORS.earOuter], [6, 0, WOLF_COLORS.earOuter], [13, 0, WOLF_COLORS.earOuter], [14, 0, WOLF_COLORS.earOuter],
  [5, 1, WOLF_COLORS.earInner], [6, 1, WOLF_COLORS.earInner], [13, 1, WOLF_COLORS.earInner], [14, 1, WOLF_COLORS.earInner],
  [6, 1, WOLF_COLORS.furLight], [7, 1, WOLF_COLORS.furLight], [8, 1, WOLF_COLORS.fur], [9, 1, WOLF_COLORS.fur], [10, 1, WOLF_COLORS.furLight], [11, 1, WOLF_COLORS.furLight], [12, 1, WOLF_COLORS.fur], [13, 1, WOLF_COLORS.fur],
  [5, 2, WOLF_COLORS.fur], [6, 2, WOLF_COLORS.furLight], [7, 2, WOLF_COLORS.fur], [8, 2, WOLF_COLORS.furLight], [9, 2, WOLF_COLORS.fur], [10, 2, WOLF_COLORS.furLight], [11, 2, WOLF_COLORS.fur], [12, 2, WOLF_COLORS.furLight], [13, 2, WOLF_COLORS.fur], [14, 2, WOLF_COLORS.fur],
  [5, 3, WOLF_COLORS.fur], [6, 3, WOLF_COLORS.fur], [7, 3, WOLF_COLORS.furLight], [8, 3, WOLF_COLORS.fur], [9, 3, WOLF_COLORS.fur], [10, 3, WOLF_COLORS.fur], [11, 3, WOLF_COLORS.furLight], [12, 3, WOLF_COLORS.fur], [13, 3, WOLF_COLORS.fur], [14, 3, WOLF_COLORS.fur],
  [4, 4, WOLF_COLORS.furDark], [5, 4, WOLF_COLORS.fur], [6, 4, WOLF_COLORS.eye], [7, 4, WOLF_COLORS.fur], [8, 4, WOLF_COLORS.furLight], [9, 4, WOLF_COLORS.fur], [10, 4, WOLF_COLORS.furLight], [11, 4, WOLF_COLORS.fur], [12, 4, WOLF_COLORS.eye], [13, 4, WOLF_COLORS.fur], [14, 4, WOLF_COLORS.furDark],
  [4, 5, WOLF_COLORS.fur], [5, 5, WOLF_COLORS.fur], [6, 5, WOLF_COLORS.eyeGlow], [7, 5, WOLF_COLORS.fur], [8, 5, WOLF_COLORS.fur], [9, 5, WOLF_COLORS.fur], [10, 5, WOLF_COLORS.fur], [11, 5, WOLF_COLORS.fur], [12, 5, WOLF_COLORS.eyeGlow], [13, 5, WOLF_COLORS.fur], [14, 5, WOLF_COLORS.fur],
  [5, 6, WOLF_COLORS.fur], [6, 6, WOLF_COLORS.fur], [7, 6, WOLF_COLORS.nose], [8, 6, WOLF_COLORS.nose], [9, 6, WOLF_COLORS.nose], [10, 6, WOLF_COLORS.nose], [11, 6, WOLF_COLORS.nose], [12, 6, WOLF_COLORS.fur], [13, 6, WOLF_COLORS.fur],
  [5, 7, WOLF_COLORS.furDark], [6, 7, WOLF_COLORS.teeth], [7, 7, WOLF_COLORS.teeth], [8, 7, WOLF_COLORS.teeth], [9, 7, WOLF_COLORS.tongue], [10, 7, WOLF_COLORS.teeth], [11, 7, WOLF_COLORS.teeth], [12, 7, WOLF_COLORS.teeth], [13, 7, WOLF_COLORS.furDark],
  [6, 8, WOLF_COLORS.fur], [7, 8, WOLF_COLORS.teeth], [8, 8, WOLF_COLORS.tongue], [9, 8, WOLF_COLORS.tongue], [10, 8, WOLF_COLORS.tongue], [11, 8, WOLF_COLORS.teeth], [12, 8, WOLF_COLORS.fur],
  [6, 9, WOLF_COLORS.fur], [7, 9, WOLF_COLORS.fur], [8, 9, WOLF_COLORS.furLight], [9, 9, WOLF_COLORS.furLight], [10, 9, WOLF_COLORS.furLight], [11, 9, WOLF_COLORS.fur], [12, 9, WOLF_COLORS.fur],
  [5, 10, WOLF_COLORS.fur], [6, 10, WOLF_COLORS.furLight], [7, 10, WOLF_COLORS.bellyLight], [8, 10, WOLF_COLORS.belly], [9, 10, WOLF_COLORS.bellyLight], [10, 10, WOLF_COLORS.belly], [11, 10, WOLF_COLORS.bellyLight], [12, 10, WOLF_COLORS.furLight], [13, 10, WOLF_COLORS.fur],
  [4, 11, WOLF_COLORS.furDark], [5, 11, WOLF_COLORS.fur], [6, 11, WOLF_COLORS.belly], [7, 11, WOLF_COLORS.bellyLight], [8, 11, WOLF_COLORS.belly], [9, 11, WOLF_COLORS.bellyLight], [10, 11, WOLF_COLORS.belly], [11, 11, WOLF_COLORS.bellyLight], [12, 11, WOLF_COLORS.fur], [13, 11, WOLF_COLORS.fur], [14, 11, WOLF_COLORS.furDark],
  [4, 12, WOLF_COLORS.furDark], [5, 12, WOLF_COLORS.fur], [6, 12, WOLF_COLORS.bellyLight], [7, 12, WOLF_COLORS.belly], [8, 12, WOLF_COLORS.bellyLight], [9, 12, WOLF_COLORS.belly], [10, 12, WOLF_COLORS.bellyLight], [11, 12, WOLF_COLORS.belly], [12, 12, WOLF_COLORS.bellyLight], [13, 12, WOLF_COLORS.fur], [14, 12, WOLF_COLORS.furDark],
  [5, 13, WOLF_COLORS.fur], [6, 13, WOLF_COLORS.belly], [7, 13, WOLF_COLORS.bellyLight], [8, 13, WOLF_COLORS.belly], [9, 13, WOLF_COLORS.bellyLight], [10, 13, WOLF_COLORS.belly], [11, 13, WOLF_COLORS.bellyLight], [12, 13, WOLF_COLORS.belly], [13, 13, WOLF_COLORS.fur],
  [6, 14, WOLF_COLORS.bellyLight], [7, 14, WOLF_COLORS.belly], [8, 14, WOLF_COLORS.bellyLight], [9, 14, WOLF_COLORS.belly], [10, 14, WOLF_COLORS.bellyLight], [11, 14, WOLF_COLORS.belly], [12, 14, WOLF_COLORS.bellyLight],
  [8, 15, WOLF_COLORS.glow], [9, 15, WOLF_COLORS.tailTip], [10, 15, WOLF_COLORS.tailTip], [11, 15, WOLF_COLORS.glowLight],
  [5, 12, WOLF_COLORS.fur], [6, 12, WOLF_COLORS.furDark],
  [5, 13, WOLF_COLORS.paw], [6, 13, WOLF_COLORS.paw],
  [5, 14, WOLF_COLORS.claw], [6, 14, WOLF_COLORS.claw],
  [5, 15, WOLF_COLORS.claw], [6, 15, WOLF_COLORS.claw],
  [12, 12, WOLF_COLORS.furDark], [13, 12, WOLF_COLORS.fur],
  [12, 13, WOLF_COLORS.paw], [13, 13, WOLF_COLORS.paw],
  [12, 14, WOLF_COLORS.claw], [13, 14, WOLF_COLORS.claw],
  [12, 15, WOLF_COLORS.claw], [13, 15, WOLF_COLORS.claw],
  [7, 13, WOLF_COLORS.fur], [8, 13, WOLF_COLORS.furDark],
  [7, 14, WOLF_COLORS.paw], [8, 14, WOLF_COLORS.paw],
  [7, 15, WOLF_COLORS.claw], [8, 15, WOLF_COLORS.claw],
  [10, 13, WOLF_COLORS.furDark], [11, 13, WOLF_COLORS.fur],
  [10, 14, WOLF_COLORS.paw], [11, 14, WOLF_COLORS.paw],
  [10, 15, WOLF_COLORS.claw], [11, 15, WOLF_COLORS.claw],
  [7, 11, WOLF_COLORS.glow], [12, 11, WOLF_COLORS.glow],
  [9, 12, WOLF_COLORS.glowLight],
]

const WOLF_IDLE_FRAMES = [
  [
    { pixels: [
      [8, 14, WOLF_COLORS.glow], [9, 14, WOLF_COLORS.tailTip], [10, 14, WOLF_COLORS.tailTip], [11, 14, WOLF_COLORS.glowLight],
    ] }
  ],
  [
    { pixels: [
      [8, 14, WOLF_COLORS.tailTip], [9, 14, WOLF_COLORS.glowLight], [10, 14, WOLF_COLORS.glowLight], [11, 14, WOLF_COLORS.tailTip],
    ] }
  ]
]

const WOLF_WALK_FRAMES = [
  [
    { pixels: [
      [4, 12, WOLF_COLORS.furDark], [5, 12, WOLF_COLORS.fur], [13, 12, WOLF_COLORS.fur], [14, 12, WOLF_COLORS.furDark],
      [4, 13, WOLF_COLORS.fur], [5, 13, WOLF_COLORS.paw], [13, 13, WOLF_COLORS.paw], [14, 13, WOLF_COLORS.fur],
      [4, 14, WOLF_COLORS.paw], [5, 14, WOLF_COLORS.claw], [13, 14, WOLF_COLORS.claw], [14, 14, WOLF_COLORS.paw],
      [4, 15, WOLF_COLORS.claw], [14, 15, WOLF_COLORS.claw],
    ] }
  ],
  [
    { pixels: [
      [5, 12, WOLF_COLORS.fur], [6, 12, WOLF_COLORS.furDark], [12, 12, WOLF_COLORS.furDark], [13, 12, WOLF_COLORS.fur],
      [5, 13, WOLF_COLORS.paw], [6, 13, WOLF_COLORS.paw], [12, 13, WOLF_COLORS.paw], [13, 13, WOLF_COLORS.paw],
      [5, 14, WOLF_COLORS.claw], [6, 14, WOLF_COLORS.claw], [12, 14, WOLF_COLORS.claw], [13, 14, WOLF_COLORS.claw],
      [5, 15, WOLF_COLORS.claw], [6, 15, WOLF_COLORS.claw], [12, 15, WOLF_COLORS.claw], [13, 15, WOLF_COLORS.claw],
    ] }
  ],
  [
    { pixels: [
      [6, 12, WOLF_COLORS.furDark], [7, 12, WOLF_COLORS.fur], [11, 12, WOLF_COLORS.fur], [12, 12, WOLF_COLORS.furDark],
      [6, 13, WOLF_COLORS.fur], [7, 13, WOLF_COLORS.paw], [11, 13, WOLF_COLORS.paw], [12, 13, WOLF_COLORS.fur],
      [6, 14, WOLF_COLORS.paw], [7, 14, WOLF_COLORS.claw], [11, 14, WOLF_COLORS.claw], [12, 14, WOLF_COLORS.paw],
      [7, 15, WOLF_COLORS.claw], [11, 15, WOLF_COLORS.claw],
    ] }
  ]
]

export const drawShadowWolf = (ctx, currentUnit) => drawUnit(ctx, currentUnit, {
  down: WOLF_FACE_DOWN,
  up: WOLF_FACE_UP,
  left: WOLF_FACE_LEFT,
  right: WOLF_FACE_RIGHT,
  walk: WOLF_WALK_FRAMES,
  idle: WOLF_IDLE_FRAMES,
})

export const drawShadowWolfAvatar = (ctx, currentUnit, avatarPos) => drawAvatar(ctx, currentUnit, avatarPos, WOLF_AVATAR)