<template>
  <div class="game-main" ref="containerRef">
    <canvas ref="canvasRef"></canvas>

    <HudPanel
      :hud="hud"
      :keybinds="game.keybinds.value"
      :keybind-label-of="game.keybindLabelOf"
      @use-skill="onUseSkill"
      @toggle-auto="onToggleAuto"
      @cycle-attack="onCycleAttack"
      @open-keybinds="openKeybindPanel"
      @use-relic="onUseRelic"
      @drop-relic="onDropRelic"
      @discard-treasure="onDiscardTreasure"
    />

    <div class="notice-layer">
      <div
        v-for="notice in notices"
        :key="notice.id"
        class="notice"
        :style="{ color: notice.color, borderColor: notice.color }"
      >
        {{ notice.text }}
      </div>
    </div>

    <SkillSelectPanel v-if="skillChoices && skillChoices.length" :choices="skillChoices" @choose="onChooseSkill" />

    <EncounterPanel
      v-if="encounter || encounterResult"
      :encounter="encounter"
      :result="encounterResult"
      @choose="onChooseEncounter"
      @close="onCloseEncounter"
    />

    <div v-if="status === 'dead'" class="overlay">
      <div class="result">
        <div v-if="nightmare" class="result-mode">噩梦模式</div>
        <div class="result-title">力竭而亡</div>
        <div class="result-sub">被 {{ gameOver.deathCause }} 击败</div>
        <div class="result-grid">
          <div class="result-cell">
            <span class="cell-label">抵达境界</span>
            <span class="cell-value">{{ gameOver.level }} 级</span>
          </div>
          <div class="result-cell">
            <span class="cell-label">吞噬击杀</span>
            <span class="cell-value">{{ gameOver.kills }} 人</span>
          </div>
          <div class="result-cell">
            <span class="cell-label">存活时间</span>
            <span class="cell-value">{{ formatTime(gameOver.playTime) }}</span>
          </div>
          <div class="result-cell">
            <span class="cell-label">枭雄伏诛</span>
            <span class="cell-value">{{ gameOver.bossKills }} 位</span>
          </div>
        </div>
        <div class="result-skills">
          <span v-if="!gameOver.learnedSkills.length" class="skill-none">未习得任何秘籍</span>
          <span v-for="skill in gameOver.learnedSkills" :key="skill.name" class="skill-tag">
            {{ skill.name }} ×{{ skill.stack }}
          </span>
        </div>
        <div class="result-actions">
          <button class="btn" @click="onRestartGame">再来一局</button>
          <button class="btn btn--ghost" @click="$emit('restart')">返回首页</button>
        </div>
      </div>
    </div>

    <div class="control-hint">
      <span>WASD / 方向键 移动</span>
      <span>鼠标瞄准 · 左键或 J 普攻</span>
      <span>空格 / 右键 闪避</span>
      <span>1-9 释放武功 · F 自动战斗（技能 + 普攻） · G 切换普攻（近战/远程/自动）</span>
      <span>按住 J 普攻 · 空格冲刺 · V 施救倒地同伴 · 按住 T 传功回血</span>
      <span>Q 屠龙刀 · E 倚天剑 · R 弃神兵</span>
      <span>走近奇遇光环 · 1 / 2 / 3 抉择</span>
      <span>` 打开调试台（秘籍 / 状态 / 敌人 / 神兵 / 奇遇）</span>
    </div>

    <DebugPanel
      v-if="debugVisible"
      :world="worldRef"
      :hud="hud"
      @close="debugVisible = false"
      @toggle-auto="onToggleAuto"
    />

    <KeybindPanel
      v-if="keybindPanelVisible"
      :skills="hud.activeSkills"
      :keybinds="game.keybinds.value"
      :awaiting="awaitingKeybind"
      :display-of="game.keybindLabelOf"
      @close="keybindPanelVisible = false; awaitingKeybind = ''"
      @await="onAwaitKeybind"
      @clear="game.clearKeybind"
      @reset="game.resetKeybinds"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import DebugPanel from './DebugPanel.vue';
import EncounterPanel from './EncounterPanel.vue';
import HudPanel from './HudPanel.vue';
import KeybindPanel from './KeybindPanel.vue';
import SkillSelectPanel from './SkillSelectPanel.vue';
import { useBroMelee } from '../composables/useBroMelee.js';
import { render } from '../draw/renderer.js';
import { formatTime } from '../core/utils.js';

defineEmits(['restart']);

const props = defineProps({
  mode: {
    type: String,
    default: 'normal',
  },
});

const game = useBroMelee();
game.setMode(props.mode);
const nightmare = computed(() => props.mode === 'nightmare');
const { hud, skillChoices, notices, gameOver, status, encounter, encounterResult } = game;
const worldRef = game.world;

const containerRef = ref(null);
const canvasRef = ref(null);
const debugVisible = ref(false);
const keybindPanelVisible = ref(false);
const awaitingKeybind = ref('');

const openKeybindPanel = () => {
  awaitingKeybind.value = '';
  keybindPanelVisible.value = true;
};

const onAwaitKeybind = (skillId) => {
  awaitingKeybind.value = skillId;
};

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];
const pressedKeys = new Set();
const pointer = { x: 0, y: 0, inside: false };

let context = null;
let animationId = null;
let resizeObserver = null;
let viewWidth = 800;
let viewHeight = 600;
let pixelRatio = 1;
let lastTimestamp = 0;
let attackKeyHeld = false;

const resizeCanvas = () => {
  const container = containerRef.value;
  if (!container || !canvasRef.value) {
    return;
  }
  const rect = container.getBoundingClientRect();
  pixelRatio = Math.min(2, window.devicePixelRatio || 1);
  viewWidth = Math.max(320, rect.width);
  viewHeight = Math.max(240, rect.height);
  canvasRef.value.width = Math.round(viewWidth * pixelRatio);
  canvasRef.value.height = Math.round(viewHeight * pixelRatio);
  canvasRef.value.style.width = `${viewWidth}px`;
  canvasRef.value.style.height = `${viewHeight}px`;
  context = canvasRef.value.getContext('2d');
  game.setViewSize(viewWidth, viewHeight);
};

/** 指针位置换算成世界坐标，交给引擎做瞄准 */
const syncAim = () => {
  const world = game.world.value;
  if (!world) {
    return;
  }
  const camera = world.camera;
  world.setAim(camera.x + pointer.x - viewWidth / 2, camera.y + pointer.y - viewHeight / 2);
};

/** 键盘状态换算成归一化方向 */
const syncMovement = () => {
  let axisX = 0;
  let axisY = 0;
  if (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft')) {
    axisX -= 1;
  }
  if (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight')) {
    axisX += 1;
  }
  if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp')) {
    axisY -= 1;
  }
  if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown')) {
    axisY += 1;
  }
  const length = Math.hypot(axisX, axisY);
  if (length > 1) {
    axisX /= length;
    axisY /= length;
  }
  game.setMoveInput(axisX, axisY);
};

const isTypingTarget = (target) => {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || target.isContentEditable;
};

const onUseSkill = (skillId) => {
  game.useSkill(skillId);
};

const onToggleAuto = () => {
  game.toggleAutoCast();
};

const onCycleAttack = () => {
  game.cycleAttackMode();
};

const onUseRelic = (relicId) => {
  game.useRelic(relicId);
};

const onDropRelic = (relicId) => {
  game.dropRelic(relicId);
};

const onChooseSkill = (skillId) => {
  game.chooseSkill(skillId);
};

const onChooseEncounter = (choiceId) => {
  game.chooseEncounter(choiceId);
};

const onCloseEncounter = () => {
  game.closeEncounterResult();
};

const onDiscardTreasure = (treasureId) => {
  game.discardTreasure(treasureId);
};

const onRestartGame = () => {
  pressedKeys.clear();
  game.start();
};

const handleKeyDown = (event) => {
  if (isTypingTarget(event.target)) {
    return;
  }
  // 反引号永远代表调试台开关：点过面板按钮后焦点停在按钮上也能关掉
  if (event.code === 'Backquote') {
    event.preventDefault();
    debugVisible.value = !debugVisible.value;
    return;
  }
  // 正在改键：下一个按键直接成为该秘籍的新键位
  if (awaitingKeybind.value) {
    event.preventDefault();
    if (event.code !== 'Escape') {
      game.setKeybind(awaitingKeybind.value, event.code);
    }
    awaitingKeybind.value = '';
    return;
  }
  if (keybindPanelVisible.value) {
    if (event.code === 'Escape') {
      keybindPanelVisible.value = false;
    }
    return;
  }
  if (debugVisible.value && event.target && event.target.tagName === 'BUTTON') {
    return;
  }
  if (encounterResult.value) {
    if (event.code === 'Space' || event.code === 'Enter' || event.code === 'NumpadEnter') {
      event.preventDefault();
      if (!event.repeat) {
        game.closeEncounterResult();
      }
    }
    return;
  }
  if (encounter.value) {
    if (event.code === 'Escape') {
      event.preventDefault();
      if (!event.repeat) {
        game.chooseEncounter('leave');
      }
      return;
    }
    const slotMatch = /^(?:Digit|Numpad)([1-9])$/.exec(event.code);
    if (slotMatch) {
      const choice = encounter.value.choices[Number(slotMatch[1]) - 1];
      if (choice) {
        event.preventDefault();
        if (!event.repeat) {
          game.chooseEncounter(choice.id);
        }
      }
    }
    return;
  }
  if (MOVE_KEYS.includes(event.code)) {
    event.preventDefault();
    pressedKeys.add(event.code);
    return;
  }
  if (event.code === 'Space') {
    event.preventDefault();
    if (!event.repeat) {
      game.dash();
    }
    return;
  }
  if (event.code === 'KeyJ') {
    event.preventDefault();
    attackKeyHeld = true;
    game.setAttackHeld(true);
    return;
  }
  if (event.code === 'KeyF') {
    event.preventDefault();
    if (!event.repeat) {
      game.toggleAutoCast();
    }
    return;
  }
  if (event.code === 'KeyQ') {
    event.preventDefault();
    if (!event.repeat) {
      game.useRelic('dragonSaber');
    }
    return;
  }
  if (event.code === 'KeyE') {
    event.preventDefault();
    if (!event.repeat) {
      game.useRelic('heavenSword');
    }
    return;
  }
  if (event.code === 'KeyR') {
    event.preventDefault();
    if (!event.repeat) {
      game.dropRelic();
    }
    return;
  }
  if (event.code === 'KeyG') {
    event.preventDefault();
    if (!event.repeat) {
      game.cycleAttackMode();
    }
    return;
  }
  if (event.code === 'KeyV') {
    event.preventDefault();
    if (!event.repeat) {
      game.startRevive();
    }
    return;
  }
  if (event.code === 'KeyT') {
    event.preventDefault();
    if (!event.repeat) {
      game.startTransfer();
    }
    return;
  }
  // 自定义键位优先：绑过的秘籍直接放
  const boundSkillId = game.keybindByCode.value[event.code];
  if (boundSkillId) {
    const boundSkill = hud.value.activeSkills.find((skill) => skill.id === boundSkillId);
    if (boundSkill) {
      event.preventDefault();
      game.useSkill(boundSkillId);
      return;
    }
  }
  const digitMatch = /^(?:Digit|Numpad)([1-9])$/.exec(event.code);
  if (digitMatch) {
    const slotIndex = Number(digitMatch[1]) - 1;
    const skill = hud.value.activeSkills[slotIndex];
    if (skill) {
      event.preventDefault();
      game.useSkill(skill.id);
    }
  }
};

const handleKeyUp = (event) => {
  pressedKeys.delete(event.code);
  if (event.code === 'KeyJ') {
    attackKeyHeld = false;
    game.setAttackHeld(false);
  }
  // 传功是按住持续的过程：松开 T 即收功
  if (event.code === 'KeyT' && game.world.value.transfer) {
    game.world.value.startTransfer();
  }
};

const handleMouseMove = (event) => {
  const rect = canvasRef.value.getBoundingClientRect();
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
  pointer.inside = true;
};

const handleMouseLeave = () => {
  pointer.inside = false;
};

const handleMouseDown = (event) => {
  if (event.button === 0) {
    game.setAttackHeld(true);
    return;
  }
  if (event.button === 2) {
    event.preventDefault();
    game.dash();
  }
};

const handleMouseUp = (event) => {
  if (event.button === 0 && !attackKeyHeld) {
    game.setAttackHeld(false);
  }
};

const handleContextMenu = (event) => {
  event.preventDefault();
};

const handleBlur = () => {
  pressedKeys.clear();
  attackKeyHeld = false;
  game.setAttackHeld(false);
  game.setMoveInput(0, 0);
};

onMounted(() => {
  nextTick(() => {
    resizeCanvas();
    game.start();
    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(containerRef.value);

    const canvas = canvasRef.value;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    const loop = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }
      const deltaTime = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;
      syncMovement();
      if (pointer.inside) {
        syncAim();
      }
      game.update(deltaTime);
      render(context, game.world.value, viewWidth, viewHeight, pixelRatio, pointer);
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);
  });
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseleave', handleMouseLeave);
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('contextmenu', handleContextMenu);
  }
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('blur', handleBlur);
});
</script>

<style scoped lang="scss">
.game-main {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #12150f;
  cursor: crosshair;
}

canvas {
  display: block;
}

.notice-layer {
  position: absolute;
  top: 88px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}

.notice {
  padding: 5px 16px;
  font-size: 12px;
  letter-spacing: 1px;
  background: rgba(10, 12, 9, 0.82);
  border-left: 2px solid;
  animation: notice-in 0.24s ease-out;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

@keyframes notice-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 6, 4, 0.74);
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.result {
  width: 460px;
  padding: 30px 34px;
  text-align: center;
  background: linear-gradient(160deg, rgba(24, 26, 19, 0.96), rgba(12, 14, 10, 0.98));
  border: 1px solid rgba(198, 168, 108, 0.42);
}

.result-mode {
  font-size: 11px;
  letter-spacing: 6px;
  color: rgba(255, 138, 122, 0.85);
  margin-bottom: 6px;
}

.result-title {
  font-size: 26px;
  letter-spacing: 8px;
  color: #ff9b8a;
}

.result-sub {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(244, 236, 216, 0.55);
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 22px 0 16px;
}

.result-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(198, 168, 108, 0.18);
}

.cell-label {
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(198, 168, 108, 0.7);
}

.cell-value {
  font-size: 19px;
  font-weight: bold;
  color: #ffe9b8;
}

.result-skills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  min-height: 26px;
  margin-bottom: 22px;
}

.skill-tag {
  padding: 3px 10px;
  font-size: 11px;
  color: #8fd0ff;
  border: 1px solid rgba(143, 208, 255, 0.35);
  border-radius: 2px;
}

.skill-none {
  font-size: 12px;
  color: rgba(244, 236, 216, 0.35);
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn {
  padding: 9px 26px;
  font-size: 14px;
  letter-spacing: 2px;
  color: #1a1508;
  background: #ffd166;
  border: none;
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    background: #ffe09a;
  }
}

.btn--ghost {
  color: rgba(244, 236, 216, 0.8);
  background: transparent;
  border: 1px solid rgba(198, 168, 108, 0.5);

  &:hover {
    background: rgba(198, 168, 108, 0.12);
  }
}

.control-hint {
  position: absolute;
  left: 18px;
  bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 11px;
  color: rgba(244, 236, 216, 0.28);
  pointer-events: none;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}
</style>
