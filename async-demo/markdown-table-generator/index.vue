<template>
  <div class="app-container">
    <div class="main-content">
      <div class="control-panel">
        <div class="header-actions">
          <div class="table-actions">
            <div class="table-actions-group">
              <button class="action-btn" @click="addRow" title="添加行">
                <span>+ 行</span>
              </button>
              <button class="action-btn" @click="addColumn" title="添加列">
                <span>+ 列</span>
              </button>
            </div>
            <div class="table-actions-group">
              <button class="action-btn" @click="removeRow" :disabled="rows <= 1" title="删除行">
                <span>- 行</span>
              </button>
              <button class="action-btn" @click="removeColumn" :disabled="columns <= 1" title="删除列">
                <span>- 列</span>
              </button>
            </div>
          </div>
        </div>

        <div class="table-properties">
          <div class="control-group">
            <div class="control-item">
              <div class="control-label">
                <span>行数({{ rows }})</span>
                <span class="value-display">{{ rows }}</span>

              </div>
              <input type="range" class="range-control" v-model.number="rows" min="1" max="10" />
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>列数({{ columns }})</span>
                <span class="value-display">{{ columns }}</span>
              </div>
              <input type="range" class="range-control" v-model.number="columns" min="1" max="10" />
            </div>
          </div>

          <div class="control-group">
            <div class="control-item checkbox-control">
              <label>
                <input type="checkbox" v-model="hasHeader" />
                <span>包含表头</span>
              </label>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h3>快速操作</h3>
          <div class="quick-action-buttons">
            <button class="action-btn" @click="resetTable" title="重置表格">
              重置
            </button>
            <button class="action-btn" @click="addSampleData" title="添加示例数据">
              添加示例数据
            </button>
          </div>
        </div>
      </div>

      <div class="preview-panel">
        <h2>预览</h2>

        <div class="preview-container">
          <div class="preview-table-wrapper">
            <div style="margin-bottom: 8px;" class="align-buttons">
              <span>整体表头对齐方式：</span>
              <button v-for="(item, index) in alignOptions" :value="item.value" :key="`align-${index}`"
                @click="toggleCellAlign(0, col - 1, item, true)" :class="{
                  'active': tableData[0].filter((cell) => cell.align === item.value).length === tableData[0].length
                }">
                {{ item.label }}
              </button>
            </div>
            <table class="preview-table">
              <thead v-if="hasHeader">
                <tr>
                  <td v-for="col in columns" :key="`header-${col}`" @click="selectCell(0, col - 1)"
                    :class="{ 'selected': selectedCell.row === 0 && selectedCell.col === col - 1 }">
                    <input type="text" v-model="tableData[0][col - 1].content" class="table-cell-input"
                      placeholder="表头 {{ col }}" />
                    <div class="align-buttons">
                      <button v-for="(item, index) in alignOptions" :value="item.value" :key="`align-${col}-${index}`"
                        @click="toggleCellAlign(0, col - 1, item, false)"
                        :class="{ 'active': tableData[0][col - 1].align === item.value }">
                        {{ item.label }}
                      </button>
                    </div>
                  </td>
                </tr>
              </thead>

              <tbody>
                <tr v-for="row in rows" :key="`row-${row}`">
                  <td v-for="col in columns" :key="`cell-${row}-${col}`" @click="selectCell(row, col - 1)"
                    :class="{ 'selected': selectedCell.row === row && selectedCell.col === col - 1 }">
                    <textarea v-model="tableData[row][col - 1].content" class="table-cell-input"
                      :placeholder="`单元格 ${row} - ${col}`" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="code-section">
          <div class="code-container">
            <pre><code>{{ generatedMarkdown }}</code></pre>
            <button class="copy-button" @click="copyToClipboard" :class="{ 'copied': copied }">
              {{ copied ? '已复制!' : '复制' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <codeContent />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig(),
})

const alignOptions = ref([
  {
    label: '左对齐',
    value: 'left'
  },
  {
    label: '居中对齐',
    value: 'center'
  },
  {
    label: '右对齐',
    value: 'right'
  }
]);

const rows = ref(3);
const columns = ref(3);
const hasHeader = ref(true);
const copied = ref(false);
const selectedCell = ref({ row: -1, col: -1 });

