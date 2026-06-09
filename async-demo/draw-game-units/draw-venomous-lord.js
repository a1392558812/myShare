/**
 * 绘制剧毒领主怪物 - 蛇首人身、原始野蛮风格
 * @param {CanvasElement} canvasRef canvas元素
 * @param {Object} currentUnit 剧毒领主位置和状态
 * @param {Number} currentUnit.x 剧毒领主x坐标
 * @param {Number} currentUnit.y 剧毒领主y坐标
 * @param {Number} currentUnit.size 剧毒领主大小(px)
 * @param {String} currentUnit.direction 方向 'down' | 'up' | 'left' | 'right'
 * @param {Number} currentUnit.frame 动画帧 0-1
 */

export const config = {
  IDLE_SPEED: 0.004,
  WALK_SPEED: 0.1,
}

// 剧毒领主颜色（土黄/褐绿/原始野蛮色 + 毒绿发光）
const LORD_COLORS = {
  // 蛇头 - 鳞色
  scale: '#8A7A3A',          // 蛇鳞主色 - 土黄
  scaleLight: '#B8A85A',     // 蛇鳞亮
  scaleDark: '#5A4A2A',      // 蛇鳞暗
  scaleShadow: '#3A2A1A',    // 蛇鳞阴影
  belly: '#D8C88A',          // 腹鳞 - 浅黄
  bellyLight: '#E8D8A8',     // 腹鳞亮
  bellyDark: '#A89868',      // 腹鳞暗
  // 角/骨刺
  horn: '#6A5A4A',          // 角/骨 - 灰褐色
  hornDark: '#4A3A2A',      // 角暗
  hornLight: '#8A7A5A',     // 角亮
  // 眼睛 - 毒绿竖瞳
  eye: '#00FF00',           // 眼主 - 毒绿
  eyeGlow: '#80FF80',       // 眼发光
  eyeSlit: '#000000',       // 竖瞳
  eyeInner: '#FFFFFF',      // 内核
  // 舌头
  tongue: '#AA3366',        // 粉红舌头
  tongueDark: '#662244',    // 舌暗
  // 毒牙
  fang: '#E8E8D8',          // 毒牙 - 白黄
  fangDark: '#A8A888',      // 牙暗
  // 身体 - 野蛮皮肤
  skin: '#A88A5A',          // 皮肤主 - 褐黄
  skinLight: '#C8A87A',     // 皮肤亮
  skinDark: '#6A5A3A',      // 皮肤暗
  // 草编/粗布衣服
  cloth: '#5A6A3A',         // 粗布主 - 褐绿
  clothDark: '#3A4A2A',     // 粗布暗
  clothLight: '#7A8A4A',    // 粗布亮
  clothRough: '#4A5A2A',    // 粗布粗糙
  // 皮革/皮带
  leather: '#6A4A2A',       // 皮革主
  leatherDark: '#4A2A1A',   // 皮革暗
  leatherLight: '#8A6A3A',  // 皮革亮
  // 骨头/骨饰
  bone: '#D8D0B8',          // 骨头 - 灰白黄
  boneDark: '#A8A088',      // 骨暗
  boneLight: '#F0E8D8',     // 骨亮
  // 毒液/符文
  venom: '#00FF00',          // 毒液 - 毒绿
  venomGlow: '#80FF80',      // 毒液发光
  venomDark: '#00AA00',     // 毒液暗
  rune: '#AAFF00',           // 毒符文 - 亮绿
  runeGlow: '#CCFF66',      // 符文发光
  // 武器 - 骨刺/石矛
  spear: '#6A5A3A',         // 矛柄
  spearDark: '#4A3A1A',     // 矛柄暗
  spearBone: '#D8D0B8',     // 骨刺 - 骨色
  spearBoneDark: '#A8A088', // 骨刺暗
  spearTip: '#E8E8D8',      // 矛尖
  // 羽毛/头饰
  feather: '#AA4433',       // 羽毛红
  featherDark: '#662211',   // 羽毛暗
  featherLight: '#DD6644',  // 羽毛亮
  feather2: '#AA8833',      // 羽毛黄
  // 毒雾/灵气
  poison: '#80FF80',        // 毒雾
  poisonLight: '#C0FFC0',   // 毒雾亮
  poisonDark: '#40D040',    // 毒雾暗
  droplet: '#00FF66',       // 毒液滴
  spark: '#FFFFFF',         // 粒子
  // 鳞片
  plateScale: '#7A6A3A',    // 身鳞
  plateScaleLight: '#9A8A5A', // 身鳞亮
  highlight: '#FFFFFF',       // 高光
}

