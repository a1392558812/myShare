<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>网格参数设置</h2>
        </div>

        <div class="control-group">
          <div class="control-item">
            <div class="control-label">
              <span>网格角度</span>
              <span class="value-display">{{ paramsData.deg }}deg</span>
            </div>
            <input type="number" :value="paramsData.deg" @input="onDegInput" :min="0" :max="180" step="1"
              class="number-control">
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>背景色</span>
              <span class="value-display">{{ paramsData.bgColor }}</span>
            </div>
            <div class="color-controls">
              <color-picker :style="{ width: '100%' }" v-model="paramsData.bgColor" />
            </div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>网格颜色1</span>
              <span class="value-display">{{ paramsData.bgColor1 }}</span>
            </div>
            <div class="color-controls">
              <color-picker :style="{ width: '100%' }" v-model="paramsData.bgColor1" />
            </div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>网格颜色2</span>
              <span class="value-display">{{ paramsData.bgColor2 }}</span>
            </div>
            <div class="color-controls">
              <color-picker :style="{ width: '100%' }" v-model="paramsData.bgColor2" />
            </div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>网格尺寸 X</span>
              <span class="value-display">{{ paramsData.backgroundSizeX }}px</span>
            </div>
            <input type="range" v-model.number="paramsData.backgroundSizeX" :min="0" :max="180" step="1"
              class="range-control">
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>网格尺寸 Y</span>
              <span class="value-display">{{ paramsData.backgroundSizeY }}px</span>
            </div>
            <input type="range" v-model.number="paramsData.backgroundSizeY" :min="0" :max="180" step="1"
              class="range-control">
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>同步编辑尺寸</span>
              <span class="value-display">{{ paramsData.backgroundSizeX === paramsData.backgroundSizeY ?
                paramsData.backgroundSizeX : '--' }}px</span>
            </div>
            <input type="range"
              :value="paramsData.backgroundSizeX === paramsData.backgroundSizeY ? paramsData.backgroundSizeX : 0"
              :min="0" :max="180" step="1" @input="onSyncSizeInput" class="range-control">
          </div>
        </div>

        <div class="presets">
          <h3>预设样式</h3>
          <div class="preset-buttons">
            <button v-for="(preset, index) in presets" :key="index" @click="applyPreset(preset)">
              {{ preset.name }}
            </button>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <div class="preview-section" v-for="(item, index) in [
          { customStyle: targetStyle1, cssCode: convertStyleObjectToString(targetStyle1) },
          { customStyle: targetStyle2, cssCode: convertStyleObjectToString(targetStyle2) },
          { customStyle: targetStyle3, cssCode: convertStyleObjectToString(targetStyle3) }
        ]" :key="index">
          <h2>预览</h2>
          <div class="preview-container">
            <div class="preview-box" :style="item.customStyle">
              <div class="preview-text">网格背景效果</div>
            </div>
          </div>
          <div class="code-section">
            <h2>CSS 代码</h2>
            <div class="code-container">
              <pre><code>{{ item.cssCode }}</code></pre>
              <button class="copy-button" @click="onCopyClick(item.cssCode)" :class="{ 'copied': copied }">
                {{ copied ? '✓ 已复制' : '📋 复制代码' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { colorPicker, parseRgba } from '../components/color-picker/index.js'

const initData = () => {
  return {
    deg: 45,
    backgroundSizeX: 50,
    backgroundSizeY: 50,
    bgColor: 'rgba(255, 255, 255, 1)',
    bgColor1: 'rgba(186, 186, 186, 0.50)',
    bgColor2: 'rgba(250, 220, 255, 0.00)',
  }
}

const paramsData = reactive(initData());
const copied = ref(false);


const convertStyleObjectToString = (styleObj) => {
  if (!styleObj) {
    return '';
  }
  return Object.entries(styleObj)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
      return `${cssKey}: ${value}`;
    })
    .join(';\n') + ';';
}

