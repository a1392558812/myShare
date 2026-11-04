/**
 * bro-melee 全局常量与数值基线
 * 所有可调数值集中在此文件与 config/* 中，逻辑代码不写魔法数字
 */

/** 无限地图与分块 */
export const WORLD_CONFIG = {
  CHUNK_SIZE: 512,
  ACTIVE_CHUNK_RADIUS: 2,
  BACKGROUND_CACHE_LIMIT: 40,
  MAP_SEED: 20261102,
  DESPAWN_DISTANCE: 2000,
};

/** 战斗与成长数值（对应 README §18 关键数值表） */
export const BALANCE = {
  EXP_PER_VICTIM_LEVEL: 10,
  EXP_CURVE_BASE: 100,
  EXP_CURVE_GROWTH: 1.15,
  SKILL_EVERY_LEVELS: 5,

  HP_PER_LEVEL: 12,
  ATTACK_PER_LEVEL: 4,
  DEFENSE_PER_LEVEL: 1.2,
  SPEED_PER_LEVEL: 0.005,
  SPEED_GROWTH_CAP: 1.35,
  RADIUS_PER_LEVEL: 0.3,
  RADIUS_GROWTH_CAP: 14,

  LEVEL_DIFF_CAP: 5,
  LEVEL_DAMAGE_SCALE: 0.03,
  CRIT_DAMAGE_MULTIPLIER: 1.5,
  MIN_DAMAGE: 1,

  // 弹指飞掷：低伤害远程普攻（伤害 = 攻击 × MULTIPLIER）
  RANGED_ATTACK: {
    RANGE: 460,
    MULTIPLIER: 0.45,
    SPEED: 780,
    RADIUS: 6,
    LIFE: 0.62,
  },

  PLAYER: {
    maxHp: 150,
    attack: 22,
    defense: 2,
    speed: 214,
    radius: 16,
    critRate: 0.06,
    attackInterval: 0.34,
    attackMultiplier: 1.5,
    attackRange: 66,
    attackArc: Math.PI * 0.62,
    dashCooldown: 2.2,
    dashDistance: 250,
    dashDuration: 0.18,
    dashInvulnerable: 0.26,
    hitInvulnerable: 0.18,
    levelUpHealRatio: 0.12,
  },

  ENEMY_BASE: {
    maxHp: 90,
    attack: 9,
    defense: 1,
    speed: 190,
    radius: 15,
  },

  HIT_STUN: 0.12,
  HIT_FLASH_TIME: 0.14,
  KNOCKBACK_FRICTION: 8,

  ITEM: {
    pickupPadding: 8,
    spawnInterval: 13,
    spawnRadiusMin: 320,
    spawnRadiusMax: 640,
    maxOnMap: 28,
    expireTime: 90,
  },

  DROP: {
    expBookChance: 0.4,
    healChance: 0.2,
    rareChance: 0.05,
    greatPillChance: 0.03,
  },

  BOSS_DROP_COUNT: 3,
};

