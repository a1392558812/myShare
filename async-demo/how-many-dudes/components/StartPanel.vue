<template>
  <div class="start-panel">
    <div class="title-section">
      <h1 class="game-title">多少兄弟</h1>
      <p class="game-subtitle">肉鸽自走棋 · 自动战斗 · 羁绊构筑</p>
    </div>

    <div class="intro-section">
      <p class="intro-text">
        招募你的兄弟军团，搭配羁绊与遗物，迎战从熊孩子到神明的荒谬敌人。<br>
        战斗自动进行 —— 你的任务是策略，不是操作。
      </p>

      <div class="feature-grid">
        <div class="feature-item" v-for="(item, index) in [
          { icon: '🐮', label: '多种兄弟' },
          { icon: '🍺', label: '很大羁绊' },
          { icon: '🌶', label: '多件遗物' },
          { icon: '🍋', label: '无尽回合' }
        ]" :key="index">
          <span class="feature-icon">{{ item.icon }}</span>
          <span class="feature-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="action-section">
      <button v-for="(item, index) in [
        { label: '招募兄弟', emitEvent: 'start' },
        { label: '源码兄弟', emitEvent: 'code' },
        { label: '文档兄弟', emitEvent: 'docs' },
      ]" :key="index" class="btn-primary" @click="$emit(item.emitEvent)">{{ item.label }}</button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start', 'code', 'docs']);
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.start-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  background: #0f0f1a;
  color: #e2e8f0;
}

.title-section {
  text-align: center;
}

.game-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0;
  color: #afff2f;
  background-clip: text;
}

.game-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 8px 0 0;
}

.intro-section {
  text-align: center;
  max-width: 480px;
}

.intro-text {
  font-size: 14px;
  line-height: 1.8;
  color: #cbd5e1;
  margin: 0 0 20px;
}

.feature-grid {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.feature-icon {
  font-size: 28px;
}

.feature-label {
  font-size: 12px;
  color: #94a3b8;
}

.action-section {
  display: flex;
  gap: 16px;
}

.btn-primary {
  padding: 12px 24px;
  font-size: 14px;
  border: 1px solid #475569;
  border-radius: 8px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
}
</style>
