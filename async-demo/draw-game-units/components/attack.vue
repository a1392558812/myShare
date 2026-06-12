<template>
  <canvasDraw @drawFrame="onDrawFrame" @canvasMounted="onCanvasMounted" @canvasClick="onCanvasClick"
    @canvasDestroyed="onCanvasDestroyed" />
</template>
<script setup>
import { ref } from "vue";
import {
  drawSelectionHighlight,
  drawBorder,
  drawHealthBar,
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

// 绘制回调
const onDrawFrame = ({ ctx, deltaTime, canvasFrame }) => {
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
      break;
    }
  }
};

// 点击画布选择单位
const onCanvasClick = ({ e, canvasRect }) => {
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