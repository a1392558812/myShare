import {
  CARDS_PER_SEAT,
  KITTY_SIZE,
  TOTAL_POINTS,
  TRUMP_GROUP,
  cardsPoints,
  createDeck,
  createRule,
  sortHand,
  levelLabel,
} from './cards.js'
import { createRandom, shuffle } from './rng.js'
import { analyzePlay, playPoints, resolveWinnerIndex } from './meld.js'
import { canBeatCurrent, resolveThrow, validateFollow } from './follow.js'
import { auditDeck, riggedDeal } from './debug.js'

export const SEAT_LABELS = ['你', '右家', '对家', '左家']
export const TEAM_OF_SEAT = [0, 1, 0, 1]
export const TEAM_LABELS = ['你与对家', '右家与左家']
/** 闲家上台门槛：两副牌 200 分的一半 */
export const UPGRADE_THRESHOLD = 80

export const createGameState = (options = {}) => {
  const seed = options.seed || Math.floor(Math.random() * 2147483647)
  const random = createRandom(seed)
  const state = {
    seed,
    random,
    phase: 'idle',
    roundIndex: 0,
    /** 双方等级（rank 值，2..14） */
    teamLevels: [2, 2],
    /** 第一局亮主后确定，之后由轮庄规则确定 */
    dealer: -1,
    level: 2,
    trumpSuit: -1,
    rule: createRule(2, -1),
    hands: [[], [], [], []],
    kitty: [],
    buried: [],
    declare: null,
    turn: 0,
    leader: 0,
    trickPlays: [],
    history: [],
    playedTricks: 0,
    teamPoints: [0, 0],
    lastTrick: null,
    result: null,
    matchWinner: -1,
    /** 调试：下一局发牌安排 [{ seat, key }]，发完即清空 */
    nextDealRig: [],
    /** 调试：上一局实际生效的发牌安排 */
    lastRig: [],
  }
  return state
}

export const dealerTeam = (state) => TEAM_OF_SEAT[state.dealer]

/** 普通发牌：前 8 张扣底，剩下 100 张轮流发 */
const dealPlain = (state, deck) => {
  state.kitty = deck.slice(0, KITTY_SIZE)
  const rest = deck.slice(KITTY_SIZE)
  state.hands = [[], [], [], []]
  rest.forEach((card, index) => {
    state.hands[index % 4].push(card)
  })
}

/** 本局开始：定级别、洗牌发牌，进入亮主阶段 */
export const startRound = (state) => {
  state.roundIndex += 1
  state.teamPoints = [0, 0]
  state.trickPlays = []
  state.history = []
  state.playedTricks = 0
  state.lastTrick = null
  state.result = null
  state.buried = []
  state.trumpSuit = -1
  state.level = state.dealer < 0 ? 2 : state.teamLevels[dealerTeam(state)]
  state.rule = createRule(state.level, state.trumpSuit)

  const deck = shuffle(createDeck(), state.random)
  const rig = Array.isArray(state.nextDealRig) ? state.nextDealRig.slice() : []
  state.nextDealRig = []
  state.lastRig = []
  if (rig.length) {
    const attempt = riggedDeal(deck, rig)
    const usable =
      attempt.rest.length === 0 &&
      attempt.kitty.length === KITTY_SIZE &&
      attempt.hands.every((hand) => hand.length === CARDS_PER_SEAT)
    if (usable) {
      state.hands = attempt.hands
      state.kitty = attempt.kitty
      state.lastRig = attempt.applied
    }
  }
  if (!state.lastRig.length) {
    // 安排不成立（牌堆里已经没有这种牌等）就照常发牌，绝不发半套
    dealPlain(state, deck)
  }
  // 兜底体检：发牌后必须还是完整的两副牌，不成立就退回普通发牌
  if (!auditDeck(state).ok) {
    dealPlain(state, deck)
    state.lastRig = []
  }

  const startSeat = state.dealer < 0 ? Math.floor(state.random() * 4) : state.dealer
  state.declare = {
    stage: 1,
    cursor: 0,
    order: [0, 1, 2, 3].map((offset) => (startSeat + offset) % 4),
    best: null,
    log: [],
  }
  state.phase = 'declare'
  state.turn = startSeat
}

export const currentDeclareSeat = (state) => {
  if (!state.declare) {
    return -1
  }
  return state.declare.order[state.declare.cursor] ?? -1
}

