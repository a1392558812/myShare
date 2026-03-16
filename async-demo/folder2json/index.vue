<template>
  <appContainer>
    <layoutCom
      style="width: 400px"
      title="文件夹转JSON"
      type="panel"
      :addLayerBtnList="[
        {
          label: '显示源码',
          callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }),
        },
      ]"
    >
      <control-item label="字段配置">
        <div
          class="field-config"
          v-for="(objectItem, index) in Object.keys(fieldConfig)"
          :key="index"
        >
          <div class="field-item">
            <inputCom type="checkbox" v-model="fieldConfig[objectItem].show" />
            <inputCom
              type="text"
              :modelValue="fieldConfig[objectItem].key"
              @update:modelValue="(val) => (fieldConfig[objectItem].key = val)"
              :disabled="!fieldConfig[objectItem].show"
            />
            <span>{{ fieldConfig[objectItem].label }}</span>
          </div>
        </div>
      </control-item>

      <control-item label="操作">
        <div style="display: flex; gap: 10px">
          <custom-btn-com @click="onCopy">
            {{ copyTimer === -1 ? "复制" : "复制成功" }}
          </custom-btn-com>
          <custom-btn-com @click="clear"> 清空 </custom-btn-com>
        </div>
      </control-item>
    </layoutCom>

    <layoutCom style="min-width: 800px" title="JSON输出" type="preview">
      <template #preview>
        <JsonEditor v-if="folderJson" :value="folderJson" :editable="false" />
        <div v-else class="empty-state" @click="triggerFileInput">
          <input
            ref="fileInput"
            type="file"
            webkitdirectory
            directory
            multiple
            style="display: none"
            @change="handleFolderSelect"
          />
          <p>{{ loading ? "解析中..." : "请选择文件夹" }}</p>
        </div>
      </template>
    </layoutCom>
  </appContainer>
</template>

<script setup>
import { ref, watch } from "vue";
import JsonEditor from "../components/json-editor/index.vue";

import {
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

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const fileInput = ref(null);
const selectedFolder = ref("");
const files = ref([]);
const folderJson = ref(null);
const copyTimer = ref(-1);
const loading = ref(false);

// 字段配置
const fieldConfig = ref({
  lastModifiedDate: {
    show: true,
    key: "lastModifiedDate",
    label: "最后修改日期",
    getValue: (file) => file.lastModifiedDate,
  },
  lastModified: {
    show: true,
    key: "lastModified",
    label: "最后修改日期(时间戳)",
    getValue: (file) => file.lastModified,
  },
  fileName: {
    show: true,
    key: "fileName",
    label: "文件名",
    getValue: (file, fileDate) => fileDate.fileName,
  },
  filePath: {
    show: true,
    key: "filePath",
    label: "文件路径",
    getValue: (file, fileDate) => fileDate.webkitRelativePath,
  },
  size: {
    show: true,
    key: "size",
    label: "文件大小",
    getValue: (file) => file.size,
  },
  formatSize: {
    show: true,
    key: "formatSize",
    label: "文件大小(格式化)",
    getValue: (file) => formatFileSize(file.size),
  },
  type: {
    show: true,
    key: "type",
    label: "文件类型",
    getValue: (file) => file.type,
  },
});

const triggerFileInput = () => {
  if (loading.value) return;
  fileInput.value.click();
};

const handleFolderSelect = (event) => {
  loading.value = true;
  try {
    const target = event.target;
    if (target.files && target.files.length > 0) {
      files.value = Array.from(target.files);
      const firstFile = target.files[0];
      const pathParts = firstFile.webkitRelativePath.split("/");
      selectedFolder.value = pathParts[0];
      if (files.value.length === 0) {
        folderJson.value = [];
        loading.value = false;
        return;
      }

      return buildFileTree(files.value).then((res) => {
        folderJson.value = res;
        loading.value = false;
      });
    }

    loading.value = false;
    return;
  } catch (e) {
    loading.value = false;
    console.log("handleFolderSelect error", e);
  }
};

const buildFileTree = (fileList) => {
  return new Promise((resolve) => {
    console.log("buildFileTree", fileList);
    try {
      const firstFile = fileList[0];
      const pathParts = firstFile.webkitRelativePath.split("/");
      const rootFolderName = pathParts[0];

      const root = {
        folderName: rootFolderName,
        children: [],
      };
      const pathMap = { [rootFolderName]: root };

      fileList.forEach((file) => {
        const relativePath = file.webkitRelativePath;
        const pathParts = relativePath.split("/");
        pathParts.shift();
        const fileName = pathParts.pop();

        let currentPath = rootFolderName;
        pathParts.forEach((part) => {
          const nextPath = `${currentPath}/${part}`;
          if (!pathMap[nextPath]) {
            const newDir = {
              folderName: part,
              children: [],
            };
            pathMap[nextPath] = newDir;
            const parentPath = currentPath;
            pathMap[parentPath].children.push(newDir);
          }
          currentPath = nextPath;
        });

        const fileObj = {};
        Object.keys(fieldConfig.value).forEach((key) => {
          if (fieldConfig.value[key].show) {
            fileObj[fieldConfig.value[key].key] = fieldConfig.value[
              key
            ].getValue(file, { fileName });
          }
        });

        pathMap[currentPath].children.push(fileObj);
      });
      return resolve(root);
    } catch (e) {
      console.log("buildFileTree error", e);
      return resolve([]);
    }
  });
};

const clear = () => {
  selectedFolder.value = "";
  files.value = [];
  folderJson.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const getJsonString = () => {
  if (!folderJson.value) return "{}";
  return JSON.stringify(folderJson.value, null, 2);
};

const onCopy = () => {
  clearTimeout(copyTimer.value);
  navigator.clipboard.writeText(getJsonString()).then(() => {
    copyTimer.value = setTimeout(() => {
      copyTimer.value = -1;
    }, 2000);
  });
};

watch(
  () => fieldConfig.value,
  (newV) => {
    console.log("fieldConfig", fieldConfig.value);
    if (folderJson.value && files.value.length) {
      loading.value = true;
      return buildFileTree(files.value).then((res) => {
        folderJson.value = res;
        loading.value = false;
      });
    }
  },
  {
    deep: true,
  },
);
</script>

<style scoped lang="scss">
.field-config {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .field-item {
    display: flex;
    align-items: center;
    gap: 10px;

    span {
      flex: 1;
      font-size: 14px;
      color: #666;
      flex-shrink: 0;
      white-space: nowrap;
    }
  }
}

.empty-state {
  width: 100%;
  min-height: 400px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4ecdc4;
    background-color: rgba(78, 205, 196, 0.1);
  }
}
</style>
