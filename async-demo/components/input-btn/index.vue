<template>
  <div class="input-color-wrap" v-if="['color'].includes(type)">
    <div class="input-color" :style="colorWrapStyle">
      <div :style="[inputStyle]" class="input-color-hex">
        <div class="input-color-hex-content">
          <div :style="{ width: '100%', height: '100%', backgroundColor: inputValue }"></div>
        </div>
        <input :type="type" v-model="colorValue" :style="[{ opacity: 0 }, inputStyle]" class="input-color-hex"
          @input="onColorInput">
      </div>
      <input type="number" :min="0" :max="1" :step="0.01" v-model.number="colorAlpha" :style="[inputAlphaStyle]"
        class="input-color-alpha" @input="onAlphaInput">
    </div>

    <button :style="btnStyle" @click="handleBtnClick" class="btn-item">{{ btnText }}</button>
  </div>

  <div v-else class="input-btn-wrap">
    <input :min="min" :max="max" :step="step" :type="type" :accept="accept" v-model="inputValue" :style="inputStyle"
      class="input-item" @input="onInput" :title="inputValue" :placeholder="placeholder">
    <div v-if="['range'].includes(type)" :style="inputValueStyle" class="input-value">{{ inputValue }}</div>
    <button :style="btnStyle" @click="handleBtnClick" class="btn-item">{{ btnText }}</button>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  btnText: {
    type: String,
    default: '确定',
  },
  min: {
    type: Number,
    default: undefined,
  },
  max: {
    type: Number,
    default: undefined,
  },
  step: {
    type: Number,
    default: undefined,
  },
  accept: {
    type: String,
    default: undefined,
  },
  placeholder: {
    type: String,
    default: '',
  },
  inputStyle: {
    type: Object,
    default: () => ({}),
  },
  inputAlphaStyle: {
    type: Object,
    default: () => ({}),
  },
  btnStyle: {
    type: Object,
    default: () => ({}),
  },
  inputValueStyle: {
    type: Object,
    default: () => ({}),
  },
  colorWrapStyle: {
    type: Object,
    default: () => ({}),
  },
})

const inputValue = ref(null)

const colorValue = ref(null)
const colorAlpha = ref(1)

const onInput = (e) => {
  if (['range', 'number'].includes(props.type)) {
    let val = Number(inputValue.value)
    if (isNaN(val)) return
    if (val > props.max) inputValue.value = props.max
    if (val < props.min) inputValue.value = props.min
  }
}

const onColorInput = () => {
  const colorRes = hexToRgba(colorValue.value, colorAlpha.value)
  inputValue.value = colorRes.rgba
  colorAlpha.value = colorRes.alpha
}

const onAlphaInput = () => {
  let val = Number(colorAlpha.value)
  if (isNaN(val)) return
  if (val > 1) colorAlpha.value = 1
  if (val < 0) colorAlpha.value = 0
  onColorInput()
}

const handleBtnClick = () => {
  emit('update:modelValue', inputValue.value)
}

const hexToRgba = (hex, alpha = 1) => {
  let str = hex.replace('#', '');
  let r, g, b, a;

  if (str.length === 3) {
    r = parseInt(str[0] + str[0], 16);
    g = parseInt(str[1] + str[1], 16);
    b = parseInt(str[2] + str[2], 16);
    a = alpha;
  }

  else if (str.length === 6) {
    r = parseInt(str.slice(0, 2), 16);
    g = parseInt(str.slice(2, 4), 16);
    b = parseInt(str.slice(4, 6), 16);
    a = alpha;
  }

  else if (str.length === 8) {
    r = parseInt(str.slice(0, 2), 16);
    g = parseInt(str.slice(2, 4), 16);
    b = parseInt(str.slice(4, 6), 16);
    // 如果外部传了1的alpha，优先用外部值
    // a = alpha === 1 ? alpha : parseInt(str.slice(6, 8), 16) / 255;
    a = parseInt(str.slice(6, 8), 16) / 255 || alpha;
  } else {
    throw new Error('非法hex格式，仅支持 #rgb / #rrggbb / #rrggbbaa');
  }

  // 透明度边界 0~1
  a = Math.max(0, Math.min(1, a));
  return {
    rgba: `rgba(${r},${g},${b},${a})`,
    alpha: a,
  };
}

const rgbaToHex = (rgba) => {
  let r, g, b, a = 1;

  const nums = rgba.match(/\d+(\.\d+)?/g).map(Number);
  [r, g, b, a = 1] = nums;

  // 归一化 0-255
  const toHex = (val) => {
    const num = Math.max(0, Math.min(255, Math.round(val)));
    return num.toString(16).padStart(2, '0');
  };

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  const alpha = Math.max(0, Math.min(1, a));

  return { hex, alpha };
}

watch(() => props.modelValue, (val) => {
  inputValue.value = val
  if (props.type === 'color') {
    if (props.modelValue.startsWith('rgb')) {
      const colorRes = rgbaToHex(val)
      colorValue.value = colorRes.hex
      colorAlpha.value = colorRes.alpha
      return
    }
    if (props.modelValue.startsWith('#')) {
      const colorRes = hexToRgba(val)
      colorValue.value = val
      colorAlpha.value = colorRes.alpha
      inputValue.value = colorRes.rgba
      return
    }
    throw new Error('非法hex格式，仅支持 #rgb / #rrggbb / #rrggbbaa');
  }
}, {
  immediate: true,
})
</script>

<style lang="scss" scoped>
.input-color-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;

  .input-color {
    display: flex;
    align-items: stretch;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid #000;

    .input-color-hex {
      width: auto;
      aspect-ratio: 1 / 1;
      flex-shrink: 0;
      position: relative;

      .input-color-hex-content {
        position: absolute;
        left: 3px;
        right: 3px;
        top: 3px;
        bottom: 3px;
        pointer-events: none;
        border-radius: 4px;
        overflow: hidden;
        background-image: linear-gradient(45deg, rgba(186, 186, 186, 0.50) 25%, transparent 25%),
          linear-gradient(135deg, rgba(186, 186, 186, 0.50) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(186, 186, 186, 0.50) 75%),
          linear-gradient(135deg, transparent 75%, rgba(186, 186, 186, 0.50) 75%);
        background-size: 10px 10px;
        background-position: 0px 0px, 5px 0px, 5px -5px, 0px 5px;
        background-repeat: repeat;
      }
    }

    .input-color-alpha {
      width: 2em;
      -moz-appearance: textfield;

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    input {
      border-radius: 0;
      flex-shrink: 0;
      outline: none;
      border: none;
    }
  }
}

.input-btn-wrap {
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: stretch;
  flex-shrink: 0;
  position: relative;

  .input-item {
    text-indent: 0.5em;
    flex-shrink: 0;
    border-radius: 0;
  }

  .input-value {
    position: absolute;
    left: 0.5em;
    top: 0px;
    transform: translateY(-50%);
    line-height: 1;
    font-size: 12px;
  }

  .btn-item {
    flex-shrink: 0;
    cursor: pointer;
  }
}
</style>