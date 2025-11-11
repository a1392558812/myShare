<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>CSS Grid </h2>
          <div class="add-layer-wrap">
            <button class="add-layer-btn" @click="addItem(1, 1)"><span>+</span> 添加项目</button>
            <button class="add-layer-btn" @click="openDialog({
              overlayStyle: {
                zIndex: 1000,
              },
            })">查看源码</button>
          </div>
        </div>

        <div class="grid-controls">
          <div class="control-group">
            <div class="control-item">
              <div class="control-label">
                <span>容器宽度</span>
                <span class="value-display">{{ container.width }}px</span>
              </div>
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>容器高度</span>
                <span class="value-display">{{ container.height }}px</span>
              </div>
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>
                  背景色：<input type="color" v-model="container.background" class="color-picker" />
                </span>
                <span class="value-display">{{ container.background }}</span>
              </div>
            </div>

            <div class="control-item checkbox-control">
              <label>
                <input type="checkbox" v-model="showLines" />
                显示网格线
              </label>
            </div>
          </div>

          <div class="shadow-layer">
            <div class="layer-header">
              <h3>轨道设置</h3>
              <div class="layer-actions"></div>
            </div>

            <div class="control-group">
              <div class="control-item">
                <div class="control-label">
                  <span>列数</span>
                  <span class="value-display">{{ cols.count }}</span>
                </div>
                <input type="number" v-model.number="cols.count" min="1" max="12" step="1" class="number-control" />
              </div>
              <div class="control-item">
                <div class="control-label">
                  <span>列轨道大小</span>
                  <span class="value-display">{{ cols.size }}{{ cols.unit }}</span>
                </div>
                <div class="inline-inputs">
                  <input type="number" v-model.number="cols.size" min="1" max="1000" step="1" />
                  <select v-model="cols.unit">
                    <option value="fr">fr</option>
                    <option value="px">px</option>
                    <option value="%">%</option>
                  </select>
                </div>
              </div>
              <div class="control-item">
                <div class="control-label">
                  <span>自定义列模板（可选）</span>
                </div>
                <input type="text" v-model="cols.custom" placeholder="例如: 200px 1fr 2fr" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>行数</span>
                  <span class="value-display">{{ rows.count }}</span>
                </div>
                <input type="number" v-model.number="rows.count" min="1" max="12" step="1" class="number-control" />
              </div>
              <div class="control-item">
                <div class="control-label">
                  <span>行轨道大小</span>
                  <span class="value-display">{{ rows.size }}{{ rows.unit }}</span>
                </div>
                <div class="inline-inputs">
                  <input type="number" v-model.number="rows.size" min="1" max="1000" step="1" />
                  <select v-model="rows.unit">
                    <option value="fr">fr</option>
                    <option value="px">px</option>
                    <option value="%">%</option>
                  </select>
                </div>
              </div>
              <div class="control-item">
                <div class="control-label">
                  <span>自定义行模板（可选）</span>
                </div>
                <input type="text" v-model="rows.custom" placeholder="例如: 100px 1fr auto" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>行间距 row-gap</span>
                  <span class="value-display">{{ gaps.row }}px</span>
                </div>
                <input type="number" v-model.number="gaps.row" min="0" max="60" step="1" class="number-control" />
              </div>
              <div class="control-item">
                <div class="control-label">
                  <span>列间距 column-gap</span>
                  <span class="value-display">{{ gaps.col }}px</span>
                </div>
                <input type="number" v-model.number="gaps.col" min="0" max="60" step="1" class="number-control" />
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>grid-auto-flow</span>
                </div>
                <select v-model="autoFlow">
                  <option value="row">row</option>
                  <option value="column">column</option>
                  <option value="row dense">row dense</option>
                  <option value="column dense">column dense</option>
                </select>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>place-items</span>
                </div>
                <select v-model="placeItems">
                  <option value="start">start</option>
                  <option value="end">end</option>
                  <option value="center">center</option>
                  <option value="stretch">stretch</option>
                </select>
              </div>

              <div class="control-item">
                <div class="control-label">
                  <span>place-content</span>
                </div>
                <select v-model="placeContent">
                  <option value="start">start</option>
                  <option value="end">end</option>
                  <option value="center">center</option>
                  <option value="stretch">stretch</option>
                </select>
              </div>


            </div>
          </div>

          <div class="shadow-layer">
            <div class="layer-header">
              <h3>选择一个item设置</h3>
              <div class="layer-actions">
                <button class="action-btn" @click="removeItem(activeId)" :disabled="items.length <= 1">🗑️</button>
              </div>
            </div>

            <div class="control-group">
              <div class="control-item">
                <div class="control-label">
                  <span>选中项目</span>
                </div>
                <select v-model.number="activeId">
                  <option v-for="(item, idx) in items" :key="item.id" :value="item.id">
                    class: 【.item-{{ item.id }}】
                  </option>
                </select>
              </div>
              <div class="control-item">
                <div class="control-label">
                  <span>标签</span>
                </div>
                <input type="text" v-model="currentItem.label" />
              </div>
              <div class="control-item">
                <div class="control-label">
                  <span>背景色：<input type="color" v-model="currentItem.bg" class="color-picker" /></span>
                  <span class="value-display">{{ currentItem.bg }}</span>
                </div>
              </div>
              <div class="control-item">
                <div class="control-label">
                  <span>grid-column 起始</span>
                  <span class="value-display">{{ currentItem.colStart }}</span>
                </div>
                <input type="number" v-model.number="currentItem.colStart" :min="1" :max="cols.count" step="1"
                  class="number-control" />
              </div>
              <div class="control-item">
                <div class="control-label">
                  <span>grid-column 跨度</span>
                  <span class="value-display">{{ currentItem.colSpan }}</span>
                </div>
                <input type="number" v-model.number="currentItem.colSpan" :min="1"
                  :max="Math.max(1, cols.count - currentItem.colStart + 1)" step="1" class="number-control" />
              </div>
              <div class="control-item">
                <div class="control-label">
                  <span>grid-row 起始</span>
                  <span class="value-display">{{ currentItem.rowStart }}</span>
                </div>
                <input type="number" v-model.number="currentItem.rowStart" :min="1" :max="rows.count" step="1"
                  class="number-control" />
              </div>
              <div class="control-item">
                <div class="control-label">
                  <span>grid-row 跨度</span>
                  <span class="value-display">{{ currentItem.rowSpan }}</span>
                </div>
                <input type="number" v-model.number="currentItem.rowSpan" :min="1"
                  :max="Math.max(1, rows.count - currentItem.rowStart + 1)" step="1" class="number-control" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <h2>预览</h2>
        <div :style="{
          minWidth: `${container.width}px`,
        }" class="preview-container">
          <div class="grid-preview-content">
            <div class="grid-preview" :style="gridStyle">
              <div v-for="item in items" :key="item.id" class="grid-item"
                :class="{ 'active-layer': item.id === activeId }" :style="itemStyle(item)" @click="setActive(item.id)">
                <div>class: 【.item-{{ item.id }}】</div>
                <div>{{ item.label }}</div>
              </div>
            </div>
            <div class="grid-preview" :style="{
              ...gridStyle,
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              boxShadow: 'none',
              backgroundImage: 'none',
              background: 'transparent',
            }">
              <div v-for="(item, index) in rows.count * cols.count" :key="index" :style="{
                background: 'transparent',
                zIndex: 0,
              }" class="grid-item" @dblclick="onAddClick(index)">{{ index }}</div>
            </div>
          </div>
        </div>

        <div :style="{
          minWidth: `${container.width}px`,
        }" class="code-section">
          <h2>CSS 代码</h2>
          <div class="code-container">
            <pre><code>{{ cssCode }}</code></pre>
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
import { ref, computed } from 'vue';
import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const camelToKebab = (camelCaseStr) => {
  return camelCaseStr
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, '');
}

