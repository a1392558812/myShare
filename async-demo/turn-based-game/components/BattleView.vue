<template>
  <div class="battle-container">
    <BattleInfo
      :current-round="currentRound"
      :current-phase-text="currentPhaseText"
      :current-phase-class="currentPhaseClass"
      :alive-enemies="aliveEnemies"
      :turn-order-display="turnOrderDisplay"
    />

    <BattleScene
      :enemies="gameState.currentBattle?.enemies || []"
      :selected-target-index="selectedTargetIndex"
      :on-select-target="selectTarget"
      :player="gameState.player"
      :pet="gameState.pet"
      :decision-text="playerDecisionText"
      :pet-decision-text="petDecisionText"
      :player-buffs="gameState.currentBattle?.playerBuffs || []"
      :pet-buffs="gameState.currentBattle?.petBuffs || []"
    />

    <div class="battle-log-container">
      <BattleLog :battle-log="gameState.battleLog" ref="battleLogRef" />

      <div v-if="!gameState.battleResult" class="action-area">
        <PlayerControls
          :show="showPlayerControls"
          :is-command-phase="isCommandPhase"
          :player-needs-rescue="playerNeedsRescue"
          :target-name="selectedTargetName"
          :skills="gameState.player.skills"
          :player-mp="gameState.player.mp"
          :player-level="gameState.player.level"
          :inventory="gameState.player.inventory"
          :alive-enemies="aliveEnemies"
          @attack="actions.handlePlayerAttack"
          @use-skill="actions.handlePlayerUseSkill"
          @select-item="actions.selectItemForUse"
          @defend="actions.handlePlayerDefend"
          @flee="actions.handlePlayerFlee"
        />

        <PetControls
          :show="showPetControls"
          :pet="gameState.pet"
          :is-command-phase="isCommandPhase"
          :target-name="selectedTargetName"
          :inventory="gameState.player.inventory"
          :alive-enemies="aliveEnemies"
          @attack="actions.handlePetAttack"
          @use-skill="actions.handlePetUseSkill"
          @select-item="actions.selectPetItemForUse"
          @defend="actions.handlePetDefend"
        />
      </div>
    </div>
    

    <!-- 玩家道具/辅助技能目标选择 -->
    <TargetSelector
      :show="showTargetSelector"
      type="item"
      :title="selectedItem ? '选择使用目标' : '选择技能目标'"
      user-label="玩家使用"
      :label-prefix="selectedItem ? '使用道具' : '使用技能'"
      :item-name="selectedItem?.name || selectedSkill?.name"
      :player="gameState.player"
      :pet="gameState.pet"
      @select-target="
        (type) => {
          if (selectedItem) {
            actions.handleUseItem(selectedItem, selectedItemIndex, type);
          } else {
            actions.handleSupportSkillTarget(type);
          }
        }
      "
      @cancel="actions.cancelItemUse"
    />

    <!-- 宠物道具/辅助技能目标选择 -->
    <TargetSelector
      :show="showPetTargetSelector"
      type="item"
      :title="selectedPetItem ? '选择使用目标' : '选择技能目标'"
      user-label="宠物使用"
      :label-prefix="selectedPetItem ? '使用道具' : '使用技能'"
      :item-name="selectedPetItem?.name || selectedPetSkill?.name"
      :player="gameState.player"
      :pet="gameState.pet"
      @select-target="
        (type) => {
          if (selectedPetItem) {
            actions.handlePetUseItem(
              selectedPetItem,
              selectedPetItemIndex,
              type,
            );
          } else {
            actions.handleSupportSkillTarget(type);
          }
        }
      "
      @cancel="actions.cancelItemUse"
    />

    <TargetSelector
      :show="showSkillTargetSelector"
      type="skill"
      title="选择攻击目标"
      user-label="玩家使用"
      label-prefix="使用技能"
      :item-name="selectedSkill?.name"
      :player="gameState.player"
      :pet="gameState.pet"
      :enemies="gameState.currentBattle?.enemies || []"
      :selected-target-index="selectedTargetIndex"
      @select-enemy="actions.selectEnemyAndUseSkill"
      @cancel="actions.cancelSkillUse"
    />

    <TargetSelector
      :show="showPetSkillTargetSelector"
      type="skill"
      title="选择攻击目标"
      user-label="宠物使用"
      label-prefix="使用技能"
      :item-name="selectedPetSkill?.name"
      :player="gameState.player"
      :pet="gameState.pet"
      :enemies="gameState.currentBattle?.enemies || []"
      :selected-target-index="selectedTargetIndex"
      @select-enemy="actions.selectEnemyAndUsePetSkill"
      @cancel="actions.cancelSkillUse"
    />

    <ResultOverlay
      @end-battle="actions.handleEndBattle"
      @retry="actions.handleRetry"
    />
  </div>
