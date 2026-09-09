<template>
  <div class="code-panel">
    <div class="sidebar">
      <button class="back-btn" @click="$emit('restart')">{{ backText }}</button>
      <div class="file-list">
        <treeFile :nodes="treeList" :expandMap="expandMap" @check="onCheck" @download="downloadFile"
          @toggleFolder="toggleFolder" />
        <div v-if="treeList.length === 0" class="empty">暂无源码</div>
      </div>
    </div>
    <div class="content-area">
      <markdownFn v-if="markdownStr" :text="markdownStr" />
      <div v-else class="placeholder">选择左侧文件查看源码</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import treeFile from '../tree-file/index.vue';
import { buildPathTree, downloadFile } from '../tree-file/index.js';

/**
 * 公用「源码浏览面板」
 * 左侧文件树（tree-file），右侧渲染所选文件内容（markdown 语法高亮）。
 * 供各 demo（roguelike / how-many-dudes / echo-hunter …）复用。
 *
 * Props:
 *  - fileList          Array  宿主注入的源码清单（[{ path, suffix, content }…]）
 *  - markdownComponent Function 返回一个 markdown 渲染组件（宿主提供）
 *  - backText          String  返回按钮文案（默认「返回」）
 *  - expandAllRoot     Boolean 是否展开全部顶层文件夹（默认 true）
 *
 * Emits:
 *  - restart          返回上一层（切回开始面板）
 */
const props = defineProps({
  fileList: {
    type: Array,
    default: () => [],
  },
  markdownComponent: {
    type: Function,
    default: null,
  },
  backText: {
    type: String,
    default: '返回',
  },
  expandAllRoot: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['restart']);

const markdownFn = props.markdownComponent ? props.markdownComponent() : null;

const treeList = ref([]);
const expandMap = ref(new Map());
const markdownStr = ref('');

const toggleFolder = (node) => {
  expandMap.value.set(node, !expandMap.value.get(node));
};

const onCheck = (node) => {
  markdownStr.value = '```' + node.raw.suffix + '\n' + node.raw.content + '\n' + '```';
};

/** 默认展开顶层文件夹，便于浏览多目录源码 */
const initExpand = (roots) => {
  const targets = props.expandAllRoot ? roots : roots.slice(0, 1);
  targets.forEach((n) => {
    if (n.type === 'folder') expandMap.value.set(n, true);
  });
};

const init = () => {
  treeList.value = buildPathTree(props.fileList);
  initExpand(treeList.value);
};

init();

// 宿主 vue3-sfc-loader 渐进注入 fileList：文件加载完成后重建树，避免一直空或陈旧
watch(
  () => props.fileList.length,
  () => {
    init();
    if (treeList.value.length === 0) {
      // 树被清空（fileList 变为空）时同时清空预览区
      markdownStr.value = '';
    }
  },
);
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
  flex-shrink: 0;
}

.back-btn:hover {
  background: #f1f5f9;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.empty {
  padding: 20px;
  color: #94a3b8;
  font-size: 13px;
  text-align: center;
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
