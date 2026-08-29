/** 战场网格列数 */
export const GRID_COLS = 10;
/** 战场网格行数 */
export const GRID_ROWS = 5;
/** 每个格子像素大小 */
export const CELL_SIZE = 64;
/** 战场画布宽度 */
export const CANVAS_WIDTH = GRID_COLS * CELL_SIZE; // 640
/** 战场画布高度 */
export const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE; // 320
/** 己方布阵区域列数（左侧 4 列） */
export const PLAYER_ZONE_COLS = 4;
/** 单位碰撞半径（基础值，实际碰撞用 unit.size） */
export const UNIT_RADIUS = 7;

/**
 * 对数增长乘数，渐近 1.5 倍上限（stacks=0 时返回 1.0）
 * 用于水晶球(attackRangeMult)和范围光环(splash)的递减叠加
 * @param {number} stacks - 当前堆叠数
 * @returns {number} 乘数 (1.0 ~ 1.5)
 */
export const logMult15 = (stacks) => 1 + 0.5 * Math.log(1 + stacks) / (1 + Math.log(1 + stacks));

export const PHASE = {
  START: 'start',
  SHOP: 'shop',
  BATTLE: 'battle',
  BATTLE_RESULT: 'battleResult',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory',
};

export const FAMILIES = {
  UNDEAD: { id: 'undead', name: '不死族', color: '#7c3aed', icon: '💀' },
  WARRIOR: { id: 'warrior', name: '战士族', color: '#dc2626', icon: '⚔️' },
  FANTASY: { id: 'fantasy', name: '奇幻族', color: '#2563eb', icon: '🔮' },
  SCI_FI: { id: 'sci-fi', name: '科幻族', color: '#0891b2', icon: '🤖' },
  ACTION: { id: 'action', name: '动作族', color: '#ea580c', icon: '🥋' },
  OFFICE: { id: 'office', name: '社畜族', color: '#64748b', icon: '💼' },
};

/**
 * @typedef {Object} BroDef
 * @property {string} id - 唯一标识
 * @property {string} name - 名称
 * @property {string} icon - 图标 emoji
 * @property {string} family - 家族 id
 * @property {number} maxHp - 最大生命值
 * @property {number} attack - 攻击力
 * @property {number} attackRange - 攻击范围（像素）
 * @property {number} attackSpeed - 攻击间隔（ms）
 * @property {number} moveSpeed - 移动速度（px/帧）
 * @property {string} attackType - 攻击类型: melee/ranged/aoe/heal
 * @property {string} description - 描述
 * @property {number} cost - 招募费用
 * @property {number} tier - 品质 1=普通 2=稀有 3=史诗
 */

export const BRO_WARRIOR = {
  id: 'warrior',
  name: '战士兄弟',
  icon: '⚔️',
  family: 'warrior',
  maxHp: 120,
  attack: 18,
  attackRange: 35,
  attackSpeed: 800,
  moveSpeed: 1.2,
  attackType: 'melee',
  description: '高血量近战，队伍前排',
  cost: 3,
  tier: 1,
  size: 8,
};

export const BRO_ARCHER = {
  id: 'archer',
  name: '弓手兄弟',
  icon: '🏹',
  family: 'fantasy',
  maxHp: 55,
  attack: 22,
  attackRange: 200,
  attackSpeed: 1000,
  moveSpeed: 1.0,
  attackType: 'ranged',
  projectileSpeed: 6,
  description: '远程物理输出，脆皮高伤',
  cost: 3,
  tier: 1,
  size: 7,
};

export const BRO_MAGE = {
  id: 'mage',
  name: '法师兄弟',
  icon: '🔮',
  family: 'fantasy',
  maxHp: 50,
  attack: 16,
  attackRange: 180,
  attackSpeed: 1400,
  moveSpeed: 0.9,
  attackType: 'aoe',
  aoeRadius: 45,
  projectileSpeed: 4,
  description: '远程范围伤害，打群体',
  cost: 4,
  tier: 2,
  size: 7,
};

export const BRO_NINJA = {
  id: 'ninja',
  name: '忍者兄弟',
  icon: '🥷',
  family: 'action',
  maxHp: 65,
  attack: 14,
  attackRange: 160,
  attackSpeed: 500,
  moveSpeed: 2.0,
  attackType: 'ranged',
  projectileSpeed: 8,
  description: '高速移动，快速投掷手里剑',
  cost: 4,
  tier: 2,
  size: 7,
};

export const BRO_ZOMBIE = {
  id: 'zombie',
  name: '丧尸兄弟',
  icon: '🧟',
  family: 'undead',
  maxHp: 80,
  attack: 10,
  attackRange: 30,
  attackSpeed: 900,
  moveSpeed: 0.8,
  attackType: 'melee',
  explodeDamage: 40,
  explodeRadius: 50,
  description: '死亡时自爆，对周围敌人造成伤害',
  cost: 3,
  tier: 1,
  size: 7,
};