const copied = ref(false);

const container = ref({
  width: 1000,
  height: 500,
  background: '#ffffff'
});

const cols = ref({ count: 4, size: 1, unit: 'fr', custom: '' });
const rows = ref({ count: 3, size: 1, unit: 'fr', custom: '' });
const gaps = ref({ row: 12, col: 12 });
const autoFlow = ref('row');
const placeItems = ref('stretch');
const placeContent = ref('start');
const showLines = ref(true);

let uid = 1;
const items = ref([
  { id: uid++, label: 'Item 1', bg: '#fde68a', colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 1 },
  { id: uid++, label: 'Item 2', bg: '#a7f3d0', colStart: 3, colSpan: 2, rowStart: 1, rowSpan: 2 },
  { id: uid++, label: 'Item 3', bg: '#93c5fd', colStart: 1, colSpan: 1, rowStart: 2, rowSpan: 2 },
]);
const activeId = ref(items.value[0].id);

const currentItem = computed(() => {
  return items.value.find(i => i.id === activeId.value) || items.value[0]
});
const setActive = (id) => { activeId.value = id; };
const addItem = (colStart, rowStart) => {
  items.value.push({ id: uid++, label: `Item ${uid - 1}`, bg: '#e5e7eb', colStart, colSpan: 1, rowStart, rowSpan: 1 });
  activeId.value = items.value[items.value.length - 1].id;
};
const removeItem = (id) => {
  if (items.value.length <= 1) return;
  const idx = items.value.findIndex(i => i.id === id);
  if (idx >= 0) items.value.splice(idx, 1);
  activeId.value = items.value[0]?.id ?? 0;
};


