<template>
  <canvas ref="canvasRef" class="word-cloud-canvas" @mousemove="handleMouseMove" @mousewheel="handleMouseWheel"
    @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd"
    @mouseleave="handleMouseLeave"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['update:isAutoRotating', 'currentWordClick'])

const props = defineProps({
  defaultWords: {
    type: Array, // { text: '🐮🍺', fontSize: 30, weight: 0.9, bgIcon: 'url' }
    default: () => []
  },
  isAutoRotating: { // 是否自动旋转
    type: Boolean,
    default: true
  },
  radius: {
    type: Number, // 球体半径
    default: 200
  },
  colors: { // 主题样式参数
    type: Array,
    default: () => [
      '#4f46e5', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b',
      '#ef4444', '#3b82f6', '#14b8a6', '#8b5cf6', '#6366f1'
    ]
  },
  autoRotateSpeed: { // 自动旋转速度
    type: Number,
    default: 0.003
  },
  fontSize: { // 基本字体大小
    type: Number,
    default: 10
  }
})

const canvasRef = ref(null)

let ctx = null
let canvasWidth = 800
let canvasHeight = 600
let centerX, centerY

const words = ref([]) // 单词数据
const wordData = ref([]) // 单词在球面上的位置数据
// 图片缓存对象，
const imgCache = {}
let animationFrameId = null

const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
let rotateX = 0
let rotateY = 0
let scale = 1
let currentWord = null // 当前选中的单词

const initCanvas = () => {
  console.log('initCanvas', canvasRef.value)
  if (!canvasRef.value) return

  ctx = canvasRef.value.getContext('2d')

  const updateCanvasSize = () => {
    const container = canvasRef.value.parentElement
    canvasWidth = container.clientWidth
    canvasHeight = container.clientHeight

    const dpr = window.devicePixelRatio || 1
    canvasRef.value.width = canvasWidth * dpr
    canvasRef.value.height = canvasHeight * dpr
    canvasRef.value.style.width = `${canvasWidth}px`
    canvasRef.value.style.height = `${canvasHeight}px`
    ctx.scale(dpr, dpr) // 缩放匹配设备像素比

    centerX = canvasWidth / 2
    centerY = canvasHeight / 2

    if (wordData.value.length > 0) {
      drawWordCloud()
    }
  }

  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)
}

// 将单词分布在球面上
const distributeWordsOnSphere = () => {
  wordData.value = []

  const count = words.value.length
  const goldenRatio = (1 + Math.sqrt(5)) / 2

  words.value.forEach((word, index) => {

    const t = index / count
    const inclination = Math.acos(1 - 2 * t) // 覆盖从0到π的所有角度
    const azimuth = 2 * Math.PI * index / goldenRatio // 确保方位角均匀分布

    // 球坐标转笛卡尔坐标
    const x = Math.sin(inclination) * Math.cos(azimuth)
    const y = Math.sin(inclination) * Math.sin(azimuth)
    const z = Math.cos(inclination)

    // 随机微调每个点的位置，使分布更加自然
    const jitter = 0.05 // 微调度
    const jx = x + (Math.random() - 0.5) * jitter
    const jy = y + (Math.random() - 0.5) * jitter
    const jz = z + (Math.random() - 0.5) * jitter


    const magnitude = Math.sqrt(jx * jx + jy * jy + jz * jz)
    const normalizedX = jx / magnitude
    const normalizedY = jy / magnitude
    const normalizedZ = jz / magnitude

    // 单词权重的大小
    const fontSize = (word.fontSize || props.fontSize) + word.weight * 20
    const color = props.colors[index % props.colors.length]

    wordData.value.push({
      text: word.text,
      x: normalizedX,
      y: normalizedY,
      z: normalizedZ,
      fontSize,
      color,
      weight: word.weight,
      bgIcon: word.bgIcon,
      depth: 0 // 将在绘制时计算（🍺）
    })
  })
}

