<template>
  <div class="cube-preview-container">
    <app-container>
      <layout-com
        style="width: 400px"
        title="立方体生成"
        type="panel"
        :addLayerBtnList="[
          {
            label: '显示源码',
            callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }),
          },
        ]"
      >
        <div
          style="
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 0.5em;
          "
        >
          <custom-btn-com @click="reset">重置</custom-btn-com>
        </div>

        <control-item
          label="显示XYZ坐标轴:"
          inputType="checkbox"
          :modelValue="cubeData.showAxis"
          @update:modelValue="updateShowAxis"
        />

        <control-item
          label="立方体大小:"
          :labelValue="`${cubeData.cubeSize}px`"
          inputType="range"
          :modelValue="cubeData.cubeSize"
          @update:modelValue="updateCubeSize"
          :slotProps="{ min: 50, max: 200, step: 10 }"
        />

        <control-item
          label="面间隙:"
          :labelValue="`${cubeData.cubeGap}px`"
          inputType="range"
          :modelValue="cubeData.cubeGap"
          @update:modelValue="updateCubeGap"
          :slotProps="{ min: -20, max: 20, step: 1 }"
        />

        <layout-com :titleLevel="3" title="旋转角度" type="panel">
          <control-item
            v-for="(key, index) in Object.keys(cubeData.rotation)"
            :key="index"
            :label="`${key}轴:`"
            :labelValue="`${cubeData.rotation[key]}°`"
            inputType="number"
            :modelValue="cubeData.rotation[key]"
            @update:modelValue="updateRotation(key, $event)"
            :slotProps="{ step: 1 }"
          />
        </layout-com>

        <layout-com :titleLevel="3" title="旋转中心" type="panel">
          <control-item
            v-for="(key, index) in Object.keys(cubeData.rotationOrigin)"
            :key="index"
            :label="`${key}轴偏移:`"
            inputType="number"
            :modelValue="cubeData.rotationOrigin[key]"
            @update:modelValue="updateRotationOrigin(key, $event)"
          />
        </layout-com>

        <layout-com :titleLevel="3" title="位移" type="panel">
          <control-item
            v-for="(key, index) in Object.keys(cubeData.position)"
            :key="index"
            :label="`${key}轴偏移:`"
            :labelValue="`${cubeData.position[key]}px`"
            inputType="range"
            :modelValue="cubeData.position[key]"
            @update:modelValue="updatePosition(key, $event)"
            :slotProps="{ min: -100, max: 100, step: 1 }"
          />
        </layout-com>
      </layout-com>

      <layout-com style="min-width: 600px" title="预览" type="preview">
        <template #preview>
          <Cube
            :customStyle="{
              width: '100%',
              height: '400px',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }"
            :show-axis="cubeData.showAxis"
            :size="cubeData.cubeSize"
            :gap="cubeData.cubeGap"
            v-model:rotation="cubeData.rotation"
            :rotation-origin="cubeData.rotationOrigin"
            :position="cubeData.position"
            @cubeStyleChange="onCubeStyleChange"
          />
        </template>

        <template #code>
          <codeCopyContent :code="htmlCode" title="html" />
          <codeCopyContent :code="styleCode" title="css" />
        </template>
      </layout-com>
    </app-container>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import Cube from "./components/index.vue";

import {
  customBtnCom,
  controlItem,
  layoutCom,
  appContainer,
  codeCopyContent,
} from "../components/form-control/index.vue";

import baseConfig from "../static/hooks/extends.js";
defineOptions({
  extends: baseConfig({
    customDialog: import("../components/dialog/index.vue"),
  }),
});

const htmlCode = computed(() => {
  let res = `<div class="cube-wrap">
  <div class="container">
    <div class="cube">
      <div class="cube-face-front"></div>
      <div class="cube-face-back"></div>
      <div class="cube-face-left"></div>
      <div class="cube-face-right"></div>
      <div class="cube-face-top"></div>
      <div class="cube-face-bottom"></div>
    </div>`;

  if (cubeData.showAxis) {
    res =
      res +
      `
    <div class="axis-wrap">
      <div class="axis-line-wrap">
        <div class="axis-x-line">
          <span class="axis-x-label">X</span>
        </div>
      </div>
      <div class="axis-line-wrap">
        <div class="axis-y-line">
          <span class="axis-y-label">Y</span>
        </div>
      </div>
      <div class="axis-line-wrap">
        <div class="axis-z-line">
          <span class="axis-z-label">Z</span>
        </div>
      </div>
    </div>`;
  }
  return (
    res +
    `
  </div>
</div>
  `
  );
});

const styleCode = ref("");

const getInitData = () => ({
  showAxis: true,
  cubeSize: 100,
  cubeGap: 0,
  rotation: {
    x: -30.5,
    y: 30.5,
    z: 0,
  },
  rotationOrigin: {
    x: 50,
    y: 50,
    z: 0,
  },
  position: {
    x: 0,
    y: 0,
    z: 0,
  },
});

const cubeData = reactive(getInitData());

const updateShowAxis = (value) => {
  cubeData.showAxis = value;
};

const updateCubeSize = (value) => {
  cubeData.cubeSize = value;
};

const updateCubeGap = (value) => {
  cubeData.cubeGap = value;
};

const updateRotation = (axis, value) => {
  cubeData.rotation[axis] = value;
};

const updateRotationOrigin = (axis, value) => {
  cubeData.rotationOrigin[axis] = value;
};

const updatePosition = (axis, value) => {
  cubeData.position[axis] = value;
};

const reset = () => {
  Object.assign(cubeData, getInitData());
};

const camelToHyphen = (str) =>
  str.replace(
    /[A-Z]/g,
    (match, offset) => (offset > 0 ? "-" : "") + match.toLowerCase(),
  );

const onCubeStyleChange = (exposeStyle) => {
  console.log("onCubeStyleChange", exposeStyle);

  let res = `<style>`;

  for (const key in exposeStyle) {
    const axisKeyList = [
      "axisWrapStyle",
      "axisXLineStyle",
      "axisXLabelStyle",
      "axisYLineStyle",
      "axisYLabelStyle",
      "axisZLineStyle",
      "axisZLabelStyle",
    ];

    const ifSkip = cubeData.showAxis ? false : axisKeyList.includes(key);

    if (!ifSkip) {
      const className = camelToHyphen(key).replace("-style", "");
      res =
        res +
        "\n" +
        `  .${className} {\n${Object.keys(exposeStyle[key])
          .map(
            (styleKey) =>
              `    ${camelToHyphen(styleKey)}: ${exposeStyle[key][styleKey]};\n`,
          )
          .join("")}  }\n`;
    }
  }
  res = res + "</style>";
  styleCode.value = res;
  return;

  // styleCode.value = `<style>\n${Object.keys(exposeStyle)
  //   .map((key) => {
  //     const className = camelToHyphen(key).replace("-style", "");
  //     return `  .${className} {\n${Object.keys(exposeStyle[key])
  //       .map(
  //         (styleKey) =>
  //           `    ${camelToHyphen(styleKey)}: ${exposeStyle[key][styleKey]};\n`,
  //       )
  //       .join("")}  }\n`;
  //   })
  //   .join("\n")}</style>`;
};
</script>

<style scoped>
.cube-preview-container {
  width: 100%;
  height: 100vh;
}
</style>
