import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRID_COLS,
  GRID_ROWS,
  CELL_SIZE,
  PLAYER_ZONE_COLS,
  UNIT_RADIUS,
} from '../constants.js';
import { drawCharacter } from './units/index.js';

/**
 * 计算缩放参数
 * @param {number} canvasW - 实际画布宽度
 * @param {number} canvasH - 实际画布高度
 * @returns {{ scale: number, offsetX: number, offsetY: number }}
 */
const calcTransform = (canvasW, canvasH) => {
  const scaleX = canvasW / CANVAS_WIDTH;
  const scaleY = canvasH / CANVAS_HEIGHT;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (canvasW - CANVAS_WIDTH * scale) / 2;
  const offsetY = (canvasH - CANVAS_HEIGHT * scale) / 2;
  return { scale, offsetX, offsetY };
};

/**
 * 绘制战场背景网格
 * @param {CanvasRenderingContext2D} ctx
 */
const drawBackground = (ctx) => {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const playerZoneWidth = PLAYER_ZONE_COLS * CELL_SIZE;
  ctx.fillStyle = 'rgba(59, 130, 246, 0.06)';
  ctx.fillRect(0, 0, playerZoneWidth, CANVAS_HEIGHT);

  ctx.fillStyle = 'rgba(220, 38, 38, 0.06)';
  ctx.fillRect(playerZoneWidth, 0, CANVAS_WIDTH - playerZoneWidth, CANVAS_HEIGHT);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playerZoneWidth, 0);
  ctx.lineTo(playerZoneWidth, CANVAS_HEIGHT);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < GRID_COLS; i++) {
    if (i === PLAYER_ZONE_COLS) continue;
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
    ctx.stroke();
  }
  for (let i = 1; i < GRID_ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
    ctx.stroke();
  }
};

/**
 * 绘制血条
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 中心 x
 * @param {number} y - 中心 y
 * @param {number} radius - 单位半径
 * @param {number} hp - 当前血量
 * @param {number} maxHp - 最大血量
 * @param {string} side - 阵营 player/enemy
 */
const drawHpBar = (ctx, x, y, radius, hp, maxHp, side) => {
  const barWidth = radius * 2.2;
  const barHeight = 2;
  const barX = x - barWidth / 2;
  const barY = y - radius - 12;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  const ratio = Math.max(0, hp / maxHp);
  ctx.fillStyle = side === 'player' ? '#22c55e' : '#ef4444';
  ctx.fillRect(barX, barY, barWidth * ratio, barHeight);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
};

/**
 * 绘制单个单位
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} unit - 单位数据
 * @param {number} time - 当前时间戳（用于动画）
 */
