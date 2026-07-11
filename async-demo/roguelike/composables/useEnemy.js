import { reactive, ref } from "vue";
import {
  ENEMY_PROJECTILE_SPEED,
  ENEMY_PROJECTILE_DAMAGE,
  ENEMY_PROJECTILE_SIZE,
  FRAME_INTERVAL,
  FRAME_COUNT,
  DIRECTION,
  ENTITY_SIZE,
  MAX_SUMMONS,
  ENEMY_ELITE_HACKER,
  PLAYER_ATTRS,
  HIT_FLASH_PLAYER,
  HIT_FLASH_ENEMY,
  HIT_FLASH_ENEMY_LIGHT,
} from "../constants.js";
import { useDebug } from "./useDebug.js";
import { pushBattleLog } from "./useBattleLog.js";

export const groundZones = ref([]);

export function useEnemy(
  enemies,
  player,
  projectiles,
  gameState,
  mapUtils,
  battleLog,
  effects,
  gainExp,
  buffGetters = null,
) {
  const { checkCollision } = mapUtils;
  const { debugFlags } = useDebug();

  const log = (msg) => pushBattleLog(battleLog, msg);

  const tryDamagePlayer = (rawDmg) => {
    if (player._dashInvincibleTimer > 0) return false;
    const isInvincible = player.skills.some(
      (s) => (s.id === "invincible" || s.id === "ultimateRay") && s.active,
    );
    if (debugFlags?.godMode || isInvincible) return false;

    const playerLevel = player.level || 1;
    const healthBonusMultiplier = Math.log2(playerLevel + 1);
    const maxDamageRatio = Math.max(
      PLAYER_ATTRS.healthBonusMinRatio,
      1 - healthBonusMultiplier * PLAYER_ATTRS.healthBonusLogMultiplier,
    );
    const hitInvincibleBonus = healthBonusMultiplier * PLAYER_ATTRS.hitInvincibleBonusPerLog;
    const hitInvincibleTime = PLAYER_ATTRS.baseHitInvincibleTime + hitInvincibleBonus;

    if (player._hitInvincibleEnd && gameState.gameTime < player._hitInvincibleEnd) {
      effects.value.push({
        type: "hitBlocked",
        x: player.x,
        y: player.y,
        duration: PLAYER_ATTRS.hitBlockedEffectDuration,
        elapsed: 0,
      });
      return false;
    }

    const totalDodge =
      (player.dodgeChance || 0) + (buffGetters?.getDodgeChance?.() || 0);
    if (totalDodge > 0 && Math.random() < totalDodge) return false;

    const curseMult = buffGetters?.getEnemyDamageMultiplier?.() || 1;
    let finalDmg = rawDmg * curseMult;

    const maxHp = player.maxHp || PLAYER_ATTRS.maxHp;
    const damageCap = maxHp * maxDamageRatio;
    if (finalDmg > damageCap) {
      finalDmg = damageCap;
    }

    player.hp -= finalDmg;
    player.hitFlash = HIT_FLASH_PLAYER;
    player._hitInvincibleEnd = gameState.gameTime + hitInvincibleTime;

    if (player.hp <= 0) {
      player.hp = 0;
      gameState.isDead = true;
      log("玩家阵亡！");
    }
    return true;
  };

  const updateDirection = (e, dx, dy, dist, dt) => {
    if (dist > 1) {
      if (Math.abs(dx) > Math.abs(dy)) {
        e.direction = dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
      } else {
        e.direction = DIRECTION.FRONT;
      }
      e.frameTimer = (e.frameTimer || 0) + dt;
      if (e.frameTimer >= FRAME_INTERVAL) {
        e.frameTimer -= FRAME_INTERVAL;
        e.frame = ((e.frame || 0) + 1) % FRAME_COUNT;
      }
    }
  };

  const updateBomber = (e, dt) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const bomRange = e.bomberRange || 55;

    if (!debugFlags?.pauseEnemyAttack && dist <= bomRange) {
      tryDamagePlayer(e.attack || 30);
      enemies.value.forEach((other) => {
        if (other === e || other.dead) return;
        const od = Math.sqrt((other.x - e.x) ** 2 + (other.y - e.y) ** 2);
        if (od < bomRange + other.size / 2) {
          other.hp -= (e.attack || 30) * (e.friendlyDamageRatio || 0.6);
          other.hitFlash = HIT_FLASH_ENEMY;
          if (other.hp <= 0) {
            other.dead = true;
            gameState.killCount++;
          }
        }
      });
      effects.value.push({
        type: "explosion",
        x: e.x,
        y: e.y,
        radius: bomRange,
        duration: 600,
        elapsed: 0,
        color: e.color,
        color2: e.color2,
      });
      gainExp(e.expReward || 0);
      gameState.killCount++;
      e.dead = true;
      log("敌人自爆！");
    } else if (dist > 1 && !debugFlags?.pauseEnemyMovement) {
      const sf = e.slowed ? e.slowFactor || 0.5 : 1;
      e.x += (dx / dist) * e.speed * sf;
      e.y += (dy / dist) * e.speed * sf;
    }
    updateDirection(e, dx, dy, dist, dt);
    if (e.hitFlash > 0) e.hitFlash--;
  };

  const updateSummoner = (e, dt) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const comfortDist = (e.skillRange || 300) * 0.7;
    const sf = e.slowed ? e.slowFactor || 0.5 : 1;

    if (!debugFlags?.pauseEnemyMovement) {
      if (dist < comfortDist && dist > 1) {
        e.x -= (dx / dist) * e.speed * sf;
        e.y -= (dy / dist) * e.speed * sf;
      } else if (dist > (e.skillRange || 300) && dist > 1) {
        e.x += (dx / dist) * e.speed * sf;
        e.y += (dy / dist) * e.speed * sf;
      }
    }

    if (
      !debugFlags?.pauseEnemyAttack &&
      dist <= (e.skillRange || 300) &&
      dist > 1
    ) {
      e.boltTimer = (e.boltTimer || 0) + dt;
      if (e.boltTimer >= (e.boltCooldown || 1300)) {
        e.boltTimer = 0;
        const ndx = dx / dist;
        const ndy = dy / dist;
        projectiles.value.push({
          type: "summonerBolt",
          x: e.x,
          y: e.y,
          vx: ndx * (e.boltSpeed || 3.5),
          vy: ndy * (e.boltSpeed || 3.5),
          damage: e.boltDamage || 6,
          size: e.boltSize || 7,
          owner: "enemy",
        });
      }
    }

    if (!debugFlags?.pauseEnemyAttack) {
      e.summonTimer = (e.summonTimer || 0) + dt;
      if (e.summonTimer >= (e.summonCooldown || 4000)) {
        e.summonTimer = 0;
        e.boltTimer = 0;
        const batchSize = e.summonCount || 2;
        const maxMinions = e.summonMaxMinions || 6;
        const sacrificeDmg = e.summonSacrificeDmg || 10;
        const sacrificeRadius = e.summonSacrificeRadius || 50;

        const aliveMinions = enemies.value.filter(
          (m) => m.summonedBy === e.eid && !m.dead,
        );
        const excess = aliveMinions.length + batchSize - maxMinions;

        if (excess > 0) {
          for (let i = 0; i < excess && i < aliveMinions.length; i++) {
            const old = aliveMinions[i];
            const pdist = Math.sqrt(
              (player.x - old.x) ** 2 + (player.y - old.y) ** 2,
            );
            if (pdist < sacrificeRadius + ENTITY_SIZE / 2) {
              tryDamagePlayer(sacrificeDmg);
              player.hitFlash = HIT_FLASH_ENEMY;
            }
            enemies.value.forEach((other) => {
              if (other === old || other.dead) return;
              const od = Math.sqrt(
                (other.x - old.x) ** 2 + (other.y - old.y) ** 2,
              );
              if (od < sacrificeRadius + other.size / 2) {
                other.hp -= sacrificeDmg * 0.6;
                other.hitFlash = HIT_FLASH_ENEMY_LIGHT;
                if (other.hp <= 0) {
                  other.dead = true;
                  gameState.killCount++;
                }
              }
            });
            effects.value.push({
              type: "explosion",
              variant: "sacrifice",
              x: old.x,
              y: old.y,
              radius: sacrificeRadius,
              duration: 550,
              elapsed: 0,
              color: e.color,
              color2: e.color2,
            });
            old.dead = true;
            gameState.killCount++;
          }
        }

        const afterDestroy = enemies.value.filter(
          (m) => m.summonedBy === e.eid && !m.dead,
        ).length;
        let toSpawn = Math.min(batchSize, maxMinions - afterDestroy);
        const globalSummons = enemies.value.filter(
          (m) => m.summonedBy && !m.dead,
        ).length;
        toSpawn = Math.max(0, Math.min(toSpawn, MAX_SUMMONS - globalSummons));
        for (let i = 0; i < toSpawn; i++) {
          const angle = ((Math.PI * 2) / toSpawn) * i + Math.random() * 0.5;
          const spawnR = e.size + 20;
          enemies.value.push({
            eid: Date.now() + Math.random(),
            type: "melee",
            summonedBy: e.eid,
            x: e.x + Math.cos(angle) * spawnR,
            y: e.y + Math.sin(angle) * spawnR,
            hp: e.summonMinionHp || 30,
            maxHp: e.summonMinionHp || 30,
            speed: e.summonMinionSpeed || 2.0,
            size: ENTITY_SIZE * (e.summonMinionSizeRatio || 0.75),
            attack: e.summonMinionAttack || 8,
            attackRange: e.summonMinionAttackRange || 45,
            skillRange: 0,
            skillCooldown: e.summonMinionCooldown || 800,
            color: e.color,
            color2: e.color2,
            expReward: 5,
            hasMelee: true,
            hasRanged: false,
            direction: DIRECTION.FRONT,
            frame: 0,
            frameTimer: 0,
            isMoving: true,
            dead: false,
            hitFlash: 0,
            frozen: false,
            frozenTimer: 0,
            skillTimer: Math.random() * 500,
            meleeAttacking: false,
            meleeCooldownTimer: 0,
          });
        }
      }
    }

    updateDirection(e, dx, dy, dist, dt);
    if (e.hitFlash > 0) e.hitFlash--;
  };

  const updateCharger = (e, dt) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    e.chargeTimer = e.chargeTimer || 0;
    e.chargeState = e.chargeState || "idle";
    e.chargeStateTimer = e.chargeStateTimer || 0;
    e.chargeDirX = e.chargeDirX || 0;
    e.chargeDirY = e.chargeDirY || 0;
    e.normalSpeed = e.normalSpeed || e.speed;

    switch (e.chargeState) {
      case "idle": {
        if (!debugFlags?.pauseEnemyMovement && dist > 1) {
          const sf = e.slowed ? e.slowFactor || 0.5 : 1;
          e.x += (dx / dist) * e.speed * sf;
          e.y += (dy / dist) * e.speed * sf;
        }
        e.chargeTimer += dt;
        if (e.chargeTimer >= (e.chargeCooldown || 3000) && dist < (e.triggerDistance || 400)) {
          e.chargeState = "winding";
          e.chargeStateTimer = 0;
          if (dist > 1) {
            e.chargeDirX = dx / dist;
            e.chargeDirY = dy / dist;
          }
          e.speed = 0;
        }
        updateDirection(e, dx, dy, dist, dt);
        break;
      }
      case "winding": {
        e.chargeStateTimer += dt;
        if (e.chargeStateTimer >= (e.windUpDuration || 500)) {
          e.chargeState = "charging";
          e.chargeStateTimer = 0;
          e.speed = e.chargeSpeed || 12;
        }
        break;
      }
      case "charging": {
        if (!debugFlags?.pauseEnemyMovement) {
          e.x += e.chargeDirX * e.speed;
          e.y += e.chargeDirY * e.speed;
        }
        e.chargeStateTimer += dt;
        e.direction = e.chargeDirX >= 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;

        if (!debugFlags?.pauseEnemyAttack) {
          const cdx = player.x - e.x;
          const cdy = player.y - e.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist <= (e.attackRange || 45) + ENTITY_SIZE / 2) {
            tryDamagePlayer(e.attack || 25);
            if (cdist > 0) {
              player.x += (cdx / cdist) * (e.knockbackDistance || 40);
              player.y += (cdy / cdist) * (e.knockbackDistance || 40);
            }
            log("被冲锋者撞击！");
            e.chargeState = "recovery";
            e.chargeStateTimer = 0;
            e.speed = 0;
          }
        }
        if (
          e.chargeState !== "recovery" &&
          e.chargeStateTimer >= (e.chargeDuration || 400)
        ) {
          e.chargeState = "recovery";
          e.chargeStateTimer = 0;
          e.speed = 0;
        }
        break;
      }
      case "recovery": {
        e.chargeStateTimer += dt;
        if (e.chargeStateTimer >= (e.recoveryDuration || 800)) {
          e.chargeState = "idle";
          e.chargeTimer = 0;
          e.speed = e.normalSpeed;
        }
        updateDirection(e, dx, dy, dist, dt);
        break;
      }
    }
    if (e.hitFlash > 0) e.hitFlash--;
  };

  const updateShielder = (e, dt) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let bestAlly = null;
    let bestAllyDist = e.shieldAuraRange || 120;
    enemies.value.forEach((other) => {
      if (other === e || other.dead || other.type === "shielder") return;
      const od = Math.sqrt((other.x - e.x) ** 2 + (other.y - e.y) ** 2);
      if (od < bestAllyDist) {
        bestAllyDist = od;
        bestAlly = other;
      }
    });

    if (bestAlly) {
      bestAlly.shieldedBy = e.eid;
      e.shieldedAllyId = bestAlly.eid;
      if (!debugFlags?.pauseEnemyMovement) {
        const sf = e.slowed ? e.slowFactor || 0.5 : 1;
        const adx = bestAlly.x - e.x;
        const ady = bestAlly.y - e.y;
        const adist = Math.sqrt(adx * adx + ady * ady);
        if (adist > 30) {
          e.x += (adx / adist) * e.speed * sf;
          e.y += (ady / adist) * e.speed * sf;
        }
      }
    } else {
      e.shieldedAllyId = null;
      if (!debugFlags?.pauseEnemyMovement && dist > 1) {
        const sf = e.slowed ? e.slowFactor || 0.5 : 1;
        e.x += (dx / dist) * e.speed * sf;
        e.y += (dy / dist) * e.speed * sf;
      }
    }
    updateDirection(e, dx, dy, dist, dt);
    if (e.hitFlash > 0) e.hitFlash--;
  };

  const updatePriest = (e, dt) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const comfort = (e.skillRange || 200) * 0.6;
    const sf = e.slowed ? e.slowFactor || 0.5 : 1;

    if (!debugFlags?.pauseEnemyMovement) {
      if (dist > comfort + 80) {
        e.x += (dx / dist) * e.speed * sf;
        e.y += (dy / dist) * e.speed * sf;
      } else if (dist < comfort) {
        e.x -= (dx / dist) * e.speed * 0.7 * sf;
        e.y -= (dy / dist) * e.speed * 0.7 * sf;
      }
    }

    e.priestHealTimer = (e.priestHealTimer || 0) + dt;
    if (e.priestHealTimer >= (e.priestHealInterval || 2000)) {
      e.priestHealTimer = 0;
      enemies.value.forEach((other) => {
        if (other === e || other.dead) return;
        const od = Math.sqrt((other.x - e.x) ** 2 + (other.y - e.y) ** 2);
        if (od <= (e.priestAuraRange || 130)) {
          if (
            other._lastPriestHeal &&
            gameState.gameTime - other._lastPriestHeal <
              (e.healImmunityTime || 1000)
          )
            return;
          const beforeHp = other.hp;
          const heal = e.priestHealAmount || 8;
          other.hp = Math.min(other.maxHp, other.hp + heal);
          if (other.hp > beforeHp) {
            other._lastPriestHeal = gameState.gameTime;
          }
        }
      });
    }
    updateDirection(e, dx, dy, dist, dt);
    if (e.hitFlash > 0) e.hitFlash--;
  };

  const updateVenom = (e, dt) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (!debugFlags?.pauseEnemyMovement && dist > 1) {
      const sf = e.slowed ? e.slowFactor || 0.5 : 1;
      e.x += (dx / dist) * e.speed * sf;
      e.y += (dy / dist) * e.speed * sf;
    }
    if (
      !debugFlags?.pauseEnemyAttack &&
      dist <= (e.skillRange || 300) &&
      dist > 1
    ) {
      e.venomBoltTimer = (e.venomBoltTimer || 0) + dt;
      if (e.venomBoltTimer >= (e.skillCooldown || 3000)) {
        e.venomBoltTimer = 0;
        const boltSpeed = e.venomBoltSpeed || 4;
        const ndx = dx / dist;
        const ndy = dy / dist;
        projectiles.value.push({
          type: "venomBolt",
          x: e.x,
          y: e.y,
          vx: ndx * boltSpeed,
          vy: ndy * boltSpeed,
          damage: e.venomBoltDamage || 10,
          size: e.venomBoltSize || 8,
          owner: "enemy",
          warnDuration: e.venomWarnDuration || 800,
          zoneDuration: e.venomZoneDuration || 5000,
          zoneDamage: e.venomZoneDamage || 2,
          zoneRadius: e.venomZoneRadius || 50,
          ownerEid: e.eid,
          venomMaxZones: e.venomMaxZones || 3,
          maxFlightTime: e.hookMaxFlightTime || 2000,
          flightTime: 0,
        });
      }
    }
    updateDirection(e, dx, dy, dist, dt);
    if (e.hitFlash > 0) e.hitFlash--;
  };

  const updateRoadhog = (e, dt) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    e.hookState = e.hookState || "normal";
    e.hookTimer = e.hookTimer || 0;

    switch (e.hookState) {
      case "normal": {
        if (!debugFlags?.pauseEnemyMovement && dist > 1) {
          const sf = e.slowed ? e.slowFactor || 0.5 : 1;
          const comfortDist = (e.skillRange || 300) * 0.6;
          if (dist > comfortDist) {
            e.x += (dx / dist) * e.speed * sf;
            e.y += (dy / dist) * e.speed * sf;
          } else if (dist < comfortDist * 0.5) {
            e.x -= (dx / dist) * e.speed * 0.5 * sf;
            e.y -= (dy / dist) * e.speed * 0.5 * sf;
          }
        }
        if (
          !debugFlags?.pauseEnemyAttack &&
          dist <= (e.skillRange || 300) &&
          dist > 1 &&
          e.skillTimer >= e.skillCooldown
        ) {
          const ndx = dx / dist;
          const ndy = dy / dist;
          projectiles.value.push({
            type: "enemyBullet",
            x: e.x,
            y: e.y,
            vx: ndx * ENEMY_PROJECTILE_SPEED,
            vy: ndy * ENEMY_PROJECTILE_SPEED,
            damage: ENEMY_PROJECTILE_DAMAGE,
            size: ENEMY_PROJECTILE_SIZE,
            owner: "enemy",
          });
          e.skillTimer = 0;
        }
        const hookCD = e.hookCooldown || 8000;
        const hookRange = e.hookRange || 350;
        if (
          !debugFlags?.pauseEnemyAttack &&
          e.hookTimer <= 0 &&
          dist <= hookRange &&
          !player.controlLocked
        ) {
          const windUp = e.hookWindUp || 0;
          if (windUp > 0) {
            e.hookState = "hookWinding";
            e.hookWindUpTimer = windUp;
            e.hookDirX = dist > 1 ? dx / dist : 0;
            e.hookDirY = dist > 1 ? dy / dist : 0;
          } else {
            e.hookState = "hookThrow";
            e.hookDirX = dist > 1 ? dx / dist : 0;
            e.hookDirY = dist > 1 ? dy / dist : 0;
            e.hookDistTraveled = 0;
            e.hookX = e.x;
            e.hookY = e.y;
            e.hookMaxDist = dist;
          }
        }
        e.hookTimer -= dt;
        updateDirection(e, dx, dy, dist, dt);
        break;
      }
      case "hookWinding": {
        e.hookWindUpTimer -= dt;
        updateDirection(e, dx, dy, dist, dt);
        if (e.hookWindUpTimer <= 0) {
          e.hookState = "hookThrow";
          e.hookDistTraveled = 0;
          e.hookX = e.x;
          e.hookY = e.y;
          e.hookMaxDist = dist;
        }
        break;
      }
      case "hookThrow": {
        const hookSpeed = e.hookSpeed || 10;
        e.hookX += e.hookDirX * hookSpeed;
        e.hookY += e.hookDirY * hookSpeed;
        e.hookDistTraveled += hookSpeed;

        const hdx = player.x - e.hookX;
        const hdy = player.y - e.hookY;
        const hdist = Math.sqrt(hdx * hdx + hdy * hdy);
        const hitRadius = e.hookHitRadius || 35;

        const isPlayerInvincible = player.skills.some(
          (s) => (s.id === "invincible" || s.id === "ultimateRay") && s.active,
        );
        const isDashInvincible = player._dashInvincibleTimer > 0;

        if (hdist < hitRadius && !isPlayerInvincible && !isDashInvincible) {
          e.hookState = "hookedRetract";
          player.controlLocked = true;
          log("被路霸钩锁勾中！");
        } else if (e.hookDistTraveled >= e.hookRange) {
          e.hookState = "hookMissRetract";
        }
        break;
      }
      case "hookedRetract": {
        const retractSpeed = e.hookRetractSpeed || 12;
        e.hookX -= e.hookDirX * retractSpeed;
        e.hookY -= e.hookDirY * retractSpeed;
        player.x = e.hookX;
        player.y = e.hookY;
        e.hookDistTraveled -= retractSpeed;

        const releaseDist = e.hookReleaseDist || 50;
        const rdx = player.x - e.x;
        const rdy = player.y - e.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);

        if (rdist <= releaseDist || e.hookDistTraveled <= 0) {
          player.controlLocked = false;
          e.hookState = "normal";
          e.hookTimer = e.hookCooldown || 8000;
          e.hookDirX = 0;
          e.hookDirY = 0;
          e.hookX = 0;
          e.hookY = 0;
          e.hookDistTraveled = 0;
          log("路霸释放钩锁");
        }
        break;
      }
      case "hookMissRetract": {
        const retractSpeed = e.hookRetractSpeed || 12;
        e.hookX -= e.hookDirX * retractSpeed;
        e.hookY -= e.hookDirY * retractSpeed;
        e.hookDistTraveled -= retractSpeed;

        if (e.hookDistTraveled <= 0) {
          e.hookState = "normal";
          e.hookTimer = e.hookCooldown || 8000;
          e.hookDirX = 0;
          e.hookDirY = 0;
          e.hookX = 0;
          e.hookY = 0;
          e.hookDistTraveled = 0;
        }
        break;
      }
    }
    if (e.hitFlash > 0) e.hitFlash--;
  };

  const updateThrower = (e, dt) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    e.throwState = e.throwState || "normal";
    e.throwTimer = e.throwTimer || 0;
    e.throwPrepTimer = e.throwPrepTimer || 0;

    switch (e.throwState) {
      case "normal": {
        if (!debugFlags?.pauseEnemyMovement && dist > 1) {
      const sf = e.slowed ? e.slowFactor || 0.5 : 1;
      e.x += (dx / dist) * e.speed * sf;
      e.y += (dy / dist) * e.speed * sf;
    }
    if (!debugFlags?.pauseEnemyAttack && e.hasMelee) {
      if (e.meleeCooldownTimer > 0) e.meleeCooldownTimer -= dt;
      if (dist <= e.attackRange && e.meleeCooldownTimer <= 0) {
        tryDamagePlayer(e.attack);
        e.meleeCooldownTimer = e.skillCooldown || 1000;
        log(`受到投掷者 ${e.attack} 点近战伤害`);
      }
    }
        e.throwTimer -= dt;
        const throwRange = e.throwRange || 400;
        if (
          !debugFlags?.pauseEnemyAttack &&
          e.throwTimer <= 0 &&
          dist <= throwRange &&
          dist > e.attackRange
        ) {
          const grabRadius = e.grabRadius || 80;
          const normalTypes = [
            "melee",
            "ranged",
            "hybrid",
            "bomber",
            "charger",
            "shielder",
            "summoner",
          ];
          const candidates = enemies.value.filter(
            (other) =>
              !other.dead &&
              !other.grabbedByThrower &&
              !other.throwFlying &&
              normalTypes.includes(other.type) &&
              Math.sqrt((other.x - e.x) ** 2 + (other.y - e.y) ** 2) <=
                grabRadius,
          );
          if (candidates.length > 0) {
            const targetA =
              candidates[Math.floor(Math.random() * candidates.length)];
            e.throwState = "grabPrep";
            e.throwPrepTimer = 0;
            e.throwTargetEid = targetA.eid;
            targetA.grabbedByThrower = e.eid;
            log("投掷者抓起敌人！");
          }
        }
        updateDirection(e, dx, dy, dist, dt);
        break;
      }
      case "grabPrep": {
        e.throwPrepTimer += dt;
        const targetA = enemies.value.find(
          (other) => other.eid === e.throwTargetEid,
        );
        if (!targetA || targetA.dead) {
          e.throwState = "normal";
          e.throwTimer = e.throwCooldown || 10000;
          e.throwTargetEid = null;
          log("投掷者抓取的目标被击杀，投掷进入冷却");
          break;
        }
        const prepDuration = e.grabPrepDuration || 400;
        if (e.throwPrepTimer >= prepDuration) {
          const throwSpeed = e.throwSpeed || 8;
          const tdx = player.x - e.x;
          const tdy = player.y - e.y;
          const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
          e.throwDirX = tdist > 1 ? tdx / tdist : 0;
          e.throwDirY = tdist > 1 ? tdy / tdist : 0;
          e.throwTargetX = player.x;
          e.throwTargetY = player.y;
          e.throwDistTraveled = 0;
          const throwStartOffset = e.size / 2 + 10;
          e.throwFlightDist = Math.max(tdist - throwStartOffset, 60);
          targetA.x = e.x + e.throwDirX * (e.size / 2 + 10);
          targetA.y = e.y + e.throwDirY * (e.size / 2 + 10);
          targetA.throwFlying = true;
          targetA.throwDirX = e.throwDirX;
          targetA.throwDirY = e.throwDirY;
          e.throwState = "throwFlying";
          log("投掷者扔出敌人！");
        }
        updateDirection(e, dx, dy, dist, dt);
        break;
      }
      case "throwFlying": {
        const targetA = enemies.value.find(
          (other) => other.eid === e.throwTargetEid,
        );
        if (!targetA || targetA.dead) {
          e.throwState = "normal";
          e.throwTimer = e.throwCooldown || 10000;
          e.throwTargetEid = null;
          log("飞行中的被投掷敌人被击杀");
          break;
        }
        const throwSpeed = e.throwSpeed || 8;
        targetA.x += e.throwDirX * throwSpeed;
        targetA.y += e.throwDirY * throwSpeed;
        e.throwDistTraveled += throwSpeed;

        if (e.throwDistTraveled >= e.throwFlightDist) {
          const hitRadius = e.hitRadius || 40;
          const pdx = player.x - targetA.x;
          const pdy = player.y - targetA.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

          const isPlayerInvincible = player.skills.some(
            (s) => (s.id === "invincible" || s.id === "ultimateRay") && s.active,
          );
          const isDashInvincible = player._dashInvincibleTimer > 0;

          if (pdist < hitRadius) {
            if (!isPlayerInvincible && !isDashInvincible) {
              const throwDamage = e.throwDamage || 15;
              tryDamagePlayer(throwDamage);
              log(`被投掷敌人砸中！受到 ${throwDamage} 点伤害`);
            } else {
              log("被投掷敌人砸中，但无敌免伤");
            }
            targetA.x = player.x;
            targetA.y = player.y + 20;
          } else {
            targetA.x = e.throwTargetX;
            targetA.y = e.throwTargetY;
          }
          targetA.throwFlying = false;
          targetA.grabbedByThrower = null;
          targetA.throwDirX = 0;
          targetA.throwDirY = 0;
          targetA.invincibleTimer = e.thrownLandInvincibleTime || 1500;
          e.throwState = "normal";
          e.throwTimer = e.throwCooldown || 10000;
          e.throwTargetEid = null;
        }
        break;
      }
    }
    if (e.hitFlash > 0) e.hitFlash--;
  };

  const updateHacker = (e, dt) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (e.revealTimer > 0) e.revealTimer -= dt;

    const warnRange = e.warnRange || 300;
    const attackRange = e.attackRange || 150;
    let baseOpacity;
    if (dist <= attackRange) baseOpacity = 1.0;
    else if (dist <= warnRange) baseOpacity = 0.35;
    else baseOpacity = 0.08;
    e.stealthOpacity = e.revealTimer > 0 ? 1.0 : baseOpacity;

    const isPlayerInvincible = player.skills.some(
      (s) => (s.id === "invincible" || s.id === "ultimateRay") && s.active,
    );
    const isDashInvincible = player._dashInvincibleTimer > 0;
    const canRayConnect =
      dist <= attackRange && !isPlayerInvincible && !isDashInvincible;

    if (canRayConnect) {
      const windUp = e.rayWindUp || 0;
      if (!e.rayWindUpPhase && windUp > 0) {
        e.rayWindUpPhase = true;
        e.rayWindUpTimer = windUp;
        e.rayActive = false;
      }
      if (e.rayWindUpPhase) {
        e.rayWindUpTimer -= dt;
        if (e.rayWindUpTimer <= 0) {
          e.rayWindUpPhase = false;
          e.rayActive = true;
          player.hacked = true;
        }
      }
      if (!e.rayWindUpPhase) {
        e.rayActive = true;
        e.rayTargetX = player.x;
        e.rayTargetY = player.y;
        player.hacked = true;

        e.rayDamageTimer = (e.rayDamageTimer || 0) + dt;
        const rayInterval = e.rayInterval || 1000;
        if (e.rayDamageTimer >= rayInterval) {
          e.rayDamageTimer = 0;
          const rayDamage = e.rayDamage || 3;
          tryDamagePlayer(rayDamage);
          log(`骇客射线伤害 ${rayDamage}`);
        }
      }
    } else {
      e.rayWindUpPhase = false;
      e.rayActive = false;
      const anyHackerConnected = enemies.value.some(
        (other) =>
          other.type === "eliteHacker" && !other.dead && other.rayActive,
      );
      if (!anyHackerConnected) player.hacked = false;
    }

    e.stealthCooldownTimer = (e.stealthCooldownTimer || 0) + dt;
    const stealthCooldown = e.stealthCooldown || 12000;
    if (e.stealthCooldownTimer >= stealthCooldown) {
      e.stealthCooldownTimer = 0;
      const candidates = enemies.value.filter(
        (other) =>
          !other.dead &&
          !other.isBoss &&
          !other.stealthLevel &&
          other.type !== "eliteHacker",
      );
      const elites = candidates.filter((other) =>
        other.type.startsWith("elite"),
      );
      const normals = candidates.filter(
        (other) => !other.type.startsWith("elite"),
      );
      const pool = elites.length > 0 ? elites : normals;
      if (pool.length > 0) {
        const target = pool[Math.floor(Math.random() * pool.length)];
        target.stealthLevel = 0.35;
        target.stealthDurationTimer = e.stealthDuration || 8000;
        target.stealthSourceEid = e.eid;
        log("骇客隐身赋能一名敌人");
      }
    }

    if (!debugFlags?.pauseEnemyMovement && dist > attackRange) {
      const sf = e.slowed ? e.slowFactor || 0.5 : 1;
      e.x += (dx / dist) * e.speed * sf;
      e.y += (dy / dist) * e.speed * sf;
    }
    updateDirection(e, dx, dy, dist, dt);
    if (e.hitFlash > 0) e.hitFlash--;
  };

  const updateWind = (e, dt) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    e.windBaseSpeed = e.windBaseSpeed || e.speed;
    e.windSpeedMultiplier = e.windSpeedMultiplier || 1;
    e.windAccelTimer = e.windAccelTimer || 0;

    e.windAccelTimer += dt;
    if (e.windAccelTimer >= 1000) {
      e.windAccelTimer = 0;
      e.windSpeedMultiplier = Math.min(
        e.maxSpeedMultiplier || 2.5,
        e.windSpeedMultiplier + (e.accelIncrement || 0.05),
      );
    }

    const currentSpeed = e.windBaseSpeed * e.windSpeedMultiplier;
    const sf = e.slowed ? e.slowFactor || 0.5 : 1;

    if (!debugFlags?.pauseEnemyMovement && dist > e.attackRange) {
      e.x += (dx / dist) * currentSpeed * sf;
      e.y += (dy / dist) * currentSpeed * sf;
    }

    if (!debugFlags?.pauseEnemyAttack && e.hasMelee) {
      if (e.meleeCooldownTimer > 0) e.meleeCooldownTimer -= dt;
      if (dist <= e.attackRange && e.meleeCooldownTimer <= 0) {
        tryDamagePlayer(e.attack);
        e.meleeCooldownTimer = e.skillCooldown || 800;
        e.windSpeedMultiplier = 1;
        e.windAccelTimer = 0;
        log(`疾风武士 ${e.attack} 点近战伤害`);
      }
    }

    if (e.hitFlash > 0) {
      e.hitFlash--;
      if (e.hitFlash === 0) {
        e.windSpeedMultiplier = Math.max(
          1,
          e.windSpeedMultiplier * (e.hitSpeedDecay || 0.7),
        );
      }
    }

    updateDirection(e, dx, dy, dist, dt);
  };

  const updateBloodSamurai = (e, dt) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    e.shurikenTimer = (e.shurikenTimer || 0) + dt;
    if (
      !debugFlags?.pauseEnemyAttack &&
      e.shurikenTimer >= (e.shurikenCooldown || 8000)
    ) {
      e.shurikenTimer = 0;
      if (dist > 1) {
        const ndx = dx / dist;
        const ndy = dy / dist;
        projectiles.value.push({
          type: "shuriken",
          x: e.x,
          y: e.y,
          vx: ndx * (e.shurikenSpeed || 4.5),
          vy: ndy * (e.shurikenSpeed || 4.5),
          damage: e.shurikenDamage || 12,
          size: e.shurikenSize || 15,
          owner: "enemy",
          confusionDuration: e.shurikenConfusionDuration || 3000,
        });
      }
    }

    if (!debugFlags?.pauseEnemyMovement && dist > 1) {
      const sf = e.slowed ? e.slowFactor || 0.5 : 1;
      e.x += (dx / dist) * e.speed * sf;
      e.y += (dy / dist) * e.speed * sf;
    }

    if (!debugFlags?.pauseEnemyAttack && e.hasMelee) {
      if (e.meleeCooldownTimer > 0) e.meleeCooldownTimer -= dt;
      if (dist <= e.attackRange && e.meleeCooldownTimer <= 0) {
        const hit = tryDamagePlayer(e.attack);
        if (hit) {
          player.confusionTimer = e.meleeConfusionDuration || 1500;
        }
        e.meleeCooldownTimer = e.skillCooldown || 800;
        log(`血牛武士 ${e.attack} 点近战伤害`);
      }
    }

    updateDirection(e, dx, dy, dist, dt);
    if (e.hitFlash > 0) e.hitFlash--;
  };

  const updateGeneric = (e, dt) => {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    e.isMoving = true;

    if (dist > 1) {
      if (Math.abs(dx) > Math.abs(dy)) {
        e.direction = dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
      } else {
        e.direction = DIRECTION.FRONT;
      }
      e.frameTimer += dt;
      if (e.frameTimer >= FRAME_INTERVAL) {
        e.frameTimer -= FRAME_INTERVAL;
        e.frame = (e.frame + 1) % FRAME_COUNT;
      }
    }

    if (
      !debugFlags?.pauseEnemyAttack &&
      e.hasRanged &&
      e.skillRange > 0 &&
      dist <= e.skillRange &&
      e.skillTimer >= e.skillCooldown
    ) {
      const ndx = dx / dist;
      const ndy = dy / dist;
      let dmg = e.attack;
      if (e.damageFluctuation) {
        const f = 1 - e.damageFluctuation + Math.random() * 2 * e.damageFluctuation;
        dmg = Math.round(dmg * f);
      }
      projectiles.value.push({
        type: "enemyBullet",
        x: e.x,
        y: e.y,
        vx: ndx * ENEMY_PROJECTILE_SPEED,
        vy: ndy * ENEMY_PROJECTILE_SPEED,
        damage: dmg,
        size: ENEMY_PROJECTILE_SIZE,
        owner: "enemy",
      });
      e.skillTimer = 0;
    }

    if (!debugFlags?.pauseEnemyAttack && e.hasMelee) {
      if (e.meleeCooldownTimer > 0) {
        e.meleeCooldownTimer -= dt;
      }
      if (dist <= e.attackRange && e.meleeCooldownTimer <= 0) {
        tryDamagePlayer(e.attack);
        e.meleeCooldownTimer = e.skillCooldown;
        log(`受到 ${e.type} 敌人 ${e.attack} 点近战伤害`);
      }
    }

    if (!debugFlags?.pauseEnemyMovement) {
      const sf = e.slowed ? e.slowFactor || 0.5 : 1;
      const shouldChase =
        e.hasMelee ||
        (e.hasRanged && dist > e.skillRange) ||
        (!e.hasMelee && !e.hasRanged);
      if (shouldChase && dist > 1) {
        e.x += (dx / dist) * e.speed * sf;
        e.y += (dy / dist) * e.speed * sf;
      }
    }

    if (e.hitFlash > 0) e.hitFlash--;
  };

  const updateGroundZones = (dt) => {
    const aliveZones = [];
    groundZones.value.forEach((z) => {
      z.elapsed += dt;
      if (z.elapsed < z.duration) {
        aliveZones.push(z);
      }
    });
    groundZones.value = aliveZones;

    groundZones.value.forEach((z) => {
      const d = Math.sqrt((player.x - z.x) ** 2 + (player.y - z.y) ** 2);
      if (d <= z.radius) {
        if (gameState.gameTime - (z.lastTickTime || 0) >= (z.tickInterval || 1000)) {
          tryDamagePlayer(z.damagePerTick || 2);
          z.lastTickTime = gameState.gameTime;
        }
      }
    });
  };

  const updateEnemies = (dt) => {
    updateGroundZones(dt);

    enemies.value.forEach((e) => {
      if (e.dead) return;

      if (e.invincibleTimer > 0) {
        e.invincibleTimer -= dt;
        if (e.invincibleTimer <= 0) {
          e.invincibleTimer = 0;
        }
      }

      if (e.throwFlying) {
        if (e.hitFlash > 0) e.hitFlash--;
        if (e.frozen) {
          e.frozenTimer -= dt;
          if (e.frozenTimer <= 0) {
            e.frozen = false;
            e.throwFlying = false;
            e.grabbedByThrower = null;
            const thrower = enemies.value.find(
              (t) =>
                t.type === "eliteThrower" &&
                !t.dead &&
                t.throwTargetEid === e.eid,
            );
            if (thrower) {
              thrower.throwState = "normal";
              thrower.throwTimer = thrower.throwCooldown || 10000;
            }
            log("被投掷敌人飞行中解冻落地");
          }
        }
        return;
      }

      if (e.grabbedByThrower && !e.throwFlying) {
        if (e.hitFlash > 0) e.hitFlash--;
        return;
      }

      if (e.stealthLevel && e.stealthDurationTimer > 0) {
        e.stealthDurationTimer -= dt;
        if (e.stealthDurationTimer <= 0) {
          e.stealthLevel = 0;
          e.stealthDurationTimer = 0;
          e.stealthSourceEid = null;
        }
      }

      if (e.frozen) {
        e.frozenTimer -= dt;
        if (e.frozenTimer <= 0) {
          e.frozen = false;
        }
        return;
      }

      e.skillTimer += dt;

      switch (e.type) {
        case "bomber":
          updateBomber(e, dt);
          break;
        case "summoner":
          updateSummoner(e, dt);
          break;
        case "charger":
          updateCharger(e, dt);
          break;
        case "shielder":
          updateShielder(e, dt);
          break;
        case "elitePriest":
          updatePriest(e, dt);
          break;
        case "eliteVenom":
          updateVenom(e, dt);
          break;
        case "eliteRoadhog":
          updateRoadhog(e, dt);
          break;
        case "eliteThrower":
          updateThrower(e, dt);
          break;
        case "eliteHacker":
          updateHacker(e, dt);
          break;
        case "eliteWind":
          updateWind(e, dt);
          break;
        case "eliteBlood":
          updateBloodSamurai(e, dt);
          break;
        default:
          updateGeneric(e, dt);
          break;
      }
    });
  };

  return { updateEnemies, tryDamagePlayer };
}
