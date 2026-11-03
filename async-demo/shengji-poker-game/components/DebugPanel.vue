<template>
  <div class="panel">
    <div class="head">
      <b>调试面板</b>
      <span class="meta">{{ ui.phase }} · 打 {{ ui.levelLabel }} · {{ trumpText }}</span>
      <button class="close" @click="$emit('close')">×</button>
    </div>

    <div class="controls">
      <button class="tool" :class="{ on: ui.autoPlay }" @click="$emit('toggle-auto')">
        AI 托管{{ ui.autoPlay ? '（开）' : '（关）' }}
      </button>
      <button class="tool" :class="{ on: ui.fast }" @click="$emit('toggle-fast')">
        快进{{ ui.fast ? '（开）' : '（关）' }}
      </button>
      <button class="tool" @click="$emit('restart')">重开比赛</button>
      <span class="stat">第 {{ ui.roundIndex }} 局 · 已打 {{ ui.trickIndex }} 墩</span>
    </div>

    <div class="audit" :class="{ bad: !audit.ok }">
      <b>{{ audit.ok ? '牌堆完整' : '牌堆异常' }}</b>
      <span>{{ auditText }}</span>
    </div>

    <section class="block">
      <div class="block-title">
        手牌 / 底牌
        <i>{{ picked ? '再点另一家的任意一张完成交换' : '点一张牌 → 再点另一家的牌 = 交换' }}</i>
      </div>
      <div v-for="zone in zones" :key="zone.zone" class="zone">
        <div class="zone-head">
          <span class="who" :class="{ me: zone.zone === 0 }">{{ zone.label }}</span>
          <span class="count">{{ zone.cards.length }} 张</span>
        </div>
        <div class="chips">
          <button
            v-for="card in zone.cards"
            :key="card.id"
            class="card"
            :class="{ red: card.red, joker: card.joker, trump: card.trump, pick: isPicked(zone.zone, card.id) }"
            @click="onPick(zone.zone, card.id)"
          >
            {{ card.label }}
          </button>
          <span v-if="!zone.cards.length" class="none">（空）</span>
        </div>
      </div>
      <div v-if="ui.debug.note && !picked" class="note">{{ ui.debug.note }}</div>
    </section>

    <section class="block">
      <div class="block-title">
        下次进张
        <i>下一局发牌时先发这张，牌仍从同一副牌里取</i>
      </div>
      <div class="rig-row">
        <button
          v-for="seat in 4"
          :key="'s' + seat"
          class="seat"
          :class="{ on: rigSeat === seat - 1 }"
          @click="rigSeat = seat - 1"
        >
          {{ ui.seatLabels[seat - 1] }}
        </button>
      </div>
      <div class="rig-row">
        <select v-model="rigKey" class="picker">
          <optgroup v-for="group in cardGroups" :key="group.label" :label="group.label">
            <option v-for="item in group.items" :key="item.key" :value="item.key" :disabled="item.left <= 0">
              {{ item.label }} · 剩 {{ item.left }}
            </option>
          </optgroup>
        </select>
        <button class="tool" @click="addRigEntry">安排</button>
        <button class="tool" :disabled="!rig.length" @click="$emit('clear-rig')">清空</button>
      </div>
      <div class="rig-list">
        <span v-for="entry in rig" :key="entry.index" class="rig-item">
          {{ entry.seatLabel }} {{ entry.label }}
          <button class="x" @click="$emit('remove-rig', entry.index)">×</button>
        </span>
        <span v-if="!rig.length" class="none">未安排 · 下一局正常洗牌</span>
      </div>
    </section>

    <div class="bottom">
      <div class="block">
        <div class="block-title">记分</div>
        <div class="cards">
          闲家 {{ ui.points }} / {{ ui.target }} · 我方 {{ ui.teamLevels[0] }} · 对方 {{ ui.teamLevels[1] }}
        </div>
      </div>
    </div>

    <div class="logs">
      <div class="block-title">最近事件</div>
      <div v-for="(line, index) in ui.log" :key="index" class="log-line">{{ line }}</div>
      <div v-if="!ui.log.length" class="log-line dim">暂无</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RANKS, SUIT_SYMBOLS } from '../core/cards.js'
