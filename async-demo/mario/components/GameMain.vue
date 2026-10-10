<template>
  <div class="game-main">
    <div class="hud">
      <div class="hud-item">
        <span class="label">MARIO</span>
        <span class="value">{{ String(hud.score).padStart(6, '0') }}</span>
      </div>
      <div class="hud-item">
        <span class="label coin">🪙</span>
        <span class="value">×{{ String(hud.coins).padStart(2, '0') }}</span>
      </div>
      <div class="hud-item">
        <span class="label">❤</span>
        <span class="value">×{{ hud.lives }}</span>
      </div>
      <div class="hud-item grow">
        <span class="label">WORLD</span>
        <span class="value">{{ hud.levelName }}</span>
      </div>
      <div class="hud-item">
        <span class="label">路程</span>
        <span class="value">{{ hud.progress }}%</span>
      </div>
      <div class="hud-item">
        <span class="label">TIME</span>
        <span class="value" :class="{ danger: hud.time <= 60 }">{{ String(hud.time).padStart(3, '0') }}</span>
      </div>
      <div class="hud-item">
        <span class="label">形态</span>
        <span class="value form" :class="hud.form">{{ formLabel }}</span>
      </div>
      <button class="dbg-btn" :class="{ on: debugOpen }" @click="toggleDebug">🛠 调试</button>
    </div>

    <div class="stage">
      <canvas ref="canvasRef"></canvas>

      <transition name="fade">
        <div v-if="hud.message && hud.status === 'clear'" class="banner">{{ hud.message }}</div>
      </transition>

      <div v-if="hud.star > 0" class="star-bar">
        无敌星 {{ (hud.star / 60).toFixed(1) }}s
      </div>

      <transition name="fade">
        <div v-if="hud.paused && !debugOpen" class="overlay">
          <div class="panel">
            <div class="p-title">暂停</div>
            <div class="p-keys">
              <span>← → / A D</span><span>移动</span>
              <span>空格 / ↑ / W</span><span>跳跃（长按跳更高）</span>
              <span>Shift</span><span>加速跑</span>
              <span>X / L</span><span>发射火球（火力形态）</span>
              <span>↓ / S</span><span>站在隐藏管道上进入跳关</span>
              <span>P / Esc</span><span>暂停</span>
              <span>R</span><span>回到最近存档点重来</span>
              <span>~</span><span>调试面板（跳关 / 金币 / 无敌）</span>
            </div>
            <div class="p-tips">
              受伤只掉形态：火焰 → 超级 → 小马里奥，小马里奥再受伤才掉命<br>
              集满 50 枚金币加 1 条命；绿色小旗是中途存档点，碰到额外加时
            </div>
            <div class="btn-row">
              <button class="btn primary" @click="togglePause">继续</button>
              <button class="btn" @click="restart">回到存档点</button>
              <button class="btn ghost" @click="emit('back')">世界地图</button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="hud.status === 'over'" class="overlay">
          <div class="panel">
            <div class="p-title danger">GAME OVER</div>
            <div class="p-sub">生命耗尽了，碧琪公主还在库巴手里</div>
            <div class="btn-row">
              <button class="btn primary" @click="retry">再来一次</button>
              <button class="btn ghost" @click="emit('back')">世界地图</button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="hud.status === 'win'" class="overlay">
          <div class="panel">
            <div class="p-title win">谢谢马里奥！</div>
            <div class="p-sub">碧琪公主得救了，无尽关卡已解锁</div>
            <div class="btn-row">
              <button class="btn primary" @click="emit('endless')">进入无尽关卡</button>
              <button class="btn ghost" @click="emit('back')">世界地图</button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <div class="foot">
      <span>← → 移动</span><span>空格 跳跃</span><span>Shift 跑</span><span>X 火球</span>
      <span>↓ 隐藏管道（金币房）</span><span>P 暂停</span><span>R 回存档点</span>
      <span class="hot">~ 调试面板</span>
    </div>

    <DebugPanel v-if="debugOpen" :game="game" :hud="hud" @close="toggleDebug" @toggle-pause="togglePause" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMario } from '../composables/useMario.js'
import { useDebug } from '../composables/useDebug.js'
import DebugPanel from './DebugPanel.vue'

const props = defineProps({
  mode: { type: String, default: 'story' },
  levelIndex: { type: Number, default: 0 },
})

const emit = defineEmits(['back', 'unlock', 'endless'])

