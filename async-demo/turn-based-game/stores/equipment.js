import {
  EQUIPMENT_CONFIG,
  EQUIPMENT_GEN_CONFIG,
  EQUIPMENT_NAME_CONFIG,
  GAME_CONFIG,
} from "./constants.js";

const EQUIPMENT_TYPES = Object.keys(EQUIPMENT_CONFIG.TYPES);
const EQUIPMENT_PREFIXES = EQUIPMENT_NAME_CONFIG.PREFIXES;
const EQUIPMENT_SUFFIXES = EQUIPMENT_NAME_CONFIG.SUFFIXES;
const RARITY_CONFIG = EQUIPMENT_CONFIG.RARITY_WEIGHTS;

const RARITY_NAMES = (() => {
  const names = {};
  for (const rarity in EQUIPMENT_CONFIG.RARITY) {
    names[rarity] = EQUIPMENT_CONFIG.RARITY[rarity].name;
  }
  return names;
})();
const BASE_STATS_BY_TYPE = EQUIPMENT_GEN_CONFIG.BASE_STATS_BY_TYPE;
const LEVEL_MULTIPLIER = EQUIPMENT_GEN_CONFIG.LEVEL_MULTIPLIER;

/**
 * 根据稀有度和等级生成随机词缀属性
 * 基础词条：数量不限制，不重复即可
 * 强力词条：数量受 maxAffixes 限制
 * @param {string} rarity - 装备稀有度
 * @param {number} level - 装备等级
 * @param {string|null} type - 装备类型
 * @returns {Object} - 包含 baseAffixes 和 bonusAffixes 的对象
 */
export const generateRandomStats = (rarity, level, type = null) => {
  const config = RARITY_CONFIG[rarity];
  const baseAffixes = {};
  const bonusAffixes = {};
  const usedBaseStats = new Set();
  const usedBonusStats = new Set();
  const rarityMultiplier = EQUIPMENT_CONFIG.RARITY[rarity]?.multiplier || 1; // 装备品质乘数

  const maxValue = level + EQUIPMENT_GEN_CONFIG.AFFIX_LEVEL_ADD; // 基础词条最大值
   const basePool = EQUIPMENT_CONFIG.BASE_AFFIX_POOL; // 基础词条池
  const bonusPool = EQUIPMENT_CONFIG.BONUS_AFFIX_POOL; // 强力词条池

  // ========== 第一步：生成基础词条（数量不限制，不重复） ==========
  const baseStatKeys = Object.keys(basePool);
  
  // 随机决定生成多少个基础词条（0 ~ 全部）
  const baseAffixCount = Math.floor(Math.random() * (baseStatKeys.length + 1));
  
  // 随机选择基础词条
  const shuffledBaseKeys = [...baseStatKeys].sort(() => Math.random() - 0.5);
  let baseIndex = 0;
  while (usedBaseStats.size < baseAffixCount && baseIndex < shuffledBaseKeys.length) {
    const stat = shuffledBaseKeys[baseIndex];
    if (!usedBaseStats.has(stat)) {
      // 生成基础词条值
      // 基础词条值范围：[1, maxValue] * 装备品质乘数
      const value = Math.floor((Math.random() * maxValue + 1) * rarityMultiplier);
      baseAffixes[stat] = value;
      usedBaseStats.add(stat);
    }
    baseIndex++;
  }

  // ========== 第二步：生成强力词条（数量受 maxAffixes 限制） ==========
  // 随机决定生成多少个强力词条（0 ~ maxAffixes）
  const bonusAffixCount = Math.floor(Math.random() * (config.maxAffixes + 1));
  console.log('baseAffixCount/bonusAffixCount', { baseAffixCount, bonusAffixCount });
  // 获取对这装装备类型有效的强力词条
  let availableBonusStats = Object.keys(bonusPool).filter(stat => {
    const bonusConfig = bonusPool[stat];
    // 非独占词条，或独占词条但类型匹配
    if (!bonusConfig.exclusiveTypes || bonusConfig.exclusiveTypes.length === 0) {
      return true;
    }
    return type && bonusConfig.exclusiveTypes.includes(type);
  });

  // 随机选择强力词条（遍历整个数组，直到找到足够数量的未使用词条）
  const shuffledBonusKeys = [...availableBonusStats].sort(() => Math.random() - 0.5);
  let bonusIndex = 0;
  while (usedBonusStats.size < bonusAffixCount && bonusIndex < shuffledBonusKeys.length) {
    const stat = shuffledBonusKeys[bonusIndex];
    if (!usedBonusStats.has(stat)) {
      const bonusConfig = bonusPool[stat];
      // 生成强力词条值
      let value = Math.floor(
        (Math.random() * maxValue + 1) *
        bonusConfig.coefficient *
        rarityMultiplier,
      );

      // 应用各种限制
      if (stat === "allStats") {
        value = Math.min(value, Math.floor(level * rarityMultiplier));
      }
      if (stat === "maxComboCount") {
        value = Math.min(value, GAME_CONFIG.COMBO.MAX_COMBO_COUNT);
      }
      if (stat === "debuffResist") {
        const range = bonusPool.debuffResist?.range || { min: 1, max: 30 };
        value = Math.max(range.min, Math.min(value, range.max));
      }
      if (stat === "ignoreDebuffResist") {
        const range = bonusPool.ignoreDebuffResist?.range || { min: 1, max: 30 };
        value = Math.max(range.min, Math.min(value, range.max));
      }
      if (stat === "unshakableMountain") {
        const range = bonusPool.unshakableMountain?.range || { min: 1, max: 30 };
        value = Math.max(range.min, Math.min(value, range.max));
      }
      if (stat === "dodge") {
        const range = bonusPool.dodge?.range || { min: 1, max: 20 };
        value = Math.max(range.min, Math.min(value, range.max));
      }

      bonusAffixes[stat] = value;
      usedBonusStats.add(stat);
    }
    bonusIndex++;
  }

  return { baseAffixes, bonusAffixes };
};

