<template>
  <div class="app-container" @paste="onPaste">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>图片颜色提取</h2>
          <div class="add-layer-wrap">
            <button class="add-layer-btn" @click="openDialog">查看源码</button>
          </div>
        </div>

        <div class="controls">
          <div class="control-group">
            <div class="control-tips">
              <div class="tips-title">
                <h2>提示：</h2>
              </div>
              <div class="tips-item">支持屏幕截图后直接在此处粘贴进行转化</div>
              <div class="tips-item">支持复制文件、复制图片在线地址在此处直接粘贴进行转化</div>
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>图片上传</span>
                <span class="value-display">{{ imageUrl ? '已加载' : '未设置' }}</span>
              </div>
              <div class="actions">
                <button class="action-btn" @click="clearImage">清空</button>
                <button class="action-btn" @click="uploadImage">
                  上传图片
                  <input ref="fileUploadInputRef" class="file-input" type="file" accept="image/*"
                    @change="onFileChange" />
                </button>
              </div>
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>图片链接</span>
              </div>
              <input type="text" v-model="imageUrl" placeholder="https://... 或 data:image/..." class="text-input" />
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>调色板取色数量</span>
                <span class="value-display">{{ colorNum }}</span>
              </div>
              <input type="number" v-model.number="colorNum" min="1" max="99" step="1" class="number-input">
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>最小饱和度</span>
                <span class="value-display">{{ minSaturation }}</span>
              </div>
              <input type="range" v-model.number="minSaturation" min="0" max="1" step="0.01" class="number-input">
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>最小亮度</span>
                <span class="value-display">{{ minLightness }}</span>
              </div>
              <input type="range" v-model.number="minLightness" min="0" max="1" step="0.01" class="number-input">
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>最大亮度</span>
                <span class="value-display">{{ maxLightness }}</span>
              </div>
              <input type="range" v-model.number="maxLightness" min="0" max="1" step="0.01" class="number-input">
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>内裁剪比例</span>
                <span class="value-display">{{ innerCrop }}</span>
              </div>
              <input type="range" v-model.number="innerCrop" min="0" max="0.3" step="0.01" class="number-input">
            </div>

            <div class="control-item">
              <div class="control-label">
                <div style="display: flex; align-items: center;">
                  <span>是否排除角落背景：</span>
                  <input type="checkbox" v-model="excludeCornerBg" class="number-input"></input>
                </div>
                <span class="value-display">{{ excludeCornerBg }}</span>
              </div>
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>背景颜色容差(0:关闭角落背景过滤,255:严格减少参与统计的颜色)</span>
                <span class="value-display">{{ bgTolerance }}</span>
              </div>
              <input type="number" v-model.number="bgTolerance" min="0" max="255" step="1" class="number-input">
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>透明度过滤阈值（0:完全不忽略透明，255:完全忽略透明）</span>
                <span class="value-display">{{ alphaThreshold }}</span>
              </div>
              <input type="range" v-model.number="alphaThreshold" min="0" max="255" step="1" class="number-input">
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>量化强度(量化太弱即levels过大,颜色离散级数过多，会导致图片上很多没有的颜色也取到了‘)</span>
                <span class="value-display">{{ levels }}</span>
              </div>
              <select type="number" v-model="levels" class="number-input">
                <option :value="8">8：强聚合、稳定主色。适合 Logo、纯色海报、边缘留白多的素材</option>
                <option :value="12">12：兼顾稳定与细节。适合插画/UI 素材、适中复杂度的图片</option>
                <option :value="16">16：默认平衡点。对多数场景能抑制噪声同时保留主色细节。</option>
                <option :value="24">24：细节更丰富。适合有多色块或轻渐变的图片]</option>
                <option :value="32">32：保留渐变/摄影细节。适合风景、人像等色彩丰富的照片，但更敏感也更耗时；</option>
                <option :value="48">48：极高细节。仅在需要非常精细的颜色分布时使用，注意性能</option>
                <option :value="64">64:超高细节。通常不推荐，除非像素较少且必须捕捉微小色差</option>
              </select>
            </div>
          </div>
        </div>

      </section>

      <section class="preview-panel">
        <h2>预览</h2>
        <div class="preview-container">
          <GetImageColor :src="imageUrl" :alphaThreshold="alphaThreshold" :levels="Number(levels)" :colorNum="colorNum"
            :minSaturation="minSaturation" :minLightness="minLightness" :maxLightness="maxLightness"
            :innerCrop="innerCrop" :excludeCornerBg="excludeCornerBg" :bgTolerance="bgTolerance"
            @colorChange="onColorChange" />

          <div class="code-section">
            <h3>调色板(总取色数量：{{ colorList.length }})</h3>
            <div class="color-palette">
              <div class="color-item-wrap"
                v-for="(color, index) in colorList.slice(0, Math.min(colorNum, colorList.length))" :key="index">
                <div class="color-item" :style="{ backgroundColor: color.hex }"></div>
                <div class="color-info">
                  <button class="copy-btn" @click="copyColor(color.hex)">{{ color.hex }}</button>
                  <button class="copy-btn" @click="copyColor(color.rgba)">{{ color.rgba }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import baseConfig, { toastFun } from '../static/hooks/extends.js';
import GetImageColor from './components/index.vue';

defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
    toast: import('../components/toast/index.vue'),
  }),
});

