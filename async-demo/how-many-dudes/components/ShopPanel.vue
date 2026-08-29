<template>
  <div class="shop-panel">
    <div class="top-bar">
      <div class="round-info">
        <span v-if="isEndless" class="round-badge endless">无尽模式 第 {{ endlessWave + 1 }} 波</span>
        <span v-else class="round-badge">第 {{ round + 1 }} / {{ totalRounds }} 回合</span>
        <span v-if="currentRoundData?.isBoss" class="boss-badge">BOSS 战</span>
      </div>
      <div class="gold-info">
        <span class="gold-icon">💰</span>
        <span class="gold-value">{{ gold }}</span>
      </div>
    </div>

    <div class="enemy-preview">
      <span class="section-label">本回合敌人</span>
      <div class="enemy-list">
        <span v-for="(enemy, i) in previewEnemies" :key="i" class="enemy-chip"
          :class="{ 'enemy-elite': enemy.elite, 'enemy-boss': enemy.boss }">
          <span class="enemy-icon">{{ enemy.boss ? '♛' : enemy.elite ? '✨' : '' }}{{ enemy.icon }}</span>
          <span class="enemy-name">{{ enemy.elite ? '精英' : enemy.boss ? 'Boss' : '' }}{{ enemy.name }}</span>
          <span class="enemy-count">x{{ enemy.count }}</span>
        </span>
      </div>
    </div>

    <div class="shop-section">
      <div class="shop-header">
        <span class="section-label">招募兄弟</span>
        <button class="reroll-btn" @click="onReroll" :disabled="gold < 1">
          🔄 刷新 (1💰)
        </button>
      </div>
      <div class="shop-choices">
        <div v-for="bro in shopChoices" :key="bro.id" class="bro-card"
          :class="{ 'bro-card-disabled': getBuyBlockReason(bro) }"
          :style="{ borderColor: getBuyBlockReason(bro) ? '#475569' : getTierColor(bro.tier) }"
          @click="onBuy(bro)">
          <div class="bro-card-header" :style="{ background: getFamilyColor(bro.family) + '33' }">
            <span class="bro-icon">{{ bro.icon }}</span>
            <span class="bro-name">{{ bro.name }}</span>
            <span v-if="getBuyBlockReason(bro)" class="bro-block-tag">{{ getBuyBlockReason(bro) }}</span>
          </div>
          <div class="bro-card-body">
            <div class="stat-row">
              <span>❤️ {{ bro.maxHp }}</span>
              <span>⚔️ {{ bro.attack }}</span>
            </div>
            <div class="stat-row">
              <span>{{ bro.attackType === 'melee' ? '近战' : bro.attackType === 'ranged' ? '远程' : bro.attackType === 'aoe'
                ? '范围' : '治疗' }}</span>
              <span class="cost-badge">{{ bro.cost }}💰</span>
            </div>
            <p class="bro-desc">{{ bro.description }}</p>
          </div>
        </div>
      </div>
      <transition name="hint-fade">
        <div v-if="buyHint" class="buy-hint">⚠️ {{ buyHint }}</div>
      </transition>
    </div>

    <div class="roster-section">
      <div class="roster-header">
        <span class="section-label">当前阵容 ({{ bros.length }}/{{ currentMaxBros }})</span>
        <span class="hint-text">点击兄弟升级；两个同种同星可合成升星</span>
      </div>
      <div class="roster-list">
        <div v-for="group in groupedBros" :key="group.defId" class="roster-group"
          :style="{ borderColor: getTierColor(group.tier) }">
          <div class="roster-group-header" :style="{ background: getFamilyColor(group.family) + '22' }">
            <span class="roster-icon">{{ group.icon }}</span>
            <span class="roster-name">{{ group.name }}</span>
            <span v-if="group.maxStar > 0" class="group-star">★{{ group.maxStar }}</span>
            <span class="roster-count">×{{ group.items.length }}</span>
          </div>
          <div class="roster-group-items">
            <div v-for="bro in group.items" :key="bro.instanceId" class="roster-item"
              :class="{ 'roster-selected': selectedBroId === bro.instanceId, 'roster-mergeable': canMerge(bro) }"
              @click="toggleSelectBro(bro.instanceId)">
              <span v-if="bro.star > 0" class="star-badge">★{{ bro.star }}</span>
              <span v-if="hasSameStarPartner(bro) && !isFullyMaxed(bro)" class="merge-lock" title="四项强化（攻击/生命/攻速/移速）全部满级后才能参与合成">🔒满级可合</span>
              <span class="roster-hp">❤️{{ bro.maxHp }}</span>
              <span class="roster-atk">⚔️{{ bro.attack }}</span>
              <span v-if="totalUpgradeLevels(bro) > 0" class="upgrade-badge">+{{ totalUpgradeLevels(bro) }}</span>
              <button v-if="canMerge(bro)" class="merge-btn" @click.stop="$emit('merge', bro.instanceId)"
                :title="`与另一只四项满级的★${bro.star}合并为★${bro.star + 1}（${MERGE_COST}金）`">合 {{ MERGE_COST }}💰</button>
              <button class="sell-btn" @click.stop="$emit('sell', bro.instanceId)">卖</button>
            </div>
          </div>
        </div>
        <div v-if="bros.length === 0" class="empty-roster">尚未招募任何兄弟</div>
      </div>

      <div v-if="selectedBro" class="upgrade-panel">
        <div class="upgrade-panel-header">
          <span class="upgrade-bro-name">{{ selectedBro.icon }} {{ selectedBro.name }}<span v-if="selectedBro.star > 0" class="upgrade-star">★{{ selectedBro.star }}</span></span>
          <span class="upgrade-bro-stats">❤️{{ selectedBro.maxHp }} ⚔️{{ selectedBro.attack }} ⚡{{ (1000 / selectedBro.attackSpeed).toFixed(1) }}/s 🏃{{ selectedBro.moveSpeed.toFixed(1) }}</span>
        </div>
        <div class="upgrade-options">
          <button v-for="upg in upgradeTypes" :key="upg.id" class="upgrade-btn"
            :class="{ 'transcend-btn': isTranscend(selectedBro, upg.id) }"
            :disabled="gold < getUpgCost(selectedBro, upg.id)"
            @click.stop="$emit('upgrade', selectedBro.instanceId, upg.id)">
            <span class="upg-icon">{{ upg.icon }}</span>
            <span class="upg-name">{{ upg.name }}</span>
            <span class="upg-level">{{ getUpgLevelText(selectedBro, upg) }}</span>
            <span class="upg-cost">{{ getUpgCost(selectedBro, upg.id) }}💰</span>
          </button>
        </div>
      </div>
    </div>

    <div class="bottom-section">
      <div class="synergy-section">
        <span class="section-label">激活羁绊</span>
        <div class="synergy-list">
          <span v-for="syn in activeSynergies" :key="syn.id" class="synergy-chip" :title="syn.description">
            {{ syn.icon }} {{ syn.name }}
          </span>
          <span v-if="activeSynergies.length === 0" class="empty-text">无</span>
        </div>
      </div>
      <div class="relic-section">
        <span class="section-label">已获遗物</span>
        <div class="relic-list">
          <span v-for="relic in relicDisplayList" :key="relic.id" class="relic-chip" :title="relic.description"
            :class="{ 'relic-refined': relic.refine > 0, 'relic-legendary': relic.rarity === 'legendary' }"
            :style="{ borderColor: getRarityColor(relic.rarity) }">
            {{ relic.icon }} {{ relic.name }}<span v-if="relic.refine > 0" class="refine-mark">✦{{ relic.refine }}</span><span v-if="relic.count > 1" class="relic-count">×{{ relic.count }}</span>
          </span>
          <span v-if="relics.length === 0" class="empty-text">无</span>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button class="fight-btn" :disabled="bros.length === 0" @click="$emit('fight')">
        {{ bros.length === 0 ? '至少招募 1 个兄弟' : (isEndless ? '迎战无尽！⚔️' : '开战！⚔️') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  getEnemyDef, getTierColor, getRarityColor, UPGRADE_TYPES, getUpgradeCost, getUpgradeDef,
  getTranscendCost, RELIC_MAP, MAX_DUPLICATES, MERGE_COST, MAX_STAR,
} from '../constants.js';

const props = defineProps({
  round: Number,
  totalRounds: Number,
  gold: Number,
  bros: Array,
  relics: Array,
  shopChoices: Array,
  activeSynergies: Array,
  currentRoundData: Object,
  currentMaxBros: Number,
  isEndless: Boolean,
  endlessWave: Number,
});

const emit = defineEmits(['buy', 'reroll', 'sell', 'fight', 'upgrade', 'merge']);

const selectedBroId = ref(null);

/** 遗物显示列表（从 { id, count, refine } 映射为完整显示对象） */
const relicDisplayList = computed(() => {
  return props.relics.map((r) => {
    const def = RELIC_MAP[r.id];
    if (!def) return null;
    return { ...def, count: r.count, refine: r.refine || 0 };
  }).filter(Boolean);
});

const selectedBro = computed(() => {
  if (!selectedBroId.value) return null;
  return props.bros.find((b) => b.instanceId === selectedBroId.value) || null;
});

/** 按种类(defId)分组，方便在大量兄弟中快速定位某一类 */
const groupedBros = computed(() => {
  const map = new Map();
  for (const bro of props.bros) {
    if (!map.has(bro.defId)) {
      map.set(bro.defId, {
        defId: bro.defId,
        icon: bro.icon,
        name: bro.name,
        tier: bro.tier,
        family: bro.family,
        maxStar: 0,
        items: [],
      });
    }
    const group = map.get(bro.defId);
    group.items.push(bro);
    group.maxStar = Math.max(group.maxStar, bro.star || 0);
  }
  return Array.from(map.values());
});

const upgradeTypes = UPGRADE_TYPES;

const previewEnemies = computed(() => {
  if (!props.currentRoundData) return [];
  return props.currentRoundData.enemies.map((e) => ({
    ...getEnemyDef(e.id),
    count: e.count,
    elite: !!e.elite,
    boss: !!e.boss,
  }));
});

/**
 * 判断兄弟四项强化是否全部满级（攻击/生命/攻速/移速 ≥ maxLevel，含超限）
 * @param {Object} bro
 * @returns {boolean}
 */
const isFullyMaxed = (bro) =>
  UPGRADE_TYPES.every((u) => (bro.upgradeLevels?.[u.id] || 0) >= u.maxLevel);

/** 判断是否存在同种同星的其他兄弟（不看强化，用于锁定提示） */
const hasSameStarPartner = (bro) =>
  props.bros.some((b) => b.instanceId !== bro.instanceId && b.defId === bro.defId && (b.star || 0) === (bro.star || 0));

/** 判断是否存在同种同星且四项满级的可合成对象 */
const hasMergePartner = (bro) =>
  props.bros.some((b) => b.instanceId !== bro.instanceId && b.defId === bro.defId && (b.star || 0) === (bro.star || 0) && isFullyMaxed(b));

/**
 * 判断该兄弟是否可合成升星
 * 前提：自身四项强化满级 + 存在同种同星且四项满级的另一只 + 金币足够 + 未到星级上限
 * @param {Object} bro
 * @returns {boolean}
 */
const canMerge = (bro) => {
  if ((bro.star || 0) >= MAX_STAR) return false;
  if (props.gold < MERGE_COST) return false;
  if (!isFullyMaxed(bro)) return false;
  return hasMergePartner(bro);
};

const getFamilyColor = (family) => {
  const colors = {
    undead: '#7c3aed', warrior: '#dc2626', fantasy: '#2563eb',
    'sci-fi': '#0891b2', action: '#ea580c', office: '#64748b',
  };
  return colors[family] || '#64748b';
};

const buyHint = ref(null);
let buyHintTimer = null;

/**
 * 检查购买是否被阻止，返回阻止原因或 null
 * @param {Object} bro - 商店中的兄弟定义
 * @returns {string|null}
 */
const getBuyBlockReason = (bro) => {
  if (props.gold < bro.cost) return '金币不足';
  if (props.bros.length >= props.currentMaxBros) return `阵容已满 (${props.bros.length}/${props.currentMaxBros})`;
  const dupCount = props.bros.filter((b) => b.defId === bro.id).length;
  if (dupCount >= MAX_DUPLICATES) return `同种已达上限 (${MAX_DUPLICATES}/${MAX_DUPLICATES})`;
  return null;
};

const onBuy = (bro) => {
  const reason = getBuyBlockReason(bro);
  if (reason) {
    buyHint.value = reason;
    if (buyHintTimer) clearTimeout(buyHintTimer);
    buyHintTimer = setTimeout(() => { buyHint.value = null; }, 2000);
    return;
  }
  emit('buy', bro);
};

const onReroll = () => {
  emit('reroll');
};

const toggleSelectBro = (instanceId) => {
  selectedBroId.value = selectedBroId.value === instanceId ? null : instanceId;
};

const totalUpgradeLevels = (bro) => {
  const lv = bro.upgradeLevels || {};
  return (lv.attack || 0) + (lv.maxHp || 0) + (lv.attackSpeed || 0) + (lv.moveSpeed || 0);
};

/** 是否已进入超限档（普通等级已满） */
const isTranscend = (bro, upgradeId) => {
  const def = getUpgradeDef(upgradeId);
  if (!def) return false;
  return (bro.upgradeLevels[upgradeId] || 0) >= def.maxLevel;
};

/** 升级按钮费用：普通档线性，超限档指数 */
const getUpgCost = (bro, upgradeId) => {
  const lv = bro.upgradeLevels[upgradeId] || 0;
  if (isTranscend(bro, upgradeId)) {
    return getTranscendCost(upgradeId, bro.transLevels?.[upgradeId] || 0);
  }
  return getUpgradeCost(upgradeId, lv);
};

/** 升级按钮等级文案：普通档 Lv.X/max，超限档 Lv.X · 超限n */
const getUpgLevelText = (bro, upg) => {
  const lv = bro.upgradeLevels[upg.id] || 0;
  if (isTranscend(bro, upg.id)) {
    return `Lv.${lv} · 超限${bro.transLevels?.[upg.id] || 0}`;
  }
  return `Lv.${lv}/${upg.maxLevel}`;
};
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.shop-panel {
  height: calc(100% - 16px * 2);
  overflow-y: auto;
  padding: 16px;
  background: #0f0f1a;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 440px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.round-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.round-badge {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  background: #1e293b;
  border: 1px solid #334155;

  &.endless {
    background: #7c2d12;
    border-color: #f97316;
    color: #fdba74;
  }
}

.boss-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: #7f1d1d;
  color: #fca5a5;
}

