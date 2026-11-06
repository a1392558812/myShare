/**
 * 世界主循环：实体调度、输入、战斗结算、事件推送（README §2）
 * 引擎内部状态全部是普通对象，只有 HUD 快照经事件节流后进 Vue
 */

import { BALANCE, SPAWN_CONFIG, TEAMWORK_CONFIG, WORLD_CONFIG } from '../constants.js';
import { RELIC_IDS, RELICS } from '../config/relics.js';
import { TREASURES } from '../config/treasures.js';
import { getSkillById } from '../config/skills.js';
import { updateEnemyAI } from './ai.js';
import { ChunkMap } from './chunk-map.js';
import { applyDamage, meleeSwing } from './combat.js';
import {
  enforceCompanionOath,
  grantCompanionManuals,
  companionManualSummary,
  levelUpCompanions,
  updateCompanionManuals,
} from './companions.js';
import { createDebugApi } from './debug.js';
import { EffectLayer } from './effects.js';
import { createPlayer, createProjectile, resetEntityIds, resetProjectile } from './entities.js';
import { dropLoot, spawnItem, updateItems } from './items.js';
import { removeTreasure, resolveEncounter, reviveCompanionFrom, updateEncounters } from './encounters.js';
import { dropRelic, ensureRelicsExist, findContestedHolder, updateRelicCooldowns, updateRelicPossession } from './relics.js';
import { updateBonds } from './bonds.js';
import {
  acquireSkill,
  castPlayerSkill,
  castRelicSkill,
  grantSkillDirect,
  pickAutoCastSkill,
  rollSkillChoices,
  tryUseEnemySkill,
  updateEnemySkillCooldowns,
  updatePlayerSkillCooldowns,
} from './skills.js';
import { SpawnSystem } from './spawning.js';
import { SpatialHash } from './spatial-hash.js';
import { expToNext, recalculatePlayerStats } from './stats.js';
import { livingCompanions } from './companions.js';
import { clamp, distanceBetween, angleOfVector, normalizeAngle, smoothingFactor } from './utils.js';
import { ZoneLayer } from './zones.js';

const FIXED_STEP = 1 / 60;
const MAX_STEPS_PER_FRAME = 5;
const HUD_INTERVAL = 0.1;

export class BroMeleeWorld {
  /**
   * @param {Object} handlers { onHud, onSkillChoices, onGameOver, onNotice }
   */
  constructor(handlers = {}) {
    this.handlers = {
      onHud: () => {},
      onSkillChoices: () => {},
      onGameOver: () => {},
      onNotice: () => {},
      onEncounter: () => {},
      onEncounterResult: () => {},
      ...handlers,
    };
    this.viewWidth = 1280;
    this.viewHeight = 720;
    // 模式：normal 沿用原有压力曲线；nightmare 额外开启动态压力（一击秒杀抬高级区间）
    // nightmareLevel：1~NIGHTMARE_MAX_LEVEL，动态压力抬升幅度按该值缩放；普通模式为 0
    this.mode = 'normal';
    this.nightmare = false;
    this.nightmareLevel = 0;
    this.hash = new SpatialHash(128);
    this.map = new ChunkMap();
    this.spawner = new SpawnSystem();
    this.projectilePool = [];
    this.activeActors = [];
    this.accumulator = 0;
    this.reset();
  }

  /** 开一局新的（回到 1 级、清空战场） */
  reset() {
    resetEntityIds();
    this.mode = this.mode === 'nightmare' ? 'nightmare' : 'normal';
    this.nightmare = this.mode === 'nightmare';
    // 保留当前噩梦难度（「再来一局」不掉档）；普通模式归零
    this.nightmareLevel = this.nightmare ? Math.max(1, this.nightmareLevel || 1) : 0;
    this.time = 0;
    this.player = createPlayer(1);
    recalculatePlayerStats(this.player);
    this.enemies = [];
    this.items = [];
    this.projectiles = [];
    this.effects = new EffectLayer();
    this.zones = new ZoneLayer();
    this.autoCast = Boolean(this.autoCast);
    this.autoCastTimer = 0;
    this.autoCastHasSkill = false;
    // 普攻模式：melee 近战 / ranged 远程 / auto 按距离自动抉择
    this.attackMode = this.attackMode || 'auto';
    // 倒地随从快照与施救 / 传功通道
    this.fallenCompanions = this.fallenCompanions || [];
    this.reviving = null;
    this.transfer = null;
    this.camera = { x: this.player.x, y: this.player.y };
    this.hash.clear();
    this.spawner.reset();
    this.map.clear();
    this.input = {
      moveX: 0,
      moveY: 0,
      attackHeld: false,
    };
    this.player.aimX = this.player.x + 240;
    this.player.aimY = this.player.y;
    this.status = 'playing';
    this.paused = false;
    this.pendingSkillChoices = null;
    this.skillChoiceQueue = 0;
    this.skillChoiceCount = 0;
    this.hudTimer = 0;
    this.dashTrailTimer = 0;
    this.accumulator = 0;
    this.stats = {
      kills: 0,
      bossKills: 0,
      levelUps: 0,
      playTime: 0,
      learnedSkills: [],
    };
    this.deathCause = '';
    this.relicRespawnTimers = {};
    RELIC_IDS.forEach((relicId) => {
      this.relicRespawnTimers[relicId] = 12;
    });
    this.relicsUnlocked = false;
    this.bondTimer = 0;
    this.encounterTokens = [];
    this.resolvedEncounterIds = new Set();
    this.encounterTimer = 0;
    this.pendingEncounter = null;
    this.pendingEncounterResult = null;
    this.channel = null;
    this.tauntTimer = 0;
    this.lastTauntText = '';
    this.extraEnemyTypes = [];
    this.debug = { invincible: false };
    this.debugApi = createDebugApi(this);
    this.seedOpeningScene();
    this.pushHud(true);
  }

  /** 开局先给几个可打的对手和道具 */
  seedOpeningScene() {
    this.spawner.spawnEnemyAt(this, 1, { radiusMin: 300, radiusMax: 420 });
    this.spawner.spawnEnemyAt(this, 1, { radiusMin: 340, radiusMax: 520 });
    this.spawner.spawnEnemyAt(this, 2, { radiusMin: 520, radiusMax: 700 });
    spawnItem(this, 'expBook', this.player.x + 160, this.player.y - 120);
    spawnItem(this, 'heal', this.player.x - 200, this.player.y + 90);
  }

  /**
   * 视口尺寸变化（用于刷新环带与渲染裁剪）
   * @param {Number} width 宽
   * @param {Number} height 高
   */
  setViewSize(width, height) {
    this.viewWidth = Math.max(320, width);
    this.viewHeight = Math.max(240, height);
  }

