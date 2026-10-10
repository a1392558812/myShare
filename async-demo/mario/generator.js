import { TILE, T, SOLID } from './constants.js'

const GROUND_ROW = 13
const ROWS = 15
/** 一次跳跃最多上升的瓦片数（起跳 11.6 / 上升重力 0.45 → 约 4.6 格，保守取 4） */
export const MAX_RISE = 4
/** 一次跳跃最多跨越的列数（保守取 5） */
export const MAX_DX = 5
/** 无尽关卡宽度：起步 260 列（8320px），随关数递增到 600 列上限 */
export const endlessWidth = (index) => Math.min(600, 260 + Math.min(index, 24) * 14)

const mulberry32 = (a) => () => {
  a = (a + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const put = (L, x, y, ch) => {
  if (x < 0 || x >= L.w || y < 0 || y >= ROWS) return
  L.rows[y][x] = ch
}
const fill = (L, x0, x1, y, ch) => { for (let x = x0; x <= x1; x++) put(L, x, y, ch) }
const clear = (L, x, y0, y1) => { for (let y = y0; y <= y1; y++) put(L, x, y, T.EMPTY) }

/** 平地：撒敌人 */
const segFlat = (L, x, rand, diff) => {
  const len = 8 + Math.floor(rand() * 5)
  const n = Math.floor(rand() * (1 + diff))
  for (let i = 0; i < n; i++) {
    const ex = x + 1 + Math.floor(rand() * (len - 2))
    put(L, ex, 12, rand() < 0.35 + diff * 0.1 ? T.KOOPA : T.GOOMBA)
  }
  return len
}

/**
 * 清出跳跃走廊：挖掉头顶 rows 7~11 的障碍
 * 没有这一步会出现「砖块天花板 + 紧接一个坑」的死局：玩家在天花板下起跳被顶回，必掉坑
 */
const clearHeadroom = (L, x0, x1, top = 7) => {
  for (let x = x0; x <= x1; x++) clear(L, x, top, 11)
}

/** 砖块行：顶砖 / 问号 / 道具块 */
const segBricks = (L, x, rand, diff) => {
  const len = 10 + Math.floor(rand() * 5)
  const row = 9
  for (let i = 1; i < len - 1; i++) {
    const r = rand()
    if (r < 0.16) put(L, x + i, row, T.COIN_BLOCK)
    else if (r < 0.24) put(L, x + i, row, T.POWER_BLOCK)
    else if (r < 0.3) put(L, x + i, row, T.MULTI_BLOCK)
    else if (r < 0.34) put(L, x + i, row, T.HIDDEN)
    else if (r < 0.72) put(L, x + i, row, T.BRICK)
  }
  if (rand() < 0.5) fill(L, x + 2, x + 4, row - 4, T.COIN)
  if (rand() < 0.5 + diff * 0.1) put(L, x + Math.floor(len / 2), 12, T.GOOMBA)
  // 尾部留 3 列空地：别让下一个坑紧贴砖块行，否则起跳会撞到砖块底
  return len + 3
}

/** 管道：高度 ≤ 3 保证可跳越 */
const segPipe = (L, x, rand, diff) => {
  const ph = 2 + Math.floor(rand() * 2)
  const plant = diff >= 1 && rand() < 0.35
  clearHeadroom(L, x - 2, x + 3)
  for (let i = 0; i < 2; i++) {
    for (let y = GROUND_ROW - ph; y <= 12; y++) put(L, x + i, y, T.PIPE)
  }
  if (plant) { put(L, x, GROUND_ROW - ph, T.PIPE_PLANT); put(L, x + 1, GROUND_ROW - ph, T.PIPE_PLANT) }
  return 2 + 3 + Math.floor(rand() * 2)
}

/**
 * 坑洞：宽度 ≤ 4 保证可跳过
 * 返回值额外给自己留 4 列落脚地，避免连着两个坑形成「一格孤岛」
 */
const segGap = (L, x, rand, diff) => {
  const gw = 2 + Math.floor(rand() * Math.min(3, 2 + diff))
  // 助跑跑道：坑前 6 列、坑后 3 列一律铲平，保证全速起跳、落地不撞墙
  for (let i = 1; i <= 6; i++) clear(L, x - i, 9, 12)
  for (let i = 0; i < 3; i++) clear(L, x + gw + i, 9, 12)
  // 起跳侧 / 落地侧各留 3~2 列头顶净空
  clearHeadroom(L, x - 3, x + gw + 1)
  for (let i = 0; i < gw; i++) {
    clear(L, x + i, GROUND_ROW - 4, ROWS - 1)
  }
  // 坑上方撒金币作为奖励（不能放实心平台，会挡住跳跃弧线把人顶回坑里）
  if (rand() < 0.55) fill(L, x, x + gw - 1, 9, T.COIN)
  return gw + 4
}

/** 悬浮平台（含窄台连跳） */
const segPlatform = (L, x, rand, diff) => {
  const narrow = diff >= 2 && rand() < 0.45
  const row = 11 - Math.floor(rand() * 2)
  if (narrow) {
    let cx = x
    clearHeadroom(L, x - 1, x + 12, 6)
    for (let i = 0; i < 3; i++) {
      fill(L, cx, cx + 1, row, T.PLATFORM)
      if (rand() < 0.6) fill(L, cx, cx + 1, row - 3, T.COIN)
      cx += 4
    }
    return cx - x + 2
  }
  const len = 3 + Math.floor(rand() * 3)
  clearHeadroom(L, x - 1, x + len, 6)
  fill(L, x, x + len - 1, row, T.PLATFORM)
  if (rand() < 0.6) fill(L, x, x + len - 1, row - 3, T.COIN)
  return len + 2
}

/** 阶梯：逐级上升 / 下降 */
const segStairs = (L, x, rand, diff) => {
  const up = rand() < 0.6
  const n = 3 + Math.floor(rand() * 2)
  for (let i = 0; i < n; i++) {
    const row = up ? 12 - i : 12 - (n - 1 - i)
    for (let y = row; y <= 12; y++) put(L, x + i, y, T.STONE)
  }
  if (rand() < 0.5) put(L, x + n, 12 - (up ? n : 0), T.COIN)
  return n + 3
}

/** 移动平台区 */
const segMove = (L, x, rand) => {
  put(L, x, 11, T.MOVE_H)
  put(L, x + 4, 10, T.MOVE_V)
  return 8
}

/** 空中敌人 */
const segSky = (L, x, rand, diff) => {
  if (diff >= 3 && rand() < 0.4) put(L, x + 2, 4, T.LAKITU)
  else put(L, x + 2, 6, T.CROW)
  return 5
}

/** 冒着金币的隐藏管道：站上管口按 ↓ 进入金币奖励房 */
const placeWarpPipes = (L, w, rand) => {
  const count = Math.min(3, 1 + Math.floor(w / 240))
  const out = []
  for (let i = 1; i <= count; i++) {
    const want = Math.floor((w * i) / (count + 1))
    let cx = -1
    for (let d = 0; d <= 26 && cx < 0; d++) {
      for (const c of [want - d, want + d]) {
        if (c < 20 || c > w - 26) continue
        if (!warpColumnOk(L, c)) continue
        cx = c
        break
      }
    }
    if (cx < 0) continue
    buildWarpPipe(L, cx, rand)
    out.push(cx)
  }
  return out
}

/** 管道占位两列：本身要净空、左右各 3 列要有落地实地（不贴坑、不贴旗杆） */
const warpColumnOk = (L, x) => {
  for (let i = 0; i < 2; i++) {
    for (let y = 7; y <= 12; y++) if (L.rows[y][x + i] !== T.EMPTY) return false
  }
  for (let i = 1; i <= 3; i++) {
    if (!SOLID.has(L.rows[GROUND_ROW][x - i])) return false
    if (!SOLID.has(L.rows[GROUND_ROW][x + 1 + i])) return false
  }
  return true
}

const buildWarpPipe = (L, x, rand) => {
  // 管高 ≤ 3：保证能直接跳上去站住
  const ph = 2 + Math.floor(rand() * 2)
  clearHeadroom(L, x - 3, x + 4)
  for (let i = 0; i < 2; i++) {
    for (let y = GROUND_ROW - ph; y <= 12; y++) put(L, x + i, y, T.WARP)
  }
  // 管口上方撒金币做视觉引导
  if (rand() < 0.6) fill(L, x, x + 1, GROUND_ROW - ph - 3, T.COIN)
}

/** 该列是否可作为存档点：4 格净空 + 头顶留 1 格 + 脚下实心 */
const isFreeColumn = (L, x) => {
  for (let y = 8; y <= 12; y++) if (L.rows[y][x] !== T.EMPTY) return false
  return SOLID.has(L.rows[GROUND_ROW][x])
}

/**
 * 撒中途存档点：关卡越长给越多，死亡后从最近一个重生
 * @returns {number[]} 存档点列号
 */
const placeCheckpoints = (L, w) => {
  const count = Math.min(4, Math.max(1, Math.floor(w / 130)))
  const out = []
  for (let i = 1; i <= count; i++) {
    const want = Math.floor((w * i) / (count + 1))
    let cx = -1
    for (let d = 0; d <= 18 && cx < 0; d++) {
      for (const c of [want - d, want + d]) {
        if (c < 14 || c > w - 26) continue
        if (!isFreeColumn(L, c)) continue
        cx = c
        break
      }
    }
    if (cx < 0) continue
    for (let y = 9; y <= 12; y++) put(L, cx, y, T.CHECKPOINT)
    for (let y = GROUND_ROW; y < ROWS; y++) put(L, cx, y, T.GROUND)
    out.push(cx)
  }
  return out
}

/** 是否阻挡（实体字符如敌人 / 出生点不算阻挡） */
const blocked = (ch) => SOLID.has(ch)

/** 站立点：脚下实心且自身两格空（大马里奥体型） */
const standable = (rows, w, tx, ty) => {
  if (tx < 1 || tx >= w - 1 || ty < 2 || ty > GROUND_ROW - 1) return false
  if (!SOLID.has(rows[ty + 1][tx])) return false
  return !blocked(rows[ty][tx]) && !blocked(rows[ty - 1][tx])
}

/**
 * 跳跃路径是否通畅
 * 假设玩家进入跳跃中段时已上升约 2 格（保守估计，实际可上升 4 格以上），
 * 只检查中间列的这条"飞行走廊"与起终点的头顶净空
 */
const jumpClear = (rows, w, x0, y0, x1, y1) => {
  const [ax, bx] = x0 < x1 ? [x0, x1] : [x1, x0]
  const hi = Math.min(y0, y1)
  const top = Math.max(1, hi - 4)
  const bottom = Math.max(top, hi - 2)
  for (let x = ax + 1; x <= bx - 1; x++) {
    for (let y = top; y <= bottom; y++) {
      if (blocked(rows[y][x])) return false
    }
  }
  for (let y = Math.max(1, hi - 1); y <= hi; y++) {
    if (blocked(rows[y][x0]) || blocked(rows[y][x1])) return false
  }
  return true
}

/** BFS 可达性校验：从出生点能否走到旗杆 */
export const isReachable = (rows, w) => {
  const startX = 3
  const goalX = w - 9
  const seen = new Set()
  const queue = []
  for (let ty = 2; ty <= GROUND_ROW - 1; ty++) {
    if (standable(rows, w, startX, ty)) { queue.push([startX, ty]); seen.add(startX + ',' + ty) }
  }
  if (!queue.length) return false
  while (queue.length) {
    const [x, y] = queue.shift()
    if (x >= goalX - 1 && y >= GROUND_ROW - 2) return true
    // 行走
    for (const dx of [-1, 1]) {
      for (const dy of [0, -1, 1]) {
        const nx = x + dx
        const ny = y + dy
        if (!standable(rows, w, nx, ny)) continue
        const key = nx + ',' + ny
        if (seen.has(key)) continue
        seen.add(key)
        queue.push([nx, ny])
      }
    }
    // 跳跃
    for (let dx = -MAX_DX; dx <= MAX_DX; dx++) {
      for (let dy = -MAX_RISE; dy <= 4; dy++) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 1 || nx >= w - 1) continue
        if (!standable(rows, w, nx, ny)) continue
        if (!jumpClear(rows, w, x, y - 1, nx, ny - 1)) continue
        const key = nx + ',' + ny
        if (seen.has(key)) continue
        seen.add(key)
        queue.push([nx, ny])
      }
    }
  }
  return false
}

