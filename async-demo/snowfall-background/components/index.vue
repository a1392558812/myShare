<template>
  <div class="snowfall-container" :style="containerStyle">
    <canvas ref="canvasRef" class="snowfall-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

// 定义props
const props = defineProps({
  // 容器宽度
  width: {
    type: String,
    default: '100%'
  },
  // 容器高度
  height: {
    type: String,
    default: '100%'
  },
  // 雪量大小 (1-10)
  snowAmount: {
    type: Number,
    default: 5,
    validator: (value) => value >= 1 && value <= 10
  },
  // 风向 (-10 到 10，负值向左，正值向右)
  windDirection: {
    type: Number,
    default: 0,
    validator: (value) => value >= -10 && value <= 10
  },
  // 下落速度 (1-10)
  fallSpeed: {
    type: Number,
    default: 3,
    validator: (value) => value >= 1 && value <= 10
  },
  // 雪花大小 (1-10)
  snowflakeSize: {
    type: Number,
    default: 5,
    validator: (value) => value >= 1 && value <= 10
  },
  // 雪花颜色
  snowflakeColor: {
    type: String,
    default: '#ffffff'
  },
  // 是否启用缓动动画
  enableEasing: {
    type: Boolean,
    default: true
  },
  // 背景颜色
  backgroundColor: {
    type: String,
    default: 'transparent'
  }
})

const canvasRef = ref(null)
const canvas = ref(null)
const ctx = ref(null)
const snowflakes = ref([])
const animationId = ref(null)
const containerWidth = ref(0)
const containerHeight = ref(0)

const containerStyle = computed(() => ({
  width: props.width,
  height: props.height,
  position: 'relative',
  overflow: 'hidden'
}))

const snowflakeCount = computed(() => {
  const baseCount = 50
  return baseCount * props.snowAmount
})

const initCanvas = () => {
  canvas.value = canvasRef.value
  ctx.value = canvas.value.getContext('2d')
  ctx.value.fillStyle = props.backgroundColor
  ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height)
}

const resizeCanvas = () => {
  const container = canvasRef.value.parentElement
  containerWidth.value = container.clientWidth
  containerHeight.value = container.clientHeight

  canvas.value.width = containerWidth.value
  canvas.value.height = containerHeight.value

  snowflakes.value.forEach(snowflake => {
    // 保持现有雪花，但确保它们在可见区域内
    if (snowflake.x < 0) snowflake.x = 0
    if (snowflake.x > containerWidth.value) snowflake.x = containerWidth.value
    if (snowflake.y < 0) snowflake.y = 0
  })
}

const initializeSnowflakes = () => {
  snowflakes.value = []

  for (let i = 0; i < snowflakeCount.value; i++) {
    snowflakes.value.push({
      x: Math.random() * containerWidth.value,
      y: Math.random() * containerHeight.value,
      radius: (Math.random() * 0.5 + 0.5) * props.snowflakeSize,
      speedX: (Math.random() - 0.5 + props.windDirection * 0.1) * props.fallSpeed * 0.2,
      speedY: (Math.random() * 0.5 + 0.5) * props.fallSpeed,
      opacity: Math.random() * 0.5 + 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    })
  }
}

const drawSnowflake = (snowflake) => {
  ctx.value.save()
  ctx.value.translate(snowflake.x, snowflake.y)
  ctx.value.rotate(snowflake.rotation)
  ctx.value.fillStyle = `${props.snowflakeColor}${Math.floor(snowflake.opacity * 255).toString(16).padStart(2, '0')}`
  ctx.value.beginPath()

  // 绘制六边形雪花
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i
    const x = Math.cos(angle) * snowflake.radius
    const y = Math.sin(angle) * snowflake.radius

    if (i === 0) {
      ctx.value.moveTo(x, y)
    } else {
      ctx.value.lineTo(x, y)
    }
  }

  ctx.value.closePath()
  ctx.value.fill()
  ctx.value.restore()
}

const updateSnowflakes = () => {
  ctx.value.clearRect(0, 0, containerWidth.value, containerHeight.value)

  ctx.value.fillStyle = props.backgroundColor
  ctx.value.fillRect(0, 0, containerWidth.value, containerHeight.value)

  snowflakes.value.forEach(snowflake => {
    snowflake.x += snowflake.speedX + props.windDirection * 0.05
    snowflake.y += snowflake.speedY

    snowflake.rotation += snowflake.rotationSpeed

    // 处理边界，让雪花循环
    if (snowflake.y > containerHeight.value) {
      snowflake.y = -snowflake.radius
      snowflake.x = Math.random() * containerWidth.value
    }

    if (snowflake.x > containerWidth.value + snowflake.radius) {
      snowflake.x = -snowflake.radius
    } else if (snowflake.x < -snowflake.radius) {
      snowflake.x = containerWidth.value + snowflake.radius
    }

    drawSnowflake(snowflake)
  })
}

const startAnimation = () => {
  const animate = () => {
    updateSnowflakes()
    animationId.value = requestAnimationFrame(animate)
  }

  animate()
}

const stopAnimation = () => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
  }
}

const handleResize = () => {
  resizeCanvas()
}

const resetSnowflakes = () => {
  initializeSnowflakes()
}

watch(() => props.snowAmount, () => {
  initializeSnowflakes()
})

watch(() => props.windDirection, () => {
  snowflakes.value.forEach(snowflake => {
    snowflake.speedX = (Math.random() - 0.5 + props.windDirection * 0.1) * props.fallSpeed * 0.2
  })
})

watch(() => props.fallSpeed, () => {
  snowflakes.value.forEach(snowflake => {
    snowflake.speedX = (Math.random() - 0.5 + props.windDirection * 0.1) * props.fallSpeed * 0.2
    snowflake.speedY = (Math.random() * 0.5 + 0.5) * props.fallSpeed
  })
})

watch(() => props.snowflakeSize, () => {
  snowflakes.value.forEach(snowflake => {
    snowflake.radius = (Math.random() * 0.5 + 0.5) * props.snowflakeSize
  })
})

watch(() => props.width, () => {
  nextTick(() => {
    resizeCanvas()
  })
})

watch(() => props.height, () => {
  nextTick(() => {
    resizeCanvas()
  })
})

onMounted(() => {
  initCanvas()
  resizeCanvas()
  initializeSnowflakes()
  startAnimation()

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  stopAnimation()
  window.removeEventListener('resize', handleResize)
})

defineExpose({
  resetSnowflakes
})
</script>

<style lang="scss" scoped>
.snowfall-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
}
</style>