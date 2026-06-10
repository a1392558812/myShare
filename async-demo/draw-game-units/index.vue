<template>
  <div ref="gameContainerRef" class="draw-game-units">
    <canvas 
      ref="canvasRef" 
      style="" 
      id="gameCanvas" 
      width="100%" 
      height="100%"
      @click="handleCanvasClick"
    ></canvas>
    <div class="unit-selector">
      <select 
        v-model="selectedUnit"
        :key="key"
      >
        <option  v-for="(unit, key) in units" :key="key" :value="key">{{ unit.name }}</option>
      </select>
      <div>
        <div class="input-wrap" v-for="(keyVal, index) in ['hp', 'mp']" :key="index">
          {{ keyVal }}:<input style="width: 3em" type="number" v-model.number="units[selectedUnit][keyVal]"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

import { drawPlayer, config as playerConfig, drawPlayerAvatar } from './draw/draw-player.js'
import { drawPet, config as petConfig, drawPetAvatar } from './draw/draw-pet.js'
import { drawSlime, config as slimeConfig, drawSlimeAvatar } from './draw/draw-slime.js'
import { drawGoblin, config as goblinConfig, drawGoblinAvatar } from './draw/draw-goblin.js'
import { drawSkeletonSoldier, config as skeletonSoldierConfig, drawSkeletonSoldierAvatar } from './draw/draw-skeleton-soldier.js'
import { drawShadowWolf, config as shadowWolfConfig, drawShadowWolfAvatar } from './draw/draw-shadow-wolf.js'
import { drawChimera, config as chimeraConfig, drawChimeraAvatar } from './draw/draw-chimera.js'
import { drawShadowSorcerer, config as shadowSorcererConfig, drawShadowSorcererAvatar } from './draw/draw-shadow-sorcerer.js'
import { drawPhantomKnight, config as phantomKnightConfig, drawPhantomKnightAvatar } from './draw/draw-phantom-knight.js'
import { drawLichKing, config as lichKingConfig, drawLichKingAvatar } from './draw/draw-lich-king.js'
import { drawFrostWyrm, config as frostWyrmConfig, drawFrostWyrmAvatar } from './draw/draw-frost-wyrm.js'
import { drawVenomousLord, config as venomousLordConfig, drawVenomousLordAvatar } from './draw/draw-venomous-lord.js'
import { drawDarknessBinder, config as darknessBinderConfig, drawDarknessBinderAvatar } from './draw/draw-darkness-binder.js'
import { drawChaosLord, config as chaosLordConfig, drawChaosLordAvatar } from './draw/draw-chaos-lord.js'
import { drawMaouOfChaos, config as maouOfChaosConfig, drawMaouOfChaosAvatar } from './draw/draw-maou-of-chaos.js'
import { drawShadowLord, config as shadowLordConfig, drawShadowLordAvatar } from './draw/draw-shadow-lord.js'
import { drawBlackKnight, config as blackKnightConfig, drawBlackKnightAvatar } from './draw/draw-black-knight.js'
import { drawFrostQueen, config as frostQueenConfig, drawFrostQueenAvatar } from './draw/draw-frost-queen.js'
import { drawPitLord, config as pitLordConfig, drawPitLordAvatar } from './draw/draw-pit-lord.js'
import { drawChaosDeity, config as chaosDeityConfig, drawChaosDeityAvatar } from './draw/draw-chaos-deity.js'

import { frameRateManager } from './frame-rate.js'
import { drawSelectionHighlight, drawBorder, drawHealthBar } from './draw-utils.js'

const canvasRef = ref(null)
const gameContainerRef = ref(null)
const selectedUnit = ref('player')

