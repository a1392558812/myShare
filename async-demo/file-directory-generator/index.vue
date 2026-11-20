<template>
  <appContainer @dragenter="handleDragEnter" @dragleave="handleDragLeave" @dragover="handleDragOver" @drop="handleDrop">
    <layoutCom style="width: 320px" title="目录树生成器" type="panel" :addLayerBtnList="[
      {
        label: '显示源码',
        callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }),
      },
    ]">
      <control-item label="是否跳过node_modules/.git等目录" inputType="checkbox" :modelValue="skipHeavyDirectories"
        @update:modelValue="value => skipHeavyDirectories = value" />

      <control-item label="操作">
        <div style="display: flex; align-items: center; gap: 6px;">
          <custom-btn-com :disabled="isBusy" @click="pickFolder">
            选择文件夹
          </custom-btn-com>
          <custom-btn-com :disabled="isBusy || !treeText || copied" @click="copyTreeText">
            复制目录树
          </custom-btn-com>
          <custom-btn-com :disabled="isBusy || (!treeText && !lastSource)" @click="clearAll">
            清空
          </custom-btn-com>
        </div>
      </control-item>

      <control-item label="使用说明">
        <div>
          <p style="font-size: 12px;" v-for="value in [
            { label: '', value: '把文件夹从资源管理器直接拖进来即可扫描' },
            { label: '', value: '超过 50000 个条目时目录树会被截断' },
            { label: '', value: '生成的目录树可直接编辑，# 注释请手动添加' },
            { label: 'statusText: ', value: statusText || '等待拖入文件夹' },
            { label: 'statsText: ', value: statsText || '--' },
            { label: 'noticeText: ', value: noticeText || '--' },
            { label: 'noticeWarning: ', value: noticeWarning },
            { label: 'isDropActive: ', value: isDropActive },
            { label: 'lineCountText: ', value: lineCountText || '--' },
          ]">{{ value.label }}{{ value.value }}</p>
        </div>
      </control-item>
    </layoutCom>

    <layoutCom style="min-width: 800px" title="目录树" type="preview">
      <template #code>
        <textarea v-model="treeText" class="tree-textarea" spellcheck="false"
          placeholder="生成的目录树会显示在这里；如需 # 注释，可直接在此手动编辑"></textarea>
      </template>
    </layoutCom>

    <input ref="folderInputRef" type="file" webkitdirectory multiple hidden @change="handleFolderPicked" />
  </appContainer>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { toastFun } from '../components/toast/index.js'
import {
  useCopyCode,
  controlItem,
  customBtnCom,
  layoutCom,
  appContainer,
} from "../components/form-control/index.vue";

import baseConfig from "../static/hooks/extends.js";
defineOptions({
  extends: baseConfig({
    customDialog: import("../components/dialog/index.vue"),
  }),
});

const MAX_ENTRIES = 50000;
const YIELD_INTERVAL = 200;
const PROGRESS_INTERVAL = 80;
const ROOT_DEPTH = 1;
const SKIP_DIRECTORY_NAMES = new Set(["node_modules", ".git", ".svn", ".hg"]);
const SKIPPED_DIRECTORY_NAMES = [...SKIP_DIRECTORY_NAMES];

const CONNECTOR_BRANCH = "├── ";
const CONNECTOR_LAST = "└── ";
const PREFIX_INDENT = "    ";
const PREFIX_PIPE = "│   ";
const toastContentStyle = {}

const { copied, onCopyClick } = useCopyCode({});

/**
 * 排序规则：目录在前、文件在后，同类型按名称排序（数字按数值比较）。
 * @param {Array<{name: string, kind: string}>} nodes 同级节点
 * @returns {Array<{name: string, kind: string}>} 排序后的新数组
 */
const sortTreeNodes = (nodes) => {
  const sortedNodes = [...nodes];
  sortedNodes.sort((first, second) => {
    if (first.kind !== second.kind) {
      if (first.kind === "directory") {
        return -1;
      }
      return 1;
    }
    return first.name.localeCompare(second.name, "zh-Hans-CN", {
      numeric: true,
      sensitivity: "base",
    });
  });
  return sortedNodes;
};