export const generateEquipmentName = (type) => {
  const prefix =
    EQUIPMENT_PREFIXES[Math.floor(Math.random() * EQUIPMENT_PREFIXES.length)];
  const suffixList = EQUIPMENT_SUFFIXES[type];
  const suffix = suffixList[Math.floor(Math.random() * suffixList.length)];
  return prefix + suffix;
};

export const getRandomRarity = () => {
  const rarities = Object.keys(RARITY_CONFIG);
  const weights = rarities.map((r) => RARITY_CONFIG[r].weight);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < rarities.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return rarities[i];
    }
  }
  return rarities[0];
};

export const getRandomEquipmentLevel = (playerLevel) => {
  const { min, max } = GAME_CONFIG.EQUIPMENT_LEVEL_OFFSET;
  const minLevel = Math.max(1, playerLevel + min);
  const maxLevel = playerLevel + max;
  return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
};

export const generateBaseStats = (type, level, rarity) => {
  const baseStats = BASE_STATS_BY_TYPE[type] || {};
  const stats = {};
  const rarityMultiplier = EQUIPMENT_CONFIG.RARITY[rarity]?.multiplier || 1;

  for (const [stat, baseValue] of Object.entries(baseStats)) {
    const levelMultiplier = LEVEL_MULTIPLIER[stat] || 1;
    const value = Math.floor(
      (baseValue + (level - 1) * levelMultiplier) * rarityMultiplier,
    );
    stats[stat] = value;
  }

  return stats;
};

export const getRandomEquipment = (playerLevel = 1) => {
  const type =
    EQUIPMENT_TYPES[Math.floor(Math.random() * EQUIPMENT_TYPES.length)];
  const rarity = getRandomRarity();
  const level = getRandomEquipmentLevel(playerLevel);

  const baseStats = generateBaseStats(type, level, rarity);
  const { baseAffixes, bonusAffixes } = generateRandomStats(
    rarity,
    level,
    type,
  );
  const name = generateEquipmentName(type);

  return {
    uid: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    id: `${type}_${Date.now()}`,
    name,
    type,
    rarity,
    level,
    baseStats,
    baseAffixes,
    bonusAffixes,
    description: `Lv.${level} ${RARITY_NAMES[rarity]}的${name}`,
  };
};

export const getEquipmentSellPrice = (equipment) => {
  const basePrice = GAME_CONFIG.SHOP.SELL.BASE_PRICES[equipment.type] || 1;
  const rarityMultiplier =
    EQUIPMENT_CONFIG.RARITY[equipment.rarity]?.sellMultiplier || 1;
  const sellRatio = GAME_CONFIG.SHOP.SELL.SELL_RATIO;
  return Math.floor(basePrice * equipment.level * rarityMultiplier * sellRatio);
};

