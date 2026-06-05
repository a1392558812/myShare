/**
 * 游戏常量配置
 * 包含所有游戏相关的静态配置数据
 */

/**
 * 角色属性配置
 */
export const STAT_CONFIG = {
  /** 属性点系数：每点属性对应的实际数值加成（玩家使用） */
  POINT_COEFFICIENTS: {
    physicalAttack: 1.5, // 物理攻击：1点 = 1.5攻击
    magicAttack: 1.1, // 魔法攻击：1点 = 1.1攻击
    defense: 2, // 防御：1点 = 2防御
    speed: 1, // 速度：1点 = 1速度
    maxHp: 10, // 生命值：1点 = 10生命
    maxMp: 1.1, // 法力值：1点 = 1.1法力
  },
  /** 宠物属性点系数：每点属性对应的实际数值加成（宠物使用，支持重铸） */
  PET_POINT_COEFFICIENTS: {
    physicalAttack: 1.5, // 物理攻击：1点 = 1.5攻击
    magicAttack: 1.1, // 魔法攻击：1点 = 1.1攻击
    defense: 2, // 防御：1点 = 2防御
    speed: 1, // 速度：1点 = 1速度
    maxHp: 10, // 生命值：1点 = 10生命
    maxMp: 1.1, // 法力值：1点 = 1.1法力
  },
  /** 宠物属性点系数重铸取值范围 */
  PET_STAT_POINT_COEFFICIENT_RANGES: {
    physicalAttack: { min: 0.5, max: 3 }, // 物理攻击系数范围：0.5 ~ 3
    magicAttack: { min: 0.2, max: 3 }, // 魔法攻击系数范围：0.2 ~ 3
    defense: { min: 0.5, max: 3 }, // 防御系数范围：0.5 ~ 3
    speed: { min: 0.5, max: 5 }, // 速度系数范围：0.5 ~ 5
    maxHp: { min: 0.5, max: 5 }, // 生命值系数范围：0.5 ~ 5
    maxMp: { min: 0.5, max: 5 }, // 法力值系数范围：0.5 ~ 5
  },
  /** 宠物属性点系数重铸费用配置 */
  STAT_REROLL: {
    BASE_COST: 100, // 基础重铸费用
    LEVEL_COST_MULTIPLIER: 10, // 宠物等级费用系数：最终费用 = BASE_COST + level * LEVEL_COST_MULTIPLIER
  },
  /** 宠物技能学习费用配置 */
  SKILL_LEARN: {
    BASE_COST: 100, // 基础费用
    LEVEL_COST_MULTIPLIER: 20, // 每级增加费用
  },
  /** 基础属性值：初始创建角色时的默认属性 */
  BASE_VALUES: {
    physicalAttack: 15, // 基础物理攻击
    magicAttack: 10, // 基础魔法攻击
    defense: 5, // 基础防御
    speed: 5, // 基础速度
    maxHp: 100, // 基础最大生命
    maxMp: 50, // 基础最大法力
    critRate: 5, // 基础暴击率(%)
    comboRate: 0, // 基础连击率(%)
    maxComboCount: 1, // 基础最大连击次数
  },
  /** 属性中文名称映射 */
  NAMES: {
    physicalAttack: "物攻",
    magicAttack: "法攻",
    defense: "防御",
    speed: "速度",
    maxHp: "生命",
    maxMp: "法力",
    critRate: "暴击率",
    comboRate: "连击率",
    maxComboCount: "最大连击",
    debuffResist: "障碍抗性",
    ignoreDebuffResist: "忽视障碍异常",
  },
  /** 可分配的属性点类型列表 */
  POINT_STATS: ["physicalAttack", "magicAttack", "defense", "speed", "maxHp"],
  /** 所有属性类型列表（包含战斗属性） */
  ALL_STATS: [
    "physicalAttack",
    "magicAttack",
    "defense",
    "speed",
    "maxHp",
    "maxMp",
    "critRate",
    "comboRate",
    "maxComboCount",
  ],
};

/**
 * 装备相关配置
 */
