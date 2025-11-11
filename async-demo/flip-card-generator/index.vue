<template>
  <div class="app-container">
    <main class="main-content">
      <section class="control-panel">
        <div class="header-actions">
          <h2>卡片翻转控制</h2>

          <button class="add-element-btn" @click="openDialog">
            查看源码
          </button>
        </div>
        <div class="control-section">
          <h3>旋转设置</h3>

          <div class="control-item">
            <div class="control-label">
              <span>旋转方式</span>
              <span class="value-display">{{ rotationMode === 'axis' ? '轴旋转' : '中心旋转' }}</span>
            </div>
            <div class="direction-buttons">
              <button @click="rotationMode = 'axis'" :class="{ 'active': rotationMode === 'axis' }"
                class="direction-btn">
                绕轴旋转
              </button>
              <button @click="rotationMode = 'center'" :class="{ 'active': rotationMode === 'center' }"
                class="direction-btn">
                绕中心旋转
              </button>
            </div>
          </div>

          <template v-if="rotationMode === 'center'">
            <div class="control-item">
              <div class="control-label">
                <span>水平转角度</span>
                <span class="value-display">{{ centerYaw }}°</span>
              </div>
              <input type="range" v-model.number="centerYaw" min="-360" max="360" step="1" class="range-control">
            </div>
            <div class="control-item">
              <div class="control-label">
                <span>垂直转角度</span>
                <span class="value-display">{{ centerPitch }}°</span>
              </div>
              <input type="range" v-model.number="centerPitch" min="-360" max="360" step="1" class="range-control">
            </div>
            <div class="control-item">
              <div class="control-label">
                <span>斜着转角度</span>
                <span class="value-display">{{ centerRoll }}°</span>
              </div>
              <input type="range" v-model.number="centerRoll" min="-360" max="360" step="1" class="range-control">
            </div>
            <div class="control-item">
              <div class="control-label">
                <span>s是否开启拖拽变视角</span>
                <span class="value-display">{{ enableDrag ? '开启' : '关闭' }}</span>
              </div>
              <div class="direction-buttons">
                <button @click="enableDrag = true" :class="{ 'active': enableDrag }" class="direction-btn">开启</button>
                <button @click="enableDrag = false" :class="{ 'active': !enableDrag }" class="direction-btn">关闭</button>
              </div>
            </div>
            <div class="control-item">
              <div class="control-label">
                <span>拖拽灵敏度</span>
                <span class="value-display">{{ dragSensitivity }}</span>
              </div>
              <input type="range" v-model.number="dragSensitivity" min="0.1" max="4" step="0.1" class="range-control">
            </div>
          </template>

          <template v-if="rotationMode === 'axis'">
            <div class="control-item">
              <div class="control-label">
                <span>旋转轴</span>
                <span class="value-display">{{ axis }}</span>
              </div>
              <div class="axis-buttons">
                <button v-for="axisOption in axisOptions" :key="axisOption.value" @click="axis = axisOption.value"
                  :class="{ 'active': axis === axisOption.value }" class="axis-btn">
                  {{ axisOption.label }}
                </button>
              </div>
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>旋转角度</span>
                <span class="value-display">{{ angle }}°</span>
              </div>
              <input type="range" v-model.number="angle" min="0" max="360" step="1" class="range-control">
              <input type="number" v-model.number="angle" min="0" max="360" class="number-input">
            </div>

            <div class="control-item">
              <div class="control-label">
                <span>翻转方向向</span>
                <span class="value-display">{{ direction === 'normal' ? '顺时针' : '逆时针' }}</span>
              </div>
              <div class="direction-buttons">
                <button @click="direction = 'normal'" :class="{ 'active': direction === 'normal' }"
                  class="direction-btn">
                  顺时针
                </button>
                <button @click="direction = 'reverse'" :class="{ 'active': direction === 'reverse' }"
                  class="direction-btn">
                  逆时针
                </button>
              </div>
            </div>
          </template>

          <div class="control-item">
            <div class="control-label">
              <span>响应速度</span>
              <span class="value-display">{{ duration }}s</span>
            </div>
            <input type="range" v-model.number="duration" min="0.1" max="3" step="0.1" class="range-control">
          </div>
        </div>

        <div class="control-section" v-if="rotationMode === 'axis'">
          <h3>轴的偏移</h3>
          <div class="control-item">
            <div class="control-label">
              <span>X 轴偏移</span>
              <span class="value-display">{{ offsetXPercent }}%</span>
            </div>
            <input type="range" v-model.number="offsetXPercent" min="-50" max="50" step="1" class="range-control">
          </div>
          <div class="control-item">
            <div class="control-label">
              <span>Y 轴偏移</span>
              <span class="value-display">{{ offsetYPercent }}%</span>
            </div>
            <input type="range" v-model.number="offsetYPercent" min="-50" max="50" step="1" class="range-control">
          </div>
          <div class="control-item">
            <div class="control-label">
              <span>Z 轴偏移</span>
              <span class="value-display">{{ offsetZPx }}px</span>
            </div>
            <input type="range" v-model.number="offsetZPx" min="-50" max="50" step="1" class="range-control">
          </div>
        </div>

        <div class="presets">
          <h3>预设效果</h3>
          <div class="preset-buttons">
            <button @click="resetSettings" class="reset-btn">
              重置
            </button>
          </div>
        </div>
      </section>

      <section class="preview-panel">
        <h2>预览</h2>

        <div class="preview-container">
          <div class="flip-card-wrapper">
            <FlipCard :axis="axis" :angle="angle" :is-flipped="true" :duration="duration" :height="height"
              :direction="direction" :offset-x-percent="offsetXPercent" :offset-y-percent="offsetYPercent"
              :offset-z-px="offsetZPx" :rotation-mode="rotationMode" v-model:center-yaw="centerYaw"
              v-model:center-pitch="centerPitch" v-model:center-roll="centerRoll" :enable-drag="enableDrag"
              :drag-sensitivity="dragSensitivity">
              <template #front>
                <div class="custom-content">
                  <h3>卡片正面</h3>
                  <div class="card-info">
                    <div>旋转轴: {{ axis }}</div>
                    <div>角度: {{ angle }}°</div>
                  </div>
                </div>
              </template>
              <template #back>
                <div class="custom-content back">
                  <h3>卡片背面</h3>
                  <div class="card-info">
                    <div>方向: {{ direction === 'normal' ? '顺时针' : '逆时针' }}</div>
                    <div>速度: {{ duration }}s</div>
                  </div>
                </div>
              </template>
            </FlipCard>
          </div>
        </div>

        <div class="code-section">
          <h2>组件代码</h2>
          <div class="code-container">
            <pre><code>{{ componentCode }}</code></pre>
            <button class="copy-button" @click="onCopyClick" :class="{ 'copied': copied }">
              {{ copied ? '✓ 已复制' : '📋 复至配置' }}
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import FlipCard from './components/index.vue';
import baseConfig from '../static/hooks/extends.js';

defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
});

const axis = ref('x');
const angle = ref(10);
const duration = ref(0.1);
const direction = ref('normal');

const rotationMode = ref('axis');
const centerYaw = ref(0);
const centerPitch = ref(0);
const centerRoll = ref(0);
const enableDrag = ref(true);
const dragSensitivity = ref(1);

const offsetXPercent = ref(0);
const offsetYPercent = ref(0);
const offsetZPx = ref(0);

const axisOptions = [
  { label: 'X轴', value: 'x' },
  { label: 'Y轴', value: 'y' },
  { label: 'Z轴', value: 'z' },
];

const componentCode = computed(() => {
  if (rotationMode.value === 'center') {
    return `<FlipCard
  rotation-mode="center"
  :duration="${duration.value}"
  :center-yaw="${centerYaw.value}"
  :center-pitch="${centerPitch.value}"
  :center-roll="${centerRoll.value}"
  :enable-drag="${enableDrag.value}"
  :drag-sensitivity="${dragSensitivity.value}"
  :offset-x-percent="${offsetXPercent.value}"
  :offset-y-percent="${offsetYPercent.value}"
  :offset-z-px="${offsetZPx.value}"
>
  <template #front>
    <div class="your-content">
      <!-- 正面内容 -->
    </div>
  </template>
  <template #back>
    <div class="your-content">
      <!-- 背面内容 -->
    </div>
  </template>
</FlipCard>`;
  }
  return `<FlipCard
  axis="${axis.value}"
  :angle="${angle.value}"
  :is-flipped="${true}"
  :duration="${duration.value}"
  direction="${direction.value}"
  :offset-x-percent="${offsetXPercent.value}"
  :offset-y-percent="${offsetYPercent.value}"
  :offset-z-px="${offsetZPx.value}"
>
  <template #front>
    <div class="your-content">
      <!-- 正面内容 -->
    </div>
  </template>
  <template #back>
    <div class="your-content">
      <!-- 背面内容 -->
    </div>
  </template>
</FlipCard>`;
});

const resetSettings = () => {
  axis.value = 'x';
  angle.value = 0;
  duration.value = 0.1;
  direction.value = 'normal';
  rotationMode.value = 'axis';
  centerYaw.value = 0;
  centerPitch.value = 0;
  centerRoll.value = 0;
  enableDrag.value = true;
  dragSensitivity.value = 1;
  offsetXPercent.value = 0;
  offsetYPercent.value = 0;
  offsetZPx.value = 0;
};

const copied = ref(false);

const onCopyClick = () => {
  navigator.clipboard.writeText(componentCode.value).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
};

</script>

<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.app-container {
  height: calc(100vh - $spacing-md * 2);
  background-color: $light-gray;
  padding: $spacing-md;
  width: calc(1400px + $spacing-md * 2);
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  .main-content {
    display: flex;
    gap: $spacing-lg;
    height: 100%;
  }
}



