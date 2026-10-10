<template>
  <div class="start-panel">
    <div class="bg-ball b1"></div>
    <div class="bg-ball b2"></div>
    <div class="bg-ball b3"></div>

    <div class="main">
      <div class="title">黑八 · 中式八球</div>
      <div class="subtitle">清完自己 7 颗球，再打进黑八，你就赢了</div>

      <section class="card">
        <div class="card-title">猜拳决定开球权</div>
        <div class="rps-stage">
          <div class="hand-side">
            <div class="side-name">你</div>
            <div class="hand" :class="{ shaking: stage === 'shaking' }">
              {{ myPick ? iconOf(myPick) : '✊' }}
            </div>
            <div class="pick-name">{{ myPick ? labelOf(myPick) : '—' }}</div>
          </div>
          <div class="vs">VS</div>
          <div class="hand-side">
            <div class="side-name">电脑</div>
            <div class="hand" :class="{ shaking: stage === 'shaking', delay: true }">
              {{ aiPick && stage === 'done' ? iconOf(aiPick) : '✊' }}
            </div>
            <div class="pick-name">{{ aiPick && stage === 'done' ? labelOf(aiPick) : '—' }}</div>
          </div>
        </div>

        <div class="rps-picks">
          <button v-for="c in choices" :key="c.key" class="rps-btn" :class="{ on: myPick === c.key }"
            :disabled="stage === 'shaking'" @click="onPick(c.key)">
            <span class="ico">{{ c.icon }}</span>{{ c.label }}
          </button>
        </div>

        <div class="rps-result" :class="result">
          <template v-if="stage === 'done' && result === 'win'">你赢了，你先开球</template>
          <template v-else-if="stage === 'done' && result === 'lose'">你输了，电脑先开球</template>
          <template v-else-if="stage === 'done' && result === 'draw'">平局，再来一次</template>
          <template v-else>出拳决定谁先开球</template>
        </div>
      </section>

      <section class="card rules">
        <div class="card-title">规则速览</div>
        <ul>
          <li>1–7 全色，9–15 花色，8 号黑八必须最后打</li>
          <li>开球进球就归那组；两组都进可以自己挑</li>
          <li>打进自己的球继续打，没进或犯规换对手</li>
          <li>母球落袋 / 空杆 / 先碰对方球 / 碰黑八 / 连击推杆 → 犯规，对手自由球</li>
          <li class="danger">没清完自己球就打进黑八、打黑八时母球落袋、黑八飞出台面 → 直接输</li>
        </ul>
      </section>

      <section class="card ctrl">
        <div class="card-title">操作</div>
        <div class="ctrl-grid">
          <span>移动鼠标</span><span>瞄准</span>
          <span>按住左键 / 空格</span><span>蓄力</span>
          <span>松开</span><span>击球</span>
          <span>← →</span><span>微调角度（Shift 精调）</span>
          <span>点击台面</span><span>自由球摆放母球</span>
        </div>
      </section>

      <div class="btn-row">
        <button class="start-btn" :disabled="!canStart" @click="onStart">
          {{ canStart ? '开始游戏' : '先猜拳决定开球权' }}
        </button>
        <button class="start-btn ghost" @click="emit('code')">查看源码</button>
        <button class="start-btn ghost" @click="emit('docs')">设计文档</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['start', 'docs', 'code'])

const choices = [
  { key: 'rock', label: '石头', icon: '✊' },
  { key: 'scissors', label: '剪刀', icon: '✌️' },
  { key: 'paper', label: '布', icon: '✋' },
]

/** idle 未出拳 | shaking 出拳中 | done 已定胜负 */
const stage = ref('idle')
const myPick = ref(null)
const aiPick = ref(null)
const result = ref('')
let timer = null

const iconOf = (k) => choices.find((c) => c.key === k).icon
const labelOf = (k) => choices.find((c) => c.key === k).label

const canStart = computed(() => stage.value === 'done' && result.value !== 'draw')

const judge = (a, b) => {
  if (a === b) return 'draw'
  if ((a === 'rock' && b === 'scissors') || (a === 'scissors' && b === 'paper') || (a === 'paper' && b === 'rock')) {
    return 'win'
  }
  return 'lose'
}

const onPick = (key) => {
  if (stage.value === 'shaking') return
  myPick.value = key
  aiPick.value = choices[Math.floor(Math.random() * 3)].key
  stage.value = 'shaking'
  result.value = ''
  clearTimeout(timer)
  timer = setTimeout(() => {
    result.value = judge(key, aiPick.value)
    stage.value = 'done'
  }, 720)
}