import { COPIES_PER_CARD, keyLabel } from '../core/debug.js'

const props = defineProps({
  ui: { type: Object, required: true },
})

const emit = defineEmits(['toggle-auto', 'toggle-fast', 'restart', 'close', 'swap', 'add-rig', 'remove-rig', 'clear-rig'])

const picked = ref(null)
const rigSeat = ref(1)
const rigKey = ref('0-14')

const SUIT_GROUPS = [
  { label: '♠ 黑桃', suit: 0 },
  { label: '♥ 红桃', suit: 1 },
  { label: '♣ 梅花', suit: 2 },
  { label: '♦ 方片', suit: 3 },
]

const zones = computed(() => props.ui.debug.zones)
const audit = computed(() => props.ui.debug.audit)
const rig = computed(() => props.ui.debug.rig)

const trumpText = computed(() => {
  if (props.ui.trumpSuit < 0) {
    return '无主'
  }
  return SUIT_SYMBOLS[props.ui.trumpSuit]
})

const auditText = computed(() => {
  const report = audit.value
  if (report.ok) {
    return `${report.total} / ${report.expected} 张 · ${report.kinds} 种各 ${COPIES_PER_CARD} 张`
  }
  const parts = [`共 ${report.total} / ${report.expected} 张`]
  if (report.over.length) {
    parts.push(`多出 ${report.over.slice(0, 3).map((item) => `${item.label}×${item.count}`).join(' ')}`)
  }
  if (report.missing.length) {
    parts.push(`缺 ${report.missing.slice(0, 3).map((item) => `${item.label}×${item.count}`).join(' ')}`)
  }
  if (report.duplicateIds) {
    parts.push(`重复 id ${report.duplicateIds}`)
  }
  return parts.join(' · ')
})

/** 还能安排几张：两副牌每种只有 2 张，已排的张数要扣掉 */
const cardGroups = computed(() => {
  const planned = (key) => rig.value.filter((entry) => entry.key === key).length
  const groups = SUIT_GROUPS.map((group) => ({
    label: group.label,
    items: RANKS.map((rank) => {
      const key = `${group.suit}-${rank}`
      return { key, label: keyLabel(key), left: COPIES_PER_CARD - planned(key) }
    }),
  }))
  groups.push({
    label: '王',
    items: ['SJ', 'BJ'].map((key) => ({
      key,
      label: keyLabel(key),
      left: COPIES_PER_CARD - planned(key),
    })),
  })
  return groups
})

const isPicked = (zone, id) => {
  return Boolean(picked.value && picked.value.zone === zone && picked.value.id === id)
}

const onPick = (zone, id) => {
  if (!picked.value) {
    picked.value = { zone, id }
    return
  }
  if (picked.value.zone === zone) {
    // 同区域就是改选/取消
    picked.value = picked.value.id === id ? null : { zone, id }
    return
  }
  const from = picked.value
  picked.value = null
  emit('swap', { from, to: { zone, id } })
}

const addRigEntry = () => {
  if (!rigKey.value) {
    return
  }
  emit('add-rig', { seat: rigSeat.value, key: rigKey.value })
}
</script>

<style scoped lang="scss">
.panel {
  position: absolute;
  top: 48px;
  left: 14px;
  z-index: 18;
  width: 386px;
  max-height: calc(100% - 60px);
  padding: 12px 14px 14px;
  overflow-y: auto;
  font-size: 11px;
  color: rgba(247, 239, 226, .8);
  background: rgba(12, 3, 6, .94);
  border: 1px solid rgba(242, 193, 78, .25);
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, .55);
}

.head {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, .08);

  b {
    font-size: 12px;
    color: #f2c14e;
  }

  .meta {
    color: rgba(247, 239, 226, .4);
  }

  .close {
    margin-left: auto;
    font-size: 14px;
    color: rgba(247, 239, 226, .5);
    cursor: pointer;
    background: none;
    border: none;
  }
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 8px 0;
}

