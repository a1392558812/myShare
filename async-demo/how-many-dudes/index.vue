<template>
  <div class="game-container">
    <StartPanel v-if="currentPanel === 'start'" @start="onStart" @code="onToCode" @docs="loadDocs" />

    <GameMain v-if="currentPanel === 'game'" :key="gameKey" @restart="onRestart" />

    <CodePanel v-if="currentPanel === 'code'" :fileList="fileList" :markdownComponent="markdownComponent"
      @restart="onRestart" />

    <div v-if="currentPanel === 'docs'" class="docs-container">
      <button :style="{
        position: 'absolute',
        top: '12px',
        left: '12px',
        cursor: 'pointer',
      }" @click="onRestart">
        返回
      </button>
      <markdownFun v-if="currentPanel === 'docs'" :text="markdownStr" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StartPanel from './components/StartPanel.vue';
import GameMain from './components/GameMain.vue';
import CodePanel from './components/CodePanel.vue';

const props = defineProps({
  markdownComponent: {
    type: Function,
    default: () => { },
  },
  fileList: {
    type: Array,
    default: () => [],
  },
});

const markdownFun = props.markdownComponent();

const currentPanel = ref('start');
const gameKey = ref(0);
const markdownStr = ref("");

const onStart = () => {
  gameKey.value++;
  currentPanel.value = 'game';
};

const onToCode = () => {
  gameKey.value = 0;
  currentPanel.value = 'code';
};

const loadDocs = async () => {
  gameKey.value = 0
  currentPanel.value = 'docs'
  markdownStr.value = "加载中..."
  try {
    const response = await fetch("./async-demo/how-many-dudes/README.md");
    const text = await response.text();
    markdownStr.value = text;
  } catch (error) {
    console.error("加载需求文档失败:", error);
    markdownStr.value = "加载失败，请检查文件路径";
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
  background: #0f0f1a;
  overflow: hidden;

  .docs-container {
    height: 100%;
    padding: 24px;
    overflow-y: auto;
  }
}
</style>
