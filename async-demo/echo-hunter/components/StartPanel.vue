<template>
  <div class="start-panel">
    <h1 class="title">回声迷踪</h1>
    <div class="subtitle">Echo Hunter</div>

    <div class="rules">
      <p>你是一只困在深海洞穴的巨鲸，四周一片漆黑。</p>
      <p>唯一的光源，是你发出的声呐脉冲。</p>
      <div class="key-line">
        <span class="key">移动鼠标</span><span>游动</span>
        <span class="key">按住左键</span><span>发射声呐</span>
      </div>
      <div class="key-line">
        <span class="key">右键</span><span>冲刺躲避</span>
        <span class="key">主动声呐</span><span>重置恐惧倒计时</span>
      </div>
      <p class="warn">长时间不主动发声，恐惧会吞没你的生命。</p>
      <p>收集全部磷虾，游进最深处的出口漩涡。</p>
    </div>

    <button class="btn" @click="$emit('start')">潜入深海</button>
    <div class="btn-row">
      <button class="btn-sub" @click="$emit('docs')">需求文档</button>
      <button class="btn-sub" @click="$emit('code')">查看源码</button>
      <button class="btn-sub" @click="$emit('units')">生物图鉴</button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start', 'docs', 'code', 'units']);
</script>

<style scoped lang="scss">
.start-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #020409;
  color: #eaf6ff;
  text-align: center;
}

.title {
  font-size: 42px;
  letter-spacing: 8px;
  color: #3ee6d8;
  margin: 0;
}

.subtitle {
  margin-top: 8px;
  font-size: 14px;
  letter-spacing: 4px;
  color: #1b7f8a;
}

.rules {
  margin-top: 36px;
  font-size: 15px;
  line-height: 2;
  color: #8899aa;
}

.key-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.key {
  padding: 2px 10px;
  color: #3ee6d8;
  border: 1px solid #1b7f8a;
  border-radius: 4px;
  font-size: 13px;
}

.warn {
  color: #ff3b4d;
}

.btn {
  margin-top: 40px;
  padding: 12px 40px;
  font-size: 16px;
  letter-spacing: 4px;
  color: #020409;
  background: #3ee6d8;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #7df3ff;
  }
}

.btn-row {
  margin-top: 16px;
  display: flex;
  gap: 14px;
}

.btn-sub {
  padding: 8px 22px;
  font-size: 13px;
  letter-spacing: 2px;
  color: #1b7f8a;
  background: transparent;
  border: 1px solid #1b7f8a;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    color: #7df3ff;
    border-color: #3ee6d8;
  }
}
</style>
