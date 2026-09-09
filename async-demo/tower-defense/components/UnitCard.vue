<template>
  <div class="card" :class="['card-' + (unit.role || 'enemy')]">
    <div class="head">
      <canvas ref="cv" :width="cardSize" :height="cardSize" />
      <div class="meta">
        <span class="name">{{ unit.name }}</span>
        <span class="tag" :class="roleClass">
          {{ roleLabel }}
        </span>
      </div>
    </div>
    <p class="desc">{{ unit.desc }}</p>
    <div class="stats" v-if="unit.stats && unit.stats.length">
      <span v-for="s in unit.stats" :key="s.label" class="stat">
        <b>{{ s.label }}</b>
        <span class="stat-val">{{ s.value }}</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  unit: { type: Object, required: true },
  cardSize: { type: Number, default: 76 },
});

const cv = ref(null);
let raf = 0;
let time = 0;

const ROLE_META = {
  enemy:    { label: '敌人',   cls: 'tag-enemy' },
  boss:     { label: 'Boss',  cls: 'tag-boss' },
  tower:    { label: '塔',     cls: 'tag-tower' },
  hero:     { label: '英雄',   cls: 'tag-hero' },
  skill:    { label: '技能',   cls: 'tag-skill' },
};

const roleLabel = computed(() => ROLE_META[props.unit.role]?.label || '单位');
const roleClass = computed(() => ROLE_META[props.unit.role]?.cls || 'tag-enemy');

const drawSprite = () => {
  const ctx = cv.value?.getContext('2d');
  const canvasEl = cv.value;
  if (!ctx || !canvasEl) return;
  const unit = props.unit;
  const cx = canvasEl.width / 2;
  const cy = canvasEl.height / 2;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  // 呼吸光晕
  const breathe = 0.5 + 0.5 * Math.sin(time / 600);
  ctx.globalAlpha = 0.18 + breathe * 0.12;
  ctx.fillStyle = unit.color || '#3ee6d8';
  ctx.beginPath();
  ctx.arc(cx, cy, unit.ring || (canvasEl.width * 0.42), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // 根据 unit 携带的 render() 回调渲染 sprite；否则用一个简单圆
  if (typeof unit.draw === 'function') {
    ctx.save();
    unit.draw(ctx, { x: cx, y: cy, size: canvasEl.width }, time, unit);
    ctx.restore();
  } else {
    ctx.fillStyle = unit.color || '#94a3b8';
    ctx.beginPath();
    ctx.arc(cx, cy, canvasEl.width * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
};

const tick = () => {
  time++;
  drawSprite();
  raf = requestAnimationFrame(tick);
};

onMounted(() => {
  raf = requestAnimationFrame(tick);
});
onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<style scoped lang="scss">
.card {
  padding: 12px;
  background: #071019;
  border: 1px solid #0f2636;
  border-radius: 8px;
  color: #eaf6ff;
  font-family: 'Menlo', 'Consolas', 'Roboto Mono', monospace;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: #1b7f8a;
    box-shadow: 0 0 12px rgba(62, 230, 216, 0.15);
  }
}

.card-boss { border-color: #4b1d2e; &:hover { border-color: #b06cff; box-shadow: 0 0 12px rgba(176,108,255,0.18); } }
.card-tower { border-color: #1b3a2c; }
.card-hero { border-color: #10362c; }

.head {
  display: flex;
  align-items: center;
  gap: 12px;
}

canvas {
  width: 76px;
  height: 76px;
  flex: 0 0 auto;
  image-rendering: pixelated;
  border-radius: 6px;
  background: #02060d;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 14px;
  color: #eaf6ff;
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag {
  display: inline-block;
  width: fit-content;
  padding: 1px 9px;
  border-radius: 3px;
  font-size: 10px;
  letter-spacing: 1px;
}

.tag-enemy  { color: #fff;    background: #2a4365; border: 1px solid #3b82f6; }
.tag-boss   { color: #fff;    background: #5b1d3a; border: 1px solid #b06cff; }
.tag-tower  { color: #061008; background: #3ee6d8; }
.tag-hero   { color: #061008; background: #34d399; }
.tag-skill  { color: #020409; background: #fbbf24; }

.desc {
  margin: 8px 0 0;
  font-size: 11px;
  line-height: 1.7;
  color: #7f93a5;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  border-top: 1px solid #0f2636;
  padding-top: 6px;
}

.stat {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  font-size: 10px;
  color: #7f93a5;

  b {
    color: #3ee6d8;
    font-weight: 600;
  }
}

.stat-val {
  color: #eaf6ff;
}
</style>
