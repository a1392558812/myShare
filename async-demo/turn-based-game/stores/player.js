import {
  STAT_CONFIG,
  PLAYER_CONFIG,
  PET_CONFIG,
  GAME_CONFIG,
  SKILLS_CONFIG,
  ITEMS_CONFIG,
} from "./constants.js";

const STAT_POINT_COEFFICIENTS = STAT_CONFIG.POINT_COEFFICIENTS;
const PET_STAT_POINT_COEFFICIENTS = STAT_CONFIG.PET_POINT_COEFFICIENTS;
const BASE_STATS = STAT_CONFIG.BASE_VALUES;

export const calculatePlayerStats = (player) => {
  const stats = {
    physicalAttack: 0,
    magicAttack: 0,
    defense: 0,
    speed: 0,
    maxHp: 0,
    maxMp: 0,
    critRate: 0,
    comboRate: 0,
    maxComboCount: 1,
    debuffResist: 0, // 障碍抗性
    ignoreDebuffResist: 0, // 忽视障碍异常
  };

  for (const stat in BASE_STATS) {
    stats[stat] = BASE_STATS[stat];
  }

  if (player.critRate !== undefined) {
    stats.critRate += player.critRate - BASE_STATS.critRate;
  }
  if (player.comboRate !== undefined) {
    stats.comboRate += player.comboRate - BASE_STATS.comboRate;
  }
  if (player.maxComboCount !== undefined) {
    stats.maxComboCount += player.maxComboCount - BASE_STATS.maxComboCount;
  }

  const pointStats = [
    "physicalAttack",
    "magicAttack",
    "defense",
    "speed",
    "maxHp",
  ];
  for (const stat of pointStats) {
    const points = player[`${stat}Points`] || 0;
    const coefficient = STAT_POINT_COEFFICIENTS[stat] || 1;
    stats[stat] += points * coefficient;
  }

  const magicPoints = player.magicAttackPoints || 0;
  stats.maxMp += magicPoints * STAT_POINT_COEFFICIENTS.maxMp;

  for (const slot in player.equipment) {
    const equip = player.equipment[slot];
    if (equip) {
      if (equip.baseStats) {
        for (const stat of pointStats) {
          const basePoints = equip.baseStats[stat] || 0;
          const coefficient = STAT_POINT_COEFFICIENTS[stat] || 1;
          stats[stat] += basePoints * coefficient;
        }
        const equipMagicPoints = equip.baseStats.magicAttack || 0;
        stats.maxMp += equipMagicPoints * STAT_POINT_COEFFICIENTS.maxMp;
      }

      if (equip.baseAffixes) {
        for (const stat of pointStats) {
          const affixPoints = equip.baseAffixes[stat] || 0;
          const coefficient = STAT_POINT_COEFFICIENTS[stat] || 1;
          stats[stat] += affixPoints * coefficient;
        }
        const affixMagicPoints = equip.baseAffixes.magicAttack || 0;
        stats.maxMp += affixMagicPoints * STAT_POINT_COEFFICIENTS.maxMp;
      }

      if (equip.bonusAffixes) {
        for (const stat in equip.bonusAffixes) {
          const bonusValue = equip.bonusAffixes[stat] || 0;

          if (stat === "allStats" && equip.level) {
            const allStatsValue = bonusValue;
            stats.physicalAttack += allStatsValue;
            stats.magicAttack += allStatsValue;
            stats.defense += allStatsValue;
            stats.speed += allStatsValue;
            stats.maxHp += allStatsValue;
            stats.maxMp += allStatsValue;

            const critBonus = Math.max(
              1,
              Math.floor((allStatsValue / equip.level) * 30),
            );
            stats.critRate += critBonus;

            const comboBonus = Math.max(
              1,
              Math.floor((allStatsValue / equip.level) * 30),
            );
            stats.comboRate += comboBonus;

            const maxComboBonus = Math.max(
              1,
              Math.floor((allStatsValue / equip.level) * 10),
            );
            stats.maxComboCount += maxComboBonus;
          } else if (stats[stat] !== undefined) {
            stats[stat] += bonusValue;
          } else {
            stats[stat] = bonusValue;
          }
        }
      }
    }
  }

  // 应用临时属性覆盖
  if (player.tempPhysicalAttack !== undefined && player.tempPhysicalAttack > 0) {
    stats.physicalAttack = player.tempPhysicalAttack;
  }
  if (player.tempMagicAttack !== undefined && player.tempMagicAttack > 0) {
    stats.magicAttack = player.tempMagicAttack;
  }
  if (player.tempDefense !== undefined && player.tempDefense > 0) {
    stats.defense = player.tempDefense;
  }
  if (player.tempSpeed !== undefined && player.tempSpeed > 0) {
    stats.speed = player.tempSpeed;
  }

  return stats;
};

