/**
 * Roguelike 肉鸽游戏 — 常量与数据结构定义
 * 所有玩家、敌人、技能、等级等属性常量统一管理于此文件
 */

// ─────────────────────────── 镜头参数 ───────────────────────────
/** 镜头跟随缓动系数（0~1，越小越平滑） */
export const CAMERA_EASING = 0.08

// ─────────────────────────── 通用尺寸 ───────────────────────────
/** 玩家 / 敌人逻辑尺寸（像素） */
export const ENTITY_SIZE = 40

// ─────────────────────────── 玩家属性表 ───────────────────────────
/**
 * @typedef {Object} PlayerAttrs
 * @property {number} maxHp      - 最大生命值
 * @property {number} speed      - 移动速度（px/frame）
 * @property {number} size       - 碰撞 / 绘制尺寸
 * @property {number} baseAttack - 基础攻击力（射箭伤害基数）
 */
export const PLAYER_ATTRS = {
  maxHp: 100,
  speed: 3,
  size: ENTITY_SIZE,
  baseAttack: 10,
}

// ─────────────────────────── 敌人类型属性表 ───────────────────────────
/**
 * @typedef {Object} EnemyTypeAttrs
 * @property {number} maxHp          - 最大生命值
 * @property {number} speed          - 移动速度
 * @property {number} size           - 尺寸
 * @property {number} attack         - 攻击力
 * @property {number} attackRange    - 近战攻击范围（px）
 * @property {number} skillRange     - 远程技能射程（px）
 * @property {number} skillCooldown  - 技能冷却时间（ms）
 * @property {string} color          - 主色（用于绘制外观）
 * @property {string} color2         - 辅色（用于绘制外观细节）
 * @property {string} icon           - 图标 emoji（用于 HUD 列表）
 * @property {string} name           - 中文显示名称
 * @property {number} expReward      - 击杀后给予玩家的经验值
 * @property {boolean} hasMelee      - 是否拥有近战攻击
 * @property {boolean} hasRanged     - 是否拥有远程攻击
 */

/** 近战型敌人：高血量、近距离冲锋攻击 */
export const ENEMY_MELEE = {
  maxHp: 80,
  speed: 2.5,
  size: ENTITY_SIZE,
  attack: 15,
  attackRange: 50,
  skillRange: 0,
  skillCooldown: 800,
  color: '#ea580c',        // 橙褐武士主色
  color2: '#9a3412',       // 深褐腰带/武器
  icon: '⚔️',
  name: '近战武士',
  expReward: 20,
  hasMelee: true,
  hasRanged: false,
}

/** 远程型敌人：低血量、发射弹幕 */
export const ENEMY_RANGED = {
  maxHp: 40,
  speed: 1.8,
  size: ENTITY_SIZE,
  attack: 8,
  attackRange: 0,
  skillRange: 300,
  skillCooldown: 1500,
  color: '#2563eb',
  color2: '#1e40af',
  icon: '🏹',
  name: '远程射手',
  expReward: 25,
  hasMelee: false,
  hasRanged: true,
}

/** 混合型敌人：中等属性、近战 + 远程双技能 */
export const ENEMY_HYBRID = {
  maxHp: 60,
  speed: 2,
  size: ENTITY_SIZE,
  attack: 12,
  attackRange: 45,
  skillRange: 200,
  skillCooldown: 1200,
  color: '#0891b2',        // 青蓝战法师主色
  color2: '#0e7490',       // 深青细节/披风
  icon: '🗡️',
  name: '战法师',
  expReward: 35,
  hasMelee: true,
  hasRanged: true,
}

// ══════════════════ 自爆怪 bomber ══════════════════
/** 低血量高速、近身自爆 AoE，压迫玩家走位 */
export const ENEMY_BOMBER = {
  maxHp: 25,
  speed: 3.5,
  size: ENTITY_SIZE * 0.8,
  attack: 30,              // 自爆伤害
  attackRange: 0,
  skillRange: 0,
  skillCooldown: 0,
  color: '#f59e0b',        // 橙黄色警告色
  color2: '#d97706',
  icon: '💣',
  name: '自爆怪',
  expReward: 15,
  hasMelee: false,
  hasRanged: false,
  bomberRange: 55,         // 自爆触发距离
}

