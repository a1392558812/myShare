<template>
  <div class="encounter">
    <div v-if="encounter" class="panel" :style="{ '--tone': encounter.color }">
      <div class="head">
        <div class="category">{{ encounter.categoryName }}</div>
        <div class="title">
          <span class="title-icon">{{ encounter.icon }}</span>
          <span>{{ encounter.name }}</span>
        </div>
        <div class="hook">{{ encounter.hook }}</div>
      </div>
      <div class="choices">
        <button
          v-for="(choice, index) in encounter.choices"
          :key="choice.id"
          class="choice"
          :class="`choice--${choice.tone}`"
          type="button"
          @click="$emit('choose', choice.id)"
        >
          <span class="choice-index">{{ index + 1 }}</span>
          <span class="choice-body">
            <span class="choice-label">{{ choice.label }}</span>
            <span class="choice-hint">{{ choice.hint }}</span>
          </span>
        </button>
      </div>
      <div class="foot">按 1 / 2 / 3 快速抉择 · Esc 转身离开</div>
    </div>

    <div v-else-if="result" class="panel panel--result">
      <div class="result-title" :style="{ color: result.color }">{{ result.title }}</div>
      <div class="result-lines">
        <p v-for="(line, index) in result.lines" :key="index" :style="index === 0 ? { color: '#f4ecd8' } : null">{{ line }}</p>
      </div>
      <button class="continue" type="button" @click="$emit('close')">继续上路</button>
      <div class="foot">按 空格 / 回车 继续</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  encounter: {
    type: Object,
    default: null,
  },
  result: {
    type: Object,
    default: null,
  },
});

defineEmits(['choose', 'close']);
</script>

<style scoped lang="scss">
.encounter {
  position: absolute;
  inset: 0;
  z-index: 22;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 6, 4, 0.72);
  backdrop-filter: blur(2px);
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.panel {
  width: 480px;
  padding: 26px 30px 20px;
  background: linear-gradient(160deg, rgba(24, 26, 19, 0.97), rgba(11, 13, 9, 0.99));
  border: 1px solid rgba(198, 168, 108, 0.42);
  border-top: 2px solid var(--tone, #ffd166);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.65);
  animation: panel-in 0.2s ease-out;
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.head {
  text-align: center;
}

.category {
  display: inline-block;
  padding: 2px 10px;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--tone);
  border: 1px solid currentColor;
  border-radius: 2px;
  opacity: 0.9;
}

.title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 10px 0 8px;
  font-size: 22px;
  letter-spacing: 4px;
  color: #ffe9b8;
  text-shadow: 0 0 20px rgba(255, 209, 102, 0.28);
}

.title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 15px;
  color: var(--tone);
  border: 1px solid var(--tone);
  border-radius: 50%;
  letter-spacing: 0;
}

.hook {
  font-size: 13px;
  line-height: 1.9;
  color: rgba(244, 236, 216, 0.66);
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0 12px;
}

.choice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  text-align: left;
  background: rgba(16, 18, 13, 0.92);
  border: 1px solid rgba(198, 168, 108, 0.24);
  border-left: 2px solid rgba(198, 168, 108, 0.5);
  cursor: pointer;
  transition: transform 0.14s ease, border-color 0.14s ease, background 0.14s ease;
  font-family: inherit;

  &:hover {
    transform: translateX(4px);
    border-color: var(--tone);
    background: rgba(28, 31, 22, 0.96);
  }
}

.choice--risk {
  border-left-color: #e05545;

  &:hover {
    border-color: #e05545;
  }
}

.choice--alt {
  border-left-color: #8fd0ff;

  &:hover {
    border-color: #8fd0ff;
  }
}

.choice-index {
  flex: 0 0 auto;
  width: 18px;
  font-size: 13px;
  color: rgba(244, 236, 216, 0.34);
}

.choice-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.choice-label {
  font-size: 14px;
  letter-spacing: 1px;
  color: #f4ecd8;
}

.choice-hint {
  font-size: 11.5px;
  line-height: 1.7;
  color: rgba(244, 236, 216, 0.5);
}

.foot {
  text-align: center;
  font-size: 11px;
  letter-spacing: 1px;
  color: rgba(198, 168, 108, 0.5);
}

.panel--result {
  width: 440px;
  text-align: center;
  border-top-color: rgba(198, 168, 108, 0.5);
}

.result-title {
  font-size: 21px;
  letter-spacing: 5px;
}

.result-lines {
  margin: 16px 0 22px;

  p {
    margin: 6px 0;
    font-size: 13px;
    line-height: 1.9;
    color: rgba(244, 236, 216, 0.6);
  }
}

.continue {
  padding: 9px 30px;
  font-size: 14px;
  letter-spacing: 2px;
  color: #1a1508;
  background: #ffd166;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background: #ffe09a;
  }
}
</style>