.gold-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 18px;
  font-weight: 700;
}

.gold-icon {
  font-size: 16px;
}

.section-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
  display: block;
}

.enemy-preview {
  padding: 4px 0;
}

.enemy-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.enemy-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 10px;
  background: #1e293b;
  border: 1px solid #334155;
  font-size: 12px;

  &.enemy-elite {
    background: #3a2a08;
    border-color: #fde047;
    color: #fde047;
  }

  &.enemy-boss {
    background: #3a0a0a;
    border-color: #ef4444;
    color: #fca5a5;
  }
}

.enemy-icon {
  font-size: 14px;
}

.enemy-count {
  color: #f87171;
  font-weight: 600;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.reroll-btn {
  padding: 3px 10px;
  font-size: 12px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
  color: #94a3b8;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: #e2e8f0;
    border-color: #475569;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.shop-choices {
  display: flex;
  gap: 8px;
}

.bro-card {
  flex: 1;
  border: 2px solid;
  border-radius: 8px;
  background: #1e293b;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  overflow: hidden;
  position: relative;

  &:hover {
    transform: translateY(-3px);
  }
}

.bro-card-disabled {
  opacity: 0.45;
  cursor: not-allowed;

  &:hover {
    transform: none;
  }
}

.bro-block-tag {
  margin-left: auto;
  font-size: 9px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 8px;
  background: #7f1d1d;
  color: #fca5a5;
  white-space: nowrap;
}

.buy-hint {
  margin-top: 6px;
  padding: 4px 10px;
  font-size: 12px;
  color: #fca5a5;
  background: rgba(127, 29, 29, 0.3);
  border: 1px solid #7f1d1d;
  border-radius: 6px;
  text-align: center;
}

.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: opacity 0.25s;
}

