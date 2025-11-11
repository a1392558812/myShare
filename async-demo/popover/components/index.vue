<template>
  <div ref="triggerRef" class="popover-trigger" :style="customPopoverTriggerStyle" @mouseenter="onTriggerEnter"
    @mouseleave="onTriggerLeave">
    <slot />
  </div>

  <div :style="contentStyle">
    <tipsBubble v-if="isOpen || isMeasuring" ref="popoverRef" v-bind="tipsBubbleParams" @mouseenter="onPopoverEnter"
      @mouseleave="onPopoverLeave">
      <slot name="popoverSlot" />
    </tipsBubble>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount, nextTick, computed, defineExpose } from 'vue'
import tipsBubble from '../../tips-bubble-generator/components/index.vue'

const emit = defineEmits(['occluded', 'insufficient-space', 'visible'])

const props = defineProps({
  // 箭头相对中心偏移
  tipsBubbleOffset: { type: String, default: '0px' },
  // 是否在当前放置方式不能提供足够空间的时候调整弹出信息的位置
  flip: { type: Boolean, default: true },
  // 悬浮关闭弹出信息的延迟,-1为不自动关闭
  duration: { type: Number, default: 300 },
  // 弹出位置：top | right | bottom | left
  placement: { type: String, default: 'top' },
  // 是否显示箭头
  showArrow: { type: Boolean, default: true },
  // 手动控制位置时弹出内容的 CSS（对象或字符串）
  customContentStyle: { type: Object, default: () => ({}) },
  // customTipsBubbleOffset 手动控制位置时弹出内容的偏移
  customTipsBubbleOffset: { type: Object, default: () => ({ x: 0, y: 0 }) },
  // 箭头大小
  tipsBubbleArrowSize: { type: Number, default: 8 },
  // 气泡边框宽度
  tipsBubbleBorderWidth: { type: Number, default: 1 },
  // 气泡边框颜色
  tipsBubbleBorderColor: { type: String, default: '#111827' },
  // 气泡背景颜色
  tipsBubbleBackgroundColor: { type: String, default: '#ffffff' },
  // 气泡圆角
  tipsBubbleRadius: { type: String, default: '8px' },
  // 气泡内边距
  tipsBubblePadding: { type: String, default: '12px' },
  // 自定义气泡样式
  customTipsBubbleStyle: { type: Object, default: () => ({}) },
  // 自定义触发元素样式
  customPopoverTriggerStyle: { type: Object, default: () => ({}) },
})

const triggerRef = ref(null)
const popoverRef = ref(null)

const isOpen = ref(false)
const isMeasuring = ref(false) // 是否正在测量弹出信息的位置
const hoverCloseTimer = ref(null)

const currentPlacement = ref(props.placement)
const coords = reactive({ x: 0, y: 0, w: 0, h: 0 })

let scrollContainerEl = null // 滚动d容器

const margin = computed(() => props.tipsBubbleArrowSize)

const contentStyle = computed(() => {
  const base = {
    position: 'fixed',
    left: `${coords.x + props.customTipsBubbleOffset.x}px`,
    top: `${coords.y + props.customTipsBubbleOffset.y}px`,
    zIndex: 1000,
    visibility: isMeasuring.value ? 'hidden' : 'visible',
  }
  return { ...base, ...(props.customContentStyle || {}) }
})

const tipsBubbleArrowPosition = computed(() => {
  switch (currentPlacement.value) {
    case 'top':
      return 'bottom'
    case 'bottom':
      return 'top'
    case 'left':
      return 'right'
    case 'right':
      return 'left'
  }
})

const tipsBubbleParams = computed(() => {
  return {
    showArrow: props.showArrow,
    position: tipsBubbleArrowPosition.value,
    offset: props.tipsBubbleOffset,
    arrowSize: props.tipsBubbleArrowSize,
    arrowBorderWidth: props.tipsBubbleBorderWidth,
    borderWidth: props.tipsBubbleBorderWidth,
    borderColor: props.tipsBubbleBorderColor,
    backgroundColor: props.tipsBubbleBackgroundColor,
    radius: props.tipsBubbleRadius,
    padding: props.tipsBubblePadding,
    customTipsBubbleStyle: props.customTipsBubbleStyle,
  }
})



