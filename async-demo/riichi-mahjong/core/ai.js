import { shanten } from './shanten.js'
import { isHonor, rankOf, suitOf, totalOf, countsFrom } from './tiles.js'
import { winningDecompositions, isChiitoitsu, isKokushi } from './hand.js'

export const AI_PARAMS = {
  easy: {
    label: '简单', shantenW: 1.0, yakuW: 0, defenseW: 0,
    riichiMinUkeire: 99, riichiMaxTurn: 0, meld: 'none', think: [400, 800],
  },
  normal: {
    label: '普通', shantenW: 1.0, yakuW: 0.2, defenseW: 0.15,
    riichiMinUkeire: 3, riichiMaxTurn: 14, meld: 'low', think: [600, 1200],
  },
  hard: {
    label: '困难', shantenW: 0.55, yakuW: 0.35, defenseW: 0.5,
    riichiMinUkeire: 4, riichiMaxTurn: 14, meld: 'mid', think: [800, 1600],
  },
}

/** 进张：能让向听 −1 的牌，按未确认剩余加权 */
const ukeireValue = (counts, melds, remaining) => {
  const cur = shanten(counts, melds)
  let n = 0
  const list = []
  for (let t = 0; t < 34; t++) {
    if (counts[t] >= 4) continue
    if (remaining && remaining[t] <= 0) continue
    counts[t]++
    const s = shanten(counts, melds)
    counts[t]--
    if (s < cur) {
      n += remaining ? remaining[t] : 1
      list.push(t)
    }
  }
  return { value: n, tiles: list }
}

/** 安全度（6.4）：现物 10 分最高，筋 / 已现字牌次之 */
const safetyOf = (kind, opp, seen) => {
  if (opp.river.some((d) => d.kind === kind)) return 10
  if (isHonor(kind)) {
    const n = seen[kind] || 0
    if (n >= 3) return 7
    if (n >= 2) return 5
    return 2
  }
  const r = rankOf(kind)
  const base = suitOf(kind) * 9
  let s = r === 1 || r === 9 ? 4 : r === 2 || r === 8 ? 3 : 2
  const suji = (d) => opp.river.some((d2) => d2.kind === base + (r - 1 + d))
  const left = suji(-3)
  const right = suji(3)
  if (left && right) s = Math.max(s, 8)
  else if (left || right) s = Math.max(s, 6)
  // 壁：相邻牌 4 张全见 → 该牌不可能被两面听
  const kabe = (d) => {
    const t = base + (r - 1 + d)
    if (t < base || t >= base + 9) return false
    return (seen[t] || 0) >= 4
  }
  if ((kabe(-1) && kabe(-2)) || (kabe(1) && kabe(2))) s = Math.max(s, 9)
  return s
}

/** 役种亲和：保留役牌对子 / 主花色 / 断幺 */
const yakuAffinity = (kind, counts, melds) => {
  let v = 0
  if (counts[kind] >= 2) v += isHonor(kind) ? 3 : 1.5
  const suitCount = [0, 1, 2].map((s) => counts.slice(s * 9, s * 9 + 9).reduce((a, b) => a + b, 0))
  const main = suitCount.indexOf(Math.max(...suitCount))
  if (!isHonor(kind) && suitOf(kind) === main) v += suitCount[main] >= 9 ? 2 : 0.5
  if (isHonor(kind) && suitCount[main] >= 9) v += 1
  if (rankOf(kind) === 1 || rankOf(kind) === 9 || isHonor(kind)) v -= 0.3
  if (!melds.length && (rankOf(kind) === 1 || rankOf(kind) === 9 || isHonor(kind))) v -= 0.2
  return v
}

/**
 * AI 打牌决策（6.2）
 * @returns {number} 要打出的牌 kind
 */
