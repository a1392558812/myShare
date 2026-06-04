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
      {{ gameState.player.skills.map((s) => s.name).join(", ") || "无" }}
    </div>
    <div class="debug-row">
      <button @click="addAllSkills">获得全部技能</button>
    </div>
  </div>
</template>

<script setup>
import { gameState } from "../../stores/gameStore.js";
import { ITEMS_CONFIG, SKILLS_CONFIG } from "../../stores/constants.js";
const selectedItemId = defineModel("selectedItemId");
const itemCount = defineModel("itemCount");
const selectedSkillId = defineModel("selectedSkillId");

const props = defineProps({
  addItem: { type: Function, required: true },
  addSkill: { type: Function, required: true },
  addAllSkills: { type: Function, required: true },
});
</script>
