<template>
  <aside class="rec">
    <div class="tabs">
      <button v-for="t in TABS" :key="t.key" class="tab" :class="{ on: tab === t.key }" @click="tab = t.key">
        {{ t.name }}
      </button>
    </div>

    <div class="body">
      <!-- 宝牌（常驻） -->
      <div class="dora" v-if="ui.dora.length">
        <div class="d-h">宝牌 <i>杠 {{ ui.dora.length - 1 }} 次</i></div>
        <div class="d-row">
          <span class="d-lab">指示牌</span>
          <TileFace v-for="(d, i) in ui.dora" :key="'i' + i" :kind="d" :w="22" />
        </div>
        <div class="d-row">
          <span class="d-lab">宝牌</span>
          <TileFace v-for="(d, i) in ui.doraKinds" :key="'k' + i" :kind="d" :w="22" class="dk" />
          <span class="d-num" :class="{ zero: !ui.myDora }">你手上 {{ ui.myDora }} 张</span>
        </div>
      </div>

      <!-- 已打牌 -->
      <section v-if="tab === 'discarded'">
        <div class="grp" v-for="g in groups" :key="g.key">
          <div class="g-h">{{ g.name }}</div>
          <div class="cells">
            <span v-for="(t, i) in g.list" :key="i" class="cell" :class="{ zero: g.seen[t.kind] >= 4, few: g.seen[t.kind] >= 3 }"
              @click="pick(g, t)" @mouseenter="hover = g.key + '-' + t.kind" @mouseleave="hover = ''">
              <TileFace :kind="t.kind" :w="18" /><i>×{{ t.count }}</i>
            </span>
          </div>
        </div>
        <p class="tip">点击任意一张可查看「谁 · 第几巡」打出</p>
        <div v-if="picked" class="pick">
          <span>最近一次</span><TileFace :kind="picked.kind" :w="18" /><span>{{ picked.who }} 于第 {{ picked.turn + 1 }} 巡打出</span>
        </div>
      </section>

      <!-- 剩余牌 -->
      <section v-else-if="tab === 'remaining'">
        <div class="sort">
          <span>排序</span>
          <button :class="{ on: !desc }" @click="desc = false">剩余升序</button>
          <button :class="{ on: desc }" @click="desc = true">剩余降序</button>
        </div>
        <div class="grp" v-for="g in remainGroups" :key="g.key">
          <div class="g-h">{{ g.name }} <i>剩 {{ g.total }}</i></div>
          <div class="cells">
            <span v-for="t in g.list" :key="t.kind" class="cell" :class="{ zero: t.remaining <= 0, few: t.remaining === 1 }">
              <TileFace :kind="t.kind" :w="18" /><i>{{ t.remaining }}</i>
            </span>
          </div>
        </div>
        <p class="tip">未确认剩余 = 4 − 已见牌（自己手牌 + 双方副露 + 双方牌河）</p>
      </section>

      <!-- 可凑役种 -->
      <section v-else>
        <div v-if="recorder.yakuman.length" class="grp">
          <div class="g-h yk">役满进度</div>
          <div v-for="p in shown(recorder.yakuman, 6)" :key="p.key" class="prog" :class="{ done: p.status === 'ACHIEVED' }">
            <div class="p-1">
              <b>{{ p.name }}</b>
              <span class="han">{{ p.han }}番</span>
              <span class="pg">{{ p.have }}/{{ p.need }}</span>
              <span class="sf" v-if="p.soft">+{{ p.soft }}搭</span>
            </div>
            <div class="bar"><div class="fill" :style="{ width: pct(p) + '%' }"></div></div>
            <div class="miss" v-if="missList(p).length">
              <span class="mk">缺</span>
              <span v-for="(m, i) in missList(p)" :key="i" class="mi">
                <TileFace v-if="m.tile >= 0" :kind="m.tile" :w="15" />
                <b v-else>{{ m.label }}</b>
                <i>×{{ m.need }}</i>
                <em v-if="m.remaining">剩{{ m.remaining }}</em>
              </span>
            </div>
            <div class="miss" v-else-if="p.note">{{ p.note }}</div>
          </div>
        </div>

        <div class="grp">
          <div class="g-h">普通役进度</div>
          <div v-for="p in shown(recorder.normal, 10)" :key="p.key" class="prog" :class="{ done: p.status === 'ACHIEVED' }">
            <div class="p-1">
              <b>{{ p.name }}</b>
              <span class="han">{{ p.han }}番</span>
              <span class="pg">{{ p.have }}/{{ p.need }}</span>
              <span class="sf" v-if="p.soft">+{{ p.soft }}搭</span>
            </div>
            <div class="bar"><div class="fill" :style="{ width: pct(p) + '%' }"></div></div>
            <div class="miss" v-if="missList(p).length">
              <span class="mk">缺</span>
              <span v-for="(m, i) in missList(p)" :key="i" class="mi">
                <TileFace v-if="m.tile >= 0" :kind="m.tile" :w="15" />
                <b v-else>{{ m.label }}</b>
                <i>×{{ m.need }}</i>
                <em v-if="m.remaining">剩{{ m.remaining }}</em>
              </span>
            </div>
            <div class="miss" v-else-if="p.note">{{ p.note }}</div>
          </div>
        </div>

        <div class="more">
          <button class="mb" :class="{ on: more }" @click="more = !more">
            {{ more ? '收起' : `展开全部（役满 ${recorder.yakuman.length} · 普通 ${recorder.normal.length}）` }}
          </button>
          <span class="mt">进度条含可转化搭子/对子；<em>+N搭</em> 表示尚未成面但已成形</span>
        </div>

        <div class="grp">
          <div class="g-h">听牌 · 进张</div>
          <div class="waits">
            <span class="wt">{{ ui.waitExact ? '听牌：' : '可听：' }}</span>
            <template v-if="ui.waits.length">
              <span v-for="w in ui.waits" :key="w.tile" class="chip wait has" :class="waitClass(w)">
                <TileFace :kind="w.tile" :w="20" /><i>{{ w.remaining }}</i>
                <em class="tag">{{ waitTag(w) }}</em>
              </span>
            </template>
            <span v-else class="no">未听牌（当前 {{ ui.shanten }} 向听）</span>
          </div>
          <div class="fnote" v-if="ui.permFuriten">
            <span>舍牌振听：已打过</span>
            <TileFace v-for="t in ui.permHits" :key="t" :kind="t" :w="16" class="fh" />
            <span>→ 全部待牌只能自摸，立直收益大幅下降</span>
          </div>
          <div class="fnote temp" v-else-if="ui.tempFuriten">
            同巡振听：本巡放弃过和牌 → 下次摸牌前只能自摸
          </div>
          <div class="fnote noyaku" v-else-if="ui.waits.some((w) => !w.tsumo)">
            无役：这些牌凑齐了也没有役，荣和自摸都不行 —— 立直本身是 1 番役，可解
          </div>
          <div class="leg">
            <span class="lg"><em class="tag ok">荣·摸</em>可荣和可自摸</span>
            <span class="lg"><em class="tag perm">仅摸</em>舍牌振听</span>
            <span class="lg"><em class="tag temp">仅摸</em>同巡振听</span>
            <span class="lg"><em class="tag ny">无役</em>凑齐也无役</span>
          </div>
          <div class="waits" v-if="ui.advance.length">
            <span class="wt">进张：</span>
            <span v-for="a in ui.advance.slice(0, 16)" :key="a.tile" class="chip has">
              <TileFace :kind="a.tile" :w="20" /><i>{{ a.remaining }}</i>
            </span>
          </div>
        </div>
      </section>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import TileFace from './TileFace.vue'

