import { GAME_CONFIG } from "./constants.js";
import { calculatePlayerStats, calculatePetStats } from "./player.js";

export const getRandomAliveEnemyIndex = (enemies) => {
  const aliveIndices = [];
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].hp > 0) {
      aliveIndices.push(i);
    }
  }
  if (aliveIndices.length === 0) return -1;
  const randomIndex = Math.floor(Math.random() * aliveIndices.length);
  return aliveIndices[randomIndex];
};

// 检查目标是否有冰冻buff（冰冻的单位无法受到伤害）
export const isTargetFrozen = (gameState, target) => {
  if (!target) return false;
  
  // 检查是否是敌人
  const isEnemy = gameState.currentBattle?.enemies?.some(e => e.id === target.id);
  
  if (isEnemy) {
    return target.buffs?.some(b => b.type === 'freeze') || false;
  } else if (target === gameState.player) {
    return gameState.currentBattle?.playerBuffs?.some(b => b.type === 'freeze') || false;
  } else if (target === gameState.pet) {
    return gameState.currentBattle?.petBuffs?.some(b => b.type === 'freeze') || false;
  }
  
  return false;
};

export const processBuffs = (gameState) => {
  if (!gameState.currentBattle) return;

  const battle = gameState.currentBattle;
  const player = gameState.player;
  const pet = gameState.pet;

  const processAndReduceBuffs = (buffs, target, targetName) => {
    if (!buffs || !target) return;
    const expiredBuffs = [];
    buffs.forEach((buff, index) => {
      if (buff && buff.remainingTurns > 0) {
        executeBuffEffect(gameState, buff, target, targetName);
        
        buff.remainingTurns--;
        if (buff.remainingTurns <= 0) {
          expiredBuffs.push(index);
        }
      }
    });

    for (let i = expiredBuffs.length - 1; i >= 0; i--) {
      const buff = buffs[expiredBuffs[i]];
      if (buff) {
        gameState.battleLog.push(`${targetName}的 ${buff.name} 效果消失了`);
        buffs.splice(expiredBuffs[i], 1);
      }
    }
  };

  const executeBuffEffect = (gameState, buff, target, targetName) => {
    if (!buff || !target) return;
    
    // 检查目标是否被冰冻（冰冻状态下无法被治疗）
    if (buff.type === "heal" && isTargetFrozen(gameState, target)) {
      gameState.battleLog.push(`${targetName} 被冰冻，${buff.name} 无法生效！`);
      return;
    }
    
    // 治疗buff效果 - 每回合恢复一定比例的生命和法力
    if (buff.type === "heal") {
      const healPercent = buff.healPercent || 0.15;
      const manaPercent = buff.manaPercent || 0.1;
      
      const healAmount = Math.floor(target.maxHp * healPercent);
      const manaAmount = Math.floor(target.maxMp * manaPercent);
      
      target.hp = Math.min(target.maxHp, target.hp + healAmount);
      target.mp = Math.min(target.maxMp, target.mp + manaAmount);
      
      if (healAmount > 0 || manaAmount > 0) {
        gameState.battleLog.push(
          `${targetName} 的 ${buff.name} 效果触发！恢复 ${healAmount} HP 和 ${manaAmount} MP`
        );
      }
    }
    
    // 中毒debuff效果 - 每回合扣减生命和法力
    if (buff.type === "poison") {
      const damagePercent = buff.damagePercent || 0.08;
      const manaDamagePercent = buff.manaDamagePercent || 0.05;
      
      const damage = Math.floor(target.maxHp * damagePercent);
      const manaDamage = Math.floor((target.maxMp || 0) * manaDamagePercent);
      
      target.hp = Math.max(0, target.hp - damage);
      target.mp = Math.max(0, (target.mp || 0) - manaDamage);
      
      // 根据目标是否有法力显示不同的消息
      if (target.maxMp && target.maxMp > 0) {
        gameState.battleLog.push(
          `${targetName} 中毒发作！受到 ${damage} HP伤害和 ${manaDamage} MP伤害`
        );
      } else {
        gameState.battleLog.push(
          `${targetName} 中毒发作！受到 ${damage} HP伤害`
        );
      }
    }
  };

  if (battle.playerBuffs && battle.playerBuffs.length > 0) {
    processAndReduceBuffs(battle.playerBuffs, player, "你");
  }

  if (battle.petBuffs && battle.petBuffs.length > 0) {
    processAndReduceBuffs(battle.petBuffs, pet, pet?.name || "宠物");
  }

  if (battle.enemies) {
    battle.enemies.forEach((enemy) => {
      if (enemy && enemy.buffs && enemy.buffs.length > 0) {
        const expiredBuffs = [];
        enemy.buffs.forEach((buff, index) => {
          if (buff && buff.remainingTurns > 0) {
            // 检查敌人是否被冰冻（冰冻状态下无法被治疗）
            if (buff.type === "heal" && isTargetFrozen(gameState, enemy)) {
              gameState.battleLog.push(`${enemy.name} 被冰冻，${buff.name} 无法生效！`);
            } else if (buff.type === "heal") {
              const healPercent = buff.healPercent || 0.15;
              const manaPercent = buff.manaPercent || 0.1;
              const healAmount = Math.floor(enemy.maxHp * healPercent);
              const manaAmount = Math.floor(enemy.maxMp * manaPercent);
              enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
              enemy.mp = Math.min(enemy.maxMp, enemy.mp + manaAmount);
              if (healAmount > 0 || manaAmount > 0) {
                gameState.battleLog.push(
                  `${enemy.name} 的 ${buff.name} 效果触发！恢复 ${healAmount} HP 和 ${manaAmount} MP`
                );
              }
            }
            
            // 中毒debuff效果
            if (buff.type === "poison") {
              const damagePercent = buff.damagePercent || 0.08;
              const manaDamagePercent = buff.manaDamagePercent || 0.05;
              
              const damage = Math.floor(enemy.maxHp * damagePercent);
              const manaDamage = Math.floor((enemy.maxMp || 0) * manaDamagePercent);
              
              enemy.hp = Math.max(0, enemy.hp - damage);
              enemy.mp = Math.max(0, (enemy.mp || 0) - manaDamage);
              
              // 根据敌人是否有法力显示不同的消息
              if (enemy.maxMp && enemy.maxMp > 0) {
                gameState.battleLog.push(
                  `${enemy.name} 中毒发作！受到 ${damage} HP伤害和 ${manaDamage} MP伤害`
                );
              } else {
                gameState.battleLog.push(
                  `${enemy.name} 中毒发作！受到 ${damage} HP伤害`
                );
              }
            }
            
            buff.remainingTurns--;
            if (buff.remainingTurns <= 0) {
              expiredBuffs.push(index);
            }
          }
        });
        for (let i = expiredBuffs.length - 1; i >= 0; i--) {
          const buff = enemy.buffs[expiredBuffs[i]];
          if (buff) {
            gameState.battleLog.push(`${enemy.name}的 ${buff.name} 效果消失了`);
            enemy.buffs.splice(expiredBuffs[i], 1);
          }
        }
      }
    });
  }
};

