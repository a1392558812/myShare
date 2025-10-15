<template>
  <div class="parallax-card-container" ref="containerRef" @mousemove="handleMouseMove" @mouseleave="resetCard">
    <div class="card" :style="cardStyle">
      <div class="card-background" :style="getElementStyle('background')">
        <div class="bg-pattern"></div>
        <div class="bg-gradient-overlay"></div>
      </div>

      <div v-for="(element, index) in elements" :key="index" :class="['card-element', `element-${index}`]"
        :style="getElementStyle(`element${index}`)">
        <slot :name="`element-${index}`">
          <div class="default-element">
            <div class="element-circle" :class="`circle-${index % 3 + 1}`"></div>
          </div>
        </slot>
      </div>

      <div class="card-decoration decoration-top" :style="getElementStyle('decorationTop')"></div>
      <div class="card-decoration decoration-bottom" :style="getElementStyle('decorationBottom')"></div>

      <div class="card-title" :style="getElementStyle('title')">
        <slot name="title">{{ title }}</slot>
      </div>

      <div class="card-description" :style="getElementStyle('description')">
        <slot name="description">{{ description }}</slot>
      </div>

      <div class="card-button-container" :style="getElementStyle('button')">
        <slot name="button">
          <button class="card-button">
            <span>{{ buttonText }}</span>
            <svg class="button-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </svg>
          </button>
        </slot>
      </div>

      <div class="card-highlight"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '3D卡片'
  },
  description: {
    type: String,
    default: '这是一个带有3D卡片示例114514'
  },
  buttonText: {
    type: String,
    default: '了解更多'
  },
  zOffsets: {
    type: Object,
    default: () => ({
      background: 0,
      title: 20,
      description: 15,
      button: 10,
      decorationTop: 5,
      decorationBottom: 8
    })
  },
  elements: {
    type: Number,
    default: 0
  },
  sensitivity: {
    type: Number,
    default: 1
  }
});

const containerRef = ref(null);
const mousePosition = ref({ x: 0, y: 0 });
const isHovered = ref(false);

const getElementStyle = (elementName) => {
  const zValue = props.zOffsets[elementName] || 0;
  const zIndex = 100 + Math.max(0, zValue);

  const baseStyle = {
    transform: `translateZ(${zValue}px)`,
    zIndex: zIndex,
    transition: 'transform 0.1s ease-out'
  };

  if (isHovered.value) {
    const depthFactor = 1 + (Math.abs(zValue) / 100);
    const translateX = mousePosition.value.x * props.sensitivity * depthFactor;
    const translateY = mousePosition.value.y * props.sensitivity * depthFactor;

    return {
      ...baseStyle,
      transform: `translate3d(${translateX}px, ${translateY}px, ${zValue}px)`
    };
  }

  return baseStyle;
};

