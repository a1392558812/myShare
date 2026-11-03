/**
 * 角色立绘：程序化骨架绘制 + 行走 / 挥击 / 施法动画
 * 本地坐标系原点在角色中心，-y 为正面（绘制前按朝向旋转）
 * 所有尺寸以 entity.radius 为基准，五种敌人各有独立骨架、装备与配件
 */

import { PALETTE } from '../constants.js';

const TAU = Math.PI * 2;
const FACING_CACHE = new WeakMap();

const clamp01 = (value) => (value <= 0 ? 0 : value >= 1 ? 1 : value);
const mix = (from, to, t) => from + (to - from) * t;
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

/** 十六进制提亮/压暗（amount 为 -1~1） */
const shade = (hex, amount) => {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((char) => char + char).join('') : raw;
  const value = parseInt(full, 16);
  const channel = (delta) => {
    const part = delta * (1 + amount);
    return Math.max(0, Math.min(255, Math.round(part)));
  };
  const red = channel((value >> 16) & 255);
  const green = channel((value >> 8) & 255);
  const blue = channel(value & 255);
  return `#${((1 << 24) | (red << 16) | (green << 8) | blue).toString(16).slice(1)}`;
};

/** 角度插值（走最短路，避免转身时绕一整圈） */
const lerpAngle = (from, to, t) => {
  const diff = ((((to - from + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  return from + diff * t;
};

/** 朝向平滑：鼠标/目标突变时角色是转过去而不是瞬移 */
const smoothFacing = (entity, target, time) => {
  const cached = FACING_CACHE.get(entity);
  if (!cached) {
    FACING_CACHE.set(entity, { angle: target, time });
    return target;
  }
  const delta = Math.min(0.1, Math.max(0, time - cached.time));
  cached.time = time;
  cached.angle = lerpAngle(cached.angle, target, 1 - Math.exp(-24 * delta));
  return cached.angle;
};

/** 攻击主手角度曲线：贴身(2.0) → 后拉 → 横扫过正面(-0.5) → 收刀回位，单位为弧度 */
const attackArmAngle = (progress) => {
  const t = clamp01(progress);
  if (t < 0.25) {
    return 2.0 + 0.35 * (t / 0.25);
  }
  if (t < 0.62) {
    return 2.35 - 2.85 * easeOutCubic((t - 0.25) / 0.37);
  }
  return -0.5 + 2.5 * easeOutCubic((t - 0.62) / 0.38);
};

/** 读取动画快照（全部来自 core 写入的字段） */
const readAnim = (entity, time) => {
  const attackDuration = entity.attackAnimDuration || 0;
  const castDuration = entity.castAnimDuration || 0;
  return {
    move: clamp01(entity.moveAmount || 0),
    phase: entity.walkPhase || 0,
    attack: entity.attackAnimTimer > 0 && attackDuration > 0 ? clamp01(1 - entity.attackAnimTimer / attackDuration) : -1,
    cast: entity.castAnimTimer > 0 && castDuration > 0 ? clamp01(1 - entity.castAnimTimer / castDuration) : -1,
    breath: Math.sin(time * 2.2 + (entity.animSeed || 0)),
    time,
  };
};

/* ------------------------------------------------------------------ */
/* 配色与骨架定义                                                       */
/* ------------------------------------------------------------------ */

const FIGURE_LIBRARY = {
  player: {
    form: 'humanoid',
    build: { shoulder: 0.86, waist: 0.5, hip: 0.66, head: 0.4, headY: -0.84 },
    colors: {
      main: PALETTE.playerRobe,
      skin: '#f3e4c6',
      hair: '#1c1611',
      trim: PALETTE.playerEdge,
      metal: '#eef6f2',
      handle: '#2a2018',
    },
    headgear: 'topknot',
    weapon: 'saber',
    cloak: 0.55,
  },
  wolf: {
    form: 'beast',
    build: { body: 0.52, bodyLength: 0.74, head: 0.4, headY: -0.98, legX: 0.34, legFront: -0.42, legBack: 0.42 },
    colors: {
      main: '#b07b4a',
      skin: '#f0c08a',
      hair: '#7d5432',
      trim: '#f7dcb4',
      metal: '#f4ecd8',
      handle: '#3a2a1c',
    },
    headgear: 'ears',
    weapon: 'claw',
    tail: true,
  },
  mage: {
    form: 'humanoid',
    build: { shoulder: 0.78, waist: 0.52, hip: 0.8, head: 0.38, headY: -0.84 },
    colors: {
      main: '#5c7cfa',
      skin: '#e8dcc4',
      hair: '#20233c',
      trim: '#a9bcff',
      metal: '#c9d6ff',
      handle: '#332a1f',
    },
    headgear: 'hat',
    weapon: 'staff',
    cloak: 0.9,
  },
  ogre: {
    form: 'humanoid',
    build: { shoulder: 1.06, waist: 0.82, hip: 0.86, head: 0.44, headY: -0.78 },
    colors: {
      main: '#4f9d69',
      skin: '#77bb8d',
      hair: '#28543a',
      trim: '#9fe0b5',
      metal: '#d8c9a8',
      handle: '#4a3520',
    },
    headgear: 'horns',
    weapon: 'club',
    cloak: 0.35,
  },
  assassin: {
    form: 'humanoid',
    build: { shoulder: 0.68, waist: 0.42, hip: 0.54, head: 0.37, headY: -0.86 },
    colors: {
      main: '#b04ad0',
      skin: '#d9c8e6',
      hair: '#2c1136',
      trim: '#e6aaff',
      metal: '#f0e2ff',
      handle: '#241028',
    },
    headgear: 'hood',
    weapon: 'daggers',
    cloak: 1.1,
    nimble: true,
  },
  bandit: {
    form: 'humanoid',
    build: { shoulder: 0.9, waist: 0.54, hip: 0.72, head: 0.39, headY: -0.84 },
    colors: {
      main: '#8f4f2a',
      skin: '#e0b98e',
      hair: '#2b1b12',
      trim: '#ffb27a',
      metal: '#d9cbb0',
      handle: '#4a2b16',
    },
    headgear: 'bandana',
    weapon: 'saber',
    cloak: 0.62,
  },
  ninja: {
    form: 'humanoid',
    build: { shoulder: 0.72, waist: 0.44, hip: 0.58, head: 0.37, headY: -0.86 },
    colors: {
      main: '#2f3a63',
      skin: '#e3d0b8',
      hair: '#151a2b',
      trim: '#8fa4ff',
      metal: '#dfe6ff',
      handle: '#1a1f30',
    },
    headgear: 'mask',
    weapon: 'kunai',
    cloak: 0.9,
    nimble: true,
  },
  monk: {
    form: 'humanoid',
    build: { shoulder: 0.94, waist: 0.62, hip: 0.8, head: 0.4, headY: -0.84 },
    colors: {
      main: '#b98b3e',
      skin: '#e6c9a0',
      hair: '#c9a86a',
      trim: '#ffe3a3',
      metal: '#d8c9a8',
      handle: '#6b4a24',
    },
    headgear: 'bald',
    weapon: 'cudgel',
    cloak: 0.5,
  },
  archer: {
    form: 'humanoid',
    build: { shoulder: 0.8, waist: 0.48, hip: 0.64, head: 0.38, headY: -0.85 },
    colors: {
      main: '#6f8f3e',
      skin: '#e8d4b0',
      hair: '#241d14',
      trim: '#d8f09a',
      metal: '#e4d6b4',
      handle: '#3d2d1c',
    },
    headgear: 'strawhat',
    weapon: 'bow',
    cloak: 0.7,
    nimble: true,
  },
  wulinMaster: {
    form: 'humanoid',
    build: { shoulder: 0.92, waist: 0.56, hip: 0.7, head: 0.4, headY: -0.85 },
    colors: {
      main: '#3f6f8f',
      skin: '#e8dcc4',
      hair: '#1e2430',
      trim: '#bfe6ff',
      metal: '#eaf6ff',
      handle: '#2c2418',
    },
    headgear: 'topknot',
    weapon: 'saber',
    cloak: 0.85,
    nimble: true,
  },
  imperialGuard: {
    form: 'humanoid',
    build: { shoulder: 0.98, waist: 0.7, hip: 0.82, head: 0.4, headY: -0.83 },
    colors: {
      main: '#394a6e',
      skin: '#e6d3b4',
      hair: '#171b26',
      trim: '#ffd166',
      metal: '#ffd166',
      handle: '#3a2a1c',
    },
    headgear: 'helmet',
    weapon: 'glaive',
    cloak: 0.7,
    plated: true,
  },
  xiexun: {
    form: 'humanoid',
    build: { shoulder: 1.08, waist: 0.78, hip: 0.94, head: 0.42, headY: -0.82 },
    colors: {
      main: '#d9b26a',
      skin: '#e8cfa8',
      hair: '#f0d79a',
      trim: '#fff2c0',
      metal: '#fff6dc',
      handle: '#3a2a1c',
    },
    headgear: 'mane',
    weapon: 'falchion',
    cloak: 1.2,
    blind: true,
  },
  zhangcuishan: {
    form: 'humanoid',
    build: { shoulder: 0.78, waist: 0.46, hip: 0.6, head: 0.38, headY: -0.85 },
    colors: {
      main: '#5f9ea0',
      skin: '#f0e2c8',
      hair: '#1d1a16',
      trim: '#d6f5ff',
      metal: '#f2fbff',
      handle: '#2b3b3c',
    },
    headgear: 'scholar',
    weapon: 'sword',
    cloak: 0.72,
    nimble: true,
  },
  juniorSister: {
    form: 'humanoid',
    build: { shoulder: 0.74, waist: 0.44, hip: 0.58, head: 0.4, headY: -0.85 },
    colors: {
      main: '#e79ac0',
      skin: '#f6e4cf',
      hair: '#241a18',
      trim: '#ffd3ea',
      metal: '#fff0f7',
      handle: '#3a2a30',
    },
    headgear: 'topknot',
    weapon: 'sword',
    cloak: 0.5,
    nimble: true,
  },
  woundedAlly: {
    form: 'humanoid',
    build: { shoulder: 0.88, waist: 0.56, hip: 0.7, head: 0.39, headY: -0.84 },
    colors: {
      main: '#8a8f7a',
      skin: '#dcc9a8',
      hair: '#2a241c',
      trim: '#d8e0c0',
      metal: '#e6e8d4',
      handle: '#3a3226',
    },
    headgear: 'bandana',
    weapon: 'saber',
    cloak: 0.4,
  },
  brat: {
    form: 'humanoid',
    build: { shoulder: 0.56, waist: 0.38, hip: 0.46, head: 0.5, headY: -0.94 },
    colors: {
      main: '#c98a5a',
      skin: '#f4d8b4',
      hair: '#2a1c14',
      trim: '#ffd8a8',
      metal: '#f0e2c0',
      handle: '#3a2a1c',
    },
    headgear: 'bandana',
    weapon: 'kunai',
    cloak: 0.2,
    nimble: true,
  },
  bratDad: {
    form: 'humanoid',
    build: { shoulder: 0.98, waist: 0.64, hip: 0.82, head: 0.41, headY: -0.83 },
    colors: {
      main: '#7a4b2a',
      skin: '#e0b98e',
      hair: '#241609',
      trim: '#ffb27a',
      metal: '#e0d2b4',
      handle: '#3d2412',
    },
    headgear: 'topknot',
    weapon: 'saber',
    cloak: 0.95,
    plated: true,
  },
  beggarElder: {
    form: 'humanoid',
    build: { shoulder: 0.84, waist: 0.5, hip: 0.66, head: 0.4, headY: -0.84 },
    colors: {
      main: '#6b6a4a',
      skin: '#dcbe93',
      hair: '#3a3020',
      trim: '#e0d8a8',
      metal: '#d6cbaa',
      handle: '#4a3a20',
    },
    headgear: 'strawhat',
    weapon: 'cudgel',
    cloak: 0.45,
  },
  hongqigong: {
    form: 'humanoid',
    build: { shoulder: 0.94, waist: 0.66, hip: 0.78, head: 0.42, headY: -0.83 },
    colors: {
      main: '#9a7b4a',
      skin: '#e6c49a',
      hair: '#cfbfa0',
      trim: '#ffe0a8',
      metal: '#e8d6b0',
      handle: '#4a3418',
    },
    headgear: 'bald',
    weapon: 'cudgel',
    cloak: 0.7,
  },
  boss: {
    form: 'humanoid',
    build: { shoulder: 1.02, waist: 0.78, hip: 1.0, head: 0.42, headY: -0.82 },
    colors: {
      main: '#c0392b',
      skin: '#e8cfa8',
      hair: '#2a1512',
      trim: '#ffb199',
      metal: '#ffd166',
      handle: '#3a1f16',
    },
    headgear: 'crown',
    weapon: 'glaive',
    cloak: 1.35,
    plated: true,
  },
};

/** 受击闪白时的统一色板 */
const WHITE_PALETTE = {
  main: '#fbf7ee',
  skin: '#fffaf0',
  hair: '#efe9dd',
  trim: '#ffffff',
  metal: '#ffffff',
  handle: '#efe9dd',
};

/** 组装某个实体的绘制规格 */
const resolveFigure = (entity) => {
  if (entity.kind === 'player') {
    return FIGURE_LIBRARY.player;
  }
  const base = FIGURE_LIBRARY[entity.typeId] || FIGURE_LIBRARY.wolf;
  const theme = entity.color || base.colors.main;
  const accent = entity.accent || base.colors.trim;
  return {
    ...base,
    colors: {
      ...base.colors,
      main: theme,
      trim: accent,
      metal: base.form === 'beast' ? '#f4ecd8' : shade(accent, 0.18),
    },
  };
};

/** 当前帧实际使用的颜色（受击闪白） */
const paletteOf = (figure, entity) => {
  if (entity.hitFlash > 0) {
    return WHITE_PALETTE;
  }
  return {
    ...figure.colors,
    dark: shade(figure.colors.main, -0.42),
    deep: shade(figure.colors.main, -0.62),
    light: shade(figure.colors.main, 0.28),
  };
};

/* ------------------------------------------------------------------ */
/* 人形骨架                                                             */
/* ------------------------------------------------------------------ */

/** 双腿：交替前后摆，抬脚时缩短 */
const drawLegs = (context, r, figure, anim, colors) => {
  const stride = anim.move * r * 0.34;
  const hipY = r * 0.3;
  const length = r * 0.66;
  const legs = [
    { dir: -1, offset: Math.PI, color: colors.dark },
    { dir: 1, offset: 0, color: colors.deep },
  ];
  context.lineCap = 'round';
  legs.forEach((leg) => {
    const swing = Math.sin(anim.phase + leg.offset) * stride;
    const lift = Math.max(0, Math.sin(anim.phase + leg.offset)) * anim.move * r * 0.16;
    const footX = leg.dir * r * 0.22 + swing;
    const footY = hipY + length - lift;
    context.strokeStyle = leg.color;
    context.lineWidth = r * 0.3;
    context.beginPath();
    context.moveTo(leg.dir * r * 0.18, hipY - r * 0.04);
    context.quadraticCurveTo(leg.dir * r * 0.22 + swing * 0.4, hipY + length * 0.48, footX, footY);
    context.stroke();
    context.fillStyle = colors.deep;
    context.beginPath();
    context.ellipse(footX, footY, r * 0.17, r * 0.11, 0, 0, TAU);
    context.fill();
  });
};

/** 披风/后摆：随移动惯性飘动 */
const drawCloak = (context, r, figure, anim, colors) => {
  const weight = figure.cloak || 0;
  if (weight <= 0) {
    return;
  }
  const sway = Math.sin(anim.phase * 0.9 + 0.6) * r * 0.1 * (0.4 + anim.move);
  const length = r * (0.9 + weight * 0.62);
  context.fillStyle = colors.deep;
  context.beginPath();
  context.moveTo(-r * 0.42, -r * 0.32);
  context.quadraticCurveTo(-r * (0.72 + weight * 0.2), r * 0.34, -r * (0.56 + weight * 0.3) + sway, length * 0.92);
  context.quadraticCurveTo(0, length + sway * 0.6, r * (0.56 + weight * 0.3) + sway, length * 0.92);
  context.quadraticCurveTo(r * (0.72 + weight * 0.2), r * 0.34, r * 0.42, -r * 0.32);
  context.closePath();
  context.fill();
};

/** 躯干：肩宽→收腰→袍摆 */
const drawTorso = (context, r, figure, anim, colors) => {
  const build = figure.build;
  const shoulder = r * build.shoulder;
  const waist = r * build.waist;
  const hip = r * build.hip;
  const topY = -r * 0.52;
  const waistY = r * 0.06;
  const bottomY = r * 0.46;
  const sway = Math.sin(anim.phase * 0.8) * r * 0.03 * anim.move;

  context.beginPath();
  context.moveTo(-shoulder, topY);
  context.quadraticCurveTo(-shoulder * 1.06, waistY * 0.4, -waist, waistY);
  context.quadraticCurveTo(-waist * 1.12, bottomY * 0.72, -hip + sway, bottomY);
  context.quadraticCurveTo(0, bottomY + r * 0.12, hip + sway, bottomY);
  context.quadraticCurveTo(waist * 1.12, bottomY * 0.72, waist, waistY);
  context.quadraticCurveTo(shoulder * 1.06, waistY * 0.4, shoulder, topY);
  context.quadraticCurveTo(0, topY - r * 0.16, -shoulder, topY);
  context.closePath();
  context.fillStyle = colors.main;
  context.fill();
  context.strokeStyle = colors.deep;
  context.lineWidth = r * 0.07;
  context.stroke();

  // 衣襟与腰带
  context.strokeStyle = colors.trim;
  context.lineWidth = r * 0.07;
  context.beginPath();
  context.moveTo(-waist * 0.5, waistY);
  context.lineTo(waist * 0.5, waistY);
  context.stroke();
  context.strokeStyle = colors.deep;
  context.lineWidth = r * 0.05;
  context.beginPath();
  context.moveTo(0, topY + r * 0.06);
  context.lineTo(sway * 0.5, waistY - r * 0.02);
  context.stroke();
};

/** 头部：后脑 + 面部 + 眼睛 */
const drawHead = (context, r, figure, anim, colors) => {
  const build = figure.build;
  const headR = r * build.head;
  const bob = Math.sin(anim.phase * 2) * r * 0.02 * anim.move;
  const headY = r * build.headY + bob;
  const hooded = figure.headgear === 'hood';
  const bald = figure.headgear === 'bald';

  context.fillStyle = bald ? colors.skin : colors.hair;
  context.beginPath();
  context.arc(0, headY, headR * 1.04, 0, TAU);
  context.fill();

  if (hooded) {
    // 兜帽只露一条眼部阴影
    context.fillStyle = colors.deep;
    context.beginPath();
    context.ellipse(0, headY - headR * 0.26, headR * 0.72, headR * 0.3, 0, 0, TAU);
    context.fill();
    context.fillStyle = colors.trim;
    context.beginPath();
    context.ellipse(-headR * 0.3, headY - headR * 0.26, headR * 0.15, headR * 0.1, 0, 0, TAU);
    context.ellipse(headR * 0.3, headY - headR * 0.26, headR * 0.15, headR * 0.1, 0, 0, TAU);
    context.fill();
  } else {
    context.fillStyle = colors.skin;
    context.beginPath();
    context.arc(0, headY - headR * 0.16, headR * 0.74, 0, TAU);
    context.fill();
    const eyeColor = figure.blind ? '#f6f2e6' : colors.deep;
    context.fillStyle = eyeColor;
    context.beginPath();
    context.arc(-headR * 0.3, headY - headR * 0.42, headR * 0.14, 0, TAU);
    context.arc(headR * 0.3, headY - headR * 0.42, headR * 0.14, 0, TAU);
    context.fill();
  }

  drawHeadgear(context, r, figure, colors, headY, headR);
};

/** 头饰：发髻 / 尖帽 / 兜帽尖 / 犄角 / 冠冕 */
const drawHeadgear = (context, r, figure, colors, headY, headR) => {
  switch (figure.headgear) {
    case 'topknot': {
      context.fillStyle = colors.hair;
      context.beginPath();
      context.arc(0, headY + headR * 0.5, headR * 0.34, 0, TAU);
      context.fill();
      context.strokeStyle = colors.trim;
      context.lineWidth = r * 0.06;
      context.beginPath();
      context.moveTo(-headR * 0.9, headY + headR * 0.2);
      context.quadraticCurveTo(0, headY + headR * 0.42, headR * 0.9, headY + headR * 0.2);
      context.stroke();
      break;
    }
    case 'scholar': {
      // 武当少侠的方巾：包头 + 脑后飘带
      context.fillStyle = colors.main;
      context.beginPath();
      context.arc(0, headY - headR * 0.12, headR * 1.06, Math.PI, TAU);
      context.fill();
      context.fillStyle = colors.trim;
      context.fillRect(-headR * 1.08, headY - headR * 0.2, headR * 2.16, headR * 0.15);
      context.strokeStyle = colors.main;
      context.lineWidth = r * 0.08;
      context.beginPath();
      context.moveTo(headR * 0.32, headY + headR * 0.1);
      context.quadraticCurveTo(headR * 1.1, headY + headR * 0.8, headR * 0.72, headY + headR * 1.75);
      context.stroke();
      break;
    }
    case 'hat': {
      context.fillStyle = colors.main;
      context.beginPath();
      context.ellipse(0, headY + headR * 0.18, headR * 1.6, headR * 0.5, 0, 0, TAU);
      context.fill();
      context.strokeStyle = colors.trim;
      context.lineWidth = r * 0.05;
      context.stroke();
      context.beginPath();
      context.moveTo(-headR * 0.86, headY + headR * 0.2);
      context.quadraticCurveTo(-headR * 0.1, headY - headR * 0.4, headR * 0.34, headY - headR * 2.1);
      context.quadraticCurveTo(headR * 0.9, headY - headR * 0.6, headR * 0.86, headY + headR * 0.2);
      context.closePath();
      context.fillStyle = colors.dark;
      context.fill();
      break;
    }
    case 'hood': {
      context.fillStyle = colors.main;
      context.beginPath();
      context.moveTo(-headR * 1.15, headY + headR * 0.5);
      context.quadraticCurveTo(-headR * 1.2, headY - headR * 1.1, headR * 0.1, headY - headR * 1.6);
      context.quadraticCurveTo(headR * 1.2, headY - headR * 0.9, headR * 1.1, headY + headR * 0.5);
      context.quadraticCurveTo(0, headY + headR * 1.0, -headR * 1.15, headY + headR * 0.5);
      context.closePath();
      context.fill();
      break;
    }
    case 'horns': {
      context.fillStyle = colors.metal;
      [-1, 1].forEach((side) => {
        context.beginPath();
        context.moveTo(side * headR * 0.6, headY - headR * 0.2);
        context.quadraticCurveTo(side * headR * 1.5, headY - headR * 0.9, side * headR * 1.35, headY - headR * 1.5);
        context.quadraticCurveTo(side * headR * 0.86, headY - headR * 0.7, side * headR * 0.28, headY - headR * 0.1);
        context.closePath();
        context.fill();
      });
      break;
    }
    case 'crown': {
      context.fillStyle = colors.metal;
      context.beginPath();
      context.moveTo(-headR * 0.84, headY - headR * 0.36);
      context.lineTo(-headR * 0.6, headY - headR * 1.1);
      context.lineTo(-headR * 0.24, headY - headR * 0.54);
      context.lineTo(0, headY - headR * 1.36);
      context.lineTo(headR * 0.24, headY - headR * 0.54);
      context.lineTo(headR * 0.6, headY - headR * 1.1);
      context.lineTo(headR * 0.84, headY - headR * 0.36);
      context.closePath();
      context.fill();
      break;
    }
    case 'bandana': {
      // 绑额布巾 + 后脑结带
      context.fillStyle = colors.trim;
      context.beginPath();
      context.moveTo(-headR * 1.02, headY - headR * 0.34);
      context.quadraticCurveTo(0, headY - headR * 0.72, headR * 1.02, headY - headR * 0.34);
      context.quadraticCurveTo(0, headY - headR * 0.1, -headR * 1.02, headY - headR * 0.34);
      context.closePath();
      context.fill();
      context.strokeStyle = colors.dark;
      context.lineWidth = r * 0.06;
      context.beginPath();
      context.moveTo(headR * 0.9, headY - headR * 0.36);
      context.quadraticCurveTo(headR * 1.5, headY - headR * 0.1, headR * 1.32, headY + headR * 0.5);
      context.stroke();
      break;
    }
    case 'mask': {
      // 忍者头巾 + 蒙面布，只留一双眼睛
      context.fillStyle = colors.main;
      context.beginPath();
      context.moveTo(-headR * 1.12, headY + headR * 0.1);
      context.quadraticCurveTo(-headR * 1.05, headY - headR * 1.1, 0, headY - headR * 1.24);
      context.quadraticCurveTo(headR * 1.05, headY - headR * 1.1, headR * 1.12, headY + headR * 0.1);
      context.quadraticCurveTo(0, headY - headR * 0.2, -headR * 1.12, headY + headR * 0.1);
      context.closePath();
      context.fill();
      context.fillStyle = colors.deep;
      context.beginPath();
      context.ellipse(0, headY + headR * 0.3, headR * 0.86, headR * 0.52, 0, 0, TAU);
      context.fill();
      context.fillStyle = colors.trim;
      context.beginPath();
      context.ellipse(-headR * 0.32, headY - headR * 0.18, headR * 0.18, headR * 0.11, 0, 0, TAU);
      context.ellipse(headR * 0.32, headY - headR * 0.18, headR * 0.18, headR * 0.11, 0, 0, TAU);
      context.fill();
      // 脑后飘带
      context.strokeStyle = colors.main;
      context.lineWidth = r * 0.08;
      context.beginPath();
      context.moveTo(headR * 0.9, headY + headR * 0.42);
      context.quadraticCurveTo(headR * 1.7, headY + headR * 0.72, headR * 1.5, headY + headR * 1.42);
      context.stroke();
      break;
    }
    case 'bald': {
      // 光头 + 戒疤
      context.fillStyle = colors.deep;
      [-0.34, 0, 0.34].forEach((offset) => {
        context.beginPath();
        context.arc(headR * offset, headY - headR * 0.62, headR * 0.075, 0, TAU);
        context.fill();
      });
      break;
    }
    case 'strawhat': {
      // 斗笠：宽檐 + 锥顶
      context.fillStyle = '#c9a86a';
      context.beginPath();
      context.ellipse(0, headY + headR * 0.05, headR * 2.1, headR * 0.62, 0, 0, TAU);
      context.fill();
      context.strokeStyle = colors.deep;
      context.lineWidth = r * 0.045;
      context.stroke();
      context.fillStyle = '#d8b97e';
      context.beginPath();
      context.moveTo(-headR * 0.96, headY + headR * 0.1);
      context.quadraticCurveTo(-headR * 0.2, headY - headR * 0.7, 0, headY - headR * 1.34);
      context.quadraticCurveTo(headR * 0.2, headY - headR * 0.7, headR * 0.96, headY + headR * 0.1);
      context.closePath();
      context.fill();
      context.strokeStyle = colors.deep;
      context.lineWidth = r * 0.035;
      context.beginPath();
      context.moveTo(-headR * 0.5, headY - headR * 0.3);
      context.quadraticCurveTo(0, headY - headR * 0.46, headR * 0.5, headY - headR * 0.3);
      context.stroke();
      break;
    }
    case 'mane': {
      // 金毛狮王：一圈炸开的狮鬃
      context.fillStyle = colors.hair;
      context.beginPath();
      context.arc(0, headY, headR * 1.42, 0, TAU);
      context.fill();
      context.fillStyle = colors.trim;
      for (let index = 0; index < 9; index += 1) {
        const angle = -Math.PI * 0.92 + (Math.PI * 1.84 * index) / 8;
        const inner = headR * 1.02;
        const outer = headR * (1.72 + Math.sin(index * 1.7) * 0.22);
        context.beginPath();
        context.moveTo(Math.cos(angle) * inner, headY + Math.sin(angle) * inner);
        context.lineTo(Math.cos(angle + 0.16) * outer, headY + Math.sin(angle + 0.16) * outer);
        context.lineTo(Math.cos(angle - 0.16) * outer, headY + Math.sin(angle - 0.16) * outer);
        context.closePath();
        context.fill();
      }
      break;
    }
    case 'helmet': {
      // 铁盔 + 红缨
      context.fillStyle = colors.main;
      context.beginPath();
      context.arc(0, headY - headR * 0.1, headR * 1.06, Math.PI, TAU);
      context.fill();
      context.fillStyle = colors.metal;
      context.fillRect(-headR * 1.08, headY - headR * 0.16, headR * 2.16, headR * 0.16);
      context.fillStyle = '#e05545';
      context.beginPath();
      context.arc(0, headY - headR * 1.16, headR * 0.26, 0, TAU);
      context.fill();
      context.strokeStyle = '#e05545';
      context.lineWidth = r * 0.07;
      context.beginPath();
      context.moveTo(0, headY - headR * 1.06);
      context.quadraticCurveTo(headR * 0.7, headY - headR * 1.5, headR * 1.1, headY - headR * 0.9);
      context.stroke();
      break;
    }
    case 'ears': {
      context.fillStyle = colors.dark;
      [-1, 1].forEach((side) => {
        context.beginPath();
        context.moveTo(side * headR * 0.72, headY - headR * 0.18);
        context.lineTo(side * headR * 1.0, headY - headR * 1.16);
        context.lineTo(side * headR * 0.24, headY - headR * 0.62);
        context.closePath();
        context.fill();
      });
      break;
    }
    default:
      break;
  }
};

/**
 * 单条手臂
 * @returns {Object} 手部位置 { x, y, angle }
 */
const drawArm = (context, r, figure, anim, colors, side, isMain) => {
  const build = figure.build;
  const shoulderX = side * r * build.shoulder * 0.68;
  const shoulderY = -r * 0.38;
  // 默认收在体侧偏后（角度接近 ±2.0 时手落在身体两侧），摆臂与挥击都围绕它展开
  const base = side * 2.0;
  const swing = Math.sin(anim.phase + (side > 0 ? 0 : Math.PI)) * 0.22 * anim.move;
  let angle = base + swing;
  let reach = r * 0.46;

  if (isMain && anim.attack >= 0) {
    const t = clamp01(anim.attack);
    angle = attackArmAngle(t);
    reach = r * (0.48 + 0.36 * Math.sin(t * Math.PI));
  } else if (isMain && anim.cast >= 0) {
    const lift = Math.sin(anim.cast * Math.PI);
    angle = mix(angle, side * 0.22, lift);
    reach = mix(reach, r * 0.6, lift);
  }

  const elbowX = shoulderX + Math.sin(angle * 0.62) * reach * 0.58;
  const elbowY = shoulderY - Math.cos(angle * 0.62) * reach * 0.58;
  const handX = shoulderX + Math.sin(angle) * reach;
  const handY = shoulderY - Math.cos(angle) * reach;

  context.strokeStyle = isMain ? colors.main : colors.dark;
  context.lineWidth = r * (isMain ? 0.22 : 0.2);
  context.beginPath();
  context.moveTo(shoulderX, shoulderY);
  context.quadraticCurveTo(elbowX, elbowY, handX, handY);
  context.stroke();

  context.fillStyle = colors.skin;
  context.beginPath();
  context.arc(handX, handY, r * 0.12, 0, TAU);
  context.fill();

  return { x: handX, y: handY, angle };
};

/* ------------------------------------------------------------------ */
/* 武器                                                                 */
/* ------------------------------------------------------------------ */

const WEAPONS = {
  saber(context, r, colors) {
    context.fillStyle = colors.handle;
    context.fillRect(-r * 0.055, -r * 0.1, r * 0.11, r * 0.36);
    context.fillStyle = colors.metal;
    context.fillRect(-r * 0.15, -r * 0.18, r * 0.3, r * 0.09);
    context.beginPath();
    context.moveTo(-r * 0.07, -r * 0.18);
    context.quadraticCurveTo(r * 0.12, -r * 0.9, r * 0.04, -r * 1.52);
    context.quadraticCurveTo(-r * 0.04, -r * 0.95, -r * 0.11, -r * 0.18);
    context.closePath();
    context.fillStyle = colors.metal;
    context.fill();
    context.strokeStyle = colors.trim;
    context.lineWidth = r * 0.035;
    context.stroke();
  },
  sword(context, r, colors) {
    // 直刃长剑：十字护手 + 剑穗
    context.fillStyle = colors.handle;
    context.fillRect(-r * 0.05, -r * 0.12, r * 0.1, r * 0.34);
    context.fillStyle = colors.metal;
    context.fillRect(-r * 0.19, -r * 0.17, r * 0.38, r * 0.075);
    context.beginPath();
    context.moveTo(-r * 0.075, -r * 0.15);
    context.lineTo(-r * 0.055, -r * 1.34);
    context.lineTo(0, -r * 1.6);
    context.lineTo(r * 0.055, -r * 1.34);
    context.lineTo(r * 0.075, -r * 0.15);
    context.closePath();
    context.fillStyle = colors.metal;
    context.fill();
    context.strokeStyle = colors.trim;
    context.lineWidth = r * 0.03;
    context.stroke();
    context.strokeStyle = '#d94f4f';
    context.lineWidth = r * 0.045;
    context.beginPath();
    context.moveTo(0, r * 0.22);
    context.quadraticCurveTo(r * 0.16, r * 0.42, r * 0.08, r * 0.58);
    context.stroke();
  },
  staff(context, r, colors) {
    context.strokeStyle = colors.handle;
    context.lineWidth = r * 0.1;
    context.beginPath();
    context.moveTo(0, r * 0.62);
    context.lineTo(0, -r * 1.66);
    context.stroke();
    context.fillStyle = colors.trim;
    context.beginPath();
    context.arc(0, -r * 1.86, r * 0.24, 0, TAU);
    context.fill();
    context.strokeStyle = colors.metal;
    context.lineWidth = r * 0.06;
    context.beginPath();
    context.arc(0, -r * 1.86, r * 0.4, 0, TAU);
    context.stroke();
  },
  club(context, r, colors) {
    context.fillStyle = colors.handle;
    context.fillRect(-r * 0.06, -r * 0.1, r * 0.12, r * 0.44);
    context.beginPath();
    context.moveTo(-r * 0.1, -r * 0.12);
    context.quadraticCurveTo(-r * 0.36, -r * 0.9, -r * 0.2, -r * 1.36);
    context.quadraticCurveTo(0, -r * 1.56, r * 0.2, -r * 1.34);
    context.quadraticCurveTo(r * 0.36, -r * 0.88, r * 0.1, -r * 0.12);
    context.closePath();
    context.fillStyle = '#7a5a34';
    context.fill();
    context.strokeStyle = colors.deep;
    context.lineWidth = r * 0.06;
    context.stroke();
    context.fillStyle = colors.metal;
    [-0.6, -1.0].forEach((offset) => {
      context.beginPath();
      context.arc(r * 0.06, r * offset, r * 0.07, 0, TAU);
      context.fill();
    });
  },
  daggers(context, r, colors) {
    [-1, 1].forEach((side) => {
      context.save();
      context.translate(side * r * 0.02, 0);
      context.fillStyle = colors.handle;
      context.fillRect(-r * 0.05, -r * 0.08, r * 0.1, r * 0.3);
      context.beginPath();
      context.moveTo(-r * 0.075, -r * 0.08);
      context.quadraticCurveTo(r * 0.05, -r * 0.6, 0, -r * 0.86);
      context.quadraticCurveTo(-r * 0.06, -r * 0.55, -r * 0.09, -r * 0.08);
      context.closePath();
      context.fillStyle = colors.metal;
      context.fill();
      context.restore();
    });
  },
  kunai(context, r, colors) {
    // 苦无：短刃 + 尾环
    context.strokeStyle = colors.handle;
    context.lineWidth = r * 0.1;
    context.beginPath();
    context.moveTo(0, r * 0.34);
    context.lineTo(0, -r * 0.04);
    context.stroke();
    context.strokeStyle = colors.metal;
    context.lineWidth = r * 0.05;
    context.beginPath();
    context.arc(0, r * 0.44, r * 0.12, 0, TAU);
    context.stroke();
    context.beginPath();
    context.moveTo(-r * 0.12, -r * 0.02);
    context.quadraticCurveTo(r * 0.08, -r * 0.5, 0, -r * 0.82);
    context.quadraticCurveTo(-r * 0.1, -r * 0.44, -r * 0.12, -r * 0.02);
    context.closePath();
    context.fillStyle = colors.metal;
    context.fill();
    context.strokeStyle = colors.trim;
    context.lineWidth = r * 0.03;
    context.stroke();
  },
  cudgel(context, r, colors) {
    // 短棍：木身 + 两端铁箍 + 缠柄布条
    context.strokeStyle = colors.handle;
    context.lineCap = 'round';
    context.lineWidth = r * 0.14;
    context.beginPath();
    context.moveTo(0, r * 0.5);
    context.lineTo(0, -r * 1.2);
    context.stroke();
    context.fillStyle = colors.metal;
    context.fillRect(-r * 0.12, -r * 1.3, r * 0.24, r * 0.14);
    context.fillRect(-r * 0.12, r * 0.32, r * 0.24, r * 0.12);
    context.strokeStyle = colors.trim;
    context.lineWidth = r * 0.045;
    [-0.72, -0.92].forEach((offset) => {
      context.beginPath();
      context.moveTo(-r * 0.1, r * offset);
      context.lineTo(r * 0.1, r * (offset + 0.08));
      context.stroke();
    });
  },
  bow(context, r, colors) {
    // 弓：弓臂 + 弦 + 搭在弦上的箭
    context.strokeStyle = colors.handle;
    context.lineCap = 'round';
    context.lineWidth = r * 0.1;
    context.beginPath();
    context.arc(0, -r * 0.4, r * 0.58, -Math.PI / 2, Math.PI / 2);
    context.stroke();
    context.strokeStyle = colors.trim;
    context.lineWidth = r * 0.028;
    context.beginPath();
    context.moveTo(0, -r * 0.98);
    context.lineTo(0, r * 0.18);
    context.stroke();
    context.strokeStyle = colors.metal;
    context.lineWidth = r * 0.05;
    context.beginPath();
    context.moveTo(0, r * 0.3);
    context.lineTo(0, -r * 1.1);
    context.stroke();
    context.fillStyle = colors.metal;
    context.beginPath();
    context.moveTo(-r * 0.08, -r * 1.0);
    context.lineTo(0, -r * 1.22);
    context.lineTo(r * 0.08, -r * 1.0);
    context.closePath();
    context.fill();
  },
  glaive(context, r, colors) {
    context.strokeStyle = colors.handle;
    context.lineWidth = r * 0.11;
    context.beginPath();
    context.moveTo(0, r * 0.72);
    context.lineTo(0, -r * 1.5);
    context.stroke();
    context.beginPath();
    context.moveTo(0, -r * 1.36);
    context.quadraticCurveTo(r * 0.52, -r * 1.62, r * 0.34, -r * 2.34);
    context.quadraticCurveTo(r * 0.02, -r * 1.96, -r * 0.12, -r * 1.42);
    context.closePath();
    context.fillStyle = colors.metal;
    context.fill();
    context.strokeStyle = colors.trim;
    context.lineWidth = r * 0.04;
    context.stroke();
  },
  falchion(context, r, colors) {
    // 屠龙刀：厚背宽刃 + 金护手
    context.fillStyle = colors.handle;
    context.fillRect(-r * 0.07, -r * 0.12, r * 0.14, r * 0.42);
    context.fillStyle = colors.trim;
    context.fillRect(-r * 0.24, -r * 0.24, r * 0.48, r * 0.11);
    context.beginPath();
    context.moveTo(-r * 0.2, -r * 0.24);
    context.lineTo(r * 0.2, -r * 0.24);
    context.quadraticCurveTo(r * 0.46, -r * 1.12, r * 0.24, -r * 1.86);
    context.lineTo(-r * 0.04, -r * 2.02);
    context.quadraticCurveTo(-r * 0.34, -r * 1.2, -r * 0.2, -r * 0.24);
    context.closePath();
    context.fillStyle = colors.metal;
    context.fill();
    context.strokeStyle = colors.trim;
    context.lineWidth = r * 0.04;
    context.stroke();
  },
  claw() {},
};

/** 把武器挂到手上 */
const drawWeapon = (context, r, figure, colors, hand) => {
  const drawer = WEAPONS[figure.weapon];
  if (!drawer) {
    return;
  }
  context.save();
  context.translate(hand.x, hand.y);
  context.rotate(hand.angle);
  drawer(context, r, colors);
  context.restore();
};

/* ------------------------------------------------------------------ */
/* 人形整体                                                             */
/* ------------------------------------------------------------------ */

const drawHumanoid = (context, r, figure, anim, colors) => {
  const stride = figure.nimble ? 1.15 : 1;
  const scaledAnim = figure.nimble ? { ...anim, move: anim.move * stride } : anim;
  const lunge = anim.attack >= 0 ? Math.sin(clamp01(anim.attack) * Math.PI) * r * 0.14 : 0;
  const bob = Math.sin(anim.phase * 2) * r * 0.04 * anim.move + anim.breath * r * 0.014;

  context.save();
  context.translate(0, -lunge + bob);

  drawCloak(context, r, figure, scaledAnim, colors);
  drawLegs(context, r, figure, scaledAnim, colors);

  const offhandPose = drawArm(context, r, figure, scaledAnim, colors, -1, false);
  if (figure.weapon === 'daggers') {
    drawWeapon(context, r, figure, colors, offhandPose);
  }

  drawTorso(context, r, figure, scaledAnim, colors);
  drawHead(context, r, figure, scaledAnim, colors);

  // 施法时前手抬起并要求掌心光球
  const swingPose = drawArm(context, r, figure, scaledAnim, colors, 1, true);
  drawWeapon(context, r, figure, colors, swingPose);

  if (anim.cast >= 0) {
    const glow = Math.sin(anim.cast * Math.PI);
    context.fillStyle = colors.trim;
    context.globalAlpha = 0.55 * glow;
    context.beginPath();
    context.arc(swingPose.x, swingPose.y, r * 0.42 * glow + r * 0.1, 0, TAU);
    context.fill();
    context.globalAlpha = 1;
  }

  context.restore();
};

/* ------------------------------------------------------------------ */
/* 兽形骨架（野狼 / 召唤小妖）                                          */
/* ------------------------------------------------------------------ */

const drawBeast = (context, r, figure, anim, colors) => {
  const build = figure.build;
  const run = anim.move;
  const phase = anim.phase;
  const bob = Math.sin(phase * 2) * r * 0.05 * run;
  const lunge = anim.attack >= 0 ? Math.sin(clamp01(anim.attack) * Math.PI) * r * 0.18 : 0;
  const tailSway = Math.sin(phase * 0.9 + 0.8) * 0.3 * (0.4 + run);

  context.save();
  context.translate(0, bob - lunge);

  // 尾巴
  if (figure.tail) {
    context.strokeStyle = colors.dark;
    context.lineWidth = r * 0.16;
    context.beginPath();
    context.moveTo(0, r * build.bodyLength * 0.56);
    context.quadraticCurveTo(tailSway * 0.5 * r, r * 1.08, tailSway * r, r * 1.44);
    context.stroke();
  }

  // 四条腿：前后错相位，跑动才有四蹄翻飞的感觉
  const legSpan = r * 0.5;
  const legs = [
    { x: -build.legX, y: build.legFront, offset: 0, color: colors.deep },
    { x: build.legX, y: build.legFront, offset: Math.PI * 0.55, color: colors.dark },
    { x: -build.legX, y: build.legBack, offset: Math.PI, color: colors.dark },
    { x: build.legX, y: build.legBack, offset: Math.PI * 1.5, color: colors.deep },
  ];
  legs.forEach((leg) => {
    // swing / lift 都是半径系数，最后统一乘 r，避免量纲混用
    const swing = Math.sin(phase + leg.offset) * 0.36 * run;
    const lift = Math.max(0, Math.sin(phase + leg.offset)) * run * 0.16;
    context.strokeStyle = leg.color;
    context.lineWidth = r * 0.17;
    context.beginPath();
    context.moveTo(leg.x * r * 0.7, r * leg.y);
    context.quadraticCurveTo(
      (leg.x + swing * 0.4) * r,
      r * leg.y + r * 0.24,
      (leg.x + swing) * r * 0.9,
      r * leg.y + legSpan - lift * r + r * 0.34,
    );
    context.stroke();
  });

  // 躯干
  context.fillStyle = colors.main;
  context.beginPath();
  context.ellipse(0, r * 0.06, r * build.body * 1.02, r * build.bodyLength, 0, 0, TAU);
  context.fill();
  context.strokeStyle = colors.deep;
  context.lineWidth = r * 0.06;
  context.stroke();

  // 背脊鬃毛
  context.fillStyle = colors.dark;
  context.beginPath();
  context.moveTo(-r * 0.13, -r * build.bodyLength * 0.66);
  context.quadraticCurveTo(0, -r * 1.46, r * 0.13, -r * build.bodyLength * 0.66);
  context.closePath();
  context.fill();

  // 头
  const headY = r * build.headY - lunge * 0.4;
  const headR = r * build.head;
  context.fillStyle = colors.main;
  context.beginPath();
  context.arc(0, headY, headR, 0, TAU);
  context.fill();
  context.strokeStyle = colors.deep;
  context.lineWidth = r * 0.055;
  context.stroke();

  // 吻部
  context.fillStyle = colors.skin;
  context.beginPath();
  context.moveTo(-headR * 0.5, headY - headR * 0.3);
  context.quadraticCurveTo(0, headY - headR * 1.7, headR * 0.5, headY - headR * 0.3);
  context.quadraticCurveTo(0, headY - headR * 0.7, -headR * 0.5, headY - headR * 0.3);
  context.closePath();
  context.fill();
  context.fillStyle = colors.deep;
  context.beginPath();
  context.arc(0, headY - headR * 0.86, r * 0.08, 0, TAU);
  context.fill();

  // 耳朵
  context.fillStyle = colors.dark;
  [-1, 1].forEach((side) => {
    context.beginPath();
    context.moveTo(side * headR * 0.78, headY + headR * 0.28);
    context.lineTo(side * headR * 1.14, headY - headR * 0.86);
    context.lineTo(side * headR * 0.2, headY - headR * 0.42);
    context.closePath();
    context.fill();
  });

  // 眼睛
  context.fillStyle = colors.trim;
  context.beginPath();
  context.arc(-headR * 0.5, headY - headR * 0.44, r * 0.08, 0, TAU);
  context.arc(headR * 0.5, headY - headR * 0.44, r * 0.08, 0, TAU);
  context.fill();

  context.restore();
};

/* ------------------------------------------------------------------ */
/* 对外入口                                                             */
/* ------------------------------------------------------------------ */

/**
 * 绘制一个角色（已含朝向旋转、行走与攻击动画）
 * @param {CanvasRenderingContext2D} context 画布上下文
 * @param {Object} entity 角色实体
 * @param {Object} world 世界实例（取 time）
 */
export const drawActor = (context, entity, world) => {
  if (!entity || !entity.alive) {
    return;
  }
  const figure = resolveFigure(entity);
  const colors = paletteOf(figure, entity);
  const anim = readAnim(entity, world.time);
  const r = entity.radius;

  // 攻击前段把朝向锁到出手方向，避免边走边挥时人物乱转
  const targetAngle = anim.attack >= 0 && anim.attack < 0.45 ? entity.attackAnimAngle || entity.facing : entity.facing;
  const facing = smoothFacing(entity, targetAngle, world.time);
  const shake = entity.hitFlash > 0 ? Math.sin(world.time * 88) * r * 0.07 : 0;

  const scale = entity.isMinion ? 0.82 : 1;

  context.save();
  context.translate(entity.x + shake, entity.y + shake * 0.4);
  context.rotate(facing + Math.PI / 2);
  context.scale(scale, scale);
  context.lineJoin = 'round';

  if (figure.form === 'beast') {
    drawBeast(context, r, figure, anim, colors);
  } else {
    drawHumanoid(context, r, figure, anim, colors);
  }

  context.restore();
};

/** 召唤物额外光晕（由渲染层调用，画在立绘之前） */
export const drawMinionAura = (context, entity, time) => {
  const pulse = 0.5 + Math.sin(time * 5 + (entity.animSeed || 0)) * 0.2;
  context.strokeStyle = `rgba(201, 166, 255, ${pulse})`;
  context.lineWidth = 1.6;
  context.beginPath();
  context.arc(entity.x, entity.y + entity.radius * 0.2, entity.radius * 1.5, 0, TAU);
  context.stroke();
};
