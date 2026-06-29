<template>
  <div class="auto-fire-toggle" @click="$emit('update:modelValue', !modelValue)">
    <span class="auto-fire-label">🏹 自动肘击</span>
    <span class="auto-fire-switch" :class="{ on: modelValue }">
      <span class="auto-fire-knob"></span>
    </span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})
defineEmits(['update:modelValue'])
</script>

<style scoped lang="scss">
.auto-fire-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(100, 116, 139, 0.4);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  width: fit-content;

  &:hover {
    border-color: #fbbf24;
  }
}

.auto-fire-label {
  font-size: 12px;
  color: #cbd5e1;
  white-space: nowrap;
}

.auto-fire-switch {
  width: 32px;
  height: 18px;
  border-radius: 9px;
  background: rgba(71, 85, 105, 0.8);
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;

  &.on {
    background: #4ade80;
  }
}

.auto-fire-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f1f5f9;
  transition: transform 0.2s;
}

.auto-fire-switch.on .auto-fire-knob {
  transform: translateX(14px);
}
</style>
