import { circle, ellipse, roundRect, line, triangle } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 12;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const walkPhase = moving ? Math.sin(t * 0.02) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.02)) * s * 0.06 : Math.abs(Math.sin(t * 0.006)) * s * 0.04;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 200) : 0;
  const fuseFlicker = Math.sin(t * 0.05) > 0 ? 1 : 0.3;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.18;

  line(ctx, x - s * 0.1, y + s * 0.2, x - s * 0.12 + legSwing, y + s * 0.6, s * 0.08, '#7f1d1d');
  line(ctx, x + s * 0.1, y + s * 0.2, x + s * 0.12 - legSwing, y + s * 0.6, s * 0.08, '#7f1d1d');

  circle(ctx, x, y, s * 0.4, '#dc2626', '#7f1d1d', 1.5);
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = s * 0.05;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.35, y - s * 0.1);
  ctx.lineTo(x + s * 0.35, y - s * 0.1);
  ctx.moveTo(x - s * 0.35, y + s * 0.1);
  ctx.lineTo(x + s * 0.35, y + s * 0.1);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const bx = x - s * 0.25 + i * s * 0.17;
    const by = y + (i % 2 === 0 ? -s * 0.15 : s * 0.15);
    circle(ctx, bx, by, s * 0.05, '#1c1917', null);
  }

  circle(ctx, x, y - s * 0.55, s * 0.22, '#fbbf24', '#7f1d1d', 1);
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.22, y - s * 0.55);
  ctx.lineTo(x - s * 0.2, y - s * 0.8);
  ctx.lineTo(x + s * 0.2, y - s * 0.8);
  ctx.lineTo(x + s * 0.22, y - s * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  const eyeR = s * 0.04 * (1 + atkProg * 0.5);
  ctx.fillStyle = '#fff';
  circle(ctx, x - dir * s * 0.08, y - s * 0.55, s * 0.05, '#fff', null);
  circle(ctx, x + dir * s * 0.08, y - s * 0.55, s * 0.05, '#fff', null);
  circle(ctx, x - dir * s * 0.08, y - s * 0.55, eyeR, '#dc2626', null);
  circle(ctx, x + dir * s * 0.08, y - s * 0.55, eyeR, '#dc2626', null);

  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.45, s * 0.08, 0.2, Math.PI - 0.2);
  ctx.stroke();

  const fuseX = x;
  const fuseTopY = y - s * 0.95;
  line(ctx, fuseX, y - s * 0.8, fuseX + Math.sin(t * 0.01) * s * 0.06, fuseTopY, s * 0.03, '#78350f');
  ctx.fillStyle = `rgba(251, 191, 36, ${fuseFlicker})`;
  ctx.shadowColor = '#f97316';
  ctx.shadowBlur = s * 0.3 * fuseFlicker;
  circle(ctx, fuseX + Math.sin(t * 0.01) * s * 0.06, fuseTopY, s * 0.06 * fuseFlicker, `rgba(251, 191, 36, ${fuseFlicker})`, null);
  ctx.shadowBlur = 0;
  for (let i = 0; i < 3; i++) {
    const ang = t * 0.03 + (Math.PI * 2 * i) / 3;
    const r = s * 0.1 * fuseFlicker;
    const px = fuseX + Math.sin(t * 0.01) * s * 0.06 + Math.cos(ang) * r;
    const py = fuseTopY + Math.sin(ang) * r;
    ctx.fillStyle = `rgba(249, 115, 22, ${fuseFlicker * 0.6})`;
    circle(ctx, px, py, s * 0.02, `rgba(249, 115, 22, ${fuseFlicker * 0.6})`, null);
  }

  if (unit.hp / unit.maxHp < 0.3) {
    const blink = Math.sin(t * 0.02) > 0;
    if (blink) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      circle(ctx, x, y, s * 0.6, 'rgba(239, 68, 68, 0.3)', null);
    }
  }
};
