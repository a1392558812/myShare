<template>
  <CanvasComponent :x-unit="xUnit" :y-unit="yUnit" :line-color="lineColor" :active-line-color="activeLineColor"
    :specialBorderLineColor="specialBorderLineColor" :specialCenterLineColor="specialCenterLineColor"
    :line-width="lineWidth" :adsorption-distance="adsorptionDistance" :showOverlayGuide="showOverlayGuide"
    :nearby-threshold="nearbyThreshold" :show-guide="showGuide" :show-special-guide="showSpecialGuide">
    <template #default="{ adsorptionInfo }">
      <PositionedSlot v-for="(slotItem, index) in slotItems" :key="slotItem.id" :element-id="slotItem.id"
        :initial-position="slotItem.initialPosition" :showOverlayGuide="showOverlayGuide"
        :adsorption-info="adsorptionInfo" :z-index="slotItem.zIndex" :nearby-threshold="nearbyThreshold"
        @drag-start="(e) => handleDragStart(e, slotItem, index)" @drag-move="(e) => handleDragMove(e, slotItem, index)"
        @drag-end="(e) => handleDragEnd(e, slotItem, index)"
        @nearby-slot-detected="(e) => handleNearbySlotDetected(e, slotItem, index)"
        @slot-overlapped="(e) => handleSlotOverlapped(e, slotItem, index)">
        <slot :name="`${slotItem.name}-${index}`" :element-id="slotItem.id"></slot>
      </PositionedSlot>
    </template>
  </CanvasComponent>
</template>

<script setup>
import { ref, computed, useSlots } from 'vue';
import CanvasComponent from './CanvasComponent.vue';
import PositionedSlot from './PositionedSlot.vue';

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
    default: 'rgba(200, 200, 200, 0.3)'
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
  showGuide: {
    type: Boolean,
    default: true
  },
  showOverlayGuide: {
    type: Boolean,
    default: true
  },
  lineWidth: {
    type: Number,
    default: 1
  },
  adsorptionDistance: {
    type: Number,
    default: 5
  },
  slotItems: {
    type: Array,
    default: () => []
  },
  nearbyThreshold: {
    type: Number,
    default: 10
  },
  showSpecialGuide: {
    type: Boolean,
    default: true
  }
});
const emit = defineEmits([
  'dragStart',
  'dragMove',
  'dragEnd',
  'nearbySlotDetected',
  'slotOverlapped'
]);
const elementsPositions = ref({});

const handleDragStart = (event, row, index) => {
  emit('dragStart', {
    ...event,
    row,
    index,
    allPositions: { ...elementsPositions.value }
  });
}
const handleDragMove = (event, row, index) => {
  emit('dragMove', {
    ...event,
    row,
    index,
    allPositions: { ...elementsPositions.value }
  });
}
const handleDragEnd = (event, row, index) => {
  emit('dragEnd', {
    ...event,
    row,
    index,
    allPositions: { ...elementsPositions.value }
  });
}

const handleNearbySlotDetected = (event, row, index) => {
  emit('nearbySlotDetected', {
    ...event,
    row,
    index,
    allPositions: { ...elementsPositions.value }
  });
};

const handleSlotOverlapped = (event, row, index) => {
  emit('slotOverlapped', {
    ...event,
    row,
    index,
    allPositions: { ...elementsPositions.value }
  });
};
defineExpose({
  getElementPosition(elementId) {
    return elementsPositions.value[elementId] || null;
  },
  getAllPositions() {
    return { ...elementsPositions.value };
  },
  setElementPosition(elementId, position) {
    elementsPositions.value[elementId] = { ...position };
    emit('positionChanged', {
      elementId,
      ...position,
      allPositions: { ...elementsPositions.value }
    });
  }
});
</script>

<style lang="scss" scoped></style>