


export const renderDeathZones = (ctx, events, toScreen, gameTime) => {
  events.forEach(e => {
    if (e.type !== 'deathZone') return
    const pos = toScreen(e.x, e.y, ctx)
    const r = e.zoneRadius || 80

    
    ctx.save()
    ctx.globalAlpha = 0.25 + 0.05 * Math.sin(gameTime / 800)
    ctx.fillStyle = '#991b1b'
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
    ctx.fill()

    
    ctx.globalAlpha = 0.5 + 0.15 * Math.sin(gameTime / 600)
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()

    
    ctx.save()
    ctx.globalAlpha = 0.7
    ctx.font = `${r * 0.6}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('💀', pos.x, pos.y)
    ctx.restore()
  })
}


export const renderLightningQuadrants = (ctx, events, toScreen, gameTime, cw, ch) => {
  const lightningEvents = events.filter(e => e.type === 'lightningQuadrants')
  if (lightningEvents.length === 0) return

  const event = lightningEvents[0]
  const originScreen = toScreen(0, 0, ctx)
  const ox = originScreen.x
  const oy = originScreen.y

  const quadrants = [
    { q: 1, x: ox, y: 0, w: Math.max(0, cw - ox), h: Math.max(0, oy) },
    { q: 2, x: 0, y: 0, w: Math.max(0, ox), h: Math.max(0, oy) },
    { q: 3, x: 0, y: oy, w: Math.max(0, ox), h: Math.max(0, ch - oy) },
    { q: 4, x: ox, y: oy, w: Math.max(0, cw - ox), h: Math.max(0, ch - oy) },
  ]

  const isActive = (q) => {
    if (event.currentGroup === 'AC') return q === 1 || q === 3
    if (event.currentGroup === 'BD') return q === 2 || q === 4
    return false
  }

  const isWarning = (q) => {
    if (!event.warning) return false
    if (event.nextGroup === 'AC') return q === 1 || q === 3
    if (event.nextGroup === 'BD') return q === 2 || q === 4
    return false
  }

  quadrants.forEach(rect => {
    if (rect.w <= 0 || rect.h <= 0) return

    const active = isActive(rect.q)
    const warning = isWarning(rect.q)

    if (active) {
      const pulseAlpha = 0.12 + 0.05 * Math.sin(gameTime / 150)
      ctx.save()
      ctx.fillStyle = '#facc15'
      ctx.globalAlpha = pulseAlpha
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
      ctx.restore()

      const boltCount = 3
      for (let i = 0; i < boltCount; i++) {
        const seed = (rect.q * 1000 + i * 37 + Math.floor(gameTime / 100)) % 100
        const bx = rect.x + (seed / 100) * rect.w
        const by = rect.y + ((seed * 7) % 100) / 100 * rect.h
        const boltLen = 30 + (seed % 20)

        ctx.save()
        ctx.globalAlpha = 0.6 + 0.3 * Math.sin(gameTime / 80 + i)
        ctx.strokeStyle = '#fef08a'
        ctx.lineWidth = 2
        ctx.shadowColor = '#facc15'
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.moveTo(bx, by)
        ctx.lineTo(bx + 5, by + boltLen * 0.3)
        ctx.lineTo(bx - 3, by + boltLen * 0.6)
        ctx.lineTo(bx + 2, by + boltLen)
        ctx.stroke()
        ctx.restore()
      }
    } else if (warning) {
      const warnAlpha = 0.08 + 0.06 * Math.sin(gameTime / 100)
      ctx.save()
      ctx.fillStyle = '#f97316'
      ctx.globalAlpha = warnAlpha
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
      ctx.restore()

      ctx.save()
      ctx.globalAlpha = 0.5 + 0.3 * Math.sin(gameTime / 120)
      ctx.strokeStyle = '#fb923c'
      ctx.lineWidth = 3
      ctx.setLineDash([10, 8])
      ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4)
      ctx.restore()
    }
  })

  ctx.save()
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)'
  ctx.lineWidth = 1
  ctx.setLineDash([6, 6])
  ctx.beginPath()
  ctx.moveTo(0, oy)
  ctx.lineTo(cw, oy)
  ctx.moveTo(ox, 0)
  ctx.lineTo(ox, ch)
  ctx.stroke()
  ctx.restore()

  const labelY = 30
  ctx.save()
  ctx.font = '14px monospace'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fde047'
  ctx.shadowColor = 'rgba(0,0,0,0.8)'
  ctx.shadowBlur = 4
  ctx.fillText(`⚡ 电牢 ${(event.remaining / 1000).toFixed(0)}s`, cw / 2, labelY)

  const groupLabel = event.currentGroup === 'AC' ? '1/3 象限' : '2/4 象限'
  const warnLabel = event.warning ? ` (预警: ${event.nextGroup === 'AC' ? '1/3' : '2/4'})` : ''
  ctx.font = '12px monospace'
  ctx.fillStyle = '#fef9c3'
  ctx.fillText(`当前: ${groupLabel}${warnLabel}`, cw / 2, labelY + 20)
  ctx.restore()
}


export const renderEvents = (ctx, events, toScreen, gameTime, cw, ch) => {
  events.forEach(e => {
    if (e.type === 'deathZone' || e.type === 'lightningQuadrants' || e.activated) return
    const pos = toScreen(e.x, e.y, ctx)
    if (pos.x < -60 || pos.x > cw + 60 || pos.y < -60 || pos.y > ch + 60) return

    const cfg = e.config || {}

    
    const pulseAlpha = 0.3 + 0.1 * Math.sin(gameTime / 400 + e.id % 100)
    ctx.save()
    ctx.globalAlpha = pulseAlpha
    ctx.fillStyle = cfg.color || '#f59e0b'
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 32, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    
    ctx.save()
    ctx.strokeStyle = cfg.color || '#f59e0b'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2)
    ctx.stroke()

    
    if (e.remaining > 0 && e.duration > 0 && e.duration !== Infinity) {
      const ratio = e.remaining / e.duration
      ctx.strokeStyle = cfg.color2 || cfg.color || '#f59e0b'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio)
      ctx.stroke()
    }
    ctx.restore()

    
    ctx.save()
    ctx.font = '26px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(cfg.icon || '❓', pos.x, pos.y - 2)
    ctx.restore()

    
    const isCursed = e.type === 'cursedStele'
    ctx.save()
    ctx.font = '11px monospace'
    ctx.textAlign = 'center'
    ctx.fillStyle = isCursed ? '#c4b5fd' : '#f8fafc'
    ctx.shadowColor = isCursed ? 'rgba(124,58,237,0.8)' : 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 3
    ctx.fillText(cfg.name || '', pos.x, pos.y + 42)
    ctx.restore()
  })
}
