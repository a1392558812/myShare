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

    <div class="map-area" ref="mapAreaRef" @click="handleMapClick">
      <!-- 地图背景 -->
      <div class="map-background"></div>

      <!-- 目标指示器 -->
      <div
        v-if="targetX !== null && targetY !== null"
        class="target-indicator"
        :style="getTargetPosition()"
      ></div>

      <!-- 玩家角色 -->
      <div
        class="character player-character"
        :style="mapAreaRect ? getPosition(gameState.player) : {}"
      >
        <div class="char-avatar">勇者</div>
      </div>

      <!-- 普通敌人 -->
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

      <!-- BOSS敌人 -->
      <div
        v-for="boss in gameState.mapBosses"
        :key="boss.id"
        :x="boss.x"
        :y="boss.y"
        class="character boss-character"
        :style="mapAreaRect ? getPosition(boss) : {}"
        @click="handleBossClick(boss)"
      >
        <div 
          class="char-avatar boss-avatar"
          :style="getBossStyle(boss.rarity)"
        >
          {{ boss.name }}
        </div>
        <div class="char-hp-bar">
          <div
            class="hp-fill"
            :style="{ width: (boss.hp / boss.maxHp) * 100 + '%' }"
          ></div>
        </div>
        <div class="boss-badge" :style="getBossBadgeStyle(boss.rarity)">
          {{ getBossRarityName(boss.rarity) }}
        </div>
      </div>
    </div>

    <!-- BOSS战斗确认对话框 -->
    <div v-if="showBossConfirm" class="boss-confirm-overlay" @click="cancelBossBattle">
      <div class="boss-confirm-dialog" @click.stop>
        <h3 class="boss-confirm-title">⚠️ BOSS挑战确认 ⚠️</h3>
        <div class="boss-info">
          <div class="boss-name">{{ selectedBoss?.name }}</div>
          <div class="boss-rarity" :style="getBossRarityTextStyle(selectedBoss?.rarity)">
            {{ getBossRarityName(selectedBoss?.rarity) }}
          </div>
          <div class="boss-stats">
            <div class="stat-row">
              <span class="stat-label">生命值:</span>
              <span class="stat-value">{{ formatStat(selectedBoss?.hp) }} / {{ formatStat(selectedBoss?.maxHp) }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">物理攻击:</span>
              <span class="stat-value">{{ selectedBoss?.physicalAttack }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">法术攻击:</span>
              <span class="stat-value">{{ selectedBoss?.magicAttack }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">防御力:</span>
              <span class="stat-value">{{ selectedBoss?.defense }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">经验奖励:</span>
              <span class="stat-value">{{ selectedBoss?.exp }}</span>
            </div>
          </div>
          <div class="boss-warning">
            <p>⚠️ 警告：挑战BOSS可能会非常困难！</p>
            <p>但奖励也会非常丰厚！</p>
          </div>
        </div>
        <div class="boss-confirm-buttons">
          <button class="cancel-btn" @click="cancelBossBattle">取消</button>
          <button class="confirm-btn" @click="startBossBattle">挑战BOSS</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { gameState, gameActions } from "../stores/gameStore.js";
import { formatStat } from "../stores/utils.js";
import { GAME_CONFIG, BOSS_CONFIG } from "../stores/constants.js";
import { generateMapEnemies, generateMapBosses } from "../stores/enemy.js";

const mapLevelInput = ref(gameState.mapLevel);
const mapAreaRef = ref(null);
const mapAreaRect = ref(null);
const showBossConfirm = ref(false);
const selectedBoss = ref(null);

// 平滑移动相关状态
const targetX = ref(null);
const targetY = ref(null);
const animationFrameId = ref(null);
const moveSpeed = 0.5; // 移动速度（百分比每帧）

const getPosition = (target) => {
  return {
    left: mapAreaRect.value.width * target.x / 100 + 'px',
    top: mapAreaRect.value.height * target.y / 100 + 'px',
  };
};

const getBossStyle = (rarity) => {
  const style = BOSS_CONFIG.STYLES[rarity];
  return {
    background: `linear-gradient(135deg, ${style.bg}, ${style.border})`,
    borderColor: style.border,
    boxShadow: `0 0 20px ${style.glow}, 0 0 40px ${style.glow}`,
  };
};

const getBossBadgeStyle = (rarity) => {
  const style = BOSS_CONFIG.STYLES[rarity];
  return {
    background: style.color,
    borderColor: style.border,
    boxShadow: `0 0 10px ${style.glow}`,
  };
};

const getBossRarityTextStyle = (rarity) => {
  const style = BOSS_CONFIG.STYLES[rarity];
  return {
    color: style.color,
  };
};

const getBossRarityName = (rarity) => {
  return BOSS_CONFIG.RARITY_NAMES[rarity];
};

const getTargetPosition = () => {
  return {
    left: mapAreaRect.value.width * targetX.value / 100 + 'px',
    top: mapAreaRect.value.height * targetY.value / 100 + 'px',
  };
};

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
    // 先生成BOSS，然后用BOSS数组作为参数生成敌人，确保不会重叠
    gameState.mapBosses = generateMapBosses(gameState.mapLevel, gameState.player.x, gameState.player.y, []);
    gameState.mapEnemies = generateMapEnemies(gameState.mapLevel, gameState.player.x, gameState.player.y, gameState.mapBosses);
    gameActions.endBattle();
  }
};

const move = (dx, dy) => {
  let temDx = dx;
  let temDy = dy;
  if (gameState.player.x / 100 * mapAreaRect.value.width + 56 + dx >= mapAreaRect.value.width) {
    temDx = (mapAreaRect.value.width - gameState.player.x / 100 * mapAreaRect.value.width - 56) / mapAreaRect.value.width * 100;
  } else if (gameState.player.x / 100 * mapAreaRect.value.width + dx <= 0) {
    temDx = 0 - gameState.player.x;
  } else {
    temDx = dx / mapAreaRect.value.width * 100;
  }

  if (gameState.player.y / 100 * mapAreaRect.value.height + 56 + dy >= mapAreaRect.value.height) {
    temDy = (mapAreaRect.value.height - gameState.player.y / 100 * mapAreaRect.value.height - 56) / mapAreaRect.value.height * 100;
  } else if (gameState.player.y / 100 * mapAreaRect.value.height + dy <= 0) {
    temDy = 0 - gameState.player.y;
  } else {
    temDy = dy / mapAreaRect.value.height * 100;
  }
  
  gameActions.movePlayer(temDx, temDy);
  checkNearbyEnemies();
};

const checkNearbyEnemies = () => {
  for (const enemy of gameState.mapEnemies) {
    const dist = Math.sqrt(
      Math.pow(mapAreaRect.value.width * gameState.player.x / 100 - mapAreaRect.value.width * enemy.x / 100, 2) +
        Math.pow(mapAreaRect.value.height * gameState.player.y / 100 - mapAreaRect.value.height * enemy.y / 100, 2),
    );
    if (dist < 60) {
      gameActions.startBattle(enemy);
      break;
    }
  }
};

const handleEnemyClick = (enemy) => {
  gameActions.startBattle(enemy);
};

const handleBossClick = (boss) => {
  selectedBoss.value = boss;
  showBossConfirm.value = true;
};

const cancelBossBattle = () => {
  showBossConfirm.value = false;
  selectedBoss.value = null;
};

const startBossBattle = () => {
  showBossConfirm.value = false;
  gameActions.startBattle(selectedBoss.value);
  selectedBoss.value = null;
};

// 停止移动动画
const stopMoving = () => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  }
  targetX.value = null;
  targetY.value = null;
};

