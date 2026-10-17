<template>
  <div class="game-main">
    <div class="hud">
      <button class="icon-btn" title="返回选关（保留进度）" @click="leave">←</button>

      <div class="lv">{{ title }}</div>

      <div class="bar-wrap">
        <div v-for="(g, i) in hud.goals" :key="i" class="goal">
          <div class="goal-head">
            <span v-if="g.type === 'score'">{{ hud.endless ? '本层' : '' }}分数</span>
            <span v-else>{{ colorEmoji(g.color) }} {{ colorName(g.color) }}</span>
            <span class="num">{{ g.cur }} / {{ g.target }}</span>
          </div>
          <div class="bar">
            <div class="fill" :class="{ done: g.done }" :style="{ width: pct(g) + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="stat">
        <span class="k">分数</span>
        <span class="v">{{ hud.score }}</span>
      </div>

      <div v-if="hud.endless" class="stat total">
        <span class="k">总分</span>
        <span class="v">{{ hud.totalScore }}</span>
      </div>

      <div class="stat" :class="{ danger: hud.steps <= 5 }">
        <span class="k">步数</span>
        <span class="v">{{ hud.steps }}</span>
      </div>

      <button class="icon-btn" @click="togglePause">{{ hud.paused ? '▶' : '❚❚' }}</button>
      <button class="icon-btn" title="重开本关" @click="restart">↻</button>
    </div>

    <div class="stage">
      <div class="board-box" :style="{ width: layout.w + 'px', height: layout.h + 'px' }">
        <canvas ref="canvasRef"></canvas>

        <transition name="fade">
          <div v-if="hud.combo >= 2" class="combo">连锁 ×{{ hud.combo }}</div>
        </transition>

        <transition name="fade">
          <div v-if="hud.shuffling" class="shuffle">无解，重洗中…</div>
        </transition>

        <transition name="fade">
          <div v-if="hud.paused" class="overlay">
            <div class="p-title">暂停</div>
            <div class="p-keys">
              <span>点击 / 拖动</span><span>交换相邻两块</span>
              <span>Esc / P</span><span>暂停</span>
              <span>↻</span><span>重开本关</span>
            </div>
            <button class="resume" @click="togglePause">继续</button>
          </div>
        </transition>
      </div>

      <div class="side">
        <div class="card">
          <div class="c-title">特殊块</div>
          <div class="c-row"><span class="tag row">↔</span><span>四连生成 · 炸整行</span></div>
          <div class="c-row"><span class="tag col">↕</span><span>四连生成 · 炸整列</span></div>
          <div class="c-row"><span class="tag area">◉</span><span>L / T 型 · 炸九宫</span></div>
          <div class="c-row"><span class="tag rb">✦</span><span>五连生成 · 全消同色</span></div>
        </div>

        <div class="card">
          <div class="c-title">本局</div>
          <div class="c-row"><span>已用步数</span><span>{{ hud.maxSteps - hud.steps }}</span></div>
          <div class="c-row"><span>每步均分</span><span>{{ avg }}</span></div>
          <div class="c-row"><span>当前连锁</span><span>×{{ hud.combo || 1 }}</span></div>
          <template v-if="hud.endless">
            <div class="c-row"><span>累计总分</span><span>{{ hud.totalScore }}</span></div>
            <div class="c-row"><span>下一层目标</span><span>{{ nextTarget }}</span></div>
          </template>
        </div>

        <div v-if="hud.endless && held.length" class="card">
          <div class="c-title">已持有强化</div>
          <div v-for="b in held" :key="b.id" class="c-row">
            <span class="b-icon">{{ b.icon }}</span>
            <span class="b-name">{{ b.name }}</span>
            <span v-if="b.stack > 1" class="b-stack">×{{ b.stack }}</span>
          </div>
          <div class="c-row"><span>连锁倍率封顶</span><span>×{{ hud.maxMult }}</span></div>
        </div>

        <div class="card legend">
          <div class="c-title">颜色</div>
          <div class="chips">
            <span
              v-for="(t, i) in types.slice(0, level.colors)"
              :key="i"
              class="chip"
              :style="{ background: t.main }"
            >{{ t.emoji }}</span>
          </div>
        </div>
      </div>
    </div>

    <ResultDialog
      v-if="hud.result"
      :result="hud.result"
      :has-next="hasNext"
      @retry="retry"
      @next="$emit('next')"
      @back="leave"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useMatch3 } from '../composables/useMatch3.js'
import { TILE_TYPES } from '../constants.js'
import { endlessTarget } from '../levels.js'
import { buffSummary } from '../buffs.js'
import ResultDialog from './ResultDialog.vue'

