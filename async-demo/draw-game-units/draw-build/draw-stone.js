import { drawPixel } from '../draw-utils.js'

export const config = {
  ASPECT_RATIO: 150 / 150,
}

const C = {
  bg: 'transparent',

  gemCore: '#880022',
  gemDark: '#440011',
  gemLight: '#CC1144',
  gemHighlight: '#FF3377',
  gemShadow: '#220008',
  gemEdge: '#AA1144',

  gemGlowInner: '#FF6699',
  gemGlowOuter: '#FF2266',

  runeGold: '#DDAA33',
  runeGoldBright: '#FFDD66',
  runeGoldDark: '#886600',
  runeCyan: '#22CCAA',
  runeCyanBright: '#66FFDD',
  runeCyanDark: '#116644',

  auraPink: '#FF4488',
  auraPurple: '#9944DD',
  auraCyan: '#44DDCC',
  auraGold: '#FFCC44',

  baseDark: '#1A1410',
  base: '#2A2018',
  baseLight: '#3A2A20',
  baseHighlight: '#4A3828',
  baseShadow: '#0E0A08',

  trailGold: '#FFCC66',
  trailCyan: '#66FFCC',
  trailPink: '#FF88AA',
  trailPurple: '#BB77EE',
}


const STONE_GEM = (() => {
  const pixels = []
  const cx = 75, cy = 82
  const gemW = 30, gemH = 48

  for (let y = cy - gemH; y <= cy + gemH; y++) {
    for (let x = cx - gemW; x <= cx + gemW; x++) {
      const dx = Math.abs(x - cx)
      const dy = Math.abs(y - cy)
      const diamondDist = dx / gemW + dy / gemH
      if (diamondDist > 1.05) continue

      if (diamondDist > 0.95) {
        pixels.push([x, y, y < cy ? C.gemEdge : C.gemShadow])
      } else if (diamondDist > 0.7) {
        const isLight = (x + y) % 4 < 2
        pixels.push([x, y, isLight ? C.gemLight : C.gemCore])
      } else if (diamondDist > 0.35) {
        const isHighlight = (x - y) % 6 < 3
        pixels.push([x, y, isHighlight ? C.gemHighlight : C.gemLight])
      } else {
        pixels.push([x, y, C.gemHighlight])
      }
    }
  }

  for (let y = cy - gemH + 5; y <= cy + gemH - 5; y += 6) {
    const dy = Math.abs(y - cy)
    const maxDx = Math.floor(gemW * (1 - dy / gemH))
    for (let x = cx - maxDx + 2; x <= cx + maxDx - 2; x++) {
      const diamondDist = Math.abs(x - cx) / gemW + Math.abs(y - cy) / gemH
      if (diamondDist < 0.9 && (x + y) % 8 === 0) {
        pixels.push([x, y, C.gemGlowInner])
      }
    }
  }

  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (dx * dx + dy * dy <= 3) {
        pixels.push([cx + dx, cy + dy, '#FFFFFF'])
      }
    }
  }
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const d = dx * dx + dy * dy
      if (d > 3 && d <= 7) {
        pixels.push([cx + dx, cy + dy, C.gemGlowInner])
      }
    }
  }

  return pixels
})()

const STONE_FRAME = (() => {
  const pixels = []
  const cx = 75, cy = 82

  for (let angle = 0; angle < 360; angle += 2) {
    const rad = (angle * Math.PI) / 180
    const r = 38 / (Math.abs(Math.cos(rad)) + Math.abs(Math.sin(rad)))
    const x = Math.round(cx + Math.cos(rad) * r)
    const y = Math.round(cy + Math.sin(rad) * r)
    if (x >= 30 && x <= 120 && y >= 30 && y <= 135) {
      pixels.push([x, y, angle % 8 < 4 ? C.runeGold : C.runeGoldDark])
    }
  }

  const corners = [
    [cx, cy - 42],
    [cx, cy + 42],
    [cx - 42, cy],
    [cx + 42, cy],
  ]
  for (const [fx, fy] of corners) {
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (Math.abs(dx) + Math.abs(dy) <= 3) {
          pixels.push([fx + dx, fy + dy, C.runeGoldBright])
        }
      }
    }
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        if (Math.abs(dx) + Math.abs(dy) === 4) {
          pixels.push([fx + dx, fy + dy, C.runeGoldDark])
        }
      }
    }
  }

  return pixels
})()

