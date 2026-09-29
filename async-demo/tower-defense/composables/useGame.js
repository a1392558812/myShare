// 塔防游戏状态机 / 主循环

import {
  GRID_SIZE, CELL, CANVAS_SIZE,
  PATH_A, PATH_B, PATH_A_POINTS, PATH_B_POINTS,
  getPointAtLength, getDirAtLength,
  isBuildable,
} from '../config/paths.js';
import {
  TOWER_DEFS, TOWER_KIND, TOWER_LIST, nextUpgradeCost, MOVE_COST_RATIO,
  isMaxLevel, displayLevel, maxDisplayLevel,
} from '../config/towers.js';
import { ENEMY_DEFS, ENEMY_KIND, BOSS_DEFS, ELITE } from '../config/enemies.js';
import {
  buildWavePlan, waveTheme, eliteRatio, WAVE_END_REWARD, BOSS_END_REWARD, LEAK_LIMIT,
  ENDLESS_K, ENDLESS_PERIOD, MAX_ALIVE_ENEMIES,
} from '../config/waves.js';
import {
  SKILL_DEFS, SKILL_LIST, SKILL_KIND, ASSIGNABLE_SKILLS, STACKABLE_SKILLS,
  isStackableSkill, HERO_GROWTH_PER_TECH_LEVEL,
  HERO_HP_BASE, HERO_SPEED, HERO_HITBOX,
} from '../config/skills.js';
import { rollRelicChoices, RELIC_KIND, RELIC_VALUES } from '../config/relics.js';

const BLOOD_PACT = SKILL_DEFS[SKILL_KIND.BLOOD_PACT];
// 满级（Lv6）= level 5
const BLOOD_PACT_MAX_LEVEL = (BLOOD_PACT.maxLevel || 6) - 1;

import { drawMap } from '../draw/drawMap.js';
import { drawTowers, drawSelectedTowerUI } from '../draw/drawTowers.js';
import { drawEnemies } from '../draw/drawEnemies.js';
import { drawHero, drawProjectiles, drawEffects } from '../draw/drawFx.js';
import { drawHud, drawDebugOverlay, drawBuildPanel, drawSelectedPanel } from '../draw/drawHud.js';

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a, b, t) => a + (b - a) * t;
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
// 隐身判定：单位本身是隐身种，或正处于「相位隐匿」窗口
const isStealth = (e) => !!(e.def.stealth || e.phaseHidden);

let nextId = 1;
const genId = () => nextId++;

const makeEnemy = (kind, path, multHp = 1, multDmg = 1, multSpeed = 1, endlessK = 0, elite = false) => {
  const def = ENEMY_DEFS[kind] || BOSS_DEFS.find((b) => b.kind === kind);
  const isBoss = kind.startsWith('boss');
  // 精英化：Boss 不走精英通道；属性缩放后体型与奖励同步提升
  const isElite = !!elite && !isBoss;
  const eHp = isElite ? ELITE.hpMult : 1;
  const eRw = isElite ? ELITE.rewardMult : 1;
  const eSp = isElite ? ELITE.speedMult : 1;
  const eSz = isElite ? ELITE.sizeMult : 1;
  const baseHp = def.hp * multHp * (1 + endlessK) * eHp;
  return {
    id: genId(),
    type: kind,
    kind: isBoss ? 'boss' : kind,
    def,
    path,
    t: 0,
    x: 0, y: 0,
    facing: path === 'A' ? 1 : -1,
    floatY: def.floatY || 0,
    alpha: def.alpha ?? 1,
    detected: false,
    hp: baseHp,
    maxHp: baseHp,
    speed: def.speed * multSpeed * eSp,
    // 精英奖励倍率会产生小数，必须取整，否则金币显示 +7.5
    reward: Math.round(def.reward * eRw),
    bounty: Math.round((def.bounty ?? def.reward) * eRw),
    size: def.size * eSz,
    elite: isElite,
    dead: false,
    escaped: false,
    lastHit: 0,
    summonTimer: def.summonInterval || 0,
    phaseHidden: false,
    stealthTimer: def.stealthCycle ? def.stealthCycle.period - def.stealthCycle.hiddenMs : 0,
    armor: def.armor ? { ...def.armor, broken: false } : null,
    tStart: 0,
    walkPhase: 0,
    engaged: false,
    attackCd: 0,
    slowFactor: 1,
    inFire: false,
    inPoison: false,
    dmgTakenAmp: 1,
    slowUntil: 0,
    slowAmount: 0,
    // 冲锋兵：冲刺计时
    chargeTimer: def.charge ? def.charge.period - def.charge.dashMs : 0,
    charging: false,
    // 巫医：治疗光环计时
    healTimer: def.healAura ? def.healAura.interval : 0,
    // 分裂怪：标记是否已分裂，避免重复触发
    hasSplit: false,
  };
};

const makeTower = (kind, gx, gy) => {
  const def = TOWER_DEFS[kind];
  return {
    id: genId(),
    kind,
    def,
    gx, gy,
    level: 0,
    cd: 0,
    turretAngle: 0,
    auraTick: 0,
    lastShot: 0,
    techCharge: 0,
    missileTimer: 0,
    poisonTimer: 0,
    resupplyTimer: 0,
    spawnNow: 0,
    // 兵营集结点（格子坐标；null = 默认塔位）
    rally: null,
    // 科技前哨站已分配的技能
    skillKind: null,
    hp: kind === 'tech' ? 200 : 100,
    maxHp: kind === 'tech' ? 200 : 100,
  };
};

const HERO_ATTACK_RANGE = 84;
const HERO_ATTACK_INTERVAL = 480;
// 单局塔移动次数上限（遗物「迁跃符」在此基础上 +4，重开时需还原）
const DEFAULT_MOVE_LIMIT = 8;

// 治疗药水：30 金/瓶，恢复 30 HP；每局购买上限 + 使用冷却
export const POTION = {
  cost: 30,
  heal: 30,
  maxStock: 5,       // 同时最多持有 5 瓶，逼玩家提前规划而不是临死狂买
  useCooldown: 1500, // 使用冷却，避免连续瞬回
};
const HERO_ATTACK_DMG = 18;
const HERO_BLOCK_DIST = 32;
// 敌人近身英雄才停下攻击（肉搏距离 ≈ 敌人半径6 + 英雄半径14 + 缓冲）；避免「英雄隔空能打、敌人却提前停」
const HERO_AGGRO_DIST = 28;
// 小兵阻挡距离（= 一格）：地面敌人进入该范围即停下攻击小兵
// 飞行单位（含飞行 Boss）不受小兵阻挡 兵营对空无拖延作用
const SUMMON_BLOCK_DIST = CELL;
const makeHero = () => ({
  x: 11 * CELL, y: 11 * CELL,
  vx: 0, vy: 0,
  facing: 1,
  hp: HERO_HP_BASE, maxHp: HERO_HP_BASE,
  immortal: false, beamActive: false, beamAngle: 0, beamLength: 0,
  hitCooldown: 0,
  attackCd: 0,
  attackRange: HERO_ATTACK_RANGE,
  attackDmg: HERO_ATTACK_DMG,
  attackInterval: HERO_ATTACK_INTERVAL,
  walkPhase: 0,
  // 血契加成（由 recomputeHeroStats 刷新）
  damageReduction: 0,
  bonusHp: 0,
  lifesteal: 0,
  invulnUntil: 0,
  reviveCount: 0,
});

const makeSkillInstance = (def) => ({
  def,
  name: def.name,
  cooldown: def.cooldown,
  cooldownLeft: 0,
  level: 0,
  unlocked: !!def.unlockedByDefault,
  // 起始技能占技能键 1；其余由 assignTechSkill 按解锁顺序分配 2/3/4/5
  key: def.unlockedByDefault ? '1' : '',
});

const EMPTY_BLOOD_PACT = { hp: 0, dr: 0, lifesteal: 0, stacks: 0, revives: 0 };

