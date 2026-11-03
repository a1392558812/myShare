<template>
  <div class="cube-unfolding-folding">
    <appContainer>
      <layoutCom style="width: 420px;" title="折叠顺序调试" type="panel"
        :addLayerBtnList="[{ label: '显示源码', callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }) }]">
        <controlItem label="播放:">
          <div class="btn-row">
            <customBtnCom @click="runAnimation(true)">折叠</customBtnCom>
            <customBtnCom @click="runAnimation(false)">展开</customBtnCom>
            <customBtnCom @click="cubeRef?.toggleLoop()">{{ looping ? '停止往返' : '往返播放' }}</customBtnCom>
            <customBtnCom @click="onReset">重置</customBtnCom>
          </div>
        </controlItem>

        <p class="panel-hint">总时长 {{ schedule.total }}ms · {{ playing ? '播放中…' : '空闲' }}</p>

        <OrderList orderName="fold" title="折叠顺序" :orderKeys="foldOrder" :faceConfig="faceConfig"
          :delayMap="schedule.fold" @move="onOrderMove" @updateDuration="onUpdateDuration" />

        <OrderList orderName="unfold" title="展开顺序" :orderKeys="unfoldOrder" :faceConfig="faceConfig"
          :delayMap="schedule.unfold" @move="onOrderMove" @updateDuration="onUpdateDuration">
          <customBtnCom @click="mirrorUnfoldOrder">= 折叠逆序</customBtnCom>
        </OrderList>

        <controlItem label="排布方式:">
          <selectCom :options="SCHEDULE_OPTIONS" :ifShowLabel="true" v-model="scheduleMode" />
        </controlItem>

        <controlItem label="步进间隔:" inputType="range" :modelValue="stepGap" :label-value="`${stepGap}ms`"
          :slotProps="{ min: 0, max: 1500, step: 50 }" @update:modelValue="onGapChange" />

        <controlItem label="统一时长:">
          <div class="inline-row">
            <inputCom type="number" :min="100" :max="2400" :step="50" :modelValue="uniformDuration"
              @update:modelValue="onUniformChange" />
            <customBtnCom @click="applyUniformDuration">应用</customBtnCom>
          </div>
        </controlItem>

        <controlItem label="缓动曲线:">
          <selectCom :options="EASING_OPTIONS" :ifShowLabel="true" v-model="easing" />
        </controlItem>

        <controlItem label="显示旋转中心:">
          <inputCom type="checkbox" v-model="showCenterDot" />
        </controlItem>

        <p class="panel-hint">拖动预览区可转动视角，旋转中心恒定为正方体正中心</p>
      </layoutCom>

      <layoutCom title="预览" type="preview">
        <template #preview>
          <div class="stage-wrap">
            <CubeBox ref="cubeRef" v-model:folded="folded" :fold-order="foldOrder" :unfold-order="unfoldOrder"
              :face-config="faceConfig" :step-gap="stepGap" :easing="easing" :schedule-mode="scheduleMode"
              :show-center-dot="showCenterDot" @playing="playing = $event" @looping="looping = $event"
              @schedule="schedule = $event" />
          </div>
        </template>

        <template #code>
          <codeCopyContent :code="cubeCode" title="组件代码" />
          <codeCopyContent :code="htmlCode" title="html代码" />
          <codeCopyContent :code="cssCode" title="css代码" />
        </template>
      </layoutCom>
    </appContainer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CubeBox from './components/cube-box.vue'
import OrderList from './components/order-list.vue'
import {
  inputCom,
  selectCom,
  customBtnCom,
  controlItem,
  layoutCom,
  appContainer,
  codeCopyContent
} from '../components/form-control/index.vue'

import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const EASING_OPTIONS = [
  { value: 'cubic-bezier(0.22, 1, 0.36, 1)', label: '弹性缓出（默认）' },
  { value: 'ease-in-out', label: 'ease-in-out' },
  { value: 'ease', label: 'ease' },
  { value: 'linear', label: 'linear' },
  { value: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)', label: '回弹' }
]

const SCHEDULE_OPTIONS = [
  { value: 'auto', label: '自动（不重叠）' },
  { value: 'stagger', label: '固定间隔（可重叠）' },
  { value: 'serial', label: '首尾相接（忽略间隔）' }
]

const createFaceConfig = () => ({
  front: { label: '前面', bgColor: 'rgba(239, 68, 68, 0.8)', duration: 600 },
  top: { label: '上面', bgColor: 'rgba(245, 158, 11, 0.8)', duration: 600 },
  right: { label: '右面', bgColor: 'rgba(139, 92, 246, 0.8)', duration: 600 },
  left: { label: '左面', bgColor: 'rgba(53, 130, 246, 0.8)', duration: 600 },
  bottom: { label: '下面', bgColor: 'rgba(16, 185, 11, 0.8)', duration: 600 },
  back: { label: '后面', bgColor: 'rgba(20, 184, 166, 0.8)', duration: 600 }
})

/** 默认折叠顺 */
const createFoldOrder = () => ['top', 'right', 'left', 'bottom', 'back']

/** 默认展开顺序 */
const createUnfoldOrder = () => ['back', 'bottom', 'left', 'right', 'top']