const imageUrl = ref('');
const colorNum = ref(8);
const colorList = ref([]);
const fileUploadInputRef = ref(null);
const levels = ref(16);
const minSaturation = ref(0)
const minLightness = ref(0)
const maxLightness = ref(1)
const innerCrop = ref(0)
const excludeCornerBg = ref(false)
const bgTolerance = ref(0)
const alphaThreshold = ref(0)


const uploadImage = () => {
  fileUploadInputRef.value.click();
};

const clearImage = () => {
  imageUrl.value = '';
  colorList.value = [];
};

const onFileChange = (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  imageUrl.value = url;
};

const onColorChange = (list) => {
  console.log('onColorChange', list);
  colorList.value = list;
};

const copyColor = (str) => {
  navigator.clipboard.writeText(str).then(() => {
    toastFun.open({
      message: `复制成功：【${str}】`,
      style: {
        width: 'auto',
        minWidth: 'auto'
      },
      duration: 2000,
    })
  });
};

const onPaste = (e) => {
  const dt = e.clipboardData || window.clipboardData;
  if (!dt) return;

  const items = dt.items || [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.kind === 'file' && item.type && item.type.startsWith('image/')) {
      const file = item.getAsFile?.() || null;
      if (file) {
        const url = URL.createObjectURL(file);
        imageUrl.value = url;
        color.value = null;
        e.preventDefault();
        return;
      }
    }
  }

  const text = dt.getData ? dt.getData('text') : '';
  const trimmed = (text || '').trim();
  if (!trimmed) return;

  if (isDataImageUrl(trimmed) || isHttpUrl(trimmed)) {
    imageUrl.value = trimmed;
    color.value = null;
    e.preventDefault();
  }
};

const isHttpUrl = (s) => /^https?:\/\/.+/i.test(s);
const isDataImageUrl = (s) => /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(s);

</script>

