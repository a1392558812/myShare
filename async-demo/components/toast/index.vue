<template>
  <div class="toast-container">
    <transition name="toast" tag="div">
      <div v-if="toast.show" class="toast" :style="{
        zIndex: 9999,
        ...toast.style
      }">
        <!-- 内容 -->
        <div class="toast-content">
          <div v-if="toast.title" class="toast-title">{{ toast.title }}</div>
          <div class="toast-message" :style="toast.contentStyle">{{ toast.message }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

// 响应式数据
const toast = ref({
  show: false,
  message: '',
  title: '',
  type: 'info', // success error warning info
  duration: 2500,
  autoClose: true,
  onClose: null,
  style: {
    top: '20px',
  },
  contentStyle: {},
  verticalOffset: 0,
})

let timer = null

const addToast = (options = {}) => {
  removeToast()
  Object.assign(toast.value, options, { show: true })
  if (toast.value.autoClose) {
    timer = setTimeout(() => {
      removeToast()
    }, toast.value.duration)
  }
}

// 移除toast
const removeToast = () => {
  toast.value.show = false
  if (timer) {
    clearTimeout(timer)
  }
  if (toast.value.onClose) {
    toast.value.onClose()
  }
}



onUnmounted(() => {
  removeToast()
})

// 导出
defineExpose({
  close: removeToast,
  open: addToast
})
</script>

<style scoped lang="scss">
// 主题变量
$toast-bg-color: rgba(0, 0, 0, 0.75);
$toast-text-color: #fff;
$toast-border-radius: 8px;
$toast-padding: 16px;
$toast-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
$toast-min-width: 300px;
$toast-max-width: 500px;

.toast-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  width: 100%;
}

.toast {
  display: flex;
  align-items: center;
  min-width: $toast-min-width;
  max-width: $toast-max-width;
  padding: $toast-padding;
  margin: 0;
  background-color: $toast-bg-color;
  color: $toast-text-color;
  border-radius: $toast-border-radius;
  box-shadow: $toast-shadow;
  pointer-events: all;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 16px;
}

.toast-message {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .toast-fixed & {
    white-space: normal;
    word-break: break-word;
  }
}

// 动画效果
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>