export const EQUIPMENT_CONFIG = {
  /** 装备槽位类型定义 */
  TYPES: {
    weapon: { name: "武器", icon: "⚔️" },
    necklace: { name: "项链", icon: "📿" },
    crown: { name: "头冠", icon: "👑" },
    jade: { name: "玉佩", icon: "💎" },
    chest: { name: "护胸甲", icon: "🛡️" },
    legs: { name: "护腿甲", icon: "🦵" },
    shoes: { name: "鞋子", icon: "👟" },
    leftRing: { name: "左手环", icon: "💍" },
    rightRing: { name: "右手环", icon: "💍" },
    belt: { name: "腰带", icon: "🎗️" },
  },
  /** 装备稀有度等级 */
  RARITY: {
    0: { name: "普通", color: "#9E9E9E", multiplier: 1, sellMultiplier: 1 }, // multiplier:装备基础属性和词缀属性加成倍率
    1: { name: "优秀", color: "#4CAF50", multiplier: 1.2, sellMultiplier: 1.2 },
    2: { name: "精良", color: "#2196F3", multiplier: 1.5, sellMultiplier: 1.5 },
    3: { name: "史诗", color: "#9C27B0", multiplier: 1.8, sellMultiplier: 1.8 },
    4: { name: "传说", color: "#FF9800", multiplier: 2, sellMultiplier: 2 },
    5: { name: "神话", color: "#F44336", multiplier: 2.5, sellMultiplier: 2.5 },
  },
  /** 装备等级范围 */
  LEVEL_RANGE: {
    MIN_OFFSET: -2, // 最小偏移
    MAX_OFFSET: 5, // 最大偏移
  },
  /** 稀有度权重配置（用于随机生成） */
  RARITY_WEIGHTS: {
    0: { weight: 50, maxAffixes: 2 }, // 普通：50%权重，最多2个词缀
    1: { weight: 30, maxAffixes: 3 }, // 优秀：30%权重，最多3个词缀
    2: { weight: 15, maxAffixes: 4 }, // 精良：15%权重，最多4个词缀
    3: { weight: 4, maxAffixes: 5 }, // 史诗：4%权重，最多5个词缀
    4: { weight: 0.9, maxAffixes: 6 }, // 传说：0.9%权重，最多6个词缀
    5: { weight: 0.1, maxAffixes: 7 }, // 神话：0.1%权重，最多7个词缀
  },
  /** 基础词条池 */
  BASE_AFFIX_POOL: {
    physicalAttack: { baseValue: true, name: "物理攻击" },
    magicAttack: { baseValue: true, name: "法术攻击" },
    defense: { baseValue: true, name: "防御" },
    speed: { baseValue: true, name: "速度" },
    maxHp: { baseValue: true, name: "生命" },
    maxMp: { baseValue: true, name: "法力" },
  },
  /** 强力词条池 */
  BONUS_AFFIX_POOL: {
    physicalAttack: { coefficient: 1.5, name: "强力物理攻击" },
    magicAttack: { coefficient: 1.5, name: "强力法术攻击" },
    defense: { coefficient: 1.5, name: "强力防御" },
    speed: { coefficient: 1.5, name: "强力速度" },
    maxHp: { coefficient: 1.5, name: "强力生命" },
    maxMp: { coefficient: 1.5, name: "强力法力" },
    critRate: {
      coefficient: 1.0,
      name: "暴击率",
      exclusiveTypes: ["weapon", "leftRing", "rightRing"],
    },
    comboRate: {
      coefficient: 1.0,
      name: "连击率",
      exclusiveTypes: ["weapon", "leftRing", "rightRing"],
    },
    maxComboCount: {
      coefficient: 1.0,
      name: "连击次数",
      exclusiveTypes: ["necklace", "jade"],
    },
    allStats: {
      coefficient: 1.0,
      name: "全属性强化",
      exclusiveTypes: ["chest", "legs", "shoes"],
    },
    debuffResist: {
      coefficient: 1.0,
      name: "障碍抗性",
      exclusiveTypes: ["jade", "necklace", "crown"],
      range: { min: 1, max: 30 }, // 取值范围：1~30
      description: "减少被障碍技能成功的概率（X/100）",
    },
    ignoreDebuffResist: {
      coefficient: 1.0,
      name: "忽视障碍异常",
      exclusiveTypes: ["weapon", "belt", "leftRing", "rightRing"],
      range: { min: 1, max: 30 }, // 取值范围：1~30
      description: "增加使用障碍技能成功的概率（X/100）",
    },
  },
};

