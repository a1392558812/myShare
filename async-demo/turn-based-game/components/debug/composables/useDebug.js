import { ref, computed } from "vue";
import { gameState, gameActions } from "../../../stores/gameStore.js";
import {
  calculatePlayerStats,
  calculatePetStats,
} from "../../../stores/player.js";
import {
  ITEMS_CONFIG,
  EQUIPMENT_CONFIG,
  STAT_CONFIG,
  SKILLS_CONFIG,
} from "../../../stores/constants.js";

export function useDebug() {
  const coeffStatsList = Object.keys(
    STAT_CONFIG.PET_STAT_POINT_COEFFICIENT_RANGES,
  );
  const defaultCoefficients = { ...STAT_CONFIG.PET_POINT_COEFFICIENTS };

  const petCoefficients = ref({
    ...(gameState.pet?.pointCoefficients || defaultCoefficients),
  });

  const goldAmount = ref(100);
  const statAmount = ref(1);
  const selectedStat = ref("physicalAttack");
  const expAmount = ref(50);
  const hpAmount = ref(50);
  const mpAmount = ref(30);
  const selectedItemId = ref(ITEMS_CONFIG[0].id);
  const itemCount = ref(1);
  const selectedRarity = ref("0");
  const equipLevel = ref(1);
  const selectedEquipType = ref("weapon");
  const selectedSkillId = ref(SKILLS_CONFIG[0].id);

  const selectedPetStat = ref("physicalAttack");
  const petStatAmount = ref(1);
  const petExpAmount = ref(50);
  const petHpAmount = ref(50);
  const petMpAmount = ref(30);
  const selectedPetSkillId = ref(SKILLS_CONFIG[0].id);

  const customBaseAffixes = ref([{ stat: "physicalAttack", value: 5 }]);
  const customBonusAffixes = ref([{ stat: "physicalAttack", value: 20 }]);

  const uniqueBonusAffixStats = Object.keys(EQUIPMENT_CONFIG.BONUS_AFFIX_POOL);

  const addGold = () => {
    gameState.player.gold += goldAmount.value;
  };

  const addStatPoints = () => {
    const stat = selectedStat.value;
    const amount = statAmount.value;
    
    // 特殊属性：critRate、comboRate、maxComboCount 直接存储在 player 对象中
    if (stat === "critRate" || stat === "comboRate" || stat === "maxComboCount") {
      gameState.player[stat] = (gameState.player[stat] || 0) + amount;
    } else {
      // 普通属性：使用 Points 后缀
      const pointField = `${stat}Points`;
      gameState.player[pointField] = (gameState.player[pointField] || 0) + amount;
    }
    
    const calculatedStats = calculatePlayerStats(gameState.player);
    gameState.player.maxHp = calculatedStats.maxHp;
    gameState.player.maxMp = calculatedStats.maxMp;
  };

  const addExp = () => {
    gameState.player.exp += expAmount.value;
    gameActions.levelUp();
  };

  const addHp = () => {
    gameState.player.hp = Math.min(
      gameState.player.maxHp,
      gameState.player.hp + hpAmount.value,
    );
  };

  const fillHp = () => {
    gameState.player.hp = gameState.player.maxHp;
  };

  const addMp = () => {
    gameState.player.mp = Math.min(
      gameState.player.maxMp,
      gameState.player.mp + mpAmount.value,
    );
  };

  const fillMp = () => {
    gameState.player.mp = gameState.player.maxMp;
  };

  const addItem = () => {
    const itemData = ITEMS_CONFIG.find(
      (item) => item.id === selectedItemId.value,
    );
    if (!itemData) return;
    const existingItem = gameState.player.inventory.find(
      (item) => item.id === itemData.id,
    );
    if (existingItem) {
      existingItem.count += itemCount.value;
    } else {
      gameState.player.inventory.push({
        ...itemData,
        count: itemCount.value,
      });
    }
  };

  const addSkill = () => {
    const skillData = SKILLS_CONFIG.find(
      (skill) => skill.id === selectedSkillId.value,
    );
    if (!skillData) return;
    const hasSkill = gameState.player.skills.some(
      (skill) => skill.id === skillData.id,
    );
    if (!hasSkill) {
      gameState.player.skills.push(skillData);
    }
  };

  const addAllSkills = () => {
    SKILLS_CONFIG.forEach((skillData) => {
      const hasSkill = gameState.player.skills.some(
        (skill) => skill.id === skillData.id,
      );
      if (!hasSkill) {
        gameState.player.skills.push(skillData);
      }
    });
  };

  const addPetStatPoints = () => {
    if (!gameState.pet) return;
    const stat = selectedPetStat.value;
    const amount = petStatAmount.value;
    
    // 特殊属性：critRate、comboRate、maxComboCount 直接存储在 pet 对象中
    if (stat === "critRate" || stat === "comboRate" || stat === "maxComboCount") {
      gameState.pet[stat] = (gameState.pet[stat] || 0) + amount;
    } else {
      // 普通属性：使用 Points 后缀
      const pointField = `${stat}Points`;
      gameState.pet[pointField] = (gameState.pet[pointField] || 0) + amount;
    }
    
    const calculatedStats = calculatePetStats(gameState.pet);
    gameState.pet.maxHp = calculatedStats.maxHp;
    gameState.pet.maxMp = calculatedStats.maxMp;
  };

  const addPetExp = () => {
    if (!gameState.pet) return;
    gameState.pet.exp += petExpAmount.value;
    gameActions.petLevelUp();
  };

  const addPetHp = () => {
    if (!gameState.pet) return;
    gameState.pet.hp = Math.min(
      gameState.pet.maxHp,
      gameState.pet.hp + petHpAmount.value,
    );
  };

  const fillPetHp = () => {
    if (!gameState.pet) return;
    gameState.pet.hp = gameState.pet.maxHp;
  };

  const addPetMp = () => {
    if (!gameState.pet) return;
    gameState.pet.mp = Math.min(
      gameState.pet.maxMp,
      gameState.pet.mp + petMpAmount.value,
    );
  };

  const fillPetMp = () => {
    if (!gameState.pet) return;
    gameState.pet.mp = gameState.pet.maxMp;
  };

  const addPetSkill = () => {
    if (!gameState.pet) return;
    const skillData = SKILLS_CONFIG.find(
      (skill) => skill.id === selectedPetSkillId.value,
    );
    if (!skillData) return;
    const hasSkill = gameState.pet.skills.some(
      (skill) => skill.id === skillData.id,
    );
    if (!hasSkill) {
      gameState.pet.skills.push(skillData);
    }
  };

  const addAllPetSkills = () => {
    if (!gameState.pet) return;
    SKILLS_CONFIG.forEach((skillData) => {
      const hasSkill = gameState.pet.skills.some(
        (skill) => skill.id === skillData.id,
      );
      if (!hasSkill) {
        gameState.pet.skills.push(skillData);
      }
    });
  };

  const addBaseAffix = () => {
    customBaseAffixes.value.push({ stat: "physicalAttack", value: 1 });
  };

  const addBonusAffix = () => {
    customBonusAffixes.value.push({ stat: "physicalAttack", value: 10 });
  };

  const removeAffix = (type, index) => {
    if (type === "base") {
      customBaseAffixes.value.splice(index, 1);
    } else {
      customBonusAffixes.value.splice(index, 1);
    }
  };

  const addCustomEquipment = () => {
    const baseAffixes = {};
    customBaseAffixes.value.forEach((affix) => {
      if (affix && affix.stat && affix.value > 0) {
        baseAffixes[affix.stat] = (baseAffixes[affix.stat] || 0) + affix.value;
      }
    });

    const bonusAffixes = {};
    customBonusAffixes.value.forEach((affix) => {
      if (affix && affix.stat && affix.value > 0) {
        bonusAffixes[affix.stat] =
          (bonusAffixes[affix.stat] || 0) + affix.value;
      }
    });

    const equipment = gameActions.generateCustomEquipment(
      selectedEquipType.value,
      selectedRarity.value,
      equipLevel.value,
      baseAffixes,
      bonusAffixes,
    );
    gameState.player.equipmentBag.push(equipment);
  };

  const setPlayerTurn = () => {
    if (gameState.currentBattle) {
      gameState.currentBattle.playerTurn = true;
    }
  };

  const setEnemyTurn = () => {
    if (gameState.currentBattle) {
      gameState.currentBattle.playerTurn = false;
    }
  };

  const getStatName = (stat) => STAT_CONFIG.NAMES[stat] || stat;

  const getCurrentCoefficientInfo = () => {
    if (!gameState.pet) return "无宠物";
    const pet = gameState.pet;
    const coeff = pet.pointCoefficients || defaultCoefficients;
    return Object.entries(coeff)
      .map(([stat, value]) => `${getStatName(stat)}:${value.toFixed(2)}`)
      .join(", ");
  };

  const getDefaultCoefficient = (stat) => {
    return defaultCoefficients[stat]?.toFixed(2) || "";
  };

  const resetCoefficient = (stat) => {
    petCoefficients.value[stat] = defaultCoefficients[stat];
  };

  const applyAllCoefficients = () => {
    if (!gameState.pet) {
      alert("宠物不存在！");
      return;
    }
    gameState.pet.pointCoefficients = { ...petCoefficients.value };
    const newStats = calculatePetStats(gameState.pet);
    gameState.pet.maxHp = newStats.maxHp;
    gameState.pet.maxMp = newStats.maxMp;
    gameState.pet.hp = Math.min(gameState.pet.hp, gameState.pet.maxHp);
    gameState.pet.mp = Math.min(gameState.pet.mp, gameState.pet.maxMp);
    alert("系数应用成功！");
  };

  const resetAllCoefficients = () => {
    petCoefficients.value = { ...defaultCoefficients };
    if (gameState.pet) {
      gameState.pet.pointCoefficients = { ...defaultCoefficients };
      const newStats = calculatePetStats(gameState.pet);
      gameState.pet.maxHp = newStats.maxHp;
      gameState.pet.maxMp = newStats.maxMp;
      gameState.pet.hp = Math.min(gameState.pet.hp, gameState.pet.maxHp);
      gameState.pet.mp = Math.min(gameState.pet.mp, gameState.pet.maxMp);
    }
    alert("已重置为默认系数！");
  };

  const confirmReset = () => {
    gameActions.resetGame();
  };

  // 战斗buff调试相关
  const battleBuffTarget = ref("player"); // player, pet, enemy_0, enemy_1, etc.
  const selectedBuffSkillId = ref(4); // 默认单体治疗术

  // 获取可以施加的buff/debuff技能列表
  const getBuffSkills = () => {
    return SKILLS_CONFIG.filter(skill => {
      // 过滤出辅助技能和障碍技能
      return skill.type.startsWith("heal_") ||
             skill.type.startsWith("buff_") ||
             skill.type.startsWith("debuff_");
    });
  };

  // 获取场上所有可作为目标的目标列表
  const getBattleTargets = () => {
    const targets = [];
    
    // 添加玩家和宠物
    targets.push({ id: "player", name: "玩家" });
    if (gameState.pet && gameState.pet.active) {
      targets.push({ id: "pet", name: gameState.pet.name || "宠物" });
    }
    
    // 添加敌人
    if (gameState.currentBattle && gameState.currentBattle.enemies) {
      gameState.currentBattle.enemies.forEach((enemy, index) => {
        if (enemy && enemy.hp > 0) {
          targets.push({ id: `enemy_${index}`, name: enemy.name, enemyIndex: index });
        }
      });
    }
    
    return targets;
  };

  // 施加buff
  const applyBattleBuff = () => {
    if (!gameState.currentBattle) {
      alert("当前不在战斗中！");
      return;
    }

    const skill = SKILLS_CONFIG.find(s => s.id === selectedBuffSkillId.value);
    if (!skill) {
      alert("未选择有效的技能！");
      return;
    }

    let target = null;
    let targetName = "";
    
    if (battleBuffTarget.value === "player") {
      target = gameState.player;
      targetName = "玩家";
    } else if (battleBuffTarget.value === "pet") {
      target = gameState.pet;
      targetName = gameState.pet?.name || "宠物";
    } else if (battleBuffTarget.value.startsWith("enemy_")) {
      const enemyIndex = parseInt(battleBuffTarget.value.replace("enemy_", ""));
      target = gameState.currentBattle.enemies[enemyIndex];
      targetName = target?.name || "敌人";
    }

    if (!target) {
      alert("未找到目标！");
      return;
    }

    // 判断是辅助技能还是障碍技能
    const skillType = skill.type;
    if (skillType.startsWith("heal_") || skillType.startsWith("buff_")) {
      // 辅助技能 - 使用 applyBuff 或直接添加buff
      applyBuffToTarget(target, skill, targetName);
    } else if (skillType.startsWith("debuff_")) {
      // 障碍技能 - 使用 applyDebuff
      applyDebuffToTarget(target, skill, targetName);
    }
  };

  // 应用辅助buff到目标
  const applyBuffToTarget = (target, skill, targetName) => {
    const battle = gameState.currentBattle;
    let buffArray = null;

    // 检查是否是敌人
    if (battle.enemies?.some(e => e.id === target.id)) {
      if (!target.buffs) target.buffs = [];
      buffArray = target.buffs;
    } else if (target === gameState.player) {
      if (!battle.playerBuffs) battle.playerBuffs = [];
      buffArray = battle.playerBuffs;
    } else if (target === gameState.pet) {
      if (!battle.petBuffs) battle.petBuffs = [];
      buffArray = battle.petBuffs;
    }

    if (!buffArray) return;

    // 移除旧的对立buff
    if (skill.type.includes("heal")) {
      const filtered = buffArray.filter(b => b.type !== "heal");
      buffArray.splice(0, buffArray.length, ...filtered);
      buffArray.push({
        name: skill.name,
        type: "heal",
        remainingTurns: skill.duration,
        healPercent: skill.healPercent || 0.15,
        manaPercent: skill.manaPercent || 0.1,
      });
      // 立即生效
      const healAmount = Math.floor(target.maxHp * (skill.healPercent || 0.15));
      const manaAmount = Math.floor(target.maxMp * (skill.manaPercent || 0.1));
      target.hp = Math.min(target.maxHp, target.hp + healAmount);
      target.mp = Math.min(target.maxMp, target.mp + manaAmount);
      gameState.battleLog.push(`${targetName} 的 ${skill.name} 生效！恢复 ${healAmount} HP 和 ${manaAmount} MP`);
    } else if (skill.type.includes("buff_attack")) {
      const filtered = buffArray.filter(b => b.type !== "physicalAttack" && b.type !== "magicAttack");
      buffArray.splice(0, buffArray.length, ...filtered);
      buffArray.push({
        name: skill.name,
        type: "physicalAttack",
        statType: "physicalAttack",
        value: skill.physicalMultiplier,
        remainingTurns: skill.duration,
      });
      buffArray.push({
        name: skill.name,
        type: "magicAttack",
        statType: "magicAttack",
        value: skill.magicMultiplier,
        remainingTurns: skill.duration,
      });
      gameState.battleLog.push(`${targetName} 获得了 ${skill.name}！物理攻击 x${skill.physicalMultiplier}，法术攻击 x${skill.magicMultiplier}`);
    } else if (skill.type.includes("buff_defense")) {
      const filtered = buffArray.filter(b => b.type !== "defense");
      buffArray.splice(0, buffArray.length, ...filtered);
      buffArray.push({
        name: skill.name,
        type: "defense",
        statType: "defense",
        value: skill.defenseMultiplier,
        remainingTurns: skill.duration,
      });
      gameState.battleLog.push(`${targetName} 获得了 ${skill.name}！防御力 x${skill.defenseMultiplier}`);
    } else if (skill.type.includes("buff_speed")) {
      const filtered = buffArray.filter(b => b.type !== "speed");
      buffArray.splice(0, buffArray.length, ...filtered);
      buffArray.push({
        name: skill.name,
        type: "speed",
        statType: "speed",
        value: skill.speedMultiplier,
        remainingTurns: skill.duration,
      });
      gameState.battleLog.push(`${targetName} 获得了 ${skill.name}！速度 x${skill.speedMultiplier}`);
    }
  };

  // 应用障碍debuff到目标
  const applyDebuffToTarget = (target, skill, targetName) => {
    const battle = gameState.currentBattle;
    let buffArray = null;

    // 检查是否是敌人
    if (battle.enemies?.some(e => e.id === target.id)) {
      if (!target.buffs) target.buffs = [];
      buffArray = target.buffs;
    } else if (target === gameState.player) {
      if (!battle.playerBuffs) battle.playerBuffs = [];
      buffArray = battle.playerBuffs;
    } else if (target === gameState.pet) {
      if (!battle.petBuffs) battle.petBuffs = [];
      buffArray = battle.petBuffs;
    }

    if (!buffArray) return;

    const debuffType = skill.type.replace("_single", "").replace("_all", "").replace("debuff_", "");

    // 冰冻术优先级最高，清除所有其他buff
    if (debuffType === "freeze") {
      buffArray.splice(0, buffArray.length);
      buffArray.push({
        name: skill.name,
        type: "freeze",
        remainingTurns: skill.duration,
      });
      gameState.battleLog.push(`调试：${targetName} 使用 ${skill.name} 冰冻了目标！`);
      return;
    }

    // 封印和混乱互相覆盖
    if (debuffType === "seal") {
      const filtered = buffArray.filter(b => b.type !== "confuse" && b.type !== "seal");
      buffArray.splice(0, buffArray.length, ...filtered);
    } else if (debuffType === "confuse") {
      const filtered = buffArray.filter(b => b.type !== "seal" && b.type !== "confuse");
      buffArray.splice(0, buffArray.length, ...filtered);
    } else if (debuffType === "poison") {
      const filtered = buffArray.filter(b => b.type !== "poison");
      buffArray.splice(0, buffArray.length, ...filtered);
    }

    // 创建debuff对象
    const debuff = {
      name: skill.name,
      type: debuffType,
      remainingTurns: skill.duration,
    };

    // 中毒效果：立即扣减血量和法力
    if (debuffType === "poison") {
      const damagePercent = skill.damagePercent || 0.08;
      const manaDamagePercent = skill.manaDamagePercent || 0.05;
      
      const damage = Math.floor(target.maxHp * damagePercent);
      const manaDamage = Math.floor((target.maxMp || 0) * manaDamagePercent);
      
      target.hp = Math.max(0, target.hp - damage);
      target.mp = Math.max(0, (target.mp || 0) - manaDamage);
      
      gameState.battleLog.push(`调试：${skill.name} 生效！${targetName} 受到 ${damage} HP伤害和 ${manaDamage} MP伤害`);
    }

    buffArray.push(debuff);
    
    const effectName = debuffType === "seal" ? "封印" : debuffType === "confuse" ? "混乱" : debuffType === "poison" ? "中毒" : "控制";
    gameState.battleLog.push(`调试：对 ${targetName} 施加了 ${skill.name}，目标被${effectName}了！`);
  };

  return {
    coeffStatsList,
    defaultCoefficients,
    petCoefficients,
    goldAmount,
    statAmount,
    selectedStat,
    expAmount,
    hpAmount,
    mpAmount,
    selectedItemId,
    itemCount,
    selectedRarity,
    equipLevel,
    selectedEquipType,
    selectedSkillId,
    selectedPetStat,
    petStatAmount,
    petExpAmount,
    petHpAmount,
    petMpAmount,
    selectedPetSkillId,
    customBaseAffixes,
    customBonusAffixes,
    uniqueBonusAffixStats,
    addGold,
    addStatPoints,
    addExp,
    addHp,
    fillHp,
    addMp,
    fillMp,
    addItem,
    addSkill,
    addAllSkills,
    addPetStatPoints,
    addPetExp,
    addPetHp,
    fillPetHp,
    addPetMp,
    fillPetMp,
    addPetSkill,
    addAllPetSkills,
    addBaseAffix,
    addBonusAffix,
    removeAffix,
    addCustomEquipment,
    setPlayerTurn,
    setEnemyTurn,
    getStatName,
    getCurrentCoefficientInfo,
    getDefaultCoefficient,
    resetCoefficient,
    applyAllCoefficients,
    resetAllCoefficients,
    confirmReset,
    ITEMS_CONFIG,
    SKILLS_CONFIG,
    EQUIPMENT_CONFIG,
    STAT_CONFIG,
    // 战斗buff调试
    battleBuffTarget,
    selectedBuffSkillId,
    getBuffSkills,
    getBattleTargets,
    applyBattleBuff,
  };
}
