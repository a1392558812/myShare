/**
 * 技能系统：玩家秘籍三选一、主动秘籍释放、敌人技能释放（README §6 / §9）
 */

import { BALANCE, RELIC_CONFIG } from '../constants.js';
import { PLAYER_SKILLS, getSkillById } from '../config/skills.js';
import { ENEMY_SKILLS } from '../config/enemySkills.js';
import { RELICS } from '../config/relics.js';
import { areaDamage, applyDamage, healEntity } from './combat.js';
import { createEnemy } from './entities.js';
import { recalculatePlayerStats } from './stats.js';
import { angleDelta, angleOfVector, clamp, distanceBetween } from './utils.js';

/**
 * 抽取三本秘籍（已满级的过滤，已学的降权，鼓励尝试新流派）
 * @param {Object} player 玩家实体
 * @param {Number} count 抽取数量
 * @returns {Array} 秘籍配置数组
 */
export const rollSkillChoices = (player, count = 3) => {
  const pool = PLAYER_SKILLS.filter((skill) => {
    if (skill.encounterOnly) {
      return false;
    }
    const stack = player.skillStacks[skill.id] || 0;
    return stack < skill.maxStack && (skill.unlockLevel || 1) <= player.level;
  }).map((skill) => {
    const stack = player.skillStacks[skill.id] || 0;
    return {
      skill,
      weight: stack === 0 ? 1 : 0.6 / stack,
    };
  });
  const picked = [];
  while (picked.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;
    let pickedIndex = pool.length - 1;
    for (let index = 0; index < pool.length; index++) {
      roll -= pool[index].weight;
      if (roll <= 0) {
        pickedIndex = index;
        break;
      }
    }
    picked.push(pool[pickedIndex].skill);
    pool.splice(pickedIndex, 1);
  }
  return picked;
};

/**
 * 学习或修炼一本秘籍
 * @param {Object} world 世界实例
 * @param {String} skillId 秘籍 id
 * @returns {Object|null} { skill, stack }
 */
export const acquireSkill = (world, skillId) => {
  const player = world.player;
  const skill = getSkillById(skillId);
  if (!skill) {
    return null;
  }
  const currentStack = player.skillStacks[skillId] || 0;
  if (currentStack >= skill.maxStack) {
    return null;
  }
  const nextStack = currentStack + 1;
  player.skillStacks[skillId] = nextStack;
  if (skill.type === 'active' && !player.activeSkillIds.includes(skillId)) {
    player.activeSkillIds.push(skillId);
    player.skillCooldowns[skillId] = 0;
  }
  recalculatePlayerStats(player);
  world.effects.addRing(player.x, player.y, player.radius * 4, skill.color, { life: 0.55, lineWidth: 3 });
  world.effects.addText(player.x, player.y - player.radius - 26, `${currentStack === 0 ? '习得' : '修炼'} ${skill.name}`, {
    color: skill.color,
    size: 17,
  });
  return { skill, stack: nextStack };
};

/** 递减玩家技能冷却 */
export const updatePlayerSkillCooldowns = (player, deltaTime) => {
  const cooldowns = player.skillCooldowns;
  Object.keys(cooldowns).forEach((skillId) => {
    if (cooldowns[skillId] > 0) {
      cooldowns[skillId] = Math.max(0, cooldowns[skillId] - deltaTime);
    }
  });
};

/** 取主动秘籍当前倍率 */
const multiplierOf = (skill, stack) => {
  return skill.multipliers[clamp(stack - 1, 0, skill.multipliers.length - 1)];
};

/** 剑气斩：直线穿透剑气 */
const castSwordWave = (world, player, skill, stack) => {
  const angle = player.aimAngle;
  const offset = player.radius + 10;
  world.spawnProjectile({
    owner: player,
    x: player.x + Math.cos(angle) * offset,
    y: player.y + Math.sin(angle) * offset,
    angle,
    speed: 660,
    radius: 14,
    life: 0.52,
    pierce: 3,
    multiplier: multiplierOf(skill, stack),
    style: 'wave',
    color: skill.color,
  });
  world.effects.addSwing(player.x, player.y, angle, Math.PI * 0.4, player.radius + 42, skill.color);
  return true;
};

/** 旋风腿：自身 360 度 AOE */
const castWhirlwindKick = (world, player, skill, stack) => {
  const radius = 108 + 8 * stack;
  areaDamage(world, player, player.x, player.y, radius, {
    multiplier: multiplierOf(skill, stack),
    knockback: 260,
    color: skill.color,
    particleColor: '#ffd8a8',
  });
  world.effects.addRing(player.x, player.y, radius, skill.color, { life: 0.36, lineWidth: 5 });
  world.effects.addSwing(player.x, player.y, player.aimAngle, Math.PI * 2, radius, skill.color);
  return true;
};

/** 降龙掌：前方扇形重击退 */
const castDragonPalm = (world, player, skill, stack) => {
  const range = 205;
  const arc = Math.PI * 0.55;
  const multiplier = multiplierOf(skill, stack);
  const reach = range + player.radius;
  const candidates = world.hash.query(player.x, player.y, reach + 30);
  candidates.forEach((target) => {
    if (target.kind === 'item' || !target.alive || target.id === player.id) {
      return;
    }
    const distance = distanceBetween(player.x, player.y, target.x, target.y);
    if (distance > reach + target.radius) {
      return;
    }
    const targetAngle = angleOfVector(target.x - player.x, target.y - player.y);
    if (distance > 2 && angleDelta(targetAngle, player.aimAngle) > arc / 2) {
      return;
    }
    applyDamage(world, player, target, {
      multiplier,
      sourceX: player.x,
      sourceY: player.y,
      knockback: 430,
      color: skill.color,
    });
  });
  world.effects.addSwing(player.x, player.y, player.aimAngle, arc, reach, skill.color);
  world.effects.addRing(player.x + Math.cos(player.aimAngle) * range * 0.6, player.y + Math.sin(player.aimAngle) * range * 0.6, 46, skill.color, { life: 0.3, lineWidth: 3 });
  return true;
};

