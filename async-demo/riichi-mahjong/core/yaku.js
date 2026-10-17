import {
  DRAGONS, WINDS, GREEN_TILES, YAOCHUU, HAKU, HATSU, CHUN, HONOR_LABEL,
  isHonor, isYaochuu, totalOf,
} from './tiles.js'
import { winningDecompositions, isChiitoitsu, isKokushi } from './hand.js'
import { countDora } from './dora.js'

const DRAGON_NAME = { [HAKU]: HONOR_LABEL[4], [HATSU]: HONOR_LABEL[5], [CHUN]: HONOR_LABEL[6] }
const WIND_NAME = { 27: HONOR_LABEL[0], 28: HONOR_LABEL[1], 29: HONOR_LABEL[2], 30: HONOR_LABEL[3] }

/** 听牌形：两面 / 嵌张 / 边张 / 单骑 / 双碰 */
export const waitTypeOf = (decomp, winTile) => {
  if (decomp.form === 'chiitoi') return 'tanki'
  if (decomp.form === 'kokushi') return 'tanki'
  if (decomp.head === winTile) return 'tanki'
  const set = decomp.sets.find((s) => {
    if (s.type === 'run') return winTile >= s.kind && winTile <= s.kind + 2
    return s.kind === winTile
  })
  if (!set) return 'tanki'
  if (set.type !== 'run') return 'shanpon'
  const base = set.kind % 9
  const r = winTile - set.kind
  if (r === 1) return 'kanchan'
  if (r === 0) return base === 6 ? 'penchan' : 'ryanmen'
  return base === 0 ? 'penchan' : 'ryanmen'
}

const isYakuhaiTile = (t, seatWind, roundWind) =>
  DRAGONS.includes(t) || t === seatWind || t === roundWind

const fullCountsOf = (counts, melds) => {
  const c = counts.slice()
  for (const m of melds) for (const k of m.kinds) c[k]++
  return c
}

