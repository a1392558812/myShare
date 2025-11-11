<template>
  <div ref="rootRef" class="affix-root" :style="rootStyle">
    <div class="affix-placeholder" :style="placeholderStyle"></div>
    <div ref="affixRef" class="affix-content" :style="affixStyle">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  // 触发顶部固定后，Affix 的 CSS top（如果未设定，使用 triggerTop 代替）
  top: { type: Number, default: null },
  // 触发底部固定后，Affix 的 CSS bottom（如果未设定，使用 triggerBottom 代替）
  bottom: { type: Number, default: null },
  // 监听滚动的元素（'window' | 选择器字符串 | 元素实例 | 函数返回元素实例）
  listenTo: { type: [String, Object, Function], default: 'window' },
  // 触发顶部固定时，与目标元素顶部的距离（如果未设定，使用 top 代替）
  triggerTop: { type: Number, default: null },
  // 触发底部固定时，与目标元素底部的距离（如果未设定，使用 bottom 代替）
  triggerBottom: { type: Number, default: null },
  // Affix 的 CSS position（'fixed' | 'absolute'）
  position: { type: String, default: 'fixed' },
})

const emit = defineEmits(['reachBottom', 'reachTop', 'reach-top', 'reach-bottom'])

const isFunction = (fn) => Object.prototype.toString.call(fn) === '[object Function]'
const isString = (str) => Object.prototype.toString.call(str) === '[object String]'
const isObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]'

const rootRef = ref(null)
const affixRef = ref(null)

const isFixedTop = ref(false)
const isFixedBottom = ref(false)
const placeholderHeight = ref(0)
const affixLeft = ref(0)
const affixWidth = ref('auto')

let scrollTarget = null
let scrollHandler = null
let resizeHandler = null

const resolvedTop = computed(() => (props.top != null ? props.top : (props.triggerTop != null ? props.triggerTop : 0)))
const resolvedBottom = computed(() => (props.bottom != null ? props.bottom : (props.triggerBottom != null ? props.triggerBottom : 0)))
const triggerTopPx = computed(() => (props.triggerTop != null ? props.triggerTop : (props.top != null ? props.top : 0)))
const triggerBottomPx = computed(() => (props.triggerBottom != null ? props.triggerBottom : (props.bottom != null ? props.bottom : 0)))

const rootStyle = computed(() => ({ position: props.position === 'absolute' ? 'relative' : undefined }))

const placeholderStyle = computed(() => ({ height: isFixedTop.value || isFixedBottom.value ? `${placeholderHeight.value}px` : '0px' }))

const affixStyle = computed(() => {
  if (!(isFixedTop.value || isFixedBottom.value)) {
    return {}
  }
  const style = { position: props.position, zIndex: 1000 }
  if (props.position === 'fixed') {
    style.left = `${affixLeft.value}px`
    style.width = typeof affixWidth.value === 'number' ? `${affixWidth.value}px` : affixWidth.value
  } else {
    style.left = '0'
    style.right = '0'
    style.width = '100%'
  }
  if (isFixedTop.value) {
    style.top = `${resolvedTop.value}px`
    style.bottom = 'auto'
  } else if (isFixedBottom.value) {
    style.bottom = `${resolvedBottom.value}px`
    style.top = 'auto'
  }
  return style
})

const resolveScrollTarget = () => {
  if (isString(props.listenTo)) {
    if (props.listenTo === 'window') return window
    return document.querySelector(props.listenTo)
  }
  if (isFunction(props.listenTo)) {
    return props.listenTo()
  }
  if (isObject(props.listenTo)) return props.listenTo
  return window
}

const measure = () => {
  const root = rootRef.value
  const affix = affixRef.value
  if (!root || !affix) return
  const rect = root.getBoundingClientRect()
  placeholderHeight.value = affix.offsetHeight
  if (props.position === 'fixed') {
    affixLeft.value = rect.left
    affixWidth.value = rect.width
  } else {
    affixLeft.value = 0
    affixWidth.value = '100%'
  }
}

const updateAffix = (e) => {
  // console.log('updateAffix', e)
  const root = rootRef.value
  if (!root) return
  const target = scrollTarget || window
  const rootRect = root.getBoundingClientRect()
  let containerTop = 0
  let containerBottom = window.innerHeight
  if (target !== window && target && target.getBoundingClientRect) {
    const tRect = target.getBoundingClientRect()
    containerTop = tRect.top
    containerBottom = tRect.bottom
  }
  const distTop = rootRect.top - containerTop
  const distBottom = containerBottom - rootRect.bottom
  const shouldFixTop = distTop <= triggerTopPx.value
  const shouldFixBottom = distBottom <= triggerBottomPx.value

  // 优先顶部固定，其次底部固定
  const nextTop = shouldFixTop
  const nextBottom = !nextTop && shouldFixBottom

  const emitData = {
    rootRect,
    containerTop,
    containerBottom,
  }
  if (nextTop) {
    emit('reach-top', emitData)
  } else if (nextBottom) {
    emit('reach-bottom', emitData)
  } else {
    emit('scroll', emitData)
  }

  isFixedTop.value = nextTop
  isFixedBottom.value = nextBottom

  measure()
}

const updateListen = () => {
  scrollTarget = resolveScrollTarget();
  scrollHandler = (e) => updateAffix(e);
  resizeHandler = () => measure();

  (scrollTarget || window).addEventListener('scroll', scrollHandler, { passive: true });
  window.addEventListener('resize', resizeHandler);
  updateAffix()
}

const withdrawListen = () => {
  try { (scrollTarget || window).removeEventListener('scroll', scrollHandler) } catch { }
  try { window.removeEventListener('resize', resizeHandler) } catch { }
}

onMounted(() => {
  updateListen()
})

onBeforeUnmount(() => {
  withdrawListen()
})

watch(() => [props.top, props.bottom, props.triggerTop, props.triggerBottom, props.position, props.listenTo], () => {
  withdrawListen()
  updateListen()
})
</script>

<style scoped lang="scss">
.affix-root {
  width: 100%;

  .affix-placeholder {
    width: 100%;
  }

  .affix-content {
    width: 100%;
  }
}
</style>