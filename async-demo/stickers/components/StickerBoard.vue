<template>
  <div ref="stageRef" class="board-wrap" @pointerdown="handleStageClick">
    <StickerItem v-for="sticker in stickers" :key="sticker.id" :src="sticker.src" :x="sticker.x" :y="sticker.y"
      :width="sticker.width" :height="sticker.height" :rotation="sticker.rotation" :curl-angle="sticker.curlAngle"
      :start-curl="sticker.startCurl" :duration="sticker.duration" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StickerItem from './StickerItem.vue'

const emit = defineEmits(['stageClick'])

const stageRef = ref(null)
const stickers = ref([])

const addSticker = (src, options = {}) => {
  const x = options.x ?? Math.random()
  const y = options.y ?? Math.random()
  const width = options.width ?? 200
  const height = options.height ?? 200
  const rotation = options.rotation ?? 0
  const curlAngle = options.curlAngle ?? 0
  const startCurl = options.startCurl ?? 0.15
  const duration = options.duration ?? 1100

  stickers.value.push({
    id: Date.now() + Math.random(),
    src,
    x,
    y,
    width,
    height,
    rotation,
    curlAngle,
    startCurl,
    duration,
  })
}

const handleStageClick = (e) => {
  const rect = stageRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  emit('stageClick', { x, y })
}

defineExpose({ addSticker })
</script>

<style scoped lang="scss">
.board-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  cursor: crosshair;
  z-index: 0;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.9);
}
</style>