/** 装备生成配置 */
export const EQUIPMENT_GEN_CONFIG = {
  /** 各类型装备的基础属性 */
  BASE_STATS_BY_TYPE: {
    weapon: { physicalAttack: 5, magicAttack: 3 },
    necklace: { maxMp: 10, magicAttack: 2 },
    crown: { maxHp: 15, defense: 2 },
    jade: { maxHp: 10, maxMp: 10 },
    chest: { defense: 5, maxHp: 20 },
    legs: { defense: 3, speed: 2 },
    shoes: { speed: 5, defense: 1 },
    leftRing: { critRate: 2, speed: 1 },
    rightRing: { critRate: 2, speed: 1 },
    belt: { maxHp: 10, defense: 2 },
  },
  /** 等级乘数 */
  LEVEL_MULTIPLIER: {
    physicalAttack: 2,
    magicAttack: 2,
    defense: 1.5,
    speed: 1,
    maxHp: 5,
    maxMp: 3,
    critRate: 0.5,
    comboRate: 0.5,
  },
  /** 词缀等级加成 */
  AFFIX_LEVEL_ADD: 5,
};

/** 装备名称配置 */
export const EQUIPMENT_NAME_CONFIG = {
  /** 前缀列表 */
  PREFIXES: [
    "破旧的",
    "普通的",
    "坚固的",
    "精良的",
    "卓越的",
    "史诗的",
    "传说的",
    "神话的",
    "古老的",
    "神秘的",
  ],
  /** 后缀列表（按装备类型） */
  SUFFIXES: {
    weapon: ["长剑", "短剑", "大剑", "匕首", "战斧", "法杖"],
    necklace: ["项链", "护符", "坠饰", "念珠"],
    crown: ["头冠", "头盔", "头环", "发冠"],
    jade: ["玉佩", "护符", "徽章", "印记"],
    chest: ["胸甲", "护胸", "战甲", "板甲"],
    legs: ["护腿", "腿甲", "战靴", "护胫"],
    shoes: ["战靴", "皮靴", "步履", "鞋子"],
    leftRing: ["戒指", "指环", "扳指", "指环"],
    rightRing: ["戒指", "指环", "扳指", "指环"],
    belt: ["腰带", "束带", "皮带", "腰封"],
  },
};

/**
 * 游戏总配置
 */
export const GAME_CONFIG = {
  // 暴击配置
  CRIT: {
    MAX_CRIT_RATE: 999999, // 最大暴击率(%)
    CRIT_MULTIPLIER: 1.5, // 暴击伤害倍率
  },
  // 连击配置
  COMBO: {
    MAX_COMBO_RATE: 999999, // 最大连击率(%)
    MAX_COMBO_COUNT: 999999, // 最大连击次数
    COMBO_PROB_DECAY: 0.9, // 下一次连击概率为当前连击概率的占比(%)
    COMBO_DAMAGE_DECAY: 0.8, // 下一次连击伤害为当前伤害的占比(%)
  },
  // 防御伤害减免配置
  BATTLE_AI: {
    DEFENSE_DAMAGE_REDUCTION: 0.5, // 防御伤害减免比例
  },
  // 战斗敌人数量配置
  BATTLE_ENEMIES: {
    MIN_COUNT: 1, // 最小敌人数量
    MAX_COUNT: 4, // 最大敌人数量
  },
  // 战斗奖励配置
  BATTLE_REWARD: {
    GOLD_BASE: 10, // 金币基础奖励
    GOLD_RANDOM: 20, // 金币随机奖励范围
    EQUIPMENT_DROP_CHANCE: 0.3, // 装备掉落概率
    ITEM_DROP_CHANCE: 0.2, // 道具掉落概率
    SKILL_DROP_CHANCE: 0.05, // 技能掉落概率
    PET_EXP_RATIO: 0.6, // 宠物获得经验比例
  },
  // 道具效果配置
  ITEMS: {
    HEAL_AMOUNT: 50, // 恢复道具基础恢复量
    MANA_AMOUNT: 30, // 法力道具基础恢复量
    PERCENT_HEAL: 0.3, // 百分比恢复生命
    PERCENT_MANA: 0.3, // 百分比恢复法力
    PERCENT_BOTH: 0.15, // 百分比恢复两者
  },
  // 道具售卖系数
  ITEM_SELL_RATIO: 0.5, // 道具售卖价格为购买价格的50%
  // 地图等级配置
  MAP: {
    DEFAULT_LEVEL: 1, // 地图默认等级
    ENEMY_LEVEL_MULTIPLIER: 1.3, // 每级敌人属性提升系数
    SUPPORT_SKILL_MIN_LEVEL: 6, // 敌人使用辅助技能最低地图等级
    DEBUFF_SKILL_MIN_LEVEL: 9, // 敌人使用障碍技能最低地图等级
  },
  // 装备等级偏移配置
  EQUIPMENT_LEVEL_OFFSET: {
    min: -2, // 最小偏移：玩家等级-2
    max: 5, // 最大偏移：玩家等级+5
  },
  // 商店配置
  SHOP: {
    // 装备出售配置
    SELL: {
      SELL_RATIO: 0.5, // 出售价格比例
      BASE_PRICES: {
        // 各类型装备的基础售价
        weapon: 10,
        necklace: 8,
        crown: 8,
        jade: 8,
        chest: 12,
        legs: 10,
        shoes: 6,
        leftRing: 6,
        rightRing: 6,
        belt: 6,
      },
    },
    // 装备购买配置
    EQUIPMENT_LEVEL: 1, // 商店装备等级
    EQUIPMENT_RARITY: 0, // 商店装备稀有度
    EQUIPMENT_PRICES: {
      // 各类型装备的购买价格
      weapon: 50,
      necklace: 40,
      crown: 40,
      jade: 40,
      chest: 60,
      legs: 50,
      shoes: 30,
      leftRing: 30,
      rightRing: 30,
      belt: 30,
    },
    PREFIX_COUNT: 3, // 商店装备名称前缀数量
    REFRESH_BASE_COST: 50, // 装备重铸基础费用
    // 装备重铸配置
    REFRESH: {
      BASE_COST: 50, // 基础重铸费用
      LEVEL_COST_MULTIPLIER: 1, // 等级费用乘数
    },
    // 单个词条重铸配置
    AFFIX_REFRESH: {
      BASE_AFFIX_COST: 30, // 基础词条重铸基础费用
      BONUS_AFFIX_COST: 60, // 强力词条重铸基础费用
      LEVEL_COST_MULTIPLIER: 0.5, // 等级费用乘数
    },
  },
};

