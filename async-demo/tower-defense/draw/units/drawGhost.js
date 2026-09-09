import { circle, ellipse, arc, polyline } from './helpers.js';

export default (ctx, e, time = 0) => {
  const s = e.size || 12;
  const c = e.def.color || '#a78bfa';
  const dark = '#4c1d95';
  const alpha = e.alpha ?? 0.4;
  const bob = Math.sin(time * 0.004 + e.t) * s * 0.08;
  const detect = e.detected;

  const x = e.x;
  const y = e.y + (e.floatY || 0) + bob;

  ctx.save();
  ctx.globalAlpha = Math.max(0.08, alpha);

  ellipse(ctx, x, y + s * 0.1, s * 1.0, s * 0.5, `${c}22`);

  ctx.beginPath();
  ctx.arc(x, y, s * 0.9, Math.PI, 0);
  const hem = s * 0.9;
  const waves = [[0.85, -0.3], [0.5, 0.25], [0.1, -0.3], [-0.3, 0.2], [-0.7, -0.25], [-0.9, 0.1]];
  waves.forEach(([wx, wy], i) => {
    ctx.lineTo(x + wx * s, y + Math.sin(time * 0.01 + i) * s * 0.08 + hem + wy * s * 0.2);
  });
  ctx.closePath();
  ctx.fillStyle = c;
  ctx.fill();

  ctx.globalAlpha = Math.max(0.1, alpha * 0.8);
  arc(ctx, x, y, s * 0.9, Math.PI, 0, 1.5, dark);
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.86);
  ctx.quadraticCurveTo(x + Math.sin(time * 0.005) * s * 0.3, y - s * 1.3, x + s * 0.3, y - s * 0.9);
  ctx.strokeStyle = `${c}cc`;
  ctx.lineWidth = 2;
  ctx.stroke();

  const eyeGlow = detect ? 1 : 0.4;
  ctx.globalAlpha = Math.max(0.12, alpha);
  circle(ctx, x - s * 0.34, y - s * 0.1, s * 0.16, `rgba(224,231,255,${0.5 + eyeGlow * 0.5})`);
  circle(ctx, x + s * 0.34, y - s * 0.1, s * 0.16, `rgba(224,231,255,${0.5 + eyeGlow * 0.5})`);
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(x - s * 0.34, y - s * 0.1, s * 0.05, 0, Math.PI * 2);
  ctx.arc(x + s * 0.34, y - s * 0.1, s * 0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
