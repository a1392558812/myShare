<template>
  <div ref="paneRef" class="pane-content" :style="wrapStyle" :class="{ 'has-scroll': needsScroll }">
    <slot :size="size" :isDragging="isDragging"></slot>
    <div class="drag-bar" v-if="showSplitter" :style="computedDragBarStyle" @mousedown="startDragging"
      :class="{ 'dragging': isDragging }">
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, onUnmounted, ref, computed } from 'vue';

const props = defineProps({
  maxSize: {
    type: Number,
    default: 9999
  },
  minSize: {
    type: Number,
    default: 0
  }
});

const allotment = inject('allotment');
const paneRef = ref(null);

const currentId = Symbol('allotment-pane');
const isDragging = ref(false);
const startPosition = ref(0);
const startSize = ref(0);
const wrapStyle = ref({});
const size = ref(0);

const computedDragBarStyle = computed(() => {
  let baseStyle = {};

  if (isVertical.value) {
    baseStyle = {
      right: 0,
      bottom: 0,
      top: 'auto',
      width: '100%',
      height: '4px',
      cursor: 'ns-resize',
    }
  } else {
    baseStyle = {
      right: 0,
      top: 0,
      width: '4px',
      height: '100%',
      cursor: 'ew-resize',
    }
  }

  Object.assign(baseStyle, allotment.dragBarStyle.value);

  if (isDragging.value) {
    Object.assign(baseStyle, allotment.activeDragBarStyle.value);
  }

  return baseStyle;
});
const isVertical = computed(() => {
  return allotment?.vertical?.value || false
});

const needsScroll = computed(() => {
  return false;
});

const showSplitter = computed(() => {
  return (allotment.panes.value.length - 1) !== allotment.panes.value.findIndex(pane => pane.id === currentId);
});
const startDragging = (event) => {
  event.preventDefault();
  isDragging.value = true;
  startPosition.value = isVertical.value ? event.clientY : event.clientX;
  const paneElement = event.target.closest('.pane-content');
  if (paneElement) {
    startSize.value = isVertical.value ? paneElement.offsetHeight : paneElement.offsetWidth;
  }
  document.addEventListener('mousemove', handleDragging);
  document.addEventListener('mouseup', stopDragging);
  document.body.style.userSelect = 'none';
  document.body.style.cursor = isVertical.value ? 'ns-resize' : 'ew-resize';
  allotment.startDragging({
    id: currentId,
  });
};
const handleDragging = (event) => {
  if (!isDragging.value) return;
  const delta = isVertical.value
    ? event.clientY - startPosition.value
    : event.clientX - startPosition.value;
  let newSize = startSize.value + delta;
  console.log('handleDragging-newSize', newSize);
  if (props.minSize !== undefined || (allotment && allotment.minSize !== undefined)) {
    newSize = Math.max(newSize, props.minSize !== undefined ? props.minSize : (allotment.minSize.value || 0));
  }
  if (props.maxSize !== undefined || (allotment && allotment.maxSize !== undefined)) {
    newSize = Math.min(newSize, props.maxSize !== undefined ? props.maxSize : (allotment.maxSize.value || 999));
  }
  if (allotment && allotment.updatePaneSize) {
    allotment.handleDragging({
      id: currentId,
    });
    allotment.updatePaneSize(currentId, newSize);
  }
};
const setSize = (newSize) => {
  setPaneSize(newSize);
  const dimension = isVertical.value ? 'height' : 'width';
  wrapStyle.value = {
    [dimension]: `${newSize}px`
  };
}

const setPaneSize = (newSize) => {
  size.value = newSize;
}

const stopDragging = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleDragging);
  document.removeEventListener('mouseup', stopDragging);
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
  allotment.stopDragging({
    id: currentId,
  });
};


onMounted(() => {
  if (allotment) {
    setTimeout(() => {
      allotment.registerPane({
        id: currentId,
        maxSize: props.maxSize,
        minSize: props.minSize,
        paneRef: paneRef.value,
        size,
        setSize,
        setPaneSize,
      });
    }, 0);
  }
});

onUnmounted(() => {
  if (allotment) {
    allotment.unregisterPane({
      id: currentId
    });
  }

  document.removeEventListener('mousemove', handleDragging);
  document.removeEventListener('mouseup', stopDragging);
});
</script>

<style lang="scss" scoped>
.pane-content {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;

  .drag-bar {
    position: absolute;
    background-color: transparent;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.1);
    background-color: rgba(52, 152, 219, 0.1);

    &:hover {
      box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
      background-color: rgba(52, 152, 219, 0.3);
    }

    &.dragging {
      box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
      background-color: rgba(52, 152, 219, 0.5);
    }
  }

  :deep(.has-scroll) {
    overflow: auto;
  }
}
</style>