/**
 * UI配置
 */
export const UI_CONFIG = {
  DECIMAL_PLACES: 2, // 小数位数
  HP_BAR_COLOR: "#4CAF50", // 生命条颜色
  MP_BAR_COLOR: "#2196F3", // 法力条颜色
  ENEMY_HP_BAR_COLOR: "#F44336", // 敌人生命条颜色
};

/**
 * 技能配置列表
 */
export const SKILLS_CONFIG = [
  {
    id: 1,
    name: "火球术", // 技能名称
    type: "magic", // 技能类型：magic=法术
    damage: 35, // 基础伤害
    cost: 20, // 法力消耗
    targetType: "single", // 目标类型：single=单体
    description: "消耗20法力，对单个敌人造成35点法术伤害",
  },
  {
    id: 2,
    name: "冰锥术",
    type: "magic",
    damage: 25,
    cost: 15,
    targetType: "all", // 目标类型：all=全体
    description: "消耗15法力，对所有敌人造成25点法术伤害",
  },
  {
    id: 3,
    name: "雷霆一击",
    type: "magic",
    damage: 50,
    cost: 35,
    targetType: "single",
    description: "消耗35法力，对单个敌人造成50点法术伤害",
  },
  {
    id: 4,
    name: "单体治疗术",
    type: "heal_single",
    cost: 25,
    healPercent: 0.15,
    manaPercent: 0.1,
    duration: 3,
    targetType: "single",
    description: "消耗25法力，对单个己方恢复15%生命和10%法力，持续3回合",
  },
  {
    id: 5,
    name: "群体治疗术",
    type: "heal_all",
    cost: 40,
    healPercent: 0.1,
    manaPercent: 0.08,
    duration: 3,
    targetType: "all",
    description: "消耗40法力，对己方所有人恢复10%生命和8%法力，持续3回合",
  },
  {
    id: 6,
    name: "单体强化术",
    type: "buff_attack_single",
    cost: 30,
    physicalMultiplier: 1.5,
    magicMultiplier: 1.2,
    duration: 3,
    targetType: "single",
    description:
      "消耗30法力，对单个己方增加1.5倍物理攻击和1.2倍法术攻击，持续3回合",
  },
  {
    id: 7,
    name: "群体强化术",
    type: "buff_attack_all",
    cost: 50,
    physicalMultiplier: 1.5,
    magicMultiplier: 1.2,
    duration: 3,
    targetType: "all",
    description:
      "消耗50法力，对己方所有人增加1.5倍物理攻击和1.2倍法术攻击，持续3回合",
  },
  {
    id: 8,
    name: "单体防御术",
    type: "buff_defense_single",
    cost: 25,
    defenseMultiplier: 1.5,
    duration: 3,
    targetType: "single",
    description: "消耗25法力，对单个己方增加1.5倍防御，持续3回合",
  },
  {
    id: 9,
    name: "群体防御术",
    type: "buff_defense_all",
    cost: 45,
    defenseMultiplier: 1.5,
    duration: 3,
    targetType: "all",
    description: "消耗45法力，对己方所有人增加1.5倍防御，持续3回合",
  },
  {
    id: 10,
    name: "单体敏捷术",
    type: "buff_speed_single",
    cost: 20,
    speedMultiplier: 1.5,
    duration: 3,
    targetType: "single",
    description: "消耗20法力，对单个己方增加1.5倍速度，持续3回合",
  },
  {
    id: 11,
    name: "群体敏捷术",
    type: "buff_speed_all",
    cost: 35,
    speedMultiplier: 1.5,
    duration: 3,
    targetType: "all",
    description: "消耗35法力，对己方所有人增加1.5倍速度，持续3回合",
  },
  {
    id: 12,
    name: "封印术",
    type: "debuff_seal_single",
    cost: 30,
    duration: 5,
    successRate: 0.3,
    targetType: "single",
    description:
      "消耗30法力，对单个敌人进行封印，30%概率成功，成功后敌人每回合跳过行动，持续2回合",
  },
  {
    id: 13,
    name: "群体封印术",
    type: "debuff_seal_all",
    cost: 50,
    duration: 5,
    successRate: 0.3,
    targetCount: 3,
    targetType: "all",
    description:
      "消耗50法力，对随机3个敌人进行封印，每个敌人30%概率成功，成功后每回合跳过行动，持续2回合",
  },
  {
    id: 14,
    name: "中毒术",
    type: "debuff_poison_single",
    cost: 25,
    duration: 5,
    successRate: 0.5,
    damagePercent: 0.08,
    manaDamagePercent: 0.05,
    targetType: "single",
    description:
      "消耗25法力，对单个敌人进行中毒，50%概率成功，成功后每回合受到8%生命和5%法力伤害，持续3回合",
  },
  {
    id: 15,
    name: "群体中毒术",
    type: "debuff_poison_all",
    cost: 45,
    duration: 5,
    successRate: 0.5,
    damagePercent: 0.08,
    manaDamagePercent: 0.05,
    targetCount: 3,
    targetType: "all",
    description:
      "消耗45法力，对随机3个敌人进行中毒，每个敌人50%概率成功，成功后每回合受到8%生命和5%法力伤害，持续3回合",
  },
  {
    id: 16,
    name: "冰冻术",
    type: "debuff_freeze_single",
    cost: 35,
    duration: 5,
    successRate: 0.7,
    targetType: "single",
    description:
      "消耗35法力，对单个敌人进行冰冻，70%概率成功，成功后敌人每回合跳过行动且免疫伤害，持续2回合",
  },
  {
    id: 17,
    name: "群体冰冻术",
    type: "debuff_freeze_all",
    cost: 60,
    duration: 5,
    successRate: 0.7,
    targetCount: 3,
    targetType: "all",
    description:
      "消耗60法力，对随机3个敌人进行冰冻，每个敌人70%概率成功，成功后每回合跳过行动且免疫伤害，持续2回合",
  },
  {
    id: 18,
    name: "混乱术",
    type: "debuff_confuse_single",
    cost: 30,
    duration: 5,
    successRate: 0.3,
    targetType: "single",
    description:
      "消耗30法力，对单个敌人进行混乱，30%概率成功，成功后敌人每回合随机攻击，不分敌我，持续2回合",
  },
  {
    id: 19,
    name: "群体混乱术",
    type: "debuff_confuse_all",
    cost: 50,
    duration: 5,
    successRate: 0.3,
    targetCount: 3,
    targetType: "all",
    description:
      "消耗50法力，对随机3个敌人进行混乱，每个敌人30%概率成功，成功后每回合随机攻击，不分敌我，持续2回合",
  },
];

