<template>
  <div class="game-container">
    
    <StartPanel v-if="currentPanel === 'start'" @start="startGame" :markdownComponent="markdownComponent" />
    
    
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

const props = defineProps({
  markdownComponent: {
    type: Function,
    default: () => {},
  },
});

const currentPanel = ref('start')

const gameKey = ref(0)

const startGame = () => {
  gameKey.value++
  currentPanel.value = 'game'
}

const onRestart = () => {
  gameKey.value++
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
</template>