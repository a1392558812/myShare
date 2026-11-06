/**
 * 刷新系统与难度浮动（README §10，核心设计）
 * 上限防「无敌无聊」，下限防「围猎卡死」
 */

import { RELIC_CONFIG, SPAWN_CONFIG } from '../constants.js';
import { getEnemyType, pickEnemyType, RELIC_HUNTER_TYPES } from '../config/enemies.js';
import { RELICS } from '../config/relics.js';
import { linkBond } from './bonds.js';
import { createEnemy } from './entities.js';
import { spawnItem } from './items.js';
import { findContestedHolder, findRelicHolder, hasLooseRelic } from './relics.js';
import { canBeat, refreshEntityBaseStats } from './stats.js';
import { distanceBetween, randomInt, randomRange } from './utils.js';

export class SpawnSystem {
  constructor() {
    this.reset();
  }

  /** 重置全部计时器与压力统计 */
  reset() {
    this.batchTimer = 1.5;
    this.bossTimer = SPAWN_CONFIG.BOSS_INTERVAL;
    this.itemTimer = 5;
    this.beatableTimer = 2;
    this.killTimes = [];
    this.dangerEvents = [];
    this.pressureUp = 0;
    this.pressureDown = 0;
    this.lastKillTime = 0;
    this.lastLowHpEventAt = -999;
    this.pendingExtraUp = 0;
    this.bossCount = 0;
    // 噩梦模式：一击秒杀的动态施压（overkillBonus 会同时抬高区间两端）
    this.overkillBonus = 0;
    this.overkillLowKills = 0;
    this.overkillHighKills = 0;
    this.lastOverkillAt = -999;
    this.xiexunTimer = RELIC_CONFIG.XIEXUN_FIRST_DELAY;
    this.huntTimer = RELIC_CONFIG.HUNT_FIRST_DELAY;
    this.huntActive = false;
  }

  /**
   * 记录一次击杀（用于压力调节）
   * @param {Number} time 当前世界时间
   */
  registerKill(time) {
    this.killTimes.push(time);
    this.lastKillTime = time;
  }

  /**
   * 记录一次濒死事件（用于压力调节）
   * @param {Number} time 当前世界时间
   */
  registerLowHp(time) {
    if (time - this.lastLowHpEventAt < SPAWN_CONFIG.LOW_HP_EVENT_COOLDOWN) {
      return;
    }
    this.lastLowHpEventAt = time;
    this.dangerEvents.push(time);
  }

  /** 清理 30 秒窗口外的历史记录 */
  pruneHistory(time) {
    const windowStart = time - SPAWN_CONFIG.PRESSURE_WINDOW;
    this.killTimes = this.killTimes.filter((stamp) => stamp >= windowStart);
    this.dangerEvents = this.dangerEvents.filter((stamp) => stamp >= windowStart);
  }

  /** 场上敌人上限 */
  getEnemyCap(world) {
    return Math.min(
      SPAWN_CONFIG.ENEMY_CAP_MAX,
      SPAWN_CONFIG.ENEMY_CAP_BASE + world.player.level * SPAWN_CONFIG.ENEMY_CAP_PER_LEVEL,
    );
  }

