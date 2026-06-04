import { ref, computed, watch, nextTick, onMounted } from "vue";
import { gameState, gameActions } from "../../../stores/gameStore.js";

export function useBattleState() {
  const showPlayerSkillMenu = ref(false);
  const showPetSkillMenu = ref(false);
  const showItemMenu = ref(false);
  const logContentRef = ref(null);
  const selectedTargetIndex = ref(0);

  const selectedItem = ref(null);
  const selectedItemIndex = ref(-1);
  const showTargetSelector = ref(false);
  const showPetItemMenu = ref(false);
  const selectedPetItem = ref(null);
  const selectedPetItemIndex = ref(-1);
  const showPetTargetSelector = ref(false);
  const itemUser = ref("player");

  const selectedSkill = ref(null);
  const showSkillTargetSelector = ref(false);
  const selectedPetSkill = ref(null);
  const showPetSkillTargetSelector = ref(false);
  const skillUser = ref("player");

  const currentRound = computed(() => {
    return gameState.currentBattle?.round || 1;
  });

  const currentPhase = computed(() => {
    return gameState.currentBattle?.phase || "command";
  });

  const currentPhaseText = computed(() => {
    return currentPhase.value === "command" ? "📝 指令阶段" : "⚡ 执行阶段";
  });

  const currentPhaseClass = computed(() => {
    return currentPhase.value === "command"
      ? "command-phase"
      : "execution-phase";
  });

  const isCommandPhase = computed(() => {
    return currentPhase.value === "command";
  });

  const showPlayerControls = computed(() => {
    return isCommandPhase.value;
  });

  const playerNeedsRescue = computed(() => {
    return (
      gameState.player.hp <= 0 &&
      gameState.pet &&
      gameState.pet.active &&
      gameState.pet.hp > 0
    );
  });

  const showPetControls = computed(() => {
    return gameActions.isPetDecisionPhase();
  });

  const currentActorName = computed(() => {
    return gameActions.getCurrentActorName();
  });

  const playerDecisionText = computed(() => {
    const decision = gameState.currentBattle?.playerDecision;
    if (!decision) return "";
    switch (decision.type) {
      case "attack":
        return "普通攻击";
      case "skill":
        return `技能[${decision.skill?.name}]`;
      case "defend":
        return "防御";
      case "flee":
        return "逃跑";
      case "item":
        return `道具[${decision.item?.name}]`;
      default:
        return "未知";
    }
  });

  const petDecisionText = computed(() => {
    const decision = gameState.currentBattle?.petDecision;
    if (!decision) return "";
    switch (decision.type) {
      case "attack":
        return "普通攻击";
      case "skill":
        return `技能[${decision.skill?.name}]`;
      case "defend":
        return "防御";
      case "item":
        return `道具[${decision.item?.name}]`;
      default:
        return "未知";
    }
  });

  const aliveEnemies = computed(() => {
    return gameState.currentBattle?.enemies?.filter((e) => e.hp > 0) || [];
  });

  const selectedTargetName = computed(() => {
    const alive = aliveEnemies.value;
    if (alive.length === 0) return "";
    const target = alive.find((e, i) => {
      const aliveIndex = gameState.currentBattle?.enemies?.findIndex(
        (en) => en.id === e.id,
      );
      return aliveIndex === selectedTargetIndex.value;
    });
    return target ? `[${target.name}]` : `[${alive[0]?.name}]`;
  });

  const turnOrderDisplay = computed(() => {
    const battle = gameState.currentBattle;
    if (!battle?.turnOrder) return "";
    return battle.turnOrder
      .map((u) => {
        const isCurrent =
          battle.currentTurnIndex === battle.turnOrder.indexOf(u);
        return isCurrent ? `【${u.name}】` : u.name;
      })
      .join(" → ");
  });

  const selectTarget = (index) => {
    if (gameState.currentBattle?.enemies?.[index]?.hp > 0) {
      selectedTargetIndex.value = index;
    }
  };

  const getAliveTargetIndex = () => {
    return gameState.currentBattle?.enemies?.findIndex((e) => e.hp > 0) ?? -1;
  };

  watch(
    aliveEnemies,
    (newAlive) => {
      if (newAlive.length > 0) {
        const currentTarget =
          gameState.currentBattle?.enemies?.[selectedTargetIndex.value];
        if (!currentTarget || currentTarget.hp <= 0) {
          const firstAliveIndex =
            gameState.currentBattle?.enemies?.findIndex((e) => e.hp > 0) ?? -1;
          selectedTargetIndex.value =
            firstAliveIndex >= 0 ? firstAliveIndex : 0;
        }
      }
    },
    { immediate: true },
  );

  watch(
    () => gameState.battleLog,
    () => {
      nextTick(() => {
        if (logContentRef.value) {
          logContentRef.value.scrollTop = logContentRef.value.scrollHeight;
        }
      });
    },
  );

  onMounted(() => {
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".skill-dropdown")) {
        showPlayerSkillMenu.value = false;
        showPetSkillMenu.value = false;
      }
      if (!e.target.closest(".item-dropdown")) {
        showItemMenu.value = false;
        showPetItemMenu.value = false;
      }
    });
  });

  return {
    showPlayerSkillMenu,
    showPetSkillMenu,
    showItemMenu,
    logContentRef,
    selectedTargetIndex,
    selectedItem,
    selectedItemIndex,
    showTargetSelector,
    showPetItemMenu,
    selectedPetItem,
    selectedPetItemIndex,
    showPetTargetSelector,
    itemUser,
    selectedSkill,
    showSkillTargetSelector,
    selectedPetSkill,
    showPetSkillTargetSelector,
    skillUser,
    currentRound,
    currentPhase,
    currentPhaseText,
    currentPhaseClass,
    isCommandPhase,
    showPlayerControls,
    playerNeedsRescue,
    showPetControls,
    currentActorName,
    playerDecisionText,
    petDecisionText,
    aliveEnemies,
    selectedTargetName,
    turnOrderDisplay,
    selectTarget,
    getAliveTargetIndex,
  };
}
