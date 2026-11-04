/**
 * 敌人 AI 状态机（README §8）
 * Wander / Chase / Attack / Retreat / Pickup / Flee
 * 决策 0.5s 一次，移动每帧执行
 */

import { AI_CONFIG, ENCOUNTER_CONFIG, RELIC_CONFIG } from '../constants.js';
import { livingCompanions, tryCastCompanionManual } from './companions.js';
import { evaluateRelicPickup, findRelicPrey, decideSnipe } from './relics.js';
import { canBeat, isStrongThreat, threatScore } from './stats.js';
import { angleOfVector, distanceBetween, randomRange } from './utils.js';

/** 按 id 找实体（玩家或敌人） */
const findActorById = (world, actorId) => {
  if (actorId === null || actorId === undefined) {
    return null;
  }
  return world.findActor(actorId);
};

/** 把候选集拆成「活着的角色」和「道具」 */
const splitCandidates = (candidates, selfId) => {
  const actors = [];
  const items = [];
  candidates.forEach((candidate) => {
    if (!candidate || !candidate.alive) {
      return;
    }
    if (candidate.kind === 'item') {
      items.push(candidate);
      return;
    }
    if (candidate.id !== selfId) {
      actors.push(candidate);
    }
  });
  return { actors, items };
};

/**
 * 目标是否露出破绽：打坐 / 受传功 / 明显眩晕——此时毫无还手之力
 * 敌人据此跳过战力评估，直接扑上来（不再「算一算觉得自己更强而走开」）
 * @param {Object} world 世界实例
 * @param {Object} actor 被评估的角色
 * @returns {Boolean} 是否无法还手
 */
export const isHelpless = (world, actor) => {
  if (!actor || !actor.alive) {
    return false;
  }
  if (actor.stunTimer > AI_CONFIG.EXPOSE_STUN) {
    return true;
  }
  return Boolean(actor.isPlayer && world.channel);
};

/** 找最近的强敌（威胁源） */
const findStrongThreat = (enemy, actors, world) => {
  let nearest = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  actors.forEach((actor) => {
    // 露破绽的目标构不成威胁，不值得为它逃
    if (isHelpless(world, actor)) {
      return;
    }
    if (!isStrongThreat(enemy, actor)) {
      return;
    }
    const distance = distanceBetween(enemy.x, enemy.y, actor.x, actor.y);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = actor;
    }
  });
  return nearest;
};

/** 找最值得打的目标（优先玩家、残血、近处；破绽目标免战力评估） */
const findBestTarget = (enemy, actors, viewRadius, world) => {
  let best = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  actors.forEach((actor) => {
    const distance = distanceBetween(enemy.x, enemy.y, actor.x, actor.y);
    if (distance > viewRadius) {
      return;
    }
    const helpless = isHelpless(world, actor);
    // 已经交过手的敌人会咬着不放，短暂不做战力重估
    const engaged = actor.isPlayer && enemy.engageUntil > world.time;
    if (!helpless && !engaged && !canBeat(enemy, actor)) {
      return;
    }
    const hpRatio = actor.maxHp > 0 ? actor.hp / actor.maxHp : 1;
    let score = (1000 - distance) * 0.1;
    if (actor.isPlayer) {
      score += 28;
    }
    if (hpRatio < 0.5) {
      score += 12;
    }
    if (helpless) {
      score += AI_CONFIG.EXPOSE_TARGET_BONUS;
    }
    if (score > bestScore) {
      bestScore = score;
      best = actor;
    }
  });
  return best;
};

/** 找最值得捡的道具：神兵要先过「敢不敢拿」的评估，其余按需求排序 */
const findBestItem = (enemy, items, playerLevel, world) => {
  const hpRatio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;
  let best = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  items.forEach((item) => {
    const distance = distanceBetween(enemy.x, enemy.y, item.x, item.y);
    if (distance > AI_CONFIG.ITEM_SEARCH_RADIUS) {
      return;
    }
    let priority = 0.6;
    if (item.isRelic) {
      // 神兵：自认扛得住才去拿，否则装作没看见
      if (evaluateRelicPickup(world, enemy, item.itemId) !== 'take') {
        return;
      }
      priority = 2.6;
    } else if (item.itemId === 'heal') {
      priority = hpRatio < 0.7 ? 2.2 : 0.5;
    } else if (item.itemId === 'expBook' || item.itemId === 'greatPill') {
      priority = enemy.level <= playerLevel ? 1.7 : 0.9;
    } else if (item.itemId === 'shield' || item.itemId === 'speed') {
      priority = hpRatio < 0.6 ? 1.2 : 0.7;
    }
    const score = priority * 420 - distance;
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  });
  return best;
};

