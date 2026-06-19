import { EQUIPMENT_CONFIG, GAME_CONFIG, PLAYER_CONFIG, PET_CONFIG } from "./constants.js";
import {
  generateBaseStats,
  generateRandomStats,
  generateSingleBaseAffix,
  generateSingleBonusAffix,
  EQUIPMENT_PREFIXES,
  EQUIPMENT_SUFFIXES,
} from "./equipment.js";
import { calculateSkillEnhanceCost } from "./utils.js";
import { reforgeStatPoints, reforgePetStatPoints } from "./player.js";

export const buyItem = (player, item) => {
  const buyPrice = item.price;

  if (player.gold < buyPrice) {
    return false;
  }

  player.gold -= buyPrice;
  
  // 血池或法池：不堆叠，直接 push 新对象，初始化 currentStorage
  if (item.type === "bloodPool" || item.type === "manaPool") {
    player.inventory.push({
      ...item,
      currentStorage: item.maxStorage || 100000000,
    });
  } else {
    const existingItem = player.inventory.find((i) => i.id === item.id);
    if (existingItem) {
      existingItem.count++;
    } else {
      player.inventory.push({ ...item, count: 1 });
    }
  }
  return true;
};

export const sellItem = (player, index) => {
  if (index >= 0 && index < player.inventory.length) {
    const item = player.inventory[index];
    const sellPrice = Math.floor(item.price * GAME_CONFIG.ITEM_SELL_RATIO);
    player.gold += sellPrice;
    player.inventory.splice(index, 1);
    return sellPrice;
  }
  return 0;
};

