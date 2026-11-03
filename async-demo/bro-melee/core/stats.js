/**
 * 等级、属性成长与战力评估（README §5 / §8.2）
 */

import { BALANCE, AGGRO_RATIO, AI_CONFIG, RELIC_CONFIG } from '../constants.js';
import { PAIR_BONUS, RELICS } from '../config/relics.js';
import { TREASURES } from '../config/treasures.js';
import { clamp } from './utils.js';

/** 单局等级上限，防止数值溢出 */
export const MAX_LEVEL = 99;

/**
 * 把「奇遇宝物 / 限时 buff」上的属性字段并入被动乘区
 * 字段命名与 passive 一一对应：attackMultiplier 加算、moveMultiplier 加算、defenseFlat 加值
 * @param {Object} passive 被动乘区
 * @param {Array} list 宝物或 buff 列表
 */
const applyModifierList = (passive, list) => {
  list.forEach((mod) => {
    if (!mod) {
      return;
    }
    passive.attackMultiplier += mod.attackMultiplier || 0;
    passive.hpMultiplier += mod.hpMultiplier || 0;
    passive.defenseBonus += mod.defenseFlat || 0;
    passive.critBonus += mod.critBonus || 0;
    passive.moveMultiplier += mod.moveMultiplier || 0;
    passive.damageReduction += mod.damageReduction || 0;
    passive.regenPerSecond += mod.regenPerSecond || 0;
    passive.cooldownMultiplier -= mod.cooldownDelta || 0;
    passive.attackIntervalMultiplier *= mod.attackIntervalMultiplier || 1;
    passive.vulnerableCrit += mod.vulnerableCrit || 0;
    passive.vulnerableMark = Math.max(passive.vulnerableMark, mod.vulnerableMark || 0);
    passive.meleeSlow = Math.max(passive.meleeSlow, mod.meleeSlow || 0);
    passive.reflect += mod.reflect || 0;
  });
};

/** 实体持有的神兵列表（玩家与敌人字段统一） */
export const relicsOf = (entity) => {
  return entity && entity.relics ? entity.relics : [];
};

/** 神兵带来的战力估值（持兵者会被 AI 视为更危险的对手） */
export const relicThreat = (entity) => {
  const ids = relicsOf(entity);
  if (!ids.length) {
    return 0;
  }
  let total = 0;
  ids.forEach((relicId) => {
    const relic = RELICS[relicId];
    if (relic) {
      total += relic.threat;
    }
  });
  if (ids.length >= 2) {
    total += PAIR_BONUS.threat;
  }
  return total;
};

/**
 * 敌人版外部加成：神兵 + 复仇形态 + 羁绊
 * 作用在 refreshEntityBaseStats 算出的基础值之上（每次从 base 重算，幂等）
 * @param {Object} entity 敌人实体
 */
export const applyRelicStats = (entity) => {
  if (entity.isPlayer) {
    entity.relicDamageReduction = 0;
    return;
  }
  const ids = relicsOf(entity);
  let attackMultiplier = 1;
  let hpFlat = 0;
  let hpMultiplier = 1;
  let defenseFlat = 0;
  let speedMultiplier = 1;
  let damageReduction = 0;
  let meleeBonus = 0;
  ids.forEach((relicId) => {
    const bonus = RELICS[relicId] && RELICS[relicId].bonus;
    if (!bonus) {
      return;
    }
    attackMultiplier += bonus.attackMultiplier || 0;
    hpFlat += bonus.maxHpFlat || 0;
    defenseFlat += bonus.defenseFlat || 0;
    speedMultiplier *= bonus.speedMultiplier || 1;
    damageReduction += bonus.damageReduction || 0;
    meleeBonus += bonus.meleeBonus || 0;
  });
  if (ids.length >= 2) {
    attackMultiplier += PAIR_BONUS.attackMultiplier;
    damageReduction += PAIR_BONUS.damageReduction;
  }
  // 复仇形态：双兵尽失的空手谢逊，属性压过「双兵在手」
  // 复仇姿态本身就是更强的档位，即便把兵讨回来也只按复仇算，不叠加
  if (entity.revenge) {
    const revenge = RELIC_CONFIG.REVENGE;
    attackMultiplier = revenge.ATTACK_MULTIPLIER;
    hpMultiplier = revenge.HP_MULTIPLIER;
    hpFlat = 0;
    defenseFlat = revenge.DEFENSE_FLAT;
    speedMultiplier = revenge.SPEED_MULTIPLIER;
    meleeBonus = revenge.MELEE_BONUS;
    damageReduction = revenge.DAMAGE_REDUCTION;
  }
  // 羁绊：谢逊 / 张翠山一方存活给另一方加成（由 core/bonds.js 维护 bondBuff）
  const bond = entity.bondBuff;
  if (bond) {
    attackMultiplier += bond.attack || 0;
    speedMultiplier *= 1 + (bond.speed || 0);
    damageReduction += bond.damageReduction || 0;
  }
  entity.maxHp = Math.round((entity.maxHp + hpFlat) * hpMultiplier);
  entity.attack = Math.round(entity.attack * attackMultiplier);
  entity.defense += defenseFlat;
  entity.speed *= speedMultiplier;
  entity.meleeMultiplier = (entity.baseMeleeMultiplier || entity.meleeMultiplier || 1) + meleeBonus;
  entity.relicDamageReduction = Math.min(0.45, damageReduction);
};

