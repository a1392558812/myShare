<template>
  <div class="game-main" ref="containerRef">
    <canvas ref="canvasRef"></canvas>

    <div class="hud-top">
      <div class="player-card" :class="{ active: state.turn === 0 && !state.over }">
        <div class="p-name">玩家</div>
        <div class="p-group">{{ groupLabel(0) }}</div>
        <div class="p-remain">还剩 {{ remainOf(0) }} 颗</div>
      </div>
      <div class="hud-mid">
        <div class="mid-turn">{{ state.over ? '本局结束' : state.turn === 0 ? '你的回合' : '对手回合' }}</div>
        <div class="mid-round">{{ state.isBreak ? '开球' : state.openTable ? '开放台面' : '已定组' }}</div>
      </div>
      <div class="player-card" :class="{ active: state.turn === 1 && !state.over }">
        <div class="p-name">电脑</div>
        <div class="p-group">{{ groupLabel(1) }}</div>
        <div class="p-remain">还剩 {{ remainOf(1) }} 颗</div>
      </div>
    </div>

    <div class="hud-pocket">
      <div class="pk-row">
        <span class="pk-tag">全色</span>
        <span v-for="n in state.pottedSolid" :key="'s' + n" class="pk-ball solid">{{ n }}</span>
      </div>
      <div class="pk-row">
        <span class="pk-tag">花色</span>
        <span v-for="n in state.pottedStripe" :key="'t' + n" class="pk-ball stripe">{{ n }}</span>
      </div>
    </div>

    <transition name="toast">
      <div v-if="state.message" class="toast">{{ state.message }}</div>
    </transition>

    <div class="hud-bottom">
      <div class="power-bar">
        <div class="power-fill" :style="{ width: (state.power * 100).toFixed(1) + '%' }"></div>
      </div>
      <div class="hint">{{ hintText }}</div>
    </div>

    <div class="hud-debug">
      <div class="dbg-title">调试</div>
      <label class="dbg-item">
        <input type="checkbox" v-model="state.showGuide" />
        <span>瞄准辅助线</span>
      </label>
      <label class="dbg-item">
        <input type="checkbox" v-model="state.showIds" />
        <span>标记黑八</span>
      </label>
      <button class="dbg-btn" @click="onRerack">重新开球</button>
      <button class="dbg-btn" @click="$emit('restart')">返回首页</button>
    </div>

    <div v-if="state.pendingGroupFor === 0" class="overlay">
      <div class="panel">
        <div class="title">选择你的球组</div>
        <div class="sub">这一杆同时打进了全色和花色，由你挑一组</div>
        <div class="btn-row">
          <button class="btn" @click="game.chooseGroup('solid')">打全色 1-7</button>
          <button class="btn btn-alt" @click="game.chooseGroup('stripe')">打花色 9-15</button>
        </div>
      </div>
    </div>

    <div v-else-if="state.over" class="overlay">
      <div class="panel">
        <div class="title" :class="{ lose: state.winner !== 0 }">
          {{ state.winner === 0 ? '你赢了' : '你输了' }}
        </div>
        <div class="sub">{{ state.overText }}</div>
        <div class="btn-row">
          <button class="btn" @click="onRerack">再来一局</button>
          <button class="btn btn-alt" @click="$emit('restart')">返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useBilliards, SOLID } from '../composables/useBilliards.js'
import { render, screenToTable } from '../draw/renderer.js'

const props = defineProps({
  /** 猜拳胜者：0 玩家先开球，1 电脑先开球 */
  firstPlayer: { type: Number, default: 0 },
})

defineEmits(['restart'])

const game = useBilliards()
const state = game.state

const containerRef = ref(null)
const canvasRef = ref(null)

let ctx = null
let rafId = null
let resizeObserver = null
let viewW = 800
let viewH = 600
let dpr = 1
let lastTs = 0

const groupLabel = (p) => {
  const g = state.groups[p]
  if (!g) return '未分组'
  return g === SOLID ? '全色 1-7' : '花色 9-15'
}

const remainOf = (p) => {
  const g = state.groups[p]
  if (!g) return 7
  return state.remain[g]
}

const hintText = computed(() => {
  if (state.over) return ''
  if (state.phase === 'place') {
    return state.ballInHandKitchen
      ? '点击开球线左侧区域摆放母球'
      : '犯规了，点击台面任意位置摆放母球（自由球）'
  }
  if (state.phase === 'rolling') return '球正在滚动…'
  if (state.turn === 1) return '对手正在瞄准…'
  return '移动鼠标瞄准 · 按住左键蓄力 · 松手击球'
})

const onRerack = () => game.reset(props.firstPlayer)

const resizeCanvas = () => {
  const container = containerRef.value
  if (!container) return
  const rect = container.getBoundingClientRect()
  dpr = window.devicePixelRatio || 1
  viewW = Math.max(200, rect.width)
  viewH = Math.max(200, rect.height)
  canvasRef.value.width = Math.round(viewW * dpr)
  canvasRef.value.height = Math.round(viewH * dpr)
  canvasRef.value.style.width = viewW + 'px'
  canvasRef.value.style.height = viewH + 'px'
  ctx = canvasRef.value.getContext('2d')
}

const toTable = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  return screenToTable(e.clientX - rect.left, e.clientY - rect.top)
}

const handleMouseMove = (e) => {
  const p = toTable(e)
  game.setPointer(p.x, p.y)
}

