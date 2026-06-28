
export const CAMERA_EASING = 0.08


export const ENTITY_SIZE = 40



export const PLAYER_ATTRS = {
  maxHp: 100,
  speed: 3,
  size: ENTITY_SIZE,
  baseAttack: 10,
}


export const ENEMY_MELEE = {
  maxHp: 80,
  speed: 2.5,
  size: ENTITY_SIZE,
  attack: 15,
  attackRange: 50,
  skillRange: 0,
  skillCooldown: 800,
  color: '#ea580c',        
  color2: '#9a3412',       
  icon: '⚔️',
  name: '近战武士',
  expReward: 20,
  hasMelee: true,
  hasRanged: false,
}


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


export const ENEMY_HYBRID = {
  maxHp: 60,
  speed: 2,
  size: ENTITY_SIZE,
  attack: 12,
  attackRange: 45,
  skillRange: 200,
  skillCooldown: 1200,
  color: '#0891b2',        
  color2: '#0e7490',       
  icon: '🗡️',
  name: '战法师',
  expReward: 35,
  hasMelee: true,
  hasRanged: true,
}



export const ENEMY_BOMBER = {
  maxHp: 25,
  speed: 3.5,
  size: ENTITY_SIZE * 0.8,
  attack: 30,              
  attackRange: 0,
  skillRange: 0,
  skillCooldown: 0,
  color: '#f59e0b',        
  color2: '#d97706',
  icon: '💣',
  name: '自爆怪',
  expReward: 15,
  hasMelee: false,
  hasRanged: false,
  bomberRange: 55,         
}



export const ENEMY_SUMMONER = {
  maxHp: 50,
  speed: 1.5,
  size: ENTITY_SIZE * 1.1,
  attack: 0,
  attackRange: 0,
  skillRange: 300,          
  skillCooldown: 0,
  color: '#7e22ce',         
  color2: '#3b0764',       
  icon: '🧙',
  name: '召唤师',
  expReward: 40,
  hasMelee: false,
  hasRanged: false,
  summonCooldown: 4000,     
  summonCount: 2,           
  summonMinionHp: 30,       
  summonMinionAttack: 8,    
  summonMaxMinions: 6,      
  summonSacrificeDmg: 10,   
  summonSacrificeRadius: 50,
}



export const ENEMY_CHARGER = {
  maxHp: 70,
  speed: 2.2,
  size: ENTITY_SIZE * 1.2,
  attack: 25,               
  attackRange: 45,          
  skillRange: 0,
  skillCooldown: 0,
  color: '#991b1b',         
  color2: '#1a1a2e',       
  icon: '⚡',
  name: '冲锋者',
  expReward: 30,
  hasMelee: false,          
  hasRanged: false,
  chargeCooldown: 3000,     
  chargeSpeed: 12,          
  windUpDuration: 500,      
  chargeDuration: 400,      
  recoveryDuration: 800,    
}



export const ENEMY_SHIELDER = {
  maxHp: 90,
  speed: 1.8,
  size: ENTITY_SIZE * 1.15,
  attack: 10,               
  attackRange: 45,
  skillRange: 0,
  skillCooldown: 1000,
  color: '#06b6d4',         
  color2: '#0891b2',
  icon: '🛡️',
  name: '护盾兵',
  expReward: 35,
  hasMelee: true,           
  hasRanged: false,
  shieldAuraRange: 120,     
  shieldReduction: 0.4,     
}



export const ENEMY_ELITE_WIND = {
  maxHp: 60,
  hpGrowth: 8,              
  speed: 4.2,               
  size: ENTITY_SIZE,
  attack: 12,
  attackGrowth: 2,          
  attackRange: 50,
  skillRange: 0,
  skillCooldown: 800,
  color: '#06b6d4',         
  color2: '#0891b2',
  icon: '💨',
  name: '疾风武士',
  expRewardBase: 35,         
  eliteTier: 'normal',
  hasMelee: true,
  hasRanged: false,
}



export const ENEMY_ELITE_BLOOD = {
  maxHp: 180,
  hpGrowth: 20,             
  speed: 2.0,               
  size: ENTITY_SIZE * 1.5,  
  attack: 20,
  attackGrowth: 3,           
  attackRange: 55,
  skillRange: 0,
  skillCooldown: 800,
  color: '#991b1b',         
  color2: '#7f1d1d',
  icon: '🐂',
  name: '血牛武士',
  expRewardBase: 45,         
  eliteTier: 'normal',
  hasMelee: true,
  hasRanged: false,
}



