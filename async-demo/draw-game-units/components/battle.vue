<template>
  <canvasDraw :canvasStyle="{
    cursor: canvasCursor
  }" @drawFrame="onDrawFrame" @canvasMounted="onCanvasMounted" @canvasClick="onCanvasClick"
    @canvasMouseMove="onCanvasMouseMove" @canvasDestroyed="onCanvasDestroyed">

    <div v-if="itemDialogShow" class="item-dialog">
      <div class="item-dialog-container">
        <div class="item-dialog-container-title">道具选择</div>
        <div class="item-dialog-container-body">
          <div v-for="item in itemList" :key="item.id" class="item-dialog-item" @click="handleItemSelect(item)">
            {{ item.label }}
          </div>
        </div>
        <div class="item-dialog-container-footer">
          <button class="item-dialog-cancel-btn" @click="handleItemCancel">
            取消
          </button>
        </div>
      </div>
    </div>
  </canvasDraw>
</template>
<script setup>
import { computed, ref } from "vue";

import {
  drawHealthBar,
  drawSelectMenus,
  drawMagicCircle,
  drawDecoration,
  buildEmojiCursor,
} from "../draw-utils.js";

import canvasDraw from "./canvas-draw.vue";

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

const itemDialogShow = ref(false);
const itemList = ref(
  (() => {
    const list = [];
    Array.from({ length: 20 }).forEach((item, index) => {
      list.push({
        label: `道具${index + 1}`,
        value: `item${index + 1}`,
        id: index + 1,
      });
    });
    return list;
  })(),
);
const itemDialogOpener = ref(null); // 记录是谁打开的道具面板: 'player' | 'pet'

const cursorPos = ref({ x: 0, y: 0 }); // 鼠标位置

const currentEnemyList = ref(null);
const currentPet = ref(null);
const currentPlayer = ref(null);

/**
 * type: attack， target: index
 * type: magic， target: index
 * type: item， target: index， item: item
 * type: defense
 * type: run
 */
const playerCommand = ref(null);
const petCommand = ref(null);
const currentCommander = ref(null);

const playerMenuConfig = ref({
  x: 950, // 菜单x坐标
  y: 50, // 菜单y坐标
  width: 200, // 菜单宽度
  height: 30, // 菜单高度
  list: [
    // 菜单列表
    {
      label: "自动",
      value: "auto",
      isDisabled: false,
      callback: (e) => {
        console.log("自动", e);
        alert("自动");
      },
    },
    {
      label: "攻击",
      value: "attack",
      isDisabled: false,
      callback: (e) => {
        playerCommand.value = { type: "attack", target: null };
        currentCommander.value = playerCommand.value;
        console.log("player-attack", e);
      },
    },
    {
      label: "魔法",
      value: "magic",
      isDisabled: false,
      callback: (e) => {
        playerCommand.value = { type: "magic", target: null };
        currentCommander.value = playerCommand.value;
        console.log("player-magic", e);
      },
    },
    {
      label: "道具",
      value: "item",
      isDisabled: false,
      callback: (e) => {
        playerCommand.value = { type: "item", target: null, item: null };
        currentCommander.value = playerCommand.value;
        itemDialogOpener.value = "player";
        itemDialogShow.value = true;
      },
    },
    {
      label: "防御",
      value: "defense",
      isDisabled: false,
      callback: (e) => {
        playerCommand.value = { type: "defense" };
      },
    },
    {
      label: "逃跑",
      value: "run",
      isDisabled: false,
      callback: (e) => {
        playerCommand.value = { type: "run" };
      },
    },
  ],
});

const petMenuConfig = ref({
  x: 950, // 菜单x坐标
  y: 50, // 菜单y坐标
  width: 200, // 菜单宽度
  height: 30, // 菜单高度
  list: [
    {
      label: "攻击",
      value: "attack",
      isDisabled: false,
      callback: (e) => {
        petCommand.value = { type: "attack", target: null };
        currentCommander.value = petCommand.value;
        console.log("pet-attack", e);
      },
    },
    {
      label: "魔法",
      value: "magic",
      isDisabled: false,
      callback: (e) => {
        petCommand.value = { type: "magic", target: null };
        currentCommander.value = petCommand.value;
        console.log("pet-magic", e);
      },
    },
    {
      label: "道具",
      value: "item",
      isDisabled: false,
      callback: (e) => {
        petCommand.value = { type: "item", target: null, item: null };
        currentCommander.value = petCommand.value;
        itemDialogOpener.value = "pet";
        itemDialogShow.value = true;
      },
    },
    {
      label: "防御",
      value: "defense",
      isDisabled: false,
      callback: (e) => {
        petCommand.value = { type: "defense" };
      },
    },
    {
      label: "取消",
      value: "cancel",
      isDisabled: false,
      callback: (e) => {
        petCommand.value = null;
        itemDialogOpener.value = null;
        playerCommand.value = null;
      },
    },
  ],
});

