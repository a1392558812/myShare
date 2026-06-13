/**
 * 文本特效攻击系统 (障碍/异常状态)
 * 按下 1/2/3/4 键，对 targetList 中所有目标从天而降文本特效
 *   1 → 封印（金）  2 → 中毒（绿）  3 → 混沌（紫）  4 → 冰冻（蓝）
 */
import { ref } from "vue";

// ===================== 常量 =====================
export const OBSTACLE_START_Y = -60;     // 起始 Y
export const OBSTACLE_GRAVITY = 900;     // 重力 px/s²
export const REST_DURATION = 1.5;        // 到达后持续秒数
const FLIGHT_TIME = 0.55;                // 飞行时间
const BASE_FONT_SIZE = 10                // 基础字体大小

/** 文本特效配置：key → { text, color, shadowColor, glowColor, name } */
export const OBSTACLE_TEXTS = {
  "1": { text: "封印", color: "#FFD700", shadowColor: "#CC8800", glowColor: "#FFE566", name: "封印" },
  "2": { text: "中毒", color: "#66FF33", shadowColor: "#338800", glowColor: "#AAFF88", name: "中毒" },
  "3": { text: "混动", color: "#CC44FF", shadowColor: "#7700AA", glowColor: "#DD88FF", name: "混沌" },
  "4": { text: "冰冻", color: "#33CCFF", shadowColor: "#006699", glowColor: "#88DDFF", name: "冰冻" },
};

// ===================== 状态 =====================
/** 障碍文本数组，每个元素见 createObstacle 字段 */
export const obstacles = ref([]);
let obstacleIdCounter = 0;

// ===================== 发射 =====================
/**
 * 发射文本障碍：向 targetList 中每个目标各落下一个文本
 * @param {string} key - "1"|"2"|"3"|"4"
 * @param {import("vue").Ref} units
 * @param {import("vue").Ref} selectedUnit
 * @param {import("vue").Ref} targetList
 */
export function fireObstacle(key, units, selectedUnit, targetList) {
  const config = OBSTACLE_TEXTS[key];
  if (!config) return;
  if (targetList.value.length === 0) return;

  targetList.value.forEach((targetKey, idx) => {
    const target = units.value[targetKey];
    if (!target) return;

    const tSize = target.size || 40;
    const tx = target.x + tSize / 2;
    const ty = target.y + tSize / 2;

    // 计算初速度，约 FLIGHT_TIME 秒到达
    const dist = ty - OBSTACLE_START_Y;
    const v0 = (dist - 0.5 * OBSTACLE_GRAVITY * FLIGHT_TIME * FLIGHT_TIME) / FLIGHT_TIME;

    // 多个目标时 X 位置错开
    const spreadCount = targetList.value.length;
    const spread = spreadCount > 1 ? (idx - (spreadCount - 1) / 2) * 22 : 0;

    obstacles.value.push({
      id: ++obstacleIdCounter,
      text: config.text,
      color: config.color,
      shadowColor: config.shadowColor,
      glowColor: config.glowColor,
      targetX: tx + spread,
      targetY: ty,
      x: tx + spread,
      y: OBSTACLE_START_Y,
      vy: Math.max(v0, 40),
      g: OBSTACLE_GRAVITY,
      frame: 0,
      phase: "falling",   // "falling" → "resting" → "done"
      restTimer: 0,
      trail: [],           // 下落拖尾 [{x,y,life}]
    });
  });
}

// ===================== 纵向文字绘制辅助 =====================
/**
 * 纵向逐字绘制文本（从右到左竖排，字从上到下）
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text - 文字（如 "封印"）
 * @param {number} cx - 整体中心 X
 * @param {number} cy - 整体中心 Y
 * @param {number} fontSize - 单个字的大小
 * @param {number} [gap=0] - 字间距（默认 0，自动按 fontSize*0.15 计算）
 */
function fillVerticalText(ctx, text, cx, cy, fontSize, gap) {
  const chars = [...text];
  if (chars.length === 0) return;
  const charGap = gap !== undefined ? gap : fontSize * 0.15;
  const totalHeight = chars.length * fontSize + (chars.length - 1) * charGap;
  const startY = cy - totalHeight / 2 + fontSize / 2;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], cx, startY + i * (fontSize + charGap));
  }
}

/**
 * 获取纵向文本的整体尺寸估算
 * @returns {{ w: number, h: number }}
 */
