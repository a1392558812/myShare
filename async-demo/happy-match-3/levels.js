import { TILE_TYPES } from './constants.js'

/**
 * 关卡配置
 * goals: { type:'score', target } | { type:'color', color, count }
 * colors: 本关启用颜色数（实测是最强的难度旋钮，见 §5.3 校准记录）
 *
 * 目标分已按 README §5.3「校准规则」用 1-ply 贪心机器人 300 局实测反推：
 * 通关率从 L1 的 ~70% 递减到 L5 的 ~45%，星级线随目标分等比移动。
 */
export const LEVELS = [
  { id: 1, name: '甜蜜起步', rows: 7, cols: 7, colors: 6, steps: 20, goals: [{ type: 'score', target: 1200 }] },
  { id: 2, name: '果酱工坊', rows: 8, cols: 8, colors: 6, steps: 22, goals: [{ type: 'score', target: 1500 }] },
  { id: 3, name: '彩虹糖阶', rows: 8, cols: 8, colors: 6, steps: 24, goals: [{ type: 'score', target: 1800 }] },
  { id: 4, name: '焦糖迷阵', rows: 9, cols: 9, colors: 6, steps: 25, goals: [{ type: 'score', target: 2050 }] },
  {
    id: 5, name: '蓝莓盛宴', rows: 9, cols: 9, colors: 6, steps: 26,
    goals: [{ type: 'score', target: 2200 }, { type: 'color', color: 2, count: 10 }],
  },
]

export const getLevel = (id) => LEVELS.find((l) => l.id === id) || LEVELS[0]

/**
 * 无尽模式：层层闯关 + 目标分收敛封顶（README §5.3 末尾「线性上升难度」）
 *
 * 为什么不用线性递增：每层能力恒定（8×8 / 6 色 / 22 步 ≈1900 分），线性上升的目标
 * 必然与之相交，实测 900 +150×层 在约第 15 层就是 100% 死点，玩得再好也过不去。
 * 改用指数收敛 T(n) = T_max − (T_max − T0)·r^(n−1)：目标永远够不着上限，
 * 任何一层都存在理论解，把「确定死在第 N 层」换成「可能死在很远的某层」。
 *
 * 收敛只解决数学可行性，后期余量会越挤越小；真正的「玩不完」靠 buffs.js 的
 * 强化让能力同步上升，两者赛跑。
 *
 * decay 实测（贪心机器人 25 局/组，上限 60 层）：0.90 中位 7 层、0.93 中位 6 层都太陡，
 * 0.97 中位直接撞顶太松；取 0.95 —— 中位 28 层、p25 8 层、36% 的局撞到 60 层上限。
 * 配合每 2 层一次三选一，对 1-ply 机器人已无硬死点，真人只会更强。
 *
 * 实测注意：一旦同时抬目标分又加颜色数，7 色得分能力会掉到 ≈62 分/步（−27%），
 * 第 5 层起就会断崖式劝退，所以颜色数锁死在 6。
 */
export const ENDLESS = {
  id: 0,
  rows: 8,
  cols: 8,
  colors: 6,
  steps: 22,
  baseTarget: 900,   // T0：第 1 层目标
  maxTarget: 2600,   // T_max：渐近上限，永远达不到
  decay: 0.95,       // r：收敛速率，越接近 1 前期涨得越慢
}

/** 目标分指数收敛到 maxTarget，单调递增但永远够不着 → 不存在必死层 */
export const endlessTarget = (stage) => {
  const { baseTarget: t0, maxTarget: tm, decay: r } = ENDLESS
  return Math.round(tm - (tm - t0) * Math.pow(r, stage - 1))
}

/** 生成第 n 层的关卡配置（goals 里的分数目标是「本层」需得分，不是累计总分） */
export const makeEndlessLevel = (stage) => ({
  id: ENDLESS.id,
  endless: true,
  stage,
  name: `第 ${stage} 层`,
  rows: ENDLESS.rows,
  cols: ENDLESS.cols,
  colors: ENDLESS.colors,
  steps: ENDLESS.steps,
  goals: [{ type: 'score', target: endlessTarget(stage) }],
})

/** 关卡用于评星的目标分（所有关卡都带分数目标） */
export const scoreTargetOf = (level) => {
  const g = level.goals.find((x) => x.type === 'score')
  return g ? g.target : 1000
}

export const goalText = (goal) => {
  if (goal.type === 'score') return `得分 ${goal.target}`
  return `消除${TILE_TYPES[goal.color]?.name || ''}块 ${goal.count}`
}
