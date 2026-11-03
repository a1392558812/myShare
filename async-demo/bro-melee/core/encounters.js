/**
 * 奇遇系统（README §21）
 * 地图上随机浮出「奇遇」标记，走近即弹出抉择；结算全部落在这里
 * 附带：限时 buff、永久宝物、打坐传功（channel）、随从、中毒与追杀计时
 */

import { BALANCE, ENCOUNTER_CONFIG } from '../constants.js';
import { ENCOUNTERS, getEncounter, getEncounterCategory } from '../config/encounters.js';
import { getEnemyType } from '../config/enemies.js';
import { PLAYER_SKILLS, getSkillById } from '../config/skills.js';
import { getTreasure } from '../config/treasures.js';
import { applyDamage, killEntity } from './combat.js';
import { canCompanionJoin, livingCompanions, shunnedManualNames } from './companions.js';
import { createEnemy } from './entities.js';
import { spawnItem } from './items.js';
import { grantExp, recalculatePlayerStats } from './stats.js';
import { updateTaunts } from './taunts.js';
import { distanceBetween, pickRandom, randomRange } from './utils.js';

let tokenSequence = 0;

/* ------------------------------------------------------------------ */
/* 标记生成与触发                                                       */
/* ------------------------------------------------------------------ */

/**
 * 在玩家周围浮出一个奇遇标记
 * @param {Object} world 世界实例
 * @param {String|null} encounterId 指定奇遇（空则随机）
 * @param {Object} options { radiusMin, radiusMax }
 * @returns {Object} 标记
 */
export const spawnEncounterToken = (world, encounterId = null, options = {}) => {
  const config = encounterId ? getEncounter(encounterId) : pickRandom(ENCOUNTERS);
  if (!config) {
    return null;
  }
  const radiusMin = options.radiusMin === undefined ? ENCOUNTER_CONFIG.RADIUS_MIN : options.radiusMin;
  const radiusMax = options.radiusMax === undefined ? ENCOUNTER_CONFIG.RADIUS_MAX : options.radiusMax;
  const angle = Math.random() * Math.PI * 2;
  const distance = randomRange(radiusMin, radiusMax);
  const category = getEncounterCategory(config.category);
  tokenSequence += 1;
  const token = {
    id: tokenSequence,
    encounterId: config.id,
    name: config.name,
    icon: config.icon,
    category: config.category,
    categoryName: category.name,
    color: category.color,
    x: world.player.x + Math.cos(angle) * distance,
    y: world.player.y + Math.sin(angle) * distance,
    radius: 20,
    alive: true,
    life: ENCOUNTER_CONFIG.LIFE,
    phase: Math.random() * Math.PI * 2,
  };
  world.encounterTokens.push(token);
  world.effects.addRing(token.x, token.y, 46, category.color, { life: 0.7, lineWidth: 2 });
  return token;
};

/** 面板需要的纯对象 */
export const buildEncounterPayload = (token) => {
  const config = getEncounter(token.encounterId);
  const category = getEncounterCategory(config.category);
  return {
    tokenId: token.id,
    encounterId: config.id,
    name: config.name,
    icon: config.icon,
    hook: config.hook,
    categoryName: category.name,
    color: category.color,
    choices: config.choices.map((choice) => ({ id: choice.id, label: choice.label, hint: choice.hint, tone: choice.tone })),
  };
};

/** 走近触发：暂停世界并弹面板 */
export const openEncounter = (world, token, notify = true) => {
  if (!token || !token.alive || world.pendingEncounter) {
    return false;
  }
  token.alive = false;
  world.encounterTokens = world.encounterTokens.filter((entry) => entry.id !== token.id);
  world.pendingEncounter = { tokenId: token.id, encounterId: token.encounterId };
  world.paused = true;
  world.handlers.onEncounter(buildEncounterPayload(token));
  if (notify) {
    world.effects.addParticles(token.x, token.y, { count: 14, color: token.color, speed: 150, size: 2.6, life: 0.5 });
  }
  return true;
};

/* ------------------------------------------------------------------ */
/* 结算：通用工具                                                       */
/* ------------------------------------------------------------------ */

const result = (title, lines, color) => ({ title, lines, color });

/** 扣除当前气血的百分比（保底留 1 点，除非致死） */
const hurtPlayer = (world, ratio) => {
  const player = world.player;
  const loss = Math.max(1, Math.round(player.hp * ratio));
  player.hp = Math.max(1, player.hp - loss);
  world.effects.addText(player.x, player.y - player.radius - 20, `-${loss}`, { color: '#ff8a7a', size: 16 });
  world.effects.addParticles(player.x, player.y, { count: 10, color: '#ff8a7a', speed: 150, size: 2.6, life: 0.4 });
  return loss;
};

