<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>阴影层控制</h2>

          <div class="add-layer-wrap">
            <button class="add-layer-btn" @click="addShadowLayer" :disabled="shadowLayers.length >= 5">
              <span>+</span> 添加阴影层
            </button>

            <button class="add-layer-btn" @click="openDialog">
              查看源码
            </button>
          </div>
        </div>

        <div class="shadow-layers">
          <div v-for="(layer, index) in shadowLayers" :key="index" class="shadow-layer" @click="setActiveLayer(index)"
            :class="{ 'active-layer': activeLayerIndex === index }">
            <div class="layer-header">
              <h3>阴影层 {{ index + 1 }}</h3>
              <div class="layer-actions">
                <button class="action-btn" @click="toggleLayerVisibility(index)"
                  :title="layer.visible ? '隐藏此层' : '显示此层'">
                  {{ layer.visible ? '👁️' : '👁️‍🗨️' }}
                </button>
                <button class="action-btn" @click="removeShadowLayer(index)" :disabled="shadowLayers.length <= 1"
                  title="删除此层">
                  🗑️
                </button>
              </div>
            </div>

            <div class="control-group">
              <div class="control-item">
                <div class="control-label">
                  <span>X轴偏移</span>
                  <span class="value-display">{{ layer.x }}px</span>
                </div>
                <input type="range" v-model.number="layer.x" min="-50" max="50" step="1" class="range-control"
                  @input="setActiveLayer(index)">
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>Y轴偏移</span>
                  <span class="value-display">{{ layer.y }}px</span>
                </div>
                <input type="range" v-model.number="layer.y" min="-50" max="50" step="1" class="range-control"
                  @input="setActiveLayer(index)">
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>模糊半径</span>
                  <span class="value-display">{{ layer.blur }}px</span>
                </div>
                <input type="range" v-model.number="layer.blur" min="0" max="100" step="1" class="range-control"
                  @input="setActiveLayer(index)">
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>扩散半径</span>
                  <span class="value-display">{{ layer.spread }}px</span>
                </div>
                <input type="range" v-model.number="layer.spread" min="-50" max="50" step="1" class="range-control"
                  @input="setActiveLayer(index)">
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>阴影颜色</span>
                  <span class="value-display">{{ layer.color }}</span>
                </div>
                <div class="color-controls">
                  <input type="color" v-model="layer.color" class="color-picker" @input="setActiveLayer(index)">
                  <input type="text" v-model="layer.color" class="color-input">
                </div>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>不透明度</span>
                  <span class="value-display">{{ layer.opacity.toFixed(2) }}</span>
                </div>
                <input type="range" v-model.number="layer.opacity" min="0" max="1" step="0.01" class="range-control"
                  @input="setActiveLayer(index)">
              </div>

              <div class="control-item checkbox-control">
                <label>
                  <input type="checkbox" v-model="layer.inset" @change="setActiveLayer(index)">
                  内阴影 (inset)
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="presets">
          <h3>预设样式</h3>
          <div class="preset-buttons">
            <button @click="loadPreset('soft-glow')">柔和发光</button>
            <button @click="loadPreset('layered')">分层阴影</button>
            <button @click="loadPreset('neon')">霓虹效果</button>
            <button @click="loadPreset('reset')">重置</button>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <h2>预览</h2>

        <div class="preview-container">
          <div class="preview-box" :style="boxShadowStyle">
            <div class="preview-text">多层阴影效果</div>
          </div>

          <div class="layer-visibility-controls">
            <h3>图层可见性</h3>
            <div class="visibility-buttons">
              <button v-for="(layer, index) in shadowLayers" :key="index" @click="toggleLayerVisibility(index)"
                :class="{ 'visible': layer.visible, 'hidden': !layer.visible }"
                :title="`${layer.visible ? '隐藏' : '显示'} 阴影层 ${index + 1}`">
                图层 {{ index + 1 }}
              </button>
            </div>
          </div>
        </div>

        <div class="code-section">
          <h2>CSS 代码</h2>
          <div class="code-container">
            <pre><code>{{ boxShadowCSS }}</code></pre>
            <button class="copy-button" @click="onCopyClick" :class="{ 'copied': copied }">
              {{ copied ? '✓ 已复制' : '📋 复制代码' }}
            </button>
          </div>

          <div class="usage-example">
            <h3>使用示例</h3>
            <pre><code>.your-element {
  {{ boxShadowCSS }}
}</code></pre>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const createShadowLayer = (index = 0) => ({
  x: 2 + index * 3,          // X轴偏移量
  y: 2 + index * 3,          // Y轴偏移
  blur: 5 + index * 5,       // 模糊半径
  spread: 1 + index * 2,     // 扩散半径
  color: index === 0 ? '#000000' : '#4a90e2', // 阴影色
  opacity: 0.3 + index * 0.1, // 不透明度
  inset: false,              // 是否内阴影
  visible: true              // 是否可见
});

