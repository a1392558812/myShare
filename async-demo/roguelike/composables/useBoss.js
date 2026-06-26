import { ref, computed } from 'vue'
import { useDebug } from './useDebug.js'
import {
  BOSS_TABLE,
  BOSS_COOLDOWN,
  BOSS_FIRST_TRIGGER_TIME,
  BOSS_WARNING_DURATION,
  BOSS_SPAWN_PAUSE_DURATION,
  BOSS_SPAWN_ANIM_DURATION,
  BOSS_SPAWN_RATE_MULTIPLIER,
  BOSS_DEATH_EFFECT_DURATION,
  BOSS_CLONE_REASSIGN_INTERVAL,
  BOSS_FIRST_EARLY_WARNING,
  BOSS_SLAM_RANGE,
  BOSS_SLAM_ANGLE,
  BOSS_SLAM_DAMAGE,
  BOSS_SLAM_COOLDOWN,
  BOSS_SLAM_WARN_DURATION,
  BOSS_SHADOW_ORB_COUNT_PHASE1,
  BOSS_SHADOW_ORB_COUNT_PHASE2,
  BOSS_SHADOW_ORB_DAMAGE,
  BOSS_SHADOW_ORB_SPEED,
  BOSS_SHADOW_ORB_TRACK_STRENGTH,
  BOSS_SHADOW_ORB_COOLDOWN,
  BOSS_SHADOW_ORB_SIZE,
  BOSS_SHADOW_WAVE_DAMAGE,
  BOSS_SHADOW_WAVE_INTERVAL,
  BOSS_SHADOW_WAVE_SPEED,
  BOSS_SHADOW_WAVE_MAX_RADIUS,
  BOSS_FIRE_PILLAR_DAMAGE,
  BOSS_FIRE_PILLAR_INTERVAL,
  BOSS_FIRE_PILLAR_WARN,
  BOSS_FIRE_PILLAR_RADIUS,
  BOSS_FIRE_PILLAR_MAX,
  BOSS_FIRE_BARRAGE_DAMAGE,
  BOSS_FIRE_BARRAGE_INTERVAL,
  BOSS_FIRE_BARRAGE_SPEED,
  BOSS_FIRE_BARRAGE_DIRECTIONS,
  BOSS_FIRE_BARRAGE_RANGE,
  BOSS_FIRE_BARRAGE_SIZE,
  BOSS_VOID_TELEPORT_INTERVAL,
  BOSS_VOID_LINE_INTERVAL,
  BOSS_VOID_LINE_DAMAGE_PER_SEC,
  BOSS_VOID_LINE_DURATION,
  BOSS_VOID_LINE_COUNT,
  BOSS_VOID_SLOW_INTERVAL,
  BOSS_VOID_SLOW_RADIUS,
  BOSS_VOID_SLOW_RATIO,
  BOSS_VOID_SLOW_DURATION,
  BOSS_VOID_PROJECTILE_DAMAGE,
  BOSS_VOID_PROJECTILE_SPEED,
  BOSS_VOID_PROJECTILE_TRACK,
  BOSS_VOID_PROJECTILE_INTERVAL,
  BOSS_VOID_PROJECTILE_SIZE,
  calcBossHP,
  ENTITY_SIZE,
  LOOT_TABLE,
} from '../constants.js'
import { pushBattleLog } from './useBattleLog.js'