export const applyDebuff = (gameState, target, skill, casterName, casterType = 'player') => {
  if (!target) return;
  
  const skillType = skill.type;
  const debuffType = skillType.replace('_single', '').replace('_all', '').replace('debuff_', '');
  
  // 确定目标类型和对应的 buff 数组
  let buffArray = null;
  let targetName = "";
  
  // 检查是否是敌人（使用 id 匹配，避免对象引用问题）
  const isEnemy = gameState.currentBattle?.enemies?.some(e => e.id === target.id);
  
  if (isEnemy) {
    // 敌人的 buff 存储在自己的 buffs 数组中（已在敌人生成时初始化）
    buffArray = target.buffs;
    targetName = target.name;
  } else if (target === gameState.player) {
    // 玩家的 buff 存储在 battle.playerBuffs 中
    if (!gameState.currentBattle.playerBuffs) gameState.currentBattle.playerBuffs = [];
    buffArray = gameState.currentBattle.playerBuffs;
    targetName = "你";
  } else if (target === gameState.pet) {
    // 宠物的 buff 存储在 battle.petBuffs 中
    if (!gameState.currentBattle.petBuffs) gameState.currentBattle.petBuffs = [];
    buffArray = gameState.currentBattle.petBuffs;
    targetName = target.name;
  }
  
  if (!buffArray) return;
  
  // 获取目标和施法者的属性
  let debuffResist = 0;
  let ignoreDebuffResist = 0;
  
  // 获取目标的障碍抗性
  if (isEnemy) {
    debuffResist = target.debuffResist || 0;
  } else if (target === gameState.player) {
    const playerStats = calculatePlayerStats(target);
    debuffResist = playerStats.debuffResist || 0;
  } else if (target === gameState.pet) {
    const petStats = calculatePetStats(target);
    debuffResist = petStats.debuffResist || 0;
  }
  
  // 获取施法者的忽视障碍异常属性
  if (casterType === 'player') {
    const playerStats = calculatePlayerStats(gameState.player);
    ignoreDebuffResist = playerStats.ignoreDebuffResist || 0;
  } else if (casterType === 'pet') {
    const petStats = calculatePetStats(gameState.pet);
    ignoreDebuffResist = petStats.ignoreDebuffResist || 0;
  }
  
  // 计算实际成功率：基础成功率 × (1 - 目标障碍抗性/100 + 施法者忽视障碍异常/100)
  const actualSuccessRate = skill.successRate * (1 - debuffResist / 100 + ignoreDebuffResist / 100);
  
  // 构建日志信息
  const logMessages = [];
  if (debuffResist > 0) {
    logMessages.push(`${targetName} 的障碍抗性 ${debuffResist}% 降低成功率`);
  }
  if (ignoreDebuffResist > 0) {
    logMessages.push(`${casterName} 的忽视障碍异常 ${ignoreDebuffResist}% 提升成功率`);
  }
  if (logMessages.length > 0) {
    gameState.battleLog.push(`${logMessages.join('，')}，实际成功率: ${(actualSuccessRate * 100).toFixed(1)}%`);
  }
  
  if (Math.random() > actualSuccessRate) {
    gameState.battleLog.push(`${casterName} 使用 ${skill.name} 对 ${targetName} 失败！`);
    return;
  }
  
  // 检查目标是否被冰冻（冰冻状态下无法受到除冰冻外的任何debuff）
  if (debuffType !== 'freeze' && isTargetFrozen(gameState, target)) {
    gameState.battleLog.push(`${targetName} 被冰冻，${skill.name} 无法生效！`);
    return;
  }
  
  // 冰冻术优先级最高，清除其他所有buff（包括增益和减益）
  if (debuffType === 'freeze') {
    if (isEnemy) {
      // 使用 splice 保持响应式 - 清除所有buff（包括旧的冰冻buff），然后添加新的
      target.buffs.splice(0, target.buffs.length);
    } else {
      // 清除所有buff（包括旧的冰冻buff）
      buffArray.length = 0;
    }
    gameState.battleLog.push(`${casterName} 使用 ${skill.name} 冰冻了 ${targetName}！`);
  } else {
    // 封印和混乱互相覆盖
    if (debuffType === 'seal') {
      if (isEnemy) {
        // 使用 splice 保持响应式 - 移除混乱和旧的封印
        const filtered = target.buffs.filter(b => b.type !== 'confuse' && b.type !== 'seal');
        target.buffs.splice(0, target.buffs.length, ...filtered);
      } else {
        // 移除混乱和旧的封印
        const filtered = buffArray.filter(b => b.type !== 'confuse' && b.type !== 'seal');
        buffArray.length = 0;
        buffArray.push(...filtered);
      }
    } else if (debuffType === 'confuse') {
      if (isEnemy) {
        // 使用 splice 保持响应式 - 移除封印和旧的混乱
        const filtered = target.buffs.filter(b => b.type !== 'seal' && b.type !== 'confuse');
        target.buffs.splice(0, target.buffs.length, ...filtered);
      } else {
        // 移除封印和旧的混乱
        const filtered = buffArray.filter(b => b.type !== 'seal' && b.type !== 'confuse');
        buffArray.length = 0;
        buffArray.push(...filtered);
      }
    } else if (debuffType === 'poison') {
      // 移除旧的中毒buff
      if (isEnemy) {
        const filtered = target.buffs.filter(b => b.type !== 'poison');
        target.buffs.splice(0, target.buffs.length, ...filtered);
      } else {
        const filtered = buffArray.filter(b => b.type !== 'poison');
        buffArray.length = 0;
        buffArray.push(...filtered);
      }
    }
    
    gameState.battleLog.push(`${casterName} 使用 ${skill.name} 成功！${targetName} 被${debuffType === 'seal' ? '封印' : debuffType === 'confuse' ? '混乱' : debuffType === 'poison' ? '中毒' : '控制'}了！`);
  }
  
  // 创建debuff对象
  const debuff = {
    name: skill.name,
    type: debuffType,
    remainingTurns: skill.duration,
    damagePercent: skill.damagePercent,
    manaDamagePercent: skill.manaDamagePercent,
  };
  
  // 中毒效果：立即扣减血量和法力
  if (debuffType === 'poison') {
    const damagePercent = skill.damagePercent || 0.08;
    const manaDamagePercent = skill.manaDamagePercent || 0.05;
    
    const damage = Math.floor(target.maxHp * damagePercent);
    const manaDamage = Math.floor((target.maxMp || 0) * manaDamagePercent);
    
    target.hp = Math.max(0, target.hp - damage);
    target.mp = Math.max(0, (target.mp || 0) - manaDamage);
    
    // 根据目标是否有法力显示不同的消息
    if (target.maxMp && target.maxMp > 0) {
      gameState.battleLog.push(
        `${casterName} 的 ${skill.name} 生效！${targetName} 受到 ${damage} HP伤害和 ${manaDamage} MP伤害`
      );
    } else {
      gameState.battleLog.push(
        `${casterName} 的 ${skill.name} 生效！${targetName} 受到 ${damage} HP伤害`
      );
    }
  }
  
  buffArray.push(debuff);
};

