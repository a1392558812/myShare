import { drawPixel } from '../draw-utils.js'

export const config = {
  // 宽高比固定 170 / 420
  ASPECT_RATIO: 170 / 420,
}

// ==============================
//  古英雄石像颜色常量
// ==============================
const C = {
  sky: 'transparent',

  // ── 王冠（古金色石质） ──
  crown: '#9E8C6C',
  crownDark: '#7A6A4E',
  crownLight: '#B8A47C',
  crownTrim: '#C4B088',
  crownGem: '#4A8AB5',
  crownGemDark: '#3A6A8A',
  crownGemLight: '#6AAAEE',

  // ── 面部（石像灰） ──
  face: '#8A8A82',
  faceDark: '#6E6E66',
  faceLight: '#9E9E96',
  faceShadow: '#5A5A54',
  eye: '#2E2E2A',
  eyeLight: '#4A4A44',
  brow: '#6A6A62',

  // ── 胸甲 ──
  armor: '#7A7A74',
  armorDark: '#5E5E58',
  armorLight: '#92928A',
  armorHighlight: '#A8A8A0',
  armorRune: '#8E8E86',

  // ── 肩甲 ──
  pauldron: '#82827A',
  pauldronDark: '#666660',
  pauldronLight: '#9C9C94',
  pauldronRim: '#72726C',

  // ── 手臂 ──
  arm: '#808078',
  armDark: '#6A6A62',
  armLight: '#94948C',

  // ── 护手/手甲 ──
  gauntlet: '#72726C',
  gauntletDark: '#5A5A54',
  gauntletLight: '#8A8A82',

  // ── 剑身 ──
  blade: '#B0B0A8',
  bladeDark: '#8A8A82',
  bladeLight: '#D0D0C8',
  bladeEdge: '#E8E8E0',
  bladeCore: '#C8C8C0',

  // ── 剑柄 ──
  hilt: '#927A5A',
  hiltDark: '#6E5A3E',
  hiltLight: '#AE9670',
  hiltWrap: '#A08860',

  // ── 剑格（护手） ──
  guard: '#9E8C6C',
  guardDark: '#7A6A4E',
  guardLight: '#B8A47C',

  // ── 腰带 ──
  belt: '#6E6A60',
  beltDark: '#525046',
  beltLight: '#868276',
  beltBuckle: '#8E8C6C',

  // ── 腿部/长袍 ──
  robe: '#72706A',
  robeDark: '#585650',
  robeLight: '#8C8A82',
  robeFold: '#64625C',

  // ── 石台/基座 ──
  platform: '#5E5E58',
  platformDark: '#42423E',
  platformLight: '#76766E',
  platformTop: '#6A6A62',
  platformRune: '#52524C',

  // ── 苔藓/风化 ──
  moss: '#5A6E4A',
  mossDark: '#4A5E3A',
  mossLight: '#6A7E5A',

  // ── 剑身晕光（动画） ──
  glowInner: '#88CCFF',
  glowOuter: '#4488CC',
  glowWhite: '#CCEEFF',
}

// ==============================
//  像素数据常量
//  格式: [x, y, color]
//  坐标系: 0..169 宽 × 0..419 高，中心 x=85
// ==============================

