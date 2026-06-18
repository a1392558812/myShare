<template>
  <div class="ball-scene" ref="sceneRef" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp"
    @mouseleave="onMouseUp" @touchstart.prevent="onTouchStart" @touchmove.prevent="onTouchMove" @touchend="onTouchEnd">
    <div class="ball-3d-space">
      <div v-for="node in visibleNodes" :key="node.id" class="ball-node" :style="getNodeStyle(node)"
        @click.stop="emit('nodeClick', node)">
        <img v-if="node.img" :src="node.img.src" class="node-img" draggable="false" @error="onNodeImgError" />
        <div v-else class="node-dot">{{ node.index + 1 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  radius: {
    type: Number,
    default: 200,
  },
  autoSpeedX: {
    type: Number,
    default: 0,
  },
  autoSpeedY: {
    type: Number,
    default: 0.5,
  },
  autoSpeedZ: {
    type: Number,
    default: 0,
  },
  count: {
    type: Number,
    default: 16,
  },
  imgSize: {
    type: Number,
    default: 60,
  },
  autoRotate: {
    type: Boolean,
    default: true,
  },
  depthEffect: {
    type: Boolean,
    default: true,
  },
  images: {
    type: Array,
    default: () => [],
  },
  tiltOffset: {
    type: Number,
    default: 0,
  },
  /** 两极避让角（°），0=无避让，90=完全避开 */
  polarAngle: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits([
  'nodeClick',
])

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

const sceneRef = ref(null)
const sceneW = ref(600)
const sceneH = ref(600)

const rotMatrix = ref([1, 0, 0, 0, 1, 0, 0, 0, 1])

const drag = reactive({ active: false, lastX: 0, lastY: 0 })

const fibonacciSphere = (n, polarAngle = 0) => {
  const pts = []
  const total = Math.max(n, 2)
  const yMax = Math.cos(polarAngle * Math.PI / 180)
  for (let i = 0; i < total; i++) {
    const y = yMax * (1 - (i / (total - 1)) * 2)
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = GOLDEN_ANGLE * i
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r })
  }
  return pts
}

// 矩阵乘法
const multiplyMat3 = (a, b) => {
  const r = new Array(9)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]
    }
  }
  return r
}

// 向量旋转
const rotateVec = (m, v) => {
  return {
    x: m[0] * v.x + m[1] * v.y + m[2] * v.z,
    y: m[3] * v.x + m[4] * v.y + m[5] * v.z,
    z: m[6] * v.x + m[7] * v.y + m[8] * v.z,
  }
}

/** 左乘绕 Y 轴旋转矩阵 */
const applyRotY = (m, a) => {
  const c = Math.cos(a), s = Math.sin(a)
  return multiplyMat3([c, 0, s, 0, 1, 0, -s, 0, c], m)
}

/** 左乘绕 X 轴旋转矩阵 */
const applyRotX = (m, a) => {
  const c = Math.cos(a), s = Math.sin(a)
  return multiplyMat3([1, 0, 0, 0, c, -s, 0, s, c], m)
}

/** 左乘绕 Z 轴旋转矩阵 */
const applyRotZ = (m, a) => {
  const c = Math.cos(a), s = Math.sin(a)
  return multiplyMat3([c, -s, 0, s, c, 0, 0, 0, 1], m)
}

const basePoints = computed(() => fibonacciSphere(props.count, props.polarAngle))

/**
 * @description 将单位法线向量转换为 CSS 3D 旋转角度
 * @param {{x,y,z}} n - 单位法线向量
 * @param {number} tiltDeg - 倾斜偏移角（°）
 * @returns {{ yaw, pitch }} CSS 旋转角度（°）
 */
const normalToCssRotation = (n, tiltDeg = 0) => {
  const rad = Math.PI / 180
  const yaw = Math.atan2(n.x, n.z) / rad
  const pitch = -Math.atan2(n.y, Math.sqrt(n.x * n.x + n.z * n.z)) / rad + tiltDeg
  return { yaw, pitch }
}

