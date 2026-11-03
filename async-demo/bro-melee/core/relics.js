/**
 * 神兵系统：屠龙刀 / 倚天剑的持有、掉落、拾取评估与争夺（README §12）
 * 持有者获得属性与专属绝学，同时被「武林高手 / 大内高手」盯上
 */

import { RELIC_CONFIG } from '../constants.js';
import { ENEMY_SKILLS } from '../config/enemySkills.js';
import { RELICS, RELIC_IDS, getRelic } from '../config/relics.js';
import { createRelicItem } from './entities.js';
import { recalculatePlayerStats, refreshEntityBaseStats, threatScore } from './stats.js';
import { distanceBetween } from './utils.js';

/** 实体是否持有某件神兵 */
export const hasRelic = (entity, relicId) => {
  return Boolean(entity && entity.relics && entity.relics.includes(relicId));
};

/** 是否在谢逊手上（谢逊持兵不算「被争夺」） */
export const isRelicKeeper = (entity) => {
  return Boolean(entity && entity.typeId === 'xiexun');
};

/**
 * 在场地上投放一件神兵
 * @param {Object} world 世界实例
 * @param {String} relicId 神兵 id
 * @param {Number} x 世界坐标
 * @param {Number} y 世界坐标
 * @returns {Object} 神兵实体
 */
export const spawnRelicItem = (world, relicId, x, y) => {
  const item = createRelicItem(relicId, x, y);
  world.items.push(item);
  return item;
};

/** 找出某件神兵的持有者（玩家或敌人） */
export const findRelicHolder = (world, relicId) => {
  if (hasRelic(world.player, relicId)) {
    return world.player;
  }
  for (let index = 0; index < world.enemies.length; index++) {
    const enemy = world.enemies[index];
    if (enemy.alive && hasRelic(enemy, relicId)) {
      return enemy;
    }
  }
  return null;
};

/** 是否存在「非谢逊」的角色持有神兵（决定要不要刷猎杀队） */
export const findContestedHolder = (world) => {
  if (world.player.alive && world.player.relics.length) {
    return world.player;
  }
  for (let index = 0; index < world.enemies.length; index++) {
    const enemy = world.enemies[index];
    if (enemy.alive && enemy.relics.length && !isRelicKeeper(enemy)) {
      return enemy;
    }
  }
  return null;
};

/** 场上是否已存在该神兵的掉落物 */
export const hasLooseRelic = (world, relicId) => {
  for (let index = 0; index < world.items.length; index++) {
    const item = world.items[index];
    if (item.isRelic && item.itemId === relicId) {
      return true;
    }
  }
  return false;
};

/** 重算持有者属性（保持血量百分比） */
const refreshOwner = (entity) => {
  const ratio = entity.maxHp > 0 ? entity.hp / entity.maxHp : 1;
  if (entity.isPlayer) {
    recalculatePlayerStats(entity);
  } else {
    refreshEntityBaseStats(entity);
  }
  entity.hp = Math.min(entity.maxHp, Math.max(1, Math.round(entity.maxHp * ratio)));
};

/**
 * 把某件神兵塞给一个角色
 * @param {Object} world 世界实例
 * @param {Object} entity 获得者
 * @param {String} relicId 神兵 id
 */
export const grantRelic = (world, entity, relicId) => {
  const relic = getRelic(relicId);
  if (!relic || !entity || !entity.alive || hasRelic(entity, relicId)) {
    return;
  }
  entity.relics.push(relicId);
  entity.relicCooldowns[relicId] = 0;
  refreshOwner(entity);
  world.effects.addRing(entity.x, entity.y, entity.radius * 4.4, relic.color, { life: 0.6, lineWidth: 3 });
  world.effects.addText(entity.x, entity.y - entity.radius - 26, `得 ${relic.name}`, { color: relic.color, size: 18 });
  if (entity.isPlayer) {
    world.notify(`夺得 ${relic.name}：${relic.description}（${relic.key} 释放「${relic.skill.name}」）`, relic.color);
    if (entity.relics.length >= 2) {
      world.notify('刀剑合璧：攻势 +25%、暴击 +10%、受伤 -8%，全地图高手正在赶来', '#ffd166');
    }
  } else if (!isRelicKeeper(entity)) {
    world.spawner.markRelicHunt(world);
  }
};

/**
 * 丢弃一件神兵（掉在脚下）
 * @param {Object} world 世界实例
 * @param {Object} entity 持有者
 * @param {String} relicId 神兵 id，缺省丢最后拿到的一件
 */
