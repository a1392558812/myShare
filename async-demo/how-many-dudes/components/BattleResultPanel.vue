<template>
  <div class="result-overlay">
    <div class="result-card">
      <h2 class="result-title">胜利！</h2>
      <p class="result-subtitle">{{ isEndless ? `无尽第 ${endlessWave + 1} 波 cleared` : `第 ${round + 1} 回合 cleared` }}</p>

      <div v-if="relicCandidates && relicCandidates.length > 0" class="relic-choice">
        <p class="choice-label">选择一件遗物（可叠加）</p>
        <div v-if="legendaryUnlocked" class="legendary-banner">✨ 传说遗物池已解锁</div>
        <div class="candidates-row">
          <div
            v-for="relic in relicCandidates"
            :key="relic.id"
            class="candidate-card"
            :class="{ 'candidate-refine': isRefineCandidate(relic.id), 'candidate-legendary': relic.rarity === 'legendary' }"
            :style="{ borderColor: isRefineCandidate(relic.id) ? '#fde047' : getRarityColor(relic.rarity) }"
            @click="$emit('pick', relic.id)"
          >
            <div class="candidate-header">
              <span class="relic-icon">{{ relic.icon }}</span>
              <span
                v-if="isRefineCandidate(relic.id)"
                class="refine-badge"
                title="已满层，本次选择将升格该遗物"
              >升格 ✦{{ getOwnedRefine(relic.id) }}</span>
              <span
                v-else-if="getOwnedCount(relic.id) > 0"
                class="owned-badge"
              >×{{ getOwnedCount(relic.id) }}</span>
              <span v-else class="new-badge">新</span>
            </div>
            <span class="relic-name">{{ relic.name }}</span>
            <span class="relic-rarity" :style="{ color: getRarityColor(relic.rarity) }">{{ rarityText(relic.rarity) }}</span>
            <p class="relic-desc">{{ relic.description }}</p>
            <div v-if="isRefineCandidate(relic.id)" class="relic-preview">
              <span class="preview-current">效果 ×{{ (1 + 0.25 * getOwnedRefine(relic.id)).toFixed(2) }}</span>
              <span class="preview-arrow">→</span>
              <span class="preview-next">×{{ (1 + 0.25 * (getOwnedRefine(relic.id) + 1)).toFixed(2) }}</span>
              <span class="preview-cap">上限 ×1.75</span>
            </div>
            <div v-if="getRelicPreview(relic.id)" class="relic-preview">
              <span v-if="getRelicPreview(relic.id).current > 0" class="preview-current">
                当前 {{ getRelicPreview(relic.id).currentMult.toFixed(3) }}x
              </span>
              <span class="preview-arrow">→</span>
              <span class="preview-next">
                选择后 {{ getRelicPreview(relic.id).nextMult.toFixed(3) }}x
              </span>
              <span class="preview-cap">上限 1.5x</span>
            </div>
            <div v-if="relic.maxStacks && !isRefineCandidate(relic.id)" class="stack-info">
              {{ getOwnedCount(relic.id) }}/{{ relic.maxStacks }}
            </div>
          </div>
        </div>
        <div class="choice-btns">
          <button
            class="btn-reforge"
            :class="{ disabled: gold < reforgeCost }"
            :disabled="gold < reforgeCost"
            @click="$emit('reforge')"
          >
            💰 重铸 ({{ reforgeCost }}金)
          </button>
          <button class="btn-skip" @click="$emit('skip')">跳过</button>
        </div>
      </div>
      <div v-else class="no-relics">
        <p>所有遗物已收集完毕！</p>
        <button class="btn-skip" @click="$emit('skip')">继续</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getRarityColor, logMult15 } from '../constants.js';

const props = defineProps({
  round: Number,
  relicCandidates: Array,
  isEndless: Boolean,
  endlessWave: Number,
  gold: Number,
  reforgeCost: Number,
  ownedRelics: Array,
  legendaryUnlocked: Boolean,
});

defineEmits(['pick', 'skip', 'reforge']);

