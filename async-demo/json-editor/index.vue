<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>JSON 编辑器</h2>
          <div class="add-layer-wrap">
            <button class="add-layer-btn" @click="openDialog({ overlayStyle: { zIndex: 1000 } })">查看源码</button>
          </div>
        </div>

        <div class="grid-controls">
          <div class="shadow-layer">
            <div class="layer-header">
              <h3>数据源控制</h3>
              <div class="layer-actions"></div>
            </div>
            <div class="control-group">
              <div class="control-item">
                <div class="control-label">
                  <span>当前类型</span>
                  <span class="value-display">{{ Array.isArray(jsonEditorData) ? 'Array' : 'Object' }}</span>
                </div>
              </div>

              <div class="control-item">
                <div class="action-buttons">
                  <button class="action-btn" @click="setOriginJsonEditorDataToArray">修改为数组</button>
                  <button class="action-btn" @click="setOriginJsonEditorDataToObject">修改为对象</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <h2>预览</h2>
        <div class="code-section">
          <h2>JSON 数据</h2>
          <div class="code-container">
            <JsonEditor :editable="jsonEditable" :value="jsonEditorData" @edit="onDataEdit" @add="onDataAdd"
              @delete="onDataDelete" />

            <button class="edit-button" @click="jsonEditable = !jsonEditable">
              是否允许编辑：{{ jsonEditable ? '是✔' : '否❌' }}
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import JsonEditor from '../components/json-editor/index.vue'
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

const jsonEditable = ref(false)

const jsonEditorData = ref({
  key1: 'name',
  key2: undefined,
  key3: true,
  key4: [
    'aaaaa',
    {
      key5: 'bbbbb'
    },
    'cccccc',
    true
  ],
  key6: {
    key7: [],
    key8: {},
  },
})

const setOriginJsonEditorDataToArray = () => {
  jsonEditorData.value = [
    {
      key1: 'name',
      key2: undefined,
      key3: true,
      key4: [
        'aaaaa',
        {
          key5: 'bbbbb'
        },
        'cccccc',
        true
      ],
      key6: {
        key7: [],
        key8: {},
      },
    },
    window,
    {
      a: window.navigation
    },
    null,
    undefined,
    true,
    ['111', false, { key9: '999' }, [[], [], [],]]
  ]
}
const setOriginJsonEditorDataToObject = () => {
  jsonEditorData.value = {
    key1: 'name',
    key2: undefined,
    key3: true,
    key4: [
      'aaaaa',
      {
        key5: 'bbbbb'
      },
      'cccccc',
      true
    ],
    key6: {
      key7: [],
      key8: {},
    },
  }
}

setOriginJsonEditorDataToObject()

const getByPath = (root, path = []) => {
  return path.reduce((acc, seg) => (acc ? acc[seg] : undefined), root)
}

const setByPath = (root, path = [], value) => {
  if (!Array.isArray(path)) return
  if (path.length === 0) {
    jsonEditorData.value = value
    return
  }
  const parent = getByPath(root, path.slice(0, -1))
  const last = path[path.length - 1]
  if (Array.isArray(parent)) {
    parent[last] = value
  } else if (parent && typeof parent === 'object') {
    parent[last] = value
  }
}

const onDataEdit = ({ path, oldValue, newValue }) => {
  setByPath(jsonEditorData.value, path, newValue)
  toastFun.open({
    message: `data 编辑: path:[${path.join(',')}] 从 ${oldValue} 变更为 ${newValue}`,
    contentStyle: toastContentStyle,
  })
  console.log('onDataEdit', jsonEditorData.value, { path, oldValue, newValue })
}


const onDataAdd = (payload) => {
  const { path = [], key, value } = payload || {}
  const target = getByPath(jsonEditorData.value, path)
  if (Array.isArray(target)) {
    target.push(value ?? undefined)
  } else if (target && typeof target === 'object') {
    target[key] = value ?? undefined
  }
  toastFun.open({
    message: `data 新增: path:[${path.join(',')}] ${key !== undefined ? `key:${key}` : ''} value:${value ?? null}`,
    contentStyle: toastContentStyle,
  })
  console.log('onDataAdd', jsonEditorData.value, { payload })
}

const onDataDelete = (payload) => {
  const { path = [], key, index } = payload || {}
  const target = getByPath(jsonEditorData.value, path)
  if (Array.isArray(target)) {
    if (typeof index === 'number') target.splice(index, 1)
  } else if (target && typeof target === 'object') {
    if (key !== undefined) delete target[key]
  }
  toastFun.open({
    message: `data 删除: path:[${path.join(',')}] ${key !== undefined ? `key:${key}` : ''} ${index !== undefined ? `index:${index}` : ''}`,
    contentStyle: toastContentStyle,
  })
  console.log('onDataDelete', jsonEditorData.value, { payload })
}
</script>
<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.app-container {
  height: calc(100vh - $spacing-md * 2);
  background-color: $light-gray;
  padding: $spacing-md;

  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.main-content {
  width: 1400px;
  margin: 0 auto;
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

        .edit-button {
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