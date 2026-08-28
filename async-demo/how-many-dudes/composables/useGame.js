import { ref, computed, reactive } from 'vue';
import {
  PHASE,
  START_GOLD,
  SHOP_CHOICES,
  REROLL_COST,
  MAX_DUPLICATES,
  BRO_TABLE,
  RELICS,
  RELIC_MAP,
  RELIC_RARITY_WEIGHT,
  RELIC_REFORGE_BASE_COST,
  RELIC_REFORGE_INCREMENT,
  RELIC_CANDIDATE_COUNT,
  ROUNDS,
  SYNERGIES,
  getBroDef,
  pickRandom,
  weightedPick,
  getMaxBros,
  getUpgradeDef,
  getUpgradeCost,
  generateEndlessWave,
  logMult15,
} from '../constants.js';

/**
 * 创建一个兄弟实例
 * @param {string} broId - 兄弟定义 id
 * @param {number} instanceId - 唯一实例 id
 * @returns {Object} 兄弟实例
 */
const createBroInstance = (broId, instanceId) => {
  const def = getBroDef(broId);
  return {
    instanceId,
    defId: def.id,
    name: def.name,
    icon: def.icon,
    family: def.family,
    tier: def.tier,
    maxHp: def.maxHp,
    hp: def.maxHp,
    attack: def.attack,
    attackRange: def.attackRange,
    attackSpeed: def.attackSpeed,
    moveSpeed: def.moveSpeed,
    attackType: def.attackType,
    aoeRadius: def.aoeRadius || 0,
    projectileSpeed: def.projectileSpeed || 0,
    healAmount: def.healAmount || 0,
    healTargetCount: def.healTargetCount || 0,
    blessInterval: def.blessInterval || 0,
    blessMult: def.blessMult || 0,
    blessDuration: def.blessDuration || 0,
    smiteRadius: def.smiteRadius || 0,
    smiteMult: def.smiteMult || 0,
    reviveHpRatio: def.reviveHpRatio || 0,
    explodeDamage: def.explodeDamage || 0,
    explodeRadius: def.explodeRadius || 0,
    shieldAuraRange: def.shieldAuraRange || 0,
    shieldReduction: def.shieldReduction || 0,
    lassoRange: def.lassoRange || 0,
    lassoCooldown: def.lassoCooldown || 0,
    innatePierce: def.innatePierce || 0,
    enrageThreshold: def.enrageThreshold || 0,
    enrageMult: def.enrageMult || 0,
    executeChance: def.executeChance || 0,
    executeThreshold: def.executeThreshold || 0,
    speedAuraRange: def.speedAuraRange || 0,
    speedAuraMult: def.speedAuraMult || 0,
    chargeCooldown: def.chargeCooldown || 0,
    chargeRange: def.chargeRange || 0,
    chargeDamage: def.chargeDamage || 0,
    chargeSplashRadius: def.chargeSplashRadius || 0,
    size: def.size || 7,
    upgradeLevels: { attack: 0, maxHp: 0, attackSpeed: 0, moveSpeed: 0 },
    alive: true,
    revived: false,
    relicReviveCount: 0,
    healCount: 0,
    hasRevived: false,
    blessEndTime: 0,
    x: 0,
    y: 0,
    target: null,
    lastAttackTime: 0,
    lastLassoTime: 0,
    lastChargeTime: 0,
    moving: false,
    side: 'player',
  };
};

/**
 * 生成商店可选项（3 个随机兄弟）
 * @returns {Array} 兄弟定义数组
 */
const generateShopChoices = () => {
  return pickRandom(BRO_TABLE, SHOP_CHOICES);
};

/**
 * 生成遗物候选列表（3 个，排除已达上限的）
 * @param {Array<Object>} ownedRelics - 已拥有遗物 [{ id, count }]
 * @returns {Array} 遗物定义数组（最多 RELIC_CANDIDATE_COUNT 个）
 */
const generateRelicCandidates = (ownedRelics) => {
  const ownedMap = {};
  ownedRelics.forEach((r) => { ownedMap[r.id] = r.count; });

  const available = RELICS.filter((r) => {
    if (!r.maxStacks) return true;
    const owned = ownedMap[r.id] || 0;
    return owned < r.maxStacks;
  });

  if (available.length === 0) return [];

  const result = [];
  const pool = [...available];
  for (let i = 0; i < RELIC_CANDIDATE_COUNT && pool.length > 0; i++) {
    const weighted = pool.map((r) => ({
      item: r,
      weight: RELIC_RARITY_WEIGHT[r.rarity] || 1,
    }));
    const picked = weightedPick(weighted);
    result.push(picked);
    pool.splice(pool.indexOf(picked), 1);
  }
  return result;
};

