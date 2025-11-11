<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>分页</h2>
        </div>

        <div class="control-group">
          <div class="control-item">
            <div class="control-label">
              <span>总条数 (page-total)</span>
              <span class="value-display">{{ pageTotal }}</span>
            </div>
            <input type="range" v-model.number="pageTotal" min="1" max="2000" step="1" class="range-control">
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>页码窗口大小 (page-slot)</span>
              <span class="value-display">{{ pageSlot }}</span>
            </div>
            <input type="range" v-model.number="pageSlot" min="3" max="15" step="1" class="range-control">
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>每页条数 (page-sizes)</span>
              <span class="value-display">{{ pageSizes.join(', ') }}</span>
            </div>
            <input type="text" v-model="sizesStr" class="text-input" placeholder="例如：10,20,30,50" />
            <div class="hint">逗号分隔，自动去重与排序</div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>上一页</span>
            </div>
            <button class="common-btn" :disabled="currentPage === 1"
              @click="paginationRef.goTo(currentPage - 1)">上一页</button>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>下一页</span>
            </div>
            <button class="common-btn" :disabled="currentPage * pageSize > pageTotal"
              @click="paginationRef.goTo(currentPage + 1)">下一页</button>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>跳转至</span>
            </div>
            <div class="control-content">
              <input type="number" v-model.number="jumpInput" class="text-input" placeholder="输入页码" />
              <button class="common-btn" :disabled="jumpInput * pageSize > pageTotal"
                @click="paginationRef.goTo(jumpInput)">跳转</button>
            </div>
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>自定义-sizes-{{ pageSize }}</span>
            </div>
            <input type="number" v-model.number="pageSize" class="text-input" placeholder="输入每页条数" />
          </div>

          <div class="control-item">
            <div class="control-label">
              <span>展示顺序 (display-order)</span>
              <span class="value-display">{{ displayOrder.join(' | ') }}</span>
            </div>
            <div class="order-presets">
              <button :class="{ active: orderPreset === 0 }" @click="orderPreset = 0">pages → size-picker →
                quick-jumper</button>
              <button :class="{ active: orderPreset === 1 }" @click="orderPreset = 1">size-picker → pages →
                quick-jumper</button>
              <button :class="{ active: orderPreset === 2 }" @click="orderPreset = 2">quick-jumper → pages →
                size-picker</button>
            </div>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <h2>预览</h2>
        <div class="preview-container">
          <Pagination ref="paginationRef" v-model="currentPage" :pageTotal="pageTotal" :pageSlot="pageSlot"
            v-model:pageSize="pageSize" :displayOrder="displayOrder">
            <template #pageNumber="{ page, click, pageCount }">
              <button class="page-number" :class="{ 'active': +page === +currentPage }" @click="click">{{ page
              }}</button>
            </template>

            <template #pageEllipsis="{ page, pageCount }">
              <span class="ellipsis">{{ page }}</span>
            </template>

            <template #pagePrev="{ click, pageCount }">
              <button class="page-btn" :disabled="currentPage === 1" @click="click">上一页</button>
            </template>

            <template #pageNext="{ click, pageCount }">
              <button class="page-btn" :disabled="currentPage === pageCount" @click="click">下一页</button>
            </template>
          </Pagination>

          <div class="status">
            <div>当前页：<code>{{ currentPage }}</code></div>
            <div>每页条数：<code>{{ pageSize }}</code></div>
          </div>
        </div>
      </section>
    </main>

    <codeContent />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import baseConfig from '../static/hooks/extends.js'
import Pagination from './components/index.vue'

defineOptions({
  extends: baseConfig({})
})

const paginationRef = ref(null);

const pageTotal = ref(200);
const pageSlot = ref(5);
const sizesStr = ref('10,20,30,50');
const orderPreset = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const jumpInput = ref(1);

const pageSizes = computed(() => {
  const arr = sizesStr.value.split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n) && n > 0);
  const uniq = Array.from(new Set(arr));
  return uniq.sort((a, b) => a - b);
});

const orderPresetsMap = [
  ['pages', 'size-picker', 'quick-jumper'],
  ['size-picker', 'pages', 'quick-jumper'],
  ['quick-jumper', 'pages', 'size-picker'],
];

const displayOrder = computed(() => orderPresetsMap[orderPreset.value] || orderPresetsMap[0]);

watch(pageTotal, (v) => {
  if (currentPage.value * pageSize.value > v) currentPage.value = Math.ceil(v / pageSize.value);
  if (currentPage.value * pageSize.value < 1) currentPage.value = 1;
});

watch(pageSizes, (list) => {
  if (!list.includes(pageSize.value) && list.length) {
    pageSize.value = list[0];
  }
});
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.app-container {
  background-color: $light-gray;
  padding: $spacing-md;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  .main-content {
    display: flex;
    gap: $spacing-lg;
    // height: calc(100vh - $spacing-md * 2);
    width: calc(100% - 2 * $spacing-md);

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

          .control-content {
            display: flex;
            align-items: center;
            gap: $spacing-xs;
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

          .text-input {
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

          .order-presets {
            display: flex;
            flex-direction: column;
            gap: $spacing-xs;

            button {
              @include button-shared;
              background-color: $light-gray;
              color: $dark-gray;
              text-align: left;

              &.active {
                border-color: $primary-color;
                color: $primary-color;
              }

              &:hover {
                background-color: $medium-gray;
              }
            }
          }

          .common-btn {
            @include button-shared;
            background-color: $light-gray;
            color: $dark-gray;
            text-align: left;

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
      width: calc(100% - $spacing-lg - 400px);
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
        background: white;
      }

      .status {
        display: flex;
        gap: $spacing-lg;
        color: $dark-gray;

        code {
          color: $primary-color;
        }
      }
    }
  }
}
</style>