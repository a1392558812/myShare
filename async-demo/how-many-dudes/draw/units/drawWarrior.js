import { UNIT_RADIUS } from '../../constants.js';
import { circle, roundRect, line, triangle } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.012) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.012)) * s * 0.06 : Math.sin(t * 0.003) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 250) : 0;
  const atkSwing = atkProg * s * 0.4 * Math.sin(atkProg * Math.PI);
  const breath = moving ? 1 : 1 + Math.sin(t * 0.003) * 0.02;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.18;

  line(ctx, x - s * 0.25, y + s * 0.3, x - s * 0.3 + legSwing, y + s * 0.95, s * 0.18, '#5b21b6');
  line(ctx, x + s * 0.25, y + s * 0.3, x + s * 0.3 - legSwing, y + s * 0.95, s * 0.18, '#5b21b6');

  const bodyH = s * 0.7 * breath;
  roundRect(ctx, x - s * 0.4, y - s * 0.3, s * 0.8, bodyH, s * 0.12, '#7c1d1d', '#450a0a', 1.5);

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.2);
  ctx.lineTo(x, y + s * 0.3);
  ctx.stroke();

  const shieldX = x - dir * s * (0.65 - atkSwing * 0.3);
  const shieldY = y;
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.moveTo(shieldX, shieldY - s * 0.35);
  ctx.lineTo(shieldX + dir * s * 0.25, shieldY - s * 0.25);
  ctx.lineTo(shieldX + dir * s * 0.25, shieldY + s * 0.2);
  ctx.lineTo(shieldX, shieldY + s * 0.35);
  ctx.lineTo(shieldX - dir * s * 0.05, shieldY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  circle(ctx, x, y - s * 0.65, s * 0.35, '#fbbf24', '#451a03', 1);
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.65, s * 0.38, Math.PI, 0);
  ctx.lineTo(x + s * 0.38, y - s * 0.55);
  ctx.lineTo(x - s * 0.38, y - s * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1;
  ctx.stroke();
  triangle(ctx, x - s * 0.05, y - s * 0.95, x + s * 0.05, y - s * 0.95, x, y - s * 1.2, '#dc2626', '#7f1d1d', 1);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + dir * s * 0.05, y - s * 0.7, dir * s * 0.12, s * 0.06);

  const swordHandX = x + dir * s * 0.55;
  const swordHandY = y - s * 0.1;
  const thrust = atkSwing * dir;
  line(ctx, swordHandX, swordHandY, swordHandX + dir * s * 0.1 + thrust * s * 0.3, swordHandY + s * 0.15, s * 0.1, '#451a03');
  line(ctx, swordHandX - dir * s * 0.05 + thrust * s * 0.3, swordHandY + s * 0.05, swordHandX + dir * s * 0.15 + thrust * s * 0.3, swordHandY - s * 0.05, s * 0.08, '#fbbf24');
  line(ctx, swordHandX + dir * s * 0.05 + thrust * s * 0.3, swordHandY, swordHandX + dir * s * (0.7 + atkSwing * 0.5) + thrust * s * 0.3, swordHandY - s * 0.55, s * 0.1, '#e2e8f0');
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(swordHandX + dir * s * (0.7 + atkSwing * 0.5) + thrust * s * 0.3, swordHandY - s * 0.55);
  ctx.lineTo(swordHandX + dir * s * (0.6 + atkSwing * 0.5) + thrust * s * 0.3, swordHandY - s * 0.5);
  ctx.lineTo(swordHandX + dir * s * (0.65 + atkSwing * 0.5) + thrust * s * 0.3, swordHandY - s * 0.42);
  ctx.closePath();
  ctx.fill();
};
