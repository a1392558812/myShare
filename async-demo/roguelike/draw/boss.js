


export const drawBossSprite = (ctx, x, y, enemy, gameTime) => {
  if (!enemy.isBoss) return

  switch (enemy.bossId) {
    case 'shadowAmalgam': drawShadowAmalgam(ctx, x, y, enemy, gameTime); break
    case 'infernoCore':    drawInfernoCore(ctx, x, y, enemy, gameTime); break
    case 'voidWeaver':     drawVoidWeaver(ctx, x, y, enemy, gameTime); break
  }
}


const drawShadowAmalgam = (ctx, x, y, b, gameTime) => {
  const r = b.size / 2
  const pulse = 1 + 0.05 * Math.sin(gameTime * 0.005)
  const isMaster = b.isCloneMaster
  const isClone = b.isClone

  ctx.save()

  
  if (isClone) {
    ctx.globalAlpha = 0.45
  }

  
  const flashOn = (b.hitFlash || 0) > 0
  const baseAlpha = ctx.globalAlpha

  
  const bodyColor = flashOn ? '#ffffff' : b.color
  const bodyColor2 = flashOn ? '#cccccc' : (b.color2 || '#1a0033')

  
  ctx.globalAlpha = baseAlpha * 0.3 * pulse
  ctx.fillStyle = bodyColor
  ctx.beginPath(); ctx.arc(x, y, r * 1.3 * pulse, 0, Math.PI * 2); ctx.fill()

  
  ctx.globalAlpha = baseAlpha
  ctx.fillStyle = bodyColor
  ctx.beginPath(); ctx.arc(x - r * 0.1, y - r * 0.05, r * 0.9, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = bodyColor2
  ctx.beginPath(); ctx.arc(x + r * 0.15, y + r * 0.1, r * 0.75, 0, Math.PI * 2); ctx.fill()

  
  ctx.globalAlpha = baseAlpha * 0.9 * pulse
  ctx.fillStyle = '#a855f7'
  ctx.beginPath(); ctx.arc(x, y, r * 0.35, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#e9d5ff'
  ctx.beginPath(); ctx.arc(x, y, r * 0.15, 0, Math.PI * 2); ctx.fill()

  
  if (isMaster && !isClone) {
    ctx.globalAlpha = baseAlpha * (0.3 + 0.1 * Math.sin(gameTime * 0.008))
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2); ctx.stroke()
  }

  
  if (b.isFrenzied) {
    ctx.globalAlpha = baseAlpha * (0.25 + 0.1 * Math.sin(gameTime * 0.02))
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.arc(x, y, r + 8, 0, Math.PI * 2); ctx.stroke()
  }

  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i + gameTime * 0.002 * (i + 1)
    const dist = r * (0.8 + 0.15 * Math.sin(gameTime * 0.004 + i))
    const px = x + Math.cos(angle) * dist
    const py = y + Math.sin(angle) * dist
    ctx.globalAlpha = baseAlpha * (0.5 + 0.3 * Math.sin(gameTime * 0.006 + i))
    ctx.fillStyle = i % 2 === 0 ? '#7c3aed' : '#4b0082'
    ctx.beginPath(); ctx.arc(px, py, 2.5 + Math.sin(gameTime * 0.01 + i) * 1, 0, Math.PI * 2); ctx.fill()
  }

  ctx.restore()
}


const drawInfernoCore = (ctx, x, y, b, gameTime) => {
  const r = b.size / 2
  const pulse = 1 + 0.06 * Math.sin(gameTime * 0.006)
  const flashOn = (b.hitFlash || 0) > 0

  ctx.save()
  const baseColor = flashOn ? '#ffffff' : b.color
  const baseColor2 = flashOn ? '#ffcccc' : (b.color2 || '#ea580c')

  
  ctx.globalAlpha = 0.3 * pulse
  ctx.fillStyle = baseColor
  ctx.beginPath(); ctx.arc(x, y, r * 1.4 * pulse, 0, Math.PI * 2); ctx.fill()

  
  ctx.globalAlpha = 0.9
  const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, r)
  coreGrad.addColorStop(0, '#ffee00')
  coreGrad.addColorStop(0.3, baseColor)
  coreGrad.addColorStop(0.7, baseColor2)
  coreGrad.addColorStop(1, '#7c2d12')
  ctx.fillStyle = coreGrad
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()

  
  ctx.globalAlpha = 0.6 * pulse
  ctx.strokeStyle = baseColor
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.arc(x, y, r * 0.85, 0, Math.PI * 2); ctx.stroke()

  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(x, y, r * 0.95, gameTime * 0.004, gameTime * 0.004 + Math.PI * 1.5); ctx.stroke()

  
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 / 8) * i + gameTime * 0.003
    const dist = r * (0.9 + 0.15 * Math.sin(gameTime * 0.005 + i))
    const px = x + Math.cos(angle) * dist
    const py = y + Math.sin(angle) * dist
    ctx.globalAlpha = 0.5 + 0.3 * Math.sin(gameTime * 0.008 + i * 2)
    ctx.fillStyle = i % 3 === 0 ? '#ffee00' : (i % 3 === 1 ? '#f97316' : '#dc2626')
    const ps = 2 + Math.sin(gameTime * 0.01 + i) * 1.5
    ctx.beginPath(); ctx.arc(px, py, ps, 0, Math.PI * 2); ctx.fill()
  }

  
  ctx.globalAlpha = 0.85
  ctx.fillStyle = '#ffffff'
  ctx.beginPath(); ctx.arc(x, y, r * 0.2, 0, Math.PI * 2); ctx.fill()

  ctx.restore()
}


