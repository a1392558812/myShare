export const renderProjectile = (ctx, sx, sy, p) => {
  ctx.save()
  if (p.type === 'arrow') {
    const angle = Math.atan2(p.vy, p.vx)
    ctx.translate(sx, sy); ctx.rotate(angle)
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.stroke()
    ctx.fillStyle = '#d97706'
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(4, -3); ctx.lineTo(4, 3); ctx.closePath(); ctx.fill()
  } else if (p.type === 'autoSeek') {
    ctx.fillStyle = '#a78bfa'; ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#e9d5ff'; ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill()
  } else if (p.type === 'enemyBullet') {
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(sx, sy, p.size / 2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fca5a5'; ctx.beginPath(); ctx.arc(sx, sy, p.size / 4, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}