const visibleNodes = computed(() => {
  const m = rotMatrix.value
  const R = props.radius
  const imgSize = props.imgSize
  const imgs = props.images

  return basePoints.value.map((pt, i) => {
    const rp = rotateVec(m, pt)
    const depth = (rp.z + 1) / 2
    const opacity = props.depthEffect ? 0.35 + depth * 0.65 : 1
    const zIndex = Math.round((depth + 1) * 50)
    const img = imgs.length > 0 ? imgs[i % imgs.length] : null

    // 法线方向转为 CSS 旋转角度（yaw/pitch）
    const rot = normalToCssRotation(rp, props.tiltOffset)

    return { id: i, index: i, radius: R, opacity, zIndex, imgSize, img, rp, rot }
  })
})

const getNodeStyle = (node) => {
  const { yaw, pitch } = node.rot
  return {
    width: `${node.imgSize}px`,
    height: `${node.imgSize}px`,
    transform: `translate(-50%, -50%) rotateY(${yaw}deg) rotateX(${pitch}deg) translateZ(${node.radius}px)`,
    opacity: node.opacity,
    zIndex: node.zIndex,
    cursor: node.img ? 'pointer' : 'default',
  }
}

let rafId = null
let lastTime = 0

const animate = (ts) => {
  rafId = requestAnimationFrame(animate)
  if (!props.autoRotate || drag.active) {
    lastTime = ts
    return
  }
  const dt = Math.min((ts - lastTime) / 1000, 0.05)
  lastTime = ts
  const toRad = Math.PI / 180 * dt * 60
  const sx = props.autoSpeedX * toRad
  const sy = props.autoSpeedY * toRad
  const sz = props.autoSpeedZ * toRad

  if (sx) rotMatrix.value = applyRotX(rotMatrix.value, sx)
  if (sy) rotMatrix.value = applyRotY(rotMatrix.value, sy)
  if (sz) rotMatrix.value = applyRotZ(rotMatrix.value, sz)
}

const onMouseDown = (e) => {
  drag.active = true
  drag.lastX = e.clientX
  drag.lastY = e.clientY
}

const onMouseMove = (e) => {
  if (!drag.active) return
  applyDrag(e.clientX, e.clientY)
}

const onMouseUp = () => {
  drag.active = false
}

const onTouchStart = (e) => {
  if (!e.touches[0]) return
  drag.active = true
  drag.lastX = e.touches[0].clientX
  drag.lastY = e.touches[0].clientY
}

const onTouchMove = (e) => {
  if (!drag.active || !e.touches[0]) return
  applyDrag(e.touches[0].clientX, e.touches[0].clientY)
}

const onTouchEnd = () => {
  drag.active = false
}

const applyDrag = (cx, cy) => {
  const dx = cx - drag.lastX
  const dy = cy - drag.lastY
  drag.lastX = cx
  drag.lastY = cy
  const s = 0.005
  rotMatrix.value = applyRotX(rotMatrix.value, -dy * s)
  rotMatrix.value = applyRotY(rotMatrix.value, dx * s)
}

const onNodeImgError = (e) => {
  e.target.style.display = 'none'
}

let resizeObserver = null

const updateSize = () => {
  if (!sceneRef.value) return
  const rect = sceneRef.value.getBoundingClientRect()
  sceneW.value = rect.width || 600
  sceneH.value = rect.height || 600
}

onMounted(() => {
  updateSize()
  resizeObserver = new ResizeObserver(updateSize)
  if (sceneRef.value) resizeObserver.observe(sceneRef.value)
  lastTime = performance.now()
  rafId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<style scoped lang="scss">
.ball-scene {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 520px;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d1a 70%, #000 100%);
  overflow: hidden;
  user-select: none;
  cursor: grab;
  perspective: 1000px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    cursor: grabbing;
  }
}

.ball-3d-space {
  position: relative;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
}

.ball-node {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  transform-style: preserve-3d;

  &:hover {
    box-shadow: 0 0 0 2px #fff, 0 4px 16px rgba(255, 255, 255, 0.4);
    z-index: 9999 !important;
  }
}

.node-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.node-dot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(79, 70, 229, 0.6);
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  border-radius: 8px;
}
</style>
