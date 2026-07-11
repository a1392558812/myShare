import { ref, reactive } from 'vue'
import {
  EVENT_UNLOCK_LEVEL,
  EVENT_TYPES,
  CHEST_ITEM_TABLE,
  EVENT_SPAWN_INTERVAL,
  EVENT_MAX_COUNT,
  EVENT_TYPE_COOLDOWN,
  EVENT_SPAWN_MARGIN,
} from '../constants.js'
import { pushBattleLog } from './useBattleLog.js'


export function useEvents(enemies, player, gameState, buffUtils, battleLog, callbacks = {}) {
  const log = (msg) => pushBattleLog(battleLog, msg)

  const events = ref([])

  const typeCooldowns = reactive({})

  let spawnTimer = 0
  let nextSpawnInterval = randomInterval()

  const cursedActive = ref(false)
  const cursedRemainingRef = ref(0)
  const enemyDamageMultiplier = ref(1)
  const dropRateMultiplier = ref(1)

  const lightningSlowRatio = ref(0)
  const lightningDamageBoost = ref(0)

  const pendingStele = ref(null)

  function randomInterval() {
    return EVENT_SPAWN_INTERVAL[0] + Math.random() * (EVENT_SPAWN_INTERVAL[1] - EVENT_SPAWN_INTERVAL[0])
  }


  
  const spawnEvent = (camera, canvasSize) => {
    const now = gameState.gameTime
    const playerLevel = player.level || 1

    if (playerLevel < EVENT_UNLOCK_LEVEL) return

    if (events.value.length >= EVENT_MAX_COUNT) return

    const deathZones = events.value.filter(e => e.type === 'deathZone')

    const typesConfig = Object.values(EVENT_TYPES)
    const availableTypes = typesConfig.filter(cfg => {
      if (typeCooldowns[cfg.id] && typeCooldowns[cfg.id] > now) return false
      if (cfg.blockOnDeathZone && deathZones.length > 0) {
      }
      return true
    })

    if (availableTypes.length === 0) return

    const cfg = availableTypes[Math.floor(Math.random() * availableTypes.length)]

    if (cfg.id === 'lightningQuadrants') {
      const event = reactive({
        id: Date.now() + Math.random(),
        type: cfg.id,
        name: cfg.name,
        icon: cfg.icon,
        color: cfg.color,
        color2: cfg.color2,
        x: 0,
        y: 0,
        duration: cfg.duration,
        remaining: cfg.duration,
        activated: true,
        config: cfg,
        currentGroup: Math.random() > 0.5 ? 'AC' : 'BD',
       nextSwitchTime: cfg.switchMin + Math.random() * (cfg.switchMax - cfg.switchMin),
        warning: false,
        warningEndTime: 0,
        nextGroup: '',
        damageTimer: 0,
        isLightningEvent: true,
      })
      events.value.push(event)
      typeCooldowns[cfg.id] = now + cfg.cooldown
      log(`${cfg.icon} ${cfg.name} 来袭！`)
      return
    }

    const margin = EVENT_SPAWN_MARGIN
    let sx, sy
    let attempts = 0
    do {
      sx = camera.x + (Math.random() - 0.5) * (canvasSize.width - margin * 2)
      sy = camera.y + (Math.random() - 0.5) * (canvasSize.height - margin * 2)

      if (cfg.id === 'deathZone') {
        const d = Math.sqrt((sx - player.x) ** 2 + (sy - player.y) ** 2)
        if (d < (cfg.minPlayerDistance || 150)) { sx = null; continue }
      }

      if (cfg.blockOnDeathZone && deathZones.length > 0) {
        const inZone = deathZones.some(z => {
          const d = Math.sqrt((sx - z.x) ** 2 + (sy - z.y) ** 2)
          return d <= (z.zoneRadius || z.radius || 80)
        })
        if (inZone) { sx = null; continue }
      }

      attempts++
    } while (sx === null && attempts < 20)

    if (sx === null) return

    const event = reactive({
      id: Date.now() + Math.random(),
      type: cfg.id,
      name: cfg.name,
      icon: cfg.icon,
      color: cfg.color,
      color2: cfg.color2,
      x: sx,
      y: sy,
      duration: cfg.duration,
      remaining: cfg.duration,
      activated: false,
      config: cfg,
      zoneRadius: cfg.zoneRadius || cfg.radius || 80,
      damagePerSec: cfg.damagePerSec || 0,
      slowRatio: cfg.slowRatio || 0,
    })

    events.value.push(event)

    typeCooldowns[cfg.id] = now + cfg.cooldown

    if (cfg.id === 'deathZone') {
      const allZones = events.value.filter(e => e.type === 'deathZone')
      const maxCount = cfg.maxCount || 5
      if (allZones.length > maxCount) {
        const oldest = allZones[0]
        const idx = events.value.findIndex(e => e.id === oldest.id)
        if (idx !== -1) events.value.splice(idx, 1)
      }
    }
  }


  
  const checkEventActivation = () => {
    if (gameState.isDead || gameState.levelUpPending) return { stelePrompt: false }

    let stelePrompt = false

    for (const event of events.value) {
      if (event.activated) continue

      const dx = player.x - event.x
      const dy = player.y - event.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const range = event.config.activateRange || 40

      if (dist > range) continue

      const cfg = event.config

      if (cfg.id === 'altar' || cfg.id === 'shrine') {
        event.activated = true
        const value = cfg.buffValue
        buffUtils.addBuff(cfg.buffType, cfg.buffLabel, value, cfg.buffDuration, cfg.id)
        log(`激活了${cfg.name}！${cfg.buffLabel}`)
        const idx = events.value.findIndex(e => e.id === event.id)
        if (idx !== -1) events.value.splice(idx, 1)
        continue
      }

      if (cfg.id === 'chest') {
        event.activated = true
        openChest(event)
        const idx = events.value.findIndex(e => e.id === event.id)
        if (idx !== -1) events.value.splice(idx, 1)
        continue
      }

      if (cfg.id === 'cursedStele') {
        if (!event.activated) {
          if (event._steleRejectAt && gameState.gameTime - event._steleRejectAt < cfg.rejectCooldown) continue
          stelePrompt = true
          pendingStele.value = event
        }
        continue
      }
    }

    if (!stelePrompt && pendingStele.value) {
      pendingStele.value = null
    }

    return { stelePrompt }
  }


  const openChest = (event) => {
    const cfg = event.config
    const count = cfg.itemCountMin + Math.floor(Math.random() * (cfg.itemCountMax - cfg.itemCountMin + 1))

    const rolledItems = []
    for (let i = 0; i < count; i++) {
      const totalWeight = CHEST_ITEM_TABLE.reduce((sum, item) => sum + item.weight, 0)
      let rand = Math.random() * totalWeight
      let chosen = CHEST_ITEM_TABLE[0]
      for (const item of CHEST_ITEM_TABLE) {
        rand -= item.weight
        if (rand <= 0) { chosen = item; break }
      }
      rolledItems.push(chosen)
    }

    const itemNames = []
    rolledItems.forEach(item => {
      if (item.healAmount) {
        player.hp = Math.min(player.maxHp, player.hp + item.healAmount)
      }
      if (item.expAmount) {
        player.exp += item.expAmount
        if (callbacks.onGainExp) callbacks.onGainExp(item.expAmount)
      }
      if (item.effect === 'upgradeRandomSkill') {
        if (callbacks.onUpgradeRandomSkill) {
          callbacks.onUpgradeRandomSkill()
        } else {
          const fallback = event.config.fallbackExpReward || 300
          player.exp += fallback
          if (callbacks.onGainExp) callbacks.onGainExp(fallback)
        }
      }
      if (item.goldAmount) {
        player.gold = (player.gold || 0) + item.goldAmount
      }
      itemNames.push(item.icon + item.name)
    })

    log(`打开宝箱！获得：${itemNames.join('、')}`)
  }


  const activateCursedStele = () => {
    if (!pendingStele.value) return

    const event = pendingStele.value
    event.activated = true
    cursedActive.value = true
    cursedRemainingRef.value = event.config.effectDuration || 60000
    enemyDamageMultiplier.value = event.config.enemyBuffRatio || 1.3
    dropRateMultiplier.value = event.config.dropRateMultiplier || 2.5

    log(`激活诅咒石碑！敌人强度+${Math.round((enemyDamageMultiplier.value - 1) * 100)}%，掉落×${dropRateMultiplier.value}，持续${(cursedRemainingRef.value / 1000).toFixed(0)}s`)

    const idx = events.value.findIndex(e => e.id === event.id)
    if (idx !== -1) events.value.splice(idx, 1)
    pendingStele.value = null
  }

  const cancelCursedStele = () => {
    if (pendingStele.value) {
      pendingStele.value._steleRejectAt = gameState.gameTime
    }
    pendingStele.value = null
  }


  
  const tickDeathZones = (dt) => {
    const deathZones = events.value.filter(e => e.type === 'deathZone')
    if (deathZones.length === 0) return { inZoneSlow: 0 }

    let slowAmount = 0

    deathZones.forEach(zone => {
      const dx = player.x - zone.x
      const dy = player.y - zone.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const r = zone.zoneRadius || 80

      if (dist <= r) {
        slowAmount = Math.max(slowAmount, zone.slowRatio || 0.3)
        zone.damageTimer = (zone.damageTimer || 0) + dt
        const tickInterval = zone.config?.tickInterval || 1000
        if (zone.damageTimer >= tickInterval) {
          zone.damageTimer -= tickInterval
          if (callbacks.onTryDamagePlayer) {
            callbacks.onTryDamagePlayer(zone.damagePerSec || 3)
          }
        }
      }
    })

    return { inZoneSlow: slowAmount }
  }

  const getDeathZones = () => events.value.filter(e => e.type === 'deathZone')

  const getLightningQuadrantsEvents = () => events.value.filter(e => e.type === 'lightningQuadrants')

  const getPlayerQuadrant = () => {
    const x = player.x
    const y = player.y
    if (x >= 0 && y <= 0) return 1
    if (x < 0 && y <= 0) return 2
    if (x < 0 && y > 0) return 3
    if (x >= 0 && y > 0) return 4
    return 1
  }

  const isInLightningGroup = (quadrant, group) => {
    if (group === 'AC') return quadrant === 1 || quadrant === 3
    if (group === 'BD') return quadrant === 2 || quadrant === 4
    return false
  }

  const tickLightningQuadrants = (dt) => {
    const lightningEvents = events.value.filter(e => e.type === 'lightningQuadrants')
    if (lightningEvents.length === 0) {
      lightningSlowRatio.value = 0
      lightningDamageBoost.value = 0
      return
    }

    const event = lightningEvents[0]
    const cfg = event.config
    event.remaining -= dt
    event.nextSwitchTime -= dt

    if (event.warning) {
      if (gameState.gameTime >= event.warningEndTime) {
        event.warning = false
        event.currentGroup = event.nextGroup
        event.nextSwitchTime = cfg.switchMin + Math.random() * (cfg.switchMax - cfg.switchMin)
      }
    } else if (event.nextSwitchTime <= 0) {
      event.warning = true
      event.warningEndTime = gameState.gameTime + cfg.warnDuration
      event.nextGroup = event.currentGroup === 'AC' ? 'BD' : 'AC'
    }

    const playerQuadrant = getPlayerQuadrant()
    const activeGroup = event.currentGroup
    const inLightningZone = isInLightningGroup(playerQuadrant, activeGroup)

    if (inLightningZone) {
      lightningSlowRatio.value = cfg.slowRatio
      lightningDamageBoost.value = 0
      event.damageTimer += dt
      if (event.damageTimer >= cfg.tickInterval) {
        event.damageTimer -= cfg.tickInterval
        if (callbacks.onTryDamagePlayer) {
          callbacks.onTryDamagePlayer(cfg.damagePerSec * (cfg.tickInterval / 1000))
        }
      }
    } else {
      lightningSlowRatio.value = 0
      lightningDamageBoost.value = cfg.safeDamageBoost
    }

    if (event.remaining <= 0) {
      const idx = events.value.findIndex(e => e.id === event.id)
      if (idx !== -1) events.value.splice(idx, 1)
      lightningSlowRatio.value = 0
      lightningDamageBoost.value = 0
    }
  }

  const getLightningSlowRatio = () => lightningSlowRatio.value
  const getLightningDamageBoost = () => lightningDamageBoost.value


  
  const debugSpawnEvent = (typeId) => {
    const key = Object.keys(EVENT_TYPES).find(k => EVENT_TYPES[k].id === typeId)
    if (!key) return
    const cfg = EVENT_TYPES[key]

    if (cfg.id === 'lightningQuadrants') {
      const event = reactive({
        id: Date.now() + Math.random(),
        type: cfg.id,
        name: cfg.name,
        icon: cfg.icon,
        color: cfg.color,
        color2: cfg.color2,
        x: 0,
        y: 0,
        duration: cfg.duration,
        remaining: cfg.duration,
        activated: true,
        config: cfg,
        currentGroup: Math.random() > 0.5 ? 'AC' : 'BD',
       nextSwitchTime: cfg.switchMin + Math.random() * (cfg.switchMax - cfg.switchMin),
        warning: false,
        warningEndTime: 0,
        nextGroup: '',
        damageTimer: 0,
        isLightningEvent: true,
      })
      events.value.push(event)
      log(`${cfg.icon} ${cfg.name} 来袭！`)
      return
    }

    const angle = Math.random() * Math.PI * 2
    const spawnMin = cfg.spawnMinDist || 100
    const spawnMax = cfg.spawnMaxDist || 120
    const dist = spawnMin + Math.random() * (spawnMax - spawnMin)
    const sx = player.x + Math.cos(angle) * dist
    const sy = player.y + Math.sin(angle) * dist

    const event = reactive({
      id: Date.now() + Math.random(),
      type: cfg.id,
      name: cfg.name,
      icon: cfg.icon,
      color: cfg.color,
      color2: cfg.color2,
      x: sx,
      y: sy,
      duration: cfg.duration,
      remaining: cfg.duration,
      activated: false,
      config: cfg,
      zoneRadius: cfg.zoneRadius || cfg.radius || 80,
      damagePerSec: cfg.damagePerSec || 0,
      slowRatio: cfg.slowRatio || 0,
    })

    events.value.push(event)
  }


  
  const tickEvents = (dt, camera, canvasSize) => {
    for (let i = events.value.length - 1; i >= 0; i--) {
      const e = events.value[i]
      if (e.activated) continue

      if (e.type === 'deathZone') continue
      if (e.type === 'lightningQuadrants') continue

      e.remaining -= dt
      if (e.remaining <= 0) {
        events.value.splice(i, 1)
      }
    }

    tickDeathZones(dt)
    tickLightningQuadrants(dt)

    if (cursedActive.value) {
      cursedRemainingRef.value -= dt
      if (cursedRemainingRef.value <= 0) {
        cursedActive.value = false
        cursedRemainingRef.value = 0
        enemyDamageMultiplier.value = 1
        dropRateMultiplier.value = 1
      }
    }

    spawnTimer += dt
    if (spawnTimer >= nextSpawnInterval) {
      spawnTimer -= nextSpawnInterval
      nextSpawnInterval = randomInterval()
      spawnEvent(camera, canvasSize)
    }
  }

  const getEnemyDamageMultiplier = () => enemyDamageMultiplier.value
  const getDropRateMultiplier = () => dropRateMultiplier.value
  const isCursedActive = () => cursedActive.value

  return {
    events,
    pendingStele,
    cursedActive,
    cursedRemaining: cursedRemainingRef,
    tickEvents,
    checkEventActivation,
    activateCursedStele,
    cancelCursedStele,
    getDeathZones,
    tickDeathZones,
    getLightningQuadrantsEvents,
    getLightningSlowRatio,
    getLightningDamageBoost,
    getEnemyDamageMultiplier,
    getDropRateMultiplier,
    isCursedActive,
    debugSpawnEvent,
  }
}
