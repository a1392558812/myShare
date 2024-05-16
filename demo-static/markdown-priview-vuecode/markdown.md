# 测试文件

## 自定义拓展语法

* **vue3-sfc闭合标签确定解析的代码块区域，包裹vue3-file标签**
* **vue3-file闭合标签确定每一个vue的sfc文件，`name=xxx.vue`属性来确定文件名，这里需要注意`app.vue`文件为必须**
* **将vue3单文件代码写到vue3-file闭合标签内部即可**

#### 演示 👇👇👇👇

## markdown展示vue3代码块

我就问你9527
<vue3-sfc>
<vue3-file name="app.vue">
    <template>
        <div class="test">
            <test1 style="margin-bottom: 10px"></test1>
            <test2 style="margin-bottom: 10px"></test2>
            <div style="background: yellow; border: 1px solid #eee">{{ msg }}</div>
            <div style="background: skyblue; border: 1px solid #eee" @click="count = count + 1.1">(点击自增<span>{{ count }}</span>次)</div>
        </div>
    </template>
    <script setup lang="ts">
        import { ref } from "vue"
        import type { Ref } from "vue"
        import test1 from "./test1.vue"
        import test2 from "./test2.vue"
        const count:Ref<number> = ref(1)
        const msg = ref("🥵测试markdown")
    </script>
    <style>
        .test {
            color: red;
        }
    </style>
</vue3-file>222-test字符串
  
  111-test字符串
<vue3-file name="test1.vue">
    <template>
        <div
            class="resizable-component"
            :ref="(el) => slotDomData.wrapRef = el"
            :style="{
                width: slotDomData.componentWidth + 'px',
                height: slotDomData.componentHeight + 'px'
            }">
            <span style="font-size: 12px">自由拖拽改变宽高</span>
            <div
                class="draggable-handle"
                ref="handle"
                @mousedown="startDragging"
                @touchstart="startDragging"
            ></div>
        </div>
    </template>
    <script setup>
        import { ref } from 'vue'
            const slotDomData = ref({
            wrapRef: null,
            isDragging: false,
            startX: 0,
            startY: 0,
            startWidth: 0,
            startHeight: 0,
            componentWidth: 200,
            componentHeight: 200
        })
        const startDragging = (event) => {
            event.preventDefault();
            slotDomData.value.isDragging = true;
            slotDomData.value.startX = event.clientX || event.touches[0].clientX;
            slotDomData.value.startY = event.clientY || event.touches[0].clientY;
            console.log('slotDomData.value.wrapRef', slotDomData.value.wrapRef)
            slotDomData.value.startWidth = slotDomData.value.wrapRef.offsetWidth;
            slotDomData.value.startHeight = slotDomData.value.wrapRef.offsetHeight;
            document.addEventListener('mousemove', handleDragging);
            document.addEventListener('touchmove', handleDragging);
            document.addEventListener('mouseup', stopDragging);
            document.addEventListener('touchend', stopDragging);
        }
        const handleDragging = (event) => {
            if (!slotDomData.value.isDragging) return;
            const deltaX = (event.clientX || event.touches[0].clientX) - slotDomData.value.startX;
            const deltaY = (event.clientY || event.touches[0].clientY) - slotDomData.value.startY;
            slotDomData.value.componentWidth = Math.max(50, slotDomData.value.startWidth + deltaX);
            slotDomData.value.componentHeight = Math.max(50, slotDomData.value.startHeight + deltaY);
        }
        const stopDragging = (event) => {
            slotDomData.value.isDragging = false;
            document.removeEventListener('mousemove', handleDragging);
            document.removeEventListener('touchmove', handleDragging);
            document.removeEventListener('mouseup', stopDragging);
            document.removeEventListener('touchend', stopDragging);
        }
    </script>
    <style scoped>
        .resizable-component {
            position: relative;
            border: 1px solid #ccc;
            overflow: hidden;
        }
        .draggable-handle {
            position: absolute;
            width: 10px;
            height: 10px;
            bottom: 0;
            right: 0;
            background-color: #3498db;
            color: #fff;
            cursor: pointer;
            user-select: none;
        }
    </style>
  </vue3-file>?



  <vue3-file name="test2.vue">
    <template>
        <div style="background: pink; border: 1px solid #eee">这个是test2组件</div>
    </template>
  </vue3-file>
</vue3-sfc>111

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