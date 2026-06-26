/**
 * useDebug — 调试面板状态管理（模块级单例）
 * 所有调用方共享同一份 debug 状态
 */
import { reactive, ref } from 'vue'

const debugOpen = ref(false)

const debugFlags = reactive({
  /** 敌人暂停移动 */
  pauseEnemyMovement: false,
  /** 敌人暂停攻击（远程弹幕 / 近战伤害） */
  pauseEnemyAttack: false,
  /** 玩家无敌模式 */
  godMode: false,
  /** 显示敌人路径/视野范围 */
  showEnemyPaths: false,
})

const playerOverride = reactive({
  speed: null,
  baseAttack: null,
  /** 闪避率 0~1，null=不覆盖 */
  dodgeChance: null,
  /** 金币，null=不覆盖 */
  gold: null,
  /** 最大生命值，null=不覆盖 */
  maxHp: null,
})

const enemyDebug = reactive({
  /** 暂停刷新 */
  pauseSpawn: false,
  /** 一键秒杀所有敌人 */
  killAll: false,
})

/** Boss 调试控制 */
const bossDebug = reactive({
  /** 强制刷 Boss（选择 Boss id，'' 为随机） */
  forceSpawn: false,
  /** 目标 Boss id */
  bossId: '',
  /** 强制击杀当前 Boss */
  forceKill: false,
  /** 跳过 Boss 冷却 */
  skipCooldown: false,
})

/** 事件调试控制 */
const eventDebug = reactive({
  /** 选中要生成的事件类型 */
  eventType: 'altar',
})

/** 刷怪调试控制 */
const enemySpawnDebug = reactive({
  /** 选中要生成的敌人类型 */
  enemyType: 'melee',
  /** 单次生成数量 */
  spawnCount: 3,
  /** 是否在玩家附近生成 */
  nearPlayer: true,
})

/** 游戏倍速（1 = 正常） */
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
