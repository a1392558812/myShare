import { circle, roundRect, line } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 16;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const walkPhase = moving ? Math.sin(t * 0.02) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.02)) * s * 0.08 : Math.abs(Math.sin(t * 0.006)) * s * 0.05;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 250) : 0;
  const slingPull = atkProg * s * 0.2;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.2;

  line(ctx, x - s * 0.15, y + s * 0.2, x - s * 0.18 + legSwing, y + s * 0.7, s * 0.12, '#1e3a5f');
  line(ctx, x + s * 0.15, y + s * 0.2, x + s * 0.18 - legSwing, y + s * 0.7, s * 0.12, '#1e3a5f');

  roundRect(ctx, x - s * 0.25, y - s * 0.15, s * 0.5, s * 0.4, s * 0.08, '#fbbf24', '#d97706', 1);

  circle(ctx, x, y - s * 0.45, s * 0.28, '#fde68a', '#d97706', 1);

  const hairSway = walkPhase * s * 0.03;
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.28 + hairSway, y - s * 0.55);
  ctx.lineTo(x - s * 0.2 + hairSway, y - s * 0.8);
  ctx.lineTo(x - s * 0.1 + hairSway * 0.5, y - s * 0.65);
  ctx.lineTo(x, y - s * 0.82);
  ctx.lineTo(x + s * 0.1 - hairSway * 0.5, y - s * 0.65);
  ctx.lineTo(x + s * 0.2 - hairSway, y - s * 0.8);
  ctx.lineTo(x + s * 0.28 - hairSway, y - s * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1c1917';
  circle(ctx, x - dir * s * 0.08, y - s * 0.48, s * 0.04, '#1c1917', null);
  circle(ctx, x + dir * s * 0.08, y - s * 0.48, s * 0.04, '#1c1917', null);
  ctx.strokeStyle = '#9f1239';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.35, s * 0.1, 0.3, Math.PI - 0.3);
  ctx.stroke();
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(x - s * 0.03, y - s * 0.3, s * 0.03, s * 0.05);

  const slingX = x + dir * s * 0.4;
  line(ctx, x + dir * s * 0.2, y - s * 0.05, slingX, y - s * 0.1, s * 0.06, '#92400e');
  line(ctx, slingX, y - s * 0.1, slingX + dir * s * 0.05, y - s * 0.25, s * 0.05, '#92400e');
  line(ctx, slingX, y - s * 0.1, slingX - dir * s * 0.05, y - s * 0.25, s * 0.05, '#92400e');
  const pullX = slingX - dir * slingPull;
  line(ctx, slingX + dir * s * 0.05, y - s * 0.25, pullX, y - s * 0.15 - slingPull, 1, '#7f1d1d');
  line(ctx, slingX - dir * s * 0.05, y - s * 0.25, pullX, y - s * 0.15 - slingPull, 1, '#7f1d1d');
  if (atkProg > 0) {
    circle(ctx, pullX, y - s * 0.15 - slingPull, s * 0.04, '#451a03', null);
  }
};
