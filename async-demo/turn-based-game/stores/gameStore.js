import { reactive, watch } from "vue";

const STORAGE_KEY = "turn_based_game_save";

// 基础数据
const SKILLS = [
  {
    id: 1,
    name: "火球术",
    type: "magic",
    damage: 35,
    cost: 20,
    targetType: "single",
    description: "消耗20法力，对单个敌人造成35点法术伤害",
  },
  {
    id: 2,
    name: "冰锥术",
    type: "magic",
    damage: 25,
    cost: 15,
    targetType: "all",
    description: "消耗15法力，对所有敌人造成25点法术伤害",
  },
  {
    id: 3,
    name: "雷霆一击",
    type: "magic",
    damage: 50,
    cost: 35,
    targetType: "single",
    description: "消耗35法力，对单个敌人造成50点法术伤害",
  },
];

const ENEMIES = [
  {
    id: 1,
    name: "史莱姆",
    hp: 50,
    maxHp: 50,
    attack: 8,
    defense: 2,
    speed: 5,
    exp: 20,
    level: 1,
  },
  {
    id: 2,
    name: "哥布林",
    hp: 80,
    maxHp: 80,
    attack: 12,
    defense: 5,
    speed: 8,
    exp: 35,
    level: 2,
  },
  {
    id: 3,
    name: "骷髅兵",
    hp: 120,
    maxHp: 120,
    attack: 18,
    defense: 8,
    speed: 6,
    exp: 50,
    level: 3,
  },
  {
    id: 4,
    name: "暗影狼",
    hp: 150,
    maxHp: 150,
    attack: 22,
    defense: 10,
    speed: 12,
    exp: 70,
    level: 4,
  },
  {
    id: 5,
    name: "石像鬼",
    hp: 200,
    maxHp: 200,
    attack: 25,
    defense: 15,
    speed: 7,
    exp: 100,
    level: 5,
  },
];

const ITEMS = [
  {
    id: 1,
    name: "生命药水",
    type: "heal",
    value: 50,
    description: "恢复50点生命值",
  },
  {
    id: 2,
    name: "法力药水",
    type: "mana",
    value: 30,
    description: "恢复30点法力值",
  },
  {
    id: 3,
    name: "大生命药水",
    type: "heal",
    value: 100,
    description: "恢复100点生命值",
  },
  {
    id: 4,
    name: "大法力药水",
    type: "mana",
    value: 100,
    description: "恢复100点法力值",
  },
];

// 装备数据
const EQUIPMENT_TYPES = [
  "weapon",
  "necklace",
  "crown",
  "jade",
  "chest",
  "legs",
  "shoes",
  "leftRing",
  "rightRing",
  "belt",
];

// 装备名称前缀
const EQUIPMENT_PREFIXES = [
  "破旧",
  "生锈",
  "普通",
  "精炼",
  "精良",
  "精钢",
  "秘银",
  "龙鳞",
  "暗影",
  "神圣",
  "元素",
  "永恒",
  "传奇",
  "史诗",
  "神话",
  "远古",
  "深渊",
  "光明",
  "黑暗",
  "烈焰",
];

