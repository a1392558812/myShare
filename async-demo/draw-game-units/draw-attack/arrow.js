/**
 * 箭矢攻击系统
 * 按下 x 键，selectedUnit 向 targetList 中所有目标各射一箭
 */
import { ref } from "vue";

// ===================== 常量 =====================
export const ARROW_SPEED = 250; // px/s
export const TRAIL_MAX = 8;     // 拖尾长度

// ===================== 状态 =====================
export const arrows = ref([]);
let arrowIdCounter = 0;

// ===================== 发射 =====================
/** 发射一次攻击：向 targetList 中所有目标各射一箭 */
export function fireAttack(units, selectedUnit, targetList) {
  const attacker = units.value[selectedUnit.value];
  if (!attacker) return;
  if (targetList.value.length === 0) return;

  const unitSize = attacker.size || 40;
  const ax = attacker.x + unitSize / 2;
  const ay = attacker.y + unitSize / 2;

  targetList.value.forEach((targetKey) => {
    const target = units.value[targetKey];
    if (!target) return;

    const tSize = target.size || 40;
    const tx = target.x + tSize / 2;
    const ty = target.y + tSize / 2;

    const dx = tx - ax;
    const dy = ty - ay;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    const vx = (dx / dist) * ARROW_SPEED;
    const vy = (dy / dist) * ARROW_SPEED;
    const angle = Math.atan2(dy, dx);

    arrows.value.push({
      id: ++arrowIdCounter,
      fromX: ax,
      fromY: ay,
      toX: tx,
      toY: ty,
      x: ax,
      y: ay,
      vx,
      vy,
      angle,
      trail: [],
      done: false,
    });
  });
}

// ===================== 绘制 =====================
/**
 * 绘制单支箭矢
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} arrow
 */
export function drawArrow(ctx, arrow) {
  const { x, y, angle } = arrow;
  const bodyLen = 20;
  const headLen = 7;
  const headAngle = Math.PI / 6;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // 箭杆
  ctx.strokeStyle = "#920fbb";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-bodyLen, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();

  // 箭尖（金属色）
  ctx.fillStyle = "#E8E8E8";
  ctx.strokeStyle = "#AAAAAA";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-headLen * Math.cos(headAngle), -headLen * Math.sin(headAngle));
  ctx.lineTo(-headLen * 0.4, 0);
  ctx.lineTo(-headLen * Math.cos(headAngle), headLen * Math.sin(headAngle));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 箭尾羽毛
  ctx.strokeStyle = "#88AAFF";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-bodyLen, 0);
  ctx.lineTo(-bodyLen - 5, -4);
  ctx.moveTo(-bodyLen, 0);
  ctx.lineTo(-bodyLen - 5, 4);
  ctx.stroke();

  ctx.restore();
}

// ===================== 每帧更新 =====================
/** 更新所有箭矢位置并绘制 */
export function updateArrows(ctx, deltaTime) {
  const dt = deltaTime / 1000;
  arrows.value = arrows.value.filter((arrow) => {
    if (arrow.done) return false;

    // 记录拖尾
    arrow.trail.push({ x: arrow.x, y: arrow.y });
    if (arrow.trail.length > TRAIL_MAX) {
      arrow.trail.shift();
    }

    // 移动
    arrow.x += arrow.vx * dt;
    arrow.y += arrow.vy * dt;

    // 到达检测
    const dx = arrow.toX - arrow.x;
    const dy = arrow.toY - arrow.y;
    if (Math.sqrt(dx * dx + dy * dy) < 8) {
      arrow.done = true;
      return false;
    }

    // 绘制拖尾
    if (arrow.trail.length > 1) {
      for (let i = 1; i < arrow.trail.length; i++) {
        const progress = i / arrow.trail.length;
        ctx.save();
        ctx.globalAlpha = progress * 0.5;
        ctx.strokeStyle = `rgba(255, 200, 50, ${progress * 0.6})`;
        ctx.lineWidth = 1.5 * progress;
        ctx.beginPath();
        ctx.moveTo(arrow.trail[i - 1].x, arrow.trail[i - 1].y);
        ctx.lineTo(arrow.trail[i].x, arrow.trail[i].y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 绘制箭矢主体
    drawArrow(ctx, arrow);

    return true;
  });
}
