import { TILE, VIEW_W, VIEW_H, VIEW_COLS, VIEW_ROWS, TIME, C, T, ENEMY, ITEM, SOLID } from '../constants.js'

const px = (v) => Math.round(v)
const box = (ctx, x, y, w, h, color) => {
  ctx.fillStyle = color
  ctx.fillRect(px(x), px(y), px(w), px(h))
}

/** 天空 / 云 / 远山（奖励房走地下金库风格） */
const drawSky = (ctx, g) => {
  if (g.level.bonus) { drawBonusBg(ctx, g); return }
  const grd = ctx.createLinearGradient(0, 0, 0, VIEW_H)
  grd.addColorStop(0, C.skyTop)
  grd.addColorStop(1, C.sky)
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, VIEW_W, VIEW_H)

  const cam = g.cam.x
  // 远山
  for (let i = 0; i < 8; i++) {
    const bx = ((i * 300) - cam * 0.28) % 2400
    const x = bx < -260 ? bx + 2400 : bx
    const baseY = VIEW_H - 96
    ctx.fillStyle = C.hillDark
    ctx.beginPath()
    ctx.moveTo(x, baseY)
    ctx.lineTo(x + 120, baseY - 120)
    ctx.lineTo(x + 240, baseY)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = C.hill
    ctx.beginPath()
    ctx.moveTo(x + 60, baseY)
    ctx.lineTo(x + 150, baseY - 78)
    ctx.lineTo(x + 240, baseY)
    ctx.closePath()
    ctx.fill()
  }
  // 云
  for (let i = 0; i < 14; i++) {
    const cxp = ((i * 260) - cam * 0.42) % 3640
    const x = cxp < -200 ? cxp + 3640 : cxp
    const y = 40 + (i % 4) * 42
    box(ctx, x, y, 74, 20, C.cloud)
    box(ctx, x + 14, y - 12, 44, 16, C.cloud)
    box(ctx, x + 8, y + 16, 62, 8, C.cloudShade)
  }
  // 地面草丛
  for (let i = 0; i < 20; i++) {
    const bx = ((i * 190) - cam * 0.6) % 3800
    const x = bx < -120 ? bx + 3800 : bx
    const y = VIEW_H - 64
    box(ctx, x, y, 42, 22, C.bush)
    box(ctx, x + 10, y - 12, 22, 16, C.bush)
    box(ctx, x + 34, y - 6, 14, 10, C.bushDark)
  }
}

