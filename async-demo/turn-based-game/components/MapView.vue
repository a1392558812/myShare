<template>
  <div class="map-container">
    <div class="map-header">
      <h3>冒险地图</h3>
      <div class="map-level-control">
        <label>地图等级:</label>
        <input
          type="number"
          v-model.number="mapLevelInput"
          min="1"
          :max="GAME_CONFIG.MAP.MAX_LEVEL"
          @change="updateMapLevel"
        />
        <span class="level-multiplier">倍率: {{ getLevelMultiplier() }}x</span>
      </div>
      <div class="player-status-mini">
        <span>等级: {{ gameState.player.level }}</span>
        <span
          >生命: {{ formatStat(gameState.player.hp) }}/{{
            formatStat(gameState.player.maxHp)
          }}</span
        >
        <span
          >法力: {{ formatStat(gameState.player.mp) }}/{{
            formatStat(gameState.player.maxMp)
          }}</span
        >
      </div>
    </div>

    <div class="map-area" ref="mapAreaRef">
      <!-- 地图背景 -->
      <div class="map-background"></div>

      <!-- 玩家角色 -->
      <div
        class="character player-character"
        :style="mapAreaRect ? getPosition(gameState.player) : {}"
      >
        <div class="char-avatar">勇者</div>
      </div>

      <!-- 敌人 -->
      <div
        v-for="enemy in gameState.mapEnemies"
        :key="enemy.id"
        :x="enemy.x"
        :y="enemy.y"
        class="character enemy-character"
        :style="mapAreaRect ? getPosition(enemy) : {}"
        @click="handleEnemyClick(enemy)"
      >
        <div class="char-avatar enemy-avatar">{{ enemy.name }}</div>
        <div class="char-hp-bar">
          <div
            class="hp-fill"
            :style="{ width: (enemy.hp / enemy.maxHp) * 100 + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <div class="map-controls">
      <div class="d-pad">
        <button @click="move(0, -10)" class="d-btn up">↑</button>
        <div class="d-row">
          <button @click="move(-10, 0)" class="d-btn left">←</button>
          <button @click="move(10, 0)" class="d-btn right">→</button>
        </div>
        <button @click="move(0, 10)" class="d-btn down">↓</button>
      </div>
    </div>

    <div class="map-hint">
      <p>点击敌人或移动到敌人附近开始战斗！</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { gameState, gameActions } from "../stores/gameStore.js";
import { formatStat } from "../stores/utils.js";
import { GAME_CONFIG } from "../stores/constants.js";
import { generateMapEnemies } from "../stores/enemy.js";

const mapLevelInput = ref(gameState.mapLevel);
const mapAreaRef = ref(null);
const mapAreaRect = ref(null);

const getPosition = (target) => {
  return {
    left: mapAreaRect.value.width * target.x / 100 + 'px',
    top: mapAreaRect.value.height * target.y / 100 + 'px',
  };
}

const getLevelMultiplier = () => {
  if (!gameState.mapLevel || gameState.mapLevel <= 1) {
    return "1.0";
  }
  const multiplier =
    1 + GAME_CONFIG.MAP.ENEMY_LEVEL_MULTIPLIER * (gameState.mapLevel - 1);
  return multiplier.toFixed(2);
};

const updateMapLevel = () => {
  if (mapLevelInput.value < 1) mapLevelInput.value = 1;
  if (mapLevelInput.value > GAME_CONFIG.MAP.MAX_LEVEL)
    mapLevelInput.value = GAME_CONFIG.MAP.MAX_LEVEL;

  if (gameState.mapLevel !== mapLevelInput.value) {
    gameState.mapLevel = mapLevelInput.value;
    // 刷新地图敌人以应用新等级
    gameState.mapEnemies = generateMapEnemies(gameState.mapLevel, gameState.player.x, gameState.player.y);
    gameActions.endBattle();
  }
};

