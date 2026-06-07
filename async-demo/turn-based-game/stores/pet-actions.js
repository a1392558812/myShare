import { GAME_CONFIG, SKILLS_CONFIG, UI_CONFIG } from "./constants.js";
import { calculatePetStats, useItem } from "./player.js";
import { getRandomAliveEnemyIndex, applyBuff, getBuffMultiplier, applyDebuff, isTargetFrozen } from "./battle-utils.js";
import { calculateSkillCost, applyDamage } from "./utils.js";

export const petAttack = (gameState, targetIndex = 0) => {
  if (!gameState.currentBattle) return;

  const pet = gameState.pet;
  const enemies = gameState.currentBattle.enemies;
  let enemy = enemies[targetIndex];

  if (!pet || pet.hp <= 0) return;

  if (!enemy || enemy.hp <= 0) {
    const newTargetIndex = getRandomAliveEnemyIndex(enemies);
    if (newTargetIndex === -1) return;
    targetIndex = newTargetIndex;
    enemy = enemies[targetIndex];
    gameState.battleLog.push(`${pet.name}随机切换到 ${enemy.name}`);
  }

  // 检查目标是否被冰冻
  if (isTargetFrozen(gameState, enemy)) {
    gameState.battleLog.push(`${enemy.name} 被冰冻，无法受到伤害！`);
    return;
  }

  const petStats = calculatePetStats(pet);
  const critRateRaw = petStats.critRate || 0;
  const maxCritRate = GAME_CONFIG.CRIT.MAX_CRIT_RATE;
  const critRate = Math.min(critRateRaw, maxCritRate) / 100;

  const comboRateRaw = petStats.comboRate || 0;
  const maxComboRate = GAME_CONFIG.COMBO.MAX_COMBO_RATE;
  const physicalMultiplier = getBuffMultiplier(
    gameState.currentBattle.petBuffs,
    "physicalAttack",
  );
  const baseDamage = Math.max(
    1,
    petStats.physicalAttack * physicalMultiplier - enemy.defense,
  );
  const maxComboCount = Math.min(
    petStats.maxComboCount || 1,
    GAME_CONFIG.COMBO.MAX_COMBO_COUNT,
  );
  const comboProbDecay = GAME_CONFIG.COMBO.COMBO_PROB_DECAY;
  const comboDamageDecay = GAME_CONFIG.COMBO.COMBO_DAMAGE_DECAY;

  const isCrit = Math.random() < critRate;
  let damage = baseDamage;

  if (isCrit) {
    const critMultiplier = GAME_CONFIG.CRIT.CRIT_MULTIPLIER;
    damage = Math.floor(damage * critMultiplier);
  }

  applyDamage(enemy, damage);
  gameState.battleLog.push(
    `${pet.name} 使用普通攻击${isCrit ? "【暴击！】" : ""}，${enemy.name}受到 ${damage.toFixed(
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
      gameState.battleLog.push(
        `${enemy.name} 被冰冻，连击中无法继续造成伤害！`,
      );
      break;
    }

    const isCritCombo = Math.random() < critRate;
    let comboDamage = currentDamage;

    if (isCritCombo) {
      comboDamage = Math.floor(comboDamage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER);
    }
    comboDamage = Math.floor(comboDamage) || 1;
    applyDamage(enemy, comboDamage);
    gameState.battleLog.push(
      `【连击${comboCount + 1}】${isCritCombo ? "【暴击！】" : ""}${
        enemy.name
      }受到 ${comboDamage.toFixed(UI_CONFIG.DECIMAL_PLACES)} 点伤害`,
    );

    currentComboRate *= comboProbDecay;
    currentDamage *= comboDamageDecay;
  }

  if (comboCount > 0) {
    gameState.battleLog.push(`宠物连击结束！共连击 ${comboCount + 1} 次！`);
  }
};

export const petUseSkill = (
  gameState,
  skill,
  targetIndex = 0,
  targetType = "pet",
) => {
  if (!gameState.currentBattle) return;

  const pet = gameState.pet;
  const enemies = gameState.currentBattle.enemies;

  if (!pet || pet.hp <= 0) return;

  const skillCost = calculateSkillCost(skill, pet.level, true);

  if (pet.mp < skillCost) {
    gameState.battleLog.push(`${pet.name} 法力不足！`);
    petAttack(gameState, targetIndex);
    return;
  }

  pet.mp -= skillCost;

  if (skill.type === "magic") {
    petUseMagicSkill(gameState, skill, pet, enemies, targetIndex);
  } else if (skill.type.startsWith("heal_") || skill.type.startsWith("buff_")) {
    petUseSupportSkill(gameState, skill, pet, targetType);
  } else if (skill.type.startsWith("debuff_")) {
    petUseDebuffSkill(gameState, skill, pet, enemies, targetIndex);
  }
};

const petUseMagicSkill = (gameState, skill, pet, enemies, targetIndex) => {
  const petStats = calculatePetStats(pet);
  const critRateRaw = petStats.critRate || 0;
  const maxCritRate = GAME_CONFIG.CRIT.MAX_CRIT_RATE;
  const critRate = Math.min(critRateRaw, maxCritRate) / 100;

  const comboRateRaw = petStats.comboRate || 0;
  const maxComboRate = GAME_CONFIG.COMBO.MAX_COMBO_RATE;
  const maxComboCount = Math.min(
    petStats.maxComboCount || 1,
    GAME_CONFIG.COMBO.MAX_COMBO_COUNT,
  );
  const comboProbDecay = GAME_CONFIG.COMBO.COMBO_PROB_DECAY;
  const comboDamageDecay = GAME_CONFIG.COMBO.COMBO_DAMAGE_DECAY;

  const magicMultiplier = getBuffMultiplier(
    gameState.currentBattle.petBuffs,
    "magicAttack",
  );

  if (skill.targetType === "all") {
    const aliveEnemies = enemies.filter((e) => e.hp > 0);

    if (aliveEnemies.length === 0) return;

    gameState.battleLog.push(
      `${pet.name} 释放 ${skill.name}，对所有敌人发动攻击！`,
    );

    for (const enemy of aliveEnemies) {
      // 检查目标是否被冰冻
      if (isTargetFrozen(gameState, enemy)) {
        gameState.battleLog.push(`${enemy.name} 被冰冻，无法受到伤害！`);
        continue;
      }

      const baseDamage = Math.max(
        1,
        petStats.magicAttack * magicMultiplier + skill.damage - enemy.defense,
      );

      const isCrit = Math.random() < critRate;
      let damage = baseDamage;

      if (isCrit) {
        const critMultiplier = GAME_CONFIG.CRIT.CRIT_MULTIPLIER;
        damage = Math.floor(damage * critMultiplier);
      }

      applyDamage(enemy, damage);

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
          gameState.battleLog.push(
            `${enemy.name} 被冰冻，连击中无法继续造成伤害！`,
          );
          break;
        }

        const isCritCombo = Math.random() < critRate;
        let comboDamage = currentDamage;

        if (isCritCombo) {
          comboDamage = Math.floor(
            comboDamage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER,
          );
        }

        applyDamage(enemy, comboDamage);
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
      gameState.battleLog.push(
        `目标已死亡，${pet.name}随机切换到 ${enemy.name}`,
      );
    }

    // 检查目标是否被冰冻
    if (isTargetFrozen(gameState, enemy)) {
      gameState.battleLog.push(`${enemy.name} 被冰冻，无法受到伤害！`);
      return;
    }

    const baseDamage = Math.max(
      1,
      petStats.magicAttack * magicMultiplier + skill.damage - enemy.defense,
    );

    const isCrit = Math.random() < critRate;
    let damage = baseDamage;

    if (isCrit) {
      const critMultiplier = GAME_CONFIG.CRIT.CRIT_MULTIPLIER;
      damage = Math.floor(damage * critMultiplier);
    }

    applyDamage(enemy, damage);

    gameState.battleLog.push(
      `${pet.name} 释放 ${skill.name}${isCrit ? "【暴击！】" : ""}，${enemy.name}受到 ${damage.toFixed(
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
        gameState.battleLog.push(
          `${enemy.name} 被冰冻，连击中无法继续造成伤害！`,
        );
        break;
      }

      const isCritCombo = Math.random() < critRate;
      let comboDamage = currentDamage;

      if (isCritCombo) {
        comboDamage = Math.floor(
          comboDamage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER,
        );
      }

      applyDamage(enemy, comboDamage);
      gameState.battleLog.push(
        `【连击${comboCount + 1}】${skill.name}${isCritCombo ? "【暴击！】" : ""}${
          enemy.name
        }受到 ${comboDamage.toFixed(UI_CONFIG.DECIMAL_PLACES)} 点伤害`,
      );

      currentComboRate *= comboProbDecay;
      currentDamage *= comboDamageDecay;
    }

    if (comboCount > 0) {
      gameState.battleLog.push(`${pet.name}的连击结束！共连击 ${comboCount + 1} 次！`);
    }
  }
};

