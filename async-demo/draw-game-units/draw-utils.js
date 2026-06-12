export const drawPixel = ({ px, py, color, ctx, x, y, unit }) => {
  ctx.fillStyle = color;
  ctx.fillRect(x + px * unit, y + py * unit, unit, unit);
};

/**
 * @description 绘制单位
 * @param {CanvasRenderingContext2D} ctx canvas元素
 * @param {Object} currentUnit 当前单位
 * @param {Number} currentUnit.x 当单位x坐标
 * @param {Number} currentUnit.y 当单位y坐标
 * @param {Number} currentUnit.size 当单位大小
 * @param {String} currentUnit.direction 当单位方向
 * @param {Number} currentUnit.frame 当单位帧数坐标
 * @param {Boolean} currentUnit.isMoving 当单位是否移动
 * @param {Object} facePixels 当单位人脸像素
 * @param {Array} facePixels.down 当单位人脸下像素
 * @param {Array} facePixels.up 当单位人脸上像素
 * @param {Array} facePixels.left 当单位人脸左像素
 * @param {Array} facePixels.right 当单位人脸右像素
 * @param {Array} facePixels.walk 当单位行走走像素
 * @param {Array} facePixels.idle 当单位空闲像素
 * @returns
 */
export const drawUnit = (ctx, currentUnit, facePixels) => {
  const x = currentUnit.x;
  const y = currentUnit.y;
  const unit = currentUnit.size / 18;
  const direction = currentUnit.direction || "down";
  const frame = currentUnit.frame || 0;
  ctx.imageSmoothingEnabled = false;

  let basePixels = facePixels.down;
  if (direction === "up") basePixels = facePixels.up;
  else if (direction === "left") basePixels = facePixels.left;
  else if (direction === "right") basePixels = facePixels.right;

  for (let i = 0; i < basePixels.length; i++) {
    drawPixel({
      px: basePixels[i][0],
      py: basePixels[i][1],
      color: basePixels[i][2],
      ctx,
      x,
      y,
      unit,
    });
  }

  const isMoving = currentUnit.isMoving || false;
  const frames = isMoving ? facePixels.walk : facePixels.idle;
  const frameIndex = Math.floor(frame) % frames.length;
  const currentFrame = frames[frameIndex];

  for (const layer of currentFrame) {
    for (const pixel of layer.pixels) {
      drawPixel({
        px: pixel[0],
        py: pixel[1],
        color: pixel[2],
        ctx,
        x,
        y,
        unit,
      });
    }
  }
};

export const drawAvatar = (ctx, currentUnit, avatarPos, avatarPixels) => {
  const x = avatarPos.x;
  const y = avatarPos.y;
  const unit = currentUnit.size / 16;
  ctx.imageSmoothingEnabled = false;

  for (let i = 0; i < avatarPixels.length; i++) {
    drawPixel({
      px: avatarPixels[i][0],
      py: avatarPixels[i][1],
      color: avatarPixels[i][2],
      ctx,
      x,
      y,
      unit,
    });
  }
};

export const drawSelectionHighlight = (ctx, unit, unitKey) => {
  const size = unit.size || 40;
  const padding = 4;

  // 绘制选择指示器（顶部三角形）
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.moveTo(unit.x + size / 2 - 6, unit.y - padding - 8);
  ctx.lineTo(unit.x + size / 2 + 6, unit.y - padding - 8);
  ctx.lineTo(unit.x + size / 2, unit.y - padding - 2);
  ctx.closePath();
  ctx.fill();
};

export const drawBorder = (ctx, unit, unitKey) => {
  const size = unit.size || 40;
  const padding = 0; // 可配置加大判断范围

  ctx.strokeStyle = "#000000";
  ctx.beginPath();
  ctx.moveTo(unit.x - padding, unit.y - padding);
  ctx.lineTo(unit.x + size + padding, unit.y - padding);
  ctx.lineTo(unit.x + size + padding, unit.y + size + padding);
  ctx.lineTo(unit.x - padding, unit.y + size + padding);
  ctx.lineTo(unit.x - padding, unit.y - padding);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.closePath();
};

/**
 * @description {drawHealthBar} 绘制单位生命值条
 * @param {CanvasRenderingContext2D} ctx canvas上下文
 * @param {Object} unit 单位
 * @param {Number} unit.maxHp 单位最大生命值
 * @param {Number} unit.hp 单位当前生命值
 * @param {Number} unit.maxMp 单位最大魔法值
 * @param {Number} unit.mp 单位当前魔法值
 * @param {Number} unit.size 单位大小
 * @param {Number} position 单位位置
 * @param {Number} position.x 单位x坐标
 * @param {Number} position.y 单位y坐标
 * @returns
 */
export const drawHealthBar = (ctx, unit, config) => {
  const marginTop = 4;
  const marginLeft = 4;
  const marginRight = 4;

  const size = unit.size || 40;
  const barWidth = size - marginLeft - marginRight;
  const barHeight = 2;
  const barGap = 1;

  const x = config.x;
  const y = config.y;

  // 血条参数
  const maxHp = unit.maxHp || 100;
  const hp = unit.hp ?? maxHp;
  const hpRatio = Math.max(0, Math.min(1, hp / maxHp));

  // 蓝条参数
  const maxMp = unit.maxMp || 100;
  const mp = unit.mp ?? maxMp;
  const mpRatio = Math.max(0, Math.min(1, mp / maxMp));

  // 血条位置（单位下方）
  const barX = x + marginLeft;
  const hpBarY = y + size + marginTop;
  const mpBarY = hpBarY + barHeight + barGap;

  // 绘制血条背景
  ctx.fillStyle = "#3A3A3A";
  ctx.fillRect(barX, hpBarY, barWidth, barHeight);

  // 绘制血条当前值
  const hpColor = "#F44336";
  ctx.fillStyle = hpColor;
  ctx.fillRect(barX, hpBarY, barWidth * hpRatio, barHeight);

  // 绘制蓝条背景
  ctx.fillStyle = "#3A3A3A";
  ctx.fillRect(barX, mpBarY, barWidth, barHeight);

  // 绘制蓝条当前值
  ctx.fillStyle = "#2196F3";
  ctx.fillRect(barX, mpBarY, barWidth * mpRatio, barHeight);

  ctx.fillStyle = config.textColor || "#333";
  ctx.font = "8px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  ctx.fillText(unit.name, barX + barWidth / 2, hpBarY + barHeight * 2 + 4);
};
/**
 * @description {drawSelectMenus} 绘制选择菜单
 * @param {CanvasRenderingContext2D} ctx canvas上下文
 * @param {Object} config 选择菜单配置
 * @param {Number} config.x 选择菜单x坐标
 * @param {Number} config.y 选择菜单y坐标
 * @param {Number} config.width 选择菜单item宽度
 * @param {Number} config.height 选择菜单item高度
 * @param {Function} config.callback 选择菜单item点击回调函数, 参数为选择菜单项item
 * @param {Array} config.list 选择菜单列表
 * @param {Object} config.list[0] 选择菜单项
 * @param {String} config.list[0].label 选择菜单项标签文本
 * @param {Number} config.list[0].value 选择菜单项值
 * @param {Number} config.list[0].isDisabled 是否可点击
 */
