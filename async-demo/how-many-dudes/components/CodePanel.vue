<template>
  <div class="code-panel">
    <div class="sidebar">
      <button class="back-btn" @click="$emit('restart')">← 返回</button>
      <div class="file-list">
        <treeFile :nodes="treeList" :expandMap="expandMap" @check="onCheck" @download="downloadFile"
          @toggleFolder="toggleFolder" />
        <div v-if="fileList.length === 0" class="empty">暂无源码</div>
      </div>
    </div>
    <div class="content-area">
      <markdownFn v-if="markdownStr" :text="markdownStr" />
      <div v-else class="placeholder">选择左侧文件查看源码</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import treeFile from '../../components/tree-file/index.vue';
import { buildPathTree, downloadFile } from '../../components/tree-file/index.js';

const props = defineProps({
  markdownComponent: {
    type: Function,
    default: null,
  },
  fileList: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['restart']);

const markdownFn = props.markdownComponent ? props.markdownComponent() : null;

const treeList = ref([])
const expandMap = ref(new Map())
const markdownStr = ref('');

const toggleFolder = (node) => {
  console.log('toggleFolder', node)
  expandMap.value.set(node, !expandMap.value.get(node))
}

const onCheck = (node) => {
  console.log('onCheck111', node)
  markdownStr.value = '```' + node.raw.suffix + '\n' + node.raw.content + '\n' + '```'
}

const init = () => {
  treeList.value = buildPathTree(props.fileList)
  expandMap.value.set(treeList.value[0], true)
  expandMap.value.set(treeList.value[0].children[1], true)
}

init()
</script>

<style scoped>
.code-panel {
  height: 100%;
  display: flex;
  background: #fff;
  overflow: hidden;
}

.sidebar {
  width: 400px;
  flex-shrink: 0;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.back-btn {
  padding: 12px 20px;
  font-size: 14px;
  border: none;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  text-align: left;
  &:hover { background: #f1f5f9; }
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.file-item {
  padding: 6px 20px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  &:hover { background: #f1f5f9; }
  &.active { background: #e0e7ff; color: #4f46e5; font-weight: 500; }
}

.content-area {
  flex: 1;
  overflow: auto;
  padding: 20px;
  min-width: 600px;
}

.placeholder {
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
  padding-top: 40px;
}
</style>
