import { reactive, ref } from 'vue'

const debugOpen = ref(false)

const debugFlags = reactive({
  pauseEnemyMovement: false,
  pauseEnemyAttack: false,
  godMode: false,
  showEnemyPaths: false,
})

const playerOverride = reactive({
  speed: null,
  baseAttack: null,
  dodgeChance: null,
  gold: null,
  maxHp: null,
})

const enemyDebug = reactive({
  pauseSpawn: false,
  killAll: false,
})

const bossDebug = reactive({
  forceSpawn: false,
  bossId: '',
  forceKill: false,
  skipCooldown: false,
})

const eventDebug = reactive({
  eventType: 'altar',
})

const enemySpawnDebug = reactive({
  enemyType: 'melee',
  spawnCount: 3,
  nearPlayer: true,
})

const gameSpeed = ref(1.0)

export function useDebug() {
  const toggleDebug = () => {
    debugOpen.value = !debugOpen.value
  }

  const setFlag = (key, value) => {
    debugFlags[key] = value
  }

  const resetAll = () => {
    debugFlags.pauseEnemyMovement = false
    debugFlags.pauseEnemyAttack = false
    debugFlags.godMode = false
    debugFlags.showEnemyPaths = false
    playerOverride.speed = null
    playerOverride.baseAttack = null
    playerOverride.dodgeChance = null
    playerOverride.gold = null
    playerOverride.maxHp = null
    enemyDebug.pauseSpawn = false
    bossDebug.forceSpawn = false
    bossDebug.bossId = ''
    bossDebug.forceKill = false
    bossDebug.skipCooldown = false
    eventDebug.eventType = 'altar'
    enemySpawnDebug.enemyType = 'melee'
    enemySpawnDebug.spawnCount = 3
    enemySpawnDebug.nearPlayer = true
    gameSpeed.value = 1.0
  }

  return {
    debugOpen,
    debugFlags,
    playerOverride,
    enemyDebug,
    bossDebug,
    eventDebug,
    enemySpawnDebug,
    gameSpeed,
    toggleDebug,
    setFlag,
    resetAll,
  }
}
