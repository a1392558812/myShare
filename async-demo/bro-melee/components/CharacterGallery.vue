<template>
  <div class="gallery">
    <div class="gallery-head">
      <div class="head-block">
        <span class="head-main">江湖图鉴</span>
        <span class="head-sub">CHARACTER GALLERY</span>
      </div>
      <div class="head-tip">← → 切换角色 · Esc 返回</div>
      <button class="back-btn" @click="$emit('back')">返回</button>
    </div>

    <div class="gallery-body">
      <aside class="roster">
        <div class="roster-title">出场角色 · {{ roster.length }}</div>
        <button
          v-for="item in roster"
          :key="item.key"
          class="roster-item"
          :class="{ active: item.key === activeKey }"
          @click="selectActor(item.key)"
        >
          <span class="dot" :style="{ background: item.color }"></span>
          <span class="r-name">{{ item.name }}</span>
          <span class="r-tag">{{ item.tag }}</span>
        </button>
      </aside>

      <section ref="stageRef" class="stage">
        <canvas ref="canvasRef" class="stage-canvas"></canvas>
        <div class="stage-top">
          <div class="stage-name">{{ view.name }}</div>
          <div class="stage-sub">{{ view.subtitle }}</div>
        </div>
        <div class="stage-badge">{{ stageLabel }}</div>
        <div class="stage-bar">
          <button
            v-for="action in ACTIONS"
            :key="action.id"
            class="act-btn"
            :class="{ active: mode === action.id }"
            @click="setMode(action.id)"
          >
            {{ action.label }}
          </button>
          <label v-if="view.kind === 'enemy'" class="level-slot">
            <span>模拟等级</span>
            <input type="range" min="1" max="40" :value="level" @input="onLevelInput" />
            <b>Lv.{{ level }}</b>
          </label>
        </div>
      </section>

      <aside class="info">
        <div class="info-block">
          <div class="info-title">属性</div>
          <div class="stat-grid">
            <div v-for="row in view.rows" :key="row.label" class="stat-row">
              <span class="stat-label">{{ row.label }}</span>
              <span class="stat-value">{{ row.value }}</span>
            </div>
          </div>
        </div>

        <div v-if="view.skills.length" class="info-block">
          <div class="info-title">随身武功 · {{ view.skills.length }}</div>
          <div v-for="skill in view.skills" :key="skill.name" class="skill-card">
            <div class="skill-head">
              <span class="skill-dot" :style="{ background: skill.color }"></span>
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-tag">{{ skill.tag }}</span>
              <span class="skill-cd">{{ skill.cd }}s</span>
            </div>
            <div class="skill-desc">{{ skill.desc }}</div>
          </div>
        </div>

        <div v-if="view.groups.length" class="info-block">
          <div class="info-title">可习得秘籍 · {{ view.skillTotal }}</div>
          <div v-for="group in view.groups" :key="group.title" class="book-group">
            <div class="book-title">{{ group.title }}<span>{{ group.chips.length }}</span></div>
            <div class="chips">
              <span v-for="chip in group.chips" :key="chip.name" class="chip" :title="chip.detail">{{ chip.name }}</span>
            </div>
          </div>
        </div>

        <div v-if="view.relics.length" class="info-block">
          <div class="info-title">神兵 · {{ view.relics.length }}</div>
          <div v-for="relic in view.relics" :key="relic.name" class="relic-card" :style="{ borderLeftColor: relic.color }">
            <div class="relic-head">
              <span class="relic-icon" :style="{ color: relic.color, borderColor: relic.color }">{{ relic.icon }}</span>
              <span class="relic-name" :style="{ color: relic.color }">{{ relic.name }}</span>
              <span class="relic-key">{{ relic.key }} 键</span>
            </div>
            <div class="relic-desc">{{ relic.description }}</div>
            <div class="relic-skill">
              <b>{{ relic.skill.name }}</b>
              <span>{{ relic.skill.detail }}</span>
            </div>
            <div class="relic-bonus">{{ relic.bonusText }}</div>
          </div>
        </div>

        <div v-if="view.intro" class="info-block">
          <div class="info-title">档案</div>
          <p class="intro">{{ view.intro }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { PALETTE, BALANCE } from '../constants.js';
import { ENEMY_TYPES, getEnemyType } from '../config/enemies.js';
import { ENEMY_SKILLS } from '../config/enemySkills.js';
import { PLAYER_SKILLS, SKILL_CATEGORY_LABEL } from '../config/skills.js';
import { RELICS, RELIC_IDS, PAIR_BONUS } from '../config/relics.js';
import { createPlayer, createEnemy } from '../core/entities.js';
import { companionLearningText, shunnedManualNames } from '../core/companions.js';
import { drawActor } from '../draw/actors.js';
import { drawShadow, drawFootRing, drawHealthBar, drawLevelLabel } from '../draw/renderer.js';

const emit = defineEmits(['back']);

const TAU = Math.PI * 2;
const FONT_FAMILY = "'Microsoft YaHei', 'PingFang SC', sans-serif";

const ACTIONS = [
  { id: 'cycle', label: '循环演示' },
  { id: 'idle', label: '待机' },
  { id: 'walk', label: '行走' },
  { id: 'attack', label: '出手' },
  { id: 'cast', label: '运功' },
];

const CYCLE = ['idle', 'walk', 'attack', 'cast'];
const CYCLE_DURATION = { idle: 1.1, walk: 1.9, attack: 0.95, cast: 1.1 };
const STAGE_LABEL = { idle: '待机 · 呼吸起伏', walk: '行走 · 步频摆臂', attack: '出手 · 劈砍', cast: '运功 · 抬掌聚气' };

const SKILL_TYPE_LABEL = {
  dash: '突进',
  projectile: '远程',
  area: '范围',
  buff: '增益',
  heal: '疗伤',
  targetArea: '落点',
  summon: '召唤',
};

const ENEMY_FLAVOR = {
  wolf: '成群出没的野狼，速度极快，贴上来就是一口。',
  bandit: '落草为寇的汉子，一嗓子战吼之后出手更狠。',
  mage: '穿蓝袍的术士，隔着老远扔火球，被贴身就软。',
  archer: '藏在树后的弓手，穿杨箭又快又直。',
  ogre: '一身横肉的巨汉，血厚拳重，走得不快。',
  ninja: '蒙面忍者，苦无配冲锋，飘忽难缠。',
  monk: '少林出身的和尚，护体功夫硬，回身一棍扫一片。',
  assassin: '红衣刺客，残血会狂暴，追杀最凶。',
  boss: '一方枭雄，金冠长戟，能召唤小弟围攻。',
  wulinMaster: '青衣背剑的江湖成名人物。神兵一旦落入旁人手中，他循着杀气赶到，只认持宝的人。',
  imperialGuard: '禁中带刀的铁甲护卫，红缨长戟。血厚功硬，善以雷霆与冷箭远袭，最爱偷袭持宝者。',
  xiexun: '金毛狮王，双目失明而听风辨位。开局一段时间后携屠龙刀与倚天剑现世，是双兵唯一的主人。双兵尽落他人之手时会空手化作复仇形态，比持兵时更凶。',
  zhangcuishan: '武当少侠，一柄长剑走轻灵路子。只在谢逊复仇形态随行返场：与师兄互不攻击，专挑师兄正在打的人下手，两人互相增益 —— 倒下的一方会让另一半失去羁绊加成。',
  juniorSister:
    '粉衣女剑客，被师父责罚时你替她顶了罪。奇遇「小师妹」入队后跟着你打人，也会替你挨刀，不掉战利品、不占刷怪上限。'
    + '她自己也练功：你每多一次抉择机会，她便自行挑一本秘籍领悟，学什么由她说了算，火候只有六成。'
    + '唯独《葵花宝典》她碰都不碰 —— 你若练了，她要么压根不入队，要么当场掩鼻下山。',
  woundedAlly: '布衣刀客，重伤倒在路边。你替他包扎，他便把命交给你：你重伤将死时替你挡下致命一击（仅一次，之后倒下）。',
  brat: '满地打滚的小童，被追上就放声大哭喊爹。零碎招式不成气候，麻烦的是他爹。',
  bratDad: '提刀从坡上冲下来的高等级侠客，护短到不讲道理。一旦出现就只认你，不会去打别人。',
  beggarElder: '草帽破衣的丐帮长老，见不得乔峰把棒法传给外人。学会《打狗棒法》之后，地图刷新时会小概率混进他的身影。',
  hongqigong: '白须老者，为一只叫花鸡能追你六十秒。追杀计时结束会骂骂咧咧走人 —— 撑过去就是白赚一份 60 秒的增益。',
};

/** 把 bonus 配置翻译成中文词条；mode 区分固定值 / 百分比加算 / 乘算差值 */
const RELIC_BONUS_LABEL = [
  { key: 'attackMultiplier', label: '攻势', mode: 'percent' },
  { key: 'maxHpFlat', label: '气血', mode: 'flat' },
  { key: 'defenseFlat', label: '防御', mode: 'flat' },
  { key: 'critBonus', label: '暴击', mode: 'percent' },
  { key: 'meleeBonus', label: '近战伤害', mode: 'percent' },
  { key: 'speedMultiplier', label: '移速', mode: 'delta' },
  { key: 'damageReduction', label: '减伤', mode: 'percent' },
  { key: 'cooldownMultiplier', label: '秘籍冷却', mode: 'percent' },
  { key: 'attackIntervalMultiplier', label: '出手间隔', mode: 'delta' },
  { key: 'dashCooldownMultiplier', label: '闪避冷却', mode: 'delta' },
];

const relicBonusText = (relic) => {
  const parts = [];
  RELIC_BONUS_LABEL.forEach((rule) => {
    const value = relic.bonus[rule.key];
    if (!value) {
      return;
    }
    if (rule.mode === 'flat') {
      parts.push(`${rule.label} +${value}`);
      return;
    }
    if (rule.mode === 'percent') {
      parts.push(`${rule.label} ${value > 0 ? '+' : ''}${Math.round(value * 100)}%`);
      return;
    }
    const delta = Math.round((value - 1) * 100);
    parts.push(`${rule.label} ${delta > 0 ? '+' : ''}${delta}%`);
  });
  return parts.join(' · ');
};

const relicCards = (ids) => {
  return ids.map((relicId) => {
    const relic = RELICS[relicId];
    return {
      name: relic.name,
      icon: relic.icon,
      key: relic.key,
      color: relic.color,
      description: relic.description,
      skill: relic.skill,
      bonusText: relicBonusText(relic),
    };
  });
};

const PAIR_TEXT = `同时持双兵 · ${PAIR_BONUS.description}`;

const roster = [
  { key: 'player', name: '你 · 剑客', tag: '玩家', color: PALETTE.playerRobe },
  ...ENEMY_TYPES.map((type) => ({
    key: type.id,
    name: type.name,
    tag: type.isCompanion
      ? '奇遇随从'
      : type.relicOwner
        ? '神兵之主'
        : type.relicHunter
          ? '神兵猎手'
          : type.isBondEscort
            ? '谢逊随从'
            : type.isBoss
              ? '首领'
              : `Lv.${type.minLevel}+`,
    color: type.color,
  })),
];

const stageRef = ref(null);
const canvasRef = ref(null);
const activeKey = ref('player');
const level = ref(8);
const mode = ref('cycle');
const stageLabel = ref(STAGE_LABEL.idle);
const view = ref({ kind: 'player', name: '你 · 剑客', subtitle: '', rows: [], skills: [], groups: [], relics: [], skillTotal: 0, intro: '' });

let context = null;
let entity = null;
let frameId = 0;
let lastTs = 0;
let clock = 0;
let stageTime = 0;
let stageName = 'idle';
let cycleIndex = 0;
let dpr = 1;
let viewWidth = 0;
let viewHeight = 0;

const round1 = (value) => Math.round(value * 10) / 10;

const buildSnapshot = () => {
  const target = entity;
  if (target.kind === 'player') {
    const normalSkill = (skill) => !skill.encounterOnly;
    const groups = ['outer', 'inner', 'light']
      .map((category) => ({
        title: SKILL_CATEGORY_LABEL[category],
        chips: PLAYER_SKILLS.filter((skill) => skill.category === category && normalSkill(skill)).map((skill) => ({
          name: skill.name,
          detail: skill.detail(1),
        })),
      }))
      .filter((group) => group.chips.length);
    // 奇遇专属秘籍：不进三选一池，只能靠奇遇传授
    const encounterChips = PLAYER_SKILLS.filter((skill) => skill.encounterOnly).map((skill) => {
      const shunnedNames = (skill.shunnedBy || [])
        .map((typeId) => getEnemyType(typeId))
        .filter(Boolean)
        .map((type) => type.name);
      const detail = shunnedNames.length ? `${skill.detail(1)} · ${shunnedNames.join('、')}见之掩鼻，练了便当场离队` : skill.detail(1);
      return { name: skill.name, detail };
    });
    if (encounterChips.length) {
      groups.push({ title: '奇遇绝学', chips: encounterChips });
    }
    return {
      kind: 'player',
      name: '你 · 剑客',
      subtitle: '江湖初入 · 无门无派',
      rows: [
        { label: '气血', value: Math.round(target.maxHp) },
        { label: '攻击', value: round1(target.attack) },
        { label: '防御', value: round1(target.defense) },
        { label: '移速', value: Math.round(target.speed) },
        { label: '体格', value: Math.round(target.radius) },
        { label: '出手间隔', value: `${target.attackInterval}s` },
        { label: '攻击距离', value: Math.round(target.attackRange) },
        { label: '暴击', value: `${Math.round(target.critRate * 100)}%` },
      ],
      skills: [],
      groups,
      relics: relicCards(RELIC_IDS),
      skillTotal: PLAYER_SKILLS.length,
      intro: `白衣佩刀，靠吞噬敌人修为一路向上：每升 5 级从三本秘籍中择一。普攻 ${BALANCE.PLAYER.attackMultiplier} 倍伤害，闪避冲刺自带无敌帧。谢逊现世后可争夺神兵，一旦换上就会招来满地图的猎杀者。${PAIR_TEXT}。路上还会遇到「奇遇」光环：二十七桩机缘，有些一步登天，有些一步归西。`,
    };
  }

  const type = getEnemyType(target.typeId);
  const skills = target.skills.map((slot) => {
    const config = ENEMY_SKILLS[slot.id] || {};
    return {
      name: config.name || slot.id,
      tag: SKILL_TYPE_LABEL[config.type] || '招式',
      desc: config.description || '',
      cd: round1(slot.cooldown),
      color: config.color || target.accent,
    };
  });
  const talent = (type.skillTags || []).map((tag) => ({ melee: '近战', ranged: '远程', agile: '身法', defense: '硬功', support: '回复', summon: '召唤' }[tag] || tag));
  const subtitle = type.isCompanion
    ? type.learnsManuals
      ? '奇遇随从 · 自修武功，她自己挑（火候六成）'
      : '奇遇随从 · 与你同阵、不占刷怪上限'
    : type.relicOwner
      ? '神兵之主 · 双兵随身'
      : type.relicHunter
        ? '神兵猎手 · 只认持宝的人'
        : type.isBondEscort
          ? '谢逊随从 · 与师兄互不攻击、集火同一目标'
          : type.isBoss
            ? '首领 · 一方枭雄'
            : `常规敌人 · 天赋 ${talent.join(' / ')}`;
  const shunned = shunnedManualNames(type.id);
  const selfGroups = type.learnsManuals
    ? [
        {
          title: '自修秘籍池（她自己挑，火候六成）',
          chips: PLAYER_SKILLS.filter((skill) => !(skill.shunnedBy || []).includes(type.id)).map((skill) => ({
            name: skill.name,
            detail: skill.detail(1),
          })),
        },
      ]
    : [];
  const selfRows = type.learnsManuals
    ? [
        { label: '自修火候', value: '六成' },
        { label: '入队忌讳', value: shunned.length ? `《${shunned.join('》《')}》` : '无' },
      ]
    : [];
  return {
    kind: 'enemy',
    name: `${type.name} · Lv.${target.level}`,
    subtitle,
    rows: [
      { label: '气血', value: Math.round(target.maxHp) },
      { label: '攻击', value: round1(target.attack) },
      { label: '防御', value: round1(target.defense) },
      { label: '移速', value: Math.round(target.speed) },
      { label: '体格', value: Math.round(target.radius) },
      { label: '出手间隔', value: `${round1(target.meleeInterval)}s` },
      { label: '攻击距离', value: Math.round(target.attackRange) },
      ...selfRows,
      { label: '刷新门槛', value: type.isCompanion ? '奇遇入队' : type.relicOwner ? '定时登场' : type.relicHunter ? '神兵现世后' : type.isBondEscort ? '谢逊复仇时随行' : type.alwaysHuntPlayer ? '奇遇具名登场' : type.isBoss ? '首领' : `Lv.${type.minLevel}` },
    ],
    skills,
    groups: selfGroups,
    relics: relicCards(type.relicOwner || []),
    skillTotal: 0,
    intro: type.learnsManuals
      ? `${ENEMY_FLAVOR[type.id] || ''}\n\n${companionLearningText(type.id)}`
      : ENEMY_FLAVOR[type.id] || '',
  };
};

const startStage = (name) => {
  stageName = name;
  stageTime = 0;
  stageLabel.value = STAGE_LABEL[name] || '';
  if (!entity) {
    return;
  }
  if (name === 'attack') {
    const duration = Math.min(0.4, Math.max(0.2, (entity.attackInterval || entity.meleeInterval || 0.8) * 0.44));
    entity.attackAnimDuration = duration;
    entity.attackAnimTimer = duration;
    entity.attackAnimAngle = entity.facing;
    entity.castAnimTimer = 0;
    entity.castAnimDuration = 0;
  } else if (name === 'cast') {
    entity.castAnimDuration = 0.44;
    entity.castAnimTimer = 0.44;
  }
};

const buildEntity = () => {
  entity = activeKey.value === 'player' ? createPlayer(1) : createEnemy(activeKey.value, level.value, 0, 0);
  entity.x = 0;
  entity.y = 0;
  // 头朝上展示（游戏内为俯视渲染，朝向只是旋转，不改变立绘本身）
  entity.facing = -Math.PI / 2;
  entity.hp = entity.maxHp;
  entity.moveAmount = 0;
  entity.walkPhase = 0;
  entity.attackAnimTimer = 0;
  entity.castAnimTimer = 0;
  stageTime = 0;
  cycleIndex = 0;
  startStage(mode.value === 'cycle' ? CYCLE[0] : mode.value);
  view.value = buildSnapshot();
};

const selectActor = (key) => {
  if (key === activeKey.value) {
    return;
  }
  activeKey.value = key;
  buildEntity();
};

const setMode = (id) => {
  mode.value = id;
  cycleIndex = 0;
  startStage(id === 'cycle' ? CYCLE[0] : id);
};

const onLevelInput = (event) => {
  level.value = Number(event.target.value) || 1;
  buildEntity();
};

/** 表现字段推进：与 core/world.js 的 walkPhase / moveAmount 写法保持一致 */
const applyAnim = (deltaTime) => {
  const actor = entity;
  const walking = stageName === 'walk';
  const target = walking ? 1 : 0;
  actor.moveAmount += (target - actor.moveAmount) * Math.min(1, deltaTime * 9);
  if (walking) {
    actor.walkPhase = (actor.walkPhase + (actor.speed || 180) * deltaTime * 0.075) % TAU;
  }
  if (actor.attackAnimTimer > 0) {
    actor.attackAnimTimer = Math.max(0, actor.attackAnimTimer - deltaTime);
  }
  if (actor.castAnimTimer > 0) {
    actor.castAnimTimer = Math.max(0, actor.castAnimTimer - deltaTime);
  }
};

const update = (deltaTime) => {
  clock += deltaTime;
  stageTime += deltaTime;
  const active = mode.value;

  if (active === 'cycle') {
    if (stageTime >= CYCLE_DURATION[stageName]) {
      cycleIndex = (cycleIndex + 1) % CYCLE.length;
      startStage(CYCLE[cycleIndex]);
    }
  } else if (stageName !== active) {
    startStage(active);
  } else if (active === 'attack' && stageTime > (entity.attackInterval || entity.meleeInterval || 1)) {
    startStage('attack');
  } else if (active === 'cast' && stageTime > 0.95) {
    startStage('cast');
  }

  applyAnim(deltaTime);
};

/** 展示台背景：地面网格 + 中心光柱 + 站台椭圆 */
const drawBackdrop = (cx, cy, radius, scale) => {
  context.fillStyle = '#12150f';
  context.fillRect(0, 0, viewWidth, viewHeight);

  const glow = context.createRadialGradient(cx, cy - viewHeight * 0.14, 8, cx, cy, viewHeight * 0.78);
  glow.addColorStop(0, 'rgba(255, 209, 102, 0.11)');
  glow.addColorStop(0.42, 'rgba(126, 154, 96, 0.07)');
  glow.addColorStop(1, 'rgba(10, 12, 8, 0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, viewWidth, viewHeight);

  context.strokeStyle = PALETTE.grid;
  context.lineWidth = 1;
  context.beginPath();
  for (let x = 0; x <= viewWidth; x += 48) {
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, viewHeight);
  }
  for (let y = 0; y <= viewHeight; y += 48) {
    context.moveTo(0, y + 0.5);
    context.lineTo(viewWidth, y + 0.5);
  }
  context.stroke();

  context.strokeStyle = 'rgba(198, 168, 108, 0.2)';
  context.lineWidth = 1.2;
  context.beginPath();
  context.ellipse(cx, cy + radius * 1.12 * scale, radius * 2.1 * scale, radius * 0.62 * scale, 0, 0, TAU);
  context.stroke();
  context.strokeStyle = 'rgba(198, 168, 108, 0.09)';
  context.beginPath();
  context.ellipse(cx, cy + radius * 1.12 * scale, radius * 2.6 * scale, radius * 0.8 * scale, 0, 0, TAU);
  context.stroke();
};

const render = () => {
  if (!context || !entity) {
    return;
  }
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const radius = entity.radius;
  const cx = viewWidth / 2;
  const cy = viewHeight * 0.545;
  const scale = Math.max(2, Math.min((viewHeight * 0.64) / (radius * 4.1), (viewWidth * 0.62) / (radius * 5.2)));

  drawBackdrop(cx, cy, radius, scale);

  const fakeWorld = { time: clock, player: entity };

  // 影子（世界坐标，随缩放）
  context.save();
  context.translate(cx, cy);
  context.scale(scale, scale);
  drawShadow(context, 0, 0, radius, entity.kind === 'player' ? 0.4 : 0.32);
  context.restore();

  // 脚环（屏幕像素尺度，避免缩放后线条过粗）
  const ringY = cy + radius * 0.32 * scale;
  const ringRadius = radius * 1.34 * scale;
  if (entity.kind === 'player') {
    drawFootRing(context, cx, ringY, ringRadius, 'rgba(0, 0, 0, 0.42)', 4.4);
    drawFootRing(context, cx, ringY, ringRadius, '#63d471', 3.2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2);
  } else {
    drawFootRing(context, cx, ringY, radius * 1.12 * scale, entity.isBoss ? 'rgba(255, 92, 92, 0.65)' : 'rgba(240, 236, 220, 0.5)', entity.isBoss ? 2.8 : 1.8);
    if (entity.isBoss) {
      const pulse = 0.35 + Math.sin(clock * 3) * 0.2;
      drawFootRing(context, cx, ringY, radius * 1.42 * scale, `rgba(255, 92, 92, ${pulse})`, 3);
    }
  }

  // 立绘（与游戏内完全同一套 drawActor）
  context.save();
  context.translate(cx, cy);
  context.scale(scale, scale);
  drawActor(context, entity, fakeWorld);
  context.restore();

  // 血条与等级（屏幕像素尺度）
  if (entity.kind === 'enemy') {
    const proxy = {
      x: cx,
      y: cy,
      radius: radius * scale * 2.1,
      hp: entity.hp,
      maxHp: entity.maxHp,
      level: entity.level,
    };
    drawHealthBar(context, proxy, Math.max(46, radius * 2.2 * scale * 0.42));
    context.font = `bold 11px ${FONT_FAMILY}`;
    drawLevelLabel(context, proxy);
  }
};

const loop = (timestamp) => {
  frameId = requestAnimationFrame(loop);
  if (!lastTs) {
    lastTs = timestamp;
  }
  const deltaTime = Math.min(0.05, Math.max(0.001, (timestamp - lastTs) / 1000));
  lastTs = timestamp;
  update(deltaTime);
  render();
};

const handleResize = () => {
  const canvas = canvasRef.value;
  const stage = stageRef.value;
  if (!canvas || !stage) {
    return;
  }
  const rect = stage.getBoundingClientRect();
  viewWidth = Math.max(180, Math.round(rect.width));
  viewHeight = Math.max(180, Math.round(rect.height));
  dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(viewWidth * dpr);
  canvas.height = Math.round(viewHeight * dpr);
  canvas.style.width = `${viewWidth}px`;
  canvas.style.height = `${viewHeight}px`;
  context = canvas.getContext('2d');
  render();
};

const onKeyDown = (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('back');
    return;
  }
  const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
  if (!step) {
    return;
  }
  event.preventDefault();
  const index = roster.findIndex((item) => item.key === activeKey.value);
  const next = (index + step + roster.length) % roster.length;
  selectActor(roster[next].key);
};