// ══════════════════ 召唤师 summoner ══════════════════
/** 远程站位，不直接攻击，定期召唤小怪 */
export const ENEMY_SUMMONER = {
  maxHp: 50,
  speed: 1.5,
  size: ENTITY_SIZE * 1.1,
  attack: 0,
  attackRange: 0,
  skillRange: 300,          // 保持距离的"舒适区"
  skillCooldown: 0,
  color: '#7e22ce',         // 深紫死灵师主色
  color2: '#3b0764',       // 近黑紫暗影
  icon: '🧙',
  name: '召唤师',
  expReward: 40,
  hasMelee: false,
  hasRanged: false,
  summonCooldown: 4000,     // 召唤间隔 ms
  summonCount: 2,           // 每次召唤数量
  summonMinionHp: 30,       // 召唤物 HP
  summonMinionAttack: 8,    // 召唤物攻击力
  summonMaxMinions: 6,      // 同时存在的召唤物最大数量
  summonSacrificeDmg: 10,   // 上限溢出时，旧召唤物自爆 AoE 伤害
  summonSacrificeRadius: 50,// 自爆 AoE 半径
}

// ══════════════════ 冲锋者 charger ══════════════════
/** 周期性直线冲锋，撞到玩家造成大量伤害 + 击退 */
export const ENEMY_CHARGER = {
  maxHp: 70,
  speed: 2.2,
  size: ENTITY_SIZE * 1.2,
  attack: 25,               // 冲锋撞击伤害
  attackRange: 45,          // 冲锋碰撞判定范围
  skillRange: 0,
  skillCooldown: 0,
  color: '#991b1b',         // 血红重甲骑士主色
  color2: '#1a1a2e',       // 暗夜黑铁铠
  icon: '⚡',
  name: '冲锋者',
  expReward: 30,
  hasMelee: false,          // 不参与通用近战，用独立冲锋逻辑
  hasRanged: false,
  chargeCooldown: 3000,     // 冲锋冷却 ms
  chargeSpeed: 12,          // 冲锋时速度
  windUpDuration: 500,      // 蓄力前摇 ms（视觉预警）
  chargeDuration: 400,      // 冲锋持续 ms
  recoveryDuration: 800,    // 冲锋后僵直 ms
}

// ══════════════════ 护盾兵 shielder ══════════════════
/** 跟随并保护最近友方敌人，提供减伤光环 */
export const ENEMY_SHIELDER = {
  maxHp: 90,
  speed: 1.8,
  size: ENTITY_SIZE * 1.15,
  attack: 10,               // 无保护对象时自身攻击力
  attackRange: 45,
  skillRange: 0,
  skillCooldown: 1000,
  color: '#06b6d4',         // 青色
  color2: '#0891b2',
  icon: '🛡️',
  name: '护盾兵',
  expReward: 35,
  hasMelee: true,           // 无友方时自身有近战能力
  hasRanged: false,
  shieldAuraRange: 120,     // 寻找友方范围
  shieldReduction: 0.4,     // 减伤比例 40%
}

// ══════════════════ 精英怪 — 疾风 wind ══════════════════
/** 普通精英：移速 +40%，青色尾迹，较脆，逼走位 */
export const ENEMY_ELITE_WIND = {
  maxHp: 60,
  hpGrowth: 8,              // Lv7 后每级 +8 HP
  speed: 4.2,               // 固定，不成长
  size: ENTITY_SIZE,
  attack: 12,
  attackGrowth: 2,          // Lv7 后每级 +2 攻击
  attackRange: 50,
  skillRange: 0,
  skillCooldown: 800,
  color: '#06b6d4',         // 青色主色
  color2: '#0891b2',
  icon: '💨',
  name: '疾风武士',
  expRewardBase: 35,         // 基础 EXP，普通精英 ×1.5
  eliteTier: 'normal',
  hasMelee: true,
  hasRanged: false,
}

// ══════════════════ 精英怪 — 血牛 blood ══════════════════
/** 普通精英：体型 1.5x，HP +50%，伤害 +30%，明显更大 */
export const ENEMY_ELITE_BLOOD = {
  maxHp: 180,
  hpGrowth: 20,             // Lv7 后每级 +20 HP
  speed: 2.0,               // 固定，不成长
  size: ENTITY_SIZE * 1.5,  // 固定 1.5x，不随等级放大
  attack: 20,
  attackGrowth: 3,           // Lv7 后每级 +3 攻击
  attackRange: 55,
  skillRange: 0,
  skillCooldown: 800,
  color: '#991b1b',         // 暗红主色
  color2: '#7f1d1d',
  icon: '🐂',
  name: '血牛武士',
  expRewardBase: 45,         // 基础 EXP，普通精英 ×1.5
  eliteTier: 'normal',
  hasMelee: true,
  hasRanged: false,
}

