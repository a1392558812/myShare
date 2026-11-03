/**
 * 调试工具（` 键面板与自动化测试共用）
 * 只做「改状态 + 刷新 HUD」，不复制任何战斗逻辑
 */

import { BALANCE } from '../constants.js';
import { getEnemyType } from '../config/enemies.js';
import { PLAYER_SKILLS, getSkillById } from '../config/skills.js';
import { RELIC_IDS } from '../config/relics.js';
import { ENCOUNTERS } from '../config/encounters.js';
import { TREASURES } from '../config/treasures.js';
import { healEntity, killEntity } from './combat.js';
import {
  companionManualSummary,
  enforceCompanionOath,
  grantCompanionManuals,
  learningCompanions,
} from './companions.js';
import {
  addBuff as addBuffTo,
  addTreasure as addTreasureTo,
  openEncounter,
  removeTreasure as removeTreasureFrom,
  resetEncounterState,
  resolveEncounter,
  spawnCompanion as spawnCompanionTo,
  spawnEncounterToken,
  startChannel,
} from './encounters.js';
import { createEnemy } from './entities.js';
import { dropRelic as dropRelicFrom, grantRelic as grantRelicTo, spawnRelicItem } from './relics.js';
import { MAX_LEVEL, recalculatePlayerStats, refreshEntityBaseStats } from './stats.js';
import { triggerTaunt } from './taunts.js';
import { clamp, randomRange } from './utils.js';

/** 把学习记录同步到结算面板 */
const syncLearned = (world) => {
  const player = world.player;
  world.stats.learnedSkills = Object.keys(player.skillStacks).map((skillId) => {
    const skill = getSkillById(skillId);
    return { name: skill ? skill.name : skillId, stack: player.skillStacks[skillId] };
  });
};

/**
 * 直接设定秘籍层数（0 表示遗忘）
 * @param {Object} world 世界实例
 * @param {String} skillId 秘籍 id
 * @param {Number} stack 目标层数
 * @param {Boolean} silent 是否静默（不弹提示）
 * @returns {Boolean} 是否改动
 */
export const setSkillStack = (world, skillId, stack, silent = false) => {
  const skill = getSkillById(skillId);
  if (!skill) {
    return false;
  }
  const player = world.player;
  const nextStack = clamp(Math.round(stack), 0, skill.maxStack);
  if ((player.skillStacks[skillId] || 0) === nextStack) {
    return false;
  }
  if (nextStack <= 0) {
    delete player.skillStacks[skillId];
  } else {
    player.skillStacks[skillId] = nextStack;
  }
  if (skill.type === 'active') {
    const hasSkill = player.activeSkillIds.includes(skillId);
    if (nextStack > 0 && !hasSkill) {
      player.activeSkillIds.push(skillId);
      player.skillCooldowns[skillId] = 0;
    } else if (nextStack <= 0 && hasSkill) {
      player.activeSkillIds = player.activeSkillIds.filter((id) => id !== skillId);
      delete player.skillCooldowns[skillId];
    }
  }
  recalculatePlayerStats(player);
  syncLearned(world);
  if (!silent) {
    const label = nextStack <= 0 ? '遗忘' : nextStack === 1 ? '习得' : '修炼';
    world.effects.addText(player.x, player.y - player.radius - 26, `${label} ${skill.name} ×${nextStack}`, {
      color: skill.color,
      size: 15,
    });
  }
  // 调试台也能直接练出葵花宝典：随从的反应要跟奇遇里一致
  if (nextStack > 0) {
    enforceCompanionOath(world);
  }
  world.pushHud(true);
  return true;
};

/** 在当前层数上增减（面板 +/- 按钮） */
export const addSkillStack = (world, skillId, delta) => {
  const current = world.player.skillStacks[skillId] || 0;
  return setSkillStack(world, skillId, current + delta);
};

/** 遗忘全部秘籍 */
export const clearSkills = (world) => {
  PLAYER_SKILLS.forEach((skill) => {
    setSkillStack(world, skill.id, 0, true);
  });
  world.pushHud(true);
};

/** 全部秘籍拉满层数 */
export const maxAllSkills = (world) => {
  PLAYER_SKILLS.forEach((skill) => {
    setSkillStack(world, skill.id, skill.maxStack, true);
  });
  // 秘籍表里有随从忌讳的那本（葵花宝典），在队的当场下山
  enforceCompanionOath(world);
  world.pushHud(true);
};

