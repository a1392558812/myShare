<template>
  <appContainer>
    <layoutCom style="width: 400px;" title="网格参数设置" type="panel"
      :addLayerBtnList="[{ label: '显示源码', callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }) }]">
      <controlItem label="网格角度" :labelValue="`${paramsData.deg}deg`" inputType="number" v-model.number="paramsData.deg"
        :slotProps="{ min: 0, max: 180, step: 1 }" />

      <controlItem label="背景色" :labelValue="paramsData.bgColor">
        <colorPicker style="width: 100%;" v-model="paramsData.bgColor" />
      </controlItem>

      <controlItem label="网格颜色1" :labelValue="paramsData.bgColor1">
        <colorPicker style="width: 100%;" v-model="paramsData.bgColor1" />
      </controlItem>

      <controlItem label="网格颜色2" :labelValue="paramsData.bgColor2">
        <colorPicker style="width: 100%;" v-model="paramsData.bgColor2" />
      </controlItem>

      <controlItem label="网格尺寸 X" :labelValue="`${paramsData.backgroundSizeX}px`" inputType="range"
        v-model.number="paramsData.backgroundSizeX" :slotProps="{ min: 0, max: 180, step: 1 }" />

      <controlItem label="网格尺寸 Y" :labelValue="`${paramsData.backgroundSizeY}px`" inputType="range"
        v-model.number="paramsData.backgroundSizeY" :slotProps="{ min: 0, max: 180, step: 1 }" />

      <controlItem label="同步编辑尺寸"
        :labelValue="`${paramsData.backgroundSizeX === paramsData.backgroundSizeY ? paramsData.backgroundSizeX : '--'}px`">
        <inputCom type="range" style="width: 100%;"
          :value="paramsData.backgroundSizeX === paramsData.backgroundSizeY ? paramsData.backgroundSizeX : 0" :min="0"
          :max="180" step="1" @input="onSyncSizeInput" />
      </controlItem>

      <div class="presets">
        <h3>预设样式</h3>
        <div class="preset-buttons">
          <customBtnCom v-for="(preset, index) in presets" :key="index" @click="applyPreset(preset)">
            {{ preset.name }}
          </customBtnCom>
        </div>
      </div>
    </layoutCom>

    <layoutCom style="min-width: 800px;" type="preview">
      <layoutCom style="flex: auto;" v-for="(item, index) in [
        { customStyle: targetStyle1, cssCode: convertStyleObjectToString(targetStyle1) },
        { customStyle: targetStyle2, cssCode: convertStyleObjectToString(targetStyle2) },
        { customStyle: targetStyle3, cssCode: convertStyleObjectToString(targetStyle3) }
      ]" :key="index" :title="`预览效果 ${index + 1}`" type="preview" class="preview-section">
        <template #preview>
          <div class="preview-box" :style="item.customStyle">
            <div class="preview-text">网格背景效果</div>
          </div>
        </template>
        <template #code>
          <codeCopyContent :code="item.cssCode" title="CSS样式" />
        </template>
      </layoutCom>
    </layoutCom>
  </appContainer>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { colorPicker, parseRgba } from '../components/color-picker/index.js'
import { controlItem, codeCopyContent, customBtnCom, inputCom, layoutCom, appContainer } from '../components/form-control/index.vue'
import baseConfig from '../static/hooks/extends.js'

defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})
const initData = () => {
  return {
    deg: 45,
    backgroundSizeX: 50,
    backgroundSizeY: 50,
    bgColor: 'rgba(255, 255, 255, 1)',
    bgColor1: 'rgba(186, 186, 186, 0.50)',
    bgColor2: 'rgba(250, 220, 255, 0.00)',
  }
}

const paramsData = reactive(initData());
const convertStyleObjectToString = (styleObj) => {
  if (!styleObj) {
    return '';
  }
  return Object.entries(styleObj)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
      return `${cssKey}: ${value}`;
    })
    .join(';\n') + ';';
}

