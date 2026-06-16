import { ref } from "vue";

export const laser = ref({
  isActive: false,
  frame: 0,
  mouseX: 0,
  mouseY: 0,
});

export function drawLaser(ctx, canvasFrame, units, selectedUnit) {
  if (!laser.value.isActive) return;

  const attacker = units.value[selectedUnit.value];
  if (!attacker) return;

  const unitSize = attacker.size || 40;
  const ax = attacker.x + unitSize / 2;
  const ay = attacker.y + unitSize / 2;
  const tx = laser.value.mouseX;
  const ty = laser.value.mouseY;

  const dx = tx - ax;
  const dy = ty - ay;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  laser.value.frame += 1;
  const f = laser.value.frame;

  const pulse = 0.7 + 0.3 * Math.sin(f * 0.25);

  ctx.save();
  ctx.globalAlpha = 0.12 * pulse;
  ctx.strokeStyle = "#00EEFF";
  ctx.lineWidth = 18 * pulse;
  ctx.lineCap = "round";
  ctx.shadowColor = "#00EEFF";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.35 * pulse;
  ctx.strokeStyle = "#88DDFF";
  ctx.lineWidth = 8 * pulse;
  ctx.lineCap = "round";
  ctx.shadowColor = "#88DDFF";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.restore();

  const particleCount = 10;
  for (let i = 0; i < particleCount; i++) {
    const phase = (i * 137 + f * 7) % 1000;
    const t = ((phase % 100) / 100 + (f * 0.04 + i * 0.1)) % 1;
    const px = ax + dx * t;
    const py = ay + dy * t;
    const perpNoise = (Math.sin(f * 0.5 + i * 2.3) * 2.5);
    const perpX = -dy / dist * perpNoise;
    const perpY = dx / dist * perpNoise;

    const alpha = 0.5 + 0.5 * Math.sin(f * 0.3 + i);
    ctx.save();
    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = "#AAEEFF";
    ctx.beginPath();
    ctx.arc(px + perpX, py + perpY, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const originPulse = 0.8 + 0.2 * Math.sin(f * 0.4);
  ctx.save();
  ctx.globalAlpha = 0.6 * originPulse;
  ctx.strokeStyle = "#00EEFF";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#00EEFF";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(ax, ay, 8 * originPulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  const hitPulse = 0.6 + 0.4 * Math.sin(f * 0.6 + 1);
  ctx.save();
  ctx.globalAlpha = 0.7 * hitPulse;
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "#00EEFF";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(tx, ty, 5 * hitPulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.4 * hitPulse;
  ctx.strokeStyle = "#00EEFF";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(tx, ty, 12 * hitPulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.5 * hitPulse;
  ctx.strokeStyle = "#88DDFF";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + f * 0.08;
    const r1 = 8;
    const r2 = 14 + 4 * hitPulse;
    ctx.beginPath();
    ctx.moveTo(tx + Math.cos(a) * r1, ty + Math.sin(a) * r1);
    ctx.lineTo(tx + Math.cos(a) * r2, ty + Math.sin(a) * r2);
    ctx.stroke();
  }
  ctx.restore();
}