/**
 * 计算当前阵容的激活羁绊
 * @param {Array} bros - 兄弟实例数组
 * @returns {Array} 激活的羁绊列表
 */
const calcActiveSynergies = (bros) => {
  const familyCounts = {};
  bros.forEach((b) => {
    familyCounts[b.family] = (familyCounts[b.family] || 0) + 1;
  });

  return SYNERGIES.filter((syn) => {
    const total = syn.families.reduce((s, f) => s + (familyCounts[f] || 0), 0);
    return total >= syn.minCount;
  });
};

/**
 * 将遗物效果 + 升级效果应用到兄弟实例上
 * 从基础定义值开始，依次乘以：升级倍率 → 遗物倍率（按堆叠数累加）
 * @param {Object} bro - 兄弟实例
 * @param {Array} relics - 遗物数组 [{ id, count }]
 */
const applyRelicEffects = (bro, relics) => {
  const def = getBroDef(bro.defId);
  let maxHp = def.maxHp;
  let attack = def.attack;
  let moveSpeed = def.moveSpeed;
  let attackSpeed = def.attackSpeed;
  let attackRange = def.attackRange;

  const lv = bro.upgradeLevels || { attack: 0, maxHp: 0, attackSpeed: 0, moveSpeed: 0 };
  const atkDef = getUpgradeDef('attack');
  const hpDef = getUpgradeDef('maxHp');
  const spdDef = getUpgradeDef('attackSpeed');
  const movDef = getUpgradeDef('moveSpeed');
  if (atkDef) attack *= 1 + atkDef.bonusPerLevel * (lv.attack || 0);
  if (hpDef) maxHp *= 1 + hpDef.bonusPerLevel * (lv.maxHp || 0);
  if (spdDef) attackSpeed *= 1 - spdDef.bonusPerLevel * (lv.attackSpeed || 0);
  if (movDef) moveSpeed *= 1 + movDef.bonusPerLevel * (lv.moveSpeed || 0);

  relics.forEach((relic) => {
    const relicDef = RELIC_MAP[relic.id];
    if (!relicDef) return;
    const e = relicDef.effect;
    const stacks = relic.count;
    switch (e.type) {
      case 'attackMult':
        attack *= 1 + e.value * stacks;
        break;
      case 'flatAttack':
        attack += e.value * stacks;
        break;
      case 'maxHpMult':
        maxHp *= 1 + e.value * stacks;
        break;
      case 'moveSpeedMult':
        moveSpeed *= 1 + e.value * stacks;
        break;
      case 'attackRangeMult':
        attackRange *= logMult15(stacks);
        break;
      case 'attackSpeedBoost':
        if (e.targetTypes && e.targetTypes.includes(bro.attackType)) {
          attackSpeed *= 1 - e.ratio * stacks;
        }
        break;
    }
  });

  bro.maxHp = Math.round(maxHp);
  bro.attack = Math.round(attack);
  bro.moveSpeed = Math.round(moveSpeed * 100) / 100;
  bro.attackSpeed = Math.max(100, Math.round(attackSpeed));
  bro.attackRange = Math.round(attackRange);
  if (bro.hp > bro.maxHp) bro.hp = bro.maxHp;
};

/**
 * 将羁绊效果应用到兄弟实例上
 * @param {Object} bro - 兄弟实例
 * @param {Array} activeSynergies - 激活的羁绊
 */
const applySynergyEffects = (bro, activeSynergies) => {
  activeSynergies.forEach((syn) => {
    const b = syn.bonus;
    switch (b.type) {
      case 'maxHpBoost':
        if (b.targetFamily === bro.family) {
          bro.maxHp = Math.round(bro.maxHp * (1 + b.ratio));
          bro.hp = Math.min(bro.hp, bro.maxHp);
        }
        break;
      case 'attackSpeedBoost':
        if (b.targetTypes && b.targetTypes.includes(bro.attackType)) {
          bro.attackSpeed = Math.round(bro.attackSpeed * (1 - b.ratio));
        }
        break;
    }
  });
};

