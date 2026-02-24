<template>
  <div class="card-container">
    <appContainer>
      <layout-com style="flex: 1;" title="滚动轮播" type="panel"
        :addLayerBtnList="[{ label: '显示源码', callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }) }]">
        <controlItem label="Card数量:" v-model.number="cardCount" input-type="number"
          :slot-props="{ min: 3, max: 9999 }" />
        <controlItem label="Card宽度:" v-model.number="cardWidth" input-type="number"
          :slot-props="{ min: 1, max: 9999 }" />
        <controlItem label="Card高度:" v-model.number="cardHeight" input-type="number"
          :slot-props="{ min: 1, max: 9999 }" />
        <controlItem label="translateY:" :labelValue="`最小translateY: ${calculateMinTranslateY.toFixed(2)}`"
          v-model.number="translateY" input-type="number" :slot-props="{ min: calculateMinTranslateY, max: 9999 }" />
        <controlItem label="旋转角度:" :model-value="Number(rotation.toFixed(2))" input-type="number"
          @update:model-value="toRotate" />
        <customBtnCom @click="rotateCard">旋转一个卡片角度</customBtnCom>

        <div
          style="display: flex; align-items: center; justify-content: center; flex: 1; overflow: hidden; padding: 20px 0"
          :style="{
            height: `${cardHeight + translateY * 2}px`
          }">
          <div class="cards-wrapper" :style="{
            width: `${cardHeight + translateY * 2}px`,
            height: `${cardHeight + translateY * 2}px`
          }" @mousedown="handleMouseDown">
            <div v-for="i in cardCount" :key="i" class="card" :style="{
              position: 'absolute',
              left: `calc(50% - ${cardWidth / 2}px)`,
              top: `calc(50% - ${cardHeight / 2}px)`,
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
              flexShrink: 0,
              transformOrigin: `50% 50%`,
              transform: getCardTransform(i),
              userSelect: 'none'
            }">
              <div class="card-content">
                <div class="card-number">{{ i }}</div>
                <div class="card-info">
                  <p>Card {{ i }}</p>
                  <p>Size: {{ cardWidth }}px × {{ cardHeight }}px</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </layout-com>
    </appContainer>
  </div>
</template>
<script setup lang="js">
import { ref, watch, computed } from 'vue';
import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

import {
  controlItem,
  appContainer,
  layoutCom,
  customBtnCom
} from '../components/form-control/index.vue';

const calculateMinTranslateY = computed(() => {
  const angle = 360 / cardCount.value;
  const angleInRadians = angle * (Math.PI / 180);
  const minRadius = (cardWidth.value / 2) / Math.tan(angleInRadians / 2);
  return Number((Math.abs(minRadius) + (cardHeight.value / 2)).toFixed(2));
});

const cardCount = ref(5);
const cardWidth = ref(150);
const cardHeight = ref(200);
const translateY = ref(calculateMinTranslateY.value);
const rotation = ref(0);
const isDragging = ref(false);
const startAngle = ref(0);

const handleMouseDown = (e) => {
  isDragging.value = true;
  startAngle.value = getAngle(e.clientX, e.clientY);
  document.addEventListener('mousemove', handleGlobalMouseMove);
  document.addEventListener('mouseup', handleGlobalMouseUp);
};

const handleGlobalMouseMove = (e) => {
  if (!isDragging.value) return;
  const currentAngle = getAngle(e.clientX, e.clientY);
  let angleDiff = currentAngle - startAngle.value;

  if (angleDiff > 180) {
    angleDiff -= 360;
  } else if (angleDiff < -180) {
    angleDiff += 360;
  }

  rotation.value += angleDiff;
  startAngle.value = currentAngle;
};

const handleGlobalMouseUp = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleGlobalMouseMove);
  document.removeEventListener('mouseup', handleGlobalMouseUp);
};

const getAngle = (clientX, clientY) => {
  const wrapper = document.querySelector('.cards-wrapper');
  if (!wrapper) return 0;
  const rect = wrapper.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI;
};

const getCardTransform = (i) => {
  const baseAngle = 360 / cardCount.value * (i - 1);
  return `rotate(${baseAngle + rotation.value}deg) translateY(-${translateY.value}px)`;
};

const toRotate = (val) => {
  console.log('toRotate', val);
  rotation.value = Number(val.toFixed(0)) || 0;
}

const rotateCard = () => {
  const standardAngle = 360 / cardCount.value;
  const normalizedRotation = Math.round(rotation.value / standardAngle) * standardAngle;
  rotation.value = normalizedRotation + standardAngle;
};

watch(() => calculateMinTranslateY.value, (newVal, oldVal) => {
  console.log('calculateMinTranslateY.value', newVal, oldVal);
  translateY.value = newVal;
})
</script>
<style lang="scss" scoped>
.cards-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}


.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform-origin: center;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }

  .card-content {
    height: calc(100% - 15px * 2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px;
    text-align: center;
  }

  .card-number {
    font-size: 32px;
    font-weight: bold;
    color: #3498db;
    margin-bottom: 10px;
  }

  .card-info {
    font-size: 14px;
    color: #666;

    p {
      margin: 3px 0;
    }
  }
}
</style>