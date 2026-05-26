<template>
  <div class="turn-based-game">
    <div class="game-header">
      <h1>回合制战斗小游戏</h1>
      <div class="header-info">
        <div class="gold-display">💰 {{ gameState.player.gold }}</div>
        <button class="shop-btn" @click="openShop">🏪 商店</button>
      </div>
    </div>
    <div class="game-wrapper">
      <MapView v-if="gameState.screen === 'map'" />
      <BattleView v-else-if="gameState.screen === 'battle'" />
      <CharacterPanel v-else-if="gameState.screen === 'character'" />
      <Shop v-else-if="gameState.screen === 'shop'" />
    </div>
  </div>
</template>

<script setup>
import { gameState, gameActions } from "./stores/gameStore.js";
import MapView from "./components/MapView.vue";
import BattleView from "./components/BattleView.vue";
import CharacterPanel from "./components/CharacterPanel.vue";
import Shop from "./components/Shop.vue";

const openShop = () => {
  gameActions.setScreen('shop');
};
</script>

<style scoped lang="scss">
@use "./async-demo/static/scss/theme.scss";

.turn-based-game {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(90deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h1 {
    margin: 0;
    color: white;
    font-size: 20px;
    font-weight: bold;
  }
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.gold-display {
  font-size: 18px;
  font-weight: bold;
  color: #fbbf24;
}

.shop-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
}

.game-wrapper {
  flex: 1;
  width: 100%;
  min-height: 700px;
}
</style>
