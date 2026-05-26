<template>
  <div class="particle-animation-container">
    <app-container>
      <layout-com
        style="width: 420px"
        title="粒子系统控制器"
        type="panel"
        :addLayerBtnList="[
          {
            label: '显示源码',
            callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }),
          },
        ]"
      >
        <control-item
          label="粒子数量"
          inputType="range"
          :slotProps="controlConfigs.particleCount"
          v-model="config.particleCount"
        />

        <control-item
          label="粒子大小"
          inputType="range"
          :slotProps="controlConfigs.particleSize"
          v-model="config.particleSize"
        />

        <control-item
          label="连接距离"
          inputType="range"
          :slotProps="controlConfigs.maxDistance"
          v-model="config.maxDistance"
        />

        <control-item
          label="粒子速度"
          inputType="range"
          :slotProps="controlConfigs.speed"
          v-model="config.speed"
        />

        <control-item label="粒子颜色">
          <div class="color-control-wrapper">
            <div class="color-presets">
              <div
                v-for="color in colorPresets.particleColors"
                :key="color.value"
                class="color-preset"
                :style="{ backgroundColor: color.value }"
                :title="color.label"
                @click="selectParticleColor(color.value)"
              />
            </div>
            <colorPicker
              :modelValue="config.color"
              @update:modelValue="(val) => (config.color = val)"
              :tipsStyle="{
                left: 'auto',
                right: '-10px',
                transform: 'translateX(100%)',
              }"
            />
          </div>
        </control-item>

        <control-item label="背景颜色">
          <div class="color-control-wrapper">
            <div class="color-presets">
              <div
                v-for="color in colorPresets.backgroundColors"
                :key="color.value"
                class="color-preset"
                :style="{ backgroundColor: color.value }"
                :title="color.label"
                :alt="color.label"
                @click="selectBackgroundColor(color.value)"
              />
            </div>
            <colorPicker
              :modelValue="config.backgroundColor"
              @update:modelValue="(val) => (config.backgroundColor = val)"
              :tipsStyle="{
                left: 'auto',
                right: '-10px',
                transform: 'translateX(100%)',
              }"
            />
          </div>
        </control-item>

        <control-item
          label="显示连接"
          inputType="checkbox"
          v-model="config.showConnections"
        />

        <control-item v-if="config.showConnections" label="连线颜色">
          <div class="color-control-wrapper">
            <div class="color-presets">
              <div
                v-for="color in colorPresets.particleColors"
                :key="color.value"
                class="color-preset"
                :style="{ backgroundColor: color.value }"
                :title="color.label"
                :alt="color.label"
                @click="selectConnectionColor(color.value)"
              />
            </div>
            <colorPicker
              :modelValue="config.connectionColor"
              @update:modelValue="(val) => (config.connectionColor = val)"
              :tipsStyle="{
                left: 'auto',
                right: '-10px',
                transform: 'translateX(100%)',
              }"
            />
          </div>
        </control-item>

        <control-item
          v-if="config.showConnections"
          label="连线宽度"
          inputType="range"
          :slotProps="controlConfigs.connectionWidth"
          v-model="config.connectionWidth"
        />

        <control-item
          label="交互效果"
          inputType="checkbox"
          v-model="config.interactive"
        />

        <control-item
          v-if="config.interactive"
          label="交互强度"
          inputType="range"
          :slotProps="controlConfigs.interactionForce"
          v-model="config.interactionForce"
        />

        <div style="display: flex; gap: 8px; margin-top: 8px">
          <custom-btn-com @click="resetConfig">重置配置</custom-btn-com>
          <custom-btn-com @click="randomConfig">随机配置</custom-btn-com>
        </div>
      </layout-com>

      <layout-com style="min-width: 800px" title="粒子动画预览" type="preview">
        <template #preview>
          <ParticleAnimationComponent
            ref="particleRef"
            :customStyle="{
              width: 'auto',
              height: '300px',
            }"
            :particleCount="config.particleCount"
            :maxDistance="config.maxDistance"
            :particleSize="config.particleSize"
            :speed="config.speed"
            :color="config.color"
            :backgroundColor="config.backgroundColor"
            :showConnections="config.showConnections"
            :connectionColor="config.connectionColor"
            :connectionWidth="config.connectionWidth"
            :interactive="config.interactive"
            :interactionForce="config.interactionForce"
          />
        </template>

        <template #code>
          <codeCopyContent :code="generateCodeExample" title="使用示例" />
        </template>
      </layout-com>
    </app-container>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { colorPicker } from "../components/color-picker/index.js";
import ParticleAnimationComponent from "./components/index.vue";

import {
  inputCom,
  selectCom,
  customBtnCom,
  controlItem,
  codeCopyContent,
  layoutCom,
  appContainer,
} from "../components/form-control/index.vue";

import baseConfig from "../static/hooks/extends.js";
defineOptions({
  extends: baseConfig({
    customDialog: import("../components/dialog/index.vue"),
  }),
});

const controlConfigs = {
  particleCount: { min: 10, max: 200, step: 1 },
  particleSize: { min: 1, max: 20, step: 0.1 },
  maxDistance: { min: 10, max: 300, step: 1 },
  speed: { min: 0.1, max: 10, step: 0.1 },
  connectionWidth: { min: 0.5, max: 5, step: 0.1 },
  interactionForce: { min: 2, max: 20, step: 0.1 },
};

