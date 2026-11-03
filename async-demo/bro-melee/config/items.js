/**
 * 道具配置（README §7.1）
 * 拾取效果在 core/items.js 中按 id 实现，这里只描述数据
 */

export const ITEM_TYPES = [
  {
    id: 'expBook',
    name: '经验书',
    color: '#7be3ff',
    radius: 9,
    weight: 46,
    rarity: 'common',
    expPerLevel: 20,
    description: '吞下他人修为，直接获得经验',
  },
  {
    id: 'heal',
    name: '金创药',
    color: '#ff7272',
    radius: 9,
    weight: 26,
    rarity: 'common',
    healRatio: 0.3,
    description: '回复 30% 最大生命',
  },
  {
    id: 'shield',
    name: '护体符',
    color: '#9aa8ff',
    radius: 9,
    weight: 9,
    rarity: 'rare',
    shieldRatio: 0.35,
    duration: 10,
    description: '获得 35% 最大生命的护盾',
  },
  {
    id: 'speed',
    name: '疾风符',
    color: '#8bf08b',
    radius: 9,
    weight: 9,
    rarity: 'rare',
    speedMultiplier: 1.45,
    duration: 8,
    description: '8 秒内移速 +45%',
  },
  {
    id: 'greatPill',
    name: '大还丹',
    color: '#ffcc55',
    radius: 11,
    weight: 4,
    rarity: 'epic',
    expPerLevel: 70,
    description: '一颗抵七本经验书',
  },
];

/** 通过 id 取道具配置 */
export const getItemType = (itemId) => {
  return ITEM_TYPES.find((item) => item.id === itemId) || ITEM_TYPES[0];
};

/** 加权随机一种道具（可按稀有度过滤） */
export const pickItemType = (options = {}) => {
  const excludedIds = options.excludedIds || [];
  const candidates = ITEM_TYPES.filter((item) => {
    return !excludedIds.includes(item.id);
  });
  const totalWeight = candidates.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  for (let index = 0; index < candidates.length; index++) {
    roll -= candidates[index].weight;
    if (roll <= 0) {
      return candidates[index];
    }
  }
  return candidates[candidates.length - 1];
};
