import { TRUMP_GROUP, cardPoints, isJoker, sortHand } from './cards.js'
import { analyzePlay } from './meld.js'
import { buildFollow, cardsInGroup, canBeatCurrent } from './follow.js'
import { bestPlaySoFar, declareOptions, TEAM_OF_SEAT, trickPointsOnTable } from './game.js'

/** 一手牌的主牌强度：用于亮主与出牌权重 */
const groupStrength = (hand, suit, level, rule) => {
  const inSuit = hand.filter((card) => card.joker === 0 && card.suit === suit)
  const levelCards = hand.filter((card) => card.rank === level).length
  const jokers = hand.filter((card) => isJoker(card)).length
  return inSuit.length + levelCards * 2 + jokers * 2 + (suit === rule.trumpSuit ? 3 : 0)
}

/**
 * 亮主 / 反主决策。
 * 单张级牌阶段：本门够厚才抢；反主阶段：有对子就反；王对阶段：反无主。
 */
export const aiDeclare = (state, seat) => {
  const options = declareOptions(state, seat)
  if (!options.canDeclare) {
    return null
  }
  if (options.stage === 3) {
    // 王对反无主是"我手里主够厚"才玩的牌，不是见到对子就反
    const jokers = state.hands[seat].filter((card) => isJoker(card)).length
    const trumps = cardsInGroup(state.hands[seat], TRUMP_GROUP, state.rule).length
    if (jokers >= 3 || trumps >= 10) {
      return { jokers: true, suit: -1 }
    }
    return null
  }
  let bestSuit = -1
  let bestScore = -1
  options.suits.forEach((suit) => {
    const score = groupStrength(state.hands[seat], suit, state.level, state.rule)
    if (score > bestScore) {
      bestScore = score
      bestSuit = suit
    }
  })
  if (bestSuit < 0) {
    return null
  }
  const threshold = options.stage === 1 ? 7 : 8
  if (bestScore < threshold) {
    return null
  }
  return { jokers: false, suit: bestSuit }
}

/** 埋底：优先扣掉没有分、张数少、且不是主牌的散牌 */
export const aiBury = (state) => {
  const hand = state.hands[state.dealer]
  const rule = state.rule
  const scored = hand.map((card) => {
    const isTrumpCard = rule.groupOf(card) === TRUMP_GROUP
    const weight = (isTrumpCard ? 1000 : 0) + cardPoints(card) * 20 + rule.tierOf(card)
    return { card, weight }
  })
  scored.sort((left, right) => left.weight - right.weight)
  return scored.slice(0, 8).map((entry) => entry.card)
}

/** 首出：主牌够多先清主，否则从最长副牌门里甩最小的单张 */
const chooseLead = (state, seat) => {
  const hand = state.hands[seat]
  const rule = state.rule
  const trumps = cardsInGroup(hand, TRUMP_GROUP, rule)
  const sortedTrumps = sortHand(trumps, rule)

  if (trumps.length >= 9 && sortedTrumps.length > 0) {
    return [sortedTrumps[sortedTrumps.length - 1]]
  }

  const suits = [0, 1, 2, 3]
    .map((suit) => ({ suit, cards: cardsInGroup(hand, suit, rule) }))
    .filter((entry) => entry.cards.length > 0)
    .sort((left, right) => right.cards.length - left.cards.length)

  if (suits.length === 0) {
    return sortedTrumps.length > 0 ? [sortedTrumps[sortedTrumps.length - 1]] : [hand[0]]
  }
  const target = suits[0].cards
  const sorted = sortHand(target, rule)
  const lowest = sorted[sorted.length - 1]
  // 该门只剩对子结构时，索性把最小的对子打出去
  const twin = sorted.filter((card) => card.suit === lowest.suit && card.rank === lowest.rank)
  if (sorted.length >= 4 && twin.length >= 2) {
    return twin.slice(0, 2)
  }
  return [lowest]
}

/** 跟牌：能压就压（有分或最后一手），否则垫最小的牌 */
const chooseFollow = (state, seat) => {
  const hand = state.hands[seat]
  const rule = state.rule
  const lead = state.trickPlays[0].play
  const best = bestPlaySoFar(state)
  const points = trickPointsOnTable(state)
  const isLast = state.trickPlays.length === 3
  const partnerWinning = best ? TEAM_OF_SEAT[best.seat] === TEAM_OF_SEAT[seat] : false

  if (!partnerWinning && best) {
    const attempt = buildFollow(hand, lead, rule, { high: true, avoidPoints: false, trump: true })
    const analysis = analyzePlay(attempt, rule)
    const worthWinning = points >= 5 || isLast
    if (analysis && worthWinning && canBeatCurrent(analysis, best.play, best.leadGroup)) {
      return attempt
    }
  }

  const dump = buildFollow(hand, lead, rule, {
    high: false,
    avoidPoints: !partnerWinning,
    trump: false,
  })
  return dump
}

export const aiPlay = (state, seat) => {
  if (state.trickPlays.length === 0) {
    return chooseLead(state, seat)
  }
  return chooseFollow(state, seat)
}
