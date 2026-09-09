// 绘制：HUD（顶部状态条 + 底部技能栏 + 拖拽提示）
// 配色对齐 echo-hunter：teal #3ee6d8 暗底 #020409 / monospace
// 调试叠加层与游玩 HUD 分离：仅在开启调试面板时绘制

import { CELL } from '../config/paths.js';

const HUD_FONT = '12px "Menlo", "Consolas", monospace';
const HUD_TITLE_FONT = 'bold 13px "Menlo", "Consolas", monospace';
const TEAL = '#3ee6d8';
const TEAL_BRIGHT = '#7df3ff';
const DIM = '#6b8b97';
const BG = 'rgba(2, 8, 15, 0.78)';
const BORDER = '#1b7f8a';

export const drawHud = (ctx, state, w, h) => {
  ctx.save();
  // 顶栏背景
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, 34);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 33.5);
  ctx.lineTo(w, 33.5);
  ctx.stroke();

  ctx.font = HUD_FONT;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // 💰 金币
  ctx.fillStyle = '#fcd34d';
  ctx.fillText(`💰 ${state.gold}`, 12, 17);
  // 波次
  ctx.fillStyle = TEAL_BRIGHT;
  ctx.fillText(`波 ${state.wave}/${state.maxWave}${state.endless ? ' ∞' : ''}`, 88, 17);
  // 漏怪
  const leakColor = state.leak >= (state.leakLimit || 20) * 0.7 ? '#f87171' : DIM;
  ctx.fillStyle = leakColor;
  ctx.fillText(`漏 ${state.leak}`, 178, 17);
  // 击杀
  ctx.fillStyle = DIM;
  ctx.fillText(`击杀 ${state.killed}`, 226, 17);

  // 英雄 HP 条
  const hpRatio = Math.max(0, state.hero.hp / state.hero.maxHp);
  ctx.fillStyle = TEAL;
  ctx.fillText(`❤`, 290, 17);
  ctx.fillStyle = '#0d2433';
  ctx.fillRect(310, 11, 90, 12);
  ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.2 ? '#fcd34d' : '#ef4444';
  ctx.fillRect(310, 11, 90 * hpRatio, 12);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.strokeRect(310, 11, 90, 12);
  ctx.fillStyle = TEAL_BRIGHT;
  ctx.fillText(`${state.hero.hp | 0}/${state.hero.maxHp}`, 320, 17);

  // 血契（可叠加被动）：显示叠加层数与可复活次数
  const pact = state.bloodPact;
  if (pact && pact.stacks > 0) {
    ctx.fillStyle = '#f472b6';
    ctx.textAlign = 'left';
    ctx.fillText(`血契 ×${pact.stacks}`, 412, 17);
    ctx.fillStyle = pact.revives > 0 ? '#fb7185' : DIM;
    ctx.fillText(`复活 ${pact.revives}`, 498, 17);
  }

  // 右侧：下一波倒计时
  if (state.waveCountdown > 0 && state.waveCountdown < 9999) {
    ctx.fillStyle = '#fcd34d';
    ctx.textAlign = 'right';
    ctx.fillText(`下一波 ${state.waveCountdown.toFixed(1)}s`, w - 12, 17);
  } else if (state.waveActive) {
    ctx.fillStyle = '#22c55e';
    ctx.textAlign = 'right';
    ctx.fillText(`▶ 波次进行中`, w - 12, 17);
  }
  ctx.restore();

  drawSkillBar(ctx, state, w, h);
  drawMessage(ctx, state, w, h);
};

