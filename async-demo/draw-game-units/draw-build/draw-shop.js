import { drawPixel } from '../draw-utils.js'

export const config = {
  // 商店建筑宽高比固定 120:200
  ASPECT_RATIO: 120 / 200,
}

// ==============================
//  暗黑哥特风颜色常量
// ==============================
const C = {
  // ── 天空/背景 ──
  sky: 'transparent',

  // ── 石墙主体 ──
  wall: '#2E2E38',
  wallDark: '#1E1E28',
  wallLight: '#3A3A44',
  wallShadow: '#14141E',
  wallHighlight: '#42424C',

  // ── 塔楼 ──
  tower: '#282834',
  towerDark: '#1C1C28',
  towerLight: '#343440',
  towerSpire: '#1A1A26',

  // ── 屋顶（暗色石板） ──
  roof: '#1A1A26',
  roofDark: '#0E0E18',
  roofLight: '#262636',
  roofEdge: '#222232',

  // ── 城门（铁质） ──
  door: '#1A1218',
  doorDark: '#0E080E',
  doorLight: '#261A22',
  doorFrame: '#2A1E26',
  doorStud: '#442A3A',
  doorHinge: '#3A222A',

  // ── 窗户 ──
  windowGlow: '#993355',
  windowGlowDim: '#661A33',
  windowGlowBright: '#CC4477',
  windowDark: '#0A0A14',
  windowFrame: '#1A1A28',

  // ── 旗帜 ──
  flag: '#6B0018',
  flagDark: '#3A000A',
  flagLight: '#991133',
  flagPole: '#1A1A22',

  // ── 火炬/火焰（紫色魔焰） ──
  fire: '#7733AA',
  fireBright: '#9944DD',
  fireInner: '#BB66FF',
  fireDark: '#441166',
  fireSpark: '#DDAAFF',
  torchBase: '#1E1E28',
  torchBracket: '#2A2A36',

  // ── 招牌 ──
  sign: '#261A22',
  signDark: '#1A0E16',
  signBorder: '#3A2230',
  signText: '#CC4466',
  signChain: '#2A1A24',

  // ── 魔法符文 ──
  rune: '#6644AA',
  runeGlow: '#8855CC',
  runeBright: '#AA77EE',
  runeDark: '#331166',

  // ── 烟囱 ──
  chimney: '#1E1E2A',
  chimneyDark: '#141422',
  chimneyLight: '#282836',

  // ── 地面（枯萎草地） ──
  ground: '#161E14',
  groundDark: '#0E140C',
  groundLight: '#1E281A',
  groundHighlight: '#263222',

  // ── 金币（暗金色） ──
  coin: '#886622',
  coinDark: '#553311',
  coinLight: '#AA8833',

  // ── 高光 ──
  highlight: '#666680',
  shadow: '#08080E',

  // ── 尖刺/哥特装饰 ──
  spike: '#1A1A26',
  spikeLight: '#2A2A3A',
}

// ==============================
//  建筑像素数据（静态部分）
//  格式: [x, y, color]
//  坐标系: 0..119 宽 × 0..199 高
// ==============================