  /**
   * 噩梦模式：一击打掉目标 2/3 以上气血时，按「被秒的是区间哪一端」抬高刷新等级
   * - 最低级敌人被秒：地图整体偏低 → 小幅上调
   * - 最高级敌人被秒：整张地图都太软 → 大幅上调
   * 两种都不提示玩家，只有调试台能看到区间变化
   * @param {Object} world 世界实例
   * @param {Object} victim 被击杀的敌人
   * @param {Number} hitDamage 致死一击的实际伤害
   */
  registerOverkill(world, victim, hitDamage) {
    if (!world.nightmare || !victim || victim.isCompanion || victim.isMinion) {
      return;
    }
    if (!(hitDamage > 0) || victim.maxHp <= 0) {
      return;
    }
    if (hitDamage / victim.maxHp < SPAWN_CONFIG.OVERKILL_HIT_RATIO) {
      return;
    }
    const range = this.calcSpawnRange(world);
    const atLow = victim.level <= range.minLevel + 0.5;
    const atHigh = victim.level >= range.maxLevel - 0.5;
    if (!atLow && !atHigh) {
      return;
    }
    // 噩梦 N：每一次一击秒杀抬升 N 倍的动态压力（step 与封顶均 ×N），噩梦 1 = 原行为
    const level = world.nightmareLevel || 1;
    const step = (atHigh ? SPAWN_CONFIG.OVERKILL_STEP_HIGH : SPAWN_CONFIG.OVERKILL_STEP_LOW) * level;
    const cap = SPAWN_CONFIG.OVERKILL_CAP * level;
    this.overkillBonus = Math.min(cap, this.overkillBonus + step);
    if (atHigh) {
      this.overkillHighKills += 1;
    } else {
      this.overkillLowKills += 1;
    }
    this.lastOverkillAt = world.time;
  }

  /** 长时间没有再秒人，压力缓慢回落，避免一直卡在封顶难度 */
  decayOverkill(world, deltaTime) {
    if (this.overkillBonus <= 0) {
      return;
    }
    if (world.time - this.lastOverkillAt < SPAWN_CONFIG.OVERKILL_IDLE_BEFORE_DECAY) {
      return;
    }
    this.overkillBonus = Math.max(0, this.overkillBonus - SPAWN_CONFIG.OVERKILL_DECAY_PER_SECOND * deltaTime);
  }

  /**
   * 调试台用：默认区间（只含时间漂移）与当前实际区间、以及各自的调整量
   * @param {Object} world 世界实例
   * @returns {Object} 区间描述
   */
  describeRange(world) {
    const level = world.player.level;
    const drift = Math.min(SPAWN_CONFIG.DRIFT_CAP, Math.floor(world.time / SPAWN_CONFIG.DRIFT_STEP_SECONDS));
    const baseMin = Math.max(1, level + SPAWN_CONFIG.BASE_MIN_OFFSET - drift);
    const baseMax = level + SPAWN_CONFIG.BASE_MAX_OFFSET + drift;
    const range = this.calcSpawnRange(world);
    const nightmareScale = world.nightmareLevel || 1;
    return {
      nightmare: Boolean(world.nightmare),
      nightmareLevel: world.nightmareLevel || 0,
      level,
      drift,
      baseMin,
      baseMax,
      min: Math.round(range.minLevel),
      max: Math.round(range.maxLevel),
      minDelta: Math.round(range.minLevel) - baseMin,
      maxDelta: Math.round(range.maxLevel) - baseMax,
      overkillBonus: Math.round(this.overkillBonus * 10) / 10,
      overkillLowKills: this.overkillLowKills,
      overkillHighKills: this.overkillHighKills,
      // 当前噩梦难度下，单次一击秒杀的抬升量与封顶（调试台展示用）
      overkillStepLow: Math.round(SPAWN_CONFIG.OVERKILL_STEP_LOW * nightmareScale * 10) / 10,
      overkillStepHigh: Math.round(SPAWN_CONFIG.OVERKILL_STEP_HIGH * nightmareScale * 10) / 10,
      overkillCap: Math.round(SPAWN_CONFIG.OVERKILL_CAP * nightmareScale * 10) / 10,
      killPressure: this.pressureUp,
      dangerPressure: this.pressureDown,
      averagePressure: this.pendingExtraUp,
    };
  }

