<template>
  <div class="battle-wrap">
    <div style="height: 100%; display: flex; gap: 20px; background: #0a0a0f">
      <div
        style="
          min-width: 700px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        "
      >
        <customBtnCom
          @click="() => openDialog({ overlayStyle: { zIndex: 1000 } })"
        >
          显示源码
        </customBtnCom>

        <div class="controls-panel-wrap">
          <div
            v-for="(item, index) in [
              [
                {
                  label: '玩家 1',
                  style: { color: config.COLOR_PLAYER1.value },
                },
                { label: 'A/D - 移动' },
                { label: 'W - 跳跃' },
                { label: 'J - 近身攻击' },
                { label: 'K - 防御' },
                { label: 'L - 远程攻击' },
                { label: 'I - 治疗' },
                { label: 'O - 爆气' },
              ],
              [
                {
                  label: '玩家 2',
                  style: { color: config.COLOR_PLAYER2.value },
                },
                { label: '←/→ - 移动' },
                { label: '↑ - 跳跃' },
                { label: '小键盘1 - 近身攻击' },
                { label: '小键盘2 - 防御' },
                { label: '小键盘3 - 远程攻击' },
                { label: '小键盘4 - 治疗' },
                { label: '小键盘5 - 爆气' },
              ],
            ]"
            class="controls-panel"
            :key="index"
          >
            <div
              v-for="(labelItem, labelIndex) in item"
              :key="`${index}-${labelIndex}`"
              :style="[{ flexShrink: 0 }, labelItem.style || {}]"
            >
              {{ labelItem.label }}
            </div>
          </div>

          <div
            class="controls-panel"
            v-for="(item, index) in [player1, player2]"
            :key="index"
          >
            <div
              style="flex-shrink: 0"
              v-for="(childKey, childIndex) in Object.keys(
                initCommonPlayerConfig,
              )"
              :key="`${index}-${childIndex}`"
            >
              <span style="flex-shrink: 0"
                >{{ initCommonPlayerConfig[childKey].label }}：</span
              >
              <customInput v-model="item[childKey]" />
            </div>
          </div>

          <div
            style="
              grid-column: span 2 / span 2;
              display: grid;
              grid-template-columns: 1fr 1fr;
            "
            class="controls-panel"
          >
            <div
              style="display: flex; gap: 10px"
              v-for="(key, index) in Object.keys(config)"
              :key="index"
            >
              <div style="flex-shrink: 0">{{ config[key].label }}：</div>
              <customInput v-model="config[key].value" />
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 20px">
        <div style="position: relative">
          <canvas
            ref="gameCanvas"
            :width="config.CANVAS_WIDTH.value"
            :height="config.CANVAS_HEIGHT.value"
          ></canvas>

          <div v-if="winner" class="result-overlay">
            <h2 v-if="winner === 'player1'" style="color: #ef4444">红色获胜</h2>
            <h2 v-else-if="winner === 'player2'" style="color: #3b82f6">
              蓝色获胜
            </h2>
            <h2 v-else style="color: #64748b">平局</h2>
            <p style="color: #fbbf24">按 R 重新开始</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="jsx">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import baseConfig from "../static/hooks/extends.js";
import { inputCom, customBtnCom } from "../components/form-control/index.vue";
import { colorPicker } from "../components/color-picker/index.js";

defineOptions({
  extends: baseConfig({
    customDialog: import("../components/dialog/index.vue"),
  }),
});

