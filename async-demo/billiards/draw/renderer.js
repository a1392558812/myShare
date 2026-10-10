import { TABLE, RAIL, BOARD, BALL_R, POCKETS, HEAD_LINE_X, THEME } from '../constants.js'

/** 当前帧的缩放/偏移，供鼠标坐标换算复用 */
export const view = { scale: 1, ox: 0, oy: 0 }

/**
 * 画布坐标 -> 台面坐标
 * @param {number} mx 画布内 x
 * @param {number} my 画布内 y
 * @returns {{x:number,y:number}}
 */
export const screenToTable = (mx, my) => ({
  x: (mx - view.ox) / view.scale - RAIL,
  y: (my - view.oy) / view.scale - RAIL,
})

const clamp = (v, min, max) => (v < min ? min : v > max ? max : v)

/** 颜色明暗调整 */
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16)
  let r = (n >> 16) & 255
  let g = (n >> 8) & 255
  let b = n & 255
  if (amt >= 0) {
    r += (255 - r) * amt
    g += (255 - g) * amt
    b += (255 - b) * amt
  } else {
    r *= 1 + amt
    g *= 1 + amt
    b *= 1 + amt
  }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
}

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/** 背景 */
const drawBackdrop = (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h * 0.42, 40, w / 2, h * 0.5, Math.max(w, h) * 0.8)
  g.addColorStop(0, '#16202c')
  g.addColorStop(1, '#070a0e')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