// 获取滚动容器
const getScrollContainer = (el) => {
  let node = el?.parentElement
  while (node && node !== document.body && node !== document.documentElement) {
    const style = getComputedStyle(node)
    const overflowX = style.overflowX
    const overflowY = style.overflowY
    const isScrollable = (overflowX === 'auto' || overflowX === 'scroll' || overflowY === 'auto' || overflowY === 'scroll')
    if (isScrollable) return node
    node = node.parentElement
  }
  return null
}

// 计算弹出层位置
const measureAndPlace = () => {
  setupScrollContainer()

  const triggerEl = triggerRef.value
  const popEl = popoverRef.value
  if (!triggerEl) return

  const rect = triggerEl.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  let containerRect = null
  if (scrollContainerEl && scrollContainerEl !== document.body && scrollContainerEl !== document.documentElement) {
    containerRect = scrollContainerEl.getBoundingClientRect()
  } else {
    containerRect = { left: 0, top: 0, right: vw, bottom: vh }
  }

  if (!popEl) {
    isMeasuring.value = true
    nextTick(measureAndPlace)
    return
  }

  const popRect = popEl.$el.getBoundingClientRect()
  const pw = Math.ceil(popRect.width)
  const ph = Math.ceil(popRect.height)

  coords.w = pw;
  coords.h = ph

  // 使用绝对偏移参与空间检测,保证翻转方向都预留足够分离轴空间
  const baseOffsetX = props.customTipsBubbleOffset.x || 0
  const baseOffsetY = props.customTipsBubbleOffset.y || 0
  const sepOffsetX = Math.abs(baseOffsetX)
  const sepOffsetY = Math.abs(baseOffsetY)
  const hasSpace = {
    top: (rect.top - containerRect.top) >= ph + margin.value + sepOffsetY,
    bottom: (containerRect.bottom - rect.bottom) >= ph + margin.value + sepOffsetY,
    left: (rect.left - containerRect.left) >= pw + margin.value + sepOffsetX,
    right: (containerRect.right - rect.right) >= pw + margin.value + sepOffsetX,
  }

  let desired = props.placement
  currentPlacement.value = desired
  let flippedByInsufficient = false

  if (!hasSpace[desired]) {
    /**
     * 触发元素位置不足时触发
     * @param {string} params.placement - 触发元素位置 （top/bottom/left/right）
     * 
     * @param {DOMRect} params.rect - 触发元素的边界矩形
     * @param {number} params.rect.left - 触发元素左侧坐标
     * @param {number} params.rect.top - 触发元素顶部坐标
     * @param {number} params.rect.right - 触发元素右侧坐标
     * @param {number} params.rect.bottom - 触发元素底部坐标
     * @param {number} params.rect.width - 触发元素宽度
     * @param {number} params.rect.height - 触发元素高度
     * 
     * @param {DOMRect} params.containerRect - 滚动容器的边界矩形
     * @param {number} params.containerRect.left - 滚动容器左侧坐标
     * @param {number} params.containerRect.top - 滚动容器顶部坐标
     * @param {number} params.containerRect.right - 滚动容器右侧坐标
     * @param {number} params.containerRect.bottom - 滚动容器底部坐标
     * @param {number} params.containerRect.width - 滚动容器宽度
     * @param {number} params.containerRect.height - 滚动容器高度
     * 
     * @param {number} params.vw - 视口宽度
     * @param {number} params.vh - 视口高度
     * @param {number} params.pw - 弹出信息宽度
     * @param {number} params.ph - 弹出信息高度
     * 
     * @param {Object} params.customTipsBubbleOffset - 弹出信息箭头相对中心偏移
     * @param {number} params.customTipsBubbleOffset.x - 弹出信息箭头水平偏移
     * @param {number} params.customTipsBubbleOffset.y - 弹出信息箭头垂直偏移
     * 
     */
    emit('insufficient-space', {
      placement: desired,
      rect,
      containerRect,
      vw, vh, pw, ph,
      customTipsBubbleOffset: { x: baseOffsetX, y: baseOffsetY }
    })
    if (props.flip) {
      const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[desired]
      if (hasSpace[opposite]) {
        currentPlacement.value = opposite
        flippedByInsufficient = true
      }
    }
  }

  let x = 0, y = 0
  switch (currentPlacement.value) {
    case 'top':
      x = rect.left + rect.width / 2 - pw / 2
      y = rect.top - ph - margin.value
      break
    case 'bottom':
      x = rect.left + rect.width / 2 - pw / 2
      y = rect.bottom + margin.value
      break
    case 'left':
      x = rect.left - pw - margin.value
      y = rect.top + rect.height / 2 - ph / 2
      break
    case 'right':
      x = rect.right + margin.value
      y = rect.top + rect.height / 2 - ph / 2
      break
  }

  // 在因空间不足发生翻转时,反转对应轴上的 tipsBubbleOffset 符号,使偏移始终朝远离触发器方向
  let effOffsetX = baseOffsetX
  let effOffsetY = baseOffsetY
  if (flippedByInsufficient) {
    const flipHoriz = (desired === 'left' && currentPlacement.value === 'right') || (desired === 'right' && currentPlacement.value === 'left')
    const flipVert = (desired === 'top' && currentPlacement.value === 'bottom') || (desired === 'bottom' && currentPlacement.value === 'top')
    if (flipHoriz) effOffsetX = -effOffsetX
    if (flipVert) effOffsetY = -effOffsetY
  }

  // 应用有效偏移并进行容器裁剪,同时保持与触发器不重叠
  let finalX = x + effOffsetX
  let finalY = y + effOffsetY

  let fitsInsideContainer = true
  switch (currentPlacement.value) {
    case 'top': {
      const minX = containerRect.left + margin.value
      const maxX = containerRect.right - pw - margin.value
      if (finalX < minX) finalX = minX
      if (finalX > maxX) finalX = maxX
      if ((finalY + ph + margin.value) > rect.top) finalY = rect.top - ph - margin.value
      if (finalY < containerRect.top + margin.value) fitsInsideContainer = false
      break
    }
    case 'bottom': {
      const minX = containerRect.left + margin.value
      const maxX = containerRect.right - pw - margin.value
      if (finalX < minX) finalX = minX
      if (finalX > maxX) finalX = maxX
      if ((rect.bottom + margin.value) > finalY) finalY = rect.bottom + margin.value
      if (finalY > containerRect.bottom - ph - margin) fitsInsideContainer = false
      break
    }
    case 'left': {
      const minY = containerRect.top + margin.value
      const maxY = containerRect.bottom - ph - margin.value
      if (finalY < minY) finalY = minY
      if (finalY > maxY) finalY = maxY
      if ((finalX + pw + margin.value) > rect.left) finalX = rect.left - pw - margin.value
      if (finalX < containerRect.left + margin.value) fitsInsideContainer = false
      break
    }
    case 'right': {
      const minY = containerRect.top + margin.value
      const maxY = containerRect.bottom - ph - margin.value
      if (finalY < minY) finalY = minY
      if (finalY > maxY) finalY = maxY
      if ((rect.right + margin.value) > finalX) finalX = rect.right + margin.value
      if (finalX > containerRect.right - pw - margin.value) fitsInsideContainer = false
      break
    }
  }

  if (!fitsInsideContainer) {
    emit('insufficient-space', { placement: currentPlacement.value, rect, containerRect, vw, vh, pw, ph, customTipsBubbleOffset: { x: baseOffsetX, y: baseOffsetY }, effectiveTipsBubbleOffset: { x: effOffsetX, y: effOffsetY }, flipped: flippedByInsufficient })
  }

  // 由于 contentStyle 会再加上 customTipsBubbleOffset,这里将基础坐标设置为反向抵消后的值,使最终渲染坐标为 finalX/finalY
  coords.x = Math.round(finalX - baseOffsetX)
  coords.y = Math.round(finalY - baseOffsetY)

  /**
   * 弹出信息可见时触发
   * @param {string} params.placement - 弹出信息位置
   * 
   * @param {Object} params.coords - 弹出信息坐标
   * @param {number} params.coords.x - 弹出信息水平坐标
   * @param {number} params.coords.y - 弹出信息垂直坐标
   * @param {number} params.coords.w - 弹出信息宽度
   * @param {number} params.coords.h - 弹出信息高度
   * 
   * @param {Object} params.customTipsBubbleOffset - 弹出信息箭头偏移
   * @param {number} params.customTipsBubbleOffset.x - 弹出信息箭头水平偏移
   * @param {number} params.customTipsBubbleOffset.y - 弹出信息箭头垂直偏移
   * 
   * @param {Object} params.effectiveTipsBubbleOffset - 弹出信息箭头有效偏移
   * @param {number} params.effectiveTipsBubbleOffset.x - 弹出信息箭头有效水平偏移
   * @param {number} params.effectiveTipsBubbleOffset.y - 弹出信息箭头有效垂直偏移
   * 
   * @param {boolean} params.flipped - 弹出信息是否被翻转
   * 
   */
  emit('visible', {
    placement: currentPlacement.value,
    coords: { x: finalX, y: finalY, w: pw, h: ph },
    customTipsBubbleOffset: { x: baseOffsetX, y: baseOffsetY },
    effectiveTipsBubbleOffset: { x: effOffsetX, y: effOffsetY },
    flipped: flippedByInsufficient
  })

  isMeasuring.value = false
}

