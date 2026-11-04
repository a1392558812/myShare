/**
 * 战斗系统：伤害结算、近战扇形判定、范围伤害、死亡流程（README §11）
 */

import { AI_CONFIG, BALANCE, ENCOUNTER_CONFIG, PALETTE } from '../constants.js';
import { hasTreasure } from '../config/treasures.js';
import { grantExp } from './stats.js';
import { angleDelta, angleOfVector, clamp, distanceBetween } from './utils.js';

/**
 * 计算一次伤害（等级压制 ±5 级封顶，暴击 1.5 倍）
 * @param {Object} attacker 攻击方
 * @param {Object} target 受击方
 * @param {Number} multiplier 技能倍率
 * @returns {{ amount: Number, isCrit: Boolean }} 伤害结果
 */
export const calculateDamage = (attacker, target, multiplier) => {
  const levelDiff = clamp(attacker.level - target.level, -BALANCE.LEVEL_DIFF_CAP, BALANCE.LEVEL_DIFF_CAP);
  const levelScale = 1 + levelDiff * BALANCE.LEVEL_DAMAGE_SCALE;
  // 二十九剑：对「破绽」目标额外暴击率
  const vulnerableCrit = target.vulnerableTimer > 0 && attacker.passive ? attacker.passive.vulnerableCrit || 0 : 0;
  const isCrit = Math.random() < (attacker.critRate || 0) + vulnerableCrit;
  const critMultiplier = isCrit ? BALANCE.CRIT_DAMAGE_MULTIPLIER : 1;
  const attackValue = attacker.attack * (attacker.buffAttackMultiplier || 1);
  const rawDamage = attackValue * multiplier * levelScale * critMultiplier - target.defense * 0.5;
  return {
    amount: Math.max(BALANCE.MIN_DAMAGE, Math.round(rawDamage)),
    isCrit,
  };
};

/**
 * 统一伤害入口：护盾吸收 → 扣血 → 受击反馈 → 死亡判定
 * @param {Object} world 世界实例
 * @param {Object} attacker 攻击方（可为空，表示环境伤害）
 * @param {Object} target 受击方
 * @param {Object} options { multiplier, sourceX, sourceY, knockback, stun, color, noText }
 * @returns {Number} 实际扣除的血量
 */