export const ENEMY_ELITE_PRIEST = {
  maxHp: 70,
  hpGrowth: 10,              
  speed: 1.8,               
  size: ENTITY_SIZE * 1.1,   
  attack: 8,
  attackGrowth: 1.5,         
  attackRange: 45,
  skillRange: 200,
  skillCooldown: 2000,       
  color: '#7f1d1d',         
  color2: '#fca5a5',        
  icon: '⛪',
  name: '亡灵牧师',
  expRewardBase: 60,         
  eliteTier: 'rare',
  hasMelee: true,
  hasRanged: false,
  priestHealAmount: 8,      
  priestHealGrowth: 2,       
  priestHealInterval: 2000,  
  priestAuraRange: 130,      
}



export const ENEMY_ELITE_VENOM = {
  maxHp: 50,
  hpGrowth: 6,               
  speed: 2.5,                
  size: ENTITY_SIZE,
  attack: 10,                
  attackGrowth: 2,            
  attackRange: 0,
  skillRange: 300,
  skillCooldown: 3000,        
  color: '#166534',          
  color2: '#4ade80',         
  icon: '☠️',
  name: '毒液虫',
  expRewardBase: 55,          
  eliteTier: 'rare',
  hasMelee: false,
  hasRanged: false,
  venomWarnDuration: 800,    
  venomZoneDuration: 5000,   
  venomZoneDamage: 2,        
  venomZoneDamageGrowth: 0.5, 
  venomZoneRadius: 50,        
  venomBoltSpeed: 4,         
  venomMaxZones: 3,          
}


export function getEnemyTypeTable(playerLevel) {
  
  const base = [
    { type: 'melee',    attrs: ENEMY_MELEE,    weight: 4 },
    { type: 'ranged',   attrs: ENEMY_RANGED,   weight: 3 },
    { type: 'hybrid',   attrs: ENEMY_HYBRID,   weight: 2 },
    { type: 'bomber',   attrs: ENEMY_BOMBER,   weight: 2 },
    { type: 'summoner', attrs: ENEMY_SUMMONER, weight: 1 },
    { type: 'charger',  attrs: ENEMY_CHARGER,  weight: 2 },
    { type: 'shielder', attrs: ENEMY_SHIELDER, weight: 1 },
  ]
  
  if (!playerLevel || playerLevel <= 7) return base
  
  if (playerLevel <= 12) {
    return [
      ...base,
      { type: 'eliteWind',  attrs: ENEMY_ELITE_WIND,  weight: 2 },
      { type: 'eliteBlood', attrs: ENEMY_ELITE_BLOOD, weight: 2 },
    ]
  }
  
  return [
    ...base,
    { type: 'eliteWind',   attrs: ENEMY_ELITE_WIND,   weight: 2 },
    { type: 'eliteBlood',  attrs: ENEMY_ELITE_BLOOD,  weight: 2 },
    { type: 'elitePriest', attrs: ENEMY_ELITE_PRIEST, weight: 1 },
    { type: 'eliteVenom',  attrs: ENEMY_ELITE_VENOM,  weight: 1 },
  ]
}


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





export const calcSkillValue = (base, growthCfg, level) => {
  if (!growthCfg) return base

  
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
    
    const goingUp = useRatio ? growthCfg.ratio >= 1 : growthCfg.increment >= 0
    return goingUp
      ? Math.min(growthCfg.cap, value)
      : Math.max(growthCfg.cap, value)
  }
  return value
}


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


export const SKILL_ARROW = {
  id: 'arrow',
  name: '射箭',
  icon: '🏹',
  description: '朝鼠标方向射出箭矢，击中敌人造成伤害。升级增加穿透和分裂箭',
  cooldown: 300,
  damage: 10,
  range: 0,
  projectileSpeed: 8,
  duration: 0,
  lifestealPercent: 0,
  unlockLevel: 1,
  growth: {
    damage:          { ratio: 1.35, cap: null },      
    cooldown:        { ratio: 0.90, cap: 100 },       
    projectileSpeed: { ratio: 1.10, cap: 16 },        
    range:           { ratio: 1.00, cap: null },      
    penetration:     { increment: 1, cap: 2 },        
  },
  splitArrow: {
    unlockLevel: 4,   
    maxArrows: 1,     
  },
}


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
    damage:   { ratio: 1.40, cap: null },    
    cooldown: { ratio: 0.88, cap: 300 },     
    range:    { ratio: 1.12, cap: 180 },     
  },
}


