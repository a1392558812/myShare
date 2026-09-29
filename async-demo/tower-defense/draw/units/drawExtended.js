// 扩展敌人绘制：冲锋兵 / 装甲兵 / 巫医 / 分裂怪
// 造型各自区分，便于玩家一眼判断该用哪种塔应对
import { circle, ellipse, roundRect, line, triangle, rect } from './helpers.js';

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `rgb(${r},${g},${b})`;
};
const _c = {};
const dark = (color) => {
  if (_c[color]) return _c[color];
  _c[color] = shade(color, -22);
  return _c[color];
};

// 地面投影（四种共用）
const shadow = (ctx, s) => ellipse(ctx, 0, s * 0.6, s * 0.55, s * 0.16, 'rgba(0,0,0,0.35)');

// 冲锋兵：瘦削前倾 + 火焰拖尾 + 尖角盔，视觉上传达「快」
const drawRusher = (ctx, e, time = 0, facing = 1) => {
  const s = e.size || 11;
  const c = e.def.color || '#fb923c';
  const walk = e.walkPhase || 0;
  const bob = Math.abs(Math.sin(walk)) * s * 0.12;
  const swing = Math.sin(walk) * s * 0.26;
  const x = e.x;
  const y = e.y + (e.floatY || 0) - bob;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  shadow(ctx, s);

  // 冲刺拖尾
  if (e.charging) {
    ctx.globalAlpha = 0.35;
    triangle(ctx, -s * 0.5, s * 0.1, -s * 1.5, -s * 0.1, -s * 1.1, s * 0.45, c);
    ctx.globalAlpha = 1;
  }

  roundRect(ctx, -s * 0.3 + swing, s * 0.26, s * 0.2, s * 0.56, s * 0.05, dark(c), '#334155', 1.5);
  roundRect(ctx, s * 0.08 - swing, s * 0.26, s * 0.2, s * 0.56, s * 0.05, dark(c), '#334155', 1.5);

  // 前倾躯干
  ctx.save();
  ctx.rotate(-0.18);
  roundRect(ctx, -s * 0.34, -s * 0.36, s * 0.68, s * 0.6, s * 0.1, c, '#7c2d12', 1.8);
  rect(ctx, -s * 0.24, -s * 0.28, s * 0.48, s * 0.09, 'rgba(255,255,255,0.2)');
  ctx.restore();

  // 尖角盔
  circle(ctx, 0, -s * 0.62, s * 0.27, c, '#7c2d12', 1.5);
  triangle(ctx, 0, -s * 0.86, s * 0.14, -s * 1.15, -s * 0.12, -s * 1.12, '#f97316');
  circle(ctx, s * 0.12, -s * 0.62, s * 0.05, '#fff7ed');
  circle(ctx, s * 0.14, -s * 0.62, s * 0.025, '#0f172a');

  // 前伸短矛
  line(ctx, s * 0.3, s * 0.0, s * 0.85, -s * 0.3, s * 0.06, '#78350f');
  triangle(ctx, s * 0.85, -s * 0.3, s * 1.0, -s * 0.4, s * 0.82, -s * 0.2, '#fed7aa', '#9a3412', 1);

  ctx.restore();
};

// 装甲兵：厚重宽躯 + 铆钉甲片 + 面甲，视觉上传达「硬」
const drawArmored = (ctx, e, time = 0, facing = 1) => {
  const s = e.size || 14;
  const c = e.def.color || '#78716c';
  const walk = e.walkPhase || 0;
  const bob = Math.abs(Math.sin(walk)) * s * 0.06;
  const swing = Math.sin(walk) * s * 0.1;
  const x = e.x;
  const y = e.y + (e.floatY || 0) - bob;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  shadow(ctx, s);

  roundRect(ctx, -s * 0.34 + swing, s * 0.3, s * 0.26, s * 0.5, s * 0.06, dark(c), '#292524', 1.5);
  roundRect(ctx, s * 0.1 - swing, s * 0.3, s * 0.26, s * 0.5, s * 0.06, dark(c), '#292524', 1.5);

  // 宽厚躯干 + 甲片分层
  roundRect(ctx, -s * 0.5, -s * 0.4, s, s * 0.72, s * 0.14, c, '#292524', 2);
  rect(ctx, -s * 0.42, -s * 0.3, s * 0.84, s * 0.12, 'rgba(255,255,255,0.14)');
  rect(ctx, -s * 0.42, -s * 0.05, s * 0.84, s * 0.1, 'rgba(0,0,0,0.22)');

  // 铆钉
  ctx.fillStyle = '#d6d3d1';
  for (let i = -1; i <= 1; i++) {
    circle(ctx, i * s * 0.3, -s * 0.16, s * 0.045, '#d6d3d1');
    circle(ctx, i * s * 0.3, s * 0.12, s * 0.045, '#d6d3d1');
  }

  // 面甲头盔
  roundRect(ctx, -s * 0.28, -s * 0.78, s * 0.56, s * 0.42, s * 0.1, dark(c), '#292524', 1.8);
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(-s * 0.2, -s * 0.66, s * 0.4, s * 0.1);
  circle(ctx, s * 0.08, -s * 0.6, s * 0.045, '#f59e0b');
  circle(ctx, -s * 0.08, -s * 0.6, s * 0.045, '#f59e0b');

  // 盾牌
  roundRect(ctx, -s * 0.78, -s * 0.3, s * 0.22, s * 0.6, s * 0.06, '#a8a29e', '#292524', 1.5);

  ctx.restore();
};