export const drawSelectMenus = (ctx, config) => {
  const list = config.list || [];
  const x = config.x;
  const y = config.y;
  const itemWidth = config.width || 80;
  const itemHeight = config.height || 14;
  const padding = 2;
  const borderWidth = 1;

  ctx.imageSmoothingEnabled = false;

  const listCount = list.length;
  const menuHeight = listCount * itemHeight + padding * 2;

  ctx.fillStyle = "#1A1A2E";
  ctx.fillRect(x, y, itemWidth + padding * 2, menuHeight);

  ctx.fillStyle = "#16213E";
  ctx.fillRect(
    x + borderWidth,
    y + borderWidth,
    itemWidth + padding * 2 - borderWidth * 2,
    menuHeight - borderWidth * 2,
  );

  for (let i = 0; i < listCount; i++) {
    const item = list[i];
    const itemY = y + padding + i * itemHeight;
    const itemX = x + padding;

    if (item.isDisabled) {
      ctx.fillStyle = "#2A2A3E";
    } else {
      ctx.fillStyle = "#2E3A5E";
    }
    ctx.fillRect(itemX, itemY, itemWidth, itemHeight - padding);

    if (!item.isDisabled) {
      ctx.fillStyle = "#4A5A8E";
      ctx.fillRect(itemX, itemY, itemWidth, borderWidth);
      ctx.fillStyle = "#0E1A2E";
      ctx.fillRect(
        itemX,
        itemY + itemHeight - padding - borderWidth,
        itemWidth,
        borderWidth,
      );
    }

    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = item.isDisabled ? "#666666" : "#E0E0E0";
    ctx.fillText(item.label, itemX + 6, itemY + (itemHeight - padding) / 2);
  }
};

/**
 * @description {drawMagicCircle} 绘制战斗魔法阵 - 使用向量绘制高精度
 * @param {CanvasRenderingContext2D} ctx canvas上下文
 * @param {Object} config 配置项
 * @param {Number} config.x 魔法圆中心x坐标
 * @param {Number} config.y 魔法圆中心y坐标
 * @param {Number} config.size 魔法圆大小
 * @param {Number} config.frame 魔法圆当前帧
 * @param {Number} config.opacity 透明度（可选，默认1）
 */
