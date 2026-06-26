
export function renderMagicCircles(ctx, circles, now, toScreen) {
  if (!circles) return

  circles.value.forEach(circle => {
    const pos = toScreen(circle.x, circle.y, ctx)
    const progress = circle.elapsed / circle.duration
    const alpha = 1 - progress * 0.35
    const pulse = 1 + 0.03 * Math.sin(now / 150)
    const vr = circle.radius * pulse
    const dissolve = progress > 0.7 ? (1 - progress) / 0.3 : 1

    ctx.save()
    ctx.globalAlpha = alpha * dissolve

    
    const burnGrad = ctx.createRadialGradient(pos.x, pos.y, vr * 0.25, pos.x, pos.y, vr * 1.05)
    burnGrad.addColorStop(0, 'rgba(255, 45, 0, 0.22)')
    burnGrad.addColorStop(0.55, 'rgba(255, 85, 10, 0.10)')
    burnGrad.addColorStop(1, 'rgba(255, 120, 20, 0)')
    ctx.fillStyle = burnGrad
    ctx.shadowBlur = 0
    ctx.beginPath(); ctx.arc(pos.x, pos.y, vr * 1.05, 0, Math.PI * 2); ctx.fill()

    
    ctx.strokeStyle = 'rgba(255, 102, 34, 0.75)'
    ctx.lineWidth = 2.5 * dissolve
    ctx.shadowColor = '#FF4400'
    ctx.shadowBlur = 22 * dissolve
    ctx.beginPath(); ctx.arc(pos.x, pos.y, vr, 0, Math.PI * 2); ctx.stroke()

    
    ctx.strokeStyle = 'rgba(255, 200, 55, 0.3)'
    ctx.lineWidth = 1.5
    ctx.shadowColor = '#FFAA33'
    ctx.shadowBlur = 12
    ctx.beginPath(); ctx.arc(pos.x, pos.y, vr * 0.72, 0, Math.PI * 2); ctx.stroke()

    
    const arcRot = now / 600
    ctx.strokeStyle = 'rgba(255, 160, 30, 0.6)'
    ctx.lineWidth = 2.8
    ctx.shadowColor = '#FF8822'
    ctx.shadowBlur = 14
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, vr * 0.98, arcRot, arcRot + Math.PI * 1.2)
    ctx.stroke()

    
    ctx.strokeStyle = 'rgba(255, 200, 60, 0.45)'
    ctx.lineWidth = 2
    ctx.shadowColor = '#FFAA44'
    ctx.shadowBlur = 8
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, vr * 0.74, -arcRot * 0.7, -arcRot * 0.7 + Math.PI * 1.0)
    ctx.stroke()

    
    const coreSize = vr * 0.14 * (1 + 0.35 * Math.sin(now * 0.0035 * Math.PI * 2))
    const coreGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, coreSize * 2.5)
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
    coreGrad.addColorStop(0.35, 'rgba(255, 210, 80, 0.5)')
    coreGrad.addColorStop(1, 'rgba(255, 100, 20, 0)')
    ctx.fillStyle = coreGrad
    ctx.shadowColor = '#FFFFFF'
    ctx.shadowBlur = 16
    ctx.beginPath(); ctx.arc(pos.x, pos.y, coreSize * 2.5, 0, Math.PI * 2); ctx.fill()

    
    const runeRot = now / 1800 * Math.PI * 2
    const shapes = ['triangle', 'diamond', 'circle', 'cross']
    for (let r = 0; r < 8; r++) {
      const ra = runeRot + r * Math.PI / 4
      const rx = pos.x + Math.cos(ra) * vr * 0.86
      const ry = pos.y + Math.sin(ra) * vr * 0.86
      const rise = 1 + Math.sin(now * 0.002 + r) * 0.12
      const swing = Math.sin(now * 0.003 + r * 0.7) * 3
      ctx.save()
      ctx.translate(rx, ry + swing)
      ctx.scale(rise, rise)
      ctx.globalAlpha = 0.6 + 0.2 * Math.sin(now * 0.004 + r)
      ctx.fillStyle = 'rgba(255, 210, 60, 0.8)'
      ctx.shadowColor = '#FFAA33'
      ctx.shadowBlur = 6
      ctx.lineWidth = 1.2
      ctx.strokeStyle = 'rgba(255, 240, 150, 0.5)'

      const shape = shapes[r % 4]
      if (shape === 'triangle') {
        ctx.beginPath()
        ctx.moveTo(0, -3.5); ctx.lineTo(3, 2); ctx.lineTo(-3, 2)
        ctx.closePath(); ctx.fill(); ctx.stroke()
      } else if (shape === 'diamond') {
        ctx.beginPath()
        ctx.moveTo(0, -3); ctx.lineTo(2.5, 0)
        ctx.lineTo(0, 3); ctx.lineTo(-2.5, 0)
        ctx.closePath(); ctx.fill(); ctx.stroke()
      } else if (shape === 'circle') {
        ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2)
        ctx.fill(); ctx.stroke()
      } else if (shape === 'cross') {
        ctx.beginPath()
        ctx.moveTo(-0.8, -3.5); ctx.lineTo(0.8, -3.5)
        ctx.lineTo(0.8, -0.8); ctx.lineTo(3.5, -0.8)
        ctx.lineTo(3.5, 0.8); ctx.lineTo(0.8, 0.8)
        ctx.lineTo(0.8, 3.5); ctx.lineTo(-0.8, 3.5)
        ctx.lineTo(-0.8, 0.8); ctx.lineTo(-3.5, 0.8)
        ctx.lineTo(-3.5, -0.8); ctx.lineTo(-0.8, -0.8)
        ctx.closePath(); ctx.fill(); ctx.stroke()
      }
      ctx.restore()
    }

    
    if (progress > 0.7) {
      const dissProgress = (progress - 0.7) / 0.3
      
      ctx.globalAlpha = (1 - dissProgress) * 0.5
      ctx.strokeStyle = '#FF7722'
      ctx.lineWidth = 3 * (1 - dissProgress)
      ctx.shadowColor = '#FF4400'
      ctx.shadowBlur = 16 * (1 - dissProgress)
      ctx.beginPath(); ctx.arc(pos.x, pos.y, vr * (1 + dissProgress * 1.2), 0, Math.PI * 2); ctx.stroke()

      
      for (let p = 0; p < 12; p++) {
        const pa = p * Math.PI / 6 + dissProgress * 2.5
        const pd = vr * (0.7 + dissProgress * 1.6)
        const px = pos.x + Math.cos(pa) * pd
        const py = pos.y + Math.sin(pa) * pd
        ctx.globalAlpha = (1 - dissProgress) * (0.3 + 0.15 * Math.sin(p * 2.3))
        ctx.fillStyle = p % 3 === 0 ? '#FFEE44' : (p % 3 === 1 ? '#FF9922' : '#EE3311')
        ctx.shadowBlur = 4
        ctx.beginPath(); ctx.arc(px, py, 1.8 * (1 - dissProgress), 0, Math.PI * 2); ctx.fill()
      }
    }

    ctx.restore()
  })
}