const drawWordCloud = () => {
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  wordData.value.forEach(word => {
    const isCurrentWord = currentWord && currentWord.text === word.text

    // 应用旋转矩阵
    let x = word.x
    let y = word.y
    let z = word.z

    // 绕X轴旋转
    const cosX = Math.cos(rotateX)
    const sinX = Math.sin(rotateX)
    let tempY = y * cosX - z * sinX
    z = y * sinX + z * cosX
    y = tempY

    // 绕Y轴旋转
    const cosY = Math.cos(rotateY)
    const sinY = Math.sin(rotateY)
    const tempX = x * cosY + z * sinY
    z = -x * sinY + z * cosY
    x = tempX

    // 保存转换后的坐标
    word.screenX = x * props.radius * scale + centerX
    word.screenY = y * props.radius * scale + centerY
    word.depth = z // 用于排序和大小调整（呼应上面'🍺'注释）

    // 基于深度的大小缩放
    const displaySize = word.fontSize * (0.5 + (z + 1) * 0.5) * scale
    word.displaySize = isCurrentWord ? displaySize * 1.2 : displaySize
  })

  // 根据深度排序（从后到前绘制）
  wordData.value.sort((a, b) => b.depth - a.depth)

  wordData.value.forEach(word => {
    ctx.save()

    // 确定单词是否在球体前方
    if (word.depth > -0.1) {
      const isCurrentWord = currentWord && currentWord.text === word.text

      if (word.bgIcon) {
        if (imgCache[word.bgIcon]) {
          // 计算单词文本的宽度，确定背景图尺寸
          const textWidth = ctx.measureText(word.text).width
          const imgRatio = imgCache[word.bgIcon].width / imgCache[word.bgIcon].height
          const bgWidth = Math.max(textWidth * 1.2, word.displaySize * 1.5)
          const bgHeight = bgWidth / imgRatio

          const imgX = word.screenX - bgWidth / 2
          const imgY = word.screenY - bgHeight / 2

          ctx.drawImage(imgCache[word.bgIcon], imgX, imgY, bgWidth, bgHeight)
        } else {
          // 如果图片未加载完成，可以先绘制一个占位符
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
          const textWidth = ctx.measureText(word.text).width
          const placeholderWidth = Math.max(textWidth * 1.2, word.displaySize * 1.5)
          const placeholderHeight = placeholderWidth // 假设1:1的比例作为占位符

          ctx.fillRect(
            word.screenX - placeholderWidth / 2,
            word.screenY - placeholderHeight / 2,
            placeholderWidth,
            placeholderHeight
          )

          const img = new Image()
          img.src = word.bgIcon

          img.onload = () => {
            imgCache[word.bgIcon] = img
            drawWordCloud()
          }
        }
      }

      // 文本样式
      ctx.font = `bold ${word.displaySize}px 'Arial', sans-serif`
      ctx.fillStyle = word.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2

      ctx.fillText(word.text, word.screenX, word.screenY)

      if (isCurrentWord) {
        ctx.strokeStyle = word.color
        ctx.lineWidth = 2
        ctx.strokeText(word.text, word.screenX, word.screenY)
      }
    }

    ctx.restore()
  })
}

const animate = () => {
  if (props.isAutoRotating) {
    rotateY += props.autoRotateSpeed
  }

  drawWordCloud()
  animationFrameId = requestAnimationFrame(animate)
}

const handleMouseMove = (event) => {
  if (isDragging.value) {
    const dx = event.clientX - startX.value
    const dy = event.clientY - startY.value

    rotateY += dx * 0.005
    rotateX += dy * 0.005

    startX.value = event.clientX
    startY.value = event.clientY

    emit('update:isAutoRotating', false)
  }
}

const handleMouseWheel = (event) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  scale = Math.max(0.5, Math.min(3, scale * delta))

  emit('update:isAutoRotating', false)
}

