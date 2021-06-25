<template>
  <div class="block">
    <el-pagination
      @current-change="handleCurrentChange"
      :current-page="GoodsPageNum"
      :page-size="20"
      layout="total, prev, pager, next, jumper"
      :total="GoodsTotal">
    </el-pagination>
  </div>
</template>
<script>
  import {exchangeFun} from './commen.js'
  import {mapGetters,mapActions} from 'vuex'
  export default {
    data() { // 初始化数据
      return {
        pagesize:20,
        selectStr:''
      }
    },
    computed: { // 计算属性
      ...mapGetters(['GoodsTotal','GoodsPageNum'])
    },
    created () { // 创建完毕状态
      exchangeFun.$on('goodsSearchValue',(val) =>{
        this.selectStr = val
      })
    },
    methods: { // 定义函数
      ...mapActions(['getRequestGoodsList']),
      handleCurrentChange(val){
        this.getRequestGoodsList({pagenum:val,pagesize:this.pagesize,selectStr:this.selectStr})
        console.log(`当前页: ${val}`);
      },
    },
    components: { // 解构映射到组件

    }
  }
</script>
<style scoped lang=''>

</style>