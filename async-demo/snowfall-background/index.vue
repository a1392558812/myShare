<template>
  <div class="snowfall-demo">
    <div class="control-panel">
      <div class="control-group">
        <label>雪量大小: {{ snowAmount }}</label>
        <input type="range" v-model.number="snowAmount" min="1" max="10" step="1" class="slider">
        <span class="range-label">小</span>
        <span class="range-label">大</span>
      </div>

      <div class="control-group">
        <label>风向: {{ windDirection }}</label>
        <input type="range" v-model.number="windDirection" min="-10" max="10" step="1" class="slider">
        <span class="range-label">←</span>
        <span class="range-label">→</span>
      </div>

      <div class="control-group">
        <label>下落速度: {{ fallSpeed }}</label>
        <input type="range" v-model.number="fallSpeed" min="1" max="10" step="1" class="slider">
        <span class="range-label">慢</span>
        <span class="range-label">快</span>
      </div>

      <div class="control-group">
        <label>雪花大小: {{ snowflakeSize }}</label>
        <input type="range" v-model.number="snowflakeSize" min="1" max="10" step="1" class="slider">
        <span class="range-label">小</span>
        <span class="range-label">大</span>
      </div>

      <div class="control-group">
        <label>雪花颜色:</label>
        <input type="color" v-model="snowflakeColor" class="color-input">
      </div>

      <div class="control-group">
        <label>背景颜色:</label>
        <input type="color" v-model="bgColorHex" @input="updateRGBFromHex" class="color-input">
      </div>
      <div class="control-group">
        <label>背景透明度: {{ bgOpacity }}</label>
        <input type="range" style="width: 100%;" v-model.number="bgOpacity" min="0" max="1" step="0.1" />
      </div>

      <button @click="resetSnowflakes" class="reset-btn">重置雪花</button>
    </div>

    <div class="snowfall-wrapper">
      <SnowfallBackground ref="snowfallRef" :snow-amount="snowAmount" :wind-direction="windDirection"
        :fall-speed="fallSpeed" :snowflake-size="snowflakeSize" :snowflake-color="snowflakeColor"
        :background-color="computedBackgroundColor" />
    </div>
  </div>
</template>

<script setup>
import SnowfallBackground from './components/index.vue'
import { ref, computed } from 'vue'

const snowAmount = ref(5)
const windDirection = ref(0)
const fallSpeed = ref(3)
const snowflakeSize = ref(5)
const snowflakeColor = ref('#ffffff')
// 背景色相关变量
const bgColorR = ref(0)
const bgColorG = ref(0)
const bgColorB = ref(0)
const bgOpacity = ref(0.9)

const computedBackgroundColor = computed(() => {
  return `rgba(${bgColorR.value}, ${bgColorG.value}, ${bgColorB.value}, ${bgOpacity.value})`
})

const hexToRgb = (hex) => {
  hex = hex.replace('#', '')
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

const bgColorHex = ref('#000000')

const updateRGBFromHex = () => {
  const rgb = hexToRgb(bgColorHex.value)
  bgColorR.value = rgb.r
  bgColorG.value = rgb.g
  bgColorB.value = rgb.b
}

updateRGBFromHex()

const snowfallRef = ref(null)
const resetSnowflakes = () => {
  if (snowfallRef.value) {
    snowfallRef.value.resetSnowflakes()
  }
}
</script>

<style lang="scss" scoped>
.snowfall-demo {
  min-height: 100vh;
  position: relative;

  h1 {
    text-align: center;
    padding: 20px 0;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    z-index: 10;
    position: relative;
  }
}

.control-panel {
  position: fixed;
  top: 100px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  width: 300px;
  z-index: 20;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.control-group {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #ffffff;
    font-size: 14px;
  }

  .slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #444;
    outline: none;
    margin: 10px 0;
    -webkit-appearance: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #ffffff;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.1);
        background: #e0e0e0;
      }
    }

    &::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #ffffff;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.1);
        background: #e0e0e0;
      }
    }
  }

  .color-input {
    width: 100%;
    height: 40px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    background: transparent;
  }
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: -5px;
}

.range-label {
  font-size: 12px;
  color: #aaa;
}

.reset-btn {
  width: 100%;
  padding: 12px;
  background-color: #ffffff;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    background-color: #e0e0e0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

.snowfall-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
}
</style>