/** 暴雨梨花针：扇射飞针 */
const castNeedleRain = (world, player, skill, stack) => {
  const count = 7;
  const spread = Math.PI * 0.52;
  const multiplier = multiplierOf(skill, stack);
  for (let index = 0; index < count; index++) {
    const ratio = count === 1 ? 0.5 : index / (count - 1);
    const angle = player.aimAngle - spread / 2 + spread * ratio;
    world.spawnProjectile({
      owner: player,
      x: player.x + Math.cos(angle) * (player.radius + 8),
      y: player.y + Math.sin(angle) * (player.radius + 8),
      angle,
      speed: 520,
      radius: 7,
      life: 0.6,
      pierce: 1,
      multiplier,
      style: 'needle',
      color: skill.color,
    });
  }
  world.effects.addSwing(player.x, player.y, player.aimAngle, spread, player.radius + 30, skill.color);
  return true;
};

/** 掌心雷：准星落雷 */
const castThunderClap = (world, player, skill, stack) => {
  const maxRange = 420;
  const distance = distanceBetween(player.x, player.y, player.aimX, player.aimY);
  const ratio = distance > maxRange ? maxRange / distance : 1;
  const centerX = player.x + (player.aimX - player.x) * ratio;
  const centerY = player.y + (player.aimY - player.y) * ratio;
  const radius = 92 + 8 * stack;
  world.effects.addBolt(centerX, centerY, radius, skill.color);
  areaDamage(world, player, centerX, centerY, radius, {
    multiplier: multiplierOf(skill, stack),
    knockback: 200,
    color: skill.color,
    particleColor: skill.color,
  });
  world.effects.addRing(centerX, centerY, radius, skill.color, { life: 0.42, lineWidth: 4 });
  return true;
};

/** 找最近的敌人（origin 需带 x / y / id；excludeIds 用于连锁弹射防重复） */
const findNearestEnemy = (world, origin, maxRange, excludeIds) => {
  const candidates = world.hash.query(origin.x, origin.y, maxRange + 40);
  let best = null;
  let bestDistance = maxRange;
  for (let index = 0; index < candidates.length; index++) {
    const target = candidates[index];
    if (target.kind === 'item' || !target.alive || target.id === origin.id) {
      continue;
    }
    if (excludeIds && excludeIds.has(target.id)) {
      continue;
    }
    const distance = distanceBetween(origin.x, origin.y, target.x, target.y);
    if (distance <= bestDistance) {
      bestDistance = distance;
      best = target;
    }
  }
  return best;
};

/** 统计范围内敌人数量（自动释放判断值不值得放） */
const countEnemiesNear = (world, origin, range) => {
  const candidates = world.hash.query(origin.x, origin.y, range + 30);
  let count = 0;
  for (let index = 0; index < candidates.length; index++) {
    const target = candidates[index];
    if (target.kind === 'item' || !target.alive || target.id === origin.id) {
      continue;
    }
    if (distanceBetween(origin.x, origin.y, target.x, target.y) <= range) {
      count += 1;
    }
  }
  return count;
};

/** 大力金刚指：点穴定身 */
const castIronFinger = (world, player, skill, stack) => {
  const target = findNearestEnemy(world, player, 190);
  const angle = target ? angleOfVector(target.x - player.x, target.y - player.y) : player.aimAngle;
  const reach = 190;
  world.effects.addSwing(player.x, player.y, angle, Math.PI * 0.14, reach + player.radius, skill.color);
  world.effects.addParticles(
    player.x + Math.cos(angle) * reach * 0.72,
    player.y + Math.sin(angle) * reach * 0.72,
    { count: 9, color: skill.color, speed: 210, size: 2.6, life: 0.3 },
  );
  if (target) {
    applyDamage(world, player, target, {
      multiplier: multiplierOf(skill, stack),
      sourceX: player.x,
      sourceY: player.y,
      knockback: 140,
      stun: 1,
      color: skill.color,
    });
    world.effects.addRing(target.x, target.y, 26, skill.color, { life: 0.3, lineWidth: 3 });
  }
  return true;
};

/** 火莲业火：准星处持续燃烧区 */
const castFlameLotus = (world, player, skill, stack) => {
  const maxRange = 380;
  const distance = distanceBetween(player.x, player.y, player.aimX, player.aimY);
  const ratio = distance > maxRange ? maxRange / distance : 1;
  const centerX = player.x + (player.aimX - player.x) * ratio;
  const centerY = player.y + (player.aimY - player.y) * ratio;
  const radius = 96 + 6 * stack;
  world.zones.add({
    x: centerX,
    y: centerY,
    radius,
    life: 2.8,
    tickInterval: 0.5,
    multiplier: multiplierOf(skill, stack),
    color: skill.color,
    style: 'flame',
    owner: player,
  });
  world.effects.addRing(centerX, centerY, radius, skill.color, { life: 0.5, lineWidth: 4 });
  world.effects.addParticles(centerX, centerY, { count: 14, color: '#ffb066', speed: 170, size: 3.2, life: 0.5 });
  return true;
};

