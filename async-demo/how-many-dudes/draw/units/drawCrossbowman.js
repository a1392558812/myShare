import { UNIT_RADIUS } from '../../constants.js';
import { circle, roundRect, line, triangle, rect } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.011) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.011)) * s * 0.05 : Math.sin(t * 0.003) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 350) : 0;
  const breath = moving ? 1 : 1 + Math.sin(t * 0.003) * 0.02;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.16;

  line(ctx, x - s * 0.2, y + s * 0.3, x - s * 0.22 + legSwing, y + s * 0.95, s * 0.15, '#78350f');
  line(ctx, x + s * 0.2, y + s * 0.3, x + s * 0.22 - legSwing, y + s * 0.95, s * 0.15, '#78350f');

  const bodyH = s * 0.68 * breath;
  roundRect(ctx, x - s * 0.33, y - s * 0.28, s * 0.66, bodyH, s * 0.1, '#92400e', '#78350f', 1.5);
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = s * 0.06;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y - s * 0.2);
  ctx.lineTo(x + s * 0.25, y + s * 0.2);
  ctx.stroke();

  rect(ctx, x - s * 0.35, y - s * 0.1, s * 0.12, s * 0.3, '#78350f', null);
  for (let i = 0; i < 3; i++) {
    const ay = y - s * 0.15 + i * s * 0.08;
    line(ctx, x - s * 0.29, ay, x - s * 0.38, ay - s * 0.1, s * 0.03, '#16a34a');
  }

  circle(ctx, x, y - s * 0.55, s * 0.27, '#fde68a', '#92400e', 1);
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.55, s * 0.3, Math.PI * 0.85, Math.PI * 2.15);
  ctx.lineTo(x + s * 0.25, y - s * 0.3);
  ctx.lineTo(x - s * 0.25, y - s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1;
  ctx.stroke();
  line(ctx, x + s * 0.1, y - s * 0.8, x + s * 0.2, y - s * 0.95, s * 0.03, '#16a34a');
  ctx.fillStyle = '#1e293b';
  circle(ctx, x + dir * s * 0.06, y - s * 0.57, s * 0.03, '#1e293b', null, 0);
  circle(ctx, x - dir * s * 0.07, y - s * 0.57, s * 0.03, '#1e293b', null, 0);

  const crossbowLift = atkProg * s * 0.12;
  const cby = y - s * 0.05 - crossbowLift;
  line(ctx, x - dir * s * 0.25, cby, x + dir * s * 0.25, cby, s * 0.06, '#451a03');
  ctx.strokeStyle = `rgba(200, 200, 200, ${0.8 - atkProg * 0.5})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - dir * s * 0.25, cby);
  ctx.quadraticCurveTo(x + dir * s * 0.05, cby + s * 0.1 * (1 - atkProg), x + dir * s * 0.25, cby);
  ctx.stroke();
  line(ctx, x, cby, x + dir * s * 0.5, cby - s * 0.02, s * 0.08, '#78350f');
  if (atkProg < 0.4) {
    line(ctx, x, cby, x + dir * s * 0.45, cby - s * 0.02, s * 0.03, '#94a3b8');
    triangle(ctx, x + dir * s * 0.4, cby - s * 0.04, x + dir * s * 0.5, cby - s * 0.02, x + dir * s * 0.4, cby + s * 0.01, '#e2e8f0', null, 0);
  }
  if (atkProg > 0.5) {
    const flash = (atkProg - 0.5) / 0.5;
    ctx.fillStyle = `rgba(251, 191, 36, ${flash * 0.6})`;
    ctx.beginPath();
    ctx.arc(x + dir * s * 0.55, cby, s * 0.08 * flash, 0, Math.PI * 2);
    ctx.fill();
  }
};
