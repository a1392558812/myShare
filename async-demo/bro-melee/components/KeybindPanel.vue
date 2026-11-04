<template>
  <div class="keybind-overlay" @mousedown.self.prevent="$emit('close')">
    <div class="keybind-panel">
      <div class="panel-head">
        <div class="panel-title">键位设置</div>
        <button class="close-btn" type="button" @click="$emit('close')">×</button>
      </div>
      <div class="panel-hint">
        点击技能右侧的按键框，再按下一个键即完成绑定；同一按键只归一本秘籍，冲突的会被让回默认位。
      </div>
      <div class="bind-list">
        <div v-for="skill in skills" :key="skill.id" class="bind-row">
          <span class="bind-icon" :style="{ color: skill.color, borderColor: skill.color }">{{ skill.icon }}</span>
          <span class="bind-name">{{ skill.name }}<em v-if="skill.stack > 1" class="bind-stack"> ×{{ skill.stack }}</em></span>
          <button
            class="bind-key"
            :class="{ 'bind-key--listening': awaiting === skill.id }"
            type="button"
            @click="$emit('await', skill.id)"
          >
            {{ awaiting === skill.id ? '按任意键…' : displayOf(skill.id, skill.slot) }}
          </button>
          <button v-if="keybinds[skill.id]" class="bind-clear" type="button" title="恢复默认" @click="$emit('clear', skill.id)">↺</button>
        </div>
        <div v-if="!skills.length" class="bind-empty">还没学会任何外功，先去闯荡江湖吧。</div>
      </div>
      <div class="panel-foot">
        <button class="foot-btn" type="button" @click="$emit('reset')">全部恢复默认</button>
        <button class="foot-btn foot-btn--primary" type="button" @click="$emit('close')">完成</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  skills: { type: Array, default: () => [] },
  keybinds: { type: Object, default: () => ({}) },
  awaiting: { type: String, default: '' },
  displayOf: { type: Function, required: true },
});

defineEmits(['close', 'await', 'clear', 'reset']);
</script>

<style scoped lang="scss">
.keybind-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 8, 6, 0.72);
}

.keybind-panel {
  width: 400px;
  max-height: 76vh;
  display: flex;
  flex-direction: column;
  padding: 16px 18px;
  background: rgba(14, 16, 13, 0.96);
  border: 1px solid rgba(198, 168, 108, 0.5);
  border-radius: 6px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.55);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 16px;
  font-weight: bold;
  color: #f4ecd8;
  letter-spacing: 2px;
}

.close-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  background: transparent;
  border: 1px solid rgba(198, 168, 108, 0.4);
  border-radius: 3px;
  color: rgba(244, 236, 216, 0.7);
  font-size: 15px;
  cursor: pointer;

  &:hover {
    color: #f4ecd8;
    border-color: rgba(198, 168, 108, 0.8);
  }
}

.panel-hint {
  margin: 8px 0 10px;
  color: rgba(244, 236, 216, 0.55);
  font-size: 11px;
  line-height: 1.6;
}

.bind-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 4px;
}

.bind-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
}

.bind-icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  border-radius: 3px;
  font-weight: bold;
  font-size: 13px;
}

.bind-name {
  flex: 1;
  color: rgba(244, 236, 216, 0.88);
  font-size: 13px;

  .bind-stack {
    font-style: normal;
    color: rgba(244, 236, 216, 0.5);
    font-size: 11px;
  }
}

.bind-key {
  min-width: 64px;
  height: 26px;
  padding: 0 10px;
  background: rgba(10, 12, 9, 0.8);
  border: 1px solid rgba(142, 240, 213, 0.4);
  border-radius: 3px;
  color: #8ef0d5;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.14s ease;

  &:hover {
    border-color: #8ef0d5;
  }

  &--listening {
    border-color: #ffd166;
    color: #ffd166;
    animation: bind-blink 0.9s ease-in-out infinite;
  }
}

@keyframes bind-blink {
  50% {
    opacity: 0.45;
  }
}

.bind-clear {
  width: 26px;
  height: 26px;
  padding: 0;
  background: transparent;
  border: 1px solid rgba(255, 138, 102, 0.4);
  border-radius: 3px;
  color: rgba(255, 138, 102, 0.85);
  cursor: pointer;

  &:hover {
    border-color: #ff8a66;
  }
}

.bind-empty {
  padding: 22px 0;
  text-align: center;
  color: rgba(244, 236, 216, 0.4);
  font-size: 12px;
}

.panel-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.foot-btn {
  height: 30px;
  padding: 0 14px;
  background: transparent;
  border: 1px solid rgba(198, 168, 108, 0.45);
  border-radius: 3px;
  color: rgba(244, 236, 216, 0.75);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    color: #f4ecd8;
    border-color: rgba(198, 168, 108, 0.85);
  }

  &--primary {
    background: rgba(142, 240, 213, 0.14);
    border-color: rgba(142, 240, 213, 0.55);
    color: #8ef0d5;
  }
}
</style>
