<template>
  <div class="game-container">
    <StartPanel v-if="currentPanel === 'start'" :markdownComponent="markdownComponent" @start="startGame"
      @code="onToCode" @docs="loadDocs" @guide="loadGuide" />

    <GameMain v-if="currentPanel === 'game'" :key="gameKey" @restart="onRestart" />

    <CodePanel v-if="currentPanel === 'code'" :fileList="fileList" :markdownComponent="markdownComponent"
      @restart="onRestart" />

    <template v-for="(item, index) in [{ type: 'docs', value: markdownStr }, { type: 'guide', value: guideStr }]"
      :key="index">
      <div style="height: 100%; overflow: auto; background-color: #fff;" v-if="currentPanel === item.type">
        <button style="position: fixed; top: 12px; left: 12px; z-index: 100; cursor: pointer;"
          @click="onRestart">上一页</button>
        <markdownFn :text="item.value" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StartPanel from './components/StartPanel.vue'
import GameMain from './components/GameMain.vue'
import CodePanel from './components/code.vue'

const props = defineProps({
  markdownComponent: {
    type: Function,
    default: () => { },
  },
  fileList: {
    type: Array,
    default: () => [],
  }
});

const markdownFn = props.markdownComponent();

const currentPanel = ref('start')

const gameKey = ref(0)

const startGame = () => {
  gameKey.value++
  currentPanel.value = 'game'
}

const onToCode = () => {
  gameKey.value = 0
  currentPanel.value = 'code'
}

const onRestart = () => {
  gameKey.value = 0
  currentPanel.value = 'start'
}

const markdownStr = ref("");
const guideStr = ref("");

const loadDocs = async () => {
  gameKey.value = 0
  currentPanel.value = 'docs'
  markdownStr.value = "加载中..."
  try {
    const response = await fetch("./async-demo/roguelike/README.md");
    const text = await response.text();
    markdownStr.value = text;
  } catch (error) {
    console.error("加载需求文档失败:", error);
    markdownStr.value = "加载失败，请检查文件路径";
  }
};

const loadGuide = async () => {
  gameKey.value = 0
  currentPanel.value = 'guide'
  guideStr.value = "加载中..."
  try {
    const response = await fetch("./async-demo/roguelike/guide.md");
    const text = await response.text();
    guideStr.value = text;
  } catch (error) {
    console.error("加载新手指导失败:", error);
    guideStr.value = "加载失败，请检查文件路径";
  }
};
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