// 触发器可见性/遮挡状态检测并发出事件
const checkTriggerOcclusion = () => {
  const triggerEl = triggerRef.value
  if (!triggerEl) return

  const rect = triggerEl.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  let containerRect = null
  if (scrollContainerEl && scrollContainerEl !== document.body && scrollContainerEl !== document.documentElement) {
    containerRect = scrollContainerEl.getBoundingClientRect()
  } else {
    containerRect = { left: 0, top: 0, right: vw, bottom: vh }
  }

  const visibleLeft = Math.max(rect.left, containerRect.left)
  const visibleTop = Math.max(rect.top, containerRect.top)
  const visibleRight = Math.min(rect.right, containerRect.right)
  const visibleBottom = Math.min(rect.bottom, containerRect.bottom)
  const visW = Math.max(0, visibleRight - visibleLeft)
  const visH = Math.max(0, visibleBottom - visibleTop)
  const areaVisible = visW * visH
  const areaTotal = Math.max(1, rect.width * rect.height)
  const ratio = areaVisible / areaTotal

  const occludedSides = {
    top: rect.top < containerRect.top,
    bottom: rect.bottom > containerRect.bottom,
    left: rect.left < containerRect.left,
    right: rect.right > containerRect.right,
  }

  let status = 'partially-occluded'
  if (ratio <= 0) {
    status = 'fully-occluded'
    close()
  }
  else if (ratio >= 1) status = 'fully-visible'

  /**
   * 触发元素遮挡状态变化时触发
   * @param {Object} params - 事件参数
   * @param {string} params.status - 遮挡状态：fully-occluded | partially-occluded | fully-visible
   * @param {number} params.ratio - 可见区域占比
   * 
   * @param {DOMRect} params.rect - 触发元素的边界矩形
   * @param {number} params.rect.left - 触发元素左侧坐标
   * @param {number} params.rect.top - 触发元素顶部坐标
   * @param {number} params.rect.right - 触发元素右侧坐标
   * @param {number} params.rect.bottom - 触发元素底部坐标
   * @param {number} params.rect.width - 触发元素宽度
   * @param {number} params.rect.height - 触发元素高度
   * 
   * @param {DOMRect} params.containerRect - 滚动容器的边界矩形
   * @param {DOMRect} params.containerRect.left - 滚动容器左侧坐标
   * @param {DOMRect} params.containerRect.top - 滚动容器顶部坐标
   * @param {DOMRect} params.containerRect.right - 滚动容器右侧坐标
   * @param {DOMRect} params.containerRect.bottom - 滚动容器底部坐标
   * @param {DOMRect} params.containerRect.width - 滚动容器宽度
   * @param {DOMRect} params.containerRect.height - 滚动容器高度
   * 
   * @param {DOMRect} params.visibleRect - 可见区域的边界矩形
   * @param {number} params.visibleRect.left - 可见区域左侧坐标
   * @param {number} params.visibleRect.top - 可见区域顶部坐标
   * @param {number} params.visibleRect.right - 可见区域右侧坐标
   * @param {number} params.visibleRect.bottom - 可见区域底部坐标
   * @param {number} params.visibleRect.width - 可见区域宽度
   * @param {number} params.visibleRect.height - 可见区域高度
   * 
   * @param {Object} params.occludedSides - 遮挡侧边信息
   * @param {boolean} params.occludedSides.top - 是否顶部被遮挡
   * @param {boolean} params.occludedSides.bottom - 是否底部被遮挡
   * @param {boolean} params.occludedSides.left - 是否左侧被遮挡
   * @param {boolean} params.occludedSides.right - 是否右侧被遮挡
   */
  emit('occluded', {
    status,
    ratio,
    rect,
    containerRect,
    visibleRect: { left: visibleLeft, top: visibleTop, right: visibleRight, bottom: visibleBottom, width: visW, height: visH },
    occludedSides,
  })
}