export const dropRelic = (world, entity, relicId) => {
  const target = relicId || (entity.relics.length ? entity.relics[entity.relics.length - 1] : null);
  if (!target || !hasRelic(entity, target)) {
    return;
  }
  const relic = getRelic(target);
  entity.relics = entity.relics.filter((id) => id !== target);
  delete entity.relicCooldowns[target];
  refreshOwner(entity);
  const angle = Math.random() * Math.PI * 2;
  const dropped = spawnRelicItem(world, target, entity.x + Math.cos(angle) * (entity.radius + 18), entity.y + Math.sin(angle) * (entity.radius + 18));
  // 免疫期：丢的人短时间内捡不回来，否则原地丢完立刻又拿上
  dropped.dropImmuneId = entity.id;
  dropped.dropImmuneTimer = RELIC_CONFIG.DROP_IMMUNE_DURATION;
  world.effects.addRing(entity.x, entity.y, entity.radius * 2.6, relic ? relic.color : '#ffd166', { life: 0.4, lineWidth: 2 });
  world.effects.addText(entity.x, entity.y - entity.radius - 20, `弃 ${relic ? relic.name : '神兵'}`, {
    color: relic ? relic.color : '#ffd166',
    size: 14,
  });
  if (entity.isPlayer) {
    world.notify(`弃下 ${relic.name}，追兵自会散去`, '#c6a86c');
  }
};

/** 神兵绝学冷却递减 */
export const updateRelicCooldowns = (entity, deltaTime) => {
  const cooldowns = entity.relicCooldowns;
  Object.keys(cooldowns).forEach((relicId) => {
    if (cooldowns[relicId] > 0) {
      cooldowns[relicId] = Math.max(0, cooldowns[relicId] - deltaTime);
    }
  });
};

/** 神兵绝学是否就绪 */
export const isRelicReady = (entity, relicId) => {
  return hasRelic(entity, relicId) && (entity.relicCooldowns[relicId] || 0) <= 0;
};

/** 附近最强对手（含玩家），用于「敢不敢捡」的评估 */
const strongestRivalNear = (world, enemy, radius) => {
  let best = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  const consider = (actor) => {
    if (!actor || !actor.alive || actor.id === enemy.id) {
      return;
    }
    if (distanceBetween(enemy.x, enemy.y, actor.x, actor.y) > radius) {
      return;
    }
    const score = threatScore(actor);
    if (score > bestScore) {
      bestScore = score;
      best = actor;
    }
  };
  consider(world.player);
  world.enemies.forEach(consider);
  return best;
};

/**
 * AI 评估要不要捡这件神兵
 * 只有「自认扛得住」的敌人才会去拿，弱者宁愿绕开
 * @param {Object} world 世界实例
 * @param {Object} enemy 评估者
 * @param {String} relicId 神兵 id
 * @returns {String} take / avoid
 */
export const evaluateRelicPickup = (world, enemy, relicId) => {
  const relic = getRelic(relicId);
  if (!relic || hasRelic(enemy, relicId)) {
    return 'avoid';
  }
  const hpRatio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;
  if (hpRatio < RELIC_CONFIG.PICKUP_HP_RATIO) {
    return 'avoid';
  }
  const self = threatScore(enemy);
  const after = self + relic.threat;
  if (self < after * RELIC_CONFIG.PICKUP_SELF_RATIO) {
    return 'avoid';
  }
  const rival = strongestRivalNear(world, enemy, 900);
  if (rival && threatScore(rival) > after * RELIC_CONFIG.PICKUP_THREAT_RATIO) {
    return 'avoid';
  }
  return 'take';
};

/**
 * AI 评估要不要把神兵丢掉（残血、被围、打不过就扔）
 * @param {Object} world 世界实例
 * @param {Object} enemy 持有者
 * @returns {Boolean} 是否丢弃
 */
export const shouldDropRelic = (world, enemy) => {
  if (!enemy.relics.length || isRelicKeeper(enemy)) {
    return false;
  }
  const hpRatio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;
  if (hpRatio < RELIC_CONFIG.DROP_HP_RATIO) {
    return true;
  }
  let pressure = 0;
  let scoreSum = 0;
  const consider = (actor) => {
    if (!actor || !actor.alive || actor.id === enemy.id) {
      return;
    }
    if (distanceBetween(enemy.x, enemy.y, actor.x, actor.y) > RELIC_CONFIG.DROP_RADIUS) {
      return;
    }
    pressure += 1;
    scoreSum += threatScore(actor);
  };
  world.enemies.forEach(consider);
  if (world.player.alive && distanceBetween(enemy.x, enemy.y, world.player.x, world.player.y) <= RELIC_CONFIG.DROP_RADIUS) {
    pressure += 1;
    scoreSum += threatScore(world.player);
  }
  if (pressure >= RELIC_CONFIG.DROP_PRESSURE_COUNT) {
    const average = scoreSum / pressure;
    if (average > threatScore(enemy) * 1.05) {
      return true;
    }
  }
  return false;
};