const petUseSupportSkill = (gameState, skill, pet, targetType = "pet") => {
  const player = gameState.player;

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
  const applyBuffToTarget = (
    t,
    buffType,
    buffStatType,
    buffValue,
    extraData = {},
  ) => {
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
    const target = targetType === "player" ? player : pet;
    applyHealToTarget(target);
    applyBuffToTarget(target, "heal", "heal", 1, {
      healPercent: skill.healPercent || 0.15,
      manaPercent: skill.manaPercent || 0.1,
    });
  } else if (skill.type === "heal_all") {
    // 群体治疗 - 只治疗存活的目标
    if (pet && pet.active && pet.hp > 0) {
      applyHealToTarget(pet);
      applyBuffToTarget(pet, "heal", "heal", 1, {
        healPercent: skill.healPercent || 0.1,
        manaPercent: skill.manaPercent || 0.08,
      });
    }
    if (player && player.hp > 0) {
      applyHealToTarget(player);
      applyBuffToTarget(player, "heal", "heal", 1, {
        healPercent: skill.healPercent || 0.1,
        manaPercent: skill.manaPercent || 0.08,
      });
    }
  } else if (skill.type === "buff_attack_single") {
    // 单体强化 - 对指定目标施BUFF，不检查血量状态
    const target = targetType === "player" ? player : pet;
    const targetName = target === player ? "你" : target.name;
    gameState.battleLog.push(
      `${pet.name} 使用 ${skill.name}，${targetName} 物理攻击 x${skill.physicalMultiplier}，法术攻击 x${skill.magicMultiplier}！`,
    );
    applyBuffToTarget(
      target,
      "physicalAttack",
      "physicalAttack",
      skill.physicalMultiplier,
    );
    applyBuffToTarget(
      target,
      "magicAttack",
      "magicAttack",
      skill.magicMultiplier,
    );
  } else if (skill.type === "buff_attack_all") {
    // 群体强化 - 只给存活的目标施BUFF
    gameState.battleLog.push(
      `${pet.name} 使用 ${skill.name}，己方物理攻击 x${skill.physicalMultiplier}，法术攻击 x${skill.magicMultiplier}！`,
    );
    if (pet && pet.active && pet.hp > 0) {
      applyBuffToTarget(
        pet,
        "physicalAttack",
        "physicalAttack",
        skill.physicalMultiplier,
      );
      applyBuffToTarget(
        pet,
        "magicAttack",
        "magicAttack",
        skill.magicMultiplier,
      );
    }
    if (player && player.hp > 0) {
      applyBuffToTarget(
        player,
        "physicalAttack",
        "physicalAttack",
        skill.physicalMultiplier,
      );
      applyBuffToTarget(
        player,
        "magicAttack",
        "magicAttack",
        skill.magicMultiplier,
      );
    }
  } else if (skill.type === "buff_defense_single") {
    // 单体防御 - 对指定目标施BUFF，不检查血量状态
    const target = targetType === "player" ? player : pet;
    const targetName = target === player ? "你" : target.name;
    gameState.battleLog.push(
      `${pet.name} 使用 ${skill.name}，${targetName} 防御力 x${skill.defenseMultiplier}！`,
    );
    applyBuffToTarget(target, "defense", "defense", skill.defenseMultiplier);
  } else if (skill.type === "buff_defense_all") {
    // 群体防御 - 只给存活的目标施BUFF
    gameState.battleLog.push(
      `${pet.name} 使用 ${skill.name}，己方防御力 x${skill.defenseMultiplier}！`,
    );
    if (pet && pet.active && pet.hp > 0) {
      applyBuffToTarget(pet, "defense", "defense", skill.defenseMultiplier);
    }
    if (player && player.hp > 0) {
      applyBuffToTarget(player, "defense", "defense", skill.defenseMultiplier);
    }
  } else if (skill.type === "buff_speed_single") {
    // 单体敏捷 - 对指定目标施BUFF，不检查血量状态
    const target = targetType === "player" ? player : pet;
    const targetName = target === player ? "你" : target.name;
    gameState.battleLog.push(
      `${pet.name} 使用 ${skill.name}，${targetName} 速度 x${skill.speedMultiplier}！`,
    );
    applyBuffToTarget(target, "speed", "speed", skill.speedMultiplier);
  } else if (skill.type === "buff_speed_all") {
    // 群体敏捷 - 只给存活的目标施BUFF
    gameState.battleLog.push(
      `${pet.name} 使用 ${skill.name}，己方速度 x${skill.speedMultiplier}！`,
    );
    if (pet && pet.active && pet.hp > 0) {
      applyBuffToTarget(pet, "speed", "speed", skill.speedMultiplier);
    }
    if (player && player.hp > 0) {
      applyBuffToTarget(player, "speed", "speed", skill.speedMultiplier);
    }
  }
};

