<template>
  <div class="start-panel">
    <div class="title-section">
      <h1 class="game-title">超级马里奥</h1>
      <p class="game-subtitle">蘑菇王国 · 突破障碍 · 拯救碧琪公主</p>
    </div>

    <div class="intro-section">
      <p class="intro-text">
        横向卷轴闯关：踩敌人、顶砖块、钻管道。<br>
        留意紫色隐藏管道 —— 里面藏着金币奖励房。
      </p>

      <div class="feature-grid">
        <div v-for="(item, index) in features" :key="index" class="feature-item">
          <span class="feature-icon">{{ item.icon }}</span>
          <span class="feature-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="level-section">
      <button v-for="(lv, i) in levels" :key="lv.key" class="lv-chip" :class="{ on: picked === i, locked: locked(i) }"
        :disabled="locked(i)" @click="pick(i)">
        <span class="lv-icon">{{ lv.icon }}</span>{{ lv.short }}
      </button>
      <button class="lv-chip endless" :class="{ on: picked === 3, locked: !endlessUnlocked }"
        :disabled="!endlessUnlocked" @click="pick(3)">
        <span class="lv-icon">∞</span>无尽
      </button>
    </div>

    <div class="action-section">
      <button class="btn-primary" @click="onStart">{{ startLabel }}</button>
      <button class="btn-ghost" @click="emit('code')">源码马里奥</button>
      <button class="btn-ghost" @click="emit('docs')">文档马里奥</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  unlocked: { type: Number, default: 0 },
  endlessUnlocked: { type: Boolean, default: false },
})

const emit = defineEmits(['start', 'docs', 'code'])

const features = [
  { icon: '🍄', label: '道具变身' },
  { icon: '🐢', label: '五种敌人' },
  { icon: '🚰', label: '隐藏金币房' },
  { icon: '∞', label: '无尽关卡' },
]

const levels = [
  { key: 'l1', icon: '🍄', short: '1-1' },
  { key: 'l2', icon: '🚰', short: '1-2' },
  { key: 'l3', icon: '☁️', short: '1-3' },
]

const picked = ref(Math.min(props.unlocked, 2))
const locked = (i) => i > props.unlocked
const pick = (i) => { picked.value = i }

const startLabel = computed(() => (picked.value === 3 ? '进入无尽关卡' : `开始 ${levels[picked.value].short}`))

const onStart = () => {
  const i = picked.value
  emit('start', { levelIndex: i === 3 ? 0 : i, mode: i === 3 ? 'endless' : 'story' })
}
</script>

<style scoped lang="scss">
.start-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  overflow: auto;
  padding: 24px;
  background: radial-gradient(900px 520px at 50% 0%, #2a1450 0%, #140a22 55%, #0c0414 100%);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #f4ecff;
}

.title-section {
  text-align: center;
}

.game-title {
  font-size: 42px;
  font-weight: 700;
  letter-spacing: 6px;
  margin: 0;
  color: #fcd800;
  text-shadow: 0 6px 26px rgba(252, 216, 0, 0.28);
}

.game-subtitle {
  font-size: 13px;
  letter-spacing: 3px;
  color: rgba(244, 236, 255, 0.55);
  margin: 10px 0 0;
}

.intro-section {
  text-align: center;
  max-width: 480px;
}

.intro-text {
  font-size: 14px;
  line-height: 1.8;
  color: rgba(244, 236, 255, 0.78);
  margin: 0 0 22px;
}

.feature-grid {
  display: flex;
  gap: 22px;
  justify-content: center;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.feature-icon {
  font-size: 26px;
}

.feature-label {
  font-size: 12px;
  color: rgba(244, 236, 255, 0.5);
}

.level-section {
  display: flex;
  gap: 10px;
}

.lv-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  font-size: 13px;
  font-family: inherit;
  border: 1px solid rgba(252, 216, 0, 0.28);
  border-radius: 8px;
  background: transparent;
  color: rgba(244, 236, 255, 0.72);
  cursor: pointer;
  transition: all 0.2s;

  .lv-icon {
    font-size: 15px;
  }

  &:hover:not(:disabled) {
    border-color: #fcd800;
    color: #f4ecff;
    background: rgba(252, 216, 0, 0.1);
  }

  &.on {
    border-color: #fcd800;
    color: #fcd800;
    background: rgba(252, 216, 0, 0.16);
  }

  &.locked {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &.endless.on {
    border-color: #7cff9c;
    color: #7cff9c;
    background: rgba(124, 255, 156, 0.14);
  }

  &.endless:hover:not(:disabled) {
    border-color: #7cff9c;
  }
}

.action-section {
  display: flex;
  gap: 14px;
}

.btn-primary,
.btn-ghost {
  padding: 12px 26px;
  font-size: 14px;
  font-family: inherit;
  letter-spacing: 2px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s;
}

.btn-primary {
  border: 1px solid #e52521;
  background: #e52521;
  color: #fff;

  &:hover {
    background: #ff4a44;
    border-color: #ff4a44;
  }
}

.btn-ghost {
  border: 1px solid rgba(252, 216, 0, 0.35);
  background: transparent;
  color: #fcd800;

  &:hover {
    background: rgba(252, 216, 0, 0.12);
  }
}
</style>