// 单位管理
const units = ref({
  player: {
    name: '玩家',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    maxMp: 100,
    mp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: playerConfig,
    drawUnit: drawPlayer,
    drawAvatar: drawPlayerAvatar,
  },
  slime: {
    name: '史莱姆',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    maxMp: 100,
    mp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 3,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: slimeConfig,
    drawUnit: drawSlime,
    drawAvatar: drawSlimeAvatar,
  },
  goblin: {
    name: '哥布林',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: goblinConfig,
    drawUnit: drawGoblin,
    drawAvatar: drawGoblinAvatar,
  },
  skeletonSoldier: {
    name: '骷髅士兵',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: skeletonSoldierConfig,
    drawUnit: drawSkeletonSoldier,
    drawAvatar: drawSkeletonSoldierAvatar,
  },
  shadowWolf: {
    name: '暗影狼',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: shadowWolfConfig,
    drawUnit: drawShadowWolf,
    drawAvatar: drawShadowWolfAvatar,
  },
  chimera: {
    name: '石像鬼',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: chimeraConfig,
    drawUnit: drawChimera,
    drawAvatar: drawChimeraAvatar,
  },
  shadowSorcerer: {
    name: '暗影法师',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: shadowSorcererConfig,
    drawUnit: drawShadowSorcerer,
    drawAvatar: drawShadowSorcererAvatar,
  },
  phantomKnight: {
    name: '幽灵骑士',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: phantomKnightConfig,
    drawUnit: drawPhantomKnight,
    drawAvatar: drawPhantomKnightAvatar,
  },
  lichKing: {
    name: '巫妖王',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: lichKingConfig,
    drawUnit: drawLichKing,
    drawAvatar: drawLichKingAvatar,
  },
  frostWyrm: {
    name: '冰霜巨龙',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: frostWyrmConfig,
    drawUnit: drawFrostWyrm,
    drawAvatar: drawFrostWyrmAvatar,
  },
  venomousLord: {
    name: '剧毒领主',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: venomousLordConfig,
    drawUnit: drawVenomousLord,
    drawAvatar: drawVenomousLordAvatar,
  },
  darknessBinder: {
    name: '黑暗封印师',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: darknessBinderConfig,
    drawUnit: drawDarknessBinder,
    drawAvatar: drawDarknessBinderAvatar,
  },
  chaosLord: {
    name: '混沌领主',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: chaosLordConfig,
    drawUnit: drawChaosLord,
    drawAvatar: drawChaosLordAvatar,
  },
  maouOfChaos: {
    name: '混沌魔王',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: maouOfChaosConfig,
    drawUnit: drawMaouOfChaos,
    drawAvatar: drawMaouOfChaosAvatar,
  },
  shadowLord: {
    name: '暗影领主',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: shadowLordConfig,
    drawUnit: drawShadowLord,
    drawAvatar: drawShadowLordAvatar,
  },
  blackKnight: {
    name: '暗黑骑士',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: blackKnightConfig,
    drawUnit: drawBlackKnight,
    drawAvatar: drawBlackKnightAvatar,
  },
  frostQueen: {
    name: '冰雪女王',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: frostQueenConfig,
    drawUnit: drawFrostQueen,
    drawAvatar: drawFrostQueenAvatar,
  },
  pitLord: {
    name: '深渊魔王',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: pitLordConfig,
    drawUnit: drawPitLord,
    drawAvatar: drawPitLordAvatar,
  },
  chaosDeity: {
    name: '混沌之神',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: chaosDeityConfig,
    drawUnit: drawChaosDeity,
    drawAvatar: drawChaosDeityAvatar,
  },
  pet: {
    name: '宠物',
    x: 0,
    y: 0,
    maxHp: 100,
    hp: 50,
    maxMp: 100,
    mp: 50,
    avatarPos: { x: 0, y: 0 },
    speed: 5,
    direction: 'down',
    frame: 0,
    isMoving: false,
    size: 40,
    config: petConfig,
    drawUnit: drawPet,
    drawAvatar: drawPetAvatar,
  },
})

// 按键状态数组 - 存储当前按下的键
const keyMapDirection = {
  w: {
    direction: 'up',
    axis: 'y',
    plusMinus: -1,
  },
  s: {
    direction: 'down',
    axis: 'y',
    plusMinus: 1,

  },
  a: {
    direction: 'left',
    axis: 'x',
    plusMinus: -1,
  },
  d: {
    direction: 'right',
    axis: 'x',
    plusMinus: 1,
  },
}
const keyDownList = ref([])