export const applyDamage = (world, attacker, target, options = {}) => {
  if (!target || !target.alive) {
    return 0;
  }
  if (target.invulnerableTimer > 0) {
    return 0;
  }
  if (target.isPlayer && world.debug && world.debug.invincible) {
    return 0;
  }
  // 羁绊同伴之间互不伤害：横扫、投射物、持续伤害区一概豁免
  if (attacker && attacker.bondId && (attacker.bondId === target.id || target.bondId === attacker.id)) {
    return 0;
  }
  // 随从阵营：玩家 ↔ 随从、随从 ↔ 随从都不互相伤害（横扫、AOE、投射物都豁免）
  const inPlayerTeam = (entity) => Boolean(entity && (entity.isPlayer || entity.isCompanion));
  if (attacker && inPlayerTeam(attacker) && inPlayerTeam(target)) {
    return 0;
  }
  const sourceX = options.sourceX === undefined ? target.x : options.sourceX;
  const sourceY = options.sourceY === undefined ? target.y : options.sourceY;
  const multiplier = options.multiplier === undefined ? 1 : options.multiplier;
  const result = attacker
    ? calculateDamage(attacker, target, multiplier)
    : { amount: Math.max(1, Math.round(multiplier)), isCrit: false };

  let damage = result.amount;
  // 减伤来源：玩家内功被动 + 敌人护体武功（横练铁布衫等）
  const passiveReduction = target.passive ? target.passive.damageReduction : 0;
  const buffReduction = target.buffDamageReduction || 0;
  const relicReduction = target.relicDamageReduction || 0;
  const damageReduction = Math.min(0.75, passiveReduction + buffReduction + relicReduction);
  damage = Math.max(BALANCE.MIN_DAMAGE, Math.round(damage * (1 - damageReduction)));

  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, damage);
    target.shield -= absorbed;
    damage -= absorbed;
    if (target.shield <= 0) {
      target.shield = 0;
      target.shieldTimer = 0;
    }
    if (absorbed > 0 && !options.noText) {
      world.effects.addText(target.x, target.y - target.radius - 6, `-${absorbed}`, {
        color: '#9aa8ff',
        size: 13,
      });
    }
  }

  // 随从挡刀：玩家将死时，附近的随从替他挨这一下（每人只有一次）
  if (target.isPlayer && damage > 0 && damage >= target.hp) {
    const guard = world.enemies.find((enemy) => {
      if (!enemy.alive || !enemy.isCompanion || !enemy.guardFatal) {
        return false;
      }
      return distanceBetween(enemy.x, enemy.y, target.x, target.y) <= ENCOUNTER_CONFIG.GUARD_RADIUS;
    });
    if (guard) {
      guard.guardFatal = false;
      damage = Math.max(1, Math.round(damage * 0.08));
      world.effects.addText(target.x, target.y - target.radius - 28, `${guard.typeName} 替你挡下一击`, {
        color: '#8ef0d5',
        size: 14,
      });
      world.effects.addRing(guard.x, guard.y, guard.radius * 3.4, '#8ef0d5', { life: 0.5, lineWidth: 3 });
      world.notify(`${guard.typeName} 替你挡下了致命一击，倒下了`, '#8ef0d5');
      killEntity(world, guard, null);
    }
  }

  target.hp -= damage;
  target.hitFlash = BALANCE.HIT_FLASH_TIME;
  // 玩家打谁，随从就打谁：记下最近一次打中的敌人
  if (attacker && attacker.isPlayer && damage > 0 && target.kind === 'enemy') {
    attacker.focusTargetId = target.id;
    attacker.focusTargetTime = world.time;
  }
  // 二十九剑：命中留下破绽
  if (attacker && attacker.passive && attacker.passive.vulnerableMark > 0 && damage > 0) {
    target.vulnerableTimer = attacker.passive.vulnerableMark;
  }
  // 神木鼎：攻击附带中毒
  if (attacker && attacker.isPlayer && damage > 0 && hasTreasure(attacker, 'shenmuDing')) {
    target.poisonTimer = 4;
    target.poisonTick = 0.6;
    target.poisonDamage = Math.max(1, Math.round(attacker.attack * 0.18 * 0.6));
  }
  // 天山折梅手：普攻命中减速
  if (options.melee && attacker && attacker.passive && attacker.passive.meleeSlow > 0 && (target.kind === 'enemy' || target.isPlayer)) {
    target.slowTimer = Math.max(target.slowTimer || 0, 1.8);
    target.slowMultiplier = 1 - attacker.passive.meleeSlow;
  }
  // 乾坤大挪移：把一部分伤害弹回去
  if (attacker && attacker.alive && attacker !== target && damage > 0 && target.passive && target.passive.reflect > 0) {
    const reflected = Math.max(1, Math.round(damage * target.passive.reflect));
    attacker.hp -= reflected;
    attacker.hitFlash = Math.max(attacker.hitFlash || 0, 0.12);
    world.effects.addText(attacker.x, attacker.y - attacker.radius - 6, `反弹 ${reflected}`, {
      color: '#8fd0ff',
      size: 12,
    });
    if (attacker.hp <= 0) {
      killEntity(world, attacker, target);
    }
  }
  if (target.isPlayer) {
    // 玩家受击后短暂无敌，避免被一群敌人瞬间秒杀
    target.invulnerableTimer = Math.max(target.invulnerableTimer, BALANCE.PLAYER.hitInvulnerable);
  }
  if (options.stun !== 0) {
    target.stunTimer = Math.max(target.stunTimer, options.stun || BALANCE.HIT_STUN);
  }
  // 趁虚而入的敌人会咬着不放：玩家在破绽里挨的打，醒过来后也会被追几秒
  const targetExposed = target.isPlayer && (world.channel || target.stunTimer > AI_CONFIG.EXPOSE_STUN);
  if (attacker && !attacker.isPlayer && !attacker.isCompanion && targetExposed && damage > 0) {
    attacker.engageUntil = Math.max(attacker.engageUntil || 0, world.time + AI_CONFIG.ENGAGE_MEMORY);
  }

  const knockback = options.knockback === undefined ? 120 : options.knockback;
  if (knockback > 0) {
    const direction = angleOfVector(target.x - sourceX, target.y - sourceY);
    const resist = target.isBoss ? 0.45 : 1;
    target.knockbackX += Math.cos(direction) * knockback * resist;
    target.knockbackY += Math.sin(direction) * knockback * resist;
  }

  if (!options.noText && damage > 0) {
    world.effects.addText(target.x, target.y - target.radius - 6, `${damage}`, {
      color: result.isCrit ? '#ffd166' : options.color || (target.isPlayer ? '#ff8a7a' : '#fff2dd'),
      size: result.isCrit ? 20 : 15,
      isCrit: result.isCrit,
    });
    world.effects.addParticles(target.x, target.y, {
      count: result.isCrit ? 9 : 4,
      color: options.particleColor || '#ff9b7a',
      speed: 170,
      size: 2.6,
      life: 0.34,
    });
  }

  if (attacker && attacker.alive && attacker.passive && attacker.passive.lifesteal > 0 && damage > 0) {
    const healAmount = Math.round(damage * attacker.passive.lifesteal);
    healEntity(attacker, healAmount, world, false);
  }

  if (target.hp <= 0) {
    killEntity(world, target, attacker, { hitDamage: damage });
  }
  return damage;
};

