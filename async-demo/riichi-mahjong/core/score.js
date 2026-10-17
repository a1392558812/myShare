/** 点数档位表（4.3）：子荣 / 亲荣 / 自摸对手付 */
export const LIMIT_TABLE = {
  mangan: { name: '满贯', ronChild: 8000, ronDealer: 12000, tsumo: 4000 },
  haneman: { name: '跳满', ronChild: 12000, ronDealer: 18000, tsumo: 6000 },
  baiman: { name: '倍满', ronChild: 16000, ronDealer: 24000, tsumo: 8000 },
  sanbaiman: { name: '三倍满', ronChild: 24000, ronDealer: 36000, tsumo: 12000 },
  yakuman: { name: '役满', ronChild: 32000, ronDealer: 48000, tsumo: 16000 },
}

const ceil100 = (n) => Math.ceil(n / 100) * 100

/**
 * 档位判定：≥13 番或役满 → 役满；11–12 三倍满；8–10 倍满；6–7 跳满；≥5 满贯
 * @param {number} han @param {boolean} isYakuman
 */
export const limitOf = (han, isYakuman = false) => {
  if (isYakuman || han >= 13) return 'yakuman'
  if (han >= 11) return 'sanbaiman'
  if (han >= 8) return 'baiman'
  if (han >= 6) return 'haneman'
  if (han >= 5) return 'mangan'
  return 'normal'
}

/**
 * 点数结算（4.2–4.4，双人局自摸只向对手一人收取）
 * @param {{han:number,fu:number,isDealer:boolean,isTsumo:boolean,isYakuman?:boolean,honba?:number,riichiBets?:number,limitName?:string}} p
 */
export const calcScore = (p) => {
  const { han, fu, isDealer, isTsumo } = p
  const honba = p.honba || 0
  const riichiBets = p.riichiBets || 0
  const base = fu * Math.pow(2, 2 + han)
  let limit = limitOf(han, p.isYakuman)
  // 基本点溢出：子家荣和 4 倍超过满贯即封顶
  if (limit === 'normal' && base >= 2000) limit = 'mangan'

  const row = LIMIT_TABLE[limit]
  let amount = 0
  let honbaAddition = 0
  if (limit === 'normal') {
    amount = isTsumo ? ceil100(base * 2) : ceil100(base * (isDealer ? 6 : 4))
  } else {
    amount = isTsumo ? row.tsumo : (isDealer ? row.ronDealer : row.ronChild)
  }
  honbaAddition = isTsumo ? 100 * honba : 300 * honba
  const riichiPoints = riichiBets * 1000

  return {
    han,
    fu,
    limit,
    limitName: row ? row.name : '普通',
    basePoints: base,
    amount,
    honbaAddition,
    riichiPoints,
    total: amount + honbaAddition + riichiPoints,
    isDealer,
    isTsumo,
  }
}

/** 流局听牌罚符（双人固定 3000） */
export const NOTEN_PENALTY = 3000

export const flowPayments = (tenpaiFlags) => {
  const out = []
  const [a, b] = tenpaiFlags
  if (a === b) return out
  const winner = a ? 0 : 1
  const loser = a ? 1 : 0
  out.push({ from: loser, to: winner, amount: NOTEN_PENALTY, reason: '不听罚符' })
  return out
}
