import { GAME_CONFIG, SKILLS_CONFIG, UI_CONFIG } from "./constants.js";
import { calculatePlayerStats, useItem } from "./player.js";
import { getRandomAliveEnemyIndex, applyBuff, getBuffMultiplier, applyDebuff, isTargetFrozen } from "./battle-utils.js";
import { calculateSkillCost } from "./utils.js";

export const playerAttack = (gameState, targetIndex = 0) => {
  if (!gameState.currentBattle) return;

  const player = gameState.player;
  const enemies = gameState.currentBattle.enemies;
  let enemy = enemies[targetIndex];

  if (!enemy || enemy.hp <= 0) {
    const newTargetIndex = getRandomAliveEnemyIndex(enemies);
    if (newTargetIndex === -1) return;
    targetIndex = newTargetIndex;
    enemy = enemies[targetIndex];
    gameState.battleLog.push(`目标已死亡，随机切换到 ${enemy.name}`);
  }

  // 检查目标是否被冰冻
  if (isTargetFrozen(gameState, enemy)) {
    gameState.battleLog.push(`${enemy.name} 被冰冻，无法受到伤害！`);
    return;
  }

  const playerStats = calculatePlayerStats(player);
  const critRateRaw = playerStats.critRate || 0;
  const maxCritRate = GAME_CONFIG.CRIT.MAX_CRIT_RATE;
  const critRate = Math.min(critRateRaw, maxCritRate) / 100;

  const comboRateRaw = playerStats.comboRate || 0;
  const maxComboRate = GAME_CONFIG.COMBO.MAX_COMBO_RATE;
  const maxComboCount = Math.min(
    playerStats.maxComboCount || 1,
    GAME_CONFIG.COMBO.MAX_COMBO_COUNT,
  );
  const comboProbDecay = GAME_CONFIG.COMBO.COMBO_PROB_DECAY;
  const comboDamageDecay = GAME_CONFIG.COMBO.COMBO_DAMAGE_DECAY;

  const physicalMultiplier = getBuffMultiplier(gameState.currentBattle.playerBuffs, "physicalAttack");
  let baseDamage = Math.max(1, playerStats.physicalAttack * physicalMultiplier - enemy.defense);
  const isCrit = Math.random() < critRate;
  let damage = baseDamage;

  if (isCrit) {
    const critMultiplier = GAME_CONFIG.CRIT.CRIT_MULTIPLIER;
    damage = Math.floor(damage * critMultiplier);
  }

  enemy.hp -= Math.floor(damage);
  gameState.battleLog.push(
    `你 使用普通攻击${isCrit ? "【暴击！】" : ""}，${enemy.name}受到 ${damage.toFixed(
      UI_CONFIG.DECIMAL_PLACES,
    )} 点伤害`,
  );

  let comboCount = 0;
  let currentComboRate = Math.min(comboRateRaw, maxComboRate) / 100;
  let currentDamage = baseDamage * comboDamageDecay;

  while (comboCount < maxComboCount - 1 && Math.random() < currentComboRate) {
    comboCount++;
    if (enemy.hp <= 0) break;
    
    // 检查目标是否在连击中被打成冰冻
    if (isTargetFrozen(gameState, enemy)) {
      gameState.battleLog.push(`${enemy.name} 被冰冻，连击中无法继续造成伤害！`);
      break;
    }

    const isCritCombo = Math.random() < critRate;
    let comboDamage = currentDamage;

    if (isCritCombo) {
      comboDamage = Math.floor(comboDamage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER);
    }
    comboDamage = Math.floor(comboDamage) || 1;
    enemy.hp -= comboDamage;
    gameState.battleLog.push(
      `【连击${comboCount + 1}】${isCritCombo ? "【暴击！】" : ""}${enemy.name}受到 ${comboDamage.toFixed(
        UI_CONFIG.DECIMAL_PLACES,
      )} 点伤害`,
    );

    currentComboRate *= comboProbDecay;
    currentDamage *= comboDamageDecay;
  }

  if (comboCount > 0) {
    gameState.battleLog.push(`连击结束！共连击 ${comboCount + 1} 次！`);
  }
};