export const initialPlayer = {
  name: PLAYER_CONFIG.NAME,
  level: PLAYER_CONFIG.INITIAL_LEVEL,
  exp: PLAYER_CONFIG.INITIAL_EXP,
  expToNext: PLAYER_CONFIG.INITIAL_EXP_TO_NEXT,
  hp: 0,
  maxHp: PLAYER_CONFIG.INITIAL_POINTS.maxHp,
  maxHpPoints: PLAYER_CONFIG.INITIAL_POINTS.maxHp,
  mp: 0,
  maxMp: 0,
  physicalAttackPoints: PLAYER_CONFIG.INITIAL_POINTS.physicalAttack,
  magicAttackPoints: PLAYER_CONFIG.INITIAL_POINTS.magicAttack,
  defensePoints: PLAYER_CONFIG.INITIAL_POINTS.defense,
  speedPoints: PLAYER_CONFIG.INITIAL_POINTS.speed,
  freePoints: PLAYER_CONFIG.INITIAL_FREE_POINTS,
  x: PLAYER_CONFIG.INITIAL_X,
  y: PLAYER_CONFIG.INITIAL_Y,
  gold: PLAYER_CONFIG.INITIAL_GOLD,
  skills: [],
  inventory: [],
  equipment: {},
  equipmentBag: [],
  critRate: PLAYER_CONFIG.INITIAL_STATS.critRate,
  comboRate: PLAYER_CONFIG.INITIAL_STATS.comboRate,
  maxComboCount: PLAYER_CONFIG.INITIAL_STATS.maxComboCount,
};

export const createPlayer = () => {
  const player = { ...initialPlayer };
  const calculatedStats = calculatePlayerStats(player);
  player.maxHp = calculatedStats.maxHp;
  player.maxMp = calculatedStats.maxMp;
  player.hp = player.maxHp;
  player.mp = player.maxMp;
  player.skills = PLAYER_CONFIG.INITIAL_SKILL_INDICES.map(
    (id) => SKILLS_CONFIG.find((s) => s.id === id),
  ).filter(Boolean);
  player.inventory = PLAYER_CONFIG.INITIAL_ITEMS.map(({ id, count }) => ({
    ...ITEMS_CONFIG.find((item) => item.id === id),
    count,
  })).filter(item => item.id);
  return player;
};

export const loadPlayerData = (savedPlayerData) => {
  let player;

  if (savedPlayerData) {
    if (savedPlayerData.physicalAttackPoints !== undefined) {
      player = {
        ...initialPlayer,
        ...savedPlayerData,
        equipmentBag: savedPlayerData.equipmentBag || [],
      };
      
      // 恢复技能
      if (savedPlayerData.skills && savedPlayerData.skills.length > 0) {
        // 从保存的技能 ID 或完整对象中恢复技能
        player.skills = savedPlayerData.skills.map(savedSkill => {
          if (savedSkill.id) {
            const skill = SKILLS_CONFIG.find(s => s.id === savedSkill.id);
            return skill || savedSkill;
          }
          return savedSkill;
        });
      } else {
        // 使用初始技能
        player.skills = PLAYER_CONFIG.INITIAL_SKILL_INDICES.map(
          (id) => SKILLS_CONFIG.find((s) => s.id === id),
        ).filter(Boolean);
      }
      
      // 恢复背包
      if (savedPlayerData.inventory && savedPlayerData.inventory.length > 0) {
        player.inventory = savedPlayerData.inventory;
      } else {
        player.inventory = PLAYER_CONFIG.INITIAL_ITEMS.map(({ id, count }) => ({
          ...ITEMS_CONFIG.find((item) => item.id === id),
          count,
        })).filter(item => item.id);
      }
    } else {
      console.log("检测到旧存档，开发阶段已自动重置");
      player = createPlayer();
    }
  } else {
    player = createPlayer();
  }

  const calculatedStats = calculatePlayerStats(player);
  player.maxHp = calculatedStats.maxHp;
  player.maxMp = calculatedStats.maxMp;
  player.hp = player.maxHp;
  player.mp = player.maxMp;

  return player;
};

