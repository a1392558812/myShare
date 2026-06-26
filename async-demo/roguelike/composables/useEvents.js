/**
 * useEvents — 随机事件与环境交互系统
 * 管理事件生成、生命周期、激活检测、死亡区域逻辑
 */
import { ref, reactive } from 'vue'
import {
  EVENT_UNLOCK_LEVEL,
  EVENT_TYPES,
  CHEST_ITEM_TABLE,
  EVENT_SPAWN_INTERVAL,
  EVENT_MAX_COUNT,
  EVENT_TYPE_COOLDOWN,
} from '../constants.js'
import { pushBattleLog } from './useBattleLog.js'

/**
 * @param {import('vue').Ref<Array>} enemies - 敌人列表
 * @param {import('vue').UnwrapNestedRefs} player - 玩家状态
 * @param {import('vue').UnwrapNestedRefs} gameState - 游戏全局状态
 * @param {object} buffUtils - { addBuff, hasBuff }
 * @param {import('vue').Ref<Array>} battleLog - 战斗日志
 * @param {object} callbacks - { onShowStelePrompt, onChestOpen }
 */
export function useEvents(enemies, player, gameState, buffUtils, battleLog, callbacks = {}) {
  const log = (msg) => pushBattleLog(battleLog, msg)

  /** 所有活跃事件实例 */
  const events = ref([])

  /** 类型冷却记录 { typeId: nextAvailableTime } */
  const typeCooldowns = reactive({})

  /** 事件生成计时器 */
  let spawnTimer = 0
  let nextSpawnInterval = randomInterval()

  /** 诅咒石碑状态 */
  const cursedActive = ref(false)
  const cursedRemainingRef = ref(0)
  const enemyDamageMultiplier = ref(1)
  const dropRateMultiplier = ref(1)

  /** 待确认的诅咒石碑（供 UI 弹窗） */
  const pendingStele = ref(null)

  function randomInterval() {
    return EVENT_SPAWN_INTERVAL[0] + Math.random() * (EVENT_SPAWN_INTERVAL[1] - EVENT_SPAWN_INTERVAL[0])
  }

  // ═══════════════════ 事件生成 ═══════════════════

  /**
   * 在屏幕内随机生成一个事件
   * @param {object} camera - 相机位置
   * @param {object} canvasSize - 画布尺寸 { width, height }
   */
  const spawnEvent = (camera, canvasSize) => {
    const now = gameState.gameTime
    const playerLevel = player.level || 1

    // 等级未解锁
    if (playerLevel < EVENT_UNLOCK_LEVEL) return

    // 数量上限
    if (events.value.length >= EVENT_MAX_COUNT) return

    // 收集当前死亡区域位置
    const deathZones = events.value.filter(e => e.type === 'deathZone')

    // 过滤可用事件类型
    const typesConfig = Object.values(EVENT_TYPES)
    const availableTypes = typesConfig.filter(cfg => {
      // 同类型冷却
      if (typeCooldowns[cfg.id] && typeCooldowns[cfg.id] > now) return false
      // 死亡区域自身不阻塞，但其他事件不可生成在死亡区域内
      if (cfg.blockOnDeathZone && deathZones.length > 0) {
        // 在任何死亡区域内都是禁止的 (生成位置会检查，这里放宽)
      }
      return true
    })

    if (availableTypes.length === 0) return

    // 随机选类型
    const cfg = availableTypes[Math.floor(Math.random() * availableTypes.length)]

    // 计算生成位置 (屏幕内随机，避开规则)
    const margin = 60
    let sx, sy
    let attempts = 0
    do {
      sx = camera.x + (Math.random() - 0.5) * (canvasSize.width - margin * 2)
      sy = camera.y + (Math.random() - 0.5) * (canvasSize.height - margin * 2)

      // 死亡区域：不在玩家周围生成
      if (cfg.id === 'deathZone') {
        const d = Math.sqrt((sx - player.x) ** 2 + (sy - player.y) ** 2)
        if (d < (cfg.minPlayerDistance || 150)) { sx = null; continue }
      }

      // 宝箱/祭坛类：不在死亡区域内
      if (cfg.blockOnDeathZone && deathZones.length > 0) {
        const inZone = deathZones.some(z => {
          const d = Math.sqrt((sx - z.x) ** 2 + (sy - z.y) ** 2)
          return d <= (z.zoneRadius || z.radius || 80)
        })
        if (inZone) { sx = null; continue }
      }

      attempts++
    } while (sx === null && attempts < 20)

    if (sx === null) return // 找不到合适位置，放弃生成本次

    // 创建事件实例
    const event = reactive({
      id: Date.now() + Math.random(),
      type: cfg.id,
      name: cfg.name,
      icon: cfg.icon,
      color: cfg.color,
      color2: cfg.color2,
      x: sx,
      y: sy,
      duration: cfg.duration,    // 事件存在时间
      remaining: cfg.duration,
      activated: false,
      config: cfg,                // 保留完整配置引用
      // 死亡区域专属
      zoneRadius: cfg.zoneRadius || cfg.radius || 80,
      damagePerSec: cfg.damagePerSec || 0,
      slowRatio: cfg.slowRatio || 0,
    })

    events.value.push(event)

    // 设置同类型冷却
    typeCooldowns[cfg.id] = now + cfg.cooldown

    // 死亡区域上限控制
    if (cfg.id === 'deathZone') {
      const allZones = events.value.filter(e => e.type === 'deathZone')
      const maxCount = cfg.maxCount || 5
      if (allZones.length > maxCount) {
        // 移除最老的
        const oldest = allZones[0]
        const idx = events.value.findIndex(e => e.id === oldest.id)
        if (idx !== -1) events.value.splice(idx, 1)
      }
    }
  }

  // ═══════════════════ 事件激活处理 ═══════════════════

  /**
   * 检测玩家与事件的交互
   * @returns {{ stelePrompt: boolean }} 是否有弹窗需要显示
   */
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

      // 力量祭坛 / 速度神龛 → 自动激活
      if (cfg.id === 'altar' || cfg.id === 'shrine') {
        event.activated = true
        const value = cfg.buffValue
        buffUtils.addBuff(cfg.buffType, cfg.buffLabel, value, cfg.buffDuration, cfg.id)
        log(`激活了${cfg.name}！${cfg.buffLabel}`)
        // 激活后立即移除事件（祭坛/神龛消失）
        const idx = events.value.findIndex(e => e.id === event.id)
        if (idx !== -1) events.value.splice(idx, 1)
        continue
      }

      // 宝箱 → 自动拾取
      if (cfg.id === 'chest') {
        event.activated = true
        openChest(event)
        const idx = events.value.findIndex(e => e.id === event.id)
        if (idx !== -1) events.value.splice(idx, 1)
        continue
      }

      // 诅咒石碑 → 弹窗确认（由 UI 层处理）
      if (cfg.id === 'cursedStele') {
        if (!event.activated) {
          // 3 秒拒绝冷却：取消后不立即弹窗
          if (event._steleRejectAt && Date.now() - event._steleRejectAt < 3000) continue
          stelePrompt = true
          pendingStele.value = event
        }
        continue
      }
    }

    // 玩家不在任何石碑范围内 → 清除弹窗
    if (!stelePrompt && pendingStele.value) {
      pendingStele.value = null
    }

    return { stelePrompt }
  }

  // ═══════════════════ 宝箱开箱 ═══════════════════

  const openChest = (event) => {
    const cfg = event.config
    const count = cfg.itemCountMin + Math.floor(Math.random() * (cfg.itemCountMax - cfg.itemCountMin + 1))

    // 权重随机选择物品
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

    // 应用物品效果
    const itemNames = []
    rolledItems.forEach(item => {
      if (item.healAmount) {
        player.hp = Math.min(player.maxHp, player.hp + item.healAmount)
      }
      if (item.expAmount) {
        player.exp += item.expAmount
        // 触发升级检查（由外部 gainExp 处理，这里直接加 exp）
        if (callbacks.onGainExp) callbacks.onGainExp(item.expAmount)
      }
      if (item.effect === 'upgradeRandomSkill') {
        if (callbacks.onUpgradeRandomSkill) {
          callbacks.onUpgradeRandomSkill()
        } else {
          // 降级：给经验
          player.exp += 300
          if (callbacks.onGainExp) callbacks.onGainExp(300)
        }
      }
      if (item.goldAmount) {
        player.gold = (player.gold || 0) + item.goldAmount
      }
      itemNames.push(item.icon + item.name)
    })

    log(`打开宝箱！获得：${itemNames.join('、')}`)
  }

  // ═══════════════════ 诅咒石碑 ═══════════════════

  /** 玩家确认激活诅咒石碑 */
  const activateCursedStele = () => {
    if (!pendingStele.value) return

    const event = pendingStele.value
    event.activated = true
    cursedActive.value = true
    cursedRemainingRef.value = event.config.effectDuration || 60000
    enemyDamageMultiplier.value = event.config.enemyBuffRatio || 1.3
    dropRateMultiplier.value = event.config.dropRateMultiplier || 2.5

    log(`激活诅咒石碑！敌人强度+${Math.round((enemyDamageMultiplier.value - 1) * 100)}%，掉落×${dropRateMultiplier.value}，持续${(cursedRemainingRef.value / 1000).toFixed(0)}s`)

    // 移除石碑
    const idx = events.value.findIndex(e => e.id === event.id)
    if (idx !== -1) events.value.splice(idx, 1)
    pendingStele.value = null
  }

  /** 玩家取消诅咒石碑 */
  const cancelCursedStele = () => {
    // 标记拒绝时间，3 秒内不重复弹窗（避免取消后立刻再次触发）
    if (pendingStele.value) {
      pendingStele.value._steleRejectAt = Date.now()
    }
    pendingStele.value = null
  }

  // ═══════════════════ 死亡区域玩家影响 ═══════════════════

  /**
   * 每帧更新死亡区域对玩家的影响
   * @param {number} dt - 帧间隔
   * @returns {{ inZoneSlow: number }} 减速比例
   */
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
        // 减速
        slowAmount = Math.max(slowAmount, zone.slowRatio || 0.3)
        // 持续扣血
        zone.damageTimer = (zone.damageTimer || 0) + dt
        if (zone.damageTimer >= 1000) {
          zone.damageTimer -= 1000
          if (callbacks.onTryDamagePlayer) {
            callbacks.onTryDamagePlayer(zone.damagePerSec || 3)
          }
        }
      }
    })

    return { inZoneSlow: slowAmount }
  }

  /** 获取所有死亡区域（供绘制层使用） */
  const getDeathZones = () => events.value.filter(e => e.type === 'deathZone')

  // ═══════════════════ 调试：强制生成事件 ═══════════════════

  /**
   * 调试用：在玩家附近强制生成指定类型事件，跳过所有冷却/等级/数量限制
   * @param {string} typeId - 事件类型 id（如 'altar', 'shrine', 'chest', 'cursedStele', 'deathZone'）
   */
  const debugSpawnEvent = (typeId) => {
    const key = Object.keys(EVENT_TYPES).find(k => EVENT_TYPES[k].id === typeId)
    if (!key) return
    const cfg = EVENT_TYPES[key]

    // 在玩家周围 100~220px 范围内随机生成
    const angle = Math.random() * Math.PI * 2
    const dist = 100 + Math.random() * 120
    const sx = player.x + Math.cos(angle) * dist
    const sy = player.y + Math.sin(angle) * dist

    // 创建事件实例（与 spawnEvent 一致的结构）
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

  // ═══════════════════ 主循环 tick ═══════════════════

  /**
   * 每帧调用：事件计时 + 生成 + 诅咒计时
   * @param {number} dt - 帧间隔 ms
   * @param {object} camera - 相机位置
   * @param {object} canvasSize - 画布尺寸
   * @param {Function} tryDamagePlayer - 玩家伤害函数（来自 useEnemy）
   */
  const tickEvents = (dt, camera, canvasSize) => {
    // 1. 事件生命周期：倒计时 → 过期移除
    for (let i = events.value.length - 1; i >= 0; i--) {
      const e = events.value[i]
      if (e.activated) continue // 已激活的等子逻辑清理

      // 死亡区域永久存在，不倒计时
      if (e.type === 'deathZone') continue

      e.remaining -= dt
      if (e.remaining <= 0) {
        events.value.splice(i, 1)
      }
    }

    // 2. 死亡区域对玩家影响
    tickDeathZones(dt)

    // 3. 诅咒石碑计时
    if (cursedActive.value) {
      cursedRemainingRef.value -= dt
      if (cursedRemainingRef.value <= 0) {
        cursedActive.value = false
        cursedRemainingRef.value = 0
        enemyDamageMultiplier.value = 1
        dropRateMultiplier.value = 1
      }
    }

    // 4. 事件生成
    spawnTimer += dt
    if (spawnTimer >= nextSpawnInterval) {
      spawnTimer -= nextSpawnInterval
      nextSpawnInterval = randomInterval()
      spawnEvent(camera, canvasSize)
    }
  }

  /** 获取诅咒石碑效果（供 useEnemy / useEnemySpawner 查询） */
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
    getEnemyDamageMultiplier,
    getDropRateMultiplier,
    isCursedActive,
    debugSpawnEvent,
  }
}
