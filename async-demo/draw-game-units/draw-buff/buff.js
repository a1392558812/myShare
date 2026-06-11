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
  const orbitRadius = size * 0.28;

  ctx.save();

  // 透明度和缩放脉动
  const baseAlpha = 0.85 + 0.1 * Math.sin(frame * 0.15);
  const pulseScale = 1 + 0.04 * Math.sin(frame * 0.2);

  // 剑的旋转角度（从帧计数驱动，绕圆心旋转）
  const baseAngle = frame * 0.08;

  // 5把剑，等角度间隔
  const swordCount = 5;
  const angleStep = (Math.PI * 2) / swordCount;

  // 剑的尺寸（缩小以容纳5把）
  const bladeWidth = unit * 1.0;
  const bladeHeight = unit * 2.8;
  const guardWidth = unit * 2.0;
  const guardHeight = unit * 0.8;
  const handleWidth = unit * 0.8;
  const handleHeight = unit * 1.5;

  for (let i = 0; i < swordCount; i++) {
    const angle = baseAngle + i * angleStep;
    const swordX = cx + orbitRadius * Math.cos(angle);
    const swordY = cy + orbitRadius * Math.sin(angle);

    ctx.save();
    ctx.translate(swordX, swordY);
    ctx.rotate(angle + Math.PI / 2);
    ctx.scale(pulseScale, pulseScale);

    // 剑柄（底部）
    ctx.fillStyle = `rgba(101, 67, 33, ${baseAlpha})`;
    ctx.fillRect(-handleWidth / 2, guardHeight / 2, handleWidth, handleHeight);

    // 剑柄装饰
    ctx.fillStyle = `rgba(139, 90, 43, ${baseAlpha * 0.9})`;
    ctx.fillRect(
      -handleWidth / 2,
      guardHeight / 2 + unit * 0.25,
      handleWidth,
      unit * 0.35,
    );
    ctx.fillRect(
      -handleWidth / 2,
      guardHeight / 2 + unit * 1.0,
      handleWidth,
      unit * 0.35,
    );

    // 剑柄末端圆球
    ctx.fillStyle = `rgba(218, 165, 32, ${baseAlpha})`;
    ctx.beginPath();
    ctx.arc(0, guardHeight / 2 + handleHeight, unit * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 剑柄圆球高光
    ctx.fillStyle = `rgba(255, 215, 100, ${baseAlpha * 0.9})`;
    ctx.beginPath();
    ctx.arc(
      -unit * 0.12,
      guardHeight / 2 + handleHeight - unit * 0.12,
      unit * 0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // 剑格（护手）
    ctx.fillStyle = `rgba(139, 90, 43, ${baseAlpha})`;
    ctx.fillRect(-guardWidth / 2, -guardHeight / 2, guardWidth, guardHeight);

    // 剑格高光边缘
    ctx.fillStyle = `rgba(218, 165, 32, ${baseAlpha * 0.9})`;
    ctx.fillRect(-guardWidth / 2, -guardHeight / 2, guardWidth, unit * 0.25);

    // 剑格两端装饰球
    ctx.fillStyle = `rgba(218, 165, 32, ${baseAlpha})`;
    ctx.beginPath();
    ctx.arc(-guardWidth / 2, 0, unit * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(guardWidth / 2, 0, unit * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // 剑刃主体（银色）
    ctx.fillStyle = `rgba(192, 192, 192, ${baseAlpha})`;
    ctx.fillRect(
      -bladeWidth / 2,
      -bladeHeight - guardHeight / 2,
      bladeWidth,
      bladeHeight,
    );

    // 剑刃高光（左侧亮边）
    ctx.fillStyle = `rgba(230, 230, 250, ${baseAlpha * 0.95})`;
    ctx.fillRect(
      -bladeWidth / 2,
      -bladeHeight - guardHeight / 2,
      unit * 0.35,
      bladeHeight,
    );

    // 剑刃阴影（右侧暗边）
    ctx.fillStyle = `rgba(120, 120, 140, ${baseAlpha * 0.85})`;
    ctx.fillRect(
      bladeWidth / 2 - unit * 0.35,
      -bladeHeight - guardHeight / 2,
      unit * 0.35,
      bladeHeight,
    );

    // 剑刃中央血槽
    ctx.fillStyle = `rgba(150, 150, 170, ${baseAlpha * 0.6})`;
    ctx.fillRect(
      -unit * 0.12,
      -bladeHeight * 0.8 - guardHeight / 2,
      unit * 0.24,
      bladeHeight * 0.7,
    );

    // 剑尖（三角形尖）
    ctx.fillStyle = `rgba(192, 192, 192, ${baseAlpha})`;
    ctx.beginPath();
    ctx.moveTo(-bladeWidth / 2, -bladeHeight - guardHeight / 2);
    ctx.lineTo(0, -bladeHeight * 1.3 - guardHeight / 2);
    ctx.lineTo(bladeWidth / 2, -bladeHeight - guardHeight / 2);
    ctx.closePath();
    ctx.fill();

    // 剑尖高光
    ctx.fillStyle = `rgba(230, 230, 250, ${baseAlpha * 0.9})`;
    ctx.beginPath();
    ctx.moveTo(-bladeWidth / 2, -bladeHeight - guardHeight / 2);
    ctx.lineTo(-unit * 0.08, -bladeHeight * 1.25 - guardHeight / 2);
    ctx.lineTo(0, -bladeHeight - guardHeight / 2);
    ctx.closePath();
    ctx.fill();

    // 剑刃光芒效果（随帧闪烁）
    const glowIntensity = 0.4 + 0.3 * Math.sin(frame * 0.3 + i);
    ctx.strokeStyle = `rgba(255, 100, 50, ${baseAlpha * glowIntensity})`;
    ctx.lineWidth = Math.max(1, unit * 0.25);
    ctx.beginPath();
    ctx.moveTo(
      -bladeWidth / 2 - unit * 0.15,
      -bladeHeight * 0.5 - guardHeight / 2,
    );
    ctx.lineTo(
      bladeWidth / 2 + unit * 0.15,
      -bladeHeight * 0.5 - guardHeight / 2,
    );
    ctx.stroke();

    ctx.restore();
  }

  // 旋转轨迹光晕（淡红色圆环）
  ctx.strokeStyle = `rgba(220, 80, 60, ${baseAlpha * 0.2})`;
  ctx.lineWidth = Math.max(1, unit * 0.3);
  ctx.beginPath();
  ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
};

export const drawRecover = (ctx, { x, y, size, frame }) => {
  if (!ctx || frame === undefined) return;

  const unit = size / 16;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const orbitRadius = size * 0.38;
  const spawnY = y + size * 0.95;
  const topY = y - size * 0.05;

  ctx.save();

  const baseAlpha = 0.85 + 0.12 * Math.sin(frame * 0.1);

  const totalParticles = 14;

  for (let i = 0; i < totalParticles; i++) {
    // 每个粒子的相位，0~1 循环
    const phase = ((frame * 0.5 + i * (200 / totalParticles)) % 200) / 200;

    // y 从底部 spawnY 上升到顶部 topY
    const py = spawnY - phase * (spawnY - topY);

    // 环绕效果：根据上升进度在水平方向做左右摆动，形成螺旋升腾
    // 越接近中心（y接近cy），摆动幅度越大（等于orbitRadius），接近顶部/底部时收窄
    const verticalT = (py - topY) / (spawnY - topY);
    const swayFactor = Math.sin(verticalT * Math.PI);
    const angle = phase * Math.PI * 4 + i * 0.6;
    const px = cx + Math.cos(angle) * orbitRadius * swayFactor;

    // 粒子大小：从小开始，中心最大，顶部逐渐消散
    const sizeFactor = Math.sin(verticalT * Math.PI) * 0.9 + 0.1;
    const isRed = i % 2 === 0;
    const pSize = (isRed ? unit * 1.3 : unit * 1.1) * sizeFactor;

    // 透明度：顶部淡出
    const fadeAlpha = verticalT < 0.15 ? verticalT / 0.15 : (verticalT > 0.8 ? (1 - verticalT) / 0.2 : 1);
    const alpha = baseAlpha * fadeAlpha;

    // 颜色选择
    const glowColor = isRed ? `rgba(255, 80, 80, ${alpha * 0.25})` : `rgba(80, 160, 255, ${alpha * 0.25})`;
    const highlight = isRed ? `rgba(255, 220, 220, ${alpha})` : `rgba(220, 240, 255, ${alpha})`;
    const midColor = isRed ? `rgba(255, 100, 100, ${alpha * 0.9})` : `rgba(80, 160, 255, ${alpha * 0.9})`;
    const darkColor = isRed ? `rgba(180, 30, 30, ${alpha * 0.7})` : `rgba(30, 80, 180, ${alpha * 0.7})`;

    // 光晕
    ctx.beginPath();
    ctx.fillStyle = glowColor;
    ctx.arc(px, py, pSize * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 粒子核心
    ctx.beginPath();
    const grad = ctx.createRadialGradient(px - pSize * 0.2, py - pSize * 0.2, 0, px, py, pSize);
    grad.addColorStop(0, highlight);
    grad.addColorStop(0.5, midColor);
    grad.addColorStop(1, darkColor);
    ctx.fillStyle = grad;
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // 中心光点
  const centerSize = unit * 0.9 + Math.sin(frame * 0.2) * unit * 0.3;
  ctx.beginPath();
  const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerSize * 2);
  centerGrad.addColorStop(0, `rgba(255, 255, 255, ${baseAlpha * 0.8})`);
  centerGrad.addColorStop(0.4, `rgba(200, 120, 200, ${baseAlpha * 0.35})`);
  centerGrad.addColorStop(1, `rgba(255, 100, 100, 0)`);
  ctx.fillStyle = centerGrad;
  ctx.arc(cx, cy, centerSize * 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