// 剧毒领主高精度头像（16x16网格，聚焦蛇头特写）
const LORD_AVATAR = [
  // ===== 头顶骨刺/角 =====
  [5, 0, LORD_COLORS.hornDark], [6, 0, LORD_COLORS.horn], [7, 0, LORD_COLORS.horn], [8, 0, LORD_COLORS.hornDark],
  [4, 1, LORD_COLORS.horn], [5, 1, LORD_COLORS.hornLight], [6, 1, LORD_COLORS.scale], [7, 1, LORD_COLORS.scale], [8, 1, LORD_COLORS.hornLight], [9, 1, LORD_COLORS.horn],
  [3, 2, LORD_COLORS.hornDark], [4, 2, LORD_COLORS.horn], [5, 2, LORD_COLORS.scaleLight], [6, 2, LORD_COLORS.scale], [7, 2, LORD_COLORS.scale], [8, 2, LORD_COLORS.scaleLight], [9, 2, LORD_COLORS.horn], [10, 2, LORD_COLORS.hornDark],

  // ===== 蛇头主体 =====
  [2, 3, LORD_COLORS.scaleDark], [3, 3, LORD_COLORS.scale], [4, 3, LORD_COLORS.scaleLight], [5, 3, LORD_COLORS.scale], [6, 3, LORD_COLORS.scaleLight], [7, 3, LORD_COLORS.scale], [8, 3, LORD_COLORS.scaleLight], [9, 3, LORD_COLORS.scale], [10, 3, LORD_COLORS.scaleDark],
  [2, 4, LORD_COLORS.scaleDark], [3, 4, LORD_COLORS.scale], [4, 4, LORD_COLORS.scaleLight], [5, 4, LORD_COLORS.scale], [6, 4, LORD_COLORS.scaleLight], [7, 4, LORD_COLORS.scale], [8, 4, LORD_COLORS.scaleLight], [9, 4, LORD_COLORS.scale], [10, 4, LORD_COLORS.scaleDark],

  // ===== 眼睛行（竖瞳毒眼）=====
  [2, 5, LORD_COLORS.scaleDark], [3, 5, LORD_COLORS.scale], [4, 5, LORD_COLORS.eye], [5, 5, LORD_COLORS.eyeGlow], [6, 5, LORD_COLORS.eyeGlow], [7, 5, LORD_COLORS.eye], [8, 5, LORD_COLORS.eyeGlow], [9, 5, LORD_COLORS.eyeGlow], [10, 5, LORD_COLORS.scale], [11, 5, LORD_COLORS.scaleDark],
  // 眼睛高光
  [4, 4, LORD_COLORS.highlight], [5, 4, LORD_COLORS.highlight], [8, 4, LORD_COLORS.highlight], [9, 4, LORD_COLORS.highlight],
  // 竖瞳效果
  [4, 5, LORD_COLORS.eyeSlit], [5, 5, LORD_COLORS.eyeSlit], [8, 5, LORD_COLORS.eyeSlit], [9, 5, LORD_COLORS.eyeSlit],
  // 眼睛内核发光
  [4, 5, LORD_COLORS.eyeInner], [5, 5, LORD_COLORS.eyeInner], [8, 5, LORD_COLORS.eyeInner], [9, 5, LORD_COLORS.eyeInner],

  // ===== 鼻部/鳞纹 =====
  [3, 6, LORD_COLORS.scale], [4, 6, LORD_COLORS.scaleDark], [5, 6, LORD_COLORS.scale], [6, 6, LORD_COLORS.scaleDark], [7, 6, LORD_COLORS.scale], [8, 6, LORD_COLORS.scaleDark], [9, 6, LORD_COLORS.scale], [10, 6, LORD_COLORS.scaleDark],
  [3, 7, LORD_COLORS.scaleDark], [4, 7, LORD_COLORS.scale], [5, 7, LORD_COLORS.scaleLight], [6, 7, LORD_COLORS.scale], [7, 7, LORD_COLORS.scaleLight], [8, 7, LORD_COLORS.scale], [9, 7, LORD_COLORS.scaleLight], [10, 7, LORD_COLORS.scale],

  // ===== 嘴巴/毒牙 =====
  [4, 8, LORD_COLORS.scaleDark], [5, 8, LORD_COLORS.fang], [6, 8, LORD_COLORS.fang], [7, 8, LORD_COLORS.tongue], [8, 8, LORD_COLORS.tongue], [9, 8, LORD_COLORS.fang], [10, 8, LORD_COLORS.fang], [11, 8, LORD_COLORS.scaleDark],
  [5, 9, LORD_COLORS.fangDark], [6, 9, LORD_COLORS.fang], [7, 9, LORD_COLORS.tongueDark], [8, 9, LORD_COLORS.tongueDark], [9, 9, LORD_COLORS.fang], [10, 9, LORD_COLORS.fangDark],
  [5, 10, LORD_COLORS.fang], [6, 10, LORD_COLORS.fang], [7, 10, LORD_COLORS.tongue], [8, 10, LORD_COLORS.tongue], [9, 10, LORD_COLORS.fang], [10, 10, LORD_COLORS.fang],

  // ===== 下颚 =====
  [4, 11, LORD_COLORS.scaleDark], [5, 11, LORD_COLORS.scale], [6, 11, LORD_COLORS.scale], [7, 11, LORD_COLORS.scaleDark], [8, 11, LORD_COLORS.scale], [9, 11, LORD_COLORS.scale], [10, 11, LORD_COLORS.scaleDark],
  [5, 12, LORD_COLORS.scale], [6, 12, LORD_COLORS.scaleDark], [7, 12, LORD_COLORS.scaleDark], [8, 12, LORD_COLORS.scaleDark], [9, 12, LORD_COLORS.scale],

  // ===== 颈部 =====
  [4, 13, LORD_COLORS.scale], [5, 13, LORD_COLORS.belly], [6, 13, LORD_COLORS.bellyLight], [7, 13, LORD_COLORS.bellyLight], [8, 13, LORD_COLORS.belly], [9, 13, LORD_COLORS.scale],
  [5, 14, LORD_COLORS.scaleDark], [6, 14, LORD_COLORS.belly], [7, 14, LORD_COLORS.bellyLight], [8, 14, LORD_COLORS.belly], [9, 14, LORD_COLORS.scaleDark],

  // ===== 羽毛头饰 =====
  [2, 2, LORD_COLORS.feather], [3, 2, LORD_COLORS.featherLight],
  [11, 2, LORD_COLORS.feather2], [12, 2, LORD_COLORS.featherDark],

  // ===== 毒液符文 =====
  [5, 10, LORD_COLORS.venomGlow], [6, 10, LORD_COLORS.rune],
  [9, 10, LORD_COLORS.rune], [10, 10, LORD_COLORS.venomGlow],
  [6, 11, LORD_COLORS.venom], [9, 11, LORD_COLORS.venom],

  // ===== 毒液滴 =====
  [5, 9, LORD_COLORS.droplet], [10, 9, LORD_COLORS.droplet],
  [6, 8, LORD_COLORS.spark], [9, 8, LORD_COLORS.spark],
]

