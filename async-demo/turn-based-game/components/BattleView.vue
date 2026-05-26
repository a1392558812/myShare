<template>
  <div class="battle-container">
    <!-- 战斗信息区 -->
    <div class="battle-info">
      <div class="turn-indicator">
        <span :class="{ active: gameState.currentBattle.playerTurn }">你的回合</span>
        <span class="vs">VS</span>
        <span :class="{ active: !gameState.currentBattle.playerTurn }">{{ gameState.currentBattle.enemy.name }}的回合</span>
      </div>
    </div>
    
    <!-- 战斗场景 -->
    <div class="battle-scene">
      <!-- 敌人区域 -->
      <div class="character-area enemy-area">
        <div class="char-display">
          <div class="char-sprite enemy-sprite">{{ gameState.currentBattle.enemy.name }}</div>
          <div class="char-info">
            <h4>{{ gameState.currentBattle.enemy.name }}</h4>
            <div class="hp-bar">
              <span class="label">HP</span>
              <div class="bar-bg">
                <div class="bar-fill hp-fill" :style="{ width: (gameState.currentBattle.enemy.hp / gameState.currentBattle.enemy.maxHp * 100) + '%' }"></div>
              </div>
              <span class="value">{{ Math.max(0, gameState.currentBattle.enemy.hp) }}/{{ gameState.currentBattle.enemy.maxHp }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 玩家区域 -->
      <div class="character-area player-area">
        <div class="char-display">
          <div class="char-sprite player-sprite">勇者</div>
          <div class="char-info">
            <h4>勇者</h4>
            <div class="hp-bar">
              <span class="label">HP</span>
              <div class="bar-bg">
                <div class="bar-fill hp-fill" :style="{ width: (gameState.player.hp / gameState.player.maxHp * 100) + '%' }"></div>
              </div>
              <span class="value">{{ Math.max(0, gameState.player.hp) }}/{{ gameState.player.maxHp }}</span>
            </div>
            <div class="mp-bar">
              <span class="label">MP</span>
              <div class="bar-bg">
                <div class="bar-fill mp-fill" :style="{ width: (gameState.player.mp / gameState.player.maxMp * 100) + '%' }"></div>
              </div>
              <span class="value">{{ gameState.player.mp }}/{{ gameState.player.maxMp }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 战斗日志 -->
    <div class="battle-log">
      <div class="log-header">战斗日志</div>
      <div class="log-content" ref="logContentRef">
        <p v-for="(log, index) in gameState.battleLog" :key="index" :class="{ latest: index === gameState.battleLog.length - 1 }">
          {{ log }}
        </p>
      </div>
    </div>
    
    <!-- 操作按钮区 -->
    <div v-if="!gameState.battleResult" class="action-area">
      <div class="action-buttons">
        <button 
          class="action-btn attack-btn"
          :disabled="!gameState.currentBattle.playerTurn"
          @click="handleAttack"
        >
          ⚔️ 普攻
        </button>
        
        <div class="skill-dropdown">
          <button 
            class="action-btn skill-btn"
            :disabled="!gameState.currentBattle.playerTurn"
            @click="showSkillMenu = !showSkillMenu"
          >
            ✨ 技能
          </button>
          <div class="skill-menu" v-if="showSkillMenu">
            <div 
              v-for="skill in gameState.player.skills" 
              :key="skill.id"
              class="skill-item"
              :class="{ disabled: gameState.player.mp < skill.cost }"
              @click="handleUseSkill(skill)"
            >
              <div class="skill-name">{{ skill.name }}</div>
              <div class="skill-cost">消耗: {{ skill.cost }} MP</div>
            </div>
          </div>
        </div>
        
        <div class="item-dropdown">
          <button 
            class="action-btn item-btn"
            :disabled="!gameState.currentBattle.playerTurn || gameState.player.inventory.length === 0"
            @click="showItemMenu = !showItemMenu"
          >
            🎒 道具
          </button>
          <div class="item-menu" v-if="showItemMenu">
            <div 
              v-for="(item, index) in gameState.player.inventory" 
              :key="item.id"
              class="item-item"
              @click="handleUseItem(item, index)"
            >
              <div class="item-name">{{ item.name }} x{{ item.count }}</div>
              <div class="item-desc">{{ item.description }}</div>
            </div>
          </div>
        </div>
        
        <button 
          class="action-btn defend-btn"
          :disabled="!gameState.currentBattle.playerTurn"
          @click="handleDefend"
        >
          🛡️ 防御
        </button>
        
        <button 
          class="action-btn flee-btn"
          :disabled="!gameState.currentBattle.playerTurn"
          @click="handleFlee"
        >
          🏃 逃跑
        </button>
      </div>
    </div>
    
    <!-- 结算界面 -->
    <div v-if="gameState.battleResult" class="result-overlay">
      <div class="result-panel">
        <h2 :class="gameState.battleResult">{{ gameState.battleResult === 'victory' ? '🎉 胜利！' : '💀 失败...' }}</h2>
        <div class="result-logs">
          <p v-for="(log, index) in gameState.battleLog.slice(-5)" :key="index">{{ log }}</p>
        </div>
        <button v-if="gameState.battleResult === 'victory'" class="game-btn large" @click="handleEndBattle">
          继续冒险
        </button>
        <button v-else class="game-btn large danger" @click="handleRetry">
          重新挑战
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { gameState, gameActions } from '../stores/gameStore.js'

const showSkillMenu = ref(false)
const showItemMenu = ref(false)
const logContentRef = ref(null)

// 自动滚动日志
watch(() => gameState.battleLog, () => {
  nextTick(() => {
    if (logContentRef.value) {
      logContentRef.value.scrollTop = logContentRef.value.scrollHeight
    }
  })
})

// 处理普攻
const handleAttack = () => {
  gameActions.playerAttack()
  if (!gameState.battleResult) {
    gameActions.endPlayerTurn()
  }
}

// 处理使用技能
const handleUseSkill = (skill) => {
  gameActions.playerUseSkill(skill)
  showSkillMenu.value = false
  if (!gameState.battleResult) {
    gameActions.endPlayerTurn()
  }
}

// 处理使用道具
const handleUseItem = (item, index) => {
  gameActions.playerUseItem(item, index)
  showItemMenu.value = false
}

// 处理防御
const handleDefend = () => {
  gameActions.playerDefend()
}

// 处理逃跑
const handleFlee = () => {
  gameActions.playerFlee()
}

// 结束战斗
const handleEndBattle = () => {
  gameActions.endBattle()
}

// 重试（失败后回满血）
const handleRetry = () => {
  gameState.player.hp = gameState.player.maxHp
  gameState.player.mp = gameState.player.maxMp
  gameActions.endBattle()
}

// 点击外部关闭菜单
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.skill-dropdown')) showSkillMenu.value = false
    if (!e.target.closest('.item-dropdown')) showItemMenu.value = false
  })
})
</script>

