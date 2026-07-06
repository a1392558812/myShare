<template>
  <div class="sticker-wrap" :style="{
    left: position.left + 'px',
    top: position.top + 'px',
    width: width + 'px',
    height: height + 'px',
    transform: `rotate(${rotation}deg)`,
  }">
    <div class="sticker-content" :style="{ clipPath: flatClipPath }">
      <img class="sticker-image" :src="src" draggable="false" />
    </div>

    <div v-if="!isFinished" class="sticker-curl-shadow" :style="shadowStyle">
      <div class="sticker-curl-clip" :style="{ clipPath: flapClipPath }">
        <div class="sticker-curl-inner" :style="flapInnerStyle">
          <div class="sticker-curl-fill" :style="flapFillStyle"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  rotation: { type: Number, required: true },
  curlAngle: { type: Number, required: true },
  startCurl: { type: Number, default: 0.15 },
  duration: { type: Number, default: 1100 },
})

const progress = ref(props.startCurl)
const isFinished = ref(false)
let animId = null
let startTime = null

const position = computed(() => {
  const parent = document.querySelector('.board-wrap')
  if (!parent) return { left: 0, top: 0 }
  const rect = parent.getBoundingClientRect()
  const halfW = props.width / 2
  const halfH = props.height / 2
  const left = Math.min(Math.max(props.x * rect.width, halfW), rect.width - halfW) - halfW
  const top = Math.min(Math.max(props.y * rect.height, halfH), rect.height - halfH) - halfH
  return { left, top }
})

const angleRad = computed(() => (props.curlAngle * Math.PI) / 180)
const u = computed(() => [Math.cos(angleRad.value), Math.sin(angleRad.value)])
const w = computed(() => [-Math.sin(angleRad.value), Math.cos(angleRad.value)])

const projections = computed(() => {
  const W = props.width
  const H = props.height
  const corners = [
    [0, 0],
    [W, 0],
    [W, H],
    [0, H],
  ]
  const uArr = u.value
  return corners.map((c) => c[0] * uArr[0] + c[1] * uArr[1])
})

const minP = computed(() => Math.min(...projections.value))
const span = computed(() => Math.max(...projections.value) - minP.value)

const fold = computed(() => minP.value + span.value * progress.value)

const BIG = computed(() => Math.max(props.width, props.height) * 6)

const halfPlanePoints = computed(() => {
  const [u0, u1] = u.value
  const [w0, w1] = w.value
  const f = fold.value
  const b = BIG.value
  return [
    { x: f * u0 + b * w0, y: f * u1 + b * w1 },
    { x: f * u0 - b * w0, y: f * u1 - b * w1 },
    { x: f * u0 - b * w0 - b * u0, y: f * u1 - b * w1 - b * u1 },
    { x: f * u0 + b * w0 - b * u0, y: f * u1 + b * w1 - b * u1 },
  ]
})

const clipPathStr = computed(() => {
  const pts = halfPlanePoints.value
  return `polygon(${pts.map(p => `${p.x}px ${p.y}px`).join(', ')})`
})

const flatClipPath = computed(() => clipPathStr.value)
const flapClipPath = computed(() => clipPathStr.value)

const flapInnerStyle = computed(() => {
  const [u0, u1] = u.value
  const a = 1 - 2 * u0 * u0
  const b = -2 * u0 * u1
  const d = 1 - 2 * u1 * u1
  const tx = 2 * fold.value * u0
  const ty = 2 * fold.value * u1
  return {
    transform: `matrix(${a}, ${b}, ${b}, ${d}, ${tx}, ${ty})`,
    transformOrigin: '0 0',
  }
})

const flapFillStyle = computed(() => {
  const angle = 90 + (props.curlAngle * 180) / Math.PI
  const p = progress.value
  const stops = [
    { color: '#cdcdcd', pos: p },
    { color: '#f3f3f3', pos: p + (1 - p) * 0.1 },
    { color: '#ffffff', pos: p + (1 - p) * 0.45 },
    { color: '#f0f0f0', pos: p + (1 - p) * 0.82 },
    { color: '#c6c6c6', pos: 1 },
  ]
  const grad = `linear-gradient(${angle}deg, ${stops.map(s => `${s.color} ${s.pos * 100}%`).join(', ')})`
  return {
    maskImage: `url("${props.src}")`,
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskImage: `url("${props.src}")`,
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    backgroundImage: grad,
  }
})

const shadowStyle = computed(() => {
  const [u0, u1] = u.value
  const S = Math.max(props.width, props.height)
  const p = progress.value
  const factor = 1 - p
  const dx = u0 * S * -0.05 * factor
  const dy = (u1 * -0.05 + 0.04) * S * factor
  const blur = S * 0.025
  const opacity = 0.35 * factor
  return {
    filter: `drop-shadow(${dx}px ${dy}px ${blur}px rgba(0,0,0,${opacity}))`,
  }
})

function animate(timestamp) {
  if (!startTime) startTime = timestamp
  const elapsed = timestamp - startTime
  const t = Math.min(elapsed / props.duration, 1)
  const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  progress.value = props.startCurl + (1 - props.startCurl) * eased

  if (t < 1) {
    animId = requestAnimationFrame(animate)
  } else {
    progress.value = 1
    isFinished.value = true
  }
}

onMounted(() => {
  animId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.sticker-wrap {
  position: absolute;
  user-select: none;
  pointer-events: auto;
  will-change: transform, opacity;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.16)) drop-shadow(0 5px 10px rgba(0, 0, 0, 0.01));
}

.sticker-content,
.sticker-curl-clip {
  position: absolute;
  inset: 0;
}

.sticker-curl-shadow {
  position: absolute;
  inset: 0;
}

.sticker-curl-inner {
  position: absolute;
  inset: 0;
}

.sticker-curl-fill {
  width: 100%;
  height: 100%;
  mask-mode: alpha;
  -webkit-mask-mode: alpha;
}

.sticker-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}
</style>