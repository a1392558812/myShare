<template>
  <div style="display: flex; flex-direction: column; gap: 10px; padding: 10px;">
    <div style="display: flex; gap: 10px; align-items: center; border: 1px solid #000; padding: 10px;">
      <div style="display: flex; align-items: center; gap: 5px;" v-for="(itemKey, index) in ['width', 'height', 'unit']"
        :key="index">
        <span>{{ itemKey }}</span>
        <input style="width: 50px;" type="number" v-model.number="canvasConfig[itemKey]" @change="redrawCanvas">
      </div>

      <div style="display: flex; align-items: center; gap: 5px;">
        <span>bgColor</span>
        <colorPicker type="color" :modelValue="canvasConfig.bgColor" :tipsStyle="{
          left: '100px'
        }" @update:modelValue="(val) => redrawCanvas('bgColor', val)" />
      </div>

      <div style="display: flex; align-items: center; gap: 5px;">
        <span>FPS</span>
        <input style="width: 60px;" type="number" v-model.number="fps" :min="1" :max="120" :step="1">
      </div>

      <div>
        <button @click="play" :disabled="isPlaying || !frameList.length">播放</button>
        <button @click="pause" :disabled="!isPlaying">暂停</button>
        <span style="margin-left: 10px;">
          帧: {{ frameList.length ? (currentFrameIndex + 1) : 0 }} / {{ frameList.length }}
        </span>
      </div>
    </div>

    <div style="display: flex; gap: 10px;">
      <div
        style="width: 750px; flex-shrink: 0; padding: 10px; border: 1px solid #000; display: flex; flex-direction: column; gap: 10px; overflow: auto;">
        <button @click="addFrame(frameList.length)">增加帧数</button>

        <div v-if="frameList.length" style="display: flex; align-items: center; gap: 5px;">
          复制第
          <input style="width: 50px;" type="number" v-model.number="targetFrameIndex">
          到第
          <input style="width: 50px;" type="number" v-model.number="toTargetFrameIndex">
          帧
          <button @click="copyFrame(targetFrameIndex, toTargetFrameIndex)">复制</button>
        </div>

        <div>
          <div style="display: flex; gap: 10px; align-items: center; margin: 0 0 8px 0;"
            v-for="(item, index) in frameList" :key="index">
            <uploadButton style="flex-shrink: 0;" :index="index">修改当前第{{ index }}帧</uploadButton>
            <button style="flex-shrink: 0;" @click="addFrame(index)">向上插入空白1帧</button>
            <button style="flex-shrink: 0;" @click="addFrame(index + 1)">向下插入空白1帧</button>
            <button style="flex-shrink: 0;" @click="copyFrame(index, index)">复制1帧</button>
            <button style="flex-shrink: 0;" @click="removeFrame(index)">删除当前帧</button>
            <span :title="item && item.length ? JSON.stringify(item) : '当前帧暂无数据'" style="flex-shrink: 0;
              max-width: 200px;
              overflow: hidden;
              word-break: break-all;
              text-overflow: ellipsis;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 1;
              line-clamp: 1;
              display: -webkit-box;" :style="item && item.length ? { textDecoration: 'underline' } : {}">
              {{ item && item.length ? JSON.stringify(item) : '当前帧暂无数据' }}
            </span>
          </div>
        </div>
      </div>

      <canvas ref="canvasRef" :width="canvasConfig.width" :height="canvasConfig.height" :style="{
        width: canvasConfig.width + 'px',
        height: canvasConfig.height + 'px',
        border: '1px solid #000',
        flexShrink: 0,
      }"></canvas>
    </div>

  </div>
</template>
<script setup lang="jsx">
import { reactive, ref, computed, onMounted, watch, nextTick } from "vue";
import { colorPicker } from '../../components/color-picker/index.js'

const uploadButton = (props, context) => {
  return (<button style="position: relative; overflow: hidden;">
    {context.slots.default()}
    <input style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0; cursor: pointer;"
      type="file"
      onChange={(e) => onUploadFile(e, props.index)} />
  </button>)
}

