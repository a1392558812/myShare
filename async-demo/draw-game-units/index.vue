<template>
  <div>
    <div>
      <button @click="cuttentMode = 'test'">test-ui展示</button>
      <button @click="cuttentMode = 'battle'">battle-ui展示</button>
    </div>
    <Test
      :enemy="enemy"
      :player="player"
      :pet="pet"
      v-if="cuttentMode === 'test'"
    ></Test>
    <Battle
      :enemyList="enemyList"
      :player="player"
      :pet="pet"
      v-if="cuttentMode === 'battle'"
    ></Battle>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";

import {
  drawPlayer,
  config as playerConfig,
  drawPlayerAvatar,
} from "./draw/draw-player.js";
import {
  drawPet,
  config as petConfig,
  drawPetAvatar,
} from "./draw/draw-pet.js";
import {
  drawSlime,
  config as slimeConfig,
  drawSlimeAvatar,
} from "./draw/draw-slime.js";
import {
  drawGoblin,
  config as goblinConfig,
  drawGoblinAvatar,
} from "./draw/draw-goblin.js";
import {
  drawSkeletonSoldier,
  config as skeletonSoldierConfig,
  drawSkeletonSoldierAvatar,
} from "./draw/draw-skeleton-soldier.js";
import {
  drawShadowWolf,
  config as shadowWolfConfig,
  drawShadowWolfAvatar,
} from "./draw/draw-shadow-wolf.js";
import {
  drawChimera,
  config as chimeraConfig,
  drawChimeraAvatar,
} from "./draw/draw-chimera.js";
import {
  drawShadowSorcerer,
  config as shadowSorcererConfig,
  drawShadowSorcererAvatar,
} from "./draw/draw-shadow-sorcerer.js";
import {
  drawPhantomKnight,
  config as phantomKnightConfig,
  drawPhantomKnightAvatar,
} from "./draw/draw-phantom-knight.js";
import {
  drawLichKing,
  config as lichKingConfig,
  drawLichKingAvatar,
} from "./draw/draw-lich-king.js";
import {
  drawFrostWyrm,
  config as frostWyrmConfig,
  drawFrostWyrmAvatar,
} from "./draw/draw-frost-wyrm.js";
import {
  drawVenomousLord,
  config as venomousLordConfig,
  drawVenomousLordAvatar,
} from "./draw/draw-venomous-lord.js";
import {
  drawDarknessBinder,
  config as darknessBinderConfig,
  drawDarknessBinderAvatar,
} from "./draw/draw-darkness-binder.js";
import {
  drawChaosLord,
  config as chaosLordConfig,
  drawChaosLordAvatar,
} from "./draw/draw-chaos-lord.js";
import {
  drawMaouOfChaos,
  config as maouOfChaosConfig,
  drawMaouOfChaosAvatar,
} from "./draw/draw-maou-of-chaos.js";
import {
  drawShadowLord,
  config as shadowLordConfig,
  drawShadowLordAvatar,
} from "./draw/draw-shadow-lord.js";
import {
  drawBlackKnight,
  config as blackKnightConfig,
  drawBlackKnightAvatar,
} from "./draw/draw-black-knight.js";
import {
  drawFrostQueen,
  config as frostQueenConfig,
  drawFrostQueenAvatar,
} from "./draw/draw-frost-queen.js";
import {
  drawPitLord,
  config as pitLordConfig,
  drawPitLordAvatar,
} from "./draw/draw-pit-lord.js";
import {
  drawChaosDeity,
  config as chaosDeityConfig,
  drawChaosDeityAvatar,
} from "./draw/draw-chaos-deity.js";

import Test from "./components/test.vue";
import Battle from "./components/battle.vue";

