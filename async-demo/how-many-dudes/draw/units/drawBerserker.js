import { UNIT_RADIUS } from '../../constants.js';
import { circle, roundRect, line, triangle } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.014) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.014)) * s * 0.07 : Math.sin(t * 0.004) * s * 0.03;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 250) : 0;
  const atkSwing = atkProg * Math.sin(atkProg * Math.PI);
  const breath = moving ? 1 : 1 + Math.sin(t * 0.004) * 0.03;

  const hpRatio = unit.maxHp > 0 ? unit.hp / unit.maxHp : 1;
  const enraged = unit.enrageThreshold > 0 && hpRatio <= unit.enrageThreshold;
  const ragePulse = enraged ? Math.sin(t * 0.015) * 0.3 + 0.7 : 0;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.2;

  if (enraged) {
    ctx.fillStyle = `rgba(239, 68, 68, ${0.15 * ragePulse})`;
    ctx.beginPath();
    ctx.arc(x, y, s * 1.5, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      const angle = t * 0.008 + (i * Math.PI * 2) / 5;
      const pr = s * (0.8 + Math.sin(t * 0.01 + i) * 0.3);
      ctx.fillStyle = `rgba(239, 68, 68, ${0.5 * ragePulse})`;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * pr, y + Math.sin(angle) * pr, s * 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  line(ctx, x - s * 0.2, y + s * 0.3, x - s * 0.25 + legSwing, y + s * 0.95, s * 0.16, '#78350f');
  line(ctx, x + s * 0.2, y + s * 0.3, x + s * 0.25 - legSwing, y + s * 0.95, s * 0.16, '#78350f');

  const bodyH = s * 0.65 * breath;
  const skinColor = enraged ? '#dc2626' : '#b91c1c';
  roundRect(ctx, x - s * 0.35, y - s * 0.25, s * 0.7, bodyH, s * 0.1, skinColor, '#7f1d1d', 1.5);
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.15);
  ctx.lineTo(x, y + s * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, y + s * 0.05);
  ctx.lineTo(x + s * 0.15, y + s * 0.05);
  ctx.stroke();

  roundRect(ctx, x - s * 0.3, y + s * 0.25, s * 0.6, s * 0.1, s * 0.03, '#451a03', null, 0);

  circle(ctx, x, y - s * 0.55, s * 0.3, '#fde68a', '#92400e', 1);
  ctx.fillStyle = '#1e293b';
  for (let i = -1; i <= 1; i++) {
    triangle(ctx, x + i * s * 0.15, y - s * 0.8, x + i * s * 0.15 + s * 0.08, y - s * 0.8, x + i * s * 0.12, y - s * (1.0 + Math.abs(i) * 0.1), '#1e293b', null, 0);
  }
  ctx.fillStyle = enraged ? '#ef4444' : '#1e293b';
  ctx.fillRect(x + dir * s * 0.02, y - s * 0.6, dir * s * 0.1, s * 0.05);
  ctx.fillRect(x - dir * s * 0.12, y - s * 0.6, dir * s * 0.1, s * 0.05);
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.1, y - s * 0.42);
  ctx.lineTo(x + s * 0.1, y - s * 0.42);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const tx = x - s * 0.08 + i * s * 0.08;
    line(ctx, tx, y - s * 0.42, tx, y - s * 0.38, s * 0.02, '#f1f5f9');
  }

  const swingL = atkSwing * s * 0.3;
  const swingR = atkSwing * s * 0.3;
  const lhx = x - dir * s * 0.5;
  const lhy = y + s * 0.1;
  line(ctx, lhx, lhy, lhx - dir * s * 0.1 - swingL, lhy - s * 0.6 + swingL, s * 0.08, '#451a03');
  ctx.fillStyle = '#94a3b8';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  const lax = lhx - dir * s * 0.1 - swingL;
  const lay = lhy - s * 0.6 + swingL;
  ctx.beginPath();
  ctx.moveTo(lax, lay);
  ctx.lineTo(lax - dir * s * 0.2, lay - s * 0.1);
  ctx.lineTo(lax - dir * s * 0.22, lay + s * 0.05);
  ctx.lineTo(lax, lay + s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const rhx = x + dir * s * 0.5;
  const rhy = y + s * 0.1;
  line(ctx, rhx, rhy, rhx + dir * s * 0.1 + swingR, rhy - s * 0.6 - swingR, s * 0.08, '#451a03');
  const rax = rhx + dir * s * 0.1 + swingR;
  const ray = rhy - s * 0.6 - swingR;
  ctx.beginPath();
  ctx.moveTo(rax, ray);
  ctx.lineTo(rax + dir * s * 0.2, ray - s * 0.1);
  ctx.lineTo(rax + dir * s * 0.22, ray + s * 0.05);
  ctx.lineTo(rax, ray + s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};
