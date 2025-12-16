<template>
  <div class="ruler-component" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }">
    <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight" :style="{
      width: canvasWidth + 'px',
      height: canvasHeight + 'px'
    }" @mousedown="handleMouseDown" @touchstart="handleMouseDown" @mousewheel="handleMouseWheel"></canvas>

    <div v-if="xLine" class="current-value-pointer" :style="{
      backgroundColor: pointerColor.x,
      width: pointerWidth.x + 'px',
      transform: `translateX(-${pointerWidth.x / 2}px)`,
      left: pointerX + 'px',
      height: '100%',
      top: 0,
      cursor: disabled.x ? 'default' : 'ew-resize'
    }" @mousedown="(e) => handlePointMouseDown('horizontal', e)"
      @touchstart="(e) => handlePointMouseDown('horizontal', e)">
    </div>

    <div v-if="yLine" class="current-value-pointer" :style="{
      backgroundColor: pointerColor.y,
      height: pointerWidth.y + 'px',
      transform: `translateY(-${pointerWidth.y / 2}px)`,
      top: pointerY + 'px',
      width: '100%',
      left: 0,
      cursor: disabled.y ? 'default' : 'ns-resize'
    }" @mousedown="(e) => handlePointMouseDown('vertical', e)"
      @touchstart="(e) => handlePointMouseDown('vertical', e)">
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';

const props = defineProps({
  numeralSystem: {
    type: Object,
    default: () => ({
      x: 10,
      y: 10
    })
  },
  graduationMarkNum: {
    type: Object,
    default: () => ({
      x: 10,
      y: 10
    })
  },
  currentValue: {
    type: Object,
    default: () => ({
      x: 0,
      y: 0
    })
  },
  setup: {
    type: Object,
    default: () => ({
      x: 0,
      y: 0
    })
  },
  labelX: {
    type: Function,
    default: (value) => value.toString()
  },
  labelY: {
    type: Function,
    default: (value) => value.toString()
  },
  minValue: {
    type: Object,
    default: () => ({
      x: 0,
      y: 0
    })
  },
  maxValue: {
    type: Object,
    default: () => ({
      x: 100,
      y: 100
    })
  },
  orientation: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical', 'both'].includes(value)
  },
  canvasWidth: {
    type: Number,
    default: 500
  },
  canvasHeight: {
    type: Number,
    default: 500
  },
  majorMarkHeight: {
    type: Object,
    default: () => ({
      x: 20,
      y: 20
    })
  },
  minorMarkHeight: {
    type: Object,
    default: () => ({
      x: 10,
      y: 10
    })
  },
  pointerWidth: {
    type: Object,
    default: () => ({
      x: 2,
      y: 2
    })
  },
  pointerColor: {
    type: Object,
    default: () => ({
      x: '#3498db',
      y: '#2ecc71'
    })
  },
  majorMarkColor: {
    type: Object,
    default: () => ({
      x: '#333',
      y: '#333'
    })
  },
  minorMarkColor: {
    type: Object,
    default: () => ({
      x: '#999',
      y: '#999'
    })
  },
  textColor: {
    type: Object,
    default: () => ({
      x: '#666',
      y: '#666'
    })
  },
  padding: {
    type: Object,
    default: () => ({
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    })
  },
  disabled: {
    type: Object,
    default: () => ({
      x: false,
      y: false
    })
  },
  showLine: {
    type: Object,
    default: () => ({
      x: true,
      y: true
    })
  },
  scaleStep: {
    type: Number,
    default: 0.1
  }
});

const emit = defineEmits(['change', 'scale']);

const canvasRef = ref(null);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartValue = ref(0);

const totalIntervalX = computed(() => props.numeralSystem.x * props.graduationMarkNum.x);
const totalIntervalY = computed(() => props.numeralSystem.y * props.graduationMarkNum.y);


const valuePerPixelX = computed(() => {
  const availableLength = props.canvasWidth - props.padding.left - props.padding.right;
  return (props.maxValue.x - props.minValue.x) / availableLength;
});

const valuePerPixelY = computed(() => {
  const availableLength = props.canvasHeight - props.padding.top - props.padding.bottom;
  return (props.maxValue.y - props.minValue.y) / availableLength;
});

const pixelPerValueX = computed(() => 1 / valuePerPixelX.value);
const pixelPerValueY = computed(() => 1 / valuePerPixelY.value);

const pointerX = computed(() => {
  return ((props.currentValue.x - props.minValue.x) * pixelPerValueX.value) + props.padding.left;
});

const pointerY = computed(() => {
  return ((props.currentValue.y - props.minValue.y) * pixelPerValueY.value) + props.padding.top;
});

