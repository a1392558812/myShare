import Vue from 'vue'
import {requestDeleteParameter} from '../../../../../ajax/index'
export const deleteFun =({attrName,_id,attrSel}) =>{
  return new Promise(async (resolve, reject) =>{
    const result = await Vue.prototype.$confirm(`此操作将永久删除该(${attrName}), 是否继续?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).catch(e =>console.log(e))
    if(result === 'confirm'){
      const result = await requestDeleteParameter({_id,attrSel})
      console.log('点击confirm',result)
      if(result.code === 0){
        resolve(true)
      }else{
        reject(false)
      }
    }else {
      Vue.prototype.$message({type: 'info',message: '已取消删除'})
    }
  })
}