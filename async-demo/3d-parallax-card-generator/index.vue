<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>3D 视差卡片生成器</h2>
          <div class="add-element-wrap">
            <button class="add-element-btn" @click="addCustomElement" :disabled="customElements.length >= 3">
              <span>+</span> 添加1个元素
            </button>
            <button class="add-element-btn" @click="openDialog">
              查看源码
            </button>
          </div>
        </div>

        <div class="control-groups">
          <div class="control-section">
            <h3>基础设置</h3>
            <div class="control-item">
              <div class="control-label">
                <span>视差敏感肌度</span>
                <span class="value-display">{{ settings.sensitivity.toFixed(1) }}</span>
              </div>
              <input type="range" v-model.number="settings.sensitivity" min="0.1" max="30" step="0.1"
                class="range-control">
            </div>
          </div>

          <div class="control-section">
            <h3>Z轴偏移设置</h3>

            <div class="z-axis-control">
              <h4>卡片背景</h4>
              <div class="control-item">
                <div class="control-label">
                  <span>Z轴偏移</span>
                  <span class="value-display">{{ zOffsets.background }}px</span>
                </div>
                <input type="range" v-model.number="zOffsets.background" min="-500" max="500" step="1"
                  class="range-control">
              </div>
            </div>

            <div class="z-axis-control">
              <h4>卡片标题</h4>
              <div class="control-item">
                <div class="control-label">
                  <span>Z轴偏移</span>
                  <span class="value-display">{{ zOffsets.title }}px</span>
                </div>
                <input type="range" v-model.number="zOffsets.title" min="-500" max="500" step="1" class="range-control">
              </div>
            </div>

            <div class="z-axis-control">
              <h4>卡片描述</h4>
              <div class="control-item">
                <div class="control-label">
                  <span>Z轴偏移</span>
                  <span class="value-display">{{ zOffsets.description }}px</span>
                </div>
                <input type="range" v-model.number="zOffsets.description" min="-500" max="500" step="1"
                  class="range-control">
              </div>
            </div>

            <div class="z-axis-control">
              <h4>卡片按钮</h4>
              <div class="control-item">
                <div class="control-label">
                  <span>Z轴偏移</span>
                  <span class="value-display">{{ zOffsets.button }}px</span>
                </div>
                <input type="range" v-model.number="zOffsets.button" min="-500" max="500" step="1"
                  class="range-control">
              </div>
            </div>

            <div v-for="(element, index) in customElements" :key="index" class="z-axis-control custom-element-control">
              <div class="element-header">
                <h4>自定义元素 {{ index + 1 }}</h4>
                <button class="remove-btn" @click="removeCustomElement(index)" title="删除此元素">
                  🗑️
                </button>
              </div>
              <div class="control-item">
                <div class="control-label">
                  <span>Z轴偏移</span>
                  <span class="value-display">{{ zOffsets[`element${index}`] }}px</span>
                </div>
                <input type="range" v-model.number="zOffsets[`element${index}`]" min="-500" max="500" step="1"
                  class="range-control">
              </div>
            </div>
          </div>

          <div class="presets">
            <h3>预设样式</h3>
            <div class="preset-buttons">
              <button @click="loadPreset('basic')">基础视差</button>
              <button @click="loadPreset('strong')">强烈视差</button>
              <button @click="loadPreset('extreme')">极端视差</button>
              <button @click="loadPreset('subtle')">微妙视差</button>
              <button @click="loadPreset('reset')">重置</button>
            </div>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <h2>预览</h2>
        <div class="preview-container">
          <ParallaxCard :z-offsets="zOffsets" :sensitivity="settings.sensitivity" :elements="customElements.length"
            :title="cardContent.title" :description="cardContent.description" :button-text="cardContent.buttonText">
            <template v-slot:title>{{ cardContent.title }}</template>
            <template v-slot:description>{{ cardContent.description }}</template>
            <template v-slot:button>
              <button class="card-button">{{ cardContent.buttonText }}</button>
            </template>

            <template v-for="(element, index) in customElements" :key="index" :v-slot:[`element-${index}`]>
              <div class="custom-element-content">
                <div class="element-dot" :style="{ backgroundColor: element.color }"></div>
              </div>
            </template>
          </ParallaxCard>
        </div>

        <div class="code-section">
          <h2>组件配置代码</h2>
          <div class="code-container">
            <pre><code>{{ generateConfigCode }}</code></pre>
            <button class="copy-button" @click="copyConfig" :class="{ 'copied': copied }">
              {{ copied ? '✓ 已复制' : '📋 复至配置' }}
            </button>
          </div>

          <div class="usage-example">
            <h3>使用示例</h3>
            <pre><code>{{ generateUsageExample }}</code></pre>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import ParallaxCard from './components/index.vue';
