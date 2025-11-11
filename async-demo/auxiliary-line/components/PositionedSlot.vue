<template>
  <div :id="elementId" ref="slotRef" class="positioned-slot" @mousedown="handleMouseDown" :style="{
    transform: isDragging ? `translate(${currentAdsorption.x}px, ${currentAdsorption.y}px)` : `translate(${position.x}px, ${position.y}px)`,
    zIndex: zIndex
  }">
    <slot :element-id="elementId"></slot>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  elementId: {
    type: String,
    required: true
  },
  zIndex: {
    type: Number,
    default: 1
  },
  initialPosition: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  adsorptionInfo: {
    type: Object,
    required: true
  },
  nearbyThreshold: {
    type: Number,
    default: 10
  },
  showOverlayGuide: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['dragStart', 'dragMove', 'dragEnd', 'nearbySlotDetected', 'slotOverlapped']);

const isDragging = ref(false);
const mouseStart = ref({ x: 0, y: 0 });
const position = ref({ ...props.initialPosition });
const currentPos = ref({ ...props.initialPosition });
const slotRef = ref(null);

const currentAdsorption = computed(() => {
  if (props.adsorptionInfo && props.adsorptionInfo.getAdsorptionPosition) {
    return props.adsorptionInfo.getAdsorptionPosition(currentPos.value.x, currentPos.value.y, props.showOverlayGuide);
  }
  return { ...currentPos.value };
})
const calculateDistance = (rect1, rect2) => {
  const overlapX = !(rect1.right < rect2.left || rect1.left > rect2.right);
  const overlapY = !(rect1.bottom < rect2.top || rect1.top > rect2.bottom);
  if (overlapX && overlapY) {
    return 0;
  }
  let dx, dy;
  if (rect1.right < rect2.left) {
    dx = rect2.left - rect1.right;
  } else if (rect1.left > rect2.right) {
    dx = rect1.left - rect2.right;
  } else {
    dx = 0;
  }
  if (rect1.bottom < rect2.top) {
    dy = rect2.top - rect1.bottom;
  } else if (rect1.top > rect2.bottom) {
    dy = rect1.top - rect2.bottom;
  } else {
    dy = 0;
  }
  return Math.sqrt(dx * dx + dy * dy);
};

const determineDirection = (rect1, rect2) => {
  const directions = [];
  if (rect1.right <= rect2.left && Math.abs(rect2.left - rect1.right) < props.nearbyThreshold) {
    directions.push('left'); // 当前元素在目标元素左侧
  } else if (rect1.left >= rect2.right && Math.abs(rect1.left - rect2.right) < props.nearbyThreshold) {
    directions.push('right'); // 当前元素在目标元素右侧
  }
  if (rect1.bottom <= rect2.top && Math.abs(rect2.top - rect1.bottom) < props.nearbyThreshold) {
    directions.push('top'); // 当前元素在目标元素上方
  } else if (rect1.top >= rect2.bottom && Math.abs(rect1.top - rect2.bottom) < props.nearbyThreshold) {
    directions.push('bottom'); // 当前元素在目标元素下方
  }
  // 没有明确的单一方向
  if (directions.length === 0) {
    const center1 = { x: rect1.left + rect1.width / 2, y: rect1.top + rect1.height / 2 };
    const center2 = { x: rect2.left + rect2.width / 2, y: rect2.top + rect2.height / 2 };
    const dx = center2.x - center1.x;
    const dy = center2.y - center1.y;
    if (dx > 0) directions.push('right');
    if (dx < 0) directions.push('left');
    if (dy > 0) directions.push('bottom');
    if (dy < 0) directions.push('top');
  }
  return directions;
};;

const detectNearbySlots = () => {
  const currentRect = slotRef.value.getBoundingClientRect();
  const allSlots = Array.from(document.querySelectorAll('.positioned-slot'));
  const allOtherSlots = allSlots.filter(element => element !== slotRef.value);

  const overlappedSlots = [];
  const nearbySlots = [];

  allOtherSlots.forEach(slot => {
    const slotRect = slot.getBoundingClientRect();
    let distance = calculateDistance(currentRect, slotRect);
    console.log('distance', distance);

    // 是否重叠
    if (distance === 0) {
      overlappedSlots.push({
        sourceId: props.elementId,
        targetElementId: slot.getAttribute('id'),
        targetSlot: slot,
        overlapArea: {
          x: Math.max(currentRect.left, slotRect.left),
          y: Math.max(currentRect.top, slotRect.top),
          width: Math.min(currentRect.right, slotRect.right) - Math.max(currentRect.left, slotRect.left),
          height: Math.min(currentRect.bottom, slotRect.bottom) - Math.max(currentRect.top, slotRect.top)
        }
      });
    }
    else if (distance < props.nearbyThreshold) {
      const direction = determineDirection(currentRect, slotRect);
      nearbySlots.push({
        sourceId: props.elementId,
        targetSlot: slot,
        distance: distance,
        direction: direction,
        x: currentAdsorption.value.x,
        y: currentAdsorption.value.y
      });
    }
  });
  nearbySlots.forEach(slotInfo => {
    emit('nearbySlotDetected', slotInfo);
  });
  return overlappedSlots;
};

