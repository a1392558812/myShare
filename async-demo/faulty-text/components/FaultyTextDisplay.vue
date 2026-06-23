<template>
  <div class="preview-area" :style="styleVars">
    <div v-if="!hasStarted" class="placeholder-text">
      {{ emptyText }}
    </div>

    <div v-else class="text-display" :style="{ fontSize: fontSize + 'px' }">
      <span v-for="(item, index) in charList" :key="index" class="char-item" :class="{
        'char-glitch': !item.recovered,
        'char-normal': item.recovered,
        [`glitch-level-${glitchIntensity}`]: !item.recovered
      }" :data-text="item.glitchChar">{{ item.recovered ? item.original : item.glitchChar }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

/**
 * Props:
 *   text              {String} - 要展示的原始文字
 *   charConfig        {Object} - 字符配置
 *   emptyText         {String} - 空状态占位文字
 *   duration          {Number} - 逐字恢复总时长（秒）
 *   glitchIntensity   {Number} - 故障强度 1-5
 *   fontSize          {Number} - 字体大小（px）
 *   glitchTextColor   {String} - 故障文字主色
 *   glitchBeforeColor {String} - ::before 描边色
 *   glitchAfterColor  {String} - ::after 描边色
 *   glitchGlowColor   {String} - 晕光色（空串跟随主色）
 *   customStyles      {Object} - 自定义样式
 */
const props = defineProps({
  text: { type: String, default: '' },
  charConfig: {
    type: Object,
    default: () => ({
      glitchChars: '█▓▒░▀▄▌▐■□▪▫◆◇○●◎◉①②③④⑤⑥⑦⑧⑨⑩※§¶†‡@#$%&*?!~',
      cjkGlitch: '传奇锟斤拷锟斤拷！？＃＄％＆＊◉▓░▒█',
    })
  },
  emptyText: { type: String, default: '在左侧输入文字后点击「开始播放」' },
  duration: { type: Number, default: 3 },
  glitchIntensity: { type: Number, default: 3 },
  fontSize: { type: Number, default: 32 },
  glitchTextColor: { type: String, default: '#ff3c3c' },
  glitchBeforeColor: { type: String, default: '#00ffff' },
  glitchAfterColor: { type: String, default: '#ff00ff' },
  glitchGlowColor: { type: String, default: '' },
  customStyles: { type: Object, default: () => ({}) }
})

const randomGlitchChar = (original) => {
  const isCJK = /[\u4e00-\u9fa5\u3040-\u30ff]/.test(original)
  const pool = isCJK ? props.charConfig.cjkGlitch : props.charConfig.glitchChars
  return pool[Math.floor(Math.random() * pool.length)]
}

const styleVars = computed(() => (Object.assign({}, props.customStyles, {
  '--glitch-text-color': props.glitchTextColor,
  '--glitch-before-color': props.glitchBeforeColor,
  '--glitch-after-color': props.glitchAfterColor,
  '--glitch-glow-color': props.glitchGlowColor || props.glitchTextColor
})))

const charList = ref([])
const hasStarted = ref(false)
const isRunning = ref(false)
const isPaused = ref(false)
const isFinished = ref(false)
const recoveredCount = ref(0)
const totalCount = ref(0)

let glitchTimers = []
let recoverTimers = []
let startTime = 0
let pausedAt = 0

const clearAllTimers = () => {
  glitchTimers.forEach(clearInterval)
  recoverTimers.forEach(clearTimeout)
  glitchTimers = []
  recoverTimers = []
}

/** 为单个字符启动故障闪烁 */
const startGlitchFlicker = (index) => {
  if (!charList.value[index] || charList.value[index].recovered) return
  const t = setInterval(() => {
    const item = charList.value[index]
    if (item && !item.recovered) {
      item.glitchChar = randomGlitchChar(item.original)
    }
  }, 80)
  glitchTimers.push(t)
}

/**
 * 调度逐字恢复。每个字符的 scheduledOffset 在 play() 中已确定，
 * 这里直接计算 remaining = scheduledOffset - elapsed。
 */
const scheduleRecovery = () => {
  const pending = charList.value.filter(c => !c.recovered)
  if (pending.length === 0) return

  const now = Date.now()

  pending.forEach((item) => {
    const idx = charList.value.indexOf(item)
    const elapsed = now - startTime
    const remaining = Math.max(0, item.scheduledOffset - elapsed)

    const t = setTimeout(() => {
      if (charList.value[idx]) {
        charList.value[idx].recovered = true
        charList.value[idx].glitchChar = charList.value[idx].original
        recoveredCount.value++
      }
      if (recoveredCount.value >= totalCount.value) {
        clearAllTimers()
        isRunning.value = false
        isPaused.value = false
        isFinished.value = true
      }
    }, remaining)
    recoverTimers.push(t)
  })
}


