/**
 * Canvas 渲染层：背景分块缓存 → 道具 → 投射物 → 敌人 → 玩家 → 特效 → 小地图
 * 只读取世界数据，不修改任何状态
 */

import { AI_CONFIG, PALETTE, TEAMWORK_CONFIG, WORLD_CONFIG } from '../constants.js';
import { RELICS } from '../config/relics.js';
import { clamp, distanceBetween, hashUnit } from '../core/utils.js';
import { drawActor, drawMinionAura } from './actors.js';

const FONT_FAMILY = "'Microsoft YaHei', 'PingFang SC', sans-serif";
const CHUNK_SIZE = WORLD_CONFIG.CHUNK_SIZE;
const BACKGROUND_CACHE = new Map();
const BACKGROUND_CACHE_LIMIT = 64;

/** 取（或生成）分块背景位图 */
const getChunkBitmap = (chunk, pixelRatio) => {
  const cacheKey = `${chunk.key}@${pixelRatio}`;
  const cached = BACKGROUND_CACHE.get(cacheKey);
  if (cached) {
    return cached;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(CHUNK_SIZE * pixelRatio);
  canvas.height = Math.round(CHUNK_SIZE * pixelRatio);
  const context = canvas.getContext('2d');
  context.scale(pixelRatio, pixelRatio);
  drawChunkContent(context, chunk);
  BACKGROUND_CACHE.set(cacheKey, canvas);
  if (BACKGROUND_CACHE.size > BACKGROUND_CACHE_LIMIT) {
    const oldestKey = BACKGROUND_CACHE.keys().next().value;
    BACKGROUND_CACHE.delete(oldestKey);
  }
  return canvas;
};

/** 绘制单块地面与装饰 */
const drawChunkContent = (context, chunk) => {
  const tint = hashUnit(chunk.chunkX, chunk.chunkY, 91);
  context.fillStyle = PALETTE.ground;
  context.fillRect(0, 0, CHUNK_SIZE, CHUNK_SIZE);

  chunk.decorations.forEach((decoration) => {
    if (decoration.kind !== 'patch') {
      return;
    }
    const gradient = context.createRadialGradient(
      decoration.x,
      decoration.y,
      0,
      decoration.x,
      decoration.y,
      decoration.size,
    );
    gradient.addColorStop(0, `rgba(84, 96, 60, ${(0.2 + 0.1 * tint) * decoration.alpha})`);
    gradient.addColorStop(1, 'rgba(84, 96, 60, 0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(decoration.x, decoration.y, decoration.size, 0, Math.PI * 2);
    context.fill();
  });

  // 极淡的网格，让无限地图的移动有参照
  context.strokeStyle = PALETTE.grid;
  context.lineWidth = 1;
  context.beginPath();
  for (let offset = 0; offset <= CHUNK_SIZE; offset += 128) {
    context.moveTo(offset, 0);
    context.lineTo(offset, CHUNK_SIZE);
    context.moveTo(0, offset);
    context.lineTo(CHUNK_SIZE, offset);
  }
  context.stroke();

  chunk.decorations.forEach((decoration) => {
    drawDecoration(context, decoration);
  });
};

/** 单株装饰 */
const drawDecoration = (context, decoration) => {
  context.save();
  context.translate(decoration.x, decoration.y);
  context.rotate(decoration.rotation);
  switch (decoration.kind) {
    case 'grass': {
      context.strokeStyle = `rgba(132, 164, 104, ${0.34 * decoration.alpha})`;
      context.lineWidth = 1.4;
      context.beginPath();
      for (let index = -1; index <= 1; index++) {
        context.moveTo(index * 2.4, 0);
        context.quadraticCurveTo(index * 3.4, -decoration.size * 0.6, index * 4.4, -decoration.size);
      }
      context.stroke();
      break;
    }
    case 'rock': {
      context.fillStyle = `rgba(112, 116, 108, ${0.22 * decoration.alpha})`;
      context.beginPath();
      context.ellipse(0, 0, decoration.size, decoration.size * 0.72, 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = `rgba(168, 172, 160, ${0.12 * decoration.alpha})`;
      context.beginPath();
      context.ellipse(-decoration.size * 0.24, -decoration.size * 0.24, decoration.size * 0.44, decoration.size * 0.3, 0, 0, Math.PI * 2);
      context.fill();
      break;
    }
    case 'crack': {
      context.strokeStyle = `rgba(0, 0, 0, ${0.18 * decoration.alpha})`;
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(-decoration.size, 0);
      context.lineTo(-decoration.size * 0.2, decoration.size * 0.22);
      context.lineTo(decoration.size * 0.35, -decoration.size * 0.16);
      context.lineTo(decoration.size, decoration.size * 0.12);
      context.stroke();
      break;
    }
    case 'flower': {
      context.fillStyle = `rgba(214, 196, 140, ${0.3 * decoration.alpha})`;
      context.beginPath();
      context.arc(0, 0, 1.9, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = `rgba(214, 196, 140, ${0.14 * decoration.alpha})`;
      context.beginPath();
      context.arc(decoration.size * 0.4, decoration.size * 0.3, 1.4, 0, Math.PI * 2);
      context.fill();
      break;
    }
    default: {
      context.fillStyle = `rgba(96, 96, 88, ${0.2 * decoration.alpha})`;
      context.beginPath();
      context.arc(0, 0, decoration.size * 0.35, 0, Math.PI * 2);
      context.fill();
      break;
    }
  }
  context.restore();
};

/**
 * 渲染一帧
 * @param {CanvasRenderingContext2D} context 画布上下文
 * @param {Object} world 世界实例
 * @param {Number} viewWidth 视口宽（CSS px）
 * @param {Number} viewHeight 视口高（CSS px）
 * @param {Number} pixelRatio 设备像素比
 * @param {Object} pointer 鼠标位置 { x, y, inside }
 */
export const render = (context, world, viewWidth, viewHeight, pixelRatio, pointer) => {
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, viewWidth, viewHeight);
  context.fillStyle = '#12150f';
  context.fillRect(0, 0, viewWidth, viewHeight);

  const camera = world.camera;
  context.save();
  context.translate(viewWidth / 2 - camera.x, viewHeight / 2 - camera.y);

  drawGround(context, world, viewWidth, viewHeight, pixelRatio);
  drawZones(context, world);
  drawItems(context, world);
  drawEncounterTokens(context, world);
  drawFallenMarkers(context, world);
  drawProjectiles(context, world);
  drawEnemies(context, world);
  drawTauntBubbles(context, world);
  drawTransferBeam(context, world);
  drawPlayer(context, world);
  drawEffects(context, world);
  drawAim(context, world, pointer);
  context.restore();

  drawBossPointer(context, world, viewWidth, viewHeight);
  drawVignette(context, viewWidth, viewHeight);
  drawMinimap(context, world, viewWidth, viewHeight);
};

/** 地面分块 */
const drawGround = (context, world, viewWidth, viewHeight, pixelRatio) => {
  const camera = world.camera;
  const left = camera.x - viewWidth / 2;
  const top = camera.y - viewHeight / 2;
  const minChunkX = Math.floor(left / CHUNK_SIZE) - 1;
  const maxChunkX = Math.floor((left + viewWidth) / CHUNK_SIZE) + 1;
  const minChunkY = Math.floor(top / CHUNK_SIZE) - 1;
  const maxChunkY = Math.floor((top + viewHeight) / CHUNK_SIZE) + 1;
  for (let chunkX = minChunkX; chunkX <= maxChunkX; chunkX++) {
    for (let chunkY = minChunkY; chunkY <= maxChunkY; chunkY++) {
      const chunk = world.map.getChunk(chunkX, chunkY);
      const bitmap = getChunkBitmap(chunk, pixelRatio >= 2 ? 2 : 1);
      context.drawImage(bitmap, chunkX * CHUNK_SIZE, chunkY * CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE);
    }
  }
};

/** 角色脚下的影子（图鉴复用） */
export const drawShadow = (context, x, y, radius, alpha) => {
  context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  context.beginPath();
  context.ellipse(x, y + radius * 0.72, radius * 0.92, radius * 0.42, 0, 0, Math.PI * 2);
  context.fill();
};

/** 血条 + 等级数字（图鉴复用） */
export const drawHealthBar = (context, entity, barWidth) => {
  const width = barWidth;
  const height = 4;
  const x = entity.x - width / 2;
  const y = entity.y - entity.radius - 14;
  const ratio = entity.maxHp > 0 ? clamp(entity.hp / entity.maxHp, 0, 1) : 0;
  context.fillStyle = 'rgba(0, 0, 0, 0.55)';
  context.fillRect(x - 1, y - 1, width + 2, height + 2);
  context.fillStyle = ratio > 0.55 ? '#63d471' : ratio > 0.28 ? '#ffb347' : '#e05545';
  context.fillRect(x, y, width * ratio, height);
};

/** 等级文字（图鉴复用） */
export const drawLevelLabel = (context, entity) => {
  context.font = `bold 10px ${FONT_FAMILY}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'rgba(0, 0, 0, 0.6)';
  context.fillText(`Lv.${entity.level}`, entity.x + 0.6, entity.y - entity.radius - 22.4);
  context.fillStyle = 'rgba(244, 236, 216, 0.86)';
  context.fillText(`Lv.${entity.level}`, entity.x, entity.y - entity.radius - 23);
};

/** 强力角色名牌：等级标签上方再亮一次角色名（立绘相似时靠名字认人） */
export const drawNameLabel = (context, entity) => {
  if (!entity.showName || !entity.alive) {
    return;
  }
  const label = entity.typeName;
  const labelY = entity.y - entity.radius - 36;
  context.font = `bold 11px ${FONT_FAMILY}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'rgba(0, 0, 0, 0.66)';
  context.fillText(label, entity.x + 0.7, labelY + 0.7);
  context.fillStyle = entity.accent || '#f4ecd8';
  context.fillText(label, entity.x, labelY);
};

/** 脚下的椭圆光环（等级 / 狂暴 / 血量都改用地面环，避免套在立绘身上；图鉴复用） */
export const drawFootRing = (context, x, y, radius, color, width, startAngle = 0, endAngle = Math.PI * 2) => {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.ellipse(x, y, radius, radius * 0.46, 0, startAngle, endAngle);
  context.stroke();
};

/** 持兵标记：头顶兵器徽记 + 金色光环，谢逊（正主）不画 */
const drawRelicMark = (context, world, entity) => {
  const relics = entity.relics || [];
  if (!relics.length || entity.typeId === 'xiexun') {
    return;
  }
  const pulse = 0.45 + Math.sin(world.time * 5) * 0.22;
  const radius = entity.radius;
  context.save();
  context.strokeStyle = `rgba(255, 209, 102, ${pulse})`;
  context.lineWidth = 2;
  context.beginPath();
  context.arc(entity.x, entity.y, radius * 1.62, 0, Math.PI * 2);
  context.stroke();

  relics.forEach((relicId, index) => {
    const relic = RELICS[relicId];
    if (!relic) {
      return;
    }
    const offsetX = (index - (relics.length - 1) / 2) * 22;
    const markY = entity.y - radius - 34;
    context.fillStyle = 'rgba(10, 12, 9, 0.72)';
    context.beginPath();
    context.arc(entity.x + offsetX, markY, 9, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = relic.color;
    context.lineWidth = 1.4;
    context.stroke();
    context.fillStyle = relic.color;
    context.font = `bold 10px ${FONT_FAMILY}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(relic.icon, entity.x + offsetX, markY + 0.5);
  });
  context.restore();
};

/** 羁绊连线：谢逊与张翠山之间的暗金虚线（一方倒下则变灰） */
const drawBonds = (context, world) => {
  world.enemies.forEach((enemy) => {
    if (!enemy.alive || !enemy.bondId || enemy.id > enemy.bondId) {
      return;
    }
    const partner = world.findActor(enemy.bondId);
    if (!partner || !partner.alive) {
      return;
    }
    const linked = Boolean(enemy.bondBuff && partner.bondBuff);
    const pulse = 0.26 + Math.sin(world.time * 3.4) * 0.08;
    context.save();
    context.strokeStyle = linked ? `rgba(255, 214, 140, ${pulse + 0.24})` : `rgba(170, 170, 170, ${pulse})`;
    context.lineWidth = 2;
    context.setLineDash([12, 9]);
    context.lineDashOffset = -world.time * 26;
    context.beginPath();
    context.moveTo(enemy.x, enemy.y);
    context.lineTo(partner.x, partner.y);
    context.stroke();
    context.restore();
  });
};

/** 敌人 */
const drawEnemies = (context, world) => {
  drawBonds(context, world);
  const playerLevel = world.player.level;
  world.enemies.forEach((enemy) => {
    if (!enemy.alive) {
      return;
    }
    const radius = enemy.radius;
    drawShadow(context, enemy.x, enemy.y, radius, 0.32);

    const levelGap = enemy.level - playerLevel;
    const ringColor = levelGap >= 3 ? '#ff5c5c' : levelGap >= 1 ? '#ffa94d' : levelGap <= -3 ? '#63d471' : 'rgba(240, 236, 220, 0.5)';
    drawFootRing(context, enemy.x, enemy.y + radius * 0.32, radius * 1.12, ringColor, enemy.isBoss ? 2.8 : 1.8);

    if (enemy.enragedTimer > 0) {
      const pulse = 0.4 + Math.sin(world.time * 12) * 0.24;
      drawFootRing(context, enemy.x, enemy.y + radius * 0.32, radius * 1.42, `rgba(255, 92, 92, ${pulse})`, 3);
    }

    if (enemy.isMinion) {
      drawMinionAura(context, enemy, world.time);
    }

    if (enemy.isCompanion) {
      drawFootRing(context, enemy.x, enemy.y + radius * 0.32, radius * 1.2, 'rgba(142, 240, 213, 0.9)', 2.2);
      if (enemy.guardFatal) {
        drawFootRing(context, enemy.x, enemy.y + radius * 0.32, radius * 1.58, 'rgba(255, 209, 102, 0.6)', 1.4);
      }
    }

    if (enemy.poisonTimer > 0) {
      const poisonPulse = 0.32 + Math.sin(world.time * 8) * 0.16;
      drawFootRing(context, enemy.x, enemy.y + radius * 0.32, radius * 1.34, `rgba(166, 227, 90, ${poisonPulse})`, 1.6);
    }

    if (enemy.vulnerableTimer > 0) {
      drawFootRing(context, enemy.x, enemy.y + radius * 0.32, radius * 1.28, 'rgba(255, 209, 102, 0.55)', 1.2);
    }

    if (enemy.revenge) {
      const pulse = 0.42 + Math.sin(world.time * 5) * 0.18;
      drawFootRing(context, enemy.x, enemy.y + radius * 0.32, radius * 1.52, `rgba(224, 85, 69, ${pulse})`, 3);
      drawFootRing(context, enemy.x, enemy.y + radius * 0.32, radius * 2.05 + Math.sin(world.time * 2.4) * 4, `rgba(255, 123, 90, ${pulse * 0.55})`, 1.6);
    }

    if (enemy.isBoss) {
      context.strokeStyle = 'rgba(255, 120, 90, 0.5)';
      context.lineWidth = 1.4;
      context.beginPath();
      context.arc(
        enemy.x,
        enemy.y + radius * 0.1,
        radius * 1.9 + Math.sin(world.time * 3) * 3,
        world.time * 1.4,
        world.time * 1.4 + Math.PI * 1.4,
      );
      context.stroke();
    }

    drawActor(context, enemy, world);

    drawHealthBar(context, enemy, Math.max(28, radius * 2.2));
    drawLevelLabel(context, enemy);
    drawNameLabel(context, enemy);
    drawRelicMark(context, world, enemy);

    if (enemy.aiState === 'retreat' || enemy.aiState === 'flee') {
      context.font = `bold 13px ${FONT_FAMILY}`;
      context.textAlign = 'center';
      context.fillStyle = '#ffd166';
      context.fillText('!', enemy.x, enemy.y - enemy.radius - 5);
    }
  });
};

/** 倒地随从标记：红橙脉冲环 + 名字，走近时提示 V 施救 */
const drawFallenMarkers = (context, world) => {
  const player = world.player;
  (world.fallenCompanions || []).forEach((marker) => {
    const pulse = 0.42 + Math.sin(world.time * 5 + marker.phase) * 0.22;
    drawFootRing(context, marker.x, marker.y + 6, 26, `rgba(255, 138, 102, ${pulse})`, 3);
    drawFootRing(context, marker.x, marker.y + 6, 34, `rgba(255, 138, 102, ${pulse * 0.5})`, 1.6);
    context.font = `bold 12px ${FONT_FAMILY}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillText(marker.name, marker.x + 0.7, marker.y - 30.7);
    context.fillStyle = '#ff8a66';
    context.fillText(marker.name, marker.x, marker.y - 31);
    if (player.alive && distanceBetween(player.x, player.y, marker.x, marker.y) < 150) {
      context.font = `bold 11px ${FONT_FAMILY}`;
      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillText('V 施救', marker.x + 0.6, marker.y - 45.6);
      context.fillStyle = '#ffe0a8';
      context.fillText('V 施救', marker.x, marker.y - 46);
    }
  });
};

/** 传功连线：玩家与回血目标之间的淡蓝光束 */
const drawTransferBeam = (context, world) => {
  if (!world.transfer) {
    return;
  }
  const target = world.findActor(world.transfer.targetId);
  const player = world.player;
  if (!target || !target.alive) {
    return;
  }
  const flicker = 0.4 + Math.sin(world.time * 14) * 0.18;
  context.save();
  context.strokeStyle = `rgba(123, 227, 255, ${flicker})`;
  context.lineWidth = 2.4;
  context.setLineDash([6, 5]);
  context.beginPath();
  context.moveTo(player.x, player.y - player.radius * 0.4);
  context.lineTo(target.x, target.y - target.radius * 0.4);
  context.stroke();
  context.restore();
};

/** 圆角矩形路径（自己描，避开 roundRect 的浏览器差异） */const roundRectPath = (context, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
};

/** 敌人头顶的嘲讽气泡（练了葵花宝典 / 蛤蟆功时出现） */
const drawTauntBubbles = (context, world) => {
  world.enemies.forEach((enemy) => {
    const bubble = enemy.bubble;
    if (!bubble || !enemy.alive) {
      return;
    }
    const elapsed = bubble.duration - bubble.timer;
    const appear = clamp(elapsed / 0.18, 0, 1);
    const fade = clamp(bubble.timer / 0.3, 0, 1);
    const alpha = Math.min(appear, fade);
    if (alpha <= 0.02) {
      return;
    }
    const scale = 0.86 + 0.14 * appear;
    const lift = (1 - appear) * 6;
    const anchorY = enemy.y - enemy.radius - 34 - lift;

    context.save();
    context.globalAlpha = alpha;
    context.translate(enemy.x, anchorY);
    context.scale(scale, scale);
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const textFont = `bold 11px ${FONT_FAMILY}`;
    const emojiFont = `15px 'Segoe UI Emoji', ${FONT_FAMILY}`;
    context.font = textFont;
    const textWidth = bubble.text ? context.measureText(bubble.text).width : 0;
    const emojiWidth = bubble.emoji ? 17 : 0;
    const gap = bubble.text && bubble.emoji ? 5 : 0;
    const contentWidth = textWidth + emojiWidth + gap;
    const padX = bubble.text ? 9 : 8;
    const width = Math.max(28, contentWidth + padX * 2);
    const height = bubble.text ? 22 : 27;
    const left = -width / 2;
    const top = -height;
    // 文字 / 表情的垂直中线：框体本身占 [-height, 0]，内容必须落在框内居中
    const middleY = top + height / 2;

    roundRectPath(context, left, top, width, height, 7);
    context.fillStyle = 'rgba(16, 14, 12, 0.9)';
    context.fill();
    context.strokeStyle = bubble.tone;
    context.lineWidth = 1.2;
    context.stroke();

    // 指向敌人的小尖角
    context.beginPath();
    context.moveTo(-4.5, -0.6);
    context.lineTo(0, 5.5);
    context.lineTo(4.5, -0.6);
    context.closePath();
    context.fillStyle = 'rgba(16, 14, 12, 0.9)';
    context.fill();
    context.beginPath();
    context.moveTo(-4.5, -0.6);
    context.lineTo(0, 5.5);
    context.lineTo(4.5, -0.6);
    context.strokeStyle = bubble.tone;
    context.stroke();

    if (bubble.text) {
      const startX = -contentWidth / 2;
      if (bubble.emoji) {
        context.font = emojiFont;
        context.fillText(bubble.emoji, startX + emojiWidth / 2, middleY - 0.5);
      }
      context.font = textFont;
      context.fillStyle = '#f4ecd8';
      context.fillText(bubble.text, startX + emojiWidth + gap + textWidth / 2, middleY + 0.5);
    } else {
      context.font = emojiFont;
      context.fillText(bubble.emoji, 0, middleY - 0.5);
    }
    context.restore();
  });
};

/** 玩家 */
const drawPlayer = (context, world) => {
  const player = world.player;
  if (!player.alive) {
    return;
  }
  const radius = player.radius;
  drawShadow(context, player.x, player.y, radius, 0.4);

  // 脚下血量环
  const hpRatio = player.maxHp > 0 ? clamp(player.hp / player.maxHp, 0, 1) : 0;
  const ringY = player.y + radius * 0.32;
  drawFootRing(context, player.x, ringY, radius * 1.34, 'rgba(0, 0, 0, 0.42)', 4.4);
  drawFootRing(
    context,
    player.x,
    ringY,
    radius * 1.34,
    hpRatio > 0.5 ? '#63d471' : hpRatio > 0.25 ? '#ffb347' : '#e05545',
    3.2,
    -Math.PI / 2,
    -Math.PI / 2 + Math.PI * 2 * hpRatio,
  );

  // 冲刺无敌：闪烁
  const blink = player.invulnerableTimer > 0 && Math.floor(world.time * 24) % 2 === 0;
  context.globalAlpha = blink ? 0.45 : 1;
  drawActor(context, player, world);
  context.globalAlpha = 1;
  drawRelicMark(context, world, player);

  if (player.shield > 0) {
    context.strokeStyle = 'rgba(154, 168, 255, 0.8)';
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(player.x, player.y, radius * 1.62, radius * 1.1, 0, 0, Math.PI * 2);
    context.stroke();
  }

  if (player.levelUpFlash > 0) {
    context.strokeStyle = `rgba(255, 209, 102, ${player.levelUpFlash})`;
    context.lineWidth = 3;
    context.beginPath();
    context.arc(player.x, player.y, radius + 16 + (0.6 - player.levelUpFlash) * 40, 0, Math.PI * 2);
    context.stroke();
  }

  // 破绽：打坐 / 明显眩晕时没有还手能力，脚下泛起红圈警示（与血环拉开距离）
  const helpless = Boolean(world.channel) || player.stunTimer > AI_CONFIG.EXPOSE_STUN;
  if (helpless) {
    const pulse = 0.58 + Math.sin(world.time * 9) * 0.24;
    drawFootRing(context, player.x, ringY, radius * 2.2, `rgba(255, 78, 60, ${pulse})`, 3.2);
    drawFootRing(context, player.x, ringY, radius * 2.5, `rgba(255, 78, 60, ${pulse * 0.55})`, 1.8);
  }

  // 打坐进度条（太玄经 / 受传功）
  if (world.channel) {
    const ratio = clamp(world.channel.timer / world.channel.duration, 0, 1);
    const width = 74;
    const barY = player.y - radius - 44;
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(player.x - width / 2 - 1, barY - 1, width + 2, 6);
    context.fillStyle = world.channel.color;
    context.fillRect(player.x - width / 2, barY, width * ratio, 4);
    context.font = `bold 11px ${FONT_FAMILY}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = world.channel.color;
    context.fillText(world.channel.name, player.x, barY - 10);
  }

  // 施救读条（V 键救援倒地同伴）
  if (world.reviving) {
    const ratio = clamp(world.reviving.timer / world.reviving.duration, 0, 1);
    const width = 74;
    const barY = player.y - radius - 44;
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(player.x - width / 2 - 1, barY - 1, width + 2, 6);
    context.fillStyle = '#8ef0d5';
    context.fillRect(player.x - width / 2, barY, width * ratio, 4);
    context.font = `bold 11px ${FONT_FAMILY}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#8ef0d5';
    context.fillText('施救中…', player.x, barY - 10);
  }
};

/** 道具 */
/** 掉落的神兵：光柱 + 悬浮旋转的兵器剪影 + 名字 */
const drawRelicDrop = (context, world, item) => {
  const bob = Math.sin(world.time * 2.4 + item.bobOffset) * 4;
  const centerY = item.y + bob - 6;
  const pulse = 0.6 + Math.sin(world.time * 3.4 + item.bobOffset) * 0.24;

  const glow = context.createRadialGradient(item.x, centerY, 2, item.x, centerY, 62);
  glow.addColorStop(0, `${item.color}88`);
  glow.addColorStop(0.45, `${item.color}33`);
  glow.addColorStop(1, `${item.color}00`);
  context.fillStyle = glow;
  context.beginPath();
  context.arc(item.x, centerY, 62, 0, Math.PI * 2);
  context.fill();

  // 光柱
  context.save();
  context.globalAlpha = 0.32 + pulse * 0.2;
  context.fillStyle = item.color;
  context.beginPath();
  context.moveTo(item.x - 12, centerY + 16);
  context.lineTo(item.x - 4, centerY - 58);
  context.lineTo(item.x + 4, centerY - 58);
  context.lineTo(item.x + 12, centerY + 16);
  context.closePath();
  context.fill();
  context.restore();

  context.save();
  context.translate(item.x, centerY);
  context.rotate(world.time * 0.9);
  context.strokeStyle = item.glow || item.color;
  context.lineWidth = 2.4;
  context.beginPath();
  context.moveTo(0, -16);
  context.lineTo(0, 14);
  context.moveTo(-7, -6);
  context.lineTo(7, -6);
  context.stroke();
  context.fillStyle = item.color;
  context.beginPath();
  if (item.itemId === 'dragonSaber') {
    // 刀：单侧宽刃
    context.moveTo(-3, 14);
    context.lineTo(-3, -8);
    context.quadraticCurveTo(-2, -18, 5, -19);
    context.lineTo(-1, -8);
    context.closePath();
  } else {
    // 剑：双侧直刃
    context.moveTo(0, 16);
    context.lineTo(-4, -6);
    context.lineTo(0, -19);
    context.lineTo(4, -6);
    context.closePath();
  }
  context.fill();
  context.restore();

  context.font = `bold 11px ${FONT_FAMILY}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'rgba(0, 0, 0, 0.6)';
  context.fillText(item.name, item.x + 0.6, centerY - 32.6);
  context.fillStyle = item.glow || item.color;
  context.fillText(item.name, item.x, centerY - 33);
};

const drawItems = (context, world) => {
  world.items.forEach((item) => {
    if (!item.alive) {
      return;
    }
    if (item.isRelic) {
      drawRelicDrop(context, world, item);
      return;
    }
    const pulse = 1 + Math.sin(item.phase) * 0.12;
    const glowRadius = item.radius * 3 * pulse;
    const gradient = context.createRadialGradient(item.x, item.y, 0, item.x, item.y, glowRadius);
    gradient.addColorStop(0, `${item.color}66`);
    gradient.addColorStop(1, `${item.color}00`);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(item.x, item.y, glowRadius, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.translate(item.x, item.y);
    context.rotate(item.phase * 0.6);
    context.fillStyle = item.color;
    context.beginPath();
    context.moveTo(0, -item.radius);
    context.lineTo(item.radius, 0);
    context.lineTo(0, item.radius);
    context.lineTo(-item.radius, 0);
    context.closePath();
    context.fill();
    context.restore();

    // 快过期时闪红提示
    if (item.life < 12 && Math.floor(item.life * 6) % 2 === 0) {
      context.strokeStyle = 'rgba(224, 85, 69, 0.8)';
      context.lineWidth = 1.4;
      context.beginPath();
      context.arc(item.x, item.y, item.radius + 6, 0, Math.PI * 2);
      context.stroke();
    }
  });
};

/** 奇遇标记：地面光环 + 光柱 + 悬浮签（走进去即触发） */
const drawEncounterTokens = (context, world) => {
  const tokens = world.encounterTokens || [];
  tokens.forEach((token) => {
    if (!token.alive) {
      return;
    }
    const bob = Math.sin(world.time * 1.8 + token.phase) * 5;
    const pulse = 0.5 + Math.sin(world.time * 3.2 + token.phase) * 0.22;

    // 地面光环
    context.save();
    context.globalAlpha = 0.3 + pulse * 0.4;
    context.strokeStyle = token.color;
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(token.x, token.y + 8, 32 + pulse * 8, 14 + pulse * 3.5, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();

    // 光柱
    const gradient = context.createLinearGradient(token.x, token.y - 96, token.x, token.y + 10);
    gradient.addColorStop(0, `${token.color}00`);
    gradient.addColorStop(1, `${token.color}bb`);
    context.fillStyle = gradient;
    context.beginPath();
    context.moveTo(token.x - 11, token.y + 10);
    context.lineTo(token.x - 3, token.y - 92);
    context.lineTo(token.x + 3, token.y - 92);
    context.lineTo(token.x + 11, token.y + 10);
    context.closePath();
    context.fill();

    // 悬浮签
    const tagY = token.y - 104 + bob;
    const label = `${token.categoryName} · ${token.name}`;
    context.save();
    context.font = `bold 11px ${FONT_FAMILY}`;
    const width = context.measureText(label).width + 36;
    context.fillStyle = 'rgba(10, 12, 9, 0.82)';
    context.fillRect(token.x - width / 2, tagY - 12, width, 24);
    context.strokeStyle = token.color;
    context.globalAlpha = 0.55 + pulse * 0.35;
    context.lineWidth = 1;
    context.strokeRect(token.x - width / 2, tagY - 12, width, 24);
    context.globalAlpha = 1;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillStyle = token.color;
    context.fillText(token.icon, token.x - width / 2 + 13, tagY + 0.5);
    context.textAlign = 'left';
    context.fillStyle = 'rgba(244, 236, 216, 0.92)';
    context.fillText(label, token.x - width / 2 + 26, tagY + 0.5);
    context.restore();

    // 快过期时闪红
    if (token.life < 20 && Math.floor(token.life * 5) % 2 === 0) {
      context.strokeStyle = 'rgba(224, 85, 69, 0.8)';
      context.lineWidth = 1.4;
      context.beginPath();
      context.arc(token.x, token.y, 26, 0, Math.PI * 2);
      context.stroke();
    }
  });
};

/** 地面持续伤害区（火莲 / 毒瘴） */
const drawZones = (context, world) => {  world.zones.zones.forEach((zone) => {
    const fade = clamp(zone.life / 0.8, 0, 1);
    const pulse = 0.88 + Math.sin(world.time * 6 + zone.seed) * 0.07;
    const radius = zone.radius * pulse;
    const isFlame = zone.style === 'flame';

    context.save();
    context.globalAlpha = 0.2 * fade;
    context.fillStyle = zone.color;
    context.beginPath();
    context.arc(zone.x, zone.y, radius, 0, Math.PI * 2);
    context.fill();

    context.globalAlpha = 0.45 * fade;
    context.strokeStyle = zone.color;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(zone.x, zone.y, radius, 0, Math.PI * 2);
    context.stroke();

    // 边缘火舌 / 毒泡：绕圈游走，让区域有"在烧"的感觉
    const count = isFlame ? 11 : 9;
    for (let index = 0; index < count; index++) {
      const spin = world.time * (isFlame ? 0.7 : -0.4);
      const angle = (Math.PI * 2 * index) / count + spin + zone.seed;
      const offset = radius * (0.72 + Math.sin(world.time * 4.4 + index + zone.seed) * 0.18);
      context.globalAlpha = (isFlame ? 0.44 : 0.34) * fade;
      context.beginPath();
      context.arc(zone.x + Math.cos(angle) * offset, zone.y + Math.sin(angle) * offset, isFlame ? 3.4 : 4.6, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  });
};

/** 投射物 */
const drawProjectiles = (context, world) => {
  world.projectiles.forEach((projectile) => {
    if (!projectile.alive) {
      return;
    }
    const alpha = clamp(projectile.life / projectile.maxLife, 0, 1);
    context.save();
    context.translate(projectile.x, projectile.y);
    context.rotate(projectile.angle);
    if (projectile.style === 'wave') {
      context.strokeStyle = projectile.color;
      context.globalAlpha = 0.9 * alpha;
      context.lineWidth = 5;
      context.beginPath();
      context.arc(0, 0, projectile.radius, -Math.PI * 0.55, Math.PI * 0.55);
      context.stroke();
      context.globalAlpha = 0.32 * alpha;
      context.strokeStyle = '#ffffff';
      context.lineWidth = 2;
      context.beginPath();
      context.arc(0, 0, projectile.radius * 0.6, -Math.PI * 0.55, Math.PI * 0.55);
      context.stroke();
    } else if (projectile.style === 'needle') {
      context.strokeStyle = projectile.color;
      context.globalAlpha = alpha;
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(-10, 0);
      context.lineTo(8, 0);
      context.stroke();
    } else if (projectile.style === 'ice') {
      context.globalAlpha = alpha;
      context.fillStyle = projectile.color;
      context.beginPath();
      context.moveTo(10, 0);
      context.lineTo(0, 4.6);
      context.lineTo(-9, 0);
      context.lineTo(0, -4.6);
      context.closePath();
      context.fill();
      context.globalAlpha = alpha * 0.55;
      context.strokeStyle = '#ffffff';
      context.lineWidth = 1.4;
      context.stroke();
    } else if (projectile.style === 'blade') {
      context.rotate(world.time * 14 + projectile.id);
      context.globalAlpha = alpha;
      context.fillStyle = projectile.color;
      context.beginPath();
      for (let point = 0; point < 4; point++) {
        const angle = (Math.PI / 2) * point;
        context.lineTo(Math.cos(angle) * 10, Math.sin(angle) * 10);
        context.lineTo(Math.cos(angle + Math.PI / 4) * 3.2, Math.sin(angle + Math.PI / 4) * 3.2);
      }
      context.closePath();
      context.fill();
    } else if (projectile.style === 'sword') {
      // 飞剑：剑身 + 剑格 + 剑气尾迹
      context.globalAlpha = alpha * 0.4;
      context.strokeStyle = projectile.color;
      context.lineWidth = 7;
      context.beginPath();
      context.moveTo(-18, 0);
      context.lineTo(-4, 0);
      context.stroke();
      context.globalAlpha = alpha;
      context.fillStyle = projectile.color;
      context.beginPath();
      context.moveTo(16, 0);
      context.lineTo(2, 4.2);
      context.lineTo(-10, 0);
      context.lineTo(2, -4.2);
      context.closePath();
      context.fill();
      context.strokeStyle = '#ffffff';
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(4, 6);
      context.lineTo(4, -6);
      context.stroke();
    } else {
      const gradient = context.createRadialGradient(0, 0, 0, 0, 0, projectile.radius * 2.4);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.35, projectile.color);
      gradient.addColorStop(1, `${projectile.color}00`);
      context.globalAlpha = alpha;
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(0, 0, projectile.radius * 2.4, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  });
};

/** 特效 */
const drawEffects = (context, world) => {
  world.effects.effects.forEach((effect) => {
    const progress = 1 - effect.life / effect.maxLife;
    const alpha = clamp(effect.life / effect.maxLife, 0, 1);
    switch (effect.kind) {
      case 'text': {
        context.save();
        context.globalAlpha = alpha;
        context.font = `${effect.isCrit ? 'bold 20px' : `bold ${effect.size}px`} ${FONT_FAMILY}`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.lineWidth = 3;
        context.strokeStyle = 'rgba(0, 0, 0, 0.65)';
        context.strokeText(effect.text, effect.x, effect.y);
        context.fillStyle = effect.color;
        context.fillText(effect.text, effect.x, effect.y);
        context.restore();
        break;
      }
      case 'particle': {
        context.globalAlpha = alpha;
        context.fillStyle = effect.color;
        context.beginPath();
        context.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
        break;
      }
      case 'swing': {
        context.save();
        context.translate(effect.x, effect.y);
        context.rotate(effect.angle);
        context.globalAlpha = alpha * 0.85;
        context.strokeStyle = effect.color;
        context.lineWidth = 5 * alpha + 1;
        context.beginPath();
        context.arc(0, 0, effect.radius, -effect.arc / 2, effect.arc / 2);
        context.stroke();
        context.globalAlpha = alpha * 0.28;
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.beginPath();
        context.arc(0, 0, effect.radius * 0.72, -effect.arc / 2, effect.arc / 2);
        context.stroke();
        context.restore();
        break;
      }
      case 'ring': {
        const radius = effect.radius * (0.35 + progress * 0.75);
        context.globalAlpha = alpha;
        context.strokeStyle = effect.color;
        context.lineWidth = effect.lineWidth * (1 - progress) + 0.6;
        context.beginPath();
        context.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        context.stroke();
        context.globalAlpha = 1;
        break;
      }
      case 'bolt': {
        context.globalAlpha = alpha;
        context.strokeStyle = effect.color;
        context.lineWidth = 3.4;
        context.beginPath();
        const segments = 7;
        for (let index = 0; index <= segments; index++) {
          const ratio = index / segments;
          const jitter = (hashUnit(effect.seed + index, index, 7) - 0.5) * 26 * (1 - ratio);
          const pointY = effect.y - 320 * (1 - ratio);
          if (index === 0) {
            context.moveTo(effect.x + jitter, pointY);
          } else {
            context.lineTo(effect.x + jitter, pointY);
          }
        }
        context.stroke();
        context.globalAlpha = alpha * 0.5;
        context.fillStyle = effect.color;
        context.beginPath();
        context.arc(effect.x, effect.y, effect.radius * (0.5 + progress * 0.6), 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
        break;
      }
      case 'arc': {
        const deltaX = effect.x2 - effect.x;
        const deltaY = effect.y2 - effect.y;
        const length = Math.hypot(deltaX, deltaY) || 1;
        const normalX = -deltaY / length;
        const normalY = deltaX / length;
        const steps = 6;
        context.globalAlpha = alpha;
        context.strokeStyle = effect.color;
        context.lineWidth = effect.lineWidth;
        context.beginPath();
        context.moveTo(effect.x, effect.y);
        for (let index = 1; index < steps; index++) {
          const ratio = index / steps;
          const jitter = (hashUnit(effect.seed + index, index, 11) - 0.5) * 24;
          context.lineTo(effect.x + deltaX * ratio + normalX * jitter, effect.y + deltaY * ratio + normalY * jitter);
        }
        context.lineTo(effect.x2, effect.y2);
        context.stroke();
        context.globalAlpha = alpha * 0.75;
        context.strokeStyle = '#ffffff';
        context.lineWidth = Math.max(1, effect.lineWidth * 0.4);
        context.stroke();
        context.globalAlpha = 1;
        break;
      }
      case 'levelUp': {
        context.globalAlpha = alpha;
        context.strokeStyle = '#ffd166';
        context.lineWidth = 3;
        context.beginPath();
        context.arc(effect.x, effect.y, effect.radius * (0.6 + progress * 1.6), 0, Math.PI * 2);
        context.stroke();
        context.globalAlpha = 1;
        break;
      }
      default: {
        context.globalAlpha = alpha * 0.5;
        context.fillStyle = effect.color;
        context.beginPath();
        context.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
        break;
      }
    }
  });
};

/** 准星 */
const drawAim = (context, world, pointer) => {
  if (!pointer || !pointer.inside || world.status !== 'playing') {
    return;
  }
  const player = world.player;
  const aimX = world.camera.x + pointer.x - world.viewWidth / 2;
  const aimY = world.camera.y + pointer.y - world.viewHeight / 2;
  context.save();
  context.strokeStyle = 'rgba(142, 240, 213, 0.28)';
  context.lineWidth = 1;
  context.setLineDash([4, 6]);
  context.beginPath();
  context.moveTo(player.x, player.y);
  context.lineTo(aimX, aimY);
  context.stroke();
  context.setLineDash([]);
  context.strokeStyle = 'rgba(142, 240, 213, 0.7)';
  context.beginPath();
  context.arc(aimX, aimY, 7, 0, Math.PI * 2);
  context.moveTo(aimX - 12, aimY);
  context.lineTo(aimX - 3, aimY);
  context.moveTo(aimX + 3, aimY);
  context.lineTo(aimX + 12, aimY);
  context.stroke();
  context.restore();
};

/** 屏幕暗角 */
const drawVignette = (context, viewWidth, viewHeight) => {
  const gradient = context.createRadialGradient(
    viewWidth / 2,
    viewHeight / 2,
    Math.min(viewWidth, viewHeight) * 0.35,
    viewWidth / 2,
    viewHeight / 2,
    Math.max(viewWidth, viewHeight) * 0.72,
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, viewWidth, viewHeight);
};

/** 首领在屏幕外时的方向指示 */
const drawBossPointer = (context, world, viewWidth, viewHeight) => {
  const boss = world.findNearestBoss();
  if (!boss) {
    return;
  }
  const screenX = boss.x - world.camera.x + viewWidth / 2;
  const screenY = boss.y - world.camera.y + viewHeight / 2;
  const margin = 42;
  if (screenX > margin && screenX < viewWidth - margin && screenY > margin && screenY < viewHeight - margin) {
    return;
  }
  const centerX = viewWidth / 2;
  const centerY = viewHeight / 2;
  const angle = Math.atan2(screenY - centerY, screenX - centerX);
  const radiusX = viewWidth / 2 - margin;
  // 底部预留技能栏高度，避免箭头被技能栏挡住
  const radiusY = viewHeight / 2 - margin - 34;
  const scale = Math.min(Math.abs(radiusX / Math.cos(angle)), Math.abs(radiusY / Math.sin(angle)));
  const arrowX = centerX + Math.cos(angle) * scale;
  const arrowY = centerY + Math.sin(angle) * scale;
  context.save();
  context.translate(arrowX, arrowY);
  context.rotate(angle);
  context.fillStyle = 'rgba(255, 92, 92, 0.9)';
  context.beginPath();
  context.moveTo(11, 0);
  context.lineTo(-7, 7);
  context.lineTo(-7, -7);
  context.closePath();
  context.fill();
  context.restore();
  context.font = `bold 11px ${FONT_FAMILY}`;
  context.textAlign = 'center';
  context.fillStyle = 'rgba(255, 140, 120, 0.9)';
  context.fillText(`${boss.typeName} Lv.${boss.level}`, arrowX, arrowY + (Math.sin(angle) > 0 ? 22 : -16));
};

/** 小地图 */
const drawMinimap = (context, world, viewWidth, viewHeight) => {
  const size = 148;
  const margin = 16;
  const originX = viewWidth - size - margin;
  const originY = viewHeight - size - margin;
  const range = 1600;
  const scale = size / (range * 2);
  context.save();
  context.beginPath();
  context.rect(originX, originY, size, size);
  context.fillStyle = 'rgba(10, 12, 9, 0.78)';
  context.fill();
  context.strokeStyle = 'rgba(198, 168, 108, 0.45)';
  context.lineWidth = 1;
  context.stroke();
  context.clip();

  const centerX = originX + size / 2;
  const centerY = originY + size / 2;
  context.strokeStyle = 'rgba(198, 168, 108, 0.14)';
  context.beginPath();
  context.moveTo(centerX, originY);
  context.lineTo(centerX, originY + size);
  context.moveTo(originX, centerY);
  context.lineTo(originX + size, centerY);
  context.stroke();

  world.items.forEach((item) => {
    const x = centerX + (item.x - world.player.x) * scale;
    const y = centerY + (item.y - world.player.y) * scale;
    if (x < originX || x > originX + size || y < originY || y > originY + size) {
      return;
    }
    if (item.isRelic) {
      context.fillStyle = item.color;
      context.beginPath();
      context.arc(x, y, 3.4 + Math.sin(world.time * 5) * 0.8, 0, Math.PI * 2);
      context.fill();
      return;
    }
    context.fillStyle = 'rgba(123, 227, 255, 0.85)';
    context.fillRect(x - 1.5, y - 1.5, 3, 3);
  });

  const encounterTokens = world.encounterTokens || [];
  encounterTokens.forEach((token) => {
    const x = centerX + (token.x - world.player.x) * scale;
    const y = centerY + (token.y - world.player.y) * scale;
    if (x < originX || x > originX + size || y < originY || y > originY + size) {
      return;
    }
    const radius = 3 + Math.sin(world.time * 4 + token.phase) * 0.8;
    context.fillStyle = token.color;
    context.beginPath();
    context.moveTo(x, y - radius);
    context.lineTo(x + radius, y);
    context.lineTo(x, y + radius);
    context.lineTo(x - radius, y);
    context.closePath();
    context.fill();
  });

  world.enemies.forEach((enemy) => {
    const x = centerX + (enemy.x - world.player.x) * scale;
    const y = centerY + (enemy.y - world.player.y) * scale;
    if (x < originX || x > originX + size || y < originY || y > originY + size) {
      return;
    }
    if (enemy.isCompanion) {
      context.fillStyle = '#8ef0d5';
      context.beginPath();
      context.arc(x, y, 2.6, 0, Math.PI * 2);
      context.fill();
      return;
    }
    const levelGap = enemy.level - world.player.level;
    context.fillStyle = levelGap >= 1 ? '#ff6b5a' : levelGap <= -2 ? '#63d471' : '#ffb347';
    context.beginPath();
    context.arc(x, y, enemy.isBoss ? 3.6 : 2.2, 0, Math.PI * 2);
    context.fill();
  });

  const playerX = centerX;
  const playerY = centerY;
  context.fillStyle = '#f4ecd8';
  context.beginPath();
  context.arc(playerX, playerY, 3, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = 'rgba(142, 240, 213, 0.8)';
  context.lineWidth = 1;
  context.beginPath();
  context.arc(playerX, playerY, 7, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  context.font = `10px ${FONT_FAMILY}`;
  context.textAlign = 'left';
  context.fillStyle = 'rgba(198, 168, 108, 0.6)';
  context.fillText('战场', originX + 6, originY + 12);
};
