import {
  TILE, VIEW_W, VIEW_H, PHYS, PLAYER, ENEMY, ITEM, SCORE, TIME, RULE, T, SOLID, BUMPS_TO_USED,
} from './constants.js'
import { LEVELS, parseLevel, getBonusRoom, BONUS_ROOMS } from './levels.js'
import { generateLevel } from './generator.js'

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)
const aabb = (a, b) => {
  if (a.w <= 0 || a.h <= 0 || b.w <= 0 || b.h <= 0) return false
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
const rnd = (a, b) => a + Math.random() * (b - a)

/** 取瓦片字符，越界按实心墙处理 */
export const tileAt = (g, tx, ty) => {
  if (ty < 0 || ty >= g.level.h) return null
  if (tx < 0 || tx >= g.level.w) return T.STONE
  return g.level.tiles[ty][tx]
}
const setTile = (g, tx, ty, ch) => {
  if (tx < 0 || tx >= g.level.w || ty < 0 || ty >= g.level.h) return
  g.level.tiles[ty][tx] = ch
}
export const isSolid = (ch) => SOLID.has(ch)
const solidAt = (g, tx, ty) => isSolid(tileAt(g, tx, ty) || ' ')
const solidAtPx = (g, x, y) => solidAt(g, Math.floor(x / TILE), Math.floor(y / TILE))

/** 水平移动 + 碰撞解算 */
const moveX = (g, e) => {
  e.x += e.vx
  const y1 = Math.floor(e.y / TILE)
  const y2 = Math.floor((e.y + e.h - 1) / TILE)
  if (e.vx > 0) {
    const tx = Math.floor((e.x + e.w - 1) / TILE)
    for (let ty = y1; ty <= y2; ty++) {
      if (solidAt(g, tx, ty)) { e.x = tx * TILE - e.w; e.vx = 0; e.hitWall = true; break }
    }
  } else if (e.vx < 0) {
    const tx = Math.floor(e.x / TILE)
    for (let ty = y1; ty <= y2; ty++) {
      if (solidAt(g, tx, ty)) { e.x = (tx + 1) * TILE; e.vx = 0; e.hitWall = true; break }
    }
  }
}

/** 垂直移动 + 碰撞解算；上升撞头时回调顶块 */
const moveY = (g, e, onHeadHit) => {
  e.y += e.vy
  const x1 = Math.floor(e.x / TILE)
  const x2 = Math.floor((e.x + e.w - 1) / TILE)
  if (e.vy > 0) {
    // 用「脚底精确边界」取行：-1 会让刚落地的实体探测到上一行空气，导致 onGround 隔帧抖动
    const ty = Math.floor((e.y + e.h) / TILE)
    for (let tx = x1; tx <= x2; tx++) {
      if (solidAt(g, tx, ty)) { e.y = ty * TILE - e.h; e.vy = 0; e.onGround = true; break }
    }
  } else if (e.vy < 0) {
    const ty = Math.floor(e.y / TILE)
    const cx = Math.floor((e.x + e.w / 2) / TILE)
    const order = [cx]
    for (let tx = x1; tx <= x2; tx++) if (tx !== cx) order.push(tx)
    for (const tx of order) {
      if (!solidAt(g, tx, ty)) continue
      // 顶角容错：只蹭到边角时横向微调放行
      const gapRight = (tx + 1) * TILE - e.x
      const gapLeft = e.x + e.w - tx * TILE
      if (gapRight <= PHYS.cornerAssist) { e.x = (tx + 1) * TILE; continue }
      if (gapLeft <= PHYS.cornerAssist) { e.x = tx * TILE - e.w; continue }
      e.y = (ty + 1) * TILE
      e.vy = 0
      if (onHeadHit) onHeadHit(tx, ty)
      break
    }
  }
}

/** 前方是否有地面（敌人悬崖 detection） */
const groundAhead = (g, e) => {
  const tx = Math.floor((e.vx > 0 ? e.x + e.w + 2 : e.x - 2) / TILE)
  const ty = Math.floor((e.y + e.h + 4) / TILE)
  return solidAt(g, tx, ty)
}

/** 边缘吸附：下落时距地面 7px 内直接吸附站立 */
const edgeAssist = (g, e) => {
  if (e.vy <= 0) return false
  const feet = e.y + e.h
  const ty = Math.floor((feet + PHYS.edgeAssist) / TILE)
  if (ty === Math.floor(feet / TILE)) return false
  const x1 = Math.floor((e.x + 3) / TILE)
  const x2 = Math.floor((e.x + e.w - 3) / TILE)
  for (let tx = x1; tx <= x2; tx++) {
    if (solidAt(g, tx, ty) && feet > ty * TILE - PHYS.edgeAssist) {
      e.y = ty * TILE - e.h
      e.vy = 0
      e.onGround = true
      return true
    }
  }
  return false
}

const FORM_SIZE = { small: { w: PLAYER.smallW, h: PLAYER.smallH }, big: { w: PLAYER.bigW, h: PLAYER.bigH }, fire: { w: PLAYER.bigW, h: PLAYER.bigH } }

const setForm = (g, form) => {
  const p = g.player
  const oldH = p.h
  const size = FORM_SIZE[form]
  p.form = form
  p.w = size.w
  p.h = size.h
  p.y += oldH - size.h
}

const addText = (g, text, x, y, color) => {
  g.texts.push({ text, x, y, t: 0, life: 60, color: color || '#fff' })
}
const addScore = (g, v, x, y) => {
  g.score += v
  if (x !== undefined) addText(g, String(v), x, y)
}
const burst = (g, x, y, type, n, color) => {
  for (let i = 0; i < n; i++) {
    g.particles.push({
      type, x, y, vx: rnd(-2.4, 2.4), vy: rnd(-4.2, -1.2), t: 0, life: type === 'brick' ? 52 : 26,
      size: type === 'brick' ? 7 : 5, color,
    })
  }
}

/** 调试开关默认值（外部可传入同一个 reactive 对象，实现面板与逻辑双向同步） */
export const defaultDebug = () => ({
  /** 无敌：不扣形态、不死亡，碰到敌人直接秒杀 */
  godMode: false,
  /** 穿墙飞行：方向键自由移动，忽略重力与碰撞 */
  flyMode: false,
  /** 冻结敌人（停止一切敌人行为） */
  freezeEnemies: false,
  /** 冻结倒计时 */
  freezeTime: false,
  /** 绘制碰撞盒 */
  showBoxes: false,
  /** 绘制瓦片网格 */
  showGrid: false,
  /** 绘制运行时状态 */
  showInfo: false,
  /** 游戏倍速 */
  speed: 1,
})

/** 创建对局 */
export const createGame = (opts = {}) => {
  const g = {
    mode: opts.mode || 'story',
    debug: opts.debug || defaultDebug(),
    levelIndex: opts.levelIndex || 0,
    status: 'play',
    statusT: 0,
    paused: false,
    lives: opts.lives ?? RULE.lives,
    score: 0,
    coins: 0,
    timeLeft: TIME.level,
    level: null,
    player: null,
    enemies: [],
    items: [],
    coinItems: [],
    fireballs: [],
    particles: [],
    texts: [],
    bumps: [],
    platforms: [],
    cam: { x: 0 },
    chain: 0,
    chainT: 0,
    multiCoin: null,
    tick: 0,
    message: '',
    flagSlide: 0,
    warpHint: null,
    unlocked: opts.unlocked ?? 0,
    /** 场景栈：进入隐藏管道时压入主关卡快照 */
    stack: [],
    /** 当前是否身处奖励房 */
    room: null,
    /** 管道过场临时数据 */
    pending: null,
    /** 最近触发的中途存档点（脚底坐标），死亡 / 重来从这里开始 */
    checkpoint: null,
    /** 已激活的存档点瓦片 key 集合 */
    checkpoints: new Set(),
    seed: opts.seed ?? Math.floor(Math.random() * 1e9),
  }
  loadLevel(g, g.levelIndex)
  return g
}

/** 载入关卡（无尽模式走生成器） */
const loadLevel = (g, index) => {
  const def = g.mode === 'endless' ? generateLevel(index, g.seed) : LEVELS[Math.min(index, LEVELS.length - 1)]
  g.levelDef = def
  g.level = parseLevel(def)
  g.levelIndex = index
  g.stack.length = 0
  g.room = null
  g.pending = null
  g.checkpoint = null
  g.checkpoints = new Set()
  resetEntities(g)
  fitCam(g)
  g.timeLeft = TIME.level
}

/** 重置关卡实体（重来 / 复活） */
const resetEntities = (g) => {
  const lv = g.level
  const keepForm = g.player ? g.player.form : 'small'
  const cp = g.checkpoint
  const startX = cp ? cp.x : lv.spawn.x
  const startY = cp ? cp.footY - PLAYER.smallH : lv.spawn.y
  g.player = {
    x: startX, y: startY, w: PLAYER.smallW, h: PLAYER.smallH,
    vx: 0, vy: 0, onGround: false, facing: 1, animT: 0, form: 'small',
    invuln: 0, star: 0, fireCd: 0, coyote: 0, buffer: 0, jumping: false,
    dead: false, onPlatform: null, warpStand: null,
  }
  setForm(g, keepForm === 'small' ? 'small' : keepForm)
  g.enemies = []
  g.items = []
  g.coinItems = []
  g.fireballs = []
  g.particles = []
  g.texts = []
  g.bumps = []
  g.platforms = lv.platforms.map((p) => ({ ...p, dx: 0, dy: 0, t: 0 }))
  g.chain = 0
  g.multiCoin = null
  g.status = 'play'
  g.statusT = 0
  g.flagSlide = 0
  g.message = ''

  // 收集金币 / 食人花 / 敌人
  for (let y = 0; y < lv.h; y++) {
    for (let x = 0; x < lv.w; x++) {
      const ch = lv.tiles[y][x]
      if (ch === T.COIN) {
        g.coinItems.push({ x: x * TILE + 6, y: y * TILE + 6, w: 20, h: 24, taken: false })
        lv.tiles[y][x] = T.EMPTY
      } else if (ch === T.PIPE_PLANT) {
        // 一根管道只放一朵花（'PP' 连续列合并），横向居中
        if (x > 0 && lv.tiles[y][x - 1] === T.PIPE_PLANT) continue
        let cols = 1
        while (lv.tiles[y][x + cols] === T.PIPE_PLANT) cols++
        g.enemies.push({
          type: 'piranha', x: x * TILE + (cols * TILE - ENEMY.piranha.w) / 2, w: ENEMY.piranha.w, h: ENEMY.piranha.h,
          y: y * TILE - ENEMY.piranha.h, pipeY: y * TILE, rise: 0, phase: 'idle',
          wait: Math.floor(rnd(ENEMY.piranha.idleMin * 0.4, ENEMY.piranha.idleMax)),
          noStomp: true, dead: false, facing: -1,
        })
      }
    }
  }
  for (const s of lv.enemies) spawnEnemy(g, s.type, s.x, s.y, s.homeY)
}

const spawnEnemy = (g, type, x, y, homeY) => {
  const cfg = ENEMY[type] || ENEMY.goomba
  const e = {
    type, x, y, w: cfg.w, h: cfg.h, vx: type === 'crow' ? -cfg.speed : -cfg.speed, vy: 0,
    onGround: false, dead: false, deadT: 0, shell: false, shellStill: false, kickCd: 0,
    homeX: x, homeY: homeY ?? y, t: Math.floor(rnd(0, 120)), noStomp: type === 'spiny' || type === 'piranha',
    facing: -1, throwCd: Math.floor(rnd(60, 160)), spin: 0,
  }
  if (type === 'koopa') e.h = cfg.h
  g.enemies.push(e)
  return e
}

/** 顶砖 / 顶问号块 */
const bumpBlock = (g, tx, ty) => {
  g.bumps.push({ tx, ty, t: 0 })
  // 顶块时顺带干掉站在上面的敌人
  const bx = tx * TILE
  const by = ty * TILE
  for (const e of g.enemies) {
    if (e.dead || e.type === 'crow' || e.type === 'lakitu' || e.type === 'piranha') continue
    if (e.x + e.w > bx - 4 && e.x < bx + TILE + 4 && Math.abs(e.y + e.h - by) < 8) killEnemy(g, e, true)
  }
}

const popCoin = (g, tx, ty) => {
  g.particles.push({ type: 'coinPop', x: tx * TILE + 6, y: ty * TILE, vy: -7, t: 0, life: 40, size: 10 })
  g.coins++
  addScore(g, SCORE.blockCoin, tx * TILE + 4, ty * TILE - 8)
  if (g.coins % RULE.coinsPerLife === 0) {
    g.lives++
    addText(g, '1UP!', tx * TILE, ty * TILE - 24, '#7cff7c')
  }
}

const spawnItem = (g, kind, tx, ty) => {
  g.items.push({
    kind, x: tx * TILE + 2, y: ty * TILE, w: ITEM.w, h: ITEM.h, vx: 0, vy: 0,
    emerge: ITEM.emerge, onGround: false, t: 0,
  })
}

const onHeadHit = (g) => (tx, ty) => {
  const ch = tileAt(g, tx, ty)
  if (ch === T.BRICK) {
    if (g.player.form !== 'small') {
      setTile(g, tx, ty, T.EMPTY)
      burst(g, tx * TILE + 16, ty * TILE + 16, 'brick', 6, '#c84c0c')
      addScore(g, SCORE.brick, tx * TILE + 4, ty * TILE)
    } else {
      bumpBlock(g, tx, ty)
    }
  } else if (BUMPS_TO_USED.has(ch)) {
    setTile(g, tx, ty, T.USED)
    bumpBlock(g, tx, ty)
    if (ch === T.COIN_BLOCK) popCoin(g, tx, ty)
    else if (ch === T.POWER_BLOCK) spawnItem(g, g.player.form === 'small' ? 'mushroom' : 'flower', tx, ty)
    else if (ch === T.MULTI_BLOCK) g.multiCoin = { tx, ty, left: 5, t: 0 }
    else if (ch === T.HIDDEN) { addText(g, '隐藏砖块!', tx * TILE - 10, ty * TILE - 12, '#fcd800'); spawnItem(g, '1up', tx, ty) }
  }
}

/** 受伤：火→大→小→死亡 */
const hurt = (g) => {
  const p = g.player
  if (p.dead || p.star > 0 || p.invuln > 0 || g.debug.godMode) return
  if (p.form === 'fire') {
    setForm(g, 'big')
    p.invuln = TIME.invuln
    addText(g, '-1 火力', p.x, p.y - 10, '#ff9c9c')
  } else if (p.form === 'big') {
    setForm(g, 'small')
    p.invuln = TIME.invuln
    addText(g, '变小了', p.x, p.y - 10, '#ff9c9c')
  } else {
    die(g)
  }
}

const die = (g) => {
  const p = g.player
  if (p.dead) return
  p.dead = true
  p.vx = 0
  p.vy = PLAYER.deathVel
  g.status = 'dying'
  g.statusT = 0
  g.chain = 0
}

/** 击杀敌人 */
const killEnemy = (g, e, byBlock) => {
  if (e.dead) return
  if (e.type === 'koopa' && !e.shell) {
    e.shell = true
    e.shellStill = true
    e.h = ENEMY.koopa.shellH
    e.y += ENEMY.koopa.h - ENEMY.koopa.shellH
    e.vx = 0
    g.chain++
    addScore(g, chainScore(SCORE.stompChain, g.chain), e.x, e.y - 8)
    burst(g, e.x + e.w / 2, e.y + e.h / 2, 'dust', 4)
    return
  }
  e.dead = true
  e.deadT = 0
  if (!byBlock) {
    g.chain++
    addScore(g, chainScore(SCORE.stompChain, g.chain), e.x, e.y - 8)
  } else {
    addScore(g, SCORE.stompChain[0], e.x, e.y - 8)
  }
  burst(g, e.x + e.w / 2, e.y + e.h / 2, e.type === 'goomba' ? 'dust' : 'spark', 5)
}

const chainScore = (table, chain) => table[Math.min(chain - 1, table.length - 1)]

/** 踢龟壳 */
const kickShell = (g, e) => {
  const p = g.player
  const dir = p.x + p.w / 2 < e.x + e.w / 2 ? 1 : -1
  e.shellStill = false
  e.vx = ENEMY.koopa.shellSpeed * dir
  e.kickCd = 12
  p.x += dir < 0 ? 2 : -2
  g.chain++
  addScore(g, chainScore(SCORE.shellKillChain, g.chain), e.x, e.y - 8)
}

/** 玩家 vs 敌人 */
const playerVsEnemies = (g) => {
  const p = g.player
  if (p.dead) return
  for (const e of g.enemies) {
    if (e.dead) continue
    const box = enemyBox(e)
    if (!aabb(p, box)) continue
    if (p.star > 0) { killEnemy(g, e); continue }
    if (e.type === 'koopa' && e.shell) {
      if (e.shellStill) { if (e.kickCd <= 0) kickShell(g, e) }
      else if (e.kickCd <= 0) hurt(g)
      continue
    }
    const falling = p.vy > 0
    const fromAbove = p.y + p.h - e.y < e.h * 0.62
    if (falling && fromAbove && !e.noStomp) {
      p.vy = PLAYER.stompBounce
      p.y = e.y - p.h
      p.onGround = false
      killEnemy(g, e)
    } else {
      hurt(g)
    }
  }
}

/** 敌人判定盒（食人花随升降变化） */
const enemyBox = (e) => {
  if (e.type === 'piranha') {
    const rise = Math.max(0, e.rise)
    return { x: e.x, y: e.pipeY - rise, w: e.w, h: Math.min(e.h, rise) }
  }
  return { x: e.x, y: e.y, w: e.w, h: e.h }
}

const updatePlatforms = (g) => {
  for (const p of g.platforms) {
    if (p.homeX === undefined) { p.homeX = p.x; p.homeY = p.y }
    const ox = p.x
    const oy = p.y
    p.t += p.speed * 0.04
    if (p.axis === 'h') p.x = p.homeX + Math.sin(p.t) * p.range
    else p.y = p.homeY + Math.sin(p.t) * p.range
    p.dx = p.x - ox
    p.dy = p.y - oy
  }
}

/** 移动平台与玩家的碰撞 */
const playerVsPlatforms = (g) => {
  const p = g.player
  let riding = null
  for (const pf of g.platforms) {
    const overlapX = p.x + p.w > pf.x + 2 && p.x < pf.x + pf.w - 2
    if (!overlapX) continue
    const top = pf.y
    if (p.vy >= 0 && p.y + p.h - p.vy <= top + 2 && p.y + p.h >= top - 1) {
      p.y = top - p.h
      p.vy = 0
      p.onGround = true
      riding = pf
    } else if (Math.abs(p.y + p.h - top) < 2 && overlapX) {
      riding = pf
    }
  }
  if (riding) {
    p.x += riding.dx
    p.y += riding.dy
  }
  p.onPlatform = riding
}

/** 调试救援：掉出世界时把玩家放回最近存档点 / 出生点上方 */
const rescue = (g) => {
  const p = g.player
  const base = g.checkpoint || { x: g.level.spawn.x, footY: g.level.spawn.y + PLAYER.smallH }
  p.x = base.x
  p.y = base.footY - p.h
  p.vx = 0
  p.vy = 0
  p.onGround = true
  fitCam(g)
  addText(g, 'RESCUE!', p.x, p.y - 26, '#7cff7c')
}

const updatePlayer = (g, input) => {
  const p = g.player
  if (p.dead) {
    p.vy = Math.min(p.vy + PHYS.gravity, PHYS.maxFall)
    p.y += p.vy
    return
  }
  // 调试飞行：无重力、无碰撞，方向键自由移动（↑ 上升 / ↓ 下降）
  if (g.debug.flyMode) {
    const spd = (input.run ? PHYS.maxRun : PHYS.maxWalk) * 1.8
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    p.vx = dir * spd
    p.vy = input.jump ? -spd : (input.down ? spd : 0)
    if (dir !== 0) p.facing = dir
    p.x = clamp(p.x + p.vx, 0, Math.max(0, g.level.w * TILE - p.w))
    p.y = clamp(p.y + p.vy, -TILE, g.level.h * TILE)
    p.onGround = false
    p.animT += 1
    if (p.invuln > 0) p.invuln--
    if (p.star > 0) p.star--
    return
  }
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  const starBoost = p.star > 0 ? PHYS.starSpeed : 1
  const maxSpeed = (input.run ? PHYS.maxRun : PHYS.maxWalk) * starBoost
  const accel = p.onGround ? (input.run ? PHYS.runAccel : PHYS.walkAccel) : PHYS.airAccel
  if (dir !== 0) {
    const nvx = p.vx + dir * accel
    p.facing = dir
    if (Math.abs(nvx) > maxSpeed && Math.sign(nvx) === dir) {
      // 已在上限内：封顶；已超速（星星/惯性）：缓慢回落
      p.vx = Math.abs(p.vx) > maxSpeed
        ? dir * Math.max(maxSpeed, Math.abs(p.vx) - 0.34)
        : dir * maxSpeed
    } else {
      p.vx = nvx
    }
  } else if (Math.abs(p.vx) <= PHYS.friction) {
    p.vx = 0
  } else {
    p.vx -= Math.sign(p.vx) * PHYS.friction
  }
  p.vx = clamp(p.vx, -PHYS.maxRun * 1.6, PHYS.maxRun * 1.6)

  // 郊狼时间 + 输入缓冲 + 可变跳
  if (input.jumpPressed) p.buffer = PHYS.buffer
  else if (p.buffer > 0) p.buffer--
  if (p.onGround) p.coyote = PHYS.coyote
  else if (p.coyote > 0) p.coyote--
  if (p.buffer > 0 && p.coyote > 0) {
    p.vy = PHYS.jumpVel
    p.onGround = false
    p.coyote = 0
    p.buffer = 0
    p.jumping = true
  }
  if (p.jumping && !input.jump && p.vy < PHYS.jumpCut) {
    p.vy = PHYS.jumpCut
    p.jumping = false
  }
  if (p.vy >= 0) p.jumping = false
  const grav = p.vy < 0 && input.jump ? PHYS.holdGravity : (p.vy > 0 ? PHYS.fallGravity : PHYS.gravity)
  p.vy = Math.min(p.vy + grav, PHYS.maxFall)

  p.onGround = false
  moveX(g, p)
  updatePlatforms(g)
  playerVsPlatforms(g)
  if (p.onPlatform) {
    if (p.vy < 0) moveY(g, p, onHeadHit(g))
    else { p.y = p.onPlatform.y - p.h; p.vy = 0 }
  } else if (!edgeAssist(g, p)) {
    moveY(g, p, onHeadHit(g))
  }
  if (p.onGround) p.coyote = PHYS.coyote

  p.animT += Math.abs(p.vx) * 0.12
  if (p.invuln > 0) p.invuln--
  if (p.star > 0) {
    p.star--
    if (g.tick % 3 === 0) g.particles.push({ type: 'spark', x: p.x + p.w / 2, y: p.y + p.h / 2, vx: rnd(-1.5, 1.5), vy: rnd(-1.5, 1.5), t: 0, life: 18, size: 4 })
  }
  if (p.fireCd > 0) p.fireCd--

  // 秘密管道：站在管口按下键进入奖励房；站在金色管道上按下键回到原路
  const footTx = Math.floor((p.x + p.w / 2) / TILE)
  const footTy = Math.floor((p.y + p.h + 2) / TILE)
  const footTile = tileAt(g, footTx, footTy)
  g.warpHint = null
  if (p.onGround && !p.dead) {
    if (footTile === T.WARP) {
      g.warpHint = { x: p.x + p.w / 2, y: p.y - 22, text: '↓ 进入隐藏管道' }
      if (input.down) startWarp(g, footTx, footTy, 'in')
    } else if (footTile === T.BONUS_EXIT) {
      g.warpHint = { x: p.x + p.w / 2, y: p.y - 22, text: '↓ 回到蘑菇王国' }
      if (input.down) startWarp(g, footTx, footTy, 'out')
    }
  }

  if (p.y > g.level.h * TILE + 80) {
    // 无敌模式下不掉坑身亡：直接救回存档点，保持调试连贯性
    if (g.debug.godMode) rescue(g)
    else die(g)
  }
}

/** 管道口往上扫到顶行 */
const pipeTopRow = (g, tx, ty, ch) => {
  let top = ty
  while (top > 0 && tileAt(g, tx, top - 1) === ch) top--
  return top
}

/** 用过的隐藏管道：整根降级为普通管道，出来了就钻不回去了 */
const consumeWarpPipe = (g, tx, ty) => {
  const rows = g.level.tiles
  const row = rows[ty]
  if (!row) return
  const cols = [tx]
  let l = tx
  while (l > 0 && row[l - 1] === T.WARP) cols.push(--l)
  let r = tx
  while (row[r + 1] === T.WARP) cols.push(++r)
  for (let y = 0; y < rows.length; y++) {
    for (const c of cols) if (rows[y] && rows[y][c] === T.WARP) rows[y][c] = T.PIPE
  }
}

/** 进入 / 离开隐藏管道：先播钻管动画（马里奥下沉并淡出），再切场景 */
const startWarp = (g, tx, ty, dir) => {
  const p = g.player
  const ch = tileAt(g, tx, ty)
  const returnTy = pipeTopRow(g, tx, ty, ch)
  g.pending = {
    dir,
    // 同一根管道固定通向同一个房间（按列号取模），反复进出不会出现"换了个地方"
    roomIndex: tx % BONUS_ROOMS.length,
    returnTx: tx,
    returnTy,
  }
  // 每根隐藏管道只送一次：进房瞬间就把它变成普通管道，重开关卡才会恢复
  if (dir === 'in') consumeWarpPipe(g, tx, ty)
  g.status = dir === 'in' ? 'warpIn' : 'warpOut'
  g.statusT = 0
  g.warpHint = null
  p.vx = 0
  p.vy = 0
  addText(g, dir === 'in' ? 'WELCOME!' : 'THANK YOU!', p.x, p.y - 30, '#7cff7c')
}

/** 场景快照：保存被顶过/吃过的瓦片与实体，回来后原样继续 */
const snapshotScene = (g) => ({
  level: g.level,
  levelDef: g.levelDef,
  tiles: g.level.tiles.map((row) => row.slice()),
  platforms: g.platforms.map((p) => ({ ...p })),
  enemies: g.enemies.map((e) => ({ ...e })),
  items: g.items.map((it) => ({ ...it })),
  coinItems: g.coinItems.map((c) => ({ ...c })),
  player: { ...g.player },
  chain: g.chain,
  chainT: g.chainT,
  multiCoin: g.multiCoin ? { ...g.multiCoin } : null,
  timeLeft: g.timeLeft,
})

const restoreScene = (g, back) => {
  g.levelDef = back.levelDef
  g.level = back.level
  for (let y = 0; y < back.tiles.length; y++) g.level.tiles[y] = back.tiles[y].slice()
  g.platforms = back.platforms
  g.enemies = back.enemies
  g.items = back.items
  g.coinItems = back.coinItems
  g.player = back.player
  g.chain = back.chain
  g.chainT = back.chainT
  g.multiCoin = back.multiCoin
  g.fireballs = []
  g.particles = []
  g.texts = []
  g.bumps = []
}

/** 相机对位（场景切换后玩家可能不在原相机位置） */
const fitCam = (g) => {
  const p = g.player
  const maxX = Math.max(0, g.level.w * TILE - VIEW_W)
  g.cam.x = clamp(p.x + p.w / 2 - VIEW_W * 0.42, 0, maxX)
  if (p.x < g.cam.x) g.cam.x = Math.max(0, p.x - 8)
}

/** 进入金币奖励房 */
const enterBonusRoom = (g, roomIndex) => {
  const back = snapshotScene(g)
  back.returnTx = g.pending.returnTx
  back.returnTy = g.pending.returnTy
  g.stack.push(back)
  const def = getBonusRoom(roomIndex)
  g.levelDef = def
  g.level = parseLevel(def)
  g.room = { index: roomIndex }
  resetEntities(g)
  g.cam.x = 0
  g.status = 'play'
  g.statusT = 0
  g.timeLeft = Math.max(g.timeLeft, back.timeLeft)
  g.player.invuln = Math.max(g.player.invuln, 40)
  g.message = `隐藏管道 · ${def.name}`
}

/** 回到原管道口，继续原来的路程 */
const leaveBonusRoom = (g) => {
  const back = g.stack.pop()
  if (!back) return
  restoreScene(g, back)
  g.room = null
  const p = g.player
  p.x = back.returnTx * TILE + (TILE - p.w) / 2
  p.y = back.returnTy * TILE - p.h
  p.vx = 0
  p.vy = 0
  p.onGround = true
  p.invuln = Math.max(p.invuln, 60)
  p.star = Math.max(p.star, 0)
  fitCam(g)
  g.status = 'play'
  g.statusT = 0
  g.timeLeft = Math.max(g.timeLeft, back.timeLeft)
  g.message = '回到路上！'
  addText(g, 'COME BACK!', p.x, p.y - 30, '#fcd800')
}

const updateEnemies = (g) => {
  const p = g.player
  for (const e of g.enemies) {
    if (e.dead) { e.deadT++; continue }
    e.t++
    if (e.kickCd > 0) e.kickCd--
    if (e.type === 'piranha') { updatePiranha(g, e); continue }
    if (e.type === 'crow') { updateCrow(g, e); continue }
    if (e.type === 'lakitu') { updateLakitu(g, e); continue }

    // 距离过远不模拟（省算力，也避免远处敌人乱跑）
    if (Math.abs(e.x - p.x) > VIEW_W * 1.2 && e.type !== 'koopa') { e.frozen = true; continue }
    e.frozen = false

    if (e.type === 'koopa' && e.shell) {
      if (!e.shellStill) {
        e.vy = Math.min(e.vy + PHYS.gravity, PHYS.maxFall)
        e.hitWall = false
        e.onGround = false
        moveX(g, e)
        if (e.hitWall) e.vx = -e.vx
        moveY(g, e)
        for (const o of g.enemies) {
          if (o === e || o.dead || o.type === 'piranha' || o.type === 'crow' || o.type === 'lakitu') continue
          if (aabb(enemyBox(e), enemyBox(o))) {
            g.chain++
            addScore(g, chainScore(SCORE.shellKillChain, g.chain), o.x, o.y - 8)
            if (o.type === 'koopa' && !o.shell) { o.shell = true; o.shellStill = true; o.h = ENEMY.koopa.shellH; o.y += ENEMY.koopa.h - ENEMY.koopa.shellH; o.vx = 0 } else { o.dead = true; burst(g, o.x + o.w / 2, o.y + o.h / 2, 'spark', 5) }
          }
        }
      }
      continue
    }

    e.vx = (e.facing < 0 ? -1 : 1) * (ENEMY[e.type] || ENEMY.goomba).speed
    e.hitWall = false
    moveX(g, e)
    if (e.hitWall) e.facing = -e.facing
    e.vy = Math.min(e.vy + PHYS.gravity, PHYS.maxFall)
    e.onGround = false
    moveY(g, e)
    if (e.onGround && !groundAhead(g, e)) e.facing = -e.facing
  }
  // 清理死亡实体
  g.enemies = g.enemies.filter((e) => !e.dead || e.deadT < 40)
}

/** 玩家是否正站在该管道口上（原版行为：踩在管口时食人花不出来） */
const playerOnPipe = (g, e) => {
  const p = g.player
  if (p.dead) return false
  if (p.x + p.w <= e.x - 4 || p.x >= e.x + e.w + 4) return false
  return Math.abs(p.y + p.h - e.pipeY) <= 6
}

const updatePiranha = (g, e) => {
  const cfg = ENEMY.piranha
  // 站在管口：花强制缩回并保持（原版行为），避免刚落地就被判定
  if (playerOnPipe(g, e)) {
    if (e.rise > 0) e.rise = Math.max(0, e.rise - cfg.rise * 2)
    if (e.rise <= 0) { e.phase = 'idle'; e.wait = cfg.idleMin }
    return
  }
  // phase: idle 缩回等待 / up 探出 / hold 顶端停留 / down 缩回
  // 计时必须用独立的 e.wait：updateEnemies 每帧会对所有敌人 e.t++，共用会让倒计时冻结
  switch (e.phase) {
    case 'up':
      e.rise = Math.min(e.rise + cfg.rise, cfg.top)
      if (e.rise >= cfg.top) { e.phase = 'hold'; e.wait = cfg.waitUp }
      break
    case 'hold':
      if (--e.wait <= 0) e.phase = 'down'
      break
    case 'down':
      e.rise = Math.max(0, e.rise - cfg.rise)
      if (e.rise <= 0) { e.phase = 'idle'; e.wait = Math.floor(rnd(cfg.idleMin, cfg.idleMax)) }
      break
    default:
      if (--e.wait <= 0) e.phase = 'up'
  }
}

const updateCrow = (g, e) => {
  const cfg = ENEMY.crow
  const p = g.player
  if (Math.abs(e.x - p.x) > VIEW_W) return
  e.x += e.facing * cfg.speed
  if (e.x < e.homeX - 140) e.facing = 1
  if (e.x > e.homeX + 140) e.facing = -1
  e.y = e.homeY + Math.sin(e.t * 0.045) * 22
  if (e.t % 40 === 0) e.flap = (e.flap || 0) + 1
}

const updateLakitu = (g, e) => {
  const p = g.player
  const target = p.x + 150
  e.x += clamp(target - e.x, -ENEMY.lakitu.speed, ENEMY.lakitu.speed)
  e.y = e.homeY + Math.sin(e.t * 0.03) * 12
  e.throwCd--
  if (e.throwCd <= 0 && Math.abs(e.x - p.x) < VIEW_W * 0.8) {
    e.throwCd = Math.floor(rnd(150, 240))
    const sp = spawnEnemy(g, 'spiny', e.x + 4, e.y + 20, e.y)
    sp.vx = clamp((p.x - e.x) / 46, -2.6, 2.6)
    sp.vy = -2.4
    sp.facing = sp.vx < 0 ? -1 : 1
  }
}

const updateItems = (g) => {
  for (const it of g.items) {
    it.t++
    if (it.emerge > 0) {
      it.emerge--
      it.y -= 1
      continue
    }
    if (it.kind === 'flower') continue
    if (!it.dir) it.dir = 1
    it.vx = it.dir * ITEM.speed
    it.hitWall = false
    moveX(g, it)
    if (it.hitWall) it.dir = -it.dir
    it.vy = Math.min(it.vy + PHYS.gravity, PHYS.maxFall)
    it.onGround = false
    moveY(g, it)
    if (it.kind === 'star' && it.onGround) it.vy = -5.6
    if (it.y > g.level.h * TILE + 60) it.taken = true
  }
  g.items = g.items.filter((it) => !it.taken)
}

const playerVsItems = (g) => {
  const p = g.player
  if (p.dead) return
  for (const it of g.items) {
    if (it.taken || it.emerge > 0) continue
    if (!aabb(p, it)) continue
    it.taken = true
    if (it.kind === 'mushroom') {
      if (p.form === 'small') setForm(g, 'big')
      addScore(g, SCORE.mushroom, it.x, it.y - 10)
      addText(g, '变大!', p.x, p.y - 24, '#ffd0d0')
    } else if (it.kind === 'flower') {
      setForm(g, 'fire')
      addScore(g, SCORE.flower, it.x, it.y - 10)
      addText(g, '火力!', p.x, p.y - 24, '#ffb060')
    } else if (it.kind === 'star') {
      p.star = TIME.star
      addScore(g, SCORE.star, it.x, it.y - 10)
      addText(g, '无敌!', p.x, p.y - 24, '#fcd800')
    } else if (it.kind === '1up') {
      g.lives++
      addText(g, '1UP!', it.x, it.y - 10, '#7cff7c')
    }
  }
}

const playerVsCoins = (g) => {
  const p = g.player
  if (p.dead) return
  for (const c of g.coinItems) {
    if (c.taken) continue
    if (!aabb(p, c)) continue
    c.taken = true
    g.coins++
    addScore(g, SCORE.coin, c.x, c.y - 10)
    g.particles.push({ type: 'coinPop', x: c.x, y: c.y - 4, vy: -6, t: 0, life: 34, size: 9 })
    if (g.coins % RULE.coinsPerLife === 0) {
      g.lives++
      addText(g, '1UP!', c.x, c.y - 26, '#7cff7c')
    }
  }
}

const updateFireballs = (g) => {
  const p = g.player
  if (p.form === 'fire' && g.inputFire && p.fireCd <= 0 && g.fireballs.length < RULE.maxFireballs) {
    p.fireCd = TIME.fireCooldown
    g.fireballs.push({ x: p.facing > 0 ? p.x + p.w : p.x - 10, y: p.y + p.h * 0.34, w: 12, h: 12, vx: 7.4 * p.facing, vy: 2, life: 130, spin: 0 })
  }
  for (const f of g.fireballs) {
    f.life--
    f.spin += 0.4
    f.vy = Math.min(f.vy + 0.52, 9)
    f.hitWall = false
    moveX(g, f)
    f.onGround = false
    moveY(g, f)
    if (f.hitWall || f.life <= 0) { f.dead = true; burst(g, f.x, f.y, 'spark', 4, '#ff8c00'); continue }
    if (f.onGround) f.vy = -5.4
    for (const e of g.enemies) {
      if (e.dead || e.type === 'piranha' && e.rise <= 12) continue
      if (!aabb(f, enemyBox(e))) continue
      f.dead = true
      killEnemy(g, e, true)
      addScore(g, SCORE.stompChain[0], e.x, e.y)
      burst(g, f.x, f.y, 'spark', 5, '#ff8c00')
      break
    }
  }
  g.fireballs = g.fireballs.filter((f) => !f.dead)
}

const updateEffects = (g) => {
  for (const b of g.bumps) b.t++
  g.bumps = g.bumps.filter((b) => b.t < 12)
  for (const pt of g.particles) {
    pt.t++
    if (pt.type === 'coinPop') {
      pt.y += pt.vy
      pt.vy += 0.42
      if (pt.vy > 0 && pt.t > 22) pt.dead = true
      if (pt.t >= pt.life) pt.dead = true
      continue
    }
    pt.x += pt.vx
    pt.y += pt.vy
    pt.vy += 0.32
    if (pt.t >= pt.life) pt.dead = true
  }
  g.particles = g.particles.filter((pt) => !pt.dead)
  for (const tx of g.texts) { tx.t++; tx.y -= 0.5; if (tx.t >= tx.life) tx.dead = true }
  g.texts = g.texts.filter((tx) => !tx.dead)
  if (g.chainT > 0) { g.chainT--; if (g.chainT <= 0) g.chain = 0 }
  if (g.multiCoin) {
    g.multiCoin.t++
    if (g.multiCoin.t % 9 === 0 && g.multiCoin.left > 0) {
      g.multiCoin.left--
      popCoin(g, g.multiCoin.tx, g.multiCoin.ty)
    }
    if (g.multiCoin.left <= 0) g.multiCoin = null
  }
}

const updateCam = (g) => {
  const p = g.player
  const maxX = Math.max(0, g.level.w * TILE - VIEW_W)
  const target = p.x + p.w / 2 - VIEW_W * 0.42
  if (target > g.cam.x) g.cam.x = target
  g.cam.x = clamp(g.cam.x, 0, maxX)
  if (p.x < g.cam.x) { p.x = g.cam.x; if (p.vx < 0) p.vx = 0 }
}

/** 触碰中途存档点：记录重生点、补时间 */
const checkCheckpoint = (g) => {
  if (g.level.bonus) return
  const p = g.player
  const tiles = g.level.tiles
  const x0 = Math.floor(p.x / TILE)
  const x1 = Math.floor((p.x + p.w - 1) / TILE)
  const y0 = Math.floor(p.y / TILE)
  const y1 = Math.floor((p.y + p.h - 1) / TILE)
  for (let tx = x0; tx <= x1; tx++) {
    for (let ty = y0; ty <= y1; ty++) {
      if ((tiles[ty] || [])[tx] !== T.CHECKPOINT) continue
      // 旗杆由多格竖排组成：整根一起标记，重生点取最底格（脚踩地面那一格）
      let top = ty
      let bot = ty
      while ((tiles[top - 1] || [])[tx] === T.CHECKPOINT) top--
      while ((tiles[bot + 1] || [])[tx] === T.CHECKPOINT) bot++
      if (g.checkpoints.has(tx + ',' + top)) continue
      for (let y = top; y <= bot; y++) g.checkpoints.add(tx + ',' + y)
      g.checkpoint = { x: tx * TILE + 4, footY: (bot + 1) * TILE }
      g.timeLeft = Math.min(TIME.level, g.timeLeft + TIME.checkpointBonus)
      addText(g, 'CHECKPOINT!', p.x, p.y - 26, '#7cff7c')
      burst(g, p.x + p.w / 2, p.y + p.h / 2, 'spark', 12, '#fff8c0')
      return
    }
  }
}

/** 复活 / 重来：从最近存档点开始并对位相机 */
const respawn = (g) => {
  resetEntities(g)
  fitCam(g)
  g.timeLeft = TIME.level
}

/** 过关：触碰旗杆 */
const checkFlag = (g) => {
  const p = g.player
  const f = g.level.flag
  if (g.status !== 'play' || p.dead || g.level.bonus) return
  if (p.x + p.w < f.poleX - 6 || p.x > f.poleX + 18) return
  clearLevel(g, false)
}

const clearLevel = (g, warped) => {
  const p = g.player
  const f = g.level.flag
  const height = Math.max(0, Math.floor((f.y1 + TILE - p.y - p.h) / TILE))
  const poleScore = SCORE.poleBase + height * SCORE.poleStep
  addScore(g, poleScore, p.x, p.y - 20)
  g.status = 'clear'
  g.statusT = 0
  g.flagSlide = 0
  g.warped = !!warped
  g.message = '通关！'
}

const advanceLevel = (g) => {
  const timeBonus = Math.floor(g.timeLeft) * SCORE.timeBonus
  g.score += timeBonus
  const next = g.levelIndex + 1
  if (g.mode === 'endless') {
    g.levelIndex = next
    loadLevel(g, next)
    return
  }
  if (next >= LEVELS.length) {
    g.status = 'win'
    g.statusT = 0
    g.unlocked = LEVELS.length
    return
  }
  g.levelIndex = next
  loadLevel(g, next)
}

/** 推进一帧 */
export const step = (g, input = {}) => {
  if (g.status === 'over' || g.status === 'win' || g.paused) return g
  g.inputFire = !!input.fire
  g.tick++
  g.statusT++

  if (g.status === 'warpIn' || g.status === 'warpOut') {
    const p = g.player
    p.vx = 0
    p.y += 2.8
    updateEffects(g)
    if (g.statusT >= TIME.warp) {
      if (g.status === 'warpIn' && g.pending) {
        // 只允许一层：房间里不会再生出隐藏管道
        if (g.stack.length < 1) enterBonusRoom(g, g.pending.roomIndex)
        else { g.status = 'play'; g.pending = null }
      } else {
        leaveBonusRoom(g)
      }
      g.pending = null
    }
    return g
  }

  if (g.status === 'dying') {
    const p = g.player
    p.vy = Math.min(p.vy + PHYS.gravity, PHYS.maxFall)
    p.y += p.vy
    updateEffects(g)
    updateCam(g)
    if (g.statusT >= TIME.dying) {
      g.lives--
      if (g.lives <= 0) {
        g.status = 'over'
        g.statusT = 0
      } else if (g.room) {
        // 在奖励房里阵亡：踢回原路，保住主关卡进度
        leaveBonusRoom(g)
        g.timeLeft = TIME.level
      } else {
        respawn(g)
      }
    }
    return g
  }

  if (g.status === 'clear') {
    const p = g.player
    const f = g.level.flag
    g.flagSlide = Math.min(1, g.flagSlide + 0.02)
    p.vx = 1.6
    moveX(g, p)
    p.vy = Math.min(p.vy + PHYS.gravity, PHYS.maxFall)
    p.onGround = false
    moveY(g, p)
    updateEffects(g)
    updateCam(g)
    if (g.statusT >= TIME.clear) {
      g.status = 'play'
      g.statusT = 0
      advanceLevel(g)
    }
    return g
  }

  if (g.debug.godMode) g.player.star = Math.max(g.player.star, 30)
  if (!g.debug.freezeTime) {
    g.timeLeft -= 1 / 60
    if (g.timeLeft <= 0) {
      g.timeLeft = 0
      if (g.debug.godMode) g.timeLeft = TIME.level
      else die(g)
    }
  }

  updatePlayer(g, input)
  if (!g.debug.freezeEnemies) updateEnemies(g)
  updateItems(g)
  playerVsItems(g)
  playerVsCoins(g)
  updateFireballs(g)
  playerVsEnemies(g)
  updateEffects(g)
  updateCam(g)
  checkCheckpoint(g)
  checkFlag(g)
  return g
}

/** 重开当前关（保留分数与生命） */
export const restartLevel = (g) => {
  // 在奖励房里重来：先退回主关卡，避免把奖励房当成新关卡重解析
  const back = g.stack.pop()
  if (back) {
    restoreScene(g, back)
    g.stack.length = 0
    g.room = null
  }
  g.status = 'play'
  g.statusT = 0
  g.pending = null
  g.message = ''
  respawn(g)
  return g
}

/** 增加一条命并重新开始本关 */
export const continueGame = (g) => {
  g.lives = RULE.lives
  g.status = 'play'
  restartLevel(g)
  return g
}

/** ============ 调试指令（面板 / 快捷键调用） ============ */

/** 跳关：故事模式限 LEVELS 索引，无尽模式按层号 */
export const debugGotoLevel = (g, index) => {
  const max = g.mode === 'endless' ? 9999 : LEVELS.length - 1
  const i = clamp(index, 0, max)
  g.stack.length = 0
  g.room = null
  g.pending = null
  g.levelIndex = i
  loadLevel(g, i)
  g.status = 'play'
  g.statusT = 0
  g.message = ''
  return g
}
export const debugNextLevel = (g) => debugGotoLevel(g, g.levelIndex + 1)
export const debugPrevLevel = (g) => debugGotoLevel(g, g.levelIndex - 1)

/** 立即通关（走正常过关流程，含旗杆计分） */
export const debugClearLevel = (g) => {
  if (g.room) leaveBonusRoom(g)
  if (g.status === 'play') clearLevel(g, true)
  return g
}

/** 传送到指定列并落到该列地表 */
export const debugTeleportCol = (g, tx) => {
  const p = g.player
  const col = clamp(tx, 0, g.level.w - 1)
  let ty = 1
  while (ty < g.level.h && !(solidAt(g, col, ty) && !solidAt(g, col, ty - 1))) ty++
  if (ty >= g.level.h) ty = g.level.h - 1
  p.x = col * TILE + (TILE - p.w) / 2
  p.y = Math.max(0, ty * TILE - p.h)
  p.vx = 0
  p.vy = 0
  p.onGround = true
  fitCam(g)
  return g
}
export const debugTeleportBy = (g, dCols) => debugTeleportCol(g, Math.floor((g.player.x + g.player.w / 2) / TILE) + dCols)

/** 直达旗杆前两格 */
export const debugWarpToFlag = (g) => {
  if (g.level.bonus) return g
  return debugTeleportCol(g, Math.floor(g.level.flag.poleX / TILE) - 2)
}

/** 批量加币：按规则自动折算加命 */
export const debugAddCoins = (g, n) => {
  const before = g.coins
  g.coins = Math.max(0, g.coins + n)
  const gained = Math.floor(g.coins / RULE.coinsPerLife) - Math.floor(before / RULE.coinsPerLife)
  if (gained > 0) g.lives += gained
  g.score += Math.max(0, n) * SCORE.coin
  addText(g, `+${n} 金币`, g.player.x, g.player.y - 26, '#fcd800')
  return g
}

export const debugAddScore = (g, n) => {
  g.score = Math.max(0, g.score + n)
  addText(g, `+${n}`, g.player.x, g.player.y - 26, '#fcd800')
  return g
}

export const debugAddLives = (g, n) => {
  g.lives = Math.max(0, g.lives + n)
  addText(g, `${n > 0 ? '+' : ''}${n} UP`, g.player.x, g.player.y - 26, '#7cff7c')
  return g
}

/** 直接切换形态 */
export const debugSetForm = (g, form) => {
  setForm(g, form)
  g.player.invuln = Math.max(g.player.invuln, 30)
  addText(g, form === 'fire' ? '火力!' : form === 'big' ? '变大!' : '变小', g.player.x, g.player.y - 26, '#ffd0d0')
  return g
}

export const debugSetStar = (g, on) => {
  g.player.star = on ? TIME.star : 0
  addText(g, on ? '无敌!' : '无敌结束', g.player.x, g.player.y - 26, '#fcd800')
  return g
}

export const debugSetTime = (g, sec) => {
  g.timeLeft = Math.max(0, sec)
  return g
}

/** 秒杀全场敌人 */
export const debugKillEnemies = (g) => {
  for (const e of g.enemies) if (!e.dead) killEnemy(g, e, true)
  return g
}

/** 在玩家头顶生成道具 */
export const debugSpawnItem = (g, kind) => {
  const p = g.player
  const tx = clamp(Math.floor((p.x + p.w / 2) / TILE), 0, g.level.w - 1)
  const ty = clamp(Math.floor(p.y / TILE) - 1, 0, g.level.h - 1)
  spawnItem(g, kind, tx, ty)
  return g
}

/** 直接钻进隐藏管道（走正常过场动画） */
export const debugEnterBonus = (g, index = 0) => {
  if (g.room || g.level.bonus) return g
  const p = g.player
  const tx = clamp(Math.floor((p.x + p.w / 2) / TILE), 0, g.level.w - 1)
  const ty = clamp(Math.floor((p.y + p.h + 2) / TILE), 0, g.level.h - 1)
  g.pending = { dir: 'in', roomIndex: index, returnTx: tx, returnTy: ty }
  g.status = 'warpIn'
  g.statusT = 0
  return g
}

export { LEVELS, VIEW_W, VIEW_H }
