<template>
  <raycasterGame v-if="mode === 'game'" @loadDocs="loadDocs" @loadCode="mode = 'code'" />
  <CodePanel style="height: 100vh;" v-else-if="mode === 'code'" :fileList="fileList"
    :markdownComponent="markdownComponent" @restart="mode = 'game'" />
  <div v-else-if="mode === 'docs'">
    <button style="position: fixed; left: 10px; top: 10px;" @click="mode = 'game'">返回</button>
    <markdownFn v-if="docsText" :text="docsText" />
  </div>
</template>
<script setup lang="ts">
import CodePanel from '../components/code-panel/index.vue';
import { ref } from 'vue'
import raycasterGame from './components/index.vue'

const mode = ref('game')
const docsText = ref('')

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

const loadDocs = async () => {
  mode.value = 'docs';
  docsText.value = '加载中...';
  try {
    const response = await fetch('./04.杂项整理/71.canvas与伪3D.md');
    docsText.value = await response.text();
  } catch (error) {
    console.error('加载文档失败:', error);
    docsText.value = '加载失败，请检查文件路径';
  }
}

</script>