// ── 1. 顶部尖刺装饰 ──
const SHOP_SKY_AND_SPIRES = [
  // ── 左塔尖刺 (x:4-22, y:18-28) ──
  // 尖端 (y=18)
  [12, 18, C.spikeLight],
  [11, 19, C.spike], [12, 19, C.spikeLight], [13, 19, C.spike],
  [10, 20, C.spike], [11, 20, C.spikeLight], [12, 20, C.spikeLight], [13, 20, C.spikeLight], [14, 20, C.spike],
  [9, 21, C.spike], [10, 21, C.spikeLight], [11, 21, C.spikeLight], [12, 21, C.spikeLight], [13, 21, C.spikeLight], [14, 21, C.spikeLight], [15, 21, C.spike],
  [8, 22, C.spike], [9, 22, C.spikeLight], [10, 22, C.spikeLight], [11, 22, C.spike], [12, 22, C.spike], [13, 22, C.spikeLight], [14, 22, C.spikeLight], [15, 22, C.spikeLight], [16, 22, C.spike],
  [7, 23, C.spike], [8, 23, C.spikeLight], [9, 23, C.spike], [10, 23, C.spikeLight], [11, 23, C.spikeLight], [12, 23, C.spikeLight], [13, 23, C.spikeLight], [14, 23, C.spike], [15, 23, C.spikeLight], [16, 23, C.spikeLight], [17, 23, C.spike],
  [6, 24, C.spike], [7, 24, C.spikeLight], [8, 24, C.spike], [9, 24, C.spikeLight], [10, 24, C.spikeLight], [11, 24, C.spike], [12, 24, C.spike], [13, 24, C.spikeLight], [14, 24, C.spikeLight], [15, 24, C.spike], [16, 24, C.spikeLight], [17, 24, C.spikeLight], [18, 24, C.spike],
  // 尖刺底座
  [6, 25, C.spike], [7, 25, C.towerDark], [8, 25, C.towerDark], [9, 25, C.tower], [10, 25, C.tower], [11, 25, C.towerDark], [12, 25, C.towerDark], [13, 25, C.tower], [14, 25, C.tower], [15, 25, C.towerDark], [16, 25, C.towerDark], [17, 25, C.tower], [18, 25, C.spike],

  // ── 右塔尖刺 (x:94-114, y:18-28) ──
  [108, 18, C.spikeLight],
  [107, 19, C.spike], [108, 19, C.spikeLight], [109, 19, C.spike],
  [106, 20, C.spike], [107, 20, C.spikeLight], [108, 20, C.spikeLight], [109, 20, C.spikeLight], [110, 20, C.spike],
  [105, 21, C.spike], [106, 21, C.spikeLight], [107, 21, C.spikeLight], [108, 21, C.spikeLight], [109, 21, C.spikeLight], [110, 21, C.spikeLight], [111, 21, C.spike],
  [104, 22, C.spike], [105, 22, C.spikeLight], [106, 22, C.spikeLight], [107, 22, C.spike], [108, 22, C.spike], [109, 22, C.spikeLight], [110, 22, C.spikeLight], [111, 22, C.spikeLight], [112, 22, C.spike],
  [103, 23, C.spike], [104, 23, C.spikeLight], [105, 23, C.spike], [106, 23, C.spikeLight], [107, 23, C.spikeLight], [108, 23, C.spikeLight], [109, 23, C.spikeLight], [110, 23, C.spike], [111, 23, C.spikeLight], [112, 23, C.spikeLight], [113, 23, C.spike],
  [102, 24, C.spike], [103, 24, C.spikeLight], [104, 24, C.spike], [105, 24, C.spikeLight], [106, 24, C.spikeLight], [107, 24, C.spike], [108, 24, C.spike], [109, 24, C.spikeLight], [110, 24, C.spikeLight], [111, 24, C.spike], [112, 24, C.spikeLight], [113, 24, C.spikeLight], [114, 24, C.spike],
  [102, 25, C.spike], [103, 25, C.towerDark], [104, 25, C.towerDark], [105, 25, C.tower], [106, 25, C.tower], [107, 25, C.towerDark], [108, 25, C.towerDark], [109, 25, C.tower], [110, 25, C.tower], [111, 25, C.towerDark], [112, 25, C.towerDark], [113, 25, C.tower], [114, 25, C.spike],
]

// ── 2. 左塔楼 x:2-26 y:30-188 ──
const SHOP_TOWER_LEFT = (() => {
  const pixels = []
  // 塔身 (y:30-184, x:2-24)
  for (let y = 30; y <= 184; y++) {
    const baseColor = y < 38 ? C.towerSpire : C.tower
    const isBrickSeam = (y - 30) % 10 === 0
    const darkRow = (y - 30) % 10 === 9
    for (let x = 2; x <= 24; x++) {
      if (x === 2 || x === 24 || x === 3 || x === 23) {
        // 塔边缘深色
        pixels.push([x, y, x < 5 || x > 21 ? C.towerDark : C.wallShadow])
      } else if (y >= 38 && isBrickSeam) {
        // 砖缝水平线
        pixels.push([x, y, C.towerDark])
      } else if (y >= 38 && darkRow && x % 10 >= 8) {
        // 砖缝垂直线（交错偏移）
        pixels.push([x, y, C.towerDark])
      } else {
        const isOddBrick = y >= 38 && x % 10 < 2
        pixels.push([x, y, isOddBrick ? C.towerLight : baseColor])
      }
    }
  }
  // 城垛 (雉堞, y:30-37)
  for (let i = 0; i < 4; i++) {
    const cx = 3 + i * 5
    for (let dy = 0; dy < 8; dy++) {
      for (let dx = 0; dx < 4; dx++) {
        const color = dy < 2 ? C.roofLight : dy > 6 ? C.roofDark : C.roof
        pixels.push([cx + dx, 30 + dy, color])
      }
    }
    // 城垛间隙
    if (i < 3) {
      for (let dy = 0; dy < 6; dy++) {
        pixels.push([cx + 4, 31 + dy, C.sky])
      }
    }
  }
  // 城垛横带
  for (let x = 2; x <= 24; x++) {
    pixels.push([x, 38, C.roofDark])
    pixels.push([x, 39, C.roofDark])
  }
  // 尖顶小窗
  for (let dy = 0; dy < 8; dy++) {
    for (let dx = 0; dx < 4; dx++) {
      pixels.push([10 + dx, 42 + dy, C.windowDark])
    }
  }

  return pixels
})()

