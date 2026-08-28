import { circle, ellipse, line, triangle, arc } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 18;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const floatBob = Math.sin(t * 0.003) * s * 0.05;
  const walkPhase = moving ? Math.sin(t * 0.008) : 0;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 400) : 0;
  const summonProg = unit.lastSummonTime ? Math.max(0, 1 - (t - unit.lastSummonTime) / 500) : 0;
  const robeSway = Math.sin(t * 0.005) * s * 0.04 + walkPhase * s * 0.06;
  const orbPulse = 1 + Math.sin(t * 0.007) * 0.2 + atkProg * 0.5;

  const x = unit.x;
  const y = unit.y - floatBob;

  if (summonProg > 0) {
    ctx.fillStyle = `rgba(88, 28, 135, ${summonProg * 0.15})`;
    circle(ctx, x, y + s * 0.4, s * 1.2 * summonProg, `rgba(88, 28, 135, ${summonProg * 0.15})`, null);
    for (let i = 0; i < 3; i++) {
      const ang = t * 0.01 + (Math.PI * 2 * i) / 3;
      const r = s * 0.6 * summonProg;
      ctx.strokeStyle = `rgba(168, 85, 247, ${summonProg * 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + Math.cos(ang) * r, y + s * 0.4 + Math.sin(ang) * r, s * 0.08, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.fillStyle = '#1e1b2e';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.35, y - s * 0.15);
  ctx.lineTo(x - s * (0.45 + robeSway * 0.3), y + s * 0.9);
  ctx.quadraticCurveTo(x - s * 0.2, y + s * 1.0, x, y + s * 0.9);
  ctx.quadraticCurveTo(x + s * 0.2, y + s * 1.0, x + s * (0.45 - robeSway * 0.3), y + s * 0.9);
  ctx.lineTo(x + s * 0.35, y - s * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0f0a1e';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(x - s * 0.3, y + s * 0.2, s * 0.6, s * 0.08);
  circle(ctx, x, y + s * 0.24, s * 0.05, '#1e1b2e', null);
  circle(ctx, x - dir * s * 0.04, y + s * 0.23, s * 0.015, '#1e1b2e', null);
  circle(ctx, x + dir * s * 0.04, y + s * 0.23, s * 0.015, '#1e1b2e', null);

  circle(ctx, x, y - s * 0.45, s * 0.26, '#e2e8f0', '#94a3b8', 1.5);
  const eyeGlow = 1 + atkProg * 1.5 + Math.sin(t * 0.008) * 0.2;
  ctx.fillStyle = '#a855f7';
  ctx.shadowColor = '#a855f7';
  ctx.shadowBlur = s * 0.3 * eyeGlow;
  circle(ctx, x - dir * s * 0.09, y - s * 0.48, s * 0.05 * eyeGlow, '#a855f7', null);
  circle(ctx, x + dir * s * 0.09, y - s * 0.48, s * 0.05 * eyeGlow, '#a855f7', null);
  ctx.shadowBlur = 0;
  triangle(ctx, x - s * 0.02, y - s * 0.4, x + s * 0.02, y - s * 0.4, x, y - s * 0.32, '#475569', null);
  ctx.fillStyle = '#475569';
  ctx.fillRect(x - s * 0.1, y - s * 0.34, s * 0.2, s * 0.03);
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x - s * 0.09 + i * s * 0.05, y - s * 0.34, s * 0.02, s * 0.05);
  }

  ctx.fillStyle = '#0f0a1e';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.34, y - s * 0.3);
  ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.75, x, y - s * 0.85);
  ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.75, x + s * 0.34, y - s * 0.3);
  ctx.lineTo(x + s * 0.28, y - s * 0.2);
  ctx.lineTo(x - s * 0.28, y - s * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#581c87';
  ctx.lineWidth = 1;
  ctx.stroke();

  const staffX = x + dir * s * 0.45;
  const staffLift = atkProg * s * 0.15;
  line(ctx, staffX, y + s * 0.6, staffX, y - s * (0.75 + staffLift), s * 0.07, '#1c0a0a');
  const orbX = staffX;
  const orbY = y - s * (0.85 + staffLift);
  circle(ctx, orbX, orbY, s * 0.12, '#e2e8f0', '#475569', 1);
  circle(ctx, orbX - dir * s * 0.04, orbY, s * 0.025, '#a855f7', null);
  circle(ctx, orbX + dir * s * 0.04, orbY, s * 0.025, '#a855f7', null);
  ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 + atkProg * 0.4})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(orbX, orbY, s * 0.18 * orbPulse, t * 0.005 % (Math.PI * 2), t * 0.005 % (Math.PI * 2) + Math.PI * 1.5);
  ctx.stroke();

  for (let i = 0; i < 4; i++) {
    const ang = t * 0.003 + (Math.PI * 2 * i) / 4;
    const r = s * 0.5;
    const px = x + Math.cos(ang) * r;
    const py = y + s * 0.3 + Math.sin(ang) * s * 0.4;
    ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
    circle(ctx, px, py, s * 0.03, 'rgba(168, 85, 247, 0.3)', null);
  }
};
