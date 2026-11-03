/**
 * 调试工具：牌局改造（换牌 / 安排下次发牌）。
 *
 * 铁律：只做「位置置换」，绝不增删牌。
 * - 换牌是 1:1 交换，两副牌的多重集天然不变，手牌张数也不变；
 * - 安排发牌是在洗好的牌堆里把指定牌先挑出来发给某家，剩下的牌照常补齐，
 *   所以还是那 108 张牌的一个排列；
 * - 每次操作后都跑 auditDeck（108 张 / 54 种各 2 张 / id 不重复），不通过就回滚。
 *
 * 区域约定：0..3 = 四家手牌，4 = 底牌。
 */
import { CARDS_PER_SEAT, KITTY_SIZE, RANKS, RANK_LABELS, SUIT_SYMBOLS, cardKey } from './cards.js'

export const DECK_SIZE = 108
/** 两副牌里每种牌正好 2 张 */
export const COPIES_PER_CARD = 2
export const ZONE_KITTY = 4
export const ZONE_LABELS = ['你', '右家', '对家', '左家', '底牌']

/** 标准牌堆的 54 种牌，顺序即界面里的展示顺序 */
export const DECK_KEYS = (() => {
  const keys = []
  for (let suit = 0; suit < 4; suit++) {
    RANKS.forEach((rank) => keys.push(`${suit}-${rank}`))
  }
  keys.push('SJ', 'BJ')
  return keys
})()

export const keyLabel = (key) => {
  if (key === 'BJ') {
    return '大王'
  }
  if (key === 'SJ') {
    return '小王'
  }
  const [suit, rank] = String(key).split('-')
  return `${SUIT_SYMBOLS[Number(suit)]}${RANK_LABELS[Number(rank)]}`
}

export const zoneCards = (state, zone) => {
  if (zone === ZONE_KITTY) {
    return state.kitty
  }
  return state.hands[zone] || []
}

/**
 * 某个区域现在能不能参与换牌。
 * 埋底阶段底牌已经并入庄家手牌（state.kitty 只是同一批牌的引用），
 * 这时拿底牌当独立区域会重复计数，直接禁用。
 */
export const canSwapZone = (state, zone) => {
  if (zone === ZONE_KITTY) {
    return state.phase !== 'bury' && state.kitty.length > 0
  }
  const hand = state.hands[zone]
  return Boolean(hand && hand.length > 0)
}

/**
 * 全区域收牌：四家手牌 + 底牌 + 已打出的墩（含当前这墩）。
 * 埋底阶段底牌在庄家手里，跳过底牌避免重复。
 */
export const collectCards = (state) => {
  const cards = []
  state.hands.forEach((hand) => {
    cards.push(...hand)
  })
  if (state.phase !== 'bury') {
    cards.push(...state.kitty)
  }
  ;(state.history || []).forEach((record) => {
    record.plays.forEach((entry) => {
      cards.push(...entry.play.cards)
    })
  })
  ;(state.trickPlays || []).forEach((entry) => {
    cards.push(...entry.play.cards)
  })
  return cards
}

/** 牌堆体检：张数、每种牌的张数、牌 id 是否重复 */
export const auditDeck = (state) => {
  const cards = collectCards(state)
  const keyCounts = new Map()
  const idCounts = new Map()
  cards.forEach((card) => {
    const key = cardKey(card)
    keyCounts.set(key, (keyCounts.get(key) || 0) + 1)
    idCounts.set(card.id, (idCounts.get(card.id) || 0) + 1)
  })
  const over = []
  const missing = []
  DECK_KEYS.forEach((key) => {
    const count = keyCounts.get(key) || 0
    if (count > COPIES_PER_CARD) {
      over.push({ key, label: keyLabel(key), count })
    }
    if (count < COPIES_PER_CARD) {
      missing.push({ key, label: keyLabel(key), count })
    }
  })
  const duplicateIds = cards.length - idCounts.size
  return {
    ok: cards.length === DECK_SIZE && over.length === 0 && missing.length === 0 && duplicateIds === 0,
    total: cards.length,
    expected: DECK_SIZE,
    kinds: keyCounts.size,
    over,
    missing,
    duplicateIds,
  }
}

