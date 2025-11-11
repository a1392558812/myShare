<template>
  <div :style="{
    transform: 'perspective(' + props.perspective + 'px)',
  }" class="parallax-card-wrap">
    <div class="parallax-card" ref="cardRef" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave"
      :style="cardStyle">
      <div class="card-content">
        <div class="card-title" :style="bodyStyle">{{ cardTitle }}</div>
        <div class="card-body" :style="bodyStyle">{{ cardBody }}</div>
        <button class="card-button" :style="bodyStyle">了解更多</button>
      </div>
      <div class="card-shadow" :style="shadowStyle"></div>
    </div>
  </div>

</template>

<script setup>
import { ref, computed } from 'vue'

// Props定义
const props = defineProps({
  cardTitle: {
    type: String,
    default: '3D视差卡片'
  },
  cardBody: {
    type: String,
    default: '这是一个具有3D透视效果的卡片组件，鼠标悬停时会产生深度感。'
  },
  perspective: {
    type: Number,
    default: 1000
  },
  tiltAmount: {
    type: Number,
    default: 15
  },
  transitionSpeed: {
    type: Number,
    default: 300
  },
  scaleFactor: {
    type: Number,
    default: 1.05
  }
})

// Refs
const cardRef = ref(null)
const mouseX = ref(0)
const mouseY = ref(0)
const isHovering = ref(false)

// 计算卡片样式
const cardStyle = computed(() => {
  if (!isHovering.value) {
    return {
      transform: 'rotateX(0deg) rotateY(0deg) scale(1)',
      transition: `transform ${props.transitionSpeed}ms ease-out`
    }
  }

  const xRotation = (mouseY.value - 50) * (props.tiltAmount / 50)
  const yRotation = (mouseX.value - 50) * -(props.tiltAmount / 50)

  return {
    transform: `rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale(${props.scaleFactor})`,
    transition: `transform ${props.transitionSpeed}ms ease-out`
  }
})

// 计算阴影样式
const shadowStyle = computed(() => {
  if (!isHovering.value) {
    return {
      transform: 'translateX(0px) translateY(0px) scale(1)',
      opacity: 0.2,
      transition: `all ${props.transitionSpeed}ms ease-out`
    }
  }

  const xOffset = (mouseX.value - 50) * (5 / 50)
  const yOffset = (mouseY.value - 50) * (5 / 50)

  return {
    transform: `translateX(${xOffset}px) translateY(${yOffset}px) scale(1.05)`,
    opacity: 0.3,
    transition: `all ${props.transitionSpeed}ms ease-out`
  }
})


// 计算内容视差样式
const bodyStyle = computed(() => {
  if (!isHovering.value) {
    return {
      transform: 'translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
      transition: `transform ${props.transitionSpeed}ms ease-out`
    }
  }

  // 内容作为中景，视差效果中等
  const parallaxFactor = 0.2 // 增加视差因子
  const xOffset = (mouseX.value - 50) * parallaxFactor
  const yOffset = (mouseY.value - 50) * parallaxFactor

  return {
    transform: `translateX(${xOffset}px) translateY(${yOffset}px) translateZ(120px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`,
    transition: `transform ${props.transitionSpeed}ms ease-out`
  }
})

// 处理鼠标移动
const handleMouseMove = (event) => {
  if (!cardRef.value) return

  isHovering.value = true
  const rect = cardRef.value.getBoundingClientRect()

  // 计算鼠标在卡片中的相对位置（0-100）
  mouseX.value = ((event.clientX - rect.left) / rect.width) * 100
  mouseY.value = ((event.clientY - rect.top) / rect.height) * 100
}

// 处理鼠标离开
const handleMouseLeave = () => {
  isHovering.value = false
  mouseX.value = 50
  mouseY.value = 50
}
</script>

<style lang="scss" scoped>
// 引入与主文件相同的变量和混合
$primary-color: #4f46e5;
$secondary-color: #64748b;
$light-gray: #f8fafc;
$medium-gray: #e2e8f0;
$dark-gray: #334155;
$danger-color: #ef4444;
$success-color: #10b981;
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$border-radius: 8px;
$transition-speed: 0.3s;
$shadow-light: 0 2px 8px rgba(0, 0, 0, 0.08);
$shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.12);

.parallax-card-wrap {}

.parallax-card {
  position: relative;
  width: 300px;
  height: 400px;
  background: linear-gradient(135deg, #ffffff, #f0f0f0);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transform-style: preserve-3d;

  // 添加渐变背景
  background-image:
    linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 240, 240, 0.8) 100%),
    radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%);

  // 添加边框高光
  border: 1px solid rgba(255, 255, 255, 0.8);

  // 添加背景色和字体颜色变化的过渡
  transition: background-color $transition-speed ease, background-image $transition-speed ease;

  // 卡片悬停效果
  &:hover {
    // 悬停时改变背景色为深色，使文字颜色更加明显
    background-image: linear-gradient(135deg, $primary-color, #764ba2);
    
    // 标题悬停效果
    .card-title {
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    // 内容悬停效果
    .card-body {
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    // 按钮悬停效果
    .card-button {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
      color: $primary-color;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }
    
    // 卡片辉光效果
    &::before {
      opacity: 1;
    }
    
    // 卡片内容渐变效果
    .card-content::before {
      background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
    }
  }
  
  // 辉光效果
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, $primary-color, #764ba2, $primary-color);
    z-index: -2;
    border-radius: 14px;
    opacity: 0;
    transition: opacity $transition-speed ease;
  }
  
  // 卡片内容
  .card-content {
    position: relative;
    width: calc(100% - #{$spacing-lg * 2});
    height: calc(100% - #{$spacing-lg * 2});
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    text-align: center;
    transform-style: preserve-3d;
    
    // 深层深度感
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 70%);
      pointer-events: none;
      z-index: -1;
      transform: translateZ(-5px);
      transition: background $transition-speed ease;
    }
  }
  
  // 卡片标题
  .card-title {
    font-size: 24px;
    font-weight: bold;
    color: $dark-gray;
    margin-bottom: $spacing-md;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    transform-origin: center;
    // 添加字体颜色过渡
    transition: color $transition-speed ease, text-shadow $transition-speed ease;
    will-change: transform;
  }
  
  // 卡片内容
  .card-body {
    font-size: 16px;
    color: $secondary-color;
    line-height: 1.6;
    margin-bottom: $spacing-lg;
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;
    transform-origin: center;
    // 添加字体颜色过渡
    transition: color $transition-speed ease, text-shadow $transition-speed ease;
    will-change: transform;
  }
  
  // 卡片按钮
  .card-button {
    width: 100%;
    padding: $spacing-sm $spacing-lg;
    background: linear-gradient(135deg, $primary-color, #764ba2);
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all $transition-speed ease;
    box-shadow: 0 5px 15px rgba($primary-color, 0.4);
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    transform-origin: center;
    will-change: transform;
    
    // 按钮悬停效果
    &:hover {
      box-shadow: 0 8px 25px rgba($primary-color, 0.6);
    }
    
    // 按钮点击效果
    &:active {
      transform: translateY(-1px) translateZ(25px);
    }
  }
  
  // 卡片阴影
  .card-shadow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 12px;
    z-index: -1;
    filter: blur(10px);
  }
}
</style>
