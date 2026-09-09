import { CELL } from '../config/paths.js';
import { TOWER_KIND } from '../config/towers.js';
import { roundRect, circle, rect, line, triangle, arc } from './units/helpers.js';
import drawSummon from './units/drawSummon.js';

const SKILL_COLOR = {
  arrowRain: '#a855f7',
  heal: '#22c55e',
  chainLightning: '#a78bfa',
  ultimateBeam: '#fbbf24',
  bloodPact: '#f472b6',
};

const drawLevelBadge = (ctx, x, y, level) => {
  const w = 17, h = 10;
  const bx = x + CELL / 2 - w - 1;
  const by = y - CELL / 2 + 1;
  ctx.save();
  roundRect(ctx, bx, by, w, h, 2, 'rgba(2, 8, 15, 0.9)', 'rgba(62, 230, 216, 0.8)', 1);
  ctx.fillStyle = '#7df3ff';
  ctx.font = 'bold 7px Menlo, Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`L${level}`, bx + w / 2, by + h / 2 + 0.5);
  ctx.restore();
};

const drawBase = (ctx, x, y, ringColor, level = 0) => {
  ctx.save();
  if (level >= 3) {
    const g = ctx.createRadialGradient(x, y, 4, x, y, 20);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  roundRect(ctx, x - 15, y - 15, 30, 30, 6, 'rgba(15, 23, 42, 0.92)', 'rgba(148, 163, 184, 0.35)', 1.5);
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.stroke();
  if (level >= 4) {
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 14.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (level > 0) {
    ctx.fillStyle = ringColor;
    for (let i = 0; i < level; i++) {
      const a = -Math.PI / 2 + i * (Math.PI / 4);
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 13, y + Math.sin(a) * 13, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
};

const drawBarracks = (ctx, t, time) => {
  const x = t.gx * CELL + CELL / 2;
  const y = t.gy * CELL + CELL / 2;
  const lv = t.level || 0;
  drawBase(ctx, x, y, t.def.ringColor, lv);
  ctx.save();
  ctx.translate(x, y);
  if (lv >= 2) rect(ctx, -13, 4, 26, 6, '#475569', '#64748b', 1);
  const bh = 12 + (lv >= 1 ? 3 : 0);
  rect(ctx, -8, -8, 16, bh, t.def.color, t.def.ringColor, 1.5);
  const roofY = -15 - (lv >= 1 ? 2 : 0);
  triangle(ctx, -10, -8, 10, -8, 0, roofY, lv >= 5 ? '#fbbf24' : '#047857', t.def.ringColor, 1.5);
  rect(ctx, -2, -3, 4, 7, '#0f172a');
  if (lv >= 1) rect(ctx, -6, -6, 3, 3, '#fde68a');
  if (lv >= 3) rect(ctx, 3, -6, 3, 3, '#fde68a');
  if (lv >= 2) triangle(ctx, -15, 5, -8, 5, -11.5, -2, '#065f46', '#34d399', 1);
  if (lv >= 4) triangle(ctx, 8, 5, 15, 5, 11.5, -2, '#065f46', '#34d399', 1);
  const sway = Math.sin(time * 0.004) * 2;
  line(ctx, 8, -8, 8, -18, 1.5, '#e2e8f0');
  triangle(ctx, 8, -18, 8 + 6 + sway, -16, 8, -14, lv >= 5 ? '#fbbf24' : '#34d399', '#92400e', 1);
  if (lv >= 5) {
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(-5, roofY - 2);
    ctx.lineTo(-5, roofY - 6);
    ctx.lineTo(-2.5, roofY - 4);
    ctx.lineTo(0, roofY - 7);
    ctx.lineTo(2.5, roofY - 4);
    ctx.lineTo(5, roofY - 6);
    ctx.lineTo(5, roofY - 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  drawLevelBadge(ctx, x, y, lv + 1);
};

const drawCannon = (ctx, t) => {
  const x = t.gx * CELL + CELL / 2;
  const y = t.gy * CELL + CELL / 2;
  const lv = t.level || 0;
  drawBase(ctx, x, y, t.def.ringColor, lv);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t.turretAngle || 0);
  const barrels = lv >= 1 ? 2 : 1;
  const bLen = 15 + (lv >= 3 ? 3 : 0);
  const bColor = lv >= 5 ? '#f59e0b' : t.def.color;
  for (let i = 0; i < barrels; i++) {
    const off = barrels === 1 ? 0 : (i === 0 ? -3.5 : 3.5);
    rect(ctx, -2, off - 3, bLen, 6, bColor, t.def.ringColor, 1.2);
  }
  rect(ctx, bLen - 5, barrels === 1 ? -5 : -7, 4, barrels === 1 ? 10 : 14, '#1e293b', '#94a3b8', 1);
  circle(ctx, 1, 0, 4.5, t.def.iconColor);
  circle(ctx, 1, 0, 2, '#fff', undefined, 1);
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  if (lv >= 2) {
    rect(ctx, -12, -13, 5, 8, '#7f1d1d', '#fca5a5', 1);
    rect(ctx, 7, -13, 5, 8, '#7f1d1d', '#fca5a5', 1);
    ctx.fillStyle = 'rgba(251, 146, 60, 0.55)';
    ctx.beginPath();
    ctx.arc(-9.5, -13, 1.8, 0, Math.PI * 2);
    ctx.arc(9.5, -13, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  if (lv >= 3) {
    rect(ctx, -15, -5, 3, 11, '#475569', '#94a3b8', 1);
    rect(ctx, 12, -5, 3, 11, '#475569', '#94a3b8', 1);
    arc(ctx, 0, 0, 14, -0.7, 0.7, 1.5, 'rgba(251, 146, 60, 0.8)');
  }
  if (lv >= 4) {
    ctx.fillStyle = 'rgba(248, 113, 113, 0.9)';
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + i * (Math.PI / 2);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 11, Math.sin(a) * 11, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (lv >= 5) circle(ctx, 0, -13, 2.6, '#fde047', '#b45309', 0.8);
  ctx.restore();
  drawLevelBadge(ctx, x, y, lv + 1);
};

const drawArrow = (ctx, t) => {
  const x = t.gx * CELL + CELL / 2;
  const y = t.gy * CELL + CELL / 2;
  const lv = t.level || 0;
  drawBase(ctx, x, y, t.def.ringColor, lv);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t.turretAngle || 0);
  const arms = lv >= 1 ? 2 : 1;
  const aColor = lv >= 5 ? '#fbbf24' : t.def.color;
  for (let i = 0; i < arms; i++) {
    const off = arms === 1 ? 0 : (i === 0 ? -3 : 3);
    rect(ctx, -3, off - 2.5, 12, 5, aColor, t.def.ringColor, 1.2);
    triangle(ctx, 9, off - 4, 15 + (lv >= 2 ? 2 : 0), off, 9, off + 4, t.def.iconColor, t.def.ringColor, 1);
  }
  rect(ctx, 6, -8, 2, 16, '#92400e', '#78350f', 1);
  line(ctx, 6, -8, 4, 0, 1, '#cbd5e1');
  line(ctx, 4, 0, 6, 8, 1, '#cbd5e1');
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  if (lv >= 2) {
    ctx.fillStyle = '#b45309';
    for (let i = 0; i < 4; i++) ctx.fillRect(-14 + i * 8, -15, 5, 4);
  }
  if (lv >= 3) {
    rect(ctx, -13, -4, 4, 8, '#b45309', '#78350f', 1);
    rect(ctx, 9, -4, 4, 8, '#b45309', '#78350f', 1);
  }
  if (lv >= 4) {
    line(ctx, -10, 4, -10, -10, 1.5, '#e2e8f0');
    triangle(ctx, -10, -10, -3, -8, -10, -6, '#fbbf24', '#78350f', 1);
  }
  if (lv >= 5) {
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 16);
    g.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    g.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  drawLevelBadge(ctx, x, y, lv + 1);
};

const drawTech = (ctx, t) => {
  const x = t.gx * CELL + CELL / 2;
  const y = t.gy * CELL + CELL / 2;
  const lv = t.level || 0;
  drawBase(ctx, x, y, t.def.ringColor, lv);
  ctx.save();
  ctx.translate(x, y);
  const angle = (t.auraTick || 0) * 0.05;
  ctx.rotate(angle);
  ctx.strokeStyle = t.def.iconColor;
  ctx.lineWidth = 1.5;
  const ringCount = 1 + Math.floor(lv / 2);
  for (let i = 0; i < ringCount; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, 8 + i * 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.rotate(-angle);
  const coreSize = 3 + lv * 0.4;
  rect(ctx, -coreSize, -coreSize, coreSize * 2, coreSize * 2, t.def.color, '#f5f3ff', 1);
  if (lv >= 1) circle(ctx, Math.cos(angle * 2) * 14, Math.sin(angle * 2) * 14, 1.6, t.def.iconColor);
  if (lv >= 2) {
    ctx.strokeStyle = t.def.ringColor;
    ctx.lineWidth = 2;
    const emitters = lv >= 3 ? 6 : 3;
    for (let i = 0; i < emitters; i++) {
      const a = -angle * 2 + i * (Math.PI * 2 / emitters);
      line(ctx, Math.cos(a) * 6, Math.sin(a) * 6, Math.cos(a) * 12, Math.sin(a) * 12, 2, t.def.ringColor);
    }
  }
  if (lv >= 4) {
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(233, 213, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 15, angle * 2, angle * 2 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (lv >= 5) {
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 16);
    g.addColorStop(0, 'rgba(192, 132, 252, 0.5)');
    g.addColorStop(1, 'rgba(192, 132, 252, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  if (t.skillKind && SKILL_COLOR[t.skillKind]) {
    ctx.fillStyle = SKILL_COLOR[t.skillKind];
    ctx.beginPath();
    ctx.arc(0, -14, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();
  drawLevelBadge(ctx, x, y, lv + 1);
};

const drawDetector = (ctx, t) => {
  const x = t.gx * CELL + CELL / 2;
  const y = t.gy * CELL + CELL / 2;
  const lv = t.level || 0;
  drawBase(ctx, x, y, t.def.ringColor, lv);
  ctx.save();
  ctx.translate(x, y);
  const mastTop = -9 - Math.min(lv, 5) * 1.6;
  const dishR = 3.6 + lv * 0.6;
  rect(ctx, -1, mastTop, 2, 13 + Math.min(lv, 5) * 1.6, t.def.color, t.def.ringColor, 1);
  circle(ctx, 0, mastTop, dishR, lv >= 5 ? '#fbbf24' : t.def.iconColor, t.def.ringColor, 1.5);
  ctx.fillStyle = t.def.color;
  ctx.fillRect(-8, 3, 16, 2);
  ctx.fillStyle = t.def.ringColor;
  const sweepCount = 5 + lv * 2;
  for (let i = 0; i < sweepCount; i++) {
    const a = (t.auraTick || 0) * 0.04 + i * (Math.PI * 2 / sweepCount);
    ctx.strokeStyle = t.def.iconColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mastTop);
    ctx.lineTo(Math.cos(a) * (7 + lv), mastTop + Math.sin(a) * (7 + lv));
    ctx.stroke();
  }
  if (lv >= 2) {
    ctx.fillStyle = '#4ade80';
    for (let i = 0; i < 3; i++) {
      const a = (t.auraTick || 0) * 0.02 + i * (Math.PI * 2 / 3);
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 11, Math.sin(a) * 11, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(74, 222, 128, 0.18)';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  if (lv >= 3) {
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, mastTop, 9 + lv, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (lv >= 4) {
    const g = ctx.createRadialGradient(0, mastTop, 1, 0, mastTop, 13);
    g.addColorStop(0, 'rgba(34, 211, 238, 0.4)');
    g.addColorStop(1, 'rgba(34, 211, 238, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, mastTop, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  if (lv >= 5) {
    line(ctx, 0, mastTop - dishR, 0, mastTop - dishR - 5, 1.5, '#fbbf24');
    circle(ctx, 0, mastTop - dishR - 6, 1.6, '#fde047');
  }
  ctx.restore();
  drawLevelBadge(ctx, x, y, lv + 1);
};

const drawRallyFlag = (ctx, t, time) => {
  if (!t.rally) return;
  const x = t.rally.gx * CELL + CELL / 2;
  const y = t.rally.gy * CELL + CELL / 2;
  const sway = Math.sin(time * 0.004) * 1.5;
  ctx.save();
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(t.gx * CELL + CELL / 2, t.gy * CELL + CELL / 2);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.setLineDash([]);
  line(ctx, x, y, x, y - 12, 1.5, '#e2e8f0');
  triangle(ctx, x, y - 12, x + 7 + sway, y - 10, x, y - 8, '#34d399', '#065f46', 1);
  ctx.restore();
};

export const drawTowers = (ctx, state) => {
  for (const t of state.towers) {
    switch (t.kind) {
      case TOWER_KIND.BARRACKS: drawBarracks(ctx, t, state.time); break;
      case TOWER_KIND.CANNON: drawCannon(ctx, t); break;
      case TOWER_KIND.ARROW: drawArrow(ctx, t); break;
      case TOWER_KIND.TECH: drawTech(ctx, t); break;
      case TOWER_KIND.DETECTOR: drawDetector(ctx, t); break;
    }
  }
  for (const t of state.towers) {
    if (t.kind === TOWER_KIND.BARRACKS) drawRallyFlag(ctx, t, state.time);
  }
  for (const s of state.summons) drawSummon(ctx, s, state.time, s.facing || 1);
};

export const drawSelectedTowerUI = (ctx, state) => {
  const t = state.selectedTower;
  if (!t) return;
  ctx.save();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(t.gx * CELL + 2, t.gy * CELL + 2, CELL - 4, CELL - 4);
  ctx.setLineDash([]);
  ctx.restore();
};
