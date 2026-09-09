<template>
  <div class="unit-panel">
    <button class="back" @click="$emit('back')">返回</button>
    <h1 class="title">单位图鉴</h1>
    <p class="sub">敌人、Boss、塔与英雄——看清楚再上战场。</p>

    <section class="group">
      <h2 class="group-title enemy"><span class="dot"></span>敌人 · 可派遣但有限定</h2>
      <div class="grid">
        <UnitCard v-for="u in enemyUnits" :key="u.key" :unit="u" />
      </div>
    </section>

    <section class="group">
      <h2 class="group-title boss"><span class="dot"></span>Boss · 高血量 + 特殊机制</h2>
      <div class="grid">
        <UnitCard v-for="u in bossUnits" :key="u.key" :unit="u" />
      </div>
    </section>

    <section class="group">
      <h2 class="group-title tower"><span class="dot"></span>塔 · 防守核心</h2>
      <div class="grid">
        <UnitCard v-for="u in towerUnits" :key="u.key" :unit="u" />
      </div>
    </section>

    <section class="group">
      <h2 class="group-title hero"><span class="dot"></span>英雄 · 你</h2>
      <div class="grid">
        <UnitCard :unit="heroUnit" />
      </div>
    </section>

    <p class="tip">若不清楚某个塔是否对空 / 对隐身，先看标签里的「可打飞行」「可打隐身」字段。</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import UnitCard from './UnitCard.vue';
import { drawSoldier, drawDragon, drawGhost, drawBoss } from '../draw/units/index.js';

defineEmits(['back']);

// ======== 敌人图鉴 ========
const enemyUnits = [
  {
    key: 'normal',
    role: 'enemy',
    name: '步兵',
    color: '#94a3b8',
    desc: '标准兵种，HP / 速度中等。最容易出现也最容易对付。',
    ring: 22,
    stats: [
      { label: 'HP',    value: 30 },
      { label: '速度',  value: '60 px/s' },
      { label: '击杀',  value: '💰5' },
    ],
    draw: (ctx, e, time) => drawSoldier(ctx, { ...e, size: 22, def: { color: '#94a3b8' }, walkPhase: time * 0.07 }, time, 1),
  },
  {
    key: 'flying',
    role: 'enemy',
    name: '飞龙',
    color: '#38bdf8',
    desc: '飞行单位，部分塔型无法锁定。需要炮营 / 箭楼 / 兵营小兵。',
    ring: 22,
    stats: [
      { label: 'HP',   value: 20 },
      { label: '速度', value: '85 px/s' },
      { label: '特性', value: '飞行' },
      { label: '击杀', value: '💰8' },
    ],
    draw: (ctx, e, time) => drawDragon(ctx, { ...e, size: 22, def: { color: '#38bdf8' }, walkPhase: time * 0.07 }, time, 1),
  },
  {
    key: 'stealth',
    role: 'enemy',
    name: '幽影',
    color: '#a78bfa',
    desc: '半透明隐身，无反隐塔时其他塔无法锁定。最终混合身上也带隐。',
    ring: 22,
    stats: [
      { label: 'HP',   value: 45 },
      { label: '速度', value: '50 px/s' },
      { label: '特性', value: '隐身' },
      { label: '击杀', value: '💰12' },
    ],
    draw: (ctx, e, time) => drawGhost(ctx, { ...e, size: 22, def: { color: '#a78bfa' }, alpha: 1, walkPhase: time * 0.07 }, time, 1),
  },
];

