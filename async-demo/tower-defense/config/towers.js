// 9 种塔的配置
// 兵营 / 炮营 / 箭楼 / 科技前哨站 / 反隐塔 / 冰霜塔 / 雷霆塔 / 狙击塔 / 增幅塔
// 全部建筑统一 6 级：level 0..5 对应显示 Lv1..Lv6，所有等级数组长度均为 6

import { CELL } from './paths.js';

// 统一满级（显示等级）
export const MAX_TOWER_LEVEL = 6;

export const TOWER_KIND = {
  BARRACKS: 'barracks',
  CANNON: 'cannon',
  ARROW: 'arrow',
  TECH: 'tech',
  DETECTOR: 'detector',
  FROST: 'frost',
  TESLA: 'tesla',
  SNIPER: 'sniper',
  AMP: 'amp',
};

export const TOWER_DEFS = {
  [TOWER_KIND.BARRACKS]: {
    name: '兵营',
    color: '#10b981',
    ringColor: '#34d399',
    iconColor: '#a7f3d0',
    desc: '小兵驻守集结点，死亡后补给',
    cost: 50,
    upgradeCost: [40, 80, 120, 160, 200],
    maxLevel: 6,
    canHitFlying: true,
    canHitStealth: true,
    attackType: 'summon',
    summonRange: 1.6 * CELL,
    summonInterval: 1500,
    summonStart: 1,
    summonPerLevel: 1,
    maxSummons: 6,
    summonDmg: [10, 16, 22, 28, 36, 46],
    summonHp: [18, 32, 50, 72, 100, 140],
    resupplyDelay: [5000, 4500, 4000, 3500, 3000, 2500],
    // 小兵索敌范围（固定，不随升级变大）
    aggroRange: 2 * CELL,
    // 集结范围（随等级扩大）：玩家能把集结点设到离兵营多远的小半径
    rallyRange: [1.5 * CELL, 3.0 * CELL, 4.5 * CELL, 6.0 * CELL, 7.5 * CELL, 8.0 * CELL],
    sellRefund: 0.7,
  },
  [TOWER_KIND.CANNON]: {
    name: '炮营',
    color: '#ef4444',
    ringColor: '#fca5a5',
    iconColor: '#fecaca',
    desc: '溅射 + 三级洲际导弹 + 火焰灼烧',
    cost: 100,
    upgradeCost: [80, 140, 200, 280, 360],
    maxLevel: 6,
    canHitFlying: true,
    canHitStealth: true,
    range: [3.2 * CELL, 3.5 * CELL, 3.8 * CELL, 4.1 * CELL, 4.4 * CELL, 4.7 * CELL],
    attackInterval: [1500, 1420, 1320, 1220, 1120, 1000],
    dmg: [22, 30, 40, 52, 68, 88],
    splash: [1.1 * CELL, 1.2 * CELL, 1.35 * CELL, 1.5 * CELL, 1.65 * CELL, 1.85 * CELL],
    attackType: 'cannon',
    projectileSpeed: 360,
    // 洲际导弹（Lv3 解锁）
    missileInterval: [0, 0, 9000, 8200, 7400, 6500],
    missileDmg: [0, 0, 150, 190, 240, 320],
    missileSplash: [0, 0, 2.0 * CELL, 2.2 * CELL, 2.4 * CELL, 2.7 * CELL],
    // 火焰灼烧区（Lv3 后概率触发）
    fireChance: [0, 0, 0.35, 0.4, 0.45, 0.55],
    fireRadius: 1.2 * CELL,
    fireDuration: 3500,
    fireDps: 8,
    fireSlow: 0.4,
    sellRefund: 0.7,
  },
  [TOWER_KIND.ARROW]: {
    name: '箭楼',
    color: '#f59e0b',
    ringColor: '#fbbf24',
    iconColor: '#fde68a',
    desc: '高频单体，唯一对空高频塔',
    cost: 75,
    upgradeCost: [60, 110, 170, 230, 300],
    maxLevel: 6,
    canHitFlying: true,
    canHitStealth: true,
    range: [3.6 * CELL, 3.9 * CELL, 4.2 * CELL, 4.5 * CELL, 4.8 * CELL, 5.2 * CELL],
    attackInterval: [450, 420, 390, 360, 330, 300],
    dmg: [9, 13, 18, 24, 32, 42],
    attackType: 'arrow',
    projectileSpeed: 720,
    pierce: 1,
    sellRefund: 0.7,
  },
  [TOWER_KIND.TECH]: {
    name: '科技前哨站',
    color: '#a855f7',
    ringColor: '#c084fc',
    iconColor: '#e9d5ff',
    desc: '选择技能，三级攻击减速，满级光环',
    cost: 150,
    upgradeCost: [100, 150, 200, 260, 320],
    maxLevel: 6,
    attackType: 'tech',
    aura: 5 * CELL,
    // 攻击能力（三级起）
    techAttackRange: [0, 0, 3.0 * CELL, 3.4 * CELL, 3.8 * CELL, 4.2 * CELL],
    techAttackDmg: [0, 0, 14, 20, 28, 40],
    techAttackInterval: [0, 0, 1200, 1100, 1000, 900],
    techSlow: [0, 0, 0.3, 0.35, 0.45, 0.5],
    techSlowDuration: 1500,
    techChargeInterval: 12000,
    skillUpgradeInterval: 8000,
    sellRefund: 0.7,
  },
  [TOWER_KIND.DETECTOR]: {
    name: '反隐塔',
    color: '#06b6d4',
    ringColor: '#22d3ee',
    iconColor: '#a5f3fc',
    desc: '侦测 + 三级毒雾增伤',
    cost: 60,
    upgradeCost: [60, 110, 170, 230, 300],
    maxLevel: 6,
    attackType: 'detect',
    range: [3 * CELL, 3.3 * CELL, 3.6 * CELL, 3.9 * CELL, 4.2 * CELL, 4.6 * CELL],
    // 毒雾（Lv3 解锁）
    poisonInterval: [0, 0, 6000, 5600, 5200, 4600],
    poisonRadius: [0, 0, 2.5 * CELL, 2.7 * CELL, 2.9 * CELL, 3.2 * CELL],
    poisonDuration: 4000,
    poisonDmgAmp: [1, 1, 1.35, 1.45, 1.6, 1.8],
    poisonDps: [0, 0, 6, 8, 10, 13],
    sellRefund: 0.7,
  },
  [TOWER_KIND.FROST]: {
    name: '冰霜塔',
    color: '#0ea5e9',
    ringColor: '#7dd3fc',
    iconColor: '#e0f2fe',
    desc: '范围常驻减速 + 三级冻结',
    cost: 80,
    upgradeCost: [65, 115, 170, 230, 300],
    maxLevel: 6,
    attackType: 'frost',
    // 冰霜领域半径（同时是减速/冰伤的作用范围）
    range: [2.2 * CELL, 2.5 * CELL, 2.8 * CELL, 3.1 * CELL, 3.4 * CELL, 3.8 * CELL],
    // 减速百分比（持久作用在范围内所有敌人身上）
    slow: [0.25, 0.30, 0.35, 0.40, 0.45, 0.50],
    // 冰霜持续伤害（DPS，少量，主要靠控场）
    dps: [4, 6, 9, 12, 16, 20],
    // 冻结（Lv3 解锁）：周期性把范围内一只敌人完全定身（100% 减速）
    freezeInterval: [0, 0, 9000, 8000, 7000, 6000],
    freezeDuration: [0, 0, 1200, 1400, 1600, 1800],
    sellRefund: 0.7,
  },
  [TOWER_KIND.TESLA]: {
    name: '雷霆塔',
    color: '#6366f1',
    ringColor: '#818cf8',
    iconColor: '#c7d2fe',
    desc: '瞬发链式闪电，跳跃多个目标',
    cost: 120,
    upgradeCost: [90, 150, 210, 280, 360],
    maxLevel: 6,
    range: [2.8 * CELL, 3.0 * CELL, 3.2 * CELL, 3.4 * CELL, 3.6 * CELL, 3.9 * CELL],
    attackInterval: [1200, 1100, 1000, 900, 800, 700],
    dmg: [18, 25, 33, 44, 58, 74],
    attackType: 'chain',
    // 连锁目标总数（含首目标）
    chainCount: [2, 3, 3, 4, 4, 5],
    // 每一跳的最大跳跃距离
    chainRange: [1.6 * CELL, 1.8 * CELL, 2.0 * CELL, 2.2 * CELL, 2.4 * CELL, 2.6 * CELL],
    // 每跳伤害衰减系数
    chainFalloff: 0.72,
    sellRefund: 0.7,
  },
  [TOWER_KIND.SNIPER]: {
    name: '狙击塔',
    color: '#0891b2',
    ringColor: '#67e8f9',
    iconColor: '#cffafe',
    desc: '超远程点杀，无视护甲，优先狙杀 Boss',
    cost: 140,
    upgradeCost: [110, 170, 230, 300, 380],
    maxLevel: 6,
    range: [6.0 * CELL, 6.6 * CELL, 7.2 * CELL, 7.8 * CELL, 8.4 * CELL, 9.0 * CELL],
    attackInterval: [2600, 2400, 2200, 2000, 1800, 1600],
    dmg: [55, 72, 95, 125, 165, 215],
    attackType: 'sniper',
    projectileSpeed: 1200,
    // 索敌：优先血最多（精英 / Boss）
    targetMode: 'strongest',
    // 无视护甲：装甲兵的常驻减伤对它无效
    ignoreArmor: true,
    // 对精英 / Boss 的额外倍率（Lv3 起）
    eliteBonus: [1, 1, 1.15, 1.25, 1.35, 1.5],
    sellRefund: 0.7,
  },
  [TOWER_KIND.AMP]: {
    name: '增幅塔',
    color: '#f472b6',
    ringColor: '#f9a8d4',
    iconColor: '#fbcfe8',
    desc: '自身不攻击，光环内塔提升伤害与攻速',
    cost: 90,
    upgradeCost: [70, 120, 180, 240, 310],
    maxLevel: 6,
    attackType: 'amp',
    // 光环半径（只对建筑生效）
    auraRange: [2.5 * CELL, 2.8 * CELL, 3.1 * CELL, 3.4 * CELL, 3.7 * CELL, 4.0 * CELL],
    // 范围内每座塔额外获得的伤害加成（多座增幅塔线性叠加）
    dmgBoost: [0.10, 0.14, 0.18, 0.22, 0.26, 0.32],
    // 范围内每座塔额外获得的攻速加成
    speedBoost: [0.08, 0.10, 0.12, 0.14, 0.16, 0.20],
    sellRefund: 0.7,
  },
};