export const chooseDiscard = (g, me, opts = {}) => {
  const p = AI_PARAMS[opts.difficulty || 'normal']
  const counts = me.tiles.slice()
  const c = new Array(34).fill(0)
  for (const k of counts) c[k]++
  const melds = me.melds
  const opp = g.state.players[1 - me.index]
  const remaining = opts.remaining || new Array(34).fill(4)
  const seen = opts.seen || new Array(34).fill(0)

  const threat = opp.riichi ? 3 : opp.melds.length >= 2 ? 2 : opp.melds.length === 1 ? 1 : 0
  const myShanten = shanten(c, melds)
  const fold = p.defenseW > 0 && threat >= 2 && myShanten >= 2

  const cands = []
  for (let k = 0; k < 34; k++) {
    if (!c[k]) continue
    const c2 = c.slice()
    c2[k]--
    cands.push({
      kind: k,
      sh: shanten(c2, melds),
      uke: ukeireValue(c2, melds, remaining).value,
      safety: safetyOf(k, opp, seen),
      yaku: yakuAffinity(k, c, melds),
    })
  }
  if (!cands.length) return me.drawn !== null ? me.drawn : me.tiles[me.tiles.length - 1]

  // 两阶段：先按向听数收敛候选，再用进张 / 役种 / 安全度在同层内择优
  // （进张数不能直接跨向听层比较——越差的手能进的牌反而更多）
  let pool = cands
  if (fold) {
    const maxSafe = Math.max(...cands.map((x) => x.safety))
    pool = cands.filter((x) => x.safety >= maxSafe - 1)
    const fs = Math.min(...pool.map((x) => x.sh))
    pool = pool.filter((x) => x.sh <= fs + 1)
  } else {
    const minSh = Math.min(...cands.map((x) => x.sh))
    pool = cands.filter((x) => x.sh <= minSh + (p.shantenW >= 1 ? 0 : 1))
  }

  let top = -Infinity
  for (const x of pool) {
    x.score = x.uke + p.yakuW * x.yaku * 6 + p.defenseW * x.safety * (threat >= 2 ? 4 : 1.2)
    if (x.score > top) top = x.score
  }
  const best = pool.filter((x) => x.score >= top - 0.001)
  return best[Math.floor(Math.random() * best.length)].kind
}

/** AI 是否立直 */
export const shouldRiichi = (g, me, opts = {}) => {
  const p = AI_PARAMS[opts.difficulty || 'normal']
  const menzen = me.melds.every((m) => m.type === 'ankan')
  if (!menzen || me.riichi) return false
  const counts = me.tiles.slice()
  const c = new Array(34).fill(0)
  for (const k of counts) c[k]++
  if (shanten(c, me.melds) !== 0) return false
  const remaining = opts.remaining || new Array(34).fill(4)
  let n = 0
  for (let t = 0; t < 34; t++) {
    if (c[t] >= 4 || remaining[t] <= 0) continue
    c[t]++
    if (shanten(c, me.melds) === -1) n += remaining[t]
    c[t]--
  }
  if (n < p.riichiMinUkeire) return false
  if ((opts.turn || 0) > p.riichiMaxTurn) return false
  return !furiten(me)
}

/**
 * 立直宣言时该打哪张：在「切完仍听牌」的候选里，选剩余和了牌最多的一张
 * @returns {number|null} kind
 */
export const chooseRiichiDiscard = (g, me, opts = {}) => {
  const legal = g.riichiDiscards(me.index)
  if (!legal.length) return null
  const remaining = opts.remaining || new Array(34).fill(4)
  const c = countsFrom(me.tiles)
  let best = null
  for (const k of legal) {
    const c2 = c.slice()
    c2[k]--
    let n = 0
    for (let t = 0; t < 34; t++) {
      if (c2[t] >= 4 || remaining[t] <= 0) continue
      c2[t]++
      if (shanten(c2, me.melds) === -1) n += remaining[t]
      c2[t]--
    }
    if (!best || n > best.n) best = { k, n }
  }
  return best ? best.k : legal[0]
}