const computedDisabled = computed(() => {
  if (props.orientation === 'both' && (props.disabled.x || props.disabled.y)) return true;
  if (props.orientation === 'horizontal' && props.disabled.x) return true;
  if (props.orientation === 'vertical' && props.disabled.y) return true;
  return false;
});

const xLine = computed(() => {
  return (props.orientation === 'horizontal' || props.orientation === 'both')
    && ((pointerX.value + props.padding.right) <= props.canvasWidth)
    && (pointerX.value > props.padding.left)
    && props.showLine.x
});

const yLine = computed(() => {
  return (props.orientation === 'vertical' || props.orientation === 'both')
    && ((pointerY.value + props.padding.bottom) <= props.canvasHeight)
    && (pointerY.value > props.padding.top)
    && props.showLine.y
});



const dragDirection = ref(''); // 'horizontal', 'vertical' or ''

const drawRuler = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  console.log('drawRuler', canvas, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f9f9f9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (props.orientation === 'horizontal' || props.orientation === 'both') {
    const availableLength = props.canvasWidth - props.padding.left - props.padding.right;
    const intervalPerPixel = availableLength / totalIntervalX.value;
    const stepValue = (props.maxValue.x - props.minValue.x) / totalIntervalX.value;
    for (let i = 0; i <= totalIntervalX.value; i++) {
      const value = props.minValue.x + (stepValue * i);
      const x = props.padding.left + (i * intervalPerPixel);
      const isMajorMark = i % props.graduationMarkNum.x === 0;
      const markHeight = isMajorMark ? props.majorMarkHeight.x : props.minorMarkHeight.x;

      ctx.beginPath();
      ctx.moveTo(x, props.padding.top);
      ctx.lineTo(x, props.padding.top + markHeight);
      ctx.strokeStyle = isMajorMark ? props.majorMarkColor.x : props.minorMarkColor.x;
      ctx.lineWidth = isMajorMark ? 2 : 1;
      ctx.stroke();

      if (isMajorMark) {
        ctx.font = '12px Arial';
        ctx.fillStyle = props.textColor.x;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(props.labelX(value), x, props.padding.top + markHeight + 5);
      }
    }
  }

  if (props.orientation === 'vertical' || props.orientation === 'both') {
    const availableLength = props.canvasHeight - props.padding.top - props.padding.bottom;
    const intervalPerPixel = availableLength / totalIntervalY.value;
    const stepValue = (props.maxValue.y - props.minValue.y) / totalIntervalY.value;
    for (let i = 0; i <= totalIntervalY.value; i++) {
      const value = props.minValue.y + (stepValue * i);
      const y = props.padding.top + (i * intervalPerPixel);
      const isMajorMark = i % props.graduationMarkNum.y === 0;
      const markWidth = isMajorMark ? props.majorMarkHeight.y : props.minorMarkHeight.y;

      ctx.beginPath();
      ctx.moveTo(props.padding.left, y);
      ctx.lineTo(props.padding.left + markWidth, y);
      ctx.strokeStyle = isMajorMark ? props.majorMarkColor.y : props.minorMarkColor.y;
      ctx.lineWidth = isMajorMark ? 2 : 1;
      ctx.stroke();

      if (isMajorMark) {
        ctx.font = '12px Arial';
        ctx.fillStyle = props.textColor.y;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(props.labelY(value), props.padding.left + markWidth + 5, y);
      }
    }
  }

  if (props.orientation === 'both') {
    ctx.beginPath();
    ctx.arc(props.padding.left, props.padding.top, 4, 0, 2 * Math.PI);
    ctx.fillStyle = props.majorMarkColor.x;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(props.padding.left, props.padding.top);
    ctx.lineTo(props.padding.left, canvas.height - props.padding.bottom);
    ctx.moveTo(props.padding.left, props.padding.top);
    ctx.lineTo(canvas.width - props.padding.right, props.padding.top);
    ctx.strokeStyle = props.majorMarkColor.y;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

const handleMouseWheel = (e) => {
  console.log('handleMouseWheel', e);
  e.preventDefault();
  if (computedDisabled.value) return;
  let minX = props.minValue.x;
  let minY = props.minValue.y;
  let maxX = props.maxValue.x;
  let maxY = props.maxValue.y;

  if (e.deltaY > 0) {
    minX = minX - props.scaleStep
    maxX = maxX + props.scaleStep
    minY = minY - props.scaleStep
    maxY = maxY + props.scaleStep
  } else if (e.deltaY < 0) {
    minX = minX + props.scaleStep
    maxX = maxX - props.scaleStep
    if (maxX <= minX) {
      maxX = maxX + props.scaleStep
      minX = minX - props.scaleStep
    }

    minY = minY + props.scaleStep
    maxY = maxY - props.scaleStep

    if (minY >= maxY) {
      minY = minY - props.scaleStep
      maxY = maxY + props.scaleStep
    }
  }

  emit('scale', {
    minValue: { x: minX, y: minY },
    maxValue: { x: maxX, y: maxY },
    event: e
  });
};

const calculateValueFromPosition = (position, direction) => {
  const paddingOffset = direction === 'x' ? props.padding.left : props.padding.top;
  const relativePosition = position - paddingOffset;
  let value = props.minValue[direction] + (relativePosition * (direction === 'x' ? valuePerPixelX.value : valuePerPixelY.value));

  value = Math.max(props.minValue[direction], Math.min(props.maxValue[direction], value));

  if (props.setup[direction] > 0) {
    value = Math.round(value / props.setup[direction]) * props.setup[direction];
  }
  return value;
};

const updateValue = (newValue, direction = null) => {
  let updatedValue;
  if (direction) {
    updatedValue = { ...props.currentValue };
    updatedValue[direction] = newValue;
  } else {
    updatedValue = newValue;
  }
  emit('change', updatedValue);
};

const handleMouseDown = (e) => {
  if (computedDisabled.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  if (props.orientation === 'both') {
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    updateValue({
      x: calculateValueFromPosition(clickX, 'x'),
      y: calculateValueFromPosition(clickY, 'y')
    });
  } else {
    let position;
    let direction;
    if (props.orientation === 'horizontal') {
      position = e.clientX - rect.left;
      direction = 'x';
    } else {
      position = e.clientY - rect.top;
      direction = 'y';
    }
    const newValue = calculateValueFromPosition(position, direction);
    updateValue(newValue, direction);
  }
};

const handlePointMouseDown = (direction, e) => {
  if (computedDisabled.value) return;
  e.preventDefault();
  isDragging.value = true;
  dragDirection.value = direction;
  if (direction === 'horizontal') {
    dragStartX.value = e.clientX;
  } else {
    dragStartX.value = e.clientY;
  }
  dragStartValue.value = direction === 'horizontal' ? props.currentValue.x : props.currentValue.y;
  const rect = canvasRef.value.getBoundingClientRect();
  let position;

  if (direction === 'horizontal') {
    position = e.clientX - rect.left;
  } else {
    position = e.clientY - rect.top;
  }
  const directionKey = direction === 'horizontal' ? 'x' : 'y';
  const newValue = calculateValueFromPosition(position, directionKey);
  updateValue(newValue, directionKey);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('touchmove', handleMouseMove);
  document.addEventListener('mouseleave', handleMouseUp);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('touchend', handleMouseUp);
};

const handleMouseMove = (e) => {
  if (!isDragging.value) return;
  let delta;
  let direction;
  if (props.orientation === 'both') {
    if (dragDirection.value === 'horizontal') {
      delta = e.clientX - dragStartX.value;
      direction = 'x';
    } else {
      delta = e.clientY - dragStartX.value;
      direction = 'y';
    }
  } else {
    if (props.orientation === 'horizontal') {
      delta = e.clientX - dragStartX.value;
      direction = 'x';
    } else {
      delta = e.clientY - dragStartX.value;
      direction = 'y';
    }
  }
  let newValue = dragStartValue.value + (delta * (direction === 'x' ? valuePerPixelX.value : valuePerPixelY.value));
  newValue = Math.max(props.minValue[direction], Math.min(props.maxValue[direction], newValue));
  if (props.setup[direction] > 0) {
    newValue = Math.round(newValue / props.setup[direction]) * props.setup[direction];
  }
  updateValue(newValue, direction);
};

const handleMouseUp = () => {
  isDragging.value = false;
  dragDirection.value = '';
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('touchmove', handleMouseMove);
  document.removeEventListener('mouseleave', handleMouseUp);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('touchend', handleMouseUp);
};

watch([
  props.numeralSystem,
  props.graduationMarkNum,
  props.majorMarkHeight,
  props.minorMarkHeight,
  props.currentValue,
  props.minValue,
  props.maxValue,
  () => props.orientation,
  () => props.canvasWidth,
  () => props.canvasHeight,
  () => props.labelX,
  () => props.labelY,
  props.textColor,
  props.majorMarkColor,
  props.minorMarkColor,
  props.pointerColor,
  props.padding,
], (newV, oldV) => {
  console.log('props变化，重新绘制标尺', newV, oldV);
  nextTick(() => {
    drawRuler();
  });
}, {
  immediate: true,
});


</script>

<style scoped lang="scss">
.ruler-component {
  position: relative;
  user-select: none;
  display: inline-block;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;

  .current-value-pointer {
    position: absolute;
    z-index: 10;
  }
}
</style>