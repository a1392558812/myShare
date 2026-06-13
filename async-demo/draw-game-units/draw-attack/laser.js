/**
 * 激光持续攻击系统
 * 按住 c 键，selectedUnit 向鼠标位置持续发射激光；松开 c 键中断
 */
import { ref } from "vue";

// ===================== 状态 =====================
export const laser = ref({
  isActive: false,
  frame: 0,
  mouseX: 0,
  mouseY: 0,
});

// ===================== 绘制 =====================
/** 在每帧中绘制激光 */
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

  // ---- 核心光束（多层叠加，带脉动宽度） ----
  const pulse = 0.7 + 0.3 * Math.sin(f * 0.25);

  // 层1：最宽的外层光晕（淡蓝/青色）
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

  // 层2：中层光晕（白蓝）
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

  // 层3：内核光束（纯白）
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

  // ---- 能量粒子噪点（沿光束随机跳动） ----
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

  // ---- 发射源光圈（在攻击者中心） ----
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

  // ---- 命中点爆散（鼠标位置） ----
  const hitPulse = 0.6 + 0.4 * Math.sin(f * 0.6 + 1);
  ctx.save();
  ctx.globalAlpha = 0.7 * hitPulse;
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "#00EEFF";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(tx, ty, 5 * hitPulse, 0, Math.PI * 2);
  ctx.fill();
  // 外环
  ctx.globalAlpha = 0.4 * hitPulse;
  ctx.strokeStyle = "#00EEFF";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(tx, ty, 12 * hitPulse, 0, Math.PI * 2);
  ctx.stroke();
  // 发散短线（6条）
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
