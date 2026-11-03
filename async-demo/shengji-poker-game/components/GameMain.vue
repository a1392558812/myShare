<template>
  <div class="main">
    <div class="bar">
      <span class="round">第 {{ ui.roundIndex }} 局</span>
      <span class="chip gold">打 {{ ui.levelLabel }}</span>
      <span class="chip">
        主牌
        <b v-if="ui.trumpSuit < 0">无主</b>
        <b v-else :class="{ red: isRedSuit(ui.trumpSuit) }">{{ suitSymbol(ui.trumpSuit) }}</b>
      </span>
      <span class="sep"></span>
      <span class="team">
        <i>我方</i>
        <b>{{ levelOf(0) }}</b>
      </span>
      <span class="team">
        <i>对方</i>
        <b>{{ levelOf(1) }}</b>
      </span>
      <span class="sep"></span>
      <span class="chip" :class="{ live: ui.dealer === 0 }">
        庄家 {{ ui.dealer < 0 ? '待定' : ui.seatLabels[ui.dealer] }}
      </span>
      <span class="chip">闲家 {{ ui.points }} / {{ ui.target }}</span>
      <span class="phase-text">{{ phaseText }}</span>
      <button class="icon auto" :class="{ on: ui.autoPlay }" @click="toggleAutoPlay">
        {{ ui.autoPlay ? '托管中' : '托管' }}
      </button>
      <button class="icon" :class="{ on: debugOpen }" @click="debugOpen = !debugOpen">调试 ~</button>
      <button class="icon" @click="$emit('exit')">退出</button>
    </div>

    <div class="stage">
      <div class="board">
        <canvas ref="canvasRef" @mousemove="onMove" @mouseleave="onLeave" @click="onClick"></canvas>
      </div>
    </div>

    <div class="acts">
      <template v-if="ui.phase === 'declare' && ui.declare && !ui.autoPlay">
        <span class="hint">{{ ui.message }}</span>
        <button
          v-for="suit in ui.declare.suits"
          :key="'d' + suit"
          class="action gold"
          @click="declareSuit(suit)"
        >
          {{ ui.declare.stage === 1 ? '亮主' : '反主' }}
          <span class="glyph" :class="{ red: isRedSuit(suit) }">{{ suitSymbol(suit) }}</span>
        </button>
        <button v-if="ui.declare.jokers" class="action gold" @click="declareJoker">反无主</button>
        <button class="action ghost" @click="passDeclareTurn">过</button>
      </template>

      <template v-else-if="ui.phase === 'bury' && ui.dealer === 0 && !ui.autoPlay">
        <span class="hint">{{ ui.message }}</span>
        <button class="action primary" :disabled="ui.selectedIds.length !== 8" @click="burySelected">
          确认扣底（{{ ui.selectedIds.length }}/8）
        </button>
        <button class="action ghost" @click="clearSelection">清空</button>
      </template>

      <template v-else-if="ui.autoPlay">
        <span class="hint">{{ ui.message || '托管中 · AI 代打，点右侧按钮可随时接管' }}</span>
        <button class="action ghost" @click="toggleAutoPlay">收回托管</button>
      </template>

      <template v-else-if="ui.awaitingPlay">
        <span class="hint">{{ ui.message || '选牌后出牌' }}</span>
        <button class="action primary" :disabled="ui.selectedIds.length === 0" @click="playSelected">
          出牌（{{ ui.selectedIds.length }}）
        </button>
        <button class="action ghost" @click="clearSelection">清空</button>
        <button class="action ghost" @click="hint">提示</button>
      </template>

      <template v-else>
        <span class="hint">{{ ui.message || ui.thinking || '对局进行中…' }}</span>
      </template>
    </div>

    <ResultDialog
      v-if="ui.result"
      :result="ui.result"
      :match-winner="ui.matchWinner"
      :team-levels="ui.teamLevels"
      @next="continueNextRound"
      @restart="restartMatch"
      @exit="$emit('exit')"
    />

    <DebugPanel
      v-if="debugOpen"
      :ui="ui"
      @toggle-auto="toggleAutoPlay"
      @toggle-fast="toggleFast"
      @restart="restartMatch"
      @swap="onDebugSwap"
      @add-rig="onAddRig"
      @remove-rig="removeRig"
      @clear-rig="clearRig"
      @close="debugOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ResultDialog from './ResultDialog.vue'
import DebugPanel from './DebugPanel.vue'
import { useShengji } from '../composables/useShengji.js'
import { RANK_LABELS, SUIT_SYMBOLS } from '../core/cards.js'

const props = defineProps({
  autoWatch: { type: Boolean, default: false },
})

defineEmits(['exit'])

const canvasRef = ref(null)
const debugOpen = ref(false)

const {
  ui,
  attach,
  start,
  restartMatch,
  resize,
  onHover: hoverCanvas,
  onLeave: leaveCanvas,
  onClick: clickCanvas,
  declare,
  passDeclareTurn: passDeclareAction,
  clearSelection,
  burySelected,
  playSelected,
  hint,
  continueNextRound,
  toggleAutoPlay,
  toggleFast,
  dispose,
  debugSwap,
  addRig,
  removeRig,
  clearRig,
} = useShengji(canvasRef)

let observer = null

