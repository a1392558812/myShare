export const drawPoisoning = (ctx, { x, y, size, frame }) => {
  if (!ctx || frame === undefined) return;

  const unit = size / 16;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const baseRadius = size * 0.45;

  ctx.save();

  const baseAlpha = 0.6 + 0.3 * Math.sin(frame * 0.15);

  const bubbleCount = 5;
  for (let i = 0; i < bubbleCount; i++) {
    const phase = (frame * 0.04 + i * 0.6) % 1;
    const bubbleX = cx + Math.sin(frame * 0.05 + i * 1.2) * baseRadius * 0.7;
    const bubbleY = y + size - phase * size * 1.5;
    const bubbleR = unit * (1.8 + 0.8 * Math.sin(frame * 0.06 + i));
    const bubbleAlpha = baseAlpha * Math.sin(phase * Math.PI);

    if (bubbleAlpha > 0.05) {
      ctx.strokeStyle = `rgba(0, 100, 0, ${bubbleAlpha * 0.8})`;
      ctx.lineWidth = Math.max(1.5, unit * 0.5);
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleR, 0, Math.PI * 2);
      ctx.stroke();

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

export const drawChaos = (ctx, { x, y, size, frame }) => {
  if (!ctx || frame === undefined) return;

  const unit = size / 16;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const baseRadius = size * 0.5;

  ctx.save();

  const baseAlpha = 0.5 + 0.35 * Math.sin(frame * 0.18);

  const gasCount = 2;
  for (let i = 0; i < gasCount; i++) {
    const gasPhase = frame * 0.08 + (i * Math.PI * 2) / gasCount;
    const gasAlpha = baseAlpha * (0.5 + 0.4 * Math.sin(gasPhase + i));

    ctx.save();
    ctx.translate(cx, cy);

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

    ctx.strokeStyle = `rgba(200, 100, 255, ${gasAlpha * 0.5})`;
    ctx.lineWidth = Math.max(1, unit * 1.5);
    ctx.stroke();

    ctx.restore();
  }

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

export const drawFrozen = (ctx, { x, y, size, frame }) => {
  if (!ctx || frame === undefined) return;

  const unit = size / 16;
  const cx = x + size / 2;
  const cy = y + size / 2;

  ctx.save();

  const baseAlpha = 0.6 + 0.3 * Math.sin(frame * 0.12);

  const totalHeight = size * 1.15;
  const bodyWidth = size * 0.75;
  const topTriHeight = totalHeight * 0.3;
  const bottomTriHeight = totalHeight * 0.3;
  const midHeight = totalHeight * 0.4;

  const topY = cy - totalHeight / 2;
  const midTopY = topY + topTriHeight;
  const midBottomY = midTopY + midHeight;
  const bottomY = midBottomY + bottomTriHeight;

  const iceGrad = ctx.createLinearGradient(x, topY, x + size, bottomY);
  iceGrad.addColorStop(0, `rgba(200, 230, 255, ${baseAlpha})`);
  iceGrad.addColorStop(0.25, `rgba(135, 206, 250, ${baseAlpha * 0.9})`);
  iceGrad.addColorStop(0.5, `rgba(176, 224, 230, ${baseAlpha * 0.85})`);
  iceGrad.addColorStop(0.75, `rgba(135, 206, 250, ${baseAlpha * 0.9})`);
  iceGrad.addColorStop(1, `rgba(200, 230, 255, ${baseAlpha})`);

  ctx.fillStyle = iceGrad;
  ctx.strokeStyle = `rgba(100, 149, 237, ${baseAlpha})`;
  ctx.lineWidth = Math.max(1, unit * 0.4);

  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx + bodyWidth / 2, midTopY);
  ctx.lineTo(cx + bodyWidth / 2, midBottomY);
  ctx.lineTo(cx, bottomY);
  ctx.lineTo(cx - bodyWidth / 2, midBottomY);
  ctx.lineTo(cx - bodyWidth / 2, midTopY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = `rgba(255, 255, 255, ${baseAlpha * 0.5})`;
  ctx.lineWidth = Math.max(0.5, unit * 0.25);
  for (let i = 0; i < 3; i++) {
    const lineY = midTopY + (i + 0.5) * (midHeight / 3);
    ctx.beginPath();
    ctx.moveTo(cx - bodyWidth * 0.35, lineY);
    ctx.lineTo(cx + bodyWidth * 0.35, lineY);
    ctx.stroke();
  }

  ctx.strokeStyle = `rgba(70, 130, 180, ${baseAlpha * 0.4})`;
  ctx.lineWidth = Math.max(0.5, unit * 0.15);
  const cracks = [
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

  ctx.save();

  const pulseScale = 1 + 0.05 * Math.sin(frame * 0.15);
  const baseAlpha = 0.9 + 0.08 * Math.sin(frame * 0.12);
  const glowPulse = 0.3 + 0.2 * Math.sin(frame * 0.2);

  const totalHeight = size * 0.9;
  const startY = y + size;
  const endY = y - size * 0.2;

  const orbitRadius = size * 0.5;
  const spiralTurns = 2.5;
  const chainLinkCount = 20;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulseScale, pulseScale);

  const ringAlpha = 0.15 + glowPulse * 0.1;
  ctx.strokeStyle = `rgba(180, 80, 200, ${ringAlpha})`;
  ctx.lineWidth = Math.max(2, unit * 0.5);
  ctx.beginPath();
  ctx.arc(0, 0, orbitRadius * 0.8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(120, 50, 150, ${ringAlpha * 0.7})`;
  ctx.lineWidth = Math.max(1, unit * 0.3);
  ctx.beginPath();
  ctx.arc(0, 0, orbitRadius * 1.1, 0, Math.PI * 2);
  ctx.stroke();

  const mistGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4);
  mistGrad.addColorStop(0, `rgba(150, 50, 200, ${baseAlpha * 0.3})`);
  mistGrad.addColorStop(1, "rgba(100, 30, 150, 0)");
  ctx.fillStyle = mistGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  for (let i = 0; i < chainLinkCount; i++) {
    const t = (frame * 0.005 + i * (1 / chainLinkCount)) % 1;

    const verticalT = t;
    const py = startY - verticalT * (startY - endY);

    const angle = t * Math.PI * 2 * spiralTurns;
    const swayFactor = Math.sin(verticalT * Math.PI);
    const px = cx + Math.cos(angle) * orbitRadius * swayFactor;

    const sizeFactor = 0.7 + swayFactor * 0.3;
    const linkWidth = unit * 2.6 * sizeFactor;
    const linkHeight = unit * 1.3 * sizeFactor;

    const fadeAlpha =
      verticalT < 0.12
        ? verticalT / 0.12
        : verticalT > 0.88
          ? (1 - verticalT) / 0.12
          : 1;
    const alpha = baseAlpha * fadeAlpha;

    const linkAngle = angle + Math.PI / 2;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(linkAngle);

    ctx.shadowColor = `rgba(150, 50, 200, ${alpha * 0.6})`;
    ctx.shadowBlur = unit * 2;

    ctx.fillStyle = `rgba(180, 100, 220, ${alpha * 0.3})`;
    ctx.beginPath();
    ctx.roundRect(
      -linkWidth / 2 - unit * 0.3,
      -linkHeight / 2 - unit * 0.3,
      linkWidth + unit * 0.6,
      linkHeight + unit * 0.6,
      linkHeight / 2,
    );
    ctx.fill();

    const bodyGrad = ctx.createLinearGradient(
      -linkWidth / 2,
      0,
      linkWidth / 2,
      0,
    );
    bodyGrad.addColorStop(0, `rgba(80, 40, 120, ${alpha})`);
    bodyGrad.addColorStop(0.3, `rgba(130, 70, 170, ${alpha})`);
    bodyGrad.addColorStop(0.7, `rgba(130, 70, 170, ${alpha})`);
    bodyGrad.addColorStop(1, `rgba(80, 40, 120, ${alpha})`);
    ctx.fillStyle = bodyGrad;

    ctx.strokeStyle = `rgba(50, 20, 80, ${alpha})`;
    ctx.lineWidth = Math.max(2, unit * 0.4);

    const linkRadius = linkHeight / 2;
    ctx.beginPath();
    ctx.moveTo(-linkWidth / 2 + linkRadius, -linkHeight / 2);
    ctx.lineTo(linkWidth / 2 - linkRadius, -linkHeight / 2);
    ctx.quadraticCurveTo(linkWidth / 2, -linkHeight / 2, linkWidth / 2, 0);
    ctx.lineTo(linkWidth / 2, linkHeight / 2);
    ctx.quadraticCurveTo(
      linkWidth / 2,
      linkHeight / 2,
      linkWidth / 2 - linkRadius,
      linkHeight / 2,
    );
    ctx.lineTo(-linkWidth / 2 + linkRadius, linkHeight / 2);
    ctx.quadraticCurveTo(-linkWidth / 2, linkHeight / 2, -linkWidth / 2, 0);
    ctx.lineTo(-linkWidth / 2, -linkHeight / 2);
    ctx.quadraticCurveTo(
      -linkWidth / 2,
      -linkHeight / 2,
      -linkWidth / 2 + linkRadius,
      -linkHeight / 2,
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = `rgba(220, 180, 255, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(
      -linkWidth / 2 + linkRadius * 0.7,
      -linkHeight / 2 + linkRadius * 0.4,
    );
    ctx.lineTo(
      linkWidth / 2 - linkRadius * 0.7,
      -linkHeight / 2 + linkRadius * 0.4,
    );
    ctx.quadraticCurveTo(
      linkWidth / 2 - linkRadius * 0.2,
      -linkHeight / 2 + linkRadius * 0.4,
      linkWidth / 2 - linkRadius * 0.15,
      linkRadius * 0.2,
    );
    ctx.lineTo(linkWidth / 2 - linkRadius * 0.15, -linkRadius * 0.2);
    ctx.quadraticCurveTo(
      linkWidth / 2 - linkRadius * 0.2,
      -linkHeight / 2 + linkRadius * 0.25,
      -linkWidth / 2 + linkRadius * 0.7,
      -linkHeight / 2 + linkRadius * 0.25,
    );
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(100, 60, 140, ${alpha * 0.4})`;
    ctx.fillRect(
      -unit * 0.15,
      -linkHeight / 2 + unit * 0.2,
      unit * 0.3,
      linkHeight - unit * 0.4,
    );

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  const anchorSize = unit * 1.5;

  const anchorGlow = ctx.createRadialGradient(
    cx,
    startY,
    0,
    cx,
    startY,
    anchorSize * 2,
  );
  anchorGlow.addColorStop(0, `rgba(200, 100, 255, ${baseAlpha * 0.4})`);
  anchorGlow.addColorStop(1, "rgba(150, 50, 200, 0)");
  ctx.fillStyle = anchorGlow;
  ctx.beginPath();
  ctx.arc(cx, startY, anchorSize * 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(100, 50, 150, ${baseAlpha})`;
  ctx.beginPath();
  ctx.arc(cx, startY, anchorSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(60, 30, 100, ${baseAlpha})`;
  ctx.lineWidth = Math.max(2, unit * 0.5);
  ctx.stroke();

  ctx.fillStyle = `rgba(150, 100, 200, ${baseAlpha * 0.7})`;
  ctx.beginPath();
  ctx.arc(
    cx - anchorSize * 0.35,
    startY - anchorSize * 0.35,
    anchorSize * 0.5,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const topGlow = ctx.createRadialGradient(cx, endY, 0, cx, endY, unit * 2.5);
  topGlow.addColorStop(0, `rgba(255, 150, 255, ${baseAlpha * 0.6})`);
  topGlow.addColorStop(0.5, `rgba(200, 100, 255, ${baseAlpha * 0.3})`);
  topGlow.addColorStop(1, "rgba(150, 50, 200, 0)");
  ctx.fillStyle = topGlow;
  ctx.beginPath();
  ctx.arc(cx, endY, unit * 2.5, 0, Math.PI * 2);
  ctx.fill();

  const particleCount = 12;
  for (let i = 0; i < particleCount; i++) {
    const particleT = (frame * 0.04 + i * 0.15) % 1;
    const particleAngle = particleT * Math.PI * 2 + i * 0.5;
    const particleRadius =
      orbitRadius * (0.7 + Math.sin(frame * 0.1 + i) * 0.2);
    const px = cx + Math.cos(particleAngle) * particleRadius;
    const py = startY - particleT * (startY - endY) * 0.8;

    const pSize = unit * (0.4 + Math.sin(frame * 0.3 + i) * 0.2);
    const pAlpha = baseAlpha * (0.5 + Math.sin(frame * 0.2 + i) * 0.3);

    ctx.fillStyle = `rgba(200, 100, 255, ${pAlpha * 0.4})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 180, 255, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};