  /**
   * 计算当前刷新等级区间（含时间漂移与压力调节）
   * @param {Object} world 世界实例
   * @returns {{ minLevel: Number, maxLevel: Number }} 等级区间
   */
  calcSpawnRange(world) {
    const level = world.player.level;
    const drift = Math.min(SPAWN_CONFIG.DRIFT_CAP, Math.floor(world.time / SPAWN_CONFIG.DRIFT_STEP_SECONDS));
    // 噩梦模式的「一击秒杀」压力：同时抬高两端，弱敌不再无限刷
    const overkill = world.nightmare ? this.overkillBonus : 0;
    let minLevel = level + SPAWN_CONFIG.BASE_MIN_OFFSET - drift + this.pressureDown + overkill;
    let maxLevel = level + SPAWN_CONFIG.BASE_MAX_OFFSET + drift + this.pressureUp + this.pendingExtraUp + overkill;
    minLevel = Math.max(1, minLevel);
    if (maxLevel - minLevel < SPAWN_CONFIG.MIN_SPREAD) {
      maxLevel = minLevel + SPAWN_CONFIG.MIN_SPREAD;
    }
    if (maxLevel - minLevel > SPAWN_CONFIG.MAX_SPREAD) {
      // 收窄低端而不是砍掉高端，保证「总有人比你强」
      minLevel = Math.max(1, maxLevel - SPAWN_CONFIG.MAX_SPREAD);
    }
    return { minLevel, maxLevel };
  }

  /**
   * 在玩家屏幕外的环带取一个刷新点
   * @param {Object} world 世界实例
   * @param {Number} radiusMin 距玩家的最小距离
   * @param {Number} radiusMax 距玩家的最大距离
   * @returns {{ x: Number, y: Number }} 世界坐标
   */
  findSpawnPosition(world, radiusMin, radiusMax) {
    const offscreenRadius = Math.hypot(world.viewWidth, world.viewHeight) / 2;
    const minRadius = Math.max(offscreenRadius + radiusMin, radiusMin);
    const maxRadius = Math.max(minRadius + 40, offscreenRadius + radiusMax);
    const angle = Math.random() * Math.PI * 2;
    const radius = randomRange(minRadius, maxRadius);
    return {
      x: world.player.x + Math.cos(angle) * radius,
      y: world.player.y + Math.sin(angle) * radius,
    };
  }

  /**
   * 生成一只敌人
   * @param {Object} world 世界实例
   * @param {Number} level 等级
   * @param {Object} options { typeId, radiusMin, radiusMax, isMinion, ownerId }
   * @returns {Object} 敌人实体
   */
  spawnEnemyAt(world, level, options = {}) {
    const type = options.typeId ? getEnemyType(options.typeId) : pickEnemyType(level);
    const radiusMin = options.radiusMin === undefined ? SPAWN_CONFIG.RING_MIN : options.radiusMin;
    const radiusMax = options.radiusMax === undefined ? SPAWN_CONFIG.RING_MAX : options.radiusMax;
    const position = this.findSpawnPosition(world, radiusMin, radiusMax);
    const enemy = createEnemy(type.id, level, position.x, position.y, {
      isMinion: options.isMinion,
      ownerId: options.ownerId,
    });
    world.addEnemy(enemy);
    return enemy;
  }

  /** 区间内加权随机（低等级概率更高） */
  pickLevelInRange(range) {
    const span = range.maxLevel - range.minLevel + 1;
    const ratio = Math.pow(Math.random(), 1.7);
    return range.minLevel + Math.floor(ratio * span);
  }

  /** 场上敌人平均等级比玩家低 4 级以上时，下一批抬高端 */
  updatePressureByAverage(world) {
    const alive = world.enemies.filter((enemy) => enemy.alive);
    if (alive.length < 4) {
      this.pendingExtraUp = 0;
      return;
    }
    const averageLevel = alive.reduce((sum, enemy) => sum + enemy.level, 0) / alive.length;
    this.pendingExtraUp = averageLevel < world.player.level - 4 ? 1 : 0;
  }