// ── 3. 右塔楼 x:94-118 y:30-188 ──
const SHOP_TOWER_RIGHT = (() => {
  const pixels = []
  for (let y = 30; y <= 184; y++) {
    const baseColor = y < 38 ? C.towerSpire : C.tower
    const isBrickSeam = (y - 30) % 10 === 0
    const darkRow = (y - 30) % 10 === 9
    for (let x = 94; x <= 116; x++) {
      const lx = x - 94 // 局部 x (0-22)
      if (lx === 0 || lx === 22 || lx === 1 || lx === 21) {
        pixels.push([x, y, lx < 3 || lx > 19 ? C.towerDark : C.wallShadow])
      } else if (y >= 38 && isBrickSeam) {
        pixels.push([x, y, C.towerDark])
      } else if (y >= 38 && darkRow && (lx - 1) % 10 >= 8) {
        pixels.push([x, y, C.towerDark])
      } else {
        const isOddBrick = y >= 38 && (lx - 1) % 10 < 2
        pixels.push([x, y, isOddBrick ? C.towerLight : baseColor])
      }
    }
  }
  // 城垛
  for (let i = 0; i < 4; i++) {
    const cx = 95 + i * 5
    for (let dy = 0; dy < 8; dy++) {
      for (let dx = 0; dx < 4; dx++) {
        const color = dy < 2 ? C.roofLight : dy > 6 ? C.roofDark : C.roof
        pixels.push([cx + dx, 30 + dy, color])
      }
    }
    if (i < 3) {
      for (let dy = 0; dy < 6; dy++) {
        pixels.push([cx + 4, 31 + dy, C.sky])
      }
    }
  }
  for (let x = 94; x <= 116; x++) {
    pixels.push([x, 38, C.roofDark])
    pixels.push([x, 39, C.roofDark])
  }
  for (let dy = 0; dy < 8; dy++) {
    for (let dx = 0; dx < 4; dx++) {
      pixels.push([102 + dx, 42 + dy, C.windowDark])
    }
  }
  return pixels
})()

// ── 4. 主墙体 x:20-100 y:65-185 ──
const SHOP_MAIN_WALL = (() => {
  const pixels = []
  for (let y = 65; y <= 185; y++) {
    const isBrickSeam = (y - 65) % 10 === 0
    const darkRow = (y - 65) % 10 === 9
    const offset = Math.floor((y - 65) / 10) % 2 === 0 ? 0 : 5
    for (let x = 20; x <= 100; x++) {
      if (y >= 178) {
        // 墙底深色区域
        pixels.push([x, y, y >= 184 ? C.wallShadow : C.wallDark])
      } else if ((x === 20 || x === 100) && y < 178) {
        pixels.push([x, y, C.wallShadow])
      } else if (isBrickSeam && y < 178) {
        pixels.push([x, y, C.wallDark])
      } else if (darkRow && (x - 20 + offset) % 10 >= 8 && y < 178) {
        pixels.push([x, y, C.wallDark])
      } else {
        const isHighlight = (x - 20 + offset) % 10 < 2
        pixels.push([x, y, isHighlight ? C.wallLight : C.wall])
      }
    }
  }
  // 墙基石 (y:185)
  for (let x = 18; x <= 102; x++) {
    const color = x < 20 || x > 100 ? C.wallShadow : C.wallDark
    pixels.push([x, 185, color])
    pixels.push([x, 186, color])
  }
  return pixels
})()

// ── 5. 主屋顶（人字形三角形） ──
const SHOP_ROOF_MAIN = (() => {
  const pixels = []
  const apexX = 60, apexY = 18
  const leftBaseX = 20, rightBaseX = 100, baseY = 65

  for (let y = 18; y <= 65; y++) {
    // 计算该行的左边界和右边界（三角形内）
    const t = (y - apexY) / (baseY - apexY) // 0 at apex, 1 at base
    const leftX = Math.ceil(apexX + (leftBaseX - apexX) * t)
    const rightX = Math.floor(apexX + (rightBaseX - apexX) * t)

    for (let x = leftX; x <= rightX; x++) {
      if (y < 28) {
        // 屋顶顶部 - 亮色
        pixels.push([x, y, x > apexX ? C.roofLight : C.roof])
      } else if (y >= 60) {
        // 屋顶底部 - 深色
        pixels.push([x, y, C.roofDark])
      } else if (x > apexX + 20 && y > 35) {
        // 右上侧 - 稍暗（阴影面）
        pixels.push([x, y, C.roofDark])
      } else if (x > apexX + 10 && y > 45) {
        pixels.push([x, y, C.roofDark])
      } else {
        // 主要屋顶区域
        const isHighlight = y < 30 && Math.abs(x - apexX) < 5
        pixels.push([x, y, isHighlight ? C.roofLight : C.roof])
      }
    }
  }

  // 屋顶装饰条 (y:60-65)
  for (let x = 28; x <= 92; x++) {
    pixels.push([x, 60, x % 4 < 2 ? C.roofDark : C.roofEdge])
    pixels.push([x, 61, C.roofDark])
    pixels.push([x, 62, C.roofLight])
  }

  // 屋顶中心哥特尖顶装饰
  for (let dy = 0; dy < 6; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const dist = Math.abs(dx)
      if (dist <= dy && dy < 5) {
        pixels.push([apexX + dx, apexY - dy - 1, C.spikeLight])
      }
    }
  }
  pixels.push([apexX, apexY - 6, C.spikeLight])

  // 屋顶顶部球体
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (dx * dx + dy * dy <= 4) {
        pixels.push([apexX + dx, apexY - 1 + dy, C.spikeLight])
      }
    }
  }

  return pixels
})()

