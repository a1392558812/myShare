/**
 * 绘制终极射线 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} player - 玩家对象
 * @param {Object} skill - 终极射线技能实例
 * @param {Function} toScreen - 坐标转换函数
 * @param {number} gameTime - 游戏时间(ms)
 */
export const drawUltimateRay = (ctx, player, skill, toScreen, gameTime) => {
  if (!skill.active || skill.ultimateRayTimer <= 0) return;

  const ax = player.x;
  const ay = player.y;
  const tx = skill.ultimateRayTargetX;
  const ty = skill.ultimateRayTargetY;

  const dx = tx - ax;
  const dy = ty - ay;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  if (!skill.ultimateRayFrame) skill.ultimateRayFrame = 0;
  skill.ultimateRayFrame += 1;
  const f = skill.ultimateRayFrame;

  const pulse = 0.7 + 0.3 * Math.sin(f * 0.25);

  const playerScreen = toScreen(ax, ay, ctx);
  const targetScreen = toScreen(tx, ty, ctx);

  const screenDx = targetScreen.x - playerScreen.x;
  const screenDy = targetScreen.y - playerScreen.y;
  const screenDist = Math.sqrt(screenDx * screenDx + screenDy * screenDy);

  ctx.save();
  ctx.globalAlpha = 0.12 * pulse;
  ctx.strokeStyle = "#00EEFF";
  ctx.lineWidth = 18 * pulse;
  ctx.lineCap = "round";
  ctx.shadowColor = "#00EEFF";
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(playerScreen.x, playerScreen.y);
  ctx.lineTo(targetScreen.x, targetScreen.y);
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
  ctx.moveTo(playerScreen.x, playerScreen.y);
  ctx.lineTo(targetScreen.x, targetScreen.y);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(playerScreen.x, playerScreen.y);
  ctx.lineTo(targetScreen.x, targetScreen.y);
  ctx.stroke();
  ctx.restore();

  const particleCount = 10;
  for (let i = 0; i < particleCount; i++) {
    const phase = (i * 137 + f * 7) % 1000;
    const t = ((phase % 100) / 100 + (f * 0.04 + i * 0.1)) % 1;
    const px = playerScreen.x + screenDx * t;
    const py = playerScreen.y + screenDy * t;
    const perpNoise = Math.sin(f * 0.5 + i * 2.3) * 2.5;
    const perpX = -screenDy / screenDist * perpNoise;
    const perpY = screenDx / screenDist * perpNoise;

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
  ctx.arc(playerScreen.x, playerScreen.y, 8 * originPulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  const arrayRadius = skill.arrayRadius;
  const hitPulse = 0.6 + 0.4 * Math.sin(f * 0.6 + 1);
  ctx.save();

  ctx.globalAlpha = 0.7 * hitPulse;
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "#00EEFF";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(targetScreen.x, targetScreen.y, arrayRadius * 0.125 * hitPulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.4 * hitPulse;
  ctx.strokeStyle = "#00EEFF";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(targetScreen.x, targetScreen.y, arrayRadius * 0.3 * hitPulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.5 * hitPulse;
  ctx.strokeStyle = "#88DDFF";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + f * 0.08;
    const r1 = arrayRadius * 0.2;
    const r2 = arrayRadius * (0.35 + 0.1 * hitPulse);
    ctx.beginPath();
    ctx.moveTo(targetScreen.x + Math.cos(angle) * r1, targetScreen.y + Math.sin(angle) * r1);
    ctx.lineTo(targetScreen.x + Math.cos(angle) * r2, targetScreen.y + Math.sin(angle) * r2);
    ctx.stroke();
  }

  ctx.restore();
};
