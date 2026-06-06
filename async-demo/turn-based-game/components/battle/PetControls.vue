<template>
  <div v-if="show && pet" class="action-section">
    <div class="section-title">宠物指令</div>
    <div class="action-buttons">
      <button
        class="action-btn pet-attack-btn"
        :disabled="!isCommandPhase || aliveEnemies.length === 0"
        @click="onAttack"
      >
        🐾 普攻 {{ targetName }}
      </button>

      <div class="skill-dropdown">
        <button
          class="action-btn pet-skill-btn"
          :disabled="!isCommandPhase || aliveEnemies.length === 0"
          @click="toggleSkillMenu"
        >
          ✨ 技能
        </button>
        <div class="skill-menu" v-if="showSkillMenu">
          <div
            v-for="skill in pet.skills"
            :key="skill.id"
            class="skill-item"
            :class="{ disabled: pet.mp < getSkillCost(skill) }"
            @click="onUseSkill(skill)"
          >
            <div class="skill-name">
              {{ skill.name }}
              <span v-if="skill.targetType === 'all'" class="skill-type-badge"
                >范围</span
              >
            </div>
            <div class="skill-cost">消耗: {{ getSkillCost(skill) }} MP</div>
          </div>
        </div>
      </div>

      <button
        class="action-btn pet-defend-btn"
        :disabled="!isCommandPhase"
        @click="onDefend"
      >
        🛡️ 防御
      </button>

      <div class="item-dropdown">
        <button
          class="action-btn pet-item-btn"
          :disabled="!isCommandPhase || inventory.length === 0"
          @click="toggleItemMenu"
        >
          🎒 道具
        </button>
        <div class="item-menu" v-if="showItemMenu">
          <div
            v-for="(item, index) in inventory"
            :key="item.id"
            class="item-item"
            @click="onSelectItem(item, index)"
          >
            <div class="item-name">{{ item.name }} x{{ item.count }}</div>
            <div class="item-desc">{{ item.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { calculateSkillCost } from "../../stores/utils.js";

const props = defineProps({
  show: { type: Boolean, required: true },
  pet: { type: Object, default: null },
  isCommandPhase: { type: Boolean, required: true },
  targetName: { type: String, required: true },
  inventory: { type: Array, required: true },
  aliveEnemies: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "attack",
  "use-skill",
  "select-item",
  "defend",
]);

const showSkillMenu = ref(false);
const showItemMenu = ref(false);

const getSkillCost = (skill) => {
  return calculateSkillCost(skill, props.pet.level, true);
};

const toggleSkillMenu = () => {
  showSkillMenu.value = !showSkillMenu.value;
  showItemMenu.value = false;
};

const toggleItemMenu = () => {
  showItemMenu.value = !showItemMenu.value;
  showSkillMenu.value = false;
};

const onAttack = () => {
  emit("attack");
  showSkillMenu.value = false;
  showItemMenu.value = false;
};

const onUseSkill = (skill) => {
  emit("use-skill", skill);
  showSkillMenu.value = false;
  showItemMenu.value = false;
};

const onSelectItem = (item, index) => {
  emit("select-item", item, index);
  showSkillMenu.value = false;
  showItemMenu.value = false;
};

const onDefend = () => {
  emit("defend");
  showSkillMenu.value = false;
  showItemMenu.value = false;
};
</script>

<style scoped lang="scss">
.action-section {
  .section-title {
    text-align: center;
    color: #a855f7;
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 12px;
  }
}
</style>
