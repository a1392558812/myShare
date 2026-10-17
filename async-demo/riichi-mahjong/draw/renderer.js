import { HONOR_LABEL, MAN_KANJI, rankOf, suitOf, isHonor } from '../core/tiles.js'
import { DESIGN, TILE, RIVER, ROW, CENTER, C, FACE, ANIM, FX } from '../constants.js'

const BASE = { w: 64, h: 88 }

/** 筒子 / 索子的点位排布（相对比例） */
const DOTS = {
  1: [[0.5, 0.5]],
  2: [[0.5, 0.3], [0.5, 0.7]],
  3: [[0.26, 0.24], [0.5, 0.5], [0.74, 0.76]],
  4: [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]],
  5: [[0.28, 0.26], [0.72, 0.26], [0.5, 0.5], [0.28, 0.74], [0.72, 0.74]],
  6: [[0.28, 0.26], [0.5, 0.26], [0.72, 0.26], [0.28, 0.74], [0.5, 0.74], [0.72, 0.74]],
  7: [[0.27, 0.22], [0.5, 0.22], [0.73, 0.22], [0.27, 0.5], [0.5, 0.5], [0.73, 0.5], [0.5, 0.78]],
  8: [[0.27, 0.22], [0.5, 0.22], [0.73, 0.22], [0.27, 0.5], [0.73, 0.5], [0.27, 0.78], [0.5, 0.78], [0.73, 0.78]],
  9: [[0.24, 0.22], [0.5, 0.22], [0.76, 0.22], [0.24, 0.5], [0.5, 0.5], [0.76, 0.5], [0.24, 0.78], [0.5, 0.78], [0.76, 0.78]],
}

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

/** 单张牌面绘制到 [0,0,BASE] 的上下文 */
const paintFace = (ctx, kind) => {
  const { w, h } = BASE
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = FACE.bg
  roundRect(ctx, 1.5, 1.5, w - 3, h - 3, 7)
  ctx.fill()
  ctx.strokeStyle = FACE.edge
  ctx.lineWidth = 1.5
  ctx.stroke()

  if (isHonor(kind)) {
    const i = kind - 27
    const ch = HONOR_LABEL[i]
    ctx.fillStyle = i === 4 ? FACE.honorBlue : i === 5 ? FACE.honorGreen : i === 6 ? FACE.honorRed : FACE.honor
    ctx.font = `700 ${w * (i === 5 ? 0.55 : 0.62)}px "Microsoft YaHei", serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if (i === 4) {
      // 白：空心框
      ctx.strokeStyle = FACE.honorBlue
      ctx.lineWidth = 3
      ctx.strokeRect(w * 0.22, h * 0.16, w * 0.56, h * 0.68)
    } else {
      ctx.fillText(ch, w / 2, h * 0.52)
    }
    return
  }
  const r = rankOf(kind)
  const s = suitOf(kind)
  if (s === 0) {
    ctx.fillStyle = r === 5 ? FACE.manChar : FACE.man
    ctx.font = `700 ${w * 0.5}px "Microsoft YaHei", serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(MAN_KANJI[r - 1], w / 2, h * 0.32)
    ctx.fillStyle = FACE.manChar
    ctx.font = `700 ${w * 0.4}px "Microsoft YaHei", serif`
    ctx.fillText('萬', w / 2, h * 0.73)
  } else if (s === 1) {
    const pts = DOTS[r]
    const rad = r <= 2 ? w * 0.17 : r <= 5 ? w * 0.11 : w * 0.093
    pts.forEach((p, i) => {
      ctx.beginPath()
      ctx.arc(w * p[0], h * p[1], rad, 0, Math.PI * 2)
      ctx.fillStyle = [FACE.pin[0], FACE.pin[1], FACE.pin[2]][i % 3]
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,.28)'
      ctx.lineWidth = 1
      ctx.stroke()
    })
  } else {
    const pts = DOTS[r]
    // 条子画细：窄而高的竹节，避免密排时糊成一团
    const bw = r === 1 ? w * 0.19 : r <= 4 ? w * 0.075 : w * 0.062
    const bh = r === 1 ? h * 0.42 : r <= 4 ? h * 0.18 : h * 0.155
    pts.forEach((p) => {
      const x = w * p[0]
      const y = h * p[1]
      ctx.fillStyle = FACE.sou
      roundRect(ctx, x - bw / 2, y - bh / 2, bw, bh, bw / 2.4)
      ctx.fill()
      ctx.strokeStyle = FACE.souEdge
      ctx.lineWidth = 0.8
      ctx.stroke()
    })
  }
}

