/**
 * 随从武功（v1.9）
 * 会自修武功的随从（小师妹）跟着玩家一起攒秘籍：玩家每得到一次抉择机会，她也自己挑一本。
 * 规则：
 * 1. 抉择完全由她自己加权随机，不受玩家控制
 * 2. 她绝不碰「shunnedBy」里点名回避的秘籍（葵花宝典）
 * 3. 玩家练了那本秘籍，她要么不来，要么当场离队
 */

import { COMPANION_MANUAL_CONFIG } from '../constants.js';
import { getEnemyType } from '../config/enemies.js';
import { PLAYER_SKILLS, getSkillById } from '../config/skills.js';
import { createEmptyPassive, applyManualPassive, refreshEntityBaseStats } from './stats.js';
import { castCompanionManual } from './skills.js';
import { angleOfVector, clamp, distanceBetween } from './utils.js';

const CFG = COMPANION_MANUAL_CONFIG;

/** 玩家身上哪本秘籍会让这个随从退避三舍 */
export const shunnedManualsOf = (player, typeId) => {
  const stacks = player.skillStacks || {};
  return Object.keys(stacks)
    .map((skillId) => getSkillById(skillId))
    .filter((skill) => skill && skill.shunnedBy && skill.shunnedBy.includes(typeId));
};

/** 这个随从现在还愿意入队吗（玩家没练它忌讳的秘籍才行） */
export const canCompanionJoin = (world, typeId) => {
  return shunnedManualsOf(world.player, typeId).length === 0;
};

/** 场上的随从列表 */
export const livingCompanions = (world) => {
  return world.enemies.filter((enemy) => enemy.alive && enemy.isCompanion);
};

/** 会自修武功的随从 */
export const learningCompanions = (world) => {
  return livingCompanions(world).filter((enemy) => enemy.learnsManuals);
};

/** 按权重挑一本：没学过的优先、奇遇绝学降权、超过主动招式上限后压低 */
const pickManual = (companion) => {
  const activeCount = Object.keys(companion.manuals).filter((skillId) => {
    const skill = getSkillById(skillId);
    return skill && skill.type === 'active';
  }).length;
  const pool = [];
  PLAYER_SKILLS.forEach((skill) => {
    if (skill.shunnedBy && skill.shunnedBy.includes(companion.typeId)) {
      return;
    }
    const stack = companion.manuals[skill.id] || 0;
    if (stack >= skill.maxStack) {
      return;
    }
    if ((skill.unlockLevel || 1) > companion.level) {
      return;
    }
    let weight = stack === 0 ? CFG.PASSIVE_WEIGHT : CFG.STACK_WEIGHT / stack;
    if (skill.encounterOnly) {
      weight *= CFG.ENCOUNTER_WEIGHT;
    }
    if (skill.type === 'active') {
      weight *= activeCount >= CFG.MAX_ACTIVE ? CFG.ACTIVE_OVER_WEIGHT : CFG.ACTIVE_WEIGHT;
    }
    pool.push({ skill, weight });
  });
  if (!pool.length) {
    return null;
  }
  const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;
  for (let index = 0; index < pool.length; index++) {
    roll -= pool[index].weight;
    if (roll <= 0) {
      return pool[index].skill;
    }
  }
  return pool[pool.length - 1].skill;
};