// ── 1. 王冠 (y:22-54, cx:85) ──
const CROWN_PIXELS = [
  // 中央尖顶 (y:22-47, x:82-88)
                               [85, 22, C.crownTrim],
                          [84, 23, C.crownLight], [85, 23, C.crownTrim], [86, 23, C.crownLight],
                     [83, 24, C.crownLight], [84, 24, C.crownLight], [85, 24, C.crownTrim], [86, 24, C.crownLight], [87, 24, C.crownLight],
                [82, 25, C.crown], [83, 25, C.crownLight], [84, 25, C.crownLight], [85, 25, C.crown], [86, 25, C.crownLight], [87, 25, C.crownLight], [88, 25, C.crown],
           [81, 26, C.crown], [82, 26, C.crown], [83, 26, C.crownLight], [84, 26, C.crown], [85, 26, C.crown], [86, 26, C.crown], [87, 26, C.crownLight], [88, 26, C.crown], [89, 26, C.crown],

  // 左尖顶 (y:27-47, x:64-74)
                                    [69, 27, C.crownTrim],
                               [68, 28, C.crownLight], [69, 28, C.crownTrim], [70, 28, C.crownLight],
                          [67, 29, C.crownLight], [68, 29, C.crownLight], [69, 29, C.crownTrim], [70, 29, C.crownLight], [71, 29, C.crownLight],
                     [65, 30, C.crown], [66, 30, C.crown], [67, 30, C.crownLight], [68, 30, C.crown], [69, 30, C.crown], [70, 30, C.crown], [71, 30, C.crownLight], [72, 30, C.crown], [73, 30, C.crown],

  // 右尖顶 (y:27-47, x:96-106)
                                    [101, 27, C.crownTrim],
                               [100, 28, C.crownLight], [101, 28, C.crownTrim], [102, 28, C.crownLight],
                          [99, 29, C.crownLight], [100, 29, C.crownLight], [101, 29, C.crownTrim], [102, 29, C.crownLight], [103, 29, C.crownLight],
                     [97, 30, C.crown], [98, 30, C.crown], [99, 30, C.crownLight], [100, 30, C.crown], [101, 30, C.crown], [102, 30, C.crown], [103, 30, C.crownLight], [104, 30, C.crown], [105, 30, C.crown],

  // 三尖之间的凹陷连接 (y:26-33)
  [73, 26, C.crownDark], [74, 26, C.crownDark], [75, 26, C.crownDark], [76, 26, C.crownDark], [77, 26, C.crownDark], [78, 26, C.crownDark], [79, 26, C.crownDark], [80, 26, C.crownDark],
  [73, 27, C.crownDark], [74, 27, C.crown], [75, 27, C.crownDark], [76, 27, C.crownDark], [77, 27, C.crownDark], [78, 27, C.crownDark], [79, 27, C.crownDark], [80, 27, C.crownDark],
  [89, 26, C.crownDark], [90, 26, C.crownDark], [91, 26, C.crownDark], [92, 26, C.crownDark], [93, 26, C.crownDark], [94, 26, C.crownDark], [95, 26, C.crownDark], [96, 26, C.crownDark], [97, 26, C.crownDark],
  [89, 27, C.crownDark], [90, 27, C.crownDark], [91, 27, C.crownDark], [92, 27, C.crownDark], [93, 27, C.crownDark], [94, 27, C.crownDark], [95, 27, C.crown], [96, 27, C.crownDark], [97, 27, C.crownDark],

  // 三尖底层填充 (y:27-46)
  ...[27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47].flatMap(y => {
    const row = []
    for (let x = 64; x <= 106; x++) {
      const isInLeftPrism = x >= 65 && x <= 73 && y >= 30 && y <= 46
      const isInRightPrism = x >= 97 && x <= 105 && y >= 30 && y <= 46
      const isInCenterPrism = x >= 81 && x <= 89 && y >= 25 && y <= 46
      if (isInLeftPrism || isInRightPrism || isInCenterPrism) {
        const edge = (isInLeftPrism && (x === 65 || x === 73))
          || (isInRightPrism && (x === 97 || x === 105))
          || (isInCenterPrism && (x === 81 || x === 89))
        const nearEdge = (isInLeftPrism && (x === 66 || x === 72))
          || (isInRightPrism && (x === 98 || x === 104))
          || (isInCenterPrism && (x === 82 || x === 88))
        row.push([x, y, edge ? C.crownDark : nearEdge ? C.crown : C.crownLight])
      }
    }
    return row
  }),

  // 王冠主体横带 (y:47-54, x:60-110)
  ...[47,48,49,50,51,52,53,54].flatMap(y => {
    const row = []
    const isTop = y === 47
    const isBottom = y === 54
    for (let x = 60; x <= 110; x++) {
      if (x === 60 || x === 110) {
        row.push([x, y, isTop || isBottom ? C.crownDark : C.crown])
      } else if (x === 61 || x === 109) {
        row.push([x, y, C.crownLight])
      } else if (isTop) {
        row.push([x, y, x % 6 < 2 ? C.crownDark : C.crown])
      } else if (isBottom) {
        row.push([x, y, x % 6 < 2 ? C.crownDark : C.crownLight])
      } else {
        row.push([x, y, (x % 8 === 0) ? C.crownDark : (x % 8 === 4) ? C.crownLight : C.crown])
      }
    }
    return row
  }),

  // 中央宝石 (y:43-48, x:83-87)
  [83, 43, C.crownGemLight], [84, 43, C.crownGem], [85, 43, C.crownGemLight], [86, 43, C.crownGem], [87, 43, C.crownGemLight],
  [82, 44, C.crownDark], [83, 44, C.crownGemLight], [84, 44, C.crownGemLight], [85, 44, C.crownGem], [86, 44, C.crownGemLight], [87, 44, C.crownGemLight], [88, 44, C.crownDark],
  [82, 45, C.crownDark], [83, 45, C.crownGem], [84, 45, C.crownGemLight], [85, 45, C.crownGem], [86, 45, C.crownGemLight], [87, 45, C.crownGem], [88, 45, C.crownDark],
  [83, 46, C.crownGem], [84, 46, C.crownGem], [85, 46, C.crownGem], [86, 46, C.crownGem], [87, 46, C.crownGem],
  [83, 47, C.crownGemDark], [84, 47, C.crownGemDark], [85, 47, C.crownGemDark], [86, 47, C.crownGemDark], [87, 47, C.crownGemDark],
]

