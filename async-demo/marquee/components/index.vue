<template>
  <div ref="rootRef" class="marquee-root">
    <div ref="trackRef" class="marquee-track" :style="trackStyle">
      <div v-for="n in segmentCount" :key="n" class="marquee-segment">
        <slot :index="n" :segmentCount="segmentCount" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({
  // 是否自动用内容重复铺满容器的空白
  autoFill: { type: Boolean, default: true },
  // 速度（像素/秒），为 0 时暂停
  speed: { type: Number, default: 60 },
  // 方向：rtl(右到左)、ltr(左到右)、ttb(上到下)、btt(下到上)
  direction: { type: String, default: 'rtl' },
})

const rootRef = ref(null)
const trackRef = ref(null)

const segmentCount = ref(1)
const axis = computed(() => (props.direction === 'ttb' || props.direction === 'btt') ? 'vertical' : 'horizontal')
const isHorizontal = computed(() => axis.value === 'horizontal')

// 动画状态
let rafId = null
let lastTs = 0
let translate = 0 // 当前主轴平移值
let baseLen = 0 // 单段内容主轴长度（px）
let containerMain = 0 // 容器主轴长度（px）

const trackStyle = ref({})

const measure = () => {
  const root = rootRef.value
  const firstSeg = trackRef.value?.querySelector('.marquee-segment')
  if (!root || !firstSeg) return
  const rootRect = root.getBoundingClientRect()
  const segRect = firstSeg.getBoundingClientRect()
  baseLen = isHorizontal.value ? segRect.width : segRect.height
  containerMain = isHorizontal.value ? rootRect.width : rootRect.height
}

const fillSegments = () => {
  if (!props.autoFill) { segmentCount.value = 1; return }
  measure()
  if (baseLen <= 0) { segmentCount.value = 1; return }
  // 至少填满容器主轴长度，再加 1 段以保证循环无缝
  const need = Math.max(2, Math.ceil(containerMain / baseLen) + 1)
  segmentCount.value = need
}

const updateTransform = () => {
  const tx = isHorizontal.value ? translate : 0
  const ty = isHorizontal.value ? 0 : translate
  trackStyle.value = {
    display: 'flex',
    flexDirection: isHorizontal.value ? 'row' : 'column',
    transform: `translate3d(${tx}px, ${ty}px, 0)`,
    willChange: 'transform',
    pointerEvents: 'none',
  }
}

const tick = (ts) => {
  if (lastTs === 0) lastTs = ts
  const dt = (ts - lastTs) / 1000
  lastTs = ts
  if (props.speed > 0 && baseLen > 0) {
    const dir = props.direction
    const v = props.speed
    const wrapLen = props.autoFill ? baseLen : (containerMain + baseLen)
    if (isHorizontal.value) {
      translate += (dir === 'rtl' ? -v : +v) * dt
      if (props.autoFill) {
        if (dir === 'rtl') {
          if (translate <= -baseLen) translate += baseLen
        } else { // ltr
          if (translate >= 0) translate -= baseLen
        }
      } else {
        if (dir === 'rtl') {
          if (translate <= -baseLen) translate += wrapLen
        } else { // ltr
          if (translate >= containerMain) translate -= wrapLen
        }
      }
    } else {
      translate += (dir === 'btt' ? -v : +v) * dt
      if (props.autoFill) {
        if (dir === 'btt') {
          if (translate <= -baseLen) translate += baseLen
        } else { // ttb
          if (translate >= 0) translate -= baseLen
        }
      } else {
        if (dir === 'btt') {
          if (translate <= -baseLen) translate += wrapLen
        } else { // ttb
          if (translate >= containerMain) translate -= wrapLen
        }
      }
    }
  }
  updateTransform()
  rafId = requestAnimationFrame(tick)
}

const start = () => {
  cancel()
  nextTick(() => {
    fillSegments()
    measure()

    if (isHorizontal.value) {
      if (props.direction === 'rtl') {
        // 从右到左：从右边缘开始
        translate = containerMain - baseLen
      } else { // ltr
        // 从左到右,autoFill 开启时，为避免左侧出现空白，预置一个段在左侧
        translate = props.autoFill ? -baseLen : 0
      }
    } else {
      if (props.direction === 'btt') {
        // 从下到上：从下边缘开始
        translate = containerMain - baseLen
      } else { // ttb
        // autoFill 开启时，为避免上侧出现空白，预置一个段在上侧
        translate = props.autoFill ? -baseLen : 0
      }
    }
    updateTransform()
    lastTs = 0
    rafId = requestAnimationFrame(tick)
  })
}

const cancel = () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null
  }
}

onMounted(() => {
  start()
  window.addEventListener('resize', start)
})

onBeforeUnmount(() => {
  cancel()
  window.removeEventListener('resize', start)
})

watch(() => [props.autoFill, props.speed, props.direction], () => {
  start()
})
</script>

<style scoped lang="scss">
.marquee-root {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  .marquee-track {
    position: absolute;
    top: 0;
    left: 0;

    .marquee-segment {
      flex: 0 0 auto;
    }
  }
}
</style>