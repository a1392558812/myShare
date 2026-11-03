/**
 * 谢逊 / 张翠山羁绊（README §12.4）
 * 一方存活时给另一方加成：谢逊在旁，张翠山攻势更盛；师侄未倒，谢逊杀性更重
 * 存活状态定时同步，只有变化时才重算属性（保持血量百分比）
 */

import { RELIC_CONFIG } from '../constants.js';
import { refreshEntityBaseStats } from './stats.js';

/** 属性刷新时保持血量百分比，避免加 buff 直接回血 */
const refreshBonded = (entity) => {
  const ratio = entity.maxHp > 0 ? entity.hp / entity.maxHp : 1;
  refreshEntityBaseStats(entity);
  entity.hp = Math.min(entity.maxHp, Math.max(1, Math.round(entity.maxHp * ratio)));
};

/** 羁绊对象（还活着的那个） */
const livePartner = (world, entity) => {
  if (!entity.bondId) {
    return null;
  }
  const partner = world.findActor(entity.bondId);
  return partner && partner.alive ? partner : null;
};

/**
 * 建立双向羁绊（谢逊为 leader，张翠山为 escort）
 * @param {Object} leader 谢逊
 * @param {Object} escort 张翠山
 */
export const linkBond = (leader, escort) => {
  leader.bondId = escort.id;
  leader.bondRole = 'leader';
  escort.bondId = leader.id;
  escort.bondRole = 'escort';
  const config = RELIC_CONFIG.BOND;
  // 建立羁绊时双方都在场，直接吃满加成，不留空窗
  leader.bondBuff = Object.assign({}, config.LEADER_SURVIVE);
  escort.bondBuff = Object.assign({}, config.ESCORT_SURVIVE);
  refreshBonded(leader);
  refreshBonded(escort);
};

/**
 * 每帧推进：羁绊双方存活状态变化时刷新加成
 * @param {Object} world 世界实例
 * @param {Number} deltaTime 帧间隔
 */
export const updateBonds = (world, deltaTime) => {
  world.bondTimer -= deltaTime;
  if (world.bondTimer > 0) {
    return;
  }
  world.bondTimer = RELIC_CONFIG.BOND.CHECK_INTERVAL;
  const config = RELIC_CONFIG.BOND;
  for (let index = 0; index < world.enemies.length; index += 1) {
    const enemy = world.enemies[index];
    if (!enemy.alive || !enemy.bondId || !enemy.bondRole) {
      continue;
    }
    const partnerAlive = Boolean(livePartner(world, enemy));
    if (partnerAlive === Boolean(enemy.bondBuff)) {
      continue;
    }
    enemy.bondBuff = partnerAlive ? Object.assign({}, enemy.bondRole === 'leader' ? config.LEADER_SURVIVE : config.ESCORT_SURVIVE) : null;
    refreshBonded(enemy);
  }
};

/** 羁绊对象 id（AI 找队友用，没有则 null） */
export const bondPartnerId = (entity) => {
  return entity && entity.bondId ? entity.bondId : null;
};