/** 单个分解的役种判定 */
export const evaluate = (ctx, decomp) => {
  const {
    counts, melds = [], winTile, isTsumo, isMenzen,
    seatWind, roundWind, flags = {},
  } = ctx
  const full = fullCountsOf(counts, melds)
  const yaku = []
  const yakuman = []
  const add = (key, name, han, menzenOnly = false) => yaku.push({ key, name, han, menzenOnly })
  const addY = (key, name) => yakuman.push({ key, name, han: 13 })
  const openCut = (menzenHan, openHan) => (isMenzen ? menzenHan : openHan)

  const form = decomp.form
  const sets = decomp.sets.map((s) => ({ ...s }))
  // 荣和补成的面子不再算暗刻
  const winSetIdx = sets.findIndex((s) => {
    if (s.type === 'run') return winTile >= s.kind && winTile <= s.kind + 2
    return s.kind === winTile
  })
  if (!isTsumo && winSetIdx >= 0 && !sets[winSetIdx].open) {
    sets[winSetIdx].concealed = false
    sets[winSetIdx].open = true
  }

  const wait = waitTypeOf(decomp, winTile)
  const triplets = sets.filter((s) => s.type === 'triplet' || s.type === 'kan')
  const runs = sets.filter((s) => s.type === 'run')
  const kans = sets.filter((s) => s.type === 'kan')
  const ankou = triplets.filter((s) => s.concealed && s.type !== 'kan')
    .length + kans.filter((s) => s.concealed).length

  /* ---------- 役满 ---------- */
  if (form === 'kokushi') addY('kokushi', '国士无双')
  if (isMenzen && ankou === 4) addY('suuankou', '四暗刻')
  if (kans.length === 4) addY('suukantsu', '四杠子')
  const dragonTri = DRAGONS.filter((d) => triplets.some((s) => s.kind === d))
  if (dragonTri.length === 3) addY('daisangen', '大三元')
  const windTri = WINDS.filter((w) => triplets.some((s) => s.kind === w))
  if (windTri.length === 4) addY('daisuushii', '大四喜')
  else if (windTri.length === 3 && WINDS.includes(decomp.head)) addY('shousuushii', '小四喜')
  if (full.every((n, i) => n === 0 || isHonor(i))) addY('tsuuiisou', '字一色')
  if (full.every((n, i) => n === 0 || GREEN_TILES.includes(i)) && totalOf(full) === 14) {
    addY('ryuuiisou', '绿一色')
  }
  if (isMenzen && !melds.length) {
    const suit = [0, 9, 18].find((b) => full.slice(b, b + 9).some((n) => n > 0))
    if (suit !== undefined && !full.slice(27).some((n) => n > 0) &&
      !full.slice(0, 27).some((n, i) => n > 0 && Math.floor(i / 9) * 9 !== suit)) {
      const base = [3, 1, 1, 1, 1, 1, 1, 1, 3]
      const seg = full.slice(suit, suit + 9)
      if (seg.every((n, i) => n >= base[i]) && totalOf(full) === 14) addY('chuuren', '九莲宝灯')
    }
  }
  if (flags.tenhou) addY('tenhou', '天和')
  if (flags.chiihou) addY('chiihou', '地和')

  /* ---------- 普通役 ---------- */
  if (yakuman.length) {
    return { yaku, yakuman, han: 13, wait, sets, form, isYakuman: true }
  }

  if (flags.riichi) add('riichi', '立直', 1, true)
  if (flags.ippatsu) add('ippatsu', '一発', 1, true)
  if (isMenzen && isTsumo) add('menzenTsumo', '门前清自摸和', 1, true)
  if (form === 'chiitoi') add('chiitoitsu', '七对子', 2)

  if (full.every((n, i) => n === 0 || isYaochuu(i))) add('honroutou', '混老头', 2)

  if (!YAOCHUU.some((t) => full[t] > 0)) add('tanyao', '断幺九', 1)

  if (form !== 'chiitoi' && form !== 'kokushi') {
    for (const s of triplets) {
      if (DRAGONS.includes(s.kind)) add('yakuhai' + s.kind, `役牌 ${DRAGON_NAME[s.kind]}`, 1)
      if (s.kind === roundWind) add('roundWind', `场风 ${WIND_NAME[roundWind]}`, 1)
      if (s.kind === seatWind) add('seatWind', `自风 ${WIND_NAME[seatWind]}`, 1)
    }

    const allRuns = sets.length > 0 && sets.every((s) => s.type === 'run')
    if (isMenzen && allRuns && !isYakuhaiTile(decomp.head, seatWind, roundWind) && wait === 'ryanmen') {
      add('pinfu', '平和', 1, true)
    }

    if (isMenzen) {
      const cnt = new Map()
      for (const s of runs) cnt.set(s.kind, (cnt.get(s.kind) || 0) + 1)
      let pairs = 0
      for (const n of cnt.values()) pairs += Math.floor(n / 2)
      if (pairs >= 2) add('ryanpeikou', '两杯口', 3, true)
      else if (pairs === 1) add('iipeiko', '一杯口', 1, true)
    }

    for (let r = 0; r <= 6; r++) {
      if (runs.some((s) => s.kind === r) && runs.some((s) => s.kind === 9 + r) && runs.some((s) => s.kind === 18 + r)) {
        add('sanshoku', '三色同顺', openCut(2, 1))
        break
      }
    }
    for (const b of [0, 9, 18]) {
      if (runs.some((s) => s.kind === b) && runs.some((s) => s.kind === b + 3) && runs.some((s) => s.kind === b + 6)) {
        add('ittsu', '一气通贯', openCut(2, 1))
        break
      }
    }

    const blockHasYao = (s) => {
      if (s.type === 'run') {
        const r = s.kind % 9
        return r === 0 || r === 6
      }
      return isYaochuu(s.kind)
    }
    if (sets.length && sets.every(blockHasYao) && isYaochuu(decomp.head)) {
      const honorBlock = sets.some((s) => s.type !== 'run' && isHonor(s.kind)) || isHonor(decomp.head)
      if (honorBlock) add('chanta', '混全带幺九', openCut(2, 1))
      else add('junchan', '纯全带幺九', openCut(3, 2))
    }

    if (sets.length && sets.every((s) => s.type !== 'run')) add('toitoi', '对对和', 2)
    if (ankou === 3) add('sanankou', '三暗刻', 2)
    if (kans.length === 3) add('sankantsu', '三杠子', 2)
    if (dragonTri.length === 2 && DRAGONS.includes(decomp.head)) add('shousangen', '小三元', 2)
  }

  const suits = [0, 1, 2].filter((s) => full.slice(s * 9, s * 9 + 9).some((n) => n > 0))
  const hasHonor = full.slice(27).some((n) => n > 0)
  if (suits.length === 1 && !hasHonor) add('chinitsu', '清一色', openCut(6, 5))
  else if (suits.length === 1 && hasHonor) add('honitsu', '混一色', openCut(3, 2))

  if (flags.haitei) add('haitei', '海底捞月', 1)
  if (flags.houtei) add('houtei', '河底捞鱼', 1)
  if (flags.rinshan) add('rinshan', '岭上开花', 1)
  if (flags.chankan) add('chankan', '抢杠', 1)
  if (flags.kanfuri) add('kanfuri', '杠振', 1)

  const han = yaku.reduce((a, b) => a + b.han, 0)
  return { yaku, yakuman, han, wait, sets, form, isYakuman: false }
}

/**
 * 和牌判定与算番：在所有分解中取番数最高（同番取符最高）的一套
 * @returns {null|Object} 无役或不成和了形时返回 null
 */
