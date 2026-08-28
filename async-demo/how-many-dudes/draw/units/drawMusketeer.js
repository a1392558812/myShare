import { UNIT_RADIUS } from '../../constants.js';
import { circle, roundRect, line, triangle, rect } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.01) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.01)) * s * 0.05 : Math.sin(t * 0.003) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 500) : 0;
  const breath = moving ? 1 : 1 + Math.sin(t * 0.003) * 0.02;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.15;

  line(ctx, x - s * 0.2, y + s * 0.3, x - s * 0.22 + legSwing, y + s * 0.95, s * 0.15, '#1e3a5f');
  line(ctx, x + s * 0.2, y + s * 0.3, x + s * 0.22 - legSwing, y + s * 0.95, s * 0.15, '#1e3a5f');
  ctx.fillStyle = '#0c1e3a';
  ctx.fillRect(x - s * 0.3 + legSwing, y + s * 0.85, s * 0.2, s * 0.12);
  ctx.fillRect(x + s * 0.1 - legSwing, y + s * 0.85, s * 0.2, s * 0.12);

  const bodyH = s * 0.7 * breath;
  roundRect(ctx, x - s * 0.35, y - s * 0.3, s * 0.7, bodyH, s * 0.1, '#1e40af', '#1e3a5f', 1.5);
  for (let i = 0; i < 3; i++) {
    circle(ctx, x, y - s * 0.15 + i * s * 0.18, s * 0.03, '#fbbf24', null, 0);
  }
  triangle(ctx, x - s * 0.12, y - s * 0.3, x + s * 0.12, y - s * 0.3, x, y - s * 0.12, '#f1f5f9', null, 0);

  circle(ctx, x, y - s * 0.55, s * 0.28, '#fde68a', '#92400e', 1);
  ctx.fillStyle = '#1e293b';
  circle(ctx, x + dir * s * 0.05, y - s * 0.58, s * 0.03, '#1e293b', null, 0);
  circle(ctx, x - dir * s * 0.08, y - s * 0.58, s * 0.03, '#1e293b', null, 0);
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.1, y - s * 0.45);
  ctx.quadraticCurveTo(x, y - s * 0.38, x + s * 0.1, y - s * 0.45);
  ctx.stroke();

  ctx.fillStyle = '#0c1e3a';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.4, y - s * 0.75);
  ctx.lineTo(x + s * 0.4, y - s * 0.75);
  ctx.lineTo(x + s * 0.15, y - s * 1.05);
  ctx.lineTo(x - s * 0.15, y - s * 1.05);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1;
  ctx.stroke();
  line(ctx, x + s * 0.1, y - s * 1.0, x + s * 0.25, y - s * 1.2, s * 0.04, '#dc2626');

  const gunLift = atkProg * s * 0.15;
  const gunY = y - s * 0.1 - gunLift;
  line(ctx, x, gunY, x + dir * s * 1.0, gunY - s * 0.05, s * 0.08, '#374151');
  roundRect(ctx, x - dir * s * 0.15, gunY - s * 0.02, s * 0.25, s * 0.12, s * 0.03, '#78350f', null, 0);
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(x + dir * s * 0.95, gunY - s * 0.07, s * 0.08, s * 0.06);
  if (atkProg > 0.6) {
    const flashAlpha = (atkProg - 0.6) / 0.4;
    ctx.fillStyle = `rgba(251, 191, 36, ${flashAlpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(x + dir * s * 1.1, gunY - s * 0.04, s * 0.15 * flashAlpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(239, 68, 68, ${flashAlpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(x + dir * s * 1.1, gunY - s * 0.04, s * 0.1 * flashAlpha, 0, Math.PI * 2);
    ctx.fill();
  }
};