export const allocatePoints = (player, stat, points) => {
  if (player.freePoints < points) return;

  player.freePoints -= points;

  switch (stat) {
    case "physicalAttack":
      player.physicalAttackPoints += points;
      break;
    case "magicAttack":
      player.magicAttackPoints += points;
      break;
    case "defense":
      player.defensePoints += points;
      break;
    case "speed":
      player.speedPoints += points;
      break;
    case "maxHp":
      player.maxHpPoints += points;
      break;
  }

  const calculatedStats = calculatePlayerStats(player);
  player.maxHp = calculatedStats.maxHp;
  player.maxMp = calculatedStats.maxMp;
  player.hp = Math.min(player.hp, player.maxHp);
  player.mp = Math.min(player.mp, player.maxMp);
};

export const levelUp = (player, battleLog) => {
  while (player.exp >= player.expToNext) {
    player.exp -= player.expToNext;
    player.level++;
    player.expToNext = Math.floor(
      player.expToNext * PLAYER_CONFIG.LEVEL_UP.EXP_TO_NEXT_MULTIPLIER,
    );

    for (const stat of PLAYER_CONFIG.LEVEL_UP.STATS) {
      player[`${stat}Points`] += PLAYER_CONFIG.LEVEL_UP.POINTS_PER_STAT;
    }

    const calculatedStats = calculatePlayerStats(player);
    player.maxHp = calculatedStats.maxHp;
    player.maxMp = calculatedStats.maxMp;
    player.hp = player.maxHp;
    player.mp = player.maxMp;

    player.freePoints += PLAYER_CONFIG.LEVEL_UP.FREE_POINTS_PER_LEVEL;

    if (battleLog) {
      battleLog.push(`升级了！当前等级：${player.level}`);
    }
  }
};

export const equipItem = (player, equipment, index) => {
  const slot = equipment.type;

  if (player.equipment[slot]) {
    player.equipmentBag.push(player.equipment[slot]);
  }

  player.equipment[slot] = equipment;

  player.equipmentBag.splice(index, 1);
};

export const unequipItem = (player, slot) => {
  if (player.equipment[slot]) {
    player.equipmentBag.push(player.equipment[slot]);
    delete player.equipment[slot];
  }
};

