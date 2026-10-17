import {
  TILE_TYPES, NO_COLOR, SPECIAL, SPECIAL_BONUS, BASE_PER_TILE, MAX_MULT,
  multOf, TIME, CELL, starOf,
} from './constants.js'
import { LEVELS, scoreTargetOf } from './levels.js'
import { resolveBuffs } from './buffs.js'
import {
  createTile, findRuns, hasRunAt, findHint, generateBoard, shuffleBoard,
  groupRuns, collapse, ck, unck,
} from './board.js'

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v)
const easeOut = (p) => 1 - Math.pow(1 - p, 3)

/**
 * 创建一局
 * @param {object} opts { level, snapshot, cell, carry, buffs }
 */
export const createGame = (opts = {}) => {
  const level = opts.level || LEVELS[0]
  const buff = resolveBuffs(opts.buffs)
  const g = {
    level,
    rows: level.rows,
    cols: level.cols,
    colorCount: level.colors,
    cell: opts.cell || CELL,
    grid: null,
    score: 0,
    /** 无尽模式：本层之前的累计得分；闯关模式恒为 0 */
    totalScore: opts.carry || 0,
    endless: !!level.endless,
    stage: level.stage || 1,
    steps: level.steps + buff.bonusSteps,
    /** 无尽强化生效值；闯关模式全是默认值 */
    maxMult: buff.maxMult,
    scoreMul: buff.scoreMul,
    areaRadius: buff.areaRadius,
    refund: buff.refund,
    buffs: opts.buffs || {},
    cleared: new Array(TILE_TYPES.length).fill(0),
    goals: level.goals,
    phase: 'idle', // idle | swap | revert | clear | fall | shuffle | over
    status: 'play', // play | win | lose
    timer: 0,
    duration: 0,
    anim: null,
    wave: 0,
    maxWave: 0,
    selected: null,
    vanish: [],
    moves: [],
    fx: { parts: [], floats: [] },
    result: null,
    idleTime: 0,
    hint: null,
    flash: 0,
    combo: 0,
    shuffleCount: 0,
    stats: { moves: 0, specials: 0, cleared: 0 },
  }
  const restored = restoreGrid(g, opts.snapshot)
  if (restored && findHint(restored, g.rows, g.cols)) g.grid = restored
  else if (restored && shuffleBoard(restored, g.rows, g.cols, g.colorCount)) g.grid = restored
  else g.grid = generateBoard(g.rows, g.cols, g.colorCount)
  applyStartSpecials(g, buff)
  return g
}

/** 开局赠送的特殊块（强化「开局炸弹」「彩虹馈赠」） */
const applyStartSpecials = (g, buff) => {
  const total = buff.startBombs + buff.startRainbows
  if (total <= 0) return
  const spots = []
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.cols; c++) {
      const t = g.grid[r][c]
      if (t && !t.special) spots.push([r, c])
    }
  }
  for (let i = spots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = spots[i]
    spots[i] = spots[j]
    spots[j] = tmp
  }
  let k = 0
  // 彩球无色不参与连线，先放，避免把炸弹的颜色顶掉
  for (let i = 0; i < buff.startRainbows && k < spots.length; i++, k++) {
    const [r, c] = spots[k]
    const t = createTile(NO_COLOR, SPECIAL.RAINBOW)
    t.row = r
    t.col = c
    t.pop = 320
    g.grid[r][c] = t
  }
  for (let i = 0; i < buff.startBombs && k < spots.length; i++, k++) {
    const [r, c] = spots[k]
    const old = g.grid[r][c]
    const t = createTile(old.color, Math.random() < 0.5 ? SPECIAL.ROW : SPECIAL.COL)
    t.row = r
    t.col = c
    t.pop = 320
    g.grid[r][c] = t
  }
}

