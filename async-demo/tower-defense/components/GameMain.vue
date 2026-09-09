<template>
  <div ref="rootRef" class="game-main">
    <!-- 左侧：浮层控制面板（暗底 / teal 描边 / monospace） -->
    <aside class="panel">
      <h3 class="panel-title">建造塔</h3>
      <div class="quick-build">
        <button v-for="(k, i) in towerKeys" :key="k"
          :class="['build-btn', { active: state.selectedBuildKind === k }]"
          :disabled="!canBuild(k)"
          @click="onSelectBuild(k)">
          <div class="name">{{ towerDefs[k]?.name || k }}</div>
          <div class="cost">💰{{ towerDefs[k]?.cost ?? 0 }}</div>
          <div class="hot">[{{ i + 1 }}]</div>
        </button>
      </div>

      <h3 class="panel-title">选中建筑</h3>
      <div v-if="!state.selectedTower" class="tower-empty">点击地图上的建筑查看成长详情</div>
      <div v-else class="tower-info">
        <div class="ti-head">
          <span class="ti-name">{{ state.selectedTower.def.name }}</span>
          <span :class="['ti-lv', { max: isSelMax }]">Lv {{ selLevel }} / {{ selMaxLevel }}</span>
        </div>
        <div class="ti-bar">
          <i v-for="n in selMaxLevel" :key="n" :class="{ on: n <= selLevel }"></i>
        </div>
        <div class="ti-stats">
          <div v-for="s in selStats" :key="s.k"><span>{{ s.k }}</span><b>{{ s.v }}</b></div>
        </div>
        <div v-if="state.selectedTower.kind === TOWER_KIND.TECH" class="ti-line">
          技能：<b :class="{ un: !selTechSkillName }">{{ selTechSkillName || '未选择' }}</b>
        </div>
        <div v-if="state.selectedTower.kind === TOWER_KIND.BARRACKS" class="ti-line">
          集结点：<b>{{ rallyLabel }}</b> · 小兵 <b>{{ selSummonCount }}/{{ selSummonMax }}</b>
        </div>
      </div>

      <h3 class="panel-title">操作</h3>
      <div class="op-row">
        <button :disabled="!state.selectedTower || state.moveCount >= 8 || state.gold < moveCost(state.selectedTower)"
          @click="onMoveTower">移动 [M]</button>
        <button :disabled="!state.selectedTower || isSelMax || !canUpgradeSel" @click="onUpgradeTower">
          {{ isSelMax ? '已满级' : `升级 [U] 💰${selUpgradeCost}` }}
        </button>
        <button :disabled="!state.selectedTower" @click="onSellTower">出售 [X]</button>
      </div>
      <div v-if="state.selectedTower?.kind === TOWER_KIND.BARRACKS" class="op-row">
        <button @click="onSetRally">设置集结点 [R]</button>
        <span class="hint-inline">集结点：{{ rallyLabel }}</span>
      </div>
      <div v-if="state.selectedTower?.kind === TOWER_KIND.TECH" class="skill-picker">
        <div class="picker-title">前哨站技能</div>
        <div class="op-row">
          <button v-for="sk in techSkills" :key="sk"
            :class="{ 'skill-active': state.selectedTower?.skillKind === sk, 'skill-stack': isStackable(sk) }"
            :disabled="!canPickSkill(sk)"
            @click="onAssignSkill(sk)">
            {{ skillLabel(sk) }}
          </button>
        </div>
        <div class="hint-inline">
          {{ selTechSkillName ? `已选：${selTechSkillName}（等级随前哨站提升）` : '未选择：请点选一个技能' }}
        </div>
        <div class="hint-inline pact-tip">
          血契可叠加：多座前哨站都能选，每层按塔等级给英雄加生命/减伤/吸血；满级血契塔额外提供 1 次复活
        </div>
      </div>
      <div class="op-row">
        <button :disabled="state.waveActive" @click="onStartWave">
          {{ state.waveActive ? `波次进行中（剩 ${state.enemyRemain}）` : '开始下一波 [S]' }}
        </button>
        <button @click="onPauseToggle">{{ state.paused ? '继续' : '暂停 [Space]' }}</button>
        <button @click="onReset">重开 [R]</button>
      </div>
      <div class="op-row">
        <button @click="onBack">← 返回 [Esc]</button>
      </div>

      <h3 class="panel-title">状态</h3>
      <div class="stat-grid">
        <div><span>波次</span><b>{{ state.wave }}/{{ state.maxWave }}{{ state.endless ? ' ∞' : '' }}</b></div>
        <div><span>金币</span><b class="gold">{{ state.gold }}</b></div>
        <div><span>漏怪</span><b :class="{ danger: state.leak >= config.leakLimit * 0.7 }">{{ state.leak }}/{{ config.leakLimit }}</b></div>
        <div><span>击杀</span><b>{{ state.killed }}</b></div>
        <div><span>英雄 HP</span><b :class="{ danger: state.hero.hp / state.hero.maxHp <= 0.5 }">{{ state.hero.hp | 0 }}/{{ state.hero.maxHp }}</b></div>
        <div><span>移动次数</span><b>{{ state.moveCount }}/8</b></div>
        <div><span>血契层数</span><b class="pact">{{ pactInfo.stacks }}</b></div>
        <div><span>额外生命</span><b class="pact">+{{ pactInfo.hp }}</b></div>
        <div><span>减伤</span><b class="pact">{{ Math.round(pactInfo.dr * 100) }}%</b></div>
        <div><span>吸血</span><b class="pact">{{ Math.round(pactInfo.lifesteal * 100) }}%</b></div>
        <div><span>可复活</span><b :class="{ pact: pactInfo.revives > 0 }">{{ pactInfo.revives }} 次</b></div>
      </div>

      <h3 class="panel-title">说明</h3>
      <div class="tips">
        <p><b>建造</b>：左侧选塔 → 地图可建区点击放置（黄框=可建）</p>
        <p><b>英雄</b>：WASD 移动；站上某路径 32px 内可阻挡敌人；自动普攻 84px 内最近敌人</p>
        <p><b>升级/出售</b>：点中已建塔 → 操作面板按升级 / 出售；移动用 M</p>
        <p><b>反隐塔</b>：侦测光环内使隐身显形（其他塔需此才打）</p>
        <p><b>科技前哨站</b>：每造 1 座解锁新技能（最多 4 座）</p>
        <p><b>满级</b>：所有建筑统一 6 级（Lv1 → Lv6）</p>
      </div>

      <div class="op-row panel-foot">
        <button class="debug-toggle" :class="{ on: state.showDebug }" @click="onToggleDebug">
          🐞 调试面板 [~]
        </button>
      </div>
    </aside>

    <!-- 调试面板：默认关闭，与游玩信息完全隔离 -->
    <aside v-if="state.showDebug" class="debug-panel">
      <div class="dbg-head">
        <span>🐞 调试面板</span>
        <button class="dbg-close" @click="onToggleDebug">✕</button>
      </div>
      <div class="dbg-note">调参仅在调试面板，不影响正常游玩</div>

      <div class="dbg-title">参数</div>
      <div class="form-row">
        <label>起始金币</label>
        <input type="range" min="100" max="500" step="25" :value="config.startGold"
          @input="onConfig('startGold', +$event.target.value)" />
        <span>{{ config.startGold }}</span>
      </div>
      <div class="form-row">
        <label>敌速倍率</label>
        <input type="range" min="0.5" max="2.0" step="0.05" :value="config.enemySpeedK"
          @input="onConfig('enemySpeedK', +$event.target.value)" />
        <span>{{ config.enemySpeedK.toFixed(2) }}</span>
      </div>
      <div class="form-row">
        <label>英雄HP</label>
        <input type="range" min="0.5" max="3.0" step="0.1" :value="config.heroHpK"
          @input="onConfig('heroHpK', +$event.target.value)" />
        <span>{{ config.heroHpK.toFixed(2) }}</span>
      </div>
      <div class="form-row">
        <label>漏怪上限</label>
        <input type="range" min="5" max="50" step="1" :value="config.leakLimit"
          @input="onConfig('leakLimit', +$event.target.value)" />
        <span>{{ config.leakLimit }}</span>
      </div>
      <div class="hint-inline">起始金币重开后生效，其余即时生效</div>

      <div class="dbg-title">作弊</div>
      <div class="op-row">
        <button @click="onDebugGold">+💰500</button>
        <button @click="onDebugKill">秒杀全场</button>
      </div>
      <div class="op-row">
        <button @click="onDebugHeal">英雄满血</button>
        <button @click="onDebugWave">跳至下一波</button>
      </div>

      <div class="dbg-title">运行时</div>
      <div class="dbg-grid">
        <div><span>FPS</span><b>{{ dbg.fps || 0 }}</b></div>
        <div><span>帧</span><b>{{ dbg.frame || 0 }}</b></div>
        <div><span>敌人</span><b>{{ dbg.enemyCount || 0 }}</b></div>
        <div><span>待生成</span><b>{{ state.spawnLeft || 0 }}</b></div>
        <div><span>塔</span><b>{{ dbg.towerCount || 0 }}</b></div>
        <div><span>小兵</span><b>{{ dbg.summonCount || 0 }}</b></div>
        <div><span>弹幕</span><b>{{ dbg.projectileCount || 0 }}</b></div>
        <div><span>鼠标格</span><b>{{ dbgCell }}</b></div>
      </div>
      <div class="hint-inline">画布已叠加：射程圈 / 敌人血量 / 集结点连线</div>
    </aside>

    <!-- 中部：canvas 居中 -->
    <div class="canvas-wrap">
      <canvas ref="canvasRef" class="game-canvas"
        @pointerdown.prevent="onPointerDown"
        @pointermove="onPointerMove"
        @contextmenu.prevent="onContext" />
    </div>

    <!-- 失败 / 通关 浮层 -->
    <div v-if="state.gameOver" class="overlay">
      <div class="panel-end">
        <div class="title-fail">失 败</div>
        <div class="sub">漏怪 {{ state.leak }} · 击杀 {{ state.killed }}</div>
        <div class="row">
          <button class="btn" @click="$emit('restart')">重玩</button>
          <button class="btn btn-secondary" @click="$emit('back')">返回首页</button>
        </div>
      </div>
    </div>
    <div v-else-if="state.victory && !state.endless" class="overlay">
      <div class="panel-end">
        <div class="title-win">通 关！</div>
        <div class="sub">进入无尽挑战</div>
        <div class="row">
          <button class="btn" @click="$emit('restart')">继续</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, shallowRef, watch, computed } from 'vue';