// ══════════════════ 精英怪 — 牧师 priest ══════════════════
/** 稀有精英：周期性给范围内友军回血，本身威胁低，必须优先击杀 */
export const ENEMY_ELITE_PRIEST = {
  maxHp: 70,
  hpGrowth: 10,              // Lv7 后每级 +10 HP
  speed: 1.8,               // 固定，不成长
  size: ENTITY_SIZE * 1.1,   // 略大
  attack: 8,
  attackGrowth: 1.5,         // Lv7 后每级 +1.5 攻击
  attackRange: 45,
  skillRange: 200,
  skillCooldown: 2000,       // 回血间隔 ms（固定）
  color: '#7f1d1d',         // 暗血红主色
  color2: '#fca5a5',        // 血色辅色（光环）
  icon: '⛪',
  name: '亡灵牧师',
  expRewardBase: 60,         // 基础 EXP，稀有精英 ×2.5
  eliteTier: 'rare',
  hasMelee: true,
  hasRanged: false,
  priestHealAmount: 8,      // 基础回血量
  priestHealGrowth: 2,       // Lv7 后每级 +2 回血
  priestHealInterval: 2000,  // 回血间隔 ms（固定）
  priestAuraRange: 130,      // 光环半径 px（固定）
}

// ══════════════════ 精英怪 — 毒虫 venom ══════════════════
/** 稀有精英：向玩家投毒弹，落地生成地面毒区，逼走位 */
export const ENEMY_ELITE_VENOM = {
  maxHp: 50,
  hpGrowth: 6,               // Lv7 后每级 +6 HP
  speed: 2.5,                // 固定，不成长
  size: ENTITY_SIZE,
  attack: 10,                // 毒弹伤害
  attackGrowth: 2,            // Lv7 后每级 +2 毒弹伤害
  attackRange: 0,
  skillRange: 300,
  skillCooldown: 3000,        // 毒弹发射间隔 ms（固定）
  color: '#166534',          // 深绿主色
  color2: '#4ade80',         // 毒绿辅色
  icon: '☠️',
  name: '毒液虫',
  expRewardBase: 55,          // 基础 EXP，稀有精英 ×2.5
  eliteTier: 'rare',
  hasMelee: false,
  hasRanged: false,
  venomWarnDuration: 800,    // 预警圈时长 ms（固定）
  venomZoneDuration: 5000,   // 地面毒区持续 ms（固定）
  venomZoneDamage: 2,        // 基础每秒伤害
  venomZoneDamageGrowth: 0.5, // Lv7 后每级 +0.5 伤害
  venomZoneRadius: 50,        // 毒区半径 px（固定）
  venomBoltSpeed: 4,         // 毒弹飞行速度
  venomMaxZones: 3,          // 每个毒虫最多保留毒区数
}

/** 根据玩家等级返回对应的敌人类型权重表（动态，支持精英怪分级出场） */
export function getEnemyTypeTable(playerLevel) {
  // 基础普通敌人表（Lv1~7 使用）
  const base = [
    { type: 'melee',    attrs: ENEMY_MELEE,    weight: 4 },
    { type: 'ranged',   attrs: ENEMY_RANGED,   weight: 3 },
    { type: 'hybrid',   attrs: ENEMY_HYBRID,   weight: 2 },
    { type: 'bomber',   attrs: ENEMY_BOMBER,   weight: 2 },
    { type: 'summoner', attrs: ENEMY_SUMMONER, weight: 1 },
    { type: 'charger',  attrs: ENEMY_CHARGER,  weight: 2 },
    { type: 'shielder', attrs: ENEMY_SHIELDER, weight: 1 },
  ]
  // Lv 1~7：无精英
  if (!playerLevel || playerLevel <= 7) return base
  // Lv 8~12：普通精英（疾风 + 血牛）
  if (playerLevel <= 12) {
    return [
      ...base,
      { type: 'eliteWind',  attrs: ENEMY_ELITE_WIND,  weight: 2 },
      { type: 'eliteBlood', attrs: ENEMY_ELITE_BLOOD, weight: 2 },
    ]
  }
  // Lv 13+：全部 4 种精英
  return [
    ...base,
    { type: 'eliteWind',   attrs: ENEMY_ELITE_WIND,   weight: 2 },
    { type: 'eliteBlood',  attrs: ENEMY_ELITE_BLOOD,  weight: 2 },
    { type: 'elitePriest', attrs: ENEMY_ELITE_PRIEST, weight: 1 },
    { type: 'eliteVenom',  attrs: ENEMY_ELITE_VENOM,  weight: 1 },
  ]
}