export const BRO_PRIEST = {
  id: 'priest',
  name: '牧师兄弟',
  icon: '⛪',
  family: 'undead',
  maxHp: 80,
  attack: 8,
  attackRange: 120,
  attackSpeed: 900,
  moveSpeed: 1.1,
  attackType: 'heal',
  healAmount: 25,
  healTargetCount: 2,
  blessInterval: 3,
  blessMult: 0.2,
  blessDuration: 5000,
  smiteRadius: 70,
  smiteMult: 0.6, // 伤害 = healAmount * smiteMult
  reviveHpRatio: 0.4,
  description: '群体治疗 + 神圣祝福 + 圣光打击 + 复活术',
  cost: 4,
  tier: 2,
  size: 7,
};

export const BRO_COWBOY = {
  id: 'cowboy',
  name: '牛仔兄弟',
  icon: '🤠',
  family: 'action',
  maxHp: 70,
  attack: 15,
  attackRange: 220,
  attackSpeed: 1100,
  moveSpeed: 1.1,
  attackType: 'ranged',
  projectileSpeed: 7,
  lassoRange: 200,
  lassoCooldown: 6000,
  description: '远程输出，危急时用套索拉回残血队友',
  cost: 5,
  tier: 3,
  size: 7,
};

export const BRO_KNIGHT = {
  id: 'knight',
  name: '骑士兄弟',
  icon: '🛡️',
  family: 'warrior',
  maxHp: 150,
  attack: 12,
  attackRange: 35,
  attackSpeed: 1000,
  moveSpeed: 0.9,
  attackType: 'melee',
  shieldAuraRange: 80,
  shieldReduction: 0.3,
  description: '为附近队友提供减伤护盾',
  cost: 5,
  tier: 3,
  size: 9,
};

export const BRO_CROSSBOWMAN = {
  id: 'crossbowman',
  name: '弩手兄弟',
  icon: '🎯',
  family: 'warrior',
  maxHp: 60,
  attack: 16,
  attackRange: 190,
  attackSpeed: 1200,
  moveSpeed: 1.0,
  attackType: 'ranged',
  projectileSpeed: 9,
  innatePierce: 1,
  description: '弩箭穿透敌人，一发打两',
  cost: 3,
  tier: 1,
  size: 7,
};

export const BRO_BERSERKER = {
  id: 'berserker',
  name: '狂战士兄弟',
  icon: '😤',
  family: 'warrior',
  maxHp: 85,
  attack: 10,
  attackRange: 30,
  attackSpeed: 700,
  moveSpeed: 1.5,
  attackType: 'melee',
  enrageThreshold: 0.4,
  enrageMult: 1.8,
  description: '血量越低攻击越高，40%血以下攻击翻倍',
  cost: 4,
  tier: 2,
  size: 8,
};

export const BRO_MUSKETEER = {
  id: 'musketeer',
  name: '火枪手兄弟',
  icon: '🔫',
  family: 'action',
  maxHp: 45,
  attack: 30,
  attackRange: 260,
  attackSpeed: 1600,
  moveSpeed: 0.9,
  attackType: 'ranged',
  projectileSpeed: 10,
  executeChance: 0.2,
  executeThreshold: 0.15,
  description: '超远射程高伤害，概率秒杀残血',
  cost: 4,
  tier: 2,
  size: 7,
};

export const BRO_SHAMAN = {
  id: 'shaman',
  name: '萨满兄弟',
  icon: '🎭',
  family: 'undead',
  maxHp: 75,
  attack: 6,
  attackRange: 130,
  attackSpeed: 1200,
  moveSpeed: 1.0,
  attackType: 'ranged',
  projectileSpeed: 5,
  speedAuraRange: 90,
  speedAuraMult: 0.3,
  description: '为附近队友提供30%攻速加成',
  cost: 5,
  tier: 3,
  size: 7,
};

export const BRO_DRAGOON = {
  id: 'dragoon',
  name: '龙骑士兄弟',
  icon: '🐉',
  family: 'fantasy',
  maxHp: 110,
  attack: 22,
  attackRange: 30,
  attackSpeed: 850,
  moveSpeed: 1.7,
  attackType: 'melee',
  chargeCooldown: 8000,
  chargeRange: 300,
  chargeDamage: 35,
  chargeSplashRadius: 50,
  description: '高速冲锋突袭敌阵，落点范围伤害',
  cost: 5,
  tier: 3,
  size: 8,
};

export const BRO_TABLE = [
  BRO_WARRIOR,
  BRO_ARCHER,
  BRO_MAGE,
  BRO_NINJA,
  BRO_ZOMBIE,
  BRO_PRIEST,
  BRO_COWBOY,
  BRO_KNIGHT,
  BRO_CROSSBOWMAN,
  BRO_BERSERKER,
  BRO_MUSKETEER,
  BRO_SHAMAN,
  BRO_DRAGOON,
];

