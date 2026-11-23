<template>
  <div class="app">
    <div class="panel" style="flex-direction: row;">
      <button @click="() => emit('loadCode')">查看源码</button>
      <button @click="() => emit('loadDocs')">查看文档</button>
    </div>
    <div class="panel">
      <div>raw位移是唯一真相，压缩只发生在渲染；弹簧跑解析解，任何时候都能被手指接管。三个开关直接控制：界内滚动 / 顶部越界 / 底部越界。</div>

      <label class="row">
        <span>阻尼常数 c</span>
        <input v-model.number="constant" type="range" min="0.3" max="0.9" step="0.01" />
        <span>{{ constant.toFixed(2) }}</span>
      </label>
      <label class="row">
        <span>响应周期 response</span>
        <input v-model.number="response" type="range" min="0.2" max="0.8" step="0.01" />
        <span>{{ response.toFixed(2) }}s</span>
      </label>
      <label class="row">
        <span>阻尼比 ζ</span>
        <input v-model.number="dampingRatio" type="range" min="0.3" max="1.2" step="0.01" />
        <span>{{ dampingRatio.toFixed(2) }}</span>
      </label>

      <div class="switches">
        <label class="switch">
          <input v-model="scrollable" type="checkbox" />
          <span>界内滚动</span>
        </label>
        <label class="switch">
          <input v-model="overScrollTop" type="checkbox" />
          <span>顶部越界阻尼</span>
        </label>
        <label class="switch">
          <input v-model="overScrollBottom" type="checkbox" />
          <span>底部越界阻尼</span>
        </label>
      </div>

      <div class="switches">
        <button type="button" @click="backToTop">回到顶部</button>
        <button type="button" @click="toBottom">跳到末尾</button>
        <button v-for="preset in presets" :key="preset.label" type="button" @click="applyPreset(preset)">
          {{ preset.label }}
        </button>
      </div>
    </div>

    <RubberBandList ref="listRef" :items="items" :constant="constant" :response="response" :damping-ratio="dampingRatio"
      :scrollable="scrollable" :over-scroll-top="overScrollTop" :over-scroll-bottom="overScrollBottom" />

    <p v-if="toast" class="toast">{{ toast }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import RubberBandList from "./components/RubberBandList.vue";
import type { ListItem } from "./components/types.ts";

const emit = defineEmits(['loadCode', 'loadDocs']);

const items: ListItem[] = Array.from({ length: 60 }, (_, index) => ({
  id: index + 1,
  title: `第 ${index + 1} 条卡片`,
  summary: "上下拖动到边界后继续拖，内容越走越沉；松手按松手速度回弹。",
}));

/** 参数面板直接改 props，弹簧每次 to() 都会重读，不用重建实例 */
const constant = ref(0.55);
const response = ref(0.42);
const dampingRatio = ref(0.72);

/** 三个行为开关 */
const scrollable = ref(true);
const overScrollTop = ref(true);
const overScrollBottom = ref(true);

const listRef = ref<InstanceType<typeof RubberBandList> | null>(null);
const toast = ref("");
let toastTimer = 0;

const showToast = (text: string): void => {
  toast.value = text;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.value = "";
  }, 1600);
};

/**
 * to() 返回 promise 不是为了好看，是为了让「动画结束」成为一个可组合的事件源。
 * 注意语义：中断不是 reject —— stop() 会把 promise resolve 成当前落点，
 * 因为「停在 100px」对调用方是有效信息，不该变成异常。
 */
const backToTop = (): void => {
  toast.value = "";
  void listRef.value?.scrollTo(0, 0).then((final) => {
    showToast(
      Math.abs(final) < 1
        ? `已停在 ${final.toFixed(0)}px`
        : `被打断在 ${final.toFixed(0)}px`,
    );
  });
};

const toBottom = (): void => {
  toast.value = "";
  const max = listRef.value?.maxScroll ?? 0;
  void listRef.value?.scrollTo(max, 0).then((final) => {
    showToast(
      Math.abs(max - final) < 1
        ? `已停在 ${final.toFixed(0)}px`
        : `被打断在 ${final.toFixed(0)}px`,
    );
  });
};

type Preset = {
  label: string;
  constant: number;
  response: number;
  dampingRatio: number;
};

const presets: Preset[] = [
  { label: "长列表回弹", constant: 0.55, response: 0.42, dampingRatio: 0.72 },
  { label: "克制", constant: 0.45, response: 0.5, dampingRatio: 0.8 },
  { label: "弹一点", constant: 0.62, response: 0.35, dampingRatio: 0.6 },
];

const applyPreset = (preset: Preset): void => {
  constant.value = preset.constant;
  response.value = preset.response;
  dampingRatio.value = preset.dampingRatio;
};
</script>

<style scoped>
.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 14px;

  .panel {
    margin-bottom: 14px;
    padding: 14px;
    border: 1px solid #000;
    display: flex;
    flex-direction: column;
    gap: 14px;

    .row {
      display: grid;
      grid-template-columns: 120px 1fr 62px;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 12px;
    }

    .switches {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 14px;
      border: 1px solid #000;

      .switch {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #000;
      }
    }
  }
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  margin: 0;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.86);
  color: #f9fafb;
  font-size: 12px;
}
</style>