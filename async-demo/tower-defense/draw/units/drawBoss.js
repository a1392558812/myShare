import { circle, ellipse, roundRect, line, triangle } from './helpers.js';
import drawDragon from './drawDragon.js';
import drawGhost from './drawGhost.js';

const bossDragon = (ctx, e, time, facing) => {
  drawDragon(ctx, e, time, facing);
  const s = e.size;
  const x = e.x;
  const y = e.y + (e.floatY || 24);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fbbf24';
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-s * 0.28, -s * 0.42);
  ctx.lineTo(-s * 0.2, -s * 0.72);
  ctx.lineTo(-s * 0.05, -s * 0.5);
  ctx.lineTo(s * 0.05, -s * 0.78);
  ctx.lineTo(s * 0.28, -s * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const pulse = 1 + Math.sin(time * 0.004) * 0.05;
  ctx.strokeStyle = `rgba(251,191,36,${0.25 + Math.sin(time * 0.004) * 0.1})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, s * 1.3 * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

const bossGhost = (ctx, e, time) => {
  const c = e.def.color || '#8b5cf6';
  drawGhost(ctx, e, time);
  const s = e.size;
  const bob = Math.sin(time * 0.004 + e.t) * s * 0.05;
  const x = e.x;
  const y = e.y + (e.floatY || 0) + bob;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#c4b5fd';
  ctx.strokeStyle = '#4c1d95';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y - s * 0.86);
  ctx.lineTo(x - s * 0.2, y - s * 1.15);
  ctx.lineTo(x, y - s * 0.9);
  ctx.lineTo(x + s * 0.2, y - s * 1.2);
  ctx.lineTo(x + s * 0.3, y - s * 0.86);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = `${c}55`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x, y + s * 0.2, s * (1.1 + i * 0.3) + Math.sin(time * 0.003 + i) * s * 0.1, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  }
  ctx.restore();
};

const bossGolem = (ctx, e, time, facing) => {
  const s = e.size;
  const c = e.def.color || '#64748b';
  const dark = '#1e293b';
  const x = e.x;
  const y = e.y + (e.floatY || 0);
  const breath = 1 + Math.sin(time * 0.002) * 0.02;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ellipse(ctx, 0, s * 0.7, s * 0.7, s * 0.16, 'rgba(0,0,0,0.35)');
  roundRect(ctx, -s * 0.4, s * 0.2, s * 0.32, s * 0.5, s * 0.08, c, dark, 2);
  roundRect(ctx, s * 0.08, s * 0.2, s * 0.32, s * 0.5, s * 0.08, c, dark, 2);
  roundRect(ctx, -s * 0.52 * breath, -s * 0.4, s * 1.04 * breath, s * 0.7, s * 0.12, c, dark, 2.5);
  ctx.save();
  const glow = 0.6 + Math.sin(time * 0.005) * 0.3;
  circle(ctx, 0, -s * 0.05, s * 0.14, `rgba(251,146,60,${glow})`);
  circle(ctx, 0, -s * 0.05, s * 0.06, '#ffedd5');
  ctx.restore();
  roundRect(ctx, -s * 0.66, -s * 0.54, s * 0.34, s * 0.24, s * 0.06, dark, c, 2);
  roundRect(ctx, s * 0.32, -s * 0.54, s * 0.34, s * 0.24, s * 0.06, dark, c, 2);
  roundRect(ctx, -s * 0.22, -s * 0.86, s * 0.44, s * 0.32, s * 0.08, c, dark, 2);
  circle(ctx, s * 0.06, -s * 0.7, s * 0.07, `rgba(248,113,113,${0.7 + Math.sin(time * 0.006) * 0.3})`);
  circle(ctx, s * 0.06, -s * 0.7, s * 0.03, '#fff1f2');
  roundRect(ctx, -s * 0.8, -s * 0.2, s * 0.26, s * 0.6, s * 0.08, c, dark, 2);
  roundRect(ctx, s * 0.56, -s * 0.2, s * 0.26, s * 0.6, s * 0.08, c, dark, 2);
  ctx.restore();
};

const bossPhantom = (ctx, e, time, facing) => {
  drawDragon(ctx, e, time, facing);
  const s = e.size;
  const x = e.x;
  const y = e.y + (e.floatY || 26);
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < 2; i++) {
    ctx.save();
    ctx.rotate(Math.sin(time * 0.0011 * (i ? -1 : 1)) * 0.35 + i * 1.2);
    ctx.strokeStyle = `rgba(34,211,238,${0.4 - i * 0.16})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.12, s * (1.15 + i * 0.3), s * (0.32 + i * 0.12), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  const glow = 0.55 + Math.sin(time * 0.006) * 0.35;
  circle(ctx, 0, -s * 0.1, s * 0.2, `rgba(34,211,238,${glow})`);
  circle(ctx, 0, -s * 0.1, s * 0.08, '#ecfeff');
  triangle(ctx, -s * 0.16, -s * 0.5, -s * 0.3, -s * 0.92, -s * 0.02, -s * 0.54, '#a5f3fc', '#0e7490', 1.5);
  triangle(ctx, s * 0.16, -s * 0.5, s * 0.3, -s * 0.92, s * 0.02, -s * 0.54, '#a5f3fc', '#0e7490', 1.5);
  circle(ctx, s * 0.16, -s * 0.34, s * 0.06, `rgba(236,254,255,${0.7 + Math.sin(time * 0.008) * 0.3})`);
  ctx.restore();
};

