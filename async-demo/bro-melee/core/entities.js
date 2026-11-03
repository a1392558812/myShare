/**
 * 实体工厂：玩家 / 敌人 / 道具 / 投射物
 * 只负责「造对象」，属性成长与技能加成分别在 core/stats.js 处理
 */

import { BALANCE, AI_CONFIG } from '../constants.js';
import { getEnemyType } from '../config/enemies.js';
import { getItemType } from '../config/items.js';
import { ENEMY_SKILLS, rollEnemySkills } from '../config/enemySkills.js';
import { getRelic } from '../config/relics.js';
import { createEmptyPassive, refreshEntityBaseStats } from './stats.js';
import { randomRange } from './utils.js';

let entityIdSequence = 0;

/** 掉落神兵的存在时间（比普通道具长得多，避免宝物莫名消失） */
export const RELIC_ITEM_LIFE = 300;

const nextEntityId = () => {
  entityIdSequence += 1;
  return entityIdSequence;
};

/** 重置实体 id 计数（重开一局时调用） */
export const resetEntityIds = () => {
  entityIdSequence = 0;
};

/**
 * 创建玩家
 * @param {Number} level 初始等级
 * @returns {Object} 玩家实体
 */
export const createPlayer = (level = 1) => {
  const id = nextEntityId();
  const player = {
    id,
    kind: 'player',
    isPlayer: true,
    isBoss: false,
    alive: true,
    faction: `player-${id}`,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    knockbackX: 0,
    knockbackY: 0,
    level,
    exp: 0,
    kills: 0,
    baseMaxHp: BALANCE.PLAYER.maxHp,
    baseAttack: BALANCE.PLAYER.attack,
    baseDefense: BALANCE.PLAYER.defense,
    baseSpeed: BALANCE.PLAYER.speed,
    baseRadius: BALANCE.PLAYER.radius,
    hp: BALANCE.PLAYER.maxHp,
    maxHp: BALANCE.PLAYER.maxHp,
    attack: BALANCE.PLAYER.attack,
    defense: BALANCE.PLAYER.defense,
    speed: BALANCE.PLAYER.speed,
    radius: BALANCE.PLAYER.radius,
    critRate: BALANCE.PLAYER.critRate,
    facing: 0,
    aimAngle: 0,
    attackCooldown: 0,
    attackInterval: BALANCE.PLAYER.attackInterval,
    meleeMultiplier: BALANCE.PLAYER.attackMultiplier,
    attackRange: BALANCE.PLAYER.attackRange,
    dashCooldownTimer: 0,
    dashTimer: 0,
    dashVelocityX: 0,
    dashVelocityY: 0,
    invulnerableTimer: 0,
    shield: 0,
    shieldTimer: 0,
    speedBoostTimer: 0,
    speedBoostMultiplier: 1,
    slowTimer: 0,
    slowMultiplier: 1,
    regenTimer: 0,
    stunTimer: 0,
    hitFlash: 0,
    levelUpFlash: 0,
    shieldCycleTimer: 0,
    walkPhase: 0,
    moveAmount: 0,
    animSeed: Math.random() * Math.PI * 2,
    attackAnimTimer: 0,
    attackAnimDuration: 0,
    attackAnimAngle: 0,
    castAnimTimer: 0,
    castAnimDuration: 0,
    skillStacks: {},
    activeSkillIds: [],
    skillCooldowns: {},
    relics: [],
    relicCooldowns: {},
    buffs: [],
    treasures: [],
    masterPlan: null,
    expMultiplier: 1,
    // 最近一次打中的敌人：随从据此集火
    focusTargetId: null,
    focusTargetTime: -99,
    passive: {
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
    },
  };
  refreshEntityBaseStats(player);
  return player;
};

/**
 * 创建敌人
 * @param {String} typeId 类型 id（见 config/enemies.js）
 * @param {Number} level 等级
 * @param {Number} x 世界坐标
 * @param {Number} y 世界坐标
 * @param {Object} options { isMinion, ownerId }
 * @returns {Object} 敌人实体
 */
