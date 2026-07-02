<template>
  <div class="auto-skill-panel">
    <div class="panel-header" @click="expanded = !expanded">
      <span class="header-icon">&#9881;</span>
      <span class="header-text">Auto</span>
      <span class="header-arrow" :class="{ open: expanded }">&#9660;</span>
    </div>
    <div v-if="expanded" class="panel-body">
      <AutoSkillToggle v-for="(item, index) in [
        { label: '自动肘击', icon: '&#127993;', key: 'arrow', value: arrow },
        { label: '自动冰冻', icon: '&#10052;', key: 'freeze', value: freeze },
        { label: '自动无敌', icon: '&#9889;', key: 'invincible', value: invincible },
        { label: '自动魔法阵', icon: '&#128293;', key: 'magicCircle', value: magicCircle },
        { label: '自动冲刺', icon: '&#128168;', key: 'dash', value: dash }
      ]" :key="index" :label="item.label" :icon="item.icon" :modelValue="item.value"
        @update:modelValue="$emit('update:' + item.key, $event)" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AutoSkillToggle from './AutoSkillToggle.vue'

defineProps({
  arrow: { type: Boolean, default: false },
  freeze: { type: Boolean, default: false },
  invincible: { type: Boolean, default: false },
  magicCircle: { type: Boolean, default: false },
  dash: { type: Boolean, default: false },
})
defineEmits(['update:arrow', 'update:freeze', 'update:invincible', 'update:magicCircle', 'update:dash'])

const expanded = ref(false)
</script>

<style scoped lang="scss">
.auto-skill-panel {
  width: fit-content;
  min-width: 155px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(100, 116, 139, 0.4);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;

  &:hover {
    border-color: #fbbf24;
  }

  &.has-active {
    border-color: rgba(74, 222, 128, 0.5);
  }
}

.header-icon {
  font-size: 12px;
  color: #94a3b8;
}

.header-text {
  font-size: 12px;
  color: #cbd5e1;
  font-weight: 500;
}

.header-arrow {
  font-size: 9px;
  color: #64748b;
  margin-left: auto;
  transition: transform 0.2s;

  &.open {
    transform: rotate(180deg);
  }
}

.panel-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 4px;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid rgba(100, 116, 139, 0.3);
}
</style>
