<template>
  <div class="text-rain-controller">
    <app-container>
      <layout-com
        style="width: 400px"
        title="文字雨效果"
        type="panel"
        :addLayerBtnList="[
          {
            label: '显示源码',
            callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }),
          },
        ]"
      >
        <control-item label="显示字符集:">
          <select-com :options="charPresetOptions" v-model="selectedCharSet" />
        </control-item>

        <control-item label="自定义字符:">
          <inputCom
            type="text"
            v-model="charPresets.mix"
            placeholder="输入自定义字符"
          />
        </control-item>

        <control-item
          label="列密度:"
          :labelValue="columnDensity"
          inputType="range"
          :slotProps="{ min: 1, max: 100, step: 1 }"
          v-model.number="columnDensity"
        />

        <control-item
          label="下落速度:"
          :labelValue="fallSpeed"
          inputType="range"
          :slotProps="{ min: 1, max: 100, step: 1 }"
          v-model.number="fallSpeed"
        />

        <control-item
          label="字符大小:"
          :labelValue="fontSize + 'px'"
          inputType="range"
          :slotProps="{ min: 1, max: 32, step: 0.5 }"
          v-model.number="fontSize"
        />

        <control-item
          label="透明度最小值:"
          :labelValue="minOpacity"
          inputType="range"
          :slotProps="{ min: 0, max: maxOpacity, step: 0.1 }"
          v-model.number="minOpacity"
        />

        <control-item
          label="透明度最大值:"
          :labelValue="maxOpacity"
          inputType="range"
          :slotProps="{ min: minOpacity, max: 1, step: 0.1 }"
          v-model.number="maxOpacity"
        />

        <control-item label="头部高亮:">
          <colorPicker
            style="width: auto"
            :tipsStyle="{}"
            v-model="headColor"
          />
        </control-item>

        <control-item label="尾部渐变:">
          <colorPicker
            style="width: auto"
            :tipsStyle="{}"
            v-model="tailColor"
          />
        </control-item>

        <control-item label="拖行渐变:">
          <colorPicker
            style="width: auto"
            :tipsStyle="{}"
            v-model="dragColor"
          />
        </control-item>

        <control-item
          label="启用发光效果:"
          inputType="checkbox"
          v-model="enableGlow"
        />

        <control-item
          label="随机字符消失:"
          inputType="checkbox"
          v-model="enableRandomFade"
        />

        <control-item
          label="顺序显示字符:"
          inputType="checkbox"
          v-model="useSequentialChars"
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
            {{ isRunning ? "暂停" : "开始" }}
          </custom-btn-com>
          <custom-btn-com @click="resetAnimation"> 重置 </custom-btn-com>
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
            <span>总字符数:</span>
            <span style="color: #4f46e5; font-family: monospace">{{
              totalChars
            }}</span>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span>FPS:</span>
            <span style="color: #4f46e5; font-family: monospace">{{
              currentFPS
            }}</span>
          </div>
        </div>
      </layout-com>

      <layout-com style="min-width: 800px" title="预览" type="preview">
        <template #preview>
          <RainCanvas
            :chars="charPresets[selectedCharSet]"
            :customStyle="{
              width: 'auto',
              height: '400px',
            }"
            :column-density="columnDensity"
            :fall-speed="fallSpeed"
            :font-size="fontSize"
            :min-opacity="minOpacity"
            :max-opacity="maxOpacity"
            :head-color="headColor"
            :tail-color="tailColor"
            :drag-color="dragColor"
            :enable-glow="enableGlow"
            :enable-random-fade="enableRandomFade"
            :use-sequential-chars="useSequentialChars"
            :is-running="isRunning"
            @update:total-chars="totalChars = $event"
            @update:fps="currentFPS = $event"
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
import { ref, computed, onMounted, reactive } from "vue";
import { colorPicker } from "../components/color-picker/index.js";

import {
  inputCom,
  selectCom,
  customBtnCom,
  controlItem,
  codeCopyContent,
  layoutCom,
  appContainer,
} from "../components/form-control/index.vue";

import RainCanvas from "./components/RainCanvas.vue";

import baseConfig from "../static/hooks/extends.js";
defineOptions({
  extends: baseConfig({
    customDialog: import("../components/dialog/index.vue"),
  }),
});
const selectedCharSet = ref("mix");
const columnDensity = ref(25);
const fallSpeed = ref(10);
const fontSize = ref(16);
const minOpacity = ref(0.1);
const maxOpacity = ref(0.6);
const headColor = ref("rgba(0,255,0,1)");
const tailColor = ref("rgba(0,192,0,1)");
const dragColor = ref("rgba(0, 0, 0, 0.2)");
const enableGlow = ref(true);
const enableRandomFade = ref(true);
const useSequentialChars = ref(true);
const isRunning = ref(true);

const totalChars = ref(0);
const currentFPS = ref(0);

const charPresetOptions = [
  { label: "数字", value: "num" },
  { label: "字母", value: "alpha" },
  { label: "混合", value: "mix" },
  { label: "符号", value: "sym" },
  { label: "中文", value: "zh" },
  { label: "日文", value: "ja" },
  { label: "emoji", value: "emoji" },
];

const charPresets = reactive({
  num: "0123456789",
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  mix: "关注永雏塔菲喵，关注永雏塔菲谢谢喵。",
  sym: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  zh: "春夏秋冬东南西北天地日月星辰雨雪风云雷电",
  ja: "アイウエオカキクケコサシスセソタチツテトナニヌネノ",
  emoji:
    "😴😷🤒🤕🤢🤮🤧😵🥴🤯🤠🥳🥸😎🤓🧐😧😨😰😥😢😭😱😖😣😞😓😩😫🥱😤😡😠🤬😈👿💀💩👹👺👻👽👾🤖😺😸😹😻😼😽🙀😿😾",
});

const generateCodeExample = computed(
  () => `<RainCanvas
  :chars="${charPresets[selectedCharSet.value]}"
  :column-density="${columnDensity.value}"
  :fall-speed="${fallSpeed.value}"
  :font-size="${fontSize.value}"
  :min-opacity="${minOpacity.value}"
  :max-opacity="${maxOpacity.value}"
  :head-color="${headColor.value}"
  :tail-color="${tailColor.value}"
  :drag-color="${dragColor.value}"
  :enable-glow="${enableGlow.value}"
  :enable-random-fade="${enableRandomFade.value}"
  :use-sequential-chars="${useSequentialChars.value}"
  :is-running="${isRunning.value}"
  @update:total-chars="totalChars = $event"
  @update:fps="currentFPS = $event"
/>`,
);

const toggleAnimation = () => {
  isRunning.value = !isRunning.value;
};

const resetAnimation = () => {
  isRunning.value = false;
  setTimeout(() => {
    isRunning.value = true;
  }, 100);
};
</script>

<style scoped lang="scss"></style>
