// 绘制：英雄 + 技能特效 + 投射物（子弹/箭矢/射线）
import drawHeroSprite from './units/drawHero.js';

export const drawHero = (ctx, state) => {
  const h = state.hero;
  if (!h) return;
  // 技能光效（底层）
  if (h.beamActive) {
    ctx.save();
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
    ctx.beginPath();
    ctx.arc(h.x, h.y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  if (h.immortal && !h.beamActive) {
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(h.x, h.y, 19, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  drawHeroSprite(ctx, h, state.time, h.facing || 1);
};

export const drawProjectiles = (ctx, state) => {
  for (const p of state.projectiles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    if (p.kind === 'arrow') {
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(-4, -1, 8, 2);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-5, -1, 2, 2);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-4, -1, 8, 2);
    } else if (p.kind === 'cannon') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // 火光
      ctx.fillStyle = 'rgba(251,146,60,0.7)';
      ctx.beginPath();
      ctx.arc(2, 0, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'missile') {
      // 洲际导弹：弹体 + 尾焰
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(0, -3);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-8, 0);
      ctx.stroke();
      ctx.fillStyle = 'rgba(251,146,60,0.85)';
      ctx.beginPath();
      ctx.arc(-8, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'tech') {
      // 科技前哨站：紫色能量弹（减速）
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(168,85,247,0.6)';
      ctx.beginPath();
      ctx.arc(-2, 0, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'arrowRain') {
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-3, -1, 6, 2);
      ctx.strokeStyle = '#f0abfc';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-3, -1, 6, 2);
    } else if (p.kind === 'slash') {
      // 英雄普攻斩击：弧形光刃，随 life 渐显后渐隐
      const t = (state.time - p.born) / p.lifeMs;
      const alpha = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, 18, -0.7, 0.7);
      ctx.stroke();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 22, -0.55, 0.55);
      ctx.stroke();
    }
    ctx.restore();
  }
};

export const drawEffects = (ctx, state) => {
  for (const fx of state.fx) {
    const t = fx.t / fx.life;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - t);
    if (fx.kind === 'shockwave') {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3 * (1 - t * 0.5);
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, fx.radius * t, 0, Math.PI * 2);
      ctx.stroke();
    } else if (fx.kind === 'splash') {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, fx.radius * (0.5 + t * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, fx.radius * (0.3 + t * 0.6), 0, Math.PI * 2);
      ctx.stroke();
    } else if (fx.kind === 'chain') {
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      fx.pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    } else if (fx.kind === 'beam') {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.translate(fx.x, fx.y);
      ctx.rotate(fx.angle);
      ctx.fillRect(0, -fx.width / 2, fx.length, fx.width);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, -fx.width / 2, fx.length, fx.width);
    } else if (fx.kind === 'heal') {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (fx.kind === 'summon') {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 8 + t * 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (fx.kind === 'slashHit') {
      // 斩击命中：放射短光线
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + t * 1.5;
        const r0 = 4;
        const r1 = 4 + 10 * (1 - t);
        ctx.beginPath();
        ctx.moveTo(fx.x + Math.cos(a) * r0, fx.y + Math.sin(a) * r0);
        ctx.lineTo(fx.x + Math.cos(a) * r1, fx.y + Math.sin(a) * r1);
        ctx.stroke();
      }
    } else if (fx.kind === 'hit') {
      // 英雄被击：红圈震开
      ctx.strokeStyle = fx.color || '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 6 + 14 * t, 0, Math.PI * 2);
      ctx.stroke();
    } else if (fx.kind === 'fire') {
      // 火焰灼烧区生成：扩散火环
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.9)';
      ctx.lineWidth = 2.5 * (1 - t * 0.5);
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, fx.radius * (0.4 + t * 0.6), 0, Math.PI * 2);
      ctx.stroke();
    } else if (fx.kind === 'poison') {
      // 毒雾生成：扩散毒环
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.lineWidth = 2.5 * (1 - t * 0.5);
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, fx.radius * (0.4 + t * 0.6), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 火焰灼烧区
  for (const z of state.fireZones || []) {
    const tt = (z.age || 0) / (z.duration || 1);
    ctx.save();
    ctx.globalAlpha = 0.45 * (1 - tt * 0.6);
    ctx.fillStyle = 'rgba(251, 146, 60, 0.55)';
    ctx.beginPath();
    ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
  // 毒雾区
  for (const z of state.poisonZones || []) {
    const tt = (z.age || 0) / (z.duration || 1);
    ctx.save();
    ctx.globalAlpha = 0.4 * (1 - tt * 0.6);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
    ctx.beginPath();
    ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
  if (state.hero?.beamActive) {
    const h = state.hero;
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
    ctx.translate(h.x, h.y);
    ctx.rotate(h.beamAngle);
    ctx.fillRect(0, -14, 800, 28);
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, -14, 800, 28);
    ctx.restore();
  }
};
