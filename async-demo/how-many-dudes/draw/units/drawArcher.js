import { UNIT_RADIUS } from '../../constants.js';
import { circle, roundRect, line, arc, triangle } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.012) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.012)) * s * 0.06 : Math.sin(t * 0.003) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 300) : 0;
  const drawPull = atkProg * s * 0.25;
  const breath = moving ? 1 : 1 + Math.sin(t * 0.003) * 0.02;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.15;

  line(ctx, x - s * 0.2, y + s * 0.3, x - s * 0.25 + legSwing, y + s * 0.9, s * 0.14, '#166534');
  line(ctx, x + s * 0.2, y + s * 0.3, x + s * 0.25 - legSwing, y + s * 0.9, s * 0.14, '#166534');

  const bodyH = s * 0.6 * breath;
  roundRect(ctx, x - s * 0.32, y - s * 0.25, s * 0.64, bodyH, s * 0.1, '#15803d', '#14532d', 1.5);

  circle(ctx, x - dir * s * 0.3, y - s * 0.2, s * 0.12, '#166534', '#052e16', 1);

  circle(ctx, x, y - s * 0.55, s * 0.3, '#fcd34d', '#92400e', 1);

  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.55, s * 0.36, Math.PI * 0.9, Math.PI * 2.1);
  ctx.lineTo(x + s * 0.3, y - s * 0.3);
  ctx.lineTo(x - s * 0.3, y - s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#052e16';
  ctx.lineWidth = 1;
  ctx.stroke();
  triangle(ctx, x - dir * s * 0.3, y - s * 0.8, x - dir * s * 0.15, y - s * 0.6, x - dir * s * 0.4, y - s * 0.45, '#166534');

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + dir * s * 0.02, y - s * 0.58, dir * s * 0.1, s * 0.05);

  const bowX = x - dir * s * 0.55;
  const bowY = y - s * 0.05;
  arc(ctx, bowX, bowY, s * 0.45, -Math.PI / 2.5, Math.PI / 2.5, s * 0.06, '#92400e');
  const stringPullX = bowX + drawPull * dir;
  line(ctx, bowX, bowY - s * 0.38, stringPullX, bowY, 1, '#e2e8f0');
  line(ctx, stringPullX, bowY, bowX, bowY + s * 0.38, 1, '#e2e8f0');
  const arrowX = stringPullX - dir * s * 0.04;
  line(ctx, arrowX, bowY, bowX + dir * s * 0.5, bowY, s * 0.04, '#94a3b8');
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(bowX + dir * s * 0.5, bowY);
  ctx.lineTo(bowX + dir * s * 0.4, bowY - s * 0.06);
  ctx.lineTo(bowX + dir * s * 0.4, bowY + s * 0.06);
  ctx.closePath();
  ctx.fill();

  line(ctx, x + dir * s * 0.3, y - s * 0.1, stringPullX + dir * s * 0.15, bowY, s * 0.1, '#15803d');
};
