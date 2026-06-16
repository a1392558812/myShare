import { ref } from "vue";

export const FIREBALL_START_Y = -40;
export const FIREBALL_GRAVITY = 800;
export const FIREBALL_RADIUS = 10;
export const EXPLODE_DURATION = 0.5;
export const TRAIL_MAX_FB = 12;
export const FLIGHTIME = 0.7;

export const fireballs = ref([]);
let fireballIdCounter = 0;

export function fireFireball(units, selectedUnit, targetList) {
  const attacker = units.value[selectedUnit.value];
  if (!attacker) return;
  if (targetList.value.length === 0) return;

  targetList.value.forEach((targetKey, idx) => {
    const target = units.value[targetKey];
    if (!target) return;

    const tSize = target.size || 40;
    const tx = target.x + tSize / 2;
    const ty = target.y + tSize / 2;

    const dist = ty - FIREBALL_START_Y;
    const flightTime = FLIGHTIME;
    const v0 = (dist - 0.5 * FIREBALL_GRAVITY * flightTime * flightTime) / flightTime;

    const spreadCount = targetList.value.length;
    const spread = spreadCount > 1 ? (idx - (spreadCount - 1) / 2) * 10 : 0;

    const startX = tx + spread;
    const finalX = tx;

    const vx = (finalX - startX) / flightTime;

    fireballs.value.push({
      id: ++fireballIdCounter,
      targetX: finalX,
      targetY: ty,
      x: startX,
      y: FIREBALL_START_Y,
      vx: vx,
      vy: Math.max(v0, 60),
      g: FIREBALL_GRAVITY,
      radius: FIREBALL_RADIUS,
      frame: 0,
      trail: [],
      done: false,
      exploded: false,
      explodeTimer: 0,
    });
  });
}

export function drawFireball(ctx, fb) {
  const { x, y, radius, frame, exploded, explodeTimer } = fb;
  const f = frame;

  if (!exploded) {
    const pulse = 0.85 + 0.15 * Math.sin(f * 0.5);

    for (let i = 0; i < fb.trail.length; i++) {
      const t = fb.trail[i];
      const progress = i / fb.trail.length;
      const trailR = radius * progress * 1.5;
      const alpha = progress * t.life * 0.7;

      ctx.save();
      ctx.globalAlpha = alpha;
      const grad = ctx.createRadialGradient(t.x, t.y, trailR * 0.2, t.x, t.y, trailR);
      grad.addColorStop(0, "rgba(255, 200, 50, 0.8)");
      grad.addColorStop(0.5, "rgba(255, 100, 20, 0.4)");
      grad.addColorStop(1, "rgba(255, 20, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(t.x, t.y, trailR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = 0.25 * pulse;
    ctx.shadowColor = "#FF4400";
    ctx.shadowBlur = 28;
    const outerGrad = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 3.5);
    outerGrad.addColorStop(0, "rgba(255, 180, 20, 0.6)");
    outerGrad.addColorStop(0.4, "rgba(255, 80, 10, 0.3)");
    outerGrad.addColorStop(1, "rgba(255, 20, 0, 0)");
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.7 * pulse;
    ctx.shadowColor = "#FF6600";
    ctx.shadowBlur = 16;
    const midGrad = ctx.createRadialGradient(x - radius * 0.2, y - radius * 0.3, radius * 0.1, x, y, radius * 1.8);
    midGrad.addColorStop(0, "#FFEE88");
    midGrad.addColorStop(0.3, "#FFAA22");
    midGrad.addColorStop(0.7, "#FF4400");
    midGrad.addColorStop(1, "rgba(180, 20, 0, 0)");
    ctx.fillStyle = midGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.8 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.95;
    const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * pulse);
    coreGrad.addColorStop(0, "#FFFFFF");
    coreGrad.addColorStop(0.3, "#FFEE88");
    coreGrad.addColorStop(1, "rgba(255, 150, 30, 0.3)");
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const sparkCount = 5;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.PI * 1.5 + (i - sparkCount / 2) * 0.3 + Math.sin(f * 0.4 + i) * 0.15;
      const sparkDist = radius * (1.2 + 0.5 * Math.sin(f * 0.7 + i));
      const sx = x + Math.cos(angle) * sparkDist;
      const sy = y + Math.sin(angle) * sparkDist;
      ctx.save();
      ctx.globalAlpha = 0.5 + 0.3 * Math.sin(f * 0.6 + i);
      ctx.fillStyle = "#FFAA44";
      ctx.beginPath();
      ctx.arc(sx, sy, 1.3 + Math.sin(f * 0.8 + i) * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else {
    const progress = 1 - explodeTimer / EXPLODE_DURATION;
    const alpha = 1 - progress;

    if (progress < 0.2) {
      const flashAlpha = (1 - progress / 0.2) * 0.8;
      ctx.save();
      ctx.globalAlpha = flashAlpha;
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "#FFFFFF";
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(x, y, radius * 4 * (1 + progress * 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = alpha * 0.7;
    ctx.strokeStyle = "#FF6600";
    ctx.lineWidth = 3 * (1 - progress * 0.5);
    ctx.shadowColor = "#FF4400";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, radius * (1 + progress * 8), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.4;
    ctx.strokeStyle = "#FFAA22";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius * (1 + progress * 6), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const particleCount = 16;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + progress * 1.5;
      const pDist = radius * (1.5 + progress * 10 * (0.6 + 0.4 * Math.sin(i * 3.7)));
      const px = x + Math.cos(angle) * pDist;
      const py = y + Math.sin(angle) * pDist;
      const pAlpha = alpha * (0.4 + 0.6 * Math.sin(i * 1.3));

      ctx.save();
      ctx.globalAlpha = pAlpha;
      ctx.fillStyle = i % 3 === 0 ? "#FFEE44" : (i % 3 === 1 ? "#FF8800" : "#FF2200");
      ctx.shadowColor = "#FF4400";
      ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.arc(px, py, 1.2 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = alpha * 0.6;
    const emberGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 2 * (1 + progress));
    emberGrad.addColorStop(0, "rgba(255, 200, 60, 0.8)");
    emberGrad.addColorStop(1, "rgba(255, 30, 0, 0)");
    ctx.fillStyle = emberGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2 * (1 + progress), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function updateFireballs(ctx, deltaTime) {
  const dt = deltaTime / 1000;
  fireballs.value = fireballs.value.filter((fb) => {
    if (fb.done && fb.explodeTimer <= 0) return false;

    fb.frame++;

    if (!fb.exploded) {
      fb.trail.push({ x: fb.x, y: fb.y, life: 1.0 });
      if (fb.trail.length > TRAIL_MAX_FB) {
        fb.trail.shift();
      }

      for (const t of fb.trail) {
        t.life -= dt * 2.5;
      }
      fb.trail = fb.trail.filter((t) => t.life > 0);

      fb.vy += fb.g * dt;
      fb.y += fb.vy * dt;
      fb.x += (fb.vx || 0) * dt;

      if (fb.y >= fb.targetY) {
        fb.y = fb.targetY;
        fb.x = fb.targetX;
        fb.exploded = true;
        fb.explodeTimer = EXPLODE_DURATION;
      }
    } else {
      fb.explodeTimer -= dt;
      if (fb.explodeTimer <= 0) {
        fb.done = true;
        return false;
      }
    }

    drawFireball(ctx, fb);

    return true;
  });
}
