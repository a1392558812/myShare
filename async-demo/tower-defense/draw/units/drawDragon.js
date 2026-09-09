import { circle, ellipse, line, triangle, roundRect } from './helpers.js';

export default (ctx, e, time = 0, facing = 1) => {
  const s = e.size || 12;
  const c = e.def.color || '#38bdf8';
  const dark = '#0c4a6e';
  const wing = Math.sin(time * 0.006 + e.t) * 0.5;

  const x = e.x;
  const y = e.y + (e.floatY || 24);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);

  ctx.save();
  ctx.translate(0, -(e.floatY || 24));
  ellipse(ctx, 0, 0.2, s * 0.8, s * 0.22, 'rgba(0,0,0,0.28)');
  ctx.restore();

  ctx.save();
  line(ctx, -s * 0.5, 0, -s * 1.1, s * 0.1 + Math.sin(time * 0.004) * s * 0.12, s * 0.18, c);
  triangle(ctx, -s * 1.1, s * 0.1, -s * 1.3, s * 0.05, -s * 1.1, s * 0.22, c, dark, 1);
  ctx.restore();

  const flap = wing * s * 0.4;
  for (const [sy, alpha, sh] of [[-0.2, 0.85, dark], [-0.05, 1, c]]) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.moveTo(s * 0.1, sy * s);
    ctx.quadraticCurveTo(s * 0.9, sy * s - s * 0.8 + flap, s * 1.4, sy * s - s * 0.5 + flap);
    ctx.quadraticCurveTo(s * 0.8, sy * s + s * 0.1, s * 0.1, sy * s + s * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ellipse(ctx, -s * 0.05, 0, s * 0.62, s * 0.3, c, dark, 1.5);
  ellipse(ctx, -s * 0.05, -s * 0.08, s * 0.6, s * 0.14, 'rgba(255,255,255,0.22)');

  circle(ctx, s * 0.5, -s * 0.08, s * 0.24, c, dark, 1.5);
  roundRect(ctx, s * 0.62, -s * 0.14, s * 0.32, s * 0.16, s * 0.05, c, dark, 1.5);
  triangle(ctx, s * 0.4, -s * 0.26, s * 0.46, -s * 0.5, s * 0.56, -s * 0.3, '#fde68a', '#92400e', 1);
  triangle(ctx, s * 0.28, -s * 0.28, s * 0.32, -s * 0.5, s * 0.42, -s * 0.32, '#fde68a', '#92400e', 1);
  circle(ctx, s * 0.56, -s * 0.08, s * 0.06, '#fff');
  circle(ctx, s * 0.58, -s * 0.08, s * 0.03, '#0f172a');
  circle(ctx, s * 0.9, -s * 0.08, s * 0.02, '#0c4a6e');

  ctx.restore();
};