const drawSkillBar = (ctx, state, w, h) => {
  const barY = h - 60;
  ctx.save();
  ctx.fillStyle = BG;
  ctx.fillRect(0, barY, w, 60);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barY);
  ctx.lineTo(w, barY);
  ctx.stroke();
  // 被动技能（血契）不占主动技能槽，其加成显示在顶栏
  const skills = state.skills.filter((sk) => !sk.def.passive);
  const slotW = 60;
  const startX = 10;
  skills.forEach((sk, i) => {
    const x = startX + i * (slotW + 6);
    const cdRatio = sk.cooldownLeft > 0 ? sk.cooldownLeft / sk.cooldown : 0;
    ctx.fillStyle = sk.unlocked ? 'rgba(11, 31, 46, 0.95)' : 'rgba(2, 16, 26, 0.6)';
    ctx.fillRect(x, barY + 6, slotW, 48);
    ctx.strokeStyle = sk.unlocked ? TEAL : '#133946';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, barY + 6, slotW, 48);
    ctx.fillStyle = sk.unlocked ? TEAL_BRIGHT : '#475569';
    ctx.font = HUD_TITLE_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sk.key || '?', x + slotW / 2, barY + 20);
    ctx.font = '10px "Menlo", "Consolas", monospace';
    ctx.fillText(sk.name, x + slotW / 2, barY + 36);
    if (sk.unlocked) {
      ctx.fillStyle = '#fcd34d';
      ctx.fillText(`Lv${sk.level}`, x + slotW / 2, barY + 48);
    }
    if (cdRatio > 0 && sk.unlocked) {
      ctx.fillStyle = 'rgba(2, 16, 26, 0.6)';
      ctx.fillRect(x, barY + 6 + 48 * (1 - cdRatio), slotW, 48 * cdRatio);
    }
  });
  ctx.restore();
};

const drawMessage = (ctx, state, w, h) => {
  if (!state.message) return;
  const t = state.message.t / state.message.life;
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - t);
  ctx.fillStyle = state.message.color || TEAL;
  ctx.font = 'bold 22px "Menlo", "Consolas", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.message.text, w / 2, h / 2);
  ctx.restore();
};

// ===== 调试叠加层：仅 state.showDebug 为真时绘制 =====
export const drawDebugOverlay = (ctx, state, w, h) => {
  const dbg = state.debug || {};
  ctx.save();
  // 各塔射程
  for (const t of state.towers) {
    const cx = t.gx * CELL + CELL / 2;
    const cy = t.gy * CELL + CELL / 2;
    let r = 0;
    if (t.def.range) r = t.def.range[t.level] || 0;
    else if (t.kind === 'tech') r = t.def.techAttackRange[t.level] || 0;
    else if (t.kind === 'barracks') r = t.def.rallyRange[t.level] || t.def.rallyRange[0];
    if (!r) continue;
    ctx.strokeStyle = 'rgba(62, 230, 216, 0.22)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // 敌人血条 + 数值
  for (const e of state.enemies) {
    const size = e.size || 8;
    const ratio = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = 'rgba(2, 8, 15, 0.85)';
    ctx.fillRect(e.x - 11, e.y - size - 9, 22, 4);
    ctx.fillStyle = ratio > 0.4 ? '#22c55e' : '#ef4444';
    ctx.fillRect(e.x - 11, e.y - size - 9, 22 * ratio, 4);
    ctx.fillStyle = '#7df3ff';
    ctx.font = '8px "Menlo", "Consolas", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${Math.max(0, Math.ceil(e.hp))}`, e.x, e.y - size - 10);
  }
  // 小兵集结点朝向线
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
  ctx.lineWidth = 1;
  for (const s of state.summons) {
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.rallyX, s.rallyY);
    ctx.stroke();
  }
  // 左上角数据板
  const lines = [
    `FPS ${dbg.fps || 0} · T ${(state.time / 1000).toFixed(1)}s · frame ${dbg.frame || 0}`,
    `敌 ${dbg.enemyCount || 0} · 塔 ${dbg.towerCount || 0} · 兵 ${dbg.summonCount || 0} · 弹 ${dbg.projectileCount || 0}`,
    `队列 ${state.spawnQueue ? state.spawnQueue.length : 0} 待生成 · 波 ${state.wave}${state.waveActive ? ' ▶' : ''}`,
    `英雄 (${state.hero.x | 0},${state.hero.y | 0}) HP ${state.hero.hp | 0}/${state.hero.maxHp}`,
    `金币 ${state.gold} · 漏 ${state.leak}/${state.leakLimit} · 移动 ${state.moveCount}`,
    `鼠标格 ${state.hoveredCell ? `(${state.hoveredCell.gx},${state.hoveredCell.gy})` : '-'} 速×${state.enemySpeedK || 1}`,
  ];
  const bw = 272;
  const bh = lines.length * 13 + 10;
  ctx.fillStyle = 'rgba(2, 8, 15, 0.88)';
  ctx.fillRect(6, 40, bw, bh);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  ctx.strokeRect(6.5, 40.5, bw, bh);
  ctx.fillStyle = '#fbbf24';
  ctx.font = '10px "Menlo", "Consolas", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  lines.forEach((l, i) => ctx.fillText(l, 13, 46 + i * 13));
  ctx.restore();
};

