/*  通过mutation间接更新state的多个方法的对象 */
import Vue from 'vue'
import {
  requestCategoryList,
  requestProductsCategory,
  requestGoodsList,
  requestSelect,
  requestOrdersList
} from '../ajax/index'
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
  async getOrdersTableData({commit},{pagenum,pagesize,callback}){
    const result = await requestOrdersList({pagenum,pagesize})
    console.log('getOrdersTableData',result)
    if (result.code === 0){
      commit(GET_ORDERS_TABLE_DATA,{orderTableData:result.data.result})
      callback&&callback(result.data.total)
    } else{
      Vue.prototype.$message.error('参数提交出错了')
    }
  },
  beSureUpdateGood({commit},{goodObj}){
    commit(CHANGE_CLICK_GOOD,{goodObj})
  },
  async getGoodCategory({commit},{level,pagenum,pagesize,fatherCategoryId,callFun}){
    console.log(level,pagenum,pagesize,fatherCategoryId,callFun)
    const result = await requestSelect({level,pagenum,pagesize,fatherCategoryId})
    console.log(result)
    if(result.code === 0){
      if(level*1 === 0){
        callFun&&callFun(result.data.total)
        for(let i = 0;i<result.data.result.length;i++){
          result.data.result[i].level = '0'
        }
        commit(GET_GOOD_CATEGORY,{goodsSelectOptions:result.data.result})
      }else if(level*1 === 1){
       return result.data
      }else{
        for(let i = 0;i<result.data.length;i++){
          result.data[i].leaf = true
        }
        return result.data
      }
    }else{
      Vue.prototype.$message.error('参数提交出错了')
    }
  },
  async getRequestGoodsList({commit},{pagenum,pagesize,selectStr},trueCallback,falseCallback){
    console.log('参数',pagenum,pagesize,selectStr)
    const result = await requestGoodsList({pagenum,pagesize,selectStr})
    console.log(result)
    if(result.code === 0){
      commit(GET_GOODS_LIST,{initGoodsData:result.data})
      trueCallback&&trueCallback()
    }else{
      Vue.prototype.$message.error('参数提交出错了')
      falseCallback&&falseCallback()
    }
  },
  toggleTagInputVisible ({commit},{attrSel,index,bool}){
    if(attrSel ==='dynamic'||attrSel === 'static'){
      commit(TOGGLE_TAG_INPUT_VISIBLE,{attrSel,index,bool})
    }else {
      Vue.prototype.$message.error('参数提交出错了')
    }
  },
  getChangeCasValue ({commit},{value},callback){
    commit(RECEIVE_CHANGE_CAS_VALUE,{value})
    callback&&callback()
  },
  getChangePageNum ({commit},{pagenum}){
    commit(RECEIVE_CHANGE_PAGE_NUM,{pagenum})
  },
  async getRequestCategoryList({commit,state},callback) { // 异步获取地址的action
    const pagenum =state.pagenum
    const pagesize = 5
    const result = await requestProductsCategory({pagenum,pagesize})
    if (result.code === 0) {
      console.log('vuex应用中',result.data)
      commit(RECEIVE_CATEGORY_LIST,{total:result.data.total,cascadeSelectorList:result.data.data})
    }else{
      Vue.prototype.$message.error('请求失败了')
    }
    callback&&callback()
  },
  async getRequestParameter({commit},{categoryId,attrSel}) {
    const result = await requestCategoryList({categoryId,attrSel})
    console.log(result)
    if (result.code === 0) {
      for(let i=0;i<result.data.length;i++){
        result.data[i].tagInputVisible= false
      }
      if(attrSel === 'dynamic'){ // 是否是动态数据
        commit(RECEIVE_CHANGE_DYNAMIC_DATA,{dynamicData:result.data})
      }else {
        commit(RECEIVE_CHANGE_STATIC_DATA,{staticData:result.data})
      }
    }else{
      Vue.prototype.$message.error('请求失败了')
    }
  },
  changeAttrValues({commit},{attrSel,index,tagIndex}){
    if(attrSel ==='dynamic'||attrSel === 'static'){
      commit(CHANGE_DATA_ATTR_VALUES,{index,attrSel,tagIndex})
    }else {
      Vue.prototype.$message.error('参数提交出错了')
    }
  },
  addAttrValues({commit},{attrSel,index,tag}){
    if(attrSel ==='dynamic'){
      commit(ADD_DYNAMIC_DATA_ATTR_VALUES,{index,tag})
    }else if(attrSel === 'static'){
      commit(ADD_STATIC_DATA_ATTR_VALUES,{index,tag})
    }else {
      Vue.prototype.$message.error('参数提交出错了')
    }
  }
}