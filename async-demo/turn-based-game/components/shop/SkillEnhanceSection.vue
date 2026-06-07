<template>
  <div class="shop-section">
    <h3>⚔️ 技能强化</h3>
    <div class="character-tabs">
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'player' }"
        @click="currentTab = 'player'"
      >
        玩家技能
      </button>
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'pet' }"
        @click="currentTab = 'pet'"
        v-if="hasPet"
      >
        宠物技能
      </button>
    </div>

    <div class="skill-enhance-grid">
      <div
        v-for="(skill, index) in currentSkills"
        :key="skill.id || index"
        class="skill-enhance-card"
      >
        <div class="skill-icon">{{ getSkillIcon(skill.type) }}</div>
        <div class="skill-info">
          <div class="skill-header">
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-enhance-level">强化 Lv.{{ skill.enhanceLevel || 0 }}</span>
          </div>
          <div class="skill-desc">{{ skill.description }}</div>
          <div class="skill-details">
            <span class="skill-cost">基础消耗: {{ skill.cost }} MP</span>
            <span v-if="skill.enhanceLevel > 0" class="skill-reduction">
              消耗减免: -{{ calculateSkillEnhanceReducePercent(skill) }}%
            </span>
            <span v-if="skill.damage" class="skill-damage">伤害: {{ skill.damage }}</span>
            <span class="skill-target">{{ skill.targetType === 'all' ? '群体' : '单体' }}</span>
          </div>
          <div class="skill-progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${(skill.enhanceLevel / maxEnhanceLevel) * 100}%` }"
            ></div>
          </div>
        </div>
        <div class="enhance-actions">
          <div class="enhance-cost">💰{{ calculateSkillEnhanceCost(skill, GAME_CONFIG) }}</div>
          <button
            class="enhance-btn"
            :disabled="!canEnhance(skill, index)"
            @click="handleEnhance(index)"
          >
            {{ getButtonText(skill) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { gameState } from "../../stores/gameStore.js";
import { GAME_CONFIG } from "../../stores/constants.js";
import { calculateSkillEnhanceCost, calculateSkillEnhanceReducePercent } from "../../stores/utils.js";

const props = defineProps({
  getSkillIcon: { type: Function, required: true },
});

const emit = defineEmits(["enhance"]);

const currentTab = ref("player");
const maxEnhanceLevel = GAME_CONFIG.SHOP.SKILL_ENHANCE.MAX_LEVEL;

const player = computed(() => gameState.player);
const pet = computed(() => gameState.pet);
const hasPet = computed(() => !!gameState.pet);
const playerGold = computed(() => gameState.player.gold);

const currentSkills = computed(() => {
  if (currentTab.value === "player") {
    return player.value.skills || [];
  } else {
    return pet.value.skills || [];
  }
});

const currentCharacter = computed(() => {
  return currentTab.value === "player" ? player.value : pet.value;
});

const canEnhance = (skill, index) => {
  if (skill.enhanceLevel >= maxEnhanceLevel) return false;
  const cost = calculateSkillEnhanceCost(skill, GAME_CONFIG);
  return playerGold.value >= cost;
};

const getButtonText = (skill) => {
  if (skill.enhanceLevel >= maxEnhanceLevel) return "已满级";
  return `强化 (Lv.${skill.enhanceLevel + 1})`;
};

const handleEnhance = (index) => {
  const character = currentTab.value === "player" ? player.value : pet.value;
  emit("enhance", { character, index, isPet: currentTab.value === "pet" });
};
</script>

<style scoped lang="scss">
.character-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  padding: 10px 24px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #aaa;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-color: #3b82f6;
    color: white;
  }
}

.skill-enhance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 12px;
}

.skill-enhance-card {
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(59, 130, 246, 0.4);
    background: rgba(59, 130, 246, 0.05);
  }
}

.skill-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.skill-info {
  flex: 1;
  min-width: 0;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.skill-name {
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.skill-enhance-level {
  color: #3b82f6;
  font-weight: bold;
  font-size: 14px;
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
}

.skill-desc {
  color: #aaa;
  font-size: 12px;
  margin-bottom: 8px;
}

.skill-details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 11px;
  color: #888;
  margin-bottom: 8px;
}

.skill-cost {
  color: #60a5fa;
}

.skill-reduction {
  color: #10b981;
}

.skill-damage {
  color: #ef4444;
}

.skill-target {
  color: #f59e0b;
}

.skill-progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 3px;
  transition: width 0.3s;
}

.enhance-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.enhance-cost {
  color: #fbbf24;
  font-weight: bold;
  font-size: 14px;
}

.enhance-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    background: #444;
    cursor: not-allowed;
  }
}
</style>