/**
 * 统一设置冷却：0 = 全部就绪，>0 = 全部进入冷却
 * @param {Object} world 世界实例
 * @param {Number} seconds 冷却秒数
 */
export const setAllCooldowns = (world, seconds = 0) => {
  const player = world.player;
  Object.keys(player.skillCooldowns).forEach((skillId) => {
    player.skillCooldowns[skillId] = Math.max(0, seconds);
  });
  player.attackCooldown = 0;
  if (seconds <= 0) {
    player.dashCooldownTimer = 0;
  }
  world.pushHud(true);
};

/** 单个技能冷却 */
export const setSkillCooldown = (world, skillId, seconds) => {
  if (!(skillId in world.player.skillCooldowns)) {
    return;
  }
  world.player.skillCooldowns[skillId] = Math.max(0, seconds);
  world.pushHud(true);
};

/** 冲刺冷却清零 */
export const resetDash = (world) => {
  world.player.dashCooldownTimer = 0;
  world.player.attackCooldown = 0;
  world.pushHud(true);
};

/* ------------------------------------------------------------------ */
/* Buff / 状态                                                          */
/* ------------------------------------------------------------------ */

/** 施加护盾（999 秒不过期，直到被打碎或手动清除） */
export const applyShield = (world, amount) => {
  const player = world.player;
  player.shield = Math.max(0, Math.round(amount));
  player.shieldTimer = player.shield > 0 ? 999 : 0;
  if (player.shield > 0) {
    world.effects.addRing(player.x, player.y, player.radius + 14, '#9ad8ff', { life: 0.4, lineWidth: 3 });
  }
  world.pushHud(true);
};

/** 施加/取消无敌 */
export const applyInvincible = (world, seconds) => {
  world.player.invulnerableTimer = Math.max(0, seconds);
  world.pushHud(true);
};

/** 加速 buff */
export const applyHaste = (world, multiplier, seconds) => {
  const player = world.player;
  player.speedBoostMultiplier = Math.max(1, multiplier);
  player.speedBoostTimer = Math.max(0, seconds);
  world.pushHud(true);
};

/** 减速 debuff */
export const applySlow = (world, multiplier, seconds) => {
  const player = world.player;
  player.slowMultiplier = clamp(multiplier, 0.2, 1);
  player.slowTimer = Math.max(0, seconds);
  world.pushHud(true);
};

/** 点穴（无法行动与出招） */
export const applyStun = (world, seconds) => {
  world.player.stunTimer = Math.max(0, seconds);
  world.pushHud(true);
};

/** 清空所有临时状态（护盾/无敌/加速/减速/点穴/受击闪烁） */
export const clearBuffs = (world) => {
  const player = world.player;
  player.shield = 0;
  player.shieldTimer = 0;
  player.shieldCycleTimer = 0;
  player.invulnerableTimer = 0;
  player.speedBoostTimer = 0;
  player.speedBoostMultiplier = 1;
  player.slowTimer = 0;
  player.slowMultiplier = 1;
  player.stunTimer = 0;
  player.hitFlash = 0;
  player.levelUpFlash = 0;
  player.attackCooldown = 0;
  world.pushHud(true);
};

/** 设置气血百分比（0~1） */
export const setHpRatio = (world, ratio) => {
  const player = world.player;
  player.hp = clamp(ratio, 0.01, 1) * player.maxHp;
  world.pushHud(true);
};

/** 回满气血 */
export const healFull = (world) => {
  healEntity(world.player, world.player.maxHp, world, false);
  world.pushHud(true);
};

/**
 * 设定境界等级（不触发秘籍三选一）
 * @param {Object} world 世界实例
 * @param {Number} level 目标等级
 */
export const setLevel = (world, level) => {
  const player = world.player;
  player.level = clamp(Math.round(level), 1, MAX_LEVEL);
  player.exp = 0;
  recalculatePlayerStats(player);
  player.hp = player.maxHp;
  world.skillChoiceCount = Math.floor(player.level / BALANCE.SKILL_EVERY_LEVELS);
  world.skillChoiceQueue = 0;
  world.effects.addLevelUp(player.x, player.y, player.radius * 2.8);
  world.pushHud(true);
};

/**
 * 修改玩家基础属性（攻击/防御/移速/气血上限）
 * @param {Object} world 世界实例
 * @param {String} key baseAttack | baseDefense | baseSpeed | baseMaxHp
 * @param {Number} value 数值
 */
