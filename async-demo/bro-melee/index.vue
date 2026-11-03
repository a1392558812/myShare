<template>
  <div class="bro-melee">
    <StartPanel v-if="panel === 'start'" @start="onStart" @docs="onDocs" @code="onCode" @gallery="onGallery" />
    <GameMain v-else-if="panel === 'game'" :key="gameKey" @restart="onBack" />
    <CharacterGallery v-else-if="panel === 'gallery'" @back="onBack" />
    <CodePanel v-else-if="panel === 'code'" :fileList="fileList" :markdownComponent="markdownComponent"
      @restart="onBack" />
    <div v-else-if="panel === 'docs'" class="docs-panel">
      <button class="docs-back" @click="onBack">返回</button>
      <markdownFn v-if="docsText" :text="docsText" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StartPanel from './components/StartPanel.vue';
import GameMain from './components/GameMain.vue';
import CharacterGallery from './components/CharacterGallery.vue';
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

const panel = ref('start');
const gameKey = ref(0);
const docsText = ref('');

const onStart = () => {
  gameKey.value += 1;
  panel.value = 'game';
};

const onCode = () => {
  panel.value = 'code';
};

const onGallery = () => {
  panel.value = 'gallery';
};

const onDocs = async () => {
  panel.value = 'docs';
  if (docsText.value) {
    return;
  }
  docsText.value = '加载中...';
  try {
    const response = await fetch('./async-demo/bro-melee/README.md');
    docsText.value = await response.text();
  } catch (error) {
    console.error('加载需求文档失败:', error);
    docsText.value = '加载失败，请检查文件路径';
  }
};

const onBack = () => {
  panel.value = 'start';
};
</script>

<style scoped lang="scss">
.bro-melee {
  height: 100vh;
  overflow: hidden;
  background: #0a0c08;
}

.docs-panel {
  height: 100vh;
  overflow-y: auto;
  background: #fff;

  .docs-back {
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 1000;
    cursor: pointer;
  }
}
</style>
