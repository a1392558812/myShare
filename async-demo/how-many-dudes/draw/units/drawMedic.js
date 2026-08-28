import { circle, ellipse, roundRect, line, triangle } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || 14;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'enemy' ? -1 : 1;

  const walkPhase = moving ? Math.sin(t * 0.01) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.01)) * s * 0.05 : Math.abs(Math.sin(t * 0.004)) * s * 0.03;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 400) : 0;
  const healPulse = 1 + Math.sin(t * 0.008) * 0.1 + atkProg * 0.3;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.1;

  line(ctx, x - s * 0.1, y + s * 0.2, x - s * 0.12 + legSwing, y + s * 0.55, s * 0.08, '#064e3b');
  line(ctx, x + s * 0.1, y + s * 0.2, x + s * 0.12 - legSwing, y + s * 0.55, s * 0.08, '#064e3b');

  roundRect(ctx, x - s * 0.25, y - s * 0.1, s * 0.5, s * 0.4, s * 0.06, '#d1fae5', '#059669', 1);
  line(ctx, x, y - s * 0.05, x, y + s * 0.2, s * 0.06, '#dc2626');
  line(ctx, x - s * 0.1, y + s * 0.07, x + s * 0.1, y + s * 0.07, s * 0.06, '#dc2626');

  circle(ctx, x, y - s * 0.35, s * 0.2, '#fef3c7', '#059669', 1);
  ctx.fillStyle = '#d1fae5';
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.22, y - s * 0.4);
  ctx.lineTo(x - s * 0.2, y - s * 0.6);
  ctx.lineTo(x + s * 0.2, y - s * 0.6);
  ctx.lineTo(x + s * 0.22, y - s * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  line(ctx, x, y - s * 0.58, x, y - s * 0.45, s * 0.04, '#dc2626');
  line(ctx, x - s * 0.06, y - s * 0.52, x + s * 0.06, y - s * 0.52, s * 0.04, '#dc2626');

  circle(ctx, x - dir * s * 0.06, y - s * 0.35, s * 0.03, '#059669', null);
  circle(ctx, x + dir * s * 0.06, y - s * 0.35, s * 0.03, '#059669', null);

  const bagX = x - dir * s * 0.4;
  const bagY = y + s * 0.15;
  roundRect(ctx, bagX - s * 0.12, bagY - s * 0.08, s * 0.24, s * 0.18, s * 0.04, '#f87171', '#991b1b', 1);
  line(ctx, bagX, bagY - s * 0.06, bagX, bagY + s * 0.06, s * 0.03, '#fff');
  line(ctx, bagX - s * 0.06, bagY, bagX + s * 0.06, bagY, s * 0.03, '#fff');

  if (atkProg > 0) {
    ctx.fillStyle = `rgba(34, 197, 94, ${atkProg * 0.2})`;
    circle(ctx, x, y, s * 0.8 * healPulse, `rgba(34, 197, 94, ${atkProg * 0.2})`, null);
    for (let i = 0; i < 4; i++) {
      const ang = (Math.PI * 2 * i) / 4 + t * 0.005;
      const r = s * 0.5 * healPulse;
      const px = x + Math.cos(ang) * r;
      const py = y + Math.sin(ang) * r - s * 0.1;
      ctx.fillStyle = `rgba(34, 197, 94, ${atkProg * 0.7})`;
      circle(ctx, px, py, s * 0.04, `rgba(34, 197, 94, ${atkProg * 0.7})`, null);
    }
  }
};