const rarityText = (rarity) => {
  const map = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' };
  return map[rarity] || '';
};

const getOwnedCount = (relicId) => {
  if (!props.ownedRelics) return 0;
  const found = props.ownedRelics.find((r) => r.id === relicId);
  return found ? found.count : 0;
};

/** 已升格次数 */
const getOwnedRefine = (relicId) => {
  if (!props.ownedRelics) return 0;
  const found = props.ownedRelics.find((r) => r.id === relicId);
  return found ? (found.refine || 0) : 0;
};

/** 是否为升格候选（该遗物已满层） */
const isRefineCandidate = (relicId) => {
  const relic = props.relicCandidates.find((r) => r.id === relicId);
  if (!relic || !relic.maxStacks) return false;
  return getOwnedCount(relicId) >= relic.maxStacks;
};

const LOG_RELIC_IDS = ['crystalBall', 'auraRing', 'holyHalo'];

const getRelicPreview = (relicId) => {
  if (!LOG_RELIC_IDS.includes(relicId)) return null;
  const current = getOwnedCount(relicId);
  const currentMult = current > 0 ? logMult15(current) : 0;
  const nextMult = logMult15(current + 1);
  return { current, currentMult, nextMult };
};
</script>

<style scoped>
.result-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.result-card {
  background: #1a1a2e;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 32px 40px;
  text-align: center;
  min-width: 380px;
  max-width: 90%;
}

.result-title {
  font-size: 28px;
  font-weight: 700;
  color: #22c55e;
  margin: 0 0 4px;
}

.result-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 24px;
}

.choice-label {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 16px;
}

.candidates-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.candidate-card {
  border: 2px solid;
  border-radius: 10px;
  padding: 16px 12px;
  background: #0f0f1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
  max-width: 160px;

  &:hover {
    background: #1a1a2e;
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  &.candidate-refine {
    background: #2a1f08;

    &:hover {
      background: #3a2a08;
      box-shadow: 0 4px 12px rgba(253, 224, 71, 0.25);
    }
  }

  &.candidate-legendary {
    background: linear-gradient(180deg, #2a1d05 0%, #0f0f1a 62%);
    box-shadow: 0 0 14px rgba(245, 158, 11, 0.22), inset 0 0 20px rgba(245, 158, 11, 0.07);

    &:hover {
      background: linear-gradient(180deg, #3a2a08 0%, #1a1a2e 62%);
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
    }
  }
}

.legendary-banner {
  display: inline-block;
  margin: 0 auto 14px;
  padding: 6px 16px;
  font-size: 12px;
  font-weight: 700;
  color: #fbbf24;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.12);
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
}

.refine-badge {
  position: absolute;
  top: -6px;
  right: -4px;
  background: #fde047;
  color: #713f12;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
}

.candidate-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.relic-icon {
  font-size: 36px;
}

.owned-badge {
  position: absolute;
  top: -6px;
  right: -4px;
  background: #f97316;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
}

.new-badge {
  position: absolute;
  top: -6px;
  right: -4px;
  background: #22c55e;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
}

.relic-name {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.relic-rarity {
  font-size: 11px;
  font-weight: 600;
}

.relic-desc {
  font-size: 11px;
  color: #94a3b8;
  margin: 4px 0 0;
  line-height: 1.4;
}

.stack-info {
  font-size: 10px;
  color: #64748b;
  margin-top: 4px;
}

.relic-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 10px;
}

.preview-current {
  color: #64748b;
}

.preview-arrow {
  color: #475569;
}

.preview-next {
  color: #fbbf24;
  font-weight: 600;
}

.preview-cap {
  color: #475569;
  font-size: 9px;
}

.choice-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-reforge {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #f97316;
  border-radius: 8px;
  background: transparent;
  color: #f97316;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(.disabled) {
    background: rgba(249, 115, 22, 0.15);
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.btn-skip {
  padding: 8px 20px;
  font-size: 14px;
  border: 1px solid #475569;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  &:hover { color: #94a3b8; border-color: #64748b; }
}

.no-relics {
  color: #64748b;
  font-size: 14px;
}
</style>
