import { ref } from 'vue';
import {
  CONFIG,
  WORLD,
  SPAWN,
  EXIT,
  INNER_WALLS,
  KRILL,
  MONSTERS,
  PICKUPS,
  BARNACLES,
} from '../constants.js';

const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

/** 点到线段最近点 */
const closestOnSegment = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return { x: x1 + dx * t, y: y1 + dy * t };
};

const distToSegment = (px, py, x1, y1, x2, y2) => {
  const c = closestOnSegment(px, py, x1, y1, x2, y2);
  return dist(px, py, c.x, c.y);
};

/** 点到所有内部墙的最近距离 */
const distToWall = (px, py) => {
  let minD = Infinity;
  for (const w of INNER_WALLS) {
    const d = distToSegment(px, py, w.x1, w.y1, w.x2, w.y2);
    if (d < minD) minD = d;
  }
  return minD;
};

/**
 * 游戏状态机
 * @returns {Object} 游戏状态与方法
 */
export const useGame = () => {
  const status = ref('playing'); // playing | won | lost | endless
  const collected = ref(0);
  const endless = ref(false); // 通关后进入无尽模式
  // 死亡原因：monster / puffer / barnacle
  const deathReason = ref('');
  // 调试开关：无敌 / 全图可见
  const debug = ref({ invincible: false, seeAll: false });

  // 熟练度（无尽模式吃道具积分）+ DNA 强化等级
  const proficiency = ref(0);
  const dna = ref({ courage: 0, skin: 0, sonar: 0, muscle: 0 });

  const effMaxEnergy = () => CONFIG.maxEnergy + CONFIG.dna.sonarMax * dna.value.sonar;
  const effRegen = () => CONFIG.energyRegen + CONFIG.dna.sonarRegen * dna.value.sonar;
  const effInvincible = () => CONFIG.invincibleMs + CONFIG.dna.skinInvincible * dna.value.skin;
  const effFearBase = () => CONFIG.fearBaseMs * (1 + CONFIG.dna.courageFear * dna.value.courage);
  const effDashCd = () => Math.max(400, CONFIG.dashCooldown - CONFIG.dna.muscleDashCd * dna.value.muscle);
  const effDashDur = () => CONFIG.dashDuration + CONFIG.dna.muscleDashDur * dna.value.muscle;

  // 单系加点成本（随等级递增），仅无尽模式可加
  const dnaCost = (attr) => CONFIG.dna.costBase + dna.value[attr] * CONFIG.dna.costStep;
  const dnaCanUpgrade = (attr) =>
    endless.value && dna.value[attr] < CONFIG.dna.maxLevel && proficiency.value >= dnaCost(attr);
  const upgradeDNA = (attr) => {
    if (!dnaCanUpgrade(attr)) return false;
    proficiency.value -= dnaCost(attr);
    dna.value[attr]++;
    // 声呐提升能量上限：立即补齐差额能量
    if (attr === 'sonar') player.energy = Math.min(effMaxEnergy(), player.energy + CONFIG.dna.sonarMax);
    return true;
  };


  // 外框墙（默认可见，引导边界）+ 内部墙（默认未显形）
  const border = [
    { x1: 0, y1: 0, x2: WORLD.width, y2: 0 },
    { x1: 0, y1: WORLD.height, x2: WORLD.width, y2: WORLD.height },
    { x1: 0, y1: 0, x2: 0, y2: WORLD.height },
    { x1: WORLD.width, y1: 0, x2: WORLD.width, y2: WORLD.height },
  ].map((w) => ({ ...w, revealed: true, revealTime: 0 }));

  const innerWalls = INNER_WALLS.map((w) => ({
    ...w,
    revealed: false,
    revealTime: -Infinity,
  }));

  const allWalls = [...border, ...innerWalls];

  // 内部墙切分成小段，用于局部显形 + 向两侧渐变模糊
  const innerSegs = [];
  const buildWallSegs = () => {
    innerSegs.length = 0;
    for (const w of INNER_WALLS) {
      const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1) || 1;
      const n = Math.max(1, Math.ceil(len / CONFIG.wallSegLen));
      const dx = w.x2 - w.x1;
      const dy = w.y2 - w.y1;
      for (let i = 0; i < n; i++) {
        const t1 = i / n;
        const t2 = (i + 1) / n;
        innerSegs.push({
          x1: w.x1 + dx * t1,
          y1: w.y1 + dy * t1,
          x2: w.x1 + dx * t2,
          y2: w.y1 + dy * t2,
          cx: w.x1 + dx * ((t1 + t2) / 2),
          cy: w.y1 + dy * ((t1 + t2) / 2),
          revealed: false,
          revealTime: -Infinity,
          strength: 0,
        });
      }
    }
  };
  buildWallSegs();

  const player = {
    x: SPAWN.x,
    y: SPAWN.y,
    vx: 0,
    vy: 0,
    hp: CONFIG.maxHp,
    energy: CONFIG.maxEnergy,
    invincibleUntil: 0,
    bumpX: 0,
    bumpY: 0,
    bumpDirX: 0,
    bumpDirY: 1,
    bumpTime: -Infinity,
    dashUntil: 0,
    dashCdUntil: 0,
    dashDirX: 1,
    dashDirY: 0,
    faceX: 1,
    faceY: 0,
  };

  const mouse = { x: SPAWN.x, y: SPAWN.y };
  const camera = { x: SPAWN.x, y: SPAWN.y };
  const pulses = [];

  const krill = KRILL.map((k) => ({
    ...k,
    revealed: false,
    revealUntil: -Infinity,
    eaten: false,
  }));

  const monsters = MONSTERS.map((m) => ({
    x: m.x,
    y: m.y,
    homeX: m.x,
    homeY: m.y,
    vx: 0,
    vy: 0,
    state: 'patrol', // patrol | chase
    chaseUntil: 0,
    targetX: m.x,
    targetY: m.y,
    wanderX: m.x,
    wanderY: m.y,
    despawnAt: Infinity, // 非无尽模式不会自然刷没
  }));

  const exit = { ...EXIT, active: false };

  // 拾取道具（heal / energy / puffer）
  const pickups = PICKUPS.map((p) => ({
    ...p,
    revealed: false,
    revealUntil: -Infinity,
    taken: false,
    wanderAngle: Math.random() * Math.PI * 2,
  }));

  // 毒液藤壶附墙，碰到扣血
  const barnacles = BARNACLES.map((b) => ({
    ...b,
    revealed: false,
    revealUntil: -Infinity,
  }));

  // 小鱼
  const fish = [];

  const REACH_S = 30;
  const _reachVis = (() => {
    const GW = Math.ceil(WORLD.width / REACH_S);
    const GH = Math.ceil(WORLD.height / REACH_S);
    const v = new Uint8Array(GW * GH);
    const queue = [];
    const enq = (gx, gy) => {
      if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) return;
      const i = gy * GW + gx;
      if (v[i]) return;
      const px = gx * REACH_S + REACH_S / 2;
      const py = gy * REACH_S + REACH_S / 2;
      // 格子中心玩家半径 14 范围内不能压到墙
      if (distToWall(px, py) < CONFIG.playerRadius) return;
      v[i] = 1;
      queue.push([gx, gy]);
    };
    enq(Math.floor(SPAWN.x / REACH_S), Math.floor(SPAWN.y / REACH_S));
    let h = 0;
    while (h < queue.length) {
      const [gx, gy] = queue[h++];
      enq(gx + 1, gy); enq(gx - 1, gy); enq(gx, gy + 1); enq(gx, gy - 1);
    }
    return v;
  })();
  const reachPoints = (() => {
    const GW = Math.ceil(WORLD.width / REACH_S);
    const pts = [];
    for (let gx = 0; gx < GW; gx++) {
      for (let gy = 0; gy < Math.ceil(WORLD.height / REACH_S); gy++) {
        if (_reachVis[gy * GW + gx]) {
          pts.push([gx * REACH_S + REACH_S / 2, gy * REACH_S + REACH_S / 2]);
        }
      }
    }
    return pts;
  })();

  // 开阔可达点：既在玩家可到达区域，又离所有墙(含外框边界)足够远，
  // 供会四处游动的生物(小鱼)刷新，避免贴墙/贴边刷出后左右乱弹。
  const OPEN_CLEAR = CONFIG.fishRadius + 22; // 距墙(含边界)最小净空 px
  const openReachPoints = (() => {
    const pts = [];
    for (const [cx, cy] of reachPoints) {
      // 距地图外框边界
      if (cx < OPEN_CLEAR || cy < OPEN_CLEAR) continue;
      if (cx > WORLD.width - OPEN_CLEAR || cy > WORLD.height - OPEN_CLEAR) continue;
      // 距内部墙（保证整格净空）
      if (distToWall(cx, cy) < OPEN_CLEAR + REACH_S * 0.5) continue;
      pts.push([cx, cy]);
    }
    return pts;
  })();

  let viewW = 800;
  let viewH = 600;
  let sonarFiring = false;
  let sonarExhausted = false; // 能量打空锁
  let lastPulseTime = 0;
  let currentTime = 0;
  let fishEatenCount = 0; // 本轮已吃小鱼数
  let nextFishSpawnAt = 0;
  let nextKrillSpawnAt = 0;
  let nextPickupSpawnAt = 0;
  let nextMonsterSpawnAt = 0;

  // 恐惧值倒计时状态
  let fearStage = 0; // 0,1,2... 阶段越高，倒计时越短
  let fearNextAt = 0; // 下次触发扣血的时间戳

  /** 圆 vs 线段碰撞，将对象沿法线推出 */
  const resolveCircle = (obj, radius) => {
    for (const w of allWalls) {
      const c = closestOnSegment(obj.x, obj.y, w.x1, w.y1, w.x2, w.y2);
      const dx = obj.x - c.x;
      const dy = obj.y - c.y;
      const d = Math.hypot(dx, dy);
      if (d >= radius) continue;
      // 玩家撞墙：记录碰撞点与墙方向，用于绘制磕头晕光
      if (obj === player) {
        player.bumpX = c.x;
        player.bumpY = c.y;
        player.bumpTime = currentTime;
        const wdx = w.x2 - w.x1;
        const wdy = w.y2 - w.y1;
        const wl = Math.hypot(wdx, wdy) || 1;
        player.bumpDirX = wdx / wl;
        player.bumpDirY = wdy / wl;
      }
      if (d > 0.0001) {
        obj.x += (dx / d) * (radius - d);
        obj.y += (dy / d) * (radius - d);
      } else {
        const nx = -(w.y2 - w.y1);
        const ny = w.x2 - w.x1;
        const nl = Math.hypot(nx, ny) || 1;
        obj.x += (nx / nl) * radius;
        obj.y += (ny / nl) * radius;
      }
    }
  };

  /** 重置给木 */
  const init = () => {
    status.value = 'playing';
    collected.value = 0;
    endless.value = false;
    deathReason.value = '';
    proficiency.value = 0;
    Object.assign(dna.value, { courage: 0, skin: 0, sonar: 0, muscle: 0 });
    Object.assign(player, {
      x: SPAWN.x,
      y: SPAWN.y,
      vx: 0,
      vy: 0,
      hp: CONFIG.maxHp,
      energy: effMaxEnergy(),
      invincibleUntil: 0,
      bumpTime: -Infinity,
      dashUntil: 0,
      dashCdUntil: 0,
      faceX: 1,
      faceY: 0,
    });
    mouse.x = SPAWN.x;
    mouse.y = SPAWN.y;
    camera.x = SPAWN.x;
    camera.y = SPAWN.y;
    pulses.length = 0;
    fearStage = 0;
    fearNextAt = 0;
    krill.forEach((k) => {
      k.eaten = false;
      k.revealed = false;
      k.revealUntil = -Infinity;
    });
    pickups.forEach((p) => {
      p.taken = false;
      p.revealed = false;
      p.revealUntil = -Infinity;
      p.wanderAngle = Math.random() * Math.PI * 2;
    });
    nextKrillSpawnAt = 0;
    nextPickupSpawnAt = 0;
    barnacles.forEach((b) => {
      b.revealed = false;
      b.revealUntil = -Infinity;
    });
    fish.length = 0;
    fishEatenCount = 0;
    nextFishSpawnAt = 0;
    nextMonsterSpawnAt = 0;
    // 重置海怪为初始 3 只（非无尽模式固定）
    monsters.length = 0;
    MONSTERS.forEach((m) => {
      monsters.push({
        x: m.x,
        y: m.y,
        homeX: m.x,
        homeY: m.y,
        vx: 0,
        vy: 0,
        state: 'patrol',
        chaseUntil: 0,
        targetX: m.x,
        targetY: m.y,
        wanderX: m.x,
        wanderY: m.y,
        despawnAt: Infinity,
      });
    });
    innerWalls.forEach((w) => {
      w.revealed = false;
      w.revealTime = -Infinity;
    });
    innerSegs.forEach((s) => {
      s.revealed = false;
      s.revealTime = -Infinity;
      s.strength = 0;
    });
    exit.active = false;
    sonarFiring = false;
    sonarExhausted = false;
  };

  const setViewSize = (w, h) => {
    viewW = w;
    viewH = h;
  };

  /** 屏幕坐标转世界坐标（含摄像机偏移） */
  const setMouse = (sx, sy) => {
    mouse.x = Math.max(0, Math.min(WORLD.width, sx + camera.x - viewW / 2));
    mouse.y = Math.max(0, Math.min(WORLD.height, sy + camera.y - viewH / 2));
  };

  const setFiring = (v) => {
    sonarFiring = v;
  };

  /** 右键冲刺：朝鼠标方向快速位移，用于躲闪 */
  const setDash = () => {
    const time = currentTime;
    if (time < player.dashCdUntil) return;
    let dx = mouse.x - player.x;
    let dy = mouse.y - player.y;
    let d = Math.hypot(dx, dy);
    if (d < 20) {
      dx = player.vx;
      dy = player.vy;
      d = Math.hypot(dx, dy);
    }
    if (d < 0.0001) return; // 静止且无目标方向，不触发冲刺
    player.dashDirX = dx / d;
    player.dashDirY = dy / d;
    player.dashUntil = time + effDashDur() * 1000;
    player.dashCdUntil = time + effDashCd();
  };

  /** 获取当前恐惧阶段对应的倒计时间隔（ms）——胆量提升基础时长 */
  const getFearInterval = (stage) => {
    const base = effFearBase();
    if (stage === 0) return base;
    if (stage === 1) return base / 2;
    return CONFIG.fearMinMs; // X/3 下限
  };

  /** 主动开声纳时重置恐惧倒计时 */
  const resetFear = (time) => {
    fearStage = 0;
    fearNextAt = time + getFearInterval(0);
  };

  /** 恐惧值倒计时：长时间不主动开声纳则持续扣血，调试无敌开启时免疫，仍推进阶段/倒计时 */
  const updateFear = (time) => {
    if (fearNextAt === 0) resetFear(time);
    if (time < fearNextAt) return;
    fearStage++;
    fearNextAt = time + getFearInterval(fearStage);
    if (debug.value.invincible) return; // 无敌
    player.hp -= CONFIG.fearDamage;
    player.invincibleUntil = time + effInvincible();
    if (player.hp <= 0) {
      deathReason.value = 'fear';
      status.value = 'lost';
    }
  };

  const updateEnergy = (dt, time) => {
    // 持续发声：能量 >0 且未打空锁 → 一直扣到 0（按住可长扫至能量耗尽）
    if (sonarFiring && !sonarExhausted && player.energy > 0) {
      player.energy = Math.max(0, player.energy - CONFIG.energyDrain * dt);
      if (player.energy <= 0) sonarExhausted = true; // 打空：锁发声，需回能解锁
      if (time - lastPulseTime >= 130) {
        pulses.push({ ox: player.x, oy: player.y, r: CONFIG.playerRadius + 4, dead: false });
        lastPulseTime = time;
        resetFear(time);
      }
      return;
    }
    // 松开 / 打空锁：回能；回到 energyMinFire 解锁才能再次发声（声呐提升回能/上限）
    player.energy = Math.min(effMaxEnergy(), player.energy + effRegen() * dt);
    if (player.energy >= CONFIG.energyMinFire) sonarExhausted = false;
  };

  const updatePulses = (dt, time) => {
    for (const p of pulses) {
      if (p.dead) continue;
      const prevR = p.r;
      p.r += CONFIG.sonarSpeed * dt;
      if (p.r > CONFIG.sonarMaxRadius) {
        p.dead = true;
        continue;
      }
      // 碰墙显形：环前沿扫过的小段亮起
      for (const s of innerSegs) {
        const d = distToSegment(p.ox, p.oy, s.x1, s.y1, s.x2, s.y2);
        if (d <= p.r && d > prevR) {
          s.revealed = true;
          s.revealTime = time;
          s.strength = 1;
        }
      }
      // 碰磷虾显形
      for (const k of krill) {
        if (!k.eaten && dist(p.ox, p.oy, k.x, k.y) <= p.r) {
          k.revealed = true;
          k.revealUntil = time + CONFIG.krillRevealMs;
        }
      }
      // 碰道具显形
      for (const pk of pickups) {
        if (!pk.taken && dist(p.ox, p.oy, pk.x, pk.y) <= p.r) {
          pk.revealed = true;
          pk.revealUntil = time + CONFIG.krillRevealMs;
        }
      }
      // 碰藤壶显形
      for (const b of barnacles) {
        if (dist(p.ox, p.oy, b.x, b.y) <= p.r) {
          b.revealed = true;
          b.revealUntil = time + CONFIG.krillRevealMs;
        }
      }
      // 碰小鱼显形
      for (const f of fish) {
        if (dist(p.ox, p.oy, f.x, f.y) <= p.r) {
          f.revealed = true;
          f.revealUntil = time + CONFIG.krillRevealMs;
        }
      }
      // 碰海怪惊动
      for (const m of monsters) {
        if (dist(p.ox, p.oy, m.x, m.y) <= p.r) {
          m.state = 'chase';
          m.chaseUntil = time + CONFIG.monsterChaseMs;
          m.targetX = player.x;
          m.targetY = player.y;
        }
      }
    }
    for (let i = pulses.length - 1; i >= 0; i--) {
      if (pulses[i].dead) pulses.splice(i, 1);
    }
  };

  const updatePlayer = (dt, time) => {
    if (time < player.dashUntil) {
      // 冲刺：分步移动 + 撞墙立即停止
      const full = CONFIG.dashSpeed * dt;
      const step = CONFIG.playerRadius * 0.5;
      let moved = 0;
      let hit = false;
      while (moved < full) {
        const s = Math.min(step, full - moved);
        const nx = player.x + player.dashDirX * s;
        const ny = player.y + player.dashDirY * s;
        if (collideWall(nx, ny, CONFIG.playerRadius)) {
          hit = true;
          break;
        }
        player.x = nx;
        player.y = ny;
        moved += s;
      }
      if (hit) {
        player.dashUntil = 0;
        player.vx = 0;
        player.vy = 0;
      } else {
        player.vx = player.dashDirX * CONFIG.dashSpeed;
        player.vy = player.dashDirY * CONFIG.dashSpeed;
      }
      return;
    }

    // 非冲刺：平滑追鼠标
    const dx = mouse.x - player.x;
    const dy = mouse.y - player.y;
    const d = Math.hypot(dx, dy);
    const k = 1 - Math.exp(-CONFIG.playerLerp * dt);
    const stopDist = CONFIG.followDist; // 与鼠标保持跟随距离
    if (d > stopDist) {
      // 目标速度随距离缩放：远满速、近减速，
      const speed = CONFIG.playerMaxSpeed * Math.min(1, d / 100);
      const dvx = (dx / d) * speed;
      const dvy = (dy / d) * speed;
      player.vx += (dvx - player.vx) * k;
      player.vy += (dvy - player.vy) * k;
    } else {
      player.vx += (dx - player.vx) * k;
      player.vy += (dy - player.vy) * k;
    }
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    resolveCircle(player, CONFIG.playerRadius);

    const sp = Math.hypot(player.vx, player.vy);
    if (sp > 30) {
      player.faceX = player.vx / sp;
      player.faceY = player.vy / sp;
    }
  };

  /** 圆 vs 墙：返回碰撞法线（未碰撞返回 null） */
  const collideWall = (x, y, radius) => {
    for (const w of allWalls) {
      const c = closestOnSegment(x, y, w.x1, w.y1, w.x2, w.y2);
      const dx = x - c.x;
      const dy = y - c.y;
      const d = Math.hypot(dx, dy);
      if (d < radius) {
        if (d > 0.0001) return { nx: dx / d, ny: dy / d };
        const wdx = w.x2 - w.x1;
        const wdy = w.y2 - w.y1;
        const wl = Math.hypot(wdx, wdy) || 1;
        return { nx: -wdy / wl, ny: wdx / wl };
      }
    }
    return null;
  };

  /** 海怪沿墙滑动移动 */
  const moveMonster = (m, dirX, dirY, step) => {
    let vx = dirX * step;
    let vy = dirY * step;

    for (let iter = 0; iter < 4; iter++) {
      const hit = collideWall(m.x + vx, m.y + vy, CONFIG.monsterRadius);
      if (!hit) {
        m.x += vx;
        m.y += vy;
        return;
      }
      // 去掉法向分量，保留沿墙切向滑动
      const dot = vx * hit.nx + vy * hit.ny;
      vx -= hit.nx * dot;
      vy -= hit.ny * dot;
      if (Math.hypot(vx, vy) < 0.5) {
        // 正对墙：沿墙切向朝追击目标方向绕行
        const toPx = m.targetX - m.x;
        const toPy = m.targetY - m.y;
        const sign = (-hit.ny * toPx + hit.nx * toPy) >= 0 ? 1 : -1;
        vx = -hit.ny * sign * step;
        vy = hit.nx * sign * step;
      }
    }
  };

  /** 给海怪选一个新的漫游目标点 */
  const pickWanderTarget = (m) => {
    const ang = Math.random() * Math.PI * 2;
    const r = 120 + Math.random() * 260;
    m.wanderX = Math.max(40, Math.min(WORLD.width - 40, m.x + Math.cos(ang) * r));
    m.wanderY = Math.max(40, Math.min(WORLD.height - 40, m.y + Math.sin(ang) * r));
  };

  /** 海怪巡逻移动：朝漫游点游，撞墙沿墙切向滑动绕行 */
  const movePatrol = (m, dirX, dirY, step) => {
    let vx = dirX * step;
    let vy = dirY * step;

    for (let iter = 0; iter < 4; iter++) {
      const hit = collideWall(m.x + vx, m.y + vy, CONFIG.monsterRadius);
      if (!hit) {
        m.x += vx;
        m.y += vy;
        return;
      }
      // 撞墙：去掉法向分量，保留沿墙切向滑动
      const dot = vx * hit.nx + vy * hit.ny;
      vx -= hit.nx * dot;
      vy -= hit.ny * dot;
      if (Math.hypot(vx, vy) < 0.5) {
        // 正对墙：随机选切向继续游，同时换漫游点，避免困死胡同
        const sign = Math.random() < 0.5 ? 1 : -1;
        vx = -hit.ny * sign * step;
        vy = hit.nx * sign * step;
        pickWanderTarget(m);
      }
    }
  };

  const updateMonsters = (dt, time) => {
    for (const m of monsters) {
      let speed = CONFIG.monsterPatrolSpeed;
      let dx = 0;
      let dy = 0;

      if (m.state === 'chase') {
        const toTarget = dist(m.x, m.y, m.targetX, m.targetY);
        if (time > m.chaseUntil || toTarget < CONFIG.monsterRadius + 6) {
          // 追到声波位置（或超时）：转漫游，选新目标点自然游开
          m.state = 'patrol';
          pickWanderTarget(m);
        } else {
          speed = CONFIG.monsterChaseSpeed;
          // 追「发声波位置」这个固定点，不实时追玩家
          dx = m.targetX - m.x;
          dy = m.targetY - m.y;
        }
      }

      if (m.state === 'patrol') {
        // 漫无目的：朝漫游目标点游，到了换点；离家太远则回家
        let wx = m.wanderX;
        let wy = m.wanderY;
        const homeD = dist(m.x, m.y, m.homeX, m.homeY);
        if (homeD > 400) {
          wx = m.homeX;
          wy = m.homeY;
        }
        const wd = dist(m.x, m.y, wx, wy);
        if (wd < 24) {
          pickWanderTarget(m);
          wx = m.wanderX;
          wy = m.wanderY;
        }
        dx = wx - m.x;
        dy = wy - m.y;
      }

      const d = Math.hypot(dx, dy);
      if (d > 0.0001) {
        if (m.state === 'chase') {
          moveMonster(m, dx / d, dy / d, speed * dt);
        } else {
          movePatrol(m, dx / d, dy / d, speed * dt);
        }
      }
    }
  };

  /** 被动声呐：玩家光晕即小声呐，范围内墙/磷虾/道具/藤壶/鱼显形、海怪惊动 */
  const updatePassiveSonar = (time) => {
    const r = CONFIG.glowRadius;
    // 光晕只照到玩家附近一小段墙，越靠近玩家越亮、向两侧渐变到 0
    for (const s of innerSegs) {
      const d = dist(player.x, player.y, s.cx, s.cy);
      if (d <= r) {
        s.revealed = true;
        s.revealTime = time;
        s.strength = 1 - d / r;
      }
    }
    for (const k of krill) {
      if (!k.eaten && dist(player.x, player.y, k.x, k.y) <= r) {
        k.revealed = true;
        k.revealUntil = time + CONFIG.krillRevealMs;
      }
    }
    for (const pk of pickups) {
      if (!pk.taken && dist(player.x, player.y, pk.x, pk.y) <= r) {
        pk.revealed = true;
        pk.revealUntil = time + CONFIG.krillRevealMs;
      }
    }
    for (const b of barnacles) {
      if (dist(player.x, player.y, b.x, b.y) <= r) {
        b.revealed = true;
        b.revealUntil = time + CONFIG.krillRevealMs;
      }
    }
    for (const f of fish) {
      if (dist(player.x, player.y, f.x, f.y) <= r) {
        f.revealed = true;
        f.revealUntil = time + CONFIG.krillRevealMs;
      }
    }
    for (const m of monsters) {
      if (dist(player.x, player.y, m.x, m.y) <= r) {
        m.state = 'chase';
        m.chaseUntil = time + CONFIG.monsterChaseMs;
        m.targetX = player.x;
        m.targetY = player.y;
      }
    }
  };

  /** 小鱼刷新 + 漫无目的游动 + 回收 */
  const updateFish = (dt, time) => {
    if (fish.length < CONFIG.fishMaxCount && time >= nextFishSpawnAt) {
      // 从"开阔可达点"随机取：既保证玩家能到达，又不会贴墙/贴边刷出左右乱弹。
      // 扰动刻意调小，始终停留在净空区内。
      const pool = openReachPoints.length ? openReachPoints : reachPoints;
      const [bx, by] = pool[(Math.random() * pool.length) | 0];
      const jitter = REACH_S * 0.25;
      fish.push({
        x: bx + (Math.random() - 0.5) * jitter,
        y: by + (Math.random() - 0.5) * jitter,
        wanderAngle: Math.random() * Math.PI * 2,
        revealed: false,
        revealUntil: -Infinity,
        eaten: false,
      });
      nextFishSpawnAt =
        time + CONFIG.fishSpawnMinMs + Math.random() * (CONFIG.fishSpawnMaxMs - CONFIG.fishSpawnMinMs);
    }
    for (const f of fish) {
      if (f.eaten) continue;
      f.wanderAngle += (Math.random() - 0.5) * 3 * dt;
      const nx = f.x + Math.cos(f.wanderAngle) * CONFIG.fishSpeed * dt;
      const ny = f.y + Math.sin(f.wanderAngle) * CONFIG.fishSpeed * dt;
      // 撞墙则反射转向，小鱼不穿墙
      const hit = collideWall(nx, ny, CONFIG.fishRadius);
      if (hit) {
        const vdx = Math.cos(f.wanderAngle);
        const vdy = Math.sin(f.wanderAngle);
        const dot = vdx * hit.nx + vdy * hit.ny;
        const rx = vdx - 2 * dot * hit.nx;
        const ry = vdy - 2 * dot * hit.ny;
        f.wanderAngle = Math.atan2(ry, rx);
      } else {
        f.x = nx;
        f.y = ny;
      }
      f.x = Math.max(20, Math.min(WORLD.width - 20, f.x));
      f.y = Math.max(20, Math.min(WORLD.height - 20, f.y));
    }
    for (let i = fish.length - 1; i >= 0; i--) {
      if (fish[i].eaten) fish.splice(i, 1);
    }
  };

  /** 捡拾道具（heal 回血 / energy 回能量 / puffer 河豚扣血）——无尽模式吃道具积熟练度 */
  const checkPickups = (time) => {
    for (const p of pickups) {
      if (p.taken) continue;
      const pickupR = p.type === 'puffer' ? CONFIG.endless.pufferRadius : 10;
      if (dist(player.x, player.y, p.x, p.y) < CONFIG.playerRadius + pickupR) {
        p.taken = true;
        if (p.type === 'heal') {
          player.hp += CONFIG.healAmount;
          if (!endless.value) player.hp = Math.min(CONFIG.maxHp, player.hp);
          if (endless.value) proficiency.value += CONFIG.dna.profHeal;
        } else if (p.type === 'energy') {
          player.energy = Math.min(effMaxEnergy(), player.energy + CONFIG.energyPickupAmount);
          if (endless.value) proficiency.value += CONFIG.dna.profEnergy;
        } else if (p.type === 'puffer') {
          if (debug.value.invincible) continue;
          if (time < player.invincibleUntil) continue; // 无敌帧内不中毒，河豚留在原地
          player.hp -= CONFIG.pufferDamage;
          player.invincibleUntil = time + effInvincible();
          if (endless.value) proficiency.value += CONFIG.dna.profPuffer;
          if (player.hp <= 0) {
            deathReason.value = 'puffer';
            status.value = 'lost';
            return;
          }
        }
      }
    }
  };

  /** 吃小鱼 + 奖励 */
  const checkFish = () => {
    for (const f of fish) {
      if (f.eaten) continue;
      if (dist(player.x, player.y, f.x, f.y) < CONFIG.playerRadius + CONFIG.fishRadius) {
        f.eaten = true;
        fishEatenCount++;
        if (endless.value) proficiency.value += CONFIG.dna.profFish;
        if (fishEatenCount >= CONFIG.fishPerReward) {
          fishEatenCount = 0;
          player.energy = Math.min(effMaxEnergy(), player.energy + CONFIG.fishRewardEnergy);
          player.hp += CONFIG.fishRewardHp;
          if (!endless.value) player.hp = Math.min(CONFIG.maxHp, player.hp);
        }
      }
    }
  };

  /** 毒液藤壶碰撞扣血 */
  const checkBarnacles = (time) => {
    if (time < player.invincibleUntil || debug.value.invincible) return;
    for (const b of barnacles) {
      if (dist(player.x, player.y, b.x, b.y) < CONFIG.playerRadius + CONFIG.barnacleRadius) {
        player.hp--;
        player.invincibleUntil = time + effInvincible();
        if (player.hp <= 0) {
          deathReason.value = 'barnacle';
          status.value = 'lost';
          return;
        }
        break;
      }
    }
  };

  /** 进入无尽模式（通关后调用）：血量无上限，磷虾/道具随机刷新 */
  const startEndless = () => {
    if (endless.value) return;
    endless.value = true;
    status.value = 'endless';
    exit.active = false;
    pulses.length = 0;
    const now = currentTime;
    nextKrillSpawnAt = now + 1000;
    nextPickupSpawnAt = now + 1000;
    nextMonsterSpawnAt = now + 2000;
    // 所有磷虾进入随机刷新/刷没循环（已吃的复活，未吃的也加寿命）
    krill.forEach((k) => {
      k.eaten = false;
      k.revealed = false;
      k.revealUntil = -Infinity;
      k.despawnAt = now + CONFIG.endless.krillLifeMinMs + Math.random() * (CONFIG.endless.krillLifeMaxMs - CONFIG.endless.krillLifeMinMs);
    });
    // 初始海怪也加入寿命循环
    monsters.forEach((m) => {
      m.despawnAt = now + CONFIG.endless.monsterLifeMinMs + Math.random() * (CONFIG.endless.monsterLifeMaxMs - CONFIG.endless.monsterLifeMinMs);
    });
  };

  const spawnReachablePoint = (margin = CONFIG.playerRadius) => {
    let [bx, by] = reachPoints[(Math.random() * reachPoints.length) | 0];
    const jitter = REACH_S * 0.4;
    bx += (Math.random() - 0.5) * jitter;
    by += (Math.random() - 0.5) * jitter;
    bx = Math.max(margin, Math.min(WORLD.width - margin, bx));
    by = Math.max(margin, Math.min(WORLD.height - margin, by));
    return { x: bx, y: by };
  };

  const spawnKrill = (time) => {
    if (krill.length >= CONFIG.endless.krillMax) return;
    const { x, y } = spawnReachablePoint();
    krill.push({
      x,
      y,
      revealed: false,
      revealUntil: -Infinity,
      eaten: false,
      despawnAt: time + CONFIG.endless.krillLifeMinMs + Math.random() * (CONFIG.endless.krillLifeMaxMs - CONFIG.endless.krillLifeMinMs),
    });
    nextKrillSpawnAt = time + CONFIG.endless.krillSpawnMinMs + Math.random() * (CONFIG.endless.krillSpawnMaxMs - CONFIG.endless.krillSpawnMinMs);
  };

  const spawnPickup = (time) => {
    if (pickups.length >= CONFIG.endless.pickupMax) return;
    const r = Math.random();
    const type = r < 0.35 ? 'heal' : r < 0.7 ? 'energy' : 'puffer';
    const { x, y } = spawnReachablePoint();
    pickups.push({
      type,
      x,
      y,
      revealed: false,
      revealUntil: -Infinity,
      taken: false,
      wanderAngle: Math.random() * Math.PI * 2,
      despawnAt: time + CONFIG.endless.pickupLifeMinMs + Math.random() * (CONFIG.endless.pickupLifeMaxMs - CONFIG.endless.pickupLifeMinMs),
    });
    nextPickupSpawnAt = time + CONFIG.endless.pickupSpawnMinMs + Math.random() * (CONFIG.endless.pickupSpawnMaxMs - CONFIG.endless.pickupSpawnMinMs);
  };

  /** 判断坐标是否在当前摄像机视野内（含 margin） */
  const isInView = (x, y, margin = CONFIG.endless.monsterSpawnMargin) => {
    const halfW = viewW / 2 + margin;
    const halfH = viewH / 2 + margin;
    return x >= camera.x - halfW && x <= camera.x + halfW && y >= camera.y - halfH && y <= camera.y + halfH;
  };

  /** 无尽模式：在玩家视野外刷新新海怪 */
  const spawnMonster = (time) => {
    if (monsters.length >= CONFIG.endless.monsterMax) return;
    for (let i = 0; i < 25; i++) {
      const { x, y } = spawnReachablePoint(CONFIG.monsterRadius);
      if (!isInView(x, y)) {
        monsters.push({
          x,
          y,
          homeX: x,
          homeY: y,
          vx: 0,
          vy: 0,
          state: 'patrol',
          chaseUntil: 0,
          targetX: x,
          targetY: y,
          wanderX: x,
          wanderY: y,
          despawnAt: time + CONFIG.endless.monsterLifeMinMs + Math.random() * (CONFIG.endless.monsterLifeMaxMs - CONFIG.endless.monsterLifeMinMs),
        });
        nextMonsterSpawnAt = time + CONFIG.endless.monsterSpawnMinMs + Math.random() * (CONFIG.endless.monsterSpawnMaxMs - CONFIG.endless.monsterSpawnMinMs);
        return;
      }
    }
  };

  /** 无尽模式：海怪寿命到了且在视野外时自然刷没 */
  const updateMonsterDespawn = (time) => {
    for (let i = monsters.length - 1; i >= 0; i--) {
      const m = monsters[i];
      if (time >= m.despawnAt && !isInView(m.x, m.y)) {
        monsters.splice(i, 1);
      }
    }
  };

  const updateEndlessEntities = (time) => {
    // 磷虾自然刷没
    for (let i = krill.length - 1; i >= 0; i--) {
      const k = krill[i];
      if (k.eaten || (k.despawnAt && time > k.despawnAt)) {
        krill.splice(i, 1);
      }
    }
    if (time >= nextKrillSpawnAt) spawnKrill(time);

    // 道具自然刷没
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      if (p.taken || (p.despawnAt && time > p.despawnAt)) {
        pickups.splice(i, 1);
      }
    }
    if (time >= nextPickupSpawnAt) spawnPickup(time);

    // 海怪视野外刷没 + 视野外刷新
    updateMonsterDespawn(time);
    if (time >= nextMonsterSpawnAt) spawnMonster(time);
  };

  /** 河豚像小鱼一样乱游，撞墙反射转向 */
  const updatePickups = (dt) => {
    for (const p of pickups) {
      if (p.taken || p.type !== 'puffer') continue;
      p.wanderAngle += (Math.random() - 0.5) * 3 * dt;
      const nx = p.x + Math.cos(p.wanderAngle) * CONFIG.endless.pufferSpeed * dt;
      const ny = p.y + Math.sin(p.wanderAngle) * CONFIG.endless.pufferSpeed * dt;
      const hit = collideWall(nx, ny, CONFIG.endless.pufferRadius);
      if (hit) {
        const vdx = Math.cos(p.wanderAngle);
        const vdy = Math.sin(p.wanderAngle);
        const dot = vdx * hit.nx + vdy * hit.ny;
        const rx = vdx - 2 * dot * hit.nx;
        const ry = vdy - 2 * dot * hit.ny;
        p.wanderAngle = Math.atan2(ry, rx);
      } else {
        p.x = nx;
        p.y = ny;
      }
      p.x = Math.max(20, Math.min(WORLD.width - 20, p.x));
      p.y = Math.max(20, Math.min(WORLD.height - 20, p.y));
    }
  };

  const checkCollisions = (time) => {
    // 吃磷虾
    for (const k of krill) {
      if (!k.eaten && dist(player.x, player.y, k.x, k.y) < CONFIG.playerRadius + 8) {
        k.eaten = true;
        collected.value++;
        player.energy = Math.min(effMaxEnergy(), player.energy + CONFIG.krillEnergyBonus);
        if (endless.value) proficiency.value += CONFIG.dna.profKrill;
      }
    }
    // 海怪撞鲸鱼（仅追击状态会扣血）
    if (time < player.invincibleUntil || debug.value.invincible) return;
    for (const m of monsters) {
      if (m.state !== 'chase') continue;
      if (dist(player.x, player.y, m.x, m.y) < CONFIG.playerRadius + CONFIG.monsterRadius) {
        player.hp--;
        player.invincibleUntil = time + effInvincible();
        if (player.hp <= 0) {
          deathReason.value = 'monster';
          status.value = 'lost';
          return;
        }
      }
    }
  };

  const checkWinLose = () => {
    if (endless.value) return;
    if (collected.value >= krill.length && !exit.active) {
      exit.active = true;
    }
    if (exit.active && status.value === 'playing' && dist(player.x, player.y, exit.x, exit.y) < CONFIG.playerRadius + 24) {
      status.value = 'won';
    }
  };

  const updateCamera = (dt) => {
    const k = 1 - Math.exp(-6 * dt);
    camera.x += (player.x - camera.x) * k;
    camera.y += (player.y - camera.y) * k;
    camera.x = Math.max(viewW / 2, Math.min(WORLD.width - viewW / 2, camera.x));
    camera.y = Math.max(viewH / 2, Math.min(WORLD.height - viewH / 2, camera.y));
  };

  /** 每帧更新 */
  const update = (dt, time) => {
    if (status.value !== 'playing' && status.value !== 'endless') return;
    currentTime = time;
    updateEnergy(dt, time);
    updateFear(time);
    updatePulses(dt, time);
    updatePassiveSonar(time);
    updatePlayer(dt, time);
    updateMonsters(dt, time);
    updateFish(dt, time);
    if (endless.value) updateEndlessEntities(time);
    updatePickups(dt, time);
    checkPickups(time);
    checkFish();
    checkBarnacles(time);
    checkCollisions(time);
    checkWinLose();
    updateCamera(dt);
  };

  /** 获取渲染状态 */
  const getState = () => {
    return {
      player,
      mouse,
      camera,
      pulses,
      krill,
      monsters,
      exit,
      pickups,
      barnacles,
      fish,
      innerWalls,
      innerSegs,
      border,
      allWalls,
      time: currentTime,
      collected: collected.value,
      fishEatenCount,
      debug: debug.value,
      endless: endless.value,
      proficiency: proficiency.value,
      dna: dna.value,
      fearStage,
      fearNextAt,
      fearInterval: getFearInterval(fearStage),
      fearProgress: Math.max(0, fearNextAt - currentTime) / Math.max(1, getFearInterval(fearStage)),
      // 供 HUD/特效反馈：
      firing: sonarFiring, // 玩家是否按住左键
      canSonarNow: player.energy > 0 && !sonarExhausted, // 当前是否真能发声
      sonarExhausted,
      energyMax: effMaxEnergy(),
      energyRegen: effRegen(),
      invincibleMs: effInvincible(),
      fearBaseMs: effFearBase(),
      dashCdMs: effDashCd(),
      dashDurMs: effDashDur() * 1000,
      energyRatio: Math.max(0, Math.min(1, player.energy / effMaxEnergy())),
      dashCdRatio: player.dashCdUntil <= currentTime
        ? 0
        : Math.max(0, Math.min(1, (player.dashCdUntil - currentTime) / effDashCd())),
    };
  };

  return {
    status,
    collected,
    deathReason,
    debug,
    endless,
    proficiency,
    dna,
    dnaCost,
    dnaCanUpgrade,
    upgradeDNA,
    init,
    startEndless,
    setViewSize,
    setMouse,
    setFiring,
    setDash,
    update,
    getState,
  };
};
