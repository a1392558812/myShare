import { drawPixel } from '../draw-utils.js'

export const config = {
  ASPECT_RATIO: 120 / 120,
}

const C = {
  bg: 'transparent',

  vortexOuter: '#1A0066',
  vortexMid: '#3300AA',
  vortexInner: '#5500DD',
  vortexCore: '#8800FF',
  vortexEdge: '#110044',

  circleGold: '#DDAA33',
  circleGoldBright: '#FFDD66',
  circleGoldDark: '#886600',
  circlePurple: '#6633CC',
  circlePurpleBright: '#9966FF',
  circlePurpleDark: '#331166',
  circleCyan: '#22CCAA',
  circleCyanBright: '#66FFDD',
  circleCyanDark: '#116644',

  glowPurple: '#9944DD',
  glowPink: '#FF4488',
  glowCyan: '#44DDCC',
  glowWhite: '#FFFFFF',
  glowGold: '#FFCC44',

  runeOuter: '#BB88FF',
  runeInner: '#FFCC66',
  runeBright: '#FFFFFF',
  runeShadow: '#442288',

  sparkPurple: '#CC88FF',
  sparkCyan: '#88FFEE',
  sparkGold: '#FFDD88',
  sparkWhite: '#FFFFFF',
}


const PORTAL_OUTER_RINGS = (() => {
  const pixels = []
  const cx = 60, cy = 60

  for (let angle = 0; angle < 360; angle += 1.5) {
    const rad = (angle * Math.PI) / 180
    const r = 55
    const x = Math.round(cx + Math.cos(rad) * r)
    const y = Math.round(cy + Math.sin(rad) * r)
    if (x >= 5 && x <= 114 && y >= 5 && y <= 114) {
      pixels.push([x, y, angle % 6 < 3 ? C.circleGold : C.circleGoldDark])
    }
  }

  for (let angle = 0; angle < 360; angle += 1.2) {
    const rad = (angle * Math.PI) / 180
    const r = 50
    const x = Math.round(cx + Math.cos(rad) * r)
    const y = Math.round(cy + Math.sin(rad) * r)
    if (x >= 10 && x <= 109 && y >= 10 && y <= 109) {
      pixels.push([x, y, angle % 5 < 3 ? C.circlePurple : C.circlePurpleDark])
    }
  }

  for (let angle = 0; angle < 360; angle += 1) {
    const rad = (angle * Math.PI) / 180
    const r = 45
    const x = Math.round(cx + Math.cos(rad) * r)
    const y = Math.round(cy + Math.sin(rad) * r)
    if (x >= 15 && x <= 104 && y >= 15 && y <= 104) {
      pixels.push([x, y, angle % 4 < 2 ? C.circleCyan : C.circleCyanDark])
    }
  }

  return pixels
})()

const PORTAL_GEAR_RING = (() => {
  const pixels = []
  const cx = 60, cy = 60

  for (let i = 0; i < 16; i++) {
    const baseAngle = (i * 22.5 * Math.PI) / 180
    for (let a = baseAngle - 0.12; a <= baseAngle + 0.12; a += 0.03) {
      for (let r = 40; r <= 43; r++) {
        const x = Math.round(cx + Math.cos(a) * r)
        const y = Math.round(cy + Math.sin(a) * r)
        if (x >= 17 && x <= 102 && y >= 17 && y <= 102) {
          pixels.push([x, y, C.circlePurpleBright])
        }
      }
    }
    for (let a = baseAngle + 0.13; a <= baseAngle + 0.26; a += 0.04) {
      for (let r = 37; r <= 40; r++) {
        const x = Math.round(cx + Math.cos(a) * r)
        const y = Math.round(cy + Math.sin(a) * r)
        if (x >= 18 && x <= 101 && y >= 18 && y <= 101) {
          pixels.push([x, y, C.circlePurpleDark])
        }
      }
    }
  }

  return pixels
})()

const PORTAL_RUNE_PILLARS = (() => {
  const pixels = []
  const cx = 60, cy = 60

  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 * Math.PI) / 180
    const px = Math.round(cx + Math.cos(angle) * 33)
    const py = Math.round(cy + Math.sin(angle) * 33)

    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (Math.abs(dx) + Math.abs(dy) <= 3) {
          const color = Math.abs(dx) + Math.abs(dy) === 3
            ? C.runeOuter
            : Math.abs(dx) + Math.abs(dy) <= 1
              ? C.runeBright
              : C.runeInner
          pixels.push([px + dx, py + dy, color])
        }
      }
    }
  }

  return pixels
})()