// 滚动容器检测与监听
const setupScrollContainer = () => {
  const el = triggerRef.value
  const sc = getScrollContainer(el)
  if (scrollContainerEl !== sc) {
    if (scrollContainerEl) {
      scrollContainerEl.removeEventListener('scroll', handleScroll, true)
    }

    scrollContainerEl = sc

    if (scrollContainerEl) {
      scrollContainerEl.addEventListener('scroll', handleScroll, true)
    }
  }
  checkTriggerOcclusion()
}

const onTriggerEnter = () => {
  if (hoverCloseTimer.value) {
    clearTimeout(hoverCloseTimer.value);
    hoverCloseTimer.value = null
  }
  open()
}
const onTriggerLeave = () => {
  if (props.duration >= 0) {
    hoverCloseTimer.value = setTimeout(() => {
      close()
    }, props.duration)
  }
}
const onPopoverEnter = () => {
  if (hoverCloseTimer.value) {
    clearTimeout(hoverCloseTimer.value);
    hoverCloseTimer.value = null
  }
}
const onPopoverLeave = () => {
  if (props.duration >= 0) {
    hoverCloseTimer.value = setTimeout(() => { close() }, props.duration)
  }
}

// 重新计算位置
const reposition = () => {
  if (isOpen.value || isMeasuring.value) {
    nextTick(measureAndPlace)
  }
}

const open = () => {
  isOpen.value = true
  isMeasuring.value = true
  reposition()
}
const close = () => {
  isOpen.value = false
}

const handleScroll = () => {
  checkTriggerOcclusion()
  reposition()
}
const handleResize = () => {
  checkTriggerOcclusion()
  reposition()
}

onMounted(() => {
  setupScrollContainer()
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll, true)
  if (scrollContainerEl) {
    scrollContainerEl.removeEventListener('scroll', handleScroll, true)
  }
  if (hoverCloseTimer.value) {
    clearTimeout(hoverCloseTimer.value)
  }
})

watch(() => [
  props.placement,
  props.flip,
  props.customContentStyle,
  props.customTipsBubbleOffset,
  props.tipsBubbleArrowSize,
  props.tipsBubbleBorderWidth,
  props.tipsBubblePadding,
  props.customTipsBubbleStyle,
  props.customPopoverTriggerStyle,
],
  () => {
    console.log('watch')
    reposition()
  }
)

defineExpose({ open, close, reposition })
</script>

<style scoped lang="scss">
.popover-trigger {
  display: inline-block;
}
</style>
