<template>
  <div class="goodsAdd">
    <el-card class="goodsAdd-card">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>
      <el-container>
        <el-header height="160px">
          <el-alert class="addInfo" center :closable="false" title="添加商品信息" type="info" show-icon />
          <AddSteps :activeIndex="activeIndex"/>
        </el-header>
        <el-container>
         <el-main>
           <AddForm :activeIndex="activeIndex" :changeActiveIndex = 'changeActiveIndex'/>
         </el-main>
        </el-container>
      </el-container>
    </el-card>
  </div>
</template>
<script>
  import AddSteps from './addGoods/addSteps'
  import AddForm from './addGoods/addForm'
  export default {
    data() { // 初始化数据
      return {
        activeIndex:"0",
      }
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
      changeActiveIndex(index){
        this.activeIndex = index
        return index
      }
    },
    components: { // 解构映射到组件
      AddForm,
      AddSteps
    }
  }
</script>
<style scoped lang='less'>
  .goodsAdd{
    height: 100%;
    width: 100%;
    .goodsAdd-card{
      height: 100%;
      width: 100%;
      .addInfo{
        margin-top: 20px;
        height: 50px;
        :nth-child(1){
          height: 50px;
          font-size: 18px;
          line-height: 50px
        }
        :nth-child(2){
          height: 50px;
          :nth-child(1){
            height: 50px;
            font-size: 18px;
            line-height: 50px
          }
        }
      }
    }
  }
</style>