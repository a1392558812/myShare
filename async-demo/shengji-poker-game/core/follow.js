import { TRUMP_GROUP, cardKey, cardPoints } from './cards.js'
import { analyzePlay, beatsPlay } from './meld.js'

/** 手牌中属于某一门的牌（主牌算一门） */
export const cardsInGroup = (hand, group, rule) => hand.filter((card) => rule.groupOf(card) === group)

/** 按"同花色同点数"分桶，只保留能成对的桶 */
export const bucketPairs = (cards, rule) => {
  const buckets = new Map()
  cards.forEach((card) => {
    const key = cardKey(card)
    if (!buckets.has(key)) {
      buckets.set(key, [])
    }
    buckets.get(key).push(card)
  })
  const pairs = []
  buckets.forEach((list) => {
    const pairCount = Math.floor(list.length / 2)
    for (let index = 0; index < pairCount; index++) {
      pairs.push({ tier: rule.tierOf(list[0]), cards: [list[index * 2], list[index * 2 + 1]] })
    }
  })
  return pairs
}

export const countPairs = (cards, rule) => bucketPairs(cards, rule).length

const sortForPlay = (cards, rule, options) => {
  const sorted = cards.slice()
  sorted.sort((left, right) => {
    if (options.avoidPoints) {
      const leftPoint = cardPoints(left) > 0 ? 1 : 0
      const rightPoint = cardPoints(right) > 0 ? 1 : 0
      if (leftPoint !== rightPoint) {
        return leftPoint - rightPoint
      }
    }
    const tierDiff = options.high ? rule.tierOf(right) - rule.tierOf(left) : rule.tierOf(left) - rule.tierOf(right)
    if (tierDiff !== 0) {
      return tierDiff
    }
    return cardPoints(left) - cardPoints(right)
  })
  return sorted
}

/**
 * 从一手同门牌里挑出 count 张，保证至少 min(needPairs, 可用对子) 个对子。
 * high = true 时优先拿大的（用来压人），false 时优先甩小的（跟牌垫牌）。
 */
const composeFrom = (pool, count, needPairs, rule, options) => {
  if (count <= 0) {
    return []
  }
  const pairs = bucketPairs(pool, rule)
  const usablePairs = Math.min(needPairs, pairs.length, Math.floor(count / 2))
  const orderedPairs = pairs.slice().sort((left, right) => {
    return options.high ? right.tier - left.tier : left.tier - right.tier
  })
  const picked = []
  orderedPairs.slice(0, usablePairs).forEach((pair) => {
    picked.push(pair.cards[0], pair.cards[1])
  })
  const pickedIds = new Set(picked.map((card) => card.id))
  const restPool = pool.filter((card) => !pickedIds.has(card.id))
  const orderedRest = sortForPlay(restPool, rule, options)
  const shortfall = count - picked.length
  return picked.concat(orderedRest.slice(0, shortfall))
}

/**
 * 构造一手合法的跟牌（不保证能赢，只保证规则合法）。
 * options: { high, avoidPoints, trump } —— trump 表示缺门时尝试用主牌毙。
 */
export const buildFollow = (hand, lead, rule, options = {}) => {
  const settings = { high: false, avoidPoints: true, trump: false, ...options }
  const group = lead.group
  const size = lead.size
  const mine = cardsInGroup(hand, group, rule)

  if (mine.length >= size) {
    return composeFrom(mine, size, lead.pairs, rule, settings)
  }

  // 本门不够：必须把本门全部打出，再用其他门补足
  const chosen = mine.slice()
  const shortfall = size - chosen.length
  if (shortfall <= 0) {
    return chosen
  }
  const pool = hand.filter((card) => rule.groupOf(card) !== group)
  const trumps = pool.filter((card) => rule.groupOf(card) === TRUMP_GROUP)
  const others = pool.filter((card) => rule.groupOf(card) !== TRUMP_GROUP)

  // 想毙牌：主牌数量够，就按对子要求从主牌里挑大的
  if (settings.trump && group !== TRUMP_GROUP && trumps.length >= shortfall) {
    return chosen.concat(composeFrom(trumps, shortfall, lead.pairs, rule, { high: true, avoidPoints: false }))
  }
  if (others.length >= shortfall) {
    return chosen.concat(composeFrom(others, shortfall, 0, rule, { high: false, avoidPoints: settings.avoidPoints }))
  }
  const fallback = composeFrom(others, others.length, 0, rule, { high: false, avoidPoints: settings.avoidPoints })
  return chosen.concat(fallback, composeFrom(trumps, shortfall - fallback.length, 0, rule, { high: false, avoidPoints: settings.avoidPoints }))
}

/**
 * 跟牌合法性校验。
 * 返回 { ok, reason }；不合法时 reason 直接用于界面提示。
 */