// 装备名称后缀
const EQUIPMENT_SUFFIXES = {
  weapon: [
    "短剑",
    "长剑",
    "利剑",
    "宝刀",
    "神剑",
    "匕首",
    "长刀",
    "巨剑",
    "魔剑",
    "圣剑",
    "暗刃",
    "光刃",
    "炎刃",
    "冰刃",
    "雷刃",
    "风刃",
    "地刃",
    "水刃",
    "火刃",
    "金刃",
  ],
  necklace: [
    "项链",
    "护符",
    "项圈",
    "项坠",
    "挂饰",
    "坠饰",
    "护符",
    "神符",
    "魔符",
    "灵符",
    "玉符",
    "水晶",
    "宝石",
    "钻石",
    "玛瑙",
    "翡翠",
    "琥珀",
    "珊瑚",
    "珍珠",
    "黑曜",
  ],
  crown: [
    "头冠",
    "王冠",
    "头盔",
    "羽冠",
    "皇冠",
    "银冠",
    "金冠",
    "秘冠",
    "神冠",
    "魔冠",
    "灵冠",
    "王冕",
    "帝冕",
    "圣冕",
    "暗冕",
    "光冕",
    "炎冕",
    "冰冕",
    "雷冕",
    "风冕",
  ],
  jade: [
    "玉佩",
    "玉坠",
    "玉牌",
    "玉符",
    "玉饰",
    "龙佩",
    "凤佩",
    "虎佩",
    "麒麟佩",
    "玄武佩",
    "朱雀佩",
    "青龙佩",
    "白虎佩",
    "灵玉",
    "魂玉",
    "神玉",
    "魔玉",
    "仙玉",
    "佛玉",
    "道玉",
  ],
  chest: [
    "皮甲",
    "布甲",
    "锁子甲",
    "板甲",
    "铠甲",
    "重甲",
    "轻甲",
    "魔甲",
    "神甲",
    "龙甲",
    "凤甲",
    "金甲",
    "银甲",
    "铜甲",
    "铁甲",
    "石甲",
    "木甲",
    "水甲",
    "火甲",
    "风甲",
  ],
  legs: [
    "布裤",
    "皮裤",
    "护腿",
    "腿甲",
    "裤甲",
    "战裤",
    "神裤",
    "魔裤",
    "龙裤",
    "凤裤",
    "金裤",
    "银裤",
    "铜裤",
    "铁裤",
    "石裤",
    "木裤",
    "水裤",
    "火裤",
    "风裤",
    "雷裤",
  ],
  shoes: [
    "布鞋",
    "皮鞋",
    "皮靴",
    "战靴",
    "神靴",
    "魔靴",
    "龙靴",
    "凤靴",
    "金靴",
    "银靴",
    "铜靴",
    "铁靴",
    "石靴",
    "木靴",
    "水靴",
    "火靴",
    "风靴",
    "雷靴",
    "地靴",
    "云靴",
  ],
  leftRing: [
    "戒指",
    "指环",
    "戒环",
    "神戒",
    "魔戒",
    "龙戒",
    "凤戒",
    "金戒",
    "银戒",
    "铜戒",
    "铁戒",
    "石戒",
    "木戒",
    "水戒",
    "火戒",
    "风戒",
    "雷戒",
    "地戒",
    "灵戒",
    "魂戒",
  ],
  rightRing: [
    "戒指",
    "指环",
    "戒环",
    "神戒",
    "魔戒",
    "龙戒",
    "凤戒",
    "金戒",
    "银戒",
    "铜戒",
    "铁戒",
    "石戒",
    "木戒",
    "水戒",
    "火戒",
    "风戒",
    "雷戒",
    "地戒",
    "灵戒",
    "魂戒",
  ],
  belt: [
    "腰带",
    "腰封",
    "护腰",
    "神带",
    "魔带",
    "龙带",
    "凤带",
    "金带",
    "银带",
    "铜带",
    "铁带",
    "石带",
    "木带",
    "水带",
    "火带",
    "风带",
    "雷带",
    "地带",
    "灵带",
    "魂带",
  ],
};

