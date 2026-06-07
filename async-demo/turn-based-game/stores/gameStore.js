import { reactive, watch } from "vue";
import {
  SKILLS_CONFIG,
  ENEMIES_CONFIG,
  ITEMS_CONFIG,
  PLAYER_CONFIG,
  PET_CONFIG,
  GAME_CONFIG,
  STORAGE_KEY,
} from "./constants.js";
import {
  calculatePlayerStats,
  calculatePetStats,
  initialPlayer as initialPlayerState,
  initialPet,
  allocatePoints,
  petAllocatePoints,
  equipItem,
  petEquipItem,
  unequipItem,
  petUnequipItem,
  useItem,
  loadPlayerData,
  loadPetData,
  levelUp,
  petLevelUp,
  movePlayer,
} from "./player.js";
import {
  startBattle,
  handleBattleEnd,
  isPlayerTurn,
  isPetDecisionPhase,
  getCurrentActorName,
  setPlayerDecision,
  setPetDecision,
} from "./battle-flow.js";

import {
  buyItem,
  sellItem,
  buyEquipment,
  refreshEquipmentAffixes,
  refreshSingleBaseAffix,
  refreshSingleBonusAffix,
  sellEquipmentForGold,
  enhanceSkill,
} from "./shop.js";
import {
  generateMapEnemies,
  removeEnemyFromMap,
  refreshMapEnemies,
  generateBattleEnemies,
  convertMapEnemyToBattleEnemy,
  generateExtraBattleEnemies,
} from "./enemy.js";
import { loadSave, saveGame } from "./storage.js";
import {
  getRandomEquipment,
  getEquipmentSellPrice,
  generateCustomEquipment,
  RARITY_NAMES,
} from "./equipment.js";

const savedData = loadSave();
console.log("加载存档:", savedData);
export const gameState = reactive({
  screen: "map",
  player: loadPlayerData(savedData?.player),
  pet: loadPetData(savedData?.pet),
  mapLevel: savedData?.mapLevel || GAME_CONFIG.MAP.DEFAULT_LEVEL,
  mapEnemies: savedData ? savedData.mapEnemies : generateMapEnemies(GAME_CONFIG.MAP.DEFAULT_LEVEL, loadPlayerData(savedData?.player).x, loadPlayerData(savedData?.player).y),
  currentBattle: null,
  battleLog: [],
  battleResult: null,
  defeatedEnemyId: null,

  SKILLS: SKILLS_CONFIG,
  ENEMIES: ENEMIES_CONFIG,
  ITEMS: ITEMS_CONFIG,
});

watch(
  () => ({
    player: gameState.player,
    pet: gameState.pet,
    mapLevel: gameState.mapLevel,
    mapEnemies: gameState.mapEnemies,
  }),
  (newState) => {
    console.log("游戏状态更新:", newState);
    saveGame(newState);
  },
  { deep: true },
);

