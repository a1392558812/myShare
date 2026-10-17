import { reactive } from 'vue'

/**
 * 调试面板状态：面板与牌桌共用同一份 reactive 单例。
 * `game.state` 是非响应式的纯对象，直接把 v-model 绑到它上面值会改但界面不刷新，
 * 所以面板状态独立放这里，改动后再回写引擎。
 */
export const debug = reactive({
  open: false,
  /** 透视：显示对手手牌 */
  reveal: false,
  /** 当前编辑谁的手牌：0=你 1=AI */
  target: 0,
  /** 选中的手牌下标，-1 表示还没选 */
  slot: -1,
  /** 正在拖拽的牌种，-1 表示没在拖 */
  drag: -1,
  /** 当前悬停的投放区 key：'w0'/'w1' = 摸牌槽，'h0'/'h1'… = 手牌第 N 张 */
  over: '',
  /** 拖拽跟随图的坐标 */
  gx: 0,
  gy: 0,
  msg: '',
  /** 提示里要展示的牌（画成牌面，而非 5m/6s 这类简写文本） */
  tiles: [],
  code: 'ok',
})

let timer = 0

/**
 * 面板底部的一句话提示（2.8 秒后自动消失）
 * @param {string} msg 文字说明（不要再往里塞牌简写，牌用 tiles 传）
 * @param {'ok'|'err'} code
 * @param {number[]} tiles 需要用牌面渲染的牌种
 */
export const debugSay = (msg, code = 'ok', tiles = []) => {
  debug.msg = msg || ''
  debug.code = code
  debug.tiles = msg ? tiles || [] : []
  if (timer) { clearTimeout(timer); timer = 0 }
  if (!msg) return
  timer = setTimeout(() => { debug.msg = ''; debug.tiles = []; timer = 0 }, 2800)
}

export const toggleDebug = () => {
  debug.open = !debug.open
  return debug.open
}
