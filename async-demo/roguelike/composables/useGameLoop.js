import {
  ENTITY_SIZE,
  calcSkillValueLinear,
  calcSkillValue,
} from "../constants.js";
import { useDebug } from "./useDebug.js";

export function useGameLoop(
  player,
  gameState,
  enemies,
  projectiles,
  effects,
  lootDrops,
  magicCircles,
  traps,
  gameCanvas,
  camera,
  updaters,
  mapUtils,
  options,
  groundZones,
  eventUtils = null,
) {
  const {
    updatePlayer,
    updateEnemies,
    handleSpawning,
    cleanupDead,
    damageEnemy,
  } = updaters;
  const { updateCamera } = mapUtils;
  const { onRender, tickBossSpawn, updateBoss, getDtMultiplier } =
    options || {};
  const { debugFlags } = useDebug();
  const groundZonesRef = groundZones;

  let deathZoneSlow = 0;

  let animFrameId = null;
  let lastTimestamp = 0;

  const updateProjectiles = (dt) => {
    projectiles.value.forEach((p) => {
      if (p.type === "autoSeek" && p.targetEnemy && !p.targetEnemy.dead) {
        const tdx = p.targetEnemy.x - p.x;
        const tdy = p.targetEnemy.y - p.y;
        const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
        if (tdist > 1) {
          p.vx += (tdx / tdist) * (p.turnStrength || 0.5);
          p.vy += (tdy / tdist) * (p.turnStrength || 0.5);
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > p.seekSpeed) {
            p.vx = (p.vx / speed) * p.seekSpeed;
            p.vy = (p.vy / speed) * p.seekSpeed;
          }
        }
      }

      if (p.isTracking) {
        const tdx = player.x - p.x;
        const tdy = player.y - p.y;
        const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
        if (tdist > 1) {
          const strength = p.trackStrength || 0.3;
          p.vx += (tdx / tdist) * strength;
          p.vy += (tdy / tdist) * strength;
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          const maxSpd = p.maxSpeed || 5;
          if (speed > maxSpd) {
            p.vx = (p.vx / speed) * maxSpd;
            p.vy = (p.vy / speed) * maxSpd;
          }
        }
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.type === "venomBolt") {
        p.flightTime = (p.flightTime || 0) + dt;
        let shouldLand = false;
        if (p.flightTime >= (p.maxFlightTime || 2000)) {
          shouldLand = true;
        }
        if (
          !shouldLand &&
          checkCollisionLocal(p.x, p.y, p.size, player.x, player.y, ENTITY_SIZE)
        ) {
          shouldLand = true;
        }

        if (shouldLand) {
          effects.value.push({
            type: "venomWarn",
            x: p.x,
            y: p.y,
            radius: p.zoneRadius || 50,
            duration: p.warnDuration || 800,
            elapsed: 0,
            zoneDuration: p.zoneDuration,
            zoneDamage: p.zoneDamage,
            zoneRadius: p.zoneRadius,
            ownerEid: p.ownerEid,
            venomMaxZones: p.venomMaxZones,
          });
          p.hit = true;
        }
      } else {
        if (p.owner === "player") {
          enemies.value.forEach((e) => {
            if (e.dead) return;
            if (p.penetratedEnemies && p.penetratedEnemies.includes(e.eid))
              return;
            if (checkCollisionLocal(p.x, p.y, p.size, e.x, e.y, e.size)) {
              damageEnemy(e, p.damage);
              if (p.type === "arrow") {
                const vampireSkill = player.skills.find(
                  (s) => s.id === "vampireAura",
                );
                if (vampireSkill) {
                  player.hp = Math.min(player.maxHp, player.hp + 1);
                }
                const mcSkill = player.skills.find(
                  (s) => s.id === "magicCircle",
                );
                if (mcSkill) {
                  player._arrowFireballHitX = e.x;
                  player._arrowFireballHitY = e.y;
                }
                const freezeSkill = player.skills.find(
                  (s) => s.id === "freeze",
                );
                if (freezeSkill) {
                  player._arrowFreezeHitX = e.x;
                  player._arrowFreezeHitY = e.y;
                }
              }
              if (p.type === "autoSeek") {
                const freezeSkill2 = player.skills.find(
                  (s) => s.id === "freeze",
                );
                if (freezeSkill2) {
                  player._barrageFreezeHitX = e.x;
                  player._barrageFreezeHitY = e.y;
                }
              }
              if (p.penetration !== undefined) {
                if (!p.penetratedEnemies) p.penetratedEnemies = [];
                p.penetratedEnemies.push(e.eid);
                p.penetration -= 1;
                if (p.penetration < 0) p.hit = true;
              } else {
                p.hit = true;
              }
            }
          });
        } else if (p.owner === "enemy") {
              if (
                checkCollisionLocal(
                  p.x,
                  p.y,
                  p.size,
                  player.x,
                  player.y,
                  ENTITY_SIZE,
                )
              ) {
                if (eventUtils?.tryDamagePlayer) {
                  eventUtils.tryDamagePlayer(p.damage);
                } else {
                  const isSkillInvincible = player.skills.some(
                    (s) => (s.id === "invincible" || s.id === "ultimateRay") && s.active,
                  );
                  if (!debugFlags.godMode && !isSkillInvincible) {
                    player.hp -= p.damage;
                    if (player.hp <= 0) {
                      player.hp = 0;
                      gameState.isDead = true;
                    }
                  }
                }
                if (p.type === "shuriken" && p.confusionDuration) {
                  player.confusionTimer = p.confusionDuration;
                }
                p.hit = true;
              }
            }
      }

      const maxDist = p.maxDistance || 800;
      const maxDistSq = maxDist * maxDist;
      const pdx = p.x - player.x;
      const pdy = p.y - player.y;
      if (pdx * pdx + pdy * pdy > maxDistSq) {
        p.hit = true;
      }
      if (p.type === "fireBarrage") {
        p.traveled = (p.traveled || 0) + Math.sqrt(p.vx ** 2 + p.vy ** 2);
        if (p.traveled >= (p.range || 600)) {
          p.hit = true;
        }
      }
    });

    projectiles.value = projectiles.value.filter((p) => !p.hit);
  };

  const checkCollisionLocal = (x1, y1, s1, x2, y2, s2) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distSq = dx * dx + dy * dy;
    const hitRadius = ((s1 + s2) / 2) * 0.8;
    return distSq < hitRadius * hitRadius;
  };

  const updateEffects = (dt) => {
    effects.value.forEach((e) => {
      e.elapsed += dt;
    });

    effects.value.forEach((e) => {
      if (
        e.type === "firePillarWarn" &&
        !e._damageTriggered &&
        e.elapsed >= e.duration - 50
      ) {
        e._damageTriggered = true;
        if (e.playerRef) {
          const pdist = Math.sqrt(
            (e.playerRef.x - e.x) ** 2 + (e.playerRef.y - e.y) ** 2,
          );
          if (pdist <= e.radius + ENTITY_SIZE / 2) {
            if (eventUtils?.tryDamagePlayer) {
              eventUtils.tryDamagePlayer(e.damage || 30);
            }
          }
        }
      }
    });

    let firePillarSlow = 1
    effects.value.forEach((e) => {
      if (e.type === "firePillarWarn") {
        const pdist = Math.sqrt(
          (e.playerRef.x - e.x) ** 2 + (e.playerRef.y - e.y) ** 2,
        )
        if (pdist <= e.radius + ENTITY_SIZE / 2) {
          firePillarSlow = Math.min(firePillarSlow, e.warnSlow ?? 0.5)
        }
      }
    })
    player._firePillarSlowMultiplier = firePillarSlow

    effects.value.forEach((e) => {
      if (e.type === "shadowWave" && e.playerRef) {
        const currentRadius =
          e.radius + (e.elapsed / e.duration) * (e.maxRadius - e.radius);
        const pdist = Math.sqrt(
          (e.playerRef.x - e.x) ** 2 + (e.playerRef.y - e.y) ** 2,
        );
        const hitBand = e.hitBand || 12;
        if (
          !e._lastDamageId ||
          e._lastDamageId !== Math.floor((currentRadius - e.radius) / hitBand)
        ) {
          e._lastDamageId = Math.floor((currentRadius - e.radius) / hitBand);
          if (
            Math.abs(pdist - currentRadius) < hitBand &&
          e.elapsed < e.duration * (e.damageDurationRatio || 0.9)
        ) {
            if (eventUtils?.tryDamagePlayer) {
              eventUtils.tryDamagePlayer(e.damage || 10);
            }
          }
        }
      }
    });

    if (groundZonesRef) {
      effects.value.forEach((e) => {
        if (e.type === "venomWarn" && e.elapsed >= e.duration) {
          const zone = {
            x: e.x,
            y: e.y,
            radius: e.zoneRadius || 50,
            duration: e.zoneDuration || 5000,
            elapsed: 0,
            damagePerTick: e.zoneDamage || 2,
            tickInterval: e.venomZoneTickInterval || 1000,
            lastTickTime: 0,
            ownerEid: e.ownerEid,
          };
          groundZonesRef.value.push(zone);

          const maxZ = e.venomMaxZones || 3;
          const myZones = groundZonesRef.value.filter(
            (z) => z.ownerEid === e.ownerEid,
          );
          if (myZones.length > maxZ) {
            const oldestIdx = groundZonesRef.value.indexOf(myZones[0]);
            if (oldestIdx !== -1) {
              groundZonesRef.value.splice(oldestIdx, 1);
            }
          }
        }
      });
    }

    effects.value = effects.value.filter((e) => e.elapsed < e.duration);
  };

  const updateSkillCooldowns = (dt) => {
    player.skills.forEach((sk) => {
      if (sk.remainingCooldown > 0) {
        sk.remainingCooldown = Math.max(0, sk.remainingCooldown - dt);
      }
    });
  };

  const updateLoot = () => {
    const now = gameState.gameTime;
    lootDrops.value = lootDrops.value.filter(
      (d) => now - d.spawnedAt < d.lifetime,
    );
  };

  const updateMagicCircles = (dt) => {
    for (let i = magicCircles.value.length - 1; i >= 0; i--) {
      const circle = magicCircles.value[i];
      circle.elapsed += dt;

      if (circle.followsPlayer) {
        circle.x = player.x;
        circle.y = player.y;
      }

      if (circle.elapsed >= circle.duration) {
        magicCircles.value.splice(i, 1);
        continue;
      }

      enemies.value.forEach((e) => {
        if (e.dead) return;
        const dx = e.x - circle.x;
        const dy = e.y - circle.y;
        const range = circle.radius + e.size / 2;
        const inRange = dx * dx + dy * dy <= range * range;

        if (inRange) {
          e.slowed = true;
          e.slowTimer = circle.slowTimer || 500;
          e.slowFactor = circle.slowFactor || 0.5;
        } else if (e.slowed) {
          e.slowTimer -= dt;
          if (e.slowTimer <= 0) {
            e.slowed = false;
            e.slowTimer = 0;
            e.slowFactor = 1;
          }
        }
      });

      circle.burnTickTimer += dt;
      if (circle.burnTickTimer >= circle.burnTickInterval) {
        circle.burnTickTimer -= circle.burnTickInterval;
        enemies.value.forEach((e) => {
          if (e.dead) return;
          const dx = e.x - circle.x;
          const dy = e.y - circle.y;
          const range = circle.radius + e.size / 2;
          if (dx * dx + dy * dy <= range * range) {
            damageEnemy(e, circle.burnDamage);
          }
        });
      }

      circle.fireballTimer += dt;
      if (circle.fireballTimer >= circle.fireballInterval) {
        circle.fireballTimer -= circle.fireballInterval;
        for (let j = 0; j < circle.fireballCount; j++) {
          const angleR = Math.random() * Math.PI * 2;
          const distR = Math.random() * circle.radius;
          const fx = circle.x + Math.cos(angleR) * distR;
          const fy = circle.y + Math.sin(angleR) * distR;

          const fireR = circle.fireballRadius || 25;
          enemies.value.forEach((e) => {
            if (e.dead) return;
            const dx = e.x - fx;
            const dy = e.y - fy;
            const range = fireR + e.size / 2;
            if (dx * dx + dy * dy <= range * range) {
              damageEnemy(e, circle.fireballDamage);
            }
          });

          effects.value.push({
            type: "magicFireball",
            x: fx,
            y: fy,
            radius: fireR,
            duration: 600,
            elapsed: 0,
          });
        }
      }
    }
  };

  const updateArrowFireball = (dt) => {
    const mcSkill = player.skills.find((s) => s.id === "magicCircle");
    const arrowSkill = player.skills.find((s) => s.id === "arrow");
    if (!mcSkill) return;
    if (player._arrowFireballHitX == null) return;

    player._arrowFireballTimer =
      (player._arrowFireballTimer || (arrowSkill ? arrowSkill.fireballCooldown : 1500)) - dt;

    if (player._arrowFireballTimer <= 0) {
      const fireR = mcSkill.fireballRadius || 25;
      const dmg =
        calcSkillValueLinear(
          mcSkill.damage,
          mcSkill.growth?.damage,
          mcSkill.currentLevel,
        ) + (player.baseAttack || 0);
      const { _arrowFireballHitX: fx, _arrowFireballHitY: fy } = player;

      enemies.value.forEach((e) => {
        if (e.dead) return;
        const edx = e.x - fx;
        const edy = e.y - fy;
        const range = fireR + e.size / 2;
        if (edx * edx + edy * edy <= range * range) {
          damageEnemy(e, dmg);
        }
      });

      effects.value.push({
        type: "magicFireball",
        x: fx,
        y: fy,
        radius: fireR,
        duration: 600,
        elapsed: 0,
      });

      player._arrowFireballTimer = arrowSkill ? arrowSkill.fireballCooldown : 1500;
      player._arrowFireballHitX = null;
      player._arrowFireballHitY = null;
    }
  };

  /** 冰冻联动：箭矢命中后冷却制小范围冰冻 */
  const updateArrowFreeze = (dt) => {
    const freezeSkill = player.skills.find((s) => s.id === "freeze");
    const arrowSkill = player.skills.find((s) => s.id === "arrow");
    if (!freezeSkill) return;
    if (player._arrowFreezeHitX == null) return;

    player._arrowFreezeTimer =
      (player._arrowFreezeTimer || (arrowSkill ? arrowSkill.freezeCooldown : 2000)) - dt;

    if (player._arrowFreezeTimer <= 0) {
      const freezeDmg = calcSkillValue(
        freezeSkill.damage,
        freezeSkill.growth?.damage,
        freezeSkill.currentLevel,
      );
      const freezeDur = calcSkillValue(
        freezeSkill.duration,
        freezeSkill.growth?.duration,
        freezeSkill.currentLevel,
      );
      const { _arrowFreezeHitX: fx, _arrowFreezeHitY: fy } = player;

      enemies.value.forEach((e) => {
        if (e.dead) return;
        const edx = e.x - fx;
        const edy = e.y - fy;
        const range = (arrowSkill ? arrowSkill.freezeRange : 35) + e.size / 2;
        if (edx * edx + edy * edy <= range * range) {
          damageEnemy(e, freezeDmg);
          e.frozen = true;
          e.frozenTimer = freezeDur;
        }
      });

      effects.value.push({
        type: "freezeCircle",
        x: fx,
        y: fy,
        radius: arrowSkill ? arrowSkill.freezeRange : 35,
        duration: 500,
        elapsed: 0,
      });

      player._arrowFreezeTimer = arrowSkill ? arrowSkill.freezeCooldown : 2000;
      player._arrowFreezeHitX = null;
      player._arrowFreezeHitY = null;
    }
  };

  /** 冰冻联动：弹幕命中后冷却制小范围冰冻 */
  const updateBarrageFreeze = (dt) => {
    const freezeSkill = player.skills.find((s) => s.id === "freeze");
    const arrowSkill = player.skills.find((s) => s.id === "arrow");
    if (!freezeSkill) return;
    if (player._barrageFreezeHitX == null) return;

    player._barrageFreezeTimer =
      (player._barrageFreezeTimer || (freezeSkill ? freezeSkill.barrageFreezeCooldown : 3000)) - dt;

    if (player._barrageFreezeTimer <= 0) {
      const freezeDmg = calcSkillValue(
        freezeSkill.damage,
        freezeSkill.growth?.damage,
        freezeSkill.currentLevel,
      );
      const freezeDur = calcSkillValue(
        freezeSkill.duration,
        freezeSkill.growth?.duration,
        freezeSkill.currentLevel,
      );
      const { _barrageFreezeHitX: fx, _barrageFreezeHitY: fy } = player;

      enemies.value.forEach((e) => {
        if (e.dead) return;
        const edx = e.x - fx;
        const edy = e.y - fy;
        const range = (arrowSkill ? arrowSkill.freezeRange : 35) + e.size / 2;
        if (edx * edx + edy * edy <= range * range) {
          damageEnemy(e, freezeDmg);
          e.frozen = true;
          e.frozenTimer = freezeDur;
        }
      });

      effects.value.push({
        type: "freezeCircle",
        x: fx,
        y: fy,
        radius: arrowSkill ? arrowSkill.freezeRange : 35,
        duration: 500,
        elapsed: 0,
      });

      player._barrageFreezeTimer = freezeSkill ? freezeSkill.barrageFreezeCooldown : 3000;
      player._barrageFreezeHitX = null;
      player._barrageFreezeHitY = null;
    }
  };

  /** 终极射线：激光线 + 激光阵伤害判定 */
  const updateUltimateRay = (dt) => {
    const ultimateRaySkill = player.skills.find((s) => s.id === "ultimateRay");
    if (!ultimateRaySkill || !ultimateRaySkill.active) return;

    ultimateRaySkill.ultimateRayTimer -= dt;
    ultimateRaySkill.ultimateRayTickTimer += dt;

    if (ultimateRaySkill.ultimateRayTimer <= 0) {
      ultimateRaySkill.active = false;
      ultimateRaySkill.ultimateRayTimer = 0;
      return;
    }

    const tickInterval = ultimateRaySkill.ultimateRayCurrentTickInterval || ultimateRaySkill.tickInterval || 300;
    if (ultimateRaySkill.ultimateRayTickTimer < tickInterval) return;
    ultimateRaySkill.ultimateRayTickTimer -= tickInterval;

    const dmg = ultimateRaySkill.ultimateRayDamage || 15;
    const lifesteal = ultimateRaySkill.ultimateRayLifesteal || 0.5;
    const rayWidth = (ultimateRaySkill.rayWidth || 2) / 2;
    const arrayRadius = ultimateRaySkill.arrayRadius;
    const targetX = ultimateRaySkill.ultimateRayTargetX;
    const targetY = ultimateRaySkill.ultimateRayTargetY;

    let totalDamageDealt = 0;

    enemies.value.forEach((e) => {
      if (e.dead) return;

      const tdx = e.x - targetX;
      const tdy = e.y - targetY;
      const tdistSq = tdx * tdx + tdy * tdy;
      const arrayHitRadius = arrayRadius * 0.5 + e.size / 2;
      if (tdistSq <= arrayHitRadius * arrayHitRadius) {
        damageEnemy(e, dmg);
        totalDamageDealt += dmg;
        return;
      }

      const px = player.x;
      const py = player.y;
      const lineDx = targetX - px;
      const lineDy = targetY - py;
      const lineLenSq = lineDx * lineDx + lineDy * lineDy;

      if (lineLenSq === 0) return;

      let t = ((e.x - px) * lineDx + (e.y - py) * lineDy) / lineLenSq;
      t = Math.max(0, Math.min(1, t));

      const nearestX = px + t * lineDx;
      const nearestY = py + t * lineDy;

      const ndx = e.x - nearestX;
      const ndy = e.y - nearestY;
      const ndistSq = ndx * ndx + ndy * ndy;
      const rayHitRadius = rayWidth * 2 + e.size / 2;

      if (ndistSq <= rayHitRadius * rayHitRadius) {
        damageEnemy(e, dmg);
        totalDamageDealt += dmg;
      }
    });

    if (totalDamageDealt > 0 && lifesteal > 0) {
      const healAmount = Math.floor(totalDamageDealt * lifesteal);
      player.hp = Math.min(player.maxHp, player.hp + healAmount);
    }
  };

  /** 陷阱系统：冰冻泡泡碰撞检测 */
  const updateTraps = (dt) => {
    const freezeSkill = player.skills.find((s) => s.id === "freeze");

    for (let i = traps.value.length - 1; i >= 0; i--) {
      const trap = traps.value[i];
      trap.elapsed += dt;

      if (trap.elapsed >= trap.lifetime) {
        traps.value.splice(i, 1);
        continue;
      }

      if (trap.type === "iceBubble" && !trap.triggered) {
        let triggered = false;
        enemies.value.forEach((e) => {
          if (e.dead) return;
          const dx = e.x - trap.x;
          const dy = e.y - trap.y;
          const range = trap.radius + e.size / 2;
          if (dx * dx + dy * dy <= range * range) {
            triggered = true;
            if (freezeSkill) {
              const freezeDmg = calcSkillValue(
                freezeSkill.damage,
                freezeSkill.growth?.damage,
                freezeSkill.currentLevel,
              );
              const freezeDur = calcSkillValue(
                freezeSkill.duration,
                freezeSkill.growth?.duration,
                freezeSkill.currentLevel,
              );
              damageEnemy(e, freezeDmg);
              e.frozen = true;
              e.frozenTimer = freezeDur;
            }
          }
        });

        if (triggered) {
          trap.triggered = true;
          effects.value.push({
            type: "freezeCircle",
            x: trap.x,
            y: trap.y,
            radius: trap.radius,
            duration: 500,
            elapsed: 0,
          });
          traps.value.splice(i, 1);
        }
      }
    }
  };

  const gameLoop = (timestamp) => {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt =
      (timestamp - lastTimestamp) * (getDtMultiplier ? getDtMultiplier() : 1);
    lastTimestamp = timestamp;

    if (
      !gameState.isDead &&
      !gameState.levelUpPending &&
      !gameState.stelePending &&
      !gameState.paused
    ) {
      gameState.gameTime += dt;
      updatePlayer(dt);
      updateCamera(player.x, player.y);

      if (tickBossSpawn) tickBossSpawn(dt);
      if (updateBoss) updateBoss(dt);

      updateEnemies(dt);
      updateProjectiles(dt);
      updateEffects(dt);
      updateSkillCooldowns(dt);
      handleSpawning(dt);
      cleanupDead();
      updateLoot();
      updateMagicCircles(dt);
      updateArrowFireball(dt);
      updateArrowFreeze(dt);
      updateBarrageFreeze(dt);
      updateTraps(dt);
      updateUltimateRay(dt);

      if (eventUtils) {
        if (eventUtils.tickBuffs) eventUtils.tickBuffs(dt);
        if (eventUtils.tickEvents) eventUtils.tickEvents(dt);
        if (eventUtils.tickDeathZones) {
          const zoneResult = eventUtils.tickDeathZones(dt);
          deathZoneSlow = zoneResult?.inZoneSlow || 0;
        }
      }
    }

    if (onRender) onRender();

    animFrameId = requestAnimationFrame(gameLoop);
  };

  const startLoop = () => {
    lastTimestamp = 0;
    animFrameId = requestAnimationFrame(gameLoop);
  };

  const stopLoop = () => {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  };

  return {
    startLoop,
    stopLoop,
    updateProjectiles,
    updateEffects,
    updateSkillCooldowns,
    getDeathZoneSlow: () => deathZoneSlow,
  };
}