import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const settings = reactive({
  sensitivity: 2
});

const cardContent = reactive({
  title: '3D 视差卡片',
  description: '使用鼠标移动来体验视差效果,每个元素都有独立的z轴深深',
  buttonText: '探索More'
});

const zOffsets = reactive({
  background: 0,
  title: 100,
  description: 200,
  button: 300
});

const customElements = ref([]);

const copied = ref(false);

const addCustomElement = () => {
  if (customElements.value.length >= 3) return;

  const index = customElements.value.length;
  customElements.value.push({
    color: getRandomColor()
  });

  zOffsets[`element${index}`] = 10 - index * 5;
};

const removeCustomElement = (index) => {
  customElements.value.splice(index, 1);

  for (let i = index; i < customElements.value.length; i++) {
    zOffsets[`element${i}`] = zOffsets[`element${i + 1}`] || 0;
  }

  delete zOffsets[`element${customElements.value.length}`];
};

const getRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const copyConfig = () => {
  navigator.clipboard.writeText(generateConfigCode.value).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
};

const generateConfigCode = computed(() => {
  const zOffsetsStr = JSON.stringify(zOffsets, null, 2).replace(/\{/g, '').replace(/\}/g, '').trim();

  return `{
  zOffsets: {
${zOffsetsStr}
  },
  sensitivity: ${settings.sensitivity},
  elements: ${customElements.value.length}
}`;
});

const generateUsageExample = computed(() => {
  return `<ParallaxCard
  :z-offsets="zOffsets"
  :sensitivity="${settings.sensitivity}"
  :elements="${customElements.value.length}"
  title="${cardContent.title}"
  description="${cardContent.description}"
  button-text="${cardContent.buttonText}">
</ParallaxCard>`;
});

const loadPreset = (preset) => {
  const presets = {
    'basic': {
      zOffsets: {
        background: 0,
        title: 30,
        description: 20,
        button: 10,
        decorationTop: 5,
        decorationBottom: 8
      },
      sensitivity: 2
    },
    'strong': {
      zOffsets: {
        background: 0,
        title: 100,
        description: 70,
        button: 40,
        decorationTop: 20,
        decorationBottom: 30
      },
      sensitivity: 5
    },
    'subtle': {
      zOffsets: {
        background: 0,
        title: 10,
        description: 5,
        button: 3,
        decorationTop: 2,
        decorationBottom: 4
      },
      sensitivity: 0.8
    },
    'extreme': {
      zOffsets: {
        background: 0,
        title: 200,
        description: 150,
        button: 100,
        decorationTop: 50,
        decorationBottom: 80
      },
      sensitivity: 10
    },
    'reset': {
      zOffsets: {
        background: 0,
        title: 30,
        description: 20,
        button: 10,
        decorationTop: 5,
        decorationBottom: 8
      },
      sensitivity: 2
    }
  };

  const selectedPreset = presets[preset];

  customElements.value = [];

  Object.keys(zOffsets).forEach(key => {
    delete zOffsets[key];
  });

  Object.assign(zOffsets, selectedPreset.zOffsets);
  settings.sensitivity = selectedPreset.sensitivity;
};
</script>

<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

@mixin control-shared {
  background: white;
  border-radius: $border-radius;
  transition: all $transition-speed;
}

