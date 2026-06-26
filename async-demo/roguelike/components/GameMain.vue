<template>
  <div class="roguelike-game" ref="gameRoot" @mousemove="onMouseMove" @mousedown="onMouseDown" @mouseup="onMouseUp">
    <!-- 地图渲染区 -->
    <GameCanvas ref="gameCanvasRef" :camera="camera" :events="eventsList" />

    <!-- HUD 界面层 -->
    <div class="hud">
      <!-- 玩家状态面板 -->
      <PlayerStatusPanel :player="player" :max-hp="player.maxHp" :hp-percent="hpPercent" :exp-percent="expPercent"
        :next-level-exp="nextLevelExp" :game-time="gameState.gameTime" :kill-count="gameState.killCount"
        :format-time="formatTime" />
      <!-- 操作按钮栏（技能） -->
      <ActionBar :skills="skillSlots" @skill-click="onSkillClick" />
      <!-- 敌人列表 -->
      <EnemyList :enemies="enemies" />
      <!-- 战斗日志 -->
      <BattleLog :log="battleLog" />
    </div>

    <!-- Buff / 事件状态指示器 -->
    <EventIndicator :buffs="buffs" :cursed-active="cursedActive" :cursed-timer="cursedTimerDisplay" />

    <!-- Boss 警告覆盖层 -->
    <BossWarning :is-warning="bossWarning" :boss-name="bossWarningName" />

    <!-- Boss 血条 -->
    <BossHealthBar :boss="activeBoss" :phase="activeBossPhase" />

    <!-- 升级选择面板 -->
    <LevelUpPanel v-if="gameState.levelUpPending" :player="player" :options="levelUpOptions"
      @choice="onLevelUpChoice" />

    <!-- 诅咒石碑确认弹窗 -->
    <CursedStelePrompt v-if="pendingStele" @activate="onSteleActivate" @cancel="onSteleCancel" />

    <!-- 死亡界面 -->
    <DeathPanel v-if="gameState.isDead" :game-time="gameState.gameTime" :kill-count="gameState.killCount"
      :player-level="player.level" :format-time="formatTime" @restart="$emit('restart')" />

    <!-- 调试面板开关（右下角浮动按钮） -->
    <button class="debug-toggle-btn" @click="toggleDebug" :title="debugOpen ? '关闭调试面板' : '打开调试面板 (~ 键)'">
      {{ debugOpen ? '✕' : '🐞' }}
    </button>

    <!-- 调试面板 -->
    <DebugPanel v-if="debugOpen" :player="player" :enemies="enemies" :game-state="gameState" :skills="player.skills"
      :events="eventsList" :active-boss="activeBoss" :boss-state="bossState"
      :boss-cooldown-remaining="bossCooldownRemaining" :boss-phase="activeBossPhase" :buffs="buffs"
      @close="debugOpen = false" @kill-all-enemies="debugKillAll" @freeze-enemies="debugFreeze"
      @set-player-hp="player.hp = Math.min($event, player.maxHp)" @set-player-speed="player.speed = $event"
      @set-player-base-attack="player.baseAttack = $event" @set-player-dodge="player.dodgeChance = $event"
      @set-player-gold="player.gold = $event" @set-player-maxHp="debugSetMaxHp($event)"
      @set-player-level="debugSetLevel($event)" @set-player-exp="player.exp = $event" @set-player-pos="debugSetPos"
      @change-skill-level="debugChangeSkillLevel" @reset-skill-cd="debugResetSkillCd" @unlock-skill="debugUnlockSkill"
      @remove-skill="debugRemoveSkill" @add-exp="gainExp" @force-spawn-boss="debugForceSpawnBoss"
      @force-kill-boss="debugForceKillBoss" @clear-buff="debugClearBuff"
      @spawn-debug-event="(typeId) => debugSpawnEvent(typeId)" @clear-all-events="eventsList.length = 0"
      @spawn-debug-enemies="(type, count, nearPlayer) => debugSpawnEnemies(type, count, nearPlayer)" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  PLAYER_ATTRS,
  SKILL_TABLE,
  getExpThreshold,
  ENTITY_SIZE,
  DIRECTION,
  SKILL_KEY_MAP
} from '../constants.js'