import { createGame } from '../composables/useGame.js';
import {
  TOWER_DEFS, TOWER_KIND, nextUpgradeCost, isMaxLevel, maxDisplayLevel,
} from '../config/towers.js';
import {
  SKILL_DEFS, SKILL_KIND, TECH_PICKABLE_SKILLS, isStackableSkill,
} from '../config/skills.js';
import { CELL } from '../config/paths.js';

const emit = defineEmits(['restart', 'back']);

const props = defineProps({
  initialConfig: {
    type: Object,
    default: () => ({ startGold: 200, enemySpeedK: 1.0, heroHpK: 1.0, leakLimit: 20 }),
  },
});

const rootRef = ref(null);
const canvasRef = ref(null);
const config = reactive({ ...props.initialConfig });

const game = shallowRef(null);
const towerDefs = ref({ ...TOWER_DEFS });
const towerKeys = [
  TOWER_KIND.BARRACKS, TOWER_KIND.CANNON,
  TOWER_KIND.ARROW, TOWER_KIND.TECH, TOWER_KIND.DETECTOR,
];

const state = ref(snapshot());
let syncRafId = null;

function snapshot() {
  return {
    selectedBuildKind: null,
    selectedTower: null,
    wave: 0, waveActive: false, waveCountdown: 0, maxWave: 30, endless: false, leak: 0,
    gold: 0, hero: { hp: 100, maxHp: 100 }, moveCount: 0,
    paused: false,
    gameOver: false,
    victory: false,
    enemyRemain: 0,
    spawnLeft: 0,
    showDebug: false,
    hoveredCell: null,
    summons: [],
    towers: [],
    bloodPact: { hp: 0, dr: 0, lifesteal: 0, stacks: 0, revives: 0 },
    debug: {},
  };
}

