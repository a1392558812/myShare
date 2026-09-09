// 英雄技能配置
// 起始自带「横扫冲击波」
// 4 个可解锁技能由科技前哨站分配（玩家主动选择）
// 每个可解锁技能满级（6 级）解锁对应光环

export const SKILL_KIND = {
  SHOCKWAVE: 'shockwave',
  ARROW_RAIN: 'arrowRain',
  HEAL: 'heal',
  CHAIN_LIGHTNING: 'chainLightning',
  ULTIMATE_BEAM: 'ultimateBeam',
  BLOOD_PACT: 'bloodPact',
};

export const SKILL_DEFS = {
  [SKILL_KIND.SHOCKWAVE]: {
    name: '横扫冲击波',
    desc: '360° 推开周围敌人',
    cooldown: 2500,
    unlockedByDefault: true,
    maxLevel: 5,
    upgradePerLevel: { radius: 8, knockback: 8, cd: -100 },
    base: { radius: 80, knockback: 60 },
    kind: 'shockwave',
  },
  [SKILL_KIND.ARROW_RAIN]: {
    name: '弹幕箭雨',
    desc: '朝鼠标方向射出多支追踪箭',
    cooldown: 8000,
    maxLevel: 6,
    upgradePerLevel: { count: 1, dmg: 4, cd: -400 },
    base: { count: 5, dmg: 12, speed: 520, life: 1.2 },
    kind: 'arrowRain',
    // 6 级光环
    aura6: {
      name: '攻速光环',
      desc: '满级：英雄范围内建筑攻速提升',
      kind: 'atkSpeed',
      range: 3.5 * 32,
      atkSpeedBoost: 0.5,
    },
  },
  [SKILL_KIND.HEAL]: {
    name: '治愈之风',
    desc: '范围内塔持续回血',
    cooldown: 15000,
    maxLevel: 6,
    upgradePerLevel: { duration: 1000, hpPerSec: 1, cd: -500 },
    base: { duration: 5000, range: 5 * 32, hpPerSec: 2 },
    kind: 'heal',
    // 6 级光环
    aura6: {
      name: '恢复光环',
      desc: '满级：英雄范围内小兵持续回血',
      kind: 'regen',
      range: 3.5 * 32,
      regenPerSec: 5,
    },
  },
  [SKILL_KIND.CHAIN_LIGHTNING]: {
    name: '雷霆链',
    desc: '向最近敌人发射连锁闪电',
    cooldown: 12000,
    maxLevel: 6,
    upgradePerLevel: { bounces: 1, dmg: 6, cd: -400 },
    base: { bounces: 4, dmg: 18, range: 240 },
    kind: 'chain',
    // 6 级光环
    aura6: {
      name: '吸血光环',
      desc: '满级：英雄/小兵攻击吸血',
      kind: 'lifesteal',
      lifesteal: 0.25,
    },
  },
  [SKILL_KIND.ULTIMATE_BEAM]: {
    name: '终极射线',
    desc: '持续射线，期间英雄能挡所有敌人',
    cooldown: 30000,
    maxLevel: 6,
    upgradePerLevel: { duration: 400, dmg: 4, cd: -800 },
    base: { duration: 1500, dmg: 8, width: 28 },
    kind: 'beam',
    // 6 级光环
    aura6: {
      name: '增伤光环',
      desc: '满级：英雄/小兵/塔伤害提升',
      kind: 'dmgBoost',
      dmgBoost: 1.35,
    },
  },

  // ===== 血契：唯一可叠加的前哨站技能 =====
  // 被动（不占主动技能键、不解锁主动技能），多座前哨站可同时缔结
  // 每座按自身等级提供英雄加成，全部叠加；满级（Lv6）额外提供 1 次英雄复活
  [SKILL_KIND.BLOOD_PACT]: {
    name: '血契',
    desc: '叠加被动：英雄生命/减伤/吸血；满级可替英雄抵命',
    passive: true,
    stackable: true,
    maxLevel: 6,
    // 索引 = 前哨站等级 0..5（Lv1..Lv6），单座塔提供的加成
    heroBonus: {
      hp: [40, 60, 85, 115, 150, 200],
      dr: [0.04, 0.06, 0.08, 0.10, 0.12, 0.15],
      lifesteal: [0.03, 0.045, 0.06, 0.075, 0.09, 0.12],
    },
    // 叠加上限：额外生命无上限，减伤/吸血有上限
    bonusCap: { dr: 0.6, lifesteal: 0.35 },
    // 满级提供复活（消耗该塔）
    reviveAtMaxLevel: true,
    reviveHpRatio: 0.6,
    reviveInvulnMs: 1500,
  },
};

export const SKILL_LIST = Object.values(SKILL_DEFS);

// 可由科技前哨站分配的主动技能（不含默认的冲击波）
// 互斥：一座前哨站选了 A，其他前哨站就不能再选 A
export const ASSIGNABLE_SKILLS = [
  SKILL_KIND.ARROW_RAIN,
  SKILL_KIND.HEAL,
  SKILL_KIND.CHAIN_LIGHTNING,
  SKILL_KIND.ULTIMATE_BEAM,
];

// 可叠加的前哨站技能：多座前哨站可同时选择，加成累加
export const STACKABLE_SKILLS = [
  SKILL_KIND.BLOOD_PACT,
];

// 前哨站技能选择面板的全部选项
export const TECH_PICKABLE_SKILLS = [...ASSIGNABLE_SKILLS, ...STACKABLE_SKILLS];

// 技能是否可叠加
export const isStackableSkill = (kind) => !!SKILL_DEFS[kind]?.stackable;

// 科技前哨站每级带来的英雄属性成长（累加到英雄基础属性上）
// 强化
export const HERO_GROWTH_PER_TECH_LEVEL = {
  hp: 12,
  dmg: 3,
  interval: -25,
};

// 起始技能槽：起始自带 SHOCKWAVE
export const computeUnlockedSkills = () =>
  SKILL_LIST.filter((s) => s.unlockedByDefault);

// 英雄属性
export const HERO_HP_BASE = 100;
export const HERO_SPEED = 220;
export const HERO_HITBOX = 14;
