/**
 * 通用数学/随机工具
 */

/** 限制数值区间 */
export const clamp = (value, min, max) => {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

/** 线性插值 */
export const lerp = (start, end, ratio) => {
  return start + (end - start) * ratio;
};

/** 区间随机浮点 [min, max) */
export const randomRange = (min, max) => {
  return min + Math.random() * (max - min);
};

/** 区间随机整数 [min, max] */
export const randomInt = (min, max) => {
  return Math.floor(min + Math.random() * (max - min + 1));
};

/** 数组随机取一项 */
export const pickRandom = (list) => {
  return list[Math.floor(Math.random() * list.length)];
};

/** 两点距离 */
export const distanceBetween = (fromX, fromY, toX, toY) => {
  return Math.hypot(toX - fromX, toY - fromY);
};

/** 向量长度 */
export const lengthOf = (x, y) => {
  return Math.hypot(x, y);
};

/** 把角度收敛到 (-PI, PI] */
export const normalizeAngle = (angle) => {
  let result = angle;
  while (result > Math.PI) {
    result -= Math.PI * 2;
  }
  while (result <= -Math.PI) {
    result += Math.PI * 2;
  }
  return result;
};

/** 两个角度的最小夹角（绝对值） */
export const angleDelta = (angleA, angleB) => {
  return Math.abs(normalizeAngle(angleA - angleB));
};

/** 把方向向量换算成单位向量 */
export const toUnitVector = (x, y) => {
  const length = Math.hypot(x, y);
  if (length < 0.0001) {
    return { x: 0, y: 0 };
  }
  return { x: x / length, y: y / length };
};

/** 由方向向量取角度 */
export const angleOfVector = (x, y) => {
  return Math.atan2(y, x);
};

/**
 * mulberry32 伪随机发生器：同一分块种子必须得到同一套装饰
 * @param {Number} seed 整数种子
 * @returns {Function} 返回 0~1 的随机函数
 */
export const createSeededRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

/** 二维整数哈希，返回 0~1，用于分块地形扰动 */
export const hashUnit = (x, y, seed) => {
  let hash = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 1274126177);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
};

/** 秒数格式化 mm:ss */
export const formatTime = (seconds) => {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${rest < 10 ? '0' : ''}${rest}`;
};

/** 平滑跟随系数（与帧率无关的指数衰减） */
export const smoothingFactor = (speed, deltaTime) => {
  return 1 - Math.exp(-speed * deltaTime);
};