export const drawBuildPanel = (ctx, state, x, y, w, h, onClick) => {
  ctx.save();
  ctx.fillStyle = BG;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  const kinds = ['barracks', 'cannon', 'arrow', 'tech', 'detector'];
  kinds.forEach((k, i) => {
    const itemY = y + 10 + i * 46;
    const def = state.towerDefs[k];
    const affordable = state.gold >= def.cost;
    ctx.fillStyle = affordable ? 'rgba(11, 31, 46, 0.95)' : 'rgba(2, 16, 26, 0.6)';
    ctx.fillRect(x + 10, itemY, w - 20, 36);
    ctx.strokeStyle = affordable ? def.ringColor : '#133946';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 10, itemY, w - 20, 36);
    ctx.fillStyle = affordable ? TEAL_BRIGHT : '#475569';
    ctx.font = HUD_TITLE_FONT;
    ctx.textAlign = 'left';
    ctx.fillText(def.name, x + 22, itemY + 16);
    ctx.fillStyle = affordable ? '#fcd34d' : '#475569';
    ctx.fillText(`💰${def.cost}`, x + 22, itemY + 30);
    ctx.fillStyle = DIM;
    ctx.font = '10px "Menlo", "Consolas", monospace';
    ctx.fillText(def.desc, x + w - 110, itemY + 18);
    if (state.selectedBuildKind === k) {
      ctx.strokeStyle = TEAL;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 10, itemY, w - 20, 36);
    }
  });
  ctx.restore();
};

export const drawSelectedPanel = (ctx, state, x, y, w, h) => {
  const t = state.selectedTower;
  if (!t) return;
  ctx.save();
  ctx.fillStyle = BG;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.fillStyle = TEAL_BRIGHT;
  ctx.font = HUD_TITLE_FONT;
  ctx.textAlign = 'left';
  ctx.fillText(`${t.def.name} Lv${t.level}`, x + 10, y + 22);
  ctx.fillStyle = DIM;
  ctx.font = '11px "Menlo", "Consolas", monospace';
  ctx.fillText(`HP: ${(t.hp || 0).toFixed(0)}/${(t.maxHp || 0).toFixed(0)}`, x + 10, y + 40);
  const next = t.def.upgradeCost[t.level];
  if (Number.isFinite(next)) {
    ctx.fillStyle = state.gold >= next ? '#fcd34d' : DIM;
    ctx.fillText(`升级: 💰${next}`, x + 10, y + 56);
  } else {
    ctx.fillText('已满级', x + 10, y + 56);
  }
  ctx.fillStyle = '#475569';
  ctx.fillText(`出售: 💰${(t.def.cost * (1 + 0.3 * t.level) * 0.7) | 0}`, x + 10, y + 72);
  ctx.fillText(`移动: 💰${(t.def.cost * 0.3) | 0}`, x + 10, y + 88);
  ctx.restore();
};