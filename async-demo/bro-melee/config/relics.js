/**
 * 神兵配置（README §12）
 * 屠龙刀 / 倚天剑：持有者获得属性提升 + 一门专属绝学，同时被全地图高手盯上
 * 只放数据与文案，加成在 core/relics.js 落地，绝学在 core/skills.js 按 id 实现
 */

export const RELICS = {
  dragonSaber: {
    id: 'dragonSaber',
    name: '屠龙刀',
    icon: '刀',
    color: '#ff9b5a',
    glow: '#ffd166',
    key: 'Q',
    description: '武林至尊，宝刀屠龙。号令天下，莫敢不从。',
    // 属性提升（玩家走 passive 乘区，敌人走基础值乘算）
    // 注意：*Multiplier 类字段是乘算（0.8 = −20%），cooldownMultiplier / *Bonus / damageReduction 是加算
    bonus: {
      attackMultiplier: 0.45,
      maxHpFlat: 90,
      defenseFlat: 6,
      critBonus: 0.08,
      meleeBonus: 0.6,
      speedMultiplier: 0.96,
      damageReduction: 0.06,
    },
    // 专属绝学：贴身大范围劈斩
    skill: {
      id: 'dragon-cleave',
      name: '屠龙一斩',
      cooldown: 6.5,
      range: 250,
      arc: Math.PI * 0.62,
      multiplier: 2.4,
      knockback: 460,
      color: '#ff9b5a',
      detail: '横刀劈出一道龙形刀罡，前方扇形内造成 240% 攻击伤害并狠狠击退。',
    },
    // 战力估值加成：持刀者会被 AI 判定为更危险的对手
    threat: 46,
  },
  heavenSword: {
    id: 'heavenSword',
    name: '倚天剑',
    icon: '剑',
    color: '#8fd0ff',
    glow: '#d8f0ff',
    key: 'E',
    description: '倚天一出，谁与争锋。剑气寒光，断金切玉。',
    bonus: {
      attackMultiplier: 0.28,
      maxHpFlat: 40,
      defenseFlat: 3,
      critBonus: 0.14,
      speedMultiplier: 1.18,
      cooldownMultiplier: -0.2,
      attackIntervalMultiplier: 0.8,
      dashCooldownMultiplier: 0.7,
    },
    // 专属绝学：环形剑气 + 减速
    skill: {
      id: 'heaven-flash',
      name: '倚天寒光',
      cooldown: 6,
      radius: 158,
      multiplier: 1.9,
      slowAmount: 0.5,
      slowDuration: 2.4,
      color: '#8fd0ff',
      detail: '剑气环身炸开，周身造成 190% 攻击伤害并冻结脚步 2.4 秒。',
    },
    threat: 40,
  },
};

/** 神兵 id 列表 */
export const RELIC_IDS = Object.keys(RELICS);

/** 通过 id 取神兵配置 */
export const getRelic = (relicId) => RELICS[relicId] || null;

/** 双兵合璧：同时持有两件的额外提升 */
export const PAIR_BONUS = {
  attackMultiplier: 0.25,
  critBonus: 0.1,
  damageReduction: 0.08,
  threat: 30,
  description: '刀剑合璧：攻势 +25%、暴击 +10%、所受伤害 -8%，但也更招人惦记。',
};