const props = defineProps({
  recorder: { type: Object, required: true },
  ui: { type: Object, required: true },
  state: { type: Object, required: true },
})

const TABS = [
  { key: 'discarded', name: '已打牌' },
  { key: 'remaining', name: '剩余牌' },
  { key: 'yaku', name: '可凑役种' },
]
const tab = ref('yaku')
const desc = ref(false)
const hover = ref('')
const picked = ref(null)
const more = ref(false)

const GROUPS = [
  { key: 'm', name: '万子' },
  { key: 'p', name: '筒子' },
  { key: 's', name: '索子' },
  { key: 'z', name: '字牌' },
]

/** 每张待牌的和牌方式标注 */
const waitTag = (w) => {
  if (w.ron) return '荣·摸'
  return w.tsumo ? '仅摸' : '无役'
}

const waitClass = (w) => ({
  perm: !w.ron && props.ui.permFuriten,
  temp: !w.ron && !props.ui.permFuriten && props.ui.tempFuriten,
  noyaku: !w.tsumo,
})

const rangeOf = (k) => {
  const b = { m: 0, p: 9, s: 18, z: 27 }[k]
  return { b, e: k === 'z' ? 34 : b + 9 }
}

const groups = computed(() => GROUPS.map((g) => {
  const { b, e } = rangeOf(g.key)
  const list = []
  for (let k = b; k < e; k++) list.push({ kind: k, count: props.recorder.seen[k] })
  return { ...g, list, seen: props.recorder.seen }
}))

