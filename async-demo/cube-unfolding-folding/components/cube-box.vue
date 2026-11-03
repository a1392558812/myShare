<template>
  <div class="stage" :style="{ cursor: dragging ? 'grabbing' : 'grab' }" @pointerdown="onPointerDown">
    <div :style="cubeStyle">
      <div :style="cubeCoreStyle">
        <div :style="faceFrontStyle">{{ props.faceConfig.front?.label || '前面' }}</div>
        <div :style="faceTopStyle">{{ props.faceConfig.top?.label || '上面' }}</div>

        <div :style="faceBottomStyle">
          {{ props.faceConfig.bottom?.label || '下面' }}
          <div :style="faceBackStyle">{{ props.faceConfig.back?.label || '后面' }}</div>
        </div>

        <div :style="faceLeftStyle">{{ props.faceConfig.left?.label || '左面' }}</div>
        <div :style="faceRightStyle">{{ props.faceConfig.right?.label || '右面' }}</div>

        <div v-if="showCenterDot" :style="centerDotStyle" title="正方体正中心（旋转中心）"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const FACE_SIZE = 120

const cubeCoreStyle = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  transformStyle: 'preserve-3d',
  transform: 'translateZ(60px)'
}

/** 展开态各面的 */
const OPEN_TRANSFORM = {
  top: `translate(0, ${-FACE_SIZE}px) rotateX(0deg)`,
  right: `translate(${FACE_SIZE}px, 0) rotateY(0deg)`,
  left: `translate(${-FACE_SIZE}px, 0) rotateY(0deg)`,
  bottom: `translate(0, ${FACE_SIZE}px) rotateX(0deg)`,
  back: `translate(0, ${FACE_SIZE}px) rotateX(0deg)`
}

/** 折叠态各面的 */
const FOLDED_TRANSFORM = {
  top: `translate(0, ${-FACE_SIZE}px) rotateX(90deg)`,
  right: `translate(${FACE_SIZE}px, 0) rotateY(90deg)`,
  left: `translate(${-FACE_SIZE}px, 0) rotateY(-90deg)`,
  bottom: `translate(0, ${FACE_SIZE}px) rotateX(-90deg)`,
  back: `translate(0, ${FACE_SIZE}px) rotateX(-90deg)`
}