  /**
   * 切换模式（开局前调用；reset 会保留当前模式）
   * @param {String} mode 'normal' | 'nightmare'
   * @param {Number} level 噩梦难度 1~NIGHTMARE_MAX_LEVEL（仅 nightmare 生效，普通模式忽略）
   */
  setMode(mode, level = 1) {
    this.mode = mode === 'nightmare' ? 'nightmare' : 'normal';
    this.nightmare = this.mode === 'nightmare';
    this.nightmareLevel = this.nightmare
      ? Math.min(SPAWN_CONFIG.NIGHTMARE_MAX_LEVEL, Math.max(1, Math.floor(level || 1)))
      : 0;
  }

  /** 当前存活角色（玩家 + 敌人） */
  getActors() {
    return this.activeActors;
  }

  /** 按 id 查实体（角色或道具） */
  findActor(actorId) {
    if (this.player && this.player.id === actorId) {
      return this.player;
    }
    for (let index = 0; index < this.enemies.length; index++) {
      if (this.enemies[index].id === actorId) {
        return this.enemies[index];
      }
    }
    for (let index = 0; index < this.items.length; index++) {
      if (this.items[index].id === actorId) {
        return this.items[index];
      }
    }
    return null;
  }

  /**
   * 新增敌人（召唤与刷新共用）
   * @param {Object} enemy 敌人实体
   */
  addEnemy(enemy) {
    this.enemies.push(enemy);
  }

  /**
   * 生成投射物（走对象池复用，避免 GC 抖动）
   * @param {Object} options { owner, x, y, angle, speed, radius, life, pierce, multiplier, style, color }
   * @returns {Object} 投射物
   */
  spawnProjectile(options) {
    const owner = options.owner;
    const projectile = this.projectilePool.pop() || createProjectile();
    resetProjectile(projectile, {
      ownerId: owner.id,
      ownerIsPlayer: owner.isPlayer,
      style: options.style,
      x: options.x,
      y: options.y,
      vx: Math.cos(options.angle) * options.speed,
      vy: Math.sin(options.angle) * options.speed,
      radius: options.radius,
      life: options.life,
      pierce: options.pierce,
      attack: owner.attack * (owner.buffAttackMultiplier || 1),
      level: owner.level,
      critRate: owner.critRate,
      multiplier: options.multiplier,
      color: options.color,
      homing: options.homing,
      slowAmount: options.slowAmount,
      slowDuration: options.slowDuration,
    });
    // 施法者可能中途死亡，保留一份属性快照用于结算
    projectile.ownerSnapshot = {
      id: owner.id,
      kind: owner.kind,
      isPlayer: owner.isPlayer,
      alive: true,
      attack: owner.attack * (owner.buffAttackMultiplier || 1),
      level: owner.level,
      critRate: owner.critRate,
      passive: null,
      buffAttackMultiplier: 1,
    };
    this.projectiles.push(projectile);
    return projectile;
  }

  /** 回收投射物到对象池 */
  releaseProjectile(projectile) {
    projectile.alive = false;
    if (this.projectilePool.length < 80) {
      this.projectilePool.push(projectile);
    }
  }

  /** 设置移动输入（已归一化） */
  setMoveInput(axisX, axisY) {
    this.input.moveX = clamp(axisX, -1, 1);
    this.input.moveY = clamp(axisY, -1, 1);
  }

  /** 设置瞄准点（世界坐标） */
  setAim(worldX, worldY) {
    this.player.aimX = worldX;
    this.player.aimY = worldY;
    this.player.aimAngle = Math.atan2(worldY - this.player.y, worldX - this.player.x);
  }

  /** 是否按住普通攻击 */
  setAttackHeld(held) {
    this.input.attackHeld = Boolean(held);
  }

  /**
   * 冲刺（带无敌帧）
   * @returns {Boolean} 是否成功冲刺
   */
  requestDash() {
    const player = this.player;
    if (!player.alive || player.dashCooldownTimer > 0 || player.stunTimer > 0) {
      return false;
    }
    let angle = player.aimAngle;
    if (this.input.moveX !== 0 || this.input.moveY !== 0) {
      angle = Math.atan2(this.input.moveY, this.input.moveX);
    }
    const duration = BALANCE.PLAYER.dashDuration;
    const distance = BALANCE.PLAYER.dashDistance * player.passive.dashDistanceMultiplier;
    player.dashVelocityX = (Math.cos(angle) * distance) / duration;
    player.dashVelocityY = (Math.sin(angle) * distance) / duration;
    player.dashTimer = duration;
    player.dashCooldownTimer = BALANCE.PLAYER.dashCooldown * player.passive.dashCooldownMultiplier;
    player.invulnerableTimer = Math.max(player.invulnerableTimer, BALANCE.PLAYER.dashInvulnerable);
    player.facing = angle;
    // 无影踪：冲刺后短暂加速
    if (player.passive.dashBoostMultiplier > 1) {
      player.speedBoostTimer = 0.6;
      player.speedBoostMultiplier = player.passive.dashBoostMultiplier;
    }
    this.effects.addRing(player.x, player.y, player.radius * 2.2, '#8ef0d5', { life: 0.26, lineWidth: 2 });
    return true;
  }

  /**
   * 释放某个主动秘籍
   * @param {String} skillId 秘籍 id
   * @returns {Boolean} 是否成功
   */
  castSkill(skillId) {
    if (this.paused || this.status !== 'playing') {
      return false;
    }
    // 施救 / 传功时凝神运气，腾不出手放秘籍
    if (this.reviving || this.transfer) {
      return false;
    }
    return castPlayerSkill(this, skillId);
  }

  /**
   * 释放神兵绝学（Q 屠龙刀 / E 倚天剑）
   * @param {String} relicId 神兵 id
   * @returns {Boolean} 是否成功
   */
  castRelic(relicId) {
    if (this.paused || this.status !== 'playing') {
      return false;
    }
    return castRelicSkill(this, relicId);
  }

  /** 丢弃身上的神兵（缺省丢最后拿到的一件） */
  dropRelic(relicId) {
    if (this.status !== 'playing') {
      return false;
    }
    dropRelic(this, this.player, relicId);
    this.pushHud(true);
    return true;
  }

  /**
   * 直接习得秘籍（奇遇专用，绕开三选一池）
   * @param {String} skillId 秘籍 id
   * @returns {Object|null} 秘籍配置
   */
  learnSkill(skillId) {
    const skill = grantSkillDirect(this, skillId);
    // 练了随从忌讳的秘籍（葵花宝典），在队的那位当场下山
    if (skill) {
      enforceCompanionOath(this);
    }
    return skill;
  }

  /**
   * 奇遇面板：做出选择并结算
   * @param {String} choiceId 选项 id
   * @returns {Boolean} 是否成功结算
   */
  resolveEncounterChoice(choiceId) {
    const pending = this.pendingEncounter;
    if (!pending) {
      return false;
    }
    this.pendingEncounter = null;
    this.handlers.onEncounter(null);
    const outcome = resolveEncounter(this, pending.encounterId, choiceId);
    this.pendingEncounterResult = outcome;
    this.syncPause();
    this.handlers.onEncounterResult(outcome);
    this.pushHud(true);
    return true;
  }

  /** 关闭奇遇结果页（恢复游戏） */
  dismissEncounterResult() {
    if (!this.pendingEncounterResult) {
      return false;
    }
    this.pendingEncounterResult = null;
    this.handlers.onEncounterResult(null);
    this.syncPause();
    return true;
  }