export const playerUseSkill = (gameState, skill, targetIndex = 0, targetType = "player") => {
  if (!gameState.currentBattle) return;

  const player = gameState.player;
  const enemies = gameState.currentBattle.enemies;
  
  const skillCost = calculateSkillCost(skill, player.level, false);

  if (player.mp < skillCost) {
    gameState.battleLog.push("蓝量不足，无法释放技能！");
    return;
  }

  player.mp -= skillCost;

  if (skill.type === "magic") {
    playerUseMagicSkill(gameState, skill, player, enemies, targetIndex);
  } else if (skill.type.startsWith("heal_") || skill.type.startsWith("buff_")) {
    playerUseSupportSkill(gameState, skill, player, targetType);
  } else if (skill.type.startsWith("debuff_")) {
    playerUseDebuffSkill(gameState, skill, player, enemies, targetIndex);
  }
};

const playerUseMagicSkill = (gameState, skill, player, enemies, targetIndex) => {
  const playerStats = calculatePlayerStats(player);
  const critRateRaw = playerStats.critRate || 0;
  const maxCritRate = GAME_CONFIG.CRIT.MAX_CRIT_RATE;
  const critRate = Math.min(critRateRaw, maxCritRate) / 100;

  const comboRateRaw = playerStats.comboRate || 0;
  const maxComboRate = GAME_CONFIG.COMBO.MAX_COMBO_RATE;
  const maxComboCount = Math.min(
    playerStats.maxComboCount || 1,
    GAME_CONFIG.COMBO.MAX_COMBO_COUNT,
  );
  const comboProbDecay = GAME_CONFIG.COMBO.COMBO_PROB_DECAY;
  const comboDamageDecay = GAME_CONFIG.COMBO.COMBO_DAMAGE_DECAY;

  const magicMultiplier = getBuffMultiplier(gameState.currentBattle.playerBuffs, "magicAttack");

  if (skill.targetType === "all") {
    const aliveEnemies = enemies.filter((e) => e.hp > 0);

    if (aliveEnemies.length === 0) return;

    gameState.battleLog.push(`你 释放 ${skill.name}，对所有敌人发动攻击！`);

    for (const enemy of aliveEnemies) {
      // 检查目标是否被冰冻
      if (isTargetFrozen(gameState, enemy)) {
        gameState.battleLog.push(`${enemy.name} 被冰冻，无法受到伤害！`);
        continue;
      }
      
      const baseDamage = Math.max(
        1,
        playerStats.magicAttack * magicMultiplier + skill.damage - enemy.defense,
      );

      const isCrit = Math.random() < critRate;
      let damage = baseDamage;

      if (isCrit) {
        const critMultiplier = GAME_CONFIG.CRIT.CRIT_MULTIPLIER;
        damage = Math.floor(damage * critMultiplier);
      }

      enemy.hp -= Math.floor(damage);

      gameState.battleLog.push(
        `${skill.name}${isCrit ? "【暴击！】" : ""}，${enemy.name}受到 ${damage.toFixed(
          UI_CONFIG.DECIMAL_PLACES,
        )} 点伤害`,
      );

      let comboCount = 0;
      let currentComboRate = Math.min(comboRateRaw, maxComboRate) / 100;
      let currentDamage = baseDamage * comboDamageDecay;

      while (
        comboCount < maxComboCount - 1 &&
        Math.random() < currentComboRate
      ) {
        comboCount++;
        if (enemy.hp <= 0) break;
        
        // 检查目标是否在连击中被打成冰冻
        if (isTargetFrozen(gameState, enemy)) {
          gameState.battleLog.push(`${enemy.name} 被冰冻，连击中无法继续造成伤害！`);
          break;
        }

        const isCritCombo = Math.random() < critRate;
        let comboDamage = currentDamage;

        if (isCritCombo) {
          comboDamage = Math.floor(
            comboDamage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER,
          );
        }

        enemy.hp -= Math.floor(comboDamage);
        gameState.battleLog.push(
          `【连击${comboCount + 1}】${skill.name}${isCritCombo ? "【暴击！】" : ""}，${
            enemy.name
          }受到 ${comboDamage.toFixed(UI_CONFIG.DECIMAL_PLACES)} 点伤害`,
        );

        currentComboRate *= comboProbDecay;
        currentDamage *= comboDamageDecay;
      }

      if (comboCount > 0) {
        gameState.battleLog.push(
          `${enemy.name}的连击结束！共连击 ${comboCount + 1} 次！`,
        );
      }
    }
  } else {
    let enemy = enemies[targetIndex];

    if (!enemy || enemy.hp <= 0) {
      const newTargetIndex = getRandomAliveEnemyIndex(enemies);
      if (newTargetIndex === -1) return;
      targetIndex = newTargetIndex;
      enemy = enemies[targetIndex];
      gameState.battleLog.push(`目标已死亡，随机切换到 ${enemy.name}`);
    }

    // 检查目标是否被冰冻
    if (isTargetFrozen(gameState, enemy)) {
      gameState.battleLog.push(`${enemy.name} 被冰冻，无法受到伤害！`);
      return;
    }

    const baseDamage = Math.max(
      1,
      playerStats.magicAttack * magicMultiplier + skill.damage - enemy.defense,
    );

    const isCrit = Math.random() < critRate;
    let damage = baseDamage;

    if (isCrit) {
      const critMultiplier = GAME_CONFIG.CRIT.CRIT_MULTIPLIER;
      damage = Math.floor(damage * critMultiplier);
    }

    enemy.hp -= Math.floor(damage);

    gameState.battleLog.push(
      `你 释放 ${skill.name}${isCrit ? "【暴击！】" : ""}，${enemy.name}受到 ${damage.toFixed(
        UI_CONFIG.DECIMAL_PLACES,
      )} 点伤害`,
    );

    let comboCount = 0;
    let currentComboRate = Math.min(comboRateRaw, maxComboRate) / 100;
    let currentDamage = baseDamage * comboDamageDecay;

    while (comboCount < maxComboCount - 1 && Math.random() < currentComboRate) {
      comboCount++;
      if (enemy.hp <= 0) break;
      
      // 检查目标是否在连击中被打成冰冻
      if (isTargetFrozen(gameState, enemy)) {
        gameState.battleLog.push(`${enemy.name} 被冰冻，连击中无法继续造成伤害！`);
        break;
      }

      const isCritCombo = Math.random() < critRate;
      let comboDamage = currentDamage;

      if (isCritCombo) {
        comboDamage = Math.floor(
          comboDamage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER,
        );
      }

      enemy.hp -= Math.floor(comboDamage);
      gameState.battleLog.push(
        `【连击${comboCount + 1}】${skill.name}${isCritCombo ? "【暴击！】" : ""}${
          enemy.name
        }受到 ${comboDamage.toFixed(UI_CONFIG.DECIMAL_PLACES)} 点伤害`,
      );

      currentComboRate *= comboProbDecay;
      currentDamage *= comboDamageDecay;
    }

    if (comboCount > 0) {
      gameState.battleLog.push(`连击结束！共连击 ${comboCount + 1} 次！`);
    }
  }
};