const restoreGrid = (g, snap) => {
  if (!snap || snap.id !== g.level.id || !snap.tiles) return null
  if (snap.tiles.length !== g.rows || snap.tiles[0].length !== g.cols) return null
  const grid = snap.tiles.map((row, r) => row.map((cell, c) => {
    if (!cell) return null
    const t = createTile(cell[0], cell[1] || null)
    t.row = r
    t.col = c
    return t
  }))
  if (grid.some((row) => row.some((t) => !t))) return null
  g.score = snap.score || 0
  g.steps = snap.steps == null ? g.level.steps : snap.steps
  if (Array.isArray(snap.cleared)) g.cleared = snap.cleared.slice(0, TILE_TYPES.length)
  return grid
}

export const serialize = (g) => ({
  id: g.level.id,
  tiles: g.grid.map((row) => row.map((t) => (t ? [t.color, t.special] : null))),
  score: g.score,
  steps: g.steps,
  cleared: g.cleared.slice(),
})

export const resetGame = (g) => {
  g.grid = generateBoard(g.rows, g.cols, g.colorCount)
  g.score = 0
  g.steps = g.level.steps
  g.cleared = new Array(TILE_TYPES.length).fill(0)
  g.phase = 'idle'
  g.status = 'play'
  g.timer = 0
  g.anim = null
  g.wave = 0
  g.maxWave = 0
  g.selected = null
  g.vanish = []
  g.moves = []
  g.fx = { parts: [], floats: [] }
  g.result = null
  g.idleTime = 0
  g.hint = null
  g.flash = 0
  g.combo = 0
  g.shuffleCount = 0
  g.stats = { moves: 0, specials: 0, cleared: 0 }
}

/* ---------------- 目标 / 结算 ---------------- */

export const goalProgress = (g) => g.goals.map((goal) => {
  if (goal.type === 'score') {
    return { ...goal, cur: Math.min(g.score, goal.target), target: goal.target, done: g.score >= goal.target }
  }
  return {
    ...goal,
    cur: Math.min(g.cleared[goal.color] || 0, goal.count),
    target: goal.count,
    done: (g.cleared[goal.color] || 0) >= goal.count,
  }
})

export const goalsMet = (g) => goalProgress(g).every((x) => x.done)

const scoreTarget = (g) => scoreTargetOf(g.level)

const finish = (g) => {
  const win = goalsMet(g)
  g.status = win ? 'win' : 'lose'
  g.phase = 'over'
  g.selected = null
  g.hint = null
  const target = scoreTarget(g)
  g.result = {
    win,
    score: g.score,
    target,
    stars: win ? starOf(g.score, target) : 0,
    stepsLeft: g.steps,
    gap: Math.max(0, target - g.score),
    goals: goalProgress(g),
    maxWave: g.maxWave,
    moves: g.stats.moves,
    endless: g.endless,
    stage: g.stage,
    totalScore: g.totalScore + g.score,
  }
}

/* ---------------- 特效 ---------------- */

const addParts = (g, x, y, colorIdx, n = 7) => {
  const col = TILE_TYPES[colorIdx] || TILE_TYPES[0]
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2
    const sp = 0.04 + Math.random() * 0.11
    g.fx.parts.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 0.06,
      r: 2 + Math.random() * 3.5,
      life: 420, max: 420,
      color: col.main,
    })
  }
}

const addFloat = (g, x, y, text, color, big) => {
  g.fx.floats.push({ x, y, text, color: color || '#fff', life: 900, max: 900, big: !!big })
}

const updateFx = (g, dt) => {
  const ps = g.fx.parts
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i]
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += 0.00045 * dt
    p.life -= dt
    if (p.life <= 0) ps.splice(i, 1)
  }
  const fs = g.fx.floats
  for (let i = fs.length - 1; i >= 0; i--) {
    const f = fs[i]
    f.y -= 0.028 * dt
    f.life -= dt
    if (f.life <= 0) fs.splice(i, 1)
  }
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.cols; c++) {
      const t = g.grid[r][c]
      if (t && t.land > 0) t.land = Math.max(0, t.land - dt)
      if (t && t.pop > 0) t.pop = Math.max(0, t.pop - dt)
    }
  }
}

/* ---------------- 特殊块爆破 ---------------- */

