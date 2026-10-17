import {
  DRAGONS, WINDS, GREEN_TILES, YAOCHUU, HONOR_LABEL, MAN_KANJI, SUIT_CN,
  isHonor, isTerminal, isYaochuu, tileText, totalOf,
} from './tiles.js'

/** 未确认剩余张数（remaining 缺省视为 0，不猜） */
const rm = (remaining, t) => (remaining ? remaining[t] : 0)
const clamp01 = (n) => Math.max(0, Math.min(1, n))

/** 顺子中文名：起点 rank（0 起）+ 花色序号 → 如「三四五万」 */
const seqName = (r, suit) => MAN_KANJI[r] + MAN_KANJI[r + 1] + MAN_KANJI[r + 2] + SUIT_CN[suit]

/** 软进度权重：一个搭子/对子按半个已成要素计 */
const W = 0.5

/** 已成刻子（含副露的碰/杠/暗杠） */
const tripletKinds = (counts, melds) => {
  const out = []
  for (let i = 0; i < 34; i++) if (counts[i] >= 3) out.push(i)
  for (const m of melds) if (m.type !== 'chi') out.push(m.kinds[0])
  return out
}
/** 已成对子（门清手牌内） */
const pairKinds = (counts) => {
  const out = []
  for (let i = 0; i < 34; i++) if (counts[i] === 2) out.push(i)
  return out
}
/** 门清暗刻数：手牌内 counts>=3 + 已暗杠 */
const ankouCount = (counts, melds) =>
  counts.reduce((a, n) => a + (n >= 3 ? 1 : 0), 0) + melds.filter((m) => m.type === 'ankan').length

/**
 * 顺子系块分解（顺子优先，避免刻子吃掉顺子材料）
 * @returns {{runs:number[], protos:Array<{b:number,gap:number,open:boolean}>}}
 *   runs：顺子起点 kind；protos：搭子（gap=1 相邻/边张，gap=2 嵌张，open=两面）
 */
const decompose = (counts) => {
  const c = counts.slice()
  const runs = []
  const protos = []
  for (let i = 0; i < 27; i++) {
    if (i % 9 > 6) continue
    while (c[i] > 0 && c[i + 1] > 0 && c[i + 2] > 0) { c[i]--; c[i + 1]--; c[i + 2]--; runs.push(i) }
  }
  for (let i = 0; i < 27; i++) {
    if (i % 9 > 7) continue
    while (c[i] > 0 && c[i + 1] > 0) {
      c[i]--; c[i + 1]--
      protos.push({ b: i, gap: 1, open: i % 9 > 0 && i % 9 < 7 })
    }
  }
  for (let i = 0; i < 27; i++) {
    if (i % 9 > 6) continue
    while (c[i] > 0 && c[i + 2] > 0) { c[i]--; c[i + 2]--; protos.push({ b: i, gap: 2, open: false }) }
  }
  return { runs, protos }
}

/** 某顺子位是否三张齐 / 至少两张（搭子） */
const runFull = (c, b) => c[b] > 0 && c[b + 1] > 0 && c[b + 2] > 0
const runPart = (c, b) => [b, b + 1, b + 2].filter((k) => c[k] > 0).length >= 2

/**
 * 可凑役种进度分析
 * 口径：have = 已具备的硬性要素；soft = 可转化的搭子/对子；score = (have + soft×0.5) / need
 * @param {{counts:number[],melds:Array,menzen:boolean,remaining:number[],seatWind:number,roundWind:number,riichi:boolean}} o
 * @returns {{yakuman:Array, normal:Array}}
 */