<style scoped lang="scss">
.battle-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 20px;
}

.battle-info {
  text-align: center;
}

.turn-indicator {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.5);
  padding: 12px 24px;
  border-radius: 30px;
  
  span {
    font-size: 16px;
    color: #888;
    transition: all 0.3s;
    
    &.active {
      color: #fff;
      font-weight: bold;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
  }
  
  .vs {
    color: #667eea;
    font-weight: bold;
  }
}

.battle-scene {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
}

.character-area {
  display: flex;
  justify-content: center;
}

.enemy-area {
  align-items: flex-start;
}

.player-area {
  align-items: flex-end;
}

.char-display {
  display: flex;
  align-items: center;
  gap: 24px;
}

.char-sprite {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 5px black;
  font-size: 14px;
}

.enemy-sprite {
  background: linear-gradient(135deg, #ff6b6b, #c44569);
  border: 4px solid #a83232;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.4);
}

.player-sprite {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border: 4px solid #0077b6;
  box-shadow: 0 0 20px rgba(79, 172, 254, 0.4);
}

.char-info {
  h4 {
    margin: 0 0 12px;
    color: white;
    font-size: 18px;
  }
}

.hp-bar, .mp-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  
  .label {
    width: 30px;
    color: #aaa;
    font-size: 14px;
  }
  
  .bar-bg {
    width: 200px;
    height: 20px;
    background: #333;
    border-radius: 10px;
    overflow: hidden;
  }
  
  .bar-fill {
    height: 100%;
    transition: width 0.3s;
  }
  
  .hp-fill {
    background: linear-gradient(90deg, #ff4757, #ff6b81);
  }
  
  .mp-fill {
    background: linear-gradient(90deg, #4facfe, #00f2fe);
  }
  
  .value {
    width: 70px;
    color: white;
    font-size: 14px;
    text-align: right;
  }
}

.battle-log {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  overflow: hidden;
}

.log-header {
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.3);
  color: #888;
  font-size: 14px;
}

.log-content {
  height: 120px;
  overflow-y: auto;
  padding: 12px 16px;
  
  p {
    margin: 0 0 8px;
    color: #ccc;
    font-size: 14px;
    
    &.latest {
      color: #fff;
      font-weight: 500;
    }
  }
}

.action-area {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 14px 24px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  font-weight: 500;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:not(:disabled):hover {
    transform: translateY(-2px);
  }
}

.attack-btn { background: linear-gradient(135deg, #ff6b6b, #c44569); }
.skill-btn { background: linear-gradient(135deg, #a855f7, #7c3aed); }
.item-btn { background: linear-gradient(135deg, #f59e0b, #d97706); }
.defend-btn { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.flee-btn { background: linear-gradient(135deg, #6b7280, #4b5563); }

.skill-dropdown, .item-dropdown {
  position: relative;
}

.skill-menu, .item-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  background: #1f2937;
  border-radius: 8px;
  padding: 8px;
  min-width: 200px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.skill-item, .item-item {
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.skill-name, .item-name {
  color: white;
  font-weight: 500;
  margin-bottom: 4px;
}

.skill-cost, .item-desc {
  color: #888;
  font-size: 12px;
}

.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.result-panel {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  min-width: 400px;
  
  h2 {
    margin: 0 0 24px;
    font-size: 32px;
    
    &.victory { color: #4ade80; }
    &.defeat { color: #ff6b6b; }
  }
}

.result-logs {
  margin-bottom: 32px;
  text-align: left;
  
  p {
    margin: 8px 0;
    color: #ccc;
    font-size: 14px;
  }
}

.game-btn.large {
  padding: 16px 48px;
  font-size: 16px;
}
</style>