const presets = [
  {
    name: '标准网格',
    deg: 45,
    backgroundSizeX: 15,
    backgroundSizeY: 15,
    bgColor: 'rgba(255, 255, 255, 1)',
    bgColor1: 'rgba(204, 204, 204, 1)',
    bgColor2: 'rgba(204, 204, 204, 0)'
  },
  {
    name: '深色网格',
    deg: 45,
    backgroundSizeX: 50,
    backgroundSizeY: 50,
    bgColor: 'rgba(254, 238, 62, 0.50)',
    bgColor1: 'rgba(255, 0, 0, 0.50)',
    bgColor2: 'rgba(55, 35, 254, 0.00)'
  },
  {
    name: '蓝色网格',
    deg: 45,
    backgroundSizeX: 40,
    backgroundSizeY: 40,
    bgColor: 'rgba(255, 255, 255, 1)',
    bgColor1: 'rgba(52, 152, 219, 0.2)',
    bgColor2: 'rgba(52, 152, 219, 0)'
  },
  {
    name: '充值',
    ...initData(),
  }
];

const targetStyle1 = computed(() => {
  const rgbaMap = parseRgba(paramsData.bgColor2)
  const resColor = rgbaMap.a === 0 ? 'transparent' : paramsData.bgColor2;
  return {
    backgroundImage: `linear-gradient(${paramsData.deg}deg, ${paramsData.bgColor1} 25%, ${resColor} 25%), 
    linear-gradient(${180 - paramsData.deg}deg, ${paramsData.bgColor1} 25%, ${resColor} 25%),
    linear-gradient(${paramsData.deg}deg, ${resColor} 75%, ${paramsData.bgColor1} 75%), 
    linear-gradient(${180 - paramsData.deg}deg, ${resColor} 75%, ${paramsData.bgColor1} 75%)`,
    backgroundSize: `${paramsData.backgroundSizeX}px ${paramsData.backgroundSizeY}px`,
    backgroundPosition: `0px 0px, ${paramsData.backgroundSizeX / 2}px 0px, ${paramsData.backgroundSizeX / 2}px -${paramsData.backgroundSizeY / 2}px, 0px ${paramsData.backgroundSizeY / 2}px`,
    backgroundRepeat: 'repeat',
    backgroundColor: paramsData.bgColor
  }
});

const targetStyle2 = computed(() => {
  const rgbaMap = parseRgba(paramsData.bgColor2)
  const resColor = rgbaMap.a === 0 ? 'transparent' : paramsData.bgColor2;
  return {
    backgroundColor: paramsData.bgColor,
    backgroundImage: `linear-gradient(${paramsData.bgColor1} 50%, ${resColor} 0),
        linear-gradient(to right, ${paramsData.bgColor1} 50%, ${resColor} 0)`,
    backgroundSize: `${paramsData.backgroundSizeX}px ${paramsData.backgroundSizeY}px`,
  }
});

const targetStyle3 = computed(() => {
  const rgbaMap1 = parseRgba(paramsData.bgColor1)
  const rgbaMap2 = parseRgba(paramsData.bgColor2)
  const resColor = `rgba(${rgbaMap2.r}, ${rgbaMap2.g}, ${rgbaMap2.b}, ${rgbaMap1.a})`
  return {
    background: `repeating-linear-gradient(
        -${paramsData.deg}deg,
        transparent,
        transparent 25%,
        ${paramsData.bgColor1} 0,
        ${paramsData.bgColor1} 50%
      ),
      repeating-linear-gradient(
        ${paramsData.deg}deg,
        transparent,
        transparent 25%,
        ${resColor} 0,
        ${resColor} 50%
      ),
      ${paramsData.bgColor}`,
    backgroundSize: `${paramsData.backgroundSizeX}px ${paramsData.backgroundSizeY}px`,
    backgroundBlendMode: 'multiply',
  }
});

const onDegInput = (e) => {
  let res = Number(e.target.value);
  if (isNaN(res)) {
    res = 0;
  }
  paramsData.deg = res > 180 ? 180 : res < 0 ? 0 : res;
  e.target.value = paramsData.deg;
};

