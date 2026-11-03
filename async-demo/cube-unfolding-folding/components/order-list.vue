<template>
  <layoutCom class="order-list-block" :title="title" :titleLevel="3" type="panel">
    <ul class="order-list">
      <li v-for="(faceKey, stepIndex) in orderKeys" :key="faceKey" class="order-item">
        <span class="order-index">{{ stepIndex + 1 }}</span>
        <span class="order-dot" :style="{ background: faceConfig[faceKey].bgColor }"></span>
        <span class="order-label">{{ faceConfig[faceKey].label }}</span>
        <span class="order-delay">起 {{ delayMap[faceKey] || 0 }}ms</span>
        <span class="order-ops">
          <customBtnCom class="order-op-btn" :disabled="stepIndex === 0" @click="onMove(stepIndex, -1)">↑
          </customBtnCom>
          <customBtnCom class="order-op-btn" :disabled="stepIndex === orderKeys.length - 1"
            @click="onMove(stepIndex, 1)">↓</customBtnCom>
        </span>
        <span class="order-time">
          <inputCom class="order-range" type="range" :min="100" :max="2000" :step="50"
            :modelValue="faceConfig[faceKey].duration"
            @update:modelValue="(val) => onDurationChange(faceKey, Number(val))" />
          <span class="order-duration">{{ (delayMap[faceKey] || 0) + faceConfig[faceKey].duration }}ms</span>
        </span>
      </li>
    </ul>
    <slot />
  </layoutCom>
</template>

<script setup>
import { layoutCom, inputCom, customBtnCom } from '../../components/form-control/index.vue'

const props = defineProps({
  /** 顺序标识：fold 折叠 / unfold 展开，用于父组件定位要改哪一条序列 */
  orderName: { type: String, default: 'fold' },
  title: { type: String, default: '' },
  orderKeys: { type: Array, default: () => [] },
  faceConfig: { type: Object, default: () => ({}) },
  /** 面标识 -> 起始延迟（ms），由父组件按排布方式算好 */
  delayMap: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['move', 'drop', 'updateDuration'])

/**
 * 用按钮把某一项上移或下移
 * @param {Number} stepIndex 当前行下标
 * @param {Number} offset -1 上移 / 1 下移
 */
const onMove = (stepIndex, offset) => {
  emit('move', { orderName: props.orderName, stepIndex, offset })
}

/**
 * 修改某个面自身的过渡时长（折叠与展开共用同一份配置）
 * @param {String} faceKey 面的标识
 * @param {Number} duration 时长毫秒数
 */
const onDurationChange = (faceKey, duration) => {
  emit('updateDuration', { faceKey, duration })
}
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.order-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  .order-item {
    display: grid;
    grid-template-columns: 20px 12px 1fr auto auto;
    grid-template-areas:
      "index dot label delay ops"
      "time time time time time";
    align-items: center;
    gap: $spacing-xs $spacing-sm;
    padding: $spacing-sm;
    border: 1px solid $medium-gray;
    border-radius: $border-radius;
    background: $light-gray;
    cursor: grab;

    .order-index {
      grid-area: index;
      font-weight: 700;
      color: $primary-color;
      font-family: monospace;
    }

    .order-dot {
      grid-area: dot;
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .order-label {
      grid-area: label;
      font-size: 14px;
      color: $dark-gray;
    }

    .order-delay {
      grid-area: delay;
      font-size: 12px;
      color: $secondary-color;
      white-space: nowrap;
    }

    .order-ops {
      grid-area: ops;
      display: flex;
      gap: $spacing-xs;

      .order-op-btn {
        padding: 2px 8px;
        font-size: 12px;
      }
    }

    .order-time {
      grid-area: time;
      display: flex;
      align-items: center;
      gap: $spacing-sm;

      // 覆盖 inputCom 的 range 默认宽度，让它占满剩余空间
      .order-range {
        flex: 1;
        min-width: 0;
        width: 100%;
      }

      .order-duration {
        flex: none;
        width: 48px;
        text-align: right;
        font-size: 12px;
        font-family: monospace;
        color: $secondary-color;
      }
    }
  }
}
</style>
