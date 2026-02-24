<template>
  <div class="color-picker-container">
    <appContainer>
      <layout-com style="flex: 1;" title="图片颜色点击拾取" type="panel"
        :addLayerBtnList="[{ label: '显示源码', callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }) }]">
        <div class="color-info-section">
          <div class="upload-section">
            <input type="file" id="imageUpload" accept="image/*" @change="handleImageUpload" />
            <label for="imageUpload">选择一张图片</label>
          </div>

          <controlItem label="放大镜倍数:" v-model.number="magnification" input-type="number"
            :slotProps="{ min: 0.1, max: 10, step: 0.1 }" />
          <controlItem label="放大镜大小:" v-model.number="magnifierSize" input-type="number"
            :slotProps="{ min: 50, max: 400 }" />
          <template v-if="imageUrl">
            <controlItem label="拾取颜色:" :model-value="selectedColor.hex">
              <div style="display: flex; align-items: center; gap: 5px;"
                v-for="(item, index) in [{ label: 'HEX', value: 'hex' }, { label: 'RGB', value: 'rgb' }]" :key="index">
                <div class="color-preview-label" style="cursor: pointer;"
                  @click="onCopyClick(selectedColor[item.value])">
                  <div class="color-preview" :style="{ backgroundColor: selectedColor.hex }"></div>
                  <span>{{ item.label }}:</span>
                </div>
                <inputCom :model-value="selectedColor[item.value]" input-type="text" />
              </div>
            </controlItem>
            <controlItem label="拾取位置:" :model-value="`${selectedColor.x.toFixed(2)}, ${selectedColor.y.toFixed(2)}`">
              <div style="display: flex; align-items: center; gap: 5px;" v-for="(key, index) in ['x', 'y']"
                :key="index">
                <span>{{ key }}:</span>
                <inputCom v-model.number="selectedColor[key]" type="number" />
              </div>
            </controlItem>
            <customBtnCom @click="onGetColor">获取拾取位置颜色</customBtnCom>
          </template>
        </div>

        <div class="image-section">
          <div v-if="imageUrl" class="image-container">
            <img ref="imageRef" :src="imageUrl" alt="Selected image" @click="handleImageClick"
              @mousemove="handleMouseMove" @mouseleave="handleMouseLeave" class="selected-image" />
            <canvas ref="canvasRef" style="display: none;"></canvas>

            <div v-if="magnifierVisible" class="magnifier" :style="{
              width: `${magnifierSize}px`,
              height: `${magnifierSize}px`,
              left: `${magnifierPosition.x}px`,
              top: `${magnifierPosition.y}px`
            }">
              <canvas ref="magnifierCanvasRef" class="magnifier-canvas"></canvas>
              <div class="magnifier-crosshair"></div>
            </div>
          </div>
          <label for="imageUpload" v-else class="placeholder">
            <p>支持上传或者复制图片炫取颜色</p>
          </label>
        </div>
      </layout-com>
    </appContainer>
  </div>
</template>

<script lang="jsx" setup>
import { ref, nextTick, onUnmounted } from 'vue';
import {
  appContainer,
  layoutCom,
  controlItem,
  customBtnCom,
  inputCom
} from '../components/form-control/index.vue';
import baseConfig, { toastFun } from '../static/hooks/extends.js'

defineOptions({
  extends: baseConfig({
    toast: import('../components/toast/index.vue'),
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const imageUrl = ref('');
const imageRef = ref(null);
const canvasRef = ref(null);
const selectedColor = ref({
  hex: '',
  rgb: '',
  x: 0,
  y: 0
});
const magnifierVisible = ref(false);
const magnifierPosition = ref({ x: 0, y: 0 });
const magnifierCanvasRef = ref(null);
const magnifierSize = ref(200);
const magnification = ref(1);

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      imageUrl.value = event.target.result;
      setTimeout(() => {
        initializeCanvas();
      }, 100);
    };
    reader.readAsDataURL(file);
  }
};

const onCopyClick = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    toastFun.open({
      message: `负责成功: ${text}`,
    })
  });
}

const initializeCanvas = () => {
  const img = imageRef.value;
  const canvas = canvasRef.value;
  if (img && canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  }
};

const handleImageClick = (e) => {
  const img = imageRef.value;
  const canvas = canvasRef.value;
  if (!img || !canvas) return;

  const rect = img.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  const ctx = canvas.getContext('2d');
  const pixel = ctx.getImageData(x, y, 1, 1).data;

  const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

  selectedColor.value = {
    hex,
    rgb,
    x,
    y
  };
};



