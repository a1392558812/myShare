<template>
  <div class="canvas-container" :style="customStyle">
    <canvas
      ref="canvasRef"
      :style="customCanvasStyle"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousemove="handleMouseMove"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";

const props = defineProps({
  particleCount: { type: Number, default: 80 },
  maxDistance: { type: Number, default: 150 },
  particleSize: { type: Number, default: 3 },
  speed: { type: Number, default: 1 },
  color: { type: String, default: "#4f46e5" },
  backgroundColor: { type: String, default: "#f8fafc" },
  showConnections: { type: Boolean, default: true },
  interactive: { type: Boolean, default: true },
  interactionForce: { type: Number, default: 1 },
  connectionColor: { type: String, default: "#4f46e5" },
  connectionWidth: { type: Number, default: 1 },
  customStyle: { type: Object, default: () => ({}) },
  customCanvasStyle: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["particleUpdate"]);

const canvasRef = ref(null);
const containerRef = ref(null);
const particles = ref([]);
const animationId = ref(null);
const resizeObserver = ref(null);
const mouse = ref({ x: null, y: null, isDown: false });
const ctx = ref(null);
const canvasWidth = ref(800);
const canvasHeight = ref(600);

const updateCanvasSize = () => {
  if (!canvasRef.value) return;

  const container = canvasRef.value.parentElement;
  if (container) {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvasWidth.value = rect.width * dpr;
    canvasHeight.value = rect.height * dpr;

    canvasRef.value.style.width = `${rect.width}px`;
    canvasRef.value.style.height = `${rect.height}px`;

    if (ctx.value) {
      ctx.value.scale(dpr, dpr);
    }

    init();
  }
};

class Particle {
  constructor(x, y) {
    this.x =
      x || (Math.random() * canvasWidth.value) / (window.devicePixelRatio || 1);
    this.y =
      y ||
      (Math.random() * canvasHeight.value) / (window.devicePixelRatio || 1);
    this.size = props.particleSize + Math.random() * 2;
    this.speedX = (Math.random() - 0.5) * props.speed;
    this.speedY = (Math.random() - 0.5) * props.speed;
    this.color = props.color;
  }

  update() {
    const dpr = window.devicePixelRatio || 1;
    const effectiveWidth = canvasWidth.value / dpr;
    const effectiveHeight = canvasHeight.value / dpr;

    if (mouse.value.isDown && props.interactive) {
      const dx = mouse.value.x - this.x;
      const dy = mouse.value.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 200;
      if (distance < maxDistance) {
        const force =
          ((maxDistance - distance) / maxDistance) * props.interactionForce;
        this.x -= dx * force * 0.02;
        this.y -= dy * force * 0.02;
      }
    }

    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x > effectiveWidth) this.speedX *= -1;
    if (this.y < 0 || this.y > effectiveHeight) this.speedY *= -1;
  }

  draw() {
    ctx.value.beginPath();
    ctx.value.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.value.fillStyle = this.color;
    ctx.value.fill();
  }
}

const init = () => {
  particles.value = [];
  for (let i = 0; i < props.particleCount; i++) {
    particles.value.push(new Particle());
  }
};

const rgbaToRgbaWithOpacity = (color, opacity) => {
  const rgbaMatch = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i,
  );
  if (rgbaMatch) {
    const r = rgbaMatch[1];
    const g = rgbaMatch[2];
    const b = rgbaMatch[3];
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  const hexMatch = color.match(
    /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/i,
  );
  if (hexMatch) {
    const r = parseInt(hexMatch[1], 16);
    const g = parseInt(hexMatch[2], 16);
    const b = parseInt(hexMatch[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

const connect = () => {
  for (let a = 0; a < particles.value.length; a++) {
    for (let b = a; b < particles.value.length; b++) {
      const dx = particles.value[a].x - particles.value[b].x;
      const dy = particles.value[a].y - particles.value[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < props.maxDistance && props.showConnections) {
        const opacity = 1 - distance / props.maxDistance;
        ctx.value.strokeStyle = rgbaToRgbaWithOpacity(
          props.connectionColor,
          opacity,
        );
        ctx.value.lineWidth = props.connectionWidth;
        ctx.value.beginPath();
        ctx.value.moveTo(particles.value[a].x, particles.value[a].y);
        ctx.value.lineTo(particles.value[b].x, particles.value[b].y);
        ctx.value.stroke();
      }
    }
  }
};

const animate = () => {
  const dpr = window.devicePixelRatio || 1;
  const effectiveWidth = canvasWidth.value / dpr;
  const effectiveHeight = canvasHeight.value / dpr;

  ctx.value.fillStyle = props.backgroundColor;
  ctx.value.fillRect(0, 0, effectiveWidth, effectiveHeight);

  particles.value.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  connect();
  animationId.value = requestAnimationFrame(animate);
};

const handleMouseMove = (e) => {
  const rect = canvasRef.value.getBoundingClientRect();
  mouse.value.x = e.clientX - rect.left;
  mouse.value.y = e.clientY - rect.top;
};

const handleMouseDown = () => {
  mouse.value.isDown = true;
};

const handleMouseUp = () => {
  mouse.value.isDown = false;
};

watch(
  () => props.particleCount,
  () => {
    init();
  },
);

watch(
  () => [props.particleSize, props.color, props.speed],
  () => {
    particles.value.forEach((p) => {
      p.size = props.particleSize + Math.random() * 2;
      p.color = props.color;
      p.speedX = (Math.random() - 0.5) * props.speed;
      p.speedY = (Math.random() - 0.5) * props.speed;
    });
  },
);

onMounted(() => {
  ctx.value = canvasRef.value.getContext("2d");

  const container = canvasRef.value.parentElement;
  if (container) {
    resizeObserver.value = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.value.observe(container);
  }

  nextTick(() => {
    updateCanvasSize();
    animate();
  });
});

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
  }
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
  }
});
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  canvas {
    display: block;
    cursor: crosshair;
    width: 100%;
    height: 100%;
  }
}
</style>
