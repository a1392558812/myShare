import { GAME_CONFIG, SKILLS_CONFIG, UI_CONFIG } from "./constants.js";
import { calculatePlayerStats, calculatePetStats } from "./player.js";
import { aiConfig, applyDebuff, isTargetFrozen } from "./battle-utils.js";
import { applyUnshakableMountainLimit, checkDodge } from "./utils.js";

export const performEnemyAttack = (gameState, enemy, isConfused = false) => {
  const player = gameState.player;
  const pet = gameState.pet;
  const playerStats = calculatePlayerStats(player);
  const petStats = calculatePetStats(pet);

  let target;
  let targetType;
  let targetStats;
  let defending = false;

  const enemies = gameState.currentBattle.enemies;
  const aliveAllies = enemies.filter(e => e.hp > 0 && e.id !== enemy.id);
  
  // 选择目标函数：如果目标死亡，则选择其他存活目标
  const selectTarget = () => {
    let selectedTarget;
    let selectedType;
    let selectedStats;
    let isDefending = false;
    
    if (isConfused) {
      // 混乱状态：随机选择目标（不分敌我）
      const allTargets = [];
      if (player.hp > 0) allTargets.push({ target: player, type: "player", stats: playerStats });
      if (pet && pet.active && pet.hp > 0) allTargets.push({ target: pet, type: "pet", stats: petStats });
      aliveAllies.forEach(ally => {
        allTargets.push({
          target: ally,
          type: "enemy",
          stats: {
            physicalAttack: ally.physicalAttack,
            magicAttack: ally.magicAttack,
            defense: ally.defense,
          }
        });
      });
      
      if (allTargets.length > 0) {
        const randomTarget = allTargets[Math.floor(Math.random() * allTargets.length)];
        selectedTarget = randomTarget.target;
        selectedType = randomTarget.type;
        selectedStats = randomTarget.stats;
        if (selectedType === "enemy") {
          gameState.battleLog.push(`${enemy.name} 混乱中攻击了友方 ${selectedTarget.name}！`);
        }
      } else {
        // 没有目标时直接返回
        return null;
      }
    } else {
      // 正常状态：优先选择宠物，如果宠物死亡则选择玩家
      if (pet && pet.active && pet.hp > 0 && Math.random() < 0.6) {
        selectedTarget = pet;
        selectedType = "pet";
        selectedStats = petStats;
      } else if (player.hp > 0) {
        selectedTarget = player;
        selectedType = "player";
        selectedStats = playerStats;
        isDefending = gameState.currentBattle.playerDefending;
      } else if (pet && pet.active && pet.hp > 0) {
        // 玩家死亡，选择宠物
        selectedTarget = pet;
        selectedType = "pet";
        selectedStats = petStats;
      } else {
        // 都死亡了，没有目标
        return null;
      }
    }
    
    return {
      target: selectedTarget,
      type: selectedType,
      stats: selectedStats,
      defending: isDefending,
    };
  };
  
  // 选择目标
  const selected = selectTarget();
  if (!selected) return;
  target = selected.target;
  targetType = selected.type;
  targetStats = selected.stats;
  defending = selected.defending;

  const hasSkills = enemy.skills && enemy.skills.length > 0;

  if (isConfused) {
    // 混乱状态下随机使用物理攻击或法术攻击
    enemyUseConfusedAttack(gameState, enemy, target, targetType, targetStats, defending, pet);
  } else if (hasSkills && Math.random() < 0.5) {
    const skillId = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
    const skill = SKILLS_CONFIG.find((s) => s.id === skillId);
    const mapLevel = gameState.mapLevel || 1;

    if (skill) {
      const isSupportSkill = skill.type.startsWith("heal_") || skill.type.startsWith("buff_");
      const isDebuffSkill = skill.type.startsWith("debuff_");
      
      // 根据地图等级判断是否使用技能
      const canUseSupportSkill = mapLevel > 5;
      const canUseDebuffSkill = mapLevel > 8;

      if (isSupportSkill && canUseSupportSkill) {
        enemyUseSupportSkill(gameState, enemy, skill, pet);
      } else if (isDebuffSkill && canUseDebuffSkill) {
        enemyUseDebuffSkill(gameState, enemy, skill, target, targetType, pet);
      } else if (!isSupportSkill && !isDebuffSkill) {
        enemyUseAttackSkill(gameState, enemy, skill, target, targetType, targetStats, defending, pet);
      } else {
        // 地图等级不足时使用普通攻击
        enemyUseNormalAttack(gameState, enemy, target, targetType, targetStats, defending, pet);
      }
    }
  } else {
    enemyUseNormalAttack(gameState, enemy, target, targetType, targetStats, defending, pet);
  }
};