const rgbToHex = (r, g, b) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const handleMouseMove = (e) => {
  const img = imageRef.value;
  if (!img) return;
  magnifierVisible.value = true;
  nextTick(() => {
    const containerRect = img.parentElement.getBoundingClientRect();
    magnifierPosition.value = {
      x: e.clientX - containerRect.left - magnifierSize.value / 2,
      y: e.clientY - containerRect.top + 20
    };
    updateMagnifier(e.clientX, e.clientY);
  })
};

const onGetColor = () => {
  const img = imageRef.value;
  const canvas = canvasRef.value;
  if (!img || !canvas) return;

  const rect = img.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const targetE = {
    clientX: selectedColor.value.x / scaleX + rect.left,
    clientY: selectedColor.value.y / scaleY + rect.top
  }
  handleMouseMove(targetE);
  handleImageClick(targetE);
}

const handleMouseLeave = () => {
  magnifierVisible.value = false;
};

const handlePaste = (e) => {
  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  if (!items || !items.length) return;
  for (let index in items) {
    const item = items[0];
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file && file.type.includes('image/')) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (event) => {
          imageUrl.value = event.target.result;
          setTimeout(() => {
            initializeCanvas();
          }, 100);
        };
        reader.readAsDataURL(file);
        toastFun.open({ message: '图片粘贴成功' });
        break;
      }
    }
  }
};

const registerPasteListener = () => {
  window.addEventListener('paste', handlePaste);
};

const unregisterPasteListener = () => {
  window.removeEventListener('paste', handlePaste);
};

const updateMagnifier = (clientX, clientY) => {
  const img = imageRef.value;
  const canvas = canvasRef.value;
  const magnifierCanvas = magnifierCanvasRef.value;

  if (!img || !canvas || !magnifierCanvas) return;

  const rect = img.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = Math.floor((clientX - rect.left) * scaleX);
  const y = Math.floor((clientY - rect.top) * scaleY);

  magnifierCanvas.width = magnifierSize.value;
  magnifierCanvas.height = magnifierSize.value;

  const ctx = magnifierCanvas.getContext('2d');
  const sourceCanvasCtx = canvas.getContext('2d');

  const zoom = magnification.value;
  const zoomedSize = magnifierSize.value / zoom;

  const startX = Math.max(0, x - zoomedSize / 2);
  const startY = Math.max(0, y - zoomedSize / 2);
  const endX = Math.min(canvas.width, startX + zoomedSize);
  const endY = Math.min(canvas.height, startY + zoomedSize);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    sourceCanvasCtx.canvas,
    startX, startY, endX - startX, endY - startY,
    0, 0, magnifierSize.value, magnifierSize.value
  );
};

registerPasteListener();

onUnmounted(() => {
  unregisterPasteListener();
});
</script>

<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.color-picker-container {
  width: 100%;
  height: 100%;

  .color-info-section {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;

    .upload-section {

      input[type="file"] {
        display: none;
      }

      label {
        display: inline-block;
        padding: 10px 20px;
        background-color: $primary-color;
        color: white;
        border-radius: $spacing-xs;
        cursor: pointer;
        transition: background-color 0.3s;
      }
    }

    .color-preview-label {
      display: flex;
      align-items: center;
      gap: 5px;

      .color-preview {
        width: 18px;
        height: 18px;
        border: 2px solid $medium-gray;
        border-radius: 6px;
        box-shadow: $shadow-light;
        cursor: pointer;
      }
    }
  }

  .image-section {
    margin: $spacing-lg 0;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    overflow: hidden;
    padding: $spacing-lg 0;

    .image-container {
      position: relative;

      .selected-image {
        max-width: 100%;
        max-height: 500px;
        cursor: crosshair;
        border: 1px solid $medium-gray;
        border-radius: $spacing-xs;
      }

      .magnifier {
        position: absolute;
        border: 2px solid $medium-gray;
        border-radius: $spacing-sm;
        box-shadow: $shadow-medium;
        background-color: white;
        overflow: hidden;
        z-index: 1000;
        pointer-events: none;

        .magnifier-canvas {
          width: 100%;
          height: 100%;
        }

        .magnifier-crosshair {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 20px;
          background-color: rgba(255, 0, 0, 0.8);
          transform: translate(-50%, -50%);
          z-index: 1001;

          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 2px;
            background-color: rgba(255, 0, 0, 0.8);
            transform: translate(-50%, -50%);
          }
        }
      }
    }

    .placeholder {
      width: 100%;
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border-radius: $spacing-xs;
      color: #666;
      cursor: pointer;
    }
  }
}
</style>