/** 奖励房背景：地下金库，砖纹 + 漂浮的金币微光 */
const drawBonusBg = (ctx, g) => {
  const grd = ctx.createLinearGradient(0, 0, 0, VIEW_H)
  grd.addColorStop(0, C.bonusSkyTop)
  grd.addColorStop(1, C.bonusSky)
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, VIEW_W, VIEW_H)

  const cam = g.cam.x
  const off = -(cam * 0.6) % 64
  ctx.fillStyle = C.bonusWall
  for (let x = off - 64; x < VIEW_W; x += 64) {
    ctx.fillRect(x, 0, 2, VIEW_H)
    ctx.fillRect(x + 32, 0, 1, VIEW_H)
  }
  for (let y = 0; y < VIEW_H; y += 64) {
    ctx.fillRect(0, y, VIEW_W, 2)
  }
  // 装饰性金币星点
  for (let i = 0; i < 12; i++) {
    const x = ((i * 137 - cam * 0.5) % (VIEW_W + 120) + VIEW_W + 120) % (VIEW_W + 120) - 60
    const y = 30 + (i % 5) * 52
    const a = 0.18 + 0.18 * Math.sin(g.tick * 0.06 + i)
    ctx.fillStyle = `rgba(252,216,0,${a})`
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** 单个瓦片 */
const drawTile = (ctx, g, ch, sx, sy, tx, ty) => {
  const bump = g.bumps.find((b) => b.tx === tx && b.ty === ty)
  let oy = 0
  if (bump) oy = -Math.sin((bump.t / 12) * Math.PI) * 9
  const y = sy + oy
  switch (ch) {
    case T.GROUND: {
      box(ctx, sx, y, TILE, TILE, C.ground)
      box(ctx, sx, y, TILE, 5, C.groundTop)
      box(ctx, sx, y + TILE - 3, TILE, 3, C.groundLine)
      box(ctx, sx + 6, y + 12, 4, 4, C.groundLine)
      box(ctx, sx + 20, y + 18, 4, 4, C.groundLine)
      break
    }
    case T.BRICK: {
      box(ctx, sx, y, TILE, TILE, C.brick)
      for (let i = 0; i < 3; i++) box(ctx, sx, y + i * 11, TILE, 2, C.brickLine)
      box(ctx, sx + 15, y, 2, 11, C.brickLine)
      box(ctx, sx + 6, y + 13, 2, 9, C.brickLine)
      box(ctx, sx + 24, y + 13, 2, 9, C.brickLine)
      box(ctx, sx, y, TILE, 2, C.brickHi)
      break
    }
    case T.COIN_BLOCK:
    case T.POWER_BLOCK:
    case T.MULTI_BLOCK: {
      const blink = 0.6 + 0.4 * Math.sin(g.tick * 0.12)
      box(ctx, sx, y, TILE, TILE, C.question)
      box(ctx, sx, y, TILE, 3, C.questionDark)
      box(ctx, sx, y + TILE - 3, TILE, 3, C.questionDark)
      box(ctx, sx, y, 3, TILE, C.questionDark)
      box(ctx, sx + TILE - 3, y, 3, TILE, C.questionDark)
      box(ctx, sx + 4, y + 4, TILE - 8, TILE - 8, '#ffe680')
      ctx.fillStyle = `rgba(160,104,0,${blink})`
      ctx.font = 'bold 20px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('?', sx + TILE / 2, y + TILE / 2 + 1)
      if (ch === T.MULTI_BLOCK) {
        ctx.fillStyle = C.questionDark
        ctx.font = 'bold 9px monospace'
        ctx.fillText('x5', sx + TILE / 2, y + TILE - 8)
      }
      if (ch === T.POWER_BLOCK) box(ctx, sx + TILE / 2 - 3, y + TILE - 6, 6, 3, '#fff')
      break
    }
    case T.USED: {
      box(ctx, sx, y, TILE, TILE, C.used)
      box(ctx, sx + 4, y + 4, TILE - 8, TILE - 8, C.usedLine)
      box(ctx, sx + 7, y + 7, TILE - 14, TILE - 14, C.used)
      break
    }
    case T.STONE: {
      box(ctx, sx, y, TILE, TILE, C.stone)
      box(ctx, sx, y, TILE, 3, '#d8d8d8')
      box(ctx, sx, y + TILE - 3, TILE, 3, C.stoneLine)
      box(ctx, sx, y, 3, TILE, '#d8d8d8')
      box(ctx, sx + TILE - 3, y, 3, TILE, C.stoneLine)
      break
    }
    case T.PLATFORM: {
      box(ctx, sx, y, TILE, TILE, C.platform)
      box(ctx, sx, y, TILE, 4, '#e0a868')
      box(ctx, sx, y + TILE - 4, TILE, 4, C.platformLine)
      box(ctx, sx + 12, y + 4, 3, TILE - 8, C.platformLine)
      break
    }
    case T.PIPE:
    case T.PIPE_PLANT:
    case T.WARP:
    case T.BONUS_EXIT: {
      const isWarp = ch === T.WARP
      const isExit = ch === T.BONUS_EXIT
      const main = isWarp ? '#7c5cff' : isExit ? C.exitPipe : C.pipe
      const light = isWarp ? '#b09cff' : isExit ? C.exitPipeLight : C.pipeLight
      const dark = isWarp ? '#4028a0' : isExit ? C.exitPipeDark : C.pipeDark
      const topOpen = g.level.tiles[ty - 1] && g.level.tiles[ty - 1][tx] !== ch
      box(ctx, sx, y, TILE, TILE, main)
      box(ctx, sx + 3, y, 7, TILE, light)
      box(ctx, sx + TILE - 6, y, 5, TILE, dark)
      if (topOpen) {
        box(ctx, sx - 3, y, TILE + 6, 10, main)
        box(ctx, sx - 3, y, TILE + 6, 3, light)
        box(ctx, sx - 3, y + 8, TILE + 6, 2, dark)
      }
      if (isWarp) {
        const a = 0.4 + 0.4 * Math.sin(g.tick * 0.16)
        box(ctx, sx + 8, y + 12, 16, 8, `rgba(255,255,255,${a})`)
      }
      if (isExit) {
        const a = 0.5 + 0.5 * Math.sin(g.tick * 0.14)
        box(ctx, sx - 1, y, TILE + 2, 5, `rgba(255,240,150,${a})`)
        box(ctx, sx + TILE / 2 - 5, y + 6, 10, 6, `rgba(255,240,150,${a})`)
      }
      break
    }
    case T.CASTLE: {
      box(ctx, sx, y, TILE, TILE, C.castle)
      box(ctx, sx, y, TILE, 4, '#d89a58')
      box(ctx, sx + 4, y + 4, TILE - 8, 3, C.castleDark)
      box(ctx, sx + 4, y + TILE - 8, TILE - 8, 3, C.castleDark)
      break
    }
    case T.CHECKPOINT: {
      const on = g.checkpoints && g.checkpoints.has(tx + ',' + ty)
      const top = !((g.level.tiles[ty - 1] || [])[tx] === T.CHECKPOINT)
      box(ctx, sx + 12, y, 8, TILE, on ? '#fcd800' : '#d8d8d8')
      box(ctx, sx + 12, y, 3, TILE, on ? '#fff8c0' : '#ffffff')
      if (top) {
        box(ctx, sx + 6, y - 6, 20, 6, on ? '#fcd800' : '#a8a8a8')
        const wave = Math.sin(g.tick * 0.14) * 3
        box(ctx, sx + 20, y - 4, 14 + wave, 14, on ? '#00e04a' : '#8a8a8a')
      }
      if (on) {
        const a = 0.35 + 0.35 * Math.sin(g.tick * 0.12)
        box(ctx, sx + 4, y - 12, TILE - 8, TILE + 12, `rgba(252,216,0,${a * 0.25})`)
      }
      break
    }
    default:
      break
  }
}

/** 旗杆与旗帜 */
const drawFlag = (ctx, g) => {
  if (g.level.bonus) return
  const f = g.level.flag
  const sx = f.poleX - g.cam.x
  if (sx < -60 || sx > VIEW_W + 60) return
  const top = f.y0
  const bottom = f.y1 + TILE + 4
  box(ctx, sx - 3, top, 6, bottom - top, C.flagPole)
  box(ctx, sx - 5, bottom - 6, 10, 8, C.flagBase)
  box(ctx, sx - 8, bottom + 2, 16, 4, '#005000')
  ctx.fillStyle = '#c0c0c0'
  ctx.beginPath()
  ctx.arc(sx, top - 6, 7, 0, Math.PI * 2)
  ctx.fill()
  const targetY = Math.max(top, bottom - TILE * 1.2)
  const fy = top + (targetY - top) * (g.flagSlide || 0)
  ctx.fillStyle = C.flag
  ctx.beginPath()
  ctx.moveTo(sx + 3, fy)
  ctx.lineTo(sx + 40, fy + 12)
  ctx.lineTo(sx + 3, fy + 24)
  ctx.closePath()
  ctx.fill()
  box(ctx, sx + 3, fy + 10, 22, 4, '#fff')
}

/** 移动平台 */
const drawPlatforms = (ctx, g) => {
  for (const p of g.platforms) {
    const sx = p.x - g.cam.x
    if (sx < -160 || sx > VIEW_W + 160) continue
    box(ctx, sx, p.y, p.w, p.h, '#c88040')
    box(ctx, sx, p.y, p.w, 3, '#e8b878')
    box(ctx, sx, p.y + p.h - 3, p.w, 3, '#7a4c18')
    for (let i = 0; i < 3; i++) box(ctx, sx + i * TILE + 10, p.y + 3, 4, p.h - 6, '#7a4c18')
    box(ctx, sx + p.w / 2 - 6, p.y + 4, 12, 4, p.axis === 'h' ? '#ffe680' : '#9ce8ff')
  }
}

/** 金币 */
const drawCoins = (ctx, g) => {
  for (const c of g.coinItems) {
    if (c.taken) continue
    const sx = c.x - g.cam.x
    if (sx < -40 || sx > VIEW_W + 40) continue
    const t = g.tick * 0.1 + c.x * 0.02
    const w = Math.abs(Math.cos(t)) * 18 + 3
    box(ctx, sx + 10 - w / 2, c.y, w, 24, C.coin)
    box(ctx, sx + 10 - w / 2 + 2, c.y + 3, Math.max(1, w - 4), 18, '#fff3a0')
    if (w > 8) box(ctx, sx + 10 - w / 2 + 5, c.y + 8, 3, 8, C.coinDark)
  }
}

/** 敌人 */
const drawEnemies = (ctx, g) => {
  for (const e of g.enemies) {
    const b = e.type === 'piranha' ? { x: e.x, y: e.pipeY - e.rise, w: e.w, h: Math.min(e.h, e.rise) } : e
    const sx = b.x - g.cam.x
    if (sx < -80 || sx > VIEW_W + 80) continue
    if (e.dead && e.type !== 'piranha') {
      const flat = Math.min(1, e.deadT / 8)
      const h = e.h * (1 - flat * 0.75)
      box(ctx, sx, b.y + e.h - h, e.w, h, e.type === 'koopa' ? C.koopaShell : C.goomba)
      box(ctx, sx + 6, b.y + e.h - h + 2, 6, 4, '#fff')
      continue
    }
    switch (e.type) {
      case 'goomba': {
        const wob = Math.sin(g.tick * 0.18) * 2
        box(ctx, sx + 3, b.y + 8, e.w - 6, e.h - 12, C.goomba)
        box(ctx, sx + 1, b.y + 12, e.w - 2, 8, C.goombaDark)
        box(ctx, sx + wob, b.y + e.h - 8, 11, 8, '#5a2000')
        box(ctx, sx + e.w - 11 - wob, b.y + e.h - 8, 11, 8, '#5a2000')
        box(ctx, sx + 6, b.y + 10, 6, 7, '#fff')
        box(ctx, sx + e.w - 12, b.y + 10, 6, 7, '#fff')
        box(ctx, sx + 8, b.y + 12, 3, 4, '#000')
        box(ctx, sx + e.w - 10, b.y + 12, 3, 4, '#000')
        break
      }
      case 'koopa': {
        if (e.shell) {
          box(ctx, sx, b.y, e.w, e.h, C.koopaShell)
          box(ctx, sx + 2, b.y + 3, e.w - 4, e.h - 6, '#38d838')
          box(ctx, sx, b.y + 6, e.w, 3, C.koopaShellDark)
          box(ctx, sx + 6, b.y + 10, 5, 5, '#fff')
          box(ctx, sx + e.w - 11, b.y + 10, 5, 5, '#fff')
          if (!e.shellStill) box(ctx, sx + 4, b.y + e.h - 5, e.w - 8, 3, '#ffe680')
          break
        }
        box(ctx, sx + 4, b.y, e.w - 8, e.h - 12, C.koopaBody)
        box(ctx, sx + 8, b.y + 4, e.w - 16, 10, C.koopaShell)
        box(ctx, sx + 2, b.y + e.h - 26, e.w - 4, 26, C.koopaShell)
        box(ctx, sx + 2, b.y + e.h - 20, e.w - 4, 3, C.koopaShellDark)
        box(ctx, sx + 6, b.y + e.h - 22, 6, 6, '#fff')
        box(ctx, sx + e.w - 12, b.y + e.h - 22, 6, 6, '#fff')
        box(ctx, sx + 2, b.y + e.h - 6, 9, 6, '#f8a800')
        box(ctx, sx + e.w - 11, b.y + e.h - 6, 9, 6, '#f8a800')
        break
      }
      case 'spiny': {
        box(ctx, sx + 4, b.y + 6, e.w - 8, e.h - 10, C.spiny)
        for (let i = 0; i < 5; i++) {
          const ax = sx + 2 + i * 6
          ctx.fillStyle = C.spinyDark
          ctx.beginPath()
          ctx.moveTo(ax, b.y + 6)
          ctx.lineTo(ax + 4, b.y - 4)
          ctx.lineTo(ax + 8, b.y + 6)
          ctx.closePath()
          ctx.fill()
        }
        box(ctx, sx + 6, b.y + 12, 5, 5, '#fff')
        break
      }
      case 'crow': {
        const flap = Math.sin(g.tick * 0.28) * 8
        box(ctx, sx + 6, b.y + 4, e.w - 10, e.h - 8, C.crow)
        box(ctx, sx + 12, b.y + 10, e.w - 20, 8, C.crowBelly)
        ctx.fillStyle = '#101010'
        ctx.beginPath()
        ctx.moveTo(sx + 10, b.y + 6)
        ctx.lineTo(sx - 8, b.y + 2 + flap)
        ctx.lineTo(sx + 12, b.y + 14)
        ctx.closePath()
        ctx.fill()
        box(ctx, sx + e.w - 6, b.y + 8, 8, 5, C.beak)
        box(ctx, sx + 8, b.y + 6, 4, 4, '#fff')
        break
      }
      case 'lakitu': {
        box(ctx, sx - 4, b.y + 10, e.w + 8, 16, C.lakituCloud)
        box(ctx, sx + 2, b.y + 4, 18, 12, C.lakituCloud)
        box(ctx, sx + e.w - 18, b.y + 6, 16, 10, C.lakituCloud)
        box(ctx, sx + 6, b.y, e.w - 12, e.h - 12, C.lakituShell)
        box(ctx, sx + 9, b.y + 4, e.w - 18, 8, '#38d838')
        box(ctx, sx + 8, b.y - 4, e.w - 16, 8, C.lakituSkin)
        box(ctx, sx + 10, b.y - 2, 5, 4, '#fff')
        box(ctx, sx + e.w - 15, b.y - 2, 5, 4, '#fff')
        break
      }
      case 'piranha': {
        const y = e.pipeY - e.rise
        const hh = Math.min(e.h, e.rise)
        if (hh <= 0) break
        box(ctx, sx + 10, y + 10, 10, Math.max(0, e.rise - 10), C.piranhaStem)
        box(ctx, sx + 2, y, 26, 22, C.piranhaHead)
        box(ctx, sx + 2, y + 16, 26, 8, C.piranhaMouth)
        for (let i = 0; i < 4; i++) box(ctx, sx + 5 + i * 6, y + 16, 3, 5, C.piranhaTeeth)
        box(ctx, sx + 6, y + 4, 5, 5, '#fff')
        box(ctx, sx - 6, y + 8, 10, 8, '#00c000')
        box(ctx, sx + 26, y + 8, 10, 8, '#00c000')
        break
      }
      default:
        break
    }
  }
}

/** 道具 */
const drawItems = (ctx, g) => {
  for (const it of g.items) {
    const sx = it.x - g.cam.x
    if (sx < -60 || sx > VIEW_W + 60) continue
    const y = it.y
    if (it.emerge > 0) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(sx - 4, y - 4, it.w + 8, ITEM.emerge + 4)
      ctx.clip()
    }
    if (it.kind === 'mushroom' || it.kind === '1up') {
      const cap = it.kind === '1up' ? '#00c000' : C.mushroomCap
      box(ctx, sx, y + 4, it.w, 16, cap)
      box(ctx, sx + 3, y + 8, 7, 7, '#fff')
      box(ctx, sx + 18, y + 6, 6, 6, '#fff')
      box(ctx, sx + 6, y + 20, it.w - 12, 8, C.mushroomStem)
      box(ctx, sx + 8, y + 22, 4, 4, '#000')
      box(ctx, sx + 16, y + 22, 4, 4, '#000')
    } else if (it.kind === 'flower') {
      box(ctx, sx + 12, y + 14, 5, 14, C.flowerStem)
      box(ctx, sx + 2, y + 20, 10, 7, '#00c000')
      box(ctx, sx + 17, y + 18, 10, 7, '#00c000')
      box(ctx, sx + 4, y + 2, 8, 10, C.flowerPetal)
      box(ctx, sx + 16, y + 2, 8, 10, C.flowerPetal)
      box(ctx, sx + 1, y + 8, 26, 8, C.flowerPetal)
      box(ctx, sx + 9, y + 6, 10, 10, C.flowerCore)
      box(ctx, sx + 11, y + 9, 3, 3, '#000')
    } else if (it.kind === 'star') {
      const cx = sx + it.w / 2
      const cy = y + it.h / 2
      const r0 = 15
      ctx.fillStyle = C.star
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 === 0 ? r0 : r0 * 0.45
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2
        const xx = cx + Math.cos(a) * rr
        const yy = cy + Math.sin(a) * rr
        i === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy)
      }
      ctx.closePath()
      ctx.fill()
      box(ctx, cx - 6, cy - 4, 4, 5, '#000')
      box(ctx, cx + 2, cy - 4, 4, 5, '#000')
    }
    if (it.emerge > 0) ctx.restore()
  }
}