// 向下面朝 - 蛇首正面
const LORD_FACE_DOWN = [
  // ===== 蛇头顶 + 角/骨刺 =====
  [5, 0, LORD_COLORS.hornDark], [6, 0, LORD_COLORS.horn], [7, 0, LORD_COLORS.hornDark],
  [4, 1, LORD_COLORS.horn], [5, 1, LORD_COLORS.scale], [6, 1, LORD_COLORS.scaleLight], [7, 1, LORD_COLORS.scale], [8, 1, LORD_COLORS.horn],
  [3, 2, LORD_COLORS.hornDark], [4, 2, LORD_COLORS.scaleLight], [5, 2, LORD_COLORS.scale], [6, 2, LORD_COLORS.scaleLight], [7, 2, LORD_COLORS.scale], [8, 2, LORD_COLORS.scaleLight], [9, 2, LORD_COLORS.hornDark],

  // ===== 蛇头主体 =====
  [3, 3, LORD_COLORS.scaleDark], [4, 3, LORD_COLORS.scale], [5, 3, LORD_COLORS.scaleLight], [6, 3, LORD_COLORS.scale], [7, 3, LORD_COLORS.scaleLight], [8, 3, LORD_COLORS.scale], [9, 3, LORD_COLORS.scaleDark],
  [3, 4, LORD_COLORS.scaleDark], [4, 4, LORD_COLORS.scale], [5, 4, LORD_COLORS.eye], [6, 4, LORD_COLORS.eyeGlow], [7, 4, LORD_COLORS.eyeGlow], [8, 4, LORD_COLORS.eye], [9, 4, LORD_COLORS.scale], [10, 4, LORD_COLORS.scaleDark],
  [3, 5, LORD_COLORS.scaleDark], [4, 5, LORD_COLORS.scale], [5, 5, LORD_COLORS.eyeInner], [6, 5, LORD_COLORS.eyeSlit], [7, 5, LORD_COLORS.eyeSlit], [8, 5, LORD_COLORS.eyeInner], [9, 5, LORD_COLORS.scale], [10, 5, LORD_COLORS.scaleDark],
  [4, 6, LORD_COLORS.scale], [5, 6, LORD_COLORS.scaleDark], [6, 6, LORD_COLORS.scale], [7, 6, LORD_COLORS.scale], [8, 6, LORD_COLORS.scaleDark], [9, 6, LORD_COLORS.scale],

  // ===== 蛇嘴/毒牙 =====
  [4, 7, LORD_COLORS.scaleDark], [5, 7, LORD_COLORS.fang], [6, 7, LORD_COLORS.tongue], [7, 7, LORD_COLORS.tongue], [8, 7, LORD_COLORS.fang], [9, 7, LORD_COLORS.scaleDark],
  [5, 8, LORD_COLORS.fangDark], [6, 8, LORD_COLORS.tongueDark], [7, 8, LORD_COLORS.tongueDark], [8, 8, LORD_COLORS.fangDark],

  // ===== 颈部（蛇鳞）=====
  [4, 9, LORD_COLORS.scale], [5, 9, LORD_COLORS.scaleDark], [6, 9, LORD_COLORS.scale], [7, 9, LORD_COLORS.scale], [8, 9, LORD_COLORS.scaleDark], [9, 9, LORD_COLORS.scale],
  [4, 10, LORD_COLORS.scaleDark], [5, 10, LORD_COLORS.belly], [6, 10, LORD_COLORS.bellyLight], [7, 10, LORD_COLORS.bellyLight], [8, 10, LORD_COLORS.belly], [9, 10, LORD_COLORS.scaleDark],

  // ===== 身体（粗布/皮革）=====
  [2, 11, LORD_COLORS.leatherDark], [3, 11, LORD_COLORS.cloth], [4, 11, LORD_COLORS.clothLight], [5, 11, LORD_COLORS.bone], [6, 11, LORD_COLORS.rune], [7, 11, LORD_COLORS.rune], [8, 11, LORD_COLORS.bone], [9, 11, LORD_COLORS.clothLight], [10, 11, LORD_COLORS.cloth], [11, 11, LORD_COLORS.leatherDark],
  [2, 12, LORD_COLORS.leather], [3, 12, LORD_COLORS.clothDark], [4, 12, LORD_COLORS.cloth], [5, 12, LORD_COLORS.clothLight], [6, 12, LORD_COLORS.runeGlow], [7, 12, LORD_COLORS.runeGlow], [8, 12, LORD_COLORS.clothLight], [9, 12, LORD_COLORS.cloth], [10, 12, LORD_COLORS.clothDark], [11, 12, LORD_COLORS.leather],
  [3, 13, LORD_COLORS.leatherDark], [4, 13, LORD_COLORS.cloth], [5, 13, LORD_COLORS.clothRough], [6, 13, LORD_COLORS.cloth], [7, 13, LORD_COLORS.cloth], [8, 13, LORD_COLORS.clothRough], [9, 13, LORD_COLORS.cloth], [10, 13, LORD_COLORS.leatherDark],

  // ===== 手臂/肩（原始皮肤）=====
  [1, 10, LORD_COLORS.skinDark], [2, 10, LORD_COLORS.skin],
  [0, 11, LORD_COLORS.skin], [1, 11, LORD_COLORS.skinLight], [2, 11, LORD_COLORS.skin],
  [0, 12, LORD_COLORS.skinDark], [1, 12, LORD_COLORS.skin], [2, 12, LORD_COLORS.skinDark],

  [11, 10, LORD_COLORS.skin], [12, 10, LORD_COLORS.skinDark],
  [11, 11, LORD_COLORS.skin], [12, 11, LORD_COLORS.skinLight], [13, 11, LORD_COLORS.skin],
  [11, 12, LORD_COLORS.skinDark], [12, 12, LORD_COLORS.skin], [13, 12, LORD_COLORS.skinDark],

  // ===== 腰带（皮革）=====
  [3, 14, LORD_COLORS.leather], [4, 14, LORD_COLORS.leatherLight], [5, 14, LORD_COLORS.bone], [6, 14, LORD_COLORS.leather], [7, 14, LORD_COLORS.leather], [8, 14, LORD_COLORS.bone], [9, 14, LORD_COLORS.leatherLight], [10, 14, LORD_COLORS.leather],

  // ===== 腿/脚（原始皮肤 + 骨饰）=====
  [4, 15, LORD_COLORS.skin], [5, 15, LORD_COLORS.skinLight], [6, 15, LORD_COLORS.bone], [7, 15, LORD_COLORS.bone], [8, 15, LORD_COLORS.skinLight], [9, 15, LORD_COLORS.skin],

  // ===== 左手（持骨刺矛）=====
  [0, 13, LORD_COLORS.spearDark],
  [0, 14, LORD_COLORS.spear],
  [0, 15, LORD_COLORS.spearDark],
  [1, 13, LORD_COLORS.spearBone],
  [1, 14, LORD_COLORS.spearBoneDark],
  [1, 15, LORD_COLORS.venomDark],

  // ===== 右手（持骨盾/骨刺）=====
  [12, 13, LORD_COLORS.bone], [13, 13, LORD_COLORS.boneDark],
  [12, 14, LORD_COLORS.boneLight], [13, 14, LORD_COLORS.venom],
  [12, 15, LORD_COLORS.bone], [13, 15, LORD_COLORS.boneDark],

  // ===== 羽毛/头饰点缀 =====
  [2, 2, LORD_COLORS.feather],
  [10, 2, LORD_COLORS.feather2],

  // ===== 毒液灵气 =====
  [4, 15, LORD_COLORS.venom], [9, 15, LORD_COLORS.venom],
  [5, 8, LORD_COLORS.droplet], [8, 8, LORD_COLORS.droplet],
]

