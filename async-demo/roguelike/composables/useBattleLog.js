import { BATTLE_LOG_MAX_STORE } from '../constants.js'


let _idCounter = 0


export function pushBattleLog(battleLog, text) {
  battleLog.value.unshift({ id: ++_idCounter, time: Date.now(), text })
  if (battleLog.value.length > BATTLE_LOG_MAX_STORE) {
    battleLog.value.length = BATTLE_LOG_MAX_STORE
  }
}


export function resetBattleLogId() {
  _idCounter = 0
}
