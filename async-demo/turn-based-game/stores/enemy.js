import {
  ENEMIES_CONFIG,
  ENEMY_ATTRIBUTE_RANGES,
  GAME_CONFIG,
  BOSSES_CONFIG,
  BOSS_CONFIG,
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

const applyBossLevelBonus = (baseBoss, mapLevel) => {
  if (!mapLevel || mapLevel <= 1) {
    return {
      hp: baseBoss.hp,
      maxHp: baseBoss.maxHp,
      physicalAttack: baseBoss.physicalAttack,
      magicAttack: baseBoss.magicAttack,
      defense: baseBoss.defense,
      speed: baseBoss.speed,
      exp: baseBoss.exp,
    };
  }
  
  const multiplier = 1 + BOSS_CONFIG.LEVEL_MULTIPLIER * (mapLevel - 1);
  
  return {
    hp: Math.floor(baseBoss.hp * multiplier),
    maxHp: Math.floor(baseBoss.maxHp * multiplier),
    physicalAttack: Math.floor(baseBoss.physicalAttack * multiplier),
    magicAttack: Math.floor(baseBoss.magicAttack * multiplier),
    defense: Math.floor(baseBoss.defense * multiplier),
    speed: Math.floor(baseBoss.speed * multiplier),
    exp: Math.floor(baseBoss.exp * multiplier),
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

export const generateMapEnemies = (mapLevel = 1, playerX = null, playerY = null, existingBosses = []) => {
  const mapConfig = GAME_CONFIG.MAP;
  // 随机生成 MIN_ENEMIES 到 MAX_ENEMIES 之间的敌人数量
  const enemyCount = Math.floor(Math.random() * (mapConfig.MAX_ENEMIES - mapConfig.MIN_ENEMIES + 1)) + mapConfig.MIN_ENEMIES;
  
  const xRange = mapConfig.ENEMY_X_RANGE.max - mapConfig.ENEMY_X_RANGE.min;
  const yRange = mapConfig.ENEMY_Y_RANGE.max - mapConfig.ENEMY_Y_RANGE.min;
  
  const enemies = [];
  for (let i = 0; i < enemyCount; i++) {
    const randomEnemyIndex = getRandomEnemyIndex(mapLevel);
    const baseEnemy = ENEMIES_CONFIG[randomEnemyIndex];
    const enemyAttrs = generateEnemyRandomAttributes();
    const levelBonus = applyMapLevelBonus(baseEnemy, mapLevel);
    
    // 生成敌人位置，确保与玩家、其他敌人和BOSS保持安全距离
    let enemyX, enemyY;
    let attempts = 0;
    const maxAttempts = 100; // 最大尝试次数，避免死循环
    do {
      enemyX = mapConfig.ENEMY_X_RANGE.min + Math.random() * xRange;
      enemyY = mapConfig.ENEMY_Y_RANGE.min + Math.random() * yRange;
      attempts++;
    } while (
      (playerX !== null && playerY !== null && isTooClose(enemyX, enemyY, playerX, playerY, mapConfig.ENEMY_SAFE_DISTANCE) 
      || isOverlapping(enemyX, enemyY, enemies, existingBosses, mapConfig.ENEMY_SAFE_DISTANCE)) 
      && attempts < maxAttempts
    );
    
    enemies.push({
      ...baseEnemy,
      ...levelBonus,
      x: enemyX,
      y: enemyY,
      id: `enemy_${Date.now()}_${i}`,
      maxMp: levelBonus.maxMp || 0,
      mp: levelBonus.mp || 0,
      buffs: [],
      ...enemyAttrs,
    });
  }
  
  return enemies;
};

// 检查敌人位置是否离玩家太近
const isTooClose = (x1, y1, x2, y2, distance) => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy) < distance;
};

// 检查位置是否与其他角色重叠
const isOverlapping = (x, y, existingEnemies, existingBosses, safeDistance) => {
  // 检查与普通敌人的距离
  for (const enemy of existingEnemies) {
    if (isTooClose(x, y, enemy.x, enemy.y, safeDistance)) {
      return true;
    }
  }
  // 检查与BOSS的距离
  for (const boss of existingBosses) {
    if (isTooClose(x, y, boss.x, boss.y, safeDistance)) {
      return true;
    }
  }
  return false;
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

export const refreshMapEnemies = (gameState) => {
  const mapConfig = GAME_CONFIG.MAP;
  if (gameState.mapEnemies.length < mapConfig.MAX_ENEMIES) {
    // 随机补充敌人，补充到 MIN_ENEMIES 到 MAX_ENEMIES 之间的随机数量
    const targetCount = Math.floor(Math.random() * (mapConfig.MAX_ENEMIES - mapConfig.MIN_ENEMIES + 1)) + mapConfig.MIN_ENEMIES;
    const refreshCount = Math.min(targetCount, mapConfig.MAX_ENEMIES) - gameState.mapEnemies.length;
    
    if (refreshCount <= 0) return;
    
    const xRange = mapConfig.ENEMY_X_RANGE.max - mapConfig.ENEMY_X_RANGE.min;
    const yRange = mapConfig.ENEMY_Y_RANGE.max - mapConfig.ENEMY_Y_RANGE.min;

    for (let i = 0; i < refreshCount; i++) {
      const randomEnemyIndex = getRandomEnemyIndex(gameState.mapLevel || 1);
      const randomEnemy = ENEMIES_CONFIG[randomEnemyIndex];
      const enemyAttrs = generateEnemyRandomAttributes();
      const levelBonus = applyMapLevelBonus(randomEnemy, gameState.mapLevel || 1);
      
      // 生成敌人位置，确保与玩家、其他敌人和BOSS保持安全距离
      let enemyX, enemyY;
      let attempts = 0;
      const maxAttempts = 100; // 最大尝试次数，避免死循环
      do {
        enemyX = mapConfig.ENEMY_X_RANGE.min + Math.random() * xRange;
        enemyY = mapConfig.ENEMY_Y_RANGE.min + Math.random() * yRange;
        attempts++;
      } while (
        (gameState.player.x !== null 
        && gameState.player.y !== null 
        && isTooClose(enemyX, enemyY, gameState.player.x, gameState.player.y, mapConfig.ENEMY_SAFE_DISTANCE)
        || isOverlapping(enemyX, enemyY, gameState.mapEnemies, gameState.mapBosses || [], mapConfig.ENEMY_SAFE_DISTANCE))
        && attempts < maxAttempts
      );
      
      gameState.mapEnemies.push({
        ...randomEnemy,
        ...levelBonus,
        id: `enemy_${Date.now()}_${i}`,
        x: enemyX,
        y: enemyY,
        maxMp: levelBonus.maxMp || 0,
        mp: levelBonus.mp || 0,
        buffs: [],
        ...enemyAttrs,
      });
    }
  }
};

/**
 * 生成地图BOSS
 * @param {number} mapLevel - 地图等级
 * @param {number} playerX - 玩家X坐标
 * @param {number} playerY - 玩家Y坐标
 * @param {Array} existingEnemies - 已存在的敌人
 * @returns {Array} BOSS数组
 */
export const generateMapBosses = (mapLevel = 1, playerX = null, playerY = null, existingEnemies = []) => {
  const bossCount = BOSS_CONFIG.COUNT;
  const mapConfig = GAME_CONFIG.MAP;
  
  const xRange = mapConfig.ENEMY_X_RANGE.max - mapConfig.ENEMY_X_RANGE.min;
  const yRange = mapConfig.ENEMY_Y_RANGE.max - mapConfig.ENEMY_Y_RANGE.min;
  
  const bosses = [];
  for (let i = 0; i < bossCount; i++) {
    const randomBossIndex = Math.floor(Math.random() * BOSSES_CONFIG.length);
    const baseBoss = BOSSES_CONFIG[randomBossIndex];
    const enemyAttrs = generateEnemyRandomAttributes();
    const levelBonus = applyBossLevelBonus(baseBoss, mapLevel);
    
    // 生成BOSS位置，确保与玩家、其他BOSS和敌人保持安全距离
    let bossX, bossY;
    let attempts = 0;
    const maxAttempts = 100; // 最大尝试次数，避免死循环
    do {
      bossX = mapConfig.ENEMY_X_RANGE.min + Math.random() * xRange;
      bossY = mapConfig.ENEMY_Y_RANGE.min + Math.random() * yRange;
      attempts++;
    } while (
      (playerX !== null && playerY !== null && isTooClose(bossX, bossY, playerX, playerY, mapConfig.ENEMY_SAFE_DISTANCE) 
      || isOverlapping(bossX, bossY, existingEnemies, bosses, mapConfig.ENEMY_SAFE_DISTANCE)) 
      && attempts < maxAttempts
    );
    
    bosses.push({
      ...baseBoss,
      ...levelBonus,
      x: bossX,
      y: bossY,
      id: `boss_${Date.now()}_${i}`,
      maxMp: levelBonus.maxMp || 0,
      mp: levelBonus.mp || 0,
      buffs: [],
      ...enemyAttrs,
      isBoss: true, // 标记为BOSS
    });
  }
  
  return bosses;
};

/**
 * 从地图移除BOSS
 * @param {Object} gameState - 游戏状态
 */
export const removeBossFromMap = (gameState) => {
  if (gameState.defeatedEnemyId) {
    // 处理数组形式的 defeatedEnemyId（多个敌人）
    const idsToRemove = Array.isArray(gameState.defeatedEnemyId)
      ? gameState.defeatedEnemyId
      : [gameState.defeatedEnemyId];
    
    idsToRemove.forEach((id) => {
      const index = gameState.mapBosses.findIndex((b) => b.id === id);
      if (index !== -1) {
        gameState.mapBosses.splice(index, 1);
      }
    });
  }
};

/**
 * 刷新地图BOSS
 * @param {Object} gameState - 游戏状态
 */
export const refreshMapBosses = (gameState) => {
  if (gameState.mapBosses.length < BOSS_CONFIG.COUNT) {
    const refreshCount = BOSS_CONFIG.COUNT - gameState.mapBosses.length;
    
    const mapConfig = GAME_CONFIG.MAP;
    const xRange = mapConfig.ENEMY_X_RANGE.max - mapConfig.ENEMY_X_RANGE.min;
    const yRange = mapConfig.ENEMY_Y_RANGE.max - mapConfig.ENEMY_Y_RANGE.min;

    for (let i = 0; i < refreshCount; i++) {
      const randomBossIndex = Math.floor(Math.random() * BOSSES_CONFIG.length);
      const randomBoss = BOSSES_CONFIG[randomBossIndex];
      const enemyAttrs = generateEnemyRandomAttributes();
      const levelBonus = applyBossLevelBonus(randomBoss, gameState.mapLevel || 1);
      
      // 生成BOSS位置，确保与玩家、其他BOSS和敌人保持安全距离
      let bossX, bossY;
      let attempts = 0;
      const maxAttempts = 100; // 最大尝试次数，避免死循环
      do {
        bossX = mapConfig.ENEMY_X_RANGE.min + Math.random() * xRange;
        bossY = mapConfig.ENEMY_Y_RANGE.min + Math.random() * yRange;
        attempts++;
      } while (
        (gameState.player.x !== null 
        && gameState.player.y !== null 
        && isTooClose(bossX, bossY, gameState.player.x, gameState.player.y, mapConfig.ENEMY_SAFE_DISTANCE)
        || isOverlapping(bossX, bossY, gameState.mapEnemies, gameState.mapBosses, mapConfig.ENEMY_SAFE_DISTANCE))
        && attempts < maxAttempts
      );
      
      gameState.mapBosses.push({
        ...randomBoss,
        ...levelBonus,
        id: `boss_${Date.now()}_${i}`,
        x: bossX,
        y: bossY,
        maxMp: levelBonus.maxMp || 0,
        mp: levelBonus.mp || 0,
        buffs: [],
        ...enemyAttrs,
        isBoss: true, // 标记为BOSS
      });
    }
  }
};
