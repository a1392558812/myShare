import { UNIT_RADIUS } from '../../constants.js';
import { circle, roundRect, line, ellipse } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.008) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.008)) * s * 0.04 : Math.sin(t * 0.002) * s * 0.015;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 350) : 0;
  const thrust = atkProg * s * 0.5 * Math.sin(atkProg * Math.PI);

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.1;

  if (unit.shieldAuraRange > 0) {
    const pulse = 1 + Math.sin(t * 0.004) * 0.05;
    ctx.strokeStyle = `rgba(34, 197, 94, ${0.1 + Math.sin(t * 0.004) * 0.05})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(x, y, unit.shieldAuraRange * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  roundRect(ctx, x - s * 0.25 + legSwing, y + s * 0.2, s * 0.16, s * 0.7, s * 0.06, '#64748b', '#334155', 1.5);
  roundRect(ctx, x + s * 0.09 - legSwing, y + s * 0.2, s * 0.16, s * 0.7, s * 0.06, '#64748b', '#334155', 1.5);

  const breath = moving ? 1 : 1 + Math.sin(t * 0.002) * 0.015;
  roundRect(ctx, x - s * 0.38 * breath, y - s * 0.3, s * 0.76 * breath, s * 0.6, s * 0.12, '#94a3b8', '#475569', 2);
  ctx.fillStyle = '#fbbf24';
  ctx.font = `${s * 0.4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✚', x, y);
  circle(ctx, x - s * 0.36 * breath, y - s * 0.2, s * 0.14, '#cbd5e1', '#475569', 1.5);
  circle(ctx, x + s * 0.36 * breath, y - s * 0.2, s * 0.14, '#cbd5e1', '#475569', 1.5);

  const shieldX = x - dir * s * (0.1 + atkProg * 0.05);
  const shieldY = y + s * 0.05;
  ctx.fillStyle = '#1e40af';
  ctx.beginPath();
  ctx.moveTo(shieldX - s * 0.22, shieldY - s * 0.3);
  ctx.lineTo(shieldX + s * 0.22, shieldY - s * 0.3);
  ctx.lineTo(shieldX + s * 0.22, shieldY + s * 0.15);
  ctx.quadraticCurveTo(shieldX + s * 0.22, shieldY + s * 0.35, shieldX, shieldY + s * 0.4);
  ctx.quadraticCurveTo(shieldX - s * 0.22, shieldY + s * 0.35, shieldX - s * 0.22, shieldY + s * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(shieldX, shieldY - s * 0.25);
  ctx.lineTo(shieldX, shieldY + s * 0.3);
  ctx.moveTo(shieldX - s * 0.15, shieldY);
  ctx.lineTo(shieldX + s * 0.15, shieldY);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.6, s * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - s * 0.2, y - s * 0.65, s * 0.4, s * 0.04);
  ctx.fillRect(x - s * 0.03, y - s * 0.5, s * 0.06, s * 0.03);
  ctx.fillRect(x - s * 0.03, y - s * 0.42, s * 0.06, s * 0.03);

  const featherSway = walkPhase * s * 0.08 + Math.sin(t * 0.003) * s * 0.03;
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.05, y - s * 0.88);
  ctx.quadraticCurveTo(x + dir * s * (0.3 + featherSway), y - s * 1.0, x + dir * s * (0.35 + featherSway), y - s * 0.75);
  ctx.quadraticCurveTo(x + dir * s * (0.15 + featherSway), y - s * 0.82, x - s * 0.05, y - s * 0.85);
  ctx.closePath();
  ctx.fill();

  const lanceX = x + dir * s * 0.45;
  const lanceThrust = thrust * dir;
  line(ctx, lanceX, y + s * 0.3, lanceX + dir * s * (0.6 + thrust) + lanceThrust, y - s * 0.5, s * 0.07, '#92400e');
  const lanceTipX = lanceX + dir * s * (0.6 + thrust) + lanceThrust;
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(lanceTipX, y - s * 0.5);
  ctx.lineTo(lanceTipX + dir * s * 0.18, y - s * 0.58);
  ctx.lineTo(lanceTipX, y - s * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.stroke();
};
