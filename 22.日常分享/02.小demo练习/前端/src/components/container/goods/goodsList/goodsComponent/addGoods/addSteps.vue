<template>
  <div>
    <el-steps align-center style="margin-top: 20px" space="250px" :active="index" finish-status="success">
      <el-step title="步骤 1"></el-step>
      <el-step title="步骤 2"></el-step>
      <el-step title="步骤 3"></el-step>
      <el-step title="步骤 4"></el-step>
      <el-step title="步骤 5"></el-step>
      <el-step title="步骤 6"></el-step>
    </el-steps>
  </div>
</template>
<script>
  export default {
    props:{
      activeIndex:{type:String}
    },
    data() { // 初始化数据
      return {}
    },
    computed: { // 计算属性
      index(){
        return this.activeIndex*1
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

    },
    components: { // 解构映射到组件

    }
  }
</script>
<style scoped lang=''>

</style>