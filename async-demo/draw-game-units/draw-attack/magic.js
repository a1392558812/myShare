import { ref } from "vue";

export const MAGIC_RADIUS = 55;
export const MAGIC_LIFETIME = 2.0;
export const RUNE_COUNT = 8;

export const magicCircles = ref([]);
let magicIdCounter = 0;


export function generateLightning(tx, ty) {
  const startY = -30;
  const startX = tx + (Math.random() - 0.5) * 40;
  const segments = [];
  let cx = startX;
  let cy = startY;
  const totalDist = ty - startY;
  const segCount = 6 + Math.floor(Math.random() * 4);

  for (let i = 0; i < segCount; i++) {
    const progress = (i + 1) / segCount;
    const nx = startX + (tx - startX) * progress + (Math.random() - 0.5) * 35 * (1 - progress * 0.5);
    const ny = startY + totalDist * progress;
    segments.push({ x1: cx, y1: cy, x2: nx, y2: ny });
    cx = nx;
    cy = ny;
  }
  segments[segments.length - 1].x2 = tx;
  segments[segments.length - 1].y2 = ty;

  const branches = [];
  for (let i = 1; i < segments.length - 1; i++) {
    if (Math.random() < 0.45) {
      const seg = segments[i];
      const bx = seg.x1 + (Math.random() - 0.5) * 25;
      const by = seg.y1 + Math.random() * 15;
      branches.push({ x1: seg.x1, y1: seg.y1, x2: bx, y2: by });
    }
  }

  return { segments, branches };
}

