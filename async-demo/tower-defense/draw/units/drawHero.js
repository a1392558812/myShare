import { circle, ellipse, roundRect, line, triangle, rect } from './helpers.js';

export default (ctx, h, time = 0, facing = 1) => {
  const s = 13;
  const armor = '#10b981';
  const dark = '#065f46';
  const gold = '#fbbf24';
  const moving = Math.hypot(h.vx || 0, h.vy || 0) > 10;
  const walk = h.walkPhase || 0;
  const bob = moving ? Math.abs(Math.sin(walk)) * s * 0.09 : Math.sin(time * 0.002) * s * 0.015;
  const swing = moving ? Math.sin(walk) * s * 0.16 : 0;
  const breath = moving ? 1 : 1 + Math.sin(time * 0.002) * 0.02;

  const x = h.x;
  const y = h.y - bob;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);

  ellipse(ctx, 0, s * 0.62 - bob + bob, s * 0.6, s * 0.15, 'rgba(0,0,0,0.32)');

  ctx.fillStyle = '#047857';
  ctx.beginPath();
  ctx.moveTo(-s * 0.32, -s * 0.3);
  ctx.quadraticCurveTo(-s * 0.9, -s * 0.1 - swing, -s * 0.72, s * 0.5);
  ctx.quadraticCurveTo(-s * 0.3, s * 0.42, -s * 0.26, s * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#065f46';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  roundRect(ctx, -s * 0.22 + swing, s * 0.26, s * 0.18, s * 0.42, s * 0.05, '#475569', '#1e293b', 1.5);
  roundRect(ctx, s * 0.04 - swing, s * 0.26, s * 0.18, s * 0.42, s * 0.05, '#475569', '#1e293b', 1.5);

  roundRect(ctx, -s * 0.42 * breath, -s * 0.32, s * 0.84 * breath, s * 0.62, s * 0.12, armor, dark, 2);
  rect(ctx, -s * 0.12, -s * 0.28, s * 0.24, s * 0.52, 'rgba(251,191,36,0.5)');
  circle(ctx, 0, -s * 0.02, s * 0.08, gold);

  circle(ctx, 0, -s * 0.6, s * 0.3, '#94a3b8', '#475569', 1.5);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-s * 0.24, -s * 0.64, s * 0.48, s * 0.05);
  ctx.fillRect(-s * 0.09, -s * 0.82, s * 0.18, s * 0.12);
  triangle(ctx, 0, -s * 0.9, s * 0.08, -s * 1.0, -s * 0.08, -s * 1.0, gold);

  circle(ctx, s * 0.1, -s * 0.58, s * 0.05, '#f8fafc');
  circle(ctx, s * 0.12, -s * 0.58, s * 0.03, '#0f172a');

  ctx.save();
  ctx.rotate(swing * 0.02);
  line(ctx, s * 0.32, s * 0.06, s * 0.78, -s * 0.5, s * 0.06, '#92400e');
  triangle(ctx, s * 0.78, -s * 0.5, s * 0.92, -s * 0.62, s * 0.84, -s * 0.4, '#e2e8f0', '#94a3b8', 1);
  ctx.restore();

  ctx.restore();
};