/** 冰魄银针：扇射减速针 */
const castFrostNeedles = (world, player, skill, stack) => {
  const count = 5;
  const spread = Math.PI * 0.42;
  const multiplier = multiplierOf(skill, stack);
  for (let index = 0; index < count; index++) {
    const ratio = count === 1 ? 0.5 : index / (count - 1);
    const angle = player.aimAngle - spread / 2 + spread * ratio;
    world.spawnProjectile({
      owner: player,
      x: player.x + Math.cos(angle) * (player.radius + 8),
      y: player.y + Math.sin(angle) * (player.radius + 8),
      angle,
      speed: 570,
      radius: 8,
      life: 0.64,
      pierce: 1,
      multiplier,
      style: 'ice',
      color: skill.color,
      slowAmount: 0.45,
      slowDuration: 2.6,
    });
  }
  world.effects.addSwing(player.x, player.y, player.aimAngle, spread, player.radius + 26, skill.color);
  return true;
};

/** 葵花宝典·绣针千幻：内外双修的主动针法（被动增益在 stats.js 保留） */
const castSunflowerNeedles = (world, player, skill, stack) => {
  const count = 5 + 2 * stack;
  const spread = Math.PI * 0.36;
  const multiplier = multiplierOf(skill, stack);
  for (let index = 0; index < count; index++) {
    const ratio = count === 1 ? 0.5 : index / (count - 1);
    const angle = player.aimAngle - spread / 2 + spread * ratio;
    world.spawnProjectile({
      owner: player,
      x: player.x + Math.cos(angle) * (player.radius + 8),
      y: player.y + Math.sin(angle) * (player.radius + 8),
      angle,
      speed: 720,
      radius: 7,
      life: 0.6,
      pierce: 1,
      multiplier,
      style: 'needle',
      color: skill.color,
      slowAmount: 0.3,
      slowDuration: 1.2,
    });
  }
  world.effects.addSwing(player.x, player.y, player.aimAngle, spread, player.radius + 24, skill.color);
  return true;
};

/** 天女散花：环身一圈飞镖 */
const castBladeStorm = (world, player, skill, stack) => {
  const count = 12;
  const multiplier = multiplierOf(skill, stack);
  for (let index = 0; index < count; index++) {
    const angle = (Math.PI * 2 * index) / count;
    world.spawnProjectile({
      owner: player,
      x: player.x + Math.cos(angle) * (player.radius + 6),
      y: player.y + Math.sin(angle) * (player.radius + 6),
      angle,
      speed: 440,
      radius: 8,
      life: 0.55,
      pierce: 0,
      multiplier,
      style: 'blade',
      color: skill.color,
    });
  }
  world.effects.addRing(player.x, player.y, player.radius + 48, skill.color, { life: 0.32, lineWidth: 3 });
  return true;
};

/** 雷霆万钧：连锁闪电 */
const castChainLightning = (world, player, skill, stack) => {
  let target = findNearestEnemy(world, player, 340);
  if (!target) {
    return false;
  }
  const hitIds = new Set();
  let multiplier = multiplierOf(skill, stack);
  let from = { x: player.x, y: player.y, id: 0 };
  for (let jump = 0; jump < 5 && target; jump++) {
    world.effects.addArc(from.x, from.y, target.x, target.y, skill.color, {
      life: 0.24,
      lineWidth: jump === 0 ? 4.5 : 3,
    });
    applyDamage(world, player, target, {
      multiplier,
      sourceX: from.x,
      sourceY: from.y,
      knockback: 70,
      color: skill.color,
    });
    hitIds.add(target.id);
    from = { x: target.x, y: target.y, id: 0 };
    multiplier *= 0.8;
    target = findNearestEnemy(world, from, 230, hitIds);
  }
  return true;
};

/** 万剑归宗：追踪飞剑 */
const castFlyingSwords = (world, player, skill, stack) => {
  const count = 6;
  const spread = Math.PI * 0.7;
  const multiplier = multiplierOf(skill, stack);
  for (let index = 0; index < count; index++) {
    const ratio = count === 1 ? 0.5 : index / (count - 1);
    const angle = player.aimAngle - spread / 2 + spread * ratio;
    world.spawnProjectile({
      owner: player,
      x: player.x + Math.cos(angle) * (player.radius + 10),
      y: player.y + Math.sin(angle) * (player.radius + 10),
      angle,
      speed: 470,
      radius: 9,
      life: 1.15,
      pierce: 1,
      multiplier,
      style: 'sword',
      color: skill.color,
      homing: 5.6,
    });
  }
  world.effects.addSwing(player.x, player.y, player.aimAngle, spread, player.radius + 34, skill.color);
  return true;
};

/** 万毒瘴：跟随自身的毒雾 */
const castPoisonMist = (world, player, skill, stack) => {
  world.zones.add({
    x: player.x,
    y: player.y,
    radius: 128 + 6 * stack,
    life: 3,
    tickInterval: 0.5,
    multiplier: multiplierOf(skill, stack),
    color: skill.color,
    style: 'poison',
    owner: player,
    follow: player,
  });
  world.effects.addRing(player.x, player.y, 128 + 6 * stack, skill.color, { life: 0.4, lineWidth: 3 });
  return true;
};

