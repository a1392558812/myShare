import { GAME_CONFIG, SKILLS_CONFIG, UI_CONFIG, ITEMS_CONFIG, BOSS_CONFIG } from "./constants.js";
import { calculatePlayerStats, calculatePetStats, levelUp, petLevelUp } from "./player.js";
import { generateTurnOrder, checkBattleEnd, getDecisionName, processBuffs, isTargetFrozen } from "./battle-utils.js";
import { executePlayerDecision } from "./player-actions.js";
import { executePetDecision } from "./pet-actions.js";
import { performEnemyAttack } from "./enemy-actions.js";
import { getRandomEquipment, RARITY_NAMES } from "./equipment.js";
import { applyDamage } from "./utils.js";

const executeTurnOrder = (
  gameState,
  calculatePlayerStatsFn,
  calculatePetStatsFn,
  handleBattleEndFn,
  currentIndex,
) => {
  if (!gameState.currentBattle) return;

  const turnOrder = gameState.currentBattle.turnOrder;
  if (currentIndex >= turnOrder.length) {
    gameState.currentBattle.playerDefending = false;

    processBuffs(gameState);

    gameState.currentBattle.round = (gameState.currentBattle.round || 0) + 1;
    gameState.battleLog.push(
      `--- 第 ${gameState.currentBattle.round} 回合 ---`,
    );

    const playerStats = calculatePlayerStatsFn(gameState.player);
    const petStats = calculatePetStatsFn(gameState.pet);
    gameState.currentBattle.turnOrder = generateTurnOrder(
      gameState,
      playerStats,
      petStats,
    );

    startCommandPhase(gameState);
    return;
  }

  const actor = turnOrder[currentIndex];
  gameState.currentBattle.currentTurnIndex = currentIndex;

  if (actor.type === "enemy") {
    const enemy = gameState.currentBattle.enemies[actor.index];
    if (enemy && enemy.hp > 0) {
      const hasFreezeBuff = enemy.buffs?.some(b => b.type === 'freeze');
      const hasSealBuff = enemy.buffs?.some(b => b.type === 'seal');
      
      if (hasFreezeBuff) {
        gameState.battleLog.push(`${enemy.name} 被冰冻，无法行动！`);
      } else if (hasSealBuff) {
        gameState.battleLog.push(`${enemy.name} 被封印，无法行动！`);
      } else {
        const hasConfuseBuff = enemy.buffs?.some(b => b.type === 'confuse');
        if (hasConfuseBuff) {
          gameState.battleLog.push(`${enemy.name} 陷入混乱！`);
        }
        performEnemyAttack(gameState, enemy, hasConfuseBuff);
      }
    }

    if (checkBattleEnd(gameState)) {
      handleBattleEndFn(gameState);
      return;
    }

    setTimeout(() => {
      executeTurnOrder(
        gameState,
        calculatePlayerStatsFn,
        calculatePetStatsFn,
        handleBattleEndFn,
        currentIndex + 1,
      );
    }, 800);
  } else if (actor.type === "pet") {
    const pet = gameState.pet;
    if (pet && pet.hp > 0 && pet.active) {
      // 检查宠物的 debuff
      const petBuffs = gameState.currentBattle.petBuffs;
      const hasFreezeBuff = petBuffs?.some(b => b.type === 'freeze');
      const hasSealBuff = petBuffs?.some(b => b.type === 'seal');
      
      if (hasFreezeBuff) {
        gameState.battleLog.push(`${pet.name} 被冰冻，无法行动！`);
      } else if (hasSealBuff) {
        gameState.battleLog.push(`${pet.name} 被封印，无法行动！`);
      } else {
        const hasConfuseBuff = petBuffs?.some(b => b.type === 'confuse');
        if (hasConfuseBuff) {
          gameState.battleLog.push(`${pet.name} 陷入混乱！`);
          // 宠物混乱时随机攻击
          executePetConfusedAttack(gameState, pet);
        } else {
          const decision = gameState.currentBattle.petDecision;
          if (decision) {
            executePetDecision(gameState, decision);
          } else {
            gameState.battleLog.push(`${pet.name} 没有收到指令，跳过行动！`);
          }
        }
      }
    } else if (pet && pet.hp <= 0 && pet.active) {
      gameState.battleLog.push(`${pet.name} 已退场，跳过行动！`);
    }

    if (checkBattleEnd(gameState)) {
      handleBattleEndFn(gameState);
      return;
    }

    setTimeout(() => {
      executeTurnOrder(
        gameState,
        calculatePlayerStatsFn,
        calculatePetStatsFn,
        handleBattleEndFn,
        currentIndex + 1,
      );
    }, 800);
  } else {
    const player = gameState.player;
    // 检查玩家的 debuff
    const playerBuffs = gameState.currentBattle.playerBuffs;
    const hasFreezeBuff = playerBuffs?.some(b => b.type === 'freeze');
    const hasSealBuff = playerBuffs?.some(b => b.type === 'seal');
    
    if (player && player.hp > 0) {
      if (hasFreezeBuff) {
        gameState.battleLog.push(`你 被冰冻，无法行动！`);
      } else if (hasSealBuff) {
        gameState.battleLog.push(`你 被封印，无法行动！`);
      } else {
        const hasConfuseBuff = playerBuffs?.some(b => b.type === 'confuse');
        if (hasConfuseBuff) {
          gameState.battleLog.push(`你 陷入混乱！`);
          // 玩家混乱时随机攻击
          executePlayerConfusedAttack(gameState, player);
        } else {
          const decision = gameState.currentBattle.playerDecision;
          if (decision) {
            executePlayerDecision(gameState, decision);
          } else {
            gameState.battleLog.push(`玩家没有收到指令，跳过行动！`);
          }
        }
      }
    } else if (player && player.hp <= 0) {
      const decision = gameState.currentBattle.playerDecision;
      if (decision) {
        // 检查执行决策前玩家是否已恢复血量
        if (player.hp > 0) {
          executePlayerDecision(gameState, decision);
          gameState.battleLog.push(`玩家被宠物复活！`);
        } else {
          gameState.battleLog.push(`玩家已被击败，跳过行动，等待救援中...`);
        }
      } else {
        gameState.battleLog.push(`玩家已被击败，等待宠物救援中...`);
      }
    }

    if (checkBattleEnd(gameState)) {
      handleBattleEndFn(gameState);
      return;
    }

    setTimeout(() => {
      executeTurnOrder(
        gameState,
        calculatePlayerStatsFn,
        calculatePetStatsFn,
        handleBattleEndFn,
        currentIndex + 1,
      );
    }, 800);
  }
};