export const createGame = (canvas, opts = {}) => {
  const ctx = canvas.getContext('2d');
  const W = CANVAS_SIZE;
  const H = CANVAS_SIZE;

  const state = {
    width: W, height: H, dpr: 1,
    time: 0, dt: 0,
    gold: opts.startGold ?? 200,
    // 可调配置（调试面板）
    startGold: opts.startGold ?? 200,
    enemySpeedK: opts.enemySpeedK ?? 1,
    heroHpK: opts.heroHpK ?? 1,
    leakLimit: opts.leakLimit ?? LEAK_LIMIT,
    wave: 0,
    maxWave: 30,
    endless: false,
    endlessK: 0,
    waveActive: false,
    waveCountdown: 12,
    leak: 0,
    killed: 0,
    gameOver: false,
    victory: false,
    paused: false,
    showDebug: false,
    moveCount: 0,
    moveLimit: DEFAULT_MOVE_LIMIT,
    moveSelected: null,
    setRallyMode: false,
    hoveredCell: null,
    hoveredTower: null,
    selectedTower: null,
    selectedBuildKind: null,
    mouseScreen: { x: 0, y: 0 },
    mouseWorld: { x: 0, y: 0 },
    keys: new Set(),
    towers: [],
    enemies: [],
    projectiles: [],
    summons: [],
    fx: [],
    fireZones: [],
    poisonZones: [],
    // 治愈之风：状态驱动的持续回血队列（替代 setInterval，暂停/重开自动失效）
    healTicks: [],
    hero: makeHero(),
    skills: [],
    // 血契叠加加成（由 recomputeHeroStats 刷新）
    bloodPact: { ...EMPTY_BLOOD_PACT },
    spawnQueue: [],
    // 治疗药水：库存制，购买后按需使用
    potions: 0,
    relics: [],
    // 遗物选择：Boss 击杀后挂起三选一，非 null 时游戏暂停
    pendingRelic: null,
    message: null,
    debug: {
      frame: 0, fps: 0,
      enemyCount: 0, towerCount: 0, summonCount: 0, projectileCount: 0,
    },
    towerDefs: TOWER_DEFS,
  };
  SKILL_LIST.forEach((def) => state.skills.push(makeSkillInstance(def)));

  const collectReward = (enemy) => {
    const bonus = relicEffects().goldPerKill;
    const total = Math.round(enemy.reward + bonus);
    state.gold += total;
    state.killed++;
    spawnFx({ kind: 'text', x: enemy.x, y: enemy.y, text: `+${total}`, color: bonus ? '#facc15' : '#fbbf24' });
  };

  // 统一伤害入口：处理暴击遗物 + 斩杀遗物
  // 返回实际造成的伤害（已含护甲/增伤修正前的暴击倍率）
  const rollDamage = (rawDmg) => {
    const crit = relicEffects().critChance;
    if (crit > 0 && Math.random() < crit) return rawDmg * 2;
    return rawDmg;
  };

  // 命中后结算：斩杀阈值判定 + 死亡标记
  const settleDamage = (e) => {
    const th = relicEffects().executeThreshold;
    if (th > 0 && e.hp > 0 && e.hp <= e.maxHp * th) {
      e.hp = 0;
      spawnFx({ kind: 'execute', x: e.x, y: e.y, life: 300 });
    }
    if (e.hp <= 0 && !e.dead) e.dead = true;
  };

  const spawnFx = (fx) => {
    fx.t = 0;
    fx.life = fx.life ?? 600;
    state.fx.push(fx);
  };

  const showMessage = (text, color = '#fbbf24', life = 1500) => {
    state.message = { text, color, t: 0, life };
  };

  // 应用调试面板配置：速度/血量/漏怪上限即时生效，起始金币下次重开生效
  const applyConfig = (cfg = {}) => {
    if (Number.isFinite(cfg.startGold)) state.startGold = cfg.startGold;
    if (Number.isFinite(cfg.enemySpeedK)) state.enemySpeedK = cfg.enemySpeedK;
    if (Number.isFinite(cfg.heroHpK)) state.heroHpK = cfg.heroHpK;
    if (Number.isFinite(cfg.leakLimit)) state.leakLimit = cfg.leakLimit;
    recomputeHeroStats();
  };

  // 技能是否满级（level 从 0 起，maxLevel-1 即「满级/6 级」）
  const isSkillMax = (sk) => sk.unlocked && sk.level >= (sk.def.maxLevel || 5) - 1;

  // 当前生效的光环（满级技能）
  const getActiveAuras = () =>
    state.skills.filter((sk) => isSkillMax(sk) && sk.def.aura6);

  const hasAura = (kind) => getActiveAuras().some((sk) => sk.def.kind === kind);

  const getAura = (kind) => {
    const sk = getActiveAuras().find((s) => s.def.kind === kind);
    return sk && sk.def.aura6;
  };

  // 科技前哨站等级总和（驱动英雄属性成长）
  const techLevelSum = () =>
    state.towers
      .filter((t) => t.kind === TOWER_KIND.TECH)
      .reduce((sum, t) => sum + t.level, 0);

  // ===== 血契：可叠加的前哨站被动技能 =====
  // 每座缔结血契的前哨站按自身等级贡献加成，全部相加
  // 额外生命无上限；减伤 / 吸血有上限；每座满级（Lv6）血契塔提供 1 次复活
  const bloodPactTowers = () =>
    state.towers.filter((t) => t.kind === TOWER_KIND.TECH && t.skillKind === SKILL_KIND.BLOOD_PACT);

  const computeBloodPact = () => {
    const b = BLOOD_PACT.heroBonus;
    const cap = BLOOD_PACT.bonusCap;
    let hp = 0, dr = 0, ls = 0, revives = 0;
    const towers = bloodPactTowers();
    for (const t of towers) {
      const i = clamp(t.level, 0, b.hp.length - 1);
      hp += b.hp[i];
      dr += b.dr[Math.min(i, b.dr.length - 1)];
      ls += b.lifesteal[Math.min(i, b.lifesteal.length - 1)];
      if (t.level >= BLOOD_PACT_MAX_LEVEL) revives++;
    }
    return {
      hp,
      dr: Math.min(dr, cap.dr),
      lifesteal: Math.min(ls, cap.lifesteal),
      stacks: towers.length,
      revives,
    };
  };

  // 重算英雄属性成长（随科技前哨站升级 + 血契叠加提升）
  const recomputeHeroStats = () => {
    const h = state.hero;
    const growth = techLevelSum();
    const g = HERO_GROWTH_PER_TECH_LEVEL;
    const pact = computeBloodPact();
    state.bloodPact = pact;
    h.bonusHp = pact.hp;
    h.damageReduction = pact.dr;
    h.lifesteal = pact.lifesteal;
    h.reviveCount = pact.revives;
    // 不灭心核必须并入这里：本函数每帧调用，在外部直接改 maxHp 会被覆盖回原值
    const newMax = HERO_HP_BASE * (state.heroHpK || 1) + growth * (g.hp || 0)
      + pact.hp + relicEffects().heroHpBonus;
    const oldMax = h.maxHp;
    if (newMax !== oldMax) {
      const ratio = oldMax > 0 ? h.hp / oldMax : 1;
      h.maxHp = newMax;
      // 上限提升时同步补血（等价于「+N 上限并回复 N」）；上限下降时按比例保留
      h.hp = newMax > oldMax
        ? clamp(h.hp + (newMax - oldMax), 0, newMax)
        : clamp(Math.round(newMax * ratio), 0, newMax);
    }
    h.attackDmg = HERO_ATTACK_DMG + growth * (g.dmg || 0);
    h.attackInterval = Math.max(220, HERO_ATTACK_INTERVAL + growth * (g.interval || 0));
  };

  // 血契复活：消耗一座满级血契前哨站（塔被摧毁，其加成随之消失）
  const consumePactRevive = () => {
    const target = bloodPactTowers()
      .filter((t) => t.level >= BLOOD_PACT_MAX_LEVEL)
      .sort((a, b) => a.level - b.level || a.id - b.id)[0];
    if (!target) return false;
    const px = target.gx * CELL + CELL / 2;
    const py = target.gy * CELL + CELL / 2;
    state.towers = state.towers.filter((t) => t !== target);
    if (state.selectedTower === target) state.selectedTower = null;
    if (state.moveSelected === target) state.moveSelected = null;
    state.fx.push({ kind: 'hit', x: px, y: py, color: '#f472b6', life: 600 });
    state.fx.push({ kind: 'text', x: px, y: py, text: '血契破碎', color: '#f472b6' });
    syncTechSkillLevel();
    recomputeHeroStats();
    const h = state.hero;
    h.hp = Math.max(1, Math.round(h.maxHp * (BLOOD_PACT.reviveHpRatio || 0.6)));
    h.invulnUntil = state.time + (BLOOD_PACT.reviveInvulnMs || 1500);
    showMessage('血契生效！英雄复活（消耗 1 座满级前哨站）', '#f472b6', 2600);
    return true;
  };

  // 将技能等级同步为同技能科技前哨站的最高等级
  const syncTechSkillLevel = () => {
    for (const sk of state.skills) {
      if (sk.def.kind === 'shockwave') continue;
      const maxLvl = state.towers
        .filter((t) => t.kind === TOWER_KIND.TECH && t.skillKind === sk.def.kind)
        .reduce((m, t) => Math.max(m, t.level), -1);
      if (maxLvl >= 0) sk.level = maxLvl;
    }
  };

  // 给科技前哨站分配技能（并解锁对应英雄技能）
  // 互斥技能：一座前哨站选了 A，其他前哨站不能再选 A
  // 叠加技能（血契）：任意多座前哨站都能选，加成累加
  const assignTechSkill = (tower, skillKind) => {
    if (tower.kind !== TOWER_KIND.TECH) return false;
    if (!isStackableSkill(skillKind)) {
      const taken = state.towers.some(
        (t) => t !== tower && t.kind === TOWER_KIND.TECH && t.skillKind === skillKind,
      );
      if (taken) {
        showMessage(`${SKILL_DEFS[skillKind]?.name || skillKind} 已被其他前哨站占用`, '#ef4444', 1600);
        return false;
      }
    }
    tower.skillKind = skillKind;
    const sk = state.skills.find((s) => s.def.kind === skillKind);
    if (sk && sk.def.passive) {
      // 被动技能不解锁主动技能
      syncTechSkillLevel();
      recomputeHeroStats();
      showMessage(`缔结${sk.name}（当前 ${computeBloodPact().stacks} 重）`, '#f472b6', 1800);
      return true;
    }
    if (sk && !sk.unlocked) {
      sk.unlocked = true;
      const usedKeys = new Set(state.skills.filter((s) => s.unlocked && s.key).map((s) => s.key));
      const slot = ['1', '2', '3', '4', '5'].find((k) => !usedKeys.has(k));
      if (slot) sk.key = slot;
      showMessage(`解锁技能：${sk.name} [${slot}]`, '#22c55e', 2000);
    }
    syncTechSkillLevel();
    recomputeHeroStats();
    return true;
  };

  // 移除某座兵营旗下的全部小兵（出售 / 搬迁时调用）
  const removeSummonsOfTower = (towerId) => {
    if (!state.summons.length) return;
    state.summons = state.summons.filter((s) => s.towerId !== towerId);
  };

  // 出售塔（含清理旗下小兵）
  const sellTower = (t) => {
    if (!t) return false;
    // 回响契约：出售返还 100%
    const ratio = relicEffects().sellRefundFull ? 1 : t.def.sellRefund;
    const refund = ((t.def.cost + t.def.upgradeCost.slice(0, t.level).reduce((a, b) => a + b, 0)) * ratio) | 0;
    state.gold += refund;
    state.towers = state.towers.filter((tw) => tw !== t);
    removeSummonsOfTower(t.id);
    if (state.selectedTower === t) state.selectedTower = null;
    if (state.moveSelected === t) state.moveSelected = null;
    syncTechSkillLevel();
    recomputeHeroStats();
    showMessage(`出售 ${t.def.name} +💰${refund}`, '#94a3b8', 900);
    return true;
  };

  // 升级塔（统一入口：满级 / 金币不足都会给出提示）
  const upgradeTower = (t) => {
    if (!t) return false;
    const cur = displayLevel(t);
    const max = maxDisplayLevel(t.kind);
    if (isMaxLevel(t.kind, t.level)) {
      showMessage(`${t.def.name} 已满级 Lv${max}`, '#94a3b8', 1000);
      return false;
    }
    const cost = nextUpgradeCost(t.kind, t.level);
    if (!Number.isFinite(cost)) {
      showMessage(`${t.def.name} 已满级 Lv${max}`, '#94a3b8', 1000);
      return false;
    }
    if (state.gold < cost) {
      showMessage(`金币不足，升级需 💰${cost}`, '#ef4444', 1100);
      return false;
    }
    state.gold -= cost;
    t.level++;
    if (t.kind === TOWER_KIND.BARRACKS) t.spawnNow += t.def.summonPerLevel;
    syncTechSkillLevel();
    recomputeHeroStats();
    showMessage(`${t.def.name} Lv${cur} → Lv${displayLevel(t)}`, '#22c55e', 1000);
    return true;
  };

  // 更新火焰灼烧区 / 毒雾区：给范围内的敌人打标记 + 结算伤害/减速
  const updateZones = (dtMs) => {
    for (const e of state.enemies) {
      e.inFire = false;
      e.inPoison = false;
      e.slowFactor = 1;
      e.dmgTakenAmp = 1;
      // 科技前哨站减速 debuff
      // 配置值是「减速百分比」（Lv3=30% → Lv6=50%），速度倍率要取 1-x
      if (state.time < (e.slowUntil || 0)) e.slowFactor = Math.min(e.slowFactor, 1 - (e.slowAmount || 0.5));
    }
    for (const z of state.fireZones) {
      z.age = (z.age || 0) + dtMs;
      for (const e of state.enemies) {
        if (e.dead || e.escaped) continue;
        if (dist2(e.x, e.y, z.x, z.y) <= z.radius * z.radius) {
          e.inFire = true;
          // 同上：z.slow 是减速百分比（40%），倍率取 1-x
          e.slowFactor = Math.min(e.slowFactor, 1 - (z.slow || 0.4));
          e.hp -= z.dps * (dtMs / 1000);
          e.lastHit = state.time;
          if (e.hp <= 0 && !e.dead) e.dead = true;
        }
      }
    }
    for (const z of state.poisonZones) {
      z.age = (z.age || 0) + dtMs;
      for (const e of state.enemies) {
        if (e.dead || e.escaped) continue;
        if (dist2(e.x, e.y, z.x, z.y) <= z.radius * z.radius) {
          e.inPoison = true;
          e.dmgTakenAmp = Math.max(e.dmgTakenAmp, z.dmgAmp || 1.35);
          if (z.dps) {
            e.hp -= z.dps * (dtMs / 1000);
            e.lastHit = state.time;
            if (e.hp <= 0 && !e.dead) e.dead = true;
          }
        }
      }
    }
    state.fireZones = state.fireZones.filter((z) => z.age < z.duration);
    state.poisonZones = state.poisonZones.filter((z) => z.age < z.duration);
  };

  // 治愈之风：按游戏时间结算塔的持续回血（暂停/重开随 update 早退自动失效）
  const updateHealTicks = (dtMs) => {
    if (!state.healTicks.length) return;
    const sec = dtMs / 1000;
    for (const p of state.healTicks) {
      const t = state.towers.find((x) => x.id === p.towerId);
      if (t) t.hp = Math.min(t.maxHp, t.hp + p.hpPerSec * sec);
      p.remain -= dtMs;
    }
    state.healTicks = state.healTicks.filter((p) => p.remain > 0);
  };

  const advanceEnemies = (dtMs) => {
    const h = state.hero;
    const heroBlocks = new Set();
    for (const key of ['A', 'B']) {
      const path = key === 'A' ? PATH_A : PATH_B;
      let minD = Infinity;
      for (let i = 0; i < path.px.length; i++) {
        const [px, py] = path.px[i];
        const d = (px - h.x) * (px - h.x) + (py - h.y) * (py - h.y);
        if (d < minD) minD = d;
      }
      if (Math.sqrt(minD) < HERO_BLOCK_DIST && !h.immortal) heroBlocks.add(key);
    }

    // 寒霜领域：全局减速（每帧算一次，避免逐敌重复计算）
    const slowAuraMult = 1 - relicEffects().slowAura;

    for (const e of state.enemies) {
      if (e.dead || e.escaped) continue;
      e.attackCd = Math.max(0, (e.attackCd || 0) - dtMs);

      const path = e.path === 'A' ? PATH_A : PATH_B;
      const dxh = e.x - h.x;
      const dyh = e.y - h.y;
      const dh = Math.hypot(dxh, dyh);
      const heroBlocksHere = heroBlocks.has(e.path) && dh <= HERO_AGGRO_DIST;

      // 最近的小兵：地面敌人会被小兵阻挡并停下攻击，飞行敌人直接越过地面小兵
      let blockSummon = null;
      let blockSummonD = Infinity;
      if (!e.def.flying) {
        for (const s of state.summons) {
          if (s.dead) continue;
          const d = dist2(e.x, e.y, s.x, s.y);
          if (d < blockSummonD) { blockSummonD = d; blockSummon = s; }
        }
      }
      const summonBlocks = blockSummon && Math.sqrt(blockSummonD) <= SUMMON_BLOCK_DIST;

      const engaged = heroBlocksHere || !!summonBlocks;
      e.engaged = engaged;

      if (engaged) {
        if (e.attackCd <= 0) {
          const dmg = e.kind === 'boss' ? 10 : 4;
          e.attackCd = e.kind === 'boss' ? 1100 : 700;
          // 谁离得更近就先打谁（小兵在前线，通常先替英雄挡刀）
          if (summonBlocks && (!heroBlocksHere || blockSummonD < dh * dh)) {
            blockSummon.hp -= dmg;
            state.fx.push({ kind: 'hit', x: blockSummon.x, y: blockSummon.y, color: e.def.color, life: 240 });
            if (blockSummon.hp <= 0) blockSummon.dead = true;
          } else if (state.time < (h.invulnUntil || 0)) {
            // 血契复活后的短暂无敌
            state.fx.push({ kind: 'hit', x: h.x, y: h.y, color: '#f472b6', life: 200 });
          } else {
            // 血契减伤（有上限）
            const real = Math.max(1, Math.round(dmg * (1 - (h.damageReduction || 0))));
            h.hp -= real;
            h.lastHit = state.time;
            state.fx.push({ kind: 'hit', x: h.x, y: h.y, color: e.def.color, life: 240 });
            if (h.hp <= 0) {
              // 满级血契前哨站可替英雄抵命一次
              if (consumePactRevive()) return;
              h.hp = 0;
              state.gameOver = true;
              showMessage('失败！英雄阵亡', '#ef4444', 3000);
              return;
            }
          }
        }
      } else {
        // 冲锋兵冲刺期间额外提速；寒霜领域提供全局减速
        e.t = (e.t || 0) + e.speed * e.slowFactor * (e.chargeMult || 1) * slowAuraMult * (dtMs / 1000);
      }

      const moved = engaged ? 0 : e.speed * e.slowFactor * (e.chargeMult || 1) * slowAuraMult * (dtMs / 1000);
      e.walkPhase = (e.walkPhase || 0) + moved * 0.18;
      if (engaged) e.walkPhase *= 0.85;

      const p = getPointAtLength(path, e.t);
      e.x = p.x; e.y = p.y;
      const dir = getDirAtLength(path, e.t);
      if (Math.abs(dir.x) > 0.3) e.facing = dir.x < 0 ? -1 : 1;
      if (isStealth(e)) {
        e.alpha = e.detected ? lerp(e.alpha, 1, 0.1) : lerp(e.alpha, 0.25, 0.05);
      } else if (e.alpha < 1) {
        e.alpha = lerp(e.alpha, 1, 0.08);
      }
      // 相位隐匿：周期性隐身，隐身期间只有反隐塔能锁定
      if (e.def.stealthCycle && !e.dead) {
        e.stealthTimer -= dtMs;
        if (e.stealthTimer <= 0) {
          e.phaseHidden = !e.phaseHidden;
          e.stealthTimer = e.phaseHidden
            ? e.def.stealthCycle.hiddenMs
            : e.def.stealthCycle.period - e.def.stealthCycle.hiddenMs;
          if (e.phaseHidden) showMessage(`${e.def.name} 相位隐匿！`, '#a78bfa', 1200);
        }
      }
      if (e.def.summonInterval && e.kind === 'boss' && !e.dead) {
        e.summonTimer -= dtMs;
        if (e.summonTimer <= 0) {
          e.summonTimer = e.def.summonInterval;
          const groups = e.def.summonGroups
            || [{ kind: e.def.summonKind, count: e.def.summonCount || 1 }];
          // 同屏已达软上限时跳过召唤，避免无尽模式小怪无限堆积
          let room = MAX_ALIVE_ENEMIES - state.enemies.length;
          for (const g of groups) {
            for (let i = 0; i < g.count && room > 0; i++, room--) {
              const sub = makeEnemy(g.kind, e.path, 1, 1, state.enemySpeedK || 1, state.endlessK);
              sub.t = e.t + 24;
              const sp = getPointAtLength(path, sub.t);
              sub.x = sp.x; sub.y = sp.y;
              state.enemies.push(sub);
            }
          }
          showMessage(`${e.def.name} 召唤小怪！`, '#ef4444', 1200);
        }
      }
      if (e.armor && !e.armor.broken) {
        e.armor.elapsed = (e.armor.elapsed || 0) + dtMs;
        // 常驻减伤（装甲兵）没有 preSeconds，永不破甲
        if (e.armor.preSeconds != null && e.armor.elapsed >= e.armor.preSeconds * 1000) {
          e.armor.broken = true;
        }
      }
      // 冲锋兵：周期性冲刺提速，冷却后恢复常速
      if (e.def.charge && !e.dead && !engaged) {
        e.chargeTimer -= dtMs;
        if (e.chargeTimer <= 0) {
          e.charging = !e.charging;
          e.chargeTimer = e.charging
            ? e.def.charge.dashMs
            : e.def.charge.period - e.def.charge.dashMs;
        }
        // 冲刺期间额外提速（叠加在当前 speed 上，由下方推进逻辑读取）
        e.chargeMult = e.charging ? e.def.charge.speedMult : 1;
      }
      // 巫医：周期性治疗范围内的其他敌人
      if (e.def.healAura && !e.dead) {
        e.healTimer -= dtMs;
        if (e.healTimer <= 0) {
          e.healTimer = e.def.healAura.interval;
          const a = e.def.healAura;
          const r2 = a.range * a.range;
          let healed = 0;
          for (const o of state.enemies) {
            if (o === e || o.dead || o.escaped) continue;
            if (o.hp >= o.maxHp) continue;
            if (dist2(o.x, o.y, e.x, e.y) > r2) continue;
            o.hp = Math.min(o.maxHp, o.hp + a.amount);
            healed++;
          }
          if (healed) {
            state.fx.push({ kind: 'healAura', x: e.x, y: e.y, radius: a.range, life: 400 });
          }
        }
      }
      if (e.t >= path.totalLen - 1) {
        e.escaped = true;
        state.leak++;
        if (state.leak >= state.leakLimit && !state.gameOver) {
          state.gameOver = true;
          showMessage('失败！漏怪过多', '#ef4444', 3000);
        }
      }
    }

    // 分裂怪：死亡时分裂出小怪（放在循环外，避免遍历中改数组）
    const spawned = [];
    for (const e of state.enemies) {
      if (!e.dead || e.hasSplit || !e.def.split) continue;
      e.hasSplit = true;
      const s = e.def.split;
      let room = MAX_ALIVE_ENEMIES - state.enemies.length;
      for (let i = 0; i < s.count && room > 0; i++, room--) {
        const sub = makeEnemy(s.kind, e.path, s.hpMult, 1, s.speedMult, state.endlessK);
        sub.t = e.t - i * 10;
        const sp = getPointAtLength(e.path === 'A' ? PATH_A : PATH_B, Math.max(0, sub.t));
        sub.x = sp.x; sub.y = sp.y;
        sub.bounty = s.bounty ?? 2;
        sub.reward = s.bounty ?? 2;
        spawned.push(sub);
        state.fx.push({ kind: 'split', x: e.x, y: e.y, life: 300 });
      }
    }
    if (spawned.length) state.enemies.push(...spawned);

    for (const e of state.enemies) {
      if (!e.dead && !e.escaped) continue;
      if (e.dead && !e.rewarded) { collectReward(e); e.rewarded = true; }
    }
    state.enemies = state.enemies.filter((e) => !e.dead && !e.escaped);
  };

  const updateTowers = (dtMs) => {
    state.enemies.forEach((e) => { if (!isStealth(e)) return; e.detected = false; });

    // 反隐塔：侦测 + 毒雾（三级解锁）
    for (const t of state.towers) {
      if (t.kind !== TOWER_KIND.DETECTOR) continue;
      const range = t.def.range[t.level];
      const cx = t.gx * CELL + CELL / 2;
      const cy = t.gy * CELL + CELL / 2;
      for (const e of state.enemies) {
        if (!isStealth(e) || e.dead) continue;
        if (dist2(e.x, e.y, cx, cy) <= range * range) e.detected = true;
      }
      if (t.level >= 2) {
        t.poisonTimer = Math.max(0, (t.poisonTimer || 0) - dtMs);
        if (t.poisonTimer <= 0) {
          t.poisonTimer = t.def.poisonInterval[t.level];
          const target = state.enemies.find((e) => !e.dead && !e.escaped && (e.detected || !isStealth(e)));
          const zx = target ? target.x : cx;
          const zy = target ? target.y : cy;
          state.poisonZones.push({
            x: zx, y: zy,
            radius: t.def.poisonRadius[t.level],
            duration: t.def.poisonDuration,
            dmgAmp: t.def.poisonDmgAmp[t.level],
            dps: t.def.poisonDps[t.level],
            age: 0,
          });
          spawnFx({ kind: 'poison', x: zx, y: zy, radius: t.def.poisonRadius[t.level], life: 600 });
        }
      }
    }

    const hero = state.hero;
    const auraAtk = getAura('arrowRain');

    for (const t of state.towers) {
      // 疾风齿轮：全塔攻速加成（冷却递减更快）
      t.cd = Math.max(0, t.cd - dtMs * relicEffects().towerSpeedMult);
      t.auraTick = (t.auraTick || 0) + dtMs;

      // 科技前哨站：三级起攻击 + 减速
      if (t.kind === TOWER_KIND.TECH && t.level >= 2) {
        const techTarget = pickTarget(t);
        if (techTarget) {
          const dx = techTarget.x - (t.gx * CELL + CELL / 2);
          const dy = techTarget.y - (t.gy * CELL + CELL / 2);
          t.turretAngle = Math.atan2(dy, dx);
          if (t.cd <= 0) fireTower(t, techTarget);
        }
      }

      // 大炮：洲际导弹（三级解锁）
      if (t.kind === TOWER_KIND.CANNON && t.level >= 2) {
        t.missileTimer = Math.max(0, (t.missileTimer || 0) - dtMs);
        if (t.missileTimer <= 0) {
          const mtarget = pickMissileTarget(t);
          if (mtarget) {
            fireMissile(t, mtarget);
            t.missileTimer = t.def.missileInterval[t.level];
          }
        }
      }

      // 普通攻击（兵营 / 科技前哨站各自有专属逻辑）
      if (t.kind !== TOWER_KIND.BARRACKS && t.kind !== TOWER_KIND.TECH) {
        const target = pickTarget(t);
        if (target) {
          const dx = target.x - (t.gx * CELL + CELL / 2);
          const dy = target.y - (t.gy * CELL + CELL / 2);
          t.turretAngle = Math.atan2(dy, dx);
          if (t.cd <= 0) fireTower(t, target);
        }
      }

      // 攻速光环：英雄范围内建筑攻速提升
      if (auraAtk) {
        const tc = t.gx * CELL + CELL / 2;
        const ty = t.gy * CELL + CELL / 2;
        if (dist2(tc, ty, hero.x, hero.y) <= auraAtk.range * auraAtk.range) {
          t.cd = Math.max(0, t.cd - dtMs * auraAtk.atkSpeedBoost);
        }
      }
    }
  };

  const pickTarget = (t) => {
    const cx = t.gx * CELL + CELL / 2;
    const cy = t.gy * CELL + CELL / 2;
    let range = 0;
    if (t.kind === TOWER_KIND.BARRACKS) range = t.def.summonRange;
    else if (t.kind === TOWER_KIND.CANNON || t.kind === TOWER_KIND.ARROW) range = t.def.range[t.level];
    else if (t.kind === TOWER_KIND.TECH) range = t.def.techAttackRange[t.level] || 0;
    // 远视棱镜：全塔射程加成
    range *= relicEffects().towerRangeMult;
    if (range <= 0) return null;
    let best = null;
    let bestT = -1;
    for (const e of state.enemies) {
      if (e.dead || e.escaped) continue;
      if (isStealth(e) && !e.detected && (t.kind !== TOWER_KIND.BARRACKS)) continue;
      if (dist2(e.x, e.y, cx, cy) > range * range) continue;
      if (e.t > bestT) { bestT = e.t; best = e; }
    }
    return best;
  };

  // 洲际导弹目标：地图任意敌人（除未被侦测的隐身敌人）
  const pickMissileTarget = () => {
    let best = null;
    let bestT = -1;
    for (const e of state.enemies) {
      if (e.dead || e.escaped) continue;
      if (isStealth(e) && !e.detected) continue;
      if (e.t > bestT) { bestT = e.t; best = e; }
    }
    return best;
  };

  const fireMissile = (t, target) => {
    const cx = t.gx * CELL + CELL / 2;
    const cy = t.gy * CELL + CELL / 2;
    state.projectiles.push({
      id: genId(),
      kind: 'missile',
      x: cx, y: cy,
      targetId: target.id,
      tx: target.x, ty: target.y,
      speed: 300,
      dmg: t.def.missileDmg[t.level],
      splash: t.def.missileSplash[t.level],
      angle: Math.atan2(target.y - cy, target.x - cx),
      pierce: 1,
      hit: new Set(),
      fromTower: t.id,
      fireChance: t.def.fireChance[t.level],
      fireRadius: t.def.fireRadius,
      fireDuration: t.def.fireDuration,
      fireDps: t.def.fireDps,
      fireSlow: t.def.fireSlow,
    });
    showMessage('洲际导弹发射！', '#f87171', 1000);
  };

  const fireTower = (t, target) => {
    const cx = t.gx * CELL + CELL / 2;
    const cy = t.gy * CELL + CELL / 2;
    if (t.kind === TOWER_KIND.CANNON || t.kind === TOWER_KIND.ARROW) {
      const rf = relicEffects();
      const proj = {
        id: genId(),
        kind: t.kind === TOWER_KIND.CANNON ? 'cannon' : 'arrow',
        x: cx, y: cy,
        targetId: target.id,
        tx: target.x, ty: target.y,
        speed: t.def.projectileSpeed,
        // 锋锐符文（伤害加成）+ 幸运骰（暴击）
        dmg: rollDamage(t.def.dmg[t.level] * rf.towerDmgMult),
        // 爆裂核心：溅射范围加成
        splash: t.def.splash ? t.def.splash[t.level] * rf.splashMult : 0,
        angle: Math.atan2(target.y - cy, target.x - cx),
        pierce: t.def.pierce || 1,
        hit: new Set(),
        fromTower: t.id,
        towerKind: t.kind,
        fireChance: t.kind === TOWER_KIND.CANNON ? (t.def.fireChance ? t.def.fireChance[t.level] : 0) : 0,
        fireRadius: t.def.fireRadius,
        fireDuration: t.def.fireDuration,
        fireDps: t.def.fireDps,
        fireSlow: t.def.fireSlow,
      };
      state.projectiles.push(proj);
      const interval = Array.isArray(t.def.attackInterval) ? t.def.attackInterval[t.level] : t.def.attackInterval;
      t.cd = interval;
    } else if (t.kind === TOWER_KIND.TECH) {
      state.projectiles.push({
        id: genId(),
        kind: 'tech',
        x: cx, y: cy,
        targetId: target.id,
        // 锁定开火时的坐标，目标丢失后飞向该点而不是飞出图
        tx: target.x, ty: target.y,
        speed: 480,
        dmg: t.def.techAttackDmg[t.level],
        slow: t.def.techSlow[t.level],
        slowDur: t.def.techSlowDuration,
        angle: Math.atan2(target.y - cy, target.x - cx),
        pierce: 1,
        hit: new Set(),
      });
      t.cd = t.def.techAttackInterval[t.level];
    }
  };

  // 兵营集结点像素坐标（null = 默认塔位）
  const rallyPx = (tower) => {
    if (tower.rally) return [tower.rally.gx * CELL + CELL / 2, tower.rally.gy * CELL + CELL / 2];
    return [tower.gx * CELL + CELL / 2, tower.gy * CELL + CELL / 2];
  };

  const makeSummon = (tower) => {
    const lvl = tower.level;
    const def = tower.def;
    const [rx, ry] = rallyPx(tower);
    // 站位编号：同营小兵围绕集结点散开，避免全部重叠成一坨
    const slot = state.summons.filter((s) => s.towerId === tower.id && !s.dead).length;
    const ring = slot === 0 ? 0 : 8;
    const a = slot * 2.4;
    return {
      id: genId(),
      towerId: tower.id,
      slot,
      ox: slot === 0 ? 0 : Math.cos(a) * ring,
      oy: slot === 0 ? 0 : Math.sin(a) * ring,
      x: rx, y: ry,
      rallyX: rx, rallyY: ry,
      aggroRange: def.aggroRange || def.aggroRange[0],
      attackRange: 16,
      dmg: def.summonDmg[lvl],
      // 坚韧军旗：小兵生命加成
      hp: Math.round(def.summonHp[lvl] * relicEffects().summonHpMult),
      maxHp: Math.round(def.summonHp[lvl] * relicEffects().summonHpMult),
      attackCd: 0,
      facing: 1,
      color: '#34d399',
      alpha: 1,
      dead: false,
      walkPhase: 0,
      targetId: null,
    };
  };

  // 兵营补给逻辑：按等级维持小兵数量，死亡后等待补给延迟再补
  const updateBarracks = (dtMs) => {
    for (const t of state.towers) {
      if (t.kind !== TOWER_KIND.BARRACKS) continue;
      const count = Math.min(t.def.maxSummons, t.def.summonStart + t.def.summonPerLevel * t.level);
      const alive = state.summons.filter((s) => !s.dead && s.towerId === t.id).length;
      if (alive >= count) { t.resupplyTimer = 0; t.spawnNow = 0; continue; }
      // 建造/升级立即补充
      if ((t.spawnNow || 0) > 0) {
        t.spawnNow--;
        state.summons.push(makeSummon(t));
        const [rx, ry] = rallyPx(t);
        spawnFx({ kind: 'summon', x: rx, y: ry, radius: 12, life: 400 });
        continue;
      }
      // 死亡补给：等待延迟
      t.resupplyTimer = Math.max(0, (t.resupplyTimer || 0) - dtMs);
      if (t.resupplyTimer <= 0) {
        state.summons.push(makeSummon(t));
        t.resupplyTimer = t.def.resupplyDelay[t.level];
        const [rx, ry] = rallyPx(t);
        spawnFx({ kind: 'summon', x: rx, y: ry, radius: 12, life: 400 });
      }
    }
  };

  const updateSummons = (dtMs) => {
    const hero = state.hero;
    const auraRegen = getAura('heal');
    const auraLifesteal = getAura('chainLightning');
    const auraDmg = getAura('ultimateBeam');
    const dmgMult = auraDmg ? auraDmg.dmgBoost : 1;
    const lifesteal = auraLifesteal ? auraLifesteal.lifesteal : 0;

    // 集结点每帧从兵营实时取：改集结点后已出场的小兵也会立刻前往新点
    const rallyMap = new Map();
    for (const t of state.towers) {
      if (t.kind !== TOWER_KIND.BARRACKS) continue;
      const [rx, ry] = rallyPx(t);
      rallyMap.set(t.id, { x: rx, y: ry });
    }

    for (const s of state.summons) {
      if (s.dead) continue;
      s.attackCd = Math.max(0, s.attackCd - dtMs);
      const rp = rallyMap.get(s.towerId);
      if (rp) { s.rallyX = rp.x + (s.ox || 0); s.rallyY = rp.y + (s.oy || 0); }

      // 恢复光环：英雄范围内小兵持续回血
      if (auraRegen && dist2(s.x, s.y, hero.x, hero.y) <= auraRegen.range * auraRegen.range) {
        s.hp = Math.min(s.maxHp, s.hp + auraRegen.regenPerSec * (dtMs / 1000));
      }

      // 索敌：攻击范围内最近的敌人
      let target = state.enemies.find((e) => e.id === s.targetId && !e.dead && !e.escaped);
      if (!target) {
        let best = null;
        let bestD = Infinity;
        for (const e of state.enemies) {
          if (e.dead || e.escaped) continue;
          const d = dist2(e.x, e.y, s.x, s.y);
          if (d < bestD && d <= s.aggroRange * s.aggroRange) { bestD = d; best = e; }
        }
        target = best;
        s.targetId = target ? target.id : null;
      }

      if (target) {
        const dx = target.x - s.x;
        const dy = target.y - s.y;
        const d = Math.hypot(dx, dy);
        if (Math.abs(dx) > 0.5) s.facing = dx < 0 ? -1 : 1;
        if (d > s.attackRange) {
          const v = 105 * (dtMs / 1000);
          s.x += (dx / (d || 1)) * v;
          s.y += (dy / (d || 1)) * v;
          s.walkPhase += v * 0.16;
        }
        if (s.attackCd <= 0 && d <= s.attackRange + 14) {
          const amp = target.dmgTakenAmp || 1;
          const dealt = s.dmg * dmgMult * amp;
          target.hp -= dealt;
          target.lastHit = state.time;
          s.attackCd = 600;
          if (lifesteal > 0) s.hp = Math.min(s.maxHp, s.hp + dealt * lifesteal);
          if (target.hp <= 0 && !target.dead) target.dead = true;
        }
      } else {
        // 脱战：回集结点
        const dx = s.rallyX - s.x;
        const dy = s.rallyY - s.y;
        const d = Math.hypot(dx, dy);
        if (d > 6) {
          const v = 115 * (dtMs / 1000);
          s.x += (dx / (d || 1)) * v;
          s.y += (dy / (d || 1)) * v;
          s.walkPhase += v * 0.16;
          if (Math.abs(dx) > 0.5) s.facing = dx < 0 ? -1 : 1;
        }
      }

    }

    // 死亡小兵 → 触发所属兵营补给
    for (const s of state.summons) {
      if (!s.dead) continue;
      const tower = state.towers.find((t) => t.id === s.towerId);
      if (tower) tower.resupplyTimer = tower.def.resupplyDelay[tower.level];
    }
    state.summons = state.summons.filter((s) => !s.dead);
  };

  const updateProjectiles = (dtMs) => {
    const auraDmg = getAura('ultimateBeam');
    const auraLifesteal = getAura('chainLightning');
    const heroDmgMult = auraDmg ? auraDmg.dmgBoost : 1;
    // 吸血 = 雷霆链光环 + 血契叠加（受血契上限约束）
    const heroLifesteal = (auraLifesteal ? auraLifesteal.lifesteal : 0) + (state.hero.lifesteal || 0);

    // 倒序遍历：applyProjectileHit 命中后会就地 splice 当前弹丸，正序会跳过下一个
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const p = state.projectiles[i];
      if (p.kind === 'slash') {
        const step = p.speed * (dtMs / 1000);
        const dx = Math.cos(p.angle) * step;
        const dy = Math.sin(p.angle) * step;
        p.x += dx; p.y += dy;
        p.traveled += step;
        for (const e of state.enemies) {
          if (e.dead || e.escaped || p.hit.has(e.id)) continue;
          const d2 = (e.x - p.x) * (e.x - p.x) + (e.y - p.y) * (e.y - p.y);
          if (d2 <= 12 * 12) {
            p.hit.add(e.id);
            const mult = e.armor && !e.armor.broken ? e.armor.mult : 1;
            const amp = e.dmgTakenAmp || 1;
            const dealt = p.dmg * mult * amp * heroDmgMult;
            e.hp -= dealt;
            e.lastHit = state.time;
            e.attackCd = Math.max(e.attackCd || 0, 350);
            if (heroLifesteal > 0) state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + dealt * heroLifesteal);
            if (e.hp <= 0 && !e.dead) e.dead = true;
            state.fx.push({ kind: 'slashHit', x: e.x, y: e.y, life: 220 });
          }
        }
        continue;
      }
      const target = state.enemies.find((e) => e.id === p.targetId && !e.dead && !e.escaped);
      if (target) {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        p.angle = Math.atan2(dy, dx);
        p.x += (dx / d) * p.speed * (dtMs / 1000);
        p.y += (dy / d) * p.speed * (dtMs / 1000);
        if (d < 12) applyProjectileHit(p, target);
      } else if ((p.kind === 'cannon' || p.kind === 'missile' || p.kind === 'tech') && p.tx != null) {
        // 目标丢失：飞向开火时锁定的坐标，到达即爆炸（保留溅射给附近敌人）
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const d = Math.hypot(dx, dy) || 1;
        p.angle = Math.atan2(dy, dx);
        p.x += (dx / d) * p.speed * (dtMs / 1000);
        p.y += (dy / d) * p.speed * (dtMs / 1000);
        if (d < 14) {
          explodeAt(p);
          p.pierce = 0;
        }
      } else {
        // arrow / 其他直线型：按原角度继续飞，由 filter 范围兜底删除
        p.x += Math.cos(p.angle) * p.speed * (dtMs / 1000);
        p.y += Math.sin(p.angle) * p.speed * (dtMs / 1000);
      }
    }
    state.projectiles = state.projectiles.filter((p) => {
      if (p.kind === 'slash') {
        if ((state.time - p.born) * 1 >= p.lifeMs) return false;
        if (p.traveled >= p.range) return false;
        return true;
      }
      if (p.x < -50 || p.x > state.width + 50 || p.y < -50 || p.y > state.height + 50) return false;
      return p.pierce > 0;
    });
  };

  const applyProjectileHit = (p, target) => {
    if (p.hit.has(target.id)) return;
    p.hit.add(target.id);
    const mult = target.armor && !target.armor.broken ? target.armor.mult : 1;
    const amp = target.dmgTakenAmp || 1;
    const auraDmg = getAura('ultimateBeam');
    const dmgBoost = auraDmg ? auraDmg.dmgBoost : 1;
    target.hp -= p.dmg * mult * amp * dmgBoost;
    target.lastHit = state.time;
    // 科技前哨站：减速
    if (p.kind === 'tech' && p.slow) {
      target.slowAmount = p.slow;
      target.slowUntil = state.time + (p.slowDur || 1500);
    }
    // 溅射
    if (p.splash) {
      spawnFx({ kind: 'splash', x: target.x, y: target.y, radius: p.splash, life: 350 });
      for (const e of state.enemies) {
        if (e.dead || e === target) continue;
        if (dist2(e.x, e.y, target.x, target.y) <= p.splash * p.splash) {
          const sm = e.armor && !e.armor.broken ? e.armor.mult : 1;
          const ea = e.dmgTakenAmp || 1;
          e.hp -= p.dmg * 0.5 * sm * ea * dmgBoost;
          e.lastHit = state.time;
          if (e.hp <= 0 && !e.dead) e.dead = true;
        }
      }
    }
    // 火焰灼烧区（导弹 / 三级炮击概率触发）
    if (p.fireChance > 0 && Math.random() < p.fireChance) {
      state.fireZones.push({
        x: target.x, y: target.y,
        radius: p.fireRadius || 1.2 * CELL,
        duration: p.fireDuration || 3500,
        dps: p.fireDps || 8,
        slow: p.fireSlow || 0.4,
        age: 0,
      });
      spawnFx({ kind: 'fire', x: target.x, y: target.y, radius: p.fireRadius || 1.2 * CELL, life: 500 });
    }
    settleDamage(target);
    p.pierce--;
    if (p.pierce <= 0) {
      const idx = state.projectiles.indexOf(p);
      if (idx >= 0) state.projectiles.splice(idx, 1);
    }
  };

  // 锁定位置爆炸：目标已消失时使用，沿用炮弹自带的溅射 / 灼烧逻辑
  const explodeAt = (p) => {
    const auraDmg = getAura('ultimateBeam');
    const dmgBoost = auraDmg ? auraDmg.dmgBoost : 1;
    if (p.splash) {
      spawnFx({ kind: 'splash', x: p.x, y: p.y, radius: p.splash, life: 350 });
      for (const e of state.enemies) {
        if (e.dead) continue;
        if (dist2(e.x, e.y, p.x, p.y) <= p.splash * p.splash) {
          const sm = e.armor && !e.armor.broken ? e.armor.mult : 1;
          const ea = e.dmgTakenAmp || 1;
          e.hp -= p.dmg * 0.5 * sm * ea * dmgBoost;
          e.lastHit = state.time;
          if (e.hp <= 0 && !e.dead) e.dead = true;
        }
      }
    }
    if (p.fireChance > 0 && Math.random() < p.fireChance) {
      state.fireZones.push({
        x: p.x, y: p.y,
        radius: p.fireRadius || 1.2 * CELL,
        duration: p.fireDuration || 3500,
        dps: p.fireDps || 8,
        slow: p.fireSlow || 0.4,
        age: 0,
      });
      spawnFx({ kind: 'fire', x: p.x, y: p.y, radius: p.fireRadius || 1.2 * CELL, life: 500 });
    }
    // 溅射范围内的斩杀判定
    const th = relicEffects().executeThreshold;
    if (th > 0) {
      for (const e of state.enemies) {
        if (e.dead || e.hp <= 0) continue;
        if (e.hp <= e.maxHp * th) settleDamage(e);
      }
    }
  };

  const updateHero = (dtMs) => {
    const h = state.hero;
    let mx = 0, my = 0;
    // 移动用 WASD / 方向键（恢复 WASD，玩家手不用离开主键盘区）
    if (state.keys.has('w') || state.keys.has('arrowup')) my -= 1;
    if (state.keys.has('s') || state.keys.has('arrowdown')) my += 1;
    if (state.keys.has('a') || state.keys.has('arrowleft')) mx -= 1;
    if (state.keys.has('d') || state.keys.has('arrowright')) mx += 1;
    if (mx || my) {
      const len = Math.hypot(mx, my) || 1;
      h.vx = (mx / len) * HERO_SPEED;
      h.vy = (my / len) * HERO_SPEED;
      if (mx < 0) h.facing = -1; else if (mx > 0) h.facing = 1;
    } else {
      h.vx = 0; h.vy = 0;
    }
    h.x = clamp(h.x + h.vx * (dtMs / 1000), 14, state.width - 14);
    h.y = clamp(h.y + h.vy * (dtMs / 1000), 14, state.height - 14);

    const speedNow = Math.hypot(h.vx, h.vy);
    if (speedNow > 1) h.walkPhase += (speedNow / HERO_SPEED) * (dtMs / 1000) * 9;
    else h.walkPhase *= 0.85;

    h.attackCd = Math.max(0, (h.attackCd || 0) - dtMs);
    if (!h.immortal && !h.beamActive && h.attackCd <= 0) {
      let target = null;
      let bestD = Infinity;
      for (const e of state.enemies) {
        if (e.dead || e.escaped) continue;
        const d = Math.hypot(e.x - h.x, e.y - h.y);
        if (d <= h.attackRange && d < bestD) { bestD = d; target = e; }
      }
      if (target) {
        const angle = Math.atan2(target.y - h.y, target.x - h.x);
        state.projectiles.push({
          id: genId(),
          kind: 'slash',
          x: h.x, y: h.y,
          angle,
          speed: 780,
          dmg: h.attackDmg,
          traveled: 0,
          lifeMs: 220,
          born: state.time,
          range: h.attackRange,
          hit: new Set(),
          fromHero: true,
        });
        h.attackCd = h.attackInterval;
        h.facing = Math.abs(angle) > Math.PI / 2 ? -1 : 1;
      }
    }
  };

  const castSkill = (sk) => {
    if (!sk.unlocked || sk.cooldownLeft > 0 || state.gameOver) return false;
    const def = sk.def;
    const lvl = sk.level;
    const v = def.upgradePerLevel;
    const base = def.base;
    const get = (key, defV) => base[key] + (v[key] || 0) * lvl;
    if (def.kind === 'shockwave') {
      const radius = get('radius', base.radius);
      const knockback = get('knockback', base.knockback);
      state.fx.push({ kind: 'shockwave', x: state.hero.x, y: state.hero.y, radius, t: 0, life: 600 });
      for (const e of state.enemies) {
        if (e.dead || e.escaped) continue;
        const d = Math.hypot(e.x - state.hero.x, e.y - state.hero.y);
        if (d < radius) {
          const dx = (e.x - state.hero.x) / (d || 1);
          const dy = (e.y - state.hero.y) / (d || 1);
          e.t -= knockback;
          e.x += dx * 6;
          e.y += dy * 6;
        }
      }
      sk.cooldownLeft = def.cooldown + (v.cd || 0) * lvl;
    } else if (def.kind === 'arrowRain') {
      const count = get('count', base.count);
      const dmg = get('dmg', base.dmg);
      const speed = base.speed;
      const life = base.life;
      const angle = Math.atan2(state.mouseWorld.y - state.hero.y, state.mouseWorld.x - state.hero.x);
      for (let i = 0; i < count; i++) {
        const spread = (i - (count - 1) / 2) * 0.12;
        const a = angle + spread;
        const proj = {
          id: genId(),
          kind: 'arrowRain',
          x: state.hero.x, y: state.hero.y,
          angle: a,
          speed,
          dmg,
          lifeMs: life * 1000,
          born: state.time,
          pierce: 999,
          hit: new Set(),
          heroSkill: true,
        };
        state.projectiles.push(proj);
      }
      sk.cooldownLeft = def.cooldown + (v.cd || 0) * lvl;
    } else if (def.kind === 'heal') {
      const range = base.range;
      const dur = get('duration', base.duration);
      const hpPer = get('hpPerSec', base.hpPerSec);
      state.fx.push({ kind: 'heal', x: state.hero.x, y: state.hero.y, radius: range, t: 0, life: dur });
      // 状态驱动的持续回血：原 setInterval 在暂停/重开时不会停，
      // 且每 100ms 加一次 hpPerSec（实际是每秒值的 10 倍）
      for (const t of state.towers) {
        if (dist2(t.gx * CELL + CELL / 2, t.gy * CELL + CELL / 2, state.hero.x, state.hero.y) > range * range) continue;
        state.healTicks.push({ towerId: t.id, remain: dur, hpPerSec: hpPer });
      }
      sk.cooldownLeft = def.cooldown + (v.cd || 0) * lvl;
    } else if (def.kind === 'chain') {
      const bounces = get('bounces', base.bounces);
      const dmg = get('dmg', base.dmg);
      const range = base.range;
      const origin = state.hero;
      const targets = [];
      let cur = state.enemies
        .filter((e) => !e.dead && !e.escaped)
        .sort((a, b) => dist2(a.x, a.y, origin.x, origin.y) - dist2(b.x, b.y, origin.x, origin.y))[0];
      if (!cur) return false;
      targets.push({ x: origin.x, y: origin.y });
      targets.push({ x: cur.x, y: cur.y });
      const used = new Set([cur.id]);
      cur.hp -= dmg;
      cur.lastHit = state.time;
      if (cur.hp <= 0) cur.dead = true;
      let prev = cur;
      for (let i = 1; i < bounces; i++) {
        const next = state.enemies
          .filter((e) => !e.dead && !e.escaped && !used.has(e.id))
          .sort((a, b) => dist2(a.x, a.y, prev.x, prev.y) - dist2(b.x, b.y, prev.x, prev.y))[0];
        if (!next || dist2(next.x, next.y, prev.x, prev.y) > range * range) break;
        targets.push({ x: next.x, y: next.y });
        next.hp -= dmg;
        next.lastHit = state.time;
        if (next.hp <= 0) next.dead = true;
        used.add(next.id);
        prev = next;
      }
      state.fx.push({ kind: 'chain', pts: targets, t: 0, life: 350 });
      sk.cooldownLeft = def.cooldown + (v.cd || 0) * lvl;
    } else if (def.kind === 'beam') {
      const dur = get('duration', base.duration);
      const width = base.width;
      state.hero.beamActive = true;
      state.hero.beamAngle = Math.atan2(state.mouseWorld.y - state.hero.y, state.mouseWorld.x - state.hero.x);
      state.hero.beamLength = 0;
      state.hero.immortal = true;
      state.fx.push({ kind: 'beam', x: state.hero.x, y: state.hero.y, angle: state.hero.beamAngle, length: 800, width, t: 0, life: dur, heroBeam: true });
      setTimeout(() => {
        state.hero.beamActive = false;
        state.hero.immortal = false;
      }, dur);
      sk.cooldownLeft = def.cooldown + (v.cd || 0) * lvl;
    }
    return true;
  };

  const updateBeamTick = (dtMs) => {
    const h = state.hero;
    if (!h.beamActive) return;
    const sk = state.skills.find((s) => s.def.kind === 'beam');
    if (!sk) return;
    const lvl = sk.level;
    const dmg = sk.def.base.dmg + (sk.def.upgradePerLevel.dmg || 0) * lvl;
    const dx = Math.cos(h.beamAngle);
    const dy = Math.sin(h.beamAngle);
    for (const e of state.enemies) {
      if (e.dead || e.escaped) continue;
      const ex = e.x - h.x;
      const ey = e.y - h.y;
      const proj = ex * dx + ey * dy;
      if (proj < 0 || proj > 800) continue;
      const perp = Math.abs(-ex * dy + ey * dx);
      if (perp < 14 + e.size) {
        e.hp -= dmg * (dtMs / 1000) * 60;
        e.lastHit = state.time;
        if (e.hp <= 0) e.dead = true;
      }
    }
  };

  const updateSkillCooldowns = (dtMs) => {
    for (const sk of state.skills) sk.cooldownLeft = Math.max(0, sk.cooldownLeft - dtMs);
  };

  // 生成单个敌人（队列项 → 实体）
  // queue 项带 elite 标记时生成精英个体（血量×3 / 奖励×1.5 / 金色光环）
  const spawnFromQueue = (q) => {
    const e = makeEnemy(q.kind, q.path, q.multHp, 1, q.multSpeed * (state.enemySpeedK || 1), state.endlessK, !!q.elite);
    e.t = 0;
    const path = e.path === 'A' ? PATH_A : PATH_B;
    const sp = getPointAtLength(path, e.t);
    e.x = sp.x; e.y = sp.y;
    state.enemies.push(e);
  };

  // 待生成队列（由主循环驱动，避免 setTimeout 在暂停/重开时错乱）
  // 同屏敌人达到软上限时冻结出怪，队列保留（不会误判波次结束）
  const updateSpawnQueue = (dtMs) => {
    const q = state.spawnQueue;
    if (!q || !q.length) return;
    for (const it of q) it.at -= dtMs;
    let room = MAX_ALIVE_ENEMIES - state.enemies.length;
    if (room <= 0) {
      for (const it of q) if (it.at < 0) it.at = 0;
      return;
    }
    const remain = [];
    for (const it of q) {
      if (it.at <= 0 && room > 0) {
        if (state.gameOver) return;
        spawnFromQueue(it);
        room--;
      } else {
        remain.push(it);
      }
    }
    state.spawnQueue = remain;
  };

  const startWave = (n) => {
    if (state.waveActive) return;
    state.wave = n;
    state.waveActive = true;
    state.waveCountdown = 9999;
    state.spawnQueue = [];
    const plan = buildWavePlan(n);
    const multHp = 1 + (n - 1) * 0.05;
    const multSpeed = 1 + (n - 1) * 0.02;
    for (const p of plan) {
      if (p.kind === 'boss') {
        // Boss 定义循环复用
        const idx = Number.isFinite(p.bossIdx) ? p.bossIdx : 0;
        const def = BOSS_DEFS[idx] || BOSS_DEFS[idx % BOSS_DEFS.length];
        if (!def) continue;
        const boss = makeEnemy(def.kind, idx % 2 === 0 ? 'A' : 'B', multHp, 1, multSpeed * (state.enemySpeedK || 1), state.endlessK);
        // 直接 push 不走 spawnFromQueue，需手动初始化出生坐标（否则首帧停在 (0,0)）
        const bsp = getPointAtLength(boss.path === 'A' ? PATH_A : PATH_B, 0);
        boss.x = bsp.x; boss.y = bsp.y;
        state.enemies.push(boss);
      } else {
        const total = p.count;
        // 精英比例：逐只判定，保证同一波内精英分布自然而非整波同质
        const er = p.eliteRatio || 0;
        for (let i = 0; i < total; i++) {
          state.spawnQueue.push({
            at: i * p.interval * 1000,
            kind: p.kind,
            path: p.bossIdx !== undefined ? (p.bossIdx % 2 === 0 ? 'A' : 'B') : (Math.random() < 0.5 ? 'A' : 'B'),
            multHp, multSpeed,
            elite: er > 0 && Math.random() < er,
          });
        }
      }
    }
    const totalCount = state.spawnQueue.length + state.enemies.length;
    const eliteCount = state.spawnQueue.filter((q) => q.elite).length;
    const theme = waveTheme(n);
    const themeTag = theme ? ` · ${theme.name}` : '';
    const eliteTag = eliteCount ? ` · 精英 ${eliteCount}` : '';
    showMessage(`第 ${n} 波${themeTag} 开始！共 ${totalCount} 敌${eliteTag}`, '#22c55e', 1800);
  };

  const checkWaveComplete = () => {
    if (!state.waveActive) return;
    if (state.enemies.length === 0 && (!state.spawnQueue || state.spawnQueue.length === 0)) {
      const isBossWave = state.wave % 5 === 0;
      const base = isBossWave ? BOSS_END_REWARD(state.wave) : WAVE_END_REWARD(state.wave);
      const reward = Math.round(base * relicEffects().waveRewardMult);
      state.gold += reward;
      showMessage(`第 ${state.wave} 波 结束 +💰${reward}`, '#fbbf24', 1500);
      state.waveActive = false;
      // Boss 波结算 → 挂起遗物三选一（选择期间游戏暂停）
      if (isBossWave) offerRelicChoices();
      // 首次达到最大波次 → 通关并进入无尽（无尽后不再重复提示）
      if (state.wave >= state.maxWave && !state.endless) {
        state.victory = true;
        state.endless = true;
        state.endlessK = 0;
        state.waveCountdown = 12;
        showMessage('通关！进入无尽模式', '#22c55e', 3000);
        return;
      }
      state.waveCountdown = Math.max(5, 12 - Math.floor(state.wave / 5));
    }
  };

  const tickWaveCountdown = (dtMs) => {
    if (state.waveActive) return;
    state.waveCountdown = Math.max(0, state.waveCountdown - dtMs / 1000);
    if (state.waveCountdown <= 0) {
      const nextWave = state.endless ? state.wave + 1 : Math.min(state.maxWave, state.wave + 1);
      if (state.endless && nextWave % ENDLESS_PERIOD === 0) {
        state.endlessK += ENDLESS_K;
      }
      startWave(nextWave);
    }
  };

  const update = (dtMs) => {
    // 遗物三选一未决时冻结推进（选择面板由 UI 层渲染）
    if (state.paused || state.gameOver || state.pendingRelic) return;
    state.time += dtMs;
    // 生命之泉：英雄持续回血
    const regen = relicEffects().heroRegen;
    if (regen > 0 && state.hero.hp > 0) {
      state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + regen * (dtMs / 1000));
    }
    state.debug.frame++;
    recomputeHeroStats();
    syncTechSkillLevel();
    updateSpawnQueue(dtMs);
    updateZones(dtMs);
    updateHealTicks(dtMs);
    updateTowers(dtMs);
    updateBarracks(dtMs);
    updateSummons(dtMs);
    updateProjectiles(dtMs);
    advanceEnemies(dtMs);
    updateHero(dtMs);
    updateSkillCooldowns(dtMs);
    updateBeamTick(dtMs);
    checkWaveComplete();
    tickWaveCountdown(dtMs);
    for (const fx of state.fx) fx.t += dtMs;
    state.fx = state.fx.filter((fx) => fx.t < fx.life);
    if (state.message) {
      state.message.t += dtMs;
      if (state.message.t >= state.message.life) state.message = null;
    }
    state.debug.enemyCount = state.enemies.length;
    state.debug.towerCount = state.towers.length;
    state.debug.summonCount = state.summons.length;
    state.debug.projectileCount = state.projectiles.length;
  };

  const draw = () => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, state.width, state.height);
    drawMap(ctx, state);
    drawEnemies(ctx, state);
    drawTowers(ctx, state);
    drawSelectedTowerUI(ctx, state);
    drawHero(ctx, state);
    drawProjectiles(ctx, state);
    drawEffects(ctx, state);
    drawHud(ctx, state, state.width, state.height);
    if (state.showDebug) drawDebugOverlay(ctx, state, state.width, state.height);
    if (state.paused) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.fillRect(0, 0, state.width, state.height);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⏸ 暂停', state.width / 2, state.height / 2);
    }
    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, state.width, state.height);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('失败', state.width / 2, state.height / 2 - 20);
      ctx.fillStyle = '#fff';
      ctx.font = '18px sans-serif';
      ctx.fillText(`漏怪 ${state.leak} / 击杀 ${state.killed}`, state.width / 2, state.height / 2 + 20);
      ctx.fillText('按 R 重开', state.width / 2, state.height / 2 + 50);
    }
    if (state.victory && !state.endless) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, state.width, state.height);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('通关！', state.width / 2, state.height / 2 - 20);
      ctx.fillStyle = '#fff';
      ctx.font = '18px sans-serif';
      ctx.fillText('进入无尽挑战', state.width / 2, state.height / 2 + 20);
    }
  };

  let rafId = null;
  let lastTime = 0;
  const raf = (cb) => typeof requestAnimationFrame !== 'undefined'
    ? requestAnimationFrame(cb) : setTimeout(() => cb(Date.now()), 16);
  const caf = (id) => {
    if (typeof cancelAnimationFrame !== 'undefined' && typeof id === 'number') {
      cancelAnimationFrame(id);
    } else {
      clearTimeout(id);
    }
  };

  let fpsAcc = 0;
  let fpsFrames = 0;
  const loop = (t) => {
    rafId = raf(loop);
    if (!lastTime) lastTime = t;
    let dtMs = t - lastTime;
    lastTime = t;
    if (dtMs > 100) dtMs = 100;
    state.dt = dtMs;
    fpsAcc += dtMs;
    fpsFrames++;
    if (fpsAcc >= 500) {
      state.debug.fps = Math.round((fpsFrames * 1000) / fpsAcc);
      fpsAcc = 0;
      fpsFrames = 0;
    }
    update(dtMs);
    draw();
  };

  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    state.mouseScreen.x = e.clientX - rect.left;
    state.mouseScreen.y = e.clientY - rect.top;
    const sx = (e.clientX - rect.left) * (state.width / rect.width);
    const sy = (e.clientY - rect.top) * (state.height / rect.height);
    state.mouseWorld.x = sx;
    state.mouseWorld.y = sy;
    const gx = Math.floor(sx / CELL);
    const gy = Math.floor(sy / CELL);
    if (gx >= 0 && gy >= 0 && gx < GRID_SIZE && gy < GRID_SIZE) {
      const tower = state.towers.find((t) => t.gx === gx && t.gy === gy);
      state.hoveredTower = tower || null;
      state.hoveredCell = {
        gx, gy,
        canBuild: isBuildable(gx, gy) && !tower,
        occupied: !!tower,
      };
    } else {
      state.hoveredTower = null;
      state.hoveredCell = null;
    }
  };

  const onClick = (e) => {
    if (state.gameOver) {
      if (e.button === 0) reset();
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (state.width / rect.width);
    const sy = (e.clientY - rect.top) * (state.height / rect.height);
    const gx = Math.floor(sx / CELL);
    const gy = Math.floor(sy / CELL);
    if (state.moveSelected) {
      const t = state.moveSelected;
      if (isBuildable(gx, gy) && !state.towers.some((tw) => tw.gx === gx && tw.gy === gy)) {
        // 迁跃符：移动免费
        const free = relicEffects().moveFree;
        const cost = free ? 0 : (t.def.cost * MOVE_COST_RATIO) | 0;
        if (state.gold >= cost && state.moveCount < state.moveLimit) {
          t.gx = gx; t.gy = gy;
          state.gold -= cost;
          state.moveCount++;
          // 搬迁后原小兵解散，在新集结点重新集结
          removeSummonsOfTower(t.id);
          if (t.kind === TOWER_KIND.BARRACKS) {
            t.spawnNow = 0;
            t.resupplyTimer = t.def.resupplyDelay[t.level];
          }
          showMessage(free ? '移动（迁跃符 · 免费）' : `移动 -💰${cost}（小兵重新集结）`, '#94a3b8', 1000);
        }
      }
      state.moveSelected = null;
      return;
    }
    // 设置兵营集结点（仅能在集结范围内设置）
    if (state.setRallyMode) {
      const t = state.selectedTower;
      if (t && t.kind === TOWER_KIND.BARRACKS) {
        const inGrid = gx >= 0 && gy >= 0 && gx < GRID_SIZE && gy < GRID_SIZE;
        const tx = t.gx * CELL + CELL / 2, ty = t.gy * CELL + CELL / 2;
        const rx = gx * CELL + CELL / 2, ry = gy * CELL + CELL / 2;
        const maxR = t.def.rallyRange[t.level] || t.def.rallyRange[0];
        if (inGrid && Math.hypot(rx - tx, ry - ty) <= maxR) {
          t.rally = { gx, gy };
          showMessage('集结点已设置', '#34d399', 1000);
        } else {
          showMessage(`超出集结范围（当前 Lv${displayLevel(t)} 最远 ${(maxR / CELL).toFixed(1)} 格）`, '#ef4444', 1300);
        }
      }
      state.setRallyMode = false;
      return;
    }
    if (state.selectedTower) {
      if (state.selectedTower.gx === gx && state.selectedTower.gy === gy) {
        upgradeTower(state.selectedTower);
        return;
      } else {
        // 点空白处仅取消选中，不再落入建造逻辑
        state.selectedTower = null;
        return;
      }
    }
    const tower = state.towers.find((t) => t.gx === gx && t.gy === gy);
    if (tower) {
      // 选中建筑即退出建造模式，避免残留选塔状态在空白处误造
      state.selectedTower = tower;
      state.selectedBuildKind = null;
      return;
    }
    if (state.selectedBuildKind && isBuildable(gx, gy)) {
      const def = TOWER_DEFS[state.selectedBuildKind];
      if (state.gold >= def.cost) {
        state.gold -= def.cost;
        const tower = makeTower(state.selectedBuildKind, gx, gy);
        if (tower.kind === TOWER_KIND.BARRACKS) tower.spawnNow = def.summonStart;
        state.towers.push(tower);
        showMessage(`建造 ${def.name} -💰${def.cost}`, '#22c55e', 800);
      } else {
        showMessage('金币不足', '#ef4444', 800);
      }
    } else if (state.selectedBuildKind && !isBuildable(gx, gy)) {
      showMessage('不能建在路径上', '#ef4444', 800);
    }
  };

  const onRightClick = (e) => {
    e.preventDefault();
    if (state.selectedTower) {
      sellTower(state.selectedTower);
    } else {
      state.selectedBuildKind = null;
    }
  };

  const onKey = (e, down) => {
    const k = e.key.toLowerCase();
    // 屏蔽系统/浏览器快捷键
    if (down && (k === 'backspace' || k === 'f5')) {
      try { e.preventDefault(); } catch (_) {}
    }
    if (down) state.keys.add(k); else state.keys.delete(k);
    if (!down && (k === ' ')) state.paused = !state.paused;
    if (!down && (k === '`' || k === '~')) state.showDebug = !state.showDebug;
    // 重开本局：R 键（无技能占用）
    if (!down && k === 'r') reset();
    if (down) {
      // 技能键：1/2/3/4/5（数字键不再用于选塔种）
      const sk = state.skills.find((s) => s.key === k && s.unlocked);
      if (sk) castSkill(sk);
    }
    if (!down) {
      // 药水：H 使用 / B 购买
      if (k === 'h') usePotion();
      if (k === 'b') buyPotion();
      // 移动塔：M 键
      if (k === 'm' && state.selectedTower) {
        if (state.moveCount < state.moveLimit && state.gold >= (state.selectedTower.def.cost * MOVE_COST_RATIO)) {
          state.moveSelected = state.selectedTower;
          showMessage('点击目标格子移动（再次右键取消）', '#94a3b8', 1500);
        } else {
          showMessage('移动次数或金币不足', '#ef4444', 1000);
        }
      }
    }
  };

  const onContext = (e) => {
    if (state.moveSelected) { state.moveSelected = null; return; }
    onRightClick(e);
  };

  // ===== 遗物 =====
  const hasRelic = (kind) => state.relics.some((r) => r.kind === kind);

  // 遗物效果汇总（每帧/每次计算时读取，避免到处散落判断）
  const relicEffects = () => {
    const v = RELIC_VALUES;
    return {
      towerDmgMult: hasRelic(RELIC_KIND.TOWER_POWER) ? 1 + v.towerDmgMult : 1,
      towerSpeedMult: hasRelic(RELIC_KIND.TOWER_SPEED) ? 1 + v.towerSpeedMult : 1,
      towerRangeMult: hasRelic(RELIC_KIND.TOWER_RANGE) ? 1 + v.towerRangeMult : 1,
      heroDmgMult: hasRelic(RELIC_KIND.HERO_DMG) ? 1 + v.heroDmgMult : 1,
      splashMult: hasRelic(RELIC_KIND.SPLASH_BOOST) ? 1 + v.splashMult : 1,
      goldPerKill: hasRelic(RELIC_KIND.GOLD_GAIN) ? v.goldPerKill : 0,
      waveRewardMult: hasRelic(RELIC_KIND.INTEREST) ? 1 + v.waveRewardMult : 1,
      sellRefundFull: hasRelic(RELIC_KIND.SELL_REFUND),
      heroHpBonus: hasRelic(RELIC_KIND.HERO_HP) ? v.heroHpBonus : 0,
      heroRegen: hasRelic(RELIC_KIND.HERO_REGEN) ? v.heroRegenPerSec : 0,
      leakBonus: hasRelic(RELIC_KIND.LEAK_FORGIVE) ? v.leakBonus : 0,
      summonHpMult: hasRelic(RELIC_KIND.SUMMON_HP) ? 1 + v.summonHpMult : 1,
      executeThreshold: hasRelic(RELIC_KIND.EXECUTE) ? v.executeThreshold : 0,
      slowAura: hasRelic(RELIC_KIND.SLOW_AURA) ? v.slowAuraMult : 0,
      critChance: hasRelic(RELIC_KIND.CRIT) ? v.critChance : 0,
      moveFree: hasRelic(RELIC_KIND.FREE_MOVE),
    };
  };

  // Boss 波结算后挂起三选一（游戏暂停等待玩家选择）
  const offerRelicChoices = () => {
    const choices = rollRelicChoices(state.relics, 3);
    if (!choices.length) return;
    state.pendingRelic = choices;
  };

  const pickRelic = (kind) => {
    const def = state.pendingRelic?.find((r) => r.kind === kind);
    if (!def) return false;
    state.relics.push(def);
    state.pendingRelic = null;
    // 立即生效的持续性属性
    // 注：英雄最大生命由 recomputeHeroStats 统一计算，此处直接改会被每帧覆盖
    if (def.kind === RELIC_KIND.LEAK_FORGIVE) {
      state.leakLimit += RELIC_VALUES.leakBonus;
    }
    if (def.kind === RELIC_KIND.FREE_MOVE) {
      state.moveLimit += RELIC_VALUES.moveCountBonus;
    }
    showMessage(`获得遗物：${def.name}`, def.color, 2200);
    return true;
  };

  // ===== 治疗药水 =====
  const canBuyPotion = () =>
    !state.gameOver && state.potions < POTION.maxStock && state.gold >= POTION.cost;

  const buyPotion = () => {
    if (state.gameOver) return false;
    if (state.potions >= POTION.maxStock) {
      showMessage(`药水已达上限（${POTION.maxStock} 瓶）`, '#ef4444', 1200);
      return false;
    }
    if (state.gold < POTION.cost) {
      showMessage('金币不足', '#ef4444', 1000);
      return false;
    }
    state.gold -= POTION.cost;
    state.potions += 1;
    showMessage(`购买药水 ×1（剩 ${state.potions} 瓶）`, '#22c55e', 1000);
    return true;
  };

  const usePotion = () => {
    if (state.gameOver) return false;
    if (state.potions <= 0) {
      showMessage('没有药水', '#ef4444', 1000);
      return false;
    }
    if (state.hero.hp >= state.hero.maxHp) {
      showMessage('生命已满', '#94a3b8', 900);
      return false;
    }
    if (state.time < (state.hero.potionCdUntil || 0)) {
      showMessage('药水冷却中', '#ef4444', 900);
      return false;
    }
    state.potions -= 1;
    state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + POTION.heal);
    state.hero.potionCdUntil = state.time + POTION.useCooldown;
    state.fx.push({ kind: 'heal', x: state.hero.x, y: state.hero.y, radius: 40, life: 450 });
    showMessage(`恢复 ${POTION.heal} HP`, '#4ade80', 900);
    return true;
  };

  const debugAddGold = (n) => { state.gold += n; };
  const debugKillAll = () => {
    let n = 0;
    for (const e of state.enemies) {
      if (e.dead || e.escaped) continue;
      e.hp = 0;
      e.dead = true;
      n++;
    }
    showMessage(n ? `秒杀 ${n} 敌（调试）` : '场上无敌人', '#f87171', 1000);
  };
  const debugHeal = () => { state.hero.hp = state.hero.maxHp; };
  const setDebug = (v) => { state.showDebug = !!v; };
  const toggleDebug = () => { state.showDebug = !state.showDebug; return state.showDebug; };

  // 「下一波」：只跳过波间倒计时；当前波次未结束时不生效
  const startNextWave = () => {
    if (state.gameOver) return false;
    if (state.waveActive) {
      const left = state.enemies.length + (state.spawnQueue ? state.spawnQueue.length : 0);
      showMessage(`本波尚未结束（剩 ${left} 敌）`, '#ef4444', 1300);
      return false;
    }
    const nextWave = state.endless ? state.wave + 1 : Math.min(state.maxWave, state.wave + 1);
    if (state.endless && nextWave % ENDLESS_PERIOD === 0) state.endlessK += ENDLESS_K;
    startWave(nextWave);
    return true;
  };
  // 兼容旧命名
  const debugSkipWave = startNextWave;

  const start = () => {
    if (rafId) return;
    lastTime = 0;
    rafId = raf(loop);
  };
  const stop = () => {
    if (rafId) caf(rafId);
    rafId = null;
  };
  const reset = () => {
    stop();
    state.towers = [];
    state.enemies = [];
    state.projectiles = [];
    state.summons = [];
    state.fx = [];
    state.fireZones = [];
    state.poisonZones = [];
    state.spawnQueue = [];
    state.gold = state.startGold;
    state.wave = 0;
    state.waveActive = false;
    state.waveCountdown = 8;
    state.leak = 0;
    state.killed = 0;
    state.gameOver = false;
    state.victory = false;
    state.endless = false;
    state.endlessK = 0;
    state.moveCount = 0;
    state.selectedTower = null;
    state.selectedBuildKind = null;
    state.setRallyMode = false;
    state.hero = makeHero();
    state.skills = [];
    SKILL_LIST.forEach((def) => state.skills.push(makeSkillInstance(def)));
    // 跨局残留必须清空：pendingRelic 不清会让 update 永久 return（重开即卡死）
    state.potions = 0;
    state.relics = [];
    state.pendingRelic = null;
    state.healTicks = [];
    state.leakLimit = LEAK_LIMIT;
    state.moveLimit = DEFAULT_MOVE_LIMIT;
    state.moveSelected = null;
    state.paused = false;
    state.hoveredTower = null;
    state.hoveredCell = null;
    state.message = null;
    recomputeHeroStats();
    start();
  };
  const resize = () => {
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    canvas.width = state.width * dpr;
    canvas.height = state.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.dpr = dpr;
  };

  applyConfig({
    startGold: opts.startGold,
    enemySpeedK: opts.enemySpeedK,
    heroHpK: opts.heroHpK,
    leakLimit: opts.leakLimit,
  });

  return {
    state,
    start, stop, reset, resize,
    onMouseMove, onClick, onRightClick: onContext, onKey,
    debugAddGold, debugSkipWave, startNextWave, debugHeal, debugKillAll,
    setDebug, toggleDebug, applyConfig,
    castSkill,
    buyPotion, usePotion, canBuyPotion, POTION,
    pickRelic, relicEffects, hasRelic,
    upgradeTower, sellTower, removeSummonsOfTower,
    setRallyMode: () => {
      const t = state.selectedTower;
      if (t && t.kind === TOWER_KIND.BARRACKS) {
        state.setRallyMode = true;
        const maxR = (t.def.rallyRange[t.level] || t.def.rallyRange[0]) / CELL;
        showMessage(`点击集结圈内设置集结点（最远 ${maxR.toFixed(1)} 格）`, '#34d399', 1800);
      }
    },
    assignTechSkill: (towerId, skillKind) => {
      const tower = state.towers.find((t) => t.id === towerId);
      if (tower) assignTechSkill(tower, skillKind);
    },
    _gridSize: GRID_SIZE,
    _cell: CELL,
  };
};