const mostCommonColor = (g) => {
  const count = new Array(g.colorCount).fill(0)
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.cols; c++) {
      const t = g.grid[r][c]
      if (t && t.color >= 0 && t.color < g.colorCount) count[t.color]++
    }
  }
  let best = 0
  for (let i = 1; i < count.length; i++) if (count[i] > count[best]) best = i
  return best
}

const blastCells = (g, t, r, c) => {
  const out = []
  if (t.special === SPECIAL.ROW) {
    for (let i = 0; i < g.cols; i++) out.push([r, i])
  } else if (t.special === SPECIAL.COL) {
    for (let i = 0; i < g.rows; i++) out.push([i, c])
  } else if (t.special === SPECIAL.AREA) {
    const rad = g.areaRadius || 1
    for (let dr = -rad; dr <= rad; dr++) {
      for (let dc = -rad; dc <= rad; dc++) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < g.rows && nc >= 0 && nc < g.cols) out.push([nr, nc])
      }
    }
  } else if (t.special === SPECIAL.RAINBOW) {
    const col = mostCommonColor(g)
    for (let i = 0; i < g.rows; i++) {
      for (let j = 0; j < g.cols; j++) {
        const x = g.grid[i][j]
        if (x && x.color === col) out.push([i, j])
      }
    }
  }
  return out
}

/**
 * 统一消除入口：收集初始格 → 特殊块爆破传播 → 计分 → 生成特殊块 → 进入消散动画
 * @param {object} opts { spawns, silent, bonus, label }
 */
const beginClear = (g, initialCells, opts = {}) => {
  const toClear = new Set()
  for (const [r, c] of initialCells) {
    if (g.grid[r] && g.grid[r][c]) toClear.add(ck(r, c))
  }
  const silent = new Set(opts.silent || [])

  const pending = [...toClear]
  const processed = new Set()
  let guard = 0
  while (pending.length && guard++ < 4000) {
    const k = pending.pop()
    if (processed.has(k) || silent.has(k)) continue
    const [r, c] = unck(k)
    const t = g.grid[r] && g.grid[r][c]
    if (!t || !t.special) continue
    processed.add(k)
    g.stats.specials++
    for (const [br, bc] of blastCells(g, t, r, c)) {
      const bk = ck(br, bc)
      if (g.grid[br] && g.grid[br][bc] && !toClear.has(bk)) {
        toClear.add(bk)
        pending.push(bk)
      }
    }
  }

  let bonus = opts.bonus || 0
  for (const k of processed) {
    const [r, c] = unck(k)
    const t = g.grid[r][c]
    bonus += SPECIAL_BONUS[t.special] || 0
  }

  const mult = multOf(g.wave, g.maxMult)
  const count = toClear.size
  const gain = Math.round((count * BASE_PER_TILE * mult + bonus) * g.scoreMul)
  g.score += gain
  g.stats.cleared += count

  let sx = 0
  let sy = 0
  for (const k of toClear) {
    const [r, c] = unck(k)
    const t = g.grid[r][c]
    if (!t) continue
    if (t.color >= 0) g.cleared[t.color]++
    sx += c
    sy += r
    const px = (c + 0.5) * g.cell
    const py = (r + 0.5) * g.cell
    addParts(g, px, py, t.color, t.special ? 12 : 7)
    g.vanish.push({ tile: t, r, c })
    g.grid[r][c] = null
  }
  const n = Math.max(1, toClear.size)
  const cx = (sx / n + 0.5) * g.cell
  const cy = (sy / n + 0.5) * g.cell

  if (opts.spawns) {
    for (const sp of opts.spawns) {
      const t = createTile(sp.special === SPECIAL.RAINBOW ? NO_COLOR : sp.color, sp.special)
      t.row = sp.r
      t.col = sp.c
      t.pop = 320
      g.grid[sp.r][sp.c] = t
      addFloat(g, (sp.c + 0.5) * g.cell, (sp.r + 0.2) * g.cell, sp.label || '特殊块!', '#ffe17a')
      addParts(g, (sp.c + 0.5) * g.cell, (sp.r + 0.5) * g.cell, sp.color, 10)
    }
    pushSfx(g, { type: 'special' })
  }

  if (gain > 0) addFloat(g, cx, cy, `+${gain}`, mult > 1 ? '#ffd93d' : '#ffffff', mult > 1)
  if (mult > 1) {
    g.combo = mult
    g.flash = 260
    addFloat(g, cx, cy - g.cell * 0.7, `连锁 ×${mult}`, '#ff9d3d', true)
  }
  if (opts.label) addFloat(g, cx, cy - g.cell * 1.2, opts.label, '#ff5f6d', true)

  if (g.wave > g.maxWave) g.maxWave = g.wave
  g.phase = 'clear'
  g.timer = 0
  g.duration = TIME.clear
  pushSfx(g, { type: count >= 8 ? 'big' : 'clear', mult })
}

