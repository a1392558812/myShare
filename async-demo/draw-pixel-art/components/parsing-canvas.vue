<template>
  <div style="display: flex; flex-direction: column; gap: 10px; padding: 10px;">
    <div style="display: flex; gap: 10px; align-items: center;">
      <button style="position: relative; overflow: hidden;">
        <span>导入像素画</span>
        <input type="file" accept="image/*"
          style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0; cursor: pointer;"
          @change="onUploadFile">
      </button>
      <span v-if="fileList.length" style="font-size: 12px; color: #666;">{{ fileList[0].name }}</span>
    </div>

    <template v-if="fileList.length">
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; flex-direction: row; gap: 10px; flex-wrap: wrap;">
          <div>{{ `(${colCount}*${rowCount})` }}</div>
          <div style="display: flex; align-items: center; gap: 5px; padding: 2px 5px; border: 1px solid #000;"
            v-for="(itemKey, index) in ['width', 'height', 'unit']" :key="index">
            <span>{{ itemKey }}</span>
            <input style="width: 60px;" type="number" :min="1" v-model.number="canvasConfig[itemKey]"
              @change="redrawCanvas">
          </div>

          <div v-for="(itemKey, index) in ['bgColor', 'colColor', 'rowColor']" :key="index"
            style="display: flex; align-items: center; gap: 10px; padding: 2px 5px; border: 1px solid #000;">
            <label>canvas-{{ itemKey }}:</label>
            <colorPicker type="color" :modelValue="canvasConfig[itemKey]" :tipsStyle="{ left: '100px' }"
              @update:modelValue="(val) => onConfigColorChange(itemKey, val)" />
          </div>
        </div>

        <div style="display: flex; flex-direction: row; gap: 10px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 5px; padding: 2px 5px; border: 1px solid #000;">
            图片width:<input style="width: 60px;" type="number" :min="1" v-model.number="imageConfig.width"
              @change="redrawCanvas">
          </div>

          <div style="display: flex; align-items: center; gap: 5px; padding: 2px 5px; border: 1px solid #000;">
            图片height:<input style="width: 60px;" type="number" :min="1" v-model.number="imageConfig.height"
              @change="redrawCanvas">
          </div>

          <div style="display: flex; align-items: center; gap: 5px; padding: 2px 5px; border: 1px solid #000;">
            x轴平移:<input style="width: 60px;" type="number" v-model.number="imageConfig.xOffset" @change="redrawCanvas">
          </div>

          <div style="display: flex; align-items: center; gap: 5px; padding: 2px 5px; border: 1px solid #000;">
            y轴平移:<input style="width: 60px;" type="number" v-model.number="imageConfig.yOffset" @change="redrawCanvas">
          </div>

          <div style="display: flex; align-items: center; gap: 5px; padding: 2px 5px; border: 1px solid #000;">
            同比缩放:<input style="width: 60px;" type="number" :min="1" v-model.number="imageConfig.scale"
              @change="setScale">
          </div>
        </div>

        <div style="display: flex; flex-direction: row; gap: 10px; flex-wrap: wrap;">
          <button @click="xCenterImage">x轴居中</button>
          <button @click="yCenterImage">y轴居中</button>
          <button @click="resetImageConfig">初始化图片与canvas</button>
          <button @click="parsingResult" :disabled="isParsing">
            {{ isParsing ? '解析中...' : '解析' }}
          </button>
        </div>
      </div>

      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <details class="data-panel" v-if="result.length">
          <summary style="cursor: pointer; user-select: none;">
            像素数据: ({{ result.length }} 个像素点)
          </summary>
          <div style="display: flex; gap: 6px; margin: 6px 0;">
            <button @click="copyResult">复制 result</button>
            <button @click="exportResult">导出 result.json</button>
          </div>
          <div class="data-content">
            <pre>{{ resultPreview }}</pre>
          </div>
        </details>

        <canvas ref="canvasRef" :width="canvasConfig.width" :height="canvasConfig.height" :style="{
          width: canvasConfig.width + 'px',
          height: canvasConfig.height + 'px',
          border: '1px solid #000',
          flexShrink: 0,
          display: 'block',
        }">
        </canvas>
      </div>
    </template>
    <div v-else style="padding: 10px; border: 1px solid #000;">请先导入像素画</div>
  </div>
</template>

<script setup lang="jsx">
import { ref, reactive, computed, nextTick } from 'vue'
import { colorPicker } from '../../components/color-picker/index.js'

class ImageConfig {
  xOffset = 0
  yOffset = 0
  width = 0
  height = 0
  scale = 1
}

class CanvasConfig {
  width = 600
  height = 600
  unit = 20
  bgColor = 'rgba(255, 255, 255, 1)'
  colColor = 'rgba(196, 196, 196, 1)'
  rowColor = 'rgba(196, 196, 196, 1)'
}