// 平滑移动到目标位置
const moveToTarget = () => {
  if (targetX.value === null || targetY.value === null) return;

  const player = gameState.player;
  const dx = targetX.value - player.x;
  const dy = targetY.value - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 如果距离小于速度阈值，直接到达目标
  if (distance < moveSpeed) {
    gameActions.movePlayer(dx, dy);
    stopMoving();
    checkNearbyEnemies();
    return;
  }

  // 计算单位向量
  const unitX = dx / distance;
  const unitY = dy / distance;

  // 移动一步
  gameActions.movePlayer(unitX * moveSpeed, unitY * moveSpeed);
  
  // 检查是否碰到敌人
  checkNearbyEnemies();
  
  // 继续下一帧
  animationFrameId.value = requestAnimationFrame(moveToTarget);
};

// 处理地图点击事件
const handleMapClick = (event) => {
  // 检查是否点击了角色（敌人或BOSS），如果是则不处理
  const clickedElement = event.target;
  if (clickedElement.closest('.character')) {
    return;
  }

  // 计算点击位置相对于地图区域的坐标（百分比）
  const rect = mapAreaRef.value.getBoundingClientRect();
  const clickX = (event.clientX - rect.left) / rect.width * 100;
  const clickY = (event.clientY - rect.top) / rect.height * 100;

  // 限制在地图范围内
  const boundedX = Math.max(0, Math.min(100, clickX));
  const boundedY = Math.max(0, Math.min(100, clickY));

  // 停止当前移动，设置新目标
  stopMoving();
  targetX.value = boundedX;
  targetY.value = boundedY;

  // 开始移动
  moveToTarget();
};

