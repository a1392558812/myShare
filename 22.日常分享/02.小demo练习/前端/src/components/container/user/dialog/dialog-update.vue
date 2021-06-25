<template>
  <div>
    <el-dialog title="跟新用户信息" width="750px" :visible.sync="ifOpen" @open="dialogUpdateOpenFun" @close="dialogUpdateCloseFun">
      <el-form :model="updateForm" status-icon :rules="rules" ref="updateForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="username" :disabled="true" style="width: 600px"></el-input>
        </el-form-item>
        <el-form-item label="📪邮箱号" prop="email">
          <el-input v-model="updateForm.email" autocomplete="off" style="width: 600px"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input type="number" v-model="updateForm.mobile" autocomplete="off" style="width: 600px"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="submitCancel">取 消</el-button>
        <el-button type="primary" @click="submitUpdate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {emailRegex,phoneRegex} from '../../../../tools/Regex'
  export default {
    props:{
      pagenum:{type: Number},
      nowClick:{type: Object},
      callbackUpdate:{type:Function},
      callbackList:{type:Function}
    },
    data() { // 初始化数据
      return {
        username:'',
        ifOpen:false,
        updateForm:{
          email:'',
          mobile:null,
        },
        rules: {
          email: [
            { validator: this.checkEmail, trigger: 'blur' }
          ],
          mobile:[
            { validator: this.checkMobile, trigger: 'blur' }
          ],
        },
      }
    },
    /*beforeCreate() { // 创建前状态

    },
    created() { // 创建完毕状态

    },
    beforeMount() { // 初始化完成前状态

    },
    mounted() { //初始化完成后的回调函数

    },
    beforeUpdate: function () { // 更新前状态

    },
    updated: function () { // 更新完成状态

    },
    beforeDestroy: function () { // 销毁前状态

    },
    destroyed: function () { // 销毁完成状态

    },
    computed: { // 计算属性

    },
    watch: { // 深度监视，数据一旦发生改变，立马更新保存数据

    },*/
    created(){
      this.$emit("handelDialogUpdate", () =>{
        console.log(this.ifOpen)
        this.ifOpen = !this.ifOpen
      })
    },
    methods: { // 定义函数
      dialogUpdateOpenFun(){
        this.username = this.nowClick.username
        this.updateForm.email = this.nowClick.email
        this.updateForm.mobile = this.nowClick.mobile
      },
      dialogUpdateCloseFun(){
        this.$refs.updateForm.resetFields()
      },
      submitUpdate(){
        this.$refs.updateForm.validate((valid) => {
          if (valid) {
            const {email,mobile} = this.updateForm
            const {_id} = this.nowClick
            this.callbackUpdate({_id,email,mobile})
              .then(
                result =>{
                  const pagenum = this.pagenum
                  const pagesize = 7
                  this.callbackList({pagenum,pagesize})
                },
                err =>{

                }
              )
          } else {
            this.$message.warning("还有字段未通过验证，请仔细检查")
          }
        });
        this.ifOpen = false
      },
      submitCancel(){
        this.ifOpen = false
      },
      checkEmail(rule, value, callback){
        if (value === '') {
          callback(new Error('请输入邮箱📪'))
        } else if (!emailRegex.test(value)) {
          callback( new Error('邮箱格式不正确' ))
        } else{
          callback()
        }
      },
      checkMobile(rule, value, callback){
        if (value === '') {
          callback(new Error('请输入📱手机号'))
        } else if (!phoneRegex.test(value)) {
          callback( new Error('手机号格式不正确' ))
        } else{
          callback()
        }
      }
    },
    components: { // 解构映射到组件

    }
  }
</script>
