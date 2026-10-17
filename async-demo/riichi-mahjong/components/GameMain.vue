<template>
  <div class="main">
    <div class="bar">
      <span class="round">{{ windText }} · 第 {{ ui.number }} 局 · 本场 {{ ui.honba }}</span>
      <span class="chip">场风 {{ windTile }}</span>
      <span class="chip">自风 {{ myWindTile }}</span>
      <span class="sep"></span>
      <span class="pt">
        <i>你</i>
        <b :class="{ up: delta0 > 0, down: delta0 < 0 }">{{ ui.points[0] }}</b>
      </span>
      <span class="pt">
        <i>AI</i>
        <b>{{ ui.points[1] }}</b>
      </span>
      <span class="chip warn" v-if="ui.myRiichi">你已立直</span>
      <span class="chip warn" v-if="ui.oppRiichi">AI 立直中</span>
      <span class="chip gold" v-else-if="ui.tenpai[0]">你听牌</span>
      <span class="chip bad" v-if="ui.permFuriten && ui.waits.length">舍牌振听</span>
      <span class="chip bad temp" v-else-if="ui.tempFuriten && ui.waits.length">同巡振听</span>
      <span class="chip" v-if="ui.riichiBets">供托 {{ ui.riichiBets * 1000 }}</span>
      <span class="chip">牌山 {{ ui.wallLeft }}</span>
      <span class="dora" v-if="ui.dora.length">
        <i>宝牌指示</i>
        <TileFace v-for="(d, i) in ui.dora" :key="i" :kind="d" :w="20" class="df" />
        <b v-if="ui.myDora">你 {{ ui.myDora }} 张</b>
      </span>
      <span class="sep"></span>
      <span class="dealer">{{ ui.dealer === 0 ? '你是庄家' : 'AI 是庄家' }}</span>
      <span class="thinking" v-if="ui.thinking">AI 思考中…</span>
      <button class="dbgb" :class="{ on: debug.open }" @click="debug.open = !debug.open">
        调试{{ debug.open ? '' : ' ~' }}
      </button>
      <button class="quit" @click="$emit('exit')">退出</button>
    </div>

    <div class="stage">
      <div class="table">
        <!-- 牌桌：canvas 绝对定位居中，不参与 flex 排版，永远不会把操作区顶出容器 -->
        <div class="board">
          <canvas ref="canvasRef" @mousemove="onMove" @click="onClick" @mouseleave="clearHover"></canvas>
        </div>

        <div class="acts">
          <template v-if="ui.response && !ui.autoPass">
            <button class="ab ron" v-if="ui.response.ron" @click="playerRon()">荣和</button>
            <button class="ab" v-if="ui.response.pon" @click="playerPon()">碰</button>
            <button class="ab" v-if="ui.response.kan" @click="playerKanOpen()">杠</button>
            <button class="ab" v-for="(c, i) in ui.response.chi" :key="i" @click="playerChi(c)">
              吃<TileFace v-for="t in c" :key="t" :kind="t" :w="16" class="abt" />
            </button>
            <button class="ab ghost" @click="playerPass()">过</button>
          </template>

          <span class="hint" v-else-if="ui.autoPass">无牌可响应 · 自动过牌</span>

          <span class="hint ri" v-else-if="ui.autoCut">立直中 · 摸切自动打出</span>

          <template v-else-if="ui.riichiPick.length">
            <span class="hint ri">立直宣言：点亮着的牌打出（其余打法会让你不听牌）</span>
            <button class="ab ghost" @click="cancelRiichi()">取消</button>
          </template>

          <template v-else-if="ui.turn === 0 && ui.phase === 'discard'">
            <button class="ab ron" v-if="ui.actions.tsumo" @click="playerTsumo()">自摸</button>
            <button class="ab gold" v-if="ui.actions.riichi" @click="beginRiichi()">立直</button>
            <button class="ab" v-for="k in ui.actions.ankan" :key="'a' + k" @click="playerAnkan(k)">
              暗杠<TileFace :kind="k" :w="16" class="abt" />
            </button>
            <button class="ab" v-for="k in ui.actions.kakan" :key="'k' + k" @click="playerKakan(k)">
              加杠<TileFace :kind="k" :w="16" class="abt" />
            </button>
            <button class="ab ghost" v-if="ui.actions.kyushu" @click="playerKyushu()">九种九牌</button>
            <span class="hint" v-if="!ui.actions.tsumo && !ui.actions.riichi">点击手牌打出</span>
          </template>

          <span class="hint" v-else-if="ui.turn === 1">等待 AI…</span>
        </div>

        <!-- 能立直 / 正在选牌：逐切法对比「切这张 → 听什么、能不能荣和」 -->
        <div class="waitline plans" v-if="(ui.actions.riichi || ui.riichiPick.length) && ui.waitPlans.length">
          <div class="pl-h">
            {{ ui.riichiPick.length ? '立直选牌 · 点牌桌上的亮牌宣告' : '立直可行性 · 各切法的听牌与和牌方式' }}
          </div>
          <div v-for="pl in ui.waitPlans" :key="pl.discard" class="pl" :class="{ bad: !pl.ron }">
            <span class="pl-d">切<TileFace :kind="pl.discard" :w="20" /></span>
            <span class="pl-w">
              <span v-for="w in pl.waits" :key="w.tile" class="wc sm" :class="waitClass(w)">
                <TileFace :kind="w.tile" :w="20" /><i>{{ w.remaining }}</i>
                <em class="tag">{{ waitTag(w) }}</em>
              </span>
            </span>
            <span class="pl-tag ok" v-if="pl.ron">可荣和</span>
            <span class="pl-tag bad" v-else-if="pl.perm || ui.tempFuriten">
              仅自摸（{{ pl.perm ? '舍牌' : '同巡' }}振听）
            </span>
            <span class="pl-tag ny" v-else>无役</span>
          </div>
        </div>

        <div class="waitline" v-else-if="ui.waits.length">
          <span class="wt">{{ waitLabel }}</span>
          <span v-for="w in ui.waits" :key="w.tile" class="wc" :class="waitClass(w)">
            <TileFace :kind="w.tile" :w="24" />
            <i>{{ w.remaining }}</i>
            <em class="tag">{{ waitTag(w) }}</em>
          </span>
          <span class="sub" v-if="!ui.waitExact">打对牌才听得这些，不同切法待牌可能不同</span>
          <span class="warn" v-if="ui.permFuriten">
            舍牌振听：你打过<TileFace v-for="t in ui.permHits" :key="t" :kind="t" :w="17" class="abt" />，全部待牌都不能荣和，只能自摸
          </span>
          <span class="warn temp" v-else-if="ui.tempFuriten">
            同巡振听：本巡你放弃了能和的那张，下次摸牌前不能荣和，只能自摸
          </span>
          <span class="warn noyaku" v-else-if="ui.waits.some((w) => !w.tsumo)">
            无役：凑齐了也没役，和不了 —— 立直可解（立直本身是 1 番役）
          </span>
        </div>
      </div>

      <RecorderPanel :recorder="recorder" :ui="ui" :state="state" />
    </div>

    <DebugPanel :ui="ui" @swap="debugSwapTile" @set-draw="debugSetDraw" @clear-draw="debugClearDraw" />

    <ScoreDialog v-if="ui.result && ui.result.kind === 'win'" :result="ui.result" :points="ui.points"
      @confirm="confirmResult()" />

    <DrawDialog v-if="ui.result && ui.result.kind === 'draw'" :result="ui.result" :points="ui.points"
      @confirm="confirmResult()" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import RecorderPanel from './RecorderPanel.vue'
