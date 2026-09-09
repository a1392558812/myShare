<template>
  <div class="start-panel">
    <h1 class="title">塔防 · 节奏战线</h1>
    <div class="subtitle">Tower Defense · Wave &amp; Block</div>

    <div class="rules">
      <p>两条 S 形路径上不断涌来步兵、飞龙、幽影，每 5 波一只 Boss。</p>
      <p>建造 5 种塔守卫路径、用 WASD 移动英雄、英雄站上路径 <b>可阻挡敌人</b>。</p>
      <div class="key-line">
        <span class="key">A / S / D / W</span><span>移动</span>
        <span class="key">点击</span><span>建造 / 选塔</span>
        <span class="key">右键</span><span>取消 / 出售</span>
      </div>
      <div class="key-line">
        <span class="key">1 ~ 5</span><span>选塔</span>
        <span class="key">M / U / X</span><span>移动 / 升级 / 出售</span>
        <span class="key">Space</span><span>暂停</span>
        <span class="key">R</span><span>重开</span>
      </div>
      <p class="warn">漏怪 ≥ 20 即失败；守护住最后 30 波，进入无尽模式！</p>
    </div>

    <button class="btn" @click="$emit('start')">入坑</button>
    <div class="btn-row">
      <button class="btn-sub" @click="$emit('docs')">设计文档</button>
      <button class="btn-sub" @click="$emit('code')">查看源码</button>
      <button class="btn-sub" @click="$emit('units')">单位图鉴</button>
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
  font-family: 'Menlo', 'Consolas', 'Roboto Mono', monospace;
  padding: 0 24px;
  box-sizing: border-box;
}

.title {
  font-size: 38px;
  letter-spacing: 8px;
  color: #3ee6d8;
  margin: 0;
}

.subtitle {
  margin-top: 8px;
  font-size: 13px;
  letter-spacing: 4px;
  color: #1b7f8a;
}

.rules {
  margin-top: 32px;
  font-size: 14px;
  line-height: 2;
  color: #8899aa;
  max-width: 720px;

  b {
    color: #fbbf24;
  }
}

.key-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 6px 0;

  span {
    margin: 0 2px;
  }
}

.key {
  padding: 2px 10px;
  color: #3ee6d8;
  border: 1px solid #1b7f8a;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.warn {
  color: #ff3b4d;
}

.btn {
  margin-top: 36px;
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
