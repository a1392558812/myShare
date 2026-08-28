import { UNIT_RADIUS } from '../../constants.js';
import { circle, roundRect, line, arc } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.008) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.008)) * s * 0.08 : Math.sin(t * 0.002) * s * 0.03;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 300) : 0;
  const lurch = atkProg * s * 0.3;
  const wobble = Math.sin(t * 0.005) * s * 0.02;

  const x = unit.x + (moving ? 0 : wobble);
  const y = unit.y - bob;
  const legSwingL = walkPhase * s * 0.25;
  const legSwingR = walkPhase * s * 0.05;

  line(ctx, x - s * 0.15, y + s * 0.25, x - s * 0.35 + legSwingL, y + s * 0.85, s * 0.13, '#3f3f46');
  line(ctx, x + s * 0.15, y + s * 0.25, x + s * 0.2 + legSwingR, y + s * 0.9, s * 0.13, '#3f3f46');

  const bodyTilt = lurch * dir;
  ctx.fillStyle = '#52525b';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3 + bodyTilt, y - s * 0.2);
  ctx.lineTo(x - s * 0.35 + bodyTilt, y + s * 0.3);
  ctx.lineTo(x - s * 0.1 + bodyTilt, y + s * 0.25);
  ctx.lineTo(x + s * 0.1 + bodyTilt, y + s * 0.35);
  ctx.lineTo(x + s * 0.3 + bodyTilt, y + s * 0.28);
  ctx.lineTo(x + s * 0.3 + bodyTilt, y - s * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#3f3f46';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.25 + bodyTilt, y - s * 0.2);
  ctx.lineTo(x - s * 0.1 + bodyTilt, y - s * 0.1);
  ctx.lineTo(x + s * 0.1 + bodyTilt, y - s * 0.22);
  ctx.lineTo(x + s * 0.25 + bodyTilt, y - s * 0.15);
  ctx.lineTo(x + s * 0.25 + bodyTilt, y - s * 0.05);
  ctx.lineTo(x - s * 0.25 + bodyTilt, y - s * 0.08);
  ctx.closePath();
  ctx.fill();

  const armReach = s * (0.55 + lurch * 0.5);
  line(ctx, x + bodyTilt, y - s * 0.1, x + dir * armReach, y - s * 0.2, s * 0.1, '#4ade80');
  line(ctx, x + bodyTilt, y + s * 0.05, x + dir * (armReach - s * 0.05), y, s * 0.1, '#4ade80');
  circle(ctx, x + dir * armReach, y - s * 0.2, s * 0.08, '#4ade80', '#166534', 1);
  circle(ctx, x + dir * (armReach - s * 0.05), y, s * 0.08, '#4ade80', '#166534', 1);

  const headX = x + dir * s * (0.05 + lurch * 0.3);
  const headY = y - s * 0.55;
  const headTilt = (moving ? walkPhase * 0.1 : Math.sin(t * 0.004) * 0.05);
  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(headTilt);
  circle(ctx, 0, 0, s * 0.3, '#4ade80', '#166534', 1.5);

  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(0, -s * 0.1, s * 0.32, Math.PI * 1.1, Math.PI * 1.9);
  ctx.lineTo(s * 0.25, -s * 0.15);
  ctx.lineTo(s * 0.15, -s * 0.05);
  ctx.lineTo(0, -s * 0.2);
  ctx.lineTo(-s * 0.15, -s * 0.05);
  ctx.lineTo(-s * 0.25, -s * 0.15);
  ctx.closePath();
  ctx.fill();

  const eyeGlow = atkProg > 0 ? 1 + atkProg : 1;
  circle(ctx, -dir * s * 0.08, -s * 0.02, s * 0.05 * eyeGlow, '#ef4444', null);
  circle(ctx, dir * s * 0.1, -s * 0.02, s * 0.07 * eyeGlow, '#ef4444', null);

  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-s * 0.08, s * 0.12);
  ctx.lineTo(s * 0.1, s * 0.08);
  ctx.stroke();
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(-s * 0.05, s * 0.08, s * 0.04, s * 0.06);
  ctx.fillRect(s * 0.03, s * 0.06, s * 0.04, s * 0.06);

  line(ctx, dir * s * 0.05, -s * 0.2, dir * s * 0.2, s * 0.05, 1, '#166534');
  ctx.restore();
};