@mixin button-shared {
  border: none;
  border-radius: $border-radius;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: all $transition-speed;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

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

        .add-element-wrap {
          display: flex;
          gap: $spacing-md;
          align-items: center;
          justify-content: center;

          .add-element-btn {
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

      .control-groups {
        display: flex;
        flex-direction: column;
        gap: $spacing-lg;

        .control-section {
          margin-bottom: $spacing-md;

          h3 {
            color: $dark-gray;
            margin: 0 0 $spacing-md 0;
            font-size: 16px;
            font-weight: 600;
            border-bottom: 1px solid $light-gray;
            padding-bottom: $spacing-sm;
          }
        }
      }

      .z-axis-control {
        @include control-shared;
        padding: $spacing-md;
        margin-bottom: $spacing-md;
        border: 1px solid $medium-gray;
        box-shadow: $shadow-light;

        h4 {
          color: $medium-gray;
          margin: 0 0 $spacing-md 0;
          font-size: 14px;
          font-weight: 500;
        }
      }

      .custom-element-control .element-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-md;

        .remove-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          border-radius: 50%;
          transition: all $transition-speed;

          &:hover {
            background-color: rgba(255, 0, 0, 0.1);
          }
        }
      }

      .control-item {
        margin-bottom: $spacing-md;

        &:last-child {
          margin-bottom: 0;
        }

        .control-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: $spacing-xs;

          span {
            font-size: 14px;
            color: $dark-gray;
          }

          .value-display {
            color: $primary-color;
            font-weight: 600;
          }
        }

        .range-control {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: $light-gray;
          outline: none;
          -webkit-appearance: none;

          &::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: $primary-color;
            cursor: pointer;
            transition: all $transition-speed;

            &:hover {
              transform: scale(1.2);
              box-shadow: 0 0 0 8px rgba(79, 70, 229, 0.1);
            }
          }

          &::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: $primary-color;
            cursor: pointer;
            border: none;
            transition: all $transition-speed;

            &:hover {
              transform: scale(1.2);
              box-shadow: 0 0 0 8px rgba(79, 70, 229, 0.1);
            }
          }
        }
      }

      .presets {
        margin-top: $spacing-lg;

        h3 {
          color: $dark-gray;
          margin: 0 0 $spacing-md 0;
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
              color: white;
            }
          }
        }
      }
    }

    .preview-panel {
      @include control-shared;
      width: calc((100% - $spacing-lg) / 2);
      flex-shrink: 0;
      overflow: auto;
      padding: $spacing-md;
      box-shadow: $shadow-light;
      height: calc(100% - $spacing-md * 2);

      h2 {
        color: $dark-gray;
        margin: 0 0 $spacing-md 0;
        font-size: 20px;
        font-weight: 600;
      }

      .preview-container {
        @include control-shared;
        padding: $spacing-lg;
        margin-bottom: $spacing-lg;
        border: 1px solid $medium-gray;
        box-shadow: $shadow-light;
        min-height: 400px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      }

      .custom-element-content {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;

        .element-dot {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          opacity: 0.8;
        }
      }



      .code-section {
        h2 {
          font-size: 18px;
          margin-bottom: $spacing-md;
        }

        .code-container {
          @include control-shared;
          padding: $spacing-md;
          margin-bottom: $spacing-md;
          border: 1px solid $medium-gray;
          box-shadow: $shadow-light;
          position: relative;

          pre {
            margin: 0;
            background: $light-gray;
            padding: $spacing-md;
            border-radius: $border-radius;
            overflow-x: auto;
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;

            code {
              color: $dark-gray;
            }
          }

          .copy-button {
            position: absolute;
            top: $spacing-sm;
            right: $spacing-sm;
            @include button-shared;
            background-color: $primary-color;
            color: white;
            font-size: 12px;
            padding: 4px 8px;

            &:hover {
              background-color: darken($primary-color, 10%);
            }

            &.copied {
              background-color: $success-color;
            }
          }
        }

        .usage-example {
          h3 {
            color: $dark-gray;
            margin: 0 0 $spacing-md 0;
            font-size: 16px;
            font-weight: 600;
          }

          pre {
            @include control-shared;
            margin: 0;
            background: $light-gray;
            padding: $spacing-md;
            border-radius: $border-radius;
            overflow-x: auto;
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            border: 1px solid $medium-gray;

            code {
              color: $dark-gray;
            }
          }
        }
      }
    }
  }
}
</style>