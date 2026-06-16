<template>
  <div>
    <div>
      <button @click="mode = 'draw'">绘制模式</button>
      <button @click="mode = 'play'">播放模式</button>
      <button @click="mode = 'parsing'">解析模式</button>
      <button @click="mode = 'inputBtn'">输入按钮</button>
    </div>
    <drawCanvas v-if="mode === 'draw'" />
    <playCanvas v-else-if="mode === 'play'" />
    <parsingCanvas v-else-if="mode === 'parsing'" />
    <test v-else-if="mode === 'inputBtn'" />
  </div>

</template>
<script setup>
import { ref } from "vue";
import drawCanvas from "./components/draw-canvas.vue";
import playCanvas from "./components/play-canvas.vue";
import parsingCanvas from "./components/parsing-canvas.vue";
import test from "./components/test.vue";

const mode = ref('draw') // draw play parsing test
</script>