/** 敌人类型静态注册表（用于 UI 显示，不含动态权重） */
export const ENEMY_TYPE_TABLE = [
  { type: 'melee',    attrs: ENEMY_MELEE },
  { type: 'ranged',   attrs: ENEMY_RANGED },
  { type: 'hybrid',   attrs: ENEMY_HYBRID },
  { type: 'bomber',   attrs: ENEMY_BOMBER },
  { type: 'summoner', attrs: ENEMY_SUMMONER },
  { type: 'charger',  attrs: ENEMY_CHARGER },
  { type: 'shielder', attrs: ENEMY_SHIELDER },
  { type: 'eliteWind',  attrs: ENEMY_ELITE_WIND },
  { type: 'eliteBlood', attrs: ENEMY_ELITE_BLOOD },
  { type: 'elitePriest', attrs: ENEMY_ELITE_PRIEST },
  { type: 'eliteVenom',  attrs: ENEMY_ELITE_VENOM },
]

// ─────────────────────────── 技能属性表 ───────────────────────────
/**
 * @typedef {Object} SkillAttrs
 * @property {string}  id           - 技能唯一标识
 * @property {string}  name         - 显示名称
 * @property {string}  icon         - 图标字符（用于 HUD）
 * @property {string}  description  - 技能描述
 * @property {number}  cooldown     - 冷却时间（ms）
 * @property {number}  damage       - 基础伤害值（Lv1）
 * @property {number}  range        - 作用范围 / 射程（px）
 * @property {number}  projectileSpeed - 弹幕飞行速度（仅远程技能）
 * @property {number}  duration     - 持续时间（仅控制 / 光环类，ms）
 * @property {number}  lifestealPercent - 吸血比例（仅吸血光环）
 * @property {number}  unlockLevel  - 解锁所需等级
 * @property {Object}  growth       - 各字段成长比例与硬上限
 *
 * growth 结构说明：
 *   每个字段 = { ratio: number, cap: number|null }
 *   - ratio: 每级乘数，最终值 = base × ratio^(level-1)
 *   - cap:   硬上限，计算结果 clamp(base, cap)，null 表示无上限
 *
 * 升级计算公式：skillValue = min(cap, base × ratio^(currentLevel - 1))
 *   - ratio > 1 → 递增型（伤害、范围、持续时间等）
 *   - ratio < 1 → 递减型（冷却时间，越升级越短）
 */

/**
 * 根据技能基础值与成长配置，计算指定等级的属性值（自动识别 ratio 指数 / increment 线性模式）
 * @param {number} base   - 基础值（Lv1）
 * @param {{ ratio?: number, increment?: number, cap: number|null }} growthCfg - 成长配置
 * @param {number} level  - 目标等级
 * @returns {number} 计算后的属性值
 */
export const calcSkillValue = (base, growthCfg, level) => {
  if (!growthCfg) return base

  // 自动识别成长模式：优先 ratio（指数），其次 increment（线性）
  const useRatio = growthCfg.ratio !== undefined
  const useIncrement = growthCfg.increment !== undefined
  if (!useRatio && !useIncrement) return base

  let value
  if (useRatio) {
    value = base * growthCfg.ratio ** (level - 1)
  } else {
    value = base + growthCfg.increment * (level - 1)
  }

  if (growthCfg.cap !== null && growthCfg.cap !== undefined) {
    // 判断增长方向：ratio ≥ 1 或 increment ≥ 0 → 向上（cap 为上限），反之 cap 为下限
    const goingUp = useRatio ? growthCfg.ratio >= 1 : growthCfg.increment >= 0
    return goingUp
      ? Math.min(growthCfg.cap, value)
      : Math.max(growthCfg.cap, value)
  }
  return value
}

/**
 * 技能属性线性增长计算（base + increment × (level - 1)），适用需精确控制每级增量场景
 * @param {number} base   - 基础值（Lv1）
 * @param {{ increment: number, cap: number|null }} growthCfg - 线性成长配置
 * @param {number} level  - 目标等级
 * @returns {number}
 */