const playerUseSupportSkill = (gameState, skill, player, targetType = "player") => {
  const pet = gameState.pet;

  // 处理治疗技能
  const applyHealToTarget = (t) => {
    if (!t) return;
    
    // 检查目标是否被冰冻（冰冻状态下无法被治疗）
    if (isTargetFrozen(gameState, t)) {
      const targetName = t === player ? "你" : t.name;
      gameState.battleLog.push(`${targetName} 被冰冻，无法被治疗！`);
      return;
    }
    
    const healAmount = Math.floor(t.maxHp * skill.healPercent);
    const manaAmount = Math.floor(t.maxMp * skill.manaPercent);
    t.hp = Math.min(t.maxHp, t.hp + healAmount);
    t.mp = Math.min(t.maxMp, t.mp + manaAmount);
    gameState.battleLog.push(
      `${t === player ? "你" : t.name} 恢复了 ${healAmount} HP 和 ${manaAmount} MP！`,
    );
  };

  // 处理增益Buff
  const applyBuffToTarget = (t, buffType, buffStatType, buffValue, extraData = {}) => {
    if (!t) return;
    const targetKey = t === player ? "player" : "pet";
    applyBuff(gameState, targetKey, {
      name: skill.name,
      type: buffType,
      statType: buffStatType,
      value: buffValue,
      remainingTurns: skill.duration,
      ...extraData,
    });
  };

  if (skill.type === "heal_single") {
    // 单体治疗 - 对指定目标治疗，不检查血量状态
    const target = targetType === "pet" && pet ? pet : player;
    applyHealToTarget(target);
    applyBuffToTarget(target, "heal", "heal", 1, {
      healPercent: skill.healPercent || 0.15,
      manaPercent: skill.manaPercent || 0.1,
    });
  } else if (skill.type === "heal_all") {
    // 群体治疗 - 只治疗存活的目标
    if (player && player.hp > 0) {
      applyHealToTarget(player);
      applyBuffToTarget(player, "heal", "heal", 1, {
        healPercent: skill.healPercent || 0.1,
        manaPercent: skill.manaPercent || 0.08,
      });
    }
    if (pet && pet.active && pet.hp > 0) {
      applyHealToTarget(pet);
      applyBuffToTarget(pet, "heal", "heal", 1, {
        healPercent: skill.healPercent || 0.1,
        manaPercent: skill.manaPercent || 0.08,
      });
    }
  } else if (skill.type === "buff_attack_single") {
    // 单体强化 - 对指定目标施BUFF，不检查血量状态
    const target = targetType === "pet" && pet ? pet : player;
    const targetName = target === player ? "你" : target.name;
    gameState.battleLog.push(`你 使用 ${skill.name}，${targetName} 物理攻击 x${skill.physicalMultiplier}，法术攻击 x${skill.magicMultiplier}！`);
    applyBuffToTarget(target, "physicalAttack", "physicalAttack", skill.physicalMultiplier);
    applyBuffToTarget(target, "magicAttack", "magicAttack", skill.magicMultiplier);
  } else if (skill.type === "buff_attack_all") {
    // 群体强化 - 只给存活的目标施BUFF
    gameState.battleLog.push(`你 使用 ${skill.name}，己方物理攻击 x${skill.physicalMultiplier}，法术攻击 x${skill.magicMultiplier}！`);
    if (player && player.hp > 0) {
      applyBuffToTarget(player, "physicalAttack", "physicalAttack", skill.physicalMultiplier);
      applyBuffToTarget(player, "magicAttack", "magicAttack", skill.magicMultiplier);
    }
    if (pet && pet.active && pet.hp > 0) {
      applyBuffToTarget(pet, "physicalAttack", "physicalAttack", skill.physicalMultiplier);
      applyBuffToTarget(pet, "magicAttack", "magicAttack", skill.magicMultiplier);
    }
  } else if (skill.type === "buff_defense_single") {
    // 单体防御 - 对指定目标施BUFF，不检查血量状态
    const target = targetType === "pet" && pet ? pet : player;
    const targetName = target === player ? "你" : target.name;
    gameState.battleLog.push(`你 使用 ${skill.name}，${targetName} 防御力 x${skill.defenseMultiplier}！`);
    applyBuffToTarget(target, "defense", "defense", skill.defenseMultiplier);
  } else if (skill.type === "buff_defense_all") {
    // 群体防御 - 只给存活的目标施BUFF
    gameState.battleLog.push(`你 使用 ${skill.name}，己方防御力 x${skill.defenseMultiplier}！`);
    if (player && player.hp > 0) {
      applyBuffToTarget(player, "defense", "defense", skill.defenseMultiplier);
    }
    if (pet && pet.active && pet.hp > 0) {
      applyBuffToTarget(pet, "defense", "defense", skill.defenseMultiplier);
    }
  } else if (skill.type === "buff_speed_single") {
    // 单体敏捷 - 对指定目标施BUFF，不检查血量状态
    const target = targetType === "pet" && pet ? pet : player;
    const targetName = target === player ? "你" : target.name;
    gameState.battleLog.push(`你 使用 ${skill.name}，${targetName} 速度 x${skill.speedMultiplier}！`);
    applyBuffToTarget(target, "speed", "speed", skill.speedMultiplier);
  } else if (skill.type === "buff_speed_all") {
    // 群体敏捷 - 只给存活的目标施BUFF
    gameState.battleLog.push(`你 使用 ${skill.name}，己方速度 x${skill.speedMultiplier}！`);
    if (player && player.hp > 0) {
      applyBuffToTarget(player, "speed", "speed", skill.speedMultiplier);
    }
    if (pet && pet.active && pet.hp > 0) {
      applyBuffToTarget(pet, "speed", "speed", skill.speedMultiplier);
    }
  }
};

