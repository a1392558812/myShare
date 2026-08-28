import { UNIT_RADIUS } from '../../constants.js';
import { circle, roundRect, line, arc, rect } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.013) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.013)) * s * 0.06 : Math.sin(t * 0.003) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 300) : 0;
  const hatTilt = walkPhase * s * 0.04 + (moving ? 0 : Math.sin(t * 0.004) * s * 0.02);

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.16;

  line(ctx, x - s * 0.18, y + s * 0.25, x - s * 0.22 + legSwing, y + s * 0.9, s * 0.15, '#1e3a5f');
  line(ctx, x + s * 0.18, y + s * 0.25, x + s * 0.22 - legSwing, y + s * 0.9, s * 0.15, '#1e3a5f');
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.ellipse(x - s * 0.22 + legSwing, y + s * 0.92, s * 0.12, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + s * 0.22 - legSwing, y + s * 0.92, s * 0.12, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  roundRect(ctx, x - s * 0.3, y - s * 0.22, s * 0.6, s * 0.5, s * 0.1, '#e2e8f0', '#94a3b8', 1);
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y - s * 0.2);
  ctx.lineTo(x - s * 0.05, y - s * 0.05);
  ctx.lineTo(x, y + s * 0.28);
  ctx.lineTo(x - s * 0.3, y + s * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.3, y - s * 0.2);
  ctx.lineTo(x + s * 0.05, y - s * 0.05);
  ctx.lineTo(x, y + s * 0.28);
  ctx.lineTo(x + s * 0.3, y + s * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fbbf24';
  ctx.font = `${s * 0.3}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', x, y + s * 0.08);

  circle(ctx, x, y - s * 0.5, s * 0.26, '#fcd34d', '#92400e', 1);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + dir * s * 0.02, y - s * 0.55, dir * s * 0.08, s * 0.04);
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.4, s * 0.1, 0.2, Math.PI - 0.2);
  ctx.stroke();

  ctx.fillStyle = '#7c2d12';
  ctx.beginPath();
  ctx.ellipse(x + hatTilt, y - s * 0.72, s * 0.42, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.18 + hatTilt, y - s * 0.7);
  ctx.lineTo(x - s * 0.14 + hatTilt, y - s * 1.05);
  ctx.lineTo(x + s * 0.14 + hatTilt, y - s * 1.05);
  ctx.lineTo(x + s * 0.18 + hatTilt, y - s * 0.7);
  ctx.closePath();
  ctx.fill();
  rect(ctx, x - s * 0.18 + hatTilt, y - s * 0.78, s * 0.36, s * 0.06, '#451a03', null);

  const lassoBaseX = x - dir * s * 0.4;
  const lassoSwing = atkProg * dir * s * 0.5;
  const lassoX = lassoBaseX + lassoSwing;
  const lassoY = y - s * 0.05;
  line(ctx, x - dir * s * 0.25, y - s * 0.1, lassoX, lassoY, 1.5, '#92400e');
  const lassoR = s * (0.12 + atkProg * 0.1);
  const lassoRy = s * (0.18 + atkProg * 0.08);
  const lassoSpin = atkProg > 0 ? t * 0.02 : 0;
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.5;
  ctx.save();
  ctx.translate(lassoX - dir * s * 0.1, lassoY - s * 0.2);
  ctx.rotate(lassoSpin);
  ctx.beginPath();
  ctx.ellipse(0, 0, lassoR, lassoRy, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};
