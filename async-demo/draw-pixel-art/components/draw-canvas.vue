<template>
  <div class="draw-canvas">
    <!-- 配置区域 -->
    <div style="display: flex; flex-direction: column; gap: 10px; padding: 10px; border: 1px solid #000;">
      <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 10px; align-items: center;">
        <div v-for="(itemKey, index) in ['width', 'height', 'unit']" :key="index"
          style="display: flex; align-items: center; gap: 10px;">
          <label>{{ itemKey }}:</label>
          <input style="width: 50px;" :min="0" type="number" v-model.number="config[itemKey]" @change="redrawCanvas">
        </div>
        <div v-for="(itemKey, index) in ['bgColor', 'colColor', 'rowColor']" :key="index"
          style="display: flex; align-items: center; gap: 10px;">
          <label>{{ itemKey }}:</label>
          <colorPicker type="color" :modelValue="config[itemKey]" :tipsStyle="{
            left: '100px'
          }" @update:modelValue="(val) => redrawCanvas(itemKey, val)" />
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button @click="saveConfig">保存绘制与配置</button>
        <button @click="initSaveConfig">还原初始化配置</button>
        <button @click="clearCanvas">清空画布</button>
        <button style="position: relative; overflow: hidden;">
          导入数据
          <input :style="{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            opacity: 0,
            cursor: 'pointer',
          }" type="file" @change="handleFileChange">
        </button>
        <button @click="exportData">导出数据</button>
        <button @click="copyData">复制数据</button>
      </div>
    </div>

    <div style="display: flex; gap: 10px;">
      <!-- 工具栏 -->
      <div class="tool-panel">
        <!-- 模式切换 -->
        <div style="display: flex; gap: 10px;">
          <button :class="{ active: !isEraseMode }" @click="isEraseMode = false">
            绘制模式
          </button>
          <button :class="{ active: isEraseMode }" @click="isEraseMode = true">
            清除模式
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <template v-for="(itemKey, index) in Object.keys(ifOverflow)" :key="index">
            <div>
              <div>{{ itemKey }}轴溢出像素点：</div>
              <details v-if="ifOverflow[itemKey].length">
                <summary style="cursor: pointer;">点击查看详情</summary>
                <button style="padding: 0; margin: 0; cursor: pointer; margin-right: 10px;"
                  v-if="ifOverflow[itemKey].length" @click="removeAllPixelClick(ifOverflow[itemKey])">删除所有溢出⛔</button>
                <button style="padding: 0; margin: 0; cursor: pointer;" v-for="(item, itemIndex) in ifOverflow[itemKey]"
                  :key="`${index}-${itemIndex}`" @click="removePixelClick(item.index)">
                  【{{ item.x }}，{{ item.y }}】⛔
                </button>
              </details>
              <span v-else>无</span>
            </div>
          </template>
        </div>

        <div>当前模式：{{ isEraseMode ? '清除模式' : '绘制模式' }}-{{
          `(${colCount}*${rowCount})` }}</div>

        <!-- 颜色选择面板 -->
        <div
          :style="[{ display: 'flex', flexDirection: 'column', gap: '10px' }, { opacity: isEraseMode ? 0.5 : 1, pointerEvents: isEraseMode ? 'none' : 'auto' }]">
          <div>颜色面板</div>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;" v-if="colorPalette.length">
            <div style="display: flex; align-items: center; justify-content: center; gap: 2px;"
              v-for="(color, index) in colorPalette" :key="color">
              <div style="width: 20px; height: 20px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;"
                :style="{ backgroundColor: color }" @click="selectColor(color)">
              </div>
              <button @click="removeColor(color)">x</button>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <label>自定义颜色:</label>
            <colorPicker type="color" v-model="customColor" :tipsStyle="{
              left: '100px'
            }" />
            <button @click="addCustomColor">添加</button>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <label>当前颜色:</label>
            <div :style="[{
              width: '20px',
              height: '20px',
              border: '2px solid #ddd',
              borderRadius: '4px',
            }, { backgroundColor: selectedColor }]"></div>
            <span>{{ selectedColor }}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;" v-for="(itemKey, index) in Object.keys(offset)"
            :key="index">
            <label>{{ itemKey }}整体加:</label>
            <input style="width: 50px" type="number" :min="0" v-model.number="offset[itemKey]" />
            <button @click="onOffsetChange(itemKey, index, 1)">+</button>
            <button @click="onOffsetChange(itemKey, index, -1)">-</button>
          </div>
        </div>
      </div>

      <!-- 画布区域 -->
      <div class="canvas-container">
        <canvas ref="canvasRef" :width="config.width + AXIS_MARGIN" :height="config.height + AXIS_MARGIN" :style="{
          width: `${config.width + AXIS_MARGIN}px`,
          height: `${config.height + AXIS_MARGIN}px`,
          border: '1px solid #000',
          cursor: isEraseMode ? 'pointer' : 'crosshair',
          flexShrink: 0,
        }" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"></canvas>
      </div>
    </div>

    <!-- 数据展示区域 -->
    <details class="data-panel">
      <summary style="cursor: pointer;">像素数据: ({{ result.length }} 个像素点)</summary>
      <div class="data-content">
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
    </details>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted, watch, nextTick } from "vue";