// 物理常量
const config = reactive({
  CANVAS_WIDTH: { value: 800, label: "画布宽度" },
  CANVAS_HEIGHT: { value: 450, label: "画布高度" },
  WORLD_WIDTH: { value: 1200, label: "世界宽度" },
  GRAVITY: { value: 0.8, label: "重力加速度" },
  GROUND_Y: { value: 300, label: "地面高度" },
  MOVE_SPEED: { value: 5, label: "移动速度" },
  JUMP_FORCE: { value: -15, label: "跳跃力" },
  ATTACK_COOLDOWN: { value: 30, label: "攻击冷却时间/帧" },
  ATTACK_DAMAGE: { value: 10, label: "攻击伤害" },
  DEFENSE_REDUCTION: { value: 0.6, label: "防御伤害减少率" },
  ATTACK_RANGE: { value: 80, label: "攻击范围" },
  SHIELD_ENERGY_DRAIN: { value: 1.5, label: "防御能量消耗率" },
  SHIELD_ENERGY_REGEN: { value: 0.3, label: "防御能量恢复率" },
  MAX_SHIELD_ENERGY: { value: 100, label: "最大防御能量" },
  SHIELD_REGEN_DELAY: { value: 120, label: "防御能量恢复时间/帧" },
  SHOT_ENERGY_COST: { value: 15, label: "射击能量消耗" },
  SHOT_DAMAGE: { value: 1, label: "射击伤害" },
  SHOT_KNOCKBACK: { value: 40, label: "射击击退力" },
  SHOT_SPEED: { value: 10, label: "射击速度" },
  SHOT_COOLDOWN: { value: 60, label: "射击冷却时间/帧" },
  HEAL_ENERGY_COST: { value: 50, label: "治疗能量消耗" },
  HEAL_AMOUNT: { value: 10, label: "治疗量" },
  HEAL_COOLDOWN: { value: 90, label: "治疗冷却时间/帧" },
  BURST_ENERGY_COST: { value: 60, label: "爆气能量消耗" },
  BURST_KNOCKBACK: { value: 80, label: "爆气击退距离" },
  BURST_COOLDOWN: { value: 120, label: "爆气冷却时间/帧" },
  BURST_DISTANCE_THRESHOLD: { value: 120, label: "爆气水平距离检测阈值" },
  BURST_DAMAGE: { value: 0, label: "爆气伤害" },
  ATTACK_STUN_DURATION: { value: 35, label: "攻击僵直时间/帧" },
  COLLISION_OVERLAP_LIMIT: { value: 40, label: "玩家碰撞重叠限制" },
  COLLISION_VERTICAL_TOLERANCE: { value: 10, label: "垂直碰撞重叠容差" },
  BURST_RANGE: { value: 120, label: "爆气有效距离" },
  BURST_VERTICAL_TOLERANCE: { value: 20, label: "爆气垂直重叠容差" },
  BURST_KNOCKBACK_SPEED: { value: 10, label: "爆气击退速度" },
  ANIM_CANCEL_FRAME: { value: 15, label: "攻击动画取消帧数" },
  SHOT_WIDTH: { value: 20, label: "子弹宽度" },
  SHOT_HEIGHT: { value: 10, label: "子弹高度" },
  SHOT_HORIZONTAL_OFFSET: { value: 20, label: "子弹发射水平偏移" },
  SHOT_BOUNDARY_MARGIN: { value: 20, label: "子弹边界检测边距" },
  SHOT_KNOCKBACK_SPEED_RATIO: { value: 0.3, label: "射击击退速度系数" },
  FRICTION_STUN: { value: 0.95, label: "僵直摩擦系数" },
  FRICTION_NORMAL: { value: 0.8, label: "普通摩擦系数" },
  ANIM_SPEED_THRESHOLD: { value: 0.5, label: "动画触发速度阈值" },
  PARTICLE_COUNT: { value: 10, label: "粒子生成数量" },
  PARTICLE_SPEED: { value: 10, label: "粒子速度" },
  PARTICLE_SIZE_MAX: { value: 6, label: "粒子最大尺寸" },
  PARTICLE_SIZE_MIN: { value: 2, label: "粒子最小尺寸" },
  PARTICLE_LIFETIME: { value: 30, label: "粒子生命周期" },
  MAX_HEALTH: { value: 100, label: "最大生命值" },
  BOMB_ENABLED: { value: true, label: "是否启用炸弹事件" },
  BOMB_SPAWN_INTERVAL: { value: 180, label: "炸弹生成间隔/帧" },
  BOMB_FALL_SPEED: { value: 4, label: "炸弹下落速度" },
  BOMB_SIZE: { value: 20, label: "炸弹大小" },
  BOMB_DAMAGE: { value: 5, label: "炸弹伤害" },
  BOMB_EXPLOSION_RADIUS: { value: 60, label: "炸弹爆炸范围" },
  BOMB_KNOCKBACK: { value: 30, label: "炸弹击退力" },
  BOMB_KNOCKBACK_SPEED_RATIO: { value: 0.3, label: "炸弹击退速度系数" },
  BOMB_BODY_COLOR: { value: "#333333", label: "炸弹主体颜色" },
  BOMB_HIGHLIGHT_COLOR: { value: "#ff6b35", label: "炸弹高亮颜色" },
  BOMB_FUSE_COLOR: { value: "#ffd93d", label: "引信颜色" },
  BOMB_FUSE_LENGTH: { value: 8, label: "引信长度" },
  COLOR_PLAYER1: { value: "#ef4444", label: "玩家1颜色" },
  COLOR_PLAYER2: { value: "#3b82f6", label: "玩家2颜色" },
  COLOR_TEXT: { value: "#ffffff", label: "文字颜色" },
  COLOR_BAR_BG: { value: "#333333", label: "血条背景色" },
  COLOR_COOLDOWN_BORDER: { value: "#666666", label: "冷却边框色" },
  COLOR_COOLDOWN_FILL: { value: "#222222", label: "冷却填充色" },
  COLOR_BORDER: { value: "#444444", label: "边框颜色" },
  COLOR_SHIELD: { value: "#fbbf24", label: "防御/爆气颜色" },
  COLOR_HEAL: { value: "#10b981", label: "治疗/能量颜色" },
  COLOR_STUN: { value: "#ff0000", label: "僵直颜色" },
  COLOR_EYES: { value: "#00ffff", label: "眼睛颜色" },
  COLOR_BG_TOP: { value: "#1a1a2e", label: "背景顶部颜色" },
  COLOR_BG_BOTTOM: { value: "#16213e", label: "背景底部颜色" },
  COLOR_GROUND: { value: "#0f0f23", label: "地面颜色" },
  COLOR_GROUND_LINE: { value: "#1f1f3a", label: "地面线条颜色" },
  COLOR_DRAW: { value: "#64748b", label: "平局颜色" },
  POWERUP_SPAWN_INTERVAL: { value: 300, label: "道具生成间隔/帧" },
  POWERUP_SIZE: { value: 25, label: "道具大小" },
  POWERUP_HEAL_ENABLED: { value: true, label: "血包启用" },
  POWERUP_HEAL_AMOUNT: { value: 20, label: "血包恢复量" },
  POWERUP_HEAL_LIFETIME: { value: 600, label: "血包存在时间/帧(-1永久)" },
  POWERUP_ENERGY_ENABLED: { value: true, label: "能量包启用" },
  POWERUP_ENERGY_AMOUNT: { value: 30, label: "能量包恢复量" },
  POWERUP_ENERGY_LIFETIME: { value: 600, label: "能量包存在时间/帧(-1永久)" },
  POWERUP_SPEED_ENABLED: { value: true, label: "加速道具启用" },
  POWERUP_SPEED_BOOST: { value: 2, label: "加速道具加成" },
  POWERUP_SPEED_DURATION: { value: 120, label: "加速持续时间/帧" },
  POWERUP_SPEED_LIFETIME: { value: 600, label: "加速道具存在时间/帧(-1永久)" },
});

const customInput = (props, context) => {
  if (typeof props.modelValue === "number") {
    return (
      <inputCom
        type="number"
        modelValue={props.modelValue.toFixed(2)}
        onUpdate:modelValue={(modelValue) => {
          context.emit("update:modelValue", Number(modelValue.toFixed(2)));
        }}
      />
    );
  }
  if (typeof props.modelValue === "boolean") {
    return (
      <inputCom
        type="checkbox"
        modelValue={props.modelValue}
        onUpdate:modelValue={(modelValue) => {
          context.emit("update:modelValue", Boolean(modelValue));
        }}
      />
    );
  }
  if (typeof props.modelValue === "string") {
    if (props.modelValue.startsWith("#")) {
      return (
        <inputCom
          type="color"
          modelValue={props.modelValue}
          onUpdate:modelValue={(modelValue) => {
            context.emit("update:modelValue", String(modelValue));
          }}
        />
      );
    }
    return (
      <inputCom
        type="text"
        modelValue={props.modelValue}
        onUpdate:modelValue={(modelValue) => {
          context.emit("update:modelValue", String(modelValue));
        }}
      />
    );
  }
  return <div>{props.value}</div>;
};

const gameCanvas = ref(null);
let ctx = null;
let animationId = null;

// 游戏状态
const gameState = ref("playing");
const winner = ref(null);
const cameraOffset = ref(0);

