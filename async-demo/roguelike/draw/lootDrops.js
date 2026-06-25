/**
 * 绘制掉落物——圆形光斑 + 图标文字，临近消失时闪烁。
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array}  drops    - 掉落物数组（响应式 ref）
 * @param {number} now      - gameTime
 * @param {Function} toScreen
 */
export function renderLootDrops(ctx, drops, now, toScreen) {
  if (!drops) return

  drops.value.forEach(drop => {
    const pos = toScreen(drop.x, drop.y, ctx)

    // 临近消失时闪烁（最后 3 秒）
    const remaining = drop.lifetime - (now - drop.spawnedAt)
    if (remaining < 3000 && Math.floor(now / 200) % 2 === 0) return
    const alpha = remaining < 3000 ? 0.5 : 1

    ctx.save()
    ctx.globalAlpha = alpha

    // 光晕
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, drop.size + 4, 0, Math.PI * 2)
    ctx.fillStyle = drop.color + '20'
    ctx.fill()

    // 实体
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, drop.size, 0, Math.PI * 2)
    ctx.fillStyle = drop.color
    ctx.fill()
    ctx.strokeStyle = drop.hoverColor
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.restore()

    // 图标文字
    ctx.save()
    ctx.font = `${drop.size + 2}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'
    ctx.fillText(drop.icon, pos.x, pos.y)
    ctx.restore()
  })
}
