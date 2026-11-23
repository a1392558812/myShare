<template>
  <div ref="viewport" class="viewport" :style="{
    height: `${props.height}px`,
    cursor: dragging ? 'grabbing' : 'grab',
  }" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp"
    @pointercancel="onPointerCancel">
    <div ref="content" class="content" :style="{ transform: `translate3d(0, ${translateY}px, 0)` }">
      <div v-for="item in props.items" :key="item.id" class="card">
        <div>{{ item.id }}</div>
        <div>{{ item.title }}</div>
        <div>{{ item.summary }}</div>
      </div>
    </div>

    <div class="hud">
      越界 顶 {{ overshootTop.toFixed(0) }} / 底 {{ overshootBottom.toFixed(0)
      }} px · 被压缩 {{ compressed.toFixed(0) }} px · raw {{ position.toFixed(0)
      }} px · v {{ velocity.toFixed(0) }} px/s
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRubberBandScroll } from "./useRubberBandScroll.ts";
import type { ListItem } from "./types.ts";

const props = withDefaults(
  defineProps<{
    items: ListItem[];
    constant?: number;
    response?: number;
    dampingRatio?: number;
    height?: number;
    /** 界内 1:1 滚动开关，默认 true */
    scrollable?: boolean;
    /** 顶部越界阻尼开关，默认 true */
    overScrollTop?: boolean;
    /** 底部越界阻尼开关，默认 true */
    overScrollBottom?: boolean;
  }>(),
  {
    constant: 0.55,
    response: 0.42,
    dampingRatio: 0.72,
    height: 420,
    scrollable: true,
    overScrollTop: true,
    overScrollBottom: true,
  },
);

const viewport = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);

const {
  position,
  velocity,
  maxScroll,
  display,
  translateY,
  dragging,
  settling,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  scrollTo,
  measure,
} = useRubberBandScroll(viewport, content, () => ({
  constant: props.constant,
  spring: { response: props.response, dampingRatio: props.dampingRatio },
  scrollable: props.scrollable,
  overScrollTop: props.overScrollTop,
  overScrollBottom: props.overScrollBottom,
}));

defineExpose({ scrollTo, measure, position, maxScroll });

const overshootTop = computed(() => Math.max(-position.value, 0));
const overshootBottom = computed(() =>
  Math.max(position.value - maxScroll.value, 0),
);
const compressed = computed(() => Math.abs(display.value - position.value));
</script>

<style scoped>
.viewport {
  position: relative;
  overflow: hidden;
  /* 必须禁掉浏览器原生滚动，否则 pointermove 会被 cancel */
  touch-action: none;
  user-select: none;
  cursor: grab;
  border-radius: 14px;
  background: #f6f7f9;
  border: 1px solid #e6e8eb;
}

.content {
  will-change: transform;

  .card {
    display: flex;
    gap: 12px;
    padding: 12px 14px;
    border-bottom: 1px solid #eef0f2;
    background: #fff;
  }
}

.hud {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(17, 24, 39, 0.72);
  color: #e5e7eb;
  font-size: 11px;
  pointer-events: none;
}
</style>