const cardStyle = computed(() => {
  let transform = 'perspective(1000px)';

  if (isHovered.value) {
    const rotateX = -(mousePosition.value.y * props.sensitivity * 2);
    const rotateY = (mousePosition.value.x * props.sensitivity * 2);
    transform += ` rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  } else {
    transform += ' rotateX(0deg) rotateY(0deg)';
  }

  return {
    transform: transform,
    transition: isHovered.value ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
    boxShadow: isHovered.value ?
      `0 ${20 + Math.abs(mousePosition.value.y * 10)}px ${30 + Math.abs(mousePosition.value.x * 10)}px rgba(0, 0, 0, 0.2)` :
      '0 10px 20px rgba(0, 0, 0, 0.15)'
  };
});

const handleMouseMove = (event) => {
  if (!containerRef.value) return;

  isHovered.value = true;
  const rect = containerRef.value.getBoundingClientRect();
  const card = containerRef.value.querySelector('.card');

  const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
  const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

  if (card) {
    card.style.setProperty('--mouse-x', `${xPercent}%`);
    card.style.setProperty('--mouse-y', `${yPercent}%`);
  }

  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;

  mousePosition.value = { x, y };
};

const resetCard = () => {
  isHovered.value = false;
  mousePosition.value = { x: 0, y: 0 };
};

defineExpose({
  resetCard,
  setMousePosition: (position) => {
    mousePosition.value = position;
  }
});
</script>

<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.parallax-card-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 450px;
  width: 320px;
  perspective: 1200px;
  cursor: pointer;
  margin: 0 auto;

  .card {
    position: relative;
    width: 100%;
    height: 100%;
    background: white;
    border-radius: $border-radius + 8px;
    overflow: hidden;
    transform-style: preserve-3d;
    transition: all $transition-speed;

    &:hover {
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25), 0 0 60px rgba(100, 150, 255, 0.2);
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.15), transparent 50%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 1000;
    }

    &:hover::before {
      opacity: 1;
    }

    &::after {
      content: '';
      position: absolute;
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
      border-radius: $border-radius + 12px;
      background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(100, 150, 255, 0.2), transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
      filter: blur(10px);
    }

    &:hover::after {
      opacity: 1;
    }

    .card-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      background: linear-gradient(135deg,
          rgba(102, 126, 234, 0.9) 0%,
          rgba(118, 75, 162, 0.9) 100%);

      .bg-pattern {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
          radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 30%);
        opacity: 0.6;
      }

      .bg-gradient-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to bottom,
            rgba(102, 126, 234, 0.2) 0%,
            rgba(118, 75, 162, 0.8) 100%);
      }
    }

    .card-element {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0.8;
      pointer-events: none;

      .default-element {
        display: flex;
        justify-content: center;
        align-items: center;

        .element-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          position: relative;
          animation: pulse 4s infinite ease-in-out;

          &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
          }
        }

        .circle-1 {
          background: rgba(255, 209, 102, 0.2);
          border-color: rgba(255, 209, 102, 0.4);

          &::before {
            background: rgba(255, 209, 102, 0.3);
          }
        }


        .circle-2 {
          background: rgba(102, 255, 191, 0.2);
          border-color: rgba(102, 255, 191, 0.4);

          &::before {
            background: rgba(102, 255, 191, 0.3);
          }
        }

        .circle-3 {
          background: rgba(179, 102, 255, 0.2);
          border-color: rgba(179, 102, 255, 0.4);

          &::before {
            background: rgba(179, 102, 255, 0.3);
          }
        }
      }
    }

    .card-decoration {
      position: absolute;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(5px);
      opacity: 0.7;
    }

    .decoration-top {
      top: -20px;
      right: -20px;
      width: 80px;
      height: 80px;
      border-radius: 50%;
    }

    .decoration-bottom {
      bottom: -30px;
      left: -30px;
      width: 100px;
      height: 100px;
      border-radius: 50%;
    }

    .card-title {
      position: absolute;
      top: 80px;
      left: 0;
      width: 100%;
      text-align: center;
      font-size: 2rem;
      font-weight: bold;
      color: white;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      letter-spacing: 0.5px;
    }

    .card-description {
      position: absolute;
      top: 140px;
      left: 0;
      width: 100%;
      padding: 0 30px;
      text-align: center;
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      box-sizing: border-box;
      line-height: 1.6;
      font-weight: 400;
    }

    .card-button-container {
      position: absolute;
      bottom: 80px;
      left: 0;
      width: 100%;
      display: flex;
      justify-content: center;

      ::v-deep(.card-button) {
        padding: 12px 28px;
        background: white;
        color: #667eea;
        border: none;
        border-radius: 50px;
        font-weight: 600;
        cursor: pointer;
        transition: all $transition-speed;
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        overflow: hidden;
        position: relative;
        z-index: 1;
        backdrop-filter: blur(5px);

        &:hover {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.5s ease;
          z-index: -1;
        }

        &:hover::before {
          left: 100%;
        }

        .button-icon {
          transition: transform 0.3s ease;
        }

        &:hover .button-icon {
          transform: translateX(3px);
        }
      }
    }
  }

  .card-highlight {
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: skewX(-20deg);
    animation: shimmer 3s infinite linear;
    z-index: 500;
    pointer-events: none;
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 150%;
  }
}
</style>