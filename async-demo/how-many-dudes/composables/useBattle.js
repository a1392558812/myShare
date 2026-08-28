import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRID_COLS,
  CELL_SIZE,
  PLAYER_ZONE_COLS,
  UNIT_RADIUS,
  getEnemyDef,
  RELIC_MAP,
  logMult15,
} from '../constants.js';

/**
 * 乘算递减：N 层同效果叠加时，每层作用于"剩余部分"而非基数。
 * 1 层 = base；N 层 → 1-(1-base)^N，永远 < 100%，不会溢出。
 * 用于概率/减伤/反弹/吸血等百分比效果，防后期数值爆炸。
 * @param {number} base - 单层效果值（0~1）
 * @param {number} n - 层数
 * @returns {number} 叠加后的总效果值（0~1）
 */
const diminish = (base, n) => (n <= 0 ? 0 : 1 - Math.pow(1 - base, n));

/**
 * 创建敌人实例
 * @param {Object} def - 敌人定义
 * @param {number} instanceId
 * @param {number} x
 * @param {number} y
 * @returns {Object} 敌人实例
 */
const createEnemyInstance = (def, instanceId, x, y) => ({
  instanceId,
  defId: def.id,
  name: def.name,
  icon: def.icon,
  maxHp: def.maxHp,
  hp: def.maxHp,
  attack: def.attack,
  attackRange: def.attackRange,
  attackSpeed: def.attackSpeed,
  moveSpeed: def.moveSpeed,
  attackType: def.attackType,
  aoeRadius: def.aoeRadius || 0,
  projectileSpeed: def.projectileSpeed || 0,
  slamRange: def.slamRange || 0,
  slamDamage: def.slamDamage || 0,
  slamCooldown: def.slamCooldown || 0,
  summonCooldown: def.summonCooldown || 0,
  summonCount: def.summonCount || 0,
  summonId: def.summonId || 'kid',
  deathExplosion: def.deathExplosion || null,
  healAmount: def.healAmount || 0,
  healTargetCount: def.healTargetCount || 0,
  size: def.size,
  color: def.color,
  reward: def.reward,
  alive: true,
  x,
  y,
  target: null,
  lastAttackTime: 0,
  lastSlamTime: 0,
  lastSummonTime: 0,
  moving: false,
  side: 'enemy',
});

/**
 * 根据回合配置生成敌人列表
 * @param {Object} roundData - 回合配置 { enemies: [{ id, count }], ... }
 * @param {number} statMult - 属性倍率（无尽模式递增）
 * @param {{v: number}} [idCounterRef] - 共享实例 id 计数器（与召唤物共用，保证全局唯一）
 * @returns {Array} 敌人实例数组
 */
const spawnEnemies = (roundData, statMult = 1, idCounterRef = null) => {
  if (!roundData) return [];

  const enemies = [];
  let idCounter = 0;
  const enemyZoneStart = (GRID_COLS - PLAYER_ZONE_COLS) * CELL_SIZE;

  roundData.enemies.forEach(({ id, count }) => {
    const def = getEnemyDef(id);
    for (let i = 0; i < count; i++) {
      const x = enemyZoneStart + 20 + Math.random() * (CANVAS_WIDTH - enemyZoneStart - 40);
      const y = 20 + Math.random() * (CANVAS_HEIGHT - 40);
      const enemy = createEnemyInstance(def, idCounterRef ? ++idCounterRef.v : ++idCounter, x, y);
      if (statMult > 1) {
        enemy.maxHp = Math.round(enemy.maxHp * statMult);
        enemy.hp = enemy.maxHp;
        enemy.attack = Math.round(enemy.attack * statMult);
      }
      enemies.push(enemy);
    }
  });

  return enemies;
};

/**
 * 初始化己方单位位置（左半场）
 * @param {Array} bros - 兄弟实例数组
 */
const positionBros = (bros) => {
  const aliveBros = bros.filter((b) => b.alive);
  const n = aliveBros.length;
  if (n === 0) return;

  const zoneW = PLAYER_ZONE_COLS * CELL_SIZE;
  const zoneH = CANVAS_HEIGHT;
  const margin = 20;

  const cols = Math.min(Math.ceil(Math.sqrt(n * (zoneW / zoneH))), PLAYER_ZONE_COLS * 3);
  const rows = Math.ceil(n / cols);
  const gapX = (zoneW - margin * 2) / Math.max(cols - 1, 1);
  const gapY = (zoneH - margin * 2) / Math.max(rows - 1, 1);

  aliveBros.forEach((bro, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    bro.x = margin + col * gapX;
    bro.y = margin + row * gapY;
    bro.side = 'player';
  });
};

