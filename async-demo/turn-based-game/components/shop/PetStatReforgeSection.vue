<template>
  <div class="stat-reforge-section">
    <h3>🔄 宠物属性加点重铸</h3>
    <p class="section-desc">花费金币，将宠物已分配的属性点返还到未分配池，重新分配！</p>

    <div class="allocated-list">
      <div
        v-for="stat in allocatedPointsList"
        :key="stat.key"
        class="point-row"
      >
        <span class="point-label">{{ stat.label }}</span>
        <span class="point-value">{{ stat.value }} 点</span>
        <span class="point-non-reforge">({{ stat.nonReforge }} 不可重铸)</span>
      </div>
    </div>

    <div class="total-row">
      <span>可重铸总计：</span>
      <span class="total-value">{{ totalReforgeablePoints }} 点</span>
    </div>

    <div class="cost-row">
      <span>重铸费用：</span>
      <span class="cost-value">💰 {{ cost }}</span>
    </div>

    <button
      class="reforge-btn"
      :disabled="totalReforgeablePoints === 0 || playerGold < cost"
      @click="$emit('reforge')"
    >
      {{ totalReforgeablePoints === 0 ? '无属性点可重铸' : `重铸（💰${cost}）` }}
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { gameState } from "../../stores/gameStore.js";
import { PET_CONFIG } from "../../stores/constants.js";

const props = defineProps({
  getCost: { type: Function, required: true },
});

defineEmits(["reforge"]);

const allocatedPointsList = computed(() => {
  const pet = gameState.pet;
  if (!pet) return [];

  const stats = [
    { key: "physicalAttack", label: "⚔️ 物攻点" },
    { key: "magicAttack", label: "✨ 法攻点" },
    { key: "defense", label: "🛡️ 防御点" },
    { key: "speed", label: "💨 速度点" },
    { key: "maxHp", label: "💖 生命点" },
  ];

  return stats.map(s => {
    const currentPoints = pet[`${s.key}Points`] || 0;
    const initialPoints = PET_CONFIG.INITIAL_POINTS[s.key] || 0;
    const levelUpPoints = (pet.level - 1) * PET_CONFIG.LEVEL_UP.POINTS_PER_STAT;
    const nonReforgePoints = initialPoints + levelUpPoints;
    const reforgeablePoints = Math.max(0, currentPoints - nonReforgePoints);

    return {
      ...s,
      value: reforgeablePoints,
      nonReforge: nonReforgePoints,
    };
  });
});

const totalReforgeablePoints = computed(() => {
  const pet = gameState.pet;
  if (!pet) return 0;

  const stats = ["physicalAttack", "magicAttack", "defense", "speed", "maxHp"];
  let total = 0;

  for (const stat of stats) {
    const currentPoints = pet[`${stat}Points`] || 0;
    const initialPoints = PET_CONFIG.INITIAL_POINTS[stat] || 0;
    const levelUpPoints = (pet.level - 1) * PET_CONFIG.LEVEL_UP.POINTS_PER_STAT;
    const nonReforgePoints = initialPoints + levelUpPoints;
    const reforgeablePoints = Math.max(0, currentPoints - nonReforgePoints);

    total += reforgeablePoints;
  }

  return total;
});

const cost = computed(() => props.getCost());

const playerGold = computed(() => gameState.player?.gold || 0);
</script>

<style scoped lang="scss">
.stat-reforge-section {
  background: rgba(34, 197, 94,0.05);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;

  h3 {
    margin: 0 0 8px;
    color: #22c55e;
    font-size: 18px;
  }

  .section-desc {
    color: #aaa;
    font-size: 13px;
    margin: 0 0 16px;
    line-height: 1.6;
  }

  .allocated-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .point-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
  }

  .point-label {
    color: #ccc;
    font-size: 14px;
  }

  .point-value {
    color: #22c55e;
    font-weight: bold;
    font-size: 14px;
  }

  .point-non-reforge {
    color: #666;
    font-size: 12px;
    margin-left: 8px;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: rgba(34, 197, 94, 0.1);
    border-radius: 6px;
    margin-bottom: 12px;
    color: #ccc;
    font-size: 14px;
  }

  .total-value {
    color: #22c55e;
    font-weight: bold;
  }

  .cost-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: rgba(251, 191, 36, 0.1);
    border-radius: 6px;
    margin-bottom: 16px;
    color: #ccc;
    font-size: 14px;
  }

  .cost-value {
    color: #fbbf24;
    font-weight: bold;
  }

  .reforge-btn {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
    }

    &:disabled {
      background: #444;
      cursor: not-allowed;
      color: #888;
    }
  }
}
</style>
