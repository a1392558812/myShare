import { reactive } from 'vue'
import {
  SEAT_LABELS,
  TEAM_OF_SEAT,
  UPGRADE_THRESHOLD,
  applyBury,
  applyDeclare,
  applyPlay,
  createGameState,
  currentDeclareSeat,
  declareOptions,
  finishDeclare,
  isDeclareFinished,
  isRoundOver,
  isTrickComplete,
  nextRound,
  passDeclare,
  resolveTrick,
  settleRound,
  startRound,
} from '../core/game.js'
import { aiBury, aiDeclare, aiPlay } from '../core/ai.js'
import {
  CARDS_PER_SEAT,
  JOKER_BIG,
  RANK_LABELS,
  RED_SUITS,
  cardKey,
  cardLabel,
  levelLabel,
  sortHand,
} from '../core/cards.js'
import { createTableRenderer } from '../draw/renderer.js'
import { buildFollow } from '../core/follow.js'
import {
  COPIES_PER_CARD,
  ZONE_KITTY,
  auditDeck,
  canSwapZone,
  keyLabel,
  swapCards,
  validateRig,
} from '../core/debug.js'

const DECLARE_TEXT = [
  '',
  '亮主：用一张级牌定主花色（先亮者坐庄）',
  '反主：一对同花色级牌可以反掉当前主牌',
  '反无主：一对大王或一对小王可以反成无主',
]

/** 出牌区展示顺序：大的在前，方便看清牌型 */
const orderForTable = (cards, rule) => {
  return cards.slice().sort((left, right) => rule.tierOf(right) - rule.tierOf(left))
}

/**
 * 升级对局桥接层：状态机在 core，界面只读取 ui 镜像。
 * @param {import('vue').Ref<HTMLCanvasElement|null>} canvasRef 牌桌 canvas
 */
