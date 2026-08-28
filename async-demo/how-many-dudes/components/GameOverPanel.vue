<template>
  <div class="game-over-overlay">
    <div class="over-card">
      <h2 class="over-title" :class="{ 'over-title-win': victory, 'over-title-lose': !victory }">
        {{ isEndless ? `无尽模式 - 第 ${endlessWave + 1} 波` : (victory ? '通关！' : '团灭') }}
      </h2>
      <p class="over-subtitle">
        <template v-if="isEndless">
          {{ victory ? '' : `你在无尽模式坚守到了第 ${endlessWave + 1} 波` }}
        </template>
        <template v-else>
          {{ victory ? `你带着兄弟们击败了神明，存活 ${aliveCount} 人` : `倒在了第 ${round + 1} 回合` }}
        </template>
      </p>
      <div class="over-stats">
        <div class="stat-block">
          <span class="stat-value">{{ isEndless ? endlessWave + 1 : round + 1 }}</span>
          <span class="stat-label">{{ isEndless ? '无尽波数' : '回合数' }}</span>
        </div>
        <div class="stat-block">
          <span class="stat-value">{{ relicsCount }}</span>
          <span class="stat-label">遗物数</span>
        </div>
        <div class="stat-block" v-if="isEndless">
          <span class="stat-value">{{ aliveCount }}</span>
          <span class="stat-label">存活兄弟</span>
        </div>
      </div>

      <div v-if="victory && !isEndless" class="btn-group">
        <button class="btn-endless" @click="$emit('endless')">无尽模式</button>
        <button class="btn-restart" @click="$emit('restart')">返回菜单</button>
      </div>

      <button v-else class="btn-restart" @click="$emit('restart')">
        {{ isEndless ? '返回菜单' : '返回主菜单' }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  victory: Boolean,
  round: Number,
  aliveCount: Number,
  relicsCount: Number,
  isEndless: Boolean,
  endlessWave: Number,
});

defineEmits(['restart', 'endless']);
</script>

<style scoped>
.game-over-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.over-card {
  background: #1a1a2e;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 36px 48px;
  text-align: center;
  min-width: 300px;
}

.over-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
}

.over-title-win {
  color: #fbbf24;
}

.over-title-lose {
  color: #ef4444;
}

.over-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 24px;
}

.over-stats {
  display: flex;
  gap: 32px;
  justify-content: center;
  margin-bottom: 24px;
}

.stat-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #fbbf24;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

.btn-group {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-restart {
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: #475569;
  color: #fff;
  cursor: pointer;
  &:hover { background: #334155; }
}

.btn-endless {
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #f97316, #dc2626);
  color: #fff;
  cursor: pointer;
  &:hover { opacity: 0.9; }
}
</style>