/**
 * 敌人属性随机范围
 */
export const ENEMY_ATTRIBUTE_RANGES = {
  critRate: { min: 0, max: 30 }, // 暴击率范围：0~30%
  comboRate: { min: 0, max: 30 }, // 连击率范围：0~30%
  maxComboCount: { min: 1, max: 3 }, // 最大连击：1~3次
};

/**
 * 敌人配置列表
 * skills 数组中的值是技能ID
 * 技能ID对照：
 * 1-3: 法术攻击技能（无地图等级限制）
 * 4-11: 辅助技能（地图等级>=6才能使用）
 * 12-19: 障碍技能（地图等级>=9才能使用）
 */
export const ENEMIES_CONFIG = [
  {
    id: 1,
    name: "史莱姆", // 敌人名称
    hp: 50, // 当前生命
    maxHp: 50, // 最大生命
    physicalAttack: 8, // 物理攻击
    magicAttack: 3, // 法术攻击
    defense: 2, // 防御力
    speed: 5, // 速度
    exp: 20, // 击杀经验
    level: 1, // 等级
    attackType: "physical", // 攻击类型：physical=物理
    skills: [], // 技能列表：空=无技能
  },
  {
    id: 2,
    name: "哥布林",
    hp: 80,
    maxHp: 80,
    physicalAttack: 12,
    magicAttack: 5,
    defense: 5,
    speed: 8,
    exp: 35,
    level: 2,
    attackType: "physical",
    skills: [], // 无技能
  },
  {
    id: 3,
    name: "骷髅兵",
    hp: 120,
    maxHp: 120,
    physicalAttack: 15,
    magicAttack: 10,
    defense: 8,
    speed: 6,
    exp: 50,
    level: 3,
    attackType: "physical",
    skills: [1], // 技能ID 1=火球术
  },
  {
    id: 4,
    name: "暗影狼",
    hp: 150,
    maxHp: 150,
    physicalAttack: 20,
    magicAttack: 8,
    defense: 10,
    speed: 12,
    exp: 70,
    level: 4,
    attackType: "physical",
    skills: [1, 3], // 技能ID 1=火球术, 3=雷霆一击
  },
  {
    id: 5,
    name: "石像鬼",
    hp: 200,
    maxHp: 200,
    physicalAttack: 12,
    magicAttack: 20,
    defense: 15,
    speed: 7,
    exp: 100,
    level: 5,
    attackType: "magic", // 魔法攻击型敌人
    skills: [1, 2, 3], // 技能ID 1=火球术, 2=冰锥术, 3=雷霆一击
  },
  {
    id: 6,
    name: "暗影法师",
    hp: 180,
    maxHp: 180,
    physicalAttack: 10,
    magicAttack: 25,
    defense: 12,
    speed: 10,
    exp: 120,
    level: 6,
    attackType: "magic",
    skills: [1, 2, 3, 4, 5, 6, 7], // 6级敌人，可使用辅助技能
  },
  {
    id: 7,
    name: "暗影骑士",
    hp: 250,
    maxHp: 250,
    physicalAttack: 22,
    magicAttack: 15,
    defense: 18,
    speed: 9,
    exp: 150,
    level: 7,
    attackType: "physical",
    skills: [1, 3, 4, 6, 8, 10], // 7级敌人，可使用辅助技能
  },
  {
    id: 8,
    name: "巫妖王",
    hp: 300,
    maxHp: 300,
    physicalAttack: 15,
    magicAttack: 30,
    defense: 20,
    speed: 8,
    exp: 200,
    level: 8,
    attackType: "magic",
    skills: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // 8级敌人，可使用所有辅助技能
  },
  {
    id: 9,
    name: "冰霜巨龙",
    hp: 400,
    maxHp: 400,
    physicalAttack: 25,
    magicAttack: 35,
    defense: 25,
    speed: 12,
    exp: 300,
    level: 9,
    attackType: "magic",
    skills: [1, 2, 3, 16, 17], // 9级敌人，可使用冰冻术
  },
  {
    id: 10,
    name: "剧毒领主",
    hp: 350,
    maxHp: 350,
    physicalAttack: 20,
    magicAttack: 30,
    defense: 22,
    speed: 10,
    exp: 280,
    level: 9,
    attackType: "magic",
    skills: [1, 3, 14, 15], // 9级敌人，可使用中毒术
  },
  {
    id: 11,
    name: "混沌魔王",
    hp: 500,
    maxHp: 500,
    physicalAttack: 30,
    magicAttack: 35,
    defense: 30,
    speed: 15,
    exp: 500,
    level: 10,
    attackType: "magic",
    skills: [1, 2, 3, 12, 13, 14, 15, 16, 17, 18, 19], // 10级敌人，可使用所有障碍技能
  },
  {
    id: 12,
    name: "test耐打王", // 测试用BOSS
    hp: 999999999999999999999999999999999999999999999999,
    maxHp: 999999999999999999999999999999999999999999999999,
    physicalAttack: 1,
    magicAttack: 1,
    defense: 999999999999999999999999999999999999999999999999,
    speed: 999999999999999999999999999999999999999999999999,
    exp: 999999999999999999999999999999999999999999999999,
    level: 1,
    attackType: "physical",
    skills: [],
  },
];

