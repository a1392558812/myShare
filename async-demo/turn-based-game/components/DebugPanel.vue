<template>
  <div class="debug-panel">
    <button class="debug-toggle" @click="isExpanded = !isExpanded">
      🛠️ 调试
    </button>

    <div v-if="isExpanded" class="debug-content">
      <h3>调试面板</h3>
      <PlayerStatsDebug
        v-model:gold-amount="goldAmount"
        v-model:stat-amount="statAmount"
        v-model:selected-stat="selectedStat"
        v-model:exp-amount="expAmount"
        v-model:hp-amount="hpAmount"
        v-model:mp-amount="mpAmount"
        :add-gold="addGold"
        :add-stat-points="addStatPoints"
        :add-exp="addExp"
        :add-hp="addHp"
        :fill-hp="fillHp"
        :add-mp="addMp"
        :fill-mp="fillMp"
        @update:stat-amount="onUpdateStatAmount"
      />

      <PlayerItemsDebug
      v-model:selected-item-id="selectedItemId"
      v-model:item-count="itemCount"
      v-model:selected-skill-id="selectedSkillId"
      v-model:selected-player-skill-for-enhance="selectedPlayerSkillForEnhance"
      v-model:skill-enhance-amount="skillEnhanceAmount"
      :add-item="addItem"
      :add-skill="addSkill"
      :add-all-skills="addAllSkills"
      :enhance-player-skill="enhancePlayerSkill"
      :set-player-skill-enhance="setPlayerSkillEnhance"
      :calculate-skill-reduce-percent="calculateSkillReducePercent"
    />

      <PetDebug
      v-model:selected-pet-stat="selectedPetStat"
      v-model:pet-stat-amount="petStatAmount"
      v-model:pet-exp-amount="petExpAmount"
      v-model:pet-hp-amount="petHpAmount"
      v-model:pet-mp-amount="petMpAmount"
      v-model:selected-pet-skill-id="selectedPetSkillId"
      v-model:selected-pet-skill-for-enhance="selectedPetSkillForEnhance"
      v-model:skill-enhance-amount="skillEnhanceAmount"
      v-model:pet-coefficients="petCoefficients"
      v-model:coeff-stats-list="coeffStatsList"
      :add-pet-stat-points="addPetStatPoints"
      :add-pet-exp="addPetExp"
      :add-pet-hp="addPetHp"
      :fill-pet-hp="fillPetHp"
      :add-pet-mp="addPetMp"
      :fill-pet-mp="fillPetMp"
      :add-pet-skill="addPetSkill"
      :add-all-pet-skills="addAllPetSkills"
      :enhance-pet-skill="enhancePetSkill"
      :set-pet-skill-enhance="setPetSkillEnhance"
      :calculate-skill-reduce-percent="calculateSkillReducePercent"
      :get-current-coefficient-info="getCurrentCoefficientInfo"
      :get-default-coefficient="getDefaultCoefficient"
      :reset-coefficient="resetCoefficient"
      :apply-all-coefficients="applyAllCoefficients"
      :reset-all-coefficients="resetAllCoefficients"
    />

      <EquipmentDebug
        v-model:selected-equip-type="selectedEquipType"
        v-model:selected-rarity="selectedRarity"
        v-model:equip-level="equipLevel"
        v-model:custom-base-affixes="customBaseAffixes"
        v-model:custom-bonus-affixes="customBonusAffixes"
        v-model:unique-bonus-affix-stats="uniqueBonusAffixStats"
        :add-base-affix="addBaseAffix"
        :add-bonus-affix="addBonusAffix"
        :remove-affix="removeAffix"
        :add-custom-equipment="addCustomEquipment"
      />

      <BattleResetDebug
        :set-player-turn="setPlayerTurn"
        :set-enemy-turn="setEnemyTurn"
        :confirm-reset="confirmReset"
      />

      <BattleBuffDebug
        v-model:battle-buff-target="battleBuffTarget"
        v-model:selected-buff-skill-id="selectedBuffSkillId"
        :get-buff-skills="getBuffSkills"
        :get-battle-targets="getBattleTargets"
        :apply-battle-buff="applyBattleBuff"
      />

      <DynamicAttributeDebug />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

import PlayerStatsDebug from "./debug/PlayerStatsDebug.vue";
import PlayerItemsDebug from "./debug/PlayerItemsDebug.vue";
import PetDebug from "./debug/PetDebug.vue";
import EquipmentDebug from "./debug/EquipmentDebug.vue";
import BattleResetDebug from "./debug/BattleResetDebug.vue";
import BattleBuffDebug from "./debug/BattleBuffDebug.vue";
import DynamicAttributeDebug from "./debug/DynamicAttributeDebug.vue";
import { useDebug } from "./debug/composables/useDebug.js";

const onUpdateStatAmount = (statAmount) => {
  console.log("statAmount", statAmount);
};