const onAddClick = (index) => {
  const countTracks = (tpl) => {
    if (!tpl || typeof tpl !== 'string') return 0;
    let s = tpl.trim();
    let safety = 0;
    const re = /repeat\(\s*(\d+)\s*,\s*([^\)]+)\)/g;
    while (safety++ < 10 && re.test(s)) {
      s = s.replace(re, (_, n, inner) => {
        const times = Math.max(1, Number(n) || 1);
        const chunk = inner.trim().replace(/\s+/g, ' ');
        return new Array(times).fill(chunk).join(' ');
      });
    }
    return s.split(/\s+/).filter(Boolean).length;
  };
  const colCount = Math.max(1, countTracks(gridTemplateColumns.value));
  const rowCount = Math.max(1, countTracks(gridTemplateRows.value));

  const row = Math.ceil((index + 1) / colCount);
  const col = (index + 1) - (row - 1) * colCount;
  console.log('[onAddClick] grid tracks:', index, { rowCount, colCount }, { row, col });

  addItem(col, row);
};
const gridTemplateColumns = computed(() => cols.value.custom?.trim()
  ? cols.value.custom.trim()
  : `repeat(${cols.value.count}, ${cols.value.size}${cols.value.unit})`);

const gridTemplateRows = computed(() => rows.value.custom?.trim()
  ? rows.value.custom.trim()
  : `repeat(${rows.value.count}, ${rows.value.size}${rows.value.unit})`);

