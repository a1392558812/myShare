import { reactive } from 'vue'
import {
  TABLE, BALL_R, POCKETS, HEAD_LINE_X, FOOT_SPOT, PHYSICS, BALL_COLORS, CUE_COLOR,
} from '../constants.js'

/** 全色组 */
export const SOLID = 'solid'
/** 花色组 */
export const STRIPE = 'stripe'

const clamp = (v, min, max) => (v < min ? min : v > max ? max : v)

/** 点到线段的最短距离 */
const distToSegment = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(px - ax, py - ay)
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1)
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/** 原地洗牌 */
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

/** 角度归一化到 (-PI, PI] */
const normAngle = (a) => {
  let r = a
  while (r > Math.PI) r -= Math.PI * 2
  while (r < -Math.PI) r += Math.PI * 2
  return r
}

/** 创建一颗球 */
const createBall = (num) => {
  const type = num === 0 ? 'cue' : num === 8 ? 'eight' : num < 8 ? SOLID : STRIPE
  return {
    id: num,
    num,
    type,
    color: num === 0 ? CUE_COLOR : BALL_COLORS[num],
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    alive: true,
    pocketed: false,
  }
}

/**
 * 台球 · 黑八 游戏主逻辑
 * @returns {object} 游戏实例（状态 + 操作 API）
 */