const canBuild = (k) => state.value.gold >= towerDefs.value[k]?.cost;
const moveCost = (t) => t ? (t.def.cost * 0.3) | 0 : 0;

// 调试面板：默认关闭
const dbg = computed(() => state.value.debug || {});
const dbgCell = computed(() => {
  const c = state.value.hoveredCell;
  return c ? `${c.gx},${c.gy}` : '-';
});
const onToggleDebug = () => game.value?.toggleDebug?.();

// ===== 前哨站技能：互斥技能 + 可叠加的血契 =====
const techSkills = TECH_PICKABLE_SKILLS;
const isStackable = (sk) => isStackableSkill(sk);
const techTowers = computed(() =>
  (state.value.towers || []).filter((t) => t.kind === TOWER_KIND.TECH));
// 某技能被多少座前哨站选择（血契会 > 1）
const skillStackCount = (sk) =>
  techTowers.value.filter((t) => t.skillKind === sk).length;
const skillLabel = (sk) => {
  const n = skillStackCount(sk);
  return n > 1 ? `${SKILL_DEFS[sk]?.name || sk} ×${n}` : (SKILL_DEFS[sk]?.name || sk);
};
const canPickSkill = (sk) => {
  const t = state.value.selectedTower;
  if (!t || t.kind !== TOWER_KIND.TECH) return false;
  if (isStackableSkill(sk)) return true;
  // 互斥技能：本塔已选其他技能 → 置灰；其他前哨站已占用 → 置灰
  if (t.skillKind && t.skillKind !== sk) return false;
  return !techTowers.value.some((o) => o.id !== t.id && o.skillKind === sk);
};
const pactInfo = computed(() => state.value.bloodPact || { hp: 0, dr: 0, lifesteal: 0, stacks: 0, revives: 0 });

