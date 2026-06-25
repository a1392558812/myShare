<template>
  <div class="game-container">
    <!-- ✅ 开始面板 -->
    <StartPanel v-if="currentPanel === 'start'" @start="startGame" />
    
    <!-- ✅ 游戏主界面 -->
    <GameMain 
      v-if="currentPanel === 'game'" 
      :key="gameKey"
      @restart="onRestart" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StartPanel from './components/StartPanel.vue'
import GameMain from './components/GameMain.vue'

// ✅ 当前显示的面板：'start' | 'game'
const currentPanel = ref('start')

// ✅ 游戏 key（用于强制重新挂载 GameMain，实现完全重置）
const gameKey = ref(0)

// ✅ 开始游戏
const startGame = () => {
  gameKey.value++  // 每次开始都创建新的 GameMain 实例
  currentPanel.value = 'game'
}

// ✅ 重新开始（从 GameMain 的 DeathPanel 触发）
const onRestart = () => {
  gameKey.value++  // 重新挂载 GameMain，完全重置所有状态
  // currentPanel 保持 'game'，不需要切换
}
</script>

<style scoped lang="scss">
.game-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #0f172a;
}
</style>