export function useBoss(player, gameState, enemies, projectiles, effects, lootDrops, battleLog, playerUtils) {
  const { gainExp } = playerUtils
  const { bossDebug } = useDebug()
  const tryDamagePlayer = playerUtils.tryDamagePlayer || ((dmg) => {
    if (player._dashInvincibleTimer > 0) return false
    const isInvincible = player.skills.some(s => s.id === 'invincible' && s.active)
    if (isInvincible) return false
    player.hp -= dmg
    player.hitFlash = 10
    if (player.hp <= 0) { player.hp = 0; gameState.isDead = true }
    return true
  })

  const log = (msg) => pushBattleLog(battleLog, msg)

  const activeBoss = ref(null)
  const bossState = ref('idle')
  const bossCooldownRemaining = ref(0)
  const bossWarningTimer = ref(0)
  const bossSpawnPauseTimer = ref(0)
  const spawnPause = ref(false)
  const spawnRateMultiplier = ref(1.0)
  const lastDefeatedBossLv = ref(0)
  const lastBossDefeatTime = ref(0)
  const bossClones = ref([])
  const lastBossId = ref(null)
  const firstBossPreWarningRemaining = ref(0)

  const voidLines = ref([])
  const slowFields = ref([])

  const isBossActive = computed(() => bossState.value === 'active')
  const isBossWarning = computed(() => bossState.value === 'warning')
  const currentPhase = computed(() => {
    if (!activeBoss.value || !activeBoss.value.phases) return { name: '', attacks: [] }
    const hpRatio = activeBoss.value.hp / activeBoss.value.maxHp
    for (let i = activeBoss.value.phases.length - 1; i >= 0; i--) {
      if (hpRatio <= activeBoss.value.phases[i].threshold) {
        return activeBoss.value.phases[i]
      }
    }
    return activeBoss.value.phases[0]
  })


  const randomDropOffset = () => ({ dx: (Math.random() - 0.5) * 80, dy: (Math.random() - 0.5) * 80 })

  const pickBoss = () => {
    const available = BOSS_TABLE.filter(b =>
      player.level >= b.unlockPlayerLevel && b.id !== lastBossId.value
    )
    if (available.length === 0) {
      const fallback = BOSS_TABLE.filter(b => player.level >= b.unlockPlayerLevel)
      if (fallback.length === 0) return null
      return fallback[Math.floor(Math.random() * fallback.length)]
    }
    return available[Math.floor(Math.random() * available.length)]
  }

  const createBossEntity = (config, x, y) => {
    const hp = calcBossHP(config, player.level)
    return {
      eid: 'boss_' + config.id + '_' + Date.now(),
      type: 'boss',
      bossId: config.id,
      isBoss: true,
      isClone: false,
      isCloneMaster: true,
      x, y,
      hp, maxHp: hp,
      speed: config.speed,
      size: config.size,
      color: config.color,
      color2: config.color2,
      bossName: config.name,
      expReward: config.xpReward,
      phases: config.phases,
      dropTable: config.dropTable,
      dead: false,
      hitFlash: 0,
      frozen: false,
      frozenTimer: 0,
      currentPhaseIdx: 0,
      slamCooldown: 0,
      orbCooldown: 0,
      cloneTimer: 0,
      waveTimer: 0,
      isFrenzied: false,
      firePillarCooldown: 0,
      fireBarrageCooldown: 0,
      fireBarrageRotation: 0,
      teleportTimer: BOSS_VOID_TELEPORT_INTERVAL * 0.5,
      voidLineTimer: 0,
      slowFieldTimer: 0,
      voidProjectileCooldown: 0,
    }
  }

  const spawnBossDrops = (boss, x, y) => {
    if (!boss.dropTable) return
    const allDrops = []

    boss.dropTable.guaranteed?.forEach(g => {
      for (let i = 0; i < g.count; i++) {
        const off = randomDropOffset()
        if (g.id === 'skillScroll') {
          allDrops.push({
            id: 'skillScroll',
            name: '技能卷轴',
            icon: '\uD83D\uDCDC',
            color: '#a855f7',
            hoverColor: '#c084fc',
            size: 14,
            effect: 'upgradeRandomSkill',
            lifetime: 30000,
            x: x + off.dx, y: y + off.dy,
            spawnedAt: gameState.gameTime,
          })
        } else if (g.id === 'goldPouch') {
          allDrops.push({
            id: 'goldPouch',
            name: '金币袋',
            icon: '\uD83D\uDCB0',
            color: '#fbbf24',
            hoverColor: '#fde68a',
            size: 12,
            goldAmount: 5,
            lifetime: 30000,
            x: x + off.dx, y: y + off.dy,
            spawnedAt: gameState.gameTime,
          })
        } else if (g.id === 'goldCoin') {
          allDrops.push({
            id: 'goldCoin',
            name: '金币',
            icon: '\uD83E\uDE99',
            color: '#fbbf24',
            hoverColor: '#fde68a',
            size: 10,
            goldAmount: 1,
            lifetime: 30000,
            x: x + off.dx, y: y + off.dy,
            spawnedAt: gameState.gameTime,
          })
        }
      }
    })

    boss.dropTable.extra?.forEach(e => {
      if (Math.random() <= (e.chance ?? 1.0)) {
        const off = randomDropOffset()
        allDrops.push({
          id: e.id,
          name: e.name || '???',
          icon: e.icon || '\u2728',
          color: e.color || '#fbbf24',
          hoverColor: e.hoverColor || '#fde68a',
          size: 12,
          effect: e.effect,
          lifetime: 30000,
          x: x + off.dx, y: y + off.dy,
          spawnedAt: gameState.gameTime,
        })
      }
    })

    lootDrops.value.push(...allDrops)

    allDrops.forEach(d => {
      effects.value.push({
        type: 'shine',
        x: d.x, y: d.y,
        radius: 12,
        duration: 800,
        elapsed: 0,
        color: d.color,
      })
    })
  }

  const damageBoss = (damage) => {
    if (!activeBoss.value || activeBoss.value.dead) return
    if (bossState.value !== 'active') return

    activeBoss.value.hp -= damage
    activeBoss.value.hitFlash = 6

    if (activeBoss.value.hp <= 0) {
      activeBoss.value.hp = 0
      bossState.value = 'dying'
      bossSpawnPauseTimer.value = 0
      effects.value.push({
        type: 'bossDeathExplosion',
        x: activeBoss.value.x,
        y: activeBoss.value.y,
        radius: activeBoss.value.size * 1.5,
        duration: BOSS_DEATH_EFFECT_DURATION,
        elapsed: 0,
        color: activeBoss.value.color,
        color2: activeBoss.value.color2,
      })
      log(`${activeBoss.value.bossName} 已被击败！`)
      return
    }

    const hpRatio = activeBoss.value.hp / activeBoss.value.maxHp
    let newPhaseIdx = 0
    for (let i = activeBoss.value.phases.length - 1; i >= 0; i--) {
      if (hpRatio <= activeBoss.value.phases[i].threshold) {
        newPhaseIdx = i
        break
      }
    }
    if (newPhaseIdx !== activeBoss.value.currentPhaseIdx) {
      activeBoss.value.currentPhaseIdx = newPhaseIdx
      const p = activeBoss.value.phases[newPhaseIdx]
      log(`${activeBoss.value.bossName} 进入 ${p.name || '新阶段'}！`)

      effects.value.push({
        type: 'phaseTransition',
        x: activeBoss.value.x,
        y: activeBoss.value.y,
        radius: activeBoss.value.size,
        duration: 600,
        elapsed: 0,
        color: activeBoss.value.color,
      })
    }
  }


  const tickBossSpawn = (dt) => {

    if (lastBossDefeatTime.value === 0 && player.level >= 3 && bossState.value === 'idle') {
      const timeUntilTrigger = BOSS_FIRST_TRIGGER_TIME - gameState.gameTime
      if (timeUntilTrigger > 0 && timeUntilTrigger <= BOSS_FIRST_EARLY_WARNING) {
        firstBossPreWarningRemaining.value = timeUntilTrigger
      } else {
        firstBossPreWarningRemaining.value = 0
      }
    }

    if (bossState.value !== 'idle') {
      if (bossCooldownRemaining.value > 0) {
        bossCooldownRemaining.value = Math.max(0, bossCooldownRemaining.value - dt)
      }
      return
    }

    if (bossCooldownRemaining.value > 0) {
      bossCooldownRemaining.value = Math.max(0, bossCooldownRemaining.value - (bossDebug.skipCooldown ? 999999 : dt))
      if (bossCooldownRemaining.value > 0) return
    }

    const firstTrigger = lastBossDefeatTime.value === 0
    let canTrigger = false

    if (firstTrigger) {
      canTrigger = gameState.gameTime >= BOSS_FIRST_TRIGGER_TIME && player.level >= 3
    } else {
      canTrigger = bossCooldownRemaining.value <= 0 && player.level >= lastDefeatedBossLv.value + 2
    }

    if (!canTrigger) return

    const config = pickBoss()
    if (!config) return

    lastBossId.value = config.id

    bossState.value = 'warning'
    bossWarningTimer.value = BOSS_WARNING_DURATION
    bossSpawnPauseTimer.value = BOSS_SPAWN_PAUSE_DURATION
    spawnPause.value = true

    log('\u26A0\uFE0F 强大的敌人正在接近...')
    effects.value.push({
      type: 'screenShake',
      x: player.x, y: player.y,
      duration: BOSS_WARNING_DURATION,
      elapsed: 0,
    })
  }

  const updateBoss = (dt) => {
    if (bossState.value === 'warning') {
      bossWarningTimer.value -= dt
      bossSpawnPauseTimer.value -= dt
      if (bossWarningTimer.value <= 0) {
        bossState.value = 'spawning'
        bossWarningTimer.value = 0
      }
    }

    if (bossState.value === 'spawning') {
      bossSpawnPauseTimer.value -= dt
      if (!activeBoss.value) {
        const config = BOSS_TABLE.find(b => b.id === lastBossId.value)
        if (config) {
          const bx = player.x + (Math.random() - 0.5) * 200
          const by = player.y + (Math.random() - 0.5) * 200
          activeBoss.value = createBossEntity(config, bx, by)
          enemies.value.push(activeBoss.value)

          effects.value.push({
            type: 'bossSpawnAnim',
            x: bx, y: by,
            radius: config.size,
            duration: BOSS_SPAWN_ANIM_DURATION,
            elapsed: 0,
            color: config.color,
            color2: config.color2,
          })
        }
      }

      if (bossSpawnPauseTimer.value <= 0) {
        spawnPause.value = false
        bossState.value = 'active'
        spawnRateMultiplier.value = BOSS_SPAWN_RATE_MULTIPLIER
        if (activeBoss.value) {
          log(`${activeBoss.value.bossName} 降临战场！`)
        }
      }
    }

    if (bossState.value === 'active' && activeBoss.value && !activeBoss.value.dead) {
      switch (activeBoss.value.bossId) {
        case 'shadowAmalgam': aiShadowAmalgam(dt); break
        case 'infernoCore':    aiInfernoCore(dt); break
        case 'voidWeaver':     aiVoidWeaver(dt); break
      }
    }

    if (bossState.value === 'dying') {
      const deathEffect = effects.value.find(e => e.type === 'bossDeathExplosion')
      if (!deathEffect) {
        if (activeBoss.value) {
          const b = activeBoss.value
          gainExp(b.expReward)
          spawnBossDrops(b, b.x, b.y)
          b.dead = true
          gameState.killCount++
          lastDefeatedBossLv.value = player.level
          lastBossDefeatTime.value = gameState.gameTime
          bossCooldownRemaining.value = BOSS_COOLDOWN
        }
        cleanupClones()
        activeBoss.value = null
        spawnRateMultiplier.value = 1.0
        voidLines.value = []
        slowFields.value = []
        bossState.value = 'idle'
      }
    }

    voidLines.value.forEach(v => { v.elapsed += dt })
    voidLines.value = voidLines.value.filter(v => v.elapsed < v.duration)

    slowFields.value.forEach(s => { s.elapsed += dt })
    slowFields.value = slowFields.value.filter(s => s.elapsed < s.duration)

    if (bossState.value === 'active' && activeBoss.value && activeBoss.value.bossId === 'shadowAmalgam') {
      if (activeBoss.value.cloneTimer > 0) {
        activeBoss.value.cloneTimer -= dt
        if (activeBoss.value.cloneTimer <= 0) {
          reassignClones()
          activeBoss.value.cloneTimer = BOSS_CLONE_REASSIGN_INTERVAL
        }
      }
    }
  }

  const aiShadowAmalgam = (dt) => {
    const b = activeBoss.value
    if (!b) return

    const dx = player.x - b.x
    const dy = player.y - b.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const ndx = dist > 0 ? dx / dist : 0
    const ndy = dist > 0 ? dy / dist : 0

    const isFrenzied = b.currentPhaseIdx === 2
    const speedMult = isFrenzied ? 2 : 1
    const cdMult = isFrenzied ? 0.5 : 1
    b.isFrenzied = isFrenzied

    if (b.isCloneMaster && dist > 1) {
      b.x += ndx * b.speed * speedMult
      b.y += ndy * b.speed * speedMult
    }

    b.slamCooldown -= dt
    if (b.slamCooldown <= 0 && dist <= BOSS_SLAM_RANGE + b.size) {
      b.slamCooldown = BOSS_SLAM_COOLDOWN * cdMult
      effects.value.push({
        type: 'bossSlamWarn',
        x: b.x, y: b.y,
        radius: BOSS_SLAM_RANGE,
        angle: Math.atan2(dy, dx),
        duration: BOSS_SLAM_WARN_DURATION,
        elapsed: 0,
        color: b.color,
      })
      const slamEffect = {
        type: 'bossSlamHit',
        x: b.x, y: b.y,
        radius: BOSS_SLAM_RANGE,
        angle: Math.atan2(dy, dx),
        duration: 200,
        elapsed: 0,
        damage: BOSS_SLAM_DAMAGE,
        color: b.color,
        playerX: player.x, playerY: player.y,
      }
      effects.value.push(slamEffect)
      const slamDx = player.x - b.x
      const slamDy = player.y - b.y
      const slamDist = Math.sqrt(slamDx * slamDx + slamDy * slamDy)
      const slamAngle = Math.atan2(slamDy, slamDx)
      const angleDiff = Math.abs(((slamAngle - Math.atan2(dy, dx) + Math.PI) % (Math.PI * 2)) - Math.PI)
      if (slamDist <= BOSS_SLAM_RANGE + ENTITY_SIZE && angleDiff <= (BOSS_SLAM_ANGLE / 2) * Math.PI / 180) {
        tryDamagePlayer(BOSS_SLAM_DAMAGE)
      }
    }

    b.orbCooldown -= dt
    if (b.orbCooldown <= 0) {
      b.orbCooldown = BOSS_SHADOW_ORB_COOLDOWN * cdMult
      const orbCount = b.currentPhaseIdx >= 1 ? BOSS_SHADOW_ORB_COUNT_PHASE2 : BOSS_SHADOW_ORB_COUNT_PHASE1
      for (let i = 0; i < orbCount; i++) {
        const angle = (Math.PI * 2 / orbCount) * i
        const vx = Math.cos(angle) * BOSS_SHADOW_ORB_SPEED
        const vy = Math.sin(angle) * BOSS_SHADOW_ORB_SPEED
        projectiles.value.push({
          type: 'shadowOrb',
          x: b.x, y: b.y,
          vx, vy,
          damage: BOSS_SHADOW_ORB_DAMAGE,
          size: BOSS_SHADOW_ORB_SIZE,
          owner: 'enemy',
          isTracking: true,
          trackStrength: BOSS_SHADOW_ORB_TRACK_STRENGTH,
          maxSpeed: BOSS_SHADOW_ORB_SPEED,
        })
      }
    }

    if (b.currentPhaseIdx >= 1 && bossClones.value.length === 0 && b.cloneTimer <= 0) {
      createClones()
      b.cloneTimer = BOSS_CLONE_REASSIGN_INTERVAL
    }

    if (b.currentPhaseIdx >= 2) {
      b.waveTimer -= dt
      if (b.waveTimer <= 0) {
        b.waveTimer = BOSS_SHADOW_WAVE_INTERVAL
        effects.value.push({
          type: 'shadowWave',
          x: b.x, y: b.y,
          radius: 10,
          maxRadius: BOSS_SHADOW_WAVE_MAX_RADIUS,
          speed: BOSS_SHADOW_WAVE_SPEED,
          damage: BOSS_SHADOW_WAVE_DAMAGE,
          duration: BOSS_SHADOW_WAVE_MAX_RADIUS / BOSS_SHADOW_WAVE_SPEED * 16,
          elapsed: 0,
          color: b.color,
          playerRef: player,
        })
      }
    }
  }

  const aiInfernoCore = (dt) => {
    const b = activeBoss.value
    if (!b) return

    const dx = player.x - b.x
    const dy = player.y - b.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const ndx = dist > 0 ? dx / dist : 0
    const ndy = dist > 0 ? dy / dist : 0

    const comfortMin = 150
    const comfortMax = 250
    if (dist > 0 && dist < comfortMin) {
      b.x -= ndx * b.speed
      b.y -= ndy * b.speed
    } else if (dist > comfortMax) {
      b.x += ndx * b.speed * 0.7
      b.y += ndy * b.speed * 0.7
    }

    b.firePillarCooldown -= dt
    if (b.firePillarCooldown <= 0) {
      b.firePillarCooldown = BOSS_FIRE_PILLAR_INTERVAL
      const existingWarns = effects.value.filter(e => e.type === 'firePillarWarn').length
      if (existingWarns >= BOSS_FIRE_PILLAR_MAX) {
        const oldest = effects.value.findIndex(e => e.type === 'firePillarWarn')
        if (oldest !== -1) effects.value.splice(oldest, 1)
      }
      effects.value.push({
        type: 'firePillarWarn',
        x: player.x, y: player.y,
        radius: BOSS_FIRE_PILLAR_RADIUS,
        duration: BOSS_FIRE_PILLAR_WARN,
        elapsed: 0,
        damage: BOSS_FIRE_PILLAR_DAMAGE,
        color: b.color,
        playerRef: player,
      })
    }

    b.fireBarrageCooldown -= dt
    if (b.fireBarrageCooldown <= 0) {
      b.fireBarrageCooldown = BOSS_FIRE_BARRAGE_INTERVAL
      b.fireBarrageRotation = (b.fireBarrageRotation || 0) + Math.PI / 6
      for (let i = 0; i < BOSS_FIRE_BARRAGE_DIRECTIONS; i++) {
        const angle = (Math.PI * 2 / BOSS_FIRE_BARRAGE_DIRECTIONS) * i + (b.fireBarrageRotation || 0)
        const vx = Math.cos(angle) * BOSS_FIRE_BARRAGE_SPEED
        const vy = Math.sin(angle) * BOSS_FIRE_BARRAGE_SPEED
        projectiles.value.push({
          type: 'fireBarrage',
          x: b.x, y: b.y,
          vx, vy,
          damage: BOSS_FIRE_BARRAGE_DAMAGE,
          size: BOSS_FIRE_BARRAGE_SIZE,
          owner: 'enemy',
          range: BOSS_FIRE_BARRAGE_RANGE,
          traveled: 0,
        })
      }
    }
  }

  const aiVoidWeaver = (dt) => {
    const b = activeBoss.value
    if (!b) return

    const dx = player.x - b.x
    const dy = player.y - b.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    b.teleportTimer -= dt
    if (b.teleportTimer <= 0) {
      b.teleportTimer = BOSS_VOID_TELEPORT_INTERVAL
      effects.value.push({
        type: 'voidTeleportOut',
        x: b.x, y: b.y,
        radius: b.size * 0.8,
        duration: 300,
        elapsed: 0,
        color: b.color,
      })
      const angle = Math.random() * Math.PI * 2
      const rad = 100 + Math.random() * 200
      const nx = player.x + Math.cos(angle) * rad
      const ny = player.y + Math.sin(angle) * rad
      setTimeout(() => {
        if (!b.dead) {
          b.x = nx; b.y = ny
          effects.value.push({
            type: 'voidTeleportIn',
            x: nx, y: ny,
            radius: b.size * 0.8,
            duration: 300,
            elapsed: 0,
            color: b.color,
          })
        }
      }, 300)
    }

    b.voidLineTimer -= dt
    if (b.voidLineTimer <= 0) {
      b.voidLineTimer = BOSS_VOID_LINE_INTERVAL
      const centerX = player.x + (Math.random() - 0.5) * 300
      const centerY = player.y + (Math.random() - 0.5) * 300
      const lineAngle = Math.random() * Math.PI
      const lineLen = 200 + Math.random() * 150
      const gap = 60 + Math.random() * 40
      const perpX = Math.cos(lineAngle + Math.PI / 2)
      const perpY = Math.sin(lineAngle + Math.PI / 2)

      const l1 = {
        x1: centerX + perpX * gap / 2 - Math.cos(lineAngle) * lineLen / 2,
        y1: centerY + perpY * gap / 2 - Math.sin(lineAngle) * lineLen / 2,
        x2: centerX + perpX * gap / 2 + Math.cos(lineAngle) * lineLen / 2,
        y2: centerY + perpY * gap / 2 + Math.sin(lineAngle) * lineLen / 2,
      }
      const l2 = {
        x1: centerX - perpX * gap / 2 - Math.cos(lineAngle) * lineLen / 2,
        y1: centerY - perpY * gap / 2 - Math.sin(lineAngle) * lineLen / 2,
        x2: centerX - perpX * gap / 2 + Math.cos(lineAngle) * lineLen / 2,
        y2: centerY - perpY * gap / 2 + Math.sin(lineAngle) * lineLen / 2,
      }

      voidLines.value.push({
        type: 'voidLineSet',
        l1, l2,
        damagePerSec: BOSS_VOID_LINE_DAMAGE_PER_SEC,
        duration: BOSS_VOID_LINE_DURATION,
        elapsed: 0,
        centerX, centerY,
        gap,
      })
    }

    b.slowFieldTimer -= dt
    if (b.slowFieldTimer <= 0) {
      b.slowFieldTimer = BOSS_VOID_SLOW_INTERVAL
      slowFields.value.push({
        type: 'voidSlowField',
        x: player.x,
        y: player.y,
        radius: BOSS_VOID_SLOW_RADIUS,
        slowRatio: BOSS_VOID_SLOW_RATIO,
        duration: BOSS_VOID_SLOW_DURATION,
        elapsed: 0,
        color: b.color,
      })
    }

    b.voidProjectileCooldown -= dt
    if (b.voidProjectileCooldown <= 0) {
      b.voidProjectileCooldown = BOSS_VOID_PROJECTILE_INTERVAL
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2
        const vx = Math.cos(angle) * BOSS_VOID_PROJECTILE_SPEED
        const vy = Math.sin(angle) * BOSS_VOID_PROJECTILE_SPEED
        projectiles.value.push({
          type: 'voidProjectile',
          x: b.x + (Math.random() - 0.5) * 30,
          y: b.y + (Math.random() - 0.5) * 30,
          vx, vy,
          damage: BOSS_VOID_PROJECTILE_DAMAGE,
          size: BOSS_VOID_PROJECTILE_SIZE,
          owner: 'enemy',
          isTracking: true,
          trackStrength: BOSS_VOID_PROJECTILE_TRACK,
          maxSpeed: BOSS_VOID_PROJECTILE_SPEED,
        })
      }
    }

    voidLines.value.forEach(v => {
      const lastTick = v.lastDamageTick || 0
      if (gameState.gameTime - lastTick >= 1000) {
        v.lastDamageTick = gameState.gameTime
        if (isPointBetweenLines(player.x, player.y, v.l1, v.l2, v.gap)) {
          tryDamagePlayer(v.damagePerSec)
        }
      }
    })

    let totalSlow = 0
    slowFields.value.forEach(s => {
      const sd = Math.sqrt((player.x - s.x) ** 2 + (player.y - s.y) ** 2)
      if (sd <= s.radius) {
        totalSlow = Math.max(totalSlow, s.slowRatio)
      }
    })
    player._bossSlowMultiplier = 1 - totalSlow
  }


  const isPointBetweenLines = (px, py, l1, l2, gap) => {
    const cx = (l1.x1 + l2.x1) / 2
    const cy = (l1.y1 + l2.y1) / 2
    const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
    if (dist > gap * 1.5) return false

    const d1 = pointToLine(px, py, l1.x1, l1.y1, l1.x2, l1.y2)
    const d2 = pointToLine(px, py, l2.x1, l2.y1, l2.x2, l2.y2)
    const lineDirX = l1.x2 - l1.x1
    const lineDirY = l1.y2 - l1.y1
    const lineLen = Math.sqrt(lineDirX * lineDirX + lineDirY * lineDirY)
    if (lineLen === 0) return false
    const t = ((px - l1.x1) * lineDirX + (py - l1.y1) * lineDirY) / (lineLen * lineLen)
    if (t < -0.2 || t > 1.2) return false
    if (d1 + d2 < gap * 1.2 && d1 < gap && d2 < gap) return true
    return false
  }

  const pointToLine = (px, py, x1, y1, x2, y2) => {
    const A = px - x1
    const B = py - y1
    const C = x2 - x1
    const D = y2 - y1
    const dot = A * C + B * D
    const lenSq = C * C + D * D
    if (lenSq === 0) return Math.sqrt(A * A + B * B)
    let param = dot / lenSq
    param = Math.max(0, Math.min(1, param))
    const closestX = x1 + param * C
    const closestY = y1 + param * D
    return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2)
  }


  const createClones = () => {
    if (!activeBoss.value) return
    const b = activeBoss.value

    cleanupClones()

    const positions = [
      { x: b.x, y: b.y },
      {
        x: player.x + (Math.random() - 0.5) * 300,
        y: player.y + (Math.random() - 0.5) * 300,
      },
      {
        x: player.x + (Math.random() - 0.5) * 300,
        y: player.y + (Math.random() - 0.5) * 300,
      },
    ]

    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }

    b.x = positions[0].x
    b.y = positions[0].y
    b.isCloneMaster = true

    for (let i = 1; i < positions.length; i++) {
      const clone = {
        eid: 'boss_clone_' + Date.now() + '_' + i,
        type: 'boss',
        bossId: b.bossId,
        isBoss: true,
        isClone: true,
        isCloneMaster: false,
        x: positions[i].x, y: positions[i].y,
        hp: b.hp, maxHp: b.maxHp,
        speed: b.speed * 1.1,
        size: b.size * 0.85,
        color: b.color,
        color2: b.color2,
        bossName: b.bossName,
        dead: false,
        hitFlash: 0,
        frozen: false,
        frozenTimer: 0,
      }
      bossClones.value.push(clone)
      enemies.value.push(clone)
    }
  }

  const reassignClones = () => {
    if (!activeBoss.value || activeBoss.value.dead) return
    const b = activeBoss.value

    bossClones.value.forEach(c => {
      const idx = enemies.value.indexOf(c)
      if (idx !== -1) enemies.value.splice(idx, 1)
    })
    bossClones.value = []

    const posCount = 3
    const positions = []
    for (let i = 0; i < posCount; i++) {
      positions.push({
        x: player.x + (Math.random() - 0.5) * 300,
        y: player.y + (Math.random() - 0.5) * 300,
      })
    }
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }

    b.x = positions[0].x
    b.y = positions[0].y
    b.isCloneMaster = true

    for (let i = 1; i < positions.length; i++) {
      const clone = {
        eid: 'boss_clone_' + Date.now() + '_' + i,
        type: 'boss',
        bossId: b.bossId,
        isBoss: true,
        isClone: true,
        isCloneMaster: false,
        x: positions[i].x, y: positions[i].y,
        hp: b.hp, maxHp: b.maxHp,
        speed: b.speed * 1.1,
        size: b.size * 0.85,
        color: b.color,
        color2: b.color2,
        bossName: b.bossName,
        dead: false,
        hitFlash: 0,
      }
      bossClones.value.push(clone)
      enemies.value.push(clone)
    }
  }

  const cleanupClones = () => {
    bossClones.value.forEach(c => {
      const idx = enemies.value.indexOf(c)
      if (idx !== -1) enemies.value.splice(idx, 1)
    })
    bossClones.value = []
  }


  const resetBossState = () => {
    activeBoss.value = null
    bossState.value = 'idle'
    bossCooldownRemaining.value = 0
    bossWarningTimer.value = 0
    bossSpawnPauseTimer.value = 0
    spawnPause.value = false
    spawnRateMultiplier.value = 1.0
    lastDefeatedBossLv.value = 0
    lastBossDefeatTime.value = 0
    lastBossId.value = null
    firstBossPreWarningRemaining.value = 0
    cleanupClones()
    voidLines.value = []
    slowFields.value = []
  }

  const getBossSlowMultiplier = () => {
    return player._bossSlowMultiplier ?? 1
  }

  return {
    activeBoss, bossState, bossCooldownRemaining, firstBossPreWarningRemaining, bossWarningTimer,
    spawnPause, spawnRateMultiplier,
    bossClones, voidLines, slowFields,
    isBossActive, isBossWarning, currentPhase,
    tickBossSpawn, updateBoss, damageBoss, resetBossState,
    getBossSlowMultiplier,

    debugForceSpawn(bossId) {
      if (bossState.value !== 'idle') resetBossState()
      bossCooldownRemaining.value = 0

      const config = bossId
        ? BOSS_TABLE.find(b => b.id === bossId)
        : pickBoss()
      if (!config) return

      lastBossId.value = config.id
      bossState.value = 'warning'
      bossWarningTimer.value = BOSS_WARNING_DURATION
      bossSpawnPauseTimer.value = BOSS_SPAWN_PAUSE_DURATION
      spawnPause.value = true
      log('\u26A0\uFE0F [调试] 强制刷 Boss: ' + config.name)
    },

    debugForceKill() {
      if (!activeBoss.value || bossState.value !== 'active') return
      activeBoss.value.hp = 0
      activeBoss.value.dead = true
      bossState.value = 'dying'
      log('\u2620 [调试] 强制击杀 Boss')
    },
  }
}