const createRootRows = (rootNode, rows) => {
  const isDirectory = rootNode.kind === "directory";
  const rootLabel = isDirectory ? `${rootNode.name}/` : rootNode.name;
  rows.push(rootLabel);
  const childNodes = sortTreeNodes(
    Array.isArray(rootNode.children) ? rootNode.children : []
  );
  childNodes.forEach((childNode, index) => {
    collectNodeRows(childNode, "", index === childNodes.length - 1, rows);
  });
};

const collectNodeRows = (node, prefix, isLast, rows) => {
  const isDirectory = node.kind === "directory";
  const displayName = isDirectory ? `${node.name}/` : node.name;
  rows.push(`${prefix}${isLast ? CONNECTOR_LAST : CONNECTOR_BRANCH}${displayName}`);
  const childNodes = sortTreeNodes(
    Array.isArray(node.children) ? node.children : []
  );
  const childPrefix = `${prefix}${isLast ? PREFIX_INDENT : PREFIX_PIPE}`;
  childNodes.forEach((childNode, index) => {
    collectNodeRows(childNode, childPrefix, index === childNodes.length - 1, rows);
  });
};

/**
 * 将扫描得到的一棵或多棵目录树渲染为纯文本。
 * @param {Array<{name: string, kind: 'file'|'directory', children?: Array}>} treeRoots 根节点列表
 * @returns {{text: string, lineCount: number}} 渲染结果
 */
const renderTreeText = (treeRoots) => {
  const rows = [];
  const rootList = Array.isArray(treeRoots) ? treeRoots : [];
  rootList.forEach((rootNode) => {
    createRootRows(rootNode, rows);
  });
  return {
    text: rows.join("\n"),
    lineCount: rows.length,
  };
};

/**
 * 分批读取目录句柄下的全部条目，readEntries 每次只返回一部分，需循环调用直到返回空数组。
 * @param {FileSystemDirectoryReader} directoryReader 目录读取器
 * @returns {Promise<Array<FileSystemEntry>>} 全部子条目
 */
const readAllEntries = (directoryReader) => {
  return new Promise((resolve) => {
    const collectedEntries = [];
    const readNextBatch = () => {
      directoryReader.readEntries(
        (batchEntries) => {
          if (batchEntries.length === 0) {
            resolve(collectedEntries);
            return;
          }
          collectedEntries.push(...batchEntries);
          readNextBatch();
        },
        () => {
          resolve(collectedEntries);
        }
      );
    };
    readNextBatch();
  });
};

const hasReachedLimit = (context) => {
  return context.stats.files + context.stats.directories >= context.maxEntries;
};

const notifyProgress = (context, currentPath) => {
  if (!context.onProgress) {
    return;
  }
  context.onProgress({
    files: context.stats.files,
    directories: context.stats.directories,
    skippedDirectories: context.stats.skippedDirectories,
    currentPath,
  });
};

const yieldToMainThread = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

const scanEntry = (entry, context, depth) => {
  if (hasReachedLimit(context)) {
    context.stats.truncated = true;
    return Promise.resolve(null);
  }
  if (entry.isFile) {
    context.stats.files += 1;
    notifyProgress(context, entry.name);
    return Promise.resolve({ name: entry.name, kind: "file", children: [] });
  }
  if (!entry.isDirectory) {
    return Promise.resolve(null);
  }
  if (context.skipHeavyDirectories && SKIP_DIRECTORY_NAMES.has(entry.name)) {
    context.stats.skippedDirectories += 1;
    notifyProgress(context, `${entry.name}/（已跳过）`);
    return Promise.resolve(null);
  }
  context.stats.directories += 1;
  notifyProgress(context, `${entry.name}/`);
  return readAllEntries(entry.createReader())
    .then((childEntries) => {
      return scanEntriesSequentially(childEntries, context, depth + 1);
    })
    .then((childNodes) => {
      return { name: entry.name, kind: "directory", children: childNodes };
    })
    .catch(() => {
      return { name: entry.name, kind: "directory", children: [] };
    });
};

