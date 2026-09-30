// 波次配置：30 波 + Boss + 无尽循环
// 第 5/10/15/20/25/30... 波为 Boss（无尽模式下继续每 5 波一次）
// 每 5 波一个「主题」，让波次有辨识度而非同一模板

import { ENEMY_KIND, BOSS_DEFS } from './enemies.js';

const LINEAR_GROWTH = (n, base = 5, k = 2) => base + n * k;

// Boss 定义循环复用：第 25/30 波及无尽 35/40 波会回到列表开头
const BOSS_COUNT = BOSS_DEFS.length;

// 无尽模式：难度主要靠属性缩放（endlessK），数量温和增长并设软上限，避免同屏敌人过多卡顿
// 数量上限（单个种类，每波）
const ENDLESS_COUNT_CAP = {
  [ENEMY_KIND.NORMAL]: 84,
  [ENEMY_KIND.FLYING]: 45,
  [ENEMY_KIND.STEALTH]: 39,
  [ENEMY_KIND.RUSHER]: 42,
  [ENEMY_KIND.ARMORED]: 34,
  [ENEMY_KIND.HEALER]: 20,
  [ENEMY_KIND.SPLITTER]: 28,
};
// 超出 30 波后每波的数量增长率（乘在 30 波模板上）
const ENDLESS_COUNT_K = 0.08;

// 出怪间隔全局压缩系数：稳态同屏 ≈ 走完全程耗时(19s) ÷ 出怪间隔，
// 只堆数量不缩间隔是提不上同屏压力的（软上限 120 会永远摸不到）
const INTERVAL_MIN = 0.15;

// 出怪间隔压缩系数（随波次渐进收紧）
// 稳态同屏 ≈ 走完全程耗时(19s) ÷ 出怪间隔，所以同屏压力几乎全由间隔决定，堆数量是次要的。
// 实测：全局一刀切 ×0.6 会把新手期压死（3 座塔从撑到第 8 波 → 第 6 波就漏满），
// 因此改为 ≤8 波完全不压缩、之后线性收紧、无尽期固定 0.45。
export const intervalScale = (waveIdx) => {
  const w = Math.max(1, waveIdx);
  const s = 1 - (w - 8) * 0.025;
  return s < 0.45 ? 0.45 : s > 1 ? 1 : s;
};

// ===== 波次主题 =====
// 每 5 波循环一次，决定该波段的额外构成。
// 偏挑战：主题波会在常规构成上叠加一种「压力类型」，逼玩家调整防线。
export const WAVE_THEMES = {
  RUSH: {
    key: 'RUSH',
    name: '冲锋潮',
    desc: '大量高速冲锋兵突进',
    // 附加敌人：种类 + 数量系数（按波次缩放）+ 出怪间隔
    add: [{ kind: ENEMY_KIND.RUSHER, base: 3, perWave: 0.5, interval: 0.5 }],
  },
  AIR: {
    key: 'AIR',
    name: '空袭波',
    desc: '飞龙集群来袭，地面塔无效',
    add: [{ kind: ENEMY_KIND.FLYING, base: 4, perWave: 0.6, interval: 0.7 }],
  },
  ARMOR: {
    key: 'ARMOR',
    name: '装甲纵队',
    desc: '高减伤装甲兵压境',
    add: [{ kind: ENEMY_KIND.ARMORED, base: 3, perWave: 0.45, interval: 1.0 }],
  },
  SHADOW: {
    key: 'SHADOW',
    name: '影袭波',
    desc: '隐身单位密集，缺反隐必漏',
    add: [{ kind: ENEMY_KIND.STEALTH, base: 3, perWave: 0.45, interval: 0.9 }],
  },
  SIEGE: {
    key: 'SIEGE',
    name: '围城波',
    desc: '巫医治疗 + 分裂怪消耗',
    // 巫医数量克制（base 低 + 增长慢），避免整波被奶到打不动
    add: [
      { kind: ENEMY_KIND.HEALER, base: 2, perWave: 0.12, interval: 1.4, cap: 5 },
      { kind: ENEMY_KIND.SPLITTER, base: 2, perWave: 0.35, interval: 1.2 },
    ],
  },
};

// 主题循环顺序（每 5 波推进一个，Boss 波本身不套主题）
const THEME_ORDER = [
  WAVE_THEMES.RUSH,
  WAVE_THEMES.AIR,
  WAVE_THEMES.ARMOR,
  WAVE_THEMES.SHADOW,
  WAVE_THEMES.SIEGE,
];

// 该波属于哪个主题（Boss 波返回 null）
export const waveTheme = (waveIdx) => {
  if (waveIdx % 5 === 0) return null;
  const seg = Math.floor(waveIdx / 5);       // 0→1-4波, 1→6-9波, 2→11-14波...
  return THEME_ORDER[seg % THEME_ORDER.length];
};

// ===== 精英怪比例 =====
// 偏挑战：21 波起精英潮，26 波起密度提升，无尽模式继续递增
export const eliteRatio = (waveIdx) => {
  const w = Math.max(1, waveIdx);
  if (w < 21) return 0;
  if (w <= 24) return 0.18;       // 21~24：精英潮
  if (w <= 29) return 0.32;       // 26~29（25 是 Boss）：密度提升
  if (w <= 40) return 0.40;       // 无尽前期
  return Math.min(0.85, 0.40 + (w - 40) * 0.01);  // 无尽后期，上限 85%
};

