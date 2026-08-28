<template>
  <div style="height: 100%; display: flex; gap: 20px; overflow: auto; background: #fff;">
    <div
      style="height: 100%; overflow: auto;  display: flex; flex-direction: column; flex-shrink: 0; border-right: 1px solid #000;">
      <div style="flex-shrink: 0; width: 400px; padding: 20px; border-bottom: 1px solid #000;">
        <button style="cursor: pointer;" @click="$emit('restart')">上一页</button>
      </div>
      <div style="flex: 1; flex-shrink: 0; overflow: auto; padding: 20px 20px 40px 20px;">
        <treeFile :nodes="treeList" :expandMap="expandMap" @check="onCheck" @download="downloadFile"
          @toggleFolder="toggleFolder" />
      </div>
    </div>
    <div style="flex: 1; flex-shrink: 0; min-width: 1000px; height: 100%;  overflow: auto;">
      <markdownFn v-if="markdownStr" :text="markdownStr" />
      <div v-else>请选择文件</div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import treeFile from '../../components/tree-file/index.vue';
import { buildPathTree, downloadFile } from '../../components/tree-file/index.js';

defineEmits(["restart"]);

const props = defineProps({
  markdownComponent: {
    type: Function,
    default: null,
  },
  fileList: {
    type: Array,
    default: () => [],
  }
});

const treeList = ref([])
const expandMap = ref(new Map())

const markdownFn = props.markdownComponent();

const markdownStr = ref("");

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
  expandMap.value.set(treeList.value[0].children[0], true)
}

init()
</script>