// 20种属性词条库（每种装备通用）
const AFFIX_LIBRARY = [
  {
    stat: "physicalAttack",
    values: [2, 4, 6, 10, 15, 20, 25, 30],
    name: "物理攻击",
  },
  {
    stat: "magicAttack",
    values: [2, 4, 6, 10, 15, 20, 25, 30],
    name: "法术攻击",
  },
  { stat: "defense", values: [1, 2, 3, 5, 8, 12, 16, 20], name: "防御" },
  { stat: "speed", values: [1, 2, 3, 5, 8, 12, 16, 20], name: "速度" },
  { stat: "maxHp", values: [10, 20, 30, 50, 80, 120, 160, 200], name: "生命" },
  { stat: "maxMp", values: [5, 10, 15, 25, 40, 60, 80, 100], name: "法力" },
  {
    stat: "physicalAttack",
    values: [3, 6, 9, 15, 22, 30, 38, 45],
    name: "强力物理攻击",
  },
  {
    stat: "magicAttack",
    values: [3, 6, 9, 15, 22, 30, 38, 45],
    name: "强力法术攻击",
  },
  { stat: "defense", values: [2, 4, 6, 10, 16, 24, 32, 40], name: "坚固防御" },
  { stat: "speed", values: [2, 4, 6, 10, 16, 24, 32, 40], name: "迅捷速度" },
  {
    stat: "maxHp",
    values: [15, 30, 45, 75, 120, 180, 240, 300],
    name: "强壮生命",
  },
  {
    stat: "maxMp",
    values: [8, 16, 24, 40, 64, 96, 128, 160],
    name: "浩瀚法力",
  },
  {
    stat: "physicalAttack",
    values: [1, 3, 5, 8, 12, 17, 22, 28],
    name: "物理攻击+小",
  },
  {
    stat: "magicAttack",
    values: [1, 3, 5, 8, 12, 17, 22, 28],
    name: "法术攻击+小",
  },
  { stat: "defense", values: [1, 2, 4, 6, 10, 14, 18, 24], name: "防御+小" },
  { stat: "speed", values: [1, 2, 4, 6, 10, 14, 18, 24], name: "速度+小" },
  { stat: "maxHp", values: [8, 15, 25, 40, 60, 90, 120, 150], name: "生命+小" },
  { stat: "maxMp", values: [4, 8, 14, 22, 32, 48, 64, 80], name: "法力+小" },
  {
    stat: "physicalAttack",
    values: [5, 8, 12, 18, 26, 35, 44, 55],
    name: "物理攻击+大",
  },
  {
    stat: "magicAttack",
    values: [5, 8, 12, 18, 26, 35, 44, 55],
    name: "法术攻击+大",
  },
];

// 装备稀有度配置
const RARITY_CONFIG = {
  common: { weight: 50, maxAffixes: 2, affixMultiplier: 0 },
  uncommon: { weight: 30, maxAffixes: 3, affixMultiplier: 1 },
  rare: { weight: 15, maxAffixes: 4, affixMultiplier: 2 },
  epic: { weight: 4, maxAffixes: 5, affixMultiplier: 3 },
  legendary: { weight: 1, maxAffixes: 5, affixMultiplier: 5 },
};

const RARITY_COLORS = {
  common: "#9ca3af",
  uncommon: "#22c55e",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
};

const RARITY_NAMES = {
  common: "普通",
  uncommon: "优秀",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说",
};

// 从词条库随机生成属性
const generateRandomStats = (rarity) => {
  const config = RARITY_CONFIG[rarity];
  const stats = {};
  const usedAffixes = new Set();

  // 随机生成0到maxAffixes个词条
  const affixCount = Math.floor(Math.random() * (config.maxAffixes + 1));

  for (let i = 0; i < affixCount; i++) {
    let affixIndex;
    do {
      affixIndex = Math.floor(Math.random() * AFFIX_LIBRARY.length);
    } while (usedAffixes.has(affixIndex));

    usedAffixes.add(affixIndex);
    const affix = AFFIX_LIBRARY[affixIndex];
    const valueIndex = Math.min(
      config.affixMultiplier + Math.floor(Math.random() * 3),
      affix.values.length - 1,
    );
    const value = affix.values[valueIndex];

    if (stats[affix.stat]) {
      stats[affix.stat] += value;
    } else {
      stats[affix.stat] = value;
    }
  }

  return stats;
};

// 生成装备名称
const generateEquipmentName = (type) => {
  const prefix =
    EQUIPMENT_PREFIXES[Math.floor(Math.random() * EQUIPMENT_PREFIXES.length)];
  const suffixList = EQUIPMENT_SUFFIXES[type];
  const suffix = suffixList[Math.floor(Math.random() * suffixList.length)];
  return prefix + suffix;
};

// 获取随机稀有度
const getRandomRarity = () => {
  const rarities = Object.keys(RARITY_CONFIG);
  const weights = rarities.map((r) => RARITY_CONFIG[r].weight);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < rarities.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return rarities[i];
    }
  }
  return rarities[0];
};

