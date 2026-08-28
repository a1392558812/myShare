import { UNIT_RADIUS } from '../../constants.js';
import { circle, roundRect, line, triangle, rect, arc } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.009) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.009)) * s * 0.05 : Math.sin(t * 0.003) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 400) : 0;
  const breath = moving ? 1 : 1 + Math.sin(t * 0.003) * 0.02;
  const auraPulse = Math.sin(t * 0.006) * 0.15 + 1;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.15;

  const auraR = unit.speedAuraRange || 0;
  if (auraR > 0) {
    ctx.strokeStyle = `rgba(34, 197, 94, ${0.2 + Math.sin(t * 0.006) * 0.1})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x, y, auraR * 0.4 * auraPulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i < 3; i++) {
      const px = x + Math.sin(t * 0.008 + i * 2) * s * 0.5;
      const py = y - ((t * 0.03 + i * s * 0.4) % (s * 1.2));
      circle(ctx, px, py, s * 0.03, `rgba(34, 197, 94, ${0.4 * auraPulse})`, null);
    }
  }

  line(ctx, x - s * 0.18, y + s * 0.3, x - s * 0.2 + legSwing, y + s * 0.95, s * 0.14, '#52525b');
  line(ctx, x + s * 0.18, y + s * 0.3, x + s * 0.2 - legSwing, y + s * 0.95, s * 0.14, '#52525b');

  const bodyH = s * 0.65 * breath;
  roundRect(ctx, x - s * 0.32, y - s * 0.25, s * 0.64, bodyH, s * 0.1, '#166534', '#14532d', 1.5);
  rect(ctx, x - s * 0.3, y + s * 0.2, s * 0.6, s * 0.06, '#a8a29e', null);
  for (let i = 0; i < 4; i++) {
    rect(ctx, x - s * 0.25 + i * s * 0.15, y + s * 0.22, s * 0.04, s * 0.08, '#f1f5f9', null);
  }
  circle(ctx, x, y + s * 0.02, s * 0.08, '#fbbf24', '#92400e', 1);

  circle(ctx, x, y - s * 0.5, s * 0.26, '#a16207', '#713f12', 1);
  ctx.fillStyle = '#7c2d12';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.5, s * 0.28, Math.PI * 0.15, Math.PI - 0.15);
  ctx.lineTo(x - s * 0.2, y - s * 0.35);
  ctx.lineTo(x + s * 0.2, y - s * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = `rgba(34, 197, 94, ${0.6 + Math.sin(t * 0.008) * 0.2})`;
  circle(ctx, x - dir * s * 0.08, y - s * 0.52, s * 0.04, `rgba(34, 197, 94, 0.8)`, null, 0);
  circle(ctx, x + dir * s * 0.08, y - s * 0.52, s * 0.04, `rgba(34, 197, 94, 0.8)`, null, 0);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.1, y - s * 0.42);
  ctx.lineTo(x + s * 0.1, y - s * 0.42);
  ctx.stroke();

  for (let i = -1; i <= 1; i++) {
    const fx = x + i * s * 0.12;
    const fSwing = Math.sin(t * 0.005 + i) * s * 0.05;
    line(ctx, fx, y - s * 0.75, fx + fSwing, y - s * 1.0, s * 0.03, i === 0 ? '#dc2626' : '#16a34a');
  }

  const staffX = x + dir * s * 0.5;
  const staffLift = atkProg * s * 0.2;
  line(ctx, staffX, y + s * 0.5, staffX, y - s * (0.7 + staffLift), s * 0.06, '#a8a29e');
  const topY = y - s * (0.55 + staffLift);
  circle(ctx, staffX, topY, s * 0.12, '#f1f5f9', '#94a3b8', 1);
  ctx.fillStyle = `rgba(34, 197, 94, ${0.5 + atkProg * 0.5})`;
  circle(ctx, staffX - s * 0.04, topY - s * 0.02, s * 0.03, `rgba(34, 197, 94, ${0.7 + atkProg * 0.3})`, null, 0);
  circle(ctx, staffX + s * 0.04, topY - s * 0.02, s * 0.03, `rgba(34, 197, 94, ${0.7 + atkProg * 0.3})`, null, 0);
  if (atkProg > 0) {
    ctx.strokeStyle = `rgba(34, 197, 94, ${atkProg * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(staffX, topY, s * 0.2 * (1 + atkProg * 0.5), 0, Math.PI * 2);
    ctx.stroke();
  }
};
