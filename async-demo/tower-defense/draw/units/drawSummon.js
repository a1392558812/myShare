import { circle, ellipse, roundRect, line, triangle, rect, bar } from './helpers.js';

export default (ctx, s, time = 0, facing = 1) => {
  const r = 7;
  const c = s.color || '#34d399';
  const dark = '#065f46';
  const bob = Math.sin(time * 0.006 + (s.id || 0)) * r * 0.1;

  const x = s.x;
  const y = s.y - bob;

  if (s.maxHp && s.hp < s.maxHp) {
    bar(ctx, x - 8, y - 16, 16, 3, s.hp / s.maxHp, '#0f172a', '#ef4444', '#22c55e');
  }

  ctx.save();
  ctx.globalAlpha = s.alpha ?? 1;
  ctx.translate(x, y);
  ctx.scale(facing, 1);

  ellipse(ctx, 0, r * 0.7 - bob + bob, r * 0.5, r * 0.12, 'rgba(0,0,0,0.3)');

  roundRect(ctx, -r * 0.3, r * 0.2, r * 0.22, r * 0.45, r * 0.05, '#475569', '#1e293b', 1);
  roundRect(ctx, r * 0.08, r * 0.2, r * 0.22, r * 0.45, r * 0.05, '#475569', '#1e293b', 1);

  roundRect(ctx, -r * 0.5, -r * 0.4, r, r * 0.6, r * 0.12, c, dark, 1.5);
  rect(ctx, -r * 0.36, -r * 0.34, r * 0.72, r * 0.12, 'rgba(255,255,255,0.2)');

  circle(ctx, 0, -r * 0.62, r * 0.34, c, dark, 1.5);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-r * 0.26, -r * 0.66, r * 0.52, r * 0.06);
  circle(ctx, r * 0.1, -r * 0.6, r * 0.06, '#f8fafc');
  circle(ctx, r * 0.12, -r * 0.6, r * 0.03, '#0f172a');

  line(ctx, r * 0.4, r * 0.1, r * 0.7, -r * 0.9, r * 0.06, '#92400e');
  triangle(ctx, r * 0.7, -r * 0.9, r * 0.82, -r * 1.05, r * 0.76, -r * 0.78, '#e2e8f0', '#94a3b8', 1);

  ctx.restore();
};