const initCommonPlayerConfig = {
  name: {
    value: "玩家",
    label: "玩家名称",
  },
  width: {
    value: 60,
    label: "玩家宽度",
  },
  height: {
    value: 80,
    label: "玩家高度",
  },
  velocityX: {
    value: 0,
    label: "玩家水平速度",
  },
  velocityY: {
    value: 0,
    label: "玩家垂直速度",
  },
  health: {
    value: 100,
    label: "玩家生命值",
  },
  shieldEnergy: {
    value: 100,
    label: "玩家防御能量",
  },
  shieldRegenDelay: {
    value: 0,
    label: "玩家防御能量恢复时间/帧",
  },
  isJumping: {
    value: false,
    label: "玩家是否跳跃",
  },
  isAttacking: {
    value: false,
    label: "玩家是否攻击",
  },
  hasAttacked: {
    value: false,
    label: "玩家是否攻击过",
  },
  isDefending: {
    value: false,
    label: "玩家是否防御",
  },
  attackCooldown: {
    value: 0,
    label: "玩家攻击冷却时间/帧",
  },
  shotCooldown: {
    value: 0,
    label: "玩家射击冷却时间/帧",
  },
  healCooldown: {
    value: 0,
    label: "玩家治疗冷却时间/帧",
  },
  burstCooldown: {
    value: 0,
    label: "玩家爆气冷却时间/帧",
  },
  stunFrames: {
    value: 0,
    label: "玩家僵直帧数",
  },
  speedBoostFrames: {
    value: 0,
    label: "玩家加速状态帧数",
  },
  animFrame: {
    value: 0,
    label: "玩家动画帧",
  },
  x: {
    value: 100,
    label: "玩家X坐标",
  },
  y: {
    value: 300,
    label: "玩家Y坐标",
  },
  facingRight: {
    value: true,
    label: "玩家是否面向右侧",
  },
  color: {
    value: "#ef4444",
    label: "玩家颜色",
  },
};

const initCommonPlayer = () => {
  const valueConfig = {};
  for (const key in initCommonPlayerConfig) {
    valueConfig[key] = initCommonPlayerConfig[key].value;
  }
  return valueConfig;
};

const initPlayer1Fun = () =>
  Object.assign(initCommonPlayer(), {
    name: "玩家1",
    x: config.CANVAS_WIDTH.value / 4,
    y: config.GROUND_Y.value,
    facingRight: true,
    color: config.COLOR_PLAYER1.value,
  });

const initPlayer2Fun = () =>
  Object.assign(initCommonPlayer(), {
    name: "玩家2",
    x: (config.CANVAS_WIDTH.value * 3) / 4 - initCommonPlayerConfig.width.value,
    y: config.GROUND_Y.value,
    facingRight: false,
    color: config.COLOR_PLAYER2.value,
  });

// 玩家数据
const player1 = ref(initPlayer1Fun());
const player2 = ref(initPlayer2Fun());

// 按键状态
const keys = {};

const particles = [];
const shots = [];
const bombs = [];
const powerups = [];
let bombSpawnTimer = 0;
let powerupSpawnTimer = 0;