const handleKeydown = (e) => {
  // 停止平滑移动
  stopMoving();
  
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
  stopMoving();
});
</script>

<style scoped lang="scss">
.map-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.7);
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
  min-height: 600px;
  flex: 1;
  flex-shrink: 0;
  background: #2d5016;
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
  user-select: none;
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

.boss-character {
  z-index: 10;
}

.boss-avatar {
  width: 70px;
  height: 70px;
  font-size: 12px;
  border: 4px solid;
  animation: bossPulse 2s ease-in-out infinite;
}

@keyframes bossPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
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

.boss-character .char-hp-bar {
  width: 60px;
  height: 8px;

  .hp-fill {
    background: linear-gradient(90deg, #ffd700, #ffed4a);
  }
}

.boss-badge {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  white-space: nowrap;
  border: 2px solid;
}

.boss-confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.boss-confirm-dialog {
  background: linear-gradient(180deg, #1e293b, #0f172a);
  border: 3px solid #fbbf24;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 0 50px rgba(251, 191, 36, 0.3);
}

.boss-confirm-title {
  margin: 0 0 24px 0;
  color: #fbbf24;
  font-size: 24px;
  text-align: center;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.boss-info {
  .boss-name {
    font-size: 28px;
    font-weight: bold;
    color: white;
    text-align: center;
    margin-bottom: 8px;
  }

  .boss-rarity {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 24px;
  }

  .boss-stats {
    background: rgba(0, 0, 0, 0.4);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    &:last-child {
      border-bottom: none;
    }
  }

  .stat-label {
    color: #9ca3af;
    font-size: 14px;
  }

  .stat-value {
    color: white;
    font-size: 14px;
    font-weight: bold;
  }

  .boss-warning {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid #ef4444;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    margin-bottom: 24px;

    p {
      margin: 4px 0;
      color: #fca5a5;
      font-size: 14px;
    }
  }
}

.boss-confirm-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.cancel-btn,
.confirm-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #374151;
  color: white;

  &:hover {
    background: #4b5563;
  }
}

.confirm-btn {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1e293b;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
  }
}

/* 目标指示器样式 */
.target-indicator {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #4facfe;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 1.5s ease-in-out infinite;
  background: rgba(79, 172, 254, 0.2);
  z-index: 5;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.5;
  }
}

/* 优化角色移动的平滑效果 */
.player-character {
  transition: left 0.05s linear, top 0.05s linear;
}

</style>