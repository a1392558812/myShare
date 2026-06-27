<template>
  <div class="event-indicators">
    <div v-for="buff in buffs" :key="buff.type" class="buff-item" :class="buff.type">
      <span class="buff-icon">{{ getBuffIcon(buff.type) }}</span>
      <span class="buff-text">{{ buff.label }}</span>
      <span class="buff-timer">{{ formatRemaining(buff.remaining) }}</span>
    </div>

    <div v-if="cursedActive" class="buff-item cursed">
      <span class="buff-icon">⚠️</span>
      <span class="buff-text">诅咒：敌人+30%，掉落×2.5</span>
      <span class="buff-timer">{{ cursedTimer }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  buffs: { type: Array, default: () => [] },
  cursedActive: { type: Boolean, default: false },
  cursedTimer: { type: String, default: '' },
})

const getBuffIcon = (type) => {
  const map = {
    attackBoost: '🗿',
    speedShrine: '🔵',
  }
  return map[type] || '✨'
}

const formatRemaining = (ms) => {
  if (ms >= 10000) return `${(ms / 1000).toFixed(0)}s`
  return `${(ms / 1000).toFixed(1)}s`
}
</script>

<style scoped>
.event-indicators {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 10;
  pointer-events: none;
}

.buff-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  color: #e2e8f0;
  min-width: 180px;
  animation: buffPulse 0.3s ease-out;
}

.buff-item.attackBoost {
  border-color: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
}

.buff-item.speedShrine {
  border-color: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

.buff-item.cursed {
  border-color: #7c3aed;
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.5);
  animation: cursedGlow 1s infinite alternate;
}

.buff-icon {
  font-size: 16px;
}

.buff-text {
  flex: 1;
}

.buff-timer {
  font-size: 11px;
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}

@keyframes buffPulse {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes cursedGlow {
  from { box-shadow: 0 0 8px rgba(124, 58, 237, 0.3); }
  to { box-shadow: 0 0 16px rgba(124, 58, 237, 0.6); }
}
</style>