export const getBroDef = (id) => BRO_TABLE.find((b) => b.id === id);

/**
 * @typedef {Object} SynergyDef
 * @property {string} id - 羁绊 id
 * @property {string} name - 羁绊名称
 * @property {string} icon - 图标
 * @property {string} description - 描述
 * @property {string[]} families - 需要的家族
 * @property {number} minCount - 最少单位数触发
 * @property {Object} bonus - 羁绊加成
 */

export const SYNERGIES = [
  {
    id: 'undeadPact',
    name: '不死契约',
    icon: '💀',
    description: '不死族单位数≥2 时，友方死亡回复周围队友 20% 最大生命',
    families: ['undead'],
    minCount: 2,
    bonus: { type: 'deathHeal', ratio: 0.2, radius: 80 },
  },
  {
    id: 'warriorBond',
    name: '战士羁绊',
    icon: '⚔️',
    description: '战士族单位数≥2 时，全体战士 +30% 最大生命',
    families: ['warrior'],
    minCount: 2,
    bonus: { type: 'maxHpBoost', ratio: 0.3, targetFamily: 'warrior' },
  },
  {
    id: 'rangedStrike',
    name: '远程协作',
    icon: '🏹',
    description: '奇幻族+动作族单位数≥3 时，全体远程 +25% 攻击速度',
    families: ['fantasy', 'action'],
    minCount: 3,
    bonus: { type: 'attackSpeedBoost', ratio: 0.25, targetTypes: ['ranged', 'aoe'] },
  },
];

/**
 * @typedef {Object} RelicDef
 * @property {string} id - 唯一标识
 * @property {string} name - 名称
 * @property {string} icon - 图标
 * @property {string} description - 描述
 * @property {string} rarity - 稀有度: common/rare/epic
 * @property {Object} effect - 效果
 */

export const RELICS = [
  {
    id: 'warAxe',
    name: '狂战斧',
    icon: '🪓',
    description: '全体兄弟 +20% 攻击力',
    rarity: 'common',
    effect: { type: 'attackMult', value: 0.2 },
    maxStacks: 5,
  },
  {
    id: 'guardShield',
    name: '守护盾',
    icon: '🛡️',
    description: '全体兄弟 +30% 最大生命',
    rarity: 'common',
    effect: { type: 'maxHpMult', value: 0.3 },
    maxStacks: 5,
  },
  {
    id: 'windBoots',
    name: '疾风靴',
    icon: '👟',
    description: '全体兄弟 +30% 移动速度',
    rarity: 'common',
    effect: { type: 'moveSpeedMult', value: 0.3 },
    maxStacks: 3,
  },
  {
    id: 'vampireFang',
    name: '吸血牙',
    icon: '🦷',
    description: '全体兄弟攻击附带 10% 吸血',
    rarity: 'rare',
    effect: { type: 'lifesteal', value: 0.1 },
    maxStacks: 5,
  },
  {
    id: 'comboGlove',
    name: '连击手套',
    icon: '🧤',
    description: '20% 概率连续攻击两次',
    rarity: 'rare',
    effect: { type: 'doubleAttackChance', value: 0.2 },
    maxStacks: 3,
  },
  {
    id: 'reviveArmor',
    name: '复活甲',
    icon: '✨',
    description: '每个兄弟复活一次，恢复 50% 生命',
    rarity: 'epic',
    effect: { type: 'revive', value: 0.5 },
    maxStacks: 2,
  },
  {
    id: 'critDagger',
    name: '暴击匕首',
    icon: '🗡️',
    description: '15% 暴击率，暴击造成 2 倍伤害',
    rarity: 'rare',
    effect: { type: 'crit', chance: 0.15, multiplier: 2 },
    maxStacks: 5,
  },
  {
    id: 'auraRing',
    name: '范围光环',
    icon: '💫',
    description: '近战溅射范围与伤害按对数增长，渐近1.5倍上限（最多5层）',
    rarity: 'rare',
    effect: { type: 'splash', radius: 40, ratio: 0.5 },
    maxStacks: 5,
  },
  {
    id: 'goldPouch',
    name: '金币袋',
    icon: '💰',
    description: '每回合额外获得 2 金币（最多5层）',
    rarity: 'common',
    effect: { type: 'extraGold', value: 2 },
    maxStacks: 5,
  },
  {
    id: 'berserkerMask',
    name: '狂暴面具',
    icon: '👺',
    description: '血量低于 30% 时攻击力翻倍',
    rarity: 'epic',
    effect: { type: 'enrage', threshold: 0.3, multiplier: 2 },
    maxStacks: 3,
  },
  {
    id: 'crystalBall',
    name: '水晶球',
    icon: '🔮',
    description: '全体兄弟攻击范围按对数增长，渐近1.5倍上限（最多5层）',
    rarity: 'common',
    effect: { type: 'attackRangeMult', value: 0.2 },
    maxStacks: 5,
  },
  {
    id: 'ironWall',
    name: '铁壁石',
    icon: '🧱',
    description: '全体兄弟受到伤害减少 12%',
    rarity: 'common',
    effect: { type: 'damageReduction', value: 0.12 },
    maxStacks: 6,
  },
  {
    id: 'whetstone',
    name: '磨刀石',
    icon: '🗡️',
    description: '全体兄弟 +3 固定攻击力',
    rarity: 'common',
    effect: { type: 'flatAttack', value: 3 },
    maxStacks: 5,
  },
  {
    id: 'thornArmor',
    name: '荆棘甲',
    icon: '🌵',
    description: '兄弟受伤时反弹 25% 伤害给攻击者',
    rarity: 'rare',
    effect: { type: 'thorns', value: 0.25 },
    maxStacks: 4,
  },
  {
    id: 'lifeSpring',
    name: '生命之泉',
    icon: '💚',
    description: '全体兄弟每秒回复 3% 最大生命',
    rarity: 'rare',
    effect: { type: 'regen', value: 0.03 },
    maxStacks: 5,
  },
  {
    id: 'phantomCloak',
    name: '幻影披风',
    icon: '🎭',
    description: '15% 概率闪避攻击，完全免伤',
    rarity: 'rare',
    effect: { type: 'dodge', value: 0.15 },
    maxStacks: 5,
  },
  {
    id: 'executionScythe',
    name: '斩首镰刀',
    icon: '💀',
    description: '对血量低于 25% 的敌人造成 50% 额外伤害',
    rarity: 'rare',
    effect: { type: 'executioner', threshold: 0.25, bonus: 0.5 },
    maxStacks: 3,
  },
  {
    id: 'piercingArrow',
    name: '穿透箭',
    icon: '🏹',
    description: '远程投射物可穿透 1 个额外目标',
    rarity: 'rare',
    effect: { type: 'pierce', value: 1 },
    maxStacks: 2,
  },
  {
    id: 'annihilationEye',
    name: '湮灭之眼',
    icon: '🌀',
    description: '每击杀一个敌人，全体兄弟 +2 攻击力（仅本场战斗）',
    rarity: 'epic',
    effect: { type: 'killStack', value: 2 },
    maxStacks: 3,
  },
  {
    id: 'infernoCore',
    name: '烈焰核心',
    icon: '🔥',
    description: '攻击附带燃烧，3 秒内造成 50% 攻击力的持续伤害（最多5层）',
    rarity: 'epic',
    effect: { type: 'burn', duration: 180, ratio: 0.5 },
    maxStacks: 5,
  },
];

