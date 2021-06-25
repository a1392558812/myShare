<template>
  <div>
    <el-dialog :visible.sync="dialogVisible" :destroy-on-close="true" width="50%" @open="updateCategoryOpen">
      <span slot="title">当前分类名称{{nowClick.categoryName}}</span>
      <el-form status-icon ref="updateForm" :model="updateForm" :rules="rules" label-width="80px">
        <el-form-item label="分类名称"  prop="categoryName">
          <el-input v-model="updateForm.categoryName"></el-input>
        </el-form-item>
        <el-form-item label="是否有效">
          <el-radio-group v-model="updateForm.categoryDeleted">
            <el-radio label='false'>有效</el-radio>
            <el-radio label='true'>无效</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisibleCancel">取 消</el-button>
    <el-button type="primary" @click="dialogVisibleOk">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>
<script>
  import {checkNameFun} from '../../../../../tools/Regex'
  import { requestUpdateRoot } from '../../../../../ajax'

  export default {
    props:{
      getRequestProductsCategory:{type:Function},
      pagenum:{type:Number},
      pagesize:{type:Number},
      nowClick:{type:Object}
    },
    data() { // 初始化数据
      return {
        dialogVisible:false,
        updateForm:{categoryName:'',categoryDeleted:'',},
        rules:{ categoryName:[{ validator: this.checkCategoryName, trigger: 'blur' }]},
      }
    },
    created () { // 创建完毕状态
      this.$emit('openDialogUpdate',() =>{
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
      async getRequestUpdateRoot({_id,categoryLevel,categoryName,categoryDeleted}){
        const result = await requestUpdateRoot({_id,categoryLevel,categoryName,categoryDeleted})
        console.log(result)
        if(result.code === 0){
          this.$message.success('跟新成功')
          this.getRequestProductsCategory({pagenum:this.pagenum,pagesize:this.pagesize})
          this.dialogVisible = false
        }else {
          this.$message.success('跟新失败')
        }
      },
      dialogVisibleOk(){
        this.$refs.updateForm.validate((valid) =>{
          if(valid){
            const categoryName = this.updateForm.categoryName
            let categoryDeleted
            this.updateForm.categoryDeleted === 'true'? categoryDeleted = true:categoryDeleted = false
            const {_id,categoryLevel} = this.nowClick
            console.log({_id,categoryLevel,categoryName,categoryDeleted})
            this.getRequestUpdateRoot({_id,categoryLevel,categoryName,categoryDeleted})
          }else{
            this.$message.error('您还有未通过验证的字段')
          }
        })
      },
      dialogVisibleCancel(){
        this.dialogVisible=false
      },
      updateCategoryOpen(){
        this.updateForm.categoryName= this.nowClick.categoryName
        this.updateForm.categoryDeleted = this.nowClick.categoryDeleted.toString()
      },
      checkCategoryName(rule, value, callback){
        const {valid,message} = checkNameFun(value)
        if(valid){
          callback()
        }else{
          callback(new Error(message))
        }
      }
    },
    components: { // 解构映射到组件

    }
  }
</script>
<style scoped lang=''>

</style>