const cancelMenu = ref({
  x: 950,
  y: 50,
  width: 200,
  height: 30,
  list: [
    {
      label: "取消",
      value: "cancel",
      isDisabled: false,
      callback: (e) => {
        if (itemDialogOpener.value === "player") {
          playerCommand.value = null;
          itemDialogOpener.value = null;
        } else if (itemDialogOpener.value === "pet") {
          petCommand.value = null;
          itemDialogOpener.value = null;
        } else {
          if (playerCommand.value) {
            playerCommand.value = null;
            petCommand.value = null;
          } else if (petCommand.value) {
            petCommand.value = null;
          }
        }
      },
    },
  ],
});

const currentMenusConfig = computed(() => {
  if (!playerCommand.value) {
    return playerMenuConfig.value;
  }

  if (
    playerCommand.value &&
    ["attack", "magic", "item"].includes(playerCommand.value.type) &&
    !petCommand.value
  ) {
    if (playerCommand.value.target) {
      return petMenuConfig.value;
    }
    return cancelMenu.value;
  }

  if (
    petCommand.value &&
    ["attack", "magic", "item"].includes(petCommand.value.type)
  ) {
    // 宠物普通攻击
    if (petCommand.value.target) {
      return null;
    }
    return cancelMenu.value;
  }
  return null;
});

