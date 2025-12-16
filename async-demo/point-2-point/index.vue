<template>
  <div class="path-drawing-controller">
    <!-- 使用参考的布局组件 -->
    <app-container>
      <layout-com style="width: 400px;" title="路径绘制控制器" type="panel"
        :addLayerBtnList="[{ label: '显示源码', callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }) }]">

        <control-item label="显示网格:" inputType="checkbox" :modelValue="interactionConfig.showGrid"
          @update:modelValue="updateShowGrid" />

        <div style="display: flex; flex-direction: row; align-items: center; gap: 0.5em;">
          <custom-btn-com @click="addPath">添加路径</custom-btn-com>
          <custom-btn-com @click="clearPaths">清空路径</custom-btn-com>
          <custom-btn-com @click="backToPreviousStep">回退历史</custom-btn-com>
        </div>

        <control-item label="画布偏移量:">
          <div style="display: flex; align-items: center; gap: 0.5em;" v-for="key in ['x', 'y']" :key="key">
            <span>{{ key }}:</span>
            <inputCom type="number" :modelValue="interactionConfig.canvasOffset[key]"
              @update:modelValue="(val) => updateCanvasOffset(key, Number(val))" />
          </div>
        </control-item>

        <control-item label="当前选中项:">
          <select-com :options="Array.from({ length: pointList.length }, (_, i) => ({
            label: `第${i + 1}个`, value: i
          }))" v-model.number="selectedLineIndex" />
        </control-item>

        <template v-for="(path, index) in pointList" :key="index">
          <layout-com v-if="index === selectedLineIndex"
            style="overflow: visible; border: 1px solid rgba(0, 0, 0, 0.1);" :titleLevel="3" :title="`路径信息-${index}`"
            type="panel" @click="selectLine(index)">
            <template #titleRight>
              <custom-btn-com :key="index" @click.stop="removePath(index)">🗑️</custom-btn-com>
            </template>

            <control-item label="线条颜色:">
              <colorPicker style="width: auto;" :tipsStyle="{}" :modelValue="path.color"
                @update:modelValue="(val) => updatePathValue(index, 'color', val)" />
            </control-item>

            <control-item label="线条宽度:" inputType="range" :slotProps="{ min: 1, max: 10, step: 1 }"
              :modelValue="path.lineWidth"
              @update:modelValue="(val) => updatePathValue(index, 'lineWidth', Number(val))" />

            <control-item v-for="(item2, index2) in [
              { label: '起点', key: 'start' }, { label: '终点', key: 'end' }
            ]" :label="`${item2.label}:`" :key="`${index}-${index2}`">
              <div style="display: flex; flex-direction: row; align-items: center; gap: 0.5em;"
                v-for="(key2, key2Index) in Object.keys(path[item2.key])" :key="`${index}-${index2}-${key2Index}`">
                <span>{{ key2 }}:</span>
                <inputCom :modelValue="path[item2.key][key2]"
                  @update:modelValue="(val) => updatePointStartAndEndValue(index, item2.key, key2, val)" />
              </div>
            </control-item>

            <control-item label="控制点:">
              <custom-btn-com v-if="path.controlPoints.length"
                @click.stop="addControlPoint(index, pointIndex)">➕</custom-btn-com>
              <div style="display: flex; align-items: center; gap: 1em; border: 1px solid #ccc; padding: 0.5em;"
                v-for="(pointItem, pointIndex) in path.controlPoints" :key="`${index}-${pointIndex}`">
                <h4 style="width: 6em;">{{ `控制点-${pointIndex}` }}</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5em;">
                  <div style="display: flex; flex-direction: row; align-items: center; gap: 0.5em;"
                    v-for="(keyItem, keyIndex) in Object.keys(pointItem)" :key="`${index}-${pointIndex}-${keyIndex}`">
                    <span>{{ keyItem }}:</span>
                    <inputCom :modelValue="pointItem[keyItem]"
                      @update:modelValue="(val) => updatePointValue(index, pointIndex, keyItem, val)" />
                  </div>
                </div>
                <custom-btn-com v-if="ifShowDeleteBtn(index, pointIndex)" :key="index"
                  @click.stop="removeControlPoint(index, pointIndex)">🗑️</custom-btn-com>
              </div>
            </control-item>

            <control-item label="曲线类型:" :labelValue="path.curveType">
              <select-com :options="curveTypeOptions" :modelValue="path.curveType"
                @update:modelValue="(val) => updatePathValue(index, 'curveType', val)" />
            </control-item>

            <control-item label="张力系数:" inputType="range" :modelValue="path.tension"
              @update:modelValue="(val) => updatePathValue(index, 'tension', Number(val))"
              :slotProps="{ min: 0, max: 1, step: 0.1, disabled: path.curveType !== 'catmull-rom' }" />


            <control-item label="显示控制:">
              <div v-for="(rowItem, rowIndex) in [
                { label: '显示整条线', key: 'visible' },
                { label: '显示控制点', key: 'showControlPoints' },
                { label: '启用拖拽', key: 'enableInteraction' },
                { label: '显示控制点线', key: 'showControlLines' },
                { label: '显示动画', key: 'showAnimation' }
              ]" style="display: flex; gap: 0.5em;" :key="`${index}-${rowIndex}`">
                <span>{{ rowItem.label }}:</span>
                <inputCom type="checkbox" :modelValue="path[rowItem.key]"
                  @update:modelValue="(val) => updatePathValue(index, rowItem.key, val)" />
              </div>
            </control-item>

            <control-item label="动画速度:" inputType="range" :modelValue="path.animationSpeed"
              :label-value="path.animationSpeed + 'x'"
              @update:modelValue="(val) => updatePathValue(index, 'animationSpeed', Number(val))"
              :slotProps="{ min: 0.5, max: 5, step: 0.5 }" />

          </layout-com>
        </template>
      </layout-com>

      <layout-com style="min-width: 800px;" title="预览" type="preview">
        <template #preview>
          <PathDrawingComponent ref="pathDrawingRef" :width="800" :height="600" :paths="pointList"
            :show-grid="interactionConfig.showGrid" :selected-path-index="selectedLineIndex"
            @pathUpdate="handlePathPointUpdate" @controlPointUpdate="handleControlPointUpdate" />
        </template>

        <template #code>
          <codeCopyContent :code="generateCodeExample" title="使用示例" />
        </template>
      </layout-com>
    </app-container>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { colorPicker } from '../components/color-picker/index.js'
