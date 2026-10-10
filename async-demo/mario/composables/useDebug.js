import { reactive, ref } from 'vue'
import { defaultDebug } from '../game.js'

/** 面板开关（模块级单例，~ 键与按钮共用） */
const debugOpen = ref(false)
/** 调试开关：直接交给 game.debug 引用，面板与逻辑层同一份状态 */
const flags = reactive(defaultDebug())
/** 面板自身的输入项，不参与游戏逻辑 */
const panel = reactive({
  /** 打开面板时自动暂停，避免点按钮时角色掉坑 */
  pauseOnOpen: true,
  targetLevel: 0,
  stepCols: 10,
})

export const useDebug = () => {
  const toggleDebug = () => { debugOpen.value = !debugOpen.value }
  const openDebug = () => { debugOpen.value = true }
  const closeDebug = () => { debugOpen.value = false }
  const resetDebug = () => { Object.assign(flags, defaultDebug()) }

  return { debugOpen, flags, panel, toggleDebug, openDebug, closeDebug, resetDebug }
}
