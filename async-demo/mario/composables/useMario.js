import { reactive, onMounted, onUnmounted } from 'vue'
import { createGame, step, restartLevel, continueGame } from '../game.js'
import { drawScene } from '../draw/renderer.js'
import { VIEW_W, VIEW_H } from '../constants.js'
import { useDebug } from './useDebug.js'

const FIXED = 1000 / 60

/** 马里奥主循环：固定步长推进 + 输入采集 + HUD 同步 */
export const useMario = (canvasRef, opts = {}) => {
  const { flags: debug, debugOpen, toggleDebug } = useDebug()
  const game = createGame({ ...opts, debug })
  const hud = reactive({
    score: 0, coins: 0, lives: game.lives, time: 0, form: 'small',
    levelName: game.level.name, levelIndex: game.levelIndex, status: 'play',
    star: 0, message: '', paused: false, mode: game.mode, progress: 0,
  })

  const input = { left: false, right: false, jump: false, jumpPressed: false, run: false, down: false, fire: false }
  const keyMap = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyK: 'jump',
    ShiftLeft: 'run', ShiftRight: 'run', KeyJ: 'run',
    ArrowDown: 'down', KeyS: 'down',
    KeyX: 'fire', KeyL: 'fire',
  }

  let ctx = null
  let raf = 0
  let last = 0
  let acc = 0

  const onKeyDown = (e) => {
    // 面板输入框里打字时不要触发游戏按键 / 面板开关
    if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return
    if (e.code === 'Backquote') { e.preventDefault(); toggleDebug(); return }
    const k = keyMap[e.code]
    if (k) {
      e.preventDefault()
      if (k === 'jump' && !input.jump) input.jumpPressed = true
      if (k === 'fire') input.fire = true
      input[k] = true
      return
    }
    if (e.code === 'KeyP') togglePause()
    else if (e.code === 'KeyR') restart()
    else if (e.code === 'Escape') togglePause()
  }
  const onKeyUp = (e) => {
    const k = keyMap[e.code]
    if (!k) return
    input[k] = false
    if (k === 'fire') input.fire = false
  }
  const onBlur = () => {
    for (const k of Object.keys(input)) input[k] = false
  }

  const setPaused = (v) => {
    if (hud.status === 'over' || hud.status === 'win') return
    game.paused = !!v
    hud.paused = game.paused
  }

  const togglePause = () => setPaused(!game.paused)

  const restart = () => {
    restartLevel(game)
    hud.paused = false
  }

  const retry = () => {
    continueGame(game)
    hud.paused = false
  }

  const syncHud = () => {
    hud.score = game.score
    hud.coins = game.coins
    hud.lives = game.lives
    hud.time = Math.max(0, Math.ceil(game.timeLeft))
    hud.form = game.player.form
    hud.levelName = game.level.name
    hud.levelIndex = game.levelIndex
    hud.status = game.status
    hud.star = game.player.star
    hud.message = game.message
    hud.paused = game.paused
    const total = Math.max(1, game.level.w * 32)
    hud.progress = Math.min(100, Math.floor((game.player.x / total) * 100))
  }

  const frame = (t) => {
    raf = requestAnimationFrame(frame)
    if (!last) last = t
    acc += Math.min(t - last, 120)
    last = t
    // 调试倍速：改的是每帧消耗的时间片，保持固定步长推进（物理表现不变）
    const rate = FIXED / (debug.speed || 1)
    const maxStep = Math.ceil(6 * (debug.speed || 1))
    let guard = 0
    while (acc >= rate && guard++ < maxStep) {
      step(game, input)
      input.jumpPressed = false
      input.fire = false
      acc -= rate
    }
    syncHud()
    if (ctx) drawScene(ctx, game)
  }

  onMounted(() => {
    const cv = canvasRef.value
    if (!cv) return
    cv.width = VIEW_W
    cv.height = VIEW_H
    ctx = cv.getContext('2d')
    ctx.imageSmoothingEnabled = false
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    raf = requestAnimationFrame(frame)
  })

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
  })

  return { game, hud, input, togglePause, setPaused, restart, retry, debug, debugOpen, toggleDebug }
}