const play = () => {
  const raw = props.text
  if (!raw || !raw.trim()) return

  clearAllTimers()

  const chars = [...raw]
  charList.value = chars.map(ch => ({
    original: ch,
    glitchChar: ch === ' ' || ch === '\n' ? ch : randomGlitchChar(ch),
    recovered: ch === ' ' || ch === '\n',
    scheduledOffset: 0
  }))

  const nonSpace = charList.value.filter(c => !c.recovered)
  const totalMs = props.duration * 1000
  const interval = nonSpace.length > 1
    ? totalMs / (nonSpace.length - 1)
    : 0

  nonSpace.forEach((item, pos) => {
    item.scheduledOffset = pos * interval
  })

  totalCount.value = nonSpace.length
  recoveredCount.value = 0
  startTime = Date.now()
  hasStarted.value = true
  isRunning.value = true
  isPaused.value = false
  isFinished.value = false

  charList.value.forEach((_, idx) => startGlitchFlicker(idx))
  scheduleRecovery()
}

const pause = () => {
  if (!isRunning.value) return
  clearAllTimers()
  pausedAt = Date.now()
  isRunning.value = false
  isPaused.value = true
}

const resume = () => {
  if (!isPaused.value) return
  // 补偿暂停期间流逝的真实时间，保持动画进度不变
  startTime += Date.now() - pausedAt
  isRunning.value = true
  isPaused.value = false

  charList.value.forEach((item, idx) => {
    if (!item.recovered) startGlitchFlicker(idx)
  })
  scheduleRecovery()
}

const reset = () => {
  clearAllTimers()
  charList.value = []
  hasStarted.value = false
  isRunning.value = false
  isPaused.value = false
  isFinished.value = false
  recoveredCount.value = 0
  totalCount.value = 0
  startTime = 0
  pausedAt = 0
}

onUnmounted(clearAllTimers)

/**
 * Exposed:
 *   play()        - 开始 / 重新播放当前 text
 *   pause()       - 暂停动画
 *   resume()      - 恢复动画
 *   reset()       - 重置为空状态
 *   isRunning     - 是否正在播放
 *   isFinished    - 是否已全部恢复
 *   isPaused      - 是否已暂停
 *   recoveredCount - 已恢复字符数
 *   totalCount     - 总需恢复字符数
 */

defineExpose({
  play,
  pause,
  resume,
  reset,
  isRunning,
  isFinished,
  isPaused,
  recoveredCount,
  totalCount
})
</script>

<style scoped>
.preview-area {
  width: 100%;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: #0d1117;
  border-radius: 6px;
}

.placeholder-text {
  color: #444;
  font-size: 15px;
}

.text-display {
  line-height: 1.6;
  letter-spacing: 0.05em;
  word-break: break-all;
  white-space: pre-wrap;
  text-align: center;
  user-select: none;
}

.char-normal {
  color: #e6edf3;
  transition: color 0.15s;
  position: relative;
  display: inline-block;
}

.char-glitch {
  position: relative;
  display: inline-block;
  color: var(--glitch-text-color);
  font-weight: bold;
}

.char-glitch::before,
.char-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.char-glitch::before {
  color: var(--glitch-before-color);
  animation: glitch-before 0.15s infinite;
}

.char-glitch::after {
  color: var(--glitch-after-color);
  animation: glitch-after 0.12s infinite;
}

.glitch-level-1::before {
  animation-duration: 0.40s;
}

.glitch-level-1::after {
  animation-duration: 0.35s;
}

.glitch-level-2::before {
  animation-duration: 0.25s;
}

.glitch-level-2::after {
  animation-duration: 0.22s;
}

.glitch-level-3::before {
  animation-duration: 0.15s;
}

.glitch-level-3::after {
  animation-duration: 0.12s;
}

.glitch-level-4 {
  text-shadow:
    0 0 6px var(--glitch-glow-color),
    0 0 12px var(--glitch-glow-color);
}

.glitch-level-4::before {
  animation-duration: 0.08s;
}

.glitch-level-4::after {
  animation-duration: 0.07s;
}

.glitch-level-5 {
  text-shadow:
    0 0 6px var(--glitch-glow-color),
    0 0 14px var(--glitch-glow-color),
    0 0 26px var(--glitch-glow-color);
}

.glitch-level-5::before {
  animation-duration: 0.05s;
}

.glitch-level-5::after {
  animation-duration: 0.04s;
}

@keyframes glitch-before {
  0% {
    clip-path: inset(20% 0 60% 0);
    transform: translate(-3px, 2px);
  }

  25% {
    clip-path: inset(60% 0 10% 0);
    transform: translate(3px, -1px);
  }

  50% {
    clip-path: inset(40% 0 40% 0);
    transform: translate(-2px, 3px);
  }

  75% {
    clip-path: inset(10% 0 70% 0);
    transform: translate(2px, -2px);
  }

  100% {
    clip-path: inset(30% 0 50% 0);
    transform: translate(-3px, 1px);
  }
}

@keyframes glitch-after {
  0% {
    clip-path: inset(50% 0 30% 0);
    transform: translate(3px, -2px);
  }

  25% {
    clip-path: inset(15% 0 65% 0);
    transform: translate(-3px, 1px);
  }

  50% {
    clip-path: inset(70% 0 5% 0);
    transform: translate(2px, -3px);
  }

  75% {
    clip-path: inset(35% 0 45% 0);
    transform: translate(-2px, 2px);
  }

  100% {
    clip-path: inset(55% 0 25% 0);
    transform: translate(3px, -1px);
  }
}
</style>
