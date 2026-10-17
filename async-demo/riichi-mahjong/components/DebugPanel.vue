<template>
  <div class="dbg" v-if="d.open">
    <div class="d-h">
      <b>调试面板</b>
      <span class="seg">
        <button :class="{ on: d.target === 0 }" @click="pick(0)">你</button>
        <button :class="{ on: d.target === 1 }" @click="pick(1)">AI</button>
      </span>
      <button class="x" @click="d.open = false">×</button>
    </div>

    <label class="row ck">
      <input type="checkbox" v-model="d.reveal" />
      <span>透视：显示对手手牌</span>
    </label>

    <div class="sec">手牌 · 把牌库的牌拖到某一张上即替换</div>
    <div class="hand" :class="{ lock, act: d.drag >= 0 && !lock }" @dragover.prevent="over('hand')"
      @dragleave="leave('hand', $event)" @drop="dropHand($event)">
      <span v-for="(t, i) in hand" :key="i" class="tl" :class="{ sel: d.slot === i, hit: d.over === 'h' + i }"
        @click="select(i)" @dragover.prevent.stop="over('h' + i)" @dragleave.stop="leave('h' + i, $event)"
        @drop.stop="dropTile(i, $event)">
        <TileFace :kind="t" :w="26" />
        <i v-if="isDrawn(i)" class="dw">摸</i>
      </span>
    </div>
    <div class="note lock" v-if="lock">
      {{ d.target === 0 ? '你' : 'AI' }}已立直 —— 手牌锁定，只能摸切，不可调整
    </div>

    <div class="melds" v-if="melds.length">
      <span class="mk">副露（已确定 · 锁定）</span>
      <span v-for="(m, i) in melds" :key="i" class="mel">
        <TileFace v-for="(k, j) in m.kinds" :key="j" :kind="k" :w="19" />
      </span>
    </div>

    <div class="opp" v-if="d.target === 1 && d.reveal">
      AI 向听 <b>{{ ui.oppShanten < 0 ? '已和了' : ui.oppShanten }}</b>
      <template v-if="ui.oppWaits.length">
        · 待牌
        <TileFace v-for="k in ui.oppWaits" :key="k" :kind="k" :w="17" class="abt" />
      </template>
      <span v-else-if="ui.oppTilesList.length !== 13 - 3 * melds.length" class="dim">（已摸牌，待牌按已定形才算）</span>
    </div>

    <div class="sec">指定下一张摸牌 · 拖进下面的格子</div>
    <div class="row dr" v-for="w in who" :key="w.i">
      <b class="who">{{ w.n }}</b>
      <span class="drop" :class="{ on: d.over === 'w' + w.i, set: ui.forced[w.i] !== null }"
        @dragover.prevent="over('w' + w.i)" @dragleave="leave('w' + w.i, $event)" @drop="dropDraw(w.i, $event)">
        <TileFace v-if="ui.forced[w.i] !== null" :kind="ui.forced[w.i]" :w="22" />
        <span v-else class="ph">拖到这</span>
      </span>
      <button class="btn ghost" v-if="ui.forced[w.i] !== null" @click="emit('clear-draw', w.i)">清除</button>
      <span v-else class="tip">或点牌库给「{{ d.target === 0 ? '你' : 'AI' }}」</span>
    </div>

    <div class="sec">牌库 · 角标 = 牌山可取张数 · 可拖动</div>
    <div class="pick">
      <span v-for="k in 34" :key="k" class="cell"
        :class="{ off: canTake(k - 1) <= 0, dragging: d.drag === k - 1 }" :draggable="canTake(k - 1) > 0"
        :title="`全部剩 ${ui.avail[k - 1]} 张 · 其中牌山可取 ${ui.wallAvail[k - 1]} 张`"
        @dragstart="dragStart(k - 1, $event)" @dragend="dragEnd" @click="swap(k - 1)">
        <TileFace :kind="k - 1" :w="22" />
        <i>{{ ui.wallAvail[k - 1] }}</i>
      </span>
    </div>

    <div class="msg" :class="d.code" v-if="d.msg">
      <span class="mt" v-for="(k, i) in d.tiles" :key="i">
        <i v-if="i > 0">{{ d.tiles.length === 2 ? '→' : '' }}</i>
        <TileFace :kind="k" :w="19" />
      </span>
      <span class="mtx">{{ d.msg }}</span>
    </div>
    <div class="foot" :class="{ bad: ui.integrityTotal !== 136 }">
      全区域 {{ ui.integrityTotal }}/136
      {{ ui.integrityTotal === 136 ? '· 牌数守恒 ✓' : '· 异常 ✗' }}
    </div>
  </div>

  <Teleport to="body">
    <div class="drag-ghost" v-if="d.drag >= 0" :style="{ left: d.gx + 'px', top: d.gy + 'px' }">
      <TileFace :kind="d.drag" :w="30" />
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import TileFace from './TileFace.vue'
import { debug, debugSay } from '../composables/useDebug.js'