export const buyEquipment = (player, type) => {
  const level = GAME_CONFIG.SHOP.EQUIPMENT_LEVEL;
  const rarity = GAME_CONFIG.SHOP.EQUIPMENT_RARITY;

  const price = GAME_CONFIG.SHOP.EQUIPMENT_PRICES[type] || 1;

  if (player.gold < price) {
    return false;
  }

  player.gold -= price;

  const prefixCount = GAME_CONFIG.SHOP.PREFIX_COUNT;
  const availablePrefixes = EQUIPMENT_PREFIXES.slice(0, prefixCount);
  const suffixes = EQUIPMENT_SUFFIXES[type] || ["装备"];
  const prefix =
    availablePrefixes[Math.floor(Math.random() * availablePrefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const name = prefix + suffix;

  const baseStats = generateBaseStats(type, level);

  const rarityName = EQUIPMENT_CONFIG.RARITY[rarity]?.name || "普通";

  const equipment = {
    uid: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    id: `${type}_${Date.now()}`,
    name,
    type,
    rarity,
    level,
    baseStats,
    baseAffixes: {},
    bonusAffixes: {},
    description: `Lv.${level} ${rarityName}的${name}`,
  };

  player.equipmentBag.push(equipment);
  return equipment;
};

export const refreshEquipmentAffixes = (player, index) => {
  if (index < 0 || index >= player.equipmentBag.length) {
    return false;
  }

  const equipment = player.equipmentBag[index];
  const refreshCost = Math.floor(50 * equipment.level);

  if (player.gold < refreshCost) {
    return false;
  }

  player.gold -= refreshCost;

  const type = equipment.type;
  const level = equipment.level;
  const baseStats = generateBaseStats(type, level);
  const { baseAffixes, bonusAffixes } = generateRandomStats(
    equipment.rarity,
    level,
    type,
  );

  equipment.baseStats = baseStats;
  equipment.baseAffixes = baseAffixes;
  equipment.bonusAffixes = bonusAffixes;
  return true;
};

export const sellEquipmentForGold = (player, index, getEquipmentSellPrice) => {
  if (index < 0 || index >= player.equipmentBag.length) {
    return 0;
  }

  const equipment = player.equipmentBag[index];
  const sellPrice = getEquipmentSellPrice(equipment);

  player.gold += sellPrice;
  player.equipmentBag.splice(index, 1);
  return sellPrice;
};

export const refreshSingleBaseAffix = (player, index, stat) => {
  if (index < 0 || index >= player.equipmentBag.length) {
    return { success: false, message: '装备不存在' };
  }

  const equipment = player.equipmentBag[index];
  const config = GAME_CONFIG.SHOP.AFFIX_REFRESH;
  const refreshCost = Math.floor(config.BASE_AFFIX_COST + equipment.level * config.LEVEL_COST_MULTIPLIER);

  if (player.gold < refreshCost) {
    return { success: false, message: '金币不足' };
  }

  player.gold -= refreshCost;

  // 先移除旧词条，然后传入剩下的词条来避免重复
  const oldValue = equipment.baseAffixes[stat];
  delete equipment.baseAffixes[stat];
  
  const newAffix = generateSingleBaseAffix(
    equipment.type, 
    equipment.level, 
    equipment.rarity, 
    equipment.baseAffixes,  // 传入已存在的词条（不包含要刷新的那个）
    stat // 允许保持相同的词条类型
  );
  
  equipment.baseAffixes[newAffix.stat] = newAffix.value;

  return {
    success: true,
    oldStat: stat,
    oldValue: oldValue,
    newStat: newAffix.stat,
    newValue: newAffix.value,
  };
};

export const refreshSingleBonusAffix = (player, index, stat) => {
  if (index < 0 || index >= player.equipmentBag.length) {
    return { success: false, message: '装备不存在' };
  }

  const equipment = player.equipmentBag[index];
  const config = GAME_CONFIG.SHOP.AFFIX_REFRESH;
  const refreshCost = Math.floor(config.BONUS_AFFIX_COST + equipment.level * config.LEVEL_COST_MULTIPLIER);

  if (player.gold < refreshCost) {
    return { success: false, message: '金币不足' };
  }

  player.gold -= refreshCost;

  // 先移除旧词条，然后传入剩下的词条来避免重复
  const oldValue = equipment.bonusAffixes[stat];
  delete equipment.bonusAffixes[stat];

  const newAffix = generateSingleBonusAffix(
    equipment.type, 
    equipment.level, 
    equipment.rarity, 
    equipment.bonusAffixes,  // 传入已存在的词条（不包含要刷新的那个）
    stat // 允许保持相同的词条类型
  );
  
  if (!newAffix) {
    // 如果没有可用词条，把旧的加回去
    equipment.bonusAffixes[stat] = oldValue;
    return { success: false, message: '没有可用的强力词条' };
  }
  
  equipment.bonusAffixes[newAffix.stat] = newAffix.value;

  return {
    success: true,
    oldStat: stat,
    oldValue: oldValue,
    newStat: newAffix.stat,
    newValue: newAffix.value,
  };
};

// 强化玩家或宠物的技能
export const enhanceSkill = (character, skillIndex, gameConfig) => {
  const skills = character.skills || [];
  
  if (skillIndex < 0 || skillIndex >= skills.length) {
    return { success: false, message: '技能不存在' };
  }
  
  const skill = skills[skillIndex];
  const enhanceConfig = gameConfig.SHOP.SKILL_ENHANCE;
  
  if (skill.enhanceLevel >= enhanceConfig.MAX_LEVEL) {
    return { success: false, message: '技能已达到最高强化等级' };
  }
  
  const cost = calculateSkillEnhanceCost(skill, gameConfig);
  
  if (character.gold < cost) {
    return { success: false, message: '金币不足' };
  }
  
  character.gold -= cost;
  skill.enhanceLevel += 1;
  
  return {
    success: true,
    oldLevel: skill.enhanceLevel - 1,
    newLevel: skill.enhanceLevel,
    message: `技能强化成功！${skill.name} Lv${skill.enhanceLevel}`,
  };
};

/**
 * 计算玩家可重铸的属性点数量（只计算手动分配的点数）
 * @param {Object} player - 玩家对象
 * @returns {number} 可重铸的属性点总数
 */
export const getPlayerReforgeablePoints = (player) => {
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

  return totalReforgeablePoints;
};

/**
 * 重铸玩家属性加点
 * 将手动分配的属性点返还到未分配池，扣除金币
 * @param {Object} player - 玩家对象
 * @param {Object} gameConfig - 游戏配置
 * @returns {Object} 操作结果
 */
export const reforgePlayerStatPoints = (player, gameConfig) => {
  const reforgeablePoints = getPlayerReforgeablePoints(player);

  if (reforgeablePoints === 0) {
    return { success: false, message: "没有可重铸的属性点" };
  }

  const config = gameConfig.SHOP.STAT_REFORGE;
  const cost = Math.floor(
    config.BASE_COST +
      player.level * config.LEVEL_COST_MULTIPLIER +
      reforgeablePoints * config.POINT_COST_MULTIPLIER
  );

  if (player.gold < cost) {
    return { success: false, message: "金币不足" };
  }

  player.gold -= cost;
  const reforgedPoints = reforgeStatPoints(player);

  return {
    success: true,
    reforgedPoints,
    cost,
    message: `重铸成功！返还 ${reforgedPoints} 点属性点到未分配池，消耗 ${cost} 金币`,
  };
};

/**
 * 计算宠物可重铸的属性点数量（只计算手动分配的点数）
 * @param {Object} pet - 宠物对象
 * @returns {number} 可重铸的属性点总数
 */
export const getPetReforgeablePoints = (pet) => {
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

  return totalReforgeablePoints;
};

/**
 * 重铸宠物属性加点
 * 将手动分配的属性点返还到未分配池，扣除金币（从玩家金币中扣除）
 * @param {Object} player - 玩家对象（支付金币）
 * @param {Object} pet - 宠物对象
 * @param {Object} gameConfig - 游戏配置
 * @returns {Object} 操作结果
 */
export const reforgePetStatPointsShop = (player, pet, gameConfig) => {
  const reforgeablePoints = getPetReforgeablePoints(pet);

  if (reforgeablePoints === 0) {
    return { success: false, message: "没有可重铸的属性点" };
  }

  const config = gameConfig.SHOP.STAT_REFORGE;
  const cost = Math.floor(
    config.BASE_COST +
      pet.level * config.LEVEL_COST_MULTIPLIER +
      reforgeablePoints * config.POINT_COST_MULTIPLIER
  );

  if (player.gold < cost) {
    return { success: false, message: "金币不足" };
  }

  player.gold -= cost;
  const reforgedPoints = reforgePetStatPoints(pet); // 调用 player.js 中的函数

  return {
    success: true,
    reforgedPoints,
    cost,
    message: `重铸成功！返还 ${reforgedPoints} 点属性点到未分配池，消耗 ${cost} 金币`,
  };
};
