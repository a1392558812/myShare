/**
 * useEnemySpawner — 敌人波次生成、难度递增、生成位置计算
 * 管理敌人刷新逻辑与生命周期清理
 */
import { reactive } from 'vue'
import {
  getEnemyTypeTable,
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

/**
 * @param {import('vue').Ref<Array>} enemies - 敌人列表
 * @param {import('vue').UnwrapNestedRefs} gameState - 游戏状态（spawnTimer）
 * @param {import('vue').UnwrapNestedRefs} camera - 摄像机位置
 * @param {import('vue').Ref<HTMLCanvasElement|null>} gameCanvas - 画布引用
 * @param {object} playerRefs - { gainExp } 玩家经验获取函数
 * @param {import('vue').Ref<Array>} battleLog - 战斗日志
 */
export function useEnemySpawner(enemies, gameState, camera, gameCanvas, playerRefs, battleLog) {
  const { enemyDebug } = useDebug()
  const log = (msg) => pushBattleLog(battleLog, msg)

  /**
   * 生成单个敌人（权重随机类型，镜头边界外随机位置）
   */
  const spawnEnemy = () => {
    const canvas = gameCanvas.value
    if (!canvas) return

    // 根据玩家等级获取动态敌人类型权重表
    const playerLevel = playerRefs?.player?.level ?? 1
    const typeTable = getEnemyTypeTable(playerLevel)

    // 权重随机选择敌人类型
    const totalWeight = typeTable.reduce((sum, t) => sum + t.weight, 0)
    let rand = Math.random() * totalWeight
    let chosenType = typeTable[0]
    for (const t of typeTable) {
      rand -= t.weight
      if (rand <= 0) { chosenType = t; break }
    }

    const attrs = chosenType.attrs
    const isElite = !!attrs.eliteTier

    // 根据玩家等级缩放敌人属性
    let scaledHp, scaledAttack
    if (isElite) {
      // 精英怪：线性成长（Lv7 后开始成长）
      const growth = Math.max(0, playerLevel - 7)
      scaledHp = Math.round(attrs.maxHp + growth * (attrs.hpGrowth || 0))
      scaledAttack = Math.round(attrs.attack + growth * (attrs.attackGrowth || 0))
    } else {
      // 普通敌人：指数缩放
      scaledHp = scaleEnemyStat(playerLevel, attrs.maxHp, ENEMY_HP_SCALE_RATE)
      scaledAttack = scaleEnemyStat(playerLevel, attrs.attack, ENEMY_ATTACK_SCALE_RATE)
    }

    // 通过组件 expose 的方法获取画布尺寸
    const size = canvas.getCanvasSize ? canvas.getCanvasSize() : { width: 800, height: 600 }
    if (!size.width || !size.height) return

    // 在镜头边界外 SPAWN_MARGIN 处随机位置刷新
    const side = Math.floor(Math.random() * 4) // 0:上 1:右 2:下 3:左
    let spawnX, spawnY
    const hw = size.width / 2 + SPAWN_MARGIN
    const hh = size.height / 2 + SPAWN_MARGIN

    switch (side) {
      case 0: spawnX = camera.x + (Math.random() - 0.5) * 2 * hw; spawnY = camera.y - hh; break
      case 1: spawnX = camera.x + hw; spawnY = camera.y + (Math.random() - 0.5) * 2 * hh; break
      case 2: spawnX = camera.x + (Math.random() - 0.5) * 2 * hw; spawnY = camera.y + hh; break
      case 3: spawnX = camera.x - hw; spawnY = camera.y + (Math.random() - 0.5) * 2 * hh; break
    }

    // ═══════ 属性随机浮动 ═══════
    const floatHp = Math.round(scaledHp * (0.85 + Math.random() * 0.3))        // ±15%
    const floatSpeed = attrs.speed * (0.9 + Math.random() * 0.2)                // ±10%
    const floatSize = attrs.size * (0.9 + Math.random() * 0.3)                  // -10%~+20%

    // ═══════ 经验奖励（精英怪按稀有度翻倍） ═══════
    let finalExpReward = attrs.expReward || 0
    if (isElite) {
      const mult = attrs.eliteTier === 'rare' ? 2.5 : 1.5
      finalExpReward = Math.round((attrs.expRewardBase || 0) * mult)
    }

    // 基础敌人对象
    const enemyData = {
      eid: Date.now() + Math.random(),   // 唯一 ID（供护盾兵引用）
      type: chosenType.type,
      eliteTier: attrs.eliteTier || null,
      x: spawnX, y: spawnY,
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

    // ═══════ 类型专属字段初始化 ═══════
    if (chosenType.type === 'bomber') {
      enemyData.bomberRange = attrs.bomberRange || 55
    }
    if (chosenType.type === 'summoner') {
      enemyData.summonTimer = Math.random() * 2000  // 错峰启动
      enemyData.summonCooldown = attrs.summonCooldown || 4000
      enemyData.summonCount = attrs.summonCount || 2
      enemyData.summonMaxMinions = attrs.summonMaxMinions || 6
      enemyData.summonSacrificeDmg = attrs.summonSacrificeDmg || 10
      enemyData.summonSacrificeRadius = attrs.summonSacrificeRadius || 50
      enemyData.boltTimer = 0  // 死灵弹幕计时器
    }
    if (chosenType.type === 'charger') {
      enemyData.chargeTimer = Math.random() * 2000   // 错峰启动
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
    }
    if (chosenType.type === 'shielder') {
      enemyData.shieldAuraRange = attrs.shieldAuraRange || 120
      enemyData.shieldReduction = attrs.shieldReduction || 0.4
      enemyData.shieldedAllyId = null
    }

    // ═══════ 精英怪专属字段初始化 ═══════
    if (chosenType.type === 'elitePriest') {
      enemyData.priestHealTimer = 0
      enemyData.priestHealAmount = Math.round(
        (attrs.priestHealAmount || 8) + Math.max(0, playerLevel - 7) * (attrs.priestHealGrowth || 0)
      )
      enemyData.priestHealInterval = attrs.priestHealInterval || 2000
      enemyData.priestAuraRange = attrs.priestAuraRange || 130
    }
    if (chosenType.type === 'eliteVenom') {
      enemyData.venomBoltTimer = 0
      enemyData.venomBoltDamage = Math.round(
        (attrs.attack || 10) + Math.max(0, playerLevel - 7) * (attrs.venomZoneDamageGrowth || 0.5)
      )
      enemyData.venomWarnDuration = attrs.venomWarnDuration || 800
      enemyData.venomZoneDuration = attrs.venomZoneDuration || 5000
      enemyData.venomZoneDamage = (attrs.venomZoneDamage || 2) + Math.max(0, playerLevel - 7) * (attrs.venomZoneDamageGrowth || 0.5)
      enemyData.venomZoneRadius = attrs.venomZoneRadius || 50
      enemyData.venomBoltSpeed = attrs.venomBoltSpeed || 4
      enemyData.venomMaxZones = attrs.venomMaxZones || 3
      enemyData.venomZones = []  // 该敌人创建的地面毒区 ID 列表
    }

    enemies.value.push(reactive(enemyData))
  }

  /**
   * 计时器驱动刷新，间隔随游戏时长递减
   */
  const handleSpawning = (dt) => {
    // 调试：暂停刷新
    if (enemyDebug.pauseSpawn) return
    // 只数活着的非召唤物，召唤物不挤占敌人刷新名额（排除 dead 尸体）
    const realEnemyCount = enemies.value.filter(e => !e.summonedBy && !e.dead).length
    if (realEnemyCount >= MAX_ENEMIES) return

    gameState.spawnTimer += dt
    const elapsedSec = gameState.gameTime / 1000
    const interval = Math.max(SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_INITIAL - elapsedSec * SPAWN_INTERVAL_DECREASE_PER_SEC)
    if (gameState.spawnTimer >= interval) {
      gameState.spawnTimer -= interval
      spawnEnemy()
    }
  }

  /**
   * 清理已死亡敌人
   */
  const cleanupDead = () => {
    enemies.value = enemies.value.filter(e => !e.dead)
  }

  return { spawnEnemy, handleSpawning, cleanupDead }
}
