<template>
  <div class="pet-panel">
    <div class="panel-header">
      <h2>宠物面板</h2>
      <button class="close-btn" @click="closePanel">✕</button>
    </div>
    
    <div class="panel-content">
      <StatPanel
        :basic-info="petBasicInfo"
        :exp-info="petExpInfo"
        :actual-stats="petActualStats"
        :stat-points="petStatPoints"
        :free-points="gameState.pet.freePoints"
        :character="gameState.pet"
        :show-restore-buttons="false"
        @add-point="addPoint"
      />

      <EquipmentPanel
        :equipment="gameState.pet.equipment"
        :show-equipment-bag="true"
        :equipment-bag="gameState.player.equipmentBag"
        equipment-bag-title="宠物装备背包"
        equipment-bag-empty-tip="装备背包空空如也，击败敌人有概率获得装备！"
        equip-button-text="给宠物穿戴"
        :show-item-bag="false"
        @unequip-item="unequipItem"
        @equip-item="equipItem"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { gameState, gameActions } from '../stores/gameStore.js';
import { calculatePetStats } from '../stores/player.js';
import StatPanel from './panels/StatPanel.vue';
import EquipmentPanel from './panels/EquipmentPanel.vue';

const petActualStats = computed(() => {
  return calculatePetStats(gameState.pet);
});

const petBasicInfo = computed(() => ({
  宠物名: gameState.pet.name,
  等级: `Lv.${gameState.pet.level}`,
  状态: {
    text: gameState.pet.active ? '出战中' : '休息中',
    isActive: gameState.pet.active,
    action: toggleActive,
    actionText: gameState.pet.active ? '休息' : '出战',
  },
}));

const petExpInfo = computed(() => ({
  current: gameState.pet.exp,
  max: gameState.pet.expToNext,
}));

const petStatPoints = computed(() => [
  { key: "physicalAttack", label: "⚔️ 物攻点", value: gameState.pet.physicalAttackPoints },
  { key: "magicAttack", label: "✨ 法攻点", value: gameState.pet.magicAttackPoints },
  { key: "defense", label: "🛡️ 防御点", value: gameState.pet.defensePoints },
  { key: "speed", label: "💨 速度点", value: gameState.pet.speedPoints },
  { key: "maxHp", label: "💖 生命点", value: gameState.pet.maxHpPoints },
]);

const closePanel = () => {
  gameActions.setScreen('map');
};

const toggleActive = () => {
  gameActions.togglePetActive();
};

const addPoint = (key) => {
  gameActions.petAllocatePoints(key, 1);
};

const equipItem = (equipment, index) => {
  gameActions.petEquipItem(equipment, index);
};

const unequipItem = (slot) => {
  gameActions.petUnequipItem(slot);
};
</script>

<style scoped lang="scss">
.pet-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
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
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
}
</style>
