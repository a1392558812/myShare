<template>
  <div>
    <el-cascader :clearable="true" ref="casSelect" v-if="reFresh" style="width: 500px" v-model="$store.state.value" :props="props" @change="casChange" :options="$store.state.cascadeSelectorList"></el-cascader>
  </div>
</template>
<script>
  export default {
    props:{
      activeName:{type:String}
    },
    data() { // 初始化数据
      return {
        reFresh:true,
        props:{
          expandTrigger: 'hover',
          value:'_id',
          label:'categoryName'
        }
      }
    },
    created () { // 创建完毕状态
      this.$emit('reFreshFun',(Bool) =>{
        this.reFresh = Bool
      })
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
      casChange(value){
        console.log(value)
        if(value[2]){ // 判断选中是否是三级分类
          this.$store.dispatch('getChangeCasValue',{value})
          this.$store.dispatch('getRequestParameter',{categoryId:value[2],attrSel:this.activeName})
        }else{
          this.$store.dispatch('getChangeCasValue',{value:[]})
        }
      },
    },
    components: { // 解构映射到组件

    }
  }
</script>
<style scoped lang=''>

</style>