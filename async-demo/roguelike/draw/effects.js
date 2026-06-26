import { ENTITY_SIZE } from '../constants.js'

export const renderEffect = (ctx, e, toScreen) => {
  const pos = toScreen(e.x, e.y, ctx)
  const progress = e.elapsed / e.duration
  ctx.save()
  if (e.type === 'meleeSlash') {
    
    const visualRadius = e.radius + ENTITY_SIZE / 2
    ctx.globalAlpha = 0.10 * (1 - progress)
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(pos.x, pos.y, visualRadius, 0, Math.PI * 2); ctx.stroke()
    
    ctx.globalAlpha = 1 - progress
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4
    ctx.beginPath(); ctx.arc(pos.x, pos.y, e.radius, e.angle - Math.PI / 3, e.angle + Math.PI / 3); ctx.stroke()
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(pos.x, pos.y, e.radius * 0.7, e.angle - Math.PI / 4, e.angle + Math.PI / 4); ctx.stroke()
  } else if (e.type === 'freezeCircle') {
    const radius = e.radius * (0.3 + progress * 0.7)
    ctx.globalAlpha = 0.6 * (1 - progress)
    ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = 'rgba(147, 197, 253, 0.15)'
    ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2); ctx.fill()
  } else if (e.type === 'magicFireball') {
    
    const r = e.radius * (0.2 + progress * 0.8)
    const fade = 1 - progress
    const pulse = 1 + 0.04 * Math.sin(e.elapsed * 0.015)
    ctx.save()

    
    if (progress < 0.18) {
      ctx.globalAlpha = (1 - progress / 0.18) * 0.75
      ctx.fillStyle = '#FFFFFF'
      ctx.shadowColor = '#FFFFFF'
      ctx.shadowBlur = 20
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * (1.5 + progress * 2), 0, Math.PI * 2); ctx.fill()
    }

    
    ctx.globalAlpha = fade * 0.28 * pulse
    ctx.shadowColor = '#FF4400'
    ctx.shadowBlur = 20
    const outerGrad = ctx.createRadialGradient(
      pos.x, pos.y, r * 0.4 * pulse,
      pos.x, pos.y, r * 2 * (1 + progress * 0.3) * pulse
    )
    outerGrad.addColorStop(0, 'rgba(255, 180, 20, 0.65)')
    outerGrad.addColorStop(0.5, 'rgba(255, 80, 10, 0.28)')
    outerGrad.addColorStop(1, 'rgba(255, 20, 0, 0)')
    ctx.fillStyle = outerGrad
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 2 * (1 + progress * 0.3) * pulse, 0, Math.PI * 2); ctx.fill()

    
    ctx.globalAlpha = fade * 0.75
    ctx.shadowColor = '#FF6600'
    ctx.shadowBlur = 16
    const midGrad = ctx.createRadialGradient(
      pos.x - r * 0.18, pos.y - r * 0.25, r * 0.08,
      pos.x, pos.y, r * 1.8 * pulse
    )
    midGrad.addColorStop(0, '#FFF5CC')
    midGrad.addColorStop(0.25, '#FFCC44')
    midGrad.addColorStop(0.55, '#FF7722')
    midGrad.addColorStop(0.85, '#CC3300')
    midGrad.addColorStop(1, 'rgba(160, 20, 0, 0)')
    ctx.fillStyle = midGrad
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 1.8 * pulse, 0, Math.PI * 2); ctx.fill()

    
    ctx.globalAlpha = fade * 0.95
    const coreGrad = ctx.createRadialGradient(
      pos.x, pos.y, 0,
      pos.x, pos.y, r * pulse
    )
    coreGrad.addColorStop(0, '#FFFFFF')
    coreGrad.addColorStop(0.25, '#FFEE88')
    coreGrad.addColorStop(0.7, '#FF9922')
    coreGrad.addColorStop(1, 'rgba(255, 100, 20, 0)')
    ctx.fillStyle = coreGrad
    ctx.shadowColor = '#FF8800'
    ctx.shadowBlur = 8
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * pulse, 0, Math.PI * 2); ctx.fill()

    
    for (let i = 0; i < 5; i++) {
      const angle = Math.PI * 1.5 + (i - 2) * 0.35 + Math.sin(e.elapsed * 0.04 + i) * 0.18
      const sparkDist = r * (1.1 + 0.55 * Math.sin(e.elapsed * 0.06 + i * 2.1))
      const sx = pos.x + Math.cos(angle) * sparkDist
      const sy = pos.y + Math.sin(angle) * sparkDist
      ctx.globalAlpha = fade * (0.45 + 0.3 * Math.sin(e.elapsed * 0.06 + i))
      ctx.fillStyle = i % 2 === 0 ? '#FFEE44' : '#FFAA33'
      ctx.shadowColor = '#FF6600'
      ctx.shadowBlur = 3
      ctx.beginPath(); ctx.arc(sx, sy, 1.4 + Math.sin(e.elapsed * 0.07 + i) * 0.6, 0, Math.PI * 2); ctx.fill()
    }

    
    
    ctx.globalAlpha = fade * 0.45
    ctx.strokeStyle = '#FF7722'
    ctx.lineWidth = 3.5 * (1 - progress * 0.4)
    ctx.shadowColor = '#FF4400'
    ctx.shadowBlur = 10
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * (1.0 + progress * 3), 0, Math.PI * 2); ctx.stroke()

    
    ctx.globalAlpha = fade * 0.2
    ctx.strokeStyle = '#FFAA44'
    ctx.lineWidth = 2 * (1 - progress)
    ctx.shadowBlur = 6
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * (1.0 + progress * 2), 0, Math.PI * 2); ctx.stroke()

    
    const particleCount = 16
    for (let i = 0; i < particleCount; i++) {
      const pa = (i / particleCount) * Math.PI * 2 + progress * 1.8
      const pd = r * (1.0 + progress * 2.5 + Math.sin(i * 3.7) * 0.15)
      const px = pos.x + Math.cos(pa) * pd
      const py = pos.y + Math.sin(pa) * pd
      ctx.globalAlpha = fade * (0.5 - progress * 0.35)
      const colors = ['#FFEE44', '#FF9922', '#EE3311']
      ctx.fillStyle = colors[i % 3]
      ctx.shadowColor = '#FF6600'
      ctx.shadowBlur = 2
      const ps = 1.6 + Math.sin(i * 2.4) * 0.6
      ctx.beginPath(); ctx.arc(px, py, ps * (1 - progress * 0.5), 0, Math.PI * 2); ctx.fill()
    }

    
    ctx.globalAlpha = fade * 0.12
    const emberGrad = ctx.createRadialGradient(pos.x, pos.y, r * 0.3, pos.x, pos.y, r * 1.8)
    emberGrad.addColorStop(0, 'rgba(255, 100, 20, 0.5)')
    emberGrad.addColorStop(1, 'rgba(255, 40, 0, 0)')
    ctx.fillStyle = emberGrad
    ctx.shadowBlur = 0
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 1.8, 0, Math.PI * 2); ctx.fill()

    ctx.restore()
  } else if (e.type === 'explosion') {
    if (e.variant === 'sacrifice') {
      
      const r = e.radius * (0.2 + progress * 0.7)
      const fade = 1 - progress
      ctx.save()

      
      if (progress < 0.18) {
        const flashFade = 1 - progress / 0.18
        ctx.globalAlpha = flashFade
        ctx.fillStyle = '#FFFFFF'
        ctx.shadowColor = '#e9d5ff'
        ctx.shadowBlur = 16
        ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.55, 0, Math.PI * 2); ctx.fill()
      }

      
      ctx.globalAlpha = fade
      ctx.fillStyle = '#f3e8ff'
      ctx.shadowColor = '#a855f7'
      ctx.shadowBlur = 14
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.28, 0, Math.PI * 2); ctx.fill()

      
      ctx.globalAlpha = fade * 0.7
      ctx.strokeStyle = e.color || '#7e22ce'
      ctx.lineWidth = 3.5 * fade + 0.5
      ctx.shadowColor = e.color || '#7e22ce'
      ctx.shadowBlur = 10
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.stroke()

      
      ctx.globalAlpha = fade * 0.35
      ctx.lineWidth = 1.5 * fade
      ctx.shadowBlur = 6
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * (0.6 + progress * 0.4), 0, Math.PI * 2); ctx.stroke()

      
      ctx.globalAlpha = fade * 0.85
      ctx.fillStyle = e.color || '#7e22ce'
      ctx.shadowBlur = 0
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.42, 0, Math.PI * 2); ctx.fill()

      
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i + progress * 1.8
        const dist = r * (0.5 + progress * 0.6)
        const px = pos.x + Math.cos(angle) * dist
        const py = pos.y + Math.sin(angle) * dist
        ctx.globalAlpha = fade
        ctx.fillStyle = i % 2 === 0 ? '#e9d5ff' : '#c084fc'
        ctx.shadowColor = '#a855f7'
        ctx.shadowBlur = 6
        ctx.beginPath(); ctx.arc(px, py, 2.2 * fade + 0.5, 0, Math.PI * 2); ctx.fill()
      }

      ctx.restore()
    } else {
      
      const r = e.radius * (0.3 + progress * 1.0)
      const fade = 1 - progress
      ctx.save()

      
      ctx.globalAlpha = fade * 0.8
      ctx.fillStyle = '#FFFFFF'
      ctx.shadowColor = '#FFFFFF'
      ctx.shadowBlur = 15
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.3, 0, Math.PI * 2); ctx.fill()

      
      ctx.globalAlpha = fade * 0.5
      ctx.strokeStyle = e.color || '#f59e0b'
      ctx.lineWidth = 4 * fade
      ctx.shadowColor = e.color || '#f59e0b'
      ctx.shadowBlur = 10
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.stroke()

      
      ctx.globalAlpha = fade * 0.6
      ctx.fillStyle = e.color || '#f59e0b'
      ctx.shadowBlur = 0
      ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.5, 0, Math.PI * 2); ctx.fill()

      
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + progress * 2
        const dist = r * (0.6 + progress * 0.6)
        const px = pos.x + Math.cos(angle) * dist
        const py = pos.y + Math.sin(angle) * dist
        ctx.globalAlpha = fade * 0.7
        ctx.fillStyle = i % 2 === 0 ? '#fbbf24' : '#ef4444'
        ctx.beginPath(); ctx.arc(px, py, 2 * fade, 0, Math.PI * 2); ctx.fill()
      }

      ctx.restore()
    }
  } else if (e.type === 'venomWarn') {
    renderVenomWarn(ctx, e, toScreen)
  } else if (e.type === 'bossDeathExplosion') {
    renderBossDeathExplosion(ctx, e, toScreen)
  } else if (e.type === 'bossSlamWarn') {
    renderBossSlamWarn(ctx, e, toScreen)
  } else if (e.type === 'bossSlamHit') {
    renderBossSlamHit(ctx, e, toScreen)
  } else if (e.type === 'shadowWave') {
    renderShadowWave(ctx, e, toScreen)
  } else if (e.type === 'bossSpawnAnim') {
    renderBossSpawnAnim(ctx, e, toScreen)
  } else if (e.type === 'phaseTransition') {
    renderPhaseTransition(ctx, e, toScreen)
  } else if (e.type === 'firePillarWarn') {
    renderFirePillarWarn(ctx, e, toScreen)
  } else if (e.type === 'voidTeleportOut' || e.type === 'voidTeleportIn') {
    renderVoidTeleport(ctx, e, toScreen)
  } else if (e.type === 'screenShake') {
    
  } else if (e.type === 'dashTrail') {
    const fade = 1 - progress
    ctx.globalAlpha = fade * 0.35
    ctx.fillStyle = '#60a5fa'
    const size = ENTITY_SIZE * (0.5 + fade * 0.5)
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#93c5fd'
    ctx.lineWidth = 2
    ctx.globalAlpha = fade * 0.6
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, size / 2 + 3, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.restore()
}


