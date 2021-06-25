<template>
  <div>
    <el-dialog destroy-on-close @closed="willClosed" title="修改地址" :visible.sync="dialogVisible" width="50%">
      <el-cascader
        v-model="value"
        :options="pro"
        :props="props"
        @change="handleChange"></el-cascader>
      <pre>{{nowClick}}</pre>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {requestOrdersPro} from '../../../../ajax/index'
  export default {
    props:{
      nowClick:{type:Object}
    },
    data() { // 初始化数据
      return {
        value:[],
        props:{
          value:'name',
          label:'name'
        },
        dialogVisible:false,
        pro:[],
      }
    },
    created () { // 创建完毕状态
      this.$emit('openEditDialog',() =>{
        this.dialogVisible = true
      })
      this.getRequestOrdersPro()
    },
    methods: { // 定义函数
      handleChange(val){
        console.log(val)
      },
      async getRequestOrdersPro(){
        const result = await requestOrdersPro().catch(e=>console.log(e))
        console.log(result)
        if(result.code === 0){
          this.pro = result.data
        }else{
          this.$message.error('列表获取失败')
        }
      },
      willClosed(){
        this.value = []
      }
    },
    components: { // 解构映射到组件

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