const PORTAL_VORTEX_BASE = (() => {
  const pixels = []
  const cx = 60, cy = 60

  for (let r = 5; r <= 35; r++) {
    for (let angle = 0; angle < 360; angle += 2) {
      const rad = (angle * Math.PI) / 180
      const x = Math.round(cx + Math.cos(rad) * r)
      const y = Math.round(cy + Math.sin(rad) * r)

      let color
      if (r <= 8) {
        color = C.vortexCore
      } else if (r <= 16) {
        color = (x + y) % 4 < 2 ? C.vortexInner : C.vortexMid
      } else if (r <= 25) {
        color = (x - y) % 4 < 2 ? C.vortexMid : C.vortexOuter
      } else if (r <= 32) {
        color = (x + y) % 3 === 0 ? C.vortexOuter : C.vortexEdge
      } else {
        color = (x + y) % 5 < 2 ? C.vortexEdge : C.vortexOuter
      }

      if (x >= 25 && x <= 94 && y >= 25 && y <= 94) {
        pixels.push([x, y, color])
      }
    }
  }

  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      if (dx * dx + dy * dy <= 6) {
        pixels.push([cx + dx, cy + dy, '#FFFFFF'])
      } else if (dx * dx + dy * dy <= 12) {
        pixels.push([cx + dx, cy + dy, C.vortexCore])
      }
    }
  }

  return pixels
})()

const PORTAL_CORNER_RUNES = (() => {
  const pixels = []
  const corners = [
    [20, 20],
    [99, 20],
    [20, 99],
    [99, 99],
  ]

  for (const [cx, cy] of corners) {
    const dx = 60 - cx
    const dy = 60 - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const ndx = dx / dist
    const ndy = dy / dist

    const ax = cx + ndx * 6, ay = cy + ndy * 6
    const bx = cx - ndy * 4, by = cy + ndx * 4
    const cx2 = cx + ndy * 4, cy2 = cy - ndx * 4

    for (let t = 0; t <= 1; t += 0.15) {
      const baseLx = bx + (cx2 - bx) * t
      const baseLy = by + (cy2 - by) * t
      for (let s = 0; s <= 1; s += 0.15) {
        const px = Math.round(baseLx + (ax - baseLx) * s)
        const py = Math.round(baseLy + (ay - baseLy) * s)
        const edge = s < 0.2 || t < 0.1 || t > 0.9
        pixels.push([px, py, edge ? C.runeShadow : C.runeOuter])
      }
    }
  }

  return pixels
})()

const PORTAL_CORNER_DOTS = (() => {
  const pixels = []
  const positions = [
    [14, 14], [105, 14], [14, 105], [105, 105],
  ]
  for (const [px, py] of positions) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (dx * dx + dy * dy <= 3) {
          pixels.push([px + dx, py + dy, C.circleGoldBright])
        }
      }
    }
  }
  return pixels
})()

const PORTAL_STATIC_PIXELS = [
  ...PORTAL_OUTER_RINGS,
  ...PORTAL_GEAR_RING,
  ...PORTAL_RUNE_PILLARS,
  ...PORTAL_VORTEX_BASE,
  ...PORTAL_CORNER_RUNES,
  ...PORTAL_CORNER_DOTS,
]

