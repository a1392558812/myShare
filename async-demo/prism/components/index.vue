<template>
  <div class="prism-container" :style="containerStyle" ref="prismContainer">
    <div class="prism-wrapper" :style="wrapperStyle">
      <div class="prism" :style="prismStyle" ref="prism">
        <div class="coordinate-axis">
          <div class="axis x-axis" :style="axisXStyle"></div>
          <div class="axis y-axis" :style="axisYStyle"></div>
          <div class="axis z-axis" :style="axisZStyle"></div>
        </div>
        <div class="prism-face top" :style="[prismFaceStyle, topFaceStyle]">上底</div>
        <div class="prism-face bottom" :style="[prismFaceStyle, bottomFaceStyle]">下底</div>
        <div v-for="i in n" :key="`side-${i}`" class="prism-face side" :style="[prismFaceStyle, getSideFaceStyle(i)]">{{
          i }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  n: {
    type: Number,
    default: 3,
    validator: (value) => value >= 3
  },
  gap: {
    type: Number,
    default: 0
  },
  sideWidth: {
    type: Number,
    default: 150
  },
  sideHeight: {
    type: Number,
    default: 200
  },
  scale: {
    type: Number,
    default: 1
  },
  minScale: {
    type: Number,
    default: 0.3
  },
  maxScale: {
    type: Number,
    default: 3
  },
  sideStyle: {
    type: Object,
    default: () => []
  },
  topStyle: {
    type: Object,
    default: () => ({})
  },
  bottomStyle: {
    type: Object,
    default: () => ({})
  },
  rotationX: {
    type: Number,
    default: 20
  },
  rotationY: {
    type: Number,
    default: 30
  },
  customContainerStyle: {
    type: Object,
    default: () => ({})
  },
  customWrapperStyle: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['cssStyle', 'update:scale', 'update:rotationX', 'update:rotationY']);

const prismContainer = ref(null);
const animationDuration = 0.5;

const angleStep = computed(() => 360 / props.n);

const radius = computed(() => {
  const halfAngle = (angleStep.value / 2) * Math.PI / 180;
  return (props.sideWidth / 2) / Math.tan(halfAngle);
});

let isDragging = ref(false);
let lastMouseX = ref(0);
let lastMouseY = ref(0);

const zoomSensitivity = 0.05;

const outerSquareSide = computed(() => {
  const rad = Math.PI / props.n;
  return props.sideWidth / Math.sin(rad);
})

const axisXStyle = computed(() => ({
  position: 'absolute',
  width: `${outerSquareSide.value + props.gap}px`,
  height: '2px',
  backgroundColor: 'red',
  left: '50%',
  top: '50%',
  transformOrigin: 'left center',
  transform: 'translateY(-50%)'
}));

const axisYStyle = computed(() => ({
  position: 'absolute',
  width: '2px',
  height: `${props.sideHeight + props.gap}px`,
  backgroundColor: 'green',
  left: '50%',
  top: '50%',
  transformOrigin: 'top center',
  transform: 'translateX(-50%)  translateY(-100%)'
}));

const axisZStyle = computed(() => ({
  position: 'absolute',
  width: '2px',
  height: `${outerSquareSide.value + props.gap}px`,
  backgroundColor: 'blue',
  left: '50%',
  top: '50%',
  transformOrigin: 'bottom center',
  transform: 'translateX(-50%) translateY(-100%) rotateX(90deg)'
}));

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  minHeight: '500px',
  backgroundColor: '#f0f0f0',
  borderRadius: '8px',
  overflow: 'hidden',
  ...props.customContainerStyle
}));

const wrapperStyle = computed(() => ({
  perspective: '1000px',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: isDragging.value ? 'grabbing' : 'grab',
  ...props.customWrapperStyle
}));

const prismStyle = computed(() => ({
  position: 'relative',
  transformStyle: 'preserve-3d',
  transformOrigin: 'center',
  transform: `rotateX(${props.rotationX}deg) rotateY(${props.rotationY}deg) scale3d(${props.scale},${props.scale},${props.scale})`,
  transition: `transform ${animationDuration}s ease`
}));

const prismFaceStyle = computed(() => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transition: `all ${animationDuration}s ease`,
  backfaceVisibility: 'visible',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none',
  backgroundColor: '#81C784',
}));

const topFaceStyle = computed(() => {
  return {
    width: `${outerSquareSide.value}px`,
    height: `${outerSquareSide.value}px`,
    transform: `translate(-50%, -50%) translateY(${-props.sideHeight / 2 - props.gap}px) rotateX(90deg) rotateZ(${0}deg)`,
    clipPath: getPolygonClipPath(props.n),
    ...props.topStyle
  };
});

