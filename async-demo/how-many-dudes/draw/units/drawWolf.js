import { circle, ellipse, line, triangle } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 18;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const walkPhase = moving ? Math.sin(t * 0.016) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.016)) * s * 0.05 : Math.sin(t * 0.004) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 200) : 0;
  const legA = walkPhase * s * 0.14;
  const legB = -walkPhase * s * 0.14;

  const x = unit.x;
  const y = unit.y - bob;

  const tailSway = Math.sin(t * 0.008) * s * 0.15 + walkPhase * s * 0.1;
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(x - dir * s * 0.5, y - s * 0.1);
  ctx.quadraticCurveTo(x - dir * (s * 0.8 + tailSway), y - s * 0.35, x - dir * (s * 0.7 + tailSway * 0.5), y + s * 0.05);
  ctx.quadraticCurveTo(x - dir * (s * 0.6 + tailSway * 0.3), y - s * 0.1, x - dir * s * 0.45, y + s * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.stroke();

  ellipse(ctx, x - dir * s * 0.3 + legA, y + s * 0.35, s * 0.12, s * 0.2, '#475569', '#334155', 1);
  ellipse(ctx, x - dir * s * 0.15 + legB, y + s * 0.35, s * 0.12, s * 0.2, '#475569', '#334155', 1);

  ellipse(ctx, x, y + s * 0.05, s * 0.55, s * 0.3, '#94a3b8', '#475569', 1.5);
  ellipse(ctx, x, y + s * 0.2, s * 0.4, s * 0.12, '#cbd5e1', null);

  ellipse(ctx, x + dir * s * 0.35 + legB, y + s * 0.35, s * 0.12, s * 0.2, '#475569', '#334155', 1);
  ellipse(ctx, x + dir * s * 0.2 + legA, y + s * 0.35, s * 0.12, s * 0.2, '#475569', '#334155', 1);

  const headLunge = atkProg * dir * s * 0.15;
  const headX = x + dir * (s * 0.45 + headLunge);
  const headY = y - s * 0.15;
  circle(ctx, headX, headY, s * 0.3, '#94a3b8', '#475569', 1.5);

  const mouthOpen = atkProg * s * 0.06;
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(headX, headY - s * 0.1);
  ctx.lineTo(headX + dir * s * 0.35, headY - mouthOpen);
  ctx.lineTo(headX + dir * s * 0.35, headY + s * 0.1 + mouthOpen);
  ctx.lineTo(headX, headY + s * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#fef3c7';
  triangle(ctx, headX + dir * s * 0.2, headY + s * 0.05, headX + dir * s * 0.27, headY + s * 0.05, headX + dir * s * 0.23, headY + s * (0.15 + mouthOpen), '#fef3c7', null);
  triangle(ctx, headX + dir * s * 0.1, headY + s * 0.1, headX + dir * s * 0.17, headY + s * 0.1, headX + dir * s * 0.13, headY + s * (0.2 + mouthOpen), '#fef3c7', null);

  const earTwitch = Math.sin(t * 0.01) * s * 0.02;
  triangle(ctx, headX - dir * s * 0.15, headY - s * 0.25, headX - dir * s * 0.05, headY - s * 0.25, headX - dir * s * 0.1, headY - s * (0.45 + earTwitch), '#64748b', '#334155', 1);
  triangle(ctx, headX + dir * s * 0.05, headY - s * 0.25, headX + dir * s * 0.15, headY - s * 0.25, headX + dir * s * 0.1, headY - s * (0.45 - earTwitch), '#64748b', '#334155', 1);

  const eyeR = s * 0.05 * (1 + atkProg * 0.5);
  circle(ctx, headX + dir * s * 0.05, headY - s * 0.05, eyeR, '#ef4444', '#7f1d1d', 0.5);

  ctx.fillStyle = '#475569';
  for (let i = 0; i < 4; i++) {
    const mx = x - dir * s * 0.35 + dir * s * 0.2 * i;
    const mSway = Math.sin(t * 0.01 + i) * s * 0.02;
    triangle(ctx, mx - s * 0.05, y - s * 0.2, mx + s * 0.05, y - s * 0.2, mx, y - s * (0.35 + mSway), '#475569', null);
  }
};
