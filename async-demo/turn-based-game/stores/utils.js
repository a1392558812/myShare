import { UI_CONFIG, STAT_CONFIG, EQUIPMENT_CONFIG } from "./constants.js";

// 格式化属性值显示（使用常量配置的小数位数）
export const formatStat = (value) => {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return value.toFixed(UI_CONFIG.DECIMAL_PLACES);
};

// 计算技能消耗（考虑技能强化等级）
export const calculateSkillCost = (skill, level, isPet = false) => {
  const baseCost = skill.cost || 0;
  const magicAttackCoefficient = isPet
    ? STAT_CONFIG.PET_POINT_COEFFICIENTS.magicAttack
    : STAT_CONFIG.POINT_COEFFICIENTS.magicAttack;

  const calculatedCost = baseCost * (level - 1) * magicAttackCoefficient;
  let resCost = Math.max(1, Math.floor(calculatedCost || baseCost));

  // 应用技能强化效果：降低 Math.floor(技能等级 / 10)% 的法力消耗
  if (skill.enhanceLevel && skill.enhanceLevel > 0) {
    const reducePercent = Math.floor(skill.enhanceLevel / 10); // 每10级降低1%
    if (reducePercent > 0) {
      const reduction = resCost * (reducePercent / 100);
      resCost = Math.max(1, Math.floor(resCost - reduction));
    }
  }

  console.log("resCost", {
    resCost,
    calculatedCost,
    magicAttackCoefficient,
    baseCost,
    level,
    enhanceLevel: skill.enhanceLevel,
  });
  return resCost;
};

// 计算技能强化费用
export const calculateSkillEnhanceCost = (skill, gameConfig) => {
  const enhanceConfig = gameConfig.SHOP.SKILL_ENHANCE;
  return enhanceConfig.BASE_COST + skill.enhanceLevel * enhanceConfig.LEVEL_COST_MULTIPLIER;
};

// 计算技能强化后的法力消耗降低百分比
export const calculateSkillEnhanceReducePercent = (skill) => {
  if (!skill.enhanceLevel || skill.enhanceLevel <= 0) {
    return 0;
  }
  return Math.floor(skill.enhanceLevel / 10); // 每10级降低1%
};

// 应用不动如山伤害上限
// 单次受到的物理伤害或法术伤害最大不能超过当前血量的(100 - 2.5 * X)%
export const applyUnshakableMountainLimit = (damage, target, unshakableMountain, gameState) => {
  console.log("applyUnshakableMountainLimit", target);
  if (unshakableMountain <= 0) {
    return damage;
  }
  const maxDamagePercent = Math.max(0, 100 - 2.5 * unshakableMountain); // 上限百分比
  const maxDamage = target.hp * maxDamagePercent / 100;
  if (maxDamage < damage) {
    gameState.battleLog.push(
      `【${target.name}】不动如山触发，免疫${damage - maxDamage}点伤害`,
    );
    return Math.max(1, maxDamage);
   }
  return Math.max(1, damage) // 最小伤害为1
};

// 判断是否闪避成功
// 有X%概率免疫当次受到的物理伤害或法术伤害
export const checkDodge = (target, dodgeChance) => {
  const randomDodgeChance = Math.random() * 100;
  console.log("checkDodge", target, randomDodgeChance, dodgeChance);
  if (dodgeChance <= 0) {
    return false;
  }
  return randomDodgeChance < dodgeChance;
};

/**
 * 获取普通词条的名称
 * 优先从 STAT_CONFIG.NAMES 中获取，如果没有则使用 stat 本身
 */
export const getStatName = (stat) => {
  return STAT_CONFIG.NAMES[stat] || stat;
};

/**
 * 获取强力词条的名称
 * 优先从 BONUS_AFFIX_POOL 中获取，如果没有则使用 STAT_CONFIG.NAMES
 */
export const getBonusStatName = (stat) => {
  const bonusConfig = EQUIPMENT_CONFIG.BONUS_AFFIX_POOL[stat];
  if (bonusConfig && bonusConfig.name) {
    return bonusConfig.name;
  }
  return getStatName(stat);
};