/** 某一座位在当前阶段能用的亮主/反主手段 */
export const declareOptions = (state, seat) => {
  const empty = { canDeclare: false, suits: [], jokers: false, stage: 0 }
  if (!state.declare) {
    return empty
  }
  const hand = state.hands[seat]
  const { stage, best } = state.declare
  if (stage === 1) {
    if (best) {
      return { ...empty, stage, canDeclare: false }
    }
    const suits = [0, 1, 2, 3].filter((suit) => {
      return hand.some((card) => card.joker === 0 && card.rank === state.level && card.suit === suit)
    })
    return { canDeclare: suits.length > 0, suits, jokers: false, stage }
  }
  if (stage === 2) {
    const suits = [0, 1, 2, 3].filter((suit) => {
      const matches = hand.filter((card) => card.joker === 0 && card.rank === state.level && card.suit === suit)
      return matches.length >= 2
    })
    return { canDeclare: suits.length > 0, suits, jokers: false, stage }
  }
  // stage 3：一对王 → 反无主
  const jokers = countJokerPair(hand) > 0
  return { canDeclare: jokers, suits: [], jokers, stage }
}

/** 一对王才能反无主：必须两张同级（小小 / 大大），大小王各一张不成对 */
const countJokerPair = (hand) => {
  const bigs = hand.filter((card) => card.joker === 2).length
  const smalls = hand.filter((card) => card.joker === 1).length
  return bigs >= 2 || smalls >= 2 ? 1 : 0
}

/**
 * 亮主 / 反主生效。
 * stage 1 单张级牌 → 定主花色；stage 2 一对同花色级牌 → 反主；stage 3 一对王 → 无主。
 * 每个阶段一旦有人成功即结束，进入下一阶段（同级不能互相反）。
 */
export const applyDeclare = (state, seat, choice) => {
  const declare = state.declare
  if (!declare) {
    return { ok: false, reason: '当前不在亮主阶段' }
  }
  const stage = declare.stage
  const options = declareOptions(state, seat)
  if (!options.canDeclare) {
    return { ok: false, reason: '没有可用的亮主牌' }
  }
  if (stage === 3) {
    state.trumpSuit = -1
  } else {
    if (!options.suits.includes(choice.suit)) {
      return { ok: false, reason: '该花色没有对应的级牌' }
    }
    state.trumpSuit = choice.suit
  }
  declare.best = { seat, suit: state.trumpSuit, stage }
  declare.log.push({ seat, stage, suit: state.trumpSuit })
  state.rule = createRule(state.level, state.trumpSuit)
  if (stage === 1 && state.dealer < 0) {
    state.dealer = seat
  }
  advanceDeclareStage(state)
  return { ok: true, reason: '' }
}

export const passDeclare = (state) => {
  if (!state.declare) {
    return
  }
  state.declare.cursor += 1
  if (state.declare.cursor >= state.declare.order.length) {
    advanceDeclareStage(state)
  }
}

/** 阶段内顺位走完或有人成功 → 下一阶段 */
const advanceDeclareStage = (state) => {
  const declare = state.declare
  const nextStage = declare.stage + 1
  declare.cursor = 0
  declare.stage = nextStage
  if (nextStage > 3) {
    declare.stage = 4
    return
  }
  // 没人定主时反主无意义；已经是无主则再没有更高的反主手段
  if (nextStage >= 2 && !declare.best) {
    declare.stage = 4
    return
  }
  if (nextStage >= 3 && declare.best && declare.best.suit < 0) {
    declare.stage = 4
    return
  }
  declare.order = [0, 1, 2, 3].map((offset) => (declare.order[0] + offset) % 4)
}

export const isDeclareFinished = (state) => {
  return !state.declare || state.declare.stage >= 4
}

/** 亮主阶段收尾：无人亮主则翻底定主 */
export const finishDeclare = (state) => {
  const declare = state.declare
  if (!declare.best) {
    const levelCard = state.kitty.find((card) => card.joker === 0 && card.rank === state.level)
    state.trumpSuit = levelCard ? levelCard.suit : -1
    state.rule = createRule(state.level, state.trumpSuit)
    if (state.dealer < 0) {
      state.dealer = Math.floor(state.random() * 4)
    }
    declare.log.push({ seat: -1, stage: 0, suit: state.trumpSuit })
  }
  if (state.dealer < 0) {
    state.dealer = 0
  }
  state.hands[state.dealer] = state.hands[state.dealer].concat(state.kitty)
  state.phase = 'bury'
  state.turn = state.dealer
}

