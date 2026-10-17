import { YAOCHUU, countsFrom, totalOf } from './tiles.js'
import { shanten } from './shanten.js'

/**
 * 枚举门清部分全部「面子 + 雀头」分解
 * @param {number[]} counts 门清部分 34 维计数（张数须为 3k+2 或 3k）
 * @returns {Array<{head:number, sets:Array<{type:string,kind:number}>}>}
 */
export const decompose = (counts) => {
  const c = counts.slice()
  const out = []
  const seen = new Set()

  const push = (head, sets) => {
    const sig = head + ':' + sets.map((s) => s.type + s.kind).sort().join(',')
    if (seen.has(sig)) return
    seen.add(sig)
    out.push({ head, sets: sets.slice() })
  }

  // head 必须一路带到底：雀头决定符（役牌/连风雀头加符）、单骑判定、小四喜与四暗刻单骑，
  // 早先这里 push(-1) 把雀头丢了，导致标准形的 head 恒为 -1（结算页因此画出空白牌）
  const walk = (i, sets, head) => {
    while (i < 34 && c[i] === 0) i++
    if (i >= 34) {
      push(head, sets)
      return
    }
    if (c[i] >= 3) {
      c[i] -= 3
      walk(i, sets.concat([{ type: 'triplet', kind: i }]), head)
      c[i] += 3
    }
    if (i < 27 && i % 9 <= 6 && c[i + 1] > 0 && c[i + 2] > 0) {
      c[i]--; c[i + 1]--; c[i + 2]--
      walk(i, sets.concat([{ type: 'run', kind: i }]), head)
      c[i]++; c[i + 1]++; c[i + 2]++
    }
  }

  const total = totalOf(c)
  if (total % 3 === 2) {
    for (let h = 0; h < 34; h++) {
      if (c[h] < 2) continue
      c[h] -= 2
      walk(0, [], h)
      c[h] += 2
    }
  } else if (total % 3 === 0) {
    walk(0, [], -1)
  }
  return out
}

/** 七对子判定：门清 14 张且 7 种各 2 张 */
export const isChiitoitsu = (counts, melds = []) => {
  if (melds.length) return false
  if (totalOf(counts) !== 14) return false
  let kinds = 0
  for (let i = 0; i < 34; i++) {
    if (counts[i] === 0) continue
    if (counts[i] !== 2) return false
    kinds++
  }
  return kinds === 7
}

/** 国士无双判定 */
export const isKokushi = (counts, melds = []) => {
  if (melds.length) return false
  if (totalOf(counts) !== 14) return false
  let kinds = 0
  let pair = 0
  for (const t of YAOCHUU) {
    if (counts[t] === 0) return false
    kinds++
    if (counts[t] === 2) pair++
    if (counts[t] > 2) return false
  }
  return kinds === 13 && pair === 1
}

/** 国士十三面听：13 种各 1 张 + 1 张重复 → 和牌前为 13 张全幺九 */
export const isKokushi13 = (counts) => {
  if (totalOf(counts) !== 13) return false
  let kinds = 0
  for (const t of YAOCHUU) if (counts[t] > 0) kinds++
  return kinds === 13
}

/**
 * 把和牌手（门清计数 + 副露）拆成候选分解列表
 * @returns {Array<{form:string, head:number, sets:Array}>}
 */
export const winningDecompositions = (counts, melds = []) => {
  const res = []
  if (isKokushi(counts, melds)) {
    res.push({ form: 'kokushi', head: counts.findIndex((n, i) => YAOCHUU.includes(i) && n === 2), sets: [] })
    return res
  }
  // 七对子与标准型可能同时成立，两种都产出，交给算番取高者
  if (isChiitoitsu(counts, melds)) res.push({ form: 'chiitoi', head: -1, sets: [] })
  const meldSets = melds.map((m) => ({
    type: m.type === 'chi' ? 'run' : m.type === 'ankan' || m.type === 'kan' ? 'kan' : 'triplet',
    kind: m.type === 'chi' ? Math.min(...m.kinds) : m.kinds[0],
    open: m.type !== 'ankan',
    concealed: m.type === 'ankan',
    meld: m,
  }))
  for (const d of decompose(counts)) {
    const closed = d.sets.map((s) => ({ ...s, open: false, concealed: true, meld: null }))
    res.push({ form: 'standard', head: d.head, sets: closed.concat(meldSets) })
  }
  return res
}

/** 该手牌（含副露）是否构成和了形 */
export const isWinning = (counts, melds = []) => {
  if (isKokushi(counts, melds)) return true
  if (isChiitoitsu(counts, melds)) return true
  if (totalOf(counts) % 3 !== 2) return false
  return shanten(counts, melds) === -1
}

export { countsFrom }