import { colorPicker } from '../../components/color-picker/index.js'

const canvasRef = ref(null)
const ctx = ref(null)
const AXIS_MARGIN = 20 // 坐标轴边距（px），左上角起点偏移

const CATCH_CONFIG = 'CATCH_CONFIG'

class InitConfig {
  config = {
    width: 600,
    height: 600,
    unit: 20,
    bgColor: 'rgba(255, 255, 255, 1)',
    colColor: 'rgba(196, 196, 196, 1)',
    rowColor: 'rgba(196, 196, 196, 1)',
  }
  colorPalette = ['rgba(255, 0, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 0, 255, 1)']
  selectedColor = 'rgba(255, 0, 0, 1)'
  customColor = 'rgba(255, 0, 0, 1)'
  offset = {
    x: 1,
    y: 1,
  }
  result = []
}

const initConfig = new InitConfig()

const catchConfig = JSON.parse(localStorage.getItem(CATCH_CONFIG)) || initConfig

const config = reactive(catchConfig.config || initConfig.config)
const colorPalette = ref(catchConfig.colorPalette || initConfig.colorPalette)
const selectedColor = ref(catchConfig.selectedColor || initConfig.selectedColor)
const customColor = ref(catchConfig.customColor || initConfig.customColor)
const result = ref(catchConfig.result || initConfig.result)
const offset = reactive(catchConfig.offset || initConfig.offset)

const isDrawing = ref(false)
const lastDrawnPos = ref(null)
const isEraseMode = ref(false)

const rowCount = computed(() => Math.floor((config.height / config.unit)))
const colCount = computed(() => Math.floor((config.width / config.unit)))

const ifOverflow = computed(() => {
  const res = {
    x: [],
    y: [],
    xy: [],
  }
  for (let i = result.value.length - 1; i >= 0; i--) {
    const ifOverflowX = (result.value[i][0] + 1) > colCount.value || result.value[i][0] < 0
    const ifOverflowY = (result.value[i][1] + 1) > rowCount.value || result.value[i][1] < 0
    const ifOverflowXY = ifOverflowX && ifOverflowY
    if (ifOverflowX) {
      res.x.push({
        x: result.value[i][0],
        y: result.value[i][1],
        index: i
      })
    }

    if (ifOverflowY) {
      res.y.push({
        x: result.value[i][0],
        y: result.value[i][1],
        index: i
      })
    }

    if (ifOverflowXY) {
      res.xy.push({
        x: result.value[i][0],
        y: result.value[i][1],
        index: i
      })
    }
  }
  return res
})

// 初始化画布
onMounted(() => {
  initCanvas()
})

// 初始化画布
const initCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  ctx.value = canvas.getContext('2d')
  drawAxis()
  drawGrid()
  redrawPixels()
}

// 绘制坐标轴和刻度
const drawAxis = () => {
  const context = ctx.value
  if (!context) return

  const unit = config.unit
  const totalCols = Math.floor(config.width / unit)
  const totalRows = Math.floor(config.height / unit)

  // 填充边距区域背景
  context.fillStyle = '#f0f0f0'
  context.fillRect(0, 0, config.width + AXIS_MARGIN, AXIS_MARGIN) // 顶部边距
  context.fillRect(0, 0, AXIS_MARGIN, config.height + AXIS_MARGIN) // 左侧边距

  // 左上角交汇区填充稍深色
  context.fillStyle = '#e0e0e0'
  context.fillRect(0, 0, AXIS_MARGIN, AXIS_MARGIN)

  // 坐标轴样式
  context.fillStyle = '#333'
  context.font = '10px monospace'
  context.textAlign = 'center'
  context.textBaseline = 'top'

  // X 轴刻度（顶部）
  for (let col = 0; col < totalCols; col++) {
    const x = AXIS_MARGIN + col * unit + unit / 2
    // 每隔一定数量显示刻度数字，避免太密
    const interval = unit >= 20 ? 1 : (unit >= 10 ? 2 : 5)
    if (col % interval === 0) {
      context.fillText(`${col}`, x, 2)
    }
    // 刻度短线
    context.strokeStyle = '#999'
    context.lineWidth = 0.5
    context.beginPath()
    context.moveTo(x, AXIS_MARGIN - 5)
    context.lineTo(x, AXIS_MARGIN)
    context.stroke()
  }

  // Y 轴刻度（左侧）
  context.textAlign = 'right'
  context.textBaseline = 'middle'
  for (let row = 0; row < totalRows; row++) {
    const y = AXIS_MARGIN + row * unit + unit / 2
    const interval = unit >= 20 ? 1 : (unit >= 10 ? 2 : 5)
    if (row % interval === 0) {
      context.fillText(`${row}`, AXIS_MARGIN - 4, y)
    }
    // 刻度短线
    context.strokeStyle = '#999'
    context.lineWidth = 0.5
    context.beginPath()
    context.moveTo(AXIS_MARGIN - 5, y)
    context.lineTo(AXIS_MARGIN, y)
    context.stroke()
  }

  // 绘制坐标轴边框线
  context.strokeStyle = '#333'
  context.lineWidth = 1
  // X 轴主线
  context.beginPath()
  context.moveTo(AXIS_MARGIN, AXIS_MARGIN)
  context.lineTo(AXIS_MARGIN + config.width, AXIS_MARGIN)
  context.stroke()
  // Y 轴主线
  context.beginPath()
  context.moveTo(AXIS_MARGIN, AXIS_MARGIN)
  context.lineTo(AXIS_MARGIN, AXIS_MARGIN + config.height)
  context.stroke()
}

