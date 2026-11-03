<template>
  <div class="start-panel">
    <div class="title-block">
      <div class="title">兄弟大乱斗</div>
      <div class="tagline">是兄弟就砍我 —— 无限江湖，人人皆敌，杀一人吞一级。</div>
    </div>

    <div class="content">
      <div class="column">
        <div class="column-title">操作</div>
        <div class="key-row"><span class="key">W A S D</span><span class="key-desc">移动，方向键同样可用</span></div>
        <div class="key-row"><span class="key">鼠标</span><span class="key-desc">瞄准，左键或 J 普攻</span></div>
        <div class="key-row"><span class="key">空格 / 右键</span><span class="key-desc">闪避冲刺，短暂无敌</span></div>
        <div class="key-row"><span class="key">1 - 5</span><span class="key-desc">释放已学的外功</span></div>
      </div>

      <div class="column">
        <div class="column-title">江湖规矩</div>
        <div class="rule">击败敌人可吞噬其修为，等级越高收益越大。</div>
        <div class="rule">每升 5 级，从三本秘籍中择一：外功、内功、轻功。</div>
        <div class="rule">敌人也会互相厮杀、抢经验书、残血逃命。</div>
        <div class="rule">刷新的敌人等级随你浮动，永远有人比你强，也永远有人给你打。</div>
      </div>
    </div>

    <div class="button-row">
      <button class="ghost-btn" @click="$emit('start')">踏入江湖</button>
      <button class="ghost-btn" @click="$emit('gallery')">角色图鉴</button>
      <button class="ghost-btn" @click="$emit('docs')">需求文档</button>
      <button class="ghost-btn" @click="$emit('code')">查看源码</button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start', 'docs', 'code', 'gallery']);
</script>

<style scoped lang="scss">
.start-panel {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #191b11;
  color: #f4ecd8;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.title-block {
  text-align: center;
  z-index: 1;
}

.title {
  font-size: 46px;
  letter-spacing: 14px;
  text-indent: 14px;
  color: #ffe9b8;
  text-shadow: 0 0 34px rgba(255, 209, 102, 0.35);
}

.tagline {
  margin-top: 18px;
  font-size: 14px;
  letter-spacing: 2px;
  color: rgba(244, 236, 216, 0.55);
}

.content {
  display: flex;
  gap: 56px;
  margin-top: 44px;
  z-index: 1;
}

.column {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.column-title {
  font-size: 12px;
  letter-spacing: 6px;
  color: #c6a86c;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(198, 168, 108, 0.25);
}

.key-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.key {
  min-width: 92px;
  padding: 3px 8px;
  text-align: center;
  font-size: 11px;
  color: #8ef0d5;
  border: 1px solid rgba(142, 240, 213, 0.35);
  border-radius: 2px;
}

.key-desc {
  color: rgba(244, 236, 216, 0.55);
}

.rule {
  font-size: 12px;
  line-height: 1.85;
  color: rgba(244, 236, 216, 0.55);
  padding-left: 10px;
  border-left: 2px solid rgba(224, 85, 69, 0.4);
}

.button-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  z-index: 1;
}

.ghost-btn {
  padding: 7px 20px;
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(198, 168, 108, 0.75);
  background: transparent;
  border: 1px solid rgba(198, 168, 108, 0.3);
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    color: #ffe9b8;
    border-color: rgba(198, 168, 108, 0.7);
  }
}
</style>
