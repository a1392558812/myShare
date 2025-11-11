<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>控制面板</h2>
          <div class="add-layer-wrap">
            <button class="add-layer-btn" @click="openDialog({ overlayStyle: { zIndex: 1000 } })">查看源码</button>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">
            <input type="checkbox" v-model="vertical" />
            垂直布局
          </label>
        </div>
        <div class="control-group">
          <label class="control-label">
            按比例调整布局(按逗号‘,’分割)
            <input v-model="defaultProportion" type="text" class="number-control" />
          </label>
        </div>

        <div class="control-group">
          <label class="control-label">
            minSize:
            <input type="number" v-model.number="minSize" min="0" class="number-control" /> px
          </label>
        </div>

        <div class="control-group">
          <label class="control-label">
            没用的color-picker组件({{ bgColor }}):
            <colorPicker :tipsStyle="{ transform: 'translate(-300px, 10px)' }" v-model="bgColor" />
          </label>
        </div>

        <div class="control-group">
          <label class="control-label">
            maxSize:
            <input type="number" v-model.number="maxSize" min="0" class="number-control" /> px
          </label>
        </div>
      </section>

      <section class="preview-panel">
        <h2>预览区域</h2>
        <div class="preview-container">
          <div class="preview-allotment">
            <Allotment ref="allotmentRef" :vertical="vertical" :default-proportion="defaultProportion.split(',')"
              :min-size="minSize" :max-size="maxSize" @startDragging="(data) => onListenEmit(data, 'startDragging')"
              @handleDragging="(data) => onListenEmit(data, 'handleDragging')"
              @stopDragging="(data) => onListenEmit(data, 'stopDragging')" @layoutError="handleLayoutError">
              <Pane v-for="(item, index) in paneList" :key="index" :min-size="item.minSize" :max-size="item.maxSize">
                <template #default="{ size, isDragging }">
                  <div v-if="!item.children || !item.children.length" class="pane-demo" :style="item.style">
                    <h3>窗格 {{ index }}</h3>
                    <p>{{ vertical ? '垂直布局' : '水平布局' }}</p>
                    <p>这是第{{ index }}个窗格的内容区域。</p>
                    <div>minSize: {{ item.minSize || 'undefined' }}</div>
                    <div>maxSize: {{ item.maxSize || 'undefined' }}</div>
                    <div>size: {{ size }}</div>
                    <div>isDragging: {{ isDragging }}</div>
                    <div>
                      <div>手动触发size调节:</div>
                      <div>
                        <button class="update-size-btn" @click="(e) => updatePaneSize(e, index)">
                          <input type="number" :min="minSize" :max="maxSize" @click.stop.prevent="() => { }"
                            class="number-control" /> px
                        </button>
                      </div>
                    </div>
                  </div>
                  <template v-else>
                    <Allotment :vertical="!vertical" :default-proportion="defaultProportion.split(',')"
                      :min-size="minSize" :max-size="maxSize"
                      @startDragging="(data) => onListenEmit(data, 'startDragging')"
                      @handleDragging="(data) => onListenEmit(data, 'handleDragging')"
                      @stopDragging="(data) => onListenEmit(data, 'stopDragging')" @layoutError="handleLayoutError">
                      <Pane v-for="(childItem, childIndex) in item.children" :key="childIndex"
                        :min-size="childItem.minSize" :max-size="childItem.maxSize">
                        <template #default="{ size: childSize, isDragging }">
                          <div :style="childItem.style" class="pane-demo">
                            <h3>窗格 {{ index }}-{{ childIndex }}</h3>
                            <p>{{ !vertical ? '垂直布局' : '水平布局' }}</p>
                            <p>这是第{{ index }}-{{ childIndex }}个窗格的内容区域</p>
                            <div>minSize: {{ childItem.minSize || 'undefined' }}</div>
                            <div>maxSize: {{ childItem.maxSize || 'undefined' }}</div>
                            <div>fathSize: {{ size }}</div>
                            <div>size: {{ childSize }}</div>
                            <div>isDragging: {{ isDragging }}</div>
                          </div>
                        </template>
                      </Pane>
                    </Allotment>
                  </template>
                </template>
              </Pane>
            </Allotment>
          </div>
        </div>

        <div class="code-section">
          <h2>代码示例</h2>
          <div class="code-container">
            <pre class="code-block"><code>{{ codeExample }}</code></pre>

            <button class="copy-button" @click="onCopyClick" :class="{ 'copied': copied }">
              {{ copied ? '✓ 已复制' : '📋 复制代码' }}
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Allotment from './components/index.vue';
import Pane from './components/item.vue';
import { colorPicker } from '../components/color-picker/index.js';

import baseConfig, { toastFun } from '../static/hooks/extends.js'

