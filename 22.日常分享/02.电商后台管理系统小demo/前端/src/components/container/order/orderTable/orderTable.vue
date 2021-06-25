<template>
  <div>
    <el-table border height="550px" :data="orderTableData" style="width: 100%">
      <el-table-column label="#" type="index"/>
      <el-table-column label="订单编号" prop="order_number"/>
      <el-table-column label="订单价格" prop="order_price" width="100"/>
      <el-table-column label="是否付款" prop="order_price" width="100">
        <template slot-scope="scope">
          <el-tag type="success" size="medium" v-if="scope.row.pay_status === '1'">已付款</el-tag>
          <el-tag type="danger" size="medium" v-else>未付款</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否发货" prop="order_price" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.is_send === '1'? '已发货':'已发货' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" prop="order_price" width="200">
        <template slot-scope="scope">
          <span>{{timeStr(scope.row.create_time)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button
            style="margin-left: 10px"
            size="mini"
            type="primary"
            @click="editClick(scope.$index,scope.row)"
            icon="el-icon-edit"/>
          <el-button
            size="mini"
            type="success"
            @click="locationClick(scope.$index,scope.row)"
            icon="el-icon-location"/>
        </template>
      </el-table-column>
    </el-table>
    <EditDialog :nowClick="nowClick" v-on:openEditDialog="openEditDialog"/>
    <LocationDialog :nowClick="nowClick" v-on:openLocationDialog="openLocationDialog"/>
  </div>
</template>
<script>
  import LocationDialog from './locationDialog'
  import EditDialog from './editDialog'
  import {timeFun} from '../../../../tools/timeFun'
  import {mapState} from 'vuex'
  export default {
    data() { // 初始化数据
      return {
        nowClick:{},
      }
    },
    computed: { // 计算属性
      ...mapState(['orderTableData']),
      timeStr(){
        return (str) =>timeFun(str)
      }
    },
    methods: { // 定义函数
      openLocationDialog(fun){
        this.locaun = fun
      },
      openEditDialog(fun){
        this.editFun = fun
      },
      editClick(index,value){
        this.nowClick = value
        this.editFun()
        console.log(index,value)
      },
      locationClick(index,value){
        this.nowClick = value
        this.locaun()
        console.log(index,value)
      }
    },
    components: { // 解构映射到组件
      EditDialog,
      LocationDialog
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
<style scoped lang=''>

</style>