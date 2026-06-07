<template>
  <div class="debug-section">
    <h4>🐾 宠物调试</h4>

    <div class="debug-row">
      <select v-model="selectedPetStat">
        <option value="physicalAttack">物攻点</option>
        <option value="magicAttack">法攻点</option>
        <option value="defense">防御点</option>
        <option value="speed">速度点</option>
        <option value="maxHp">生命点</option>
        <option value="critRate">暴击率</option>
        <option value="comboRate">连击率</option>
        <option value="maxComboCount">最大连击数</option>
      </select>
      <input type="number" v-model.number="petStatAmount" placeholder="数量" />
      <button @click="addPetStatPoints">添加宠物属性点</button>
    </div>

    <div class="debug-row">
      <input type="number" v-model.number="petExpAmount" placeholder="经验值" />
      <button @click="addPetExp">添加宠物经验</button>
    </div>
    <div class="debug-info">
      宠物等级: {{ gameState.pet?.level || 0 }} | 经验:
      {{ gameState.pet?.exp || 0 }}/{{ gameState.pet?.expToNext || 0 }}
    </div>

    <div class="debug-row">
      <input type="number" v-model.number="petHpAmount" placeholder="生命值" />
      <button @click="addPetHp">恢复宠物生命</button>
      <button @click="fillPetHp">宠物回满血</button>
    </div>
    <div class="debug-info">
      宠物HP: {{ gameState.pet?.hp || 0 }}/{{ gameState.pet?.maxHp || 0 }}
    </div>

    <div class="debug-row">
      <input type="number" v-model.number="petMpAmount" placeholder="法力值" />
      <button @click="addPetMp">恢复宠物法力</button>
      <button @click="fillPetMp">宠物回满蓝</button>
    </div>
    <div class="debug-info">
      宠物MP: {{ gameState.pet?.mp || 0 }}/{{ gameState.pet?.maxMp || 0 }}
    </div>

    <div class="debug-row">
      <select v-model="selectedPetSkillId">
        <option
          v-for="skill in SKILLS_CONFIG"
          :key="skill.id"
          :value="skill.id"
        >
          {{ skill.name }} (消耗: {{ skill.cost }} MP)
        </option>
      </select>
      <button @click="addPetSkill">添加宠物技能</button>
    </div>
    <div class="debug-info">
      宠物已拥有技能:
      {{ gameState.pet?.skills?.map((s) => s.name).join(", ") || "无" }}
    </div>
    <div class="debug-row">
      <button @click="addAllPetSkills">宠物获得全部技能</button>
    </div>

    <div class="coeff-section">
      <h5>🎯 宠物属性系数调节</h5>
      <div class="coeff-info">当前系数: {{ getCurrentCoefficientInfo() }}</div>
      <div class="coeff-grid">
        <div v-for="stat in coeffStatsList" :key="stat" class="coeff-row">
          <span class="coeff-label">{{ getStatName(stat) }}</span>
          <input
            type="number"
            step="0.01"
            v-model.number="petCoefficients[stat]"
            :placeholder="getDefaultCoefficient(stat)"
          />
          <button @click="resetCoefficient(stat)">重置</button>
        </div>
      </div>
      <div class="debug-row">
        <button @click="applyAllCoefficients">应用所有系数</button>
        <button @click="resetAllCoefficients" class="danger-btn">
          重置全部系数
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { gameState } from "../../stores/gameStore.js";
import { SKILLS_CONFIG } from "../../stores/constants.js";
import { getStatName } from "../../stores/utils.js";

const selectedPetStat = defineModel("selectedPetStat");
const petStatAmount = defineModel("petStatAmount");
const petExpAmount = defineModel("petExpAmount");
const petHpAmount = defineModel("petHpAmount");
const petMpAmount = defineModel("petMpAmount");
const selectedPetSkillId = defineModel("selectedPetSkillId");
const petCoefficients = defineModel("petCoefficients");
const coeffStatsList = defineModel("coeffStatsList");

const props = defineProps({
  addPetStatPoints: { type: Function, required: true },
  addPetExp: { type: Function, required: true },
  addPetHp: { type: Function, required: true },
  fillPetHp: { type: Function, required: true },
  addPetMp: { type: Function, required: true },
  fillPetMp: { type: Function, required: true },
  addPetSkill: { type: Function, required: true },
  addAllPetSkills: { type: Function, required: true },
  getCurrentCoefficientInfo: { type: Function, required: true },
  getDefaultCoefficient: { type: Function, required: true },
  resetCoefficient: { type: Function, required: true },
  applyAllCoefficients: { type: Function, required: true },
  resetAllCoefficients: { type: Function, required: true },
});
</script>
