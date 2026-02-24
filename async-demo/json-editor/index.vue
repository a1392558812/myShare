<template>
  <div class="">
    <!-- 使用参考的布局组件 -->
    <app-container>
      <layout-com style="width: calc(500px - 24px); flex-shrink: 0;" title="JSON 编辑器" type="panel" :addLayerBtnList="[
        { label: '查看源码', callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }) }
      ]">
        <div style="display: flex; flex-direction: column; gap: 0.5em;">
          <custom-btn-com @click="() => { jsonEditable = !jsonEditable }">
            是否允许编辑：{{ jsonEditable ? '是✔' : '否❌' }}
          </custom-btn-com>
          <custom-btn-com @click="setOriginJsonEditorDataToArray">修改为测试数组</custom-btn-com>
          <custom-btn-com @click="setOriginJsonEditorDataToObject">修改为测试对象</custom-btn-com>
          <custom-btn-com @click="toggleCustomInput">自定义输入</custom-btn-com>
        </div>

        <!-- 自定义输入区域 -->
        <div v-if="showCustomInput" class="custom-input-section">
          <p style="margin-bottom: 10px; color: #666;">请输入有效的 JSON 数据：</p>
          <textarea v-model="customJsonInput" placeholder="输入 JSON 数据..."></textarea>
          <div style="margin: 10px 0; color: #ff4d4f; font-size: 12px; min-height: 20px;">{{ jsonError }}</div>
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px;">
            <custom-btn-com @click="cancelCustomInput">取消</custom-btn-com>
            <custom-btn-com @click="confirmCustomInput" style="background-color: #1890ff; color: white;">
              确认
            </custom-btn-com>
          </div>
        </div>
      </layout-com>

      <layout-com style="width: calc(100% - 500px - 24px); flex-shrink: 0;" title="预览" type="preview">
        <template #preview>
          <JsonEditor :editable="jsonEditable" :value="jsonEditorData" @edit="onDataEdit" @add="onDataAdd"
            @delete="onDataDelete" />
        </template>
      </layout-com>
    </app-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import JsonEditor from '../components/json-editor/index.vue'
import baseConfig, { toastFun } from '../static/hooks/extends.js'
import {
  inputCom,
  selectCom,
  customBtnCom,
  controlItem,
  codeCopyContent,
  layoutCom,
  appContainer
} from '../components/form-control/index.vue'

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
const showCustomInput = ref(false)
const customJsonInput = ref('')
const jsonError = ref('')

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

const toggleCustomInput = () => {
  showCustomInput.value = !showCustomInput.value
  if (showCustomInput.value) {
    // 打开时填充当前JSON数据
    customJsonInput.value = JSON.stringify(jsonEditorData.value, null, 2)
    jsonError.value = ''
  }
}

const cancelCustomInput = () => {
  showCustomInput.value = false
  customJsonInput.value = ''
  jsonError.value = ''
}

const confirmCustomInput = () => {
  const jsonStr = customJsonInput.value.trim()

  if (!jsonStr) {
    jsonError.value = '请输入 JSON 数据'
    return
  }

  try {
    const parsedJson = JSON.parse(jsonStr)
    jsonEditorData.value = parsedJson
    jsonError.value = ''

    toastFun.open({
      message: 'JSON 数据更新成功！',
      contentStyle: toastContentStyle,
    })

    console.log('Custom JSON input:', parsedJson)
  } catch (error) {
    jsonError.value = `JSON 格式错误: ${error.message}`
  }
}
</script>
<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

textarea {
  width: calc(100% - 10px * 2);
  height: 200px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}
</style>