export const SKILL_AUTO_SEEK = {
  id: 'autoSeek',
  name: '追踪弹幕',
  icon: '🔮',
  description: '自动向最近敌人发射追踪弹幕，每升一级额外增加1颗弹幕（最多5颗额外）',
  cooldown: 2000,
  damage: 15,
  range: 400,
  projectileSpeed: 6,
  extraProjectiles: 0,  
  duration: 0,
  lifestealPercent: 0,
  unlockLevel: 1,
  growth: {
    damage:          { ratio: 1.35, cap: null },      
    cooldown:        { ratio: 0.92, cap: 800 },       
    range:           { ratio: 1.08, cap: 360 },       
    projectileSpeed: { ratio: 1.15, cap: 5 },        
  },
}


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
    damage:   { ratio: 1.40, cap: null },    
    cooldown: { ratio: 0.90, cap: 1000 },    
    range:    { ratio: 1.10, cap: 340 },     
    duration: { ratio: 1.15, cap: 8000 },    
  },
}


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
    damage:          { ratio: 1.40, cap: null },      
    cooldown:        { ratio: 0.92, cap: 3000 },      
    range:           { ratio: 1.10, cap: 300 },       
    duration:        { ratio: 1.10, cap: 10000 },     
    lifestealPercent:{ ratio: 1.10, cap: 0.8 },       
  },
}


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
  
  maxHpBonusBase: 20,
  speedBonusBase: 0.3,
  attackBonusBase: 2,
  growth: {
    maxHpBonus:   { ratio: 1.15, cap: null },   
    speedBonus:   { ratio: 1.10, cap: 2 },      
    attackBonus:  { ratio: 1.12, cap: null },   
  },
}


export const SKILL_INVINCIBLE = {
  id: 'invincible',
  name: '无敌',
  icon: '🛡️',
  description: '短时间内免疫所有伤害，提升移速与伤害加成',
  cooldown: 20000,         
  damage: 0,               
  range: 0,
  projectileSpeed: 0,
  duration: 3000,          
  speedBoost: 0.1,         
  damageBoost: 0.1,        
  lifestealPercent: 0,
  unlockLevel: 1,
  growth: {
    cooldown:    { ratio: 0.92, cap: 9000 },   
    duration:    { ratio: 1.10, cap: 8000 },     
    speedBoost:  { ratio: 1.10, cap: 2.0 },      
    damageBoost: { ratio: 1.12, cap: null },      
  },
}


export const SKILL_MAGIC_CIRCLE = {
  id: 'magicCircle',
  name: '魔法阵火雨',
  icon: '🔥',
  description: '在鼠标位置召唤魔法阵，持续坠落火球并对范围内敌人造成灼烧伤害',
  cooldown: 10000,          
  damage: 12,               
  burnDamage: 5,            
  range: 70,                
  fireballCount: 3,         
  fireballRadius: 25,       
  duration: 4000,            
  projectileSpeed: 0,
  lifestealPercent: 0,
  unlockLevel: 2,
  
  growth: {
    damage:        { increment: 5, cap: null },     
    burnDamage:    { increment: 2, cap: null },     
    range:         { increment: 10, cap: 200 },     
    fireballCount: { increment: 1, cap: 8 },        
    duration:      { increment: 500, cap: 10000 },  
    cooldown:      { increment: -500, cap: 5000 },  
  },
}


export const SKILL_DASH = {
  id: 'dash',
  name: '冲刺',
  icon: '💨',
  description: '向移动方向快速冲刺，可躲避敌人攻击',
  cooldown: 8000,       
  damage: 0,
  range: 120,           
  projectileSpeed: 0,
  duration: 200,        
  lifestealPercent: 0,
  unlockLevel: 1,
  maxLevel: 12,         
  growth: {
    cooldown: { ratio: 0.86, cap: 1500 },   
    range:    { ratio: 1.088, cap: 300 },    
    duration: { ratio: 0.955, cap: 120 },   
  },
}


export const SKILL_TABLE = [
  SKILL_ARROW,
  SKILL_MELEE_ATTACK,
  SKILL_AUTO_SEEK,
  SKILL_FREEZE,
  SKILL_VAMPIRE_AURA,
  SKILL_BODY_STRENGTH,
  SKILL_INVINCIBLE,
  SKILL_MAGIC_CIRCLE,
  SKILL_DASH,
]