<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.app-container {
  height: calc(100vh - $spacing-md * 2);
  background-color: $light-gray;
  padding: $spacing-md;
  max-width: 1400px;
  min-width: 1400px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  .main-content {
    display: flex;
    gap: $spacing-lg;
    height: 100%;

    .control-panel {
      @include control-shared;
      width: calc((100% - $spacing-lg) / 2);
      flex-shrink: 0;
      overflow: auto;
      padding: $spacing-md;
      box-shadow: $shadow-light;
      height: calc(100% - $spacing-md * 2);

      .header-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-md;

        h2 {
          color: $dark-gray;
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .add-layer-wrap {
          display: flex;
          gap: $spacing-md;
          align-items: center;
          justify-content: center;

          .add-layer-btn {
            @include button-shared;
            background-color: $primary-color;
            color: #fff;

            &:hover {
              background-color: darken($primary-color, 10%);
            }
          }
        }
      }

      .controls {
        display: flex;
        flex-direction: column;
        gap: $spacing-lg;

        .control-tips {
          @include control-shared;
          display: flex;
          flex-direction: column;
          gap: $spacing-xs;
          padding: $spacing-sm $spacing-md;
          background-color: rgba($primary-color, 0.06);
          border: 1px dashed lighten($primary-color, 30%);
          border-left: 4px solid $primary-color;
          border-radius: $border-radius;
          color: $dark-gray;

          .tips-title {
            font-weight: 600;
            font-size: 14px;
            color: $primary-color;
            margin: 0 0 $spacing-xs 0;
          }

          .tips-item {
            font-size: 13px;
            line-height: 1.6;
          }

          code {
            font-family: monospace;
            background-color: rgba(255, 255, 255, 0.6);
            padding: 2px 6px;
            border-radius: $border-radius;
            color: $dark-gray;
          }
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: $spacing-md;

          .control-item {
            display: flex;
            flex-direction: column;
            gap: $spacing-xs;

            .control-label {
              display: flex;
              justify-content: space-between;
              font-size: 14px;

              span:first-child {
                font-weight: 500;
                color: $dark-gray;
              }

              .value-display {
                color: $primary-color;
                font-family: monospace;
                font-size: 13px;
              }
            }

            .text-input {
              padding: 8px 12px;
              border: 1px solid $medium-gray;
              border-radius: $border-radius;
              font-size: 14px;

              &:focus {
                outline: none;
                border-color: $primary-color;
              }
            }

            .number-input {
              width: auto;
              padding: 6px 8px;
              border: 1px solid $medium-gray;
              border-radius: $border-radius;
              font-size: 14px;
              text-align: center;

              &:focus {
                outline: none;
                border-color: $primary-color;
              }
            }

            .actions {
              display: flex;
              gap: $spacing-sm;
            }
          }
        }
      }
    }

    .preview-panel {
      display: flex;
      flex-direction: column;
      gap: $spacing-lg;
      width: calc((100% - $spacing-lg) / 2);
      flex-shrink: 0;
      height: calc(100% - $spacing-md * 2);

      h2 {
        color: $dark-gray;
        flex-shrink: 0;
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .preview-container {
        flex: 1;
        flex-shrink: 0;
        @include control-shared;
        padding: $spacing-lg;
        box-shadow: $shadow-light;
        display: flex;
        flex-direction: column;
        gap: $spacing-lg;
        overflow: auto;

        .code-section {
          @include control-shared;
          background: $light-gray;
          padding: $spacing-md;
          box-shadow: $shadow-light;

          h3 {
            margin: 0 0 $spacing-sm 0;
            color: $dark-gray;
            font-size: 16px;
            font-weight: 600;
          }

          .color-palette {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: $spacing-md;

            .color-item-wrap {
              display: flex;
              align-items: center;
              justify-content: start;
              gap: $spacing-sm;
              flex-shrink: 0;

              .color-item {
                width: 60px;
                height: 60px;
                border-radius: $border-radius;
                box-shadow: $shadow-light;
                flex-shrink: 0;
              }

              .color-info {
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
                gap: $spacing-xs;

                .copy-btn {
                  font-size: 13px;
                }
              }
            }
          }
        }
      }
    }

    .action-btn,
    .copy-btn {
      @include button-shared;
      position: relative;
      background-color: $light-gray;
      color: $dark-gray;

      .file-input {
        position: absolute;
        top: 9999px;
        left: 9999px;
        width: 0;
        height: 0;
        overflow: hidden;
      }

      &:hover {
        background-color: $medium-gray;
      }
    }
  }
}
</style>