const handleMouseDown = (e) => {
  if (e.button !== 0) return
  const p = toTable(e)
  game.setPointer(p.x, p.y)
  if (state.phase === 'place') game.placeCue(p.x, p.y)
  else if (state.phase === 'aim') game.beginCharge()
}

const handleMouseUp = () => game.releaseCharge()
const handleContextMenu = (e) => e.preventDefault()

const handleKeyDown = (e) => {
  if (e.code === 'Space') {
    e.preventDefault()
    if (!e.repeat) game.beginCharge()
    return
  }
  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
    e.preventDefault()
    const step = e.shiftKey ? 0.004 : 0.022
    game.nudgeAim(e.code === 'ArrowLeft' ? -step : step)
  }
}

const handleKeyUp = (e) => {
  if (e.code === 'Space') game.releaseCharge()
}

onMounted(() => {
  nextTick(() => {
    game.reset(props.firstPlayer)
    resizeCanvas()

    resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(containerRef.value)

    const canvas = canvasRef.value
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    const loop = (ts) => {
      if (!lastTs) lastTs = ts
      const dt = Math.min(0.05, (ts - lastTs) / 1000)
      lastTs = ts
      game.update(dt)
      render(ctx, game.getState(), viewW, viewH, dpr)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
  })
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  if (resizeObserver) resizeObserver.disconnect()
  const canvas = canvasRef.value
  if (canvas) {
    canvas.removeEventListener('mousemove', handleMouseMove)
    canvas.removeEventListener('mousedown', handleMouseDown)
    canvas.removeEventListener('contextmenu', handleContextMenu)
  }
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<style scoped lang="scss">
.game-main {
  width: 100%;
  height: 100%;
  position: relative;
  background: #070a0e;
  overflow: hidden;
  user-select: none;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

canvas {
  display: block;
  cursor: crosshair;
}

.hud-top {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: stretch;
  gap: 14px;
  z-index: 5;
}

.player-card {
  min-width: 132px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(6, 14, 12, 0.72);
  border: 1px solid rgba(120, 220, 180, 0.22);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  text-align: center;
  color: #9fb0ad;
  transition: all 0.25s;

  &.active {
    border-color: #4ce0a8;
    background: rgba(10, 40, 30, 0.86);
    color: #eafff6;
    box-shadow: 0 0 14px rgba(76, 224, 168, 0.35);
  }
}

.p-name {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
}

.p-group {
  margin-top: 2px;
  font-size: 12px;
  color: #4ce0a8;
  font-family: monospace;
}

.p-remain {
  margin-top: 2px;
  font-size: 11px;
  opacity: 0.75;
}

.hud-mid {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  color: #cfe6dd;

  .mid-turn {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 2px;
  }

  .mid-round {
    font-size: 11px;
    opacity: 0.6;
    margin-top: 2px;
  }
}

.hud-pocket {
  position: absolute;
  left: 16px;
  bottom: 16px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(6, 14, 12, 0.7);
  border: 1px solid rgba(120, 220, 180, 0.18);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 5;
}

.pk-row {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  max-width: 260px;
}

.pk-tag {
  font-size: 11px;
  color: #9fb0ad;
  width: 30px;
  flex-shrink: 0;
}

.pk-ball {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 10px;
  font-family: monospace;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1a1a1a;
  background: #fbf8f0;
  border: 1px solid rgba(0, 0, 0, 0.35);
}

.toast {
  position: absolute;
  top: 108px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  border-radius: 999px;
  background: rgba(8, 20, 18, 0.9);
  border: 1px solid rgba(120, 220, 180, 0.3);
  color: #d9fff1;
  font-size: 13px;
  letter-spacing: 1px;
  white-space: nowrap;
  z-index: 6;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}

.hud-bottom {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 5;
}

.power-bar {
  width: 260px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  overflow: hidden;
}

.power-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ce0a8, #f4c400 60%, #e0402a);
  transition: width 0.04s linear;
}

.hint {
  font-size: 12px;
  color: rgba(220, 240, 232, 0.7);
  letter-spacing: 1px;
}

.hud-debug {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(6, 14, 12, 0.72);
  border: 1px solid rgba(120, 220, 180, 0.18);
  color: #cfe6dd;
  font-size: 12px;
  font-family: monospace;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 5;
}

.dbg-title {
  color: #4ce0a8;
  letter-spacing: 2px;
  font-size: 11px;
}

.dbg-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  input {
    cursor: pointer;
    accent-color: #4ce0a8;
  }
}

.dbg-btn {
  padding: 4px 8px;
  font-size: 11px;
  font-family: monospace;
  color: #06120e;
  background: #4ce0a8;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #7ff0c6;
  }
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3, 8, 7, 0.7);
  z-index: 10;
}

.panel {
  padding: 28px 36px;
  border-radius: 8px;
  background: rgba(8, 20, 17, 0.94);
  border: 1px solid rgba(76, 224, 168, 0.35);
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.title {
  font-size: 28px;
  color: #4ce0a8;
  letter-spacing: 4px;
  margin-bottom: 10px;

  &.lose {
    color: #e0604a;
  }
}

.sub {
  font-size: 13px;
  color: #b9cfc7;
  margin-bottom: 20px;
}

.btn-row {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.25s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #4ce0a8;
  color: #06120e;

  &:hover {
    background: #7ff0c6;
  }
}

.btn-alt {
  background: transparent;
  color: #4ce0a8;
  border: 1px solid #4ce0a8;

  &:hover {
    background: rgba(76, 224, 168, 0.12);
  }
}
</style>