/**
 * 传说遗物池（二阶段）
 * 普通遗物（有 maxStacks 的）全部满层后解锁，单独接管三选一；
 * 同样走「叠层 → 升格 → 毕业」闭环，全部毕业后遗物选择结束。
 */
export const LEGENDARY_RELICS = [
  {
    id: 'warGodMark',
    name: '战神之印',
    icon: '⚔️',
    description: '全体兄弟 +30% 攻击力',
    rarity: 'legendary',
    effect: { type: 'attackMult', value: 0.3 },
    maxStacks: 3,
  },
  {
    id: 'titanHeart',
    name: '泰坦之心',
    icon: '❤️',
    description: '全体兄弟 +40% 最大生命',
    rarity: 'legendary',
    effect: { type: 'maxHpMult', value: 0.4 },
    maxStacks: 3,
  },
  {
    id: 'windRune',
    name: '疾风神符',
    icon: '🌪️',
    description: '全体兄弟攻击间隔乘性缩短 20%（攻速大幅提升）',
    rarity: 'legendary',
    effect: { type: 'attackSpeedMult', value: 0.2 },
    maxStacks: 3,
  },
  {
    id: 'abyssEye',
    name: '深渊之眼',
    icon: '👁️',
    description: '12% 暴击率，暴击造成 3 倍伤害',
    rarity: 'legendary',
    effect: { type: 'crit', chance: 0.12, multiplier: 3 },
    maxStacks: 3,
  },
  {
    id: 'eternalFurnace',
    name: '永恒熔炉',
    icon: '🔥',
    description: '攻击附带燃烧，3 秒内造成 80% 攻击力的持续伤害',
    rarity: 'legendary',
    effect: { type: 'burn', duration: 180, ratio: 0.8 },
    maxStacks: 3,
  },
  {
    id: 'holyHalo',
    name: '圣辉光环',
    icon: '✨',
    description: '近战溅射范围与伤害按对数增长，渐近1.5倍上限',
    rarity: 'legendary',
    effect: { type: 'splash', radius: 60, ratio: 0.7 },
    maxStacks: 3,
  },
];

export const LEGENDARY_RELIC_MAP = LEGENDARY_RELICS.reduce((map, r) => {
  map[r.id] = r;
  return map;
}, {});

/** 按稀有度分组的遗物权重 */
export const RELIC_RARITY_WEIGHT = {
  common: 5,
  rare: 3,
  epic: 1,
  legendary: 1,
};

