<template>
  <div>
    <el-dialog title="添加用户" width="750px" :visible.sync="ifOpen" @close="dialogIsClosed">
      <el-form :model="ruleForm" ref="ruleForm" :rules="rules" class="demo-ruleForm" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="ruleForm.username" autocomplete="off" style="width: 600px"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" prop="password">
          <el-input type="password" v-model="ruleForm.password" autocomplete="off" style="width: 600px"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="password2">
          <el-input type="password" v-model="ruleForm.password2" autocomplete="off" style="width: 600px"></el-input>
        </el-form-item>
        <el-form-item label="📪邮箱" prop="email">
          <el-input v-model="ruleForm.email" autocomplete="off" style="width: 600px"></el-input>
        </el-form-item>
        <el-form-item label="📱手机号" prop="mobile">
          <el-input type="number" v-model="ruleForm.mobile" autocomplete="off" style="width: 600px"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitAddUser">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {requestAddUser} from '../../../../ajax/index'
  import {usernameRegex,passwordRegex,emailRegex,phoneRegex} from '../../../../tools/Regex'
  export default {
    props:{
      callbackList:{
        type:Function,
      }
    },
    data() {
      return {
        ifOpen:false,
        ruleForm: {
          username: '',
          password2:'',
          password:'',
          email:'',
          mobile:''
        },
        rules: {
          username: [
            { validator: this.checkUsername, trigger: 'blur' }
          ],
          password: [
            { validator: this.checkPassword, trigger: 'blur' }
          ],
          password2:[
            { validator: this.checkPassword2, trigger: 'blur' }
          ],
          email: [
            { validator: this.checkEmail, trigger: 'blur' }
          ],
          mobile:[
            { validator: this.checkMobile, trigger: 'blur' }
          ],
        },
        formLabelWidth: '120px'
      };
    },
    created() { // 创建完毕状态
      this.$emit("handelDialogAdd", () =>{
        this.ifOpen = !this.ifOpen
      })
    },
    /*beforeMount() { // 初始化完成前状态

    },
    beforeCreate() { // 创建前状态

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
    methods: { // 定义函数
      /* this.$refs[formName].resetFields(); */
      getRequestAddUser({username,password,email,mobile}){
        return new Promise(async (resolve,reject) =>{
          const result = await requestAddUser({username,password,email,mobile})
          if(result.code === 0){
            this.$message.success('添加用户成功')
            const pagenum = 1
            const pagesize = 7
            this.callbackList({pagenum,pagesize})
            resolve(result)
          }else if(result.code === 2){
            this.$message.error('该账号已被使用了')
            reject()
          }else{
            this.$message.error('添加用户失败')
            reject()
          }
        })
      },
      dialogIsClosed(){
        this.$refs.ruleForm.resetFields()
      },
      closeDialog(){ // 关闭模态框
        this.ifOpen=false
      },
      submitAddUser(){ // 提交信息
        console.log(this.ruleForm)
        this.$refs.ruleForm.validate((valid) => {
          if (valid) {
            const {username,password,email,mobile} = this.ruleForm
            this.getRequestAddUser({username,password,email,mobile})
              .then(
                value => {
                  this.ifOpen=false
                },
                err =>{
                  console.log(err)
                }
              )
          } else {
            this.$message.warning("还有字段未通过验证，请仔细检查")
          }
        });
      },
      checkUsername(rule, value, callback){
        if (!value) {
          callback(new Error('账号不能为空'))
        } else if (!usernameRegex.test(value)) {
          callback(new Error('必须是以字母开头，只能包含字母数字下划线和减号，4到16位'))
        } else {
          callback()
        }
      },
      checkPassword(rule, value, callback){
        if (value === '') {
          callback(new Error('请输入密码'))
        } else if (!passwordRegex.test(value)) {
          callback( new Error('6-16位，至少有一个数字一个大写字母一个小写字母和一个特殊字符' ))
        } else{
          callback()
        }
      },
      checkPassword2(rule, value, callback){
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.ruleForm.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
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
