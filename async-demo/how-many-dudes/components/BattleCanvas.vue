<template>
  <div ref="containerRef" class="battle-container">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useBattle } from '../composables/useBattle.js';
import { render, renderBattleEnd } from '../draw/renderer.js';

const props = defineProps({
  bros: Array,
  enemyConfig: Object,
  statMult: { type: Number, default: 1 },
  hpMult: { type: Number, default: 1 },
  relics: Array,
  synergies: Array,
});

const emit = defineEmits(['end']);

const containerRef = ref(null);
const canvasRef = ref(null);
let ctx = null;
let battle = null;
let rafId = null;
let battleEnded = false;
let resizeObserver = null;
let canvasW = 800;
let canvasH = 400;
let dpr = 1;

/** 根据容器尺寸设置 canvas 分辨率（支持高 DPI） */
const resizeCanvas = () => {
  const container = containerRef.value;
  if (!container) return;
  const rect = container.getBoundingClientRect();
  dpr = window.devicePixelRatio || 1;
  canvasW = Math.max(100, rect.width);
  canvasH = Math.max(100, rect.height);
  canvasRef.value.width = Math.round(canvasW * dpr);
  canvasRef.value.height = Math.round(canvasH * dpr);
  canvasRef.value.style.width = canvasW + 'px';
  canvasRef.value.style.height = canvasH + 'px';
  ctx = canvasRef.value.getContext('2d');
};

onMounted(() => {
  nextTick(() => {
    resizeCanvas();

    resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(containerRef.value);

    battle = useBattle(props.bros, props.enemyConfig, props.relics, props.synergies, props.statMult, props.hpMult);

    const pixelW = () => Math.round(canvasW * dpr);
    const pixelH = () => Math.round(canvasH * dpr);

    const loop = (timestamp) => {
      const over = battle.tick(timestamp);
      const snapshot = battle.getSnapshot();
      render(ctx, snapshot, pixelW(), pixelH());

      if (over && !battleEnded) {
        battleEnded = true;
        render(ctx, snapshot, pixelW(), pixelH());
        renderBattleEnd(ctx, battle.playerWon, pixelW(), pixelH());
        setTimeout(() => {
          emit('end', battle.playerWon);
        }, 1500);
        return;
      }

      if (!over) {
        rafId = requestAnimationFrame(loop);
      }
    };

    rafId = requestAnimationFrame(loop);
  });
});

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<style scoped>
.battle-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  background: #0a0a0f;
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
