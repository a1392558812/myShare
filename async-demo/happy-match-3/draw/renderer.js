import { TILE_TYPES, RAINBOW, SPECIAL, EMPTY_FONT, TIME } from '../constants.js'

const roundRect = (ctx, x, y, w, h, r) => {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

const easeOutBack = (x) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

export const layoutOf = (g, cell, pad) => ({
  cell,
  pad,
  w: g.cols * cell + pad * 2,
  h: g.rows * cell + pad * 2,
})

const paletteOf = (t) => (t.color >= 0 ? TILE_TYPES[t.color] : RAINBOW)

/** 特殊块标记：直线炸弹画条纹、九宫炸弹画圆环、彩球画星芒 */
const drawSpecialMark = (ctx, t, size) => {
  const half = size / 2
  if (t.special === SPECIAL.ROW || t.special === SPECIAL.COL) {
    ctx.save()
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.shadowColor = 'rgba(255,255,255,0.9)'
    ctx.shadowBlur = size * 0.12
    const thick = size * 0.09
    for (const off of [-0.16, 0.16]) {
      if (t.special === SPECIAL.ROW) {
        roundRect(ctx, -half * 0.78, off * size - thick / 2, half * 1.56, thick, thick / 2)
      } else {
        roundRect(ctx, off * size - thick / 2, -half * 0.78, thick, half * 1.56, thick / 2)
      }
      ctx.fill()
    }
    ctx.restore()
  } else if (t.special === SPECIAL.AREA) {
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.92)'
    ctx.lineWidth = size * 0.07
    ctx.shadowColor = 'rgba(255,255,255,0.8)'
    ctx.shadowBlur = size * 0.14
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.27, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.fill()
    ctx.restore()
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = size * 0.045
    roundRect(ctx, -half * 0.82, -half * 0.82, half * 1.64, half * 1.64, size * 0.14)
    ctx.stroke()
  } else if (t.special === SPECIAL.RAINBOW) {
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'
    ctx.lineWidth = size * 0.055
    ctx.lineCap = 'round'
    ctx.shadowColor = 'rgba(255,255,255,0.9)'
    ctx.shadowBlur = size * 0.16
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * size * 0.1, Math.sin(a) * size * 0.1)
      ctx.lineTo(Math.cos(a) * size * 0.38, Math.sin(a) * size * 0.38)
      ctx.stroke()
    }
    ctx.restore()
  }
}