// 玩家混乱时随机攻击
const executePlayerConfusedAttack = (gameState, player) => {
  const enemies = gameState.currentBattle.enemies;
  const pet = gameState.pet;
  
  // 收集所有可能的目标
  const allTargets = [];
  
  // 添加存活的敌人
  enemies.forEach((enemy, index) => {
    if (enemy.hp > 0) {
      allTargets.push({ type: 'enemy', target: enemy, index });
    }
  });
  
  // 如果有存活的宠物，也添加到可能的目标中
  if (pet && pet.active && pet.hp > 0) {
    allTargets.push({ type: 'pet', target: pet });
  }
  
  if (allTargets.length === 0) return;
  
  // 随机选择一个目标
  const randomIndex = Math.floor(Math.random() * allTargets.length);
  const chosenTarget = allTargets[randomIndex];
  
  if (chosenTarget.type === 'enemy') {
    // 攻击敌人
    // 检查目标是否被冰冻
    if (isTargetFrozen(gameState, chosenTarget.target)) {
      gameState.battleLog.push(`${chosenTarget.target.name} 被冰冻，无法受到伤害！`);
      return;
    }
    
    const playerStats = calculatePlayerStats(player);
    const critRate = Math.min(playerStats.critRate || 0, GAME_CONFIG.CRIT.MAX_CRIT_RATE) / 100;
    const isCrit = Math.random() < critRate;
    
    let baseDamage = Math.max(1, playerStats.physicalAttack - chosenTarget.target.defense);
    let damage = isCrit ? Math.floor(baseDamage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER) : baseDamage;
    
    applyDamage(chosenTarget.target, damage);
    gameState.battleLog.push(
      `你 混乱中攻击了 ${chosenTarget.target.name}${isCrit ? '【暴击！】' : ''}，造成 ${damage.toFixed(UI_CONFIG.DECIMAL_PLACES)} 点伤害`
    );
  } else if (chosenTarget.type === 'pet') {
    // 攻击宠物
    // 检查目标是否被冰冻
    if (isTargetFrozen(gameState, chosenTarget.target)) {
      gameState.battleLog.push(`${pet.name} 被冰冻，无法受到伤害！`);
      return;
    }
    
    const playerStats = calculatePlayerStats(player);
    const critRate = Math.min(playerStats.critRate || 0, GAME_CONFIG.CRIT.MAX_CRIT_RATE) / 100;
    const isCrit = Math.random() < critRate;
    
    const petStats = calculatePetStats(pet);
    let baseDamage = Math.max(1, playerStats.physicalAttack - petStats.defense);
    let damage = isCrit ? Math.floor(baseDamage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER) : baseDamage;
    
    applyDamage(chosenTarget.target, damage);
    gameState.battleLog.push(
      `你 混乱中攻击了 ${pet.name}${isCrit ? '【暴击！】' : ''}，造成 ${damage.toFixed(UI_CONFIG.DECIMAL_PLACES)} 点伤害`
    );
  }
};

