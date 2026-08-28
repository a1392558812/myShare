import { circle, ellipse, line, triangle, arc } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 36;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const floatBob = Math.sin(t * 0.003) * s * 0.08;
  const walkPhase = moving ? Math.sin(t * 0.008) : 0;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 500) : 0;
  const armSway = Math.sin(t * 0.004) * s * 0.03;

  const x = unit.x;
  const y = unit.y - floatBob;

  const pulse = Math.sin(t / 300) * 0.05 + 1;
  ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
  circle(ctx, x, y, s * 1.2 * pulse, 'rgba(251, 191, 36, 0.08)', null);
  ctx.fillStyle = 'rgba(251, 191, 36, 0.05)';
  circle(ctx, x, y, s * 1.5 * pulse, 'rgba(251, 191, 36, 0.05)', null);

  const rayCount = 8 + Math.floor(atkProg * 4);
  ctx.strokeStyle = `rgba(251, 191, 36, ${0.2 + atkProg * 0.3})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < rayCount; i++) {
    const angle = (Math.PI * 2 * i) / rayCount + t / 2000;
    const r1 = s * 0.9;
    const r2 = s * (1.3 + Math.sin(t / 500 + i) * 0.1) + atkProg * s * 0.2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * r1, y + Math.sin(angle) * r1);
    ctx.lineTo(x + Math.cos(angle) * r2, y + Math.sin(angle) * r2);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
  for (let i = 0; i < 5; i++) {
    const cx = x - s * 0.5 + i * s * 0.25;
    const cy = y + s * 0.9 + Math.sin(t / 400 + i) * s * 0.05;
    circle(ctx, cx, cy, s * 0.18, 'rgba(226, 232, 240, 0.3)', null);
  }

  const robeSway = walkPhase * s * 0.04;
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.35, y - s * 0.2);
  ctx.lineTo(x - s * (0.2 + robeSway), y + s * 0.7);
  ctx.lineTo(x + s * (0.2 - robeSway), y + s * 0.7);
  ctx.lineTo(x + s * 0.35, y - s * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.1);
  ctx.lineTo(x, y + s * 0.6);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const ly = y + s * 0.1 + i * s * 0.2;
    const lw = s * 0.25 - i * s * 0.05;
    line(ctx, x - lw, ly, x + lw, ly, 1, 'rgba(255, 255, 255, 0.3)');
  }

  const armRaise = atkProg * s * 0.15;
  line(ctx, x - s * 0.3, y - s * 0.1, x - s * (0.55 + armRaise * 0.2), y - s * (0.3 + armRaise), s * 0.1, '#fbbf24');
  circle(ctx, x - s * (0.55 + armRaise * 0.2), y - s * (0.3 + armRaise), s * 0.08, '#fde68a', '#d97706', 1);
  line(ctx, x + s * 0.3, y - s * 0.1, x + s * (0.55 - armRaise * 0.2), y - s * (0.3 + armRaise), s * 0.1, '#fbbf24');
  circle(ctx, x + s * (0.55 - armRaise * 0.2), y - s * (0.3 + armRaise), s * 0.08, '#fde68a', '#d97706', 1);

  const scepterX = x + s * (0.55 - armRaise * 0.2);
  const scepterLift = armRaise;
  line(ctx, scepterX, y - s * (0.2 + scepterLift), scepterX, y - s * (0.95 + scepterLift * 1.5), s * 0.08, '#d97706');
  const orbX = scepterX;
  const orbY = y - s * (1.05 + scepterLift * 1.5);
  const orbGlow = 1 + atkProg * 1.5 + Math.sin(t * 0.006) * 0.2;
  ctx.fillStyle = `rgba(254, 243, 199, ${0.3 + atkProg * 0.4})`;
  circle(ctx, orbX, orbY, s * 0.2 * orbGlow, `rgba(254, 243, 199, ${0.3 + atkProg * 0.4})`, null);
  circle(ctx, orbX, orbY, s * 0.12, '#fef3c7', '#d97706', 2);
  if (atkProg > 0.1) {
    ctx.fillStyle = `rgba(254, 243, 199, ${atkProg * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(orbX - s * 0.2, orbY);
    ctx.lineTo(orbX + s * 0.2, orbY);
    ctx.lineTo(orbX + s * 0.1, orbY - s * atkProg * 0.8);
    ctx.lineTo(orbX - s * 0.1, orbY - s * atkProg * 0.8);
    ctx.closePath();
    ctx.fill();
  }

  circle(ctx, x, y - s * 0.5, s * 0.3, '#fef3c7', '#d97706', 2);
  ctx.fillStyle = '#92400e';
  if (atkProg > 0.3) {
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x - dir * s * 0.1, y - s * 0.55, s * 0.05, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + dir * s * 0.1, y - s * 0.55, s * 0.05, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else {
    circle(ctx, x - dir * s * 0.1, y - s * 0.55, s * 0.04, '#92400e', null);
    circle(ctx, x + dir * s * 0.1, y - s * 0.55, s * 0.04, '#92400e', null);
  }
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.42, s * 0.08, 0.3, Math.PI - 0.3);
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.28, y - s * 0.75);
  ctx.lineTo(x - s * 0.28, y - s * 0.85);
  ctx.lineTo(x - s * 0.18, y - s * 0.95);
  ctx.lineTo(x - s * 0.08, y - s * 0.82);
  ctx.lineTo(x, y - s * 1.0);
  ctx.lineTo(x + s * 0.08, y - s * 0.82);
  ctx.lineTo(x + s * 0.18, y - s * 0.95);
  ctx.lineTo(x + s * 0.28, y - s * 0.85);
  ctx.lineTo(x + s * 0.28, y - s * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const gemGlow = 1 + Math.sin(t * 0.006) * 0.2;
  circle(ctx, x, y - s * 0.82, s * 0.05 * gemGlow, '#dc2626', '#7f1d1d', 1);
  circle(ctx, x - s * 0.18, y - s * 0.8, s * 0.03, '#3b82f6', '#1e3a8a', 1);
  circle(ctx, x + s * 0.18, y - s * 0.8, s * 0.03, '#3b82f6', '#1e3a8a', 1);

  ctx.fillStyle = `rgba(254, 243, 199, ${0.15 + atkProg * 0.3})`;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, y - s * 1.0);
  ctx.lineTo(x + s * 0.15, y - s * 1.0);
  ctx.lineTo(x + s * (0.08 + atkProg * 0.1), y - s * (1.5 + atkProg * 0.3));
  ctx.lineTo(x - s * (0.08 + atkProg * 0.1), y - s * (1.5 + atkProg * 0.3));
  ctx.closePath();
  ctx.fill();
};
