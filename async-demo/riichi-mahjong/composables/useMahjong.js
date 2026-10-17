import { reactive, ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { createGame } from '../core/game.js'
import { debug, debugSay } from './useDebug.js'
import { chooseDiscard, chooseCall, shouldRiichi, chooseSelfKan, chooseRiichiDiscard, thinkDelay, AI_PARAMS } from '../core/ai.js'
import { shanten, ukeire, winningTiles } from '../core/shanten.js'
import { countsFrom, tileText } from '../core/tiles.js'
import { countDora, doraOf, doraKindsOf } from '../core/dora.js'
import { judge } from '../core/yaku.js'
import { analyzeProgress } from '../core/progress.js'
import { drawScene, layoutOf, hitTest, riverSlot } from '../draw/renderer.js'
import { DESIGN, TILE, ROW, CENTER, ANIM, FX, FX_COLOR } from '../constants.js'

/** 事件流 → 横幅宣告文案 */
const CALL_TEXT = { chi: '吃', pon: '碰', kan: '杠', ankan: '暗杠', kakan: '加杠' }

/**
 * 麻将主循环：Canvas 订阅状态重绘 + Vue 响应式镜像驱动 DOM
 * @param {import('vue').Ref<HTMLCanvasElement>} canvasRef
 * @param {{difficulty:string, length:string, seed?:number, onFinish?:Function}} opts
 */
export const useMahjong = (canvasRef, opts = {}) => {
  const game = createGame({ difficulty: opts.difficulty, length: opts.length, seed: opts.seed })
  const S = game.state

  const ui = reactive({
    phase: 'idle',
    turn: 0,
    turnCount: 0,
    wind: 'east',
    number: 1,
    honba: 0,
    riichiBets: 0,
    dealer: 0,
    wallLeft: 0,
    points: [10000, 10000],
    myTiles: [],
    drawn: null,
    myMelds: [],
    oppTiles: 0,
    oppMelds: [],
    river: [[], []],
    myRiichi: false,
    oppRiichi: false,
    seatWind: [27, 28],
    legal: [],
    actions: { tsumo: false, riichi: false, ankan: [], kakan: [], kyushu: false },
    response: null,
    result: null,
    final: null,
    thinking: false,
    autoPass: false,
    autoCut: false,
    hint: null,
    shanten: 8,
    waits: [],
    waitExact: true,
    permFuriten: false,
    tempFuriten: false,
    permHits: [],
    waitPlans: [],
    advance: [],
    dora: [],
    doraKinds: [],
    myDora: 0,
    tenpai: [false, false],
    furiten: false,
    announce: null,
    riichiPick: [],
    log: [],
    /* --- 调试面板 --- */
    oppTilesList: [],
    oppDrawn: null,
    oppShanten: 8,
    oppWaits: [],
    /** 各方指定的下一张摸牌（null = 随机） */
    forced: [null, null],
    /** 每种牌「还能再加几张」= 4 − 全区域已见 */
    avail: [],
    /** 每种牌在牌山里还有几张（换牌只能从牌山补给） */
    wallAvail: [],
    integrityTotal: 136,
  })

  const hover = ref(-1)
  let anim = null
  let ctx = null
  let raf = 0
  let timer = 0
  let ro = null
  let scale = 1
  let lastSeq = 0

  const clearTimer = () => {
    if (timer) { clearTimeout(timer); timer = 0 }
  }
  const later = (fn, ms) => {
    clearTimer()
    timer = setTimeout(() => { timer = 0; fn() }, ms)
  }

  const sync = () => {
    const me = S.players[0]
    const op = S.players[1]
    ui.autoPass = false
    ui.phase = S.phase
    ui.turn = S.turn
    ui.turnCount = S.turnCount
    ui.wind = S.round.wind
    ui.number = S.round.number
    ui.honba = S.round.honba
    ui.riichiBets = S.round.riichiBets
    ui.dealer = S.dealer
    ui.wallLeft = S.wall.length
    ui.points = [me.points, op.points]
    ui.myTiles = me.tiles.slice()
    ui.drawn = me.drawn
    ui.myMelds = me.melds.slice()
    ui.oppTiles = op.tiles.length
    ui.oppMelds = op.melds.slice()
    ui.river = [me.river.slice(), op.river.slice()]
    ui.myRiichi = me.riichi
    ui.oppRiichi = op.riichi
    ui.seatWind = [me.seatWind, op.seatWind]
    ui.legal = game.legalDiscards(0)
    ui.actions = S.phase === 'discard' && S.turn === 0 ? game.turnActions(0) : { tsumo: false, riichi: false, ankan: [], kakan: [], kyushu: false }
    ui.response = S.phase === 'response' && S.lastDiscard && game.other(S.lastDiscard.from) === 0
      ? {
        tile: S.lastDiscard.kind,
        from: S.lastDiscard.from,
        mode: S.lastDiscard.mode,
        ...game.responseActions(0, S.lastDiscard.kind, S.lastDiscard.mode),
      }
      : null
    ui.result = S.phase === 'over' ? S.result : null
    ui.final = S.phase === 'finished' ? S.finalResult : null
    if (ui.phase !== 'discard' || !ui.actions.riichi) ui.riichiPick = []

    const c = countsFrom(me.tiles)
    const info = handInfo(me)
    ui.shanten = info.shanten
    ui.waitExact = info.exact
    ui.permFuriten = info.perm
    ui.tempFuriten = info.temp
    ui.permHits = info.permHits.slice()
    ui.waitPlans = info.plans.map((pl) => ({
      discard: pl.discard,
      perm: pl.perm,
      ron: !pl.perm && !info.temp && pl.waits.some((w) => w.ron),
      tsumo: pl.waits.some((w) => w.tsumo),
      waits: pl.waits.map((w) => ({
        tile: w.tile, name: tileText(w.tile), remaining: remainingOf(w.tile),
        ron: w.ron, tsumo: w.tsumo, inRiver: w.inRiver, noYaku: w.noYaku,
      })),
    }))
    ui.waits = info.waits.map((w) => ({
      tile: w.tile, name: tileText(w.tile), remaining: remainingOf(w.tile),
      ron: w.ron, tsumo: w.tsumo, inRiver: w.inRiver, noYaku: w.noYaku,
    }))
    ui.advance = info.advance.map((t) => ({ tile: t, name: tileText(t), remaining: remainingOf(t) }))
    ui.thinking = false
    ui.dora = game.doraIndicators()
    ui.doraKinds = doraKindsOf(ui.dora)
    ui.myDora = countDora(c, me.melds, ui.dora)

    // 调试镜像：对手手牌 + 全区域清点（透视开着才顺带算 AI 的向听/待牌）
    ui.oppTilesList = op.tiles.slice()
    ui.oppDrawn = op.drawn
    ui.forced = S.forcedDraw.slice()
    const cen = game.tileCensus()
    ui.avail = cen.map((n) => 4 - n)
    ui.wallAvail = countsFrom(S.wall)
    ui.integrityTotal = cen.reduce((a, b) => a + b, 0)
    if (debug.reveal) {
      const ci = countsFrom(op.tiles)
      const settled = op.tiles.length === 13 - 3 * op.melds.length
      ui.oppShanten = shanten(ci, op.melds)
      ui.oppWaits = settled && ui.oppShanten === 0 ? winningTiles(ci, op.melds) : []
    } else {
      ui.oppShanten = 8
      ui.oppWaits = []
    }
    if (S.debugMiss) { debugSay(S.debugMiss.msg, 'err', S.debugMiss.tiles); S.debugMiss = null }

    // 听牌 / 振听（13 或 14 张时向听 0 都算「有至少一种切法能听」）
    ui.tenpai = [
      ui.shanten === 0,
      shanten(countsFrom(op.tiles), op.melds) === 0,
    ]
    ui.furiten = ui.permFuriten || ui.tempFuriten
    takeEvents()
  }

  /** 拉取新事件：副露 / 立直 / 杠 都要出横幅特效 */
  const takeEvents = () => {
    for (const e of S.events) {
      if (e.seq <= lastSeq) continue
      lastSeq = e.seq
      const who = e.player === 0 ? '你' : 'AI'
      let ev = null
      if (e.type === 'riichi') {
        ev = { text: '立 直', sub: `${who} 宣言听牌 · 押 1000 点`, color: FX_COLOR.riichi, player: e.player }
      } else if (CALL_TEXT[e.type]) {
        ev = {
          text: CALL_TEXT[e.type],
          sub: `${who} ${CALL_TEXT[e.type]} ${e.kind !== undefined ? tileText(e.kind) : ''}`,
          color: FX_COLOR.call,
          player: e.player,
        }
      }
      if (ev) {
        ui.announce = { ...ev, t0: performance.now() }
        ui.log.unshift({ ...ev, key: e.seq, at: Date.now() })
        if (ui.log.length > 12) ui.log.pop()
      }
    }
  }

  const remainingOf = (t) => {
    const v = game.visible(0)
    return v.remaining[t]
  }

  /**
   * 手牌的向听 / 待牌 / 进张，以及每张待牌**能不能荣和、能不能自摸**。
   *
   * 三条判定口径：
   * - **舍牌振听**：待牌里任何一张出现在自己牌河 → **全体待牌**都不能荣和（本局永久，除非换听）
   * - **同巡振听**：本巡放弃过能和的那张 → 到自己下次摸牌前全体不能荣和
   * - **无役**：凑齐牌型但没役也不能和。荣和/自摸分别判（自摸多一个门前清自摸和）
   * - 自摸不受振听限制，只受无役限制
   *
   * 14 张（还没打牌）时按「切一张之后」逐切法计算：
   * 待牌与能否荣和都取决于你最终切哪张，所以按切法分组出方案，再取并集。
   */
  const handInfo = (me) => {
    const counts = countsFrom(me.tiles)
    const riverSet = new Set(me.river.map((d) => d.kind))
    const temp = !!me.passedRon
    const dora = game.doraIndicators()
    const roundWind = game.roundWind()
    // 按手牌张数判断是否「刚摸牌」，比看 drawn 标记可靠（立直宣言时打的不一定是摸的那张）
    const base = 13 - 3 * me.melds.length

    /** 13 张手牌 c13 等来 t 时，荣和 / 自摸是否真的成役 */
    const winCheck = (c13, t) => {
      const cTsumo = c13.slice()
      cTsumo[t]++
      const common = {
        counts: c13, melds: me.melds, winTile: t,
        seatWind: me.seatWind, roundWind, doraIndicators: dora,
        flags: { riichi: me.riichi, ippatsu: me.ippatsu },
      }
      return {
        ron: !!judge({ ...common, isTsumo: false }),
        tsumo: !!judge({ ...common, counts: cTsumo, isTsumo: true }),
      }
    }

    /** 形状已定的 13 张：直接按当前待牌判定 */
    const settled = (c13) => {
      const u = ukeire(c13, me.melds)
      const hits = u.waits.filter((t) => riverSet.has(t))
      const perm = hits.length > 0
      return {
        shanten: u.shanten,
        advance: u.advance,
        exact: true,
        perm,
        temp,
        permHits: hits,
        plans: [],
        waits: u.waits.map((t) => {
          const w = winCheck(c13, t)
          return {
            tile: t,
            ron: !perm && !temp && w.ron,
            tsumo: w.tsumo,
            inRiver: riverSet.has(t),
            noYaku: !w.ron,
          }
        }),
      }
    }

    if (me.tiles.length <= base) return settled(counts)
    // 立直锁牌：手牌不能换，待牌由「切掉刚摸的那张」唯一决定
    if (me.riichi && me.drawn !== null) {
      const c2 = counts.slice()
      c2[me.drawn]--
      return settled(c2)
    }

    let best = 9
    for (let k = 0; k < 34; k++) {
      if (!counts[k]) continue
      const c2 = counts.slice()
      c2[k]--
      const s = shanten(c2, me.melds)
      if (s < best) best = s
    }
    const advance = new Set()
    // 每种「切完仍是最优向听」的切法，各自记一份待牌与该切法是否会导致舍牌振听
    const plans = []
    for (let k = 0; k < 34; k++) {
      if (!counts[k]) continue
      const c2 = counts.slice()
      c2[k]--
      if (shanten(c2, me.melds) !== best) continue
      const u = ukeire(c2, me.melds)
      for (const t of u.advance) advance.add(t)
      if (!u.waits.length) continue
      const perm = u.waits.some((t) => riverSet.has(t))
      plans.push({
        discard: k,
        perm,
        // 该切法下每张待牌的荣和/自摸可行性；已打过的那张标出来
        waits: u.waits.map((t) => {
          const w = winCheck(c2, t)
          return {
            tile: t,
            ron: !perm && !temp && w.ron,
            tsumo: w.tsumo,
            inRiver: riverSet.has(t),
            noYaku: !w.ron,
          }
        }),
      })
    }
    const all = [...new Set(plans.flatMap((pl) => pl.waits.map((w) => w.tile)))].sort((a, b) => a - b)
    const hits = all.filter((t) => riverSet.has(t))
    return {
      shanten: best,
      advance: [...advance].sort((a, b) => a - b),
      // 还没打牌：待牌是「各种切法各自待牌」的并集，不等于现在就听这些牌
      exact: false,
      // 若所有听牌切法都带振听 → 怎么切都只能自摸
      perm: plans.length > 0 && plans.every((pl) => pl.perm),
      temp,
      permHits: hits,
      // 逐切法方案：立直选牌时用来比较「切这张 → 听什么、能不能荣和」
      plans,
      // 并集：只要存在一种切法能让这张荣和 / 自摸，就算行
      waits: all.map((t) => {
        const rows = plans.flatMap((pl) => pl.waits.filter((w) => w.tile === t))
        return {
          tile: t,
          ron: rows.some((w) => w.ron),
          tsumo: rows.some((w) => w.tsumo),
          inRiver: riverSet.has(t),
          noYaku: !rows.some((w) => w.ron),
        }
      }),
    }
  }

  /** 记牌器：已见牌 / 未确认剩余 / 役种进度 */
  const recorder = computed(() => {
    const v = game.visible(0)
    const me = S.players[0]
    const c = countsFrom(me.tiles)
    const pr = analyzeProgress({
      counts: c, melds: me.melds, menzen: game.isMenzen(me),
      remaining: v.remaining, seatWind: me.seatWind,
      roundWind: game.roundWind(), riichi: me.riichi,
    })
    return { seen: v.seen, remaining: v.remaining, ...pr }
  })

  /* ------------------------- 驱动 ------------------------- */

  const pump = () => {
    clearTimer()
    if (S.phase === 'finished') { sync(); return }
    if (S.phase === 'over') { sync(); return }
    if (S.phase === 'draw') {
      if (S.turn === 0) { game.doDraw(); sync(); pump(); return }
      ui.thinking = true
      later(() => { game.doDraw(); sync(); pump() }, thinkDelay(S.difficulty))
      return
    }
    if (S.phase === 'discard') {
      if (S.turn === 0) {
        sync()
        // 立直锁牌后只能摸切：唯一可打的牌自动打出，不需要玩家点
        const noKan = !ui.actions.ankan.length && !ui.actions.kakan.length
        if (ui.myRiichi && !ui.actions.tsumo && noKan && ui.legal.length === 1) {
          ui.autoCut = true
          const kind = ui.legal[0]
          later(() => {
            ui.autoCut = false
            flyTile(0, kind)
            game.doDiscard(kind)
            sync()
            pump()
          }, ANIM.autoCut)
        }
        return
      }
      ui.thinking = true
      later(() => { aiTurn(); sync(); pump() }, thinkDelay(S.difficulty))
      return
    }
    if (S.phase === 'response') {
      const responder = game.other(S.lastDiscard.from)
      if (responder === 0) {
        sync()
        // 无牌可吃/碰/杠/和时不弹按钮，短暂延迟后自动过牌，直接轮转到自己
        if (!canRespond()) {
          ui.autoPass = true
          later(() => { game.doPass(0); sync(); pump() }, ANIM.autoPass)
        }
        return
      }
      ui.thinking = true
      later(() => { aiRespond(); sync(); pump() }, thinkDelay(S.difficulty) * 0.7)
      return
    }
    sync()
  }

  /** 玩家对当前舍牌是否存在任何可响应的动作 */
  const canRespond = () => {
    const r = ui.response
    return !!r && (r.ron || r.pon || r.kan || r.chi.length > 0)
  }

  const aiTurn = () => {
    const idx = S.turn
    const p = S.players[idx]
    const acts = game.turnActions(idx)
    if (acts.tsumo) { game.doTsumo(idx); return }
    const vis = game.visible(idx)
    if (acts.riichi && shouldRiichi(game, p, { difficulty: S.difficulty, remaining: vis.remaining, turn: S.turnCount })) {
      const k = chooseRiichiDiscard(game, p, { remaining: vis.remaining })
      if (k !== null) { flyTile(idx, k); game.doRiichi(k); return }
    }
    if (acts.ankan.length && S.difficulty !== 'easy') {
      const k = chooseSelfKan(game, p, { difficulty: S.difficulty })
      if (k) { game.doAnkan(idx, k.kind); return }
    }
    const k = chooseDiscard(game, p, { difficulty: S.difficulty, remaining: vis.remaining, seen: vis.seen, turn: S.turnCount })
    const legal = game.legalDiscards(idx)
    const pick = legal.includes(k) ? k : legal[0]
    flyTile(idx, pick)
    game.doDiscard(pick)
  }

  const aiRespond = () => {
    const ld = S.lastDiscard
    const idx = game.other(ld.from)
    const p = S.players[idx]
    const vis = game.visible(idx)
    const call = chooseCall(game, p, ld.kind, { difficulty: S.difficulty, remaining: vis.remaining, houtei: ld.houtei })
    if (call.type === 'ron') { game.doRon(idx); return }
    if (call.type === 'pon' && ld.mode === 'discard') { game.doPon(idx); return }
    if (call.type === 'chi' && ld.mode === 'discard') { game.doChi(idx, call.kinds); return }
    if (call.type === 'kan' && ld.mode === 'discard') { game.doKanOpen(idx); return }
    game.doPass(idx)
  }

  /** 打牌飞行动画：从手牌位置飞到牌河末位 */
  const flyTile = (player, kind) => {
    const L = layoutOf(S)
    const rect = player === 0 ? L.myRiver : L.oppRiver
    const slot = riverSlot(rect, S.players[player].river.length)
    const from = player === 0
      ? { x: CENTER.x - TILE.hand.w / 2, y: ROW.myHand, w: TILE.hand.w, h: TILE.hand.h }
      : { x: CENTER.x - TILE.back.w / 2, y: ROW.oppBack, w: TILE.back.w, h: TILE.back.h }
    anim = { tile: kind, player, index: S.players[player].river.length, from, to: slot, t0: performance.now() }
    setTimeout(() => { anim = null }, ANIM.discard + 40)
  }

  /* ------------------------- 玩家操作 ------------------------- */

  const need = (cond) => cond

  const playerDiscard = (index) => {
    if (S.phase !== 'discard' || S.turn !== 0) return
    const kind = S.players[0].tiles[index]
    if (!game.legalDiscards(0).includes(kind)) return
    flyTile(0, kind)
    game.doDiscard(kind)
    sync()
    pump()
  }

  /** 立直：进入选牌模式（可打的牌被限制为「切完仍听牌」的那些） */
  const beginRiichi = () => {
    if (!ui.actions.riichi) return
    ui.riichiPick = game.riichiDiscards(0)
  }
  const cancelRiichi = () => { ui.riichiPick = [] }

  const playerRiichi = (index) => {
    if (!ui.actions.riichi) return
    const kind = ui.riichiPick.length
      ? (index >= 0 ? S.players[0].tiles[index] : chooseRiichiDiscard(game, S.players[0], { remaining: game.visible(0).remaining }))
      : chooseRiichiDiscard(game, S.players[0], { remaining: game.visible(0).remaining })
    if (kind === null || kind === undefined) { cancelRiichi(); return }
    if (!ui.riichiPick.includes(kind)) { cancelRiichi(); return }
    ui.riichiPick = []
    flyTile(0, kind)
    game.doRiichi(kind)
    sync()
    pump()
  }

  const playerTsumo = () => {
    if (!ui.actions.tsumo) return
    game.doTsumo(0)
    sync()
  }
  const playerKyushu = () => {
    if (!ui.actions.kyushu) return
    game.doKyushu()
    sync()
  }
  const playerAnkan = (kind) => {
    if (!ui.actions.ankan.includes(kind)) return
    game.doAnkan(0, kind)
    sync()
    pump()
  }
  const playerKakan = (kind) => {
    if (!ui.actions.kakan.includes(kind)) return
    game.doKakan(0, kind)
    sync()
    pump()
  }

  const playerRon = () => {
    if (!ui.response || !ui.response.ron) return
    game.doRon(0)
    sync()
  }
  const playerPon = () => {
    if (!ui.response || !ui.response.pon) return
    game.doPon(0)
    sync()
    pump()
  }
  const playerKanOpen = () => {
    if (!ui.response || !ui.response.kan) return
    game.doKanOpen(0)
    sync()
    pump()
  }
  const playerChi = (kinds) => {
    if (!ui.response || !ui.response.chi.length) return
    game.doChi(0, kinds)
    sync()
    pump()
  }
  const playerPass = () => {
    if (!ui.response) return
    game.doPass(0)
    sync()
    pump()
  }

  /** 结算弹窗确认 → 推进下一局 */
  const confirmResult = () => {
    if (S.phase !== 'over') return
    game.nextHand()
    sync()
    pump()
  }

  /* ------------------------- 调试动作 ------------------------- */

  /** 改牌后统一：出提示 + 刷新镜像（牌用 tiles 传，界面画牌面而不是 5m 这种简写） */
  const afterDebug = (res) => {
    sync()
    if (res && res.msg) debugSay(res.msg, res.ok ? 'ok' : 'err', res.tiles || [])
    return res
  }

  /** 换手牌某张：1:1 置换，全区域牌数守恒由引擎把关 */
  const debugSwapTile = (idx, pos, kind) => {
    const picking = ui.riichiPick.length > 0
    const res = game.debugSwap(idx, pos, kind)
    afterDebug(res)
    // 换完手牌会重排，选中框要跟着走到新的位置，否则会指向别的牌
    if (res.ok && res.pos >= 0 && idx === debug.target) debug.slot = res.pos
    // 正在挑立直宣言牌：换牌后候选要重算（否则会留着已经不在手里的牌）
    if (res.ok && picking) ui.riichiPick = game.riichiDiscards(0)
    return res
  }

  const debugSetDraw = (idx, kind) => afterDebug(game.debugSetDraw(idx, kind))
  const debugClearDraw = (idx) => afterDebug(game.debugClearDraw(idx))

  /* ------------------------- 画布 ------------------------- */

  const setupCanvas = () => {
    const cv = canvasRef.value
    if (!cv) return
    // 父节点是牌桌舞台（.board），其高度已扣掉操作行与听牌条
    const parent = cv.parentElement
    const availW = parent ? parent.clientWidth : DESIGN.w
    const availH = parent ? parent.clientHeight : DESIGN.h
    if (availW <= 0 || availH <= 0) return
    scale = Math.min(availW / DESIGN.w, availH / DESIGN.h) || 1
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cv.width = Math.round(DESIGN.w * scale * dpr)
    cv.height = Math.round(DESIGN.h * scale * dpr)
    cv.style.width = `${DESIGN.w * scale}px`
    cv.style.height = `${DESIGN.h * scale}px`
    ctx = cv.getContext('2d')
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0)
  }

  const frame = () => {
    if (ctx) {
      drawScene(ctx, S, {
        hover: hover.value, anim, hint: ui.hint,
        announce: ui.announce, tenpai: ui.tenpai, riichiPick: ui.riichiPick,
        furiten: ui.permFuriten ? 'perm' : ui.tempFuriten ? 'temp' : false,
        revealOpp: debug.reveal, debug: debug.open,
      })
    }
    raf = requestAnimationFrame(frame)
  }

  const toLocal = (e) => {
    const cv = canvasRef.value
    const r = cv.getBoundingClientRect()
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }
  }

  const onMove = (e) => {
    if (!ctx || S.phase !== 'discard' || S.turn !== 0) { hover.value = -1; return }
    const p = toLocal(e)
    const hit = hitTest(S, layoutOf(S), p.x, p.y)
    hover.value = hit && hit.kind === 'hand' ? hit.index : -1
  }

  const onClick = (e) => {
    if (S.phase !== 'discard' || S.turn !== 0) return
    const p = toLocal(e)
    const hit = hitTest(S, layoutOf(S), p.x, p.y)
    if (hit && hit.kind === 'hand') {
      if (ui.riichiPick.length) playerRiichi(hit.index)
      else playerDiscard(hit.index)
    }
  }

  const start = () => {
    game.startMatch()
    sync()
    pump()
  }

  // 透视开关会影响「对手手牌 / AI 听牌角标」的镜像内容，改完要立刻重算
  watch(() => debug.reveal, () => sync())

  onMounted(() => {
    setupCanvas()
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', setupCanvas)
    // 舞台高度会随「听牌条 / 立直方案 / 侧栏」出现与消失而变，画布必须跟着重算
    if (typeof ResizeObserver !== 'undefined') {
      const target = canvasRef.value ? canvasRef.value.parentElement : null
      if (target) {
        ro = new ResizeObserver(() => setupCanvas())
        ro.observe(target)
      }
    }
  })
  onUnmounted(() => {
    cancelAnimationFrame(raf)
    clearTimer()
    if (ro) { ro.disconnect(); ro = null }
    window.removeEventListener('resize', setupCanvas)
  })

  return {
    ui, hover, recorder, game,
    start, sync, pump, confirmResult, beginRiichi, cancelRiichi,
    playerDiscard, playerRiichi, playerTsumo, playerKyushu, playerAnkan, playerKakan,
    playerRon, playerPon, playerKanOpen, playerChi, playerPass,
    onMove, onClick, remainingOf,
    debugSwapTile, debugSetDraw, debugClearDraw,
    aiParams: AI_PARAMS[S.difficulty],
  }
}