const remainGroups = computed(() => GROUPS.map((g) => {
  const { b, e } = rangeOf(g.key)
  const list = []
  for (let k = b; k < e; k++) list.push({ kind: k, remaining: props.recorder.remaining[k] })
  if (desc.value) list.sort((a, b2) => b2.remaining - a.remaining)
  else list.sort((a, b2) => a.remaining - b2.remaining)
  return { ...g, list, total: list.reduce((a, x) => a + x.remaining, 0) }
}))

/** 进度条按接近度：已具备要素 + 可转化搭子/对子×0.5 */
const pct = (p) => Math.min(100, Math.round((p.score ?? p.have / p.need) * 100))
const missList = (p) => p.missing.filter((m) => m.need > 0).slice(0, 4)
const shown = (arr, n) => (more.value ? arr : arr.slice(0, n))

const pick = (g, t) => {
  const log = []
  props.state.players.forEach((p, pi) => {
    p.river.forEach((d) => { if (d.kind === t.kind) log.push({ who: pi === 0 ? '你' : 'AI', turn: d.turn, kind: t.kind }) })
  })
  picked.value = log.length ? log[log.length - 1] : { who: '无人', turn: 0, kind: t.kind }
}
</script>

<style scoped lang="scss">
.rec {
  display: flex;
  flex-direction: column;
  width: 320px;
  min-height: 0;
  background: rgba(0, 0, 0, .34);
  border-left: 1px solid rgba(255, 255, 255, .1);
}

.tabs { display: flex; flex: none; }

