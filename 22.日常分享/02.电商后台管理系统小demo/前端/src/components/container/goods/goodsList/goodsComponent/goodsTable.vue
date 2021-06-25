<template>
  <div>
    <el-table border stripe height="560" :data="GoodsList" style="width: 100%">
      <el-table-column type="index" label="#" />
      <el-table-column label="商品名称" prop="goodsName"/>
      <el-table-column label="商品价格(￥)" prop="goodsPrice" width="200px"/>
      <el-table-column label="商品重量" prop="goodsWeight" width="200px"/>
      <el-table-column label="创建时间" width="340px">
        <template slot-scope="scope">
          <span>{{nowTime(scope.row.addTime)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="340px">
        <template slot-scope="scope">
          <el-button @click="updateGood(scope.$index,scope.row)" type="primary" size="mini" style="margin-left: 30px">编辑</el-button>
          <el-button @click="deleteGood(scope.row)" size="mini" type="danger" style="margin-left: 30px">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
  import {mapActions,mapGetters,mapState} from 'vuex'
  import {requestDeleteGood} from '../../../../../ajax/index'
  import {exchangeFun} from './commen'
  import {timeFun} from '../../../../../tools/timeFun'
  export default {
    data() { // 初始化数据
      return {
        pagesize:20,
        selectStr:''
      }
    },
    created () { // 创建完毕状态
      this.getRequestGoodsList({pagenum:1,pagesize:20})
      exchangeFun.$on('goodsSearchValue',(val) =>{
        this.selectStr = val
      })
    },
    computed: { // 计算属性
      ...mapGetters(['GoodsList','GoodsPageNum']),
      nowTime(){
        return (t) => timeFun(t)
      }
    },
    methods: { // 定义函数
      ...mapActions(['getRequestGoodsList','beSureUpdateGood']),
      getRequestDeleteGood({_id}){
        return new Promise(async(resolve, reject) =>{
          const result = await requestDeleteGood({_id})
          console.log(result)
          if(result.code === 0){
            resolve(true)
          }else{
            reject(false)
          }
        })
      },
      updateGood(index,value){
        console.log(index,value)
        value.goodsState = value.goodsState.toString()
        this.beSureUpdateGood({goodObj:value})
        this.$router.push('/productslist/update')
      },
      async deleteGood(item){
        console.log(item)
        const result =await this.$confirm(`此操作将永久删除(${item.goodsName})文件, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(e =>this.$message({type: 'info',message: '已取消删除'}))
        if(result === 'confirm'){
          const _id = item._id
          this.getRequestDeleteGood({_id})
            .then(
              () =>{
                this.getRequestGoodsList(
                  {pagenum:this.GoodsPageNum,pagesize:this.pagesize,selectStr:this.selectStr},
                  () =>{this.$message.success('删除成功')},
                  () =>{this.$message.error('新数据获取失败')}
                )},
              () =>this.$message.error('删除失败')
            )
        }
      }
    },
    components: { // 解构映射到组件

    }
  }
</script>
<style scoped lang=''>

</style>