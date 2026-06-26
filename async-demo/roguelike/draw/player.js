import { ENTITY_SIZE, DIRECTION } from '../constants.js'

export const drawPlayerSprite = (ctx, sx, sy, direction, frame, flash, isInvincible = false, invincibleRemaining = 0, invincibleDuration = 0) => {
  const s = ENTITY_SIZE
  const half = s / 2
  ctx.save()
  ctx.translate(sx, sy)

  if (flash) {
    ctx.globalAlpha = 0.6 + 0.4 * (frame % 2)
  }

  
  if (isInvincible && invincibleDuration > 0) {
    const progress = Math.max(0, Math.min(1, invincibleRemaining / invincibleDuration))
    const radius = s * (0.7 + (1 - progress) * 0.3)
    const alpha = 0.2 + progress * 0.4

    
    ctx.globalAlpha = alpha * 0.35
    ctx.beginPath()
    ctx.arc(0, 0, radius + 8, 0, Math.PI * 2)
    ctx.fillStyle = '#fbbf24'
    ctx.fill()

    
    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#fde68a'
    ctx.fill()

    
    ctx.globalAlpha = alpha * 1.4
    ctx.strokeStyle = '#facc15'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, radius + 4, 0, Math.PI * 2)
    ctx.stroke()

    
    ctx.globalAlpha = alpha * 1.5
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    const sweepAngle = Math.PI * 2 * progress
    ctx.beginPath()
    ctx.arc(0, 0, radius + 4, -Math.PI / 2, -Math.PI / 2 + sweepAngle)
    ctx.stroke()

    
    if (invincibleRemaining < 2000) {
      ctx.globalAlpha = 0.3 + 0.45 * Math.sin(Date.now() / 70)
      ctx.beginPath()
      ctx.arc(0, 0, radius + 10, 0, Math.PI * 2)
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    ctx.globalAlpha = 1
  }

  const bodyColor = '#fbbf24'
  const bodyColor2 = '#d97706'
  const headColor = '#fde68a'
  const legColor = '#92400e'
  const legOffset = [0, 3, 0, -3][frame]

  if (direction === DIRECTION.FRONT) {
    ctx.fillStyle = headColor; ctx.fillRect(-8, -half + 2, 16, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-5, -half + 6, 3, 3); ctx.fillRect(2, -half + 6, 3, 3)
    ctx.fillStyle = bodyColor; ctx.fillRect(-10, -half + 14, 20, 14)
    ctx.fillStyle = bodyColor2; ctx.fillRect(-8, -half + 16, 16, 4)
    ctx.fillStyle = legColor; ctx.fillRect(-9, -half + 28 + legOffset, 7, 10); ctx.fillRect(2, -half + 28 - legOffset, 7, 10)
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(12, -half + 18, 8, -Math.PI / 3, Math.PI / 3); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(12 + 8 * Math.cos(-Math.PI / 3), -half + 18 + 8 * Math.sin(-Math.PI / 3))
    ctx.lineTo(12 + 8 * Math.cos(Math.PI / 3), -half + 18 + 8 * Math.sin(Math.PI / 3))
    ctx.stroke()
  } else if (direction === DIRECTION.LEFT) {
    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 2, 12, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(-4, -half + 6, 3, 3)
    ctx.fillStyle = bodyColor; ctx.fillRect(-10, -half + 14, 18, 14)
    ctx.fillStyle = bodyColor2; ctx.fillRect(-8, -half + 16, 14, 4)
    ctx.fillStyle = legColor; ctx.fillRect(-6 + legOffset, -half + 28, 7, 10); ctx.fillRect(-1 - legOffset, -half + 28, 7, 10)
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(-12, -half + 18, 8, Math.PI - Math.PI / 3, Math.PI + Math.PI / 3); ctx.stroke()
  } else {
    ctx.fillStyle = headColor; ctx.fillRect(-6, -half + 2, 12, 12)
    ctx.fillStyle = '#1e293b'; ctx.fillRect(1, -half + 6, 3, 3)
    ctx.fillStyle = bodyColor; ctx.fillRect(-8, -half + 14, 18, 14)
    ctx.fillStyle = bodyColor2; ctx.fillRect(-6, -half + 16, 14, 4)
    ctx.fillStyle = legColor; ctx.fillRect(-6 - legOffset, -half + 28, 7, 10); ctx.fillRect(1 + legOffset, -half + 28, 7, 10)
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(12, -half + 18, 8, -Math.PI / 3, Math.PI / 3); ctx.stroke()
  }

  ctx.restore()
}
