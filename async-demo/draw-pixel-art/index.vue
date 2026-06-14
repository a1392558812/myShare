<template>
  <div>
    <div>
      <button @click="mode = 'draw'">绘制模式</button>
      <button @click="mode = 'play'">播放模式</button>
    </div>
    <drawCanvas v-if="mode === 'draw'"/>
    <playCanvas v-else-if="mode === 'play'"/>
  </div>
  
</template>
<script setup>
import { ref } from "vue";
import drawCanvas from "./components/draw-canvas.vue";
import playCanvas from "./components/play-canvas.vue";

const mode = ref('draw') // draw play
</script>