/** 火球 */
const drawFireballs = (ctx, g) => {
  for (const f of g.fireballs) {
    const sx = f.x - g.cam.x
    box(ctx, sx, f.y, f.w, f.h, C.fireball)
    box(ctx, sx + 3, f.y + 3, 6, 6, C.fireballCore)
    const a = 0.5 + 0.5 * Math.sin(f.spin)
    box(ctx, sx - 2, f.y - 2, f.w + 4, 3, `rgba(255,140,0,${a * 0.6})`)
  }
}

/** 马里奥 */
const drawPlayer = (ctx, g) => {
  const p = g.player
  const sx = p.x - g.cam.x
  if (p.invuln > 0 && Math.floor(g.tick / 4) % 2 === 0) return
  // 钻管过场：越往下越淡
  const warping = g.status === 'warpIn' || g.status === 'warpOut'
  if (warping) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, 1 - g.statusT / TIME.warp)
  }
  const fire = p.form === 'fire'
  const big = p.form !== 'small'
  const shirt = fire ? C.marioFireShirt : C.marioShirt
  const overall = fire ? C.marioFireOverall : C.marioOverall
  const dir = p.facing
  const walk = p.onGround && Math.abs(p.vx) > 0.4
  const legT = walk ? Math.floor(p.animT) % 4 : 0
  const starFlash = p.star > 0 && Math.floor(g.tick / 3) % 2 === 0
  const hat = starFlash ? '#fcd800' : C.marioHat
  const sh = starFlash ? '#fcd800' : shirt

  // 鞋
  const shoeY = p.y + p.h - 7
  if (!walk || legT === 0 || legT === 2) {
    box(ctx, sx + 1, shoeY, 9, 7, C.shoe)
    box(ctx, sx + p.w - 10, shoeY, 9, 7, C.shoe)
  } else {
    box(ctx, sx - 2, shoeY, 9, 7, C.shoe)
    box(ctx, sx + p.w - 6, shoeY, 9, 7, C.shoe)
  }
  // 裤子
  box(ctx, sx + 2, p.y + p.h - 16, p.w - 4, 10, overall)
  if (walk && (legT === 1 || legT === 3)) box(ctx, sx + 6, p.y + p.h - 12, 3, 6, '#1a28a0')
  // 上衣
  const bodyY = p.y + (big ? 14 : 9)
  const bodyH = p.h - (big ? 30 : 16)
  box(ctx, sx + 1, bodyY, p.w - 2, bodyH, sh)
  box(ctx, sx + (dir > 0 ? p.w - 8 : 3), bodyY + 2, 6, bodyH - 4, overall)
  // 手
  if (p.onGround) box(ctx, sx + (dir > 0 ? p.w - 4 : 0), bodyY + 6, 5, 8, C.skin)
  else box(ctx, sx + (dir > 0 ? p.w - 3 : -1), bodyY - 4, 5, 8, C.skin)
  // 头
  const headY = p.y + (big ? 0 : 0)
  box(ctx, sx + 3, headY + (big ? 5 : 4), p.w - 6, big ? 12 : 11, C.skin)
  box(ctx, sx + (dir > 0 ? p.w - 8 : 3), headY + (big ? 9 : 8), 4, 4, '#000')
  // 胡子
  box(ctx, sx + (dir > 0 ? 2 : 6), headY + (big ? 12 : 11), p.w - 8, 3, '#5a2000')
  // 帽子
  box(ctx, sx + 2, headY + (big ? 2 : 1), p.w - 4, 6, hat)
  box(ctx, sx + (dir > 0 ? p.w - 10 : 1), headY + (big ? 6 : 5), 9, 3, hat)
  box(ctx, sx + 3, headY + (big ? 1 : 0), 4, 3, hat)
  if (warping) ctx.restore()
}

