import { circle, ellipse, line, triangle, arc } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 26;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const walkPhase = moving ? Math.sin(t * 0.008) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.008)) * s * 0.04 : Math.sin(t * 0.003) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 400) : 0;
  const slamProg = unit.lastSlamTime ? Math.max(0, 1 - (t - unit.lastSlamTime) / 400) : 0;
  const summonProg = unit.lastSummonTime ? Math.max(0, 1 - (t - unit.lastSummonTime) / 500) : 0;

  const x = unit.x;
  const y = unit.y - bob;

  ctx.fillStyle = 'rgba(13, 148, 136, 0.08)';
  circle(ctx, x, y, s * 1.2, 'rgba(13, 148, 136, 0.08)', null);

  const bodySway = Math.sin(t * 0.004) * s * 0.08;
  ctx.fillStyle = '#0f766e';
  ctx.strokeStyle = '#134e4a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y + s * 0.5);
  ctx.quadraticCurveTo(x - s * 0.4 + bodySway, y + s * 0.2, x - s * 0.2, y);
  ctx.quadraticCurveTo(x, y - s * 0.1, x + s * 0.2, y);
  ctx.quadraticCurveTo(x + s * 0.4 - bodySway, y + s * 0.2, x + s * 0.3, y + s * 0.5);
  ctx.quadraticCurveTo(x, y + s * 0.7, x - s * 0.3, y + s * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#14b8a6';
  for (let i = 0; i < 3; i++) {
    const sy = y + s * 0.15 + i * s * 0.12;
    const sx = x + Math.sin(t * 0.004 + i) * s * 0.05;
    ellipse(ctx, sx, sy, s * 0.12, s * 0.04, '#14b8a6', null);
  }

  const heads = [
    { offsetX: 0, offsetY: -s * 0.55, scale: 1, phase: 0 },
    { offsetX: -s * 0.35, offsetY: -s * 0.35, scale: 0.7, phase: 1 },
    { offsetX: s * 0.35, offsetY: -s * 0.35, scale: 0.7, phase: 2 },
  ];

  heads.forEach((h) => {
    const hx = x + h.offsetX + Math.sin(t * 0.006 + h.phase) * s * 0.03;
    const hy = y + h.offsetY + Math.cos(t * 0.006 + h.phase) * s * 0.02;
    const hs = s * h.scale;

    ctx.fillStyle = '#0f766e';
    ctx.strokeStyle = '#134e4a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hx - hs * 0.12, hy + hs * 0.3);
    ctx.lineTo(hx - hs * 0.08, hy + hs * 0.15);
    ctx.lineTo(hx + hs * 0.08, hy + hs * 0.15);
    ctx.lineTo(hx + hs * 0.12, hy + hs * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ellipse(ctx, hx, hy, hs * 0.22, hs * 0.16, '#0f766e', '#134e4a', 1.5);

    const eyeGlow = 1 + atkProg * 0.8 + Math.sin(t * 0.01 + h.phase) * 0.15;
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = hs * 0.15 * eyeGlow;
    circle(ctx, hx - dir * hs * 0.08, hy - hs * 0.02, hs * 0.035 * eyeGlow, '#fbbf24', null);
    circle(ctx, hx + dir * hs * 0.08, hy - hs * 0.02, hs * 0.035 * eyeGlow, '#fbbf24', null);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#000';
    ctx.fillRect(hx - dir * hs * 0.08 - hs * 0.005, hy - hs * 0.04, hs * 0.01, hs * 0.03);
    ctx.fillRect(hx + dir * hs * 0.08 - hs * 0.005, hy - hs * 0.04, hs * 0.01, hs * 0.03);

    const tongueOut = atkProg > 0.3;
    if (tongueOut) {
      const tipX = hx + dir * hs * 0.25;
      const tipY = hy + hs * 0.05;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hx + dir * hs * 0.18, hy);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + dir * hs * 0.04, tipY - hs * 0.02);
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX + dir * hs * 0.04, tipY + hs * 0.02);
      ctx.stroke();
    }
  });

  ctx.fillStyle = '#134e4a';
  for (let i = 0; i < 4; i++) {
    const fx = x - s * 0.2 + i * s * 0.13;
    const fy = y - s * 0.05 + Math.abs(i - 1.5) * s * 0.03;
    triangle(ctx, fx - s * 0.04, fy + s * 0.06, fx + s * 0.04, fy + s * 0.06, fx, fy - s * 0.1, '#134e4a', null);
  }

  if (slamProg > 0) {
    ctx.strokeStyle = `rgba(13, 148, 136, ${slamProg * 0.6})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, s * (0.6 + slamProg * 0.6), 0, Math.PI * 2);
    ctx.stroke();
  }

  if (summonProg > 0) {
    for (let i = 0; i < 4; i++) {
      const ang = (Math.PI * 2 * i) / 4 + t * 0.008;
      const r = s * 0.7 * summonProg;
      ctx.strokeStyle = `rgba(13, 148, 136, ${summonProg * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + Math.cos(ang) * r, y + Math.sin(ang) * r, s * 0.06, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
};
