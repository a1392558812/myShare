<template>
  <div class="mask">
    <div class="box">
      <div class="title">{{ winnerText }}</div>
      <div class="diff">点数差 {{ final.diff }}</div>

      <div class="pts">
        <div class="p" :class="{ win: final.winner === 0 }">
          <span>你</span><b>{{ final.points[0] }}</b>
        </div>
        <div class="p" :class="{ win: final.winner === 1 }">
          <span>AI</span><b>{{ final.points[1] }}</b>
        </div>
      </div>

      <div class="hist">
        <div v-for="(h, i) in final.history" :key="i" class="h-row">
          <span class="idx">{{ windName(h.wind) }}{{ h.number }}局</span>
          <span class="res" :class="h.kind">{{ h.kind === 'win'
            ? (h.winner === 0 ? '你' : 'AI') + (h.isTsumo ? '自摸' : '荣和') + ' ' + (h.isYakuman ? '役满' : h.han + '番') + ' ' + h.total + '点'
            : '流局 · ' + h.reason }}</span>
        </div>
      </div>

      <div class="foot">
        <button class="btn ghost" @click="$emit('menu')">返回菜单</button>
        <button class="btn" @click="$emit('again')">再来一局</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ final: { type: Object, required: true } })
defineEmits(['menu', 'again'])

const winnerText = computed(() => {
  if (props.final.winner < 0) return '平局'
  return props.final.winner === 0 ? '你赢了' : 'AI 获胜'
})
const windName = (w) => (w === 'east' ? '東' : '南')
</script>

<style scoped lang="scss">
.mask {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 12, 9, .8);
}

.box {
  width: 430px;
  max-height: 100%;
  overflow-y: auto;
  padding: 26px 28px;
  background: linear-gradient(160deg, #16493a, #0a2a20);
  border: 1px solid rgba(255, 217, 61, .35);
  border-radius: 16px;
}

.title { font-size: 28px; font-weight: 800; color: #ffd93d; }

.diff { margin-top: 4px; font-size: 13px; color: rgba(242, 239, 230, .55); }

.pts { display: flex; gap: 14px; margin: 18px 0; }

.p {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(255, 255, 255, .05);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 12px;

  span { font-size: 12px; color: rgba(242, 239, 230, .5); }

  b { font-size: 26px; font-weight: 800; color: #f2efe6; font-variant-numeric: tabular-nums; }

  &.win { background: rgba(255, 217, 61, .12); border-color: rgba(255, 217, 61, .5); }
}

.hist { max-height: 220px; overflow-y: auto; }

.h-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  font-size: 12px;
  border-bottom: 1px dashed rgba(255, 255, 255, .07);

  .idx { color: rgba(242, 239, 230, .45); }

  .res { color: #f2efe6; }

  .res.draw { color: rgba(242, 239, 230, .45); }
}

.foot { display: flex; gap: 10px; margin-top: 20px; }

.btn {
  flex: 1;
  padding: 11px;
  font-size: 14px;
  font-weight: 700;
  color: #10281f;
  cursor: pointer;
  background: linear-gradient(135deg, #ffd93d, #ff9d3d);
  border: none;
  border-radius: 10px;

  &.ghost { color: rgba(242, 239, 230, .7); background: rgba(255, 255, 255, .07); }
}
</style>
