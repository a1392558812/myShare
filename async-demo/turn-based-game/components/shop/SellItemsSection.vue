<template>
  <div class="shop-section">
    <h3>📤 出售道具</h3>
    <div class="inventory-list">
      <div
        v-for="(item, index) in inventory"
        :key="item.id"
        class="inventory-item"
      >
        <div class="item-icon-small">
          {{ getItemIcon(item.type) }}
        </div>
        <div class="item-info-small">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-count">x{{ item.count }}</div>
        </div>
        <div class="sell-price">
          💰 {{ Math.floor(item.price * ITEM_SELL_RATIO) }}
        </div>
        <button class="sell-btn" @click="$emit('sell', index)">出售</button>
      </div>
      <div v-if="inventory.length === 0" class="empty-tip">
        没有可出售的道具
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { gameState } from "../../stores/gameStore.js";
import { GAME_CONFIG } from "../../stores/constants.js";

defineEmits(["sell"]);

const inventory = computed(() => gameState.player.inventory);
const ITEM_SELL_RATIO = GAME_CONFIG.ITEM_SELL_RATIO;

const getItemIcon = (type) => {
  switch (type) {
    case "heal":
      return "❤️";
    case "mana":
      return "💎";
    case "percentHeal":
      return "💖";
    case "percentMana":
      return "🔮";
    case "percentBoth":
      return "🌟";
    default:
      return "📦";
  }
};
</script>

<style scoped lang="scss">
.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inventory-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.item-icon-small {
  font-size: 24px;
  margin-right: 12px;
}

.item-info-small {
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
}

.item-count {
  color: #fbbf24;
  font-size: 12px;
}

.sell-price {
  color: #fbbf24;
  font-weight: bold;
  margin-right: 12px;
}

.sell-btn {
  padding: 8px 16px;
  background: rgba(255, 107, 107, 0.3);
  border: none;
  border-radius: 6px;
  color: #ff6b6b;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 107, 107, 0.5);
  }
}

.empty-tip {
  color: #666;
  text-align: center;
  padding: 20px;
}
</style>