/** 神兵争夺（README §12） */
export const RELIC_CONFIG = {
  // 谢逊：开局 105s 携双兵登场，伏诛后 150s 再现
  XIEXUN_FIRST_DELAY: 105,
  XIEXUN_RESPAWN_DELAY: 150,
  XIEXUN_LEVEL_OFFSET: 9,
  XIEXUN_HUNT_RADIUS: 2600, // 复仇形态锁定持兵者的最大追猎半径

  // 复仇形态：双兵已落他人手，空手返场 —— 属性压过「双兵在手」
  REVENGE: {
    ATTACK_MULTIPLIER: 2.15,
    HP_MULTIPLIER: 1.5,
    DEFENSE_FLAT: 18,
    SPEED_MULTIPLIER: 1.08,
    MELEE_BONUS: 0.55,
    DAMAGE_REDUCTION: 0.26,
  },

  // 谢逊 / 张翠山羁绊：一方存活时给另一方加成，双双存活才是完整战力
  BOND: {
    CHECK_INTERVAL: 0.5,
    ESCORT_LEVEL_OFFSET: -3,
    ESCORT_SPAWN_OFFSET: 64,
    FOLLOW_RADIUS: 720,
    FOLLOW_KEEP_DISTANCE: 90,
    LEADER_SURVIVE: { attack: 0.2, speed: 0.08 },
    ESCORT_SURVIVE: { attack: 0.25, speed: 0.12, damageReduction: 0.12 },
  },

  // 非谢逊角色持兵时，猎杀队刷新节奏与等级
  HUNT_FIRST_DELAY: 6,
  HUNT_INTERVAL_MIN: 9,
  HUNT_INTERVAL_MAX: 14,
  HUNT_BATCH_MIN: 1,
  HUNT_BATCH_MAX: 2,
  HUNT_LEVEL_OFFSET_MIN: 4,
  HUNT_LEVEL_OFFSET_MAX: 7,
  HUNT_SPAWN_RADIUS_MIN: 300,
  HUNT_SPAWN_RADIUS_MAX: 620,
  HUNT_MAX_ALIVE: 6,
  HUNT_AGGRO_RADIUS: 1600,

  // AI 评估：捡不捡
  PICKUP_SELF_RATIO: 0.72, // 自身战力需达到持兵后战力期望的比例
  PICKUP_THREAT_RATIO: 1.15, // 场上最强对手不高于自身战力的这个倍数才敢捡
  PICKUP_HP_RATIO: 0.35, // 残血时懒得贪宝
  // AI 评估：放不放
  DROP_HP_RATIO: 0.3,
  DROP_PRESSURE_COUNT: 3, // 周围敌人多于这个数且打不过就丢
  DROP_CHECK_INTERVAL: 1.2,
  DROP_RADIUS: 420,
  DROP_IMMUNE_DURATION: 3, // 丢下的神兵在这段时间内自己捡不回来

  // 远程偷袭：与持兵玩家保持的距离区间
  SNIPE_MIN_DISTANCE: 230,
  SNIPE_MAX_DISTANCE: 360,
  SNIPE_DAMAGE_MULTIPLIER: 1.15,
  SNIPE_HP_RATIO: 0.7, // 自己血量高于此才敢贴脸，否则改为远程偷袭

  // 神兵「既无人持、也不在地上」时的重新投放延迟
  RESPAWN_DELAY: 30,
};

/** 奇遇（README §21） */
export const ENCOUNTER_CONFIG = {
  FIRST_DELAY: 20,
  INTERVAL_MIN: 28,
  INTERVAL_MAX: 44,
  MAX_ON_MAP: 2,
  RADIUS_MIN: 320,
  RADIUS_MAX: 600,
  LIFE: 210,
  TRIGGER_PADDING: 10,
  TAIXUAN_CHANNEL: 10, // 太玄经打坐时长
  MASTER_CHANNEL: 3.5, // 聋哑先生每次传功的时长
  MASTER_INTERVAL: 30, // 传功间隔
  MASTER_TIMES: 3,
  COMPANION_FOLLOW: 96,
  COMPANION_LEASH: 200, // 离玩家超过这个距离就先归队，不追人
  COMPANION_ENGAGE: 380, // 只打玩家这个半径内的敌人
  COMPANION_FOCUS_MEMORY: 4, // 玩家最后一击的目标记多久（秒）
  COMPANION_FOCUS_BONUS: 150, // 集火目标额外放宽的追击距离
  GUARD_RADIUS: 320,
  TAUNT_INTERVAL: 9,
  TAUNT_JITTER: 4, // 每隔 9~13 秒挑一个敌人开口
  TAUNT_RADIUS: 420, // 只有玩家附近「路过」的敌人会嘲笑
};

/** 随从自修武功（小师妹会自己挑秘籍练，火候比玩家浅） */
export const COMPANION_MANUAL_CONFIG = {
  SCALE: 0.62, // 秘籍加成折算：随从只吃到六成火候
  ENCOUNTER_WEIGHT: 0.35, // 奇遇绝学降权，免得随从一步登天
  PASSIVE_WEIGHT: 1, // 已学过的秘籍降权
  STACK_WEIGHT: 0.55, // 同本秘籍每多一层权重递减
  ACTIVE_WEIGHT: 0.8,
  MAX_ACTIVE: 3, // 主动招式上限，超出后大幅降权
  ACTIVE_OVER_WEIGHT: 0.25,
  CAST_RANGE: 300, // 主动招式默认释放距离（秘籍没写 autoRange 时用这个）
  MAX_DAMAGE_REDUCTION: 0.4,
};