export const renderGroundZones = (ctx, zones, toScreen) => {
  zones.forEach(z => {
    const pos = toScreen(z.x, z.y, ctx)
    const progress = z.elapsed / z.duration
    ctx.save()

    
    ctx.globalAlpha = 0.35 * (1 - progress * 0.3) 
    ctx.fillStyle = 'rgba(20, 100, 20, 0.4)'
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, z.radius, 0, Math.PI * 2)
    ctx.fill()

    
    ctx.strokeStyle = `rgba(74, 222, 128, ${0.6 * (1 - progress * 0.4)})`
    ctx.lineWidth = 2 + Math.sin(z.elapsed * 0.008) * 1.5
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, z.radius, 0, Math.PI * 2)
    ctx.stroke()

    
    const particleCount = 5
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + z.elapsed * 0.003
      const dist = z.radius * 0.5 * Math.sin(z.elapsed * 0.005 + i)
      const px = pos.x + Math.cos(angle) * dist
      const py = pos.y + Math.sin(angle) * dist
      ctx.globalAlpha = 0.3 + 0.2 * Math.sin(z.elapsed * 0.008 + i)
      ctx.fillStyle = '#4ade80'
      ctx.beginPath()
      ctx.arc(px, py, 2 + Math.sin(z.elapsed * 0.01 + i), 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  })
}