// 获取随机装备等级（基于玩家等级）
const getRandomEquipmentLevel = (playerLevel) => {
  const minLevel = Math.max(1, playerLevel - 2);
  const maxLevel = playerLevel + 5;
  return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
};

// 基础属性系数（根据装备类型）
const BASE_STATS_BY_TYPE = {
  weapon: { physicalAttack: 5, magicAttack: 2 },
  necklace: { maxHp: 20, maxMp: 10 },
  crown: { defense: 3, magicAttack: 3 },
  jade: { maxMp: 15, magicAttack: 2 },
  chest: { defense: 5, maxHp: 30 },
  legs: { defense: 3, speed: 2 },
  shoes: { speed: 3, defense: 1 },
  leftRing: { physicalAttack: 3, speed: 1 },
  rightRing: { magicAttack: 3, maxMp: 5 },
  belt: { maxHp: 15, defense: 2 },
};

// 等级增长系数
const LEVEL_MULTIPLIER = {
  physicalAttack: 2,
  magicAttack: 2,
  defense: 1.5,
  speed: 1,
  maxHp: 10,
  maxMp: 5,
};

// 生成装备基础属性（基于等级）
const generateBaseStats = (type, level) => {
  const baseStats = BASE_STATS_BY_TYPE[type] || {};
  const stats = {};

  for (const [stat, baseValue] of Object.entries(baseStats)) {
    const multiplier = LEVEL_MULTIPLIER[stat] || 1;
    stats[stat] = Math.floor(baseValue + (level - 1) * multiplier);
  }

  return stats;
};

// 获取随机装备
const getRandomEquipment = (playerLevel = 1) => {
  const type =
    EQUIPMENT_TYPES[Math.floor(Math.random() * EQUIPMENT_TYPES.length)];
  const rarity = getRandomRarity();
  const level = getRandomEquipmentLevel(playerLevel);

  // 基础属性（基于等级）
  const baseStats = generateBaseStats(type, level);

  // 词条属性（随机生成）
  const affixes = generateRandomStats(rarity);

  // 合并基础属性和词条属性
  const stats = { ...baseStats };
  for (const [stat, value] of Object.entries(affixes)) {
    stats[stat] = (stats[stat] || 0) + value;
  }

  const name = generateEquipmentName(type);

  return {
    uid: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    id: `${type}_${Date.now()}`,
    name,
    type,
    rarity,
    level,
    baseStats,
    affixes,
    stats,
    description: `Lv.${level} ${RARITY_NAMES[rarity]}的${name}`,
  };
};

// 初始玩家数据
const initialPlayer = {
  name: "勇者",
  level: 1,
  exp: 0,
  expToNext: 50,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  physicalAttack: 10,
  magicAttack: 5,
  defense: 5,
  speed: 10,
  freePoints: 0,
  x: 400,
  y: 300,
  gold: 100,
  skills: [SKILLS[0]],
  inventory: [
    { ...ITEMS[0], count: 3 },
    { ...ITEMS[1], count: 2 },
  ],
  equipment: {},
  equipmentBag: [],
};

// 初始地图敌人
const generateMapEnemies = () => {
  return [
    { ...ENEMIES[0], x: 200, y: 200, id: "enemy_1" },
    { ...ENEMIES[1], x: 600, y: 150, id: "enemy_2" },
    { ...ENEMIES[0], x: 150, y: 400, id: "enemy_3" },
    { ...ENEMIES[2], x: 500, y: 450, id: "enemy_4" },
    { ...ENEMIES[1], x: 300, y: 500, id: "enemy_5" },
  ];
};

// 加载存档
const loadSave = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("加载存档失败", e);
  }
  return null;
};

// 保存游戏
const saveGame = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("保存游戏失败", e);
  }
};

const savedData = loadSave();

// 确保存档数据有equipmentBag属性
const loadPlayerData = () => {
  if (savedData && savedData.player) {
    return {
      ...initialPlayer,
      ...savedData.player,
      equipmentBag: savedData.player.equipmentBag || [],
    };
  }
  return { ...initialPlayer };
};

