/* 包含多个基于state的getter计算属性 */
export default {
  GoodsList(state){
    if(state.initGoodsData.goods){
      return state.initGoodsData.goods
    }else{
      return []
    }
  },
  GoodsTotal(state){
    if(state.initGoodsData.total){
      return state.initGoodsData.total
    }else{
      return 0
    }
  },
  GoodsPageNum(state){
    if(state.initGoodsData.pagenum){
      return state.initGoodsData.pagenum*1
    }else{
      return 1
    }
  },
  StaticData(state){
    if(state.value[0]){
      return state.staticData
    }else{
      return []
    }
  },
  DynamicData(state){
    if(state.value[0]){
      return state.dynamicData
    }else{
      return []
    }
  },
  TagInputVisible(state){
    return (attrSel,index) =>{
      console.log(attrSel,index)
      if(attrSel === 'dynamic'){
        return state.dynamicData[index].tagInputVisible
      }else if(attrSel === 'static'){
        return state.staticData[index].tagInputVisible
      }else{
        return false
      }
    }
  },
}