<template>
  <div class="game-container">
    <StartPanel v-if="currentPanel === 'start'" :unlocked="unlocked" :endless-unlocked="endlessUnlocked"
      @start="onStart" @docs="loadDocs" @code="onToCode" />

    <GameMain v-else-if="currentPanel === 'game'" :key="gameKey" :mode="gameMode" :level-index="gameLevel"
      @back="onBack" @unlock="onUnlock" @endless="onEndless" />

    <CodePanel v-else-if="currentPanel === 'code'" :fileList="fileList" :markdownComponent="markdownComponent"
      back-text="返回世界地图" @restart="onBack" />

    <div v-else-if="currentPanel === 'docs'" class="docs-container">
      <button class="docs-back" @click="onBack">返回</button>
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

const STORE_KEY = 'mario-progress'

const currentPanel = ref('start')
const gameKey = ref(0)
const gameMode = ref('story')
const gameLevel = ref(0)
const unlocked = ref(0)
const endlessUnlocked = ref(false)
const markdownStr = ref('')

const loadProgress = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    unlocked.value = data.unlocked || 0
    endlessUnlocked.value = !!data.endless
  } catch (e) {
    unlocked.value = 0
  }
}
loadProgress()

const saveProgress = () => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ unlocked: unlocked.value, endless: endlessUnlocked.value }))
  } catch (e) { /* 忽略存储失败 */ }
}

const onStart = ({ levelIndex, mode }) => {
  gameLevel.value = levelIndex
  gameMode.value = mode
  gameKey.value++
  currentPanel.value = 'game'
}

const onEndless = () => {
  gameLevel.value = 0
  gameMode.value = 'endless'
  gameKey.value++
  currentPanel.value = 'game'
}

const onUnlock = () => {
  unlocked.value = 2
  endlessUnlocked.value = true
  saveProgress()
}

const onBack = () => {
  currentPanel.value = 'start'
}

const onToCode = () => {
  currentPanel.value = 'code'
}

const loadDocs = async () => {
  currentPanel.value = 'docs'
  markdownStr.value = '加载中...'
  try {
    const response = await fetch('./async-demo/mario/README.md')
    markdownStr.value = await response.text()
  } catch (error) {
    console.error('加载设计文档失败:', error)
    markdownStr.value = '加载失败，请检查文件路径'
  }
}
</script>

<style scoped lang="scss">
.game-container {
  height: 100vh;
  background: #0c0414;
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
