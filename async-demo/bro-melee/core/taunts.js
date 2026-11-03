/**
 * 嘲讽气泡（v1.9.4）
 * 玩家练了葵花宝典 / 蛤蟆功（或披着葵花袈裟）后，路过的敌人会偶尔开口气泡嘲讽
 * 只写 entity.bubble，绘制交给 draw/renderer.js
 */

import { ENCOUNTER_CONFIG } from '../constants.js';
import { TAUNT_EMOJI_ONLY_RATIO, TAUNTS } from '../config/taunts.js';
import { hasTreasure } from '../config/treasures.js';
import { distanceBetween, pickRandom, randomRange } from './utils.js';

/** 气泡停留时长（秒） */
const BUBBLE_DURATION = 2.8;

/**
 * 当前会招来嘲笑的来历（可能同时有多个）
 * @param {Object} world 世界实例
 * @returns {String[]} TAUNTS 的 key 列表
 */
export const activeTauntFlavors = (world) => {
  const player = world.player;
  if (!player) {
    return [];
  }
  return Object.keys(TAUNTS).filter((key) => {
    const flavor = TAUNTS[key];
    if (flavor.skillId) {
      return (player.skillStacks[flavor.skillId] || 0) > 0;
    }
    return flavor.treasureId ? hasTreasure(player, flavor.treasureId) : false;
  });
};

/**
 * 给敌人挂一个气泡
 * @param {Object} enemy 敌人
 * @param {Object} flavor 台词表条目
 * @param {Object} entry { text, emoji }
 */
export const speakTaunt = (enemy, flavor, entry) => {
  enemy.bubble = {
    text: entry.text || '',
    emoji: entry.emoji || '',
    tone: flavor.tone,
    duration: BUBBLE_DURATION,
    timer: BUBBLE_DURATION,
  };
};

/** 台词尽量不连续重复 */
const pickLine = (world, flavor) => {
  for (let attempt = 0; attempt < 4; attempt++) {
    const line = pickRandom(flavor.lines);
    if (line.text !== world.lastTauntText) {
      return line;
    }
  }
  return pickRandom(flavor.lines);
};

/** 46% 只甩表情，其余带一句台词 */
const pickBubble = (world, flavor) => {
  if (Math.random() < TAUNT_EMOJI_ONLY_RATIO) {
    return { text: '', emoji: pickRandom(flavor.emojis) };
  }
  return pickLine(world, flavor);
};

/** 挑一个「路过」的敌人：玩家附近、活着、不是随从或羁绊同伴 */
const pickSpeaker = (world) => {
  const player = world.player;
  const candidates = world.enemies.filter((enemy) => {
    return enemy.alive
      && !enemy.isCompanion
      && !enemy.bondId
      && !enemy.bubble
      && distanceBetween(enemy.x, enemy.y, player.x, player.y) <= ENCOUNTER_CONFIG.TAUNT_RADIUS;
  });
  return candidates.length ? pickRandom(candidates) : null;
};

/**
 * 立刻让一个路过的敌人开嘲讽（调试台 / 冒烟脚本）
 * @param {Object} world 世界实例
 * @param {String[]} [flavors] 指定来历，省略则按玩家当前功法自动判断
 * @returns {Object|null} 气泡信息
 */
export const triggerTaunt = (world, flavors) => {
  const keys = flavors && flavors.length ? flavors : activeTauntFlavors(world);
  if (!keys.length) {
    return null;
  }
  const speaker = pickSpeaker(world);
  if (!speaker) {
    return null;
  }
  const flavor = TAUNTS[pickRandom(keys)];
  const bubble = pickBubble(world, flavor);
  speakTaunt(speaker, flavor, bubble);
  world.lastTauntText = bubble.text || '';
  return { id: speaker.id, name: speaker.typeName, ...speaker.bubble };
};

/**
 * 主循环：气泡倒计时 + 到点挑个敌人说话
 * @param {Object} world 世界实例
 * @param {Number} deltaTime 帧间隔
 */
export const updateTaunts = (world, deltaTime) => {
  const list = world.enemies;
  for (let index = 0; index < list.length; index++) {
    const enemy = list[index];
    if (!enemy.bubble) {
      continue;
    }
    enemy.bubble.timer -= deltaTime;
    if (enemy.bubble.timer <= 0) {
      enemy.bubble = null;
    }
  }
  const flavors = activeTauntFlavors(world);
  if (!flavors.length) {
    world.tauntTimer = 0;
    return;
  }
  world.tauntTimer -= deltaTime;
  if (world.tauntTimer > 0) {
    return;
  }
  world.tauntTimer = randomRange(ENCOUNTER_CONFIG.TAUNT_INTERVAL, ENCOUNTER_CONFIG.TAUNT_INTERVAL + ENCOUNTER_CONFIG.TAUNT_JITTER);
  triggerTaunt(world, flavors);
};