/** 粒子与浮字 */
const drawEffects = (ctx, g) => {
  for (const pt of g.particles) {
    const sx = pt.x - g.cam.x
    const a = 1 - pt.t / pt.life
    if (pt.type === 'brick') {
      ctx.save()
      ctx.translate(sx, pt.y)
      ctx.rotate(pt.t * 0.22)
      ctx.fillStyle = C.brick
      ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size)
      ctx.restore()
      continue
    }
    if (pt.type === 'coinPop') {
      box(ctx, sx, pt.y, 14, 20, C.coin)
      box(ctx, sx + 3, pt.y + 3, 8, 14, '#fff3a0')
      continue
    }
    ctx.fillStyle = pt.type === 'spark' ? C.spark : C.dust
    ctx.globalAlpha = Math.max(0, a)
    ctx.beginPath()
    ctx.arc(sx, pt.y, pt.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
  ctx.save()
  ctx.font = 'bold 13px "Segoe UI", monospace'
  ctx.textAlign = 'center'
  for (const tx of g.texts) {
    const a = 1 - tx.t / tx.life
    ctx.globalAlpha = Math.max(0, a)
    ctx.fillStyle = '#000'
    ctx.fillText(tx.text, tx.x - g.cam.x + 1, tx.y + 1)
    ctx.fillStyle = tx.color || '#fff'
    ctx.fillText(tx.text, tx.x - g.cam.x, tx.y)
  }
  ctx.globalAlpha = 1
  ctx.restore()
}

/** 绘制一帧 */
/** 敌人判定盒（与逻辑层保持一致） */
const debugEnemyBox = (e) => {
  if (e.type === 'piranha') {
    const rise = Math.max(0, e.rise)
    return { x: e.x, y: e.pipeY - rise, w: e.w, h: Math.min(e.h, rise) }
  }
  return { x: e.x, y: e.y, w: e.w, h: e.h }
}

/** 调试叠加层：网格 / 碰撞盒 / 运行时状态 / 模式边框 */
export const drawDebugOverlay = (ctx, g) => {
  const d = g.debug
  if (!d) return
  const cam = g.cam.x
  ctx.save()

  // 模式边框：无敌金框 / 飞行青框
  if (d.godMode || d.flyMode) {
    ctx.strokeStyle = d.flyMode ? 'rgba(80,220,255,0.85)' : 'rgba(252,216,0,0.85)'
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, VIEW_W - 4, VIEW_H - 4)
  }
  if (!d.showGrid && !d.showBoxes && !d.showInfo) { ctx.restore(); return }

  const startTx = Math.max(0, Math.floor(cam / TILE))
  const endTx = Math.min(g.level.w - 1, startTx + VIEW_COLS + 1)

  if (d.showGrid) {
    ctx.strokeStyle = 'rgba(255,255,255,0.13)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let tx = startTx; tx <= endTx + 1; tx++) {
      const x = Math.round(tx * TILE - cam) + 0.5
      ctx.moveTo(x, 0)
      ctx.lineTo(x, VIEW_H)
    }
    for (let ty = 0; ty <= VIEW_ROWS; ty++) {
      const y = Math.round(ty * TILE) + 0.5
      ctx.moveTo(0, y)
      ctx.lineTo(VIEW_W, y)
    }
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,70,70,0.15)'
    for (let ty = 0; ty < g.level.h; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        if (!SOLID.has(g.level.tiles[ty][tx])) continue
        ctx.fillRect(Math.round(tx * TILE - cam), ty * TILE, TILE, TILE)
      }
    }
    ctx.font = '10px monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.textAlign = 'center'
    for (let tx = startTx; tx <= endTx; tx++) {
      if (tx % 5) continue
      ctx.fillText(String(tx), Math.round(tx * TILE - cam + TILE / 2), 11)
    }
  }

  if (d.showBoxes) {
    ctx.lineWidth = 1.5
    const rect = (o, color) => {
      ctx.strokeStyle = color
      ctx.strokeRect(Math.round(o.x - cam) + 0.5, Math.round(o.y) + 0.5, Math.round(o.w), Math.round(o.h))
    }
    for (const e of g.enemies) {
      if (e.dead) continue
      rect(debugEnemyBox(e), e.type === 'piranha' ? '#ff7ce0' : '#ff4040')
    }
    for (const it of g.items) rect(it, '#ffd24a')
    for (const c of g.coinItems) if (!c.taken) rect(c, '#fcd800')
    for (const pf of g.platforms) rect(pf, '#b08cff')
    for (const f of g.fireballs) rect(f, '#ff8c00')
    if (!g.level.bonus) {
      // 旗杆过关判定范围
      rect({ x: g.level.flag.poleX - 6, y: 0, w: 24, h: VIEW_H }, 'rgba(120,255,220,0.5)')
    }
    const p = g.player
    rect(p, p.star > 0 || d.godMode ? '#ffe866' : '#40ff80')
    // 脚底探测点
    ctx.fillStyle = '#40ff80'
    ctx.fillRect(Math.round(p.x + p.w / 2 - cam) - 1, Math.round(p.y + p.h) - 1, 3, 3)
  }

  if (d.showInfo) {
    const p = g.player
    const lines = [
      `pos ${p.x.toFixed(0)},${p.y.toFixed(0)}  tile ${Math.floor(p.x / TILE)},${Math.floor(p.y / TILE)}`,
      `vel vx ${p.vx.toFixed(2)} vy ${p.vy.toFixed(2)}  ground ${p.onGround ? 'Y' : 'N'}`,
      `coyote ${p.coyote} buffer ${p.buffer}  form ${p.form} star ${p.star}`,
      `level ${g.levelIndex} ${g.level.name} ${g.level.w}x${g.level.h}  status ${g.status}`,
      `cam ${g.cam.x.toFixed(0)}  enemy ${g.enemies.length} item ${g.items.length} coin ${g.coinItems.length}`,
      `cp ${g.checkpoint ? g.checkpoint.x.toFixed(0) : '-'}  room ${g.room ? 'BONUS' : '-'}  time ${g.timeLeft.toFixed(0)}`,
      `debug ${d.godMode ? 'GOD ' : ''}${d.flyMode ? 'FLY ' : ''}${d.freezeEnemies ? 'FRZ-E ' : ''}${d.freezeTime ? 'FRZ-T ' : ''}${d.speed}x`,
    ]
    ctx.font = '11px monospace'
    ctx.textAlign = 'left'
    let w = 0
    for (const l of lines) w = Math.max(w, ctx.measureText(l).width)
    ctx.fillStyle = 'rgba(8,4,16,0.72)'
    ctx.fillRect(6, 16, w + 14, lines.length * 14 + 8)
    ctx.fillStyle = '#8ef0b0'
    lines.forEach((l, i) => ctx.fillText(l, 13, 31 + i * 14))
  }

  ctx.restore()
}