/**
 * 道具配置列表
 */
export const ITEMS_CONFIG = [
  {
    id: 1,
    name: "小型生命药水",
    type: "heal",
    value: 50, // 固定恢复50点生命
    description: "恢复50点生命值",
    price: 20, // 购买价格
  },
  {
    id: 2,
    name: "中型生命药水",
    type: "heal",
    value: 100, // 固定恢复100点生命
    description: "恢复100点生命值",
    price: 40, // 购买价格
  },
  {
    id: 3,
    name: "小型法力药水",
    type: "mana",
    value: 30, // 固定恢复30点法力
    description: "恢复30点法力值",
    price: 20, // 购买价格
  },
  {
    id: 4,
    name: "中型法力药水",
    type: "mana",
    value: 60, // 固定恢复60点法力
    description: "恢复60点法力值",
    price: 40, // 购买价格
  },
  {
    id: 5,
    name: "生命回复药剂",
    type: "percentHeal",
    value: 0.3, // 恢复30%最大生命
    description: "恢复30%最大生命值",
    price: 60, // 购买价格
  },
  {
    id: 6,
    name: "法力回复药剂",
    type: "percentMana",
    value: 0.3, // 恢复30%最大法力
    description: "恢复30%最大法力值",
    price: 60, // 购买价格
  },
  {
    id: 7,
    name: "复合回复药剂",
    type: "percentBoth",
    value: 0.15, // 恢复15%生命和法力
    description: "恢复15%最大生命值和法力值",
    price: 80, // 购买价格
  },
];

