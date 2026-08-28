import { UNIT_RADIUS } from '../../constants.js';
import { circle, line, roundRect, rect } from './helpers.js';

export default (ctx, unit, time = 0) => {
  const s = unit.size || UNIT_RADIUS;
  const t = time || Date.now();
  const moving = !!unit.moving;
  const dir = unit.side === 'player' ? 1 : -1;

  const walkPhase = moving ? Math.sin(t * 0.01) : 0;
  const bob = moving ? Math.abs(Math.sin(t * 0.01)) * s * 0.05 : Math.sin(t * 0.003) * s * 0.02;
  const atkProg = unit.lastAttackTime ? Math.max(0, 1 - (t - unit.lastAttackTime) / 400) : 0;
  const robeSway = Math.sin(t * 0.005) * s * 0.04 + walkPhase * s * 0.06;
  const healPulse = atkProg > 0 ? Math.sin(t * 0.02) * 0.15 + 1 : 1;

  const blessingActive = unit.healCount > 0 && unit.healCount % 3 === 0 && atkProg > 0;
  const reviveReady = unit.hasRevived === false;

  const x = unit.x;
  const y = unit.y - bob;

  if (blessingActive) {
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.6 * atkProg})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.9, s * 0.6, s * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const angle = t * 0.005 + (i * Math.PI * 2) / 3;
      const px = x + Math.cos(angle) * s * 0.6;
      const py = y - s * 0.9 + Math.sin(angle) * s * 0.15;
      circle(ctx, px, py, s * 0.05, `rgba(251, 191, 36, ${atkProg})`, null);
    }
  }

  if (unit.blessEndTime && Date.now() < unit.blessEndTime && unit.defId !== 'priest') {
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.4 + Math.sin(t * 0.008) * 0.15})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + s * 0.5, s * 0.7, s * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const px = x + Math.sin(t * 0.01 + i * 2) * s * 0.4;
      const py = y - ((t * 0.04 + i * s * 0.3) % (s * 1.2));
      circle(ctx, px, py, s * 0.03, 'rgba(251, 191, 36, 0.5)', null);
    }
  }

  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.moveTo(x - s * 0.3, y - s * 0.15);
  ctx.lineTo(x - s * 0.45 + robeSway, y + s * 0.95);
  ctx.lineTo(x + s * 0.45 - robeSway, y + s * 0.95);
  ctx.lineTo(x + s * 0.3, y - s * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  rect(ctx, x - s * 0.35, y + s * 0.2, s * 0.7, s * 0.06, '#fbbf24', null);

  circle(ctx, x, y - s * 0.5, s * 0.28, '#fde68a', '#92400e', 1);

  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.5, s * 0.34, Math.PI * 0.85, Math.PI * 2.15);
  ctx.lineTo(x + s * 0.28, y - s * 0.25);
  ctx.lineTo(x - s * 0.28, y - s * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#1e3a8a';
  if (atkProg > 0.3) {
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x - dir * s * 0.08, y - s * 0.52, s * 0.04, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + dir * s * 0.08, y - s * 0.52, s * 0.04, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else {
    circle(ctx, x - dir * s * 0.08, y - s * 0.52, s * 0.03, '#1e3a8a', null);
    circle(ctx, x + dir * s * 0.08, y - s * 0.52, s * 0.03, '#1e3a8a', null);
  }

  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.42, s * 0.08, 0.2, Math.PI - 0.2);
  ctx.stroke();

  const staffX = x + dir * s * 0.45;
  const staffLift = atkProg * s * 0.25;
  line(ctx, staffX, y + s * 0.6, staffX, y - s * (0.8 + staffLift), s * 0.07, '#92400e');
  const crossY = y - s * (0.6 + staffLift);
  line(ctx, staffX - s * 0.15, crossY, staffX + s * 0.15, crossY, s * 0.08, '#fbbf24');
  line(ctx, staffX, crossY - s * 0.15, staffX, crossY + s * 0.15, s * 0.08, '#fbbf24');
  ctx.strokeStyle = `rgba(251, 191, 36, ${0.3 + atkProg * 0.4})`;
  ctx.lineWidth = 2 * healPulse;
  ctx.beginPath();
  ctx.arc(staffX, crossY, s * 0.25 * healPulse, 0, Math.PI * 2);
  ctx.stroke();

  if (atkProg > 0) {
    ctx.strokeStyle = `rgba(34, 197, 94, ${atkProg * 0.4})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.ellipse(x, y + s * 0.95, s * (0.5 + atkProg * 0.3), s * (0.15 + atkProg * 0.1), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = `rgba(34, 197, 94, ${atkProg * 0.6})`;
    for (let i = 0; i < 4; i++) {
      const px = x + Math.sin(t * 0.01 + i) * s * 0.4;
      const py = y - ((t * 0.05 + i * s * 0.3) % (s * 1.5));
      circle(ctx, px, py, s * 0.03, `rgba(34, 197, 94, ${atkProg * 0.6})`, null);
    }
  } else {
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.ellipse(x, y + s * 0.95, s * 0.5, s * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (reviveReady) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(t * 0.005) * 0.15})`;
    ctx.lineWidth = 1;
    const cr = s * 0.2;
    ctx.beginPath();
    ctx.moveTo(x - cr, y + s * 1.1);
    ctx.lineTo(x + cr, y + s * 1.1);
    ctx.moveTo(x, y + s * 1.0);
    ctx.lineTo(x, y + s * 1.2);
    ctx.stroke();
  }
};
