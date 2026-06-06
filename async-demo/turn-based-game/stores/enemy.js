import {
  ENEMIES_CONFIG,
  ENEMY_ATTRIBUTE_RANGES,
  GAME_CONFIG,
} from "./constants.js";

export const generateEnemyRandomAttributes = () => {
  const { critRate, comboRate, maxComboCount } = ENEMY_ATTRIBUTE_RANGES;
  return {
    critRate:
      Math.floor(Math.random() * (critRate.max - critRate.min + 1)) +
      critRate.min,
    comboRate:
      Math.floor(Math.random() * (comboRate.max - comboRate.min + 1)) +
      comboRate.min,
    maxComboCount:
      Math.floor(
        Math.random() * (maxComboCount.max - maxComboCount.min + 1)
      ) + maxComboCount.min,
  };
};

const applyMapLevelBonus = (baseEnemy, mapLevel) => {
  if (!mapLevel || mapLevel <= 1) {
    return {
      hp: baseEnemy.hp,
      maxHp: baseEnemy.maxHp,
      physicalAttack: baseEnemy.physicalAttack,
      magicAttack: baseEnemy.magicAttack,
      defense: baseEnemy.defense,
      speed: baseEnemy.speed,
      exp: baseEnemy.exp,
    };
  }
  
  const multiplier = 1 + GAME_CONFIG.MAP.ENEMY_LEVEL_MULTIPLIER * (mapLevel - 1);
  
  return {
    hp: Math.floor(baseEnemy.hp * multiplier),
    maxHp: Math.floor(baseEnemy.maxHp * multiplier),
    physicalAttack: Math.floor(baseEnemy.physicalAttack * multiplier),
    magicAttack: Math.floor(baseEnemy.magicAttack * multiplier),
    defense: Math.floor(baseEnemy.defense * multiplier),
    speed: Math.floor(baseEnemy.speed * multiplier),
    exp: Math.floor(baseEnemy.exp * multiplier),
  };
};

/**
 * 根据地图等级获取可出现的敌人索引数组
 * @param {number} mapLevel - 当前地图等级
 * @returns {number[]} 可出现的敌人索引数组
 */
const getAvailableEnemyIndices = (mapLevel) => {
  // 不包含测试用的耐打王
  const allIndices = Array.from({ length: ENEMIES_CONFIG.length - 1 }, (_, i) => {
    console.log('allIndices-i', i);
    return i;
  });
  
  // 根据地图等级给不同等级敌人不同的权重
  // 地图等级越高，高级敌人越容易出现
  const weights = allIndices.map(index => {
    const enemy = ENEMIES_CONFIG[index];
    const enemyLevel = enemy.level;
    
    // 敌人等级与地图等级的差距
    const levelDiff = Math.abs(enemyLevel - mapLevel);
    
    // 计算权重：敌人等级越接近地图等级，权重越高
    let weight;
    if (levelDiff <= 1) {
      weight = 5; // 完全匹配或差1级，权重最高
    } else if (levelDiff <= 3) {
      weight = 3; // 差2-3级，权重中等
    } else {
      weight = 1; // 差4级以上，权重最低但仍有机会出现
    }
    
    return weight;
  });
  
  // 使用权重数组生成新的索引数组，让高权重的索引更容易被选中
  const weightedIndices = [];
  allIndices.forEach((index, i) => {
    for (let w = 0; w < weights[i]; w++) {
      weightedIndices.push(index);
    }
  });
  
  return weightedIndices;
};

/**
 * 随机生成一个敌人索引，考虑地图等级
 * @param {number} mapLevel - 当前地图等级
 * @returns {number} 敌人索引
 */
const getRandomEnemyIndex = (mapLevel) => {
  const weightedIndices = getAvailableEnemyIndices(mapLevel);
  return weightedIndices[Math.floor(Math.random() * weightedIndices.length)];
};

export const generateBattleEnemies = (playerLevel, mapLevel = 1) => {
  const { MIN_COUNT, MAX_COUNT } = GAME_CONFIG.BATTLE_ENEMIES;
  const enemyCount = Math.floor(Math.random() * (MAX_COUNT - MIN_COUNT + 1)) + MIN_COUNT;
  
  const enemies = [];
  for (let i = 0; i < enemyCount; i++) {
    const randomEnemyIndex = getRandomEnemyIndex(mapLevel);
    const baseEnemy = ENEMIES_CONFIG[randomEnemyIndex];
    const enemyAttrs = generateEnemyRandomAttributes();
    const levelBonus = applyMapLevelBonus(baseEnemy, mapLevel);
    
    enemies.push({
      ...baseEnemy,
      ...levelBonus,
      id: `battle_enemy_${Date.now()}_${i}`,
      battleIndex: i,
      maxMp: levelBonus.maxMp || 0, // 敌人默认没有法力上限，设为0
      mp: levelBonus.mp || 0, // 敌人默认没有法力，设为0
      buffs: [], // 初始化空的buff数组
      ...enemyAttrs,
    });
  }
  
  return enemies;
};