export const drawPortal = (ctx, config) => {
  const { x, y, width = 120, height = 120, frame = 0 } = config
  ctx.imageSmoothingEnabled = false

  const u = width / 120

  ctx.fillStyle = C.bg
  ctx.fillRect(x, y, width, height)

  for (let i = 0; i < PORTAL_STATIC_PIXELS.length; i++) {
    const [px, py, color] = PORTAL_STATIC_PIXELS[i]
    drawPixel({ px, py, color, ctx, x, y, unit: u })
  }

  const anim = {
    vortexRotation: frame * 0.8,
    vortexRotation2: -frame * 0.55,

    glowPulse1: 0.5 + 0.5 * Math.sin(frame * 1.6),
    glowPulse2: 0.4 + 0.6 * Math.sin(frame * 1.6 + Math.PI * 0.7),
    glowPulse3: 0.45 + 0.55 * Math.sin(frame * 1.9 + Math.PI * 0.4),
    glowPulse4: 0.35 + 0.65 * Math.sin(frame * 2.2 + 1.2),

    outerRuneOrbit: frame * 0.45,
    outerRuneOrbit2: -frame * 0.35,

    innerRotation: frame * 0.65,

    particlePhase: frame * 2.5,

    portalOpen: 0.7 + 0.3 * Math.sin(frame * 1.2),
    portalPulse: 0.85 + 0.15 * Math.sin(frame * 1.8),

    sparklePhase: frame * 3.0,
  }

  drawVortexSwirl(ctx, x, y, u, anim)
  drawOuterGlowRings(ctx, x, y, u, anim)
  drawOrbitingRunes(ctx, x, y, u, anim)
  drawPortalGlow(ctx, x, y, u, anim)
  drawRotatingInnerRing(ctx, x, y, u, anim)
  drawFloatingParticles(ctx, x, y, u, anim, frame)
  drawSparkles(ctx, x, y, u, anim, frame)
  drawCenterBeam(ctx, x, y, u, anim)
}


const drawVortexSwirl = (ctx, bx, by, u, anim) => {
  const cx = 60, cy = 60

  for (let i = 0; i < 6; i++) {
    const swirlAngle = anim.vortexRotation + (i * Math.PI) / 3
    ctx.save()
    ctx.globalAlpha = 0.15 + 0.05 * Math.sin(anim.glowPulse1 * 3 + i)

    ctx.strokeStyle = i % 2 === 0 ? '#BB88FF' : '#66FFDD'
    ctx.lineWidth = (1.5 - i * 0.2) * u

    ctx.beginPath()
    for (let t = 0; t < Math.PI * 2.5; t += 0.1) {
      const r = (8 + t * 8) * u
      const sx = bx + cx * u + Math.cos(t + swirlAngle) * r
      const sy = by + cy * u + Math.sin(t + swirlAngle) * r
      if (t === 0) ctx.moveTo(sx, sy)
      else ctx.lineTo(sx, sy)
    }
    ctx.stroke()
    ctx.globalAlpha = 1
    ctx.restore()
  }
}