/** 直接致死（用于「五成当场暴毙」这类硬判定） */
const killPlayer = (world) => {
  const player = world.player;
  player.hp = 0;
  killEntity(world, player, null);
};

/** 升级/降级（保持气血百分比） */
const shiftLevel = (world, delta) => {
  const player = world.player;
  const ratio = player.maxHp > 0 ? player.hp / player.maxHp : 1;
  const before = player.level;
  player.level = Math.max(1, Math.min(99, player.level + delta));
  player.exp = 0;
  recalculatePlayerStats(player);
  player.hp = Math.max(1, Math.round(player.maxHp * ratio));
  world.skillChoiceCount = Math.floor(player.level / BALANCE.SKILL_EVERY_LEVELS);
  world.skillChoiceQueue = 0;
  world.pushHud(true);
  return player.level - before;
};

/** 给经验并处理升级带来的秘籍次数 */
const grantExpAmount = (world, amount) => {
  const player = world.player;
  const levels = grantExp(player, amount);
  if (levels > 0) {
    world.handlePlayerLevelUp(levels);
  }
  return { levels, amount };
};

/** 随机一本普通秘籍（不含奇遇专属） */
const pickNormalSkill = (world) => {
  const player = world.player;
  const pool = PLAYER_SKILLS.filter((skill) => {
    return !skill.encounterOnly && (player.skillStacks[skill.id] || 0) < skill.maxStack;
  });
  return pool.length ? pickRandom(pool) : null;
};

/** 随机失去一层已学秘籍 */
const loseRandomSkillStack = (world) => {
  const player = world.player;
  const ids = Object.keys(player.skillStacks).filter((skillId) => player.skillStacks[skillId] > 0);
  if (!ids.length) {
    return null;
  }
  const lostId = pickRandom(ids);
  const skill = getSkillById(lostId);
  player.skillStacks[lostId] -= 1;
  if (player.skillStacks[lostId] <= 0) {
    delete player.skillStacks[lostId];
    player.activeSkillIds = player.activeSkillIds.filter((id) => id !== lostId);
    delete player.skillCooldowns[lostId];
  }
  recalculatePlayerStats(player);
  world.stats.learnedSkills = Object.keys(player.skillStacks).map((key) => {
    const entry = getSkillById(key);
    return { name: entry ? entry.name : key, stack: player.skillStacks[key] };
  });
  world.pushHud(true);
  return skill;
};

/** 在玩家附近刷一只敌人（奇遇专用） */
const spawnNearby = (world, typeId, level, options = {}) => {
  const angle = Math.random() * Math.PI * 2;
  const distance = options.distance === undefined ? randomRange(320, 460) : options.distance;
  const enemy = createEnemy(typeId, level, world.player.x + Math.cos(angle) * distance, world.player.y + Math.sin(angle) * distance);
  if (options.huntSeconds !== undefined) {
    enemy.forcedHuntTimer = options.huntSeconds;
    enemy.leavesAfterHunt = Boolean(options.leavesAfterHunt);
  }
  if (options.alwaysHuntPlayer) {
    enemy.forcedHuntTimer = options.huntSeconds === undefined ? Number.POSITIVE_INFINITY : options.huntSeconds;
  }
  world.addEnemy(enemy);
  world.effects.addRing(enemy.x, enemy.y, enemy.radius * 2.4, enemy.accent, { life: 0.5, lineWidth: 2 });
  return enemy;
};

/** 刷一个随从 */
export const spawnCompanion = (world, typeId, level, options = {}) => {
  // 玩家练了它忌讳的秘籍（小师妹 vs 葵花宝典），这次就不来了
  if (!canCompanionJoin(world, typeId)) {
    const shunned = shunnedManualNames(typeId);
    world.notify(`${getEnemyType(typeId).name} 不肯入队：她不齿《${shunned[0] || '那门功夫'}》`, '#ff6bd6');
    return null;
  }
  const angle = Math.random() * Math.PI * 2;
  const distance = 66;
  const companion = createEnemy(
    typeId,
    Math.max(1, Math.round(level)),
    world.player.x + Math.cos(angle) * distance,
    world.player.y + Math.sin(angle) * distance,
  );
  companion.isCompanion = true;
  companion.companionOwner = world.player.id;
  companion.guardFatal = Boolean(options.guardFatal);
  companion.targetId = null;
  companion.viewRadius = 460;
  world.addEnemy(companion);
  world.effects.addRing(companion.x, companion.y, companion.radius * 3, '#8ef0d5', { life: 0.6, lineWidth: 3 });
  world.effects.addParticles(companion.x, companion.y, { count: 14, color: '#8ef0d5', speed: 160, size: 2.6, life: 0.5 });
  return companion;
};

