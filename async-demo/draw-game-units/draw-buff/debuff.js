/**
 * @description: 绘制中毒效果（冒绿色泡泡）
 * @param {CanvasRenderingContext2D} ctx 画布上下文
 * @param {Object} currentUnit 当前单位
 * @param {Number} currentUnit.x 当前单位x坐标
 * @param {Number} currentUnit.y 当前单位y坐标
 * @param {Number} currentUnit.size 当前单位大小
 * @param {Number} currentUnit.frame 当前单位帧数
 */
export const drawPoisoning = (ctx, { x, y, size, frame }) => {
  if (!ctx || frame === undefined) return;

  const unit = size / 16;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const baseRadius = size * 0.45;

  ctx.save();

  // 透明度脉动
  const baseAlpha = 0.6 + 0.3 * Math.sin(frame * 0.15);

  // === 绿色泡泡上升 ===
  const bubbleCount = 5;
  for (let i = 0; i < bubbleCount; i++) {
    // 泡泡从底部上升
    const phase = (frame * 0.04 + i * 0.6) % 1;
    const bubbleX = cx + Math.sin(frame * 0.05 + i * 1.2) * baseRadius * 0.7;
    const bubbleY = y + size - phase * size * 1.5;
    const bubbleR = unit * (1.8 + 0.8 * Math.sin(frame * 0.06 + i));
    const bubbleAlpha = baseAlpha * Math.sin(phase * Math.PI);

    if (bubbleAlpha > 0.05) {
      // 泡泡深色描边（明显的毒感）
      ctx.strokeStyle = `rgba(0, 100, 0, ${bubbleAlpha * 0.8})`;
      ctx.lineWidth = Math.max(1.5, unit * 0.5);
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleR, 0, Math.PI * 2);
      ctx.stroke();

      // 泡泡主体渐变
      const grad = ctx.createRadialGradient(
        bubbleX - bubbleR * 0.25,
        bubbleY - bubbleR * 0.25,
        0,
        bubbleX,
        bubbleY,
        bubbleR,
      );
      grad.addColorStop(0, `rgba(180, 255, 180, ${bubbleAlpha * 0.9})`);
      grad.addColorStop(0.4, `rgba(50, 205, 50, ${bubbleAlpha * 0.8})`);
      grad.addColorStop(0.7, `rgba(34, 139, 34, ${bubbleAlpha * 0.6})`);
      grad.addColorStop(1, `rgba(0, 80, 0, ${bubbleAlpha * 0.4})`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleR, 0, Math.PI * 2);
      ctx.fill();

      // 泡泡高光
      ctx.fillStyle = `rgba(255, 255, 255, ${bubbleAlpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(
        bubbleX - bubbleR * 0.35,
        bubbleY - bubbleR * 0.35,
        bubbleR * 0.25,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  ctx.restore();
};

/**
 * @description: 绘制混乱效果（紫色气体缠绕）
 * @param {CanvasRenderingContext2D} ctx 画布上下文
 * @param {Object} currentUnit 当前单位
 * @param {Number} currentUnit.x 当前单位x坐标
 * @param {Number} currentUnit.y 当前单位y坐标
 * @param {Number} currentUnit.size 当前单位大小
 * @param {Number} currentUnit.frame 当前单位帧数
 */
export const drawChaos = (ctx, { x, y, size, frame }) => {
  if (!ctx || frame === undefined) return;

  const unit = size / 16;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const baseRadius = size * 0.5;

  ctx.save();

  // 透明度脉动
  const baseAlpha = 0.5 + 0.35 * Math.sin(frame * 0.18);

  // === 紫色气体缠绕（多条螺旋曲线）===
  const gasCount = 2;
  for (let i = 0; i < gasCount; i++) {
    const gasPhase = frame * 0.08 + (i * Math.PI * 2) / gasCount;
    const gasAlpha = baseAlpha * (0.5 + 0.4 * Math.sin(gasPhase + i));

    ctx.save();
    ctx.translate(cx, cy);

    // 绘制螺旋气体
    ctx.strokeStyle = `rgba(138, 43, 226, ${gasAlpha})`;
    ctx.lineWidth = Math.max(1, unit * 0.8);
    ctx.lineCap = "round";
    ctx.beginPath();

    for (let t = 0; t < Math.PI * 4; t += 0.1) {
      const r = baseRadius * (0.3 + t * 0.08);
      const angle = t + gasPhase + Math.sin(t * 2 + frame * 0.1) * 0.5;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 气体光晕
    ctx.strokeStyle = `rgba(200, 100, 255, ${gasAlpha * 0.5})`;
    ctx.lineWidth = Math.max(1, unit * 1.5);
    ctx.stroke();

    ctx.restore();
  }

  // === 中心紫色雾气 ===
  const coreGrad = ctx.createRadialGradient(
    cx,
    cy,
    0,
    cx,
    cy,
    baseRadius * 0.6,
  );
  coreGrad.addColorStop(0, `rgba(200, 100, 255, ${baseAlpha * 0.6})`);
  coreGrad.addColorStop(0.5, `rgba(138, 43, 226, ${baseAlpha * 0.4})`);
  coreGrad.addColorStop(1, "rgba(75, 0, 130, 0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

/**
 * @description: 绘制封印效果
 * @param {CanvasRenderingContext2D} ctx 画布上下文
 * @param {Object} currentUnit 当前单位
 * @param {Number} currentUnit.x 当前单位x坐标
 * @param {Number} currentUnit.y 当前单位y坐标
 * @param {Number} currentUnit.size 当前单位大小
 * @param {Number} currentUnit.frame 当前单位帧数
 */
export const drawFrozen = (ctx, { x, y, size, frame }) => {
  if (!ctx || frame === undefined) return;

  const unit = size / 16;
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.save();

  // 透明度脉动
  const baseAlpha = 0.6 + 0.3 * Math.sin(frame * 0.12);

  // === 六边形冰块主体（上三角 + 中间长方形 + 下倒三角）===
  const totalHeight = size * 1.15;
  const bodyWidth = size * 0.75;
  const topTriHeight = totalHeight * 0.3;
  const bottomTriHeight = totalHeight * 0.3;
  const midHeight = totalHeight * 0.4;

  const topY = cy - totalHeight / 2;
  const midTopY = topY + topTriHeight;
  const midBottomY = midTopY + midHeight;
  const bottomY = midBottomY + bottomTriHeight;

  // 冰块渐变
  const iceGrad = ctx.createLinearGradient(x, topY, x + size, bottomY);
  iceGrad.addColorStop(0, `rgba(200, 230, 255, ${baseAlpha})`);
  iceGrad.addColorStop(0.25, `rgba(135, 206, 250, ${baseAlpha * 0.9})`);
  iceGrad.addColorStop(0.5, `rgba(176, 224, 230, ${baseAlpha * 0.85})`);
  iceGrad.addColorStop(0.75, `rgba(135, 206, 250, ${baseAlpha * 0.9})`);
  iceGrad.addColorStop(1, `rgba(200, 230, 255, ${baseAlpha})`);

  ctx.fillStyle = iceGrad;
  ctx.strokeStyle = `rgba(100, 149, 237, ${baseAlpha})`;
  ctx.lineWidth = Math.max(1, unit * 0.4);

  // 绘制六边形：上三角 + 中间长方形 + 下倒三角
  ctx.beginPath();
  // 顶部顶点
  ctx.moveTo(cx, topY);
  // 右上斜边到右上角
  ctx.lineTo(cx + bodyWidth / 2, midTopY);
  // 右侧直边向下
  ctx.lineTo(cx + bodyWidth / 2, midBottomY);
  // 右下斜边到右下顶点
  ctx.lineTo(cx, bottomY);
  // 左下斜边到左下角
  ctx.lineTo(cx - bodyWidth / 2, midBottomY);
  // 左侧直边向上
  ctx.lineTo(cx - bodyWidth / 2, midTopY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // === 冰块高光条纹 ===
  ctx.strokeStyle = `rgba(255, 255, 255, ${baseAlpha * 0.5})`;
  ctx.lineWidth = Math.max(0.5, unit * 0.25);
  for (let i = 0; i < 3; i++) {
    const lineY = midTopY + (i + 0.5) * (midHeight / 3);
    ctx.beginPath();
    ctx.moveTo(cx - bodyWidth * 0.35, lineY);
    ctx.lineTo(cx + bodyWidth * 0.35, lineY);
    ctx.stroke();
  }

  // === 冰块边缘裂纹 ===
  ctx.strokeStyle = `rgba(70, 130, 180, ${baseAlpha * 0.4})`;
  ctx.lineWidth = Math.max(0.5, unit * 0.15);
  const cracks = [
    // 上三角裂纹
    [
      cx,
      topY + topTriHeight * 0.3,
      cx + bodyWidth * 0.25,
      midTopY - topTriHeight * 0.2,
    ],
    [
      cx,
      topY + topTriHeight * 0.5,
      cx - bodyWidth * 0.2,
      midTopY - topTriHeight * 0.1,
    ],
    // 下三角裂纹
    [
      cx,
      bottomY - bottomTriHeight * 0.3,
      cx + bodyWidth * 0.2,
      midBottomY + bottomTriHeight * 0.1,
    ],
    [
      cx,
      bottomY - bottomTriHeight * 0.5,
      cx - bodyWidth * 0.25,
      midBottomY + bottomTriHeight * 0.2,
    ],
    // 中间矩形裂纹
    [
      cx - bodyWidth * 0.3,
      midTopY + midHeight * 0.4,
      cx - bodyWidth * 0.35,
      midBottomY - midHeight * 0.3,
    ],
    [
      cx + bodyWidth * 0.25,
      midTopY + midHeight * 0.6,
      cx + bodyWidth * 0.3,
      midBottomY - midHeight * 0.2,
    ],
  ];
  cracks.forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  // === 冰块顶部闪光 ===
  const shineGrad = ctx.createRadialGradient(
    cx,
    topY + topTriHeight * 0.4,
    0,
    cx,
    topY + topTriHeight * 0.4,
    bodyWidth * 0.4,
  );
  shineGrad.addColorStop(0, `rgba(255, 255, 255, ${baseAlpha * 0.7})`);
  shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = shineGrad;
  ctx.beginPath();
  ctx.arc(cx, topY + topTriHeight * 0.4, bodyWidth * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

export const drawSeal = (ctx, { x, y, size, frame }) => {
  if (!ctx || frame === undefined) return;

  const unit = size / 16;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const baseRadius = size * 0.6;

  ctx.save();

  // 更高的透明度脉动
  const baseAlpha = 0.7 + 0.25 * Math.sin(frame * 0.08);

  // === 锁链发光背景 ===
  const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.2);
  glowGrad.addColorStop(0, `rgba(139, 90, 43, ${baseAlpha * 0.4})`);
  glowGrad.addColorStop(0.5, `rgba(139, 69, 19, ${baseAlpha * 0.2})`);
  glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius * 1.2, 0, Math.PI * 2);
  ctx.fill();

  // === 锁链1（左下到右上的缠绕）===
  const chain1Phase = frame * 0.08;
  const chain1Segments = 12;

  for (let i = 0; i < chain1Segments; i++) {
    const t = (i + (chain1Phase % 1)) / chain1Segments;
    const angle = t * Math.PI * 2.5 - Math.PI / 2;
    const r = baseRadius * (0.2 + t * 0.8);

    const linkX = cx + Math.cos(angle) * r;
    const linkY = cy + Math.sin(angle) * r;
    const linkR = unit * (0.8 + 0.3 * Math.sin(t * Math.PI * 3));
    const linkAlpha = baseAlpha * (0.8 + 0.2 * Math.sin(t * Math.PI * 2 + i));

    ctx.save();
    ctx.translate(linkX, linkY);
    ctx.rotate(angle + Math.PI / 4);

    // 链环阴影
    ctx.strokeStyle = `rgba(30, 30, 30, ${linkAlpha})`;
    ctx.lineWidth = Math.max(2, unit * 0.8);
    ctx.beginPath();
    ctx.ellipse(0, 0, linkR * 1.8, linkR * 0.9, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 链环主体（铜色金属）
    ctx.strokeStyle = `rgba(200, 100, 50, ${linkAlpha})`;
    ctx.lineWidth = Math.max(1.5, unit * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, linkR * 1.8, linkR * 0.9, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 链环填充（深铜色）
    ctx.fillStyle = `rgba(100, 50, 20, ${linkAlpha * 0.7})`;
    ctx.fill();

    // 链环高光（金色）
    ctx.strokeStyle = `rgba(255, 200, 100, ${linkAlpha * 0.7})`;
    ctx.lineWidth = Math.max(1, unit * 0.25);
    ctx.beginPath();
    ctx.arc(0, -linkR * 0.4, linkR * 0.4, Math.PI, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // === 锁链2（右下到左上的反向缠绕）===
  const chain2Phase = -frame * 0.08 + Math.PI;
  const chain2Segments = 12;

  for (let i = 0; i < chain2Segments; i++) {
    const t = (i + (chain2Phase % 1)) / chain2Segments;
    const angle = -t * Math.PI * 2.5 + Math.PI / 2;
    const r = baseRadius * (0.2 + t * 0.8);

    const linkX = cx + Math.cos(angle) * r;
    const linkY = cy + Math.sin(angle) * r;
    const linkR = unit * (0.8 + 0.3 * Math.sin(t * Math.PI * 3 + Math.PI));
    const linkAlpha = baseAlpha * (0.8 + 0.2 * Math.sin(t * Math.PI * 2 + i + Math.PI));

    ctx.save();
    ctx.translate(linkX, linkY);
    ctx.rotate(angle - Math.PI / 4);

    ctx.strokeStyle = `rgba(30, 30, 30, ${linkAlpha})`;
    ctx.lineWidth = Math.max(2, unit * 0.8);
    ctx.beginPath();
    ctx.ellipse(0, 0, linkR * 1.8, linkR * 0.9, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(180, 80, 40, ${linkAlpha})`;
    ctx.lineWidth = Math.max(1.5, unit * 0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, linkR * 1.8, linkR * 0.9, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(90, 45, 15, ${linkAlpha * 0.7})`;
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 180, 80, ${linkAlpha * 0.7})`;
    ctx.lineWidth = Math.max(1, unit * 0.25);
    ctx.beginPath();
    ctx.arc(0, -linkR * 0.4, linkR * 0.4, Math.PI, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // === 封印符文核心（更明显）===
  const runeAlpha = baseAlpha * (0.9 + 0.1 * Math.sin(frame * 0.15));

  // 符文外圈光环
  const runeGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, unit * 2.5);
  runeGlow.addColorStop(0, `rgba(255, 200, 50, ${runeAlpha * 0.5})`);
  runeGlow.addColorStop(0.5, `rgba(218, 165, 32, ${runeAlpha * 0.3})`);
  runeGlow.addColorStop(1, "rgba(139, 90, 43, 0)");
  ctx.fillStyle = runeGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, unit * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 符文外圈（双层）
  ctx.strokeStyle = `rgba(139, 69, 19, ${runeAlpha})`;
  ctx.lineWidth = Math.max(2, unit * 0.6);
  ctx.beginPath();
  ctx.arc(cx, cy, unit * 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(218, 165, 32, ${runeAlpha})`;
  ctx.lineWidth = Math.max(1, unit * 0.3);
  ctx.beginPath();
  ctx.arc(cx, cy, unit * 2.2, 0, Math.PI * 2);
  ctx.stroke();

  // 符文内部五芒星（更大更明显）
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(frame * 0.04);

  // 五芒星阴影
  ctx.strokeStyle = `rgba(30, 30, 30, ${runeAlpha})`;
  ctx.lineWidth = Math.max(3, unit * 0.8);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const innerAngle = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
    const outerX = Math.cos(outerAngle) * unit * 1.8;
    const outerY = Math.sin(outerAngle) * unit * 1.8;
    const innerX = Math.cos(innerAngle) * unit * 0.7;
    const innerY = Math.sin(innerAngle) * unit * 0.7;
    if (i === 0) ctx.moveTo(outerX + 1, outerY + 1);
    else ctx.lineTo(outerX + 1, outerY + 1);
    ctx.lineTo(innerX + 1, innerY + 1);
  }
  ctx.closePath();
  ctx.stroke();

  // 五芒星主体
  ctx.strokeStyle = `rgba(255, 215, 0, ${runeAlpha})`;
  ctx.lineWidth = Math.max(2, unit * 0.5);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const innerAngle = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
    const outerX = Math.cos(outerAngle) * unit * 1.8;
    const outerY = Math.sin(outerAngle) * unit * 1.8;
    const innerX = Math.cos(innerAngle) * unit * 0.7;
    const innerY = Math.sin(innerAngle) * unit * 0.7;
    if (i === 0) ctx.moveTo(outerX, outerY);
    else ctx.lineTo(outerX, outerY);
    ctx.lineTo(innerX, innerY);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.restore();

  // 符文中心光点（更亮）
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, unit * 1.5);
  coreGrad.addColorStop(0, `rgba(255, 255, 200, ${runeAlpha})`);
  coreGrad.addColorStop(0.3, `rgba(255, 215, 0, ${runeAlpha * 0.8})`);
  coreGrad.addColorStop(0.7, `rgba(218, 165, 32, ${runeAlpha * 0.5})`);
  coreGrad.addColorStop(1, "rgba(139, 90, 43, 0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, unit * 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
