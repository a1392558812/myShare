/**
 * usePlayer — 玩家移动、攻击、状态更新、死亡判定
 * 管理所有与玩家直接相关的游戏逻辑
 */
import { reactive } from 'vue'
import {
  PLAYER_ATTRS,
  SKILL_TABLE,
  EXP_LEVEL_TABLE,
  ENTITY_SIZE,
  ARROW_SIZE,
  FRAME_INTERVAL,
  FRAME_COUNT,
  DIRECTION,
  calcSkillValue,
} from '../constants.js'

/**
 * @param {import('vue').UnwrapNestedRefs} player - 玩家响应式状态
 * @param {import('vue').UnwrapNestedRefs} gameState - 游戏全局状态
 * @param {object} keysDown - 键盘按下状态
 * @param {import('vue').Ref<boolean>} mouseHeld - 鼠标是否持续按下
 * @param {import('vue').UnwrapNestedRefs} mouseScreen - 鼠标屏幕坐标
 * @param {import('vue').Ref<HTMLCanvasElement|null>} gameCanvas - 画布引用
 * @param {import('vue').Ref<Array>} enemies - 敌人列表
 * @param {import('vue').Ref<Array>} projectiles - 弹幕列表
 * @param {import('vue').Ref<Array>} effects - 视觉特效列表
 * @param {object} mapUtils - { toLogical, checkCollision }
 * @param {import('vue').Ref<Array>} battleLog - 战斗日志
 * @param {import('vue').Ref<Array>} levelUpOptions - 升级选项
 */