// ─── Composables ───
import { useMap } from '../composables/useMap.js'
import { usePlayer } from '../composables/usePlayer.js'
import { useEnemy, groundZones } from '../composables/useEnemy.js'
import { useEnemySpawner } from '../composables/useEnemySpawner.js'
import { useGameLoop } from '../composables/useGameLoop.js'
import { useDebug } from '../composables/useDebug.js'
import { useBuffs } from '../composables/useBuffs.js'
import { useEvents } from '../composables/useEvents.js'
import { useBoss } from '../composables/useBoss.js'
import { resetBattleLogId } from '../composables/useBattleLog.js'

// ─── Components ───
import GameCanvas from './GameCanvas.vue'
import PlayerStatusPanel from './PlayerStatusPanel.vue'
import EnemyList from './EnemyList.vue'
import BattleLog from './BattleLog.vue'
import ActionBar from './ActionBar.vue'
import LevelUpPanel from './LevelUpPanel.vue'
import DeathPanel from './DeathPanel.vue'
import DebugPanel from './DebugPanel.vue'
import EventIndicator from './EventIndicator.vue'
import CursedStelePrompt from './CursedStelePrompt.vue'
import BossHealthBar from './BossHealthBar.vue'
import BossWarning from './BossWarning.vue'

// ✅ 定义组件事件
defineEmits(['restart'])

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
  gold: 0,           // 金币（预留字段）
  hitFlash: 0,
  size: ENTITY_SIZE,
  isMoving: false,
  dodgeChance: 0,     // 基础闪避率（后续闪避技能系统会修改）
})

const camera = reactive({ x: 0, y: 0 })
const enemies = ref([])
const projectiles = ref([])
const effects = ref([])
const lootDrops = ref([])      // 掉落物列表
const magicCircles = ref([])   // 魔法阵火雨实例列表
const battleLog = ref([])
const levelUpOptions = ref([])

const gameState = reactive({
  gameTime: 0,
  killCount: 0,
  isDead: false,
  levelUpPending: false,
  stelePending: false,
  spawnTimer: 0,
})

// ─── 输入状态 ───
const keysDown = reactive({})
const mouseScreen = reactive({ x: 0, y: 0 })
const mouseHeld = ref(false)

// ═════════════════════ Debug 面板状态（必须在 composable 初始化前） ═════════════════════
const { debugOpen, toggleDebug, debugFlags, gameSpeed, bossDebug } = useDebug()

// ═════════════════════ 计算属性 ═════════════════════

const hpPercent = computed(() => (player.hp / player.maxHp) * 100)

const nextLevelExp = computed(() => getExpThreshold(player.level + 1))

const expPercent = computed(() => {
  const curThreshold = getExpThreshold(player.level)
  const nextThreshold = getExpThreshold(player.level + 1)
  const needed = nextThreshold - curThreshold
  const current = player.exp - curThreshold
  return needed > 0 ? (current / needed) * 100 : 0
})

