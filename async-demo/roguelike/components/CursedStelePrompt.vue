<template>
  <div class="stele-overlay" @click.stop>
    <div class="stele-prompt">
      <div class="stele-icon">⚠️</div>
      <div class="stele-title">诅咒石碑</div>
      <div class="stele-desc">
        <div class="risk">⚡ 敌人强度 <span class="highlight">+30%</span></div>
        <div class="reward">📦 掉落率 <span class="highlight">×2.5</span></div>
        <div class="duration">⏱ 持续 60 秒</div>
      </div>
      <div class="stele-actions">
        <button class="btn-activate" @click="$emit('activate')">激活 (F)</button>
        <button class="btn-cancel" @click="$emit('cancel')">忽略</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['activate', 'cancel'])
</script>

<style scoped>
.stele-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  background: rgba(0, 0, 0, 0.4);
}

.stele-prompt {
  background: linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(88, 28, 135, 0.95));
  border: 2px solid #7c3aed;
  border-radius: 16px;
  padding: 28px 36px;
  text-align: center;
  max-width: 320px;
  box-shadow: 0 0 40px rgba(124, 58, 237, 0.4);
  animation: steleIn 0.3s ease-out;
}

.stele-icon { font-size: 48px; margin-bottom: 8px; }

.stele-title {
  font-size: 22px;
  font-weight: 700;
  color: #c4b5fd;
  margin-bottom: 16px;
}

.stele-desc {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 15px;
  color: #e2e8f0;
}

.risk { color: #fca5a5; }
.reward { color: #fcd34d; }
.duration { color: #a5b4fc; }
.highlight { font-weight: 700; }

.stele-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-activate {
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-activate:hover {
  background: #8b5cf6;
  box-shadow: 0 0 12px rgba(124, 58, 237, 0.6);
}

.btn-cancel {
  background: transparent;
  color: #94a3b8;
  border: 1px solid #475569;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover {
  color: #e2e8f0;
  border-color: #64748b;
}

@keyframes steleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>