const tableData = ref([]);

const initializeTableData = () => {
  const data = [];

  data.push([]);
  for (let col = 0; col < columns.value; col++) {
    data[0].push({
      content: `表头 ${col + 1}`,
      align: 'center'
    });
  }

  for (let row = 1; row <= rows.value; row++) {
    data.push([]);
    for (let col = 0; col < columns.value; col++) {
      data[row].push({
        content: '',
        align: 'center'
      });
    }
  }

  tableData.value = data;
};

watch([rows, columns], () => {
  const newData = [...tableData.value];

  if (newData.length > rows.value + 1) {
    newData.splice(rows.value + 1);
  } else if (newData.length < rows.value + 1) {
    for (let row = newData.length; row <= rows.value; row++) {
      newData.push([]);
      for (let col = 0; col < columns.value; col++) {
        newData[row].push({
          content: '',
          align: 'center'
        });
      }
    }
  }

  for (let row = 0; row < newData.length; row++) {
    if (newData[row].length > columns.value) {
      newData[row].splice(columns.value);
    } else if (newData[row].length < columns.value) {
      for (let col = newData[row].length; col < columns.value; col++) {
        newData[row].push({
          content: row === 0 ? `表头 ${col + 1}` : '',
          align: 'center'
        });
      }
    }
  }

  tableData.value = newData;
});

const generatedMarkdown = computed(() => {
  if (!tableData.value || tableData.value.length < 2) return '';

  let markdown = '';
  let maxLengths = [];

  for (let col = 0; col < columns.value; col++) {
    let maxLength = 0;
    for (let row = 0; row <= rows.value; row++) {
      const content = tableData.value[row][col].content || '';
      maxLength = Math.max(maxLength, content.length);
    }
    maxLengths.push(maxLength);
  }

  if (hasHeader.value && tableData.value[0]) {
    markdown += '|';
    for (let col = 0; col < columns.value; col++) {
      const content = tableData.value[0][col].content || '';
      const align = tableData.value[0][col].align;
      const padding = ' '.repeat(maxLengths[col] - content.length);
      markdown += ` ${content}${padding} |`;
    }
    markdown += '\n';

    markdown += '|';
    for (let col = 0; col < columns.value; col++) {
      const align = tableData.value[0][col].align;
      let separator = '-'.repeat(maxLengths[col]);

      if (align === 'center') {
        separator = `:${separator.substring(1, separator.length - 1)}:`;
      } else if (align === 'right') {
        separator = ` ${separator.substring(1)}:`;
      } else {
        separator = `:${separator.substring(1)} `;
      }

      markdown += ` ${separator} |`;
    }
    markdown += '\n';
  }

  const startRow = hasHeader.value ? 1 : 0;
  for (let row = startRow; row <= rows.value; row++) {
    markdown += '|';
    for (let col = 0; col < columns.value; col++) {
      const content = tableData.value[row][col].content || '';
      const padding = ' '.repeat(maxLengths[col] - content.length);
      markdown += ` ${content}${padding} |`;
    }
    markdown += '\n';
  }

  return markdown.trim();
});

const toggleCellAlign = (row, col, aligns, autoAlign = false) => {
  console.log('toggleCellAlign', { row, col, aligns, autoAlign })

  if (autoAlign) {
    for (let c = 0; c < columns.value; c++) {
      tableData.value[0][c].align = aligns.value
    }
    return
  }

  if (!tableData.value[row] || !tableData.value[row][col]) return;
  tableData.value[row][col].align = aligns.value
};

const selectCell = (row, col) => {
  selectedCell.value = { row, col };
};

const addRow = () => {
  if (rows.value < 10) {
    rows.value++;
  }
};

const removeRow = () => {
  if (rows.value > 1) {
    rows.value--;
  }
};

const addColumn = () => {
  if (columns.value < 10) {
    columns.value++;
  }
};

const removeColumn = () => {
  if (columns.value > 1) {
    columns.value--;
  }
};

const resetTable = () => {
  rows.value = 3;
  columns.value = 3;
  hasHeader.value = true;
  initializeTableData();
};

