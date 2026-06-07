<template>
  <div>
    <div class="turn-based-game">
      <div v-if="gameState.screen !== 'battle'" class="game-header">
        <h1>ai生成的回合制小游戏</h1>
        <div class="header-info">
          <div class="gold-display">💰 {{ gameState.player.gold }}</div>
          <button class="common-btn game-btn" @click="openCharacterPanel">
            角色信息
          </button>
          <button class="common-btn pet-btn" @click="openPetPanel">
            🐾 宠物
          </button>
          <button class="common-btn skill-btn" @click="openSkillPanel">
            📚 技能
          </button>
          <button class="common-btn shop-btn" @click="openShop">🏪 商店</button>
          <button class="common-btn danger" @click="resetGame">重置游戏</button>
        </div>
      </div>
      <div class="game-wrapper">
        <MapView v-if="gameState.screen === 'map'" />
        <BattleView v-else-if="gameState.screen === 'battle'" />
        <CharacterPanel v-else-if="gameState.screen === 'character'" />
        <PetPanel v-else-if="gameState.screen === 'pet'" />
        <Shop v-else-if="gameState.screen === 'shop'" />
        <SkillManager v-else-if="gameState.screen === 'skill'" />
      </div>
      <div v-if="gameState.screen !== 'battle'" class="game-footer">
        <div>按wasd或↑↓←→移动，或点击敌人开始战斗</div>
        <div>
          <div class="debug-mode">
            <label for="document-mode">查看文档</label>
            <input id="document-mode" type="checkbox" v-model="isDocumentMode" @input="onDocumentModeChange"/>
          </div>
           <div class="debug-mode">
            <label for="debug-mode">开启调试</label>
            <input id="debug-mode" type="checkbox" v-model="isDebugMode" @input="onDebugModeChange"/>
          </div>
        </div>
      </div>
      <DebugPanel v-if="isDebugMode" />
    </div>
    <markdownFn v-if="isDocumentMode" :text="markdownStr" />
  </div>
</template>

<script setup>
import { gameState, gameActions } from "./stores/gameStore.js";
import MapView from "./components/MapView.vue";
import BattleView from "./components/BattleView.vue";
import CharacterPanel from "./components/CharacterPanel.vue";
import PetPanel from "./components/PetPanel.vue";
import Shop from "./components/Shop.vue";
import SkillManager from "./components/SkillManager.vue";
import DebugPanel from "./components/DebugPanel.vue";
import { ref } from "vue";
import { IS_DOCUMENT_MODE, IS_DEBUG_MODE } from "./stores/constants.js";

const props = defineProps({
  markdownComponent: {
    type: Function,
    default: () => {},
  },
});

const markdownFn = props.markdownComponent();
const isDebugMode = ref(localStorage.getItem(IS_DEBUG_MODE) === "true");
const isDocumentMode = ref(localStorage.getItem(IS_DOCUMENT_MODE) === "true");

const markdownStr = ref("加载中...");
fetch("./async-demo/turn-based-game/需求.md")
  .then((res) => res.text())
  .then((text) => (markdownStr.value = text));

const onDocumentModeChange = (e) => {
  localStorage.setItem(IS_DOCUMENT_MODE, !isDocumentMode.value);
};

const onDebugModeChange = (e) => {
  localStorage.setItem(IS_DEBUG_MODE, !isDebugMode.value);
};
const openShop = () => {
  gameActions.setScreen("shop");
};

const openPetPanel = () => {
  gameActions.setScreen("pet");
};

// 打开技能面板
const openSkillPanel = () => {
  gameActions.setScreen("skill");
};

// 打开角色面板
const openCharacterPanel = () => {
  gameActions.setScreen("character");
};

// 重置游戏
const resetGame = () => {
  gameActions.resetGame();
};
</script>

<style scoped lang="scss">
@use "./async-demo/static/scss/theme.scss";

.turn-based-game {
  width: 100vw;
  min-width: 1000px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(90deg, #1a1a2e 0%, #16213e 100%);
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
  color: white;
  .gold-display {
    font-size: 18px;
    font-weight: bold;
    color: #fbbf24;
  }
  .common-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
      transform: scale(1.05);
    }
    &.pet-btn {
      background: linear-gradient(135deg, #a855f7, #7c3aed);
    }
    &.skill-btn {
      background: linear-gradient(135deg, #4facfe, #00f2fe);
    }
    &.shop-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }
    &.game-btn {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }
    &.debug-btn {
      background: linear-gradient(135deg, #fbbf24, #e67700);
    }
    &.danger {
      background: linear-gradient(135deg, #ff6b6b, #c44569);
    }
  }
}

.game-wrapper {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 700px;
}
.game-footer {
  padding: 0 24px;
  color: #fff;
  .debug-mode {
    display: flex;
    align-items: center;
    label,input {
      cursor: pointer;
    }
  }
}
</style>
