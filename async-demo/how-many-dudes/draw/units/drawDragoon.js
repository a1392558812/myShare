import { UNIT_RADIUS } from '../../constants.js';
import { circle, roundRect, line, triangle, arc } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.013) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.013)) * s * 0.06 : Math.sin(t * 0.003) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 300) : 0;
  const atkThrust = atkProg * s * 0.5 * Math.sin(atkProg * Math.PI);
  const breath = moving ? 1 : 1 + Math.sin(t * 0.003) * 0.02;

  const chargeRecent = unit.lastChargeTime && (t - unit.lastChargeTime) < 400;
  const chargeProg = chargeRecent ? 1 - (t - unit.lastChargeTime) / 400 : 0;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.2;

  if (chargeRecent) {
    for (let i = 1; i <= 3; i++) {
      const trail = i * s * 0.3 * dir;
      ctx.fillStyle = `rgba(251, 146, 60, ${0.15 * chargeProg * (1 - i / 4)})`;
      ctx.beginPath();
      ctx.arc(x - trail, y, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const wingFlap = Math.sin(t * 0.005) * s * 0.08 + (moving ? walkPhase * s * 0.1 : 0);
  ctx.fillStyle = '#7f1d1d';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y - s * 0.15);
  ctx.lineTo(x - s * (0.9 + wingFlap), y - s * 0.4);
  ctx.lineTo(x - s * 0.7, y + s * 0.1);
  ctx.lineTo(x - s * 0.3, y + s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.3, y - s * 0.15);
  ctx.lineTo(x + s * (0.9 + wingFlap), y - s * 0.4);
  ctx.lineTo(x + s * 0.7, y + s * 0.1);
  ctx.lineTo(x + s * 0.3, y + s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  line(ctx, x - s * 0.22, y + s * 0.3, x - s * 0.25 + legSwing, y + s * 0.95, s * 0.17, '#991b1b');
  line(ctx, x + s * 0.22, y + s * 0.3, x + s * 0.25 - legSwing, y + s * 0.95, s * 0.17, '#991b1b');
  circle(ctx, x - s * 0.25 + legSwing, y + s * 0.65, s * 0.08, '#dc2626', null, 0);
  circle(ctx, x + s * 0.25 - legSwing, y + s * 0.65, s * 0.08, '#dc2626', null, 0);

  const bodyH = s * 0.7 * breath;
  roundRect(ctx, x - s * 0.38, y - s * 0.3, s * 0.76, bodyH, s * 0.1, '#991b1b', '#7f1d1d', 1.5);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 3; i++) {
    const ry = y - s * 0.15 + i * s * 0.2;
    ctx.beginPath();
    ctx.arc(x, ry, s * 0.3, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  }
  circle(ctx, x, y, s * 0.08, '#fbbf24', '#92400e', 1);

  circle(ctx, x, y - s * 0.6, s * 0.28, '#fde68a', '#92400e', 1);
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.6, s * 0.32, Math.PI * 0.9, Math.PI * 2.1);
  ctx.lineTo(x + s * 0.25, y - s * 0.35);
  ctx.lineTo(x - s * 0.25, y - s * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 1;
  ctx.stroke();
  triangle(ctx, x - s * 0.2, y - s * 0.85, x - s * 0.1, y - s * 0.85, x - s * 0.28, y - s * 1.1, '#7f1d1d', '#450a0a', 1);
  triangle(ctx, x + s * 0.1, y - s * 0.85, x + s * 0.2, y - s * 0.85, x + s * 0.28, y - s * 1.1, '#7f1d1d', '#450a0a', 1);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x + dir * s * 0.02, y - s * 0.65, dir * s * 0.1, s * 0.04);
  ctx.fillRect(x - dir * s * 0.12, y - s * 0.65, dir * s * 0.1, s * 0.04);

  const spearX = x + dir * s * 0.5;
  const spearThrust = atkThrust * dir;
  line(ctx, spearX, y + s * 0.4, spearX + spearThrust, y - s * 1.0, s * 0.06, '#78350f');
  const tipX = spearX + spearThrust + dir * s * 0.15;
  const tipY = y - s * 1.0 - s * 0.15;
  triangle(ctx, spearX + spearThrust, y - s * 1.0, tipX, tipY, spearX + spearThrust + dir * s * 0.04, y - s * 0.9, '#e2e8f0', '#475569', 1);
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(spearX + spearThrust, y - s * 0.95, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
};
