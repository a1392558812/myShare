<template>
  <div class="equipment-panel">
    <h3>🛡️ 装备</h3>

    <div class="equipment-slots">
      <div class="slot-row">
        <div
          v-for="slot in firstRowSlots"
          :key="slot.key"
          class="slot-item"
          :class="{ equipped: equipment[slot.key] }"
          @mouseenter="showTooltip(slot.key, $event)"
          @mouseleave="hideTooltip"
        >
          <span class="slot-icon">{{ slot.icon }}</span>
          <span class="slot-label">{{ slot.label }}</span>
          <div v-if="equipment[slot.key]" class="slot-equip">
            <div class="equip-name" :style="{ color: getRarityColor(equipment[slot.key].rarity) }">
              {{ equipment[slot.key].name }}
            </div>
            <button class="unequip-btn" @click.stop="unequipItem(slot.key)">
              卸下
            </button>
          </div>
        </div>
      </div>
      
      <div class="slot-row">
        <div
          v-for="slot in secondRowSlots"
          :key="slot.key"
          class="slot-item"
          :class="{ equipped: equipment[slot.key] }"
          @mouseenter="showTooltip(slot.key, $event)"
          @mouseleave="hideTooltip"
        >
          <span class="slot-icon">{{ slot.icon }}</span>
          <span class="slot-label">{{ slot.label }}</span>
          <div v-if="equipment[slot.key]" class="slot-equip">
            <div class="equip-name" :style="{ color: getRarityColor(equipment[slot.key].rarity) }">
              {{ equipment[slot.key].name }}
            </div>
            <button class="unequip-btn" @click.stop="unequipItem(slot.key)">
              卸下
            </button>
          </div>
        </div>
      </div>
      
      <div class="slot-row">
        <div
          v-for="slot in thirdRowSlots"
          :key="slot.key"
          class="slot-item"
          :class="{ equipped: equipment[slot.key] }"
          @mouseenter="showTooltip(slot.key, $event)"
          @mouseleave="hideTooltip"
        >
          <span class="slot-icon">{{ slot.icon }}</span>
          <span class="slot-label">{{ slot.label }}</span>
          <div v-if="equipment[slot.key]" class="slot-equip">
            <div class="equip-name" :style="{ color: getRarityColor(equipment[slot.key].rarity) }">
              {{ equipment[slot.key].name }}
            </div>
            <button class="unequip-btn" @click.stop="unequipItem(slot.key)">
              卸下
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="tooltipSlot && tooltipEquip"
      class="equipment-tooltip"
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
      @mouseenter="onTooltipMouseEnter"
      @mouseleave="onTooltipMouseLeave"
    >
      <div class="tooltip-header" :style="{ color: getRarityColor(tooltipEquip.rarity) }">
        Lv.{{ tooltipEquip.level }} {{ tooltipEquip.name }}
        <span class="tooltip-rarity">[{{ getRarityName(tooltipEquip.rarity) }}]</span>
      </div>
      <div class="tooltip-stats">
        <div class="base-stats">
          <span class="stats-label">基础:</span>
          <span
            v-for="(value, stat) in tooltipEquip.baseStats"
            :key="stat"
            class="stat-badge base-badge"
          >{{ getStatName(stat) }} +{{ value }}</span>
        </div>
        <div class="affix-stats">
          <span class="stats-label">基础词条:</span>
          <span
            v-for="(value, stat) in tooltipEquip.baseAffixes"
            :key="stat"
            class="stat-badge"
          >{{ getStatName(stat) }} +{{ value }}</span>
          <span
            v-if="Object.keys(tooltipEquip.baseAffixes || {}).length === 0"
            class="stat-badge empty-badge"
          >无</span>
        </div>
        <div class="bonus-stats">
          <span class="stats-label">强力词条:</span>
          <span
            v-for="(value, stat) in tooltipEquip.bonusAffixes"
            :key="stat"
            class="stat-badge bonus-badge"
          >{{ getBonusStatName(stat) }} +{{ value }}</span>
          <span
            v-if="Object.keys(tooltipEquip.bonusAffixes || {}).length === 0"
            class="stat-badge empty-badge"
          >无</span>
        </div>
      </div>
    </div>
    
    <div v-if="showEquipmentBag" class="equipment-bag">
      <h4>🎒 {{ equipmentBagTitle }}</h4>
      <div class="equipment-grid">
        <div
          v-for="(equip, index) in equipmentBag"
          :key="equip.uid"
          class="equip-item"
          :style="{ borderColor: getRarityColor(equip.rarity) }"
        >
          <div class="equip-header">
            <div class="equip-name" :style="{ color: getRarityColor(equip.rarity) }">
              Lv.{{ equip.level }} {{ equip.name }}
            </div>
            <div class="equip-rarity" :style="{ color: getRarityColor(equip.rarity) }">
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
              >{{ getStatName(stat) }} +{{ value }}</span>
              <span v-if="Object.keys(equip.baseStats).length === 0" class="stat-badge empty-badge">
                无
              </span>
            </div>
            <div class="affix-stats">
              <span class="stats-label">基础词条:</span>
              <span
                v-for="(value, stat) in equip.baseAffixes"
                :key="stat"
                class="stat-badge"
              >{{ getStatName(stat) }} +{{ value }}</span>
              <span v-if="Object.keys(equip.baseAffixes || {}).length === 0" class="stat-badge empty-badge">
                无
              </span>
            </div>
            <div class="bonus-stats">
              <span class="stats-label">强力词条:</span>
              <span
                v-for="(value, stat) in equip.bonusAffixes"
                :key="stat"
                class="stat-badge bonus-badge"
              >{{ getBonusStatName(stat) }} +{{ value }}</span>
              <span v-if="Object.keys(equip.bonusAffixes || {}).length === 0" class="stat-badge empty-badge">
                无
              </span>
            </div>
          </div>
          <div class="equip-actions">
            <button class="equip-btn" @click="equipItem(equip, index)">
              {{ equipButtonText }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="!equipmentBag || equipmentBag.length === 0" class="empty-tip">
        {{ equipmentBagEmptyTip }}
      </div>
    </div>

    <div v-if="showItemBag" class="item-bag">
      <h4>📦 {{ itemBagTitle }}</h4>
      <div class="item-grid">
        <div
          v-for="(item, index) in itemBag"
          :key="item.id"
          class="item-card"
          @mouseenter="showItemTooltip(item, index, $event)"
          @mouseleave="hideItemTooltip"
        >
          <div class="item-icon">
            {{ getItemIcon(item) }}
          </div>
          <div class="item-count-badge">x{{ item.count }}</div>
        </div>
      </div>
      <div v-if="!itemBag || itemBag.length === 0" class="empty-tip">
        {{ itemBagEmptyTip }}
      </div>
    </div>

    <div
      v-if="activeItem"
      class="item-tooltip"
      :style="{ left: itemTooltipX + 'px', top: itemTooltipY + 'px' }"
      @mouseenter="onItemTooltipMouseEnter"
      @mouseleave="onItemTooltipMouseLeave"
    >
      <div class="tooltip-item-name">{{ activeItem.name }}</div>
      <div class="tooltip-item-desc">{{ activeItem.description }}</div>
      <div class="tooltip-item-value">价值: {{ activeItem.price }} 金币</div>
      <div class="tooltip-actions">
        <button
          v-if="showUseItemButton"
          class="tooltip-use-btn"
          @click.stop="handleUseItem"
        >
          使用
        </button>
        <button
          v-if="showSellItemButton"
          class="tooltip-sell-btn"
          @click.stop="handleSellItem"
        >
          出售
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { STAT_CONFIG, EQUIPMENT_CONFIG } from '../../stores/constants.js';
import { getStatName, getBonusStatName } from '../../stores/utils.js';

const props = defineProps({
  equipment: {
    type: Object,
    required: true,
  },
  showEquipmentBag: {
    type: Boolean,
    default: true,
  },
  equipmentBag: {
    type: Array,
    default: () => [],
  },
  equipmentBagTitle: {
    type: String,
    default: '装备背包',
  },
  equipmentBagEmptyTip: {
    type: String,
    default: '装备背包空空如也，击败敌人有概率获得装备！',
  },
  equipButtonText: {
    type: String,
    default: '穿戴',
  },
  showItemBag: {
    type: Boolean,
    default: true,
  },
  itemBag: {
    type: Array,
    default: () => [],
  },
  itemBagTitle: {
    type: String,
    default: '物品背包',
  },
  itemBagEmptyTip: {
    type: String,
    default: '背包空空如也，去战斗获取战利品吧！',
  },
  showUseItemButton: {
    type: Boolean,
    default: true,
  },
  showSellItemButton: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['unequipItem', 'equipItem', 'useItem', 'sellItem']);

const tooltipSlot = ref(null);
const tooltipX = ref(0);
const tooltipY = ref(0);
const tooltipEquip = ref(null);
const isHoveringTooltip = ref(false);
let hideTimeout = null;

const activeItem = ref(null);
const itemTooltipX = ref(0);
const itemTooltipY = ref(0);
const activeItemIndex = ref(null);
const isHoveringItemTooltip = ref(false);
let itemHideTimeout = null;

const firstRowSlots = [
  { key: 'weapon', icon: '🗡️', label: '武器' },
  { key: 'necklace', icon: '📿', label: '项链' },
  { key: 'crown', icon: '👑', label: '头冠' },
];

const secondRowSlots = [
  { key: 'chest', icon: '🦺', label: '护胸甲' },
  { key: 'jade', icon: '🪨', label: '玉佩' },
  { key: 'belt', icon: '💫', label: '腰带' },
];

const thirdRowSlots = [
  { key: 'leftRing', icon: '💍', label: '左手环' },
  { key: 'legs', icon: '👖', label: '护腿甲' },
  { key: 'rightRing', icon: '💍', label: '右手环' },
  { key: 'shoes', icon: '👟', label: '鞋子' },
];

const showTooltip = (slot, event) => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  if (props.equipment[slot]) {
    tooltipSlot.value = slot;
    tooltipEquip.value = props.equipment[slot];
    const rect = event.target.getBoundingClientRect();
    tooltipX.value = rect.left;
    tooltipY.value = rect.bottom + 10;
  }
};

const hideTooltip = () => {
  hideTimeout = setTimeout(() => {
    if (!isHoveringTooltip.value) {
      tooltipSlot.value = null;
      tooltipEquip.value = null;
    }
    hideTimeout = null;
  }, 150);
};

const onTooltipMouseEnter = () => {
  isHoveringTooltip.value = true;
};

const onTooltipMouseLeave = () => {
  isHoveringTooltip.value = false;
  hideTooltip();
};

const unequipItem = (slot) => {
  hideTooltip();
  emit('unequipItem', slot);
};

const equipItem = (equip, index) => {
  emit('equipItem', equip, index);
};

const getRarityColor = (rarity) => {
  return EQUIPMENT_CONFIG.RARITY[rarity]?.color || '#9ca3af';
};

const getRarityName = (rarity) => {
  return EQUIPMENT_CONFIG.RARITY[rarity]?.name || '普通';
};

const getItemIcon = (item) => {
  if (item.type === 'heal') return '❤️';
  if (item.type === 'mana') return '💎';
  return '📦';
};

const showItemTooltip = (item, index, event) => {
  if (itemHideTimeout) {
    clearTimeout(itemHideTimeout);
    itemHideTimeout = null;
  }
  activeItem.value = item;
  activeItemIndex.value = index;
  const rect = event.target.getBoundingClientRect();
  itemTooltipX.value = rect.left;
  itemTooltipY.value = rect.top - 10;
};

const hideItemTooltip = () => {
  itemHideTimeout = setTimeout(() => {
    if (!isHoveringItemTooltip.value) {
      activeItem.value = null;
      activeItemIndex.value = null;
    }
    itemHideTimeout = null;
  }, 150);
};

const onItemTooltipMouseEnter = () => {
  isHoveringItemTooltip.value = true;
};

const onItemTooltipMouseLeave = () => {
  isHoveringItemTooltip.value = false;
  hideItemTooltip();
};

const handleUseItem = () => {
  if (activeItemIndex.value !== null) {
    emit('useItem', activeItemIndex.value);
  }
  isHoveringItemTooltip.value = false;
  activeItem.value = null;
  activeItemIndex.value = null;
};

const handleSellItem = () => {
  if (activeItemIndex.value !== null) {
    emit('sellItem', activeItemIndex.value);
  }
  isHoveringItemTooltip.value = false;
  activeItem.value = null;
  activeItemIndex.value = null;
};
</script>

<style scoped lang="scss">
.equipment-panel {
  flex: 1;
  min-width: 350px;
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  overflow: auto;
}

h3 {
  margin: 0 0 20px;
  color: white;
  font-size: 18px;
}

h4 {
  margin: 16px 0 12px;
  color: #aaa;
  font-size: 14px;
}

.equipment-slots {
  margin-bottom: 20px;
}

.slot-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.slot-item {
  width: 130px;
  flex-shrink: 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
  position: relative;
}

.slot-item.equipped {
  border-style: solid;
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.slot-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.slot-label {
  display: block;
  color: #888;
  font-size: 12px;
  margin-bottom: 8px;
}

.slot-equip {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}

.unequip-btn {
  display: block;
  margin-top: 4px;
  padding: 4px 8px;
  font-size: 10px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  cursor: pointer;
}

.unequip-btn:hover {
  background: rgba(255, 107, 107, 0.5);
}

.equipment-tooltip {
  position: fixed;
  z-index: 99999;
  padding: 12px;
  background: rgba(20, 20, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.tooltip-header {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tooltip-rarity {
  font-size: 12px;
  opacity: 0.8;
}

.tooltip-stats {
  .base-stats, .affix-stats, .bonus-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 4px;
  }
}

.stats-label {
  font-size: 11px;
  color: #666;
  font-weight: bold;
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
  color: #666;
  font-style: italic;
}

.equipment-bag {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.equip-item {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid;
  border-radius: 8px;
}

.equip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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
  margin-bottom: 10px;
}

.base-stats, .affix-stats, .bonus-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.equip-actions {
  display: flex;
  gap: 6px;
}

.equip-btn {
  flex: 1;
  padding: 6px;
  font-size: 11px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  background: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.equip-btn:hover {
  background: rgba(245, 158, 11, 0.5);
}

.empty-tip {
  color: #666;
  text-align: center;
  padding: 40px 20px;
}

.item-bag {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.item-grid {
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
  transform: translateY(-100%);
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
</style>