import PathDrawingComponent from './components/index.vue'

import {
  inputCom,
  selectCom,
  customBtnCom,
  controlItem,
  codeCopyContent,
  layoutCom,
  appContainer
} from '../components/form-control/index.vue'

import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const interactionConfig = reactive({
  showGrid: true,
  canvasOffset: { x: 0, y: 0 },
})

const pointList = ref([
  {
    start: { x: 100, y: 300 },
    end: { x: 300, y: 300 },
    color: 'rgba(59, 130, 246, 0.5)',
    lineWidth: 3,
    curveType: 'quadratic',
    tension: 0.5,
    animationSpeed: 1,
    visible: true,
    showControlLines: true,
    controlPoints: [{ x: 200, y: 200 }],
    enableInteraction: false,
    showControlPoints: false,
    showAnimation: false,
  },
  {
    start: { x: 300, y: 300 },
    end: { x: 500, y: 300 },
    color: 'rgba(255, 0, 0, 0.5)',
    lineWidth: 3,
    curveType: 'cubic',
    tension: 0.5,
    animationSpeed: 1,
    visible: true,
    showControlLines: true,
    controlPoints: [{ x: 400, y: 200 }, { x: 450, y: 400 }],
    enableInteraction: true,
    showControlPoints: true,
    showAnimation: true,
  },
  {
    start: { x: 500, y: 300 },
    end: { x: 700, y: 300 },
    color: 'rgba(16, 185, 129, 0.5)',
    lineWidth: 3,
    curveType: 'catmull-rom',
    tension: 0.5,
    animationSpeed: 1,
    visible: true,
    showControlLines: true,
    controlPoints: [{ x: 600, y: 350 }],
    enableInteraction: false,
    showControlPoints: false,
    showAnimation: false,
  }
])

const ifShowDeleteBtn = computed(() => (index, pointIndex) => {
  console.log('pointList.value[index].curveType', pointList.value[index].curveType)
  if (pointList.value[index].curveType === 'linear') {
    return false
  }
  if (pointList.value[index].curveType === 'quadratic') {
    return pointList.value[index].controlPoints.length > 1
  }
  if (pointList.value[index].curveType === 'cubic') {
    return pointList.value[index].controlPoints.length > 2
  }
  return true
})

const selectedLineIndex = ref(0)

const pathDrawingRef = ref(null)

const curveTypeOptions = [
  { label: '直线', value: 'linear' },
  { label: '二次贝塞尔曲线', value: 'quadratic' },
  { label: '三次贝塞尔曲线', value: 'cubic' },
  { label: 'Catmull-Rom样条', value: 'catmull-rom' }
]

