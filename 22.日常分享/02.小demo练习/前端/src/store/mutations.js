// Mutation 用于同步变更Store中的数据,直接更新state的多个方法的对象
import {
  RECEIVE_CATEGORY_LIST,
  RECEIVE_CHANGE_PAGE_NUM,
  RECEIVE_CHANGE_CAS_VALUE,
  RECEIVE_CHANGE_STATIC_DATA,
  RECEIVE_CHANGE_DYNAMIC_DATA,
  CHANGE_DATA_ATTR_VALUES,
  ADD_DYNAMIC_DATA_ATTR_VALUES,
  ADD_STATIC_DATA_ATTR_VALUES,
  TOGGLE_TAG_INPUT_VISIBLE,
  GET_GOODS_LIST,
  GET_GOOD_CATEGORY,
  CHANGE_CLICK_GOOD,
  GET_ORDERS_TABLE_DATA
} from './mutationTypes'
export default {
  [GET_ORDERS_TABLE_DATA] (state,{orderTableData}) {
    state.orderTableData = orderTableData
  },
  [CHANGE_CLICK_GOOD] (state,{goodObj}) {
    state.willUpdateGood = goodObj
  },
  [GET_GOOD_CATEGORY] (state,{goodsSelectOptions}) {
    state.goodsSelectOptions = goodsSelectOptions
  },
  [GET_GOODS_LIST] (state,{initGoodsData}) {
    state.initGoodsData = initGoodsData
  },
  [TOGGLE_TAG_INPUT_VISIBLE] (state,{attrSel,index,bool}) {
    if(attrSel ==='dynamic'){
      state.dynamicData[index].tagInputVisible = bool
    }else{
      state.staticData[index].tagInputVisible = bool
    }
  },
  [ADD_DYNAMIC_DATA_ATTR_VALUES] (state,{index,tag}) {
    state.dynamicData[index].attrValues.push(tag)
  },
  [ADD_STATIC_DATA_ATTR_VALUES] (state,{index,tag}) {
    state.staticData[index].attrValues.push(tag)
  },
  [CHANGE_DATA_ATTR_VALUES] (state,{index,attrSel,tagIndex}) {
    if(attrSel === 'dynamic'){
      state.dynamicData[index].attrValues.splice(tagIndex, 1)
    }else{
      state.staticData[index].attrValues.splice(tagIndex, 1)
    }
  },
  [RECEIVE_CHANGE_STATIC_DATA] (state,{staticData}) {
    state.staticData = staticData
  },
  [RECEIVE_CHANGE_DYNAMIC_DATA] (state,{dynamicData}) {
    state.dynamicData = dynamicData
  },
  [RECEIVE_CATEGORY_LIST] (state,{total,cascadeSelectorList}) {
    state.total = total
    state.cascadeSelectorList = cascadeSelectorList
  },
  [RECEIVE_CHANGE_PAGE_NUM] (state,{pagenum}) {
    state.pagenum = pagenum
  },
  [RECEIVE_CHANGE_CAS_VALUE] (state,{value}) {
    state.value = value
  },
}