export const renderVenomWarn = (ctx, e, toScreen) => {
  const pos = toScreen(e.x, e.y, ctx)
  const progress = e.elapsed / e.duration
  ctx.save()

  
  const pulse = 1 + 0.3 * Math.sin(progress * Math.PI * 6) 
  ctx.globalAlpha = 0.5 * (1 - progress * 0.3)
  ctx.strokeStyle = `rgba(139, 92, 246, ${0.7 * (1 - progress * 0.5)})`
  ctx.lineWidth = 2 + progress * 3 
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.arc(pos.x, pos.y, e.radius * pulse, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  
  ctx.globalAlpha = 0.2 * (1 - progress * 0.5)
  ctx.fillStyle = 'rgba(139, 92, 246, 0.3)'
  ctx.beginPath()
  ctx.arc(pos.x, pos.y, e.radius, 0, Math.PI * 2)
  ctx.fill()

  
  ctx.globalAlpha = 0.8
  ctx.font = '16px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('\u2620\uFE0F', pos.x, pos.y)

  ctx.restore()
}


const renderBossDeathExplosion = (ctx, e, toScreen) => {
  const pos = toScreen(e.x, e.y, ctx)
  const progress = e.elapsed / e.duration
  const r = e.radius * (0.2 + progress * 1.5)
  const fade = 1 - progress
  ctx.save()

  
  if (progress < 0.2) {
    ctx.globalAlpha = (1 - progress / 0.2) * 0.9
    ctx.fillStyle = '#FFFFFF'
    ctx.shadowColor = '#FFFFFF'
    ctx.shadowBlur = 30
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.6, 0, Math.PI * 2); ctx.fill()
  }

  
  ctx.globalAlpha = fade * 0.6
  ctx.strokeStyle = e.color || '#a855f7'
  ctx.lineWidth = 8 * fade + 2
  ctx.shadowColor = e.color
  ctx.shadowBlur = 20
  ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.stroke()

  
  ctx.globalAlpha = fade * 0.35
  ctx.lineWidth = 4 * fade
  ctx.shadowBlur = 12
  ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 0.7, 0, Math.PI * 2); ctx.stroke()

  
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 / 20) * i + progress * 3
    const dist = r * (0.5 + progress * 1.2)
    const px = pos.x + Math.cos(angle) * dist
    const py = pos.y + Math.sin(angle) * dist
    ctx.globalAlpha = fade * 0.7
    ctx.fillStyle = i % 3 === 0 ? '#FFFFFF' : (i % 3 === 1 ? (e.color || '#a855f7') : (e.color2 || '#7c3aed'))
    ctx.shadowColor = e.color
    ctx.shadowBlur = 4
    ctx.beginPath(); ctx.arc(px, py, 3 * fade + 1, 0, Math.PI * 2); ctx.fill()
  }

  ctx.shadowBlur = 0
  ctx.restore()
}


