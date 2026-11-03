/** 可指定种子的伪随机数，方便复现牌局与自动测试 */
export const createRandom = (seed) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher-Yates 洗牌，原地打乱并返回同一数组 */
export const shuffle = (list, random) => {
  for (let index = list.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    const temp = list[index]
    list[index] = list[target]
    list[target] = temp
  }
  return list
}
