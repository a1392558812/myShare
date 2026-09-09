// 绘制：敌兵 / 飞龙 / 幽影 / Boss（优先用离屏精灵缓存，回退实时绘制）
import { PATH_A, PATH_B, getDirAtLength } from '../config/paths.js';
import { drawSoldier, drawDragon, drawGhost, drawBoss } from './units/index.js';
import { bar } from './units/helpers.js';
import { getSprite, spriteFrame, phaseOf, SPRITE_BOX } from './units/spriteCache.js';

const getFacing = (e) => {
  const path = e.path === 'A' ? PATH_A : PATH_B;
  const dir = getDirAtLength(path, e.t + 12);
  return dir.x < 0 ? -1 : 1;
};

const drawHpBar = (ctx, e) => {
  if (e.hp >= e.maxHp) return;
  const w = e.kind === 'boss' ? 44 : e.def?.flying ? 26 : 20;
  const x = e.x - w / 2;
  const y = e.y - (e.floatY || 0) - (e.kind === 'boss' ? 34 : 18) - 6;
  ctx.save();
  bar(ctx, x, y, w, 4, e.hp / e.maxHp, '#0f172a', '#ef4444', e.kind === 'boss' ? '#f59e0b' : '#22c55e');
  ctx.restore();
};

// 单位种类（Boss 不缓存，数量少且造型复杂）
const kindOf = (e) => {
  if (e.def.flying) return 'dragon';
  if (e.def.stealth) return 'ghost';
  return 'soldier';
};

export const drawEnemies = (ctx, state) => {
  const time = state.time;
  const dpr = state.dpr || 1;
  for (const e of state.enemies) {
    if (e.dead || e.escaped) continue;
    if (e.alpha < 0.05 && !e.detected) continue;
    const facing = e.facing || getFacing(e);

    if (e.kind === 'boss') {
      const prev = ctx.globalAlpha;
      if (e.alpha < 1) ctx.globalAlpha = prev * Math.max(0.14, e.alpha);
      drawBoss(ctx, e, time, facing);
      ctx.globalAlpha = prev;
      drawHpBar(ctx, e);
      continue;
    }

    const kind = kindOf(e);
    const frame = spriteFrame(phaseOf(kind, e, time));
    const sp = getSprite(kind, frame, facing, e.detected ? 1 : 0, dpr, e);
    if (sp) {
      const box = SPRITE_BOX[kind];
      const prev = ctx.globalAlpha;
      // 隐身单位的淡入淡出用整体透明度近似（精灵内部按不透明渲染）
      if (e.def.stealth) ctx.globalAlpha = prev * Math.max(0.08, e.alpha ?? 1);
      ctx.drawImage(sp, e.x - box.ox, e.y - box.oy, box.w, box.h);
      ctx.globalAlpha = prev;
    } else {
      if (kind === 'dragon') drawDragon(ctx, e, time, facing);
      else if (kind === 'ghost') drawGhost(ctx, e, time, facing);
      else drawSoldier(ctx, e, time, facing);
    }
    drawHpBar(ctx, e);
  }
};
