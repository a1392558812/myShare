<template>
  <appContainer>
    <layoutCom style="width: 400px;" title="刻度尺控制器" type="panel"
      :addLayerBtnList="[{ label: '显示源码', callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }) }]">
      <controlItem label="分成多少个大个格子" :labelValue="`【x:${config.numeralSystem.x}】-【y:${config.numeralSystem.y}】`">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span> {{ value }}:</span>
          <inputCom type="number" style="width: 100%;" v-model.number="config.numeralSystem[value]" :min="1" :max="60"
            :step="1" />
        </div>
      </controlItem>

      <controlItem label="每个大格子分成多少个小区格"
        :labelValue="`【x:${config.graduationMarkNum.x}】-【y:${config.graduationMarkNum.y}】`">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span> {{ value }}:</span>
          <inputCom type="number" style="width: 100%;" v-model.number="config.graduationMarkNum[value]" :min="1"
            :max="30" :step="1" />
        </div>
      </controlItem>

      <controlItem label="刻度尺方向" inputType="select" v-model="config.orientation">
        <selectCom style="width: 100%;" v-model="config.orientation" :options="[
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' },
          { label: '水平垂直', value: 'both' },
        ]" />
      </controlItem>

      <controlItem label="缩放步进" inputType="range" v-model.number="config.scaleStep"
        :slotProps="{ min: 0.1, max: 5, step: 0.01 }" />

      <controlItem label="当前刻度值" :labelValue="`【x:${config.currentValue.x}】-【y:${config.currentValue.y}】`">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span> {{ value }}:</span>
          <inputCom type="number" style="width: 100%;" v-model.number="config.currentValue[value]"
            :min="config.minValue[value]" :max="config.maxValue[value]" :step="0.001" />
        </div>
      </controlItem>

      <controlItem label="最小行进刻度 (0表示不限制)" :labelValue="`【x:${config.setup.x}】-【y:${config.setup.y}】`">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span> {{ value }}:</span>
          <inputCom type="number" style="width: 100%;" v-model.number="config.setup[value]" :min="0" :step="0.1" />
        </div>
      </controlItem>

      <controlItem label="最小值 (minValue)" :labelValue="`【x:${config.minValue.x}】-【y:${config.minValue.y}】`">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span> {{ value }}:</span>
          <inputCom type="number" style="width: 100%;" v-model.number="config.minValue[value]"
            :max="config.maxValue[value] - 1" :step="0.1" />
        </div>
      </controlItem>

      <controlItem label="最大值 (maxValue)" :labelValue="`【x:${config.maxValue.x}】-【y:${config.maxValue.y}】`">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span> {{ value }}:</span>
          <inputCom type="number" style="width: 100%;" v-model.number="config.maxValue[value]"
            :min="config.minValue[value] + 1" :step="0.1" />
        </div>
      </controlItem>

      <controlItem label="主刻度高度 (majorMarkHeight)"
        :labelValue="`【x:${config.majorMarkHeight.x}】-【y:${config.majorMarkHeight.y}】`">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span> {{ value }}:</span>
          <inputCom type="range" style="width: 100%;" v-model.number="config.majorMarkHeight[value]" :min="1" :max="100"
            :step="1" />
        </div>
      </controlItem>

      <controlItem label="主刻度颜色">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span style="width: 165px; flex-shrink: 0;"> {{ value }}: 【{{ config.majorMarkColor[value] }}】</span>
          <colorPicker style="flex: 1;" :tipsStyle="{ transform: 'translateX(-250px)' }"
            v-model="config.majorMarkColor[value]" />
        </div>
      </controlItem>

      <controlItem label="副刻度高度 (minorMarkHeight)"
        :labelValue="`【x:${config.minorMarkHeight.x}】-【y:${config.minorMarkHeight.y}】`">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span> {{ value }}:</span>
          <inputCom type="range" style="width: 100%;" v-model.number="config.minorMarkHeight[value]" :min="1" :max="100"
            :step="1" />
        </div>
      </controlItem>

      <controlItem label="副刻度颜色">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span style="width: 165px; flex-shrink: 0;"> {{ value }}: 【{{ config.minorMarkColor[value] }}】</span>
          <colorPicker style="flex: 1;" :tipsStyle="{ transform: 'translateX(-250px)' }"
            v-model="config.minorMarkColor[value]" />
        </div>
      </controlItem>

      <controlItem label="padding">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['top', 'right', 'bottom', 'left']"
          :key="value">
          <span style="width: 50px; flex-shrink: 0;"> {{ value }}:</span>
          <inputCom type="number" style="width: 100%;" v-model.number="config.padding[value]" :min="0" :step="0.1" />
        </div>
      </controlItem>

      <controlItem label="指针宽度 (pointerWidth)"
        :labelValue="`【x:${config.pointerWidth.x}】-【y:${config.pointerWidth.y}】`">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span> {{ value }}:</span>
          <inputCom type="number" style="width: 100%;" v-model.number="config.pointerWidth[value]" :step="1" />
        </div>
      </controlItem>

      <controlItem label="指针颜色">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span style="width: 165px; flex-shrink: 0;"> {{ value }}: 【{{ config.pointerColor[value] }}】</span>
          <colorPicker style="flex: 1;" :tipsStyle="{ transform: 'translateX(-250px)' }"
            v-model="config.pointerColor[value]" />
        </div>
      </controlItem>

      <controlItem label="标签颜色">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span style="width: 165px; flex-shrink: 0;"> {{ value }}: 【{{ config.textColor[value] }}】</span>
          <colorPicker style="flex: 1;" :tipsStyle="{ transform: 'translateX(-250px)' }"
            v-model="config.textColor[value]" />
        </div>
      </controlItem>

      <controlItem label="标签格式" :labelValue="`【x:${labelFormat.x}】-【y:${labelFormat.y}】`">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span> {{ value }}:</span>
          <selectCom style="width: 100%;" v-model="labelFormat[value]" :options="[
            { label: '自定义', value: 'custom' },
            { label: '小数格式', value: 'decimal' },
            { label: '无格式', value: 'none' },
            { label: '整数', value: 'number' },
          ]" />
        </div>
      </controlItem>

      <controlItem label="canvasWidth" inputType="number" v-model.number="config.canvasWidth" :min="0" :step="1" />

      <controlItem label="canvasHeight" inputType="number" v-model.number="config.canvasHeight" :min="0" :step="1" />

      <controlItem label="是否禁用 (disabled)" :labelValue="`【x:${config.disabled.x}】-【y:${config.disabled.y}】`">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span> {{ value }}:</span>
          <inputCom type="checkbox" v-model.boolean="config.disabled[value]" />
        </div>
      </controlItem>

      <controlItem label="是否显示line (showLine)" :labelValue="`【x:${config.showLine.x}】-【y:${config.showLine.y}】`">
        <div style="display: flex; align-items: center; gap: 8px;" v-for="value in ['x', 'y']" :key="value">
          <span> {{ value }}:</span>
          <inputCom type="checkbox" v-model.boolean="config.showLine[value]" />
        </div>
      </controlItem>

      <customBtnCom @click="resetConfig">重置配置</customBtnCom>
    </layoutCom>

    <layoutCom style="min-width: 800px;" title="预览" type="preview">
      <template #preview>
        <RulerComponent :scaleStep="config.scaleStep" :numeralSystem="config.numeralSystem"
          :canvasWidth="config.canvasWidth" :canvasHeight="config.canvasHeight" :textColor="config.textColor"
          :majorMarkColor="config.majorMarkColor" :minorMarkColor="config.minorMarkColor"
          :orientation="config.orientation" :graduationMarkNum="config.graduationMarkNum"
          :pointerWidth="config.pointerWidth" :majorMarkHeight="config.majorMarkHeight"
          :minorMarkHeight="config.minorMarkHeight" :currentValue="config.currentValue" :setup="config.setup"
          :minValue="config.minValue" :maxValue="config.maxValue" :labelX="formatLabel('x')" :labelY="formatLabel('y')"
          :pointerColor="config.pointerColor" :padding="config.padding" :disabled="config.disabled"
          @change="handleRulerChange" @scale="handleScaleChange" />
      </template>
      <template #code>
        <codeCopyContent :code="generateCodeExample" title="组件使用示例" />
      </template>
    </layoutCom>
  </appContainer>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import RulerComponent from './components/index.vue';
