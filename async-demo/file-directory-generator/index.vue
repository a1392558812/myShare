<template>
  <appContainer @dragenter="handleDragEnter" @dragleave="handleDragLeave" @dragover="handleDragOver" @drop="handleDrop">
    <layoutCom style="width: 320px" title="目录树生成器" type="panel" :addLayerBtnList="[
      {
        label: '显示源码',
        callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }),
      },
    ]">
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

      <control-item label="启用跳过规则" inputType="checkbox" :modelValue="skipHeavyDirectories"
        @update:modelValue="value => skipHeavyDirectories = value" />

      <div style="position: relative;">
        <control-item label="跳过规则">
          <div class="rule-list">
            <div v-for="rule in skipRules" :key="rule.name" class="rule-list-item">
              <div style="display: flex; align-items: center; gap: 2px;">
                <inputCom :disabled="!skipHeavyDirectories" type="checkbox" v-model="rule.matchAnyLevel" />
                <div>：是否匹配任意层级，当前为{{ rule.matchAnyLevel ? '任意层级' : '仅顶层' }}</div>
              </div>
              <div style="word-break: break-all;">文件夹名：{{ rule.name }}</div>
              <button v-if="skipHeavyDirectories" :disabled="!skipHeavyDirectories" class="rule-list-item-btn"
                @click="removeRule(rule.name)">x</button>
            </div>
            <div v-if="skipRules.length === 0" class="rule-empty">暂无规则，将包含所有目录</div>
          </div>
        </control-item>

        <control-item label="添加规则">
          <inputBtn :disabled="!skipHeavyDirectories" :modelValue="ruleDraftName" type="text" btn-text="+"
            placeholder="输入文件夹或路径" @update:modelValue="handleAddRule" />
          <div>支持 dist/test 路径写法</div>
        </control-item>

        <div v-if="!skipHeavyDirectories"
          style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; background-color: rgba(255,255,255,0.4);">
        </div>
      </div>

      <control-item label="使用说明">
        <div>
          <p style="font-size: 12px;" v-for="value in [
            { label: '', value: '把文件夹从资源管理器直接拖进来即可扫描' },
            { label: '', value: '超过 50000 个条目时目录树会被截断' },
            { label: '状态: ', value: statusText || '等待拖入文件夹' },
            { label: '统计: ', value: statsText || '--' },
            { label: '提示: ', value: noticeText || '--' },
            { label: '是否拖拽进来力: ', value: isDropActive },
            { label: '行数: ', value: lineCountText || '--' },
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
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { toastFun } from '../components/toast/index.js'
import InputBtn from "../components/input-btn/index.vue";
import {
  useCopyCode,
  inputCom,
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
const DEFAULT_SKIP_RULES = [
  { name: "node_modules", pathSegments: ["node_modules"], matchAnyLevel: true },
  { name: ".git", pathSegments: [".git"], matchAnyLevel: true },
];

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
 * 在目录路径段中查找命中的跳过规则，规则为路径模式（如 dist/test）。
 * matchAnyLevel 为 true 时模式可作为连续子路径出现在任意层级；否则模式必须从第一层开始前缀命中。
 * @param {string[]} directorySegments 相对所选文件夹根的目录段（不含根目录名与文件名）
 * @param {{name: string, pathSegments: string[], matchAnyLevel: boolean}[]} skipRules 跳过规则列表
 * @returns {{rule: {name: string, pathSegments: string[], matchAnyLevel: boolean}, matchedSegmentIndex: number}|null}
 *   命中规则与模式末段所在下标，未命中返回 null
 */
const findSkipRule = (directorySegments, skipRules) => {
  for (const rule of skipRules) {
    const patternLength = rule.pathSegments.length;
    const maxStartIndex = rule.matchAnyLevel
      ? directorySegments.length - patternLength
      : 0;
    for (let startIndex = 0; startIndex <= maxStartIndex; startIndex += 1) {
      const isPatternMatch = rule.pathSegments.every((segment, position) => {
        return directorySegments[startIndex + position] === segment;
      });
      if (isPatternMatch) {
        return { rule, matchedSegmentIndex: startIndex + patternLength - 1 };
      }
    }
  }
  return null;
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

const scanEntry = (entry, context, depth, trailSegments) => {
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
  const skipMatch = context.skipHeavyDirectories
    ? findSkipRule([...trailSegments, entry.name], context.skipRules)
    : null;
  if (skipMatch) {
    context.stats.skippedDirectories += 1;
    notifyProgress(context, `${entry.name}/（已跳过）`);
    return Promise.resolve(null);
  }
  context.stats.directories += 1;
  notifyProgress(context, `${entry.name}/`);
  return readAllEntries(entry.createReader())
    .then((childEntries) => {
      // 候选路径相对所选文件夹根：根目录自身不进入子级路径段，与 fileList 模式的 directorySegments 口径一致
      const childTrailSegments = depth === ROOT_DEPTH ? [] : [...trailSegments, entry.name];
      return scanEntriesSequentially(childEntries, context, depth + 1, childTrailSegments);
    })
    .then((childNodes) => {
      return { name: entry.name, kind: "directory", children: childNodes };
    })
    .catch(() => {
      return { name: entry.name, kind: "directory", children: [] };
    });
};

const scanEntriesSequentially = (entryList, context, depth, trailSegments) => {
  const nodes = [];
  const scanAtIndex = (index) => {
    if (index >= entryList.length || context.stats.truncated) {
      return Promise.resolve(nodes);
    }
    const isYieldPoint = index > 0 && index % YIELD_INTERVAL === 0;
    const pendingYield = isYieldPoint ? yieldToMainThread() : Promise.resolve();
    return pendingYield
      .then(() => {
        return scanEntry(entryList[index], context, depth, trailSegments);
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
 * @param {{skipHeavyDirectories?: boolean, maxEntries?: number, skipRules?: Array<{name: string, pathSegments: string[], matchAnyLevel: boolean}>, onProgress?: Function}} [options]
 *   skipHeavyDirectories 默认 true；skipRules 为跳过规则快照；onProgress 接收扫描统计与当前路径
 * @returns {Promise<{roots: Array, stats: {files: number, directories: number, skippedDirectories: number, truncated: boolean}}>}
 */
const scanEntries = (entryList, options = {}) => {
  const context = {
    skipHeavyDirectories: options.skipHeavyDirectories !== false,
    maxEntries: Number.isFinite(options.maxEntries)
      ? Math.max(1, Math.floor(options.maxEntries))
      : MAX_ENTRIES,
    skipRules: Array.isArray(options.skipRules) ? options.skipRules : [],
    onProgress: typeof options.onProgress === "function" ? options.onProgress : null,
    stats: createEmptyStats(),
  };
  const topLevelEntries = Array.isArray(entryList) ? entryList : [];
  return scanEntriesSequentially(topLevelEntries, context, ROOT_DEPTH, []).then(
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
 * @param {{skipHeavyDirectories?: boolean, maxEntries?: number, skipRules?: Array<{name: string, pathSegments: string[], matchAnyLevel: boolean}>}} [options] 与 scanEntries 同名选项
 * @returns {{roots: Array, stats: {files: number, directories: number, skippedDirectories: number, truncated: boolean}}}
 */
const buildTreeFromFileList = (fileList, options = {}) => {
  const skipHeavyDirectories = options.skipHeavyDirectories !== false;
  const skipRules = Array.isArray(options.skipRules) ? options.skipRules : [];
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
      const skipMatch = findSkipRule(directorySegments, skipRules);
      if (skipMatch) {
        const skippedPath = `${rootName}/${directorySegments
          .slice(0, skipMatch.matchedSegmentIndex + 1)
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
const skipRules = ref(DEFAULT_SKIP_RULES.map((rule) => ({ ...rule })));
const ruleDraftName = ref("");
const treeText = ref("");
const statusText = ref("");
const statsText = ref("");
const noticeText = ref("");
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
      skipRules: skipRules.value,
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
      skipRules: skipRules.value,
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
    const ruleNames = skipRules.value.map((rule) => {
      return rule.name;
    });
    messages.push(
      `已按规则跳过 ${stats.skippedDirectories} 个目录（${ruleNames.join("、")}），调整规则或取消勾选后可重新扫描。`
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

/**
 * 添加一条跳过规则，输入支持路径写法（dist/test，兼容反斜杠），空值忽略、重复拦截；添加后清空草稿输入框。
 * @param {string} committedName 输入框提交的文件夹或路径文本
 * @returns {void}
 */
const handleAddRule = (committedName) => {
  const patternSegments = String(committedName || "")
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (patternSegments.length === 0) {
    return;
  }
  const ruleName = patternSegments.join("/");
  const hasDuplicate = skipRules.value.some((rule) => {
    return rule.name === ruleName;
  });
  if (hasDuplicate) {
    toastFun.open({
      message: "该文件夹已在跳过规则中",
      contentStyle: toastContentStyle,
    });
    return;
  }
  skipRules.value = [
    ...skipRules.value,
    { name: ruleName, pathSegments: patternSegments, matchAnyLevel: true },
  ];
  // input-btn 内部输入框不会自动清空，先写入提交值，再于下一拍改回空串，借 modelValue 变化驱动其内部 watch 清空输入框
  ruleDraftName.value = ruleName;
  nextTick(() => {
    ruleDraftName.value = "";
  });
};

/**
 * 删除一条跳过规则。
 * @param {string} ruleName 待删除的文件夹名
 * @returns {void}
 */
const removeRule = (ruleName) => {
  skipRules.value = skipRules.value.filter((rule) => {
    return rule.name !== ruleName;
  });
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

watch(
  skipRules,
  () => {
    if (!lastSource.value || isBusy.value) {
      return;
    }
    beginScan(lastSource.value);
  },
  { deep: true }
);

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
.rule-list {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .rule-list-item {
    border: 1px solid #000;
    padding: 4px;
    position: relative;

    .rule-list-item-btn {
      padding: 0;
      margin: 0;
      width: 1em;
      height: 1em;
      font-size: 12px;
      color: red;
      cursor: pointer;
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      top: 0;
      right: 0;
      transform: translate(50%, -50%);
      border-radius: 50%;
      border: 1px solid #000;
    }
  }
}


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
