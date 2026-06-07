import { gameState, gameActions } from "../../../stores/gameStore.js";

// 判断是否是辅助技能
const isSupportSkill = (skill) => {
  return skill.type.startsWith("heal_") || skill.type.startsWith("buff_");
};

export function useBattleActions(state) {
  const handlePlayerAttack = () => {
    // 优先使用用户已选择的目标，如果目标已死亡则选择第一个存活的敌人
    let targetIdx = state.selectedTargetIndex.value;
    const enemies = gameState.currentBattle?.enemies;
    if (!enemies || !enemies[targetIdx] || enemies[targetIdx].hp <= 0) {
      targetIdx = state.getAliveTargetIndex();
    }
    
    if (targetIdx >= 0) {
      state.selectedTargetIndex.value = targetIdx;
      gameActions.playerAttack(targetIdx);
    }
  };

  const handlePlayerUseSkill = (skill) => {
    // 处理辅助技能
    if (isSupportSkill(skill)) {
      // 单体辅助技能需要选择目标，群体直接使用
      if (skill.targetType === "single") {
        state.selectedSkill.value = skill;
        state.skillUser.value = "player";
        state.showTargetSelector.value = true; // 使用道具的目标选择器来选择队友
      } else {
        // 群体辅助技能
        const targetIdx = state.getAliveTargetIndex();
        if (targetIdx >= 0) {
          state.selectedTargetIndex.value = targetIdx;
          gameActions.playerUseSkill(skill, targetIdx, "player");
        }
      }
    } else {
      // 攻击技能处理
      if (skill.targetType === "all") {
        const targetIdx = state.getAliveTargetIndex();
        if (targetIdx >= 0) {
          state.selectedTargetIndex.value = targetIdx;
          gameActions.playerUseSkill(skill, targetIdx);
        }
      } else {
        state.selectedSkill.value = skill;
        state.skillUser.value = "player";
        state.showSkillTargetSelector.value = true;
      }
    }
    state.showPlayerSkillMenu.value = false;
  };

  const selectEnemyAndUseSkill = (enemy, index) => {
    if (enemy.hp <= 0) return;
    state.selectedTargetIndex.value = index;
    gameActions.playerUseSkill(state.selectedSkill.value, index);
    state.showSkillTargetSelector.value = false;
    state.selectedSkill.value = null;
  };

  const selectItemForUse = (item, index) => {
    state.selectedItem.value = item;
    state.selectedItemIndex.value = index;
    state.showItemMenu.value = false;
    state.showTargetSelector.value = true;
  };

  const handleUseItem = (item, index, targetType = "player") => {
    gameActions.playerUseItem(item, index, targetType);
    state.showItemMenu.value = false;
    state.showTargetSelector.value = false;
    state.selectedItem.value = null;
    state.selectedItemIndex.value = -1;
  };

  // 辅助技能选择目标后使用
  const handleSupportSkillTarget = (targetType) => {
    if (state.skillUser.value === "player") {
      const targetIdx = state.getAliveTargetIndex();
      gameActions.playerUseSkill(
        state.selectedSkill.value,
        targetIdx,
        targetType,
      );
      state.showTargetSelector.value = false;
      state.selectedSkill.value = null;
    } else {
      const targetIdx = state.getAliveTargetIndex();
      gameActions.petUseSkill(
        state.selectedPetSkill.value,
        targetIdx,
        targetType,
      );
      state.showPetTargetSelector.value = false;
      state.selectedPetSkill.value = null;
    }
  };

  const cancelItemUse = () => {
    state.showTargetSelector.value = false;
    state.showPetTargetSelector.value = false;
    state.selectedItem.value = null;
    state.selectedItemIndex.value = -1;
    state.selectedPetItem.value = null;
    state.selectedPetItemIndex.value = -1;
    state.selectedSkill.value = null;
    state.selectedPetSkill.value = null;
  };

  const selectPetItemForUse = (item, index) => {
    state.selectedPetItem.value = item;
    state.selectedPetItemIndex.value = index;
    state.showPetItemMenu.value = false;
    state.showPetTargetSelector.value = true;
  };

  const handlePetUseItem = (item, index, targetType = "pet") => {
    gameActions.petUseItem(item, index, targetType);
    state.showPetItemMenu.value = false;
    state.showPetTargetSelector.value = false;
    state.selectedPetItem.value = null;
    state.selectedPetItemIndex.value = -1;
  };

  const handlePlayerDefend = () => {
    gameActions.playerDefend();
  };

  const handlePlayerFlee = () => {
    gameActions.playerFlee();
  };

  const handlePetAttack = () => {
    // 优先使用用户已选择的目标，如果目标已死亡则选择第一个存活的敌人
    let targetIdx = state.selectedTargetIndex.value;
    const enemies = gameState.currentBattle?.enemies;
    if (!enemies || !enemies[targetIdx] || enemies[targetIdx].hp <= 0) {
      targetIdx = state.getAliveTargetIndex();
    }
    
    if (targetIdx >= 0) {
      state.selectedTargetIndex.value = targetIdx;
      gameActions.petAttack(targetIdx);
    }
  };

  const handlePetUseSkill = (skill) => {
    // 处理宠物的辅助技能
    if (isSupportSkill(skill)) {
      if (skill.targetType === "single") {
        state.selectedPetSkill.value = skill;
        state.skillUser.value = "pet";
        state.showPetTargetSelector.value = true; // 使用宠物道具的目标选择器来选择队友
      } else {
        const targetIdx = state.getAliveTargetIndex();
        if (targetIdx >= 0) {
          state.selectedTargetIndex.value = targetIdx;
          gameActions.petUseSkill(skill, targetIdx, "pet");
        }
      }
    } else {
      // 攻击技能处理
      if (skill.targetType === "all") {
        const targetIdx = state.getAliveTargetIndex();
        if (targetIdx >= 0) {
          state.selectedTargetIndex.value = targetIdx;
          gameActions.petUseSkill(skill, targetIdx);
        }
      } else {
        state.selectedPetSkill.value = skill;
        state.showPetSkillTargetSelector.value = true;
      }
    }
    state.showPetSkillMenu.value = false;
  };

  const selectEnemyAndUsePetSkill = (enemy, index) => {
    if (enemy.hp <= 0) return;
    state.selectedTargetIndex.value = index;
    gameActions.petUseSkill(state.selectedPetSkill.value, index);
    state.showPetSkillTargetSelector.value = false;
    state.selectedPetSkill.value = null;
  };

  const cancelSkillUse = () => {
    state.showSkillTargetSelector.value = false;
    state.showPetSkillTargetSelector.value = false;
    state.showTargetSelector.value = false;
    state.showPetTargetSelector.value = false;
    state.selectedSkill.value = null;
    state.selectedPetSkill.value = null;
  };

  const handlePetDefend = () => {
    gameActions.petDefend();
  };

  const handleEndBattle = () => {
    gameActions.endBattle();
  };

  const handleRetry = () => {
    gameState.player.hp = gameState.player.maxHp;
    gameState.player.mp = gameState.player.maxMp;
    gameActions.endBattle();
  };

  return {
    handlePlayerAttack,
    handlePlayerUseSkill,
    selectEnemyAndUseSkill,
    selectItemForUse,
    handleUseItem,
    handleSupportSkillTarget,
    cancelItemUse,
    selectPetItemForUse,
    handlePetUseItem,
    handlePlayerDefend,
    handlePlayerFlee,
    handlePetAttack,
    handlePetUseSkill,
    selectEnemyAndUsePetSkill,
    cancelSkillUse,
    handlePetDefend,
    handleEndBattle,
    handleRetry,
  };
}
