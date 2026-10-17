<template>
  <div class="root">
    <HomePanel v-if="screen === 'home'" :best="endlessBest" @start="onStart" @endless="onEndless" @docs="loadDocs" />

    <LevelPanel v-else-if="screen === 'levels'" :unlocked="unlocked" :best="best" @back="screen = 'home'"
      @pick="onPick" />

    <GameMain v-else-if="screen === 'game'" :key="gameKey" :level="curLevel" :snapshot="curSnapshot"
      :has-next="curLevel.id < LEVELS.length" @persist="onPersist" @finish="onFinish" @next="onNext"
      @exit="screen = 'levels'" />

    <GameMain v-else-if="screen === 'endless'" :key="`e${gameKey}`" :level="endlessLevel" :carry-score="endlessCarry"
      :buffs="endlessBuffs" :has-next="false" @finish="onEndlessFinish" @stage-clear="onStageClear"
      @restart-endless="restartEndless" @exit="screen = 'home'" />

    <div v-else class="docs">
      <button class="docs-back" @click="screen = 'home'">← 返回</button>
      <markdownFn v-if="md" :text="md" />
    </div>

    <BuffDialog v-if="buffPick" :options="buffPick.options" :stage="buffPick.stage" @pick="onPickBuff" />
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import HomePanel from './components/HomePanel.vue'
import LevelPanel from './components/LevelPanel.vue'
import GameMain from './components/GameMain.vue'
import BuffDialog from './components/BuffDialog.vue'
import { LEVELS, getLevel, makeEndlessLevel } from './levels.js'
import { rollBuffs } from './buffs.js'

const props = defineProps({
  fileList: { type: Array, default: () => [] },
  markdownComponent: { type: Function, default: () => () => null },
})

const markdownFn = props.markdownComponent()

const KEY_PROGRESS = 'happy-match-3-progress'
const KEY_SNAP = 'happy-match-3-snapshot'
const KEY_ENDLESS = 'happy-match-3-endless'

/** 层间切换的延迟：留时间给最后一步的消除动画和过关音 */
const STAGE_GAP = 700

const screen = ref('home')
const gameKey = ref(0)
const curLevel = ref(LEVELS[0])
const curSnapshot = ref(null)
const unlocked = ref(1)
const best = ref({})
const md = ref('')

const endlessStage = ref(1)
const endlessCarry = ref(0)
const endlessBest = ref(null)
const endlessLevel = computed(() => makeEndlessLevel(endlessStage.value))
const endlessBuffs = ref({})
const buffPick = ref(null)
let stageTimer = 0
let pendingApply = null

/** 每几层给一次三选一 */
const BUFF_EVERY = 2

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    return fallback
  }
}
const writeJSON = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (e) { /* 忽略存储失败 */ }
}

const loadProgress = () => {
  const p = readJSON(KEY_PROGRESS, null)
  if (!p) return
  unlocked.value = Math.min(LEVELS.length, p.unlocked || 1)
  best.value = p.best || {}
}
loadProgress()
endlessBest.value = readJSON(KEY_ENDLESS, null)

const saveProgress = () => writeJSON(KEY_PROGRESS, { unlocked: unlocked.value, best: best.value })

/** 退出/重开时写入对局快照；snap 为 null 表示清除 */
const onPersist = ({ id, snap }) => {
  const all = readJSON(KEY_SNAP, {})
  if (snap) all[id] = snap
  else delete all[id]
  writeJSON(KEY_SNAP, all)
}

const onFinish = ({ id, result }) => {
  onPersist({ id, snap: null })
  if (!result.win) return
  const prev = best.value[id] || { stars: 0, score: 0 }
  best.value = {
    ...best.value,
    [id]: {
      stars: Math.max(prev.stars, result.stars),
      score: Math.max(prev.score, result.score),
    },
  }
  if (id >= unlocked.value && id < LEVELS.length) unlocked.value = id + 1
  saveProgress()
}

const onStart = () => {
  screen.value = 'levels'
}

const onPick = (id) => {
  const all = readJSON(KEY_SNAP, {})
  curLevel.value = getLevel(id)
  curSnapshot.value = all[id] || null
  gameKey.value++
  screen.value = 'game'
}

const onNext = () => {
  const nextId = Math.min(LEVELS.length, curLevel.value.id + 1)
  onPersist({ id: curLevel.value.id, snap: null })
  onPick(nextId)
}

/* ---------------- 无尽模式：层层闯关，只抬目标分 ---------------- */

const onEndless = () => {
  restartEndless()
  screen.value = 'endless'
}

const restartEndless = () => {
  clearTimeout(stageTimer)
  pendingApply = null
  buffPick.value = null
  endlessStage.value = 1
  endlessCarry.value = 0
  endlessBuffs.value = {}
  gameKey.value++
}

/** 本层达标 → 先选强化（若到了周期）再推进下一层，累计分带过去 */
const onStageClear = (result) => {
  clearTimeout(stageTimer)
  const next = result.stage + 1
  const carry = result.totalScore
  const apply = () => {
    endlessCarry.value = carry
    endlessStage.value = next
    gameKey.value++
  }
  const dueForBuff = result.stage % BUFF_EVERY === 0
  const options = dueForBuff ? rollBuffs(endlessBuffs.value, 3) : []
  if (options.length) {
    buffPick.value = { stage: next, options }
    pendingApply = apply
    return
  }
  stageTimer = setTimeout(apply, STAGE_GAP)
}

const onPickBuff = (id) => {
  const b = { ...endlessBuffs.value }
  b[id] = (b[id] || 0) + 1
  endlessBuffs.value = b
  buffPick.value = null
  const apply = pendingApply
  pendingApply = null
  if (apply) apply()
}

/** 无尽只有失败这一种终局：步数耗尽时记录最高层与最高总分 */
const onEndlessFinish = ({ result }) => {
  const prev = endlessBest.value || { stage: 0, score: 0 }
  endlessBest.value = {
    stage: Math.max(prev.stage, result.stage),
    score: Math.max(prev.score, result.totalScore),
  }
  writeJSON(KEY_ENDLESS, endlessBest.value)
}

onUnmounted(() => clearTimeout(stageTimer))

const loadDocs = async () => {
  screen.value = 'docs'
  md.value = '加载中...'
  try {
    const res = await fetch('./async-demo/happy-match-3/README.md')
    md.value = await res.text()
  } catch (e) {
    md.value = '加载失败，请检查文件路径'
  }
}
</script>

<style scoped lang="scss">
.root {
  height: 100vh;
  overflow: hidden;
  font-family: system-ui, "Microsoft YaHei", sans-serif;
  color: #fff;
}

.docs {
  position: relative;
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  background: #fff;
  color: #222;
}

.docs-back {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 100;
  cursor: pointer;
}
</style>
