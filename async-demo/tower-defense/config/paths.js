// 路径坐标
// 网格 21×21，每格 32px，画布 672×672
// 两条单调下降 S 形路径，零格子重叠、无回头折返
//   A：上半区 (0,1) → (20,10)，4 段横向逐行下移
//   B：下半区 (20,11) → (0,19)，4 段横向逐行下移（镜像）
// 覆盖格子全部标记为路径格，禁止建造

export const GRID_SIZE = 21;
export const CELL = 32;
export const CANVAS_SIZE = GRID_SIZE * CELL;

export const PATH_COLOR = {
  A: { fill: 'rgba(96, 165, 250, 0.22)', stroke: '#60a5fa', edge: '#3b82f6' },
  B: { fill: 'rgba(248, 113, 113, 0.22)', stroke: '#f87171', edge: '#ef4444' },
};

// 逐格路径序列（每个相邻点都差 1 格）
// 沿转向点顺序逐格推进，保留行进方向：右/左/下/上 生成方向一致的格子，
// 避免旧的「升序展开」在向左/向上段产生往返与对角跳跃。
const buildPath = (waypoints) => {
  const all = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const [x1, y1] = waypoints[i];
    const [x2, y2] = waypoints[i + 1];
    if (i === 0) all.push([x1, y1]);
    const dx = Math.sign(x2 - x1);
    const dy = Math.sign(y2 - y1);
    let x = x1, y = y1;
    while (x !== x2 || y !== y2) {
      x += dx; y += dy;
      all.push([x, y]);
    }
  }
  return all;
};

// A: 上半区，4 段横向逐行下移
const PATH_A_POINTS = buildPath([
  [0, 1], [3, 1], [3, 4], [8, 4], [8, 7], [13, 7], [13, 10], [20, 10],
]);

// B: 下半区
const PATH_B_POINTS = buildPath([
  [20, 11], [17, 11], [17, 14], [12, 14], [12, 17], [7, 17], [7, 19], [0, 19],
]);

export { PATH_A_POINTS, PATH_B_POINTS };

// 像素中心序列（敌人沿此移动）
export const pointsToPx = (points) =>
  points.map(([gx, gy]) => [gx * CELL + CELL / 2, gy * CELL + CELL / 2]);

const buildArcSegments = (points) => {
  const px = pointsToPx(points);
  const segs = [];
  let total = 0;
  for (let i = 0; i < px.length - 1; i++) {
    const dx = px[i + 1][0] - px[i][0];
    const dy = px[i + 1][1] - px[i][1];
    const len = Math.hypot(dx, dy);
    segs.push({ x1: px[i][0], y1: px[i][1], x2: px[i + 1][0], y2: px[i + 1][1], len, start: total });
    total += len;
  }
  return { px, segs, totalLen: total };
};

export const PATH_A = buildArcSegments(PATH_A_POINTS);
export const PATH_B = buildArcSegments(PATH_B_POINTS);

// 弧度 → 像素
export const getPointAtLength = (path, t) => {
  const len = Math.min(Math.max(0, t), path.totalLen);
  for (const s of path.segs) {
    if (len <= s.start + s.len) {
      const u = s.len === 0 ? 0 : (len - s.start) / s.len;
      return { x: s.x1 + (s.x2 - s.x1) * u, y: s.y1 + (s.y2 - s.y1) * u };
    }
  }
  const last = path.segs[path.segs.length - 1];
  return { x: last.x2, y: last.y2 };
};

// 弧度 → 朝向（用于敌人朝向/箭矢方向）
export const getDirAtLength = (path, t) => {
  for (const s of path.segs) {
    if (t <= s.start + s.len) {
      const dx = s.x2 - s.x1;
      const dy = s.y2 - s.y1;
      const L = Math.hypot(dx, dy) || 1;
      return { x: dx / L, y: dy / L };
    }
  }
  return { x: 1, y: 0 };
};

export const cellToPx = (gx, gy) => [gx * CELL + CELL / 2, gy * CELL + CELL / 2];

export const pxToCell = (x, y) => [Math.floor(x / CELL), Math.floor(y / CELL)];

export const pathCellsA = new Set(PATH_A_POINTS.map(([x, y]) => `${x},${y}`));
export const pathCellsB = new Set(PATH_B_POINTS.map(([x, y]) => `${x},${y}`));
export const isOnPath = (gx, gy) =>
  pathCellsA.has(`${gx},${gy}`) || pathCellsB.has(`${gx},${gy}`);

export const isBuildable = (gx, gy) =>
  gx >= 0 && gy >= 0 && gx < GRID_SIZE && gy < GRID_SIZE && !isOnPath(gx, gy);

// 计算每个可建格子到 A、B 最近路径点的距离（用于兵营小兵活动范围判定）
export const computeBuildableDist = () => {
  const out = { A: [], B: [] };
  for (let y = 0; y < GRID_SIZE; y++) {
    out.A.push(new Array(GRID_SIZE).fill(Infinity));
    out.B.push(new Array(GRID_SIZE).fill(Infinity));
  }
  const fill = (path, key) => {
    path.px.forEach(([px, py]) => {
      const cx = Math.floor(px / CELL);
      const cy = Math.floor(py / CELL);
      const r = 5;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const x = cx + dx;
          const y = cy + dy;
          if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) continue;
          const d = Math.hypot((cx + dx) * CELL + CELL / 2 - px, (cy + dy) * CELL + CELL / 2 - py);
          if (d < out[key][y][x]) out[key][y][x] = d;
        }
      }
    });
  };
  fill(PATH_A, 'A');
  fill(PATH_B, 'B');
  return out;
};

export const BUILDABLE_DIST = computeBuildableDist();

// 找距离指定路径最近的敌人
export const findNearestEnemyOnPath = (pathKey, enemies, x, y) => {
  let best = null;
  let bestD = Infinity;
  for (const e of enemies) {
    if (e.dead || e.escaped) continue;
    if ((pathKey === 'A' && e.path !== 'A') || (pathKey === 'B' && e.path !== 'B')) continue;
    const d = Math.hypot(e.x - x, e.y - y);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
};