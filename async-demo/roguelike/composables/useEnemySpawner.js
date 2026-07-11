
import {
  getEnemyTypeTable,
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
import { pushBattleLog } from './useBattleLog.js'

const typeInitializers = {
  bomber(enemyData, attrs) {
    enemyData.bomberRange = attrs.bomberRange || 55
  },

  summoner(enemyData, attrs) {
    enemyData.summonTimer = Math.random() * 2000
    enemyData.summonCooldown = attrs.summonCooldown || 4000
    enemyData.summonCount = attrs.summonCount || 2
    enemyData.summonMaxMinions = attrs.summonMaxMinions || 6
    enemyData.summonSacrificeDmg = attrs.summonSacrificeDmg || 10
    enemyData.summonSacrificeRadius = attrs.summonSacrificeRadius || 50
    enemyData.summonMinionHp = attrs.summonMinionHp || 30
    enemyData.summonMinionAttack = attrs.summonMinionAttack || 8
    enemyData.summonMinionSpeed = attrs.summonMinionSpeed || 2.0
    enemyData.summonMinionSizeRatio = attrs.summonMinionSizeRatio || 0.75
    enemyData.summonMinionAttackRange = attrs.summonMinionAttackRange || 45
    enemyData.summonMinionCooldown = attrs.summonMinionCooldown || 800
    enemyData.boltTimer = 0
    enemyData.boltSpeed = attrs.boltSpeed || 3.5
    enemyData.boltDamage = attrs.boltDamage || 6
    enemyData.boltSize = attrs.boltSize || 7
    enemyData.boltCooldown = attrs.boltCooldown || 1300
  },

  charger(enemyData, attrs, floatSpeed) {
    enemyData.chargeTimer = Math.random() * 2000
    enemyData.chargeCooldown = attrs.chargeCooldown || 3000
    enemyData.chargeState = 'idle'
    enemyData.chargeStateTimer = 0
    enemyData.chargeDirX = 0
    enemyData.chargeDirY = 0
    enemyData.chargeSpeed = attrs.chargeSpeed || 12
    enemyData.normalSpeed = floatSpeed
    enemyData.windUpDuration = attrs.windUpDuration || 500
    enemyData.chargeDuration = attrs.chargeDuration || 400
    enemyData.recoveryDuration = attrs.recoveryDuration || 800
  },

  shielder(enemyData, attrs) {
    enemyData.shieldAuraRange = attrs.shieldAuraRange || 120
    enemyData.shieldReduction = attrs.shieldReduction || 0.4
    enemyData.shieldEvasion = attrs.shieldEvasion || 0.15
    enemyData.shieldedAllyId = null
  },

  melee(enemyData, attrs) {
    enemyData.maxDamageRatio = attrs.maxDamageRatio
  },

  elitePriest(enemyData, attrs, playerLevel) {
    enemyData.priestHealTimer = 0
    enemyData.priestHealAmount = Math.round(
      (attrs.priestHealAmount || 8) +
      Math.max(0, playerLevel - 7) * (attrs.priestHealGrowth || 0)
    )
    enemyData.priestHealInterval = attrs.priestHealInterval || 2000
    enemyData.priestAuraRange = attrs.priestAuraRange || 130
  },

  eliteVenom(enemyData, attrs, playerLevel) {
    enemyData.venomBoltTimer = 0
    enemyData.venomBoltDamage = Math.round(
      (attrs.attack || 10) +
      Math.max(0, playerLevel - 7) * (attrs.venomZoneDamageGrowth || 0.5)
    )
    enemyData.venomWarnDuration = attrs.venomWarnDuration || 800
    enemyData.venomZoneDuration = attrs.venomZoneDuration || 5000
    enemyData.venomZoneDamage =
      (attrs.venomZoneDamage || 2) +
      Math.max(0, playerLevel - 7) * (attrs.venomZoneDamageGrowth || 0.5)
    enemyData.venomZoneRadius = attrs.venomZoneRadius || 50
    enemyData.venomBoltSpeed = attrs.venomBoltSpeed || 4
    enemyData.venomBoltSize = attrs.venomBoltSize || 8
    enemyData.venomMaxZones = attrs.venomMaxZones || 3
    enemyData.venomZones = []
  },

  eliteRoadhog(enemyData, attrs) {
    enemyData.hookState = 'normal'
    enemyData.hookTimer = Math.random() * 3000
    enemyData.hookCooldown = attrs.hookCooldown || 8000
    enemyData.hookRange = attrs.hookRange || 350
    enemyData.hookSpeed = attrs.hookSpeed || 10
    enemyData.hookHitRadius = attrs.hookHitRadius || 35
    enemyData.hookReleaseDist = attrs.hookReleaseDist || 50
    enemyData.hookRetractSpeed = attrs.hookRetractSpeed || 12
    enemyData.hookMaxFlightTime = attrs.hookMaxFlightTime || 2000
    enemyData.hookDirX = 0
    enemyData.hookDirY = 0
    enemyData.hookX = 0
    enemyData.hookY = 0
    enemyData.hookDistTraveled = 0
  },

  eliteThrower(enemyData, attrs, playerLevel) {
    enemyData.throwState = 'normal'
    enemyData.throwTimer = Math.random() * 5000
    enemyData.throwCooldown = attrs.throwCooldown || 10000
    enemyData.throwRange = attrs.throwRange || 400
    enemyData.throwSpeed = attrs.throwSpeed || 8
    enemyData.throwDamage = Math.round(
      (attrs.throwDamage || 15) +
      Math.max(0, playerLevel - 12) * (attrs.throwDamageGrowth || 2)
    )
    enemyData.grabRadius = attrs.grabRadius || 80
    enemyData.hitRadius = attrs.hitRadius || 40
    enemyData.grabPrepDuration = attrs.grabPrepDuration || 400
    enemyData.thrownLandInvincibleTime = attrs.thrownLandInvincibleTime || 1500
    enemyData.throwPrepTimer = 0
    enemyData.throwTargetEid = null
    enemyData.throwDirX = 0
    enemyData.throwDirY = 0
    enemyData.throwTargetX = 0
    enemyData.throwTargetY = 0
    enemyData.throwDistTraveled = 0
    enemyData.throwFlightDist = 0
  },

  eliteHacker(enemyData, attrs, playerLevel) {
    enemyData.stealthOpacity = 0.08
    enemyData.revealTimer = 0
    enemyData.rayActive = false
    enemyData.rayDamageTimer = 0
    enemyData.rayTargetX = 0
    enemyData.rayTargetY = 0
    enemyData.stealthCooldownTimer = Math.random() * 6000
    enemyData.stealthDuration = attrs.stealthDuration || 8000
    enemyData.stealthCooldown = attrs.stealthCooldown || 12000
    enemyData.warnRange = attrs.warnRange || 300
    enemyData.attackRange = attrs.attackRange || 150
    enemyData.rayInterval = attrs.rayInterval || 1000
    enemyData.rayDamage = Math.round(
      (attrs.rayDamage || 3) +
      Math.max(0, playerLevel - 10) * (attrs.rayDamageGrowth || 0.5)
    )
    enemyData.hitRevealDuration = attrs.hitRevealDuration || 1500
  },
}

export function useEnemySpawner(enemies, gameState, camera, gameCanvas, playerRefs, battleLog, bossSpawnState) {
  const { enemyDebug } = useDebug()
  const log = (msg) => pushBattleLog(battleLog, msg)

  const createEnemy = (chosenType, x, y) => {
    const attrs = chosenType.attrs
    const playerLevel = playerRefs?.player?.level ?? 1
    const isElite = !!attrs.eliteTier

    let scaledHp, scaledAttack
    if (isElite) {
      const growth = Math.max(0, playerLevel - 7)
      scaledHp = Math.round(attrs.maxHp + growth * (attrs.hpGrowth || 0))
      scaledAttack = Math.round(attrs.attack + growth * (attrs.attackGrowth || 0))
    } else {
      scaledHp = scaleEnemyStat(playerLevel, attrs.maxHp, ENEMY_HP_SCALE_RATE)
      scaledAttack = scaleEnemyStat(playerLevel, attrs.attack, ENEMY_ATTACK_SCALE_RATE)
    }

    const floatHp = Math.round(scaledHp * (0.85 + Math.random() * 0.3))
    const floatSpeed = attrs.speed * (0.9 + Math.random() * 0.2)
    const floatSize = attrs.size * (0.9 + Math.random() * 0.3)

    let finalExpReward = attrs.expReward || 0
    if (isElite) {
      const mult = attrs.eliteTier === 'rare' ? 2.5 : 1.5
      finalExpReward = Math.round((attrs.expRewardBase || 0) * mult)
    }

    const enemyData = {
      eid: Date.now() + Math.random(),
      type: chosenType.type,
      eliteTier: attrs.eliteTier || null,
      x,
      y,
      hp: floatHp,
      maxHp: floatHp,
      speed: floatSpeed,
      size: floatSize,
      attack: scaledAttack,
      attackRange: attrs.attackRange,
      skillRange: attrs.skillRange,
      skillCooldown: attrs.skillCooldown,
      color: attrs.color,
      color2: attrs.color2,
      expReward: finalExpReward,
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
    }

    const initializer = typeInitializers[chosenType.type]
    if (initializer) {
      initializer(enemyData, attrs, playerLevel, floatSpeed)
    }

    return enemyData
  }

  const spawnEnemy = () => {
    const canvas = gameCanvas.value
    if (!canvas) return

    const playerLevel = playerRefs?.player?.level ?? 1
    const typeTable = getEnemyTypeTable(playerLevel)

    const totalWeight = typeTable.reduce((sum, t) => sum + t.weight, 0)
    let rand = Math.random() * totalWeight
    let chosenType = typeTable[0]
    for (const t of typeTable) {
      rand -= t.weight
      if (rand <= 0) {
        chosenType = t
        break
      }
    }

    const size = canvas.getCanvasSize ? canvas.getCanvasSize() : { width: 800, height: 600 }
    if (!size.width || !size.height) return

    const side = Math.floor(Math.random() * 4)
    let spawnX, spawnY
    const hw = size.width / 2 + SPAWN_MARGIN
    const hh = size.height / 2 + SPAWN_MARGIN

    switch (side) {
      case 0:
        spawnX = camera.x + (Math.random() - 0.5) * 2 * hw
        spawnY = camera.y - hh
        break
      case 1:
        spawnX = camera.x + hw
        spawnY = camera.y + (Math.random() - 0.5) * 2 * hh
        break
      case 2:
        spawnX = camera.x + (Math.random() - 0.5) * 2 * hw
        spawnY = camera.y + hh
        break
      case 3:
        spawnX = camera.x - hw
        spawnY = camera.y + (Math.random() - 0.5) * 2 * hh
        break
    }

    enemies.value.push(createEnemy(chosenType, spawnX, spawnY))
  }

  const debugSpawnEnemies = (type, count, nearPlayer = true) => {
    const typeEntry = ENEMY_TYPE_TABLE.find((t) => t.type === type)
    if (!typeEntry) return

    const canvas = gameCanvas.value
    const size = canvas?.getCanvasSize ? canvas.getCanvasSize() : { width: 800, height: 600 }

    for (let i = 0; i < count; i++) {
      let sx, sy

      if (nearPlayer) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.6
        const dist = 150 + Math.random() * 150
        const playerX = playerRefs?.player?.x ?? 0
        const playerY = playerRefs?.player?.y ?? 0
        sx = playerX + Math.cos(angle) * dist
        sy = playerY + Math.sin(angle) * dist
      } else {
        const side = Math.floor(Math.random() * 4)
        const hw = size.width / 2 + SPAWN_MARGIN
        const hh = size.height / 2 + SPAWN_MARGIN
        switch (side) {
          case 0:
            sx = camera.x + (Math.random() - 0.5) * 2 * hw
            sy = camera.y - hh
            break
          case 1:
            sx = camera.x + hw
            sy = camera.y + (Math.random() - 0.5) * 2 * hh
            break
          case 2:
            sx = camera.x + (Math.random() - 0.5) * 2 * hw
            sy = camera.y + hh
            break
          case 3:
            sx = camera.x - hw
            sy = camera.y + (Math.random() - 0.5) * 2 * hh
            break
        }
      }

      enemies.value.push(createEnemy(typeEntry, sx, sy))
    }
  }

  const handleSpawning = (dt) => {
    if (enemyDebug.pauseSpawn) return
    if (bossSpawnState?.spawnPause?.value) return

    const realEnemyCount = enemies.value.filter((e) => !e.summonedBy && !e.isBoss && !e.dead).length
    if (realEnemyCount >= MAX_ENEMIES) return

    gameState.spawnTimer += dt
    const elapsedSec = gameState.gameTime / 1000
    let interval = Math.max(
      SPAWN_INTERVAL_MIN,
      SPAWN_INTERVAL_INITIAL - elapsedSec * SPAWN_INTERVAL_DECREASE_PER_SEC
    )
    const rateMult = bossSpawnState?.spawnRateMultiplier?.value ?? 1
    interval /= rateMult
    if (gameState.spawnTimer >= interval) {
      gameState.spawnTimer -= interval
      spawnEnemy()
    }
  }

  const cleanupDead = () => {
    enemies.value = enemies.value.filter((e) => !e.dead)
  }

  return {
    spawnEnemy,
    debugSpawnEnemies,
    handleSpawning,
    cleanupDead,
  }
}