/**
 * 决策：综合威胁、目标、道具，给出下一个状态
 * @param {Object} world 世界实例
 * @param {Object} enemy 敌人
 */
const decideBehavior = (world, enemy) => {
  // 奇遇追兵（洪七公 / 熊孩子他爹）：认死玩家，不做任何战力评估
  if (enemy.forcedHuntTimer !== undefined && enemy.forcedHuntTimer !== null && world.player.alive) {
    enemy.targetId = world.player.id;
    enemy.snipe = false;
    enemy.aiState = 'chase';
    return;
  }
  const candidates = world.hash.query(enemy.x, enemy.y, enemy.viewRadius);
  const { actors, items } = splitCandidates(candidates, enemy.id);
  // 羁绊同伴之间互不攻击：选目标时直接把对方从候选里摘掉
  const rivals = enemy.bondId ? actors.filter((actor) => actor.id !== enemy.bondId) : actors;
  const hpRatio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 0;
  const player = world.player;
  const playerHelpless = isHelpless(world, player);
  // 已经打中过玩家的敌人记仇一会儿：这段时间里不因战力重估而脱战
  const engagedWithPlayer = Boolean(player.alive && enemy.engageUntil > world.time);
  const strongThreat = engagedWithPlayer ? null : findStrongThreat(enemy, rivals, world);
  const bestTarget = findBestTarget(enemy, rivals, enemy.viewRadius, world);
  const bestItem = findBestItem(enemy, items, world.player.level, world);

  enemy.targetId = bestTarget ? bestTarget.id : null;
  enemy.itemTargetId = bestItem ? bestItem.id : null;
  enemy.relicIntent = bestItem && bestItem.isRelic ? bestItem.itemId : null;
  enemy.snipe = false;

  // 张翠山：先跟住谢逊，再集火谢逊正在打的人
  const partner = enemy.bondId ? findActorById(world, enemy.bondId) : null;
  if (enemy.bondRole === 'escort' && partner && partner.alive) {
    if (distanceBetween(enemy.x, enemy.y, partner.x, partner.y) > RELIC_CONFIG.BOND.FOLLOW_RADIUS) {
      enemy.targetId = partner.id;
      enemy.aiState = 'follow';
      return;
    }
    const shared = findActorById(world, partner.targetId);
    if (shared && shared.alive && shared.id !== enemy.id) {
      enemy.targetId = shared.id;
      enemy.aiState = 'chase';
      return;
    }
  }

  // 复仇形态：登场即索命，不做战力评估，直扑持兵者
  if (enemy.revenge) {
    const prey = findRelicPrey(world, enemy, RELIC_CONFIG.XIEXUN_HUNT_RADIUS);
    if (prey) {
      enemy.targetId = prey.id;
      enemy.snipe = decideSnipe(enemy, prey);
      enemy.aiState = enemy.snipe ? 'snipe' : 'chase';
      return;
    }
  }

  // 神兵争夺：高手无条件扑向持兵者，普通敌人只在自认打得过时插一脚
  const prey = findRelicPrey(world, enemy);
  if (prey && (enemy.huntRelic || isHelpless(world, prey) || canBeat(enemy, prey) || threatScore(enemy) > threatScore(prey) * 0.85)) {
    enemy.targetId = prey.id;
    enemy.aiState = 'chase';
    enemy.snipe = decideSnipe(enemy, prey);
    if (enemy.snipe) {
      enemy.aiState = 'snipe';
    }
    return;
  }

  if (enemy.enragedTimer > 0 && bestTarget) {
    enemy.aiState = 'chase';
    return;
  }
  if (hpRatio < AI_CONFIG.RETREAT_HP_RATIO) {
    if (bestItem) {
      enemy.aiState = 'pickup';
      return;
    }
    enemy.targetId = strongThreat ? strongThreat.id : null;
    enemy.aiState = strongThreat ? 'retreat' : 'wander';
    return;
  }
  // 记仇期：玩家跑出视野也继续咬着，直到这几秒的狠劲过去
  if (engagedWithPlayer && (!bestTarget || bestTarget.isPlayer)) {
    enemy.aiState = 'chase';
    enemy.targetId = player.id;
    return;
  }
  if (strongThreat) {
    const threatDistance = distanceBetween(enemy.x, enemy.y, strongThreat.x, strongThreat.y);
    if (threatDistance < enemy.viewRadius * 0.8) {
      enemy.aiState = 'flee';
      enemy.targetId = strongThreat.id;
      return;
    }
  }
  // 战力明显高于玩家的敌人会主动循着气味找上门（防「无敌无聊」）
  if (player.alive) {
    const playerDistance = distanceBetween(enemy.x, enemy.y, player.x, player.y);
    const huntRadius = enemy.isBoss ? 1500 : 800;
    // 谢逊带兵登场时不循味追玩家：他和普通敌人一样在场上大乱斗，神兵争夺自会找上门
    // 只有复仇形态（双兵尽失）才会专程索敌——循味逻辑照常生效
    const guardsRelics = Boolean(enemy.relics && enemy.relics.length > 0);
    // 破绽例外：玩家打坐 / 眩晕时没有还手能力，不问战力，先扑上去
    if (playerHelpless && !guardsRelics && playerDistance < huntRadius) {
      enemy.aiState = 'chase';
      enemy.targetId = player.id;
      return;
    }
    if (!guardsRelics && playerDistance < huntRadius && threatScore(enemy) > threatScore(player) * 1.3) {
      enemy.aiState = 'chase';
      enemy.targetId = player.id;
      return;
    }
  }
  if (bestItem) {
    const needHeal = bestItem.itemId === 'heal' && hpRatio < 0.8;
    const levelBehind = enemy.level <= world.player.level;
    if (needHeal || levelBehind || !bestTarget) {
      enemy.aiState = 'pickup';
      return;
    }
  }
  if (bestTarget) {
    enemy.aiState = 'chase';
    return;
  }
  if (bestItem) {
    enemy.aiState = 'pickup';
    return;
  }
  enemy.aiState = 'wander';
};

