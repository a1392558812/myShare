<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>Affix 固钉</h2>
        </div>

        <div class="grid-controls">
          <div class="shadow-layer">
            <div class="control-group">
              <div class="control-item">
                <div class="control-label">
                  <span>position</span>
                </div>
                <select v-model="position">
                  <option value="fixed">fixed</option>
                  <option value="absolute">absolute</option>
                </select>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>top:在触发顶部固定之后 CSS 的 top 值</span>
                  <span class="value-display">{{ top ?? triggerTop }}px</span>
                </div>
                <input type="number" v-model.number="top" min="0" max="200" step="1" placeholder="未设定则使用 triggerTop" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>bottom:在触发底部固定之后 CSS 的 bottom 值</span>
                  <span class="value-display">{{ bottom ?? triggerBottom }}px</span>
                </div>
                <input type="number" v-model.number="bottom" min="0" max="200" step="1"
                  placeholder="未设定则使用 triggerBottom" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>triggerTop:顶部固定的触发距离</span>
                  <span class="value-display">{{ triggerTop ?? top }}px</span>
                </div>
                <input type="number" v-model.number="triggerTop" min="0" max="400" step="1" placeholder="未设定则使用 top" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>triggerBottom:底部固定的触发距离</span>
                  <span class="value-display">{{ triggerBottom ?? bottom }}px</span>
                </div>
                <input type="number" v-model.number="triggerBottom" min="0" max="400" step="1"
                  placeholder="未设定则使用 bottom" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>listenTo</span>
                </div>
                <select v-model="listenTo">
                  <option value="window">window</option>
                  <option value="#affix-scroll">#affix-scroll</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <h2>预览</h2>
        <div class="preview-container">
          <div class="scroll-wrap">
            <div id="affix-scroll" class="scroll-area">
              <div class="spacer">上方内容占位：滚动试试</div>
              <Affix :position="position" :top="top" :bottom="bottom" :trigger-top="triggerTop"
                :trigger-bottom="triggerBottom" :listen-to="listenTo" @reach-top="onAffixReachTop"
                @reach-bottom="onAffixReachBottom" @scroll="onAffixScroll">
                <div class="affix-demo">
                  我是affix，当靠近顶部/底部一定距离时，会固定到 {{ position }}，
                  top={{ top ?? triggerTop }} / bottom={{ bottom ?? triggerBottom }}
                </div>
              </Affix>
              <div class="spacer">下方内容占位：继续滚动</div>
            </div>
          </div>
        </div>

        <div class="code-section">
          <h2>exampleCode</h2>
          <div class="code-container">
            <pre><code>{{ exampleCode }}</code></pre>
            <button class="copy-button" @click="onCopyClick" :class="{ 'copied': copied }">
              {{ copied ? '✓ 已复制' : '📋 复至配置' }}
            </button>
          </div>
        </div>

        <div class="code-section">
          <h2>源码查看</h2>
          <div class="code-container">
            <pre><code>👇👇👇👇👇👇</code></pre>
          </div>
        </div>
      </section>
    </main>

    <codeContent />
  </div>
</template>

<script setup lang="jsx">
import { ref, computed } from 'vue'
import Affix from './components/index.vue'
import baseConfig, { toastFun } from '../static/hooks/extends.js'

defineOptions({
  extends: baseConfig({
    toast: import('../components/toast/index.vue')
  }),
})

const copied = ref(false)

const position = ref('fixed')
const top = ref(106)
const bottom = ref(16)
const triggerTop = ref(16)
const triggerBottom = ref(16)
const listenTo = ref('#affix-scroll') // window  #affix-scroll


const toastContentStyle = {
  overflow: 'auto',
  whiteSpace: 'normal',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  wordBreak: 'break-all',
}
const onAffixReachTop = (data) => {
  toastFun.open({
    contentSlot: () => (<span>触顶：{JSON.stringify(data)}</span>),
    contentStyle: toastContentStyle
  })
}
const onAffixReachBottom = (data) => {
  toastFun.open({
    contentSlot: () => (<span>触底：{JSON.stringify(data)}</span>),
    contentStyle: toastContentStyle
  })
}

const onAffixScroll = (data) => {
  toastFun.open({
    contentSlot: () => (<span>滚动中：{JSON.stringify(data)}</span>),
    contentStyle: toastContentStyle
  })
}

const exampleCode = computed(() => `<div id=\"affix-scroll\" class=\"scroll-area\">\n  <Affix position=\"${position.value}\" top=${top.value} bottom=${bottom.value} trigger-top=${triggerTop.value} trigger-bottom=${triggerBottom.value} listen-to=\"${listenTo.value}\">\n    <div class=\"affix-demo\">Affix Demo</div>\n  </Affix>\n</div>`)

const onCopyClick = () => {
  navigator.clipboard.writeText(exampleCode.value).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
}
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.app-container {
  background-color: $light-gray;
  padding: $spacing-md;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  .main-content {
    width: calc(100vw - $spacing-md * 2);
    min-height: calc(100vh - $spacing-md * 2);
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
                color: $medium-gray;
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
      min-width: 500px;
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

        .scroll-wrap {
          display: flex;
          align-items: stretch;
          justify-content: center;
        }

        .scroll-area {
          width: 100%;
          height: 320px;
          overflow: auto;
          background: $light-gray;
          border-radius: $border-radius;
          border: 1px dashed $medium-gray;
          padding: $spacing-lg;
        }

        .spacer {
          height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: $dark-gray;
        }

        .affix-demo {
          background: #2563eb;
          color: #fff;
          padding: 10px 12px;
          border-radius: 6px;
          box-shadow: $shadow-light;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .event-log {
          background: white;
          border: 1px solid $medium-gray;
          border-radius: $border-radius;
          padding: $spacing-md;
        }

        .event-log-header {
          font-weight: 600;
          color: $secondary-color;
          margin-bottom: $spacing-sm;
        }

        .event-log-list {
          margin: 0;
          padding-left: $spacing-md;
          color: $dark-gray;
          font-size: 12px;
        }
      }

      .code-section {
        display: flex;
        flex-direction: column;
        gap: $spacing-md;

        .code-container {
          @include control-shared;
          padding: $spacing-md;
          margin-bottom: $spacing-md;
          border: 1px solid $medium-gray;
          box-shadow: $shadow-light;
          background: #1e293b;
          position: relative;

          pre {
            margin: 0;
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
            top: $spacing-sm;
            right: $spacing-sm;
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
}

input[type='number'],
select {
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