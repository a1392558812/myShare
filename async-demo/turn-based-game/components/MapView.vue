<template>
  <div class="map-container">
    <div class="map-header">
      <h3>冒险地图</h3>
      <div class="player-status-mini">
        <span>等级: {{ gameState.player.level }}</span>
        <span>生命: {{ gameState.player.hp }}/{{ gameState.player.maxHp }}</span>
        <span>法力: {{ gameState.player.mp }}/{{ gameState.player.maxMp }}</span>
      </div>
    </div>
    
    <div class="map-area" ref="mapAreaRef">
      <!-- 地图背景 -->
      <div class="map-background"></div>
      
      <!-- 玩家角色 -->
      <div 
        class="character player-character"
        :style="{ left: gameState.player.x + 'px', top: gameState.player.y + 'px' }"
      >
        <div class="char-avatar">勇者</div>
      </div>
      
      <!-- 敌人 -->
      <div 
        v-for="enemy in gameState.mapEnemies" 
        :key="enemy.id"
        class="character enemy-character"
        :style="{ left: enemy.x + 'px', top: enemy.y + 'px' }"
        @click="handleEnemyClick(enemy)"
      >
        <div class="char-avatar enemy-avatar">{{ enemy.name }}</div>
        <div class="char-hp-bar">
          <div class="hp-fill" :style="{ width: (enemy.hp / enemy.maxHp * 100) + '%' }"></div>
        </div>
      </div>
    </div>
    
    <div class="map-controls">
      <div class="d-pad">
        <button @click="move(0, -40)" class="d-btn up">↑</button>
        <div class="d-row">
          <button @click="move(-40, 0)" class="d-btn left">←</button>
          <button @click="move(40, 0)" class="d-btn right">→</button>
        </div>
        <button @click="move(0, 40)" class="d-btn down">↓</button>
      </div>
      
      <div class="action-buttons">
        <button class="game-btn" @click="openCharacterPanel">角色信息</button>
        <button class="game-btn danger" @click="resetGame">重置游戏</button>
      </div>
    </div>
    
    <div class="map-hint">
      <p>点击敌人或移动到敌人附近开始战斗！</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { gameState, gameActions } from '../stores/gameStore.js'

// 移动
const move = (dx, dy) => {
  gameActions.movePlayer(dx, dy)
  checkNearbyEnemies()
}

// 检查附近敌人
const checkNearbyEnemies = () => {
  for (const enemy of gameState.mapEnemies) {
    const dist = Math.sqrt(
      Math.pow(gameState.player.x - enemy.x, 2) + Math.pow(gameState.player.y - enemy.y, 2)
    )
    if (dist < 60) {
      gameActions.startBattle(enemy)
      break
    }
  }
}

// 点击敌人
const handleEnemyClick = (enemy) => {
  gameActions.startBattle(enemy)
}

// 打开角色面板
const openCharacterPanel = () => {
  gameActions.setScreen('character')
}

// 重置游戏
const resetGame = () => {
  if (confirm('确定要重置游戏吗？所有进度将丢失。')) {
    gameActions.resetGame()
  }
}

// 键盘控制
const handleKeydown = (e) => {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      move(0, -40)
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      move(0, 40)
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
      move(-40, 0)
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      move(40, 0)
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
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
  
  .player-status-mini {
    display: flex;
    gap: 20px;
    font-size: 14px;
  }
}

.map-area {
  position: relative;
  width: 800px;
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
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: transform 0.1s;
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }
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

.action-buttons {
  display: flex;
  gap: 12px;
}

.game-btn {
  padding: 12px 24px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  &.danger {
    background: linear-gradient(135deg, #ff6b6b, #c44569);
  }
}

.map-hint {
  text-align: center;
  color: #888;
  font-size: 14px;
}
</style>