.hint-fade-enter-from,
.hint-fade-leave-to {
  opacity: 0;
}

.bro-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  font-size: 13px;
  font-weight: 600;
}

.bro-icon {
  font-size: 18px;
}

.bro-card-body {
  padding: 8px;
  font-size: 11px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
  color: #94a3b8;
}

.cost-badge {
  color: #fbbf24;
  font-weight: 600;
}

.bro-desc {
  margin: 4px 0 0;
  font-size: 10px;
  color: #64748b;
  line-height: 1.4;
}

.roster-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.hint-text {
  font-size: 10px;
  color: #475569;
  margin-bottom: 6px;
}

.roster-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.roster-group {
  border: 2px solid;
  border-radius: 8px;
  background: #1e293b;
  overflow: hidden;
}

.roster-group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
}

.roster-count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  color: #fbbf24;
  background: #0f0f1a;
  padding: 1px 8px;
  border-radius: 8px;
}

.roster-group-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px;
}

.roster-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border: 1px solid #334155;
  border-radius: 5px;
  background: #0f172a;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #233046;
    border-color: #475569;
  }

  &.roster-selected {
    background: #1e3a5f;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
}

.roster-hp {
  color: #22c55e;
  font-size: 10px;
}

.roster-atk {
  color: #f87171;
  font-size: 10px;
}