</template>

<script setup>
import { gameState } from "../stores/gameStore.js";
import BattleInfo from "./battle/BattleInfo.vue";
import BattleScene from "./battle/BattleScene.vue";
import BattleLog from "./battle/BattleLog.vue";
import PlayerControls from "./battle/PlayerControls.vue";
import PetControls from "./battle/PetControls.vue";
import TargetSelector from "./battle/TargetSelector.vue";
import ResultOverlay from "./battle/ResultOverlay.vue";
import { useBattleState } from "./battle/composables/useBattleState.js";
import { useBattleActions } from "./battle/composables/useBattleActions.js";

const state = useBattleState();
const actions = useBattleActions(state);

const {
  selectedTargetIndex,
  selectedItem,
  selectedItemIndex,
  showTargetSelector,
  selectedPetItem,
  selectedPetItemIndex,
  showPetTargetSelector,
  selectedSkill,
  showSkillTargetSelector,
  selectedPetSkill,
  showPetSkillTargetSelector,
  currentRound,
  currentPhaseText,
  currentPhaseClass,
  isCommandPhase,
  showPlayerControls,
  playerNeedsRescue,
  showPetControls,
  playerDecisionText,
  petDecisionText,
  aliveEnemies,
  selectedTargetName,
  turnOrderDisplay,
  selectTarget,
} = state;
</script>

<style scoped lang="scss">
.battle-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100% - 20px * 2);
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding: 20px;
  :deep(.action-buttons) {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;

    .action-btn {
      padding: 14px 24px;
      font-size: 14px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      color: white;
      font-weight: 500;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:not(:disabled):hover {
        transform: translateY(-2px);
      }

      &.attack-btn {
        background: linear-gradient(135deg, #ff6b6b, #c44569);
      }

      &.skill-btn {
        background: linear-gradient(135deg, #a855f7, #7c3aed);
      }

      &.item-btn {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }

      &.defend-btn {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
      }

      &.flee-btn {
        background: linear-gradient(135deg, #6b7280, #4b5563);
      }

      &.pet-attack-btn {
        background: linear-gradient(135deg, #a855f7, #7c3aed);
      }

      &.pet-skill-btn {
        background: linear-gradient(135deg, #d946ef, #c026d3);
      }

      &.pet-defend-btn {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      }

      &.pet-item-btn {
        background: linear-gradient(135deg, #06b6d4, #0891b2);
      }
    }

    .skill-dropdown,
    .item-dropdown {
      position: relative;

      .skill-menu,
      .item-menu {
        max-height: 400px;
        overflow-y: auto;
        position: absolute;
        bottom: 100%;
        left: 0;
        margin-bottom: 8px;
        background: #1f2937;
        border-radius: 8px;
        padding: 8px;
        min-width: 200px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        z-index: 10;

        .skill-item,
        .item-item {
          padding: 10px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          &.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .skill-name,
          .item-name {
            color: white;
            font-weight: 500;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .skill-type-badge {
            font-size: 10px;
            padding: 2px 6px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border-radius: 4px;
            font-weight: bold;
          }

          .skill-cost,
          .item-desc {
            color: #888;
            font-size: 12px;
          }
        }
      }
    }
  }
}

.battle-log-container {
  display: flex;
  align-items: stretch;
  height: 250px;
  .action-area {
    flex: 1;
    height: calc(100% - 16px * 2);
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    padding: 16px;
  }
}
</style>