// 宠物混乱时随机攻击
const executePetConfusedAttack = (gameState, pet) => {
  const enemies = gameState.currentBattle.enemies;
  const player = gameState.player;
  
  // 收集所有可能的目标
  const allTargets = [];
  
  // 添加存活的敌人
  enemies.forEach((enemy, index) => {
    if (enemy.hp > 0) {
      allTargets.push({ type: 'enemy', target: enemy, index });
    }
  });
  
  // 如果玩家存活，也添加到可能的目标中
  if (player.hp > 0) {
    allTargets.push({ type: 'player', target: player });
  }
  
  if (allTargets.length === 0) return;
  
  // 随机选择一个目标
  const randomIndex = Math.floor(Math.random() * allTargets.length);
  const chosenTarget = allTargets[randomIndex];
  
  if (chosenTarget.type === 'enemy') {
    // 攻击敌人
    // 检查目标是否被冰冻
    if (isTargetFrozen(gameState, chosenTarget.target)) {
      gameState.battleLog.push(`${chosenTarget.target.name} 被冰冻，无法受到伤害！`);
      return;
    }
    
    const petStats = calculatePetStats(pet);
    const critRate = Math.min(petStats.critRate || 0, GAME_CONFIG.CRIT.MAX_CRIT_RATE) / 100;
    const isCrit = Math.random() < critRate;
    
    let baseDamage = Math.max(1, petStats.physicalAttack - chosenTarget.target.defense);
    let damage = isCrit ? Math.floor(baseDamage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER) : baseDamage;
    
    applyDamage(chosenTarget.target, damage);
    gameState.battleLog.push(
      `${pet.name} 混乱中攻击了 ${chosenTarget.target.name}${isCrit ? '【暴击！】' : ''}，造成 ${damage.toFixed(UI_CONFIG.DECIMAL_PLACES)} 点伤害`
    );
  } else if (chosenTarget.type === 'player') {
    // 攻击玩家
    // 检查目标是否被冰冻
    if (isTargetFrozen(gameState, chosenTarget.target)) {
      gameState.battleLog.push(`你 被冰冻，无法受到伤害！`);
      return;
    }
    
    const petStats = calculatePetStats(pet);
    const playerStats = calculatePlayerStats(player);
    const critRate = Math.min(petStats.critRate || 0, GAME_CONFIG.CRIT.MAX_CRIT_RATE) / 100;
    const isCrit = Math.random() < critRate;
    
    let baseDamage = Math.max(1, petStats.physicalAttack - playerStats.defense);
    let damage = isCrit ? Math.floor(baseDamage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER) : baseDamage;
    
    applyDamage(chosenTarget.target, damage);
    gameState.battleLog.push(
      `${pet.name} 混乱中攻击了你${isCrit ? '【暴击！】' : ''}，造成 ${damage.toFixed(UI_CONFIG.DECIMAL_PLACES)} 点伤害`
    );
  }
};

