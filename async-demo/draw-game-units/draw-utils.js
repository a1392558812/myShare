export const drawPixel = ({ px, py, color, ctx, x, y, unit }) => {
  ctx.fillStyle = color;
  ctx.fillRect(x + px * unit, y + py * unit, unit, unit);
};

/**
 * @description 绘制单位
 * @param {RenderingContext2D} ctx canvas元素
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
 * @param {Number} config.opacity 透明度（可选，默认1）
 */
export const drawMagicCircle = (ctx, config) => {
  const { x, y, size = 450, opacity = 1 } = config;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = opacity;
  ctx.save();

  // === 绘制外圈光晕（径向渐变） ===
  const glowGradient = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
  glowGradient.addColorStop(0, "rgba(65, 105, 225, 0)");
  glowGradient.addColorStop(0.6, "rgba(65, 105, 225, 0.15)");
  glowGradient.addColorStop(0.85, "rgba(147, 112, 219, 0.3)");
  glowGradient.addColorStop(1, "rgba(147, 112, 219, 0.4)");
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

  // === 绘制8个方位的装饰符文 ===
  const runeRadius = r * 0.68;
  for (let i = 0; i < 8; i++) {
    const angle = ((i * 45 - 90) * Math.PI) / 180;
    const rx = cx + Math.cos(angle) * runeRadius;
    const ry = cy + Math.sin(angle) * runeRadius;
    const runeSize = size * 0.04;

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

    // 中心小圆点
    ctx.fillStyle = "#E6E6FA";
    ctx.beginPath();
    ctx.arc(rx, ry, runeSize * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // === 绘制四个对角方向的菱形装饰 ===
  const diamondRadius = r * 0.88;
  for (let i = 0; i < 4; i++) {
    const angle = ((i * 90 - 45) * Math.PI) / 180;
    const dx = cx + Math.cos(angle) * diamondRadius;
    const dy = cy + Math.sin(angle) * diamondRadius;
    const diamondSize = size * 0.035;

    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(angle + Math.PI / 4);

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

    ctx.restore();
  }

  // === 绘制上下左右四个方向的五角星装饰 ===
  const starRadius = r * 0.92;
  for (let i = 0; i < 4; i++) {
    const angle = ((i * 90 - 90) * Math.PI) / 180;
    const sx = cx + Math.cos(angle) * starRadius;
    const sy = cy + Math.sin(angle) * starRadius;
    const starSize = size * 0.04;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);

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

  // === 绘制径向放射线（12条） ===
  ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
  ctx.lineWidth = Math.max(0.5, size * 0.002);
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180;
    const startX = cx + Math.cos(angle) * r * 0.62;
    const startY = cy + Math.sin(angle) * r * 0.62;
    const endX = cx + Math.cos(angle) * r * 0.75;
    const endY = cy + Math.sin(angle) * r * 0.75;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  // === 绘制两把交错的剑（X形） ===
  const bladeLength = r * 0.6;
  const bladeWidth = size * 0.03;
  const hiltLength = size * 0.15;
  const guardWidth = size * 0.18;

  // 剑1：从左上到右下（旋转 -45度）
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.translate(-bladeLength * 0.15, -bladeLength * 0.15);

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

  // 剑2：从右上到左下（旋转 45度）
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 4);
  ctx.translate(bladeLength * 0.15, -bladeLength * 0.15);

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

  // === 绘制中心魔法符号（三角/星形） ===
  ctx.strokeStyle = "#BA55D3";
  ctx.lineWidth = Math.max(1.5, size * 0.004);

  // 外三角
  const triR = size * 0.08;
  for (let j = 0; j < 3; j++) {
    ctx.save();
    ctx.translate(cx, cy);
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