const enemyUseConfusedAttack = (gameState, enemy, target, targetType, targetStats, defending, pet) => {
  // 混乱状态：随机使用物理攻击或法术攻击
  const useMagic = Math.random() < 0.5;
  const magicSkills = enemy.skills ? enemy.skills.filter(skillId => {
    const skill = SKILLS_CONFIG.find(s => s.id === skillId);
    return skill && skill.type === "magic";
  }) : [];

  if (useMagic && magicSkills.length > 0) {
    // 随机选择一个法术攻击技能
    const randomMagicSkillId = magicSkills[Math.floor(Math.random() * magicSkills.length)];
    const magicSkill = SKILLS_CONFIG.find(s => s.id === randomMagicSkillId);
    if (magicSkill) {
      // 消耗法力（法力不足时仍可使用但不扣法力）
      const manaCost = magicSkill.cost || 0;
      if (enemy.mp > 0) {
        enemy.mp = Math.max(0, enemy.mp - manaCost);
      }
      enemyUseAttackSkill(gameState, enemy, magicSkill, target, targetType, targetStats, defending, pet);
      return;
    }
  }
  // 未选择法术攻击时使用普通物理攻击
  enemyUseNormalAttack(gameState, enemy, target, targetType, targetStats, defending, pet);
};

const enemyUseDebuffSkill = (gameState, enemy, skill, target, targetType, pet) => {
  gameState.battleLog.push(`${enemy.name} 使用了 ${skill.name}！`);

  if (skill.type.endsWith("_single")) {
    applyDebuff(gameState, target, skill, enemy.name, "enemy");
  } else if (skill.type.endsWith("_all")) {
    // 障碍技能始终作用于玩家和宠物
    const aliveTargets = [gameState.player, pet].filter(t => t && t.hp > 0);
    
    const targetCount = Math.min(skill.targetCount || 3, aliveTargets.length);
    const shuffled = [...aliveTargets].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < targetCount; i++) {
      applyDebuff(gameState, shuffled[i], skill, enemy.name, "enemy");
    }
  }
};