const playerUseDebuffSkill = (gameState, skill, player, enemies, targetIndex) => {
  const aliveEnemies = enemies.filter(e => e.hp > 0);
  
  if (aliveEnemies.length === 0) {
    gameState.battleLog.push("没有存活的敌人可以施加debuff！");
    return;
  }
  
  if (skill.type.endsWith("_single")) {
    const target = aliveEnemies[targetIndex] || aliveEnemies[0];
    // 从原始敌人数组中找到对应的敌人对象，确保引用正确
    const originalEnemy = gameState.currentBattle.enemies.find(e => e.id === target.id);
    if (originalEnemy) {
      applyDebuff(gameState, originalEnemy, skill, "你", "player");
    } else {
      applyDebuff(gameState, target, skill, "你", "player");
    }
  } else if (skill.type.endsWith("_all")) {
    const targetCount = Math.min(skill.targetCount || 3, aliveEnemies.length);
    const shuffled = [...aliveEnemies].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < targetCount; i++) {
      // 从原始敌人数组中找到对应的敌人对象，确保引用正确
      const originalEnemy = gameState.currentBattle.enemies.find(e => e.id === shuffled[i].id);
      if (originalEnemy) {
        applyDebuff(gameState, originalEnemy, skill, "你", "player");
      } else {
        applyDebuff(gameState, shuffled[i], skill, "你", "player");
      }
    }
  }
};