onMounted(() => {
  if (gameCanvas.value) {
    ctx = gameCanvas.value.getContext("2d");
    drawBackground();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    startGame();
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});

const handleKeyDown = (e) => {
  keys[e.code] = true;
  if (e.code === "KeyR" && winner.value) {
    startGame();
  }
};

const handleKeyUp = (e) => {
  keys[e.code] = false;
};

const startGame = () => {
  gameState.value = "playing";
  winner.value = null;
  resetPlayers();
  gameLoop();
};

const resetPlayers = () => {
  player1.value = initPlayer1Fun();
  player2.value = initPlayer2Fun();
  particles.length = 0;
  shots.length = 0;
  bombs.length = 0;
  powerups.length = 0;
  bombSpawnTimer = 0;
  powerupSpawnTimer = 0;
};

const checkPlayerCollision = (player, otherPlayer) => {
  const playerCenterY = player.y + player.height / 2;
  const otherCenterY = otherPlayer.y + otherPlayer.height / 2;

  const verticalOverlap =
    Math.abs(playerCenterY - otherCenterY) <
    (player.height + otherPlayer.height) / 2 -
      config.COLLISION_VERTICAL_TOLERANCE.value;

  if (!verticalOverlap) {
    return;
  }

  const horizontalOverlap =
    player.x < otherPlayer.x + otherPlayer.width &&
    player.x + player.width > otherPlayer.x;

  if (horizontalOverlap) {
    const overlap = Math.min(
      player.x + player.width - otherPlayer.x,
      otherPlayer.x + otherPlayer.width - player.x,
    );

    if (overlap > config.COLLISION_OVERLAP_LIMIT.value) {
      const playerCenterX = player.x + player.width / 2;
      const otherCenterX = otherPlayer.x + otherPlayer.width / 2;

      if (playerCenterX < otherCenterX) {
        player.x = otherPlayer.x - player.width / 2;
      } else {
        player.x = otherPlayer.x + otherPlayer.width / 2;
      }
      player.velocityX = 0;
    }
  }
};

const updatePlayer = (
  player,
  otherPlayer,
  leftKey,
  rightKey,
  jumpKey,
  attackKey,
  defendKey,
  shotKey,
  healKey,
  burstKey,
) => {
  if (gameState.value === "playing") {
    if (player.stunFrames > 0) {
      player.stunFrames--;
      player.velocityX *= config.FRICTION_STUN.value;
      player.isAttacking = false;
      player.isDefending = false;

      if (
        keys[burstKey] &&
        player.burstCooldown <= 0 &&
        player.shieldEnergy >= config.BURST_ENERGY_COST.value
      ) {
        player.stunFrames = 0;
        player.shieldEnergy -= config.BURST_ENERGY_COST.value;
        player.burstCooldown = config.BURST_COOLDOWN.value;
        createParticles(
          player.x + player.width / 2,
          player.y + player.height / 2,
          config.COLOR_SHIELD.value,
        );
        const playerCenterX = player.x + player.width / 2;
        const otherCenterX = otherPlayer.x + otherPlayer.width / 2;
        const knockbackDir = otherCenterX > playerCenterX ? 1 : -1;
        const horizontalDist = Math.abs(otherCenterX - playerCenterX);
        const verticalOverlap =
          Math.abs(
            player.y +
              player.height / 2 -
              (otherPlayer.y + otherPlayer.height / 2),
          ) <
          (player.height + otherPlayer.height) / 2 -
            config.BURST_VERTICAL_TOLERANCE.value;

        if (horizontalDist < config.BURST_RANGE.value && verticalOverlap) {
          otherPlayer.x += knockbackDir * config.BURST_KNOCKBACK.value;
          otherPlayer.velocityX =
            knockbackDir * config.BURST_KNOCKBACK_SPEED.value;
          otherPlayer.stunFrames = 0;
          otherPlayer.health = Math.max(
            0,
            otherPlayer.health - config.BURST_DAMAGE.value,
          );
          createParticles(
            otherPlayer.x + otherPlayer.width / 2,
            otherPlayer.y + otherPlayer.height / 2,
            config.COLOR_SHIELD.value,
          );
        }
      }
    } else {
      if (keys[leftKey]) {
        player.velocityX = -config.MOVE_SPEED.value;
        player.facingRight = false;
      } else if (keys[rightKey]) {
        player.velocityX = config.MOVE_SPEED.value;
        player.facingRight = true;
      } else {
        player.velocityX *= config.FRICTION_NORMAL.value;
      }

      if (player.speedBoostFrames > 0) {
        player.speedBoostFrames--;
        player.velocityX *= 1 + config.POWERUP_SPEED_BOOST.value / 10;
      }

      if (keys[jumpKey] && !player.isJumping) {
        player.velocityY = config.JUMP_FORCE.value;
        player.isJumping = true;
        createParticles(
          player.x + player.width / 2,
          player.y + player.height,
          player.color,
        );
      }

      if (keys[attackKey] && player.attackCooldown <= 0) {
        player.isAttacking = true;
        player.hasAttacked = false;
        player.attackCooldown = config.ATTACK_COOLDOWN.value;
      }

      if (player.attackCooldown <= config.ANIM_CANCEL_FRAME.value) {
        player.isAttacking = false;
      }

      if (
        keys[shotKey] &&
        player.shotCooldown <= 0 &&
        player.shieldEnergy >= config.SHOT_ENERGY_COST.value
      ) {
        player.shieldEnergy -= config.SHOT_ENERGY_COST.value;
        player.shotCooldown = config.SHOT_COOLDOWN.value;
        shots.push({
          x: player.facingRight
            ? player.x + player.width
            : player.x - config.SHOT_HORIZONTAL_OFFSET.value,
          y: player.y + player.height / 2 - config.SHOT_HEIGHT.value / 2,
          width: config.SHOT_WIDTH.value,
          height: config.SHOT_HEIGHT.value,
          velocityX: player.facingRight
            ? config.SHOT_SPEED.value
            : -config.SHOT_SPEED.value,
          color: player.color,
          owner: player === player1.value ? "player1" : "player2",
        });
      }

      if (
        keys[healKey] &&
        player.healCooldown <= 0 &&
        player.shieldEnergy >= config.HEAL_ENERGY_COST.value &&
        player.health < config.MAX_HEALTH.value
      ) {
        player.shieldEnergy -= config.HEAL_ENERGY_COST.value;
        player.healCooldown = config.HEAL_COOLDOWN.value;
        player.health = Math.min(
          config.MAX_HEALTH.value,
          player.health + config.HEAL_AMOUNT.value,
        );
        createParticles(
          player.x + player.width / 2,
          player.y + player.height / 2,
          config.COLOR_HEAL.value,
        );
      }

      if (
        keys[burstKey] &&
        player.burstCooldown <= 0 &&
        player.shieldEnergy >= config.BURST_ENERGY_COST.value
      ) {
        player.shieldEnergy -= config.BURST_ENERGY_COST.value;
        player.burstCooldown = config.BURST_COOLDOWN.value;
        createParticles(
          player.x + player.width / 2,
          player.y + player.height / 2,
          config.COLOR_SHIELD.value,
        );
        const playerCenterX = player.x + player.width / 2;
        const otherCenterX = otherPlayer.x + otherPlayer.width / 2;
        const knockbackDir = otherCenterX > playerCenterX ? 1 : -1;
        const horizontalDist = Math.abs(otherCenterX - playerCenterX);
        const verticalOverlap =
          Math.abs(
            player.y +
              player.height / 2 -
              (otherPlayer.y + otherPlayer.height / 2),
          ) <
          (player.height + otherPlayer.height) / 2 -
            config.BURST_VERTICAL_TOLERANCE.value;

        if (horizontalDist < config.BURST_RANGE.value && verticalOverlap) {
          otherPlayer.x += knockbackDir * config.BURST_KNOCKBACK.value;
          otherPlayer.velocityX =
            knockbackDir * config.BURST_KNOCKBACK_SPEED.value;
          otherPlayer.stunFrames = 0;
          otherPlayer.health = Math.max(
            0,
            otherPlayer.health - config.BURST_DAMAGE.value,
          );
          createParticles(
            otherPlayer.x + otherPlayer.width / 2,
            otherPlayer.y + otherPlayer.height / 2,
            config.COLOR_SHIELD.value,
          );
        }
      }

      if (keys[defendKey] && player.shieldEnergy > 0) {
        player.isDefending = true;
        player.shieldEnergy -= config.SHIELD_ENERGY_DRAIN.value;
        if (player.shieldEnergy < 0) player.shieldEnergy = 0;
        if (player.shieldEnergy === 0) {
          player.shieldRegenDelay = config.SHIELD_REGEN_DELAY.value;
        }
      } else {
        player.isDefending = false;
        if (player.shieldEnergy < config.MAX_SHIELD_ENERGY.value) {
          if (player.shieldRegenDelay > 0) {
            player.shieldRegenDelay--;
          } else {
            player.shieldEnergy += config.SHIELD_ENERGY_REGEN.value;
            if (player.shieldEnergy > config.MAX_SHIELD_ENERGY.value)
              player.shieldEnergy = config.MAX_SHIELD_ENERGY.value;
          }
        }
      }
    }
  } else {
    player.velocityX *= config.FRICTION_NORMAL.value;
    player.isAttacking = false;
    player.isDefending = false;
  }

  if (gameState.value === "playing") {
    if (player.attackCooldown > 0) {
      player.attackCooldown--;
    }

    if (player.shotCooldown > 0) {
      player.shotCooldown--;
    }

    if (player.healCooldown > 0) {
      player.healCooldown--;
    }

    if (player.burstCooldown > 0) {
      player.burstCooldown--;
    }
  }

  player.velocityY += config.GRAVITY.value;
  player.x += player.velocityX;
  player.y += player.velocityY;

  if (player.x < 0) player.x = 0;
  if (player.x > config.WORLD_WIDTH.value - player.width)
    player.x = config.WORLD_WIDTH.value - player.width;

  if (player.y >= config.GROUND_Y.value) {
    player.y = config.GROUND_Y.value;
    player.velocityY = 0;
    player.isJumping = false;
  }

  checkPlayerCollision(player, otherPlayer);

  if (Math.abs(player.velocityX) > config.ANIM_SPEED_THRESHOLD.value) {
    player.animFrame = (player.animFrame + 0.2) % 4;
  }
};

const checkAttackCollision = (attacker, defender) => {
  if (!attacker.isAttacking || attacker.hasAttacked) return;

  const attackX = attacker.facingRight
    ? attacker.x + attacker.width
    : attacker.x - config.ATTACK_RANGE.value;

  const attackHitbox = {
    x: attackX,
    y: attacker.y,
    width: config.ATTACK_RANGE.value,
    height: attacker.height,
  };

  if (
    attackHitbox.x < defender.x + defender.width &&
    attackHitbox.x + attackHitbox.width > defender.x &&
    attackHitbox.y < defender.y + defender.height &&
    attackHitbox.y + attackHitbox.height > defender.y
  ) {
    attacker.hasAttacked = true;
    let damage = config.ATTACK_DAMAGE.value;
    if (defender.isDefending) {
      damage *= 1 - config.DEFENSE_REDUCTION.value;
      createParticles(
        defender.x + defender.width / 2,
        defender.y + defender.height / 2,
        config.COLOR_SHIELD.value,
      );
    } else {
      createParticles(
        defender.x + defender.width / 2,
        defender.y + defender.height / 2,
        attacker.color,
      );
      defender.stunFrames = config.ATTACK_STUN_DURATION.value;
    }
    defender.health = Math.max(0, defender.health - damage);
  }
};

const updateShots = () => {
  if (gameState.value !== "playing") return;
  for (let i = shots.length - 1; i >= 0; i--) {
    const shot = shots[i];
    shot.x += shot.velocityX;

    if (
      shot.x < -config.SHOT_BOUNDARY_MARGIN.value ||
      shot.x > config.WORLD_WIDTH.value + config.SHOT_BOUNDARY_MARGIN.value
    ) {
      shots.splice(i, 1);
      continue;
    }

    const target = shot.owner === "player1" ? player2.value : player1.value;

    if (
      shot.x < target.x + target.width &&
      shot.x + shot.width > target.x &&
      shot.y < target.y + target.height &&
      shot.y + shot.height > target.y
    ) {
      let damage = config.SHOT_DAMAGE.value;
      if (target.isDefending) {
        damage *= 1 - config.DEFENSE_REDUCTION.value;
      }
      target.health = Math.max(0, target.health - damage);

      const knockbackDir = shot.velocityX > 0 ? 1 : -1;
      target.x += knockbackDir * config.SHOT_KNOCKBACK.value;
      target.velocityX =
        knockbackDir *
        config.SHOT_KNOCKBACK.value *
        config.SHOT_KNOCKBACK_SPEED_RATIO.value;

      createParticles(
        target.x + target.width / 2,
        target.y + target.height / 2,
        shot.color,
      );

      shots.splice(i, 1);
    }
  }
};

const createParticles = (x, y, color) => {
  for (let i = 0; i < config.PARTICLE_COUNT.value; i++) {
    particles.push({
      x,
      y,
      velocityX: (Math.random() - 0.5) * config.PARTICLE_SPEED.value,
      velocityY: (Math.random() - 0.5) * config.PARTICLE_SPEED.value,
      size:
        Math.random() * config.PARTICLE_SIZE_MAX.value +
        config.PARTICLE_SIZE_MIN.value,
      color,
      life: config.PARTICLE_LIFETIME.value,
    });
  }
};

const updateParticles = () => {
  if (gameState.value !== "playing") return;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.velocityX;
    p.y += p.velocityY;
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
};

const spawnBomb = () => {
  const bombX =
    Math.random() * (config.WORLD_WIDTH.value - config.BOMB_SIZE.value);
  bombs.push({
    x: bombX,
    y: -config.BOMB_SIZE.value,
    size: config.BOMB_SIZE.value,
    velocityY: config.BOMB_FALL_SPEED.value,
  });
};

const updateBombs = () => {
  if (gameState.value !== "playing") return;
  if (!config.BOMB_ENABLED.value) return;

  bombSpawnTimer++;
  if (bombSpawnTimer >= config.BOMB_SPAWN_INTERVAL.value) {
    spawnBomb();
    bombSpawnTimer = 0;
  }

  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i];
    bomb.y += bomb.velocityY;

    const player1CenterX = player1.value.x + player1.value.width / 2;
    const player1CenterY = player1.value.y + player1.value.height / 2;
    const player2CenterX = player2.value.x + player2.value.width / 2;
    const player2CenterY = player2.value.y + player2.value.height / 2;
    const bombCenterX = bomb.x + bomb.size / 2;
    const bombCenterY = bomb.y + bomb.size / 2;

    let exploded = false;

    if (bomb.y >= config.GROUND_Y.value) {
      exploded = true;
    }

    const distToPlayer1 = Math.sqrt(
      Math.pow(bombCenterX - player1CenterX, 2) +
        Math.pow(bombCenterY - player1CenterY, 2),
    );
    if (distToPlayer1 < (bomb.size + player1.value.height) / 2) {
      exploded = true;
    }

    const distToPlayer2 = Math.sqrt(
      Math.pow(bombCenterX - player2CenterX, 2) +
        Math.pow(bombCenterY - player2CenterY, 2),
    );
    if (distToPlayer2 < (bomb.size + player2.value.height) / 2) {
      exploded = true;
    }

    if (exploded) {
      explodeBomb(bomb, player1.value, player2.value);
      bombs.splice(i, 1);
    }
  }
};