export const useItem = (target, item, index, inventoryOwner = null) => {
  let result = { success: false, message: "", amount: 0 };

  if (item.type === "heal") {
    const healAmount = Math.min(item.value, target.maxHp - target.hp);
    target.hp += healAmount;
    result = {
      success: true,
      message: `使用成功！恢复了 ${healAmount} 点生命值`,
      amount: healAmount,
    };
  } else if (item.type === "mana") {
    const manaAmount = Math.min(item.value, target.maxMp - target.mp);
    target.mp += manaAmount;
    result = {
      success: true,
      message: `使用成功！恢复了 ${manaAmount} 点法力值`,
      amount: manaAmount,
    };
  } else if (item.type === "percentHeal") {
    const healPercent = item.value;
    const healAmount = Math.floor(target.maxHp * healPercent);
    const actualHeal = Math.min(healAmount, target.maxHp - target.hp);
    target.hp += actualHeal;
    result = {
      success: true,
      message: `使用成功！恢复了 ${actualHeal} 点生命值 (${Math.floor(healPercent * 100)}%最大生命)`,
      amount: actualHeal,
    };
  } else if (item.type === "percentMana") {
    const manaPercent = item.value;
    const manaAmount = Math.floor(target.maxMp * manaPercent);
    const actualMana = Math.min(manaAmount, target.maxMp - target.mp);
    target.mp += actualMana;
    result = {
      success: true,
      message: `使用成功！恢复了 ${actualMana} 点法力值 (${Math.floor(manaPercent * 100)}%最大法力)`,
      amount: actualMana,
    };
  } else if (item.type === "percentBoth") {
    const percent = item.value;
    const healAmount = Math.floor(target.maxHp * percent);
    const manaAmount = Math.floor(target.maxMp * percent);
    const actualHeal = Math.min(healAmount, target.maxHp - target.hp);
    const actualMana = Math.min(manaAmount, target.maxMp - target.mp);
    target.hp += actualHeal;
    target.mp += actualMana;
    result = {
      success: true,
      message: `使用成功！恢复了 ${actualHeal} 点生命值和 ${actualMana} 点法力值 (各${Math.floor(percent * 100)}%)`,
      amount: actualHeal + actualMana,
    };
  }

  if (result.success) {
    const owner = inventoryOwner || target;
    if (owner.inventory && owner.inventory[index]) {
      const invItem = owner.inventory[index];
      invItem.count--;
      if (invItem.count <= 0) {
        owner.inventory.splice(index, 1);
      }
    }
  }

  return result;
};

export const movePlayer = (player, dx, dy) => {
  player.x = Math.max(30, Math.min(770, player.x + dx));
  player.y = Math.max(30, Math.min(570, player.y + dy));
};

// ========== 宠物相关功能 ==========

export const calculatePetStats = (pet) => {
  const stats = {
    physicalAttack: 0,
    magicAttack: 0,
    defense: 0,
    speed: 0,
    maxHp: 0,
    maxMp: 0,
    critRate: 0,
    comboRate: 0,
    maxComboCount: 1,
    debuffResist: 0, // 障碍抗性
    ignoreDebuffResist: 0, // 忽视障碍异常
  };

  for (const stat in BASE_STATS) {
    stats[stat] = BASE_STATS[stat] * 0.7; // 宠物基础属性稍低
  }

  if (pet.critRate !== undefined) {
    stats.critRate += pet.critRate - BASE_STATS.critRate * 0.7;
  }
  if (pet.comboRate !== undefined) {
    stats.comboRate += pet.comboRate - BASE_STATS.comboRate * 0.7;
  }
  if (pet.maxComboCount !== undefined) {
    stats.maxComboCount += pet.maxComboCount - BASE_STATS.maxComboCount;
  }

  // 使用宠物的自定义系数（如果存在），否则使用默认系数
  const petCoefficients = pet.pointCoefficients || PET_STAT_POINT_COEFFICIENTS;

  const pointStats = [
    "physicalAttack",
    "magicAttack",
    "defense",
    "speed",
    "maxHp",
  ];
  for (const stat of pointStats) {
    const points = pet[`${stat}Points`] || 0;
    const coefficient = petCoefficients[stat] || 1;
    stats[stat] += points * coefficient;
  }

  const magicPoints = pet.magicAttackPoints || 0;
  stats.maxMp += magicPoints * petCoefficients.maxMp * 0.7;

  for (const slot in pet.equipment) {
    const equip = pet.equipment[slot];
    if (equip) {
      if (equip.baseStats) {
        for (const stat of pointStats) {
          const basePoints = equip.baseStats[stat] || 0;
          const coefficient = petCoefficients[stat] || 1;
          stats[stat] += basePoints * coefficient;
        }
        const equipMagicPoints = equip.baseStats.magicAttack || 0;
        stats.maxMp += equipMagicPoints * petCoefficients.maxMp;
      }

      if (equip.baseAffixes) {
        for (const stat of pointStats) {
          const affixPoints = equip.baseAffixes[stat] || 0;
          const coefficient = petCoefficients[stat] || 1;
          stats[stat] += affixPoints * coefficient;
        }
        const affixMagicPoints = equip.baseAffixes.magicAttack || 0;
        stats.maxMp += affixMagicPoints * petCoefficients.maxMp;
      }

      if (equip.bonusAffixes) {
        for (const stat in equip.bonusAffixes) {
          const bonusValue = equip.bonusAffixes[stat] || 0;

          if (stat === "allStats" && equip.level) {
            const allStatsValue = bonusValue;
            stats.physicalAttack += allStatsValue;
            stats.magicAttack += allStatsValue;
            stats.defense += allStatsValue;
            stats.speed += allStatsValue;
            stats.maxHp += allStatsValue;
            stats.maxMp += allStatsValue;

            const critBonus = Math.max(
              1,
              Math.floor((allStatsValue / equip.level) * 30),
            );
            stats.critRate += critBonus;

            const comboBonus = Math.max(
              1,
              Math.floor((allStatsValue / equip.level) * 30),
            );
            stats.comboRate += comboBonus;

            const maxComboBonus = Math.max(
              1,
              Math.floor((allStatsValue / equip.level) * 10),
            );
            stats.maxComboCount += maxComboBonus;
          } else if (stats[stat] !== undefined) {
            stats[stat] += bonusValue;
          } else {
            stats[stat] = bonusValue;
          }
        }
      }
    }
  }

  // 应用临时属性覆盖
  if (pet.tempPhysicalAttack !== undefined && pet.tempPhysicalAttack > 0) {
    stats.physicalAttack = pet.tempPhysicalAttack;
  }
  if (pet.tempMagicAttack !== undefined && pet.tempMagicAttack > 0) {
    stats.magicAttack = pet.tempMagicAttack;
  }
  if (pet.tempDefense !== undefined && pet.tempDefense > 0) {
    stats.defense = pet.tempDefense;
  }
  if (pet.tempSpeed !== undefined && pet.tempSpeed > 0) {
    stats.speed = pet.tempSpeed;
  }

  return stats;
};