const bottomFaceStyle = computed(() => {
  return {
    width: `${outerSquareSide.value}px`,
    height: `${outerSquareSide.value}px`,
    transform: `translate(-50%, -50%) translateY(${props.sideHeight / 2 + props.gap}px) rotateX(90deg) rotateZ(${0}deg)`,
    clipPath: getPolygonClipPath(props.n),
    ...props.bottomStyle
  };
});

const getSideFaceStyle = (index) => {
  const startAngle = props.n % 2 === 0 ? angleStep.value / 2 : 0;
  const angle = startAngle + (index - 1) * angleStep.value;
  const currentSideStyle = props.sideStyle[index - 1] || {};

  return {
    width: `${props.sideWidth}px`,
    height: `${props.sideHeight}px`,
    transform: `translateX(-50%) translateY(-50%) rotateY(${angle}deg) translateZ(${radius.value + props.gap}px)`,
    ...currentSideStyle
  };
};

const getPolygonClipPath = (sides) => {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x = 50 + 50 * Math.cos(angle);
    const y = 50 + 50 * Math.sin(angle);
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(', ')})`;
};

const handleMouseDown = (e) => {
  isDragging.value = true;
  lastMouseX.value = e.clientX;
  lastMouseY.value = e.clientY;
};

const handleMouseMove = (e) => {
  if (!isDragging.value) return;

  const deltaX = e.clientX - lastMouseX.value;
  const deltaY = e.clientY - lastMouseY.value;

  const targetRotationY = props.rotationY + deltaX * 0.5;
  const targetRotationX = props.rotationX - deltaY * 0.5;

  const clampedRotationX = Math.max(-90, Math.min(90, targetRotationX));
  emit('update:rotationX', clampedRotationX);
  emit('update:rotationY', targetRotationY);

  lastMouseX.value = e.clientX;
  lastMouseY.value = e.clientY;
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handleMouseLeave = () => {
  isDragging.value = false;
};

const handleWheel = (e) => {
  e.preventDefault();
  const zoomFactor = e.deltaY > 0 ? (1 - zoomSensitivity) : (1 + zoomSensitivity);
  let newScale = props.scale * zoomFactor;
  newScale = Math.max(props.minScale, Math.min(props.maxScale, newScale));
  emit('update:scale', newScale);
};

watch(() => [containerStyle.value, wrapperStyle.value, prismStyle.value, topFaceStyle.value, bottomFaceStyle.value, props.n], () => {
  const cssStyle = {
    containerStyle: containerStyle.value,
    wrapperStyle: wrapperStyle.value,
    prismStyle: prismStyle.value,
    topFaceStyle: topFaceStyle.value,
    prismFaceStyle: prismFaceStyle.value,
    bottomFaceStyle: bottomFaceStyle.value,
  }
  for (let i = 0; i < props.n || 0; i++) {
    cssStyle[`side${i}`] = getSideFaceStyle(i + 1);
  }
  emit('cssStyle', cssStyle);
}, { immediate: true });

onMounted(() => {
  if (prismContainer.value) {
    prismContainer.value.addEventListener('mousedown', handleMouseDown);
    prismContainer.value.addEventListener('wheel', handleWheel, { passive: false });
  }

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('mouseleave', handleMouseLeave);
});

onUnmounted(() => {
  if (prismContainer.value) {
    prismContainer.value.removeEventListener('mousedown', handleMouseDown);
    prismContainer.value.removeEventListener('wheel', handleWheel);
  }

  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('mouseleave', handleMouseLeave);
});
</script>

<style scoped lang="scss">
.prism-container {
  .prism-wrapper {
    .prism {
      .prism-face {
        &:hover {
          opacity: 0.5;
          transition: opacity 0.2s ease;
        }
      }

      .coordinate-axis {
        position: absolute;
        left: 50%;
        top: 50%;
        transform-style: preserve-3d;
        user-select: none;

        .axis {
          position: absolute;
          transform-style: preserve-3d;
          user-select: none;

          &::after {
            content: '';
            position: absolute;
            width: 0;
            height: 0;
            border-style: solid;
          }
        }

        .x-axis::after {
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          border-width: 5px 0 5px 10px;
          border-color: transparent transparent transparent red;
        }

        .y-axis::after {
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 5px 10px 5px;
          border-color: transparent transparent green transparent;
        }

        .z-axis::after {
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 5px 10px 5px;
          border-color: transparent transparent blue transparent;
        }
      }
    }
  }
}
</style>