const renderBossSlamWarn = (ctx, e, toScreen) => {
  const pos = toScreen(e.x, e.y, ctx)
  const progress = e.elapsed / e.duration
  ctx.save()
  ctx.globalAlpha = 0.4 * (1 - progress)
  ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'
  
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
  const arcAngle = Math.PI / 3 * 2
  ctx.arc(pos.x, pos.y, e.radius, e.angle - arcAngle / 2, e.angle + arcAngle / 2)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}


const renderBossSlamHit = (ctx, e, toScreen) => {
  const pos = toScreen(e.x, e.y, ctx)
  const progress = e.elapsed / e.duration
  const fade = 1 - progress
  ctx.save()
  ctx.globalAlpha = fade * 0.7
  ctx.strokeStyle = '#fbbf24'
  ctx.lineWidth = 5 * fade + 1
  ctx.beginPath()
  const arcAngle = Math.PI / 3 * 2
  ctx.arc(pos.x, pos.y, e.radius, e.angle - arcAngle / 2, e.angle + arcAngle / 2)
  ctx.stroke()
  ctx.restore()
}


const renderShadowWave = (ctx, e, toScreen) => {
  const pos = toScreen(e.x, e.y, ctx)
  const progress = e.elapsed / e.duration
  const radius = e.radius + progress * (e.maxRadius - e.radius)
  ctx.save()
  ctx.globalAlpha = 0.5 * (1 - progress)
  ctx.strokeStyle = e.color || '#4b0082'
  ctx.lineWidth = 3 * (1 - progress) + 1
  ctx.shadowColor = '#a855f7'
  ctx.shadowBlur = 6
  ctx.beginPath()
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.restore()

  
  if (e.playerRef) {
    const pdist = Math.sqrt((e.playerRef.x - e.x) ** 2 + (e.playerRef.y - e.y) ** 2)
    if (Math.abs(pdist - radius) < 10 && progress < 0.9) {
      if (!e._lastHit || Date.now() - e._lastHit > 500) {
        e._lastHit = Date.now()
        
      }
    }
  }
}


