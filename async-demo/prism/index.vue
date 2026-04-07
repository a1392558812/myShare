<template>
  <appContainer>
    <layoutCom
      style="width: 400px"
      title="自定义多棱柱"
      type="panel"
      :addLayerBtnList="[
        {
          label: '显示源码',
          callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }),
        },
      ]"
    >
      <control-item label="棱柱边数 (n):" :labelValue="n">
        <inputCom type="range" :min="3" :max="30" :step="1" v-model="n" />
      </control-item>
      <control-item label="棱柱-gap (gap):" :labelValue="gap">
        <inputCom type="range" :min="-100" :max="100" :step="1" v-model="gap" />
      </control-item>
      <control-item label="棱柱边宽 (sideWidth):" :labelValue="sideWidth">
        <inputCom
          type="range"
          :min="30"
          :max="300"
          :step="1"
          v-model="sideWidth"
        />
      </control-item>
      <control-item label="棱柱边高 (sideHeight):" :labelValue="sideHeight">
        <inputCom
          type="range"
          :min="30"
          :max="400"
          :step="1"
          v-model="sideHeight"
        />
      </control-item>
      <control-item label="棱柱缩放比例 (scale):" :labelValue="scale">
        <inputCom
          type="range"
          :min="0.3"
          :max="3"
          :step="0.1"
          v-model="scale"
        />
      </control-item>
      <control-item label="顶面透明度:" :labelValue="topOpacity">
        <inputCom
          type="range"
          :min="0"
          :max="1"
          :step="0.1"
          v-model="topOpacity"
        />
      </control-item>
      <control-item label="底面透明度:" :labelValue="bottomOpacity">
        <inputCom
          type="range"
          :min="0"
          :max="1"
          :step="0.1"
          v-model="bottomOpacity"
        />
      </control-item>
      <control-item label="绕X轴旋转角度:" :labelValue="rotationX">
        <inputCom type="number" :step="1" v-model="rotationX" />
      </control-item>
      <control-item label="绕Y轴旋转角度:" :labelValue="rotationY">
        <inputCom type="number" :step="1" v-model="rotationY" />
      </control-item>
      <control-item
        v-for="(item, index) in sideStyle"
        :key="index"
        :label="`第${index + 1}棱柱透明度:`"
        :labelValue="item.opacity"
      >
        <inputCom
          type="range"
          :min="0"
          :max="1"
          :step="0.1"
          v-model="item.opacity"
        />
      </control-item>
    </layoutCom>

    <layoutCom style="min-width: 800px" title="预览" type="preview">
      <template #preview>
        <PrismComponent
          :n="n"
          :sideWidth="sideWidth"
          :sideHeight="sideHeight"
          :gap="gap"
          :sideStyle="
            sideStyle.map((item, index) => ({
              backgroundColor: `rgba(251, 114, 153, ${item.opacity})`,
              color: `rgba(0, 0, 0, ${item.opacity})`,
            }))
          "
          :topStyle="{
            backgroundColor: `rgba(251, 114, 153, ${topOpacity})`,
            color: `rgba(0, 0, 0, ${topOpacity})`,
          }"
          :bottomStyle="{
            backgroundColor: `rgba(251, 114, 153, ${bottomOpacity})`,
            color: `rgba(0, 0, 0, ${bottomOpacity})`,
          }"
          @cssStyle="getCssStyle"
          v-model:scale="scale"
          v-model:rotationX="rotationX"
          v-model:rotationY="rotationY"
        />
      </template>

      <template #code>
        <codeCopyContent :code="htmlCode" title="html" />
        <codeCopyContent :code="styleCode" title="css" />
      </template>
    </layoutCom>
  </appContainer>
</template>

<script setup>
import { ref, watch } from "vue";
import PrismComponent from "./components/index.vue";

import {
  inputCom,
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

const n = ref(3);
const scale = ref(1);
const sideWidth = ref(150);
const sideHeight = ref(200);
const rotationX = ref(20);
const rotationY = ref(30);
const gap = ref(0);
const sideStyle = ref([]);
const topOpacity = ref(0.7);
const bottomOpacity = ref(0.7);

const htmlCode = ref(``);
const styleCode = ref(``);

const camelToHyphen = (str) =>
  str.replace(
    /[A-Z]/g,
    (match, offset) => (offset > 0 ? "-" : "") + match.toLowerCase(),
  );

const getCssStyle = (cssStyle) => {
  const htmlStr =
    ` <div class="prism-container">
    <div class="prism-wrapper">
      <div class="prism">
        <div class="prism-face top">上底</div>
        <div class="prism-face bottom">下底</div>` +
    Array.from(
      { length: n.value || 0 },
      (_, i) => `
        <div class="prism-face side${i}">${i}</div>`,
    ).join("") +
    `
      </div>
    </div>
  </div>\n`;

  const cssMap = {};
  Object.keys(cssStyle).forEach((key1) => {
    cssMap[key1] = Object.keys(cssStyle[key1])
      .map((key) => `     ${camelToHyphen(key)}: ${cssStyle[key1][key]};\n`)
      .join("");
  });
  cssMap.containerStyle = `${cssMap.containerStyle}     padding-top: 200px;\n`;

  const cssStr = `<style>
  .prism-container {\n${cssMap.containerStyle}  }
  .prism-wrapper {\n${cssMap.wrapperStyle}  }
  .prism {\n${cssMap.prismStyle}  }
  .prism-face {\n${cssMap.prismFaceStyle}  }
  .prism-face.top {\n${cssMap.topFaceStyle}  }
  .prism-face.bottom {\n${cssMap.bottomFaceStyle}  }
${Array.from({ length: n.value || 0 }, (_, i) => `  .prism-face.side${i} {\n${cssMap[`side${i}`]}  }\n`).join("")}</style>`;

  htmlCode.value = htmlStr;
  styleCode.value = cssStr;
};

watch(
  () => n.value,
  (newN) => {
    sideStyle.value = Array.from({ length: newN || 0 }, () => ({
      opacity: 0.7,
    }));
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
