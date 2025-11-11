<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>简单图片合成</h2>
          <div class="actions">
            <label class="btn">
              上传图片
              <input type="file" multiple accept="image/*" @change="onFilesSelected" />
            </label>
            <button class="btn" @click="downloadImage" :disabled="layers.length === 0">导出PNG</button>
            <button class="btn" @click="openDialog">查看源码</button>
          </div>
        </div>

        <div class="control-group">
          <div class="size-row">
            <div class="control-item">
              <div class="control-label">
                <span>画布宽度</span>
                <span class="value-display">{{ canvasWidth }}</span>
              </div>
              <input type="range" min="300" max="1200" step="10" v-model.number="canvasWidth" />
            </div>
            <div class="control-item">
              <div class="control-label">
                <span>画布高度</span>
                <span class="value-display">{{ canvasHeight }}</span>
              </div>
              <input type="range" min="200" max="800" step="10" v-model.number="canvasHeight" />
            </div>
            <div class="control-item">
              <div class="control-label">
                <span>背景色-{{ bgColor }}</span>
              </div>
              <input type="color" v-model="bgColor" />
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>背景色透明度-{{ (bgColorAlpha * 100).toFixed(2) }}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.0001" v-model.number="bgColorAlpha" />
            </div>
          </div>

          <div class="layers-editor" v-if="layers.length">
            <h3>图层列表</h3>
            <div v-for="(layer, i) in orderedLayers" :key="layer.id" class="layer-row"
              :class="{ active: layer.id === selectedId }" @click="select(layer.id)">
              <div class="layer-row-main">
                <div class="meta">
                  <span class="name">{{ layer.name }}</span>
                  <span class="size">{{ layer.cropW }}×{{ layer.cropH }}</span>
                </div>
                <div class="ops">
                  <button class="btn" @click.stop="bringToFront(layer)">置顶</button>
                  <button class="btn" @click.stop="sendToBack(layer)">置底</button>
                  <button class="btn" @click.stop="moveUp(layer)">上移</button>
                  <button class="btn" @click.stop="moveDown(layer)">下移</button>
                  <button class="btn danger" @click.stop="removeLayer(layer.id)">删除</button>
                </div>
              </div>
              <div>
                设置当前z：
                <input class="btn" v-model.number="layer.z" type="number" />
              </div>
            </div>

            <div class="layer-config" v-if="current">
              <h3>当前图层设置</h3>
              <div class="config-grid">
                <div class="control-item">
                  <div class="control-label">
                    <span>位置 X</span>
                    <span class="value-display">{{ current.x.toFixed(0) }}</span>
                  </div>
                  <input type="range" min="0" :max="canvasWidth" step="1" v-model.number="current.x" />
                </div>

                <div class="control-item">
                  <div class="control-label"><span>位置 Y</span><span class="value-display">{{ current.y.toFixed(0)
                  }}</span></div>
                  <input type="range" min="0" :max="canvasHeight" step="1" v-model.number="current.y" />
                </div>

                <div class="control-item">
                  <div class="control-label">
                    <span>缩放</span>
                    <span class="value-display">{{ current.scale.toFixed(3) }}</span>
                  </div>
                  <input type="range" min="0.001" max="3" step="0.005" v-model.number="current.scale" />
                </div>

                <div class="control-item">
                  <div class="control-label">
                    <span>旋转</span>
                    <span class="value-display">{{ current.rotation.toFixed(0) }}°</span>
                  </div>
                  <input type="range" min="-180" max="180" step="0.1" v-model.number="current.rotation" />
                </div>

                <div class="control-item">
                  <div class="control-label">
                    <span>透明度</span>
                    <span class="value-display">{{ current.opacity.toFixed(2) }}</span>
                  </div>
                  <input type="range" min="0.01" max="1" step="0.01" v-model.number="current.opacity" />
                </div>

                <div class="control-btn-wrap">
                  <button style="margin-right: 1em;" class="btn" @click.stop="setImageWidth">canvas宽度等比占满</button>
                  <button style="margin-right: 1em;" class="btn" @click.stop="setImageHeight">canvas高度等比占满</button>
                  <button style="margin-right: 1em;" class="btn" @click="centerCurrentX">居中-x</button>
                  <button style="margin-right: 1em;" class="btn" @click="centerCurrentY">居中-y</button>
                  <button style="margin-right: 1em;" class="btn" @click="resetCrop">重置裁剪</button>
                </div>

                <div class="control-item-wrap">
                  <h4>宽w-裁剪设置</h4>
                  <div class="control-item">
                    <div class="control-label">
                      <span>从左侧开始裁剪</span>
                      <span class="value-display">{{ current.cropX }}</span>
                    </div>
                    <input type="range" :min="0" :max="current.naturalW" step="1" v-model.number="current.cropX" />
                  </div>

                  <div class="control-item">
                    <div class="control-label">
                      <span>从右侧开始裁剪</span>
                      <span class="value-display">{{ current.cropW }}</span>
                    </div>
                    <input type="range" :min="10" :max="current.naturalW - current.cropX" step="1"
                      v-model.number="current.cropW" />
                  </div>
                </div>

                <div class="control-item-wrap">
                  <h4>高h-裁剪设置</h4>
                  <div class="control-item">
                    <div class="control-label">
                      <span>从上方开始裁剪高</span>
                      <span class="value-display">{{ current.cropY }}</span>
                    </div>
                    <input type="range" :min="0" :max="current.naturalH" step="1" v-model.number="current.cropY" />
                  </div>

                  <div class="control-item">
                    <div class="control-label"><span>从下方开始裁剪高</span><span class="value-display">{{ current.cropH
                    }}</span>
                    </div>
                    <input type="range" :min="10" :max="current.naturalH - current.cropY" step="1"
                      v-model.number="current.cropH" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <h2>预览</h2>
        <div class="preview-container">
          <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight" @mousedown="onCanvasMouseDown"
            @mousemove="onCanvasMouseMove" @mouseup="onCanvasMouseUp" @mouseleave="onCanvasMouseUp"
            @wheel.prevent="onCanvasWheel"></canvas>
          <div class="hint-bar">
            <span class="page-indicator">图层：{{ layers.length }}，选中：{{ current ? current.name : '无' }}</span>
            <button class="btn" @click="clearAll" :disabled="layers.length === 0">清空</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})
