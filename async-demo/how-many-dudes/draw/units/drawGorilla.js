import { circle, ellipse, roundRect, line, triangle } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 28;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const walkPhase = moving ? Math.sin(t * 0.009) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.009)) * s * 0.05 : Math.sin(t * 0.003) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 400) : 0;
  const smashAnim = atkProg > 0 ? Math.sin(atkProg * Math.PI) : 0;

  const x = unit.x;
  const y = unit.y - bob;

  const legSway = walkPhase * s * 0.08;
  ellipse(ctx, x - s * 0.2 + legSway, y + s * 0.55, s * 0.15, s * 0.25, '#3f2d1e', '#1c1410', 1.5);
  ellipse(ctx, x + s * 0.2 - legSway, y + s * 0.55, s * 0.15, s * 0.25, '#3f2d1e', '#1c1410', 1.5);

  const leftArmAngle = moving ? Math.PI / 6 + walkPhase * 0.15 : Math.PI / 6;
  const leftArmY = atkProg > 0 ? y + s * 0.3 - smashAnim * s * 0.3 : y + s * 0.3;
  const leftHandY = atkProg > 0 ? y + s * 0.55 - smashAnim * s * 0.35 : y + s * 0.55;
  ctx.fillStyle = '#4a3728';
  ctx.beginPath();
  ctx.ellipse(x - s * 0.45, leftArmY, s * 0.12, s * 0.35, leftArmAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1c1410';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  circle(ctx, x - s * 0.55, leftHandY, s * 0.1, '#5a4530', '#1c1410', 1);

  const rightHandY = atkProg > 0 ? y - smashAnim * s * 0.15 : y + s * 0.2;
  const rightHandX = atkProg > 0 ? x + dir * s * 0.25 : x + s * 0.45;
  ctx.fillStyle = '#4a3728';
  ctx.beginPath();
  ctx.ellipse(x + s * 0.35, y + s * 0.2 - smashAnim * s * 0.1, s * 0.12, s * 0.3, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  circle(ctx, rightHandX, rightHandY, s * 0.12, '#5a4530', '#1c1410', 1);

  const breath = moving ? 1 : 1 + Math.sin(t * 0.003) * 0.02;
  ellipse(ctx, x, y + s * 0.1, s * 0.45 * breath, s * 0.4, '#4a3728', '#1c1410', 2);
  ellipse(ctx, x, y + s * 0.15, s * 0.25, s * 0.28, '#6b5238', null);

  const headX = x;
  const headY = y - s * 0.4;
  ellipse(ctx, headX, headY, s * 0.3, s * 0.28, '#4a3728', '#1c1410', 1.5);
  ellipse(ctx, headX, headY + s * 0.12, s * 0.22, s * 0.16, '#6b5238', '#1c1410', 1);

  const browY = headY - s * 0.02 + atkProg * s * 0.03;
  ctx.fillStyle = '#3f2d1e';
  ctx.beginPath();
  ctx.ellipse(headX, browY, s * 0.25, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  const eyeR = s * 0.04 * (1 + atkProg * 0.5);
  ctx.fillStyle = '#fbbf24';
  circle(ctx, headX - s * 0.1, headY + s * 0.02, eyeR, '#fbbf24', null);
  circle(ctx, headX + s * 0.1, headY + s * 0.02, eyeR, '#fbbf24', null);
  ctx.fillStyle = '#000';
  circle(ctx, headX - s * 0.1, headY + s * 0.02, eyeR * 0.5, '#000', null);
  circle(ctx, headX + s * 0.1, headY + s * 0.02, eyeR * 0.5, '#000', null);

  const nostrilR = s * 0.03 * (1 + atkProg * 0.3);
  ellipse(ctx, headX - s * 0.05, headY + s * 0.15, nostrilR, s * 0.04, '#1c1410', null);
  ellipse(ctx, headX + s * 0.05, headY + s * 0.15, nostrilR, s * 0.04, '#1c1410', null);

  const mouthR = s * 0.1 * (1 + atkProg * 0.5);
  ctx.fillStyle = '#1c1410';
  ellipse(ctx, headX, headY + s * 0.28, mouthR, s * 0.06 * (1 + atkProg), '#1c1410', null);
  ctx.fillStyle = '#fef3c7';
  triangle(ctx, headX - s * 0.06, headY + s * 0.22, headX - s * 0.02, headY + s * 0.22, headX - s * 0.04, headY + s * (0.32 + atkProg * 0.05), '#fef3c7', null);
  triangle(ctx, headX + s * 0.02, headY + s * 0.22, headX + s * 0.06, headY + s * 0.22, headX + s * 0.04, headY + s * (0.32 + atkProg * 0.05), '#fef3c7', null);
};
