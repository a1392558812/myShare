/**
 * 陷阱渲染
 * 当前支持类型：iceBubble（冰冻泡泡）
 */

export function renderTraps(ctx, traps, now, toScreen) {
  if (!traps) return

  traps.value.forEach(trap => {
    const pos = toScreen(trap.x, trap.y, ctx)
    const progress = trap.elapsed / trap.lifetime

    if (trap.type === 'iceBubble') {
      const fadeout = progress > 0.8 ? (1 - progress) / 0.2 : 1
      const pulse = 1 + 0.06 * Math.sin(now / 300)
      const vr = trap.radius * pulse

      ctx.save()
      ctx.globalAlpha = 0.75 * fadeout

      ctx.strokeStyle = '#93c5fd'
      ctx.lineWidth = 2
      ctx.shadowColor = '#60a5fa'
      ctx.shadowBlur = 12 * fadeout
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, vr, 0, Math.PI * 2)
      ctx.stroke()

      ctx.shadowBlur = 0
      const innerGrad = ctx.createRadialGradient(
        pos.x, pos.y, vr * 0.15,
        pos.x, pos.y, vr
      )
      innerGrad.addColorStop(0, 'rgba(147, 197, 253, 0.25)')
      innerGrad.addColorStop(0.6, 'rgba(147, 197, 253, 0.08)')
      innerGrad.addColorStop(1, 'rgba(147, 197, 253, 0)')
      ctx.fillStyle = innerGrad
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, vr, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = 0.4 * fadeout * (0.8 + 0.2 * Math.sin(now / 200))
      ctx.fillStyle = '#dbeafe'
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, vr * 0.25, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }
  })
}