const canvasRef = ref(null)
const { game, hud, togglePause, setPaused, restart, retry, debugOpen, toggleDebug } = useMario(canvasRef, {
  mode: props.mode,
  levelIndex: props.levelIndex,
})
const { panel } = useDebug()

const formLabel = computed(() => ({ small: '小马里奥', big: '超级马里奥', fire: '火焰马里奥' }[hud.form]))

// 打开调试面板时自动暂停（可在面板内关掉），避免点按钮时角色掉坑
watch(debugOpen, (v) => {
  if (panel.pauseOnOpen) setPaused(v)
})

watch(() => hud.status, (s) => {
  if (s === 'win') emit('unlock')
})
</script>

<style scoped lang="scss">
.game-main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #12081c;
  color: #f4ecff;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

.hud {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px 18px;
  background: linear-gradient(180deg, #241034, #180a24);
  border-bottom: 2px solid rgba(252, 216, 0, 0.25);
  font-variant-numeric: tabular-nums;
}

.hud-item {
  display: flex;
  flex-direction: column;
  gap: 2px;

  &.grow {
    flex: 1;
  }

  .label {
    font-size: 10px;
    letter-spacing: 2px;
    color: rgba(244, 236, 255, 0.5);
  }

  .value {
    font-size: 17px;
    font-weight: 700;
    font-family: monospace;
    color: #fcd800;

    &.danger {
      color: #ff5a4a;
    }

    &.form {
      font-size: 13px;
      font-family: inherit;

      &.small {
        color: #9cd8ff;
      }

      &.big {
        color: #7cff9c;
      }

      &.fire {
        color: #ff9c4a;
      }
    }
  }
}

.dbg-btn {
  position: relative;
  z-index: 10000;
  padding: 5px 12px;
  font-size: 12px;
  letter-spacing: 1px;
  color: #fcd800;
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(252, 216, 0, 0.45);
  border-radius: 6px;

  &:hover {
    background: rgba(252, 216, 0, 0.14);
  }

  &.on {
    color: #2a1a00;
    background: #fcd800;
  }
}

.stage {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 10px;

  canvas {
    height: 100%;
    max-width: 100%;
    aspect-ratio: 5 / 3;
    image-rendering: pixelated;
    background: #5c94fc;
    border: 3px solid rgba(252, 216, 0, 0.4);
    border-radius: 4px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  }
}

.banner {
  position: absolute;
  top: 18%;
  padding: 10px 30px;
  font-size: 22px;
  letter-spacing: 4px;
  color: #fff;
  background: rgba(229, 37, 33, 0.9);
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
}

.star-bar {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 16px;
  font-size: 13px;
  letter-spacing: 2px;
  color: #2a1a00;
  background: #fcd800;
  border-radius: 20px;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 4, 18, 0.72);
}

.panel {
  min-width: 340px;
  padding: 26px 30px;
  border-radius: 12px;
  background: #1d0f2c;
  border: 1px solid rgba(252, 216, 0, 0.3);
  text-align: center;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.6);
}

.p-title {
  font-size: 26px;
  letter-spacing: 6px;
  color: #fcd800;

  &.danger {
    color: #ff5a4a;
  }

  &.win {
    color: #7cff9c;
  }
}

.p-sub {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(244, 236, 255, 0.62);
}

.p-keys {
  margin: 18px 0;
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 6px 12px;
  font-size: 12px;
  text-align: left;

  span:nth-child(odd) {
    color: #9cd8ff;
    font-family: monospace;
  }

  span:nth-child(even) {
    color: rgba(244, 236, 255, 0.72);
  }
}

.p-tips {
  margin: 0 0 18px;
  font-size: 11.5px;
  line-height: 1.7;
  text-align: left;
  color: rgba(244, 236, 255, 0.5);
}

.btn-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 14px;
}

.btn {
  padding: 10px 22px;
  font-size: 13px;
  letter-spacing: 2px;
  border-radius: 8px;
  border: 1px solid rgba(252, 216, 0, 0.45);
  background: transparent;
  color: #fcd800;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(252, 216, 0, 0.14);
  }

  &.primary {
    background: #e52521;
    border-color: #e52521;
    color: #fff;

    &:hover {
      background: #ff4a44;
    }
  }

  &.ghost {
    border-color: rgba(244, 236, 255, 0.3);
    color: rgba(244, 236, 255, 0.75);

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }
}

.foot {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 8px;
  font-size: 11px;
  letter-spacing: 1px;
  color: rgba(244, 236, 255, 0.4);
  background: #180a24;

  .hot {
    color: #fcd800;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
