<template>
  <div class="roguelike-game" ref="gameRoot" @mousemove="onMouseMove"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp">
    <!-- 地图渲染区 -->
    <GameCanvas
      ref="gameCanvasRef"
      :camera="camera"
    />

    <!-- HUD 界面层 -->
    <div class="hud" >
      <!-- 玩家状态面板 -->
      <PlayerStatusPanel
        :player="player"
        :max-hp="player.maxHp"
        :hp-percent="hpPercent"
        :exp-percent="expPercent"
        :next-level-exp="nextLevelExp"
        :game-time="gameState.gameTime"
        :kill-count="gameState.killCount"
        :format-time="formatTime"
      />
    <!-- 操作按钮栏（技能） -->
    <ActionBar
      :skills="skillSlots"
      @skill-click="onSkillClick"
    />
      <!-- 敌人列表 -->
      <EnemyList :enemies="enemies" />
      <!-- 战斗日志 -->
      <BattleLog :log="battleLog" />
    </div>

    <!-- 升级选择面板 -->
    <LevelUpPanel
      v-if="gameState.levelUpPending"
      :player="player"
      :options="levelUpOptions"
      @choice="onLevelUpChoice"
    />

    <!-- 死亡界面 -->
    <DeathPanel
      v-if="gameState.isDead"
      :game-time="gameState.gameTime"
      :kill-count="gameState.killCount"
      :player-level="player.level"
      :format-time="formatTime"
      @restart="restartGame"
    />

    <!-- 调试面板开关（右下角浮动按钮） -->
    <button class="debug-toggle-btn" @click="toggleDebug" :title="debugOpen ? '关闭调试面板' : '打开调试面板 (~ 键)'">
      {{ debugOpen ? '✕' : '🐞' }}
    </button>

    <!-- 调试面板 -->
    <DebugPanel
      v-if="debugOpen"
      :player="player"
      :enemies="enemies"
      :game-state="gameState"
      :skills="player.skills"
      @close="debugOpen = false"
      @kill-all-enemies="debugKillAll"
      @freeze-enemies="debugFreeze"
      @set-player-hp="player.hp = Math.min($event, player.maxHp)"
      @set-player-speed="player.speed = $event"
      @set-player-base-attack="player.baseAttack = $event"
      @set-player-level="debugSetLevel($event)"
      @set-player-exp="player.exp = $event"
      @set-player-pos="debugSetPos"
      @change-skill-level="debugChangeSkillLevel"
      @reset-skill-cd="debugResetSkillCd"
      @unlock-skill="debugUnlockSkill"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  PLAYER_ATTRS,
  SKILL_TABLE,
  SKILL_KEY_MAP,
  EXP_LEVEL_TABLE,
  ENTITY_SIZE,
  DIRECTION,
} from './constants.js'

// ─── Composables ───
import { useMap } from './composables/useMap.js'
import { usePlayer } from './composables/usePlayer.js'
import { useEnemy } from './composables/useEnemy.js'
import { useEnemySpawner } from './composables/useEnemySpawner.js'
import { useGameLoop } from './composables/useGameLoop.js'
import { useDebug } from './composables/useDebug.js'

// ─── Components ───
import GameCanvas from './components/GameCanvas.vue'
import PlayerStatusPanel from './components/PlayerStatusPanel.vue'
import EnemyList from './components/EnemyList.vue'
import BattleLog from './components/BattleLog.vue'
import ActionBar from './components/ActionBar.vue'
import LevelUpPanel from './components/LevelUpPanel.vue'
import DeathPanel from './components/DeathPanel.vue'
import DebugPanel from './components/DebugPanel.vue'

// ═════════════════════ 游戏核心状态 ═════════════════════

const gameRoot = ref(null)
const gameCanvasRef = ref(null)