/** 宝物入袋 */
export const addTreasure = (world, treasureId) => {
  const treasure = getTreasure(treasureId);
  if (!treasure) {
    return null;
  }
  const player = world.player;
  if (player.treasures.includes(treasureId)) {
    return treasure;
  }
  player.treasures.push(treasureId);
  recalculatePlayerStats(player);
  world.pushHud(true);
  return treasure;
};

/** 丢弃（销毁）宝物 */
export const removeTreasure = (world, treasureId) => {
  const player = world.player;
  if (!player.treasures.includes(treasureId)) {
    return false;
  }
  const treasure = getTreasure(treasureId);
  player.treasures = player.treasures.filter((id) => id !== treasureId);
  recalculatePlayerStats(player);
  world.notify(`销毁了 ${treasure ? treasure.name : treasureId}`, '#c6a86c');
  world.pushHud(true);
  return true;
};

/* ------------------------------------------------------------------ */
/* 限时 buff                                                            */
/* ------------------------------------------------------------------ */

/**
 * 施加/刷新一个限时 buff
 * @param {Object} world 世界实例
 * @param {Object} buff { id, name, icon, color, duration, ...属性字段 }
 */
export const addBuff = (world, buff) => {
  const player = world.player;
  const existing = player.buffs.find((entry) => entry.id === buff.id);
  if (existing) {
    existing.timeLeft = Math.max(existing.timeLeft, buff.duration);
    Object.assign(existing, { ...buff, timeLeft: existing.timeLeft });
  } else {
    player.buffs.push({ ...buff, timeLeft: buff.duration });
  }
  recalculatePlayerStats(player);
  world.effects.addText(player.x, player.y - player.radius - 28, buff.name, { color: buff.color || '#ffd166', size: 14 });
  world.pushHud(true);
  return buff;
};

/** 逐帧推进 buff（含中毒持续伤害） */
export const updateBuffs = (world, deltaTime) => {
  const player = world.player;
  if (!player.buffs.length) {
    return;
  }
  let expired = false;
  for (let index = player.buffs.length - 1; index >= 0; index--) {
    const buff = player.buffs[index];
    buff.timeLeft -= deltaTime;
    if (buff.dot > 0 && player.alive) {
      buff.dotTimer -= deltaTime;
      if (buff.dotTimer <= 0) {
        buff.dotTimer = 0.6;
        applyDamage(world, null, player, { multiplier: buff.dot, knockback: 0, noText: true, color: buff.color });
      }
    }
    if (buff.timeLeft <= 0) {
      player.buffs.splice(index, 1);
      expired = true;
    }
  }
  if (expired) {
    recalculatePlayerStats(player);
    world.pushHud(true);
  }
};

/* ------------------------------------------------------------------ */
/* 打坐 / 传功（channel）                                              */
/* ------------------------------------------------------------------ */

/**
 * 开始一段不能移动的打坐
 * @param {Object} world 世界实例
 * @param {Object} options { id, name, duration, color, onComplete, onInterrupt }
 */
export const startChannel = (world, options) => {
  world.channel = {
    id: options.id,
    name: options.name,
    color: options.color || '#8fd0ff',
    duration: options.duration,
    timer: 0,
    onComplete: options.onComplete,
    onInterrupt: options.onInterrupt,
  };
  world.notify(`开始${options.name} · 期间无法移动，受击即散功`, options.color || '#8fd0ff');
  world.pushHud(true);
};

/** 打断打坐 */
export const interruptChannel = (world, reason = '受击') => {
  const channel = world.channel;
  if (!channel) {
    return false;
  }
  world.channel = null;
  world.effects.addText(world.player.x, world.player.y - world.player.radius - 26, `${reason} · 散功`, {
    color: '#ff8a7a',
    size: 14,
  });
  if (channel.onInterrupt) {
    channel.onInterrupt(world, reason);
  }
  world.pushHud(true);
  return true;
};

/** 推进打坐进度 */
const updateChannel = (world, deltaTime) => {
  const channel = world.channel;
  if (!channel) {
    return;
  }
  if (!world.player.alive) {
    world.channel = null;
    return;
  }
  // 开功 0.15s 后仍带着受击闪烁，说明这一炷香被打断了（hitFlash 由受击写入，避免与 combat 循环依赖）
  if (channel.timer > 0.15 && world.player.hitFlash > 0) {
    interruptChannel(world, '受击');
    return;
  }
  channel.timer += deltaTime;
  if (channel.timer >= channel.duration) {
    world.channel = null;
    channel.onComplete(world);
    world.pushHud(true);
  }
};

/* ------------------------------------------------------------------ */
/* 27 条奇遇结算                                                        */
/* ------------------------------------------------------------------ */

