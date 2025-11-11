<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>Popover 气泡</h2>
          <div class="add-layer-wrap">
            <button class="add-layer-btn" @click="openDialog({ overlayStyle: { zIndex: 1000 } })">查看源码</button>
          </div>
        </div>

        <div class="grid-controls">
          <div class="shadow-layer">
            <div class="layer-header">
              <h3>基本设置</h3>
              <div class="layer-actions"></div>
            </div>

            <div class="control-group">
              <div class="control-item">
                <div class="control-label">
                  <span>placement：弹出位置</span>
                  <span class="value-display">{{ placement }}</span>
                </div>
                <select v-model="placement">
                  <option value="top">top</option>
                  <option value="right">right</option>
                  <option value="bottom">bottom</option>
                  <option value="left">left</option>
                </select>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>flip：空间不足时翻转</span>
                  <span class="value-display">{{ flip ? '开启' : '关闭' }}</span>
                </div>
                <select v-model="flip">
                  <option :value="true">true</option>
                  <option :value="false">false</option>
                </select>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>duration：悬浮关闭延迟(-1为不关闭)</span>
                  <span class="value-display">{{ duration }} ms</span>
                </div>
                <input type="number" v-model.number="duration" min="-1" step="50" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>show-arrow：是否显示箭头</span>
                  <span class="value-display">{{ showArrow ? '显示' : '隐藏' }}</span>
                </div>
                <select v-model="showArrow">
                  <option :value="true">true</option>
                  <option :value="false">false</option>
                </select>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>预览区域padding设置</span>
                  <span class="value-display">padding:{{ previewBoxPadding.paddingT }}px {{ previewBoxPadding.paddingR
                  }}px {{ previewBoxPadding.paddingB }}px {{ previewBoxPadding.paddingL }}px</span>
                </div>
                <div class="control-label" v-for="key in Object.keys(previewBoxPadding)" :key="key">
                  <span style="width: 4em;">{{ key }}:</span>
                  <input type="number" v-model.number="previewBoxPadding[key]" min="0" max="2000" step="1" />
                </div>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>tipsBubbleOffset：箭头偏移</span>
                  <span class="value-display">{{ tipsBubbleOffset }}px</span>
                </div>
                <input type="number" v-model.number="tipsBubbleOffset" min="-200" max="200" step="1" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>customTipsBubbleOffset：自定义气泡偏移</span>
                  <span class="value-display">x:{{ customTipsBubbleOffset.x }}px</span>
                  <span class="value-display">y:{{ customTipsBubbleOffset.y }}px</span>
                </div>
                <div class="control-label" v-for="key in Object.keys(customTipsBubbleOffset)" :key="key">
                  <span>{{ key }}:</span>
                  <input type="number" v-model.number="customTipsBubbleOffset[key]" min="-200" max="200" step="1" />
                </div>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>tipsBubbleArrowSize：气泡箭头大小</span>
                  <span class="value-display">{{ tipsBubbleArrowSize }}px</span>
                </div>
                <input type="number" v-model.number="tipsBubbleArrowSize" min="0" max="30" step="1" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>tipsBubbleBorderWidth：气泡边框宽度</span>
                  <span class="value-display">{{ tipsBubbleBorderWidth }}px</span>
                </div>
                <input type="number" v-model.number="tipsBubbleBorderWidth" min="0" max="10" step="1" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>气泡背景色：<input type="color" v-model="tipsBubbleBackgroundColor" class="color-picker" /></span>
                  <span class="value-display">{{ tipsBubbleBackgroundColor }}</span>
                </div>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>气泡边框颜色：<input type="color" v-model="tipsBubbleBorderColor" class="color-picker" /></span>
                  <span class="value-display">{{ tipsBubbleBorderColor }}</span>
                </div>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>气泡圆角</span>
                  <span class="value-display">{{ tipsBubbleRadius }}px</span>
                </div>
                <input type="number" v-model.number="tipsBubbleRadius" min="0" max="32" step="1" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>气泡padding设置</span>
                  <span class="value-display">padding:{{ tipsBubblePadding.paddingT }}px {{ tipsBubblePadding.paddingR
                  }}px {{ tipsBubblePadding.paddingB }}px {{ tipsBubblePadding.paddingL }}px</span>
                </div>
                <div class="control-label" v-for="key in Object.keys(tipsBubblePadding)" :key="key">
                  <span style="width: 4em;">{{ key }}:</span>
                  <input type="number" v-model.number="tipsBubblePadding[key]" min="0" max="2000" step="1" />
                </div>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>customTipsBubbleStyle：自定义气泡样式(JSON)</span>
                </div>
                <textarea rows="4" v-model="computedCustomTipsBubbleStyle" placeholder="自定义气泡样式" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>customContentStyle：弹层样式(JSON)</span>
                </div>
                <textarea rows="4" v-model="computedCustomContentStyle" placeholder="自定义弹层样式" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>customPopoverTriggerStyle：自定义触发包裹元素样式(JSON)</span>
                </div>
                <textarea rows="4" v-model="computedCustomPopoverTriggerStyle" placeholder="自定义触发元素样式" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>方法</span>
                </div>
                <div class="action-buttons">
                  <button class="action-btn" @click="open">open()</button>
                  <button class="action-btn" @click="close">close()</button>
                  <button class="action-btn" @click="reposition">reposition()</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <h2>预览</h2>
        <div class="preview-container">
          <div class="preview-box"
            :style="{ padding: `${previewBoxPadding.paddingT}px ${previewBoxPadding.paddingR}px ${previewBoxPadding.paddingB}px ${previewBoxPadding.paddingL}px` }">
            <div>
              <Popover ref="popoverRef" :placement="placement" :flip="flip" :tipsBubbleOffset="`${tipsBubbleOffset}px`"
                :duration="duration" :show-arrow="showArrow" :custom-content-style="customContentStyle"
                :tips-bubble-arrow-size="tipsBubbleArrowSize" :tips-bubble-border-width="tipsBubbleBorderWidth"
                :tips-bubble-border-color="tipsBubbleBorderColor"
                :tips-bubble-background-color="tipsBubbleBackgroundColor" :tips-bubble-radius="`${tipsBubbleRadius}px`"
                :tips-bubble-padding="`${tipsBubblePadding.paddingT}px ${tipsBubblePadding.paddingR}px ${tipsBubblePadding.paddingB}px ${tipsBubblePadding.paddingL}px`"
                :custom-tips-bubble-offset="customTipsBubbleOffset" :custom-tips-bubble-style="customTipsBubbleStyle"
                :custom-popover-trigger-style="customPopoverTriggerStyle" @insufficient-space="onInsufficient"
                @occluded="onOccluded" @visible="onVisible">
                <template #default>
                  <button class="trigger-btn">Hover me</button>
                </template>
                <template #popoverSlot>
                  <div class="bubble-content">
                    <h4>Popover</h4>
                    <p>左侧面板plane调节参数</p>
                    <p>鼠标移入弹层不会立刻关闭。</p>
                  </div>
                </template>
              </Popover>
            </div>
          </div>
        </div>

        <div class="code-section">
          <h2>exampleCode</h2>
          <div class="code-container">
            <jsonEditor :editable="jsonEditable" :value="emitData" @edit="onDataEdit" @add="onDataAdd"
              @delete="onDataDelete" />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import Popover from './components/index.vue'
