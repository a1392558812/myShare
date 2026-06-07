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
 * 应用强力词条的范围限制
 * @param {string} stat - 词条名称
 * @param {number} value - 基础词条最大值
 * @param {number} level - 装备等级（用于 allStats 限制）
 * @param {number} rarityMultiplier - 稀有度乘数
 * @param {boolean} isDebug - 是否为调试模式，用于是否应用范围限制
 * @returns {number} - 限制后的词条值
 */
export const applyBonusAffixRangeLimit = (stat, value, level = 1, rarityMultiplier = 1, isDebug = false) => {
  const bonusPool = EQUIPMENT_CONFIG.BONUS_AFFIX_POOL;
  
  // allStats 特殊限制：不能超过等级 * 稀有度乘数
  if (stat === "allStats") {
    return Math.min(value, Math.floor(level * rarityMultiplier));
  }
  
  // maxComboCount 特殊限制：不能超过游戏配置的最大连击次数
  if (stat === "maxComboCount") {
    return Math.min(value, GAME_CONFIG.COMBO.MAX_COMBO_COUNT);
  }
  
  // 从词条池获取范围配置
  const bonusConfig = bonusPool[stat];
  if (bonusConfig && bonusConfig.range) {
    const min = bonusConfig.range.min;
    const max = bonusConfig.range.max;
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    return isDebug ? value : random;
  }
  
  // 默认不限制
  return value;
};

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

      // 应用强力词条范围限制
      value = applyBonusAffixRangeLimit(stat, value, level, rarityMultiplier);

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

export const getRandomEquipmentLevel = (mapLevel) => {
  const { min, max } = GAME_CONFIG.EQUIPMENT_LEVEL_OFFSET;
  const minLevel = Math.max(1, mapLevel + min);
  const maxLevel = mapLevel + max;
  return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
};

// 生成基础属性
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

export const getRandomEquipment = (mapLevel = 1) => {
  const type =
    EQUIPMENT_TYPES[Math.floor(Math.random() * EQUIPMENT_TYPES.length)];
  const rarity = getRandomRarity();
  const level = getRandomEquipmentLevel(mapLevel);

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

/**
 * 
 * @param {string} type - 装备类型
 * @param {string} rarity - 装备稀有度
 * @param {number} level - 装备等级
 * @param {Object} baseAffixes - 自定义基础词条
 * @param {Object} bonusAffixes - 自定义强力词条
 * @param {boolean} isDebug - 是否为调试模式
 * @returns 
 */
export const generateCustomEquipment = (
  type,
  rarity,
  level,
  baseAffixes = {},
  bonusAffixes = {},
  isDebug = false,
) => {
  const baseStats = generateBaseStats(type, level, rarity);
  const name = generateEquipmentName(type);
  const rarityMultiplier = EQUIPMENT_CONFIG.RARITY[rarity]?.multiplier || 1;

  // 对自定义传入的词缀也应用稀有度倍率
  for (const [stat, value] of Object.entries(baseAffixes)) {
    baseAffixes[stat] = Math.floor(value * rarityMultiplier);
  }
  for (const [stat, value] of Object.entries(bonusAffixes)) {
    // 先应用稀有度倍率
    bonusAffixes[stat] = Math.floor(value * rarityMultiplier);
    // 再应用强力词条范围限制
    bonusAffixes[stat] = applyBonusAffixRangeLimit(stat, bonusAffixes[stat], level, rarityMultiplier, isDebug);
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

  // 应用强力词条范围限制
  value = applyBonusAffixRangeLimit(selectedStat, value, level, rarityMultiplier);

  return { stat: selectedStat, value };
};

export {
  EQUIPMENT_TYPES,
  EQUIPMENT_PREFIXES,
  EQUIPMENT_SUFFIXES,
  RARITY_NAMES,
};
