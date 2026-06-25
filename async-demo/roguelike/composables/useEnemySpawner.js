/**
 * useEnemySpawner — 敌人波次生成、难度递增、生成位置计算
 * 管理敌人刷新逻辑与生命周期清理
 */
import { reactive } from 'vue'
import {
  ENEMY_TYPE_TABLE,
  SPAWN_INTERVAL_INITIAL,
  SPAWN_INTERVAL_MIN,
  SPAWN_INTERVAL_DECREASE_PER_SEC,
  SPAWN_MARGIN,
  MAX_ENEMIES,
  DIRECTION,
  ENEMY_HP_SCALE_RATE,
  ENEMY_ATTACK_SCALE_RATE,
  scaleEnemyStat,
} from '../constants.js'
import { useDebug } from './useDebug.js'

/**
 * @param {import('vue').Ref<Array>} enemies - 敌人列表
 * @param {import('vue').UnwrapNestedRefs} gameState - 游戏状态（spawnTimer）
 * @param {import('vue').UnwrapNestedRefs} camera - 摄像机位置
 * @param {import('vue').Ref<HTMLCanvasElement|null>} gameCanvas - 画布引用
 * @param {object} playerRefs - { gainExp } 玩家经验获取函数
 * @param {import('vue').Ref<Array>} battleLog - 战斗日志
 */
export function useEnemySpawner(enemies, gameState, camera, gameCanvas, playerRefs, battleLog) {
  const { enemyDebug } = useDebug()
  const log = (msg) => {
    battleLog.value.unshift({ time: Date.now(), text: msg })
    if (battleLog.value.length > 50) battleLog.value.pop()
  }

  /**
   * 生成单个敌人（权重随机类型，镜头边界外随机位置）
   */
  const spawnEnemy = () => {
    const canvas = gameCanvas.value
    if (!canvas) return

    // 权重随机选择敌人类型
    const totalWeight = ENEMY_TYPE_TABLE.reduce((sum, t) => sum + t.weight, 0)
    let rand = Math.random() * totalWeight
    let chosenType = ENEMY_TYPE_TABLE[0]
    for (const t of ENEMY_TYPE_TABLE) {
      rand -= t.weight
      if (rand <= 0) { chosenType = t; break }
    }

    const attrs = chosenType.attrs

    // 根据玩家等级缩放敌人 HP 和攻击力（移速、攻击距离保持不变）
    const playerLevel = playerRefs?.player?.level ?? 1
    const scaledHp = scaleEnemyStat(playerLevel, attrs.maxHp, ENEMY_HP_SCALE_RATE)
    const scaledAttack = scaleEnemyStat(playerLevel, attrs.attack, ENEMY_ATTACK_SCALE_RATE)

    // 通过组件 expose 的方法获取画布尺寸
    const size = canvas.getCanvasSize ? canvas.getCanvasSize() : { width: 800, height: 600 }
    if (!size.width || !size.height) return

    // 在镜头边界外 SPAWN_MARGIN 处随机位置刷新
    const side = Math.floor(Math.random() * 4) // 0:上 1:右 2:下 3:左
    let spawnX, spawnY
    const hw = size.width / 2 + SPAWN_MARGIN
    const hh = size.height / 2 + SPAWN_MARGIN

    switch (side) {
      case 0: spawnX = camera.x + (Math.random() - 0.5) * 2 * hw; spawnY = camera.y - hh; break
      case 1: spawnX = camera.x + hw; spawnY = camera.y + (Math.random() - 0.5) * 2 * hh; break
      case 2: spawnX = camera.x + (Math.random() - 0.5) * 2 * hw; spawnY = camera.y + hh; break
      case 3: spawnX = camera.x - hw; spawnY = camera.y + (Math.random() - 0.5) * 2 * hh; break
    }

    enemies.value.push(reactive({
      type: chosenType.type,
      x: spawnX, y: spawnY,
      hp: scaledHp,
      maxHp: scaledHp,
      speed: attrs.speed,
      size: attrs.size,
      attack: scaledAttack,
      attackRange: attrs.attackRange,
      skillRange: attrs.skillRange,
      skillCooldown: attrs.skillCooldown,
      color: attrs.color,
      color2: attrs.color2,
      expReward: attrs.expReward,
      hasMelee: attrs.hasMelee,
      hasRanged: attrs.hasRanged,
      direction: DIRECTION.FRONT,
      frame: 0,
      frameTimer: 0,
      isMoving: true,
      dead: false,
      hitFlash: 0,
      frozen: false,
      frozenTimer: 0,
      skillTimer: 0,
      meleeAttacking: false,
      meleeCooldownTimer: 0,
    }))
  }

  /**
   * 计时器驱动刷新，间隔随游戏时长递减
   */
  const handleSpawning = (dt) => {
    // 调试：暂停刷新
    if (enemyDebug.pauseSpawn) return
    // 场上敌人数已达上限，不再刷新
    if (enemies.value.length >= MAX_ENEMIES) return

    gameState.spawnTimer += dt
    const elapsedSec = gameState.gameTime / 1000
    const interval = Math.max(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_INITIAL - elapsedSec * SPAWN_INTERVAL_DECREASE_PER_SEC)
    if (gameState.spawnTimer >= interval) {
      gameState.spawnTimer -= interval
      spawnEnemy()
    }
  }

  /**
   * 清理已死亡敌人
   */
  const cleanupDead = () => {
    enemies.value = enemies.value.filter(e => !e.dead)
  }

  return { spawnEnemy, handleSpawning, cleanupDead }
}
