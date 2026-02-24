<template>
  <div class="gif2img">
    <h1 class="gif2img-title">解析gif转为帧图片</h1>
    <div class="upload-section">
      <input id="file-input" type="file" @change="handleFileChange" accept=".gif" />
      <label for="file-input">选择 GIF 文件 - loading: {{ loading }}</label>
    </div>
    <div v-if="frames.length">
      <h3>GIF 帧预览:</h3>
      <div class="frames-container">
        <img :src="fileUrl" />
        <div v-for="(frame, index) in frames" class="img-wrap" :key="index">
          <img :src="frame.base64Str" />
          <div class="img-actions">
            <button @click="copyBase64(frame.base64Str, index)" class="action-btn copy-btn">
              复制 Base64
            </button>
            <button @click="downloadImage(frame.base64Str, index)" class="action-btn download-btn">
              下载图片
            </button>
          </div>
        </div>
      </div>
    </div>
    <label for="file-input" v-else class="placeholder">
      <p>{{ loading ? '加载中' : '上传或复制张gif' }}</p>
    </label>
  </div>
</template>
<script setup lang="js">
import { ref, nextTick, onUnmounted } from 'vue';
import baseConfig, { toastFun } from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig({
    toast: import('../components/toast/index.vue'),
  }),
})

import SuperGif from './js/libgif.js';

const frames = ref([]);
const fileUrl = ref('');
const loading = ref(false);

const getGifFrames = (file) => {
  return new Promise((resolve) => {
    try {
      if (fileUrl.value) {
        URL.revokeObjectURL(fileUrl.value);
      }
      fileUrl.value = URL.createObjectURL(file);
      const tempImg = document.createElement('img');
      const tempContainer = document.createElement('div');

      tempImg.src = fileUrl.value;
      tempContainer.style.display = 'none';
      tempContainer.appendChild(tempImg);
      document.body.appendChild(tempContainer);

      const gifInstance = new SuperGif({ gif: tempImg });
      gifInstance.load(() => {
        const resultFrames = [];
        const frameCount = gifInstance.get_length();
        for (let i = 0; i < frameCount; i++) {
          gifInstance.move_to(i);
          const canvas = gifInstance.get_canvas();
          resultFrames.push({
            index: i,
            base64Str: canvas.toDataURL(),
          });
        }
        document.body.removeChild(tempContainer);
        resolve(resultFrames);
      });
    } catch (error) {
      toastFun.open({ message: '解析 GIF 失败' })
      console.error('解析 GIF 失败:', error);
      resolve([]);
    }
  });
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'image/gif') {
    loading.value = true;
    frames.value = await getGifFrames(file);
  } else {
    toastFun.open({ message: '请选择 GIF 文件' })
  }
  await nextTick();
  loading.value = false;
};

const copyBase64 = async (base64Str, index) => {
  try {
    await navigator.clipboard.writeText(base64Str);
    toastFun.open({ message: `第 ${index + 1} 帧 Base64 复制成功` });
  } catch (error) {
    console.error('复制 Base64 失败:', error);
    toastFun.open({ message: '复制失败，请手动复制' });
  }
};

const downloadImage = (base64Str, index) => {
  try {
    const link = document.createElement('a');
    link.href = base64Str;
    link.download = `gif-frame-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toastFun.open({ message: `第 ${index + 1} 帧图片下载成功` });
  } catch (error) {
    console.error('下载图片失败:', error);
    toastFun.open({ message: '下载失败，请重试' });
  }
};

const registerPasteListener = () => {
  window.addEventListener('paste', handlePaste);
};

const unregisterPasteListener = () => {
  window.removeEventListener('paste', handlePaste);
};

const handlePaste = (e) => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  if (!items || !items.length) return;
  for (let index in items) {
    const item = items[0];
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file && file.type.includes('image/gif')) {
        e.preventDefault();
        toastFun.open({ message: 'gif图片粘贴成功' });
        handleFileChange({ target: { files: [file] } })
        break;
      }
    }
  }
};

registerPasteListener();

onUnmounted(() => {
  unregisterPasteListener();
});
</script>
<style scoped lang="scss">
.gif2img {
  display: flex;
  flex-direction: column;
  align-items: center;

  .gif2img-title {
    margin: 20px;
    font-size: 24px;
    font-weight: 500;
  }

  .upload-section {
    margin: 20px;

    input[type="file"] {
      display: none;
    }

    label {
      display: inline-block;
      padding: 10px 20px;
      background-color: #4f46e5;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
  }

  .frames-container {
    display: grid;
    width: 1200px;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin: 20px;
    font-size: 0;
    line-height: 0;

    img {
      width: 100%;
      height: auto;
      border: 1px solid #ccc;
    }

    .img-wrap {
      position: relative;
      display: flex;
      flex-direction: column;
      font-size: 14px;
      line-height: 1.5;

      img {
        width: 100%;
        height: auto;
        border: 1px solid #ccc;
      }

      .img-actions {
        display: flex;
        gap: 5px;
        margin-top: 5px;

        .action-btn {
          flex: 1;
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;

          &:hover {
            opacity: 0.8;
          }

          &.copy-btn {
            background-color: #3b82f6;
            color: white;
          }

          &.download-btn {
            background-color: #10b981;
            color: white;
          }
        }
      }
    }
  }

  .placeholder {
    width: 1200px;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 4px;
    color: #666;
    cursor: pointer;
  }
}
</style>