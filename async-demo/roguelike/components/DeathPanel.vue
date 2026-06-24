<template>
  <div class="death-overlay">
    <div class="death-panel">
      <h2>你倒下了</h2>
      <p>存活 {{ formatTime(gameTime) }} | 击杀 {{ killCount }} | Lv.{{ playerLevel }}</p>
      <button class="restart-btn" @click="$emit('restart')">重新开始</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  gameTime: { type: Number, required: true },
  killCount: { type: Number, required: true },
  playerLevel: { type: Number, required: true },
  formatTime: { type: Function, required: true },
})

defineEmits(['restart'])
</script>

<style scoped lang="scss">
.death-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.9);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.death-panel {
  background: #1e293b;
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 32px 40px;
  color: #e2e8f0;
  text-align: center;

  h2 {
    color: #ef4444;
    font-size: 28px;
    margin: 0 0 12px;
  }

  p {
    color: #94a3b8;
    font-size: 16px;
    margin: 0 0 24px;
  }
}

.restart-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #dc2626;
  }
}
</style>