const rallyLabel = computed(() => {
  const t = state.value.selectedTower;
  if (!t || t.kind !== TOWER_KIND.BARRACKS) return '未设置';
  return t.rally ? `(${t.rally.gx},${t.rally.gy})` : '塔位';
});

// ===== 选中建筑：等级 / 成长 / 升级态 =====
const selTower = () => state.value.selectedTower;
const selLevel = computed(() => (selTower() ? (selTower().level || 0) + 1 : 0));
const selMaxLevel = computed(() => (selTower() ? maxDisplayLevel(selTower().kind) : 1));
const isSelMax = computed(() =>
  (selTower() ? isMaxLevel(selTower().kind, selTower().level) : false));
const selUpgradeCost = computed(() => {
  const t = selTower();
  if (!t || isSelMax.value) return 0;
  return nextUpgradeCost(t.kind, t.level);
});
const canUpgradeSel = computed(() =>
  !!selTower() && !isSelMax.value && state.value.gold >= selUpgradeCost.value);
const selTechSkillName = computed(() => {
  const t = selTower();
  return t && t.skillKind ? (SKILL_DEFS[t.skillKind]?.name || t.skillKind) : '';
});
const selSummonCount = computed(() => {
  const t = selTower();
  if (!t || t.kind !== TOWER_KIND.BARRACKS) return 0;
  return (state.value.summons || []).filter((s) => s.towerId === t.id).length;
});
const selSummonMax = computed(() => {
  const t = selTower();
  if (!t || t.kind !== TOWER_KIND.BARRACKS) return 0;
  const d = t.def;
  return Math.min(d.maxSummons, d.summonStart + d.summonPerLevel * (t.level || 0));
});
const pick = (arrOrVal, lv) => {
  if (Array.isArray(arrOrVal)) return arrOrVal[Math.min(lv, arrOrVal.length - 1)];
  return arrOrVal;
};
const selStats = computed(() => {
  const t = selTower();
  if (!t) return [];
  const d = t.def;
  const lv = t.level || 0;
  const p = (v) => v;
  switch (t.kind) {
    case TOWER_KIND.BARRACKS:
      return [
        { k: '小兵上限', v: `${Math.min(d.maxSummons, d.summonStart + d.summonPerLevel * lv)}` },
        { k: '小兵生命', v: p(pick(d.summonHp, lv)) },
        { k: '小兵伤害', v: p(pick(d.summonDmg, lv)) },
        { k: '集结范围', v: `${(pick(d.rallyRange, lv) / CELL).toFixed(1)}格` },
        { k: '小兵索敌', v: `${(d.aggroRange / CELL).toFixed(1)}格` },
        { k: '补给延迟', v: `${(pick(d.resupplyDelay, lv) / 1000).toFixed(1)}s` },
      ];
    case TOWER_KIND.CANNON:
      return [
        { k: '伤害', v: p(pick(d.dmg, lv)) },
        { k: '射程', v: `${(pick(d.range, lv) / CELL).toFixed(1)}格` },
        { k: '冷却', v: `${(pick(d.attackInterval, lv) / 1000).toFixed(2)}s` },
        { k: '溅射', v: `${(pick(d.splash, lv) / CELL).toFixed(1)}格` },
        { k: '洲际导弹', v: lv >= 2 ? `每${(pick(d.missileInterval, lv) / 1000).toFixed(0)}s` : 'Lv3 解锁' },
        { k: '火焰灼烧', v: lv >= 2 ? `${Math.round(pick(d.fireChance, lv) * 100)}%` : 'Lv3 解锁' },
      ];
    case TOWER_KIND.ARROW:
      return [
        { k: '伤害', v: p(pick(d.dmg, lv)) },
        { k: '射程', v: `${(pick(d.range, lv) / CELL).toFixed(1)}格` },
        { k: '冷却', v: `${(pick(d.attackInterval, lv) / 1000).toFixed(2)}s` },
      ];
    case TOWER_KIND.TECH: {
      const base = [
        { k: '攻击伤害', v: lv >= 2 ? p(pick(d.techAttackDmg, lv)) : 'Lv3 解锁' },
        { k: '攻击射程', v: lv >= 2 ? `${(pick(d.techAttackRange, lv) / CELL).toFixed(1)}格` : 'Lv3 解锁' },
        { k: '减速', v: lv >= 2 ? `${Math.round(pick(d.techSlow, lv) * 100)}%` : 'Lv3 解锁' },
        { k: '英雄HP', v: `+${(lv) * 12}` },
        { k: '英雄伤害', v: `+${(lv) * 3}` },
      ];
      // 血契：本塔提供的英雄加成（可多塔叠加）
      if (t.skillKind === SKILL_KIND.BLOOD_PACT) {
        const b = SKILL_DEFS[SKILL_KIND.BLOOD_PACT].heroBonus;
        const i = Math.min(lv, b.hp.length - 1);
        base.push(
          { k: '血契生命', v: `+${b.hp[i]}` },
          { k: '血契减伤', v: `+${Math.round(b.dr[i] * 100)}%` },
          { k: '血契吸血', v: `+${Math.round(b.lifesteal[i] * 100)}%` },
          { k: '血契复活', v: lv >= 5 ? '1 次（抵命）' : 'Lv6 解锁' },
        );
      }
      return base;
    }
    case TOWER_KIND.DETECTOR:
      return [
        { k: '侦测半径', v: `${(pick(d.range, lv) / CELL).toFixed(1)}格` },
        { k: '毒雾', v: lv >= 2 ? `每${(pick(d.poisonInterval, lv) / 1000).toFixed(0)}s` : 'Lv3 解锁' },
        { k: '毒雾 DPS', v: lv >= 2 ? p(pick(d.poisonDps, lv)) : 'Lv3 解锁' },
        { k: '增伤', v: lv >= 2 ? `+${Math.round((pick(d.poisonDmgAmp, lv) - 1) * 100)}%` : 'Lv3 解锁' },
      ];
    default:
      return [];
  }
});