/**
 * 治疗实体（不超出上限）
 * @param {Object} entity 目标
 * @param {Number} amount 治疗量
 * @param {Object} world 世界实例
 * @param {Boolean} showText 是否飘字
 * @returns {Number} 实际治疗量
 */
export const healEntity = (entity, amount, world, showText = true) => {
  if (!entity || !entity.alive) {
    return 0;
  }
  const before = entity.hp;
  entity.hp = Math.min(entity.maxHp, entity.hp + amount);
  const healed = Math.round(entity.hp - before);
  if (healed > 0 && showText && world) {
    world.effects.addText(entity.x, entity.y - entity.radius - 8, `+${healed}`, {
      color: '#7ee0a1',
      size: 14,
    });
  }
  return healed;
};

/**
 * 近战扇形攻击
 * @param {Object} world 世界实例
 * @param {Object} attacker 攻击者
 * @param {Number} angle 攻击朝向
 * @param {Object} options { range, arc, multiplier, knockback, color }
 * @returns {Number} 命中数量
 */
export const meleeSwing = (world, attacker, angle, options = {}) => {
  const range = options.range === undefined ? attacker.attackRange : options.range;
  const arc = options.arc === undefined ? BALANCE.PLAYER.attackArc : options.arc;
  const multiplier = options.multiplier === undefined ? attacker.meleeMultiplier : options.multiplier;
  const color = options.color || (attacker.isPlayer ? PALETTE.playerEdge : attacker.accent || '#ffb199');

  // 起手动作（纯表现字段）：出手时长随攻击间隔缩放，重武器更慢更沉
  const swingDuration = Math.min(0.4, Math.max(0.2, (attacker.attackInterval || attacker.meleeInterval || 0.8) * 0.44));
  attacker.attackAnimDuration = swingDuration;
  attacker.attackAnimTimer = swingDuration;
  attacker.attackAnimAngle = angle;
  attacker.castAnimTimer = 0;
  attacker.castAnimDuration = 0;

  world.effects.addSwing(attacker.x, attacker.y, angle, arc, range + attacker.radius, color);

  const reach = range + attacker.radius;
  const candidates = world.hash.query(attacker.x, attacker.y, reach + 26);
  let hitCount = 0;
  candidates.forEach((target) => {
    if (target.kind === 'item' || !target.alive || target.id === attacker.id) {
      return;
    }
    const distance = distanceBetween(attacker.x, attacker.y, target.x, target.y);
    if (distance > reach + target.radius) {
      return;
    }
    const targetAngle = angleOfVector(target.x - attacker.x, target.y - attacker.y);
    if (distance > 2 && angleDelta(targetAngle, angle) > arc / 2) {
      return;
    }
    applyDamage(world, attacker, target, {
      multiplier,
      sourceX: attacker.x,
      sourceY: attacker.y,
      knockback: options.knockback === undefined ? 130 : options.knockback,
      color: options.textColor,
      melee: true,
    });
    hitCount += 1;
  });
  return hitCount;
};

