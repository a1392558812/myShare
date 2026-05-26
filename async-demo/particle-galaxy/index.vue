<template>
  <div class="particle-galaxy-controller">
    <app-container>
      <layout-com
        style="width: 400px"
        title="粒子星系效果"
        type="panel"
        :addLayerBtnList="[
          {
            label: '显示源码',
            callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }),
          },
        ]"
      >
        <control-item
          label="粒子数量:"
          :labelValue="config.particleCount"
          inputType="range"
          :slotProps="{ min: 10, max: 500, step: 10 }"
          v-model.number="config.particleCount"
        />

        <control-item
          label="粒子大小:"
          :labelValue="config.particleSize"
          inputType="range"
          :slotProps="{ min: 1, max: 10, step: 1 }"
          v-model.number="config.particleSize"
        />

        <control-item
          label="旋转速度:"
          :labelValue="config.rotationSpeed"
          inputType="range"
          :slotProps="{ min: 0, max: 0.1, step: 0.001 }"
          v-model.number="config.rotationSpeed"
        />

        <control-item
          label="吸引力强度:"
          :labelValue="config.attractionStrength"
          inputType="range"
          :slotProps="{ min: 0.001, max: 1, step: 0.001 }"
          v-model.number="config.attractionStrength"
        />

        <control-item
          label="螺旋强度:"
          :labelValue="config.spiralFactor"
          inputType="range"
          :slotProps="{ min: 0, max: 10, step: 0.1 }"
          v-model.number="config.spiralFactor"
        />

        <control-item
          label="中心X位置:"
          :labelValue="config.centerX.toFixed(2)"
          inputType="range"
          :slotProps="{ min: 0, max: 1, step: 0.05 }"
          v-model.number="config.centerX"
        />

        <control-item
          label="中心Y位置:"
          :labelValue="config.centerY.toFixed(2)"
          inputType="range"
          :slotProps="{ min: 0, max: 1, step: 0.05 }"
          v-model.number="config.centerY"
        />

        <control-item label="颜色方案:">
          <select-com
            :options="colorSchemeOptions"
            v-model="config.colorScheme"
          />
        </control-item>

        <control-item
          label="启用拖尾:"
          inputType="checkbox"
          v-model="config.enableTrail"
        />

        <control-item
          label="拖尾透明度:"
          :labelValue="config.trailOpacity"
          inputType="range"
          :slotProps="{ min: 0.01, max: 0.5, step: 0.01 }"
          v-model.number="config.trailOpacity"
        />

        <div
          style="
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 0.5em;
          "
        >
          <custom-btn-com @click="toggleAnimation">
            {{ config.isRunning ? "暂停" : "开始" }}
          </custom-btn-com>
          <custom-btn-com @click="resetParticles"> 重置粒子 </custom-btn-com>
        </div>

        <div
          style="
            display: flex;
            flex-direction: column;
            gap: 0.5em;
            margin-top: 1em;
            font-size: 14px;
          "
        >
          <div style="display: flex; justify-content: space-between">
            <span>FPS:</span>
            <span style="color: #4f46e5; font-family: monospace">{{
              config.currentFPS
            }}</span>
          </div>
        </div>
      </layout-com>

      <layout-com style="min-width: 800px" title="预览" type="preview">
        <template #preview>
          <ParticleGalaxy
            :customStyle="{
              width: 'auto',
              height: '600px',
            }"
            :particle-count="config.particleCount"
            :particle-size="config.particleSize"
            :rotation-speed="config.rotationSpeed"
            :attraction-strength="config.attractionStrength"
            :center-x="config.centerX"
            :center-y="config.centerY"
            :spiral-factor="config.spiralFactor"
            :color-scheme="config.colorScheme"
            :enable-trail="config.enableTrail"
            :trail-opacity="config.trailOpacity"
            :is-running="config.isRunning"
            @update:fps="config.currentFPS = $event"
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
import { reactive, computed } from "vue";
import {
  inputCom,
  selectCom,
  customBtnCom,
  controlItem,
  codeCopyContent,
  layoutCom,
  appContainer,
} from "../components/form-control/index.vue";
import ParticleGalaxy from "./components/ParticleGalaxy.vue";

import baseConfig from "../static/hooks/extends.js";
defineOptions({
  extends: baseConfig({
    customDialog: import("../components/dialog/index.vue"),
  }),
});

const defaultConfig = {
  particleCount: 150,
  particleSize: 2,
  rotationSpeed: 0.002,
  attractionStrength: 0.02,
  centerX: 0.5,
  centerY: 0.5,
  spiralFactor: 0.3,
  colorScheme: "rainbow",
  enableTrail: true,
  trailOpacity: 0.1,
  isRunning: true,
  currentFPS: 0,
};

const config = reactive({ ...defaultConfig });

const colorSchemeOptions = [
  { label: "彩虹", value: "rainbow" },
  { label: "蓝色", value: "blue" },
  { label: "紫色", value: "purple" },
  { label: "火焰", value: "fire" },
  { label: "极光", value: "aurora" },
];

const generateCodeExample = computed(
  () => `<ParticleGalaxy
  :particle-count="${config.particleCount}"
  :particle-size="${config.particleSize}"
  :rotation-speed="${config.rotationSpeed}"
  :attraction-strength="${config.attractionStrength}"
  :center-x="${config.centerX}"
  :center-y="${config.centerY}"
  :spiral-factor="${config.spiralFactor}"
  :color-scheme="'${config.colorScheme}'"
  :enable-trail="${config.enableTrail}"
  :trail-opacity="${config.trailOpacity}"
  :is-running="${config.isRunning}"
  @update:fps="config.currentFPS = $event"
/>`,
);

const toggleAnimation = () => {
  config.isRunning = !config.isRunning;
};

const resetParticles = () => {
  Object.assign(config, defaultConfig);
  config.isRunning = true;
};
</script>

<style scoped lang="scss"></style>