const isRedSuit = (suit) => suit === 1 || suit === 3
const suitSymbol = (suit) => SUIT_SYMBOLS[suit] || ''
const levelOf = (team) => `打 ${RANK_LABELS[ui.teamLevels[team]]}`

const phaseText = computed(() => {
  const map = {
    declare: '亮主阶段',
    bury: '扣底阶段',
    play: '出牌阶段',
    settle: '本局结束',
    over: '已通关',
  }
  return map[ui.phase] || ''
})

const declareSuit = (suit) => {
  declare({ suit, jokers: false })
}

const declareJoker = () => {
  declare({ suit: -1, jokers: true })
}

const passDeclareTurn = () => {
  passDeclareAction()
}

const onDebugSwap = (payload) => {
  debugSwap(payload.from, payload.to)
}

const onAddRig = (payload) => {
  addRig(payload.seat, payload.key)
}

const onMove = (event) => {
  hoverCanvas(event.clientX, event.clientY)
}

const onLeave = () => {
  leaveCanvas()
}

const onClick = (event) => {
  clickCanvas(event.clientX, event.clientY)
}

const onKey = (event) => {
  const target = event.target
  const tag = target ? target.tagName : ''
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (target && target.isContentEditable)) {
    return
  }
  if (event.key === 't' || event.key === 'T') {
    toggleAutoPlay()
    return
  }
  if (event.key === 'Enter') {
    if (ui.awaitingPlay) {
      playSelected()
    } else if (ui.phase === 'bury' && ui.dealer === 0) {
      burySelected()
    }
    return
  }
  if (event.key === 'Escape') {
    clearSelection()
    return
  }
  if (event.key === '~' || event.key === '`' || event.code === 'Backquote') {
    event.preventDefault()
    debugOpen.value = !debugOpen.value
  }
}

onMounted(() => {
  attach()
  start()
  if (props.autoWatch) {
    toggleAutoPlay()
  }
  window.addEventListener('keydown', onKey)
  if (window.ResizeObserver && canvasRef.value && canvasRef.value.parentElement) {
    observer = new ResizeObserver(() => {
      resize()
    })
    observer.observe(canvasRef.value.parentElement)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (observer) {
    observer.disconnect()
    observer = null
  }
  dispose()
})
</script>

<style scoped lang="scss">
.main {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #160409;
}

.bar {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 8px 16px;
  background: rgba(0, 0, 0, .35);
  border-bottom: 1px solid rgba(242, 193, 78, .14);
}

.round {
  font-size: 13px;
  font-weight: 700;
  color: #f2c14e;
}

.chip {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 3px 10px;
  font-size: 12px;
  color: rgba(247, 239, 226, .62);
  background: rgba(255, 255, 255, .05);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 999px;

  b {
    display: inline-block;
    font-size: 13px;
    font-weight: 800;
    color: #f7efe2;

    &.red {
      color: #ff8a90;
    }
  }

  &.gold {
    color: #f2c14e;
    background: rgba(242, 193, 78, .12);
    border-color: rgba(242, 193, 78, .4);
  }

  &.live {
    color: #f2c14e;
    border-color: rgba(242, 193, 78, .45);
  }
}

.team {
  display: inline-flex;
  gap: 5px;
  align-items: baseline;

  i {
    font-style: normal;
    font-size: 11px;
    color: rgba(247, 239, 226, .4);
  }

  b {
    font-size: 14px;
    font-weight: 700;
    color: #f7efe2;
  }
}

.sep {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, .12);
}

.phase-text {
  font-size: 11px;
  color: rgba(242, 193, 78, .7);
}

.icon {
  padding: 4px 12px;
  font-size: 11px;
  color: rgba(247, 239, 226, .6);
  cursor: pointer;
  background: rgba(255, 255, 255, .05);
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 8px;

  &:first-of-type {
    margin-left: auto;
  }

  &.on {
    color: #2b0a12;
    background: #f2c14e;
    border-color: #f2c14e;
  }
}

/* 舞台吃掉顶栏与操作区之外的全部高度；canvas 绝对定位居中，永远不挤压布局 */
.stage {
  display: flex;
  flex: 1;
  min-height: 0;
}

.board {
  position: relative;
  flex: 1;
  min-height: 180px;

  canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    display: block;
    cursor: pointer;
    transform: translate(-50%, -50%);
  }
}

.acts {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 6px 16px 10px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, .35));
}

.hint {
  font-size: 12px;
  color: rgba(247, 239, 226, .55);
}

.action {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 700;
  color: #f7efe2;
  cursor: pointer;
  background: rgba(255, 255, 255, .1);
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 10px;

  &:disabled {
    cursor: not-allowed;
    opacity: .4;
  }

  &.primary {
    color: #2b0a12;
    background: linear-gradient(135deg, #ffe08a, #f2c14e 60%, #d79a2b);
    border-color: transparent;
  }

  &.gold {
    color: #f2c14e;
    background: rgba(242, 193, 78, .12);
    border-color: rgba(242, 193, 78, .45);
  }

  &.ghost {
    color: rgba(247, 239, 226, .55);
    background: transparent;
  }
}

.glyph {
  font-size: 16px;
  line-height: 1;

  &.red {
    color: #ff8a90;
  }
}
</style>
