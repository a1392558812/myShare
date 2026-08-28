import { UNIT_RADIUS } from '../../constants.js';
import { circle, line, triangle, arc } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.012) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.012)) * s * 0.05 : Math.sin(t * 0.003) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 350) : 0;
  const robeSway = Math.sin(t * 0.005) * s * 0.05 + walkPhase * s * 0.08;
  const staffGlow = 1 + atkProg * 2 + Math.sin(t * 0.004) * 0.3;

  const x = unit.x;
  const y = unit.y - bob;
  const legSwing = walkPhase * s * 0.12;

  ctx.fillStyle = '#1e3a8a';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.35, y);
  ctx.lineTo(x - s * 0.5 + robeSway, y + s * 0.95);
  ctx.lineTo(x + s * 0.5 - robeSway, y + s * 0.95);
  ctx.lineTo(x + s * 0.35, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#172554';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#93c5fd';
  ctx.font = `${s * 0.4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('✦', x, y + s * 0.55);

  const breathScale = moving ? 1 : 1 + Math.sin(t * 0.003) * 0.03;
  ctx.fillStyle = '#1e40af';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y - s * 0.25);
  ctx.lineTo(x - s * 0.38 * breathScale, y + s * 0.1);
  ctx.lineTo(x + s * 0.38 * breathScale, y + s * 0.1);
  ctx.lineTo(x + s * 0.3, y - s * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#172554';
  ctx.lineWidth = 1;
  ctx.stroke();

  circle(ctx, x, y - s * 0.5, s * 0.28, '#fde68a', '#92400e', 1);

  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, y - s * 0.4);
  ctx.quadraticCurveTo(x, y - s * 0.15, x + s * 0.15, y - s * 0.4);
  ctx.lineTo(x + s * 0.12, y - s * 0.35);
  ctx.quadraticCurveTo(x, y - s * 0.25, x - s * 0.12, y - s * 0.35);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(x + dir * s * 0.02, y - s * 0.55, dir * s * 0.08, s * 0.05);

  const hatTilt = walkPhase * s * 0.05;
  triangle(ctx, x - s * 0.3, y - s * 0.7, x + s * 0.3, y - s * 0.7, x + dir * s * 0.05 + hatTilt, y - s * 1.35, '#1e3a8a', '#0c1e5e', 1.5);
  ctx.fillStyle = '#172554';
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.7, s * 0.35, s * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fbbf24';
  ctx.font = `${s * 0.35}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('★', x + dir * s * 0.05 + hatTilt, y - s * 1.15);

  const staffX = x + dir * s * 0.5;
  const staffLift = atkProg * s * 0.3;
  line(ctx, staffX, y + s * 0.5, staffX + dir * s * 0.1, y - s * (0.8 + staffLift), s * 0.08, '#92400e');
  const gemX = staffX + dir * s * 0.1;
  const gemY = y - s * (0.85 + staffLift);
  const glowR = s * (0.25 + atkProg * 0.15);
  ctx.fillStyle = `rgba(96, 165, 250, ${0.2 + atkProg * 0.3})`;
  ctx.beginPath();
  ctx.arc(gemX, gemY, glowR * staffGlow, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, gemX, gemY, s * 0.15, '#60a5fa', '#1e3a8a', 1.5);
  if (atkProg > 0.1) {
    ctx.strokeStyle = `rgba(96, 165, 250, ${atkProg})`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI * 2 * i) / 6 + t * 0.005;
      ctx.beginPath();
      ctx.moveTo(gemX + Math.cos(ang) * s * 0.18, gemY + Math.sin(ang) * s * 0.18);
      ctx.lineTo(gemX + Math.cos(ang) * s * (0.3 + atkProg * 0.2), gemY + Math.sin(ang) * s * (0.3 + atkProg * 0.2));
      ctx.stroke();
    }
  }
};