export const generateDebugEquipment = (rarity, level) => {
  const type =
    EQUIPMENT_TYPES[Math.floor(Math.random() * EQUIPMENT_TYPES.length)];
  const baseStats = generateBaseStats(type, level, rarity);
  const { baseAffixes, bonusAffixes } = generateRandomStats(
    rarity,
    level,
    type,
  );
  const name = generateEquipmentName(type);

  return {
    uid: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    id: `${type}_${Date.now()}`,
    name,
    type,
    rarity,
    level,
    baseStats,
    baseAffixes,
    bonusAffixes,
    description: `Lv.${level} ${RARITY_NAMES[rarity]}的${name}`,
  };
};

export const generateCustomEquipment = (
  type,
  rarity,
  level,
  baseAffixes = {},
  bonusAffixes = {},
) => {
  const baseStats = generateBaseStats(type, level, rarity);
  const name = generateEquipmentName(type);
  const rarityMultiplier = EQUIPMENT_CONFIG.RARITY[rarity]?.multiplier || 1;

  // 对自定义传入的词缀也应用稀有度倍率
  for (const [stat, value] of Object.entries(baseAffixes)) {
    baseAffixes[stat] = Math.floor(value * rarityMultiplier);
  }
  for (const [stat, value] of Object.entries(bonusAffixes)) {
    bonusAffixes[stat] = Math.floor(value * rarityMultiplier);
    if (stat === "allStats") {
      bonusAffixes[stat] = Math.min(
        bonusAffixes[stat],
        Math.floor(level * rarityMultiplier),
      );
    }
    if (stat === "maxComboCount") {
      bonusAffixes[stat] = Math.min(bonusAffixes[stat], 3);
    }
    // 障碍抗性词缀限制取值范围
    if (stat === "debuffResist") {
      const range = EQUIPMENT_CONFIG.BONUS_AFFIX_POOL.debuffResist?.range || { min: 1, max: 30 };
      bonusAffixes[stat] = Math.max(range.min, Math.min(bonusAffixes[stat], range.max));
    }
    // 忽视障碍异常词缀限制取值范围
    if (stat === "ignoreDebuffResist") {
      const range = EQUIPMENT_CONFIG.BONUS_AFFIX_POOL.ignoreDebuffResist?.range || { min: 1, max: 30 };
      bonusAffixes[stat] = Math.max(range.min, Math.min(bonusAffixes[stat], range.max));
    }
    // 不动如山词缀限制取值范围
    if (stat === "unshakableMountain") {
      const range = EQUIPMENT_CONFIG.BONUS_AFFIX_POOL.unshakableMountain?.range || { min: 1, max: 30 };
      bonusAffixes[stat] = Math.max(range.min, Math.min(bonusAffixes[stat], range.max));
    }
    // 闪避词缀限制取值范围
    if (stat === "dodge") {
      const range = EQUIPMENT_CONFIG.BONUS_AFFIX_POOL.dodge?.range || { min: 1, max: 20 };
      bonusAffixes[stat] = Math.max(range.min, Math.min(bonusAffixes[stat], range.max));
    }
    // 反震词缀限制取值范围
    if (stat === "shockAbsorb") {
      const range = EQUIPMENT_CONFIG.BONUS_AFFIX_POOL.shockAbsorb?.range || { min: 1, max: 20 };
      bonusAffixes[stat] = Math.max(range.min, Math.min(bonusAffixes[stat], range.max));
    }
  }

  return {
    uid: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    id: `${type}_${Date.now()}`,
    name,
    type,
    rarity,
    level,
    baseStats,
    baseAffixes,
    bonusAffixes,
    description: `Lv.${level} ${RARITY_NAMES[rarity]}的${name}`,
  };
};

/**
 * 生成单个随机基础词条
 * @param {string} type - 装备类型
 * @param {number} level - 装备等级
 * @param {string} rarity - 装备稀有度
 * @param {Object} existingAffixes - 已存在的词条，用于避免重复
 * @param {string} originalStat - 原始要刷新的词条，允许保持相同
 * @returns {Object} - { stat: string, value: number }
 */