export const calcSkillValueLinear = (base, growthCfg, level) => {
  if (!growthCfg || growthCfg.increment === undefined) return base
  const value = base + growthCfg.increment * (level - 1)
  if (growthCfg.cap !== null && growthCfg.cap !== undefined) {
    return growthCfg.increment >= 0
      ? Math.min(growthCfg.cap, value)
      : Math.max(growthCfg.cap, value)
  }
  return value
}

/** 射箭 — 远程攻击，朝鼠标方向发射箭矢 */
export const SKILL_ARROW = {
  id: 'arrow',
  name: '射箭',
  icon: '🏹',
  description: '朝鼠标方向射出箭矢，击中敌人造成伤害',
  cooldown: 300,
  damage: 10,
  range: 0,
  projectileSpeed: 8,
  duration: 0,
  lifestealPercent: 0,
  unlockLevel: 1,
  growth: {
    damage:          { ratio: 1.35, cap: null },      // Lv1=10, Lv2=13.5, Lv3≈18, Lv5≈33 …
    cooldown:        { ratio: 0.90, cap: 120 },       // 逐级缩短冷却，最低 120ms
    projectileSpeed: { ratio: 1.10, cap: 16 },        // 箭矢加速，上限 16
    range:           { ratio: 1.00, cap: null },      // 射箭无范围限制，不成长
  },
}

/** 近战攻击 — 近距离范围伤害，自动触发 */
export const SKILL_MELEE_ATTACK = {
  id: 'meleeAttack',
  name: '近战劈斩',
  icon: '⚔️',
  description: '自动对周围近距离敌人造成范围伤害',
  cooldown: 600,
  damage: 20,
  range: 60,
  projectileSpeed: 0,
  duration: 0,
  lifestealPercent: 0,
  unlockLevel: 1,
  growth: {
    damage:   { ratio: 1.40, cap: null },    // Lv1=20, Lv2=28, Lv3≈39, Lv5≈77 …
    cooldown: { ratio: 0.88, cap: 300 },     // 冷却缩短，最低 300ms
    range:    { ratio: 1.12, cap: 180 },     // 劈斩范围扩大，上限 180px
  },
}

/** 自动索敌弹幕 — 自动朝最近敌人发射弹幕 */
export const SKILL_AUTO_SEEK = {
  id: 'autoSeek',
  name: '追踪弹幕',
  icon: '🔮',
  description: '自动向最近敌人发射追踪弹幕，每升一级额外增加1颗弹幕（最多5颗额外）',
  cooldown: 2000,
  damage: 15,
  range: 400,
  projectileSpeed: 6,
  extraProjectiles: 0,  // 基础额外弹幕数为0，每升一级+1，最多5
  duration: 0,
  lifestealPercent: 0,
  unlockLevel: 1,
  growth: {
    damage:          { ratio: 1.35, cap: null },      // Lv1=15, Lv2≈20, Lv3≈27 …
    cooldown:        { ratio: 0.92, cap: 800 },       // 冷却缩短，最低 800ms
    range:           { ratio: 1.08, cap: 360 },       // 搜索范围扩大，上限 360px
    projectileSpeed: { ratio: 1.15, cap: 5 },        // 弹速提升，上限 5
  },
}

/** 控制类技能（定身 / 减速） */
export const SKILL_FREEZE = {
  id: 'freeze',
  name: '冰冻定身',
  icon: '❄️',
  description: '冻结范围内敌人，使其定身减速',
  cooldown: 4000,
  damage: 5,
  range: 120,
  projectileSpeed: 0,
  duration: 3000,
  lifestealPercent: 0,
  unlockLevel: 1,
  growth: {
    damage:   { ratio: 1.40, cap: null },    // Lv1=5, Lv2=7, Lv3≈10 …
    cooldown: { ratio: 0.90, cap: 2000 },    // 冷却缩短，最低 2000ms
    range:    { ratio: 1.10, cap: 240 },     // 冰冻范围扩大，上限 240px
    duration: { ratio: 1.15, cap: 8000 },    // 定身时间延长，上限 8000ms
  },
}

