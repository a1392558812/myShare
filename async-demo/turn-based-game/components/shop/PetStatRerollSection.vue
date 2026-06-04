<template>
  <div class="shop-section">
    <h3>🐾 宠物属性系数重铸</h3>
    <div class="pet-info-bar">
      <span class="pet-name">{{ pet.name }}</span>
      <span class="pet-level">Lv.{{ pet.level }}</span>
    </div>
    <div class="reroll-grid">
      <div
        v-for="stat in rerollStatsList"
        :key="stat"
        class="reroll-card"
      >
        <div class="reroll-header">
          <span class="reroll-label">{{ getStatName(stat) }}</span>
          <span class="reroll-range">
            范围: {{ getRerollRange(stat) }}
          </span>
        </div>
        <div class="reroll-current">
          当前系数: <span class="current-value">{{ getCurrentCoefficient(stat) }}</span>
        </div>
        <button
          class="reroll-btn"
          :disabled="playerGold < getRerollCost()"
          @click="$emit('reroll', stat)"
        >
          重铸 (💰{{ getRerollCost() }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { gameState } from "../../stores/gameStore.js";

const props = defineProps({
  rerollStatsList: { type: Array, required: true },
  getStatName: { type: Function, required: true },
  getCurrentCoefficient: { type: Function, required: true },
  getRerollRange: { type: Function, required: true },
  getRerollCost: { type: Function, required: true },
});

defineEmits(["reroll"]);

const pet = computed(() => gameState.pet);
const playerGold = computed(() => gameState.player.gold);
</script>

<style scoped lang="scss">
.pet-info-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  margin-bottom: 16px;
}

.pet-name {
  font-size: 16px;
  font-weight: bold;
  color: #a78bfa;
}

.pet-level {
  font-size: 14px;
  color: #8b5cf6;
}

.reroll-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.reroll-card {
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(139, 92, 246, 0.4);
    background: rgba(139, 92, 246, 0.05);
  }
}

.reroll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reroll-label {
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.reroll-range {
  font-size: 11px;
  color: #888;
}

.reroll-current {
  font-size: 13px;
  color: #aaa;
  margin-bottom: 12px;
}

.current-value {
  color: #a78bfa;
  font-weight: bold;
}

.reroll-btn {
  width: 100%;
  padding: 8px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }

  &:disabled {
    background: #444;
    cursor: not-allowed;
  }
}
</style>
