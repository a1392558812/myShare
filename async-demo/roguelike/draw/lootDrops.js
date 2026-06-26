
export function renderLootDrops(ctx, drops, now, toScreen) {
  if (!drops) return

  drops.value.forEach(drop => {
    const pos = toScreen(drop.x, drop.y, ctx)

    
    const remaining = drop.lifetime - (now - drop.spawnedAt)
    if (remaining < 3000 && Math.floor(now / 200) % 2 === 0) return
    const alpha = remaining < 3000 ? 0.5 : 1

    ctx.save()
    ctx.globalAlpha = alpha

    
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, drop.size + 4, 0, Math.PI * 2)
    ctx.fillStyle = drop.color + '20'
    ctx.fill()

    
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, drop.size, 0, Math.PI * 2)
    ctx.fillStyle = drop.color
    ctx.fill()
    ctx.strokeStyle = drop.hoverColor
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.restore()

    
    ctx.save()
    ctx.font = `${drop.size + 2}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'
    ctx.fillText(drop.icon, pos.x, pos.y)
    ctx.restore()
  })
}
