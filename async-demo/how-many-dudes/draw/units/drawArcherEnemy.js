import { circle, ellipse, roundRect, line, triangle, arc } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 14;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const walkPhase = moving ? Math.sin(t * 0.018) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.018)) * s * 0.06 : Math.abs(Math.sin(t * 0.005)) * s * 0.04;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 300) : 0;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.15;

  line(ctx, x - s * 0.12, y + s * 0.2, x - s * 0.15 + legSwing, y + s * 0.6, s * 0.1, '#14532d');
  line(ctx, x + s * 0.12, y + s * 0.2, x + s * 0.15 - legSwing, y + s * 0.6, s * 0.1, '#14532d');

  roundRect(ctx, x - s * 0.22, y - s * 0.1, s * 0.44, s * 0.38, s * 0.06, '#15803d', '#14532d', 1);

  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.1);
  ctx.lineTo(x - s * 0.18, y - s * 0.5);
  ctx.quadraticCurveTo(x, y - s * 0.65, x + s * 0.18, y - s * 0.5);
  ctx.lineTo(x + s * 0.2, y - s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#052e16';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  circle(ctx, x, y - s * 0.3, s * 0.16, '#d1d5db', null);
  circle(ctx, x - dir * s * 0.06, y - s * 0.32, s * 0.025, '#15803d', null);
  circle(ctx, x + dir * s * 0.06, y - s * 0.32, s * 0.025, '#15803d', null);

  const bowX = x + dir * s * 0.35;
  const bowPull = atkProg * s * 0.15;
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = s * 0.05;
  ctx.beginPath();
  ctx.arc(bowX, y, s * 0.3, -Math.PI / 2.5, Math.PI / 2.5);
  ctx.stroke();
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(bowX + Math.cos(-Math.PI / 2.5) * s * 0.3, y + Math.sin(-Math.PI / 2.5) * s * 0.3);
  ctx.lineTo(bowX - dir * bowPull, y);
  ctx.lineTo(bowX + Math.cos(Math.PI / 2.5) * s * 0.3, y + Math.sin(Math.PI / 2.5) * s * 0.3);
  ctx.stroke();
  if (atkProg > 0) {
    line(ctx, bowX - dir * bowPull, y, bowX + dir * s * 0.35, y, s * 0.02, '#6b7280');
    triangle(ctx, bowX + dir * s * 0.35, y - s * 0.02, bowX + dir * s * 0.35, y + s * 0.02, bowX + dir * s * 0.42, y, '#9ca3af', null);
  }
};