export const setBaseStat = (world, key, value) => {
  const player = world.player;
  if (!(key in player)) {
    return;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return;
  }
  player[key] = numeric;
  recalculatePlayerStats(player);
  player.hp = Math.min(player.maxHp, Math.max(player.hp, player.maxHp * 0.999));
  world.pushHud(true);
};

/* ------------------------------------------------------------------ */
/* 敌人                                                                */
/* ------------------------------------------------------------------ */

/**
 * 在玩家身边刷敌人（测试用，直接落在视野内）
 * @param {Object} world 世界实例
 * @param {Object} options { typeId, level, count, radiusMin, radiusMax }
 * @returns {Array} 生成的敌人
 */
export const spawnEnemies = (world, options = {}) => {
  const type = getEnemyType(options.typeId || 'wolf');
  const level = clamp(Math.round(options.level === undefined ? world.player.level : options.level), 1, MAX_LEVEL);
  const count = clamp(Math.round(options.count === undefined ? 3 : options.count), 1, 30);
  const radiusMin = options.radiusMin === undefined ? 150 : options.radiusMin;
  const radiusMax = options.radiusMax === undefined ? 320 : options.radiusMax;
  const created = [];
  for (let index = 0; index < count; index++) {
    const angle = (Math.PI * 2 * index) / count + randomRange(-0.2, 0.2);
    const distance = randomRange(radiusMin, radiusMax);
    const enemy = createEnemy(
      type.id,
      level,
      world.player.x + Math.cos(angle) * distance,
      world.player.y + Math.sin(angle) * distance,
    );
    world.addEnemy(enemy);
    world.effects.addRing(enemy.x, enemy.y, enemy.radius * 2, type.accent, { life: 0.4, lineWidth: 2 });
    created.push(enemy);
  }
  world.refreshHash();
  world.notify(`刷出 ${count} 只 ${type.name} · Lv.${level}`, type.accent);
  world.pushHud(true);
  return created;
};

/**
 * 清场
 * @param {Object} world 世界实例
 * @param {Boolean} grantExp 是否算作玩家击杀（给经验与掉落）
 */
export const clearEnemies = (world, grantExp = false) => {
  const list = world.enemies.slice();
  if (grantExp) {
    list.forEach((enemy) => {
      if (enemy.alive) {
        killEntity(world, enemy, world.player);
      }
    });
  } else {
    world.enemies = [];
  }
  world.refreshHash();
  world.pushHud(true);
};

/**
 * 全场敌人升降级（保持血量百分比）
 * @param {Object} world 世界实例
 * @param {Number} delta 变化量
 */
export const adjustEnemyLevels = (world, delta) => {
  world.enemies.forEach((enemy) => {
    if (!enemy.alive) {
      return;
    }
    const ratio = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;
    enemy.level = clamp(enemy.level + delta, 1, MAX_LEVEL);
    refreshEntityBaseStats(enemy);
    enemy.hp = Math.max(1, Math.round(enemy.maxHp * ratio));
  });
  world.notify(`场上敌人等级 ${delta > 0 ? '+' : ''}${delta}`, '#ffd166');
  world.pushHud(true);
};

/** 刷一只首领 */
export const spawnBoss = (world) => {
  world.spawner.spawnBoss(world);
  world.pushHud(true);
};

/* ------------------------------------------------------------------ */
/* 神兵                                                                */
/* ------------------------------------------------------------------ */

/** 直接把某件神兵塞给玩家 */
export const grantRelic = (world, relicId) => {
  grantRelicTo(world, world.player, relicId);
  world.pushHud(true);
};

/** 玩家丢弃某件神兵 */
export const dropRelic = (world, relicId) => {
  dropRelicFrom(world, world.player, relicId);
  world.pushHud(true);
};

/** 在玩家脚下投放一件神兵 */
export const spawnRelic = (world, relicId) => {
  spawnRelicItem(world, relicId, world.player.x + 40, world.player.y + 30);
  world.pushHud(true);
};

/** 立刻安排谢逊登场 */
export const spawnXieXun = (world) => {
  world.spawner.spawnXieXun(world);
  world.pushHud(true);
};