.upgrade-badge {
  display: inline-block;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 700;
  border-radius: 4px;
  background: #f59e0b;
  color: #000;
}

.star-badge {
  display: inline-block;
  padding: 0 4px;
  font-size: 9px;
  font-weight: 700;
  border-radius: 4px;
  background: #fde047;
  color: #713f12;
}

.group-star {
  font-size: 11px;
  font-weight: 700;
  color: #fde047;
}

.upgrade-star {
  margin-left: 4px;
  color: #fde047;
  font-size: 12px;
}

.roster-mergeable {
  border-color: #fde047;
  box-shadow: 0 0 3px rgba(253, 224, 71, 0.35);
}

.merge-lock {
  margin-left: 2px;
  font-size: 10px;
  color: #94a3b8;
  cursor: help;
}

.merge-btn {
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid #fde047;
  border-radius: 4px;
  background: rgba(253, 224, 71, 0.12);
  color: #fde047;
  cursor: pointer;

  &:hover {
    background: rgba(253, 224, 71, 0.3);
  }
}

.sell-btn {
  padding: 1px 6px;
  font-size: 10px;
  border: 1px solid #334155;
  border-radius: 4px;
  background: transparent;
  color: #64748b;
  cursor: pointer;

  &:hover {
    color: #ef4444;
    border-color: #ef4444;
  }
}