// ── 2. 头部/面部 (y:55-96) ──
const HEAD_PIXELS = [
  // 额头及头盔上缘 (y:55-60, x:68-102)
  [68, 55, C.faceDark], [69, 55, C.faceDark],
                      ...[70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100].map(x => [x, 55, C.face]),
                      [101, 55, C.faceDark], [102, 55, C.faceDark],
  [67, 56, C.faceDark], [68, 56, C.face], ...[69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101].map(x => [x, 56, C.face]), [102, 56, C.face], [103, 56, C.faceDark],
  ...[57,58,59,60].flatMap(y => {
    const row = []
    for (let x = 66; x <= 104; x++) {
      if (x === 66 || x === 104) row.push([x, y, C.faceDark])
      else if (x === 67 || x === 103) row.push([x, y, C.face])
      else row.push([x, y, C.faceLight])
    }
    return row
  }),

  // 眉毛 (y:61-63)
  ...[61,62].flatMap(y => {
    const row = []
    for (let x = 66; x <= 104; x++) {
      if (x === 66 || x === 104) row.push([x, y, C.faceDark])
      else if ((x >= 71 && x <= 79) || (x >= 91 && x <= 99)) row.push([x, y, C.brow])
      else row.push([x, y, C.faceLight])
    }
    return row
  }),
  [71, 63, C.brow], [72, 63, C.brow], [73, 63, C.brow], [74, 63, C.brow], [75, 63, C.brow], [76, 63, C.brow], [77, 63, C.face], [78, 63, C.face],
  [91, 63, C.face], [92, 63, C.face], [93, 63, C.brow], [94, 63, C.brow], [95, 63, C.brow], [96, 63, C.brow], [97, 63, C.brow], [98, 63, C.brow], [99, 63, C.brow],

  // 眼睛区域 (y:64-69)
  ...[64,65,66,67,68,69].flatMap(y => {
    const row = []
    for (let x = 66; x <= 104; x++) {
      if (x === 66 || x === 104) row.push([x, y, C.faceDark])
      // 左眼窝
      else if (x >= 70 && x <= 80 && y >= 64 && y <= 67) {
        if ((x >= 72 && x <= 78 && y >= 65 && y <= 66)) row.push([x, y, C.eye])
        else if (x === 71 || x === 79 || y === 64 || y === 67) row.push([x, y, C.eyeLight])
        else row.push([x, y, C.faceDark])
      }
      // 右眼窝
      else if (x >= 90 && x <= 100 && y >= 64 && y <= 67) {
        if ((x >= 92 && x <= 98 && y >= 65 && y <= 66)) row.push([x, y, C.eye])
        else if (x === 91 || x === 99 || y === 64 || y === 67) row.push([x, y, C.eyeLight])
        else row.push([x, y, C.faceDark])
      }
      else if (y >= 68 && y <= 69) row.push([x, y, C.face])
      else row.push([x, y, C.faceLight])
    }
    return row
  }),

  // 眼下-鼻子区域 (y:70-79)
  ...[70,71,72,73,74,75,76,77,78,79].flatMap(y => {
    const row = []
    for (let x = 66; x <= 104; x++) {
      if (x === 66 || x === 104) row.push([x, y, C.faceDark])
      else if (x === 67 || x === 103) row.push([x, y, C.faceShadow])
      // 鼻子
      else if (y >= 73 && y <= 77 && x >= 83 && x <= 87) {
        if (x === 83 || x === 87) row.push([x, y, C.faceDark])
        else if (y === 77 && (x === 84 || x === 86)) row.push([x, y, C.faceDark])
        else row.push([x, y, C.faceLight])
      }
      // 鼻梁
      else if (y >= 70 && y <= 72 && x >= 84 && x <= 86) {
        row.push([x, y, C.face])
      }
      // 颧骨高光
      else if ((x >= 74 && x <= 76 && y >= 71 && y <= 73) || (x >= 94 && x <= 96 && y >= 71 && y <= 73)) {
        row.push([x, y, C.face])
      }
      else row.push([x, y, C.face])
    }
    return row
  }),

  // 胡须/下颌 (y:80-91)
  ...[80,81,82,83,84,85,86,87,88,89,90,91].flatMap(y => {
    const row = []
    const beardTop = 80, beardBottom = 91
    const t = (y - beardTop) / (beardBottom - beardTop)
    // 胡须逐渐变窄呈V形
    const halfWidth = Math.floor(18 - t * 8)
    for (let x = 66; x <= 104; x++) {
      if (x === 66 || x === 104) row.push([x, y, C.faceDark])
      else if (x === 67 || x === 103) row.push([x, y, C.faceShadow])
      else if (x < 85 - halfWidth || x > 85 + halfWidth) row.push([x, y, C.faceShadow])
      // 胡须纹理
      else if ((x + y) % 5 === 0 && x !== 85) row.push([x, y, C.faceDark])
      else if ((x + y) % 7 === 0) row.push([x, y, C.faceLight])
      else row.push([x, y, C.face])
    }
    return row
  }),

  // 下颌收尾 (y:92-96)
  [74, 92, C.faceDark], ...[75,76,77,78].map(x => [x, 92, C.faceShadow]),
  ...[79,80,81,82,83,84,85,86,87,88,89,90,91].map(x => [x, 92, y => y === 85 ? C.face : y % 3 === 0 ? C.faceDark : C.face]),
  [92, 92, C.faceShadow], [93, 92, C.faceShadow], [94, 92, C.faceShadow], [95, 92, C.faceDark],
].map(([x, y, c]) => [x, y, typeof c === 'function' ? c(y) : c])

// ── 3. 颈部 (y:94-100) ──
const NECK_PIXELS = (() => {
  const pixels = []
  for (let y = 94; y <= 100; y++) {
    for (let x = 77; x <= 93; x++) {
      if (x === 77 || x === 93) pixels.push([x, y, C.faceDark])
      else if (x === 78 || x === 92) pixels.push([x, y, C.faceShadow])
      else pixels.push([x, y, C.face])
    }
  }
  return pixels
})()

// ── 4. 肩甲 (y:100-134) ──
const PAULDRON_PIXELS = (() => {
  const pixels = []
  for (let y = 100; y <= 134; y++) {
    // 肩甲宽度：中间最宽，上下收窄
    let leftEdge, rightEdge
    if (y <= 104) {
      leftEdge = 48 - (y - 100) * 3
      rightEdge = 122 + (y - 100) * 3
    } else if (y <= 120) {
      const tt = (y - 104) / 16
      leftEdge = 36 + tt * 2
      rightEdge = 134 - tt * 2
    } else {
      const tt = (y - 120) / 14
      leftEdge = 38 + tt * 10
      rightEdge = 132 - tt * 10
    }

    for (let x = Math.floor(leftEdge); x <= Math.floor(rightEdge); x++) {
      const isEdge = x === Math.floor(leftEdge) || x === Math.floor(rightEdge)
      const isNearEdge = x === Math.floor(leftEdge) + 1 || x === Math.floor(rightEdge) - 1
      const isRim = y <= 106 || y >= 130

      if (isEdge) {
        pixels.push([x, y, C.pauldronDark])
      } else if (isNearEdge && isRim) {
        pixels.push([x, y, C.pauldronRim])
      } else if (isNearEdge) {
        pixels.push([x, y, C.pauldronDark])
      } else if (isRim) {
        pixels.push([x, y, y <= 103 ? C.pauldronLight : C.pauldronRim])
      } else if ((x + y) % 7 === 0) {
        pixels.push([x, y, C.pauldronDark])
      } else if ((x - y) % 9 === 0) {
        pixels.push([x, y, C.pauldronLight])
      } else {
        pixels.push([x, y, C.pauldron])
      }
    }
  }
  return pixels
})()

