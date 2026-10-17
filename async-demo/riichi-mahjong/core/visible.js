import { emptyCounts } from './tiles.js'

/**
 * 可见牌统计器（5.2）：记牌器三个 Tab 与 AI 共用同一份口径
 * 已见牌 = 自己的手牌 + 双方副露（含杠） + 双方牌河
 * @param {Object} game 局面状态
 * @param {number} viewer 视角玩家下标
 * @returns {{seen:number[], remaining:number[], seenDetail:Object}}
 */
export const visibleCounts = (game, viewer = 0) => {
  const seen = emptyCounts()
  const me = game.players[viewer]
  // 注意：me.tiles 已经包含刚摸的那张（drawTile 是 push 进 tiles 的），不要再补一次 drawn
  for (const k of me.tiles) seen[k]++
  for (const p of game.players) {
    for (const m of p.melds) for (const k of m.kinds) seen[k]++
    for (const d of p.river) seen[d.kind]++
  }
  const remaining = seen.map((n) => 4 - n)
  return { seen, remaining }
}

/** 牌山剩余张数（不含王牌区） */
export const wallLeft = (game) => (game.wall ? game.wall.length : 0)

/** 已打牌明细：谁·第几巡·打出 */
export const discardLog = (game) => {
  const out = []
  for (let pi = 0; pi < game.players.length; pi++) {
    const p = game.players[pi]
    p.river.forEach((d, i) => out.push({ player: pi, kind: d.kind, index: i, turn: d.turn, riichi: d.riichi, tsumogiri: d.tsumogiri }))
  }
  return out
}
