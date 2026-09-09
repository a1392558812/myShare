<template>
  <div class="card">
    <div class="head">
      <canvas ref="cv" :width="unit.size" :height="unit.size" />
      <div class="meta">
        <span class="name">{{ unit.name }}</span>
        <span class="tag" :class="unit.edible ? 'ok' : 'no'">
          {{ unit.edible ? '可食用' : '危险' }}
        </span>
      </div>
    </div>
    <p class="desc">{{ unit.desc }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import {
  COLORS,
  KRILL_SPRITE,
  FISH_SPRITE,
  HEAL_SPRITE,
  ENERGY_SPRITE,
  PUFFER_SPRITE,
  MONSTER_SPRITE,
  BARNACLE_SPRITE,
} from '../constants.js';

const props = defineProps({
  unit: { type: Object, required: true },
});

const SPRITE_MAP = {
  krill: KRILL_SPRITE,
  fish: FISH_SPRITE,
  heal: HEAL_SPRITE,
  energy: ENERGY_SPRITE,
  puffer: PUFFER_SPRITE,
  monster: MONSTER_SPRITE,
  barnacle: BARNACLE_SPRITE,
};

const cv = ref(null);
let raf = 0;

const drawSprite = (ctx, rows, cx, cy, px, color, alpha = 1, angle = 0) => {
  const w = rows[0].length;
  const h = rows.length;
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy));
  if (angle) ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  const ox = Math.round(-(w * px) / 2);
  const oy = Math.round(-(h * px) / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rows[y][x] === 'X') ctx.fillRect(ox + x * px, oy + y * px, px, px);
    }
  }
  ctx.restore();
};

const tick = (t) => {
  const u = props.unit;
  const c = cv.value;
  if (!c) return;
  const ctx = c.getContext('2d');
  const size = u.size;
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;
  const color = COLORS[u.color];

  // 背景光晕
  const breathe = 0.5 + 0.5 * Math.sin(t / 600);
  ctx.globalAlpha = 0.16 + breathe * 0.08;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, u.ring || 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const rows = SPRITE_MAP[u.sprite];
  const angle = u.sprite === 'puffer' ? Math.sin(t / 300) * 0.3 : 0;
  drawSprite(ctx, rows, cx, cy, u.px, color, 1, angle);
  raf = requestAnimationFrame(tick);
};

onMounted(() => {
  raf = requestAnimationFrame(tick);
});
onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<style scoped lang="scss">
.card {
  padding: 14px;
  background: #071019;
  border: 1px solid #0f2636;
  border-radius: 8px;
}

.head {
  display: flex;
  align-items: center;
  gap: 12px;
}

canvas {
  width: 72px;
  height: 72px;
  flex: 0 0 auto;
  image-rendering: pixelated;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.name {
  font-size: 16px;
  color: #eaf6ff;
  letter-spacing: 1px;
}

.tag {
  display: inline-block;
  width: fit-content;
  padding: 1px 9px;
  border-radius: 3px;
  font-size: 11px;
  letter-spacing: 1px;

  &.ok {
    color: #061008;
    background: #3ee6d8;
  }

  &.no {
    color: #fff;
    background: #ff3b4d;
  }
}

.desc {
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: #7f93a5;
}
</style>
