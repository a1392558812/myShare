<template>
  <div>
    <el-dialog
      @open="DialogWillOpen"
      title="图片预览"
      :visible.sync="dialogVisible"
      width="40%"
      @close="dialogClose">
      <el-image style="width: 100%" @load="loaded" @error="errored" :src="src">
        <div slot="placeholder" class="image-slot">
          <el-image :src="img">

          </el-image>
        </div>
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline"></i>
        </div>
      </el-image>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    props:{
      url:{type:String}
    },
    data() { // 初始化数据
      return {
        img: require('./loading.gif'),
        src:'',
        dialogVisible:false
      }
    },
    created () { // 创建完毕状态
      this.$emit('openBigImageDialog',() =>{
        this.dialogVisible = true
      })
    },
    methods: { // 定义函数
      loaded(){
        console.log('加载完成')
      },
      errored(){
        console.log('加载失败')
      },
      DialogWillOpen(){
        console.log(this.url)
        if(this.url === ''){
          this.src = ''
        }else{
          this.src = `/api/upload/${this.url}`
        }
      },
      dialogClose(){ // 关闭dialog
        this.dialogVisible = false
      },
    },
    // 解构映射到组件
    components: {

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