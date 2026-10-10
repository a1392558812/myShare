<template>
  <div class="game-container">
    <StartPanel v-if="currentPanel === 'start'" @start="onStart" @docs="loadDocs" @code="onToCode" />

    <GameMain v-else-if="currentPanel === 'game'" :key="gameKey" :first-player="firstPlayer"
      @restart="onRestart" />

    <CodePanel v-else-if="currentPanel === 'code'" :fileList="fileList" :markdownComponent="markdownComponent"
      back-text="返回开始" @restart="onRestart" />

    <div v-else-if="currentPanel === 'docs'" class="docs-container">
      <button class="docs-back" @click="onRestart">返回</button>
      <markdownFn v-if="markdownStr" :text="markdownStr" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StartPanel from './components/StartPanel.vue'
import GameMain from './components/GameMain.vue'
import CodePanel from '../components/code-panel/index.vue'

const props = defineProps({
  fileList: {
    type: Array,
    default: () => [],
  },
  markdownComponent: {
    type: Function,
    default: () => { },
  },
})

const markdownFn = props.markdownComponent()

const currentPanel = ref('start')
const gameKey = ref(0)
const firstPlayer = ref(0)
const markdownStr = ref('')

const onStart = (first) => {
  firstPlayer.value = first
  gameKey.value++
  currentPanel.value = 'game'
}

const onToCode = () => {
  gameKey.value = 0
  currentPanel.value = 'code'
}

const loadDocs = async () => {
  gameKey.value = 0
  currentPanel.value = 'docs'
  markdownStr.value = '加载中...'
  try {
    const response = await fetch('./async-demo/billiards/README.md')
    markdownStr.value = await response.text()
  } catch (error) {
    console.error('加载设计文档失败:', error)
    markdownStr.value = '加载失败，请检查文件路径'
  }
}

const onRestart = () => {
  gameKey.value = 0
  currentPanel.value = 'start'
}
</script>

<style scoped lang="scss">
.game-container {
  height: 100vh;
  background: #060a0e;
  overflow: hidden;
}

.docs-container {
  position: relative;
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  background: #fff;
}

.docs-back {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 100;
  cursor: pointer;
}
</style>