/** 把双兵统统塞到玩家手上，逼谢逊以复仇形态带张翠山返场 */
export const spawnRevengeXieXun = (world) => {
  world.enemies.forEach((enemy) => {
    if (!enemy.relics.length) {
      return;
    }
    enemy.relics = [];
    enemy.relicCooldowns = {};
    refreshEntityBaseStats(enemy);
  });
  world.items = world.items.filter((item) => !item.isRelic);
  RELIC_IDS.forEach((relicId) => {
    if (!world.player.relics.includes(relicId)) {
      grantRelicTo(world, world.player, relicId);
    }
  });
  world.spawner.spawnXieXun(world);
  world.pushHud(true);
};

/** 立刻来一波猎杀队（无视持兵状态） */
export const spawnHunters = (world) => {
  world.spawner.spawnHuntParty(world);
  world.pushHud(true);
};

/** 解锁神兵流转（跳过谢逊登场前的封锁） */
export const unlockRelics = (world) => {
  world.relicsUnlocked = true;
  world.notify('神兵已落江湖', '#ffd166');
  world.pushHud(true);
};

/** 神兵绝学冷却清零 */
export const relicCooldownsZero = (world) => {
  Object.keys(world.player.relicCooldowns).forEach((relicId) => {
    world.player.relicCooldowns[relicId] = 0;
  });
  world.pushHud(true);
};

/* ------------------------------------------------------------------ */
/* 奇遇                                                                */
/* ------------------------------------------------------------------ */

/**
 * 在玩家脚边浮出一个奇遇标记（不强制弹面板）
 * @param {Object} world 世界实例
 * @param {String|null} encounterId 指定奇遇，空则随机
 * @returns {Object|null} 标记
 */
export const spawnEncounter = (world, encounterId) => {
  const token = spawnEncounterToken(world, encounterId || null, { radiusMin: 80, radiusMax: 120 });
  if (token) {
    world.notify(`奇遇标记：${token.name}`, token.color);
    world.pushHud(true);
  }
  return token;
};

/**
 * 立即弹出某个奇遇的抉择面板
 * @param {Object} world 世界实例
 * @param {String} encounterId 奇遇 id
 * @returns {Boolean} 是否弹出
 */
export const forceEncounter = (world, encounterId) => {
  const token = spawnEncounterToken(world, encounterId, { radiusMin: 1, radiusMax: 2 });
  return token ? openEncounter(world, token, false) : false;
};

/**
 * 不弹面板，直接结算某个奇遇的某个选项
 * @param {Object} world 世界实例
 * @param {String} encounterId 奇遇 id
 * @param {String} choiceId 选项 id
 * @returns {Object} 结算结果
 */
export const resolveEncounterNow = (world, encounterId, choiceId) => {
  const outcome = resolveEncounter(world, encounterId, choiceId);
  world.effects.addText(world.player.x, world.player.y - world.player.radius - 26, outcome.title, {
    color: outcome.color,
    size: 15,
  });
  world.pushHud(true);
  return outcome;
};

/** 塞一件奇遇宝物 */
export const grantTreasure = (world, treasureId) => {
  if (!TREASURES[treasureId]) {
    return false;
  }
  addTreasureTo(world, treasureId);
  world.notify(`获得宝物：${TREASURES[treasureId].name}`, TREASURES[treasureId].color);
  return true;
};

/** 销毁一件奇遇宝物 */
export const dropTreasure = (world, treasureId) => {
  return removeTreasureFrom(world, treasureId);
};

/** 施加一个测试用 buff */
export const grantBuff = (world, options = {}) => {
  addBuffTo(world, {
    id: options.id || 'debug-buff',
    name: options.name || '调试增益',
    icon: options.icon || '试',
    color: options.color || '#8fd0ff',
    duration: options.duration === undefined ? 30 : options.duration,
    attackMultiplier: options.attackMultiplier === undefined ? 0.2 : options.attackMultiplier,
  });
  return true;
};

/** 刷一个随从 */
export const spawnCompanion = (world, options = {}) => {
  return spawnCompanionTo(world, options.typeId || 'juniorSister', options.level || world.player.level + 1, {
    guardFatal: Boolean(options.guardFatal),
  });
};

/** 开始一段打坐（默认 10 秒，完成给太玄真意） */
export const startTestChannel = (world, seconds = 10) => {
  startChannel(world, {
    id: 'debug-channel',
    name: '调试打坐',
    duration: seconds,
    color: '#7be3ff',
    onComplete: (innerWorld) => {
      addTreasureTo(innerWorld, 'taixuanEssence');
      innerWorld.notify('调试打坐完成 · 获得太玄真意', '#7be3ff');
    },
    onInterrupt: (innerWorld) => {
      innerWorld.notify('调试打坐被打断', '#ff8a7a');
    },
  });
};