// ── 6. 城门 ──
const SHOP_DOOR = (() => {
  const pixels = []
  const doorCX = 60, doorCY = 145, doorR = 22, doorArchTop = 120

  // 门洞深色背景
  for (let y = doorArchTop; y <= 186; y++) {
    for (let x = 36; x <= 84; x++) {
      const dx = x - doorCX
      const dy = y - doorCY
      if (y <= doorCY) {
        // 拱形区域
        if (dx * dx + dy * dy <= doorR * doorR) {
          pixels.push([x, y, C.shadow])
        }
      } else if (x >= 40 && x <= 80) {
        // 矩形门下区域
        pixels.push([x, y, C.shadow])
      }
    }
  }

  // 门扇（两扇）
  for (let y = 130; y <= 184; y++) {
    for (let x = 40; x <= 80; x++) {
      if (y <= 145) {
        // 门上弧形部分
        const dx = x - doorCX, dy = y - doorCY
        if (dx * dx + dy * dy > (doorR - 5) * (doorR - 5)) continue
      }
      const isLeftDoor = x < 60
      const isSeam = x >= 58 && x <= 61
      const isPlank = Math.abs(x % 12) < 1 || Math.abs((x - 6) % 12) < 1

      if (isSeam) {
        pixels.push([x, y, C.doorDark])
      } else if (isPlank) {
        pixels.push([x, y, C.doorDark])
      } else {
        pixels.push([x, y, isLeftDoor ? C.door : C.doorLight])
      }
    }
  }

  // 铁质横带
  for (let y = 138; y <= 142; y++) {
    for (let x = 41; x <= 79; x++) {
      pixels.push([x, y, C.doorFrame])
    }
  }
  for (let y = 165; y <= 169; y++) {
    for (let x = 41; x <= 79; x++) {
      pixels.push([x, y, C.doorFrame])
    }
  }

  // 门钉（每扇 3排×2列）
  const studPositions = [
    [47, 135], [53, 135], [67, 135], [73, 135],
    [47, 152], [53, 152], [67, 152], [73, 152],
    [47, 172], [53, 172], [67, 172], [73, 172],
  ]
  for (const [sx, sy] of studPositions) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (dx * dx + dy * dy <= 4) {
          pixels.push([sx + dx, sy + dy, C.doorStud])
        }
      }
    }
  }

  // 门把手（环状）
  for (const handleX of [49, 71]) {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d >= 2 && d <= 3.5) {
          pixels.push([handleX + dx, 155 + dy, C.doorHinge])
        }
      }
    }
  }

  // 门框（拱形石框）
  for (let y = 105; y <= 186; y++) {
    for (const x of [38, 39, 81, 82]) {
      if (y <= 120) {
        const dx = x - doorCX, dy = y - doorCY
        if (dx * dx + dy * dy > (doorR + 4) * (doorR + 4)) continue
        if (dx * dx + dy * dy < (doorR - 3) * (doorR - 3)) continue
      }
      pixels.push([x, y, C.doorFrame])
    }
  }

  // 拱心石
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 4) {
        pixels.push([doorCX + dx, 100 + dy, C.doorLight])
      }
    }
  }

  return pixels
})()

// ── 7. 窗户 ──
const SHOP_WINDOWS = (() => {
  const pixels = []

  // 辅助：绘制哥特拱形窗
  const addGothicWindow = (cx, cy, w, h) => {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = -Math.floor(w / 2); dx <= Math.floor(w / 2); dx++) {
        const x = cx + dx, y = cy + dy
        if (dy < 3) {
          // 拱形顶部
          const archD = Math.sqrt(dx * dx + (dy - 3) * (dy - 3))
          if (archD > w / 2 + 1) continue
          if (archD > w / 2 - 1 && archD <= w / 2 + 1) {
            pixels.push([x, y, C.windowFrame]) // 边框
          } else if (archD <= w / 2) {
            pixels.push([x, y, C.windowGlow]) // 发光玻璃
          }
        } else {
          if (Math.abs(dx) >= Math.floor(w / 2) - 1) {
            pixels.push([x, y, C.windowFrame]) // 侧边框
          } else if (dx === 0 && dy % 3 === 1) {
            pixels.push([x, y, C.windowFrame]) // 窗棂
          } else if (dy % 6 === 0 && Math.abs(dx) < Math.floor(w / 2) - 1) {
            pixels.push([x, y, C.windowFrame]) // 横梁
          } else {
            pixels.push([x, y, C.windowGlow])
          }
        }
      }
    }
    // 底部边框
    for (let dx = -Math.floor(w / 2); dx <= Math.floor(w / 2); dx++) {
      pixels.push([cx + dx, cy + h, C.windowFrame])
    }
  }

  // ── 左塔窗 ──
  addGothicWindow(13, 50, 8, 14)

  // ── 右塔窗 ──
  addGothicWindow(105, 50, 8, 14)

  // ── 主墙二楼左窗 ──
  addGothicWindow(36, 88, 10, 16)

  // ── 主墙二楼右窗 ──
  addGothicWindow(84, 88, 10, 16)

  // ── 塔楼高处箭窗（窄缝） ──
  for (let dy = 0; dy < 10; dy++) {
    pixels.push([12, 75 + dy, dy === 0 || dy === 9 ? C.windowFrame : C.windowGlowDim])
    pixels.push([13, 75 + dy, dy === 0 || dy === 9 ? C.windowFrame : C.windowGlowDim])
    pixels.push([105, 75 + dy, dy === 0 || dy === 9 ? C.windowFrame : C.windowGlowDim])
    pixels.push([106, 75 + dy, dy === 0 || dy === 9 ? C.windowFrame : C.windowGlowDim])
  }

  return pixels
})()

