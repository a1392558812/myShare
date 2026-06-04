import { GAME_CONFIG } from "./constants.js";

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
      const manaDamage = Math.floor(target.maxMp * manaDamagePercent);
      
      target.hp = Math.max(0, target.hp - damage);
      target.mp = Math.max(0, target.mp - manaDamage);
      
      gameState.battleLog.push(
        `${targetName} 中毒发作！受到 ${damage} HP伤害和 ${manaDamage} MP伤害`
      );
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
            if (buff.type === "heal") {
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
              const manaDamage = Math.floor(enemy.maxMp * manaDamagePercent);
              
              enemy.hp = Math.max(0, enemy.hp - damage);
              enemy.mp = Math.max(0, enemy.mp - manaDamage);
              
              gameState.battleLog.push(
                `${enemy.name} 中毒发作！受到 ${damage} HP伤害和 ${manaDamage} MP伤害`
              );
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

export const applyDebuff = (gameState, target, skill, casterName) => {
  if (!target) return;
  
  const skillType = skill.type;
  
  if (Math.random() > skill.successRate) {
    gameState.battleLog.push(`${casterName} 使用 ${skill.name} 对 ${target.name} 失败！`);
    return;
  }
  
  const debuffType = skillType.replace('_single', '').replace('_all', '').replace('debuff_', '');
  
  // 确定目标类型和对应的 buff 数组
  let buffArray = null;
  let targetName = "";
  
  // 检查是否是敌人
  const isEnemy = gameState.currentBattle?.enemies?.some(e => e === target);
  
  if (isEnemy) {
    // 敌人的 buff 存储在自己的 buffs 数组中
    if (!target.buffs) target.buffs = [];
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
  
  // 冰冻术优先级最高，清除其他debuff
  if (debuffType === 'freeze') {
    if (isEnemy) {
      target.buffs = target.buffs.filter(b => b.type === 'freeze');
    } else {
      const filtered = buffArray.filter(b => b.type === 'freeze');
      buffArray.length = 0;
      buffArray.push(...filtered);
    }
    gameState.battleLog.push(`${casterName} 使用 ${skill.name} 冰冻了 ${targetName}！`);
  } else {
    // 封印和混乱互相覆盖
    if (debuffType === 'seal') {
      if (isEnemy) {
        target.buffs = target.buffs.filter(b => b.type !== 'confuse');
      } else {
        const filtered = buffArray.filter(b => b.type !== 'confuse');
        buffArray.length = 0;
        buffArray.push(...filtered);
      }
    } else if (debuffType === 'confuse') {
      if (isEnemy) {
        target.buffs = target.buffs.filter(b => b.type !== 'seal');
      } else {
        const filtered = buffArray.filter(b => b.type !== 'seal');
        buffArray.length = 0;
        buffArray.push(...filtered);
      }
    }
    
    // 移除冰冻以外的debuff（冰冻优先级最高）
    if (isEnemy) {
      target.buffs = target.buffs.filter(b => b.type === 'freeze' || b.type !== debuffType);
    } else {
      const filtered = buffArray.filter(b => b.type === 'freeze' || b.type !== debuffType);
      buffArray.length = 0;
      buffArray.push(...filtered);
    }
    
    gameState.battleLog.push(`${casterName} 使用 ${skill.name} 成功！${targetName} 被${debuffType === 'seal' ? '封印' : debuffType === 'confuse' ? '混乱' : debuffType === 'poison' ? '中毒' : '控制'}了！`);
  }
  
  buffArray.push({
    name: skill.name,
    type: debuffType,
    remainingTurns: skill.duration,
    damagePercent: skill.damagePercent,
    manaDamagePercent: skill.manaDamagePercent,
  });
};

export const applyBuff = (gameState, targetType, buff) => {
  if (!gameState.currentBattle) return;

  const battle = gameState.currentBattle;
  let buffs;

  if (targetType === "player") {
    if (!battle.playerBuffs) battle.playerBuffs = [];
    buffs = battle.playerBuffs;
  } else if (targetType === "pet") {
    if (!battle.petBuffs) battle.petBuffs = [];
    buffs = battle.petBuffs;
  } else {
    return;
  }

  if (!buffs) return;

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
