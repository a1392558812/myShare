// 波次配置：30 波 + Boss + 无尽循环
// 第 5/10/15/20/25/30... 波为 Boss（无尽模式下继续每 5 波一次）

import { ENEMY_KIND, BOSS_DEFS } from './enemies.js';

const LINEAR_GROWTH = (n, base = 5, k = 2) => base + n * k;

// Boss 定义循环复用：第 25/30 波及无尽 35/40 波会回到列表开头
const BOSS_COUNT = BOSS_DEFS.length;

// 无尽模式：难度主要靠属性缩放（endlessK），数量只温和增长并设软上限，避免同屏敌人过多卡顿
// 数量上限（单个种类，每波）
const ENDLESS_COUNT_CAP = {
  [ENEMY_KIND.NORMAL]: 60,
  [ENEMY_KIND.FLYING]: 32,
  [ENEMY_KIND.STEALTH]: 28,
};
// 超出 30 波后每波的数量增长率（乘在 30 波模板上）
const ENDLESS_COUNT_K = 0.04;

// 每波生成配置（敌人种类 + 数量 + 间隔秒）
// 返回 [{ kind, count, interval }]，waveIdx 可为任意正整数（无尽模式）
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

// 无尽模式：+8% / 4 波
export const ENDLESS_K = 0.08;
export const ENDLESS_PERIOD = 4;

// 同屏敌人软上限：超过后暂停生成新敌人（防卡顿，队列里的继续等）
export const MAX_ALIVE_ENEMIES = 120;
