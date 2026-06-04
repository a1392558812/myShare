import { ref, computed } from "vue";
import { gameState, gameActions } from "../../../stores/gameStore.js";
import {
  calculatePlayerStats,
  calculatePetStats,
} from "../../../stores/player.js";
import {
  ITEMS_CONFIG,
  EQUIPMENT_CONFIG,
  STAT_CONFIG,
  SKILLS_CONFIG,
} from "../../../stores/constants.js";

export function useDebug() {
  const coeffStatsList = Object.keys(
    STAT_CONFIG.PET_STAT_POINT_COEFFICIENT_RANGES,
  );
  const defaultCoefficients = { ...STAT_CONFIG.PET_POINT_COEFFICIENTS };

  const petCoefficients = ref({
    ...(gameState.pet?.pointCoefficients || defaultCoefficients),
  });

  const goldAmount = ref(100);
  const statAmount = ref(1);
  const selectedStat = ref("physicalAttack");
  const expAmount = ref(50);
  const hpAmount = ref(50);
  const mpAmount = ref(30);
  const selectedItemId = ref(ITEMS_CONFIG[0].id);
  const itemCount = ref(1);
  const selectedRarity = ref("0");
  const equipLevel = ref(1);
  const selectedEquipType = ref("weapon");
  const selectedSkillId = ref(SKILLS_CONFIG[0].id);

  const selectedPetStat = ref("physicalAttack");
  const petStatAmount = ref(1);
  const petExpAmount = ref(50);
  const petHpAmount = ref(50);
  const petMpAmount = ref(30);
  const selectedPetSkillId = ref(SKILLS_CONFIG[0].id);

  const customBaseAffixes = ref([{ stat: "physicalAttack", value: 5 }]);
  const customBonusAffixes = ref([{ stat: "physicalAttack", value: 20 }]);

  const uniqueBonusAffixStats = Object.keys(EQUIPMENT_CONFIG.BONUS_AFFIX_POOL);

  const addGold = () => {
    gameState.player.gold += goldAmount.value;
  };

  const addStatPoints = () => {
    const stat = selectedStat.value;
    const amount = statAmount.value;
    
    // 特殊属性：critRate、comboRate、maxComboCount 直接存储在 player 对象中
    if (stat === "critRate" || stat === "comboRate" || stat === "maxComboCount") {
      gameState.player[stat] = (gameState.player[stat] || 0) + amount;
    } else {
      // 普通属性：使用 Points 后缀
      const pointField = `${stat}Points`;
      gameState.player[pointField] = (gameState.player[pointField] || 0) + amount;
    }
    
    const calculatedStats = calculatePlayerStats(gameState.player);
    gameState.player.maxHp = calculatedStats.maxHp;
    gameState.player.maxMp = calculatedStats.maxMp;
  };

  const addExp = () => {
    gameState.player.exp += expAmount.value;
    gameActions.levelUp();
  };

  const addHp = () => {
    gameState.player.hp = Math.min(
      gameState.player.maxHp,
      gameState.player.hp + hpAmount.value,
    );
  };

  const fillHp = () => {
    gameState.player.hp = gameState.player.maxHp;
  };

  const addMp = () => {
    gameState.player.mp = Math.min(
      gameState.player.maxMp,
      gameState.player.mp + mpAmount.value,
    );
  };

  const fillMp = () => {
    gameState.player.mp = gameState.player.maxMp;
  };

  const addItem = () => {
    const itemData = ITEMS_CONFIG.find(
      (item) => item.id === selectedItemId.value,
    );
    if (!itemData) return;
    const existingItem = gameState.player.inventory.find(
      (item) => item.id === itemData.id,
    );
    if (existingItem) {
      existingItem.count += itemCount.value;
    } else {
      gameState.player.inventory.push({
        ...itemData,
        count: itemCount.value,
      });
    }
  };

  const addSkill = () => {
    const skillData = SKILLS_CONFIG.find(
      (skill) => skill.id === selectedSkillId.value,
    );
    if (!skillData) return;
    const hasSkill = gameState.player.skills.some(
      (skill) => skill.id === skillData.id,
    );
    if (!hasSkill) {
      gameState.player.skills.push(skillData);
    }
  };

  const addAllSkills = () => {
    SKILLS_CONFIG.forEach((skillData) => {
      const hasSkill = gameState.player.skills.some(
        (skill) => skill.id === skillData.id,
      );
      if (!hasSkill) {
        gameState.player.skills.push(skillData);
      }
    });
  };

  const addPetStatPoints = () => {
    if (!gameState.pet) return;
    const stat = selectedPetStat.value;
    const amount = petStatAmount.value;
    
    // 特殊属性：critRate、comboRate、maxComboCount 直接存储在 pet 对象中
    if (stat === "critRate" || stat === "comboRate" || stat === "maxComboCount") {
      gameState.pet[stat] = (gameState.pet[stat] || 0) + amount;
    } else {
      // 普通属性：使用 Points 后缀
      const pointField = `${stat}Points`;
      gameState.pet[pointField] = (gameState.pet[pointField] || 0) + amount;
    }
    
    const calculatedStats = calculatePetStats(gameState.pet);
    gameState.pet.maxHp = calculatedStats.maxHp;
    gameState.pet.maxMp = calculatedStats.maxMp;
  };

  const addPetExp = () => {
    if (!gameState.pet) return;
    gameState.pet.exp += petExpAmount.value;
    gameActions.petLevelUp();
  };

  const addPetHp = () => {
    if (!gameState.pet) return;
    gameState.pet.hp = Math.min(
      gameState.pet.maxHp,
      gameState.pet.hp + petHpAmount.value,
    );
  };

  const fillPetHp = () => {
    if (!gameState.pet) return;
    gameState.pet.hp = gameState.pet.maxHp;
  };

  const addPetMp = () => {
    if (!gameState.pet) return;
    gameState.pet.mp = Math.min(
      gameState.pet.maxMp,
      gameState.pet.mp + petMpAmount.value,
    );
  };

  const fillPetMp = () => {
    if (!gameState.pet) return;
    gameState.pet.mp = gameState.pet.maxMp;
  };

  const addPetSkill = () => {
    if (!gameState.pet) return;
    const skillData = SKILLS_CONFIG.find(
      (skill) => skill.id === selectedPetSkillId.value,
    );
    if (!skillData) return;
    const hasSkill = gameState.pet.skills.some(
      (skill) => skill.id === skillData.id,
    );
    if (!hasSkill) {
      gameState.pet.skills.push(skillData);
    }
  };

  const addAllPetSkills = () => {
    if (!gameState.pet) return;
    SKILLS_CONFIG.forEach((skillData) => {
      const hasSkill = gameState.pet.skills.some(
        (skill) => skill.id === skillData.id,
      );
      if (!hasSkill) {
        gameState.pet.skills.push(skillData);
      }
    });
  };

  const addBaseAffix = () => {
    customBaseAffixes.value.push({ stat: "physicalAttack", value: 1 });
  };

  const addBonusAffix = () => {
    customBonusAffixes.value.push({ stat: "physicalAttack", value: 10 });
  };

  const removeAffix = (type, index) => {
    if (type === "base") {
      customBaseAffixes.value.splice(index, 1);
    } else {
      customBonusAffixes.value.splice(index, 1);
    }
  };

  const addCustomEquipment = () => {
    const baseAffixes = {};
    customBaseAffixes.value.forEach((affix) => {
      if (affix && affix.stat && affix.value > 0) {
        baseAffixes[affix.stat] = (baseAffixes[affix.stat] || 0) + affix.value;
      }
    });

    const bonusAffixes = {};
    customBonusAffixes.value.forEach((affix) => {
      if (affix && affix.stat && affix.value > 0) {
        bonusAffixes[affix.stat] =
          (bonusAffixes[affix.stat] || 0) + affix.value;
      }
    });

    const equipment = gameActions.generateCustomEquipment(
      selectedEquipType.value,
      selectedRarity.value,
      equipLevel.value,
      baseAffixes,
      bonusAffixes,
    );
    gameState.player.equipmentBag.push(equipment);
  };

  const setPlayerTurn = () => {
    if (gameState.currentBattle) {
      gameState.currentBattle.playerTurn = true;
    }
  };

  const setEnemyTurn = () => {
    if (gameState.currentBattle) {
      gameState.currentBattle.playerTurn = false;
    }
  };

  const getStatName = (stat) => STAT_CONFIG.NAMES[stat] || stat;

  const getCurrentCoefficientInfo = () => {
    if (!gameState.pet) return "无宠物";
    const pet = gameState.pet;
    const coeff = pet.pointCoefficients || defaultCoefficients;
    return Object.entries(coeff)
      .map(([stat, value]) => `${getStatName(stat)}:${value.toFixed(2)}`)
      .join(", ");
  };

  const getDefaultCoefficient = (stat) => {
    return defaultCoefficients[stat]?.toFixed(2) || "";
  };

  const resetCoefficient = (stat) => {
    petCoefficients.value[stat] = defaultCoefficients[stat];
  };

  const applyAllCoefficients = () => {
    if (!gameState.pet) {
      alert("宠物不存在！");
      return;
    }
    gameState.pet.pointCoefficients = { ...petCoefficients.value };
    const newStats = calculatePetStats(gameState.pet);
    gameState.pet.maxHp = newStats.maxHp;
    gameState.pet.maxMp = newStats.maxMp;
    gameState.pet.hp = Math.min(gameState.pet.hp, gameState.pet.maxHp);
    gameState.pet.mp = Math.min(gameState.pet.mp, gameState.pet.maxMp);
    alert("系数应用成功！");
  };

  const resetAllCoefficients = () => {
    petCoefficients.value = { ...defaultCoefficients };
    if (gameState.pet) {
      gameState.pet.pointCoefficients = { ...defaultCoefficients };
      const newStats = calculatePetStats(gameState.pet);
      gameState.pet.maxHp = newStats.maxHp;
      gameState.pet.maxMp = newStats.maxMp;
      gameState.pet.hp = Math.min(gameState.pet.hp, gameState.pet.maxHp);
      gameState.pet.mp = Math.min(gameState.pet.mp, gameState.pet.maxMp);
    }
    alert("已重置为默认系数！");
  };

  const confirmReset = () => {
    if (confirm("确定要重置游戏吗？所有进度将丢失！")) {
      gameActions.resetGame();
    }
  };

  return {
    coeffStatsList,
    defaultCoefficients,
    petCoefficients,
    goldAmount,
    statAmount,
    selectedStat,
    expAmount,
    hpAmount,
    mpAmount,
    selectedItemId,
    itemCount,
    selectedRarity,
    equipLevel,
    selectedEquipType,
    selectedSkillId,
    selectedPetStat,
    petStatAmount,
    petExpAmount,
    petHpAmount,
    petMpAmount,
    selectedPetSkillId,
    customBaseAffixes,
    customBonusAffixes,
    uniqueBonusAffixStats,
    addGold,
    addStatPoints,
    addExp,
    addHp,
    fillHp,
    addMp,
    fillMp,
    addItem,
    addSkill,
    addAllSkills,
    addPetStatPoints,
    addPetExp,
    addPetHp,
    fillPetHp,
    addPetMp,
    fillPetMp,
    addPetSkill,
    addAllPetSkills,
    addBaseAffix,
    addBonusAffix,
    removeAffix,
    addCustomEquipment,
    setPlayerTurn,
    setEnemyTurn,
    getStatName,
    getCurrentCoefficientInfo,
    getDefaultCoefficient,
    resetCoefficient,
    applyAllCoefficients,
    resetAllCoefficients,
    confirmReset,
    ITEMS_CONFIG,
    SKILLS_CONFIG,
    EQUIPMENT_CONFIG,
    STAT_CONFIG,
  };
}