// ── 5. 胸甲 (y:134-198) ──
const CHEST_PIXELS = (() => {
  const pixels = []
  for (let y = 134; y <= 198; y++) {
    const t = (y - 134) / 64
    // 胸甲轮廓：上半宽，腰处收窄
    let leftEdge = 50 - Math.sin(t * Math.PI * 0.5) * 4
    let rightEdge = 120 + Math.sin(t * Math.PI * 0.5) * 4
    if (y > 180) {
      leftEdge = 46 + (y - 180) * 0.5
      rightEdge = 124 - (y - 180) * 0.5
    }

    for (let x = Math.floor(leftEdge); x <= Math.floor(rightEdge); x++) {
      const isEdge = x === Math.floor(leftEdge) || x === Math.floor(rightEdge)
      const isNearEdge = x === Math.floor(leftEdge) + 1 || x === Math.floor(rightEdge) - 1
      const cx = 85
      // 胸甲中线（竖直装饰线）
      const isCenterLine = Math.abs(x - cx) <= 1
      // 胸甲横向装饰纹
      const isHorizontalBand = (y - 134) % 16 === 0 || (y - 134) % 16 === 1
      // V形领口线
      const isVCollar = y >= 134 && y <= 148 && Math.abs(x - cx) <= (y - 134) * 1.2

      if (isEdge) {
        pixels.push([x, y, C.armorDark])
      } else if (isNearEdge) {
        pixels.push([x, y, C.armor])
      } else if (isVCollar && (x % 3 === 0 || Math.abs(x - cx) > (y - 134) * 0.8)) {
        pixels.push([x, y, C.armorDark])
      } else if (isCenterLine && y > 148) {
        pixels.push([x, y, y % 4 < 2 ? C.armorRune : C.armorDark])
      } else if (isHorizontalBand && y > 148) {
        pixels.push([x, y, C.armorDark])
      } else if ((x + y) % 12 === 0) {
        pixels.push([x, y, C.armorLight])
      } else {
        pixels.push([x, y, C.armor])
      }
    }
  }
  return pixels
})()

// ── 6. 腰带 (y:198-214) ──
const BELT_PIXELS = (() => {
  const pixels = []
  for (let y = 198; y <= 214; y++) {
    for (let x = 55; x <= 115; x++) {
      if (x === 55 || x === 115) {
        pixels.push([x, y, C.beltDark])
      } else if (x === 56 || x === 114) {
        pixels.push([x, y, C.beltLight])
      } else if (y === 198 || y === 214) {
        pixels.push([x, y, C.beltDark])
      } else if (y === 199 || y === 213) {
        pixels.push([x, y, C.beltLight])
      }
      // 腰带扣 (中心装饰)
      else if (y >= 203 && y <= 211 && x >= 80 && x <= 90) {
        if (x === 80 || x === 90 || y === 203 || y === 211) {
          pixels.push([x, y, C.beltBuckle])
        } else if (x === 85 && y === 207) {
          pixels.push([x, y, C.beltDark])
        } else {
          pixels.push([x, y, y < 207 ? C.beltLight : C.beltDark])
        }
      } else {
        pixels.push([x, y, (y + x) % 6 < 2 ? C.beltDark : C.belt])
      }
    }
  }
  return pixels
})()

// ── 7. 腿部/战袍 (y:214-285) ──
const LEGS_PIXELS = (() => {
  const pixels = []
  for (let y = 214; y <= 285; y++) {
    const t = (y - 214) / 71
    const halfWidth = 30 + Math.sin(t * Math.PI) * 5 // 中间宽，底部收窄
    for (let x = Math.floor(85 - halfWidth); x <= Math.floor(85 + halfWidth); x++) {
      const isEdge = x === Math.floor(85 - halfWidth) || x === Math.floor(85 + halfWidth)
      const centerDist = Math.abs(x - 85)
      // 战袍褶皱
      const foldLine1 = centerDist < 10 && (y % 12 === 0 || y % 12 === 6)
      const foldLine2 = centerDist >= 10 && centerDist < 20 && (y % 10 === 0)

      if (isEdge) {
        pixels.push([x, y, C.robeDark])
      } else if (foldLine1 || foldLine2) {
        pixels.push([x, y, C.robeFold])
      } else if ((x + y) % 8 === 0) {
        pixels.push([x, y, C.robeLight])
      } else {
        pixels.push([x, y, C.robe])
      }
    }
  }
  return pixels
})()

// ── 8. 左手 + 左前臂 (y:134-245, 从肩甲到剑柄) ──
const LEFT_ARM_PIXELS = (() => {
  const pixels = []
  const shoulderX = 45
  const handX = 78 // 剑柄位置

  for (let y = 134; y <= 245; y++) {
    const t = (y - 134) / (242 - 134)
    const cx = shoulderX + (handX - shoulderX) * t
    const armWidth = y < 220 ? 4 : 3 // 前臂稍细

    for (let dx = -armWidth; dx <= armWidth; dx++) {
      const x = Math.round(cx + dx)
      const isGauntlet = y >= 228
      const base = isGauntlet ? C.gauntlet : C.arm
      const dark = isGauntlet ? C.gauntletDark : C.armDark
      const light = isGauntlet ? C.gauntletLight : C.armLight

      if (Math.abs(dx) === armWidth) {
        pixels.push([x, y, dark])
      } else if (Math.abs(dx) === armWidth - 1 && !isGauntlet) {
        pixels.push([x, y, light])
      } else {
        pixels.push([x, y, isGauntlet && (y % 4 < 2) ? light : base])
      }
    }
  }
  return pixels
})()

// ── 9. 右手 + 右前臂 (y:134-245, 从肩甲到剑柄) ──
const RIGHT_ARM_PIXELS = (() => {
  const pixels = []
  const shoulderX = 125
  const handX = 92

  for (let y = 134; y <= 245; y++) {
    const t = (y - 134) / (242 - 134)
    const cx = shoulderX + (handX - shoulderX) * t
    const armWidth = y < 220 ? 4 : 3

    for (let dx = -armWidth; dx <= armWidth; dx++) {
      const x = Math.round(cx + dx)
      const isGauntlet = y >= 228
      const base = isGauntlet ? C.gauntlet : C.arm
      const dark = isGauntlet ? C.gauntletDark : C.armDark
      const light = isGauntlet ? C.gauntletLight : C.armLight

      if (Math.abs(dx) === armWidth) {
        pixels.push([x, y, dark])
      } else if (Math.abs(dx) === armWidth - 1 && !isGauntlet) {
        pixels.push([x, y, light])
      } else {
        pixels.push([x, y, isGauntlet && (y % 4 < 2) ? light : base])
      }
    }
  }
  return pixels
})()