export const applyBuff = (gameState, targetType, buff) => {
  if (!gameState.currentBattle) return;

  const battle = gameState.currentBattle;
  let buffs;
  let target;
  let targetName;

  if (targetType === "player") {
    if (!battle.playerBuffs) battle.playerBuffs = [];
    buffs = battle.playerBuffs;
    target = gameState.player;
    targetName = "你";
  } else if (targetType === "pet") {
    if (!battle.petBuffs) battle.petBuffs = [];
    buffs = battle.petBuffs;
    target = gameState.pet;
    targetName = gameState.pet?.name || "宠物";
  } else {
    return;
  }

  if (!buffs) return;

  // 检查目标是否被冰冻（冰冻状态下无法受到除冰冻外的任何buff）
  if (buff.type !== 'freeze' && isTargetFrozen(gameState, target)) {
    gameState.battleLog.push(`${targetName} 被冰冻，无法获得 ${buff.name}！`);
    return;
  }

  const buffType = buff.type;
  const existingIndex = buffs.findIndex((b) => b.type === buffType);

  if (existingIndex >= 0) {
    buffs[existingIndex] = { ...buff };
  } else {
    buffs.push({ ...buff });
  }
};

export const getBuffMultiplier = (buffs, statType) => {
  if (!buffs) return 1;
  let multiplier = 1;
  buffs.forEach((buff) => {
    if (buff && buff.statType === statType) {
      multiplier *= buff.value;
    }
  });
  return multiplier;
};

