import { UNIT_RADIUS } from '../../constants.js';
import { circle, roundRect, line, rect } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.018) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.018)) * s * 0.07 : Math.sin(t * 0.004) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 200) : 0;
  const idleSway = moving ? 0 : Math.sin(t * 0.004) * s * 0.03;

  const x = unit.x + idleSway;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.22;

  line(ctx, x - s * 0.18, y + s * 0.25, x - s * 0.3 + legSwing, y + s * 0.9, s * 0.13, '#18181b');
  line(ctx, x + s * 0.18, y + s * 0.25, x + s * 0.3 - legSwing, y + s * 0.9, s * 0.13, '#18181b');

  roundRect(ctx, x - s * 0.28, y - s * 0.25, s * 0.56, s * 0.55, s * 0.08, '#27272a', '#09090b', 1.5);
  rect(ctx, x - s * 0.3, y + s * 0.15, s * 0.6, s * 0.08, '#dc2626', null);

  circle(ctx, x, y - s * 0.55, s * 0.28, '#27272a', '#09090b', 1);

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(x - s * 0.3, y - s * 0.62, s * 0.6, s * 0.1);
  const ribbonSway = (moving ? walkPhase * s * 0.15 : Math.sin(t * 0.006) * s * 0.05) + atkProg * s * 0.2;
  ctx.beginPath();
  ctx.moveTo(x - dir * s * 0.3, y - s * 0.57);
  ctx.lineTo(x - dir * s * (0.55 + ribbonSway * 0.3), y - s * (0.45 - ribbonSway * 0.1));
  ctx.lineTo(x - dir * s * (0.5 + ribbonSway * 0.2), y - s * (0.35 - ribbonSway * 0.15));
  ctx.lineTo(x - dir * s * 0.3, y - s * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(x - s * 0.12, y - s * 0.55, s * 0.24, s * 0.05);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(x + dir * s * 0.02, y - s * 0.55, dir * s * 0.08, s * 0.04);

  const armSwing = walkPhase * s * 0.1;
  line(ctx, x - dir * s * 0.25, y - s * 0.15, x - dir * (s * 0.5 - armSwing), y + s * 0.1, s * 0.1, '#27272a');

  const starBaseX = x + dir * s * 0.45;
  const starThrowDist = atkProg * dir * s * 0.4;
  const starX = starBaseX + starThrowDist;
  const starY = y - s * 0.2 - atkProg * s * 0.1;
  ctx.save();
  ctx.translate(starX, starY);
  ctx.rotate(t * 0.015 + atkProg * Math.PI * 2);
  ctx.fillStyle = '#71717a';
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(s * 0.08, s * 0.2);
    ctx.lineTo(0, s * 0.28);
    ctx.lineTo(-s * 0.08, s * 0.2);
    ctx.closePath();
    ctx.fill();
  }
  circle(ctx, 0, 0, s * 0.06, '#27272a', null);
  ctx.restore();

  const armReach = atkProg * s * 0.2;
  line(ctx, x + dir * s * 0.25, y - s * 0.1, starBaseX - dir * s * 0.05 + armReach * dir, starY + s * 0.05, s * 0.1, '#27272a');
};