/** AI 行为参数（README §8.5） */
export const AI_CONFIG = {
  VIEW_RADIUS: 270,
  BOSS_VIEW_RADIUS: 400,
  TICK: 0.5,
  RETREAT_HP_RATIO: 0.3,
  FLEE_SCORE_RATIO: 1.8,
  WANDER_SPEED_RATIO: 0.45,
  ITEM_SEARCH_RADIUS: 440,
  ATTACK_PADDING: 6,
  SEPARATION_STRENGTH: 120,
  /** 眩晕超过这个时长才算「明显硬直」，敌人会当成破绽扑上来 */
  EXPOSE_STUN: 0.3,
  /** 破绽目标在选目标评分里的额外权重（压过距离与残血） */
  EXPOSE_TARGET_BONUS: 60,
  /** 交过手之后的记仇时长：这段时间内不因战力重估而脱战 */
  ENGAGE_MEMORY: 4,
};

/** 刷新与难度浮动参数（README §10） */
export const SPAWN_CONFIG = {
  BASE_MIN_OFFSET: -5,
  BASE_MAX_OFFSET: 2,
  MIN_SPREAD: 5,
  MAX_SPREAD: 18,
  DRIFT_STEP_SECONDS: 70,
  DRIFT_CAP: 7,
  BATCH_INTERVAL_MIN: 2.8,
  BATCH_INTERVAL_MAX: 4,
  BATCH_MIN: 2,
  BATCH_MAX: 6,
  ENEMY_CAP_BASE: 18,
  ENEMY_CAP_PER_LEVEL: 1.8,
  ENEMY_CAP_MAX: 72,
  RING_MIN: 130,
  RING_MAX: 560,
  BOSS_INTERVAL: 90,
  BOSS_LEVEL_OFFSET: 5,
  BOSS_RING_MIN: 820,
  BOSS_RING_MAX: 1120,
  RESCUE_IDLE_SECONDS: 60,
  RESCUE_HP_RATIO: 0.5,
  BEATABLE_CHECK_INTERVAL: 2.5,
  BEATABLE_RADIUS: 900,
  BEATABLE_MIN_COUNT: 3,
  PRESSURE_WINDOW: 30,
  PRESSURE_KILL_COUNT: 14,
  PRESSURE_DANGER_EVENTS: 2,
  LOW_HP_RATIO: 0.35,
  LOW_HP_EVENT_COOLDOWN: 4,
  MINION_CAP: 4,
  /* 噩梦模式的动态压力：一击打掉目标 2/3 以上气血 = 地图太软，抬高刷新等级 */
  OVERKILL_HIT_RATIO: 2 / 3,
  /** 秒掉区间最低级的敌人：只说明整体略微偏低，小幅上调 */
  OVERKILL_STEP_LOW: 0.6,
  /** 连区间最高级也能秒：整张地图都太软，大幅上调 */
  OVERKILL_STEP_HIGH: 1.5,
  OVERKILL_CAP: 10,
  /** 多久没有「一击秒杀」就开始回落（秒） */
  OVERKILL_IDLE_BEFORE_DECAY: 25,
  OVERKILL_DECAY_PER_SECOND: 0.06,
};

/** 判定「明显打得过」的战力倍率：越小越好战（各类型性格不同） */
export const AGGRO_RATIO = {
  wolf: 1.08,
  bandit: 1.06,
  mage: 1.25,
  archer: 1.28,
  ogre: 1.15,
  ninja: 1.12,
  monk: 1.16,
  assassin: 1.14,
  boss: 1.6,
  xiexun: 0.95,
  wulinMaster: 0.9,
  imperialGuard: 0.92,
};

/** 配色（UI 与 Canvas 共用） */
export const PALETTE = {
  ground: '#1d2117',
  groundAlt: '#22261a',
  grid: 'rgba(140, 160, 120, 0.06)',
  grass: 'rgba(126, 154, 96, 0.32)',
  rock: 'rgba(120, 122, 112, 0.28)',
  dust: 'rgba(96, 88, 66, 0.22)',
  player: '#f0e2c8',
  playerRobe: '#2f7d6d',
  playerEdge: '#8ef0d5',
  hpGood: '#63d471',
  hpBad: '#d94a3d',
  levelUp: '#ffd166',
  exp: '#7be3ff',
  item: '#8fe8ff',
  danger: '#e05545',
  relic: '#ffd166',
  relicSaber: '#ff9b5a',
  relicSword: '#8fd0ff',
};

/** 队伍协作：复活倒地随从 / 传功回血（v1.10） */
export const TEAMWORK_CONFIG = {
  REVIVE_START_RADIUS: 150,
  REVIVE_KEEP_RADIUS: 190,
  REVIVE_DURATION: 3,

  TRANSFER_RADIUS: 170,
  TRANSFER_BREAK_RADIUS: 215,
  TRANSFER_HEAL_RATIO: 0.08,
  TRANSFER_COST_RATIO: 0.02,
};