const onConfig = (k, v) => {
  config[k] = v;
  game.value?.applyConfig?.({ ...config });
};

const onSelectBuild = (k) => {
  if (!game.value) return;
  const s = game.value.state;
  s.selectedBuildKind = s.selectedBuildKind === k ? null : k;
  s.selectedTower = null;
};

const onMoveTower = () => {
  const s = game.value?.state;
  if (!s?.selectedTower) return;
  if (s.moveCount >= 8) return;
  const cost = (s.selectedTower.def.cost * 0.3) | 0;
  if (s.gold < cost) return;
  s.moveSelected = s.selectedTower;
  s.message = { text: '点击目标格子移动（右键取消）', color: '#94a3b8', t: 0, life: 1500 };
};

const onUpgradeTower = () => {
  const s = game.value?.state;
  if (!s?.selectedTower) return;
  game.value?.upgradeTower?.(s.selectedTower);
};

const onSellTower = () => {
  const s = game.value?.state;
  if (!s?.selectedTower) return;
  game.value?.sellTower?.(s.selectedTower);
};

const onSetRally = () => game.value?.setRallyMode?.();
const onAssignSkill = (sk) => {
  const t = game.value?.state?.selectedTower;
  if (!t || t.kind !== TOWER_KIND.TECH) return;
  game.value?.assignTechSkill?.(t.id, sk);
};