const startCommandPhase = (gameState) => {
  gameState.currentBattle.phase = "command";
  gameState.currentBattle.playerDecision = null;
  gameState.currentBattle.petDecision = null;
  gameState.battleLog.push("--- 指令阶段 ---");

  if (!gameState.pet || !gameState.pet.active) {
    gameState.battleLog.push("请下达你的战斗指令！");
  } else {
    gameState.battleLog.push("请下达你和宠物的战斗指令！");
  }
};

const checkReadyToExecute = (gameState) => {
  const battle = gameState.currentBattle;
  const petNeedsDecision =
    gameState.pet && gameState.pet.active && gameState.pet.hp > 0;

  const playerReady = battle.playerDecision !== null;
  const petReady = !petNeedsDecision || battle.petDecision !== null;

  if (playerReady && petReady) {
    gameState.battleLog.push("--- 执行阶段 ---");
    battle.phase = "execution";
    setTimeout(() => {
      executeTurnOrder(
        gameState,
        calculatePlayerStats,
        calculatePetStats,
        handleBattleEnd,
        0,
      );
    }, 500);
  }
};

export const startBattle = (
  gameState,
  enemies,
  calculatePlayerStatsFn,
  calculatePetStatsFn,
  handleBattleEndFn,
) => {
  gameState.defeatedEnemyId = null;
  gameState.battleLog = [];
  gameState.battleResult = null;

  const battleEnemies = enemies;
  const playerStats = calculatePlayerStatsFn(gameState.player);
  const petStats = calculatePetStatsFn(gameState.pet);

  if (gameState.pet && gameState.pet.hp <= 0) {
    gameState.pet.hp = gameState.pet.maxHp;
    gameState.pet.mp = gameState.pet.maxMp;
  }

  gameState.currentBattle = {
    enemies: battleEnemies,
    currentTargetIndex: 0,
    playerDefending: false,
    round: 1,
    phase: "command",
    playerDecision: null,
    petDecision: null,
    playerBuffs: [],
    petBuffs: [],
  };

  gameState.currentBattle.turnOrder = generateTurnOrder(
    gameState,
    playerStats,
    petStats,
  );
  gameState.currentBattle.currentTurnIndex = 0;

  gameState.screen = "battle";

  gameState.battleLog.push(`战斗开始！遭遇了 ${battleEnemies.length} 个敌人！`);

  if (gameState.pet && gameState.pet.active) {
    gameState.battleLog.push(`${gameState.pet.name} 出战！`);
  }

  gameState.battleLog.push(`--- 第 1 回合 ---`);

  const orderNames = gameState.currentBattle.turnOrder
    .map((u) => `${u.name}(${u.speed})`)
    .join(" → ");
  gameState.battleLog.push(`行动顺序: ${orderNames}`);

  startCommandPhase(gameState);
};

