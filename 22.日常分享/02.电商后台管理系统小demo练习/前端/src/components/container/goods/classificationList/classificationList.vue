<template>
  <div class="classificationList">
    <el-card class="classificationList-card" v-loading="ifLoading">
      <el-breadcrumb separator-class="el-icon-arrow-right" class="user-nav">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>分类列表</el-breadcrumb-item>
      </el-breadcrumb>
      <el-alert class="elAlert" show-icon title="😅注意：只允许为第三级分类设置参数" type="warning" :closable="false"/>
      <div class="CascadeSelector">
        <div class="CascadeSelector-main">
          <p style="margin-right: 10px;font-size: 18px;font-weight: 500">选择商品分类：</p>
          <ElCascader :activeName="activeName" v-on:reFreshFun="reFreshFun"></ElCascader>
        </div>
      </div>
      <el-tabs v-model="activeName" :before-leave="beforeLeave" type="border-card" @tab-click="handleClick">
        <div style="margin:0 5px 15px 5px">
          <el-button type="primary" :disabled="!value[2]" @click="addParameter">添加{{activeName==='dynamic'?'动态参数':'静态属性'}}</el-button>
        </div>
        <el-tab-pane label="动态参数" name="dynamic">
          <PublicTable :activeName="activeName"/>
        </el-tab-pane>
        <el-tab-pane label="静态参数" name="static">
          <PublicTable :activeName="activeName"/>
        </el-tab-pane>
      </el-tabs>
      <div class="block" style="margin:10px">
        <el-pagination
          @current-change="handleCurrentChange"
          :page-size="5"
          layout="total,prev, pager, next, jumper"
          :total="$store.state.total">
        </el-pagination>
      </div>
    </el-card>
    <AddParameter v-on:openAddParDialog="openAddParDialog"/>
  </div>
</template>
<script>
  import ElCascader from './tableList/elCascader'
  import PublicTable from './tableList/publicTable'
  import AddParameter from './tableList/addParameter'
  import {mapState} from 'vuex'
  export default {
    data() { // 初始化数据
      return {
        ifLoading:false,
        activeName:'dynamic'
      }
    },
    created () { // 创建完毕状态
      this.$store.dispatch('getRequestCategoryList')
    },
    computed: { // 计算属性
      ...mapState(['value'])
    },
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
    methods: { // 定义函数
      openAddParDialog(fun){
        this.open = fun
      },
      addParameter(){
        this.open(this.activeName)
        console.log(this.activeName)
      },
      beforeLeave(activeName, oldActiveName){
        this.activeName = activeName
        if(this.$store.state.value[2]){
          const categoryId = this.$store.state.value[2]
          this.$store.dispatch('getRequestParameter',{categoryId,attrSel:activeName})
        }
        console.log(this.activeName)
      },
      reFreshFun(fun){
        this.fun = fun
      },
      handleCurrentChange(val){
        this.ifLoading = true
        this.fun(false)
        this.$store.dispatch('getChangePageNum',{pagenum:val})
        this.$store.dispatch('getChangeCasValue',{value:[]})
        this.$store.dispatch('getRequestCategoryList', () => {
          this.ifLoading = false
          this.fun(true)
        })
      },
      handleClick(tab){
        console.log(tab.index);
      }
    },
    components: { // 解构映射到组件
      ElCascader,
      PublicTable,
      AddParameter
    }
  }
</script>
<style scoped lang='less'>
.classificationList{
  height: 100%;
  width: 100%;
  .classificationList-card{
    position: relative;
    height: 100%;
    width: 100%;
    .CascadeSelector{
      padding-left: 20px;
      height: 90px;
      width: 100%;
      .CascadeSelector-main{
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
      }
    }
    .block{
      position: absolute;
      left: 15px;
      bottom: 0;
    }
  }
}
.elAlert{
  margin: 30px 0 10px 0;
  :nth-child(1){
    font-size: 18px!important;
  }
  :nth-child(2){
    :nth-child(1){
      font-size: 16px!important;
    }
  }
}
</style>