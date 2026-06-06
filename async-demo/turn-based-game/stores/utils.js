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