export const createEnemy = (typeId, level, x, y, options = {}) => {
  const type = getEnemyType(typeId);
  const id = nextEntityId();
  const enemyLevel = Math.max(1, Math.round(level));
  // 等级越高出招越快（最低 62% 冷却），让高等级敌人真的有压迫感
  const cooldownScale = type.isBoss ? 0.88 : Math.max(0.7, 1 - enemyLevel * 0.005);
  const enemy = {
    id,
    kind: 'enemy',
    isPlayer: false,
    isBoss: type.isBoss,
    isMinion: Boolean(options.isMinion),
    isCompanion: Boolean(type.isCompanion),
    companionOwner: null,
    guardFatal: false,
    expMultiplier: 1,
    ownerId: options.ownerId || null,
    alive: true,
    faction: `enemy-${id}`,
    typeId: type.id,
    typeName: type.name,
    color: type.color,
    accent: type.accent,
    x,
    y,
    vx: 0,
    vy: 0,
    knockbackX: 0,
    knockbackY: 0,
    level: enemyLevel,
    exp: 0,
    kills: 0,
    baseMaxHp: Math.round(BALANCE.ENEMY_BASE.maxHp * type.hpMultiplier),
    baseAttack: BALANCE.ENEMY_BASE.attack * type.attackMultiplier,
    baseDefense: BALANCE.ENEMY_BASE.defense * type.defenseMultiplier,
    baseSpeed: type.speed,
    baseRadius: type.radius,
    hp: 1,
    maxHp: 1,
    attack: 1,
    defense: 1,
    speed: type.speed,
    radius: type.radius,
    critRate: 0.04,
    facing: randomRange(-Math.PI, Math.PI),
    meleeCooldown: randomRange(0, type.attackInterval),
    meleeInterval: type.attackInterval,
    meleeMultiplier: type.meleeMultiplier,
    baseMeleeMultiplier: type.meleeMultiplier,
    relics: type.relicOwner ? type.relicOwner.slice() : [],
    relicCooldowns: {},
    relicIntent: null,
    relicDropTimer: 0,
    snipe: false,
    huntRelic: Boolean(type.relicHunter),
    revenge: false,
    bondId: null,
    bondRole: null,
    bondBuff: null,
    attackRange: type.attackRange,
    stunTimer: 0,
    hitFlash: 0,
    walkPhase: randomRange(0, Math.PI * 2),
    moveAmount: 0,
    animSeed: randomRange(0, Math.PI * 2),
    attackAnimTimer: 0,
    attackAnimDuration: 0,
    attackAnimAngle: 0,
    castAnimTimer: 0,
    castAnimDuration: 0,
    enragedTimer: 0,
    buffAttackMultiplier: 1,
    buffSpeedMultiplier: 1,
    buffDamageReduction: 0,
    slowTimer: 0,
    slowMultiplier: 1,
    vulnerableTimer: 0,
    poisonTimer: 0,
    poisonTick: 0,
    poisonDamage: 0,
    forcedHuntTimer: null,
    leavesAfterHunt: false,
    dashTimer: 0,
    dashVelocityX: 0,
    dashVelocityY: 0,
    dashHitIds: new Set(),
    aiState: 'wander',
    aiTimer: randomRange(0, AI_CONFIG.TICK),
    targetId: null,
    itemTargetId: null,
    wanderAngle: randomRange(-Math.PI, Math.PI),
    wanderTimer: randomRange(0.4, 1.4),
    viewRadius: type.isBoss ? AI_CONFIG.BOSS_VIEW_RADIUS : AI_CONFIG.VIEW_RADIUS,
    wantsAttack: false,
    pendingSkillId: null,
    skills: rollEnemySkills(type, enemyLevel).map((skillId) => {
      const skillConfig = ENEMY_SKILLS[skillId];
      const cooldown = skillConfig ? skillConfig.cooldown * cooldownScale : 6;
      return {
        id: skillId,
        cooldown,
        cooldownLeft: randomRange(0, cooldown * 0.6),
      };
    }),
    dropBonus: type.dropBonus,
    // 会自修武功的随从（如小师妹）：自己攒秘籍层数，火候比玩家浅
    learnsManuals: Boolean(type.learnsManuals),
    manuals: {},
    manualCooldowns: {},
    manualEarned: 0,
  };
  refreshEntityBaseStats(enemy);
  enemy.hp = enemy.maxHp;
  if (enemy.learnsManuals) {
    enemy.passive = createEmptyPassive();
  }
  return enemy;
};

