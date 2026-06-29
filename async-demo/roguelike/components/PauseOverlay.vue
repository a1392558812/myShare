<template>
  <div class="pause-overlay">
    <div class="pause-content">
      <div class="pause-icon">⏸</div>
      <div class="pause-title">暂停</div>
      <div class="pause-hint">按空格键继续</div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
.pause-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.pause-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 64px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.85);
  border: 2px solid rgba(100, 116, 139, 0.5);
}

.pause-icon {
  font-size: 48px;
  color: #e2e8f0;
  opacity: 0.9;
}

.pause-title {
  font-size: 32px;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: 8px;
}

.pause-hint {
  font-size: 14px;
  color: #94a3b8;
}
</style>