const drawVoidWeaver = (ctx, x, y, b, gameTime) => {
  const r = b.size / 2
  const pulse = 1 + 0.04 * Math.sin(gameTime * 0.007)
  const flashOn = (b.hitFlash || 0) > 0

  ctx.save()
  const baseColor = flashOn ? '#ffffff' : b.color
  const baseColor2 = flashOn ? '#eeeeff' : (b.color2 || '#7c3aed')

  
  ctx.globalAlpha = 0.25 * pulse
  ctx.fillStyle = baseColor
  ctx.beginPath(); ctx.arc(x, y, r * 1.5 * pulse, 0, Math.PI * 2); ctx.fill()

  
  ctx.globalAlpha = 0.85
  const rotAngle = gameTime * 0.002
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotAngle)

  ctx.fillStyle = baseColor
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.8)
  ctx.lineTo(r * 0.6, 0)
  ctx.lineTo(0, r * 0.8)
  ctx.lineTo(-r * 0.6, 0)
  ctx.closePath()
  ctx.fill()

  
  ctx.fillStyle = baseColor2
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.4)
  ctx.lineTo(r * 0.3, 0)
  ctx.lineTo(0, r * 0.4)
  ctx.lineTo(-r * 0.3, 0)
  ctx.closePath()
  ctx.fill()

  ctx.restore()

  
  ctx.globalAlpha = 0.5 * pulse
  ctx.strokeStyle = '#e9d5ff'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(x, y, r * 0.7, 0, Math.PI * 2); ctx.stroke()

  ctx.strokeStyle = baseColor
  ctx.lineWidth = 1.2
  ctx.setLineDash([6, 4])
  ctx.beginPath(); ctx.arc(x, y, r * 0.9, gameTime * 0.003, gameTime * 0.003 + Math.PI * 1.8); ctx.stroke()
  ctx.setLineDash([])

  
  ctx.globalAlpha = 0.9 * pulse
  ctx.fillStyle = '#ffffff'
  ctx.beginPath(); ctx.arc(x, y, r * 0.12, 0, Math.PI * 2); ctx.fill()

  
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI * 2 / 4) * i + gameTime * 0.003 * (i % 2 === 0 ? 1 : -1)
    const dist = r * (0.9 + 0.2 * Math.sin(gameTime * 0.005 + i * 1.5))
    const px = x + Math.cos(angle) * dist
    const py = y + Math.sin(angle) * dist
    ctx.globalAlpha = 0.4 + 0.3 * Math.sin(gameTime * 0.007 + i)
    ctx.fillStyle = i % 2 === 0 ? '#c084fc' : '#a855f7'
    const ps = 2.5 + Math.sin(gameTime * 0.012 + i) * 1
    ctx.beginPath(); ctx.arc(px, py, ps, 0, Math.PI * 2); ctx.fill()
  }

  ctx.restore()
}


export const drawVoidLines = (ctx, voidLines, toScreen, gameTime) => {
  ctx.save()
  voidLines.forEach(v => {
    const progress = v.elapsed / v.duration
    const alpha = 0.7 * (1 - progress * 0.6)

    const p1a = toScreen(v.l1.x1, v.l1.y1, ctx)
    const p1b = toScreen(v.l1.x2, v.l1.y2, ctx)
    const p2a = toScreen(v.l2.x1, v.l2.y1, ctx)
    const p2b = toScreen(v.l2.x2, v.l2.y2, ctx)

    
    ctx.globalAlpha = alpha * 0.15
    ctx.fillStyle = '#a855f7'
    ctx.beginPath()
    ctx.moveTo(p1a.x, p1a.y)
    ctx.lineTo(p1b.x, p1b.y)
    ctx.lineTo(p2b.x, p2b.y)
    ctx.lineTo(p2a.x, p2a.y)
    ctx.closePath()
    ctx.fill()

    
    ctx.globalAlpha = alpha * 0.8
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 3
    ctx.shadowColor = '#a855f7'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.moveTo(p1a.x, p1a.y)
    ctx.lineTo(p1b.x, p1b.y)
    ctx.stroke()

    
    ctx.beginPath()
    ctx.moveTo(p2a.x, p2a.y)
    ctx.lineTo(p2b.x, p2b.y)
    ctx.stroke()

    ctx.shadowBlur = 0
  })
  ctx.restore()
}


export const drawSlowFields = (ctx, slowFields, toScreen, gameTime) => {
  ctx.save()
  slowFields.forEach(s => {
    const pos = toScreen(s.x, s.y, ctx)
    const progress = s.elapsed / s.duration
    const pulse = 1 + 0.05 * Math.sin(gameTime * 0.01)

    
    ctx.globalAlpha = 0.2 * (1 - progress * 0.5)
    ctx.fillStyle = 'rgba(168, 85, 247, 0.3)'
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, s.radius * pulse, 0, Math.PI * 2)
    ctx.fill()

    
    ctx.globalAlpha = 0.4 * (1 - progress * 0.5)
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 4])
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, s.radius * pulse, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  })
  ctx.restore()
}
