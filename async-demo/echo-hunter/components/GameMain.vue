<template>
  <div class="game-main" ref="containerRef">
    <canvas ref="canvasRef"></canvas>

    <div v-if="status === 'won'" class="overlay">
      <div class="panel">
        <div class="title">逃脱成功</div>
        <div class="sub">你集齐了所有磷虾，游进了出口漩涡</div>
        <button class="btn" @click="game.startEndless()">进入无尽模式</button>
        <button class="btn btn-secondary" @click="$emit('restart')">再来一局</button>
      </div>
    </div>

    <div v-else-if="status === 'lost'" class="overlay">
      <div class="panel">
        <div class="title">被黑暗吞噬</div>
        <div class="sub">{{ deathText }}</div>
        <button class="btn" @click="$emit('restart')">再来一局</button>
      </div>
    </div>

    <div class="debug-panel">
      <div class="dp-title">调试</div>
      <label class="dp-item">
        <input type="checkbox" v-model="debug.invincible" />
        <span>无敌</span>
      </label>
      <label class="dp-item">
        <input type="checkbox" v-model="debug.seeAll" />
        <span>全图可见</span>
      </label>
    </div>

    <!-- 无尽模式 DNA 强化：吃道具积熟练度，加点 -->
    <div v-if="game.endless.value" class="dna-panel">
      <div class="dna-head">DNA 强化 · 熟练度 {{ game.proficiency.value }}</div>
      <div v-for="g in dnaAttrs" :key="g.key" class="dna-row">
        <div class="dna-name">{{ g.name }}</div>
        <div class="dna-desc">{{ g.desc }}</div>
        <div class="dna-lv">Lv {{ game.dna.value[g.key] }}</div>
        <button class="dna-btn" :disabled="!game.dnaCanUpgrade(g.key)" @click="game.upgradeDNA(g.key)">
          +{{ game.dnaCost(g.key) }}
        </button>
      </div>
      <div class="dna-tip">吃道具积熟练度，河豚最值钱但也危险</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useGame } from '../composables/useGame.js';
import { render } from '../draw/renderer.js';

const emit = defineEmits(['restart']);

const game = useGame();
const { status, deathReason, debug } = game;

const deathText = computed(() => {
  const map = {
    monster: '海怪抓住了你',
    puffer: '河豚的毒刺带走了你',
    barnacle: '毒液藤壶吞噬了你',
    fear: '黑暗中的恐惧吞噬了你',
  };
  return map[deathReason.value] || '黑暗吞噬了你';
});

// DNA 强化项（无尽模式，每项 maxLevel 级）
const dnaAttrs = [
  { key: 'courage', name: '胆量', desc: '恐惧基础时长 +8%/级' },
  { key: 'skin', name: '皮肤', desc: '无敌帧 +120ms/级' },
  { key: 'sonar', name: '声呐', desc: '回能+5/s、上限+10/级' },
  { key: 'muscle', name: '肌肉', desc: '冲刺CD-110ms、距离+/级' },
];

const containerRef = ref(null);
const canvasRef = ref(null);

let ctx = null;
let rafId = null;
let resizeObserver = null;
let viewW = 800;
let viewH = 600;
let dpr = 1;
let lastTs = 0;

const resizeCanvas = () => {
  const container = containerRef.value;
  if (!container) return;
  const rect = container.getBoundingClientRect();
  dpr = window.devicePixelRatio || 1;
  viewW = Math.max(100, rect.width);
  viewH = Math.max(100, rect.height);
  canvasRef.value.width = Math.round(viewW * dpr);
  canvasRef.value.height = Math.round(viewH * dpr);
  canvasRef.value.style.width = viewW + 'px';
  canvasRef.value.style.height = viewH + 'px';
  ctx = canvasRef.value.getContext('2d');
  game.setViewSize(viewW, viewH);
};

const handleMouseMove = (e) => {
  const rect = canvasRef.value.getBoundingClientRect();
  game.setMouse(e.clientX - rect.left, e.clientY - rect.top);
};

const handleMouseDown = (e) => {
  if (e.button === 0) game.setFiring(true);
  else if (e.button === 2) game.setDash();
};

const handleMouseUp = (e) => {
  if (e.button === 0) game.setFiring(false);
};

const handleContextMenu = (e) => e.preventDefault();

onMounted(() => {
  nextTick(() => {
    resizeCanvas();

    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(containerRef.value);

    const canvas = canvasRef.value;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mouseup', handleMouseUp);

    const loop = (timestamp) => {
      if (!lastTs) lastTs = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTs) / 1000);
      lastTs = timestamp;
      game.update(dt, timestamp);
      render(ctx, game.getState(), viewW, viewH, dpr);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
  });
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  if (resizeObserver) resizeObserver.disconnect();
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('contextmenu', handleContextMenu);
  }
  window.removeEventListener('mouseup', handleMouseUp);
});
</script>

<style scoped lang="scss">
.game-main {
  width: 100%;
  height: 100%;
  position: relative;
  background: #020409;
  overflow: hidden;
}

canvas {
  display: block;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
}

.panel {
  text-align: center;
}

.title {
  font-size: 30px;
  color: #3ee6d8;
  letter-spacing: 4px;
  margin-bottom: 12px;
}

.sub {
  font-size: 14px;
  color: #eaf6ff;
  margin-bottom: 24px;
}

.btn {
  padding: 10px 28px;
  font-size: 15px;
  color: #020409;
  background: #3ee6d8;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 6px;

  &:hover {
    background: #7df3ff;
  }
}

.btn-secondary {
  background: transparent;
  color: #3ee6d8;
  border: 1px solid #3ee6d8;

  &:hover {
    background: rgba(62, 230, 216, 0.12);
  }
}

.debug-panel {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 10px 12px;
  background: rgba(2, 8, 15, 0.78);
  border: 1px solid #1b7f8a;
  border-radius: 3px;
  color: #eaf6ff;
  font-family: monospace;
  font-size: 13px;
  user-select: none;
  z-index: 10;
}

.dp-title {
  color: #7df3ff;
  letter-spacing: 2px;
  margin-bottom: 8px;
  font-size: 12px;
}

.dp-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
  cursor: pointer;

  input {
    cursor: pointer;
    accent-color: #3ee6d8;
  }
}

/* 无尽 DNA 强化面板 */
.dna-panel {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 10px 12px;
  background: rgba(2, 8, 15, 0.8);
  border: 1px solid #6b2fb0;
  border-radius: 4px;
  color: #eaf6ff;
  font-family: monospace;
  font-size: 12px;
  user-select: none;
  z-index: 10;
  min-width: 260px;
}

.dna-head {
  color: #b06cff;
  letter-spacing: 1px;
  font-weight: bold;
  margin-bottom: 8px;
}

.dna-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}

.dna-name {
  width: 40px;
  color: #7df3ff;
  font-weight: bold;
}

.dna-desc {
  flex: 1;
  color: #8899aa;
  font-size: 11px;
  line-height: 1.3;
}

.dna-lv {
  color: #b06cff;
  min-width: 34px;
  text-align: center;
}

.dna-btn {
  padding: 2px 8px;
  font-size: 11px;
  font-family: monospace;
  color: #020409;
  background: #b06cff;
  border: none;
  border-radius: 3px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #cf9bff;
  }

  &:disabled {
    background: #2a2040;
    color: #6b6580;
    cursor: not-allowed;
  }
}

.dna-tip {
  margin-top: 8px;
  color: #5a6b7d;
  font-size: 10px;
  border-top: 1px solid rgba(176, 108, 255, 0.2);
  padding-top: 6px;
}
</style>