// ── 8. 烟囱 ──
const SHOP_CHIMNEY = (() => {
  const pixels = []
  // 烟囱主体 (x:75-85, y:22-58)
  for (let y = 22; y <= 58; y++) {
    for (let x = 75; x <= 85; x++) {
      if (x === 75 || x === 85) {
        pixels.push([x, y, C.chimneyDark])
      } else if (y <= 26) {
        pixels.push([x, y, C.chimneyDark])
      } else if (y === 27 || y === 36 || y === 45 || y === 54) {
        pixels.push([x, y, C.chimneyDark])
      } else {
        pixels.push([x, y, C.chimney])
      }
    }
  }
  // 烟囱帽
  for (let y = 19; y <= 22; y++) {
    for (let x = 73; x <= 87; x++) {
      pixels.push([x, y, y < 21 ? C.chimneyDark : C.chimney])
    }
  }
  return pixels
})()

// ── 9. 地面 ──
const SHOP_GROUND = (() => {
  const pixels = []
  for (let y = 187; y <= 199; y++) {
    for (let x = 0; x < 120; x++) {
      if (y < 190) {
        pixels.push([x, y, C.ground])
      } else if (y < 194) {
        pixels.push([x, y, y % 2 === 0 ? C.groundDark : C.ground])
      } else if (y < 197) {
        pixels.push([x, y, y % 2 === 0 ? C.ground : C.groundLight])
      } else {
        pixels.push([x, y, C.groundHighlight])
      }
    }
  }
  // 草地纹理点 (随机感的亮点)
  for (let i = 0; i < 60; i++) {
    const gx = (i * 17 + 13) % 120
    const gy = 188 + (i % 5)
    pixels.push([gx, gy, C.groundHighlight])
  }
  return pixels
})()

// ── 10. 台阶 ──
const SHOP_STEPS = (() => {
  const pixels = []
  // 台阶 (y:183-186, 门下方)
  const stepColors = [C.wallLight, C.wallHighlight, C.wallLight, C.wallDark]
  for (let step = 0; step < 4; step++) {
    const sy = 183 + step
    const startX = 37 - step * 2
    const endX = 83 + step * 2
    for (let x = startX; x <= endX; x++) {
      pixels.push([x, sy, stepColors[step]])
    }
    // 台阶侧边
    if (step > 0) {
      for (let dx = 0; dx < 2; dx++) {
        pixels.push([startX - 1 - dx, sy, C.wallShadow])
        pixels.push([endX + 1 + dx, sy, C.wallShadow])
      }
    }
  }
  return pixels
})()