export const drawMagicCircle = (ctx, config) => {
  const { x, y, size = 450, opacity = 1, frame = 0 } = config;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;

  // 动画参数（基于 frame 秒为单位）
  const glowPulse = 0.82 + 0.18 * Math.sin(frame * 1.4);           // 光晕脉动
  const runeOrbit = frame * 0.35;                                    // 符文轨道旋转
  const diamondPulse = 0.6 + 0.4 * Math.sin(frame * 1.8 + 1);       // 菱形闪烁
  const starPulse = 0.85 + 0.15 * Math.sin(frame * 2.0 + 0.5);      // 五角星脉动
  const radialAlpha = 0.2 + 0.15 * Math.sin(frame * 1.6 + 2);       // 放射线透明度
  const innerRotation = frame * 0.5;                                 // 中心三角旋转
  const swordWobble = Math.sin(frame * 0.8) * 0.04;                 // 双剑微摆

  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = opacity;
  ctx.save();

  // === 绘制外圈光晕（径向渐变，带脉动效果） ===
  const glowGradient = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
  glowGradient.addColorStop(0, "rgba(65, 105, 225, 0)");
  glowGradient.addColorStop(0.6, `rgba(65, 105, 225, ${0.15 * glowPulse})`);
  glowGradient.addColorStop(0.85, `rgba(147, 112, 219, ${0.3 * glowPulse})`);
  glowGradient.addColorStop(1, `rgba(147, 112, 219, ${0.4 * glowPulse})`);
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // === 绘制外圈金色圆环 ===
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = Math.max(2, size * 0.008);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
  ctx.stroke();

  // === 绘制内层蓝色圆环 ===
  ctx.strokeStyle = "#4169E1";
  ctx.lineWidth = Math.max(1.5, size * 0.006);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  // === 绘制金色细圆环 ===
  ctx.strokeStyle = "#FFEC8B";
  ctx.lineWidth = Math.max(1, size * 0.004);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
  ctx.stroke();

  // === 绘制符文圆环（8方位） ===
  ctx.strokeStyle = "#9370DB";
  ctx.lineWidth = Math.max(1, size * 0.004);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.68, 0, Math.PI * 2);
  ctx.stroke();

  // === 绘制最内层装饰圈 ===
  ctx.strokeStyle = "#B8860B";
  ctx.lineWidth = Math.max(1, size * 0.003);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.stroke();

  // === 绘制8个方位的装饰符文（带轨道旋转动画） ===
  const runeRadius = r * 0.68;
  for (let i = 0; i < 8; i++) {
    const angle = ((i * 45 - 90) * Math.PI) / 180 + runeOrbit;
    const rx = cx + Math.cos(angle) * runeRadius;
    const ry = cy + Math.sin(angle) * runeRadius;
    const runeSize = size * 0.04;

    // 符文外侧光晕（脉动）
    ctx.fillStyle = `rgba(147, 112, 219, ${0.15 * glowPulse})`;
    ctx.beginPath();
    ctx.arc(rx, ry, runeSize * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 绘制符文（方形外框 + 内部十字）
    ctx.fillStyle = "#9370DB";
    ctx.fillRect(rx - runeSize / 2, ry - runeSize / 2, runeSize, runeSize);

    ctx.strokeStyle = "#BA55D3";
    ctx.lineWidth = Math.max(1, size * 0.003);
    ctx.strokeRect(rx - runeSize / 2, ry - runeSize / 2, runeSize, runeSize);

    // 内部十字
    ctx.beginPath();
    ctx.moveTo(rx - runeSize * 0.3, ry);
    ctx.lineTo(rx + runeSize * 0.3, ry);
    ctx.moveTo(rx, ry - runeSize * 0.3);
    ctx.lineTo(rx, ry + runeSize * 0.3);
    ctx.stroke();

    // 中心小圆点（脉动大小）
    const dotPulse = 0.9 + 0.1 * Math.sin(frame * 3.0 + i);
    ctx.fillStyle = "#E6E6FA";
    ctx.beginPath();
    ctx.arc(rx, ry, runeSize * 0.1 * dotPulse, 0, Math.PI * 2);
    ctx.fill();
  }

  // === 绘制四个对角方向的菱形装饰（带旋转+闪烁） ===
  const diamondRadius = r * 0.88;
  for (let i = 0; i < 4; i++) {
    const angle = ((i * 90 - 45) * Math.PI) / 180 + runeOrbit * 0.5;
    const dx = cx + Math.cos(angle) * diamondRadius;
    const dy = cy + Math.sin(angle) * diamondRadius;
    const diamondSize = size * 0.035;

    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(angle + Math.PI / 4 + frame * 0.6);
    ctx.globalAlpha = diamondPulse;

    ctx.fillStyle = "#00FFFF";
    ctx.fillRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize);

    ctx.strokeStyle = "#008B8B";
    ctx.lineWidth = Math.max(1, size * 0.003);
    ctx.strokeRect(
      -diamondSize / 2,
      -diamondSize / 2,
      diamondSize,
      diamondSize,
    );

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // === 绘制上下左右四个方向的五角星装饰（带脉动+旋转） ===
  const starRadius = r * 0.92;
  for (let i = 0; i < 4; i++) {
    const angle = ((i * 90 - 90) * Math.PI) / 180 + runeOrbit * 0.7;
    const sx = cx + Math.cos(angle) * starRadius;
    const sy = cy + Math.sin(angle) * starRadius;
    const starSize = size * 0.04 * starPulse;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle + frame * 0.4);

    // 绘制五角星
    ctx.fillStyle = "#FFEC8B";
    ctx.strokeStyle = "#B8860B";
    ctx.lineWidth = Math.max(1, size * 0.003);
    ctx.beginPath();
    for (let j = 0; j < 10; j++) {
      const radius = j % 2 === 0 ? starSize : starSize * 0.4;
      const a = ((j * 36 - 90) * Math.PI) / 180;
      const px = Math.cos(a) * radius;
      const py = Math.sin(a) * radius;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // === 绘制径向放射线（12条，带旋转+脉动透明度） ===
  const radialRotate = frame * 0.25; // 放射线整体缓慢旋转
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180 + radialRotate;
    const startX = cx + Math.cos(angle) * r * 0.62;
    const startY = cy + Math.sin(angle) * r * 0.62;
    const endX = cx + Math.cos(angle) * r * 0.75;
    const endY = cy + Math.sin(angle) * r * 0.75;

    ctx.strokeStyle = `rgba(255, 215, 0, ${radialAlpha})`;
    ctx.lineWidth = Math.max(0.5, size * 0.002);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  // === 绘制两把交错的剑（X形，带微摆动画） ===
  const bladeLength = r * 0.6;
  const bladeWidth = size * 0.03;
  const hiltLength = size * 0.15;
  const guardWidth = size * 0.18;

  // 剑身辉光脉动
  const bladeGlow = 0.25 + 0.15 * Math.sin(frame * 1.2);

  // 剑1：从左上到右下（旋转 45度 + 微摆）
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4 + swordWobble);
  ctx.translate(-bladeLength * 0.15, -bladeLength * 0.15);

  // 剑身背景辉光
  ctx.fillStyle = `rgba(135, 206, 250, ${bladeGlow})`;
  ctx.beginPath();
  ctx.moveTo(-bladeWidth / 2 - size * 0.01, -bladeLength * 0.2);
  ctx.lineTo(-bladeWidth / 2 - size * 0.01, bladeLength * 0.9);
  ctx.lineTo(0, bladeLength + size * 0.02);
  ctx.lineTo(bladeWidth / 2 + size * 0.01, bladeLength * 0.9);
  ctx.lineTo(bladeWidth / 2 + size * 0.01, -bladeLength * 0.2);
  ctx.closePath();
  ctx.fill();

  // 剑身渐变（从剑柄到剑尖）
  const bladeGrad1 = ctx.createLinearGradient(0, 0, 0, bladeLength);
  bladeGrad1.addColorStop(0, "#E8E8E8");
  bladeGrad1.addColorStop(0.5, "#FFFFFF");
  bladeGrad1.addColorStop(1, "#808080");

  // 剑身（上下宽度一致）
  ctx.fillStyle = bladeGrad1;
  ctx.beginPath();
  ctx.moveTo(-bladeWidth / 2, -bladeLength * 0.15);
  ctx.lineTo(-bladeWidth / 2, bladeLength * 0.85);
  ctx.lineTo(0, bladeLength);
  ctx.lineTo(bladeWidth / 2, bladeLength * 0.85);
  ctx.lineTo(bladeWidth / 2, -bladeLength * 0.15);
  ctx.closePath();
  ctx.fill();

  // 剑身中线（高光）
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = Math.max(0.5, size * 0.002);
  ctx.beginPath();
  ctx.moveTo(0, -bladeLength * 0.1);
  ctx.lineTo(0, bladeLength * 0.85);
  ctx.stroke();

  // 剑格（护手）
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#B8860B";
  ctx.lineWidth = Math.max(1, size * 0.004);
  ctx.beginPath();
  ctx.moveTo(-guardWidth / 2, -bladeLength * 0.18);
  ctx.lineTo(guardWidth / 2, -bladeLength * 0.18);
  ctx.lineTo(guardWidth / 2 - size * 0.02, -bladeLength * 0.1);
  ctx.lineTo(-guardWidth / 2 + size * 0.02, -bladeLength * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 剑格宝石
  ctx.fillStyle = "#6495ED";
  ctx.beginPath();
  ctx.arc(0, -bladeLength * 0.14, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // 剑柄（握把）
  ctx.fillStyle = "#B8860B";
  ctx.strokeStyle = "#8B6914";
  ctx.lineWidth = Math.max(1, size * 0.003);
  ctx.fillRect(
    -bladeWidth * 0.6,
    -hiltLength,
    bladeWidth * 1.2,
    hiltLength - bladeLength * 0.15,
  );
  ctx.strokeRect(
    -bladeWidth * 0.6,
    -hiltLength,
    bladeWidth * 1.2,
    hiltLength - bladeLength * 0.15,
  );

  // 剑柄纹理
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = Math.max(0.5, size * 0.002);
  for (let j = 0; j < 3; j++) {
    const lineY = -hiltLength + (j * (hiltLength - bladeLength * 0.15)) / 3;
    ctx.beginPath();
    ctx.moveTo(-bladeWidth * 0.5, lineY);
    ctx.lineTo(bladeWidth * 0.5, lineY);
    ctx.stroke();
  }

  // 剑柄末端装饰（圆头）
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#B8860B";
  ctx.beginPath();
  ctx.arc(0, -hiltLength, bladeWidth * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 剑柄末端宝石
  ctx.fillStyle = "#9370DB";
  ctx.beginPath();
  ctx.arc(0, -hiltLength, bladeWidth * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 剑2：从右上到左下（旋转 -45度 + 微摆）
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 4 - swordWobble);
  ctx.translate(bladeLength * 0.15, -bladeLength * 0.15);

  // 剑身背景辉光
  ctx.fillStyle = `rgba(135, 206, 250, ${bladeGlow})`;
  ctx.beginPath();
  ctx.moveTo(-bladeWidth / 2 - size * 0.01, -bladeLength * 0.2);
  ctx.lineTo(-bladeWidth / 2 - size * 0.01, bladeLength * 0.9);
  ctx.lineTo(0, bladeLength + size * 0.02);
  ctx.lineTo(bladeWidth / 2 + size * 0.01, bladeLength * 0.9);
  ctx.lineTo(bladeWidth / 2 + size * 0.01, -bladeLength * 0.2);
  ctx.closePath();
  ctx.fill();

  // 剑身渐变
  const bladeGrad2 = ctx.createLinearGradient(0, 0, 0, bladeLength);
  bladeGrad2.addColorStop(0, "#E8E8E8");
  bladeGrad2.addColorStop(0.5, "#FFFFFF");
  bladeGrad2.addColorStop(1, "#808080");

  // 剑身（上下宽度一致）
  ctx.fillStyle = bladeGrad2;
  ctx.beginPath();
  ctx.moveTo(-bladeWidth / 2, -bladeLength * 0.15);
  ctx.lineTo(-bladeWidth / 2, bladeLength * 0.85);
  ctx.lineTo(0, bladeLength);
  ctx.lineTo(bladeWidth / 2, bladeLength * 0.85);
  ctx.lineTo(bladeWidth / 2, -bladeLength * 0.15);
  ctx.closePath();
  ctx.fill();

  // 剑身中线（高光）
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = Math.max(0.5, size * 0.002);
  ctx.beginPath();
  ctx.moveTo(0, -bladeLength * 0.1);
  ctx.lineTo(0, bladeLength * 0.85);
  ctx.stroke();

  // 剑格（护手）
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#B8860B";
  ctx.lineWidth = Math.max(1, size * 0.004);
  ctx.beginPath();
  ctx.moveTo(-guardWidth / 2, -bladeLength * 0.18);
  ctx.lineTo(guardWidth / 2, -bladeLength * 0.18);
  ctx.lineTo(guardWidth / 2 - size * 0.02, -bladeLength * 0.1);
  ctx.lineTo(-guardWidth / 2 + size * 0.02, -bladeLength * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 剑格宝石
  ctx.fillStyle = "#6495ED";
  ctx.beginPath();
  ctx.arc(0, -bladeLength * 0.14, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // 剑柄（握把）
  ctx.fillStyle = "#B8860B";
  ctx.strokeStyle = "#8B6914";
  ctx.lineWidth = Math.max(1, size * 0.003);
  ctx.fillRect(
    -bladeWidth * 0.6,
    -hiltLength,
    bladeWidth * 1.2,
    hiltLength - bladeLength * 0.15,
  );
  ctx.strokeRect(
    -bladeWidth * 0.6,
    -hiltLength,
    bladeWidth * 1.2,
    hiltLength - bladeLength * 0.15,
  );

  // 剑柄纹理
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = Math.max(0.5, size * 0.002);
  for (let j = 0; j < 3; j++) {
    const lineY = -hiltLength + (j * (hiltLength - bladeLength * 0.15)) / 3;
    ctx.beginPath();
    ctx.moveTo(-bladeWidth * 0.5, lineY);
    ctx.lineTo(bladeWidth * 0.5, lineY);
    ctx.stroke();
  }

  // 剑柄末端装饰
  ctx.fillStyle = "#FFD700";
  ctx.strokeStyle = "#B8860B";
  ctx.beginPath();
  ctx.arc(0, -hiltLength, bladeWidth * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 剑柄末端宝石
  ctx.fillStyle = "#9370DB";
  ctx.beginPath();
  ctx.arc(0, -hiltLength, bladeWidth * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // === 绘制中心交叉点的宝石装饰 ===
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.025, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#E6E6FA";
  ctx.beginPath();
  ctx.arc(cx - size * 0.008, cy - size * 0.008, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // === 绘制中心魔法圈 ===
  const centerR = r * 0.45;
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = Math.max(1.5, size * 0.005);
  ctx.beginPath();
  ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#4169E1";
  ctx.lineWidth = Math.max(1, size * 0.003);
  ctx.beginPath();
  ctx.arc(cx, cy, centerR - size * 0.02, 0, Math.PI * 2);
  ctx.stroke();

  // 中心圈内的四角星装饰
  for (let i = 0; i < 4; i++) {
    const angle = ((i * 90 - 45) * Math.PI) / 180;
    const gx = cx + Math.cos(angle) * centerR * 0.6;
    const gy = cy + Math.sin(angle) * centerR * 0.6;

    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(angle);

    ctx.fillStyle = "#00FFFF";
    ctx.strokeStyle = "#008B8B";
    ctx.lineWidth = Math.max(0.5, size * 0.002);
    const cs = size * 0.02;
    ctx.beginPath();
    ctx.moveTo(0, -cs);
    ctx.lineTo(cs * 0.4, -cs * 0.4);
    ctx.lineTo(cs, 0);
    ctx.lineTo(cs * 0.4, cs * 0.4);
    ctx.lineTo(0, cs);
    ctx.lineTo(-cs * 0.4, cs * 0.4);
    ctx.lineTo(-cs, 0);
    ctx.lineTo(-cs * 0.4, -cs * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // === 绘制中心魔法符号（三角/星形，带旋转动画） ===
  ctx.strokeStyle = "#BA55D3";
  ctx.lineWidth = Math.max(1.5, size * 0.004);

  // 外三角（旋转）
  const triR = size * 0.08;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(innerRotation);
  for (let j = 0; j < 3; j++) {
    ctx.save();
    ctx.rotate((j * Math.PI * 2) / 3);
    ctx.beginPath();
    ctx.moveTo(0, -triR);
    ctx.lineTo(triR * 0.866, triR * 0.5);
    ctx.lineTo(-triR * 0.866, triR * 0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
  ctx.globalAlpha = 1;
};

/**
 * 生成带 emoji 的鼠标光标样式
 * 使用 SVG data URL 实现跨平台一致的 emoji 光标
 */
export const buildEmojiCursor = (emoji) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><text x='0' y='26' font-size='28'>${emoji}</text></svg>`;
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `url("data:image/svg+xml;charset=utf-8,${encoded}") 0 0, auto`;
};

/**
 * @description 绘制单位
 * @param {CanvasRenderingContext2D} ctx canvas元素
 * @param {Object} currentUnit 当前单位
 * @param {String} currentUnit.maxHp 当前单位最大生命值
 * @param {String} currentUnit.hp 当前单位当前生命值
 * @param {String} currentUnit.name 当前单位名称
 * @param {String} currentUnit.maxMp 当前单位最大魔法值
 * @param {String} currentUnit.mp 当前单位当前魔法值
 * @param {String} currentUnit.drawAvatar 当前单位头像绘制函数(同上drawAvatar)
 * @param {String} currentUnit.buffList 当前单位 buff 列表
 * @param {String} currentUnit.buffList[0].label 当前单位 buff 名称
 * @param {String} currentUnit.buffList[0].duration 当前单位 buff 列表持续回合
 * @param {String} currentUnit.debuffList 当前单位 debuff 列表
 * @param {String} currentUnit.debuffList[0].label 当前单位 debuff 名称
 * @param {String} currentUnit.debuffList[0].duration 当前单位 debuff 列表持续回合
 *
 * @param {Object} config 配置项
 * @param {Number} config.x 单位面板 x 坐标
 * @param {Number} config.y 单位面板 y 坐标
 * @param {Number} config.width 单位面板宽度
 * @param {Number} config.height 单位面板高度
 */
export const drawPanel = (ctx, unit, config) => {
  if (!ctx || !unit || !config) return;

  const x = config.x;
  const y = config.y;
  const width = config.width || 240;
  const height = config.height || 130;

  ctx.save();

  const bgColor = config.bgColor || "#1A1A2E";
  const borderColor = config.borderColor || "#3A3A5E";

  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);

  const padding = 8;
  const gap = 12;
  const lineHeight = 16;

  const avatarBoxSize = 80;
  const avatarX = x + padding;
  const avatarY = y + padding;

  // 头像框外层（深色）
  ctx.fillStyle = "#0A0A1E";
  ctx.fillRect(avatarX - 3, avatarY - 3, avatarBoxSize + 6, avatarBoxSize + 6);

  // 头像框装饰边框（金色渐变）
  const frameGrad = ctx.createLinearGradient(
    avatarX,
    avatarY,
    avatarX + avatarBoxSize,
    avatarY + avatarBoxSize,
  );
  frameGrad.addColorStop(0, "#B8860B");
  frameGrad.addColorStop(0.5, "#FFD700");
  frameGrad.addColorStop(1, "#B8860B");
  ctx.strokeStyle = frameGrad;
  ctx.lineWidth = 2;
  ctx.strokeRect(
    avatarX - 2,
    avatarY - 2,
    avatarBoxSize + 4,
    avatarBoxSize + 4,
  );

  // 内层边框
  ctx.strokeStyle = "#5A4A1E";
  ctx.lineWidth = 1;
  ctx.strokeRect(avatarX, avatarY, avatarBoxSize, avatarBoxSize);

  // 四角装饰
  const cornerSize = 8;
  ctx.fillStyle = "#FFD700";
  ctx.fillRect(avatarX - 3, avatarY - 3, cornerSize, 2);
  ctx.fillRect(avatarX - 3, avatarY - 3, 2, cornerSize);
  ctx.fillRect(
    avatarX + avatarBoxSize - cornerSize + 3,
    avatarY - 3,
    cornerSize,
    2,
  );
  ctx.fillRect(avatarX + avatarBoxSize + 1, avatarY - 3, 2, cornerSize);
  ctx.fillRect(avatarX - 3, avatarY + avatarBoxSize + 1, cornerSize, 2);
  ctx.fillRect(
    avatarX - 3,
    avatarY + avatarBoxSize - cornerSize + 3,
    2,
    cornerSize,
  );
  ctx.fillRect(
    avatarX + avatarBoxSize - cornerSize + 3,
    avatarY + avatarBoxSize + 1,
    cornerSize,
    2,
  );
  ctx.fillRect(
    avatarX + avatarBoxSize + 1,
    avatarY + avatarBoxSize - cornerSize + 3,
    2,
    cornerSize,
  );

  if (unit.drawAvatar) {
    const innerSize = avatarBoxSize - 4;
    const centerX = avatarX + 2 + innerSize / 2;
    const centerY = avatarY + 2 + innerSize / 2;
    unit.drawAvatar(
      ctx,
      {
        size: innerSize,
      },
      {
        x: avatarX + 4,
        y: avatarY + 4,
        size: innerSize,
      },
    );
  }

  const infoOffsetX = avatarBoxSize + gap;
  const infoStartX = x + padding + infoOffsetX;
  const infoWidth = width - padding - infoOffsetX - padding;
  let currentY = y + padding;
  const barHeight = 8;

  ctx.fillStyle = config.nameColor || "#E0E0E0";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(unit.name || "Unknown", infoStartX, currentY, infoWidth);
  currentY += lineHeight + 4;

  const maxHp = unit.maxHp || 100;
  const hp = unit.hp ?? maxHp;
  const hpRatio = Math.max(0, Math.min(1, hp / maxHp));

  ctx.fillStyle = "#FF6B6B";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`HP ${hp}/${maxHp}`, infoStartX, currentY, infoWidth);
  currentY += lineHeight;

  ctx.fillStyle = "#2A2A2A";
  ctx.fillRect(infoStartX, currentY, infoWidth, barHeight);

  const hpGrad = ctx.createLinearGradient(
    infoStartX,
    0,
    infoStartX + infoWidth,
    0,
  );
  hpGrad.addColorStop(0, "#E53935");
  hpGrad.addColorStop(1, "#F44336");
  ctx.fillStyle = hpGrad;
  ctx.fillRect(infoStartX, currentY, infoWidth * hpRatio, barHeight);

  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 1;
  ctx.strokeRect(infoStartX, currentY, infoWidth, barHeight);
  currentY += lineHeight;

  const maxMp = unit.maxMp || 100;
  const mp = unit.mp ?? maxMp;
  const mpRatio = Math.max(0, Math.min(1, mp / maxMp));

  ctx.fillStyle = "#4FC3F7";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`MP ${mp}/${maxMp}`, infoStartX, currentY, infoWidth);
  currentY += lineHeight;

  ctx.fillStyle = "#1A2A3A";
  ctx.fillRect(infoStartX, currentY, infoWidth, barHeight);

  const mpGrad = ctx.createLinearGradient(
    infoStartX,
    0,
    infoStartX + infoWidth,
    0,
  );
  mpGrad.addColorStop(0, "#1976D2");
  mpGrad.addColorStop(1, "#2196F3");
  ctx.fillStyle = mpGrad;
  ctx.fillRect(infoStartX, currentY, infoWidth * mpRatio, barHeight);

  ctx.strokeStyle = "#1A1A1A";
  ctx.strokeRect(infoStartX, currentY, infoWidth, barHeight);
  currentY += lineHeight + 4;

  const buffList = unit.buffList || [];
  const iconBoxHeight = 16;
  const iconBoxGap = 6;

  if (buffList.length > 0) {
    let buffIconX = infoStartX;
    buffList.forEach((buff) => {
      const textToShow =
        buff.duration !== undefined
          ? `${buff.label}${buff.duration}`
          : buff.label;

      ctx.font = "14px sans-serif";
      const textWidth = ctx.measureText(textToShow).width;
      const boxWidth = Math.max(textWidth + 12, 32);

      ctx.fillStyle = "rgba(76, 175, 80, 0.85)";
      ctx.fillRect(buffIconX, currentY, boxWidth, iconBoxHeight);
      ctx.strokeStyle = "#2E7D32";
      ctx.lineWidth = 1;
      ctx.strokeRect(buffIconX, currentY, boxWidth, iconBoxHeight);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        textToShow,
        buffIconX + boxWidth / 2,
        currentY + iconBoxHeight / 2,
      );

      buffIconX += boxWidth + iconBoxGap;
    });
    currentY += iconBoxHeight + 6;
  }

  // 行7：Debuff 列表
  const debuffList = unit.debuffList || [];

  if (debuffList.length > 0) {
    let debuffIconX = infoStartX;
    debuffList.forEach((debuff) => {
      const textToShow =
        debuff.duration !== undefined
          ? `${debuff.label}${debuff.duration}`
          : debuff.label;

      ctx.font = "14px sans-serif";
      const textWidth = ctx.measureText(textToShow).width;
      const boxWidth = Math.max(textWidth + 12, 32);

      ctx.fillStyle = "rgba(244, 67, 54, 0.85)";
      ctx.fillRect(debuffIconX, currentY, boxWidth, iconBoxHeight);
      ctx.strokeStyle = "#C62828";
      ctx.lineWidth = 1;
      ctx.strokeRect(debuffIconX, currentY, boxWidth, iconBoxHeight);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        textToShow,
        debuffIconX + boxWidth / 2,
        currentY + iconBoxHeight / 2,
      );

      debuffIconX += boxWidth + iconBoxGap;
    });
  }

  ctx.restore();
};

/**
 * @description 绘制单位战败
 * @param {CanvasRenderingContext2D} ctx canvas元素
 * @param {Object} currentUnit 当前单位
 * @param {Number} currentUnit.x 当单位x坐标
 * @param {Number} currentUnit.y 当单位y坐标
 * @param {Number} currentUnit.size 当单位大小
 * @param {Number} currentUnit.frame 当单位帧数坐标
 * @returns
 */
export const drawTombstone = (ctx, currentUnit) => {
  const x = currentUnit.x;
  const y = currentUnit.y;
  const unit = currentUnit.size / 18; // 像素18*18
  ctx.imageSmoothingEnabled = false;

  const stonePixels = [
    // 墓碑顶部弧形
    [6, 1, "#8B8B83"], [7, 1, "#A0A098"], [8, 1, "#A0A098"], [9, 1, "#A0A098"], [10, 1, "#A0A098"], [11, 1, "#8B8B83"],
    [5, 2, "#8B8B83"], [6, 2, "#B8B8B0"], [7, 2, "#D0D0C8"], [8, 2, "#D0D0C8"], [9, 2, "#D0D0C8"], [10, 2, "#D0D0C8"], [11, 2, "#B8B8B0"], [12, 2, "#8B8B83"],
    [4, 3, "#787870"], [5, 3, "#C0C0B8"], [6, 3, "#E0E0D8"], [7, 3, "#E8E8E0"], [8, 3, "#E8E8E0"], [9, 3, "#E8E8E0"], [10, 3, "#E8E8E0"], [11, 3, "#E0E0D8"], [12, 3, "#C0C0B8"], [13, 3, "#787870"],
    // 墓碑主体矩形区域
    [4, 4, "#787870"], [5, 4, "#C0C0B8"], [6, 4, "#D8D8D0"], [7, 4, "#D8D8D0"], [8, 4, "#D8D8D0"], [9, 4, "#D8D8D0"], [10, 4, "#D8D8D0"], [11, 4, "#D8D8D0"], [12, 4, "#C0C0B8"], [13, 4, "#787870"],
    [4, 5, "#787870"], [5, 5, "#C0C0B8"], [6, 5, "#D8D8D0"], [7, 5, "#D8D8D0"], [8, 5, "#D8D8D0"], [9, 5, "#D8D8D0"], [10, 5, "#D8D8D0"], [11, 5, "#D8D8D0"], [12, 5, "#C0C0B8"], [13, 5, "#787870"],
    [4, 6, "#787870"], [5, 6, "#C0C0B8"], [6, 6, "#D8D8D0"], [7, 6, "#D8D8D0"], [8, 6, "#D8D8D0"], [9, 6, "#D8D8D0"], [10, 6, "#D8D8D0"], [11, 6, "#D8D8D0"], [12, 6, "#C0C0B8"], [13, 6, "#787870"],
    [4, 7, "#787870"], [5, 7, "#C0C0B8"], [6, 7, "#D8D8D0"], [7, 7, "#D8D8D0"], [8, 7, "#D8D8D0"], [9, 7, "#D8D8D0"], [10, 7, "#D8D8D0"], [11, 7, "#D8D8D0"], [12, 7, "#C0C0B8"], [13, 7, "#787870"],
    // 墓碑主体下半部分
    [4, 8, "#787870"], [5, 8, "#B0B0A8"], [6, 8, "#D8D8D0"], [7, 8, "#D8D8D0"], [8, 8, "#D8D8D0"], [9, 8, "#D8D8D0"], [10, 8, "#D8D8D0"], [11, 8, "#D8D8D0"], [12, 8, "#B0B0A8"], [13, 8, "#787870"],
    [4, 9, "#787870"], [5, 9, "#B0B0A8"], [6, 9, "#D8D8D0"], [7, 9, "#D8D8D0"], [8, 9, "#D8D8D0"], [9, 9, "#D8D8D0"], [10, 9, "#D8D8D0"], [11, 9, "#D8D8D0"], [12, 9, "#B0B0A8"], [13, 9, "#787870"],
    [4, 10, "#787870"], [5, 10, "#B0B0A8"], [6, 10, "#D8D8D0"], [7, 10, "#D8D8D0"], [8, 10, "#D8D8D0"], [9, 10, "#D8D8D0"], [10, 10, "#D8D8D0"], [11, 10, "#D8D8D0"], [12, 10, "#B0B0A8"], [13, 10, "#787870"],
    // 墓碑底部
    [4, 11, "#787870"], [5, 11, "#B0B0A8"], [6, 11, "#C0C0B8"], [7, 11, "#C0C0B8"], [8, 11, "#C0C0B8"], [9, 11, "#C0C0B8"], [10, 11, "#C0C0B8"], [11, 11, "#C0C0B8"], [12, 11, "#B0B0A8"], [13, 11, "#787870"],
    [5, 12, "#787870"], [6, 12, "#B0B0A8"], [7, 12, "#B0B0A8"], [8, 12, "#B0B0A8"], [9, 12, "#B0B0A8"], [10, 12, "#B0B0A8"], [11, 12, "#B0B0A8"], [12, 12, "#787870"],
    [6, 13, "#686860"], [7, 13, "#909088"], [8, 13, "#909088"], [9, 13, "#909088"], [10, 13, "#909088"], [11, 13, "#686860"],
    // 墓碑底座
    [5, 14, "#787870"], [6, 14, "#989890"], [7, 14, "#989890"], [8, 14, "#989890"], [9, 14, "#989890"], [10, 14, "#989890"], [11, 14, "#989890"], [12, 14, "#787870"],
    [4, 15, "#686860"], [5, 15, "#A0A098"], [6, 15, "#A0A098"], [7, 15, "#A0A098"], [8, 15, "#A0A098"], [9, 15, "#A0A098"], [10, 15, "#A0A098"], [11, 15, "#A0A098"], [12, 15, "#A0A098"], [13, 15, "#686860"],
    // 草地
    [3, 16, "#4A6E2A"], [4, 16, "#5A8E3A"], [5, 16, "#5A8E3A"], [6, 16, "#4A6E2A"], [7, 16, "#6A9E4A"], [8, 16, "#5A8E3A"], [9, 16, "#4A6E2A"], [10, 16, "#6A9E4A"], [11, 16, "#5A8E3A"], [12, 16, "#5A8E3A"], [13, 16, "#4A6E2A"], [14, 16, "#4A6E2A"],
    [2, 17, "#3A5E1A"], [3, 17, "#4A6E2A"], [4, 17, "#3A5E1A"], [5, 17, "#4A6E2A"], [6, 17, "#5A8E3A"], [7, 17, "#5A8E3A"], [8, 17, "#4A6E2A"], [9, 17, "#5A8E3A"], [10, 17, "#6A9E4A"], [11, 17, "#5A8E3A"], [12, 17, "#4A6E2A"], [13, 17, "#3A5E1A"], [14, 17, "#4A6E2A"], [15, 17, "#3A5E1A"],
  ];

  // 绘制墓碑主体
  for (let i = 0; i < stonePixels.length; i++) {
    const px = stonePixels[i][0];
    const py = stonePixels[i][1];
    const color = stonePixels[i][2];
    drawPixel({
      px,
      py,
      color,
      ctx,
      x,
      y,
      unit,
    });
  }
};

/**
 * @description 绘制战斗面板装饰与氛围
 * @param {CanvasRenderingContext2D} ctx  canvas上下文
 * @param {Object} config  canvas配置
 * @param {Number} config.width 画布宽度
 * @param {Number} config.height 画布高度
 * @param {Number} config.frame 当前帧数坐标
 */
export const drawDecoration = (ctx, config) => {
  const { width, height, frame = 0 } = config;
  ctx.save();
  ctx.imageSmoothingEnabled = true;

  // ========== 1. 地面石砖纹理（下半部分） ==========
  const floorTop = height * 0.55;
  const tileSize = 48;
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = "#B8A080";
  ctx.lineWidth = 1;
  for (let tx = 0; tx < width; tx += tileSize) {
    for (let ty = floorTop; ty < height; ty += tileSize) {
      ctx.strokeRect(tx + (ty % (tileSize * 2) === 0 ? tileSize / 2 : 0), ty, tileSize, tileSize);
    }
  }
  ctx.globalAlpha = 1;

  // ========== 2. 角落符文装饰（相邻环旋转方向相逆） ==========
  const cornerR = 70; // 角落装饰半径
  const corners = [
    { x: 20, y: 20 },                       // 左上
    { x: width - 20, y: 20 },               // 右上
    { x: 20, y: height - 20 },              // 左下
    { x: width - 20, y: height - 20 },      // 右下
  ];

  // 三层环各自的旋转参数（相邻方向相逆）
  const ringSpeeds = [
    frame * 0.4,      // 外圈：正向旋转
    -frame * 0.55,    // 内圈：反向旋转
    frame * 0.35,     // 十字符文：正向旋转
  ];

  corners.forEach((corner) => {
    // --- 外圈（虚线弧，正转） ---
    const outerR = cornerR * 0.7;
    const outerCircum = 2 * Math.PI * outerR;
    ctx.save();
    ctx.strokeStyle = "rgba(180, 160, 120, 0.35)";
    ctx.lineWidth = 2;
    ctx.setLineDash([outerCircum * 0.12, outerCircum * 0.08]);
    ctx.lineDashOffset = ringSpeeds[0] * outerR;
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, outerR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // --- 内圈（虚线弧，反转） ---
    const innerR = cornerR * 0.45;
    const innerCircum = 2 * Math.PI * innerR;
    ctx.save();
    ctx.strokeStyle = "rgba(200, 180, 140, 0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([innerCircum * 0.15, innerCircum * 0.1]);
    ctx.lineDashOffset = ringSpeeds[1] * innerR;
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, innerR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // --- 十字符文（正转） ---
    ctx.save();
    ctx.translate(corner.x, corner.y);
    ctx.rotate(ringSpeeds[2]);
    ctx.strokeStyle = "rgba(220, 200, 160, 0.3)";
    ctx.lineWidth = 2;
    const s = cornerR * 0.35;
    ctx.beginPath();
    ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
    ctx.moveTo(0, -s); ctx.lineTo(0, s);
    ctx.stroke();
    // 对角小线
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(200, 180, 140, 0.2)";
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, -s * 0.7); ctx.lineTo(s * 0.7, s * 0.7);
    ctx.moveTo(s * 0.7, -s * 0.7); ctx.lineTo(-s * 0.7, s * 0.7);
    ctx.stroke();
    ctx.restore();

    // 角落三角装饰
    ctx.fillStyle = "rgba(200, 170, 120, 0.2)";
    ctx.strokeStyle = "rgba(220, 190, 140, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (corner.x < 100) {
      ctx.moveTo(corner.x - 10, corner.y - 10);
      ctx.lineTo(corner.x - 10 + 30, corner.y - 10);
      ctx.lineTo(corner.x - 10, corner.y - 10 + 30);
    } else {
      ctx.moveTo(corner.x + 10, corner.y - 10);
      ctx.lineTo(corner.x + 10 - 30, corner.y - 10);
      ctx.lineTo(corner.x + 10, corner.y - 10 + 30);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // ========== 3. 浮动魔法粒子 ==========
  const particleCount = 28;
  const seed = 42; // 固定种子保证帧间一致性

  for (let i = 0; i < particleCount; i++) {
    // 用 i 计算伪随机位置，结合 frame 产生位移
    const baseX = ((i * 137 + seed) % width);
    const baseY = ((i * 251 + seed * 3) % height);
    const speed = 40 + (i % 7) * 20; // 40~160 px/s 上浮速度
    const amplitude = 20 + (i % 5) * 12;

    const px = (baseX + Math.sin(frame * 1.2 + i * 1.7) * amplitude + width) % width;
    const py = ((baseY - frame * speed) % (height + 40) + height + 40) % (height + 40) - 20;

    const alpha = 0.15 + 0.08 * Math.sin(frame * 2.4 + i * 2.3);
    const size = 1.5 + (i % 3) * 1.5;

    // 颜色在金色/蓝紫色之间变化
    const hueShift = Math.sin(frame * 0.9 + i * 0.9) * 15;
    const hue = i % 3 === 0 ? 45 + hueShift : i % 3 === 1 ? 260 + hueShift : 120 + hueShift;
    ctx.fillStyle = `hsla(${hue}, 60%, 65%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== 4. 顶部边缘装饰线 ==========
  const lineY = 8;
  const dashLen = 30;
  const gapLen = 16;
  const lineStart = 80;
  const lineEnd = width - 80;

  ctx.strokeStyle = "rgba(200, 170, 120, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let lx = lineStart; lx < lineEnd; lx += dashLen + gapLen) {
    ctx.moveTo(lx, lineY);
    ctx.lineTo(Math.min(lx + dashLen, lineEnd), lineY);
  }
  ctx.stroke();

  // 底部边缘装饰线（更宽）
  ctx.strokeStyle = "rgba(200, 170, 120, 0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lineStart, height - lineY);
  ctx.lineTo(lineEnd, height - lineY);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(200, 170, 120, 0.18)";
  ctx.beginPath();
  ctx.moveTo(lineStart, height - lineY - 6);
  ctx.lineTo(lineEnd, height - lineY - 6);
  ctx.stroke();

  // ========== 5. 侧边石柱装饰 ==========
  const pillarW = 16;
  const pillarGap = 120;
  [
    { x: 4, y: 0 },
    { x: width - pillarW - 4, y: 0 },
  ].forEach((pillar) => {
    for (let py = 0; py < height; py += pillarGap) {
      const pillarHeight = pillarGap * 0.6;
      // 柱身
      const grad = ctx.createLinearGradient(pillar.x, 0, pillar.x + pillarW, 0);
      grad.addColorStop(0, "rgba(80, 70, 55, 0.25)");
      grad.addColorStop(0.3, "rgba(140, 120, 90, 0.3)");
      grad.addColorStop(0.7, "rgba(140, 120, 90, 0.3)");
      grad.addColorStop(1, "rgba(60, 50, 40, 0.25)");
      ctx.fillStyle = grad;
      ctx.fillRect(pillar.x, py, pillarW, pillarHeight);

      // 柱头
      ctx.fillStyle = "rgba(170, 145, 105, 0.35)";
      ctx.fillRect(pillar.x - 2, py - 2, pillarW + 4, 6);
      ctx.fillRect(pillar.x - 2, py + pillarHeight - 4, pillarW + 4, 6);

      // 柱身纹理
      ctx.strokeStyle = "rgba(100, 85, 65, 0.2)";
      ctx.lineWidth = 0.5;
      for (let j = 0; j < 3; j++) {
        const ly = py + 12 + j * (pillarHeight / 4);
        ctx.beginPath();
        ctx.moveTo(pillar.x + 3, ly);
        ctx.lineTo(pillar.x + pillarW - 3, ly);
        ctx.stroke();
      }
    }
  });

  // ========== 6. 四角光芒点 ==========
  corners.forEach((corner) => {
    const glowAlpha = 0.15 + 0.06 * Math.sin(frame * 1.8);
    const glowGrad = ctx.createRadialGradient(corner.x, corner.y, 0, corner.x, corner.y, cornerR);
    glowGrad.addColorStop(0, `rgba(255, 220, 150, ${glowAlpha})`);
    glowGrad.addColorStop(0.5, `rgba(255, 200, 100, ${glowAlpha * 0.4})`);
    glowGrad.addColorStop(1, "rgba(255, 200, 100, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, cornerR, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
};