<template>
  <div class="debug-section">
    <h4>🎒 道具</h4>
    <div class="debug-row">
      <select v-model="selectedItemId">
        <option v-for="item in ITEMS_CONFIG" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>
      <input type="number" v-model.number="itemCount" placeholder="数量" />
      <button @click="addItem">添加道具</button>
    </div>
  </div>

  <div class="debug-section">
    <h4>✨ 技能</h4>
    <div class="debug-row">
      <select v-model="selectedSkillId">
        <option
          v-for="skill in SKILLS_CONFIG"
          :key="skill.id"
          :value="skill.id"
        >
          {{ skill.name }} (消耗: {{ skill.cost }} MP, 伤害: {{ skill.damage }})
        </option>
      </select>
      <button @click="addSkill">添加技能</button>
    </div>
    <div class="debug-info">
      已拥有技能:
      {{ gameState.player.skills.map((s) => `${s.name}[Lv.${s.enhanceLevel || 0}]`).join(", ") || "无" }}
    </div>
    <div class="debug-row">
      <button @click="addAllSkills">获得全部技能</button>
    </div>
  </div>

  <div class="debug-section">
    <h4>⚡ 技能强化</h4>
    <div class="debug-row">
      <select v-model="selectedPlayerSkillForEnhance">
        <option
          v-for="(skill, index) in gameState.player.skills"
          :key="skill.id"
          :value="index"
        >
          {{ skill.name }} - 强化等级: {{ skill.enhanceLevel || 0 }} / {{ maxEnhanceLevel }}
        </option>
      </select>
    </div>
    <div class="debug-row">
      <input type="number" v-model.number="skillEnhanceAmount" placeholder="强化等级变更量" />
      <button @click="enhancePlayerSkill(true)">+增加</button>
      <button @click="enhancePlayerSkill(false)">-减少</button>
      <button @click="setPlayerSkillEnhance">设置等级</button>
    </div>
    <div class="debug-info" v-if="selectedSkill">
      当前技能: {{ selectedSkill.name }} | 强化等级: {{ selectedSkill.enhanceLevel || 0 }} | 消耗减免: -{{ calculateSkillReducePercent(selectedSkill) }}%
    </div>
  </div>
</template>

<script setup>
import { gameState } from "../../stores/gameStore.js";
import { ITEMS_CONFIG, SKILLS_CONFIG, GAME_CONFIG } from "../../stores/constants.js";
import { computed } from "vue";
const selectedItemId = defineModel("selectedItemId");
const itemCount = defineModel("itemCount");
const selectedSkillId = defineModel("selectedSkillId");
const selectedPlayerSkillForEnhance = defineModel("selectedPlayerSkillForEnhance");
const skillEnhanceAmount = defineModel("skillEnhanceAmount");

const props = defineProps({
  addItem: { type: Function, required: true },
  addSkill: { type: Function, required: true },
  addAllSkills: { type: Function, required: true },
  enhancePlayerSkill: { type: Function, required: true },
  setPlayerSkillEnhance: { type: Function, required: true },
  calculateSkillReducePercent: { type: Function, required: true },
});

const maxEnhanceLevel = GAME_CONFIG.SHOP.SKILL_ENHANCE.MAX_LEVEL;

const selectedSkill = computed(() => {
  const index = selectedPlayerSkillForEnhance.value;
  if (index >= 0 && index < gameState.player.skills.length) {
    return gameState.player.skills[index];
  }
  return null;
});
</script>