// ── 10. 剑柄 (y:228-254) ──
const SWORD_HILT_PIXELS = [
  // 柄头（pommel, y:228-234）
  [83, 228, C.hiltDark], [84, 228, C.hiltLight], [85, 228, C.hiltLight], [86, 228, C.hiltLight], [87, 228, C.hiltDark],
  [82, 229, C.hiltDark], [83, 229, C.hilt], [84, 229, C.hiltLight], [85, 229, C.hiltLight], [86, 229, C.hiltLight], [87, 229, C.hilt], [88, 229, C.hiltDark],
  [82, 230, C.hilt], [83, 230, C.hilt], [84, 230, C.hiltLight], [85, 230, C.crownGem], [86, 230, C.hiltLight], [87, 230, C.hilt], [88, 230, C.hilt],
  [83, 231, C.hiltDark], [84, 231, C.hilt], [85, 231, C.hilt], [86, 231, C.hilt], [87, 231, C.hiltDark],

  // 握把 (y:232-246)
  ...[232,233,234,235,236,237,238,239,240,241,242,243,244,245,246].flatMap(y => {
    const row = []
    for (let x = 82; x <= 88; x++) {
      if (x === 82 || x === 88) {
        row.push([x, y, C.hiltDark])
      } else if (x === 83 || x === 87) {
        row.push([x, y, (y % 4 < 2) ? C.hiltWrap : C.hiltDark])
      } else {
        row.push([x, y, (y % 4 < 2) ? C.hiltLight : C.hilt])
      }
    }
    return row
  }),

  // 剑格/护手 (y:247-254, x:68-102)
  [68, 247, C.guardDark], [69, 247, C.guard], ...[70,71,72,73,74,75,76,77,78,79,80,81].map(x => [x, 247, C.guardLight]),
  [82, 247, C.guard], [83, 247, C.guardLight], [84, 247, C.guard], [85, 247, C.guard], [86, 247, C.guard], [87, 247, C.guardLight], [88, 247, C.guard],
  ...[89,90,91,92,93,94,95,96,97,98,99,100].map(x => [x, 247, C.guardLight]), [101, 247, C.guard], [102, 247, C.guardDark],

  [67, 248, C.guardDark], [68, 248, C.guard], ...[69,70,71,72,73,74,75,76,77,78,79,80,81].map(x => [x, 248, C.guardDark]),
  [82, 248, C.guard], [83, 248, C.guard], [84, 248, C.guardDark], [85, 248, C.guardDark], [86, 248, C.guardDark], [87, 248, C.guard], [88, 248, C.guard],
  ...[89,90,91,92,93,94,95,96,97,98,99,100,101].map(x => [x, 248, C.guardDark]), [102, 248, C.guard], [103, 248, C.guardDark],

  [66, 249, C.guardDark], [67, 249, C.guard], ...[68,69,70,71,72,73,74,75,76,77,78,79].map(x => [x, 249, C.guard]),
  [80, 249, C.guardDark], [81, 249, C.guardDark],
  [89, 249, C.guardDark], [90, 249, C.guardDark],
  ...[91,92,93,94,95,96,97,98,99,100,101,102].map(x => [x, 249, C.guard]), [103, 249, C.guard], [104, 249, C.guardDark],

  [65, 250, C.guardDark], ...[66,67,68,69,70,71,72,73,74,75,76,77].map(x => [x, 250, C.guard]),
  [78, 250, C.guardDark], [79, 250, C.guardDark],
  [91, 250, C.guardDark], [92, 250, C.guardDark],
  ...[93,94,95,96,97,98,99,100,101,102,103,104].map(x => [x, 250, C.guard]), [105, 250, C.guardDark],

  // 剑格收窄
  [64, 251, C.guardDark], ...[65,66,67,68,69,70,71,72,73,74].map(x => [x, 251, C.guard]),
  [75, 251, C.guardDark], [76, 251, C.guard],
  [94, 251, C.guard], [95, 251, C.guardDark],
  ...[96,97,98,99,100,101,102,103,104,105].map(x => [x, 251, C.guard]), [106, 251, C.guardDark],

  [63, 252, C.guardDark], ...[64,65,66].map(x => [x, 252, C.guard]),
  [107, 252, C.guard], [108, 252, C.guardDark],

  [63, 253, C.guardDark], [64, 253, C.guard], [65, 253, C.guard],
  [107, 253, C.guard], [108, 253, C.guardDark],

  [64, 254, C.guardDark], [65, 254, C.guardDark],
  [107, 254, C.guardDark],
]

