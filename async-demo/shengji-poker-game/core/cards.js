/**
 * 牌与主牌序
 * 两副牌 108 张：4 花色 × 13 点 × 2 + 小王 ×2 + 大王 ×2。
 * 牌对象 { id, suit, rank, joker }：
 *   suit 0♠ 1♥ 2♣ 3♦，joker 牌固定 suit = 4；
 *   rank 2..14（11=J 12=Q 13=K 14=A），joker 用 joker 字段区分大小。
 */

export const SUIT_SYMBOLS = ['♠', '♥', '♣', '♦']
export const SUIT_LABELS = ['黑桃', '红桃', '梅花', '方片']
export const RED_SUITS = [1, 3]
export const JOKER_SUIT = 4
export const JOKER_SMALL = 1
export const JOKER_BIG = 2
export const NO_TRUMP = -1
export const TRUMP_GROUP = 'T'
export const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
export const RANK_LABELS = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
}
/** 分牌面值：5 计 5 分，10 与 K 各计 10 分，两副牌合计 200 分 */
export const POINT_VALUES = { 5: 5, 10: 10, 13: 10 }
export const CARDS_PER_SEAT = 25
export const KITTY_SIZE = 8
export const TOTAL_POINTS = 200

/** 按两副牌生成 108 张，id 唯一 */
export const createDeck = () => {
  const deck = []
  let sequence = 0
  for (let copy = 0; copy < 2; copy++) {
    for (let suit = 0; suit < 4; suit++) {
      RANKS.forEach((rank) => {
        sequence += 1
        deck.push({ id: `c${sequence}`, suit, rank, joker: 0 })
      })
    }
    sequence += 1
    deck.push({ id: `c${sequence}`, suit: JOKER_SUIT, rank: 0, joker: JOKER_SMALL })
    sequence += 1
    deck.push({ id: `c${sequence}`, suit: JOKER_SUIT, rank: 0, joker: JOKER_BIG })
  }
  return deck
}

export const isJoker = (card) => card.joker > 0

/** 同花色同点数才算同一种牌（对子判定用） */
export const cardKey = (card) => {
  if (card.joker === JOKER_BIG) {
    return 'BJ'
  }
  if (card.joker === JOKER_SMALL) {
    return 'SJ'
  }
  return `${card.suit}-${card.rank}`
}

export const cardPoints = (card) => {
  if (isJoker(card)) {
    return 0
  }
  return POINT_VALUES[card.rank] || 0
}

export const cardsPoints = (cards) => cards.reduce((total, card) => total + cardPoints(card), 0)

export const cardLabel = (card) => {
  if (card.joker === JOKER_BIG) {
    return '大王'
  }
  if (card.joker === JOKER_SMALL) {
    return '小王'
  }
  return `${SUIT_SYMBOLS[card.suit]}${RANK_LABELS[card.rank]}`
}

/**
 * 生成本副牌的规则上下文：级牌等级 + 主花色。
 * 主牌内部大小用 tier 表示，同一 tier 内互不压制；tier 相邻即构成连对（拖拉机）。
 *
 * tier 布局（level = L，主花色 = S）：
 *   0 .. 11  主花色除级牌外的牌，按 2→A 升序（级牌被抽走后 9 与 J 相邻）
 *   12       副级牌（另三门的级牌，等大）
 *   13       主级牌（主花色的级牌）
 *   14       小王
 *   15       大王
 * 无主时：级牌四门等大取 12，小王 13，大王 14。
 */
export const createRule = (level, trumpSuit) => {
  const rankSequence = RANKS.filter((rank) => rank !== level)
  const rankIndex = new Map(rankSequence.map((rank, index) => [rank, index]))
  const baseTier = rankSequence.length
  const isNoTrump = trumpSuit < 0

  const isTrump = (card) => {
    if (isJoker(card)) {
      return true
    }
    if (card.rank === level) {
      return true
    }
    return !isNoTrump && card.suit === trumpSuit
  }

  const groupOf = (card) => {
    if (isTrump(card)) {
      return TRUMP_GROUP
    }
    return card.suit
  }

  const tierOf = (card) => {
    if (card.joker === JOKER_BIG) {
      return baseTier + 3
    }
    if (card.joker === JOKER_SMALL) {
      return baseTier + 2
    }
    if (card.rank === level) {
      if (isNoTrump) {
        return baseTier
      }
      return card.suit === trumpSuit ? baseTier + 1 : baseTier
    }
    return rankIndex.get(card.rank)
  }

  const trumpLabel = isNoTrump ? '无主' : SUIT_LABELS[trumpSuit]

  return { level, trumpSuit, isNoTrump, rankSequence, tierOf, groupOf, isTrump, trumpLabel }
}

/** 手牌排序：主牌在前，其余按花色，组内由大到小 */
export const sortHand = (hand, rule) => {
  const groupOrder = (card) => {
    const group = rule.groupOf(card)
    return group === TRUMP_GROUP ? -1 : group
  }
  return hand
    .slice()
    .sort((left, right) => {
      const orderDiff = groupOrder(left) - groupOrder(right)
      if (orderDiff !== 0) {
        return orderDiff
      }
      const tierDiff = rule.tierOf(right) - rule.tierOf(left)
      if (tierDiff !== 0) {
        return tierDiff
      }
      return left.id < right.id ? -1 : 1
    })
}

/** 级牌 label（打 10 → "打 10"） */
export const levelLabel = (level) => RANK_LABELS[level]