const shadowLayers = ref([
  createShadowLayer(0)
]);

const activeLayerIndex = ref(0);

const copied = ref(false);

const setActiveLayer = (index) => {
  activeLayerIndex.value = index;
};

const addShadowLayer = () => {
  if (shadowLayers.value.length < 5) {
    shadowLayers.value.push(createShadowLayer(shadowLayers.value.length));
    activeLayerIndex.value = shadowLayers.value.length - 1;
  }
};

const removeShadowLayer = (index) => {
  if (shadowLayers.value.length <= 1) return;

  shadowLayers.value.splice(index, 1);

  if (activeLayerIndex.value >= shadowLayers.value.length) {
    activeLayerIndex.value = shadowLayers.value.length - 1;
  }
};

const toggleLayerVisibility = (index) => {
  shadowLayers.value[index].visible = !shadowLayers.value[index].visible;
};

const getColorWithOpacity = (layer) => {
  const r = parseInt(layer.color.slice(1, 3), 16);
  const g = parseInt(layer.color.slice(3, 5), 16);
  const b = parseInt(layer.color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${layer.opacity})`;
};

const boxShadowStyle = computed(() => {
  // 过滤出可见的阴影层
  const visibleLayers = shadowLayers.value.filter(layer => layer.visible);

  // 生成每个阴影层的样式
  const shadows = visibleLayers.map(layer => {
    const inset = layer.inset ? 'inset ' : '';
    return `${inset}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${getColorWithOpacity(layer)}`;
  });

  return {
    boxShadow: shadows.join(', '),
    backgroundColor: '#ffffff'
  };
});

const boxShadowCSS = computed(() => {
  // 过滤出可见的阴影层
  const visibleLayers = shadowLayers.value.filter(layer => layer.visible);

  if (visibleLayers.length === 0) {
    return 'box-shadow: none;';
  }

  const shadows = visibleLayers.map(layer => {
    const inset = layer.inset ? 'inset ' : '';
    return `${inset}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${getColorWithOpacity(layer)}`;
  });

  // 多层阴影在一行显示或分行显示（根据层数决定）
  const joinWith = shadows.length > 2 ? ',\n  ' : ', ';
  return `box-shadow: ${shadows.join(joinWith)};`;
});

const onCopyClick = () => {
  navigator.clipboard.writeText(boxShadowCSS.value).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
};

const loadPreset = (preset) => {
  const presets = {
    'soft-glow': [
      { x: 0, y: 0, blur: 10, spread: 0, color: '#4f46e5', opacity: 0.3, inset: false, visible: true },
      { x: 0, y: 0, blur: 20, spread: 0, color: '#8b5cf6', opacity: 0.2, inset: false, visible: true },
      { x: 0, y: 0, blur: 30, spread: 0, color: '#ec4899', opacity: 0.1, inset: false, visible: true }
    ],
    'layered': [
      { x: 1, y: 1, blur: 0, spread: 1, color: '#000000', opacity: 0.2, inset: false, visible: true },
      { x: 3, y: 3, blur: 0, spread: 3, color: '#000000', opacity: 0.1, inset: false, visible: true },
      { x: 5, y: 5, blur: 10, spread: 5, color: '#000000', opacity: 0.05, inset: false, visible: true }
    ],
    'neon': [
      { x: 0, y: 0, blur: 5, spread: 0, color: '#39ff14', opacity: 0.7, inset: false, visible: true },
      { x: 0, y: 0, blur: 10, spread: 0, color: '#39ff14', opacity: 0.5, inset: false, visible: true },
      { x: 0, y: 0, blur: 15, spread: 0, color: '#39ff14', opacity: 0.3, inset: false, visible: true }
    ],
    'reset': [
      createShadowLayer(0)
    ]
  };

  shadowLayers.value = presets[preset].map(layer => ({ ...layer }));
  activeLayerIndex.value = 0;
};
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
}

.main-content {
  display: flex;
  gap: $spacing-lg;
  height: 100%;
}

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
        color: white;
        gap: $spacing-xs;

        &:hover {
          background-color: darken($primary-color, 10%);
        }

        &:disabled {
          background-color: $medium-gray;
          cursor: not-allowed;
        }
      }
    }

  }

  .shadow-layers {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  .shadow-layer {
    @include control-shared;
    flex-shrink: 0;
    padding: $spacing-md;
    border: 1px solid $medium-gray;
    box-shadow: $shadow-light;

    &.active-layer {
      border-color: $primary-color;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1), $shadow-medium;
    }

    .layer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-md;
      padding-bottom: $spacing-sm;
      border-bottom: 1px solid $light-gray;

      h3 {
        margin: 0;
        color: $dark-gray;
        font-size: 16px;
        font-weight: 600;
      }

      .layer-actions {
        display: flex;
        gap: $spacing-xs;

        .action-btn {
          @include button-shared;
          width: 32px;
          height: 32px;
          padding: 0;
          background-color: $light-gray;
          color: $secondary-color;

          &:hover {
            background-color: $medium-gray;
          }

          &:disabled {
            color: $medium-gray;
            cursor: not-allowed;

            &:hover {
              background-color: $light-gray;
            }
          }
        }
      }
    }
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  .control-item {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    &.checkbox-control {
      flex-direction: row;
      align-items: center;
      padding: $spacing-sm 0;

      label {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        color: $dark-gray;
        cursor: pointer;
        font-size: 14px;
      }
    }
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

  .color-controls {
    display: flex;
    gap: $spacing-sm;

    .color-picker {
      width: 40px;
      height: 40px;
      padding: 0;
      border: 1px solid $medium-gray;
      border-radius: $border-radius;
      cursor: pointer;
    }

    .color-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid $medium-gray;
      border-radius: $border-radius;
      font-family: monospace;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: $primary-color;
      }
    }
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
  width: calc((100% - $spacing-lg) / 2);
  flex-shrink: 0;

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
      width: calc(100% - 50px *2);
      height: 200px;
      margin: 50px;
      border-radius: $border-radius;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: box-shadow $transition-speed;

      .preview-text {
        color: $dark-gray;
        font-size: 20px;
        font-weight: 600;
        text-align: center;
      }
    }

    .layer-visibility-controls {
      padding: $spacing-md;
      background-color: $light-gray;
      border-radius: $border-radius;

      h3 {
        margin: 0 0 $spacing-sm 0;
        color: $dark-gray;
        font-size: 16px;
        font-weight: 600;
      }

      .visibility-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-sm;

        button {
          @include button-shared;
          padding: $spacing-xs $spacing-sm;
          font-size: 13px;
          background-color: white;
          border: 1px solid $medium-gray;

          &.visible {
            border-color: $success-color;
            color: $success-color;
            background-color: rgba(16, 185, 129, 0.05);
          }

          &.hidden {
            border-color: $secondary-color;
            color: $secondary-color;
            opacity: 0.7;
          }
        }
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

    .usage-example {
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

      pre {
        margin: 0;
        color: $dark-gray;
        font-size: 14px;
        overflow-x: auto;
        line-height: 1.5;
        background-color: rgba(255, 255, 255, 0.5);
        padding: $spacing-sm;
        border-radius: $border-radius;
      }
    }
  }
}
</style>
