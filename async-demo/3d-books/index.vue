<template>
  <div>
    <div class="app-container">
      <main class="main-content">
        <section class="control-panel">
          <div class="header-actions">
            <h2>翻翻书（ccb）</h2>
            <div class="actions">
              <button class="btn" @click="addPage">添加new页</button>
              <button class="btn danger" @click="removePage" :disabled="pages.length <= 1">删除最后1页</button>
            </div>
          </div>

          <div class="control-group">
            <div class="pages-editor">
              <h3>基本配置</h3>
              <div class="control-item">
                <div class="control-label">
                  <span>拖拽灵敏度</span>
                  <span class="value-display">{{ dragSensitivity.toFixed(2) }}</span>
                </div>
                <input type="range" v-model.number="dragSensitivity" min="0.8" max="3" step="0.1">
              </div>

              <div class="control-item checkbox-control">
                <label>
                  <input type="checkbox" v-model="doubleSided">
                  每一页是否正反俩面显示
                </label>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>封面（正面）内容</span>
                </div>
                <input type="text" v-model="coverFront" class="text-input" placeholder="封面标题">
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>封面（背面）内容</span>
                </div>
                <input type="text" v-model="coverBack" class="text-input" placeholder="封面背面文字">
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>封底（正面）内容</span>
                </div>
                <input type="text" v-model="backFront" class="text-input" placeholder="封底正面内容">
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>封底（背面）内容</span>
                </div>
                <input type="text" v-model="backBack" class="text-input" placeholder="封底背面内容">
              </div>
            </div>

            <div style="flex: 1;" class="pages-editor">
              <h3>页内容配置</h3>
              <div class="page-list">
                <div class="page-item" v-for="(p, i) in pages" :key="i">
                  <div class="control-label">
                    <span>第 {{ i + 1 }} 页</span>
                  </div>
                  <input type="text" v-model="p.front" class="text-input" placeholder="正面内容">
                  <input v-if="doubleSided" type="text" v-model="p.back" class="text-input" placeholder="背面内容">
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="preview-panel">
          <h2>预览</h2>
          <div class="preview-container">
            <FlipBook ref="flipBookRef" :pages="pages" :cover-front="coverFront" :cover-back="coverBack"
              :back-front="backFront" :back-back="backBack" :double-sided="doubleSided" :width="200" :height="300"
              :drag-sensitivity="dragSensitivity" @currentPageChange="onCurrentPageChange"
              @totalPagesChange="onTotalPagesChange" />

            <div class="hint-bar">
              <button class="btn" @click="prevPage">上一页</button>
              <span class="page-indicator">{{ currentPage }} / {{ totalPages }}</span>
              <button class="btn" @click="nextPage">下一页</button>

              <button class="btn" @click="onGotoPage">
                跳转到第 <input style="width: 3em;" type="number" v-model.number="currentPage" class="text-input"
                  placeholder="页码"> 页
              </button>
            </div>
          </div>

          <div class="usage-example">
            <h3>提示</h3>
            <pre><code>拖拽或滚轮可翻页,</code></pre>
          </div>

          <h2>使用示例</h2>

          <div class="usage-example">
            <div v-for="value in 10" :key="value">👇</div>
          </div>
        </section>
      </main>
    </div>

    <codeContent />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FlipBook from './components/index.vue';
import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig(),
})

const dragSensitivity = ref(1.5);
const doubleSided = ref(true);

const coverFront = ref('Books封面-大标题');
const coverBack = ref('封面背面');
const backFront = ref('封底正面');
const backBack = ref('谢谢阅读');
const flipBookRef = ref(null);
const currentPage = ref(0)
const totalPages = ref(0)

const pagesFun = () => {
  const list = []
  for (let i = 0; i < 10; i++) {
    list.push({ front: `第 ${i + 1} 页`, back: `第 ${i + 1} 页背面` })
  }
  return list
}

const originPages = pagesFun()

const pages = ref(originPages);

const addPage = () => pages.value.push({ front: `新页 ${pages.value.length + 1}`, back: `新页北面 ${pages.value.length + 1}` });
const removePage = () => { if (pages.value.length) pages.value.pop(); };


const onCurrentPageChange = (currentPageValue) => {
  currentPage.value = currentPageValue
}
const onTotalPagesChange = (totalPagesValue) => {
  totalPages.value = totalPagesValue
}

const prevPage = () => {
  flipBookRef.value.prevPage()
}
const nextPage = () => {
  flipBookRef.value.nextPage()
}

const onGotoPage = () => {
  const val = +currentPage.value.toFixed(0) || 0
  flipBookRef.value.goTo(Math.min(val, totalPages.value))
}
</script>

<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.app-container {
  height: calc(100vh - $spacing-md * 2);
  background-color: $light-gray;
  padding: $spacing-md;
  max-width: 1400px;
  min-width: 1200px;
  margin: 0 auto;

  .main-content {
    display: flex;
    gap: $spacing-lg;
    height: 100%;

    .text-input {
      padding: 8px 12px;
      border: 1px solid $medium-gray;
      border-radius: $border-radius;
      font-size: 14px;
    }

    .control-panel {
      width: calc((100% - $spacing-lg) / 2);
      background: #fff;
      border-radius: $border-radius;
      padding: $spacing-md;
      box-shadow: $shadow-light;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: start;
      justify-content: start;

      .header-actions {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-md;
        flex-shrink: 0;

        .actions {
          display: flex;
          gap: $spacing-sm;
        }
      }

      .control-group {
        width: 100%;
        flex: 1;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: $spacing-md;
        overflow: hidden;

        .pages-editor {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: $spacing-sm;
          overflow: auto;
          padding: $spacing-md;
          border: 1px solid $medium-gray;
          border-radius: $border-radius;

          .control-item {
            flex-shrink: 0;
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
          }

          .control-item.checkbox-control {
            flex-direction: row;
            align-items: center;
          }

          .page-list {
            flex: 1;
            flex-shrink: 0;
            overflow: auto;

            .page-item {
              display: flex;
              flex-direction: column;
              gap: $spacing-xs;
              padding: $spacing-sm;
              border: 1px dashed $light-gray;
              border-radius: $border-radius;
              background: rgba(255, 255, 255, 0.6);
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

      .preview-container {
        background: #fff;
        border-radius: $border-radius;
        padding: $spacing-md;
        box-shadow: $shadow-light;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: $spacing-lg;

        .hint-bar {
          display: flex;
          align-items: center;
          gap: $spacing-sm;

          .page-indicator {
            font-family: monospace;
            color: $secondary-color;
          }


        }
      }

      .usage-example {
        background: $light-gray;
        padding: $spacing-md;
        border-radius: $border-radius;
        box-shadow: $shadow-light;

        pre {
          margin: 0;
          color: $dark-gray;
          font-size: 14px;
        }
      }
    }

    h2 {
      margin: 0;
      color: $dark-gray;
      font-size: 20px;
      font-weight: 600;
    }

    h3 {
      margin: 0;
      color: $dark-gray;
      font-size: 18px;
      font-weight: 600;
    }
  }
}


.btn {
  border: none;
  border-radius: $border-radius;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  background: $light-gray;
  color: $dark-gray;

  &:hover {
    background: $medium-gray;
  }
}

.btn.danger {
  background: #ef4444;
  color: #fff;
}
</style>