/** 血影刀：前方重击 + 吸血 */
const castBloodBlade = (world, player, skill, stack) => {
  const range = 240;
  const arc = Math.PI * 0.5;
  const reach = range + player.radius;
  const multiplier = multiplierOf(skill, stack);
  const candidates = world.hash.query(player.x, player.y, reach + 30);
  let totalDamage = 0;
  candidates.forEach((target) => {
    if (target.kind === 'item' || !target.alive || target.id === player.id) {
      return;
    }
    const distance = distanceBetween(player.x, player.y, target.x, target.y);
    if (distance > reach + target.radius) {
      return;
    }
    const targetAngle = angleOfVector(target.x - player.x, target.y - player.y);
    if (distance > 2 && angleDelta(targetAngle, player.aimAngle) > arc / 2) {
      return;
    }
    totalDamage += applyDamage(world, player, target, {
      multiplier,
      sourceX: player.x,
      sourceY: player.y,
      knockback: 260,
      color: skill.color,
    });
  });
  if (totalDamage > 0) {
    healEntity(player, Math.round(totalDamage * 0.35), world, true);
  }
  world.effects.addSwing(player.x, player.y, player.aimAngle, arc, reach, skill.color);
  world.effects.addParticles(player.x + Math.cos(player.aimAngle) * 90, player.y + Math.sin(player.aimAngle) * 90, {
    count: 12,
    color: '#ff5c7a',
    speed: 240,
    size: 3,
    life: 0.4,
    angle: player.aimAngle,
    spread: Math.PI * 0.5,
  });
  return true;
};

/* ------------------------------------------------------------------ */
/* 奇遇专属武功                                                         */
/* ------------------------------------------------------------------ */

/** 独孤九剑：一道穿透五人的斜劈剑气 */
const castDuguNineSwords = (world, player, skill, stack) => {
  const angle = player.aimAngle;
  world.spawnProjectile({
    owner: player,
    x: player.x + Math.cos(angle) * (player.radius + 10),
    y: player.y + Math.sin(angle) * (player.radius + 10),
    angle,
    speed: 720,
    radius: 18,
    life: 0.62,
    pierce: 5,
    multiplier: multiplierOf(skill, stack),
    style: 'wave',
    color: skill.color,
  });
  world.effects.addSwing(player.x, player.y, angle, Math.PI * 0.34, player.radius + 58, skill.color);
  world.effects.addParticles(player.x + Math.cos(angle) * 40, player.y + Math.sin(angle) * 40, {
    count: 10,
    color: skill.color,
    speed: 260,
    size: 2.6,
    life: 0.36,
    angle,
    spread: Math.PI * 0.4,
  });
  return true;
};

/** 蛤蟆功：鼓腹一喝，周身震开 */
const castToadSkill = (world, player, skill, stack) => {
  const radius = 210;
  areaDamage(world, player, player.x, player.y, radius, {
    multiplier: multiplierOf(skill, stack),
    knockback: 420,
    color: skill.color,
    particleColor: '#9fe07a',
  });
  world.effects.addRing(player.x, player.y, radius, skill.color, { life: 0.45, lineWidth: 5 });
  world.effects.addText(player.x, player.y - player.radius - 34, '咕呱！', { color: skill.color, size: 18 });
  return true;
};

/** 降龙十八掌：至刚掌力，扇形重击退 */
const castDragonSubdue = (world, player, skill, stack) => {
  const range = 280;
  const arc = Math.PI * 0.6;
  const reach = range + player.radius;
  const multiplier = multiplierOf(skill, stack);
  const candidates = world.hash.query(player.x, player.y, reach + 34);
  candidates.forEach((target) => {
    if (target.kind === 'item' || !target.alive || target.id === player.id) {
      return;
    }
    const distance = distanceBetween(player.x, player.y, target.x, target.y);
    if (distance > reach + target.radius) {
      return;
    }
    const targetAngle = angleOfVector(target.x - player.x, target.y - player.y);
    if (distance > 2 && angleDelta(targetAngle, player.aimAngle) > arc / 2) {
      return;
    }
    applyDamage(world, player, target, {
      multiplier,
      sourceX: player.x,
      sourceY: player.y,
      knockback: 520,
      color: skill.color,
    });
  });
  world.effects.addSwing(player.x, player.y, player.aimAngle, arc, reach, skill.color);
  world.effects.addRing(player.x + Math.cos(player.aimAngle) * range * 0.55, player.y + Math.sin(player.aimAngle) * range * 0.55, 76, skill.color, {
    life: 0.4,
    lineWidth: 4,
  });
  return true;
};

/** 打狗棒法：棒影三连 */
const castDogBeating = (world, player, skill, stack) => {
  const radius = 156;
  const multiplier = multiplierOf(skill, stack);
  for (let round = 0; round < 3; round++) {
    areaDamage(world, player, player.x, player.y, radius + round * 12, {
      multiplier: multiplier * 0.62,
      knockback: 140 + round * 60,
      color: skill.color,
      particleColor: '#e0d8a8',
    });
    world.effects.addSwing(player.x, player.y, player.aimAngle + (round * Math.PI * 2) / 3, Math.PI * 1.1, radius + round * 12, skill.color);
  }
  world.effects.addRing(player.x, player.y, radius + 24, skill.color, { life: 0.4, lineWidth: 4 });
  return true;
};

