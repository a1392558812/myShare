import { EQUIPMENT_CONFIG, GAME_CONFIG } from "./constants.js";
import {
  generateBaseStats,
  generateRandomStats,
  EQUIPMENT_PREFIXES,
  EQUIPMENT_SUFFIXES,
} from "./equipment.js";

export const buyItem = (player, item) => {
  const buyPrice = item.price;

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
};

export const sellItem = (player, index) => {
  if (index >= 0 && index < player.inventory.length) {
    const item = player.inventory[index];
    const sellPrice = Math.floor(item.price * GAME_CONFIG.ITEM_SELL_RATIO);
    player.gold += sellPrice;
    player.inventory.splice(index, 1);
    return sellPrice;
  }
  return 0;
};

export const buyEquipment = (player, type) => {
  const level = GAME_CONFIG.SHOP.EQUIPMENT_LEVEL;
  const rarity = GAME_CONFIG.SHOP.EQUIPMENT_RARITY;

  const price = GAME_CONFIG.SHOP.EQUIPMENT_PRICES[type] || 1;

  if (player.gold < price) {
    return false;
  }

  player.gold -= price;

  const prefixCount = GAME_CONFIG.SHOP.PREFIX_COUNT;
  const availablePrefixes = EQUIPMENT_PREFIXES.slice(0, prefixCount);
  const suffixes = EQUIPMENT_SUFFIXES[type] || ["装备"];
  const prefix =
    availablePrefixes[Math.floor(Math.random() * availablePrefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const name = prefix + suffix;

  const baseStats = generateBaseStats(type, level);

  const rarityName = EQUIPMENT_CONFIG.RARITY[rarity]?.name || "普通";

  const equipment = {
    uid: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    id: `${type}_${Date.now()}`,
    name,
    type,
    rarity,
    level,
    baseStats,
    baseAffixes: {},
    bonusAffixes: {},
    description: `Lv.${level} ${rarityName}的${name}`,
  };

  player.equipmentBag.push(equipment);
  return equipment;
};

export const refreshEquipmentAffixes = (player, index) => {
  if (index < 0 || index >= player.equipmentBag.length) {
    return false;
  }

  const equipment = player.equipmentBag[index];
  const refreshCost = Math.floor(50 * equipment.level);

  if (player.gold < refreshCost) {
    return false;
  }

  player.gold -= refreshCost;

  const type = equipment.type;
  const level = equipment.level;
  const baseStats = generateBaseStats(type, level);
  const { baseAffixes, bonusAffixes } = generateRandomStats(
    equipment.rarity,
    level,
    type,
  );

  equipment.baseStats = baseStats;
  equipment.baseAffixes = baseAffixes;
  equipment.bonusAffixes = bonusAffixes;
  return true;
};

export const sellEquipmentForGold = (player, index, getEquipmentSellPrice) => {
  if (index < 0 || index >= player.equipmentBag.length) {
    return 0;
  }

  const equipment = player.equipmentBag[index];
  const sellPrice = getEquipmentSellPrice(equipment);

  player.gold += sellPrice;
  player.equipmentBag.splice(index, 1);
  return sellPrice;
};