const props = defineProps({ ui: { type: Object, required: true } })
const emit = defineEmits(['swap', 'set-draw', 'clear-draw'])

const d = debug
const who = [{ i: 0, n: '你' }, { i: 1, n: 'AI' }]

const hand = computed(() => (d.target === 0 ? props.ui.myTiles : props.ui.oppTilesList))
const melds = computed(() => (d.target === 0 ? props.ui.myMelds : props.ui.oppMelds))
/** 立直后手牌锁定：这是唯一「特殊情况」的总闸门，副露不在 tiles 里天然改不到 */
const lock = computed(() => (d.target === 0 ? props.ui.myRiichi : props.ui.oppRiichi))

const pick = (i) => { d.target = i; d.slot = -1 }

const isDrawn = (i) => {
  const drawn = d.target === 0 ? props.ui.drawn : props.ui.oppDrawn
  return drawn !== null && i === hand.value.length - 1
}

/** 牌山里有没有这张牌 —— 换牌只从牌山补给，避免动到王牌与宝牌指示牌 */
const canTake = (k) => props.ui.wallAvail[k]

const select = (i) => {
  if (lock.value) return
  d.slot = d.slot === i ? -1 : i
}

/* ------------------------- 拖拽 ------------------------- */

/** 透明占位图：隐藏浏览器默认的拖拽残影，改用下面自己画的跟随牌 */
let blank = null
const blankImg = () => {
  if (!blank) {
    blank = document.createElement('canvas')
    blank.width = blank.height = 1
  }
  return blank
}

const dragStart = (kind, e) => {
  if (canTake(kind) <= 0) { e.preventDefault(); return }
  d.drag = kind
  d.gx = e.clientX + 14
  d.gy = e.clientY + 14
  e.dataTransfer.effectAllowed = 'copy'
  e.dataTransfer.setData('text/plain', String(kind))
  try { e.dataTransfer.setDragImage(blankImg(), 0, 0) } catch (_) { /* 老浏览器不支持就算了 */ }
}

const dragEnd = () => { d.drag = -1; d.over = '' }

/** 拖到哪：key 用 'w0'/'w1'（摸牌槽）与 'h'+下标（手牌）区分 */
const over = (key) => { if (d.drag >= 0) d.over = key }

/** dragleave 会在父子元素间来回触发，relatedTarget 还在自己里面就不算离开 */
const leave = (key, e) => {
  if (d.over !== key) return
  if (e && e.relatedTarget && e.currentTarget && e.currentTarget.contains(e.relatedTarget)) return
  d.over = ''
}

/** 从事件里取牌种：优先用响应式状态，兜底读 dataTransfer */
const kindOf = (e) => {
  if (d.drag >= 0) return d.drag
  const n = parseInt(e.dataTransfer ? e.dataTransfer.getData('text/plain') : '', 10)
  return Number.isInteger(n) && n >= 0 && n < 34 ? n : -1
}

const settle = () => { d.drag = -1; d.over = '' }

const dropTile = (i, e) => {
  const kind = kindOf(e)
  if (kind < 0) return settle()
  if (lock.value) {
    debugSay('已立直，手牌锁定不可替换', 'err')
    return settle()
  }
  d.slot = i
  emit('swap', d.target, i, kind)
  settle()
}

/** 落在手牌区空白处：给个明确的下一步提示，别静默失败 */
const dropHand = (e) => {
  const kind = kindOf(e)
  if (kind < 0) return settle()
  debugSay(lock.value ? '已立直，手牌锁定不可替换' : '拖到某一张手牌上才能替换', 'err')
  settle()
}

const dropDraw = (idx, e) => {
  const kind = kindOf(e)
  if (kind < 0) return settle()
  if (canTake(kind) <= 0) {
    debugSay('牌山里没有这张了', 'err')
    return settle()
  }
  emit('set-draw', idx, kind)
  settle()
}

/** 跟随鼠标的拖拽预览 */
const track = (e) => {
  if (d.drag < 0) return
  d.gx = e.clientX + 14
  d.gy = e.clientY + 14
}
onMounted(() => document.addEventListener('dragover', track))
onUnmounted(() => document.removeEventListener('dragover', track))

const swap = (kind) => {
  if (lock.value) return
  if (canTake(kind) <= 0) return
  if (d.slot < 0) {
    // 没选手牌时默认为「指定下一张摸这张」，比要求先选一张更顺手
    emit('set-draw', d.target, kind)
    return
  }
  emit('swap', d.target, d.slot, kind)
}
</script>

<style scoped lang="scss">
.dbg {
  position: fixed;
  top: 54px;
  right: 10px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 306px;
  max-height: calc(100vh - 74px);
  padding: 10px 12px;
  overflow-y: auto;
  color: #f2efe6;
  background: rgba(6, 18, 14, .95);
  border: 1px solid rgba(255, 217, 61, .35);
  border-radius: 10px;
  box-shadow: 0 12px 34px rgba(0, 0, 0, .55);
}