const RESOLVERS = {
  /* ---- 绝世神功 ---- */
  'whiteApe:take': (world) => {
    if (Math.random() < 0.5) {
      killPlayer(world);
      return result('九阳焚身', ['猿腹中的真气顺着伤口灌进经脉，你连一声都没喊出来。', '江湖上只留下一具被烧空的躯壳。'], '#ff6b6b');
    }
    const loss = hurtPlayer(world, 0.9);
    const skill = world.learnSkill('nine-yang');
    return result('九阳神功', [`你撑过来了，代价是 ${loss} 点气血。`, `习得《${skill ? skill.name : '九阳神功'}》：气血 +45%、攻击 +30%。`], '#ff9b5a');
  },
  'sweepingMonk:take': (world) => {
    const loss = hurtPlayer(world, 0.5);
    world.learnSkill('yi-jin-sutra');
    return result('接下一掌', [`僧人的掌力透体而过，你吐出一口血（-${loss}）。`, '他把《易筋经》放在你手里，又低头去擦地了。'], '#ffd166');
  },
  'swordTomb:take': (world) => {
    world.player.hp = Math.max(1, Math.round(world.player.hp * 0.55));
    world.learnSkill('twenty-nine-swords');
    addTreasure(world, 'brokenArm');
    return result('剑冢拔剑', ['你咬牙断去一臂，魔剑嗡鸣着出鞘。', '习得《二十九剑》；永久 -15% 攻击（断臂）。'], '#c9a6ff');
  },
  'taixuanCave:take': (world) => {
    startChannel(world, {
      id: 'taixuan',
      name: '参悟蝌蚪文',
      duration: ENCOUNTER_CONFIG.TAIXUAN_CHANNEL,
      color: '#7be3ff',
      onComplete: (innerWorld) => {
        addTreasure(innerWorld, 'taixuanEssence');
        innerWorld.learnSkill('taixuan-wave');
        innerWorld.notify('参悟成功 · 全属性 +10%，悟出「太玄真气」', '#7be3ff');
      },
      onInterrupt: (innerWorld) => {
        hurtPlayer(innerWorld, 0.3);
        innerWorld.notify('走火 · 石壁机关打伤了你', '#ff6b6b');
      },
    });
    return result('原地打坐', ['你盘膝坐下，闭目参详石壁上的蝌蚪文。', '十秒内不可移动，受击即散功。'], '#7be3ff');
  },
  'lightPeak:take': (world) => {
    if (Math.random() < 0.3) {
      addTreasure(world, 'qiankunShift');
      return result('乾坤大挪移', ['两团真气终于被你理顺，心法记在了骨子里。', '习得被动：受击时反弹 30% 伤害。'], '#8fd0ff');
    }
    const lost = loseRandomSkillStack(world);
    return result('走火入魔', ['真气逆行，你一口血喷在石壁上。', lost ? `遗失了《${lost.name}》的一层修炼。` : '所幸你身无长技，没什么可丢的。'], '#ff6b6b');
  },

  /* ---- 武功秘籍 ---- */
  'cassock:take': (world) => {
    const hadSister = livingCompanions(world).some((mate) => mate.typeId === 'juniorSister');
    world.learnSkill('sunflower-manual');
    addTreasure(world, 'mockCassock');
    const lines = ['你披上袈裟，指尖忽然快得看不清。', '习得《葵花宝典》；从此旁人看你，眼里总带着一点瞧不起。'];
    if (hadSister) {
      lines.push('小师妹捂着鼻子退开三步：「恶心。」说罢转身下山，再没回头。');
    }
    return result('葵花宝典', lines, '#ff6bd6');
  },
  'cliffSword:take': (world) => {
    const levels = shiftLevel(world, -1);
    world.learnSkill('dugu-nine-swords');
    return result('独孤九剑', ['前辈只演示了一遍，剑意却已刻进你脑子。', `修为清零${levels < 0 ? '，境界跌落一级' : ''}。习得《独孤九剑》。`], '#dfe9ff');
  },
  'starHermit:take': (world) => {
    addTreasure(world, 'shenmuDing');
    addBuff(world, {
      id: 'shenmu-poison',
      name: '神木鼎毒',
      icon: '毒',
      color: '#a6e35a',
      duration: 20,
      dot: 2 + Math.round(world.player.maxHp * 0.006),
      dotTimer: 0.6,
    });
    return result('取走神木鼎', ['小鼎一入手，绿雾顺着掌纹钻进血脉。', '攻击从此附带中毒；但你自己先中了 20 秒的毒。'], '#a6e35a');
  },
  'zhouBotong:take': (world) => {
    if (Math.random() < 0.5) {
      world.learnSkill('left-right-fight');
      return result('猜拳赢了', ['老顽童瞪大眼睛，随即大笑：「好！教你个双手互搏！」', '习得《左右互搏》：出手间隔 -28%，普攻 +40%。'], '#8ef0d5');
    }
    const skill = pickNormalSkill(world);
    if (skill) {
      world.learnSkill(skill.id);
    }
    return result('猜拳输了', ['老顽童笑得满地打滚，笑够了塞给你一本薄册子。', skill ? `习得《${skill.name}》。` : '册子上的东西你早会了。'], '#c6a86c');
  },
  'toadStyle:take': (world) => {
    world.learnSkill('toad-skill');
    world.effects.addText(world.player.x, world.player.y - world.player.radius - 30, '咕呱！咕呱！', { color: '#9fe07a', size: 18 });
    world.effects.addRing(world.player.x, world.player.y, 220, '#9fe07a', { life: 0.7, lineWidth: 3 });
    return result('蛤蟆功', ['你趴在地上叫了三声，怪人满意地点了点头。', '习得《蛤蟆功》；发功时的叫声会把附近敌人引来看热闹。'], '#9fe07a');
  },

  /* ---- 队友与人物 ---- */
  'juniorSister:take': (world) => {
    const sister = spawnCompanion(world, 'juniorSister', world.player.level + 1);
    if (!sister) {
      return result('小师妹', [
        '她站在人后看了你一眼，又低头看了看你的手。',
        '「你……你练的那个。」她退了半步，「我回去吧。」',
        '小师妹不肯入队：她不齿《葵花宝典》。',
      ], '#c6a86c');
    }
    return result('小师妹', [
      '你替她挨了师父一顿骂，她红着眼追上来，说什么也要跟着。',
      '小师妹入队：会跟你一起打人，也会替你挨刀。',
      `她自己也练功——你每多一次抉择，她便自行领悟一本秘籍（火候只有六成）。`,
    ], '#ffd3ea');
  },
  'deafMaster:take': (world) => {
    world.player.masterPlan = { remaining: ENCOUNTER_CONFIG.MASTER_TIMES, timer: ENCOUNTER_CONFIG.MASTER_INTERVAL };
    return result('拜师', ['老人拍拍你的头，比划着：每过一阵便来传你一手。', '此后每 30 秒传功一次，共 3 次；传功时无法移动。'], '#c9e8ff');
  },
  'huangRong:helpThief': (world) => {
    addBuff(world, {
      id: 'chicken',
      name: '叫花鸡',
      icon: '鸡',
      color: '#ffb347',
      duration: 60,
      attackMultiplier: 0.25,
      moveMultiplier: 0.2,
    });
    const hunter = spawnNearby(world, 'hongqigong', world.player.level + 6, { huntSeconds: 60, leavesAfterHunt: true, distance: 380 });
    hunter.typeName = '洪七公';
    return result('偷鸡成功', ['鸡到手了，香得你眼泪都下来了；身后传来一声暴喝：「小贼站住！」', '获得「叫花鸡」60 秒（攻击 +25%、移速 +20%），洪七公追杀你 60 秒。'], '#ffb347');
  },
  'huangRong:stopThief': (world) => {
    world.learnSkill('dragon-subdue');
    return result('拦下偷鸡贼', ['你一把揪住偷鸡贼的后领。洪七公抚掌大笑：「好小子，有几分侠气。」', '习得《降龙十八掌》。'], '#ff7b5a');
  },
  'woundedFoe:finish': (world) => {
    const exp = 40 * world.player.level;
    grantExpAmount(world, exp);
    return result('补刀', ['你没有犹豫。他咽气前看了你一眼，像早就知道。', `吞噬修为 +${exp}。`], '#c6a86c');
  },
  'woundedFoe:save': (world) => {
    const ally = spawnCompanion(world, 'woundedAlly', Math.max(1, world.player.level), { guardFatal: true });
    ally.typeName = '知恩图报的敌人';
    return result('替他包扎', ['他挣扎着要跪下，被你扶住。「这条命，往后是你的。」', '随从入队：会在你重伤时替你挡下致命一击（仅一次）。'], '#8ef0d5');
  },
  'beggarPurse:take': (world) => {
    world.learnSkill('dog-beating');
    if (!world.extraEnemyTypes.includes('beggarElder')) {
      world.extraEnemyTypes.push('beggarElder');
    }
    return result('夺回钱袋', ['小乞丐欢天喜地，乔峰从树后走出，把一套棒法使给你看。', '习得《打狗棒法》；但丐帮长老心生嫉妒，此后地图上会多出「丐帮长老」。'], '#e0d8a8');
  },

  /* ---- 坑爹与幽默 ---- */
  'darkInn:take': (world) => {
    const levels = shiftLevel(world, -2);
    addBuff(world, {
      id: 'daze',
      name: '蒙汗药力',
      icon: '醉',
      color: '#ffb347',
      duration: 30,
      moveMultiplier: 0.3,
      damageReduction: 0.2,
    });
    return result('一碗蒙汗药', [`你眼前一黑，醒来时包袱空了一半（境界 ${levels} 级）。`, '药力还没散：30 秒内移速 +30%、减伤 +20%。'], '#ffb347');
  },
  'scammer:take': (world) => {
    world.learnSkill('fake-dragon');
    return result('假秘籍', ['翻开第一页你就不对劲了——招式画得像模像样，却越看越别扭。', '习得《假·降龙十八掌》：出招 30% 概率自己转晕，晕过就撕书。'], '#ffb347');
  },
  'braggart:take': (world) => {
    const skill = pickNormalSkill(world);
    if (skill) {
      world.learnSkill(skill.id);
    }
    return result('鼓掌捧场', ['大汉一高兴，从怀里掏出一本不知翻过多少遍的册子塞给你。', skill ? `习得《${skill.name}》。` : '册子里的你早就会了。'], '#c6a86c');
  },
  'brat:take': (world) => {
    spawnNearby(world, 'brat', Math.max(1, world.player.level - 2), { distance: 180, huntSeconds: 20 });
    const dad = spawnNearby(world, 'bratDad', world.player.level + 7, { alwaysHuntPlayer: true, distance: 520 });
    dad.typeName = '熊孩子他爹';
    return result('追上去', ['小孩一屁股坐在地上放声大哭：「爹——有人打我！」', '一位高等级侠客提着刀从坡上冲了下来。'], '#ffb347');
  },
  'beauty:take': (world) => {
    const loss = hurtPlayer(world, 0.2);
    world.learnSkill('xiaoao-song');
    return result('上前搭讪', [`她笑着抬手，你连人带剑飞出去三丈（-${loss}）。`, '「胆子不小。」她丢下一卷琴谱，转身走了。习得《笑傲江湖曲》。'], '#a8f0d0');
  },
  'arena:take': (world) => {
    addTreasure(world, 'mengzhuToken');
    const loss = hurtPlayer(world, 0.4);
    return result('盟主令牌', [`一场恶斗，你赢了，也脱了层皮（-${loss}）。`, '攻击 +12%、气血 +18%、防御 +8；代价是修为获取 -30%（升级变慢）。', '宝物可丢弃销毁（HUD 宝物栏右键）。'], '#ffd166');
  },
  'chest:take': (world) => {
    const roll = Math.random();
    if (roll < 0.6) {
      const skill = pickNormalSkill(world);
      if (skill) {
        world.learnSkill(skill.id);
        return result('密道宝箱', ['锁簧弹开，箱底躺着一本册子。', `习得《${skill.name}》。`], '#ffd166');
      }
      const itemId = pickRandom(['greatPill', 'shield', 'speed']);
      spawnItem(world, itemId, world.player.x + 30, world.player.y + 24);
      return result('密道宝箱', ['锁簧弹开，箱底滚出一件物事。', '拾取掉落物查看效果。'], '#ffd166');
    }
    if (roll < 0.9) {
      const loss = hurtPlayer(world, 0.35);
      return result('触发机关', ['「咔」的一声——你只来得及后仰，一排毒针还是扎进了肩头。', `失去 ${loss} 点气血。`], '#ff8a7a');
    }
    return result('密道宝箱', ['箱子空空如也，只有一层灰。', '有人比你早来一步。'], '#c6a86c');
  },

  /* ---- 机缘与福利 ---- */
  'hotSpring:take': (world) => {
    world.player.hp = world.player.maxHp;
    addBuff(world, {
      id: 'refreshed',
      name: '神清气爽',
      icon: '爽',
      color: '#7be3ff',
      duration: 30,
      moveMultiplier: 0.12,
      regenPerSecond: 0.006,
      cooldownDelta: 0.08,
    });
    return result('山中温泉', ['热水漫过肩膀，筋骨一寸寸松开。', '气血回满，获得「神清气爽」30 秒。'], '#7be3ff');
  },
  'meteor:take': (world) => {
    const roll = Math.random();
    if (roll < 0.34) {
      const exp = 220 * world.player.level;
      grantExpAmount(world, exp);
      return result('流星许愿', ['你许了个愿——天上那颗星忽然拐了个弯，直直落进你怀里。', `修为 +${exp}。`], '#7be3ff');
    }
    if (roll < 0.68) {
      addBuff(world, {
        id: 'meteor-power',
        name: '星辰加身',
        icon: '星',
        color: '#ffe9b8',
        duration: 30,
        attackMultiplier: 0.35,
        critBonus: 0.12,
      });
      return result('流星许愿', ['星光落在肩头，你听见自己骨节噼啪作响。', '30 秒内攻击 +35%、暴击 +12%。'], '#ffe9b8');
    }
    return result('流星许愿', ['你闭着眼认真许愿，睁开眼时流星已经没了。', '什么也没发生。'], '#c6a86c');
  },
  'corpse:take': (world) => {
    const skill = pickNormalSkill(world);
    if (skill && Math.random() < 0.6) {
      world.learnSkill(skill.id);
      return result('前人遗骸', ['字条上写着：「后来者，替我多喝两碗酒。」', `你从他怀中取出一本《${skill.name}》。`], '#c9a6ff');
    }
    const itemId = pickRandom(['greatPill', 'shield', 'speed', 'heal']);
    spawnItem(world, itemId, world.player.x + 26, world.player.y + 30);
    return result('前人遗骸', ['字条上只有一句：「江湖路远，别学我死在半途。」', '遗物散落在脚边。'], '#c9a6ff');
  },
  'peddler:take': (world) => {
    const player = world.player;
    const cost = Math.round(player.exp * 0.4);
    player.exp = Math.max(0, player.exp - cost);
    const roll = Math.random();
    if (roll < 0.22) {
      spawnItem(world, 'greatPill', player.x + 34, player.y + 20);
      return result('行脚商人', [`转盘停在「大还丹」上，可你付了 ${cost} 点修为。`, '丹药就摆在脚边。'], '#ffcc55');
    }
    if (roll < 0.45) {
      const skill = pickNormalSkill(world);
      if (skill) {
        world.learnSkill(skill.id);
        return result('行脚商人', [`转盘停在「秘籍」上，商人笑眯眯地递来一本（-${cost} 修为）。`, `习得《${skill.name}》。`], '#ffd166');
      }
    }
    if (roll < 0.7) {
      spawnItem(world, 'shield', player.x + 30, player.y + 24);
      return result('行脚商人', [`转盘停在「护体符」上（-${cost} 修为）。`, '聊胜于无。'], '#9aa8ff');
    }
    if (roll < 0.88) {
      const more = Math.round(player.exp * 0.5);
      player.exp = Math.max(0, player.exp - more);
      return result('行脚商人', ['转盘停在「谢谢惠顾」上，商人的笑更灿烂了。', `你又多付了 ${more} 点修为。`], '#ff8a7a');
    }
    return result('行脚商人', ['转盘转到一半散架了，商人尴尬地把车推走了。', '你什么也没得到。'], '#c6a86c');
  },
  'mural:take': (world) => {
    const roll = Math.random();
    if (roll < 0.34) {
      const exp = 180 * world.player.level;
      grantExpAmount(world, exp);
      return result('古寺壁画', ['你跟着壁画的走势呼吸，一炷香后忽然通体舒畅。', `修为 +${exp}。`], '#7be3ff');
    }
    if (roll < 0.67) {
      world.learnSkill('yi-jin-sutra');
      return result('古寺壁画', ['笔锋走势暗合筋脉，你看着看着，忽然懂了。', '习得《易筋经》。'], '#ffd166');
    }
    return result('古寺壁画', ['你看了半天，只觉得画得挺好看。', '什么也没悟到。'], '#c6a86c');
  },
};

