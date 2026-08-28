import { circle, line, triangle, arc } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 18;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const floatBob = Math.sin(t * 0.004) * s * 0.06;
  const walkPhase = moving ? Math.sin(t * 0.01) : 0;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 350) : 0;
  const robeSway = Math.sin(t * 0.006) * s * 0.05 + walkPhase * s * 0.08;
  const orbPulse = 1 + Math.sin(t * 0.008) * 0.15 + atkProg * 0.5;

  const x = unit.x;
  const y = unit.y - floatBob;

  const shadowAlpha = 0.2 - Math.abs(floatBob) * 0.005;
  ctx.fillStyle = `rgba(88, 28, 135, ${Math.max(0.05, shadowAlpha)})`;
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.85 + Math.abs(floatBob), s * 0.4, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3b0764';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y - s * 0.15);
  ctx.lineTo(x - s * (0.4 + robeSway * 0.3), y + s * 0.8);
  ctx.quadraticCurveTo(x - s * 0.2, y + s * 0.9, x, y + s * 0.8);
  ctx.quadraticCurveTo(x + s * 0.2, y + s * 0.9, x + s * (0.4 - robeSway * 0.3), y + s * 0.8);
  ctx.lineTo(x + s * 0.3, y - s * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1e0535';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, y);
  ctx.quadraticCurveTo(x, y + s * 0.3, x + s * 0.15, y);
  ctx.stroke();

  circle(ctx, x, y - s * 0.45, s * 0.25, '#0c0a14', '#1e0535', 1);

  const eyeGlow = 1 + atkProg * 1.5;
  ctx.fillStyle = '#a855f7';
  ctx.shadowColor = '#a855f7';
  ctx.shadowBlur = s * 0.3 * eyeGlow;
  circle(ctx, x - dir * s * 0.08, y - s * 0.48, s * 0.04 * eyeGlow, '#a855f7', null);
  circle(ctx, x + dir * s * 0.08, y - s * 0.48, s * 0.04 * eyeGlow, '#a855f7', null);
  ctx.shadowBlur = 0;

  const hoodTilt = walkPhase * s * 0.03;
  ctx.fillStyle = '#3b0764';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.32 + hoodTilt, y - s * 0.3);
  ctx.quadraticCurveTo(x - s * (0.38 + hoodTilt * 0.5), y - s * 0.7, x + hoodTilt, y - s * 0.85);
  ctx.quadraticCurveTo(x + s * (0.38 - hoodTilt * 0.5), y - s * 0.7, x + s * 0.32 - hoodTilt, y - s * 0.3);
  ctx.lineTo(x + s * 0.25, y - s * 0.2);
  ctx.lineTo(x - s * 0.25, y - s * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1e0535';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const staffLift = atkProg * s * 0.2;
  const staffX = x + dir * s * 0.4;
  line(ctx, staffX, y + s * 0.5, staffX, y - s * (0.7 + staffLift), s * 0.06, '#1e0535');
  const orbX = staffX;
  const orbY = y - s * (0.8 + staffLift);
  ctx.fillStyle = `rgba(168, 85, 247, ${0.2 + atkProg * 0.3})`;
  circle(ctx, orbX, orbY, s * 0.22 * orbPulse, `rgba(168, 85, 247, ${0.2 + atkProg * 0.3})`, null);
  circle(ctx, orbX, orbY, s * 0.12 * orbPulse, '#7c3aed', '#3b0764', 1.5);
  ctx.strokeStyle = 'rgba(196, 181, 253, 0.6)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(orbX, orbY, s * 0.08 * orbPulse, t * 0.005 % (Math.PI * 2), t * 0.005 % (Math.PI * 2) + Math.PI * 1.5);
  ctx.stroke();
  if (atkProg > 0.1) {
    ctx.strokeStyle = `rgba(168, 85, 247, ${atkProg * 0.8})`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI * 2 * i) / 6 + t * 0.01;
      ctx.beginPath();
      ctx.moveTo(orbX + Math.cos(ang) * s * 0.14, orbY + Math.sin(ang) * s * 0.14);
      ctx.lineTo(orbX + Math.cos(ang) * s * (0.3 + atkProg * 0.2), orbY + Math.sin(ang) * s * (0.3 + atkProg * 0.2));
      ctx.stroke();
    }
  }

  ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
  for (let i = 0; i < 3; i++) {
    const ang = t * 0.004 + (Math.PI * 2 * i) / 3;
    const r = s * 0.4;
    const px = x + Math.cos(ang) * r;
    const py = y + s * 0.2 + Math.sin(ang) * s * 0.3;
    circle(ctx, px, py, s * 0.035, 'rgba(168, 85, 247, 0.35)', null);
  }
};