export const generateSingleBaseAffix = (type, level, rarity, existingAffixes = {}, originalStat = null) => {
  const rarityMultiplier = EQUIPMENT_CONFIG.RARITY[rarity]?.multiplier || 1;
  const basePool = EQUIPMENT_CONFIG.BASE_AFFIX_POOL;
  let baseStatKeys = Object.keys(basePool);
  
  // 排除已存在的词条（除了原始要刷新的词条）
  baseStatKeys = baseStatKeys.filter(stat => {
    if (stat === originalStat) return true; // 允许保持相同的词条
    return !existingAffixes[stat];
  });
  
  if (baseStatKeys.length === 0) {
    // 如果没有可用的词条了，只能允许重复
    baseStatKeys = Object.keys(basePool);
  }
  
  // 随机选择一个基础词条
  const randomIndex = Math.floor(Math.random() * baseStatKeys.length);
  const selectedStat = baseStatKeys[randomIndex];
  const config = basePool[selectedStat];
  
  const maxValue = level + EQUIPMENT_GEN_CONFIG.AFFIX_LEVEL_ADD;
  const value = Math.floor((Math.random() * maxValue + 1) * rarityMultiplier);
  
  return { stat: selectedStat, value };
};

/**
 * 生成单个随机强力词条
 * @param {string} type - 装备类型
 * @param {number} level - 装备等级
 * @param {string} rarity - 装备稀有度
 * @param {Object} existingAffixes - 已存在的词条，用于避免重复
 * @param {string} originalStat - 原始要刷新的词条，允许保持相同
 * @returns {Object} - { stat: string, value: number }
 */
export const generateSingleBonusAffix = (type, level, rarity, existingAffixes = {}, originalStat = null) => {
  const rarityMultiplier = EQUIPMENT_CONFIG.RARITY[rarity]?.multiplier || 1;
  const bonusPool = EQUIPMENT_CONFIG.BONUS_AFFIX_POOL;
  let availableStats = Object.keys(bonusPool);
  
  // 筛选对这装装备类型有效的词条
  availableStats = availableStats.filter(stat => {
    const config = bonusPool[stat];
    if (!config.exclusiveTypes || config.exclusiveTypes.length === 0) {
      return true;
    }
    return config.exclusiveTypes.includes(type);
  });
  
  // 排除已存在的词条（除了原始要刷新的词条）
  availableStats = availableStats.filter(stat => {
    if (stat === originalStat) return true; // 允许保持相同的词条
    return !existingAffixes[stat];
  });
  
  if (availableStats.length === 0) {
    // 如果没有可用的词条了，只能允许重复
    availableStats = Object.keys(bonusPool).filter(stat => {
      const config = bonusPool[stat];
      if (!config.exclusiveTypes || config.exclusiveTypes.length === 0) {
        return true;
      }
      return config.exclusiveTypes.includes(type);
    });
  }
  
  if (availableStats.length === 0) {
    return null;
  }
  
  // 随机选择一个强力词条
  const randomIndex = Math.floor(Math.random() * availableStats.length);
  const selectedStat = availableStats[randomIndex];
  const config = bonusPool[selectedStat];
  
  const maxValue = level + EQUIPMENT_GEN_CONFIG.AFFIX_LEVEL_ADD;
  let value = Math.floor(
    (Math.random() * maxValue + 1) *
    config.coefficient *
    rarityMultiplier,
  );

  // 应用各种限制
  if (selectedStat === "allStats") {
    value = Math.min(value, Math.floor(level * rarityMultiplier));
  }
  if (selectedStat === "maxComboCount") {
    value = Math.min(value, GAME_CONFIG.COMBO.MAX_COMBO_COUNT);
  }
  if (selectedStat === "debuffResist") {
    const range = bonusPool.debuffResist?.range || { min: 1, max: 30 };
    value = Math.max(range.min, Math.min(value, range.max));
  }
  if (selectedStat === "ignoreDebuffResist") {
    const range = bonusPool.ignoreDebuffResist?.range || { min: 1, max: 30 };
    value = Math.max(range.min, Math.min(value, range.max));
  }
  if (selectedStat === "unshakableMountain") {
    const range = bonusPool.unshakableMountain?.range || { min: 1, max: 30 };
    value = Math.max(range.min, Math.min(value, range.max));
  }
  if (selectedStat === "dodge") {
    const range = bonusPool.dodge?.range || { min: 1, max: 20 };
    value = Math.max(range.min, Math.min(value, range.max));
  }
  if (selectedStat === "shockAbsorb") {
    const range = bonusPool.shockAbsorb?.range || { min: 1, max: 20 };
    value = Math.max(range.min, Math.min(value, range.max));
  }

  return { stat: selectedStat, value };
};

export {
  EQUIPMENT_TYPES,
  EQUIPMENT_PREFIXES,
  EQUIPMENT_SUFFIXES,
  RARITY_NAMES,
};