// 绘制网格
const drawGrid = () => {
  const canvas = canvasRef.value
  const context = ctx.value
  if (!canvas || !context) return

  // 填充网格区域背景色（从 AXIS_MARGIN 偏移开始）
  context.fillStyle = config.bgColor
  context.fillRect(AXIS_MARGIN, AXIS_MARGIN, config.width, config.height)

  // 绘制网格线 - 竖线
  context.strokeStyle = config.colColor
  context.lineWidth = 0.5
  for (let x = 0; x <= config.width; x += config.unit) {
    context.beginPath()
    context.moveTo(AXIS_MARGIN + x, AXIS_MARGIN)
    context.lineTo(AXIS_MARGIN + x, AXIS_MARGIN + config.height)
    context.stroke()
  }

  // 绘制网格线 - 横线
  context.strokeStyle = config.rowColor
  for (let y = 0; y <= config.height; y += config.unit) {
    context.beginPath()
    context.moveTo(AXIS_MARGIN, AXIS_MARGIN + y)
    context.lineTo(AXIS_MARGIN + config.width, AXIS_MARGIN + y)
    context.stroke()
  }

  // 重绘坐标轴（网格线可能覆盖了轴线）
  context.strokeStyle = '#333'
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(AXIS_MARGIN, AXIS_MARGIN)
  context.lineTo(AXIS_MARGIN + config.width, AXIS_MARGIN)
  context.stroke()
  context.beginPath()
  context.moveTo(AXIS_MARGIN, AXIS_MARGIN)
  context.lineTo(AXIS_MARGIN, AXIS_MARGIN + config.height)
  context.stroke()
}

// 重绘画布
const redrawCanvas = (itemKey, val) => {
  if (itemKey && val) {
    config[itemKey] = val
  }
  drawAxis()
  drawGrid()
  redrawPixels()
}

// 重绘所有像素
const redrawPixels = () => {
  result.value.forEach(([x, y, color]) => {
    drawPixel(x, y, color)
  })
}

// 绘制单个像素
const drawPixel = (x, y, color) => {
  const context = ctx.value
  if (!context) return

  const px = AXIS_MARGIN + x * config.unit
  const py = AXIS_MARGIN + y * config.unit

  // 裁剪到网格区域，防止溢出像素遮挡坐标轴
  context.save()
  context.beginPath()
  context.rect(AXIS_MARGIN, AXIS_MARGIN, config.width, config.height)
  context.clip()

  // 先清除该位置的内容（避免透明度叠加）
  context.clearRect(px, py, config.unit, config.unit)

  // 如果背景不是透明的，先填充背景色
  if (config.bgColor !== 'transparent') {
    context.fillStyle = config.bgColor
    context.fillRect(px, py, config.unit, config.unit)
  }

  // 绘制新颜色
  context.fillStyle = color
  context.fillRect(px, py, config.unit, config.unit)

  context.restore()
}

// 选择颜色
const selectColor = (color) => {
  selectedColor.value = color
}

const removeColor = (color) => {
  const index = colorPalette.value.findIndex(c => c === color)
  if (index !== -1) {
    colorPalette.value.splice(index, 1)
  }
}

const onOffsetChange = (itemKey, itemIndex, val) => {
  if (!offset[itemKey] || offset[itemKey] === 0) return
  result.value.forEach((item, index) => {
    result.value[index][itemIndex] = result.value[index][itemIndex] + offset[itemKey] * val
  })
  redrawCanvas()
}