const history = ref([])
const historyIndex = ref(-1)

const generateCodeExample = computed(() => `<PathDrawingComponent ref="pathDrawingRef" :width="800" :height="600"
  :paths="${JSON.stringify(pointList.value)}" :show-grid="${interactionConfig.showGrid}" :selected-path-index="${selectedLineIndex.value}"
  @pathUpdate="handlePathPointUpdate" @controlPointUpdate="handleControlPointUpdate" />`)

const removeControlPoint = (index, pointIndex) => {
  pointList.value[index].controlPoints.splice(pointIndex, 1)
  updatePaths()
}

const addControlPoint = (index, pointIndex) => {
  if (pointList.value[index].curveType === 'linear') {
    return
  }
  pointList.value[index].controlPoints.push({ x: 10, y: 10 })
  updatePaths()
}

const updatePointValue = (index, pointIndex, keyItem, val) => {
  pointList.value[index].controlPoints[pointIndex][keyItem] = Number(val)
  updatePaths()
}

const updatePointStartAndEndValue = (index, key1, key2, val) => {
  pointList.value[index][key1][key2] = Number(val)
  updatePaths()
}

const updateShowGrid = (value) => {
  interactionConfig.showGrid = value
  updatePaths()
}

const updateCanvasOffset = (key, val) => {
  interactionConfig.canvasOffset[key] = val
  pathDrawingRef.value.setOffset(interactionConfig.canvasOffset)
}

const updatePathValue = (index, key, val) => {
  pointList.value[index][key] = val
  updatePaths()
}

const updatePaths = () => {
  if (selectedLineIndex.value !== null) {
    const path = pointList.value[selectedLineIndex.value]
    if (path.curveType === 'linear') {
      path.controlPoints = []
    } else if (path.curveType === 'quadratic' && (!path.controlPoints || path.controlPoints.length < 1)) {
      const midX = (path.start.x + path.end.x) / 2
      const midY = (path.start.y + path.end.y) / 2 - 50
      path.controlPoints = [{ x: midX, y: midY }]
    } else if (path.curveType === 'cubic' && (!path.controlPoints || path.controlPoints.length < 2)) {
      path.controlPoints = [
        { x: path.start.x + 50, y: path.start.y - 50 },
        { x: path.end.x - 50, y: path.end.y - 50 }
      ]
    }
  }
}

const addPath = () => {
  pointList.value.push({
    start: { x: 10, y: 10 },
    end: { x: 500, y: 300 },
    color: 'rgba(255, 0, 0, 0.5)',
    lineWidth: 3,
    curveType: 'cubic',
    tension: 0.5,
    animationSpeed: 1,
    visible: true,
    showControlLines: true,
    controlPoints: [{ x: 400, y: 200 }, { x: 450, y: 400 }, { x: 200, y: 300 }],
    enableInteraction: true,
    showControlPoints: true,
    showAnimation: true,
  })
  selectedLineIndex.value = pointList.value.length - 1
  saveToHistory()
  updatePaths()
}

const removePath = (index) => {
  pointList.value.splice(index, 1)
  if (selectedLineIndex.value >= pointList.value.length) {
    selectedLineIndex.value = pointList.value.length - 1
  }
  saveToHistory()
  updatePaths()
}

const clearPaths = () => {
  pointList.value = []
  selectedLineIndex.value = null
  saveToHistory()
  updatePaths()
}

const backToPreviousStep = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    const state = history.value[historyIndex.value]
    pointList.value = JSON.parse(JSON.stringify(state.pointList))
    selectedLineIndex.value = state.selectedLineIndex
    updatePaths()
  }
}

const selectLine = (index) => {
  selectedLineIndex.value = index
  updatePaths()
}

const handleControlPointUpdate = (data) => {
  console.log('控制点更新:', data)
}
const handlePathPointUpdate = (data) => {
  console.log('路径点更新:', data)
  saveToHistory()
}
const saveToHistory = () => {
  const state = {
    pointList: JSON.parse(JSON.stringify(pointList.value)),
    selectedLineIndex: selectedLineIndex.value
  }
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(state)
  historyIndex.value = history.value.length - 1
  if (history.value.length > 50) {
    history.value.shift()
    historyIndex.value--
  }
}

onMounted(() => {
  nextTick(() => {
    saveToHistory()
    updatePaths()
  })
})
</script>

<style scoped lang="scss"></style>