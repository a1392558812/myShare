<template>
  <div ref="gameContainerRef" class="draw-game-units" :style="{ width: width + 'px', height: height + 'px' }">
    <canvas ref="canvasRef" :style="{ width: width + 'px', height: height + 'px' }" id="gameCanvas" width="100%"
      height="100%" @click="handleCanvasClick"></canvas>
    <slot></slot>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { frameRateManager } from "../frame-rate.js";

const emit = defineEmits(['drawFrame', 'canvasMounted', 'canvasClick', 'canvasDestroyed'])

const props = defineProps({
  width: {
    type: Number,
    default: 1200,
  },
  height: {
    type: Number,
    default: 675,
  },
});

const canvasFrame = ref(0);
const canvasRef = ref(null);
const canvasRect = ref(null);

// 点击画布选择单位
const handleCanvasClick = (e) => {
  emit('canvasClick', { e, canvasRect: canvasRect.value })
};

// 绘制回调
const drawFrame = (deltaTime) => {
  const ctx = canvasRef.value?.getContext("2d");
  if (!ctx) return;
  canvasFrame.value += deltaTime * 0.01;

  // 清空画布
  ctx.clearRect(0, 0, props.width, props.height);

  emit('drawFrame', { ctx, deltaTime, canvasFrame: canvasFrame.value, canvasRect: canvasRect.value })
};

onMounted(() => {
  canvasRef.value.width = props.width;
  canvasRef.value.height = props.height;
  canvasRect.value = canvasRef.value.getBoundingClientRect();

  // 注册绘制回调
  frameRateManager.register(drawFrame);

  // 设置帧率
  frameRateManager.setFPS(60);

  // 启动动画
  frameRateManager.start();
  emit('canvasMounted', { canvasRect: canvasRect.value })
});

onUnmounted(() => {
  // 停止动画
  frameRateManager.stop();

  // 移除回调
  frameRateManager.clear();
  emit('canvasDestroyed')
});
</script>
<style lang="scss" module>
.draw-game-units {
  position: relative;

  canvas {
    width: 100%;
    height: 100%;
    background-color: rgba(15, 15, 15, 0.582);
  }
}
</style>