export const useBilliards = () => {
  /** 全部 16 颗球（非响应式，每帧直接读，避免代理开销） */
  const balls = []

  const state = reactive({
    /** place | aim | rolling | choose | over */
    phase: 'place',
    /** 0 = 玩家，1 = 电脑 */
    turn: 0,
    /** 台面是否开放（未分组） */
    openTable: true,
    /** 是否处于开球这一杆 */
    isBreak: true,
    /** 两位玩家的球组 */
    groups: [null, null],
    /** 自由球 */
    ballInHand: false,
    /** 自由球是否限制在开球线后 */
    ballInHandKitchen: false,
    /** 瞄准角度（弧度） */
    aimAngle: 0,
    /** 蓄力 0~1 */
    power: 0,
    /** 是否正在蓄力 */
    charging: false,
    /** 鼠标在台面坐标系的位置 */
    pointer: { x: HEAD_LINE_X * 0.5, y: TABLE.H / 2 },
    /** 提示文案 */
    message: '',
    /** 是否已结束 */
    over: false,
    /** 胜者 0/1 */
    winner: null,
    /** 结束原因 */
    overText: '',
    /** 需要选组的一方（null 表示不需要选） */
    pendingGroupFor: null,
    /** 剩余球数 */
    remain: { solid: 7, stripe: 7 },
    /** 已进袋的全色球 */
    pottedSolid: [],
    /** 已进袋的花色球 */
    pottedStripe: [],
    /** 是否显示瞄准辅助线 */
    showGuide: true,
    /** 是否显示球号 */
    showIds: false,
  })

  /** 单杆记录 */
  const shot = {
    firstContact: null,
    potted: [],
    cueScratch: false,
    cueOff: false,
    eightPotted: false,
    eightOff: false,
    push: false,
    time: 0,
    lastCue: null,
  }

  /** 全局碰撞事件序号，用于连击 / 推杆判定（两次接触之间不允许有任何其它事件） */
  let eventSeq = 0
  /** 电脑选好的一杆 */
  let aiPlan = null
  /** 电脑出手倒计时 */
  let aiDelay = PHYSICS.AI_DELAY
  /** 电脑选组倒计时 */
  let chooseDelay = 0.8

  // ---------------------------------------------------------------- 基础查询

  /** 某组还剩几颗球未落袋 */
  const remainingOf = (type) => {
    let n = 0
    for (const b of balls) if (b.alive && b.type === type) n++
    return n
  }

  /** 同步 HUD 需要的统计数据 */
  const syncStats = () => {
    const s = []
    const t = []
    for (const b of balls) {
      if (!b.pocketed) continue
      if (b.type === SOLID) s.push(b.num)
      else if (b.type === STRIPE) t.push(b.num)
    }
    state.pottedSolid = s.sort((a, b) => a - b)
    state.pottedStripe = t.sort((a, b) => a - b)
    state.remain = { solid: remainingOf(SOLID), stripe: remainingOf(STRIPE) }
  }

  /** 指定位置是否可以放球（不与活球重叠且在台面内） */
  const spotFree = (x, y) => {
    if (x < BALL_R + 2 || x > TABLE.W - BALL_R - 2) return false
    if (y < BALL_R + 2 || y > TABLE.H - BALL_R - 2) return false
    for (const b of balls) {
      if (!b.alive || b.num === 0) continue
      if (Math.hypot(b.x - x, b.y - y) < BALL_R * 2 + 1) return false
    }
    return true
  }

  /** 从 (x,y) 向外螺旋找一个合法落点 */
  const findFreeSpot = (x, y, maxX) => {
    const cx = clamp(x, BALL_R + 2, maxX)
    const cy = clamp(y, BALL_R + 2, TABLE.H - BALL_R - 2)
    if (spotFree(cx, cy)) return { x: cx, y: cy }
    for (let rad = 5; rad <= 120; rad += 5) {
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2
        const nx = clamp(cx + Math.cos(a) * rad, BALL_R + 2, maxX)
        const ny = clamp(cy + Math.sin(a) * rad, BALL_R + 2, TABLE.H - BALL_R - 2)
        if (spotFree(nx, ny)) return { x: nx, y: ny }
      }
    }
    return { x: cx, y: cy }
  }

  // ---------------------------------------------------------------- 摆球 / 重置

  /** 三角框摆球：顶点在置球点，8 号在第三排正中，底角一全色一花色 */
  const rack = () => {
    balls.length = 0
    for (let n = 0; n <= 15; n++) balls.push(createBall(n))

    const rowGap = BALL_R * Math.sqrt(3) * 1.004
    const colGap = BALL_R * 2 * 1.004
    const slots = []
    for (let row = 0; row < 5; row++) {
      for (let i = 0; i <= row; i++) {
        slots.push({
          x: FOOT_SPOT.x + row * rowGap,
          y: TABLE.H / 2 + (i - row / 2) * colGap,
        })
      }
    }

    const EIGHT_SLOT = 4 // 第三排正中
    const CORNER_A = 10 // 底排左上角
    const CORNER_B = 14 // 底排右下角

    const solids = shuffle([1, 2, 3, 4, 5, 6, 7])
    const stripes = shuffle([9, 10, 11, 12, 13, 14, 15])
    const flip = Math.random() < 0.5

    const nums = new Array(15).fill(null)
    nums[EIGHT_SLOT] = 8
    nums[CORNER_A] = flip ? solids.pop() : stripes.pop()
    nums[CORNER_B] = flip ? stripes.pop() : solids.pop()

    const rest = shuffle(solids.concat(stripes))
    let k = 0
    for (let i = 0; i < 15; i++) if (nums[i] === null) nums[i] = rest[k++]

    for (let i = 0; i < 15; i++) {
      const ball = balls[nums[i]]
      ball.x = slots[i].x
      ball.y = slots[i].y
      ball.vx = 0
      ball.vy = 0
      ball.alive = true
      ball.pocketed = false
    }

    const cue = balls[0]
    cue.x = HEAD_LINE_X * 0.55
    cue.y = TABLE.H / 2
    cue.vx = 0
    cue.vy = 0
    cue.alive = true
    cue.pocketed = false
  }

  /** 母球重新摆回开球区 */
  const respotCue = () => {
    const cue = balls[0]
    const spot = findFreeSpot(HEAD_LINE_X * 0.55, TABLE.H / 2, TABLE.W - BALL_R - 2)
    cue.alive = true
    cue.pocketed = false
    cue.x = spot.x
    cue.y = spot.y
    cue.vx = 0
    cue.vy = 0
  }

  /** 绑定球组 */
  const assignGroup = (player, type) => {
    state.groups[player] = type
    state.groups[1 - player] = type === SOLID ? STRIPE : SOLID
    state.openTable = false
  }

  // ---------------------------------------------------------------- 回合流转

  /**
   * 交给某位玩家继续，进入对应阶段
   * @param {number} player 0=玩家 1=电脑
   * @param {boolean} ballInHand 是否自由球
   * @param {boolean} kitchen 自由球是否限制在开球线后
   */
  const beginTurn = (player, ballInHand, kitchen = false) => {
    state.turn = player
    state.ballInHand = ballInHand
    state.ballInHandKitchen = ballInHand && kitchen
    state.power = 0
    state.charging = false
    aiPlan = null
    aiDelay = PHYSICS.AI_DELAY
    chooseDelay = 0.8

    if (ballInHand) {
      if (player === 1) {
        aiPlaceBall(kitchen)
        state.phase = 'aim'
      } else {
        state.phase = 'place'
      }
    } else {
      state.phase = 'aim'
    }
  }

  // ---------------------------------------------------------------- 物理

  /** 单杆记录复位 */
  const resetShotRecord = () => {
    shot.firstContact = null
    shot.potted = []
    shot.cueScratch = false
    shot.cueOff = false
    shot.eightPotted = false
    shot.eightOff = false
    shot.push = false
    shot.time = 0
    shot.lastCue = null
    eventSeq = 0
  }

  /** 判断球是否落袋；越界且不在袋口吸附范围则返回最近的袋口强制吸入 */
  const pocketHit = (b) => {
    let nearest = POCKETS[0]
    let nd = Infinity
    for (const p of POCKETS) {
      const d = Math.hypot(b.x - p.x, b.y - p.y)
      if (d < p.r) return { pocket: p, escaped: false }
      if (d < nd) {
        nd = d
        nearest = p
      }
    }
    const esc = BALL_R * 1.5
    if (b.x < -esc || b.x > TABLE.W + esc || b.y < -esc || b.y > TABLE.H + esc) {
      return { pocket: nearest, escaped: true }
    }
    return null
  }

  /** 落袋处理 */
  const pot = (b) => {
    b.alive = false
    b.pocketed = true
    b.vx = 0
    b.vy = 0
    shot.potted.push(b)
  }

  /** 库边碰撞（袋口附近不反射，交给落袋吸附处理） */
  const cushion = (b) => {
    const nearPocket = POCKETS.some(
      (p) => Math.hypot(b.x - p.x, b.y - p.y) < p.r + BALL_R * 0.5,
    )
    if (nearPocket) return

    const r = BALL_R
    let hit = false
    if (b.x < r) {
      b.x = r
      b.vx = -b.vx * PHYSICS.CUSHION_REST
      b.vy *= PHYSICS.CUSHION_FRICTION
      hit = true
    } else if (b.x > TABLE.W - r) {
      b.x = TABLE.W - r
      b.vx = -b.vx * PHYSICS.CUSHION_REST
      b.vy *= PHYSICS.CUSHION_FRICTION
      hit = true
    }
    if (b.y < r) {
      b.y = r
      b.vy = -b.vy * PHYSICS.CUSHION_REST
      b.vx *= PHYSICS.CUSHION_FRICTION
      hit = true
    } else if (b.y > TABLE.H - r) {
      b.y = TABLE.H - r
      b.vy = -b.vy * PHYSICS.CUSHION_REST
      b.vx *= PHYSICS.CUSHION_FRICTION
      hit = true
    }
    if (hit) eventSeq++
  }

  /** 记录母球与其他球的接触（首个接触 / 连击推杆） */
  const onCueContact = (other) => {
    if (!shot.firstContact) shot.firstContact = other
    // 同一颗球在极短时间内被母球二次接触，且中间没有任何其它碰撞 -> 推杆
    if (
      shot.lastCue &&
      shot.lastCue.num === other.num &&
      eventSeq - shot.lastCue.seq <= 1 &&
      shot.time - shot.lastCue.t < PHYSICS.PUSH_WINDOW
    ) {
      shot.push = true
    }
    shot.lastCue = { num: other.num, seq: eventSeq, t: shot.time }
    eventSeq++
  }

  /** 两球碰撞 */
  const collide = (a, b) => {
    if (!a.alive || !b.alive) return
    const dx = b.x - a.x
    const dy = b.y - a.y
    const d = Math.hypot(dx, dy)
    const min = BALL_R * 2
    if (d >= min || d === 0) return

    const nx = dx / d
    const ny = dy / d
    const half = (min - d) / 2
    a.x -= nx * half
    a.y -= ny * half
    b.x += nx * half
    b.y += ny * half

    const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
    if (vn > 0) return
    const imp = (-(1 + PHYSICS.BALL_REST) * vn) / 2
    a.vx -= imp * nx
    a.vy -= imp * ny
    b.vx += imp * nx
    b.vy += imp * ny

    if (a.num === 0) onCueContact(b)
    else if (b.num === 0) onCueContact(a)
    else eventSeq++
  }

  /** 单个物理子步 */
  const substep = (h) => {
    shot.time += h
    const list = balls.filter((b) => b.alive)

    for (const b of list) {
      const sp = Math.hypot(b.vx, b.vy)
      if (sp > 0) {
        const ns = sp - (PHYSICS.FRICTION_BASE + PHYSICS.FRICTION_K * sp) * h
        if (ns < PHYSICS.STOP_SPEED) {
          b.vx = 0
          b.vy = 0
        } else {
          const k = ns / sp
          b.vx *= k
          b.vy *= k
        }
      }
      b.x += b.vx * h
      b.y += b.vy * h
    }

    for (const b of list) {
      if (!b.alive) continue
      const hit = pocketHit(b)
      if (!hit) continue
      if (b.num === 0) {
        if (hit.escaped) shot.cueOff = true
        else shot.cueScratch = true
      } else if (b.num === 8 && hit.escaped) {
        shot.eightOff = true
      }
      if (b.num === 8 && !hit.escaped) shot.eightPotted = true
      pot(b)
    }

    for (const b of list) {
      if (b.alive) cushion(b)
    }

    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        collide(balls[i], balls[j])
      }
    }
  }

  /** 推进物理，按最大速度自适应子步长，避免穿模 */
  const stepPhysics = (dt) => {
    let maxSpeed = 0
    for (const b of balls) {
      if (!b.alive) continue
      const sp = Math.hypot(b.vx, b.vy)
      if (sp > maxSpeed) maxSpeed = sp
    }
    const steps = clamp(Math.ceil((maxSpeed * dt) / (BALL_R * 0.3)), 1, 60)
    const h = dt / steps
    for (let i = 0; i < steps; i++) substep(h)
  }

  /** 所有球是否静止 */
  const allStopped = () => {
    for (const b of balls) {
      if (!b.alive) continue
      if (b.vx !== 0 || b.vy !== 0) return false
    }
    return true
  }

  // ---------------------------------------------------------------- 规则判定

  /** 结算这一杆 */
  const resolveShot = () => {
    const me = state.turn
    const opp = 1 - me
    const myGroup = state.groups[me]
    const cleared = myGroup ? remainingOf(myGroup) === 0 : false
    state.isBreak = false

    let foul = false
    let foulText = ''
    let winner = null
    let overText = ''

    // ---- 直接输局（优先级最高）
    if (shot.eightOff) {
      winner = opp
      overText = '黑八被打飞出台面'
    } else if (shot.eightPotted) {
      if (shot.cueScratch || shot.cueOff) {
        winner = opp
        overText = '击打黑八时母球落袋'
      } else if (state.openTable || !cleared) {
        winner = opp
        overText = '自己的球还没清完，黑八提前落袋'
      } else {
        winner = me
        overText = '清完本组球后打进黑八'
      }
    }

    // ---- 犯规
    if (winner === null) {
      if (shot.cueScratch) {
        foul = true
        foulText = '母球落袋'
      } else if (shot.cueOff) {
        foul = true
        foulText = '母球飞出台面'
      } else if (shot.push) {
        foul = true
        foulText = '连击 / 推杆'
      } else if (!shot.firstContact) {
        foul = true
        foulText = '空杆，母球没碰到任何球'
      } else if (shot.firstContact.num === 8 && (state.openTable || !cleared)) {
        foul = true
        foulText = '自己的球还没清完就先碰到黑八'
      } else if (myGroup && !cleared && shot.firstContact.type !== myGroup) {
        foul = true
        foulText = '先碰到了对方的球'
      }
    }

    const pottedObj = shot.potted.filter((b) => b.num !== 0 && b.num !== 8)
    const pottedSolid = pottedObj.some((b) => b.type === SOLID)
    const pottedStripe = pottedObj.some((b) => b.type === STRIPE)
    syncStats()

    if (winner !== null) {
      state.winner = winner
      state.over = true
      state.overText = overText
      state.phase = 'over'
      state.message = overText
      return
    }

    let keepTurn = false
    if (!foul) {
      if (state.openTable) {
        // 开放台面：进球即定组
        if (pottedObj.length) {
          if (pottedSolid && pottedStripe) {
            state.pendingGroupFor = me
            state.phase = 'choose'
            state.message = '同时打进全色和花色，请选择你要打的组'
            return
          }
          assignGroup(me, pottedSolid ? SOLID : STRIPE)
          keepTurn = true
        }
      } else {
        keepTurn = pottedObj.some((b) => b.type === myGroup)
      }
    }

    if (foul) {
      if (shot.cueScratch || shot.cueOff) respotCue()
      state.message = `犯规：${foulText} → ${opp === 0 ? '玩家' : '电脑'}获得自由球`
      beginTurn(opp, true, false)
      return
    }

    if (keepTurn) {
      state.message = '进球，继续击球'
      beginTurn(me, false, false)
      return
    }

    state.message = '没进球，换对手击球'
    beginTurn(opp, false, false)
  }

  /**
   * 选择自己要打的球组（同时打进两类球时）
   * @param {'solid'|'stripe'} type
   */
  const chooseGroup = (type) => {
    if (state.pendingGroupFor === null) return
    assignGroup(state.pendingGroupFor, type)
    const who = state.pendingGroupFor
    state.pendingGroupFor = null
    syncStats()
    state.message = `${who === 0 ? '玩家' : '电脑'}选择打${type === SOLID ? '全色' : '花色'}`
    beginTurn(who, false, false)
  }

  // ---------------------------------------------------------------- 电脑 AI

  /** 电脑本杆可击打的目标球 */
  const aiTargets = () => {
    const g = state.groups[1]
    if (state.openTable || !g) {
      return balls.filter((b) => b.alive && b.num !== 0 && b.num !== 8)
    }
    const own = balls.filter((b) => b.alive && b.type === g)
    return own.length ? own : balls.filter((b) => b.alive && b.num === 8)
  }

  /** 线段路径上是否有其它球阻挡 */
  const pathClear = (a, b, exclude) => {
    for (const o of balls) {
      if (!o.alive || o.num === 0) continue
      if (exclude && exclude.includes(o)) continue
      if (distToSegment(o.x, o.y, a.x, a.y, b.x, b.y) < BALL_R * 2 * 1.02) return false
    }
    return true
  }

  /** 开球：瞄准球堆顶球，满力 */
  const aiBreakShot = (cue) => {
    let apex = null
    for (const b of balls) {
      if (!b.alive || b.num === 0) continue
      if (!apex || b.x < apex.x) apex = b
    }
    if (!apex) return { angle: 0, power: 1, score: 0 }
    const ang = Math.atan2(apex.y - cue.y, apex.x - cue.x) + (Math.random() - 0.5) * 0.06
    return { angle: ang, power: 1, score: 0 }
  }

  /**
   * 枚举「目标球 × 袋口」找最优一杆
   * @param {{x:number,y:number}} [cuePos] 可选，评估某个候选母球落点
   * @returns {{angle:number,power:number,score:number}|null}
   */
  const findAiShot = (cuePos) => {
    const cue = cuePos || balls[0]
    if (state.isBreak) return aiBreakShot(cue)

    const targets = aiTargets()
    if (!targets.length) return null

    let best = null
    for (const t of targets) {
      for (const p of POCKETS) {
        const dx = p.x - t.x
        const dy = p.y - t.y
        const d = Math.hypot(dx, dy)
        if (d < 8) continue
        const ux = dx / d
        const uy = dy / d

        // 碰撞瞬间母球中心（幽灵球）
        const gx = t.x - ux * BALL_R * 2
        const gy = t.y - uy * BALL_R * 2
        if (gx < BALL_R || gx > TABLE.W - BALL_R || gy < BALL_R || gy > TABLE.H - BALL_R) continue

        const ax = gx - cue.x
        const ay = gy - cue.y
        const ad = Math.hypot(ax, ay)
        if (ad < 4) continue
        const axx = ax / ad
        const ayy = ay / ad

        const cut = Math.acos(clamp(axx * ux + ayy * uy, -1, 1))
        if (cut > 1.3) continue
        if (!pathClear(cue, { x: gx, y: gy }, [t])) continue
        if (!pathClear(t, p, [t])) continue

        const score =
          Math.cos(cut) * 120 +
          (1 - Math.min(1, ad / 900)) * 20 -
          (d / 900) * 10 -
          Math.abs(cut) * 12

        if (!best || score > best.score) {
          best = {
            angle: Math.atan2(ay, ax),
            power: clamp(0.34 + (ad + d) / 1500 + Math.abs(cut) * 0.12, 0.32, 1),
            score,
          }
        }
      }
    }
    if (best) return best

    // 无解：打安全球，轻碰最近的自己球
    let near = targets[0]
    let nd = Infinity
    for (const t of targets) {
      const d = Math.hypot(t.x - cue.x, t.y - cue.y)
      if (d < nd) {
        nd = d
        near = t
      }
    }
    return {
      angle: Math.atan2(near.y - cue.y, near.x - cue.x) + (Math.random() - 0.5) * 0.25,
      power: clamp(0.4 + nd / 1600, 0.4, 0.75),
      score: -1e9,
    }
  }

  /** 电脑自由球落点：随机采样，取评分最高的位置 */
  const aiPlaceBall = (kitchen) => {
    const cue = balls[0]
    cue.alive = true
    cue.pocketed = false
    cue.vx = 0
    cue.vy = 0

    const maxX = kitchen ? HEAD_LINE_X - BALL_R - 2 : TABLE.W - BALL_R - 2
    let best = null
    for (let i = 0; i < 40; i++) {
      const x = BALL_R + 4 + Math.random() * (maxX - BALL_R - 4)
      const y = BALL_R + 4 + Math.random() * (TABLE.H - BALL_R * 2 - 8)
      if (!spotFree(x, y)) continue
      const plan = findAiShot({ x, y })
      const score = plan ? plan.score : -1e9
      if (!best || score > best.score) best = { x, y, score }
    }
    if (best) {
      cue.x = best.x
      cue.y = best.y
    } else {
      const spot = findFreeSpot(HEAD_LINE_X * 0.55, TABLE.H / 2, maxX)
      cue.x = spot.x
      cue.y = spot.y
    }
  }

  /** 电脑选组：挑打进更多的那组 */
  const aiPickGroup = () => {
    let s = 0
    let t = 0
    for (const b of shot.potted) {
      if (b.type === SOLID) s++
      else if (b.type === STRIPE) t++
    }
    if (s === t) return Math.random() < 0.5 ? SOLID : STRIPE
    return s > t ? SOLID : STRIPE
  }

  /** 电脑回合驱动 */
  const runAi = (dt) => {
    if (state.turn !== 1 || state.over || state.phase !== 'aim') {
      aiPlan = null
      return
    }
    if (!aiPlan) {
      aiDelay -= dt
      if (aiDelay <= 0) aiPlan = findAiShot()
      return
    }
    const diff = normAngle(aiPlan.angle - state.aimAngle)
    const step = 3 * dt
    if (Math.abs(diff) <= step) {
      state.aimAngle = aiPlan.angle
      const power = aiPlan.power
      aiPlan = null
      aiDelay = PHYSICS.AI_DELAY
      shoot(power)
    } else {
      state.aimAngle += Math.sign(diff) * step
    }
  }

  // ---------------------------------------------------------------- 对外操作

  /**
   * 击球
   * @param {number} power 0~1
   */
  const shoot = (power) => {
    if (state.phase !== 'aim') return
    const cue = balls[0]
    if (!cue.alive) return
    const sp = PHYSICS.MAX_SPEED * clamp(power, 0.05, 1)
    cue.vx = Math.cos(state.aimAngle) * sp
    cue.vy = Math.sin(state.aimAngle) * sp
    state.charging = false
    state.power = 0
    state.phase = 'rolling'
    resetShotRecord()
  }

  /**
   * 重新开始一局
   * @param {number} first 先手 0=玩家 1=电脑
   */
  const reset = (first = 0) => {
    rack()
    state.openTable = true
    state.isBreak = true
    state.groups = [null, null]
    state.over = false
    state.winner = null
    state.overText = ''
    state.message = ''
    state.pendingGroupFor = null
    state.aimAngle = 0
    state.power = 0
    state.charging = false
    syncStats()
    beginTurn(first, true, true)
  }

  /** 开始蓄力 */
  const beginCharge = () => {
    if (state.phase !== 'aim' || state.turn !== 0) return
    state.charging = true
    state.power = 0
  }

  /** 松手击球 */
  const releaseCharge = () => {
    if (!state.charging) return
    const p = state.power
    state.charging = false
    shoot(p)
  }

  /**
   * 自由球摆放母球
   * @param {number} x 台面坐标
   * @param {number} y 台面坐标
   */
  const placeCue = (x, y) => {
    if (state.phase !== 'place') return
    const maxX = state.ballInHandKitchen ? HEAD_LINE_X - BALL_R - 2 : TABLE.W - BALL_R - 2
    const spot = findFreeSpot(x, y, maxX)
    const cue = balls[0]
    cue.alive = true
    cue.pocketed = false
    cue.x = spot.x
    cue.y = spot.y
    cue.vx = 0
    cue.vy = 0
    beginTurn(state.turn, false, false)
  }

  /** 设置瞄准角度 */
  const setAim = (angle) => {
    state.aimAngle = normAngle(angle)
  }

  /** 微调角度 */
  const nudgeAim = (delta) => {
    if (state.phase !== 'aim' || state.turn !== 0) return
    state.aimAngle = normAngle(state.aimAngle + delta)
  }

  /** 设置鼠标位置（台面坐标） */
  const setPointer = (x, y) => {
    state.pointer.x = x
    state.pointer.y = y
    if (state.phase === 'aim' && state.turn === 0 && !state.charging) {
      const cue = balls[0]
      const dx = x - cue.x
      const dy = y - cue.y
      if (Math.hypot(dx, dy) > 1) state.aimAngle = normAngle(Math.atan2(dy, dx))
    }
  }

  /** 每帧推进 */
  const update = (dt) => {
    const d = Math.min(dt, 0.05)

    if (state.phase === 'aim' && state.charging) {
      state.power = clamp(state.power + PHYSICS.CHARGE_RATE * d, 0, 1)
    }

    if (state.phase === 'rolling') {
      stepPhysics(d)
      if (allStopped()) resolveShot()
      return
    }

    if (state.phase === 'aim' && state.turn === 1) runAi(d)

    if (state.phase === 'choose' && state.pendingGroupFor === 1) {
      chooseDelay -= d
      if (chooseDelay <= 0) chooseGroup(aiPickGroup())
    }
  }

  /** 供渲染层读取的完整状态 */
  const getState = () => ({ balls, state })

  return {
    state,
    getState,
    update,
    reset,
    shoot,
    beginCharge,
    releaseCharge,
    placeCue,
    setAim,
    nudgeAim,
    setPointer,
    chooseGroup,
  }
}
