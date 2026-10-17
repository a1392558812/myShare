/** 牌种标识：34 种 × 4 张 = 136 张。kind = suit*9 + (rank-1) */

export const SUIT_M = 0
export const SUIT_P = 1
export const SUIT_S = 2
export const SUIT_Z = 3

export const EAST = 27
export const SOUTH = 28
export const WEST = 29
export const NORTH = 30
export const HAKU = 31
export const HATSU = 32
export const CHUN = 33

export const DRAGONS = [HAKU, HATSU, CHUN]
export const WINDS = [EAST, SOUTH, WEST, NORTH]
export const HONOR_LABEL = ['東', '南', '西', '北', '白', '發', '中']
export const SUIT_LABEL = ['m', 'p', 's', 'z']
export const SUIT_CN = ['万', '筒', '索', '字']
/** 万子牌面用汉字大写：一 二 三 四 五 六 七 八 九 */
export const MAN_KANJI = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

/** 绿一色构成牌：2s 3s 4s 6s 8s 發 */
export const GREEN_TILES = [19, 20, 21, 23, 25, HATSU]

export const YAOCHUU = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33]

/** @returns {number} kind */
export const kindOf = (suit, rank) => suit * 9 + (rank - 1)
export const suitOf = (k) => (k < 9 ? 0 : k < 18 ? 1 : k < 27 ? 2 : 3)
export const rankOf = (k) => (k < 27 ? (k % 9) + 1 : k - 26)
export const isHonor = (k) => k >= 27
export const isTerminal = (k) => k < 27 && (k % 9 === 0 || k % 9 === 8)
export const isYaochuu = (k) => isHonor(k) || isTerminal(k)
export const isGreen = (k) => GREEN_TILES.includes(k)

/** 牌面文本：一m / 3p / 東（万子用汉字大写，字牌用牌面汉字 東南西北白發中） */
export const tileText = (k) => {
  if (k >= 27) return HONOR_LABEL[k - 27]
  if (k < 9) return `${MAN_KANJI[k]}m`
  return `${rankOf(k)}${SUIT_LABEL[suitOf(k)]}`
}
export const tileLabel = (k) => (k >= 27 ? HONOR_LABEL[k - 27] : k < 9 ? MAN_KANJI[k] : String(rankOf(k)))

/** 顺子文本：123m / 456p（万子取汉字大写） */
export const chiText = (kinds) => kinds.map(tileLabel).join('') + SUIT_LABEL[suitOf(kinds[0])]

export const emptyCounts = () => new Array(34).fill(0)

/** @param {number[]} kinds @returns {number[]} 长度 34 的计数数组 */
export const countsFrom = (kinds) => {
  const c = emptyCounts()
  for (const k of kinds) c[k]++
  return c
}
export const countsToArray = (c) => {
  const out = []
  for (let i = 0; i < 34; i++) for (let n = 0; n < c[i]; n++) out.push(i)
  return out
}
export const countsAdd = (c, kinds) => {
  for (const k of kinds) c[k]++
  return c
}
export const totalOf = (c) => c.reduce((a, b) => a + b, 0)

/** 手牌排序：万 → 筒 → 索 → 字 */
export const sortKinds = (arr) => [...arr].sort((a, b) => a - b)

/** 面子文本：123m / 東東東 / 5p5p5p */
export const mentsuText = (m) => {
  const t = m.kinds || []
  if (m.type === 'chi') return t.map((x) => rankOf(x)).join('') + SUIT_LABEL[suitOf(t[0])]
  return t.map(tileText).join('')
}