export const initialPet = {
  name: PET_CONFIG.NAME,
  level: PET_CONFIG.INITIAL_LEVEL,
  exp: PET_CONFIG.INITIAL_EXP,
  expToNext: PET_CONFIG.INITIAL_EXP_TO_NEXT,
  hp: 0,
  maxHp: 0,
  maxHpPoints: PET_CONFIG.INITIAL_POINTS.maxHp,
  mp: 0,
  maxMp: 0,
  physicalAttackPoints: PET_CONFIG.INITIAL_POINTS.physicalAttack,
  magicAttackPoints: PET_CONFIG.INITIAL_POINTS.magicAttack,
  defensePoints: PET_CONFIG.INITIAL_POINTS.defense,
  speedPoints: PET_CONFIG.INITIAL_POINTS.speed,
  freePoints: PET_CONFIG.INITIAL_FREE_POINTS,
  skills: [],
  equipment: {},
  critRate: PET_CONFIG.INITIAL_STATS.critRate,
  comboRate: PET_CONFIG.INITIAL_STATS.comboRate,
  maxComboCount: PET_CONFIG.INITIAL_STATS.maxComboCount,
  active: true, // 宠物是否出战
};

export const createPet = () => {
  const pet = { ...initialPet };
  const calculatedStats = calculatePetStats(pet);
  pet.maxHp = calculatedStats.maxHp;
  pet.maxMp = calculatedStats.maxMp;
  pet.hp = pet.maxHp;
  pet.mp = pet.maxMp;
  pet.skills = PET_CONFIG.INITIAL_SKILL_INDICES.map(
    (id) => SKILLS_CONFIG.find((s) => s.id === id),
  ).filter(Boolean);
  return pet;
};