/**
 * 结算一次奇遇选择
 * @param {Object} world 世界实例
 * @param {String} encounterId 奇遇 id
 * @param {String} choiceId 选项 id
 * @returns {Object} { title, lines, color }
 */
export const resolveEncounter = (world, encounterId, choiceId) => {
  const config = getEncounter(encounterId);
  const resolver = RESOLVERS[`${encounterId}:${choiceId}`];
  if (resolver) {
    return resolver(world);
  }
  if (config && choiceId === 'leave') {
    return result('转身离开', [`你没有理会「${config.name}」。`, '江湖事多，走为上策。'], '#c6a86c');
  }
  return result('无事发生', ['你犹豫了片刻，机会已经过去了。'], '#c6a86c');
};

/* ------------------------------------------------------------------ */
/* 逐帧推进                                                            */
/* ------------------------------------------------------------------ */

/** 地图上奇遇标记的存活与触发检测 */
const updateTokens = (world, deltaTime) => {
  const player = world.player;
  for (let index = world.encounterTokens.length - 1; index >= 0; index--) {
    const token = world.encounterTokens[index];
    token.life -= deltaTime;
    token.phase += deltaTime * 2.2;
    if (token.life <= 0) {
      world.encounterTokens.splice(index, 1);
      continue;
    }
    if (world.pendingEncounter || world.pendingEncounterResult || world.channel) {
      continue;
    }
    if (!player.alive) {
      continue;
    }
    const reach = player.radius + token.radius + ENCOUNTER_CONFIG.TRIGGER_PADDING;
    if (distanceBetween(player.x, player.y, token.x, token.y) <= reach) {
      openEncounter(world, token);
    }
  }

  if (world.encounterTokens.length >= ENCOUNTER_CONFIG.MAX_ON_MAP) {
    return;
  }
  if (world.time < ENCOUNTER_CONFIG.FIRST_DELAY) {
    return;
  }
  world.encounterTimer -= deltaTime;
  if (world.encounterTimer <= 0) {
    world.encounterTimer = randomRange(ENCOUNTER_CONFIG.INTERVAL_MIN, ENCOUNTER_CONFIG.INTERVAL_MAX);
    spawnEncounterToken(world);
  }
};

