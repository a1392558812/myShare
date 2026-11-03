/**
 * 道具系统：掉落、定时刷新、拾取结算（README §7）
 */

import { BALANCE } from '../constants.js';
import { getItemType, pickItemType } from '../config/items.js';
import { createItem } from './entities.js';
import { healEntity } from './combat.js';
import { grantRelic, spawnRelicItem } from './relics.js';
import { grantExp } from './stats.js';
import { distanceBetween, randomRange } from './utils.js';

/**
 * 在世界中生成一个道具
 * @param {Object} world 世界实例
 * @param {String} itemId 道具 id
 * @param {Number} x 世界坐标
 * @param {Number} y 世界坐标
 * @returns {Object} 道具实体
 */
export const spawnItem = (world, itemId, x, y) => {
  const item = createItem(itemId, x, y);
  world.items.push(item);
  return item;
};

/**
 * 在玩家屏幕外环带生成道具
 * @param {Object} world 世界实例
 * @param {Object} options { itemId, radiusMin, radiusMax }
 * @returns {Object} 道具实体
 */
export const spawnItemNearPlayer = (world, options = {}) => {
  const baseRadius = Math.hypot(world.viewWidth, world.viewHeight) / 2;
  const minRadius = options.radiusMin === undefined ? baseRadius + 120 : options.radiusMin;
  const maxRadius = options.radiusMax === undefined ? baseRadius + 320 : options.radiusMax;
  const angle = Math.random() * Math.PI * 2;
  const radius = randomRange(minRadius, maxRadius);
  const itemId = options.itemId || pickItemType().id;
  const x = world.player.x + Math.cos(angle) * radius;
  const y = world.player.y + Math.sin(angle) * radius;
  return spawnItem(world, itemId, x, y);
};

/**
 * 结算道具效果（玩家与敌人通用）
 * @param {Object} world 世界实例
 * @param {Object} entity 拾取者
 * @param {Object} item 道具实体
 */
export const applyItemEffect = (world, entity, item) => {
  if (item.isRelic) {
    grantRelic(world, entity, item.itemId);
    return;
  }
  const type = getItemType(item.itemId);
  const isPlayer = entity.isPlayer;
  switch (item.itemId) {
    case 'expBook':
    case 'greatPill': {
      const expAmount = entity.level * (type.expPerLevel || 20);
      const levelsGained = grantExp(entity, expAmount);
      world.effects.addText(entity.x, entity.y - entity.radius - 16, `+${expAmount} 经验`, {
        color: '#7be3ff',
        size: 14,
      });
      if (levelsGained > 0 && isPlayer) {
        world.handlePlayerLevelUp(levelsGained);
      }
      break;
    }
    case 'heal':
      healEntity(entity, entity.maxHp * (type.healRatio || 0.3), world, true);
      break;
    case 'shield':
      entity.shield = Math.max(entity.shield || 0, Math.round(entity.maxHp * (type.shieldRatio || 0.35)));
      entity.shieldTimer = type.duration || 10;
      break;
    case 'speed':
      entity.speedBoostTimer = type.duration || 8;
      entity.speedBoostMultiplier = type.speedMultiplier || 1.45;
      break;
    default:
      break;
  }
  world.effects.addRing(item.x, item.y, 34, item.color, { life: 0.32, lineWidth: 2 });
  world.effects.addParticles(item.x, item.y, {
    count: 8,
    color: item.color,
    speed: 120,
    size: 2.4,
    life: 0.4,
  });
  if (isPlayer && type.rarity !== 'common') {
    world.notify(`拾得 ${type.name}：${type.description}`, type.color);
  }
};

/**
 * 敌人死亡掉落（README §7.2）
 * @param {Object} world 世界实例
 * @param {Object} victim 死亡实体
 */
export const dropLoot = (world, victim) => {
  // 随从倒下只留一句话，不掉战利品
  if (victim.isCompanion) {
    world.notify(`${victim.typeName} 倒下了`, '#c9a6ff');
    return;
  }
  const dropBonus = victim.dropBonus || 0;
  const drops = [];
  if (Math.random() < BALANCE.DROP.expBookChance + dropBonus) {
    drops.push('expBook');
  }
  if (Math.random() < BALANCE.DROP.healChance + dropBonus) {
    drops.push('heal');
  }
  if (Math.random() < BALANCE.DROP.rareChance + dropBonus * 0.4) {
    drops.push(Math.random() < 0.5 ? 'shield' : 'speed');
  }
  if (Math.random() < BALANCE.DROP.greatPillChance + dropBonus * 0.6) {
    drops.push('greatPill');
  }
  if (victim.isBoss) {
    for (let index = 0; index < BALANCE.BOSS_DROP_COUNT; index++) {
      drops.push(index === 0 ? 'greatPill' : index === 1 ? 'shield' : 'heal');
    }
  }
  // 复仇形态空手而来，伏诛时必掉高级战利品 —— 补上「打了没收益」的缺口
  if (victim.revenge) {
    drops.push('greatPill', 'shield');
  }
  drops.forEach((itemId, index) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = victim.radius + 12 + index * 6;
    spawnItem(world, itemId, victim.x + Math.cos(angle) * distance, victim.y + Math.sin(angle) * distance);
  });
  // 神兵随死亡掉落：谢逊一死双兵散落当场，其余持有者同理
  (victim.relics || []).slice().forEach((relicId, index) => {
    victim.relics = victim.relics.filter((id) => id !== relicId);
    const angle = Math.random() * Math.PI * 2;
    const distance = victim.radius + 20 + index * 26;
    spawnRelicItem(world, relicId, victim.x + Math.cos(angle) * distance, victim.y + Math.sin(angle) * distance);
  });
};

/**
 * 逐帧更新道具：呼吸动画、过期回收、拾取判定
 * @param {Object} world 世界实例
 * @param {Number} deltaTime 帧间隔
 */
export const updateItems = (world, deltaTime) => {
  const actors = world.getActors();
  for (let index = world.items.length - 1; index >= 0; index--) {
    const item = world.items[index];
    item.life -= deltaTime;
    item.phase += deltaTime * 2.6;
    if (item.dropImmuneTimer > 0) {
      item.dropImmuneTimer -= deltaTime;
    }
    if (item.life <= 0) {
      world.items.splice(index, 1);
      continue;
    }
    const owner = findPickupOwner(world, actors, item);
    if (!owner) {
      continue;
    }
    item.alive = false;
    world.items.splice(index, 1);
    applyItemEffect(world, owner, item);
  }
};

/** 找出最先接触道具的实体（玩家优先；神兵只有「打定主意要拿」的敌人才能捡） */
const findPickupOwner = (world, actors, item) => {
  let bestOwner = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < actors.length; index++) {
    const actor = actors[index];
    if (!actor.alive) {
      continue;
    }
    if (item.isRelic && !actor.isPlayer && actor.relicIntent !== item.itemId) {
      continue;
    }
    // 刚被自己丢下的神兵有免疫期，避免原地丢完立刻又捡回来
    if (item.dropImmuneId === actor.id && item.dropImmuneTimer > 0) {
      continue;
    }
    const reach = actor.radius + item.radius + BALANCE.ITEM.pickupPadding;
    const distance = distanceBetween(actor.x, actor.y, item.x, item.y);
    if (distance > reach) {
      continue;
    }
    const priority = actor.isPlayer ? distance - 6 : distance;
    if (priority < bestDistance) {
      bestDistance = priority;
      bestOwner = actor;
    }
  }
  return bestOwner;
};
