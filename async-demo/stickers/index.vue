<template>
  <div class="sticker-page">
    <app-container>
      <layout-com style="width: 400px;" title="贴纸控制面板" type="panel">
        <control-item label="输入类型:">
          <select-com :options="tabOptions" v-model="activeTab" />
        </control-item>

        <control-item label="输入内容:">
          <input-com type="text" :modelValue="inputText" :placeholder="placeholder"
            @update:modelValue="(val) => (inputText = val)" />
        </control-item>

        <control-item v-if="activeTab === 'text'" label="字体大小(px):">
          <input-com type="number" :modelValue="fontSize" placeholder="默认 120"
            @update:modelValue="(val) => (fontSize = val)" />
        </control-item>

        <control-item v-if="activeTab === 'url'" label="宽度(px):">
          <input-com type="number" :modelValue="imgWidth" placeholder="默认 300"
            @update:modelValue="(val) => (imgWidth = val)" />
        </control-item>
        <control-item v-if="activeTab === 'url'" label="高度(px):">
          <input-com type="number" :modelValue="imgHeight" placeholder="默认 200"
            @update:modelValue="(val) => (imgHeight = val)" />
        </control-item>
        <control-item v-if="activeTab === 'url'" label="缩放模式:">
          <select-com :options="fitModeOptions" v-model="imgFitMode" />
        </control-item>

        <control-item label="描边宽度(px):">
          <input-com type="number" :modelValue="stickerStroke" placeholder="默认 4（0=无描边）"
            @update:modelValue="(val) => (stickerStroke = val)" />
        </control-item>

        <control-item label="展开方向(deg):">
          <input-com type="number" :modelValue="curlAngleDeg" placeholder="0=右 90=下 180=左 270=上（留空默认 0）"
            @update:modelValue="(val) => (curlAngleDeg = val)" />
        </control-item>

        <div>输入内容后点击右侧画板添加贴纸</div>
      </layout-com>

      <layout-com style="min-width: 800px;" title="贴纸画板" type="preview">
        <template #preview>
          <StickerBoard ref="boardRef" @stageClick="handleStageClick" />
        </template>
        <template #code>
          <codeCopyContent :code="codeExample" title="使用示例" />
        </template>
      </layout-com>
    </app-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StickerBoard from './components/StickerBoard.vue'
import { toastFun } from '../components/toast/index.js'
import { textToImage, imageUrlToImage } from './sticker.js'
import {
  inputCom,
  selectCom,
  controlItem,
  codeCopyContent,
  layoutCom,
  appContainer,
} from '../components/form-control/index.vue'

const boardRef = ref(null)

const tabOptions = [
  { label: '📝 文字', value: 'text' },
  { label: '🔗 图片 URL', value: 'url' },
]

const activeTab = ref('text')
const inputText = ref('')
const fontSize = ref('120')
const imgWidth = ref('300')
const imgHeight = ref('200')
const imgFitMode = ref('aspectFit')
const stickerStroke = ref('4')
const curlAngleDeg = ref('0')

const fitModeOptions = [
  { label: '等比缩放 (aspectFit)', value: 'aspectFit' },
  { label: '等比裁剪 (aspectFill)', value: 'aspectFill' },
  { label: '拉伸填充 (scaleToFill)', value: 'scaleToFill' },
  { label: '宽度固定 (widthFix)', value: 'widthFix' },
  { label: '高度固定 (heightFix)', value: 'heightFix' },
]

const placeholder = computed(() => {
  const map = {
    text: '输入任意文字或 Emoji（如 "Hello 🎉"）',
    url: '输入图片链接（如 https://example.com/sticker.png）',
  }
  return map[activeTab.value] || ''
})

const codeExample = computed(() => `<StickerBoard ref="boardRef" @stageClick="handleStageClick" />`)

const handleStageClick = async (pos) => {
  const text = inputText.value.trim()
  if (!text) {
    toastFun.open({ message: '请输入内容后再点击画板添加贴纸' })
    return
  }

  const board = boardRef.value
  if (!board) {
    toastFun.open({ message: '画板尚未加载' })
    return
  }

  let src = ''
  let sw = Number(stickerStroke.value) || 0
  let stickerW, stickerH
  try {
    if (activeTab.value === 'text') {
      const result = textToImage(text, { fontSize: Number(fontSize.value) || 120, color: '#222', strokeWidth: sw })
      src = result.dataURL
      stickerW = result.width
      stickerH = result.height
    } else if (activeTab.value === 'url') {
      if (!text.match(/^https?:\/\/.+/)) {
        toastFun.open({ message: '请输入有效的图片 URL（以 http:// 或 https:// 开头）' })
        return
      }
      const result = await imageUrlToImage(text, {
        width: Number(imgWidth.value) || 300,
        height: Number(imgHeight.value) || 200,
        fitMode: imgFitMode.value || 'aspectFit',
        strokeWidth: sw,
      })
      src = result.dataURL
      stickerW = result.width
      stickerH = result.height
    }

    board.addSticker(src, {
      x: pos.x,
      y: pos.y,
      width: stickerW,
      height: stickerH,
      curlAngle: Number(curlAngleDeg.value) || 0,
    })
  } catch (err) {
    toastFun.open({ message: '添加贴纸失败：' + err.message })
  }
}
</script>