// 绘制回调
const drawFrame = (deltaTime) => {
  const ctx = canvasRef.value?.getContext('2d');
  if (!ctx) return;
  
  // 清空画布
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  
  // 获取当前选中的单位
  const currentUnit = units.value[selectedUnit.value];
  const unitSize = currentUnit.size || 50;
  
  // 判断是否在移动
  const isMoving = keyDownList.value.length > 0;
  
  // 更新所有单位的移动状态和位置
  for (const [key, unit] of Object.entries(units.value)) {
    const isCurrentSelected = key === selectedUnit.value;
    unit.isMoving = isCurrentSelected && isMoving;
    
    if (isCurrentSelected && isMoving) {
      const currentKey = keyDownList.value[keyDownList.value.length - 1]
      const targetKeyMap = keyMapDirection[currentKey];

      unit[targetKeyMap.axis] += unit.speed * targetKeyMap.plusMinus;
      unit.direction = targetKeyMap.direction;
      
      // 边界检测
      unit.x = Math.max(0, Math.min(canvasRef.value.width - unitSize, unit.x));
      unit.y = Math.max(0, Math.min(canvasRef.value.height - unitSize, unit.y));
    }
    const animSpeed = unit.isMoving ? unit.config.WALK_SPEED : unit.config.IDLE_SPEED;
    unit.frame = unit.frame + deltaTime * animSpeed;
  }
  
  // 绘制所有单位
  for (const [key, unit] of Object.entries(units.value)) {
    unit.drawUnit(ctx, unit);
    drawHealthBar(ctx, unit, { x: unit.x, y: unit.y, textColor: '#00CCFF' });

    const avatarPos = Object.assign({ size: unitSize }, unit.avatarPos);
    unit.drawAvatar(ctx, unit, avatarPos);
    drawHealthBar(ctx, unit, avatarPos);
    drawBorder(ctx, avatarPos, key);
    
    if (selectedUnit.value === key){
      drawSelectionHighlight(ctx, unit, key);
      drawBorder(ctx, unit, key);
    };
  }
}

// 点击画布选择单位
const handleCanvasClick = (e) => {
  const rect = canvasRef.value.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  // 检测点击了哪个单位
  for (const [key, unit] of Object.entries(units.value)) {
    const unitSize = unit.size || 50;
    if (
      clickX >= unit.x &&
      clickX <= unit.x + unitSize &&
      clickY >= unit.y &&
      clickY <= unit.y + unitSize
    ) {
      selectedUnit.value = key;
      break;
    }
  }
}

// 键盘按下
const handleKeyDown = (e) => {
  const key = e.key.toLowerCase();
  if (Object.keys(keyMapDirection).includes(key) && !keyDownList.value.includes(key)) {
    keyDownList.value.push(key);
  }
  
  // Tab 键切换单位
  if (key === 'tab') {
    e.preventDefault();
    const unitKeys = Object.keys(units.value);
    const currentIndex = unitKeys.indexOf(selectedUnit.value);
    const nextIndex = (currentIndex + 1) % unitKeys.length;
    selectedUnit.value = unitKeys[nextIndex];
  }
}

// 键盘释放
const handleKeyUp = (e) => {
  const key = e.key.toLowerCase();
  const validKeys = ['w', 'a', 's', 'd'];
  
  // 如果是有效的方向键，则从列表中移除
  if (validKeys.includes(key)) {
    const index = keyDownList.value.indexOf(key);
    if (index !== -1) {
      keyDownList.value.splice(index, 1);
    }
  }
}

const onInit = () => {
  let col = 3
  let row = 0
  Object.keys(units.value).forEach((key, index) => {
    const unit = units.value[key]
    const colIndex = index % col
    if (colIndex === 0) {
      row++
    }
    const unitX = colIndex * (unit.size + 10) + unit.size
    const unitY = row * unit.size * 2

    unit.x = unitX
    unit.y = unitY
    unit.avatarPos = {
      x: unitX + (col + 1) * unit.size,
      y: unitY
    }
  })
}

onInit()

onMounted(() => {
  canvasRef.value.width = gameContainerRef.value.clientWidth;
  canvasRef.value.height = gameContainerRef.value.clientHeight;
  // 注册绘制回调
  frameRateManager.register(drawFrame);
  
  // 设置帧率
  frameRateManager.setFPS(60);
  
  // 启动动画
  frameRateManager.start();
  
  // 监听键盘事件
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
})

onUnmounted(() => {
  // 停止动画
  frameRateManager.stop();
  
  // 移除回调
  frameRateManager.clear();
  
  // 移除键盘监听
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
})
</script>
<style lang="scss" module>
.draw-game-units {
  width: 100%;
  height: 100vh;
  background-color: rgba(15, 15, 15, 0.582);
  position: relative;
  
  canvas {
    width: 100%;
    height: 100%;
  }
  
  .unit-selector {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: rgba(95, 95, 95, 0.7);
    padding: 10px;
    border-radius: 8px;
    color: #fff;
    .input-wrap {
      display: flex;
      align-items: center;
      line-height: 1;
      gap: 5px;
    }
  }
}
</style>