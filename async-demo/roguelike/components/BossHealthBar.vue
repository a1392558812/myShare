<template>
  <div v-if="isVisible" class="boss-hp-bar">
    <div class="boss-name-row">
      <span class="boss-name">{{ bossName }}</span>
      <span v-if="phaseName" class="boss-phase">{{ phaseName }}</span>
      <span class="boss-hp-num">{{ currentHp }} / {{ maxHp }}</span>
    </div>
    <div class="bar-track">
      <div class="bar-fill" :style="{ width: hpPercent + '%', backgroundColor: barColor }">
        <div class="bar-glow"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  boss: { type: Object, default: null },
  phase: { type: Object, default: () => ({ name: '', attacks: [] }) },
})

const isVisible = computed(() => props.boss && !props.boss.dead)

const bossName = computed(() => props.boss?.bossName || '')
const phaseName = computed(() => props.phase?.name || '')
const currentHp = computed(() => Math.max(0, Math.round(props.boss?.hp || 0)))
const maxHp = computed(() => Math.round(props.boss?.maxHp || 1))

const hpPercent = computed(() => {
  if (!props.boss) return 0
  return Math.max(0, Math.min(100, (props.boss.hp / props.boss.maxHp) * 100))
})

const barColor = computed(() => {
  if (!props.boss) return '#a855f7'
  const p = hpPercent.value
  if (p > 60) return props.boss.color
  if (p > 25) return '#f59e0b'
  return '#ef4444'
})
</script>

<style scoped>
.boss-hp-bar {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: 420px;
}

.boss-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  padding: 0 4px;
}

.boss-name {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.6);
  letter-spacing: 2px;
}

.boss-phase {
  font-size: 12px;
  color: #fbbf24;
  padding: 1px 8px;
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 4px;
}

.boss-hp-num {
  font-size: 13px;
  color: #cbd5e1;
  font-family: monospace;
}

.bar-track {
  width: 100%;
  height: 12px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(100, 100, 120, 0.4);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.4);
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease, background-color 0.5s ease;
  position: relative;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.bar-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px 4px 0 0;
}
</style>