export const SKILL_KEY_MAP = {
  arrow:         1,
  meleeAttack:   2,
  autoSeek:      3,
  vampireAura:   4,
  freeze:       'E',
  invincible:   'Q',
  magicCircle:  'R',
  dash:        'Shift',
}



export const LOOT_TABLE = {
  healthPotion: {
    id: 'healthPotion',
    name: '生命药水',
    icon: '❤️',
    color: '#ef4444',
    hoverColor: '#fca5a5',
    size: 12,
    healAmount: 15,        
    dropChance: 0.05,      
    lifetime: 12000,       
    glowSpeed: 300,        
  },
  goldCoin: {
    id: 'goldCoin',
    name: '金币',
    icon: '🪙',
    color: '#fbbf24',
    hoverColor: '#fde68a',
    size: 10,
    goldAmount: 1,         
    dropChance: 0.10,      
    lifetime: 20000,       
    glowSpeed: 500,
  },
}



const EXP_LINEAR_STEP = 200          
const EXP_LV15_THRESHOLD = 13000     
const EXP_LV15_INCREMENT = 3000      


export function getExpThreshold(level) {
  if (level <= 1) return 0
  if (level <= 15) return EXP_LEVEL_TABLE[level - 1]

  const m = level - 15
  const total = EXP_LV15_THRESHOLD
    + m * EXP_LV15_INCREMENT
    + EXP_LINEAR_STEP * (m - 1) * m / 2
  return Math.floor(total)
}


export function getExpForNextLevel(level) {
  if (level < 15) {
    return getExpThreshold(level + 1) - getExpThreshold(level)
  }
  return EXP_LV15_INCREMENT + (level - 15) * EXP_LINEAR_STEP
}


export const EXP_LEVEL_TABLE = [
  0,     
  50,    
  120,   
  200,   
  320,   
  500,   
  750,   
  1100,  
  1600,  
  2300,  
  3200,  
  4500,  
  6500,  
  9000,  
  13000, 
]



export const SPAWN_INTERVAL_INITIAL = 1000

export const SPAWN_INTERVAL_MIN = 100

export const SPAWN_INTERVAL_DECREASE_PER_SEC = 20

export const SPAWN_MARGIN = 20

export const MAX_ENEMIES = 60

export const MAX_SUMMONS = 40



export const BATTLE_LOG_MAX_STORE = 200

export const BATTLE_LOG_MAX_DISPLAY = 20



export const ENEMY_HP_SCALE_RATE = 0.06

export const ENEMY_ATTACK_SCALE_RATE = 0.05


export function scaleEnemyStat(playerLevel, baseValue, scaleRate) {
  return Math.round(baseValue * (1 + (playerLevel - 1) * scaleRate))
}



export const ENEMY_PROJECTILE_SPEED = 5

export const ENEMY_PROJECTILE_DAMAGE = 8

export const ENEMY_PROJECTILE_SIZE = 8



export const SUMMONER_BOLT_SPEED = 3.5

export const SUMMONER_BOLT_DAMAGE = 6

export const SUMMONER_BOLT_SIZE = 7

export const SUMMONER_BOLT_COOLDOWN = 1300



export const ARROW_SIZE = 12



export const COLLISION_THRESHOLD = ENTITY_SIZE * 0.8



export const FRAME_INTERVAL = 100

export const FRAME_COUNT = 4


export const DIRECTION = {
  FRONT: 'front',
  LEFT:  'left',
  RIGHT: 'right',
}




export const EVENT_UNLOCK_LEVEL = 8


export const EVENT_SPAWN_INTERVAL = [30000, 60000]


export const EVENT_MAX_COUNT = 3


export const EVENT_TYPE_COOLDOWN = 60000


