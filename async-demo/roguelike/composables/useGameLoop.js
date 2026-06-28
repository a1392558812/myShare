import { ENTITY_SIZE } from '../constants.js'
import { useDebug } from './useDebug.js'


export function useGameLoop(
  player, gameState, enemies, projectiles, effects, lootDrops, magicCircles,
  gameCanvas, camera,
  updaters, mapUtils, options,
  groundZones,
  eventUtils = null,
) {
  const { updatePlayer, updateEnemies, handleSpawning, cleanupDead, damageEnemy } = updaters
  const { updateCamera } = mapUtils
  const { onRender, tickBossSpawn, updateBoss, getDtMultiplier } = options || {}
  const { debugFlags } = useDebug()
  const groundZonesRef = groundZones

  let deathZoneSlow = 0

  let animFrameId = null
  let lastTimestamp = 0


  const updateProjectiles = (dt) => {
    projectiles.value.forEach(p => {
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

      if (p.isTracking) {
        const tdx = player.x - p.x
        const tdy = player.y - p.y
        const tdist = Math.sqrt(tdx * tdx + tdy * tdy)
        if (tdist > 1) {
          const strength = p.trackStrength || 0.3
          p.vx += (tdx / tdist) * strength
          p.vy += (tdy / tdist) * strength
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
          const maxSpd = p.maxSpeed || 5
          if (speed > maxSpd) {
            p.vx = (p.vx / speed) * maxSpd
            p.vy = (p.vy / speed) * maxSpd
          }
        }
      }

      p.x += p.vx
      p.y += p.vy

      if (p.type === 'venomBolt') {
        p.flightTime = (p.flightTime || 0) + dt
        let shouldLand = false
        if (p.flightTime >= (p.maxFlightTime || 2000)) {
          shouldLand = true
        }
        if (!shouldLand && checkCollisionLocal(p.x, p.y, p.size, player.x, player.y, ENTITY_SIZE)) {
          shouldLand = true
        }

        if (shouldLand) {
          effects.value.push({
            type: 'venomWarn',
            x: p.x,
            y: p.y,
            radius: p.zoneRadius || 50,
            duration: p.warnDuration || 800,
            elapsed: 0,
            zoneDuration: p.zoneDuration,
            zoneDamage: p.zoneDamage,
            zoneRadius: p.zoneRadius,
            ownerEid: p.ownerEid,
            venomMaxZones: p.venomMaxZones,
          })
          p.hit = true
        }
      } else {
        if (p.owner === 'player') {
          enemies.value.forEach(e => {
            if (e.dead) return
            if (p.penetratedEnemies && p.penetratedEnemies.includes(e.eid)) return
            if (checkCollisionLocal(p.x, p.y, p.size, e.x, e.y, e.size)) {
              damageEnemy(e, p.damage)
              if (p.penetration !== undefined) {
                if (!p.penetratedEnemies) p.penetratedEnemies = []
                p.penetratedEnemies.push(e.eid)
                p.penetration -= 1
                if (p.penetration < 0) p.hit = true
              } else {
                p.hit = true
              }
            }
          })
        } else if (p.owner === 'enemy') {
          if (checkCollisionLocal(p.x, p.y, p.size, player.x, player.y, ENTITY_SIZE)) {
            if (eventUtils?.tryDamagePlayer) {
              eventUtils.tryDamagePlayer(p.damage)
            } else {
              const isSkillInvincible = player.skills.some(s => s.id === 'invincible' && s.active)
              if (!debugFlags.godMode && !isSkillInvincible) {
                player.hp -= p.damage
                if (player.hp <= 0) {
                  player.hp = 0
                  gameState.isDead = true
                }
              }
            }
            p.hit = true
          }
        }
      }

      const maxDist = 800
      const pdx = p.x - player.x
      const pdy = p.y - player.y
      if (Math.sqrt(pdx * pdx + pdy * pdy) > maxDist) {
        p.hit = true
      }
      if (p.type === 'fireBarrage') {
        p.traveled = (p.traveled || 0) + Math.sqrt(p.vx ** 2 + p.vy ** 2)
        if (p.traveled >= (p.range || 600)) {
          p.hit = true
        }
      }
    })

    projectiles.value = projectiles.value.filter(p => !p.hit)
  }

  
  const checkCollisionLocal = (x1, y1, s1, x2, y2, s2) => {
    const dx = x1 - x2
    const dy = y1 - y2
    return Math.sqrt(dx * dx + dy * dy) < (s1 + s2) / 2 * 0.8
  }


  const updateEffects = (dt) => {
    effects.value.forEach(e => { e.elapsed += dt })

    effects.value.forEach(e => {
      if (e.type === 'firePillarWarn' && !e._damageTriggered && e.elapsed >= e.duration - 50) {
        e._damageTriggered = true
        if (e.playerRef) {
          const pdist = Math.sqrt((e.playerRef.x - e.x) ** 2 + (e.playerRef.y - e.y) ** 2)
          if (pdist <= e.radius + ENTITY_SIZE / 2) {
            if (eventUtils?.tryDamagePlayer) {
              eventUtils.tryDamagePlayer(e.damage || 30)
            }
          }
        }
      }
    })

    effects.value.forEach(e => {
      if (e.type === 'shadowWave' && e.playerRef) {
        const currentRadius = e.radius + (e.elapsed / e.duration) * (e.maxRadius - e.radius)
        const pdist = Math.sqrt((e.playerRef.x - e.x) ** 2 + (e.playerRef.y - e.y) ** 2)
        const hitBand = 12
        if (!e._lastDamageId || e._lastDamageId !== Math.floor((currentRadius - e.radius) / hitBand)) {
          e._lastDamageId = Math.floor((currentRadius - e.radius) / hitBand)
          if (Math.abs(pdist - currentRadius) < hitBand && e.elapsed < e.duration * 0.9) {
            if (eventUtils?.tryDamagePlayer) {
              eventUtils.tryDamagePlayer(e.damage || 10)
            }
          }
        }
      }
    })

    if (groundZonesRef) {
      effects.value.forEach(e => {
        if (e.type === 'venomWarn' && e.elapsed >= e.duration) {
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

          const maxZ = e.venomMaxZones || 3
          const myZones = groundZonesRef.value.filter(z => z.ownerEid === e.ownerEid)
          if (myZones.length > maxZ) {
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


  const updateSkillCooldowns = (dt) => {
    player.skills.forEach(sk => {
      if (sk.remainingCooldown > 0) {
        sk.remainingCooldown = Math.max(0, sk.remainingCooldown - dt)
      }
    })
  }


  const updateLoot = () => {
    const now = gameState.gameTime
    lootDrops.value = lootDrops.value.filter(d => now - d.spawnedAt < d.lifetime)
  }


  const updateMagicCircles = (dt) => {
    for (let i = magicCircles.value.length - 1; i >= 0; i--) {
      const circle = magicCircles.value[i]
      circle.elapsed += dt

      if (circle.elapsed >= circle.duration) {
        magicCircles.value.splice(i, 1)
        continue
      }

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

      circle.fireballTimer += dt
      if (circle.fireballTimer >= circle.fireballInterval) {
        circle.fireballTimer -= circle.fireballInterval
        for (let j = 0; j < circle.fireballCount; j++) {
          const angleR = Math.random() * Math.PI * 2
          const distR = Math.random() * circle.radius
          const fx = circle.x + Math.cos(angleR) * distR
          const fy = circle.y + Math.sin(angleR) * distR

          const fireR = circle.fireballRadius || 25
          enemies.value.forEach(e => {
            if (e.dead) return
            const dx = e.x - fx
            const dy = e.y - fy
            if (Math.sqrt(dx * dx + dy * dy) <= fireR + e.size / 2) {
              damageEnemy(e, circle.fireballDamage)
            }
          })

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


  const gameLoop = (timestamp) => {
    if (!lastTimestamp) lastTimestamp = timestamp
    const dt = (timestamp - lastTimestamp) * (getDtMultiplier ? getDtMultiplier() : 1)
    lastTimestamp = timestamp

    if (!gameState.isDead && !gameState.levelUpPending && !gameState.stelePending && !gameState.paused) {
      gameState.gameTime += dt
      updatePlayer(dt)
      updateCamera(player.x, player.y)

      if (tickBossSpawn) tickBossSpawn(dt)
      if (updateBoss) updateBoss(dt)

      updateEnemies(dt)
      updateProjectiles(dt)
      updateEffects(dt)
      updateSkillCooldowns(dt)
      handleSpawning(dt)
      cleanupDead()
      updateLoot()
      updateMagicCircles(dt)

      if (eventUtils) {
        if (eventUtils.tickBuffs) eventUtils.tickBuffs(dt)
        if (eventUtils.tickEvents) eventUtils.tickEvents(dt)
        if (eventUtils.tickDeathZones) {
          const zoneResult = eventUtils.tickDeathZones(dt)
          deathZoneSlow = zoneResult?.inZoneSlow || 0
        }
      }
    }

    if (onRender) onRender()

    animFrameId = requestAnimationFrame(gameLoop)
  }


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
    getDeathZoneSlow: () => deathZoneSlow,
  }
}
