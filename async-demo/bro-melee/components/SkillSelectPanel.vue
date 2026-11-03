<template>
  <div class="skill-select">
    <div class="panel">
      <div class="panel-head">
        <div class="panel-title">秘境悟道</div>
        <div class="panel-sub">三本秘籍，择一而修 · 按 1 / 2 / 3 快速选择</div>
      </div>
      <div class="card-list">
        <div
          v-for="(skill, index) in choices"
          :key="skill.id"
          class="card"
          :style="{ '--skill-color': skill.color }"
          @click="choose(skill.id)"
        >
          <div class="card-index">{{ index + 1 }}</div>
          <div class="card-category">{{ categoryLabel[skill.category] }} · {{ skill.type === 'active' ? '主动' : '被动' }}</div>
          <div class="card-icon">{{ skill.icon }}</div>
          <div class="card-name">{{ skill.name }}</div>
          <div class="card-stack">
            <span class="stack-pips">
              <i
                v-for="level in skill.maxStack"
                :key="level"
                class="stack-pip"
                :class="{ 'stack-pip--on': level <= skill.currentStack }"
              ></i>
            </span>
            <span class="stack-text">
              {{ skill.currentStack === 0 ? '首次习得' : `修炼 ${skill.currentStack} → ${skill.currentStack + 1} 层` }}
            </span>
          </div>
          <div class="card-detail">{{ skill.detail }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
  choices: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['choose']);

const categoryLabel = {
  outer: '外功',
  inner: '内功',
  light: '轻功',
};

const choose = (skillId) => {
  emit('choose', skillId);
};

const handleKeyDown = (event) => {
  const index = Number(event.key) - 1;
  if (Number.isInteger(index) && index >= 0 && index < props.choices.length) {
    event.preventDefault();
    choose(props.choices[index].id);
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped lang="scss">
.skill-select {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 6, 4, 0.72);
  backdrop-filter: blur(2px);
  z-index: 20;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.panel {
  padding: 26px 30px 30px;
  background: linear-gradient(160deg, rgba(24, 26, 19, 0.96), rgba(12, 14, 10, 0.98));
  border: 1px solid rgba(198, 168, 108, 0.45);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.6);
}

.panel-head {
  text-align: center;
  margin-bottom: 20px;
}

.panel-title {
  font-size: 22px;
  letter-spacing: 8px;
  color: #ffe9b8;
  text-shadow: 0 0 18px rgba(255, 209, 102, 0.35);
}

.panel-sub {
  margin-top: 6px;
  font-size: 12px;
  letter-spacing: 1px;
  color: rgba(244, 236, 216, 0.45);
}

.card-list {
  display: flex;
  gap: 16px;
}

.card {
  position: relative;
  width: 216px;
  padding: 18px 16px 16px;
  background: rgba(16, 18, 13, 0.9);
  border: 1px solid rgba(198, 168, 108, 0.28);
  border-top: 2px solid var(--skill-color);
  cursor: pointer;
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;

  &:hover {
    transform: translateY(-6px);
    border-color: var(--skill-color);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55), 0 0 0 1px var(--skill-color) inset;
  }
}

.card-index {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 12px;
  color: rgba(244, 236, 216, 0.28);
}

.card-category {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--skill-color);
  opacity: 0.85;
}

.card-icon {
  margin: 12px 0 8px;
  font-size: 34px;
  font-weight: bold;
  color: var(--skill-color);
  text-shadow: 0 0 20px var(--skill-color);
  text-align: center;
}

.card-name {
  font-size: 17px;
  letter-spacing: 3px;
  text-align: center;
  color: #f4ecd8;
}

.card-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin: 10px 0;
}

.stack-pips {
  display: flex;
  gap: 4px;
}

.stack-pip {
  width: 14px;
  height: 3px;
  background: rgba(244, 236, 216, 0.18);

  &--on {
    background: var(--skill-color);
  }
}

.stack-text {
  font-size: 10px;
  color: rgba(244, 236, 216, 0.45);
}

.card-detail {
  font-size: 12px;
  line-height: 1.75;
  color: rgba(244, 236, 216, 0.66);
  min-height: 66px;
}
</style>