// 巫医：兜帽长袍 + 悬浮法杖 + 治疗绿光，视觉上传达「奶」
const drawHealer = (ctx, e, time = 0, facing = 1) => {
  const s = e.size || 12;
  const c = e.def.color || '#4ade80';
  const walk = e.walkPhase || 0;
  const bob = Math.abs(Math.sin(walk)) * s * 0.08;
  const breath = 1 + Math.sin(time * 0.004) * 0.03;
  const x = e.x;
  const y = e.y + (e.floatY || 0) - bob;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  shadow(ctx, s);

  // 长袍（下摆宽）
  ctx.beginPath();
  ctx.moveTo(-s * 0.3, -s * 0.3);
  ctx.lineTo(s * 0.3, -s * 0.3);
  ctx.lineTo(s * 0.56, s * 0.58);
  ctx.lineTo(-s * 0.56, s * 0.58);
  ctx.closePath();
  ctx.fillStyle = c;
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 1.8;
  ctx.fill();
  ctx.stroke();
  rect(ctx, -s * 0.18, -s * 0.2, s * 0.36, s * 0.5, 'rgba(255,255,255,0.16)');

  // 兜帽
  circle(ctx, 0, -s * 0.56, s * 0.3 * breath, dark(c), '#166534', 1.5);
  ctx.fillStyle = '#052e16';
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.54, s * 0.16, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, s * 0.07, -s * 0.56, s * 0.05, '#bbf7d0');
  circle(ctx, -s * 0.07, -s * 0.56, s * 0.05, '#bbf7d0');

  // 悬浮法杖 + 治疗光点
  const staffY = -s * 0.5 + Math.sin(time * 0.005) * s * 0.08;
  line(ctx, s * 0.42, s * 0.3, s * 0.5, -s * 0.5, s * 0.06, '#78350f');
  circle(ctx, s * 0.5, staffY, s * 0.16, 'rgba(74,222,128,0.35)');
  circle(ctx, s * 0.5, staffY, s * 0.09, '#dcfce7', '#16a34a', 1.2);

  ctx.restore();
};

// 分裂怪：囊状躯体 + 内部裂纹 + 内核，视觉上传达「会炸开」
const drawSplitter = (ctx, e, time = 0, facing = 1) => {
  const s = e.size || 15;
  const c = e.def.color || '#f472b6';
  const walk = e.walkPhase || 0;
  const bob = Math.abs(Math.sin(walk)) * s * 0.1;
  const pulse = 1 + Math.sin(time * 0.006) * 0.06;
  const x = e.x;
  const y = e.y + (e.floatY || 0) - bob;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  shadow(ctx, s);

  // 囊状躯体
  ctx.beginPath();
  ctx.ellipse(0, s * 0.05, s * 0.52 * pulse, s * 0.6 * pulse, 0, 0, Math.PI * 2);
  ctx.fillStyle = c;
  ctx.strokeStyle = '#9d174d';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  // 内部裂纹（暗示即将分裂）
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.45 * pulse);
  ctx.lineTo(-s * 0.12, -s * 0.05);
  ctx.lineTo(s * 0.1, s * 0.25);
  ctx.lineTo(-s * 0.05, s * 0.6 * pulse);
  ctx.stroke();

  // 内核（两个光点，暗示分裂成 2 只）
  circle(ctx, -s * 0.16, s * 0.05, s * 0.13, 'rgba(253,230,238,0.85)');
  circle(ctx, s * 0.16, s * 0.05, s * 0.13, 'rgba(253,230,238,0.85)');
  circle(ctx, -s * 0.16, s * 0.05, s * 0.05, '#be185d');
  circle(ctx, s * 0.16, s * 0.05, s * 0.05, '#be185d');

  // 短足
  ctx.strokeStyle = '#9d174d';
  ctx.lineWidth = s * 0.08;
  ctx.beginPath();
  ctx.moveTo(-s * 0.26, s * 0.55); ctx.lineTo(-s * 0.32, s * 0.72);
  ctx.moveTo(s * 0.26, s * 0.55); ctx.lineTo(s * 0.32, s * 0.72);
  ctx.stroke();

  ctx.restore();
};

export default { drawRusher, drawArmored, drawHealer, drawSplitter };
