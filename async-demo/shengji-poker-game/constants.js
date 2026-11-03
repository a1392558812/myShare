/** 牌桌逻辑分辨率：等比缩放到容器，绘制与命中测试共用同一套坐标 */
export const DESIGN = { width: 1160, height: 760 }

export const CARD = {
  hand: { width: 62, height: 86 },
  table: { width: 48, height: 66 },
  back: { width: 40, height: 56 },
  radius: 6,
}

/** 手牌行、四家出牌区、中央信息盘的位置 */
export const LAYOUT = {
  handY: 648,
  handRaise: 22,
  handHover: 9,
  handPadding: 96,
  northBack: { y: 8, gap: 18 },
  westBack: { x: 12, y: 96, gap: 24 },
  eastBack: { x: 1108, y: 96, gap: 24 },
  playZones: [
    { x: 580, y: 468, align: 'center' },
    { x: 916, y: 300, align: 'center' },
    { x: 580, y: 132, align: 'center' },
    { x: 244, y: 300, align: 'center' },
  ],
  tableGap: 25,
  center: { x: 580, y: 306, radius: 96 },
}

export const COLORS = {
  felt: '#4d1522',
  feltDark: '#280a11',
  feltLight: 'rgba(255, 255, 255, .05)',
  line: 'rgba(242, 193, 78, .18)',
  gold: '#f2c14e',
  goldSoft: 'rgba(242, 193, 78, .5)',
  red: '#e8484f',
  green: '#43d17f',
  blue: '#5aa9f7',
  text: '#f7efe2',
  dim: 'rgba(247, 239, 226, .55)',
  panel: 'rgba(20, 6, 10, .55)',
  cardBg: '#fffdf7',
  cardEdge: 'rgba(60, 20, 20, .22)',
  cardInk: '#23201d',
  cardRed: '#c0272d',
  cardBack: '#7d1c26',
  cardBackDark: '#4a0d14',
}