/** 普通遗物查找表（不含传说） */
const RELIC_MAP_RAW = RELICS.reduce((map, r) => {
  map[r.id] = r;
  return map;
}, {});

/** 全部遗物（普通 + 传说）查找表，传说遗物也走统一结算链路 */
export const RELIC_MAP = {
  ...RELIC_MAP_RAW,
  ...LEGENDARY_RELIC_MAP,
};

/** 重铸系统常量 */
export const RELIC_REFORGE_BASE_COST = 2;
export const RELIC_REFORGE_INCREMENT = 1;
export const RELIC_CANDIDATE_COUNT = 3;

export const ENEMY_KID = {
  id: 'kid',
  name: '熊孩子',
  icon: '👶',
  maxHp: 30,
  attack: 6,
  attackRange: 28,
  attackSpeed: 900,
  moveSpeed: 1.2,
  attackType: 'melee',
  size: 6,
  color: '#fbbf24',
  reward: 1,
};

export const ENEMY_WOLF = {
  id: 'wolf',
  name: '野狼',
  icon: '🐺',
  maxHp: 60,
  attack: 12,
  attackRange: 30,
  attackSpeed: 600,
  moveSpeed: 2.0,
  attackType: 'melee',
  size: 7,
  color: '#94a3b8',
  reward: 2,
};

export const ENEMY_GORILLA = {
  id: 'gorilla',
  name: '大猩猩',
  icon: '🦍',
  maxHp: 200,
  attack: 25,
  attackRange: 45,
  attackSpeed: 900,
  moveSpeed: 1.0,
  attackType: 'melee',
  slamRange: 80,
  slamDamage: 30,
  slamCooldown: 3000,
  size: 10,
  color: '#4a3728',
  reward: 5,
};

export const ENEMY_SHADOW = {
  id: 'shadow',
  name: '暗影法师',
  icon: '🦹',
  maxHp: 50,
  attack: 14,
  attackRange: 200,
  attackSpeed: 1200,
  moveSpeed: 1.0,
  attackType: 'ranged',
  projectileSpeed: 5,
  size: 7,
  color: '#6b21a8',
  reward: 3,
};

export const ENEMY_GOD = {
  id: 'god',
  name: '神明',
  icon: '👑',
  maxHp: 500,
  attack: 30,
  attackRange: 250,
  attackSpeed: 1000,
  moveSpeed: 0.8,
  attackType: 'aoe',
  aoeRadius: 60,
  projectileSpeed: 4,
  slamRange: 150,
  slamDamage: 40,
  slamCooldown: 5000,
  summonCooldown: 8000,
  summonCount: 2,
  size: 13,
  color: '#fbbf24',
  reward: 10,
};

export const ENEMY_ARCHER = {
  id: 'eArcher',
  name: '弓箭手',
  icon: '🏹',
  maxHp: 35,
  attack: 10,
  attackRange: 180,
  attackSpeed: 700,
  moveSpeed: 1.1,
  attackType: 'ranged',
  projectileSpeed: 6,
  size: 7,
  color: '#15803d',
  reward: 2,
};

export const ENEMY_TANK = {
  id: 'tank',
  name: '重甲兵',
  icon: '🛡️',
  maxHp: 150,
  attack: 8,
  attackRange: 30,
  attackSpeed: 1000,
  moveSpeed: 0.5,
  attackType: 'melee',
  size: 9,
  color: '#475569',
  reward: 3,
};

export const ENEMY_BAT = {
  id: 'bat',
  name: '蝙蝠',
  icon: '🦇',
  maxHp: 15,
  attack: 5,
  attackRange: 24,
  attackSpeed: 500,
  moveSpeed: 2.5,
  attackType: 'melee',
  size: 5,
  color: '#374151',
  reward: 1,
};

export const ENEMY_MEDIC = {
  id: 'medic',
  name: '医疗兵',
  icon: '💊',
  maxHp: 40,
  attack: 3,
  attackRange: 160,
  attackSpeed: 1500,
  moveSpeed: 0.9,
  attackType: 'heal',
  healAmount: 15,
  healTargetCount: 2,
  size: 7,
  color: '#059669',
  reward: 3,
};

export const ENEMY_BOMBER = {
  id: 'bomber',
  name: '自爆兵',
  icon: '💣',
  maxHp: 25,
  attack: 4,
  attackRange: 20,
  attackSpeed: 2000,
  moveSpeed: 1.8,
  attackType: 'melee',
  deathExplosion: { radius: 50, damage: 30 },
  size: 6,
  color: '#dc2626',
  reward: 2,
};

export const ENEMY_WARLORD = {
  id: 'warlord',
  name: '战争领主',
  icon: '⚔️',
  maxHp: 300,
  attack: 35,
  attackRange: 50,
  attackSpeed: 700,
  moveSpeed: 1.5,
  attackType: 'melee',
  slamRange: 70,
  slamDamage: 45,
  slamCooldown: 2000,
  size: 11,
  color: '#991b1b',
  reward: 8,
};