// 移动
const move = (dx, dy) => {
  let temDx = dx;
  let temDy = dy;
  if (gameState.player.x / 100 * mapAreaRect.value.width + 56 + dx >= mapAreaRect.value.width) {
    temDx = (mapAreaRect.value.width - gameState.player.x / 100 * mapAreaRect.value.width - 56) / mapAreaRect.value.width * 100;
  } else if (gameState.player.x / 100 * mapAreaRect.value.width + dx <= 0) {
    temDx = 0 - gameState.player.x
  } else {
    temDx = dx / mapAreaRect.value.width * 100;
  }

  if (gameState.player.y / 100 * mapAreaRect.value.height +56+ dy >= mapAreaRect.value.height) {
    temDy = (mapAreaRect.value.height - gameState.player.y / 100 * mapAreaRect.value.height - 56) / mapAreaRect.value.height * 100;
  } else if (gameState.player.y / 100 * mapAreaRect.value.height + dy <= 0) {
    temDy = 0 - gameState.player.y
  } else {
    temDy = dy / mapAreaRect.value.height * 100;
  }
  
  gameActions.movePlayer(temDx, temDy);
  checkNearbyEnemies();
};

// 检查附近敌人
const checkNearbyEnemies = () => {
  for (const enemy of gameState.mapEnemies) {
    const dist = Math.sqrt(
      Math.pow(mapAreaRect.value.width * gameState.player.x / 100 - mapAreaRect.value.width * enemy.x / 100, 2) +
        Math.pow(mapAreaRect.value.height * gameState.player.y / 100 - mapAreaRect.value.height * enemy.y / 100, 2),
    );
    if (dist < 60) {
      gameActions.startBattle();
      break;
    }
  }
};

// 点击敌人
const handleEnemyClick = (enemy) => {
  gameActions.startBattle(enemy);
};

// 键盘控制
const handleKeydown = (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      move(0, -10);
      break;
    case "ArrowDown":
    case "s":
    case "S":
      move(0, 10);
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      move(-10, 0);
      break;
    case "ArrowRight":
    case "d":
    case "D":
      move(10, 0);
      break;
  }
};

onMounted(() => {
  mapAreaRect.value = mapAreaRef.value.getBoundingClientRect();
  console.log('mapAreaRect.value', mapAreaRect.value);
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped lang="scss">
.map-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  color: white;

  h3 {
    margin: 0;
    font-size: 18px;
  }

  .map-level-control {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(59, 130, 246, 0.2);
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid rgba(59, 130, 246, 0.3);

    label {
      font-size: 13px;
      color: #93c5fd;
    }

    input {
      width: 60px;
      padding: 4px 8px;
      font-size: 14px;
      text-align: center;
      border: 1px solid #3b82f6;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.5);
      color: white;
    }

    .level-multiplier {
      font-size: 12px;
      color: #fbbf24;
      font-weight: bold;
    }
  }

  .player-status-mini {
    display: flex;
    gap: 20px;
    font-size: 14px;
  }
}

.map-area {
  position: relative;
  width: calc(100% - 4px * 2);
  height: 600px;
  background: #2d5016;
  border-radius: 8px;
  overflow: hidden;
  border: 4px solid #1a3009;
}

.map-background {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, #3d6b1a 0%, transparent 30%),
    radial-gradient(circle at 70% 60%, #3d6b1a 0%, transparent 25%),
    radial-gradient(circle at 50% 80%, #3d6b1a 0%, transparent 35%);
  opacity: 0.5;
}

.character {
  position: absolute;
  transform: translate(0%, 0%);
  cursor: pointer;
  transition: transform 0.1s;
}

.char-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 3px black;
}

.player-character .char-avatar {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border: 3px solid #0077b6;
  box-shadow: 0 0 15px rgba(79, 172, 254, 0.5);
}

.enemy-avatar {
  background: linear-gradient(135deg, #ff6b6b, #c44569);
  border: 3px solid #a83232;
  font-size: 10px;
}

.char-hp-bar {
  width: 40px;
  height: 6px;
  background: #333;
  border-radius: 3px;
  margin: 4px auto 0;
  overflow: hidden;

  .hp-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff4757, #ff6b81);
    transition: width 0.3s;
  }
}

.map-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
}

.d-pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.d-row {
  display: flex;
  gap: 4px;
}

.d-btn {
  width: 50px;
  height: 50px;
  font-size: 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

.map-hint {
  text-align: center;
  color: #888;
  font-size: 14px;
}
</style>
