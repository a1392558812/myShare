// 回声迷踪 常量定义：色板 / 数值 / 地图 / 点阵

export const COLORS = {
  bg: '#020409',
  bgLine: '#0a1420',
  sonar: '#3ee6d8',
  sonarBright: '#7df3ff',
  sonarWhite: '#d6fbff',
  sonarDim: '#1b7f8a',
  memoryWall: '#123a52',
  danger: '#ff3b4d',
  dangerGlow: '#ff6b78',
  krill: '#ffd166',
  white: '#eaf6ff',
  heal: '#ff8f9b', // 回血道具 粉
  energy: '#6ef0c8', // 回声波能量 绿青
  puffer: '#ff9d3b', // 河豚 橙（陷阱）
  fish: '#8be8ff', // 小鱼 淡蓝
  barnacle: '#b06cff', // 毒液藤壶 紫
  fear: '#ff2a6d', // 恐惧倒计时 洋红
};

export const WORLD = {
  width: 3000,
  height: 3000,
};

export const CONFIG = {
  playerRadius: 14,
  playerMaxSpeed: 380,
  playerLerp: 8, // 平滑插值系数
  followDist: 28, // 鲸鱼与鼠标保持的跟随距离
  maxEnergy: 100,
  energyDrain: 30, // 长按每秒消耗
  energyRegen: 40, // 松开每秒回复
  energyMinFire: 20, // 回复到该值才能再次发声
  sonarSpeed: 500, // 波纹扩散速度 px/s
  sonarMaxRadius: 450,
  maxHp: 3,
  invincibleMs: 1000,
  krillRevealMs: 1500, // 磷虾被照到后的显形时长
  krillEnergyBonus: 10,
  monsterPatrolSpeed: 120,
  monsterChaseSpeed: 420,
  monsterChaseMs: 2500, // 追击时长
  monsterRadius: 16,
  wallRevealMs: 4000, // 墙显形高亮衰减时长
  wallMemoryMs: 8000, // 墙显形后逐渐淡出到全黑的总时长
  wallSegLen: 16, // 墙显形分段长度
  bumpGlowMs: 500, // 撞墙磕头晕光时长
  glowRadius: 70, // 鲸鱼自发光晕

  // 冲刺
  dashSpeed: 900, // 冲刺速度 px/s
  dashDuration: 0.18, // 冲刺时长 s
  dashCooldown: 1500, // 冲刺冷却 ms

  // 道具
  healAmount: 1, // 回血道具回复血量
  energyPickupAmount: 40, // 能量道具回复
  pufferDamage: 1, // 河豚伤害

  // 恐惧值：长时间不主动开声纳会持续扣血
  fearBaseMs: 16000, // 初始倒计时 X（ms）
  fearMinMs: 2500, // 后续阶段最低倒计时（ms），即 X/3 下限
  fearDamage: 1, // 每次触发扣血量

  // 小鱼生态
  fishMaxCount: 40, // 小鱼同时最大数量
  fishSpawnMinMs: 600, // 刷新最短间隔
  fishSpawnMaxMs: 1600, // 刷新最长间隔
  fishSpeed: 70, // 小鱼游速 px/s
  fishRadius: 6, // 小鱼拾取半径
  fishPerReward: 10, // 每吃 N 条奖励
  fishRewardEnergy: 30, // 奖励能量
  fishRewardHp: 1, // 奖励血量

  // 毒液藤壶
  barnacleRadius: 10, // 藤壶碰撞半径

  // 无尽模式
  endless: {
    krillMax: 9, // 磷虾同时最大数量
    krillSpawnMinMs: 3000,
    krillSpawnMaxMs: 7000,
    krillLifeMinMs: 12000,
    krillLifeMaxMs: 20000,
    pickupMax: 8, // 道具同时最大数量
    pickupSpawnMinMs: 4000,
    pickupSpawnMaxMs: 10000,
    pickupLifeMinMs: 15000,
    pickupLifeMaxMs: 25000,
    pufferSpeed: 90, // 河豚游速 px/s
    pufferRadius: 9, // 河豚碰撞/拾取半径
    monsterMax: 5, // 无尽模式海怪同时最大数量
    monsterSpawnMinMs: 5000,
    monsterSpawnMaxMs: 12000,
    monsterLifeMinMs: 15000,
    monsterLifeMaxMs: 30000,
    monsterSpawnMargin: 180, // 视野外刷新/刷没的边距
  },

  // DNA 强化
  dna: {
    maxLevel: 10, // 单系最高等级
    costBase: 8, // 首次加点成本
    costStep: 4, // 每级成本递增
    // 熟练度来源（仅无尽模式积分）
    profKrill: 5, // 磷虾
    profFish: 2, // 小鱼
    profHeal: 10, // 回血道具
    profEnergy: 10, // 能量道具
    profPuffer: 20, // 河豚（冒险）
    // 各系每级效果
    courageFear: 0.08, // 胆量：每级恐惧基础时长 +8%
    skinInvincible: 120, // 皮肤：每级无敌帧 +120ms
    sonarRegen: 5, // 声呐：每级回能速度 +5/s
    sonarMax: 10, // 声呐：每级能量上限 +10
    muscleDashCd: 110, // 肌肉：每级冲刺冷却 -110ms
    muscleDashDur: 0.012, // 肌肉：每级冲刺时长 +0.012s
  },
};

