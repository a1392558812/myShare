<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>Marquee 跑马灯</h2>
          <div class="add-layer-wrap">
            <button class="add-layer-btn" @click="openDialog({ overlayStyle: { zIndex: 1000 } })">查看源码</button>
          </div>
        </div>

        <div class="grid-controls">
          <div class="shadow-layer">
            <div class="control-group">
              <div class="control-item">
                <div class="control-label">
                  <span>auto-fill：重复填充空白</span>
                  <span class="value-display">{{ autoFill ? '开启' : '关闭' }}</span>
                </div>
                <select v-model="autoFill">
                  <option :value="true">true</option>
                  <option :value="false">false</option>
                </select>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>speed：像素/秒</span>
                  <span class="value-display">{{ speed }} px/s</span>
                </div>
                <input type="number" v-model.number="speed" min="0" max="300" step="1" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>direction：方向</span>
                  <span class="value-display">{{ directionLabel }}</span>
                </div>
                <select v-model="direction">
                  <option value="rtl">右到左</option>
                  <option value="ltr">左到右</option>
                  <option value="ttb">上到下</option>
                  <option value="btt">下到上</option>
                </select>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>内容</span>
                </div>
                <input type="text" v-model="text" placeholder="输入跑马灯内容" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <h2>预览</h2>
        <div class="preview-container">
          <div class="preview-box">
            <Marquee :auto-fill="autoFill" :speed="speed" :direction="direction">
              <div class="marquee-item">{{ text }}</div>
            </Marquee>
          </div>
        </div>

        <div class="code-section">
          <h2>示例</h2>
          <div class="code-container">
            <pre><code>{{ exampleCode }}</code></pre>
            <button class="copy-button" @click="onCopyClick" :class="{ 'copied': copied }">
              {{ copied ? '✓ 已复制' : '📋 复至配置' }}
            </button>

          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Marquee from './components/index.vue'
import baseConfig from '../static/hooks/extends.js'

defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const copied = ref(false)

const autoFill = ref(false)
const speed = ref(120)
const direction = ref('rtl')
const text = ref('这是一段跑马灯文本 —— Marquee Demo 这是一段跑马灯文本 —— Marquee Demo')

const directionLabel = computed(() => {
  switch (direction.value) {
    case 'rtl': return '右到左'
    case 'ltr': return '左到右'
    case 'ttb': return '上到下'
    case 'btt': return '下到上'
    default: return direction.value
  }
})

const exampleCode = computed(() => {
  return `<div class=\"marquee-preview\" style=\"height: 160px;\">\n  <Marquee auto-fill=${autoFill.value} speed=${speed.value} direction=\"${direction.value}\">\n    <div class=\"marquee-item\">${text.value}</div>\n  </Marquee>\n</div>`
})

const onCopyClick = () => {
  navigator.clipboard.writeText(exampleCode.value).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
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
        }

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

      .grid-controls {
        display: flex;
        flex-direction: column;
        gap: $spacing-md;
      }

      .shadow-layer {
        @include control-shared;
        display: flex;
        flex-direction: column;
        gap: $spacing-sm;

        .control-group {
          display: flex;
          flex-direction: column;
          gap: $spacing-md;
        }

        .control-item {
          display: flex;
          flex-direction: column;
          gap: $spacing-xs;
        }

        .control-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: $dark-gray;
          font-weight: 500;
          font-size: 14px;
        }

        .value-display {
          color: $primary-color;
          font-family: monospace;
          font-size: 13px;
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
      }

      .preview-box {
        height: 160px;
        background: $light-gray;
        border: 1px dashed $medium-gray;
        border-radius: $border-radius;
        display: flex;
        align-items: stretch;
        justify-content: stretch;
      }

      .marquee-item {
        background: #2563eb;
        color: #fff;
        padding: 8px 12px;
        border-radius: 6px;
        box-shadow: $shadow-light;
        white-space: nowrap;
      }

      .code-section {
        display: flex;
        flex-direction: column;
        gap: $spacing-md;
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
          background: $dark-gray;
          padding: $spacing-md;
          border-radius: $border-radius;
          overflow-x: auto;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;

          code {
            color: $light-gray;
          }
        }

        .copy-button {
          position: absolute;
          top: calc($spacing-sm + $spacing-md);
          right: calc($spacing-sm + $spacing-md);
          @include button-shared;
          background-color: $primary-color;
          color: white;
          font-size: 12px;
          padding: $spacing-xs $spacing-sm;

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

input[type='number'],
input[type='range'],
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