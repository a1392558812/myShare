<template>
  <div>
    <el-form-item :key="index" label-width="5px" v-for="(item,index) in addForm.goodAttr">
      <span >{{item.attrName}}</span>
      <el-input style="margin-top: 10px" v-model="item.attrValues[0]"/>
    </el-form-item>
  </div>
</template>
<script>
  import {mapState} from 'vuex'
  export default {
    data() { // 初始化数据
      return {}
    },
    computed: { // 计算属性
      ...mapState(['addForm'])
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