/** 木框 + 库边 + 台布 + 袋口 */
const drawTable = (ctx) => {
  // 木框阴影
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.55)'
  ctx.shadowBlur = 28
  ctx.shadowOffsetY = 12
  const wood = ctx.createLinearGradient(0, 0, 0, BOARD.H)
  wood.addColorStop(0, THEME.wood)
  wood.addColorStop(1, THEME.woodDark)
  ctx.fillStyle = wood
  roundRect(ctx, 0, 0, BOARD.W, BOARD.H, 16)
  ctx.fill()
  ctx.restore()

  // 木框高光
  ctx.strokeStyle = 'rgba(255,220,170,0.16)'
  ctx.lineWidth = 1.5
  roundRect(ctx, 3, 3, BOARD.W - 6, BOARD.H - 6, 13)
  ctx.stroke()

  // 库边
  ctx.fillStyle = THEME.feltDark
  roundRect(ctx, 9, 9, BOARD.W - 18, BOARD.H - 18, 10)
  ctx.fill()

  // 台布
  const felt = ctx.createRadialGradient(
    RAIL + TABLE.W / 2, RAIL + TABLE.H / 2, 60,
    RAIL + TABLE.W / 2, RAIL + TABLE.H / 2, TABLE.W * 0.72,
  )
  felt.addColorStop(0, shade(THEME.felt, 0.14))
  felt.addColorStop(1, shade(THEME.felt, -0.22))
  ctx.fillStyle = felt
  ctx.fillRect(RAIL, RAIL, TABLE.W, TABLE.H)

  // 台布内侧暗边
  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  ctx.lineWidth = 2
  ctx.strokeRect(RAIL + 1, RAIL + 1, TABLE.W - 2, TABLE.H - 2)

  // 库边菱形瞄准点
  ctx.fillStyle = THEME.diamond
  ctx.globalAlpha = 0.65
  for (let i = 1; i <= 7; i++) {
    if (i === 4) continue
    for (const y of [RAIL * 0.5, BOARD.H - RAIL * 0.5]) {
      const x = RAIL + (TABLE.W / 8) * i
      ctx.beginPath()
      ctx.moveTo(x, y - 4)
      ctx.lineTo(x + 4, y)
      ctx.lineTo(x, y + 4)
      ctx.lineTo(x - 4, y)
      ctx.closePath()
      ctx.fill()
    }
  }
  for (let i = 1; i <= 3; i++) {
    for (const x of [RAIL * 0.5, BOARD.W - RAIL * 0.5]) {
      const y = RAIL + (TABLE.H / 4) * i
      ctx.beginPath()
      ctx.moveTo(x, y - 4)
      ctx.lineTo(x + 4, y)
      ctx.lineTo(x, y + 4)
      ctx.lineTo(x - 4, y)
      ctx.closePath()
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
}

/** 袋口（台面坐标系） */
const drawPockets = (ctx) => {
  for (const p of POCKETS) {
    const rg = ctx.createRadialGradient(p.x, p.y, p.r * 0.2, p.x, p.y, p.r * 1.25)
    rg.addColorStop(0, '#000000')
    rg.addColorStop(0.72, '#050706')
    rg.addColorStop(1, 'rgba(8,12,10,0.15)')
    ctx.fillStyle = rg
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r * 1.22, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(0,0,0,0.85)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.stroke()
  }
}

/** 开球线与置球点 */
const drawMarks = (ctx) => {
  ctx.save()
  ctx.setLineDash([8, 7])
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(HEAD_LINE_X, 0)
  ctx.lineTo(HEAD_LINE_X, TABLE.H)
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.beginPath()
  ctx.arc(TABLE.W * 0.75, TABLE.H / 2, 3, 0, Math.PI * 2)
  ctx.fill()
}

/** 自由球摆放提示区 */
const drawKitchen = (ctx, state) => {
  if (state.phase !== 'place') return
  if (state.ballInHandKitchen) {
    ctx.fillStyle = 'rgba(120,200,255,0.10)'
    ctx.fillRect(0, 0, HEAD_LINE_X, TABLE.H)
    ctx.strokeStyle = 'rgba(120,200,255,0.45)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(HEAD_LINE_X, 0)
    ctx.lineTo(HEAD_LINE_X, TABLE.H)
    ctx.stroke()
  }
  // 母球虚影
  const { x, y } = state.pointer
  ctx.save()
  ctx.globalAlpha = 0.45
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(x, y, BALL_R, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

/** 瞄准辅助线 + 幽灵球 */
const drawAimGuide = (ctx, cue, angle, balls) => {
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)

  // 与「半径 2r 的圆」求最近交
  let hitT = Infinity
  let hitBall = null
  const rr = BALL_R * 2
  for (const o of balls) {
    if (!o.alive || o.num === 0) continue
    const ox = o.x - cue.x
    const oy = o.y - cue.y
    const proj = ox * dx + oy * dy
    if (proj <= 0) continue
    const perp2 = ox * ox + oy * oy - proj * proj
    const d2 = rr * rr
    if (perp2 > d2) continue
    const t = proj - Math.sqrt(d2 - perp2)
    if (t < 0) continue
    if (t < hitT) {
      hitT = t
      hitBall = o
    }
  }

  // 与库边求交
  let wallT = Infinity
  if (dx > 1e-6) wallT = Math.min(wallT, (TABLE.W - BALL_R - cue.x) / dx)
  if (dx < -1e-6) wallT = Math.min(wallT, (BALL_R - cue.x) / dx)
  if (dy > 1e-6) wallT = Math.min(wallT, (TABLE.H - BALL_R - cue.y) / dy)
  if (dy < -1e-6) wallT = Math.min(wallT, (BALL_R - cue.y) / dy)
  wallT = Math.max(0, wallT)

  const useBall = hitBall && hitT < wallT
  const endT = useBall ? hitT : wallT
  const ex = cue.x + dx * endT
  const ey = cue.y + dy * endT

  ctx.save()
  ctx.setLineDash([9, 7])
  ctx.strokeStyle = 'rgba(255,255,255,0.72)'
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(cue.x + dx * BALL_R, cue.y + dy * BALL_R)
  ctx.lineTo(ex, ey)
  ctx.stroke()
  ctx.restore()

  if (!useBall) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.beginPath()
    ctx.arc(ex, ey, 3, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  // 幽灵球
  ctx.save()
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(ex, ey, BALL_R, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  // 目标球出球方向
  const ox = hitBall.x - ex
  const oy = hitBall.y - ey
  const od = Math.hypot(ox, oy) || 1
  const oux = ox / od
  const ouy = oy / od
  ctx.save()
  ctx.strokeStyle = hitBall.color
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.9
  ctx.beginPath()
  ctx.moveTo(hitBall.x, hitBall.y)
  ctx.lineTo(hitBall.x + oux * 110, hitBall.y + ouy * 110)
  ctx.stroke()
  ctx.restore()

  // 母球分离方向（去掉法向分量后的切向）
  let tx = dx - (dx * oux + dy * ouy) * oux
  let ty = dy - (dx * oux + dy * ouy) * ouy
  const td = Math.hypot(tx, ty)
  if (td > 1e-4) {
    tx /= td
    ty /= td
    ctx.save()
    ctx.setLineDash([5, 6])
    ctx.strokeStyle = 'rgba(255,225,150,0.7)'
    ctx.lineWidth = 1.6
    ctx.beginPath()
    ctx.moveTo(ex, ey)
    ctx.lineTo(ex + tx * 80, ey + ty * 80)
    ctx.stroke()
    ctx.restore()
  }
}

/** 球杆 */
const drawCueStick = (ctx, cue, angle, pull) => {
  const len = 320
  const tipR = 3.2
  const buttR = 7.2
  const gap = BALL_R + 12 + pull * 92
  const tipX = cue.x - Math.cos(angle) * gap
  const tipY = cue.y - Math.sin(angle) * gap

  ctx.save()
  ctx.translate(tipX, tipY)
  ctx.rotate(angle + Math.PI)

  const poly = () => {
    ctx.beginPath()
    ctx.moveTo(0, -tipR)
    ctx.lineTo(len * 0.74, -buttR * 0.82)
    ctx.lineTo(len, -buttR)
    ctx.lineTo(len, buttR)
    ctx.lineTo(len * 0.74, buttR * 0.82)
    ctx.lineTo(0, tipR)
    ctx.closePath()
  }

  // 影子
  ctx.save()
  ctx.translate(4, 6)
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  poly()
  ctx.fill()
  ctx.restore()

  const g = ctx.createLinearGradient(0, 0, len, 0)
  g.addColorStop(0, '#f0dcb4')
  g.addColorStop(0.22, '#d9a860')
  g.addColorStop(0.72, '#a06a2c')
  g.addColorStop(1, '#4a2c12')
  ctx.fillStyle = g
  poly()
  ctx.fill()

  // 白色接箍
  ctx.fillStyle = '#f5f0e4'
  ctx.beginPath()
  ctx.moveTo(0, -tipR)
  ctx.lineTo(16, -tipR * 1.15)
  ctx.lineTo(16, tipR * 1.15)
  ctx.lineTo(0, tipR)
  ctx.closePath()
  ctx.fill()

  // 握把
  ctx.fillStyle = '#1b1b1f'
  ctx.beginPath()
  ctx.moveTo(len * 0.78, -buttR * 0.86)
  ctx.lineTo(len, -buttR)
  ctx.lineTo(len, buttR)
  ctx.lineTo(len * 0.78, buttR * 0.86)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

/** 单颗球 */
const drawBall = (ctx, b, showId) => {
  const r = BALL_R

  // 影子
  ctx.fillStyle = 'rgba(0,0,0,0.32)'
  ctx.beginPath()
  ctx.ellipse(b.x + 2.4, b.y + 3.2, r * 1.0, r * 0.88, 0, 0, Math.PI * 2)
  ctx.fill()

  const stripe = b.type === 'stripe'
  const base = stripe ? '#f7f2e6' : b.color
  const g = ctx.createRadialGradient(
    b.x - r * 0.36, b.y - r * 0.42, r * 0.08,
    b.x, b.y, r * 1.08,
  )
  g.addColorStop(0, shade(base, 0.55))
  g.addColorStop(0.5, base)
  g.addColorStop(1, shade(base, -0.42))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
  ctx.fill()

  // 花色球的中段色带
  if (stripe) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
    ctx.clip()
    const bg = ctx.createLinearGradient(b.x - r, 0, b.x + r, 0)
    bg.addColorStop(0, shade(b.color, -0.3))
    bg.addColorStop(0.45, b.color)
    bg.addColorStop(1, shade(b.color, -0.35))
    ctx.fillStyle = bg
    ctx.fillRect(b.x - r, b.y - r * 0.62, r * 2, r * 1.24)
    ctx.restore()
  }

  // 号码圈
  if (b.num > 0) {
    ctx.fillStyle = '#fbf8f0'
    ctx.beginPath()
    ctx.arc(b.x, b.y, r * 0.52, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1a1a1a'
    ctx.font = `bold ${(r * 0.78).toFixed(1)}px "Segoe UI", Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(b.num), b.x, b.y + 0.6)
  }

  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.beginPath()
  ctx.ellipse(b.x - r * 0.34, b.y - r * 0.4, r * 0.24, r * 0.16, -0.6, 0, Math.PI * 2)
  ctx.fill()

  if (showId && b.num === 8) {
    ctx.strokeStyle = 'rgba(255,80,80,0.9)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(b.x, b.y, r + 3, 0, Math.PI * 2)
    ctx.stroke()
  }
}

/**
 * 渲染一帧
 * @param {CanvasRenderingContext2D} ctx
 * @param {{balls:Array,state:object}} s 游戏状态
 * @param {number} viewW 画布逻辑宽
 * @param {number} viewH 画布逻辑高
 * @param {number} dpr 设备像素比
 */
export const render = (ctx, s, viewW, viewH, dpr) => {
  const { balls, state } = s
  const scale = Math.min(viewW / BOARD.W, viewH / BOARD.H)
  view.scale = scale
  view.ox = (viewW - BOARD.W * scale) / 2
  view.oy = (viewH - BOARD.H * scale) / 2

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, viewW, viewH)
  drawBackdrop(ctx, viewW, viewH)

  ctx.save()
  ctx.translate(view.ox, view.oy)
  ctx.scale(scale, scale)
  drawTable(ctx)

  ctx.save()
  ctx.translate(RAIL, RAIL)

  drawPockets(ctx)
  drawMarks(ctx)
  drawKitchen(ctx, state)

  const cue = balls[0]
  if (cue.alive && state.phase === 'aim') {
    if (state.showGuide) drawAimGuide(ctx, cue, state.aimAngle, balls)
    drawCueStick(ctx, cue, state.aimAngle, state.charging ? state.power : 0)
  }

  for (const b of balls) if (b.alive) drawBall(ctx, b, state.showIds)

  ctx.restore()
  ctx.restore()
}