const STONE_CROWN = (() => {
  const pixels = []
  const apexX = 75, apexY = 18
  const baseLeft = 60, baseRight = 90, baseY = 38

  for (let y = apexY; y <= baseY; y++) {
    const t = (y - apexY) / (baseY - apexY)
    const leftX = Math.ceil(apexX + (baseLeft - apexX) * t)
    const rightX = Math.floor(apexX + (baseRight - apexX) * t)
    for (let x = leftX; x <= rightX; x++) {
      if (y < apexY + 5) {
        pixels.push([x, y, C.runeGoldBright])
      } else if (x === leftX || x === rightX) {
        pixels.push([x, y, C.runeGoldDark])
      } else {
        pixels.push([x, y, (x + y) % 4 < 2 ? C.runeGold : C.runeGoldDark])
      }
    }
  }

  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const d = dx * dx + dy * dy
      if (d <= 4) {
        pixels.push([apexX + dx, apexY - 3 + dy, C.gemHighlight])
      } else if (d <= 8) {
        pixels.push([apexX + dx, apexY - 3 + dy, C.gemLight])
      }
    }
  }
  pixels.push([apexX - 1, apexY - 5, '#FFFFFF'])
  pixels.push([apexX, apexY - 5, '#FFFFFF'])

  return pixels
})()

const STONE_SHARDS = [
  [58, 60, C.gemLight], [59, 60, C.gemHighlight], [58, 61, C.gemCore],
  [90, 55, C.gemHighlight], [91, 55, C.gemLight], [90, 56, C.gemCore],
  [55, 100, C.gemLight], [56, 100, C.gemCore], [55, 101, C.gemCore],
  [95, 95, C.gemHighlight], [94, 95, C.gemLight], [95, 96, C.gemCore],
  [68, 40, C.gemLight], [82, 42, C.gemLight],
  [70, 120, C.gemLight], [80, 118, C.gemHighlight],
]

const STONE_STATIC_PIXELS = [
  ...STONE_GEM,
  ...STONE_FRAME,
  ...STONE_CROWN,
  ...STONE_SHARDS,
]


/**
 * @description 绘制贤者之石
 * @param {CanvasRenderingContext2D} ctx canvas上下文
 * @param {Object} config
 * @param {Number} config.x 贤者之石左上角 x 坐标
 * @param {Number} config.y 贤者之石左上角 y 坐标
 * @param {Number} config.width 贤者之石实际宽（宽高比 150:150）
 * @param {Number} config.height 贤者之石实际高
 * @param {Number} config.frame 当前帧数
 */
export const drawSKillStone = (ctx, config) => {
  const { x, y, width = 150, height = 150, frame = 0 } = config
  ctx.imageSmoothingEnabled = false

  const u = width / 150

  ctx.fillStyle = C.bg
  ctx.fillRect(x, y, width, height)

  for (let i = 0; i < STONE_STATIC_PIXELS.length; i++) {
    const [px, py, color] = STONE_STATIC_PIXELS[i]
    drawPixel({ px, py, color, ctx, x, y, unit: u })
  }

  const anim = {
    gemPulse: 0.85 + 0.15 * Math.sin(frame * 1.6),
    gemPulse2: 0.8 + 0.2 * Math.sin(frame * 1.6 + Math.PI / 2),

    runeRise1: (frame * 0.6) % 100,
    runeRise2: (frame * 0.6 + 33) % 100,
    runeRise3: (frame * 0.6 + 66) % 100,
    runeRise4: (frame * 0.7 + 25) % 100,

    orbitRotation: frame * 0.5,
    orbitRotation2: -frame * 0.35,

    auraPulse1: 0.4 + 0.6 * Math.sin(frame * 1.4),
    auraPulse2: 0.4 + 0.6 * Math.sin(frame * 1.4 + Math.PI * 0.7),
    auraPulse3: 0.5 + 0.5 * Math.sin(frame * 1.8 + Math.PI * 0.4),

    particlePhase: frame * 2.0,

    crownOrbit: frame * 0.8,
  }

  drawAuraGlow(ctx, x, y, u, anim)
  drawOrbitingRunes(ctx, x, y, u, anim)
  drawRisingRunes(ctx, x, y, u, anim)
  drawGemPulse(ctx, x, y, u, anim)
  drawFloatingParticles(ctx, x, y, u, anim, frame)
  drawCrownGlow(ctx, x, y, u, anim)
}


