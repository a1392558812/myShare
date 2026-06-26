/**
 * useBoss — Boss 波次系统核心逻辑
 * 触发检测 / 状态机 / 3 Boss AI / 掉落生成
 */
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

/**
 * @param {import('vue').UnwrapNestedRefs} player
 * @param {import('vue').UnwrapNestedRefs} gameState
 * @param {import('vue').Ref<Array>} enemies
 * @param {import('vue').Ref<Array>} projectiles
 * @param {import('vue').Ref<Array>} effects
 * @param {import('vue').Ref<Array>} lootDrops
 * @param {import('vue').Ref<Array>} battleLog
 * @param {object} playerUtils - { gainExp, tryDamagePlayer }
 */
export function useBoss(player, gameState, enemies, projectiles, effects, lootDrops, battleLog, playerUtils) {
  const { gainExp } = playerUtils
  const { bossDebug } = useDebug()
  const tryDamagePlayer = playerUtils.tryDamagePlayer || ((dmg) => {
    const isInvincible = player.skills.some(s => s.id === 'invincible' && s.active)
    if (isInvincible) return false
    player.hp -= dmg
    player.hitFlash = 10
    if (player.hp <= 0) { player.hp = 0; gameState.isDead = true }
    return true
  })

  const log = (msg) => pushBattleLog(battleLog, msg)

  // ─── 响应式状态 ───
  const activeBoss = ref(null)
  const bossState = ref('idle')          // idle|warning|spawning|active|dying|defeated
  const bossCooldownRemaining = ref(0)
  const bossWarningTimer = ref(0)
  const bossSpawnPauseTimer = ref(0)
  const spawnPause = ref(false)
  const spawnRateMultiplier = ref(1.0)
  const lastDefeatedBossLv = ref(0)
  const lastBossDefeatTime = ref(0)
  const bossClones = ref([])             // 暗影分身假身列表
  const lastBossId = ref(null)           // 上次出场的 Boss id，避免连续重复

  // ─── voidLines / slowFields（Boss 3 场地效果，存储于 effects 中） ───
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

  // ─── 工具函数 ───

  /** 随机掉落偏移（天女散花散布） */
  const randomDropOffset = () => ({ dx: (Math.random() - 0.5) * 80, dy: (Math.random() - 0.5) * 80 })

  /** 从可用的 Boss 池中随机选取 */
  const pickBoss = () => {
    const available = BOSS_TABLE.filter(b =>
      player.level >= b.unlockPlayerLevel && b.id !== lastBossId.value
    )
    if (available.length === 0) {
      // 池中只有 1 个或全部不满足 → 允许重复
      const fallback = BOSS_TABLE.filter(b => player.level >= b.unlockPlayerLevel)
      if (fallback.length === 0) return null
      return fallback[Math.floor(Math.random() * fallback.length)]
    }
    return available[Math.floor(Math.random() * available.length)]
  }

  /** 生成 Boss 实体对象 */
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
      // 暗影聚合体攻击计时
      slamCooldown: 0,
      orbCooldown: 0,
      cloneTimer: 0,
      waveTimer: 0,
      isFrenzied: false,
      // 火焰核心攻击计时
      firePillarCooldown: 0,
      fireBarrageCooldown: 0,
      fireBarrageRotation: 0,
      // 虚空织法者攻击计时
      teleportTimer: BOSS_VOID_TELEPORT_INTERVAL * 0.5,
      voidLineTimer: 0,
      slowFieldTimer: 0,
      voidProjectileCooldown: 0,
    }
  }

  /** 生成 Boss 掉落物 */
  const spawnBossDrops = (boss, x, y) => {
    if (!boss.dropTable) return
    const allDrops = []

    // 必定掉落
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

    // 扩展掉落（预留）
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

    // 掉落物也写入 effects 生成小型拾取标记
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

  // ─── 伤害 Boss ───
  const damageBoss = (damage) => {
    if (!activeBoss.value || activeBoss.value.dead) return
    if (bossState.value !== 'active') return

    activeBoss.value.hp -= damage
    activeBoss.value.hitFlash = 6

    if (activeBoss.value.hp <= 0) {
      activeBoss.value.hp = 0
      bossState.value = 'dying'
      bossSpawnPauseTimer.value = 0
      // 死亡特效
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

    // 检查阶段切换
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

      // 阶段切换特效
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

  // ─── 主 tick ───

  const tickBossSpawn = (dt) => {
    if (bossState.value !== 'idle') {
      // 冷却递减（仅 idle 状态）
      if (bossCooldownRemaining.value > 0) {
        bossCooldownRemaining.value = Math.max(0, bossCooldownRemaining.value - dt)
      }
      return
    }

    // 冷却递减
    if (bossCooldownRemaining.value > 0) {
      bossCooldownRemaining.value = Math.max(0, bossCooldownRemaining.value - (bossDebug.skipCooldown ? 999999 : dt))
      if (bossCooldownRemaining.value > 0) return
    }

    // 触发条件检查
    const firstTrigger = lastBossDefeatTime.value === 0
    let canTrigger = false

    if (firstTrigger) {
      // 首次 Boss：游戏时间 ≥ 2min + Lv ≥ 3
      canTrigger = gameState.gameTime >= BOSS_FIRST_TRIGGER_TIME && player.level >= 3
    } else {
      // 后续 Boss：冷却结束 + Lv 高于上次 +2
      canTrigger = bossCooldownRemaining.value <= 0 && player.level >= lastDefeatedBossLv.value + 2
    }

    if (!canTrigger) return

    const config = pickBoss()
    if (!config) return

    lastBossId.value = config.id

    // 进入警告阶段
    bossState.value = 'warning'
    bossWarningTimer.value = BOSS_WARNING_DURATION
    bossSpawnPauseTimer.value = BOSS_SPAWN_PAUSE_DURATION
    spawnPause.value = true

    log('\u26A0\uFE0F 强大的敌人正在接近...')
    // 屏幕震动效果
    effects.value.push({
      type: 'screenShake',
      x: player.x, y: player.y,
      duration: BOSS_WARNING_DURATION,
      elapsed: 0,
    })
  }

  const updateBoss = (dt) => {
    // ─── 状态机 tick ───
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
      // 暂停结束后生成 Boss
      if (!activeBoss.value) {
        const config = BOSS_TABLE.find(b => b.id === lastBossId.value)
        if (config) {
          // Boss 在玩家附近生成（屏幕中央区域）
          const bx = player.x + (Math.random() - 0.5) * 200
          const by = player.y + (Math.random() - 0.5) * 200
          activeBoss.value = createBossEntity(config, bx, by)
          enemies.value.push(activeBoss.value)

          // 登场粒子聚合特效
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
      // Boss AI 调度
      switch (activeBoss.value.bossId) {
        case 'shadowAmalgam': aiShadowAmalgam(dt); break
        case 'infernoCore':    aiInfernoCore(dt); break
        case 'voidWeaver':     aiVoidWeaver(dt); break
      }
    }

    if (bossState.value === 'dying') {
      // 等待死亡特效播完
      const deathEffect = effects.value.find(e => e.type === 'bossDeathExplosion')
      if (!deathEffect) {
        // 特效播完 → 掉落 + 清理
        if (activeBoss.value) {
          const b = activeBoss.value
          gainExp(b.expReward)
          spawnBossDrops(b, b.x, b.y)
          // 标记死亡
          b.dead = true
          gameState.killCount++
          lastDefeatedBossLv.value = player.level
          lastBossDefeatTime.value = gameState.gameTime
          bossCooldownRemaining.value = BOSS_COOLDOWN
        }
        // 清理假身
        cleanupClones()
        activeBoss.value = null
        spawnRateMultiplier.value = 1.0
        voidLines.value = []
        slowFields.value = []
        bossState.value = 'idle'
      }
    }

    // ─── voidLines / slowFields 生命周期管理 ───
    voidLines.value.forEach(v => { v.elapsed += dt })
    voidLines.value = voidLines.value.filter(v => v.elapsed < v.duration)

    slowFields.value.forEach(s => { s.elapsed += dt })
    slowFields.value = slowFields.value.filter(s => s.elapsed < s.duration)

    // ─── 分身重分配计时（仅在 active 状态） ───
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

  // ─── 暗影聚合体 AI ───
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

    // ── 移动（仅真身） ──
    if (b.isCloneMaster && dist > 1) {
      b.x += ndx * b.speed * speedMult
      b.y += ndy * b.speed * speedMult
    }

    // ── 近战拍击 ──
    b.slamCooldown -= dt
    if (b.slamCooldown <= 0 && dist <= BOSS_SLAM_RANGE + b.size) {
      b.slamCooldown = BOSS_SLAM_COOLDOWN * cdMult
      // 拍击预警
      effects.value.push({
        type: 'bossSlamWarn',
        x: b.x, y: b.y,
        radius: BOSS_SLAM_RANGE,
        angle: Math.atan2(dy, dx),
        duration: BOSS_SLAM_WARN_DURATION,
        elapsed: 0,
        color: b.color,
      })
      // 延迟伤害（用特效计时触发）
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
      // 伤害判定
      const slamDx = player.x - b.x
      const slamDy = player.y - b.y
      const slamDist = Math.sqrt(slamDx * slamDx + slamDy * slamDy)
      const slamAngle = Math.atan2(slamDy, slamDx)
      const angleDiff = Math.abs(((slamAngle - Math.atan2(dy, dx) + Math.PI) % (Math.PI * 2)) - Math.PI)
      if (slamDist <= BOSS_SLAM_RANGE + ENTITY_SIZE && angleDiff <= (BOSS_SLAM_ANGLE / 2) * Math.PI / 180) {
        tryDamagePlayer(BOSS_SLAM_DAMAGE)
      }
    }

    // ── 暗影球 ──
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

    // ── 暗影分身（阶段 2+） ──
    if (b.currentPhaseIdx >= 1 && bossClones.value.length === 0 && b.cloneTimer <= 0) {
      createClones()
      b.cloneTimer = BOSS_CLONE_REASSIGN_INTERVAL
    }

    // ── 暗影波纹（阶段 3） ──
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

  // ─── 火焰核心 AI ───
  const aiInfernoCore = (dt) => {
    const b = activeBoss.value
    if (!b) return

    const dx = player.x - b.x
    const dy = player.y - b.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const ndx = dist > 0 ? dx / dist : 0
    const ndy = dist > 0 ? dy / dist : 0

    // ── 保持距离（150~250px 舒适区） ──
    const comfortMin = 150
    const comfortMax = 250
    if (dist > 0 && dist < comfortMin) {
      b.x -= ndx * b.speed
      b.y -= ndy * b.speed
    } else if (dist > comfortMax) {
      b.x += ndx * b.speed * 0.7
      b.y += ndy * b.speed * 0.7
    }

    // ── 火柱召唤 ──
    b.firePillarCooldown -= dt
    if (b.firePillarCooldown <= 0) {
      b.firePillarCooldown = BOSS_FIRE_PILLAR_INTERVAL
      // 超火柱数清理旧预警
      const existingWarns = effects.value.filter(e => e.type === 'firePillarWarn').length
      if (existingWarns >= BOSS_FIRE_PILLAR_MAX) {
        // 移除最旧的预警
        const oldest = effects.value.findIndex(e => e.type === 'firePillarWarn')
        if (oldest !== -1) effects.value.splice(oldest, 1)
      }
      // 在玩家位置释放火柱预警
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

    // ── 旋转火弹幕 ──
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

  // ─── 虚空织法者 AI ───
  const aiVoidWeaver = (dt) => {
    const b = activeBoss.value
    if (!b) return

    const dx = player.x - b.x
    const dy = player.y - b.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    // ── 传送 ──
    b.teleportTimer -= dt
    if (b.teleportTimer <= 0) {
      b.teleportTimer = BOSS_VOID_TELEPORT_INTERVAL
      // 传送特效：消失
      effects.value.push({
        type: 'voidTeleportOut',
        x: b.x, y: b.y,
        radius: b.size * 0.8,
        duration: 300,
        elapsed: 0,
        color: b.color,
      })
      // 新位置（距玩家 100~300px 随机）
      const angle = Math.random() * Math.PI * 2
      const rad = 100 + Math.random() * 200
      const nx = player.x + Math.cos(angle) * rad
      const ny = player.y + Math.sin(angle) * rad
      // 延迟 300ms 后出现
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

    // ── 虚空线 ──
    b.voidLineTimer -= dt
    if (b.voidLineTimer <= 0) {
      b.voidLineTimer = BOSS_VOID_LINE_INTERVAL
      // 生成一组虚空线（2条平行线）
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

    // ── 减速场 ──
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

    // ── 追踪弹幕 ──
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

    // ── voidLines 玩家伤害检测 ──
    voidLines.value.forEach(v => {
      const lastTick = v.lastDamageTick || 0
      if (gameState.gameTime - lastTick >= 1000) {
        v.lastDamageTick = gameState.gameTime
        // 检查玩家是否在两条线之间的区域内
        if (isPointBetweenLines(player.x, player.y, v.l1, v.l2, v.gap)) {
          tryDamagePlayer(v.damagePerSec)
        }
      }
    })

    // ── slowFields 减速检测 ──
    let totalSlow = 0
    slowFields.value.forEach(s => {
      const sd = Math.sqrt((player.x - s.x) ** 2 + (player.y - s.y) ** 2)
      if (sd <= s.radius) {
        totalSlow = Math.max(totalSlow, s.slowRatio)
      }
    })
    // slow multiplier 存入 player 临时字段
    player._bossSlowMultiplier = 1 - totalSlow
  }

  // ─── 辅助函数 ───

  /** 判断点是否在两条平行线之间 */
  const isPointBetweenLines = (px, py, l1, l2, gap) => {
    const cx = (l1.x1 + l2.x1) / 2
    const cy = (l1.y1 + l2.y1) / 2
    const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
    if (dist > gap * 1.5) return false

    // 简化为：检查点到两条线的距离之和 ≈ gap（近似）
    const d1 = pointToLine(px, py, l1.x1, l1.y1, l1.x2, l1.y2)
    const d2 = pointToLine(px, py, l2.x1, l2.y1, l2.x2, l2.y2)
    // 两条线间区域
    const lineDirX = l1.x2 - l1.x1
    const lineDirY = l1.y2 - l1.y1
    const lineLen = Math.sqrt(lineDirX * lineDirX + lineDirY * lineDirY)
    if (lineLen === 0) return false
    // 投影到线段上的 t 参数
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

  // ─── 暗影分身管理 ───

  const createClones = () => {
    if (!activeBoss.value) return
    const b = activeBoss.value

    // 清理旧分身
    cleanupClones()

    // 3 个候选位置：真身位置 + 2 个随机位置
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

    // 随机打乱
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }

    // 第一个位置给真身
    b.x = positions[0].x
    b.y = positions[0].y
    b.isCloneMaster = true

    // 后两个位置生成假身
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
        // 假身不携带攻击计时器
      }
      bossClones.value.push(clone)
      enemies.value.push(clone)
    }
  }

  const reassignClones = () => {
    if (!activeBoss.value || activeBoss.value.dead) return
    const b = activeBoss.value

    // 删除旧假身
    bossClones.value.forEach(c => {
      const idx = enemies.value.indexOf(c)
      if (idx !== -1) enemies.value.splice(idx, 1)
    })
    bossClones.value = []

    // 重新随机真身位置
    const posCount = 3
    const positions = []
    for (let i = 0; i < posCount; i++) {
      positions.push({
        x: player.x + (Math.random() - 0.5) * 300,
        y: player.y + (Math.random() - 0.5) * 300,
      })
    }
    // Fisher-Yates shuffle
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }

    b.x = positions[0].x
    b.y = positions[0].y
    b.isCloneMaster = true

    // 新建假身
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

  // ─── 重置 ───

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
    cleanupClones()
    voidLines.value = []
    slowFields.value = []
  }

  // ─── Boss 减速对玩家移动的影响 ───
  const getBossSlowMultiplier = () => {
    return player._bossSlowMultiplier ?? 1
  }

  return {
    activeBoss, bossState, bossCooldownRemaining,
    spawnPause, spawnRateMultiplier,
    bossClones, voidLines, slowFields,
    isBossActive, isBossWarning, currentPhase,
    tickBossSpawn, updateBoss, damageBoss, resetBossState,
    getBossSlowMultiplier,

    /** 调试：强制刷 Boss（传入 bossId，空字符串=随机） */
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

    /** 调试：强制击杀当前 Boss */
    debugForceKill() {
      if (!activeBoss.value || bossState.value !== 'active') return
      activeBoss.value.hp = 0
      activeBoss.value.dead = true
      bossState.value = 'dying'
      log('\u2620 [调试] 强制击杀 Boss')
    },
  }
}
