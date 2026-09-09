
export const circle = (ctx, x, y, r, fill, stroke, lw = 1) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
};

export const ellipse = (ctx, x, y, rx, ry, fill, stroke, lw = 1, rotation = 0) => {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
};

export const rect = (ctx, x, y, w, h, fill, stroke, lw = 1) => {
  if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h); }
};

export const roundRect = (ctx, x, y, w, h, r, fill, stroke, lw = 1.5) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
};

export const line = (ctx, x1, y1, x2, y2, width, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

export const triangle = (ctx, x1, y1, x2, y2, x3, y3, fill, stroke, lw = 1) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
};

export const arc = (ctx, x, y, r, startAngle, endAngle, width, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y, r, startAngle, endAngle);
  ctx.stroke();
};

export const polyline = (ctx, pts, width, color, close = false) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  if (close) ctx.closePath();
  ctx.stroke();
};

export const bar = (ctx, x, y, w, h, ratio, back = '#0f172a', low = '#ef4444', high = '#22c55e') => {
  ctx.fillStyle = back;
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = ratio > 0.4 ? high : low;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, ratio)), h);
};