import { controlItem, codeCopyContent, selectCom, customBtnCom, inputCom, layoutCom, appContainer } from '../components/form-control/index.vue'
import { colorPicker } from '../components/color-picker/index.js'
import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const initConfigFunc = () => ({
  scaleStep: 1,
  canvasWidth: 800,
  canvasHeight: 600,
  numeralSystem: {
    x: 10,
    y: 10
  },
  majorMarkHeight: {
    x: 20,
    y: 20
  },
  minorMarkHeight: {
    x: 10,
    y: 10
  },
  graduationMarkNum: {
    x: 10,
    y: 10
  },
  currentValue: {
    x: 50,
    y: 50
  },
  setup: {
    x: 1,
    y: 1
  },
  minValue: {
    x: 0,
    y: 0
  },
  maxValue: {
    x: 100,
    y: 100
  },
  padding: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  disabled: {
    x: false,
    y: false
  },
  showLine: {
    x: true,
    y: true
  },
  pointerWidth: {
    x: 4,
    y: 4
  },
  majorMarkColor: {
    x: 'rgba(0, 0, 0, 0.80)',
    y: 'rgba(0, 0, 0, 0.80)',
  },
  minorMarkColor: {
    x: 'rgba(0, 0, 0, 0.80)',
    y: 'rgba(0, 0, 0, 0.80)',
  },
  textColor: {
    x: 'rgba(0, 0, 0, 0.80)',
    y: 'rgba(0, 0, 0, 0.80)',
  },
  pointerColor: {
    x: 'rgba(255, 138, 179, 0.40)',
    y: 'rgba(138, 255, 204, 0.40)',
  },
  orientation: 'both',
})

