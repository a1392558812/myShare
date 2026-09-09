// 绘制：地图网格 + 两条路径带

import {
  GRID_SIZE, CELL, PATH_A_POINTS, PATH_B_POINTS, PATH_A, PATH_B, PATH_COLOR,
} from '../config/paths.js';

const drawGrid = (ctx, w, h) => {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= GRID_SIZE; i++) {
    const v = i * CELL;
    ctx.moveTo(v, 0); ctx.lineTo(v, h);
    ctx.moveTo(0, v); ctx.lineTo(w, v);
  }
  ctx.stroke();
};

const drawPathBand = (ctx, points, color) => {
  ctx.save();
  ctx.fillStyle = color.fill;
  ctx.strokeStyle = color.stroke;
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  points.forEach(([gx, gy], i) => {
    const x = gx * CELL + CELL / 2;
    const y = gy * CELL + CELL / 2;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.lineWidth = 1;
  points.forEach(([gx, gy]) => {
    const x = gx * CELL;
    const y = gy * CELL;
    ctx.fillStyle = color.fill;
    ctx.fillRect(x, y, CELL, CELL);
    ctx.strokeStyle = color.edge;
    ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
  });
  ctx.restore();
};

const drawEndpoints = (ctx, points, color, label) => {
  const [fx, fy] = points[0];
  const [lx, ly] = points[points.length - 1];
  ctx.save();
  ctx.fillStyle = color.stroke;
  ctx.beginPath();
  ctx.arc(fx * CELL + CELL / 2, fy * CELL + CELL / 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(lx * CELL + CELL / 2, ly * CELL + CELL / 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, fx * CELL + CELL / 2, fy * CELL + CELL / 2 + 3);
  ctx.restore();
};

const drawBuildableHighlight = (ctx, hoveredCell) => {
  if (!hoveredCell) return;
  const { gx, gy, canBuild, occupied } = hoveredCell;
  if (!canBuild) return;
  ctx.save();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(gx * CELL + 1, gy * CELL + 1, CELL - 2, CELL - 2);
  ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
  ctx.fillRect(gx * CELL + 1, gy * CELL + 1, CELL - 2, CELL - 2);
  ctx.restore();
};

const drawTowerRange = (ctx, towers, hoveredTower, selected) => {
  const show = (t) => t && (t === hoveredTower || t === selected);
  towers.forEach((t) => {
    if (!show(t)) return;
    const x = t.gx * CELL + CELL / 2;
    const y = t.gy * CELL + CELL / 2;
    let range = 0;
    if (t.kind === 'cannon' || t.kind === 'arrow') {
      range = t.def.range[t.level];
    } else if (t.kind === 'barracks') {
      range = t.def.rallyRange[t.level] || t.def.rallyRange[0];
    } else if (t.kind === 'detector') {
      range = t.def.range[t.level];
    }
    if (!range) return;
    ctx.save();
    ctx.strokeStyle = t.def.ringColor;
    ctx.fillStyle = `${t.def.ringColor}1A`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, range, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
};

export const drawMap = (ctx, state) => {
  drawGrid(ctx, state.width, state.height);
  drawPathBand(ctx, PATH_A_POINTS, PATH_COLOR.A);
  drawPathBand(ctx, PATH_B_POINTS, PATH_COLOR.B);
  drawEndpoints(ctx, PATH_A_POINTS, PATH_COLOR.A, 'A 入');
  drawEndpoints(ctx, PATH_B_POINTS, PATH_COLOR.B, 'B 出');
  drawBuildableHighlight(ctx, state.hoveredCell);
  drawTowerRange(ctx, state.towers, state.hoveredTower, state.selectedTower);
};

export { PATH_A, PATH_B };