export const analyzeProgress = (o) => {
  const { counts, melds = [], menzen = true, remaining, seatWind = 27, roundWind = 27, riichi = false } = o
  const full = counts.slice()
  for (const m of melds) for (const k of m.kinds) full[k]++
  const total = Math.max(totalOf(full), 13)
  const needTotal = menzen ? 14 : 13

  const tri = tripletKinds(counts, melds)
  const pair = pairKinds(counts)
  const ankou = ankouCount(counts, melds)
  const { runs, protos } = decompose(counts)

  const honorCount = full.slice(27).reduce((a, b) => a + b, 0)
  const suitCount = [0, 1, 2].map((s) => full.slice(s * 9, s * 9 + 9).reduce((a, b) => a + b, 0))
  const maxSuit = Math.max(...suitCount)
  const onlySuit = suitCount.filter((n) => n > 0).length === 1
  const suit = suitCount.indexOf(maxSuit)
  const yaoTotal = YAOCHUU.reduce((a, t) => a + full[t], 0)
  const termTotal = [0, 8, 9, 17, 18, 26].reduce((a, t) => a + full[t], 0)

  const yakuman = []
  const normal = []
  /** min：进入列表所需的最低要素数，用来压掉「理论可行但毫无希望」的噪声项 */
  const mk = (p) => {
    const x = { status: 'PROGRESSING', have: 0, need: 1, soft: 0, missing: [], note: '', always: false, min: 1, han: 1, ...p }
    x.score = clamp01((x.have + x.soft * W) / x.need)
    return x
  }

  /* ---------- 役满区 ---------- */
  const dragonTri = DRAGONS.filter((d) => tri.includes(d))
  const dragonPair = DRAGONS.filter((d) => pair.includes(d))
  yakuman.push(mk({
    key: 'daisangen', name: '大三元', han: 13, category: 'yakuman',
    have: dragonTri.length, soft: dragonPair.length, need: 3, min: 2,
    status: dragonTri.length >= 3 ? 'ACHIEVED' : 'PROGRESSING',
    missing: DRAGONS.filter((d) => !dragonTri.includes(d)).map((d) => ({
      tile: d, need: Math.max(1, 3 - counts[d]), remaining: rm(remaining, d),
    })),
  }))

  const windTri = WINDS.filter((w) => tri.includes(w))
  const windPairRaw = WINDS.filter((w) => pair.includes(w))
  yakuman.push(mk({
    key: 'daisuushii', name: '大四喜', han: 13, category: 'yakuman',
    have: windTri.length, soft: windPairRaw.length, need: 4, min: 2,
    status: windTri.length >= 4 ? 'ACHIEVED' : 'PROGRESSING',
    missing: WINDS.filter((w) => !windTri.includes(w)).map((w) => ({
      tile: w, need: Math.max(1, 3 - counts[w]), remaining: rm(remaining, w),
    })),
  }))

  const windHead = WINDS.includes(pair.find((p) => isHonor(p)) ?? -1)
  yakuman.push(mk({
    key: 'shousuushii', name: '小四喜', han: 13, category: 'yakuman',
    have: windTri.length + (windHead ? 1 : 0),
    soft: windPairRaw.length - (windHead ? 1 : 0), need: 4, min: 2,
    status: windTri.length >= 3 && windHead ? 'ACHIEVED' : 'PROGRESSING',
    missing: WINDS.filter((w) => !windTri.includes(w)).map((w) => ({
      tile: w, need: Math.max(1, 3 - counts[w]), remaining: rm(remaining, w),
    })),
  }))

  yakuman.push(mk({
    key: 'suuankou', name: '四暗刻', han: 13, category: 'yakuman',
    have: ankou, soft: pair.length, need: 4, min: 3,
    status: ankou >= 4 ? 'ACHIEVED' : 'PROGRESSING',
    note: menzen ? '' : '需门清',
  }))

  const yaoKinds = YAOCHUU.filter((t) => full[t] > 0).length
  const yaoPair = YAOCHUU.some((t) => full[t] >= 2)
  yakuman.push(mk({
    key: 'kokushi', name: '国士无双', han: 13, category: 'yakuman',
    have: yaoKinds + (yaoPair ? 1 : 0), need: 14, min: 6,
    status: yaoKinds + (yaoPair ? 1 : 0) >= 14 ? 'ACHIEVED' : 'PROGRESSING',
    missing: YAOCHUU.filter((t) => full[t] === 0).map((t) => ({
      tile: t, need: 1, remaining: rm(remaining, t),
    })),
  }))

  yakuman.push(mk({
    key: 'tsuuiisou', name: '字一色', han: 13, category: 'yakuman',
    have: honorCount, need: needTotal, min: 4,
    status: honorCount >= needTotal ? 'ACHIEVED' : 'PROGRESSING',
    missing: [{
      tile: -1, label: '任意字牌', need: Math.max(0, needTotal - honorCount),
      remaining: remaining ? remaining.slice(27).reduce((a, b) => a + b, 0) : 0,
    }],
  }))

  const greenCount = GREEN_TILES.reduce((a, t) => a + full[t], 0)
  yakuman.push(mk({
    key: 'ryuuiisou', name: '绿一色', han: 13, category: 'yakuman',
    have: greenCount, need: needTotal, min: 4,
    status: greenCount >= needTotal ? 'ACHIEVED' : 'PROGRESSING',
    missing: [{ tile: -1, label: '二/三/四/六/八索·發', need: Math.max(0, needTotal - greenCount), remaining: 0 }],
  }))

  yakuman.push(mk({
    key: 'chinroutou', name: '清老头', han: 13, category: 'yakuman',
    have: termTotal, need: needTotal, min: 4,
    status: honorCount === 0 && termTotal >= needTotal ? 'ACHIEVED' : 'PROGRESSING',
    note: honorCount ? '含字牌 → 只能走混老头' : '',
    missing: [{ tile: -1, label: '一九万/筒/索', need: Math.max(0, needTotal - termTotal), remaining: 0 }],
  }))

  const seg = full.slice(suit * 9, suit * 9 + 9)
  const chuurenBase = [3, 1, 1, 1, 1, 1, 1, 1, 3]
  const singleSuit = honorCount === 0 && suitCount.filter((n) => n > 0).length === 1
  const chuurenOk = menzen && singleSuit && seg.every((n, i) => n >= chuurenBase[i])
  yakuman.push(mk({
    key: 'chuuren', name: '九莲宝灯', han: 13, category: 'yakuman',
    have: singleSuit ? seg.reduce((a, n, i) => a + Math.min(n, chuurenBase[i]), 0) : 0, need: 13, min: 8,
    status: chuurenOk ? 'ACHIEVED' : 'PROGRESSING',
    note: chuurenOk ? '形态齐备，听该花色任意牌' : '',
    missing: seg.map((n, i) => ({ tile: suit * 9 + i, need: Math.max(0, chuurenBase[i] - n), remaining: rm(remaining, suit * 9 + i) }))
      .filter((m) => m.need > 0).slice(0, 4),
  }))

  const kans = melds.filter((m) => m.type === 'kan' || m.type === 'ankan').length
  yakuman.push(mk({
    key: 'suukantsu', name: '四杠子', han: 13, category: 'yakuman', have: kans, need: 4,
    status: kans >= 4 ? 'ACHIEVED' : 'PROGRESSING',
  }))

  /* ---------- 普通役区 ---------- */
  normal.push(mk({
    key: 'chinitsu', name: '清一色', han: menzen ? 6 : 5,
    have: maxSuit, need: needTotal, min: 5,
    status: onlySuit && honorCount === 0 && maxSuit >= needTotal ? 'ACHIEVED' : 'PROGRESSING',
    missing: [{ tile: -1, label: SUIT_CN[suit] + '子', need: Math.max(0, needTotal - maxSuit), remaining: 0 }],
  }))
  const honitsuHave = maxSuit + honorCount
  normal.push(mk({
    key: 'honitsu', name: '混一色', han: menzen ? 3 : 2,
    have: honitsuHave, need: needTotal, min: 6,
    status: onlySuit && honitsuHave >= needTotal ? 'ACHIEVED' : 'PROGRESSING',
    missing: [{ tile: -1, label: SUIT_CN[suit] + '子/字牌', need: Math.max(0, needTotal - honitsuHave), remaining: 0 }],
  }))

  normal.push(mk({
    key: 'tanyao', name: '断幺九', han: 1,
    have: total - yaoTotal, need: total,
    status: yaoTotal === 0 ? 'ACHIEVED' : 'PROGRESSING',
    note: yaoTotal === 0 ? '' : `含 ${yaoTotal} 张幺九，需全部换掉`,
    missing: YAOCHUU.filter((t) => full[t] > 0).map((t) => ({ tile: t, need: full[t], remaining: rm(remaining, t) })),
  }))

  normal.push(mk({
    key: 'toitoi', name: '对对和', han: 2,
    have: tri.length, soft: pair.length, need: 4,
    status: tri.length >= 4 ? 'ACHIEVED' : 'PROGRESSING',
    missing: pair.map((p) => ({ tile: p, need: 1, remaining: rm(remaining, p) })).slice(0, 4),
  }))

  let ssFull = 0
  let ssPart = 0
  let ssRank = -1
  for (let r = 0; r <= 6; r++) {
    const f = [0, 9, 18].filter((b) => runFull(counts, b + r)).length
    const p = [0, 9, 18].filter((b) => !runFull(counts, b + r) && runPart(counts, b + r)).length
    if (f * 1 + p * W > ssFull * 1 + ssPart * W) { ssFull = f; ssPart = p; ssRank = r }
  }
  normal.push(mk({
    key: 'sanshoku', name: '三色同顺', han: menzen ? 2 : 1,
    have: ssFull, soft: ssPart, need: 3,
    status: ssFull >= 3 ? 'ACHIEVED' : 'PROGRESSING',
    missing: ssRank < 0 ? [] : [0, 9, 18]
      .filter((b) => !runFull(counts, b + ssRank))
      .map((b) => ({
        tile: -1, label: seqName(ssRank, b / 9),
        need: 3 - [0, 1, 2].filter((o) => counts[b + ssRank + o] > 0).length, remaining: 0,
      })),
  }))

  let itFull = 0
  let itPart = 0
  let itSuit = 0
  for (const b of [0, 9, 18]) {
    const f = [0, 3, 6].filter((x) => runFull(counts, b + x)).length
    const p = [0, 3, 6].filter((x) => !runFull(counts, b + x) && runPart(counts, b + x)).length
    if (f * 1 + p * W > itFull * 1 + itPart * W) { itFull = f; itPart = p; itSuit = b }
  }
  normal.push(mk({
    key: 'ittsu', name: '一气通贯', han: menzen ? 2 : 1,
    have: itFull, soft: itPart, need: 3,
    status: itFull >= 3 ? 'ACHIEVED' : 'PROGRESSING',
    missing: [0, 3, 6]
      .filter((x) => !runFull(counts, itSuit + x))
      .map((x) => ({
        tile: -1, label: seqName(x, itSuit / 9),
        need: 3 - [0, 1, 2].filter((o) => counts[itSuit + x + o] > 0).length, remaining: 0,
      })),
  }))

  let skFull = 0
  let skPart = 0
  let skRank = -1
  for (let r = 0; r < 9; r++) {
    const f = [0, 9, 18].filter((b) => counts[b + r] >= 3).length
    const p = [0, 9, 18].filter((b) => counts[b + r] === 2).length
    if (f + p * W > skFull + skPart * W) { skFull = f; skPart = p; skRank = r }
  }
  normal.push(mk({
    key: 'sanshokudoukou', name: '三色同刻', han: 2,
    have: skFull, soft: skPart, need: 3, min: 2,
    status: skFull >= 3 ? 'ACHIEVED' : 'PROGRESSING',
    missing: skRank < 0 ? [] : [0, 9, 18]
      .filter((b) => counts[b + skRank] < 3)
      .map((b) => ({ tile: b + skRank, need: 3 - counts[b + skRank], remaining: rm(remaining, b + skRank) })),
  }))

  let peikoFull = 0
  let peikoPart = 0
  for (let i = 0; i < 27; i++) {
    if (i % 9 > 6) continue
    const dbl = [i, i + 1, i + 2].filter((k) => counts[k] >= 2).length
    if (dbl === 3) peikoFull++
    else if (dbl === 2) peikoPart++
  }
  normal.push(mk({
    key: 'ryanpeikou', name: '两杯口', han: 3,
    have: peikoFull, soft: peikoPart, need: 2,
    status: peikoFull >= 2 ? 'ACHIEVED' : 'PROGRESSING',
    note: menzen ? '' : '需门清',
  }))
  normal.push(mk({
    key: 'iipeiko', name: '一杯口', han: 1,
    have: peikoFull, soft: peikoPart, need: 1,
    status: peikoFull >= 1 ? 'ACHIEVED' : 'PROGRESSING',
    note: menzen ? '' : '需门清',
  }))

  const yaoMentsu = tri.filter((t) => isYaochuu(t)).length +
    runs.filter((r) => r % 9 === 0 || r % 9 === 6).length
  const yaoProto = protos.filter((p) => isYaochuu(p.b) || isYaochuu(p.b + p.gap)).length
  const yaoHead = pair.some((p) => isYaochuu(p))
  normal.push(mk({
    key: 'chanta', name: '混全带幺九', han: menzen ? 2 : 1,
    have: yaoMentsu + (yaoHead ? 1 : 0), soft: yaoProto, need: 5,
    status: yaoMentsu + (yaoHead ? 1 : 0) >= 5 ? 'ACHIEVED' : 'PROGRESSING',
    note: yaoProto ? `${yaoProto} 个搭子含幺九` : '',
  }))

  const junMentsu = tri.filter((t) => isTerminal(t)).length +
    runs.filter((r) => r % 9 === 0 || r % 9 === 6).length
  const junProto = protos.filter((p) => isTerminal(p.b) && isTerminal(p.b + p.gap)).length
  const junHead = pair.some((p) => isTerminal(p))
  normal.push(mk({
    key: 'junchan', name: '纯全带幺九', han: menzen ? 3 : 2,
    have: junMentsu + (junHead ? 1 : 0), soft: junProto, need: 5,
    status: honorCount === 0 && junMentsu + (junHead ? 1 : 0) >= 5 ? 'ACHIEVED' : 'PROGRESSING',
    note: honorCount ? '含字牌 → 只能走混全带幺九' : '',
  }))

  normal.push(mk({
    key: 'sanankou', name: '三暗刻', han: 2,
    have: ankou, soft: pair.length, need: 3, min: 2,
    status: ankou >= 3 ? 'ACHIEVED' : 'PROGRESSING',
  }))

  normal.push(mk({
    key: 'shousangen', name: '小三元', han: 2,
    have: dragonTri.length + (dragonPair.length ? 1 : 0),
    soft: Math.max(0, dragonPair.length - 1), need: 3, min: 2,
    status: dragonTri.length >= 2 && dragonPair.length >= 1 ? 'ACHIEVED' : 'PROGRESSING',
    missing: DRAGONS.filter((d) => !dragonTri.includes(d)).map((d) => ({
      tile: d, need: Math.max(1, 3 - counts[d]), remaining: rm(remaining, d),
    })),
  }))

  const yakuhaiList = []
  for (const d of DRAGONS) if (tri.includes(d)) yakuhaiList.push(`役牌 ${HONOR_LABEL[d - 27]}`)
  if (tri.includes(roundWind)) yakuhaiList.push(`场风 ${HONOR_LABEL[roundWind - 27]}`)
  if (tri.includes(seatWind)) yakuhaiList.push(`自风 ${HONOR_LABEL[seatWind - 27]}`)
  const yakuhaiKinds = [...DRAGONS, roundWind, seatWind].filter((t, i, a) => a.indexOf(t) === i)
  const yakuhaiPair = yakuhaiKinds.filter((t) => pair.includes(t))
  normal.push(mk({
    key: 'yakuhai', name: '役牌', han: Math.max(1, yakuhaiList.length),
    have: yakuhaiList.length, soft: yakuhaiPair.length, need: Math.max(1, yakuhaiList.length),
    status: yakuhaiList.length ? 'ACHIEVED' : 'PROGRESSING',
    note: yakuhaiList.join('·') || (yakuhaiPair.length ? `${yakuhaiPair.length} 组役牌对子可碰` : ''),
    missing: yakuhaiList.length ? [] : yakuhaiKinds
      .map((t) => ({ tile: t, need: Math.max(1, 3 - counts[t]), remaining: rm(remaining, t) })),
  }))

  normal.push(mk({
    key: 'chiitoitsu', name: '七对子', han: 2,
    have: pair.length, need: 7,
    status: pair.length >= 7 ? 'ACHIEVED' : 'PROGRESSING',
    note: menzen ? '' : '需门清',
    missing: counts.map((n, i) => ({ tile: i, need: n === 1 ? 1 : 0, remaining: rm(remaining, i) }))
      .filter((m) => m.need > 0).slice(0, 4),
  }))

  normal.push(mk({
    key: 'honroutou', name: '混老头', han: 2,
    have: yaoTotal, need: needTotal, min: 5,
    status: yaoTotal >= needTotal ? 'ACHIEVED' : 'PROGRESSING',
  }))

  const openProto = protos.filter((p) => p.open).length
  const yakuhaiHead = pair.some((p) => isHonor(p) && (DRAGONS.includes(p) || p === seatWind || p === roundWind))
  normal.push(mk({
    key: 'pinfu', name: '平和', han: 1,
    have: runs.length, soft: openProto, need: 4,
    status: menzen && runs.length >= 4 && !yakuhaiHead ? 'ACHIEVED' : 'PROGRESSING',
    note: menzen ? (yakuhaiHead ? '雀头是役牌 → 无平和' : '') : '需门清',
  }))

  normal.push(mk({
    key: 'riichi', name: '立直', han: 1, always: true,
    have: riichi ? 1 : 0, need: 1,
    status: riichi ? 'ACHIEVED' : 'PROGRESSING',
    note: riichi ? '已宣言' : menzen ? '听牌且门清可宣言' : '需门清',
  }))
  normal.push(mk({
    key: 'menzenTsumo', name: '门前清自摸和', han: 1,
    have: menzen ? 1 : 0, need: 1,
    status: menzen ? 'ACHIEVED' : 'PROGRESSING',
    note: menzen ? '门清自摸即得' : '需门清',
  }))

  const sortFn = (a, b) => {
    if (a.status !== b.status) return a.status === 'ACHIEVED' ? -1 : 1
    if (b.score !== a.score) return b.score - a.score
    const sa = a.missing.reduce((x, m) => x + (m.remaining || 0) * m.need, 0)
    const sb = b.missing.reduce((x, m) => x + (m.remaining || 0) * m.need, 0)
    return sa - sb
  }
  const filterAlive = (arr) => arr.filter((x) =>
    x.always || x.status === 'ACHIEVED' || x.have + x.soft >= x.min)
  return {
    yakuman: filterAlive(yakuman).sort(sortFn),
    normal: filterAlive(normal).sort(sortFn),
  }
}

/** 进度条目文本：役名（番）→ 进度 n/m → 缺：白×1（剩2） */
export const progressLine = (p) => {
  const miss = p.missing.slice(0, 4).map((m) => {
    const label = m.tile >= 0 ? tileText(m.tile) : m.label
    const r = m.remaining ? `（剩${m.remaining}）` : ''
    return `${label}×${m.need}${r}`
  }).join(' ')
  return { title: `${p.name}（${p.han}番）`, progress: `${p.have}/${p.need}`, missing: miss }
}
