<template>
  <div class="shop-section">
    <h3>⚔️ 购买装备</h3>
    <div class="equipment-types">
      <button
        v-for="type in equipmentTypes"
        :key="type"
        class="equip-type-btn"
        :class="{ active: selectedType === type }"
        @click="$emit('select-type', type)"
      >
        {{ getTypeName(type) }}
      </button>
    </div>
    <div v-if="selectedType" class="equipment-preview">
      <div class="preview-card">
        <div class="preview-name">{{ shopEquipmentName }}</div>
        <div class="preview-level">等级: 1</div>
        <div class="preview-stats">
          <div class="base-stats">
            <span class="stats-label">基础:</span>
            <span
              v-for="(value, stat) in shopPreviewStats"
              :key="stat"
              class="stat-badge base-badge"
            >
              {{ getStatName(stat) }} +{{ value }}
            </span>
          </div>
        </div>
        <div class="preview-price">💰 {{ shopEquipmentPrice }}</div>
        <button
          class="buy-btn"
          :disabled="playerGold < shopEquipmentPrice"
          @click="$emit('purchase', { type: selectedType, purchaseType: 'equipment' })"
        >
          购买
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { gameState } from "../../stores/gameStore.js";

const props = defineProps({
  selectedType: { type: String, required: true },
  equipmentTypes: { type: Array, required: true },
  shopPreviewStats: { type: Object, required: true },
  shopEquipmentPrice: { type: Number, required: true },
  getTypeName: { type: Function, required: true },
  getStatName: { type: Function, required: true },
  shopEquipmentName: { type: String, required: true },
});

defineEmits(["select-type", "purchase"]);

const playerGold = computed(() => gameState.player.gold);
</script>

<style scoped lang="scss">
.equipment-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.equip-type-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: #3b82f6;
  }
}

.equipment-preview {
  margin-top: 16px;
}

.preview-card {
  padding: 20px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  text-align: center;
}

.preview-name {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.preview-level {
  color: #888;
  margin-bottom: 16px;
}

.preview-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.preview-price {
  color: #fbbf24;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
}

.buy-btn {
  padding: 10px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.02);
  }

  &:disabled {
    background: #444;
    cursor: not-allowed;
  }
}

.stat-badge {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 11px;
  color: #ccc;
}

.base-badge {
  color: #60a5fa;
}

.stats-label {
  font-size: 11px;
  color: #666;
  font-weight: bold;
}
</style>
