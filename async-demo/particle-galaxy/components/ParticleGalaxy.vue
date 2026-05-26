<template>
  <div ref="containerRef" class="galaxy-container" :style="customStyle">
    <canvas
      ref="galaxyCanvas"
      :style="[
        {
          cursor: isDragging ? 'grabbing' : 'grab',
        },
        customCanvasStyle,
      ]"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  particleCount: {
    type: Number,
    default: 100,
  },
  particleSize: {
    type: Number,
    default: 2,
  },
  rotationSpeed: {
    type: Number,
    default: 0.001,
  },
  attractionStrength: {
    type: Number,
    default: 0.02,
  },
  centerX: {
    type: Number,
    default: 0.5,
  },
  centerY: {
    type: Number,
    default: 0.5,
  },
  spiralFactor: {
    type: Number,
    default: 0.3,
  },
  colorScheme: {
    type: String,
    default: "rainbow",
  },
  enableTrail: {
    type: Boolean,
    default: true,
  },
  trailOpacity: {
    type: Number,
    default: 0.1,
  },
  isRunning: {
    type: Boolean,
    default: true,
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

const emit = defineEmits(["update:fps"]);

const containerRef = ref(null);
const galaxyCanvas = ref(null);
const canvasWidth = ref(800);
const canvasHeight = ref(600);

let animationId = null;
let frameCount = 0;
let fpsUpdateTime = 0;
let particles = [];

let isDragging = ref(false);
let lastX = 0;
let lastY = 0;
let totalRotation = 0;

class Particle {
  constructor(centerX, centerY) {
    this.angle = Math.random() * Math.PI * 2;
    this.radius = Math.random() * 300 + 50;
    this.speed = (Math.random() * 0.5 + 0.5) * 0.02;
    this.size = Math.random() * props.particleSize + 1;
    this.baseHue = Math.random() * 360;

    this.x = centerX + Math.cos(this.angle) * this.radius;
    this.y = centerY + Math.sin(this.angle) * this.radius;

    this.vx = 0;
    this.vy = 0;

    this.alpha = Math.random() * 0.5 + 0.5;
  }

  update(centerX, centerY) {
    this.angle += this.speed * props.rotationSpeed * 10;

    this.radius -= props.attractionStrength * 10;

    if (this.radius < 20) {
      this.radius = Math.random() * 300 + 50;
      this.angle = Math.random() * Math.PI * 2;
    }

    const rotatedAngle = this.angle + totalRotation;
    const targetX =
      centerX +
      Math.cos(rotatedAngle) * this.radius +
      Math.sin(rotatedAngle) * this.radius * props.spiralFactor;
    const targetY =
      centerY +
      Math.sin(rotatedAngle) * this.radius -
      Math.cos(rotatedAngle) * this.radius * props.spiralFactor;

    this.vx += (targetX - this.x) * props.attractionStrength;
    this.vy += (targetY - this.y) * props.attractionStrength;

    this.vx *= 0.98;
    this.vy *= 0.98;

    this.x += this.vx;
    this.y += this.vy;

    this.baseHue = (this.baseHue + 0.5) % 360;
  }

  draw(ctx) {
    let color;

    switch (props.colorScheme) {
      case "rainbow":
        color = `hsla(${this.baseHue}, 80%, 60%, ${this.alpha})`;
        break;
      case "blue":
        color = `rgba(30, 144, 255, ${this.alpha})`;
        break;
      case "purple":
        color = `rgba(138, 43, 226, ${this.alpha})`;
        break;
      case "fire":
        color = `rgba(255, ${100 + Math.random() * 100}, 0, ${this.alpha})`;
        break;
      case "aurora":
        const hue = (this.baseHue + 180) % 360;
        color = `hsla(${hue}, 70%, 60%, ${this.alpha})`;
        break;
      default:
        color = `rgba(255, 255, 255, ${this.alpha})`;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (props.enableTrail && this.size > 2) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = color.replace(/[\d.]+\)$/, `${this.alpha * 0.3})`);
      ctx.fill();
    }
  }
}

const getColorArray = () => {
  switch (props.colorScheme) {
    case "rainbow":
      return ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#9b59b6"];
    case "blue":
      return ["#1e90ff", "#00bfff", "#87ceeb", "#4169e1", "#6495ed"];
    case "purple":
      return ["#8a2be2", "#9932cc", "#da70d6", "#ba55d3", "#9370db"];
    case "fire":
      return ["#ff4500", "#ff6347", "#ffa07a", "#ffd700", "#ff8c00"];
    case "aurora":
      return ["#00ff87", "#60efff", "#ff61f6", "#ffffff", "#dfe6e9"];
    default:
      return ["#ffffff"];
  }
};

const initParticles = () => {
  particles = [];
  const centerX = canvasWidth.value * props.centerX;
  const centerY = canvasHeight.value * props.centerY;

  for (let i = 0; i < props.particleCount; i++) {
    particles.push(new Particle(centerX, centerY));
  }
};

const draw = (timestamp) => {
  const ctx = galaxyCanvas.value.getContext("2d");

  if (props.enableTrail) {
    ctx.fillStyle = `rgba(0, 0, 0, ${props.trailOpacity})`;
  } else {
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
  }
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value);

  const centerX = canvasWidth.value * props.centerX;
  const centerY = canvasHeight.value * props.centerY;

  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    150,
  );
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
  gradient.addColorStop(0.5, "rgba(100, 100, 255, 0.1)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value);

  particles.forEach((particle) => {
    particle.update(centerX, centerY);
    particle.draw(ctx);
  });

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

const updateCanvasSize = () => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();
    canvasWidth.value = rect.width;
    canvasHeight.value = rect.height;

    if (galaxyCanvas.value) {
      galaxyCanvas.value.width = canvasWidth.value;
      galaxyCanvas.value.height = canvasHeight.value;
    }

    stopAnimation();
    initParticles();
    startAnimation();
  }
};

let resizeObserver = null;

watch(
  () => [
    props.particleCount,
    props.particleSize,
    props.rotationSpeed,
    props.attractionStrength,
    props.centerX,
    props.centerY,
    props.spiralFactor,
    props.colorScheme,
    props.enableTrail,
    props.trailOpacity,
  ],
  () => {
    stopAnimation();
    initParticles();
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

watch([() => props.centerX, () => props.centerY], () => {
  particles.forEach((p) => {
    p.radius = Math.random() * 300 + 50;
  });
});

const handleMouseDown = (e) => {
  isDragging.value = true;
  lastX = e.clientX;
  lastY = e.clientY;
};

const handleMouseMove = (e) => {
  if (!isDragging.value) return;

  const centerX = canvasWidth.value / 2;
  const centerY = canvasHeight.value / 2;

  const angle1 = Math.atan2(lastY - centerY, lastX - centerX);
  const angle2 = Math.atan2(e.clientY - centerY, e.clientX - centerX);

  totalRotation += angle2 - angle1;

  lastX = e.clientX;
  lastY = e.clientY;
};

const handleMouseUp = () => {
  isDragging.value = false;
};

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    updateCanvasSize();
  });

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }

  const canvas = galaxyCanvas.value;
  if (canvas) {
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
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
.galaxy-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
}

canvas {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
}
</style>
