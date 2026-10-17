import { NO_COLOR, SPECIAL } from './constants.js'

let uid = 1

/** 格子坐标 → 唯一数字键（列数 < 100） */
export const ck = (r, c) => r * 100 + c
export const unck = (k) => [(k / 100) | 0, k % 100]

export const createTile = (color, special = null) => ({
  id: uid++,
  color,
  special,
  row: 0,
  col: 0,
  ox: 0,
  oy: 0,
  land: 0,
  pop: 0,
})

const inBounds = (rows, cols, r, c) => r >= 0 && r < rows && c >= 0 && c < cols

/** 是否参与连线匹配：彩球无色，不参与 */
const matchable = (t) => !!t && t.color !== NO_COLOR

/** 扫描全盘所有 ≥3 的连续同色段 */
export const findRuns = (grid, rows, cols) => {
  const runs = []
  for (let r = 0; r < rows; r++) {
    let c = 0
    while (c < cols) {
      const t = grid[r][c]
      if (!matchable(t)) { c++; continue }
      let e = c + 1
      while (e < cols) {
        const n = grid[r][e]
        if (!matchable(n) || n.color !== t.color) break
        e++
      }
      if (e - c >= 3) runs.push({ dir: 'h', r, c, len: e - c, color: t.color })
      c = e
    }
  }
  for (let c = 0; c < cols; c++) {
    let r = 0
    while (r < rows) {
      const t = grid[r][c]
      if (!matchable(t)) { r++; continue }
      let e = r + 1
      while (e < rows) {
        const n = grid[e][c]
        if (!matchable(n) || n.color !== t.color) break
        e++
      }
      if (e - r >= 3) runs.push({ dir: 'v', r, c, len: e - r, color: t.color })
      r = e
    }
  }
  return runs
}

/** 指定格子是否处于任一 ≥3 连续段中 */
export const hasRunAt = (grid, rows, cols, r, c) => {
  const t = grid[r] && grid[r][c]
  if (!matchable(t)) return false
  let n = 1
  for (let i = c - 1; i >= 0; i--) {
    const x = grid[r][i]
    if (!matchable(x) || x.color !== t.color) break
    n++
  }
  for (let i = c + 1; i < cols; i++) {
    const x = grid[r][i]
    if (!matchable(x) || x.color !== t.color) break
    n++
  }
  if (n >= 3) return true
  n = 1
  for (let i = r - 1; i >= 0; i--) {
    const x = grid[i][c]
    if (!matchable(x) || x.color !== t.color) break
    n++
  }
  for (let i = r + 1; i < rows; i++) {
    const x = grid[i][c]
    if (!matchable(x) || x.color !== t.color) break
    n++
  }
  return n >= 3
}

export const runCells = (run) => {
  const out = []
  for (let i = 0; i < run.len; i++) out.push(run.dir === 'h' ? [run.r, run.c + i] : [run.r + i, run.c])
  return out
}

/** 找出一个合法交换（含彩球：彩球与任意块交换都算合法） */
export const findHint = (grid, rows, cols) => {
  const test = (r1, c1, r2, c2) => {
    const a = grid[r1][c1]
    const b = grid[r2][c2]
    if (!a || !b) return false
    if (a.special === SPECIAL.RAINBOW || b.special === SPECIAL.RAINBOW) return true
    grid[r1][c1] = b
    grid[r2][c2] = a
    const ok = hasRunAt(grid, rows, cols, r1, c1) || hasRunAt(grid, rows, cols, r2, c2)
    grid[r1][c1] = a
    grid[r2][c2] = b
    return ok
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c + 1 < cols && test(r, c, r, c + 1)) return [[r, c], [r, c + 1]]
      if (r + 1 < rows && test(r, c, r + 1, c)) return [[r, c], [r + 1, c]]
    }
  }
  return null
}

const emptyGrid = (rows, cols) => Array.from({ length: rows }, () => new Array(cols).fill(null))

/** 逐格填充，规避左右/上下已形成的三连 */
const fillNoMatch = (rows, cols, colorCount) => {
  const grid = emptyGrid(rows, cols)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const banned = new Set()
      if (c >= 2 && grid[r][c - 1] && grid[r][c - 2] && grid[r][c - 1].color === grid[r][c - 2].color) {
        banned.add(grid[r][c - 1].color)
      }
      if (r >= 2 && grid[r - 1][c] && grid[r - 2][c] && grid[r - 1][c].color === grid[r - 2][c].color) {
        banned.add(grid[r - 1][c].color)
      }
      const pool = []
      for (let i = 0; i < colorCount; i++) if (!banned.has(i)) pool.push(i)
      const t = createTile(pool[(Math.random() * pool.length) | 0])
      t.row = r
      t.col = c
      grid[r][c] = t
    }
  }
  return grid
}

/** 打散颜色（保留特殊块本体与彩球无色属性） */
export const randomizeColors = (grid, rows, cols, colorCount) => {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = grid[r][c]
      if (t && t.color !== NO_COLOR) t.color = (Math.random() * colorCount) | 0
    }
  }
}

