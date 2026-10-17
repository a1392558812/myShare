import { reactive, onMounted, onUnmounted } from 'vue'
import {
  createGame, step, trySelect, trySwap, serialize, takeSfx,
  goalProgress, resetGame,
} from '../game.js'
import { drawScene, layoutOf } from '../draw/renderer.js'
import { CELL, BOARD_PAD } from '../constants.js'
import { playSfx } from '../audio.js'

const FIXED = 1000 / 60

/** 三消主循环：固定步长推进 + 指针输入 + HUD 同步 */
export const useMatch3 = (canvasRef, opts = {}) => {
  const level = opts.level
  const game = createGame({ level, snapshot: opts.snapshot, carry: opts.carry, buffs: opts.buffs })
  game.cell = CELL
  const L = layoutOf(game, CELL, BOARD_PAD)

  const hud = reactive({
    levelId: level.id,
    levelName: level.name,
    score: 0,
    steps: game.steps,
    maxSteps: level.steps,
    goals: goalProgress(game),
    status: 'play',
    combo: 0,
    paused: false,
    result: null,
    shuffling: false,
    endless: !!level.endless,
    stage: level.stage || 1,
    totalScore: game.totalScore,
    buffs: game.buffs || {},
    maxMult: game.maxMult,
  })

  let ctx = null
  let raf = 0
  let last = 0
  let acc = 0
  let now = 0
  let goalSig = ''
  let drag = null
  let stageCleared = false

  const setupCanvas = () => {
    const cv = canvasRef.value
    if (!cv) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cv.width = Math.round(L.w * dpr)
    cv.height = Math.round(L.h * dpr)
    cv.style.width = `${L.w}px`
    cv.style.height = `${L.h}px`
    ctx = cv.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const syncHud = () => {
    if (hud.score < game.score) {
      hud.score = Math.min(game.score, hud.score + Math.max(1, Math.ceil((game.score - hud.score) * 0.2)))
    } else if (hud.score > game.score) {
      hud.score = game.score
    }
    hud.steps = game.steps
    hud.combo = game.combo
    hud.shuffling = game.phase === 'shuffle'
    hud.totalScore = game.totalScore + game.score
    const sig = `${game.score}|${game.cleared.join(',')}`
    if (sig !== goalSig) {
      goalSig = sig
      hud.goals = goalProgress(game)
    }
    if (game.status !== 'play' && !hud.result) {
      // 无尽模式通关不弹结算，直接通知外层推进到下一层
      // 只通知一次：终局后 syncHud 每帧仍会跑，不锁住会把外层的切层定时器无限重置
      if (game.endless && game.result.win) {
        if (stageCleared) return
        stageCleared = true
        hud.status = game.status
        playSfx('win')
        if (opts.onStageClear) opts.onStageClear(game.result)
        return
      }
      hud.result = game.result
      hud.status = game.status
      playSfx(game.result.win ? 'win' : 'lose')
      if (opts.onResult) opts.onResult(game.result)
    }
  }

  const drainSfx = () => {
    const list = takeSfx(game)
    if (!list) return
    for (const s of list) playSfx(s.type, s)
  }

  const frame = (t) => {
    raf = requestAnimationFrame(frame)
    if (!last) last = t
    let dt = t - last
    last = t
    if (dt > 200) dt = 200
    now += dt
    if (!hud.paused && game.status === 'play') {
      acc += dt
      let guard = 0
      while (acc >= FIXED && guard++ < 8) {
        step(game, FIXED)
        acc -= FIXED
        drainSfx()
      }
    } else {
      acc = 0
    }
    syncHud()
    if (ctx) drawScene(ctx, game, L, now)
  }

  /** 屏幕坐标 → 棋盘格子 */
  const cellAt = (clientX, clientY) => {
    const cv = canvasRef.value
    if (!cv) return null
    const rect = cv.getBoundingClientRect()
    const scale = rect.width / L.w
    const bx = (clientX - rect.left) / scale - L.pad
    const by = (clientY - rect.top) / scale - L.pad
    const c = Math.floor(bx / CELL)
    const r = Math.floor(by / CELL)
    if (r < 0 || r >= game.rows || c < 0 || c >= game.cols) return null
    return [r, c]
  }

  const onPointerDown = (e) => {
    if (hud.paused || game.status !== 'play') return
    const cell = cellAt(e.clientX, e.clientY)
    if (!cell) return
    drag = { cell, x: e.clientX, y: e.clientY, done: false }
  }

  const onPointerMove = (e) => {
    if (!drag || drag.done) return
    const cv = canvasRef.value
    if (!cv) return
    const scale = cv.getBoundingClientRect().width / L.w
    const threshold = (CELL * scale) / 3
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return
    drag.done = true
    const [r, c] = drag.cell
    if (Math.abs(dx) >= Math.abs(dy)) trySwap(game, r, c, r, c + Math.sign(dx))
    else trySwap(game, r, c, r + Math.sign(dy), c)
  }

  const onPointerUp = (e) => {
    if (!drag) return
    const d = drag
    drag = null
    if (d.done) return
    const cell = cellAt(e.clientX, e.clientY)
    if (cell) trySelect(game, cell[0], cell[1])
  }

  const onKey = (e) => {
    if (e.code === 'Escape' || e.code === 'KeyP') togglePause()
  }

  const togglePause = () => {
    if (game.status !== 'play') return
    hud.paused = !hud.paused
  }

  const restart = () => {
    resetGame(game)
    hud.score = 0
    hud.steps = game.steps
    hud.result = null
    hud.status = 'play'
    hud.combo = 0
    hud.paused = false
    goalSig = ''
    stageCleared = false
    hud.goals = goalProgress(game)
  }

  onMounted(() => {
    setupCanvas()
    const cv = canvasRef.value
    if (cv) {
      cv.addEventListener('pointerdown', onPointerDown)
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
      cv.addEventListener('pointercancel', onPointerUp)
    }
    window.addEventListener('keydown', onKey)
    raf = requestAnimationFrame(frame)
  })

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    const cv = canvasRef.value
    if (cv) {
      cv.removeEventListener('pointerdown', onPointerDown)
      cv.removeEventListener('pointercancel', onPointerUp)
    }
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('keydown', onKey)
  })

  return {
    game,
    hud,
    layout: L,
    restart,
    togglePause,
    snapshot: () => serialize(game),
  }
}