// 每波生成配置（敌人种类 + 数量 + 间隔秒）
// 返回 [{ kind, count, interval, eliteRatio }]，waveIdx 可为任意正整数（无尽模式）
export const buildWavePlan = (waveIdx) => {
  if (!Number.isFinite(waveIdx) || waveIdx < 1) return [];

  // Boss 波（30 波后继续，Boss 循环复用，强度由 multHp / endlessK 提供）
  if (waveIdx % 5 === 0) {
    const bossIdx = Math.floor(waveIdx / 5 - 1) % BOSS_COUNT;
    return [{ kind: 'boss', bossIdx, count: 1, interval: 0 }];
  }

  // 模板基准：超过 30 波沿用 30 波构成，再按超出量温和放大
  const w = Math.min(waveIdx, 30);

  const plan = [];
  // 普通
  plan.push({ kind: ENEMY_KIND.NORMAL, count: LINEAR_GROWTH(w, 4, 1.6) | 0, interval: 0.8 });

  // 飞行从第 6 波起出现
  if (w >= 6) {
    plan.push({ kind: ENEMY_KIND.FLYING, count: Math.max(1, (w - 4) | 0), interval: 1.0 });
  }

  // 隐身从第 11 波起出现
  if (w >= 11) {
    plan.push({ kind: ENEMY_KIND.STEALTH, count: Math.max(1, (w - 9) | 0), interval: 1.2 });
  }

  // 分裂怪从第 14 波起常驻：死亡分裂逼玩家配溅射，不再只靠 SIEGE 主题偶尔露面
  if (w >= 14) {
    plan.push({ kind: ENEMY_KIND.SPLITTER, count: Math.max(1, Math.round((w - 12) * 0.5)), interval: 1.2 });
  }

  // 巫医从第 18 波起常驻：数量克制（增长慢 + 整波封顶），避免整波被奶到打不动
  if (w >= 18) {
    plan.push({ kind: ENEMY_KIND.HEALER, count: Math.max(1, Math.round((w - 16) * 0.25)), interval: 1.4 });
  }

  // 主题附加：让每 5 波有明确辨识度
  // 同种类已存在时合并进现有条目（避免同波出现两个同种类分组），并支持 cap 截断
  const theme = waveTheme(waveIdx);
  if (theme) {
    for (const a of theme.add) {
      let n = Math.max(1, Math.round(a.base + (w - 1) * a.perWave));
      if (a.cap) n = Math.min(n, a.cap);
      const exist = plan.find((p) => p.kind === a.kind);
      if (exist) exist.count += n;
      else plan.push({ kind: a.kind, count: n, interval: a.interval });
    }
  }

  // 15 波之后混合期
  if (w >= 16) plan[0].count += 3;
  // 21 波之后强化期
  if (w >= 21) {
    plan.forEach((p) => {
      if (p.kind !== 'boss') p.count = Math.ceil(p.count * 1.3);
    });
  }

  // 无尽模式放大 + 上限截断
  if (waveIdx > 30) {
    const k = 1 + (waveIdx - 30) * ENDLESS_COUNT_K;
    plan.forEach((p) => {
      const cap = ENDLESS_COUNT_CAP[p.kind] ?? 999;
      p.count = Math.min(Math.ceil(p.count * k), cap);
    });
  }

  // 巫医整波封顶：无论常驻池还是主题叠加，都不超过 6 只
  const healerEntry = plan.find((p) => p.kind === ENEMY_KIND.HEALER);
  if (healerEntry) healerEntry.count = Math.min(healerEntry.count, 6);

  // 压缩出怪间隔（同屏压力的主要来源，放在数量结算之后统一生效）
  const iscale = intervalScale(waveIdx);
  plan.forEach((p) => {
    p.interval = Math.max(INTERVAL_MIN, (p.interval || 0.8) * iscale);
  });

  // 精英比例挂到整波（实际精英化在 spawn 时按概率逐只决定）
  const er = eliteRatio(waveIdx);
  plan.forEach((p) => { p.eliteRatio = er; });
  if (er > 0) plan.theme = theme ? theme.key : null;

  return plan;
};

// Boss 出口：在哪条路径刷
export const bossSpawnPath = (waveIdx) => {
  const idx = Math.floor(waveIdx / 5) - 1;
  return idx % 2 === 0 ? 'A' : 'B';
};

// 每波结束奖励 + Boss 击杀奖励
export const WAVE_END_REWARD = (wave) => 10 + wave * 5;
export const BOSS_END_REWARD = (wave) => 100 + wave * 20;

// 失败条件
export const LEAK_LIMIT = 20;

// 无尽模式：属性缩放每波 +4%（线性）
// 原为每 4 波 +8%（等效每波 +2%），60 波时仅 6.2×，24 座满级塔零漏怪明显过剩
export const ENDLESS_K = 0.04;
export const ENDLESS_PERIOD = 1;

// 同屏敌人软上限：超过后暂停生成新敌人（防卡顿，队列里的继续等）
export const MAX_ALIVE_ENEMIES = 120;
