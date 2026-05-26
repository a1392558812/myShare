<template>
  <div class="shop-panel">
    <div class="panel-header">
      <h2>🏪 商店</h2>
      <div class="gold-display">💰 {{ gameState.player.gold }}</div>
      <button class="close-btn" @click="closeShop">✕</button>
    </div>
    
    <div class="panel-content">
      <!-- 购买道具 -->
      <div class="shop-section">
        <h3>🛒 购买道具</h3>
        <div class="item-grid">
          <div v-for="item in gameState.ITEMS" :key="item.id" class="shop-item">
            <div class="item-icon">
              {{ item.type === 'heal' ? '❤️' : item.type === 'mana' ? '💎' : '📦' }}
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-desc">{{ item.description }}</div>
            </div>
            <div class="item-price">💰 {{ item.value }}</div>
            <button 
              class="buy-btn" 
              :disabled="gameState.player.gold < item.value"
              @click="buyItem(item)"
            >
              购买
            </button>
          </div>
        </div>
      </div>
      
      <!-- 购买装备 -->
      <div class="shop-section">
        <h3>⚔️ 购买装备</h3>
        <div class="equipment-types">
          <button 
            v-for="type in equipmentTypes" 
            :key="type"
            class="equip-type-btn"
            :class="{ active: selectedType === type }"
            @click="selectEquipmentType(type)"
          >
            {{ getTypeName(type) }}
          </button>
        </div>
        <div v-if="selectedType" class="equipment-preview">
          <div class="preview-card">
            <div class="preview-name">预览装备</div>
            <div class="preview-level">等级: {{ gameState.player.level }}</div>
            <div class="preview-stats">
              <span v-for="(value, stat) in previewStats" :key="stat" class="stat-badge">
                {{ getStatName(stat) }} +{{ value }}
              </span>
            </div>
            <div class="preview-price">💰 {{ equipmentPrice }}</div>
            <button 
              class="buy-btn" 
              :disabled="gameState.player.gold < equipmentPrice"
              @click="buyEquipment(selectedType)"
            >
              购买
            </button>
          </div>
        </div>
      </div>
      
      <!-- 出售道具 -->
      <div class="shop-section">
        <h3>📤 出售道具</h3>
        <div class="inventory-list">
          <div v-for="(item, index) in gameState.player.inventory" :key="item.id" class="inventory-item">
            <div class="item-icon-small">
              {{ item.type === 'heal' ? '❤️' : item.type === 'mana' ? '💎' : '📦' }}
            </div>
            <div class="item-info-small">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-count">x{{ item.count }}</div>
            </div>
            <div class="sell-price">💰 {{ Math.floor(item.value * 0.5) }}</div>
            <button class="sell-btn" @click="sellItem(index)">出售</button>
          </div>
          <div v-if="gameState.player.inventory.length === 0" class="empty-tip">
            没有可出售的道具
          </div>
        </div>
      </div>
      
      <!-- 装备背包（可出售和刷新词条） -->
      <div class="shop-section">
        <h3>🎒 装备背包</h3>
        <div class="equipment-bag-grid">
          <div v-for="(equip, index) in gameState.player.equipmentBag" :key="equip.uid" class="equip-card">
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
                  <span v-for="(value, stat) in equip.baseStats" :key="stat" class="stat-badge base-badge">
                    {{ getStatName(stat) }} +{{ value }}
                  </span>
                  <span v-if="Object.keys(equip.baseStats).length === 0" class="stat-badge empty-badge">
                    无
                  </span>
                </div>
                <div class="affix-stats">
                  <span class="stats-label">词条:</span>
                  <span v-for="(value, stat) in equip.affixes" :key="stat" class="stat-badge" :style="{ color: getAffixColor(stat, value) }">
                    {{ getStatName(stat) }} +{{ value }}
                  </span>
                  <span v-if="Object.keys(equip.affixes || {}).length === 0" class="stat-badge empty-badge">
                    无
                  </span>
                </div>
              </div>
            <div class="equip-actions">
              <button class="sell-btn" @click="sellEquipment(index)">
                出售 (💰{{ getEquipmentSellPrice(equip) }})
              </button>
              <button 
                class="refresh-btn" 
                :disabled="gameState.player.gold < getRefreshCost(equip)"
                @click="refreshAffixes(index)"
              >
                刷新 (💰{{ getRefreshCost(equip) }})
              </button>
            </div>
          </div>
          <div v-if="gameState.player.equipmentBag.length === 0" class="empty-tip">
            装备背包为空
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, computed } from 'vue';
import { gameState, gameActions } from '../stores/gameStore.js';
const selectedType = ref('weapon');
const equipmentTypes = ['weapon', 'necklace', 'crown', 'jade', 'chest', 'legs', 'shoes', 'leftRing', 'rightRing', 'belt'];
const typeNames = {
 weapon: '武器',
 necklace: '项链',
 crown: '头冠',
 jade: '玉佩',
 chest: '护胸甲',
 legs: '护腿甲',
 shoes: '鞋子',
 leftRing: '左手环',
 rightRing: '右手环',
 belt: '腰带',
};
const getTypeName = (type) => typeNames[type] || type;
const getStatName = (stat) => {
 const names = {
 physicalAttack: '物攻',
 magicAttack: '法攻',
 defense: '防御',
 speed: '速度',
 maxHp: '生命',
 maxMp: '法力',
 };
 return names[stat] || stat;
};
const getRarityColor = (rarity) => {
 const colors = {
 common: '#9ca3af',
 uncommon: '#22c55e',
 rare: '#3b82f6',
 epic: '#a855f7',
 legendary: '#f59e0b',
 };
 return colors[rarity] || '#9ca3af';
};
const getRarityName = (rarity) => {
 const names = {
 common: '普通',
 uncommon: '优秀',
 rare: '稀有',
 epic: '史诗',
 legendary: '传说',
 };
 return names[rarity] || '普通';
};
const getAffixColor = (stat, value) => {
 const thresholds = {
 physicalAttack: { low: 15, medium: 30, high: 50 },
 magicAttack: { low: 15, medium: 30, high: 50 },
 defense: { low: 10, medium: 20, high: 35 },
 speed: { low: 10, medium: 20, high: 35 },
 maxHp: { low: 100, medium: 200, high: 350 },
 maxMp: { low: 50, medium: 100, high: 200 },
 };
 
 const t = thresholds[stat] || { low: 10, medium: 20, high: 30 };
 
 if (value >= t.high) return '#f59e0b';
 if (value >= t.medium) return '#a855f7';
 if (value >= t.low) return '#3b82f6';
 return '#9ca3af';
};
const previewStats = computed(() => {
 const type = selectedType.value;
 const level = gameState.player.level;
 const baseStats = {
 weapon: { physicalAttack: 5 + (level - 1) * 2, magicAttack: 2 + (level - 1) * 2 },
 necklace: { maxHp: 20 + (level - 1) * 10, maxMp: 10 + (level - 1) * 5 },
 crown: { defense: Math.floor(3 + (level - 1) * 1.5), magicAttack: 3 + (level - 1) * 2 },
 jade: { maxMp: 15 + (level - 1) * 5, magicAttack: 2 + (level - 1) * 2 },
 chest: { defense: Math.floor(5 + (level - 1) * 1.5), maxHp: 30 + (level - 1) * 10 },
 legs: { defense: Math.floor(3 + (level - 1) * 1.5), speed: 2 + (level - 1) * 1 },
 shoes: { speed: 3 + (level - 1) * 1, defense: Math.floor(1 + (level - 1) * 1.5) },
 leftRing: { physicalAttack: 3 + (level - 1) * 2, speed: 1 + (level - 1) * 1 },
 rightRing: { magicAttack: 3 + (level - 1) * 2, maxMp: 5 + (level - 1) * 5 },
 belt: { maxHp: 15 + (level - 1) * 10, defense: Math.floor(2 + (level - 1) * 1.5) },
 };
 return baseStats[type] || {};
});
const equipmentPrice = computed(() => {
 const type = selectedType.value;
 const level = gameState.player.level;
 const typePrice = {
 weapon: 100,
 necklace: 80,
 crown: 80,
 jade: 70,
 chest: 120,
 legs: 100,
 shoes: 60,
 leftRing: 70,
 rightRing: 70,
 belt: 80,
 };
 return Math.floor((typePrice[type] || 50) * (1 + (level - 1) * 0.2));
});
const closeShop = () => {
 gameActions.setScreen('map');
};
const selectEquipmentType = (type) => {
 selectedType.value = type;
};
const buyItem = (item) => {
 if (gameActions.buyItem(item)) {
 alert(`购买成功！获得 ${item.name}`);
 }
 else {
 alert('金币不足！');
 }
};
const buyEquipment = (type) => {
 const result = gameActions.buyEquipment(type);
 if (result) {
 alert(`购买成功！获得 ${result.name}`);
 }
 else {
 alert('金币不足！');
 }
};
const sellItem = (index) => {
 const price = gameActions.sellItem(index);
 if (price > 0) {
 alert(`出售成功！获得 ${price} 金币`);
 }
};
const getEquipmentSellPrice = (equipment) => {
 return gameActions.getEquipmentSellPrice(equipment);
};
const getRefreshCost = (equipment) => {
 return Math.floor(50 * equipment.level);
};
const sellEquipment = (index) => {
 const price = gameActions.sellEquipmentForGold(index);
 if (price > 0) {
 alert(`出售成功！获得 ${price} 金币`);
 }
};
const refreshAffixes = (index) => {
 if (gameActions.refreshEquipmentAffixes(index)) {
 alert('刷新成功！装备词条已更新');
 }
 else {
 alert('金币不足！');
 }
};
</script>

<style scoped lang="scss">
.shop-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.3);
  
  h2 {
    margin: 0;
    color: white;
    font-size: 24px;
  }
}

.gold-display {
  font-size: 18px;
  font-weight: bold;
  color: #fbbf24;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 107, 107, 0.3);
  }
}

.panel-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.shop-section {
  margin-bottom: 30px;
  
  h3 {
    margin: 0 0 16px;
    color: white;
    font-size: 18px;
  }
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.shop-item {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.item-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.item-info {
  margin-bottom: 12px;
}

.item-name {
  color: white;
  font-weight: 500;
  margin-bottom: 4px;
}

.item-desc {
  color: #888;
  font-size: 12px;
}

.item-price {
  color: #fbbf24;
  font-weight: bold;
  margin-bottom: 12px;
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
  gap: 4px;
  margin-bottom: 12px;
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

.equip-stats {
  margin-bottom: 12px;
}

.base-stats, .affix-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
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