export const TOWER_LIST = [
  TOWER_DEFS[TOWER_KIND.BARRACKS],
  TOWER_DEFS[TOWER_KIND.CANNON],
  TOWER_DEFS[TOWER_KIND.ARROW],
  TOWER_DEFS[TOWER_KIND.TECH],
  TOWER_DEFS[TOWER_KIND.DETECTOR],
  TOWER_DEFS[TOWER_KIND.FROST],
  TOWER_DEFS[TOWER_KIND.TESLA],
  TOWER_DEFS[TOWER_KIND.SNIPER],
  TOWER_DEFS[TOWER_KIND.AMP],
];

// 计算升级价格（已升级次数 level → cost）
export const nextUpgradeCost = (kind, level) => {
  const def = TOWER_DEFS[kind];
  if (!def || !def.upgradeCost) return 0;
  if (level >= def.upgradeCost.length) return Infinity;
  return def.upgradeCost[level];
};

// 是否已满级（level 为 0 起的升级次数）
export const isMaxLevel = (kind, level) => {
  const def = TOWER_DEFS[kind];
  if (!def || !def.upgradeCost) return true;
  return level >= def.upgradeCost.length;
};

// 显示用等级（1 起）：level 0 → 1 级
export const displayLevel = (tower) => (tower ? (tower.level || 0) + 1 : 0);

// 满级显示等级（全部建筑统一 6 级）
export const maxDisplayLevel = (kind) => {
  const def = TOWER_DEFS[kind];
  if (!def || !def.upgradeCost) return 1;
  return def.upgradeCost.length + 1;
};

// 移动塔的费用 = 基础价 × 0.3
export const MOVE_COST_RATIO = 0.3;
