/**
 * useDebug — 调试面板状态管理（模块级单例）
 * 所有调用方共享同一份 debug 状态
 */
import { reactive, ref } from 'vue'

// ─── 模块级单例状态 ───
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

// ─── 玩家调试：临时覆盖值（null = 不覆盖） ───
const playerOverride = reactive({
  speed: null,
  baseAttack: null,
})

// ─── 敌人生成调试 ───
const enemyDebug = reactive({
  /** 暂停刷新 */
  pauseSpawn: false,
  /** 一键秒杀所有敌人 */
  killAll: false,
})

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
    enemyDebug.pauseSpawn = false
  }

  return {
    debugOpen,
    debugFlags,
    playerOverride,
    enemyDebug,
    toggleDebug,
    setFlag,
    resetAll,
  }
}