const petUseDebuffSkill = (gameState, skill, pet, enemies, targetIndex) => {
  const aliveEnemies = enemies.filter((e) => e.hp > 0);

  if (aliveEnemies.length === 0) {
    gameState.battleLog.push("没有存活的敌人可以施加debuff！");
    return;
  }

  if (skill.type.endsWith("_single")) {
    const target = aliveEnemies[targetIndex] || aliveEnemies[0];
    // 从原始敌人数组中找到对应的敌人对象，确保引用正确
    const originalEnemy = gameState.currentBattle.enemies.find(
      (e) => e.id === target.id,
    );
    if (originalEnemy) {
      applyDebuff(gameState, originalEnemy, skill, pet.name, "pet");
    } else {
      applyDebuff(gameState, target, skill, pet.name, "pet");
    }
  } else if (skill.type.endsWith("_all")) {
    const targetCount = Math.min(skill.targetCount || 3, aliveEnemies.length);
    const shuffled = [...aliveEnemies].sort(() => Math.random() - 0.5);

    for (let i = 0; i < targetCount; i++) {
      // 从原始敌人数组中找到对应的敌人对象，确保引用正确
      const originalEnemy = gameState.currentBattle.enemies.find(
        (e) => e.id === shuffled[i].id,
      );
      if (originalEnemy) {
        applyDebuff(gameState, originalEnemy, skill, pet.name, "pet");
      } else {
        applyDebuff(gameState, shuffled[i], skill, pet.name, "pet");
      }
    }
  }
};

