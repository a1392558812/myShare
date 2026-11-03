<template>
  <div class="mask">
    <div class="dialog">
      <div class="head">
        <h2>{{ title }}</h2>
        <p class="sub">{{ subtitle }}</p>
      </div>

      <div class="score">
        <div class="score-main">
          <b :class="{ big: result.gained >= 80 }">{{ result.gained }}</b>
          <i>闲家得分 / 门槛 {{ result.threshold }}</i>
        </div>
        <div class="score-tag" :class="result.step.swap ? 'swap' : 'hold'">{{ result.step.title }}</div>
      </div>

      <div class="levels">
        <div class="row">
          <span class="who">我方（你与对家）</span>
          <span class="path">
            <em>打 {{ rankText(levelBefore[0]) }}</em>
            <span class="arrow">→</span>
            <b>打 {{ rankText(levelsAfter[0]) }}</b>
          </span>
        </div>
        <div class="row">
          <span class="who">对方（右家与左家）</span>
          <span class="path">
            <em>打 {{ rankText(levelBefore[1]) }}</em>
            <span class="arrow">→</span>
            <b>打 {{ rankText(levelsAfter[1]) }}</b>
          </span>
        </div>
      </div>

      <div class="detail">
        <span v-if="result.step.levels > 0 && !result.step.swap">{{ ownerName }} 升 {{ result.step.levels }} 级</span>
        <span v-else-if="result.step.swap">{{ defenderName }} 上台{{ result.step.levels > 0 ? `并升 ${result.step.levels} 级` : '' }}</span>
        <span v-else>庄家保级，未升级</span>
        <span v-if="matchWinner < 0">下一局庄家：{{ seatLabels[result.nextDealer] }}</span>
      </div>

      <div class="actions">
        <button v-if="matchWinner < 0" class="primary" @click="$emit('next')">下一局</button>
        <button v-else class="primary" @click="$emit('restart')">再来一场</button>
        <button class="ghost" @click="$emit('restart')">重开比赛</button>
        <button class="ghost" @click="$emit('exit')">退出</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RANK_LABELS } from '../core/cards.js'
import { SEAT_LABELS } from '../core/game.js'

const props = defineProps({
  result: { type: Object, required: true },
  matchWinner: { type: Number, default: -1 },
  teamLevels: { type: Array, default: () => [2, 2] },
})

defineEmits(['next', 'restart', 'exit'])

const seatLabels = SEAT_LABELS
const levelBefore = computed(() => props.result.levelBefore || props.result.levelsAfter)
const levelsAfter = computed(() => props.result.levelsAfter || props.result.levelBefore)
const ownerName = computed(() => (props.result.owner === 0 ? '我方' : '对方'))
const defenderName = computed(() => (props.result.defender === 0 ? '我方' : '对方'))

const rankText = (value) => RANK_LABELS[value] || '2'

const title = computed(() => {
  if (props.matchWinner === 0) {
    return '我方通关'
  }
  if (props.matchWinner === 1) {
    return '对方通关'
  }
  return '本局结算'
})

const subtitle = computed(() => {
  if (props.matchWinner >= 0) {
    return `${props.matchWinner === 0 ? '我方' : '对方'}在 A 级保级成功，赢得整场比赛`
  }
  if (props.result.playingAce) {
    return '打 A 的一局：保级即通关'
  }
  return '闲家满 80 分上台，不足 80 分庄家升级'
})
</script>

<style scoped lang="scss">
.mask {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 2, 5, .72);
  backdrop-filter: blur(3px);
}

.dialog {
  width: 420px;
  padding: 26px 26px 20px;
  background: linear-gradient(180deg, #33101a, #1d070d);
  border: 1px solid rgba(242, 193, 78, .3);
  border-radius: 18px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, .6);
}

.head {
  text-align: center;

  h2 {
    margin: 0;
    font-size: 22px;
    letter-spacing: 4px;
    color: #f2c14e;
  }

  .sub {
    margin: 8px 0 0;
    font-size: 12px;
    color: rgba(247, 239, 226, .5);
  }
}

.score {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  margin: 18px 0;
  background: rgba(255, 255, 255, .04);
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 12px;
}

.score-main {
  display: flex;
  flex-direction: column;

  b {
    font-size: 30px;
    font-weight: 800;
    color: #f7efe2;
    line-height: 1.1;

    &.big {
      color: #43d17f;
    }
  }

  i {
    font-style: normal;
    font-size: 11px;
    color: rgba(247, 239, 226, .45);
  }
}

.score-tag {
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;

  &.swap {
    color: #2b0a12;
    background: #43d17f;
  }

  &.hold {
    color: #2b0a12;
    background: #f2c14e;
  }
}

.levels {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, .03);
  border-radius: 10px;
}

.who {
  font-size: 12px;
  color: rgba(247, 239, 226, .55);
}

.path {
  display: inline-flex;
  gap: 8px;
  align-items: center;

  em {
    font-style: normal;
    font-size: 12px;
    color: rgba(247, 239, 226, .45);
  }

  .arrow {
    color: rgba(242, 193, 78, .5);
  }

  b {
    font-size: 14px;
    color: #f2c14e;
  }
}

.detail {
  display: flex;
  justify-content: space-between;
  margin: 14px 2px 18px;
  font-size: 12px;
  color: rgba(247, 239, 226, .5);
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.primary {
  padding: 10px 26px;
  font-size: 14px;
  font-weight: 800;
  color: #2b0a12;
  cursor: pointer;
  background: linear-gradient(135deg, #ffe08a, #f2c14e 60%, #d79a2b);
  border: none;
  border-radius: 999px;
}

.ghost {
  padding: 10px 20px;
  font-size: 13px;
  color: rgba(247, 239, 226, .6);
  cursor: pointer;
  background: rgba(255, 255, 255, .05);
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 999px;
}
</style>
