<template>
  <div class="levels">
    <div class="head">
      <button class="back" @click="$emit('back')">← 返回</button>
      <h2>选择关卡</h2>
      <div class="best">最高分 {{ topScore }}</div>
    </div>

    <div class="grid">
      <div
        v-for="lv in levels"
        :key="lv.id"
        :data-lid="lv.id"
        class="card"
        :class="{ locked: lv.id > unlocked }"
        @click="pick(lv)"
      >
        <div class="no">{{ lv.id }}</div>
        <div class="name">{{ lv.name }}</div>
        <div class="meta">{{ lv.rows }}×{{ lv.cols }} · {{ lv.steps }} 步</div>

        <div class="stars">
          <span v-for="i in 3" :key="i" class="star" :class="{ on: i <= (best[lv.id]?.stars || 0) }">★</span>
        </div>

        <div class="goal">
          <span v-for="(g, i) in goalList(lv)" :key="i">{{ g }}</span>
        </div>

        <div v-if="lv.id > unlocked" class="lock">🔒 通关上一关解锁</div>
        <div v-else class="score">最佳 {{ best[lv.id]?.score || 0 }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { LEVELS, goalText } from '../levels.js'
import { playSfx } from '../audio.js'

const props = defineProps({
  unlocked: { type: Number, default: 1 },
  best: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['back', 'pick'])

const levels = LEVELS
const goalList = (lv) => lv.goals.map(goalText)
const topScore = computed(() =>
  Math.max(0, ...Object.values(props.best).map((x) => x.score || 0)))

const pick = (lv) => {
  if (lv.id > props.unlocked) return
  playSfx('select')
  emit('pick', lv.id)
}
</script>

<style scoped lang="scss">
.levels {
  height: 100%;
  padding: 26px 32px;
  overflow-y: auto;
  background: radial-gradient(circle at 50% 0%, #2a1748 0%, #140c22 55%, #0d0817 100%);
}

.head {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 26px;

  h2 { margin: 0; font-size: 24px; letter-spacing: 4px; color: #fff; }
}

.back {
  padding: 8px 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, .8);
  cursor: pointer;
  background: rgba(255, 255, 255, .08);
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 999px;

  &:hover { background: rgba(255, 255, 255, .16); }
}

.best {
  margin-left: auto;
  font-size: 13px;
  color: rgba(255, 255, 255, .45);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(228px, 1fr));
  gap: 18px;
  max-width: 1000px;
}

.card {
  position: relative;
  padding: 20px 18px 16px;
  cursor: pointer;
  background: linear-gradient(165deg, rgba(255, 255, 255, .1), rgba(255, 255, 255, .03));
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 18px;
  transition: transform .16s, border-color .2s, box-shadow .2s;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 217, 61, .55);
    box-shadow: 0 12px 28px rgba(0, 0, 0, .4);
  }
}

.locked {
  cursor: not-allowed;
  filter: grayscale(.85);
  opacity: .55;

  &:hover { transform: none; border-color: rgba(255, 255, 255, .14); box-shadow: none; }
}

.no {
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  color: #ffd93d;
}

.name { margin-top: 6px; font-size: 17px; font-weight: 700; color: #fff; }
.meta { margin-top: 4px; font-size: 12px; color: rgba(255, 255, 255, .45); }

.stars { margin: 12px 0 8px; display: flex; gap: 4px; }

.star {
  font-size: 20px;
  color: rgba(255, 255, 255, .16);

  &.on { color: #ffd93d; text-shadow: 0 0 10px rgba(255, 217, 61, .55); }
}

.goal {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;

  span {
    padding: 3px 9px;
    color: rgba(255, 255, 255, .75);
    background: rgba(255, 255, 255, .08);
    border-radius: 999px;
  }
}

.lock, .score {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, .4);
}
</style>
