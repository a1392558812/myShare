<template>
  <transition name="warn-fade">
    <div v-if="isVisible" class="boss-warning-overlay" :class="{ 'pulse-red': pulsing }">
      <div class="warning-content">
        <div class="warning-icon">&#x26A0;&#xFE0F;</div>
        <div class="warning-text">强大的敌人正在接近...</div>
        <div class="warning-sub">{{ bossName }}</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  isWarning: { type: Boolean, default: false },
  bossName: { type: String, default: '' },
})

const pulsing = ref(true)

watch(() => props.isWarning, (val) => {
  if (val) pulsing.value = true
  else pulsing.value = false
})

const isVisible = computed(() => props.isWarning)
</script>

<style scoped>
.boss-warning-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.pulse-red {
  animation: edgePulse 0.5s ease-in-out 4;
}

@keyframes edgePulse {
  0%, 100% {
    box-shadow: inset 0 0 0 rgba(239, 68, 68, 0);
  }
  50% {
    box-shadow: inset 0 0 80px rgba(239, 68, 68, 0.35);
  }
}

.warning-content {
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 32px 48px;
  border-radius: 16px;
  border: 2px solid rgba(239, 68, 68, 0.5);
  backdrop-filter: blur(8px);
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: shake 0.3s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.warning-text {
  font-size: 24px;
  font-weight: 700;
  color: #ef4444;
  text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
  letter-spacing: 3px;
}

.warning-sub {
  margin-top: 8px;
  font-size: 16px;
  color: #fbbf24;
}

.warn-fade-enter-active {
  transition: opacity 0.4s ease;
}
.warn-fade-leave-active {
  transition: opacity 0.6s ease;
}
.warn-fade-enter-from,
.warn-fade-leave-to {
  opacity: 0;
}
</style>