.tab {
  flex: 1;
  padding: 11px 0;
  font-size: 13px;
  color: rgba(242, 239, 230, .55);
  cursor: pointer;
  background: rgba(255, 255, 255, .04);
  border: none;
  border-bottom: 2px solid transparent;

  &.on { color: #ffd93d; background: rgba(255, 217, 61, .1); border-bottom-color: #ffd93d; }
}

.body { flex: 1; padding: 12px 14px; overflow-y: auto; }

.dora {
  padding: 8px 10px;
  margin-bottom: 14px;
  background: rgba(255, 217, 61, .08);
  border: 1px solid rgba(255, 217, 61, .28);
  border-radius: 10px;
}

.d-h {
  margin-bottom: 7px;
  font-size: 11px;
  letter-spacing: 2px;
  color: #ffd93d;

  i { font-style: normal; color: rgba(242, 239, 230, .45); }
}

.d-row { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; margin-top: 4px; }

.d-lab { font-size: 11px; color: rgba(242, 239, 230, .5); }

.d-num { font-size: 11px; font-weight: 700; color: #ffd93d; }

.d-num.zero { font-weight: 400; color: rgba(242, 239, 230, .4); }

.dk { outline: 1.5px solid #ffd93d; }

.grp { margin-bottom: 16px; }

.g-h {
  margin-bottom: 7px;
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(242, 239, 230, .5);

  i { font-style: normal; color: #ffd93d; }

  &.yk { color: #ff5f6d; }
}

.cells { display: flex; flex-wrap: wrap; gap: 4px; }

.cell {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 26px;
  padding: 3px 4px;
  cursor: default;
  background: rgba(255, 255, 255, .07);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 6px;

  i { font-style: normal; font-size: 10px; line-height: 1; color: rgba(242, 239, 230, .55); }

  &.few { background: rgba(255, 95, 109, .18); border-color: rgba(255, 95, 109, .45); }

  &.zero { filter: grayscale(1); background: rgba(255, 255, 255, .03); opacity: .32; }
}

.tip {
  margin: 6px 0 0;
  font-size: 11px;
  line-height: 1.6;
  color: rgba(242, 239, 230, .35);
}

.pick {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 7px 9px;
  font-size: 11px;
  background: rgba(61, 220, 132, .12);
  border: 1px solid rgba(61, 220, 132, .35);
  border-radius: 8px;
}

.sort {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 11px;
  color: rgba(242, 239, 230, .5);

  button {
    padding: 4px 8px;
    font-size: 11px;
    color: rgba(242, 239, 230, .6);
    cursor: pointer;
    background: rgba(255, 255, 255, .05);
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 6px;

    &.on { color: #ffd93d; border-color: #ffd93d; }
  }
}

.prog {
  padding: 8px 0 10px;
  border-bottom: 1px dashed rgba(255, 255, 255, .07);

  &.done b { color: #3ddc84; }
}

.p-1 { display: flex; align-items: baseline; gap: 8px; }

.p-1 b { font-size: 13px; color: #f2efe6; }

.han { font-size: 11px; color: rgba(242, 239, 230, .45); }

.pg { margin-left: auto; font-size: 12px; font-weight: 700; color: #ffd93d; }

.sf {
  padding: 1px 5px;
  font-size: 10px;
  color: rgba(242, 239, 230, .55);
  background: rgba(255, 255, 255, .07);
  border-radius: 999px;
}

.more {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 10px 0 4px;

  .mb {
    align-self: flex-start;
    padding: 5px 10px;
    font-size: 11px;
    color: #4aa8ff;
    cursor: pointer;
    background: rgba(74, 168, 255, .1);
    border: 1px solid rgba(74, 168, 255, .3);
    border-radius: 7px;

    &:hover, &.on { background: rgba(74, 168, 255, .2); }
  }

  .mt {
    font-size: 10px;
    line-height: 1.5;
    color: rgba(242, 239, 230, .35);

    em { font-style: normal; color: rgba(242, 239, 230, .6); }
  }
}

.bar {
  height: 4px;
  margin: 6px 0;
  overflow: hidden;
  background: rgba(255, 255, 255, .1);
  border-radius: 999px;
}

.fill { height: 100%; background: linear-gradient(90deg, #3ddc84, #ffd93d); border-radius: 999px; transition: width .2s; }

.miss { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 11px; line-height: 1.6; color: rgba(242, 239, 230, .45); }

.mk { color: rgba(242, 239, 230, .35); }

.mi {
  display: inline-flex;
  align-items: center;
  gap: 3px;

  b { font-size: 11px; font-weight: 400; color: rgba(242, 239, 230, .6); }

  i { font-style: normal; font-size: 10px; color: rgba(242, 239, 230, .6); }

  em { font-style: normal; font-size: 10px; color: rgba(242, 239, 230, .35); }
}

.fh { border-radius: 3px; }

.waits { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px; }

.wt { font-size: 11px; color: rgba(242, 239, 230, .45); }

.no { font-size: 11px; color: rgba(242, 239, 230, .4); }

.chip {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  padding: 3px 6px;
  font-size: 12px;
  background: rgba(255, 255, 255, .07);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 6px;

  i { font-style: normal; font-size: 10px; color: rgba(242, 239, 230, .5); }

  &.wait { background: rgba(255, 217, 61, .16); border-color: rgba(255, 217, 61, .5); }

  &.has { align-items: center; padding: 2px 5px; }

  .tag {
    font-style: normal;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 4px;
    color: #10281f;
    background: #ffd93d;
    border-radius: 4px;
  }

  &.perm {
    background: rgba(255, 95, 109, .18);
    border-color: rgba(255, 95, 109, .6);

    .tag { color: #fff; background: rgba(255, 95, 109, .85); }
  }

  &.temp {
    background: rgba(255, 152, 56, .18);
    border-color: rgba(255, 152, 56, .6);

    .tag { color: #241505; background: #ff9838; }
  }

  &.noyaku {
    background: rgba(255, 255, 255, .06);
    border-color: rgba(255, 255, 255, .22);

    .tag { color: #f2efe6; background: rgba(255, 255, 255, .22); }
  }
}

.leg {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 10px;
  color: rgba(242, 239, 230, .45);
}

.lg { display: inline-flex; gap: 4px; align-items: center; }

.leg .tag {
  font-style: normal;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 4px;

  &.ok { color: #10281f; background: #ffd93d; }
  &.perm { color: #fff; background: rgba(255, 95, 109, .85); }
  &.temp { color: #241505; background: #ff9838; }
  &.ny { color: #f2efe6; background: rgba(255, 255, 255, .22); }
}

.fnote {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin: 4px 0 8px;
  padding: 5px 8px;
  font-size: 11px;
  line-height: 1.5;
  color: #ff5f6d;
  background: rgba(255, 95, 109, .1);
  border-left: 2px solid rgba(255, 95, 109, .6);
  border-radius: 0 6px 6px 0;

  &.temp { color: #ff9838; background: rgba(255, 152, 56, .1); border-left-color: rgba(255, 152, 56, .6); }

  &.noyaku { color: rgba(242, 239, 230, .6); background: rgba(255, 255, 255, .06); border-left-color: rgba(255, 255, 255, .3); }
}
</style>