/** 重算随从属性：基础值 + 自修秘籍（六成火候） */
export const recalculateCompanionStats = (companion) => {
  const hpRatio = companion.maxHp > 0 ? clamp(companion.hp / companion.maxHp, 0, 1) : 1;
  if (companion.baseMeleeInterval === undefined) {
    companion.baseMeleeInterval = companion.meleeInterval;
  }
  if (companion.baseCritRate === undefined) {
    companion.baseCritRate = companion.critRate;
  }
  refreshEntityBaseStats(companion);
  const passive = createEmptyPassive();
  applyManualPassive(passive, companion.manuals);
  const scale = CFG.SCALE;
  const scaleBonus = (value) => (value - 1) * scale + 1;
  companion.maxHp = Math.round(companion.maxHp * scaleBonus(passive.hpMultiplier));
  companion.attack = Math.round(companion.attack * scaleBonus(passive.attackMultiplier));
  companion.defense += (passive.defenseBonus + passive.relicDefenseFlat) * scale;
  companion.speed *= scaleBonus(passive.moveMultiplier);
  companion.critRate = clamp(companion.baseCritRate + passive.critBonus * scale, 0, 0.75);
  companion.meleeInterval = companion.baseMeleeInterval * passive.attackIntervalMultiplier;
  companion.meleeCooldown = Math.min(companion.meleeCooldown, companion.meleeInterval);
  // 战斗层会读的字段：伤害/吸血/标记类按六成折算，其余保持中性值
  const combat = createEmptyPassive();
  applyManualPassive(combat, companion.manuals);
  companion.passive = {
    ...combat,
    lifesteal: combat.lifesteal * scale,
    killHealRatio: combat.killHealRatio * scale,
    regenPerSecond: combat.regenPerSecond * scale,
    damageReduction: Math.min(CFG.MAX_DAMAGE_REDUCTION, combat.damageReduction * scale),
    vulnerableCrit: combat.vulnerableCrit * scale,
    meleeSlow: combat.meleeSlow * scale,
    reflect: combat.reflect * scale,
    cooldownMultiplier: Math.max(0.5, combat.cooldownMultiplier),
    attackMultiplier: 1,
    moveMultiplier: 1,
    hpMultiplier: 1,
  };
  companion.hp = clamp(hpRatio * companion.maxHp, 1, companion.maxHp);
};

/** 给一个随从发一本自修秘籍（她自己挑） */
export const grantCompanionManual = (world, companion) => {
  if (!companion || !companion.alive || !companion.learnsManuals) {
    return null;
  }
  const skill = pickManual(companion);
  if (!skill) {
    return null;
  }
  const stack = (companion.manuals[skill.id] || 0) + 1;
  companion.manuals[skill.id] = stack;
  companion.manualEarned += 1;
  recalculateCompanionStats(companion);
  const label = stack === 1 ? `领悟《${skill.name}》` : `《${skill.name}》第 ${stack} 层`;
  world.effects.addText(companion.x, companion.y - companion.radius - 26, label, { color: skill.color, size: 13 });
  world.effects.addRing(companion.x, companion.y, companion.radius * 3, skill.color, { life: 0.5, lineWidth: 2 });
  return skill;
};

/** 玩家多出几次抉择机会，随从同频各领几本 */
export const grantCompanionManuals = (world, times) => {
  const count = Math.max(0, Math.round(times));
  if (!count) {
    return [];
  }
  const granted = [];
  learningCompanions(world).forEach((companion) => {
    for (let index = 0; index < count; index++) {
      const skill = grantCompanionManual(world, companion);
      if (skill) {
        granted.push({ companion, skill });
      }
    }
  });
  if (granted.length) {
    const first = granted[0];
    world.notify(`${first.companion.typeName} 自己挑了《${first.skill.name}》`, first.skill.color);
  }
  return granted;
};

/** 玩家升级：会自修的随从跟着涨级，并重算属性 */
export const levelUpCompanions = (world, levels) => {
  const gained = Math.max(0, Math.round(levels));
  if (!gained) {
    return;
  }
  learningCompanions(world).forEach((companion) => {
    companion.level = Math.min(99, companion.level + gained);
    recalculateCompanionStats(companion);
    companion.hp = Math.min(companion.maxHp, companion.hp + companion.maxHp * 0.2 * gained);
  });
};

/** 随从离队（不掉战利品、不算击杀） */
export const dismissCompanion = (world, companion, text) => {
  if (!companion || !companion.alive) {
    return false;
  }
  companion.alive = false;
  companion.isCompanion = true;
  companion.targetId = null;
  world.effects.addText(companion.x, companion.y - companion.radius - 24, text, { color: '#ffd3ea', size: 14 });
  world.effects.addParticles(companion.x, companion.y, { count: 16, color: '#ffd3ea', speed: 150, size: 2.6, life: 0.6 });
  world.effects.addRing(companion.x, companion.y, companion.radius * 3.4, '#ffd3ea', { life: 0.6, lineWidth: 2 });
  return true;
};