export const EVENT_TYPES = {
  ALTAR: {
    id: 'altar',
    name: '力量祭坛',
    icon: '🗿',
    color: '#f59e0b',         
    color2: '#d97706',         
    duration: 30000,           
    buffType: 'attackBoost',
    buffLabel: '攻击力 +50%',
    buffValue: 0.5,            
    buffDuration: 30000,       
    activateRange: 40,         
    cooldown: 60000,           
    blockOnDeathZone: true,
  },
  SHRINE: {
    id: 'shrine',
    name: '速度神龛',
    icon: '🔵',
    color: '#3b82f6',         
    color2: '#1d4ed8',
    duration: 20000,           
    buffType: 'speedShrine',
    buffLabel: '移速+40% 闪避20%',
    buffValue: { speedBoost: 0.4, dodgeChance: 0.2 },
    buffDuration: 20000,
    activateRange: 40,
    cooldown: 60000,
    blockOnDeathZone: true,
  },
  CHEST: {
    id: 'chest',
    name: '宝箱',
    icon: '📦',
    color: '#fbbf24',         
    color2: '#b45309',
    duration: 45000,           
    itemCountMin: 2,
    itemCountMax: 3,
    activateRange: 30,         
    cooldown: 60000,
    blockOnDeathZone: true,
  },
  CURSED_STELE: {
    id: 'cursedStele',
    name: '诅咒石碑',
    icon: '⚠️',
    color: '#7c3aed',         
    color2: '#5b21b6',
    duration: 30000,           
    enemyBuffRatio: 1.3,       
    dropRateMultiplier: 2.5,   
    effectDuration: 60000,     
    activateRange: 50,         
    promptRange: 50,
    cooldown: 60000,
    blockOnDeathZone: true,
  },
  DEATH_ZONE: {
    id: 'deathZone',
    name: '死亡区域',
    icon: '💀',
    color: '#991b1b',         
    color2: '#7f1d1d',
    duration: Infinity,         
    maxCount: 5,                
    damagePerSec: 3,            
    slowRatio: 0.3,             
    radius: 80,                 
    zoneRadius: 80,
    minPlayerDistance: 150,     
    cooldown: 60000,
    blockOnDeathZone: false,    
  },
}


export const CHEST_ITEM_TABLE = [
  { id: 'healthPotion',    name: '生命药水',   icon: '❤️', weight: 4, healAmount: 15 },
  { id: 'bigHealthPotion', name: '大生命药水', icon: '💖', weight: 2, healAmount: 40 },
  { id: 'expBook',         name: '经验书',     icon: '📖', weight: 3, expAmount: 200 },
  { id: 'skillScroll',     name: '技能卷轴',   icon: '📜', weight: 1, effect: 'upgradeRandomSkill' },
  { id: 'goldCoin',        name: '金币',       icon: '🪙', weight: 2, goldAmount: 1 },
  { id: 'goldPouch',       name: '金币袋',     icon: '💰', weight: 1, goldAmount: 5 },
]




export const BOSS_COOLDOWN = 180000


export const BOSS_FIRST_TRIGGER_TIME = 120000


export const BOSS_FIRST_EARLY_WARNING = 30000


export const BOSS_WARNING_DURATION = 2000


export const BOSS_SPAWN_PAUSE_DURATION = 5000


export const BOSS_SPAWN_ANIM_DURATION = 1500


export const BOSS_SPAWN_RATE_MULTIPLIER = 0.5


export const BOSS_DEATH_EFFECT_DURATION = 1200


export const BOSS_CLONE_REASSIGN_INTERVAL = 5000


export const BOSS_SLAM_RANGE = 150          
export const BOSS_SLAM_ANGLE = 120          
export const BOSS_SLAM_DAMAGE = 20          
export const BOSS_SLAM_COOLDOWN = 2000      
export const BOSS_SLAM_WARN_DURATION = 400  

export const BOSS_SHADOW_ORB_COUNT_PHASE1 = 3
export const BOSS_SHADOW_ORB_COUNT_PHASE2 = 5
export const BOSS_SHADOW_ORB_DAMAGE = 15
export const BOSS_SHADOW_ORB_SPEED = 2.5
export const BOSS_SHADOW_ORB_TRACK_STRENGTH = 0.3
export const BOSS_SHADOW_ORB_COOLDOWN = 3000
export const BOSS_SHADOW_ORB_SIZE = 10

export const BOSS_SHADOW_WAVE_DAMAGE = 10
export const BOSS_SHADOW_WAVE_INTERVAL = 3000
export const BOSS_SHADOW_WAVE_SPEED = 4
export const BOSS_SHADOW_WAVE_MAX_RADIUS = 300

export const BOSS_FIRE_PILLAR_DAMAGE = 30
export const BOSS_FIRE_PILLAR_INTERVAL = 2500
export const BOSS_FIRE_PILLAR_WARN = 800
export const BOSS_FIRE_PILLAR_RADIUS = 40
export const BOSS_FIRE_PILLAR_MAX = 4