const handleMouseDown = (event) => {
  event.stopPropagation();
  isDragging.value = true;
  mouseStart.value = {
    x: event.clientX,
    y: event.clientY
  };
  currentPos.value = { ...position.value };
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  if (props.adsorptionInfo && props.adsorptionInfo.resetSlotGuidesVisibility) {
    props.adsorptionInfo.resetSlotGuidesVisibility();
  }
  emit('dragStart', {
    elementId: props.elementId,
    x: position.value.x,
    y: position.value.y
  });
}

const handleMouseMove = (event) => {
  if (!isDragging.value) return;
  const deltaX = event.clientX - mouseStart.value.x;
  const deltaY = event.clientY - mouseStart.value.y;
  currentPos.value = {
    x: position.value.x + deltaX,
    y: position.value.y + deltaY
  };
  emit('dragMove', {
    elementId: props.elementId,
    x: currentPos.value.x,
    y: currentPos.value.y,
    adsorptionX: currentAdsorption.value.x,
    adsorptionY: currentAdsorption.value.y
  });
  if (props.adsorptionInfo && props.adsorptionInfo.showNearbySpecialGuides) {
    props.adsorptionInfo.showNearbySpecialGuides(currentPos.value.x, currentPos.value.y, props.nearbyThreshold, props.elementId, props.showOverlayGuide);
  }
  const currentRect = slotRef.value.getBoundingClientRect();
  const allSlots = Array.from(document.querySelectorAll('.positioned-slot'));
  const allOtherSlots = allSlots.filter(element => element !== slotRef.value);
  let hasNearbySlot = false;
  allOtherSlots.forEach(slot => {
    const slotElementId = slot.getAttribute('id');
    const slotRect = slot.getBoundingClientRect();
    const distance = calculateDistance(currentRect, slotRect);

    if (distance < props.nearbyThreshold) {
      hasNearbySlot = true;
      if (props.adsorptionInfo && props.adsorptionInfo.setSlotGuidesVisibility) {
        props.adsorptionInfo.setSlotGuidesVisibility(slotElementId, true);
      }
    }
  });
  const overlappedSlots = detectNearbySlots();
  if (overlappedSlots.length > 0) {
    const overlapData = {
      sourceId: props.elementId,
      overlappedSlots: overlappedSlots,
      position: {
        x: position.value.x,
        y: position.value.y
      }
    };
    emit('slotOverlapped', overlapData);
    // 当showOverlayGuide为false时，设置插槽覆盖状态为true
    if (props.adsorptionInfo && !props.showOverlayGuide) {
      props.adsorptionInfo.setSlotOverlap(true);
    }
  } else if (props.adsorptionInfo && !props.showOverlayGuide) {
    // 当没有重叠时，重置插槽覆盖状态
    props.adsorptionInfo.resetSlotOverlap();
  }
}

const updatePositionInfo = () => {
  if (!props.adsorptionInfo || !props.adsorptionInfo.updateSlotPosition || !slotRef.value) return;
  const rect = slotRef.value.getBoundingClientRect();
  const size = {
    width: rect.width,
    height: rect.height
  };
  props.adsorptionInfo.updateSlotPosition(props.elementId, position.value, size);
};

const handleMouseUp = (event) => {
  console.log('handleMouseUp', event);
  if (!isDragging.value) return;
  position.value = {
    x: currentAdsorption.value.x,
    y: currentAdsorption.value.y
  };
  isDragging.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  if (props.adsorptionInfo && props.adsorptionInfo.resetHighlights) {
    props.adsorptionInfo.resetHighlights();
  }
  if (props.adsorptionInfo && props.adsorptionInfo.resetSlotGuidesVisibility) {
    props.adsorptionInfo.resetSlotGuidesVisibility();
  }
  updatePositionInfo();
  emit('dragEnd', {
    elementId: props.elementId,
    x: position.value.x,
    y: position.value.y,
  });
};

onMounted(() => {
  nextTick(() => {
    updatePositionInfo();
  });
});

onUnmounted(() => {
  if (props.adsorptionInfo && props.adsorptionInfo.removeSlotPosition) {
    props.adsorptionInfo.removeSlotPosition(props.elementId);
  }
});

defineExpose({
  getCurrentPosition() {
    return { ...position.value };
  },
  setPosition(newPosition) {
    position.value = { ...newPosition };
    updatePositionInfo();
  },
  resetPosition() {
    position.value = { ...props.initialPosition };
    updatePositionInfo();
  }
});

</script>

<style lang="scss" scoped>
.positioned-slot {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  transition: transform 0.05s ease;
  cursor: move;

  &>* {
    cursor: inherit;
  }
}
</style>