const onSyncSizeInput = (e) => {
  let res = Number(e.target.value);
  if (isNaN(res)) {
    res = 0;
  }
  res = res > 180 ? 180 : res < 0 ? 0 : res
  paramsData.backgroundSizeX = res;
  paramsData.backgroundSizeY = res;
  e.target.value = res;
};

const applyPreset = (preset) => {
  paramsData.deg = preset.deg;
  paramsData.backgroundSizeX = preset.backgroundSizeX;
  paramsData.backgroundSizeY = preset.backgroundSizeY;
  paramsData.bgColor = preset.bgColor;
  paramsData.bgColor1 = preset.bgColor1;
  paramsData.bgColor2 = preset.bgColor2;
};

const onCopyClick = (str) => {
  navigator.clipboard.writeText(str).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
};
</script>

<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.app-container {
  height: calc(100vh - $spacing-md * 2);
  background-color: $light-gray;
  padding: $spacing-md;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.main-content {
  display: flex;
  gap: $spacing-lg;
  height: 100%;

  .control-panel {
    @include control-shared;
    width: 400px;
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
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;
      margin-bottom: $spacing-lg;
    }

    .control-item {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
    }

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

    .range-control {
      width: 100%;
      height: 6px;
      margin: 6px 0;
      -webkit-appearance: none;
      appearance: none;
      background: $light-gray;
      border-radius: 3px;
      outline: none;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: $primary-color;
        cursor: pointer;
        transition: background $transition-speed;

        &:hover {
          background: darken($primary-color, 10%);
        }
      }
    }

    .number-control {
      padding: $spacing-xs $spacing-sm;
      border: 1px solid $medium-gray;
      border-radius: $border-radius;
      width: auto;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: $primary-color;
      }
    }

    .color-controls {
      display: flex;
      gap: $spacing-sm;
      align-items: center;
    }

    .presets {
      @include control-shared;
      padding: $spacing-md;
      margin-top: $spacing-lg;

      h3 {
        margin: 0 0 $spacing-md 0;
        color: $dark-gray;
        font-size: 16px;
        font-weight: 600;
      }

      .preset-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-sm;

        button {
          @include button-shared;
          background-color: $light-gray;
          color: $dark-gray;

          &:hover {
            background-color: $medium-gray;
          }
        }
      }
    }
  }

  .preview-panel {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
    flex: 1;
    flex-shrink: 0;
    overflow: auto;

    .preview-section {
      display: flex;
      flex-direction: column;
      gap: $spacing-lg;

      h2 {
        color: $dark-gray;
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .preview-container {
        @include control-shared;
        padding: $spacing-lg;
        box-shadow: $shadow-light;
        display: flex;
        flex-direction: column;
        gap: $spacing-lg;

        .preview-box {
          width: auto;
          height: 200px;
          margin: 10px;
          border-radius: $border-radius;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background $transition-speed;

          .preview-text {
            color: $dark-gray;
            font-size: 20px;
            font-weight: 600;
            text-align: center;
          }
        }
      }

      .code-section {
        display: flex;
        flex-direction: column;
        gap: $spacing-md;

        .code-container {
          @include control-shared;
          position: relative;
          background: #1e293b;
          padding: $spacing-md;
          box-shadow: $shadow-light;

          pre {
            margin: 0;
            color: #e2e8f0;
            font-size: 14px;
            overflow-x: auto;
            line-height: 1.5;
          }

          .copy-button {
            @include button-shared;
            position: absolute;
            top: $spacing-sm;
            right: $spacing-sm;
            background-color: $primary-color;
            color: white;
            gap: $spacing-xs;
            padding: $spacing-xs $spacing-sm;
            font-size: 13px;

            &:hover {
              background-color: darken($primary-color, 10%);
            }

            &.copied {
              background-color: $success-color;
            }
          }
        }
      }
    }
  }
}
</style>