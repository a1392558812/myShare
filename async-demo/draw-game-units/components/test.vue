<template>
  <canvasDraw @drawFrame="onDrawFrame" @canvasMounted="onCanvasMounted" @canvasClick="onCanvasClick"
    @canvasDestroyed="onCanvasDestroyed">
    <div class="unit-selector">
      <select v-model="selectedUnit" :key="key">
        <option v-for="(unit, key) in units" :key="key" :value="key">
          {{ unit.name }}
        </option>
      </select>
      <div>
        <div class="input-wrap" v-for="(keyVal, index) in ['hp', 'mp']" :key="index">
          {{ keyVal }}:<input style="width: 3em" type="number" v-model.number="units[selectedUnit][keyVal]" />
        </div>
      </div>
      <div>
        <div>debuffList</div>
        <div v-for="(debuff, index) in debuffList" :key="index">
          {{ debuff.label }}:<input type="checkbox" :value="units[selectedUnit].debuffList.find(
            (item) => item.value === debuff.value,
          ) !== undefined
            " @input="onDebuffInput(debuff)" />
        </div>
      </div>
      <div>
        <div>buffList</div>
        <div v-for="(buff, index) in buffList" :key="index">
          {{ buff.label }}:<input type="checkbox" :value="units[selectedUnit].buffList.find(
            (item) => item.value === buff.value,
          ) !== undefined
            " @input="onBuffInput(buff)" />
        </div>
      </div>
    </div>
  </canvasDraw>
</template>
<script setup>
import { ref } from "vue";
import {
  drawPoisoning,
  drawChaos,
  drawFrozen,
  drawSeal,
} from "../draw-buff/debuff.js";
import {
  drawSpeed,
  drawDefense,
  drawAttack,
  drawRecover,
} from "../draw-buff/buff.js";
import {
  drawSelectionHighlight,
  drawBorder,
  drawHealthBar,
  drawPanel,
  drawTombstone,
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

const debuffList = ref([
  {
    label: "封印",
    duration: 5,
    value: "seal",
    draw: drawSeal,
  },
  {
    label: "冰冻",
    duration: 5,
    value: "frozen",
    draw: drawFrozen,
  },
  {
    label: "中毒",
    duration: 5,
    value: "poisoned",
    draw: drawPoisoning,
  },
  {
    label: "混沌",
    duration: 5,
    value: "chaos",
    draw: drawChaos,
  },
]);

const buffList = ref([
  {
    label: "速度提升",
    duration: 5,
    value: "speed",
    draw: drawSpeed,
  },
  {
    label: "防御提升",
    duration: 5,
    value: "defense",
    draw: drawDefense,
  },
  {
    label: "攻击提升",
    duration: 5,
    value: "attack",
    draw: drawAttack,
  },
  {
    label: "恢复",
    duration: 5,
    value: "recover",
    draw: drawRecover,
  },
]);

const selectedUnit = ref("player");

const units = ref({});

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

const onDebuffInput = (debuff) => {
  const index = units.value[selectedUnit.value].debuffList.findIndex(
    (item) => item.value === debuff.value,
  );
  if (index !== -1) {
    units.value[selectedUnit.value].debuffList.splice(index, 1);
  } else {
    units.value[selectedUnit.value].debuffList.push(debuff);
  }
  console.log(units.value[selectedUnit.value].debuffList);
};

const onBuffInput = (buff) => {
  const index = units.value[selectedUnit.value].buffList.findIndex(
    (item) => item.value === buff.value,
  );
  if (index !== -1) {
    units.value[selectedUnit.value].buffList.splice(index, 1);
  } else {
    units.value[selectedUnit.value].buffList.push(buff);
  }
  console.log(units.value[selectedUnit.value].buffList);
};

const onDrawFrame = ({ ctx, deltaTime, canvasFrame }) => {
  const currentUnit = units.value[selectedUnit.value];
  const unitSize = currentUnit.size || 50;

  const isMoving = keyDownList.value.length > 0;

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

    for (const debuff of unit.debuffList) {
      debuff.draw(ctx, {
        x: unit.x,
        y: unit.y,
        size: unitSize,
        frame: canvasFrame,
      });
    }

    for (const buff of unit.buffList) {
      buff.draw(ctx, {
        x: unit.x,
        y: unit.y,
        size: unitSize,
        frame: canvasFrame,
      });
    }

    if (unit.hp && unit.hp > 0) {
      unit.drawUnit(ctx, unit);
    } else {
      drawTombstone(ctx, unit);
    }

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

  drawTombstone(ctx, {
    x: 40 + 40 * 2 + 10 * 2,
    y: 560,
    maxHp: 100,
    hp: 0,
    maxMp: 100,
    mp: 0,
    size: 40,
  });

  for (let i = 0; i < buffList.value.length; i++) {
    const buff = buffList.value[i];
    buff.draw(ctx, {
      x: 100 + 40 * 6 + 20 + i * 50,
      y: 80,
      size: 40,
      frame: canvasFrame,
    });
  }

  for (let i = 0; i < debuffList.value.length; i++) {
    const debuff = debuffList.value[i];
    debuff.draw(ctx, {
      x: 100 + 40 * 6 + 20 + i * 50,
      y: 160,
      size: 40,
      frame: canvasFrame,
    });
  }

  drawPanel(ctx, currentUnit, {
    x: 100 + 40 * 6 + 20,
    y: 240,
    width: 480,
    height: 160,
  });
};

const handleSelectUnit = ({ e, canvasRect }) => {
  const clickX = e.clientX - canvasRect.left;
  const clickY = e.clientY - canvasRect.top;

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

const onCanvasClick = ({ e, canvasRect }) => {
  handleSelectUnit({ e, canvasRect });
};

const handleKeyDown = (e) => {
  const key = e.key.toLowerCase();
  if (
    Object.keys(keyMapDirection).includes(key) &&
    !keyDownList.value.includes(key)
  ) {
    keyDownList.value.push(key);
  }
};

const handleKeyUp = (e) => {
  const key = e.key.toLowerCase();
  const validKeys = ["w", "a", "s", "d"];

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
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
};

const onCanvasDestroyed = () => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
};
</script>
<style lang="scss" module>
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
</style>