/**
 * 计算两点间距离
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * 计算两点间平方距离
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
const distSq = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

/**
 * 寻找最近的敌方单位
 * @param {Object} unit - 当前单位
 * @param {Array} enemies - 敌方列表
 * @returns {Object|null}
 */
const findNearestEnemy = (unit, enemies) => {
  let nearest = null;
  let minDist = Infinity;
  for (const e of enemies) {
    if (!e.alive) continue;
    const d = distSq(unit, e);
    if (d < minDist) {
      minDist = d;
      nearest = e;
    }
  }
  return nearest;
};

/**
 * 寻找最需要治疗的 N 个友方单位（按血量比例升序，限制在治疗范围内）
 * @param {Object} unit - 治疗者
 * @param {Array} allies - 友方列表
 * @param {number} count - 最多返回几个
 * @param {number} maxDist - 治疗范围（像素）
 * @returns {Array} 需要治疗的友方数组
 */
const findWeakestAllies = (unit, allies, count, maxDist = Infinity) => {
  const rangeSq = maxDist * maxDist;
  return allies
    .filter((a) => a.alive && a !== unit && a.hp < a.maxHp && distSq(unit, a) <= rangeSq)
    .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)
    .slice(0, count);
};

/**
 * 向目标移动
 * @param {Object} unit - 当前单位
 * @param {Object} target - 目标
 * @param {number} stopRange - 停止距离
 * @param {number} speedScale - 帧率缩放（dt×60，60fps 时为 1）
 */
const moveToward = (unit, target, stopRange, speedScale = 1) => {
  const dx = target.x - unit.x;
  const dy = target.y - unit.y;
  const d = Math.hypot(dx, dy);
  if (d <= stopRange) return;
  const speed = unit.moveSpeed * speedScale;
  unit.x += (dx / d) * speed;
  unit.y += (dy / d) * speed;
  const r = unit.size || UNIT_RADIUS;
  unit.x = Math.max(r, Math.min(CANVAS_WIDTH - r, unit.x));
  unit.y = Math.max(r, Math.min(CANVAS_HEIGHT - r, unit.y));
  unit.moving = true;
};

/**
 * 检查单位是否在护盾范围内（骑士技能）
 * @param {Object} unit
 * @param {Array} allies
 * @returns {number} 减伤比例 0-1
 */
const getShieldReduction = (unit, allies) => {
  let reduction = 0;
  for (const a of allies) {
    if (!a.alive || a === unit) continue;
    if (a.shieldAuraRange > 0 && distSq(unit, a) <= a.shieldAuraRange * a.shieldAuraRange) {
      reduction = Math.max(reduction, a.shieldReduction);
    }
  }
  return reduction;
};

/**
 * 创建投射物
 * @param {Object} from - 发射者
 * @param {Object} to - 目标
 * @param {number} speed
 * @param {number} damage
 * @param {string} type - 攻击类型
 * @param {number} aoeRadius
 * @returns {Object} 投射物
 */
const createProjectile = (from, to, speed, damage, type, aoeRadius = 0) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d = Math.hypot(dx, dy) || 1;
  return {
    x: from.x,
    y: from.y,
    vx: (dx / d) * speed,
    vy: (dy / d) * speed,
    damage,
    type,
    aoeRadius,
    targetId: to.instanceId,
    side: from.side,
    sourceUnit: from,
    alive: true,
    maxDistance: 400,
    traveled: 0,
    speed,
    pierceLeft: 0,
  };
};

/**
 * 战斗系统
 * @param {Array} bros - 兄弟阵容
 * @param {Object} enemyConfig - 敌人配置
 * @param {Array} relics - 遗物列表
 * @param {Array} synergies - 激活羁绊
 * @param {number} statMult - 敌人属性倍率（无尽模式）
 * @returns {Object} 战斗控制器
 */