/** 太玄真气：周身真气狂潮 */
const castTaixuanWave = (world, player, skill, stack) => {
  const radius = 320;
  areaDamage(world, player, player.x, player.y, radius, {
    multiplier: multiplierOf(skill, stack),
    knockback: 480,
    color: skill.color,
    particleColor: '#7be3ff',
  });
  world.effects.addRing(player.x, player.y, radius, skill.color, { life: 0.6, lineWidth: 6 });
  world.effects.addRing(player.x, player.y, radius * 0.62, '#c8f4ff', { life: 0.45, lineWidth: 3 });
  world.effects.addParticles(player.x, player.y, { count: 26, color: skill.color, speed: 320, size: 3.2, life: 0.6 });
  return true;
};

/** 笑傲江湖曲：琴音减速 + 自愈 */
const castXiaoaoSong = (world, player, skill, stack) => {
  const radius = 360;
  const multiplier = multiplierOf(skill, stack);
  const candidates = world.hash.query(player.x, player.y, radius + 30);
  candidates.forEach((target) => {
    if (target.kind === 'item' || !target.alive || target.id === player.id || target.isCompanion) {
      return;
    }
    if (distanceBetween(player.x, player.y, target.x, target.y) > radius + target.radius) {
      return;
    }
    applyDamage(world, player, target, {
      multiplier,
      sourceX: player.x,
      sourceY: player.y,
      knockback: 60,
      color: skill.color,
    });
    if (target.kind === 'enemy' || target.isPlayer) {
      target.slowTimer = Math.max(target.slowTimer || 0, 3);
      target.slowMultiplier = 0.45;
    }
  });
  healEntity(player, player.maxHp * 0.12, world, true);
  player.speedBoostTimer = Math.max(player.speedBoostTimer, 4);
  player.speedBoostMultiplier = Math.max(player.speedBoostMultiplier, 1.2);
  world.effects.addRing(player.x, player.y, radius, skill.color, { life: 0.6, lineWidth: 3 });
  world.effects.addParticles(player.x, player.y, { count: 18, color: skill.color, speed: 200, size: 2.6, life: 0.6 });
  return true;
};

/** 假·降龙十八掌：30% 概率把自己转晕，然后撕书（玩家与随从通用） */
const castFakeDragon = (world, player, skill, stack, stackMap) => {
  const range = 250;
  const arc = Math.PI * 0.6;
  const reach = range + player.radius;
  const multiplier = multiplierOf(skill, stack);
  const candidates = world.hash.query(player.x, player.y, reach + 30);
  candidates.forEach((target) => {
    if (target.kind === 'item' || !target.alive || target.id === player.id) {
      return;
    }
    if (distanceBetween(player.x, player.y, target.x, target.y) > reach + target.radius) {
      return;
    }
    const targetAngle = angleOfVector(target.x - player.x, target.y - player.y);
    if (distanceBetween(player.x, player.y, target.x, target.y) > 2 && angleDelta(targetAngle, player.aimAngle) > arc / 2) {
      return;
    }
    applyDamage(world, player, target, {
      multiplier,
      sourceX: player.x,
      sourceY: player.y,
      knockback: 260,
      color: skill.color,
    });
  });
  world.effects.addSwing(player.x, player.y, player.aimAngle, arc, reach, skill.color);
  if (Math.random() < 0.3) {
    player.stunTimer = 2;
    world.effects.addText(player.x, player.y - player.radius - 30, '转晕了', { color: '#ffb347', size: 16 });
    if (stackMap) {
      delete stackMap[skill.id];
    }
    if (player.activeSkillIds) {
      player.activeSkillIds = player.activeSkillIds.filter((id) => id !== skill.id);
    }
    if (player.isPlayer) {
      delete player.skillCooldowns[skill.id];
      recalculatePlayerStats(player);
      world.stats.learnedSkills = Object.keys(player.skillStacks).map((key) => {
        const entry = getSkillById(key);
        return { name: entry ? entry.name : key, stack: player.skillStacks[key] };
      });
      world.notify('这书是假的！你气得把它撕了', '#ffb347');
    } else {
      // 随从：属性交给 companions.js 在下一帧重算，避免模块循环依赖
      player.statsDirty = true;
      world.notify(`${player.typeName} 发现这本是假书，气得撕了`, '#ffb347');
    }
    world.pushHud(true);
  }
  return true;
};

const PLAYER_CAST_HANDLERS = {
  'sword-wave': castSwordWave,
  'whirlwind-kick': castWhirlwindKick,
  'dragon-palm': castDragonPalm,
  'needle-rain': castNeedleRain,
  'thunder-clap': castThunderClap,
  'iron-finger': castIronFinger,
  'flame-lotus': castFlameLotus,
  'frost-needles': castFrostNeedles,
  'blade-storm': castBladeStorm,
  'chain-lightning': castChainLightning,
  'flying-swords': castFlyingSwords,
  'poison-mist': castPoisonMist,
  'blood-blade': castBloodBlade,
  'dugu-nine-swords': castDuguNineSwords,
  'toad-skill': castToadSkill,
  'sunflower-manual': castSunflowerNeedles,
  'dragon-subdue': castDragonSubdue,
  'dog-beating': castDogBeating,
  'taixuan-wave': castTaixuanWave,
  'xiaoao-song': castXiaoaoSong,
  'fake-dragon': castFakeDragon,
};

/**
 * 奇遇直接传授秘籍（不进三选一池）
 * @param {Object} world 世界实例
 * @param {String} skillId 秘籍 id
 * @param {Number} stacks 提升层数
 * @returns {Object|null} 秘籍配置
 */