const enemyUseSupportSkill = (gameState, enemy, skill, pet) => {
  // 检查敌人是否被冰冻（冰冻状态下无法使用支持技能）
  if (isTargetFrozen(gameState, enemy)) {
    gameState.battleLog.push(`${enemy.name} 被冰冻，无法使用 ${skill.name}！`);
    return;
  }
  
  gameState.battleLog.push(`${enemy.name} 使用了 ${skill.name}！`);

  const enemies = gameState.currentBattle.enemies;
  const aliveEnemies = enemies.filter(e => e.hp > 0);

  if (skill.type === "heal_single") {
    // 检查敌人是否被冰冻（冰冻状态下无法被治疗）
    if (isTargetFrozen(gameState, enemy)) {
      gameState.battleLog.push(`${enemy.name} 被冰冻，无法被治疗！`);
      return;
    }
    
    const healAmount = Math.floor(enemy.maxHp * skill.healPercent);
    const manaAmount = Math.floor(enemy.maxMp * skill.manaPercent);
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
    enemy.mp = Math.min(enemy.maxMp, enemy.mp + manaAmount);
    gameState.battleLog.push(
      `${enemy.name} 恢复了 ${healAmount} HP 和 ${manaAmount} MP！`,
    );
    if (!enemy.buffs) enemy.buffs = [];
    // 移除旧的治疗buff
    const filtered = enemy.buffs.filter(b => b.type !== "heal");
    enemy.buffs.splice(0, enemy.buffs.length, ...filtered);
    enemy.buffs.push({
      name: skill.name,
      type: "heal",
      remainingTurns: skill.duration,
      healPercent: skill.healPercent || 0.15,
      manaPercent: skill.manaPercent || 0.1,
    });
  } else if (skill.type === "heal_all") {
    // 群体治疗，只治疗友方敌人
    aliveEnemies.forEach(ally => {
      if (isTargetFrozen(gameState, ally)) {
        gameState.battleLog.push(`${ally.name} 被冰冻，无法被治疗！`);
        return;
      }
      const healAmount = Math.floor(ally.maxHp * skill.healPercent);
      const manaAmount = Math.floor(ally.maxMp * skill.manaPercent);
      ally.hp = Math.min(ally.maxHp, ally.hp + healAmount);
      ally.mp = Math.min(ally.maxMp, ally.mp + manaAmount);
      gameState.battleLog.push(
        `${ally.name} 恢复了 ${healAmount} HP 和 ${manaAmount} MP！`,
      );
      if (!ally.buffs) ally.buffs = [];
      const filtered = ally.buffs.filter(b => b.type !== "heal");
      ally.buffs.splice(0, ally.buffs.length, ...filtered);
      ally.buffs.push({
        name: skill.name,
        type: "heal",
        remainingTurns: skill.duration,
        healPercent: skill.healPercent || 0.15,
        manaPercent: skill.manaPercent || 0.1,
      });
    });
  } else if (skill.type === "buff_attack_single" || skill.type === "buff_attack_all") {
    gameState.battleLog.push(
      `${enemy.name} 使用 ${skill.name}，物理攻击 x${skill.physicalMultiplier}，法术攻击 x${skill.magicMultiplier}！`,
    );
    if (!enemy.buffs) enemy.buffs = [];
    const filtered = enemy.buffs.filter(b => b.type !== "physicalAttack" && b.type !== "magicAttack");
    enemy.buffs.splice(0, enemy.buffs.length, ...filtered);
    enemy.buffs.push({
      name: skill.name,
      type: "physicalAttack",
      statType: "physicalAttack",
      value: skill.physicalMultiplier,
      remainingTurns: skill.duration,
    });
    enemy.buffs.push({
      name: skill.name,
      type: "magicAttack",
      statType: "magicAttack",
      value: skill.magicMultiplier,
      remainingTurns: skill.duration,
    });
    
    if (skill.type === "buff_attack_all") {
      // 群体buff，只给友方敌人施加
      aliveEnemies.filter(e => e.id !== enemy.id).forEach(ally => {
        if (!ally.buffs) ally.buffs = [];
        const allyFiltered = ally.buffs.filter(b => b.type !== "physicalAttack" && b.type !== "magicAttack");
        ally.buffs.splice(0, ally.buffs.length, ...allyFiltered);
        ally.buffs.push({
          name: skill.name,
          type: "physicalAttack",
          statType: "physicalAttack",
          value: skill.physicalMultiplier,
          remainingTurns: skill.duration,
        });
        ally.buffs.push({
          name: skill.name,
          type: "magicAttack",
          statType: "magicAttack",
          value: skill.magicMultiplier,
          remainingTurns: skill.duration,
        });
      });
    }
  } else if (skill.type === "buff_defense_single" || skill.type === "buff_defense_all") {
    gameState.battleLog.push(
      `${enemy.name} 使用 ${skill.name}，防御力 x${skill.defenseMultiplier}！`,
    );
    if (!enemy.buffs) enemy.buffs = [];
    const filtered = enemy.buffs.filter(b => b.type !== "defense");
    enemy.buffs.splice(0, enemy.buffs.length, ...filtered);
    enemy.buffs.push({
      name: skill.name,
      type: "defense",
      statType: "defense",
      value: skill.defenseMultiplier,
      remainingTurns: skill.duration,
    });
    
    if (skill.type === "buff_defense_all") {
      aliveEnemies.filter(e => e.id !== enemy.id).forEach(ally => {
        if (!ally.buffs) ally.buffs = [];
        const allyFiltered = ally.buffs.filter(b => b.type !== "defense");
        ally.buffs.splice(0, ally.buffs.length, ...allyFiltered);
        ally.buffs.push({
          name: skill.name,
          type: "defense",
          statType: "defense",
          value: skill.defenseMultiplier,
          remainingTurns: skill.duration,
        });
      });
    }
  } else if (skill.type === "buff_speed_single" || skill.type === "buff_speed_all") {
    gameState.battleLog.push(
      `${enemy.name} 使用 ${skill.name}，速度 x${skill.speedMultiplier}！`,
    );
    if (!enemy.buffs) enemy.buffs = [];
    const filtered = enemy.buffs.filter(b => b.type !== "speed");
    enemy.buffs.splice(0, enemy.buffs.length, ...filtered);
    enemy.buffs.push({
      name: skill.name,
      type: "speed",
      statType: "speed",
      value: skill.speedMultiplier,
      remainingTurns: skill.duration,
    });
    
    if (skill.type === "buff_speed_all") {
      aliveEnemies.filter(e => e.id !== enemy.id).forEach(ally => {
        if (!ally.buffs) ally.buffs = [];
        const allyFiltered = ally.buffs.filter(b => b.type !== "speed");
        ally.buffs.splice(0, ally.buffs.length, ...allyFiltered);
        ally.buffs.push({
          name: skill.name,
          type: "speed",
          statType: "speed",
          value: skill.speedMultiplier,
          remainingTurns: skill.duration,
        });
      });
    }
  }
};