/** 逐个改色消掉现存三连，保证静置盘面无残留匹配 */
export const fixRuns = (grid, rows, cols, colorCount) => {
  for (let pass = 0; pass < 80; pass++) {
    const runs = findRuns(grid, rows, cols)
    if (!runs.length) return true
    for (const run of runs) {
      const r = run.dir === 'h' ? run.r : run.r + (run.len >> 1)
      const c = run.dir === 'h' ? run.c + (run.len >> 1) : run.c
      const t = grid[r] && grid[r][c]
      if (!t || t.color === NO_COLOR) continue
      const old = t.color
      for (let cand = 0; cand < colorCount; cand++) {
        if (cand === old) continue
        t.color = cand
        if (!hasRunAt(grid, rows, cols, r, c)) break
        t.color = old
      }
    }
  }
  return findRuns(grid, rows, cols).length === 0
}

/** RULE-BOARD-GEN：开局无残留三连 + 至少一个合法交换，否则重洗（上限 3 轮） */
export const generateBoard = (rows, cols, colorCount) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const grid = fillNoMatch(rows, cols, colorCount)
    if (findRuns(grid, rows, cols).length === 0 && findHint(grid, rows, cols)) return grid
  }
  const grid = fillNoMatch(rows, cols, colorCount)
  for (let i = 0; i < 60 && !findHint(grid, rows, cols); i++) {
    randomizeColors(grid, rows, cols, colorCount)
    fixRuns(grid, rows, cols, colorCount)
  }
  return grid
}

/** 死局重洗：只打散颜色，成功需同时满足「无残留匹配 + 有合法交换」 */
export const shuffleBoard = (grid, rows, cols, colorCount) => {
  for (let attempt = 0; attempt < 40; attempt++) {
    randomizeColors(grid, rows, cols, colorCount)
    if (!fixRuns(grid, rows, cols, colorCount)) continue
    if (findHint(grid, rows, cols)) return true
  }
  return false
}

/**
 * 把互相交叠的 run 合并成组，据形状决定生成的特殊块
 * 三连→无；四连→直线炸弹；L/T→九宫炸弹；五连→彩球
 */
export const groupRuns = (runs, prefer) => {
  const parent = runs.map((_, i) => i)
  const find = (i) => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]]
      i = parent[i]
    }
    return i
  }
  const union = (a, b) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent[ra] = rb
  }

  const cellOwner = new Map()
  runs.forEach((run, i) => {
    run._cells = runCells(run)
    for (const [r, c] of run._cells) {
      const k = ck(r, c)
      if (cellOwner.has(k)) union(cellOwner.get(k), i)
      else cellOwner.set(k, i)
    }
  })

  const byRoot = new Map()
  runs.forEach((run, i) => {
    const root = find(i)
    if (!byRoot.has(root)) byRoot.set(root, [])
    byRoot.get(root).push(run)
  })

  const groups = []
  for (const list of byRoot.values()) {
    const cells = new Set()
    const dirs = new Set()
    let longest = list[0]
    for (const run of list) {
      dirs.add(run.dir)
      for (const [r, c] of run._cells) cells.add(ck(r, c))
      if (run.len > longest.len) longest = run
    }
    let special = null
    if (longest.len >= 5) special = SPECIAL.RAINBOW
    else if (dirs.size > 1) special = SPECIAL.AREA
    else if (longest.len === 4) special = longest.dir === 'h' ? SPECIAL.ROW : SPECIAL.COL

    const list2 = [...cells].map(unck)
    groups.push({ cells: list2, color: longest.color, special, longest, spawnAt: null })
  }

  // 生成位置：优先玩家移动后落点，其次最长段中点
  for (const gr of groups) {
    if (!gr.special) continue
    const inside = (p) => !!p && gr.cells.some(([r, c]) => r === p[0] && c === p[1])
    let pick = null
    if (prefer) for (const p of prefer) if (inside(p)) { pick = p; break }
    if (!pick) {
      const run = gr.longest
      pick = run.dir === 'h' ? [run.r, run.c + (run.len >> 1)] : [run.r + (run.len >> 1), run.c]
    }
    gr.spawnAt = pick
  }
  return groups
}

/** 重力下落 + 顶部补新块，返回移动列表与最大落差 */
export const collapse = (g) => {
  const moves = []
  let maxDist = 0
  for (let c = 0; c < g.cols; c++) {
    let write = g.rows - 1
    for (let r = g.rows - 1; r >= 0; r--) {
      const t = g.grid[r][c]
      if (!t) continue
      if (r !== write) {
        g.grid[write][c] = t
        g.grid[r][c] = null
        t.row = write
        moves.push({ t, dist: write - r })
        if (write - r > maxDist) maxDist = write - r
      }
      write--
    }
    const fresh = write + 1
    if (fresh > 0 && fresh > maxDist) maxDist = fresh
    for (let r = write; r >= 0; r--) {
      const t = createTile((Math.random() * g.colorCount) | 0)
      t.row = r
      t.col = c
      g.grid[r][c] = t
      moves.push({ t, dist: fresh })
    }
  }
  for (const m of moves) m.t.oy = -m.dist * g.cell
  return { moves, maxDist }
}

export { inBounds }
