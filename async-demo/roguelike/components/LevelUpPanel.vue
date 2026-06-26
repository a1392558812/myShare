<template>
  <div class="level-up-overlay">
    <div class="level-up-panel">
      <h2>升级！ Lv.{{ player.level }}</h2>
      <p>选择一个技能加入或升级：</p>
      <div class="level-up-options">
        <div
          v-for="opt in options"
          :key="opt.id + (opt.isNew ? 'new' : 'up')"
          class="level-up-option"
          @click="$emit('choice', opt)"
        >
          <span class="opt-icon">{{ opt.icon }}</span>
          <span class="opt-name">{{ opt.name }}</span>
          <span class="opt-desc">{{ opt.description }}</span>
          <span class="opt-level">{{
            opt.isNew ? "新技能" : `Lv${opt.nextLevel}`
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  player: { type: Object, required: true },
  options: { type: Array, required: true },
});

defineEmits(["choice"]);
</script>

<style scoped lang="scss">
.level-up-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  z-index: 250;
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-up-panel {
  background: #1e293b;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 24px 32px;
  min-width: 400px;
  color: #e2e8f0;

  h2 {
    color: #fbbf24;
    font-size: 22px;
    margin: 0 0 8px;
  }

  p {
    color: #94a3b8;
    font-size: 14px;
    margin: 0 0 16px;
  }
}

.level-up-options {
  display: flex;
  gap: 12px;
}

.level-up-option {
  width: 120px;
  padding: 16px 12px;
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.8);
  border: 2px solid rgba(100, 116, 139, 0.5);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;

  &:hover {
    border-color: #fbbf24;
    background: rgba(50, 61, 79, 0.9);
    transform: translateY(-2px);
  }

  .opt-icon {
    font-size: 28px;
  }
  .opt-name {
    font-size: 14px;
    font-weight: 600;
    color: #e2e8f0;
  }
  .opt-desc {
    font-size: 11px;
    color: #94a3b8;
  }
  .opt-level {
    font-size: 12px;
    color: #fbbf24;
    font-weight: 600;
  }
}
</style>
</template>