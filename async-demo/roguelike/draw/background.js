/**
 * 背景网格绘制
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number }} camera — 镜头坐标
 * @param {(lx: number, ly: number, ctx: CanvasRenderingContext2D) => { x: number, y: number }} toScreen
 */
export function drawBackgroundGrid(ctx, camera, toScreen) {
  const gridSize = 80
  ctx.save()
  ctx.strokeStyle = 'rgba(200, 210, 220, 0.3)'
  ctx.lineWidth = 1

  const camModX = ((-camera.x % gridSize) + gridSize) % gridSize
  const camModY = ((-camera.y % gridSize) + gridSize) % gridSize

  for (let x = camModX - gridSize; x < ctx.canvas.width + gridSize; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, ctx.canvas.height)
    ctx.stroke()
  }
  for (let y = camModY - gridSize; y < ctx.canvas.height + gridSize; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(ctx.canvas.width, y)
    ctx.stroke()
  }
  ctx.restore()

  // 原点标记
  const origin = toScreen(0, 0, ctx)
  ctx.save()
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(origin.x - 10, origin.y)
  ctx.lineTo(origin.x + 10, origin.y)
  ctx.moveTo(origin.x, origin.y - 10)
  ctx.lineTo(origin.x, origin.y + 10)
  ctx.stroke()
  ctx.restore()
}