let observer = null;

onMounted(() => {
  handleResize();
  buildEntity();
  observer = new ResizeObserver(handleResize);
  if (stageRef.value) {
    observer.observe(stageRef.value);
  }
  window.addEventListener('keydown', onKeyDown);
  frameId = requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId);
  window.removeEventListener('keydown', onKeyDown);
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<style scoped lang="scss">
.gallery {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0d100a;
  color: #f4ecd8;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  overflow: hidden;
}

.gallery-head {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 14px 22px;
  border-bottom: 1px solid rgba(198, 168, 108, 0.18);
  background: linear-gradient(180deg, #1a1e14, #14170f);
}

.head-block {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.head-main {
  font-size: 19px;
  letter-spacing: 6px;
  color: #ffe9b8;
}

.head-sub {
  font-size: 10px;
  letter-spacing: 4px;
  color: rgba(198, 168, 108, 0.5);
}

.head-tip {
  flex: 1;
  font-size: 11px;
  letter-spacing: 1px;
  color: rgba(244, 236, 216, 0.35);
}

.back-btn {
  padding: 6px 20px;
  font-size: 12px;
  letter-spacing: 2px;
  color: #c6a86c;
  background: transparent;
  border: 1px solid rgba(198, 168, 108, 0.35);
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    color: #ffe9b8;
    border-color: rgba(198, 168, 108, 0.7);
  }
}

.gallery-body {
  flex: 1;
  min-height: 0;
  display: flex;
}

.roster {
  width: 208px;
  flex: 0 0 208px;
  padding: 14px 12px;
  overflow-y: auto;
  border-right: 1px solid rgba(198, 168, 108, 0.14);
  background: rgba(20, 23, 15, 0.7);
}

.roster-title {
  padding: 0 4px 10px;
  font-size: 11px;
  letter-spacing: 3px;
  color: rgba(198, 168, 108, 0.8);
  border-bottom: 1px solid rgba(198, 168, 108, 0.16);
}

.roster-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding: 8px 10px;
  font-size: 12px;
  color: rgba(244, 236, 216, 0.72);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    color: #ffe9b8;
  }

  &.active {
    background: rgba(255, 209, 102, 0.1);
    border-color: rgba(255, 209, 102, 0.42);
    color: #ffe9b8;
  }
}

.dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.22);
}

.r-name {
  flex: 1;
}

.r-tag {
  font-size: 10px;
  letter-spacing: 1px;
  color: rgba(198, 168, 108, 0.66);
}

.stage {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  background: #12150f;
}

.stage-canvas {
  position: absolute;
  inset: 0;
  display: block;
}

.stage-top {
  position: absolute;
  top: 16px;
  left: 20px;
  pointer-events: none;
}

.stage-name {
  font-size: 17px;
  letter-spacing: 3px;
  color: #ffe9b8;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}

.stage-sub {
  margin-top: 4px;
  font-size: 11px;
  letter-spacing: 1px;
  color: rgba(244, 236, 216, 0.42);
}

.stage-badge {
  position: absolute;
  top: 18px;
  right: 20px;
  padding: 4px 12px;
  font-size: 11px;
  letter-spacing: 1px;
  color: #8ef0d5;
  border: 1px solid rgba(142, 240, 213, 0.3);
  border-radius: 2px;
  background: rgba(10, 12, 8, 0.55);
  pointer-events: none;
}

.stage-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: linear-gradient(0deg, rgba(10, 12, 8, 0.92), rgba(10, 12, 8, 0));
}

.act-btn {
  padding: 6px 14px;
  font-size: 12px;
  letter-spacing: 1px;
  color: rgba(244, 236, 216, 0.62);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(198, 168, 108, 0.22);
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    color: #ffe9b8;
    border-color: rgba(198, 168, 108, 0.55);
  }

  &.active {
    color: #1a1508;
    background: linear-gradient(120deg, #ffd166, #e8b45a);
    border-color: transparent;
  }
}