export const ENEMY_NECROMANCER = {
  id: 'necromancer',
  name: '死灵法师',
  icon: '💀',
  maxHp: 180,
  attack: 20,
  attackRange: 200,
  attackSpeed: 1500,
  moveSpeed: 0.7,
  attackType: 'ranged',
  projectileSpeed: 4,
  summonCooldown: 6000,
  summonCount: 3,
  summonId: 'bat',
  size: 9,
  color: '#581c87',
  reward: 8,
};

export const ENEMY_GOLEM = {
  id: 'golem',
  name: '石巨人',
  icon: '🗿',
  maxHp: 600,
  attack: 20,
  attackRange: 40,
  attackSpeed: 1200,
  moveSpeed: 0.4,
  attackType: 'melee',
  slamRange: 100,
  slamDamage: 50,
  slamCooldown: 4000,
  size: 14,
  color: '#57534e',
  reward: 10,
};

export const ENEMY_HYDRA = {
  id: 'hydra',
  name: '九头蛇',
  icon: '🐲',
  maxHp: 400,
  attack: 25,
  attackRange: 220,
  attackSpeed: 900,
  moveSpeed: 0.8,
  attackType: 'aoe',
  aoeRadius: 50,
  projectileSpeed: 5,
  slamRange: 120,
  slamDamage: 35,
  slamCooldown: 3500,
  summonCooldown: 10000,
  summonCount: 4,
  summonId: 'bat',
  size: 13,
  color: '#0d9488',
  reward: 12,
};

export const ENEMY_TABLE = [
  ENEMY_KID,
  ENEMY_WOLF,
  ENEMY_GORILLA,
  ENEMY_SHADOW,
  ENEMY_GOD,
  ENEMY_ARCHER,
  ENEMY_TANK,
  ENEMY_BAT,
  ENEMY_MEDIC,
  ENEMY_BOMBER,
  ENEMY_WARLORD,
  ENEMY_NECROMANCER,
  ENEMY_GOLEM,
  ENEMY_HYDRA,
];

/**
 * 每回合敌人配置
 * @type {Array<{enemies: Array<{id: string, count: number}>, reward: number, isBoss: boolean}>}
 */
export const ROUNDS = [
  { enemies: [{ id: 'kid', count: 3 }], reward: 4, isBoss: false },
  { enemies: [{ id: 'kid', count: 4 }, { id: 'wolf', count: 1 }], reward: 4, isBoss: false },
  { enemies: [{ id: 'kid', count: 5 }, { id: 'wolf', count: 2 }], reward: 5, isBoss: false },
  { enemies: [{ id: 'wolf', count: 3 }, { id: 'eArcher', count: 2 }], reward: 5, isBoss: false },
  { enemies: [{ id: 'gorilla', count: 1 }, { id: 'kid', count: 3 }], reward: 6, isBoss: true },

  { enemies: [{ id: 'wolf', count: 4 }, { id: 'eArcher', count: 2 }, { id: 'bat', count: 3 }], reward: 6, isBoss: false },
  { enemies: [{ id: 'kid', count: 5 }, { id: 'wolf', count: 3 }, { id: 'bomber', count: 2 }], reward: 7, isBoss: false },
  { enemies: [{ id: 'gorilla', count: 1 }, { id: 'shadow', count: 2 }, { id: 'eArcher', count: 2 }], reward: 8, isBoss: true },
  { enemies: [{ id: 'wolf', count: 3 }, { id: 'shadow', count: 2 }, { id: 'tank', count: 1 }, { id: 'bat', count: 4 }], reward: 8, isBoss: false },
  { enemies: [{ id: 'warlord', count: 1 }, { id: 'shadow', count: 2 }, { id: 'eArcher', count: 3 }], reward: 9, isBoss: true },

  { enemies: [{ id: 'gorilla', count: 2 }, { id: 'shadow', count: 2 }, { id: 'medic', count: 1 }], reward: 10, isBoss: true },
  { enemies: [{ id: 'wolf', count: 4 }, { id: 'shadow', count: 3 }, { id: 'bomber', count: 3 }, { id: 'bat', count: 4 }], reward: 12, isBoss: false },
  { enemies: [{ id: 'god', count: 1 }, { id: 'gorilla', count: 1 }, { id: 'tank', count: 2 }], reward: 15, isBoss: true },
  { enemies: [{ id: 'gorilla', count: 3 }, { id: 'shadow', count: 3 }, { id: 'eArcher', count: 4 }, { id: 'medic', count: 1 }], reward: 14, isBoss: false },
  { enemies: [{ id: 'necromancer', count: 1 }, { id: 'gorilla', count: 2 }, { id: 'shadow', count: 3 }], reward: 16, isBoss: true },

  { enemies: [{ id: 'wolf', count: 6 }, { id: 'shadow', count: 4 }, { id: 'bomber', count: 4 }, { id: 'bat', count: 6 }], reward: 15, isBoss: false },
  { enemies: [{ id: 'golem', count: 1 }, { id: 'warlord', count: 1 }, { id: 'tank', count: 2 }], reward: 18, isBoss: true },
  { enemies: [{ id: 'shadow', count: 5 }, { id: 'gorilla', count: 4 }, { id: 'wolf', count: 6 }, { id: 'medic', count: 2 }], reward: 18, isBoss: false },
  { enemies: [{ id: 'hydra', count: 1 }, { id: 'shadow', count: 4 }, { id: 'eArcher', count: 4 }], reward: 20, isBoss: true },
  { enemies: [{ id: 'god', count: 2 }, { id: 'golem', count: 1 }, { id: 'necromancer', count: 1 }, { id: 'shadow', count: 4 }], reward: 25, isBoss: true },
];