const handleTouchStart = (event) => {
  if (event.touches.length === 1) {
    isDragging.value = true
    startX.value = event.touches[0].clientX
    startY.value = event.touches[0].clientY

    // 检查是否点击了单词
    const touchX = event.touches[0].clientX
    const touchY = event.touches[0].clientY

    for (const word of wordData.value) {
      const rect = canvasRef.value.getBoundingClientRect()
      const wordLeft = word.screenX + rect.left
      const wordTop = word.screenY + rect.top

      let clickAreaWidth, clickAreaHeight

      if (word.bgIcon && imgCache[word.bgIcon]) {
        // 背景图的尺寸
        const textWidth = ctx.measureText(word.text).width
        clickAreaWidth = Math.max(textWidth * 1.2, word.displaySize * 1.5)
        const imgRatio = imgCache[word.bgIcon].width / imgCache[word.bgIcon].height
        clickAreaHeight = clickAreaWidth / imgRatio
      } else if (word.text === '') { // 对于空文本且没有背景图的单词，设置默认点击区域
        clickAreaWidth = word.displaySize * 1.5
        clickAreaHeight = word.displaySize * 1.5
      } else {
        // 正常文本的点击区域
        clickAreaWidth = ctx.measureText(word.text).width
        clickAreaHeight = word.displaySize * 1.2
      }

      if (touchX >= wordLeft - clickAreaWidth / 2 &&
        touchX <= wordLeft + clickAreaWidth / 2 &&
        touchY >= wordTop - clickAreaHeight / 2 &&
        touchY <= wordTop + clickAreaHeight / 2) {
        currentWord = word
        console.log('点击了单词:', word)
        emit('currentWordClick', word)
        break
      }
    }
  }
}

const handleTouchMove = (event) => {
  if (isDragging.value && event.touches.length === 1) {
    const dx = event.touches[0].clientX - startX.value
    const dy = event.touches[0].clientY - startY.value

    rotateY += dx * 0.005
    rotateX += dy * 0.005

    startX.value = event.touches[0].clientX
    startY.value = event.touches[0].clientY
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
  currentWord = null
}

const handleMouseLeave = () => {
  isDragging.value = false
}

// 重新生成
const regenerateCloud = () => {
  // 乱序
  words.value = [...words.value].sort(() => Math.random() - 0.5)
  distributeWordsOnSphere()
}

// 重置视角
const resetView = () => {
  rotateX = 0
  rotateY = 0
  scale = 1
  currentWord = null
}

// 添加单词
const addNewWords = (data) => {
  words.value.push({
    text: data.text,
    weight: data.weight || 0.5 + Math.random() * 0.5,
    fontSize: data.fontSize || props.fontSize,
    bgIcon: data.bgIcon
  })
  distributeWordsOnSphere()
}

// 初始化
const initScreen = () => {
  words.value = [...props.defaultWords]
  initCanvas()
  distributeWordsOnSphere()
  animate()

  canvasRef.value.addEventListener('mousedown', (event) => {
    isDragging.value = true
    startX.value = event.clientX
    startY.value = event.clientY

    // 检查是否点击了单词
    const rect = canvasRef.value.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    for (const word of wordData.value) {
      let clickAreaWidth, clickAreaHeight

      if (word.bgIcon && imgCache[word.bgIcon]) {
        // 计算背景图的尺寸
        const textWidth = ctx.measureText(word.text).width
        clickAreaWidth = Math.max(textWidth * 1.2, word.displaySize * 1.5)
        const imgRatio = imgCache[word.bgIcon].width / imgCache[word.bgIcon].height
        clickAreaHeight = clickAreaWidth / imgRatio
      } else if (word.text === '') { // 对于空文本且没有背景图的单词，设置默认点击区域
        clickAreaWidth = word.displaySize * 1.5
        clickAreaHeight = word.displaySize * 1.5
      } else {
        // 正常文本的点击区域
        clickAreaWidth = ctx.measureText(word.text).width
        clickAreaHeight = word.displaySize * 1.2
      }

      if (Math.abs(clickX - word.screenX) < clickAreaWidth / 2 &&
        Math.abs(clickY - word.screenY) < clickAreaHeight / 2) {
        currentWord = word
        console.log('点击了单词:', word)
        emit('currentWordClick', word)
        break
      }
    }
  })

  canvasRef.value.addEventListener('mouseup', () => {
    isDragging.value = false
    currentWord = null
  })
}

onMounted(() => {
  console.log('onMounted')
  initScreen()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  window.removeEventListener('resize', () => { })
})

defineExpose({
  regenerateCloud,
  resetView,
  addNewWords
})
</script>
<style lang="scss" scoped>
.word-cloud-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}
</style>