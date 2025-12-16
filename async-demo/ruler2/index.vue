<template>
  <appContainer>
    <layoutCom style="width: 400px;" title="刻度尺2控制器" type="panel">
      <div class="presets">
        <h3>预设</h3>
        <div class="preset-buttons">
          <customBtnCom v-for="(preset, index) in presets" :key="index" @click="applyPreset(preset)">
            {{ preset.name }}
          </customBtnCom>
        </div>
      </div>

      <controlItem label="进制系统" v-model.number="config.numeralSystem" inputType="number"
        :slotProps="{ min: 1, step: 1 }">
      </controlItem>

      <controlItem label="刻度密度" v-model.number="config.graduationMarkNum" inputType="number"
        :slotProps="{ min: 1, step: 1 }">
      </controlItem>

      <controlItem label="每单位unit对应像素" v-model.number="config.pixelsPerValue" inputType="number"
        :slotProps="{ min: 0, step: 1 }">
      </controlItem>

      <controlItem label="标尺方向">
        <selectCom style="width: 100%;" v-model="config.orientation" :options="[
          { label: 'horizontal', value: 'horizontal' },
          { label: 'vertical', value: 'vertical' },
        ]" />
      </controlItem>

      <controlItem label="文字颜色">
        <selectCom style="width: 100%;" v-model="config.labelFormat" :options="[
          { label: '自定义', value: 'custom' },
          { label: '小数格式', value: 'decimal' },
          { label: '时j间格式', value: 'time' },
          { label: '无格式', value: 'none' },

        ]" />
      </controlItem>

      <controlItem label="主刻度高度" v-model.number="config.majorMarkHeight" inputType="number"
        :slotProps="{ min: 1, max: 100, step: 1 }">
      </controlItem>

      <controlItem label="主刻度颜色">
        <colorPicker style="width: auto;" v-model="config.majorMarkColor" />
      </controlItem>

      <controlItem label="副刻度高度" v-model.number="config.minorMarkHeight" inputType="number"
        :slotProps="{ min: 1, max: 100, step: 1 }">
      </controlItem>

      <controlItem label="副刻度颜色">
        <colorPicker style="width: auto;" v-model="config.minorMarkColor" />
      </controlItem>

      <controlItem label="文字颜色">
        <colorPicker style="width: auto;" v-model="config.textColor" />
      </controlItem>

      <controlItem label="当前值" v-model.number="config.currentValue" inputType="number">
      </controlItem>

      <controlItem label="最小值">
        <div style="display: flex; gap: 10px; align-items: center;">
          <span>是否禁用：</span>
          <inputCom v-model.boolean="config.minValueDisabled" type="checkbox" />
        </div>
        <inputCom v-if="!config.minValueDisabled" style="flex: 1;" :max="config.maxValue - 1"
          v-model.number="config.minValue" type="number" />
      </controlItem>

      <controlItem label="最大值">
        <div style="display: flex; gap: 10px; align-items: center;">
          <span>是否禁用：</span>
          <inputCom v-model.boolean="config.maxValueDisabled" type="checkbox" />
        </div>
        <inputCom v-if="!config.maxValueDisabled" style="flex: 1;" :min="config.minValue + 1"
          v-model.number="config.maxValue" type="number" />
      </controlItem>

      <controlItem label="步进值" v-model.number="config.setup" inputType="number"
        :slotProps="{ min: 0, max: 10, step: 0.1 }">
      </controlItem>

      <controlItem label="指针颜色">
        <colorPicker style="width: auto;" v-model="config.pointerColor" />
      </controlItem>

      <controlItem label="指针宽度" v-model.number="config.pointerWidth" inputType="number"
        :slotProps="{ min: 0, max: 30, step: 0.1 }">
      </controlItem>
    </layoutCom>

    <layoutCom style="min-width: 800px;" title="预览" type="preview">
      <template #preview>
        <RulerComponent v-bind="config" :canvasWidth="canvasConfig.canvasWidth"
          :canvasHeight="canvasConfig.canvasHeight" :minValue="config.minValueDisabled ? null : config.minValue"
          :maxValue="config.maxValueDisabled ? null : config.maxValue" :label="formatLabel"
          @change="handleRulerChange" />
      </template>
      <template #code>
        <codeCopyContent :code="generateCodeExample" title="使用示例" />
      </template>
      <layoutCom title="源码" type="panel">
        <div v-for="value in 5" :key="value">👇</div>
      </layoutCom>
    </layoutCom>

    <template #footer>
      <codeContent />
    </template>
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