const drawOuterGlowRings = (ctx, bx, by, u, anim) => {
  const cx = 60, cy = 60

  const alpha1 = 0.2 + 0.15 * anim.glowPulse1
  ctx.strokeStyle = `rgba(255, 221, 102, ${alpha1})`
  ctx.lineWidth = 2 * u
  ctx.beginPath()
  ctx.arc(bx + cx * u, by + cy * u, 55 * u, 0, Math.PI * 2)
  ctx.stroke()

  const alpha2 = 0.15 + 0.1 * anim.glowPulse2
  ctx.strokeStyle = `rgba(153, 68, 221, ${alpha2})`
  ctx.lineWidth = 1.5 * u
  ctx.setLineDash([6 * u, 4 * u])
  ctx.lineDashOffset = anim.outerRuneOrbit * 30 * u
  ctx.beginPath()
  ctx.arc(bx + cx * u, by + cy * u, 50 * u, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  const alpha3 = 0.12 + 0.1 * anim.glowPulse3
  ctx.strokeStyle = `rgba(68, 221, 204, ${alpha3})`
  ctx.lineWidth = 1.2 * u
  ctx.setLineDash([4 * u, 5 * u])
  ctx.lineDashOffset = anim.outerRuneOrbit2 * 25 * u
  ctx.beginPath()
  ctx.arc(bx + cx * u, by + cy * u, 45 * u, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
}

const drawOrbitingRunes = (ctx, bx, by, u, anim) => {
  const cx = 60, cy = 60
  const orbitR = 33

  const runeShapes = [
    (offX, offY, s) => {
      ctx.beginPath()
      ctx.moveTo(offX, offY - s * 3.5)
      ctx.lineTo(offX + s * 3, offY + s * 2.5)
      ctx.lineTo(offX - s * 3, offY + s * 2.5)
      ctx.closePath()
      ctx.stroke()
    },
    (offX, offY, s) => {
      ctx.beginPath()
      ctx.moveTo(offX, offY - s * 3)
      ctx.lineTo(offX + s * 2.5, offY)
      ctx.lineTo(offX, offY + s * 3)
      ctx.lineTo(offX - s * 2.5, offY)
      ctx.closePath()
      ctx.stroke()
    },
    (offX, offY, s) => {
      ctx.beginPath()
      ctx.moveTo(offX - s * 2.5, offY - s * 2.5)
      ctx.lineTo(offX + s * 2.5, offY + s * 2.5)
      ctx.moveTo(offX + s * 2.5, offY - s * 2.5)
      ctx.lineTo(offX - s * 2.5, offY + s * 2.5)
      ctx.stroke()
    },
    (offX, offY, s) => {
      ctx.beginPath()
      ctx.moveTo(offX - s * 3, offY)
      ctx.lineTo(offX + s * 3, offY)
      ctx.moveTo(offX, offY - s * 3)
      ctx.lineTo(offX, offY + s * 3)
      ctx.stroke()
    },
  ]

  for (let i = 0; i < 8; i++) {
    const angle = ((i * 45) * Math.PI) / 180 + anim.outerRuneOrbit
    const rx = bx + (cx + Math.cos(angle) * orbitR) * u
    const ry = by + (cy + Math.sin(angle) * orbitR) * u

    const glowAlpha = 0.08 + 0.07 * anim.glowPulse1
    ctx.fillStyle = `rgba(187, 136, 255, ${glowAlpha})`
    ctx.beginPath()
    ctx.arc(rx, ry, 5 * u, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = `rgba(255, 204, 102, ${0.5 + 0.3 * anim.glowPulse2})`
    ctx.lineWidth = 1 * u
    runeShapes[i % 4](rx, ry, u)

    const dotAlpha = 0.5 + 0.4 * Math.sin(anim.sparklePhase + i)
    ctx.fillStyle = `rgba(255, 255, 255, ${dotAlpha})`
    ctx.beginPath()
    ctx.arc(rx, ry, 1 * u, 0, Math.PI * 2)
    ctx.fill()
  }
}

const drawPortalGlow = (ctx, bx, by, u, anim) => {
  const cx = 60, cy = 60

  const outerGrad = ctx.createRadialGradient(
    bx + cx * u, by + cy * u, 5 * u,
    bx + cx * u, by + cy * u, 40 * u
  )
  outerGrad.addColorStop(0, `rgba(153, 68, 221, ${0.25 * anim.glowPulse1})`)
  outerGrad.addColorStop(0.4, `rgba(68, 221, 204, ${0.15 * anim.glowPulse2})`)
  outerGrad.addColorStop(0.7, `rgba(255, 68, 136, ${0.08 * anim.glowPulse3})`)
  outerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = outerGrad
  ctx.beginPath()
  ctx.arc(bx + cx * u, by + cy * u, 40 * u, 0, Math.PI * 2)
  ctx.fill()

  const midGrad = ctx.createRadialGradient(
    bx + cx * u, by + cy * u, 2 * u,
    bx + cx * u, by + cy * u, 25 * u
  )
  midGrad.addColorStop(0, `rgba(136, 0, 255, ${0.35 * anim.portalPulse})`)
  midGrad.addColorStop(0.5, `rgba(85, 0, 221, ${0.2 * anim.portalPulse})`)
  midGrad.addColorStop(1, 'rgba(51, 0, 170, 0)')
  ctx.fillStyle = midGrad
  ctx.beginPath()
  ctx.arc(bx + cx * u, by + cy * u, 25 * u, 0, Math.PI * 2)
  ctx.fill()

  const innerGrad = ctx.createRadialGradient(
    bx + cx * u, by + cy * u, 0,
    bx + cx * u, by + cy * u, 10 * u
  )
  innerGrad.addColorStop(0, `rgba(255, 255, 255, ${0.5 * anim.glowPulse4})`)
  innerGrad.addColorStop(0.3, `rgba(187, 136, 255, ${0.35 * anim.portalPulse})`)
  innerGrad.addColorStop(1, 'rgba(136, 0, 255, 0)')
  ctx.fillStyle = innerGrad
  ctx.beginPath()
  ctx.arc(bx + cx * u, by + cy * u, 10 * u, 0, Math.PI * 2)
  ctx.fill()
}

const drawRotatingInnerRing = (ctx, bx, by, u, anim) => {
  const cx = 60, cy = 60

  for (let i = 0; i < 8; i++) {
    const angle = ((i * 45) * Math.PI) / 180 + anim.innerRotation
    const r = 20 * u
    const rx = bx + cx * u + Math.cos(angle) * r
    const ry = by + cy * u + Math.sin(angle) * r

    const alpha = 0.3 + 0.3 * Math.sin(anim.glowPulse1 * 3 + i)
    ctx.fillStyle = `rgba(102, 255, 221, ${alpha})`
    ctx.beginPath()
    ctx.arc(rx, ry, 1.5 * u, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = `rgba(136, 255, 238, ${alpha * 0.5})`
    ctx.lineWidth = 0.4 * u
    ctx.beginPath()
    ctx.moveTo(rx - 2.5 * u, ry)
    ctx.lineTo(rx + 2.5 * u, ry)
    ctx.moveTo(rx, ry - 2.5 * u)
    ctx.lineTo(rx, ry + 2.5 * u)
    ctx.stroke()
  }

  for (let i = 0; i < 4; i++) {
    const angle1 = ((i * 90) * Math.PI) / 180 + anim.innerRotation * 0.7
    const angle2 = (((i + 2) * 90) % 360 * Math.PI) / 180 + anim.innerRotation * 0.7
    const r = 18 * u

    const alpha = 0.08 + 0.04 * anim.glowPulse3
    ctx.strokeStyle = `rgba(187, 136, 255, ${alpha})`
    ctx.lineWidth = 0.6 * u
    ctx.beginPath()
    ctx.moveTo(bx + cx * u + Math.cos(angle1) * r, by + cy * u + Math.sin(angle1) * r)
    ctx.lineTo(bx + cx * u + Math.cos(angle2) * r, by + cy * u + Math.sin(angle2) * r)
    ctx.stroke()
  }
}

const drawFloatingParticles = (ctx, bx, by, u, anim, frame) => {
  const cx = 60, cy = 60

  for (let i = 0; i < 18; i++) {
    const angle = ((i * 20) * Math.PI) / 180 + anim.vortexRotation * 0.4
    const dist = 22 + Math.sin(frame * 2.0 + i * 0.8) * 8
    const px = cx + Math.cos(angle) * dist
    const py = cy + Math.sin(angle) * dist * 0.7

    const alpha = 0.15 + 0.15 * Math.sin(frame * 3.5 + i * 1.1)
    const colors = [C.sparkPurple, C.sparkCyan, C.sparkGold, C.sparkWhite]
    const color = colors[i % colors.length]

    ctx.fillStyle = `rgba(${hexToRgb(color)}, ${alpha})`
    ctx.beginPath()
    ctx.arc(bx + px * u, by + py * u, 1 * u, 0, Math.PI * 2)
    ctx.fill()

    if (Math.sin(frame * 4 + i) > 0.6) {
      ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${alpha * 0.4})`
      ctx.lineWidth = 0.3 * u
      ctx.beginPath()
      ctx.moveTo(bx + (px - 2) * u, by + py * u)
      ctx.lineTo(bx + (px + 2) * u, by + py * u)
      ctx.stroke()
    }
  }

  for (let i = 0; i < 10; i++) {
    const riseProgress = ((frame * 1.2 + i * 12) % 100) / 100
    const px = cx + Math.sin(i * 1.9) * 10
    const py = cy - riseProgress * 50

    const alpha = riseProgress < 0.1
      ? riseProgress / 0.1
      : riseProgress > 0.85
        ? (1 - riseProgress) / 0.15
        : 0.5

    if (alpha < 0.03) continue

    const size = 0.6 + riseProgress * 0.6
    ctx.fillStyle = `rgba(204, 136, 255, ${alpha})`
    ctx.beginPath()
    ctx.arc(bx + px * u, by + py * u, size * u, 0, Math.PI * 2)
    ctx.fill()
  }
}

const drawSparkles = (ctx, bx, by, u, anim, frame) => {
  const cx = 60, cy = 60

  const sparklePositions = [
    { angle: 0, r: 52 }, { angle: 45, r: 54 }, { angle: 90, r: 51 },
    { angle: 135, r: 53 }, { angle: 180, r: 52 }, { angle: 225, r: 54 },
    { angle: 270, r: 51 }, { angle: 315, r: 53 },
  ]

  for (let i = 0; i < sparklePositions.length; i++) {
    const { angle: baseAngle, r } = sparklePositions[i]
    const angle = (baseAngle * Math.PI) / 180 + anim.outerRuneOrbit * 0.3
    const sx = bx + (cx + Math.cos(angle) * r) * u
    const sy = by + (cy + Math.sin(angle) * r) * u

    const sparkleAlpha = Math.pow(
      Math.abs(Math.sin(frame * 4.5 + i * 1.7)),
      3
    ) * 0.8

    if (sparkleAlpha > 0.05) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${sparkleAlpha})`
      ctx.lineWidth = 0.5 * u
      ctx.beginPath()
      ctx.moveTo(sx - 3 * u, sy)
      ctx.lineTo(sx + 3 * u, sy)
      ctx.moveTo(sx, sy - 3 * u)
      ctx.lineTo(sx, sy + 3 * u)
      ctx.stroke()

      ctx.strokeStyle = `rgba(255, 221, 136, ${sparkleAlpha * 0.6})`
      ctx.lineWidth = 0.3 * u
      ctx.beginPath()
      ctx.moveTo(sx - 2 * u, sy - 2 * u)
      ctx.lineTo(sx + 2 * u, sy + 2 * u)
      ctx.moveTo(sx + 2 * u, sy - 2 * u)
      ctx.lineTo(sx - 2 * u, sy + 2 * u)
      ctx.stroke()

      ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`
      ctx.beginPath()
      ctx.arc(sx, sy, 0.8 * u, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  for (let i = 0; i < 6; i++) {
    const sparkleAlpha = Math.pow(
      Math.abs(Math.sin(frame * 6 + i * 2.3)),
      4
    ) * 0.7

    if (sparkleAlpha > 0.03) {
      const ra = (i * 60 + frame * 2) * Math.PI / 180
      const rr = 28 + Math.sin(frame * 3 + i) * 10
      const sx = bx + (cx + Math.cos(ra) * rr) * u
      const sy = by + (cy + Math.sin(ra) * rr) * u

      ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`
      ctx.beginPath()
      ctx.arc(sx, sy, 0.6 * u, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

const drawCenterBeam = (ctx, bx, by, u, anim) => {
  const cx = 60, cy = 60

  const beamAlpha = 0.06 + 0.04 * anim.glowPulse4
  const beamGrad = ctx.createLinearGradient(
    bx + cx * u, by + cy * u,
    bx + cx * u, by + (cy - 45) * u
  )
  beamGrad.addColorStop(0, `rgba(187, 136, 255, ${beamAlpha * 3})`)
  beamGrad.addColorStop(0.5, `rgba(136, 0, 255, ${beamAlpha})`)
  beamGrad.addColorStop(1, 'rgba(136, 0, 255, 0)')
  ctx.fillStyle = beamGrad

  ctx.beginPath()
  ctx.moveTo(bx + (cx - 3) * u, by + cy * u)
  ctx.lineTo(bx + (cx + 3) * u, by + cy * u)
  ctx.lineTo(bx + (cx + 1) * u, by + (cy - 45) * u)
  ctx.lineTo(bx + (cx - 1) * u, by + (cy - 45) * u)
  ctx.closePath()
  ctx.fill()

  const beamGrad2 = ctx.createLinearGradient(
    bx + cx * u, by + cy * u,
    bx + cx * u, by + (cy + 45) * u
  )
  beamGrad2.addColorStop(0, `rgba(68, 221, 204, ${beamAlpha * 2.5})`)
  beamGrad2.addColorStop(0.5, `rgba(34, 204, 170, ${beamAlpha})`)
  beamGrad2.addColorStop(1, 'rgba(34, 204, 170, 0)')
  ctx.fillStyle = beamGrad2

  ctx.beginPath()
  ctx.moveTo(bx + (cx - 3) * u, by + cy * u)
  ctx.lineTo(bx + (cx + 3) * u, by + cy * u)
  ctx.lineTo(bx + (cx + 1) * u, by + (cy + 45) * u)
  ctx.lineTo(bx + (cx - 1) * u, by + (cy + 45) * u)
  ctx.closePath()
  ctx.fill()
}


const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  }
  return '255, 255, 255'
}