// 向上面朝 - 蛇头背面
const LORD_FACE_UP = [
  // ===== 蛇头背面 + 角/骨刺 =====
  [5, 0, LORD_COLORS.horn], [6, 0, LORD_COLORS.scaleDark], [7, 0, LORD_COLORS.horn],
  [4, 1, LORD_COLORS.scale], [5, 1, LORD_COLORS.scaleLight], [6, 1, LORD_COLORS.scale], [7, 1, LORD_COLORS.scaleLight], [8, 1, LORD_COLORS.scale],
  [3, 2, LORD_COLORS.scaleDark], [4, 2, LORD_COLORS.scale], [5, 2, LORD_COLORS.scaleLight], [6, 2, LORD_COLORS.scale], [7, 2, LORD_COLORS.scaleLight], [8, 2, LORD_COLORS.scale], [9, 2, LORD_COLORS.scaleDark],

  // ===== 蛇头背面主体 =====
  [3, 3, LORD_COLORS.scaleDark], [4, 3, LORD_COLORS.scale], [5, 3, LORD_COLORS.scaleLight], [6, 3, LORD_COLORS.scale], [7, 3, LORD_COLORS.scaleLight], [8, 3, LORD_COLORS.scale], [9, 3, LORD_COLORS.scaleDark],
  [3, 4, LORD_COLORS.scaleDark], [4, 4, LORD_COLORS.scale], [5, 4, LORD_COLORS.scaleLight], [6, 4, LORD_COLORS.scale], [7, 4, LORD_COLORS.scaleLight], [8, 4, LORD_COLORS.scale], [9, 4, LORD_COLORS.scaleDark],
  [4, 5, LORD_COLORS.scale], [5, 5, LORD_COLORS.scaleDark], [6, 5, LORD_COLORS.scale], [7, 5, LORD_COLORS.scale], [8, 5, LORD_COLORS.scaleDark], [9, 5, LORD_COLORS.scale],
  [4, 6, LORD_COLORS.scaleDark], [5, 6, LORD_COLORS.scale], [6, 6, LORD_COLORS.scaleDark], [7, 6, LORD_COLORS.scaleDark], [8, 6, LORD_COLORS.scale], [9, 6, LORD_COLORS.scaleDark],

  // ===== 颈部（蛇鳞背面）=====
  [4, 7, LORD_COLORS.scale], [5, 7, LORD_COLORS.scaleLight], [6, 7, LORD_COLORS.scale], [7, 7, LORD_COLORS.scale], [8, 7, LORD_COLORS.scaleLight], [9, 7, LORD_COLORS.scale],
  [4, 8, LORD_COLORS.scaleDark], [5, 8, LORD_COLORS.scale], [6, 8, LORD_COLORS.scaleLight], [7, 8, LORD_COLORS.scaleLight], [8, 8, LORD_COLORS.scale], [9, 8, LORD_COLORS.scaleDark],

  // ===== 身体背面（粗布）=====
  [2, 9, LORD_COLORS.leatherDark], [3, 9, LORD_COLORS.cloth], [4, 9, LORD_COLORS.clothLight], [5, 9, LORD_COLORS.cloth], [6, 9, LORD_COLORS.clothLight], [7, 9, LORD_COLORS.clothLight], [8, 9, LORD_COLORS.cloth], [9, 9, LORD_COLORS.clothLight], [10, 9, LORD_COLORS.cloth], [11, 9, LORD_COLORS.leatherDark],
  [2, 10, LORD_COLORS.leather], [3, 10, LORD_COLORS.clothDark], [4, 10, LORD_COLORS.cloth], [5, 10, LORD_COLORS.clothLight], [6, 10, LORD_COLORS.bone], [7, 10, LORD_COLORS.bone], [8, 10, LORD_COLORS.clothLight], [9, 10, LORD_COLORS.cloth], [10, 10, LORD_COLORS.clothDark], [11, 10, LORD_COLORS.leather],
  [3, 11, LORD_COLORS.leatherDark], [4, 11, LORD_COLORS.cloth], [5, 11, LORD_COLORS.clothRough], [6, 11, LORD_COLORS.cloth], [7, 11, LORD_COLORS.cloth], [8, 11, LORD_COLORS.clothRough], [9, 11, LORD_COLORS.cloth], [10, 11, LORD_COLORS.leatherDark],
  [3, 12, LORD_COLORS.leather], [4, 12, LORD_COLORS.clothDark], [5, 12, LORD_COLORS.cloth], [6, 12, LORD_COLORS.clothLight], [7, 12, LORD_COLORS.clothLight], [8, 12, LORD_COLORS.cloth], [9, 12, LORD_COLORS.clothDark], [10, 12, LORD_COLORS.leather],

  // ===== 腰带 =====
  [3, 13, LORD_COLORS.leatherDark], [4, 13, LORD_COLORS.leather], [5, 13, LORD_COLORS.bone], [6, 13, LORD_COLORS.leather], [7, 13, LORD_COLORS.leather], [8, 13, LORD_COLORS.bone], [9, 13, LORD_COLORS.leather], [10, 13, LORD_COLORS.leatherDark],

  // ===== 腿/脚 =====
  [4, 14, LORD_COLORS.skinDark], [5, 14, LORD_COLORS.skin], [6, 14, LORD_COLORS.skinLight], [7, 14, LORD_COLORS.skinLight], [8, 14, LORD_COLORS.skin], [9, 14, LORD_COLORS.skinDark],
  [4, 15, LORD_COLORS.skin], [5, 15, LORD_COLORS.skinLight], [6, 15, LORD_COLORS.skin], [7, 15, LORD_COLORS.skin], [8, 15, LORD_COLORS.skinLight], [9, 15, LORD_COLORS.skin],

  // ===== 羽毛/骨刺装饰（背面）=====
  [5, 2, LORD_COLORS.feather],
  [7, 2, LORD_COLORS.feather2],
  [6, 1, LORD_COLORS.bone],

  // ===== 手臂/肩（背面）=====
  [2, 8, LORD_COLORS.skin], [1, 8, LORD_COLORS.skinDark],
  [2, 9, LORD_COLORS.skinLight], [1, 9, LORD_COLORS.skin],

  [11, 8, LORD_COLORS.skin], [12, 8, LORD_COLORS.skinDark],
  [11, 9, LORD_COLORS.skinLight], [12, 9, LORD_COLORS.skin],

  // ===== 武器（背面斜挂）=====
  [13, 8, LORD_COLORS.spearBone],
  [13, 9, LORD_COLORS.spear],
  [13, 10, LORD_COLORS.spearDark],
  [13, 11, LORD_COLORS.spear],

  // ===== 毒雾 =====
  [5, 15, LORD_COLORS.venom], [8, 15, LORD_COLORS.venom],
  [6, 15, LORD_COLORS.venomGlow], [7, 15, LORD_COLORS.venomGlow],
]

