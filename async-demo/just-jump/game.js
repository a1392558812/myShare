const PHYSICS = {
  GRAVITY: 1800,
  GROUND_FRICTION: 4.0,
  BOUNCE: 0.4,
  REST_VELOCITY: 3,
  PLAYER_RADIUS: 14,
  MAX_LAUNCH_SPEED: 2400,
  MIN_DRAG: 5,
  CAMERA_LERP: 8,
  PLATFORM_MIN_WIDTH: 80,
  PLATFORM_MAX_WIDTH: 280,
  PLATFORM_HEIGHT: 30,
  PLAYER_GAP: 42,
};

const COLORS = {
  BG: "#0f172a",
  GRID: "#1e293b",
  OBSTACLE: "#475569",
  OBSTACLE_EDGE: "#94a3b8",
  GROUND: "#334155",
  GROUND_EDGE: "#64748b",
  PLAYER_BG: "#fbbf24",
  ARROW_LOW: "#10b981",
  ARROW_MID: "#f59e0b",
  ARROW_HIGH: "#ef4444",
  TEXT: "#e2e8f0",
  BOUNDARY: "#6366f1",
};

/** @type {Readonly<{gravity:number,bounce:number,friction:number,maxCharge:number,damping:number,launchPower:number,showTrajectory:boolean}>} */
export const DEFAULT_CONFIG = Object.freeze({
  gravity: PHYSICS.GRAVITY,
  bounce: PHYSICS.BOUNCE,
  friction: PHYSICS.GROUND_FRICTION,
  maxCharge: 150,
  damping: 0.6,
  launchPower: 9.0,
  showTrajectory: false,
});

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

const lerp = (a, b, t) => a + (b - a) * t;

const lerpExp = (a, b, dt, k) => lerp(a, b, 1 - Math.exp(-k * dt));

const lerpHex = (a, b, t) => {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(lerp(ar, br, t));
  const g = Math.round(lerp(ag, bg, t));
  const bl = Math.round(lerp(ab, bb, t));
  return `rgb(${r}, ${g}, ${bl})`;
};

