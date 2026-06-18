<template>
  <div class="ball-rotate-page">
    <app-container>
      <layout-com title="球体控制" type="panel" style="width: 400px; min-width: 400px;"
        :addLayerBtnList="[{ label: '显示源码', callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }) }]">
        <control-item label="球半径:" inputType="range" :modelValue="config.radius"
          :slotProps="{ min: 100, max: 400, step: 1 }" @update:modelValue="v => config.radius = +v" />

        <control-item v-for="(item, index) in [
          { label: 'x', value: 'autoSpeedX' },
          { label: 'y', value: 'autoSpeedY' },
          { label: 'z', value: 'autoSpeedZ' },
        ]" :key="index" :label="`${item.label}轴转速:`" :modelValue="config[item.value]">
          <div style="display: flex; flex-direction: row; gap: 6px; align-items: center;">
            <inputCom style="flex: 1;" type="range" v-model="config[item.value]" :min="-2" :max="2" :step="0.001" />
            <customBtnCom style="flex-shrink: 0;" @click="config[item.value] = 0">归零</customBtnCom>
          </div>
        </control-item>

        <control-item label="节点数量:" inputType="range" :modelValue="config.count"
          :slotProps="{ min: 3, max: 60, step: 1 }" @update:modelValue="v => config.count = +v" />

        <control-item label="图片尺寸:" inputType="range" :modelValue="config.imgSize"
          :slotProps="{ min: 30, max: 120, step: 1 }" @update:modelValue="v => config.imgSize = +v" />

        <control-item label="自动旋转:" inputType="checkbox" :modelValue="config.autoRotate"
          @update:modelValue="v => config.autoRotate = v" />

        <control-item label="景深效果:" inputType="checkbox" :modelValue="config.depthEffect"
          @update:modelValue="v => config.depthEffect = v" />

        <control-item label="法线偏移角:" inputType="range" :modelValue="config.tiltOffset"
          :slotProps="{ min: -180, max: 180, step: 1 }" @update:modelValue="v => config.tiltOffset = +v" />

        <control-item label="两极避让:" inputType="range" :modelValue="config.polarAngle"
          :slotProps="{ min: -180, max: 180, step: 1 }" @update:modelValue="v => config.polarAngle = +v" />

        <control-item label="添加图片:">
          <div style="display: flex; flex-direction: row; gap: 6px;">
            <inputCom type="text" v-model="newImgUrl" placeholder="输入图片 URL..." />
            <customBtnCom style="flex-shrink: 0;" @click="addImage">添加</customBtnCom>
            <input ref="fileInputRef" type="file" accept="image/*" multiple style="display: none"
              @change="onFileChange" />
            <customBtnCom style="width:100%" @click="fileInputRef.click()">
              上传本地图片
            </customBtnCom>
          </div>
        </control-item>

        <control-item :label="`当前图片(${images.length}):`" :modelValue="`${images.length}`">
          <div class="img-list">
            <div class="img-list-item" v-for="(img, i) in images" :key="img.id">
              <img :src="img.src" class="img-thumb" @error="onThumbError" />
              <span class="img-label overflow-ellipsis-1">{{ img.label }}</span>
              <button class="btn-del" @click="removeImage(i)" title="删除">✕</button>
            </div>
            <div v-if="!images.length" class="empty-tip">暂无图片，请添加</div>
          </div>
        </control-item>
      </layout-com>

      <layout-com title="Fibonacci 球面分布" type="preview" style="flex:1; min-width: 500px;">
        <template #preview>
          <BallScene :radius="config.radius" :autoSpeedX="config.autoSpeedX" :autoSpeedY="config.autoSpeedY"
            :autoSpeedZ="config.autoSpeedZ" :count="config.count" :imgSize="config.imgSize"
            :autoRotate="config.autoRotate" :depthEffect="config.depthEffect" :tiltOffset="config.tiltOffset"
            :polarAngle="config.polarAngle" :images="images" @nodeClick="onNodeClick" />
        </template>

        <template #code>
          <codeCopyContent :code="generateCodeExample" title="使用示例" />
          <codeCopyContent :code="whatIWantSay" title="补充" />
        </template>
      </layout-com>
    </app-container>

    <div v-if="preview.visible" class="preview-overlay" @click="closePreview">
      <div class="preview-box" @click.stop>
        <img :src="preview.src" class="preview-img" />
        <button class="preview-close" @click="closePreview">✕</button>
        <div class="preview-caption">{{ preview.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import {
  inputCom,
  customBtnCom,
  controlItem,
  layoutCom,
  codeCopyContent,
  appContainer
} from '../components/form-control/index.vue'
import BallScene from './components/index.vue'

import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const DEFAULT_IMAGES = Array.from({ length: 16 }, (_, i) => ({
  id: `default-${i}`,
  src: `https://picsum.photos/seed/${i + 10}/200/200`,
  label: `图片 ${i + 1}`,
}))

const config = reactive({
  radius: 200,
  autoSpeedX: 0,
  autoSpeedY: 0.25,
  autoSpeedZ: 0,
  count: 16,
  imgSize: 60,
  autoRotate: true,
  depthEffect: true,
  tiltOffset: 0,
  polarAngle: 0,
})

const images = ref([...DEFAULT_IMAGES])

const newImgUrl = ref('')
const fileInputRef = ref(null)
let idCounter = 1000

const whatIWantSay = `# 斐波那契球面分布 Fibonacci Sphere

在单位球面上均匀生成 N 个点，分布均匀、无聚集、无空洞，比随机采样、经纬网格均匀得多，常用于：
粒子系统、天空球、3D 采样、光照探针、球面像素分布、星点渲染。

## 特性

* 均匀性极强：经纬网格会两极密集、赤道稀疏；随机采样有聚类；斐波那契球面全局疏密一致。
* 螺旋排布：所有点沿黄金螺旋铺展，无规则重复网格。
* 单位球面：输出点模长恒等于 1，直接可用于 3D 法线、方向向量。
* 任意点数 N 都可用，无需整除、无限制。

## 计算方法

其中黄金角 ： const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)) // 约 137.5°

${'```javasctipt'}
const fibonacciSphere = (n) => {
  const pts = []
  const total = Math.max(n, 2)
  for (let i = 0; i < total; i++) {
    const y = 1 - (i / (total - 1)) * 2 //  高度归一化
    const r = Math.sqrt(Math.max(0, 1 - y * y)) // 半径投影
    const theta = GOLDEN_ANGLE * i // 水平角度
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r }) // x y z
  }
  return pts // 单位球面上的点
}
${'```'}
`

const generateCodeExample = computed(() => `<BallScene
  :radius="${config.radius}" :autoSpeedX="${config.autoSpeedX}" :autoSpeedY="${config.autoSpeedY}"
  :autoSpeedZ="${config.autoSpeedZ}" :count="${config.count}" :imgSize="${config.imgSize}"
  :autoRotate="${config.autoRotate}" :depthEffect="${config.depthEffect}" :tiltOffset="${config.tiltOffset}"
  :images="${images}" @nodeClick="onNodeClick" />`)

const addImage = () => {
  const url = newImgUrl.value.trim()
  if (!url) return
  images.value.push({
    id: `url-${idCounter++}`,
    src: url,
    label: url.split('/').pop() || url,
  })
  newImgUrl.value = ''
  if (config.count < images.value.length) config.count = images.value.length
}

const onFileChange = (e) => {
  Array.from(e.target.files || []).forEach(file => {
    const reader = new FileReader()
    reader.onload = ev => {
      images.value.push({
        id: `file-${idCounter++}`,
        src: ev.target.result,
        label: file.name,
      })
      if (config.count < images.value.length) config.count = images.value.length
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

const removeImage = (index) => {
  images.value.splice(index, 1)
}

const onThumbError = (e) => {
  e.target.style.display = 'none'
}

const preview = reactive({ visible: false, src: '', label: '' })

const onNodeClick = (node) => {
  if (!node.img) return
  preview.src = node.img.src
  preview.label = node.img.label
  preview.visible = true
}

const closePreview = () => {
  preview.visible = false
}

const onKeyDown = (e) => {
  if (e.key === 'Escape') closePreview()
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.ball-rotate-page {
  width: 100%;
  height: 100%;
}

.add-url-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}


.btn-del {
  @include button-shared;
  background: transparent;
  color: $danger-color;
  padding: 2px 6px;
  font-size: 12px;
  flex-shrink: 0;

  &:hover {
    background: rgba($danger-color, 0.1);
  }
}

/* ── 图片列表 ── */
.img-list {
  max-height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 2px;
}

.img-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 6px;
  background: $light-gray;
  border: 1px solid $medium-gray;

  &:hover {
    background: $medium-gray;
  }
}

.img-thumb {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  background: $medium-gray;
}

.img-label {
  flex: 1;
  font-size: 12px;
  color: $dark-gray;
}

.empty-tip {
  text-align: center;
  color: $secondary-color;
  font-size: 13px;
  padding: 12px 0;
}

/* ── 图片预览遮罩 ── */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;

  .preview-box {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .preview-img {
      max-width: 80vw;
      max-height: 80vh;
      border-radius: 12px;
      object-fit: contain;
      box-shadow: 0 8px 48px rgba(0, 0, 0, 0.8);
      animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .preview-close {
      position: absolute;
      top: -16px;
      right: -16px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }

    .preview-caption {
      color: rgba(255, 255, 255, 0.75);
      font-size: 13px;
      max-width: 60vw;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0
  }

  to {
    opacity: 1
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.85);
    opacity: 0
  }

  to {
    transform: scale(1);
    opacity: 1
  }
}
</style>
