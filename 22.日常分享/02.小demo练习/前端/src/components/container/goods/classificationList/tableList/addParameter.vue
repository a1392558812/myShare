<template>
  <div>
    <el-dialog :destroy-on-close="true" :visible.sync="dialogVisible" width="40%" @close="dialogClosed">
      <span slot="title">添加{{titleName}}</span>
      <el-form :rules="rules" ref="inputForm" :model="inputForm">
        <el-form-item prop="inputValue">
          <div  class="dialog-input">
            <span style="margin:0 10px;font-size: 15px;white-space: nowrap;width: 100px">
            <i style="color: red">*</i>{{titleName}}：
            </span>
            <el-input
              style="min-width: 50px"
              :clearable="true"
              v-model="inputForm.inputValue"
              placeholder="请输入内容"/>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="clickCancel">取 消</el-button>
    <el-button type="primary" @click="clickOK">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>
<script>
  import {mapActions,mapState} from 'vuex'
  import {requestAddParameter} from '../../../../../ajax/index'
  import {checkNameFun} from '../../../../../tools/Regex'
  export default {
    data() { // 初始化数据
      return {
        inputForm:{
          inputValue:'',
        },
        rules:{
          inputValue:[
            { validator: this.checkInputValue, trigger: 'blur' }
          ]
        },
        dialogVisible:false,
        nowParameter:'', // 当前参数名称
      }
    },
    created () { // 创建完毕状态
      this.$emit('openAddParDialog',(nowParameter) =>{
        this.dialogVisible = true
        this.nowParameter = nowParameter // 确定当前的参数
      })
    },
    computed: { // 计算属性
      ...mapState(['value']),
      titleName(){
        if(this.nowParameter === 'dynamic'){
          return '动态参数'
        }else {
          return '静态属性'
        }

      }
    },
    methods: { // 定义函数
      ...mapActions(['getRequestParameter']),
      getRequestAddParameter({categoryId,attrSel,attrName}){
        return new Promise(async (resolve, reject) =>{
          const result = await requestAddParameter({categoryId,attrSel,attrName})
          if(result.code === 0){
            resolve()
          }else{
            reject()
          }
        })
      },
      checkInputValue(rule, value, callback){
        if(checkNameFun(value).valid){
          callback()
        }else{
          callback(checkNameFun(value).message)
        }
      },
      dialogClosed(){
        this.$refs.inputForm.resetFields()
      },
      clickOK(){
        this.$refs.inputForm.validate((boolean) =>{
          if(boolean){
            console.log({categoryId:this.value[2],attrSel:this.nowParameter,attrName:this.inputForm.inputValue})
            this.getRequestAddParameter({
              categoryId:this.value[2],
              attrSel:this.nowParameter,
              attrName:this.inputForm.inputValue})
              .then(() =>{
                  this.$message.success('更新成功')
                  this.getRequestParameter(
                    {categoryId:this.value[2],attrSel:this.nowParameter}
                  )
                },() =>{
                  this.$message.error('更新失败')
                })
            this.dialogVisible = false
          }else{
            this.$message.error('您还有未通过验证的字段')
          }
        })

      },
      clickCancel(){
        this.dialogVisible = false
      }
    },
    components: { // 解构映射到组件

    }
  }
</script>
<style scoped lang='less'>
.dialog-input{
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>