/**
 * 无尽模式强化池（Roguelite 三选一）
 *
 * 存在意义：光靠「目标分收敛」只能保证数学上永远可能，后期余量会越挤越小、体感变熬。
 * 强化让玩家的得分能力同步上升，与难度赛跑，这才是「玩不完」的那一半。
 */
export const BUFFS = [
  { id: 'mult', name: '连锁大师', icon: '⚡', desc: '连锁倍率封顶 8 → 16', max: 1 },
  { id: 'score', name: '甜蜜加成', icon: '🍯', desc: '所有得分 ×1.15', max: 3 },
  { id: 'steps', name: '额外步数', icon: '👟', desc: '每层步数 +2', max: 4 },
  { id: 'bomb', name: '开局炸弹', icon: '💣', desc: '开局随机 1 格变直线炸弹', max: 3 },
  { id: 'rainbow', name: '彩虹馈赠', icon: '🌈', desc: '开局随机 1 格变彩球', max: 2 },
  { id: 'area', name: '爆破扩张', icon: '◉', desc: '九宫炸弹范围 3×3 → 5×5', max: 1 },
  { id: 'refund', name: '连锁返还', icon: '↺', desc: '单次连锁 ≥3 波返还 1 步', max: 2 },
]

export const buffById = (id) => BUFFS.find((b) => b.id === id) || null

/** 已选强化 { id: 层数 } → 本局生效数值 */
export const resolveBuffs = (taken = {}) => ({
  maxMult: (taken.mult || 0) > 0 ? 16 : 8,
  scoreMul: Math.pow(1.15, taken.score || 0),
  bonusSteps: (taken.steps || 0) * 2,
  startBombs: taken.bomb || 0,
  startRainbows: taken.rainbow || 0,
  areaRadius: (taken.area || 0) > 0 ? 2 : 1,
  refund: taken.refund || 0,
})

/** 随机抽 n 个「还没满级」的强化供三选一 */
export const rollBuffs = (taken = {}, n = 3) => {
  const pool = BUFFS.filter((b) => (taken[b.id] || 0) < b.max)
  const out = []
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length)
    out.push(pool.splice(i, 1)[0])
  }
  return out
}

/** HUD 用：已持有强化的紧凑列表 */
export const buffSummary = (taken = {}) =>
  BUFFS.filter((b) => (taken[b.id] || 0) > 0)
    .map((b) => ({ ...b, stack: taken[b.id] }))