/**
 * 升到下一级所需经验
 * @param {Number} level 当前等级
 * @returns {Number} 所需经验
 */
export const expToNext = (level) => {
  return Math.floor(BALANCE.EXP_CURVE_BASE * Math.pow(BALANCE.EXP_CURVE_GROWTH, level - 1));
};

/**
 * 按等级重算实体基础属性（会覆盖 maxHp/attack/defense/speed/radius）
 * @param {Object} entity 玩家或敌人
 */
export const refreshEntityBaseStats = (entity) => {
  const levelBonus = entity.level - 1;
  const speedGrowth = Math.min(BALANCE.SPEED_GROWTH_CAP, 1 + BALANCE.SPEED_PER_LEVEL * levelBonus);
  const radiusGrowth = Math.min(BALANCE.RADIUS_GROWTH_CAP, BALANCE.RADIUS_PER_LEVEL * levelBonus);
  entity.maxHp = Math.round(entity.baseMaxHp + BALANCE.HP_PER_LEVEL * levelBonus);
  entity.attack = Math.round(entity.baseAttack + BALANCE.ATTACK_PER_LEVEL * levelBonus);
  entity.defense = entity.baseDefense + BALANCE.DEFENSE_PER_LEVEL * levelBonus;
  entity.speed = entity.baseSpeed * speedGrowth;
  entity.radius = entity.baseRadius + radiusGrowth;
  applyRelicStats(entity);
};

/** 神兵加成汇总（玩家 pass ive 乘区用的临时结构） */
const collectRelicBonus = (entity, passive) => {
  const ids = relicsOf(entity);
  if (!ids.length) {
    return;
  }
  ids.forEach((relicId) => {
    const bonus = RELICS[relicId] && RELICS[relicId].bonus;
    if (!bonus) {
      return;
    }
    passive.attackMultiplier += bonus.attackMultiplier || 0;
    passive.relicMaxHpFlat += bonus.maxHpFlat || 0;
    passive.relicDefenseFlat += bonus.defenseFlat || 0;
    passive.critBonus += bonus.critBonus || 0;
    passive.relicMeleeBonus += bonus.meleeBonus || 0;
    passive.moveMultiplier *= bonus.speedMultiplier || 1;
    passive.damageReduction += bonus.damageReduction || 0;
    passive.relicCooldownMultiplier += bonus.cooldownMultiplier || 0;
    passive.relicAttackInterval *= bonus.attackIntervalMultiplier || 1;
    passive.relicDashCooldown *= bonus.dashCooldownMultiplier || 1;
  });
  if (ids.length >= 2) {
    passive.attackMultiplier += PAIR_BONUS.attackMultiplier;
    passive.critBonus += PAIR_BONUS.critBonus;
    passive.damageReduction += PAIR_BONUS.damageReduction;
  }
};

/**
 * 重算玩家属性（等级基础值 + 内功/轻功加成），保持当前血量百分比
 * 幂等：重复调用结果一致
 * @param {Object} player 玩家实体
 */
/** 一份干净的乘区（玩家与随从共用同一套字段） */
export const createEmptyPassive = () => {
  return {
    regenPerSecond: 0,
    attackMultiplier: 1,
    moveMultiplier: 1,
    defenseBonus: 0,
    critBonus: 0,
    lifesteal: 0,
    killHealRatio: 0,
    damageReduction: 0,
    dashCooldownMultiplier: 1,
    dashDistanceMultiplier: 1,
    hpMultiplier: 1,
    cooldownMultiplier: 1,
    shieldCycle: 0,
    shieldAmount: 0,
    dashBoostMultiplier: 1,
    relicMaxHpFlat: 0,
    relicDefenseFlat: 0,
    relicMeleeBonus: 0,
    relicCooldownMultiplier: 0,
    relicAttackInterval: 1,
    relicDashCooldown: 1,
    attackIntervalMultiplier: 1,
    vulnerableCrit: 0,
    vulnerableMark: 0,
    meleeSlow: 0,
    reflect: 0,
  };
};

