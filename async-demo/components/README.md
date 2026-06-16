# Components 组件库

本目录收录了 `async-demo` 项目的公共 UI 组件，基于 **Vue 3** 开发，支持 JSX / `<script setup>` 两种写法。

---

## 目录结构

```
components/
├── color-picker/     # RGBA 颜色选择器（纯 JS 渲染函数）
├── dialog/           # 可拖拽对话框
├── form-control/     # 表单控件集合（输入框/下拉/按钮/布局等）
├── input-btn/        # 输入框 + 按钮组合控件
├── json-editor/      # 可交互 JSON 树形编辑器
└── toast/            # 轻量级消息提示（组件 + 全局工具函数）
```

---

## 组件说明

### 1. ColorPicker — 颜色选择器

**路径：** `color-picker/index.js`

支持 RGBA 颜色选取，提供颜色预览、透明度调节和一键复制 RGBA 字符串功能。内置多个颜色格式转换工具函数。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `String` | `'rgba(0, 0, 0, 1)'` | 当前颜色值（RGBA 格式） |
| `tipsStyle` | `Object` | `{}` | 颜色面板弹出层的自定义样式 |

#### Emits

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `rgba: String` | 颜色变更时触发，返回 `rgba(r, g, b, a)` 字符串 |

#### 导出工具函数

| 函数 | 签名 | 说明 |
|------|------|------|
| `hexToRgba` | `(hex, alpha?) => string` | HEX 转 RGBA 字符串 |
| `rgbaToHex` | `(rgba, digit?) => string` | RGBA 转 HEX（`digit` 为 6 或 8） |
| `parseRgba` | `(rgbaStr) => {r,g,b,a}` | 解析 RGBA 字符串为对象 |
| `createRgba` | `(r,g,b,a) => string` | 组合 RGBA 字符串 |
| `colorPicker` | — | 组件对象，可直接注册为 Vue 组件 |

#### 使用示例

```vue
<script setup>
import { ref } from 'vue'
import { colorPicker } from '@/components/color-picker/index.js'
const color = ref('rgba(255, 0, 0, 1)')
</script>

<template>
  <component :is="colorPicker" v-model="color" />
  <span>当前颜色：{{ color }}</span>
</template>
```

---

### 2. Dialog — 可拖拽对话框

**路径：** `dialog/index.vue`

全屏遮罩对话框，支持标题栏拖拽移动、ESC 关闭、插槽自定义内容，以及取消/确认回调的完全自定义。

#### 通过 `defineExpose` 暴露的方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `showDialog` | `(options?) => void` | 打开对话框 |
| `hideDialog` | `(options?) => void` | 关闭对话框 |

#### `showDialog(options)` 参数

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `String` | `'提示'` | 对话框标题 |
| `overlayStyle` | `Object` | `{}` | 遮罩层自定义样式 |
| `containerStyle` | `Object` | `{}` | 容器自定义样式 |
| `containerHeaderStyle` | `Object` | `{}` | 标题栏自定义样式 |
| `containerContentStyle` | `Object` | `{}` | 内容区自定义样式 |
| `containerFooterStyle` | `Object` | `{}` | 底部区自定义样式 |
| `containerFooterBtnStyle` | `Object` | `{}` | 底部按钮公共样式 |
| `containerFooterCancelBtnStyle` | `Object` | `{}` | 取消按钮样式 |
| `containerFooterConfirmBtnStyle` | `Object` | `{}` | 确认按钮样式 |
| `close` | `Function` | 关闭弹窗 | 点击取消/关闭按钮时的回调 |
| `confirm` | `Function` | 关闭弹窗 | 点击确认按钮时的回调 |

#### 插槽

| 插槽名 | 说明 |
|--------|------|
| `default` | 对话框主体内容 |

#### 使用示例

```vue
<script setup>
import { ref } from 'vue'
import Dialog from '@/components/dialog/index.vue'

const dialogRef = ref(null)

const openDialog = () => {
  dialogRef.value.showDialog({
    title: '确认操作',
    confirm: () => {
      console.log('用户确认了')
      dialogRef.value.hideDialog()
    }
  })
}
</script>

<template>
  <Dialog ref="dialogRef">
    <p>这里是对话框内容</p>
  </Dialog>
  <button @click="openDialog">打开对话框</button>
</template>
```

---

### 3. FormControl — 表单控件集合

**路径：** `form-control/index.vue`

以默认导出对象的形式提供一组表单 UI 子组件，适合配合控制面板或参数调节场景使用。

#### 导出子组件一览

| 组件名 | 说明 |
|--------|------|
| `inputCom` | 基础输入框（text / number / range / checkbox / color） |
| `selectCom` | 下拉选择器，支持可选的 Label 覆盖显示 |
| `customBtnCom` | 带内嵌输入的按钮，支持点击时读取输入值 |
| `controlItem` | 标签 + 输入控件的组合行，自动显示当前值 |
| `codeCopyContent` | 带复制按钮的代码展示块 |
| `layoutCom` | 区块布局容器（预览区 / 控制面板区） |
| `appContainer` | 顶层页面容器，含主区域和页脚插槽 |
| `useCopyCode` | Composable：提供复制代码状态与点击处理函数 |