const scanEntriesSequentially = (entryList, context, depth) => {
  const nodes = [];
  const scanAtIndex = (index) => {
    if (index >= entryList.length || context.stats.truncated) {
      return Promise.resolve(nodes);
    }
    const isYieldPoint = index > 0 && index % YIELD_INTERVAL === 0;
    const pendingYield = isYieldPoint ? yieldToMainThread() : Promise.resolve();
    return pendingYield
      .then(() => {
        return scanEntry(entryList[index], context, depth);
      })
      .then((node) => {
        if (node) {
          nodes.push(node);
        }
        if (context.stats.truncated) {
          return nodes;
        }
        return scanAtIndex(index + 1);
      });
  };
  return scanAtIndex(0);
};

const createEmptyStats = () => {
  return {
    files: 0,
    directories: 0,
    skippedDirectories: 0,
    truncated: false,
  };
};

/**
 * 递归扫描拖入的 FileSystemEntry 列表，读取真实子目录层级。
 * @param {Array<FileSystemEntry>} entryList 顶层条目（来自 DataTransferItem.webkitGetAsEntry）
 * @param {{skipHeavyDirectories?: boolean, maxEntries?: number, onProgress?: Function}} [options]
 *   skipHeavyDirectories 默认 true；onProgress 接收扫描统计与当前路径
 * @returns {Promise<{roots: Array, stats: {files: number, directories: number, skippedDirectories: number, truncated: boolean}}>}
 */
const scanEntries = (entryList, options = {}) => {
  const context = {
    skipHeavyDirectories: options.skipHeavyDirectories !== false,
    maxEntries: Number.isFinite(options.maxEntries)
      ? Math.max(1, Math.floor(options.maxEntries))
      : MAX_ENTRIES,
    onProgress: typeof options.onProgress === "function" ? options.onProgress : null,
    stats: createEmptyStats(),
  };
  const topLevelEntries = Array.isArray(entryList) ? entryList : [];
  return scanEntriesSequentially(topLevelEntries, context, ROOT_DEPTH).then(
    (rootNodes) => {
      return {
        roots: sortTreeNodes(rootNodes),
        stats: context.stats,
      };
    }
  );
};

const ensureDirectoryNode = (rootNode, pathSegments, stats) => {
  let currentNode = rootNode;
  pathSegments.forEach((segment) => {
    let childNode = currentNode.children.find((candidate) => {
      return candidate.kind === "directory" && candidate.name === segment;
    });
    if (!childNode) {
      childNode = { name: segment, kind: "directory", children: [] };
      currentNode.children.push(childNode);
      stats.directories += 1;
    }
    currentNode = childNode;
  });
  return currentNode;
};

/**
 * 兜底入口：根据 <input webkitdirectory> 选择的文件列表构建目录树。
 * 仅依赖 webkitRelativePath，不读取子目录句柄。
 * @param {FileList|File[]} fileList 选择的文件列表
 * @param {{skipHeavyDirectories?: boolean, maxEntries?: number}} [options] 与 scanEntries 同名选项
 * @returns {{roots: Array, stats: {files: number, directories: number, skippedDirectories: number, truncated: boolean}}}
 */
const buildTreeFromFileList = (fileList, options = {}) => {
  const skipHeavyDirectories = options.skipHeavyDirectories !== false;
  const maxEntries = Number.isFinite(options.maxEntries)
    ? Math.max(1, Math.floor(options.maxEntries))
    : MAX_ENTRIES;
  const stats = createEmptyStats();
  const rootMap = new Map();
  const skippedDirectoryPaths = new Set();
  const pickedFiles = Array.from(fileList || []);

  pickedFiles.forEach((file) => {
    const relativePath = String(file.webkitRelativePath || file.name).replace(/\\/g, "/");
    const segments = relativePath.split("/").filter(Boolean);
    if (segments.length < 2) {
      return;
    }
    const rootName = segments[0];
    const directorySegments = segments.slice(1, -1);
    const fileName = segments[segments.length - 1];
    if (skipHeavyDirectories) {
      const skippedSegment = directorySegments.find((segment) => {
        return SKIP_DIRECTORY_NAMES.has(segment);
      });
      if (skippedSegment) {
        const skippedPath = `${rootName}/${directorySegments
          .slice(0, directorySegments.indexOf(skippedSegment) + 1)
          .join("/")}`;
        if (!skippedDirectoryPaths.has(skippedPath)) {
          skippedDirectoryPaths.add(skippedPath);
          stats.skippedDirectories += 1;
        }
        return;
      }
    }
    if (stats.files >= maxEntries) {
      stats.truncated = true;
      return;
    }
    let rootNode = rootMap.get(rootName);
    if (!rootNode) {
      rootNode = { name: rootName, kind: "directory", children: [] };
      rootMap.set(rootName, rootNode);
      stats.directories += 1;
    }
    const parentNode = ensureDirectoryNode(rootNode, directorySegments, stats);
    parentNode.children.push({ name: fileName, kind: "file", children: [] });
    stats.files += 1;
  });

  return {
    roots: sortTreeNodes([...rootMap.values()]),
    stats,
  };
};