export const loadPetData = (savedPetData) => {
  let pet;

  if (savedPetData) {
    if (savedPetData.physicalAttackPoints !== undefined) {
      pet = {
        ...initialPet,
        ...savedPetData,
      };
      
      // 恢复技能
      if (savedPetData.skills && savedPetData.skills.length > 0) {
        // 从保存的技能 ID 或完整对象中恢复技能
        pet.skills = savedPetData.skills.map(savedSkill => {
          if (savedSkill.id) {
            const skill = SKILLS_CONFIG.find(s => s.id === savedSkill.id);
            return skill || savedSkill;
          }
          return savedSkill;
        });
      } else {
        // 使用初始技能
        pet.skills = PET_CONFIG.INITIAL_SKILL_INDICES.map(
          (id) => SKILLS_CONFIG.find((s) => s.id === id),
        ).filter(Boolean);
      }
    } else {
      console.log("检测到旧宠物存档，开发阶段已自动重置");
      pet = createPet();
    }
  } else {
    pet = createPet();
  }

  const calculatedStats = calculatePetStats(pet);
  pet.maxHp = calculatedStats.maxHp;
  pet.maxMp = calculatedStats.maxMp;
  pet.hp = pet.maxHp;
  pet.mp = pet.maxMp;

  return pet;
};

export const petLevelUp = (pet, battleLog) => {
  while (pet.exp >= pet.expToNext) {
    pet.exp -= pet.expToNext;
    pet.level++;
    pet.expToNext = Math.floor(
      pet.expToNext * PET_CONFIG.LEVEL_UP.EXP_TO_NEXT_MULTIPLIER,
    );

    for (const stat of PET_CONFIG.LEVEL_UP.STATS) {
      pet[`${stat}Points`] += PET_CONFIG.LEVEL_UP.POINTS_PER_STAT;
    }

    const calculatedStats = calculatePetStats(pet);
    pet.maxHp = calculatedStats.maxHp;
    pet.maxMp = calculatedStats.maxMp;
    pet.hp = pet.maxHp;
    pet.mp = pet.maxMp;

    pet.freePoints += PET_CONFIG.LEVEL_UP.FREE_POINTS_PER_LEVEL;

    if (battleLog) {
      battleLog.push(`宠物升级了！当前等级：${pet.level}`);
    }
  }
};

export const petEquipItem = (pet, player, equipment, index) => {
  const slot = equipment.type;

  if (pet.equipment[slot]) {
    player.equipmentBag.push(pet.equipment[slot]);
  }

  pet.equipment[slot] = equipment;
  player.equipmentBag.splice(index, 1);
};

export const petUnequipItem = (pet, player, slot) => {
  if (pet.equipment[slot]) {
    player.equipmentBag.push(pet.equipment[slot]);
    delete pet.equipment[slot];
  }
};

export const petAllocatePoints = (pet, stat, points) => {
  if (pet.freePoints < points) return;

  pet.freePoints -= points;

  switch (stat) {
    case "physicalAttack":
      pet.physicalAttackPoints += points;
      break;
    case "magicAttack":
      pet.magicAttackPoints += points;
      break;
    case "defense":
      pet.defensePoints += points;
      break;
    case "speed":
      pet.speedPoints += points;
      break;
    case "maxHp":
      pet.maxHpPoints += points;
      break;
  }

  const calculatedStats = calculatePetStats(pet);
  pet.maxHp = calculatedStats.maxHp;
  pet.maxMp = calculatedStats.maxMp;
  pet.hp = Math.min(pet.hp, pet.maxHp);
  pet.mp = Math.min(pet.mp, pet.maxMp);
};

/**
 * 计算装备加成的属性点
 * @param {Object} character - 角色对象（玩家或宠物）
 * @returns {Object} - 装备加成的属性点
 */
export const calculateEquipmentBonusPoints = (character) => {
  const bonusPoints = {
    physicalAttack: 0,
    magicAttack: 0,
    defense: 0,
    speed: 0,
    maxHp: 0,
  };

  const pointStats = [
    "physicalAttack",
    "magicAttack",
    "defense",
    "speed",
    "maxHp",
  ];

  for (const slot in character.equipment) {
    const equip = character.equipment[slot];
    if (equip) {
      if (equip.baseStats) {
        for (const stat of pointStats) {
          bonusPoints[stat] += equip.baseStats[stat] || 0;
        }
      }

      if (equip.baseAffixes) {
        for (const stat of pointStats) {
          bonusPoints[stat] += equip.baseAffixes[stat] || 0;
        }
      }
    }
  }

  return bonusPoints;
};