/** 玩家练了随从忌讳的秘籍 → 在队的当场离队，返回离队说明 */
export const enforceCompanionOath = (world) => {
  const lines = [];
  livingCompanions(world).forEach((companion) => {
    const shunned = shunnedManualsOf(world.player, companion.typeId);
    if (!shunned.length) {
      return;
    }
    const manual = shunned[0];
    dismissCompanion(world, companion, `《${manual.name}》？恶心。`);
    lines.push(`${companion.typeName} 掩鼻而去：你身上那股《${manual.name}》味，她受不了。`);
    world.notify(`${companion.typeName} 离队：她不齿《${manual.name}》`, '#ff6bd6');
  });
  return lines;
};

/** 随从主动招式：够得着就放，冷却按秘籍走 */
export const tryCastCompanionManual = (world, companion, target) => {
  if (!companion.manuals || !target || !target.alive || companion.stunTimer > 0) {
    return false;
  }
  const candidates = Object.keys(companion.manuals)
    .map((skillId) => getSkillById(skillId))
    .filter((skill) => skill && skill.type === 'active' && (companion.manualCooldowns[skill.id] || 0) <= 0)
    .sort((left, right) => (right.cooldown || 0) - (left.cooldown || 0));
  if (!candidates.length) {
    return false;
  }
  const distance = distanceBetween(companion.x, companion.y, target.x, target.y);
  for (let index = 0; index < candidates.length; index++) {
    const skill = candidates[index];
    const reach = skill.autoRange || CFG.CAST_RANGE;
    if (distance > reach) {
      continue;
    }
    companion.aimAngle = angleOfVector(target.x - companion.x, target.y - companion.y);
    if (castCompanionManual(world, companion, skill.id)) {
      return true;
    }
  }
  return false;
};

/** 逐帧：随从秘籍冷却 + 撕书后的属性重算 */
export const updateCompanionManuals = (world, deltaTime) => {
  world.enemies.forEach((enemy) => {
    if (!enemy.alive) {
      return;
    }
    if (enemy.statsDirty) {
      enemy.statsDirty = false;
      recalculateCompanionStats(enemy);
    }
    if (!enemy.manualCooldowns) {
      return;
    }
    Object.keys(enemy.manualCooldowns).forEach((skillId) => {
      if (enemy.manualCooldowns[skillId] > 0) {
        enemy.manualCooldowns[skillId] = Math.max(0, enemy.manualCooldowns[skillId] - deltaTime);
      }
    });
  });
};

/** 随从档案摘要（图鉴 / 调试台用） */
export const companionManualSummary = (companion) => {
  return Object.keys(companion.manuals || {})
    .map((skillId) => {
      const skill = getSkillById(skillId);
      return skill ? { id: skill.id, name: skill.name, stack: companion.manuals[skillId], color: skill.color } : null;
    })
    .filter(Boolean)
    .sort((left, right) => right.stack - left.stack);
};

/** 该类型随从忌讳的秘籍名（图鉴用） */
export const shunnedManualNames = (typeId) => {
  return PLAYER_SKILLS.filter((skill) => skill.shunnedBy && skill.shunnedBy.includes(typeId)).map((skill) => skill.name);
};

/** 随从类型的自修说明（图鉴用） */
export const companionLearningText = (typeId) => {
  const type = getEnemyType(typeId);
  if (!type || !type.learnsManuals) {
    return '';
  }
  const shunned = shunnedManualNames(typeId);
  const base = '入队后会自己挑秘籍练，每当你多一次抉择机会，她也自行领悟一本（火候只有六成）。';
  return shunned.length ? `${base}但绝不碰《${shunned.join('》《')}》——你若练了，她当场下山。` : base;
};
