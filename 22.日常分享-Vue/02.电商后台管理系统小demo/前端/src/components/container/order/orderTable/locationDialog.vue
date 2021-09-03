<template>
  <div>
    <el-dialog @open="dialogOpen" title="展示物流进度" :visible.sync="dialogVisible" width="50%">
      <el-timeline :reverse="true">
        <el-timeline-item
          v-for="(activity, index) in kuaidiArr"
          :key="index"
          :timestamp="timestamp(activity.ftime)">
          <el-card>
            {{activity.context}}
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
  import {timeFun} from '../../../../tools/timeFun'
  import {requestOrdersKuaidi} from '../../../../ajax/index'
  export default {
    props:{
      nowClick:{type:Object}
    },
    data() { // 初始化数据
      return {
        kuaidiArr:[],
        dialogVisible:false
      }
    },
    computed: { // 计算属性
      timestamp(){
        return (timeNum) =>timeFun(timeNum)
      }
    },
    created () { // 创建完毕状态
      this.$emit('openLocationDialog',() =>{
        this.dialogVisible = true
      })
    },
    methods: { // 定义函数
      dialogOpen(){
        this.getRequestOrdersKuaidi({orderId:this.nowClick._id})
      },
      async getRequestOrdersKuaidi({orderId}){
        const result = await requestOrdersKuaidi({orderId})
        console.log(result)
        if(result.code === 0){
          this.kuaidiArr = result.data
        }else{
          this.$message.error('物流获取失败了')
        }
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