# useSyncPropRef

同步props修改，兼容vue2语法，是vue3.4的宏`defindModel`的兼容版

```javascript
// 声明 "modelValue" prop，由父组件通过 v-model 使用
const model = defineModel()
// 或者：声明带选项的 "modelValue" prop
const model = defineModel({ type: String })

// 在被修改时，触发 "update:modelValue" 事件
model.value = "hello"

// 声明 "count" prop，由父组件通过 v-model:count 使用
const count = defineModel("count")
// 或者：声明带选项的 "count" prop
const count = defineModel("count", { type: Number, default: 0 })

function inc() {
  // 在被修改时，触发 "update:count" 事件
  count.value++
}
```

```javascript
const [modelValue, modelModifiers] = defineModel({
  // get() 省略了，因为这里不需要它
  set(value) {
    // 如果使用了 .trim 修饰符，则返回裁剪过后的值
    if (modelModifiers.trim) {
      return value.trim()
    }
    // 否则，原样返回
    return value
  }
})
```

原理是利用一个中间ref变量`b`桥梁，建立父组件props中的变量`a`与子组件中变量`c`的关系

但这里建议在功能组件封装时才使用，平常业务开发还是建议写`emit('update:xxx', value)`，注明留痕数据来源与流向

## 示例

```javascript
// 声明hook
const height = useSyncPropRef(
    () => +props.height,
    (value) => emit('update:height', value),
);

// .........

height.value = '666px'
```