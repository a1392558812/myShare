import { ref, computed } from "vue";
import { gameState, gameActions } from "../../../stores/gameStore.js";
import { calculatePetStats } from "../../../stores/player.js";
import {
  STAT_CONFIG,
  EQUIPMENT_CONFIG,
  EQUIPMENT_GEN_CONFIG,
  EQUIPMENT_NAME_CONFIG,
  GAME_CONFIG,
  ITEMS_CONFIG,
  PET_CONFIG,
  SKILLS_CONFIG,
  PLAYER_CONFIG,
} from "../../../stores/constants.js";
import {
  calculateSkillEnhanceCost,
  calculateSkillEnhanceReducePercent,
  getStatName,
  getBonusStatName,
} from "../../../stores/utils.js";

export function useShop() {
  const rerollStatsList = Object.keys(
    STAT_CONFIG.PET_STAT_POINT_COEFFICIENT_RANGES,
  );
  const selectedType = ref("weapon");
  const equipmentTypes = Object.keys(EQUIPMENT_CONFIG.TYPES);

  const getTypeName = (type) => EQUIPMENT_CONFIG.TYPES[type]?.name || type;
  const getRarityColor = (rarity) =>
    EQUIPMENT_CONFIG.RARITY[rarity]?.color || "#9ca3af";
  const getRarityName = (rarity) =>
    EQUIPMENT_CONFIG.RARITY[rarity]?.name || "普通";

  const getShopEquipmentName = () => {
    const type = selectedType.value;
    const prefixCount = GAME_CONFIG.SHOP?.PREFIX_COUNT || 3;
    const prefix =
      EQUIPMENT_NAME_CONFIG.PREFIXES[Math.floor(Math.random() * prefixCount)];
    const suffixList = EQUIPMENT_NAME_CONFIG.SUFFIXES[type];
    const suffix = suffixList[Math.floor(Math.random() * suffixList.length)];
    return prefix + suffix;
  };

  const shopPreviewStats = computed(() => {
    const type = selectedType.value;
    const baseStats = EQUIPMENT_GEN_CONFIG.BASE_STATS_BY_TYPE;
    return baseStats[type] || {};
  });

  const shopEquipmentPrice = computed(() => {
    const type = selectedType.value;
    return GAME_CONFIG.SHOP?.EQUIPMENT_PRICES[type] || 1;
  });

  const closeShop = () => {
    gameActions.setScreen("map");
  };

  const selectEquipmentType = (type) => {
    selectedType.value = type;
  };

  const buyItem = (item) => {
    if (gameActions.buyItem(item)) {
      return { success: true, message: `购买成功！获得 ${item.name}` };
    } else {
      return { success: false, message: "金币不足！" };
    }
  };

  const buyEquipment = (type) => {
    const result = gameActions.buyEquipment(type);
    if (result) {
      return { success: true, message: `购买成功！获得 ${result.name}` };
    } else {
      return { success: false, message: "金币不足！" };
    }
  };

  const sellItem = (index) => {
    const price = gameActions.sellItem(index);
    if (price > 0) {
      return { success: true, message: `出售成功！获得 ${price} 金币`, price };
    }
    return { success: false, message: "", price: 0 };
  };

  const getEquipmentSellPrice = (equipment) => {
    return gameActions.getEquipmentSellPrice(equipment);
  };

  const getRefreshCost = (equipment) => {
    const baseCost = GAME_CONFIG.SHOP?.REFRESH_BASE_COST || 50;
    return Math.floor(baseCost * equipment.level);
  };

  const sellEquipment = (index) => {
    const price = gameActions.sellEquipmentForGold(index);
    if (price > 0) {
      return { success: true, message: `出售成功！获得 ${price} 金币`, price };
    }
    return { success: false, message: "", price: 0 };
  };

  const refreshAffixes = (index) => {
    if (gameActions.refreshEquipmentAffixes(index)) {
      return { success: true, message: "刷新成功！装备词条已更新" };
    } else {
      return { success: false, message: "金币不足！" };
    }
  };

  const getSingleBaseAffixCost = (equipment) => {
    const config = GAME_CONFIG.SHOP.AFFIX_REFRESH;
    return Math.floor(config.BASE_AFFIX_COST + equipment.level * config.LEVEL_COST_MULTIPLIER);
  };

  const getSingleBonusAffixCost = (equipment) => {
    const config = GAME_CONFIG.SHOP.AFFIX_REFRESH;
    return Math.floor(config.BONUS_AFFIX_COST + equipment.level * config.LEVEL_COST_MULTIPLIER);
  };

  const refreshSingleBaseAffix = (index, stat) => {
    const result = gameActions.refreshSingleBaseAffix(index, stat);
    if (result.success) {
      const oldName = getStatName(result.oldStat);
      const newName = getStatName(result.newStat);
      return { success: true, message: `刷新成功！${oldName} 已替换为 ${newName} +${result.newValue}` };
    } else {
      return { success: false, message: result.message || "刷新失败！" };
    }
  };

  const refreshSingleBonusAffix = (index, stat) => {
    const result = gameActions.refreshSingleBonusAffix(index, stat);
    if (result.success) {
      const oldName = getBonusStatName(result.oldStat);
      const newName = getBonusStatName(result.newStat);
      return { success: true, message: `刷新成功！${oldName} 已替换为 ${newName} +${result.newValue}` };
    } else {
      return { success: false, message: result.message || "刷新失败！" };
    }
  };

  const getRerollCost = () => {
    const pet = gameState.pet;
    if (!pet) return 0;
    const baseCost = STAT_CONFIG.STAT_REROLL.BASE_COST;
    const levelMultiplier = STAT_CONFIG.STAT_REROLL.LEVEL_COST_MULTIPLIER;
    return Math.floor(baseCost + pet.level * levelMultiplier);
  };

  const getCurrentCoefficient = (stat) => {
    const pet = gameState.pet;
    if (!pet) return 0;
    const coeff = pet.pointCoefficients?.[stat];
    if (coeff !== undefined) {
      return coeff.toFixed(2);
    }
    return STAT_CONFIG.PET_POINT_COEFFICIENTS[stat]?.toFixed(2) || "0";
  };

  const getRerollRange = (stat) => {
    const range = STAT_CONFIG.PET_STAT_POINT_COEFFICIENT_RANGES[stat];
    if (!range) return "";
    return `${range.min} ~ ${range.max}`;
  };

  const rerollPetStatCoefficient = (stat) => {
    const range = STAT_CONFIG.PET_STAT_POINT_COEFFICIENT_RANGES[stat];
    if (!range) {
      return { success: false, message: "无效的属性" };
    }

    const cost = getRerollCost();
    if (gameState.player.gold < cost) {
      return { success: false, message: "金币不足！" };
    }

    const newCoefficient =
      Math.floor((Math.random() * (range.max - range.min) + range.min) * 100) /
      100;

    gameState.player.gold -= cost;

    if (!gameState.pet.pointCoefficients) {
      gameState.pet.pointCoefficients = {
        ...STAT_CONFIG.PET_POINT_COEFFICIENTS,
      };
    }
    gameState.pet.pointCoefficients[stat] = newCoefficient;

    const newStats = calculatePetStats(gameState.pet);
    gameState.pet.maxHp = newStats.maxHp;
    gameState.pet.maxMp = newStats.maxMp;
    gameState.pet.hp = Math.min(gameState.pet.hp, gameState.pet.maxHp);
    gameState.pet.mp = Math.min(gameState.pet.mp, gameState.pet.maxMp);

    return {
      success: true,
      message: `重铸成功！${getStatName(stat)} 系数: ${newCoefficient.toFixed(2)}`,
    };
  };

  const getPetSkillLearnCost = () => {
    const pet = gameState.pet;
    if (!pet) return 0;
    const baseCost = STAT_CONFIG.SKILL_LEARN.BASE_COST;
    const levelMultiplier = STAT_CONFIG.SKILL_LEARN.LEVEL_COST_MULTIPLIER;
    return Math.floor(baseCost + pet.level * levelMultiplier);
  };

  const isPetSkillLearned = (skill) => {
    const pet = gameState.pet;
    if (!pet) return false;
    return pet.skills.some((s) => s.id === skill.id);
  };

  const getSkillIcon = (type) => {
    return type === "magic" ? "✨" : "⚔️";
  };

  const learnPetSkill = (skill) => {
    const cost = getPetSkillLearnCost();
    if (gameState.player.gold < cost) {
      return { success: false, message: "金币不足！" };
    }
    if (isPetSkillLearned(skill)) {
      return { success: false, message: "该技能已学习！" };
    }
    gameState.player.gold -= cost;
    gameState.pet.skills.push({ ...skill, enhanceLevel: 0 });
    return {
      success: true,
      message: `恭喜！${gameState.pet.name} 学会了 ${skill.name}！`,
    };
  };

  const enhanceSkill = ({ character, index }) => {
    return gameActions.enhanceSkill(character, index);
  };

  const getPlayerStatReforgeCost = () => {
    const player = gameState.player;
    if (!player) return 0;
    
    // 只计算可重铸的点数（手动分配的点数）
    const pointStats = ["physicalAttack", "magicAttack", "defense", "speed", "maxHp"];
    let totalReforgeablePoints = 0;
    
    for (const stat of pointStats) {
      const currentPoints = player[`${stat}Points`] || 0;
      const initialPoints = PLAYER_CONFIG.INITIAL_POINTS[stat] || 0;
      const levelUpPoints = (player.level - 1) * PLAYER_CONFIG.LEVEL_UP.POINTS_PER_STAT;
      const nonReforgePoints = initialPoints + levelUpPoints;
      const reforgeablePoints = Math.max(0, currentPoints - nonReforgePoints);
      
      totalReforgeablePoints += reforgeablePoints;
    }
    
    if (totalReforgeablePoints === 0) return 0;
    
    const config = GAME_CONFIG.SHOP.STAT_REFORGE;
    return Math.floor(
      config.BASE_COST +
        player.level * config.LEVEL_COST_MULTIPLIER +
        totalReforgeablePoints * config.POINT_COST_MULTIPLIER,
    );
  };

  const getPlayerAllocatedPoints = () => {
    const player = gameState.player;
    if (!player) return [];
    return [
      { key: "physicalAttack", label: "⚔️ 物攻点", value: player.physicalAttackPoints || 0 },
      { key: "magicAttack", label: "✨ 法攻点", value: player.magicAttackPoints || 0 },
      { key: "defense", label: "🛡️ 防御点", value: player.defensePoints || 0 },
      { key: "speed", label: "💨 速度点", value: player.speedPoints || 0 },
      { key: "maxHp", label: "💖 生命点", value: player.maxHpPoints || 0 },
    ];
  };

  const getPlayerTotalAllocatedPoints = () => {
    const player = gameState.player;
    if (!player) return 0;
    return (
      (player.physicalAttackPoints || 0) +
      (player.magicAttackPoints || 0) +
      (player.defensePoints || 0) +
      (player.speedPoints || 0) +
      (player.maxHpPoints || 0)
    );
  };

  const reforgePlayerStatPoints = () => {
    return gameActions.reforgePlayerStatPoints();
  };

  const getPetStatReforgeCost = () => {
    const pet = gameState.pet;
    if (!pet) return 0;
    
    // 只计算可重铸的点数（手动分配的点数）
    const pointStats = ["physicalAttack", "magicAttack", "defense", "speed", "maxHp"];
    let totalReforgeablePoints = 0;
    
    for (const stat of pointStats) {
      const currentPoints = pet[`${stat}Points`] || 0;
      const initialPoints = PET_CONFIG.INITIAL_POINTS[stat] || 0;
      const levelUpPoints = (pet.level - 1) * PET_CONFIG.LEVEL_UP.POINTS_PER_STAT;
      const nonReforgePoints = initialPoints + levelUpPoints;
      const reforgeablePoints = Math.max(0, currentPoints - nonReforgePoints);
      
      totalReforgeablePoints += reforgeablePoints;
    }
    
    if (totalReforgeablePoints === 0) return 0;
    
    const config = GAME_CONFIG.SHOP.STAT_REFORGE;
    return Math.floor(
      config.BASE_COST +
        pet.level * config.LEVEL_COST_MULTIPLIER +
        totalReforgeablePoints * config.POINT_COST_MULTIPLIER,
    );
  };

  const reforgePetStatPoints = () => {
    return gameActions.reforgePetStatPoints();
  };

  return {
    rerollStatsList,
    selectedType,
    equipmentTypes,
    getTypeName,
    getRarityColor,
    getRarityName,
    getShopEquipmentName,
    shopPreviewStats,
    shopEquipmentPrice,
    closeShop,
    selectEquipmentType,
    buyItem,
    buyEquipment,
    sellItem,
    getEquipmentSellPrice,
    getRefreshCost,
    sellEquipment,
    refreshAffixes,
    getSingleBaseAffixCost,
    getSingleBonusAffixCost,
    refreshSingleBaseAffix,
    refreshSingleBonusAffix,
    getRerollCost,
    getCurrentCoefficient,
    getRerollRange,
    rerollPetStatCoefficient,
    getPetSkillLearnCost,
    isPetSkillLearned,
    getSkillIcon,
    learnPetSkill,
    enhanceSkill,
    calculateSkillEnhanceCost,
    calculateSkillEnhanceReducePercent,
    ITEMS_CONFIG,
    SKILLS_CONFIG,
    getPlayerStatReforgeCost,
    getPlayerAllocatedPoints,
    getPlayerTotalAllocatedPoints,
    reforgePlayerStatPoints,
    getPetStatReforgeCost,
    reforgePetStatPoints,
  };
}