const explodeBomb = (bomb, p1, p2) => {
  createParticles(
    bomb.x + bomb.size / 2,
    bomb.y + bomb.size / 2,
    config.BOMB_HIGHLIGHT_COLOR.value,
  );
  createParticles(
    bomb.x + bomb.size / 2,
    bomb.y + bomb.size / 2,
    config.BOMB_FUSE_COLOR.value,
  );

  const bombCenterX = bomb.x + bomb.size / 2;
  const bombCenterY = bomb.y + bomb.size / 2;

  const applyBombDamage = (player) => {
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const dist = Math.sqrt(
      Math.pow(bombCenterX - playerCenterX, 2) +
        Math.pow(bombCenterY - playerCenterY, 2),
    );

    if (dist <= config.BOMB_EXPLOSION_RADIUS.value) {
      let damage = config.BOMB_DAMAGE.value;
      if (player.isDefending) {
        damage *= 1 - config.DEFENSE_REDUCTION.value;
      }
      player.health = Math.max(0, player.health - damage);

      const knockbackDir = playerCenterX > bombCenterX ? 1 : -1;
      const knockbackRatio = 1 - dist / config.BOMB_EXPLOSION_RADIUS.value;
      player.x += knockbackDir * config.BOMB_KNOCKBACK.value * knockbackRatio;
      player.velocityX =
        knockbackDir *
        config.BOMB_KNOCKBACK.value *
        config.BOMB_KNOCKBACK_SPEED_RATIO.value *
        knockbackRatio;
    }
  };

  applyBombDamage(p1);
  applyBombDamage(p2);
};