  /** 按当前弹窗状态同步暂停标记（三选一 / 奇遇抉择 / 奇遇结果），避免逐个手写漏项 */
  syncPause() {
    this.paused = Boolean(this.pendingSkillChoices || this.pendingEncounter || this.pendingEncounterResult);
  }

  /**
   * 丢弃（销毁）奇遇宝物
   * @param {String} treasureId 宝物 id
   * @returns {Boolean} 是否丢弃
   */
  dropTreasure(treasureId) {
    return removeTreasure(this, treasureId);
  }

  /**
   * 选择秘籍（暂停中）
   * @param {String} skillId 秘籍 id
   * @returns {Boolean} 是否成功应用
   */
  chooseSkill(skillId) {
    if (!this.pendingSkillChoices) {
      return false;
    }
    const matched = this.pendingSkillChoices.some((skill) => {
      return skill.id === skillId;
    });
    if (!matched) {
      return false;
    }
    acquireSkill(this, skillId);
    this.stats.learnedSkills = Object.keys(this.player.skillStacks).map((id) => {
      const skill = getSkillById(id);
      return { name: skill ? skill.name : id, stack: this.player.skillStacks[id] };
    });
    this.pendingSkillChoices = null;
    this.handlers.onSkillChoices(null);
    if (this.skillChoiceQueue > 0) {
      this.openSkillChoice();
    }
    this.syncPause();
    this.pushHud(true);
    return true;
  }

  /** 弹出秘籍三选一（队列里还有次数时递归） */
  openSkillChoice() {
    if (this.pendingSkillChoices || this.skillChoiceQueue <= 0) {
      return;
    }
    this.skillChoiceQueue -= 1;
    const choices = rollSkillChoices(this.player, 3);
    if (choices.length === 0) {
      this.skillChoiceQueue = 0;
      this.pendingSkillChoices = null;
      this.handlers.onSkillChoices(null);
      this.syncPause();
      this.notify('秘籍已尽数参透，这一级再无新招可学', '#8ef0d5');
      return;
    }
    this.pendingSkillChoices = choices;
    this.handlers.onSkillChoices(this.buildSkillChoicePayload());
    this.syncPause();
  }

  /** 秘籍面板需要的数据（纯对象，便于 Vue 渲染） */
  buildSkillChoicePayload() {
    return this.pendingSkillChoices.map((skill) => {
      const currentStack = this.player.skillStacks[skill.id] || 0;
      return {
        id: skill.id,
        name: skill.name,
        icon: skill.icon,
        color: skill.color,
        category: skill.category,
        type: skill.type,
        maxStack: skill.maxStack,
        currentStack,
        detail: skill.detail(currentStack + 1),
      };
    });
  }

  /** 玩家升级后的统一处理：特效 + 秘籍次数 */
  handlePlayerLevelUp(levelsGained) {
    if (!levelsGained || levelsGained <= 0) {
      return;
    }
    this.stats.levelUps += levelsGained;
    this.player.levelUpFlash = 0.6;
    this.effects.addLevelUp(this.player.x, this.player.y, this.player.radius * 2.8);
    this.effects.addParticles(this.player.x, this.player.y, {
      count: 16,
      color: '#ffd166',
      speed: 240,
      size: 3,
      life: 0.6,
    });
    const earnedTotal = Math.floor(this.player.level / BALANCE.SKILL_EVERY_LEVELS);
    if (earnedTotal > this.skillChoiceCount) {
      const gained = earnedTotal - this.skillChoiceCount;
      this.skillChoiceQueue += gained;
      this.skillChoiceCount = earnedTotal;
      // 随从跟着涨级、并且自己挑走同样次数的秘籍
      levelUpCompanions(this, levelsGained);
      grantCompanionManuals(this, gained);
      this.openSkillChoice();
    }
  }

  /** 死亡回调：玩家结束本局，敌人掉落道具 */
  handleVictimDeath(victim, killer, info = null) {
    if (victim.isPlayer) {
      this.status = 'dead';
      this.stats.playTime = this.time;
      this.deathCause = killer ? `${killer.typeName} Lv.${killer.level}` : '乱战之中';
      this.handlers.onGameOver({
        level: this.player.level,
        kills: this.stats.kills,
        playTime: this.time,
        bossKills: this.stats.bossKills,
        deathCause: this.deathCause,
        learnedSkills: this.stats.learnedSkills,
        nightmare: this.nightmare,
      });
      return;
    }
    if (victim.isBoss) {
      this.stats.bossKills += 1;
      this.notify(`${victim.typeName} Lv.${victim.level} 已伏诛，掉落满地`, '#ffd166');
    }
    if (killer && killer.isPlayer) {
      this.stats.kills += 1;
      this.spawner.registerKill(this.time);
      // 噩梦模式：一击秒杀 → 动态抬高刷新等级（info.hitDamage 只由 applyDamage 的致死一击传入）
      if (this.nightmare && info && info.hitDamage > 0) {
        this.spawner.registerOverkill(this, victim, info.hitDamage);
      }
    }
    dropLoot(this, victim);
  }

  /**
   * 调试：直接连升若干级（会触发秘籍三选一）
   * @param {Number} levels 提升等级数
   */
  debugLevelUp(levels = 5) {
    const player = this.player;
    player.level += levels;
    recalculatePlayerStats(player);
    player.hp = player.maxHp;
    this.handlePlayerLevelUp(levels);
    this.pushHud(true);
  }

  /** 调试：回满气血并清空护盾 */
  debugHeal() {
    const player = this.player;
    player.hp = player.maxHp;
    player.shield = 0;
    player.shieldTimer = 0;
    this.pushHud(true);
  }

  /** 调试：立刻在远处刷一只首领 */
  debugSpawnBoss() {
    this.spawner.spawnBoss(this);
  }

  /**
   * 提示气泡
   * @param {String} text 文案
   * @param {String} color 颜色
   */
  notify(text, color) {
    this.handlers.onNotice({ text, color: color || '#ffd166' });
  }

