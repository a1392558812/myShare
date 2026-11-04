/**
 * 奇遇表（README §21）
 * 只放数据与文案，结算逻辑在 core/encounters.js 的 RESOLVERS 中按 `${id}:${choiceId}` 实现
 * choices[].tone: risk 有代价 / safe 稳妥 / alt 另一条路
 */

export const ENCOUNTER_CATEGORIES = [
  { id: 'ultimate', name: '绝世神功', color: '#ff6b6b' },
  { id: 'manual', name: '武功秘籍', color: '#c9a6ff' },
  { id: 'companion', name: '队友与人物', color: '#8ef0d5' },
  { id: 'troll', name: '坑爹与幽默', color: '#ffb347' },
  { id: 'fortune', name: '机缘与福利', color: '#7be3ff' },
];

const leave = (hint = '不冒这个险，转身就走') => ({ id: 'leave', label: '离开', hint, tone: 'safe' });

export const ENCOUNTERS = [
  /* ---------------- 一、绝世神功 ---------------- */
  {
    id: 'whiteApe',
    once: true,
    category: 'ultimate',
    name: '白猿腹内《九阳神功》',
    icon: '猿',
    hook: '一头白猿倒在崖边，腹中竟有书页翻动之声。传闻九阳真经就藏在它腹中。',
    choices: [
      { id: 'take', label: '剖开猿腹取书', hint: '五成当场暴毙；活下来失去 90% 气血，习得《九阳神功》', tone: 'risk' },
      leave('留它一条性命'),
    ],
  },
  {
    id: 'sweepingMonk',
    once: true,
    category: 'ultimate',
    name: '藏经阁 · 扫地僧',
    icon: '僧',
    hook: '扫地老僧慢悠悠擦着地砖，头也不抬：「接我一掌，或可得《易筋经》。」',
    choices: [
      { id: 'take', label: '接他一掌', hint: '失去 50% 气血，习得《易筋经》', tone: 'risk' },
      leave('绕开这位深不可测的老人'),
    ],
  },
  {
    id: 'swordTomb',
    once: true,
    category: 'ultimate',
    name: '剑冢拔剑',
    icon: '冢',
    hook: '荒山剑冢，石碑上插着一把邪气升腾的魔剑，碑文写着「欲执此剑，先舍一臂」。',
    choices: [
      { id: 'take', label: '自断一臂，拔剑', hint: '永久 -15% 攻击，习得《二十九剑》（命中留下破绽，对破绽暴击 +60%）', tone: 'risk' },
      leave('碑文不似玩笑'),
    ],
  },
  {
    id: 'taixuanCave',
    once: true,
    category: 'ultimate',
    name: '太玄经洞',
    icon: '玄',
    hook: '山洞石壁刻满蝌蚪文，看久了竟觉气机流转。需原地打坐参悟，期间不能动。',
    choices: [
      { id: 'take', label: '打坐参悟（10 秒）', hint: '参悟被打断会被石壁机关打伤，失去 30% 气血', tone: 'risk' },
      leave('蝌蚪文看得头晕'),
    ],
  },
  {
    id: 'lightPeak',
    once: true,
    category: 'ultimate',
    name: '光明顶密道',
    icon: '乾',
    hook: '密道尽头两团真气纠缠不休，正是《乾坤大挪移》的心法。',
    choices: [
      { id: 'take', label: '运功参修', hint: '三成得法（反弹 30% 伤害）；七成走火入魔，随机遗失一层秘籍', tone: 'risk' },
      leave('真气看着就凶'),
    ],
  },

  /* ---------------- 二、武功秘籍 ---------------- */
  {
    id: 'cassock',
    once: true,
    category: 'manual',
    name: '神秘袈裟',
    icon: '裟',
    hook: '一件袈裟挂在枯枝上，上面绣着「欲练神功……」四个字，后面被血糊住了。',
    choices: [
      { id: 'take', label: '披上袈裟', hint: '习得《葵花宝典》；此后旁人见你会露出瞧不起的神色', tone: 'risk' },
      leave('这字看着不祥'),
    ],
  },
  {
    id: 'cliffSword',
    once: true,
    category: 'manual',
    name: '思过崖剑谱',
    icon: '独',
    hook: '思过崖上一位独臂前辈背对着你，只留下一句：「剑法在此，代价自付。」',
    choices: [
      { id: 'take', label: '上前求剑', hint: '习得《独孤九剑》，但修为清零并跌一级', tone: 'risk' },
      leave('前辈的背影有点冷'),
    ],
  },
  {
    id: 'starHermit',
    once: true,
    category: 'manual',
    name: '星宿老怪遗物',
    icon: '鼎',
    hook: '奇怪的山洞里闪着绿光和绿雾，正中摆着一只小鼎，鼎身爬满毒纹。',
    choices: [
      { id: 'take', label: '取走神木鼎', hint: '攻击附带中毒；取宝时自身中毒 20 秒', tone: 'risk' },
      leave('绿雾吸进肺里不舒服'),
    ],
  },
  {
    id: 'zhouBotong',
    category: 'manual',
    name: '周伯通猜拳',
    icon: '拳',
    hook: '老顽童拦住你，非要玩「左右互搏猜拳」，输了不许走。',
    choices: [
      { id: 'take', label: '陪他猜三局', hint: '五成赢：《左右互搏》；输了送一本普通秘籍', tone: 'alt' },
      leave('没空陪他玩'),
    ],
  },
  {
    id: 'toadStyle',
    category: 'manual',
    name: '蛤蟆功',
    icon: '蛤',
    hook: '沼泽边的怪人非要你学他蛤蟆叫三声，才肯传功。',
    choices: [
      { id: 'take', label: '咕呱——咕呱——', hint: '习得《蛤蟆功》；发功时的叫声会把附近敌人引来看热闹', tone: 'risk' },
      leave('这姿势太丢人'),
    ],
  },

  /* ---------------- 三、队友与人物 ---------------- */
  {
    id: 'juniorSister',
    once: true,
    category: 'companion',
    name: '小师妹',
    icon: '妹',
    hook: '小师妹下山采购，贪玩误了时辰，正被师父罚跪。她偷偷看你，眼里全是求救。',
    choices: [
      { id: 'take', label: '替她担下这顿骂', hint: '小师妹跟随你闯荡江湖，并肩作战', tone: 'alt' },
      leave('多一事不如少一事'),
    ],
  },
  {
    id: 'deafMaster',
    once: true,
    category: 'companion',
    name: '聋哑先生',
    icon: '哑',
    hook: '一位聋哑高人拦住你，比划半天，意思是要收你为徒传《天山折梅手》。',
    choices: [
      { id: 'take', label: '跪下拜师', hint: '此后每 30 秒传功一次，共 3 次；传功期间无法移动', tone: 'alt' },
      leave('看不懂他的手势'),
    ],
  },
  {
    id: 'huangRong',
    once: true,
    category: 'companion',
    name: '黄蓉的烧鸡',
    icon: '鸡',
    hook: '有人偷了洪七公的烧鸡，洪七公满山追得鸡飞狗跳，一个丫头在树后冲你使眼色。',
    choices: [
      { id: 'helpThief', label: '帮她偷鸡', hint: '得「叫花鸡」buff；但洪七公要追打你 60 秒', tone: 'risk' },
      { id: 'stopThief', label: '帮她拦住偷鸡贼', hint: '得洪七公赏识，习得《降龙十八掌》', tone: 'alt' },
      leave('洪七公的棍子看着很疼'),
    ],
  },
  {
    id: 'woundedFoe',
    once: true,
    category: 'companion',
    name: '受伤的敌人',
    icon: '伤',
    hook: '路边躺着一个重伤的敌人，气若游丝，身上隐约有秘籍光泽。',
    choices: [
      { id: 'finish', label: '补上一刀', hint: '立刻吞噬他的等级（大量修为）', tone: 'risk' },
      { id: 'save', label: '替他包扎', hint: '他感恩成为随从，并在你重伤时替你挡致命一击', tone: 'alt' },
    ],
  },
  {
    id: 'beggarPurse',
    once: true,
    category: 'companion',
    name: '丐帮弟子求助',
    icon: '丐',
    hook: '小乞丐的钱袋被几个地痞抢了，他抱着你的腿不肯撒手。',
    choices: [
      { id: 'take', label: '替他夺回钱袋', hint: '乔峰传《打狗棒法》；但丐帮长老嫉妒，地图开始刷新「丐帮长老」', tone: 'risk' },
      leave('丐帮的事不好掺和'),
    ],
  },

  /* ---------------- 四、坑爹与幽默 ---------------- */
  {
    id: 'darkInn',
    category: 'troll',
    name: '黑店蒙汗药',
    icon: '店',
    hook: '荒郊破庙挂着「悦来客栈」的招牌，掌柜笑得过分热情，茶水里漂着白沫。',
    choices: [
      { id: 'take', label: '坐下喝一碗', hint: '失去 2 级修为，但药力上头：30 秒内移速 +30%、减伤 +20%', tone: 'risk' },
      leave('这茶不敢喝'),
    ],
  },
  {
    id: 'scammer',
    category: 'troll',
    name: '江湖骗子',
    icon: '骗',
    hook: '有人兜售《降龙十八掌》，价格便宜得离谱，封皮还是新画的。',
    choices: [
      { id: 'take', label: '买下这本秘籍', hint: '《假·降龙十八掌》：出招 30% 概率自己眩晕 2 秒，晕过就没了', tone: 'risk' },
      leave('便宜没好货'),
    ],
  },
  {
    id: 'braggart',
    category: 'troll',
    name: '吹牛大侠',
    icon: '吹',
    hook: '酒馆里有人拍桌吹嘘自己独闯光明顶，周围一片叫好，就差你这一声。',
    choices: [
      { id: 'take', label: '鼓掌捧场', hint: '他一高兴，送你一本很普通的秘籍', tone: 'safe' },
      leave('懒得搭理'),
    ],
  },
  {
    id: 'brat',
    once: true,
    category: 'troll',
    name: '熊孩子',
    icon: '娃',
    hook: '一个小孩抢了你的经验书就跑，还回头做了个鬼脸。',
    choices: [
      { id: 'take', label: '追上去', hint: '他哭喊着叫来他爹——一位高等级侠客，护短开战', tone: 'risk' },
      leave('一本经验书而已'),
    ],
  },
  {
    id: 'beauty',
    category: 'troll',
    name: '神秘美女',
    icon: '姬',
    hook: '路边一位绝色女子向你招手，笑意盈盈，指尖却按着剑柄。',
    choices: [
      { id: 'take', label: '上前搭讪', hint: '被教训一顿（轻伤），但她觉得你有胆识，赠《笑傲江湖曲》', tone: 'risk' },
      leave('太美的女子多半有毒'),
    ],
  },
  {
    id: 'arena',
    category: 'troll',
    name: '武林擂台',
    icon: '擂',
    hook: '有人摆下擂台挑战武林盟主，胜者可得盟主令牌。台上那位正冲你招手。',
    choices: [
      { id: 'take', label: '上台一战', hint: '得「盟主令牌」：永久强化，但升级变慢；失去 40% 气血；可丢弃销毁', tone: 'risk' },
      leave('不接这个擂'),
    ],
  },
  {
    id: 'chest',
    category: 'troll',
    name: '密道宝箱',
    icon: '箱',
    hook: '密道尽头有一只上锁的铜箱，锁扣上缠着几根断掉的细线。',
    choices: [
      { id: 'take', label: '撬锁', hint: '六成得秘籍或道具，三成触发机关受伤，一成是空的', tone: 'risk' },
      leave('断线说明有人试过'),
    ],
  },

  /* ---------------- 五、机缘与福利 ---------------- */
  {
    id: 'hotSpring',
    category: 'fortune',
    name: '山中温泉',
    icon: '泉',
    hook: '山坳里一处热气腾腾的温泉，水面映着天光，四下无人。',
    choices: [
      { id: 'take', label: '下水泡一泡', hint: '回满气血，得「神清气爽」30 秒', tone: 'safe' },
      leave('赶路要紧'),
    ],
  },
  {
    id: 'meteor',
    category: 'fortune',
    name: '流星许愿',
    icon: '星',
    hook: '夜空中划过一颗流星，快得像谁把剑扔上了天。',
    choices: [
      { id: 'take', label: '闭眼许愿', hint: '随机：大经验书 / 强力 buff / 什么都没有', tone: 'safe' },
      leave('愿望留在心里'),
    ],
  },
  {
    id: 'corpse',
    category: 'fortune',
    name: '前人遗骸',
    icon: '骸',
    hook: '一具坐化的前辈遗骸靠在山壁上，掌心还压着一张字条。',
    choices: [
      { id: 'take', label: '上前搜身', hint: '得随机遗物（秘籍或道具），并读到一段遗书', tone: 'safe' },
      leave('不惊扰亡者'),
    ],
  },
  {
    id: 'peddler',
    category: 'fortune',
    name: '行脚商人',
    icon: '商',
    hook: '一位推着独轮车的行脚商人拦住你，车上一只木转盘吱呀作响。',
    choices: [
      { id: 'take', label: '花修为转一次（当前经验的 40%）', hint: '可能惊喜，也可能血亏', tone: 'risk' },
      leave('不赌'),
    ],
  },
  {
    id: 'mural',
    category: 'fortune',
    name: '古寺壁画',
    icon: '画',
    hook: '古寺壁画上画着奇异的运功图，笔锋走势竟像在引导呼吸。',
    choices: [
      { id: 'take', label: '照着参详', hint: '可能得大量修为，可能参悟《易筋经》，也可能一无所获', tone: 'safe' },
      leave('看不懂'),
    ],
  },
];

/** 通过 id 取奇遇定义 */
export const getEncounter = (encounterId) => {
  return ENCOUNTERS.find((entry) => entry.id === encounterId) || null;
};

/** 通过 id 取分类配色 */
export const getEncounterCategory = (categoryId) => {
  return ENCOUNTER_CATEGORIES.find((entry) => entry.id === categoryId) || ENCOUNTER_CATEGORIES[0];
};