// ── 11. 双手（握剑） (y:238-248, 覆盖在剑柄上) ──
const HANDS_PIXELS = (() => {
  const pixels = []
  // 左手 (x:74-82 around hilt)
  for (let y = 240; y <= 246; y++) {
    for (let x = 76; x <= 81; x++) {
      if (x === 76 || x === 81) pixels.push([x, y, C.gauntletDark])
      else if (x === 77 || x === 80) pixels.push([x, y, C.gauntlet])
      else pixels.push([x, y, C.gauntletLight])
    }
  }
  // 手指细节（左手）
  pixels.push([76, 240, C.gauntletDark], [77, 240, C.gauntletLight], [78, 240, C.gauntlet], [79, 240, C.gauntlet], [80, 240, C.gauntletLight], [81, 240, C.gauntletDark])
  pixels.push([76, 246, C.gauntletDark], [77, 246, C.gauntlet], [78, 246, C.gauntletLight], [79, 246, C.gauntletLight], [80, 246, C.gauntlet], [81, 246, C.gauntletDark])

  // 右手 (x:89-94 around hilt)
  for (let y = 240; y <= 246; y++) {
    for (let x = 89; x <= 94; x++) {
      if (x === 89 || x === 94) pixels.push([x, y, C.gauntletDark])
      else if (x === 90 || x === 93) pixels.push([x, y, C.gauntlet])
      else pixels.push([x, y, C.gauntletLight])
    }
  }
  // 手指细节（右手）
  pixels.push([89, 240, C.gauntletDark], [90, 240, C.gauntletLight], [91, 240, C.gauntlet], [92, 240, C.gauntlet], [93, 240, C.gauntletLight], [94, 240, C.gauntletDark])
  pixels.push([89, 246, C.gauntletDark], [90, 246, C.gauntlet], [91, 246, C.gauntletLight], [92, 246, C.gauntletLight], [93, 246, C.gauntlet], [94, 246, C.gauntletDark])

  return pixels
})()

// ── 12. 剑身 (y:254-350, x:82-88) ──
const SWORD_BLADE_PIXELS = (() => {
  const pixels = []
  // 剑身主体 (y:254-345, 宽6px居中x=82-88)
  for (let y = 254; y <= 345; y++) {
    // 剑身血槽（中线）
    const isFuller = (y % 6 === 0 || y % 6 === 1) && y > 260

    for (let x = 81; x <= 89; x++) {
      if (x === 81 || x === 89) {
        pixels.push([x, y, C.bladeDark])
      } else if (x === 82 || x === 88) {
        pixels.push([x, y, C.blade])
      } else if (x === 83 || x === 87) {
        pixels.push([x, y, C.bladeLight])
      } else if (isFuller) {
        pixels.push([x, y, C.bladeDark])
      } else {
        pixels.push([x, y, C.bladeCore])
      }
    }
  }

  // 剑尖 (y:346-354, 逐渐收窄)
  for (let y = 346; y <= 354; y++) {
    const halfW = Math.max(1, Math.floor(4 - (y - 346) * 0.6))
    for (let x = 85 - halfW; x <= 85 + halfW; x++) {
      if (x === 85 - halfW || x === 85 + halfW) {
        pixels.push([x, y, C.bladeDark])
      } else if (Math.abs(x - 85) < halfW - 1) {
        pixels.push([x, y, C.bladeCore])
      } else {
        pixels.push([x, y, C.blade])
      }
    }
  }
  // 最尖端
  pixels.push([85, 355, C.bladeEdge])
  pixels.push([85, 356, C.bladeLight])

  return pixels
})()

// ── 13. 石台基座 (y:330-419) ──
const PLATFORM_PIXELS = (() => {
  const pixels = []

  // 石台顶层表面 (y:330-344)
  for (let y = 330; y <= 344; y++) {
    const t = (y - 330) / 14
    const halfW = 35 + t * 8
    for (let x = Math.floor(85 - halfW); x <= Math.floor(85 + halfW); x++) {
      if (y === 330 || y === 331) {
        pixels.push([x, y, C.platformTop])
      } else if (x === Math.floor(85 - halfW) || x === Math.floor(85 + halfW)) {
        pixels.push([x, y, C.platformDark])
      } else if ((x + y) % 8 === 0) {
        pixels.push([x, y, C.platform])
      } else {
        pixels.push([x, y, C.platformLight])
      }
    }
  }

  // 石台主体第一层 (y:345-370)
  for (let y = 345; y <= 370; y++) {
    for (let x = 18; x <= 152; x++) {
      if (x === 18 || x === 152) {
        pixels.push([x, y, C.platformDark])
      } else if (x === 19 || x === 151) {
        pixels.push([x, y, C.platformDark])
      } else if (y === 345 || y === 346) {
        pixels.push([x, y, x % 5 < 2 ? C.platformDark : C.platformLight])
      } else if (y === 369 || y === 370) {
        pixels.push([x, y, C.platformDark])
      } else if ((x + y) % 8 === 0) {
        pixels.push([x, y, C.platformDark])
      } else if ((x - y) % 10 === 0) {
        pixels.push([x, y, C.platformLight])
      } else {
        pixels.push([x, y, C.platform])
      }
    }
  }

  // 石台主体第二层（更宽）(y:371-395)
  for (let y = 371; y <= 395; y++) {
    for (let x = 10; x <= 160; x++) {
      if (x === 10 || x === 160) {
        pixels.push([x, y, C.platformDark])
      } else if (x === 11 || x === 159) {
        pixels.push([x, y, C.platformDark])
      } else if (y === 371 || y === 372) {
        pixels.push([x, y, x % 5 < 2 ? C.platformDark : C.platformLight])
      } else if (y === 394 || y === 395) {
        pixels.push([x, y, C.platformDark])
      } else if ((x + y) % 9 === 0) {
        pixels.push([x, y, C.platformDark])
      } else if ((x - y) % 11 === 0) {
        pixels.push([x, y, C.platformLight])
      } else {
        pixels.push([x, y, C.platform])
      }
    }
  }

  // 石台底层台阶 (y:396-419)
  for (let step = 0; step < 3; step++) {
    const sy = 396 + step * 8
    const ey = Math.min(sy + 7, 419)
    const offset = step * 6
    for (let y = sy; y <= ey; y++) {
      for (let x = 6 + offset; x <= 164 - offset; x++) {
        if (y === sy) {
          pixels.push([x, y, x % 4 < 2 ? C.platformLight : C.platformTop])
        } else if (x === 6 + offset || x === 164 - offset) {
          pixels.push([x, y, C.platformDark])
        } else if (y === ey) {
          pixels.push([x, y, C.platformDark])
        } else {
          pixels.push([x, y, step === 2 ? C.platformDark : C.platform])
        }
      }
    }
  }

  // 石台符文装饰（中央三角/菱形）
  const runeY = 332
  for (let dy = 0; dy < 8; dy++) {
    const halfW = dy < 4 ? dy + 1 : 8 - dy
    for (let x = 85 - halfW; x <= 85 + halfW; x++) {
      pixels.push([x, runeY + dy, C.platformRune])
    }
  }

  return pixels
})()