const bossUnits = [
  {
    key: 'bossDragon',
    role: 'boss',
    name: '飞龙母舰',
    color: '#0ea5e9',
    desc: '飞行 + 召唤 2 飞龙小怪，每 8 秒一轮。',
    ring: 28,
    stats: [
      { label: 'HP',   value: 600 },
      { label: '速度', value: '40 px/s' },
      { label: '召唤', value: '飞龙 ×2 / 8s' },
      { label: '击杀', value: '💰150' },
    ],
    draw: (ctx, e, time) => drawBoss(ctx, { ...e, size: 30, def: { name: '飞龙母舰', color: '#0ea5e9' } }, time, 1),
  },
  {
    key: 'bossGhost',
    role: 'boss',
    name: '幽影领主',
    color: '#8b5cf6',
    desc: '召唤 3 隐身幽影。需要至少 1 座反隐塔才能打全队。',
    ring: 28,
    stats: [
      { label: 'HP',   value: 720 },
      { label: '速度', value: '38 px/s' },
      { label: '召唤', value: '幽影 ×3 / 7s' },
      { label: '击杀', value: '💰180' },
    ],
    draw: (ctx, e, time) => drawBoss(ctx, { ...e, size: 30, def: { name: '幽影领主', color: '#8b5cf6' } }, time, 1),
  },
  {
    key: 'bossGolem',
    role: 'boss',
    name: '钢铁巨像',
    color: '#64748b',
    desc: '前 5 秒受甲减伤 (×0.5)，之后失去装甲。注意看破甲光效。',
    ring: 32,
    stats: [
      { label: 'HP',   value: 900 },
      { label: '速度', value: '32 px/s' },
      { label: '特性', value: '5s 减伤' },
      { label: '击杀', value: '💰220' },
    ],
    draw: (ctx, e, time) => drawBoss(ctx, { ...e, size: 34, def: { name: '钢铁巨像', color: '#64748b' } }, time, 1),
  },
  {
    key: 'bossPhantom',
    role: 'boss',
    name: '幽能龙',
    color: '#22d3ee',
    desc: '飞行 + 每 7s 相位隐匿 2.4s，隐身期只有反隐塔能锁定。需要箭楼 + 反隐同时覆盖。',
    ring: 30,
    stats: [
      { label: 'HP',   value: 1050 },
      { label: '速度', value: '46 px/s' },
      { label: '隐匿', value: '2.4s / 7s' },
      { label: '击杀', value: '💰260' },
    ],
    draw: (ctx, e, time) => drawBoss(ctx, { ...e, size: 31, def: { name: '幽能龙', color: '#22d3ee' }, floatY: 26 }, time, 1),
  },
  {
    key: 'bossShadow',
    role: 'boss',
    name: '暗影领主',
    color: '#7c3aed',
    desc: '三系召唤：每 9s 同时召唤步兵/飞龙/幽影各 2 只，自身每 6s 相位隐匿 2.2s。',
    ring: 32,
    stats: [
      { label: 'HP',   value: 1150 },
      { label: '速度', value: '42 px/s' },
      { label: '召唤', value: '三系 ×2 / 9s' },
      { label: '击杀', value: '💰280' },
    ],
    draw: (ctx, e, time) => drawBoss(ctx, { ...e, size: 33, def: { name: '暗影领主', color: '#7c3aed' } }, time, 1),
  },
  {
    key: 'bossMix',
    role: 'boss',
    name: '终极混合',
    color: '#ec4899',
    desc: '飞行 + 隐身 + 召唤 (步兵)。全模式都要顾到，建议多塔协同。',
    ring: 30,
    stats: [
      { label: 'HP',   value: 1200 },
      { label: '速度', value: '50 px/s' },
      { label: '召唤', value: '步兵 ×4 / 6s' },
      { label: '击杀', value: '💰300' },
    ],
    draw: (ctx, e, time) => drawBoss(ctx, { ...e, size: 32, def: { name: '终极混合', color: '#ec4899' } }, time, 1),
  },
];

// ======== 塔图鉴 ========
// 用基础 sprite 替代：兵营 / 炮营 / 箭楼 / 科技站 / 反隐
// 这里用通用圆+顶饰绘制 — 不一一对应 draw/units，下方用 mini 图形
const drawMiniTower = (ctx, e, time, kind) => {
  const { x, y, size } = e;
  const c = e.def.color;
  const ring = e.def.ringColor;
  const iconColor = e.def.iconColor;
  // base
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(x - size * 0.42, y - size * 0.12, size * 0.84, size * 0.5);
  ctx.strokeStyle = ring;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x - size * 0.42, y - size * 0.12, size * 0.84, size * 0.5);
  // topper
  if (kind === 'barracks') {
    ctx.fillStyle = c;
    ctx.fillRect(x - 4, y - size * 0.42, 3, 16);
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(x - 4, y - size * 0.42, 3, 10);
  } else if (kind === 'cannon') {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.28, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.04, y - size * 0.36);
    ctx.lineTo(x + size * 0.16, y - size * 0.6 + Math.sin(time * 0.005) * 2);
    ctx.strokeStyle = iconColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else if (kind === 'arrow') {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.55);
    ctx.lineTo(x - 4, y - size * 0.32);
    ctx.lineTo(x + 4, y - size * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = iconColor;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x - 4, y - size * 0.34, 8, 12);
  } else if (kind === 'tech') {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.32, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = iconColor;
    ctx.stroke();
    // rotating ring
    ctx.beginPath();
    ctx.arc(x, y - size * 0.32, size * 0.22, time * 0.01, time * 0.01 + Math.PI * 1.4);
    ctx.stroke();
  } else if (kind === 'detector') {
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.arc(x, y - size * 0.32, size * 0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = iconColor;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.32 - size * 0.1);
    ctx.lineTo(x + 4, y - size * 0.32);
    ctx.lineTo(x, y - size * 0.32 + size * 0.1);
    ctx.closePath();
    ctx.fill();
    // sweep line
    ctx.strokeStyle = iconColor;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.32);
    ctx.lineTo(x + Math.cos(time * 0.005) * size * 0.22, y - size * 0.32 + Math.sin(time * 0.005) * size * 0.22);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
};

