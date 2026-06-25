export const drawHpBar = (ctx, x, y, hp, maxHp, width, color) => {
  const barW = width; const barH = 4; const ratio = hp / maxHp
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(x - barW / 2, y, barW, barH)
  ctx.fillStyle = color; ctx.fillRect(x - barW / 2, y, barW * ratio, barH)
  ctx.restore()
}