.level-slot {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  letter-spacing: 1px;
  color: rgba(244, 236, 216, 0.5);

  input {
    width: 150px;
    flex: 0 0 150px;
    height: 3px;
    accent-color: #ffd166;
    cursor: pointer;
  }

  b {
    min-width: 46px;
    font-weight: 400;
    color: #ffd166;
  }
}

.info {
  width: 322px;
  flex: 0 0 322px;
  padding: 14px 16px 40px;
  overflow-y: auto;
  border-left: 1px solid rgba(198, 168, 108, 0.14);
  background: rgba(20, 23, 15, 0.7);
}

.info-block {
  margin-bottom: 20px;
}

.info-title {
  font-size: 11px;
  letter-spacing: 3px;
  color: rgba(198, 168, 108, 0.85);
  padding-bottom: 8px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(198, 168, 108, 0.16);
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
}

.stat-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 3px 6px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.025);
  border-left: 2px solid rgba(198, 168, 108, 0.3);
}

.stat-label {
  color: rgba(244, 236, 216, 0.45);
}

.stat-value {
  color: #ffe9b8;
  font-size: 12px;
}

.skill-card {
  margin-bottom: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-left: 2px solid rgba(255, 209, 102, 0.45);
}

.skill-head {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
}

.skill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.skill-name {
  color: #ffe9b8;
}