export const BOSS_FIRE_BARRAGE_DAMAGE = 12
export const BOSS_FIRE_BARRAGE_INTERVAL = 4000
export const BOSS_FIRE_BARRAGE_SPEED = 4
export const BOSS_FIRE_BARRAGE_DIRECTIONS = 8
export const BOSS_FIRE_BARRAGE_RANGE = 600
export const BOSS_FIRE_BARRAGE_SIZE = 8

export const BOSS_VOID_TELEPORT_INTERVAL = 3000
export const BOSS_VOID_LINE_INTERVAL = 5000
export const BOSS_VOID_LINE_DAMAGE_PER_SEC = 25
export const BOSS_VOID_LINE_DURATION = 8000
export const BOSS_VOID_LINE_COUNT = 3

export const BOSS_VOID_SLOW_INTERVAL = 8000
export const BOSS_VOID_SLOW_RADIUS = 120
export const BOSS_VOID_SLOW_RATIO = 0.4
export const BOSS_VOID_SLOW_DURATION = 5000

export const BOSS_VOID_PROJECTILE_DAMAGE = 18
export const BOSS_VOID_PROJECTILE_SPEED = 3.5
export const BOSS_VOID_PROJECTILE_TRACK = 0.4
export const BOSS_VOID_PROJECTILE_INTERVAL = 2000
export const BOSS_VOID_PROJECTILE_SIZE = 10


export const BOSS_TABLE = [
  {
    id: 'shadowAmalgam',
    name: '暗影聚合体',
    unlockPlayerLevel: 3,
    hp: 300,
    hpPerLevel: 30,
    speed: 1.5,
    size: ENTITY_SIZE * 3,
    color: '#4b0082',
    color2: '#1a0033',
    xpReward: 200,
    phases: [
      { threshold: 1.0,  name: '阶段一', attacks: ['meleeSlam', 'shadowOrbs'] },
      { threshold: 0.6,  name: '阶段二', attacks: ['meleeSlam', 'shadowOrbs', 'clone'] },
      { threshold: 0.25, name: '阶段三', attacks: ['meleeSlam', 'shadowOrbs', 'clone', 'frenzy', 'shadowWave'] },
    ],
    dropTable: {
      guaranteed: [
        { id: 'skillScroll', count: 1 },
        { id: 'goldPouch', count: 1 },
      ],
      extra: [],
    },
  },
  {
    id: 'infernoCore',
    name: '火焰核心',
    unlockPlayerLevel: 8,
    hp: 600,
    hpPerLevel: 50,
    speed: 2.2,
    size: ENTITY_SIZE * 2.5,
    color: '#f97316',
    color2: '#ea580c',
    xpReward: 500,
    phases: [
      { threshold: 1.0, name: '', attacks: ['firePillar', 'fireBarrage'] },
    ],
    dropTable: {
      guaranteed: [
        { id: 'skillScroll', count: 2 },
        { id: 'goldPouch', count: 2 },
      ],
      extra: [],
    },
  },
  {
    id: 'voidWeaver',
    name: '虚空织法者',
    unlockPlayerLevel: 14,
    hp: 1000,
    hpPerLevel: 80,
    speed: 0,
    size: ENTITY_SIZE * 2,
    color: '#a855f7',
    color2: '#7c3aed',
    xpReward: 1000,
    phases: [
      { threshold: 1.0, name: '', attacks: ['teleport', 'voidLines', 'slowField', 'voidProjectile'] },
    ],
    dropTable: {
      guaranteed: [
        { id: 'skillScroll', count: 3 },
        { id: 'goldPouch', count: 3 },
      ],
      extra: [],
    },
  },
]


export function calcBossHP(bossConfig, playerLevel) {
  const extra = Math.max(0, playerLevel - bossConfig.unlockPlayerLevel)
  return bossConfig.hp + bossConfig.hpPerLevel * extra
}


export const CHEST_ITEM_RARITY = {
  healthPotion:     { name: '普通', color: '#22c55e' },
  bigHealthPotion:  { name: '稀有', color: '#3b82f6' },
  expBook:          { name: '普通', color: '#22c55e' },
  skillScroll:      { name: '稀有', color: '#a855f7' },
  goldCoin:         { name: '普通', color: '#22c55e' },
  goldPouch:        { name: '稀有', color: '#fbbf24' },
}