/**
 * 把一套秘籍层数叠加进乘区（玩家与随从共用，新增秘籍只改这里）
 * @param {Object} passive 乘区（会被原地累加）
 * @param {Object} stacks { 秘籍id: 层数 }
 */
export const applyManualPassive = (passive, stacks) => {
  if (!stacks) {
    return;
  }
  Object.keys(stacks).forEach((skillId) => {
    const stack = stacks[skillId];
    switch (skillId) {
      case 'breathing':
        passive.regenPerSecond += 0.0038 * stack;
        break;
      case 'golden-bell':
        passive.defenseBonus += 4 * stack;
        passive.damageReduction += Math.min(0.2, 0.02 * stack);
        break;
      case 'berserk-blood':
        passive.attackMultiplier += 0.08 * stack;
        passive.critBonus += 0.03 * stack;
        break;
      case 'star-absorb':
        passive.lifesteal += 0.03 * stack;
        passive.killHealRatio += 0.012 * stack;
        break;
      case 'iron-shirt':
        passive.defenseBonus += 3 * stack;
        passive.damageReduction += 0.03 * stack;
        break;
      case 'tough-bone':
        passive.hpMultiplier += 0.07 * stack;
        break;
      case 'swift-sutra':
        passive.cooldownMultiplier -= 0.07 * stack;
        break;
      case 'blood-thirst':
        passive.attackMultiplier += 0.04 * stack;
        passive.lifesteal += 0.02 * stack;
        break;
      case 'qi-shield':
        passive.shieldCycle = 14 - 2 * stack;
        passive.shieldAmount = 60 + 20 * stack;
        break;
      case 'wave-step':
        passive.moveMultiplier += 0.07 * stack;
        break;
      case 'shadow-step':
        passive.dashCooldownMultiplier -= 0.18 * stack;
        passive.dashDistanceMultiplier += 0.1 * stack;
        break;
      case 'wind-rider':
        passive.moveMultiplier += 0.06 * stack;
        passive.dashDistanceMultiplier += 0.04 * stack;
        break;
      case 'phantom':
        passive.dashCooldownMultiplier -= 0.14 * stack;
        passive.dashBoostMultiplier = 1 + 0.1 * stack;
        break;
      case 'nine-yang':
        passive.hpMultiplier += 0.45;
        passive.attackMultiplier += 0.3;
        passive.regenPerSecond += 0.009;
        passive.damageReduction += 0.08;
        break;
      case 'yi-jin-sutra':
        passive.attackMultiplier += 0.18;
        passive.defenseBonus += 16;
        passive.damageReduction += 0.1;
        passive.cooldownMultiplier -= 0.15;
        break;
      case 'twenty-nine-swords':
        passive.vulnerableCrit += 0.6;
        passive.vulnerableMark = Math.max(passive.vulnerableMark, 3);
        break;
      case 'left-right-fight':
        passive.attackIntervalMultiplier *= 0.72;
        passive.relicMeleeBonus += 0.4;
        break;
      case 'meihua-hand':
        passive.meleeSlow = Math.max(passive.meleeSlow, 0.18 + 0.08 * stack);
        break;
      case 'sunflower-manual':
        passive.attackIntervalMultiplier *= 0.6;
        passive.moveMultiplier += 0.22;
        passive.hpMultiplier -= 0.12;
        break;
      default:
        break;
    }
  });
};