// ===== 页面状态 =====
const skipHeavyDirectories = ref(true);
const treeText = ref("");
const statusText = ref("");
const statsText = ref("");
const noticeText = ref("");
const noticeWarning = ref(true);
const isBusy = ref(false);
const isDropActive = ref(false);
const lastSource = ref(null);
const treeRoots = ref([]);
const folderInputRef = ref(null);

const lineCountText = computed(() => {
  if (!treeText.value) {
    return "";
  }
  return `${treeText.value.split("\n").length} 行`;
});

let scanVersion = 0;
let dragDepth = 0;
let lastProgressTime = 0;

const renderProgress = (progress) => {
  const currentTime = Date.now();
  if (currentTime - lastProgressTime < PROGRESS_INTERVAL) {
    return;
  }
  lastProgressTime = currentTime;
  statusText.value = `正在扫描：${progress.currentPath || "…"}`;
  const skippedText =
    progress.skippedDirectories > 0
      ? ` · 跳过 ${progress.skippedDirectories} 个目录`
      : "";
  statsText.value = `${progress.files} 个文件 · ${progress.directories} 个目录${skippedText}`;
};

const runScan = (source, version) => {
  if (source.type === "entries") {
    return scanEntries(source.entries, {
      skipHeavyDirectories: skipHeavyDirectories.value,
      maxEntries: MAX_ENTRIES,
      onProgress: (progress) => {
        if (version === scanVersion) {
          renderProgress(progress);
        }
      },
    });
  }
  return Promise.resolve(
    buildTreeFromFileList(source.files, {
      skipHeavyDirectories: skipHeavyDirectories.value,
      maxEntries: MAX_ENTRIES,
    })
  );
};

const buildNoticeMessages = (stats) => {
  const messages = [];
  if (stats.truncated) {
    messages.push(`已达到 ${MAX_ENTRIES} 个条目上限，目录树已截断。`);
  }
  if (stats.skippedDirectories > 0) {
    messages.push(
      `已跳过 ${stats.skippedDirectories} 个依赖/版本库目录（${SKIPPED_DIRECTORY_NAMES.join("、")}），取消勾选开关后可重新扫描。`
    );
  }
  return messages;
};

const finishScan = (scanResult) => {
  treeRoots.value = scanResult.roots;
  const renderedTree = renderTreeText(scanResult.roots);
  treeText.value = renderedTree.text;
  const rootLabels = scanResult.roots.map((rootNode) => {
    return rootNode.kind === "directory" ? `${rootNode.name}/` : rootNode.name;
  });
  statusText.value =
    scanResult.roots.length > 0
      ? `扫描完成：${rootLabels.join("、")}`
      : "没有找到可显示的文件";
  const skippedText =
    scanResult.stats.skippedDirectories > 0
      ? ` · 跳过 ${scanResult.stats.skippedDirectories} 个目录`
      : "";
  statsText.value = `${scanResult.stats.files} 个文件 · ${scanResult.stats.directories} 个目录${skippedText}`;
  noticeWarning.value = true;
  noticeText.value = buildNoticeMessages(scanResult.stats).join(" ");
  lastProgressTime = 0;
  isBusy.value = false;
};