const getEnemyBuffMultiplier = (enemy, statType) => {
  let multiplier = 1;
  if (enemy && enemy.buffs) {
    enemy.buffs.forEach((buff) => {
      if (buff && buff.statType === statType) {
        multiplier *= buff.value;
      }
    });
  }
  return multiplier;
};

const enemyUseAttackSkill = (gameState, enemy, skill, target, targetType, targetStats, defending, pet) => {
  const enemyCritRate = enemy.critRate || 0;
  const physicalMultiplier = getEnemyBuffMultiplier(enemy, "physicalAttack");
  const magicMultiplier = getEnemyBuffMultiplier(enemy, "magicAttack");

  // 检查目标是否被冰冻
  const targetName = targetType === "player" ? "你" : (targetType === "pet" ? pet.name : target.name);
  if (isTargetFrozen(gameState, target)) {
    gameState.battleLog.push(`${targetName} 被冰冻，无法受到伤害！`);
    return;
  }

  // 技能伤害计算与玩家一致：skill.damage + attack * multiplier - defense
  let baseDamage;
  if (skill.type === "magic") {
    baseDamage = Math.max(1, enemy.magicAttack * magicMultiplier + skill.damage - (targetStats.defense || 0));
  } else {
    baseDamage = Math.max(1, enemy.physicalAttack * physicalMultiplier + skill.damage - (targetStats.defense || 0));
  }

  const critRate = Math.min(enemyCritRate, GAME_CONFIG.CRIT.MAX_CRIT_RATE) / 100;
  const isCrit = Math.random() < critRate;
  let damage = baseDamage;

  if (isCrit) {
    damage = Math.floor(damage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER);
  }

  if (defending && targetType !== "enemy") {
    damage = Math.floor(damage * aiConfig.DEFENSE_DAMAGE_REDUCTION);
  }

  // 优先判断闪避（只对玩家和宠物生效）
  if (targetType !== "enemy") {
    const dodgeChance = targetStats.dodge || 0;
    if (checkDodge(target, dodgeChance)) {
      gameState.battleLog.push(`${targetName} 闪避成功，免疫了 ${damage.toFixed(UI_CONFIG.DECIMAL_PLACES)} 点伤害！`);
      return; // 闪避成功，不受任何伤害
    }

    // 闪避失败后，应用不动如山伤害上限
    const unshakableMountain = targetStats.unshakableMountain || 0;
    damage = applyUnshakableMountainLimit(damage, target, unshakableMountain, gameState);
  }

  target.hp -= Math.floor(damage);

  gameState.battleLog.push(
    `${enemy.name} 释放 ${skill.name}${isCrit ? "【暴击！】" : ""}，${targetName}受到 ${damage.toFixed(
      UI_CONFIG.DECIMAL_PLACES,
    )} 点伤害`,
  );

  if (targetType === "pet" && target.hp <= 0) {
    gameState.battleLog.push(`${pet.name} 被击败了，退出战斗！`);
  }
};

