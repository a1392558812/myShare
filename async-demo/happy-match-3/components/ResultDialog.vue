<template>
  <div class="mask">
    <div class="panel">
      <div class="title" :class="{ lose: !result.win }">{{ title }}</div>

      <div v-if="result.win" class="stars">
        <span
          v-for="i in 3"
          :key="i"
          class="star"
          :class="{ on: i <= shown }"
          :style="{ animationDelay: `${i * 0.22}s` }"
        >★</span>
      </div>
      <div v-else class="gap">{{ result.endless ? `第 ${result.stage} 层 · 还差 ${result.gap} 分` : `还差 ${result.gap} 分` }}</div>

      <div class="score">
        <span class="num">{{ result.endless ? result.totalScore : result.score }}</span>
        <span class="unit">分</span>
      </div>
      <div v-if="result.endless" class="sub">累计总分 · 共 {{ result.stage }} 层</div>

      <div class="rows">
        <template v-if="result.endless">
          <div class="row">
            <span>到达层数</span><span>第 {{ result.stage }} 层</span>
          </div>
          <div class="row">
            <span>本层得分</span><span>{{ result.score }} / {{ result.target }}</span>
          </div>
          <div class="row">
            <span>剩余步数</span><span>{{ result.stepsLeft }}</span>
          </div>
          <div class="row">
            <span>最长连锁</span><span>{{ result.maxWave }} 波</span>
          </div>
        </template>
        <template v-else>
          <div class="row">
            <span>目标分</span><span>{{ result.target }}</span>
          </div>
          <div class="row">
            <span>剩余步数</span><span>{{ result.stepsLeft }}</span>
          </div>
          <div class="row">
            <span>最长连锁</span><span>{{ result.maxWave }} 波</span>
          </div>
          <div v-for="(g, i) in result.goals" :key="i" class="row">
            <span>{{ g.type === 'score' ? '目标分' : `消除${colorName(g.color)}块` }}</span>
            <span :class="{ done: g.done }">{{ g.cur }} / {{ g.target }}</span>
          </div>
        </template>
      </div>

      <div class="btns">
        <button class="btn" @click="$emit('back')">{{ result.endless ? '返回首页' : '返回选关' }}</button>
        <button class="btn primary" @click="$emit('retry')">重试</button>
        <button v-if="result.win && hasNext" class="btn primary" @click="$emit('next')">下一关</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { TILE_TYPES } from '../constants.js'
import { playSfx } from '../audio.js'

const props = defineProps({
  result: { type: Object, required: true },
  hasNext: { type: Boolean, default: false },
})
defineEmits(['retry', 'next', 'back'])

const shown = ref(0)
const colorName = (i) => TILE_TYPES[i]?.name || ''

const title = computed(() => {
  if (props.result.endless) return '无尽结束'
  if (props.result.win) return props.result.stars === 3 ? '完美通关!' : '通关!'
  return '步数用完了'
})

onMounted(() => {
  const total = props.result.stars || 0
  let i = 0
  const timer = setInterval(() => {
    i++
    shown.value = i
    if (i > 0 && i <= total) playSfx('star')
    if (i >= total) clearInterval(timer)
  }, 220)
})
</script>

<style scoped lang="scss">
.mask {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 4, 16, .72);
  backdrop-filter: blur(4px);
}

.panel {
  width: 380px;
  padding: 28px 30px 24px;
  text-align: center;
  background: linear-gradient(170deg, #33205a, #1a1030);
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 22px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, .55);
  animation: pop .28s cubic-bezier(.2, 1.4, .4, 1);
}

@keyframes pop {
  from { transform: scale(.82); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 3px;
  color: #ffd93d;
  text-shadow: 0 0 18px rgba(255, 217, 61, .4);

  &.lose { color: #ff5f6d; text-shadow: 0 0 18px rgba(255, 95, 109, .35); }
}

.stars { margin: 16px 0 4px; display: flex; justify-content: center; gap: 10px; }

.star {
  font-size: 40px;
  color: rgba(255, 255, 255, .14);
  transition: color .2s, transform .2s;

  &.on {
    color: #ffd93d;
    text-shadow: 0 0 16px rgba(255, 217, 61, .6);
    animation: stamp .38s cubic-bezier(.2, 1.6, .4, 1) backwards;
  }
}

@keyframes stamp {
  0% { transform: scale(2.2) rotate(-18deg); opacity: 0; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

.gap { margin: 14px 0 4px; font-size: 15px; color: rgba(255, 255, 255, .6); }

.score { margin: 12px 0 18px; }

.num {
  font-size: 46px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 0 22px rgba(255, 255, 255, .25);
}

.unit { margin-left: 6px; font-size: 15px; color: rgba(255, 255, 255, .5); }

.sub { margin: -12px 0 16px; font-size: 12px; color: rgba(255, 255, 255, .42); }

.rows {
  padding: 12px 14px;
  background: rgba(0, 0, 0, .22);
  border-radius: 12px;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, .55);

  .done { color: #3ddc84; }
}

.btns { display: flex; gap: 10px; margin-top: 18px; }

.btn {
  flex: 1;
  padding: 11px 0;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, .1);
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: 12px;
  transition: background .18s, transform .12s;

  &:hover { background: rgba(255, 255, 255, .2); }
  &:active { transform: translateY(1px); }
}

.primary {
  background: linear-gradient(135deg, #ff5f6d, #ff9d3d);
  border-color: transparent;

  &:hover { background: linear-gradient(135deg, #ff7280, #ffae5c); }
}
</style>
