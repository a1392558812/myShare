<template>
  <div class="battle-log">
    <div class="battle-log-header">战斗日志</div>
    <div class="battle-log-body">
      <div
        v-for="entry in displayLog"
        :key="entry.id"
        class="battle-log-entry"
      >
        <span class="log-time">{{ formatLogTime(entry.time) }}</span>
        <span class="log-text">{{ entry.text }}</span>
      </div>
      <div v-if="log.length === 0" class="battle-log-empty">等待战斗开始...</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BATTLE_LOG_MAX_DISPLAY } from '../constants.js'

const props = defineProps({
  log: { type: Array, required: true },
  maxDisplay: { type: Number, default: BATTLE_LOG_MAX_DISPLAY },
})

const displayLog = computed(() => props.log.slice(0, props.maxDisplay))

const formatLogTime = (timestamp) => {
  const d = new Date(timestamp)
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${m}:${s}`
}
</script>

<style scoped lang="scss">
.battle-log {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.4);
  border-radius: 6px;
  padding: 8px 10px;
  max-width: 200px;
  max-height: 180px;
  overflow: hidden;
  color: #e2e8f0;
  font-family: 'Segoe UI', monospace;
}

.battle-log-header {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(100, 116, 139, 0.2);
}

.battle-log-body {
  max-height: 150px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.battle-log-entry {
  display: flex;
  gap: 6px;
  font-size: 11px;
  line-height: 1.4;
}

.log-time {
  color: #64748b;
  flex-shrink: 0;
}

.log-text {
  color: #cbd5e1;
}

.battle-log-empty {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  padding: 8px 0;
}
</style>