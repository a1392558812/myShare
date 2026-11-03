/**
 * 嘲讽气泡台词表（v1.9.4）
 * 玩家练了「旁门功法」后，路过的敌人会偶尔说一句风凉话或甩个表情
 * 纯数据：core/taunts.js 读，draw/renderer.js 画
 */

export const TAUNTS = {
  sunflower: {
    id: 'sunflower',
    skillId: 'sunflower-manual',
    tone: '#ffb3d1',
    emojis: ['🪡', '💅', '🤭', '😂', '🙄', '🤣'],
    lines: [
      { text: '哟，这位是……公公？', emoji: '🤭' },
      { text: '难怪身法这么快，了无牵挂啊', emoji: '💅' },
      { text: '诸位让让，别碰坏了公公的绣花针', emoji: '🪡' },
      { text: '这针法，比我家娘子还细', emoji: '😂' },
      { text: '练这玩意儿图啥呢？', emoji: '🙄' },
      { text: '兄弟，你的嗓音好像变了', emoji: '🤣' },
      { text: '公公早啊，今日气色不错', emoji: '🤭' },
    ],
  },
  toad: {
    id: 'toad',
    skillId: 'toad-skill',
    tone: '#9fe07a',
    emojis: ['🐸', '🤢', '😂', '🥴', '🤣'],
    lines: [
      { text: '哪来的蛤蟆，呱呱叫的', emoji: '🐸' },
      { text: '一身蛤蟆肉，倒是挺肥', emoji: '🤢' },
      { text: '喂，你会吐毒液吗？', emoji: '😂' },
      { text: '蹲那儿，像极了村口池塘那位', emoji: '🐸' },
      { text: '这功夫是跟癞蛤蟆学的吧', emoji: '🤣' },
      { text: '别蹦了，蹦得我眼晕', emoji: '🥴' },
      { text: '炖一锅，够三桌人吃', emoji: '🤢' },
    ],
  },
  cassock: {
    id: 'cassock',
    treasureId: 'mockCassock',
    tone: '#c9a6ff',
    emojis: ['🙏', '😂', '🙄', '🤣'],
    lines: [
      { text: '呸，练那玩意儿的', emoji: '🙄' },
      { text: '穿这一身，还修行呢？', emoji: '😂' },
      { text: '阿弥陀佛，罪过罪过', emoji: '🙏' },
      { text: '施主，回头是岸啊', emoji: '🤣' },
    ],
  },
};

/** 纯表情气泡（不说话）的概率 */
export const TAUNT_EMOJI_ONLY_RATIO = 0.45;
