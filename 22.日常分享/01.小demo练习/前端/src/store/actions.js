/*  通过mutation间接更新state的多个方法的对象 */
import {
  RECEIVE_ADDRESS,
  RECEIVE_CATEGORYS,
  RECEIVE_SHOPS,
  RECEIVE_USERINFO,
  RESET_USERINFO,
  RECEIVE_RATINGS,
  RECEIVE_INFO,
  RECEIVE_GOODS,
  INCREMENT_FOOD_COUNT,
  DECREMENT_FOOD_COUNT,
  CLEAR_CART,
  RECEIVE_SEARCHSHOPS,
} from './mutation-types'
import {
  requestAddress,
  requestCategorys, requestLogout,
  requestShopList,
  requestUserInfo,
  requestShopGoods,
  requestShopInfo,
  requestShopRatings,
  requestSearchShop,
} from '../api/index'

export default {
  async getAddress({commit,state}) { // 异步获取地址的action
    const geohash = state.latitude+','+state.longitude
    const result = await requestAddress(geohash)
    if (result.code === 0) { // 提交一个mutation来修改state
      const address = result.data
      commit(RECEIVE_ADDRESS,{address}) // 更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。类似于react的switch，
    }
  },
  async getCategorys({commit}) { // 异步获取食品分类的action
    const result = await requestCategorys()
    if (result.code === 0) { // 提交一个mutation来修改state
      const categorys = result.data
      commit(RECEIVE_CATEGORYS,{categorys}) // 更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。类似于react的switch，
    }
  },
  async getShopList({commit,state}) { // 异步获取商家的action
    const {latitude,longitude} = state
    const result = await requestShopList(latitude,longitude)
    if (result.code === 0) { // 提交一个mutation来修改state
      const shops = result.data
      commit(RECEIVE_SHOPS,{shops}) // 更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。类似于react的switch，
    }
  },
  // 同步记录用户信息
  recordUserInfo ({commit},userInfo) {
    commit(RECEIVE_USERINFO,{userInfo})
  },
  // 异步获取用户信息
  async getUserInfo ({commit}) {
    const result = await requestUserInfo()
    if (result.code===0) {
      const userInfo = result.data
      commit(RECEIVE_USERINFO,{userInfo})
    }
  },
  async logout({commit}) { // 异步登出
    const result = await requestLogout()
    if (result.code===0) {
      commit(RESET_USERINFO)
    }
  },
  async getShopInfo({commit}) { // 异步获取商家信息
    const result = await requestShopInfo()
    console.log('getShopInfo异步获取商家信息',result)
    if (result.code===0) {
      const info = result.data
      commit(RECEIVE_INFO,{info})
    }
  },
  async getShopRatings({commit},callback) { // 异步获取商家评价
    const result = await requestShopRatings()
    if (result.code===0) {
      const ratings = result.data
      commit(RECEIVE_RATINGS,{ratings})
      callback && callback()
    }
  },
  async getShopGoods({commit},callback) { // 异步获取商品信息
    const result = await requestShopGoods()
    console.log('getShopGoods异步获取食品信息',result)
    if (result.code===0) {
      const goods = result.data
      commit(RECEIVE_GOODS,{goods})
      callback && callback()
    }
  },
  updateFoodCount({commit},{food,ifAdd}) {
    if (ifAdd) {
      commit(INCREMENT_FOOD_COUNT,{food})
    } else {
      commit(DECREMENT_FOOD_COUNT,{food})
    }
  },
  clearCart ({commit}) { // 同步清空购物车
    commit(CLEAR_CART)
  },
  async getSearchShops({commit,state},keyword,callback) { // 异步获取搜索的商家
    const geohash = state.latitude+','+state.longitude
    const result = await requestSearchShop(geohash,keyword)
    if (result.code===0) {
      const searchShops = result.data
      commit(RECEIVE_SEARCHSHOPS,{searchShops})
      callback && callback()
    }
  },
}
