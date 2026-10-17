<template>
  <div class="mask">
    <div class="box">
      <div class="title">流局 · {{ result.reason }}</div>

      <div class="tenpai">
        <div class="t-row" v-for="(t, i) in result.tenpai" :key="i">
          <span class="n">{{ i === 0 ? '你' : 'AI' }}</span>
          <span class="s" :class="{ on: t }">{{ t ? '听牌' : '未听牌' }}</span>
        </div>
      </div>

      <div v-if="result.payments.length" class="pay">
        <span>{{ result.payments[0].from === 0 ? '你' : 'AI' }}</span>
        <span class="arrow">→</span>
        <span>{{ result.payments[0].to === 0 ? '你' : 'AI' }}</span>
        <b class="amt">{{ result.payments[0].amount }} 点</b>
        <span class="why">不听罚符</span>
      </div>
      <div v-else class="pay none">双方同听 / 同不听，不结算罚符</div>

      <div class="pts">
        <span>你 {{ points[0] }}</span>
        <span>AI {{ points[1] }}</span>
      </div>

      <div class="foot">
        <span class="next">{{ result.dealerRepeat ? '庄家听牌 · 连庄' : '轮庄' }}</span>
        <button class="btn" @click="$emit('confirm')">继续</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  result: { type: Object, required: true },
  points: { type: Array, required: true },
})
defineEmits(['confirm'])
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
  width: 380px;
  padding: 22px 24px;
  background: linear-gradient(160deg, #16493a, #0a2a20);
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .55);
}

.title { font-size: 20px; font-weight: 800; color: #f2efe6; }

.tenpai { margin: 16px 0; }

.t-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, .08);

  .n { font-size: 13px; color: rgba(242, 239, 230, .6); }

  .s {
    padding: 2px 9px;
    font-size: 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, .08);
    color: rgba(242, 239, 230, .5);

    &.on { background: rgba(61, 220, 132, .18); color: #3ddc84; }
  }
}

.pay {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(242, 239, 230, .75);

  &.none { font-size: 12px; color: rgba(242, 239, 230, .45); }
}

.arrow { color: #3ddc84; }

.amt { margin-left: auto; font-size: 22px; font-weight: 800; color: #ff5f6d; }

.why { font-size: 11px; color: rgba(242, 239, 230, .4); }

.pts { display: flex; gap: 18px; margin: 14px 0; font-size: 12px; color: rgba(242, 239, 230, .5); }

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
