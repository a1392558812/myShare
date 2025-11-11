<template>
  <div ref="containerRef" class="allotment-container" :class="{ 'vertical-layout': vertical }">
    <slot></slot>
  </div>
</template>

<script setup>
import { provide, ref, toRefs, watch, onMounted, nextTick } from 'vue'

const emit = defineEmits(['startDragging', 'handleDragging', 'stopDragging', 'layoutError']);

const props = defineProps({
  maxSize: {
    type: Number,
    default: 999
  },
  minSize: {
    type: Number,
    default: 0
  },
  vertical: {
    type: Boolean,
    default: false
  },
  defaultProportion: {
    type: Array,
    default: () => []
  },
  dragBarStyle: {
    type: Object,
    default: () => ({})
  },
  activeDragBarStyle: {
    type: Object,
    default: () => ({})
  },
});
const panes = ref([]);
const containerRef = ref(null);

const getPaneIndex = (id) => {
  return panes.value.findIndex(pane => pane.id === id);
}
const startDragging = ({ id }) => {
  emit('startDragging', { id, panes: panes.value, containerRef: containerRef.value, index: getPaneIndex(id) });
}
const handleDragging = ({ id }) => {
  emit('handleDragging', { id, panes: panes.value, containerRef: containerRef.value, index: getPaneIndex(id) });
}
const stopDragging = ({ id }) => {
  emit('stopDragging', { id, panes: panes.value, containerRef: containerRef.value, index: getPaneIndex(id) });
}
const registerPane = (paneInfo) => {
  const index = getPaneIndex(paneInfo.id);
  if (index === -1) {
    panes.value.push(paneInfo);
    console.log('窗格注册力', paneInfo);
    updateLayout();
    return paneInfo.id;
  } else {
    console.log('窗格已存在', paneInfo);
    return paneInfo.id;
  }
};
const unregisterPane = (paneInfo) => {
  const index = getPaneIndex(paneInfo.id);
  if (index > -1) {
    const removedPane = panes.value.splice(index, 1)[0];
    console.log('窗格注销力', removedPane);
    updateLayout();
  }
};
const updateLayout = () => {
  if (panes.value.length === 0) {
    console.log('updateLayout--panes.value.length === 0', panes.value);
    return;
  }
  if (props.vertical) {
    distributeSpace(panes.value, 'vertical');
  } else {
    distributeSpace(panes.value, 'horizontal');
  }
  console.log('updateLayout', panes.value);
};

