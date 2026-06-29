import { reactive } from 'vue'
import {
  PLAYER_ATTRS,
  SKILL_TABLE,
  SKILL_ARROW,
  BOUNDARY,
  LOOT_TABLE,
  getExpThreshold,
  ENTITY_SIZE,
  ARROW_SIZE,
  FRAME_INTERVAL,
  FRAME_COUNT,
  DIRECTION,
  calcSkillValue,
  calcSkillValueLinear,
} from '../constants.js'
import { pushBattleLog } from './useBattleLog.js'


export function usePlayer(
  player, gameState, keysDown, mouseHeld, mouseScreen,
  gameCanvas, enemies, projectiles, effects,
  mapUtils, battleLog, levelUpOptions, lootDrops, magicCircles,
  buffGetters = null,
  onDamageBoss = null,
  autoFire = null,
  debugFlags = null,
) {
  const { toLogical, checkCollision } = mapUtils

  let _boundarySlow = 0

  
  const log = (msg) => pushBattleLog(battleLog, msg)


  const gainExp = (amount) => {
    player.exp += amount
    checkLevelUp()
  }

  const checkLevelUp = () => {
    if (gameState.levelUpPending) return  

    const needExp = getExpThreshold(player.level + 1)

    if (player.exp >= needExp) {
      player.level++
      recalcPassiveBuffs()   
      showLevelUpOptions()
    }
  }

  

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
      speedBoost: template.speedBoost || 0,
      damageBoost: template.damageBoost || 0,
      extraProjectiles: template.extraProjectiles || 0,
      invincibleTimer: 0,
      invincibleTotalDuration: 0,
      invincibleSpeedBoost: 0,
      invincibleDamageBoost: 0,
      isPassive: template.isPassive || false,
      maxLevel: template.maxLevel || null,
      maxHpBonusBase: template.maxHpBonusBase || 0,
      speedBonusBase: template.speedBonusBase || 0,
      attackBonusBase: template.attackBonusBase || 0,
      burnDamage: template.burnDamage,
      fireballCount: template.fireballCount,
      dashDistance: 0,
      dashDuration: 0,
      dashDx: 0,
      dashDy: 0,
    })
  }

  

  
  const recalcPassiveBuffs = () => {
    const levelHpBonus = (player.level - 1) * 5  
    const passive = player.skills.find(s => s.id === 'bodyStrength')
    const maxHpBonus = passive
      ? calcSkillValue(passive.maxHpBonusBase, passive.growth.maxHpBonus, passive.currentLevel)
      : 0
    const speedBonus = passive
      ? calcSkillValue(passive.speedBonusBase, passive.growth.speedBonus, passive.currentLevel)
      : 0
    const attackBonus = passive
      ? calcSkillValue(passive.attackBonusBase, passive.growth.attackBonus, passive.currentLevel)
      : 0

    const oldMaxHp = player.maxHp
    player.maxHp = PLAYER_ATTRS.maxHp + levelHpBonus + maxHpBonus
    player.speed = PLAYER_ATTRS.speed + speedBonus
    player.baseAttack = PLAYER_ATTRS.baseAttack + attackBonus

    
    if (oldMaxHp && player.maxHp > oldMaxHp) {
      player.hp += (player.maxHp - oldMaxHp)
    }
  }

  

  
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

  
  const damageEnemy = (enemy, dmg, isMelee = false) => {
    
    if (enemy.isBoss) {
      
      if (enemy.isClone) {
        enemy.hitFlash = 4  
        return
      }
      
      if (onDamageBoss) onDamageBoss(dmg)
      return
    }

    
    const invSkill = player.skills.find(s => s.id === 'invincible' && s.active)
    let finalDmg = invSkill ? dmg * (1 + invSkill.invincibleDamageBoost) : dmg

    
    if (buffGetters?.getAttackMultiplier) {
      finalDmg *= buffGetters.getAttackMultiplier()
    }

    
    if (enemy.shieldedBy) {
      const shielder = enemies.value.find(e => e.eid === enemy.shieldedBy && !e.dead)
      if (shielder) {
        finalDmg *= (1 - (shielder.shieldReduction || 0.4))
      } else {
        delete enemy.shieldedBy  
      }
    }

    enemy.hp -= finalDmg
    enemy.hitFlash = 6

    if (isMelee) {
      const vampireSkill = player.skills.find(s => s.id === 'vampireAura' && s.active)
      if (vampireSkill) {
        const heal = vampireSkill.auraDamage * vampireSkill.auraLifesteal * 0.25
        player.hp = Math.min(player.maxHp, player.hp + heal)
      }
    }

    if (enemy.hp <= 0) {
      enemy.dead = true
      gameState.killCount++
      gainExp(enemy.expReward)
      log(`击杀 ${enemy.type} 敌人`)

      
      const dropMult = buffGetters?.getDropRateMultiplier?.() || 1
      Object.values(LOOT_TABLE).forEach(loot => {
        if (Math.random() < loot.dropChance * dropMult) {
          lootDrops.value.push({
            id: loot.id,
            name: loot.name,
            icon: loot.icon,
            color: loot.color,
            hoverColor: loot.hoverColor,
            size: loot.size,
            healAmount: loot.healAmount || 0,
            goldAmount: loot.goldAmount || 0,
            glowSpeed: loot.glowSpeed || 500,
            x: enemy.x,
            y: enemy.y,
            spawnedAt: gameState.gameTime,
            lifetime: loot.lifetime,
          })
        }
      })
    }
  }

  
  const fireArrow = () => {
    const arrowSkill = player.skills.find(s => s.id === 'arrow')
    if (!arrowSkill || arrowSkill.remainingCooldown > 0) return

    
    const canvas = gameCanvas.value?.canvasRef
    if (!canvas) return
    const mouseLogical = toLogical(mouseScreen.x, mouseScreen.y, canvas)
    const dx = mouseLogical.x - player.x
    const dy = mouseLogical.y - player.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 1) return

    const dmg = calcSkillValue(arrowSkill.damage, arrowSkill.growth.damage, arrowSkill.currentLevel) + (player.baseAttack || 0)
    const effectiveSpeed = calcSkillValue(arrowSkill.projectileSpeed, arrowSkill.growth.projectileSpeed, arrowSkill.currentLevel)
    const effectiveCooldown = calcSkillValue(arrowSkill.cooldown, arrowSkill.growth.cooldown, arrowSkill.currentLevel)
    
    
    
    const penetration = Math.min(Math.max(0, arrowSkill.currentLevel - 1), 5)

    
    const createArrow = (vx, vy, damageMultiplier = 1) => {
      projectiles.value.push({
        type: 'arrow',
        x: player.x, y: player.y,
        vx, vy,
        damage: dmg * damageMultiplier,
        size: ARROW_SIZE,
        owner: 'player',
        direction: vx >= 0 ? DIRECTION.RIGHT : DIRECTION.LEFT,
        penetration,
        penetratedEnemies: [],
      })
    }

    
    createArrow((dx / dist) * effectiveSpeed, (dy / dist) * effectiveSpeed)

    
    const splitUnlockLevel = SKILL_ARROW.splitArrow?.unlockLevel || 4
    const maxSplitArrows = SKILL_ARROW.splitArrow?.maxArrows || 1
    if (arrowSkill.currentLevel >= splitUnlockLevel && enemies?.value) {
      const splitCount = Math.min(arrowSkill.currentLevel - splitUnlockLevel + 1, maxSplitArrows)
      
      
      const nearestEnemies = enemies.value
        .filter(e => !e.dead)
        .map(e => ({
          e,
          dist: Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2)
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, splitCount)
      
      nearestEnemies.forEach(({ e }) => {
        const edx = e.x - player.x
        const edy = e.y - player.y
        const edist = Math.sqrt(edx * edx + edy * edy)
        if (edist < 1) return
        
        
        const baseAngle = Math.atan2(edy, edx)
        const spreadAngle = baseAngle + (Math.random() - 0.5) * 0.3
        const spreadVx = Math.cos(spreadAngle) * effectiveSpeed
        const spreadVy = Math.sin(spreadAngle) * effectiveSpeed
        
        createArrow(spreadVx, spreadVy, 0.7)  
      })
    }

    arrowSkill.remainingCooldown = effectiveCooldown
  }

  
  const activateSkill = (skill) => {
    
    if (skill.isPassive) return
    if (skill.remainingCooldown > 0 || gameState.isDead || gameState.levelUpPending || gameState.stelePending) return
    const dmg = calcSkillValue(skill.damage, skill.growth?.damage, skill.currentLevel) + (player.baseAttack || 0)
    const effectiveRange = calcSkillValue(skill.range, skill.growth?.range, skill.currentLevel)
    const effectiveCooldown = calcSkillValue(skill.cooldown, skill.growth?.cooldown, skill.currentLevel)

    if (skill.id === 'meleeAttack') {
      const canvas = gameCanvas.value?.canvasRef
      const mouseLogical = toLogical(mouseScreen.x, mouseScreen.y, canvas)
      effects.value.push({
        type: 'meleeSlash',
        x: player.x, y: player.y,
        radius: effectiveRange,
        duration: 300, elapsed: 0,
        angle: Math.atan2(mouseLogical.y - player.y, mouseLogical.x - player.x),
      })
      enemies.value.forEach(e => {
        const dx = e.x - player.x
        const dy = e.y - player.y
        if (Math.sqrt(dx * dx + dy * dy) <= effectiveRange + e.size / 2) {
          damageEnemy(e, dmg, true)
        }
      })
      skill.remainingCooldown = effectiveCooldown
      log(`近战劈斩！`)
    } else if (skill.id === 'autoSeek') {
      const effectiveProjSpeed = calcSkillValue(skill.projectileSpeed, skill.growth?.projectileSpeed, skill.currentLevel)
      const nearest = findNearestEnemy(effectiveRange)
      if (nearest) {
        
        const extraCount = Math.min((skill.currentLevel || 1) - 1, 5)
        const totalCount = 1 + extraCount  

        
        const candidateTargets = enemies.value
          .filter(e => !e.dead)
          .map(e => {
            const edx = e.x - player.x
            const edy = e.y - player.y
            return { enemy: e, dist: Math.sqrt(edx * edx + edy * edy) }
          })
          .filter(({ dist }) => dist <= effectiveRange)
          .sort((a, b) => a.dist - b.dist)
          .map(({ enemy }) => enemy)

        for (let i = 0; i < totalCount; i++) {
          
          const target = candidateTargets[i % candidateTargets.length] || nearest

          const dx = target.x - player.x
          const dy = target.y - player.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          
          let vx = (dx / dist) * effectiveProjSpeed
          let vy = (dy / dist) * effectiveProjSpeed
          if (i > 0) {
            const jitter = (Math.random() - 0.5) * (Math.PI / 6)  
            const cos = Math.cos(jitter)
            const sin = Math.sin(jitter)
            const newVx = vx * cos - vy * sin
            const newVy = vx * sin + vy * cos
            vx = newVx
            vy = newVy
          }

          projectiles.value.push({
            type: 'autoSeek',
            x: player.x, y: player.y,
            vx, vy,
            damage: dmg,
            size: 10,
            owner: 'player',
            targetEnemy: target,
            seekSpeed: effectiveProjSpeed,
          })
        }
        log(`追踪弹幕发射！×${totalCount}`)
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
    } else if (skill.id === 'invincible') {
      const effectiveDuration = calcSkillValue(skill.duration, skill.growth?.duration, skill.currentLevel)
      const effectiveSpeedBoost = calcSkillValue(skill.speedBoost, skill.growth?.speedBoost, skill.currentLevel)
      const effectiveDamageBoost = calcSkillValue(skill.damageBoost, skill.growth?.damageBoost, skill.currentLevel)
      skill.active = true
      skill.invincibleTimer = effectiveDuration
      skill.invincibleTotalDuration = effectiveDuration
      skill.invincibleSpeedBoost = effectiveSpeedBoost
      skill.invincibleDamageBoost = effectiveDamageBoost
      skill.remainingCooldown = effectiveCooldown
      log('无敌启动！')
    } else if (skill.id === 'magicCircle') {
      
      const canvas = gameCanvas.value?.canvasRef
      if (!canvas) { skill.remainingCooldown = effectiveCooldown; return }
      const mouseWorld = toLogical(mouseScreen.x, mouseScreen.y, canvas)

      const effectiveRadius = calcSkillValueLinear(skill.range, skill.growth?.range, skill.currentLevel)
      const effectiveDuration = calcSkillValueLinear(skill.duration, skill.growth?.duration, skill.currentLevel)
      const effectiveFireballCount = Math.floor(calcSkillValueLinear(skill.fireballCount, skill.growth?.fireballCount, skill.currentLevel))
      const effectiveFireballDmg = calcSkillValueLinear(skill.damage, skill.growth?.damage, skill.currentLevel) + (player.baseAttack || 0)
      const effectiveBurnDmg = calcSkillValueLinear(skill.burnDamage, skill.growth?.burnDamage, skill.currentLevel)

      magicCircles.value.push({
        id: Date.now() + Math.random(),
        type: 'magicCircle',
        x: mouseWorld.x,
        y: mouseWorld.y,
        radius: effectiveRadius,
        duration: effectiveDuration,
        elapsed: 0,
        burnDamage: Math.round(effectiveBurnDmg),
        burnTickInterval: 500,
        burnTickTimer: 0,
        fireballCount: effectiveFireballCount,
        fireballDamage: Math.round(effectiveFireballDmg),
        fireballRadius: skill.fireballRadius || 25,
        fireballInterval: 800,
        fireballTimer: 0,
      })

      skill.remainingCooldown = effectiveCooldown
      log(`魔法阵火雨降临！`)
    } else if (skill.id === 'dash') {
      
      let dx = 0, dy = 0
      if (keysDown['w'] || keysDown['arrowup']) dy -= 1
      if (keysDown['s'] || keysDown['arrowdown']) dy += 1
      if (keysDown['a'] || keysDown['arrowleft']) dx -= 1
      if (keysDown['d'] || keysDown['arrowright']) dx += 1

      if (dx === 0 && dy === 0) {
        if (player.direction === DIRECTION.LEFT) dx = -1
        else if (player.direction === DIRECTION.RIGHT) dx = 1
        else dy = 1
      } else {
        const len = Math.sqrt(dx * dx + dy * dy)
        dx /= len; dy /= len
      }

      
      const effectiveDuration = calcSkillValue(skill.duration, skill.growth?.duration, skill.currentLevel)
      const effectiveDistance = calcSkillValue(skill.range, skill.growth?.range, skill.currentLevel)

      
      skill.active = true
      skill.dashTimer = effectiveDuration
      skill.dashDuration = effectiveDuration
      skill.dashDistance = effectiveDistance
      skill.dashDx = dx
      skill.dashDy = dy
      skill.remainingCooldown = effectiveCooldown

      
      player._dashInvincibleTimer = 150

      
      effects.value.push({
        type: 'dashTrail',
        x: player.x, y: player.y,
        duration: 250, elapsed: 0,
        direction: player.direction,
      })

      log('冲刺！')
    }
  }

  const onSkillClick = (sk) => {
    activateSkill(sk)
  }

  

  const showLevelUpOptions = () => {
    gameState.levelUpPending = true
    const options = []

    
    player.skills.forEach(sk => {
      
      if (sk.maxLevel && sk.currentLevel >= sk.maxLevel) return

      const nextLv = sk.currentLevel + 1
      let desc
      if (sk.isPassive) {
        const nextHp = calcSkillValue(sk.maxHpBonusBase, sk.growth?.maxHpBonus, nextLv)
        const nextSpd = calcSkillValue(sk.speedBonusBase, sk.growth?.speedBonus, nextLv)
        const nextAtk = calcSkillValue(sk.attackBonusBase, sk.growth?.attackBonus, nextLv)
        desc = `生命+${Math.round(nextHp)} 速度+${nextSpd.toFixed(1)} 攻击+${Math.round(nextAtk)}`
      } else if (sk.speedBoost || sk.damageBoost) {
        
        const nextCooldown = calcSkillValue(sk.cooldown, sk.growth?.cooldown, nextLv)
        const nextDuration = calcSkillValue(sk.duration, sk.growth?.duration, nextLv)
        const nextSpeed = calcSkillValue(sk.speedBoost, sk.growth?.speedBoost, nextLv)
        const nextDmgBoost = calcSkillValue(sk.damageBoost, sk.growth?.damageBoost, nextLv)
        desc = `冷却${(nextCooldown/1000).toFixed(1)}s 持续${(nextDuration/1000).toFixed(1)}s 移速+${Math.round(nextSpeed*100)}% 伤害+${Math.round(nextDmgBoost*100)}%`
      } else if (sk.burnDamage !== undefined) {
        
        const nextDmg = calcSkillValueLinear(sk.damage, sk.growth?.damage, nextLv)
        const nextBurn = calcSkillValueLinear(sk.burnDamage, sk.growth?.burnDamage, nextLv)
        const nextRadius = calcSkillValueLinear(sk.range, sk.growth?.range, nextLv)
        const nextCount = Math.floor(calcSkillValueLinear(sk.fireballCount, sk.growth?.fireballCount, nextLv))
        const nextDur = calcSkillValueLinear(sk.duration, sk.growth?.duration, nextLv)
        const nextCd = calcSkillValueLinear(sk.cooldown, sk.growth?.cooldown, nextLv)
        desc = `火球${Math.round(nextDmg)} 灼烧${Math.round(nextBurn)} 半径${Math.round(nextRadius)}px ${nextCount}颗 ${(nextDur/1000).toFixed(1)}s 冷却${(nextCd/1000).toFixed(1)}s`
      } else if (sk.id === 'dash') {
        const nextCooldown = calcSkillValue(sk.cooldown, sk.growth?.cooldown, nextLv)
        const nextRange = calcSkillValue(sk.range, sk.growth?.range, nextLv)
        desc = `冷却${(nextCooldown/1000).toFixed(1)}s 距离${Math.round(nextRange)}px`
      } else if (sk.id === 'arrow') {
        
        const nextDmg = calcSkillValue(sk.damage, sk.growth?.damage, nextLv)
        const nextPenetration = calcSkillValue(0, sk.growth?.penetration, nextLv)
        let descParts = [`伤害 ${Math.round(nextDmg)}`]
        if (nextPenetration > 0) {
          descParts.push(`穿透${Math.round(nextPenetration)}`)
        }
        
        const splitUnlockLevel = SKILL_ARROW.splitArrow?.unlockLevel || 4
        if (nextLv >= splitUnlockLevel) {
          const maxSplit = SKILL_ARROW.splitArrow?.maxArrows || 1
          const splitCount = Math.min(nextLv - splitUnlockLevel + 1, maxSplit)
          descParts.push(`分裂${splitCount}`)
        }
        desc = descParts.join(' ')
      } else {
        const nextDmg = calcSkillValue(sk.damage, sk.growth?.damage, nextLv)
        desc = `伤害 ${Math.round(nextDmg)}`
      }
      options.push({ ...sk, isNew: false, nextLevel: nextLv, description: desc })
    })

    
    SKILL_TABLE.forEach(sk => {
      if (sk.unlockLevel <= player.level && !player.skills.find(s => s.id === sk.id)) {
        let desc = sk.description
        if (sk.isPassive) {
          desc = `生命+${sk.maxHpBonusBase} 速度+${sk.speedBonusBase} 攻击+${sk.attackBonusBase}`
        } else if (sk.speedBoost || sk.damageBoost) {
          desc = `冷却${(sk.cooldown/1000).toFixed(1)}s 持续${(sk.duration/1000).toFixed(1)}s 移速+${Math.round(sk.speedBoost*100)}% 伤害+${Math.round(sk.damageBoost*100)}%`
        } else if (sk.burnDamage !== undefined) {
          desc = `火球${sk.damage} 灼烧${sk.burnDamage} 半径${sk.range}px ${sk.fireballCount}颗 ${(sk.duration/1000).toFixed(1)}s`
        } else if (sk.id === 'dash') {
          desc = `冷却${(sk.cooldown/1000).toFixed(1)}s 距离${sk.range}px`
        } else if (sk.id === 'arrow') {
          
          const baseDmg = sk.damage
          const penetration = calcSkillValue(0, sk.growth?.penetration, 1)
          let descParts = [`伤害 ${baseDmg}`]
          if (penetration > 0) {
            descParts.push(`穿透${Math.round(penetration)}`)
          }
          const splitUnlockLevel = SKILL_ARROW.splitArrow?.unlockLevel || 4
          descParts.push(`Lv${splitUnlockLevel}解锁分裂`)
          desc = descParts.join(' ')
        }
        options.push({ ...sk, isNew: true, nextLevel: 1, description: desc })
      }
    })

    
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }

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
    recalcPassiveBuffs()
    gameState.levelUpPending = false
    
    checkLevelUp()
  }

  

  const updatePlayer = (dt) => {
    _boundarySlow = 0
    player._boundaryDamageTimer = (player._boundaryDamageTimer || 0) + dt

    const canvas = gameCanvas.value?.canvasRef
    if (canvas) {
      const boundaryRadX = canvas.width * BOUNDARY.radiusX
      const boundaryRadY = canvas.height * BOUNDARY.radiusY

      const excessX = Math.max(0, Math.abs(player.x) - boundaryRadX)
      const excessY = Math.max(0, Math.abs(player.y) - boundaryRadY)
      const maxExcess = Math.max(excessX, excessY)

      if (maxExcess > 0) {
        const zones = BOUNDARY.zones
        for (let i = zones.length - 1; i >= 0; i--) {
          const zoneThreshold = zones[i].threshold * canvas.width
          if (maxExcess >= zoneThreshold) {
            _boundarySlow = zones[i].slow
            player._boundaryDangerLevel = i + 1
            const isSkillInvincible = player.skills.some(s => s.id === 'invincible' && s.active)
            const isWallInvincible = buffGetters?.isWallInvincible?.() || debugFlags?.godMode
            if (!isSkillInvincible && !isWallInvincible) {
              if (player._boundaryDamageTimer >= BOUNDARY.tickInterval) {
                player._boundaryDamageTimer -= BOUNDARY.tickInterval
                player.hp = Math.max(0, player.hp - player.maxHp * zones[i].hpPercent)
              }
            } else {
              player._boundaryDamageTimer = 0
            }
            break
          }
        }
        player._boundaryWarning = 0
      } else {
        player._boundaryDamageTimer = 0
        player._boundaryDangerLevel = 0
        const marginX = Math.max(0, boundaryRadX - Math.abs(player.x)) / (boundaryRadX * BOUNDARY.warningRatio)
        const marginY = Math.max(0, boundaryRadY - Math.abs(player.y)) / (boundaryRadY * BOUNDARY.warningRatio)
        player._boundaryWarning = 1 - Math.min(marginX, marginY)
      }
    }

    const dashSkill = player.skills.find(s => s.id === 'dash' && s.active)
    if (dashSkill) {
      dashSkill.dashTimer -= dt
      const step = (dashSkill.dashDistance / dashSkill.dashDuration) * dt
      player.x += dashSkill.dashDx * step
      player.y += dashSkill.dashDy * step

      effects.value.push({
        type: 'dashTrail',
        x: player.x, y: player.y,
        duration: 200, elapsed: 0,
        direction: player.direction,
      })

      if (dashSkill.dashTimer <= 0) {
        dashSkill.active = false
      }
    }

    
    let dx = 0, dy = 0
    if (keysDown['w'] || keysDown['arrowup']) dy -= 1
    if (keysDown['s'] || keysDown['arrowdown']) dy += 1
    if (keysDown['a'] || keysDown['arrowleft']) dx -= 1
    if (keysDown['d'] || keysDown['arrowright']) dx += 1

    player.isMoving = dx !== 0 || dy !== 0

    if (player.isMoving) {
      const len = Math.sqrt(dx * dx + dy * dy)
      dx /= len; dy /= len
      
      const invFrame = player.skills.find(s => s.id === 'invincible' && s.active)
      let currentSpeed = invFrame
        ? player.speed * (1 + invFrame.invincibleSpeedBoost)
        : player.speed
      
      if (buffGetters?.getSpeedMultiplier) {
        currentSpeed *= buffGetters.getSpeedMultiplier()
      }
      
      if (buffGetters?.getDeathZoneSlow) {
        const slow = buffGetters.getDeathZoneSlow()
        if (slow > 0) currentSpeed *= (1 - slow)
      }
      
      if (buffGetters?.getBossSlowMultiplier) {
        currentSpeed *= buffGetters.getBossSlowMultiplier()
      }
      if (_boundarySlow > 0) currentSpeed *= (1 - _boundarySlow)
      player.x += dx * currentSpeed
      player.y += dy * currentSpeed

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

    
    const pickupRange = ENTITY_SIZE / 2 + 8
    for (let i = lootDrops.value.length - 1; i >= 0; i--) {
      const drop = lootDrops.value[i]
      const dist = Math.sqrt((drop.x - player.x) ** 2 + (drop.y - player.y) ** 2)
      if (dist <= pickupRange) {
        if (drop.id === 'healthPotion') {
          player.hp = Math.min(player.maxHp, player.hp + drop.healAmount)
          log(`拾取 ${drop.name}，恢复 ${drop.healAmount} 生命`)
        } else if (drop.id === 'goldCoin') {
          player.gold = (player.gold || 0) + drop.goldAmount
          log(`拾取 ${drop.name}`)
        }
        lootDrops.value.splice(i, 1)
      }
    }

    
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
            player.hp = Math.min(player.maxHp || PLAYER_ATTRS.maxHp, player.hp + vampireSkill.auraDamage * vampireSkill.auraLifesteal)
          }
        })
      }
      if (vampireSkill.auraTimer <= 0) {
        vampireSkill.active = false
      }
    }

    
    const invincibleSkill = player.skills.find(s => s.id === 'invincible' && s.active)
    if (invincibleSkill) {
      invincibleSkill.invincibleTimer -= dt
      if (invincibleSkill.invincibleTimer <= 0) {
        invincibleSkill.active = false
      }
    }

    
    if ((mouseHeld.value || autoFire?.value) && !gameState.isDead && !gameState.levelUpPending) {
      const arrowSkill = player.skills.find(s => s.id === 'arrow')
      if (arrowSkill && arrowSkill.remainingCooldown <= 0) {
        fireArrow()
      }
    }

    
    const autoSeekSkill = player.skills.find(s => s.id === 'autoSeek')
    if (autoSeekSkill && autoSeekSkill.remainingCooldown <= 0 && !gameState.isDead && !gameState.levelUpPending) {
      const effectiveAutoSeekRange = calcSkillValue(autoSeekSkill.range, autoSeekSkill.growth?.range, autoSeekSkill.currentLevel)
      const hasTarget = enemies.value.some(e => {
        if (e.dead) return false
        const edx = e.x - player.x
        const edy = e.y - player.y
        return Math.sqrt(edx * edx + edy * edy) <= effectiveAutoSeekRange
      })
      if (hasTarget) {
        activateSkill(autoSeekSkill)
      }
    }

    
    const vampireAutoSkill = player.skills.find(s => s.id === 'vampireAura')
    if (vampireAutoSkill && vampireAutoSkill.remainingCooldown <= 0 && !vampireAutoSkill.active && !gameState.isDead && !gameState.levelUpPending) {
      activateSkill(vampireAutoSkill)
    }

    
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

    
    if (player.hitFlash > 0) player.hitFlash--

    
    if (player._dashInvincibleTimer > 0) player._dashInvincibleTimer -= dt
  }

  

  const resetPlayer = () => {
    player.x = 0
    player.y = 0
    player.hp = PLAYER_ATTRS.maxHp
    player.maxHp = PLAYER_ATTRS.maxHp
    player.speed = PLAYER_ATTRS.speed
    player.baseAttack = PLAYER_ATTRS.baseAttack
    player.level = 1
    player.exp = 0
    player.direction = DIRECTION.FRONT
    player.frame = 0
    player.frameTimer = 0
    player.isMoving = false
    player.hitFlash = 0
    player.gold = 0
    player.dodgeChance = 0

    const arrowTemplate = SKILL_TABLE.find(s => s.id === 'arrow')
    player.skills.length = 0
    player.skills.push(createSkillInstance(arrowTemplate, 1))
    recalcPassiveBuffs()
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
    recalcPassiveBuffs,
    gainExp,
    getBoundaryDangerLevel: () => player._boundaryDangerLevel || 0,
    getBoundarySlow: () => _boundarySlow,
    getBoundaryWarning: () => player._boundaryWarning || 0,
  }
}