const beginScan = (source) => {
  scanVersion += 1;
  const currentVersion = scanVersion;
  isBusy.value = true;
  noticeText.value = "";
  statusText.value = "正在读取目录结构…";
  statsText.value = "";
  lastProgressTime = 0;
  runScan(source, currentVersion)
    .then((scanResult) => {
      if (!scanResult || currentVersion !== scanVersion) {
        return;
      }
      finishScan(scanResult);
    })
    .catch((scanError) => {
      if (currentVersion !== scanVersion) {
        return;
      }
      isBusy.value = false;
      statusText.value = "读取失败";
      statsText.value = "";
      noticeWarning.value = false;
      noticeText.value = `无法读取文件夹：${scanError && scanError.message ? scanError.message : String(scanError)
        }`;
    });
};

const clearAll = () => {
  scanVersion += 1;
  treeRoots.value = [];
  treeText.value = "";
  lastSource.value = null;
  statusText.value = "";
  statsText.value = "";
  noticeText.value = "";
  isBusy.value = false;
};

const copyTreeText = () => {
  if (treeText.value) {
    onCopyClick({
      code: treeText.value,
      startCallback: () => toastFun.open({
        message: "已复制到剪贴板",
        contentStyle: toastContentStyle
      })
    })
  }
};

const collectDropEntries = (dataTransfer) => {
  const itemList = Array.from(dataTransfer.items || []);
  const entryList = itemList.map((item) => {
    if (item.kind !== "file") {
      return null;
    }
    if (typeof item.webkitGetAsEntry !== "function") {
      return null;
    }
    return item.webkitGetAsEntry();
  });
  return entryList.filter(Boolean);
};

const handleDrop = (event) => {
  event.preventDefault();
  dragDepth = 0;
  isDropActive.value = false;
  if (isBusy.value) {
    toastFun.open({
      message: "正在扫描，请稍候",
      contentStyle: toastContentStyle,
    });
    return;
  }
  const droppedEntries = collectDropEntries(event.dataTransfer);
  if (droppedEntries.length > 0) {
    lastSource.value = { type: "entries", entries: droppedEntries };
    beginScan(lastSource.value);
    return;
  }
  const droppedFiles = Array.from(event.dataTransfer.files || []);
  if (droppedFiles.length > 0) {
    lastSource.value = { type: "files", files: droppedFiles };
    beginScan(lastSource.value);
    return;
  }
  noticeWarning.value = false;
  noticeText.value = "没有识别到文件夹，请从文件资源管理器直接拖入文件夹。";
};

const handleDragEnter = (event) => {
  event.preventDefault();
  dragDepth += 1;
  isDropActive.value = true;
};

const handleDragLeave = (event) => {
  event.preventDefault();
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) {
    isDropActive.value = false;
  }
};

const handleDragOver = (event) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }
};

const pickFolder = () => {
  console.log("pickFolder", isBusy.value, folderInputRef.value);
  if (isBusy.value) {
    toastFun.open({
      message: "正在扫描，请稍候",
      contentStyle: toastContentStyle
    });
    return;
  }
  folderInputRef.value.click();
};

const handleFolderPicked = (event) => {
  const pickedFiles = Array.from(event.target.files || []);
  event.target.value = "";
  if (pickedFiles.length === 0) {
    return;
  }
  if (isBusy.value) {
    toastFun.open({
      message: "正在扫描，请稍候",
      contentStyle: toastContentStyle
    });
    return;
  }
  lastSource.value = { type: "files", files: pickedFiles };
  beginScan(lastSource.value);
};

const handleDocumentDragOver = (event) => {
  event.preventDefault();
};

const handleDocumentDrop = (event) => {
  event.preventDefault();
  dragDepth = 0;
  isDropActive.value = false;
};

watch(skipHeavyDirectories, () => {
  if (!lastSource.value || isBusy.value) {
    return;
  }
  beginScan(lastSource.value);
});

onMounted(() => {
  document.addEventListener("dragover", handleDocumentDragOver);
  document.addEventListener("drop", handleDocumentDrop);
});

onBeforeUnmount(() => {
  document.removeEventListener("dragover", handleDocumentDragOver);
  document.removeEventListener("drop", handleDocumentDrop);
});
</script>

<style scoped lang="scss">
.tree-textarea {
  width: auto;
  flex: 1;
  flex-shrink: 0;
  min-height: 660px;
  padding: 14px;
  border: 1px solid #000;
  outline: none;
  resize: none;
  font-family: Consolas, Menlo, monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow: auto;
}
</style>