/**
 * 创建道具
 * @param {String} itemId 道具 id（见 config/items.js）
 * @param {Number} x 世界坐标
 * @param {Number} y 世界坐标
 * @returns {Object} 道具实体
 */
export const createItem = (itemId, x, y) => {
  const type = getItemType(itemId);
  return {
    id: nextEntityId(),
    kind: 'item',
    itemId: type.id,
    name: type.name,
    color: type.color,
    alive: true,
    x,
    y,
    radius: type.radius,
    phase: randomRange(0, Math.PI * 2),
    dropImmuneId: -1,
    dropImmuneTimer: 0,
    life: BALANCE.ITEM.expireTime,
    bobOffset: randomRange(0, Math.PI * 2),
  };
};

/**
 * 创建掉落的神兵（不走普通道具配置表，寿命长、体积大）
 * @param {String} relicId 神兵 id
 * @param {Number} x 世界坐标
 * @param {Number} y 世界坐标
 * @returns {Object} 神兵实体
 */
export const createRelicItem = (relicId, x, y) => {
  const relic = getRelic(relicId);
  return {
    id: nextEntityId(),
    kind: 'item',
    itemId: relic ? relic.id : relicId,
    isRelic: true,
    name: relic ? relic.name : '神兵',
    color: relic ? relic.color : '#ffd166',
    glow: relic ? relic.glow : '#fff2c0',
    alive: true,
    x,
    y,
    radius: 15,
    phase: randomRange(0, Math.PI * 2),
    dropImmuneId: -1,
    dropImmuneTimer: 0,
    life: RELIC_ITEM_LIFE,
    bobOffset: randomRange(0, Math.PI * 2),
  };
};

/** 投射物默认字段（用于对象池重置） */
const createEmptyProjectile = () => {
  return {
    id: 0,
    kind: 'projectile',
    alive: true,
    ownerId: 0,
    ownerIsPlayer: false,
    style: 'orb',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 8,
    angle: 0,
    life: 1,
    maxLife: 1,
    pierce: 0,
    attack: 1,
    level: 1,
    critRate: 0,
    multiplier: 1,
    color: '#ffffff',
    homing: 0,
    slowAmount: 0,
    slowDuration: 0,
    hitIds: new Set(),
  };
};

/**
 * 重置并填充一枚投射物（配合 ObjectPool 复用，避免 GC 抖动）
 * @param {Object} projectile 复用的投射物
 * @param {Object} options 各项参数
 * @returns {Object} 投射物
 */
export const resetProjectile = (projectile, options) => {
  projectile.id = nextEntityId();
  projectile.alive = true;
  projectile.ownerId = options.ownerId;
  projectile.ownerIsPlayer = Boolean(options.ownerIsPlayer);
  projectile.style = options.style || 'orb';
  projectile.x = options.x;
  projectile.y = options.y;
  projectile.vx = options.vx;
  projectile.vy = options.vy;
  projectile.radius = options.radius || 8;
  projectile.angle = Math.atan2(options.vy, options.vx);
  projectile.life = options.life || 1;
  projectile.maxLife = projectile.life;
  projectile.pierce = options.pierce || 0;
  projectile.attack = options.attack;
  projectile.level = options.level;
  projectile.critRate = options.critRate || 0;
  projectile.multiplier = options.multiplier || 1;
  projectile.color = options.color || '#ffffff';
  projectile.homing = options.homing || 0;
  projectile.slowAmount = options.slowAmount || 0;
  projectile.slowDuration = options.slowDuration || 0;
  projectile.hitIds.clear();
  return projectile;
};

/** 创建空投射物（对象池工厂） */
export const createProjectile = () => {
  return createEmptyProjectile();
};
