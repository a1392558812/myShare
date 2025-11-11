<template>
  <div class="auxiliary-line-container" @dragenter="handleDragEnter" @dragover="handleDragOver" @drop="handleDrop">
    <canvas :draggable="false" ref="gridCanvas" class="grid-canvas"></canvas>
    <div :draggable="false" v-if="showHorizontalGuide" class="guide-line horizontal highlight" :style="{
      top: `${highlightY}px`,
      height: `${lineWidth + 1}px`,
      background: activeLineColor,
      boxShadow: `0 0 4px ${activeLineColor}`,
    }"></div>
    <div :draggable="false" v-if="showVerticalGuide" class="guide-line vertical highlight" :style="{
      left: `${highlightX}px`,
      width: `${lineWidth + 1}px`,
      background: activeLineColor,
      boxShadow: `0 0 4px ${activeLineColor}`,
    }"></div>

    <template v-for="guide in slotGuides" :key="guide.id">
      <div v-if="guide.ifShow" :draggable="false" class="guide-line" :class="{
        'horizontal': guide.type === 'horizontal',
        'vertical': guide.type === 'vertical',
        'slot-guide': true
      }" :style="{
        ...(guide.type === 'horizontal' ? {
          top: `${guide.position}px`,
          left: 0,
          width: '100%',
          height: `${lineWidth + 1}px`,
          background: guide.color,
          boxShadow: `0 0 4px ${guide.color}`,
        } : {
          left: `${guide.position}px`,
          top: 0,
          height: '100%',
          width: `${lineWidth + 1}px`,
          background: guide.color,
          boxShadow: `0 0 4px ${guide.color}`,
        })
      }"></div>
    </template>
    <slot :adsorption-info="adsorptionInfo"></slot>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';

const props = defineProps({
  xUnit: {
    type: Number,
    default: 10
  },
  yUnit: {
    type: Number,
    default: 10
  },
  lineColor: {
    type: String,
    default: '#C8C8C8'
  },
  activeLineColor: {
    type: String,
    default: 'rgba(79, 70, 229, 1)'
  },
  specialBorderLineColor: {
    type: String,
    default: 'rgba(200, 200, 200, 0.8)'
  },
  specialCenterLineColor: {
    type: String,
    default: 'rgba(163, 244, 176, 0.8)'
  },
  lineWidth: {
    type: Number,
    default: 1
  },
  adsorptionDistance: {
    type: Number,
    default: 5
  },
  nearbyThreshold: {
    type: Number,
    default: 10
  },
  showGuide: {
    type: Boolean,
    default: true
  },
  showSpecialGuide: {
    type: Boolean,
    default: true
  },
});

const emit = defineEmits(['addSlotItem']);
const showHorizontalGuide = ref(false);
const showVerticalGuide = ref(false);
const highlightX = ref(0);
const highlightY = ref(0);
const gridCanvas = ref(null);
const containerWidth = ref(1000);
const containerHeight = ref(800);
const slotPositions = ref({});
const slotGuides = ref([]);
// 跟踪是否检测到插槽覆盖
const hasSlotOverlap = ref(false);
const calculateAdsorptionPosition = (position, unit, distance) => {
  const remainder = position % unit;
  if (remainder <= distance || remainder >= unit - distance) {
    return remainder <= distance ? position - remainder : position + (unit - remainder);
  }
  return position;
}
// 普通辅助线吸附
const getNormalGridAdsorption = (x, y) => {
  const adsorptionX = calculateAdsorptionPosition(x, props.xUnit, props.adsorptionDistance);
  const adsorptionY = calculateAdsorptionPosition(y, props.yUnit, props.adsorptionDistance);
  return { x: adsorptionX, y: adsorptionY };
};

