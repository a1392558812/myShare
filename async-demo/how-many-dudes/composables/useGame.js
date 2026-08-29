import { ref, computed, reactive } from 'vue';
import {
  PHASE,
  START_GOLD,
  SHOP_CHOICES,
  REROLL_COST,
  MAX_DUPLICATES,
  MERGE_COST,
  MERGE_STAR_MULT,
  MAX_STAR,
  getTranscendCost,
  RELIC_REFINE_MAX,
  getRelicRefineMult,
  BRO_TABLE,
  RELICS,
  LEGENDARY_RELICS,
  LEGENDARY_RELIC_MAP,
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
  UPGRADE_TYPES,
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
    star: 0,
    transLevels: { attack: 0, maxHp: 0, attackSpeed: 0, moveSpeed: 0 },
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
 * 生成遗物候选列表（3 个）
 * 满层遗物在升格次数未用完时仍会出现（选中 = 升格，全部效果 +25%）
 * 二阶段：已获取的普通遗物全部满层后，传说遗物池接管三选一（未获取的普通遗物视为弃权）
 * @param {Array<Object>} ownedRelics - 已拥有遗物 [{ id, count, refine }]
 * @returns {Array} 遗物定义数组（最多 RELIC_CANDIDATE_COUNT 个）
 */
const generateRelicCandidates = (ownedRelics) => {
  const ownedMap = {};
  ownedRelics.forEach((r) => { ownedMap[r.id] = { count: r.count, refine: r.refine || 0 }; });

  // 二阶段切换：已获取的普通遗物（有 maxStacks 且非传说）全部满层 → 传说池接管
  const ownedNormal = ownedRelics.filter((r) => {
    const def = RELIC_MAP[r.id];
    return def && def.maxStacks && !LEGENDARY_RELIC_MAP[r.id];
  });
  const legendaryUnlocked = ownedNormal.length > 0 && ownedNormal.every((r) => r.count >= RELIC_MAP[r.id].maxStacks);
  const sourcePool = legendaryUnlocked ? LEGENDARY_RELICS : RELICS;

  const available = sourcePool.filter((r) => {
    if (!r.maxStacks) return true;
    const owned = ownedMap[r.id];
    if (!owned || owned.count < r.maxStacks) return true;
    // 已满层：升格次数未用完仍可作为升格候选
    return owned.refine < RELIC_REFINE_MAX;
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
  // 升星：基础属性 × 1.5^star（在所有强化之前）
  const starMult = Math.pow(MERGE_STAR_MULT, bro.star || 0);
  let maxHp = def.maxHp * starMult;
  let attack = def.attack * starMult;
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
    // 升格倍率：满层遗物可升格，全部效果按比例增强
    const rm = getRelicRefineMult(relic.refine);
    switch (e.type) {
      case 'attackMult':
        attack *= 1 + e.value * stacks * rm;
        break;
      case 'flatAttack':
        attack += e.value * stacks * rm;
        break;
      case 'maxHpMult':
        maxHp *= 1 + e.value * stacks * rm;
        break;
      case 'moveSpeedMult':
        moveSpeed *= 1 + e.value * stacks * rm;
        break;
      case 'attackRangeMult':
        attackRange *= logMult15(stacks) * rm;
        break;
      case 'attackSpeedBoost':
        if (e.targetTypes && e.targetTypes.includes(bro.attackType)) {
          attackSpeed *= 1 - e.ratio * stacks * rm;
        }
        break;
      case 'attackSpeedMult':
        // 攻击间隔乘性缩短：1/(1+v×n×rm)，渐近 0 永不归零（对应攻速翻倍提升）
        attackSpeed *= 1 / (1 + e.value * stacks * rm);
        break;
    }
  });

  bro.maxHp = Math.round(maxHp);
  bro.attack = Math.round(attack);
  bro.moveSpeed = Math.round(moveSpeed * 100) / 100;
  bro.attackSpeed = Math.max(100, Math.round(attackSpeed));
  bro.attackRange = Math.round(attackRange);
  // 升星同步强化衍生技能数值与体型
  bro.healAmount = Math.round((def.healAmount || 0) * starMult);
  bro.explodeDamage = Math.round((def.explodeDamage || 0) * starMult);
  bro.chargeDamage = Math.round((def.chargeDamage || 0) * starMult);
  bro.size = (def.size || 7) + Math.min(3, bro.star || 0);
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
  const endlessHpMult = ref(1);

  let instanceCounter = 0;

  const aliveBros = computed(() => bros.filter((b) => b.alive));

  const activeSynergies = computed(() => calcActiveSynergies(bros));

  /** 传说遗物池是否已解锁：已获取的普通遗物全部满层 */
  const isLegendaryUnlocked = computed(() => {
    const ownedNormal = relics.filter((r) => {
      const def = RELIC_MAP[r.id];
      return def && def.maxStacks && !LEGENDARY_RELIC_MAP[r.id];
    });
    return ownedNormal.length > 0 && ownedNormal.every((r) => r.count >= RELIC_MAP[r.id].maxStacks);
  });

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

  /** 当前敌人血量倍率（无尽模式比攻击更肉，战斗更持久；普通关卡 = 1） */
  const currentHpMult = computed(() => {
    if (isEndless.value) return endlessHpMult.value;
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
    endlessHpMult.value = 1;
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
   * 升级兄弟：普通档线性费用；满级后自动进入"超限档"，费用指数增长，无上限
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
    const trans = bro.transLevels || (bro.transLevels = { attack: 0, maxHp: 0, attackSpeed: 0, moveSpeed: 0 });

    let cost;
    if (currentLevel < def.maxLevel) {
      cost = getUpgradeCost(upgradeId, currentLevel);
    } else {
      // 超限档：费用 baseCost × 4 × 2^超限级
      cost = getTranscendCost(upgradeId, trans[upgradeId] || 0);
    }
    if (gold.value < cost) return false;

    gold.value -= cost;
    if (currentLevel >= def.maxLevel) {
      trans[upgradeId] = (trans[upgradeId] || 0) + 1;
    }
    bro.upgradeLevels[upgradeId] = currentLevel + 1;
    recalcAllBros();
    bro.hp = bro.maxHp;
    return true;
  };

  /**
   * 判断兄弟是否四项强化全部满级（攻击/生命/攻速/移速 ≥ maxLevel，含超限）
   * @param {Object} bro - 兄弟实例
   * @returns {boolean}
   */
  const isFullyMaxed = (bro) =>
    UPGRADE_TYPES.every((u) => (bro.upgradeLevels?.[u.id] || 0) >= u.maxLevel);

  /**
   * 合成升星：将两个同种同星兄弟合并为高一星
   * 前提：双方四项强化都必须满级；继承两者各强化项的最高等级；费用 2 金；星级上限 MAX_STAR
   * @param {number} instanceId - 主动保留的兄弟实例 id
   * @returns {boolean} 是否合成成功
   */
  const mergeBros = (instanceId) => {
    const bro = bros.find((b) => b.instanceId === instanceId);
    if (!bro || (bro.star || 0) >= MAX_STAR) return false;
    if (gold.value < MERGE_COST) return false;
    // 四项强化必须全部满级才有资格参与合成
    if (!isFullyMaxed(bro)) return false;

    // 找同种同星且同样四项满级的另一只（优先吃掉强化等级最低的）
    const others = bros.filter(
      (b) => b.instanceId !== bro.instanceId && b.defId === bro.defId && (b.star || 0) === (bro.star || 0) && isFullyMaxed(b)
    );
    if (others.length === 0) return false;
    const sumLevels = (b) => {
      const lv = b.upgradeLevels || {};
      return (lv.attack || 0) + (lv.maxHp || 0) + (lv.attackSpeed || 0) + (lv.moveSpeed || 0);
    };
    others.sort((a, b) => sumLevels(a) - sumLevels(b));
    const other = others[0];

    gold.value -= MERGE_COST;

    // 继承两者每项强化等级与超限等级的最大值
    const keys = ['attack', 'maxHp', 'attackSpeed', 'moveSpeed'];
    keys.forEach((k) => {
      bro.upgradeLevels[k] = Math.max(bro.upgradeLevels[k] || 0, other.upgradeLevels?.[k] || 0);
      bro.transLevels[k] = Math.max(bro.transLevels?.[k] || 0, other.transLevels?.[k] || 0);
    });

    bro.star = (bro.star || 0) + 1;
    bros.splice(bros.indexOf(other), 1);
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

  /**
   * 选取遗物：未满层 = 叠加层数；已满层且升格未用完 = 升格（全部效果 +25%）
   */
  const pickRelic = (relicId) => {
    const def = RELIC_MAP[relicId];
    const existing = relics.find((r) => r.id === relicId);
    if (existing && def?.maxStacks && existing.count >= def.maxStacks) {
      // 升格
      existing.refine = (existing.refine || 0) + 1;
    } else if (existing) {
      existing.count++;
    } else {
      relics.push({ id: relicId, count: 1, refine: 0 });
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
      .reduce((s, r) => s + Math.round(RELIC_MAP[r.id].effect.value * r.count * getRelicRefineMult(r.refine)), 0);
    gold.value += extraGold;

    if (isEndless.value) {
      endlessWave.value++;
      const wave = generateEndlessWave(endlessWave.value);
      endlessEnemyConfig.value = wave;
      endlessStatMult.value = wave.statMult;
      endlessHpMult.value = wave.hpMult;
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
    endlessHpMult.value = wave.hpMult;
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
    endlessHpMult.value = 1;
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
    isLegendaryUnlocked,
    aliveBros,
    activeSynergies,
    currentRoundData,
    isLastRound,
    currentMaxBros,
    currentEnemyConfig,
    currentStatMult,
    currentHpMult,
    startNewGame,
    buyBro,
    upgradeBro,
    mergeBros,
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
