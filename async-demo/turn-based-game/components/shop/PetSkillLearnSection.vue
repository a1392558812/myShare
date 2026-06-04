<template>
  <div class="shop-section">
    <h3>🌟 宠物学习技能</h3>
    <div class="pet-info-bar">
      <span class="pet-name">{{ pet.name }}</span>
      <span class="pet-level">Lv.{{ pet.level }}</span>
      <span class="skill-learn-cost">学习费用: 💰{{ getPetSkillLearnCost() }}</span>
    </div>
    <div class="skill-learn-grid">
      <div
        v-for="skill in SKILLS_CONFIG"
        :key="skill.id"
        class="skill-learn-card"
        :class="{ 'already-learned': isPetSkillLearned(skill) }"
      >
        <div class="skill-icon">{{ getSkillIcon(skill.type) }}</div>
        <div class="skill-info">
          <div class="skill-name">{{ skill.name }}</div>
          <div class="skill-desc">{{ skill.description }}</div>
          <div class="skill-details">
            <span class="skill-cost">消耗: {{ skill.cost }} MP</span>
            <span class="skill-damage">伤害: {{ skill.damage }}</span>
            <span class="skill-target">{{ skill.targetType === 'all' ? '群体' : '单体' }}</span>
          </div>
        </div>
        <button
          class="learn-btn"
          :disabled="isPetSkillLearned(skill) || playerGold < getPetSkillLearnCost()"
          @click="$emit('learn', skill)"
        >
          {{ isPetSkillLearned(skill) ? '已学习' : `学习 (💰${getPetSkillLearnCost()})` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { gameState } from "../../stores/gameStore.js";
import { SKILLS_CONFIG } from "../../stores/constants.js";

const props = defineProps({
  getPetSkillLearnCost: { type: Function, required: true },
  isPetSkillLearned: { type: Function, required: true },
  getSkillIcon: { type: Function, required: true },
});

defineEmits(["learn"]);

const pet = computed(() => gameState.pet);
const playerGold = computed(() => gameState.player.gold);
</script>

<style scoped lang="scss">
.pet-info-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  margin-bottom: 16px;
}

.pet-name {
  font-size: 16px;
  font-weight: bold;
  color: #fbbf24;
}

.pet-level {
  font-size: 14px;
  color: #f59e0b;
}

.skill-learn-cost {
  color: #fbbf24;
  font-weight: bold;
  margin-left: auto;
}

.skill-learn-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.skill-learn-card {
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 8px;
  display: flex;
  gap: 16px;
  align-items: center;
  transition: all 0.2s;

  &:hover:not(.already-learned) {
    border-color: rgba(245, 158, 11, 0.4);
    background: rgba(245, 158, 11, 0.05);
  }

  &.already-learned {
    opacity: 0.6;
    border-color: rgba(74, 222, 128, 0.3);
  }
}

.skill-icon {
  font-size: 36px;
}

.skill-info {
  flex: 1;
}

.skill-name {
  color: white;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}

.skill-desc {
  color: #aaa;
  font-size: 12px;
  margin-bottom: 6px;
}

.skill-details {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #888;
}

.skill-cost {
  color: #60a5fa;
}

.skill-damage {
  color: #ef4444;
}

.skill-target {
  color: #10b981;
}

.learn-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }

  &:disabled {
    background: #444;
    cursor: not-allowed;
  }
}
</style>