  /** 刷一批敌人 */
  spawnBatch(world) {
    const cap = this.getEnemyCap(world);
    const alive = world.enemies.filter((enemy) => enemy.alive && !enemy.isCompanion);
    const remaining = cap - alive.length;
    if (remaining <= 0) {
      return;
    }
    this.updatePressureByAverage(world);
    const count = Math.min(randomInt(SPAWN_CONFIG.BATCH_MIN, SPAWN_CONFIG.BATCH_MAX), remaining);
    const range = this.calcSpawnRange(world);
    for (let index = 0; index < count; index++) {
      this.spawnEnemyAt(world, this.pickLevelInRange(range));
    }
    // 奇遇埋下的额外敌人（丐帮长老）：小概率混进刷新批次
    const extras = world.extraEnemyTypes || [];
    if (extras.length && Math.random() < 0.28) {
      const typeId = extras[randomInt(0, extras.length - 1)];
      this.spawnEnemyAt(world, Math.max(1, world.player.level + randomInt(0, 2)), { typeId });
    }
  }

  /** 远方刷一只首领 */
  spawnBoss(world) {
    const level = world.player.level + SPAWN_CONFIG.BOSS_LEVEL_OFFSET;
    const position = this.findSpawnPosition(world, SPAWN_CONFIG.BOSS_RING_MIN, SPAWN_CONFIG.BOSS_RING_MAX);
    const boss = createEnemy('boss', level, position.x, position.y);
    world.addEnemy(boss);
    this.bossCount += 1;
    world.notify(`枭雄现世 · Lv.${level} 的枭雄正在远处游荡，掉落丰厚`, '#ff7b5a');
  }

  /** 保证玩家附近始终有「打得过」的敌人（README §17 风险对策） */
  ensureBeatable(world) {
    const player = world.player;
    const cap = this.getEnemyCap(world);
    if (world.enemies.length >= cap) {
      return;
    }
    let beatableCount = 0;
    world.enemies.forEach((enemy) => {
      if (!enemy.alive) {
        return;
      }
      const distance = distanceBetween(player.x, player.y, enemy.x, enemy.y);
      if (distance <= SPAWN_CONFIG.BEATABLE_RADIUS && canBeat(player, enemy)) {
        beatableCount += 1;
      }
    });
    if (beatableCount >= SPAWN_CONFIG.BEATABLE_MIN_COUNT) {
      return;
    }
    const level = Math.max(1, player.level - randomInt(1, 3));
    this.spawnEnemyAt(world, level, { radiusMin: 320, radiusMax: 560 });
  }

  /** 长时间无击杀且残血时的「雪中送炭」 */
  tryRescue(world) {
    const idleTime = world.time - this.lastKillTime;
    const player = world.player;
    const hpRatio = player.maxHp > 0 ? player.hp / player.maxHp : 1;
    if (idleTime < SPAWN_CONFIG.RESCUE_IDLE_SECONDS || hpRatio >= SPAWN_CONFIG.RESCUE_HP_RATIO) {
      return;
    }
    for (let index = 0; index < 2; index++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = randomRange(190, 300);
      spawnItem(world, 'expBook', player.x + Math.cos(angle) * distance, player.y + Math.sin(angle) * distance);
    }
    this.spawnEnemyAt(world, Math.max(1, player.level - 3), { radiusMin: 220, radiusMax: 300 });
    this.lastKillTime = world.time;
    world.notify('雪中送炭：附近散落两本经验书', '#7be3ff');
  }

