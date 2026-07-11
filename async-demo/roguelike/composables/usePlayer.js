import { reactive } from "vue";
import {
  PLAYER_ATTRS,
  SKILL_TABLE,
  SKILL_ARROW,
  BOUNDARY,
  LOOT_TABLE,
  getExpThreshold,
  ENTITY_SIZE,
  FRAME_INTERVAL,
  FRAME_COUNT,
  DIRECTION,
  calcSkillValue,
  calcSkillValueLinear,
  HIT_FLASH_PLAYER,
  HIT_FLASH_ENEMY,
  HIT_FLASH_ENEMY_LIGHT,
  PLAYER_LEVEL_HP_BONUS,
  LOOT_PICKUP_EXTRA_RANGE,
} from "../constants.js";
import { pushBattleLog } from "./useBattleLog.js";

export function usePlayer(
  player,
  gameState,
  keysDown,
  mouseHeld,
  mouseScreen,
  gameCanvas,
  enemies,
  projectiles,
  effects,
  mapUtils,
  battleLog,
  levelUpOptions,
  lootDrops,
  magicCircles,
  traps,
  buffGetters = null,
  onDamageBoss = null,
  autoSkills = null,
  debugFlags = null,
) {
  const { toLogical, checkCollision } = mapUtils;

  let _boundarySlow = 0;
  const log = (msg) => pushBattleLog(battleLog, msg);

  const gainExp = (amount) => {
    player.exp += amount;
    checkLevelUp();
  };

  const checkLevelUp = () => {
    if (gameState.levelUpPending) return;
    const needExp = getExpThreshold(player.level + 1);
    if (player.exp >= needExp) {
      player.level++;
      recalcPassiveBuffs();
      showLevelUpOptions();
    }
  };

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
      arrayRadius: template.arrayRadius || 0,
      rayWidth: template.rayWidth || 0,
      tickInterval: template.tickInterval || 0,
      color: template.color,
      color2: template.color2,
    });
  };

  const recalcPassiveBuffs = () => {
    const levelHpBonus = (player.level - 1) * PLAYER_LEVEL_HP_BONUS;
    const passive = player.skills.find((s) => s.id === "bodyStrength");
    const maxHpBonus = passive
      ? calcSkillValue(
          passive.maxHpBonusBase,
          passive.growth.maxHpBonus,
          passive.currentLevel,
        )
      : 0;
    const speedBonus = passive
      ? calcSkillValue(
          passive.speedBonusBase,
          passive.growth.speedBonus,
          passive.currentLevel,
        )
      : 0;
    const attackBonus = passive
      ? calcSkillValue(
          passive.attackBonusBase,
          passive.growth.attackBonus,
          passive.currentLevel,
        )
      : 0;

    const oldMaxHp = player.maxHp;
    player.maxHp = PLAYER_ATTRS.maxHp + levelHpBonus + maxHpBonus;
    player.speed = PLAYER_ATTRS.speed + speedBonus;
    player.baseAttack = PLAYER_ATTRS.baseAttack + attackBonus;

    if (oldMaxHp && player.maxHp > oldMaxHp) {
      player.hp += player.maxHp - oldMaxHp;
    }
  };

  const findNearestEnemy = (maxRange) => {
    let nearest = null;
    let minDistSq = maxRange * maxRange;
    enemies.value.forEach((e) => {
      if (e.dead) return;
      const dx = e.x - player.x,
        dy = e.y - player.y;
      const dSq = dx * dx + dy * dy;
      if (dSq < minDistSq) {
        minDistSq = dSq;
        nearest = e;
      }
    });
    return nearest;
  };

  const damageEnemy = (enemy, dmg, isMelee = false, sourceSkillId = null) => {
    if (enemy.invincibleTimer && enemy.invincibleTimer > 0) return;

    if (enemy.isBoss) {
      if (enemy.isClone) {
        enemy.hitFlash = HIT_FLASH_ENEMY_LIGHT;
        return;
      }
      if (onDamageBoss) onDamageBoss(dmg);
      return;
    }

    const invSkill = player.skills.find(
      (s) => s.id === "invincible" && s.active,
    );
    let finalDmg = invSkill ? dmg * (1 + invSkill.invincibleDamageBoost) : dmg;
    if (buffGetters?.getAttackMultiplier) {
      finalDmg *= buffGetters.getAttackMultiplier();
    }
    if (buffGetters?.getLightningDamageBoost) {
      finalDmg *= 1 + buffGetters.getLightningDamageBoost();
    }

    if (enemy.shieldedBy) {
      const shielder = enemies.value.find(
        (e) => e.eid === enemy.shieldedBy && !e.dead,
      );
      if (shielder) {
        finalDmg *= 1 - (shielder.shieldReduction || 0.4);
        if (Math.random() < (shielder.shieldEvasion || 0.15)) {
          log("护盾光环闪避！");
          effects.value.push({
            type: "damageNumber",
            x: enemy.x,
            y: enemy.y - enemy.size / 2,
            text: "闪避",
            color: "#06b6d4",
            duration: 600,
            elapsed: 0,
          });
          return;
        }
      } else {
        delete enemy.shieldedBy;
      }
    }

    if (enemy.maxDamageRatio) {
      const cap = enemy.maxHp * enemy.maxDamageRatio;
      if (finalDmg > cap) {
        finalDmg = cap;
      }
    }

    enemy.hp -= finalDmg;
    enemy.hitFlash = HIT_FLASH_ENEMY;

    if (enemy.type === "eliteHacker") {
      enemy.revealTimer = enemy.hitRevealDuration || 1500;
    }

    if (isMelee) {
      const vampireSkill = player.skills.find(
        (s) => s.id === "vampireAura" && s.active,
      );
      if (vampireSkill) {
        const heal = vampireSkill.auraDamage * vampireSkill.auraLifesteal * 1;
        player.hp = Math.min(player.maxHp, player.hp + heal);
      }
    }

    if (enemy.hp <= 0) {
      enemy.dead = true;
      gameState.killCount++;
      gainExp(enemy.expReward);
      log(`击杀 ${enemy.type} 敌人`);

      handleEnemyDeath(enemy, sourceSkillId);
      spawnLoot(enemy);
    }
  };

  const handleEnemyDeath = (enemy, sourceSkillId) => {
    if (enemy.type === "eliteRoadhog" && player.controlLocked) {
      player.controlLocked = false;
      enemy.hookState = "normal";
      enemy.hookDirX = 0;
      enemy.hookDirY = 0;
      enemy.hookX = 0;
      enemy.hookY = 0;
      enemy.hookDistTraveled = 0;
      log("路霸死亡，释放钩锁！");
    }

    if (enemy.type === "eliteThrower" && enemy.throwTargetEid) {
      const targetA = enemies.value.find((e) => e.eid === enemy.throwTargetEid);
      if (targetA && !targetA.dead) {
        targetA.grabbedByThrower = null;
        targetA.throwFlying = false;
        log("投掷者死亡，释放被抓取的敌人");
      }
      enemy.throwTargetEid = null;
    }

    if (enemy.type === "eliteHacker") {
      enemy.rayActive = false;
      const anyHackerConnected = enemies.value.some(
        (other) =>
          other.type === "eliteHacker" && !other.dead && other.rayActive,
      );
      if (!anyHackerConnected) player.hacked = false;
      enemies.value.forEach((other) => {
        if (other.stealthSourceEid === enemy.eid) {
          other.stealthLevel = 0;
          other.stealthDurationTimer = 0;
          other.stealthSourceEid = null;
        }
      });
      log("骇客死亡，释放骇入和隐身赋能");
    }

    if (sourceSkillId === "meleeAttack" && !enemy.isBoss) {
      const freezeSkill = player.skills.find((s) => s.id === "freeze");
      const arrowSkill = player.skills.find((s) => s.id === "arrow");
      if (freezeSkill && Math.random() < (freezeSkill.meleeFreezeBubbleChance || 0.35)) {
        traps.value.push({
          type: "iceBubble",
          x: enemy.x,
          y: enemy.y,
          radius: arrowSkill ? (arrowSkill.freezeRange || 35) : 35,
          lifetime: freezeSkill ? (freezeSkill.iceBubbleLifetime || 6000) : 6000,
          elapsed: 0,
          triggered: false,
        });
        log("近战击杀生成冰冻泡泡！");
      }
    }
  };

  const spawnLoot = (enemy) => {
    const dropMult = buffGetters?.getDropRateMultiplier?.() || 1;
    Object.values(LOOT_TABLE).forEach((loot) => {
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
        });
      }
    });
  };

  const showLevelUpOptions = () => {
    gameState.levelUpPending = true;
    const options = [];

    const skillMap = new Map();
    player.skills.forEach((sk) => {
      const prev = skillMap.get(sk.id);
      if (!prev || sk.currentLevel > prev.currentLevel) {
        skillMap.set(sk.id, sk);
      }
    });

    skillMap.forEach((sk) => {
      if (sk.id === "ultimateRay") return;
      if (sk.maxLevel && sk.currentLevel >= sk.maxLevel) return;
      const nextLv = sk.currentLevel + 1;
      let desc = buildSkillDescription(sk, nextLv);
      options.push({
        ...sk,
        isNew: false,
        nextLevel: nextLv,
        description: desc,
      });
    });

    SKILL_TABLE.forEach((sk) => {
      if (sk.id === "ultimateRay") return;
      if (
        sk.unlockLevel <= player.level &&
        !skillMap.has(sk.id)
      ) {
        let desc = sk.isPassive
          ? `生命+${sk.maxHpBonusBase} 速度+${sk.speedBonusBase} 攻击+${sk.attackBonusBase}`
          : buildNewSkillDescription(sk);
        options.push({ ...sk, isNew: true, nextLevel: 1, description: desc });
      }
    });

    shuffleArray(options);
    levelUpOptions.value = options.slice(0, 3);
    if (levelUpOptions.value.length === 0) gameState.levelUpPending = false;
    log(`升级至 Lv.${player.level}！`);
  };

  const buildSkillDescription = (sk, nextLv) => {
    if (sk.isPassive) {
      const nextHp = calcSkillValue(
        sk.maxHpBonusBase,
        sk.growth?.maxHpBonus,
        nextLv,
      );
      const nextSpd = calcSkillValue(
        sk.speedBonusBase,
        sk.growth?.speedBonus,
        nextLv,
      );
      const nextAtk = calcSkillValue(
        sk.attackBonusBase,
        sk.growth?.attackBonus,
        nextLv,
      );
      return `生命+${Math.round(nextHp)} 速度+${nextSpd.toFixed(1)} 攻击+${Math.round(nextAtk)}`;
    }
    if (sk.speedBoost || sk.damageBoost) {
      const nextCooldown = calcSkillValue(
        sk.cooldown,
        sk.growth?.cooldown,
        nextLv,
      );
      const nextDuration = calcSkillValue(
        sk.duration,
        sk.growth?.duration,
        nextLv,
      );
      const nextSpeed = calcSkillValue(
        sk.speedBoost,
        sk.growth?.speedBoost,
        nextLv,
      );
      const nextDmgBoost = calcSkillValue(
        sk.damageBoost,
        sk.growth?.damageBoost,
        nextLv,
      );
      return `冷却${(nextCooldown / 1000).toFixed(1)}s 持续${(nextDuration / 1000).toFixed(1)}s 移速+${Math.round(nextSpeed * 100)}% 伤害+${Math.round(nextDmgBoost * 100)}%`;
    }
    if (sk.burnDamage !== undefined) {
      const nextDmg = calcSkillValueLinear(
        sk.damage,
        sk.growth?.damage,
        nextLv,
      );
      const nextBurn = calcSkillValueLinear(
        sk.burnDamage,
        sk.growth?.burnDamage,
        nextLv,
      );
      const nextRadius = calcSkillValueLinear(
        sk.range,
        sk.growth?.range,
        nextLv,
      );
      const nextCount = Math.floor(
        calcSkillValueLinear(
          sk.fireballCount,
          sk.growth?.fireballCount,
          nextLv,
        ),
      );
      const nextDur = calcSkillValueLinear(
        sk.duration,
        sk.growth?.duration,
        nextLv,
      );
      const nextCd = calcSkillValueLinear(
        sk.cooldown,
        sk.growth?.cooldown,
        nextLv,
      );
      return `火球${Math.round(nextDmg)} 灼烧${Math.round(nextBurn)} 半径${Math.round(nextRadius)}px ${nextCount}颗 ${(nextDur / 1000).toFixed(1)}s 冷却${(nextCd / 1000).toFixed(1)}s`;
    }
    if (sk.id === "dash") {
      const nextCooldown = calcSkillValue(
        sk.cooldown,
        sk.growth?.cooldown,
        nextLv,
      );
      const nextRange = calcSkillValue(sk.range, sk.growth?.range, nextLv);
      return `冷却${(nextCooldown / 1000).toFixed(1)}s 距离${Math.round(nextRange)}px`;
    }
    if (sk.id === "arrow") {
      const nextDmg = calcSkillValue(sk.damage, sk.growth?.damage, nextLv);
      const nextPenetration = calcSkillValue(0, sk.growth?.penetration, nextLv);
      const parts = [`伤害 ${Math.round(nextDmg)}`];
      if (nextPenetration > 0) parts.push(`穿透${Math.round(nextPenetration)}`);
      const splitUnlockLevel = SKILL_ARROW.splitArrow?.unlockLevel || 4;
      if (nextLv >= splitUnlockLevel) {
        const maxSplit = SKILL_ARROW.splitArrow?.maxArrows || 1;
        const splitCount = Math.min(nextLv - splitUnlockLevel + 1, maxSplit);
        parts.push(`分裂${splitCount}`);
      }
      return parts.join(" ");
    }
    const nextDmg = calcSkillValue(sk.damage, sk.growth?.damage, nextLv);
    return `伤害 ${Math.round(nextDmg)}`;
  };

  const buildNewSkillDescription = (sk) => {
    if (sk.speedBoost || sk.damageBoost) {
      return `冷却${(sk.cooldown / 1000).toFixed(1)}s 持续${(sk.duration / 1000).toFixed(1)}s 移速+${Math.round(sk.speedBoost * 100)}% 伤害+${Math.round(sk.damageBoost * 100)}%`;
    }
    if (sk.burnDamage !== undefined) {
      return `火球${sk.damage} 灼烧${sk.burnDamage} 半径${sk.range}px ${sk.fireballCount}颗 ${(sk.duration / 1000).toFixed(1)}s`;
    }
    if (sk.id === "dash") {
      return `冷却${(sk.cooldown / 1000).toFixed(1)}s 距离${sk.range}px`;
    }
    if (sk.id === "arrow") {
      const baseDmg = sk.damage;
      const penetration = calcSkillValue(0, sk.growth?.penetration, 1);
      const parts = [`伤害 ${baseDmg}`];
      if (penetration > 0) parts.push(`穿透${Math.round(penetration)}`);
      const splitUnlockLevel = SKILL_ARROW.splitArrow?.unlockLevel || 4;
      parts.push(`Lv${splitUnlockLevel}解锁分裂`);
      return parts.join(" ");
    }
    return sk.description;
  };

  const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  };

  const _onLevelUpChoice = (opt) => {
    const existing = player.skills.find((s) => s.id === opt.id);
    if (opt.isNew) {
      if (existing) {
        existing.currentLevel++;
        log(`${opt.name} 升级至 Lv.${existing.currentLevel}`);
      } else {
        player.skills.push(createSkillInstance(opt, 1));
        log(`习得新技能：${opt.name}`);
      }
    } else {
      if (existing) {
        existing.currentLevel++;
        log(`${opt.name} 升级至 Lv.${existing.currentLevel}`);
      }
    }
    recalcPassiveBuffs();
    gameState.levelUpPending = false;
    checkLevelUp();
  };

  const fireArrow = () => {
    const arrowSkill = player.skills.find((s) => s.id === "arrow");
    if (!arrowSkill || arrowSkill.remainingCooldown > 0) return;

    const canvas = gameCanvas.value?.canvasRef;
    if (!canvas) return;
    const mouseLogical = toLogical(mouseScreen.x, mouseScreen.y, canvas);
    const dx = mouseLogical.x - player.x;
    const dy = mouseLogical.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    const dmg =
      calcSkillValue(
        arrowSkill.damage,
        arrowSkill.growth.damage,
        arrowSkill.currentLevel,
      ) + (player.baseAttack || 0);
    const effectiveSpeed = calcSkillValue(
      arrowSkill.projectileSpeed,
      arrowSkill.growth.projectileSpeed,
      arrowSkill.currentLevel,
    );
    const effectiveCooldown = calcSkillValue(
      arrowSkill.cooldown,
      arrowSkill.growth.cooldown,
      arrowSkill.currentLevel,
    );
    const penetration = Math.round(
      calcSkillValue(
        0,
        arrowSkill.growth?.penetration,
        arrowSkill.currentLevel,
      ),
    );

    const createArrow = (vx, vy, damageMultiplier = 1) => {
      projectiles.value.push({
        type: "arrow",
        x: player.x,
        y: player.y,
        vx,
        vy,
        damage: dmg * damageMultiplier,
        size: arrowSkill.size || 12,
        owner: "player",
        direction: vx >= 0 ? DIRECTION.RIGHT : DIRECTION.LEFT,
        penetration,
        penetratedEnemies: [],
      });
    };

    const ndx = dx / dist;
    const ndy = dy / dist;
    createArrow(ndx * effectiveSpeed, ndy * effectiveSpeed);

    fireSplitArrows(arrowSkill, effectiveSpeed, createArrow);

    arrowSkill.remainingCooldown = effectiveCooldown;
  };

  const fireSplitArrows = (arrowSkill, effectiveSpeed, createArrow) => {
    const splitUnlockLevel = SKILL_ARROW.splitArrow?.unlockLevel || 4;
    const maxSplitArrows = SKILL_ARROW.splitArrow?.maxArrows || 1;
    if (arrowSkill.currentLevel < splitUnlockLevel || !enemies?.value) return;

    const splitCount = Math.min(
      arrowSkill.currentLevel - splitUnlockLevel + 1,
      maxSplitArrows,
    );
    const nearestEnemies = enemies.value
      .filter((e) => !e.dead)
      .map((e) => {
        const dx = e.x - player.x,
          dy = e.y - player.y;
        return { e, distSq: dx * dx + dy * dy };
      })
      .sort((a, b) => a.distSq - b.distSq)
      .slice(0, splitCount);

    nearestEnemies.forEach(({ e }) => {
      const edx = e.x - player.x;
      const edy = e.y - player.y;
      const edist = Math.sqrt(edx * edx + edy * edy);
      if (edist < 1) return;
      const baseAngle = Math.atan2(edy, edx);
      const spreadAngle = baseAngle + (Math.random() - 0.5) * 0.3;
      createArrow(
        Math.cos(spreadAngle) * effectiveSpeed,
        Math.sin(spreadAngle) * effectiveSpeed,
        0.7,
      );
    });
  };

  const canActivateSkill = (skill) => {
    if (player.controlLocked) return false;
    if (player.hacked) return false;
    if (skill.isPassive) return false;
    if (skill.remainingCooldown > 0) return false;
    if (gameState.isDead || gameState.levelUpPending || gameState.stelePending)
      return false;

    const ultimateRayActive = player.skills.some(s => s.id === "ultimateRay" && s.active);
    if (ultimateRayActive) {
      const allowedIds = ["bodyStrength", "dash", "ultimateRay"];
      if (!allowedIds.includes(skill.id)) return false;
    }

    return true;
  };

  const getSkillStats = (skill) => {
    return {
      dmg:
        calcSkillValue(skill.damage, skill.growth?.damage, skill.currentLevel) +
        (player.baseAttack || 0),
      range: calcSkillValue(
        skill.range,
        skill.growth?.range,
        skill.currentLevel,
      ),
      cooldown: calcSkillValue(
        skill.cooldown,
        skill.growth?.cooldown,
        skill.currentLevel,
      ),
      duration: calcSkillValue(
        skill.duration,
        skill.growth?.duration,
        skill.currentLevel,
      ),
      projectileSpeed: calcSkillValue(
        skill.projectileSpeed,
        skill.growth?.projectileSpeed,
        skill.currentLevel,
      ),
      lifestealPercent: calcSkillValue(
        skill.lifestealPercent,
        skill.growth?.lifestealPercent,
        skill.currentLevel,
      ),
      speedBoost: calcSkillValue(
        skill.speedBoost,
        skill.growth?.speedBoost,
        skill.currentLevel,
      ),
      damageBoost: calcSkillValue(
        skill.damageBoost,
        skill.growth?.damageBoost,
        skill.currentLevel,
      ),
    };
  };

  const activateMelee = (skill, stats) => {
    const canvas = gameCanvas.value?.canvasRef;
    const mouseLogical = toLogical(mouseScreen.x, mouseScreen.y, canvas);
    effects.value.push({
      type: "meleeSlash",
      x: player.x,
      y: player.y,
      radius: stats.range,
      duration: 300,
      elapsed: 0,
      angle: Math.atan2(mouseLogical.y - player.y, mouseLogical.x - player.x),
    });
    enemies.value.forEach((e) => {
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const range = stats.range + e.size / 2;
      if (dx * dx + dy * dy <= range * range) {
        damageEnemy(e, stats.dmg, true, "meleeAttack");
      }
    });
    skill.remainingCooldown = stats.cooldown;
    log("近战劈斩！");
  };

  const activateAutoSeek = (skill, stats) => {
    const nearest = findNearestEnemy(stats.range);
    if (!nearest) return;

    const extraCount = Math.min(
      (skill.currentLevel || 1) - 1,
      skill.maxExtraProjectiles || 5,
    );
    const totalCount = 1 + extraCount;
    const rangeSq = stats.range * stats.range;
    const candidateTargets = enemies.value
      .filter((e) => !e.dead)
      .map((e) => {
        const edx = e.x - player.x;
        const edy = e.y - player.y;
        return { enemy: e, distSq: edx * edx + edy * edy };
      })
      .filter(({ distSq }) => distSq <= rangeSq)
      .sort((a, b) => a.distSq - b.distSq)
      .map(({ enemy }) => enemy);

    for (let i = 0; i < totalCount; i++) {
      const target = candidateTargets[i % candidateTargets.length] || nearest;
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let vx = (dx / dist) * stats.projectileSpeed;
      let vy = (dy / dist) * stats.projectileSpeed;
      if (i > 0) {
        const jitter = (Math.random() - 0.5) * (Math.PI / 6);
        const cos = Math.cos(jitter);
        const sin = Math.sin(jitter);
        const newVx = vx * cos - vy * sin;
        const newVy = vx * sin + vy * cos;
        vx = newVx;
        vy = newVy;
      }

      projectiles.value.push({
        type: "autoSeek",
        x: player.x,
        y: player.y,
        vx,
        vy,
        damage: stats.dmg,
        size: skill.size || 10,
        owner: "player",
        targetEnemy: target,
        seekSpeed: stats.projectileSpeed,
      });
    }
    skill.remainingCooldown = stats.cooldown;
    log(`追踪弹幕发射！×${totalCount}`);
  };

  const activateFreeze = (skill, stats) => {
    effects.value.push({
      type: "freezeCircle",
      x: player.x,
      y: player.y,
      radius: stats.range,
      duration: 500,
      elapsed: 0,
    });
    enemies.value.forEach((e) => {
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const range = stats.range + e.size / 2;
      if (dx * dx + dy * dy <= range * range) {
        damageEnemy(e, stats.dmg);
        e.frozen = true;
        e.frozenTimer = stats.duration;
      }
    });
    skill.remainingCooldown = stats.cooldown;
    log("冰冻定身！");
  };

  const activateVampireAura = (skill, stats) => {
    skill.active = true;
    skill.auraTimer = stats.duration;
    skill.auraDamage = stats.dmg;
    skill.auraLifesteal = stats.lifestealPercent;
    skill.auraRange = stats.range;
    skill.auraTickTimer = 0;
    skill.remainingCooldown = stats.cooldown;
    log("吸血光环启动！");
  };

  const activateInvincible = (skill, stats) => {
    skill.active = true;
    skill.invincibleTimer = stats.duration;
    skill.invincibleTotalDuration = stats.duration;
    skill.invincibleSpeedBoost = stats.speedBoost;
    skill.invincibleDamageBoost = stats.damageBoost;
    skill.remainingCooldown = stats.cooldown;

    const mcSkill = player.skills.find((s) => s.id === "magicCircle");
    if (mcSkill) {
      magicCircles.value.push({
        id: Date.now() + Math.random(),
        type: "magicCircle",
        x: player.x,
        y: player.y,
        followsPlayer: true,
        radius: mcSkill.radius || 70,
        duration: stats.duration,
        elapsed: 0,
        burnDamage: mcSkill.dashBurnDamage || 5,
        burnTickInterval: mcSkill.burnTickInterval || 500,
        burnTickTimer: 0,
        fireballCount: 0,
        fireballDamage: 0,
        fireballRadius: mcSkill.fireballRadius || 25,
        fireballInterval: mcSkill.fireballInterval || 800,
        fireballTimer: 0,
        slowTimer: mcSkill.slowTimer || 500,
        slowFactor: mcSkill.slowFactor || 0.5,
      });
    }
    log("无敌启动！");
  };

  const activateMagicCircle = (skill, stats) => {
    const canvas = gameCanvas.value?.canvasRef;
    if (!canvas) {
      skill.remainingCooldown = stats.cooldown;
      return;
    }
    const mouseWorld = toLogical(mouseScreen.x, mouseScreen.y, canvas);

    const effectiveRadius = calcSkillValueLinear(
      skill.range,
      skill.growth?.range,
      skill.currentLevel,
    );
    const effectiveDuration = calcSkillValueLinear(
      skill.duration,
      skill.growth?.duration,
      skill.currentLevel,
    );
    const effectiveFireballCount = Math.floor(
      calcSkillValueLinear(
        skill.fireballCount,
        skill.growth?.fireballCount,
        skill.currentLevel,
      ),
    );
    const effectiveFireballDmg =
      calcSkillValueLinear(
        skill.damage,
        skill.growth?.damage,
        skill.currentLevel,
      ) + (player.baseAttack || 0);
    const effectiveBurnDmg = calcSkillValueLinear(
      skill.burnDamage,
      skill.growth?.burnDamage,
      skill.currentLevel,
    );

    magicCircles.value.push({
      id: Date.now() + Math.random(),
      type: "magicCircle",
      x: mouseWorld.x,
      y: mouseWorld.y,
      radius: effectiveRadius,
      duration: effectiveDuration,
      elapsed: 0,
      burnDamage: Math.round(effectiveBurnDmg),
      burnTickInterval: skill.burnTickInterval || 500,
      burnTickTimer: 0,
      fireballCount: effectiveFireballCount,
      fireballDamage: Math.round(effectiveFireballDmg),
      fireballRadius: skill.fireballRadius || 25,
      fireballInterval: skill.fireballInterval || 800,
      fireballTimer: 0,
      slowTimer: skill.slowTimer || 500,
      slowFactor: skill.slowFactor || 0.5,
    });

    skill.remainingCooldown = stats.cooldown;
    log("魔法阵火雨降临！");
  };

  const activateDash = (skill, stats) => {
    let dx = 0,
      dy = 0;
    if (keysDown["w"] || keysDown["arrowup"]) dy -= 1;
    if (keysDown["s"] || keysDown["arrowdown"]) dy += 1;
    if (keysDown["a"] || keysDown["arrowleft"]) dx -= 1;
    if (keysDown["d"] || keysDown["arrowright"]) dx += 1;

    if (dx === 0 && dy === 0) {
      if (player.direction === DIRECTION.LEFT) dx = -1;
      else if (player.direction === DIRECTION.RIGHT) dx = 1;
      else dy = 1;
    } else {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }

    if (player.confusionTimer > 0) {
      dx = -dx;
      dy = -dy;
    }

    const effectiveDuration = calcSkillValue(
      skill.duration,
      skill.growth?.duration,
      skill.currentLevel,
    );
    const effectiveDistance = calcSkillValue(
      skill.range,
      skill.growth?.range,
      skill.currentLevel,
    );

    skill.active = true;
    skill.dashTimer = effectiveDuration;
    skill.dashDuration = effectiveDuration;
    skill.dashDistance = effectiveDistance;
    skill.dashDx = dx;
    skill.dashDy = dy;
    skill.remainingCooldown = stats.cooldown;

    player._dashInvincibleTimer = PLAYER_ATTRS.baseHitInvincibleTime;

    effects.value.push({
      type: "dashTrail",
      x: player.x,
      y: player.y,
      duration: 250,
      elapsed: 0,
      direction: player.direction,
    });

    log("冲刺！");

    if (Math.random() < (skill.dashChance || 0.3)) {
      const mcSkill = player.skills.find((s) => s.id === "magicCircle");
      if (mcSkill) {
        magicCircles.value.push({
          id: Date.now() + Math.random(),
          type: "magicCircle",
          x: player.x,
          y: player.y,
          radius: mcSkill.radius || 70,
          duration: mcSkill.dashDuration || 4000,
          elapsed: 0,
          burnDamage: mcSkill.dashBurnDamage || 5,
          burnTickInterval: mcSkill.burnTickInterval || 500,
          burnTickTimer: 0,
          fireballCount: 0,
          fireballDamage: 0,
          fireballRadius: mcSkill.fireballRadius || 25,
          fireballInterval: mcSkill.fireballInterval || 800,
          fireballTimer: 0,
          slowTimer: mcSkill.slowTimer || 500,
          slowFactor: mcSkill.slowFactor || 0.5,
        });
        log("冲刺触发灼烧魔法阵！");
      }
    }
  };

  const activateSkill = (skill) => {
    if (!canActivateSkill(skill)) return;
    const stats = getSkillStats(skill);

    switch (skill.id) {
      case "meleeAttack":
        activateMelee(skill, stats);
        break;
      case "autoSeek":
        activateAutoSeek(skill, stats);
        break;
      case "freeze":
        activateFreeze(skill, stats);
        break;
      case "vampireAura":
        activateVampireAura(skill, stats);
        break;
      case "invincible":
        activateInvincible(skill, stats);
        break;
      case "magicCircle":
        activateMagicCircle(skill, stats);
        break;
      case "dash":
        activateDash(skill, stats);
        break;
      case "ultimateRay":
        activateUltimateRay(skill);
        break;
      default:
        break;
    }
  };

  const onSkillClick = (sk) => {
    activateSkill(sk);
  };

  const updatePlayer = (dt) => {
    updateBoundary(dt);
    updateDashMovement(dt);
    updatePlayerMovement(dt);
    pickupLoot();
    updateVampireAura(dt);
    updateInvincible(dt);
    updateUltimateRayTarget();
    handleAutoArrow();
    handleAutoSkills();
    if (player.hitFlash > 0) player.hitFlash--;
    if (player._dashInvincibleTimer > 0) player._dashInvincibleTimer -= dt;
    if (player.confusionTimer > 0) {
      player.confusionTimer -= dt;
      if (player.confusionTimer <= 0) player.confusionTimer = 0;
    }
  };

  const updateUltimateRayTarget = () => {
    const ultimateRaySkill = player.skills.find(s => s.id === "ultimateRay");
    if (!ultimateRaySkill || !ultimateRaySkill.active) return;

    const canvas = gameCanvas.value?.canvasRef;
    if (!canvas) return;
    const mouseLogical = toLogical(mouseScreen.x, mouseScreen.y, canvas);
    ultimateRaySkill.ultimateRayTargetX = mouseLogical.x;
    ultimateRaySkill.ultimateRayTargetY = mouseLogical.y;
  };

  const updateBoundary = (dt) => {
    _boundarySlow = 0;
    player._boundaryDamageTimer = (player._boundaryDamageTimer || 0) + dt;

    const canvas = gameCanvas.value?.canvasRef;
    if (!canvas) return;

    const boundaryRadX = canvas.width * BOUNDARY.radiusX;
    const boundaryRadY = canvas.height * BOUNDARY.radiusY;
    const excessX = Math.max(0, Math.abs(player.x) - boundaryRadX);
    const excessY = Math.max(0, Math.abs(player.y) - boundaryRadY);
    const maxExcess = Math.max(excessX, excessY);

    if (maxExcess > 0) {
      const zones = BOUNDARY.zones;
      for (let i = zones.length - 1; i >= 0; i--) {
        const zoneThreshold = zones[i].threshold * canvas.width;
        if (maxExcess >= zoneThreshold) {
          _boundarySlow = zones[i].slow;
          player._boundaryDangerLevel = i + 1;
          const isSkillInvincible = player.skills.some(
            (s) => s.id === "invincible" && s.active,
          );
          const isWallInvincible =
            buffGetters?.isWallInvincible?.() || debugFlags?.godMode;
          if (!isSkillInvincible && !isWallInvincible) {
            if (player._boundaryDamageTimer >= BOUNDARY.tickInterval) {
              player._boundaryDamageTimer -= BOUNDARY.tickInterval;
              player.hp = Math.max(
                0,
                player.hp - player.maxHp * zones[i].hpPercent,
              );
            }
          } else {
            player._boundaryDamageTimer = 0;
          }
          break;
        }
      }
      player._boundaryWarning = 0;
    } else {
      player._boundaryDamageTimer = 0;
      player._boundaryDangerLevel = 0;
      const marginX =
        Math.max(0, boundaryRadX - Math.abs(player.x)) /
        (boundaryRadX * BOUNDARY.warningRatio);
      const marginY =
        Math.max(0, boundaryRadY - Math.abs(player.y)) /
        (boundaryRadY * BOUNDARY.warningRatio);
      player._boundaryWarning = 1 - Math.min(marginX, marginY);
    }
  };

  const updateDashMovement = (dt) => {
    const dashSkill = player.skills.find((s) => s.id === "dash" && s.active);
    if (!dashSkill) return;

    if (player.controlLocked || player.hacked) {
      dashSkill.active = false;
      return;
    }

    dashSkill.dashTimer -= dt;
    const step = (dashSkill.dashDistance / dashSkill.dashDuration) * dt;
    player.x += dashSkill.dashDx * step;
    player.y += dashSkill.dashDy * step;

    effects.value.push({
      type: "dashTrail",
      x: player.x,
      y: player.y,
      duration: 200,
      elapsed: 0,
      direction: player.direction,
    });

    if (dashSkill.dashTimer <= 0) {
      dashSkill.active = false;
    }
  };

  const updatePlayerMovement = (dt) => {
    let dx = 0,
      dy = 0;
    if (!player.controlLocked) {
      if (keysDown["w"] || keysDown["arrowup"]) dy -= 1;
      if (keysDown["s"] || keysDown["arrowdown"]) dy += 1;
      if (keysDown["a"] || keysDown["arrowleft"]) dx -= 1;
      if (keysDown["d"] || keysDown["arrowright"]) dx += 1;
    }

    if (player.confusionTimer > 0) {
      dx = -dx;
      dy = -dy;
    }

    player.isMoving = dx !== 0 || dy !== 0;

    if (player.isMoving) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;

      const invFrame = player.skills.find(
        (s) => s.id === "invincible" && s.active,
      );
      let currentSpeed = invFrame
        ? player.speed * (1 + invFrame.invincibleSpeedBoost)
        : player.speed;

      if (buffGetters?.getSpeedMultiplier)
        currentSpeed *= buffGetters.getSpeedMultiplier();
      if (buffGetters?.getDeathZoneSlow) {
        const slow = buffGetters.getDeathZoneSlow();
        if (slow > 0) currentSpeed *= 1 - slow;
      }
      if (buffGetters?.getBossSlowMultiplier)
        currentSpeed *= buffGetters.getBossSlowMultiplier();
      if (buffGetters?.getLightningSlowRatio) {
        const slow = buffGetters.getLightningSlowRatio();
        if (slow > 0) currentSpeed *= 1 - slow;
      }
      if (_boundarySlow > 0) currentSpeed *= 1 - _boundarySlow;

      player.x += dx * currentSpeed;
      player.y += dy * currentSpeed;

      if (Math.abs(dx) > Math.abs(dy)) {
        player.direction = dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
      } else {
        player.direction = DIRECTION.FRONT;
      }

      player.frameTimer += dt;
      if (player.frameTimer >= FRAME_INTERVAL) {
        player.frameTimer -= FRAME_INTERVAL;
        player.frame = (player.frame + 1) % FRAME_COUNT;
      }
    } else {
      player.frame = 0;
      player.frameTimer = 0;
    }
  };

  const pickupLoot = () => {
    const pickupRangeSq = (ENTITY_SIZE / 2 + LOOT_PICKUP_EXTRA_RANGE) ** 2;
    for (let i = lootDrops.value.length - 1; i >= 0; i--) {
      const drop = lootDrops.value[i];
      const dx = drop.x - player.x,
        dy = drop.y - player.y;
      if (dx * dx + dy * dy <= pickupRangeSq) {
        if (drop.id === "healthPotion") {
          player.hp = Math.min(player.maxHp, player.hp + drop.healAmount);
          log(`拾取 ${drop.name}，恢复 ${drop.healAmount} 生命`);
        } else if (drop.id === "goldCoin") {
          player.gold = (player.gold || 0) + drop.goldAmount;
          log(`拾取 ${drop.name}`);
        }
        lootDrops.value.splice(i, 1);
      }
    }
  };

  const updateVampireAura = (dt) => {
    const vampireSkill = player.skills.find(
      (s) => s.id === "vampireAura" && s.active,
    );
    if (!vampireSkill) return;

    vampireSkill.auraTimer -= dt;
    vampireSkill.auraTickTimer += dt;

    if (vampireSkill.auraTickTimer >= (vampireSkill.tickInterval || 1000)) {
      vampireSkill.auraTickTimer -= (vampireSkill.tickInterval || 1000);
      enemies.value.forEach((e) => {
        if (e.dead) return;
        const dx = e.x - player.x,
          dy = e.y - player.y;
        const range = vampireSkill.auraRange + e.size / 2;
        if (dx * dx + dy * dy <= range * range) {
          damageEnemy(e, vampireSkill.auraDamage);
          player.hp = Math.min(
            player.maxHp || PLAYER_ATTRS.maxHp,
            player.hp + vampireSkill.auraDamage * vampireSkill.auraLifesteal,
          );
        }
      });
    }

    if (vampireSkill.auraTimer <= 0) {
      vampireSkill.active = false;
    }
  };

  const updateInvincible = (dt) => {
    const invSkill = player.skills.find(
      (s) => s.id === "invincible" && s.active,
    );
    if (!invSkill) return;
    invSkill.invincibleTimer -= dt;
    if (invSkill.invincibleTimer <= 0) {
      invSkill.active = false;
    }
  };

  const handleAutoArrow = () => {
    if (!mouseHeld.value && !autoSkills?.arrow?.value) return;
    if (gameState.isDead || gameState.levelUpPending || player.controlLocked)
      return;
    const arrowSkill = player.skills.find((s) => s.id === "arrow");
    if (arrowSkill && arrowSkill.remainingCooldown <= 0) {
      fireArrow();
    }
  };

  const handleAutoSkills = () => {
    if (gameState.isDead || gameState.levelUpPending) return;

    const autoSeekSkill = player.skills.find((s) => s.id === "autoSeek");
    if (autoSeekSkill && autoSeekSkill.remainingCooldown <= 0) {
      const range = calcSkillValue(
        autoSeekSkill.range,
        autoSeekSkill.growth?.range,
        autoSeekSkill.currentLevel,
      );
      const rangeSq = range * range;
      const hasTarget = enemies.value.some((e) => {
        if (e.dead) return false;
        const edx = e.x - player.x;
        const edy = e.y - player.y;
        return edx * edx + edy * edy <= rangeSq;
      });
      if (hasTarget) activateSkill(autoSeekSkill);
    }

    const vampireAutoSkill = player.skills.find((s) => s.id === "vampireAura");
    if (
      vampireAutoSkill &&
      vampireAutoSkill.remainingCooldown <= 0 &&
      !vampireAutoSkill.active
    ) {
      activateSkill(vampireAutoSkill);
    }

    const meleeSkill = player.skills.find((s) => s.id === "meleeAttack");
    if (meleeSkill && meleeSkill.remainingCooldown <= 0) {
      const range = calcSkillValue(
        meleeSkill.range,
        meleeSkill.growth?.range,
        meleeSkill.currentLevel,
      );
      const hasEnemy = enemies.value.some((e) => {
        if (e.dead || e.frozen) return false;
        const edx = e.x - player.x;
        const edy = e.y - player.y;
        const r = range + e.size / 2;
        return edx * edx + edy * edy <= r * r;
      });
      if (hasEnemy) activateSkill(meleeSkill);
    }

    if (!player.controlLocked && !player.hacked && autoSkills?.freeze?.value) {
      const freezeSkill = player.skills.find((s) => s.id === "freeze");
      if (freezeSkill && freezeSkill.remainingCooldown <= 0) {
        const range = calcSkillValue(
          freezeSkill.range,
          freezeSkill.growth?.range,
          freezeSkill.currentLevel,
        );
        const rangeSq = range * range;
        const hasEnemy = enemies.value.some((e) => {
          if (e.dead) return false;
          const edx = e.x - player.x;
          const edy = e.y - player.y;
          return edx * edx + edy * edy <= rangeSq;
        });
        if (hasEnemy) activateSkill(freezeSkill);
      }
    }

    if (
      !player.controlLocked &&
      !player.hacked &&
      autoSkills?.invincible?.value
    ) {
      const invSkill = player.skills.find((s) => s.id === "invincible");
      if (invSkill && invSkill.remainingCooldown <= 0 && !invSkill.active) {
        activateSkill(invSkill);
      }
    }

    if (
      !player.controlLocked &&
      !player.hacked &&
      autoSkills?.magicCircle?.value
    ) {
      const mcSkill = player.skills.find((s) => s.id === "magicCircle");
      if (mcSkill && mcSkill.remainingCooldown <= 0) {
        const range = calcSkillValueLinear(
          mcSkill.range,
          mcSkill.growth?.range,
          mcSkill.currentLevel,
        );
        const rangeSq = range * range;
        const hasEnemy = enemies.value.some((e) => {
          if (e.dead) return false;
          const edx = e.x - player.x;
          const edy = e.y - player.y;
          return edx * edx + edy * edy <= rangeSq;
        });
        if (hasEnemy) activateSkill(mcSkill);
      }
    }

    if (!player.controlLocked && !player.hacked && autoSkills?.dash?.value) {
      const dashSkill = player.skills.find((s) => s.id === "dash");
      if (dashSkill && dashSkill.remainingCooldown <= 0 && !dashSkill.active) {
        const hasDir =
          keysDown["w"] ||
          keysDown["a"] ||
          keysDown["s"] ||
          keysDown["d"] ||
          keysDown["arrowup"] ||
          keysDown["arrowleft"] ||
          keysDown["arrowdown"] ||
          keysDown["arrowright"];
        if (hasDir) activateSkill(dashSkill);
      }
    }

    if (
      !player.controlLocked &&
      !player.hacked &&
      autoSkills?.ultimateRay?.value
    ) {
      const ultSkill = player.skills.find((s) => s.id === "ultimateRay");
      if (ultSkill && ultSkill.remainingCooldown <= 0 && !ultSkill.active) {
        activateSkill(ultSkill);
      }
    }
  };

  const activateUltimateRay = (skill) => {
    const duration = calcSkillValue(
      skill.duration || 5000,
      skill.growth?.duration,
      player.level
    );

    const dmg = calcSkillValue(
      skill.damage || 15,
      skill.growth?.damage,
      player.level
    ) + (player.baseAttack || 0);

    const currentTickInterval = calcSkillValue(
      skill.tickInterval || 300,
      skill.growth?.tickInterval,
      player.level
    );

    skill.active = true;
    skill.ultimateRayTimer = duration;
    skill.ultimateRayTotalDuration = duration;
    skill.ultimateRayTickTimer = 0;
    skill.ultimateRayTargetX = player.x;
    skill.ultimateRayTargetY = player.y;
    skill.ultimateRayDamage = dmg;
    skill.ultimateRayLifesteal = skill.lifestealPercent || 0.5;
    skill.ultimateRayCurrentTickInterval = currentTickInterval;
    skill.remainingCooldown = skill.cooldown;

    log("终极射线发射！");
  };

  const resetPlayer = () => {
    player.x = 0;
    player.y = 0;
    player.hp = PLAYER_ATTRS.maxHp;
    player.maxHp = PLAYER_ATTRS.maxHp;
    player.speed = PLAYER_ATTRS.speed;
    player.baseAttack = PLAYER_ATTRS.baseAttack;
    player.level = 1;
    player.exp = 0;
    player.direction = DIRECTION.FRONT;
    player.frame = 0;
    player.frameTimer = 0;
    player.isMoving = false;
    player.hitFlash = 0;
    player.gold = 0;
    player.dodgeChance = 0;
    player.controlLocked = false;
    player.hacked = false;
    player._arrowFireballTimer = 0;
    player._arrowFireballHitX = null;
    player._arrowFireballHitY = null;
    player._arrowFreezeTimer = 0;
    player._arrowFreezeHitX = null;
    player._arrowFreezeHitY = null;
    player._barrageFreezeTimer = 0;
    player._barrageFreezeHitX = null;
    player._barrageFreezeHitY = null;
    player.confusionTimer = 0;

    const arrowTemplate = SKILL_TABLE.find((s) => s.id === "arrow");
    const ultimateRayTemplate = SKILL_TABLE.find((s) => s.id === "ultimateRay");
    player.skills.length = 0;
    player.skills.push(createSkillInstance(arrowTemplate, 1));
    if (ultimateRayTemplate) {
      player.skills.push(createSkillInstance(ultimateRayTemplate, 1));
    }
    recalcPassiveBuffs();
  };

  return {
    updatePlayer,
    fireArrow,
    activateSkill,
    onSkillClick,
    damageEnemy,
    findNearestEnemy,
    showLevelUpOptions,
    _onLevelUpChoice,
    createSkillInstance,
    resetPlayer,
    recalcPassiveBuffs,
    gainExp,
    getBoundaryDangerLevel: () => player._boundaryDangerLevel || 0,
    getBoundarySlow: () => _boundarySlow,
    getBoundaryWarning: () => player._boundaryWarning || 0,
  };
}