const gridStyle = computed(() => {
  const base = {
    display: 'grid',
    width: container.value.width + 'px',
    height: container.value.height + 'px',
    background: container.value.background,
    gridTemplateColumns: gridTemplateColumns.value,
    gridTemplateRows: gridTemplateRows.value,
    rowGap: gaps.value.row + 'px',
    columnGap: gaps.value.col + 'px',
    gridAutoFlow: autoFlow.value,
    placeItems: placeItems.value,
    placeContent: placeContent.value,
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    position: 'relative',
    overflow: 'hidden'
  };

  const computeTrackPx = (count, size, unit, containerSize, gap) => {
    const g = Number(gap) || 0;
    if (unit === 'px') return Math.max(1, Math.round(Number(size) || 0));
    if (unit === '%') return Math.max(1, Math.round(((Number(size) || 0) / 100) * containerSize));
    if (unit === 'fr') {
      const totalGap = Math.max(0, (count - 1) * g);
      const available = containerSize - totalGap;
      return Math.max(1, Math.floor(available / Math.max(1, count)));
    }
    return Math.max(1, Math.round(Number(size) || 0));
  };
  const computeStepPx = (trackPx, gapPx) => Math.max(2, Math.round(trackPx + (Number(gapPx) || 0)));

  if (showLines.value && !cols.value.custom && !rows.value.custom) {
    const trackX = computeTrackPx(
      Number(cols.value.count) || 1,
      Number(cols.value.size) || 0,
      cols.value.unit,
      container.value.width,
      Number(gaps.value.col) || 0
    );
    const trackY = computeTrackPx(
      Number(rows.value.count) || 1,
      Number(rows.value.size) || 0,
      rows.value.unit,
      container.value.height,
      Number(gaps.value.row) || 0
    );

    const stepX = computeStepPx(trackX, Number(gaps.value.col) || 0);
    const stepY = computeStepPx(trackY, Number(gaps.value.row) || 0);

    const lineColor = 'rgba(0,0,0,0.10)';
    const gapColor = 'rgba(0,0,0,0.06)';
    base.backgroundImage = `
      repeating-linear-gradient( /* 列边界线 */
        to right,
        ${lineColor} 0,
        ${lineColor} 1px,
        transparent 1px,
        transparent ${stepX}px
      ),
      repeating-linear-gradient( /* 行边界线 */
        to bottom,
        ${lineColor} 0,
        ${lineColor} 1px,
        transparent 1px,
        transparent ${stepY}px
      ),
      repeating-linear-gradient( /* 列 gap 区域着色 */
        to right,
        transparent 0,
        transparent ${trackX}px,
        ${gapColor} ${trackX}px,
        ${gapColor} ${trackX + (Number(gaps.value.col) || 0)}px
      ),
      repeating-linear-gradient( /* 行 gap 区域着色 */
        to bottom,
        transparent 0,
        transparent ${trackY}px,
        ${gapColor} ${trackY}px,
        ${gapColor} ${trackY + (Number(gaps.value.row) || 0)}px
      )`;
  } else if (showLines.value) {
    base.backgroundImage = 'none';
  } else {
    base.backgroundImage = 'none';
  }

  return base;
});

const itemStyle = (item) => ({
  gridColumn: `${item.colStart} / span ${item.colSpan}`,
  gridRow: `${item.rowStart} / span ${item.rowSpan}`,
  background: item.bg,
  borderRadius: '6px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  color: '#374151',
  border: '1px solid rgba(0,0,0,0.08)',
  zIndex: 1,
});

const cssCode = computed(() => {
  const itemCss = items.value.map((row) => {
    return `.item-${row.id} {\n${Object.keys(itemStyle(row)).map(key => {
      return `  ${camelToKebab(key)}: ${itemStyle(row)[key]};`
    }).join('\n')}\n}`
  }).join('\n')

  const containerCss = Object.keys(gridStyle.value).map(key => {
    const cssKey = camelToKebab(key)
    return `  ${cssKey}: ${gridStyle.value[key]};`
  }).join('\n')

  const cssStr = `.container {\n${containerCss}\n}\n${itemCss}`

  return cssStr
});

const onCopyClick = () => {
  navigator.clipboard.writeText(cssCode.value).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
};

</script>

<style lang="scss" scoped>
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

        .control-group {
          display: flex;
          flex-direction: column;
          gap: $spacing-md;

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

            .inline-inputs {
              display: flex;
              gap: $spacing-sm;
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
          }
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

        .grid-preview-content {
          width: calc(100% - 20px);
          margin: 10px;
          border-radius: $border-radius;
          position: relative;

          .grid-preview {
            .grid-item {
              @include control-shared;
              padding: $spacing-md;
              box-shadow: $shadow-light;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              border: 1px solid $medium-gray;

              &.active-layer {
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

        .code-container {
          @include control-shared;
          position: relative;
          box-shadow: $shadow-light;

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