#### `inputCom` Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `Number\|Boolean\|String` | `0` | 绑定值 |
| `type` | `String` | `'text'` | 输入类型：`text` / `number` / `range` / `checkbox` / `color` |
| `min` | `Number` | — | 最小值（number/range） |
| `max` | `Number` | — | 最大值（number/range） |
| `step` | `Number` | `1` | 步进值（number/range） |
| `placeholder` | `String` | `''` | 占位文本 |
| `disabled` | `Boolean` | `false` | 是否禁用 |

#### `selectCom` Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `String\|Number` | `''` | 当前选中值 |
| `options` | `Array` | `[]` | 选项列表 `[{ value, label }]` |
| `ifShowLabel` | `Boolean` | `false` | 是否在原生 select 上叠加样式按钮 |
| `currentLabel` | `String` | `''` | 覆盖显示的标签文本 |
| `placeholder` | `String` | `''` | 占位文本 |
| `disabled` | `Boolean` | `false` | 是否禁用 |

#### `controlItem` Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `String` | `''` | 左侧标签文本 |
| `labelValue` | `String\|Number` | `''` | 右侧展示值（覆盖 modelValue 显示） |
| `modelValue` | `String\|Number\|Boolean` | `''` | 绑定值 |
| `inputType` | `String` | `''` | 内嵌 inputCom 的 type |
| `slotProps` | `Object` | `{}` | 透传给 inputCom 的额外 props |
| `disabled` | `Boolean` | `false` | 是否禁用 |

#### `layoutCom` Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `String` | `''` | 区块标题 |
| `titleLevel` | `Number` | `2` | 标题级别 h2/h3/h4 |
| `type` | `String` | `'preview'` | 布局类型：`preview`（预览区）/ `panel`（控制面板） |
| `addLayerBtnList` | `Array` | `[]` | 标题右侧按钮列表 `[{ label, callback }]` |

#### `codeCopyContent` Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `code` | `String` | `''` | 要展示的代码字符串 |
| `title` | `String` | `'示例'` | 代码块标题 |

#### 使用示例

```vue
<script setup>
import { ref } from 'vue'
import FormControl from '@/components/form-control/index.vue'

const { inputCom, selectCom, controlItem, layoutCom } = FormControl

const size = ref(16)
const mode = ref('linear')
</script>

<template>
  <layoutCom title="参数设置" type="panel">
    <controlItem label="尺寸" :modelValue="size" inputType="range"
      :slotProps="{ min: 1, max: 100, step: 1 }"
      @update:modelValue="size = $event" />

    <controlItem label="模式">
      <selectCom v-model="mode" :options="[
        { value: 'linear', label: '线性' },
        { value: 'radial', label: '径向' }
      ]" :ifShowLabel="true" />
    </controlItem>
  </layoutCom>
</template>
```

---

### 4. InputBtn — 输入框 + 按钮组合

**路径：** `input-btn/index.vue`

将输入框与确认按钮封装为一体，支持所有原生 input 类型，对 `color` 类型提供 RGBA 颜色选择的专属 UI（颜色块 + 透明度输入），仅在点击按钮时才通过 `update:modelValue` 提交最终值。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `String\|Number\|Boolean` | `''` | 绑定值 |
| `type` | `String` | `'text'` | input 类型（text/number/range/color/file 等） |
| `btnText` | `String` | `'确定'` | 按钮文本 |
| `min` | `Number` | — | 最小值 |
| `max` | `Number` | — | 最大值 |
| `step` | `Number` | — | 步进值 |
| `accept` | `String` | — | 文件类型限制（`type="file"` 时使用） |
| `placeholder` | `String` | `''` | 占位文本 |
| `inputStyle` | `Object` | `{}` | 输入框自定义样式 |
| `inputAlphaStyle` | `Object` | `{}` | 透明度输入框样式（颜色模式） |
| `btnStyle` | `Object` | `{}` | 按钮自定义样式 |
| `inputValueStyle` | `Object` | `{}` | range 当前值标签样式 |
| `colorWrapStyle` | `Object` | `{}` | 颜色选择容器样式 |

#### Emits

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | 当前输入值 | 仅点击按钮时触发 |

#### 使用示例

```vue
<script setup>
import { ref } from 'vue'
import InputBtn from '@/components/input-btn/index.vue'

const textVal = ref('hello')
const numVal = ref(50)
const colorVal = ref('rgba(255,100,0,1)')
</script>

<template>
  <!-- 文本输入 -->
  <InputBtn v-model="textVal" type="text" btnText="提交" />

  <!-- 数字范围滑块 -->
  <InputBtn v-model="numVal" type="range" :min="0" :max="100" btnText="应用" />

  <!-- 颜色选择（支持透明度） -->
  <InputBtn v-model="colorVal" type="color" btnText="确认颜色" />
</template>
```

---

### 5. JsonEditor — JSON 树形编辑器

**路径：** `json-editor/index.vue`

