<template>
  <div class="color-converter">
    <layout-com
      style="width: a"
      title="颜色格式转换器"
      type="panel"
      :addLayerBtnList="[
        {
          label: '显示源码',
          callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }),
        },
      ]"
    >
      <control-item label="输入颜色:">
        <input-com
          v-model="inputColor"
          placeholder="输入 HEX、RGB/RGBA、HSL/HSLA、HSV/HSVA 格式颜色"
        />
        <input-com
          style="width: auto"
          v-model="inputColor"
          type="color"
          placeholder="选择颜色"
        />
        <control-item
          label="透明度 (Alpha):"
          inputType="range"
          v-model.number="parsedColor.a"
          :slotProps="{ min: 0, max: 1, step: 0.01 }"
        />
      </control-item>

      <control-item label="颜色预览:" :labelValue="parsedColor.rgba">
        <div
          :style="{
            backgroundColor: parsedColor.rgba,
            height: '60px',
            borderRadius: '8px',
          }"
        ></div>
      </control-item>

      <div class="output-section">
        <h3>转换结果</h3>

        <div
          style="
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-gap: 20px;
          "
        >
          <control-item
            v-for="(key, index) in Object.keys(outputFormats)"
            :key="index"
            :label="`${key}格式:`"
            labelValue=" "
          >
            <div class="output-item">
              <div style="color: #4f46e5; flex-shrink: 0">
                {{ outputFormats[key] }}
              </div>
              <copyBtn :value="outputFormats[key]" />
            </div>
          </control-item>
        </div>
      </div>
    </layout-com>
  </div>
</template>

<script setup lang="jsx">
import { ref, watch, reactive } from "vue";

import {
  useCopyCode,
  controlItem,
  layoutCom,
  customBtnCom,
  inputCom,
} from "../components/form-control/index.vue";
import { toastFun } from "../components/toast/index.js";
import baseConfig from "../static/hooks/extends.js";

defineOptions({
  extends: baseConfig({
    customDialog: import("../components/dialog/index.vue"),
  }),
});

const inputColor = ref("rgba(117, 148, 169, 0.25)");

const parsedColor = reactive({
  r: 0,
  g: 0,
  b: 0,
  a: 0,
  rgba: "",
});

const outputFormats = reactive({
  hex8: "",
  hex6: "",
  rgb: "",
  rgba: "",
  hsl: "",
  hsla: "",
  hsv: "",
  hsva: "",
});

const copyBtn = (props, context) => {
  const { copied, onCopyClick } = useCopyCode();
  return (
    <customBtnCom
      onClick={() => {
        onCopyClick({
          code: props.value,
          startCallback: () => {
            toastFun.open({ message: `复制成功：${props.value}` });
          },
        });
      }}
    >
      {copied.value ? "已复制" : "复制"}
    </customBtnCom>
  );
};

const parseColor = (colorStr) => {
  let r = 0,
    g = 0,
    b = 0,
    a = 1;

  colorStr = colorStr.trim();

  if (colorStr.startsWith("#")) {
    const hex = colorStr.slice(1);

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      a = parseInt(hex[3] + hex[3], 16) / 255;
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      a = parseInt(hex.slice(6, 8), 16) / 255;
    }
  } else if (colorStr.startsWith("rgb")) {
    const match = colorStr.match(
      /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/,
    );
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
      a = match[4] ? parseFloat(match[4]) : 1;
    }
  } else if (colorStr.startsWith("hsl")) {
    const match = colorStr.match(
      /hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)/,
    );
    if (match) {
      const h = parseInt(match[1]);
      const s = parseInt(match[2]) / 100;
      const l = parseInt(match[3]) / 100;
      a = match[4] ? parseFloat(match[4]) : 1;

      const rgb = hslToRgb(h, s, l);
      r = rgb.r;
      g = rgb.g;
      b = rgb.b;
    }
  } else if (colorStr.startsWith("hsv")) {
    const match = colorStr.match(
      /hsva?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)/,
    );
    if (match) {
      const h = parseInt(match[1]);
      const s = parseInt(match[2]);
      const v = parseInt(match[3]);
      a = match[4] ? parseFloat(match[4]) : 1;

      const rgb = hsvToRgb(h, s, v);
      r = rgb.r;
      g = rgb.g;
      b = rgb.b;
    }
  }

  return { r, g, b, a };
};

const hslToRgb = (h, s, l) => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h / 360 + 1 / 3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, h / 360 - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const rgbToHsv = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  let s = max === 0 ? 0 : d / max;
  let v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
};

const hsvToRgb = (h, s, v) => {
  h /= 360;
  s /= 100;
  v /= 100;

  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

const toHex = (n) => {
  const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

const convertToAllFormats = () => {
  const { r, g, b, a } = parsedColor;

  const hex8 = "#" + toHex(r) + toHex(g) + toHex(b) + toHex(a * 255);
  const hex6 = "#" + toHex(r) + toHex(g) + toHex(b);
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const rgba = `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;

  const hsl = rgbToHsl(r, g, b);
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  const hslaStr = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a.toFixed(2)})`;

  const hsv = rgbToHsv(r, g, b);
  const hsvStr = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
  const hsvaStr = `hsva(${hsv.h}, ${hsv.s}%, ${hsv.v}%, ${a.toFixed(2)})`;

  outputFormats.hex8 = hex8;
  outputFormats.hex6 = hex6;
  outputFormats.rgb = rgb;
  outputFormats.rgba = rgba;
  outputFormats.hsl = hslStr;
  outputFormats.hsla = hslaStr;
  outputFormats.hsv = hsvStr;
  outputFormats.hsva = hsvaStr;

  parsedColor.rgba = rgba;
};

watch(
  inputColor,
  () => {
    const parsed = parseColor(inputColor.value);
    parsedColor.r = parsed.r;
    parsedColor.g = parsed.g;
    parsedColor.b = parsed.b;
    parsedColor.a = parsed.a;
    convertToAllFormats();
  },
  { immediate: true },
);

watch(
  () => parsedColor.a,
  () => {
    convertToAllFormats();
  },
);
</script>

<style scoped lang="scss">
.color-converter {
  height: 100%;
  padding: 20px;
  overflow: auto;
}

.output-section {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .output-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 10px 20px;
    border-radius: 8px;
    color: #4f46e5;
    border: 1px solid #e5e7eb;
  }
}
</style>