.empty-roster {
  font-size: 12px;
  color: #475569;
  padding: 8px 0;
}

.upgrade-panel {
  margin-top: 8px;
  padding: 10px;
  border-radius: 8px;
  background: #181828;
  border: 1px solid #334155;
}

.upgrade-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.upgrade-bro-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.upgrade-bro-stats {
  font-size: 11px;
  color: #94a3b8;
}

.upgrade-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.upgrade-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #f59e0b;
    background: #293548;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &.transcend-btn {
    border-color: #b45309;
    background: #2a1f08;

    .upg-level {
      color: #fbbf24;
      font-weight: 600;
    }

    &:hover:not(:disabled) {
      border-color: #fde047;
      background: #3a2a08;
    }
  }
}

.upg-icon {
  font-size: 18px;
}

.upg-name {
  font-size: 11px;
  font-weight: 600;
}

.upg-level {
  font-size: 10px;
  color: #64748b;
}

.upg-cost {
  font-size: 11px;
  font-weight: 700;
  color: #fbbf24;
}

.bottom-section {
  display: flex;
  gap: 16px;
}

.synergy-section,
.relic-section {
  flex: 1;
}

.synergy-list,
.relic-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.synergy-chip {
  padding: 3px 8px;
  border-radius: 10px;
  background: #1e3a5f;
  border: 1px solid #3b82f6;
  font-size: 11px;
  color: #93c5fd;
}

.relic-chip {
  padding: 3px 8px;
  border: 1px solid;
  border-radius: 10px;
  background: #1e293b;
  font-size: 11px;

  &.relic-refined {
    background: #3a2a08;
  }

  &.relic-legendary {
    background: #2a1d05;
    color: #fde68a;
    box-shadow: 0 0 6px rgba(245, 158, 11, 0.35);
  }
}

.refine-mark {
  color: #fde047;
  font-weight: 700;
  margin-left: 2px;
}

.relic-count {
  color: #f97316;
  font-weight: 700;
  margin-left: 2px;
}

.empty-text {
  font-size: 11px;
  color: #475569;
}

.action-bar {
  padding-top: 2px;
}

.fight-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #dc2626, #ea580c);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