// 特殊辅助线吸附
const getSpecialGuideAdsorption = (x, y) => {
  // 当showSpecialGuide为false时，不执行特殊辅助线吸附
  if (!props.showSpecialGuide) {
    return { x, y };
  }

  let adsorptionX = x;
  let adsorptionY = y;
  // y轴特殊辅助线吸附
  for (const guide of slotGuides.value) {
    if (guide.ifShow === false) continue;
    if (guide.type === 'horizontal') {
      if (Math.abs(y - guide.position) <= props.adsorptionDistance) {
        adsorptionY = guide.position;
        break;
      }
    }
  }
  // x轴特殊辅助线吸附
  for (const guide of slotGuides.value) {
    if (guide.ifShow === false) continue;
    if (guide.type === 'vertical') {
      if (Math.abs(x - guide.position) <= props.adsorptionDistance) {
        adsorptionX = guide.position;
        break;
      }
    }
  }

  return { x: adsorptionX, y: adsorptionY };
};
const getAdsorptionPosition = (x, y, showOverlayGuide = true) => {
  // 当showGuide为false时，不执行普通辅助线逻辑
  // 当showOverlayGuide为false且检测到插槽覆盖时，也不执行普通辅助线逻辑
  let normalX = x;
  let normalY = y;
  if (props.showGuide && !(showOverlayGuide === false && hasSlotOverlap.value)) {
    // 应用普通网格吸附
    ({ x: normalX, y: normalY } = getNormalGridAdsorption(x, y));
  }

  // 再应用特殊辅助线吸附（优先级更高）
  let { x: specialX, y: specialY } = getSpecialGuideAdsorption(x, y);

  // 使用特殊辅助线的吸附结果，如果没有被特殊辅助线吸附则根据条件决定是否使用普通辅助线吸附结果
  const adsorptionX = specialX !== x ? specialX : normalX;
  const adsorptionY = specialY !== y ? specialY : normalY;

  // 更新辅助线显示状态
  // 当showGuide为false时，不显示普通辅助线
  if (props.showGuide && adsorptionX !== x) {
    highlightX.value = adsorptionX;
    showVerticalGuide.value = true;
  } else {
    showVerticalGuide.value = false;
  }
  if (props.showGuide && adsorptionY !== y) {
    highlightY.value = adsorptionY;
    showHorizontalGuide.value = true;
  } else {
    showHorizontalGuide.value = false;
  }

  return { x: adsorptionX, y: adsorptionY };
}
const resetHighlights = () => {
  showHorizontalGuide.value = false;
  showVerticalGuide.value = false;
}
const drawGrid = () => {
  const canvas = gridCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = containerWidth.value;
  canvas.height = containerHeight.value;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = props.lineColor;
  ctx.lineWidth = props.lineWidth;
  ctx.beginPath();
  for (let i = 1; i <= Math.floor(containerHeight.value / props.yUnit); i++) {
    const y = i * props.yUnit;
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }
  ctx.stroke();
  ctx.beginPath();
  for (let i = 1; i <= Math.floor(containerWidth.value / props.xUnit); i++) {
    const x = i * props.xUnit;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }
  ctx.stroke();
}
const handleResize = () => {
  const container = document.querySelector('.auxiliary-line-container');
  if (container) {
    containerWidth.value = container.clientWidth;
    containerHeight.value = container.clientHeight;
    nextTick(() => {
      drawGrid();
    });
  }
}
const updateSlotPosition = (elementId, position, size) => {
  slotPositions.value[elementId] = {
    position,
    size
  };
  updateSlotGuides();
};
const removeSlotPosition = (elementId) => {
  delete slotPositions.value[elementId];
  updateSlotGuides();
};
const updateSlotGuides = () => {
  const guides = [];
  Object.entries(slotPositions.value).forEach(([elementId, { position, size }]) => {
    if (!size) return;
    // 上边线
    guides.push({
      id: `${elementId}-top`,
      type: 'horizontal',
      position: position.y,
      source: elementId,
      color: props.specialBorderLineColor,
      ifShow: false
    });
    // 下边线
    guides.push({
      id: `${elementId}-bottom`,
      type: 'horizontal',
      position: position.y + size.height,
      source: elementId,
      color: props.specialBorderLineColor,
      ifShow: false
    });
    // 左边线
    guides.push({
      id: `${elementId}-left`,
      type: 'vertical',
      position: position.x,
      source: elementId,
      color: props.specialBorderLineColor,
      ifShow: false
    });
    // 右边线
    guides.push({
      id: `${elementId}-right`,
      type: 'vertical',
      position: position.x + size.width,
      source: elementId,
      color: props.specialBorderLineColor,
      ifShow: false
    });

    // 中心水平辅助线
    guides.push({
      id: `${elementId}-center-y`,
      type: 'horizontal',
      position: position.y + size.height / 2,
      source: elementId,
      color: props.specialCenterLineColor,
      ifShow: false
    });
    // 中心垂直辅助线
    guides.push({
      id: `${elementId}-center-x`,
      type: 'vertical',
      position: position.x + size.width / 2,
      source: elementId,
      color: props.specialCenterLineColor,
      ifShow: false
    });
  });
  slotGuides.value = guides;
};
const resetSlotGuidesVisibility = () => {
  slotGuides.value.forEach(guide => {
    guide.ifShow = false;
  });
};
const setSlotGuidesVisibility = (elementId, visible) => {
  slotGuides.value.forEach(guide => {
    if (guide.source === elementId) {
      guide.ifShow = props.showSpecialGuide && visible;
    }
  });
};
const showNearbySpecialGuides = (x, y, threshold = props.nearbyThreshold, draggingElementId = null) => {
  resetSlotGuidesVisibility();

  if (!props.showSpecialGuide) {
    return;
  }
  for (const guide of slotGuides.value) {
    // 排除当前拖拽元素自身
    if (draggingElementId && guide.source === draggingElementId) {
      continue;
    }
    // 检测x轴
    if (guide.type === 'vertical' && Math.abs(x - guide.position) <= threshold) {
      guide.ifShow = true;
    }
    // 检测y轴
    if (guide.type === 'horizontal' && Math.abs(y - guide.position) <= threshold) {
      guide.ifShow = true;
    }
  }
};
const getSpecialGuides = () => {
  return slotGuides.value.filter(guide => guide.type === 'vertical' || guide.type === 'horizontal');
};
const adsorptionInfo = {
  getAdsorptionPosition,
  getNormalGridAdsorption,
  getSpecialGuideAdsorption,
  resetHighlights,
  updateSlotPosition,
  removeSlotPosition,
  resetSlotGuidesVisibility,
  setSlotGuidesVisibility,
  showNearbySpecialGuides,
  getSpecialGuides,
  // 添加方法来设置插槽覆盖状态
  setSlotOverlap: (value) => {
    hasSlotOverlap.value = value;
  },
  // 添加方法来重置插槽覆盖状态
  resetSlotOverlap: () => {
    hasSlotOverlap.value = false;
  },
  xUnit: props.xUnit,
  yUnit: props.yUnit,
  adsorptionDistance: props.adsorptionDistance,
  showGuide: props.showGuide,
  showSpecialGuide: props.showSpecialGuide
};
watch(() => [props.xUnit, props.yUnit, props.lineColor, props.lineWidth, props.showGuide, props.showSpecialGuide], () => {
  nextTick(() => {
    drawGrid();
  });
});
const handleDragEnter = (event) => {
  event.preventDefault();
  event.stopPropagation();
}
const handleDragOver = (event) => {
  event.preventDefault();
  event.stopPropagation();
}
const handleDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  const dragData = event.dataTransfer.getData('text/plain');
  if (dragData) {
    try {
      const droppedItem = JSON.parse(dragData);
      const container = event.currentTarget;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      emit('addSlotItem', {
        ...droppedItem,
        dropPosition: { x, y }
      });
    } catch (error) {
      console.error('解析拖拽数据失败:', error);
    }
  }
}

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.auxiliary-line-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;

  .grid-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .guide-line {
    position: absolute;
    pointer-events: none;
    z-index: 10;
  }

  .guide-line.horizontal {
    left: 0;
    width: 100%;
  }

  .guide-line.vertical {
    top: 0;
    height: 100%;
  }
}
</style>