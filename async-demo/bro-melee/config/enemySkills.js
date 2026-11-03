/**
 * 敌人技能配置（README §9.1）
 * 释放逻辑在 core/skills.js 的 castEnemySkill 中按 type 分派
 *
 * 元数据字段（不参与战斗结算，供「按等级领悟武功」使用）：
 * - minLevel：敌人在该等级及以上才可能领悟
 * - weight：抽取权重（越大越常见）
 * - tags：技能流派标签，敌人类型有 skillTags 时会加权（同类武功更容易被领悟）
 */

export const ENEMY_SKILLS = {
  dash: {
    id: 'dash',
    name: '冲锋突袭',
    type: 'dash',
    damageMultiplier: 1.2,
    range: 180,
    minRange: 50,
    cooldown: 4,
    dashSpeed: 720,
    dashDuration: 0.22,
    color: '#ffd8a8',
    minLevel: 1,
    weight: 1.5,
    tags: ['melee', 'agile'],
    forTags: ['melee', 'agile'],
    description: '拉近距离并撞飞目标',
  },
  arrow: {
    id: 'arrow',
    name: '穿杨箭',
    type: 'projectile',
    damageMultiplier: 0.9,
    range: 430,
    minRange: 110,
    cooldown: 2.4,
    projectileSpeed: 540,
    projectileRadius: 6,
    projectileStyle: 'needle',
    color: '#d8f09a',
    minLevel: 1,
    weight: 1.6,
    tags: ['ranged'],
    forTags: ['ranged'],
    description: '远远放一支冷箭',
  },
  fireball: {
    id: 'fireball',
    name: '远程火球',
    type: 'projectile',
    damageMultiplier: 1.3,
    range: 330,
    minRange: 90,
    cooldown: 2.8,
    projectileSpeed: 300,
    projectileRadius: 9,
    color: '#ff8a4c',
    minLevel: 3,
    weight: 1.2,
    tags: ['ranged'],
    forTags: ['ranged'],
    description: '搓出火球远程轰击',
  },
  'poison-dart': {
    id: 'poison-dart',
    name: '淬毒镖',
    type: 'projectile',
    damageMultiplier: 0.9,
    range: 360,
    minRange: 70,
    cooldown: 4.2,
    projectileSpeed: 460,
    projectileRadius: 7,
    projectileStyle: 'needle',
    slowAmount: 0.4,
    slowDuration: 2.4,
    color: '#a6e35a',
    minLevel: 6,
    weight: 1.0,
    tags: ['ranged', 'agile'],
    forTags: ['ranged', 'agile'],
    description: '毒镖命中后拖慢脚步',
  },
  'war-cry': {
    id: 'war-cry',
    name: '战吼',
    type: 'buff',
    attackMultiplier: 1.32,
    speedMultiplier: 1.12,
    hpBelow: 1,
    duration: 7,
    cooldown: 18,
    color: '#ffb36b',
    minLevel: 3,
    weight: 0.9,
    tags: ['melee', 'support'],
    forTags: ['melee', 'support'],
    description: '怒吼提气，攻势更猛',
  },
  sweep: {
    id: 'sweep',
    name: '回身斩',
    type: 'area',
    damageMultiplier: 1.25,
    radius: 126,
    cooldown: 7.5,
    knockback: 260,
    color: '#ffb27a',
    minLevel: 4,
    weight: 1.3,
    tags: ['melee'],
    forTags: ['melee'],
    description: '贴身回旋一斩，扫开周围敌人',
  },
  roar: {
    id: 'roar',
    name: '范围震击',
    type: 'area',
    damageMultiplier: 1.4,
    radius: 132,
    cooldown: 6,
    knockback: 320,
    color: '#ffd166',
    minLevel: 5,
    weight: 1.0,
    tags: ['melee', 'defense'],
    forTags: ['melee', 'defense'],
    description: '怒吼震荡周身敌人',
  },
  frenzy: {
    id: 'frenzy',
    name: '残血狂暴',
    type: 'buff',
    attackMultiplier: 1.5,
    speedMultiplier: 1.2,
    hpBelow: 0.35,
    duration: 8,
    cooldown: 14,
    color: '#ff5c5c',
    minLevel: 5,
    weight: 0.9,
    tags: ['melee'],
    forTags: ['melee', 'agile'],
    description: '重伤后更加凶猛',
  },
  heal: {
    id: 'heal',
    name: '疗伤咒',
    type: 'heal',
    healRatio: 0.26,
    hpBelow: 0.55,
    cooldown: 20,
    color: '#7ee0a1',
    minLevel: 8,
    weight: 0.7,
    tags: ['support'],
    forTags: ['support'],
    description: '运功疗伤，回复自身气血',
  },
  'iron-guard': {
    id: 'iron-guard',
    name: '横练铁布衫',
    type: 'buff',
    attackMultiplier: 1.08,
    speedMultiplier: 0.88,
    damageReduction: 0.45,
    hpBelow: 1,
    duration: 6,
    cooldown: 22,
    color: '#c9b48a',
    minLevel: 9,
    weight: 0.8,
    tags: ['defense', 'melee'],
    forTags: ['defense', 'melee'],
    description: '运起横练功夫，硬抗伤害',
  },
  'thunder-strike': {
    id: 'thunder-strike',
    name: '引雷诀',
    type: 'targetArea',
    damageMultiplier: 1.3,
    radius: 88,
    range: 380,
    cooldown: 9,
    knockback: 150,
    color: '#b8f0ff',
    minLevel: 11,
    weight: 0.8,
    tags: ['ranged'],
    forTags: ['ranged'],
    description: '在目标脚下引落一道天雷',
  },
  summon: {
    id: 'summon',
    name: '召唤小弟',
    type: 'summon',
    count: 2,
    cooldown: 18,
    minionType: 'wolf',
    minionLevelOffset: -2,
    minionRadius: 90,
    minLevel: 15,
    weight: 0.5,
    tags: ['summon'],
    forTags: ['summon', 'defense'],
    description: '唤来同伙围攻',
  },
};

