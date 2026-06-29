export const renderBoundaryLines = (ctx, camera, canvas, boundaryRadX, boundaryRadY, gameTime) => {
  const cw = canvas.width
  const ch = canvas.height

  const leftScreen   = -boundaryRadX - camera.x + cw / 2
  const rightScreen  =  boundaryRadX - camera.x + cw / 2
  const topScreen    = -boundaryRadY - camera.y + ch / 2
  const bottomScreen =  boundaryRadY - camera.y + ch / 2

  const extend = 400

  ctx.save()

  const glowAlpha = 0.06 + 0.025 * Math.sin(gameTime / 500)
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 18
  ctx.globalAlpha = glowAlpha
  ctx.setLineDash([])

  drawFourLines(ctx, leftScreen, rightScreen, topScreen, bottomScreen, cw, ch, extend)

  const stripeAlpha = 0.28 + 0.08 * Math.sin(gameTime / 700)
  ctx.strokeStyle = '#dc2626'
  ctx.lineWidth = 7
  ctx.globalAlpha = stripeAlpha
  ctx.setLineDash([24, 14])

  drawFourLines(ctx, leftScreen, rightScreen, topScreen, bottomScreen, cw, ch, extend)

  const brightAlpha = 0.55 + 0.2 * Math.sin(gameTime / 350)
  ctx.strokeStyle = '#f87171'
  ctx.lineWidth = 3
  ctx.globalAlpha = brightAlpha
  ctx.setLineDash([])

  drawFourLines(ctx, leftScreen, rightScreen, topScreen, bottomScreen, cw, ch, extend)

  drawBoundaryDangerZone(ctx, leftScreen, rightScreen, topScreen, bottomScreen, cw, ch, gameTime, extend)

  ctx.restore()
}


function drawFourLines(ctx, left, right, top, bottom, cw, ch, extend) {
  if (left > -extend && left < cw + extend) {
    ctx.beginPath()
    ctx.moveTo(left, -extend)
    ctx.lineTo(left, ch + extend)
    ctx.stroke()
  }
  if (right > -extend && right < cw + extend) {
    ctx.beginPath()
    ctx.moveTo(right, -extend)
    ctx.lineTo(right, ch + extend)
    ctx.stroke()
  }
  if (top > -extend && top < ch + extend) {
    ctx.beginPath()
    ctx.moveTo(-extend, top)
    ctx.lineTo(cw + extend, top)
    ctx.stroke()
  }
  if (bottom > -extend && bottom < ch + extend) {
    ctx.beginPath()
    ctx.moveTo(-extend, bottom)
    ctx.lineTo(cw + extend, bottom)
    ctx.stroke()
  }
}


function drawBoundaryDangerZone(ctx, left, right, top, bottom, cw, ch, gameTime, extend) {
  const zoneAlpha = 0.04 + 0.015 * Math.sin(gameTime / 600)

  ctx.globalAlpha = zoneAlpha
  ctx.fillStyle = '#ef4444'

  if (left > 0 && left < cw) {
    ctx.fillRect(0, 0, left, ch)
  }
  if (right > 0 && right < cw) {
    ctx.fillRect(right, 0, cw - right, ch)
  }
  if (top > 0 && top < ch) {
    ctx.fillRect(0, 0, cw, top)
  }
  if (bottom > 0 && bottom < ch) {
    ctx.fillRect(0, bottom, cw, ch - bottom)
  }
}


export const renderBoundaryWarning = (ctx, cw, ch, warningLevel, dangerLevel, gameTime) => {
  if (dangerLevel <= 0 && warningLevel <= 0) return

  ctx.save()

  if (dangerLevel > 0) {
    const pulse = 0.55 + 0.12 * Math.sin(gameTime / 280)
    let alpha, edgeWidth, tintAlpha
    if (dangerLevel === 1) {
      alpha = 0.28 * pulse
      edgeWidth = 180
      tintAlpha = 0.02
    } else if (dangerLevel === 2) {
      alpha = 0.45 * pulse
      edgeWidth = 320
      tintAlpha = 0.06
    } else {
      alpha = 0.65 * pulse
      edgeWidth = 460
      tintAlpha = 0.12
    }

    drawLinearEdgeVignette(ctx, cw, ch, alpha, edgeWidth, tintAlpha)
  } else if (warningLevel > 0) {
    const alpha = warningLevel * 0.14
    const edgeWidth = 60 + warningLevel * 150
    drawLinearEdgeVignette(ctx, cw, ch, alpha, edgeWidth, 0)
  }

  ctx.restore()
}

