import {
  countsFrom, isHonor, rankOf, YAOCHUU, EAST, SOUTH, WEST, emptyCounts, tileText,
} from './tiles.js'
import { createRng } from './rng.js'
import { shanten, isTenpai, winningTiles } from './shanten.js'
import { isChiitoitsu, isKokushi } from './hand.js'
import { judge, breakdownOf } from './yaku.js'
import { calcScore, flowPayments } from './score.js'
import { visibleCounts } from './visible.js'

const RIICHI_BET = 1000
const DEAD_WALL = 14
const WIND_KIND = { east: EAST, south: SOUTH }
const nextWind = (k) => (k === EAST ? SOUTH : k === SOUTH ? WEST : 29)

const newPlayer = (index) => ({
  index,
  tiles: [],
  drawn: null,
  melds: [],
  river: [],
  points: 10000,
  riichi: false,
  riichiIndex: -1,
  ippatsu: false,
  isDealer: false,
  seatWind: EAST,
  menzen: true,
  passedRon: false,
  drawnCount: 0,
})

/**
 * 一整场对局的状态机（3.2 流程图）：东风 / 半庄，双人
 * @param {{seed?:number, length?:'east'|'south', difficulty?:string}} opts
 */
export const createGame = (opts = {}) => {
  const rng = createRng(opts.seed ?? (Math.random() * 0xffffffff) >>> 0)
  const state = {
    rng,
    seed: rng.seed,
    difficulty: opts.difficulty || 'normal',
    length: opts.length || 'south',
    totalHands: opts.length === 'east' ? 4 : 8,
    handIndex: 0,
    dealer: 0,
    wall: [],
    deadWall: [],
    /** 王牌区末尾 5 张：1 张表宝牌指示牌 + 最多 4 张杠宝牌指示牌 */
    doraWall: [],
    doraRevealed: 1,
    dice: [1, 1],
    players: [newPlayer(0), newPlayer(1)],
    round: { wind: 'east', number: 1, honba: 0, riichiBets: 0 },
    turn: 0,
    phase: 'idle',
    lastDiscard: null,
    drawnTile: null,
    turnCount: 0,
    result: null,
    finalResult: null,
    meldHappened: false,
    rinshan: false,
    chankanFlag: false,
    kanfuriFlag: false,
    kanfuriTarget: -1,
    events: [],
    history: [],
    /** 调试：指定下一位/自己下一张摸到的牌（一次性） */
    forcedDraw: [null, null],
    /** 调试：悔牌/取牌失败时给 UI 的一句话说明 */
    debugMiss: null,
  }

  let seq = 0
  const log = (type, data) => {
    state.events.push({ type, seq: ++seq, turn: state.turnCount, ...data })
    if (state.events.length > 300) state.events.shift()
  }
  const roundWind = () => WIND_KIND[state.round.wind]
  const other = (i) => 1 - i
  const isMenzen = (p) => p.melds.every((m) => m.type === 'ankan')
  /** 已翻开的宝牌指示牌 */
  const doraIndicators = () => state.doraWall.slice(0, state.doraRevealed)
  /** 每完成一次杠翻一张杠宝牌 */
  const revealKanDora = () => { state.doraRevealed = Math.min(state.doraWall.length, state.doraRevealed + 1) }

  const buildWall = () => {
    const all = []
    for (let k = 0; k < 34; k++) for (let n = 0; n < 4; n++) all.push(k)
    rng.shuffle(all)
    state.deadWall = all.slice(0, DEAD_WALL)
    state.wall = all.slice(DEAD_WALL)
    // 岭上牌从王牌区头部取，指示牌固定在尾部 5 张，杠满 4 次也不会被摸走
    state.doraWall = state.deadWall.slice(DEAD_WALL - 5)
    state.doraRevealed = 1
  }

  /** 配牌：掷 2 骰切山，双方 13 张，庄家先摸 */
  const deal = () => {
    buildWall()
    const dice = [rng.range(1, 6), rng.range(1, 6)]
    const cut = (dice[0] + dice[1]) % state.wall.length
    state.wall = state.wall.slice(cut).concat(state.wall.slice(0, cut))
    state.dice = dice
    for (const p of state.players) {
      Object.assign(p, {
        tiles: [], drawn: null, melds: [], river: [], riichi: false,
        riichiIndex: -1, ippatsu: false, menzen: true, passedRon: false, drawnCount: 0,
      })
    }
    for (let n = 0; n < 13; n++) {
      state.players[0].tiles.push(state.wall.pop())
      state.players[1].tiles.push(state.wall.pop())
    }
    for (const p of state.players) p.tiles.sort((a, b) => a - b)
    state.dealer = state.handIndex % 2
    state.players[state.dealer].isDealer = true
    state.players[other(state.dealer)].isDealer = false
    state.players[state.dealer].seatWind = roundWind()
    state.players[other(state.dealer)].seatWind = nextWind(roundWind())
    state.turn = state.dealer
    state.turnCount = 0
    state.phase = 'draw'
    state.result = null
    state.lastDiscard = null
    state.drawnTile = null
    state.rinshan = false
    state.meldHappened = false
    state.chankanFlag = false
    state.kanfuriFlag = false
    state.kanfuriTarget = -1
    state.forcedDraw = [null, null]
    state.debugMiss = null
  }

  /** 摸牌：自牌山末端反向摸；杠后从王牌区补牌。调试指定的牌优先，且只在对应补给区里找 */
  const drawTile = (fromDead = false) => {
    const p = state.players[state.turn]
    if (!fromDead && state.wall.length === 0) return null
    let taken
    const forced = state.forcedDraw[state.turn]
    if (forced !== null) {
      const zone = fromDead ? state.deadWall : state.wall
      const i = zone.indexOf(forced)
      if (i >= 0) taken = zone.splice(i, 1)[0]
      else state.debugMiss = { msg: `指定的牌不在${fromDead ? '王牌' : '牌山'}里，已改为随机摸牌`, tiles: [forced] }
      state.forcedDraw[state.turn] = null
    }
    if (taken === undefined) taken = fromDead ? state.deadWall.shift() : state.wall.pop()
    if (taken === undefined) return null
    const t = taken
    if (fromDead && state.wall.length) state.wall.pop()
    p.tiles.push(t)
    p.drawn = t
    p.drawnCount++
    p.passedRon = false
    state.drawnTile = t
    state.rinshan = fromDead
    state.kanfuriFlag = state.kanfuriTarget === state.turn && !fromDead
    log('draw', { player: state.turn, fromDead })
    return t
  }

  const winFlags = (p, isTsumo) => ({
    riichi: p.riichi,
    ippatsu: p.ippatsu,
    haitei: isTsumo && state.wall.length === 0 && !state.rinshan,
    houtei: !isTsumo && state.wall.length === 0,
    rinshan: isTsumo && state.rinshan,
    chankan: !!state.chankanFlag,
    kanfuri: !!state.kanfuriFlag,
    tenhou: isTsumo && p.isDealer && p.drawnCount === 1 && !state.meldHappened && state.turnCount === 0,
    chiihou: isTsumo && !p.isDealer && p.drawnCount === 1 && !state.meldHappened && state.turnCount <= 1,
  })

  /**
   * 振听状态（标准规则）
   * 舍牌振听：待牌里**任何一张**出现在自己牌河 → **全体待牌**都不能荣和（本局永久，直到换听）
   * 同巡振听：本巡放弃了能和的那张 → 到自己下一次摸牌前，全体待牌都不能荣和
   * @returns {{waits:number[], hits:number[], permanent:boolean, temp:boolean, canRon:boolean}}
   */
  const furitenState = (p) => {
    const counts = countsFrom(p.tiles)
    const waits = winningTiles(counts, p.melds)
    const river = new Set(p.river.map((d) => d.kind))
    const hits = waits.filter((t) => river.has(t))
    const permanent = hits.length > 0
    const temp = !!p.passedRon
    return { waits, hits, permanent, temp, canRon: !permanent && !temp }
  }

  /** 是否成和（含无役与振听过滤） */
  const tryWin = (p, winTile, isTsumo) => {
    const counts = countsFrom(p.tiles)
    const full = counts.slice()
    if (!isTsumo) full[winTile]++
    const ok = shanten(full, p.melds) === -1 || isChiitoitsu(full, p.melds) || isKokushi(full, p.melds)
    if (!ok) return null
    if (!isTsumo) {
      const f = furitenState(p)
      if (!f.canRon) return null
    }
    return judge({
      counts, melds: p.melds, winTile, isTsumo,
      seatWind: p.seatWind, roundWind: roundWind(), flags: winFlags(p, isTsumo),
      doraIndicators: doraIndicators(),
    })
  }

  /**
   * 立直宣言时可选的切牌。
   * 规则：**宣言后打出的这一张不限定为刚摸到的牌**，只要切完仍是听牌即可；
   * 只有立直之后的每一巡（ 모切）才限定打刚摸的那张。
   */
  const riichiDiscards = (idx) => {
    const p = state.players[idx]
    if (p.drawn === null || p.riichi || !isMenzen(p)) return []
    if (p.points < RIICHI_BET || state.wall.length < 4) return []
    const c = countsFrom(p.tiles)
    if (shanten(c, p.melds) !== 0) return []
    const out = []
    for (const k of [...new Set(p.tiles)]) {
      const c2 = c.slice()
      c2[k]--
      if (shanten(c2, p.melds) === 0) out.push(k)
    }
    return out
  }

  /** 摸牌后可动作 */
  const turnActions = (idx) => {
    const p = state.players[idx]
    const out = { tsumo: false, riichi: false, ankan: [], kakan: [], kyushu: false, rinshanWin: false }
    if (p.drawn === null) return out
    out.tsumo = !!tryWin(p, p.drawn, true)
    if (out.tsumo && state.rinshan) out.rinshanWin = true
    const c = countsFrom(p.tiles)
    if (!p.riichi) {
      for (let t = 0; t < 34; t++) if (c[t] === 4) out.ankan.push(t)
      for (const m of p.melds) if (m.type === 'pon' && c[m.kinds[0]] >= 1) out.kakan.push(m.kinds[0])
    }
    out.riichi = riichiDiscards(idx).length > 0
    if (state.turnCount === 0 && p.drawnCount === 1 && !state.meldHappened && !p.riichi && !p.melds.length) {
      if (YAOCHUU.filter((t) => c[t] > 0).length >= 9) out.kyushu = true
    }
    return out
  }

  /** 立直后只能摸打；其余情况任意手牌可切 */
  const legalDiscards = (idx) => {
    const p = state.players[idx]
    if (p.riichi && p.drawn !== null) return [p.drawn]
    return [...new Set(p.tiles)]
  }

  /** 对手舍牌 / 加杠后的响应窗口 */
  const responseActions = (idx, tile, mode = 'discard') => {
    const p = state.players[idx]
    const out = { ron: false, pon: false, kan: false, chi: [], chankan: mode === 'chankan' }
    out.ron = !!tryWin(p, tile, false)
    if (mode === 'chankan') return out
    if (p.riichi) return out
    const c = countsFrom(p.tiles)
    if (c[tile] >= 2) out.pon = true
    if (c[tile] === 3) out.kan = true
    if (!isHonor(tile)) {
      const r = rankOf(tile)
      if (r <= 7 && c[tile + 1] > 0 && c[tile + 2] > 0) out.chi.push([tile, tile + 1, tile + 2])
      if (r >= 2 && r <= 8 && c[tile - 1] > 0 && c[tile + 1] > 0) out.chi.push([tile - 1, tile, tile + 1])
      if (r >= 3 && c[tile - 2] > 0 && c[tile - 1] > 0) out.chi.push([tile - 2, tile - 1, tile])
    }
    return out
  }

  /* ------------------------- 动作 ------------------------- */

  const doDraw = () => {
    const t = drawTile(false)
    if (t === null) {
      abortDraw('荒牌流局')
      return null
    }
    state.phase = 'discard'
    return t
  }

  const removeTile = (p, kind) => {
    const i = p.tiles.indexOf(kind)
    if (i >= 0) p.tiles.splice(i, 1)
    if (p.drawn === kind) p.drawn = null
  }

  const doDiscard = (kind) => {
    const p = state.players[state.turn]
    const tsumogiri = kind === state.drawnTile
    removeTile(p, kind)
    // 打出的不一定是自己刚摸的那张（立直宣言那一刀可任选），摸牌标记一律清空
    p.drawn = null
    p.tiles.sort((a, b) => a - b)
    p.river.push({
      kind, tsumogiri, turn: state.turnCount,
      riichi: p.riichi && p.riichiIndex === p.river.length,
    })
    if (p.riichi && p.ippatsu && p.river.length >= p.riichiIndex + 2) p.ippatsu = false
    state.lastDiscard = { from: state.turn, kind, houtei: state.wall.length === 0, mode: 'discard' }
    state.drawnTile = null
    state.kanfuriFlag = state.kanfuriTarget === state.turn
    state.kanfuriTarget = -1
    state.phase = 'response'
    state.turnCount++
    log('discard', { player: state.turn, kind })
    return state.lastDiscard
  }

  /** @param {number} kind 宣言后打出的牌，必须是 riichiDiscards 之一 */
  const doRiichi = (kind) => {
    const p = state.players[state.turn]
    if (!riichiDiscards(state.turn).includes(kind)) return null
    p.riichi = true
    p.ippatsu = true
    p.riichiIndex = p.river.length
    p.points -= RIICHI_BET
    state.round.riichiBets++
    log('riichi', { player: state.turn })
    doDiscard(kind)
  }

  const finishWin = (winnerIdx, winTile, isTsumo, res, loserIdx) => {
    const w = state.players[winnerIdx]
    // 荣和牌物理归和牌者所有（抢杠时它就是被抢的那第 4 张），这样全区域牌数才守恒
    if (!isTsumo) w.tiles.push(winTile)
    const counts = countsFrom(w.tiles)
    const score = calcScore({
      han: res.han, fu: res.fu, isDealer: w.isDealer, isTsumo,
      isYakuman: res.isYakuman, honba: state.round.honba, riichiBets: state.round.riichiBets,
    })
    const from = isTsumo ? other(winnerIdx) : loserIdx
    state.players[from].points -= score.total
    state.players[winnerIdx].points += score.total
    state.round.riichiBets = 0
    state.result = {
      kind: 'win',
      winner: winnerIdx,
      loser: isTsumo ? -1 : loserIdx,
      winTile,
      isTsumo,
      decomposition: res.sets,
      head: res.head,
      breakdown: breakdownOf(res, counts, w.melds),
      yaku: res.isYakuman ? res.yakuman : res.yaku,
      han: res.han,
      fu: res.fu,
      dora: res.dora || 0,
      doraIndicators: doraIndicators(),
      isYakuman: res.isYakuman,
      wait: res.wait,
      limit: score.limit,
      limitName: score.limitName,
      basePoints: score.basePoints,
      honba: state.round.honba,
      honbaAddition: score.honbaAddition,
      riichiPoints: score.riichiPoints,
      amount: score.amount,
      total: score.total,
      payments: [{ from, to: winnerIdx, amount: score.total, reason: isTsumo ? '自摸' : '荣和' }],
      dealerRepeat: winnerIdx === state.dealer,
      tenpai: [true, true],
    }
    state.phase = 'over'
    log('win', { player: winnerIdx, isTsumo, han: res.han })
    return state.result
  }

  const abortDraw = (reason) => {
    const tenpai = state.players.map((p) => isTenpai(countsFrom(p.tiles), p.melds))
    const payments = flowPayments(tenpai)
    for (const pm of payments) {
      state.players[pm.from].points -= pm.amount
      state.players[pm.to].points += pm.amount
    }
    state.result = {
      kind: 'draw',
      reason,
      tenpai,
      payments,
      dealerRepeat: tenpai[state.dealer],
    }
    state.phase = 'over'
    log('draw_end', { reason })
    return state.result
  }

  const doTsumo = (idx) => {
    const p = state.players[idx]
    const res = tryWin(p, p.drawn, true)
    return res ? finishWin(idx, p.drawn, true, res, -1) : null
  }

  const doRon = (idx) => {
    const tile = state.lastDiscard.kind
    if (state.lastDiscard.mode === 'chankan') state.chankanFlag = true
    const p = state.players[idx]
    const res = tryWin(p, tile, false)
    if (!res) return null
    const from = state.lastDiscard.from
    if (state.lastDiscard.mode === 'chankan') {
      // 抢杠成立 → 加杠还原为碰
      const m = state.players[from].melds.find((x) => x.type === 'kan' && x.kinds[0] === tile)
      if (m) {
        m.type = 'pon'
        m.kinds = [tile, tile, tile]
      }
    }
    const r = finishWin(idx, tile, false, res, from)
    state.chankanFlag = false
    return r
  }

  const doPass = (idx) => {
    const ld = state.lastDiscard
    const p = state.players[idx]
    if (responseActions(idx, ld.kind, ld.mode).ron) p.passedRon = true
    if (ld.mode === 'chankan') {
      // 抢杠未发生 → 杠成立，翻杠宝牌并摸岭上牌
      revealKanDora()
      state.turn = ld.from
      state.kanfuriTarget = ld.from
      drawTile(true)
      state.phase = 'discard'
      checkFourKan()
      return
    }
    if (checkFourWind()) return
    state.turn = idx
    state.phase = 'draw'
  }

  const callMeld = (idx, meld, kind) => {
    const p = state.players[idx]
    const from = state.lastDiscard.from
    state.players[from].river.pop()
    // 呼叫牌来自牌河，其余组成牌从手牌扣除（碰扣 2、明杠扣 3、吃扣另外两张）
    for (const k of [...new Set(meld.kinds)]) {
      let n = meld.kinds.filter((x) => x === k).length
      if (k === kind) n -= 1
      for (let i = 0; i < n; i++) removeTile(p, k)
    }
    p.melds.push({ ...meld, from: 'opponent', claimed: kind })
    p.menzen = isMenzen(p)
    p.tiles.sort((a, b) => a - b)
    state.meldHappened = true
    for (const q of state.players) q.ippatsu = false
    state.turn = idx
    state.phase = 'discard'
    state.lastDiscard = null
    log('meld', { player: idx, type: meld.type, kind })
    checkFourKan()
  }

  const doPon = (idx) => callMeld(idx, { type: 'pon', kinds: [state.lastDiscard.kind, state.lastDiscard.kind, state.lastDiscard.kind] }, state.lastDiscard.kind)
  const doChi = (idx, kinds) => callMeld(idx, { type: 'chi', kinds: kinds.slice() }, state.lastDiscard.kind)
  const doKanOpen = (idx) => {
    const kind = state.lastDiscard.kind
    callMeld(idx, { type: 'kan', kinds: [kind, kind, kind, kind] }, kind)
    revealKanDora()
    state.kanfuriTarget = idx
    drawTile(true)
    state.phase = 'discard'
  }

  const doAnkan = (idx, kind) => {
    const p = state.players[idx]
    for (let n = 0; n < 4; n++) {
      const i = p.tiles.indexOf(kind)
      if (i >= 0) p.tiles.splice(i, 1)
    }
    if (p.drawn === kind) p.drawn = null
    p.melds.push({ type: 'ankan', kinds: [kind, kind, kind, kind], from: 'self' })
    p.menzen = isMenzen(p)
    revealKanDora()
    p.tiles.sort((a, b) => a - b)
    state.meldHappened = true
    for (const q of state.players) q.ippatsu = false
    state.turn = idx
    state.kanfuriTarget = idx
    drawTile(true)
    state.phase = 'discard'
    log('meld', { player: idx, type: 'ankan', kind })
    checkFourKan()
  }

  const doKakan = (idx, kind) => {
    const p = state.players[idx]
    const m = p.melds.find((x) => x.type === 'pon' && x.kinds[0] === kind)
    if (!m) return null
    m.type = 'kan'
    m.kinds = [kind, kind, kind, kind]
    removeTile(p, kind)
    p.tiles.sort((a, b) => a - b)
    p.menzen = isMenzen(p)
    state.meldHappened = true
    for (const q of state.players) q.ippatsu = false
    state.lastDiscard = { from: idx, kind, mode: 'chankan', houtei: false }
    state.phase = 'response'
    log('kakan', { player: idx, kind })
    return true
  }

  const checkFourKan = () => {
    const kans = state.players.map((p) => p.melds.filter((m) => m.type === 'kan' || m.type === 'ankan').length)
    if (kans[0] + kans[1] >= 4 && kans[0] !== 4 && kans[1] !== 4) {
      abortDraw('四杠散')
      return true
    }
    return false
  }

  const checkFourWind = () => {
    const [a, b] = state.players
    if (state.meldHappened) return false
    if (a.river.length !== 1 || b.river.length !== 1) return false
    if (a.river[0].kind === b.river[0].kind && a.river[0].kind >= EAST && a.river[0].kind <= 30) {
      abortDraw('四风连打')
      return true
    }
    return false
  }

  /* ------------------------- 调试 ------------------------- */

  /**
   * 全区域清点：牌山 + 王牌 + 双方手牌/副露/牌河
   * 每种应当恒为 4 张 —— 任何改写都必须保住这条，否则会出现第 5 张
   */
  const census = () => {
    const c = emptyCounts()
    for (const k of state.wall) c[k]++
    for (const k of state.deadWall) c[k]++
    for (const p of state.players) {
      for (const k of p.tiles) c[k]++
      for (const m of p.melds) for (const k of m.kinds) c[k]++
      for (const d of p.river) c[d.kind]++
    }
    return c
  }

  /** 体检：任一种 > 4 张，或总数 ≠ 136，都要挑出来 */
  const checkIntegrity = () => {
    const count = census()
    const errors = []
    for (let k = 0; k < 34; k++) if (count[k] > 4) errors.push(`${tileText(k)}×${count[k]}`)
    const total = count.reduce((a, b) => a + b, 0)
    if (total !== 136) errors.push(`总数 ${total}≠136`)
    return { count, total, errors }
  }

  /** 从牌山按牌种取一张。**不从王牌区取**，避免改动宝牌指示牌 */
  const takeWallTile = (kind) => {
    const i = state.wall.indexOf(kind)
    if (i < 0) return false
    state.wall.splice(i, 1)
    return true
  }

  /** 退回牌山：压到最前端（最后才会被摸到），避免下一手立刻把刚换掉的牌摸回来 */
  const returnWallTile = (kind) => { state.wall.unshift(kind) }

  /** 整理手牌：升序排列，并把刚摸的那张固定放最后（渲染的 drawn 高亮依赖这个约定） */
  const normalizeHand = (p) => {
    p.tiles.sort((a, b) => a - b)
    if (p.drawn !== null) {
      const i = p.tiles.indexOf(p.drawn)
      if (i >= 0) { p.tiles.splice(i, 1); p.tiles.push(p.drawn) }
    }
  }

  const nameOf = (idx) => (idx === 0 ? '你' : 'AI')

  /**
   * 调试：把手牌第 pos 张换成 kind（1:1 置换，手牌张数不变）
   * 闸门：局面进行中 · 该家未立直 · 目标牌还能加进来 · 牌山里取得到该牌
   * 副露（吃/碰/明杠/暗杠）与牌河不在 tiles 里，天然不可改
   * @returns {{ok:boolean, msg:string, tiles?:number[]}} tiles 供界面画成牌面
   */
  const debugSwap = (idx, pos, kind) => {
    const fail = (msg, tiles) => ({ ok: false, msg, tiles: tiles || [] })
    if (state.phase === 'finished' || state.phase === 'over') return fail('本局已结算，不能改牌')
    if (!Number.isInteger(kind) || kind < 0 || kind > 33) return fail('非法牌种')
    const p = state.players[idx]
    if (p.riichi) return fail(`${nameOf(idx)}已立直，手牌锁定（立直后只能摸切）`)
    if (pos < 0 || pos >= p.tiles.length) return fail('手牌下标越界')
    const old = p.tiles[pos]
    if (old === kind) return { ok: true, msg: '未变化', tiles: [] }
    // 1:1 置换：手牌出一张、牌山进一张，每种牌的总数恒定是 4 —— 天然不可能出现第 5 张。
    // 唯一要卡的是「补给来源」：必须从牌山拿，不碰王牌区（那里有宝牌指示牌）
    if (!takeWallTile(kind)) return fail('牌山里找不到这张（都在手里 / 牌河 / 副露里了）', [kind])
    p.tiles[pos] = kind
    returnWallTile(old)
    // 换掉的可能正是刚摸的那张：drawn 标记要跟着走
    if (p.drawn === old) {
      p.drawn = kind
      if (idx === state.turn) state.drawnTile = kind
    }
    normalizeHand(p)
    const chk = checkIntegrity()
    if (chk.errors.length) {
      // 兜底：正常到不了这里，真到了就把这次改动整体回滚
      p.tiles[pos] = old
      takeWallTile(old)
      returnWallTile(kind)
      normalizeHand(p)
      return fail('检测到牌数异常，已回滚：' + chk.errors.join('、'))
    }
    log('debug', { player: idx, kind })
    // tiles = [原位的那张, 换进来的那张]，界面画成「旧 → 新」
    return { ok: true, msg: '已替换', tiles: [old, kind], pos: p.tiles.indexOf(kind) }
  }

  /** 调试：指定某家下一张摸到的牌（一次性；摸到或取不到即清空） */
  const debugSetDraw = (idx, kind) => {
    if (state.phase === 'finished' || state.phase === 'over') return { ok: false, msg: '本局已结算', tiles: [] }
    if (!Number.isInteger(kind) || kind < 0 || kind > 33) return { ok: false, msg: '非法牌种', tiles: [] }
    state.forcedDraw[idx] = kind
    if (!state.wall.includes(kind) && !state.deadWall.includes(kind)) {
      return { ok: true, msg: `已排队，但牌山/王牌里现在没有它，届时可能退回随机摸牌`, tiles: [kind] }
    }
    return { ok: true, msg: `${nameOf(idx)}的下一张已指定`, tiles: [kind] }
  }

  const debugClearDraw = (idx) => {
    state.forcedDraw[idx] = null
    return { ok: true, msg: `已清除${nameOf(idx)}的指定摸牌`, tiles: [] }
  }

  const doKyushu = () => abortDraw('九种九牌')

  /** 一局收尾：连庄 / 轮庄 / 终局 */
  const nextHand = () => {
    const r = state.result
    if (!r) return null
    state.history.push({ ...r, handIndex: state.handIndex, wind: state.round.wind, number: state.round.number })
    if (r.dealerRepeat) {
      state.round.honba++
    } else {
      state.round.honba = 0
      state.handIndex++
      state.round.wind = state.handIndex < 4 ? 'east' : 'south'
      state.round.number = (state.handIndex % 4) + 1
    }
    if (state.handIndex >= state.totalHands || state.players.some((p) => p.points <= 0)) {
      state.phase = 'finished'
      const [a, b] = state.players
      state.finalResult = {
        points: [a.points, b.points],
        winner: a.points === b.points ? -1 : a.points > b.points ? 0 : 1,
        diff: Math.abs(a.points - b.points),
        history: state.history,
      }
      return state.finalResult
    }
    deal()
    return null
  }

  const startMatch = () => {
    state.handIndex = 0
    state.round = { wind: 'east', number: 1, honba: 0, riichiBets: 0 }
    state.history = []
    state.finalResult = null
    for (const p of state.players) p.points = 10000
    deal()
    return state
  }

  return {
    state,
    startMatch, deal, doDraw, doDiscard, doRiichi, doTsumo, doRon, doPass,
    doPon, doKanOpen, doChi, doAnkan, doKakan, doKyushu, abortDraw, nextHand,
    turnActions, responseActions, legalDiscards, riichiDiscards, tryWin, furitenState, checkFourWind,
    other, roundWind: () => roundWind(), isMenzen,
    doraIndicators, revealKanDora,
    visible: (idx) => visibleCounts(state, idx),
    countsOf: (idx) => countsFrom(state.players[idx].tiles),
    tileCensus: census, checkIntegrity,
    debugSwap, debugSetDraw, debugClearDraw,
  }
}
