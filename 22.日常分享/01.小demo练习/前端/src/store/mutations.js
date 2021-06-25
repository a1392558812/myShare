/* 直接更新state的多个方法的对象 */
import Vue from 'vue'
import {
  RECEIVE_ADDRESS,
  RECEIVE_CATEGORYS,
  RECEIVE_SHOPS,
  RECEIVE_USERINFO,
  RESET_USERINFO,
  RECEIVE_GOODS,
  RECEIVE_INFO,
  RECEIVE_RATINGS,
  INCREMENT_FOOD_COUNT,
  DECREMENT_FOOD_COUNT,
  CLEAR_CART,
  RECEIVE_SEARCHSHOPS,
} from './mutation-types'
export default {
  [RECEIVE_ADDRESS] (state,{address}) {
    state.address = address
  },
  [RECEIVE_CATEGORYS] (state,{categorys}) {
    state.categorys = categorys
  },
  [RECEIVE_SHOPS] (state,{shops}) {
    state.shops = shops
  },
  [RECEIVE_USERINFO] (state,{userInfo}) {
    state.userInfo = userInfo
  },
  [RESET_USERINFO] (state) {
    state.userInfo = {}
  },
  [RECEIVE_GOODS] (state,{goods}) {
    console.log('mutation接受食品信息',goods)
    state.goods = goods
  },
  [RECEIVE_INFO] (state,{info}) {
    console.log('mutation接受商家信息',info)
    state.info = info
  },
  [RECEIVE_RATINGS] (state,{ratings}) {
    state.ratings = ratings
  },
  [INCREMENT_FOOD_COUNT] (state,{food}) {
    if (!food.count) {
      Vue.set(food,'count',1) // 给有数据绑定的对象添加新的属性，使得该属性也有数据绑定
      food.count = 1
      state.cartFoods.push(food) // 将新增的food添加到购物车中
    } else {
      food.count = food.count+1
    }
  },
  [DECREMENT_FOOD_COUNT] (state,{food}) {
    if (food.count) {
      food.count = food.count-1
      if (food.count <= 0) {
        state.cartFoods.splice(state.cartFoods.indexOf(food),1) // 将food移出到购物车
      }
    }
  },
  [CLEAR_CART] (state) {
    state.cartFoods.forEach(cartFood => cartFood.count = 0) // 清除购物车中的food的count
    state.cartFoods = [] // 移出购物车所有的购物项
  },
  [RECEIVE_SEARCHSHOPS] (state,{searchShops}) {
    state.searchShops = searchShops
  },
}
