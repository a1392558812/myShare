/* vuex核心管理对象store */
import Vue from 'vue'
import Vuex from 'vuex'

import state from './state'
import mutations from './mutations'
import actions from './actions'
import getters from './getters'

Vue.use(Vuex) // 声明使用插件
export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})