export const grantSkillDirect = (world, skillId, stacks = 1) => {
  const player = world.player;
  const skill = getSkillById(skillId);
  if (!skill) {
    return null;
  }
  const current = player.skillStacks[skillId] || 0;
  if (current >= skill.maxStack) {
    return skill;
  }
  const next = Math.min(skill.maxStack, current + stacks);
  player.skillStacks[skillId] = next;
  if (skill.type === 'active' && !player.activeSkillIds.includes(skillId)) {
    player.activeSkillIds.push(skillId);
    player.skillCooldowns[skillId] = 0;
  }
  recalculatePlayerStats(player);
  world.stats.learnedSkills = Object.keys(player.skillStacks).map((key) => {
    const entry = getSkillById(key);
    return { name: entry ? entry.name : key, stack: player.skillStacks[key] };
  });
  world.effects.addRing(player.x, player.y, player.radius * 4.4, skill.color, { life: 0.6, lineWidth: 3 });
  world.effects.addText(player.x, player.y - player.radius - 30, `${current === 0 ? '习得' : '精进'} ${skill.name}`, {
    color: skill.color,
    size: 17,
  });
  world.pushHud(true);
  return skill;
};

/**
 * 释放主动秘籍
 * @param {Object} world 世界实例
 * @param {String} skillId 秘籍 id
 * @returns {Boolean} 是否成功释放
 */
/** 通用施法：玩家与随从共用同一套 handler（随从传自己的层数表与冷却表） */
const castEntitySkill = (world, entity, stackMap, cooldownMap, skillId) => {
  const skill = getSkillById(skillId);
  if (!skill || skill.type !== 'active') {
    return false;
  }
  const stack = stackMap[skillId] || 0;
  if (stack <= 0) {
    return false;
  }
  if ((cooldownMap[skillId] || 0) > 0) {
    return false;
  }
  if (entity.stunTimer > 0 || !entity.alive) {
    return false;
  }
  const handler = PLAYER_CAST_HANDLERS[skillId];
  if (!handler) {
    return false;
  }
  const casted = handler(world, entity, skill, stack, stackMap);
  if (!casted) {
    return false;
  }
  entity.castAnimDuration = 0.36;
  entity.castAnimTimer = 0.36;
  const cooldownScale = entity.passive && entity.passive.cooldownMultiplier ? entity.passive.cooldownMultiplier : 1;
  // 假秘籍可能在这一招里被撕掉，撕掉后不再留冷却记录
  if ((stackMap[skillId] || 0) > 0) {
    cooldownMap[skillId] = skill.cooldown * cooldownScale;
  }
  return true;
};

export const castPlayerSkill = (world, skillId) => {
  return castEntitySkill(world, world.player, world.player.skillStacks, world.player.skillCooldowns, skillId);
};

/** 随从释放自修的主动武功 */
export const castCompanionManual = (world, companion, skillId) => {
  return castEntitySkill(world, companion, companion.manuals, companion.manualCooldowns, skillId);
};

/** 敌人技能冷却递减 */
export const updateEnemySkillCooldowns = (enemy, deltaTime) => {
  enemy.skills.forEach((slot) => {
    if (slot.cooldownLeft > 0) {
      slot.cooldownLeft = Math.max(0, slot.cooldownLeft - deltaTime);
    }
  });
};

/** 该召唤者的随从数量 */
const countMinions = (world, ownerId) => {
  let total = 0;
  world.enemies.forEach((enemy) => {
    if (enemy.alive && enemy.ownerId === ownerId) {
      total += 1;
    }
  });
  return total;
};

/** 判断敌人当前能否放这个技能 */
const canCastEnemySkill = (world, enemy, target, config) => {
  const distance = distanceBetween(enemy.x, enemy.y, target.x, target.y);
  const hpRatio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 0;
  switch (config.type) {
    case 'buff':
      return hpRatio <= config.hpBelow && enemy.enragedTimer <= 0;
    case 'dash':
      return distance <= config.range && distance >= config.minRange;
    case 'projectile':
      return distance <= config.range && distance >= config.minRange;
    case 'area':
      return distance <= config.radius;
    case 'targetArea':
      return distance <= config.range;
    case 'heal':
      return hpRatio <= config.hpBelow && hpRatio < 1;
    case 'summon':
      return countMinions(world, enemy.id) < BALANCE.MINION_CAP;
    default:
      return false;
  }
};