const drawBombs = () => {
  for (const bomb of bombs) {
    const screenX = bomb.x - cameraOffset.value;

    ctx.fillStyle = config.BOMB_BODY_COLOR.value;
    ctx.beginPath();
    ctx.arc(
      screenX + bomb.size / 2,
      bomb.y + bomb.size / 2,
      bomb.size / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = config.BOMB_HIGHLIGHT_COLOR.value;
    ctx.beginPath();
    ctx.arc(
      screenX + bomb.size / 2,
      bomb.y + bomb.size / 2,
      bomb.size / 4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.strokeStyle = config.BOMB_FUSE_COLOR.value;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screenX + bomb.size / 2, bomb.y);
    ctx.lineTo(screenX + bomb.size / 2, bomb.y - config.BOMB_FUSE_LENGTH.value);
    ctx.stroke();
  }
};

const spawnPowerup = () => {
  const availableTypes = [];
  if (config.POWERUP_HEAL_ENABLED.value) availableTypes.push("health");
  if (config.POWERUP_ENERGY_ENABLED.value) availableTypes.push("energy");
  if (config.POWERUP_SPEED_ENABLED.value) availableTypes.push("speed");

  if (availableTypes.length === 0) return;

  for (const type of availableTypes) {
    const existingType = powerups.find((p) => p.type === type);
    if (existingType) continue;

    const lifetime = getPowerupLifetime(type);
    if (lifetime === 0) continue;

    const powerupX =
      Math.random() * (config.WORLD_WIDTH.value - config.POWERUP_SIZE.value);
    powerups.push({
      x: powerupX,
      y: config.GROUND_Y.value - config.POWERUP_SIZE.value,
      size: config.POWERUP_SIZE.value,
      type: type,
      pulsePhase: Math.random() * Math.PI * 2,
      lifetime: lifetime,
      spawnTime: Date.now(),
    });
    break;
  }
};

const getPowerupLifetime = (type) => {
  switch (type) {
    case "health":
      return config.POWERUP_HEAL_LIFETIME.value;
    case "energy":
      return config.POWERUP_ENERGY_LIFETIME.value;
    case "speed":
      return config.POWERUP_SPEED_LIFETIME.value;
    default:
      return 600;
  }
};

const updatePowerups = () => {
  if (gameState.value !== "playing") return;

  powerupSpawnTimer++;
  if (powerupSpawnTimer >= config.POWERUP_SPAWN_INTERVAL.value) {
    spawnPowerup();
    powerupSpawnTimer = 0;
  }

  for (let i = powerups.length - 1; i >= 0; i--) {
    const powerup = powerups[i];
    powerup.pulsePhase += 0.1;

    if (powerup.lifetime > 0) {
      const elapsed = (Date.now() - powerup.spawnTime) / (1000 / 60);
      if (elapsed >= powerup.lifetime) {
        powerups.splice(i, 1);
        continue;
      }
    }

    const player1CenterX = player1.value.x + player1.value.width / 2;
    const player1CenterY = player1.value.y + player1.value.height / 2;
    const player2CenterX = player2.value.x + player2.value.width / 2;
    const player2CenterY = player2.value.y + player2.value.height / 2;
    const powerupCenterX = powerup.x + powerup.size / 2;
    const powerupCenterY = powerup.y + powerup.size / 2;

    const distToPlayer1 = Math.sqrt(
      Math.pow(powerupCenterX - player1CenterX, 2) +
        Math.pow(powerupCenterY - player1CenterY, 2),
    );
    const distToPlayer2 = Math.sqrt(
      Math.pow(powerupCenterX - player2CenterX, 2) +
        Math.pow(powerupCenterY - player2CenterY, 2),
    );

    if (distToPlayer1 < (powerup.size + player1.value.height) / 2) {
      applyPowerup(player1.value, powerup.type);
      powerups.splice(i, 1);
    } else if (distToPlayer2 < (powerup.size + player2.value.height) / 2) {
      applyPowerup(player2.value, powerup.type);
      powerups.splice(i, 1);
    }
  }
};

const applyPowerup = (player, type) => {
  switch (type) {
    case "health":
      player.health = Math.min(
        config.MAX_HEALTH.value,
        player.health + config.POWERUP_HEAL_AMOUNT.value,
      );
      createParticles(
        player.x + player.width / 2,
        player.y + player.height / 2,
        config.COLOR_HEAL.value,
      );
      break;
    case "energy":
      player.shieldEnergy = Math.min(
        config.MAX_SHIELD_ENERGY.value,
        player.shieldEnergy + config.POWERUP_ENERGY_AMOUNT.value,
      );
      createParticles(
        player.x + player.width / 2,
        player.y + player.height / 2,
        config.COLOR_PLAYER2.value,
      );
      break;
    case "speed":
      player.speedBoostFrames = config.POWERUP_SPEED_DURATION.value;
      createParticles(
        player.x + player.width / 2,
        player.y + player.height / 2,
        config.COLOR_SHIELD.value,
      );
      break;
  }
};

const drawPowerups = () => {
  for (const powerup of powerups) {
    const screenX = powerup.x - cameraOffset.value;
    const pulse = Math.sin(powerup.pulsePhase) * 2;
    const size = powerup.size + pulse;

    ctx.fillStyle = getPowerupColor(powerup.type);
    ctx.beginPath();
    ctx.arc(
      screenX + powerup.size / 2,
      powerup.y + powerup.size / 2,
      size / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = config.COLOR_TEXT.value;
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      getPowerupIcon(powerup.type),
      screenX + powerup.size / 2,
      powerup.y + powerup.size / 2 + 4,
    );
  }
};

const getPowerupColor = (type) => {
  switch (type) {
    case "health":
      return config.COLOR_HEAL.value;
    case "energy":
      return config.COLOR_PLAYER2.value;
    case "speed":
      return config.COLOR_SHIELD.value;
    default:
      return config.COLOR_TEXT.value;
  }
};

const getPowerupIcon = (type) => {
  switch (type) {
    case "health":
      return "+";
    case "energy":
      return "⚡";
    case "speed":
      return "▶";
    default:
      return "?";
  }
};

const drawBackground = () => {
  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    config.CANVAS_HEIGHT.value,
  );
  gradient.addColorStop(0, config.COLOR_BG_TOP.value);
  gradient.addColorStop(1, config.COLOR_BG_BOTTOM.value);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, config.CANVAS_WIDTH.value, config.CANVAS_HEIGHT.value);

  ctx.fillStyle = config.COLOR_TEXT.value;
  for (let i = 0; i < 50; i++) {
    const x = (i * 137 - cameraOffset.value * 0.5) % config.CANVAS_WIDTH.value;
    const y = (i * 73) % 200;
    const size = (i % 3) + 1;
    ctx.fillRect(x, y, size, size);
  }

  ctx.fillStyle = config.COLOR_GROUND.value;
  ctx.fillRect(
    0 - cameraOffset.value,
    config.GROUND_Y.value + 80,
    config.WORLD_WIDTH.value,
    70,
  );

  ctx.fillStyle = config.COLOR_GROUND_LINE.value;
  for (let i = 0; i < config.WORLD_WIDTH.value / 40; i++) {
    ctx.fillRect(
      i * 40 - cameraOffset.value,
      config.GROUND_Y.value + 80,
      2,
      70,
    );
  }
};