// ── 14. 苔藓/风化点缀 ──
const MOSS_PIXELS = (() => {
  const pixels = []
  // 石台边缘苔藓
  const mossSpots = [
    [20, 348], [22, 349], [24, 348], [26, 350], [28, 347],
    [140, 348], [142, 349], [144, 347], [146, 350], [148, 348],
    [12, 373], [14, 374], [16, 373], [18, 375],
    [156, 373], [154, 374], [152, 375], [150, 373],
    [30, 398], [32, 399], [34, 398],
    [138, 398], [136, 399], [134, 400],
    // 肩甲上苔藓
    [38, 112], [40, 114], [42, 113],
    [130, 112], [128, 114], [126, 113],
  ]
  for (const [mx, my] of mossSpots) {
    pixels.push([mx, my, C.moss])
    if ((mx + my) % 3 === 0) pixels.push([mx + 1, my, C.mossLight])
    if ((mx + my) % 4 === 1) pixels.push([mx, my + 1, C.mossDark])
  }
  return pixels
})()

// ── 合并所有静态像素 ──
const TREE_STATIC_PIXELS = [
  ...CROWN_PIXELS,
  ...HEAD_PIXELS,
  ...NECK_PIXELS,
  ...PAULDRON_PIXELS,
  ...CHEST_PIXELS,
  ...BELT_PIXELS,
  ...LEGS_PIXELS,
  ...LEFT_ARM_PIXELS,
  ...RIGHT_ARM_PIXELS,
  ...SWORD_HILT_PIXELS,
  ...HANDS_PIXELS,
  ...SWORD_BLADE_PIXELS,
  ...PLATFORM_PIXELS,
  ...MOSS_PIXELS,
]

// ==============================
//  drawTree 绘制函数
// ==============================

/**
 * @description 绘制古英雄石像
 * @param {CanvasRenderingContext2D} ctx canvas上下文
 * @param {Object} config
 * @param {Number} config.x 石像左上角 x 坐标
 * @param {Number} config.y 石像左上角 y 坐标
 * @param {Number} config.width 石像实际宽（宽高比 170:420）
 * @param {Number} config.height 石像实际高
 * @param {Number} config.frame 当前帧数
 */
export function drawTree(ctx, config) {
  const { x, y, width = 170, height = 420, frame = 0 } = config
  ctx.imageSmoothingEnabled = false

  // 计算缩放单位：保持 170:420 宽高比
  const u = width / 170

  // ========== 天空背景填充 ==========
  ctx.fillStyle = C.sky
  ctx.fillRect(x, y, width, height)

  // ========== 渲染所有静态像素 ==========
  for (let i = 0; i < TREE_STATIC_PIXELS.length; i++) {
    const [px, py, color] = TREE_STATIC_PIXELS[i]
    drawPixel({ px, py, color, ctx, x, y, unit: u })
  }

  // ========== 动画参数（基于 frame） ==========
  const anim = {
    // 剑身晕光脉动（主特效）
    bladeGlow: 0.4 + 0.6 * Math.sin(frame * 1.5),
    bladeGlowFast: 0.5 + 0.5 * Math.sin(frame * 3.0),
    // 剑身光晕偏移（上下流动感）
    glowFlow: (frame * 0.8) % 1.0,
    // 王冠宝石闪烁
    gemSparkle: 0.3 + 0.7 * Math.abs(Math.sin(frame * 2.5)),
    gemPulse: 0.5 + 0.5 * Math.sin(frame * 1.8 + 0.5),
    // 石台符文脉动
    runePulse: 0.3 + 0.7 * Math.sin(frame * 1.4 + 1.2),
    // 风化粒子
    dustAlpha: 0.2 + 0.3 * Math.sin(frame * 2.2),
  }

  // ========== 动画叠加渲染 ==========
  drawSwordGlow(ctx, x, y, u, anim)
  drawCrownGemGlow(ctx, x, y, u, anim)
  drawPlatformRuneGlow(ctx, x, y, u, anim)
  drawDustParticles(ctx, x, y, u, anim, frame)
}

// ==============================
//  动画辅助函数
// ==============================

