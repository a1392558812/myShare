/**
 * @description: 绘制速度提升效果（蓝色圆）
 * @param {CanvasRenderingContext2D} ctx 画布上下文
 * @param {Object} currentUnit 当前单位
 * @param {Number} currentUnit.x 当前单位x坐标
 * @param {Number} currentUnit.y 当前单位y坐标
 * @param {Number} currentUnit.size 当前单位大小
 * @param {Number} currentUnit.frame 当前单位帧数
 */
export const drawSpeed = (ctx, { x, y, size, frame }) => {
  if (!ctx || frame === undefined) return;

  const unit = size / 16;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const baseRadius = size * 0.35;

  ctx.save();

  // 更小的脉动范围
  const baseAlpha = 0.6 + 0.2 * Math.sin(frame * 0.12);
  const pulseScale = 1 + 0.03 * Math.sin(frame * 0.15);

  // 外圆环（更厚）
  ctx.strokeStyle = `rgba(50, 120, 255, ${baseAlpha})`;
  ctx.lineWidth = Math.max(5, unit * 2); // 更厚的圆环
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius * pulseScale, 0, Math.PI * 2);
  ctx.stroke();

  // 外圆环高光
  ctx.strokeStyle = `rgba(150, 200, 255, ${baseAlpha * 0.85})`;
  ctx.lineWidth = Math.max(3, unit * 1.4);
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius * pulseScale * 0.93, 0, Math.PI * 2);
  ctx.stroke();

  // 内圆环（更厚）
  ctx.strokeStyle = `rgba(80, 150, 255, ${baseAlpha * 0.75})`;
  ctx.lineWidth = Math.max(3, unit * 1.4);
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius * pulseScale * 0.55, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
};

export const drawDefense = (ctx, { x, y, size, frame }) => {
  if (!ctx || frame === undefined) return;

  const unit = size / 16;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const baseRadius = size * 0.4;

  ctx.save();

  // 透明度脉动
  const baseAlpha = 0.55 + 0.25 * Math.sin(frame * 0.12);
  const pulseScale = 1 + 0.05 * Math.sin(frame * 0.18);

  // 五边形盾牌形状
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulseScale, pulseScale);

  // 绘制五边形盾牌（底部为圆弧的盾牌形状）
  ctx.beginPath();

  // 顶部顶点
  const topX = 0;
  const topY = -baseRadius;

  // 右上顶点
  const rightTopX = baseRadius * 0.8;
  const rightTopY = -baseRadius * 0.3;

  // 右下顶点
  const rightBottomX = baseRadius * 0.7;
  const rightBottomY = baseRadius * 0.4;

  // 底部圆弧
  const bottomRadius = baseRadius * 0.7;

  // 左下顶点（对称于右下）
  const leftBottomX = -rightBottomX;
  const leftBottomY = rightBottomY;

  // 左上顶点（对称于右上）
  const leftTopX = -rightTopX;
  const leftTopY = rightTopY;

  ctx.moveTo(topX, topY);
  ctx.lineTo(rightTopX, rightTopY);
  ctx.lineTo(rightBottomX, rightBottomY);

  // 底部圆弧（从右下到左下）
  ctx.arc(0, baseRadius * 0.4, bottomRadius, -Math.PI / 4, Math.PI / 4);

  ctx.lineTo(leftBottomX, leftBottomY);
  ctx.lineTo(leftTopX, leftTopY);
  ctx.closePath();

  // 盾牌渐变填充
  const grad = ctx.createLinearGradient(0, -baseRadius, 0, baseRadius);
  grad.addColorStop(0, `rgba(180, 180, 200, ${baseAlpha})`);
  grad.addColorStop(0.5, `rgba(120, 120, 150, ${baseAlpha * 0.85})`);
  grad.addColorStop(1, `rgba(80, 80, 100, ${baseAlpha * 0.7})`);
  ctx.fillStyle = grad;
  ctx.fill();

  // 盾牌边框（更深）
  ctx.strokeStyle = `rgba(20, 20, 30, ${baseAlpha})`;
  ctx.lineWidth = Math.max(3, unit * 0.9);
  ctx.stroke();

  // 内边框阴影效果
  ctx.strokeStyle = `rgba(10, 10, 20, ${baseAlpha * 0.8})`;
  ctx.lineWidth = Math.max(2, unit * 0.5);
  ctx.stroke();

  // 盾牌内部十字装饰
  ctx.strokeStyle = `rgba(200, 200, 220, ${baseAlpha * 0.6})`;
  ctx.lineWidth = Math.max(1, unit * 0.3);

  // 水平横线
  ctx.beginPath();
  ctx.moveTo(-baseRadius * 0.5, 0);
  ctx.lineTo(baseRadius * 0.5, 0);
  ctx.stroke();

  // 垂直竖线
  ctx.beginPath();
  ctx.moveTo(0, -baseRadius * 0.7);
  ctx.lineTo(0, baseRadius * 0.3);
  ctx.stroke();

  ctx.restore();

  // 外圈光晕
  ctx.strokeStyle = `rgba(150, 150, 200, ${baseAlpha * 0.4})`;
  ctx.lineWidth = Math.max(1, unit * 0.2);
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius * pulseScale * 1.2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
};