/** 吸血光环 — 造成伤害按比例回复生命 */
export const SKILL_VAMPIRE_AURA = {
  id: 'vampireAura',
  name: '吸血光环',
  icon: '🩸',
  description: '光环范围内持续造成伤害，并按比例回复自身生命',
  cooldown: 5000,
  damage: 8,
  range: 80,
  projectileSpeed: 0,
  duration: 5000,
  lifestealPercent: 0.3,
  unlockLevel: 1,
  growth: {
    damage:          { ratio: 1.40, cap: null },      // Lv1=8, Lv2≈11, Lv3≈16 …
    cooldown:        { ratio: 0.92, cap: 3000 },      // 冷却缩短，最低 3000ms
    range:           { ratio: 1.10, cap: 200 },       // 光环范围扩大，上限 200px
    duration:        { ratio: 1.10, cap: 10000 },     // 持续时间延长，上限 10000ms
    lifestealPercent:{ ratio: 1.10, cap: 0.8 },       // 吸血比例提升，上限 80%
  },
}

/** 强身健体 — 被动技能，每级按比例提升最大生命值、移动速度和基础攻击力 */
export const SKILL_BODY_STRENGTH = {
  id: 'bodyStrength',
  name: '强身健体',
  icon: '💪',
  description: '被动技能，每级提升最大生命值、移动速度和基础攻击力',
  cooldown: 0,
  damage: 0,
  range: 0,
  projectileSpeed: 0,
  duration: 0,
  lifestealPercent: 0,
  unlockLevel: 1,
  isPassive: true,
  // 基础加成值（Lv1 时的加成量）
  maxHpBonusBase: 20,
  speedBonusBase: 0.3,
  attackBonusBase: 2,
  growth: {
    maxHpBonus:   { ratio: 1.15, cap: null },   // 无上限
    speedBonus:   { ratio: 1.10, cap: 2 },      // 速度加成上限 2
    attackBonus:  { ratio: 1.12, cap: null },   // 无上限
  },
}

/** 无敌 — 主动技能，按 Q 键释放，短暂时间内不受伤害并提升移速与伤害 */
export const SKILL_INVINCIBLE = {
  id: 'invincible',
  name: '无敌',
  icon: '🛡️',
  description: '短时间内免疫所有伤害，提升移速与伤害加成',
  cooldown: 20000,         // 冷却 20s
  damage: 0,               // 无直接伤害
  range: 0,
  projectileSpeed: 0,
  duration: 3000,          // 无敌持续 3s（基础）
  speedBoost: 0.1,         // 移速加成 10%（基础）
  damageBoost: 0.1,        // 伤害加成 10%（基础）
  lifestealPercent: 0,
  unlockLevel: 1,
  growth: {
    cooldown:    { ratio: 0.92, cap: 9000 },   // 冷却缩短，最低 9s
    duration:    { ratio: 1.10, cap: 8000 },     // 持续时间延长，上限 8s
    speedBoost:  { ratio: 1.10, cap: 2.0 },      // 移速加成提升，上限 200%
    damageBoost: { ratio: 1.12, cap: null },      // 伤害加成提升，无上限
  },
}

/** 魔法阵火雨 — 在鼠标位置召唤魔法阵，持续坠落火球并灼烧范围内敌人 */
export const SKILL_MAGIC_CIRCLE = {
  id: 'magicCircle',
  name: '魔法阵火雨',
  icon: '🔥',
  description: '在鼠标位置召唤魔法阵，持续坠落火球并对范围内敌人造成灼烧伤害',
  cooldown: 10000,          // 冷却 10s
  damage: 12,               // 每颗火球伤害
  burnDamage: 5,            // 灼烧伤害/跳
  range: 70,                // 魔法阵半径
  fireballCount: 3,         // 每波火球数量
  fireballRadius: 25,       // 火球 AoE 半径
  duration: 4000,            // 总持续时间 4s
  projectileSpeed: 0,
  lifestealPercent: 0,
  unlockLevel: 2,
  /** 线性成长配置（increment 取代 ratio，每级固定增减） */
  growth: {
    damage:        { increment: 5, cap: null },     // 火球伤害 12→17→22…
    burnDamage:    { increment: 2, cap: null },     // 灼烧伤害 5→7→9…
    range:         { increment: 10, cap: 200 },     // 半径 70→80→90…上限 200
    fireballCount: { increment: 1, cap: 8 },        // 火球 3→4→5…上限 8
    duration:      { increment: 500, cap: 10000 },  // 持续 4000→4500…上限 10s
    cooldown:      { increment: -500, cap: 5000 },  // 冷却 10000→9500…下限 5s
  },
}

