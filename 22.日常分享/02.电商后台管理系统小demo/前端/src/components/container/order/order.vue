<template>
  <div class="order">
    <el-card class="order-card">
      <el-breadcrumb separator-class="el-icon-arrow-right" class="user-nav">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
      </el-breadcrumb>
      <OrderSearch style="margin-top: 20px;width: 400px"/>
      <OrderTable style="margin-top: 20px"/>
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="20"
        layout="total,  prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
  import OrderSearch from './orderSearch/orderSearch'
  import OrderTable from './orderTable/orderTable'
  import {mapState,mapActions} from 'vuex'
  export default {
    data() { // 初始化数据
      return {
        currentPage:1,
        total:0,
      }
    },
    created () { // 创建完毕状态
      this.getOrdersTableData({pagenum:this.currentPage,pagesize:20,callback:(total) =>{
        this.total = total
      }})
    },
    methods: { // 定义函数
      handleCurrentChange(val){
        this.currentPage = val
        this.getOrdersTableData({pagenum:this.currentPage,pagesize:20,callback:(total) =>{
            this.total = total
        }})
      },
      ...mapActions(['getOrdersTableData'])
    },
    components: { // 解构映射到组件
      OrderSearch,
      OrderTable,
    }
  }
  /*
    beforeCreate () { // 创建前状态
      
    },
    created () { // 创建完毕状态
      
    },
    beforeMount () { // 初始化完成前状态
      
    },
    mounted() { //初始化完成后的回调函数
      
    },
    beforeUpdate() { // 更新前状态
      
    },
    updated() { // 更新完成状态
      
    },
    beforeDestroy() { // 销毁前状态
      
    },
    destroyed() { // 销毁完成状态
      
    },
    computed: { // 计算属性
      
    },
    watch: { // 深度监视，数据一旦发生改变，立马更新保存数据
      
    },
    */
</script>
<style scoped lang='less'>
.order{
  width: 100%;
  height: 100%;
  .order-card{
    width: 100%;
    height: 100%;
  }
}
</style>