/** 清空奇遇相关状态（标记 / buff / 宝物 / 随从 / 额外敌人） */
export const clearEncounters = (world) => {
  resetEncounterState(world);
  world.enemies = world.enemies.filter((enemy) => !enemy.isCompanion);
  recalculatePlayerStats(world.player);
  world.notify('已清空奇遇状态', '#c6a86c');
  world.pushHud(true);
};

/** 让会自修的随从立刻挑一本秘籍（调试用） */
export const grantCompanionManualNow = (world, times = 1) => {
  const granted = grantCompanionManuals(world, times);
  if (!granted.length) {
    world.notify('没有会自修武功的随从', '#c6a86c');
  }
  world.pushHud(true);
  return granted;
};

/** 随从档案（调试面板摘要用） */
export const companionInfo = (world) => {
  return learningCompanions(world).map((companion) => {
    return {
      id: companion.id,
      name: companion.typeName,
      level: companion.level,
      manuals: companionManualSummary(companion),
    };
  });
};

/** 全部奇遇 id（面板下拉用） */
export const encounterIdList = () => ENCOUNTERS.map((encounter) => ({ id: encounter.id, name: encounter.name }));

/**
 * 生成调试 API（挂到 world.debugApi，供面板/冒烟脚本调用）
 * @param {Object} world 世界实例
 * @returns {Object} 绑定好 world 的方法集合
 */
export const createDebugApi = (world) => {
  return {
    setSkillStack: (skillId, stack) => setSkillStack(world, skillId, stack),
    learnSkill: (skillId) => world.learnSkill(skillId),
    addSkillStack: (skillId, delta) => addSkillStack(world, skillId, delta),
    clearSkills: () => clearSkills(world),
    maxAllSkills: () => maxAllSkills(world),
    setAllCooldowns: (seconds) => setAllCooldowns(world, seconds),
    setSkillCooldown: (skillId, seconds) => setSkillCooldown(world, skillId, seconds),
    resetDash: () => resetDash(world),
    applyShield: (amount) => applyShield(world, amount),
    applyInvincible: (seconds) => applyInvincible(world, seconds),
    applyHaste: (multiplier, seconds) => applyHaste(world, multiplier, seconds),
    applySlow: (multiplier, seconds) => applySlow(world, multiplier, seconds),
    applyStun: (seconds) => applyStun(world, seconds),
    clearBuffs: () => clearBuffs(world),
    setHpRatio: (ratio) => setHpRatio(world, ratio),
    healFull: () => healFull(world),
    setLevel: (level) => setLevel(world, level),
    setBaseStat: (key, value) => setBaseStat(world, key, value),
    spawnEnemies: (options) => spawnEnemies(world, options),
    clearEnemies: (grantExp) => clearEnemies(world, grantExp),
    adjustEnemyLevels: (delta) => adjustEnemyLevels(world, delta),
    spawnBoss: () => spawnBoss(world),
    grantRelic: (relicId) => grantRelic(world, relicId),
    dropRelic: (relicId) => dropRelic(world, relicId),
    spawnRelic: (relicId) => spawnRelic(world, relicId),
    spawnXieXun: () => spawnXieXun(world),
    spawnRevengeXieXun: () => spawnRevengeXieXun(world),
    spawnHunters: () => spawnHunters(world),
    unlockRelics: () => unlockRelics(world),
    relicCooldownsZero: () => relicCooldownsZero(world),
    spawnEncounter: (encounterId) => spawnEncounter(world, encounterId),
    forceEncounter: (encounterId) => forceEncounter(world, encounterId),
    resolveEncounterNow: (encounterId, choiceId) => resolveEncounterNow(world, encounterId, choiceId),
    grantTreasure: (treasureId) => grantTreasure(world, treasureId),
    dropTreasure: (treasureId) => dropTreasure(world, treasureId),
    grantBuff: (options) => grantBuff(world, options),
    spawnCompanion: (options) => spawnCompanion(world, options),
    startTestChannel: (seconds) => startTestChannel(world, seconds),
    clearEncounters: () => clearEncounters(world),
    grantCompanionManual: (times) => grantCompanionManualNow(world, times),
    companionInfo: () => companionInfo(world),
    tauntNow: () => triggerTaunt(world),
  };
};