export const gameActions = {
  resetGame() {
    if (confirm("确定要重置游戏吗？所有进度将丢失！")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  },

  setScreen(screen) {
    gameState.screen = screen;
  },

  movePlayer(dx, dy) {
    movePlayer(gameState.player, dx, dy);
  },

  startBattle(mapEnemy = null) {
    let enemies;
    if (mapEnemy) {
      // 点击地图敌人进入战斗，必出该敌人
      enemies = [convertMapEnemyToBattleEnemy(mapEnemy, 0)];
      
      // 概率生成额外敌人（最多 MAX_COUNT - 1 个，因为已有1个必出）
      const extraCount = Math.floor(Math.random() * (GAME_CONFIG.BATTLE_ENEMIES.MAX_COUNT - 1));
      if (extraCount > 0) {
        const extraEnemies = generateExtraBattleEnemies(extraCount, gameState.mapLevel);
        enemies = enemies.concat(extraEnemies);
      }
    } else {
      // 移动触发的战斗，生成随机敌人
      enemies = generateBattleEnemies(gameState.player.level, gameState.mapLevel);
    }
    startBattle(
      gameState,
      enemies,
      calculatePlayerStats,
      calculatePetStats,
      this.handleBattleEnd.bind(this),
    );
  },

  playerAttack(targetIndex = 0) {
    if (!isPlayerTurn(gameState)) return;
    setPlayerDecision(gameState, { type: "attack", targetIndex });
  },

  playerUseSkill(skill, targetIndex = 0, targetType = "player") {
    if (!isPlayerTurn(gameState)) return;
    setPlayerDecision(gameState, { type: "skill", skill, targetIndex, targetType });
  },

  playerUseItem(item, index, targetType = "player") {
    if (!isPlayerTurn(gameState)) return;
    setPlayerDecision(gameState, { type: "item", item, index, targetType });
  },

  playerDefend() {
    if (!isPlayerTurn(gameState)) return;
    setPlayerDecision(gameState, { type: "defend" });
  },

  playerFlee() {
    if (!isPlayerTurn(gameState)) return;
    setPlayerDecision(gameState, { type: "flee" });
  },

  // 宠物决策相关
  petAttack(targetIndex = 0) {
    if (!isPetDecisionPhase(gameState)) return;
    setPetDecision(gameState, { type: "attack", targetIndex });
  },

  petUseSkill(skill, targetIndex = 0, targetType = "pet") {
    if (!isPetDecisionPhase(gameState)) return;
    setPetDecision(gameState, { type: "skill", skill, targetIndex, targetType });
  },

  petDefend() {
    if (!isPetDecisionPhase(gameState)) return;
    setPetDecision(gameState, { type: "defend" });
  },

  petUseItem(item, itemIndex, targetType = "pet") {
    if (!isPetDecisionPhase(gameState)) return;
    setPetDecision(gameState, { type: "item", item, itemIndex, targetType });
  },

  handleBattleEnd() {
    handleBattleEnd(
      gameState,
      levelUp,
      petLevelUp,
      getRandomEquipment,
      RARITY_NAMES,
      calculatePlayerStats,
      calculatePetStats,
    );
  },

  levelUp() {
    levelUp(gameState.player, gameState.battleLog);
  },

  petLevelUp() {
    petLevelUp(gameState.pet, gameState.battleLog);
  },

  allocatePoints(stat, points) {
    allocatePoints(gameState.player, stat, points);
  },

  petAllocatePoints(stat, points) {
    petAllocatePoints(gameState.pet, stat, points);
  },

  equipItem(equipment, index) {
    equipItem(gameState.player, equipment, index);
  },

  petEquipItem(equipment, index) {
    petEquipItem(gameState.pet, gameState.player, equipment, index);
  },

  unequipItem(slot) {
    unequipItem(gameState.player, slot);
  },

  petUnequipItem(slot) {
    petUnequipItem(gameState.pet, gameState.player, slot);
  },

  togglePetActive() {
    gameState.pet.active = !gameState.pet.active;
  },

  sellItem(index) {
    return sellItem(gameState.player, index);
  },

  useItem(item, index) {
    return useItem(gameState.player, item, index, gameState.player);
  },

  buyItem(item) {
    return buyItem(gameState.player, item);
  },

  buyEquipment(type) {
    return buyEquipment(gameState.player, type);
  },

  refreshEquipmentAffixes(index) {
    return refreshEquipmentAffixes(gameState.player, index);
  },

  refreshSingleBaseAffix(index, stat) {
    return refreshSingleBaseAffix(gameState.player, index, stat);
  },

  refreshSingleBonusAffix(index, stat) {
    return refreshSingleBonusAffix(gameState.player, index, stat);
  },

  getEquipmentSellPrice(equipment) {
    return getEquipmentSellPrice(equipment);
  },

  calculatePlayerStats(player) {
    return calculatePlayerStats(player);
  },

  generateCustomEquipment(
    type,
    rarity,
    level,
    baseAffixes = {},
    bonusAffixes = {},
    isDebug = false,
  ) {
    return generateCustomEquipment(
      type,
      rarity,
      level,
      baseAffixes,
      bonusAffixes,
      isDebug,
    );
  },

  sellEquipmentForGold(index) {
    return sellEquipmentForGold(gameState.player, index, getEquipmentSellPrice);
  },

  enhanceSkill(character, skillIndex) {
    return enhanceSkill(character, skillIndex, GAME_CONFIG);
  },

  isPlayerTurn() {
    return isPlayerTurn(gameState);
  },

  isPetDecisionPhase() {
    return isPetDecisionPhase(gameState);
  },

  getCurrentActorName() {
    return getCurrentActorName(gameState);
  },

  endBattle() {
    removeEnemyFromMap(gameState);
    gameState.screen = "map";
    gameState.currentBattle = null;
    refreshMapEnemies(gameState);
  },
};