const canvasRef = ref(null)
const ctxRef = ref(null)

const canvasWidth = ref(800)
const canvasHeight = ref(500)
const bgColor = ref('#ffffff')
const bgColorAlpha = ref(1)

let idSeq = 1
const layers = ref([])
const selectedId = ref(null)
const current = computed(() => layers.value.find(l => l.id === selectedId.value) || null)
const orderedLayers = computed(() => [...layers.value].sort((a, b) => a.z - b.z))

/**
 * 将 hex 颜色转换为 rgba 颜色
 * @param {string} hexColor - 十六进制颜色字符串（支持格式：#fff、fff、#ffffff、ffffff）
 * @param {number} alpha - 透明度（0~1 之间的数值，0 完全透明，1 完全不透明）
 * @returns {string} 转换后的 rgba 颜色字符串（如 "rgba(255, 255, 255, 0.5)"）
 * @throws {Error} 输入格式或数值无效时抛出错误
 */
const hexToRgba = (hexColor, alpha = 1) => {
  const hexRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  const match = hexColor.match(hexRegex);

  if (!match) {
    throw new Error('无效的 hex 颜色格式，请使用 3位或6位十六进制（如 #fff、#ffffff、fff、ffffff）');
  }

  let hex = match[1].toLowerCase();

  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // 拆分 R、G、B 分量（6位 hex 分别对应 R(前2位)、G(中间2位)、B(后2位)）
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const isValidComponent = (value) => value >= 0 && value <= 255;
  if (!isValidComponent(r) || !isValidComponent(g) || !isValidComponent(b)) {
    throw new Error('无效的 hex 颜色值，分量必须在 00~ff 之间');
  }

  if (typeof alpha !== 'number' || alpha < 0 || alpha > 1) {
    throw new Error('透明度必须是 0~1 之间的数字');
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const computedBgColor = computed(() => {
  return hexToRgba(bgColor.value, +bgColorAlpha.value)
})

const select = (id) => {
  selectedId.value = id
}

const addImageLayer = (img, name) => {
  const layer = {
    id: idSeq++,
    name,
    img,
    naturalW: img.naturalWidth,
    naturalH: img.naturalHeight,
    x: canvasWidth.value / 2,
    y: canvasHeight.value / 2,
    scale: 1,
    rotation: 0,
    opacity: 1,
    cropX: 0,
    cropY: 0,
    cropW: img.naturalWidth,
    cropH: img.naturalHeight,
    z: layers.value.length,
  }
  layers.value.push(layer)
  selectedId.value = layer.id
}

const onFilesSelected = (e) => {
  const files = Array.from(e.target.files || [])
  files.forEach(file => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      addImageLayer(img, file.name)
      URL.revokeObjectURL(url)
      draw()
    }
    img.src = url
  })
  e.target.value = ''
}

