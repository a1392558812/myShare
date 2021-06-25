<template>
  <div>
    <el-dialog :destroy-on-close="true" :visible.sync="dialogVisible" width="40%" @close="dialogClosed">
      <span slot="title">更新{{titleName}}</span>
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
  import {checkNameFun} from '../../../../../tools/Regex'
  import {mapActions,mapState} from 'vuex'
  import {requestUpdateParameter} from '../../../../../ajax/index'
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
        oldName:'', // 旧的名称
        dialogVisible:false,
        nowParameter:'',
        _id:''
      }
    },
    created () { // 创建完毕状态
      this.$emit('openUpdateParDialog',({nowParameter,inputValue,_id}) =>{
        if(nowParameter){
          this.dialogVisible = true
          this.inputForm.inputValue = inputValue
          this.oldName = inputValue
          this.nowParameter = nowParameter // 确定当前的参数
          this._id = _id
        }
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
      getRequestUpdateParameter({_id,attrSel,attrName,attrValues}){
        return new Promise(async (resolve, reject) =>{
          const result = await requestUpdateParameter({_id,attrSel,attrName,attrValues})
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
      clickOK(){
        this.$refs.inputForm.validate((boolean) =>{
          if(boolean){
            if(this.oldName === this.inputForm.inputValue){
              this.$message.error('您还未做出修改')
            }else{
              this.getRequestUpdateParameter({
                _id:this._id,
                attrSel:this.nowParameter,
                attrName:this.inputForm.inputValue})
                .then(
                  () =>{
                    this.getRequestParameter({
                      categoryId:this.value[2],
                      attrSel:this.nowParameter})
                    this.$message.success('跟新成功')
                    this.dialogVisible = false
                  },
                  () =>{
                    this.$message.error('跟新失败')
                  }
                )
             this.dialogVisible = false
            }
            /* _id attrSel attrName */
          }else {
            this.$message.error('您还有未通过验证的字段')
          }
        })
        console.log(this.inputForm.inputValue)
      },
      clickCancel(){
        this.dialogVisible = false
      },
      dialogClosed(){
        this.inputForm.inputValue=''
        this.$refs.inputForm.resetFields()
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