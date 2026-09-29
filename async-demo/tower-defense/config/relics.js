// 遗物：Boss 击杀后三选一，全局永久生效
// 偏挑战基调：每个遗物都有明确取舍，玩家按当前短板选，不是单纯变强

export const RELIC_KIND = {
  // === 输出向 ===
  TOWER_POWER: 'towerPower',       // 全塔伤害 +18%
  TOWER_SPEED: 'towerSpeed',       // 全塔攻速 +20%
  TOWER_RANGE: 'towerRange',       // 全塔射程 +15%
  HERO_DMG: 'heroDmg',             // 英雄伤害 +30%
  SPLASH_BOOST: 'splashBoost',     // 溅射范围 +30%

  // === 经济向 ===
  GOLD_GAIN: 'goldGain',           // 击杀金币 +3
  INTEREST: 'interest',            // 每波结束额外 +15% 金币
  SELL_REFUND: 'sellRefund',       // 出售返还 100%（原 70%）

  // === 生存向 ===
  HERO_HP: 'heroHp',               // 英雄最大生命 +60
  HERO_REGEN: 'heroRegen',         // 英雄每秒回血 2
  LEAK_FORGIVE: 'leakForgive',     // 漏怪上限 +8
  SUMMON_HP: 'summonHp',           // 小兵生命 +50%

  // === 特殊机制 ===
  EXECUTE: 'execute',              // 敌人低于 12% 血时直接斩杀
  SLOW_AURA: 'slowAura',           // 全体敌人移速 -12%
  CRIT: 'crit',                    // 塔攻击 15% 概率双倍伤害
  FREE_MOVE: 'freeMove',           // 塔移动免费且次数 +4
};

export const RELIC_DEFS = {
  [RELIC_KIND.TOWER_POWER]: {
    name: '锋锐符文', kind: RELIC_KIND.TOWER_POWER, color: '#f87171',
    desc: '全部建筑伤害 +18%',
  },
  [RELIC_KIND.TOWER_SPEED]: {
    name: '疾风齿轮', kind: RELIC_KIND.TOWER_SPEED, color: '#fbbf24',
    desc: '全部建筑攻速 +20%',
  },
  [RELIC_KIND.TOWER_RANGE]: {
    name: '远视棱镜', kind: RELIC_KIND.TOWER_RANGE, color: '#38bdf8',
    desc: '全部建筑射程 +15%',
  },
  [RELIC_KIND.HERO_DMG]: {
    name: '战神之刃', kind: RELIC_KIND.HERO_DMG, color: '#f472b6',
    desc: '英雄普攻与技能伤害 +30%',
  },
  [RELIC_KIND.SPLASH_BOOST]: {
    name: '爆裂核心', kind: RELIC_KIND.SPLASH_BOOST, color: '#fb923c',
    desc: '炮营溅射范围 +30%',
  },
  [RELIC_KIND.GOLD_GAIN]: {
    name: '贪婪之匣', kind: RELIC_KIND.GOLD_GAIN, color: '#facc15',
    desc: '每次击杀额外 +3 金币',
  },
  [RELIC_KIND.INTEREST]: {
    name: '商队契约', kind: RELIC_KIND.INTEREST, color: '#a3e635',
    desc: '每波结束奖励 +15%',
  },
  [RELIC_KIND.SELL_REFUND]: {
    name: '回响契约', kind: RELIC_KIND.SELL_REFUND, color: '#34d399',
    desc: '出售建筑返还 100% 金币',
  },
  [RELIC_KIND.HERO_HP]: {
    name: '不灭心核', kind: RELIC_KIND.HERO_HP, color: '#4ade80',
    desc: '英雄最大生命 +60',
  },
  [RELIC_KIND.HERO_REGEN]: {
    name: '生命之泉', kind: RELIC_KIND.HERO_REGEN, color: '#22d3ee',
    desc: '英雄每秒回复 2 点生命',
  },
  [RELIC_KIND.LEAK_FORGIVE]: {
    name: '宽容壁垒', kind: RELIC_KIND.LEAK_FORGIVE, color: '#94a3b8',
    desc: '漏怪上限 +8',
  },
  [RELIC_KIND.SUMMON_HP]: {
    name: '坚韧军旗', kind: RELIC_KIND.SUMMON_HP, color: '#10b981',
    desc: '兵营小兵生命 +50%',
  },
  [RELIC_KIND.EXECUTE]: {
    name: '斩杀诏令', kind: RELIC_KIND.EXECUTE, color: '#ef4444',
    desc: '敌人生命低于 12% 时立即斩杀',
  },
  [RELIC_KIND.SLOW_AURA]: {
    name: '寒霜领域', kind: RELIC_KIND.SLOW_AURA, color: '#60a5fa',
    desc: '全体敌人移速 -12%',
  },
  [RELIC_KIND.CRIT]: {
    name: '幸运骰', kind: RELIC_KIND.CRIT, color: '#c084fc',
    desc: '建筑攻击 15% 概率造成双倍伤害',
  },
  [RELIC_KIND.FREE_MOVE]: {
    name: '迁跃符', kind: RELIC_KIND.FREE_MOVE, color: '#818cf8',
    desc: '建筑移动免费，且次数 +4',
  },
};

export const RELIC_LIST = Object.values(RELIC_DEFS);

// 遗物数值（集中在一处，便于平衡调整）
export const RELIC_VALUES = {
  towerDmgMult: 0.18,
  towerSpeedMult: 0.20,
  towerRangeMult: 0.15,
  heroDmgMult: 0.30,
  splashMult: 0.30,
  goldPerKill: 3,
  waveRewardMult: 0.15,
  heroHpBonus: 60,
  heroRegenPerSec: 2,
  leakBonus: 8,
  summonHpMult: 0.50,
  executeThreshold: 0.12,
  slowAuraMult: 0.12,
  critChance: 0.15,
  moveCountBonus: 4,
};

// 从已持有遗物随机抽 n 个未重复的候选
export const rollRelicChoices = (owned, n = 3) => {
  const ownedSet = new Set(owned.map((r) => r.kind));
  const pool = RELIC_LIST.filter((r) => !ownedSet.has(r.kind));
  const out = [];
  const copy = pool.slice();
  while (out.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
};