export const generateTurnOrder = (gameState, playerStats, petStats) => {
  const units = [];

  units.push({
    id: "player",
    name: gameState.player.name,
    speed: playerStats.speed,
    type: "player",
  });

  if (gameState.pet && gameState.pet.active && gameState.pet.hp > 0) {
    units.push({
      id: "pet",
      name: gameState.pet.name,
      speed: petStats.speed,
      type: "pet",
    });
  }

  gameState.currentBattle.enemies.forEach((enemy, index) => {
    if (enemy.hp > 0) {
      units.push({
        id: `enemy_${enemy.id}`,
        name: enemy.name,
        speed: enemy.speed,
        type: "enemy",
        index: index,
        enemyId: enemy.id,
      });
    }
  });

  units.sort((a, b) => b.speed - a.speed);
  return units;
};

export const getCurrentActor = (gameState) => {
  if (!gameState.currentBattle || !gameState.currentBattle.turnOrder) {
    return null;
  }
  return gameState.currentBattle.turnOrder[
    gameState.currentBattle.currentTurnIndex
  ];
};

export const checkBattleEnd = (gameState) => {
  // 如果不在战斗中，直接返回 false
  if (!gameState.currentBattle) {
    return false;
  }

  const player = gameState.player;
  const pet = gameState.pet;
  const enemies = gameState.currentBattle.enemies;

  const allEnemiesDead = enemies.every((enemy) => enemy.hp <= 0);

  if (allEnemiesDead) {
    return true;
  }

  const playerDead = player.hp <= 0;
  const petDead = !pet || !pet.active || pet.hp <= 0;

  if (playerDead && petDead) {
    return true;
  }

  return false;
};

export const getDecisionName = (decision) => {
  if (!decision) return "无";
  switch (decision.type) {
    case "attack":
      return "普通攻击";
    case "skill":
      return `使用技能[${decision.skill?.name}]`;
    case "defend":
      return "防御";
    case "flee":
      return "逃跑";
    case "item":
      return `使用道具[${decision.item?.name}]`;
    default:
      return "未知";
  }
};

export const aiConfig = {
  DEFENSE_DAMAGE_REDUCTION: GAME_CONFIG.CRIT?.MAX_CRIT_RATE ? GAME_CONFIG.BATTLE_AI?.DEFENSE_DAMAGE_REDUCTION || 0.5 : 0.5,
};