/** 真正释放敌人技能 */
const castEnemySkill = (world, enemy, target, config) => {
  const angle = angleOfVector(target.x - enemy.x, target.y - enemy.y);
  enemy.facing = angle;
  if (config.type !== 'dash') {
    enemy.castAnimDuration = 0.44;
    enemy.castAnimTimer = 0.44;
  }
  switch (config.type) {
    case 'dash':
      enemy.dashTimer = config.dashDuration;
      enemy.dashVelocityX = Math.cos(angle) * config.dashSpeed;
      enemy.dashVelocityY = Math.sin(angle) * config.dashSpeed;
      enemy.dashMultiplier = config.damageMultiplier;
      enemy.dashHitIds.clear();
      enemy.aiState = 'attack';
      world.effects.addParticles(enemy.x, enemy.y, {
        count: 10,
        color: config.color || enemy.accent,
        speed: 180,
        size: 3,
        life: 0.4,
      });
      break;
    case 'projectile':
      world.spawnProjectile({
        owner: enemy,
        x: enemy.x + Math.cos(angle) * (enemy.radius + 8),
        y: enemy.y + Math.sin(angle) * (enemy.radius + 8),
        angle,
        speed: config.projectileSpeed,
        radius: config.projectileRadius,
        life: 1.6,
        pierce: 0,
        multiplier: config.damageMultiplier,
        style: config.projectileStyle || 'orb',
        color: config.color,
        slowAmount: config.slowAmount || 0,
        slowDuration: config.slowDuration || 0,
      });
      break;
    case 'targetArea': {
      const centerX = target.x;
      const centerY = target.y;
      world.effects.addBolt(centerX, centerY, config.radius, config.color);
      areaDamage(world, enemy, centerX, centerY, config.radius, {
        multiplier: config.damageMultiplier,
        knockback: config.knockback,
        color: config.color,
      });
      world.effects.addRing(centerX, centerY, config.radius, config.color, { life: 0.42, lineWidth: 4 });
      break;
    }
    case 'heal': {
      healEntity(enemy, Math.round(enemy.maxHp * config.healRatio), world, true);
      world.effects.addRing(enemy.x, enemy.y, enemy.radius * 3, config.color, { life: 0.5, lineWidth: 3 });
      break;
    }
    case 'area':
      areaDamage(world, enemy, enemy.x, enemy.y, config.radius, {
        multiplier: config.damageMultiplier,
        knockback: config.knockback,
        color: config.color,
      });
      world.effects.addRing(enemy.x, enemy.y, config.radius, config.color, { life: 0.4, lineWidth: 4 });
      break;
    case 'buff':
      enemy.enragedTimer = config.duration;
      enemy.buffAttackMultiplier = config.attackMultiplier;
      enemy.buffSpeedMultiplier = config.speedMultiplier;
      enemy.buffDamageReduction = config.damageReduction || 0;
      world.effects.addRing(enemy.x, enemy.y, enemy.radius * 3.4, config.color, { life: 0.5, lineWidth: 3 });
      world.effects.addText(enemy.x, enemy.y - enemy.radius - 18, config.name, { color: config.color, size: 13 });
      break;
    case 'summon': {
      const typeId = config.minionType;
      for (let index = 0; index < config.count; index++) {
        const spawnAngle = angle + Math.PI * (0.5 + index * 0.6);
        const spawnX = enemy.x + Math.cos(spawnAngle) * config.minionRadius;
        const spawnY = enemy.y + Math.sin(spawnAngle) * config.minionRadius;
        const minionLevel = Math.max(1, enemy.level + config.minionLevelOffset);
        const minion = createEnemy(typeId, minionLevel, spawnX, spawnY, { isMinion: true, ownerId: enemy.id });
        world.addEnemy(minion);
        world.effects.addRing(spawnX, spawnY, 34, '#c9a6ff', { life: 0.35, lineWidth: 2 });
      }
      break;
    }
    default:
      break;
  }
};

/** 偷袭：远程手段额外加成，并显示「偷袭」字样 */
const castRangedSkill = (world, enemy, target, config) => {
  const boosted = {
    ...config,
    damageMultiplier: config.damageMultiplier * RELIC_CONFIG.SNIPE_DAMAGE_MULTIPLIER,
  };
  castEnemySkill(world, enemy, target, boosted);
  world.effects.addText(enemy.x, enemy.y - enemy.radius - 24, '偷袭', {
    color: config.color || '#ffd166',
    size: 12,
  });
};

/**
 * 敌人尝试释放技能（冷却就绪 + 条件满足）
 * 偷袭状态下优先远程手段：先扫一遍 projectile / targetArea，再走常规顺序
 * @param {Object} world 世界实例
 * @param {Object} enemy 敌人
 * @param {Object} target 当前目标
 * @returns {Boolean} 是否释放
 */
export const tryUseEnemySkill = (world, enemy, target) => {
  if (!target || !target.alive) {
    return false;
  }
  if (enemy.snipe) {
    for (let index = 0; index < enemy.skills.length; index++) {
      const slot = enemy.skills[index];
      const config = ENEMY_SKILLS[slot.id];
      if (!config || slot.cooldownLeft > 0) {
        continue;
      }
      if (config.type !== 'projectile' && config.type !== 'targetArea') {
        continue;
      }
      if (!canCastEnemySkill(world, enemy, target, config)) {
        continue;
      }
      castRangedSkill(world, enemy, target, config);
      slot.cooldownLeft = slot.cooldown || config.cooldown;
      return true;
    }
  }
  for (let index = 0; index < enemy.skills.length; index++) {
    const slot = enemy.skills[index];
    const config = ENEMY_SKILLS[slot.id];
    if (!config || slot.cooldownLeft > 0) {
      continue;
    }
    if (!canCastEnemySkill(world, enemy, target, config)) {
      continue;
    }
    castEnemySkill(world, enemy, target, config);
    slot.cooldownLeft = slot.cooldown || config.cooldown;
    return true;
  }
  return false;
};

/* ------------------------------------------------------------------ */
/* 神兵绝学                                                             */
/* ------------------------------------------------------------------ */

