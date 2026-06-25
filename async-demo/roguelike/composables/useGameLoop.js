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
 * @param {import('vue').Ref<Array>} lootDrops - 掉落物列表
 * @param {import('vue').Ref<Array>} magicCircles - 魔法阵火雨实例列表
 * @param {import('vue').Ref<HTMLCanvasElement|null>} gameCanvas - 画布引用
 * @param {import('vue').UnwrapNestedRefs} camera - 摄像机
 * @param {object} updaters - { updatePlayer, updateEnemies, handleSpawning, cleanupDead, damageEnemy }
 * @param {object} mapUtils - { toScreen, checkCollision, updateCamera }
 * @param {object} options - { onRender }
 */
export function useGameLoop(
  player, gameState, enemies, projectiles, effects, lootDrops, magicCircles,
  gameCanvas, camera,
  updaters, mapUtils, options,
  groundZones, // 新增：地面毒区引用
) {
  const { updatePlayer, updateEnemies, handleSpawning, cleanupDead, damageEnemy } = updaters
  const { updateCamera } = mapUtils
  const { onRender } = options || {}
  const { debugFlags } = useDebug()

  // 存储 groundZones 引用供内部函数使用
  const groundZonesRef = groundZones

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

      // ═══ 毒弹特殊处理 ═══
      if (p.type === 'venomBolt') {
        p.flightTime = (p.flightTime || 0) + dt
        // 检查是否应该着陆（超时或命中玩家）
        let shouldLand = false
        if (p.flightTime >= (p.maxFlightTime || 2000)) {
          shouldLand = true
        }
        if (!shouldLand && checkCollisionLocal(p.x, p.y, p.size, player.x, player.y, ENTITY_SIZE)) {
          shouldLand = true
        }

        if (shouldLand) {
          // 创建预警圈特效
          effects.value.push({
            type: 'venomWarn',
            x: p.x,
            y: p.y,
            radius: p.zoneRadius || 50,
            duration: p.warnDuration || 800,
            elapsed: 0,
            // 地面毒区参数（预警结束后创建）
            zoneDuration: p.zoneDuration,
            zoneDamage: p.zoneDamage,
            zoneRadius: p.zoneRadius,
            ownerEid: p.ownerEid,
            venomMaxZones: p.venomMaxZones,
          })
          p.hit = true
        }
      } else {
        // 普通投射物碰撞检测
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

    // ═══ 处理毒液预警：预警结束后创建地面毒区 ═══
    if (groundZonesRef) {
      effects.value.forEach(e => {
        if (e.type === 'venomWarn' && e.elapsed >= e.duration) {
          // 创建地面毒区
          const zone = {
            x: e.x,
            y: e.y,
            radius: e.zoneRadius || 50,
            duration: e.zoneDuration || 5000,
            elapsed: 0,
            damagePerTick: e.zoneDamage || 2,
            tickInterval: 1000,
            lastTickTime: 0,
            ownerEid: e.ownerEid,
          }
          groundZonesRef.value.push(zone)

          // 限制每个毒虫的最大毒区数
          const maxZ = e.venomMaxZones || 3
          const myZones = groundZonesRef.value.filter(z => z.ownerEid === e.ownerEid)
          if (myZones.length > maxZ) {
            // 移除最老的毒区
            const oldestIdx = groundZonesRef.value.indexOf(myZones[0])
            if (oldestIdx !== -1) {
              groundZonesRef.value.splice(oldestIdx, 1)
            }
          }
        }
      })
    }

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

  // ─── 掉落物生命周期 ───

  const updateLoot = () => {
    const now = gameState.gameTime
    lootDrops.value = lootDrops.value.filter(d => now - d.spawnedAt < d.lifetime)
  }

  // ─── 魔法阵火雨更新 ───

  const updateMagicCircles = (dt) => {
    for (let i = magicCircles.value.length - 1; i >= 0; i--) {
      const circle = magicCircles.value[i]
      circle.elapsed += dt

      // 过期移除
      if (circle.elapsed >= circle.duration) {
        magicCircles.value.splice(i, 1)
        continue
      }

      // 灼烧伤害：每 burnTickInterval ms 对范围内敌人造成一次持续伤害
      circle.burnTickTimer += dt
      if (circle.burnTickTimer >= circle.burnTickInterval) {
        circle.burnTickTimer -= circle.burnTickInterval
        enemies.value.forEach(e => {
          if (e.dead) return
          const dx = e.x - circle.x
          const dy = e.y - circle.y
          if (Math.sqrt(dx * dx + dy * dy) <= circle.radius + e.size / 2) {
            damageEnemy(e, circle.burnDamage)
          }
        })
      }

      // 火球坠落：每 fireballInterval ms 在半径内随机位置生成一波火球
      circle.fireballTimer += dt
      if (circle.fireballTimer >= circle.fireballInterval) {
        circle.fireballTimer -= circle.fireballInterval
        for (let j = 0; j < circle.fireballCount; j++) {
          // 随机角度 + 随机距圆心距离（限制在半径内）
          const angleR = Math.random() * Math.PI * 2
          const distR = Math.random() * circle.radius
          const fx = circle.x + Math.cos(angleR) * distR
          const fy = circle.y + Math.sin(angleR) * distR

          // 火球 AoE 伤害
          const fireR = circle.fireballRadius || 25
          enemies.value.forEach(e => {
            if (e.dead) return
            const dx = e.x - fx
            const dy = e.y - fy
            if (Math.sqrt(dx * dx + dy * dy) <= fireR + e.size / 2) {
              damageEnemy(e, circle.fireballDamage)
            }
          })

          // 火球视觉特效
          effects.value.push({
            type: 'magicFireball',
            x: fx, y: fy,
            radius: fireR,
            duration: 600,
            elapsed: 0,
          })
        }
      }
    }
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
      updateLoot()
      updateMagicCircles(dt)
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