/* ---------------- 交换 / 连锁 ---------------- */

const resolveWave = (g, prefer) => {
  const runs = findRuns(g.grid, g.rows, g.cols)
  if (!runs.length) {
    onSettled(g)
    return
  }
  g.wave++
  const groups = groupRuns(runs, prefer)
  const cells = []
  for (const gr of groups) for (const [r, c] of gr.cells) cells.push([r, c])
  const spawns = groups
    .filter((gr) => gr.spawnAt)
    .map((gr) => ({
      r: gr.spawnAt[0],
      c: gr.spawnAt[1],
      color: gr.color,
      special: gr.special,
      label: gr.special === SPECIAL.RAINBOW ? '彩球!' : gr.special === SPECIAL.AREA ? '九宫炸弹!' : '直线炸弹!',
    }))
  beginClear(g, cells, { spawns })
}

/** 保证盘面可玩：无合法交换则立即重洗（机会必须可读） */
export const ensurePlayable = (g) => {
  if (g.status !== 'play' || g.phase !== 'idle') return false
  if (findHint(g.grid, g.rows, g.cols)) return false
  startShuffle(g)
  return true
}

const onSettled = (g) => {
  const waves = g.wave
  g.wave = 0
  g.combo = 0
  // 连锁返还：放在步数判定之前，最后一步打出大连锁能把人救回来
  if (g.refund > 0 && waves >= 3) {
    g.steps += g.refund
    addFloat(g, (g.cols / 2) * g.cell, (g.rows / 2) * g.cell, `+${g.refund} 步`, '#3ddc84', true)
  }
  if (goalsMet(g)) { finish(g); return }
  if (g.steps <= 0) { finish(g); return }
  if (!findHint(g.grid, g.rows, g.cols)) { startShuffle(g); return }
  g.phase = 'idle'
  g.idleTime = 0
  g.hint = null
}

const startShuffle = (g) => {
  doShuffle(g)
  g.phase = 'shuffle'
  g.timer = 0
  g.duration = TIME.shuffle
  g.shuffleCount++
  g.selected = null
  g.hint = null
  pushSfx(g, { type: 'shuffle' })
}

const doShuffle = (g) => {
  const ok = shuffleBoard(g.grid, g.rows, g.cols, g.colorCount)
  if (!ok) g.grid = generateBoard(g.rows, g.cols, g.colorCount)
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.cols; c++) {
      const t = g.grid[r][c]
      if (!t) continue
      t.pop = 320 + (r + c) * 12
      t.land = 0
      t.ox = 0
      t.oy = 0
    }
  }
}

const startFall = (g) => {
  g.vanish = []
  const { moves, maxDist } = collapse(g)
  g.moves = moves
  if (!moves.length || maxDist <= 0) {
    afterFall(g)
    return
  }
  g.phase = 'fall'
  g.timer = 0
  const total = Math.min(maxDist * TIME.fallPerCell, TIME.fallMax)
  g.duration = Math.max(120, total)
  g.fallSpeed = g.duration / maxDist
}

