<template>
  <div class="root">
    <StartPanel v-if="screen === 'home'" @start="onStart" @docs="loadDocs('readme')" @rules="loadDocs('rules')" />

    <GameMain v-else-if="screen === 'game'" :key="gameKey" :difficulty="cfg.difficulty" :length="cfg.length"
      @exit="screen = 'home'" @finish="onFinish" />

    <FinalDialog v-if="screen === 'game' && finalResult" :final="finalResult" @menu="screen = 'home'"
      @again="onAgain" />

    <div v-else-if="screen === 'docs'" class="docs">
      <div class="docbar">
        <button class="btn" @click="screen = 'home'">← 返回</button>
        <div class="tabs ">
          <button v-for="(d, k) in DOCS" :key="k" class="btn" :class="{ on: docKey === k }" @click="loadDocs(k)">{{
            d.name }}</button>
        </div>
      </div>
      <div class="doc-body">
        <markdownFn v-if="md" :text="md" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import StartPanel from './components/StartPanel.vue'
import GameMain from './components/GameMain.vue'
import FinalDialog from './components/FinalDialog.vue'
import { STORAGE_KEY } from './constants.js'

const props = defineProps({
  fileList: { type: Array, default: () => [] },
  markdownComponent: { type: Function, default: () => () => null },
})
const markdownFn = props.markdownComponent()

/** 可切换的文档：需求文档（设计侧）与游戏规则手册（规则侧） */
const DOCS = {
  readme: { name: '需求文档', file: './async-demo/riichi-mahjong/README.md' },
  rules: { name: '游戏规则', file: './async-demo/riichi-mahjong/RULES.md' },
}

const screen = ref('home')
const docKey = ref('readme')
const gameKey = ref(0)
const cfg = ref({ difficulty: 'normal', length: 'south' })
const finalResult = ref(null)
const md = ref('')

const onStart = (c) => {
  cfg.value = c
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)) } catch (e) { /* 忽略存储失败 */ }
  finalResult.value = null
  gameKey.value++
  screen.value = 'game'
}

const onAgain = () => {
  finalResult.value = null
  gameKey.value++
}

const onFinish = (f) => { finalResult.value = f }

const docCache = {}
const loadDocs = async (key = 'readme') => {
  const doc = DOCS[key] || DOCS.readme
  docKey.value = key
  screen.value = 'docs'
  if (docCache[key]) {
    md.value = docCache[key]
    return
  }
  md.value = '加载中...'
  try {
    const res = await fetch(doc.file)
    docCache[key] = await res.text()
    md.value = docCache[key]
  } catch (e) {
    md.value = '加载失败，请检查文件路径'
  }
}

watch(screen, () => { if (screen.value !== 'game') finalResult.value = null })
</script>

<style scoped lang="scss">
.root {
  position: relative;
  height: 100vh;
  overflow: hidden;
  font-family: system-ui, "Microsoft YaHei", sans-serif;
  color: #f2efe6;
  background: #071f18;
}

.docs {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  color: #222;

  .docbar {
    display: flex;
    flex: none;
    gap: 8px;
    align-items: center;

    .tabs {
      display: flex;
      gap: 8px;
    }

    .btn {
      cursor: pointer;
    }
  }
}



.doc-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
