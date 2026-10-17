<template>
  <div class="home">
    <div class="logo">
      <div class="emoji-row">
        <span>🐶</span><span>🦊</span><span>🐭</span><span>🐹</span><span>🐼</span>
      </div>
      <h1>开心消消乐</h1>
      <p class="sub">交换相邻方块 · 凑三连 · 连锁翻倍</p>
    </div>

    <div class="actions">
      <button class="btn" @click="$emit('start')">开始游戏</button>
      <button class="btn" @click="$emit('endless')">
        无尽模式
        <div v-if="best && best.stage">最高 {{ best.stage }} 层 · {{ best.score }} 分</div>
        <div v-else>层层闯关 · 难度递增</div>
      </button>
      <button class="btn" @click="$emit('docs')">设计文档</button>
      <button class="btn ghost" :class="{ off: !sfxOn }" @click="toggleSfx">
        音效 {{ sfxOn ? '开' : '关' }}
      </button>
    </div>

    <div class="tips">
      <span>点击相邻两块交换</span>
      <span>·</span>
      <span>也可以按住拖动</span>
      <span>·</span>
      <span>Esc 暂停</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { setSfxEnabled, isSfxEnabled, playSfx } from '../audio.js'

defineProps({ best: { type: Object, default: null } })
defineEmits(['start', 'endless', 'docs'])

const sfxOn = ref(isSfxEnabled())
const toggleSfx = () => {
  sfxOn.value = !sfxOn.value
  setSfxEnabled(sfxOn.value)
  if (sfxOn.value) playSfx('select')
}
</script>

<style scoped lang="scss">
.home {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 34px;
  background: #2c1a4d;
  overflow: hidden;

  .logo {
    position: relative;
    text-align: center;

    .emoji-row {
      display: flex;
      justify-content: center;
      gap: 10px;
      font-size: 34px;
      margin-bottom: 10px;
    }

    h1 {
      margin: 0;
      font-size: 54px;
      letter-spacing: 6px;
      color: #fff;
    }

    .sub {
      margin: 12px 0 0;
      font-size: 15px;
      letter-spacing: 3px;
      color: rgba(255, 255, 255, .55);
    }
  }

  .actions {
    position: relative;
    display: flex;
    gap: 14px;

    .btn {
      min-width: 132px;
      padding: 13px 26px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #fff;
      cursor: pointer;
      background: rgba(255, 255, 255, .08);
      border: 1px solid rgba(255, 255, 255, .18);
      border-radius: 999px;

      div {
        font-size: 12px;
      }
    }

    .ghost.off {
      opacity: .5;
    }
  }
}

.tips {
  position: relative;
  display: flex;
  gap: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, .38);
}
</style>
