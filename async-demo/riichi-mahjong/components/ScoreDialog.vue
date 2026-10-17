<template>
  <div class="mask">
    <div class="box">
      <div class="head">
        <span class="who">{{ winnerName }}</span>
        <span class="act">{{ result.isTsumo ? '自摸' : '荣和' }}</span>
        <span class="wtile">
          和了牌
          <TileFace v-if="winTileOk" :kind="result.winTile" :w="22" />
        </span>
        <span class="limit" :class="result.limit">{{ result.limitName }}</span>
      </div>

      <div class="tiles">
        <span v-for="(b, i) in groups" :key="i" class="m" :class="{ open: b.concealed === false }">
          <TileFace v-for="(k, j) in b.kinds" :key="j" :kind="k" :w="20" />
          <i v-if="b.tag" class="tag">{{ b.tag }}</i>
          <i v-if="b.label" class="tag">{{ b.label }}</i>
        </span>
      </div>

      <div class="dora" v-if="result.doraIndicators && result.doraIndicators.length">
        <span class="dl">宝牌指示</span>
        <TileFace v-for="(d, i) in doraInds" :key="i" :kind="d" :w="22" />
        <b v-if="result.dora">宝牌 {{ result.dora }} 番</b>
        <span v-else class="dim">无宝牌</span>
      </div>

      <div class="rows">
        <div v-for="y in result.yaku" :key="y.name" class="row">
          <span class="n">{{ y.name }}</span>
          <span class="h">{{ result.isYakuman ? '役满' : y.han + ' 番' }}</span>
        </div>
      </div>

      <div class="sum">
        <div class="s-item"><span>合计</span><b>{{ result.isYakuman ? '役满' : result.han + ' 番' }}</b></div>
        <div class="s-item"><span>符</span><b>{{ result.fu || '—' }}</b></div>
        <div class="s-item"><span>基本点</span><b>{{ result.basePoints }}</b></div>
        <div class="s-item"><span>本场</span><b>+{{ result.honbaAddition }}</b></div>
        <div class="s-item"><span>立直棒</span><b>+{{ result.riichiPoints }}</b></div>
      </div>

      <div class="pay">
        <div class="pay-row">
          <span>{{ payerName }}</span>
          <span class="arrow">→</span>
          <span>{{ winnerName }}</span>
          <b class="amt">{{ result.total }} 点</b>
        </div>
        <div class="pts">
          <span>你 {{ points[0] }}</span>
          <span>AI {{ points[1] }}</span>
        </div>
      </div>

      <div class="foot">
        <span class="next">{{ result.dealerRepeat ? '连庄 · 本场 +1' : '轮庄' }}</span>
        <button class="btn" @click="$emit('confirm')">继续</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TileFace from './TileFace.vue'

const props = defineProps({
  result: { type: Object, required: true },
  points: { type: Array, required: true },
})
defineEmits(['confirm'])

/** 牌种合法性：界面只画 0~33，其它一律不画（宁可缺一张，也不要画出空白牌 / 抛 drawImage 异常） */
const okKind = (k) => Number.isInteger(k) && k >= 0 && k <= 33

const winTileOk = computed(() => okKind(props.result.winTile))
const doraInds = computed(() => (props.result.doraIndicators || []).filter(okKind))
const groups = computed(() => (props.result.breakdown || []).map((b) => ({
  ...b,
  kinds: (b.kinds || []).filter(okKind),
})))

const winnerName = computed(() => (props.result.winner === 0 ? '你' : 'AI'))
/** 付钱的一方：荣和是放铳者，自摸是另一家（result.loser 在自摸时为 -1） */
const payerName = computed(() => {
  if (props.result.isTsumo) return props.result.winner === 0 ? 'AI' : '你'
  return props.result.loser === 0 ? '你' : 'AI'
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
  background: rgba(4, 12, 9, .72);
}

.box {
  width: 460px;
  padding: 22px 24px;
  background: linear-gradient(160deg, #16493a, #0a2a20);
  border: 1px solid rgba(255, 217, 61, .35);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .55);
}

.head { display: flex; align-items: center; gap: 10px; }

.who { font-size: 22px; font-weight: 800; color: #ffd93d; }

.act {
  padding: 2px 8px;
  font-size: 12px;
  color: #10281f;
  background: #ffd93d;
  border-radius: 999px;
}

.wtile { display: inline-flex; gap: 5px; align-items: center; font-size: 13px; color: rgba(242, 239, 230, .6); }

.limit {
  padding: 2px 9px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  margin-left: auto;
  background: rgba(255, 255, 255, .1);
  color: #f2efe6;

  &.mangan { background: rgba(61, 220, 132, .2); color: #3ddc84; }
  &.haneman, &.baiman, &.sanbaiman { background: rgba(74, 168, 255, .2); color: #4aa8ff; }
  &.yakuman { background: rgba(255, 95, 109, .22); color: #ff5f6d; }
}

.tiles { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 12px; }

.m {
  display: inline-flex;
  gap: 2px;
  align-items: center;
  padding: 4px 6px;
  font-size: 13px;
  color: #f2efe6;
  background: rgba(255, 255, 255, .08);
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 7px;

  /* 副露（吃碰明杠）：虚线框区分「已经亮出来的牌」 */
  &.open { background: rgba(255, 217, 61, .1); border-style: dashed; border-color: rgba(255, 217, 61, .45); }

  .tag { margin-left: 3px; font-size: 10px; font-style: normal; color: rgba(242, 239, 230, .45); }
}

.dora {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  margin-bottom: 12px;

  .dl { font-size: 12px; color: rgba(242, 239, 230, .5); }
  b { font-size: 13px; color: #ffd93d; }
  .dim { font-size: 12px; color: rgba(242, 239, 230, .35); }
}

.rows { max-height: 150px; overflow-y: auto; }

.row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 13px;
  color: rgba(242, 239, 230, .8);
  border-bottom: 1px dashed rgba(255, 255, 255, .08);

  .h { color: #ffd93d; }
}

.sum { display: flex; gap: 14px; margin: 14px 0; padding: 12px 0; border-top: 1px solid rgba(255, 255, 255, .1); border-bottom: 1px solid rgba(255, 255, 255, .1); }

.s-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  font-size: 11px;
  color: rgba(242, 239, 230, .5);

  b { font-size: 15px; color: #f2efe6; }
}

.pay { padding-bottom: 14px; }

.pay-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(242, 239, 230, .75); }

.arrow { color: #3ddc84; }

.amt { margin-left: auto; font-size: 24px; font-weight: 800; color: #ff5f6d; }

.pts { display: flex; gap: 18px; margin-top: 8px; font-size: 12px; color: rgba(242, 239, 230, .5); }

.foot { display: flex; align-items: center; }

.next { font-size: 12px; color: rgba(242, 239, 230, .55); }

.btn {
  margin-left: auto;
  padding: 9px 26px;
  font-size: 14px;
  font-weight: 700;
  color: #10281f;
  cursor: pointer;
  background: linear-gradient(135deg, #ffd93d, #ff9d3d);
  border: none;
  border-radius: 10px;
}
</style>