// ── 11. 装饰细节 ──
const SHOP_DECOR = (() => {
  const pixels = []

  // 招牌背景 (x:26-94, y:104-114)
  for (let y = 104; y <= 114; y++) {
    for (let x = 26; x <= 94; x++) {
      if (x === 26 || x === 94 || y === 104 || y === 114) {
        pixels.push([x, y, C.signBorder])
      } else {
        pixels.push([x, y, C.sign])
      }
    }
  }
  // 招牌文字 "SHOP" (像素风格)
  // S
  for (const [dx, dy] of [[0,0],[1,0],[2,0],[0,1],[0,2],[1,2],[2,2],[2,3],[2,4],[0,4],[1,4]]) {
    pixels.push([34 + dx, 107 + dy, C.signText])
  }
  // H
  for (const [dx, dy] of [[0,0],[0,1],[0,2],[1,2],[2,0],[2,1],[2,2],[2,3],[2,4],[0,3],[0,4]]) {
    pixels.push([40 + dx, 107 + dy, C.signText])
  }
  // O
  for (const [dx, dy] of [[1,0],[0,1],[2,1],[0,2],[2,2],[0,3],[2,3],[1,4]]) {
    pixels.push([45 + dx, 107 + dy, C.signText])
  }
  // P
  for (const [dx, dy] of [[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[0,3],[0,4]]) {
    pixels.push([50 + dx, 107 + dy, C.signText])
  }

  // 招牌挂链 (x:35, x:85)
  for (let y = 96; y <= 104; y++) {
    pixels.push([35, y, y % 2 === 0 ? C.signChain : C.wallShadow])
    pixels.push([85, y, y % 2 === 0 ? C.signChain : C.wallShadow])
  }

  // 墙体裂缝（哥特风格）
  const cracks = [
    // 左墙裂缝
    [25, 130], [26, 131], [26, 132], [27, 133], [28, 134], [29, 135],
    [28, 136], [28, 137], [29, 138], [30, 139], [31, 140],
    // 右墙裂缝
    [92, 120], [91, 121], [91, 122], [90, 123], [89, 124], [88, 125],
    [87, 126], [86, 127], [85, 128],
  ]
  for (const [cx, cy] of cracks) {
    pixels.push([cx, cy, C.wallDark])
  }

  // 墙体上的十字架/哥特符号装饰
  const addCrossSymbol = (cx, cy) => {
    for (const [dx, dy] of [[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],[-2,0],[-1,0],[1,0],[2,0]]) {
      pixels.push([cx + dx, cy + dy, C.wallHighlight])
    }
  }
  addCrossSymbol(30, 160)
  addCrossSymbol(90, 160)

  return pixels
})()

// ── 合并所有静态像素 ──
const SHOP_STATIC_PIXELS = [
  ...SHOP_SKY_AND_SPIRES,
  ...SHOP_TOWER_LEFT,
  ...SHOP_TOWER_RIGHT,
  ...SHOP_MAIN_WALL,
  ...SHOP_ROOF_MAIN,
  ...SHOP_DOOR,
  ...SHOP_WINDOWS,
  ...SHOP_CHIMNEY,
  ...SHOP_GROUND,
  ...SHOP_STEPS,
  ...SHOP_DECOR,
]

// ==============================
//  drawShop 绘制函数
// ==============================

/**
 * @description 绘制商店城堡（暗黑哥特风）
 * @param {CanvasRenderingContext2D} ctx canvas上下文
 * @param {Object} config
 * @param {Number} config.x 商店建筑左上角 x 坐标
 * @param {Number} config.y 商店建筑左上角 y 坐标
 * @param {Number} config.width 商店建筑实际宽（宽高比 120:200）
 * @param {Number} config.height 商店建筑实际高
 * @param {Number} config.frame 当前帧数
 */
export const drawShop = (ctx, config) => {
  const { x, y, width = 120, height = 200, frame = 0 } = config
  ctx.imageSmoothingEnabled = false

  // 计算缩放单位：保持 120:200 宽高比
  const u = width / 120

  // ========== 天空背景填充 ==========
  ctx.fillStyle = C.sky
  ctx.fillRect(x, y, width, height)

  // ========== 渲染所有静态像素 ==========
  for (let i = 0; i < SHOP_STATIC_PIXELS.length; i++) {
    const [px, py, color] = SHOP_STATIC_PIXELS[i]
    drawPixel({ px, py, color, ctx, x, y, unit: u })
  }

  // ========== 动画参数（基于 frame） ==========
  const anim = {
    flagWave: Math.sin(frame * 1.5) * 0.06,
    windowPulse1: 0.5 + 0.5 * Math.sin(frame * 2.0),
    windowPulse2: 0.5 + 0.5 * Math.sin(frame * 2.0 + 1.5),
    fireFlicker1: 0.7 + 0.3 * Math.sin(frame * 4.0),
    fireFlicker2: 0.7 + 0.3 * Math.sin(frame * 4.0 + 2.0),
    runePulse1: 0.4 + 0.6 * Math.sin(frame * 1.8),
    runePulse2: 0.4 + 0.6 * Math.sin(frame * 1.8 + Math.PI),
    coinBob1: Math.sin(frame * 2.5) * 3,
    coinBob2: Math.sin(frame * 2.5 + 1.2) * 3,
    coinBob3: Math.sin(frame * 2.5 + 2.4) * 3,
    smokeOffset: Math.sin(frame * 3.0) * 2,
    chimneyCycle: (frame * 0.8) % 15,
    signBob: Math.sin(frame * 1.2) * 0.5,
  }

  // ========== 动画叠加渲染 ==========
  drawAnimatedWindows(ctx, x, y, u, anim)
  drawAnimatedFlags(ctx, x, y, u, anim)
  drawAnimatedTorches(ctx, x, y, u, anim, frame)
  drawAnimatedRunes(ctx, x, y, u, anim)
  drawAnimatedCoins(ctx, x, y, u, anim, frame)
  drawAnimatedSmoke(ctx, x, y, u, anim, frame)
  drawAnimatedParticles(ctx, x, y, u, anim, frame)
}

// ==============================
//  动画辅助函数
// ==============================

/** 窗户发光脉动 */
const drawAnimatedWindows = (ctx, bx, by, u, anim) => {
  const windows = [
    { cx: 13, cy: 57, pulse: anim.windowPulse1 },
    { cx: 105, cy: 57, pulse: anim.windowPulse2 },
    { cx: 36, cy: 96, pulse: anim.windowPulse2 },
    { cx: 84, cy: 96, pulse: anim.windowPulse1 },
    { cx: 12, cy: 80, pulse: anim.windowPulse1 * 0.3 },
    { cx: 105, cy: 80, pulse: anim.windowPulse2 * 0.3 },
  ]

  for (const { cx, cy, pulse } of windows) {
    // 窗户发光叠加层
    const glowAlpha = 0.15 * pulse
    if (glowAlpha > 0.01) {
      const grad = ctx.createRadialGradient(
        bx + cx * u, by + cy * u, 2 * u,
        bx + cx * u, by + cy * u, 10 * u
      )
      grad.addColorStop(0, `rgba(153, 51, 85, ${glowAlpha * 2})`)
      grad.addColorStop(0.5, `rgba(102, 26, 51, ${glowAlpha})`)
      grad.addColorStop(1, 'rgba(102, 26, 51, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(
        bx + (cx - 8) * u, by + (cy - 8) * u,
        16 * u, 16 * u
      )
    }
  }
}

/** 旗帜飘动动画 */
const drawAnimatedFlags = (ctx, bx, by, u, anim) => {
  const flagConfigs = [
    { poleX: 13, y: 16, dir: 1, baseColor: C.flag, darkColor: C.flagDark, lightColor: C.flagLight },
    { poleX: 107, y: 16, dir: -1, baseColor: C.flagDark, darkColor: C.flagDark, lightColor: C.flag },
  ]

  for (const { poleX, y: fy, dir, baseColor, lightColor } of flagConfigs) {
    ctx.save()
    ctx.fillStyle = baseColor
    const fx = bx + poleX * u
    const ffy = by + fy * u
    const w = 14 * u * dir

    ctx.beginPath()
    ctx.moveTo(fx, ffy)
    ctx.quadraticCurveTo(
      fx + w * 0.3, ffy + (5 + anim.flagWave * 20) * u,
      fx + w, ffy + (2 + anim.flagWave * 15) * u
    )
    ctx.lineTo(fx + w, ffy + (10 + anim.flagWave * 15) * u)
    ctx.quadraticCurveTo(
      fx + w * 0.3, ffy + (13 + anim.flagWave * 20) * u,
      fx, ffy + 8 * u
    )
    ctx.closePath()
    ctx.fill()

    // 旗帜条纹
    ctx.strokeStyle = lightColor
    ctx.lineWidth = 0.6 * u
    ctx.beginPath()
    ctx.moveTo(fx + 1 * u * dir, ffy + 3 * u)
    ctx.quadraticCurveTo(
      fx + w * 0.3, ffy + (8 + anim.flagWave * 20) * u,
      fx + w * 0.9, ffy + (5 + anim.flagWave * 15) * u
    )
    ctx.stroke()
    ctx.restore()
  }
}

/** 火炬火焰动画 */
const drawAnimatedTorches = (ctx, bx, by, u, anim, frame) => {
  const torchPositions = [
    { px: 36, py: 118, flicker: anim.fireFlicker1 },
    { px: 78, py: 118, flicker: anim.fireFlicker2 },
  ]

  for (const { px: tpx, py: tpy, flicker } of torchPositions) {
    const tx = bx + tpx * u
    const ty = by + tpy * u

    // 火炬支架
    ctx.fillStyle = C.torchBracket
    ctx.fillRect(tx + 1 * u, ty + 2 * u, 3 * u, 8 * u)
    ctx.fillRect(tx, ty - 2 * u, 5 * u, 6 * u)

    // 火焰外光晕
    const outerGrad = ctx.createRadialGradient(
      tx + 2.5 * u, ty - 4 * u, 0,
      tx + 2.5 * u, ty - 4 * u, 8 * u
    )
    outerGrad.addColorStop(0, `rgba(153, 68, 221, ${0.35 * flicker})`)
    outerGrad.addColorStop(0.5, `rgba(119, 51, 170, ${0.2 * flicker})`)
    outerGrad.addColorStop(1, 'rgba(68, 17, 102, 0)')
    ctx.fillStyle = outerGrad
    ctx.beginPath()
    ctx.arc(tx + 2.5 * u, ty - 4 * u, 8 * u, 0, Math.PI * 2)
    ctx.fill()

    // 火焰中层
    const midGrad = ctx.createRadialGradient(
      tx + 2.5 * u, ty - 4 * u, 0,
      tx + 2.5 * u, ty - 4 * u, 5 * u
    )
    midGrad.addColorStop(0, `rgba(221, 170, 255, ${0.7 * flicker})`)
    midGrad.addColorStop(0.4, `rgba(170, 85, 238, ${0.5 * flicker})`)
    midGrad.addColorStop(1, 'rgba(68, 17, 102, 0)')
    ctx.fillStyle = midGrad
    ctx.beginPath()
    ctx.arc(tx + 2.5 * u, ty - 4 * u, 5 * u, 0, Math.PI * 2)
    ctx.fill()

    // 火焰内核
    const innerGrad = ctx.createRadialGradient(
      tx + 2.5 * u, ty - 4 * u, 0,
      tx + 2.5 * u, ty - 4 * u, 2.5 * u
    )
    innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
    innerGrad.addColorStop(0.4, `rgba(221, 170, 255, ${0.8 * flicker})`)
    innerGrad.addColorStop(1, 'rgba(119, 51, 170, 0)')
    ctx.fillStyle = innerGrad
    ctx.beginPath()
    ctx.ellipse(
      tx + 2.5 * u, ty - 4 * u - anim.smokeOffset * u * 0.5,
      1.2 * u, 2.5 * u * flicker, 0, 0, Math.PI * 2
    )
    ctx.fill()

    // 火花粒子
    for (let i = 0; i < 4; i++) {
      const sparkAlpha = 0.4 + 0.5 * Math.sin(frame * 8 + i * 2.5) * flicker
      const sx = tx + (1.5 + i * 1.2) * u + Math.sin(frame * 6 + i) * u
      const sy = ty - (6 + i * 2) * u - anim.smokeOffset * u * 0.3
      ctx.fillStyle = `rgba(221, 170, 255, ${sparkAlpha})`
      ctx.beginPath()
      ctx.arc(sx, sy, 0.5 * u, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

/** 魔法符文脉动动画 */
const drawAnimatedRunes = (ctx, bx, by, u, anim) => {
  const runePositions = [
    { px: 28, py: 140, pulse: anim.runePulse1 },
    { px: 28, py: 160, pulse: anim.runePulse2 },
    { px: 92, py: 140, pulse: anim.runePulse2 },
    { px: 92, py: 160, pulse: anim.runePulse1 },
  ]

  for (const { px, py, pulse } of runePositions) {
    const rx = bx + px * u
    const ry = by + py * u
    const s = 3 * u

    // 外圈光晕
    ctx.fillStyle = `rgba(136, 85, 204, ${0.12 * pulse})`
    ctx.beginPath()
    ctx.arc(rx, ry, s * 2, 0, Math.PI * 2)
    ctx.fill()

    // 外圈
    ctx.strokeStyle = `rgba(136, 85, 204, ${0.45 * pulse})`
    ctx.lineWidth = 0.7 * u
    ctx.beginPath()
    ctx.arc(rx, ry, s * 1.2, 0, Math.PI * 2)
    ctx.stroke()

    // 内圈
    ctx.strokeStyle = `rgba(170, 119, 238, ${0.6 * pulse})`
    ctx.lineWidth = 0.5 * u
    ctx.beginPath()
    ctx.arc(rx, ry, s * 0.7, 0, Math.PI * 2)
    ctx.stroke()

    // 菱形符文
    ctx.strokeStyle = `rgba(170, 119, 238, ${0.65 * pulse})`
    ctx.lineWidth = 0.5 * u
    ctx.beginPath()
    ctx.moveTo(rx, ry - s * 0.7)
    ctx.lineTo(rx + s * 0.5, ry)
    ctx.lineTo(rx, ry + s * 0.7)
    ctx.lineTo(rx - s * 0.5, ry)
    ctx.closePath()
    ctx.stroke()

    // 中心光点
    ctx.fillStyle = `rgba(221, 187, 255, ${0.7 * pulse})`
    ctx.beginPath()
    ctx.arc(rx, ry, s * 0.25, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** 浮动金币动画 */
const drawAnimatedCoins = (ctx, bx, by, u, anim, frame) => {
  const coinDefs = [
    { px: 30, py: 138 - anim.coinBob1 },
    { px: 34, py: 153 - anim.coinBob2 },
    { px: 55, py: 128 - anim.coinBob3 },
    { px: 82, py: 140 - anim.coinBob2 },
    { px: 86, py: 156 - anim.coinBob1 },
  ]

  for (let i = 0; i < coinDefs.length; i++) {
    const { px, py } = coinDefs[i]
    const cx = bx + px * u
    const cy = by + py * u
    const r = 1.8 * u
    const alpha = 0.5 + 0.4 * Math.sin(frame * 3.0 + i)

    ctx.globalAlpha = alpha
    ctx.fillStyle = i % 3 === 0 ? C.coin : i % 3 === 1 ? C.coinLight : C.coinDark
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    // 高光
    ctx.fillStyle = C.coinLight
    ctx.beginPath()
    ctx.arc(cx - 0.3 * u, cy - 0.3 * u, r * 0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

/** 烟囱烟雾动画 */
const drawAnimatedSmoke = (ctx, bx, by, u, anim, frame) => {
  const chimneyX = 80, chimneyY = 18

  for (let s = 0; s < 5; s++) {
    const smokeFrame = (anim.chimneyCycle + s * 3) % 15
    if (smokeFrame < 12) {
      const alpha = (1 - smokeFrame / 12) * 0.3
      const sx = chimneyX + Math.sin(frame * 1.2 + s * 1.5) * 5
      const sy = chimneyY - smokeFrame * 1.5
      const size = (2 + smokeFrame * 0.8) * u

      ctx.fillStyle = `rgba(40, 40, 50, ${alpha})`
      ctx.beginPath()
      ctx.arc(bx + sx * u, by + sy * u, size, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `rgba(50, 50, 60, ${alpha * 0.5})`
      ctx.beginPath()
      ctx.arc(bx + (sx + 2) * u, by + (sy - 1) * u, size * 0.7, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

/** 顶部魔法粒子飘浮 */
const drawAnimatedParticles = (ctx, bx, by, u, _unused, frame) => {
  for (let i = 0; i < 10; i++) {
    const alpha = 0.2 + 0.25 * Math.sin(frame * 2.5 + i * 0.8)
    const px = 10 + (i * 11) + Math.sin(frame * 1.5 + i) * 6
    const py = 5 + Math.cos(frame * 2.0 + i * 1.2) * 5

    // 光点
    ctx.fillStyle = `rgba(170, 119, 238, ${alpha})`
    ctx.beginPath()
    ctx.arc(bx + px * u, by + py * u, 1.5 * u, 0, Math.PI * 2)
    ctx.fill()

    // 十字光芒
    ctx.strokeStyle = `rgba(187, 153, 238, ${alpha * 0.4})`
    ctx.lineWidth = 0.3 * u
    ctx.beginPath()
    ctx.moveTo(bx + (px - 2.5) * u, by + py * u)
    ctx.lineTo(bx + (px + 2.5) * u, by + py * u)
    ctx.moveTo(bx + px * u, by + (py - 2.5) * u)
    ctx.lineTo(bx + px * u, by + (py + 2.5) * u)
    ctx.stroke()
  }
}
