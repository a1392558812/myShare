import { circle, ellipse, roundRect, line, triangle, arc } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 22;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const walkPhase = moving ? Math.sin(t * 0.012) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.012)) * s * 0.04 : Math.sin(t * 0.003) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 350) : 0;
  const slamProg = unit.lastSlamTime ? Math.max(0, 1 - (t - unit.lastSlamTime) / 400) : 0;
  const rageAura = 0.5 + Math.sin(t * 0.006) * 0.1;

  const x = unit.x;
  const y = unit.y - bob;

  ctx.fillStyle = `rgba(239, 68, 68, ${0.08 * rageAura})`;
  circle(ctx, x, y, s * 1.3, `rgba(239, 68, 68, ${0.08 * rageAura})`, null);

  const legSwing = walkPhase * s * 0.1;

  roundRect(ctx, x - s * 0.22 + legSwing, y + s * 0.4, s * 0.2, s * 0.35, s * 0.04, '#451a1a', '#1c0a0a', 1.5);
  roundRect(ctx, x + s * 0.02 - legSwing, y + s * 0.4, s * 0.2, s * 0.35, s * 0.04, '#451a1a', '#1c0a0a', 1.5);

  roundRect(ctx, x - s * 0.38, y - s * 0.1, s * 0.76, s * 0.55, s * 0.08, '#7f1d1d', '#450a0a', 2.5);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.08);
  ctx.lineTo(x, y + s * 0.4);
  ctx.stroke();
  triangle(ctx, x - s * 0.1, y + s * 0.05, x + s * 0.1, y + s * 0.05, x, y + s * 0.2, '#991b1b', '#450a0a', 1);

  ellipse(ctx, x - s * 0.42, y - s * 0.05, s * 0.16, s * 0.14, '#991b1b', '#450a0a', 2);
  ellipse(ctx, x + s * 0.42, y - s * 0.05, s * 0.16, s * 0.14, '#991b1b', '#450a0a', 2);
  triangle(ctx, x - s * 0.42, y - s * 0.2, x - s * 0.36, y - s * 0.2, x - s * 0.39, y - s * 0.4, '#7f1d1d', '#1c0a0a', 1);
  triangle(ctx, x + s * 0.36, y - s * 0.2, x + s * 0.42, y - s * 0.2, x + s * 0.39, y - s * 0.4, '#7f1d1d', '#1c0a0a', 1);

  ellipse(ctx, x, y - s * 0.45, s * 0.28, s * 0.26, '#7f1d1d', '#1c0a0a', 2);
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(x - dir * s * 0.18, y - s * 0.48, dir * s * 0.36, s * 0.05);
  const eyeGlow = 1 + Math.sin(t * 0.01) * 0.2 + slamProg * 0.5;
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = s * 0.25 * eyeGlow;
  circle(ctx, x - dir * s * 0.08, y - s * 0.46, s * 0.04 * eyeGlow, '#ef4444', null);
  circle(ctx, x + dir * s * 0.08, y - s * 0.46, s * 0.04 * eyeGlow, '#ef4444', null);
  ctx.shadowBlur = 0;
  triangle(ctx, x - s * 0.2, y - s * 0.6, x - s * 0.1, y - s * 0.6, x - s * 0.22, y - s * 0.85, '#450a0a', '#1c0a0a', 1.5);
  triangle(ctx, x + s * 0.1, y - s * 0.6, x + s * 0.2, y - s * 0.6, x + s * 0.22, y - s * 0.85, '#450a0a', '#1c0a0a', 1.5);

  const swordLift = atkProg * s * 0.3 + slamProg * s * 0.4;
  const swordX = x + dir * s * 0.45;
  const swordAngle = atkProg > 0 ? -0.5 - atkProg * 0.3 : -0.3;
  ctx.save();
  ctx.translate(swordX, y - s * 0.1);
  ctx.rotate(swordAngle);
  roundRect(ctx, -s * 0.04, 0, s * 0.08, s * 0.2, s * 0.02, '#451a03', '#1c0a0a', 1);
  roundRect(ctx, -s * 0.12, -s * 0.05, s * 0.24, s * 0.06, s * 0.02, '#78350f', '#451a03', 1);
  ctx.fillStyle = '#9ca3af';
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-s * 0.05, -s * 0.05);
  ctx.lineTo(s * 0.05, -s * 0.05);
  ctx.lineTo(s * 0.04, -s * (0.7 + swordLift));
  ctx.lineTo(0, -s * (0.8 + swordLift));
  ctx.lineTo(-s * 0.04, -s * (0.7 + swordLift));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.06);
  ctx.lineTo(0, -s * (0.75 + swordLift));
  ctx.stroke();
  ctx.restore();

  if (slamProg > 0) {
    ctx.fillStyle = `rgba(239, 68, 68, ${slamProg * 0.3})`;
    circle(ctx, x, y, s * 0.8 * slamProg, `rgba(239, 68, 68, ${slamProg * 0.3})`, null);
  }
};