const props = defineProps({
  level: { type: Object, required: true },
  snapshot: { type: Object, default: null },
  hasNext: { type: Boolean, default: false },
  /** 无尽模式：上一层累计下来的总分 */
  carryScore: { type: Number, default: 0 },
  /** 无尽模式：已持有的强化 { id: 层数 } */
  buffs: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['exit', 'next', 'persist', 'finish', 'stage-clear', 'restart-endless'])

const canvasRef = ref(null)
const { game, hud, layout, restart, togglePause, snapshot } = useMatch3(canvasRef, {
  level: props.level,
  snapshot: props.snapshot,
  carry: props.carryScore,
  buffs: props.buffs,
  onResult: (r) => emit('finish', { id: props.level.id, result: r }),
  onStageClear: (r) => emit('stage-clear', r),
})

const types = TILE_TYPES
const colorName = (i) => TILE_TYPES[i]?.name || ''
const colorEmoji = (i) => TILE_TYPES[i]?.emoji || ''
const pct = (g) => Math.min(100, Math.round((g.cur / g.target) * 100))
const avg = computed(() => {
  const used = hud.maxSteps - hud.steps
  return used > 0 ? Math.round(hud.score / used) : 0
})
const title = computed(() =>
  hud.endless ? `无尽 · 第 ${hud.stage} 层` : `第 ${props.level.id} 关 · ${props.level.name}`)
const nextTarget = computed(() => endlessTarget(hud.stage + 1))
const held = computed(() => buffSummary(hud.buffs))

const persist = (snap) => emit('persist', { id: props.level.id, snap })

const retry = () => {
  // 无尽模式重试 = 从第 1 层重开，累计分一并归零，交给外层重建对局
  if (hud.endless) {
    emit('restart-endless')
    return
  }
  restart()
  persist(null)
}

const leave = () => {
  if (!hud.endless) persist(hud.result ? null : snapshot())
  emit('exit')
}

defineExpose({ snapshot })
</script>

<style scoped lang="scss">
.game-main {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: radial-gradient(circle at 50% 0%, #2a1748 0%, #140c22 55%, #0d0817 100%);
}

.hud {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, .04);
  border-bottom: 1px solid rgba(255, 255, 255, .08);
}

.icon-btn {
  width: 34px;
  height: 34px;
  font-size: 15px;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, .1);
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 10px;

  &:hover { background: rgba(255, 255, 255, .2); }
}

.lv {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.bar-wrap { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 180px; }

.goal-head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, .6);

  .num { font-weight: 700; color: #fff; }
}

.bar {
  height: 7px;
  overflow: hidden;
  background: rgba(255, 255, 255, .1);
  border-radius: 999px;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, #ff9d3d, #ffd93d);
  border-radius: 999px;
  transition: width .25s ease-out;

  &.done { background: linear-gradient(90deg, #3ddc84, #2ee6e0); }
}

.stat {
  text-align: center;
  min-width: 74px;

  .k { display: block; font-size: 11px; color: rgba(255, 255, 255, .45); }

  .v {
    display: block;
    font-size: 24px;
    font-weight: 800;
    color: #fff;
    font-variant-numeric: tabular-nums;
  }

  &.danger .v { color: #ff5f6d; }
}

.stage {
  flex: 1;
  display: flex;
  gap: 26px;
  align-items: flex-start;
  justify-content: center;
  padding: 22px;
  overflow: auto;
}

.board-box { position: relative; flex: none; }

canvas { display: block; touch-action: none; cursor: pointer; }

.combo {
  position: absolute;
  top: 14px;
  left: 50%;
  padding: 6px 18px;
  font-size: 19px;
  font-weight: 800;
  color: #1a1030;
  background: linear-gradient(135deg, #ffd93d, #ff9d3d);
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(255, 157, 61, .45);
  transform: translateX(-50%);
  animation: bump .3s cubic-bezier(.2, 1.6, .4, 1);
}

@keyframes bump {
  from { transform: translateX(-50%) scale(.5); opacity: 0; }
  to { transform: translateX(-50%) scale(1); opacity: 1; }
}

.shuffle {
  position: absolute;
  top: 50%;
  left: 50%;
  padding: 10px 22px;
  font-size: 15px;
  color: #fff;
  background: rgba(20, 8, 35, .9);
  border: 1px solid rgba(255, 217, 61, .5);
  border-radius: 999px;
  transform: translate(-50%, -50%);
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(10, 5, 20, .82);
  border-radius: 18px;
}

.p-title { font-size: 24px; font-weight: 800; letter-spacing: 4px; color: #fff; }

.p-keys {
  display: grid;
  grid-template-columns: auto auto;
  gap: 6px 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, .6);

  span:nth-child(odd) { color: #ffd93d; }
}

.resume {
  padding: 9px 26px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #ff5f6d, #ff9d3d);
  border: none;
  border-radius: 999px;
}

.side { display: flex; flex-direction: column; gap: 14px; width: 232px; flex: none; }

.card {
  padding: 14px 16px;
  background: rgba(255, 255, 255, .05);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 14px;
}

.c-title {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #ffd93d;
}

.c-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, .62);

  &:last-child { padding-bottom: 0; }
}

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 11px;
  color: #1a1030;
  border-radius: 6px;
  flex: none;

  &.row { background: #ffd93d; }
  &.col { background: #4aa8ff; }
  &.area { background: #b77cff; }
  &.rb { background: linear-gradient(135deg, #ff9ad5, #4aa8ff); color: #fff; }
}

.chips { display: flex; flex-wrap: wrap; gap: 7px; }

.b-icon { font-size: 14px; }

.b-name { flex: 1; color: rgba(255, 255, 255, .8); }

.b-stack { font-weight: 700; color: #ffd93d; }

.chip {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border-radius: 9px;
}

.fade-enter-active, .fade-leave-active { transition: opacity .18s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