  /** 玩家计时器：冷却、无敌、护盾、回血 */
  updatePlayerTimers(deltaTime) {
    const player = this.player;
    player.attackCooldown = Math.max(0, player.attackCooldown - deltaTime);
    player.dashCooldownTimer = Math.max(0, player.dashCooldownTimer - deltaTime);
    player.invulnerableTimer = Math.max(0, player.invulnerableTimer - deltaTime);
    player.dashTimer = Math.max(0, player.dashTimer - deltaTime);
    player.stunTimer = Math.max(0, player.stunTimer - deltaTime);
    player.hitFlash = Math.max(0, player.hitFlash - deltaTime);
    player.levelUpFlash = Math.max(0, player.levelUpFlash - deltaTime);
    player.attackAnimTimer = Math.max(0, player.attackAnimTimer - deltaTime);
    player.castAnimTimer = Math.max(0, player.castAnimTimer - deltaTime);
    if (player.shieldTimer > 0) {
      player.shieldTimer -= deltaTime;
      if (player.shieldTimer <= 0) {
        player.shieldTimer = 0;
        player.shield = 0;
      }
    }
    if (player.speedBoostTimer > 0) {
      player.speedBoostTimer = Math.max(0, player.speedBoostTimer - deltaTime);
    }
    if (player.slowTimer > 0) {
      player.slowTimer -= deltaTime;
      if (player.slowTimer <= 0) {
        player.slowTimer = 0;
        player.slowMultiplier = 1;
      }
    }
    updatePlayerSkillCooldowns(player, deltaTime);
    updateRelicCooldowns(player, deltaTime);

    // 罡气护体：按周期自动凝聚护盾（被打碎后重新计时）
    if (player.passive.shieldCycle > 0 && player.shield <= 0) {
      player.shieldCycleTimer -= deltaTime;
      if (player.shieldCycleTimer <= 0) {
        player.shieldCycleTimer = player.passive.shieldCycle;
        player.shield = player.passive.shieldAmount;
        player.shieldTimer = 999;
        this.effects.addRing(player.x, player.y, player.radius + 14, '#9ad8ff', { life: 0.5, lineWidth: 3 });
      }
    }

    // 吐纳心法：每秒回复
    if (player.passive.regenPerSecond > 0 && player.hp > 0) {
      player.regenTimer -= deltaTime;
      if (player.regenTimer <= 0) {
        player.regenTimer = 1;
        const before = player.hp;
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * player.passive.regenPerSecond);
        if (player.hp - before > 0.5) {
          this.effects.addText(player.x, player.y - player.radius - 10, `+${Math.round(player.hp - before)}`, {
            color: '#7ee0a1',
            size: 12,
          });
        }
      }
    }
  }

  /** 玩家移动与普攻意图 */
  updatePlayerIntent(deltaTime) {
    const player = this.player;
    player.facing = player.aimAngle;
    // 打坐/受传功：钉在原地，不能移动也不能出招
    if (this.channel) {
      player.vx = 0;
      player.vy = 0;
      this.pendingPlayerAttack = false;
      return;
    }
    if (player.stunTimer > 0) {
      player.vx = 0;
      player.vy = 0;
      return;
    }
    const boost = player.speedBoostTimer > 0 ? player.speedBoostMultiplier : 1;
    const slow = player.slowTimer > 0 ? player.slowMultiplier : 1;
    const speed = player.speed * boost * slow;
    player.vx = this.input.moveX * speed;
    player.vy = this.input.moveY * speed;
    if (player.dashTimer > 0) {
      player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.05);
      this.dashTrailTimer -= deltaTime;
      if (this.dashTrailTimer <= 0) {
        this.dashTrailTimer = 0.035;
        this.effects.addTrail(player.x, player.y, player.radius * 0.9, '#8ef0d5');
      }
    }
    this.pendingPlayerAttack = this.input.attackHeld && player.attackCooldown <= 0 && player.dashTimer <= 0 && !this.reviving && !this.transfer;
  }

  /** 敌人 AI 与计时器 */
  updateEnemies(deltaTime) {
    const list = this.enemies;
    for (let index = 0; index < list.length; index++) {
      const enemy = list[index];
      if (!enemy.alive) {
        continue;
      }
      enemy.stunTimer = Math.max(0, enemy.stunTimer - deltaTime);
      enemy.hitFlash = Math.max(0, enemy.hitFlash - deltaTime);
      enemy.meleeCooldown = Math.max(0, enemy.meleeCooldown - deltaTime);
      enemy.dashTimer = Math.max(0, enemy.dashTimer - deltaTime);
      enemy.attackAnimTimer = Math.max(0, enemy.attackAnimTimer - deltaTime);
      enemy.castAnimTimer = Math.max(0, enemy.castAnimTimer - deltaTime);
      if (enemy.slowTimer > 0) {
        enemy.slowTimer -= deltaTime;
        if (enemy.slowTimer <= 0) {
          enemy.slowTimer = 0;
          enemy.slowMultiplier = 1;
        }
      }
      if (enemy.vulnerableTimer > 0) {
        enemy.vulnerableTimer = Math.max(0, enemy.vulnerableTimer - deltaTime);
      }
      updateEnemySkillCooldowns(enemy, deltaTime);
      updateRelicCooldowns(enemy, deltaTime);
      if (enemy.enragedTimer > 0) {
        enemy.enragedTimer -= deltaTime;
        if (enemy.enragedTimer <= 0) {
          enemy.enragedTimer = 0;
          enemy.buffAttackMultiplier = 1;
          enemy.buffSpeedMultiplier = 1;
          enemy.buffDamageReduction = 0;
        }
      }
      updateEnemyAI(this, enemy, deltaTime);
    }
  }

  /** 位移结算（含击退与冲刺） */
  applyMotion(deltaTime) {
    const actors = this.activeActors;
    const friction = Math.exp(-BALANCE.KNOCKBACK_FRICTION * deltaTime);
    for (let index = 0; index < actors.length; index++) {
      const actor = actors[index];
      if (!actor.alive) {
        continue;
      }
      let velocityX = actor.vx;
      let velocityY = actor.vy;
      if (actor.dashTimer > 0) {
        velocityX = actor.dashVelocityX;
        velocityY = actor.dashVelocityY;
      } else if (actor.stunTimer > 0) {
        velocityX *= 0.2;
        velocityY *= 0.2;
      }
      actor.x += (velocityX + actor.knockbackX) * deltaTime;
      actor.y += (velocityY + actor.knockbackY) * deltaTime;
      actor.knockbackX *= friction;
      actor.knockbackY *= friction;

      // 步频相位：按真实位移速度推进，慢走小步、冲刺快步，被击退也会踉跄
      const moveSpeed = Math.hypot(velocityX + actor.knockbackX, velocityY + actor.knockbackY);
      actor.walkPhase = (actor.walkPhase + moveSpeed * deltaTime * 0.075) % (Math.PI * 2);
      actor.moveAmount = clamp(moveSpeed / Math.max(80, actor.speed * 0.86), 0, 1.35);
    }
  }

  /** 角色互相推开，避免完全重叠 */
  separateActors() {
    const actors = this.activeActors;
    for (let first = 0; first < actors.length; first++) {
      const actorA = actors[first];
      if (!actorA.alive) {
        continue;
      }
      for (let second = first + 1; second < actors.length; second++) {
        const actorB = actors[second];
        if (!actorB.alive) {
          continue;
        }
        // 队友之间（玩家 ↔ 随从、随从 ↔ 随从）不互相排挤：站位交给 AI 的散开点位
        const friendlyA = actorA.isPlayer || actorA.isCompanion;
        const friendlyB = actorB.isPlayer || actorB.isCompanion;
        if (friendlyA && friendlyB) {
          continue;
        }
        const deltaX = actorB.x - actorA.x;
        const deltaY = actorB.y - actorA.y;
        const minDistance = actorA.radius + actorB.radius;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance >= minDistance || distance < 0.0001) {
          continue;
        }
        const push = (minDistance - distance) * 0.5;
        const normalX = deltaX / distance;
        const normalY = deltaY / distance;
        actorA.x -= normalX * push;
        actorA.y -= normalY * push;
        actorB.x += normalX * push;
        actorB.y += normalY * push;
      }
    }
  }

  /** 重建空间哈希（角色 + 道具，供战斗与 AI 查询） */
  refreshHash() {
    const candidates = this.activeActors.slice();
    for (let index = 0; index < this.items.length; index++) {
      candidates.push(this.items[index]);
    }
    this.hash.rebuild(candidates);
  }

  /**
   * 追踪弹索敌（万剑归宗）
   * @param {Object} projectile 投射物
   * @returns {Object|null} 最近的可命中目标
   */
  findHomingTarget(projectile) {
    const candidates = this.hash.query(projectile.x, projectile.y, 320);
    let best = null;
    let bestDistance = 320;
    for (let index = 0; index < candidates.length; index++) {
      const target = candidates[index];
      if (target.kind === 'item' || !target.alive || target.id === projectile.ownerId) {
        continue;
      }
      const distance = distanceBetween(projectile.x, projectile.y, target.x, target.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = target;
      }
    }
    return best;
  }

  /**
   * 自动战斗：开启后按优先级自动释放已就绪的伤害秘籍，技能全在冷却时用普攻补空档
   * 只在临时借用准星时改动 aim 字段，释放完立刻还原，玩家手动瞄准不受影响
   * @param {Number} deltaTime 帧间隔
   */
  updateAutoCast(deltaTime) {
    if (!this.autoCast || this.status !== 'playing' || this.paused || !this.player.alive) {
      return;
    }
    // 打坐/受传功期间钉在原地，托管也不出手
    if (this.channel) {
      return;
    }
    this.autoCastTimer -= deltaTime;
    if (this.autoCastTimer > 0) {
      // 两次技能评估之间：只要没有待放的招式，普攻就每帧都能补（受自身冷却约束，不会超额）
      if (!this.autoCastHasSkill) {
        this.tryAutoMelee();
      }
      return;
    }
    this.autoCastTimer = 0.14;
    const pick = pickAutoCastSkill(this);
    this.autoCastHasSkill = Boolean(pick);
    if (!pick) {
      // 没有值得放的招式：穿插一记普攻，免得自动开关变成干瞪眼
      this.tryAutoMelee();
      return;
    }
    const player = this.player;
    const savedAngle = player.aimAngle;
    const savedX = player.aimX;
    const savedY = player.aimY;
    player.aimAngle = pick.angle;
    player.aimX = pick.target.x;
    player.aimY = pick.target.y;
    const casted = castPlayerSkill(this, pick.skill.id);
    player.aimAngle = savedAngle;
    player.aimX = savedX;
    player.aimY = savedY;
    if (casted) {
      // 只给高优先级技能打标，避免满屏飘字
      if ((pick.skill.autoPriority || 5) >= 8) {
        this.effects.addText(player.x, player.y - player.radius - 30, `自动 · ${pick.skill.name}`, {
          color: pick.skill.color,
          size: 12,
        });
      }
    }
  }

  /**
   * 自动普攻：技能都在冷却时补空档（按普攻模式出近战或远程）
   * 玩家自己按着攻击键、冲刺、眩晕、普攻还没转好都不插手
   * @returns {Boolean} 是否出了一次手
   */
  tryAutoMelee() {
    const player = this.player;
    if (this.input.attackHeld || player.attackCooldown > 0 || player.dashTimer > 0 || player.stunTimer > 0 || this.reviving || this.transfer) {
      return false;
    }
    const candidates = this.hash.query(player.x, player.y, BALANCE.RANGED_ATTACK.RANGE);
    let meleeTarget = null;
    let meleeDistance = Infinity;
    let rangedTarget = null;
    let rangedDistance = Infinity;
    for (let index = 0; index < candidates.length; index++) {
      const target = candidates[index];
      if (target.kind === 'item' || !target.alive || target.id === player.id || target.isCompanion) {
        continue;
      }
      const distance = distanceBetween(player.x, player.y, target.x, target.y);
      const meleeReach = player.attackRange + player.radius + target.radius;
      if (distance <= meleeReach && distance < meleeDistance) {
        meleeDistance = distance;
        meleeTarget = target;
      }
      if (distance <= BALANCE.RANGED_ATTACK.RANGE + target.radius && distance < rangedDistance) {
        rangedDistance = distance;
        rangedTarget = target;
      }
    }
    // 近战优先：贴脸不浪费远程；够不着才弹指飞掷
    if (this.attackMode === 'ranged' || (!meleeTarget && this.attackMode === 'auto')) {
      if (!rangedTarget) {
        return false;
      }
      const angle = angleOfVector(rangedTarget.x - player.x, rangedTarget.y - player.y);
      return this.performRangedAttack(angle);
    }
    if (!meleeTarget) {
      return false;
    }
    const angle = angleOfVector(meleeTarget.x - player.x, meleeTarget.y - player.y);
    player.aimAngle = angle;
    player.attackCooldown = player.attackInterval;
    meleeSwing(this, player, angle, {
      multiplier: player.meleeMultiplier,
      knockback: 140,
      color: '#8ef0d5',
    });
    return true;
  }

  /** 弹指飞掷：低伤害远程普攻（发一枚绣花针） */
  performRangedAttack(angle) {
    const player = this.player;
    player.attackCooldown = player.attackInterval;
    this.spawnProjectile({
      owner: player,
      x: player.x + Math.cos(angle) * (player.radius + 8),
      y: player.y + Math.sin(angle) * (player.radius + 8),
      angle,
      speed: BALANCE.RANGED_ATTACK.SPEED,
      radius: BALANCE.RANGED_ATTACK.RADIUS,
      life: BALANCE.RANGED_ATTACK.LIFE,
      pierce: 1,
      multiplier: BALANCE.RANGED_ATTACK.MULTIPLIER,
      style: 'needle',
      color: '#8ef0d5',
    });
    this.effects.addSwing(player.x, player.y, angle, 0.5, player.radius + 16, '#8ef0d5');
    return true;
  }

  /** 按当前模式执行一次玩家普攻（近战 / 远程 / 自动按距离抉择） */
  performPlayerAttack(angle) {
    const player = this.player;
    if (this.attackMode === 'ranged') {
      return this.performRangedAttack(angle);
    }
    if (this.attackMode === 'melee') {
      player.attackCooldown = player.attackInterval;
      meleeSwing(this, player, angle, {
        multiplier: player.meleeMultiplier,
        knockback: 140,
        color: '#8ef0d5',
      });
      return true;
    }
    // auto：近战扇形内有目标就贴脸砍，够不着才远程
    const reach = player.attackRange + player.radius;
    const candidates = this.hash.query(player.x, player.y, reach + 40);
    let inMelee = false;
    for (let index = 0; index < candidates.length; index++) {
      const target = candidates[index];
      if (target.kind === 'item' || !target.alive || target.id === player.id || target.isCompanion) {
        continue;
      }
      if (distanceBetween(player.x, player.y, target.x, target.y) <= reach + target.radius) {
        inMelee = true;
        break;
      }
    }
    if (inMelee) {
      player.attackCooldown = player.attackInterval;
      meleeSwing(this, player, angle, {
        multiplier: player.meleeMultiplier,
        knockback: 140,
        color: '#8ef0d5',
      });
      return true;
    }
    return this.performRangedAttack(angle);
  }

  /** 循环切换普攻模式：自动 → 近战 → 远程 */
  cycleAttackMode() {
    const order = ['auto', 'melee', 'ranged'];
    const nextIndex = (order.indexOf(this.attackMode) + 1) % order.length;
    this.attackMode = order[nextIndex];
    const labels = { auto: '自动（贴脸近战 · 远了飞掷）', melee: '近战', ranged: '远程弹指' };
    this.notify(`普攻模式：${labels[this.attackMode]}`, '#8ef0d5');
    this.pushHud(true);
    return this.attackMode;
  }

  /* ---------------------------------------------------------------- */
  /* 施救倒地随从（V 键：可移动、受击不打断、禁普攻禁技能）              */
  /* ---------------------------------------------------------------- */

  /**
   * 开始 / 中止施救：走近倒地标记后按 V 启动，3 秒后同伴半血归队
   * @returns {Boolean} 是否处于施救状态
   */
  startRevive() {
    if (this.reviving) {
      this.reviving = null;
      this.notify('施救中止', '#c6a86c');
      return false;
    }
    if (this.transfer) {
      this.notify('正在传功，腾不出手施救', '#c6a86c');
      return false;
    }
    const player = this.player;
    if (!player.alive || !this.fallenCompanions.length) {
      this.notify('附近没有倒下的同伴', '#c6a86c');
      return false;
    }
    const marker = this.fallenCompanions.find((item) => {
      return distanceBetween(player.x, player.y, item.x, item.y) < TEAMWORK_CONFIG.REVIVE_START_RADIUS;
    });
    if (!marker) {
      this.notify('要走到同伴倒下的地方才能施救', '#c6a86c');
      return false;
    }
    this.reviving = { typeId: marker.typeId, timer: 0, duration: TEAMWORK_CONFIG.REVIVE_DURATION };
    this.notify(`正在施救 ${marker.name}…（可以走动，别离开太远）`, '#8ef0d5');
    return true;
  }

  /** 施救逐帧推进：超距中止，读条完成半血复活 */
  updateRevive(deltaTime) {
    if (!this.reviving) {
      return;
    }
    const player = this.player;
    if (!player.alive) {
      this.reviving = null;
      return;
    }
    const marker = this.fallenCompanions.find((item) => item.typeId === this.reviving.typeId);
    if (!marker) {
      this.reviving = null;
      return;
    }
    if (distanceBetween(player.x, player.y, marker.x, marker.y) > TEAMWORK_CONFIG.REVIVE_KEEP_RADIUS) {
      this.reviving = null;
      this.notify('离得太远，施救中止', '#ff8a66');
      return;
    }
    this.reviving.timer += deltaTime;
    if (this.reviving.timer >= this.reviving.duration) {
      reviveCompanionFrom(this, marker);
      this.fallenCompanions = this.fallenCompanions.filter((item) => item !== marker);
      this.reviving = null;
      this.pushHud(true);
    }
  }

  /* ---------------------------------------------------------------- */
  /* 传功（按住 T：可移动、受击打断、随传随回血）                        */
  /* ---------------------------------------------------------------- */

  /**
   * 开 / 关传功：对 170 码内血量未满的同伴持续回血
   * @returns {Boolean} 是否进入传功状态
   */
  startTransfer() {
    if (this.transfer) {
      this.transfer = null;
      this.notify('收功', '#c6a86c');
      return false;
    }
    if (this.reviving) {
      this.notify('正在施救，腾不出手传功', '#c6a86c');
      return false;
    }
    const player = this.player;
    if (!player.alive) {
      return false;
    }
    const companion = livingCompanions(this).find((enemy) => {
      return enemy.hp < enemy.maxHp && distanceBetween(player.x, player.y, enemy.x, enemy.y) < TEAMWORK_CONFIG.TRANSFER_RADIUS;
    });
    if (!companion) {
      this.notify('附近没有受伤的同伴可传功', '#c6a86c');
      return false;
    }
    this.transfer = { targetId: companion.id };
    this.notify(`正为 ${companion.typeName} 传功…（随传随回血，受击会打断）`, '#c9e8ff');
    return true;
  }

  /** 传功逐帧推进：每秒回 8% 目标上限、耗玩家 2% 当前血，受击 / 超距 / 松键结束 */
  updateTransfer(deltaTime) {
    if (!this.transfer) {
      return;
    }
    const player = this.player;
    const target = this.findActor(this.transfer.targetId);
    if (!player.alive || player.hitFlash > 0 || !target || !target.alive || !target.isCompanion) {
      if (this.transfer) {
        this.notify(player.hitFlash > 0 ? '受击，传功被打断' : '传功结束', '#c6a86c');
      }
      this.transfer = null;
      return;
    }
    if (distanceBetween(player.x, player.y, target.x, target.y) > TEAMWORK_CONFIG.TRANSFER_BREAK_RADIUS) {
      this.transfer = null;
      this.notify('离同伴太远，传功中断', '#ff8a66');
      return;
    }
    if (target.hp >= target.maxHp) {
      this.transfer = null;
      this.notify(`${target.typeName} 气血已满`, '#8ef0d5');
      return;
    }
    target.hp = Math.min(target.maxHp, target.hp + target.maxHp * TEAMWORK_CONFIG.TRANSFER_HEAL_RATIO * deltaTime);
    player.hp = Math.max(1, player.hp - player.hp * TEAMWORK_CONFIG.TRANSFER_COST_RATIO * deltaTime);
    // 传功连线微粒
    if (Math.random() < deltaTime * 24) {
      this.effects.addTrail(player.x, player.y, 3, '#7be3ff');
    }
  }

  /**
   * 开关自动战斗（自动放技能 + 技能冷却时穿插普攻）
   * @param {Boolean} enabled 是否开启
   * @returns {Boolean} 开关后的状态
   */
  setAutoCast(enabled) {
    this.autoCast = Boolean(enabled);
    this.autoCastTimer = 0;
    this.autoCastHasSkill = false;
    this.notify(this.autoCast ? '自动战斗已开启（技能 + 普攻）' : '自动战斗已关闭', this.autoCast ? '#8ef0d5' : '#c6a86c');
    this.pushHud(true);
    return this.autoCast;
  }

  /** 结算玩家与敌人的攻击意图（此时哈希已是本帧位置） */  resolveAttacks() {
    const player = this.player;
    if (this.pendingPlayerAttack && player.alive && player.attackCooldown <= 0) {
      this.performPlayerAttack(player.aimAngle);
    }
    this.pendingPlayerAttack = false;

    const list = this.enemies;
    for (let index = 0; index < list.length; index++) {
      const enemy = list[index];
      if (!enemy.alive) {
        continue;
      }
      if (enemy.wantsAttack && enemy.meleeCooldown <= 0) {
        enemy.meleeCooldown = enemy.meleeInterval;
        meleeSwing(this, enemy, enemy.facing, {
          range: enemy.attackRange,
          arc: Math.PI * 0.7,
          multiplier: enemy.meleeMultiplier,
          knockback: 110,
        });
      }
      const target = this.findActor(enemy.targetId);
      tryUseEnemySkill(this, enemy, target);
    }
  }

  /** 冲锋撞击判定 */
  resolveDashContacts() {
    const actors = this.activeActors;
    for (let index = 0; index < actors.length; index++) {
      const actor = actors[index];
      if (!actor.alive || actor.isPlayer || actor.dashTimer <= 0 || !actor.dashHitIds) {
        continue;
      }
      const candidates = this.hash.query(actor.x, actor.y, actor.radius + 44);
      for (let item = 0; item < candidates.length; item++) {
        const target = candidates[item];
        if (target.kind === 'item' || !target.alive || target.id === actor.id) {
          continue;
        }
        if (actor.dashHitIds.has(target.id)) {
          continue;
        }
        const distance = distanceBetween(actor.x, actor.y, target.x, target.y);
        if (distance > actor.radius + target.radius + 8) {
          continue;
        }
        actor.dashHitIds.add(target.id);
        applyDamage(this, actor, target, {
          multiplier: actor.dashMultiplier || 1.2,
          sourceX: actor.x,
          sourceY: actor.y,
          knockback: 300,
          color: actor.accent,
        });
      }
    }
  }

  /** 投射物移动与命中 */
  updateProjectiles(deltaTime) {
    for (let index = this.projectiles.length - 1; index >= 0; index--) {
      const projectile = this.projectiles[index];
      projectile.life -= deltaTime;

      // 追踪弹（万剑归宗）：朝 320 码内最近的敌人缓慢转向
      if (projectile.homing > 0) {
        const target = this.findHomingTarget(projectile);
        if (target) {
          const speed = Math.hypot(projectile.vx, projectile.vy);
          const desired = Math.atan2(target.y - projectile.y, target.x - projectile.x);
          const maxTurn = projectile.homing * deltaTime;
          const turn = Math.max(-maxTurn, Math.min(maxTurn, normalizeAngle(desired - projectile.angle)));
          projectile.angle += turn;
          projectile.vx = Math.cos(projectile.angle) * speed;
          projectile.vy = Math.sin(projectile.angle) * speed;
        }
      }

      projectile.x += projectile.vx * deltaTime;
      projectile.y += projectile.vy * deltaTime;
      if (projectile.life <= 0) {
        this.releaseProjectile(projectile);
        this.projectiles.splice(index, 1);
        continue;
      }
      const candidates = this.hash.query(projectile.x, projectile.y, projectile.radius + 46);
      let consumed = false;
      for (let item = 0; item < candidates.length; item++) {
        const target = candidates[item];
        if (target.kind === 'item' || !target.alive || target.id === projectile.ownerId) {
          continue;
        }
        if (projectile.hitIds.has(target.id)) {
          continue;
        }
        const distance = distanceBetween(projectile.x, projectile.y, target.x, target.y);
        if (distance > projectile.radius + target.radius) {
          continue;
        }
        const attacker = this.findActor(projectile.ownerId) || projectile.ownerSnapshot;
        if (attacker === projectile.ownerSnapshot) {
          projectile.ownerSnapshot.alive = false;
        }
        applyDamage(this, attacker, target, {
          multiplier: projectile.multiplier,
          sourceX: projectile.x,
          sourceY: projectile.y,
          knockback: 150,
          color: projectile.color,
        });
        if (projectile.slowAmount > 0 && (target.kind === 'enemy' || target.isPlayer)) {
          target.slowTimer = Math.max(target.slowTimer || 0, projectile.slowDuration);
          target.slowMultiplier = 1 - projectile.slowAmount;
          this.effects.addParticles(target.x, target.y, { count: 5, color: '#8fe3ff', speed: 90, size: 2.4, life: 0.3 });
        }
        projectile.hitIds.add(target.id);
        projectile.pierce -= 1;
        if (projectile.pierce < 0) {
          consumed = true;
          break;
        }
      }
      if (consumed) {
        this.releaseProjectile(projectile);
        this.projectiles.splice(index, 1);
      }
    }
  }

  /** 相机平滑跟随 */
  updateCamera(deltaTime) {
    const player = this.player;
    const factor = smoothingFactor(8, deltaTime);
    this.camera.x += (player.x - this.camera.x) * factor;
    this.camera.y += (player.y - this.camera.y) * factor;
  }

  /** 清理死亡实体与远处敌人 */
  cleanup() {
    if (this.status === 'dead') {
      return;
    }
    for (let index = this.enemies.length - 1; index >= 0; index--) {
      const enemy = this.enemies[index];
      if (!enemy.alive) {
        this.enemies.splice(index, 1);
        continue;
      }
      if (enemy.isBoss || enemy.isMinion || enemy.isCompanion || enemy.bondId) {
        continue;
      }
      const distance = distanceBetween(enemy.x, enemy.y, this.player.x, this.player.y);
      if (distance > WORLD_CONFIG.DESPAWN_DISTANCE) {
        this.enemies.splice(index, 1);
      }
    }
  }

  /** 残血压力记录 */
  trackPlayerCondition() {
    const player = this.player;
    const hpRatio = player.maxHp > 0 ? player.hp / player.maxHp : 1;
    if (hpRatio < SPAWN_CONFIG.LOW_HP_RATIO) {
      this.spawner.registerLowHp(this.time);
    }
  }

  /** 单个固定步长 */
  step(deltaTime) {
    this.time += deltaTime;
    this.activeActors = [this.player];
    for (let index = 0; index < this.enemies.length; index++) {
      if (this.enemies[index].alive) {
        this.activeActors.push(this.enemies[index]);
      }
    }
    this.updatePlayerTimers(deltaTime);
    this.updatePlayerIntent(deltaTime);
    this.updateEnemies(deltaTime);
    this.applyMotion(deltaTime);
    this.separateActors();
    this.refreshHash();
    this.resolveAttacks();
    this.updateAutoCast(deltaTime);
    this.resolveDashContacts();
    this.updateProjectiles(deltaTime);
    this.zones.update(this, deltaTime);
    updateItems(this, deltaTime);
    updateEncounters(this, deltaTime);
    updateCompanionManuals(this, deltaTime);
    this.updateRevive(deltaTime);
    this.updateTransfer(deltaTime);
    updateBonds(this, deltaTime);
    updateRelicPossession(this, deltaTime);
    ensureRelicsExist(this, deltaTime);
    this.spawner.update(this, deltaTime);
    this.cleanup();
    this.effects.update(deltaTime);
    this.updateCamera(deltaTime);
    this.trackPlayerCondition();
  }

  /**
   * 主循环入口（RAF 驱动，固定步长）
   * @param {Number} deltaTime 距上一帧的秒数
   */
  update(deltaTime) {
    if (this.status !== 'playing') {
      this.effects.update(deltaTime);
      this.updateCamera(deltaTime);
      return;
    }
    if (this.paused) {
      return;
    }
    this.accumulator += Math.min(deltaTime, 0.25);
    let steps = 0;
    while (this.accumulator >= FIXED_STEP && steps < MAX_STEPS_PER_FRAME) {
      this.step(FIXED_STEP);
      this.accumulator -= FIXED_STEP;
      steps += 1;
    }
    if (steps >= MAX_STEPS_PER_FRAME) {
      this.accumulator = 0;
    }
    this.hudTimer -= deltaTime;
    if (this.hudTimer <= 0) {
      this.pushHud();
    }
  }

  /** HUD 快照（节流到 10Hz） */
  buildHudSnapshot() {
    const player = this.player;
    const needExp = expToNext(player.level);
    const boss = this.findNearestBoss();
    return {
      level: player.level,
      hp: Math.max(0, Math.ceil(player.hp)),
      maxHp: Math.round(player.maxHp),
      hpRatio: player.maxHp > 0 ? clamp(player.hp / player.maxHp, 0, 1) : 0,
      exp: Math.floor(player.exp),
      expNeed: needExp,
      expRatio: clamp(player.exp / needExp, 0, 1),
      attack: Math.round(player.attack),
      defense: Math.round(player.defense * 10) / 10,
      speed: Math.round(player.speed),
      critRate: Math.round(player.critRate * 100),
      shield: Math.round(player.shield),
      kills: this.stats.kills,
      time: this.time,
      enemyCount: this.enemies.filter((enemy) => enemy.alive && !enemy.isCompanion).length,
      // 调试台专用：默认刷新等级区间 / 当前实际区间 / 各自被调了多少
      spawn: this.spawner.describeRange(this),
      autoCast: Boolean(this.autoCast),
      attackMode: this.attackMode,
      activeSkills: player.activeSkillIds.map((skillId, index) => {
        const skill = getSkillById(skillId);
        const cooldownLeft = player.skillCooldowns[skillId] || 0;
        return {
          id: skillId,
          name: skill.name,
          icon: skill.icon,
          color: skill.color,
          slot: index < 9 ? index + 1 : '',
          stack: player.skillStacks[skillId] || 1,
          cooldown: skill.cooldown,
          cooldownLeft,
          ready: cooldownLeft <= 0,
          ratio: cooldownLeft <= 0 ? 0 : cooldownLeft / skill.cooldown,
          detail: skill.detail ? skill.detail(player.skillStacks[skillId] || 1) : '',
        };
      }),
      passives: Object.keys(player.skillStacks)
        .map((skillId) => {
          const skill = getSkillById(skillId);
          return { skill, skillId, stack: player.skillStacks[skillId] };
        })
        .filter((entry) => {
          return entry.skill && entry.skill.type === 'passive';
        })
        .map((entry) => {
          return {
            id: entry.skillId,
            name: entry.skill.name,
            icon: entry.skill.icon,
            color: entry.skill.color,
            stack: entry.stack,
            maxStack: entry.skill.maxStack,
          };
        }),
      dashRatio: clamp(1 - player.dashCooldownTimer / (BALANCE.PLAYER.dashCooldown * player.passive.dashCooldownMultiplier), 0, 1),
      dashReady: player.dashCooldownTimer <= 0,
      relics: RELIC_IDS.map((relicId) => {
        const relic = RELICS[relicId];
        const owned = player.relics.includes(relicId);
        const cooldownLeft = player.relicCooldowns[relicId] || 0;
        return {
          id: relicId,
          name: relic.name,
          icon: relic.icon,
          color: relic.color,
          key: relic.key,
          skillName: relic.skill.name,
          detail: relic.skill.detail,
          owned,
          cooldown: relic.skill.cooldown,
          cooldownLeft,
          ready: owned && cooldownLeft <= 0,
          ratio: owned && cooldownLeft > 0 ? cooldownLeft / (relic.skill.cooldown * (player.passive.cooldownMultiplier || 1)) : 0,
        };
      }),
      relicHunted: findContestedHolder(this) !== null,
      buffs: player.buffs.map((buff) => {
        return {
          id: buff.id,
          name: buff.name,
          icon: buff.icon || '※',
          color: buff.color || '#ffd166',
          timeLeft: Math.max(0, buff.timeLeft),
          duration: buff.duration || 1,
        };
      }),
      treasures: player.treasures
        .map((treasureId) => {
          const treasure = TREASURES[treasureId];
          if (!treasure) {
            return null;
          }
          return {
            id: treasure.id,
            name: treasure.name,
            icon: treasure.icon,
            color: treasure.color,
            description: treasure.description,
            discardable: Boolean(treasure.discardable),
          };
        })
        .filter(Boolean),
      companions: this.enemies
        .filter((enemy) => enemy.alive && enemy.isCompanion)
        .map((enemy) => {
          const manuals = companionManualSummary(enemy);
          return {
            id: enemy.id,
            name: enemy.typeName,
            level: enemy.level,
            hpRatio: enemy.maxHp > 0 ? clamp(enemy.hp / enemy.maxHp, 0, 1) : 0,
            guard: Boolean(enemy.guardFatal),
            manualCount: manuals.length,
            manualText: manuals.slice(0, 3).map((entry) => `${entry.name}${entry.stack > 1 ? `×${entry.stack}` : ''}`).join('、'),
          };
        }),
      channel: this.channel
        ? {
            name: this.channel.name,
            color: this.channel.color,
            ratio: clamp(this.channel.timer / this.channel.duration, 0, 1),
          }
        : null,
      reviving: this.reviving
        ? { ratio: clamp(this.reviving.timer / this.reviving.duration, 0, 1) }
        : null,
      transfer: this.transfer
        ? {
            targetId: this.transfer.targetId,
            targetName: this.findActor(this.transfer.targetId)?.typeName || '同伴',
          }
        : null,
      fallenCount: this.fallenCompanions.length,
      boss: boss
        ? {
            name: boss.typeName,
            level: boss.level,
            hpRatio: boss.maxHp > 0 ? clamp(boss.hp / boss.maxHp, 0, 1) : 0,
            distance: Math.round(distanceBetween(player.x, player.y, boss.x, boss.y)),
          }
        : null,
    };
  }

  /** 最近的首领（给 HUD 提示用） */
  findNearestBoss() {
    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < this.enemies.length; index++) {
      const enemy = this.enemies[index];
      if (!enemy.alive || !enemy.isBoss) {
        continue;
      }
      const distance = distanceBetween(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = enemy;
      }
    }
    return nearest;
  }

  /**
   * 推送 HUD
   * @param {Boolean} force 是否无视节流
   */
  pushHud(force = false) {
    if (!force) {
      this.hudTimer = HUD_INTERVAL;
    }
    this.handlers.onHud(this.buildHudSnapshot());
  }
}