/** 振听：自己牌河含和了牌 */
export const furiten = (me) => {
  const counts = me.tiles.slice()
  const c = new Array(34).fill(0)
  for (const k of counts) c[k]++
  for (let t = 0; t < 34; t++) {
    if (c[t] >= 4) continue
    c[t]++
    const win = shanten(c, me.melds) === -1
    c[t]--
    if (win && me.river.some((d) => d.kind === t)) return true
  }
  return false
}

/**
 * AI 对对手舍牌的响应决策
 * @returns {{type:string, kinds?:number[]}}
 */
export const chooseCall = (g, me, tile, opts = {}) => {
  const p = AI_PARAMS[opts.difficulty || 'normal']
  const counts = me.tiles.slice()
  const c = new Array(34).fill(0)
  for (const k of counts) c[k]++
  const melds = me.melds

  // 荣和：必须以引擎的 tryWin 为准（振听 / 无役都会被它挡掉），
  // 否则 AI 会在 doRon 返回 null 时卡在 response 阶段死循环
  if (g.tryWin(me, tile, false)) return { type: 'ron' }

  if (p.meld === 'none') return { type: 'pass' }
  if (me.riichi) return { type: 'pass' }

  const cur = shanten(c, melds)
  // 碰
  if (c[tile] >= 2) {
    const c2 = c.slice()
    c2[tile] -= 2
    const melds2 = melds.concat([{ type: 'pon', kinds: [tile, tile, tile] }])
    if (shanten(c2, melds2) < cur) {
      const yakuLoss = p.meld === 'low' && !melds.length && cur <= 1
      if (!yakuLoss || p.meld === 'mid') return { type: 'pon' }
    }
  }
  // 明杠
  if (c[tile] === 3 && (p.meld === 'mid' || cur <= 1)) {
    const c2 = c.slice()
    c2[tile] -= 3
    const melds2 = melds.concat([{ type: 'kan', kinds: [tile, tile, tile, tile] }])
    if (shanten(c2, melds2) <= cur) return { type: 'kan' }
  }
  // 吃（双人对局中对手即上家）
  if (!isHonor(tile)) {
    const r = rankOf(tile)
    const base = suitOf(tile) * 9
    const combos = []
    if (r <= 7 && c[tile + 1] && c[tile + 2]) combos.push([tile, tile + 1, tile + 2])
    if (r >= 2 && r <= 8 && c[tile - 1] && c[tile + 1]) combos.push([tile - 1, tile, tile + 1])
    if (r >= 3 && c[tile - 2] && c[tile - 1]) combos.push([tile - 2, tile - 1, tile])
    for (const kinds of combos) {
      const c2 = c.slice()
      for (const k of kinds) if (k !== tile) c2[k]--
      const melds2 = melds.concat([{ type: 'chi', kinds: kinds.slice() }])
      if (shanten(c2, melds2) < cur) {
        if (p.meld === 'mid' || (!melds.length && cur >= 2)) return { type: 'chi', kinds }
      }
    }
  }
  return { type: 'pass' }
}

/** AI 自家摸牌后的杠决策 */
export const chooseSelfKan = (g, me, opts = {}) => {
  const counts = me.tiles.slice()
  const c = new Array(34).fill(0)
  for (const k of counts) c[k]++
  const cur = shanten(c, me.melds)
  const out = []
  for (let t = 0; t < 34; t++) {
    if (c[t] !== 4) continue
    const c2 = c.slice()
    c2[t] -= 4
    const melds2 = me.melds.concat([{ type: 'ankan', kinds: [t, t, t, t] }])
    if (shanten(c2, melds2) <= cur) out.push({ type: 'ankan', kind: t })
  }
  if (opts.difficulty === 'easy') return null
  return out.length ? out[0] : null
}

export const thinkDelay = (difficulty = 'normal') => {
  const [a, b] = AI_PARAMS[difficulty].think
  return a + Math.random() * (b - a)
}