export const gameState = reactive({
  screen: "map", // map, battle, character
  player: loadPlayerData(),
  mapEnemies: savedData ? savedData.mapEnemies : generateMapEnemies(),
  currentBattle: null,
  battleLog: [],
  battleResult: null,
  defeatedEnemyId: null,

  SKILLS,
  ENEMIES,
  ITEMS,
});

// 监听状态变化自动保存
watch(
  () => ({ player: gameState.player, mapEnemies: gameState.mapEnemies }),
  (newState) => {
    saveGame(newState);
  },
  { deep: true },
);

// 游戏操作
export const gameActions = {
  // 重置游戏
  resetGame() {
    gameState.player = { ...initialPlayer };
    gameState.mapEnemies = generateMapEnemies();
    gameState.screen = "map";
    gameState.currentBattle = null;
    gameState.battleLog = [];
    gameState.battleResult = null;
  },

  // 切换屏幕
  setScreen(screen) {
    gameState.screen = screen;
  },

  // 移动玩家
  movePlayer(dx, dy) {
    const newX = Math.max(30, Math.min(770, gameState.player.x + dx));
    const newY = Math.max(30, Math.min(570, gameState.player.y + dy));
    gameState.player.x = newX;
    gameState.player.y = newY;
  },

  // 开始战斗
  startBattle(enemy) {
    gameState.defeatedEnemyId = null;
    gameState.battleLog = [];
    gameState.battleResult = null;

    // 复制敌人数据用于战斗
    const battleEnemy = { ...enemy };

    // 初始化战斗状态
    gameState.currentBattle = {
      enemy: battleEnemy,
      playerTurn: gameState.player.speed >= enemy.speed,
      playerDefending: false,
    };

    gameState.screen = "battle";
    gameState.battleLog.push("战斗开始！");
    gameState.battleLog.push(
      gameState.currentBattle.playerTurn ? "你先手行动" : "敌人先手行动",
    );
  },

  // 玩家普攻
  playerAttack() {
    if (!gameState.currentBattle || !gameState.currentBattle.playerTurn) return;

    const player = gameState.player;
    const enemy = gameState.currentBattle.enemy;
    const damage = Math.max(1, player.physicalAttack - enemy.defense);

    enemy.hp -= damage;
    gameState.battleLog.push(
      `你 使用普通攻击，${enemy.name}受到 ${damage} 点伤害`,
    );

    this.checkBattleEnd();
  },

  // 玩家使用技能
  playerUseSkill(skill) {
    if (!gameState.currentBattle || !gameState.currentBattle.playerTurn) return;

    const player = gameState.player;
    const enemy = gameState.currentBattle.enemy;

    if (player.mp < skill.cost) {
      gameState.battleLog.push("蓝量不足，无法释放技能！");
      return;
    }

    player.mp -= skill.cost;
    const damage = Math.max(
      1,
      player.magicAttack + skill.damage - enemy.defense,
    );
    enemy.hp -= damage;

    gameState.battleLog.push(
      `你 释放 ${skill.name}，${enemy.name}受到 ${damage} 点伤害`,
    );

    this.checkBattleEnd();
  },

  // 玩家使用道具
  playerUseItem(item, index) {
    if (!gameState.currentBattle || !gameState.currentBattle.playerTurn) return;

    const player = gameState.player;

    if (item.type === "heal") {
      const healAmount = Math.min(item.value, player.maxHp - player.hp);
      player.hp += healAmount;
      gameState.battleLog.push(
        `你 使用 ${item.name}，恢复 ${healAmount} 点生命值`,
      );
    } else if (item.type === "mana") {
      const manaAmount = Math.min(item.value, player.maxMp - player.mp);
      player.mp += manaAmount;
      gameState.battleLog.push(
        `你 使用 ${item.name}，恢复 ${manaAmount} 点法力值`,
      );
    }

    // 消耗道具
    const invItem = player.inventory[index];
    invItem.count--;
    if (invItem.count <= 0) {
      player.inventory.splice(index, 1);
    }

    this.endPlayerTurn();
  },

  // 玩家防御
  playerDefend() {
    if (!gameState.currentBattle || !gameState.currentBattle.playerTurn) return;

    gameState.currentBattle.playerDefending = true;
    gameState.battleLog.push("你 进入防御状态，本回合减伤 50%");

    this.endPlayerTurn();
  },

  // 玩家逃跑
  playerFlee() {
    if (!gameState.currentBattle) return;
    gameState.battleLog.push("你 选择逃跑，战斗结束");
    gameState.screen = "map";
    gameState.currentBattle = null;
  },

  // 结束玩家回合
  endPlayerTurn() {
    if (!gameState.currentBattle) return;

    gameState.currentBattle.playerTurn = false;

    // 检查战斗是否结束
    if (gameState.currentBattle.enemy.hp <= 0) {
      return;
    }

    // 延迟执行敌人回合
    setTimeout(() => {
      this.enemyTurn();
    }, 800);
  },

  // 敌人回合
  enemyTurn() {
    if (!gameState.currentBattle) return;

    const player = gameState.player;
    const enemy = gameState.currentBattle.enemy;

    // 敌人AI逻辑
    // 血量低时有概率使用回血（模拟）
    if (enemy.hp < enemy.maxHp * 0.3 && Math.random() < 0.4) {
      const heal = Math.floor(enemy.maxHp * 0.2);
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + heal);
      gameState.battleLog.push(
        `${enemy.name} 使用了治疗道具，恢复 ${heal} 点生命值`,
      );
    } else {
      // 普通攻击
      let damage = Math.max(1, enemy.attack - player.defense);

      // 玩家防御减伤
      if (gameState.currentBattle.playerDefending) {
        damage = Math.floor(damage * 0.5);
      }

      player.hp -= damage;
      gameState.battleLog.push(`${enemy.name} 攻击你，你受到 ${damage} 点伤害`);
    }

    // 清除防御状态
    gameState.currentBattle.playerDefending = false;

    // 检查战斗结束
    if (!this.checkBattleEnd()) {
      gameState.currentBattle.playerTurn = true;
    }
  },

  // 检查战斗是否结束
  checkBattleEnd() {
    const player = gameState.player;
    const enemy = gameState.currentBattle.enemy;

    if (enemy.hp <= 0) {
      // 玩家胜利
      this.battleVictory();
      return true;
    }

    if (player.hp <= 0) {
      // 玩家失败
      this.battleDefeat();
      return true;
    }

    return false;
  },

  // 战斗胜利
  battleVictory() {
    const player = gameState.player;
    const enemy = gameState.currentBattle.enemy;

    gameState.battleResult = "victory";
    gameState.battleLog.push(`战斗胜利！你击败了 ${enemy.name}`);

    // 获得经验
    player.exp += enemy.exp;
    gameState.battleLog.push(`获得 ${enemy.exp} 点经验值`);

    // 获得金币
    const goldReward = Math.floor(enemy.level * 10 + Math.random() * 20);
    player.gold += goldReward;
    gameState.battleLog.push(`获得 ${goldReward} 金币！`);

    // 检查升级
    while (player.exp >= player.expToNext) {
      this.levelUp();
    }

    // 概率获得道具
    if (Math.random() < 0.5) {
      const dropItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      const existingItem = player.inventory.find((i) => i.id === dropItem.id);
      if (existingItem) {
        existingItem.count++;
      } else {
        player.inventory.push({ ...dropItem, count: 1 });
      }
      gameState.battleLog.push(`获得 ${dropItem.name}！`);
    }

    // 概率获得技能书（解锁新技能）
    if (Math.random() < 0.2 && player.skills.length < SKILLS.length) {
      const unlockedSkillIds = player.skills.map((s) => s.id);
      const availableSkills = SKILLS.filter(
        (s) => !unlockedSkillIds.includes(s.id),
      );
      if (availableSkills.length > 0) {
        const newSkill =
          availableSkills[Math.floor(Math.random() * availableSkills.length)];
        player.skills.push(newSkill);
        gameState.battleLog.push(`学会了新技能：${newSkill.name}！`);
      }
    }

    // 概率获得装备
    if (Math.random() < 0.3) {
      const equipment = getRandomEquipment(player.level);
      player.equipmentBag.push(equipment);
      const rarityText = {
        common: "普通",
        uncommon: "优秀",
        rare: "稀有",
        epic: "史诗",
        legendary: "传说",
      };
      gameState.battleLog.push(
        `获得 Lv.${equipment.level} ${rarityText[equipment.rarity]}装备：${equipment.name}！`,
      );
    }

    // 记录击败的敌人ID，从地图移除
    gameState.defeatedEnemyId = enemy.id;
  },

  // 战斗失败
  battleDefeat() {
    gameState.battleResult = "defeat";
    gameState.battleLog.push("战斗失败...");
  },

  // 升级
  levelUp() {
    const player = gameState.player;

    player.exp -= player.expToNext;
    player.level++;
    player.expToNext = Math.floor(player.expToNext * 1.5);

    // 基础属性提升
    player.physicalAttack++;
    player.magicAttack++;
    player.defense++;
    player.speed++;
    player.maxHp += 10;
    player.hp = player.maxHp;
    player.maxMp += 5;
    player.mp = player.maxMp;

    // 获得自由属性点
    player.freePoints += 5;

    gameState.battleLog.push(`升级了！当前等级：${player.level}`);
  },

  // 自由属性点分配
  allocatePoints(stat, points) {
    const player = gameState.player;
    if (player.freePoints < points) return;

    player.freePoints -= points;

    switch (stat) {
      case "physicalAttack":
        player.physicalAttack += points * 3;
        break;
      case "magicAttack":
        player.magicAttack += points;
        break;
      case "defense":
        player.defense += points;
        break;
      case "speed":
        player.speed += points;
        break;
      case "maxHp":
        player.maxHp += points * 5;
        player.hp += points * 5;
        break;
    }
  },

  // 计算装备总属性加成
  calculateEquipmentStats() {
    const player = gameState.player;
    const stats = {
      physicalAttack: 0,
      magicAttack: 0,
      defense: 0,
      speed: 0,
      maxHp: 0,
      maxMp: 0,
    };

    for (const slot in player.equipment) {
      const equip = player.equipment[slot];
      if (equip && equip.stats) {
        for (const stat in equip.stats) {
          if (stats[stat] !== undefined) {
            stats[stat] += equip.stats[stat];
          }
        }
      }
    }

    return stats;
  },

  // 穿戴装备
  equipItem(equipment, index) {
    const player = gameState.player;
    const slot = equipment.type;

    // 卸下当前装备（如果有）
    if (player.equipment[slot]) {
      player.equipmentBag.push(player.equipment[slot]);
    }

    // 装备新装备
    player.equipment[slot] = equipment;

    // 从背包移除
    player.equipmentBag.splice(index, 1);
  },

  // 卸下装备
  unequipItem(slot) {
    const player = gameState.player;
    if (player.equipment[slot]) {
      player.equipmentBag.push(player.equipment[slot]);
      delete player.equipment[slot];
    }
  },

  // 出售装备
  sellEquipment(index) {
    const player = gameState.player;
    if (index >= 0 && index < player.equipmentBag.length) {
      player.equipmentBag.splice(index, 1);
    }
  },

  // 出售道具
  sellItem(index) {
    const player = gameState.player;
    if (index >= 0 && index < player.inventory.length) {
      const item = player.inventory[index];
      const sellPrice = Math.floor(item.value * 0.5);
      player.gold += sellPrice;
      player.inventory.splice(index, 1);
      return sellPrice;
    }
    return 0;
  },

  // 购买道具
  buyItem(item) {
    const player = gameState.player;
    const buyPrice = item.value;

    if (player.gold < buyPrice) {
      return false;
    }

    player.gold -= buyPrice;
    const existingItem = player.inventory.find((i) => i.id === item.id);
    if (existingItem) {
      existingItem.count++;
    } else {
      player.inventory.push({ ...item, count: 1 });
    }
    return true;
  },

  // 购买装备（无词条，只有基础属性）
  buyEquipment(type) {
    const player = gameState.player;
    const level = player.level;
    const baseStats = generateBaseStats(type, level);
    const name = generateEquipmentName(type);

    // 计算价格（基于等级和类型）
    const typePrice = {
      weapon: 100,
      necklace: 80,
      crown: 80,
      jade: 70,
      chest: 120,
      legs: 100,
      shoes: 60,
      leftRing: 70,
      rightRing: 70,
      belt: 80,
    };
    const price = Math.floor((typePrice[type] || 50) * (1 + (level - 1) * 0.2));

    if (player.gold < price) {
      return false;
    }

    player.gold -= price;

    const equipment = {
      uid: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      id: `${type}_${Date.now()}`,
      name,
      type,
      rarity: "common",
      level,
      baseStats,
      affixes: {},
      stats: baseStats,
      description: `Lv.${level} 普通的${name}`,
    };

    player.equipmentBag.push(equipment);
    return equipment;
  },

  // 刷新装备词条
  refreshEquipmentAffixes(index) {
    const player = gameState.player;
    if (index < 0 || index >= player.equipmentBag.length) {
      return false;
    }

    const equipment = player.equipmentBag[index];
    const refreshCost = Math.floor(50 * equipment.level);

    if (player.gold < refreshCost) {
      return false;
    }

    player.gold -= refreshCost;

    // 重新生成词条属性（保留基础属性）
    const type = equipment.type;
    const level = equipment.level;
    const baseStats = generateBaseStats(type, level);
    const affixes = generateRandomStats(equipment.rarity);

    // 合并基础属性和新的词条属性
    const newStats = { ...baseStats };
    for (const [stat, value] of Object.entries(affixes)) {
      newStats[stat] = (newStats[stat] || 0) + value;
    }

    equipment.baseStats = baseStats;
    equipment.affixes = affixes;
    equipment.stats = newStats;
    return true;
  },

  // 计算装备售价
  getEquipmentSellPrice(equipment) {
    const typePrice = {
      weapon: 50,
      necklace: 40,
      crown: 40,
      jade: 35,
      chest: 60,
      legs: 50,
      shoes: 30,
      leftRing: 35,
      rightRing: 35,
      belt: 40,
    };
    const rarityMultiplier = {
      common: 1,
      uncommon: 1.5,
      rare: 2,
      epic: 3,
      legendary: 5,
    };
    const basePrice = typePrice[equipment.type] || 25;
    const multiplier = rarityMultiplier[equipment.rarity] || 1;
    return Math.floor(basePrice * equipment.level * multiplier * 0.5);
  },

  // 出售装备（获得金币）
  sellEquipmentForGold(index) {
    const player = gameState.player;
    if (index < 0 || index >= player.equipmentBag.length) {
      return 0;
    }

    const equipment = player.equipmentBag[index];
    const sellPrice = this.getEquipmentSellPrice(equipment);

    player.gold += sellPrice;
    player.equipmentBag.splice(index, 1);
    return sellPrice;
  },

  // 从地图移除敌人
  removeEnemyFromMap() {
    if (gameState.defeatedEnemyId) {
      const index = gameState.mapEnemies.findIndex(
        (e) => e.id === gameState.defeatedEnemyId,
      );
      if (index !== -1) {
        gameState.mapEnemies.splice(index, 1);
      }
    }
  },

  // 结束战斗返回地图
  endBattle() {
    this.removeEnemyFromMap();
    gameState.screen = "map";
    gameState.currentBattle = null;

    // 如果地图敌人少于3个，刷新一些敌人
    if (gameState.mapEnemies.length < 3) {
      const refreshCount = 3 - gameState.mapEnemies.length;
      for (let i = 0; i < refreshCount; i++) {
        const randomEnemy =
          ENEMIES[
            Math.floor(
              Math.random() * Math.min(gameState.player.level, ENEMIES.length),
            )
          ];
        gameState.mapEnemies.push({
          ...randomEnemy,
          id: `enemy_${Date.now()}_${i}`,
          x: 100 + Math.random() * 600,
          y: 100 + Math.random() * 400,
        });
      }
    }
  },
};
