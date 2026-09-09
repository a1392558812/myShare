import {
  COLORS,
  CONFIG,
  WHALE_BODY,
  MONSTER_SPRITE,
  KRILL_SPRITE,
  HEAL_SPRITE,
  ENERGY_SPRITE,
  PUFFER_SPRITE,
  FISH_SPRITE,
  BARNACLE_SPRITE,
} from '../constants.js';

/** 点阵 sprite（居中，像素大小 px），可选 angle 绕中心旋转 */
const drawSprite = (ctx, rows, cx, cy, px, color, alpha = 1, angle = 0) => {
  const w = rows[0].length;
  const h = rows.length;
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy));
  if (angle) ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  const ox = Math.round(-(w * px) / 2);
  const oy = Math.round(-(h * px) / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rows[y][x] === 'X') ctx.fillRect(ox + x * px, oy + y * px, px, px);
    }
  }
  ctx.restore();
};

/** 墙 */
const drawWalls = (ctx, state) => {
  const { innerSegs, border, time } = state;
  ctx.lineCap = 'square';

  // 边界墙
  ctx.strokeStyle = COLORS.memoryWall;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  for (const w of border) {
    ctx.moveTo(w.x1, w.y1);
    ctx.lineTo(w.x2, w.y2);
  }
  ctx.stroke();

  // 内部墙：分段显形
  const seeAll = state.debug && state.debug.seeAll;
  for (const s of innerSegs) {
    let t;
    if (seeAll) {
      t = 0.85; 
    } else {
      if (!s.revealed) continue;
      const remain = (s.revealTime + CONFIG.wallMemoryMs - time) / CONFIG.wallMemoryMs;
      t = Math.max(0, Math.min(1, remain)) * s.strength;
    }
    if (t <= 0) continue;
    ctx.strokeStyle = COLORS.sonar;
    ctx.globalAlpha = t;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

/** 撞墙磕头晕光 */
const drawBump = (ctx, state) => {
  const p = state.player;
  const t = 1 - (state.time - p.bumpTime) / CONFIG.bumpGlowMs;
  if (t <= 0) return;
  const len = 26;
  const ax = p.bumpX - p.bumpDirX * len;
  const ay = p.bumpY - p.bumpDirY * len;
  const bx = p.bumpX + p.bumpDirX * len;
  const by = p.bumpY + p.bumpDirY * len;
  // 沿墙一小段高亮线
  ctx.strokeStyle = COLORS.sonarBright;
  ctx.lineWidth = 3;
  ctx.globalAlpha = t;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();
  // 碰撞点光斑
  ctx.fillStyle = COLORS.sonarBright;
  ctx.globalAlpha = t * 0.4;
  ctx.beginPath();
  ctx.arc(p.bumpX, p.bumpY, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = t * 0.7;
  ctx.beginPath();
  ctx.arc(p.bumpX, p.bumpY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
};

/** 声呐波纹 */
const drawPulses = (ctx, state) => {
  for (const p of state.pulses) {
    if (p.dead) continue;
    const alpha = 1 - p.r / CONFIG.sonarMaxRadius;
    ctx.strokeStyle = COLORS.sonar;
    ctx.globalAlpha = alpha * 0.6;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.ox, p.oy, p.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = COLORS.sonarBright;
    ctx.globalAlpha = alpha * 0.8;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.ox, p.oy, p.r - 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
};

/** 磷虾 */
const drawKrill = (ctx, state) => {
  const { krill, time } = state;
  const seeAll = state.debug && state.debug.seeAll;
  for (const k of krill) {
    if (k.eaten) continue;
    let alpha;
    if (seeAll) {
      alpha = 0.9;
    } else {
      if (!k.revealed || time >= k.revealUntil) continue;
      const remain = (k.revealUntil - time) / CONFIG.krillRevealMs;
      alpha = Math.min(1, remain * 2);
    }
    ctx.fillStyle = COLORS.krill;
    ctx.globalAlpha = alpha * 0.2;
    ctx.beginPath();
    ctx.arc(k.x, k.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha * 0.4;
    ctx.beginPath();
    ctx.arc(k.x, k.y, 9, 0, Math.PI * 2);
    ctx.fill();
    drawSprite(ctx, KRILL_SPRITE, k.x, k.y, 2, COLORS.krill, alpha);
  }
};

/** 海怪 */
const drawMonsters = (ctx, state) => {
  const seeAll = state.debug && state.debug.seeAll;
  for (const m of state.monsters) {
    const chasing = m.state === 'chase';
    if (!chasing && !seeAll) continue;
    ctx.fillStyle = COLORS.danger;
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 18, 0, Math.PI * 2);
    ctx.fill();
    drawSprite(ctx, MONSTER_SPRITE, m.x, m.y, 4, COLORS.danger);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(Math.round(m.x) - 5, Math.round(m.y) - 6, 4, 4);
    ctx.fillRect(Math.round(m.x) + 1, Math.round(m.y) - 6, 4, 4);
    ctx.globalAlpha = 1;
  }
};

const PICKUP_SPRITE = { heal: HEAL_SPRITE, energy: ENERGY_SPRITE, puffer: PUFFER_SPRITE };
const PICKUP_COLOR = { heal: COLORS.heal, energy: COLORS.energy, puffer: COLORS.puffer };

/** 拾取道具 */
const drawPickups = (ctx, state) => {
  const { pickups, time } = state;
  const seeAll = state.debug && state.debug.seeAll;
  for (const p of pickups) {
    if (p.taken) continue;
    let alpha;
    if (seeAll) {
      alpha = 0.9;
    } else {
      if (!p.revealed || time >= p.revealUntil) continue;
      const remain = (p.revealUntil - time) / CONFIG.krillRevealMs;
      alpha = Math.min(1, remain * 2);
    }
    const color = PICKUP_COLOR[p.type] || COLORS.white;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * 0.2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
    ctx.fill();
    const angle = p.type === 'puffer' ? p.wanderAngle : 0;
    drawSprite(ctx, PICKUP_SPRITE[p.type], p.x, p.y, 3, color, alpha, angle);
  }
  ctx.globalAlpha = 1;
};

/** 小鱼 */
const drawFish = (ctx, state) => {
  const { fish, time } = state;
  const seeAll = state.debug && state.debug.seeAll;
  for (const f of fish) {
    if (f.eaten) continue;
    let alpha;
    if (seeAll) {
      alpha = 0.9;
    } else {
      if (!f.revealed || time >= f.revealUntil) continue;
      const remain = (f.revealUntil - time) / CONFIG.krillRevealMs;
      alpha = Math.min(1, remain * 2);
    }
    drawSprite(ctx, FISH_SPRITE, f.x, f.y, 2, COLORS.fish, alpha);
  }
};

/**毒液藤壶 */
const drawBarnacles = (ctx, state) => {
  const { barnacles, time } = state;
  const seeAll = state.debug && state.debug.seeAll;
  for (const b of barnacles) {
    let alpha;
    if (seeAll) {
      alpha = 0.9;
    } else {
      if (!b.revealed || time >= b.revealUntil) continue;
      const remain = (b.revealUntil - time) / CONFIG.krillRevealMs;
      alpha = Math.min(1, remain * 2);
    }
    ctx.fillStyle = COLORS.barnacle;
    ctx.globalAlpha = alpha * 0.2;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 12, 0, Math.PI * 2);
    ctx.fill();
    drawSprite(ctx, BARNACLE_SPRITE, b.x, b.y, 2, COLORS.barnacle, alpha);
  }
  ctx.globalAlpha = 1;
};

/** 出口漩涡 */
const drawExit = (ctx, state) => {
  if (!state.exit.active) return;
  const { x, y } = state.exit;
  const pulse = 0.5 + 0.5 * Math.sin(state.time / 300);
  ctx.fillStyle = COLORS.white;
  ctx.globalAlpha = 0.06 + 0.04 * pulse;
  ctx.beginPath();
  ctx.arc(x, y, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.12 + 0.08 * pulse;
  ctx.beginPath();
  ctx.arc(x, y, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.sonarBright;
  ctx.globalAlpha = 0.8;
  for (let i = 0; i < 3; i++) {
    ctx.lineWidth = 2 - i * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, 10 + i * 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

/** 鲸鱼 */
const drawPlayer = (ctx, state) => {
  const p = state.player;
  const time = state.time;

  // 自发光晕
  ctx.fillStyle = COLORS.sonar;
  ctx.globalAlpha = 0.05;
  ctx.beginPath();
  ctx.arc(p.x, p.y, CONFIG.glowRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.08;
  ctx.beginPath();
  ctx.arc(p.x, p.y, CONFIG.glowRadius * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const dirX = p.faceX;
  const dirY = p.faceY;
  const perpX = -dirY;
  const perpY = dirX;
  const sway = Math.sin(time / 80) * 6;

  // 尾巴
  ctx.fillStyle = COLORS.sonarBright;
  for (let i = 1; i <= 3; i++) {
    const tx = p.x - dirX * (CONFIG.playerRadius + i * 5) + perpX * sway * (i / 3);
    const ty = p.y - dirY * (CONFIG.playerRadius + i * 5) + perpY * sway * (i / 3);
    ctx.fillRect(Math.round(tx) - 2, Math.round(ty) - 2, 4, 4);
  }

  // 身体
  drawSprite(ctx, WHALE_BODY, p.x, p.y, 4, COLORS.sonarBright);

  // 眼睛
  const eyeX = p.x + dirX * 6;
  const eyeY = p.y + dirY * 6;
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(Math.round(eyeX) - 2, Math.round(eyeY) - 2, 3, 3);

  // 冲刺拖尾
  if (time < p.dashUntil) {
    ctx.fillStyle = COLORS.sonarBright;
    for (let i = 1; i <= 4; i++) {
      ctx.globalAlpha = 0.25 * (1 - i / 5);
      ctx.beginPath();
      ctx.arc(p.x - p.dashDirX * i * 12, p.y - p.dashDirY * i * 12, CONFIG.playerRadius - i * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 冲刺冷却环：冷却中显示进度缺口，就绪时淡出并短暂闪烁提示
  const cd = state.dashCdRatio || 0;
  if (cd > 0) {
    ctx.strokeStyle = COLORS.sonar;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(p.x, p.y, CONFIG.playerRadius + 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - cd));
    ctx.stroke();
    ctx.globalAlpha = 1;
  } else {
    // 就绪：每 1.6s 闪一下提示可冲刺
    const readyPulse = 0.5 + 0.5 * Math.sin(time / 400);
    if (readyPulse > 0.75) {
      ctx.strokeStyle = COLORS.sonarBright;
      ctx.lineWidth = 2;
      ctx.globalAlpha = (readyPulse - 0.75) * 2 * 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, CONFIG.playerRadius + 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // 无敌帧闪烁
  if (time < p.invincibleUntil && Math.floor(time / 100) % 2 === 0) {
    drawSprite(ctx, WHALE_BODY, p.x, p.y, 4, COLORS.sonarBright, 0.4);
  }
};

/** 按住左键但处于能量打空锁时，在玩家头顶提示 */
const drawSonarBlockHint = (ctx, state) => {
  const p = state.player;
  if (!state.firing || state.canSonarNow) return;
  const blink = 0.6 + 0.4 * Math.sin(state.time / 120);
  ctx.fillStyle = COLORS.energy;
  ctx.globalAlpha = blink;
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('能量耗尽', p.x, p.y - CONFIG.playerRadius - 14);
  ctx.globalAlpha = 1;
};

/** HUD（能量条 / 血量 / 磷虾计数） */
const drawHud = (ctx, state, viewW) => {
  const { player } = state;
  const pad = 16;

  const segCount = 10;
  const segW = 10;
  const segH = 16;
  const gap = 2;
  const segTotal = segCount * (segW + gap);

  // 恐惧倒计时进度条
  const fearY = pad;
  const fearH = 10;
  const fearProgress = state.fearProgress;
  const fearColor = state.fearStage === 0 ? COLORS.fear : state.fearStage === 1 ? '#ff9d3b' : COLORS.danger;
  ctx.fillStyle = COLORS.bgLine;
  ctx.fillRect(pad - 4, fearY - 3, segTotal + 8, fearH + 6);
  ctx.fillStyle = fearColor;
  ctx.globalAlpha = 0.25 + fearProgress * 0.75;
  ctx.fillRect(pad, fearY, segTotal * fearProgress, fearH);
  ctx.globalAlpha = 1;
  ctx.fillStyle = fearColor;
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  // 罗马数字阶段
  const stage = Math.min(state.fearStage, 11);
  const stageRoman = String.fromCharCode(0x2160 + stage) + (state.fearStage > 11 ? '+' : '');
  ctx.fillText(`恐惧 ${stageRoman}`, pad + segTotal + 8, fearY + fearH / 2);

  const ex = pad;
  const ey = fearY + fearH + 14;
  const eMax = state.energyMax || CONFIG.maxEnergy;
  const filled = Math.round((player.energy / eMax) * segCount);
  // 需回能到该格数以上才能重新发声（energyMinFire / 动态上限）
  const fireSeg = Math.max(1, Math.round((CONFIG.energyMinFire / eMax) * segCount));

  ctx.fillStyle = COLORS.bgLine;
  ctx.fillRect(ex - 4, ey - 4, segTotal + 8, segH + 8);
  for (let i = 0; i < segCount; i++) {
    // 低于“可发声恢复线”的格子用暗红锁色，提示该段为发声禁区
    ctx.fillStyle = i < filled
      ? COLORS.sonar
      : i < fireSeg
        ? '#3a1020'
        : '#0d2433';
    ctx.fillRect(ex + i * (segW + gap), ey, segW, segH);
  }
  // 能量打空锁期间：整条回能中，边框/锁线低频闪烁提醒“正在回能、暂不可发声”
  if (state.sonarExhausted) {
    const blk = 0.5 + 0.5 * Math.sin(state.time / 150);
    ctx.globalAlpha = 0.4 + blk * 0.5;
    ctx.strokeStyle = COLORS.energy;
    ctx.lineWidth = 1.5;
    const thx = ex + fireSeg * (segW + gap) - gap / 2;
    ctx.beginPath();
    ctx.moveTo(thx, ey - 4);
    ctx.lineTo(thx, ey + segH + 4);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  const hy = ey + segH + 12;
  const showHearts = Math.min(player.hp, CONFIG.maxHp);
  for (let i = 0; i < CONFIG.maxHp; i++) {
    ctx.fillStyle = i < showHearts ? COLORS.danger : '#0d2433';
    ctx.fillRect(pad + i * 18, hy, 14, 14);
  }
  if (player.hp > CONFIG.maxHp) {
    ctx.fillStyle = COLORS.danger;
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`x${player.hp}`, pad + CONFIG.maxHp * 18 + 4, hy + 7);
  }

  const ky = hy + 24;
  ctx.fillStyle = COLORS.krill;
  ctx.fillRect(pad, ky, 10, 10);
  ctx.fillStyle = COLORS.white;
  ctx.font = '13px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  // 普通模式显示通关进度 x / y；无尽模式磷虾为无限刷分，krill.length 会漂移，只显示累计收集数
  const krillLabel = state.endless ? `${state.collected}` : `${state.collected} / ${state.krill.length}`;
  ctx.fillText(krillLabel, pad + 16, ky + 5);

  const fy = ky + 24;
  ctx.fillStyle = COLORS.fish;
  ctx.fillRect(pad, fy, 10, 10);
  ctx.fillStyle = COLORS.white;
  ctx.fillText(`${state.fishEatenCount} / ${CONFIG.fishPerReward}`, pad + 16, fy + 5);

  // 熟练度（无尽模式 DNA 加点货币）
  if (state.endless) {
    const py = fy + 24;
    ctx.fillStyle = '#b06cff'; // DNA 基因紫
    ctx.fillRect(pad, py, 10, 10);
    ctx.fillStyle = COLORS.white;
    ctx.fillText(`熟练 ${state.proficiency}`, pad + 16, py + 5);
  }
};

/**
 * 主渲染
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state - useGame.getState() 返回值
 * @param {number} viewW - 视口宽度（CSS 像素）
 * @param {number} viewH - 视口高度（CSS 像素）
 * @param {number} dpr - devicePixelRatio
 */
export const render = (ctx, state, viewW, viewH, dpr) => {
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.save();
  ctx.translate(-state.camera.x + viewW / 2, -state.camera.y + viewH / 2);

  drawWalls(ctx, state);
  drawBarnacles(ctx, state);
  drawPulses(ctx, state);
  drawKrill(ctx, state);
  drawPickups(ctx, state);
  drawFish(ctx, state);
  drawExit(ctx, state);
  drawMonsters(ctx, state);
  drawBump(ctx, state);
  drawPlayer(ctx, state);
  drawSonarBlockHint(ctx, state);

  ctx.restore();

  drawHud(ctx, state, viewW);
};