const clearAll = () => {
  layers.value = [];
  selectedId.value = null; draw()
}

const bringToFront = (layer) => {
  const maxZ = Math.max(...layers.value.map(l => l.z))
  layer.z = maxZ + 1
}
const sendToBack = (layer) => {
  const minZ = Math.min(...layers.value.map(l => l.z))
  layer.z = minZ - 1
}
const moveUp = (layer) => {
  layer.z += 1
}
const moveDown = (layer) => {
  layer.z -= 1
}

const setImageWidth = () => {
  if (!current.value) return;
  const w = current.value.cropW || 1; // 避免÷ 0
  const targetScale = canvasWidth.value / w;
  current.value.scale = targetScale;
  draw();
}
const setImageHeight = () => {
  if (!current.value) return;
  const h = current.value.cropH || 1;
  const targetScale = canvasHeight.value / h;
  current.value.scale = targetScale;
  draw();
}
const removeLayer = (id) => {
  layers.value = layers.value.filter(l => l.id !== id);
  if (selectedId.value === id) selectedId.value = null;
  draw()
}

const centerCurrentX = () => {
  if (current.value) {
    current.value.x = canvasWidth.value / 2;
  }
}

const centerCurrentY = () => {
  if (current.value) {
    current.value.y = canvasHeight.value / 2
  }
}
const resetCrop = () => {
  if (current.value) {
    current.value.cropX = 0;
    current.value.cropY = 0;
    current.value.cropW = current.value.naturalW;
    current.value.cropH = current.value.naturalH
  }
}

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = ctxRef.value || (ctxRef.value = canvas.getContext('2d'))
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  ctx.fillStyle = computedBgColor.value
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value)

  // 按 z 顺序绘制
  const list = orderedLayers.value
  list.forEach(layer => {
    const { img, x, y, scale, rotation, opacity, cropX, cropY, cropW, cropH } = layer
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation * Math.PI / 180)
    ctx.scale(scale, scale)
    ctx.globalAlpha = opacity
    ctx.drawImage(img, cropX, cropY, cropW, cropH, -cropW / 2, -cropH / 2, cropW, cropH)
    ctx.restore()
  })
}

const dragging = ref(false)
const lastPos = ref({ x: 0, y: 0 })

const toLocal = (layer, gx, gy) => {
  const dx = gx - layer.x
  const dy = gy - layer.y
  const rad = -layer.rotation * Math.PI / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  const rx = dx * cos - dy * sin
  const ry = dx * sin + dy * cos
  return { x: rx / layer.scale, y: ry / layer.scale }
}
const hitTest = (layer, gx, gy) => {
  const p = toLocal(layer, gx, gy)
  return Math.abs(p.x) <= layer.cropW / 2 && Math.abs(p.y) <= layer.cropH / 2
}

const pickTopLayer = (gx, gy) => {
  const list = [...layers.value].sort((a, b) => b.z - a.z)
  return list.find(l => hitTest(l, gx, gy)) || null
}

