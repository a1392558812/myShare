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
import treeFile from './tree-file.vue';

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

const downloadFile = (node) => {
  const { path, content } = node.raw
  const fileName = path.split('/').pop();
  const blob = new Blob([content], { type: 'text/plain' });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

const toggleFolder = (node) => {
  console.log('toggleFolder', node)
  expandMap.value.set(node, !expandMap.value.get(node))
}

const onCheck = (node) => {
  console.log('onCheck111', node)
  markdownStr.value = '```' + node.raw.suffix + '\n' + node.raw.content + '\n' + '```'
}

const buildPathTree = (list) => {
  const root = {
    type: "folder",
    name: "",
    children: []
  };

  for (const item of list) {
    const segments = item.path.replace('../', '').replace('./', '').split("/").filter(s => s.trim());
    if (!segments.length) continue;

    let currentDir = root;
    // 逐层创建目录
    for (let i = 0; i < segments.length - 1; i++) {
      const dirName = segments[i];
      let folder = currentDir.children.find(
        n => n.type === "folder" && n.name === dirName
      );
      if (!folder) {
        folder = { type: "folder", name: dirName, children: [] };
        currentDir.children.push(folder);
      }
      currentDir = folder;
    }
    // 添加文件节点
    const fileName = segments[segments.length - 1];
    currentDir.children.push({
      type: "file",
      name: fileName,
      raw: item
    });
  }

  const sortTree = (nodes) => {
    nodes.sort((a, b) => {
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    nodes.forEach(node => {
      if (node.type === "folder" && node.children) {
        sortTree(node.children);
      }
    });
  }

  sortTree(root.children);

  return root.children;
}

const init = () => {
  treeList.value = buildPathTree(props.fileList)
  expandMap.value.set(treeList.value[0], true)
  expandMap.value.set(treeList.value[0].children[0], true)
}

init()
</script>