const drawGemPulse = (ctx, bx, by, u, anim) => {
  const cx = 75, cy = 82

  const pulseR1 = 28 + Math.sin(anim.gemPulse * 3) * 4
  const outerGrad = ctx.createRadialGradient(
    bx + cx * u, by + cy * u, pulseR1 * u * 0.5,
    bx + cx * u, by + cy * u, pulseR1 * u
  )
  outerGrad.addColorStop(0, `rgba(255, 68, 136, ${0.25 * anim.auraPulse1})`)
  outerGrad.addColorStop(0.5, `rgba(153, 68, 221, ${0.15 * anim.auraPulse2})`)
  outerGrad.addColorStop(1, 'rgba(68, 221, 204, 0)')
  ctx.fillStyle = outerGrad
  ctx.beginPath()
  ctx.arc(bx + cx * u, by + cy * u, pulseR1 * u, 0, Math.PI * 2)
  ctx.fill()

  const innerR = 12 + Math.sin(anim.gemPulse2 * 4) * 3
  const innerGrad = ctx.createRadialGradient(
    bx + cx * u, by + cy * u, 0,
    bx + cx * u, by + cy * u, innerR * u
  )
  innerGrad.addColorStop(0, `rgba(255, 255, 255, ${0.35 * anim.auraPulse3})`)
  innerGrad.addColorStop(0.4, `rgba(255, 102, 153, ${0.3 * anim.auraPulse1})`)
  innerGrad.addColorStop(1, 'rgba(255, 34, 102, 0)')
  ctx.fillStyle = innerGrad
  ctx.beginPath()
  ctx.arc(bx + cx * u, by + cy * u, innerR * u, 0, Math.PI * 2)
  ctx.fill()
}