function verticalTextSize(fontSize, charCount, gap) {
  const charGap = gap !== undefined ? gap : fontSize * 0.15;
  return {
    w: fontSize,
    h: charCount * fontSize + (charCount - 1) * charGap,
  };
}

// ===================== 绘制 =====================
/**
 * 绘制单个障碍文本（下落 + 停留两阶段）
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} obs
 */
export function drawObstacle(ctx, obs) {
  const { phase } = obs;

  if (phase === "falling") {
    drawFallingText(ctx, obs);
  } else if (phase === "resting") {
    drawRestingText(ctx, obs);
  }
}

/** 下落阶段：文本从天而降 + 拖尾粒子 + 透视缩放 */
function drawFallingText(ctx, obs) {
  const { x, y, text, color, shadowColor, glowColor, frame, targetY } = obs;
  const f = frame;

  // 透视缩放：越接近目标字体越大
  const totalDist = targetY - OBSTACLE_START_Y;
  const fallenDist = y - OBSTACLE_START_Y;
  const fallProgress = Math.min(fallenDist / Math.max(totalDist, 1), 1);
  const fontSize = BASE_FONT_SIZE + fallProgress * 20; // BASE_FONT_SIZE → BASE_FONT_SIZE + fallProgress * 20（单字尺寸）

  // 下落速度感 → 文字横向压缩（纵向文字本身已够高）
  const speedCompress = 1 - (1 - fallProgress) * 0.2; // 横宽 0.8→1.0

  const textW = fontSize;
  const textH = verticalTextSize(fontSize, text.length).h;

  // --- 拖尾粒子 ---
  if (obs.trail.length > 1) {
    for (let i = 1; i < obs.trail.length; i++) {
      const t = obs.trail[i];
      const progress = i / obs.trail.length;
      const alpha = progress * t.life * 0.5;
      if (alpha <= 0.01) continue;
      const trailSize = fontSize * progress * 0.8;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${trailSize}px "SimHei", "Microsoft YaHei", sans-serif`;
      ctx.fillStyle = glowColor;
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 6 * progress;
      fillVerticalText(ctx, text, t.x, t.y, trailSize);
      ctx.restore();
    }
  }

  // --- 外部光晕 ---
  ctx.save();
  ctx.globalAlpha = 0.3 * fallProgress;
  ctx.font = `bold ${fontSize + 12}px "SimHei", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = shadowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 30;
  fillVerticalText(ctx, text, x, y, fontSize + 12, 0);
  ctx.restore();

  // --- 主体文字（横向压缩体现速度感） ---
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.translate(x, y);
  ctx.scale(speedCompress, 1);
  ctx.font = `bold ${fontSize}px "SimHei", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = color;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 14;
  fillVerticalText(ctx, text, 0, 0, fontSize);
  ctx.restore();

  // --- 速度线（文字上方） ---
  const lineCount = 4;
  ctx.save();
  for (let i = 0; i < lineCount; i++) {
    const lx = x + (i - lineCount / 2 + 0.5) * textW * 0.5 * speedCompress;
    const len = fontSize * (0.4 + Math.random() * 0.6);
    const alpha = 0.3 + 0.15 * Math.sin(f * 0.5 + i);

    ctx.globalAlpha = alpha * fallProgress;
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1.2;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(lx, y - textH / 2);
    ctx.lineTo(lx, y - textH / 2 - len);
    ctx.stroke();
  }
  ctx.restore();
}

/** 停留阶段：文本在目标位置脉动发光 */
function drawRestingText(ctx, obs) {
  const { x, y, text, color, shadowColor, glowColor, frame, restTimer } = obs;
  const f = frame;
  const fontSize = BASE_FONT_SIZE * 2;           // 单字大小
  const size = verticalTextSize(fontSize, text.length); // {w, h}
  const halfW = size.w / 2;
  const halfH = size.h / 2;

  // 剩余时间比例
  const remaining = restTimer / REST_DURATION;
  // 最后 25% 渐隐
  const fadeAlpha = remaining < 0.25 ? remaining / 0.25 : 1;

  // 脉动
  const pulse = 0.9 + 0.1 * Math.sin(f * 0.06);
  // 上下微浮
  const bob = Math.sin(f * 0.04) * 3;
  // 旋转微震
  const shake = Math.sin(f * 0.07 + 1) * 1.2;

  ctx.save();

  // --- 外层大范围光晕 ---
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate((shake * Math.PI) / 180);
  ctx.globalAlpha = fadeAlpha * 0.18 * pulse;
  ctx.font = `bold ${fontSize + 20}px "SimHei", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = shadowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 40;
  fillVerticalText(ctx, text, 0, 0, fontSize + 20, 0);
  ctx.restore();

  // --- 中层光晕 ---
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate((shake * Math.PI) / 180);
  ctx.globalAlpha = fadeAlpha * 0.4 * pulse;
  ctx.font = `bold ${fontSize + 8}px "SimHei", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = glowColor;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = 22;
  fillVerticalText(ctx, text, 0, 0, fontSize + 8, 0);
  ctx.restore();

  // --- 主体文字（微旋转） ---
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate((shake * Math.PI) / 180);
  ctx.globalAlpha = fadeAlpha * 0.95;
  ctx.font = `bold ${fontSize}px "SimHei", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = color;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;
  fillVerticalText(ctx, text, 0, 0, fontSize);
  ctx.restore();

  // --- 内部高亮 ---
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.rotate((shake * Math.PI) / 180);
  ctx.globalAlpha = fadeAlpha * 0.35;
  ctx.font = `bold ${fontSize - 2}px "SimHei", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "#FFFFFF";
  ctx.shadowBlur = 6;
  fillVerticalText(ctx, text, 0, 0, fontSize - 2);
  ctx.restore();

  // --- 环绕光点（6颗，沿竖长椭圆轨道） ---
  for (let i = 0; i < 6; i++) {
    const orbitAngle = (i / 6) * Math.PI * 2 + f * 0.025;
    const orbitRX = halfW + 14;          // 椭圆横轴
    const orbitRY = halfH + 10;          // 椭圆纵轴
    const ox = x + Math.cos(orbitAngle) * orbitRX;
    const oy = y + bob + Math.sin(orbitAngle) * orbitRY;
    const oAlpha = fadeAlpha * 0.5 * (0.7 + 0.3 * Math.sin(f * 0.1 + i));

    ctx.save();
    ctx.globalAlpha = oAlpha;
    ctx.fillStyle = glowColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(ox, oy, 1.8 + Math.sin(f * 0.15 + i) * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- 到达瞬间冲击环（前 0.25s） ---
  const elapsedSinceLand = REST_DURATION - restTimer;
  if (elapsedSinceLand < 0.25) {
    const ringProgress = elapsedSinceLand / 0.25; // 0 → 1
    const ringAlpha = (1 - ringProgress) * 0.6 * fadeAlpha;

    ctx.save();
    ctx.globalAlpha = ringAlpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * (1 - ringProgress);
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    // 椭圆冲击波，适配纵向文字
    ctx.ellipse(x, y + bob, halfW * (1 + ringProgress * 2), halfH * (1 + ringProgress * 2), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// ===================== 每帧更新 =====================
/**
 * 更新所有障碍文本：物理下落、阶段切换、绘制
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} deltaTime - 毫秒
 */
export function updateObstacles(ctx, deltaTime) {
  const dt = deltaTime / 1000;
  obstacles.value = obstacles.value.filter((obs) => {
    if (obs.phase === "done") return false;

    obs.frame++;

    if (obs.phase === "falling") {
      // --- 下落阶段 ---
      // 记录拖尾
      obs.trail.push({ x: obs.x, y: obs.y, life: 1.0 });
      const MAX_TRAIL = 6;
      if (obs.trail.length > MAX_TRAIL) {
        obs.trail.shift();
      }
      // 拖尾生命衰减
      for (const t of obs.trail) {
        t.life -= dt * 3;
      }
      obs.trail = obs.trail.filter((t) => t.life > 0);

      // 重力下落
      obs.vy += obs.g * dt;
      obs.y += obs.vy * dt;

      // 到达目标检测
      if (obs.y >= obs.targetY) {
        obs.y = obs.targetY;
        obs.phase = "resting";
        obs.restTimer = REST_DURATION;
      }
    } else if (obs.phase === "resting") {
      // --- 停留阶段 ---
      obs.restTimer -= dt;
      if (obs.restTimer <= 0) {
        obs.phase = "done";
        return false;
      }
    }

    drawObstacle(ctx, obs);
    return true;
  });
}
