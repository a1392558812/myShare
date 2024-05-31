# 测试文件

## 自定义拓展语法

* **vue3-sfc闭合标签确定解析的代码块区域，包裹vue3-file标签**
* **vue3-file闭合标签确定每一个vue的sfc文件，`name=xxx.vue`属性来确定文件名，这里需要注意`app.vue`文件为必须，除`app.vue`外其他的`name=xxx.vue`敏感大小写**
* **将vue3单文件代码写到vue3-file闭合标签内部即可**
* **目前不支持自定义的自闭合标签解析，如`<my-component/>`，需写为`<my-component></my-component>`**

#### 演示 👇👇👇👇

## markdown展示vue3代码块

22222
<vue3-sfc>
<vue3-file name="test.vue">
<template>
    <div @click="value = getValue()">click change me : {{ value }}</div>
</template>
<script setup>
import { ref } from 'vue'
const getValue = () => (new Date()).getTime()
const value = ref(getValue())
</script>
</vue3-file>

<vue3-file name="App.vue">
<template>
    <div class="block" @click="value++">click add me : {{ value }}</div>
    <test></test>
</template>
<script setup>
import { ref } from 'vue'
import test from './test.vue'
const value = ref(0)
</script>
<style scoped>
.block {
    color: red;
}
</style>
</vue3-file>

</vue3-sfc>333


```js 
var a = 6
```

`asd`

```html
<div class="wrapper">
    <input id="exp1" class="exp"  type="checkbox" />
    <div class="text">
        <label class="btn" for="exp1"></label>
        <div>
        在下面的图片中，有三个红色的正方形。其中有两个向左浮动，一个向右浮动。要注意到第二个向左浮动的正方形被放在第一个向左浮动的正方形的右边。如果还有更多的正方形这样浮动，它们会继续向右堆放，直到填满容器一整行，之后换行至下一行。</div>
    </div>
</div>
```



111223


<div></div>

## testtest7

* 在我的后园，可以看见墙外有两株树，一株是枣树，还有一株也是枣树。
## testtest

[img_0]: 123123