const enemy = ref({
  slime: {
    name: "史莱姆",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    maxMp: 100,
    mp: 0,
    avatarPos: { x: 0, y: 0 },
    speed: 3,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: slimeConfig,
    drawUnit: drawSlime,
    drawAvatar: drawSlimeAvatar,
  },
  goblin: {
    name: "哥布林",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: goblinConfig,
    drawUnit: drawGoblin,
    drawAvatar: drawGoblinAvatar,
  },
  skeletonSoldier: {
    name: "骷髅士兵",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: skeletonSoldierConfig,
    drawUnit: drawSkeletonSoldier,
    drawAvatar: drawSkeletonSoldierAvatar,
  },
  shadowWolf: {
    name: "暗影狼",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: shadowWolfConfig,
    drawUnit: drawShadowWolf,
    drawAvatar: drawShadowWolfAvatar,
  },
  chimera: {
    name: "石像鬼",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: chimeraConfig,
    drawUnit: drawChimera,
    drawAvatar: drawChimeraAvatar,
  },
  shadowSorcerer: {
    name: "暗影法师",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: shadowSorcererConfig,
    drawUnit: drawShadowSorcerer,
    drawAvatar: drawShadowSorcererAvatar,
  },
  phantomKnight: {
    name: "幽灵骑士",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: phantomKnightConfig,
    drawUnit: drawPhantomKnight,
    drawAvatar: drawPhantomKnightAvatar,
  },
  lichKing: {
    name: "巫妖王",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: lichKingConfig,
    drawUnit: drawLichKing,
    drawAvatar: drawLichKingAvatar,
  },
  frostWyrm: {
    name: "冰霜巨龙",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: frostWyrmConfig,
    drawUnit: drawFrostWyrm,
    drawAvatar: drawFrostWyrmAvatar,
  },
  venomousLord: {
    name: "剧毒领主",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: venomousLordConfig,
    drawUnit: drawVenomousLord,
    drawAvatar: drawVenomousLordAvatar,
  },
  darknessBinder: {
    name: "黑暗封印师",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: darknessBinderConfig,
    drawUnit: drawDarknessBinder,
    drawAvatar: drawDarknessBinderAvatar,
  },
  chaosLord: {
    name: "混沌领主",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: chaosLordConfig,
    drawUnit: drawChaosLord,
    drawAvatar: drawChaosLordAvatar,
  },
  maouOfChaos: {
    name: "混沌魔王",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: maouOfChaosConfig,
    drawUnit: drawMaouOfChaos,
    drawAvatar: drawMaouOfChaosAvatar,
  },
  shadowLord: {
    name: "暗影领主",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: shadowLordConfig,
    drawUnit: drawShadowLord,
    drawAvatar: drawShadowLordAvatar,
  },
  blackKnight: {
    name: "暗黑骑士",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: blackKnightConfig,
    drawUnit: drawBlackKnight,
    drawAvatar: drawBlackKnightAvatar,
  },
  frostQueen: {
    name: "冰雪女王",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: frostQueenConfig,
    drawUnit: drawFrostQueen,
    drawAvatar: drawFrostQueenAvatar,
  },
  pitLord: {
    name: "深渊魔王",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: pitLordConfig,
    drawUnit: drawPitLord,
    drawAvatar: drawPitLordAvatar,
  },
  chaosDeity: {
    name: "混沌之神",
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: "down",
    frame: 0,
    isMoving: false,
    size: 40,
    config: chaosDeityConfig,
    drawUnit: drawChaosDeity,
    drawAvatar: drawChaosDeityAvatar,
  },
});

const player = ref({
  name: "玩家",
  x: 0,
  y: 0,
  maxHp: 100,
  hp: 50,
  maxMp: 100,
  mp: 50,
  avatarPos: { x: 0, y: 0 },
  speed: 5,
  direction: "down",
  frame: 0,
  isMoving: false,
  size: 40,
  config: playerConfig,
  drawUnit: drawPlayer,
  drawAvatar: drawPlayerAvatar,
});

const pet = ref({
  name: "宠物",
  x: 0,
  y: 0,
  maxHp: 100,
  hp: 50,
  maxMp: 100,
  mp: 50,
  avatarPos: { x: 0, y: 0 },
  speed: 5,
  direction: "down",
  frame: 0,
  isMoving: false,
  size: 40,
  config: petConfig,
  drawUnit: drawPet,
  drawAvatar: drawPetAvatar,
});

const cuttentMode = ref("test"); // test battle

const enemyList = computed(() => {
  console.log("enemyList", cuttentMode.value);
  const list = Object.keys(enemy.value);
  const max = 8;
  const min = 8;
  const len = Math.floor(Math.random() * (max - min + 1)) + min;
  const result = [];
  for (let i = 0; i < len; i++) {
    // 随机下标
    const idx = Math.floor(Math.random() * list.length);
    result.push(enemy.value[list[idx]]);
  }
  return result;
});
</script>