/** 剑身晕光特效 —— 沿剑身从上到下的流动光晕 */
const drawSwordGlow = (ctx, bx, by, u, anim) => {
  const bladeStartY = 254
  const bladeEndY = 355
  const bladeCenterX = 85
  const bladeLength = bladeEndY - bladeStartY

  // === 外层大光晕（高斯型径向渐变） ===
  const glowAlpha = anim.bladeGlow * 0.35
  if (glowAlpha > 0.03) {
    // 光晕中心随 frame 上下流动
    const glowCenterY = bladeStartY + anim.glowFlow * bladeLength

    ctx.save()
    // 外光晕 - 蓝白色
    const outerGrad = ctx.createRadialGradient(
      bx + bladeCenterX * u, by + glowCenterY * u, 2 * u,
      bx + bladeCenterX * u, by + glowCenterY * u, 18 * u
    )
    outerGrad.addColorStop(0, `rgba(136, 204, 255, ${glowAlpha})`)
    outerGrad.addColorStop(0.4, `rgba(68, 136, 204, ${glowAlpha * 0.7})`)
    outerGrad.addColorStop(0.7, `rgba(34, 68, 136, ${glowAlpha * 0.3})`)
    outerGrad.addColorStop(1, 'rgba(34, 68, 136, 0)')
    ctx.fillStyle = outerGrad
    ctx.fillRect(
      bx + (bladeCenterX - 20) * u, by + (bladeStartY - 10) * u,
      40 * u, (bladeLength + 20) * u
    )
    ctx.restore()
  }

  // === 剑身边缘高光线 ===
  const edgeAlpha = anim.bladeGlowFast * 0.5
  if (edgeAlpha > 0.05) {
    ctx.save()
    // 左侧边缘辉光
    const leftEdgeGrad = ctx.createLinearGradient(
      bx + 81 * u, 0, bx + 84 * u, 0
    )
    leftEdgeGrad.addColorStop(0, `rgba(204, 238, 255, ${edgeAlpha * 0.9})`)
    leftEdgeGrad.addColorStop(1, `rgba(204, 238, 255, 0)`)

    ctx.fillStyle = leftEdgeGrad
    ctx.fillRect(
      bx + 81 * u, by + bladeStartY * u,
      3 * u, bladeLength * u
    )

    // 右侧边缘辉光
    const rightEdgeGrad = ctx.createLinearGradient(
      bx + 89 * u, 0, bx + 86 * u, 0
    )
    rightEdgeGrad.addColorStop(0, `rgba(204, 238, 255, ${edgeAlpha * 0.9})`)
    rightEdgeGrad.addColorStop(1, `rgba(204, 238, 255, 0)`)

    ctx.fillStyle = rightEdgeGrad
    ctx.fillRect(
      bx + 86 * u, by + bladeStartY * u,
      3 * u, bladeLength * u
    )
    ctx.restore()
  }

  // === 剑身中线流光 ===
  const flowAlpha = 0.3 + 0.4 * anim.bladeGlowFast
  const flowY1 = (anim.glowFlow * bladeLength) % bladeLength
  const flowY2 = ((anim.glowFlow + 0.3) * bladeLength) % bladeLength

  for (const fy of [flowY1, flowY2]) {
    const centerY = bladeStartY + fy
    const flowGrad = ctx.createRadialGradient(
      bx + 85 * u, by + centerY * u, 0,
      bx + 85 * u, by + centerY * u, 8 * u
    )
    flowGrad.addColorStop(0, `rgba(255, 255, 255, ${flowAlpha * 0.8})`)
    flowGrad.addColorStop(0.3, `rgba(204, 238, 255, ${flowAlpha * 0.6})`)
    flowGrad.addColorStop(0.6, `rgba(136, 204, 255, ${flowAlpha * 0.3})`)
    flowGrad.addColorStop(1, 'rgba(68, 136, 204, 0)')

    ctx.fillStyle = flowGrad
    ctx.fillRect(
      bx + (77) * u, by + (centerY - 8) * u,
      16 * u, 16 * u
    )
  }
}

/** 王冠宝石闪烁 */
const drawCrownGemGlow = (ctx, bx, by, u, anim) => {
  const gemX = 85, gemY = 45
  const alpha = anim.gemSparkle * 0.6

  if (alpha < 0.05) return

  // 宝石光晕
  const gemGrad = ctx.createRadialGradient(
    bx + gemX * u, by + gemY * u, 0,
    bx + gemX * u, by + gemY * u, 6 * u
  )
  gemGrad.addColorStop(0, `rgba(106, 170, 238, ${alpha})`)
  gemGrad.addColorStop(0.5, `rgba(74, 138, 181, ${alpha * 0.5})`)
  gemGrad.addColorStop(1, 'rgba(74, 138, 181, 0)')

  ctx.fillStyle = gemGrad
  ctx.beginPath()
  ctx.arc(bx + gemX * u, by + gemY * u, 6 * u, 0, Math.PI * 2)
  ctx.fill()

  // 十字光芒
  const sparkAlpha = Math.max(0, anim.gemSparkle - 0.5) * 0.8
  if (sparkAlpha > 0.01) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${sparkAlpha})`
    ctx.lineWidth = 0.5 * u
    ctx.beginPath()
    ctx.moveTo(bx + (gemX - 4) * u, by + gemY * u)
    ctx.lineTo(bx + (gemX + 4) * u, by + gemY * u)
    ctx.moveTo(bx + gemX * u, by + (gemY - 4) * u)
    ctx.lineTo(bx + gemX * u, by + (gemY + 4) * u)
    ctx.stroke()
  }
}

/** 石台符文脉动 */
const drawPlatformRuneGlow = (ctx, bx, by, u, anim) => {
  const runeX = 85, runeY = 336
  const alpha = anim.runePulse * 0.35

  if (alpha < 0.03) return

  const runeGrad = ctx.createRadialGradient(
    bx + runeX * u, by + runeY * u, 1 * u,
    bx + runeX * u, by + runeY * u, 10 * u
  )
  runeGrad.addColorStop(0, `rgba(180, 160, 120, ${alpha})`)
  runeGrad.addColorStop(0.5, `rgba(140, 120, 80, ${alpha * 0.5})`)
  runeGrad.addColorStop(1, 'rgba(100, 80, 50, 0)')

  ctx.fillStyle = runeGrad
  ctx.fillRect(
    bx + (runeX - 10) * u, by + (runeY - 10) * u,
    20 * u, 20 * u
  )
}

/** 石像风化粒子/尘埃飘落 */
const drawDustParticles = (ctx, bx, by, u, anim, frame) => {
  const particleCount = 12

  for (let i = 0; i < particleCount; i++) {
    const seed = i * 137 + 42
    // 粒子主要分布在石像周围
    const baseX = 30 + (seed % 110)
    const baseY = 100 + ((seed * 7) % 250)
    const speed = 15 + (i % 5) * 8

    const px = baseX + Math.sin(frame * 1.3 + i * 0.9) * 12
    const py = (baseY + frame * speed) % 350 + 50

    const alpha = anim.dustAlpha * (0.3 + 0.3 * Math.sin(frame * 1.7 + i * 1.4))

    ctx.fillStyle = `rgba(180, 175, 165, ${alpha})`
    ctx.beginPath()
    ctx.arc(bx + px * u, by + py * u, (1 + (i % 2)) * u, 0, Math.PI * 2)
    ctx.fill()
  }
}