export const drawScene = (ctx, g) => {
  drawSky(ctx, g)
  const cam = g.cam.x
  const x0 = Math.max(0, Math.floor(cam / TILE) - 1)
  const x1 = Math.min(g.level.w - 1, Math.ceil((cam + VIEW_W) / TILE) + 1)
  for (let ty = 0; ty < g.level.h; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const ch = g.level.tiles[ty][tx]
      if (ch === T.EMPTY || ch === T.HIDDEN) continue
      if (ch === T.FLAG_POLE) continue
      drawTile(ctx, g, ch, tx * TILE - cam, ty * TILE, tx, ty)
    }
  }
  drawPlatforms(ctx, g)
  drawCoins(ctx, g)
  drawFlag(ctx, g)
  drawEnemies(ctx, g)
  drawItems(ctx, g)
  drawFireballs(ctx, g)
  drawPlayer(ctx, g)
  drawEffects(ctx, g)

  if (g.warpHint) {
    const cam2 = g.cam.x
    const x = g.warpHint.x - cam2
    ctx.save()
    ctx.font = 'bold 12px "Segoe UI", monospace'
    ctx.textAlign = 'center'
    const tw = ctx.measureText(g.warpHint.text).width
    ctx.fillStyle = 'rgba(10,4,18,0.75)'
    ctx.fillRect(x - tw / 2 - 8, g.warpHint.y - 14, tw + 16, 20)
    ctx.fillStyle = '#fff'
    ctx.fillText(g.warpHint.text, x, g.warpHint.y)
    ctx.restore()
  }

  drawDebugOverlay(ctx, g)
}
