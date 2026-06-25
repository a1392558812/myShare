/**
 * useGameLoop — 回合控制、游戏状态机（准备 / 进行中 / 结束）
 * 管理主循环调度、弹幕/特效生命周期、技能冷却
 */
import { ENTITY_SIZE } from '../constants.js'
import { useDebug } from './useDebug.js'

/**
 * @param {import('vue').UnwrapNestedRefs} player - 玩家状态
 * @param {import('vue').UnwrapNestedRefs} gameState - 游戏全局状态
 * @param {import('vue').Ref<Array>} enemies - 敌人列表
 * @param {import('vue').Ref<Array>} projectiles - 弹幕列表
 * @param {import('vue').Ref<Array>} effects - 特效列表
 * @param {import('vue').Ref<HTMLCanvasElement|null>} gameCanvas - 画布引用
 * @param {import('vue').UnwrapNestedRefs} camera - 摄像机
 * @param {object} updaters - { updatePlayer, updateEnemies, handleSpawning, cleanupDead, damageEnemy }
 * @param {object} mapUtils - { toScreen, checkCollision, updateCamera }
 * @param {object} options - { onRender }
 */
export function useGameLoop(
  player, gameState, enemies, projectiles, effects,
  gameCanvas, camera,
  updaters, mapUtils, options,
) {
  const { updatePlayer, updateEnemies, handleSpawning, cleanupDead, damageEnemy } = updaters
  const { updateCamera } = mapUtils
  const { onRender } = options || {}
  const { debugFlags } = useDebug()

  let animFrameId = null
  let lastTimestamp = 0

  // ─── 弹幕更新 ───

  const updateProjectiles = (dt) => {
    projectiles.value.forEach(p => {
      // 追踪弹幕持续修正方向
      if (p.type === 'autoSeek' && p.targetEnemy && !p.targetEnemy.dead) {
        const tdx = p.targetEnemy.x - p.x
        const tdy = p.targetEnemy.y - p.y
        const tdist = Math.sqrt(tdx * tdx + tdy * tdy)
        if (tdist > 1) {
          p.vx += (tdx / tdist) * 0.5
          p.vy += (tdy / tdist) * 0.5
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
          if (speed > p.seekSpeed) {
            p.vx = (p.vx / speed) * p.seekSpeed
            p.vy = (p.vy / speed) * p.seekSpeed
          }
        }
      }

      p.x += p.vx
      p.y += p.vy

      // 碰撞检测
      if (p.owner === 'player') {
        enemies.value.forEach(e => {
          if (e.dead) return
          if (checkCollisionLocal(p.x, p.y, p.size, e.x, e.y, e.size)) {
            damageEnemy(e, p.damage)
            p.hit = true
          }
        })
      } else if (p.owner === 'enemy') {
        if (checkCollisionLocal(p.x, p.y, p.size, player.x, player.y, ENTITY_SIZE)) {
          const isSkillInvincible = player.skills.some(s => s.id === 'invincible' && s.active)
          if (!debugFlags.godMode && !isSkillInvincible) {
            player.hp -= p.damage
            if (player.hp <= 0) {
              player.hp = 0
              gameState.isDead = true
            }
          }
          p.hit = true
        }
      }

      // 超出范围销毁
      const maxDist = 800
      const pdx = p.x - player.x
      const pdy = p.y - player.y
      if (Math.sqrt(pdx * pdx + pdy * pdy) > maxDist) {
        p.hit = true
      }
    })

    projectiles.value = projectiles.value.filter(p => !p.hit)
  }

  /** 碰撞检测（本地副本，不依赖 mapUtils 避免循环依赖） */
  const checkCollisionLocal = (x1, y1, s1, x2, y2, s2) => {
    const dx = x1 - x2
    const dy = y1 - y2
    return Math.sqrt(dx * dx + dy * dy) < (s1 + s2) / 2 * 0.8
  }

  // ─── 特效更新 ───

  const updateEffects = (dt) => {
    effects.value.forEach(e => { e.elapsed += dt })
    effects.value = effects.value.filter(e => e.elapsed < e.duration)
  }

  // ─── 技能冷却更新 ───

  const updateSkillCooldowns = (dt) => {
    player.skills.forEach(sk => {
      if (sk.remainingCooldown > 0) {
        sk.remainingCooldown = Math.max(0, sk.remainingCooldown - dt)
      }
    })
  }

  // ─── 主循环 ───

  const gameLoop = (timestamp) => {
    if (!lastTimestamp) lastTimestamp = timestamp
    const dt = timestamp - lastTimestamp
    lastTimestamp = timestamp

    if (!gameState.isDead && !gameState.levelUpPending) {
      gameState.gameTime += dt
      updatePlayer(dt)
      updateCamera(player.x, player.y)
      updateEnemies(dt)
      updateProjectiles(dt)
      updateEffects(dt)
      updateSkillCooldowns(dt)
      handleSpawning(dt)
      cleanupDead()
    }

    if (onRender) onRender()

    animFrameId = requestAnimationFrame(gameLoop)
  }

  // ─── 启停 ───

  const startLoop = () => {
    lastTimestamp = 0
    animFrameId = requestAnimationFrame(gameLoop)
  }

  const stopLoop = () => {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
  }

  return {
    startLoop,
    stopLoop,
    updateProjectiles,
    updateEffects,
    updateSkillCooldowns,
  }
}