export const recalculatePlayerStats = (player) => {
  const hpRatio = player.maxHp > 0 ? clamp(player.hp / player.maxHp, 0, 1) : 1;
  refreshEntityBaseStats(player);
  const passive = createEmptyPassive();
  applyManualPassive(passive, player.skillStacks);
  collectRelicBonus(player, passive);
  const treasureList = (player.treasures || []).map((treasureId) => TREASURES[treasureId]);
  applyModifierList(passive, treasureList);
  applyModifierList(passive, player.buffs || []);
  passive.dashCooldownMultiplier = Math.max(0.28, passive.dashCooldownMultiplier * passive.relicDashCooldown);
  passive.cooldownMultiplier = Math.max(0.3, passive.cooldownMultiplier + passive.relicCooldownMultiplier);
  passive.damageReduction = Math.min(0.62, passive.damageReduction);
  passive.hpMultiplier = Math.max(0.4, passive.hpMultiplier);
  player.passive = passive;
  player.maxHp = Math.round(player.maxHp * passive.hpMultiplier + passive.relicMaxHpFlat);
  player.attack = Math.round(player.attack * passive.attackMultiplier);
  player.defense += passive.defenseBonus + passive.relicDefenseFlat;
  player.meleeMultiplier = BALANCE.PLAYER.attackMultiplier + passive.relicMeleeBonus;
  player.attackInterval = BALANCE.PLAYER.attackInterval * passive.relicAttackInterval * passive.attackIntervalMultiplier;
  player.critRate = clamp(BALANCE.PLAYER.critRate + passive.critBonus, 0, 0.75);
  player.speed *= passive.moveMultiplier;
  player.relicDamageReduction = 0;
  player.expMultiplier = treasureList.reduce((total, treasure) => total * ((treasure && treasure.expMultiplier) || 1), 1);
  player.hp = clamp(hpRatio * player.maxHp, 0, player.maxHp);
};

/**
 * 战力评估：等级 + 血 + 攻 + 技能强度
 * @param {Object} entity 玩家或敌人
 * @returns {Number} 战力分
 */
export const threatScore = (entity) => {
  const skillPower = getSkillPower(entity);
  return entity.level * 10 + entity.hp * 0.5 + entity.attack * 3 + skillPower + relicThreat(entity);
};

/** 技能强度估值（用于战力评估的软指标） */
export const getSkillPower = (entity) => {
  if (entity.isPlayer) {
    let total = 0;
    Object.keys(entity.skillStacks).forEach((skillId) => {
      total += 6 + entity.skillStacks[skillId] * 4;
    });
    return total;
  }
  let total = (entity.skills ? entity.skills.length : 0) * 9;
  if (entity.isBoss) {
    total += 30;
  }
  if (entity.enragedTimer > 0) {
    total += 18;
  }
  return total;
};

/**
 * 是否「明显打得过」（欺软怕硬，README §8.2）
 * @param {Object} attacker 评估者
 * @param {Object} target 目标
 * @returns {Boolean} 是否追击
 */
export const canBeat = (attacker, target) => {
  const ratio = AGGRO_RATIO[attacker.typeId] || 1.2;
  return threatScore(attacker) > threatScore(target) * ratio;
};

/** 目标是否构成「强敌」威胁（逃跑判定） */
export const isStrongThreat = (entity, other) => {
  return threatScore(other) > threatScore(entity) * AI_CONFIG.FLEE_SCORE_RATIO;
};

/**
 * 升级时的属性结算：重算属性并把新增血量补满
 * @param {Object} entity 玩家或敌人
 * @param {Number} levelsGained 本次连升几级
 */
const applyLevelUp = (entity, levelsGained) => {
  const previousMaxHp = entity.maxHp;
  if (entity.isPlayer) {
    recalculatePlayerStats(entity);
    entity.levelUpFlash = 0.6;
  } else {
    refreshEntityBaseStats(entity);
  }
  const maxHpGain = entity.maxHp - previousMaxHp;
  const healRatio = entity.isPlayer ? BALANCE.PLAYER.levelUpHealRatio : 0.15;
  entity.hp = Math.min(entity.maxHp, entity.hp + maxHpGain + entity.maxHp * healRatio * levelsGained);
};

/**
 * 吞噬经验并结算升级（不触发秘籍选择，由 World 处理）
 * @param {Object} entity 获得经验者
 * @param {Number} amount 经验值
 * @returns {Number} 本次升了几级
 */
export const grantExp = (entity, amount) => {
  if (!entity || !entity.alive || entity.level >= MAX_LEVEL) {
    return 0;
  }
  entity.exp += amount * (entity.expMultiplier || 1);
  let levelsGained = 0;
  while (entity.level < MAX_LEVEL && entity.exp >= expToNext(entity.level)) {
    entity.exp -= expToNext(entity.level);
    entity.level += 1;
    levelsGained += 1;
  }
  if (levelsGained > 0) {
    applyLevelUp(entity, levelsGained);
  }
  return levelsGained;
};

/** 玩家还能选几次秘籍（每 5 级一次） */
export const skillChoicesEarned = (player) => {
  return Math.floor(player.level / BALANCE.SKILL_EVERY_LEVELS);
};