/**
 * 换牌：把 first 区域的某张牌和 second 区域的某张牌对调。
 * 只换位置，不换张数，所以两副牌的多重集永远不变；万一还是查出异常就回滚。
 */
export const swapCards = (state, first, second) => {
  if (!first || !second) {
    return { ok: false, reason: '请先各选一张牌' }
  }
  if (first.zone === second.zone) {
    return { ok: false, reason: '同一区域内的牌不用换' }
  }
  if (!canSwapZone(state, first.zone) || !canSwapZone(state, second.zone)) {
    return { ok: false, reason: '该区域当前不能换牌' }
  }
  const listA = zoneCards(state, first.zone)
  const listB = zoneCards(state, second.zone)
  const indexA = listA.findIndex((card) => card.id === first.id)
  const indexB = listB.findIndex((card) => card.id === second.id)
  if (indexA < 0 || indexB < 0) {
    return { ok: false, reason: '牌已经不在原位置，请重新选择' }
  }
  const cardA = listA[indexA]
  const cardB = listB[indexB]
  listA[indexA] = cardB
  listB[indexB] = cardA
  syncBuried(state)
  const audit = auditDeck(state)
  if (!audit.ok) {
    listA[indexA] = cardA
    listB[indexB] = cardB
    syncBuried(state)
    return { ok: false, reason: '这次交换会让牌堆不完整，已回滚', audit }
  }
  return { ok: true, reason: '', audit, intoFirst: cardB, intoSecond: cardA }
}

/** 底牌被换过之后，buried 也要跟着指向新的底牌 */
const syncBuried = (state) => {
  if (state.buried && state.buried.length) {
    state.buried = state.kitty.slice()
  }
}

/** 安排是否合法：同一种牌最多 2 张，单家不超过 25 张 */
export const validateRig = (rig) => {
  const keyCounts = new Map()
  const seatCounts = [0, 0, 0, 0]
  rig.forEach((entry) => {
    keyCounts.set(entry.key, (keyCounts.get(entry.key) || 0) + 1)
    if (entry.seat >= 0 && entry.seat < 4) {
      seatCounts[entry.seat] += 1
    }
  })
  const over = []
  keyCounts.forEach((count, key) => {
    if (count > COPIES_PER_CARD) {
      over.push({ key, label: keyLabel(key), count })
    }
  })
  const crowded = seatCounts
    .map((count, seat) => ({ seat, count }))
    .filter((item) => item.count > CARDS_PER_SEAT)
  const invalid = rig.filter((entry) => !(entry.seat >= 0 && entry.seat < 4) || !DECK_KEYS.includes(entry.key))
  return {
    ok: over.length === 0 && crowded.length === 0 && invalid.length === 0,
    over,
    crowded,
    invalid,
  }
}

/**
 * 按安排发牌：从洗好的牌堆里把指定牌挑出来先给某家，剩下的扣底 + 补齐。
 * 挑牌是从牌堆里 splice 出来的，所以不可能多出一张牌；牌堆不够时该条安排自动作废。
 */
export const riggedDeal = (deck, rig) => {
  const pool = deck.slice()
  const hands = [[], [], [], []]
  const applied = []
  rig.forEach((entry) => {
    if (!(entry.seat >= 0 && entry.seat < 4)) {
      return
    }
    if (hands[entry.seat].length >= CARDS_PER_SEAT) {
      return
    }
    const index = pool.findIndex((card) => cardKey(card) === entry.key)
    if (index < 0) {
      return
    }
    hands[entry.seat].push(pool.splice(index, 1)[0])
    applied.push({ seat: entry.seat, key: entry.key })
  })
  const kitty = pool.splice(0, KITTY_SIZE)
  let cursor = 0
  let guard = 0
  while (pool.length > 0 && guard < DECK_SIZE * 2) {
    guard += 1
    const seat = cursor % 4
    cursor += 1
    if (hands[seat].length >= CARDS_PER_SEAT) {
      continue
    }
    hands[seat].push(pool.shift())
  }
  return { hands, kitty, applied, rest: pool }
}
