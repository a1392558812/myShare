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

/**
 * 动态生成词条库：从 BASE_AFFIX_POOL 和 BONUS_AFFIX_POOL 生成
 */
const generateAffixLibrary = () => {
  const library = [];

  // 从 BASE_AFFIX_POOL 生成基础词条
  const basePool = EQUIPMENT_CONFIG.BASE_AFFIX_POOL;
  for (const [stat, config] of Object.entries(basePool)) {
    library.push({
      stat,
      baseValue: config.baseValue,
      name: config.name,
    });
  }

  // 从 BONUS_AFFIX_POOL 生成强力词条
  const bonusPool = EQUIPMENT_CONFIG.BONUS_AFFIX_POOL;
  for (const [stat, config] of Object.entries(bonusPool)) {
    const affix = {
      stat,
      coefficient: config.coefficient,
      name: config.name,
    };
    if (config.exclusiveTypes) {
      affix.exclusiveTypes = config.exclusiveTypes;
    }
    library.push(affix);
  }

  return library;
};

const AFFIX_LIBRARY = generateAffixLibrary();
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
 * @param {string} rarity - 装备稀有度
 * @param {number} level - 装备等级
 * @param {string|null} type - 装备类型
 * @returns {Object} - 包含 baseAffixes 和 bonusAffixes 的对象
 */
export const generateRandomStats = (rarity, level, type = null) => {
  const config = RARITY_CONFIG[rarity];
  const baseAffixes = {};
  const bonusAffixes = {};
  const usedAffixes = new Set();
  const rarityMultiplier = EQUIPMENT_CONFIG.RARITY[rarity]?.multiplier || 1;

  // 根据稀有度配置决定词缀数量
  const affixCount = Math.floor(Math.random() * (config.maxAffixes + 1));

  // 遍历每个词缀槽位，为其随机选择词缀
  for (let i = 0; i < affixCount; i++) {
    let affixIndex;
    let selectedAffix;
    let attempts = 0;
    const maxAttempts = 9999;

    /**
     * 词缀选择循环 - 使用 do-while 确保至少尝试一次
     *
     * 作用：
     * 1. 随机从词缀库中选择一个词缀
     * 2. 检查该词缀是否满足条件：
     *    - 不是独占类型，或
     *    - 是独占类型但与当前装备类型匹配
     * 3. 确保不重复选择同一个词缀（通过 usedAffixes Set 追踪）
     * 4. 防止无限循环：最多尝试 9999 次
     *
     * 退出条件：
     * - 找到一个有效的、未使用的、符合条件的词缀
     * - 尝试次数超过上限（防止死循环）
     */
    do {
      // 随机选择一个词缀索引
      affixIndex = Math.floor(Math.random() * AFFIX_LIBRARY.length);
      const affix = AFFIX_LIBRARY[affixIndex];

      // 检查词缀是否为独占类型
      const isExclusive =
        affix.exclusiveTypes && affix.exclusiveTypes.length > 0;

      // 检查词缀是否允许使用
      // 条件：非独占词缀，或独占词缀但类型匹配
      const isAllowed =
        !isExclusive || (type && affix.exclusiveTypes.includes(type));

      // 如果词缀可用且未被使用，则选中它
      if (isAllowed && !usedAffixes.has(affixIndex)) {
        selectedAffix = affix;
        break; // 成功选择，退出循环
      }

      // 增加尝试次数，防止无限循环
      attempts++;
      if (attempts >= maxAttempts) {
        // 尝试次数过多，说明词缀库可能已耗尽，放弃本次选择
        selectedAffix = null;
        break;
      }
    } while (usedAffixes.has(affixIndex)); // 如果词缀已被使用，继续循环

    // 如果没有找到有效的词缀，跳过本次循环
    if (!selectedAffix) continue;

    // 计算词缀的随机值
    let value;
    const maxValue = level + EQUIPMENT_GEN_CONFIG.AFFIX_LEVEL_ADD;

    // 根据词缀类型计算数值
    if (selectedAffix.baseValue !== undefined) {
      // 基础值类型词缀：生成 1 到 maxValue 之间的随机数，应用稀有度倍率
      value = Math.floor((Math.random() * maxValue + 1) * rarityMultiplier);
      if (baseAffixes[selectedAffix.stat]) {
        baseAffixes[selectedAffix.stat] += value;
      } else {
        baseAffixes[selectedAffix.stat] = value;
      }
    } else if (selectedAffix.coefficient !== undefined) {
      // 系数类型词缀：随机数乘以系数，应用稀有度倍率
      value = Math.floor(
        (Math.random() * maxValue + 1) *
          selectedAffix.coefficient *
          rarityMultiplier,
      );

      // 全属性词缀限制最大值为等级，应用稀有度倍率
      if (selectedAffix.stat === "allStats") {
        value = Math.min(value, Math.floor(level * rarityMultiplier));
      }

      // 连击次数词缀限制最大值为MAX_COMBO_COUNT
      if (selectedAffix.stat === "maxComboCount") {
        value = Math.min(value, GAME_CONFIG.COMBO.MAX_COMBO_COUNT);
      }

      // 障碍抗性词缀限制取值范围
      if (selectedAffix.stat === "debuffResist") {
        const range = EQUIPMENT_CONFIG.BONUS_AFFIX_POOL.debuffResist?.range || { min: 1, max: 30 };
        value = Math.max(range.min, Math.min(value, range.max));
      }

      if (bonusAffixes[selectedAffix.stat]) {
        bonusAffixes[selectedAffix.stat] += value;
      } else {
        bonusAffixes[selectedAffix.stat] = value;
      }
    }

    // 将已使用的词缀索引添加到集合中，防止重复选择
    usedAffixes.add(affixIndex);
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

export {
  EQUIPMENT_TYPES,
  EQUIPMENT_PREFIXES,
  EQUIPMENT_SUFFIXES,
  RARITY_NAMES,
};
