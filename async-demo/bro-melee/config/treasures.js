/**
 * 奇遇宝物（永久留在身上的东西，可好可坏）
 * 字段会被 core/stats.js 的 recalculatePlayerStats 读取并合并进被动乘区
 * 行为型字段（poisonOnHit / reflect / taunt）由 combat / encounters 读取
 */

export const TREASURES = {
  shenmuDing: {
    id: 'shenmuDing',
    name: '神木鼎',
    icon: '鼎',
    color: '#a6e35a',
    description: '攻击命中令目标中毒 4 秒，每秒损失 18% 攻击力的气血',
    poisonOnHit: true,
    discardable: true,
  },
  mengzhuToken: {
    id: 'mengzhuToken',
    name: '盟主令牌',
    icon: '令',
    color: '#ffd166',
    description: '攻击 +12%、气血 +18%、防御 +8；代价是修为获取 -30%',
    attackMultiplier: 0.12,
    hpMultiplier: 0.18,
    defenseFlat: 8,
    expMultiplier: 0.7,
    discardable: true,
  },
  qiankunShift: {
    id: 'qiankunShift',
    name: '乾坤大挪移',
    icon: '乾',
    color: '#8fd0ff',
    description: '受击时反弹 30% 伤害给攻击者',
    reflect: 0.3,
    discardable: false,
  },
  taixuanEssence: {
    id: 'taixuanEssence',
    name: '太玄真意',
    icon: '玄',
    color: '#7be3ff',
    description: '全属性 +10%（攻 / 血 / 防 / 速）',
    attackMultiplier: 0.1,
    hpMultiplier: 0.1,
    defenseFlat: 10,
    moveMultiplier: 0.1,
    discardable: false,
  },
  brokenArm: {
    id: 'brokenArm',
    name: '断臂',
    icon: '臂',
    color: '#c98a8a',
    description: '为拔魔剑自断一臂，永久 -15% 攻击',
    attackMultiplier: -0.15,
    discardable: false,
  },
  mockCassock: {
    id: 'mockCassock',
    name: '葵花袈裟',
    icon: '裟',
    color: '#ff6bd6',
    description: '旁人见了你会露出瞧不起的神色（彩蛋）',
    taunt: true,
    discardable: false,
  },
};

/** 通过 id 取宝物定义 */
export const getTreasure = (treasureId) => TREASURES[treasureId] || null;

/** 战斗类宝物是否在身上（供 combat 判定） */
export const hasTreasure = (entity, treasureId) => {
  return Boolean(entity && entity.treasures && entity.treasures.includes(treasureId));
};