/** 屠龙一斩：前方扇形重斩 + 一道穿透刀罡 */
const castDragonCleave = (world, player, relic) => {
  const skill = relic.skill;
  const reach = skill.range + player.radius;
  const candidates = world.hash.query(player.x, player.y, reach + 40);
  candidates.forEach((target) => {
    if (target.kind === 'item' || !target.alive || target.id === player.id) {
      return;
    }
    const distance = distanceBetween(player.x, player.y, target.x, target.y);
    if (distance > reach + target.radius) {
      return;
    }
    const targetAngle = angleOfVector(target.x - player.x, target.y - player.y);
    if (distance > 2 && angleDelta(targetAngle, player.aimAngle) > skill.arc / 2) {
      return;
    }
    applyDamage(world, player, target, {
      multiplier: skill.multiplier,
      sourceX: player.x,
      sourceY: player.y,
      knockback: skill.knockback,
      color: skill.color,
    });
  });
  world.spawnProjectile({
    owner: player,
    x: player.x + Math.cos(player.aimAngle) * (player.radius + 12),
    y: player.y + Math.sin(player.aimAngle) * (player.radius + 12),
    angle: player.aimAngle,
    speed: 620,
    radius: 18,
    life: 0.6,
    pierce: 4,
    multiplier: skill.multiplier * 0.7,
    style: 'wave',
    color: skill.color,
  });
  world.effects.addSwing(player.x, player.y, player.aimAngle, skill.arc, reach, skill.color);
  world.effects.addParticles(
    player.x + Math.cos(player.aimAngle) * skill.range * 0.6,
    player.y + Math.sin(player.aimAngle) * skill.range * 0.6,
    { count: 16, color: skill.color, speed: 300, size: 3.4, life: 0.45, angle: player.aimAngle, spread: skill.arc },
  );
  return true;
};

/** 倚天寒光：环形剑气 + 冻结脚步 */
const castHeavenFlash = (world, player, relic) => {
  const skill = relic.skill;
  const center = { x: player.x, y: player.y };
  const candidates = world.hash.query(center.x, center.y, skill.radius + 40);
  candidates.forEach((target) => {
    if (target.kind === 'item' || !target.alive || target.id === player.id) {
      return;
    }
    if (distanceBetween(center.x, center.y, target.x, target.y) > skill.radius + target.radius) {
      return;
    }
    applyDamage(world, player, target, {
      multiplier: skill.multiplier,
      sourceX: center.x,
      sourceY: center.y,
      knockback: 220,
      color: skill.color,
    });
    if (target.kind === 'enemy' || target.isPlayer) {
      target.slowTimer = Math.max(target.slowTimer || 0, skill.slowDuration);
      target.slowMultiplier = 1 - skill.slowAmount;
    }
  });
  world.effects.addRing(center.x, center.y, skill.radius, skill.color, { life: 0.42, lineWidth: 5 });
  world.effects.addParticles(center.x, center.y, { count: 20, color: skill.color, speed: 260, size: 3, life: 0.5 });
  return true;
};

const RELIC_CAST_HANDLERS = {
  dragonSaber: castDragonCleave,
  heavenSword: castHeavenFlash,
};

/**
 * 释放神兵绝学
 * @param {Object} world 世界实例
 * @param {String} relicId 神兵 id
 * @returns {Boolean} 是否释放成功
 */
export const castRelicSkill = (world, relicId) => {
  const player = world.player;
  const relic = RELICS[relicId];
  if (!relic || !player.alive || !player.relics.includes(relicId)) {
    return false;
  }
  if ((player.relicCooldowns[relicId] || 0) > 0 || player.stunTimer > 0) {
    return false;
  }
  const handler = RELIC_CAST_HANDLERS[relicId];
  if (!handler) {
    return false;
  }
  const casted = handler(world, player, relic);
  if (!casted) {
    return false;
  }
  player.castAnimDuration = 0.36;
  player.castAnimTimer = 0.36;
  const scale = player.passive && player.passive.cooldownMultiplier ? player.passive.cooldownMultiplier : 1;
  player.relicCooldowns[relicId] = relic.skill.cooldown * scale;
  world.effects.addText(player.x, player.y - player.radius - 30, relic.skill.name, { color: relic.color, size: 15 });
  return true;
};

/** 主动秘籍是否就绪（给 UI 用） */
export const isSkillReady = (player, skillId) => {
  const stack = player.skillStacks[skillId] || 0;
  return stack > 0 && (player.skillCooldowns[skillId] || 0) <= 0;
};

/**
 * 自动技能：挑一个此刻最值得放的伤害技能
 * 规则：射程内最近的敌人 → 已就绪 → 距离在 autoRange 内 → 满足 autoMinTargets → 按 autoPriority 取最高
 * @param {Object} world 世界实例
 * @returns {Object|null} { skill, angle, target }
 */
export const pickAutoCastSkill = (world) => {
  const player = world.player;
  if (!player.alive || !player.activeSkillIds.length) {
    return null;
  }
  const target = findNearestEnemy(world, player, 470);
  if (!target) {
    return null;
  }
  const distance = distanceBetween(player.x, player.y, target.x, target.y);
  const candidates = [];
  player.activeSkillIds.forEach((skillId) => {
    const skill = getSkillById(skillId);
    if (!skill || (player.skillCooldowns[skillId] || 0) > 0) {
      return;
    }
    const range = skill.autoRange || 200;
    if (distance > range) {
      return;
    }
    if (skill.autoMinTargets && countEnemiesNear(world, player, range) < skill.autoMinTargets) {
      return;
    }
    candidates.push(skill);
  });
  if (!candidates.length) {
    return null;
  }
  candidates.sort((first, second) => (second.autoPriority || 5) - (first.autoPriority || 5));
  return {
    skill: candidates[0],
    angle: angleOfVector(target.x - player.x, target.y - player.y),
    target,
  };
};