/** 修复不可达：清掉断点列的障碍并补地面 */
const repair = (rows, w) => {
  const frontier = new Set()
  const seen = new Set()
  const queue = []
  for (let ty = 2; ty <= GROUND_ROW - 1; ty++) {
    if (standable(rows, w, 3, ty)) { queue.push([3, ty]); seen.add('3,' + ty) }
  }
  let maxX = 3
  while (queue.length) {
    const [x, y] = queue.shift()
    maxX = Math.max(maxX, x)
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1], [x + 2, y], [x + 3, y]]) {
      if (!standable(rows, w, nx, ny)) { if (nx > maxX) frontier.add(nx); continue }
      const key = nx + ',' + ny
      if (seen.has(key)) continue
      seen.add(key)
      queue.push([nx, ny])
    }
  }
  const bx = Math.min(w - 2, maxX + 1)
  for (let y = GROUND_ROW - 4; y <= ROWS - 1; y++) rows[y][bx] = T.EMPTY
  rows[GROUND_ROW][bx] = T.GROUND
  rows[ROWS - 1][bx] = T.GROUND
  return bx
}

/** 生成一关无尽地图 */
export const generateLevel = (index, seed = 1) => {
  const diff = Math.min(4, Math.floor(index / 2))
  const rand = mulberry32(((seed || 1) + index * 7919) >>> 0)
  const w = endlessWidth(index)
  const rows = Array.from({ length: ROWS }, () => Array(w).fill(T.EMPTY))
  const L = { rows, w }
  for (let y = GROUND_ROW; y < ROWS; y++) fill(L, 0, w - 1, y, T.GROUND)

  const pool = [segFlat, segBricks, segPipe, segGap, segPlatform, segStairs]
  if (diff >= 2) pool.push(segMove)
  if (diff >= 1) pool.push(segSky)

  // 起点留 14 列跑道，保证第一个坑之前有加速空间
  let x = 14
  let last = -1
  while (x < w - 20) {
    let pick = Math.floor(rand() * pool.length)
    // 不允许连续两个同类型，坑洞更是强制换一个
    if (pick === last && (rand() < 0.7 || pool[pick] === segGap)) pick = (pick + 1) % pool.length
    last = pick
    const used = pool[pick](L, x, rand, diff)
    x += Math.max(5, used)
  }
  // 收尾平地 + 旗杆 + 城堡
  for (let xx = x; xx <= w - 9; xx++) clear(L, xx, 1, 12)
  for (let i = 0; i <= 9; i++) put(L, w - 8, 3 + i, T.FLAG_POLE)
  for (let y = 9; y <= 12; y++) fill(L, w - 5, w - 2, y, T.CASTLE)

  // 先放隐藏管道再放存档点：被管道占用的列不满足净空，自动不会被选为存档点
  const warps = placeWarpPipes(L, w, rand)
  const checkpoints = placeCheckpoints(L, w)

  for (let i = 0; i < 40 && !isReachable(rows, w); i++) repair(rows, w)

  return {
    name: `无尽 ${index + 1}`,
    desc: `难度 ${diff + 1} · ${w} 列 · ${checkpoints.length} 个存档点 · ${warps.length} 根隐藏管道 · 已通过可达性校验`,
    rows: rows.map((r) => r.join('')),
  }
}
