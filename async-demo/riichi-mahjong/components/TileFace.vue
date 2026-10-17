<template>
  <canvas ref="cv" class="tf" :data-kind="kind" :style="{ width: w + 'px', height: h + 'px' }"></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { drawTile } from '../draw/renderer.js'

/**
 * DOM 里渲染一张牌面（复用 Canvas 牌面缓存）
 * kind < 0 时画牌背
 */
const props = defineProps({
  kind: { type: Number, required: true },
  w: { type: Number, default: 26 },
})

const cv = ref(null)

const paint = () => {
  const el = cv.value
  if (!el) return
  // 非法牌种不该让整个组件渲染崩掉：drawTile 会退成牌背，这里留一句定位日志（-1 = 牌背，正常）
  if (props.kind !== -1 && (!Number.isInteger(props.kind) || props.kind < 0 || props.kind > 33)) {
    console.warn('[TileFace] 非法牌种', props.kind, new Error().stack)
  }
  const h = Math.round(props.w * 88 / 64)
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  el.width = Math.round(props.w * dpr)
  el.height = Math.round(h * dpr)
  const ctx = el.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, props.w, h)
  drawTile(ctx, props.kind, 0, 0, props.w, h, { shadow: false })
}

onMounted(paint)
watch(() => [props.kind, props.w], paint)

defineExpose({ h: () => Math.round(props.w * 88 / 64) })
</script>

<style scoped>
.tf { display: block; border-radius: 4px; }
</style>