const presets = [
  {
    name: '标准网格',
    deg: 45,
    backgroundSizeX: 15,
    backgroundSizeY: 15,
    bgColor: 'rgba(255, 255, 255, 1)',
    bgColor1: 'rgba(204, 204, 204, 1)',
    bgColor2: 'rgba(204, 204, 204, 0)'
  },
  {
    name: '深色网格',
    deg: 45,
    backgroundSizeX: 50,
    backgroundSizeY: 50,
    bgColor: 'rgba(254, 238, 62, 0.50)',
    bgColor1: 'rgba(255, 0, 0, 0.50)',
    bgColor2: 'rgba(55, 35, 254, 0.00)'
  },
  {
    name: '蓝色网格',
    deg: 45,
    backgroundSizeX: 40,
    backgroundSizeY: 40,
    bgColor: 'rgba(255, 255, 255, 1)',
    bgColor1: 'rgba(52, 152, 219, 0.2)',
    bgColor2: 'rgba(52, 152, 219, 0)'
  },
  {
    name: '充值',
    ...initData(),
  }
];

const targetStyle1 = computed(() => {
  const rgbaMap = parseRgba(paramsData.bgColor2)
  const resColor = rgbaMap.a === 0 ? 'transparent' : paramsData.bgColor2;
  return {
    backgroundImage: `linear-gradient(${paramsData.deg}deg, ${paramsData.bgColor1} 25%, ${resColor} 25%), 
    linear-gradient(${180 - paramsData.deg}deg, ${paramsData.bgColor1} 25%, ${resColor} 25%),
    linear-gradient(${paramsData.deg}deg, ${resColor} 75%, ${paramsData.bgColor1} 75%), 
    linear-gradient(${180 - paramsData.deg}deg, ${resColor} 75%, ${paramsData.bgColor1} 75%)`,
    backgroundSize: `${paramsData.backgroundSizeX}px ${paramsData.backgroundSizeY}px`,
    backgroundPosition: `0px 0px, ${paramsData.backgroundSizeX / 2}px 0px, ${paramsData.backgroundSizeX / 2}px -${paramsData.backgroundSizeY / 2}px, 0px ${paramsData.backgroundSizeY / 2}px`,
    backgroundRepeat: 'repeat',
    backgroundColor: paramsData.bgColor
  }
});

const targetStyle2 = computed(() => {
  const rgbaMap = parseRgba(paramsData.bgColor2)
  const resColor = rgbaMap.a === 0 ? 'transparent' : paramsData.bgColor2;
  return {
    backgroundColor: paramsData.bgColor,
    backgroundImage: `linear-gradient(${paramsData.bgColor1} 50%, ${resColor} 0),
        linear-gradient(to right, ${paramsData.bgColor1} 50%, ${resColor} 0)`,
    backgroundSize: `${paramsData.backgroundSizeX}px ${paramsData.backgroundSizeY}px`,
  }
});

const targetStyle3 = computed(() => {
  const rgbaMap1 = parseRgba(paramsData.bgColor1)
  const rgbaMap2 = parseRgba(paramsData.bgColor2)
  const resColor = `rgba(${rgbaMap2.r}, ${rgbaMap2.g}, ${rgbaMap2.b}, ${rgbaMap1.a})`
  return {
    background: `repeating-linear-gradient(
        -${paramsData.deg}deg,
        transparent,
        transparent 25%,
        ${paramsData.bgColor1} 0,
        ${paramsData.bgColor1} 50%
      ),
      repeating-linear-gradient(
        ${paramsData.deg}deg,
        transparent,
        transparent 25%,
        ${resColor} 0,
        ${resColor} 50%
      ),
      ${paramsData.bgColor}`,
    backgroundSize: `${paramsData.backgroundSizeX}px ${paramsData.backgroundSizeY}px`,
    backgroundBlendMode: 'multiply',
  }
});

const onSyncSizeInput = (e) => {
  let res = Number(e.target.value);
  if (isNaN(res)) {
    res = 0;
  }
  res = res > 180 ? 180 : res < 0 ? 0 : res
  paramsData.backgroundSizeX = res;
  paramsData.backgroundSizeY = res;
  e.target.value = res;
};

const applyPreset = (preset) => {
  paramsData.deg = preset.deg;
  paramsData.backgroundSizeX = preset.backgroundSizeX;
  paramsData.backgroundSizeY = preset.backgroundSizeY;
  paramsData.bgColor = preset.bgColor;
  paramsData.bgColor1 = preset.bgColor1;
  paramsData.bgColor2 = preset.bgColor2;
};

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

.preview-box {
  width: auto;
  height: 200px;
  margin: 10px;
  border-radius: $border-radius;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background $transition-speed;

  .preview-text {
    color: $dark-gray;
    font-size: 20px;
    font-weight: 600;
    text-align: center;
  }
}
</style>