const renderBossSpawnAnim = (ctx, e, toScreen) => {
  const pos = toScreen(e.x, e.y, ctx)
  const progress = e.elapsed / e.duration
  const fade = 1 - progress
  ctx.save()

  
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 / 12) * i
    const startDist = e.radius * 2
    const endDist = e.radius * 0.3
    const dist = startDist + (endDist - startDist) * progress
    const px = pos.x + Math.cos(angle) * dist
    const py = pos.y + Math.sin(angle) * dist
    ctx.globalAlpha = 0.6 * fade + 0.3
    ctx.fillStyle = i % 2 === 0 ? (e.color || '#a855f7') : (e.color2 || '#7c3aed')
    ctx.shadowColor = e.color
    ctx.shadowBlur = 4
    ctx.beginPath(); ctx.arc(px, py, 3 * (1 - progress * 0.5) + 1, 0, Math.PI * 2); ctx.fill()
  }

  
  ctx.globalAlpha = 0.4 * fade
  ctx.fillStyle = e.color
  ctx.shadowBlur = 12
  ctx.beginPath(); ctx.arc(pos.x, pos.y, e.radius * 0.5 * (1 - fade + 0.2), 0, Math.PI * 2); ctx.fill()

  ctx.shadowBlur = 0
  ctx.restore()
}


