<template>
  <div class="flipbook-stage" @mousedown="onMouseDown" @wheel.prevent="onWheel" :class="{ dragging: isDragging }">
    <div :style="contentStyle" class="flipbook-stage-content">
      <div class="book" :style="bookStyle">
        <!-- 封面（正面） -->
        <div class="cover front" :style="pageStyle(0, false)">
          <div class="page-face front-face">
            <slot name="cover-front">{{ coverFront }}</slot>
          </div>
          <div v-if="doubleSided" class="page-face back-face">
            <slot name="cover-back">{{ coverBack }}</slot>
          </div>
        </div>

        <!-- 中间页 -->
        <div v-for="(p, i) in innerPages" :key="i" class="page" :style="pageStyle(i + 1, false)">
          <div class="page-face front-face">
            <slot :name="`page-${i + 1}-front`">{{ p.front }}</slot>
          </div>
          <div v-if="doubleSided" class="page-face back-face">
            <slot :name="`page-${i + 1}-back`">{{ p.back ?? '' }}</slot>
          </div>
        </div>

        <!-- 尾页（背面） -->
        <div class="cover back" :style="pageStyle(totalPages - 1, true)">
          <div class="page-face front-face">
            <slot name="back-front">{{ backFront }}</slot>
          </div>
          <div v-if="doubleSided" class="page-face back-face">
            <slot name="back-back">{{ backBack }}</slot>
          </div>
        </div>

        <!-- 正在翻动的页 -->
        <div v-if="flipTargetIndex !== null" class="page flipping" :style="flippingStyle">
          <div class="page-face front-face">
            {{ flippingFrontContent }}
          </div>
          <div v-if="doubleSided" class="page-face back-face">
            {{ flippingBackContent }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const emit = defineEmits(['currentPageChange', 'totalPagesChange']);

const props = defineProps({
  pages: { type: Array, default: () => [] },
  coverFront: { type: String, default: '封面' },
  coverBack: { type: String, default: '' },
  backFront: { type: String, default: '' },
  backBack: { type: String, default: '封底背面' },
  doubleSided: { type: Boolean, default: true },
  width: { type: Number, default: 420 },
  height: { type: Number, default: 300 },
  thickness: { type: Number, default: 2 },
  dragSensitivity: { type: Number, default: 1.5 },
  duration: { type: Number, default: 300 },
});

const totalPages = computed(() => 2 + props.pages.length);
const innerPages = computed(() => props.pages);

const contentStyle = computed(() => {
  const style = {}
  if (currentPage.value > 0) {
    if (currentPage.value === totalPages.value) {
      style.width = `${props.width}px`
      return style
    }
    style.width = `${2 * props.width}px`
    return style
  }
  style.width = `${props.width}px`
  return style
});

const bookStyle = computed(() => {
  const style = {
    width: props.width + 'px',
    height: props.height + 'px',
  }
  if (currentPage.value > 0) {
    style.transform = `translateX(${props.width}px)`
  }
  return style
})

const currentPage = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const flipAngle = ref(0); // 0-180
const flipDirection = ref(null); // 'next' | 'prev' | null
const flipTargetIndex = ref(null); // 正在翻动的页的索引

watch([currentPage, totalPages], (newVal, oldVal) => {
  console.log('currentPageChange', newVal, oldVal);
  // currentPageChange totalPagesChange
  if (newVal[0] !== oldVal[0]) {
    emit('currentPageChange', newVal[0] || 0);
  }
  if (newVal[1] !== oldVal[1]) {
    emit('totalPagesChange', newVal[1] || 0);
  }
}, {
  immediate: true,
})

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const pageStyle = (index, isBackCover) => {
  const isBefore = index < currentPage.value;
  const baseZ = (isBefore ? index : -index) * props.thickness;
  const rotateY = isBefore ? -180 : 0;
  return {
    transform: `translateZ(${baseZ < 0 ? 0 : baseZ}px) rotateY(${rotateY}deg)`,
    zIndex: isBefore ? index : (totalPages.value - index),
  };
};

const flippingStyle = computed(() => {
  if (flipTargetIndex.value === null) return {
    transition: `transform ${props.duration}ms`
  };
  const baseZ = flipTargetIndex.value * props.thickness + 2;
  const angle = flipDirection.value === 'next' ? -flipAngle.value : 180 - flipAngle.value;
  return {
    transform: `translateZ(${baseZ}px) rotateY(${angle}deg)`,
    zIndex: totalPages.value + 10,
    transition: `transform ${props.duration}ms`
  };
});

const flippingFrontContent = computed(() => {
  if (flipTargetIndex.value === null) return '';
  if (flipTargetIndex.value === 0) return props.coverFront;
  if (flipTargetIndex.value === totalPages.value) return props.backFront;
  const innerIdx = flipTargetIndex.value - 1;
  return props.pages[innerIdx]?.front ?? '';
});

const flippingBackContent = computed(() => {
  if (flipTargetIndex.value === null) return '';
  if (flipTargetIndex.value === 0) return props.coverBack;
  if (flipTargetIndex.value === totalPages.value) return props.backBack;
  const innerIdx = flipTargetIndex.value - 1;
  return props.pages[innerIdx]?.back ?? '';
});

const startFlip = (direction) => {
  flipDirection.value = direction;
  flipTargetIndex.value = direction === 'next' ? currentPage.value : currentPage.value;
  flipAngle.value = 0;
};

const commitFlip = () => {
  if (flipDirection.value === 'next') {
    currentPage.value = clamp(currentPage.value + 1, 0, totalPages.value);
  } else if (flipDirection.value === 'prev') {
    currentPage.value = clamp(currentPage.value - 1, 0, totalPages.value);
  }
  resetFlip();
};

const revertFlip = () => {
  resetFlip();
};

const resetFlip = () => {
  flipAngle.value = 0;
  flipDirection.value = null;
  flipTargetIndex.value = null;
};

const onMouseDown = (e) => {
  isDragging.value = true;
  startX.value = e.clientX;
  flipDirection.value = null;
  flipTargetIndex.value = null;
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};

const onMouseMove = (e) => {
  if (!isDragging.value) return;
  const dx = e.clientX - startX.value;
  if (!flipDirection.value) {
    if (dx < -5 && currentPage.value < totalPages.value) {
      startFlip('next');
    } else if (dx > 5 && currentPage.value > 0) {
      startFlip('prev');
    } else {
      return;
    }
  }
  const deltaAngle = clamp(Math.abs(dx) * props.dragSensitivity, 0, 180);
  flipAngle.value = deltaAngle;
};

const onMouseUp = () => {
  isDragging.value = false;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
  if (!flipDirection.value) return;
  if (flipAngle.value > 90) commitFlip(); else revertFlip();
};

const onWheel = (e) => {
  const delta = e.deltaY;
  if (delta > 0) nextPage(); else prevPage();
};

const nextPage = () => {
  console.log('nextPage', currentPage.value, totalPages.value);
  if (currentPage.value >= totalPages.value) return;
  startFlip('next');
  flipAngle.value = 180;
  commitFlip();
};

const prevPage = () => {
  if (currentPage.value <= 0) return;
  startFlip('prev');
  flipAngle.value = 180;
  commitFlip();
};

const goTo = (page) => {
  const target = clamp(page, 0, totalPages.value);
  if (target === currentPage.value) return;
  resetFlip();
  currentPage.value = target;
};


defineExpose({
  nextPage,
  prevPage,
  goTo,
})
</script>

<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.flipbook-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  user-select: none;
  cursor: grab;

  &.dragging {
    cursor: grabbing;
  }

  .flipbook-stage-content {
    .book {
      perspective: 1200px;
      background: white;
      // box-shadow: $shadow-light;
      border-radius: $border-radius;
      position: relative;
      transform-style: preserve-3d;

      .page,
      .cover {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        transform-origin: left center;
        transition: transform $transition-speed;
        border-radius: $border-radius;
        box-shadow: $shadow-light;

        .page-face {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: $spacing-md;
          font-size: 16px;
          border-radius: $border-radius;
          backface-visibility: hidden;
          transform: translateZ(0.6px); // Z轴奇怪抖动，不知道为啥，加了就没事了
        }

        .front-face {
          background: #fff;
          color: $dark-gray;
        }

        .back-face {
          background: lighten($primary-color, 45%);
          color: $secondary-color;
          transform: rotateY(180deg) translateZ(0.6px);
        }
      }

      .page.flipping {
        transition: none;
      }
    }
  }
}
</style>