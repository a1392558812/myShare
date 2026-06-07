<template>
  <div class="character-panel">
    <div class="panel-header">
      <h2>角色信息</h2>
      <button class="close-btn" @click="closePanel">✕</button>
    </div>

    <div class="panel-content">
      <StatPanel
        :basic-info="playerBasicInfo"
        :exp-info="playerExpInfo"
        :actual-stats="playerActualStats"
        :stat-points="playerStatPoints"
        :free-points="gameState.player.freePoints"
        :character="gameState.player"
        @add-point="addPoint"
        @restore-all="restoreAll"
      />

      <EquipmentPanel
        :equipment="gameState.player.equipment"
        :show-equipment-bag="true"
        :equipment-bag="gameState.player.equipmentBag"
        equipment-bag-title="装备背包"
        equipment-bag-empty-tip="装备背包空空如也，击败敌人有概率获得装备！"
        equip-button-text="穿戴"
        :show-item-bag="true"
        :item-bag="gameState.player.inventory"
        item-bag-title="物品背包"
        item-bag-empty-tip="背包空空如也，去战斗获取战利品吧！"
        :show-use-item-button="true"
        :show-sell-item-button="true"
        @unequip-item="unequipItem"
        @equip-item="equipItem"
        @use-item="useItem"
        @sell-item="sellItem"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { gameState, gameActions } from "../stores/gameStore.js";
import { calculatePlayerStats } from "../stores/player.js";
import StatPanel from "./panels/StatPanel.vue";
import EquipmentPanel from "./panels/EquipmentPanel.vue";

const playerActualStats = computed(() => {
  return calculatePlayerStats(gameState.player);
});

const playerBasicInfo = computed(() => ({
  角色名: gameState.player.name,
  等级: `Lv.${gameState.player.level}`,
}));

const playerExpInfo = computed(() => ({
  current: gameState.player.exp,
  max: gameState.player.expToNext,
}));

const playerStatPoints = computed(() => [
  { key: "physicalAttack", label: "⚔️ 物攻点", value: gameState.player.physicalAttackPoints },
  { key: "magicAttack", label: "✨ 法攻点", value: gameState.player.magicAttackPoints },
  { key: "defense", label: "🛡️ 防御点", value: gameState.player.defensePoints },
  { key: "speed", label: "💨 速度点", value: gameState.player.speedPoints },
  { key: "maxHp", label: "💖 生命点", value: gameState.player.maxHpPoints },
]);

const closePanel = () => {
  gameActions.setScreen("map");
};

const addPoint = (key) => {
  gameActions.allocatePoints(key, 1);
};

const restoreAll = () => {
  gameState.player.hp = gameState.player.maxHp;
  gameState.player.mp = gameState.player.maxMp;
  if (gameState.pet) {
    gameState.pet.hp = gameState.pet.maxHp;
    gameState.pet.mp = gameState.pet.maxMp;
  }
};

const useItem = (index) => {
  const item = gameState.player.inventory[index];
  const result = gameActions.useItem(item, index);
  if (result.success) {
    alert(result.message);
  }
};

const sellItem = (index) => {
  const price = gameActions.sellItem(index);
  if (price > 0) {
    alert(`出售成功！获得 ${price} 金币`);
  }
};

const equipItem = (equipment, index) => {
  gameActions.equipItem(equipment, index);
};

const unequipItem = (slot) => {
  gameActions.unequipItem(slot);
};
</script>

<style scoped lang="scss">
.character-panel {
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