const config = reactive(initConfigFunc());

const labelFormat = reactive({
  x: 'decimal',
  y: 'decimal'
});

const formatLabel = computed(() => (key) => {
  if (labelFormat[key] === 'decimal') return (value) => value.toFixed(2);
  if (labelFormat[key] === 'number') return (value) => value.toFixed(0);
  if (labelFormat[key] === 'custom') return (value) => `🐮${value.toFixed(0)}🍺`;
  return () => '';
});

const handleRulerChange = (newValue) => {
  Object.assign(config.currentValue, {
    x: +(newValue.x.toFixed(3)),
    y: +(newValue.y.toFixed(3))
  });
  console.log('Ruler value changed:', newValue);
};
const handleScaleChange = (newScale) => {
  console.log('Scale changed:', newScale);
  Object.assign(config.minValue, {
    x: +(newScale.minValue.x.toFixed(1)),
    y: +(newScale.minValue.y.toFixed(1))
  });
  Object.assign(config.maxValue, {
    x: +(newScale.maxValue.x.toFixed(1)),
    y: +(newScale.maxValue.y.toFixed(1))
  });
};
const resetConfig = () => {
  Object.assign(config, initConfigFunc());
  labelFormat.value = 'number';
};
const generateCodeExample = computed(() => {
  return `<RulerComponent :scaleStep="${config.scaleStep}" :numeralSystem="{x: ${config.numeralSystem.x}, y: ${config.numeralSystem.y}}" :canvasWidth="${config.canvasWidth}" :canvasHeight="${config.canvasHeight}"
  :textColor="{x: ${config.textColor.x}, y: ${config.textColor.y}}" :majorMarkColor="{x: ${config.majorMarkColor.x}, y: ${config.majorMarkColor.y}}" 
  :minorMarkColor="{x: ${config.minorMarkColor.x}, y: ${config.minorMarkColor.y}}" :orientation="config.orientation" :graduationMarkNum="{x: ${config.graduationMarkNum.x}, y: ${config.graduationMarkNum.y}}"
  :pointerWidth="{x: ${config.pointerWidth.x}, y: ${config.pointerWidth.y}}" :majorMarkHeight="{x: ${config.majorMarkHeight.x}, y: ${config.majorMarkHeight.y}}"
  :minorMarkHeight="{x: ${config.minorMarkHeight.x}, y: ${config.minorMarkHeight.y}}" :currentValue="{x: ${config.currentValue.x}, y: ${config.currentValue.y}}" :setup="{x: ${config.setup.x}, y: ${config.setup.y}}"
  :minValue="{x: ${config.minValue.x}, y: ${config.minValue.y}}" :maxValue="{x: ${config.maxValue.x}, y: ${config.maxValue.y}}" :disabled="{x: ${config.disabled.x}, y: ${config.disabled.y}}"
  :labelX="${formatLabel.value('x')}" :labelY="${formatLabel.value('y')}" :pointerColor="{x: ${config.pointerColor.x}, y: ${config.pointerColor.y}}" 
  :padding="{top: ${config.padding.top}, right: ${config.padding.right}, bottom: ${config.padding.bottom}, left: ${config.padding.left}}" @change="handleRulerChange" />`;
});
</script>

<style lang="scss" scoped></style>