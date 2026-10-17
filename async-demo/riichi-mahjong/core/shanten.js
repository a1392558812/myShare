import { YAOCHUU, emptyCounts } from './tiles.js'

const stdCache = new Map()

/**
 * 标准型向听数：8 − 2×面子数 − 搭子数 − 雀头分
 * @param {number[]} counts 门清部分的 34 维计数
 * @param {number} meldCount 已副露面子数
 */
export const shantenStandard = (counts, meldCount = 0) => {
  const key = counts.join(',') + '|' + meldCount
  const hit = stdCache.get(key)
  if (hit !== undefined) return hit

  const c = counts.slice()
  // 面子 + 搭子（含副露）最多 4 组，雀头单独占一位
  const maxBlocks = 4 - meldCount
  let best = 8 - 2 * meldCount

  const consider = (sets, partials, head) => {
    const s = 8 - 2 * (meldCount + sets) - partials - head
    if (s < best) best = s
  }

  const dfs = (i, sets, partials, head) => {
    if (i >= 34) {
      consider(sets, partials, head)
      return
    }
    if (c[i] === 0) {
      dfs(i + 1, sets, partials, head)
      return
    }
    const blocks = sets + partials
    const canSet = blocks < maxBlocks
    const canPartial = blocks < maxBlocks
    if (canSet && c[i] >= 3) {
      c[i] -= 3
      dfs(i, sets + 1, partials, head)
      c[i] += 3
    }
    if (canSet && i < 27 && i % 9 <= 6 && c[i + 1] > 0 && c[i + 2] > 0) {
      c[i]--; c[i + 1]--; c[i + 2]--
      dfs(i, sets + 1, partials, head)
      c[i]++; c[i + 1]++; c[i + 2]++
    }
    if (c[i] >= 2) {
      c[i] -= 2
      if (!head) dfs(i, sets, partials, 1)
      if (canPartial) dfs(i, sets, partials + 1, head)
      c[i] += 2
    }
    if (canPartial && i < 27 && i % 9 <= 7 && c[i + 1] > 0) {
      c[i]--; c[i + 1]--
      dfs(i, sets, partials + 1, head)
      c[i]++; c[i + 1]++
    }
    if (canPartial && i < 27 && i % 9 <= 6 && c[i + 2] > 0) {
      c[i]--; c[i + 2]--
      dfs(i, sets, partials + 1, head)
      c[i]++; c[i + 2]++
    }
    const n = c[i]
    c[i] = 0
    dfs(i + 1, sets, partials, head)
    c[i] = n
  }
  dfs(0, 0, 0, 0)

  if (stdCache.size > 200000) stdCache.clear()
  stdCache.set(key, best)
  return best
}

/** 七对子向听 */
export const shantenChiitoi = (counts) => {
  let pairs = 0
  let kinds = 0
  for (let i = 0; i < 34; i++) {
    if (counts[i] > 0) kinds++
    if (counts[i] >= 2) pairs++
  }
  let s = 6 - pairs
  if (kinds < 7) s += 7 - kinds
  return s
}

/** 国士无双向听 */
export const shantenKokushi = (counts) => {
  let kinds = 0
  let pair = 0
  for (const t of YAOCHUU) {
    if (counts[t] > 0) kinds++
    if (counts[t] >= 2) pair = 1
  }
  return 13 - kinds - pair
}

/**
 * 综合向听数：min(标准型, 七对子, 国士)
 * @param {number[]} counts 门清部分计数
 * @param {Array} melds 副露（非空时七对/国士不成立）
 */
export const shanten = (counts, melds = []) => {
  let s = shantenStandard(counts, melds.length)
  if (!melds.length) {
    const a = shantenChiitoi(counts)
    const b = shantenKokushi(counts)
    if (a < s) s = a
    if (b < s) s = b
  }
  return s
}

/** 听牌判定：向听数 === 0 */
export const isTenpai = (counts, melds = []) => {
  const n = counts.reduce((a, b) => a + b, 0)
  if (n % 3 !== 1) return false
  return shanten(counts, melds) === 0
}

/** 和了形判定（14/13+N 张）：min 向听 === -1 */
export const isWinShape = (counts, melds = []) => {
  const n = counts.reduce((a, b) => a + b, 0)
  if (n % 3 !== 2) return false
  return shanten(counts, melds) === -1
}

/**
 * 有效进张：能让向听数下降的牌
 * @returns {{shanten:number, waits:number[], advance:number[]}}
 */
export const ukeire = (counts, melds = [], visible = null) => {
  const cur = shanten(counts, melds)
  const waits = []
  const advance = []
  const c = counts.slice()
  for (let t = 0; t < 34; t++) {
    if (c[t] >= 4) continue
    if (visible && visible[t] >= 4) continue
    c[t]++
    const s = shanten(c, melds)
    c[t]--
    if (s < cur) {
      advance.push(t)
      if (s === -1) waits.push(t)
    }
  }
  return { shanten: cur, waits, advance }
}

/** 听牌时的和了牌（向听 0 → 加一张后 −1） */
export const winningTiles = (counts, melds = []) => {
  const out = []
  const c = counts.slice()
  for (let t = 0; t < 34; t++) {
    if (c[t] >= 4) continue
    c[t]++
    if (shanten(c, melds) === -1) out.push(t)
    c[t]--
  }
  return out
}

export const emptyCountsFor = () => emptyCounts()