const isExpanded = ref(false);
const {
    goldAmount,
    statAmount,
    selectedStat,
    expAmount,
    hpAmount,
    mpAmount,
    addGold,
    addStatPoints,
    addExp,
    addHp,
    fillHp,
    addMp,
    fillMp,
    selectedItemId,
    itemCount,
    selectedSkillId,
    selectedPlayerSkillForEnhance,
    selectedPetSkillForEnhance,
    skillEnhanceAmount,
    addItem,
    addSkill,
    addAllSkills,
    enhancePlayerSkill,
    enhancePetSkill,
    setPlayerSkillEnhance,
    setPetSkillEnhance,
    calculateSkillReducePercent,
  selectedPetStat,
  petStatAmount,
  petExpAmount,
  petHpAmount,
  petMpAmount,
  selectedPetSkillId,
  petCoefficients,
  coeffStatsList,
  addPetStatPoints,
  addPetExp,
  addPetHp,
  fillPetHp,
  addPetMp,
  fillPetMp,
  addPetSkill,
  addAllPetSkills,
  getCurrentCoefficientInfo,
  getDefaultCoefficient,
  resetCoefficient,
  applyAllCoefficients,
  resetAllCoefficients,
  selectedEquipType,
  selectedRarity,
  equipLevel,
  customBaseAffixes,
  customBonusAffixes,
  uniqueBonusAffixStats,
  addBaseAffix,
  addBonusAffix,
  removeAffix,
  addCustomEquipment,
  setPlayerTurn,
  setEnemyTurn,
  confirmReset,
  // 战斗buff调试
  battleBuffTarget,
  selectedBuffSkillId,
  getBuffSkills,
  getBattleTargets,
  applyBattleBuff,
} = useDebug();
</script>

<style scoped lang="scss">
.debug-panel {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 8px;
  border: 2px solid #4ade80;
  overflow: auto;
  max-width: 400px;
  transition: all 0.3s ease;
}

.debug-toggle {
  width: 100%;
  padding: 10px 15px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border: none;
  color: #1f2937;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;

  &:hover {
    background: linear-gradient(135deg, #22c55e, #16a34a);
  }
}

.debug-content {
  padding: 15px;
  color: #fff;
  max-height: 600px;
  overflow-y: auto;

  h3 {
    margin: 0 0 15px 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #4ade80;
    color: #4ade80;
    font-size: 16px;
  }

  :deep(.debug-section) {
    margin-bottom: 15px;

    h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #a5b4fc;
    }
  }

  :deep(.debug-row) {
    display: flex;
    flex-direction: column;
    gap: 5px;

    input,
    select {
      padding: 5px 8px;
      border: 1px solid #374151;
      border-radius: 4px;
      background: #1f2937;
      color: #fff;
      font-size: 12px;
    }

    button {
      padding: 5px 10px;
      border: none;
      border-radius: 4px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: #fff;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
      }

      &.danger-btn {
        background: linear-gradient(135deg, #ef4444, #dc2626);

        &:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
        }
      }
    }
  }

  :deep(.debug-info) {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 5px;
  }

  :deep(.custom-affixes) {
    margin-top: 10px;
    padding: 10px;
    background: rgba(55, 65, 81, 0.5);
    border-radius: 4px;

    h5 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #fbbf24;
    }
  }

  :deep(.affix-section) {
    margin-bottom: 10px;

    h6 {
      margin: 0 0 5px 0;
      font-size: 11px;
      color: #9ca3af;
    }
  }

  :deep(.affix-row) {
    display: flex;
    gap: 5px;
    margin-bottom: 5px;

    select,
    input {
      flex: 1;
      padding: 4px 6px;
      font-size: 11px;
    }

    button {
      padding: 4px 8px;
      background: #ef4444;
      font-size: 11px;
    }
  }

  :deep(.add-affix-btn) {
    width: 100%;
    padding: 4px 6px;
    background: linear-gradient(135deg, #10b981, #059669) !important;
    font-size: 11px;
  }

  :deep(.equip-btn) {
    width: 100%;
    margin-top: 10px;
    padding: 8px;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
    font-size: 13px;
    font-weight: bold;
  }

  :deep(.coeff-section) {
    margin-top: 10px;
    padding: 10px;
    background: rgba(139, 92, 246, 0.1);
    border-radius: 4px;
    border: 1px solid rgba(139, 92, 246, 0.3);

    h5 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #a78bfa;
    }
  }

  :deep(.coeff-info) {
    font-size: 10px;
    color: #9ca3af;
    margin-bottom: 8px;
  }

  :deep(.coeff-grid) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
    margin-bottom: 8px;
  }

  :deep(.coeff-row) {
    display: flex;
    align-items: center;
    gap: 5px;

    .coeff-label {
      flex: 0 0 50px;
      font-size: 11px;
      color: #fff;
    }

    input {
      flex: 1;
      padding: 3px 6px;
      font-size: 11px;
    }

    button {
      padding: 3px 8px;
      background: linear-gradient(135deg, #a855f7, #9333ea);
      font-size: 10px;
    }
  }
}
</style>