// 向左面朝 - 侧面（蛇头向左）
const LORD_FACE_LEFT = [
  // ===== 蛇头顶 + 角 =====
  [4, 0, LORD_COLORS.hornDark], [5, 0, LORD_COLORS.scale], [6, 0, LORD_COLORS.scaleLight], [7, 0, LORD_COLORS.horn],
  [3, 1, LORD_COLORS.horn], [4, 1, LORD_COLORS.scaleLight], [5, 1, LORD_COLORS.scale], [6, 1, LORD_COLORS.scaleLight], [7, 1, LORD_COLORS.scale],

  // ===== 蛇头侧面 =====
  [2, 2, LORD_COLORS.scaleDark], [3, 2, LORD_COLORS.scale], [4, 2, LORD_COLORS.scaleLight], [5, 2, LORD_COLORS.scale], [6, 2, LORD_COLORS.scaleLight], [7, 2, LORD_COLORS.scale],
  [1, 3, LORD_COLORS.scaleDark], [2, 3, LORD_COLORS.scale], [3, 3, LORD_COLORS.scaleLight], [4, 3, LORD_COLORS.scale], [5, 3, LORD_COLORS.scaleLight], [6, 3, LORD_COLORS.scale], [7, 3, LORD_COLORS.scaleDark],
  [1, 4, LORD_COLORS.scaleDark], [2, 4, LORD_COLORS.scale], [3, 4, LORD_COLORS.eye], [4, 4, LORD_COLORS.eyeGlow], [5, 4, LORD_COLORS.eyeInner], [6, 4, LORD_COLORS.scale], [7, 4, LORD_COLORS.scaleDark],
  [1, 5, LORD_COLORS.scaleDark], [2, 5, LORD_COLORS.scale], [3, 5, LORD_COLORS.eyeGlow], [4, 5, LORD_COLORS.eyeSlit], [5, 5, LORD_COLORS.eyeSlit], [6, 5, LORD_COLORS.scale], [7, 5, LORD_COLORS.scaleDark],
  [2, 6, LORD_COLORS.scaleDark], [3, 6, LORD_COLORS.scale], [4, 6, LORD_COLORS.scaleDark], [5, 6, LORD_COLORS.scale], [6, 6, LORD_COLORS.scaleDark],

  // ===== 蛇嘴 =====
  [1, 7, LORD_COLORS.scaleDark], [2, 7, LORD_COLORS.scale], [3, 7, LORD_COLORS.fang], [4, 7, LORD_COLORS.tongue], [5, 7, LORD_COLORS.scale],
  [2, 8, LORD_COLORS.scaleDark], [3, 8, LORD_COLORS.fangDark], [4, 8, LORD_COLORS.tongueDark], [5, 8, LORD_COLORS.scaleDark],

  // ===== 颈部 =====
  [3, 9, LORD_COLORS.scale], [4, 9, LORD_COLORS.scaleDark], [5, 9, LORD_COLORS.scale], [6, 9, LORD_COLORS.scale],
  [4, 10, LORD_COLORS.belly], [5, 10, LORD_COLORS.bellyLight], [6, 10, LORD_COLORS.belly],

  // ===== 身体侧面（粗布）=====
  [3, 10, LORD_COLORS.cloth], [4, 10, LORD_COLORS.clothLight], [5, 10, LORD_COLORS.cloth], [6, 10, LORD_COLORS.clothLight], [7, 10, LORD_COLORS.cloth], [8, 10, LORD_COLORS.clothDark],
  [2, 11, LORD_COLORS.leatherDark], [3, 11, LORD_COLORS.cloth], [4, 11, LORD_COLORS.bone], [5, 11, LORD_COLORS.rune], [6, 11, LORD_COLORS.cloth], [7, 11, LORD_COLORS.clothLight], [8, 11, LORD_COLORS.cloth], [9, 11, LORD_COLORS.leatherDark],
  [2, 12, LORD_COLORS.leather], [3, 12, LORD_COLORS.clothDark], [4, 12, LORD_COLORS.cloth], [5, 12, LORD_COLORS.runeGlow], [6, 12, LORD_COLORS.cloth], [7, 12, LORD_COLORS.clothLight], [8, 12, LORD_COLORS.cloth], [9, 12, LORD_COLORS.leather],
  [3, 13, LORD_COLORS.leatherDark], [4, 13, LORD_COLORS.cloth], [5, 13, LORD_COLORS.clothRough], [6, 13, LORD_COLORS.cloth], [7, 13, LORD_COLORS.cloth], [8, 13, LORD_COLORS.leatherDark],

  // ===== 腰带 =====
  [3, 14, LORD_COLORS.leather], [4, 14, LORD_COLORS.leatherLight], [5, 14, LORD_COLORS.bone], [6, 14, LORD_COLORS.leather], [7, 14, LORD_COLORS.leatherLight], [8, 14, LORD_COLORS.leather],

  // ===== 腿/脚 =====
  [4, 15, LORD_COLORS.skin], [5, 15, LORD_COLORS.skinLight], [6, 15, LORD_COLORS.skin], [7, 15, LORD_COLORS.skinLight], [8, 15, LORD_COLORS.skin],

  // ===== 左手（前出，持骨刺矛）=====
  [0, 9, LORD_COLORS.skinDark],
  [0, 10, LORD_COLORS.skin],
  [0, 11, LORD_COLORS.skinLight], [1, 11, LORD_COLORS.spearBone],
  [0, 12, LORD_COLORS.skin], [1, 12, LORD_COLORS.spear],
  [0, 13, LORD_COLORS.skinDark], [1, 13, LORD_COLORS.spearDark],
  [1, 14, LORD_COLORS.spearBone],
  [1, 15, LORD_COLORS.venom],

  // ===== 右手（后方，握骨盾）=====
  [9, 10, LORD_COLORS.skin], [10, 10, LORD_COLORS.skinDark],
  [9, 11, LORD_COLORS.skinLight], [10, 11, LORD_COLORS.skin],
  [9, 12, LORD_COLORS.skin], [10, 12, LORD_COLORS.bone], [11, 12, LORD_COLORS.boneDark],
  [10, 13, LORD_COLORS.boneLight], [11, 13, LORD_COLORS.venom],
  [10, 14, LORD_COLORS.bone], [11, 14, LORD_COLORS.boneDark],

  // ===== 羽毛装饰 =====
  [2, 1, LORD_COLORS.feather],
  [8, 0, LORD_COLORS.feather2],

  // ===== 毒液滴 =====
  [1, 15, LORD_COLORS.droplet],
]