const onCanvasMouseDown = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  const gx = e.clientX - rect.left
  const gy = e.clientY - rect.top
  const target = pickTopLayer(gx, gy)
  if (target) {
    select(target.id)
    dragging.value = true
    lastPos.value = { x: gx, y: gy }
  }
}
const onCanvasMouseMove = (e) => {
  if (!dragging.value || !current.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const gx = e.clientX - rect.left
  const gy = e.clientY - rect.top
  const dx = gx - lastPos.value.x
  const dy = gy - lastPos.value.y
  current.value.x += dx
  current.value.y += dy
  lastPos.value = { x: gx, y: gy }
  draw()
}
const onCanvasMouseUp = () => { dragging.value = false }

const onCanvasWheel = (e) => {
  if (!current.value) return
  const delta = Math.sign(e.deltaY)
  current.value.scale = Math.max(0.001, Math.min(3, current.value.scale * (delta > 0 ? 0.95 : 1.05)))
  draw()
}

watch([layers, canvasWidth, canvasHeight, computedBgColor], draw, { deep: true })
onMounted(draw)

const downloadImage = () => {
  const canvas = canvasRef.value
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = 'awen-canvas.png'
  a.click()
}
</script>

<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.app-container {
  height: calc(100vh - $spacing-md * 2);
  background-color: $light-gray;
  padding: $spacing-md;
  min-width: 1200px;
  margin: 0 auto;

  .main-content {
    width: calc(100% - $spacing-md * 2);
    display: flex;
    gap: $spacing-lg;
    height: 100%;

    .control-panel {
      width: 700px;
      background: #fff;
      border-radius: $border-radius;
      padding: $spacing-md;
      box-shadow: $shadow-light;
      overflow: auto;
      flex-shrink: 0;

      .header-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-md;

        .actions {
          display: flex;
          gap: $spacing-sm;
        }

        input[type='file'] {
          display: none;
        }
      }

      .control-group {
        display: flex;
        flex-direction: column;
        gap: $spacing-md;

        .size-row {
          display: flex;
          gap: $spacing-sm;
          align-items: center;
        }
      }

      .control-btn-wrap {
        grid-column: span 2 / span 2;
        display: flex;
        flex-direction: row;
        gap: $spacing-xs;
      }

      .control-item-wrap {
        grid-column: span 2 / span 2;
        padding: $spacing-md;
        border: 1px dashed $medium-gray;
        border-radius: $border-radius;
        display: flex;
        flex-direction: column;
        gap: $spacing-xs;
      }

      .control-item {
        display: flex;
        flex-direction: column;
        gap: $spacing-xs;

        .control-label {
          display: flex;
          justify-content: space-between;
          font-size: 14px;

          span:first-child {
            font-weight: 500;
            color: $dark-gray;
          }

          .value-display {
            color: $primary-color;
            font-family: monospace;
            font-size: 13px;
          }
        }
      }

      .layers-editor {
        display: flex;
        flex-direction: column;
        gap: $spacing-sm;

        .layer-row {
          padding: $spacing-sm;
          border: 1px dashed $light-gray;
          border-radius: $border-radius;
          background: rgba(255, 255, 255, 0.6);

          .layer-row-main {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .meta {
              display: flex;
              gap: $spacing-sm;
              align-items: center;
            }

            .name {
              color: $dark-gray;
            }

            .size {
              color: $medium-gray;
              font-family: monospace;
            }

            .ops {
              display: flex;
              gap: $spacing-xs;
            }
          }
        }

        .layer-row.active {
          border-color: $secondary-color;
          box-shadow: 0 0 0 3px rgba($secondary-color, .15);
        }
      }

      .layer-config {
        display: flex;
        flex-direction: column;
        gap: $spacing-sm;
      }

      .config-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: $spacing-sm;
      }
    }

    h2 {
      margin: 0;
      color: $dark-gray;
      font-size: 20px;
      font-weight: 600;

    }

    h3 {
      margin: 0;
      color: $dark-gray;
      font-size: 16px;
      font-weight: 600;
    }

    h4 {
      margin: 0;
      color: $dark-gray;
      font-size: 14px;
      font-weight: 600;
    }

    .preview-panel {
      width: calc(100% - 700px - $spacing-lg);
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: $spacing-lg;

      h2 {
        flex-shrink: 0;
        width: 50%;
      }

      .preview-container {
        width: calc(100% - $spacing-md * 2);
        flex: 1;
        flex-shrink: 0;
        background: rgba(0, 0, 0, 0.8);
        border-radius: $border-radius;
        padding: $spacing-md;
        box-shadow: $shadow-light;
        gap: $spacing-lg;
        overflow: auto;

        canvas {
          background: repeating-conic-gradient(from 45deg, #f5f5f5 0deg 90deg, #ffffff 90deg 180deg);
          box-shadow: $shadow-light;
        }

        .hint-bar {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
        }

        .page-indicator {
          font-family: monospace;
          color: $light-gray;
        }
      }
    }

    .btn {
      border: none;
      border-radius: $border-radius;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 14px;
      background: $light-gray;
      color: $dark-gray;

      &:hover {
        background: $medium-gray;
      }
    }

    .btn.danger {
      background: #ef4444;
      color: #fff;
    }
  }
}
</style>
