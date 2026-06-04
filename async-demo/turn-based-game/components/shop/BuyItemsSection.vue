<template>
  <div class="shop-section">
    <h3>🛒 购买道具</h3>
    <div class="item-grid">
      <div
        v-for="item in ITEMS_CONFIG"
        :key="item.id"
        class="shop-item"
        @mouseenter="showItemTooltip(item, $event)"
        @mouseleave="hideItemTooltip"
      >
        <div class="item-icon">
          {{ getItemIcon(item.type) }}
        </div>
      </div>
    </div>

    <div
      v-if="activeItem"
      class="item-tooltip"
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
      @mouseenter="onTooltipMouseEnter"
      @mouseleave="onTooltipMouseLeave"
    >
      <div class="tooltip-item-name">{{ activeItem.name }}</div>
      <div class="tooltip-item-desc">{{ activeItem.description }}</div>
      <div class="tooltip-item-value">💰 {{ activeItem.price }}</div>
      <button
        class="tooltip-buy-btn"
        :disabled="gameState.player.gold < activeItem.price"
        @click.stop="handleBuy(activeItem)"
      >
        购买
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { gameState } from "../../stores/gameStore.js";
import { ITEMS_CONFIG } from "../../stores/constants.js";

const emit = defineEmits(["purchase"]);

const activeItem = ref(null);
const tooltipX = ref(0);
const tooltipY = ref(0);
const isHoveringTooltip = ref(false);
let hideTimeout = null;

const showItemTooltip = (item, event) => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  activeItem.value = item;
  const rect = event.target.getBoundingClientRect();
  tooltipX.value = rect.left;
  tooltipY.value = rect.bottom + 10;
};

const hideItemTooltip = () => {
  hideTimeout = setTimeout(() => {
    if (!isHoveringTooltip.value) {
      activeItem.value = null;
    }
    hideTimeout = null;
  }, 150);
};

const onTooltipMouseEnter = () => {
  isHoveringTooltip.value = true;
};

const onTooltipMouseLeave = () => {
  isHoveringTooltip.value = false;
  hideItemTooltip();
};

const handleBuy = (item) => {
  isHoveringTooltip.value = false;
  activeItem.value = null;
  emit("purchase", { item, type: "item" });
};

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
.item-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.shop-item {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
}

.item-icon {
  font-size: 28px;
}

.item-tooltip {
  position: fixed;
  z-index: 99999;
  padding: 12px;
  background: rgba(20, 20, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  min-width: 180px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.tooltip-item-name {
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
}

.tooltip-item-desc {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 8px;
}

.tooltip-item-value {
  font-size: 12px;
  color: #fbbf24;
  margin-bottom: 12px;
}

.tooltip-buy-btn {
  width: 100%;
  padding: 8px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border: none;
  border-radius: 6px;
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
</style>