/** 朝某个方向走 */
const moveToward = (enemy, targetX, targetY, speed) => {
  const angle = angleOfVector(targetX - enemy.x, targetY - enemy.y);
  enemy.facing = angle;
  enemy.vx = Math.cos(angle) * speed;
  enemy.vy = Math.sin(angle) * speed;
};

/** 背离某个方向走 */
const moveAwayFrom = (enemy, threatX, threatY, speed) => {
  const angle = angleOfVector(enemy.x - threatX, enemy.y - threatY);
  enemy.facing = angle;
  enemy.vx = Math.cos(angle) * speed;
  enemy.vy = Math.sin(angle) * speed;
};

/**
 * 根据状态设置速度与攻击意图
 * @param {Object} world 世界实例
 * @param {Object} enemy 敌人
 * @param {Number} deltaTime 帧间隔
 */
const applyStateMotion = (world, enemy, deltaTime) => {
  const speed = enemy.speed * (enemy.buffSpeedMultiplier || 1) * (enemy.slowMultiplier || 1);
  enemy.wantsAttack = false;
  const target = findActorById(world, enemy.targetId);
  const item = findActorById(world, enemy.itemTargetId);

  switch (enemy.aiState) {
    case 'chase': {
      if (!target || !target.alive) {
        enemy.aiState = 'wander';
        enemy.vx = 0;
        enemy.vy = 0;
        return;
      }
      const distance = distanceBetween(enemy.x, enemy.y, target.x, target.y);
      const reach = enemy.attackRange + enemy.radius + target.radius;
      if (distance <= reach + AI_CONFIG.ATTACK_PADDING) {
        enemy.aiState = 'attack';
        return;
      }
      moveToward(enemy, target.x, target.y, speed);
      return;
    }
    case 'attack': {
      if (!target || !target.alive) {
        enemy.aiState = 'wander';
        return;
      }
      const distance = distanceBetween(enemy.x, enemy.y, target.x, target.y);
      const reach = enemy.attackRange + enemy.radius + target.radius;
      enemy.facing = angleOfVector(target.x - enemy.x, target.y - enemy.y);
      if (distance > reach * 1.25) {
        enemy.aiState = 'chase';
        return;
      }
      enemy.vx = 0;
      enemy.vy = 0;
      if (distance <= reach && enemy.meleeCooldown <= 0) {
        enemy.wantsAttack = true;
      }
      return;
    }
    case 'follow': {
      // 随从贴回羁绊同伴身边，不主动出手（张翠山跟着谢逊）
      const partner = findActorById(world, enemy.bondId);
      if (!partner || !partner.alive) {
        enemy.aiState = 'wander';
        return;
      }
      const gap = distanceBetween(enemy.x, enemy.y, partner.x, partner.y);
      const keep = partner.radius + enemy.radius + RELIC_CONFIG.BOND.FOLLOW_KEEP_DISTANCE;
      if (gap <= keep) {
        enemy.vx = 0;
        enemy.vy = 0;
        enemy.facing = angleOfVector(partner.x - enemy.x, partner.y - enemy.y);
        return;
      }
      moveToward(enemy, partner.x, partner.y, speed * 1.05);
      return;
    }
    case 'retreat':
    case 'flee': {
      const threat = findActorById(world, enemy.targetId);
      if (!threat || !threat.alive) {
        enemy.aiState = 'wander';
        return;
      }
      const boost = enemy.aiState === 'flee' ? 1.15 : 1.02;
      moveAwayFrom(enemy, threat.x, threat.y, speed * boost);
      return;
    }
    case 'snipe': {
      // 远程偷袭：与持兵者保持一段距离绕圈，只放远程手段
      if (!target || !target.alive) {
        enemy.aiState = 'wander';
        return;
      }
      const distance = distanceBetween(enemy.x, enemy.y, target.x, target.y);
      const angle = angleOfVector(target.x - enemy.x, target.y - enemy.y);
      enemy.facing = angle;
      if (distance < RELIC_CONFIG.SNIPE_MIN_DISTANCE) {
        moveAwayFrom(enemy, target.x, target.y, speed * 0.95);
        return;
      }
      if (distance > RELIC_CONFIG.SNIPE_MAX_DISTANCE) {
        moveToward(enemy, target.x, target.y, speed);
        return;
      }
      const orbit = angle + (Math.PI / 2) * (enemy.id % 2 === 0 ? 1 : -1);
      enemy.vx = Math.cos(orbit) * speed * 0.32;
      enemy.vy = Math.sin(orbit) * speed * 0.32;
      return;
    }
    case 'pickup': {
      if (!item || !item.alive) {
        enemy.aiState = 'wander';
        enemy.itemTargetId = null;
        enemy.vx = 0;
        enemy.vy = 0;
        return;
      }
      moveToward(enemy, item.x, item.y, speed);
      return;
    }
    default: {
      enemy.wanderTimer -= deltaTime;
      if (enemy.wanderTimer <= 0) {
        enemy.wanderTimer = randomRange(0.8, 2.2);
        const distanceToPlayer = distanceBetween(enemy.x, enemy.y, world.player.x, world.player.y);
        if (distanceToPlayer > 700) {
          // 离玩家太远的敌人会循着战场动静靠过来，避免地图被拉空
          enemy.wanderAngle = angleOfVector(world.player.x - enemy.x, world.player.y - enemy.y) + randomRange(-0.7, 0.7);
        } else {
          enemy.wanderAngle = randomRange(-Math.PI, Math.PI);
        }
      }
      enemy.facing = enemy.wanderAngle;
      enemy.vx = Math.cos(enemy.wanderAngle) * speed * AI_CONFIG.WANDER_SPEED_RATIO;
      enemy.vy = Math.sin(enemy.wanderAngle) * speed * AI_CONFIG.WANDER_SPEED_RATIO;
    }
  }
};