  /** 金毛狮王谢逊：携双兵登场；双兵尽落他人之手时化为复仇形态，带张翠山一同返场 */
  spawnXieXun(world) {
    const level = world.player.level + RELIC_CONFIG.XIEXUN_LEVEL_OFFSET;
    const position = this.findSpawnPosition(world, 360, 620);
    const xiexun = createEnemy('xiexun', level, position.x, position.y);
    // 神兵唯一：已落在别人手上或散在地上的，谢逊这次就不带
    xiexun.relics = xiexun.relics.filter((relicId) => {
      return !findRelicHolder(world, relicId) && !hasLooseRelic(world, relicId);
    });
    xiexun.relics.forEach((relicId) => {
      xiexun.relicCooldowns[relicId] = 0;
    });
    const revenge = xiexun.relics.length === 0;
    if (revenge) {
      xiexun.revenge = true;
      xiexun.typeName = '谢逊·复仇';
    }
    refreshEntityBaseStats(xiexun);
    xiexun.hp = xiexun.maxHp;
    world.addEnemy(xiexun);
    world.relicsUnlocked = true;

    if (revenge) {
      const bond = RELIC_CONFIG.BOND;
      const escortLevel = Math.max(1, level + bond.ESCORT_LEVEL_OFFSET);
      const angle = Math.random() * Math.PI * 2;
      const escort = createEnemy(
        'zhangcuishan',
        escortLevel,
        position.x + Math.cos(angle) * bond.ESCORT_SPAWN_OFFSET,
        position.y + Math.sin(angle) * bond.ESCORT_SPAWN_OFFSET,
      );
      world.addEnemy(escort);
      linkBond(xiexun, escort);
      world.notify(`金毛狮王谢逊空手返场 · Lv.${level}，张翠山随行 —— 双兵已落他人之手，此来只为讨还`, '#ff7b5a');
      world.effects.addRing(escort.x, escort.y, 70, escort.accent, { life: 0.6, lineWidth: 3 });
    } else if (xiexun.relics.length === 1) {
      world.notify(`金毛狮王谢逊现世 · Lv.${level}，只携 ${RELICS[xiexun.relics[0]].name} 而来`, '#ffd166');
    } else {
      world.notify(`金毛狮王谢逊现世 · Lv.${level}，屠龙刀与倚天剑皆在其手`, '#ffd166');
    }
    world.effects.addRing(xiexun.x, xiexun.y, 120, revenge ? '#ff7b5a' : '#ffd166', { life: 0.8, lineWidth: 4 });
  }

  /** 场上是否已有谢逊 */
  hasXieXun(world) {
    return world.enemies.some((enemy) => enemy.alive && enemy.typeId === 'xiexun');
  }

  /**
   * 神兵易主时立刻催一波猎杀队（由 core/relics.js 的 grantRelic 调用）
   * @param {Object} world 世界实例
   */
  markRelicHunt(world) {
    this.huntActive = true;
    this.huntTimer = Math.min(this.huntTimer, 2.5);
  }

  /** 猎杀队：武林高手 / 大内高手，冲着持兵者去 */
  spawnHuntParty(world) {
    const holder = findContestedHolder(world);
    if (!holder) {
      this.huntActive = false;
      return;
    }
    const alive = world.enemies.filter((enemy) => enemy.alive);
    const hunters = alive.filter((enemy) => enemy.huntRelic).length;
    const remaining = RELIC_CONFIG.HUNT_MAX_ALIVE - hunters;
    if (remaining <= 0) {
      return;
    }
    const count = Math.min(randomInt(RELIC_CONFIG.HUNT_BATCH_MIN, RELIC_CONFIG.HUNT_BATCH_MAX), remaining);
    for (let index = 0; index < count; index++) {
      const type = RELIC_HUNTER_TYPES[randomInt(0, RELIC_HUNTER_TYPES.length - 1)];
      const level = Math.max(
        1,
        Math.max(world.player.level, holder.level) + randomInt(RELIC_CONFIG.HUNT_LEVEL_OFFSET_MIN, RELIC_CONFIG.HUNT_LEVEL_OFFSET_MAX),
      );
      const angle = Math.random() * Math.PI * 2;
      const radius = randomRange(RELIC_CONFIG.HUNT_SPAWN_RADIUS_MIN, RELIC_CONFIG.HUNT_SPAWN_RADIUS_MAX);
      const enemy = createEnemy(type.id, level, holder.x + Math.cos(angle) * radius, holder.y + Math.sin(angle) * radius);
      world.addEnemy(enemy);
      world.effects.addRing(enemy.x, enemy.y, 60, enemy.accent, { life: 0.5, lineWidth: 2 });
    }
    const target = holder.isPlayer ? '你' : holder.typeName;
    world.notify(`${target}身怀神兵，武林高手与大内高手闻风而来`, '#ff7b5a');
  }