export const useShengji = (canvasRef) => {
  const state = createGameState()
  let renderer = null
  let timer = null
  let disposed = false

  const ui = reactive({
    phase: 'idle',
    levelLabel: '2',
    levelValue: 2,
    roundIndex: 0,
    trumpSuit: -1,
    dealer: -1,
    seatLabels: SEAT_LABELS,
    teamLevels: [2, 2],
    hand: [],
    handCounts: [0, 0, 0, 0],
    selectedIds: [],
    hoverIndex: -1,
    trick: [],
    trickWinner: -1,
    points: 0,
    target: UPGRADE_THRESHOLD,
    trickIndex: 0,
    message: '',
    dimHand: false,
    declare: null,
    buryRemain: 0,
    awaitingPlay: false,
    thinking: '',
    result: null,
    matchWinner: -1,
    autoPlay: false,
    fast: false,
    reveal: false,
    log: [],
    /** 调试面板的镜像：四家手牌 / 底牌 / 牌堆体检 / 下局发牌安排 */
    debug: {
      zones: [],
      audit: { ok: true, total: 108, expected: 108, kinds: 54, over: [], missing: [], duplicateIds: 0 },
      rig: [],
      note: '',
    },
  })

  /** 快进模式下把动画等待压缩 8 倍，方便调试与自动验收 */
  const pace = (delay) => (ui.fast ? Math.max(30, Math.round(delay / 8)) : delay)

  const later = (callback, delay) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (!disposed) {
        callback()
      }
    }, pace(delay))
  }

  const clearTimer = () => {
    clearTimeout(timer)
    timer = null
  }

  const defenderTeam = () => {
    if (state.dealer < 0) {
      return 1
    }
    return 1 - TEAM_OF_SEAT[state.dealer]
  }

  /** 牌面 chip：调试面板点选换牌用 */
  const chipOf = (card) => ({
    id: card.id,
    key: cardKey(card),
    label: cardLabel(card),
    red: card.joker === JOKER_BIG || (!card.joker && RED_SUITS.includes(card.suit)),
    joker: card.joker > 0,
    trump: state.rule.isTrump(card),
  })

  const syncDebug = () => {
    const zones = state.hands.map((hand, seat) => ({
      zone: seat,
      label: SEAT_LABELS[seat],
      cards: sortHand(hand, state.rule).map(chipOf),
    }))
    if (canSwapZone(state, ZONE_KITTY)) {
      zones.push({ zone: ZONE_KITTY, label: '底牌', cards: state.kitty.map(chipOf) })
    }
    ui.debug.zones = zones
    ui.debug.audit = auditDeck(state)
    ui.debug.rig = state.nextDealRig.map((entry, index) => ({
      index,
      seat: entry.seat,
      key: entry.key,
      label: keyLabel(entry.key),
      seatLabel: SEAT_LABELS[entry.seat],
    }))
    if (state.phase === 'bury' && state.dealer === 0) {
      ui.buryRemain = 8 - ui.selectedIds.length
    }
  }

  const sync = () => {
    ui.phase = state.phase
    ui.levelLabel = levelLabel(state.level)
    ui.levelValue = state.level
    ui.trumpSuit = state.trumpSuit
    ui.dealer = state.dealer
    ui.teamLevels = [state.teamLevels[0], state.teamLevels[1]]
    ui.hand = sortHand(state.hands[0], state.rule)
    ui.handCounts = state.hands.map((hand) => hand.length)
    ui.points = state.teamPoints[defenderTeam()]
    ui.trickIndex = state.playedTricks
    ui.matchWinner = state.matchWinner
    ui.roundIndex = state.roundIndex
    ui.dimHand = state.phase === 'play' && state.turn !== 0
    // 等待操作只由「出牌阶段 + 轮到我 + 未托管」决定，避免上一局的状态残留到新一局
    ui.awaitingPlay = state.phase === 'play' && state.turn === 0 && !ui.autoPlay
    if (state.phase !== 'declare') {
      ui.declare = null
    }
    const alive = new Set(ui.hand.map((card) => card.id))
    ui.selectedIds = ui.selectedIds.filter((id) => alive.has(id))
    syncDebug()
  }

  const buildView = () => {
    return {
      rule: state.rule,
      hand: ui.hand,
      handCounts: ui.handCounts,
      selectedIds: ui.selectedIds,
      hoverIndex: ui.hoverIndex,
      trick: ui.trick,
      trickWinner: ui.trickWinner,
      levelLabel: ui.levelLabel,
      trumpSuit: ui.trumpSuit,
      points: ui.points,
      target: ui.target,
      trickIndex: ui.trickIndex,
      dealer: ui.dealer,
      seatLabels: SEAT_LABELS,
      dimHand: ui.dimHand,
    }
  }

  const render = () => {
    if (!renderer) {
      return
    }
    renderer.draw(buildView())
  }

  const pushLog = (text) => {
    ui.log.unshift(text)
    if (ui.log.length > 14) {
      ui.log.pop()
    }
  }

  /** 一墩结束后的展示：保留 1.1 秒让玩家看清谁赢了 */
  const showTrick = (record) => {
    ui.trick = record.plays.map((entry) => ({
      seat: entry.seat,
      cards: orderForTable(entry.play.cards, state.rule),
    }))
    ui.trickWinner = record.winnerSeat
    const winnerLabel = SEAT_LABELS[record.winnerSeat]
    let text = `${winnerLabel} 赢下第 ${record.index} 墩`
    if (record.points > 0) {
      text += ` · ${record.points} 分`
    }
    if (record.kittyPoints > 0) {
      text += ` · 抠底 ${record.kittyPoints}×${record.multiplier}`
    }
    ui.message = text
    pushLog(text)
  }

  const finishTurn = () => {
    if (isTrickComplete(state)) {
      const record = resolveTrick(state)
      sync()
      showTrick(record)
      render()
      later(() => {
        ui.trick = []
        ui.trickWinner = -1
        ui.message = ''
        sync()
        render()
        pump()
      }, 1150)
      return
    }
    sync()
    render()
    pump()
  }

  const settle = () => {
    const levelBefore = state.teamLevels.slice()
    const result = settleRound(state)
    sync()
    ui.result = { ...result, levelBefore }
    ui.phase = state.phase
    ui.awaitingPlay = false
    ui.declare = null
    render()
    if (!ui.autoPlay) {
      return
    }
    if (state.matchWinner >= 0) {
      // 打完通关闭，弹窗留给玩家自己看
      ui.autoPlay = false
      return
    }
    ui.message = '托管中：稍后自动开始下一局'
    later(() => {
      if (ui.autoPlay) {
        continueNextRound()
      }
    }, 1900)
  }

  /** 让 AI 替某一家完成亮主/反主/过牌 */
  const runDeclareSeat = (seat, options, delay) => {
    ui.thinking = `${SEAT_LABELS[seat]} 考虑亮主…`
    later(() => {
      const choice = aiDeclare(state, seat)
      if (choice) {
        applyDeclare(state, seat, choice)
        const suitText = state.trumpSuit < 0 ? '无主' : ['黑桃', '红桃', '梅花', '方片'][state.trumpSuit]
        const action = options.stage === 1 ? '亮主' : '反主'
        pushLog(`${SEAT_LABELS[seat]} ${action} → ${suitText}`)
      } else {
        passDeclare(state)
      }
      ui.thinking = ''
      sync()
      pump()
    }, delay)
  }

  const pumpDeclare = () => {
    if (isDeclareFinished(state)) {
      finishDeclare(state)
      sync()
      pushLog(`本局打 ${RANK_LABELS[state.level]} · 主牌 ${state.trumpSuit < 0 ? '无主' : ['黑桃', '红桃', '梅花', '方片'][state.trumpSuit]}`)
      ui.message = state.dealer === 0 ? '你是庄家，请扣 8 张底牌' : '庄家正在扣底…'
      render()
      later(pump, 420)
      return
    }
    const seat = currentDeclareSeat(state)
    const options = declareOptions(state, seat)
    if (seat === 0) {
      if (!options.canDeclare) {
        ui.message = '你手里没有可亮的级牌，自动过牌'
        later(() => {
          passDeclare(state)
          sync()
          pump()
        }, 320)
        return
      }
      if (ui.autoPlay) {
        runDeclareSeat(seat, options, 520)
        return
      }
      ui.declare = { stage: options.stage, suits: options.suits, jokers: options.jokers }
      ui.message = DECLARE_TEXT[options.stage]
      sync()
      render()
      return
    }
    runDeclareSeat(seat, options, 620)
  }

  const pumpBury = () => {
    if (state.dealer === 0 && !ui.autoPlay) {
      ui.buryRemain = 8 - ui.selectedIds.length
      ui.message = '轮到你扣底：点选 8 张牌，扣进底牌'
      sync()
      render()
      return
    }
    const owner = state.dealer
    ui.thinking = owner === 0 ? '托管中：自动扣底…' : `${SEAT_LABELS[owner]} 正在扣底…`
    later(() => {
      applyBury(state, aiBury(state))
      ui.thinking = ''
      sync()
      render()
      pump()
    }, owner === 0 ? 460 : 560)
  }

  const pumpPlay = () => {
    if (isRoundOver(state)) {
      settle()
      return
    }
    if (state.turn === 0 && !ui.autoPlay) {
      ui.awaitingPlay = true
      ui.message = state.trickPlays.length === 0 ? '你首出，选牌后点出牌' : '轮到你跟牌'
      sync()
      render()
      return
    }
    ui.awaitingPlay = false
    ui.thinking = `${SEAT_LABELS[state.turn]} 出牌中…`
    later(() => {
      const seat = state.turn
      if (seat === 0 && !ui.autoPlay) {
        // 托管在等待期间被收回，交还操作权
        ui.thinking = ''
        pump()
        return
      }
      const cards = aiPlay(state, seat)
      const outcome = applyPlay(state, seat, cards)
      if (!outcome.ok) {
        // 兜底：AI 决策被拒时用合法构造器重新出一手，避免整局卡死
        const lead = state.trickPlays.length > 0 ? state.trickPlays[0].play : null
        const fallback = lead
          ? buildFollow(state.hands[seat], lead, state.rule, {})
          : [state.hands[seat][0]]
        const retry = applyPlay(state, seat, fallback)
        if (!retry.ok) {
          ui.message = `出牌异常：${retry.reason}`
        }
      }
      ui.thinking = ''
      finishTurn()
    }, 700)
  }

  const pump = () => {
    if (disposed) {
      return
    }
    if (state.phase === 'declare') {
      pumpDeclare()
      return
    }
    if (state.phase === 'bury') {
      pumpBury()
      return
    }
    if (state.phase === 'play') {
      pumpPlay()
    }
  }

  const start = () => {
    clearTimer()
    ui.result = null
    ui.trick = []
    ui.trickWinner = -1
    ui.log = []
    ui.declare = null
    ui.selectedIds = []
    startRound(state)
    sync()
    logRigApplied()
    render()
    pump()
  }

  const restartMatch = () => {
    state.teamLevels = [2, 2]
    state.dealer = -1
    state.roundIndex = 0
    state.matchWinner = -1
    start()
  }

  const declare = (choice) => {
    if (!ui.declare || ui.autoPlay) {
      return
    }
    const outcome = applyDeclare(state, 0, choice)
    if (!outcome.ok) {
      ui.message = outcome.reason
      return
    }
    ui.declare = null
    const suitText = state.trumpSuit < 0 ? '无主' : ['黑桃', '红桃', '梅花', '方片'][state.trumpSuit]
    pushLog(`你${choice.jokers ? '反无主' : '亮主'} → ${suitText}`)
    sync()
    pump()
  }

  const passDeclareTurn = () => {
    ui.declare = null
    passDeclare(state)
    sync()
    pump()
  }

  const toggleCard = (cardId) => {
    if (ui.autoPlay) {
      return
    }
    if (state.phase === 'bury') {
      if (state.dealer !== 0) {
        return
      }
      const index = ui.selectedIds.indexOf(cardId)
      if (index >= 0) {
        ui.selectedIds.splice(index, 1)
      } else if (ui.selectedIds.length < 8) {
        ui.selectedIds.push(cardId)
      }
      ui.buryRemain = 8 - ui.selectedIds.length
      ui.message = `已选 ${ui.selectedIds.length} 张，还需扣 ${ui.buryRemain} 张`
      render()
      return
    }
    const index = ui.selectedIds.indexOf(cardId)
    if (index >= 0) {
      ui.selectedIds.splice(index, 1)
    } else {
      ui.selectedIds.push(cardId)
    }
    render()
  }

  const clearSelection = () => {
    ui.selectedIds = []
    ui.message = ''
    render()
  }

  const burySelected = () => {
    if (ui.autoPlay) {
      return
    }
    if (ui.selectedIds.length !== 8) {
      ui.message = '必须正好扣 8 张'
      return
    }
    const cards = ui.hand.filter((card) => ui.selectedIds.includes(card.id))
    const outcome = applyBury(state, cards)
    if (!outcome.ok) {
      ui.message = outcome.reason
      return
    }
    ui.selectedIds = []
    ui.message = ''
    pushLog('你完成扣底')
    sync()
    render()
    pump()
  }

  const playSelected = () => {
    if (!ui.awaitingPlay || ui.autoPlay) {
      return
    }
    const cards = ui.hand.filter((card) => ui.selectedIds.includes(card.id))
    const outcome = applyPlay(state, 0, cards)
    if (!outcome.ok) {
      ui.message = outcome.reason
      return
    }
    ui.awaitingPlay = false
    ui.selectedIds = []
    if (outcome.reduced) {
      ui.message = `甩牌被压，只出了最小的 ${outcome.play.size} 张`
    } else {
      ui.message = ''
    }
    finishTurn()
  }

  /** 提示：直接用 AI 的决策帮你选好一手合法牌 */
  const hint = () => {
    if (!ui.awaitingPlay || ui.autoPlay) {
      return
    }
    const cards = aiPlay(state, 0).slice()
    ui.selectedIds = cards.map((card) => card.id)
    ui.message = '已按 AI 建议选牌，可再手动调整'
    render()
  }

  /** 调试：交换两个区域里的各一张牌（只换位置，不换张数） */
  const debugSwap = (first, second) => {
    const outcome = swapCards(state, first, second)
    if (!outcome.ok) {
      ui.debug.note = outcome.reason
      return outcome
    }
    const zoneName = (zone) => (zone === ZONE_KITTY ? '底牌' : SEAT_LABELS[zone])
    ui.debug.note = `${cardLabel(outcome.intoFirst)} → ${zoneName(first.zone)}，${cardLabel(outcome.intoSecond)} → ${zoneName(second.zone)}`
    pushLog(`调试换牌：${ui.debug.note}`)
    sync()
    render()
    return outcome
  }

  /** 调试：安排某家下一局的起手牌 */
  const addRig = (seat, key) => {
    const plan = state.nextDealRig.concat([{ seat, key }])
    const outcome = validateRig(plan)
    if (!outcome.ok) {
      if (outcome.over.length) {
        ui.debug.note = `${outcome.over[0].label} 两副牌只有 ${COPIES_PER_CARD} 张，已经排满了`
      } else if (outcome.crowded.length) {
        ui.debug.note = `单家最多安排 ${CARDS_PER_SEAT} 张`
      } else {
        ui.debug.note = '这条安排不合法'
      }
      return { ok: false, reason: ui.debug.note }
    }
    state.nextDealRig = plan
    ui.debug.note = `${SEAT_LABELS[seat]} 下局起手必进 ${keyLabel(key)}`
    pushLog(`调试安排：${SEAT_LABELS[seat]} 下局进 ${keyLabel(key)}`)
    sync()
    return { ok: true }
  }

  const removeRig = (index) => {
    const plan = state.nextDealRig.slice()
    plan.splice(index, 1)
    state.nextDealRig = plan
    ui.debug.note = ''
    sync()
  }

  const clearRig = () => {
    state.nextDealRig = []
    ui.debug.note = ''
    sync()
  }

  /** 本局发牌是否用上了安排 */
  const logRigApplied = () => {
    if (!state.lastRig || state.lastRig.length === 0) {
      return
    }
    const text = state.lastRig.map((entry) => `${SEAT_LABELS[entry.seat]} ${keyLabel(entry.key)}`).join('、')
    ui.debug.note = `本局已按安排发牌：${text}`
    pushLog(`调试安排生效：${text}`)
  }

  const continueNextRound = () => {
    // 没有结算弹窗说明已经开了下一局，避免重复调度把新一局顶掉
    if (!ui.result) {
      return
    }
    ui.result = null
    if (state.matchWinner >= 0) {
      return
    }
    nextRound(state)
    ui.trick = []
    ui.trickWinner = -1
    sync()
    logRigApplied()
    render()
    pump()
  }

  const toggleFast = () => {
    ui.fast = !ui.fast
  }

  const toggleAutoPlay = () => {
    ui.autoPlay = !ui.autoPlay
    if (!ui.autoPlay) {
      // 收回托管：若正轮到我，立刻把操作权还回来
      ui.thinking = ''
      if (state.phase === 'play' && state.turn === 0) {
        ui.awaitingPlay = true
        ui.message = state.trickPlays.length === 0 ? '你首出，选牌后点出牌' : '轮到你跟牌'
      } else if (state.phase === 'declare') {
        pump()
      } else if (state.phase === 'bury' && state.dealer === 0) {
        pump()
      }
      sync()
      render()
      return
    }
    // 开启托管：立刻接管当前正在等玩家的那一步
    ui.awaitingPlay = false
    ui.declare = null
    ui.selectedIds = []
    if (ui.result) {
      if (state.matchWinner < 0) {
        ui.message = '托管中：即将开始下一局'
        later(() => {
          if (ui.autoPlay) {
            continueNextRound()
          }
        }, 900)
      } else {
        ui.autoPlay = false
      }
      return
    }
    pump()
  }

  const attach = () => {
    if (!canvasRef.value) {
      return
    }
    renderer = createTableRenderer(canvasRef.value)
    renderer.resize()
    sync()
    render()
  }

  const resize = () => {
    if (renderer) {
      renderer.resize()
      render()
    }
  }

  const onHover = (clientX, clientY) => {
    if (!renderer) {
      return
    }
    const index = renderer.hitHand(clientX, clientY, buildView())
    if (index !== ui.hoverIndex) {
      ui.hoverIndex = index
      render()
    }
  }

  const onLeave = () => {
    if (ui.hoverIndex !== -1) {
      ui.hoverIndex = -1
      render()
    }
  }

  const onClick = (clientX, clientY) => {
    if (!renderer) {
      return
    }
    const index = renderer.hitHand(clientX, clientY, buildView())
    if (index >= 0) {
      toggleCard(ui.hand[index].id)
    }
  }

  const dispose = () => {
    disposed = true
    clearTimer()
  }

  /** 调试用：某家的手牌文本 */
  const revealHand = (seat) => {
    return sortHand(state.hands[seat], state.rule).map((card) => {
      if (card.joker === 2) {
        return '大王'
      }
      if (card.joker === 1) {
        return '小王'
      }
      return `${['♠', '♥', '♣', '♦'][card.suit]}${RANK_LABELS[card.rank]}`
    })
  }

  /** 调试用：再跑一次牌堆体检，返回明细 */
  const auditNow = () => {
    const report = auditDeck(state)
    ui.debug.audit = report
    return report
  }

  return {
    state,
    ui,
    attach,
    start,
    restartMatch,
    resize,
    onHover,
    onLeave,
    onClick,
    declare,
    passDeclareTurn,
    toggleCard,
    clearSelection,
    burySelected,
    playSelected,
    hint,
    continueNextRound,
    toggleAutoPlay,
    toggleFast,
    dispose,
    revealHand,
    debugSwap,
    addRig,
    removeRig,
    clearRig,
    auditNow,
    clearTimer,
  }
}