.skill-tag {
  font-size: 10px;
  padding: 1px 6px;
  color: #8ef0d5;
  border: 1px solid rgba(142, 240, 213, 0.28);
  border-radius: 2px;
}

.skill-cd {
  margin-left: auto;
  font-size: 10px;
  color: rgba(244, 236, 216, 0.4);
}

.skill-desc {
  margin-top: 5px;
  font-size: 11px;
  line-height: 1.7;
  color: rgba(244, 236, 216, 0.5);
}

.book-group {
  margin-bottom: 12px;
}

.book-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(244, 236, 216, 0.6);

  span {
    font-size: 10px;
    color: rgba(198, 168, 108, 0.6);
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.chip {
  padding: 2px 7px;
  font-size: 11px;
  color: rgba(244, 236, 216, 0.62);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(198, 168, 108, 0.16);
  border-radius: 2px;
  cursor: default;

  &:hover {
    color: #ffe9b8;
    border-color: rgba(198, 168, 108, 0.5);
  }
}

.relic-card {
  margin-bottom: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.035);
  border-left: 2px solid rgba(255, 209, 102, 0.6);
}

.relic-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.relic-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  border: 1px solid currentColor;
  border-radius: 2px;
}

.relic-name {
  font-size: 13px;
  letter-spacing: 1px;
}

.relic-key {
  margin-left: auto;
  font-size: 10px;
  color: rgba(244, 236, 216, 0.4);
}

.relic-desc {
  margin-top: 5px;
  font-size: 11px;
  line-height: 1.7;
  color: rgba(244, 236, 216, 0.5);
}

.relic-skill {
  margin-top: 6px;
  padding: 6px 8px;
  font-size: 11px;
  line-height: 1.7;
  color: rgba(244, 236, 216, 0.55);
  background: rgba(0, 0, 0, 0.25);

  b {
    display: block;
    margin-bottom: 2px;
    font-weight: 400;
    color: #ffe9b8;
  }
}

.relic-bonus {
  margin-top: 6px;
  font-size: 10px;
  line-height: 1.8;
  letter-spacing: 0.5px;
  color: rgba(142, 240, 213, 0.72);
}

.intro {
  margin: 0;
  font-size: 11px;
  line-height: 1.9;
  color: rgba(244, 236, 216, 0.48);
  padding-left: 10px;
  border-left: 2px solid rgba(224, 85, 69, 0.4);
  white-space: pre-line;
}
</style>