const towerUnits = [
  {
    key: 'barracks',
    role: 'tower',
    name: '兵营',
    color: '#10b981',
    desc: '召唤小兵物理接触敌人。可打飞行 / 隐身。',
    ring: 24,
    stats: [
      { label: '造价', value: '💰50' },
      { label: '升级', value: '40 / 80' },
      { label: '打空', value: '✓' },
      { label: '打隐', value: '✓' },
    ],
    draw: (ctx, e, time) => drawMiniTower(ctx, { ...e, def: { color: '#10b981', ringColor: '#34d399', iconColor: '#a7f3d0' } }, time, 'barracks'),
  },
  {
    key: 'cannon',
    role: 'tower',
    name: '炮营',
    color: '#ef4444',
    desc: '远程溅射，唯一对空范围塔。群怪首选。',
    ring: 26,
    stats: [
      { label: '造价', value: '💰100' },
      { label: '射程', value: '3.2 ~ 4.4 格' },
      { label: '溅射', value: '1.1 ~ 1.7 格' },
      { label: '间隔', value: '1500ms' },
    ],
    draw: (ctx, e, time) => drawMiniTower(ctx, { ...e, def: { color: '#ef4444', ringColor: '#fca5a5', iconColor: '#fecaca' } }, time, 'cannon'),
  },
  {
    key: 'arrow',
    role: 'tower',
    name: '箭楼',
    color: '#f59e0b',
    desc: '高频单体，唯一对空高频塔。配合炮营拆 Boss。',
    ring: 26,
    stats: [
      { label: '造价', value: '💰75' },
      { label: '射程', value: '3.6 ~ 4.8 格' },
      { label: '间隔', value: '450ms' },
      { label: '伤害', value: '9 ~ 24' },
    ],
    draw: (ctx, e, time) => drawMiniTower(ctx, { ...e, def: { color: '#f59e0b', ringColor: '#fbbf24', iconColor: '#fde68a' } }, time, 'arrow'),
  },
  {
    key: 'tech',
    role: 'tower',
    name: '科技前哨站',
    color: '#a855f7',
    desc: '不攻击。每 8s 给英雄解锁 / 升级技能。最多 4 座。',
    ring: 26,
    stats: [
      { label: '造价', value: '💰150' },
      { label: '上限', value: '4 座' },
      { label: '周期', value: '8s' },
      { label: '作用', value: '解技能' },
    ],
    draw: (ctx, e, time) => drawMiniTower(ctx, { ...e, def: { color: '#a855f7', ringColor: '#c084fc', iconColor: '#e9d5ff' } }, time, 'tech'),
  },
  {
    key: 'detector',
    role: 'tower',
    name: '反隐塔',
    color: '#06b6d4',
    desc: '侦测光环 3 ~ 4.2 格，使隐身显形，其他塔才能打。',
    ring: 26,
    stats: [
      { label: '造价', value: '💰60' },
      { label: '侦测', value: '3 ~ 4.2 格' },
      { label: '升级', value: '60 / 120' },
      { label: '扫描', value: '旋转' },
    ],
    draw: (ctx, e, time) => drawMiniTower(ctx, { ...e, def: { color: '#06b6d4', ringColor: '#22d3ee', iconColor: '#a5f3fc' } }, time, 'detector'),
  },
];

// ======== 英雄 ========
import { drawHero as drawHeroSprite } from '../draw/units/index.js';
const heroUnit = {
  key: 'hero',
  role: 'hero',
  name: '骑士',
  color: '#10b981',
  desc: '你！WASD 移动，英雄站上某路径 32px 内时敌人停下并打你。同时自动普攻范围内最近敌人。',
  ring: 24,
  stats: [
    { label: 'HP',   value: '100' },
    { label: '速度', value: '220 px/s' },
    { label: '攻击', value: '18 dmg / 480ms' },
    { label: '范围', value: '84 px' },
  ],
  draw: (ctx, e, time) => drawHeroSprite(ctx, { ...e, def: { color: '#10b981' }, walkPhase: time * 0.07 }, time, 1),
};
</script>

<style scoped lang="scss">
.unit-panel {
  height: 100%;
  overflow-y: auto;
  padding: 24px 32px 40px;
  background: #020409;
  color: #eaf6ff;
  box-sizing: border-box;
  font-family: 'Menlo', 'Consolas', 'Roboto Mono', monospace;

  .back {
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 100;
    padding: 6px 16px;
    background: transparent;
    border: 1px solid #1b7f8a;
    border-radius: 3px;
    color: #3ee6d8;
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;

    &:hover {
      color: #7df3ff;
      border-color: #3ee6d8;
    }
  }
}

.title {
  margin: 8px 0 0;
  font-size: 26px;
  letter-spacing: 4px;
  color: #3ee6d8;
  text-align: center;
}

.sub {
  margin: 8px 0 28px;
  text-align: center;
  font-size: 13px;
  color: #6a7c8d;
}

.group {
  margin: 0 auto 28px;
  max-width: 920px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  font-size: 15px;
  letter-spacing: 2px;

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    display: inline-block;
  }

  &.enemy  .dot { background: #3b82f6; box-shadow: 0 0 8px #3b82f6; }
  &.boss   .dot { background: #b06cff; box-shadow: 0 0 8px #b06cff; }
  &.tower  .dot { background: #3ee6d8; box-shadow: 0 0 8px #3ee6d8; }
  &.hero   .dot { background: #34d399; box-shadow: 0 0 8px #34d399; }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.tip {
  max-width: 920px;
  margin: 14px auto 0;
  text-align: center;
  font-size: 12px;
  color: #6a7c8d;
}
</style>
