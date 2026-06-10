<template>
  <div
    ref="gameContainerRef"
    class="draw-game-units"
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
    <div class="unit-selector">
      <select v-model="selectedUnit" :key="key">
        <option v-for="(unit, key) in units" :key="key" :value="key">
          {{ unit.name }}
        </option>
      </select>
      <div>
        <div
          class="input-wrap"
          v-for="(keyVal, index) in ['hp', 'mp']"
          :key="index"
        >
          {{ keyVal }}:<input
            style="width: 3em"
            type="number"
            v-model.number="units[selectedUnit][keyVal]"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { frameRateManager } from "../frame-rate.js";
import {
  drawSelectionHighlight,
  drawBorder,
  drawHealthBar,
} from "../draw-utils.js";

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
    default: () => {},
  },
  player: {
    type: Object,
    default: () => {},
  },
  pet: {
    type: Object,
    default: () => {},
  },
});

const canvasRef = ref(null);
const canvasRect = ref(null);
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
const drawFrame = (deltaTime) => {
  const ctx = canvasRef.value?.getContext("2d");
  if (!ctx) return;

  // 清空画布
  ctx.clearRect(0, 0, props.width, props.height);

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
      const currentKey = keyDownList.value[keyDownList.value.length - 1];
      const targetKeyMap = keyMapDirection[currentKey];

      unit[targetKeyMap.axis] += unit.speed * targetKeyMap.plusMinus;
      unit.direction = targetKeyMap.direction;

      // 边界检测
      unit.x = Math.max(0, Math.min(props.width - unitSize, unit.x));
      unit.y = Math.max(0, Math.min(props.height - unitSize, unit.y));
    }
    const animSpeed = unit.isMoving
      ? unit.config.WALK_SPEED
      : unit.config.IDLE_SPEED;
    unit.frame = unit.frame + deltaTime * animSpeed;
  }

  // 绘制所有单位
  for (const [key, unit] of Object.entries(units.value)) {
    unit.drawUnit(ctx, unit);
    drawHealthBar(ctx, unit, { x: unit.x, y: unit.y, textColor: "#00CCFF" });

    const avatarPos = Object.assign({ size: unitSize }, unit.avatarPos);
    unit.drawAvatar(ctx, unit, avatarPos);
    drawHealthBar(ctx, unit, avatarPos);
    drawBorder(ctx, avatarPos, key);

    if (selectedUnit.value === key) {
      drawSelectionHighlight(ctx, unit, key);
      drawBorder(ctx, unit, key);
    }
  }
};

// 点击画布选择单位
const handleSelectUnit = (e) => {
  const clickX = e.clientX - canvasRect.value.left;
  const clickY = e.clientY - canvasRect.value.top;

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
const handleCanvasClick = (e) => {
  handleSelectUnit(e);
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
    drawAvatar: item.drawAvatar,
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
    unit.avatarPos = {
      x: unitX + (col + 1) * unit.size,
      y: unitY,
    };
  });
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

  // 监听键盘事件
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
});

onUnmounted(() => {
  // 停止动画
  frameRateManager.stop();

  // 移除回调
  frameRateManager.clear();

  // 移除键盘监听
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
});
</script>
<style lang="scss" module>
.draw-game-units {
  position: relative;

  canvas {
    width: 100%;
    height: 100%;
    background-color: rgba(15, 15, 15, 0.582);
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