const canvasRef = ref(null)
const targetFrameIndex = ref(0)
const toTargetFrameIndex = ref(0)
const canvasConfig = reactive({
  width: 800,
  height: 800,
  unit: 20,
  bgColor: 'rgba(255, 255, 255, 1)',
})
const frameList = ref([])

// 动画状态
const isPlaying = ref(false)
const currentFrameIndex = ref(0)
const fps = ref(30)
let animationFrameId = null
let lastFrameTime = 0
const frameInterval = computed(() => 1000 / fps.value)

// 获取 canvas 2d context
const getCtx = () => {
  if (!canvasRef.value) return null
  return canvasRef.value.getContext('2d')
}

// 绘制单帧像素数据到画布
// frameData: [[x1, y1, color1], [x2, y2, color2], ...]
const drawFrame = (frameData) => {
  const ctx = getCtx()
  if (!ctx) return

  const { width, height, unit, bgColor } = canvasConfig

  // 清空画布并填充背景色
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  if (!frameData || !frameData.length) return

  // 逐个绘制像素方块
  frameData.forEach(([x, y, color]) => {
    // 边界检查
    if (x < 0 || y < 0 || (x + 1) * unit > width || (y + 1) * unit > height) return

    ctx.fillStyle = color
    ctx.fillRect(x * unit, y * unit, unit, unit)
  })
}

// 重绘画布（当前帧）
const redrawCanvas = (itemKey, val) => {
  if (itemKey && val) {
    canvasConfig[itemKey] = val
  }
  const currentData = frameList.value[currentFrameIndex.value]
  drawFrame(currentData)
}

// requestAnimationFrame 动画循环
const animationLoop = (timestamp) => {
  if (!isPlaying.value) return

  // 时间累积，控制帧率
  if (timestamp - lastFrameTime >= frameInterval.value) {
    lastFrameTime = timestamp

    if (!frameList.value.length) {
      pause()
      return
    }
    // 切换到下一帧，循环
    currentFrameIndex.value = (currentFrameIndex.value + 1) % frameList.value.length
    drawFrame(frameList.value[currentFrameIndex.value])
  }

  animationFrameId = requestAnimationFrame(animationLoop)
}

// 播放动画
const play = () => {
  if (!frameList.value.length || isPlaying.value) return
  isPlaying.value = true
  lastFrameTime = performance.now()
  // 先绘制当前帧
  drawFrame(frameList.value[currentFrameIndex.value])
  // 启动 rAF 循环
  animationFrameId = requestAnimationFrame(animationLoop)
}

// 暂停动画
const pause = () => {
  isPlaying.value = false
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}


// 修改帧数据后重绘
const onUploadFile = (event, index) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    const data = JSON.parse(event.target.result)
    frameList.value[index] = data
    // 如果修改的是当前帧且未在播放，更新画布
    if (index === currentFrameIndex.value && !isPlaying.value) {
      nextTick(() => drawFrame(data))
    }
  }
  reader.readAsText(file)
}

const addFrame = (index) => {
  frameList.value.splice(index, 0, [])
}

const removeFrame = (index) => {
  if (isPlaying.value) pause()
  frameList.value.splice(index, 1)
  // 调整当前帧索引
  if (currentFrameIndex.value >= frameList.value.length) {
    currentFrameIndex.value = Math.max(0, frameList.value.length - 1)
  }
  if (frameList.value.length) {
    nextTick(() => drawFrame(frameList.value[currentFrameIndex.value]))
  } else {
    currentFrameIndex.value = 0
    nextTick(() => drawFrame(null))
  }
}

const copyFrame = (fromIndex, toIndex) => {
  const data = frameList.value[fromIndex]
  frameList.value.splice(toIndex, 0, [...data])
}

// 监听 canvasConfig 变化自动重绘
watch(() => [canvasConfig.width, canvasConfig.height, canvasConfig.unit, canvasConfig.bgColor], () => {
  if (!isPlaying.value) {
    nextTick(() => redrawCanvas())
  }
})

// 初始化
onMounted(() => {
  // 如果有帧数据，绘制第一帧
  if (frameList.value.length) {
    drawFrame(frameList.value[0])
  } else {
    drawFrame(null)
  }
})
</script>