const addSampleData = () => {
  rows.value = Math.max(rows.value, 3);
  columns.value = Math.max(columns.value, 3);

  for (let row = 0; row <= rows.value; row++) {
    for (let col = 0; col < columns.value; col++) {
      tableData.value[row][col].content = row === 0 ? `列 ${col + 1}` : `${row}-${col}`;
    }
  }
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(generatedMarkdown.value).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
};

initializeTableData();
</script>

<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.app-container {
  width: calc(100vw - $spacing-md * 2);
  background-color: $light-gray;
  padding: $spacing-md;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.main-content {
  display: flex;
  gap: $spacing-lg;
  height: calc(100vh - $spacing-md * 2);
  width: 1400px;
  margin: 0 auto;
}

.control-panel {
  @include control-shared;
  width: 350px;
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

    .table-actions {
      width: 100%;
      display: flex;
      gap: $spacing-sm;
      align-items: center;
      justify-content: space-between;

      .table-actions-group {
        display: flex;
        gap: $spacing-sm;
        align-items: center;
      }

      .action-btn {
        @include button-shared;
        background-color: $primary-color;
        color: white;
        gap: $spacing-xs;

        &:hover:not(:disabled) {
          background-color: darken($primary-color, 10%);
        }

        &:disabled {
          background-color: $medium-gray;
          cursor: not-allowed;
        }
      }
    }
  }

  .table-properties {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
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

  .quick-actions {
    @include control-shared;
    padding: $spacing-md;
    margin-top: $spacing-lg;

    h3 {
      margin: 0 0 $spacing-md 0;
      color: $dark-gray;
      font-size: 16px;
      font-weight: 600;
    }

    .quick-action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-sm;

      .action-btn {
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
  height: 100%;
  flex-shrink: 0;
  overflow: hidden;

  h2 {
    color: $dark-gray;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  .preview-container {
    width: calc(100% - $spacing-lg * 2);
    @include control-shared;
    padding: $spacing-lg;
    box-shadow: $shadow-light;
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
    overflow: hidden;
    flex: 1;
    flex-shrink: 0;

    .preview-table-wrapper {
      overflow-x: auto;
      padding: $spacing-sm;
      background-color: $light-gray;
      border-radius: $border-radius;

      .preview-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: $border-radius;
        overflow: hidden;

        thead {
          td {
            min-width: 180px;
          }
        }

        th,
        td {
          border: 1px solid $medium-gray;
          padding: 8px;
          position: relative;
          transition: all $transition-speed;

          &.selected {
            background-color: rgba(79, 70, 229, 0.05);
          }

          .table-cell-input {
            width: calc(100% - $spacing-xs * 2);
            padding: $spacing-xs;
            resize: none;
            max-height: 200px;
            border: 1px solid transparent;
            border-radius: $border-radius;
            font-size: 13px;
            transition: all $transition-speed;
            background: transparent;

            &:focus {
              outline: none;
              border-color: $primary-color;
              background: rgba(255, 255, 255, 0.8);
            }
          }
        }

        th {
          background-color: $light-gray;
          font-weight: 600;

          &:hover {
            background-color: rgba(79, 70, 229, 0.05);
          }
        }

        td {
          &:hover {
            background-color: rgba(79, 70, 229, 0.05);
          }
        }
      }

      .align-buttons {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        margin: $spacing-xs 0;

        button {
          @include button-shared;
          flex-shrink: 0;
          padding: 2px $spacing-sm;
          font-size: 12px;
          background-color: $light-gray;
          color: $dark-gray;
          border: 1px solid $medium-gray;
          border-radius: $border-radius;
          cursor: pointer;
          transition: all $transition-speed;

          &:hover {
            background-color: $primary-color;
            color: white;
            border-color: $primary-color;
          }

          &.active {
            background-color: $primary-color;
            color: white;
            border-color: $primary-color;
          }
        }
      }
    }
  }

  .code-section {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    flex: 1;
    flex-shrink: 0;

    .code-container {
      @include control-shared;
      position: relative;
      background: #1e293b;
      padding: $spacing-md;
      box-shadow: $shadow-light;
      height: 100%;

      pre {
        margin: 0;
        color: #e2e8f0;
        font-size: 14px;
        overflow-x: auto;
        line-height: 1.5;
        max-height: 300px;
        overflow-y: auto;
      }

      code {
        font-family: 'Consolas', 'Monaco', monospace;
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
</style>