const paintBack = (ctx) => {
  const { w, h } = BASE
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = FACE.back
  roundRect(ctx, 1.5, 1.5, w - 3, h - 3, 7)
  ctx.fill()
  ctx.strokeStyle = FACE.backEdge
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,.12)'
  ctx.lineWidth = 1
  for (let i = 1; i < 5; i++) {
    ctx.beginPath()
    ctx.moveTo(w * (i / 5), 6)
    ctx.lineTo(w * (i / 5), h - 6)
    ctx.stroke()
  }
}

let cache = null

/** 34 种牌面 + 牌背一次性预渲染到离屏 canvas */
export const tileCache = () => {
  if (cache) return cache
  const mk = () => {
    const cv = document.createElement('canvas')
    cv.width = BASE.w
    cv.height = BASE.h
    return cv
  }
  const faces = []
  for (let k = 0; k < 34; k++) {
    const cv = mk()
    paintFace(cv.getContext('2d'), k)
    faces.push(cv)
  }
  const back = mk()
  paintBack(back.getContext('2d'))
  cache = { faces, back, base: BASE }
  return cache
}

/** 牌种 → 预渲染牌面。越界 / 非整数 / undefined 一律退成牌背，不能让 drawImage 直接抛错 */
const faceOf = (kind) => {
  const { faces, back } = tileCache()
  if (kind === -1) return back // -1 = 牌背（对手暗牌），是正常用法，不算非法
  if (!Number.isInteger(kind) || kind < 0 || kind >= faces.length) {
    console.warn('[drawTile] 非法牌种', kind, new Error().stack)
    return back
  }
  return faces[kind]
}

export const drawTile = (ctx, kind, x, y, w, h, opts = {}) => {
  const img = faceOf(kind)
  if (opts.rot) {
    ctx.save()
    ctx.translate(x + w / 2, y + h / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.drawImage(img, -h / 2, -w / 2, h, w)
    ctx.restore()
    return
  }
  if (opts.shadow !== false) {
    ctx.fillStyle = FACE.shadow
    roundRect(ctx, x + 1.5, y + 3, w, h, 4)
    ctx.fill()
  }
  ctx.drawImage(img, x, y, w, h)
}

/** 牌桌各区域矩形（命中测试与绘制共用） */
export const layoutOf = (state) => {
  const L = { riverW: RIVER.cols * (TILE.river.w + TILE.gap), riverH: RIVER.rows * (TILE.river.h + TILE.gap) }
  const cx = CENTER.x
  const my = state.players[0]
  const op = state.players[1]

  const oppBack = []
  const obw = TILE.back.w + 2
  const obTotal = op.tiles.length * obw
  for (let i = 0; i < op.tiles.length; i++) {
    oppBack.push({ x: cx - obTotal / 2 + i * obw, y: ROW.oppBack, w: TILE.back.w, h: TILE.back.h })
  }

  const riverRect = (top) => ({
    x: cx - L.riverW / 2,
    y: top,
    w: L.riverW,
    h: L.riverH,
  })

  const myHand = []
  const hw = TILE.hand.w + TILE.gap
  const n = my.tiles.length
  const gapExtra = my.drawn !== null ? 14 : 0
  const total = n * hw + gapExtra
  let x0 = cx - total / 2
  for (let i = 0; i < n; i++) {
    const isDrawn = my.drawn !== null && i === n - 1
    myHand.push({ x: x0 + i * hw + (isDrawn ? gapExtra : 0), y: ROW.myHand, w: TILE.hand.w, h: TILE.hand.h, index: i })
  }

  return {
    ...L,
    oppBack,
    oppRiver: riverRect(ROW.oppRiver),
    myRiver: riverRect(ROW.myRiver),
    myHand,
    oppMeld: { x: cx + L.riverW / 2 + 40, y: ROW.oppRiver + 4 },
    myMeld: { x: cx + L.riverW / 2 + 40, y: ROW.myRiver + L.riverH - TILE.meld.h - 4 },
  }
}

export const riverSlot = (rect, i) => ({
  x: rect.x + (i % RIVER.cols) * (TILE.river.w + TILE.gap),
  y: rect.y + Math.floor(i / RIVER.cols) * (TILE.river.h + TILE.gap),
  w: TILE.river.w,
  h: TILE.river.h,
})

/** 点击命中：返回 { kind:'hand', index } 或 null */
export const hitTest = (state, layout, px, py) => {
  for (const r of layout.myHand) {
    if (px >= r.x && px <= r.x + r.w && py >= r.y - 10 && py <= r.y + r.h) return { kind: 'hand', index: r.index }
  }
  for (let i = 0; i < state.players[1].river.length; i++) {
    const s = riverSlot(layout.oppRiver, i)
    if (px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h) return { kind: 'oppRiver', index: i }
  }
  for (let i = 0; i < state.players[0].river.length; i++) {
    const s = riverSlot(layout.myRiver, i)
    if (px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h) return { kind: 'myRiver', index: i }
  }
  return null
}

/** 副露：暗杠中间两张盖牌，呼叫牌下方加金色标记 */
const drawMeld = (ctx, melds, x, y) => {
  const w = TILE.meld.w * 0.82
  let cx = x
  for (const m of melds) {
    const claimedIdx = m.type === 'chi' ? m.kinds.indexOf(m.claimed) : -1
    for (let i = 0; i < m.kinds.length; i++) {
      const hidden = m.type === 'ankan' && i > 0 && i < m.kinds.length - 1
      drawTile(ctx, hidden ? -1 : m.kinds[i], cx + i * w, y, w, TILE.meld.h)
      if (i === claimedIdx) {
        ctx.fillStyle = C.gold
        ctx.fillRect(cx + i * w + 2, y + TILE.meld.h + 2, w - 4, 2)
      }
    }
    cx += m.kinds.length * w + 8
  }
}

const drawWall = (ctx, state, layout) => {
  const left = state.wall.length
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,.3)'
  roundRect(ctx, CENTER.x - 96, ROW.center - 26, 192, 52, 12)
  ctx.fill()
  ctx.strokeStyle = C.line
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = C.text
  ctx.font = '600 13px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`牌山 ${left}`, CENTER.x, ROW.center - 10)
  ctx.fillStyle = C.dim
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillText(`王牌 ${state.deadWall.length} · 第 ${state.turnCount + 1} 巡`, CENTER.x, ROW.center + 10)
  ctx.restore()
}

