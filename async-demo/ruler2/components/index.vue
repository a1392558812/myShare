<template>
  <div class="ruler-container" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }">
    <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight" @mousedown="handleMouseDown"
      @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseUp" class="ruler-canvas" />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  numeralSystem: {
    type: Number,
    default: 10
  },
  graduationMarkNum: {
    type: Number,
    default: 10
  },
  label: {
    type: Function,
    default: (value) => value.toString()
  },
  currentValue: {
    type: Number,
    default: 0
  },
  setup: {
    type: Number,
    default: 0
  },
  maxValue: {
    type: Number || null,
    default: null
  },
  minValue: {
    type: Number || null,
    default: null
  },
  canvasWidth: {
    type: Number,
    default: 800
  },
  canvasHeight: {
    type: Number,
    default: 60
  },
  majorMarkHeight: {
    type: Number,
    default: 20
  },
  minorMarkHeight: {
    type: Number,
    default: 10
  },
  pixelsPerValue: {
    type: Number,
    default: 0
  },
  majorMarkColor: {
    type: String,
    default: 'rgba(0, 0, 0, 0.8)'
  },
  minorMarkColor: {
    type: String,
    default: 'rgba(0, 0, 0, 0.5)'
  },
  textColor: {
    type: String,
    default: 'rgba(0, 0, 0, 0.8)'
  },
  pointerColor: {
    type: String,
    default: 'rgba(255, 0, 0, 0.6)'
  },
  pointerWidth: {
    type: Number,
    default: 2
  },
  orientation: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  }
})

const emit = defineEmits(['change'])
const canvasRef = ref(null)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartValue = ref(0)
const currentOffset = ref(0)
const pixelsPerValue = computed(() => {
  if (props.pixelsPerValue > 0) return props.pixelsPerValue
  if (props.orientation === 'vertical') {
    const availableHeight = props.canvasHeight - 40
    const range = props.numeralSystem * props.graduationMarkNum
    return availableHeight / range
  } else {
    const availableWidth = props.canvasWidth - 40
    const range = props.numeralSystem * props.graduationMarkNum
    return availableWidth / range
  }
})

const valueToPixel = (value) => {
  const rulerStart = 0
  if (props.orientation === 'vertical') {
    const centerPointerY = props.canvasHeight / 2
    return centerPointerY + (value - rulerStart) * pixelsPerValue.value + currentOffset.value
  } else {
    const centerPointerX = props.canvasWidth / 2
    return centerPointerX + (value - rulerStart) * pixelsPerValue.value + currentOffset.value
  }
}

