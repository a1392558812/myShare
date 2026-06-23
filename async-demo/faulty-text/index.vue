<template>
  <div class="faulty-text-page">
    <app-container>
      <layout-com style="width: 400px;" title="故障文字生成器" type="panel"
        :addLayerBtnList="[{ label: '显示源码', callback: () => openDialog({ overlayStyle: { zIndex: 1000 } }) }]">

        <control-item v-for="(itemKey, index) in Object.keys(charConfig)" :key="index" :label="`字符集${itemKey}:`"
          inputType="textarea" v-model="charConfig[itemKey]" :label-value="`${itemKey}`"
          :slotProps="{ rows: 4, placeholder: '请输入文字...' }" />

        <control-item label="输入文字:" inputType="textarea" v-model="inputText" :label-value="'good'"
          :slotProps="{ rows: 4, placeholder: '请输入文字...' }" />

        <control-item label="恢复时长(s):" inputType="range" :modelValue="duration" :label-value="duration + 's'"
          @update:modelValue="duration = Number($event)" :slotProps="{ min: 0.1, max: 10, step: 0.05 }" />

        <control-item label="故障强度:" inputType="range" :modelValue="glitchIntensity" :label-value="glitchIntensity"
          @update:modelValue="glitchIntensity = Number($event)" :slotProps="{ min: 1, max: 5, step: 1 }" />

        <control-item label="字体大小(px):" inputType="range" :modelValue="fontSize" :label-value="fontSize + 'px'"
          @update:modelValue="fontSize = Number($event)" :slotProps="{ min: 1, max: 72, step: 1, }" />

        <control-item label="故障主色:" inputType="color" :modelValue="glitchTextColor" :label-value="glitchTextColor"
          @update:modelValue="glitchTextColor = $event" />

        <control-item label="晕光颜色:" inputType="color" :modelValue="glitchGlowColor"
          :label-value="glitchGlowColor || '(跟随主色)'" @update:modelValue="glitchGlowColor = $event" />

        <control-item label="撕裂上色:" inputType="color" :modelValue="glitchBeforeColor" :label-value="glitchBeforeColor"
          @update:modelValue="glitchBeforeColor = $event" />

        <control-item label="撕裂下色:" inputType="color" :modelValue="glitchAfterColor" :label-value="glitchAfterColor"
          @update:modelValue="glitchAfterColor = $event" />

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div>
            <div class="status-tip" v-if="displayState.isRunning">
              <span class="dot running"></span>
              正在逐字恢复... {{ displayState.recoveredCount }}/{{ displayState.totalCount }}
            </div>
            <div class="status-tip" v-else-if="displayState.isPaused">
              <span class="dot paused"></span>
              已暂停 ({{ displayState.recoveredCount }}/{{ displayState.totalCount }})
            </div>
            <div class="status-tip" v-else-if="displayState.isFinished">
              <span class="dot finished"></span>
              恢复完成 ✓
            </div>
            <div class="status-tip" v-else>
              <span class="dot unstarted"></span>
              未开始动画
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <custom-btn-com v-if="!displayState.isRunning && !displayState.isPaused" @click="handlePlay"
              :disabled="disabled">开始播放</custom-btn-com>

            <custom-btn-com :disabled="disabled" v-if="displayState.isRunning" @click="handlePause">暂停</custom-btn-com>

            <custom-btn-com :disabled="disabled" v-if="displayState.isPaused" @click="handleResume">继续</custom-btn-com>

            <custom-btn-com :disabled="disabled" @click="handleReset">重置</custom-btn-com>
          </div>
        </div>
      </layout-com>

      <layout-com title="效果预览" type="preview">
        <template #preview>
          <faulty-text-display ref="displayRef" :text="inputText" :charConfig="charConfig" :duration="duration"
            :glitch-intensity="glitchIntensity" :font-size="fontSize" :glitch-text-color="glitchTextColor"
            :glitch-glow-color="glitchGlowColor" :glitch-before-color="glitchBeforeColor"
            :glitch-after-color="glitchAfterColor" />
        </template>

        <template #code>
          <codeCopyContent :code="generateCodeExample" title="使用示例" />
        </template>
      </layout-com>
    </app-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  customBtnCom,
  controlItem,
  layoutCom,
  appContainer,
  codeCopyContent,
} from '../components/form-control/index.vue'
import FaultyTextDisplay from './components/FaultyTextDisplay.vue'

import baseConfig from '../static/hooks/extends.js'
import { reactive } from 'vue'
defineOptions({
  extends: baseConfig({
    customDialog: import('../components/dialog/index.vue'),
  }),
})

const charConfig = reactive({
  glitchChars: '█▓▒░▀▄▌▐■□▪▫◆◇○●◎◉①②③④⑤⑥⑦⑧⑨⑩※§¶†‡@#$%&*?!~',
  cjkGlitch: '锟斤拷锟斤拷！？＃＄％＆＊◉▓░▒█',
})

const inputText = ref('')
const duration = ref(3)
const glitchIntensity = ref(3)
const fontSize = ref(32)
const glitchTextColor = ref('#ff3c3c')
const glitchGlowColor = ref('')
const glitchBeforeColor = ref('#00ffff')
const glitchAfterColor = ref('#ff00ff')

const displayRef = ref(null)

const displayState = computed(() => {
  const el = displayRef.value
  return {
    isRunning: el ? el.isRunning : false,
    isFinished: el ? el.isFinished : false,
    isPaused: el ? el.isPaused : false,
    recoveredCount: el ? el.recoveredCount : 0,
    totalCount: el ? el.totalCount : 0
  }
})

const disabled = computed(() => {
  return !inputText.value.trim()
})

const generateCodeExample = computed(() => `<faulty-text-display ref="displayRef" :text="${inputText.value}" :duration="${duration.value}"
  :glitch-intensity="${glitchIntensity.value}" :font-size="${fontSize.value}" :glitch-text-color="${glitchTextColor.value}"
  :glitch-glow-color="${glitchGlowColor.value}" :glitch-before-color="${glitchBeforeColor.value}"
  :glitch-after-color="${glitchAfterColor.value}" />`)

const handlePlay = () => {
  if (!inputText.value.trim()) {
    return alert('请输入文字')
  }
  displayRef.value?.play()
}
const handlePause = () => displayRef.value?.pause()
const handleResume = () => displayRef.value?.resume()
const handleReset = () => displayRef.value?.reset()
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.faulty-text-page {
  width: 100%;
  height: 100%;
}

.status-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: $secondary-color;
  margin-top: 8px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.running {
      background: $primary-color;
      animation: pulse 1s infinite;
    }

    &.paused {
      background: $danger-color;
    }

    &.finished {
      background: $success-color;
    }

    &.unstarted {
      background: $dark-gray;
    }
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}
</style>