const initConfigFun = () => ({
  labelFormat: 'none',
  orientation: 'horizontal',
  majorMarkHeight: 20,
  minorMarkHeight: 10,
  numeralSystem: 100,
  pointerWidth: 2,
  graduationMarkNum: 10,
  pixelsPerValue: 10,
  currentValue: 50,
  setup: 1,

  minValueDisabled: false,
  minValue: 0,

  maxValueDisabled: false,
  maxValue: 100,

  majorMarkColor: 'rgba(0, 0, 0, 0.8)',
  minorMarkColor: 'rgba(0, 0, 0, 0.5)',
  textColor: 'rgba(0, 0, 0, 0.8)',
  pointerColor: 'rgba(255, 0, 0, 0.6)',
  canvasWidth: 800,
  canvasHeight: 60
})

const presets = [
  { name: '默认', config: initConfigFun() },
  {
    name: '时间', config: {
      ...initConfigFun(),
      minValueDisabled: true,
      maxValueDisabled: true,
      numeralSystem: 1440,
      graduationMarkNum: 15,
      labelFormat: 'time',
    }
  },
  { name: '自定义', config: { labelFormat: 'custom' } },
]

const config = reactive(initConfigFun())

const canvasConfig = computed(() => {
  if (config.orientation === 'vertical') {
    return {
      canvasWidth: 60,
      canvasHeight: 800
    }
  } else {
    return {
      canvasWidth: 800,
      canvasHeight: 60
    }
  }
})

const generateCodeExample = computed(() => `<RulerComponent :labelFormat="${config.labelFormat}" :orientation="${config.orientation}" :majorMarkHeight="${config.majorMarkHeight}" :minorMarkHeight="${config.minorMarkHeight}"
 :numeralSystem="${config.numeralSystem}" :pointerWidth="${config.pointerWidth}" :graduationMarkNum="${config.graduationMarkNum}" :pixelsPerValue="${config.pixelsPerValue}" :currentValue="${config.currentValue}" :setup="${config.setup}" 
 :minValueDisabled="${config.minValueDisabled}" :minValue="${config.minValueDisabled ? 'null' : config.minValue}" :maxValueDisabled="${config.maxValueDisabled}" :maxValue="${config.maxValueDisabled ? 'null' : config.maxValue}" 
 :minorMarkColor="${config.minorMarkColor}" :textColor="${config.textColor}" :pointerColor="${config.pointerColor}" :canvasWidth="${canvasConfig.value.canvasWidth}" :canvasHeight="${canvasConfig.value.canvasHeight}" :minValue="${config.minValueDisabled ? 'null' : config.minValue}" 
 :majorMarkColor="${config.majorMarkColor}" :maxValue="${config.maxValueDisabled ? 'null' : config.maxValue}" 
 :label="${formatLabel.value}" @change="handleRulerChange" />`)

const formatLabel = computed(() => {
  if (config.labelFormat === 'decimal') return (value) => value.toFixed(2);
  if (config.labelFormat === 'none') return (value) => value.toString();
  if (config.labelFormat === 'custom') return (value) => `🐮${value.toFixed(0)}🍺`;
  if (config.labelFormat === 'time') return (value) => {
    const maxValue = config.numeralSystem;
    if (maxValue <= 0) {
      throw new Error('maxValue必须为正数');
    }
    const val = Math.abs(Number(value));
    let x;
    if (val === 0) {
      x = 0;
    } else {
      const mod = val % maxValue;
      x = mod === 0 ? maxValue : mod;
    }
    const totalSeconds = Math.round((x / maxValue) * 86400);
    let hours, minutes, seconds;
    if (totalSeconds === 86400) {
      hours = 24;
      minutes = 0;
      seconds = 0;
    } else {
      hours = Math.floor(totalSeconds / 3600);
      const remainingSeconds = totalSeconds % 3600;
      minutes = Math.floor(remainingSeconds / 60);
      seconds = remainingSeconds % 60;
    }

    const format = (num) => num.toString().padStart(2, '0');
    const hoursStr = hours === 24 ? '24' : format(hours);
    const minutesStr = format(minutes);
    const secondsStr = format(seconds);

    return `${hoursStr}:${minutesStr}:${secondsStr}`;
  };
  return () => '';
});

const applyPreset = (preset) => {
  Object.assign(config, preset.config)
}

const handleRulerChange = (newValue) => {
  Object.assign(config, { currentValue: newValue })
}


</script>
<style lang="scss" scoped>
@use './async-demo/static/scss/theme.scss';

.presets {
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
  }
}
</style>