/**
 * 玩家初始配置
 */
export const PLAYER_CONFIG = {
  NAME: "勇者", // 玩家初始名称
  INITIAL_LEVEL: 1, // 初始等级
  INITIAL_EXP: 0, // 初始经验
  INITIAL_EXP_TO_NEXT: 100, // 升级所需经验
  INITIAL_POINTS: {
    // 初始属性点
    maxHp: 1,
    physicalAttack: 1,
    magicAttack: 1,
    defense: 1,
    speed: 1,
  },
  INITIAL_FREE_POINTS: 5, // 初始自由属性点
  INITIAL_X: 400, // 初始X坐标
  INITIAL_Y: 300, // 初始Y坐标
  INITIAL_GOLD: 100, // 初始金币
  INITIAL_STATS: {
    // 初始战斗属性
    critRate: 5, // 暴击率5%
    comboRate: 0, // 连击率0%
    maxComboCount: 1, // 最大连击1次
  },
  INITIAL_SKILL_INDICES: [1], // 初始技能ID（火球术ID=1）
  INITIAL_ITEMS: [
    // 初始道具
    { id: 1, count: 3 }, // 3个生命药水
    { id: 3, count: 2 }, // 2个法力药水
  ],
};

/**
 * 宠物初始配置
 */
export const PET_CONFIG = {
  NAME: "小龙", // 宠物初始名称
  INITIAL_LEVEL: 1, // 初始等级
  INITIAL_EXP: 0, // 初始经验
  INITIAL_EXP_TO_NEXT: 100, // 危级所需经验
  INITIAL_POINTS: {
    // 初始属性点
    maxHp: 1,
    physicalAttack: 1,
    magicAttack: 1,
    defense: 1,
    speed: 1,
  },
  INITIAL_FREE_POINTS: 5, // 初始自由属性点
  INITIAL_STATS: {
    // 初始战斗属性
    critRate: 3, // 暴击率3%
    comboRate: 0, // 连击率0%
    maxComboCount: 1, // 最大连击1次
  },
  INITIAL_SKILL_INDICES: [1], // 初始技能ID（火球术ID=1）
};