const pixelToValue = (pixel) => {
  const rulerStart = 0
  if (props.orientation === 'vertical') {
    const centerPointerY = props.canvasHeight / 2
    return rulerStart + (pixel - centerPointerY - currentOffset.value) / pixelsPerValue.value
  } else {
    const centerPointerX = props.canvasWidth / 2
    return rulerStart + (pixel - centerPointerX - currentOffset.value) / pixelsPerValue.value
  }
}
const drawRuler = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let startValue, endValue
  if (props.connect) {
    const visibleRange = props.orientation === 'vertical'
      ? props.canvasHeight / pixelsPerValue.value
      : props.canvasWidth / pixelsPerValue.value
    const centerValue = pixelToValue(props.orientation === 'vertical'
      ? props.canvasHeight / 2
      : props.canvasWidth / 2)
    startValue = centerValue - visibleRange * 1.5
    endValue = centerValue + visibleRange * 1.5
  } else {
    if (props.orientation === 'vertical') {
      const topValue = pixelToValue(0)
      const bottomValue = pixelToValue(props.canvasHeight)
      startValue = Math.floor(topValue) - 5
      endValue = Math.ceil(bottomValue) + 5
    } else {
      const leftValue = pixelToValue(0)
      const rightValue = pixelToValue(props.canvasWidth)
      startValue = Math.floor(leftValue) - 5
      endValue = Math.ceil(rightValue) + 5
    }
  }
  let startLoop = Math.floor(startValue)
  let endLoop = Math.ceil(endValue)
  for (let value = startLoop; value <= endLoop; value++) {
    if (props.orientation === 'vertical') {
      const y = valueToPixel(value)
      if (y < -50 || y > props.canvasHeight + 50) continue
      const isMajorMark = value % props.graduationMarkNum === 0
      if (isMajorMark) {
        ctx.strokeStyle = props.majorMarkColor
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(props.canvasWidth - props.majorMarkHeight, y)
        ctx.lineTo(props.canvasWidth, y)
        ctx.stroke()
        ctx.fillStyle = props.textColor
        ctx.textAlign = 'right'
        const label = props.label(value)
        ctx.fillText(label, props.canvasWidth - props.majorMarkHeight - 5, y)
      } else {
        ctx.strokeStyle = props.minorMarkColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(props.canvasWidth - props.minorMarkHeight, y)
        ctx.lineTo(props.canvasWidth, y)
        ctx.stroke()
      }
    } else {
      const x = valueToPixel(value)
      if (x < -50 || x > props.canvasWidth + 50) continue
      const isMajorMark = value % props.graduationMarkNum === 0
      if (isMajorMark) {
        ctx.strokeStyle = props.majorMarkColor
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x, props.canvasHeight - props.majorMarkHeight)
        ctx.lineTo(x, props.canvasHeight)
        ctx.stroke()
        ctx.fillStyle = props.textColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        const label = props.label(value)
        ctx.fillText(label, x, props.canvasHeight - props.majorMarkHeight - 5)
      } else {
        ctx.strokeStyle = props.minorMarkColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, props.canvasHeight - props.minorMarkHeight)
        ctx.lineTo(x, props.canvasHeight)
        ctx.stroke()
      }
    }
  }
  if (props.orientation === 'vertical') {
    const pointerY = props.canvasHeight / 2
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 3
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    ctx.strokeStyle = props.pointerColor
    ctx.lineWidth = props.pointerWidth + 1
    ctx.beginPath()
    ctx.moveTo(0, pointerY)
    ctx.lineTo(props.canvasWidth, pointerY)
    ctx.stroke()
    ctx.fillStyle = props.pointerColor
    ctx.beginPath()
    ctx.moveTo(props.canvasWidth, pointerY - 6)
    ctx.lineTo(props.canvasWidth, pointerY + 6)
    ctx.lineTo(props.canvasWidth - 10, pointerY)
    ctx.closePath()
    ctx.fill()
  } else {
    const pointerX = props.canvasWidth / 2
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 3
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    ctx.strokeStyle = props.pointerColor
    ctx.lineWidth = props.pointerWidth + 1
    ctx.beginPath()
    ctx.moveTo(pointerX, 0)
    ctx.lineTo(pointerX, props.canvasHeight)
    ctx.stroke()
    ctx.fillStyle = props.pointerColor
    ctx.beginPath()
    ctx.moveTo(pointerX - 6, 0)
    ctx.lineTo(pointerX + 6, 0)
    ctx.lineTo(pointerX, 10)
    ctx.closePath()
    ctx.fill()
  }
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}
const handleMouseDown = (e) => {
  isDragging.value = true
  dragStartX.value = props.orientation === 'vertical' ? e.clientY : e.clientX
  dragStartValue.value = props.currentValue
  console.log('！！拖拽开始:', { startX: dragStartX.value, startValue: dragStartValue.value, orientation: props.orientation })
}
const handleMouseMove = (e) => {
  if (!isDragging.value) return
  const delta = props.orientation === 'vertical'
    ? e.clientY - dragStartX.value
    : e.clientX - dragStartX.value
  let newValue
  if (props.orientation === 'vertical') {
    newValue = dragStartValue.value - delta / pixelsPerValue.value
  } else {
    newValue = dragStartValue.value - delta / pixelsPerValue.value
  }
  if (props.setup > 0) {
    const step = Math.round(newValue / props.setup) * props.setup
    newValue = step
  }
  if (props.minValue !== null && newValue < props.minValue) {
    newValue = props.minValue
  }
  if (props.maxValue !== null && newValue > props.maxValue) {
    newValue = props.maxValue
  }
  console.log('拖拽中1111:', { delta, pixelsPerValue: pixelsPerValue.value, newValue, minValue: props.minValue, maxValue: props.maxValue, orientation: props.orientation })
  emit('change', newValue)
}
const handleMouseUp = () => {
  isDragging.value = false
}
watch([
  () => props.numeralSystem,
  () => props.graduationMarkNum,
  () => props.currentValue,
  () => props.majorMarkHeight,
  () => props.minorMarkHeight,
  () => props.majorMarkColor,
  () => props.minorMarkColor,
  () => props.textColor,
  () => props.label,
  () => props.pointerColor,
  () => props.pointerWidth,
  () => props.minValue,
  () => props.maxValue,
  () => props.pixelsPerValue,
  () => props.orientation,
], () => {
  console.log('props变化:', props)
  nextTick(() => {
    drawRuler()
  })
}, { immediate: true })

watch(() => props.currentValue, (newValue, oldValue) => {
  const rulerStart = 0
  const targetOffset = -(newValue - rulerStart) * pixelsPerValue.value
  currentOffset.value = targetOffset
  nextTick(() => {
    drawRuler()
  })
}, { immediate: true })
</script>

<style lang="scss" scoped>
.ruler-container {
  display: inline-block;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.ruler-canvas {
  display: block;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}
</style>