import { GAME_CONFIG, SKILLS_CONFIG, UI_CONFIG } from "./constants.js";
import { calculatePlayerStats, calculatePetStats } from "./player.js";
import { aiConfig, applyDebuff } from "./battle-utils.js";

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
      target = randomTarget.target;
      targetType = randomTarget.type;
      targetStats = randomTarget.stats;
      if (targetType === "enemy") {
        gameState.battleLog.push(`${enemy.name} 混乱中攻击了友方 ${target.name}！`);
      }
    } else {
      // 没有目标时直接返回
      return;
    }
  } else if (pet && pet.active && pet.hp > 0 && Math.random() < 0.6) {
    target = pet;
    targetType = "pet";
    targetStats = petStats;
  } else {
    target = player;
    targetType = "player";
    targetStats = playerStats;
    defending = gameState.currentBattle.playerDefending;
  }

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
        enemyUseDebuffSkill(gameState, enemy, skill, target, targetType);
      } else if (!isSupportSkill && !isDebuffSkill) {
        enemyUseAttackSkill(gameState, enemy, skill, target, targetType, defending, pet);
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
      enemyUseAttackSkill(gameState, enemy, magicSkill, target, targetType, defending, pet);
      return;
    }
  }
  // 未选择法术攻击时使用普通物理攻击
  enemyUseNormalAttack(gameState, enemy, target, targetType, targetStats, defending, pet);
};

const enemyUseDebuffSkill = (gameState, enemy, skill, target, targetType) => {
  gameState.battleLog.push(`${enemy.name} 使用了 ${skill.name}！`);

  if (skill.type.endsWith("_single")) {
    applyDebuff(gameState, target, skill, enemy.name);
  } else if (skill.type.endsWith("_all")) {
    const aliveTargets = targetType === "player" 
      ? [gameState.player, gameState.pet].filter(t => t && t.hp > 0)
      : gameState.currentBattle.enemies.filter(e => e.hp > 0);
    
    const targetCount = Math.min(skill.targetCount || 3, aliveTargets.length);
    const shuffled = [...aliveTargets].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < targetCount; i++) {
      applyDebuff(gameState, shuffled[i], skill, enemy.name);
    }
  }
};

const enemyUseSupportSkill = (gameState, enemy, skill, pet) => {
  gameState.battleLog.push(`${enemy.name} 使用了 ${skill.name}！`);

  if (skill.type === "heal_single") {
    const healAmount = Math.floor(enemy.maxHp * skill.healPercent);
    const manaAmount = Math.floor(enemy.maxMp * skill.manaPercent);
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
    enemy.mp = Math.min(enemy.maxMp, enemy.mp + manaAmount);
    gameState.battleLog.push(
      `${enemy.name} 恢复了 ${healAmount} HP 和 ${manaAmount} MP！`,
    );
    if (!enemy.buffs) enemy.buffs = [];
    enemy.buffs.push({
      name: skill.name,
      type: "heal",
      remainingTurns: skill.duration,
      healPercent: skill.healPercent || 0.15,
      manaPercent: skill.manaPercent || 0.1,
    });
  } else if (skill.type === "heal_all") {
    const healAmount = Math.floor(enemy.maxHp * skill.healPercent);
    const manaAmount = Math.floor(enemy.maxMp * skill.manaPercent);
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
    enemy.mp = Math.min(enemy.maxMp, enemy.mp + manaAmount);
    gameState.battleLog.push(
      `${enemy.name} 恢复了 ${healAmount} HP 和 ${manaAmount} MP！`,
    );
    if (pet && pet.active && pet.hp > 0) {
      const petHealAmount = Math.floor(pet.maxHp * skill.healPercent);
      const petManaAmount = Math.floor(pet.maxMp * skill.manaPercent);
      pet.hp = Math.min(pet.maxHp, pet.hp + petHealAmount);
      pet.mp = Math.min(pet.maxMp, pet.mp + petManaAmount);
      gameState.battleLog.push(
        `${pet.name} 恢复了 ${petHealAmount} HP 和 ${petManaAmount} MP！`,
      );
    }
  } else if (skill.type === "buff_attack_single" || skill.type === "buff_attack_all") {
    gameState.battleLog.push(
      `${enemy.name} 使用 ${skill.name}，物理攻击 x${skill.physicalMultiplier}，法术攻击 x${skill.magicMultiplier}！`,
    );
    if (!enemy.buffs) enemy.buffs = [];
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
    if (skill.type === "buff_attack_all" && pet && pet.active && pet.hp > 0) {
      if (!gameState.currentBattle.petBuffs) gameState.currentBattle.petBuffs = [];
      gameState.currentBattle.petBuffs.push({
        name: skill.name,
        type: "physicalAttack",
        statType: "physicalAttack",
        value: skill.physicalMultiplier,
        remainingTurns: skill.duration,
      });
      gameState.currentBattle.petBuffs.push({
        name: skill.name,
        type: "magicAttack",
        statType: "magicAttack",
        value: skill.magicMultiplier,
        remainingTurns: skill.duration,
      });
    }
  } else if (skill.type === "buff_defense_single" || skill.type === "buff_defense_all") {
    gameState.battleLog.push(
      `${enemy.name} 使用 ${skill.name}，防御力 x${skill.defenseMultiplier}！`,
    );
    if (!enemy.buffs) enemy.buffs = [];
    enemy.buffs.push({
      name: skill.name,
      type: "defense",
      statType: "defense",
      value: skill.defenseMultiplier,
      remainingTurns: skill.duration,
    });
  } else if (skill.type === "buff_speed_single" || skill.type === "buff_speed_all") {
    gameState.battleLog.push(
      `${enemy.name} 使用 ${skill.name}，速度 x${skill.speedMultiplier}！`,
    );
    if (!enemy.buffs) enemy.buffs = [];
    enemy.buffs.push({
      name: skill.name,
      type: "speed",
      statType: "speed",
      value: skill.speedMultiplier,
      remainingTurns: skill.duration,
    });
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

const enemyUseAttackSkill = (gameState, enemy, skill, target, targetType, defending, pet) => {
  const enemyCritRate = enemy.critRate || 0;
  const physicalMultiplier = getEnemyBuffMultiplier(enemy, "physicalAttack");
  const magicMultiplier = getEnemyBuffMultiplier(enemy, "magicAttack");

  let baseDamage;
  if (skill.type === "magic") {
    baseDamage = skill.damage + (enemy.magicAttack || 0) * 0.5 * magicMultiplier;
  } else {
    baseDamage = skill.damage + (enemy.physicalAttack || 0) * 0.5 * physicalMultiplier;
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

  target.hp -= Math.floor(damage);

  const targetName = targetType === "player" ? "你" : (targetType === "pet" ? pet.name : target.name);
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

  let enemyAttack;
  const physicalMultiplier = getEnemyBuffMultiplier(enemy, "physicalAttack");

  if (enemy.attackType === "magic") {
    enemyAttack = (enemy.magicAttack || enemy.physicalAttack) * getEnemyBuffMultiplier(enemy, "magicAttack");
  } else {
    enemyAttack = (enemy.physicalAttack || enemy.magicAttack) * physicalMultiplier;
  }

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

  target.hp -= Math.floor(damage);

  const targetName = targetType === "player" ? "你" : (targetType === "pet" ? pet.name : target.name);
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