.tool {
  padding: 4px 10px;
  font-size: 11px;
  color: rgba(247, 239, 226, .75);
  cursor: pointer;
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 7px;

  &.on {
    color: #2b0a12;
    background: #f2c14e;
    border-color: #f2c14e;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: .4;
  }
}

.stat {
  color: rgba(247, 239, 226, .4);
}

.audit {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 5px 9px;
  color: #8fd8a0;
  background: rgba(90, 200, 130, .1);
  border: 1px solid rgba(90, 200, 130, .3);
  border-radius: 7px;

  b {
    flex: none;
    font-size: 11px;
  }

  span {
    font-size: 10px;
    line-height: 1.4;
    color: rgba(247, 239, 226, .55);
  }

  &.bad {
    color: #ff8a90;
    background: rgba(255, 90, 100, .14);
    border-color: rgba(255, 90, 100, .45);

    span {
      color: #ffb3b7;
    }
  }
}

.block {
  padding-top: 10px;
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, .07);
}

.block-title {
  display: flex;
  gap: 6px;
  align-items: baseline;
  margin-bottom: 5px;
  color: rgba(247, 239, 226, .38);

  i {
    font-style: normal;
    font-size: 10px;
    color: rgba(242, 193, 78, .55);
  }
}

.zone {
  margin-bottom: 5px;
}

.zone-head {
  display: flex;
  gap: 6px;
  align-items: baseline;
  margin-bottom: 2px;

  .who {
    color: rgba(242, 193, 78, .85);

    &.me {
      color: #ff8a90;
    }
  }

  .count {
    font-size: 10px;
    color: rgba(247, 239, 226, .3);
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.card {
  min-width: 26px;
  padding: 0 4px;
  font-family: inherit;
  font-size: 10px;
  line-height: 16px;
  color: rgba(247, 239, 226, .85);
  cursor: pointer;
  background: rgba(255, 255, 255, .07);
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 4px;

  &.red {
    color: #ff8a90;
  }

  &.joker {
    color: #f2c14e;
  }

  &.trump {
    border-color: rgba(242, 193, 78, .5);
  }

  &.pick {
    color: #2b0a12;
    background: #f2c14e;
    border-color: #f2c14e;
  }
}

.none {
  font-size: 10px;
  color: rgba(247, 239, 226, .3);
}

.note {
  padding: 4px 8px;
  margin-top: 4px;
  font-size: 10px;
  line-height: 1.5;
  color: #f2c14e;
  background: rgba(242, 193, 78, .1);
  border-radius: 6px;
}

.rig-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  margin-bottom: 5px;
}

.seat {
  padding: 3px 9px;
  font-size: 10px;
  color: rgba(247, 239, 226, .7);
  cursor: pointer;
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 6px;

  &.on {
    color: #2b0a12;
    background: #f2c14e;
    border-color: #f2c14e;
  }
}

.picker {
  flex: 1;
  min-width: 120px;
  padding: 3px 6px;
  font-family: inherit;
  font-size: 10px;
  color: rgba(247, 239, 226, .8);
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 6px;
  outline: none;

  option,
  optgroup {
    color: #1a0b10;
    background: #f4e9d6;
  }
}

.rig-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.rig-item {
  display: inline-flex;
  gap: 3px;
  align-items: center;
  padding: 1px 4px 1px 7px;
  font-size: 10px;
  color: #f2c14e;
  background: rgba(242, 193, 78, .12);
  border: 1px solid rgba(242, 193, 78, .35);
  border-radius: 5px;

  .x {
    padding: 0 2px;
    font-size: 11px;
    color: rgba(247, 239, 226, .5);
    cursor: pointer;
    background: none;
    border: none;

    &:hover {
      color: #ff8a90;
    }
  }
}

.bottom {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cards {
  line-height: 1.6;
  color: rgba(247, 239, 226, .7);
  word-break: break-all;
}

.logs {
  max-height: 132px;
  padding-top: 8px;
  margin-top: 8px;
  overflow-y: auto;
  border-top: 1px solid rgba(255, 255, 255, .06);
}

.log-line {
  line-height: 1.7;
  color: rgba(247, 239, 226, .55);

  &.dim {
    color: rgba(247, 239, 226, .3);
  }
}
</style>
