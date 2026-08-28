import { circle, ellipse, roundRect, line, triangle } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 28;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const walkPhase = moving ? Math.sin(t * 0.005) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.005)) * s * 0.02 : Math.sin(t * 0.002) * s * 0.01;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 500) : 0;
  const slamProg = unit.lastSlamTime ? Math.max(0, 1 - (t - unit.lastSlamTime) / 500) : 0;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.05;

  ellipse(ctx, x - s * 0.2 + legSwing, y + s * 0.55, s * 0.18, s * 0.2, '#44403c', '#1c1917', 2);
  ellipse(ctx, x + s * 0.2 - legSwing, y + s * 0.55, s * 0.18, s * 0.2, '#44403c', '#1c1917', 2);

  ctx.fillStyle = '#57534e';
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.48, y - s * 0.1);
  ctx.lineTo(x - s * 0.52, y + s * 0.2);
  ctx.lineTo(x - s * 0.4, y + s * 0.45);
  ctx.lineTo(x + s * 0.4, y + s * 0.45);
  ctx.lineTo(x + s * 0.52, y + s * 0.2);
  ctx.lineTo(x + s * 0.48, y - s * 0.1);
  ctx.lineTo(x + s * 0.38, y - s * 0.35);
  ctx.lineTo(x - s * 0.38, y - s * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.2);
  ctx.lineTo(x - s * 0.1, y + s * 0.1);
  ctx.lineTo(x - s * 0.15, y + s * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.15, y - s * 0.15);
  ctx.lineTo(x + s * 0.25, y + s * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y + s * 0.1);
  ctx.lineTo(x + s * 0.05, y + s * 0.2);
  ctx.stroke();

  ctx.fillStyle = '#365314';
  for (let i = 0; i < 3; i++) {
    const mx = x - s * 0.3 + i * s * 0.25 + Math.sin(i * 2.3) * s * 0.05;
    const my = y - s * 0.25 + (i % 2) * s * 0.1;
    ellipse(ctx, mx, my, s * 0.06, s * 0.03, '#365314', null);
  }

  const coreGlow = 1 + Math.sin(t * 0.006) * 0.3 + slamProg * 0.5;
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#f97316';
  ctx.shadowBlur = s * 0.3 * coreGlow;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.08, y);
  ctx.lineTo(x + s * 0.08, y);
  ctx.lineTo(x + s * 0.05, y + s * 0.15);
  ctx.lineTo(x - s * 0.05, y + s * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  const fistLift = atkProg * s * 0.15 + slamProg * s * 0.25;
  ellipse(ctx, x - s * 0.55, y + s * 0.1 - fistLift, s * 0.18, s * 0.2, '#57534e', '#292524', 2);
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.6, y + s * 0.05 - fistLift);
  ctx.lineTo(x - s * 0.5, y + s * 0.15 - fistLift);
  ctx.stroke();

  ellipse(ctx, x + s * 0.55, y + s * 0.1 - slamProg * s * 0.1, s * 0.18, s * 0.2, '#57534e', '#292524', 2);

  ctx.fillStyle = '#57534e';
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.25, y - s * 0.35);
  ctx.lineTo(x - s * 0.28, y - s * 0.6);
  ctx.lineTo(x - s * 0.15, y - s * 0.7);
  ctx.lineTo(x + s * 0.15, y - s * 0.7);
  ctx.lineTo(x + s * 0.28, y - s * 0.6);
  ctx.lineTo(x + s * 0.25, y - s * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const eyeR = s * 0.04 * (1 + slamProg * 0.8);
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#f97316';
  ctx.shadowBlur = s * 0.2 * coreGlow;
  circle(ctx, x - s * 0.1, y - s * 0.52, eyeR, '#fbbf24', null);
  circle(ctx, x + s * 0.1, y - s * 0.52, eyeR, '#fbbf24', null);
  ctx.shadowBlur = 0;

  if (slamProg > 0) {
    ctx.strokeStyle = `rgba(251, 146, 60, ${slamProg * 0.8})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, s * (0.5 + slamProg * 0.8), 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(251, 191, 36, ${slamProg * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, s * (0.7 + slamProg * 0.6), 0, Math.PI * 2);
    ctx.stroke();
  }
};
