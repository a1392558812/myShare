<template>
  <transition name="boss-hud-fade">
    <div v-if="show" class="boss-hud-bar" :class="barClass">
      <span class="boss-hud-icon">{{ icon }}</span>
      <span class="boss-hud-text">{{ text }}</span>
      <span class="boss-hud-countdown">{{ countdownText }}</span>
      <div class="boss-hud-progress-track">
        <div class="boss-hud-progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bossState:              { type: String, default: 'idle' },
  bossCooldownRemaining:  { type: Number, default: 0 },
  firstBossPreWarningRemaining: { type: Number, default: 0 },
  activeBoss:             { type: Object, default: null },
  bossWarningTimer:       { type: Number, default: 0 },
  bossCooldownTotal:      { type: Number, default: 180000 },
  firstBossEarlyWarning:  { type: Number, default: 30000 },
})

const show = computed(() =>
  props.bossState === 'warning' ||
  props.firstBossPreWarningRemaining > 0 ||
  (props.bossCooldownRemaining > 0 && props.bossState === 'idle')
)

const isWarning = computed(() => props.bossState === 'warning')
const isFirstBossPreWarning = computed(
  () => props.firstBossPreWarningRemaining > 0 && !isWarning.value
)
const isCooldown = computed(
  () => props.bossCooldownRemaining > 0 && props.bossState === 'idle' && !isFirstBossPreWarning.value
)

const barClass = computed(() => {
  if (isWarning.value) return 'boss-hud--warning'
  if (isFirstBossPreWarning.value) return 'boss-hud--first-pre'
  return 'boss-hud--cooldown'
})

const icon = computed(() => {
  if (isWarning.value) return '⚠️'
  return '⏳'
})

const text = computed(() => {
  if (isWarning.value) {
    return (props.activeBoss?.bossName || '强大的敌人') + ' 即将来临！'
  }
  if (isFirstBossPreWarning.value) {
    return '首个 Boss 即将来临…'
  }
  return 'Boss 冷却中…'
})

const countdownText = computed(() => {
  if (isWarning.value) {
    return Math.ceil(props.bossWarningTimer / 1000) + 's'
  }
  if (isFirstBossPreWarning.value) {
    return Math.ceil(props.firstBossPreWarningRemaining / 1000) + 's'
  }
  return Math.ceil(props.bossCooldownRemaining / 1000) + 's'
})

const progressPct = computed(() => {
  if (isWarning.value) {
    const total = 2000
    return Math.max(0, (props.bossWarningTimer / total) * 100)
  }
  if (isFirstBossPreWarning.value) {
    const total = props.firstBossEarlyWarning || 30000
    return Math.max(0, (props.firstBossPreWarningRemaining / total) * 100)
  }
  if (props.bossCooldownTotal > 0) {
    return Math.max(0, (props.bossCooldownRemaining / props.bossCooldownTotal) * 100)
  }
  return 0
})
</script>

<style scoped lang="scss">
.boss-hud-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px;
  margin-bottom: 6px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(100, 116, 139, 0.3);
  font-size: 12px;
  color: #e2e8f0;
  font-family: 'Consolas', 'Monaco', monospace;
  transition: all 0.3s ease;
}

.boss-hud--warning {
  border-color: rgba(251, 191, 36, 0.6);
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.25);
  animation: bossHudPulse 0.8s ease-in-out infinite alternate;
}
.boss-hud--first-pre {
  border-color: rgba(96, 165, 250, 0.5);
}
.boss-hud--cooldown {
  border-color: rgba(100, 116, 139, 0.3);
}

@keyframes bossHudPulse {
  0%   { box-shadow: 0 0 6px rgba(251, 191, 36, 0.15); }
  100% { box-shadow: 0 0 16px rgba(251, 191, 36, 0.45); }
}

.boss-hud-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.boss-hud-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.boss-hud--warning .boss-hud-text {
  color: #fbbf24;
  font-weight: 600;
}
.boss-hud--first-pre .boss-hud-text {
  color: #60a5fa;
}
.boss-hud--cooldown .boss-hud-text {
  color: #94a3b8;
}

.boss-hud-countdown {
  font-size: 13px;
  font-weight: 700;
  color: #fbbf24;
  flex-shrink: 0;
  min-width: 32px;
  text-align: right;
}

.boss-hud--cooldown .boss-hud-countdown {
  color: #94a3b8;
}

.boss-hud--first-pre .boss-hud-countdown {
  color: #60a5fa;
}

.boss-hud-progress-track {
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: rgba(100, 116, 139, 0.25);
  overflow: hidden;
  flex-shrink: 0;
}

.boss-hud-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.25s linear;
}

.boss-hud--warning .boss-hud-progress-fill {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.boss-hud--first-pre .boss-hud-progress-fill {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}
.boss-hud--cooldown .boss-hud-progress-fill {
  background: linear-gradient(90deg, #475569, #94a3b8);
}

.boss-hud-fade-enter-active,
.boss-hud-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.boss-hud-fade-enter-from,
.boss-hud-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
</template>