// 出生点
export const SPAWN = { x: 1500, y: 1500 };

// 出口位置
export const EXIT = { x: 2750, y: 2750 };

// 内部洞穴墙
export const INNER_WALLS = [
  { x1: 700, y1: 0, x2: 700, y2: 1300 },
  { x1: 700, y1: 1700, x2: 700, y2: 3000 },
  { x1: 0, y1: 1300, x2: 1100, y2: 1300 },
  { x1: 1600, y1: 1300, x2: 3000, y2: 1300 },
  { x1: 1600, y1: 0, x2: 1600, y2: 900 },
  { x1: 1600, y1: 1300, x2: 1600, y2: 2200 },
  { x1: 2200, y1: 900, x2: 2200, y2: 2200 },
  { x1: 0, y1: 2200, x2: 1400, y2: 2200 },
  { x1: 2000, y1: 2200, x2: 3000, y2: 2200 },
];

// 磷虾位置 
export const KRILL = [
  { x: 1300, y: 300 },
  { x: 350, y: 1600 },
  { x: 1200, y: 800 },
  { x: 2600, y: 500 },
  { x: 1500, y: 2000 },
  { x: 1800, y: 2700 },
  { x: 2000, y: 400 },
  { x: 900, y: 1900 },
  { x: 2650, y: 2700 },
];

// 海怪出生点
export const MONSTERS = [
  { x: 1500, y: 700 },
  { x: 1500, y: 1900 },
  { x: 800, y: 1500 },
];

// 拾取道具（heal 回血 / energy 回声波能量 / puffer 河豚陷阱）
export const PICKUPS = [
  { type: 'heal', x: 500, y: 1500 },
  { type: 'energy', x: 2700, y: 2500 },
  { type: 'heal', x: 1200, y: 600 },
  { type: 'puffer', x: 1100, y: 1800 },
  { type: 'energy', x: 1500, y: 2600 },
  { type: 'puffer', x: 2600, y: 2400 },
  { type: 'heal', x: 800, y: 2400 },
  { type: 'energy', x: 1400, y: 400 },
];

// 毒液藤壶：沿内部墙等距生成
export const BARNACLES = (() => {
  const len = (w) => Math.hypot(w.x2 - w.x1, w.y2 - w.y1);
  const totalLen = INNER_WALLS.reduce((sum, w) => sum + len(w), 0);
  const count = 10;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const target = ((i + 0.5) * totalLen) / count;
    let acc = 0;
    for (const w of INNER_WALLS) {
      const l = len(w);
      if (acc + l >= target) {
        const t = l === 0 ? 0 : (target - acc) / l;
        pts.push({
          x: w.x1 + (w.x2 - w.x1) * t,
          y: w.y1 + (w.y2 - w.y1) * t,
        });
        break;
      }
      acc += l;
    }
  }
  return pts;
})();

// 鲸鱼像素点阵
export const WHALE_BODY = [
  '...XX...',
  '..XXXX..',
  '.XXXXXX.',
  'XXXXXXXX',
  'XXXXXXXX',
  '.XXXXXX.',
  '..XXXX..',
  '...XX...',
];

// 尾巴摆动帧
export const WHALE_TAIL = [
  ['....X.', '...XX.', '..XX..', '..X...'],
  ['..X...', '..XX..', '...XX.', '....X.'],
];

// 海怪像素点阵
export const MONSTER_SPRITE = [
  'X..XX..X',
  'X..XX..X',
  '.XXXXXX.',
  'XX.XX.XX',
  'XX.XX.XX',
  '.XXXXXX.',
  '..X..X..',
  '..X..X..',
];

// 磷虾像素点阵
export const KRILL_SPRITE = [
  '.XX.',
  'X..X',
  '.XX.',
  '.X..',
  '..X.',
];

// 回血道具点阵（十字）
export const HEAL_SPRITE = [
  '..X..',
  '..X..',
  'XXXXX',
  '..X..',
  '..X..',
];

// 能量道具点阵（闪电）
export const ENERGY_SPRITE = [
  '.XXX.',
  '.XX..',
  'XXXX.',
  '..XX.',
  '.XXX.',
];

// 河豚点阵（带刺圆）
export const PUFFER_SPRITE = [
  '.X.X.',
  'XXXXX',
  'X.X.X',
  'XXXXX',
  '.X.X.',
];

// 小鱼点阵
export const FISH_SPRITE = [
  '..X..',
  '.XXX.',
  'XXXXX',
  '.XXX.',
  '..X..',
];

// 毒液藤壶点阵
export const BARNACLE_SPRITE = [
  '.XXX.',
  'XXXXX',
  'XXXXX',
  '.XXX.',
  '..X..',
];
