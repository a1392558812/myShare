<template>
  <div class="game-container">
    <StartPanel v-if="currentPanel === 'start'" @start="onStart" @docs="loadDocs" @code="onToCode" @units="onUnits" />
    <GameMain v-else-if="currentPanel === 'game'" :key="gameKey" @restart="onRestart" />
    <CodePanel v-else-if="currentPanel === 'code'" :fileList="fileList" :markdownComponent="markdownComponent"
      @restart="onRestart" />
    <UnitDraw v-else-if="currentPanel === 'units'" @back="onRestart" />
    <div v-else-if="currentPanel === 'docs'" class="docs-container">
      <button class="docs-back" @click="onRestart">返回</button>
      <markdownFn v-if="markdownStr" :text="markdownStr" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StartPanel from './components/StartPanel.vue';
import GameMain from './components/GameMain.vue';
import UnitDraw from './components/UnitDraw.vue';
import CodePanel from '../components/code-panel/index.vue';

const props = defineProps({
  fileList: {
    type: Array,
    default: () => [],
  },
  markdownComponent: {
    type: Function,
    default: () => { },
  },
});

const markdownFn = props.markdownComponent();

const currentPanel = ref('start');
const gameKey = ref(0);
const markdownStr = ref('');

const onStart = () => {
  gameKey.value++;
  currentPanel.value = 'game';
};

const onToCode = () => {
  gameKey.value = 0;
  currentPanel.value = 'code';
};

const onUnits = () => {
  gameKey.value = 0;
  currentPanel.value = 'units';
};

const loadDocs = async () => {
  gameKey.value = 0;
  currentPanel.value = 'docs';
  markdownStr.value = '加载中...';
  try {
    const response = await fetch('./async-demo/echo-hunter/README.md');
    const text = await response.text();
    markdownStr.value = text;
  } catch (error) {
    console.error('加载需求文档失败:', error);
    markdownStr.value = '加载失败，请检查文件路径';
  }
};

const onRestart = () => {
  gameKey.value = 0;
  currentPanel.value = 'start';
};
</script>

<style scoped lang="scss">
.game-container {
  height: 100vh;
  background: #020409;
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