const player = reactive({
  x: 0, y: 0,
  hp: PLAYER_ATTRS.maxHp,
  maxHp: PLAYER_ATTRS.maxHp,
  speed: PLAYER_ATTRS.speed,
  baseAttack: PLAYER_ATTRS.baseAttack,
  level: 1,
  exp: 0,
  direction: DIRECTION.FRONT,
  frame: 0,
  frameTimer: 0,
  skills: [],
  hitFlash: 0,
  size: ENTITY_SIZE,
  isMoving: false,
})

const camera = reactive({ x: 0, y: 0 })
const enemies = ref([])
const projectiles = ref([])
const effects = ref([])
const battleLog = ref([])
const levelUpOptions = ref([])

const gameState = reactive({
  gameTime: 0,
  killCount: 0,
  isDead: false,
  levelUpPending: false,
  spawnTimer: 0,
})

// ─── 输入状态 ───
const keysDown = reactive({})
const mouseScreen = reactive({ x: 0, y: 0 })
const mouseHeld = ref(false)

// ═════════════════════ Debug 面板状态（必须在 composable 初始化前） ═════════════════════
const { debugOpen, toggleDebug, debugFlags } = useDebug()

// ═════════════════════ 计算属性 ═════════════════════

const hpPercent = computed(() => (player.hp / player.maxHp) * 100)

const nextLevelExp = computed(() => {
  const idx = player.level
  if (idx < EXP_LEVEL_TABLE.length) return EXP_LEVEL_TABLE[idx]
  return EXP_LEVEL_TABLE[EXP_LEVEL_TABLE.length - 1] + (player.level - EXP_LEVEL_TABLE.length) * 2000
})

const expPercent = computed(() => {
  const prevExp = player.level > 1 ? EXP_LEVEL_TABLE[player.level - 2] : 0
  const needed = nextLevelExp.value - prevExp
  const current = player.exp - prevExp
  return needed > 0 ? (current / needed) * 100 : 0
})

const formatTime = (ms) => {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}分${s % 60}秒`
}

// ─── 技能固定槽位 ───
const skillSlots = computed(() => {
  const slots = new Array(5).fill(null)
  player.skills.forEach(sk => {
    if (sk.isPassive) return
    const idx = SKILL_KEY_MAP[sk.id]
    if (idx !== undefined) slots[idx - 1] = sk
  })
  return slots
})

// ═════════════════════ 初始化 composables ═════════════════════

// 1. 地图层：坐标转换、碰撞检测、摄像机
const mapUtils = useMap(camera)
const { toScreen, toLogical, checkCollision, updateCamera } = mapUtils

// 2. 玩家层：移动、技能、升级
const playerUtils = usePlayer(
  player, gameState, keysDown, mouseHeld, mouseScreen,
  gameCanvasRef, enemies, projectiles, effects,
  mapUtils, battleLog, levelUpOptions,
)
const {
  updatePlayer, fireArrow, activateSkill, onSkillClick,
  damageEnemy, findNearestEnemy,
  showLevelUpOptions, onLevelUpChoice,
  createSkillInstance, resetPlayer, recalcPassiveBuffs,
} = playerUtils

// 3. 敌人 AI 层
const { updateEnemies } = useEnemy(
  enemies, player, projectiles, gameState, mapUtils, battleLog,
)

// 4. 敌人生成层
const { spawnEnemy, handleSpawning, cleanupDead } = useEnemySpawner(
  enemies, gameState, camera, gameCanvasRef, {}, battleLog,
)

// 5. 游戏主循环层
const { startLoop, stopLoop } = useGameLoop(
  player, gameState, enemies, projectiles, effects,
  gameCanvasRef, camera,
  { updatePlayer, updateEnemies, handleSpawning, cleanupDead, damageEnemy },
  mapUtils,
  {
    onRender: () => {
      gameCanvasRef.value?.render({
        player, enemies, projectiles, effects, gameState,
      })
    },
  },
)

// ═════════════════════ 输入事件 ═════════════════════

const onMouseDown = (e) => {
  if (gameState.isDead || gameState.levelUpPending) return
  mouseHeld.value = true
  fireArrow()
}

const onMouseUp = () => {
  mouseHeld.value = false
}

const onMouseMove = (e) => {
  const rect = gameRoot.value?.getBoundingClientRect()
  if (rect) {
    mouseScreen.x = e.clientX - rect.left
    mouseScreen.y = e.clientY - rect.top
  }
}

const onKeyDown = (e) => {
  // ~ 键切换调试面板
  if (e.key === '`' || e.key === '~') {
    e.preventDefault()
    toggleDebug()
    return
  }

  keysDown[e.key.toLowerCase()] = true

  // 数字键激活技能（固定映射，按键编号对应 SKILL_KEY_MAP 中的槽位）
  const keyNum = parseInt(e.key)
  if (keyNum >= 1 && keyNum <= 5) {
    const skill = skillSlots.value[keyNum - 1]
    if (skill) activateSkill(skill)
  }

  // 空格键射击
  if (e.key === ' ') {
    e.preventDefault()
    fireArrow()
  }
}