import jsonEditor from '../components/json-editor/index.vue'

import baseConfig from '../static/hooks/extends.js'

defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue')
  }),
})

const placement = ref('top')
const flip = ref(true)
const tipsBubbleOffset = ref(0)
const duration = ref(-1)
const showArrow = ref(true)
const customTipsBubbleOffset = reactive({ x: 0, y: 0 })
const previewBoxPadding = reactive({ paddingT: 300, paddingR: 0, paddingB: 0, paddingL: 300 })
const tipsBubbleArrowSize = ref(8)
const tipsBubbleBorderWidth = ref(1)
const tipsBubbleBorderColor = ref('#111827')
const tipsBubbleBackgroundColor = ref('#ffffff')
const tipsBubbleRadius = ref(8)
const tipsBubblePadding = reactive({ paddingT: 12, paddingR: 12, paddingB: 12, paddingL: 12 })

const customTipsBubbleStyle = ref({ minWidth: '280px' })
const customContentStyle = ref({ maxWidth: '666px' })
const customPopoverTriggerStyle = ref({ backgroundColor: 'transparent' })

const jsonEditable = ref(false)

const emitData = reactive({
  occludedEmitData: {},
  insufficientEmitData: {},
  visibleEmitData: {},
})

const computedCustomTipsBubbleStyle = computed({
  get() {
    return JSON.stringify(customTipsBubbleStyle.value)
  },
  set(newVal) {
    try {
      customTipsBubbleStyle.value = JSON.parse(newVal || '{}')
    } catch (error) {
      customTipsBubbleStyle.value = {}
    }
  },
})

