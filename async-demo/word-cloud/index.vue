<template>
  <div class="word-cloud-container">
    <div class="cloud-info">
      <p>拖动鼠标旋转球体，</p>
      <p>滑动滚轮词y云球缩放</p>
      <p>点击单词放大查看</p>
    </div>

    <div class="word-cloud-wrapper">
      <WordCloudCanvas ref="wordCloudCanvasRef" v-model:isAutoRotating="isAutoRotating" :defaultWords="defaultWords"
        @currentWordClick="onCurrentWordClick" />
    </div>

    <div class="cloud-controls">
      <button class="control-btn" @click="regenerateCloud">重新生成词云</button>
      <button class="control-btn" @click="isAutoRotating = !isAutoRotating">
        切换旋转isAutoRotating：{{ isAutoRotating }}
      </button>
      <button class="control-btn" @click="resetView">重置视角</button>
      <button class="control-btn" @click="addNewWords">
        <input class="control-btn-input" type="text" v-model="newWordText" placeholder="输入新词" />
        <span>添加新词</span>
      </button>
    </div>

    <toast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WordCloudCanvas from './components/index.vue'
import toast from '../components/toast/index.vue'

// 单词数据
const defaultWords = [
  { text: 'test1', weight: 0.8 },
  { text: '🐮🍺', fontSize: 30, weight: 0.9 },
  { text: 'test3', weight: 0.7, bgIcon: './demo-static/360range/pin-blue.png' },
  { text: 'test4', weight: 0.85 },
  { text: 'CSS', weight: 0.6 },
  { text: 'HTML', weight: 0.5, bgIcon: './demo-static/video-player/video_7.jpg' },
  { text: '窗前明月光', weight: 0.75 },
  { text: 'Webpack', weight: 0.65 },
  { text: 'Vite', weight: 0.8 },
  { text: 'css用Tailwind', weight: 0.7 },
  { text: 'Git冲突', weight: 0.6 },
  { text: '奥里给！', weight: 0.55 },
  { text: '奥特曼', weight: 0.7 },
  { text: '响应式', weight: 0.8 },
  { text: '', weight: 0.95, bgIcon: './demo-static/video-player/video_11.jpg' },
  { text: '🍋🍋', weight: 0.85 },
  { text: '动画', weight: 0.6 },
  { text: '性能', weight: 0.75 },
  { text: '开发', weight: 0.9 },
  { text: '🍒🍒🍒', weight: 0.7 },
  { text: '算法', weight: 0.65 },
  { text: '数据结构', weight: 0.6 },
  { text: '性能优化', weight: 0.75 },
  { text: 'Awen', weight: 0.8 },
  { text: '全栈开发', weight: 0.7 },
  { text: '秘制小憨包🍔🍔', weight: 0.6 },
  { text: '寄寄寄', weight: 0.55 },
  { text: '部署', weight: 0.6 },
  { text: '测试', weight: 0.7 },
  { text: '调试', weight: 0.8 },
  { text: '架构', weight: 0.75 },
  { text: '🐮🐮', weight: 0.65 },
]

const isAutoRotating = ref(true)
const newWordText = ref('')
const wordCloudCanvasRef = ref(null)
const toastRef = ref(null)

const regenerateCloud = () => {
  wordCloudCanvasRef.value.regenerateCloud()
}

const resetView = () => {
  wordCloudCanvasRef.value.resetView()
}

const addNewWords = () => {
  if (newWordText.value.trim() === '') return
  wordCloudCanvasRef.value.addNewWords({ text: newWordText.value, weight: 0.5 + Math.random() * 0.5 })
  newWordText.value = ''
}

const onCurrentWordClick = (word) => {
  try {
    toastRef.value.open({
      message: `点击了单词：${JSON.stringify(word)}`,
      contentStyle: {
        overflow: 'auto',
        whiteSpace: 'normal',
      }
    })
  } catch (error) {
    console.error('toast 组件错误:', error)
  }
}

</script>

<style scoped lang="scss">
// 主题颜色和样式变量
$primary-color: #4f46e5;
$secondary-color: #64748b;
$light-gray: #f8fafc;
$medium-gray: #e2e8f0;
$dark-gray: #334155;
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$border-radius: 8px;
$transition-speed: 0.3s;
$shadow-light: 0 2px 8px rgba(0, 0, 0, 0.08);
$shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.12);

.cloud-info {
  text-align: center;
  color: $secondary-color;
  font-size: 14px;
  max-width: 600px;
  margin-bottom: $spacing-lg;
}

.word-cloud-container {
  min-height: calc(100vh - 2 * $spacing-lg);
  background: linear-gradient(135deg, $light-gray 0%, #eef2ff 100%);
  padding: $spacing-lg;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.word-cloud-wrapper {
  width: 100%;
  max-width: 1000px;
  height: 70vh;
  min-height: 500px;
  background: white;
  border-radius: $border-radius;
  box-shadow: $shadow-medium;
  overflow: hidden;
  position: relative;
  margin-bottom: $spacing-lg;
  border: 1px solid $medium-gray;
  transition: box-shadow $transition-speed ease;

  &:hover {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
}

.cloud-controls {
  display: flex;
  gap: $spacing-md;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: $spacing-md;
}

.control-btn {
  padding: $spacing-sm $spacing-md;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: $border-radius;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all $transition-speed ease;
  box-shadow: $shadow-light;

  .control-btn-input {
    padding: $spacing-sm;
    border: none;
    outline: none;
    margin-right: $spacing-md;

    &:focus {
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.5);
    }
  }

  &:hover {
    background-color: darken($primary-color, 10%);
    box-shadow: $shadow-medium;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:nth-child(2) {
    background-color: #10b981;

    &:hover {
      background-color: darken(#10b981, 10%);
    }
  }

  &:nth-child(3) {
    background-color: #f59e0b;

    &:hover {
      background-color: darken(#f59e0b, 10%);
    }
  }

  &:nth-child(4) {
    background-color: #8b5cf6;

    &:hover {
      background-color: darken(#8b5cf6, 10%);
    }
  }
}
</style>