import ScoreDialog from './ScoreDialog.vue'
import DrawDialog from './DrawDialog.vue'
import DebugPanel from './DebugPanel.vue'
import TileFace from './TileFace.vue'
import { useMahjong } from '../composables/useMahjong.js'
import { debug } from '../composables/useDebug.js'
import { HONOR_LABEL } from '../core/tiles.js'

const props = defineProps({
  difficulty: { type: String, default: 'normal' },
  length: { type: String, default: 'south' },
})
const emit = defineEmits(['exit', 'finish'])

const canvasRef = ref(null)
let last0 = 10000
const delta0 = ref(0)

const {
  ui, hover, recorder, game, start, confirmResult,
  playerDiscard, beginRiichi, cancelRiichi, playerRiichi,
  playerTsumo, playerKyushu, playerAnkan, playerKakan,
  playerRon, playerPon, playerKanOpen, playerChi, playerPass, onMove, onClick,
  debugSwapTile, debugSetDraw, debugClearDraw,
} = useMahjong(canvasRef, { difficulty: props.difficulty, length: props.length })
const state = game.state

const clearHover = () => { hover.value = -1 }

/** 13 张（已定形）= 确定听这些牌；14 张（还没打）= 只是「打对了能听」 */
const waitLabel = computed(() => {
  if (!ui.waitExact) return '可听'
  return ui.myRiichi ? '立直听牌' : '听牌'
})

