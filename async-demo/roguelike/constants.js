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
  color: '#dc2626',
  color2: '#991b1b',
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
  color: '#7c3aed',
  color2: '#5b21b6',
  expReward: 35,
  hasMelee: true,
  hasRanged: true,
}

/** 敌人类型注册表（按权重随机抽取） */
export const ENEMY_TYPE_TABLE = [
  { type: 'melee',   attrs: ENEMY_MELEE,   weight: 3 },
  { type: 'ranged',  attrs: ENEMY_RANGED,  weight: 2 },
  { type: 'hybrid',  attrs: ENEMY_HYBRID,  weight: 1 },
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
 * 根据技能基础值与成长配置，计算指定等级的属性值
 * @param {number} base   - 基础值（Lv1）
 * @param {{ ratio: number, cap: number|null }} growthCfg - 成长配置
 * @param {number} level  - 目标等级
 * @returns {number} 计算后的属性值
 */
export const calcSkillValue = (base, growthCfg, level) => {
  if (!growthCfg) return base
  const value = base * growthCfg.ratio ** (level - 1)
  if (growthCfg.cap !== null && growthCfg.cap !== undefined) {
    // ratio > 1 时 cap 为上限；ratio < 1 时 cap 为下限
    return growthCfg.ratio >= 1
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
  description: '自动向最近敌人发射追踪弹幕',
  cooldown: 2000,
  damage: 15,
  range: 400,
  projectileSpeed: 6,
  duration: 0,
  lifestealPercent: 0,
  unlockLevel: 1,
  growth: {
    damage:          { ratio: 1.35, cap: null },      // Lv1=15, Lv2≈20, Lv3≈27 …
    cooldown:        { ratio: 0.92, cap: 800 },       // 冷却缩短，最低 800ms
    range:           { ratio: 1.08, cap: 360 },       // 搜索范围扩大，上限 360px
    projectileSpeed: { ratio: 1.15, cap: 12 },        // 弹速提升，上限 12
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

/** 技能注册表 */
export const SKILL_TABLE = [
  SKILL_ARROW,
  SKILL_MELEE_ATTACK,
  SKILL_AUTO_SEEK,
  SKILL_FREEZE,
  SKILL_VAMPIRE_AURA,
  SKILL_BODY_STRENGTH,
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
}

// ─────────────────────────── 经验等级对照表 ───────────────────────────
/**
 * 每级所需累计经验值，索引 = 等级 - 1
 * level 1 = 0 exp（初始等级）
 * level 2 = 50 exp
 * level 3 = 120 exp ...
 */
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
/** 场上最大敌人数，超出后不再刷新新敌人 */
export const MAX_ENEMIES = 60

// ─────────────────────────── 弹幕参数 ───────────────────────────
/** 敌人远程弹幕飞行速度 */
export const ENEMY_PROJECTILE_SPEED = 5
/** 敌人远程弹幕伤害 */
export const ENEMY_PROJECTILE_DAMAGE = 8
/** 敌人弹幕尺寸 */
export const ENEMY_PROJECTILE_SIZE = 8

// ─────────────────────────── 箭矢参数 ───────────────────────────
/** 箭矢尺寸（用于碰撞检测半径） */
export const ARROW_SIZE = 12

// ─────────────────────────── 操控键位 ───────────────────────────
export const KEY_BINDINGS = {
  moveUp:    ['w', 'ArrowUp'],
  moveDown:  ['s', 'ArrowDown'],
  moveLeft:  ['a', 'ArrowLeft'],
  moveRight: ['d', 'ArrowRight'],
  shoot:     [' '],          // 空格键射击
  skill1:    ['1'],
  skill2:    ['2'],
  skill3:    ['3'],
  skill4:    ['4'],
}

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