const onKeyUp = (e) => {
  keysDown[e.key.toLowerCase()] = false
}

const onWindowMouseUp = () => {
  mouseHeld.value = false
}

// ═════════════════════ 重新开始 ═════════════════════

const restartGame = () => {
  resetPlayer()
  camera.x = 0
  camera.y = 0
  enemies.value = []
  projectiles.value = []
  effects.value = []
  battleLog.value = []
  levelUpOptions.value = []
  gameState.gameTime = 0
  gameState.killCount = 0
  gameState.spawnTimer = 0
  gameState.isDead = false
  gameState.levelUpPending = false
  mouseHeld.value = false
}

// ─── 调试面板事件处理 ───

const debugKillAll = () => {
  enemies.value.forEach(e => {
    if (!e.dead) {
      e.hp = 0
      e.dead = true
      gameState.killCount++
      player.exp += (e.expReward || 0)
    }
  })
}

const debugFreeze = (duration) => {
  enemies.value.forEach(e => {
    if (!e.dead) {
      e.frozen = true
      e.frozenTimer = duration
    }
  })
}

const debugSetLevel = (lv) => {
  player.level = Math.max(1, parseInt(lv) || 1)
}

const debugSetPos = (x, y) => {
  player.x = x
  player.y = y
}

const debugChangeSkillLevel = (id, delta) => {
  const sk = player.skills.find(s => s.id === id)
  if (sk) sk.currentLevel = Math.max(1, sk.currentLevel + delta)
}

const debugResetSkillCd = (id) => {
  const sk = player.skills.find(s => s.id === id)
  if (sk) sk.remainingCooldown = 0
}

const debugUnlockSkill = (id) => {
  if (player.skills.find(s => s.id === id)) return
  const tpl = SKILL_TABLE.find(s => s.id === id)
  if (tpl) player.skills.push(createSkillInstance(tpl, 1))
}

// ═════════════════════ 生命周期 ═════════════════════

onMounted(() => {
  // 初始化射箭技能
  const arrowTemplate = SKILL_TABLE.find(s => s.id === 'arrow')
  player.skills.push(createSkillInstance(arrowTemplate, 1))
  recalcPassiveBuffs()

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mouseup', onWindowMouseUp)

  startLoop()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('mouseup', onWindowMouseUp)
  stopLoop()
})
</script>

<style scoped lang="scss">
@use './async-demo/static/scss/theme.scss';

.roguelike-game {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #0f172a;
  cursor: crosshair;
}

.hud {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}

.debug-toggle-btn {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 100;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(100, 116, 139, 0.5);
  background: rgba(30, 41, 59, 0.85);
  color: #e2e8f0;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(51, 65, 85, 0.95);
    border-color: #fbbf24;
    transform: scale(1.1);
  }
}
</style>