/** 神木鼎中毒在敌人身上跳伤 */
const updatePoison = (world, deltaTime) => {
  world.enemies.forEach((enemy) => {
    if (!enemy.alive || !(enemy.poisonTimer > 0)) {
      return;
    }
    enemy.poisonTimer -= deltaTime;
    enemy.poisonTick -= deltaTime;
    if (enemy.poisonTick > 0) {
      return;
    }
    enemy.poisonTick = 0.6;
    const damage = Math.max(1, Math.round(enemy.poisonDamage || 1));
    enemy.hp -= damage;
    enemy.hitFlash = Math.max(enemy.hitFlash, 0.1);
    world.effects.addText(enemy.x, enemy.y - enemy.radius - 4, `${damage}`, { color: '#a6e35a', size: 12 });
    if (enemy.hp <= 0) {
      killEntity(world, enemy, world.player.alive ? world.player : null);
    }
  });
};

/** 追杀计时：洪七公追满 60 秒会骂骂咧咧走人 */
const updateHunts = (world, deltaTime) => {
  world.enemies.forEach((enemy) => {
    if (!enemy.alive || enemy.forcedHuntTimer === undefined || enemy.forcedHuntTimer === null) {
      return;
    }
    if (!Number.isFinite(enemy.forcedHuntTimer)) {
      return;
    }
    enemy.forcedHuntTimer -= deltaTime;
    if (enemy.forcedHuntTimer > 0) {
      return;
    }
    enemy.forcedHuntTimer = null;
    if (enemy.leavesAfterHunt) {
      enemy.alive = false;
      world.notify(`${enemy.typeName} 骂骂咧咧地走了`, '#c6a86c');
      world.effects.addParticles(enemy.x, enemy.y, { count: 12, color: enemy.accent, speed: 160, size: 2.6, life: 0.5 });
    }
  });
};