// 向右面朝 - 侧面镜像（蛇头向右）
const LORD_FACE_RIGHT = [
  // ===== 蛇头顶 + 角 =====
  [4, 0, LORD_COLORS.horn], [5, 0, LORD_COLORS.scaleLight], [6, 0, LORD_COLORS.scale], [7, 0, LORD_COLORS.hornDark],
  [3, 1, LORD_COLORS.scale], [4, 1, LORD_COLORS.scaleLight], [5, 1, LORD_COLORS.scale], [6, 1, LORD_COLORS.scaleLight], [7, 1, LORD_COLORS.horn],

  // ===== 蛇头侧面 =====
  [4, 2, LORD_COLORS.scale], [5, 2, LORD_COLORS.scaleLight], [6, 2, LORD_COLORS.scale], [7, 2, LORD_COLORS.scaleLight], [8, 2, LORD_COLORS.scale], [9, 2, LORD_COLORS.scaleDark],
  [4, 3, LORD_COLORS.scaleDark], [5, 3, LORD_COLORS.scale], [6, 3, LORD_COLORS.scaleLight], [7, 3, LORD_COLORS.scale], [8, 3, LORD_COLORS.scaleLight], [9, 3, LORD_COLORS.scale], [10, 3, LORD_COLORS.scaleDark],
  [4, 4, LORD_COLORS.scaleDark], [5, 4, LORD_COLORS.scale], [6, 4, LORD_COLORS.eyeInner], [7, 4, LORD_COLORS.eyeGlow], [8, 4, LORD_COLORS.eye], [9, 4, LORD_COLORS.scale], [10, 4, LORD_COLORS.scaleDark],
  [4, 5, LORD_COLORS.scaleDark], [5, 5, LORD_COLORS.scale], [6, 5, LORD_COLORS.eyeSlit], [7, 5, LORD_COLORS.eyeSlit], [8, 5, LORD_COLORS.eyeGlow], [9, 5, LORD_COLORS.scale], [10, 5, LORD_COLORS.scaleDark],
  [5, 6, LORD_COLORS.scaleDark], [6, 6, LORD_COLORS.scale], [7, 6, LORD_COLORS.scaleDark], [8, 6, LORD_COLORS.scale], [9, 6, LORD_COLORS.scaleDark],

  // ===== 蛇嘴 =====
  [5, 7, LORD_COLORS.scale], [6, 7, LORD_COLORS.tongue], [7, 7, LORD_COLORS.fang], [8, 7, LORD_COLORS.scale], [9, 7, LORD_COLORS.scaleDark],
  [5, 8, LORD_COLORS.scaleDark], [6, 8, LORD_COLORS.tongueDark], [7, 8, LORD_COLORS.fangDark], [8, 8, LORD_COLORS.scaleDark],

  // ===== 颈部 =====
  [5, 9, LORD_COLORS.scale], [6, 9, LORD_COLORS.scale], [7, 9, LORD_COLORS.scaleDark], [8, 9, LORD_COLORS.scale],
  [5, 10, LORD_COLORS.belly], [6, 10, LORD_COLORS.bellyLight], [7, 10, LORD_COLORS.belly],

  // ===== 身体侧面（粗布）=====
  [4, 10, LORD_COLORS.clothDark], [5, 10, LORD_COLORS.cloth], [6, 10, LORD_COLORS.clothLight], [7, 10, LORD_COLORS.cloth], [8, 10, LORD_COLORS.clothLight], [9, 10, LORD_COLORS.cloth],
  [3, 11, LORD_COLORS.leatherDark], [4, 11, LORD_COLORS.cloth], [5, 11, LORD_COLORS.clothLight], [6, 11, LORD_COLORS.rune], [7, 11, LORD_COLORS.bone], [8, 11, LORD_COLORS.cloth], [9, 11, LORD_COLORS.clothDark], [10, 11, LORD_COLORS.leatherDark],
  [3, 12, LORD_COLORS.leather], [4, 12, LORD_COLORS.cloth], [5, 12, LORD_COLORS.clothLight], [6, 12, LORD_COLORS.runeGlow], [7, 12, LORD_COLORS.cloth], [8, 12, LORD_COLORS.clothDark], [9, 12, LORD_COLORS.cloth], [10, 12, LORD_COLORS.leather],
  [4, 13, LORD_COLORS.leatherDark], [5, 13, LORD_COLORS.cloth], [6, 13, LORD_COLORS.clothRough], [7, 13, LORD_COLORS.cloth], [8, 13, LORD_COLORS.cloth], [9, 13, LORD_COLORS.leatherDark],

  // ===== 腰带 =====
  [4, 14, LORD_COLORS.leather], [5, 14, LORD_COLORS.leatherLight], [6, 14, LORD_COLORS.bone], [7, 14, LORD_COLORS.leather], [8, 14, LORD_COLORS.leatherLight], [9, 14, LORD_COLORS.leather],

  // ===== 腿/脚 =====
  [5, 15, LORD_COLORS.skin], [6, 15, LORD_COLORS.skinLight], [7, 15, LORD_COLORS.skin], [8, 15, LORD_COLORS.skinLight], [9, 15, LORD_COLORS.skin],

  // ===== 左手（后方，握骨盾）=====
  [2, 10, LORD_COLORS.skinDark], [3, 10, LORD_COLORS.skin],
  [2, 11, LORD_COLORS.skin], [3, 11, LORD_COLORS.skinLight],
  [2, 12, LORD_COLORS.boneDark], [3, 12, LORD_COLORS.bone],
  [2, 13, LORD_COLORS.venom], [3, 13, LORD_COLORS.boneLight],
  [2, 14, LORD_COLORS.boneDark], [3, 14, LORD_COLORS.bone],

  // ===== 右手（前出，持骨刺矛）=====
  [13, 9, LORD_COLORS.skinDark],
  [13, 10, LORD_COLORS.skin],
  [13, 11, LORD_COLORS.skinLight], [14, 11, LORD_COLORS.spearBone],
  [13, 12, LORD_COLORS.skin], [14, 12, LORD_COLORS.spear],
  [13, 13, LORD_COLORS.skinDark], [14, 13, LORD_COLORS.spearDark],
  [14, 14, LORD_COLORS.spearBone],
  [14, 15, LORD_COLORS.venom],

  // ===== 羽毛装饰 =====
  [3, 0, LORD_COLORS.feather2],
  [9, 1, LORD_COLORS.feather],

  // ===== 毒液滴 =====
  [14, 15, LORD_COLORS.droplet],
]