export const handleBattleEnd = (
  gameState,
  levelUpFn = levelUp,
  petLevelUpFn = petLevelUp,
  getRandomEquipmentFn = getRandomEquipment,
  rarityNames = RARITY_NAMES,
  calculatePlayerStatsFn = calculatePlayerStats,
  calculatePetStatsFn = calculatePetStats,
) => {
  const player = gameState.player;
  const pet = gameState.pet;
  const enemies = gameState.currentBattle.enemies;
  const mapLevel = gameState.mapLevel || 1;

  const allEnemiesDead = enemies.every((enemy) => enemy.hp <= 0);

  // 检查是否是BOSS战斗
  const isBossBattle = enemies.some(enemy => enemy.isBoss);
  const bossEnemies = enemies.filter(enemy => enemy.isBoss);

  if (allEnemiesDead) {
    gameState.battleResult = "victory";
    
    if (isBossBattle) {
      gameState.battleLog.push("恭喜！你击败了BOSS！");
    } else {
      gameState.battleLog.push("战斗胜利！你击败了所有敌人！");
    }

    let totalExp = 0;
    let totalGold = 0;

    enemies.forEach((enemy) => {
      totalExp += enemy.exp;
      let goldReward = Math.floor(
        mapLevel * GAME_CONFIG.BATTLE_REWARD.GOLD_BASE +
          Math.random() * GAME_CONFIG.BATTLE_REWARD.GOLD_RANDOM,
      );
      
      // BOSS金币奖励翻倍
      if (enemy.isBoss) {
        goldReward = Math.floor(goldReward * BOSS_CONFIG.GOLD_MULTIPLIER);
      }
      totalGold += goldReward;
    });

    // BOSS经验奖励翻倍
    if (isBossBattle) {
      totalExp = Math.floor(totalExp * BOSS_CONFIG.EXP_MULTIPLIER);
    }

    player.exp += totalExp;
    if (pet && pet.active) {
      pet.exp += Math.floor(totalExp * 0.6);
    }
    player.gold += totalGold;

    gameState.battleLog.push(`获得 ${totalExp} 点经验值`);
    gameState.battleLog.push(`获得 ${totalGold} 金币！`);

    levelUpFn(player, gameState.battleLog);
    if (pet && pet.active) {
      petLevelUpFn(pet, gameState.battleLog);
    }

    // BOSS必定掉落物品和装备
    if (isBossBattle) {
      bossEnemies.forEach(boss => {
        // BOSS必定掉落物品
        const dropItem = ITEMS_CONFIG[Math.floor(Math.random() * ITEMS_CONFIG.length)];
        const existingItem = player.inventory.find((i) => i.id === dropItem.id);
        if (existingItem) {
          existingItem.count++;
        } else {
          player.inventory.push({ ...dropItem, count: 1 });
        }
        gameState.battleLog.push(`获得 ${dropItem.name}！`);

        // 掉落BOSS专属稀有度装备
        const dropRarity = boss.dropRarity || boss.rarity || 1;
        
        if (BOSS_CONFIG.DROP_MULTI_RARITY) {
          // 掉落多件装备
          const dropCount = BOSS_CONFIG.MIN_DROPS + Math.floor(Math.random() * (BOSS_CONFIG.MAX_DROPS - BOSS_CONFIG.MIN_DROPS + 1));
          for (let i = 0; i < dropCount; i++) {
            const equipment = getRandomEquipmentFn(mapLevel, dropRarity);
            player.equipmentBag.push(equipment);
            const rarityName = rarityNames[equipment.rarity] || "普通";
            gameState.battleLog.push(
              `获得 Lv.${equipment.level} ${rarityName}装备：${equipment.name}！`,
            );
          }
        } else {
          // 掉落单件装备
          const equipment = getRandomEquipmentFn(mapLevel, dropRarity);
          player.equipmentBag.push(equipment);
          const rarityName = rarityNames[equipment.rarity] || "普通";
          gameState.battleLog.push(
            `获得 Lv.${equipment.level} ${rarityName}装备：${equipment.name}！`,
          );
        }
      });
    } else {
      // 普通敌人掉落逻辑
      if (Math.random() < GAME_CONFIG.BATTLE_REWARD.ITEM_DROP_CHANCE) {
        const dropItem =
          ITEMS_CONFIG[Math.floor(Math.random() * ITEMS_CONFIG.length)];
        const existingItem = player.inventory.find((i) => i.id === dropItem.id);
        if (existingItem) {
          existingItem.count++;
        } else {
          player.inventory.push({ ...dropItem, count: 1 });
        }
        gameState.battleLog.push(`获得 ${dropItem.name}！`);
      }

      if (
        Math.random() < GAME_CONFIG.BATTLE_REWARD.SKILL_DROP_CHANCE &&
        player.skills.length < SKILLS_CONFIG.length
      ) {
        const unlockedSkillIds = player.skills.map((s) => s.id);
        const availableSkills = SKILLS_CONFIG.filter(
          (s) => !unlockedSkillIds.includes(s.id),
        );
        if (availableSkills.length > 0) {
          const newSkill =
            availableSkills[Math.floor(Math.random() * availableSkills.length)];
          player.skills.push(newSkill);
          gameState.battleLog.push(`学会了新技能：${newSkill.name}！`);
        }
      }

      if (Math.random() < GAME_CONFIG.BATTLE_REWARD.EQUIPMENT_DROP_CHANCE) {
        const equipment = getRandomEquipmentFn(mapLevel);
        player.equipmentBag.push(equipment);
        const rarityName = rarityNames[equipment.rarity] || "普通";
        gameState.battleLog.push(
          `获得 Lv.${equipment.level} ${rarityName}装备：${equipment.name}！`,
        );
      }
    }

    gameState.defeatedEnemyId = enemies.map((e) => e.originalId || e.id);
  } else if (player.hp <= 0) {
    gameState.battleResult = "defeat";
    gameState.battleLog.push("战斗失败...");
  }
};