export function usePlayer(
  player, gameState, keysDown, mouseHeld, mouseScreen,
  gameCanvas, enemies, projectiles, effects,
  mapUtils, battleLog, levelUpOptions,
) {
  const { toLogical, checkCollision } = mapUtils

  // ─── 内部辅助 ───
  const log = (msg) => {
    battleLog.value.unshift({ time: Date.now(), text: msg })
    if (battleLog.value.length > 50) battleLog.value.pop()
  }

  const gainExp = (amount) => {
    player.exp += amount
    checkLevelUp()
  }

  const checkLevelUp = () => {
    while (player.level < EXP_LEVEL_TABLE.length && player.exp >= EXP_LEVEL_TABLE[player.level]) {
      player.level++
      showLevelUpOptions()
    }
    if (player.level >= EXP_LEVEL_TABLE.length) {
      const threshold = EXP_LEVEL_TABLE[EXP_LEVEL_TABLE.length - 1] + (player.level - EXP_LEVEL_TABLE.length + 1) * 2000
      if (player.exp >= threshold) {
        player.level++
        showLevelUpOptions()
      }
    }
  }

  // ─── 技能实例工厂 ───

  /** 从技能模板创建响应式技能实例 */
  const createSkillInstance = (template, level = 1) => {
    return reactive({
      id: template.id,
      name: template.name,
      icon: template.icon,
      description: template.description,
      cooldown: template.cooldown,
      damage: template.damage,
      range: template.range,
      projectileSpeed: template.projectileSpeed || 0,
      duration: template.duration || 0,
      lifestealPercent: template.lifestealPercent || 0,
      growth: template.growth,
      currentLevel: level,
      remainingCooldown: 0,
      active: false,
      auraTimer: 0,
      auraDamage: 0,
      auraLifesteal: 0,
      auraRange: 0,
      auraTickTimer: 0,
    })
  }

  // ─── 玩家操作 ───

  /** 寻找最近敌人 */
  const findNearestEnemy = (maxRange) => {
    let nearest = null
    let minDist = maxRange
    enemies.value.forEach(e => {
      if (e.dead) return
      const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2)
      if (d < minDist) { minDist = d; nearest = e }
    })
    return nearest
  }

  /** 对敌人造成伤害 */
  const damageEnemy = (enemy, dmg) => {
    enemy.hp -= dmg
    enemy.hitFlash = 6
    if (enemy.hp <= 0) {
      enemy.dead = true
      gameState.killCount++
      gainExp(enemy.expReward)
      log(`击杀 ${enemy.type} 敌人`)
    }
  }

  /** 射箭 */
  const fireArrow = () => {
    const arrowSkill = player.skills.find(s => s.id === 'arrow')
    if (!arrowSkill || arrowSkill.remainingCooldown > 0) return

    const ctx = gameCanvas.value
    if (!ctx) return
    const mouseLogical = toLogical(mouseScreen.x, mouseScreen.y, ctx)
    const dx = mouseLogical.x - player.x
    const dy = mouseLogical.y - player.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 1) return

    const dmg = calcSkillValue(arrowSkill.damage, arrowSkill.growth.damage, arrowSkill.currentLevel)
    const effectiveSpeed = calcSkillValue(arrowSkill.projectileSpeed, arrowSkill.growth.projectileSpeed, arrowSkill.currentLevel)
    const effectiveCooldown = calcSkillValue(arrowSkill.cooldown, arrowSkill.growth.cooldown, arrowSkill.currentLevel)

    projectiles.value.push({
      type: 'arrow',
      x: player.x, y: player.y,
      vx: (dx / dist) * effectiveSpeed,
      vy: (dy / dist) * effectiveSpeed,
      damage: dmg,
      size: ARROW_SIZE,
      owner: 'player',
      direction: dx >= 0 ? DIRECTION.RIGHT : DIRECTION.LEFT,
    })

    arrowSkill.remainingCooldown = effectiveCooldown
  }

  /** 激活技能 */
  const activateSkill = (skill) => {
    if (skill.remainingCooldown > 0 || gameState.isDead || gameState.levelUpPending) return
    const dmg = calcSkillValue(skill.damage, skill.growth?.damage, skill.currentLevel)
    const effectiveRange = calcSkillValue(skill.range, skill.growth?.range, skill.currentLevel)
    const effectiveCooldown = calcSkillValue(skill.cooldown, skill.growth?.cooldown, skill.currentLevel)

    if (skill.id === 'meleeAttack') {
      const canvas = gameCanvas.value
      effects.value.push({
        type: 'meleeSlash',
        x: player.x, y: player.y,
        radius: effectiveRange,
        duration: 300, elapsed: 0,
        angle: canvas
          ? Math.atan2(mouseScreen.y - canvas.height / 2, mouseScreen.x - canvas.width / 2)
          : 0,
      })
      enemies.value.forEach(e => {
        const dx = e.x - player.x
        const dy = e.y - player.y
        if (Math.sqrt(dx * dx + dy * dy) <= effectiveRange + e.size / 2) {
          damageEnemy(e, dmg)
        }
      })
      skill.remainingCooldown = effectiveCooldown
      log(`近战劈斩！`)
    } else if (skill.id === 'autoSeek') {
      const effectiveProjSpeed = calcSkillValue(skill.projectileSpeed, skill.growth?.projectileSpeed, skill.currentLevel)
      const nearest = findNearestEnemy(effectiveRange)
      if (nearest) {
        const dx = nearest.x - player.x
        const dy = nearest.y - player.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        projectiles.value.push({
          type: 'autoSeek',
          x: player.x, y: player.y,
          vx: (dx / dist) * effectiveProjSpeed,
          vy: (dy / dist) * effectiveProjSpeed,
          damage: dmg,
          size: 10,
          owner: 'player',
          targetEnemy: nearest,
          seekSpeed: effectiveProjSpeed,
        })
        log('追踪弹幕发射！')
      }
      skill.remainingCooldown = effectiveCooldown
    } else if (skill.id === 'freeze') {
      const freezeDur = calcSkillValue(skill.duration, skill.growth?.duration, skill.currentLevel)
      effects.value.push({
        type: 'freezeCircle',
        x: player.x, y: player.y,
        radius: effectiveRange,
        duration: 500, elapsed: 0,
      })
      enemies.value.forEach(e => {
        const dx = e.x - player.x
        const dy = e.y - player.y
        if (Math.sqrt(dx * dx + dy * dy) <= effectiveRange + e.size / 2) {
          damageEnemy(e, dmg)
          e.frozen = true
          e.frozenTimer = freezeDur
        }
      })
      skill.remainingCooldown = effectiveCooldown
      log('冰冻定身！')
    } else if (skill.id === 'vampireAura') {
      const lsPercent = calcSkillValue(skill.lifestealPercent, skill.growth?.lifestealPercent, skill.currentLevel)
      const effectiveDuration = calcSkillValue(skill.duration, skill.growth?.duration, skill.currentLevel)
      skill.active = true
      skill.auraTimer = effectiveDuration
      skill.auraDamage = dmg
      skill.auraLifesteal = lsPercent
      skill.auraRange = effectiveRange
      skill.auraTickTimer = 0
      skill.remainingCooldown = effectiveCooldown
      log('吸血光环启动！')
    }
  }

  const onSkillClick = (sk) => {
    activateSkill(sk)
  }

  // ─── 升级系统 ───

  const showLevelUpOptions = () => {
    gameState.levelUpPending = true
    const options = []

    // 已拥有技能升级选项
    player.skills.forEach(sk => {
      const nextLv = sk.currentLevel + 1
      const nextDmg = calcSkillValue(sk.damage, sk.growth?.damage, nextLv)
      options.push({ ...sk, isNew: false, nextLevel: nextLv, description: `伤害 ${Math.round(nextDmg)}` })
    })

    // 未拥有技能解锁选项
    SKILL_TABLE.forEach(sk => {
      if (sk.unlockLevel <= player.level && !player.skills.find(s => s.id === sk.id)) {
        options.push({ ...sk, isNew: true, nextLevel: 1 })
      }
    })

    levelUpOptions.value = options.slice(0, 3)
    if (levelUpOptions.value.length === 0) {
      gameState.levelUpPending = false
    }

    log(`升级至 Lv.${player.level}！`)
  }

  const onLevelUpChoice = (opt) => {
    if (opt.isNew) {
      player.skills.push(createSkillInstance(opt, 1))
      log(`习得新技能：${opt.name}`)
    } else {
      const sk = player.skills.find(s => s.id === opt.id)
      if (sk) {
        sk.currentLevel++
        log(`${opt.name} 升级至 Lv.${sk.currentLevel}`)
      }
    }
    gameState.levelUpPending = false
  }

  // ─── 每帧更新 ───

  const updatePlayer = (dt) => {
    // 键盘移动
    let dx = 0, dy = 0
    if (keysDown['w'] || keysDown['arrowup']) dy -= 1
    if (keysDown['s'] || keysDown['arrowdown']) dy += 1
    if (keysDown['a'] || keysDown['arrowleft']) dx -= 1
    if (keysDown['d'] || keysDown['arrowright']) dx += 1

    player.isMoving = dx !== 0 || dy !== 0

    if (player.isMoving) {
      const len = Math.sqrt(dx * dx + dy * dy)
      dx /= len; dy /= len
      player.x += dx * player.speed
      player.y += dy * player.speed

      if (Math.abs(dx) > Math.abs(dy)) {
        player.direction = dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT
      } else {
        player.direction = DIRECTION.FRONT
      }

      player.frameTimer += dt
      if (player.frameTimer >= FRAME_INTERVAL) {
        player.frameTimer -= FRAME_INTERVAL
        player.frame = (player.frame + 1) % FRAME_COUNT
      }
    } else {
      player.frame = 0
      player.frameTimer = 0
    }

    // 吸血光环持续伤害
    const vampireSkill = player.skills.find(s => s.id === 'vampireAura' && s.active)
    if (vampireSkill) {
      vampireSkill.auraTimer -= dt
      vampireSkill.auraTickTimer += dt
      if (vampireSkill.auraTickTimer >= 1000) {
        vampireSkill.auraTickTimer -= 1000
        enemies.value.forEach(e => {
          if (e.dead) return
          const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2)
          if (d <= vampireSkill.auraRange + e.size / 2) {
            damageEnemy(e, vampireSkill.auraDamage)
            player.hp = Math.min(PLAYER_ATTRS.maxHp, player.hp + vampireSkill.auraDamage * vampireSkill.auraLifesteal)
          }
        })
      }
      if (vampireSkill.auraTimer <= 0) {
        vampireSkill.active = false
      }
    }

    // 鼠标持续按下 → 自动射箭
    if (mouseHeld.value && !gameState.isDead && !gameState.levelUpPending) {
      const arrowSkill = player.skills.find(s => s.id === 'arrow')
      if (arrowSkill && arrowSkill.remainingCooldown <= 0) {
        fireArrow()
      }
    }

    // 近战自动劈斩
    const meleeSkill = player.skills.find(s => s.id === 'meleeAttack')
    if (meleeSkill && meleeSkill.remainingCooldown <= 0 && !gameState.isDead && !gameState.levelUpPending) {
      const effectiveMeleeRange = calcSkillValue(meleeSkill.range, meleeSkill.growth?.range, meleeSkill.currentLevel)
      const hasEnemyInRange = enemies.value.some(e => {
        if (e.dead || e.frozen) return false
        const edx = e.x - player.x
        const edy = e.y - player.y
        return Math.sqrt(edx * edx + edy * edy) <= effectiveMeleeRange + e.size / 2
      })
      if (hasEnemyInRange) {
        activateSkill(meleeSkill)
      }
    }

    // 敌人近战攻击玩家
    enemies.value.forEach(e => {
      if (e.dead || e.frozen) return
      if (e.hasMelee) {
        const meleeDist = Math.sqrt((player.x - e.x) ** 2 + (player.y - e.y) ** 2)
        if (e.meleeCooldownTimer > 0) {
          e.meleeCooldownTimer -= dt
        }
        if (meleeDist <= e.attackRange && e.meleeCooldownTimer <= 0) {
          player.hp -= e.attack
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
    })

    // 玩家受击闪红衰减
    if (player.hitFlash > 0) player.hitFlash--
  }

  // ─── 重置 ───

  const resetPlayer = () => {
    player.x = 0
    player.y = 0
    player.hp = PLAYER_ATTRS.maxHp
    player.level = 1
    player.exp = 0
    player.direction = DIRECTION.FRONT
    player.frame = 0
    player.frameTimer = 0
    player.isMoving = false
    player.hitFlash = 0

    const arrowTemplate = SKILL_TABLE.find(s => s.id === 'arrow')
    player.skills.length = 0
    player.skills.push(createSkillInstance(arrowTemplate, 1))
  }

  return {
    updatePlayer,
    fireArrow,
    activateSkill,
    onSkillClick,
    damageEnemy,
    findNearestEnemy,
    showLevelUpOptions,
    onLevelUpChoice,
    createSkillInstance,
    resetPlayer,
  }
}