/**
 * 随从 AI：跟着玩家跑，顺手打附近敌人；离玩家太远就先归队
 * @param {Object} world 世界实例
 * @param {Object} enemy 随从
 * @param {Number} deltaTime 帧间隔
 */
/** 玩家最近一次打中的敌人（还活着才算数） */
const resolveFocusTarget = (world, player) => {
  if (!player.focusTargetId) {
    return null;
  }
  if (world.time - (player.focusTargetTime || 0) > ENCOUNTER_CONFIG.COMPANION_FOCUS_MEMORY) {
    return null;
  }
  const target = findActorById(world, player.focusTargetId);
  if (!target || !target.alive || target.isCompanion) {
    return null;
  }
  return target;
};

/**
 * 随从选目标：优先玩家正在打的那只，其次玩家附近最近的敌人
 * @param {Object} world 世界实例
 * @param {Object} enemy 随从
 * @param {Object} player 玩家
 * @returns {Number|null} 目标 id
 */
const pickCompanionTarget = (world, enemy, player) => {
  const focus = resolveFocusTarget(world, player);
  if (focus) {
    const focusGap = distanceBetween(player.x, player.y, focus.x, focus.y);
    if (focusGap <= ENCOUNTER_CONFIG.COMPANION_ENGAGE + ENCOUNTER_CONFIG.COMPANION_FOCUS_BONUS) {
      return focus.id;
    }
  }
  let best = null;
  let bestDistance = Infinity;
  world.enemies.forEach((other) => {
    if (!other.alive || other.isCompanion || other.id === enemy.id) {
      return;
    }
    // 只打玩家身边的敌人：她永远围着玩家转，不自己跑图
    if (distanceBetween(player.x, player.y, other.x, other.y) > ENCOUNTER_CONFIG.COMPANION_ENGAGE) {
      return;
    }
    const distance = distanceBetween(enemy.x, enemy.y, other.x, other.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = other;
    }
  });
  return best ? best.id : null;
};