export const validateFollow = (hand, lead, cards, rule) => {
  if (!cards || cards.length !== lead.size) {
    return { ok: false, reason: `必须出 ${lead.size} 张牌` }
  }
  const handIds = new Set(hand.map((card) => card.id))
  const duplicated = new Set()
  for (let index = 0; index < cards.length; index++) {
    const card = cards[index]
    if (!handIds.has(card.id) || duplicated.has(card.id)) {
      return { ok: false, reason: '牌不在手中' }
    }
    duplicated.add(card.id)
  }
  const play = analyzePlay(cards, rule)
  if (!play) {
    return { ok: false, reason: '跟牌必须是同一门（花色或主牌）' }
  }
  const group = lead.group
  const mine = cardsInGroup(hand, group, rule)

  if (mine.length >= lead.size) {
    if (play.group !== group) {
      return { ok: false, reason: `必须先跟${groupLabel(group, rule)}` }
    }
    const required = Math.min(lead.pairs, countPairs(mine, rule))
    if (play.pairs < required) {
      return { ok: false, reason: `有对子必须跟对子（需 ${required} 对）` }
    }
    return { ok: true, reason: '' }
  }

  // 本门不足：本门的牌必须全部打出
  const playedGroup = cards.filter((card) => rule.groupOf(card) === group)
  if (playedGroup.length !== mine.length) {
    return { ok: false, reason: `本门只剩 ${mine.length} 张，必须全部打出` }
  }
  return { ok: true, reason: '' }
}

export const groupLabel = (group, rule) => {
  if (group === TRUMP_GROUP) {
    return '主牌'
  }
  return ['黑桃', '红桃', '梅花', '方片'][group] || '该花色'
}

/**
 * 甩牌校验：其他任意一家只要在同一门里存在能压过某一组（单张 / 对子）的牌，
 * 这次甩牌就不成立，只能打出其中最小的一组。
 * 返回 { cards, reduced, blockedSeat, blockedLabel }
 */
export const resolveThrow = (cards, rule, otherHands) => {
  const play = analyzePlay(cards, rule)
  if (!play || play.size <= 1) {
    return { cards, reduced: false }
  }
  if (play.kind === 'pair' || play.kind === 'tractor') {
    return { cards, reduced: false }
  }
  const buckets = new Map()
  cards.forEach((card) => {
    const key = cardKey(card)
    if (!buckets.has(key)) {
      buckets.set(key, [])
    }
    buckets.get(key).push(card)
  })
  const components = []
  buckets.forEach((list) => {
    const pairCount = Math.floor(list.length / 2)
    let cursor = 0
    for (let index = 0; index < pairCount; index++) {
      components.push({ tier: rule.tierOf(list[cursor]), cards: [list[cursor], list[cursor + 1]], isPair: true })
      cursor += 2
    }
    if (cursor < list.length) {
      components.push({ tier: rule.tierOf(list[cursor]), cards: [list[cursor]], isPair: false })
    }
  })
  components.sort((left, right) => left.tier - right.tier)

  for (let index = 0; index < components.length; index++) {
    const component = components[index]
    for (let seat = 0; seat < otherHands.length; seat++) {
      const candidates = otherHands[seat].filter((card) => rule.groupOf(card) === play.group)
      const beating = component.isPair
        ? bucketPairs(candidates, rule).some((pair) => pair.tier > component.tier)
        : candidates.some((card) => rule.tierOf(card) > component.tier)
      if (beating) {
        const smallest = components[0]
        return {
          cards: smallest.cards.slice(),
          reduced: true,
          blockedSeat: seat,
          blockedLabel: component.isPair ? '对子' : '单张',
        }
      }
    }
  }
  return { cards, reduced: false }
}

/** 供"提示"功能使用：列出手中所有可首出的牌型（限量，避免长套爆炸） */
export const listLeadOptions = (hand, rule, limit = 60) => {
  const options = []
  const groups = [TRUMP_GROUP, 0, 1, 2, 3]
  groups.forEach((group) => {
    const cards = cardsInGroup(hand, group, rule)
    if (cards.length === 0) {
      return
    }
    const sorted = sortForPlay(cards, rule, { high: false })
    options.push([sorted[0]])
    const pairs = bucketPairs(cards, rule).sort((left, right) => left.tier - right.tier)
    pairs.forEach((pair) => {
      options.push(pair.cards.slice())
    })
    // 连对：把同门的对子按 tier 连续串起来
    const pairByTier = new Map(pairs.map((pair) => [pair.tier, pair]))
    const tiers = pairs.map((pair) => pair.tier).sort((left, right) => left - right)
    tiers.forEach((startTier) => {
      let cursor = startTier
      const chain = []
      while (pairByTier.has(cursor) && chain.length < 4) {
        chain.push(...pairByTier.get(cursor).cards)
        options.push(chain.slice())
        cursor += 1
      }
    })
  })
  const seen = new Set()
  return options
    .filter((cards) => {
      const key = cards.map((card) => card.id).sort().join(',')
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
    .slice(0, limit)
}

/** 判断一手牌能不能压过当前最大的一手 */
export const canBeatCurrent = (candidate, current, leadGroup) => {
  const play = candidate
  if (!play) {
    return false
  }
  return beatsPlay(play, current, leadGroup)
}