export const drawAttack = (ctx, { x, y, size, frame }) => {
  if (!ctx || frame === undefined) return;

  const unit = size / 16;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const orbitRadius = size * 0.5;

  ctx.save();

  const cycleDuration = 80;
  const angle = (frame % cycleDuration) / cycleDuration * Math.PI * 2;

  const swordX = cx + Math.cos(angle) * orbitRadius;
  const swordY = cy + Math.sin(angle) * orbitRadius;

  const alpha = 0.7 + 0.3 * Math.sin(frame * 0.15);

  ctx.save();
  ctx.translate(swordX, swordY);
  ctx.rotate(angle + Math.PI / 4);

  const swordLength = unit * 2.8;
  const bladeWidth = unit * 0.55;
  const handleLength = unit * 0.7;

  const bladeGrad = ctx.createLinearGradient(
    0,
    -swordLength / 2,
    0,
    swordLength / 2,
  );
  bladeGrad.addColorStop(0, `rgba(255, 215, 0, ${alpha})`);
  bladeGrad.addColorStop(0.5, `rgba(218, 165, 32, ${alpha * 0.9})`);
  bladeGrad.addColorStop(1, `rgba(180, 130, 20, ${alpha * 0.75})`);

  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(0, -swordLength / 2);
  ctx.lineTo(-bladeWidth / 2, swordLength / 2 - handleLength);
  ctx.lineTo(0, swordLength / 2 - handleLength - unit * 0.15);
  ctx.lineTo(bladeWidth / 2, swordLength / 2 - handleLength);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = `rgba(139, 90, 43, ${alpha})`;
  ctx.lineWidth = Math.max(1, unit * 0.12);
  ctx.stroke();

  ctx.fillStyle = `rgba(80, 50, 30, ${alpha})`;
  ctx.fillRect(
    -unit * 0.22,
    swordLength / 2 - handleLength,
    unit * 0.44,
    handleLength,
  );

  ctx.fillStyle = `rgba(218, 165, 32, ${alpha})`;
  ctx.fillRect(
    -unit * 0.45,
    swordLength / 2 - handleLength - unit * 0.08,
    unit * 0.9,
    unit * 0.16,
  );

  ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
  ctx.beginPath();
  ctx.arc(0, swordLength / 2, unit * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  const tailLength = size * 0.2;
  const tailAngle = angle - Math.PI / 6;
  const tailGrad = ctx.createLinearGradient(
    swordX - Math.cos(tailAngle) * tailLength,
    swordY - Math.sin(tailAngle) * tailLength,
    swordX,
    swordY,
  );
  tailGrad.addColorStop(0, "rgba(255, 200, 50, 0)");
  tailGrad.addColorStop(1, `rgba(255, 200, 50, ${alpha * 0.5})`);

  ctx.strokeStyle = tailGrad;
  ctx.lineWidth = Math.max(2, unit * 0.4);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(
    swordX - Math.cos(tailAngle) * tailLength,
    swordY - Math.sin(tailAngle) * tailLength,
  );
  ctx.lineTo(swordX, swordY);
  ctx.stroke();

  ctx.restore();
};