const distributeSpace = (paneGroup, direction) => {
  nextTick(() => {
    if (paneGroup.length === 0) return;
    const containerDimension = direction === 'vertical'
      ? containerRef.value?.clientHeight
      : containerRef.value?.clientWidth;

    const totalMinSize = paneGroup.reduce((sum, pane) => sum + (pane.minSize || props.minSize), 0);

    console.log('availableSpace', totalMinSize, direction, containerDimension);
    if (totalMinSize < containerDimension) {
      const proportions = props.defaultProportion || [];
      const useProportions = proportions.length === paneGroup.length || proportions.length === 0;

      let hasLayoutError = false;
      if (useProportions && proportions.length > 0) {
        const totalRatio = proportions.reduce((sum, p) => sum + (parseFloat(p) || 1), 0);
        for (let i = 0; i < paneGroup.length; i++) {
          const pane = paneGroup[i];
          const ratio = parseFloat(proportions[i]) || 1;
          const calculatedSize = containerDimension * (ratio / totalRatio);
          const minRequiredSize = pane.minSize || props.minSize;
          if (calculatedSize < minRequiredSize) {
            hasLayoutError = true;
            break;
          }
        }

        if (hasLayoutError) {
          const errorMessage = '当前设置的比例将导致部分窗格尺寸小于最小尺寸要求，请调整比例设置！';
          emit('layoutError', { message: errorMessage, proportions });
        }
      }

      paneGroup.forEach((pane, index) => {
        let paneSize;
        if (useProportions && proportions.length > 0) {
          const ratio = parseFloat(proportions[index]) || 1;
          const totalRatio = proportions.reduce((sum, p) => sum + (parseFloat(p) || 1), 0);
          paneSize = containerDimension * (ratio / totalRatio);
          console.log('containerDimension', { containerDimension, ratio, totalRatio, paneSize });
        } else {
          const defaultRatio = 1 / paneGroup.length;
          paneSize = containerDimension * defaultRatio;
        }
        updatePaneSize(pane.id, Math.floor(paneSize), true);
      });
    } else {
      console.error('统计pane总最小尺寸大于容器尺寸');
      paneGroup.forEach(pane => {
        updatePaneSize(pane.id, pane.minSize || props.minSize, true);
      });
    }
  })
};
const updatePaneSize = (paneId, newSize, skipAdjacentAdjustment = false) => {
  const pane = panes.value.find(p => p.id === paneId);
  if (!pane) return;
  const minSize = pane.minSize || props.minSize;
  const maxSize = pane.maxSize || props.maxSize;
  let adjustedNewSize = Math.max(newSize, minSize);
  adjustedNewSize = Math.min(adjustedNewSize, maxSize);

  if (!skipAdjacentAdjustment) {
    const oldSize = pane.size || 0;
    let sizeDiff = adjustedNewSize - oldSize;
    if (sizeDiff !== 0) {
      const index = getPaneIndex(paneId);
      if (index !== -1 && index < panes.value.length - 1) {
        const nextPane = panes.value[index + 1];
        const nextPaneCurrentSize = nextPane.size || 0;
        const nextPaneMinSize = nextPane.minSize || props.minSize;
        const nextPaneMaxSize = nextPane.maxSize || props.maxSize;
        let nextPaneNewSize = nextPaneCurrentSize - sizeDiff;
        if (nextPaneNewSize < nextPaneMinSize) {
          const availableReduction = nextPaneCurrentSize - nextPaneMinSize;
          adjustedNewSize = oldSize + (sizeDiff > 0 ? availableReduction : -availableReduction);
          nextPaneNewSize = nextPaneMinSize;
          sizeDiff = adjustedNewSize - oldSize;
          adjustedNewSize = Math.max(adjustedNewSize, minSize);
          adjustedNewSize = Math.min(adjustedNewSize, maxSize);
        }
        else if (nextPaneNewSize > nextPaneMaxSize) {
          const availableIncrease = nextPaneMaxSize - nextPaneCurrentSize;
          adjustedNewSize = oldSize + (sizeDiff > 0 ? -availableIncrease : availableIncrease);
          nextPaneNewSize = nextPaneMaxSize;
          sizeDiff = adjustedNewSize - oldSize;
          adjustedNewSize = Math.max(adjustedNewSize, minSize);
          adjustedNewSize = Math.min(adjustedNewSize, maxSize);
        }

        const direction = props.vertical ? 'vertical' : 'horizontal';
        const containerDimension = direction === 'vertical'
          ? containerRef.value?.clientHeight
          : containerRef.value?.clientWidth;
        if (containerDimension) {
          const totalSizeAfterAdjustment = panes.value.reduce((sum, p) => {
            if (p.id === paneId) return sum + adjustedNewSize;
            if (p.id === nextPane.id) return sum + nextPaneNewSize;
            return sum + (p.size || 0);
          }, 0);
          const totalDiff = totalSizeAfterAdjustment - containerDimension;
          if (Math.abs(totalDiff) > 0) {
            const currentRatio = adjustedNewSize / (adjustedNewSize + nextPaneNewSize);
            const nextRatio = nextPaneNewSize / (adjustedNewSize + nextPaneNewSize);
            adjustedNewSize = Math.max(adjustedNewSize - (totalDiff * currentRatio), minSize);
            nextPaneNewSize = Math.max(nextPaneNewSize - (totalDiff * nextRatio), nextPaneMinSize);
            adjustedNewSize = Math.min(adjustedNewSize, maxSize);
            nextPaneNewSize = Math.min(nextPaneNewSize, nextPaneMaxSize);
          }
        }
        pane.setSize(adjustedNewSize);
        nextPane.setSize(nextPaneNewSize);
        console.log(`窗格尺寸已更新`, {
          currentPane: { id: paneId, oldSize, newSize: adjustedNewSize, diff: adjustedNewSize - oldSize },
          nextPane: { id: nextPane.id, oldSize: nextPaneCurrentSize, newSize: nextPaneNewSize }
        });
      } else {
        pane.setSize(adjustedNewSize);
      }
    } else {
      pane.setSize(adjustedNewSize);
    }
  } else {
    pane.setSize(adjustedNewSize);
  }

  console.log(`窗格 ${paneId.toString()} 尺寸已更新: ${adjustedNewSize}px`);
};

provide('allotment', {
  registerPane,
  unregisterPane,
  updatePaneSize,
  updateLayout,
  startDragging,
  handleDragging,
  stopDragging,
  panes,
  ...toRefs(props)
});

defineExpose({
  updatePaneSize,
  panes
});

watch(() => [
  props.vertical,
  props.defaultProportion.join(','),
  props.minSize,
  props.maxSize,
], (newList, oldList) => {
  for (let i = 0; i < newList.length; i++) {
    if (newList[i] !== oldList[i]) {
      updateLayout();
      break;
    }
  }
});
</script>

<style scoped lang="scss">
.allotment-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: hidden;

  &.vertical-layout {
    flex-direction: column;
  }

  :deep(.pane-content) {
    flex-shrink: 0;
  }
}
</style>