/** 聋哑先生的传功计划 */
const updateMasterPlan = (world, deltaTime) => {
  const plan = world.player.masterPlan;
  if (!plan || plan.remaining <= 0 || world.channel || !world.player.alive) {
    return;
  }
  plan.timer -= deltaTime;
  if (plan.timer > 0) {
    return;
  }
  plan.timer = ENCOUNTER_CONFIG.MASTER_INTERVAL;
  startChannel(world, {
    id: 'master',
    name: '受师父传功',
    duration: ENCOUNTER_CONFIG.MASTER_CHANNEL,
    color: '#c9e8ff',
    onComplete: (innerWorld) => {
      innerWorld.learnSkill('meihua-hand');
      const left = innerWorld.player.masterPlan ? innerWorld.player.masterPlan.remaining - 1 : 0;
      if (innerWorld.player.masterPlan) {
        innerWorld.player.masterPlan.remaining = Math.max(0, left);
      }
      innerWorld.notify(left > 0 ? `学得一手折梅手 · 师父还欠你 ${left} 次传功` : '三次传功已毕 · 师父飘然远去', '#c9e8ff');
    },
    onInterrupt: (innerWorld) => {
      if (innerWorld.player.masterPlan) {
        innerWorld.player.masterPlan.timer = 12;
      }
    },
  });
};

/**
 * 奇遇主循环（由 world.step 调用）
 * @param {Object} world 世界实例
 * @param {Number} deltaTime 帧间隔
 */
export const updateEncounters = (world, deltaTime) => {
  updateTokens(world, deltaTime);
  updateBuffs(world, deltaTime);
  updateChannel(world, deltaTime);
  updatePoison(world, deltaTime);
  updateHunts(world, deltaTime);
  updateMasterPlan(world, deltaTime);
  updateTaunts(world, deltaTime);
};

/** 清空奇遇状态（调试 / 新开一局） */
export const resetEncounterState = (world) => {
  world.encounterTokens = [];
  world.encounterTimer = 0;
  world.pendingEncounter = null;
  world.pendingEncounterResult = null;
  world.channel = null;
  world.tauntTimer = 0;
  world.lastTauntText = '';
  world.extraEnemyTypes = [];
  const player = world.player;
  player.buffs = [];
  player.treasures = [];
  player.masterPlan = null;
};