export const playerDefend = (gameState) => {
  gameState.currentBattle.playerDefending = true;
  gameState.battleLog.push("你 进入防御姿态！");
};

export const playerFlee = (gameState) => {
  const playerLevel = gameState.player.level;
  const enemies = gameState.currentBattle.enemies;
  const avgEnemyLevel =
    enemies.reduce((sum, e) => sum + e.level, 0) / enemies.length;

  let fleeChance = 0.5;
  if (playerLevel > avgEnemyLevel) {
    fleeChance = 0.8;
  } else if (playerLevel < avgEnemyLevel) {
    fleeChance = 0.2;
  }

  if (Math.random() < fleeChance) {
    gameState.battleLog.push("你成功逃跑了！");
    gameState.currentBattle = null;
    gameState.screen = "map";
    gameState.battleResult = "flee";
  } else {
    gameState.battleLog.push("逃跑失败！");
  }
};

const getPlayerRestoreTypeText = (item, result) => {
  switch (item.type) {
    case "heal":
    case "percentHeal":
      return `恢复了 ${result.amount} 点HP`;
    case "mana":
    case "percentMana":
      return `恢复了 ${result.amount} 点MP`;
    case "percentBoth":
      const half = Math.floor(result.amount / 2);
      return `恢复了 ${half} 点HP和 ${half} 点MP`;
    default:
      return `恢复了 ${result.amount} 点`;
  }
};

export const executePlayerDecision = (gameState, decision) => {
  const enemies = gameState.currentBattle.enemies;
  const player = gameState.player;
  const pet = gameState.pet;

  switch (decision.type) {
    case "attack":
      playerAttack(gameState, decision.targetIndex);
      break;
    case "skill":
      playerUseSkill(gameState, decision.skill, decision.targetIndex, decision.targetType);
      break;
    case "defend":
      playerDefend(gameState);
      break;
    case "flee":
      playerFlee(gameState);
      break;
    case "item":
      let target;
      let targetName;

      if (
        decision.targetType === "pet" &&
        pet &&
        pet.active &&
        pet.hp > 0
      ) {
        target = pet;
        targetName = pet.name;
      } else {
        target = player;
        targetName = "你";
      }

      // 检查目标是否被冰冻（冰冻状态下无法被治疗）
      if (decision.item.type.startsWith("heal") || 
          decision.item.type.startsWith("mana") || 
          decision.item.type.startsWith("percent")) {
        if (isTargetFrozen(gameState, target)) {
          gameState.battleLog.push(`${targetName} 被冰冻，无法被治疗！`);
          break;
        }
      }

      const result = useItem(target, decision.item, decision.index, player);

      if (result.success) {
        const restoreTypeText = getPlayerRestoreTypeText(decision.item, result);
        gameState.battleLog.push(
          `你 使用 ${decision.item.name}，${targetName}${restoreTypeText}`,
        );
      }
      break;
  }
};