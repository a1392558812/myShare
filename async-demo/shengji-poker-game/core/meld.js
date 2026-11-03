import { TRUMP_GROUP, cardKey, cardPoints, isJoker } from './cards.js'

/**
 * 一手牌的牌型分析。升级里"首家"可以出同门任意组合，所以这里既做牌型识别，
 * 也做合法性判定：同一门才可能赢墩，跨门的只可能是"垫牌"，group 记为 null。
 *
 * 返回 { cards, group, size, pairs, topTier, pairTiers, kind }
 * group: 'T' 主牌 / 0..3 花色 / null 跨门垫牌
 * kind: single 单张 | pair 对子 | tractor 连对（拖拉机）| mixed 多张混合（甩牌或垫牌）
 */
export const analyzePlay = (cards, rule) => {
  if (!cards || cards.length === 0) {
    return null
  }
  const firstGroup = rule.groupOf(cards[0])
  const sameGroup = cards.every((card) => rule.groupOf(card) === firstGroup)
  const group = sameGroup ? firstGroup : null

  const buckets = new Map()
  cards.forEach((card) => {
    const key = cardKey(card)
    if (!buckets.has(key)) {
      buckets.set(key, [])
    }
    buckets.get(key).push(card)
  })

  const pairTiers = []
  let pairs = 0
  buckets.forEach((list) => {
    const pairCount = Math.floor(list.length / 2)
    for (let index = 0; index < pairCount; index++) {
      pairs += 1
      pairTiers.push(rule.tierOf(list[0]))
    }
  })
  pairTiers.sort((left, right) => left - right)

  const topTier = cards.reduce((best, card) => Math.max(best, rule.tierOf(card)), -1)
  const size = cards.length
  const isAllPairs = pairs * 2 === size
  let consecutive = isAllPairs && pairs >= 2
  if (consecutive) {
    for (let index = 1; index < pairTiers.length; index++) {
      if (pairTiers[index] - pairTiers[index - 1] !== 1) {
        consecutive = false
        break
      }
    }
  }

  let kind = 'mixed'
  if (size === 1) {
    kind = 'single'
  } else if (size === 2 && pairs === 1) {
    kind = 'pair'
  } else if (consecutive) {
    kind = 'tractor'
  }

  return { cards, group, size, pairs, topTier, pairTiers, kind }
}

export const PLAY_LABELS = {
  single: '单张',
  pair: '对子',
  tractor: '连对',
  mixed: '甩牌',
}

/**
 * 牌的强弱序号：主牌 2 > 首家花色 1 > 其他门 0。
 * 跨门垫牌永远压不了人（序号 0）；只有序号相同才比 tier。
 */
export const playPower = (play, leadGroup) => {
  if (play.group === null) {
    return 0
  }
  if (play.group === leadGroup) {
    return 1
  }
  if (leadGroup !== TRUMP_GROUP && play.group === TRUMP_GROUP) {
    return 2
  }
  return 0
}

/** challenger 是否压过 defender（defender 必须是本墩当前最大的一家） */
export const beatsPlay = (challenger, defender, leadGroup) => {
  if (challenger.group === null) {
    return false
  }
  if (challenger.pairs < defender.pairs) {
    return false
  }
  const challengerPower = playPower(challenger, leadGroup)
  const defenderPower = playPower(defender, leadGroup)
  if (challengerPower !== defenderPower) {
    return challengerPower > defenderPower
  }
  return challenger.topTier > defender.topTier
}

/** 本墩最终赢家下标；plays = [{ seat, play }]，第 0 手为首家 */
export const resolveWinnerIndex = (plays, leadGroup) => {
  let bestIndex = 0
  for (let index = 1; index < plays.length; index++) {
    const challenger = plays[index].play
    const defender = plays[bestIndex].play
    if (challenger.group === null) {
      continue
    }
    if (challenger.pairs < plays[0].play.pairs) {
      continue
    }
    if (beatsPlay(challenger, defender, leadGroup)) {
      bestIndex = index
    }
  }
  return bestIndex
}

export const playText = (play) => {
  const label = PLAY_LABELS[play.kind] || '甩牌'
  return `${label} · ${play.size} 张`
}

/** 统计一组同门牌的分数 */
export const playPoints = (cards) => cards.reduce((total, card) => total + cardPoints(card), 0)

/** 一对王（两张同级）才能反无主 */
export const hasJokerPair = (cards) => {
  const jokers = cards.filter((card) => isJoker(card))
  const bigs = jokers.filter((card) => card.joker === 2)
  const smalls = jokers.filter((card) => card.joker === 1)
  if (bigs.length >= 2) {
    return [bigs[0], bigs[1]]
  }
  if (smalls.length >= 2) {
    return [smalls[0], smalls[1]]
  }
  return []
}
