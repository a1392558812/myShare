<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>Tips气泡</h2>
          <div class="add-layer-wrap">
            <button class="add-layer-btn" @click="openDialog({ overlayStyle: { zIndex: 1000 } })">查看源码</button>
          </div>
        </div>

        <div class="grid-controls">
          <div class="shadow-layer">
            <div class="layer-header">
              <h3>气泡设置</h3>
              <div class="layer-actions"></div>
            </div>
            <div class="control-group">
              <div class="control-item">
                <div class="control-label">
                  <span>文本</span>
                </div>
                <input type="text" v-model="text" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>背景色：<input type="color" v-model="backgroundColor" class="color-picker" /></span>
                  <span class="value-display">{{ backgroundColor }}</span>
                </div>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>文本色：<input type="color" v-model="color" class="color-picker" /></span>
                  <span class="value-display">{{ color }}</span>
                </div>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>圆角</span>
                  <span class="value-display">{{ radius }}px</span>
                </div>
                <input type="number" v-model.number="radius" min="0" max="32" step="1" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>气泡padding</span>
                  <span class="value-display">{{ padding }}px</span>
                </div>
                <input type="number" v-model.number="padding" min="4" max="30" step="1" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>边框宽度</span>
                  <span class="value-display">{{ borderWidth }}px</span>
                </div>
                <input type="number" v-model.number="borderWidth" min="0" max="16" step="1" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>边框颜色：<input type="color" v-model="borderColor" class="color-picker" /></span>
                  <span class="value-display">{{ borderColor }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="shadow-layer">
            <div class="layer-header">
              <h3>三角箭头设置</h3>
              <div class="layer-actions"></div>
            </div>
            <div class="control-group">
              <div class="control-item">
                <div class="control-label">
                  <span>箭头位置</span>
                </div>
                <select v-model="position">
                  <option value="top">上</option>
                  <option value="right">右</option>
                  <option value="bottom">下</option>
                  <option value="left">左</option>
                </select>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>箭头大小</span>
                  <span class="value-display">{{ arrowSize }}px</span>
                </div>
                <input type="number" v-model.number="arrowSize" min="4" max="48" step="1" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>箭头偏移</span>
                  <span class="value-display">{{ offset }}px</span>
                </div>
                <input type="range" v-model.number="offset" min="-200" max="200" step="1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <h2>预览</h2>
        <div class="preview-container">
          <div class="bubble-preview">
            <Bubble :text="text" :position="position" :offset="`${offset}px`" :arrow-size="arrowSize"
              :arrow-border-width="borderWidth" :border-color="borderColor" :border-width="borderWidth"
              :background-color="backgroundColor" :color="color" :radius="`${radius}px`" :padding="`${padding}px`"
              @updateStyle="updateStyle" />
          </div>
        </div>

        <div class="code-section" v-for="key in ['html', 'css']" :key="key">
          <h2>{{ key }}</h2>
          <div class="code-container">
            <pre><code>{{ cssExample[key].value }}</code></pre>
            <button class="copy-button" @click="copyToClipboard(key)" :class="{ 'copied': cssExample[key].copied }">
              {{ cssExample[key].copied ? '✓ 已复制' : '📋 复制代码' }}
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Bubble from './components/index.vue'
import baseConfig from '../static/hooks/extends.js'

defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const text = ref('这是一条提示🐮🐮气泡')
const backgroundColor = ref('#ffffff')
const color = ref('#000000')
const radius = ref(8)

const padding = ref(12)

const borderWidth = ref(1)
const borderColor = ref('#111827')

const position = ref('top')
const arrowSize = ref(8)
const offset = ref(0)

const cssExample = reactive({
  html: {
    value: '',
    copied: false
  },
  css: {
    value: '',
    copied: false
  }
})

const camelToKebab = (camelCaseStr) => {
  return camelCaseStr
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, '');
}

const updateStyle = (style) => {
  let arrowBorderHtml = ''
  let arrowBorderCss = ''

  let bubbleStyle = Object.keys(style.bubbleStyle).map((key) => `  ${camelToKebab(key)}: ${style.bubbleStyle[key]};`).join('\n')
  let arrowFillStyle = Object.keys(style.arrowFillStyle).map((key) => `  ${camelToKebab(key)}: ${style.arrowFillStyle[key]};`).join('\n')

  if (borderWidth.value) {
    arrowBorderHtml = `    <!-- 叠两个三角：上层为填充色，下层为边框色 -->\n` +
      `    <div class="arrow-border-style"></div>\n`
    arrowBorderCss = `.arrow-border-style {\n` +
      Object.keys(style.arrowBorderStyle).map((key) => `  ${camelToKebab(key)}: ${style.arrowBorderStyle[key]};`).join('\n') +
      `\n}\n`
  }

  cssExample.html.value = `<template>\n` +
    `  <div class="bubbleStyle">\n` +
    `    <slot>{{ text }}</slot>\n` +
    arrowBorderHtml +
    `    <div class="arrow-fill-style"></div>\n` +
    `  </div>\n` +
    `</template>\n`
  cssExample.css.value = `.bubbleStyle {\n` +
    bubbleStyle +
    `\n}\n` +
    arrowBorderCss +
    `.arrow-fill-style {\n` +
    arrowFillStyle +
    `\n}\n`
}

const copyToClipboard = (key) => {
  navigator.clipboard.writeText(cssExample[key].value).then(() => {
    cssExample[key].copied = true;
    setTimeout(() => {
      cssExample[key].copied = false;
    }, 2000);
  });
};

</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.app-container {
  height: calc(100vh - $spacing-md * 2);
  background-color: $light-gray;
  padding: $spacing-md;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  .main-content {
    width: calc(100vw - $spacing-md * 2);
    min-width: 1200px;
    display: flex;
    gap: $spacing-lg;
    height: 100%;

    .control-panel {
      @include control-shared;
      width: calc(500px - $spacing-md * 2);
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
          }
        }
      }

      .grid-controls {
        display: flex;
        flex-direction: column;
        gap: $spacing-md;

        .shadow-layer {
          @include control-shared;
          display: flex;
          flex-direction: column;
          gap: $spacing-sm;
          padding: $spacing-md;
          box-shadow: $shadow-light;

          .layer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            h3 {
              margin: 0;
              color: $secondary-color;
              font-weight: 600;
            }

            .layer-actions {
              display: flex;
              gap: $spacing-xs;
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
                align-items: center;
                color: $dark-gray;
                font-weight: 600;
              }

              .value-display {
                color: $primary-color;
                font-size: 12px;
              }

              .color-picker {
                vertical-align: middle;
              }
            }
          }
        }
      }
    }

    .preview-panel {
      display: flex;
      flex-direction: column;
      gap: $spacing-lg;
      width: calc(100% - 500px - $spacing-lg);
      flex-shrink: 0;
      overflow: auto;

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

        .bubble-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          background: $light-gray;
          border-radius: $border-radius;
          border: 1px dashed $medium-gray;
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

input[type='number'],
select,
input[type='text'] {
  padding: 6px 10px;
  border: 1px solid $medium-gray;
  border-radius: $border-radius;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}
</style>