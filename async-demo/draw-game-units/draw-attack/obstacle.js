import { ref } from "vue";

export const OBSTACLE_START_Y = -60;
export const OBSTACLE_GRAVITY = 900;
export const REST_DURATION = 1.5;
const FLIGHT_TIME = 0.55;
const BASE_FONT_SIZE = 10

export const OBSTACLE_TEXTS = {
  "1": { text: "封印", color: "#FFD700", shadowColor: "#CC8800", glowColor: "#FFE566", name: "封印" },
  "2": { text: "中毒", color: "#66FF33", shadowColor: "#338800", glowColor: "#AAFF88", name: "中毒" },
  "3": { text: "混动", color: "#CC44FF", shadowColor: "#7700AA", glowColor: "#DD88FF", name: "混沌" },
  "4": { text: "冰冻", color: "#33CCFF", shadowColor: "#006699", glowColor: "#88DDFF", name: "冰冻" },
};

export const obstacles = ref([]);
let obstacleIdCounter = 0;

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

    const dist = ty - OBSTACLE_START_Y;
    const v0 = (dist - 0.5 * OBSTACLE_GRAVITY * FLIGHT_TIME * FLIGHT_TIME) / FLIGHT_TIME;

    const spreadCount = targetList.value.length;
    const spread = spreadCount > 1 ? (idx - (spreadCount - 1) / 2) * 10 : 0;

    const startX = tx + spread;
    const finalX = tx;

    const vx = (finalX - startX) / FLIGHT_TIME;

    obstacles.value.push({
      id: ++obstacleIdCounter,
      text: config.text,
      color: config.color,
      shadowColor: config.shadowColor,
      glowColor: config.glowColor,
      targetX: finalX,
      targetY: ty,
      x: startX,
      y: OBSTACLE_START_Y,
      vx: vx,
      vy: Math.max(v0, 40),
      g: OBSTACLE_GRAVITY,
      frame: 0,
      phase: "falling",
      restTimer: 0,
      trail: [],
    });
  });
}

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

function verticalTextSize(fontSize, charCount, gap) {
  const charGap = gap !== undefined ? gap : fontSize * 0.15;
  return {
    w: fontSize,
    h: charCount * fontSize + (charCount - 1) * charGap,
  };
}

export function drawObstacle(ctx, obs) {
  const { phase } = obs;

  if (phase === "falling") {
    drawFallingText(ctx, obs);
  } else if (phase === "resting") {
    drawRestingText(ctx, obs);
  }
}

function drawFallingText(ctx, obs) {
  const { x, y, text, color, shadowColor, glowColor, frame, targetY } = obs;
  const f = frame;

  const totalDist = targetY - OBSTACLE_START_Y;
  const fallenDist = y - OBSTACLE_START_Y;
  const fallProgress = Math.min(fallenDist / Math.max(totalDist, 1), 1);
  const fontSize = BASE_FONT_SIZE + fallProgress * 20;

  const speedCompress = 1 - (1 - fallProgress) * 0.2;

  const textW = fontSize;
  const textH = verticalTextSize(fontSize, text.length).h;

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

  ctx.save();
  ctx.globalAlpha = 0.3 * fallProgress;
  ctx.font = `bold ${fontSize + 12}px "SimHei", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = shadowColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 30;
  fillVerticalText(ctx, text, x, y, fontSize + 12, 0);
  ctx.restore();

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

function drawRestingText(ctx, obs) {
  const { x, y, text, color, shadowColor, glowColor, frame, restTimer } = obs;
  const f = frame;
  const fontSize = BASE_FONT_SIZE * 2;
  const size = verticalTextSize(fontSize, text.length);
  const halfW = size.w / 2;
  const halfH = size.h / 2;

  const remaining = restTimer / REST_DURATION;
  const fadeAlpha = remaining < 0.25 ? remaining / 0.25 : 1;

  const pulse = 0.9 + 0.1 * Math.sin(f * 0.06);
  const bob = Math.sin(f * 0.04) * 3;
  const shake = Math.sin(f * 0.07 + 1) * 1.2;

  ctx.save();

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

  for (let i = 0; i < 6; i++) {
    const orbitAngle = (i / 6) * Math.PI * 2 + f * 0.025;
    const orbitRX = halfW + 14;
    const orbitRY = halfH + 10;
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

  const elapsedSinceLand = REST_DURATION - restTimer;
  if (elapsedSinceLand < 0.25) {
    const ringProgress = elapsedSinceLand / 0.25;
    const ringAlpha = (1 - ringProgress) * 0.6 * fadeAlpha;

    ctx.save();
    ctx.globalAlpha = ringAlpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 * (1 - ringProgress);
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(x, y + bob, halfW * (1 + ringProgress * 2), halfH * (1 + ringProgress * 2), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

export function updateObstacles(ctx, deltaTime) {
  const dt = deltaTime / 1000;
  obstacles.value = obstacles.value.filter((obs) => {
    if (obs.phase === "done") return false;

    obs.frame++;

    if (obs.phase === "falling") {
      obs.trail.push({ x: obs.x, y: obs.y, life: 1.0 });
      const MAX_TRAIL = 6;
      if (obs.trail.length > MAX_TRAIL) {
        obs.trail.shift();
      }
      for (const t of obs.trail) {
        t.life -= dt * 3;
      }
      obs.trail = obs.trail.filter((t) => t.life > 0);

      obs.vy += obs.g * dt;
      obs.y += obs.vy * dt;
      obs.x += (obs.vx || 0) * dt;

      if (obs.y >= obs.targetY) {
        obs.y = obs.targetY;
        obs.x = obs.targetX;
        obs.phase = "resting";
        obs.restTimer = REST_DURATION;
      }
    } else if (obs.phase === "resting") {
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
