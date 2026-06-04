<template>
  <div v-if="show" class="action-section">
    <div class="section-title" :class="{ 'needs-rescue': playerNeedsRescue }">
      {{ playerNeedsRescue ? "⚠️ 玩家需要救援！" : "玩家指令" }}
    </div>
    <div class="action-buttons">
      <button
        class="action-btn attack-btn"
        :disabled="!isCommandPhase || aliveEnemies.length === 0"
        @click="onAttack"
      >
        ⚔️ 普攻 {{ targetName }}
      </button>

      <div class="skill-dropdown">
        <button
          class="action-btn skill-btn"
          :disabled="!isCommandPhase || aliveEnemies.length === 0"
          @click="toggleSkillMenu"
        >
          ✨ 技能
        </button>
        <div class="skill-menu" v-if="showSkillMenu">
          <div
            v-for="skill in skills"
            :key="skill.id"
            class="skill-item"
            :class="{ disabled: playerMp < skill.cost }"
            @click="onUseSkill(skill)"
          >
            <div class="skill-name">
              {{ skill.name }}
              <span v-if="skill.targetType === 'all'" class="skill-type-badge"
                >范围</span
              >
            </div>
            <div class="skill-cost">消耗: {{ skill.cost }} MP</div>
          </div>
        </div>
      </div>

      <div class="item-dropdown">
        <button
          class="action-btn item-btn"
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

      <button
        class="action-btn defend-btn"
        :disabled="!isCommandPhase"
        @click="onDefend"
      >
        🛡️ 防御
      </button>

      <button
        class="action-btn flee-btn"
        :disabled="!isCommandPhase"
        @click="onFlee"
      >
        🏃 逃跑
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  show: { type: Boolean, required: true },
  isCommandPhase: { type: Boolean, required: true },
  playerNeedsRescue: { type: Boolean, required: true },
  targetName: { type: String, required: true },
  skills: { type: Array, required: true },
  playerMp: { type: Number, required: true },
  inventory: { type: Array, required: true },
  aliveEnemies: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "attack",
  "use-skill",
  "select-item",
  "defend",
  "flee",
]);

const showSkillMenu = ref(false);
const showItemMenu = ref(false);

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
};

const onSelectItem = (item, index) => {
  emit("select-item", item, index);
  showItemMenu.value = false;
};

const onDefend = () => {
  emit("defend");
  showSkillMenu.value = false;
  showItemMenu.value = false;
};

const onFlee = () => {
  emit("flee");
  showSkillMenu.value = false;
  showItemMenu.value = false;
};
</script>

<style scoped lang="scss">
.action-section {
  .section-title {
    text-align: center;
    color: #fbbf24;
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 12px;

    &.needs-rescue {
      color: #ef4444;
      animation: pulse 1.5s infinite;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