const onStart = () => {
  emit('start', result.value === 'win' ? 0 : 1)
}
</script>

<style scoped lang="scss">
.start-panel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background:
    radial-gradient(1200px 700px at 50% -10%, #12463a 0%, #0a1712 45%, #060a0e 100%);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #dff3ea;
}

.bg-ball {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  opacity: 0.16;
}

.b1 {
  width: 220px;
  height: 220px;
  left: -60px;
  top: 8%;
  background: #f4c400;
}

.b2 {
  width: 160px;
  height: 160px;
  right: 4%;
  top: 42%;
  background: #1f4fd8;
}

.b3 {
  width: 190px;
  height: 190px;
  left: 12%;
  bottom: -70px;
  background: #d42a2a;
}

.main {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 24px 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.title {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 8px;
  color: #4ce0a8;
  text-shadow: 0 4px 20px rgba(76, 224, 168, 0.3);
}

.subtitle {
  font-size: 14px;
  color: rgba(223, 243, 234, 0.62);
  letter-spacing: 2px;
}

.card {
  width: 100%;
  padding: 18px 22px;
  border-radius: 10px;
  background: rgba(6, 20, 16, 0.66);
  border: 1px solid rgba(120, 220, 180, 0.18);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.35);
}

.card-title {
  font-size: 13px;
  letter-spacing: 3px;
  color: #4ce0a8;
  margin-bottom: 14px;
}

.rps-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

.hand-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 120px;
}

.side-name {
  font-size: 12px;
  color: rgba(223, 243, 234, 0.6);
}

.hand {
  font-size: 46px;
  line-height: 1;
  transform-origin: 50% 80%;
}

.hand.shaking {
  animation: shake 0.24s infinite;
}

.hand.shaking.delay {
  animation-delay: 0.12s;
}

@keyframes shake {
  0% {
    transform: rotate(-14deg) translateY(0);
  }

  50% {
    transform: rotate(10deg) translateY(-6px);
  }

  100% {
    transform: rotate(-14deg) translateY(0);
  }
}

.pick-name {
  font-size: 12px;
  font-family: monospace;
  color: #dff3ea;
}

.vs {
  font-size: 14px;
  letter-spacing: 2px;
  color: rgba(223, 243, 234, 0.4);
}

.rps-picks {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.rps-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid rgba(120, 220, 180, 0.28);
  background: rgba(255, 255, 255, 0.04);
  color: #dff3ea;
  cursor: pointer;
  transition: all 0.2s;

  .ico {
    font-size: 16px;
  }

  &:hover:not(:disabled) {
    background: rgba(76, 224, 168, 0.14);
    border-color: #4ce0a8;
  }

  &.on {
    background: rgba(76, 224, 168, 0.2);
    border-color: #4ce0a8;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.rps-result {
  margin-top: 14px;
  text-align: center;
  font-size: 14px;
  letter-spacing: 2px;
  color: rgba(223, 243, 234, 0.65);

  &.win {
    color: #4ce0a8;
  }

  &.lose {
    color: #e0604a;
  }

  &.draw {
    color: #f4c400;
  }
}

.rules ul {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  li {
    font-size: 13px;
    line-height: 1.6;
    color: rgba(223, 243, 234, 0.8);

    &.danger {
      color: #e0604a;
    }
  }
}

.ctrl-grid {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 6px 14px;
  font-size: 13px;

  span:nth-child(odd) {
    color: #4ce0a8;
    font-family: monospace;
  }

  span:nth-child(even) {
    color: rgba(223, 243, 234, 0.75);
  }
}

.btn-row {
  margin-top: 4px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.start-btn {
  padding: 14px 48px;
  font-size: 16px;
  letter-spacing: 4px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: #4ce0a8;
  color: #06120e;
  transition: all 0.25s;

  &:hover:not(:disabled) {
    background: #7ff0c6;
  }

  &:disabled {
    background: rgba(76, 224, 168, 0.28);
    color: rgba(223, 243, 234, 0.5);
    cursor: not-allowed;
  }

  &.ghost {
    padding: 12px 26px;
    font-size: 14px;
    letter-spacing: 2px;
    background: transparent;
    color: #4ce0a8;
    border: 1px solid rgba(76, 224, 168, 0.5);

    &:hover {
      background: rgba(76, 224, 168, 0.12);
    }
  }
}
</style>