export const judge = (opts) => {
  const {
    counts: countsIn, melds = [], winTile, isTsumo = false, seatWind = 27, roundWind = 27, flags = {},
    doraIndicators = [],
  } = opts
  const menzen = melds.every((m) => m.type === 'ankan')
  // 荣和时传入的是 13 张门清手，补上和了牌再判定
  const counts = countsIn.slice()
  if (!isTsumo) counts[winTile]++
  if (!isChiitoitsu(counts, melds) && !isKokushi(counts, melds)) {
    if (totalOf(counts) % 3 !== 2) return null
  }
  const decomps = winningDecompositions(counts, melds)
  if (!decomps.length) return null
  const ctx = { counts, melds, winTile, isTsumo, isMenzen: menzen, seatWind, roundWind, flags }
  let best = null
  let bestDecomp = null
  let bestFu = -1
  for (const d of decomps) {
    const r = evaluate(ctx, d)
    if (!r.isYakuman && r.han === 0) continue
    const fu = fuOf(ctx, d, r)
    if (!best || r.han > best.han || (r.han === best.han && fu > bestFu)) {
      best = r
      bestDecomp = d
      bestFu = fu
    }
  }
  if (!best) return null
  // head 只存在于 decomposition（分解）上，evaluate 不带它 —— 必须回查 decomp，
  // 否则 result.head 恒为 undefined，结算页会拿它去画两张「空白牌」并抛 drawImage 异常
  const head = bestDecomp && Number.isInteger(bestDecomp.head) ? bestDecomp.head : -1
  const out = { ...best, fu: bestFu, isMenzen: menzen, decomposition: best.sets, head, dora: 0 }
  // 宝牌不是役：只在有役成立时叠加番数，役满不计
  const dora = countDora(counts, melds, doraIndicators)
  if (dora > 0 && !best.isYakuman) {
    out.dora = dora
    out.yaku = [...best.yaku, { key: 'dora', name: `宝牌 ×${dora}`, han: dora }]
    out.han = best.han + dora
  }
  return out
}

/** 符计算（4.1） */
export const fuOf = (ctx, decomp, res = null) => {
  if (decomp.form === 'chiitoi') return 25
  if (decomp.form === 'kokushi') return 0
  const { isTsumo, isMenzen, seatWind, roundWind, winTile } = ctx
  const pinfu = res ? res.yaku.some((y) => y.key === 'pinfu') : false
  let fu = 20
  if (isMenzen && !isTsumo) fu += 10
  if (isTsumo && !pinfu) fu += 2

  const head = decomp.head
  if (DRAGONS.includes(head)) fu += 2
  if (head === seatWind || head === roundWind) fu += 2

  const wait = res ? res.wait : waitTypeOf(decomp, winTile)
  if (wait === 'tanki' || wait === 'kanchan' || wait === 'penchan') fu += 2

  for (const s of decomp.sets) {
    if (s.type === 'run') continue
    const yao = isYaochuu(s.kind)
    if (s.type === 'kan') fu += s.concealed ? (yao ? 32 : 16) : (yao ? 16 : 8)
    else fu += s.concealed ? (yao ? 8 : 4) : (yao ? 4 : 2)
  }
  if (!isMenzen && fu === 20) fu = 30
  return Math.ceil(fu / 10) * 10
}

/**
 * 手牌分解，供结算界面展示。**返回结构化数据而不是文本**，
 * 界面用 TileFace 画真牌面（不做 123m / 東東東 这类简写）
 * @returns {Array<{kinds?:number[], tag?:string, label?:string, concealed?:boolean}>}
 *   kinds = 这一组里每张牌的牌种；tag = 附加说明（雀头）；label = 纯文字组（国士）
 *   concealed = 是否门清（false 即副露 / 明刻明杠）
 */
export const breakdownOf = (result, counts, melds) => {
  // 国士：把 13 种幺九（含重复的那张）全部展开成牌面，配一行文字说明
  if (result.form === 'kokushi') {
    const kinds = []
    for (const k of YAOCHUU) for (let n = 0; n < (counts[k] || 0); n++) kinds.push(k)
    return [{ kinds, label: '国士无双十三面', concealed: true }]
  }
  if (result.form === 'chiitoi') {
    const out = []
    for (let i = 0; i < 34; i++) if (counts[i] === 2) out.push({ kinds: [i, i], concealed: true })
    return out
  }
  const parts = result.sets.map((s) => ({
    kinds: s.type === 'run'
      ? [s.kind, s.kind + 1, s.kind + 2]
      : new Array(s.type === 'kan' ? 4 : 3).fill(s.kind),
    concealed: !!s.concealed,
  }))
  // 特殊牌型下 head 可能是 undefined：雀头画不出来就别塞进去，否则界面会画出空白牌
  if (Number.isInteger(result.head) && result.head >= 0 && result.head < 34) {
    parts.push({ kinds: [result.head, result.head], tag: '雀头', concealed: true })
  }
  return parts
}

export { isChiitoitsu, isKokushi }