/**
 * 找出最值得争夺的目标：最近的「非谢逊」持兵者
 * @param {Object} world 世界实例
 * @param {Object} enemy 评估者
 * @param {Number} radius 搜索半径（复仇形态用更大的追猎半径）
 * @returns {Object|null} 目标角色
 */
export const findRelicPrey = (world, enemy, radius = RELIC_CONFIG.HUNT_AGGRO_RADIUS) => {
  let best = null;
  let bestDistance = radius;
  const consider = (actor) => {
    if (!actor || !actor.alive || actor.id === enemy.id) {
      return;
    }
    if (!actor.relics || !actor.relics.length || isRelicKeeper(actor)) {
      return;
    }
    const distance = distanceBetween(enemy.x, enemy.y, actor.x, actor.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = actor;
    }
  };
  consider(world.player);
  world.enemies.forEach(consider);
  return best;
};

/** 敌人是否掌握远程手段（能偷袭） */
export const hasRangedSkill = (enemy) => {
  return enemy.skills.some((slot) => {
    const config = ENEMY_SKILLS[slot.id];
    return config && (config.type === 'projectile' || config.type === 'targetArea');
  });
};

/**
 * 权衡：面对持兵者时是贴脸打还是远程偷袭
 * 残血 / 打不过 / 天生远程 → 保持距离放冷枪
 * @param {Object} enemy 评估者
 * @param {Object} target 持兵者
 * @returns {Boolean} 是否偷袭
 */
export const decideSnipe = (enemy, target) => {
  if (!target || !hasRangedSkill(enemy)) {
    return false;
  }
  const hpRatio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;
  if (hpRatio < RELIC_CONFIG.SNIPE_HP_RATIO) {
    return true;
  }
  if (threatScore(enemy) < threatScore(target) * 1.1) {
    return true;
  }
  return Math.random() < 0.35;
};

/** 每帧推进：持兵敌人的「丢不丢」判定 */
export const updateRelicPossession = (world, deltaTime) => {
  for (let index = 0; index < world.enemies.length; index++) {
    const enemy = world.enemies[index];
    if (!enemy.alive || !enemy.relics.length) {
      continue;
    }
    enemy.relicDropTimer -= deltaTime;
    if (enemy.relicDropTimer > 0) {
      continue;
    }
    enemy.relicDropTimer = RELIC_CONFIG.DROP_CHECK_INTERVAL;
    if (shouldDropRelic(world, enemy)) {
      dropRelic(world, enemy);
    }
  }
};

/**
 * 保底：某件神兵既无人持有也不在场上时，重新投放到玩家附近
 * @param {Object} world 世界实例
 * @param {Number} deltaTime 帧间隔
 */
export const ensureRelicsExist = (world, deltaTime) => {
  // 谢逊登场之前神兵不落江湖（都在他手上）
  if (!world.relicsUnlocked) {
    RELIC_IDS.forEach((relicId) => {
      world.relicRespawnTimers[relicId] = RELIC_CONFIG.RESPAWN_DELAY;
    });
    return;
  }
  RELIC_IDS.forEach((relicId) => {
    if (findRelicHolder(world, relicId) || hasLooseRelic(world, relicId)) {
      world.relicRespawnTimers[relicId] = RELIC_CONFIG.RESPAWN_DELAY;
      return;
    }
    world.relicRespawnTimers[relicId] -= deltaTime;
    if (world.relicRespawnTimers[relicId] > 0) {
      return;
    }
    world.relicRespawnTimers[relicId] = RELIC_CONFIG.RESPAWN_DELAY;
    const angle = Math.random() * Math.PI * 2;
    const radius = 380 + Math.random() * 320;
    spawnRelicItem(world, relicId, world.player.x + Math.cos(angle) * radius, world.player.y + Math.sin(angle) * radius);
    world.notify(`${RELICS[relicId].name}重现江湖`, RELICS[relicId].color);
  });
};
