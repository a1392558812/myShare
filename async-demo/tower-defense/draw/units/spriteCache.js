// 单位精灵离屏缓存
// 每个敌人原本每帧要跑 15~20 个 canvas path，同屏上百个会直接掉帧。
// 这里把「单位种类 × 朝向 × 动画帧」预渲染成小图，绘制时只做 drawImage。
import drawSoldier from './drawSoldier.js';
import drawDragon from './drawDragon.js';
import drawGhost from './drawGhost.js';
import extended from './drawExtended.js';

const DRAW = {
  soldier: drawSoldier,
  dragon: drawDragon,
  ghost: drawGhost,
  rusher: extended.drawRusher,
  armored: extended.drawArmored,
  healer: extended.drawHealer,
  splitter: extended.drawSplitter,
};

export const SPRITE_FRAMES = 8;
const STEP = (Math.PI * 2) / SPRITE_FRAMES;

// 画布尺寸与锚点：ox/oy = 单位 (x, y) 在精灵画布内的位置
export const SPRITE_BOX = {
  soldier: { w: 40, h: 40, ox: 20, oy: 26 },
  dragon: { w: 44, h: 56, ox: 22, oy: 14 },
  ghost: { w: 56, h: 60, ox: 28, oy: 30 },
  rusher: { w: 48, h: 44, ox: 24, oy: 28 },
  armored: { w: 48, h: 44, ox: 24, oy: 28 },
  healer: { w: 44, h: 46, ox: 22, oy: 28 },
  splitter: { w: 44, h: 46, ox: 22, oy: 26 },
};

// 相位 → 帧号（0..7）
export const spriteFrame = (phase) => {
  const i = Math.round((phase || 0) / STEP);
  return ((i % SPRITE_FRAMES) + SPRITE_FRAMES) % SPRITE_FRAMES;
};

// 单位的动画相位（不同种类驱动量不同）
export const phaseOf = (kind, e, time) => {
  if (kind === 'dragon') return time * 0.006 + (e.t || 0);
  if (kind === 'ghost') return time * 0.004 + (e.t || 0);
  return e.walkPhase || 0;
};

const cache = new Map();

// 构造用于预渲染的临时单位（位置归零，交给画布锚点偏移）
const fakeOf = (kind, e, frame) => {
  const phase = frame * STEP;
  const base = {
    size: e.size || 12,
    def: e.def || {},
    x: 0, y: 0, t: 0,
    floatY: e.floatY || 0,
    alpha: 1,
    detected: false,
    walkPhase: 0,
    // 冲锋兵冲刺态（影响拖尾，必须参与缓存 key）
    charging: !!e.charging,
  };
  if (kind === 'dragon') return { ...base, time: phase / 0.006 };
  if (kind === 'ghost') return { ...base, time: phase / 0.004 };
  return { ...base, walkPhase: phase, time: 0 };
};

const canCache = () => typeof document !== 'undefined' && !!document.createElement;

/**
 * 取（或生成）一个单位精灵帧
 * @param {string} kind soldier|dragon|ghost
 * @param {number} frame 0..7
 * @param {number} facing 1|-1
 * @param {number} variant ghost 显形态 = 1
 * @param {number} dpr 设备像素比
 * @param {object} src 真实单位（取 size / def / floatY）
 * @returns {HTMLCanvasElement|null} null = 环境不支持，调用方回退实时绘制
 */
export const getSprite = (kind, frame, facing, variant, dpr = 1, src = {}) => {
  const box = SPRITE_BOX[kind];
  const drawFn = DRAW[kind];
  if (!box || !drawFn) return null;

  const size = src.size || 12;
  const color = src.def?.color || '';
  const floatY = src.floatY || 0;
  // 冲锋态参与 key，否则冲刺拖尾会被缓存成「永不显示」
  const charging = src.charging ? 1 : 0;
  const key = `${kind}|${size}|${color}|${floatY}|${frame}|${facing}|${variant}|${dpr}|${charging}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  if (!canCache()) return null;

  const cv = document.createElement('canvas');
  cv.width = Math.ceil(box.w * dpr);
  cv.height = Math.ceil(box.h * dpr);
  const cx = cv.getContext('2d');
  if (!cx) return null;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.translate(box.ox, box.oy);

  const fake = fakeOf(kind, { size, def: src.def || {}, floatY, charging: src.charging }, frame);
  if (kind === 'ghost') fake.detected = variant === 1;
  drawFn(cx, fake, fake.time || 0, facing);

  cache.set(key, cv);
  return cv;
};

// 精灵总条目数（调试用）
export const spriteCacheSize = () => cache.size;