export function drawRune(ctx, rx, ry, size, type) {
  ctx.save();
  ctx.translate(rx, ry);

  switch (type) {
    case 0:
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(-size * 0.8, size * 0.6);
      ctx.lineTo(size * 0.8, size * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 1:
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.7, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.7, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 2:
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 3:
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.moveTo(-size * 0.7, 0);
      ctx.lineTo(size * 0.7, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-size * 0.5, -size * 0.5);
      ctx.lineTo(size * 0.5, size * 0.5);
      ctx.moveTo(size * 0.5, -size * 0.5);
      ctx.lineTo(-size * 0.5, size * 0.5);
      ctx.stroke();
      break;
    default:
      ctx.fillRect(-size * 0.5, -size * 0.5, size, size);
      break;
  }

  ctx.restore();
}


export function createMagicCircle(mouseX, mouseY) {
  if (mouseX <= 0 && mouseY <= 0) return;

  const runes = [];
  for (let i = 0; i < RUNE_COUNT; i++) {
    runes.push({
      angle: (i / RUNE_COUNT) * Math.PI * 2,
    });
  }

  const lightning = generateLightning(mouseX, mouseY);

  magicCircles.value.push({
    id: ++magicIdCounter,
    x: mouseX,
    y: mouseY,
    radius: MAGIC_RADIUS,
    elapsed: 0,
    runes,
    lightning,
    done: false,
  });
}


export function drawMagicCircle(ctx, mc) {
  const { x, y, radius, elapsed } = mc;
  const f = elapsed;

  const formP = Math.min(f / 0.5, 1);
  const runeP = Math.max(0, Math.min((f - 0.2) / 0.8, 1));
  const lightningP = Math.max(0, Math.min((f - 0.5) / 0.8, 1));
  const dissipateP = Math.max(0, Math.min((f - 1.2) / 0.8, 1));
  const overallAlpha = 1 - dissipateP;

  const curR = radius * Math.min(formP, 1) * (1 + Math.sin(f * 8) * 0.02 * (1 - formP));

  if (formP > 0.01) {
    ctx.save();
    ctx.globalAlpha = overallAlpha * formP * 0.9;
    ctx.strokeStyle = "#8866FF";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#6644EE";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(x, y, curR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = overallAlpha * formP * 0.5;
    ctx.strokeStyle = "#AA88FF";
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, curR * 0.72, 0, Math.PI * 2);
    ctx.stroke();

    const rot1 = f * 1.8;
    ctx.globalAlpha = overallAlpha * 0.65;
    ctx.strokeStyle = "#DDCCFF";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#AA88FF";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, curR, rot1, rot1 + Math.PI * 1.1);
    ctx.stroke();

    const rot2 = -f * 1.3;
    ctx.globalAlpha = overallAlpha * 0.4;
    ctx.strokeStyle = "#BB99FF";
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(x, y, curR * 0.72, rot2, rot2 + Math.PI * 0.9);
    ctx.stroke();

    const centerPulse = 0.7 + 0.3 * Math.sin(f * 3);
    ctx.globalAlpha = overallAlpha * 0.8 * centerPulse;
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "#CCAAFF";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, y, 3 * centerPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (f > 0.2 && overallAlpha > 0) {
    mc.runes.forEach((rune, i) => {
      const riseDist = (f - 0.2) * 50 * (0.7 + i * 0.12);
      const sway = Math.sin(f * 2.5 + i * 0.8) * 6;
      const rx = x + Math.cos(rune.angle + f * 0.3) * curR + sway;
      const ry = y + Math.sin(rune.angle + f * 0.3) * curR - riseDist;

      const lifeAlpha = 1 - Math.min(riseDist / 55, 1);
      const a = overallAlpha * runeP * lifeAlpha * 0.85;
      if (a < 0.02) return;

      const runeSize = 5 + 2 * Math.sin(f * 3.5 + i);

      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = "#DDAAFF";
      ctx.strokeStyle = "#9966FF";
      ctx.lineWidth = 1;
      ctx.shadowColor = "#AA77FF";
      ctx.shadowBlur = 8;
      drawRune(ctx, rx, ry, runeSize, i % 4);

      ctx.globalAlpha = a * 0.3;
      ctx.fillStyle = "#EECCFF";
      ctx.beginPath();
      ctx.arc(rx, ry + 4, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  if (lightningP > 0 && overallAlpha > 0) {
    const boltAlpha = Math.min(lightningP * 2.5, 1) * overallAlpha;
    const segs = mc.lightning.segments;
    const branches = mc.lightning.branches;

    if (lightningP < 0.15) {
      const flashA = (1 - lightningP / 0.15) * 0.7 * overallAlpha;
      ctx.save();
      ctx.globalAlpha = flashA;
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "#FFFFFF";
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(x, y, 50 * (1 + lightningP * 3), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = boltAlpha * 0.25;
    ctx.strokeStyle = "#6688FF";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.shadowColor = "#5577FF";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    for (const s of segs) { ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); }
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = boltAlpha * 0.6;
    ctx.strokeStyle = "#AACCFF";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.shadowColor = "#88AAFF";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    for (const s of segs) { ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); }
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = boltAlpha * 0.9;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (const s of segs) { ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); }
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = boltAlpha * 0.35;
    ctx.strokeStyle = "#AACCDD";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.shadowColor = "#88AAFF";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (const b of branches) { ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); }
    ctx.stroke();
    ctx.restore();

    const hitShimmer = Math.sin(f * 10) * 0.3 + 0.7;
    ctx.save();
    ctx.globalAlpha = boltAlpha * 0.5 * hitShimmer;
    const hitGrad = ctx.createRadialGradient(x, y, 0, x, y, 25);
    hitGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
    hitGrad.addColorStop(0.5, "rgba(180, 160, 255, 0.4)");
    hitGrad.addColorStop(1, "rgba(100, 80, 255, 0)");
    ctx.fillStyle = hitGrad;
    ctx.shadowColor = "#CCBBFF";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (f > 1.0 && overallAlpha > 0) {
    const shockP = Math.max(0, (f - 1.0) / 1.0);
    const shockR = curR * (1 + shockP * 4);
    const shockA = overallAlpha * (1 - shockP) * 0.4;

    ctx.save();
    ctx.globalAlpha = shockA;
    ctx.strokeStyle = "#9966FF";
    ctx.lineWidth = 2 * (1 - shockP);
    ctx.shadowColor = "#7744DD";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, y, shockR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const pCount = 12;
    for (let i = 0; i < pCount; i++) {
      const a = (i / pCount) * Math.PI * 2 + shockP * 1.5;
      const pDist = shockR * (0.8 + Math.sin(i * 2.7) * 0.25);
      const px = x + Math.cos(a) * pDist;
      const py = y + Math.sin(a) * pDist;

      ctx.save();
      ctx.globalAlpha = shockA * 0.5;
      ctx.fillStyle = "#CCAAFF";
      ctx.beginPath();
      ctx.arc(px, py, 1.5 * (1 - shockP), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

export function updateMagicCircles(ctx, deltaTime) {
  magicCircles.value = magicCircles.value.filter((mc) => {
    mc.elapsed += deltaTime / 1000;
    if (mc.elapsed >= MAGIC_LIFETIME) {
      mc.done = true;
      return false;
    }
    drawMagicCircle(ctx, mc);
    return true;
  });
}
