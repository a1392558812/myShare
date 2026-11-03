<template>
  <div class="panel">
    <div class="tag">双升 · 拖拉机</div>
    <div class="sub">四人两队，两副牌 108 张。抢分升级</div>
    <div class="sub">你和「对家」是一队，左右两家是另一队。</div>
    <div class="sub">庄家扣底 8 张，闲家抢满 80 分即上台。</div>
    <div class="sub">单张、对子、连对（拖拉机）、甩牌，主牌最大。</div>

    <div class="second-row">
      <button class="primary" @click="$emit('start')">开始对局</button>
      <button class="primary" @click="$emit('watch')">托管观战</button>
      <button class="primary" @click="$emit('rules')">游戏规则</button>
      <button class="primary" @click="$emit('docs')">技术文档</button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start', 'watch', 'rules', 'docs'])
</script>

<style scoped lang="scss">
.panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  background: #47474729;

  .tag {
    margin: 0 auto;
    font-size: 28px;
    letter-spacing: 4px;
    color: #fff;
  }

  .sub {
    margin: 0 auto;
    font-size: 13px;
    line-height: 1.9;
    color: #fff;
  }

  .second-row {
    display: flex;
    gap: 10px;
  }
}

.primary {
  padding: 9px 22px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  background: rgba(255, 255, 255, .05);
  border: 1px solid #fff;
  border-radius: 999px;
  transition: all .15s;

  &:hover {
    background: rgba(255, 255, 255, .1);
  }
}
</style>