/**
 * 随从 AI：优先跟随玩家，攻击时优先集火玩家正在打的目标
 * @param {Object} world 世界实例
 * @param {Object} enemy 随从
 * @param {Number} deltaTime 帧间隔
 */
/** 随从各自的跟班点位：按在队序号绕玩家一圈散开，避免叠在人身上互相遮挡 */
const companionSlotPoint = (world, enemy, player) => {
  const companions = livingCompanions(world);
  const index = Math.max(0, companions.findIndex((item) => item.id === enemy.id));
  const count = Math.max(1, companions.length);
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
  const gap = ENCOUNTER_CONFIG.COMPANION_FOLLOW * 0.72;
  return { x: player.x + Math.cos(angle) * gap, y: player.y + Math.sin(angle) * gap };
};

const updateCompanionAI = (world, enemy, deltaTime) => {
  const player = world.player;
  enemy.wantsAttack = false;
  enemy.aiTimer -= deltaTime;

  if (!player.alive) {
    enemy.aiState = 'wander';
    enemy.vx = 0;
    enemy.vy = 0;
    return;
  }

  const gapToPlayer = distanceBetween(enemy.x, enemy.y, player.x, player.y);

  if (enemy.aiTimer <= 0) {
    enemy.aiTimer = 0.25;
    enemy.targetId = pickCompanionTarget(world, enemy, player);
  }

  const target = findActorById(world, enemy.targetId);
  const focus = resolveFocusTarget(world, player);
  const isFocus = Boolean(focus && target && focus.id === target.id);
  // 玩家在跑动时不给她越界追击的宽限：人被跑远了就先跟，别为了一刀落在后面
  const playerMoving = Math.hypot(player.vx, player.vy) > 30;
  // 集火目标时放宽跟随半径，免得远程目标够不着就被拽回来
  const leash = isFocus && !playerMoving
    ? ENCOUNTER_CONFIG.COMPANION_LEASH + ENCOUNTER_CONFIG.COMPANION_FOCUS_BONUS
    : ENCOUNTER_CONFIG.COMPANION_LEASH;

  // 跟人优先：目标没了、或者已经被甩太远，先回到自己的跟班点位
  if (!target || !target.alive || gapToPlayer > leash) {
    const slot = companionSlotPoint(world, enemy, player);
    const gapToSlot = distanceBetween(enemy.x, enemy.y, slot.x, slot.y);
    enemy.aiState = 'escort';
    if (gapToSlot > 28) {
      moveToward(enemy, slot.x, slot.y, enemy.speed * 1.1);
    } else {
      enemy.vx = 0;
      enemy.vy = 0;
      enemy.facing = angleOfVector(player.x - enemy.x, player.y - enemy.y);
    }
    return;
  }

  const distance = distanceBetween(enemy.x, enemy.y, target.x, target.y);
  const reach = enemy.attackRange + enemy.radius + target.radius;
  if (distance > reach * 1.15) {
    enemy.aiState = 'chase';
    moveToward(enemy, target.x, target.y, enemy.speed);
    return;
  }
  enemy.aiState = 'attack';
  enemy.facing = angleOfVector(target.x - enemy.x, target.y - enemy.y);
  enemy.vx = 0;
  enemy.vy = 0;
  if (distance <= reach && enemy.meleeCooldown <= 0) {
    enemy.wantsAttack = true;
  }
  // 追不上也够得着时，先甩一记自修的招式（她自己挑的武功，玩家管不着）
  if (enemy.learnsManuals && enemy.meleeCooldown > 0) {
    tryCastCompanionManual(world, enemy, target);
  }
};

/**
 * 敌人 AI 主入口
 * @param {Object} world 世界实例
 * @param {Object} enemy 敌人
 * @param {Number} deltaTime 帧间隔
 */
export const updateEnemyAI = (world, enemy, deltaTime) => {
  if (!enemy.alive) {
    return;
  }
  if (enemy.isCompanion) {
    updateCompanionAI(world, enemy, deltaTime);
    return;
  }
  enemy.aiTimer -= deltaTime;
  if (enemy.aiTimer <= 0) {
    enemy.aiTimer = AI_CONFIG.TICK * randomRange(0.85, 1.2);
    decideBehavior(world, enemy);
  }
  applyStateMotion(world, enemy, deltaTime);
};