function drawLinearEdgeVignette(ctx, cw, ch, alpha, edgeWidth, tintAlpha) {
  if (edgeWidth > 0) {
    const gradTop = ctx.createLinearGradient(0, 0, 0, edgeWidth)
    gradTop.addColorStop(0, `rgba(239, 68, 68, ${alpha})`)
    gradTop.addColorStop(0.5, `rgba(239, 68, 68, ${alpha * 0.35})`)
    gradTop.addColorStop(1, 'rgba(239, 68, 68, 0)')
    ctx.fillStyle = gradTop
    ctx.fillRect(0, 0, cw, edgeWidth)
  }

  if (edgeWidth > 0) {
    const gradBottom = ctx.createLinearGradient(0, ch, 0, ch - edgeWidth)
    gradBottom.addColorStop(0, `rgba(239, 68, 68, ${alpha})`)
    gradBottom.addColorStop(0.5, `rgba(239, 68, 68, ${alpha * 0.35})`)
    gradBottom.addColorStop(1, 'rgba(239, 68, 68, 0)')
    ctx.fillStyle = gradBottom
    ctx.fillRect(0, ch - edgeWidth, cw, edgeWidth)
  }

  if (edgeWidth > 0) {
    const gradLeft = ctx.createLinearGradient(0, 0, edgeWidth, 0)
    gradLeft.addColorStop(0, `rgba(239, 68, 68, ${alpha})`)
    gradLeft.addColorStop(0.5, `rgba(239, 68, 68, ${alpha * 0.35})`)
    gradLeft.addColorStop(1, 'rgba(239, 68, 68, 0)')
    ctx.fillStyle = gradLeft
    ctx.fillRect(0, 0, edgeWidth, ch)
  }

  if (edgeWidth > 0) {
    const gradRight = ctx.createLinearGradient(cw, 0, cw - edgeWidth, 0)
    gradRight.addColorStop(0, `rgba(239, 68, 68, ${alpha})`)
    gradRight.addColorStop(0.5, `rgba(239, 68, 68, ${alpha * 0.35})`)
    gradRight.addColorStop(1, 'rgba(239, 68, 68, 0)')
    ctx.fillStyle = gradRight
    ctx.fillRect(cw - edgeWidth, 0, edgeWidth, ch)
  }

  const cornerR = edgeWidth * 0.5
  const corners = [
    { cx: 0, cy: 0 }, { cx: cw, cy: 0 },
    { cx: 0, cy: ch }, { cx: cw, cy: ch },
  ]
  for (const c of corners) {
    const grad = ctx.createRadialGradient(c.cx, c.cy, 0, c.cx, c.cy, cornerR)
    grad.addColorStop(0, `rgba(239, 68, 68, ${alpha * 0.6})`)
    grad.addColorStop(1, 'rgba(239, 68, 68, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(
      c.cx === 0 ? 0 : c.cx - cornerR,
      c.cy === 0 ? 0 : c.cy - cornerR,
      cornerR, cornerR
    )
  }

  if (tintAlpha > 0) {
    ctx.fillStyle = `rgba(239, 68, 68, ${tintAlpha})`
    ctx.fillRect(0, 0, cw, ch)
  }
}


export const renderBoundaryText = (ctx, cw, ch, warningLevel, dangerLevel, gameTime) => {
  if (dangerLevel <= 0 && warningLevel <= 0.3) return

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (dangerLevel > 0) {
    const pulse = 0.7 + 0.3 * Math.sin(gameTime / 250)

    let text, fontSize, primaryAlpha
    if (dangerLevel === 1) {
      text = '⚠ 危险边界 — 受到伤害'
      fontSize = 22
      primaryAlpha = 0.85 * pulse
    } else if (dangerLevel === 2) {
      text = '⚠ 严重警告 — 伤害加重'
      fontSize = 28
      primaryAlpha = 0.9 * pulse
    } else {
      text = '⚠⚠ 致命边界！立即返回！⚠⚠'
      fontSize = 34
      primaryAlpha = 0.95 * (0.6 + 0.4 * Math.sin(gameTime / 180))
    }

    const textY = ch * 0.08
    ctx.font = `bold ${fontSize}px "Microsoft YaHei", sans-serif`
    ctx.shadowColor = '#dc2626'
    ctx.shadowBlur = 12

    ctx.lineWidth = 5
    ctx.strokeStyle = `rgba(127, 29, 29, ${primaryAlpha})`
    ctx.strokeText(text, cw / 2, textY)

    ctx.fillStyle = `rgba(254, 202, 202, ${primaryAlpha})`
    ctx.fillText(text, cw / 2, textY)
  } else if (warningLevel > 0.3) {
    const alpha = warningLevel * 0.6
    const text = '⚠ 接近边界'
    ctx.font = 'bold 16px "Microsoft YaHei", sans-serif'

    ctx.lineWidth = 3
    ctx.strokeStyle = `rgba(127, 29, 29, ${alpha})`
    ctx.strokeText(text, cw / 2, ch * 0.08)

    ctx.fillStyle = `rgba(252, 165, 165, ${alpha})`
    ctx.fillText(text, cw / 2, ch * 0.08)
  }

  ctx.restore()
}