// 添加自定义颜色
const addCustomColor = () => {
  if (!colorPalette.value.includes(customColor.value)) {
    colorPalette.value.push(customColor.value)
  }
}

const removePixel = (existingIndex) => {
  result.value.splice(existingIndex, 1)
  redrawCanvas()
}

const removePixelClick = (existingIndex) => {
  if (confirm('确认删除该像素？')) {
    removePixel(existingIndex)
  }
}

const removeAllPixelClick = (list) => {
  if (confirm('确认删除当前轴所有溢出像素？')) {
    list.forEach(item => {
      result.value.splice(item.index, 1)
    })
    redrawCanvas()
  }
}

// 应用像素操作（绘制或清除）
const applyPixel = (x, y) => {
  // 检查是否在画布范围内
  if (x < 0 || y < 0 || x >= config.width / config.unit || y >= config.height / config.unit) {
    return
  }

  // 检查是否已存在该位置的像素
  const existingIndex = result.value.findIndex(([px, py]) => px === x && py === y)

  if (isEraseMode.value) {
    // 清除模式：删除像素
    if (existingIndex !== -1) {
      removePixel(existingIndex)
    }
  } else {
    // 绘制模式：添加或更新像素
    if (existingIndex !== -1) {
      // 更新现有像素的颜色
      result.value[existingIndex] = [x, y, selectedColor.value]
      drawPixel(x, y, selectedColor.value)
    } else {
      // 添加新像素
      result.value.push([x, y, selectedColor.value])
      drawPixel(x, y, selectedColor.value)
    }
  }
}

// 处理鼠标按下
const handleMouseDown = (event) => {
  isDrawing.value = true
  lastDrawnPos.value = null

  const rect = canvasRef.value.getBoundingClientRect()
  const x = Math.floor((event.clientX - rect.left - AXIS_MARGIN) / config.unit)
  const y = Math.floor((event.clientY - rect.top - AXIS_MARGIN) / config.unit)

  // 应用像素操作
  applyPixel(x, y)
  lastDrawnPos.value = `${x},${y}`
}

// 处理鼠标移动
const handleMouseMove = (event) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = Math.floor((event.clientX - rect.left - AXIS_MARGIN) / config.unit)
  const y = Math.floor((event.clientY - rect.top - AXIS_MARGIN) / config.unit)

  // 如果正在拖拽绘制
  if (isDrawing.value) {
    const currentPos = `${x},${y}`
    if (currentPos !== lastDrawnPos.value) {
      applyPixel(x, y)
      lastDrawnPos.value = currentPos
    }
  }
}

// 处理鼠标松开
const handleMouseUp = () => {
  isDrawing.value = false
  lastDrawnPos.value = null
}

const saveConfig = () => {
  localStorage.setItem(CATCH_CONFIG, JSON.stringify({
    config,
    offset,
    colorPalette: colorPalette.value,
    selectedColor: selectedColor.value,
    customColor: customColor.value,
    result: result.value,
  }))
  alert('保存成功！')
}

const initSaveConfig = () => {
  if (confirm('是否初始化配置？')) {
    const initConfigRes = new InitConfig()
    Object.assign(config, initConfigRes.config)
    Object.assign(offset, initConfigRes.offset)
    colorPalette.value = initConfigRes.colorPalette
    selectedColor.value = initConfigRes.selectedColor
    customColor.value = initConfigRes.customColor
    saveConfig()
    redrawCanvas()
  }
}

// 清空画布
const clearCanvas = () => {
  if (confirm('是否清空画布？')) {
    result.value = []
    drawGrid()
  }
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    const data = JSON.parse(event.target.result)
    result.value = data
    redrawCanvas()
  }
  reader.readAsText(file)
}

// 导出数据
const exportData = () => {
  const dataStr = JSON.stringify(result.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pixel-art-data.json'
  link.click()
  URL.revokeObjectURL(url)
}

// 复制数据
const copyData = () => {
  const dataStr = JSON.stringify(result.value)
  navigator.clipboard.writeText(dataStr).then(() => {
    alert('数据已复制到剪贴板！')
  })
}

// 监听配置变化
watch(() => [config.width, config.height, config.unit], () => {
  redrawCanvas()
})
</script>

<style scoped lang="scss">
.draw-canvas {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;

  .tool-panel {
    width: 400px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid #000;
  }

  .canvas-container {
    overflow: auto;
    border: 1px solid #000;
    background: #eee;
    border-radius: 4px;
    padding: 10px;
  }
}

.data-panel {
  padding: 10px;
  border: 1px solid #000;

  .data-content {
    height: 300px;
    overflow: auto;
    background: white;
    border: 1px solid #000;
    padding: 10px;
    margin-top: 10px;

    pre {
      margin: 0;
      font-size: 12px;
      line-height: 1.4;
    }
  }
}
</style>
