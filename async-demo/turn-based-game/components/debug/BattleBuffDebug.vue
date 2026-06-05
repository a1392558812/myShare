<template>
  <div class="debug-section battle-buff-debug">
    <h4>⚔️ 战斗BUFF调试</h4>
    <div class="debug-row">
      <select v-model="battleBuffTarget">
        <option v-for="target in targets" :key="target.id" :value="target.id">
          {{ target.name }}
        </option>
      </select>
    </div>
    <div class="debug-row">
      <select v-model="selectedBuffSkillId">
        <optgroup label="治疗技能">
          <option v-for="skill in healSkills" :key="skill.id" :value="skill.id">
            {{ skill.name }}
          </option>
        </optgroup>
        <optgroup label="强化技能">
          <option v-for="skill in buffSkills" :key="skill.id" :value="skill.id">
            {{ skill.name }}
          </option>
        </optgroup>
        <optgroup label="障碍技能">
          <option v-for="skill in debuffSkills" :key="skill.id" :value="skill.id">
            {{ skill.name }}
          </option>
        </optgroup>
      </select>
    </div>
    <div class="debug-row">
      <button @click="applyBattleBuff" class="buff-btn">施加BUFF</button>
    </div>
    <div class="debug-info" v-if="!isInBattle">当前不在战斗中</div>
    <div class="debug-info" v-else>
      可用目标: {{ targets.length }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { gameState } from "../../stores/gameStore.js";

const battleBuffTarget = defineModel("battleBuffTarget");
const selectedBuffSkillId = defineModel("selectedBuffSkillId");

const props = defineProps({
  getBuffSkills: { type: Function, required: true },
  getBattleTargets: { type: Function, required: true },
  applyBattleBuff: { type: Function, required: true },
});

// 监听 targets 变化，更新选项
const targets = ref([]);

// 监听 battleBuffTarget 变化，确保选择的值有效
watch(() => props.getBattleTargets(), (newTargets) => {
  targets.value = newTargets;
  // 检查当前选中的目标是否有效
  const validIds = newTargets.map(t => t.id);
  if (!validIds.includes(battleBuffTarget.value)) {
    battleBuffTarget.value = validIds.length > 0 ? validIds[0] : "player";
  }
}, { immediate: true });

const isInBattle = computed(() => !!gameState.currentBattle);

const allBuffSkills = computed(() => props.getBuffSkills());

const healSkills = computed(() => 
  allBuffSkills.value.filter(s => s.type.startsWith("heal_"))
);

const buffSkills = computed(() => 
  allBuffSkills.value.filter(s => s.type.startsWith("buff_"))
);

const debuffSkills = computed(() => 
  allBuffSkills.value.filter(s => s.type.startsWith("debuff_"))
);
</script>

<style scoped lang="scss">
.battle-buff-debug {
  border: 1px solid #8b5cf6;
  border-radius: 6px;
  padding: 10px;
  background: rgba(139, 92, 246, 0.05);

  h4 {
    color: #a78bfa !important;
  }

  select {
    width: 100%;
  }

  .buff-btn {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed) !important;
    font-weight: bold;
    
    &:hover {
      background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
    }
  }
}
</style>
