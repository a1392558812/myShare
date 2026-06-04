<template>
  <div class="inventory-panel">
    <h3>🎒 背包</h3>

    <div class="inventory-grid">
      <div
        v-for="(item, index) in inventory"
        :key="item.id"
        class="item-card"
        @mouseenter="showItemTooltip(item, $event)"
        @mouseleave="hideItemTooltip"
      >
        <div class="item-icon">
          {{ getItemIcon(item) }}
        </div>
        <div class="item-count-badge">x{{ item.count }}</div>
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
      <div class="tooltip-item-value">价值: {{ activeItem.price }} 金币</div>
      <div class="tooltip-actions">
        <button
          v-if="showUseButton"
          class="tooltip-use-btn"
          @click.stop="handleUseItem"
        >
          使用
        </button>
        <button
          v-if="showSellButton"
          class="tooltip-sell-btn"
          @click.stop="handleSellItem"
        >
          出售
        </button>
      </div>
    </div>

    <div v-if="!inventory || inventory.length === 0" class="empty-tip">
      {{ emptyTip }}
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  inventory: {
    type: Array,
    default: () => [],
  },
  emptyTip: {
    type: String,
    default: "背包空空如也，去战斗获取战利品吧！",
  },
  showUseButton: {
    type: Boolean,
    default: true,
  },
  showSellButton: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["useItem", "sellItem"]);

const activeItem = ref(null);
const tooltipX = ref(0);
const tooltipY = ref(0);
const activeItemIndex = ref(null);
const isHoveringTooltip = ref(false);
let hideTimeout = null;

const getItemIcon = (item) => {
  if (item.type === "heal") return "❤️";
  if (item.type === "mana") return "💎";
  return "📦";
};

const showItemTooltip = (item, event) => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  activeItem.value = item;
  const rect = event.target.getBoundingClientRect();
  tooltipX.value = rect.left;
  tooltipY.value = rect.bottom + 10;
  const itemIndex = props.inventory.findIndex(i => i.id === item.id);
  activeItemIndex.value = itemIndex >= 0 ? itemIndex : null;
};

const hideItemTooltip = () => {
  hideTimeout = setTimeout(() => {
    if (!isHoveringTooltip.value) {
      activeItem.value = null;
      activeItemIndex.value = null;
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

const handleUseItem = () => {
  if (activeItemIndex.value !== null) {
    emit("useItem", activeItemIndex.value);
  }
  isHoveringTooltip.value = false;
  activeItem.value = null;
  activeItemIndex.value = null;
};

const handleSellItem = () => {
  if (activeItemIndex.value !== null) {
    emit("sellItem", activeItemIndex.value);
  }
  isHoveringTooltip.value = false;
  activeItem.value = null;
  activeItemIndex.value = null;
};
</script>

<style scoped lang="scss">
.inventory-panel {
  flex: 1;
  min-width: 350px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  overflow: auto;
}

h3 {
  margin: 0 0 20px;
  color: white;
  font-size: 18px;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.item-card {
  position: relative;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.item-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.item-icon {
  font-size: 32px;
}

.item-count-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.item-tooltip {
  position: fixed;
  z-index: 99999;
  padding: 12px;
  background: rgba(20, 20, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  width: 180px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.tooltip-item-name {
  color: white;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.tooltip-item-desc {
  color: #aaa;
  font-size: 12px;
  margin-bottom: 8px;
}

.tooltip-item-value {
  color: #f59e0b;
  font-size: 12px;
  margin-bottom: 8px;
}

.tooltip-use-btn,
.tooltip-sell-btn {
  display: inline-block;
  padding: 4px 12px;
  margin-right: 4px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.tooltip-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.tooltip-use-btn {
  background: rgba(74, 222, 128, 0.3);
  color: #4ade80;
}

.tooltip-use-btn:hover {
  background: rgba(74, 222, 128, 0.5);
}

.tooltip-sell-btn {
  background: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.tooltip-sell-btn:hover {
  background: rgba(245, 158, 11, 0.5);
}

.empty-tip {
  color: #666;
  text-align: center;
  padding: 40px 20px;
}
</style>
