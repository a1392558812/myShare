<template>
  <div>
    <canvasDraw @drawFrame="onDrawFrame" @canvasMounted="onCanvasMounted" @canvasClick="onCanvasClick"
      @canvasDestroyed="onCanvasDestroyed" @canvasMouseMove="onCanvasMouseMove">

    </canvasDraw>
    <div class="dialog">
      <div>选择目标，按X射箭</div>
      <div>按住C激光</div>
      <div>按V魔法阵惊雷</div>
      <div>选择目标，按Z火球</div>
      <div>选择目标，按1封印</div>
      <div>选择目标，按2中毒</div>
      <div>选择目标，按3混沌</div>
      <div>选择目标，按4冰冻</div>
      <div class="dialog-body">
        <div v-for="(itemKey, index) in Object.keys(units).filter(item => item !== selectedUnit)" :key="index"
          class="dialog-item">
          {{ itemKey }}-{{ selectedUnit }}
          <div class="dialog-item-checkbox"
            :style="{ background: targetList.includes(itemKey) ? 'green' : '#fff' }"
            @click="onTargetClick(itemKey)"></div>
          <div>{{ units[itemKey].name }}</div>
        </div>
      </div>
    </div>
  </div>

</template>
<script setup>
import { ref } from "vue";
import {
  drawSelectionHighlight,
  drawBorder,
  drawHealthBar,
} from "../draw-utils.js";
import canvasDraw from "./canvas-draw.vue";

// ===================== 攻击系统导入 =====================
import { updateArrows, fireAttack } from "../draw-attack/arrow.js";
import { laser, drawLaser } from "../draw-attack/laser.js";
import { updateFireballs, fireFireball } from "../draw-attack/fireball.js";
import { updateMagicCircles, createMagicCircle } from "../draw-attack/magic.js";
import { updateObstacles, fireObstacle } from "../draw-attack/obstacle.js";

const props = defineProps({
  width: {
    type: Number,
    default: 1200,
  },
  height: {
    type: Number,
    default: 675,
  },
  enemy: {
    type: Object,
    default: () => { },
  },
  player: {
    type: Object,
    default: () => { },
  },
  pet: {
    type: Object,
    default: () => { },
  },
});

const selectedUnit = ref("player");

const targetList = ref(['slime', 'phantomKnight', 'maouOfChaos'])

// 单位管理
const units = ref({});

// 按键状态数组 - 存储当前按下的键
const keyMapDirection = {
  w: {
    direction: "up",
    axis: "y",
    plusMinus: -1,
  },
  s: {
    direction: "down",
    axis: "y",
    plusMinus: 1,
  },
  a: {
    direction: "left",
    axis: "x",
    plusMinus: -1,
  },
  d: {
    direction: "right",
    axis: "x",
    plusMinus: 1,
  },
};
const keyDownList = ref([]);

const onTargetClick = (itemKey) => {
  const index = targetList.value.findIndex(item => item === itemKey)
  console.log('onTargetClick', itemKey, index)
  if (index === -1) {
    targetList.value.push(itemKey)
  } else {
    targetList.value.splice(index, 1)
  }
}

// 绘制回调
const onDrawFrame = ({ ctx, deltaTime, canvasFrame, canvasRect }) => {
  // 清空画布
  ctx.clearRect(0, 0, props.width, props.height);

  // 获取当前选中的单位
  const currentUnit = units.value[selectedUnit.value];
  const unitSize = currentUnit.size || 50;

  // 判断是否在移动
  const isMoving = keyDownList.value.length > 0;

  // 绘制所有单位
  for (const [key, unit] of Object.entries(units.value)) {
    const isCurrentSelected = key === selectedUnit.value;
    unit.isMoving = isCurrentSelected && isMoving;

    if (isCurrentSelected && isMoving) {
      const currentKey = keyDownList.value[keyDownList.value.length - 1];
      const targetKeyMap = keyMapDirection[currentKey];

      unit[targetKeyMap.axis] += unit.speed * targetKeyMap.plusMinus * 1.2;
      unit.direction = targetKeyMap.direction;

      // 边界检测
      unit.x = Math.max(0, Math.min(props.width - unitSize, unit.x));
      unit.y = Math.max(0, Math.min(props.height - unitSize, unit.y));
    }
    const animSpeed = unit.isMoving
      ? unit.config.WALK_SPEED
      : unit.config.IDLE_SPEED;
    unit.frame = unit.frame + deltaTime * animSpeed;

    unit.drawUnit(ctx, unit);
    drawHealthBar(ctx, unit, { x: unit.x, y: unit.y, textColor: "#00CCFF" });

    if (selectedUnit.value === key) {
      drawSelectionHighlight(ctx, unit, key);
      drawBorder(ctx, unit, key);
    }
  }

  // ---- 攻击系统绘制 ----
  updateArrows(ctx, deltaTime);
  drawLaser(ctx, canvasFrame, units, selectedUnit);
  updateFireballs(ctx, deltaTime);
  updateMagicCircles(ctx, deltaTime);
  updateObstacles(ctx, deltaTime);
};

