/**
 * useEnemy — 敌人 AI 行为、寻路、攻击判定、状态管理
 * 管理所有敌人的逐帧更新逻辑（含 bomber/summoner/charger/shielder 四种独立 AI）
 */
import { reactive } from 'vue'
import {
  ENEMY_PROJECTILE_SPEED,
  ENEMY_PROJECTILE_DAMAGE,
  ENEMY_PROJECTILE_SIZE,
  FRAME_INTERVAL,
  FRAME_COUNT,
  DIRECTION,
  ENTITY_SIZE,
} from '../constants.js'
import { useDebug } from './useDebug.js'

/**
 * @param {import('vue').Ref<Array>} enemies - 敌人列表
 * @param {import('vue').UnwrapNestedRefs} player - 玩家状态
 * @param {import('vue').Ref<Array>} projectiles - 弹幕列表（敌人远程攻击写入）
 * @param {import('vue').UnwrapNestedRefs} gameState - 游戏状态
 * @param {object} mapUtils - { checkCollision }
 * @param {import('vue').Ref<Array>} battleLog - 战斗日志
 * @param {import('vue').Ref<Array>} effects - 视觉特效列表
 */
export function useEnemy(enemies, player, projectiles, gameState, mapUtils, battleLog, effects) {
  const { checkCollision } = mapUtils
  const { debugFlags } = useDebug()

  const log = (msg) => {
    battleLog.value.unshift({ time: Date.now(), text: msg })
    if (battleLog.value.length > 50) battleLog.value.pop()
  }

  /** 根据移动方向更新朝向 + 帧动画 */
  const updateDirection = (e, dx, dy, dist, dt) => {
    if (dist > 1) {
      if (Math.abs(dx) > Math.abs(dy)) {
        e.direction = dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT
      } else {
        e.direction = DIRECTION.FRONT
      }
      e.frameTimer = (e.frameTimer || 0) + dt
      if (e.frameTimer >= FRAME_INTERVAL) {
        e.frameTimer -= FRAME_INTERVAL
        e.frame = ((e.frame || 0) + 1) % FRAME_COUNT
      }
    }
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

      e.skillTimer += dt  // 始终计时

      // ══════════════════ 自爆怪 AI ══════════════════
      if (e.type === 'bomber') {
        const bomRange = e.bomberRange || 55
        if (!debugFlags?.pauseEnemyAttack && dist <= bomRange) {
          // 自爆！（受调试暂停 + 无敌/godMode 保护）
          const isInvincible = player.skills.some(s => s.id === 'invincible' && s.active)
          if (!debugFlags?.godMode && !isInvincible) {
            player.hp -= (e.attack || 30)
          }
          player.hitFlash = 10
          if (player.hp <= 0) { player.hp = 0; gameState.isDead = true; log('玩家阵亡！') }

          // AoE 伤害周围敌人（自爆 AoE 不受 godMode 影响，仅玩家免伤）
          enemies.value.forEach(other => {
            if (other === e || other.dead) return
            const od = Math.sqrt((other.x - e.x) ** 2 + (other.y - e.y) ** 2)
            if (od < bomRange + other.size / 2) {
              other.hp -= (e.attack || 30) * 0.6
              other.hitFlash = 6
              if (other.hp <= 0) {
                other.dead = true
                gameState.killCount++
              }
            }
          })

          // 爆炸特效
          effects.value.push({
            type: 'explosion',
            x: e.x, y: e.y,
            radius: bomRange,
            duration: 600, elapsed: 0,
            color: e.color,
            color2: e.color2,
          })

          player.exp += e.expReward
          gameState.killCount++
          e.dead = true
          log('敌人自爆！')
        } else if (dist > 1 && !debugFlags?.pauseEnemyMovement) {
          // 高速追踪
          e.x += (dx / dist) * e.speed
          e.y += (dy / dist) * e.speed
        }
        updateDirection(e, dx, dy, dist, dt)
        if (e.hitFlash > 0) e.hitFlash--
        return
      }

      // ══════════════════ 召唤师 AI ══════════════════
      if (e.type === 'summoner') {
        const comfortDist = (e.skillRange || 300) * 0.7

        if (!debugFlags?.pauseEnemyMovement) {
          if (dist < comfortDist && dist > 1) {
            // 玩家太近 → 远离
            e.x -= (dx / dist) * e.speed
            e.y -= (dy / dist) * e.speed
          } else if (dist > (e.skillRange || 300) && dist > 1) {
            // 玩家太远 → 靠近
            e.x += (dx / dist) * e.speed
            e.y += (dy / dist) * e.speed
          }
        }

        // 召唤小怪（受调试暂停攻击控制）
        if (!debugFlags?.pauseEnemyAttack) {
          e.summonTimer = (e.summonTimer || 0) + dt
          if (e.summonTimer >= (e.summonCooldown || 4000)) {
            e.summonTimer = 0
            const batchSize = e.summonCount || 2
            const maxMinions = e.summonMaxMinions || 6
            const sacrificeDmg = e.summonSacrificeDmg || 10
            const sacrificeRadius = e.summonSacrificeRadius || 50

            // 统计当前存活召唤物（按插入顺序 = 最老在数组最前）
            const aliveMinions = enemies.value.filter(m => m.summonedBy === e.eid && !m.dead)
            const excess = aliveMinions.length + batchSize - maxMinions

            // 上限溢出 → 销毁最老的召唤物（自爆腾位）
            if (excess > 0) {
              for (let i = 0; i < excess && i < aliveMinions.length; i++) {
                const old = aliveMinions[i]

                // 伤害玩家（受 godMode / 无敌保护，与自爆怪逻辑一致）
                const isInvincible = player.skills.some(s => s.id === 'invincible' && s.active)
                const pdist = Math.sqrt((player.x - old.x) ** 2 + (player.y - old.y) ** 2)
                if (pdist < sacrificeRadius + ENTITY_SIZE / 2) {
                  if (!debugFlags?.godMode && !isInvincible) {
                    player.hp -= sacrificeDmg
                  }
                  player.hitFlash = 6
                  if (player.hp <= 0) { player.hp = 0; gameState.isDead = true; log('玩家阵亡！') }
                }

                // AoE 伤害周围敌人（友方减免 40%，与自爆怪逻辑一致）
                enemies.value.forEach(other => {
                  if (other === old || other.dead) return
                  const od = Math.sqrt((other.x - old.x) ** 2 + (other.y - old.y) ** 2)
                  if (od < sacrificeRadius + other.size / 2) {
                    other.hp -= sacrificeDmg * 0.6
                    other.hitFlash = 4
                    if (other.hp <= 0) { other.dead = true; gameState.killCount++ }
                  }
                })

                // 自爆特效（紫色调，区别于正版橙色自爆怪）
                effects.value.push({
                  type: 'explosion',
                  variant: 'sacrifice',
                  x: old.x, y: old.y,
                  radius: sacrificeRadius,
                  duration: 550, elapsed: 0,
                  color: e.color, color2: e.color2,
                })
                old.dead = true
                gameState.killCount++
              }
            }

            // 计算剩余可生成数量
            const afterDestroy = enemies.value.filter(m => m.summonedBy === e.eid && !m.dead).length
            const toSpawn = Math.min(batchSize, maxMinions - afterDestroy)
            for (let i = 0; i < toSpawn; i++) {
              const angle = (Math.PI * 2 / toSpawn) * i + Math.random() * 0.5
              const spawnR = e.size + 20
              enemies.value.push(reactive({
                eid: Date.now() + Math.random(),
                type: 'melee',
                summonedBy: e.eid,
                x: e.x + Math.cos(angle) * spawnR,
                y: e.y + Math.sin(angle) * spawnR,
                hp: 30, maxHp: 30,
                speed: 2.0,
                size: ENTITY_SIZE * 0.75,
                attack: 8,
                attackRange: 45, skillRange: 0, skillCooldown: 800,
                color: e.color, color2: e.color2,
                expReward: 5,
                hasMelee: true, hasRanged: false,
                direction: DIRECTION.FRONT, frame: 0, frameTimer: 0,
                isMoving: true, dead: false, hitFlash: 0,
                frozen: false, frozenTimer: 0,
                skillTimer: Math.random() * 500,
                meleeAttacking: false, meleeCooldownTimer: 0,
              }))
            }
          }
        }

        updateDirection(e, dx, dy, dist, dt)
        if (e.hitFlash > 0) e.hitFlash--
        return
      }

      // ══════════════════ 冲锋者 AI（状态机） ══════════════════
      if (e.type === 'charger') {
        // 确保字段存在
        e.chargeTimer = (e.chargeTimer || 0)
        e.chargeState = e.chargeState || 'idle'
        e.chargeStateTimer = (e.chargeStateTimer || 0)
        e.chargeDirX = e.chargeDirX || 0
        e.chargeDirY = e.chargeDirY || 0
        e.normalSpeed = e.normalSpeed || e.speed

        switch (e.chargeState) {
          case 'idle': {
            // 缓慢追踪 + 累计冲锋计时（受调试暂停移动控制）
            if (!debugFlags?.pauseEnemyMovement && dist > 1) {
              e.x += (dx / dist) * e.speed
              e.y += (dy / dist) * e.speed
            }
            e.chargeTimer += dt
            if (e.chargeTimer >= (e.chargeCooldown || 3000) && dist < 400) {
              e.chargeState = 'winding'
              e.chargeStateTimer = 0
              if (dist > 1) {
                e.chargeDirX = dx / dist
                e.chargeDirY = dy / dist
              }
              e.speed = 0
            }
            updateDirection(e, dx, dy, dist, dt)
            break
          }
          case 'winding': {
            e.chargeStateTimer += dt
            if (e.chargeStateTimer >= (e.windUpDuration || 500)) {
              e.chargeState = 'charging'
              e.chargeStateTimer = 0
              e.speed = e.chargeSpeed || 12
            }
            break
          }
          case 'charging': {
            // 高速直线冲刺（受调试暂停移动控制）
            if (!debugFlags?.pauseEnemyMovement) {
              e.x += e.chargeDirX * e.speed
              e.y += e.chargeDirY * e.speed
            }
            e.chargeStateTimer += dt
            e.direction = e.chargeDirX >= 0 ? DIRECTION.RIGHT : DIRECTION.LEFT

            // 碰撞玩家判定（受调试暂停攻击 + 无敌/godMode 保护）
            if (!debugFlags?.pauseEnemyAttack) {
              const cdx = player.x - e.x
              const cdy = player.y - e.y
              const cdist = Math.sqrt(cdx * cdx + cdy * cdy)
              if (cdist <= (e.attackRange || 45) + ENTITY_SIZE / 2) {
                const isInvincible = player.skills.some(s => s.id === 'invincible' && s.active)
                if (!debugFlags?.godMode && !isInvincible) {
                  player.hp -= (e.attack || 25)
                }
                player.hitFlash = 8
                // 击退
                if (cdist > 0) {
                  player.x += (cdx / cdist) * 40
                  player.y += (cdy / cdist) * 40
                }
                if (player.hp <= 0) { player.hp = 0; gameState.isDead = true; log('玩家阵亡！') }
                log('被冲锋者撞击！')
                e.chargeState = 'recovery'
                e.chargeStateTimer = 0
                e.speed = 0
              }
            }
            // 冲锋持续时间到 → 无论是否碰撞都进入恢复（不受暂停影响）
            if (e.chargeState !== 'recovery' && e.chargeStateTimer >= (e.chargeDuration || 400)) {
              e.chargeState = 'recovery'
              e.chargeStateTimer = 0
              e.speed = 0
            }
            break
          }
          case 'recovery': {
            e.chargeStateTimer += dt
            if (e.chargeStateTimer >= (e.recoveryDuration || 800)) {
              e.chargeState = 'idle'
              e.chargeTimer = 0
              e.speed = e.normalSpeed
            }
            updateDirection(e, dx, dy, dist, dt)
            break
          }
        }
        if (e.hitFlash > 0) e.hitFlash--
        return
      }

      // ══════════════════ 护盾兵 AI ══════════════════
      if (e.type === 'shielder') {
        // 寻找最近的非护盾兵、非死亡友方
        let bestAlly = null
        let bestAllyDist = e.shieldAuraRange || 120
        enemies.value.forEach(other => {
          if (other === e || other.dead || other.type === 'shielder') return
          const od = Math.sqrt((other.x - e.x) ** 2 + (other.y - e.y) ** 2)
          if (od < bestAllyDist) {
            bestAllyDist = od
            bestAlly = other
          }
        })

        if (bestAlly) {
          // 为友方施加保护标记
          bestAlly.shieldedBy = e.eid
          e.shieldedAllyId = bestAlly.eid

          // 保持在友方附近（受调试暂停移动控制）
          if (!debugFlags?.pauseEnemyMovement) {
            const adx = bestAlly.x - e.x
            const ady = bestAlly.y - e.y
            const adist = Math.sqrt(adx * adx + ady * ady)
            if (adist > 30) {
              e.x += (adx / adist) * e.speed
              e.y += (ady / adist) * e.speed
            }
          }
        } else {
          // 无友方 → 自身追踪玩家（受调试暂停移动控制）
          e.shieldedAllyId = null
          if (!debugFlags?.pauseEnemyMovement && dist > 1) {
            e.x += (dx / dist) * e.speed
            e.y += (dy / dist) * e.speed
          }
        }

        updateDirection(e, dx, dy, dist, dt)
        if (e.hitFlash > 0) e.hitFlash--
        return
      }

      // ══════════════════ 通用 AI（melee / ranged / hybrid）══════════════════

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

      // 近战攻击：受调试标志控制
      if (!debugFlags?.pauseEnemyAttack && e.hasMelee) {
        if (e.meleeCooldownTimer > 0) {
          e.meleeCooldownTimer -= dt
        }
        if (dist <= e.attackRange && e.meleeCooldownTimer <= 0) {
          const isInvincible = player.skills.some(s => s.id === 'invincible' && s.active)
          if (!debugFlags?.godMode && !isInvincible) {
            player.hp -= e.attack
          }
          player.hitFlash = 6
          e.meleeCooldownTimer = e.skillCooldown
          log(`受到 ${e.type} 敌人 ${e.attack} 点近战伤害`)
          if (player.hp <= 0) {
            player.hp = 0
            gameState.isDead = true
            log('玩家阵亡！')
          }
        }
      }

      // 移动逻辑：受调试标志控制
      if (!debugFlags?.pauseEnemyMovement) {
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
