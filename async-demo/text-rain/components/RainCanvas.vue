<template>
  <div ref="containerRef" :style="customStyle" class="rain-canvas-container">
    >
    <canvas
      ref="rainCanvas"
      :style="customCanvasStyle"
      :width="width"
      :height="height"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  chars: {
    type: String,
    default: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  },
  columnDensity: {
    type: Number,
    default: 30,
  },
  fallSpeed: {
    type: Number,
    default: 8,
  },
  fontSize: {
    type: Number,
    default: 16,
  },
  minOpacity: {
    type: Number,
    default: 0.1,
  },
  maxOpacity: {
    type: Number,
    default: 1,
  },
  headColor: {
    type: String,
    default: "rgba(0,255,0,1)",
  },
  tailColor: {
    type: String,
    default: "rgba(100,0,0,1)",
  },
  dragColor: {
    type: String,
    default: "rgba(0, 0, 0, 0.05)",
  },
  enableGlow: {
    type: Boolean,
    default: true,
  },
  enableRandomFade: {
    type: Boolean,
    default: true,
  },
  isRunning: {
    type: Boolean,
    default: true,
  },
  useSequentialChars: {
    type: Boolean,
    default: false,
  },
  customStyle: {
    type: Object,
    default: () => ({}),
  },
  customCanvasStyle: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits([
  "update:activeColumns",
  "update:totalChars",
  "update:fps",
]);

const containerRef = ref(null);
const rainCanvas = ref(null);
const width = ref(800);
const height = ref(600);

let animationId = null;
let frameCount = 0;
let fpsUpdateTime = 0;
let columns = [];
let resizeObserver = null;

const getRgb = (hex) => {
  const result = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(hex);
  return result
    ? {
        r: parseInt(result[1]),
        g: parseInt(result[2]),
        b: parseInt(result[3]),
      }
    : { r: 0, g: 0, b: 0 };
};

class RainColumn {
  constructor(x, chars) {
    this.x = x;
    this.chars = chars;
    this.charArray = [];
    this.y = Math.random() * height.value;
    this.speed = (props.fallSpeed * (0.5 + Math.random() * 0.5)) / 10;
    this.length = Math.floor(10 + Math.random() * 20);
    this.charArrayProper = Array.from(chars);
    this.charIndex = Math.floor(Math.random() * this.charArrayProper.length);
  }

  update() {
    this.y += this.speed;
    if (this.y - this.length * props.fontSize > height.value) {
      this.y = 0;
      this.charArray = [];
      this.charArrayProper = Array.from(this.chars);
      this.charIndex = Math.floor(Math.random() * this.charArrayProper.length);
    }

    while (this.charArray.length < this.length) {
      this.charArray.push(this.generateChar());
    }
  }

  generateChar() {
    if (props.enableRandomFade && Math.random() < 0.02) {
      return " ";
    }

    if (props.useSequentialChars) {
      const char = this.charArrayProper[this.charIndex];
      this.charIndex = (this.charIndex + 1) % this.charArrayProper.length;
      return char;
    }

    return this.charArrayProper[
      Math.floor(Math.random() * this.charArrayProper.length)
    ];
  }

  draw(ctx) {
    const len = this.charArray.length;
    for (let i = 0; i < len; i++) {
      const charY = this.y - i * props.fontSize;
      if (charY < 0 || charY > height.value) continue;

      const opacity =
        props.minOpacity +
        (props.maxOpacity - props.minOpacity) * (1 - i / len);

      if (props.enableGlow) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = props.headColor;
      } else {
        ctx.shadowBlur = 0;
        ctx.shadowColor = "rgba(0, 0, 0, 0)";
      }

      if (i === 0) {
        ctx.fillStyle = props.headColor;
        if (props.enableGlow) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = props.headColor;
        } else {
          ctx.shadowBlur = 0;
          ctx.shadowColor = "rgba(0, 0, 0, 0)";
        }
      } else {
        const rgb = getRgb(props.tailColor);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        ctx.shadowBlur = 0;
        ctx.shadowColor = "rgba(0, 0, 0, 0)";
      }

      ctx.fillText(this.charArray[i], this.x, charY);
    }
  }
}

const updateCanvasSize = () => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();
    width.value = rect.width;
    height.value = rect.height;

    if (rainCanvas.value) {
      rainCanvas.value.width = width.value;
      rainCanvas.value.height = height.value;
    }

    stopAnimation();
    initColumns();
    startAnimation();
  }
};

const initColumns = () => {
  columns = [];
  const spacing = width.value / props.columnDensity;
  for (let i = 0; i < props.columnDensity; i++) {
    const col = new RainColumn(i * spacing + spacing / 2, props.chars);
    columns.push(col);
  }
};

const draw = (timestamp) => {
  const ctx = rainCanvas.value.getContext("2d");

  ctx.shadowBlur = 0;
  ctx.shadowColor = "rgba(0, 0, 0, 0)";

  ctx.fillStyle = props.dragColor;
  ctx.fillRect(0, 0, width.value, height.value);

  ctx.font = `${props.fontSize}px monospace`;
  ctx.textAlign = "center";

  let totalCharCount = 0;
  columns.forEach((col) => {
    col.update();
    col.draw(ctx);
    totalCharCount += col.charArray.filter((c) => c !== " ").length;
  });

  emit("update:totalChars", totalCharCount);

  frameCount++;
  if (timestamp - fpsUpdateTime >= 1000) {
    emit("update:fps", frameCount);
    frameCount = 0;
    fpsUpdateTime = timestamp;
  }

  if (props.isRunning) {
    animationId = requestAnimationFrame(draw);
  }
};

const startAnimation = () => {
  if (!animationId && props.isRunning) {
    fpsUpdateTime = performance.now();
    animationId = requestAnimationFrame(draw);
  }
};

const stopAnimation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};

watch(
  () => [
    props.chars,
    props.columnDensity,
    props.fallSpeed,
    props.fontSize,
    props.minOpacity,
    props.maxOpacity,
    props.headColor,
    props.tailColor,
    props.dragColor,
    props.enableGlow,
    props.enableRandomFade,
    props.useSequentialChars,
  ],
  () => {
    stopAnimation();
    initColumns();
    startAnimation();
  },
);

watch(
  () => props.isRunning,
  (running) => {
    if (running) {
      startAnimation();
    } else {
      stopAnimation();
    }
  },
);

onMounted(() => {
  updateCanvasSize();
  resizeObserver = new ResizeObserver(() => {
    updateCanvasSize();
  });

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }
});

onUnmounted(() => {
  stopAnimation();
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped lang="scss">
.rain-canvas-container {
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