const getRestoreTypeText = (item, result) => {
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

export const executePetDecision = (gameState, decision) => {
  const pet = gameState.pet;
  const enemies = gameState.currentBattle.enemies;
  const player = gameState.player;

  switch (decision.type) {
    case "attack":
      petAttack(gameState, decision.targetIndex);
      break;
    case "skill":
      const petSkillCost = calculateSkillCost(decision.skill, pet.level, true);
      if (decision.skill && pet.mp >= petSkillCost) {
        petUseSkill(
          gameState,
          decision.skill,
          decision.targetIndex,
          decision.targetType,
        );
      } else {
        gameState.battleLog.push(`${pet.name} 法力不足，改为普通攻击！`);
        petAttack(gameState, decision.targetIndex);
      }
      break;
    case "defend":
      gameState.battleLog.push(`${pet.name} 进入防御姿态！`);
      break;
    case "item":
      if (decision.item && decision.targetType) {
        let target;
        let targetName;

        if (decision.targetType === "pet" && pet.hp > 0) {
          target = pet;
          targetName = pet.name;
        } else {
          target = player;
          targetName = "玩家";
        }

        // 检查目标是否被冰冻（冰冻状态下无法被治疗）
        if (
          decision.item.type.startsWith("heal") ||
          decision.item.type.startsWith("mana") ||
          decision.item.type.startsWith("percent")
        ) {
          if (isTargetFrozen(gameState, target)) {
            gameState.battleLog.push(`${targetName} 被冰冻，无法被治疗！`);
            break;
          }
        }

        const result = useItem(
          target,
          decision.item,
          decision.itemIndex,
          player,
        );

        if (result.success) {
          const restoreTypeText = getRestoreTypeText(decision.item, result);
          gameState.battleLog.push(
            `${pet.name} 使用 ${decision.item.name}，${targetName}${restoreTypeText}`,
          );
        } else {
          gameState.battleLog.push(`${pet.name} 使用道具失败！`);
        }
      }
      break;
  }
};
