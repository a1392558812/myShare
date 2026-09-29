// 7 种敌人（3 基础 + 4 扩展）+ 6 Boss + 精英怪机制
// 偏挑战基调：扩展敌人各有克制需求，逼玩家搭配塔种与技能路线

export const ENEMY_KIND = {
  NORMAL: 'normal',
  FLYING: 'flying',
  STEALTH: 'stealth',
  // === 扩展 4 种 ===
  RUSHER: 'rusher',     // 冲锋兵：高速低血，考验瞬间爆发
  ARMORED: 'armored',   // 装甲兵：高减伤，考验持续输出
  HEALER: 'healer',     // 治疗兵：奶周围敌人，必须优先点掉
  SPLITTER: 'splitter', // 分裂怪：死亡分裂，考验溅射
};

export const ENEMY_DEFS = {
  [ENEMY_KIND.NORMAL]: {
    name: '步兵',
    color: '#94a3b8',
    hp: 30,
    speed: 60,
    reward: 5,
    bounty: 5,
    size: 12,
    icon: 'soldier',
    flying: false,
    stealth: false,
  },
  [ENEMY_KIND.FLYING]: {
    name: '飞龙',
    color: '#38bdf8',
    hp: 20,
    speed: 85,
    reward: 8,
    bounty: 8,
    size: 12,
    icon: 'dragon',
    flying: true,
    stealth: false,
    floatY: 24,
  },
  [ENEMY_KIND.STEALTH]: {
    name: '幽影',
    color: '#a78bfa',
    hp: 45,
    speed: 50,
    reward: 12,
    bounty: 12,
    size: 12,
    icon: 'ghost',
    flying: false,
    stealth: true,
    alpha: 0.25,
  },

  // === 扩展 4 种 ===
  [ENEMY_KIND.RUSHER]: {
    name: '冲锋兵',
    color: '#fb923c',
    hp: 22,
    speed: 125,          // 约步兵 2 倍速
    reward: 9,
    bounty: 9,
    size: 11,
    icon: 'rusher',
    flying: false,
    stealth: false,
    // 冲锋：周期性提速冲刺，冷却期间恢复常速
    charge: { period: 3500, dashMs: 1200, speedMult: 1.8 },
  },
  [ENEMY_KIND.ARMORED]: {
    name: '装甲兵',
    color: '#78716c',
    hp: 90,
    speed: 42,           // 慢速
    reward: 14,
    bounty: 14,
    size: 14,
    icon: 'armored',
    flying: false,
    stealth: false,
    // 常驻减伤（区别于 Boss 的「前 N 秒装甲」）
    armor: { mult: 0.55 },   // 受到 45% 伤害
  },
  [ENEMY_KIND.HEALER]: {
    name: '巫医',
    color: '#4ade80',
    hp: 55,
    speed: 52,
    reward: 16,
    bounty: 16,
    size: 12,
    icon: 'healer',
    flying: false,
    stealth: false,
    // 治疗光环：周期性治疗范围内的其他敌人
    healAura: { interval: 3000, range: 2.2 * 32, amount: 18 },
  },
  [ENEMY_KIND.SPLITTER]: {
    name: '分裂怪',
    color: '#f472b6',
    hp: 60,
    speed: 55,
    reward: 10,
    bounty: 10,
    size: 15,
    icon: 'splitter',
    flying: false,
    stealth: false,
    // 死亡分裂：分裂出的小怪继承路径进度
    split: { kind: ENEMY_KIND.NORMAL, count: 2, hpMult: 0.35, speedMult: 1.25, bounty: 2 },
  },
};

// 精英怪机制：基础怪的属性缩放
// 偏挑战：血量 ×3、奖励 ×1.5，体型略大并带金色光环便于识别
export const ELITE = {
  hpMult: 3,
  rewardMult: 1.5,
  sizeMult: 1.3,
  speedMult: 1.05,
  ringColor: '#fbbf24',
  // 精英额外获得一条命：首次死亡复活一次（半血），逼玩家补刀
  // 关闭此项可改为纯属性精英
  secondLife: false,
};

// 精英怪可应用的种类（Boss 不走精英通道）
export const ELITABLE_KINDS = [
  ENEMY_KIND.NORMAL,
  ENEMY_KIND.FLYING,
  ENEMY_KIND.STEALTH,
  ENEMY_KIND.RUSHER,
  ENEMY_KIND.ARMORED,
  ENEMY_KIND.HEALER,
  ENEMY_KIND.SPLITTER,
];

export const BOSS_DEFS = [
  {
    kind: 'bossDragon',
    name: '飞龙母舰',
    color: '#0ea5e9',
    hp: 600,
    speed: 40,
    size: 22,
    reward: 150,
    flying: true,
    stealth: false,
    summonInterval: 8000,
    summonKind: ENEMY_KIND.FLYING,
    summonCount: 2,
  },
  {
    kind: 'bossGhost',
    name: '幽影领主',
    color: '#8b5cf6',
    hp: 720,
    speed: 38,
    size: 22,
    reward: 180,
    flying: false,
    stealth: false,
    summonInterval: 7000,
    summonKind: ENEMY_KIND.STEALTH,
    summonCount: 3,
  },
  {
    kind: 'bossGolem',
    name: '钢铁巨像',
    color: '#64748b',
    hp: 900,
    speed: 32,
    size: 26,
    reward: 220,
    flying: false,
    stealth: false,
    armor: { preSeconds: 5, mult: 0.5 },
  },
  {
    kind: 'bossPhantom',
    name: '幽能龙',
    color: '#22d3ee',
    hp: 1050,
    speed: 46,
    size: 23,
    reward: 260,
    flying: true,
    stealth: false,
    floatY: 26,
    // 相位隐匿：每 7s 隐身 2.4s，期间只有反隐塔能锁定
    stealthCycle: { period: 7000, hiddenMs: 2400 },
    summonInterval: 9000,
    summonKind: ENEMY_KIND.FLYING,
    summonCount: 2,
  },
  {
    kind: 'bossShadow',
    name: '暗影领主',
    color: '#7c3aed',
    hp: 1150,
    speed: 42,
    size: 25,
    reward: 280,
    flying: false,
    stealth: false,
    // 相位隐匿：每 6s 隐身 2.2s
    stealthCycle: { period: 6000, hiddenMs: 2200 },
    summonInterval: 9000,
    summonGroups: [
      { kind: ENEMY_KIND.NORMAL, count: 2 },
      { kind: ENEMY_KIND.FLYING, count: 2 },
      { kind: ENEMY_KIND.STEALTH, count: 2 },
    ],
  },
  {
    kind: 'bossMix',
    name: '终极混合',
    color: '#ec4899',
    hp: 1200,
    speed: 50,
    size: 24,
    reward: 300,
    flying: true,
    stealth: true,
    summonInterval: 6000,
    summonKind: ENEMY_KIND.NORMAL,
    summonCount: 4,
  },
];
