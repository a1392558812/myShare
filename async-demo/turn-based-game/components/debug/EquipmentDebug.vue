<template>
  <div class="debug-section">
    <h4>⚔️ 装备</h4>
    <div class="debug-row">
      装备类型:
      <select v-model="selectedEquipType">
        <option
          v-for="(info, type) in EQUIPMENT_CONFIG.TYPES"
          :key="type"
          :value="type"
        >
          {{ info.name }}
        </option>
      </select>
      稀有度:
      <select v-model="selectedRarity">
        <option
          v-for="(info, rarity) in EQUIPMENT_CONFIG.RARITY"
          :key="rarity"
          :value="rarity"
        >
          {{ info.name }}
        </option>
      </select>
      等级:
      <input type="number" v-model.number="equipLevel" placeholder="装备等级" />
    </div>

    <div class="custom-affixes">
      <h5>自定义词条</h5>

      <div class="affix-section">
        <h6>基础词条（属性点）</h6>
        <template
          v-for="(affix, index) in customBaseAffixes"
          :key="'base-' + index"
        >
          <div v-if="affix" class="affix-row">
            <select v-model="affix.stat">
              <option
                v-for="stat in STAT_CONFIG.POINT_STATS"
                :key="stat"
                :value="stat"
              >
                {{ STAT_CONFIG.NAMES[stat] }}
              </option>
            </select>
            <input
              type="number"
              v-model.number="affix.value"
              placeholder="数值"
            />
            <button @click="removeAffix('base', index)">×</button>
          </div>
        </template>
        <button @click="addBaseAffix" class="add-affix-btn">
          + 添加基础词条
        </button>
      </div>

      <div class="affix-section">
        <h6>强力词条（属性值）</h6>
        <template
          v-for="(affix, index) in customBonusAffixes"
          :key="'bonus-' + index"
        >
          <div v-if="affix" class="affix-row">
            <select v-model="affix.stat">
              <option
                v-for="stat in uniqueBonusAffixStats"
                :key="stat"
                :value="stat"
              >
                {{ EQUIPMENT_CONFIG.BONUS_AFFIX_POOL[stat]?.name || stat }}
              </option>
            </select>
            <input
              type="number"
              v-model.number="affix.value"
              placeholder="数值"
            />
            <button @click="removeAffix('bonus', index)">×</button>
          </div>
        </template>
        <button @click="addBonusAffix" class="add-affix-btn">
          + 添加强力词条
        </button>
      </div>
    </div>

    <button @click="addCustomEquipment" class="equip-btn">
      生成自定义装备
    </button>
    <div class="debug-info">
      背包装备数量: {{ gameState.player.equipmentBag.length }}
    </div>
  </div>
</template>

<script setup>
import { gameState } from "../../stores/gameStore.js";
import { EQUIPMENT_CONFIG, STAT_CONFIG } from "../../stores/constants.js";

const selectedEquipType = defineModel("selectedEquipType");
const selectedRarity = defineModel("selectedRarity");
const equipLevel = defineModel("equipLevel");
const customBaseAffixes = defineModel("customBaseAffixes");
const customBonusAffixes = defineModel("customBonusAffixes");
const uniqueBonusAffixStats = defineModel("uniqueBonusAffixStats");

const props = defineProps({
  addBaseAffix: { type: Function, required: true },
  addBonusAffix: { type: Function, required: true },
  removeAffix: { type: Function, required: true },
  addCustomEquipment: { type: Function, required: true },
});
</script>