/** 每张待牌的和牌方式标注：能荣和 / 振听只能自摸 / 没役和不了 */
const waitTag = (w) => {
  if (w.ron) return '荣·摸'
  return w.tsumo ? '仅摸' : '无役'
}

const waitClass = (w) => ({
  perm: !w.ron && ui.permFuriten,
  temp: !w.ron && !ui.permFuriten && ui.tempFuriten,
  noyaku: !w.tsumo,
})

const windText = computed(() => (ui.wind === 'east' ? '東場' : '南場'))
const windTile = computed(() => HONOR_LABEL[ui.wind === 'east' ? 0 : 1])
const myWindTile = computed(() => HONOR_LABEL[ui.seatWind[0] - 27])

/** 点数变动时闪一下涨跌色 */
const tickPoints = () => {
  const now = ui.points[0]
  if (now !== last0) {
    delta0.value = now - last0
    last0 = now
    setTimeout(() => { delta0.value = 0 }, 900)
  }
  requestAnimationFrame(tickPoints)
}

watch(() => ui.phase, (p) => {
  if (p === 'finished' && state.finalResult) emit('finish', state.finalResult)
})

/** `~` 开关调试面板；在输入框里打字时不抢按键 */
const onKey = (e) => {
  const t = e.target
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
  if (e.key === '~' || e.key === '`' || e.code === 'Backquote') {
    e.preventDefault()
    debug.open = !debug.open
  }
}