/** 技能注册表 */
export const SKILL_TABLE = [
  SKILL_ARROW,
  SKILL_MELEE_ATTACK,
  SKILL_AUTO_SEEK,
  SKILL_FREEZE,
  SKILL_VAMPIRE_AURA,
  SKILL_BODY_STRENGTH,
  SKILL_INVINCIBLE,
  SKILL_MAGIC_CIRCLE,
]

/**
 * 技能固定按键映射（技能ID → 按键编号，从1开始）
 * 无论技能以何种顺序获取，每个技能始终绑定同一个按键
 */
export const SKILL_KEY_MAP = {
  arrow:         1,
  meleeAttack:   2,
  autoSeek:      3,
  freeze:        4,
  vampireAura:   5,
  invincible:   'Q',
  magicCircle:  'E',
}

// ─────────────────────────── 掉落物 ───────────────────────────
/** 掉落物类型定义 */
export const LOOT_TABLE = {
  healthPotion: {
    id: 'healthPotion',
    name: '生命药水',
    icon: '❤️',
    color: '#ef4444',
    hoverColor: '#fca5a5',
    size: 12,
    healAmount: 15,        // 恢复 15 点生命
    dropChance: 0.05,      // 5% 掉落概率
    lifetime: 12000,       // 12 秒后消失
    glowSpeed: 300,        // 闪烁周期 ms
  },
  goldCoin: {
    id: 'goldCoin',
    name: '金币',
    icon: '🪙',
    color: '#fbbf24',
    hoverColor: '#fde68a',
    size: 10,
    goldAmount: 1,         // 1 金币（预留）
    dropChance: 0.10,      // 10% 掉落概率
    lifetime: 20000,       // 20 秒后消失
    glowSpeed: 500,
  },
}

// ─────────────────────────── 经验等级公式 ───────────────────────────
/**
 * 每级累计所需经验值（无等级上限）。
 *
 * 设计（方案 C：等级软上限）：
 *   - Lv 1～15：完全复用原有硬编表数值（保证现有体验不变）
 *   - Lv 16+  ：增量线性增长，避免指数爆炸
 *     Lv15→16 增量 = 4000（与原表 Lv14→15 增量衔接）
 *     每升一级，下一级增量固定 +LINEAR_STEP（500）
 *     总阈值为 O(n²) 多项式增长，数字可控，前端显示友好
 *
 * 数值示例（Lv16+ 累计阈值）：
 *   Lv16  = 17,000   （增量 4000）
 *   Lv20  = 38,000   （增量 6400）
 *   Lv30  = 150,000  （增量 11400）
 *   Lv50  = 450,500  （增量 21400）
 *   Lv100 = 1,750,500（增量 46400）
 *
 * @param {number} level - 目标等级（≥ 1）
 * @returns {number} 升到该等级所需的累计经验值
 */
const EXP_LINEAR_STEP = 500          // Lv16+ 每级增量增加量
const EXP_LV15_THRESHOLD = 13000     // Lv15 累计阈值（原表最后一项）
const EXP_LV15_INCREMENT = 4000      // Lv14→Lv15 增量（Lv15→16 起点）

/**
 *  closed-form 计算累计阈值（O(1)，无缓存需求）：
 *  m = level - 15（超过 15 级的级数，≥ 1）
 *  total = 13000 + m×4000 + 500 × (m-1)×m / 2
 */
export function getExpThreshold(level) {
  if (level <= 1) return 0
  if (level <= 15) return EXP_LEVEL_TABLE[level - 1]

  const m = level - 15
  const total = EXP_LV15_THRESHOLD
    + m * EXP_LV15_INCREMENT
    + EXP_LINEAR_STEP * (m - 1) * m / 2
  return Math.floor(total)
}

/**
 * 升到下一级所需经验增量（O(1)，无上限）。
 *  Lv15+ 直接公式：increment = 4000 + (level - 15) × 500
 *
 * @param {number} level - 当前等级
 * @returns {number} 升到下一级所需的经验增量
 */
export function getExpForNextLevel(level) {
  if (level < 15) {
    return getExpThreshold(level + 1) - getExpThreshold(level)
  }
  return EXP_LV15_INCREMENT + (level - 15) * EXP_LINEAR_STEP
}

