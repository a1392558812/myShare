<template>
  <div class="shop-section">
    <h3>🎒 装备背包</h3>
    <div class="equipment-bag-grid">
      <div
        v-for="(equip, index) in equipmentBag"
        :key="equip.uid"
        class="equip-card"
      >
        <div class="equip-header">
          <div
            class="equip-name"
            :style="{ color: getRarityColor(equip.rarity) }"
          >
            Lv.{{ equip.level }} {{ equip.name }}
          </div>
          <div
            class="equip-rarity"
            :style="{ color: getRarityColor(equip.rarity) }"
          >
            [{{ getRarityName(equip.rarity) }}]
          </div>
        </div>
        <div class="equip-stats">
          <div class="base-stats">
            <span class="stats-label">基础:</span>
            <span
              v-for="(value, stat) in equip.baseStats"
              :key="stat"
              class="stat-badge base-badge"
            >
              {{ getStatName(stat) }} +{{ value }}
            </span>
            <span
              v-if="Object.keys(equip.baseStats).length === 0"
              class="stat-badge empty-badge"
            >
              无
            </span>
          </div>
          <div class="affix-stats">
            <span class="stats-label">基础词条:</span>
            <span
              v-for="(value, stat) in equip.baseAffixes"
              :key="stat"
              class="stat-badge"
            >
              {{ getStatName(stat) }} +{{ value }}
            </span>
            <span
              v-if="Object.keys(equip.baseAffixes || {}).length === 0"
              class="stat-badge empty-badge"
            >
              无
            </span>
          </div>
          <div class="bonus-stats">
            <span class="stats-label">强力词条:</span>
            <span
              v-for="(value, stat) in equip.bonusAffixes"
              :key="stat"
              class="stat-badge bonus-badge"
            >
              {{ getStatName(stat) }} +{{ value }}
            </span>
            <span
              v-if="Object.keys(equip.bonusAffixes || {}).length === 0"
              class="stat-badge empty-badge"
            >
              无
            </span>
          </div>
        </div>
        <div class="equip-actions">
          <button class="sell-btn" @click="$emit('sell', index)">
            出售 (💰{{ getEquipmentSellPrice(equip) }})
          </button>
          <button
            class="refresh-btn"
            :disabled="playerGold < getRefreshCost(equip)"
            @click="$emit('refresh', index)"
          >
            刷新 (💰{{ getRefreshCost(equip) }})
          </button>
        </div>
      </div>
      <div v-if="equipmentBag.length === 0" class="empty-tip">
        装备背包为空
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { gameState } from "../../stores/gameStore.js";
import { GAME_CONFIG } from "../../stores/constants.js";

const props = defineProps({
  getRarityColor: { type: Function, required: true },
  getRarityName: { type: Function, required: true },
  getStatName: { type: Function, required: true },
  getEquipmentSellPrice: { type: Function, required: true },
  getRefreshCost: { type: Function, required: true },
});

defineEmits(["sell", "refresh"]);

const equipmentBag = computed(() => gameState.player.equipmentBag);
const playerGold = computed(() => gameState.player.gold);
</script>

<style scoped lang="scss">
.equipment-bag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.equip-card {
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid;
  border-color: #3b82f6;
  border-radius: 8px;
}

.equip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.equip-name {
  font-size: 14px;
  font-weight: bold;
}

.equip-rarity {
  font-size: 11px;
  opacity: 0.8;
}

.equip-stats {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.base-stats,
.affix-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
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

.bonus-badge {
  color: #f59e0b;
}

.empty-badge {
  opacity: 0.5;
}

.stats-label {
  font-size: 11px;
  color: #666;
  font-weight: bold;
}

.equip-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sell-btn {
  padding: 8px;
  background: rgba(255, 107, 107, 0.3);
  border: none;
  border-radius: 6px;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 107, 107, 0.5);
  }
}

.refresh-btn {
  padding: 8px;
  background: rgba(168, 85, 247, 0.3);
  border: none;
  border-radius: 6px;
  color: #a855f7;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: rgba(168, 85, 247, 0.5);
  }

  &:disabled {
    background: #444;
    color: #666;
    cursor: not-allowed;
  }
}

.empty-tip {
  color: #666;
  text-align: center;
  padding: 20px;
}
</style>