/** 商店每次刷新可选兄弟数量 */
export const SHOP_CHOICES = 3;
/** 初始金币 */
export const START_GOLD = 8;
/** 商店刷新费用 */
export const REROLL_COST = 1;
/** 同种兄弟可叠加数量上限 */
export const MAX_DUPLICATES = 5;

/* ============ 合成升星系统 ============ */
/** 合成费用（金币） */
export const MERGE_COST = 2;
/** 每星属性倍率（全属性乘 1.5^star） */
export const MERGE_STAR_MULT = 1.5;
/** 星级上限 */
export const MAX_STAR = 5;

/* ============ 超限强化 ============ */
/**
 * 超限费用 = baseCost × 4 × 2^超限级
 * 攻击第1档8金 → 第6档256金 → 第11档8192金，指数增长形成后期金币黑洞
 * @param {string} upgradeId - 升级类型 id
 * @param {number} transLevel - 超限级数
 * @returns {number}
 */
export const getTranscendCost = (upgradeId, transLevel) => {
  const def = getUpgradeDef(upgradeId);
  if (!def) return Infinity;
  return def.baseCost * 4 * Math.pow(2, transLevel);
};

/* ============ 遗物升格 ============ */
/** 最大升格次数 */
export const RELIC_REFINE_MAX = 3;
/** 每次升格效果提升比例 */
export const RELIC_REFINE_STEP = 0.25;
/**
 * 升格后效果倍率：1 + 0.25 × 次数（满3次 = 1.75 倍）
 * @param {number} refine - 升格次数
 * @returns {number}
 */
export const getRelicRefineMult = (refine) => 1 + RELIC_REFINE_STEP * (refine || 0);

/* ============ 无尽精英敌人 ============ */
/** 精英倍率：生命 */
export const ELITE_HP_MULT = 2.5;
/** 精英倍率：攻击 */
export const ELITE_ATK_MULT = 1.6;

/**
 * 根据当前回合计算兄弟上阵上限
 * @param {number} round - 当前回合索引（0-based）
 * @returns {number}
 */
export const getMaxBros = (round) => Math.min(4 + round * 2, 50);

/**
 * @typedef {Object} UpgradeType
 * @property {string} id - 升级类型 id
 * @property {string} name - 显示名称
 * @property {string} icon - 图标
 * @property {number} maxLevel - 最大等级
 * @property {number} baseCost - 基础费用
 * @property {number} bonusPerLevel - 每级加成比例
 * @property {string} description - 描述
 */
export const UPGRADE_TYPES = [
  {
    id: 'attack',
    name: '攻击强化',
    icon: '⚔️',
    maxLevel: 8,
    baseCost: 2,
    bonusPerLevel: 0.2,
    description: '每级 +20% 攻击力',
  },
  {
    id: 'maxHp',
    name: '生命强化',
    icon: '❤️',
    maxLevel: 8,
    baseCost: 2,
    bonusPerLevel: 0.25,
    description: '每级 +25% 最大生命',
  },
  {
    id: 'attackSpeed',
    name: '攻速强化',
    icon: '⚡',
    maxLevel: 5,
    baseCost: 3,
    bonusPerLevel: 0.12,
    description: '每级 +12% 攻击速度',
  },
  {
    id: 'moveSpeed',
    name: '移速强化',
    icon: '🏃',
    maxLevel: 5,
    baseCost: 2,
    bonusPerLevel: 0.15,
    description: '每级 +15% 移动速度',
  },
];

/**
 * 获取指定升级类型的定义
 * @param {string} id
 * @returns {Object|undefined}
 */
export const getUpgradeDef = (id) => UPGRADE_TYPES.find((u) => u.id === id);

/**
 * 计算升级费用
 * @param {string} upgradeId - 升级类型 id
 * @param {number} currentLevel - 当前等级
 * @returns {number}
 */
export const getUpgradeCost = (upgradeId, currentLevel) => {
  const def = getUpgradeDef(upgradeId);
  if (!def) return Infinity;
  return def.baseCost * (currentLevel + 1);
};

