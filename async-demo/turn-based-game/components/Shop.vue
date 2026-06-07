<template>
  <div class="shop-panel">
    <div class="panel-header">
      <h2>🏪 商店</h2>
      <div class="gold-display">💰 {{ gameState.player.gold }}</div>
      <button class="close-btn" @click="closeShop">✕</button>
    </div>

    <div class="panel-content">
      <BuyItemsSection @purchase="handlePurchase" />

      <BuyEquipmentSection
        :selected-type="selectedType"
        :equipment-types="equipmentTypes"
        :shop-preview-stats="shopPreviewStats"
        :shop-equipment-price="shopEquipmentPrice"
        :get-type-name="getTypeName"
        :shop-equipment-name="getShopEquipmentName()"
        @select-type="selectEquipmentType"
        @purchase="handleEquipmentPurchase"
      />

      <SellItemsSection @sell="handleSellItem" />

      <EquipmentBagSection
        :get-rarity-color="getRarityColor"
        :get-rarity-name="getRarityName"
        :get-equipment-sell-price="getEquipmentSellPrice"
        :get-refresh-cost="getRefreshCost"
        :get-single-base-affix-cost="getSingleBaseAffixCost"
        :get-single-bonus-affix-cost="getSingleBonusAffixCost"
        @sell="handleSellEquipment"
        @refresh="handleRefreshAffixes"
        @refresh-single-base="handleRefreshSingleBaseAffix"
        @refresh-single-bonus="handleRefreshSingleBonusAffix"
      />

      <PetStatRerollSection
        v-if="gameState.pet"
        :reroll-stats-list="rerollStatsList"
        :get-current-coefficient="getCurrentCoefficient"
        :get-reroll-range="getRerollRange"
        :get-reroll-cost="getRerollCost"
        @reroll="handleRerollStat"
      />

      <PetSkillLearnSection
        v-if="gameState.pet"
        :get-pet-skill-learn-cost="getPetSkillLearnCost"
        :is-pet-skill-learned="isPetSkillLearned"
        :get-skill-icon="getSkillIcon"
        @learn="handleLearnSkill"
      />

      <SkillEnhanceSection
        :get-skill-icon="getSkillIcon"
        @enhance="handleEnhanceSkill"
      />
    </div>
  </div>
</template>

<script setup>
import { gameState } from "../stores/gameStore.js";

import BuyItemsSection from "./shop/BuyItemsSection.vue";
import BuyEquipmentSection from "./shop/BuyEquipmentSection.vue";
import SellItemsSection from "./shop/SellItemsSection.vue";
import EquipmentBagSection from "./shop/EquipmentBagSection.vue";
import PetStatRerollSection from "./shop/PetStatRerollSection.vue";
import PetSkillLearnSection from "./shop/PetSkillLearnSection.vue";
import SkillEnhanceSection from "./shop/SkillEnhanceSection.vue";
import { useShop } from "./shop/composables/useShop.js";

const shop = useShop();

const {
    rerollStatsList,
    selectedType,
    equipmentTypes,
    getTypeName,
    getRarityColor,
    getRarityName,
    getShopEquipmentName,
    shopPreviewStats,
    shopEquipmentPrice,
    closeShop,
    selectEquipmentType,
    getEquipmentSellPrice,
    getRefreshCost,
    getSingleBaseAffixCost,
    getSingleBonusAffixCost,
    getRerollCost,
    getCurrentCoefficient,
    getRerollRange,
    getPetSkillLearnCost,
    isPetSkillLearned,
    getSkillIcon,
} = shop;

const handlePurchase = ({ item }) => {
  const result = shop.buyItem(item);
  alert(result.message);
};

const handleEquipmentPurchase = ({ type }) => {
  const result = shop.buyEquipment(type);
  alert(result.message);
};

const handleSellItem = (index) => {
  const result = shop.sellItem(index);
  if (result.success) {
    alert(result.message);
  }
};

const handleSellEquipment = (index) => {
  const result = shop.sellEquipment(index);
  if (result.success) {
    alert(result.message);
  }
};

const handleRefreshAffixes = (index) => {
    const result = shop.refreshAffixes(index);
    alert(result.message);
  };

const handleRefreshSingleBaseAffix = (index, stat) => {
    const result = shop.refreshSingleBaseAffix(index, stat);
    alert(result.message);
  };

const handleRefreshSingleBonusAffix = (index, stat) => {
    const result = shop.refreshSingleBonusAffix(index, stat);
    alert(result.message);
  };

const handleRerollStat = (stat) => {
  const result = shop.rerollPetStatCoefficient(stat);
  alert(result.message);
};

const handleLearnSkill = (skill) => {
  const result = shop.learnPetSkill(skill);
  alert(result.message);
};

const handleEnhanceSkill = (data) => {
  const result = shop.enhanceSkill(data);
  alert(result.message);
};
</script>

<style scoped lang="scss">
.shop-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  overflow: hidden;
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.3);

    h2 {
      margin: 0;
      color: white;
      font-size: 24px;
    }
    .gold-display {
      font-size: 18px;
      font-weight: bold;
      color: #fbbf24;
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
  }

  .panel-content {
    flex: 1;
    padding: 20px 100px;
    overflow-y: auto;
    :deep(.shop-section) {
      margin-bottom: 30px;

      h3 {
        margin: 0 0 16px;
        color: white;
        font-size: 18px;
      }
    }
  }
}
</style>
