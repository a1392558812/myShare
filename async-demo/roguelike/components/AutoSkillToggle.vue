<template>
  <div class="auto-skill-toggle" @click="$emit('update:modelValue', !modelValue)">
    <span class="auto-skill-label">{{ icon }} {{ label }}</span>
    <span class="auto-skill-switch" :class="{ on: modelValue }">
      <span class="auto-skill-knob"></span>
    </span>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  icon: { type: String, default: '' },
  modelValue: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<style scoped lang="scss">
.auto-skill-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(30, 41, 59, 0.75);
  border: 1px solid rgba(100, 116, 139, 0.25);
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;

  &:hover {
    border-color: #fbbf24;
    background: rgba(30, 41, 59, 0.95);
  }
}

.auto-skill-label {
  font-size: 11px;
  color: #cbd5e1;
  white-space: nowrap;
}

.auto-skill-switch {
  width: 28px;
  height: 16px;
  border-radius: 8px;
  background: rgba(71, 85, 105, 0.8);
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;

  &.on {
    background: #4ade80;
  }
}

.auto-skill-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #f1f5f9;
  transition: transform 0.2s;
}

.auto-skill-switch.on .auto-skill-knob {
  transform: translateX(12px);
}
</style>