/**
 * 生成指定数量的额外战斗敌人（用于点击敌人进入战斗时）
 * @param {number} count - 额外敌人数量
 * @param {number} mapLevel - 地图等级
 * @returns {Array} 额外敌人数组
 */
export const generateExtraBattleEnemies = (count, mapLevel) => {
  const enemies = [];
  for (let i = 0; i < count; i++) {
    const randomEnemyIndex = getRandomEnemyIndex(mapLevel);
    const baseEnemy = ENEMIES_CONFIG[randomEnemyIndex];
    const enemyAttrs = generateEnemyRandomAttributes();
    const levelBonus = applyMapLevelBonus(baseEnemy, mapLevel);
    
    enemies.push({
      ...baseEnemy,
      ...levelBonus,
      id: `battle_enemy_${Date.now()}_extra_${i}`,
      battleIndex: i + 1, // 从1开始，因为0是被点击的敌人
      maxMp: levelBonus.maxMp || 0,
      mp: levelBonus.mp || 0,
      buffs: [],
      ...enemyAttrs,
    });
  }
  return enemies;
};

export const generateMapEnemies = (mapLevel = 1) => {
  // 固定生成5个敌人，但每个敌人都是随机的
  const enemyPositions = [
    { x: 200, y: 200 },
    { x: 600, y: 150 },
    { x: 150, y: 400 },
    { x: 500, y: 450 },
    { x: 300, y: 500 },
  ];
  
  return enemyPositions.map((pos, index) => {
    const randomEnemyIndex = getRandomEnemyIndex(mapLevel);
    const baseEnemy = ENEMIES_CONFIG[randomEnemyIndex];
    const enemyAttrs = generateEnemyRandomAttributes();
    const levelBonus = applyMapLevelBonus(baseEnemy, mapLevel);
    
    return {
      ...baseEnemy,
      ...levelBonus,
      x: pos.x,
      y: pos.y,
      id: `enemy_${index + 1}`,
      maxMp: levelBonus.maxMp || 0, // 敌人默认没有法力上限，设为0
      mp: levelBonus.mp || 0, // 敌人默认没有法力，设为0
      buffs: [], // 初始化空的buff数组
      ...enemyAttrs,
    };
  });
};

export const removeEnemyFromMap = (gameState) => {
  if (gameState.defeatedEnemyId) {
    // 处理数组形式的 defeatedEnemyId（多个敌人）
    const idsToRemove = Array.isArray(gameState.defeatedEnemyId)
      ? gameState.defeatedEnemyId
      : [gameState.defeatedEnemyId];
    
    idsToRemove.forEach((id) => {
      const index = gameState.mapEnemies.findIndex((e) => e.id === id);
      if (index !== -1) {
        gameState.mapEnemies.splice(index, 1);
      }
    });
  }
};

/**
 * 将地图上的敌人转换为战斗敌人
 * @param {Object} mapEnemy - 地图上的敌人对象
 * @param {number} battleIndex - 战斗中的索引
 * @returns {Object} 战斗敌人对象
 */
export const convertMapEnemyToBattleEnemy = (mapEnemy, battleIndex = 0) => {
  return {
    ...mapEnemy,
    id: `battle_enemy_${Date.now()}_${battleIndex}`,
    originalId: mapEnemy.id,  // 保存原始敌人ID，用于战斗结束后移除地图敌人
    battleIndex: battleIndex,
    maxMp: mapEnemy.maxMp || 0,
    mp: mapEnemy.mp || 0,
    buffs: mapEnemy.buffs || [],
  };
};

export const refreshMapEnemies = (gameState, playerLevel, mapLevel = 1) => {
  const mapConfig = GAME_CONFIG.MAP;
  if (gameState.mapEnemies.length < mapConfig.MIN_ENEMIES) {
    const refreshCount = mapConfig.MIN_ENEMIES - gameState.mapEnemies.length;
    const xRange =
      mapConfig.ENEMY_X_RANGE.max - mapConfig.ENEMY_X_RANGE.min;
    const yRange =
      mapConfig.ENEMY_Y_RANGE.max - mapConfig.ENEMY_Y_RANGE.min;

    for (let i = 0; i < refreshCount; i++) {
      const randomEnemyIndex = getRandomEnemyIndex(mapLevel);
      const randomEnemy = ENEMIES_CONFIG[randomEnemyIndex];
      const enemyAttrs = generateEnemyRandomAttributes();
      const levelBonus = applyMapLevelBonus(randomEnemy, mapLevel);
      gameState.mapEnemies.push({
        ...randomEnemy,
        ...levelBonus,
        id: `enemy_${Date.now()}_${i}`,
        x: mapConfig.ENEMY_X_RANGE.min + Math.random() * xRange,
        y: mapConfig.ENEMY_Y_RANGE.min + Math.random() * yRange,
        maxMp: levelBonus.maxMp || 0, // 敌人默认没有法力上限，设为0
        mp: levelBonus.mp || 0, // 敌人默认没有法力，设为0
        buffs: [], // 初始化空的buff数组
        ...enemyAttrs,
      });
    }
  }
};