// 保留原表作为常量导出（前 15 级精确值，方便调试对比）
export const EXP_LEVEL_TABLE = [
  0,     // Lv 1
  50,    // Lv 2
  120,   // Lv 3
  200,   // Lv 4
  320,   // Lv 5
  500,   // Lv 6
  750,   // Lv 7
  1100,  // Lv 8
  1600,  // Lv 9
  2300,  // Lv 10
  3200,  // Lv 11
  4500,  // Lv 12
  6500,  // Lv 13
  9000,  // Lv 14
  13000, // Lv 15
]

// ─────────────────────────── 敌人刷新参数 ───────────────────────────
/** 初始刷新间隔（ms） */
export const SPAWN_INTERVAL_INITIAL = 1000
/** 最小刷新间隔（ms），随游戏时长逐渐缩短至此值 */
export const SPAWN_INTERVAL_MIN = 100
/** 刷新间隔缩短速率：每过一段时间减少的毫秒数 */
export const SPAWN_INTERVAL_DECREASE_PER_SEC = 20
/** 敌人刷新位置距镜头边界的额外偏移（px） */
export const SPAWN_MARGIN = 20
/** 场上最大敌人数（不含召唤物），超出后不再刷新新敌人 */
export const MAX_ENEMIES = 60
/** 场上最大召唤物总数（所有召唤师共享），防止实体过多导致卡顿 */
export const MAX_SUMMONS = 40

// ─────────────────────────── 战斗日志参数 ───────────────────────────
/** 战斗日志最大存储条数（超出后自动丢弃最旧的条目） */
export const BATTLE_LOG_MAX_STORE = 200
/** 战斗日志面板最大显示条数（只渲染最近 N 条，不影响存储） */
export const BATTLE_LOG_MAX_DISPLAY = 20

// ─────────────────────────── 敌人属性随玩家等级缩放 ───────────────────────────
/** 每级生命值缩放比例（Lv1 为基准，每升一级 HP 增加该比例 × 基础值） */
export const ENEMY_HP_SCALE_RATE = 0.06
/** 每级攻击力缩放比例 */
export const ENEMY_ATTACK_SCALE_RATE = 0.05

/**
 * 敌人属性随玩家等级动态缩放（仅缩放 HP 和攻击力；移速、攻击距离不变）
 * @param {number} playerLevel - 玩家当前等级
 * @param {number} baseValue  - 基础属性值
 * @param {number} scaleRate  - 每级缩放比例
 * @returns {number} 缩放后的属性值（取整）
 */
export function scaleEnemyStat(playerLevel, baseValue, scaleRate) {
  return Math.round(baseValue * (1 + (playerLevel - 1) * scaleRate))
}

// ─────────────────────────── 弹幕参数 ───────────────────────────
/** 敌人远程弹幕飞行速度 */
export const ENEMY_PROJECTILE_SPEED = 5
/** 敌人远程弹幕伤害 */
export const ENEMY_PROJECTILE_DAMAGE = 8
/** 敌人弹幕尺寸 */
export const ENEMY_PROJECTILE_SIZE = 8

// ─────────────────────────── 召唤师死灵弹幕参数 ───────────────────────────
/** 召唤师死灵弹幕飞行速度（比普通弹幕慢，可闪避） */
export const SUMMONER_BOLT_SPEED = 3.5
/** 召唤师死灵弹幕伤害（比弓箭手弱 25%） */
export const SUMMONER_BOLT_DAMAGE = 6
/** 召唤师死灵弹幕尺寸 */
export const SUMMONER_BOLT_SIZE = 7
/** 召唤师死灵弹幕发射间隔（ms，冷却期发 2~3 发） */
export const SUMMONER_BOLT_COOLDOWN = 1300

// ─────────────────────────── 箭矢参数 ───────────────────────────
/** 箭矢尺寸（用于碰撞检测半径） */
export const ARROW_SIZE = 12

// ─────────────────────────── 碰撞检测阈值 ───────────────────────────
/** 两个实体碰撞距离阈值（近似为双方尺寸之和的一半） */
export const COLLISION_THRESHOLD = ENTITY_SIZE * 0.8

// ─────────────────────────── 帧动画参数 ───────────────────────────
/** 帧切换间隔（ms） */
export const FRAME_INTERVAL = 100
/** 每方向帧数 */
export const FRAME_COUNT = 4

// ─────────────────────────── 方向常量 ───────────────────────────
export const DIRECTION = {
  FRONT: 'front',
  LEFT:  'left',
  RIGHT: 'right',
}