/** 庄家埋底：从 33 张里扣 8 张 */
export const applyBury = (state, cards) => {
  if (state.phase !== 'bury') {
    return { ok: false, reason: '当前不是埋底阶段' }
  }
  if (cards.length !== KITTY_SIZE) {
    return { ok: false, reason: `必须扣 ${KITTY_SIZE} 张` }
  }
  const hand = state.hands[state.dealer]
  const handIds = new Set(hand.map((card) => card.id))
  const seen = new Set()
  for (let index = 0; index < cards.length; index++) {
    const card = cards[index]
    if (!handIds.has(card.id) || seen.has(card.id)) {
      return { ok: false, reason: '牌不在手中' }
    }
    seen.add(card.id)
  }
  const buriedIds = new Set(cards.map((card) => card.id))
  state.hands[state.dealer] = hand.filter((card) => !buriedIds.has(card.id))
  state.kitty = cards.slice()
  state.buried = cards.slice()
  state.phase = 'play'
  state.leader = state.dealer
  state.turn = state.dealer
  state.trickPlays = []
  return { ok: true, reason: '' }
}

export const currentLead = (state) => {
  if (state.trickPlays.length === 0) {
    return null
  }
  return state.trickPlays[0].play
}

/**
 * 出牌。首家可出同门任意组合（甩牌超范围会被降级为最小一组），
 * 跟家按跟牌规则校验。
 */
export const applyPlay = (state, seat, cards) => {
  if (state.phase !== 'play') {
    return { ok: false, reason: '当前不是出牌阶段' }
  }
  if (state.turn !== seat) {
    return { ok: false, reason: '还没轮到你' }
  }
  if (!cards || cards.length === 0) {
    return { ok: false, reason: '请先选牌' }
  }
  const hand = state.hands[seat]
  const handIds = new Set(hand.map((card) => card.id))
  const seen = new Set()
  for (let index = 0; index < cards.length; index++) {
    const card = cards[index]
    if (!handIds.has(card.id) || seen.has(card.id)) {
      return { ok: false, reason: '牌不在手中' }
    }
    seen.add(card.id)
  }

  const lead = currentLead(state)
  let selected = cards.slice()
  let reduced = null
  if (!lead) {
    const analysis = analyzePlay(selected, state.rule)
    if (!analysis || analysis.group === null) {
      return { ok: false, reason: '首出必须是同一门牌（主牌算一门）' }
    }
    if (analysis.kind === 'mixed') {
      const otherHands = state.hands.filter((_, index) => index !== seat)
      const outcome = resolveThrow(selected, state.rule, otherHands)
      if (outcome.reduced) {
        selected = outcome.cards.slice()
        reduced = outcome
      }
    }
  } else {
    const validation = validateFollow(hand, lead, selected, state.rule)
    if (!validation.ok) {
      return { ok: false, reason: validation.reason }
    }
  }

  const play = analyzePlay(selected, state.rule)
  if (!play) {
    return { ok: false, reason: '牌型不合法' }
  }
  const playIds = new Set(selected.map((card) => card.id))
  state.hands[seat] = hand.filter((card) => !playIds.has(card.id))
  state.trickPlays.push({ seat, play })
  state.turn = (seat + 1) % 4
  return { ok: true, reason: '', play, reduced }
}

export const isTrickComplete = (state) => state.trickPlays.length === 4

/** 结算当前一墩；返回本墩信息（含抠底） */
export const resolveTrick = (state) => {
  const plays = state.trickPlays
  const leadGroup = plays[0].play.group
  const winnerIndex = resolveWinnerIndex(plays, leadGroup)
  const winnerSeat = plays[winnerIndex].seat
  const winnerPlay = plays[winnerIndex].play
  const allCards = plays.flatMap((entry) => entry.play.cards)
  const points = cardsPoints(allCards)
  const isLast = state.hands.every((hand) => hand.length === 0)
  const winnerTeam = TEAM_OF_SEAT[winnerSeat]
  let kittyPoints = 0
  let multiplier = 1
  if (isLast && winnerTeam !== dealerTeam(state)) {
    kittyPoints = cardsPoints(state.kitty)
    multiplier = Math.pow(2, winnerPlay.pairs + 1)
  }
  const gained = points + kittyPoints * multiplier
  state.teamPoints[winnerTeam] += gained
  state.playedTricks += 1
  const record = {
    index: state.playedTricks,
    plays: plays.slice(),
    winnerSeat,
    winnerTeam,
    points,
    kittyPoints,
    multiplier,
    gained,
    isLast,
    leadGroup,
  }
  state.history.push(record)
  state.lastTrick = record
  state.trickPlays = []
  state.leader = winnerSeat
  state.turn = winnerSeat
  return record
}