// 待机动画帧（蛇头晃动 + 舌头伸缩 + 毒液发光）
const LORD_IDLE_FRAMES = [
  // 帧0 - 暗
  [
    { pixels: [
      [5, 4, LORD_COLORS.eye], [8, 4, LORD_COLORS.eye],
      [6, 7, LORD_COLORS.tongue], [7, 7, LORD_COLORS.tongue],
      [6, 11, LORD_COLORS.rune], [7, 11, LORD_COLORS.rune],
      [5, 15, LORD_COLORS.venom], [8, 15, LORD_COLORS.venom],
    ] }
  ],
  // 帧1 - 亮（舌头伸出 + 毒液发光）
  [
    { pixels: [
      [5, 4, LORD_COLORS.eyeGlow], [8, 4, LORD_COLORS.eyeGlow],
      [6, 7, LORD_COLORS.tongue], [7, 7, LORD_COLORS.tongue],
      [6, 8, LORD_COLORS.tongueDark], [7, 8, LORD_COLORS.tongueDark],
      [6, 9, LORD_COLORS.droplet], [7, 9, LORD_COLORS.droplet],
      [6, 11, LORD_COLORS.runeGlow], [7, 11, LORD_COLORS.runeGlow],
      [5, 15, LORD_COLORS.venomGlow], [8, 15, LORD_COLORS.venomGlow],
      [4, 15, LORD_COLORS.spark], [9, 15, LORD_COLORS.spark],
    ] }
  ],
]

