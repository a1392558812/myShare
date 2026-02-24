<template>
  <div>
    <div>
      <customBtnCom inputType="number" @click="toRotation">
        旋转角度
      </customBtnCom>
      <customBtnCom @click="ifAutoRotation ? toPauseAutoRotation() : toAutoRotation()">
        {{ ifAutoRotation ? '暂停' : '自动' }}旋转-{{ ifAutoRotation }}
      </customBtnCom>
    </div>
    <div class="scene" @mousedown="startDrag" @mousemove="onDrag" @mouseup="endDrag" @mouseleave="endDrag"
      @touchstart="startDrag" @touchmove="onDrag" @touchend="endDrag">
      <div class="card-wrap" :style="{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        placeSelf: 'center',
        width: '300px',
        height: '400px',
        transformStyle: 'preserve-3d',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }">
        <div v-for="(item, index) in cardList" :key="index" :style="{
          width: '100%',
          height: '100%',
          background: item.color,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30px',
          color: '#fff',
          top: '0',
          left: '0',
          borderRadius: '20px',
          backfaceVisibility: 'hidden',
          userSelect: 'none',
          ...(isDragging || ifAutoRotation ? {} : { transition: 'transform 0.5s linear' }),
          transform: `rotateY(${index * 30 + rotation}deg) translateZ(-${(0.5 * 170 + 0.5 * 16) / Math.tan(Math.PI / 24)}px)`
        }">
          第{{ index }}个</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="js">
import { ref } from 'vue'
import {
  customBtnCom,
} from '../components/form-control/index.vue'
const randomColor = () => `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
const listFun = () => (new Array(12).fill(0).map((item, index) => ({
  index: index,
  color: randomColor()
})))

const cardList = ref(listFun())
const rotation = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startRotation = ref(0)
const ifAutoRotation = ref(false)
let timer = null
const startDrag = (e) => {
  isDragging.value = true
  startX.value = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX
  startRotation.value = rotation.value
}

const onDrag = (e) => {
  if (!isDragging.value) return

  const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX
  const deltaX = currentX - startX.value
  const sensitivity = 2
  rotation.value = startRotation.value - (deltaX / sensitivity)
}

const endDrag = () => {
  isDragging.value = false
}

const toRotation = (e, val) => {
  rotation.value = Number(val % 360)
}

const autoRotation = () => {
  if (!ifAutoRotation.value) return
  rotation.value = (rotation.value + 0.2) % 360
  timer = setTimeout(() => {
    autoRotation()
  }, 1000 / 90) // 90桢
}

const toAutoRotation = () => {
  if (ifAutoRotation.value) return
  ifAutoRotation.value = true
  autoRotation()
}
const toPauseAutoRotation = () => {
  clearTimeout(timer)
  ifAutoRotation.value = false
}

console.log(cardList.value)
</script>
<style lang="scss" scoped>
.scene {
  overflow: hidden;
  perspective: 1000px;
  mask: linear-gradient(90deg, #0000, red 20% 80%, #0000)
}
</style>