const drawAuraGlow = (ctx, bx, by, u, anim) => {
  const cx = 75, cy = 82

  ctx.strokeStyle = `rgba(255, 68, 136, ${0.3 * anim.auraPulse1})`
  ctx.lineWidth = 1.5 * u
  ctx.beginPath()
  ctx.arc(bx + cx * u, by + cy * u, 46 * u, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = `rgba(153, 68, 221, ${0.25 * anim.auraPulse2})`
  ctx.lineWidth = 1.2 * u
  ctx.setLineDash([8 * u, 4 * u])
  ctx.lineDashOffset = anim.orbitRotation * 20 * u
  ctx.beginPath()
  ctx.arc(bx + cx * u, by + cy * u, 50 * u, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.strokeStyle = `rgba(68, 221, 204, ${0.2 * anim.auraPulse3})`
  ctx.lineWidth = 1 * u
  ctx.setLineDash([5 * u, 5 * u])
  ctx.lineDashOffset = anim.orbitRotation2 * 15 * u
  ctx.beginPath()
  ctx.arc(bx + cx * u, by + cy * u, 43 * u, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
}

const drawOrbitingRunes = (ctx, bx, by, u, anim) => {
  const cx = 75, cy = 82
  const orbitR = 36

  const runeGlyphs = [
    (offX, offY) => {
      ctx.beginPath()
      ctx.moveTo(offX, offY - 3.5 * u)
      ctx.lineTo(offX + 3 * u, offY + 2.5 * u)
      ctx.lineTo(offX - 3 * u, offY + 2.5 * u)
      ctx.closePath()
      ctx.stroke()
    },
    (offX, offY) => {
      ctx.beginPath()
      ctx.moveTo(offX - 3 * u, offY)
      ctx.lineTo(offX + 3 * u, offY)
      ctx.moveTo(offX, offY - 3 * u)
      ctx.lineTo(offX, offY + 3 * u)
      ctx.stroke()
    },
    (offX, offY) => {
      ctx.beginPath()
      ctx.moveTo(offX, offY - 3 * u)
      ctx.lineTo(offX + 2.5 * u, offY)
      ctx.lineTo(offX, offY + 3 * u)
      ctx.lineTo(offX - 2.5 * u, offY)
      ctx.closePath()
      ctx.stroke()
    },
    (offX, offY) => {
      ctx.beginPath()
      ctx.moveTo(offX - 2.5 * u, offY - 2.5 * u)
      ctx.lineTo(offX + 2.5 * u, offY + 2.5 * u)
      ctx.moveTo(offX + 2.5 * u, offY - 2.5 * u)
      ctx.lineTo(offX - 2.5 * u, offY + 2.5 * u)
      ctx.stroke()
    },
  ]

  for (let i = 0; i < 4; i++) {
    const angle = ((i * 90) * Math.PI) / 180 + anim.orbitRotation
    const rx = bx + (cx + Math.cos(angle) * orbitR) * u
    const ry = by + (cy + Math.sin(angle) * orbitR) * u

    const glowAlpha = 0.15 * anim.auraPulse1
    ctx.fillStyle = `rgba(255, 204, 68, ${glowAlpha})`
    ctx.beginPath()
    ctx.arc(rx, ry, 6 * u, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = `rgba(255, 221, 102, ${0.7 * anim.auraPulse2})`
    ctx.lineWidth = 1.2 * u
    runeGlyphs[i](rx, ry)

    ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * anim.auraPulse1})`
    ctx.beginPath()
    ctx.arc(rx, ry, 1.2 * u, 0, Math.PI * 2)
    ctx.fill()
  }

  const outerR = 52
  for (let i = 0; i < 8; i++) {
    const angle = ((i * 45) * Math.PI) / 180 + anim.orbitRotation2
    const rx = bx + (cx + Math.cos(angle) * outerR) * u
    const ry = by + (cy + Math.sin(angle) * outerR) * u

    const dotAlpha = 0.3 + 0.3 * Math.sin(anim.auraPulse1 * 3 + i)
    ctx.fillStyle = `rgba(68, 221, 204, ${dotAlpha})`
    ctx.beginPath()
    ctx.arc(rx, ry, 1.5 * u, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = `rgba(102, 255, 221, ${dotAlpha * 0.5})`
    ctx.lineWidth = 0.4 * u
    ctx.beginPath()
    ctx.moveTo(rx - 2 * u, ry)
    ctx.lineTo(rx + 2 * u, ry)
    ctx.moveTo(rx, ry - 2 * u)
    ctx.lineTo(rx, ry + 2 * u)
    ctx.stroke()
  }
}

const drawRisingRunes = (ctx, bx, by, u, anim) => {
  const cx = 75, cy = 82

  const runeStreams = [
    { rise: anim.runeRise1, offsetX: -8, color: C.runeGoldBright, glow: C.auraGold },
    { rise: anim.runeRise2, offsetX: 6, color: C.runeCyanBright, glow: C.auraCyan },
    { rise: anim.runeRise3, offsetX: -3, color: C.auraPink, glow: C.auraPink },
    { rise: anim.runeRise4, offsetX: 2, color: C.runeGoldBright, glow: C.auraPurple },
  ]

  for (const stream of runeStreams) {
    const progress = stream.rise / 100
    const baseY = cy - 28
    const runeY = baseY - progress * 70
    const runeX = cx + stream.offsetX + Math.sin(progress * Math.PI * 3) * 10

    const alpha = progress < 0.15
      ? progress / 0.15
      : progress > 0.85
        ? (1 - progress) / 0.15
        : 1

    if (alpha < 0.05) continue

    for (let t = 0; t < 4; t++) {
      const trailProgress = progress - t * 0.06
      if (trailProgress < 0) continue
      const trailY = baseY - trailProgress * 70
      const trailX = cx + stream.offsetX + Math.sin(trailProgress * Math.PI * 3) * 10
      const trailAlpha = alpha * (0.25 - t * 0.05)

      ctx.fillStyle = `rgba(${hexToRgb(stream.glow)}, ${trailAlpha})`
      ctx.beginPath()
      ctx.arc(bx + trailX * u, by + trailY * u, (1.5 - t * 0.3) * u, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(bx + runeX * u, by + runeY * u)

    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * u)
    glowGrad.addColorStop(0, `rgba(${hexToRgb(stream.glow)}, ${0.4})`)
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = glowGrad
    ctx.beginPath()
    ctx.arc(0, 0, 10 * u, 0, Math.PI * 2)
    ctx.fill()

    const runeIndex = Math.abs(Math.floor(stream.offsetX)) % 4
    ctx.strokeStyle = stream.color
    ctx.lineWidth = 1.2 * u

    if (runeIndex === 0) {
      ctx.beginPath()
      ctx.moveTo(0, -3 * u)
      ctx.lineTo(2.5 * u, 2.5 * u)
      ctx.lineTo(-2.5 * u, 2.5 * u)
      ctx.closePath()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, 0.5 * u, 1 * u, 0, Math.PI * 2)
      ctx.stroke()
    } else if (runeIndex === 1) {
      ctx.beginPath()
      ctx.arc(0, 0, 3 * u, -0.6, 2.5)
      ctx.arc(1.5 * u, 0, 2.5 * u, 2.5, -0.6, true)
      ctx.stroke()
    } else if (runeIndex === 2) {
      for (let j = 0; j < 5; j++) {
        const a = (j * Math.PI * 2) / 5 - Math.PI / 2
        const a2 = ((j + 2) * Math.PI * 2) / 5 - Math.PI / 2
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * 3 * u, Math.sin(a) * 3 * u)
        ctx.lineTo(Math.cos(a2) * 1.2 * u, Math.sin(a2) * 1.2 * u)
        ctx.stroke()
      }
    } else {
      ctx.beginPath()
      for (let j = 0; j < 20; j++) {
        const a = j * 0.5
        const r = j * 0.4 * u
        const sx = Math.cos(a) * r
        const sy = Math.sin(a) * r
        if (j === 0) ctx.moveTo(sx, sy)
        else ctx.lineTo(sx, sy)
      }
      ctx.stroke()
    }

    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(0, 0, 1 * u, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = 1
    ctx.restore()
  }

  for (let i = 0; i < 12; i++) {
    const riseProgress = ((anim.runeRise1 + i * 8.3) % 100) / 100
    const px = cx + Math.sin(i * 1.7) * 15
    const py = cy - 25 - riseProgress * 80
    const alpha = riseProgress < 0.1
      ? riseProgress / 0.1
      : riseProgress > 0.9
        ? (1 - riseProgress) / 0.1
        : 0.6

    const size = 0.6 + riseProgress * 0.5
    ctx.fillStyle = `rgba(255, 204, 102, ${alpha})`
    ctx.beginPath()
    ctx.arc(bx + px * u, by + py * u, size * u, 0, Math.PI * 2)
    ctx.fill()
  }
}

const drawFloatingParticles = (ctx, bx, by, u, anim, frame) => {
  const cx = 75, cy = 82

  for (let i = 0; i < 15; i++) {
    const angle = (i * Math.PI * 2) / 15 + anim.orbitRotation * 0.3
    const dist = 20 + Math.sin(frame * 2.5 + i * 1.2) * 8
    const px = cx + Math.cos(angle) * dist
    const py = cy + Math.sin(angle) * dist * 0.6

    const alpha = 0.2 + 0.15 * Math.sin(frame * 3.0 + i * 0.9)
    const colors = [C.auraPink, C.auraPurple, C.auraCyan, C.auraGold]
    const color = colors[i % colors.length]

    ctx.fillStyle = `rgba(${hexToRgb(color)}, ${alpha})`
    ctx.beginPath()
    ctx.arc(bx + px * u, by + py * u, 1.2 * u, 0, Math.PI * 2)
    ctx.fill()

    if (Math.sin(frame * 5 + i) > 0.7) {
      ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${alpha * 0.5})`
      ctx.lineWidth = 0.3 * u
      ctx.beginPath()
      ctx.moveTo(bx + (px - 2) * u, by + py * u)
      ctx.lineTo(bx + (px + 2) * u, by + py * u)
      ctx.moveTo(bx + px * u, by + (py - 2) * u)
      ctx.lineTo(bx + px * u, by + (py + 2) * u)
      ctx.stroke()
    }
  }

  for (let i = 0; i < 8; i++) {
    const rise = ((frame * 1.5 + i * 18) % 100) / 100
    const px = cx - 15 + (i * 4.3) % 30
    const py = cy + 30 - rise * 55
    const alpha = 0.15 + 0.1 * Math.sin(rise * Math.PI)

    ctx.fillStyle = `rgba(255, 204, 68, ${alpha})`
    ctx.beginPath()
    ctx.arc(bx + px * u, by + py * u, 0.8 * u, 0, Math.PI * 2)
    ctx.fill()
  }
}

const drawCrownGlow = (ctx, bx, by, u, anim) => {
  const cx = 75, apexY = 15

  const crownGrad = ctx.createRadialGradient(
    bx + cx * u, by + apexY * u, 0,
    bx + cx * u, by + apexY * u, 14 * u
  )
  crownGrad.addColorStop(0, `rgba(255, 255, 255, ${0.5 * anim.auraPulse3})`)
  crownGrad.addColorStop(0.3, `rgba(255, 102, 153, ${0.3 * anim.auraPulse1})`)
  crownGrad.addColorStop(0.7, `rgba(255, 68, 136, ${0.1 * anim.auraPulse2})`)
  crownGrad.addColorStop(1, 'rgba(255, 68, 136, 0)')
  ctx.fillStyle = crownGrad
  ctx.beginPath()
  ctx.arc(bx + cx * u, by + apexY * u, 14 * u, 0, Math.PI * 2)
  ctx.fill()

  const beamGrad = ctx.createLinearGradient(
    bx + cx * u, by + apexY * u,
    bx + cx * u, by + (apexY - 20) * u
  )
  beamGrad.addColorStop(0, `rgba(255, 221, 102, ${0.25 * anim.auraPulse3})`)
  beamGrad.addColorStop(1, 'rgba(255, 221, 102, 0)')
  ctx.fillStyle = beamGrad
  ctx.beginPath()
  ctx.moveTo(bx + (cx - 4) * u, by + apexY * u)
  ctx.lineTo(bx + (cx + 4) * u, by + apexY * u)
  ctx.lineTo(bx + (cx + 1) * u, by + (apexY - 20) * u)
  ctx.lineTo(bx + (cx - 1) * u, by + (apexY - 20) * u)
  ctx.closePath()
  ctx.fill()

  for (let i = 0; i < 3; i++) {
    const angle = anim.crownOrbit + (i * Math.PI * 2) / 3
    const ringR = 6 * u
    const rx = bx + cx * u + Math.cos(angle) * ringR
    const ry = by + apexY * u + Math.sin(angle) * ringR * 0.5

    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 * anim.auraPulse1})`
    ctx.beginPath()
    ctx.arc(rx, ry, 1 * u, 0, Math.PI * 2)
    ctx.fill()
  }
}


const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  }
  if (hex === C.auraPink) return '255, 68, 136'
  if (hex === C.auraPurple) return '153, 68, 221'
  if (hex === C.auraCyan) return '68, 221, 204'
  if (hex === C.auraGold) return '255, 204, 68'
  return '255, 255, 255'
}