const drawPlayer = (player) => {
  const px = Math.floor(player.x - cameraOffset.value);
  const py = Math.floor(player.y);
  const color = player.color;

  ctx.save();

  if (!player.facingRight) {
    ctx.translate(px + player.width, py);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(px, py);
  }

  if (player.isDefending) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = config.COLOR_SHIELD.value;
    ctx.fillRect(-5, -5, player.width + 10, player.height + 10);
    ctx.globalAlpha = 1;
  }

  if (player.stunFrames > 0) {
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
    ctx.fillStyle = config.COLOR_STUN.value;
    ctx.fillRect(-5, -5, player.width + 10, player.height + 10);
    ctx.globalAlpha = 1;
  }

  const legOffset = Math.sin(player.animFrame * Math.PI) * 4;

  ctx.fillStyle = shadeColor(color, -20);
  ctx.fillRect(10, 50 + legOffset, 12, 30);
  ctx.fillRect(38, 50 - legOffset, 12, 30);

  ctx.fillStyle = shadeColor(color, -10);
  ctx.fillRect(8, 72 + legOffset, 16, 8);
  ctx.fillRect(36, 72 - legOffset, 16, 8);

  ctx.fillStyle = color;
  ctx.fillRect(8, 20, 44, 35);

  ctx.fillStyle = shadeColor(color, -30);
  ctx.fillRect(12, 24, 36, 2);
  ctx.fillRect(12, 35, 36, 2);
  ctx.fillRect(12, 46, 36, 2);

  ctx.fillStyle = shadeColor(color, 20);
  ctx.fillRect(18, 2, 24, 20);

  ctx.fillStyle = config.COLOR_EYES.value;
  ctx.fillRect(26, 8, 10, 6);

  if (player.isAttacking) {
    ctx.fillStyle = shadeColor(color, 30);
    ctx.fillRect(48, 25, 30, 8);
    ctx.fillStyle = config.COLOR_TEXT.value;
    ctx.fillRect(78, 22, 8, 14);
  } else {
    ctx.fillStyle = shadeColor(color, 10);
    ctx.fillRect(48, 25, 12, 8);
    ctx.fillRect(0, 25, 12, 8);
  }

  ctx.fillStyle = shadeColor(color, -40);
  ctx.fillRect(4, 22, 6, 30);
  ctx.fillRect(50, 22, 6, 30);

  ctx.restore();

  if (player.speedBoostFrames > 0) {
    const centerX = px + player.width / 2;
    const topY = py - 15;

    ctx.fillStyle = config.COLOR_SHIELD.value;
    ctx.beginPath();
    ctx.arc(centerX, topY, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = config.COLOR_TEXT.value;
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText("▶", centerX, topY + 5);

    const progressWidth = 24;
    const progressHeight = 3;
    const progress =
      player.speedBoostFrames / config.POWERUP_SPEED_DURATION.value;

    ctx.fillStyle = config.COLOR_BAR_BG.value;
    ctx.fillRect(
      centerX - progressWidth / 2,
      topY + 18,
      progressWidth,
      progressHeight,
    );

    ctx.fillStyle = config.COLOR_SHIELD.value;
    ctx.fillRect(
      centerX - progressWidth / 2,
      topY + 18,
      progressWidth * progress,
      progressHeight,
    );
  }
};

const drawShots = () => {
  for (const shot of shots) {
    const screenX = shot.x - cameraOffset.value;
    ctx.fillStyle = shot.color;
    ctx.fillRect(screenX, shot.y, shot.width, shot.height);

    ctx.fillStyle = config.COLOR_TEXT.value;
    ctx.fillRect(
      screenX + (shot.velocityX > 0 ? shot.width - 5 : 0),
      shot.y + 2,
      5,
      shot.height - 4,
    );
  }
};

const shadeColor = (color, percent) => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

const drawParticles = () => {
  for (const p of particles) {
    ctx.globalAlpha = p.life / config.PARTICLE_LIFETIME.value;
    ctx.fillStyle = p.color;
    ctx.fillRect(
      Math.floor(p.x - cameraOffset.value),
      Math.floor(p.y),
      p.size,
      p.size,
    );
  }
  ctx.globalAlpha = 1;
};