// 预选颜色配置
const colorPresets = {
  particleColors: [
    { value: "rgba(79, 70, 229, 1)", label: "🐮0" },
    { value: "rgba(239, 68, 68, 1)", label: "🐮1" },
    { value: "rgba(16, 185, 129, 1)", label: "🐮2" },
    { value: "rgba(245, 158, 11, 1)", label: "🐮3" },
    { value: "rgba(139, 92, 246, 1)", label: "🐮4" },
    { value: "rgba(236, 72, 153, 1)", label: "🐮5" },
    { value: "rgba(6, 182, 212, 1)", label: "🐮6" },
    { value: "rgba(255, 255, 255, 1)", label: "🐮7" },
    { value: "rgba(0, 0, 0, 1)", label: "🐮8" },
  ],
  backgroundColors: [
    { value: "rgba(248, 250, 252, 1)", label: "🐮0" },
    { value: "rgba(15, 23, 42, 1)", label: "🐮1" },
    { value: "rgba(150, 41, 59, 1)", label: "🐮2" },
    { value: "rgba(254, 243, 199, 1)", label: "🐮3" },
    { value: "rgba(240, 249, 255, 1)", label: "🐮4" },
    { value: "rgba(30, 130, 150, 1)", label: "🐮5" },
    { value: "rgba(139, 92, 246, 1)", label: "🐮6" },
  ],
};

const defaultConfig = {
  particleCount: 80,
  maxDistance: 150,
  particleSize: 3,
  speed: 1,
  color: "rgba(79, 70, 229, 1)",
  backgroundColor: "rgba(248, 250, 252, 1)",
  showConnections: true,
  connectionColor: "rgba(0, 0, 0, 1)",
  connectionWidth: 1,
  interactive: true,
  interactionForce: 2,
};

const config = reactive({ ...defaultConfig });

const particleRef = ref(null);

// [min, max]区间内生成随机数
const randomInRange = (min, max, step = 1) => {
  if (step >= 1) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const decimals = step.toString().split(".")[1]?.length || 0;
  const multiplier = Math.pow(10, decimals);
  const steps = Math.floor((max - min) / step) + 1;
  const randomStep = Math.floor(Math.random() * steps);
  return Math.round((min + randomStep * step) * multiplier) / multiplier;
};

const generateCodeExample = computed(() => {
  return `<ParticleAnimationComponent
  width="100%"
  height="600px"
  :particleCount="${config.particleCount}"
  :maxDistance="${config.maxDistance}"
  :particleSize="${config.particleSize}"
  :speed="${config.speed}"
  color="${config.color}"
  backgroundColor="${config.backgroundColor}"
  :showConnections="${config.showConnections}"
  connectionColor="${config.connectionColor}"
  :connectionWidth="${config.connectionWidth}"
  :interactive="${config.interactive}"
  :interactionForce="${config.interactionForce}"
/>`;
});

const resetConfig = () => {
  Object.assign(config, defaultConfig);
};

const randomConfig = () => {
  config.particleCount = randomInRange(
    controlConfigs.particleCount.min,
    controlConfigs.particleCount.max,
    controlConfigs.particleCount.step,
  );

  config.maxDistance = randomInRange(
    controlConfigs.maxDistance.min,
    controlConfigs.maxDistance.max,
    controlConfigs.maxDistance.step,
  );

  config.particleSize = randomInRange(
    controlConfigs.particleSize.min,
    controlConfigs.particleSize.max,
    controlConfigs.particleSize.step,
  );

  config.speed = randomInRange(
    controlConfigs.speed.min,
    controlConfigs.speed.max,
    controlConfigs.speed.step,
  );

  config.color =
    colorPresets.particleColors[
      Math.floor(Math.random() * colorPresets.particleColors.length)
    ].value;
  config.backgroundColor =
    colorPresets.backgroundColors[
      Math.floor(Math.random() * colorPresets.backgroundColors.length)
    ].value;

  config.showConnections = Math.random() > 0.5;
  if (config.showConnections) {
    config.connectionColor =
      colorPresets.particleColors[
        Math.floor(Math.random() * colorPresets.particleColors.length)
      ].value;
    config.connectionWidth = randomInRange(
      controlConfigs.connectionWidth.min,
      controlConfigs.connectionWidth.max,
      controlConfigs.connectionWidth.step,
    );
  }

  config.interactive = Math.random() > 0.5;
  if (config.interactive) {
    config.interactionForce = randomInRange(
      controlConfigs.interactionForce.min,
      controlConfigs.interactionForce.max,
      controlConfigs.interactionForce.step,
    );
  }
};

// 快捷选择颜色
const selectParticleColor = (color) => {
  config.color = color;
};

const selectBackgroundColor = (color) => {
  config.backgroundColor = color;
};

const selectConnectionColor = (color) => {
  config.connectionColor = color;
};
</script>

<style scoped lang="scss">
@use "./async-demo/static/scss/theme.scss";

.particle-animation-container {
  font-family: inherit;
}

.color-control-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;

  .color-presets {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: $spacing-sm;
    background-color: rgba(0, 0, 0, 0.05);
    padding: $spacing-sm;
    border-radius: $spacing-xs;

    .color-preset {
      width: 24px;
      height: 24px;
      border-radius: $spacing-xs;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: scale(1.15);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      &:active {
        transform: scale(1.05);
      }
    }
  }
}
</style>