// 根据当前指令状态计算 canvas 的鼠标样式（使用 SVG data URL 嵌入 emoji）
const canvasCursor = computed(() => {
  // 玩家攻击 / 宠物攻击指令 - 选择目标中
  const isPlayerAttacking =
    playerCommand.value &&
    playerCommand.value.type === "attack" &&
    !playerCommand.value.target;
  const isPetAttacking =
    petCommand.value &&
    petCommand.value.type === "attack" &&
    !petCommand.value.target;
  if (isPlayerAttacking || isPetAttacking) {
    return buildEmojiCursor("🗡️");
  }
  // 玩家道具 / 宠物道具指令 - 已选道具，选择目标中
  const isPlayerItemTargeting =
    playerCommand.value &&
    playerCommand.value.type === "item" &&
    playerCommand.value.item &&
    !playerCommand.value.target;
  const isPetItemTargeting =
    petCommand.value &&
    petCommand.value.type === "item" &&
    petCommand.value.item &&
    !petCommand.value.target;
  if (isPlayerItemTargeting || isPetItemTargeting) {
    return buildEmojiCursor("❤️");
  }
  return "default";
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
  const currentPerRow = totalRows > 1 ? maxPerRow : totalCount;

  enemies.forEach((enemy, index) => {
    const row = Math.floor(index / currentPerRow);
    const colInRow = index % currentPerRow;

    // 等分：将直线分成 (currentPerRow + 1) 段，敌人位于分段点上
    const t = ((colInRow + 1) / (currentPerRow + 1)) * totalLineLength;

    // 计算该敌人在直线上的坐标
    const lineX = centerX + t * cosA;
    const lineY = centerY + t * sinA;

    // 平行线偏移：向右下偏移
    const offsetX =
      row * rowGap * offsetCos +
      Math.floor(index / currentPerRow) * 0.8 * unitSize;
    const offsetY =
      row * rowGap * offsetSin -
      unitSize -
      Math.floor(index / currentPerRow) * 0.8 * unitSize;

    enemy.x = lineX + offsetX;
    enemy.y = lineY + offsetY;
  });
};

const calcPlayerPosition = () => {
  if (!currentPlayer.value) return;

  const canvasWidth = props.width;
  const canvasHeight = props.height;
  const unitSize = currentPlayer.value.size || 40;

  // 玩家位于画布右侧，敌人的对面（右下方，单独一行）
  currentPlayer.value.x = (canvasWidth / 3) * 2 + unitSize / 2;
  currentPlayer.value.y = canvasHeight / 2 + unitSize * 2 * Math.sqrt(2);
};

const calcPetPosition = () => {
  if (!currentPet.value) return;

  const canvasWidth = props.width;
  const canvasHeight = props.height;
  const unitSize = currentPet.value.size || 40;

  // 宠物位于玩家下方另一行，敌人的对面（右侧，与玩家不同行）
  currentPet.value.x = (canvasWidth / 3) * 2 - unitSize * 2;
  currentPet.value.y = (canvasHeight / 3) * 2 - (unitSize * 2) / Math.sqrt(2);
};

// 绘制回调
const onDrawFrame = ({ ctx, deltaTime, canvasFrame }) => {
  // 绘制背景装饰 (deltaTime 单位 ms，换算为秒)
  drawDecoration(ctx, {
    width: props.width,
    height: props.height,
    frame: canvasFrame * 0.5,
  });

  // 绘制战斗魔法阵
  const magicCircleSize = (props.height / 3) * 2;
  drawMagicCircle(ctx, {
    x: props.width / 2 - magicCircleSize / 2,
    y: props.height / 2 - magicCircleSize / 2,
    frame: canvasFrame * 0.05,
    size: magicCircleSize,
    opacity: 0.3,
  });

  // 计算敌人位置
  calcEnemyPositions();

  // 计算玩家位置
  calcPlayerPosition();

  // 计算宠物位置
  calcPetPosition();

  // 绘制所有单位
  if (currentEnemyList.value) {
    for (const unit of currentEnemyList.value) {
      const animSpeed = unit.config.IDLE_SPEED
      unit.frame = unit.frame + deltaTime * animSpeed;
      unit.drawUnit(ctx, unit);
      drawHealthBar(ctx, unit, { x: unit.x, y: unit.y, textColor: "#00CCFF" });
    }
  }

  for (const unit of [currentPlayer.value, currentPet.value]) {
    const animSpeed = unit.config.IDLE_SPEED
    unit.frame = unit.frame + deltaTime * animSpeed;
    unit.drawUnit(ctx, unit);
    drawHealthBar(ctx, unit, { x: unit.x, y: unit.y, textColor: "#00CCFF" });
  }

  if (!currentMenusConfig.value) return;
  drawSelectMenus(ctx, currentMenusConfig.value);
};

// 点击菜单
const handleMenuClick = ({ e, canvasRect }) => {
  if (!currentMenusConfig.value) return;
  const clickX = e.clientX - canvasRect.left;
  const clickY = e.clientY - canvasRect.top;

  const config = currentMenusConfig.value;
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

// 点击画布点击
const onCanvasClick = ({ e, canvasRect }) => {
  handleMenuClick({ e, canvasRect });

  // 玩家普通攻击
  if (
    playerCommand.value &&
    playerCommand.value.type === "attack" &&
    !playerCommand.value.target
  ) {
    const selectedEnemyUnitIndex = handleSelectEnemyUnit({ e, canvasRect });
    if (selectedEnemyUnitIndex !== -1) {
      playerCommand.value.target =
        currentEnemyList.value[selectedEnemyUnitIndex].id;
      console.log("player-selectedEnemyUnitIndex", selectedEnemyUnitIndex);
    }
    return;
  }

  // 玩家道具使用
  if (
    playerCommand.value &&
    playerCommand.value.type === "item" &&
    playerCommand.value.item &&
    !playerCommand.value.target
  ) {
    const target = handleSelectPlayerUnit({ e, canvasRect });
    playerCommand.value.target = target;
    return;
  }

  // 宠物普通攻击
  if (
    petCommand.value &&
    petCommand.value.type === "attack" &&
    !petCommand.value.target
  ) {
    const selectedEnemyUnitIndex = handleSelectEnemyUnit({ e, canvasRect });
    if (selectedEnemyUnitIndex !== -1) {
      petCommand.value.target =
        currentEnemyList.value[selectedEnemyUnitIndex].id;
      console.log("player-selectedEnemyUnitIndex", selectedEnemyUnitIndex);
    }
    return;
  }

  // 宠物道具使用
  if (
    petCommand.value &&
    petCommand.value.type === "item" &&
    petCommand.value.item &&
    !petCommand.value.target
  ) {
    const target = handleSelectPlayerUnit({ e, canvasRect });
    petCommand.value.target = target;
    return;
  }
};

// 鼠标在画布上移动
const onCanvasMouseMove = ({ e, canvasRect }) => {
  cursorPos.value = {
    x: e.clientX - canvasRect.left,
    y: e.clientY - canvasRect.top,
  };
};

// 点击画布选择敌人单位
const handleSelectEnemyUnit = ({ e, canvasRect }) => {
  const clickX = e.clientX - canvasRect.left;
  const clickY = e.clientY - canvasRect.top;

  let selectedEnemyUnitIndex = -1;
  // 检测点击了哪个单位
  for (let i = 0; i < currentEnemyList.value.length; i++) {
    const unit = currentEnemyList.value[i];
    const unitSize = unit.size || 50;
    if (
      clickX >= unit.x &&
      clickX <= unit.x + unitSize &&
      clickY >= unit.y &&
      clickY <= unit.y + unitSize
    ) {
      selectedEnemyUnitIndex = i;
      break;
    }
  }
  return selectedEnemyUnitIndex;
};

const handleSelectPlayerUnit = ({ e, canvasRect }) => {
  const clickX = e.clientX - canvasRect.left;
  const clickY = e.clientY - canvasRect.top;

  // 检测点击了哪个单位
  if (
    clickX >= currentPlayer.value.x &&
    clickX <= currentPlayer.value.x + currentPlayer.value.size &&
    clickY >= currentPlayer.value.y &&
    clickY <= currentPlayer.value.y + currentPlayer.value.size
  ) {
    return "player";
  }
  if (
    clickX >= currentPet.value.x &&
    clickX <= currentPet.value.x + currentPet.value.size &&
    clickY >= currentPet.value.y &&
    clickY <= currentPet.value.y + currentPet.value.size
  ) {
    return "pet";
  }
  return null;
};

const handleItemSelect = (item) => {
  if (
    playerCommand.value &&
    playerCommand.value.type === "item" &&
    !playerCommand.value.item
  ) {
    playerCommand.value.item = item;
    itemDialogShow.value = false;
    return;
  }
  if (
    petCommand.value &&
    petCommand.value.type === "item" &&
    !petCommand.value.item
  ) {
    petCommand.value.item = item;
    itemDialogShow.value = false;
    return;
  }
};

const handleItemCancel = () => {
  itemDialogShow.value = false;
  if (itemDialogOpener.value === "player") {
    playerCommand.value = null;
    itemDialogOpener.value = null;
  } else if (itemDialogOpener.value === "pet") {
    petCommand.value = null;
    itemDialogOpener.value = null;
  }
};

const initUnit = (item, index) => {
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
    id: index + 1,
    config: item.config,
    drawUnit: item.drawUnit,
    drawAvatar: item.drawAvatar,
  };
};

const onInit = () => {
  const list = [];
  props.enemyList.forEach((enemy, index) => {
    list.push(initUnit(enemy, index));
  });
  currentEnemyList.value = list;
  currentPlayer.value = initUnit(props.player);
  currentPet.value = initUnit(props.pet);
};

onInit();
</script>
<style lang="scss" module>
.item-dialog {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  .item-dialog-container {
    width: 300px;
    max-height: 400px;
    background-color: rgba(255, 255, 255, 0.8);
    color: #000;
    border-radius: 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;

    .item-dialog-container-title {
      text-align: center;
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 15px;
      border-bottom: 1px solid #ccc;
      padding-bottom: 10px;
    }

    .item-dialog-container-body {
      flex: 1;
      overflow-y: auto;

      .item-dialog-item {
        padding: 10px;
        cursor: pointer;
        border-radius: 5px;
        transition: background-color 0.2s;

        &:hover {
          background-color: #e0e0e0;
        }
      }
    }

    .item-dialog-container-footer {
      margin-top: 15px;
      display: flex;
      justify-content: center;

      .item-dialog-cancel-btn {
        padding: 8px 20px;
        background-color: #666;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;

        &:hover {
          background-color: #888;
        }
      }
    }
  }
}
</style>