const onStartWave = () => game.value?.startNextWave?.();
const onPauseToggle = () => { const s = game.value?.state; if (s) s.paused = !s.paused; };
const onReset = () => game.value?.reset?.();
const onDebugGold = () => game.value?.debugAddGold?.(500);
const onDebugKill = () => game.value?.debugKillAll?.();
const onDebugHeal = () => game.value?.debugHeal?.();
const onDebugWave = () => game.value?.startNextWave?.();
const onBack = () => emit('back');

const onPointerDown = (e) => game.value?.onClick?.(e);
const onPointerMove = (e) => game.value?.onMouseMove?.(e);
const onContext = (e) => game.value?.onRightClick?.(e);

const onKey = (e, down) => {
  if (!down && e.key === 'Escape') { emit('back'); return; }
  if (!down && (e.key === '`' || e.key === '~')) { onToggleDebug(); return; }
  game.value?.onKey?.(e, down);
};

const syncState = () => {
  const s = game.value?.state;
  if (s) {
    state.value = {
      selectedBuildKind: s.selectedBuildKind,
      selectedTower: s.selectedTower,
      wave: s.wave, waveActive: s.waveActive, waveCountdown: s.waveCountdown,
      maxWave: s.maxWave, endless: s.endless, leak: s.leak,
      gold: s.gold, hero: s.hero, moveCount: s.moveCount,
      paused: s.paused, gameOver: s.gameOver, victory: s.victory,
      enemyRemain: s.enemies.length + (s.spawnQueue ? s.spawnQueue.length : 0),
      spawnLeft: s.spawnQueue ? s.spawnQueue.length : 0,
      showDebug: s.showDebug,
      hoveredCell: s.hoveredCell,
      summons: s.summons,
      towers: s.towers.map((t) => ({
        id: t.id, kind: t.kind, skillKind: t.skillKind, level: t.level,
      })),
      bloodPact: { ...(s.bloodPact || {}) },
      debug: { ...s.debug },
    };
    towerDefs.value = s.towerDefs;
  }
  syncRafId = requestAnimationFrame(syncState);
};

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  game.value = createGame(canvas, { startGold: config.startGold });
  game.value.resize();
  game.value.start();
  syncState();
  window.addEventListener('keydown', (e) => onKey(e, true));
  window.addEventListener('keyup', (e) => onKey(e, false));
});

onBeforeUnmount(() => {
  if (syncRafId) cancelAnimationFrame(syncRafId);
  game.value?.stop?.();
  window.removeEventListener('keydown', (e) => onKey(e, true));
  window.removeEventListener('keyup', (e) => onKey(e, false));
});
</script>