const props = defineProps({
  /** 是否处于折叠态 */
  folded: { type: Boolean, default: false },
  /** 折叠顺序 */
  foldOrder: { type: Array, default: () => ['top', 'right', 'left', 'bottom', 'back'] },
  /** 展开顺序 */
  unfoldOrder: { type: Array, default: () => ['back', 'bottom', 'left', 'right', 'top'] },
  /** 面配置 */
  faceConfig: {
    type: Object,
    default: () => ({
      front: { label: '前面', duration: 600, bgColor: 'rgba(0, 0, 0, .8)', customStyle: {} },
      top: { label: '上面', duration: 600, bgColor: 'rgba(0, 0, 0, .8)', customStyle: {} },
      bottom: { label: '下面', duration: 600, bgColor: 'rgba(0, 0, 0, .8)', customStyle: {} },
      back: { label: '后面', duration: 600, bgColor: 'rgba(0, 0, 0, .8)', customStyle: {} },
      left: { label: '左面', duration: 600, bgColor: 'rgba(0, 0, 0, .8)', customStyle: {} },
      right: { label: '右面', duration: 600, bgColor: 'rgba(0, 0, 0, .8)', customStyle: {} },
    })
  },
  /** 步进间隔（ms） */
  stepGap: { type: Number, default: 600 },
  /** 缓动曲线 */
  easing: { type: String, default: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  /** 排布方式 */
  scheduleMode: { type: String, default: 'auto' },
  /** 是否显示正方体正中心的标记点 */
  showCenterDot: { type: Boolean, default: true },
  width: { type: Number, default: 120 },
  customCubeStyle: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:folded', 'playing', 'looping', 'schedule'])

const dragging = ref(false)
const rotX = ref(0)
const rotY = ref(0)
const userMoved = ref(false)

const cubeStyle = computed(() => {
  return Object.assign({}, {
    position: 'relative',
    width: 0,
    height: 0,
    transformStyle: 'preserve-3d',
    willChange: 'transform',
    transform: `rotateX(${rotX.value}deg) rotateY(${rotY.value}deg)`,
    transition: dragging.value ? 'none' : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
  }, props.customCubeStyle || {})
})

/** 某个面自身的过渡时长，配置缺失时600ms */
const durationOf = (faceKey) => props.faceConfig[faceKey]?.duration || 600

/**
 * 按给定顺序排布起始时刻
 * auto    取「序号×间隔」与「上一步结束时刻」的较大值，保证永不重叠
 * stagger 固定「序号×间隔」，时长大于间隔时两个面会同时动
 * serial  严格首尾相接，延迟 = 前面所有步的时长之和，忽略间隔
 * @param {Array} order 面标识顺序
 * @returns {Object} 面标识 -> 起始延迟（ms）
 */
const buildDelayMap = (order) => {
  const result = {}
  let previousEnd = 0
  order.forEach((faceKey, stepIndex) => {
    const gapStart = stepIndex * props.stepGap
    let currentStart = gapStart
    if (props.scheduleMode === 'serial') {
      currentStart = previousEnd
    } else if (props.scheduleMode === 'auto') {
      currentStart = Math.max(gapStart, previousEnd)
    }
    result[faceKey] = currentStart
    previousEnd = currentStart + durationOf(faceKey)
  })
  return result
}

const foldDelayMap = computed(() => buildDelayMap(props.foldOrder))
const unfoldDelayMap = computed(() => buildDelayMap(props.unfoldOrder))

/** 当前方向生效的延迟表：折叠中看折叠顺序，展开中看展开顺序 */
const activeDelayMap = computed(() => (props.folded ? foldDelayMap.value : unfoldDelayMap.value))

/** 某张延迟表里最后一个面跑完的时刻 */
const totalOf = (delayMap) => {
  const endTimeList = Object.keys(delayMap).map((faceKey) => delayMap[faceKey] + durationOf(faceKey))
  return endTimeList.length ? Math.max(...endTimeList) : 0
}

/** 整段动画的总时长 */
const totalDuration = computed(() => totalOf(activeDelayMap.value))

watch([foldDelayMap, unfoldDelayMap, totalDuration], () => {
  emit('schedule', { fold: foldDelayMap.value, unfold: unfoldDelayMap.value, total: totalDuration.value })
}, { immediate: true })

/**
 * 动画期间锁定的延迟表，为 null 表示空闲
 * 锁定原因：中途改排布参数（换顺序/改间隔）时若实时改写 transition-delay，正在跑的过渡会被重新挂上延迟而卡住
 */
const delaySnapshot = ref(null)

/**
 * 取某个面实际生效的延迟：动画期间读锁定的快照，空闲时读实时排布
 * @param {String} faceKey 面的标识 top/right/left/bottom/back
 * @returns {Number} 延迟毫秒数
 */
const delayOf = (faceKey) => {
  return (delaySnapshot.value || activeDelayMap.value)[faceKey] || 0
}

/**
 * 生成某个面的内联样式
 * @param {String} faceKey 面的标识 top/right/left/bottom/back
 * @returns {Object} 内联样式对象
 */

const faceStyle = (faceKey) => {
  return {
    position: 'absolute',
    left: `${-props.width / 2}px`,
    top: `${-props.width / 2}px`,
    width: `${props.width}px`,
    height: `${props.width}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.92)',
    transitionProperty: 'transform',
    userSelect: 'none',
    transform: props.folded ? FOLDED_TRANSFORM[faceKey] : OPEN_TRANSFORM[faceKey],
    transitionDuration: `${durationOf(faceKey)}ms`,
    transitionDelay: `${delayOf(faceKey)}ms`,
    transitionTimingFunction: props.easing
  }
}

const faceFrontStyle = computed(() => {
  return Object.assign({
    background: props.faceConfig.front?.bgColor || 'rgba(0, 0, 0, 0)',
    transform: 'translate(0, 0)'
  }, faceStyle('front'), props.faceConfig.front?.customStyle || {})
})

const faceTopStyle = computed(() => {
  return Object.assign({
    background: props.faceConfig.top?.bgColor || 'rgba(0, 0, 0, 0)',
    transformOrigin: '50% 100%'
  }, faceStyle('top'), props.faceConfig.top?.customStyle || {})
})

const faceBottomStyle = computed(() => {
  return Object.assign({
    background: props.faceConfig.bottom?.bgColor || 'rgba(0, 0, 0, 0)',
    transformOrigin: '50% 0%',
    transformStyle: 'preserve-3d'
  }, faceStyle('bottom'), props.faceConfig.bottom?.customStyle || {})
})

const faceBackStyle = computed(() => {
  return Object.assign({
    background: props.faceConfig.back?.bgColor || 'rgba(0, 0, 0, 0)',
    transformOrigin: '50% 0%'
  }, faceStyle('back'), {
    left: '0%',
    top: '0%',
  }, props.faceConfig.back?.customStyle || {})
})

const faceLeftStyle = computed(() => {
  return Object.assign({
    background: props.faceConfig.left?.bgColor || 'rgba(0, 0, 0, 0)',
    transformOrigin: '100% 50%'
  }, faceStyle('left'), props.faceConfig.left?.customStyle || {})
})

const faceRightStyle = computed(() => {
  return Object.assign({
    background: props.faceConfig.right?.bgColor || 'rgba(0, 0, 0, 0)',
    transformOrigin: '0% 50%'
  }, faceStyle('right'), props.faceConfig.right?.customStyle || {})
})

const centerDotStyle = computed(() => {
  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#facc15',
    boxShadow: '0 0 12px 2px rgba(250, 204, 21, 0.8)',
    transform: `translate(-50%, -50%) translateZ(-${props.width / 2}px)`
  }
})

let playTimer = null
let loopTimer = null
let looping = false
let loopTarget = true
let playingLocal = false

/** 没拖过视角时，切换折叠态给一个默认角度 */
const applyDefaultAngle = (targetFolded) => {
  if (userMoved.value) {
    return
  }
  rotX.value = targetFolded ? -22 : 0
  rotY.value = targetFolded ? 32 : 0
}

/** 一段过渡跑完：解锁延迟表，回到实时排布 */
const endTransition = () => {
  playingLocal = false
  delaySnapshot.value = null
  emit('playing', false)
}

/**
 * 启动一段折叠或展开
 * 打断（上一段还没跑完）时把延迟清零，让所有面立刻响应当前指令，
 * 否则每个面会先僵在半路等自己的错开延迟，看起来像“停了一下又过一会儿才动”
 * @param {Boolean} targetFolded true 折叠 / false 展开
 */
const startTransition = (targetFolded) => {
  const interrupting = playingLocal
  const targetMap = targetFolded ? foldDelayMap.value : unfoldDelayMap.value
  delaySnapshot.value = interrupting
    ? Object.fromEntries(Object.keys(targetMap).map((faceKey) => [faceKey, 0]))
    : { ...targetMap }
  loopTarget = !targetFolded
  emit('update:folded', targetFolded)
  applyDefaultAngle(targetFolded)
  playingLocal = true
  emit('playing', true)
  clearTimeout(playTimer)
  playTimer = setTimeout(endTransition, totalOf(delaySnapshot.value) + 60)
}

const play = (targetFolded) => {
  stopLoop()
  startTransition(targetFolded)
}

const fold = () => play(true)
const unfold = () => play(false)

/** 往返播放的单次执行：播完一段后停顿一下再反向播放 */
const runLoopOnce = () => {
  if (!looping) {
    return
  }
  startTransition(loopTarget)
  clearTimeout(loopTimer)
  loopTimer = setTimeout(runLoopOnce, totalOf(delaySnapshot.value) + 260)
}

const toggleLoop = () => {
  if (looping) {
    stopLoop()
    return
  }
  looping = true
  loopTarget = !props.folded
  emit('looping', true)
  runLoopOnce()
}

const stopLoop = () => {
  looping = false
  emit('looping', false)
  clearTimeout(loopTimer)
}

/** 视角归零，并恢复“跟随折叠态自动摆角度” */
const resetView = () => {
  stopLoop()
  userMoved.value = false
  rotX.value = 0
  rotY.value = 0
  applyDefaultAngle(props.folded)
}

let lastX = 0
let lastY = 0

const onPointerDown = (event) => {
  dragging.value = true
  userMoved.value = true
  lastX = event.clientX
  lastY = event.clientY
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}

const onPointerMove = (event) => {
  rotY.value += (event.clientX - lastX) * 0.4
  rotX.value -= (event.clientY - lastY) * 0.4
  lastX = event.clientX
  lastY = event.clientY
}

const onPointerUp = () => {
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
}

onBeforeUnmount(() => {
  clearTimeout(playTimer)
  clearTimeout(loopTimer)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
})

defineExpose({
  fold,
  unfold,
  toggleLoop,
  stopLoop,
  resetView,
  cubeStyle,
  cubeCoreStyle,
  faceFrontStyle,
  faceTopStyle,
  faceBottomStyle,
  faceBackStyle,
  faceLeftStyle,
  faceRightStyle,
  totalDuration,
  delayMap: activeDelayMap
})
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.stage {
  height: 100%;
  min-height: 520px;
  position: relative;
  perspective: 900px;
  perspective-origin: 50% 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  border-radius: $border-radius;
  background: linear-gradient(135deg, #1e293b, #0f172a);
}
</style>
