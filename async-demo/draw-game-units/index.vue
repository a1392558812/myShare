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
    </div>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { drawPlayer, config as playerConfig, drawPlayerAvatar } from './draw-player.js'
import { drawPet, config as petConfig, drawPetAvatar } from './draw-pet.js'
import { drawSlime, config as slimeConfig, drawSlimeAvatar } from './draw-slime.js'
import { drawGoblin, config as goblinConfig, drawGoblinAvatar } from './draw-goblin.js'
import { drawSkeletonSoldier, config as skeletonSoldierConfig, drawSkeletonSoldierAvatar } from './draw-skeleton-soldier.js'
import { drawShadowWolf, config as shadowWolfConfig, drawShadowWolfAvatar } from './draw-shadow-wolf.js'
import { drawChimera, config as chimeraConfig, drawChimeraAvatar } from './draw-chimera.js'
import { drawShadowSorcerer, config as shadowSorcererConfig, drawShadowSorcererAvatar } from './draw-shadow-sorcerer.js'
import { drawPhantomKnight, config as phantomKnightConfig, drawPhantomKnightAvatar } from './draw-phantom-knight.js'
import { drawLichKing, config as lichKingConfig, drawLichKingAvatar } from './draw-lich-king.js'
import { drawFrostWyrm, config as frostWyrmConfig, drawFrostWyrmAvatar } from './draw-frost-wyrm.js'
import { drawVenomousLord, config as venomousLordConfig, drawVenomousLordAvatar } from './draw-venomous-lord.js'
import { drawDarknessBinder, config as darknessBinderConfig, drawDarknessBinderAvatar } from './draw-darkness-binder.js'
import { drawChaosLord, config as chaosLordConfig, drawChaosLordAvatar } from './draw-chaos-lord.js'
import { drawMaouOfChaos, config as maouOfChaosConfig, drawMaouOfChaosAvatar } from './draw-maou-of-chaos.js'
import { drawShadowLord, config as shadowLordConfig, drawShadowLordAvatar } from './draw-shadow-lord.js'
import { drawBlackKnight, config as blackKnightConfig, drawBlackKnightAvatar } from './draw-black-knight.js'
import { drawFrostQueen, config as frostQueenConfig, drawFrostQueenAvatar } from './draw-frost-queen.js'
import { drawPitLord, config as pitLordConfig, drawPitLordAvatar } from './draw-pit-lord.js'
import { drawChaosDeity, config as chaosDeityConfig, drawChaosDeityAvatar } from './draw-chaos-deity.js'

import { frameRateManager } from './frame-rate.js'

const canvasRef = ref(null)
const gameContainerRef = ref(null)
const selectedUnit = ref('player')

// 单位管理
const units = ref({
  player: {
    name: '玩家',
    x: 50,
    y: 50,
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
    x: 100,
    y: 50,
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
    x: 150,
    y: 50,
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
    x: 200,
    y: 50,
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
    x: 50,
    y: 150,
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
    x: 100,
    y: 150,
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
    x: 150,
    y: 150,
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
    x: 200,
    y: 150,
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
    x: 50,
    y: 250,
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
    x: 100,
    y: 250,
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
    x: 150,
    y: 250,
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
    x: 200,
    y: 250,
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
    x: 50,
    y: 350,
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
    x: 100,
    y: 350,
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
    x: 150,
    y: 350,
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
    x: 200,
    y: 350,
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
    x: 50,
    y: 450,
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
    x: 100,
    y: 450,
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
    x: 150,
    y: 450,
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
    x: 200,
    y: 450,
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


// 按键状态
const keys = ref({
  w: false,
  a: false,
  s: false,
  d: false
})

// 绘制单位判定边框
const drawBorder = (ctx, unit, unitKey) => {
  const size = unit.size || 40;
  const padding = 0; // 可配置加大判断范围

  ctx.beginPath();
  ctx.moveTo(unit.x - padding, unit.y - padding);
  ctx.lineTo(unit.x + size + padding, unit.y - padding);
  ctx.lineTo(unit.x + size + padding, unit.y + size + padding);
  ctx.lineTo(unit.x - padding, unit.y + size + padding);
  ctx.lineTo(unit.x - padding, unit.y - padding)
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();
}

// 绘制选择高亮
const drawSelectionHighlight = (ctx, unit, unitKey) => {const size = unit.size || 40;
  const padding = 4;
  
  // 绘制选择指示器（顶部三角形）
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(unit.x + size / 2 - 6, unit.y - padding - 8);
  ctx.lineTo(unit.x + size / 2 + 6, unit.y - padding - 8);
  ctx.lineTo(unit.x + size / 2, unit.y - padding - 2);
  ctx.closePath();
  ctx.fill();
}

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
  const isMoving = keys.value.w || keys.value.a || keys.value.s || keys.value.d;
  
  // 更新所有单位的移动状态和位置
  for (const [key, unit] of Object.entries(units.value)) {
    const isCurrentSelected = key === selectedUnit.value;
    unit.isMoving = isCurrentSelected && isMoving;
    
    // 只有选中的单位响应移动
    if (isCurrentSelected && isMoving) {
      if (keys.value.w) {
        unit.y -= unit.speed;
        if (unit.direction) unit.direction = 'up';
      }
      if (keys.value.s) {
        unit.y += unit.speed;
        if (unit.direction) unit.direction = 'down';
      }
      if (keys.value.a) {
        unit.x -= unit.speed;
        if (unit.direction) unit.direction = 'left';
      }
      if (keys.value.d) {
        unit.x += unit.speed;
        if (unit.direction) unit.direction = 'right';
      }
      
      // 边界检测
      unit.x = Math.max(0, Math.min(canvasRef.value.width - unitSize, unit.x));
      unit.y = Math.max(0, Math.min(canvasRef.value.height - unitSize, unit.y));
    }
    const animSpeed = unit.isMoving ? unit.config.WALK_SPEED : unit.config.IDLE_SPEED;
    unit.frame = unit.frame + deltaTime * animSpeed;
  }
  
  // 绘制所有单位
  for (const [key, unit] of Object.entries(units.value)) {
    unit.drawUnit(canvasRef.value, unit);
    if (unit.drawAvatar) {
      const avatarPos = { x: unit.x + 250, y: unit.y, size: unitSize }
      unit.drawAvatar(canvasRef.value, unit, avatarPos);
      drawBorder(ctx, avatarPos, key);
    }
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
  if (keys.value.hasOwnProperty(key)) {
    keys.value[key] = true;
  }
  // Tab 键切换单位
  if (e.key === 'Tab') {
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
  if (keys.value.hasOwnProperty(key)) {
    keys.value[key] = false;
  }
}

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
    gap: 10px;
    background-color: rgba(95, 95, 95, 0.7);
    padding: 10px;
    border-radius: 8px;
  }
}
</style>