const enemyUseNormalAttack = (gameState, enemy, target, targetType, targetStats, defending, pet) => {
  const enemyCritRate = enemy.critRate || 0;
  const enemyComboRate = enemy.comboRate || 0;
  const enemyMaxComboCount = enemy.maxComboCount || 1;

  // 检查目标是否被冰冻
  const targetName = targetType === "player" ? "你" : (targetType === "pet" ? pet.name : target.name);
  if (isTargetFrozen(gameState, target)) {
    gameState.battleLog.push(`${targetName} 被冰冻，无法受到伤害！`);
    return;
  }

  // 普通攻击统一使用物理攻击（和玩家一致）
  const physicalMultiplier = getEnemyBuffMultiplier(enemy, "physicalAttack");
  const enemyAttack = (enemy.physicalAttack || 0) * physicalMultiplier;

  const baseDamage = Math.max(1, enemyAttack - (targetStats.defense || 0));

  const critRate = Math.min(enemyCritRate, GAME_CONFIG.CRIT.MAX_CRIT_RATE) / 100;
  const isCrit = Math.random() < critRate;
  let damage = baseDamage;

  if (isCrit) {
    damage = Math.floor(damage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER);
  }

  if (defending && targetType !== "enemy") {
    damage = Math.floor(damage * aiConfig.DEFENSE_DAMAGE_REDUCTION);
  }

  // 优先判断闪避（只对玩家和宠物生效）
  if (targetType !== "enemy") {
    const dodgeChance = targetStats.dodge || 0;
    if (checkDodge(target, dodgeChance)) {
      gameState.battleLog.push(`${targetName} 闪避成功，免疫了 ${damage.toFixed(UI_CONFIG.DECIMAL_PLACES)} 点伤害！`);
      return; // 闪避成功，不受任何伤害
    }

    // 闪避失败后，应用不动如山伤害上限
    const unshakableMountain = targetStats.unshakableMountain || 0;
    damage = applyUnshakableMountainLimit(damage, target, unshakableMountain, gameState);
  }

  target.hp -= Math.floor(damage);

  gameState.battleLog.push(
    `${enemy.name} 攻击${targetName}${isCrit ? "【暴击！】" : ""}，${targetName}受到 ${damage.toFixed(
      UI_CONFIG.DECIMAL_PLACES,
    )} 点伤害`,
  );

  const maxComboCount = Math.min(
    enemyMaxComboCount,
    GAME_CONFIG.COMBO.MAX_COMBO_COUNT,
  );
  const maxComboRate = GAME_CONFIG.COMBO.MAX_COMBO_RATE;
  const comboProbDecay = GAME_CONFIG.COMBO.COMBO_PROB_DECAY;
  const comboDamageDecay = GAME_CONFIG.COMBO.COMBO_DAMAGE_DECAY;

  let comboCount = 0;
  let currentComboRate = Math.min(enemyComboRate, maxComboRate) / 100;
  let currentDamage = baseDamage * comboDamageDecay;

  while (
    comboCount < maxComboCount - 1 &&
    Math.random() < currentComboRate &&
    target.hp > 0
  ) {
    comboCount++;
    
    // 检查目标是否在连击中被打成冰冻
    if (isTargetFrozen(gameState, target)) {
      gameState.battleLog.push(`${targetName} 被冰冻，连击中无法继续造成伤害！`);
      break;
    }
    
    const isCritCombo = Math.random() < critRate;
    let comboDamage = currentDamage;

    if (defending) {
      comboDamage = Math.floor(
        comboDamage * aiConfig.DEFENSE_DAMAGE_REDUCTION,
      );
    }

    if (isCritCombo) {
      comboDamage = Math.floor(
        comboDamage * GAME_CONFIG.CRIT.CRIT_MULTIPLIER,
      );
    }

    // 连击伤害也应用不动如山伤害上限（闪避已在首次攻击时判断过，连击不再判断闪避）
    if (targetType !== "enemy") {
      const unshakableMountain = targetStats.unshakableMountain || 0;
      comboDamage = applyUnshakableMountainLimit(comboDamage, target, unshakableMountain, gameState);
    }

    target.hp -= Math.floor(comboDamage);
    gameState.battleLog.push(
      `【连击${comboCount + 1}】${enemy.name}攻击${targetName}${
        isCritCombo ? "【暴击！】" : ""
      }，${targetName}受到 ${comboDamage.toFixed(UI_CONFIG.DECIMAL_PLACES)} 点伤害`,
    );

    currentComboRate *= comboProbDecay;
    currentDamage *= comboDamageDecay;
  }

  if (comboCount > 0) {
    gameState.battleLog.push(`敌人连击结束！共连击 ${comboCount + 1} 次！`);
  }

  if (targetType === "pet" && target.hp <= 0) {
    gameState.battleLog.push(`${pet.name} 被击败了，退出战斗！`);
  }
};