const drawUnit = (ctx, unit, time) => {
  if (!unit.alive) return;

  const { x, y, side } = unit;
  const radius = unit.size || UNIT_RADIUS;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + radius * 0.9, radius * 0.6, radius * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  const drawn = drawCharacter(ctx, unit, time);

  if (!drawn) {
    ctx.fillStyle = side === 'player' ? '#3b82f6' : '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = side === 'player' ? '#93c5fd' : '#fca5a5';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(unit.icon || '?', x, y);
  }

  if (unit.shieldAuraRange > 0) {
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x, y, unit.shieldAuraRange, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawHpBar(ctx, x, y, radius, unit.hp, unit.maxHp, side);

  if (unit.revived) {
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R', x + radius - 4, y - radius + 2);
  }
};

/**
 * 绘制投射物
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} proj - 投射物
 */
const drawProjectile = (ctx, proj) => {
  if (!proj.alive) return;
  // 边界剔除
  const margin = 20;
  if (proj.x < -margin || proj.x > CANVAS_WIDTH + margin ||
      proj.y < -margin || proj.y > CANVAS_HEIGHT + margin) return;

  if (proj.type === 'aoe') {
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(249, 115, 22, 0.3)';
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 10, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = proj.side === 'player' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(248, 113, 113, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(proj.x - proj.vx * 3, proj.y - proj.vy * 3);
    ctx.lineTo(proj.x, proj.y);
    ctx.stroke();

    ctx.fillStyle = proj.side === 'player' ? '#fbbf24' : '#f87171';
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
};

/**
 * 绘制特效
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} effect - 特效数据
 */
const drawEffect = (ctx, effect) => {
  const progress = 1 - effect.life / effect.maxLife;

  // 边界剔除
  if (typeof effect.x === 'number' && typeof effect.y === 'number') {
    const radius = effect.radius || 30;
    const margin = 30 + radius;
    if (effect.x < -margin || effect.x > CANVAS_WIDTH + margin ||
        effect.y < -margin || effect.y > CANVAS_HEIGHT + margin) return;
  }

  switch (effect.type) {
    case 'hit': {
      ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 8 + progress * 10, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'aoeHit': {
      const alpha = 1 - progress;
      ctx.fillStyle = `rgba(249, 115, 22, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * progress, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }
    case 'explosion': {
      const alpha = 1 - progress;
      ctx.fillStyle = `rgba(239, 68, 68, ${alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * progress, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(251, 146, 60, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }
    case 'heal': {
      ctx.fillStyle = `rgba(34, 197, 94, ${1 - progress})`;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', effect.x, effect.y - progress * 15);
      break;
    }
    case 'healAura': {
      const alpha = 1 - progress;
      ctx.fillStyle = `rgba(34, 197, 94, ${alpha * 0.15})`;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'death': {
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 1 - progress;
      ctx.fillText(effect.icon || '💀', effect.x, effect.y - progress * 20);
      ctx.globalAlpha = 1;
      break;
    }
    case 'revive': {
      ctx.strokeStyle = `rgba(253, 224, 71, ${1 - progress})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 15 + progress * 15, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'slam': {
      const alpha = 1 - progress;
      ctx.fillStyle = `rgba(220, 38, 38, ${alpha * 0.2})`;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * progress, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      break;
    }
    case 'lasso': {
      ctx.strokeStyle = `rgba(251, 191, 36, ${1 - progress})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(effect.x1, effect.y1);
      ctx.lineTo(effect.x2, effect.y2);
      ctx.stroke();
      break;
    }
    case 'summon': {
      ctx.strokeStyle = `rgba(168, 85, 247, ${1 - progress})`;
      ctx.lineWidth = 2;
      const r = 20 + progress * 20;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'dodge': {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * (1 - progress)})`;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 12 + progress * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 255, 255, ${1 - progress})`;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('闪', effect.x, effect.y - 12);
      break;
    }
    case 'thorns': {
      ctx.strokeStyle = `rgba(251, 146, 60, ${1 - progress})`;
      ctx.lineWidth = 2;
      const r = 6 + progress * 10;
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI * 2 * i) / 4;
        ctx.beginPath();
        ctx.moveTo(effect.x + Math.cos(angle) * r * 0.5, effect.y + Math.sin(angle) * r * 0.5);
        ctx.lineTo(effect.x + Math.cos(angle) * r, effect.y + Math.sin(angle) * r);
        ctx.stroke();
      }
      break;
    }
    case 'burn': {
      ctx.fillStyle = `rgba(239, 68, 68, ${0.7 * (1 - progress)})`;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔥', effect.x, effect.y - 8 - progress * 10);
      break;
    }
    case 'killStack': {
      ctx.fillStyle = `rgba(168, 85, 247, ${1 - progress})`;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+ATK', effect.x, effect.y - 15 - progress * 15);
      break;
    }
    case 'blessing': {
      ctx.strokeStyle = `rgba(251, 191, 36, ${0.8 * (1 - progress)})`;
      ctx.lineWidth = 2;
      const r = 10 + progress * 15;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(253, 224, 71, ${0.5 * (1 - progress)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, r * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const px = effect.x + Math.sin(i * 1.3 + progress * 5) * 8;
        const py = effect.y - progress * 25 - i * 4;
        ctx.fillStyle = `rgba(251, 191, 36, ${(1 - progress) * 0.6})`;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(251, 191, 36, ${1 - progress})`;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨', effect.x, effect.y - 18 - progress * 10);
      break;
    }
    case 'holySmite': {
      const radius = effect.radius || 70;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.15 * (1 - progress)})`;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, radius * (1 - progress * 0.3), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(253, 224, 71, ${0.8 * (1 - progress)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, radius * (0.5 + progress * 0.5), 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
      ctx.lineWidth = 2;
      const crossR = 15 + progress * 10;
      ctx.beginPath();
      ctx.moveTo(effect.x - crossR, effect.y);
      ctx.lineTo(effect.x + crossR, effect.y);
      ctx.moveTo(effect.x, effect.y - crossR);
      ctx.lineTo(effect.x, effect.y + crossR);
      ctx.stroke();
      break;
    }
    case 'resurrect': {
      const r = 8 + progress * 20;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * (1 - progress)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(effect.x, effect.y + 5, r, r * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      const beamH = 30 + progress * 15;
      const grad = ctx.createLinearGradient(effect.x, effect.y, effect.x, effect.y - beamH);
      grad.addColorStop(0, `rgba(255, 255, 255, ${0.6 * (1 - progress)})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(effect.x - 6, effect.y - beamH, 12, beamH);
      for (let i = 0; i < 6; i++) {
        const px = effect.x + Math.sin(i * 1.5 + progress * 8) * 6;
        const py = effect.y - progress * 30 - i * 5;
        ctx.fillStyle = `rgba(253, 224, 71, ${(1 - progress) * 0.7})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(255, 255, 255, ${1 - progress})`;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('复活', effect.x, effect.y - 25 - progress * 15);
      break;
    }
    case 'execute': {
      ctx.strokeStyle = `rgba(239, 68, 68, ${1 - progress})`;
      ctx.lineWidth = 3;
      const r = 8 + progress * 12;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(effect.x - 15, effect.y - 15);
      ctx.lineTo(effect.x + 15, effect.y + 15);
      ctx.moveTo(effect.x + 15, effect.y - 15);
      ctx.lineTo(effect.x - 15, effect.y + 15);
      ctx.stroke();
      ctx.fillStyle = `rgba(239, 68, 68, ${1 - progress})`;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('必杀!', effect.x, effect.y - 18 - progress * 12);
      break;
    }
    case 'charge': {
      const radius = effect.radius || 50;
      ctx.strokeStyle = `rgba(251, 146, 60, ${0.8 * (1 - progress)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, radius * (0.3 + progress * 0.7), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(251, 191, 36, ${0.2 * (1 - progress)})`;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, radius * 0.4 * (1 - progress), 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const pr = radius * (0.5 + progress * 0.4);
        ctx.fillStyle = `rgba(200, 200, 200, ${(1 - progress) * 0.4})`;
        ctx.beginPath();
        ctx.arc(effect.x + Math.cos(angle) * pr, effect.y + Math.sin(angle) * pr, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }
};

/**
 * 主渲染函数 - 绘制整个战场
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} snapshot - 战斗快照
 * @param {number} canvasW - 实际画布宽度（像素）
 * @param {number} canvasH - 实际画布高度（像素）
 */
export const render = (ctx, snapshot, canvasW, canvasH) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvasW, canvasH);

  const { scale, offsetX, offsetY } = calcTransform(canvasW, canvasH);

  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

  drawBackground(ctx);

  snapshot.projectiles.forEach((p) => drawProjectile(ctx, p));

  snapshot.effects.forEach((e) => drawEffect(ctx, e));

  const allUnits = [...snapshot.bros, ...snapshot.enemies].filter((u) => u.alive);
  allUnits.sort((a, b) => a.y - b.y);
  const time = performance.now();
  allUnits.forEach((u) => drawUnit(ctx, u, time));

  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

/**
 * 绘制战斗结束遮罩
 * @param {CanvasRenderingContext2D} ctx
 * @param {boolean} victory
 * @param {number} canvasW - 实际画布宽度
 * @param {number} canvasH - 实际画布高度
 */
export const renderBattleEnd = (ctx, victory, canvasW, canvasH) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.font = `bold ${Math.min(canvasW, canvasH) * 0.08}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = victory ? '#22c55e' : '#ef4444';
  ctx.fillText(victory ? '胜利!' : '团灭', canvasW / 2, canvasH / 2);
};