const renderPhaseTransition = (ctx, e, toScreen) => {
  const pos = toScreen(e.x, e.y, ctx)
  const progress = e.elapsed / e.duration
  const fade = 1 - progress
  ctx.save()
  ctx.globalAlpha = 0.5 * fade
  ctx.strokeStyle = e.color
  ctx.lineWidth = 4 * fade + 1
  ctx.beginPath(); ctx.arc(pos.x, pos.y, e.radius * (1 + progress * 0.5), 0, Math.PI * 2); ctx.stroke()
  ctx.globalAlpha = 0.3 * fade
  ctx.fillStyle = e.color
  ctx.beginPath(); ctx.arc(pos.x, pos.y, e.radius * (1 + progress * 0.3), 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}


const renderFirePillarWarn = (ctx, e, toScreen) => {
  const pos = toScreen(e.x, e.y, ctx)
  const progress = e.elapsed / e.duration
  const pulse = 1 + 0.2 * Math.sin(progress * Math.PI * 8)
  ctx.save()
  ctx.globalAlpha = 0.6 * (1 - progress * 0.4)
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 3
  ctx.setLineDash([6, 3])
  ctx.beginPath(); ctx.arc(pos.x, pos.y, e.radius * pulse, 0, Math.PI * 2); ctx.stroke()
  ctx.setLineDash([])
  ctx.globalAlpha = 0.25 * (1 - progress)
  ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'
  ctx.beginPath(); ctx.arc(pos.x, pos.y, e.radius, 0, Math.PI * 2); ctx.fill()

  
  if (progress >= 0.95 && e.playerRef && !e._triggered) {
    e._triggered = true
    const pdist = Math.sqrt((e.playerRef.x - e.x) ** 2 + (e.playerRef.y - e.y) ** 2)
    if (pdist <= e.radius) {
      
    }
    
    e._eruptEffect = true
  }

  
  if (progress > 0.75) {
    const eruptFade = (progress - 0.75) / 0.25
    ctx.globalAlpha = eruptFade * 0.8
    const grad = ctx.createLinearGradient(pos.x, pos.y - e.radius * 2, pos.x, pos.y)
    grad.addColorStop(0, 'rgba(255, 100, 20, 0)')
    grad.addColorStop(0.5, 'rgba(255, 80, 10, 0.7)')
    grad.addColorStop(1, '#FFFFFF')
    ctx.fillStyle = grad
    ctx.beginPath(); ctx.arc(pos.x, pos.y, e.radius * (0.5 + eruptFade), 0, Math.PI * 2); ctx.fill()
  }

  ctx.restore()
}


const renderVoidTeleport = (ctx, e, toScreen) => {
  const pos = toScreen(e.x, e.y, ctx)
  const progress = e.elapsed / e.duration
  const isIn = e.type === 'voidTeleportIn'

  ctx.save()
  if (isIn) {
    
    const r = e.radius * progress
    ctx.globalAlpha = 0.6 * progress
    ctx.strokeStyle = e.color
    ctx.lineWidth = 3
    ctx.shadowColor = '#a855f7'
    ctx.shadowBlur = 10
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.stroke()
  } else {
    
    const fade = 1 - progress
    const r = e.radius * fade
    ctx.globalAlpha = 0.6 * fade
    ctx.strokeStyle = e.color
    ctx.lineWidth = 3
    ctx.shadowColor = '#a855f7'
    ctx.shadowBlur = 10
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.stroke()

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i
      const dist = e.radius * (1 - fade) * 1.5
      const px = pos.x + Math.cos(angle) * dist
      const py = pos.y + Math.sin(angle) * dist
      ctx.globalAlpha = fade * 0.6
      ctx.fillStyle = '#c084fc'
      ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill()
    }
  }
  ctx.shadowBlur = 0
  ctx.restore()
}