const afterFall = (g) => {
  for (const m of g.moves) {
    m.t.oy = 0
    m.t.land = TIME.land
  }
  g.moves = []
  // 步数归零立即终局：取消后续连锁波次，只结算已展示部分
  if (g.steps <= 0) { finish(g); return }
  resolveWave(g, null)
}

/* ---------------- 特殊块组合（RULE-SPECIAL-COMBO） ---------------- */

const doRainbowPair = (g, a, b) => {
  const cells = []
  for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) if (g.grid[r][c]) cells.push([r, c])
  g.wave = 1
  beginClear(g, cells, { bonus: SPECIAL_BONUS.rainbow * 2, label: '清屏!' })
}

const doRainbowOne = (g, a, b) => {
  const rb = a.special === SPECIAL.RAINBOW ? a : b
  const other = rb === a ? b : a
  g.wave = 1
  const cells = []
  if (other.color >= 0) {
    for (let r = 0; r < g.rows; r++) {
      for (let c = 0; c < g.cols; c++) {
        const t = g.grid[r][c]
        if (t && t.color === other.color) cells.push([r, c])
      }
    }
  }
  cells.push([other.row, other.col])
  cells.push([rb.row, rb.col])
  beginClear(g, cells, {
    bonus: SPECIAL_BONUS.rainbow,
    label: '彩虹冲击!',
    silent: [ck(rb.row, rb.col)],
  })
}

const doDoubleSpecial = (g, a, b) => {
  g.wave = 1
  const s1 = a.special
  const s2 = b.special
  const cross = (s1 === SPECIAL.ROW && s2 === SPECIAL.COL) || (s1 === SPECIAL.COL && s2 === SPECIAL.ROW)
  if (cross) {
    const set = new Set()
    for (let i = 0; i < g.cols; i++) set.add(ck(b.row, i))
    for (let i = 0; i < g.rows; i++) set.add(ck(i, b.col))
    beginClear(g, [...set].map(unck), { label: '十字爆破!' })
    return
  }
  beginClear(g, [[a.row, a.col], [b.row, b.col]], { label: '组合爆破!' })
}

/* ---------------- 玩家操作 ---------------- */

const startSwap = (g, r1, c1, r2, c2) => {
  const a = g.grid[r1][c1]
  const b = g.grid[r2][c2]
  if (!a || !b) return
  g.grid[r1][c1] = b
  g.grid[r2][c2] = a
  a.row = r2
  a.col = c2
  b.row = r1
  b.col = c1
  const dr = r2 - r1
  const dc = c2 - c1
  a.ox = -dc * g.cell
  a.oy = -dr * g.cell
  b.ox = dc * g.cell
  b.oy = dr * g.cell
  g.anim = { a, b, r1, c1, r2, c2, dr, dc }
  g.phase = 'swap'
  g.timer = 0
  g.duration = TIME.swap
  g.selected = null
  g.idleTime = 0
  g.hint = null
}

const startRevert = (g) => {
  g.phase = 'revert'
  g.timer = 0
  g.duration = TIME.revert
  pushSfx(g, { type: 'invalid' })
}

const finishSwap = (g) => {
  const { a, b, r1, c1, r2, c2 } = g.anim
  const rainbowCount = (a.special === SPECIAL.RAINBOW ? 1 : 0) + (b.special === SPECIAL.RAINBOW ? 1 : 0)
  const valid = rainbowCount > 0
    || (a.special && b.special)
    || hasRunAt(g.grid, g.rows, g.cols, r1, c1)
    || hasRunAt(g.grid, g.rows, g.cols, r2, c2)
  if (!valid) {
    startRevert(g)
    return
  }
  g.steps--
  g.stats.moves++
  g.selected = null
  g.idleTime = 0
  g.wave = 0

  if (rainbowCount === 2) doRainbowPair(g, a, b)
  else if (rainbowCount === 1) doRainbowOne(g, a, b)
  else if (a.special && b.special) doDoubleSpecial(g, a, b)
  else resolveWave(g, [[r2, c2], [r1, c1]])
}