/**
 * 游戏状态 composable
 * @returns {Object} 游戏状态和方法
 */
export const useGame = () => {
  const phase = ref(PHASE.START);
  const round = ref(0);
  const gold = ref(START_GOLD);
  const bros = reactive([]);
  const relics = reactive([]);
  const shopChoices = ref([]);
  const relicCandidates = ref([]);
  const reforgeCost = ref(RELIC_REFORGE_BASE_COST);
  const battleResult = ref(null);
  const totalRounds = ROUNDS.length;

  const isEndless = ref(false);
  const endlessWave = ref(0);
  const endlessEnemyConfig = ref(null);
  const endlessStatMult = ref(1);

  let instanceCounter = 0;

  const aliveBros = computed(() => bros.filter((b) => b.alive));

  const activeSynergies = computed(() => calcActiveSynergies(bros));

  const currentRoundData = computed(() => {
    if (isEndless.value) return endlessEnemyConfig.value;
    return ROUNDS[round.value];
  });

  const isLastRound = computed(() => round.value >= totalRounds - 1);

  const currentMaxBros = computed(() => {
    if (isEndless.value) return getMaxBros(totalRounds - 1 + endlessWave.value);
    return getMaxBros(round.value);
  });

  const currentEnemyConfig = computed(() => {
    if (isEndless.value) return endlessEnemyConfig.value;
    return ROUNDS[round.value];
  });

  const currentStatMult = computed(() => {
    if (isEndless.value) return endlessStatMult.value;
    return 1;
  });


  const startNewGame = () => {
    phase.value = PHASE.SHOP;
    round.value = 0;
    gold.value = START_GOLD;
    bros.splice(0, bros.length);
    relics.splice(0, relics.length);
    instanceCounter = 0;
    shopChoices.value = generateShopChoices();
    relicCandidates.value = [];
    reforgeCost.value = RELIC_REFORGE_BASE_COST;
    battleResult.value = null;
    isEndless.value = false;
    endlessWave.value = 0;
    endlessEnemyConfig.value = null;
    endlessStatMult.value = 1;
  };

  const buyBro = (broDef) => {
    if (gold.value < broDef.cost) return false;
    if (bros.length >= currentMaxBros.value) return false;
    const dupCount = bros.filter((b) => b.defId === broDef.id).length;
    if (dupCount >= MAX_DUPLICATES) return false;

    gold.value -= broDef.cost;
    const instance = createBroInstance(broDef.id, ++instanceCounter);
    applyRelicEffects(instance, relics);
    applySynergyEffects(instance, calcActiveSynergies([...bros, instance]));
    instance.hp = instance.maxHp;
    bros.push(instance);

    recalcAllBros();
    return true;
  };

  /**
   * 升级兄弟
   * @param {number} instanceId - 兄弟实例 id
   * @param {string} upgradeId - 升级类型 id: attack/maxHp/attackSpeed/moveSpeed
   * @returns {boolean} 是否升级成功
   */
  const upgradeBro = (instanceId, upgradeId) => {
    const bro = bros.find((b) => b.instanceId === instanceId);
    if (!bro) return false;

    const def = getUpgradeDef(upgradeId);
    if (!def) return false;

    const currentLevel = bro.upgradeLevels[upgradeId] || 0;
    if (currentLevel >= def.maxLevel) return false;

    const cost = getUpgradeCost(upgradeId, currentLevel);
    if (gold.value < cost) return false;

    gold.value -= cost;
    bro.upgradeLevels[upgradeId] = currentLevel + 1;
    recalcAllBros();
    bro.hp = bro.maxHp;
    return true;
  };

  const rerollShop = () => {
    if (gold.value < REROLL_COST) return false;
    gold.value -= REROLL_COST;
    shopChoices.value = generateShopChoices();
    return true;
  };

  const recalcAllBros = () => {
    const syns = calcActiveSynergies(bros);
    bros.forEach((bro) => {
      applyRelicEffects(bro, relics);
      applySynergyEffects(bro, syns);
    });
  };

  const sellBro = (instanceId) => {
    const idx = bros.findIndex((b) => b.instanceId === instanceId);
    if (idx === -1) return;
    gold.value += 1;
    bros.splice(idx, 1);
    recalcAllBros();
  };

  const pickRelic = (relicId) => {
    const existing = relics.find((r) => r.id === relicId);
    if (existing) {
      existing.count++;
    } else {
      relics.push({ id: relicId, count: 1 });
    }
    relicCandidates.value = [];
    recalcAllBros();
    proceedToNextRound();
  };

  const skipRelic = () => {
    relicCandidates.value = [];
    proceedToNextRound();
  };

  const reforgeRelics = () => {
    if (gold.value < reforgeCost.value) return false;
    if (relicCandidates.value.length === 0) return false;
    gold.value -= reforgeCost.value;
    relicCandidates.value = generateRelicCandidates(relics);
    reforgeCost.value += RELIC_REFORGE_INCREMENT;
    return true;
  };

  const proceedToNextRound = () => {
    const extraGold = relics
      .filter((r) => RELIC_MAP[r.id]?.effect.type === 'extraGold')
      .reduce((s, r) => s + RELIC_MAP[r.id].effect.value * r.count, 0);
    gold.value += extraGold;

    if (isEndless.value) {
      endlessWave.value++;
      const wave = generateEndlessWave(endlessWave.value);
      endlessEnemyConfig.value = wave;
      endlessStatMult.value = wave.statMult;
      shopChoices.value = generateShopChoices();
      phase.value = PHASE.SHOP;
      return;
    }

    if (round.value >= totalRounds - 1) {
      phase.value = PHASE.VICTORY;
      return;
    }
    round.value++;
    shopChoices.value = generateShopChoices();
    phase.value = PHASE.SHOP;
  };

  /** 开始无尽模式（通关后选择） */
  const startEndless = () => {
    isEndless.value = true;
    endlessWave.value = 0;
    const wave = generateEndlessWave(0);
    endlessEnemyConfig.value = wave;
    endlessStatMult.value = wave.statMult;
    shopChoices.value = generateShopChoices();
    bros.forEach((bro) => {
      bro.alive = true;
      bro.hp = bro.maxHp;
      bro.revived = false;
      bro.relicReviveCount = 0;
      bro.target = null;
      bro.lastAttackTime = 0;
      bro.lastLassoTime = 0;
    });
    phase.value = PHASE.SHOP;
  };

  const startBattle = () => {
    bros.forEach((bro) => {
      bro.alive = true;
      bro.hp = bro.maxHp;
      bro.revived = false;
      bro.relicReviveCount = 0;
      bro.target = null;
      bro.lastAttackTime = 0;
      bro.lastLassoTime = 0;
    });
    phase.value = PHASE.BATTLE;
  };

  /**
   * 战斗结束回调
   * @param {boolean} victory - 是否胜利
   */
  const endBattle = (victory) => {
    battleResult.value = { victory, round: round.value };

    if (!victory) {
      phase.value = PHASE.GAME_OVER;
      return;
    }

    // 胜利后全体兄弟原地复活
    bros.forEach((bro) => {
      bro.alive = true;
      bro.hp = bro.maxHp;
      bro.revived = false;
      bro.relicReviveCount = 0;
      bro.blessEndTime = 0;
      bro.lastChargeTime = 0;
      bro.lastAttackTime = 0;
      bro.lastLassoTime = 0;
    });

    const reward = isEndless.value
      ? endlessEnemyConfig.value?.reward || 5
      : ROUNDS[round.value]?.reward || 0;
    gold.value += reward;

    const candidates = generateRelicCandidates(relics);
    if (candidates.length > 0) {
      relicCandidates.value = candidates;
      reforgeCost.value = RELIC_REFORGE_BASE_COST;
      phase.value = PHASE.BATTLE_RESULT;
    } else {
      proceedToNextRound();
    }
  };

  const backToStart = () => {
    phase.value = PHASE.START;
    isEndless.value = false;
    endlessWave.value = 0;
    endlessEnemyConfig.value = null;
    endlessStatMult.value = 1;
  };

  return {
    phase,
    round,
    gold,
    bros,
    relics,
    shopChoices,
    relicCandidates,
    reforgeCost,
    battleResult,
    totalRounds,
    isEndless,
    endlessWave,
    aliveBros,
    activeSynergies,
    currentRoundData,
    isLastRound,
    currentMaxBros,
    currentEnemyConfig,
    currentStatMult,
    startNewGame,
    buyBro,
    upgradeBro,
    rerollShop,
    sellBro,
    pickRelic,
    skipRelic,
    reforgeRelics,
    startBattle,
    startEndless,
    endBattle,
    backToStart,
    recalcAllBros,
  };
};
