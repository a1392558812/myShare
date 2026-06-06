import { UI_CONFIG, STAT_CONFIG } from "./constants.js";

// 格式化属性值显示（使用常量配置的小数位数）
export const formatStat = (value) => {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return value.toFixed(UI_CONFIG.DECIMAL_PLACES);
};

// 计算技能消耗
export const calculateSkillCost = (skill, level, isPet = false) => {
  const baseCost = skill.cost || 0;
  const magicAttackCoefficient = isPet
    ? STAT_CONFIG.PET_POINT_COEFFICIENTS.magicAttack
    : STAT_CONFIG.POINT_COEFFICIENTS.magicAttack;

  const calculatedCost = baseCost * (level - 1) * magicAttackCoefficient;
  const resCost = Math.max(1, Math.floor(calculatedCost || baseCost));
  console.log("resCost", {
    resCost,
    calculatedCost,
    magicAttackCoefficient,
    baseCost,
    level,
  });
  return resCost;
};