const revertBack = (g) => {
  const { a, b, r1, c1, r2, c2 } = g.anim
  g.grid[r1][c1] = a
  g.grid[r2][c2] = b
  a.row = r1
  a.col = c1
  b.row = r2
  b.col = c2
  a.ox = a.oy = b.ox = b.oy = 0
  g.anim = null
  g.phase = 'idle'
  g.idleTime = 0
  ensurePlayable(g)
}

export const trySelect = (g, r, c) => {
  if (g.status !== 'play' || g.phase !== 'idle') return
  if (!inBoard(g, r, c)) return
  const sel = g.selected
  if (!sel) {
    g.selected = [r, c]
    pushSfx(g, { type: 'select' })
    return
  }
  if (sel[0] === r && sel[1] === c) {
    g.selected = null
    pushSfx(g, { type: 'select' })
    return
  }
  if (Math.abs(sel[0] - r) + Math.abs(sel[1] - c) === 1) {
    startSwap(g, sel[0], sel[1], r, c)
    return
  }
  g.selected = [r, c]
  pushSfx(g, { type: 'select' })
}

export const trySwap = (g, r1, c1, r2, c2) => {
  if (g.status !== 'play' || g.phase !== 'idle') return false
  if (!inBoard(g, r1, c1) || !inBoard(g, r2, c2)) return false
  if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return false
  startSwap(g, r1, c1, r2, c2)
  return true
}

const inBoard = (g, r, c) => r >= 0 && r < g.rows && c >= 0 && c < g.cols

/** 本帧产生的音效请求列表，由外层消费后清空 */
export const takeSfx = (g) => {
  if (!g.sfxList || !g.sfxList.length) return null
  const list = g.sfxList
  g.sfxList = []
  return list
}
const pushSfx = (g, obj) => {
  if (!g.sfxList) g.sfxList = []
  g.sfxList.push(obj)
}

/* ---------------- 主循环 ---------------- */

export const step = (g, dt) => {
  updateFx(g, dt)
  if (g.flash > 0) g.flash = Math.max(0, g.flash - dt)
  if (g.status !== 'play') return

  if (g.phase === 'idle') {
    g.idleTime += dt
    if (g.idleTime > 5000 && !g.hint) g.hint = findHint(g.grid, g.rows, g.cols)
    return
  }

  g.timer += dt
  const p = g.duration > 0 ? Math.min(1, g.timer / g.duration) : 1

  switch (g.phase) {
    case 'swap': {
      const { a, b, dr, dc } = g.anim
      const e = easeOut(p)
      a.ox = -dc * g.cell * (1 - e)
      a.oy = -dr * g.cell * (1 - e)
      b.ox = dc * g.cell * (1 - e)
      b.oy = dr * g.cell * (1 - e)
      if (p >= 1) {
        a.ox = a.oy = b.ox = b.oy = 0
        finishSwap(g)
      }
      break
    }
    case 'revert': {
      const { a, b, dr, dc } = g.anim
      const e = easeOut(p)
      a.ox = -dc * g.cell * e
      a.oy = -dr * g.cell * e
      b.ox = dc * g.cell * e
      b.oy = dr * g.cell * e
      if (p >= 1) revertBack(g)
      break
    }
    case 'clear': {
      if (p >= 1) startFall(g)
      break
    }
    case 'fall': {
      const per = g.fallSpeed
      for (const m of g.moves) {
        const mp = Math.min(1, g.timer / Math.max(1, m.dist * per))
        const e = mp * mp
        m.t.oy = -m.dist * g.cell * (1 - e)
      }
      if (p >= 1) afterFall(g)
      break
    }
    case 'shuffle': {
      if (p >= 1) {
        const runs = findRuns(g.grid, g.rows, g.cols)
        if (runs.length) {
          g.wave = 0
          resolveWave(g, null)
        } else if (g.steps <= 0) {
          finish(g)
        } else {
          g.phase = 'idle'
          g.idleTime = 0
        }
      }
      break
    }
    default:
      break
  }
}

export { MAX_MULT, SPECIAL }