export const processNextTurn = (
  gameState,
  calculatePlayerStatsFn,
  calculatePetStatsFn,
  handleBattleEndFn,
) => {
  if (!gameState.currentBattle) return;

  if (checkBattleEnd(gameState)) {
    handleBattleEndFn(gameState);
    return;
  }

  const playerStats = calculatePlayerStatsFn(gameState.player);
  const petStats = calculatePetStatsFn(gameState.pet);
  gameState.currentBattle.turnOrder = generateTurnOrder(
    gameState,
    playerStats,
    petStats,
  );
  gameState.currentBattle.currentTurnIndex = 0;

  executeTurnOrder(
    gameState,
    calculatePlayerStatsFn,
    calculatePetStatsFn,
    handleBattleEndFn,
    0,
  );
};

export const setPlayerDecision = (gameState, decision) => {
  if (!gameState.currentBattle || gameState.currentBattle.phase !== "command")
    return;

  gameState.currentBattle.playerDecision = decision;
  gameState.battleLog.push(`玩家已下达指令: ${getDecisionName(decision)}`);

  checkReadyToExecute(gameState);
};

export const setPetDecision = (gameState, decision) => {
  if (!gameState.currentBattle || gameState.currentBattle.phase !== "command")
    return;

  gameState.currentBattle.petDecision = decision;
  gameState.battleLog.push(`宠物已下达指令: ${getDecisionName(decision)}`);

  checkReadyToExecute(gameState);
};

export const isPlayerTurn = (gameState) => {
  if (!gameState.currentBattle) return false;
  if (gameState.currentBattle.phase === "command") return true;
  const currentActor = gameState.currentBattle.turnOrder[
    gameState.currentBattle.currentTurnIndex
  ];
  return currentActor && currentActor.type === "player";
};

export const isPetDecisionPhase = (gameState) => {
  if (!gameState.currentBattle) return false;
  if (gameState.currentBattle.phase !== "command") return false;
  if (!gameState.pet || !gameState.pet.active) return false;
  return gameState.currentBattle.playerDecision !== null &&
         gameState.currentBattle.petDecision === null;
};

export const getCurrentActorName = (gameState) => {
  if (!gameState.currentBattle) return null;
  const currentActor = gameState.currentBattle.turnOrder[
    gameState.currentBattle.currentTurnIndex
  ];
  return currentActor ? currentActor.name : null;
};