const drawUI = () => {
  drawHealthBar(
    30,
    20,
    player1.value.health.toFixed(2),
    config.COLOR_PLAYER1.value,
    "P1",
  );
  drawHealthBar(
    config.CANVAS_WIDTH.value - 230,
    20,
    player2.value.health.toFixed(2),
    config.COLOR_PLAYER2.value,
    "P2",
  );
  drawShieldBar(
    30,
    55,
    player1.value.shieldEnergy.toFixed(2),
    config.COLOR_HEAL.value,
    "P1",
  );
  drawShieldBar(
    config.CANVAS_WIDTH.value - 230,
    55,
    player2.value.shieldEnergy.toFixed(2),
    config.COLOR_HEAL.value,
    "P2",
  );

  drawSkillCooldown(
    30,
    90,
    player1.value.attackCooldown,
    config.ATTACK_COOLDOWN.value,
    "J",
    config.COLOR_PLAYER1.value,
  );
  drawSkillCooldown(
    70,
    90,
    player1.value.shotCooldown,
    config.SHOT_COOLDOWN.value,
    "L",
    config.COLOR_PLAYER1.value,
  );
  drawSkillCooldown(
    110,
    90,
    player1.value.healCooldown,
    config.HEAL_COOLDOWN.value,
    "I",
    config.COLOR_PLAYER1.value,
  );
  drawSkillCooldown(
    150,
    90,
    player1.value.burstCooldown,
    config.BURST_COOLDOWN.value,
    "O",
    config.COLOR_PLAYER1.value,
  );

  drawSkillCooldown(
    config.CANVAS_WIDTH.value - 190,
    90,
    player2.value.attackCooldown,
    config.ATTACK_COOLDOWN.value,
    "1",
    config.COLOR_PLAYER2.value,
  );
  drawSkillCooldown(
    config.CANVAS_WIDTH.value - 150,
    90,
    player2.value.shotCooldown,
    config.SHOT_COOLDOWN.value,
    "3",
    config.COLOR_PLAYER2.value,
  );
  drawSkillCooldown(
    config.CANVAS_WIDTH.value - 110,
    90,
    player2.value.healCooldown,
    config.HEAL_COOLDOWN.value,
    "4",
    config.COLOR_PLAYER2.value,
  );
  drawSkillCooldown(
    config.CANVAS_WIDTH.value - 70,
    90,
    player2.value.burstCooldown,
    config.BURST_COOLDOWN.value,
    "5",
    config.COLOR_PLAYER2.value,
  );
};

const drawHealthBar = (x, y, health, color, label) => {
  ctx.fillStyle = config.COLOR_BAR_BG.value;
  ctx.fillRect(x, y, 200, 30);

  const healthWidth = (health / 100) * 196;
  ctx.fillStyle = health > 30 ? color : config.COLOR_STUN.value;
  ctx.fillRect(x + 2, y + 2, healthWidth, 26);

  ctx.fillStyle = config.COLOR_TEXT.value;
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "left";
  ctx.fillText(label, x + 8, y + 20);
  ctx.textAlign = "right";
  ctx.fillText(health, x + 192, y + 20);
};

const drawShieldBar = (x, y, energy, color, label) => {
  ctx.fillStyle = config.COLOR_BAR_BG.value;
  ctx.fillRect(x, y, 200, 20);

  const energyWidth = (energy / 100) * 196;
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + 2, energyWidth, 16);

  ctx.fillStyle = config.COLOR_TEXT.value;
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "left";
  ctx.fillText("🛡️", x + 5, y + 15);
  ctx.textAlign = "right";
  ctx.fillText(Math.floor(energy), x + 192, y + 15);
};

const drawSkillCooldown = (x, y, currentCooldown, maxCooldown, key, color) => {
  const radius = 16;
  const centerX = x + radius;
  const centerY = y + radius;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = config.COLOR_COOLDOWN_BORDER.value;
  ctx.lineWidth = 3;
  ctx.stroke();

  if (currentCooldown > 0) {
    const progress = 1 - currentCooldown / maxCooldown;
    const startAngle = -Math.PI / 2;
    const endAngle = -Math.PI / 2 + progress * Math.PI * 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
    ctx.fillStyle = config.COLOR_COOLDOWN_FILL.value;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius - 2, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = "rgba(100,100,100,0.7)";
    ctx.fill();

    ctx.fillStyle = config.COLOR_TEXT.value;
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    const seconds = (currentCooldown / 60).toFixed(2);
    ctx.fillText(seconds, centerX, centerY + 4);
  } else {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.fillStyle = config.COLOR_TEXT.value;
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(key, centerX, centerY + 4);
  }
};

const checkGameOver = () => {
  if (player1.value.health <= 0 || player2.value.health <= 0) {
    gameState.value = "gameOver";
    if (player1.value.health <= 0 && player2.value.health <= 0) {
      winner.value = null;
    } else if (player1.value.health <= 0) {
      winner.value = "player2";
    } else {
      winner.value = "player1";
    }

    player1.value.stunFrames = 0;
    player1.value.isAttacking = false;
    player1.value.isDefending = false;
    player2.value.stunFrames = 0;
    player2.value.isAttacking = false;
    player2.value.isDefending = false;

    shots.length = 0;
    particles.length = 0;
  }
};

const updateCamera = () => {
  const minX = Math.min(player1.value.x, player2.value.x);
  const maxX = Math.max(player1.value.x, player2.value.x);
  const centerX = (minX + maxX) / 2;
  const targetOffset = centerX - config.CANVAS_WIDTH.value / 2;
  cameraOffset.value = Math.max(
    0,
    Math.min(
      targetOffset,
      config.WORLD_WIDTH.value - config.CANVAS_WIDTH.value,
    ),
  );
};

const gameLoop = () => {
  if (gameState.value === "playing") {
    updatePlayer(
      player1.value,
      player2.value,
      "KeyA",
      "KeyD",
      "KeyW",
      "KeyJ",
      "KeyK",
      "KeyL",
      "KeyI",
      "KeyO",
    );
    updatePlayer(
      player2.value,
      player1.value,
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "Numpad1",
      "Numpad2",
      "Numpad3",
      "Numpad4",
      "Numpad5",
    );

    checkAttackCollision(player1.value, player2.value);
    checkAttackCollision(player2.value, player1.value);

    updateShots();
    updateBombs();
    updatePowerups();
    updateParticles();

    checkGameOver();
  }

  updateCamera();

  ctx.clearRect(0, 0, config.CANVAS_WIDTH.value, config.CANVAS_HEIGHT.value);
  drawBackground();
  drawPlayer(player1.value);
  drawPlayer(player2.value);
  drawShots();
  drawBombs();
  drawPowerups();
  drawParticles();
  drawUI();

  animationId = requestAnimationFrame(gameLoop);
};
</script>

<style scoped lang="scss">
.battle-wrap {
  padding: 20px;
  height: calc(100vh - 40px);
  width: calc(100vw - 40px);
  overflow: auto;
  background: #0a0a0f;

  canvas {
    border: 2px solid #444;
    background-color: #1a1a2e;
    display: block;
    image-rendering: pixelated;
  }
  .controls-panel-wrap {
    padding: 20px;
    border: 2px solid #444;
    font-size: 12px;
    color: #ccc;
    display: grid;
    grid-template-columns: 1fr 1fr;
    flex-shrink: 0;
    gap: 20px;
    overflow: auto;
    flex: 1;
    .controls-panel {
      padding: 20px;
      border: 2px solid #444;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      gap: 5px;
      input {
        width: 80px;
        background-color: #1a1a2e;
        color: #ccc;
        -moz-appearance: textfield;
        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      }
    }
  }

  .result-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #0a0a0f;
    padding: 20px;
    border: 2px solid #444;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
}
</style>