<style scoped lang="scss">
.game-main {
  position: relative;
  width: 100%;
  height: 100%;
  background: #020409;
  font-family: 'Menlo', 'Consolas', 'Roboto Mono', monospace;
  color: #eaf6ff;
  display: grid;
  grid-template-columns: 320px 1fr;
  grid-template-rows: 1fr;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.panel {
  width: 320px;
  height: 100%;
  background: rgba(2, 8, 15, 0.92);
  border-right: 1px solid #1b7f8a;
  padding: 14px 16px 24px;
  overflow-y: auto;
  box-sizing: border-box;
}

.panel-title {
  margin: 16px 0 8px;
  font-size: 12px;
  letter-spacing: 2px;
  color: #7df3ff;
  border-left: 2px solid #3ee6d8;
  padding-left: 8px;
  text-transform: uppercase;
}

.form-row {
  display: grid;
  grid-template-columns: 88px 1fr 56px;
  gap: 8px;
  align-items: center;
  margin: 5px 0;
  font-size: 11px;

  label {
    color: #8899aa;
    letter-spacing: 0.5px;
  }

  input[type='range'] {
    width: 100%;
    accent-color: #3ee6d8;
    background: transparent;
  }

  span {
    color: #eaf6ff;
    text-align: right;
  }
}

.quick-build {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;

  .build-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 6px 8px;
    background: #0b1f2e;
    border: 1px solid #1b4a55;
    border-radius: 3px;
    cursor: pointer;
    color: #eaf6ff;
    transition: all 0.12s;

    &:hover:not(:disabled) {
      background: #143246;
      border-color: #3ee6d8;
    }

    &.active {
      border-color: #3ee6d8;
      box-shadow: 0 0 6px rgba(62, 230, 216, 0.4);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .name { font-size: 12px; font-weight: 600; }
    .cost { font-size: 11px; color: #fcd34d; margin-top: 2px; }
    .hot  { font-size: 10px; color: #6b8b97; margin-top: 2px; }
  }
}

.tower-empty {
  font-size: 10px;
  color: #6b8b97;
  padding: 10px 8px;
  background: #06141d;
  border: 1px dashed #1b4a55;
  border-radius: 3px;
  text-align: center;
}

.tower-info {
  background: #06141d;
  border: 1px solid #1b4a55;
  border-radius: 3px;
  padding: 8px;

  .ti-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;

    .ti-name { font-size: 12px; font-weight: 600; color: #eaf6ff; }
    .ti-lv {
      font-size: 11px;
      color: #3ee6d8;

      &.max { color: #fcd34d; }
    }
  }

  .ti-bar {
    display: flex;
    gap: 2px;
    margin: 6px 0;

    i {
      flex: 1;
      height: 4px;
      background: #12303f;
      border-radius: 1px;

      &.on {
        background: #3ee6d8;
        box-shadow: 0 0 4px rgba(62, 230, 216, 0.5);
      }
    }
  }

  .ti-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 8px;
    font-size: 10px;

    > div { display: flex; justify-content: space-between; }
    span { color: #7f93a5; }
    b { color: #eaf6ff; }
  }

  .ti-line {
    font-size: 10px;
    color: #7f93a5;
    margin-top: 6px;

    b {
      color: #7df3ff;

      &.un { color: #ef4444; }
    }
  }
}

.op-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0;

  button {
    flex: 1 1 auto;
    padding: 5px 8px;
    background: #0b1f2e;
    border: 1px solid #1b4a55;
    border-radius: 3px;
    color: #eaf6ff;
    font-family: inherit;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.12s;

    &:hover:not(:disabled) {
      background: #143246;
      border-color: #3ee6d8;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  background: #06141d;
  padding: 8px;
  border-radius: 3px;
  font-size: 11px;

  > div {
    display: flex;
    justify-content: space-between;

    span { color: #8899aa; }
    b {
      color: #eaf6ff;
      font-family: inherit;
    }
    .gold { color: #fcd34d; }
    .danger { color: #ef4444; }
    .pact { color: #f472b6; }
  }
}

.hint-inline {
  font-size: 10px;
  color: #6b8b97;
  align-self: center;
}

.skill-picker {
  margin: 4px 0;

  .picker-title {
    font-size: 11px;
    color: #7df3ff;
    margin: 4px 0;
    letter-spacing: 1px;
  }

  .skill-active {
    border-color: #3ee6d8 !important;
    box-shadow: 0 0 6px rgba(62, 230, 216, 0.4);
    background: #143246 !important;
  }

  // 可叠加技能（血契）：粉色描边区分
  .skill-stack {
    border-color: #f472b6 !important;
    color: #f9a8d4;
  }

  .pact-tip {
    display: block;
    margin-top: 4px;
    line-height: 1.5;
    color: #c084fc;
  }
}

.tips {
  font-size: 10px;
  color: #7f93a5;
  line-height: 1.7;

  p { margin: 2px 0; }
  b { color: #fbbf24; }
}

.panel-foot { margin-top: 18px; }

.debug-toggle {
  border-style: dashed !important;
  color: #94a3b8 !important;

  &.on {
    border-color: #f59e0b !important;
    color: #fbbf24 !important;
    background: #2a1c06 !important;
  }
}

// 调试面板：与游玩信息隔离，橙色虚线标识
.debug-panel {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 268px;
  max-height: calc(100% - 20px);
  overflow-y: auto;
  z-index: 30;
  box-sizing: border-box;
  padding: 10px 12px 14px;
  background: rgba(20, 12, 2, 0.95);
  border: 1px dashed #b45309;
  border-radius: 3px;
  font-size: 11px;

  .dbg-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fbbf24;
    font-size: 12px;
    letter-spacing: 1px;
    padding-bottom: 6px;
    border-bottom: 1px dashed #7c4a12;
  }

  .dbg-close {
    width: 20px;
    height: 20px;
    padding: 0;
    font-family: inherit;
    font-size: 11px;
    background: transparent;
    border: 1px solid #7c4a12;
    border-radius: 2px;
    color: #fbbf24;
    cursor: pointer;

    &:hover { background: #3a2508; }
  }

  .dbg-note {
    margin: 6px 0;
    font-size: 10px;
    color: #a1743a;
  }

  .dbg-title {
    margin: 10px 0 4px;
    font-size: 11px;
    letter-spacing: 1px;
    color: #fbbf24;
  }

  .dbg-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px 8px;
    padding: 6px;
    background: rgba(2, 8, 15, 0.6);
    border-radius: 3px;
    font-size: 10px;

    > div { display: flex; justify-content: space-between; }
    span { color: #a1743a; }
    b { color: #fde68a; }
  }

  .form-row { grid-template-columns: 62px 1fr 40px; }

  .op-row button {
    font-size: 10px;
    color: #fde68a;
    background: #241705;
    border-color: #7c4a12;

    &:hover:not(:disabled) {
      background: #3a2508;
      border-color: #f59e0b;
    }
  }
}

.canvas-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.game-canvas {
  display: block;
  width: min(672px, 84vh);
  height: min(672px, 84vh);
  cursor: crosshair;
  background: #02060d;
  box-shadow: 0 0 24px rgba(62, 230, 216, 0.12), 0 0 60px rgba(0, 0, 0, 0.6);
  image-rendering: pixelated;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  z-index: 20;
}

.panel-end {
  text-align: center;
  padding: 24px 36px;
  background: rgba(2, 8, 15, 0.85);
  border: 1px solid #1b7f8a;
  border-radius: 4px;
  min-width: 280px;
}

.title-fail {
  font-size: 28px;
  letter-spacing: 6px;
  color: #ef4444;
  margin-bottom: 8px;
}

.title-win {
  font-size: 28px;
  letter-spacing: 6px;
  color: #22c55e;
  margin-bottom: 8px;
}

.sub {
  font-size: 13px;
  color: #eaf6ff;
  margin-bottom: 16px;
}

.row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn {
  padding: 8px 22px;
  font-size: 13px;
  letter-spacing: 2px;
  background: #3ee6d8;
  color: #020409;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-family: inherit;

  &:hover { background: #7df3ff; }
}

.btn-secondary {
  background: transparent;
  color: #3ee6d8;
  border: 1px solid #3ee6d8;

  &:hover { background: rgba(62, 230, 216, 0.12); }
}
</style>
