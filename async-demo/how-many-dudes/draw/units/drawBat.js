import { circle, ellipse, line, triangle } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 10;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const wingFlap = Math.sin(t * (moving ? 0.03 : 0.015)) * s * 0.4;
  const bob = Math.sin(t * 0.01) * s * 0.12;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 200) : 0;

  const x = unit.x;
  const y = unit.y - bob;

  ctx.fillStyle = '#374151';
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - s * 0.8, y - s * 0.3 - wingFlap, x - s * 1.2, y + wingFlap * 0.3);
  ctx.quadraticCurveTo(x - s * 0.6, y + s * 0.1, x, y + s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#6b7280';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - s * 0.9, y - s * 0.2 - wingFlap * 0.7);
  ctx.stroke();

  ctx.fillStyle = '#374151';
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.8, y - s * 0.3 - wingFlap, x + s * 1.2, y + wingFlap * 0.3);
  ctx.quadraticCurveTo(x + s * 0.6, y + s * 0.1, x, y + s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#6b7280';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + s * 0.9, y - s * 0.2 - wingFlap * 0.7);
  ctx.stroke();

  ellipse(ctx, x, y, s * 0.35, s * 0.45, '#4b5563', '#1f2937', 1);
  triangle(ctx, x - s * 0.2, y - s * 0.35, x - s * 0.08, y - s * 0.35, x - s * 0.15, y - s * 0.6, '#374151', '#1f2937', 0.5);
  triangle(ctx, x + s * 0.08, y - s * 0.35, x + s * 0.2, y - s * 0.35, x + s * 0.15, y - s * 0.6, '#374151', '#1f2937', 0.5);

  const eyeGlow = 1 + atkProg * 0.8;
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = s * 0.2 * eyeGlow;
  circle(ctx, x - s * 0.1, y - s * 0.1, s * 0.05 * eyeGlow, '#ef4444', null);
  circle(ctx, x + s * 0.1, y - s * 0.1, s * 0.05 * eyeGlow, '#ef4444', null);
  ctx.shadowBlur = 0;

  triangle(ctx, x - s * 0.06, y + s * 0.1, x - s * 0.02, y + s * 0.1, x - s * 0.04, y + s * 0.22, '#fef3c7', null);
  triangle(ctx, x + s * 0.02, y + s * 0.1, x + s * 0.06, y + s * 0.1, x + s * 0.04, y + s * 0.22, '#fef3c7', null);
};
