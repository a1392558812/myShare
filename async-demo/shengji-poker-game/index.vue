<template>
  <div class="root">
    <StartPanel v-if="screen === 'home'" @start="onStart" @watch="onWatch" @docs="loadDocs('readme')"
      @rules="loadDocs('rules')" />

    <GameMain v-else-if="screen === 'game'" :key="gameKey" :auto-watch="autoWatch" @exit="screen = 'home'" />

    <div v-else class="docs">
      <div class="docbar">
        <button @click="screen = 'home'">← 返回</button>
        <button v-for="(doc, key) in DOCS" :key="key" @click="loadDocs(key)">
          {{ doc.name }}
        </button>
      </div>
      <markdownFn :text="markdownText" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StartPanel from './components/StartPanel.vue'
import GameMain from './components/GameMain.vue'

const props = defineProps({
  fileList: { type: Array, default: () => [] },
  markdownComponent: { type: Function, default: null },
})

const markdownFn = props.markdownComponent ? props.markdownComponent() : null

const DOCS = {
  readme: { name: '技术文档', file: './async-demo/shengji-poker-game/README.md' },
  rules: { name: '游戏规则', file: './async-demo/shengji-poker-game/RULES.md' },
}

const screen = ref('home')
const docKey = ref('readme')
const gameKey = ref(0)
const autoWatch = ref(false)
const markdownText = ref('')
const cache = {}

const onStart = () => {
  autoWatch.value = false
  gameKey.value += 1
  screen.value = 'game'
}

/** 托管观战 */
const onWatch = () => {
  autoWatch.value = true
  gameKey.value += 1
  screen.value = 'game'
}

const loadDocs = async (key = 'readme') => {
  const doc = DOCS[key] || DOCS.readme
  docKey.value = key
  screen.value = 'docs'
  if (cache[key]) {
    markdownText.value = cache[key]
    return
  }
  markdownText.value = '加载中…'
  try {
    const response = await fetch(doc.file)
    if (!response.ok) {
      throw new Error(String(response.status))
    }
    cache[key] = await response.text()
    markdownText.value = cache[key]
  } catch (error) {
    markdownText.value = '文档加载失败，请确认文件存在：' + doc.file
  }
}

const clearCache = () => {
  Object.keys(cache).forEach((key) => {
    delete cache[key]
  })
}

defineExpose({ clearCache })
</script>

<style scoped lang="scss">
.root {
  position: relative;
  height: 100vh;
  overflow: hidden;
  font-family: system-ui, "Microsoft YaHei", sans-serif;
  color: #5a5a5a;
  background: #160409;
}

.docs {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  color: #23201d;
  overflow: auto;

  .docbar {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 18px;
  }
}
</style>
