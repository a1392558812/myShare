/**
 * useEnemy — 敌人 AI 行为、寻路、攻击判定、状态管理
 * 管理所有敌人的逐帧更新逻辑
 */
import {
  ENEMY_PROJECTILE_SPEED,
  ENEMY_PROJECTILE_DAMAGE,
  ENEMY_PROJECTILE_SIZE,
  FRAME_INTERVAL,
  FRAME_COUNT,
  DIRECTION,
} from '../constants.js'
import { useDebug } from './useDebug.js'

/**
 * @param {import('vue').Ref<Array>} enemies - 敌人列表
 * @param {import('vue').UnwrapNestedRefs} player - 玩家状态
 * @param {import('vue').Ref<Array>} projectiles - 弹幕列表（敌人远程攻击写入）
 * @param {import('vue').UnwrapNestedRefs} gameState - 游戏状态
 * @param {object} mapUtils - { checkCollision }
 * @param {import('vue').Ref<Array>} battleLog - 战斗日志
 */
export function useEnemy(enemies, player, projectiles, gameState, mapUtils, battleLog) {
  const { checkCollision } = mapUtils
  const { debugFlags } = useDebug()

  const log = (msg) => {
    battleLog.value.unshift({ time: Date.now(), text: msg })
    if (battleLog.value.length > 50) battleLog.value.pop()
  }

  /**
   * 每帧更新所有敌人：AI 行为 + 移动 + 攻击
   */
  const updateEnemies = (dt) => {
    enemies.value.forEach(e => {
      if (e.dead) return

      // 冰冻处理：定身，不移动不攻击，只递减计时器
      if (e.frozen) {
        e.frozenTimer -= dt
        if (e.frozenTimer <= 0) {
          e.frozen = false
        }
        return
      }

      // 朝玩家移动向量（始终计算，供攻击方向使用）
      const dx = player.x - e.x
      const dy = player.y - e.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      e.isMoving = true

      if (dist > 1) {
        // 方向判定
        if (Math.abs(dx) > Math.abs(dy)) {
          e.direction = dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT
        } else {
          e.direction = DIRECTION.FRONT
        }

        // 帧动画
        e.frameTimer += dt
        if (e.frameTimer >= FRAME_INTERVAL) {
          e.frameTimer -= FRAME_INTERVAL
          e.frame = (e.frame + 1) % FRAME_COUNT
        }
      }

      // 技能冷却计时（始终执行）
      e.skillTimer += dt

      // 远程攻击：受调试标志控制
      if (!debugFlags?.pauseEnemyAttack && e.hasRanged && e.skillRange > 0 && dist <= e.skillRange && e.skillTimer >= e.skillCooldown) {
        const ndx = dx / dist
        const ndy = dy / dist
        projectiles.value.push({
          type: 'enemyBullet',
          x: e.x, y: e.y,
          vx: ndx * ENEMY_PROJECTILE_SPEED,
          vy: ndy * ENEMY_PROJECTILE_SPEED,
          damage: ENEMY_PROJECTILE_DAMAGE,
          size: ENEMY_PROJECTILE_SIZE,
          owner: 'enemy',
        })
        e.skillTimer = 0
      }

      // 移动逻辑：受调试标志控制
      if (!debugFlags?.pauseEnemyMovement) {
        // - 近战型：始终追踪（冷却期间也追）
        // - 远程型：仅在射程外时追踪
        // - 无攻击型：始终追踪
        const shouldChase = e.hasMelee || (e.hasRanged && dist > e.skillRange) || (!e.hasMelee && !e.hasRanged)
        if (shouldChase && dist > 1) {
          e.x += (dx / dist) * e.speed
          e.y += (dy / dist) * e.speed
        }
      }

      // 受击闪白衰减
      if (e.hitFlash > 0) e.hitFlash--
    })
  }

  return { updateEnemies }
}
