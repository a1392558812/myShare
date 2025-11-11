<template>
  <div class="cube-wrapper" @mousedown="onMouseDown">
    <div class="cube-container" :style="containerStyle">
      <div class="cube" :class="{ 'is-flipped': isFlipped }" :style="cubeStyle" :data-axis="axis">
        <div class="cube-face front">
          <slot name="front">
            <div class="default-content">
              <div class="content-title">正面</div>
            </div>
          </slot>
        </div>
        <div class="cube-face back">
          <slot name="back">
            <div class="default-content">
              <div class="content-title">背面</div>
            </div>
          </slot>
        </div>
        <div class="cube-face right">
          <slot name="right">
            <div class="default-content">
              <div class="content-title">右侧</div>
            </div>
          </slot>
        </div>
        <div class="cube-face left">
          <slot name="left">
            <div class="default-content">
              <div class="content-title">左侧</div>
            </div>
          </slot>
        </div>
        <div class="cube-face top">
          <slot name="top">
            <div class="default-content">
              <div class="content-title">顶部</div>
            </div>
          </slot>
        </div>
        <div class="cube-face bottom">
          <slot name="bottom">
            <div class="default-content">
              <div class="content-title">底部</div>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeUnmount } from 'vue';

const props = defineProps({
  axis: { type: String, default: 'y', validator: (v) => ['x', 'y', 'z'].includes(v) },
  angle: { type: Number, default: 180 },
  isFlipped: { type: Boolean, default: false },
  duration: { type: Number, default: 0.6 },
  width: { type: String, default: '300px' },
  height: { type: String, default: '400px' },
  perspective: { type: String, default: '1000px' },
  direction: { type: String, default: 'normal', validator: (v) => ['normal', 'reverse'].includes(v) },
  offsetXPercent: { type: Number, default: 0 },
  offsetYPercent: { type: Number, default: 0 },
  offsetZPx: { type: Number, default: 0 },
  rotationMode: { type: String, default: 'axis', validator: (v) => ['axis', 'center'].includes(v) },
  centerYaw: { type: Number, default: 0 },
  centerPitch: { type: Number, default: 0 },
  centerRoll: { type: Number, default: 0 },
  enableDrag: { type: Boolean, default: true },
  dragSensitivity: { type: Number, default: 0.6 },
});

const emit = defineEmits(['update:centerYaw', 'update:centerPitch', 'update:centerRoll']);

const containerStyle = computed(() => {
  return {
    perspective: props.perspective,
    width: props.width,
    height: props.width,
    '--size': props.width,
  };
});

const cubeStyle = computed(() => {
  const base = {
    transition: `transform ${props.duration}s ease-in-out`,
  };

  if (props.rotationMode === 'center') {
    const yaw = props.centerYaw || 0;
    const pitch = props.centerPitch || 0;
    const roll = props.centerRoll || 0;
    const transform = `translateZ(${-500 + props.offsetZPx}px) rotateX(${pitch}deg) rotateY(${yaw}deg) rotateZ(${roll}deg)`;
    return {
      ...base,
      transform,
      transformOrigin: '50% 50%'
    };
  }

  let rotateAxis = props.axis === 'x' ? 'x' : props.axis === 'z' ? 'z' : 'y';
  const rotateDirection = props.direction === 'reverse' ? -1 : 1;
  const rotation = `rotate${rotateAxis.toUpperCase()}(${props.isFlipped ? props.angle * rotateDirection : 0}deg)`;
  const transform = `translateZ(${-500 + props.offsetZPx}px) ${rotation}`;
  return {
    ...base,
    transform,
    transformOrigin: `${50 + props.offsetXPercent}% ${50 + props.offsetYPercent}%`
  };
});

const isDragging = ref(false);
let lastX = 0, lastY = 0;

const addWindowListeners = () => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};
const removeWindowListeners = () => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
};

const onMouseDown = (e) => {
  if (!(props.rotationMode === 'center' && props.enableDrag)) return;
  isDragging.value = true;
  lastX = e.clientX;
  lastY = e.clientY;
  addWindowListeners();
};
const onMouseMove = (e) => {
  if (!isDragging.value || !(props.rotationMode === 'center' && props.enableDrag)) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  const factor = props.dragSensitivity || 0.6;
  let newYaw = (props.centerYaw || 0) + dx * factor;
  let newPitch = (props.centerPitch || 0) - dy * factor;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  newYaw = clamp(newYaw, -360, 360);
  newPitch = clamp(newPitch, -360, 360);
  emit('update:centerYaw', Math.round(newYaw));
  emit('update:centerPitch', Math.round(newPitch));
};
const onMouseUp = () => {
  if (!(props.rotationMode === 'center' && props.enableDrag)) return;
  isDragging.value = false;
  removeWindowListeners();
};

onBeforeUnmount(() => {
  removeWindowListeners();
});
</script>

<style lang="scss" scoped>
.cube-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  .cube-container {
    display: inline-block;
    position: relative;
    perspective: 1000px;

    .cube {
      position: relative;
      width: var(--size);
      height: var(--size);
      transform-style: preserve-3d;
      cursor: pointer;
      pointer-events: auto;
    }

    .cube-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: all 0.3s ease;
      pointer-events: none;
    }

    .cube-face.front {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transform: translateZ(calc(var(--size) / 2));
    }

    .cube-face.back {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      transform: rotateY(180deg) translateZ(calc(var(--size) / 2));
    }

    .cube-face.right {
      background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
      transform: rotateY(90deg) translateZ(calc(var(--size) / 2));
    }

    .cube-face.left {
      background: linear-gradient(135deg, #ff512f 0%, #dd2476 100%);
      transform: rotateY(-90deg) translateZ(calc(var(--size) / 2));
    }

    .cube-face.top {
      background: linear-gradient(135deg, #24c6dc 0%, #514a9d 100%);
      transform: rotateX(90deg) translateZ(calc(var(--size) / 2));
    }

    .cube-face.bottom {
      background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
      transform: rotateX(-90deg) translateZ(calc(var(--size) / 2));
    }

    .default-content {
      text-align: center;
      color: white;
      padding: 20px;

      .content-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
    }
  }
}
</style>