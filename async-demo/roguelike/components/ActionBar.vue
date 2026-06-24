<template>
  <div class="action-bar">
    <div
      v-for="sk in skills"
      :key="sk.id"
      class="skill-slot"
      :class="{ 'skill-cooldown': sk.remainingCooldown > 0, 'skill-active': sk.active }"
      @click="$emit('skill-click', sk)"
    >
      <span class="skill-icon">{{ sk.icon }}</span>
      <span class="skill-level">Lv{{ sk.currentLevel }}</span>
      <span v-if="sk.remainingCooldown > 0" class="skill-cd-text">
        {{ Math.ceil(sk.remainingCooldown / 1000) }}s
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  skills: { type: Array, required: true },
})

defineEmits(['skill-click'])
</script>

<style scoped lang="scss">
.action-bar {
  display: flex;
  gap: 6px;
}

.skill-slot {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid rgba(100, 116, 139, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    border-color: #fbbf24;
    background: rgba(50, 61, 79, 0.9);
  }

  &.skill-cooldown {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: rgba(100, 116, 139, 0.3);
  }

  &.skill-active {
    border-color: #dc2626;
    box-shadow: 0 0 8px rgba(220, 38, 38, 0.4);
  }

  .skill-icon {
    font-size: 20px;
  }

  .skill-level {
    font-size: 9px;
    color: #94a3b8;
  }

  .skill-cd-text {
    position: absolute;
    bottom: 2px;
    font-size: 10px;
    color: #fbbf24;
    font-weight: 600;
  }
}
</style>
