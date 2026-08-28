import { circle, ellipse, roundRect, line, triangle } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 18;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const walkPhase = moving ? Math.sin(t * 0.006) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.006)) * s * 0.03 : Math.sin(t * 0.002) * s * 0.01;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 400) : 0;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.06;

  roundRect(ctx, x - s * 0.22 + legSwing, y + s * 0.35, s * 0.18, s * 0.3, s * 0.04, '#334155', '#1e293b', 1);
  roundRect(ctx, x + s * 0.04 - legSwing, y + s * 0.35, s * 0.18, s * 0.3, s * 0.04, '#334155', '#1e293b', 1);

  roundRect(ctx, x - s * 0.35, y - s * 0.15, s * 0.7, s * 0.55, s * 0.08, '#475569', '#334155', 2);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.1);
  ctx.lineTo(x, y + s * 0.35);
  ctx.stroke();
  ellipse(ctx, x - s * 0.38, y - s * 0.05, s * 0.14, s * 0.12, '#64748b', '#334155', 1.5);
  ellipse(ctx, x + s * 0.38, y - s * 0.05, s * 0.14, s * 0.12, '#64748b', '#334155', 1.5);

  const shieldX = x - dir * s * 0.5;
  const shieldY = y + s * 0.1;
  ctx.fillStyle = '#64748b';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(shieldX, shieldY - s * 0.35);
  ctx.lineTo(shieldX + dir * s * 0.3, shieldY - s * 0.25);
  ctx.lineTo(shieldX + dir * s * 0.3, shieldY + s * 0.15);
  ctx.lineTo(shieldX, shieldY + s * 0.35);
  ctx.lineTo(shieldX - dir * s * 0.3, shieldY + s * 0.15);
  ctx.lineTo(shieldX - dir * s * 0.3, shieldY - s * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  line(ctx, shieldX, shieldY - s * 0.2, shieldX, shieldY + s * 0.2, s * 0.04, '#94a3b8');
  line(ctx, shieldX - dir * s * 0.15, shieldY, shieldX + dir * s * 0.15, shieldY, s * 0.04, '#94a3b8');

  ellipse(ctx, x, y - s * 0.4, s * 0.26, s * 0.24, '#475569', '#1e293b', 2);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x - dir * s * 0.15, y - s * 0.42, dir * s * 0.3, s * 0.04);
  circle(ctx, x - dir * s * 0.06, y - s * 0.4, s * 0.025, '#ef4444', null);
  circle(ctx, x + dir * s * 0.06, y - s * 0.4, s * 0.025, '#ef4444', null);
  triangle(ctx, x - s * 0.04, y - s * 0.6, x + s * 0.04, y - s * 0.6, x, y - s * 0.75, '#dc2626', '#7f1d1d', 1);

  const weaponRaise = atkProg * s * 0.3;
  line(ctx, x + dir * s * 0.3, y + s * 0.1, x + dir * s * (0.35 + weaponRaise * 0.3), y - s * (0.3 + weaponRaise), s * 0.07, '#78350f');
  circle(ctx, x + dir * s * (0.35 + weaponRaise * 0.3), y - s * (0.35 + weaponRaise), s * 0.1, '#64748b', '#334155', 1.5);
};