.control-panel {
  @include control-shared;
  width: calc((100% - $spacing-lg) / 2 - $spacing-md * 2);
  flex-shrink: 0;
  overflow: auto;
  padding: $spacing-md;
  box-shadow: $shadow-light;
  height: calc(100% - $spacing-md * 2);

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;

    h2 {
      color: $dark-gray;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .add-element-btn {
      @include button-shared;
      background-color: $primary-color;
      color: white;
      gap: $spacing-xs;

      &:hover {
        background-color: darken($primary-color, 10%);
      }

      &:disabled {
        background-color: $medium-gray;
        cursor: not-allowed;
      }
    }
  }

  .control-section {
    @include control-shared;
    padding: $spacing-md;
    margin-bottom: $spacing-lg;
    border: 1px solid $medium-gray;

    h3 {
      margin: 0 0 $spacing-md 0;
      color: $dark-gray;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .control-item {
    margin-bottom: $spacing-md;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .control-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-sm;
    font-size: 14px;

    span:first-child {
      font-weight: 500;
      color: $dark-gray;
    }

    .value-display {
      color: $primary-color;
      font-family: monospace;
      font-size: 13px;
      background-color: $light-gray;
      padding: 2px 6px;
      border-radius: $border-radius;
    }
  }

  .range-control {
    width: 100%;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: $light-gray;
    border-radius: 3px;
    outline: none;
    margin-bottom: $spacing-sm;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: $primary-color;
      cursor: pointer;
      transition: background $transition-speed;

      &:hover {
        background: darken($primary-color, 10%);
      }
    }
  }

  .number-input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid $medium-gray;
    border-radius: $border-radius;
    font-size: 14px;
    text-align: center;

    &:focus {
      outline: none;
      border-color: $primary-color;
    }
  }

  .axis-buttons,
  .direction-buttons {
    display: flex;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }

  .axis-btn,
  .direction-btn {
    @include button-shared;
    flex: 1;
    background-color: $light-gray;
    color: $dark-gray;
    min-width: 60px;

    &:hover {
      background-color: $medium-gray;
    }

    &.active {
      background-color: $primary-color;
      color: white;
    }
  }

  .dimension-controls {
    display: flex;
    gap: $spacing-sm;

    .range-control {
      flex: 1;
      margin-bottom: 0;
    }

    .unit-select {
      width: 60px;
      padding: 6px;
      border: 1px solid $medium-gray;
      border-radius: $border-radius;
      font-size: 14px;
      background-color: white;

      &:focus {
        outline: none;
        border-color: $primary-color;
      }
    }
  }

  .presets {
    @include control-shared;
    padding: $spacing-md;
    margin-top: $spacing-lg;

    h3 {
      margin: 0 0 $spacing-md 0;
      color: $dark-gray;
      font-size: 16px;
      font-weight: 600;
    }

    .preset-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-sm;



      .reset-btn {
        @include button-shared;
        background-color: $secondary-color;
        color: white;
        flex: 1;
        min-width: 80px;

        &:hover {
          background-color: darken($secondary-color, 10%);
        }
      }
    }
  }
}

.preview-panel {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  width: calc((100% - $spacing-lg) / 2);
  height: 100%;
  flex-shrink: 0;

  h2 {
    flex-shrink: 0;
    color: $dark-gray;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  .preview-container {
    @include control-shared;
    padding: $spacing-md;
    box-shadow: $shadow-light;
    width: calc(100% - $spacing-md * 2);
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    min-height: 400px;

    .flip-card-wrapper {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      ::v-deep(.custom-content) {
        text-align: center;
        color: white;
        padding: 20px;
        width: 100%;

        h3 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .card-info {
          background-color: rgba(255, 255, 255, 0.2);
          padding: 10px;
          border-radius: $border-radius;
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 14px;
        }

        &.back {
          h3 {
            color: white;
          }
        }
      }
    }
  }

  .code-section {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    flex-shrink: 0;
    flex: 1;
    overflow: hidden;

    .code-container {
      @include control-shared;
      position: relative;
      box-shadow: $shadow-light;
      min-height: 200px;
      overflow: auto;

      pre {
        margin: 0;
        background: $light-gray;
        padding: $spacing-md;
        border-radius: $border-radius;
        overflow-x: auto;
        font-family: 'Courier New', Courier, monospace;
        font-size: 13px;

        code {
          color: $dark-gray;
        }
      }

      .copy-button {
        position: absolute;
        top: $spacing-sm;
        right: $spacing-sm;
        @include button-shared;
        background-color: $primary-color;
        color: white;
        font-size: 12px;
        padding: $spacing-xs $spacing-sm;

        &:hover {
          background-color: darken($primary-color, 10%);
        }

        &.copied {
          background-color: $success-color;
        }
      }
    }
  }
}
</style>