const drawDice = (ctx, state) => {
  const [a, b] = state.dice
  const drawOne = (v, x, y) => {
    ctx.fillStyle = '#fff'
    roundRect(ctx, x, y, 22, 22, 5)
    ctx.fill()
    ctx.fillStyle = '#222'
    const pts = {
      1: [[.5, .5]], 2: [[.28, .28], [.72, .72]], 3: [[.26, .26], [.5, .5], [.74, .74]],
      4: [[.28, .28], [.72, .28], [.28, .72], [.72, .72]],
      5: [[.26, .26], [.74, .26], [.5, .5], [.26, .74], [.74, .74]],
      6: [[.26, .24], [.26, .5], [.26, .76], [.74, .24], [.74, .5], [.74, .76]],
    }[v]
    for (const p of pts) {
      ctx.beginPath()
      ctx.arc(x + 22 * p[0], y + 22 * p[1], 2.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  drawOne(a, CENTER.x - 148, ROW.center - 11)
  drawOne(b, CENTER.x - 122, ROW.center - 11)
}

/** 宝牌指示牌：中央区左侧亮出已翻开的指示牌 */
const drawDora = (ctx, state) => {
  const inds = (state.doraWall || []).slice(0, state.doraRevealed || 0)
  if (!inds.length) return
  const w = 26
  const h = 36
  const gap = 3
  const total = inds.length * (w + gap) - gap
  const x1 = CENTER.x - 160
  const x0 = x1 - total
  const y = ROW.center - h / 2

  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,.3)'
  roundRect(ctx, x0 - 9, ROW.center - 26, total + 18, 52, 12)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,217,61,.35)'
  ctx.lineWidth = 1
  ctx.stroke()

  inds.forEach((k, i) => {
    drawTile(ctx, k, x0 + i * (w + gap), y, w, h)
    ctx.strokeStyle = C.gold
    ctx.lineWidth = 1.5
    roundRect(ctx, x0 + i * (w + gap) - 1.5, y - 1.5, w + 3, h + 3, 4)
    ctx.stroke()
  })

  ctx.fillStyle = C.gold
  ctx.font = '600 11px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('宝牌指示牌', x0 + total / 2, ROW.center + 19)
  ctx.restore()
}

const drawRiichiStick = (ctx, count, x, y) => {
  ctx.fillStyle = '#f2efe6'
  roundRect(ctx, x, y, 8, 34, 3)
  ctx.fill()
  ctx.fillStyle = C.riichi
  ctx.beginPath()
  ctx.arc(x + 4, y + 8, 2.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = C.dim
  ctx.font = '10px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`×${count}`, x + 4, y + 46)
}

/** 宣告横幅：吃/碰/杠/立直，双方都出 */
const drawAnnounce = (ctx, ann) => {
  if (!ann) return
  const age = performance.now() - ann.t0
  if (age > FX.banner) return
  const k = age / FX.banner
  const pop = Math.min(1, k / 0.18)
  const scale = 0.55 + 0.45 * (1 - Math.pow(1 - pop, 3))
  const alpha = k > 0.72 ? 1 - (k - 0.72) / 0.28 : 1
  const cx = CENTER.x
  const cy = ROW.center - 4

  ctx.save()
  ctx.globalAlpha = alpha
  // 外扩光环
  const ringK = Math.min(1, age / FX.ring)
  ctx.strokeStyle = ann.color
  ctx.globalAlpha = alpha * (1 - ringK) * 0.7
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, 60 + ringK * 120, 0, Math.PI * 2)
  ctx.stroke()

  ctx.globalAlpha = alpha
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  const w = 190
  const h = 56
  ctx.fillStyle = 'rgba(6,20,16,.88)'
  roundRect(ctx, -w / 2, -h / 2, w, h, 14)
  ctx.fill()
  ctx.strokeStyle = ann.color
  ctx.lineWidth = 2.5
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = ann.color
  ctx.font = '800 30px "Microsoft YaHei", system-ui, sans-serif'
  ctx.fillText(ann.text, 0, -8)
  ctx.fillStyle = C.text
  ctx.font = '600 12px system-ui, sans-serif'
  ctx.fillText(ann.sub || '', 0, 18)
  ctx.restore()
}

/** 听牌 / 立直 / 振听 状态角标 */
const drawStatus = (ctx, state, view) => {
  const [mine, opp] = view.tenpai || [false, false]
  const chip = (text, x, y, color, bg) => {
    ctx.font = '700 12px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const w = ctx.measureText(text).width + 18
    ctx.fillStyle = bg
    roundRect(ctx, x - w / 2, y, w, 20, 10)
    ctx.fill()
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = color
    ctx.fillText(text, x, y + 11)
  }
  // 对手：只在立直时强势提示
  if (state.players[1].riichi) chip('AI 立直中', CENTER.x, ROW.oppBack + TILE.back.h + 8, C.riichi, 'rgba(255,95,109,.16)')
  if (state.players[0].riichi) chip('你已立直', CENTER.x, ROW.myHand - 38, C.riichi, 'rgba(255,95,109,.16)')
  else if (mine) chip('听牌', CENTER.x, ROW.myHand - 38, C.gold, 'rgba(255,217,61,.14)')
  if (mine && view.furiten) {
    const label = view.furiten === 'temp' ? '同巡振听 · 本巡只能自摸' : '舍牌振听 · 只能自摸'
    chip(label, CENTER.x, ROW.myHand - 60, C.red, 'rgba(255,95,109,.2)')
  }
  if (opp && !state.players[1].riichi && view.revealOpp) chip('AI 听牌', CENTER.x, ROW.oppBack + TILE.back.h + 8, C.dim, 'rgba(255,255,255,.08)')
}

/**
 * 绘制整张牌桌
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state 局面状态
 * @param {{hover:number, anim:Object|null, hint:Object|null, announce:Object|null, tenpai:boolean[], furiten:boolean|string, riichiPick:number[]}} view
 */
export const drawScene = (ctx, state, view = {}) => {
  const L = layoutOf(state)
  const g = ctx
  g.clearRect(0, 0, DESIGN.w, DESIGN.h)

  // 桌布
  const grd = g.createRadialGradient(DESIGN.w / 2, DESIGN.h / 2, 60, DESIGN.w / 2, DESIGN.h / 2, DESIGN.w * 0.72)
  grd.addColorStop(0, C.felt)
  grd.addColorStop(1, C.feltDark)
  g.fillStyle = grd
  g.fillRect(0, 0, DESIGN.w, DESIGN.h)

  // 牌河底框
  for (const rect of [L.oppRiver, L.myRiver]) {
    g.strokeStyle = 'rgba(255,255,255,.06)'
    g.lineWidth = 1
    roundRect(g, rect.x - 8, rect.y - 8, rect.w + 16, rect.h + 16, 10)
    g.stroke()
  }

  // 对手手牌：默认是牌背，调试透视时翻开真牌面
  const reveal = !!view.revealOpp
  const opp = state.players[1]
  L.oppBack.forEach((r, i) => drawTile(g, reveal && opp.tiles[i] !== undefined ? opp.tiles[i] : -1, r.x, r.y, r.w, r.h))
  drawMeld(g, state.players[1].melds, L.oppMeld.x, L.oppMeld.y)

  // 牌河
  for (const pi of [0, 1]) {
    const rect = pi === 0 ? L.myRiver : L.oppRiver
    state.players[pi].river.forEach((d, i) => {
      const s = riverSlot(rect, i)
      const animHide = view.anim && view.anim.player === pi && view.anim.index === i
      if (animHide) return
      drawTile(g, d.kind, s.x, s.y, s.w, s.h)
      if (d.riichi) {
        g.fillStyle = 'rgba(255,95,109,.9)'
        roundRect(g, s.x + s.w / 2 - 2, s.y - 5, 4, 5, 2)
        g.fill()
      }
      if (view.hint && view.hint.player === pi && view.hint.index === i) {
        g.strokeStyle = C.gold
        g.lineWidth = 2
        roundRect(g, s.x - 2, s.y - 2, s.w + 4, s.h + 4, 4)
        g.stroke()
      }
    })
  }

  drawWall(g, state, L)
  drawDora(g, state)
  drawDice(g, state)
  if (state.round.riichiBets) drawRiichiStick(g, state.round.riichiBets, CENTER.x + 124, ROW.center - 17)

  // 立直宣言条
  state.players.forEach((p, i) => {
    if (!p.riichi) return
    g.fillStyle = C.riichi
    const y = i === 1 ? ROW.oppBack + TILE.back.h + 4 : ROW.myHand - 16
    roundRect(g, CENTER.x - 60, y, 120, 2, 1)
    g.fill()
  })

  drawMeld(g, state.players[0].melds, L.myMeld.x, L.myMeld.y)

  // 玩家手牌
  const my = state.players[0]
  const pick = view.riichiPick || []
  my.tiles.forEach((t, i) => {
    const r = L.myHand[i]
    const selectable = pick.includes(t)
    const hovered = view.hover === i
    const y = hovered || selectable ? r.y - 12 : r.y
    drawTile(g, t, r.x, y, r.w, r.h)
    if (pick.length && !selectable) {
      g.fillStyle = 'rgba(4,16,12,.62)'
      roundRect(g, r.x, y, r.w, r.h, 6)
      g.fill()
    }
    if (selectable) {
      g.strokeStyle = C.gold
      g.lineWidth = 2
      roundRect(g, r.x - 3, y - 3, r.w + 6, r.h + 6, 6)
      g.stroke()
    }
    if (my.drawn !== null && i === my.tiles.length - 1) {
      g.strokeStyle = 'rgba(255,217,61,.75)'
      g.lineWidth = 2
      roundRect(g, r.x - 2, y - 2, r.w + 4, r.h + 4, 5)
      g.stroke()
    }
    if (hovered) {
      g.fillStyle = 'rgba(0,0,0,.35)'
      roundRect(g, r.x, y - 26, r.w, 20, 5)
      g.fill()
      g.fillStyle = C.gold
      g.font = '600 12px system-ui, sans-serif'
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillText('打出', r.x + r.w / 2, y - 16)
    }
  })

  // 打牌飞行动画
  if (view.anim) {
    const a = view.anim
    const k = Math.min(1, (performance.now() - a.t0) / ANIM.discard)
    const e = 1 - Math.pow(1 - k, 3)
    const x = a.from.x + (a.to.x - a.from.x) * e
    const y = a.from.y + (a.to.y - a.from.y) * e
    const w = a.from.w + (a.to.w - a.from.w) * e
    const h = a.from.h + (a.to.h - a.from.h) * e
    drawTile(g, a.tile, x, y, w, h)
  }

  drawStatus(g, state, view)
  drawAnnounce(g, view.announce)
  return L
}