/** 技能库数组（按等级领悟时遍历用） */
export const ENEMY_SKILL_LIST = Object.values(ENEMY_SKILLS);

/** 每个等级段能带几门武功（首领额外 +1） */
export const skillSlotsFor = (level, isBoss = false) => {
  const base = Math.min(4, 1 + Math.floor(level / 5));
  return isBoss ? Math.min(4, base + 1) : base;
};

/**
 * 按等级为敌人挑选携带的武功
 * - 先拿类型固有技能，再按等级从技能库补足槽位
 * - 技能有 tags 时，与敌人 skillTags 重叠越多权重越高（术士更容易学远程、和尚更容易学护体）
 * @param {Object} type 敌人类型配置
 * @param {Number} level 敌人等级
 * @returns {Array<String>} 技能 id 列表
 */
export const rollEnemySkills = (type, level) => {
  const base = (type.skills || []).filter((skillId) => ENEMY_SKILLS[skillId]);
  const limit = skillSlotsFor(level, type.isBoss);
  if (base.length >= limit) {
    return base.slice(0, limit);
  }
  const affinity = type.skillTags || [];
  const pool = ENEMY_SKILL_LIST.filter((skill) => {
    if (base.includes(skill.id) || (skill.minLevel || 1) > level) {
      return false;
    }
    // forTags：流派不合的敌人根本学不会（术士不冲锋、土匪不疗伤）
    if (skill.forTags && !skill.forTags.some((tag) => affinity.includes(tag))) {
      return false;
    }
    return true;
  }).map((skill) => {
    const matched = affinity.length && skill.tags ? skill.tags.filter((tag) => affinity.includes(tag)).length : 0;
    const affinityBonus = matched > 0 ? 1 + 0.75 * matched : 0.4;
    return { id: skill.id, weight: (skill.weight || 1) * affinityBonus };
  });

  const picked = base.slice();
  while (picked.length < limit && pool.length > 0) {
    const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;
    let index = pool.length - 1;
    for (let cursor = 0; cursor < pool.length; cursor++) {
      roll -= pool[cursor].weight;
      if (roll <= 0) {
        index = cursor;
        break;
      }
    }
    picked.push(pool[index].id);
    pool.splice(index, 1);
  }
  return picked;
};
