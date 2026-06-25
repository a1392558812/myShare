import { BATTLE_LOG_MAX_STORE } from '../constants.js'

/**
 * 模块级递增 id 计数器，为每条日志提供全局唯一稳定 key。
 * 避免使用数组索引做 key —— unshift 会导致所有条目索引位移，引发整列表重绘。
 */
let _idCounter = 0

/**
 * 向战斗日志推入一条记录（头部插入，超出存储上限自动截断尾部）。
 *
 * @param {import('vue').Ref<Array>} battleLog - 战斗日志响应式数组
 * @param {string} text - 日志文本
 */
export function pushBattleLog(battleLog, text) {
  battleLog.value.unshift({ id: ++_idCounter, time: Date.now(), text })
  // 原地截断，避免 splice 创建新数组
  if (battleLog.value.length > BATTLE_LOG_MAX_STORE) {
    battleLog.value.length = BATTLE_LOG_MAX_STORE
  }
}

/**
 * 重置 id 计数器（新游戏时调用，防止 id 无限增长）。
 */
export function resetBattleLogId() {
  _idCounter = 0
}