const computedCustomContentStyle = computed({
  get() {
    return JSON.stringify(customContentStyle.value)
  },
  set(newVal) {
    try {
      customContentStyle.value = JSON.parse(newVal || '{}')
    } catch (error) {
      customContentStyle.value = {}
    }
  },
})

const computedCustomPopoverTriggerStyle = computed({
  get() {
    return JSON.stringify(customPopoverTriggerStyle.value)
  },
  set(newVal) {
    try {
      customPopoverTriggerStyle.value = JSON.parse(newVal || '{}')
    } catch (error) {
      customPopoverTriggerStyle.value = {}
    }
  },
})

const popoverRef = ref(null)
const open = () => {
  popoverRef.value?.open()
}
const close = () => {
  popoverRef.value?.close()
}
const reposition = () => {
  popoverRef.value?.reposition()
}

const onOccluded = (data) => {
  emitData.occludedEmitData = data
}
const onInsufficient = (data) => {
  emitData.insufficientEmitData = data
}
const onVisible = (data) => {
  emitData.visibleEmitData = data
}

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
          }

          .control-group {
            display: flex;
            flex-direction: column;
            gap: $spacing-md;

            .control-item {
              display: flex;
              flex-direction: column;
              gap: $spacing-xs;
              padding: $spacing-md;
              border: 1px solid $medium-gray;

              .control-label {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: $dark-gray;
                font-weight: 500;
                font-size: 14px;
                gap: $spacing-md;

                .color-picker {
                  vertical-align: middle;
                }

                .value-display {
                  color: $primary-color;
                  font-family: monospace;
                  font-size: 13px;
                }
              }

              .action-buttons {
                display: flex;
                gap: $spacing-sm;

                .action-btn {
                  @include button-shared;
                  background-color: $light-gray;
                  color: $secondary-color;

                  &:hover {
                    background-color: $medium-gray;
                  }
                }
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
        flex-shrink: 0;
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .preview-container {
        @include control-shared;
        padding: $spacing-lg;
        box-shadow: $shadow-light;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        gap: $spacing-lg;
        height: 350px;
        overflow: auto;

        .preview-box {
          flex-shrink: 0;
          width: 1800px;
          height: 1800px;
          background: $light-gray;
          border: 1px dashed $medium-gray;
          border-radius: $border-radius;
          display: flex;
        }
      }

      .code-section {
        flex: 1;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: $spacing-md;
        overflow: auto;

        .code-container {
          @include control-shared;
          padding: $spacing-md;
          margin-bottom: $spacing-md;
          border: 1px solid $medium-gray;
          box-shadow: $shadow-light;
          position: relative;

        }
      }

      .trigger-btn {
        @include button-shared;
        background-color: $primary-color;
        height: 100px;
        color: white;

        &:hover {
          background-color: darken($primary-color, 10%);
        }
      }
    }
  }
}

input[type='number'],
textarea,
select,
input[type='text'] {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid $medium-gray;
  border-radius: $border-radius;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

textarea {
  resize: vertical;
}
</style>