onMounted(() => {
  start()
  requestAnimationFrame(tickPoints)
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped lang="scss">
.main {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #071f18;
}

.bar {
  display: flex;
  flex: none;
  align-items: center;
  gap: 12px;
  padding: 9px 16px;
  background: rgba(0, 0, 0, .32);
  border-bottom: 1px solid rgba(255, 255, 255, .09);
}

.round { font-size: 14px; font-weight: 700; color: #ffd93d; }

.chip {
  padding: 3px 9px;
  font-size: 12px;
  color: rgba(242, 239, 230, .6);
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 999px;

  &.gold { color: #ffd93d; border-color: rgba(255, 217, 61, .5); background: rgba(255, 217, 61, .12); }

  &.warn { color: #ff5f6d; border-color: rgba(255, 95, 109, .5); background: rgba(255, 95, 109, .14); }

  &.bad { color: #fff; border-color: transparent; background: rgba(255, 95, 109, .8); }

  &.temp { background: rgba(255, 152, 56, .85); }
}

.dora {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 9px;
  background: rgba(255, 217, 61, .1);
  border: 1px solid rgba(255, 217, 61, .38);
  border-radius: 999px;

  i { font-style: normal; font-size: 11px; color: rgba(242, 239, 230, .55); }

  b { margin-left: 2px; font-size: 11px; font-weight: 700; color: #ffd93d; }
}

.df { border-radius: 3px; }

.sep { width: 1px; height: 18px; background: rgba(255, 255, 255, .12); }

.pt {
  display: flex;
  align-items: baseline;
  gap: 6px;

  i { font-style: normal; font-size: 11px; color: rgba(242, 239, 230, .45); }

  b {
    font-size: 20px;
    font-weight: 800;
    color: #f2efe6;
    font-variant-numeric: tabular-nums;
    transition: color .2s;

    &.up { color: #ff5f6d; }
    &.down { color: #3ddc84; }
  }
}

.dealer { font-size: 12px; color: rgba(242, 239, 230, .5); }

.thinking { font-size: 12px; color: #ffd93d; animation: blink 1s infinite; }

@keyframes blink { 50% { opacity: .35; } }

.dbgb {
  margin-left: auto;
  padding: 5px 14px;
  font-size: 12px;
  color: rgba(242, 239, 230, .7);
  cursor: pointer;
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 8px;

  &.on { color: #10281f; background: #ffd93d; border-color: #ffd93d; }
}

.quit {
  padding: 5px 14px;
  font-size: 12px;
  color: rgba(242, 239, 230, .7);
  cursor: pointer;
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 8px;
}

.stage { flex: 1; display: flex; min-height: 0; }

.table {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 8px;
}

/* 牌桌舞台：吃掉「操作行 + 听牌条」之外的全部剩余高度 */
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
  position: relative;
  z-index: 3;
  display: flex;
  flex: none;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 6px 0;
}

.ab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #f2efe6;
  cursor: pointer;
  background: rgba(255, 255, 255, .1);
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: 10px;

  &:hover { background: rgba(255, 255, 255, .18); }

  &.ron { background: linear-gradient(135deg, #ff5f6d, #ff9d3d); border-color: transparent; color: #fff; }

  &.gold { background: linear-gradient(135deg, #ffd93d, #ff9d3d); border-color: transparent; color: #10281f; }

  &.ghost { background: transparent; color: rgba(242, 239, 230, .55); }
}

.hint { font-size: 12px; color: rgba(242, 239, 230, .4); }

.hint.ri { color: #ffd93d; }

.waitline {
  position: relative;
  z-index: 3;
  display: flex;
  flex: none;
  gap: 6px;
  align-items: center;
  justify-content: center;
  padding: 4px 0 2px;
  font-size: 12px;
}

.wt {
  padding: 2px 6px;
  color: #10281f;
  background: #ffd93d;
  border-radius: 6px;
}

.wc {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 6px;
  color: #f2efe6;
  background: rgba(255, 217, 61, .14);
  border: 1px solid rgba(255, 217, 61, .45);
  border-radius: 6px;

  i { font-style: normal; font-size: 10px; color: rgba(242, 239, 230, .55); }

  .tag {
    font-style: normal;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 4px;
    color: #10281f;
    background: #ffd93d;
    border-radius: 4px;
  }

  &.bad { background: rgba(255, 95, 109, .16); border-color: rgba(255, 95, 109, .5); }

  // 舍牌振听：这张自己打过，导致全部待牌不能荣和
  &.perm {
    background: rgba(255, 95, 109, .18);
    border-color: rgba(255, 95, 109, .65);

    .tag { color: #fff; background: rgba(255, 95, 109, .85); }
  }

  // 同巡振听：本巡放弃过，下次摸牌前不能荣和
  &.temp {
    background: rgba(255, 152, 56, .18);
    border-color: rgba(255, 152, 56, .65);

    .tag { color: #241505; background: #ff9838; }
  }

  // 无役：凑齐牌型也没有役，荣和自摸都不行
  &.noyaku {
    background: rgba(255, 255, 255, .06);
    border-color: rgba(255, 255, 255, .22);

    .tag { color: #f2efe6; background: rgba(255, 255, 255, .22); }
  }

  &.sm { padding: 1px 4px; }
}

.waitline.plans {
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
  max-height: 34vh;
  padding: 6px 10px;
  overflow-y: auto;
  background: rgba(0, 0, 0, .3);
  border-radius: 8px;
}

.pl-h { margin-bottom: 2px; font-size: 11px; color: rgba(242, 239, 230, .5); }

.pl {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 3px 6px;
  background: rgba(255, 217, 61, .08);
  border: 1px solid rgba(255, 217, 61, .25);
  border-radius: 6px;

  &.bad { background: rgba(255, 95, 109, .1); border-color: rgba(255, 95, 109, .3); }
}

.pl-d { display: inline-flex; gap: 3px; align-items: center; font-size: 11px; color: rgba(242, 239, 230, .55); }
.pl-w { display: inline-flex; flex: 1; flex-wrap: wrap; gap: 4px; align-items: center; }

.pl-tag {
  flex: none;
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;

  &.ok { color: #10281f; background: #ffd93d; }
  &.bad { color: #fff; background: rgba(255, 95, 109, .85); }
  &.ny { color: #f2efe6; background: rgba(255, 255, 255, .22); }
}

.abt { border-radius: 3px; }

.warn { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 3px; margin-left: 8px; font-size: 11px; color: #ff5f6d; }
.warn.temp { color: #ff9838; }
.warn.noyaku { color: rgba(242, 239, 230, .6); }
.sub { margin-left: 8px; font-size: 11px; color: rgba(242, 239, 230, .45); }
</style>