/** 无尽模式小怪上限 */
export const ENDLESS_MAX_SMALL = 200;

/**
 * 无尽模式敌人血量成长系数（相对攻击的额外加成）
 * 攻击倍率 = 1 + wave × growthRate；血量倍率 = 1 + wave × growthRate × 本系数。
 * 血量比攻击更肉，战斗更持久，给后期升星/超限/遗物成长提供压力。
 */
export const ENDLESS_HP_GROWTH_MULT = 1.6;

/**
 * 无尽模式 Boss 额外血量倍率（乘在 hpMult 之上）
 * Boss 敌人在无尽模式下比小怪更耐打，突出 Boss 战的持久感与压力感。
 */
export const ENDLESS_BOSS_HP_MULT = 3.0;

/**
 * 生成无尽模式波次配置
 * @param {number} wave - 无尽波次（0-based，第 0 波 = 通关后第一波）
 * @returns {{ enemies: Array, reward: number, isBoss: boolean, statMult: number, endlessWave: number }}
 */
export const generateEndlessWave = (wave) => {
  const smallPoolEarly = ['kid', 'wolf', 'bat'];
  const smallPoolMid = [...smallPoolEarly, 'eArcher', 'bomber', 'shadow'];
  const smallPoolLate = [...smallPoolMid, 'tank', 'medic'];
  const smallPool = wave < 5 ? smallPoolEarly : wave < 15 ? smallPoolMid : smallPoolLate;

  const bossPoolEarly = ['gorilla', 'warlord'];
  const bossPoolMid = [...bossPoolEarly, 'necromancer', 'god'];
  const bossPoolLate = [...bossPoolMid, 'golem', 'hydra'];
  const bossPool = wave < 5 ? bossPoolEarly : wave < 15 ? bossPoolMid : bossPoolLate;

  const smallCount = Math.min(8 + wave * 3, ENDLESS_MAX_SMALL);
  const enemies = [];

  let remaining = smallCount;
  while (remaining > 0) {
    const type = smallPool[Math.floor(Math.random() * smallPool.length)];
    const chunk = Math.min(remaining, Math.ceil(smallCount / 3) + Math.floor(Math.random() * 5));
    // W15+ 每组小怪 15% 概率整体精英化（属性强化 + 金色光环）
    const elite = wave >= 15 && Math.random() < 0.15;
    enemies.push({ id: type, count: chunk, ...(elite ? { elite: true } : {}) });
    remaining -= chunk;
  }

  // 每 5 波固定 Boss 战
  const isBoss = wave % 5 === 4;

  // Boss 概率出现：第 0 波 20%，每波 +5%，上限 80%
  // 固定 Boss 波保底必出一个 Boss
  const bossChance = Math.min(0.2 + wave * 0.05, 0.8);
  if (isBoss || Math.random() < bossChance) {
    const bossType = bossPool[Math.floor(Math.random() * bossPool.length)];
    const bossCount = 1 + Math.floor(wave / 5);
    enemies.push({ id: bossType, count: Math.min(bossCount, 5), boss: true });
  }

  // 成长系数从 0.08 起步，随波次缓慢提升
  const growthRate = 0.08 + 0.02 * Math.sqrt(wave);

  return {
    enemies,
    reward: 5 + wave * 2,
    isBoss,
    // 攻击倍率：整体成长曲线
    statMult: 1 + wave * growthRate,
    // 血量倍率：比攻击更陡（×ENDLESS_HP_GROWTH_MULT），战斗更持久
    hpMult: 1 + wave * growthRate * ENDLESS_HP_GROWTH_MULT,
    endlessWave: wave,
  };
};

/**
 * 根据品质获取颜色
 * @param {number} tier - 品质等级
 * @returns {string} 颜色 hex
 */
export const getTierColor = (tier) => {
  const colors = { 1: '#94a3b8', 2: '#3b82f6', 3: '#a855f7' };
  return colors[tier] || '#94a3b8';
};

/**
 * 获取稀有度颜色
 * @param {string} rarity - 稀有度
 * @returns {string}
 */
export const getRarityColor = (rarity) => {
  const colors = { common: '#64748b', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b' };
  return colors[rarity] || '#64748b';
};

/**
 * 根据敌人 id 获取定义
 * @param {string} id
 * @returns {Object|undefined}
 */
export const getEnemyDef = (id) => ENEMY_TABLE.find((e) => e.id === id);

/**
 * 随机从数组中取 n 个不重复元素
 * @param {Array} arr
 * @param {number} n
 * @returns {Array}
 */
export const pickRandom = (arr, n) => {
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
};

/**
 * 加权随机选择
 * @param {Array<{item: *, weight: number}>} weightedItems
 * @returns {*}
 */
export const weightedPick = (weightedItems) => {
  const total = weightedItems.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const { item, weight } of weightedItems) {
    r -= weight;
    if (r <= 0) return item;
  }
  return weightedItems[0].item;
};