defineOptions({
  extends: baseConfig({
    toast: import('../components/toast/index.vue'),
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const toastContentStyle = {
  overflow: 'auto',
  whiteSpace: 'normal',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  wordBreak: 'break-all',
}
const allotmentRef = ref(null);
const vertical = ref(false);
const defaultProportion = ref('1,2,1');
const minSize = ref(100);
const maxSize = ref(999);
const bgColor = ref('rgba(255, 208, 255, 0.4)');

const paneList = ref([
  { style: { backgroundColor: 'rgba(255, 208, 255, 0.04)' }, children: [] },
  {
    children: [
      { style: { backgroundColor: 'rgba(255, 208, 28, 0.04)' }, maxSize: 999 },
      { style: { backgroundColor: 'rgba(255, 28, 208, 0.04)' }, minSize: 300, maxSize: 999 },
      { style: { backgroundColor: 'rgba(25, 208, 208, 0.04)' }, minSize: 100, maxSize: 999 }]
  },
  { style: { backgroundColor: 'rgba(208, 255, 255, 0.04)' }, minSize: 150 },
])

const codeExample = computed(() => `<Allotment :vertical="${vertical.value}" :default-proportion="[${defaultProportion.value.split(',')}]" :min-size="${minSize.value}" :max-size="${maxSize.value}" @startDragging="(data) => onListenEmit(data, 'startDragging')" @handleDragging="(data) => onListenEmit(data, 'handleDragging')" @stopDragging="(data) => onListenEmit(data, 'stopDragging')" @layoutError="handleLayoutError">
  <Pane v-for="(item, index) in ${JSON.stringify(paneList.value)}" :key="index" :min-size="item.minSize" :max-size="item.maxSize">
    <template #default="{ size, isDragging }">
      <div v-if="!item.children || !item.children.length" class="pane-demo">
        <h3>窗格 {{ index }}-vertical:{{ vertical }}</h3>
        <p>这是第{{ index }}个窗格的内容区域。</p>
        <div>minSize: {{ item.minSize || 'undefined' }}</div>
        <div>maxSize: {{ item.maxSize || 'undefined' }}</div>
        <div>size: {{ size }}</div>
        <div>isDragging: {{ isDragging }}</div>
      </div>
      <template v-else>
        <Allotment :vertical="!${vertical.value}" :default-proportion="[${defaultProportion.value.split(',')}]" :min-size="${minSize.value}" :max-size="${maxSize.value}" @startDragging="(data) => onListenEmit(data, 'startDragging')" @handleDragging="(data) => onListenEmit(data, 'handleDragging')" @stopDragging="(data) => onListenEmit(data, 'stopDragging')" @layoutError="handleLayoutError">
          <Pane v-for="(childItem, childIndex) in item.children" :key="childIndex"
            :min-size="childItem.minSize" :max-size="childItem.maxSize">
            <template #default="{ size: childSize, isDragging }">
              <div class="pane-demo">
                <h3>窗格 {{ index }}-{{ childIndex }}-vertical:{{ !vertical }}</h3>
                <p>这是第{{ index }}-{{ childIndex }}个窗格的内容区域</p>
                <div>minSize: {{ childItem.minSize || 'undefined' }}</div>
                <div>maxSize: {{ childItem.maxSize || 'undefined' }}</div>
                <div>fathSize: {{ size }}</div>
                <div>size: {{ childSize }}</div>
                <div>isDragging: {{ isDragging }}</div>
              </div>
            </template>
          </Pane>
        </Allotment>
      </template>
    </template>
  </Pane>
</Allotment>`);

const copied = ref(false);
const onCopyClick = () => {
  navigator.clipboard.writeText(codeExample.value).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
}

const updatePaneSize = (e, index) => {
  let inputRef = e.target.querySelector('input')
  let val = inputRef.value || 0
  val = Number(val).toFixed(0)
  val = val < minSize.value ? minSize.value : val > maxSize.value ? maxSize.value : val
  inputRef.value = val
  inputRef = null

  console.log('updatePaneSize', allotmentRef.value.panes)
  allotmentRef.value.updatePaneSize(allotmentRef.value.panes[index].id, val)
}

const onListenEmit = (data, msg) => {
  console.log(msg, data)
  toastFun.open({
    message: `${msg}: ${JSON.stringify(data.panes[data.index])}`,
    contentStyle: toastContentStyle,
  })
}

const handleLayoutError = (error) => {
  console.error('布局错误:', error.message);
  toastFun.open({
    message: `布局错误: ${error.message}`,
    contentStyle: toastContentStyle,
  })
};
</script>

<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.app-container {
  background-color: $light-gray;
  padding: $spacing-md;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  .main-content {
    width: calc(100vw - $spacing-md * 2);
    height: calc(100vh - $spacing-md * 2);
    display: flex;
    gap: $spacing-lg;

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
        margin-bottom: $spacing-lg;

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

      .control-group {
        margin-bottom: $spacing-md;
      }

      .control-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 14px;
        color: $dark-gray;
        gap: $spacing-sm;

        input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
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
        flex: 1;

        .preview-allotment {
          height: 660px;
          border: 1px solid $medium-gray;

          .update-size-btn {
            @include button-shared;
            background-color: $light-gray;
            color: $secondary-color;
            gap: $spacing-sm;

            &:hover {
              background-color: $medium-gray;
            }
          }

          &>div {
            height: 100%;
          }
        }
      }

      .code-section {
        display: flex;
        flex-direction: column;
        gap: $spacing-md;

        .code-container {
          @include control-shared;
          padding: $spacing-md;
          box-shadow: $shadow-light;
          position: relative;

          .code-block {
            background-color: #2d3748;
            color: #e2e8f0;
            border-radius: $border-radius;
            padding: $spacing-md;
            overflow-x: auto;
            margin: 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
          }

          .copy-button {
            @include button-shared;
            position: absolute;
            top: calc($spacing-sm + $spacing-md);
            right: calc($spacing-sm + $spacing-md);
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

    .number-control {
      padding: $spacing-xs $spacing-sm;
      border: 1px solid $medium-gray;
      border-radius: $border-radius;
      width: 100px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: $primary-color;
      }
    }
  }
}

.pane-demo {
  height: 100%;

  h3 {
    color: $primary-color;
  }

  p {
    line-height: 1.6;
    color: #4a5568;
  }
}
</style>