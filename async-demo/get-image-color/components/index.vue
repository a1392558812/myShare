<template>
  <div class="gic-container">
    <div :style="customStyle" class="gic-preview">
      <img ref="imgRef" v-if="src" :src="src" alt="预览图片" @load="onImageLoad" @error="onImageError" />
      <div v-else class="gic-empty">请选择本地图片或输入图片链接</div>
    </div>

    <canvas ref="canvasRef" class="gic-hidden-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  src: { type: String, default: '' },
  customStyle: { type: Object, default: () => ({}) },
  levels: { type: Number, default: 16 },
  minSaturation: { type: Number, default: 0.25 },
  minLightness: { type: Number, default: 0.08 },
  maxLightness: { type: Number, default: 0.92 },
  innerCrop: { type: Number, default: 0.1 },
  excludeCornerBg: { type: Boolean, default: true },
  bgTolerance: { type: Number, default: 40 },
  alphaThreshold: { type: Number, default: 0 },
});

const emits = defineEmits(['colorChange']);

const canvasRef = ref(null);
const imgRef = ref(null);
const palette = ref([]);

watch(() => props.src, (val) => {
  if (!val) {
    palette.value = [];
  }
});

watch(() => [
  props.levels,
  props.minSaturation,
  props.minLightness,
  props.maxLightness,
  props.innerCrop,
  props.excludeCornerBg,
  props.bgTolerance,
  props.alphaThreshold,
], (newVal, oldVal) => {
  if (newVal.some((val, index) => val !== oldVal[index])) {
    extractDominantColors(imgRef.value);
  }
});

const onImageLoad = (e) => {
  console.log('onImageLoad', e.target);
  extractDominantColors(imgRef.value);
};

const onImageError = () => {
  palette.value = [];
};

const extractDominantColors = () => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;


  const imageWidth = imgRef.value.naturalWidth;
  const imageHeight = imgRef.value.naturalHeight;
  console.log('imgRef.value', imgRef.value, { imageWidth, imageHeight })

  canvas.width = imageWidth;
  canvas.height = imageHeight;

  ctx.drawImage(imgRef.value, 0, 0, imageWidth, imageHeight);
  const { data } = ctx.getImageData(0, 0, imageWidth, imageHeight);

  const buckets = new Map();
  const sums = new Map();
  let totalValid = 0;
  const L = Math.max(4, Math.min(64, props.levels || 16));
  const step = 256 / L;

  const margin = Math.floor(Math.min(imageWidth, imageHeight) * Math.max(0, Math.min(0.3, props.innerCrop || 0)));
  const x0 = margin, y0 = margin, x1 = imageWidth - margin, y1 = imageHeight - margin;

  let cornerMean = [0, 0, 0];
  if (props.excludeCornerBg) {
    const sampleSize = Math.max(2, Math.floor(Math.min(imageWidth, imageHeight) * 0.02));
    let sr = 0, sg = 0, sb = 0, cnt = 0;
    const pushBlock = (sx, sy) => {
      for (let yy = sy; yy < Math.min(sy + sampleSize, imageHeight); yy++) {
        for (let xx = sx; xx < Math.min(sx + sampleSize, imageWidth); xx++) {
          const idx = (yy * imageWidth + xx) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          sr += r; sg += g; sb += b; cnt++;
        }
      }
    };
    pushBlock(0, 0);
    pushBlock(Math.max(0, imageWidth - sampleSize), 0);
    pushBlock(0, Math.max(0, imageHeight - sampleSize));
    pushBlock(Math.max(0, imageWidth - sampleSize), Math.max(0, imageHeight - sampleSize));
    if (cnt > 0) cornerMean = [Math.round(sr / cnt), Math.round(sg / cnt), Math.round(sb / cnt)];
  }

  const bgTol = Math.max(0, Math.min(255, props.bgTolerance || 0));

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    const aThresh = Math.max(0, Math.min(255, props.alphaThreshold || 0));
    if (a <= aThresh) continue;

    const p = i / 4;
    const x = p % imageWidth;
    const y = Math.floor(p / imageWidth);

    if (x < x0 || x >= x1 || y < y0 || y >= y1) continue;

    if (props.excludeCornerBg && colorDistance([r, g, b], cornerMean) <= bgTol) continue;

    const { s, l } = rgbToHsl(r, g, b);
    if (s < props.minSaturation) continue;
    if (l > props.maxLightness || l < props.minLightness) continue;

    const rq = Math.min(L - 1, Math.floor(r / step));
    const gq = Math.min(L - 1, Math.floor(g / step));
    const bq = Math.min(L - 1, Math.floor(b / step));
    const key = rq * (L * L) + gq * L + bq;
    buckets.set(key, (buckets.get(key) || 0) + 1);
    const sum = sums.get(key) || [0, 0, 0, 0];
    sum[0] += r; sum[1] += g; sum[2] += b; sum[3] += a;
    sums.set(key, sum);
    totalValid++;
  }

  if (buckets.size === 0) {
    palette.value = [];
    emits('colorChange', palette.value);
    return;
  }

  const top = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
  palette.value = top.map(([key, count]) => {
    const sum = sums.get(key);
    const avg = sum.map(v => Math.round(v / count));
    const hex = rgbaToHex8(avg[0], avg[1], avg[2], avg[3]);
    const rgba = `rgba(${avg[0]}, ${avg[1]}, ${avg[2]}, ${(avg[3] / 255).toFixed(2)})`;
    return { hex, rgba };
  });

  emits('colorChange', palette.value);
}

const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
};

const colorDistance = (c1, c2) => {
  const dr = c1[0] - c2[0];
  const dg = c1[1] - c2[1];
  const db = c1[2] - c2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

const rgbaToHex8 = (r, g, b, a) => {
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}


</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.gic-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gic-preview {
  @include control-shared;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid $medium-gray;
  border-radius: $border-radius;
  min-height: 240px;
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 320px;
    object-fit: contain;
  }

  .gic-empty {
    color: $secondary-color;
    font-size: 14px;
  }
}







span {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  box-shadow: $shadow-light;
}


.gic-hidden-canvas {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 0;
  height: 0;
}
</style>