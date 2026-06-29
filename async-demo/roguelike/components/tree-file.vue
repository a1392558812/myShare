<template>
  <template v-for="node in nodes" :key="node.name + (node.raw?.path || '')">
    <div style="padding-left:16px">
      <!-- 文件夹带折叠开关 -->
      <div v-if="node.type === 'folder'">
        <div style="margin-bottom: 8px;">
          <span style="margin-right: 8px;">📁 {{ node.name }}</span>
          <button style="cursor: pointer;" @click.stop="toggle(node)">{{ expandMap.get(node) ? '收起' : '展开' }}</button>
        </div>
        <TreeItem v-if="expandMap.get(node)" :nodes="node.children" :expandMap="expandMap" @check="onCheck"
          @download="onDownloadFile" @toggleFolder="toggle" />
      </div>
      <!-- 文件 -->
      <div v-else style="margin-bottom: 8px;">
        <span style="margin-right: 8px;">📄 {{ node.name }}</span>
        <button style="margin-right: 8px; cursor: pointer;" @click.stop="onCheck(node)">查看</button>
        <button style="margin-right: 8px; cursor: pointer;" @click.stop="onDownloadFile(node)">下载</button>
      </div>
    </div>
  </template>
</template>
<script setup>
defineOptions({
  name: 'TreeItem',
})

const emit = defineEmits(["check", "download", "toggleFolder"]);

const props = defineProps({
  nodes: {
    type: Array,
    default: () => [],
  },
  expandMap: {
    type: Map,
    default: () => new Map(),
  }
});

const toggle = (node) => {
  emit('toggleFolder', node)
}

const onCheck = (node) => {
  emit("check", node)
}

const onDownloadFile = (node) => {
  emit("download", node)
}
</script>