以树形结构可视化并交互式编辑任意 JSON 数据，支持对象/数组/基本类型的增删改键名及类型切换，递归渲染子节点，并通过事件向外传递最小化的变更路径。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `any` | `undefined` | 要渲染/编辑的数据 |
| `editable` | `Boolean` | `true` | 是否允许编辑（false 时只读展示） |
| `collapsible` | `Boolean` | `true` | 是否显示折叠/展开按钮 |
| `defaultCollapsed` | `Boolean` | `false` | 是否默认折叠 |
| `valueKey` | `String` | `''` | 当前节点的键名（由父组件传入，供嵌套使用） |
| `fatherKey` | `String` | `'-1'` | 父节点唯一标识，用于列表 key（内部使用） |
| `path` | `Array` | `[]` | 当前节点在数据树中的路径（内部递归使用） |

#### Emits

| 事件 | 参数 | 说明 |
|------|------|------|
| `edit` | `{ path, oldValue, newValue }` | 值/键名/类型被修改时触发 |
| `add` | `{ path, key?, value }` | 新增键或数组项时触发 |
| `delete` | `{ path, key? / index? }` | 删除键或数组项时触发 |

> **注意：** 组件本身不直接修改传入的 `value`，所有变更通过事件向上传递，由父组件负责更新数据。

#### 使用示例

```vue
<script setup>
import { ref } from 'vue'
import JsonEditor from '@/components/json-editor/index.vue'

const data = ref({
  name: 'Alice',
  age: 25,
  tags: ['vue', 'canvas'],
  config: { debug: false }
})

const onEdit = ({ path, newValue }) => {
  // 根据 path 路径更新 data
  let target = data.value
  for (let i = 0; i < path.length - 1; i++) {
    target = target[path[i]]
  }
  target[path[path.length - 1]] = newValue
}

const onAdd = ({ path, key, value }) => {
  let target = data.value
  for (const p of path) target = target[p]
  if (key !== undefined) target[key] = value
  else target.push(value)
}

const onDelete = ({ path, key, index }) => {
  let target = data.value
  for (const p of path) target = target[p]
  if (key !== undefined) delete target[key]
  else target.splice(index, 1)
}
</script>

<template>
  <JsonEditor
    :value="data"
    :editable="true"
    :collapsible="true"
    :defaultCollapsed="false"
    @edit="onEdit"
    @add="onAdd"
    @delete="onDelete"
  />
</template>
```

---

### 6. Toast — 消息提示

**路径：** `toast/index.vue` + `toast/index.js`

轻量级顶部消息提示，支持自动关闭、自定义样式及内容插槽。提供两种使用方式：**组件方式** 和 **全局工具函数方式**。

#### 通过 `defineExpose` 暴露的方法

| 方法 | 说明 |
|------|------|
| `open(options)` | 显示 Toast |
| `close()` | 手动关闭 Toast |

#### `open(options)` 参数

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `message` | `String` | `''` | 提示文本 |
| `title` | `String` | `''` | 标题（可选） |
| `type` | `String` | `'info'` | 类型：`info` / `success` / `error` / `warning`（用于自定义样式扩展） |
| `duration` | `Number` | `2500` | 自动关闭延迟（ms） |
| `autoClose` | `Boolean` | `true` | 是否自动关闭 |
| `onClose` | `Function` | `null` | 关闭后回调 |
| `style` | `Object` | `{ top: '20px' }` | Toast 容器样式（可调整位置） |
| `contentStyle` | `Object` | `{}` | 消息内容区样式 |
| `contentSlot` | `Function` | `''` | 自定义渲染函数，返回 VNode（优先级高于 message） |

#### 方式一：组件方式

```vue
<script setup>
import { ref } from 'vue'
import Toast from '@/components/toast/index.vue'

const toastRef = ref(null)
const showToast = () => {
  toastRef.value.open({ message: '操作成功！', duration: 3000 })
}
</script>

<template>
  <Toast ref="toastRef" />
  <button @click="showToast">显示提示</button>
</template>
```

#### 方式二：全局工具函数（推荐）

无需在模板中注册组件，会自动挂载到 `document.body`，关闭后自动销毁。

```js
import { toastFun } from '@/components/toast/index.js'

// 基础用法
toastFun.open({ message: '保存成功', duration: 2000 })

// 带标题
toastFun.open({ title: '提示', message: '请先登录', autoClose: false })

// 自定义内容 VNode
toastFun.open({
  contentSlot: () => h('span', { style: 'color:red' }, '自定义内容'),
  duration: 3000
})

// 手动关闭
toastFun.close()
```

---

## 依赖说明

所有组件依赖 **Vue 3**，样式依赖项目根目录下的 `static/scss/theme.scss` 主题变量文件（`$primary-color`、`$spacing-*`、`$border-radius` 等 SCSS 变量）。

---

## 注意事项

- `json-editor` 为受控组件，不自行修改数据，请在 `@edit` / `@add` / `@delete` 事件中自行更新数据源。
- `input-btn` 的 `update:modelValue` 仅在点击按钮时触发，不会在输入过程中实时触发。
- `toast/index.js` 的全局工具函数为单例模式，同一时刻只显示一个 Toast。
- `color-picker/index.js` 使用 Vue `h` 函数渲染，注册时需作为组件对象使用（见示例）。