const bossShadow = (ctx, e, time) => {
  drawGhost(ctx, e, time);
  const s = e.size;
  const x = e.x;
  const y = e.y + (e.floatY || 0);
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = '#312e81';
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.75, y - s * 0.5);
  ctx.quadraticCurveTo(x, y - s * 0.1, x + s * 0.75, y - s * 0.5);
  ctx.lineTo(x + s * 0.55, y + s * 0.7 + Math.sin(time * 0.005) * s * 0.06);
  ctx.lineTo(x - s * 0.55, y + s * 0.7 + Math.sin(time * 0.005 + 1) * s * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  const runes = ['#94a3b8', '#38bdf8', '#a78bfa'];
  for (let i = 0; i < 3; i++) {
    const a = time * 0.0022 + (i / 3) * Math.PI * 2;
    circle(ctx, x + Math.cos(a) * s * 1.15, y + Math.sin(a) * s * 0.34 + s * 0.15, s * 0.11, runes[i], '#1e1b4b', 1.5);
  }
  ctx.fillStyle = '#a78bfa';
  ctx.strokeStyle = '#4c1d95';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.34, y - s * 0.92);
  ctx.lineTo(x - s * 0.24, y - s * 1.26);
  ctx.lineTo(x - s * 0.06, y - s * 1.0);
  ctx.lineTo(x + s * 0.1, y - s * 1.32);
  ctx.lineTo(x + s * 0.32, y - s * 0.92);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  circle(ctx, x - s * 0.14, y - s * 0.62, s * 0.07, `rgba(233,213,255,${0.75 + Math.sin(time * 0.007) * 0.25})`);
  circle(ctx, x + s * 0.14, y - s * 0.62, s * 0.07, `rgba(233,213,255,${0.75 + Math.sin(time * 0.007) * 0.25})`);
  ctx.restore();
};

const bossMix = (ctx, e, time, facing) => {
  const s = e.size;
  const c = e.def.color || '#ec4899';
  const dark = '#831843';
  const x = e.x;
  const y = e.y + (e.floatY || 0);
  const brow = time * 0.006 + e.t;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  const flap = Math.sin(brow) * s * 0.4;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(-s * 0.1, -s * 0.1);
  ctx.quadraticCurveTo(-s * 0.9, -s * 0.7 + flap, -s * 1.4, -s * 0.4 + flap);
  ctx.quadraticCurveTo(-s * 0.8, -s * 0.05, -s * 0.1, s * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -s * 0.15, s * 0.7, Math.PI, 0);
  for (let i = 0; i <= 4; i++) {
    const wx = -s * 0.7 + (i / 4) * s * 1.4;
    ctx.lineTo(wx, s * 0.55 + Math.sin(time * 0.008 + i) * s * 0.1);
  }
  ctx.closePath();
  ctx.fillStyle = c;
  ctx.fill();
  ctx.stroke();
  roundRect(ctx, -s * 0.75, s * 0.0, s * 0.24, s * 0.5, s * 0.07, dark, c, 2);
  roundRect(ctx, s * 0.5, s * 0.0, s * 0.24, s * 0.5, s * 0.07, dark, c, 2);
  circle(ctx, 0, -s * 0.55, s * 0.28, c, dark, 2);
  triangle(ctx, -s * 0.12, -s * 0.8, -s * 0.2, -s * 1.1, -s * 0.02, -s * 0.82, '#fde68a', '#92400e', 1);
  triangle(ctx, s * 0.12, -s * 0.8, s * 0.2, -s * 1.1, s * 0.02, -s * 0.82, '#fde68a', '#92400e', 1);
  circle(ctx, s * 0.12, -s * 0.56, s * 0.07, '#fecdd3');
  circle(ctx, s * 0.13, -s * 0.56, s * 0.035, '#500724');
  ctx.restore();
};

const DRAW = {
  bossDragon,
  bossGhost,
  bossGolem,
  bossPhantom,
  bossShadow,
  bossMix,
};

export default (ctx, e, time, facing) => {
  const fn = DRAW[e.kind] || bossGolem;
  fn(ctx, e, time, facing);
};