// 行走动画帧（步伐 + 身体摆动）
const LORD_WALK_FRAMES = [
  // 帧0 - 左脚前
  [
    { pixels: [
      [4, 15, LORD_COLORS.skinDark], [5, 15, LORD_COLORS.skin], [6, 15, LORD_COLORS.skinDark], [7, 15, LORD_COLORS.skin], [8, 15, LORD_COLORS.skinDark], [9, 15, LORD_COLORS.skin],
      [5, 7, LORD_COLORS.fang], [8, 7, LORD_COLORS.fang],
    ] }
  ],
  // 帧1 - 中间
  [
    { pixels: [
      [4, 15, LORD_COLORS.skin], [5, 15, LORD_COLORS.skinDark], [6, 15, LORD_COLORS.skin], [7, 15, LORD_COLORS.skin], [8, 15, LORD_COLORS.skinDark], [9, 15, LORD_COLORS.skin],
      [5, 7, LORD_COLORS.fangDark], [8, 7, LORD_COLORS.fangDark],
    ] }
  ],
  // 帧2 - 右脚前
  [
    { pixels: [
      [4, 15, LORD_COLORS.skin], [5, 15, LORD_COLORS.skinDark], [6, 15, LORD_COLORS.skinDark], [7, 15, LORD_COLORS.skin], [8, 15, LORD_COLORS.skin], [9, 15, LORD_COLORS.skinDark],
      [5, 7, LORD_COLORS.fang], [8, 7, LORD_COLORS.fang],
    ] }
  ],
]

export const drawVenomousLord = (canvasRef, currentUnit) => {
  if (!canvasRef) return
  const ctx = canvasRef.getContext('2d')
  const x = currentUnit.x
  const y = currentUnit.y
  const unit = currentUnit.size / 16
  const direction = currentUnit.direction || 'down'
  const frame = currentUnit.frame || 0

  ctx.imageSmoothingEnabled = false

  const drawPixel = (px, py, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x + px * unit, y + py * unit, unit, unit)
  }

  // 选择基础像素数据
  let basePixels = LORD_FACE_DOWN
  if (direction === 'up') basePixels = LORD_FACE_UP
  else if (direction === 'left') basePixels = LORD_FACE_LEFT
  else if (direction === 'right') basePixels = LORD_FACE_RIGHT

  // 绘制基础角色
  for (let i = 0; i < basePixels.length; i++) {
    drawPixel(basePixels[i][0], basePixels[i][1], basePixels[i][2])
  }

  // 绘制动画层
  const isMoving = currentUnit.isMoving || false
  const frames = isMoving ? LORD_WALK_FRAMES : LORD_IDLE_FRAMES
  const frameIndex = Math.floor(frame) % frames.length
  const currentFrame = frames[frameIndex]

  for (const layer of currentFrame) {
    for (const pixel of layer.pixels) {
      drawPixel(pixel[0], pixel[1], pixel[2])
    }
  }
}

export const drawVenomousLordAvatar = (canvasRef, currentUnit, avatarPos) => {
  if (!canvasRef) return
  const ctx = canvasRef.getContext('2d')
  const x = avatarPos.x
  const y = avatarPos.y
  const unit = currentUnit.size / 16

  ctx.imageSmoothingEnabled = false

  const drawPixel = (px, py, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x + px * unit, y + py * unit, unit, unit)
  }

  for (let i = 0; i < LORD_AVATAR.length; i++) {
    drawPixel(LORD_AVATAR[i][0], LORD_AVATAR[i][1], LORD_AVATAR[i][2])
  }
}