// 点击画布选择单位
const handleSelectUnit = ({ e, canvasRect }) => {
  const clickX = e.clientX - canvasRect.left;
  const clickY = e.clientY - canvasRect.top;

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
      targetList.value = []
      break;
    }
  }
};

// 画布上MouseMove - 实时记录鼠标在 canvas 内的坐标
const onCanvasMouseMove = ({ e, canvasRect }) => {
  if (!canvasRect) return;
  laser.value.mouseX = e.clientX - canvasRect.left;
  laser.value.mouseY = e.clientY - canvasRect.top;
}

// 点击画布选择单位
const onCanvasClick = ({ e, canvasRect }) => {
  console.log('onCanvasClick')
  handleSelectUnit({ e, canvasRect });
};

// 键盘按下
const handleKeyDown = (e) => {
  const key = e.key.toLowerCase();
  if (
    Object.keys(keyMapDirection).includes(key) &&
    !keyDownList.value.includes(key)
  ) {
    keyDownList.value.push(key);
  }
  console.log('fireAttack', units, selectedUnit, targetList)
  // x 键发动箭矢攻击
  if (key === "x") {
    fireAttack(units, selectedUnit, targetList);
  }
  // c 键开始持续激光
  if (key === "c") {
    laser.value.isActive = true;
    laser.value.frame = 0;
  }
  // z 键发动火球攻击
  if (key === "z") {
    fireFireball(units, selectedUnit, targetList);
  }
  // v 键在鼠标位置生成魔法阵
  if (key === "v") {
    createMagicCircle(laser.value.mouseX, laser.value.mouseY);
  }
  // 1/2/3/4 键发动文本障碍攻击（封印/中毒/混沌/冰冻）
  if (["1", "2", "3", "4"].includes(key)) {
    fireObstacle(key, units, selectedUnit, targetList);
  }
};

// 键盘释放
const handleKeyUp = (e) => {
  const key = e.key.toLowerCase();
  const validKeys = ["w", "a", "s", "d"];

  // 如果是有效的方向键，则从列表中移除
  if (validKeys.includes(key)) {
    const index = keyDownList.value.indexOf(key);
    if (index !== -1) {
      keyDownList.value.splice(index, 1);
    }
  }
  // c 键松开停止激光
  if (key === "c") {
    laser.value.isActive = false;
    laser.value.frame = 0;
  }
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
  };
};

const onInit = () => {
  Object.keys(props.enemy).forEach((key) => {
    units.value[key] = initUnit(props.enemy[key]);
  });
  units.value.player = initUnit(props.player);
  units.value.pet = initUnit(props.pet);

  let col = 3;
  let row = 0;
  Object.keys(units.value).forEach((key, index) => {
    const unit = units.value[key];
    const colIndex = index % col;
    if (colIndex === 0) {
      row++;
    }
    const unitX = colIndex * (unit.size + 10) + unit.size;
    const unitY = row * unit.size * 2;

    unit.x = unitX;
    unit.y = unitY;
    unit.debuffList = [];
    unit.buffList = [];
    unit.avatarPos = {
      x: unitX + (col + 1) * unit.size,
      y: unitY,
    };
  });
};

onInit();

const onCanvasMounted = () => {
  // 监听键盘事件
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
}

const onCanvasDestroyed = () => {
  // 移除键盘监听
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
};
</script>
<style lang="scss" module>
.dialog {
  background: #000;
  width: 300px;
  position: absolute;
  top: 50px;
  right: 0;
  color: #fff;

  .dialog-body {
    height: 400px;
    overflow: auto;

    .dialog-item {
      display: flex;
      align-items: center;
      gap: 5px;

      .dialog-item-checkbox {
        width: 1em;
        height: 1em;
        border: 1px solid #000;
      }
    }
  }
}
</style>