/** 牌出完即结束（甩牌会让一局不足 25 墩） */
export const isRoundOver = (state) => state.hands.every((hand) => hand.length === 0)

/** 升级级数表（两副牌 200 分制，80 分上台） */
export const upgradeSteps = (gained) => {
  if (gained === 0) {
    return { levels: 3, swap: false, title: '大光' }
  }
  if (gained < 40) {
    return { levels: 2, swap: false, title: '小光' }
  }
  if (gained < UPGRADE_THRESHOLD) {
    return { levels: 1, swap: false, title: '保级升级' }
  }
  if (gained < 120) {
    return { levels: 0, swap: true, title: '闲家上台' }
  }
  if (gained < 160) {
    return { levels: 1, swap: true, title: '闲家上台' }
  }
  if (gained < 200) {
    return { levels: 2, swap: true, title: '闲家上台' }
  }
  return { levels: 3, swap: true, title: '闲家上台' }
}

/**
 * 一局结算：定升级级数、轮庄、过 A 通关。
 * 打 A 时保级（闲家不足 80 分）即通关；跳级不跳过 A，最高停在 A。
 */
export const settleRound = (state) => {
  const currentDealer = state.dealer
  const owner = dealerTeam(state)
  const defender = 1 - owner
  const gained = state.teamPoints[defender]
  const step = upgradeSteps(gained)
  const playingAce = state.teamLevels[owner] >= 14
  const levelsBefore = [state.teamLevels[0], state.teamLevels[1]]
  let winner = -1
  let levelsAfter = [state.teamLevels[0], state.teamLevels[1]]
  let nextDealer = currentDealer

  if (!step.swap) {
    if (playingAce) {
      winner = owner
    } else {
      levelsAfter[owner] = Math.min(14, state.teamLevels[owner] + step.levels)
      nextDealer = (currentDealer + 2) % 4
    }
  } else {
    levelsAfter[defender] = Math.min(14, state.teamLevels[defender] + step.levels)
    nextDealer = (currentDealer + 1) % 4
  }

  state.teamLevels = levelsAfter
  state.result = {
    gained: gained,
    threshold: UPGRADE_THRESHOLD,
    defender,
    owner,
    step,
    playingAce,
    winner,
    levelsBefore,
    levelsAfter,
    nextDealer,
  }
  if (winner >= 0) {
    state.matchWinner = winner
    state.phase = 'over'
  } else {
    state.dealer = nextDealer
    state.phase = 'settle'
  }
  return state.result
}

/** 进入下一局 */
export const nextRound = (state) => {
  if (state.matchWinner >= 0) {
    return
  }
  startRound(state)
}

export const handOf = (state, seat) => sortHand(state.hands[seat], state.rule)

export const playerHand = (state) => handOf(state, 0)

export const levelText = (state) => `打 ${levelLabel(state.level)}`

export const trumpText = (state) => {
  if (state.trumpSuit < 0) {
    return '无主'
  }
  return ['黑桃', '红桃', '梅花', '方片'][state.trumpSuit]
}

/** 供 AI 与调试使用：本墩当前最大的一手 */
export const bestPlaySoFar = (state) => {
  const plays = state.trickPlays
  if (plays.length === 0) {
    return null
  }
  const leadGroup = plays[0].play.group
  const winnerIndex = resolveWinnerIndex(plays, leadGroup)
  return { seat: plays[winnerIndex].seat, play: plays[winnerIndex].play, leadGroup }
}

export const trickPointsOnTable = (state) => {
  return state.trickPlays.reduce((total, entry) => total + playPoints(entry.play.cards), 0)
}

export { canBeatCurrent, playPoints, TRUMP_GROUP }
