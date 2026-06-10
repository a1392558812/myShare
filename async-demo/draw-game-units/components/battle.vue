<template>
  <div
    class="draw-game-battle"
    :style="{ width: width + 'px', height: height + 'px' }"
  >
    <canvas
      ref="canvasRef"
      :style="{ width: width + 'px', height: height + 'px' }"
      id="gameCanvas"
      width="100%"
      height="100%"
      @click="handleCanvasClick"
    ></canvas>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";

import {
  drawSelectionHighlight,
  drawBorder,
  drawHealthBar,
  drawSelectMenus,
} from "../draw-utils.js";
import { frameRateManager } from "../frame-rate.js";

const props = defineProps({
  width: {
    type: Number,
    default: 1200,
  },
  height: {
    type: Number,
    default: 675,
  },
  enemyList: {
    type: Array,
    default: () => [],
  },
  player: {
    type: Object,
    default: () => ({}),
  },
  pet: {
    type: Object,
    default: () => ({}),
  },
});

const currentEnemyList = ref(null);
const currentPet = ref(null);
const currentPlayer = ref(null);

const canvasRef = ref(null);
const canvasRect = ref(null);
const menuConfig = ref({
  x: 1000, // 菜单x坐标
  y: 50, // 菜单y坐标
  width: 200, // 菜单宽度
  height: 30, // 菜单高度
  list: [
    // 菜单列表
    {
      label: "移动",
      value: "move",
      isDisabled: false,
      callback: (e) => {
        console.log("移动", e);
        alert("移动");
      },
    },
    {
      label: "攻击",
      value: "attack",
      isDisabled: false,
      callback: (e) => {
        console.log("攻击", e);
        alert("攻击");
      },
    },
    {
      label: "防御",
      value: "defense",
      isDisabled: false,
      callback: (e) => {
        console.log("防御", e);
        alert("防御");
      },
    },
  ],
});

// 按规则计算敌人位置（左下圆心，45度右上斜线排列，每线最多5个）
const calcEnemyPositions = () => {
  if (!currentEnemyList.value || currentEnemyList.value.length === 0) return;

  const canvasHeight = props.height;
  const enemies = currentEnemyList.value;

  // 圆心：画布左下角
  const centerX = 0;
  const centerY = canvasHeight;

  // 45度角（屏幕坐标系：从水平向右向上旋转45度）
  const angle = -Math.PI / 4;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  // 平行线间距方向（与直线垂直，向右下偏移）
  const offsetCos = Math.cos(Math.PI / 4);
  const offsetSin = Math.sin(Math.PI / 4);

  // 每排最多5个，排之间间距为 unit.size * 2
  const maxPerRow = 5;
  const unitSize = enemies[0]?.size || 40;
  const rowGap = unitSize * 2;

  // 直线总长度：从左下角到顶部的距离 = canvasHeight / sin(45°)
  const totalLineLength = canvasHeight / Math.sin(Math.PI / 4);

  // 总排数
  const totalCount = enemies.length;
  const totalRows = Math.ceil(totalCount / maxPerRow);

  enemies.forEach((enemy, index) => {
    const row = Math.floor(index / maxPerRow);
    const colInRow = index % maxPerRow;

    // 等分：将直线分成 (maxPerRow + 1) 段，敌人位于分段点上
    const t = ((colInRow + 1) / (maxPerRow + 1)) * totalLineLength;

    // 计算该敌人在直线上的坐标
    const lineX = centerX + t * cosA;
    const lineY = centerY + t * sinA;

    // 平行线偏移：向右下偏移
    const offsetX =
      row * rowGap * offsetCos + Math.floor(index / maxPerRow) * 0.8 * unitSize;
    const offsetY =
      row * rowGap * offsetSin -
      unitSize -
      Math.floor(index / maxPerRow) * 0.8 * unitSize;

    enemy.x = lineX + offsetX;
    enemy.y = lineY + offsetY;

    // 更新头像位置
    if (enemy.avatarPos) {
      enemy.avatarPos.x = enemy.x;
      enemy.avatarPos.y = enemy.y;
    } else {
      enemy.avatarPos = { x: enemy.x, y: enemy.y };
    }
  });
};

// 绘制回调
const drawFrame = (deltaTime) => {
  const ctx = canvasRef.value?.getContext("2d");
  if (!ctx) return;

  // 清空画布
  ctx.clearRect(0, 0, props.width, props.height);

  // 计算敌人位置
  calcEnemyPositions();

  // 绘制所有单位
  if (currentEnemyList.value) {
    for (const unit of currentEnemyList.value) {
      unit.drawUnit(ctx, unit);
      drawHealthBar(ctx, unit, { x: unit.x, y: unit.y, textColor: "#00CCFF" });

      const avatarPos = Object.assign({ size: unit.size }, unit.avatarPos);
      unit.drawAvatar(ctx, unit, avatarPos);
      drawHealthBar(ctx, unit, avatarPos);
    }
  }

  // 绘制菜单
  drawSelectMenus(ctx, menuConfig.value);
};

// 点击菜单
const handleMenuClick = (e) => {
  const clickX = e.clientX - canvasRect.value.left;
  const clickY = e.clientY - canvasRect.value.top;

  const config = menuConfig.value;
  const padding = 2;

  // 检测点击是否在菜单范围内
  if (
    clickX >= config.x &&
    clickX <= config.x + config.width + padding * 2 &&
    clickY >= config.y &&
    clickY <= config.y + config.list.length * config.height + padding * 2
  ) {
    const itemIndex = Math.floor((clickY - config.y - padding) / config.height);

    if (itemIndex >= 0 && itemIndex < config.list.length) {
      const item = config.list[itemIndex];
      if (!item.isDisabled && item.callback) {
        item.callback(e);
      }
    }
  }
};

// 点击画布选择单位
const handleCanvasClick = (e) => {
  handleMenuClick(e);
};

const initUnit = (item) => {
  return {
    name: item.name,
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
    config: item.config,
    drawUnit: item.drawUnit,
    drawAvatar: item.drawAvatar,
  };
};

const onInit = () => {
  const list = [];
  props.enemyList.forEach((enemy) => {
    list.push(initUnit(enemy));
  });
  currentEnemyList.value = list;
  currentPlayer.value = initUnit(props.player);
  currentPet.value = initUnit(props.pet);
};

onInit();

onMounted(() => {
  canvasRef.value.width = props.width;
  canvasRef.value.height = props.height;
  canvasRect.value = canvasRef.value.getBoundingClientRect();

  // 注册绘制回调
  frameRateManager.register(drawFrame);

  // 设置帧率
  frameRateManager.setFPS(60);

  // 启动动画
  frameRateManager.start();
});
</script>
<style lang="scss" module>
.draw-game-battle {
  position: relative;

  canvas {
    width: 100%;
    height: 100%;
    background-color: rgba(15, 15, 15, 0.582);
  }
}
</style>