export const useBattle = (bros, enemyConfig, relics, synergies, statMult = 1) => {
  positionBros(bros);

  bros.forEach((b) => {
    b.healCount = 0;
    b.hasRevived = false;
    b.blessEndTime = 0;
    b.lastChargeTime = 0;
    b.relicReviveCount = 0;
    b.killStackBonus = 0;
  });

  const projectiles = [];
  const effects = [];

  let battleOver = false;
  let playerWon = false;
  let frameCount = 0;
  let lastTime = 0;
  const enemyStatMult = statMult;

  // 帧率无关的计时器（单位：秒）
  let regTimer = 1;      // 生命之泉回复间隔
  let priestTimer = 0.5; // 牧师复活检测间隔
  // 敌方实例 id 全局计数器（spawn + 召唤共用，避免 Date.now() 撞 id）
  const enemyIdCounterRef = { v: 0 };
  const enemies = spawnEnemies(enemyConfig, statMult, enemyIdCounterRef);

  const relicEffects = {};
  relics.forEach((r) => {
    const def = RELIC_MAP[r.id];
    if (!def) return;
    const e = def.effect;
    const stacks = r.count;

    switch (e.type) {
      // 线性叠加：攻击/生命/移速/范围/固定攻击/回血/穿透/击杀叠层
      case 'attackMult':
      case 'maxHpMult':
      case 'moveSpeedMult':
      case 'attackRangeMult':
      case 'flatAttack':
      case 'regen':
      case 'pierce':
      case 'killStack':
        if (!relicEffects[e.type]) {
          relicEffects[e.type] = { value: e.value * stacks };
        } else {
          relicEffects[e.type].value += e.value * stacks;
        }
        break;

      // 乘算递减叠加：概率/减伤/反弹/吸血，每层作用于剩余部分，永不溢出
      case 'lifesteal':
      case 'damageReduction':
      case 'dodge':
      case 'thorns':
      case 'doubleAttackChance': {
        const value = diminish(e.value, stacks);
        if (!relicEffects[e.type]) {
          relicEffects[e.type] = { value };
        } else {
          relicEffects[e.type].value = diminish(e.value, stacks);
        }
        break;
      }

      case 'crit': {
        const chance = diminish(e.chance, stacks);
        if (!relicEffects.crit) {
          relicEffects.crit = { chance, multiplier: e.multiplier };
        } else {
          relicEffects.crit.chance = chance;
        }
        break;
      }

      case 'splash': {
        const splashMult = logMult15(stacks);
        if (!relicEffects.splash) {
          relicEffects.splash = { radius: e.radius * splashMult, ratio: e.ratio * splashMult };
        } else {
          relicEffects.splash.radius += e.radius * splashMult;
          relicEffects.splash.ratio += e.ratio * splashMult;
        }
        break;
      }

      case 'burn':
        if (!relicEffects.burn) {
          relicEffects.burn = { duration: e.duration, ratio: e.ratio * stacks };
        } else {
          relicEffects.burn.ratio += e.ratio * stacks;
        }
        break;

      case 'executioner':
        if (!relicEffects.executioner) {
          relicEffects.executioner = { threshold: e.threshold, bonus: e.bonus * stacks };
        } else {
          relicEffects.executioner.bonus += e.bonus * stacks;
        }
        break;

      case 'enrage':
        if (!relicEffects.enrage) {
          relicEffects.enrage = { threshold: e.threshold, multiplier: 1 + (e.multiplier - 1) * stacks };
        } else {
          relicEffects.enrage.multiplier += (e.multiplier - 1) * stacks;
        }
        break;

      case 'revive':
        if (!relicEffects.revive) {
          relicEffects.revive = { value: e.value, count: stacks };
        } else {
          relicEffects.revive.count += stacks;
        }
        break;

      case 'extraGold':
        break;

      default:
        if (!relicEffects[e.type]) {
          relicEffects[e.type] = { ...e };
        }
    }
  });

  const hasDeathHeal = synergies.some((s) => s.bonus.type === 'deathHeal');

  /**
   * 计算单位实际攻击力（含遗物加成）
   * @param {Object} unit
   * @returns {number}
   */
  const calcAttack = (unit) => {
    let atk = unit.attack + (unit.killStackBonus || 0);
    if (unit.blessEndTime && Date.now() < unit.blessEndTime) {
      atk *= 1 + unit.blessMult;
    }
    if (unit.enrageThreshold > 0 && unit.hp / unit.maxHp <= unit.enrageThreshold) {
      atk *= unit.enrageMult;
    }
    // 遗物仅对玩家阵营生效，避免敌方共享暴击/狂暴加成
    if (unit.side === 'player' && relicEffects.crit && Math.random() < relicEffects.crit.chance) {
      atk *= relicEffects.crit.multiplier;
    }
    if (unit.side === 'player' && relicEffects.enrage && unit.hp / unit.maxHp <= relicEffects.enrage.threshold) {
      atk *= relicEffects.enrage.multiplier;
    }
    return Math.round(atk);
  };

  /**
   * 统一死亡结算：击杀叠层 / 丧尸自爆 / 自爆兵爆炸 / 死亡治疗光环 / 死亡特效
   * 所有死亡路径（普攻、燃烧、荆棘反杀、爆炸波及）都必须走这里，保证结算一致
   * @param {Object} unit - 死亡单位
   */
  const killUnit = (unit) => {
    if (!unit.alive) return;
    unit.hp = 0;
    unit.alive = false;

    if (relicEffects.killStack && unit.side === 'enemy') {
      const bonus = relicEffects.killStack.value;
      bros.forEach((b) => {
        if (b.alive) b.killStackBonus = (b.killStackBonus || 0) + bonus;
      });
      effects.push({ type: 'killStack', x: unit.x, y: unit.y, life: 25, maxLife: 25 });
    }

    // 丧尸兄弟死亡自爆（炸敌人）
    if (unit.explodeDamage > 0) {
      const explodeTargets = (unit.side === 'player' ? enemies : bros).filter(
        (e) => e.alive && dist(unit, e) <= unit.explodeRadius
      );
      explodeTargets.forEach((t) => {
        t.hp -= unit.explodeDamage;
        if (t.hp <= 0) killUnit(t);
      });
      effects.push({ type: 'explosion', x: unit.x, y: unit.y, life: 25, maxLife: 25, radius: unit.explodeRadius });
    }

    // 敌方自爆兵死亡爆炸（炸兄弟）
    if (unit.deathExplosion && unit.side === 'enemy') {
      const explodeTargets = bros.filter(
        (b) => b.alive && dist(unit, b) <= unit.deathExplosion.radius
      );
      explodeTargets.forEach((t) => takeDamage(t, unit.deathExplosion.damage, bros, unit));
      effects.push({ type: 'explosion', x: unit.x, y: unit.y, life: 25, maxLife: 25, radius: unit.deathExplosion.radius });
    }

    // 不死契约：友方死亡回复周围队友
    if (hasDeathHeal && unit.side === 'player') {
      const healTargets = bros.filter(
        (b) => b.alive && b !== unit && dist(unit, b) <= 80
      );
      healTargets.forEach((t) => {
        t.hp = Math.min(t.maxHp, t.hp + Math.round(t.maxHp * 0.2));
      });
      effects.push({ type: 'healAura', x: unit.x, y: unit.y, life: 30, maxLife: 30, radius: 80 });
    }

    effects.push({ type: 'death', x: unit.x, y: unit.y, life: 20, maxLife: 20, icon: unit.icon });
  };

  /**
   * 单位受到伤害
   * @param {Object} unit - 受伤单位
   * @param {number} damage - 伤害值
   * @param {Array} allies - 友方列表（用于护盾计算）
   * @param {Object} attacker - 攻击者（用于吸血）
   */
  const takeDamage = (unit, damage, allies, attacker) => {
    if (!unit.alive) return;

    if (relicEffects.dodge && unit.side === 'player' && Math.random() < relicEffects.dodge.value) {
      effects.push({ type: 'dodge', x: unit.x, y: unit.y, life: 15, maxLife: 15 });
      return;
    }

    const reduction = getShieldReduction(unit, allies);
    let actualDamage = Math.round(damage * (1 - reduction));

    if (relicEffects.damageReduction && unit.side === 'player') {
      actualDamage = Math.max(1, Math.round(actualDamage * (1 - relicEffects.damageReduction.value)));
    }

    if (actualDamage <= 0) return;
    unit.hp -= actualDamage;

    if (relicEffects.thorns && unit.side === 'player' && attacker && attacker.alive && attacker.side !== unit.side) {
      const reflectDamage = Math.max(1, Math.round(actualDamage * relicEffects.thorns.value));
      attacker.hp -= reflectDamage;
      effects.push({ type: 'thorns', x: attacker.x, y: attacker.y, life: 15, maxLife: 15 });
      if (attacker.hp <= 0) killUnit(attacker);
    }

    if (relicEffects.burn && attacker && attacker.side === 'player' && unit.side === 'enemy') {
      const burnDmg = Math.max(1, Math.round((attacker.attack + (attacker.killStackBonus || 0)) * relicEffects.burn.ratio / relicEffects.burn.duration));
      unit.burnDuration = relicEffects.burn.duration;
      unit.burnDamage = burnDmg;
    }

    if (attacker && attacker.alive && attacker.side === 'player' && relicEffects.lifesteal) {
      const heal = Math.round(actualDamage * relicEffects.lifesteal.value);
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
    }

    if (unit.hp <= 0) {
      if (relicEffects.revive && (unit.relicReviveCount || 0) < relicEffects.revive.count && unit.side === 'player') {
        unit.relicReviveCount = (unit.relicReviveCount || 0) + 1;
        unit.hp = Math.round(unit.maxHp * relicEffects.revive.value);
        unit.burnDuration = 0; // 复活时清掉燃烧，防止下帧立即再死
        effects.push({ type: 'revive', x: unit.x, y: unit.y, life: 30, maxLife: 30 });
        return;
      }

      killUnit(unit);
    }
  };

  /**
   * 执行攻击
   * @param {Object} unit - 攻击方
   * @param {Object} target - 目标
   * @param {Array} allies - 攻击方友军
   * @param {Array} foes - 敌方
   * @param {number} timestamp - 当前时间
   */
  const performAttack = (unit, target, allies, foes, timestamp) => {
    if (!target || !target.alive) return;

    let damage = calcAttack(unit);

    // 遗物仅对玩家阵营生效，避免敌方共享斩首/连击/溅射/穿透
    if (unit.side === 'player' && relicEffects.executioner && target.hp / target.maxHp <= relicEffects.executioner.threshold) {
      damage = Math.round(damage * (1 + relicEffects.executioner.bonus));
    }

    switch (unit.attackType) {
      case 'melee': {
        takeDamage(target, damage, foes, unit);
        if (unit.side === 'player' && relicEffects.doubleAttackChance && Math.random() < relicEffects.doubleAttackChance.value) {
          takeDamage(target, damage, foes, unit);
        }
        if (unit.side === 'player' && relicEffects.splash) {
          const splashTargets = foes.filter(
            (f) => f.alive && f !== target && dist(target, f) <= relicEffects.splash.radius
          );
          splashTargets.forEach((t) => {
            takeDamage(t, Math.round(damage * relicEffects.splash.ratio), foes, unit);
          });
        }
        effects.push({ type: 'hit', x: target.x, y: target.y, life: 10, maxLife: 10 });
        break;
      }
      case 'ranged': {
        if (unit.executeChance > 0 && target.hp / target.maxHp <= unit.executeThreshold) {
          if (Math.random() < unit.executeChance) {
            takeDamage(target, target.hp, foes, unit);
            effects.push({ type: 'execute', x: target.x, y: target.y, life: 25, maxLife: 25 });
            break;
          }
        }
        const proj = createProjectile(
          unit,
          target,
          unit.projectileSpeed,
          damage,
          'ranged',
          0
        );
        if (unit.innatePierce > 0) {
          proj.pierceLeft = Math.max(proj.pierceLeft, unit.innatePierce);
        }
        if (unit.side === 'player' && relicEffects.pierce) {
          proj.pierceLeft = Math.max(proj.pierceLeft, relicEffects.pierce.value);
        }
        projectiles.push(proj);
        break;
      }
      case 'aoe': {
        const proj = createProjectile(
          unit,
          target,
          unit.projectileSpeed,
          damage,
          'aoe',
          unit.aoeRadius
        );
        projectiles.push(proj);
        break;
      }
      case 'heal': {
        const healCount = unit.healTargetCount || 1;
        // 治疗范围 = 攻击范围，避免全图治疗
        const healTargets = findWeakestAllies(unit, allies, healCount, unit.attackRange || 120);
        if (healTargets.length > 0) {
          unit.healCount = (unit.healCount || 0) + 1;
          const triggerBless = unit.blessInterval > 0 && unit.healCount % unit.blessInterval === 0;
          healTargets.forEach((t) => {
            t.hp = Math.min(t.maxHp, t.hp + unit.healAmount);
            effects.push({ type: 'heal', x: t.x, y: t.y, life: 20, maxLife: 20 });
            if (triggerBless) {
              t.blessMult = unit.blessMult;
              t.blessEndTime = Date.now() + unit.blessDuration;
              effects.push({ type: 'blessing', x: t.x, y: t.y, life: 30, maxLife: 30 });
            }
          });
          if (triggerBless) {
            effects.push({ type: 'blessing', x: unit.x, y: unit.y, life: 25, maxLife: 25 });
          }
        } else {
          const smiteRadius = unit.smiteRadius || 0;
          if (smiteRadius > 0) {
            const smiteDamage = Math.round(unit.healAmount * (unit.smiteMult || 0.6));
            const smiteTargets = foes.filter((f) => f.alive && dist(unit, f) <= smiteRadius);
            if (smiteTargets.length > 0) {
              smiteTargets.forEach((f) => takeDamage(f, smiteDamage, foes, unit));
              effects.push({ type: 'holySmite', x: unit.x, y: unit.y, life: 20, maxLife: 20, radius: smiteRadius });
            } else if (target) {
              takeDamage(target, damage, foes, unit);
            }
          } else if (target) {
            takeDamage(target, damage, foes, unit);
          }
        }
        break;
      }
    }

    if (unit.lassoRange > 0 && timestamp - unit.lastLassoTime > unit.lassoCooldown) {
      const rescueTarget = allies.find(
        (a) => a.alive && a !== unit && a.hp / a.maxHp < 0.3
      );
      if (rescueTarget) {
        unit.lastLassoTime = timestamp;
        const dx = unit.x - rescueTarget.x;
        const dy = unit.y - rescueTarget.y;
        const d = Math.hypot(dx, dy) || 1;
        rescueTarget.x = unit.x - (dx / d) * 40;
        rescueTarget.y = unit.y - (dy / d) * 40;
        effects.push({ type: 'lasso', x1: unit.x, y1: unit.y, x2: rescueTarget.x, y2: rescueTarget.y, life: 15, maxLife: 15 });
      }
    }
  };

  /**
   * 更新投射物
   * @param {Array} allUnits - 所有单位
   * @param {number} speedScale - 帧率缩放
   */
  const updateProjectiles = (allUnits, speedScale = 1) => {
    // 预分阵营存活单位，每个投射物只遍历对应阵营（O(P×N) → O(N+P×K)）
    const aliveEnemies = [];
    const aliveBros = [];
    for (const u of allUnits) {
      if (!u.alive) continue;
      if (u.side === 'player') aliveBros.push(u);
      else aliveEnemies.push(u);
    }

    for (const proj of projectiles) {
      if (!proj.alive) continue;
      proj.x += proj.vx * speedScale;
      proj.y += proj.vy * speedScale;
      proj.traveled += proj.speed * speedScale;

      if (proj.traveled > proj.maxDistance) {
        proj.alive = false;
        continue;
      }

      // 投射物攻击相反阵营
      const targets = proj.side === 'player' ? aliveEnemies : aliveBros;
      const projHitIds = proj.hitIds || [];
      for (const t of targets) {
        if (projHitIds.includes(t.instanceId)) continue;
        const hitRadius = t.size || UNIT_RADIUS;
        if (dist(proj, t) <= hitRadius) {
          if (proj.type === 'aoe' && proj.aoeRadius > 0) {
            const foes = proj.side === 'player' ? aliveEnemies : aliveBros;
            const aoeTargets = [];
            for (const u of foes) {
              if (dist(proj, u) <= proj.aoeRadius) aoeTargets.push(u);
            }
            aoeTargets.forEach((t2) => takeDamage(t2, proj.damage, foes, proj.sourceUnit));
            effects.push({ type: 'aoeHit', x: proj.x, y: proj.y, life: 20, maxLife: 20, radius: proj.aoeRadius });
            proj.alive = false;
          } else {
            const foes = proj.side === 'player' ? aliveEnemies : aliveBros;
            takeDamage(t, proj.damage, foes, proj.sourceUnit);
            effects.push({ type: 'hit', x: t.x, y: t.y, life: 10, maxLife: 10 });
            if (proj.pierceLeft > 0) {
              proj.pierceLeft--;
              proj.hitIds = proj.hitIds || [];
              proj.hitIds.push(t.instanceId);
              continue;
            }
            proj.alive = false;
          }
          break;
        }
      }
    }
    for (let i = projectiles.length - 1; i >= 0; i--) {
      if (!projectiles[i].alive) projectiles.splice(i, 1);
    }
  };

  const updateEffects = (speedScale = 1) => {
    // 原地压缩清理，避免大量特效时逐项 splice 的 O(N²) 开销
    let write = 0;
    for (let i = 0; i < effects.length; i++) {
      const e = effects[i];
      e.life -= speedScale;
      if (e.life > 0) {
        effects[write++] = e;
      }
    }
    effects.length = write;
  };

  /**
   * Boss 技能：猛击
   * @param {Object} boss - Boss 单位
   * @param {Array} targets - 可选目标
   * @param {number} timestamp
   */
  const updateBossSkills = (boss, targets, timestamp) => {
    if (!boss.alive) return;

    if (boss.slamRange > 0 && timestamp - boss.lastSlamTime > boss.slamCooldown) {
      const inRange = targets.filter((t) => t.alive && dist(boss, t) <= boss.slamRange);
      if (inRange.length > 0) {
        boss.lastSlamTime = timestamp;
        inRange.forEach((t) => takeDamage(t, boss.slamDamage, targets, boss));
        effects.push({ type: 'slam', x: boss.x, y: boss.y, life: 20, maxLife: 20, radius: boss.slamRange });
      }
    }

    if (boss.summonCount > 0 && timestamp - boss.lastSummonTime > boss.summonCooldown) {
      boss.lastSummonTime = timestamp;
      const def = getEnemyDef(boss.summonId || 'kid');
      for (let i = 0; i < boss.summonCount; i++) {
        const angle = (Math.PI * 2 * i) / boss.summonCount;
        const sx = boss.x + Math.cos(angle) * 50;
        const sy = boss.y + Math.sin(angle) * 50;
        const minion = createEnemyInstance(def, ++enemyIdCounterRef.v, sx, sy);
        if (enemyStatMult > 1) {
          minion.maxHp = Math.round(minion.maxHp * enemyStatMult);
          minion.hp = minion.maxHp;
          minion.attack = Math.round(minion.attack * enemyStatMult);
        }
        enemies.push(minion);
      }
      effects.push({ type: 'summon', x: boss.x, y: boss.y, life: 25, maxLife: 25 });
    }
  };

  /**
   * 执行一帧战斗逻辑
   * @param {number} timestamp - 时间戳 ms
   * @returns {boolean} 战斗是否结束
   */
  const tick = (timestamp) => {
    if (battleOver) return true;

    // 帧率无关：dt 为上一帧到本帧的秒数，speedScale = dt×60（60fps 时=1，数值语义不变）
    if (lastTime === 0) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    dt = Math.min(dt, 0.1); // 防止切后台回来大跳帧
    const speedScale = dt * 60;

    frameCount++;
    const allUnits = [...bros, ...enemies];
    const playerAlive = bros.filter((b) => b.alive);
    const enemyAlive = enemies.filter((e) => e.alive);

    allUnits.forEach((u) => { u.moving = false; });

    if (relicEffects.regen) {
      regTimer -= dt;
      if (regTimer <= 0) {
        regTimer = 1;
        bros.forEach((b) => {
          if (b.alive) {
            b.hp = Math.min(b.maxHp, b.hp + Math.round(b.maxHp * relicEffects.regen.value));
          }
        });
      }
    }

    if (relicEffects.burn) {
      allUnits.forEach((u) => {
        if (u.alive && u.burnDuration > 0) {
          u.hp -= (u.burnDamage || 0) * speedScale;
          u.burnDuration -= speedScale;
          u.burnFxTimer = (u.burnFxTimer || 0) - dt;
          if (u.burnFxTimer <= 0) {
            u.burnFxTimer = 0.5;
            effects.push({ type: 'burn', x: u.x, y: u.y, life: 15, maxLife: 15 });
          }
          if (u.hp <= 0) {
            // 燃烧死亡同样允许复活甲触发，避免绕过 takeDamage 的复活判定
            if (relicEffects.revive && u.side === 'player' && (u.relicReviveCount || 0) < relicEffects.revive.count) {
              u.relicReviveCount = (u.relicReviveCount || 0) + 1;
              u.hp = Math.round(u.maxHp * relicEffects.revive.value);
              u.burnDuration = 0;
              effects.push({ type: 'revive', x: u.x, y: u.y, life: 30, maxLife: 30 });
            } else {
              killUnit(u);
            }
          }
        }
      });
    }

    // 同帧同灭按玩家胜利处理（已把敌人清完的瞬间）
    if (playerAlive.length === 0 && enemyAlive.length === 0) {
      battleOver = true;
      playerWon = true;
      return true;
    }
    if (playerAlive.length === 0) {
      battleOver = true;
      playerWon = false;
      return true;
    }
    if (enemyAlive.length === 0) {
      battleOver = true;
      playerWon = true;
      return true;
    }

    priestTimer -= dt;
    if (priestTimer <= 0) {
      priestTimer = 0.5;
      for (const priest of bros) {
        if (!priest.alive || priest.hasRevived || !priest.reviveHpRatio) continue;
        const deadAllies = bros.filter((b) => !b.alive);
        if (deadAllies.length === 0) continue;
        deadAllies.sort((a, b) => b.maxHp - a.maxHp);
        const revived = deadAllies[0];
        priest.hasRevived = true;
        revived.alive = true;
        revived.hp = Math.round(revived.maxHp * priest.reviveHpRatio);
        revived.revived = true;
        revived.x = priest.x + (Math.random() - 0.5) * 30;
        revived.y = priest.y + (Math.random() - 0.5) * 30;
        effects.push({ type: 'resurrect', x: revived.x, y: revived.y, life: 40, maxLife: 40 });
        break;
      }
    }

    for (const bro of bros) {
      if (!bro.alive) continue;

      const target = findNearestEnemy(bro, enemies);
      if (!target) continue;

      const d = dist(bro, target);
      const isRanged = bro.attackType === 'ranged' || bro.attackType === 'aoe' || bro.attackType === 'heal';
      const stopRange = isRanged ? bro.attackRange : bro.attackRange;

      if (bro.chargeCooldown > 0 && timestamp - (bro.lastChargeTime || 0) >= bro.chargeCooldown) {
        let farthestEnemy = null;
        let maxDist = 0;
        for (const e of enemies) {
          if (!e.alive) continue;
          const ed = dist(bro, e);
          if (ed > maxDist && ed <= bro.chargeRange) {
            maxDist = ed;
            farthestEnemy = e;
          }
        }
        if (farthestEnemy) {
          bro.lastChargeTime = timestamp;
          const cdx = bro.x - farthestEnemy.x;
          const cdy = bro.y - farthestEnemy.y;
          const cd = Math.hypot(cdx, cdy) || 1;
          bro.x = farthestEnemy.x + (cdx / cd) * 20;
          bro.y = farthestEnemy.y + (cdy / cd) * 20;
          const splashTargets = enemies.filter((e) => e.alive && dist(bro, e) <= bro.chargeSplashRadius);
          splashTargets.forEach((e) => takeDamage(e, bro.chargeDamage, enemies, bro));
          effects.push({ type: 'charge', x: bro.x, y: bro.y, life: 20, maxLife: 20, radius: bro.chargeSplashRadius });
        }
      }

      if (d > stopRange) {
        moveToward(bro, target, stopRange, speedScale);
      }

      let effectiveAttackSpeed = bro.attackSpeed;
      if (bro.speedAuraRange === 0) {
        for (const ally of bros) {
          if (ally.alive && ally !== bro && ally.speedAuraRange > 0 &&
              distSq(bro, ally) <= ally.speedAuraRange * ally.speedAuraRange) {
            effectiveAttackSpeed = bro.attackSpeed * (1 - ally.speedAuraMult);
            break;
          }
        }
      }

      if (d <= stopRange && timestamp - bro.lastAttackTime >= effectiveAttackSpeed) {
        bro.lastAttackTime = timestamp;
        performAttack(bro, target, bros, enemies, timestamp);
      }
    }

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const target = findNearestEnemy(enemy, bros);
      if (!target) continue;

      const d = dist(enemy, target);
      const isRanged = enemy.attackType === 'ranged' || enemy.attackType === 'aoe' || enemy.attackType === 'heal';
      const stopRange = isRanged ? enemy.attackRange : enemy.attackRange;

      if (d > stopRange) {
        moveToward(enemy, target, stopRange, speedScale);
      }

      if (d <= stopRange && timestamp - enemy.lastAttackTime >= enemy.attackSpeed) {
        enemy.lastAttackTime = timestamp;
        performAttack(enemy, target, enemies, bros, timestamp);
      }

      if (enemy.slamRange > 0 || enemy.summonCount > 0) {
        updateBossSkills(enemy, bros, timestamp);
      }
    }

    updateProjectiles(allUnits, speedScale);

    updateEffects(speedScale);

    // 定期清理死亡敌人，防止召唤物堆积导致数组无限膨胀
    if (frameCount % 60 === 0) {
      for (let i = enemies.length - 1; i >= 0; i--) {
        if (!enemies[i].alive) enemies.splice(i, 1);
      }
    }

    return false;
  };

  /**
   * 获取当前战斗状态快照（供渲染器使用）
   * @returns {Object}
   */
  const getSnapshot = () => ({
    bros,
    enemies,
    projectiles,
    effects,
    frameCount,
    battleOver,
    playerWon,
  });

  return {
    tick,
    getSnapshot,
    get enemies() { return enemies; },
    get battleOver() { return battleOver; },
    get playerWon() { return playerWon; },
  };
};
