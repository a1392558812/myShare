import { rankOf, suitOf, isHonor } from './tiles.js'

/**
 * 宝牌指示牌 → 宝牌
 * 数牌顺延一位（9 → 1）；风牌 东南西北 循环；三元牌 白发中 循环
 * @param {number} indicator 指示牌 kind
 * @returns {number} 宝牌 kind
 */
export const doraOf = (indicator) => {
  if (isHonor(indicator)) {
    if (indicator <= 30) return indicator === 30 ? 27 : indicator + 1
    return indicator === 33 ? 31 : indicator + 1
  }
  const s = suitOf(indicator)
  const r = rankOf(indicator)
  return s * 9 + (r % 9)
}

/**
 * 手牌（含副露，杠算 4 张）里宝牌的张数
 * @param {number[]} counts 门清手牌计数
 * @param {Object[]} melds 副露
 * @param {number[]} indicators 已翻开的指示牌
 */
export const countDora = (counts, melds = [], indicators = []) => {
  const c = counts.slice()
  for (const m of melds || []) for (const k of m.kinds || []) c[k]++
  let n = 0
  for (const ind of indicators || []) n += c[doraOf(ind)] || 0
  return n
}

/** 指示牌对应的宝牌列表（去重，供 UI 展示） */
export const doraKindsOf = (indicators = []) => [...new Set((indicators || []).map(doraOf))]