  /** 定时刷新道具 */
  spawnItems(world) {
    if (world.items.length >= 28) {
      return;
    }
    const count = randomInt(1, 2);
    for (let index = 0; index < count; index++) {
      spawnItemAroundPlayer(world);
    }
  }

  /**
   * 每帧推进刷新计时
   * @param {Object} world 世界实例
   * @param {Number} deltaTime 帧间隔
   */
  update(world, deltaTime) {
    this.batchTimer -= deltaTime;
    this.bossTimer -= deltaTime;
    this.itemTimer -= deltaTime;
    this.beatableTimer -= deltaTime;
    this.pruneHistory(world.time);

    const killsInWindow = this.killTimes.length;
    this.pressureUp = killsInWindow > SPAWN_CONFIG.PRESSURE_KILL_COUNT ? 1 : 0;
    this.pressureDown = this.dangerEvents.length >= SPAWN_CONFIG.PRESSURE_DANGER_EVENTS ? -1 : 0;
    this.decayOverkill(world, deltaTime);

    if (this.batchTimer <= 0) {
      this.batchTimer = randomRange(SPAWN_CONFIG.BATCH_INTERVAL_MIN, SPAWN_CONFIG.BATCH_INTERVAL_MAX);
      this.spawnBatch(world);
    }
    if (this.itemTimer <= 0) {
      this.itemTimer = randomRange(10, 16);
      this.spawnItems(world);
    }
    if (this.beatableTimer <= 0) {
      this.beatableTimer = SPAWN_CONFIG.BEATABLE_CHECK_INTERVAL;
      this.ensureBeatable(world);
    }
    if (this.bossTimer <= 0) {
      this.bossTimer = SPAWN_CONFIG.BOSS_INTERVAL;
      this.spawnBoss(world);
    }

    // 谢逊：到点携双兵登场，死了就等下一轮
    this.xiexunTimer -= deltaTime;
    if (this.xiexunTimer <= 0) {
      this.xiexunTimer = RELIC_CONFIG.XIEXUN_RESPAWN_DELAY;
      if (!this.hasXieXun(world)) {
        this.spawnXieXun(world);
      }
    }

    // 猎杀队：只要神兵落在非谢逊角色手里就持续派兵
    const holder = findContestedHolder(world);
    if (!holder) {
      this.huntActive = false;
      this.huntTimer = RELIC_CONFIG.HUNT_FIRST_DELAY;
    } else {
      this.huntTimer -= deltaTime;
      if (this.huntTimer <= 0) {
        this.huntTimer = randomRange(RELIC_CONFIG.HUNT_INTERVAL_MIN, RELIC_CONFIG.HUNT_INTERVAL_MAX);
        this.huntActive = false;
        this.spawnHuntParty(world);
      }
    }

    this.tryRescue(world);
  }
}

/** 在玩家屏幕外散落一个随机道具 */
const spawnItemAroundPlayer = (world) => {
  const offscreenRadius = Math.hypot(world.viewWidth, world.viewHeight) / 2;
  const angle = Math.random() * Math.PI * 2;
  const distance = randomRange(offscreenRadius + 120, offscreenRadius + 380);
  const itemIds = ['expBook', 'expBook', 'heal', 'expBook', 'shield', 'speed', 'greatPill'];
  const itemId = itemIds[randomInt(0, itemIds.length - 1)];
  spawnItem(world, itemId, world.player.x + Math.cos(angle) * distance, world.player.y + Math.sin(angle) * distance);
};
