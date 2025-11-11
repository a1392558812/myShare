<template>
  <div ref="bubbleRef" :style="bubbleStyle">
    <slot>{{ text }}</slot>
    <template v-if="showArrow">
      <!-- 叠两个三角：上层为填充色，下层为边框色 -->
      <div v-if="arrowBorderWidth" :style="arrowBorderStyle"></div>
      <div :style="arrowFillStyle"></div>
    </template>
  </div>
</template>

<script setup>
import { computed, watch, ref, nextTick } from 'vue'

const emit = defineEmits(['updateStyle'])
const bubbleRef = ref(null)

const props = defineProps({
  text: { type: String, default: '' },
  // 箭头位置：top/right/bottom/left
  position: { type: String, default: 'top' },
  // 箭头相对中心偏移
  offset: { type: String, default: '0px' },
  arrowSize: { type: Number, default: 8 },
  arrowBorderWidth: { type: Number, default: 1 },
  borderWidth: { type: Number, default: 1 },
  borderColor: { type: String, default: '#111827' },
  backgroundColor: { type: String, default: '#ffffff' },
  color: { type: String, default: '#111827' },
  radius: { type: String, default: '8px' },
  padding: { type: String, default: '12px' },
  showArrow: { type: Boolean, default: true },
  customTipsBubbleStyle: { type: Object, default: () => ({}) },
})

const bubbleStyle = computed(() => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: props.backgroundColor,
  color: props.color,
  padding: props.padding,
  borderRadius: props.radius,
  border: `${props.borderWidth}px solid ${props.borderColor}`,
  ...props.customTipsBubbleStyle,
}))

const arrowBorderStyle = ref({})
const arrowFillStyle = ref({})

const baseArrowPlacement = (sizePx, offsetStr, pos, type) => {
  const rect = bubbleRef.value?.getBoundingClientRect() || {}
  console.log('bubbleRef', type, rect)
  if (!rect) return {}
  const centerTranslate = pos === 'top' || pos === 'bottom'
    ? `translateX(calc(${rect.width ? ((rect.width / 2) + 'px') : '-50%'}))`
    : `translateY(calc(${rect.height ? ((rect.height / 2) + 'px') : '-50%'}))`
  const common = {
    position: 'absolute',
    width: 0,
    height: 0,
    pointerEvents: 'none',
  }
  switch (pos) {
    case 'top':
      return {
        ...common,
        left: offsetStr,
        transform: centerTranslate,
        top: `-${sizePx}px`,
      }
    case 'bottom':
      return {
        ...common,
        left: offsetStr,
        transform: centerTranslate,
        bottom: `-${sizePx}px`,
      }
    case 'left':
      return {
        ...common,
        top: offsetStr,
        transform: centerTranslate,
        left: `-${sizePx}px`,
      }
    case 'right':
      return {
        ...common,
        top: offsetStr,
        transform: centerTranslate,
        right: `-${sizePx}px`,
      }
    default:
      return common
  }
}

const arrowBorderStyleFun = () => {
  const size = props.arrowSize + props.arrowBorderWidth
  const base = baseArrowPlacement(size, `calc(-${size}px + ${props.offset})`, props.position, 'arrowBorderStyle')
  const strokeColor = props.borderColor
  switch (props.position) {
    case 'top':
      return {
        ...base,
        borderLeft: `${size}px solid transparent`,
        borderRight: `${size}px solid transparent`,
        borderBottom: `${size}px solid ${strokeColor}`,
      }
    case 'bottom':
      return {
        ...base,
        borderLeft: `${size}px solid transparent`,
        borderRight: `${size}px solid transparent`,
        borderTop: `${size}px solid ${strokeColor}`,
      }
    case 'left':
      return {
        ...base,
        borderTop: `${size}px solid transparent`,
        borderBottom: `${size}px solid transparent`,
        borderRight: `${size}px solid ${strokeColor}`,
      }
    case 'right':
      return {
        ...base,
        borderTop: `${size}px solid transparent`,
        borderBottom: `${size}px solid transparent`,
        borderLeft: `${size}px solid ${strokeColor}`,
      }
    default:
      return base
  }
}

const arrowFillStyleFun = () => {
  const size = props.arrowSize
  const base = baseArrowPlacement(size, `calc(-${props.arrowSize + props.arrowBorderWidth}px + ${props.arrowBorderWidth}px + ${props.offset})`, props.position, 'arrowFillStyle')
  const fillColor = props.backgroundColor
  switch (props.position) {
    case 'top':
      return {
        ...base,
        borderLeft: `${size}px solid transparent`,
        borderRight: `${size}px solid transparent`,
        borderBottom: `${size}px solid ${fillColor}`,
      }
    case 'bottom':
      return {
        ...base,
        borderLeft: `${size}px solid transparent`,
        borderRight: `${size}px solid transparent`,
        borderTop: `${size}px solid ${fillColor}`,
      }
    case 'left':
      return {
        ...base,
        borderTop: `${size}px solid transparent`,
        borderBottom: `${size}px solid transparent`,
        borderRight: `${size}px solid ${fillColor}`,
      }
    case 'right':
      return {
        ...base,
        borderTop: `${size}px solid transparent`,
        borderBottom: `${size}px solid transparent`,
        borderLeft: `${size}px solid ${fillColor}`,
      }
    default:
      return base
  }
}

watch(props, (newPos) => {
  nextTick(() => {
    arrowBorderStyle.value = arrowBorderStyleFun()
    arrowFillStyle.value = arrowFillStyleFun()
    emit('updateStyle', {
      bubbleStyle: bubbleStyle.value,
      arrowBorderStyle: arrowBorderStyle.value,
      arrowFillStyle: arrowFillStyle.value,
    })
  })
}, {
  immediate: true,
})
</script>