const canvasConfig = reactive(new CanvasConfig())
const imageConfig = reactive(new ImageConfig())

const canvasRef = ref(null)
const fileList = ref([])
const result = ref([])
const isParsing = ref(false)

const rowCount = computed(() => Math.floor((canvasConfig.height / canvasConfig.unit)))
const colCount = computed(() => Math.floor((canvasConfig.width / canvasConfig.unit)))

const currentImage = ref(null)

const resultPreview = computed(() => {
  const MAX_SHOW = 200
  if (result.value.length <= MAX_SHOW) {
    return JSON.stringify(result.value, null, 2)
  }
  const preview = result.value.slice(0, MAX_SHOW)
  return JSON.stringify(preview, null, 2).replace(/\]$/, '') +
    `,\n  // ... 剩余 ${result.value.length - MAX_SHOW} 条省略，请导出查看完整数据\n]`
})

const getCtx = () => {
  const canvas = canvasRef.value
  if (!canvas) return null
  return canvas.getContext('2d', { willReadFrequently: true })
}

const redrawCanvas = async () => {
  await nextTick()
  const ctx = getCtx()
  if (!ctx) return

  const { width, height, unit, bgColor, colColor, rowColor } = canvasConfig

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  if (currentImage.value) {
    ctx.drawImage(
      currentImage.value,
      imageConfig.xOffset,
      imageConfig.yOffset,
      imageConfig.width,
      imageConfig.height
    )
  }

  // 栅格竖线
  ctx.lineWidth = 0.5
  ctx.strokeStyle = colColor
  for (let x = 0; x <= width; x += unit) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // 栅格横线
  ctx.strokeStyle = rowColor
  for (let y = 0; y <= height; y += unit) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('不是图片文件'))
    }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.src = url
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }
  })
}

const onConfigColorChange = (key, val) => {
  canvasConfig[key] = val
  redrawCanvas()
}

const xCenterImage = () => {
  imageConfig.xOffset = Math.round((canvasConfig.width - imageConfig.width) / 2)
  redrawCanvas()
}

const yCenterImage = () => {
  imageConfig.yOffset = Math.round((canvasConfig.height - imageConfig.height) / 2)
  redrawCanvas()
}

const setScale = () => {
  const res = new CanvasConfig()
  canvasConfig.width = currentImage.value.width * imageConfig.scale
  canvasConfig.height = currentImage.value.height * imageConfig.scale
  canvasConfig.unit = res.unit * imageConfig.scale
  imageConfig.width = currentImage.value.width * imageConfig.scale
  imageConfig.height = currentImage.value.height * imageConfig.scale
  redrawCanvas()
}

const resetImageConfig = async () => {
  if (!fileList.value.length) return
  const img = await loadImage(fileList.value[0])
  currentImage.value = img

  const { width, height } = img
  Object.assign(canvasConfig, {
    width,
    height,
  })

  Object.assign(imageConfig, new ImageConfig(), { width, height })

  result.value = []
  await redrawCanvas()
}

const onUploadFile = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  fileList.value = [file]

  try {
    const img = await loadImage(file)
    currentImage.value = img
    const { width, height } = img

    Object.assign(canvasConfig, { width, height })
    Object.assign(imageConfig, new ImageConfig(), { width, height })

    result.value = []
    await redrawCanvas()
  } catch (err) {
    alert(err.message)
  }
}

const parsingResult = async () => {
  const ctx = getCtx()
  if (!ctx) return

  isParsing.value = true
  await nextTick()

  try {
    const { width, height, unit } = canvasConfig
    const cols = Math.floor(width / unit)
    const rows = Math.floor(height / unit)

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    const list = []

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = Math.floor(col * unit + unit / 2)
        const cy = Math.floor(row * unit + unit / 2)

        const pixelIndex = (cy * width + cx) * 4
        const r = data[pixelIndex]
        const g = data[pixelIndex + 1]
        const b = data[pixelIndex + 2]
        const a = +(data[pixelIndex + 3] / 255).toFixed(2)

        list.push([col, row, `rgba(${r},${g},${b},${a})`])
      }
    }

    result.value = list
  } finally {
    isParsing.value = false
  }
}

const copyResult = () => {
  const str = JSON.stringify(result.value)
  if (navigator.clipboard) {
    navigator.clipboard.writeText(str).then(() => alert('已复制到剪贴板！'))
  }
}

const exportResult = () => {
  const str = JSON.stringify(result.value)
  const blob = new Blob([str], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'pixel-art-data.json'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style lang="scss" scoped>
.data-panel {
  width: 420px;
  padding: 10px;
  border: 1px solid #000;
  flex-shrink: 0;

  .data-content {
    height: 320px;
    overflow: auto;
    background: white;
    border: 1px solid #ccc;
    padding: 10px;
    margin-top: 4px;

    pre {
      margin: 0;
      font-size: 12px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>