const hash2d = (cx, cy) => {
  let h = ((cx | 0) * 374761393 + (cy | 0) * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

const mulberry32 = (seed) => {
  let t = seed | 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * 根据配置计算最大跳跃高度
 * @param {Object} config
 * @returns {number}
 */
const calcMaxJumpHeight = (config) => {
  const vyMax = config.maxCharge * config.launchPower;
  return (vyMax * vyMax) / (2 * config.gravity);
};

/**
 * 生成单个平台
 * @param {number} y 平台顶部 y 坐标
 * @param {Array<{x:number,y:number,w:number,h:number}>} existing 已有平台
 * @param {Function} rng
 * @param {number} worldW 世界宽度
 * @returns {{x:number,y:number,w:number,h:number,isGround:boolean} | null}
 */
const tryPlacePlatform = (y, existing, rng, worldW) => {
  const minW = PHYSICS.PLATFORM_MIN_WIDTH;
  const maxW = PHYSICS.PLATFORM_MAX_WIDTH;
  const gap = PHYSICS.PLAYER_GAP;

  const occupied = existing
    .filter((p) => Math.abs(p.y - y) < 100)
    .map((p) => ({ start: p.x - gap, end: p.x + p.w + gap }))
    .sort((a, b) => a.start - b.start);

  const merged = [];
  for (const seg of occupied) {
    if (!merged.length || seg.start > merged[merged.length - 1].end) {
      merged.push({ ...seg });
    } else {
      merged[merged.length - 1].end = Math.max(
        merged[merged.length - 1].end,
        seg.end,
      );
    }
  }

  let available = [];
  let prevEnd = 0;
  for (const seg of merged) {
    if (seg.start > prevEnd + minW) {
      available.push({ start: prevEnd, end: seg.start });
    }
    prevEnd = Math.max(prevEnd, seg.end);
  }
  if (prevEnd + minW < worldW) {
    available.push({ start: prevEnd, end: worldW });
  }

  if (!available.length) return null;

  const slot = available[Math.floor(rng() * available.length)];
  const w = Math.min(maxW, Math.max(minW, slot.end - slot.start));
  const x = slot.start + (slot.end - slot.start - w) * rng();

  return {
    x: Math.max(0, Math.min(x, worldW - w)),
    y,
    w,
    h: PHYSICS.PLATFORM_HEIGHT,
    isGround: false,
  };
};

/**
 * 生成平台层（纵向向上）
 * @param {number} startY 起始 y（从低到高，向下为正）
 * @param {number} maxJumpHeight 最大跳跃高度
 * @param {Array<{x:number,y:number,w:number,h:number}>} existingPlatforms 已有平台
 * @returns {Array<{x:number,y:number,w:number,h:number}>}
 */
const generatePlatformLayer = (
  startY,
  maxJumpHeight,
  existingPlatforms,
  worldW,
) => {
  const platforms = [];
  const seed = Math.floor(hash2d(0, Math.floor(startY / 100)) * 1e9);
  const rng = mulberry32(seed);

  if (startY === 0) {
    platforms.push({
      x: 0,
      y: 0,
      w: worldW,
      h: PHYSICS.PLATFORM_HEIGHT,
      isGround: true,
    });
  }

  const maxGap = maxJumpHeight * 0.65;
  const minGap = 50;

  const gap = minGap + (maxGap - minGap) * rng();
  const currentY = startY - gap;

  const count = 1 + Math.floor(rng() * 2);
  const layerPlatforms = [];

  for (let i = 0; i < count; i++) {
    const p = tryPlacePlatform(
      currentY,
      [...existingPlatforms, ...platforms, ...layerPlatforms],
      rng,
      worldW,
    );
    if (p) {
      layerPlatforms.push(p);
    }
  }

  if (layerPlatforms.length === 0) {
    const w =
      PHYSICS.PLATFORM_MIN_WIDTH +
      rng() * (PHYSICS.PLATFORM_MAX_WIDTH - PHYSICS.PLATFORM_MIN_WIDTH);
    layerPlatforms.push({
      x: (worldW - w) * rng(),
      y: currentY,
      w,
      h: PHYSICS.PLATFORM_HEIGHT,
      isGround: false,
    });
  }

  platforms.push(...layerPlatforms);

  return platforms;
};

const circleAABBMTV = (px, py, r, box) => {
  const nearestX = clamp(px, box.x, box.x + box.w);
  const nearestY = clamp(py, box.y, box.y + box.h);
  const dx = px - nearestX;
  const dy = py - nearestY;
  const d2 = dx * dx + dy * dy;
  if (d2 > r * r) return null;

  if (d2 < 1e-6) {
    const dxL = px - box.x;
    const dxR = box.x + box.w - px;
    const dyT = py - box.y;
    const dyB = box.y + box.h - py;
    const m = Math.min(dxL, dxR, dyT, dyB);
    if (m === dyT) return { nx: 0, ny: -1, depth: dyT + r };
    if (m === dyB) return { nx: 0, ny: 1, depth: dyB + r };
    if (m === dxL) return { nx: -1, ny: 0, depth: dxL + r };
    return { nx: 1, ny: 0, depth: dxR + r };
  }

  const dist = Math.sqrt(d2);
  return { nx: dx / dist, ny: dy / dist, depth: r - dist };
};

const rayAABB = (ox, oy, dx, dy, box) => {
  const tNearX = (box.x - ox) / dx;
  const tFarX = (box.x + box.w - ox) / dx;
  const tNearY = (box.y - oy) / dy;
  const tFarY = (box.y + box.h - oy) / dy;

  let tMin = Math.max(Math.min(tNearX, tFarX), Math.min(tNearY, tFarY));
  let tMax = Math.min(Math.max(tNearX, tFarX), Math.max(tNearY, tFarY));

  if (tMax < 0 || tMin > tMax) return null;

  if (tMin < 0) tMin = 0;

  const hitX = ox + dx * tMin;
  const hitY = oy + dy * tMin;

  let nx = 0,
    ny = 0;
  const epsilon = 0.001;
  if (Math.abs(hitX - box.x) < epsilon) nx = -1;
  else if (Math.abs(hitX - (box.x + box.w)) < epsilon) nx = 1;
  else if (Math.abs(hitY - box.y) < epsilon) ny = -1;
  else if (Math.abs(hitY - (box.y + box.h)) < epsilon) ny = 1;

  return { t: tMin, x: hitX, y: hitY, nx, ny };
};

/**
 * 创建游戏实例
 * @param {HTMLCanvasElement} canvas
 * @param {Object} config 可热更新的配置
 * @returns {{
 *   start: () => void,
 *   stop: () => void,
 *   reset: () => void,
 *   resize: () => void,
 *   onPointerDown: (e: PointerEvent) => void,
 *   onPointerMove: (e: PointerEvent) => void,
 *   onPointerUp: () => void,
 *   state: Object
 * }}
 */
export const createGame = (canvas, config) => {
  const ctx = canvas.getContext("2d");

  const state = {
    player: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: PHYSICS.PLAYER_RADIUS,
      isGrounded: false,
    },
    camera: { x: 0, y: 0 },
    platforms: [],
    input: { state: "idle", start: { x: 0, y: 0 }, current: { x: 0, y: 0 } },
    width: 0,
    height: 0,
    dpr: 1,
    score: 0,
    maxHeight: 0,
    gameOver: false,
    teleporting: 0,
  };

  let rafId = null;
  let lastTime = 0;
  let running = false;

  const updatePlatforms = () => {
    const p = state.player;
    const maxJumpHeight = calcMaxJumpHeight(config);
    const viewTop = p.y - state.height * 2;

    let highestPlatform = state.platforms.reduce(
      (min, plat) => Math.min(min, plat.y),
      Infinity,
    );
    let guard = 0;
    while (highestPlatform === Infinity || highestPlatform > viewTop) {
      if (++guard > 3000) break;
      const newTop = highestPlatform === Infinity ? 0 : highestPlatform;
      const newPlatforms = generatePlatformLayer(
        newTop,
        maxJumpHeight,
        state.platforms,
        state.width,
      );
      if (newPlatforms.length === 0) break;
      state.platforms.push(...newPlatforms);
      highestPlatform = newPlatforms.reduce(
        (min, plat) => Math.min(min, plat.y),
        highestPlatform,
      );
    }

    const keepBelow = p.y + state.height * 2;
    state.platforms = state.platforms.filter((plat) => plat.y < keepBelow);
  };

  const onPointerDown = (e) => {
    if (state.input.state !== "idle" || !state.player.isGrounded) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    state.input.state = "charging";
    const headScreen = worldToScreen(
      state.player.x,
      state.player.y - state.player.r,
    );
    state.input.start = {
      x: headScreen.x,
      y: headScreen.y,
    };
    state.input.current = { x: sx, y: sy };
  };

  const onPointerMove = (e) => {
    if (state.input.state !== "charging") return;
    const rect = canvas.getBoundingClientRect();
    state.input.current = {
      x: clamp(e.clientX - rect.left, 0, state.width),
      y: clamp(e.clientY - rect.top, 0, state.height),
    };
  };

  const onPointerUp = () => {
    if (state.input.state !== "charging") return;
    const dx = state.input.start.x - state.input.current.x;
    const dy = state.input.start.y - state.input.current.y;
    const rawDist = Math.hypot(dx, dy);
    if (rawDist >= PHYSICS.MIN_DRAG) {
      const power = Math.min(rawDist, config.maxCharge) * config.launchPower;
      const dirLen = rawDist || 1;
      let vx = (dx / dirLen) * power;
      let vy = (dy / dirLen) * power;
      const sp = Math.hypot(vx, vy);
      if (sp > PHYSICS.MAX_LAUNCH_SPEED) {
        const k = PHYSICS.MAX_LAUNCH_SPEED / sp;
        vx *= k;
        vy *= k;
      }
      state.player.vx = vx;
      state.player.vy = vy;
      state.player.isGrounded = false;
    }
    state.input.state = "idle";
  };

  const PHYSICS_SUBSTEPS = 6;

  const stepPhysics = (dt, gravity, bounce, friction) => {
    if (state.teleporting > 0) {
      state.teleporting--;
      return;
    }

    const p = state.player;

    if (p.isGrounded) {
      const decay = Math.max(0, 1 - friction * dt);
      p.vx *= decay;
      if (Math.abs(p.vx) < PHYSICS.REST_VELOCITY) p.vx = 0;
    } else {
      p.vy += gravity * dt;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.isGrounded = false;

    const halfWorld = state.width / 2;
    if (p.x - p.r < 0) {
      p.x = p.r;
      p.vx = -p.vx * bounce;
    }
    if (p.x + p.r > state.width) {
      p.x = state.width - p.r;
      p.vx = -p.vx * bounce;
    }

    for (let i = 0; i < state.platforms.length; i++) {
      const box = state.platforms[i];
      const mtv = circleAABBMTV(p.x, p.y, p.r, box);
      if (!mtv) continue;
      p.x += mtv.nx * mtv.depth;
      p.y += mtv.ny * mtv.depth;
      const vn = p.vx * mtv.nx + p.vy * mtv.ny;
      if (vn < 0) {
        const factor = -(1 + bounce) * vn;
        p.vx += factor * mtv.nx;
        p.vy += factor * mtv.ny;
      }
      if (mtv.ny < -0.3) {
        p.isGrounded = true;
        p.vy = 0;
        p.vx *= 0.85;
      }
    }
  };

  const update = (dt) => {
    const { gravity, bounce, friction } = config;
    const subDt = dt / PHYSICS_SUBSTEPS;
    for (let i = 0; i < PHYSICS_SUBSTEPS; i++) {
      stepPhysics(subDt, gravity, bounce, friction);
    }

    if (state.player.y < state.maxHeight) {
      state.maxHeight = state.player.y;
      state.score = Math.floor(-state.maxHeight / 10);
    }

    if (state.player.y > state.camera.y + state.height / 2 + 500) {
      state.gameOver = true;
    }

    updatePlatforms();

    state.camera.x = state.width / 2;
    const targetCamY = Math.min(
      state.player.y,
      -state.maxHeight + state.height / 3,
    );
    state.camera.y = lerpExp(
      state.camera.y,
      targetCamY,
      dt,
      PHYSICS.CAMERA_LERP,
    );
  };

  const worldToScreen = (wx, wy) => ({
    x: wx - state.camera.x + state.width / 2,
    y: wy - state.camera.y + state.height / 2,
  });

  const drawGrid = () => {
    const grid = 100;
    const offsetX = ((state.camera.x % grid) + grid) % grid;
    const offsetY = ((state.camera.y % grid) + grid) % grid;
    ctx.fillStyle = COLORS.BG;
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.strokeStyle = COLORS.GRID;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -offsetX; x < state.width; x += grid) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.height);
    }
    for (let y = -offsetY; y < state.height; y += grid) {
      ctx.moveTo(0, y);
      ctx.lineTo(state.width, y);
    }
    ctx.stroke();
  };

  const drawBoundary = () => {
    const left = worldToScreen(0, 0).x;
    const right = worldToScreen(state.width, 0).x;
    ctx.strokeStyle = COLORS.BOUNDARY;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(left, 0);
    ctx.lineTo(left, state.height);
    ctx.moveTo(right, 0);
    ctx.lineTo(right, state.height);
    ctx.stroke();
  };

  const drawBox = (box, fill, stroke) => {
    const s = worldToScreen(box.x, box.y);
    ctx.fillStyle = fill;
    ctx.fillRect(s.x, s.y, box.w, box.h);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(s.x + 0.5, s.y + 0.5, box.w - 1, box.h - 1);
  };

  const drawPlayer = () => {
    const s = worldToScreen(state.player.x, state.player.y);
    const r = state.player.r;

    ctx.save();
    ctx.translate(s.x, s.y);

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(-r * 0.35, -r * 0.9, r * 0.7, r * 0.7);

    ctx.fillStyle = "#60a5fa";
    ctx.fillRect(-r * 0.4, -r * 0.2, r * 0.8, r * 0.6);

    ctx.fillStyle = "#93c5fd";
    ctx.fillRect(-r * 0.5, -r * 0.1, r * 0.2, r * 0.6);
    ctx.fillRect(r * 0.3, -r * 0.1, r * 0.2, r * 0.6);
    ctx.fillRect(-r * 0.3, r * 0.4, r * 0.2, r * 0.5);
    ctx.fillRect(r * 0.1, r * 0.4, r * 0.2, r * 0.5);

    ctx.fillStyle = "#fff";
    ctx.fillRect(-r * 0.25, -r * 0.8, r * 0.15, r * 0.15);
    ctx.fillRect(r * 0.1, -r * 0.8, r * 0.15, r * 0.15);

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(-r * 0.22, -r * 0.78, r * 0.1, r * 0.1);
    ctx.fillRect(r * 0.13, -r * 0.78, r * 0.1, r * 0.1);

    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.5, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawArrow = () => {
    if (state.input.state !== "charging") return;
    const dx = state.input.start.x - state.input.current.x;
    const dy = state.input.start.y - state.input.current.y;
    const rawDist = Math.hypot(dx, dy);
    if (rawDist < 1) return;

    const chargeRatio = Math.min(rawDist / config.maxCharge, 1);
    const visualLen = Math.min(rawDist, config.maxCharge);
    const dirLen = rawDist || 1;
    const dirX = dx / dirLen;
    const dirY = dy / dirLen;

    const colorT = chargeRatio;
    const color =
      colorT < 0.5
        ? lerpHex(COLORS.ARROW_LOW, COLORS.ARROW_MID, colorT * 2)
        : lerpHex(COLORS.ARROW_MID, COLORS.ARROW_HIGH, (colorT - 0.5) * 2);

    const from = { x: state.input.start.x, y: state.input.start.y };
    const to = { x: from.x + dirX * visualLen, y: from.y + dirY * visualLen };
    const len = Math.hypot(to.x - from.x, to.y - from.y);
    if (len < 2) return;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = Math.min(18, len * 0.4);
    const headW = headLen * 0.7;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = colorT >= 1 ? 0.85 : 1;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLen * Math.cos(angle) + headW * Math.cos(angle + Math.PI / 2),
      to.y - headLen * Math.sin(angle) + headW * Math.sin(angle + Math.PI / 2),
    );
    ctx.lineTo(
      to.x - headLen * Math.cos(angle) - headW * Math.cos(angle + Math.PI / 2),
      to.y - headLen * Math.sin(angle) - headW * Math.sin(angle + Math.PI / 2),
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawTrajectory = () => {
    if (!config.showTrajectory || state.input.state !== "charging") return;

    const screenToWorld = (sx, sy) => ({
      x: sx + state.camera.x - state.width / 2,
      y: sy + state.camera.y - state.height / 2,
    });

    const fromScreen = state.input.start;
    const fromWorld = screenToWorld(fromScreen.x, fromScreen.y);

    const dx = state.input.start.x - state.input.current.x;
    const dy = state.input.start.y - state.input.current.y;
    const rawDist = Math.hypot(dx, dy);
    if (rawDist < 1) return;

    const dirLen = rawDist || 1;
    const dirX = dx / dirLen;
    const dirY = dy / dirLen;

    const visualLen = Math.min(rawDist, config.maxCharge) * config.damping;
    const arrowTipWorldX = fromWorld.x + dirX * visualLen;
    const arrowTipWorldY = fromWorld.y + dirY * visualLen;

    const segments = [];
    let curWorldX = arrowTipWorldX;
    let curWorldY = arrowTipWorldY;
    let curDirX = dirX;
    let curDirY = dirY;
    const maxBounces = 5;
    const maxDist = 1000;
    const minHitDist = 2;

    for (let bounce = 0; bounce < maxBounces; bounce++) {
      let closestHit = null;
      let closestT = Infinity;

      const rayLen = maxDist / (bounce + 1);
      const rdx = curDirX * rayLen;
      const rdy = curDirY * rayLen;

      for (let i = 0; i < state.platforms.length; i++) {
        const box = state.platforms[i];
        const hit = rayAABB(curWorldX, curWorldY, rdx, rdy, box);
        if (hit && hit.t < closestT) {
          const hitDist = Math.hypot(hit.x - curWorldX, hit.y - curWorldY);
          if (hitDist >= minHitDist) {
            closestT = hit.t;
            closestHit = hit;
          }
        }
      }

      const worldW = state.width;
      if (rdx !== 0) {
        if (rdx < 0) {
          const t = (0 - curWorldX) / rdx;
          if (t >= 0 && t < closestT) {
            const hitDist = Math.abs(0 - curWorldX);
            if (hitDist >= minHitDist) {
              closestT = t;
              closestHit = { t, x: 0, y: curWorldY + rdy * t, nx: 1, ny: 0 };
            }
          }
        } else {
          const t = (worldW - curWorldX) / rdx;
          if (t >= 0 && t < closestT) {
            const hitDist = Math.abs(worldW - curWorldX);
            if (hitDist >= minHitDist) {
              closestT = t;
              closestHit = {
                t,
                x: worldW,
                y: curWorldY + rdy * t,
                nx: -1,
                ny: 0,
              };
            }
          }
        }
      }

      const curScreen = worldToScreen(curWorldX, curWorldY);

      if (closestHit && closestT <= 1) {
        const hitScreen = worldToScreen(closestHit.x, closestHit.y);
        segments.push({
          x1: curScreen.x,
          y1: curScreen.y,
          x2: hitScreen.x,
          y2: hitScreen.y,
        });

        const dot = curDirX * closestHit.nx + curDirY * closestHit.ny;
        curDirX -= 2 * dot * closestHit.nx;
        curDirY -= 2 * dot * closestHit.ny;

        curWorldX = closestHit.x + curDirX * 2;
        curWorldY = closestHit.y + curDirY * 2;
      } else {
        const endScreen = worldToScreen(
          curWorldX + curDirX * rayLen,
          curWorldY + curDirY * rayLen,
        );
        segments.push({
          x1: curScreen.x,
          y1: curScreen.y,
          x2: endScreen.x,
          y2: endScreen.y,
        });
        break;
      }
    }

    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    for (const seg of segments) {
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawHUD = () => {
    const p = state.player;
    const lines = [
      `分数 ${state.score}`,
      `最高 ${Math.floor(-state.maxHeight)} px`,
      `pos  (${p.x.toFixed(0)}, ${p.y.toFixed(0)})`,
      `vel  (${p.vx.toFixed(0)}, ${p.vy.toFixed(0)})`,
    ];
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.fillRect(state.width - 220, state.height - 96, 210, 88);
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = "12px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], state.width - 210, state.height - 88 + i * 18);
    }
  };

  const drawGameOver = () => {
    const cx = state.width / 2;
    const cy = state.height / 2;
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(cx - 150, cy - 80, 300, 160);
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("游戏结束", cx, cy - 30);
    ctx.font = "16px sans-serif";
    ctx.fillStyle = COLORS.PLAYER_BG;
    ctx.fillText(`最终分数: ${state.score}`, cx, cy + 10);
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = "14px sans-serif";
    ctx.fillText("点击任意位置重新开始", cx, cy + 50);
  };

  const render = () => {
    drawGrid();
    drawBoundary();

    const viewL = state.camera.x - state.width / 2 - 50;
    const viewR = state.camera.x + state.width / 2 + 50;
    const viewT = state.camera.y - state.height / 2 - 50;
    const viewB = state.camera.y + state.height / 2 + 50;

    for (let i = 0; i < state.platforms.length; i++) {
      const plat = state.platforms[i];
      if (
        plat.x + plat.w >= viewL &&
        plat.x <= viewR &&
        plat.y + plat.h >= viewT &&
        plat.y <= viewB
      ) {
        drawBox(
          plat,
          plat.isGround ? COLORS.GROUND : COLORS.OBSTACLE,
          plat.isGround ? COLORS.GROUND_EDGE : COLORS.OBSTACLE_EDGE,
        );
      }
    }

    drawPlayer();
    drawArrow();
    drawTrajectory();
    drawHUD();

    if (state.gameOver) {
      drawGameOver();
    }
  };

  const tick = (now) => {
    if (!running) return;
    if (!lastTime) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, 1 / 15);
    lastTime = now;

    if (!state.gameOver) {
      update(dt);
    }

    render();
    rafId = requestAnimationFrame(tick);
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    state.width = rect.width;
    state.height = rect.height;
    state.dpr = Math.min(dpr, 3);
    canvas.width = Math.floor(rect.width * state.dpr);
    canvas.height = Math.floor(rect.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  };

  const start = () => {
    if (running) return;
    running = true;
    lastTime = 0;

    state.platforms = [];
    const maxJumpHeight = calcMaxJumpHeight(config);
    let currentTop = 0;
    for (let i = 0; i < 20; i++) {
      const newPlatforms = generatePlatformLayer(
        currentTop,
        maxJumpHeight,
        state.platforms,
        state.width,
      );
      if (newPlatforms.length === 0) break;
      state.platforms.push(...newPlatforms);
      currentTop = state.platforms.reduce(
        (min, plat) => Math.min(min, plat.y),
        currentTop,
      );
    }

    state.player.x = state.width / 2;
    state.player.y = -state.player.r;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.isGrounded = true;
    state.camera.x = state.player.x;
    state.camera.y = -state.height / 2 + PHYSICS.PLATFORM_HEIGHT;
    state.score = 0;
    state.maxHeight = state.player.y;
    state.gameOver = false;

    rafId = requestAnimationFrame(tick);
  };

  const stop = () => {
    running = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  };

  const reset = () => {
    stop();
    state.platforms = [];
    state.input.state = "idle";
    start();
  };

  const getPlayerHeadScreenPos = () => {
    return worldToScreen(state.player.x, state.player.y - state.player.r);
  };

  const teleport = (x, y) => {
    state.player.x = Number(x);
    state.player.y = Number(y);
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.isGrounded = false;
    state.teleporting = 10;
    updatePlatforms();
  };

  return {
    start,
    stop,
    reset,
    resize,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    state,
    getPlayerHeadScreenPos,
    teleport,
  };
};
