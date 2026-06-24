<template>
  <div class="roguelike-game" ref="gameRoot">
    <!-- 地图渲染区 -->
    <GameCanvas
      ref="gameCanvasRef"
      :camera="camera"
      @mousemove="onMouseMove"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
    />

    <!-- HUD 界面层 -->
    <div class="hud">
      <!-- 玩家状态面板 -->
      <PlayerStatusPanel
        :player="player"
        :max-hp="PLAYER_ATTRS.maxHp"
        :hp-percent="hpPercent"
        :exp-percent="expPercent"
        :next-level-exp="nextLevelExp"
        :game-time="gameState.gameTime"
        :kill-count="gameState.killCount"
        :format-time="formatTime"
      />
      <!-- 操作按钮栏（技能） -->
      <ActionBar
        :skills="player.skills"
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  PLAYER_ATTRS,
  SKILL_TABLE,
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

// ─── Components ───
import GameCanvas from './components/GameCanvas.vue'
import PlayerStatusPanel from './components/PlayerStatusPanel.vue'
import EnemyList from './components/EnemyList.vue'
import BattleLog from './components/BattleLog.vue'
import ActionBar from './components/ActionBar.vue'
import LevelUpPanel from './components/LevelUpPanel.vue'
import DeathPanel from './components/DeathPanel.vue'

// ═════════════════════ 游戏核心状态 ═════════════════════

const gameRoot = ref(null)
const gameCanvasRef = ref(null)

const player = reactive({
  x: 0, y: 0,
  hp: PLAYER_ATTRS.maxHp,
  speed: PLAYER_ATTRS.speed,
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

// ═════════════════════ 计算属性 ═════════════════════

const hpPercent = computed(() => (player.hp / PLAYER_ATTRS.maxHp) * 100)

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
  createSkillInstance, resetPlayer,
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
  keysDown[e.key.toLowerCase()] = true

  // 数字键激活技能
  const skillKeys = ['1', '2', '3', '4']
  const idx = skillKeys.indexOf(e.key)
  if (idx >= 0 && idx < player.skills.length) {
    activateSkill(player.skills[idx])
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

// ═════════════════════ 生命周期 ═════════════════════

onMounted(() => {
  // 初始化射箭技能
  const arrowTemplate = SKILL_TABLE.find(s => s.id === 'arrow')
  player.skills.push(createSkillInstance(arrowTemplate, 1))

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
</style>
