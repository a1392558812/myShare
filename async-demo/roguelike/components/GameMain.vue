<template>
  <div class="roguelike-game" ref="gameRoot" @mousemove="onMouseMove" @mousedown="onMouseDown" @mouseup="onMouseUp">
    <GameCanvas ref="gameCanvasRef" :camera="camera" :events="eventsList" />

    <div class="hud">
      <PlayerStatusPanel :player="player" :max-hp="player.maxHp" :hp-percent="hpPercent" :exp-percent="expPercent"
        :next-level-exp="nextLevelExp" :game-time="gameState.gameTime" :kill-count="gameState.killCount"
        :format-time="formatTime" />
      <BossHudBar
        :boss-state="bossState"
        :boss-cooldown-remaining="bossCooldownRemaining"
        :first-boss-pre-warning-remaining="firstBossPreWarningRemaining"
        :active-boss="activeBoss"
        :boss-warning-timer="bossWarningTimer"
        :boss-cooldown-total="BOSS_COOLDOWN"
        :first-boss-early-warning="BOSS_FIRST_EARLY_WARNING" />
      <ActionBar :skills="skillSlots" @skill-click="onSkillClick" />
      <EnemyList :enemies="enemies" />
      <BattleLog :log="battleLog" />
    </div>

    <EventIndicator :buffs="buffs" :cursed-active="cursedActive" :cursed-timer="cursedTimerDisplay" />

    <BossWarning :is-warning="bossWarning" :boss-name="bossWarningName" :warning-remaining="bossWarningTimer" />

    <BossHealthBar :boss="activeBoss" :phase="activeBossPhase" />

    <LevelUpPanel v-if="gameState.levelUpPending" :player="player" :options="levelUpOptions"
      @choice="onLevelUpChoice" />

    <CursedStelePrompt v-if="pendingStele" @activate="onSteleActivate" @cancel="onSteleCancel" />

    <DeathPanel v-if="gameState.isDead" :game-time="gameState.gameTime" :kill-count="gameState.killCount"
      :player-level="player.level" :format-time="formatTime" @restart="$emit('restart')" />

    <button class="debug-toggle-btn" @click="toggleDebug" :title="debugOpen ? '关闭调试面板' : '打开调试面板 (~ 键)'">
      {{ debugOpen ? '✕' : '🐞' }}
    </button>

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
  SKILL_KEY_MAP,
  BOSS_COOLDOWN,
  BOSS_FIRST_EARLY_WARNING,
} from '../constants.js'

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
import BossHudBar from './BossHudBar.vue'

defineEmits(['restart'])


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
  gold: 0,
  hitFlash: 0,
  size: ENTITY_SIZE,
  isMoving: false,
  dodgeChance: 0,
})

const camera = reactive({ x: 0, y: 0 })
const enemies = ref([])
const projectiles = ref([])
const effects = ref([])
const lootDrops = ref([])
const magicCircles = ref([])
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

const keysDown = reactive({})
const mouseScreen = reactive({ x: 0, y: 0 })
const mouseHeld = ref(false)

const { debugOpen, toggleDebug, debugFlags, gameSpeed, bossDebug } = useDebug()


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

const skillSlots = computed(() => {
  const slots = []
  player.skills.forEach(sk => {
    if (sk.isPassive) return
    slots.push(sk)
  })
  return slots
})


const buffUtils = useBuffs()
const { buffs, addBuff, tickBuffs, getAttackMultiplier, getSpeedMultiplier, getDodgeChance } = buffUtils

const mapUtils = useMap(camera)
const { toScreen, toLogical, checkCollision, updateCamera } = mapUtils

const buffGetters = {
  getAttackMultiplier,
  getSpeedMultiplier,
  getDodgeChance,
  getEnemyDamageMultiplier: () => 1,
  getDropRateMultiplier: () => 1,
  getDeathZoneSlow: () => 0,
  getBossSlowMultiplier: () => 1,
}

const bossDamageRef = { fn: null }

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

const enemyUtils = useEnemy(
  enemies, player, projectiles, gameState, mapUtils, battleLog, effects, gainExp, buffGetters,
)
const { updateEnemies, tryDamagePlayer } = enemyUtils

const bossUtils = useBoss(
  player, gameState, enemies, projectiles, effects, lootDrops, battleLog,
  { gainExp, tryDamagePlayer },
)
const {
  activeBoss, bossState, bossClones, voidLines, slowFields,
  bossCooldownRemaining, bossWarningTimer,
  firstBossPreWarningRemaining,
  isBossActive, isBossWarning, currentPhase,
  tickBossSpawn, updateBoss, damageBoss, resetBossState, getBossSlowMultiplier,
  debugForceSpawn, debugForceKill,
} = bossUtils

bossDamageRef.fn = damageBoss

const activeBossPhase = currentPhase
const bossWarning = computed(() => isBossWarning.value)
const bossWarningName = computed(() => activeBoss.value?.bossName || '')

const { spawnEnemy, debugSpawnEnemies, handleSpawning, cleanupDead } = useEnemySpawner(
  enemies, gameState, camera, gameCanvasRef, { player, gainExp }, battleLog,
  { spawnPause: bossUtils.spawnPause, spawnRateMultiplier: bossUtils.spawnRateMultiplier },
)

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

buffGetters.getEnemyDamageMultiplier = getEnemyDamageMultiplier
buffGetters.getDropRateMultiplier = getDropRateMultiplier
buffGetters.getBossSlowMultiplier = getBossSlowMultiplier

const loopUtils = useGameLoop(
  player, gameState, enemies, projectiles, effects, lootDrops, magicCircles,
  gameCanvasRef, camera,
  { updatePlayer, updateEnemies, handleSpawning, cleanupDead, damageEnemy },
  mapUtils,
  {
    onRender: () => {
      checkEventActivation()
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

buffGetters.getDeathZoneSlow = getDeathZoneSlow

const getCanvasSizeForEvents = () => {
  const size = gameCanvasRef.value?.getCanvasSize?.()
  return size || { width: 800, height: 600 }
}

const cursedTimerDisplay = computed(() => {
  if (!cursedActive.value) return ''
  const ms = cursedRemaining.value
  if (ms >= 10000) return `${(ms / 1000).toFixed(0)}s`
  return `${(ms / 1000).toFixed(1)}s`
})


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
  if (e.key === '`' || e.key === '~') {
    e.preventDefault()
    toggleDebug()
    return
  }

  if (e.key === 'f' || e.key === 'F') {
    if (pendingStele.value) {
      e.preventDefault()
      onSteleActivate()
      return
    }
  }

  if (gameState.isDead || gameState.levelUpPending || gameState.stelePending) return

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


const onSteleActivate = () => {
  activateCursedStele()
  gameState.stelePending = false
}

const onSteleCancel = () => {
  cancelCursedStele()
  gameState.stelePending = false
}


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
  if (!sk) return
  sk.currentLevel = Math.max(1, sk.currentLevel + delta)
  if (id === 'bodyStrength') recalcPassiveBuffs()
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


onMounted(() => {
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