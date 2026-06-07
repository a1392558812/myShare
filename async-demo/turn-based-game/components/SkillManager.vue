<template>
  <div class="skill-manager">
    <div class="panel-header">
      <h2>技能面板</h2>
      <button class="close-btn" @click="closePanel">✕</button>
    </div>

    <div class="panel-content">
      <div class="skill-section">
        <div class="section-title">
          <span class="title-icon">👤</span>
          玩家技能
        </div>
        <div class="skill-list">
          <div v-for="skill in playerSkills" :key="skill.id" class="skill-card">
            <div class="skill-header">
              <div class="skill-name">{{ skill.name }}</div>
              <div v-if="skill.enhanceLevel > 0" class="skill-enhance">
                ⚡ Lv.{{ skill.enhanceLevel }}
              </div>
            </div>
            <div class="skill-type">
              {{ skill.type === 'magic' ? '法术' : '物理' }}
            </div>
            <div class="skill-cost">
              消耗: {{ formatSkillCost(skill) }} MP
              <span v-if="skill.enhanceLevel > 0" class="skill-reduce">
                (-{{ Math.floor(skill.enhanceLevel / 10) }}%)
              </span>
            </div>
            <div class="skill-desc">{{ skill.description }}</div>
          </div>
        </div>
        <div v-if="!playerSkills || playerSkills.length === 0" class="empty-tip">
          暂无技能，让角色学会更多技能吧！
        </div>
      </div>

      <div class="skill-section">
        <div class="section-title">
          <span class="title-icon">🐾</span>
          宠物技能
        </div>
        <div class="skill-list">
          <div v-for="skill in petSkills" :key="skill.id" class="skill-card pet-card">
            <div class="skill-header">
              <div class="skill-name">{{ skill.name }}</div>
              <div v-if="skill.enhanceLevel > 0" class="skill-enhance">
                ⚡ Lv.{{ skill.enhanceLevel }}
              </div>
            </div>
            <div class="skill-type">
              {{ skill.type === 'magic' ? '法术' : '物理' }}
            </div>
            <div class="skill-cost">
              消耗: {{ formatPetSkillCost(skill) }} MP
              <span v-if="skill.enhanceLevel > 0" class="skill-reduce">
                (-{{ Math.floor(skill.enhanceLevel / 10) }}%)
              </span>
            </div>
            <div class="skill-desc">{{ skill.description }}</div>
          </div>
        </div>
        <div v-if="!petSkills || petSkills.length === 0" class="empty-tip">
          暂无技能，让宠物学会更多技能吧！
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { gameState, gameActions } from '../stores/gameStore.js';
import { calculateSkillCost } from '../stores/utils.js';

const playerSkills = computed(() => gameState.player.skills);
const petSkills = computed(() => gameState.pet ? gameState.pet.skills : []);

const closePanel = () => {
  gameActions.setScreen('map');
};

const formatSkillCost = (skill) => {
  return calculateSkillCost(skill, gameState.player.level, false);
};

const formatPetSkillCost = (skill) => {
  return calculateSkillCost(skill, gameState.pet.level, true);
};
</script>

<style scoped lang="scss">
.skill-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.3);

  h2 {
    margin: 0;
    color: white;
    font-size: 24px;
  }
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 107, 107, 0.3);
  }
}

.panel-content {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
}

.skill-section {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  overflow: auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px;
  color: white;
  font-size: 20px;
  font-weight: bold;

  .title-icon {
    font-size: 24px;
  }
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-card {
  padding: 16px;
  background: rgba(79, 172, 254, 0.1);
  border: 1px solid rgba(79, 172, 254, 0.3);
  border-radius: 8px;

  &.pet-card {
    background: rgba(168, 85, 247, 0.1);
    border-color: rgba(168, 85, 247, 0.3);
  }
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

.skill-enhance {
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 4px;
  color: #60a5fa;
  font-size: 12px;
  font-weight: bold;
}

.skill-type {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(79, 172, 254, 0.3);
  border-radius: 4px;
  color: #60a5fa;
  font-size: 12px;
  margin-bottom: 6px;

  .pet-card & {
    background: rgba(168, 85, 247, 0.3);
    color: #c084fc;
  }
}

.skill-cost {
  color: #888;
  font-size: 12px;
  margin-bottom: 4px;
}

.skill-reduce {
  color: #10b981;
  margin-left: 8px;
}

.skill-desc {
  color: #aaa;
  font-size: 13px;
}

.empty-tip {
  color: #666;
  text-align: center;
  padding: 40px 20px;
}
</style>
