import { circle, ellipse, roundRect, line, triangle, rect } from './helpers.js';

export default (ctx, e, time = 0, facing = 1) => {
  const s = e.size || 12;
  const c = e.def.color || '#94a3b8';
  const dark = '#334155';
  const walk = e.walkPhase || 0;
  const bob = Math.abs(Math.sin(walk)) * s * 0.1;
  const breath = 1 + Math.sin(time * 0.003) * 0.02;
  const swing = Math.sin(walk) * s * 0.18;

  const x = e.x;
  const y = e.y + (e.floatY || 0) - bob;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);

  ellipse(ctx, 0, s * 0.6 - bob + bob, s * 0.55, s * 0.16, 'rgba(0,0,0,0.35)');

  roundRect(ctx, -s * 0.24 + swing, s * 0.28, s * 0.18, s * 0.5, s * 0.05, cache(c), dark, 1.5);
  roundRect(ctx, s * 0.06 - swing, s * 0.28, s * 0.18, s * 0.5, s * 0.05, cache(c), dark, 1.5);

  roundRect(ctx, -s * 0.42 * breath, -s * 0.34, s * 0.84 * breath, s * 0.62, s * 0.12, c, dark, 2);
  rect(ctx, -s * 0.3, -s * 0.26, s * 0.6, s * 0.1, 'rgba(255,255,255,0.18)');

  circle(ctx, 0, -s * 0.62, s * 0.3, c, dark, 1.5);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-s * 0.22, -s * 0.66, s * 0.44, s * 0.05);
  ctx.fillRect(-s * 0.06, -s * 0.78, s * 0.12, s * 0.06);
  triangle(ctx, 0, -s * 0.9, s * 0.1, -s * 1.0, -s * 0.1, -s * 1.0, '#ef4444');

  circle(ctx, s * 0.1, -s * 0.6, s * 0.05, '#f8fafc');
  circle(ctx, s * 0.12, -s * 0.6, s * 0.025, '#0f172a');

  const armAngle = swing * 0.03;
  ctx.save();
  ctx.rotate(armAngle);
  line(ctx, s * 0.34, s * 0.05, s * 0.72, -s * 0.42, s * 0.07, '#78350f');
  triangle(ctx, s * 0.72, -s * 0.42, s * 0.84, -s * 0.52, s * 0.78, -s * 0.32, '#e2e8f0', '#94a3b8', 1);
  ctx.restore();

  ctx.restore();
};

const _cache = {};
function cache(color) {
  if (_cache[color]) return _cache[color];
  _cache[color] = shade(color, -22);
  return _cache[color];
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `rgb(${r},${g},${b})`;
}
