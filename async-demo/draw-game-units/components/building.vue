<template>
 <canvasDraw @drawFrame="onDrawFrame" @canvasMounted="onCanvasMounted" @canvasClick="onCanvasClick"
    @canvasDestroyed="onCanvasDestroyed" />
</template>
<script setup>
import { drawShop } from '../draw-build/draw-shop.js'
import { drawSKillStone } from '../draw-build/draw-stone.js'
import { drawPortal } from '../draw-build/draw-portal.js'

import canvasDraw from "./canvas-draw.vue";

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

// 绘制回调
const onDrawFrame = ({ ctx, deltaTime, canvasFrame }) => {
  // 商店城堡
  drawShop(ctx, {
    width: 3 * 35,
    height: 5 * 35,
    x: 600,
    y: 50,
    frame: canvasFrame * 0.15,
  });

  // 绘制贤者之石
  drawSKillStone(ctx, {
    width: 90,
    height: 100,
    x: 730,
    y: 70,
    frame: canvasFrame * 0.15,
  });

  drawPortal(ctx, {
    width: 80,
    height: 80,
    x: 830,
    y: 70,
    frame: canvasFrame * 0.15,
  });
};
</script>