/**
 * 圆形范围伤害（自身 AOE / 落雷 / 怒吼）
 * @param {Object} world 世界实例
 * @param {Object} attacker 攻击者
 * @param {Number} centerX 中心点
 * @param {Number} centerY 中心点
 * @param {Number} radius 半径
 * @param {Object} options { multiplier, knockback, color, excludeId, side }
 * @returns {Number} 命中数量
 */
export const areaDamage = (world, attacker, centerX, centerY, radius, options = {}) => {
  const candidates = world.hash.query(centerX, centerY, radius + 30);
  let hitCount = 0;
  candidates.forEach((target) => {
    if (target.kind === 'item' || !target.alive || target.id === attacker.id) {
      return;
    }
    if (options.excludeId && target.id === options.excludeId) {
      return;
    }
    const distance = distanceBetween(centerX, centerY, target.x, target.y);
    if (distance > radius + target.radius) {
      return;
    }
    applyDamage(world, attacker, target, {
      multiplier: options.multiplier === undefined ? 1 : options.multiplier,
      sourceX: centerX,
      sourceY: centerY,
      knockback: options.knockback === undefined ? 160 : options.knockback,
      color: options.color,
    });
    hitCount += 1;
  });
  return hitCount;
};

/**
 * 死亡流程：吞噬经验、击杀统计、交给世界处理掉落与移除（README §11.4）
 * @param {Object} world 世界实例
 * @param {Object} victim 死亡实体
 * @param {Object} killer 击杀者
 * @param {Object} info 附加信息 { hitDamage }：致死一击的实际伤害（噩梦模式判定一击秒杀用）
 */
export const killEntity = (world, victim, killer, info = null) => {
  if (!victim.alive) {
    return;
  }
  victim.alive = false;
  victim.hp = 0;
  victim.vx = 0;
  victim.vy = 0;

  world.effects.addRing(victim.x, victim.y, victim.radius * 3.4, victim.isPlayer ? '#ff6b6b' : '#ffd166', {
    life: 0.45,
    lineWidth: 2,
  });
  world.effects.addParticles(victim.x, victim.y, {
    count: victim.isPlayer ? 26 : 14,
    color: victim.isPlayer ? '#ff8a7a' : victim.accent || '#ffd166',
    speed: 220,
    size: 3.2,
    life: 0.7,
  });

  const isValidKiller = killer && killer.alive && killer.id !== victim.id;
  if (isValidKiller) {
    killer.kills += 1;
    const expGain = victim.level * BALANCE.EXP_PER_VICTIM_LEVEL;
    const levelsGained = grantExp(killer, expGain);
    if (killer.isPlayer) {
      world.effects.addText(killer.x, killer.y - killer.radius - 22, `吞噬 +${expGain}`, {
        color: PALETTE.exp,
        size: 13,
      });
      if (killer.passive.killHealRatio > 0) {
        healEntity(killer, killer.maxHp * killer.passive.killHealRatio, world, false);
      }
      world.handlePlayerLevelUp(levelsGained);
    }
  }

  world.handleVictimDeath(victim, isValidKiller ? killer : null, info);
};