const formatTime = (ms) => {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}分${s % 60}秒`
}

// ─── 技能固定槽位 ───
const skillSlots = computed(() => {
  const slots = []
  player.skills.forEach(sk => {
    if (sk.isPassive) return
    slots.push(sk)
  })
  return slots
})

// ═════════════════════ 初始化 composables ═════════════════════

// 0. Buff 系统（先初始化，供后续模块引用）
const buffUtils = useBuffs()
const { buffs, addBuff, tickBuffs, getAttackMultiplier, getSpeedMultiplier, getDodgeChance } = buffUtils

// 1. 地图层：坐标转换、碰撞检测、摄像机
const mapUtils = useMap(camera)
const { toScreen, toLogical, checkCollision, updateCamera } = mapUtils

// ---- 构建 buffGetters（传递给 usePlayer / useEnemy / useEvents） ----
// 占位引用将在各个 composable 初始化后回填
const buffGetters = {
  getAttackMultiplier,
  getSpeedMultiplier,
  getDodgeChance,
  getEnemyDamageMultiplier: () => 1,
  getDropRateMultiplier: () => 1,
  getDeathZoneSlow: () => 0,
  getBossSlowMultiplier: () => 1,
}

// Boss 伤害委托：通过可变引用打破 Player→Boss→Enemy→Player 循环依赖
const bossDamageRef = { fn: null }

// 2. 玩家层：移动、技能、升级
const playerUtils = usePlayer(
  player, gameState, keysDown, mouseHeld, mouseScreen,
  gameCanvasRef, enemies, projectiles, effects,
  mapUtils, battleLog, levelUpOptions, lootDrops, magicCircles,
  buffGetters,
  (dmg) => { if (bossDamageRef.fn) bossDamageRef.fn(dmg) },
)
const {
  updatePlayer, fireArrow, activateSkill, onSkillClick,
  damageEnemy, findNearestEnemy,
  showLevelUpOptions, onLevelUpChoice,
  createSkillInstance, resetPlayer, recalcPassiveBuffs, gainExp,
} = playerUtils

// 3. 敌人 AI 层
const enemyUtils = useEnemy(
  enemies, player, projectiles, gameState, mapUtils, battleLog, effects, gainExp, buffGetters,
)
const { updateEnemies, tryDamagePlayer } = enemyUtils

// 3.5 Boss 波次系统
const bossUtils = useBoss(
  player, gameState, enemies, projectiles, effects, lootDrops, battleLog,
  { gainExp, tryDamagePlayer },
)
const {
  activeBoss, bossState, bossClones, voidLines, slowFields,
  bossCooldownRemaining,
  isBossActive, isBossWarning, currentPhase,
  tickBossSpawn, updateBoss, damageBoss, resetBossState, getBossSlowMultiplier,
  debugForceSpawn, debugForceKill,
} = bossUtils

// 回填 Boss 伤害委托引用
bossDamageRef.fn = damageBoss

const activeBossPhase = currentPhase
const bossWarning = computed(() => isBossWarning.value)
const bossWarningName = computed(() => activeBoss.value?.bossName || '')

// 4. 敌人生成层（传递 boss spawn state）
const { spawnEnemy, debugSpawnEnemies, handleSpawning, cleanupDead } = useEnemySpawner(
  enemies, gameState, camera, gameCanvasRef, { player, gainExp }, battleLog,
  { spawnPause: bossUtils.spawnPause, spawnRateMultiplier: bossUtils.spawnRateMultiplier },
)

// 5. 事件系统（依赖 buffUtils）
const eventUtils = useEvents(enemies, player, gameState, buffUtils, battleLog, {
  onGainExp: gainExp,
  onUpgradeRandomSkill: () => {
    if (player.skills.length > 0) {
      const idx = Math.floor(Math.random() * player.skills.length)
      player.skills[idx].currentLevel++
      recalcPassiveBuffs()
    }
  },
  onTryDamagePlayer: (dmg) => tryDamagePlayer(dmg),
})
const {
  events: eventsList, pendingStele, cursedActive, cursedRemaining,
  tickEvents, checkEventActivation,
  activateCursedStele, cancelCursedStele,
  getDeathZones, tickDeathZones,
  getEnemyDamageMultiplier, getDropRateMultiplier, isCursedActive,
  debugSpawnEvent,
} = eventUtils

// 回填 buffGetters 依赖
buffGetters.getEnemyDamageMultiplier = getEnemyDamageMultiplier
buffGetters.getDropRateMultiplier = getDropRateMultiplier
buffGetters.getBossSlowMultiplier = getBossSlowMultiplier

// 6. 游戏主循环层
const loopUtils = useGameLoop(
  player, gameState, enemies, projectiles, effects, lootDrops, magicCircles,
  gameCanvasRef, camera,
  { updatePlayer, updateEnemies, handleSpawning, cleanupDead, damageEnemy },
  mapUtils,
  {
    onRender: () => {
      // 每帧检查事件激活
      checkEventActivation()
      // 诅咒石碑弹窗期间暂停游戏循环
      gameState.stelePending = !!pendingStele.value
      gameCanvasRef.value?.render({
        player, enemies, projectiles, effects, lootDrops, magicCircles, gameState,
        voidLines: voidLines.value, slowFields: slowFields.value,
      })
    },
    tickBossSpawn: (dt) => tickBossSpawn(dt),
    updateBoss: (dt) => updateBoss(dt),
    getDtMultiplier: () => gameSpeed.value,
  },
  groundZones,
  { tickBuffs, tickEvents: (dt) => tickEvents(dt, camera, getCanvasSizeForEvents()), tickDeathZones, tryDamagePlayer, getSpeedMultiplier },
)
const { startLoop, stopLoop, getDeathZoneSlow } = loopUtils

// 回填死亡区域减速
buffGetters.getDeathZoneSlow = getDeathZoneSlow

// 画布尺寸辅助
const getCanvasSizeForEvents = () => {
  const size = gameCanvasRef.value?.getCanvasSize?.()
  return size || { width: 800, height: 600 }
}

// ─── 诅咒石碑相关计算
const cursedTimerDisplay = computed(() => {
  if (!cursedActive.value) return ''
  const ms = cursedRemaining.value
  if (ms >= 10000) return `${(ms / 1000).toFixed(0)}s`
  return `${(ms / 1000).toFixed(1)}s`
})

// ═════════════════════ 输入事件 ═════════════════════

const onMouseDown = (e) => {
  if (gameState.isDead || gameState.levelUpPending || gameState.stelePending) return
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

  // F 键激活诅咒石碑
  if (e.key === 'f' || e.key === 'F') {
    if (pendingStele.value) {
      e.preventDefault()
      onSteleActivate()
      return
    }
  }

  // 暂停状态（升级/石碑弹窗）阻塞游戏操作，~ 和 F 键除外
  if (gameState.isDead || gameState.levelUpPending || gameState.stelePending) return

  // 空格键射击
  if (e.key === ' ') {
    e.preventDefault()
    fireArrow()
  }

  const targetKeysDown = e.key.toLowerCase()
  keysDown[targetKeysDown] = true

  const targetIndex = skillSlots.value.findIndex(item => {
    const skillKeyVal = (SKILL_KEY_MAP[`${item.id}`] + '').toLowerCase()
    const flag = skillKeyVal === `${targetKeysDown}`
    console.log('targetKeysDown', skillKeyVal, targetKeysDown, flag)
    return flag
  })

  console.log('targetIndex', skillSlots.value, targetKeysDown, targetIndex)
  if (targetIndex !== -1) {
    activateSkill(skillSlots.value[targetIndex])
  }
}

const onKeyUp = (e) => {
  keysDown[e.key.toLowerCase()] = false
}

const onWindowMouseUp = () => {
  mouseHeld.value = false
}

// ─── 诅咒石碑回调 ───

const onSteleActivate = () => {
  activateCursedStele()
  gameState.stelePending = false
}

const onSteleCancel = () => {
  cancelCursedStele()
  gameState.stelePending = false
}

// ─── 调试面板事件处理 ───

const debugKillAll = () => {
  enemies.value.forEach(e => {
    if (!e.dead) {
      e.hp = 0
      e.dead = true
      gameState.killCount++
      gainExp(e.expReward || 0)
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
  if (tpl) {
    player.skills.push(createSkillInstance(tpl, 1))
    if (id === 'bodyStrength') recalcPassiveBuffs()
  }
}

const debugRemoveSkill = (id) => {
  const idx = player.skills.findIndex(s => s.id === id)
  if (idx === -1) return
  player.skills.splice(idx, 1)
  // 移除被动技能后需要重算属性
  if (id === 'bodyStrength') recalcPassiveBuffs()
}

const debugSetMaxHp = (val) => {
  player.maxHp = Math.max(1, parseInt(val) || 1)
  player.hp = Math.min(player.hp, player.maxHp)
}

const debugForceSpawnBoss = () => {
  debugForceSpawn(bossDebug.bossId)
  bossDebug.forceSpawn = false
}

const debugForceKillBoss = () => {
  debugForceKill()
  bossDebug.forceKill = false
}

const debugClearBuff = (idx) => {
  buffs.value.splice(idx, 1)
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
@use '../async-demo/static/scss/theme.scss';

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

  >* {
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
