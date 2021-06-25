<template>
  <div>
    <el-dialog
      @open="dialogIsOpen"
      @closed = 'dialogIsClose'
      title="提示"
      :visible.sync="dialogVisible"
      :destroy-on-close="true"
      width="30%">
      <div class="select-main">
        <p style="margin-bottom: 20px">
          <el-tag style="margin-right: 10px">当前用户:</el-tag>{{this.nowClick.username}}
        </p>
        <p  style="margin-bottom: 20px">
          <el-tag style="margin-right: 10px">当前用户角色:</el-tag>{{this.nowClick.role_name}}
        </p >
        <p>
          <span>
            <el-tag style="margin-right: 10px">分配新角色:</el-tag>
          </span>
          <el-select style="width: 200px" v-model="value" ref="selectRef" placeholder="请选择">
            <el-option
              v-for="item in this.selectOptions"
              :key="item._id"
              :label="item.role_name"
              :value="item._id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleCancel">取 消</el-button>
        <el-button type="primary" @click="distributeDialogOk">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  export default {
    props:{
      pagenum:{type:Number},
      getRequestUpdateUser:{type:Function},
      getRequestUserList:{type:Function},
      selectOptions:{type:Array},
      nowClick:{type:Object}
    },
    data() { // 初始化数据
      return {
        value:'',
        dialogVisible:false,
      }
    },
    created () { // 创建完毕状态
      this.$emit("distributeDialog", () =>{
        this.dialogVisible = true
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
      dialogIsOpen(){
        this.value = this.nowClick.role_id
      },
      dialogIsClose(){
        this.value=''
      },
      distributeDialogOk(){
        const role_id = this.$refs.selectRef.value
        const oldRoleId = this.nowClick.role_id
        if(oldRoleId !== role_id){
          const _id = this.nowClick._id
          this.getRequestUpdateUser({_id,role_id})
            .then(
              () =>{
                this.getRequestUserList({query:'',pagenum:this.pagenum,pagesize:7})
                this.dialogVisible = false
              },
              () =>{
                console.log(1222)
              }
            )
        }else{
          this.$message.error('您未做出修改，请点击取消关闭')
        }
      },
      dialogVisibleCancel(){
        this.dialogVisible = false
      }
    },
    components: { // 解构映射到组件

    }
  }
</script>
<style scoped lang='less'>
.select-main{
  margin: 30px 0;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>