.d-h { display: flex; align-items: center; gap: 8px; }
.d-h b { font-size: 13px; color: #ffd93d; }

.seg {
  display: flex;
  margin-left: auto;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .18);
  border-radius: 6px;

  button {
    padding: 3px 10px;
    font-size: 11px;
    color: rgba(242, 239, 230, .6);
    cursor: pointer;
    background: none;
    border: none;

    &.on { color: #10281f; background: #ffd93d; }
  }
}

.x {
  padding: 0 6px;
  font-size: 15px;
  color: rgba(242, 239, 230, .5);
  cursor: pointer;
  background: none;
  border: none;
}

.row { display: flex; gap: 6px; align-items: center; font-size: 12px; }
.ck { cursor: pointer; input { cursor: pointer; } }

.sec {
  margin-top: 2px;
  padding-top: 5px;
  font-size: 11px;
  color: rgba(242, 239, 230, .45);
  border-top: 1px solid rgba(255, 255, 255, .1);
}

.hand {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 3px;
  border: 1px dashed transparent;
  border-radius: 6px;

  &.act { border-color: rgba(255, 217, 61, .35); background: rgba(255, 217, 61, .05); }
  &.lock { opacity: .45; }
}

.tl {
  position: relative;
  padding: 2px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 5px;

  &:hover { border-color: rgba(255, 217, 61, .5); }

  &.sel { border-color: #ffd93d; background: rgba(255, 217, 61, .18); }

  &.hit {
    background: rgba(255, 217, 61, .38);
    border-color: #ffd93d;
    transform: translateY(-3px);
  }
}

.dw {
  position: absolute;
  top: -5px;
  right: -4px;
  padding: 0 3px;
  font-size: 9px;
  font-style: normal;
  color: #10281f;
  background: #ffd93d;
  border-radius: 4px;
}

.note {
  font-size: 11px;
  line-height: 1.5;
  color: rgba(242, 239, 230, .5);

  &.lock { color: #ff9838; }
}

.melds { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
.mk { font-size: 11px; color: rgba(242, 239, 230, .45); }

.mel {
  display: inline-flex;
  gap: 2px;
  padding: 2px 4px;
  background: rgba(255, 255, 255, .06);
  border: 1px dashed rgba(255, 255, 255, .2);
  border-radius: 5px;
}

.opp { font-size: 11px; color: rgba(242, 239, 230, .6); b { color: #ffd93d; } }
.dim { color: rgba(242, 239, 230, .35); }

.dr { justify-content: flex-start; }
.who { width: 22px; font-size: 11px; color: rgba(242, 239, 230, .55); }

.drop {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 32px;
  padding: 0 5px;
  background: rgba(255, 255, 255, .04);
  border: 1px dashed rgba(255, 255, 255, .3);
  border-radius: 5px;

  &.on { background: rgba(255, 217, 61, .3); border-color: #ffd93d; border-style: solid; }
  &.set { background: rgba(255, 217, 61, .12); border-style: solid; border-color: rgba(255, 217, 61, .6); }
}

.ph { font-size: 10px; color: rgba(242, 239, 230, .35); }

.pick {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 3px;
}

.cell {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 2px 1px 6px;
  cursor: grab;
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 4px;

  &:hover { background: rgba(255, 217, 61, .18); }

  i {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    font-size: 9px;
    font-style: normal;
    text-align: center;
    color: #ffd93d;
  }

  &.off { cursor: not-allowed; opacity: .28; &:hover { background: rgba(255, 255, 255, .06); } }
  &.dragging { opacity: .3; }
}

.tip { font-size: 10px; color: rgba(242, 239, 230, .3); }
.off { font-size: 11px; color: rgba(242, 239, 230, .35); }

.btn {
  padding: 2px 8px;
  font-size: 11px;
  color: rgba(242, 239, 230, .7);
  cursor: pointer;
  background: rgba(255, 255, 255, .08);
  border: 1px solid rgba(255, 255, 255, .16);
  border-radius: 6px;

  &.ghost { background: none; }
}

.msg {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  padding: 5px 8px;
  font-size: 11px;
  line-height: 1.5;
  border-radius: 6px;

  &.ok { color: #3ddc84; background: rgba(61, 220, 132, .12); }
  &.err { color: #ff8090; background: rgba(255, 95, 109, .14); }
}

.mt { display: inline-flex; gap: 3px; align-items: center; }
.mt i { font-size: 11px; font-style: normal; opacity: .7; }
.mtx { margin-left: 2px; }

.foot { font-size: 10px; color: rgba(242, 239, 230, .4); &.bad { color: #ff5f6d; } }
.abt { border-radius: 3px; }

/* 类名不能叫 .ghost —— 会和下面 .btn.ghost（清除按钮）撞上，把它变成悬浮块 */
.drag-ghost {
  position: fixed;
  z-index: 999;
  padding: 3px;
  pointer-events: none;
  background: rgba(6, 18, 14, .9);
  border: 1px solid #ffd93d;
  border-radius: 5px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .6);
  transform: translate(-50%, -50%) rotate(-4deg);
}
</style>