const drawTile = (ctx, t, x, y, size, alpha) => {
  const pal = paletteOf(t)
  const cx = x + size / 2
  const cy = y + size / 2
  let sx = 1
  let sy = 1

  if (t.pop > 0) {
    const k = 1 - t.pop / 320
    const s = 0.35 + 0.65 * easeOutBack(Math.min(1, Math.max(0, k)))
    sx = s
    sy = s
  }
  if (t.land > 0) {
    const f = t.land / TIME.land
    sy *= 1 - 0.18 * f
    sx *= 1 + 0.14 * f
  }

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(cx, cy)
  ctx.scale(sx, sy)
  const s = size
  const gap = s * 0.07
  const body = s - gap * 2
  const r = body * 0.26

  const grd = ctx.createLinearGradient(0, -body / 2, 0, body / 2)
  if (t.color < 0) {
    grd.addColorStop(0, '#ff9ad5')
    grd.addColorStop(0.35, '#ffd93d')
    grd.addColorStop(0.7, '#3ddc84')
    grd.addColorStop(1, '#4aa8ff')
  } else {
    grd.addColorStop(0, pal.light)
    grd.addColorStop(1, pal.dark)
  }
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = s * 0.16
  ctx.shadowOffsetY = s * 0.07
  roundRect(ctx, -body / 2, -body / 2, body, body, r)
  ctx.fillStyle = grd
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  ctx.globalAlpha = alpha * 0.32
  roundRect(ctx, -body / 2 + body * 0.12, -body / 2 + body * 0.1, body * 0.76, body * 0.36, r * 0.7)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.globalAlpha = alpha

  ctx.font = `${Math.round(s * 0.46)}px ${EMPTY_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(pal.emoji, 0, s * 0.05)

  if (t.special) drawSpecialMark(ctx, t, s)
  ctx.restore()
}

/**
 * 绘制一帧
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} g 游戏状态
 * @param {object} L layoutOf 结果
 * @param {number} now 累计时间（ms），用于呼吸动效
 */
export const drawScene = (ctx, g, L, now) => {
  const { cell, pad, w, h } = L
  ctx.clearRect(0, 0, w, h)

  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#241539')
  bg.addColorStop(1, '#160d24')
  roundRect(ctx, 0, 0, w, h, 18)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.strokeStyle = 'rgba(180,140,255,0.28)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 连锁微闪
  if (g.flash > 0) {
    ctx.save()
    ctx.globalAlpha = Math.min(0.22, g.flash / 260 * 0.22)
    roundRect(ctx, 0, 0, w, h, 18)
    ctx.fillStyle = '#ffd93d'
    ctx.fill()
    ctx.restore()
  }

  // 格位
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.cols; c++) {
      roundRect(ctx, pad + c * cell + 3, pad + r * cell + 3, cell - 6, cell - 6, cell * 0.2)
      ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)'
      ctx.fill()
    }
  }

  // 久未操作时的提示（机会必须可读）
  if (g.hint && g.phase === 'idle') {
    const pulse = 0.35 + 0.35 * Math.sin(now / 260)
    for (const [r, c] of g.hint) {
      roundRect(ctx, pad + c * cell + 3, pad + r * cell + 3, cell - 6, cell - 6, cell * 0.2)
      ctx.strokeStyle = `rgba(255,217,61,${pulse})`
      ctx.lineWidth = 3
      ctx.stroke()
    }
  }

  // 正在消散的块
  const cp = g.duration > 0 && g.phase === 'clear' ? Math.min(1, g.timer / g.duration) : 1
  for (const v of g.vanish) {
    const a = cp < 0.35 ? 1 : 1 - (cp - 0.35) / 0.65
    const s = 1 + 0.35 * Math.min(1, cp / 0.35)
    ctx.save()
    ctx.translate(pad + v.c * cell + cell / 2, pad + v.r * cell + cell / 2)
    ctx.scale(s, s)
    ctx.globalAlpha = Math.max(0, a)
    const pal = paletteOf(v.tile)
    roundRect(ctx, -cell * 0.42, -cell * 0.42, cell * 0.84, cell * 0.84, cell * 0.22)
    ctx.fillStyle = pal.main
    ctx.fill()
    if (cp < 0.5) {
      ctx.globalAlpha = Math.max(0, 1 - cp * 2) * 0.8
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    }
    ctx.restore()
  }

  // 常规块
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.cols; c++) {
      const t = g.grid[r][c]
      if (!t) continue
      drawTile(ctx, t, pad + c * cell + t.ox, pad + r * cell + t.oy, cell, 1)
    }
  }

  // 选中框
  if (g.selected) {
    const [r, c] = g.selected
    const pulse = 0.6 + 0.4 * Math.sin(now / 180)
    roundRect(ctx, pad + c * cell + 1, pad + r * cell + 1, cell - 2, cell - 2, cell * 0.22)
    ctx.strokeStyle = `rgba(255,255,255,${pulse})`
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.strokeStyle = `rgba(255,217,61,${pulse * 0.8})`
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // 粒子
  for (const p of g.fx.parts) {
    const a = Math.max(0, p.life / p.max)
    ctx.globalAlpha = a
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(pad + p.x, pad + p.y, p.r * a + 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // 飘分
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const f of g.fx.floats) {
    const a = Math.max(0, Math.min(1, f.life / f.max * 1.6))
    const size = f.big ? cell * 0.44 : cell * 0.32
    ctx.globalAlpha = a
    ctx.font = `800 ${Math.round(size)}px system-ui, "Microsoft YaHei", sans-serif`
    ctx.lineWidth = size * 0.18
    ctx.strokeStyle = 'rgba(20,8,35,0.85)'
    ctx.strokeText(f.text, pad + f.x, pad + f.y)
    ctx.fillStyle = f.color
    ctx.fillText(f.text, pad + f.x, pad + f.y)
  }
  ctx.globalAlpha = 1
}