const cubeRef = ref(null)

const folded = ref(false)
const playing = ref(false)
const looping = ref(false)
const showCenterDot = ref(true)

const faceConfig = ref(createFaceConfig())
const foldOrder = ref(createFoldOrder())
const unfoldOrder = ref(createUnfoldOrder())
const stepGap = ref(600)
const uniformDuration = ref(600)
const easing = ref(EASING_OPTIONS[0].value)
const scheduleMode = ref(SCHEDULE_OPTIONS[0].value)

/** 组件算好的排布结果：两条顺序各自的起始延迟表 + 总时长 */
const schedule = ref({ fold: {}, unfold: {}, total: 0 })

const runAnimation = (targetFolded) => {
  if (playing.value) {
    return
  }

  if (targetFolded) {
    if (!folded.value) {
      cubeRef.value?.fold()
    }
  } else {
    if (folded.value) {
      cubeRef.value?.unfold()
    }
  }
}

const onReset = () => {
  if (playing.value) {
    return
  }

  cubeRef.value?.resetView()
  folded.value = false
  faceConfig.value = createFaceConfig()
  foldOrder.value = createFoldOrder()
  unfoldOrder.value = createUnfoldOrder()
  stepGap.value = 600
  uniformDuration.value = 600
  easing.value = EASING_OPTIONS[0].value
  scheduleMode.value = SCHEDULE_OPTIONS[0].value
}

/** 把展开顺序同步成折叠顺序的逆序 */
const mirrorUnfoldOrder = () => {
  unfoldOrder.value = [...foldOrder.value].reverse()
}

/** 把统一时长写进每一个面 */
const applyUniformDuration = () => {
  Object.keys(faceConfig.value).forEach((faceKey) => {
    faceConfig.value[faceKey].duration = uniformDuration.value
  })
}

const onGapChange = (value) => {
  stepGap.value = Number(value)
}

const onUniformChange = (value) => {
  uniformDuration.value = Number(value)
}

/**
 * 修改某个面的过渡时长
 * @param {{ faceKey: String, duration: Number }} payload 面标识与新时长
 */
const onUpdateDuration = (payload) => {
  faceConfig.value[payload.faceKey].duration = payload.duration
}

/**
 * 顺序列表里用 ↑↓ 交换相邻两项
 * @param {{ orderName: String, stepIndex: Number, offset: Number }} payload 顺序名、下标、位移
 */
const onOrderMove = (payload) => {
  const targetRef = payload.orderName === 'unfold' ? unfoldOrder : foldOrder
  const targetIndex = payload.stepIndex + payload.offset
  if (targetIndex < 0 || targetIndex >= targetRef.value.length) {
    return
  }
  const nextList = [...targetRef.value]
  const movedKey = nextList[payload.stepIndex]
  nextList[payload.stepIndex] = nextList[targetIndex]
  nextList[targetIndex] = movedKey
  targetRef.value = nextList
}

const cubeCode = computed(() => [
  '<CubeBox',
  '  ref="cubeRef"',
  '  v-model:folded="folded"',
  '  :fold-order="foldOrder"',
  '  :unfold-order="unfoldOrder"',
  '  :face-config="faceConfig"',
  `  :step-gap="${stepGap.value}"`,
  `  easing="${easing.value}"`,
  `  schedule-mode="${scheduleMode.value}"`,
  `  :show-center-dot="${showCenterDot.value}"`,
  '  @playing="playing = $event"',
  '  @looping="looping = $event"',
  '  @schedule="schedule = $event"',
  '/>',
  '',
].join('\n'))

const camelToKebab = (camelCaseStr) => {
  return camelCaseStr
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, '');
}

const htmlCode = computed(() => {
  return `<div class="cube-style">
  <div class="cube-core-style">
    <div class="face-front-style">前</div>
    <div class="face-top-style">上</div>

    <div class="face-bottom-style">
      下
      <div class="face-back-style">后</div>
    </div>

    <div class="face-left-style">左</div>
    <div class="face-right-style">右</div>
  </div>
</div>`
})

const cssCode = computed(() => {
  if (cubeRef.value) {
    return `${[
      { className: '.cube-style', value: cubeRef.value.cubeStyle },
      { className: '.face-front-style', value: cubeRef.value.faceFrontStyle },
      { className: '.face-top-style', value: cubeRef.value.faceTopStyle },
      { className: '.face-bottom-style', value: cubeRef.value.faceBottomStyle },
      { className: '.face-back-style', value: cubeRef.value.faceBackStyle },
      { className: '.face-left-style', value: cubeRef.value.faceLeftStyle },
      { className: '.face-right-style', value: cubeRef.value.faceRightStyle },
    ].map((itemStyle) => {
      return `${itemStyle.className} {\n  ${Object.keys(itemStyle.value).map((key) => `${camelToKebab(key)}: ${itemStyle.value[key]};`).join('\n  ')}\n}`
    }).join('\n\n')}`
  }

  return ''
})
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.cube-unfolding-folding {
  .btn-row {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .inline-row {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .panel-hint {
    margin: 0;
    font-size: 13px;
    color: $secondary-color;
  }

  .stage-wrap {
    height: 700px;
  }
}
</style>
