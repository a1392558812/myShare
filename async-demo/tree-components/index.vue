<template>
  <div class="tree-demo">
    <h2>树组件演示</h2>
    <div class="tree-demo-content">
      <div class="tree-demo-content-item" style="width: 400px">
        <div class="btn-group">
          <button
            class="refresh-btn"
            @click="
              treeData = generateRandomTree(
                params.minLength,
                params.maxLength,
                params.minLevel,
                params.maxLevel,
              )
            "
          >
            重新生成随机树
          </button>
          <button class="refresh-btn" @click="expandAll(treeData)">
            全部展开
          </button>
          <button class="refresh-btn" @click="collapseAll(treeData)">
            全部收起
          </button>
          <button
            class="refresh-btn"
            @click="openDialog({ overlayStyle: { zIndex: 1000 } })"
          >
            查看源码
          </button>
        </div>
        <Tree :list="treeData" @toggleClick="toggleClick" />
      </div>
      <div class="tree-demo-content-item" style="flex: 1; min-width: 800px">
        <codeContent />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Tree from "./components/index.vue";

import baseConfig from "../static/hooks/extends.js";

defineOptions({
  extends: baseConfig({
    customDialog: import("../components/dialog/index.vue"),
  }),
});

const params = {
  minLength: 2,
  maxLength: 5,
  minLevel: 1,
  maxLevel: 5,
};

const generateRandomTree = (minLength, maxLength, minLevel, maxLevel) => {
  const createNodes = (
    level,
    parentIndex = [],
    targetLevel = getRandom(minLevel, maxLevel),
  ) => {
    const isLeaf = level >= targetLevel;
    const length = getRandom(minLength, maxLength);

    return Array.from({ length }, (_, index) => {
      const childIndexList = parentIndex.concat([index]);
      const value = childIndexList.join("-");
      const hasRendered = getRandom(0, 100) % 2 === 0;
      const isOpen = getRandom(0, 100) % 2 === 0;
      const label = `【节点${value}】`;

      const node = {
        label,
        value: `【${value}】-【${new Date().getTime()}】`,
        isOpen: hasRendered ? isOpen : false,
        hasRendered,
        children: [],
      };

      if (!isLeaf) {
        const children = createNodes(level + 1, childIndexList);
        node.children = children;
        node.label = `${label}-【length: ${children.length}】`;
      }

      return node;
    });
  };

  return createNodes(0);
};

const getRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const treeData = ref(
  generateRandomTree(
    params.minLength,
    params.maxLength,
    params.minLevel,
    params.maxLevel,
  ),
);

const getTreeNodeByKeyIndex = (list, keyIndex) => {
  if (
    !Array.isArray(list) ||
    !Array.isArray(keyIndex) ||
    keyIndex.length === 0
  ) {
    console.warn("入参错误：list或keyIndex必须为非空数组");
    return undefined;
  }
  let currentNode = list;
  for (let i = 0; i < keyIndex.length; i++) {
    const index = keyIndex[i];
    if (
      !Array.isArray(currentNode) ||
      index < 0 ||
      index >= currentNode.length
    ) {
      return undefined;
    }
    currentNode = currentNode[index];
    if (i < keyIndex.length - 1) {
      if (!Array.isArray(currentNode?.children)) {
        return undefined;
      }
      currentNode = currentNode.children;
    }
  }
  return currentNode;
};

const toggleClick = ({ keyIndex, event }) => {
  const target = getTreeNodeByKeyIndex(treeData.value, keyIndex);
  console.log("toggleClick666", target);
  if (target) {
    target.isOpen = !target.isOpen;
    target.hasRendered = true;
  }
};

const expandAll = (list) => {
  list.forEach((node) => {
    node.isOpen = true;
    node.hasRendered = true;
    if (Array.isArray(node.children)) {
      expandAll(node.children);
    }
  });
};

const collapseAll = (list) => {
  list.forEach((node) => {
    node.isOpen = false;
    if (Array.isArray(node.children)) {
      collapseAll(node.children);
    }
  });
};
</script>

<style scoped>
.tree-demo {
  padding: 20px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px);
  .tree-demo-content {
    flex: 1;
    display: flex;
    gap: 20px;
    overflow: auto;
    align-items: stretch;
    .tree-demo-content-item {
      overflow: auto;
      flex-shrink: 0;
    }
  }
  .btn-group {
    margin-bottom: 10px;
    .refresh-btn {
      cursor: pointer;
      + .refresh-btn {
        margin-left: 10px;
      }
    }
  }
}

h2 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

h3 {
  color: #333;
  margin: 20px 0 15px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 5px;
}

h4 {
  color: #555;
  margin: 15px 0 10px;
}

.usage-guide {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.usage-guide ul {
  margin: 10px 0;
  padding-left: 20px;
}

.usage-guide li {
  margin: 5px 0;
  line-height: 1.4;
}

.usage-guide code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
}

.usage-guide pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 10px 0;
}

.usage-guide pre code {
  background-color: transparent;
  padding: 0;
  font-size: 13px;
  line-height: 1.4;
}
</style>
