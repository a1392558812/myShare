<template>
  <div class="login-container">
    <div class="login-box">
      <div class="avatar-box">
        <div class="avatar"></div>
      </div>
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="ruleForm"
        label-width="50px"
        class="demo-ruleForm login-form"
      >
        <el-form-item prop="username" class="form-input">
          <el-input
            placeholder="账号"
            prefix-icon="el-icon-s-custom"
            label-suffix
            type="text"
            style="width:360px"
            v-model="ruleForm.username"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password" class="form-input">
          <el-input
            placeholder="密码"
            prefix-icon="el-icon-lock"
            type="password"
            style="width:360px"
            v-model="ruleForm.password"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item prop="checkPassword">
          <el-input
            placeholder="确认密码"
            prefix-icon="el-icon-lock"
            type="password"
            style="width:360px"
            v-model="ruleForm.checkPassword"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item class="form-submit">
          <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import {usernameRegex,passwordRegex} from '../../tools/Regex'
import {requestLogin} from '../../ajax/index'
export default {
  data() {
    return {
      ruleForm: { // 登录的表单验证对象
        username: 'admin001',
        password: 'Admin001*',
        checkPassword: 'Admin001*'
      },
      rules: {
        username: [{ validator: this.checkUsername, trigger: 'blur' }],
        password: [{ validator: this.validatePassword, trigger: 'blur' }],
        checkPassword: [{ validator: this.validatePassword2, trigger: 'blur' }]
      }
    }
  },
  computed: { // 计算属性

  },
  watch: { // 深度监视，数据一旦发生改变，立马更新保存数据

  },
  mounted() { //初始化完成后的回调函数

  },
  components: { // 解构映射到组件

  },
  methods: { // 定义函数
    checkUsername(rule, value, callback) {
      if (!value) {
         callback(new Error('账号不能为空'))
      } else if (!usernameRegex.test(value)) {
         callback(new Error('必须是以字母开头，只能包含字母数字下划线和减号，4到16位'))
      } else {
         callback()
      }
    },
    validatePassword (rule, value, callback){
      if (value === '') {
         callback(new Error('请输入密码'))
      } else if (!passwordRegex.test(value)) {
         callback( new Error('6-16位，至少有一个数字一个大写字母一个小写字母和一个特殊字符' ))
      } else{
         callback()
      }
    },
    validatePassword2 (rule, value, callback) {
      if (value === '') {
         callback(new Error('请再次输入密码'))
      } else if (value !== this.ruleForm.password) {
         callback(new Error('两次输入密码不一致!'))
      } else {
         callback()
      }
    },
    async getRequestLogin (username,password){
      const result = await requestLogin(username,password)
      console.log(result)
      if (result.code === 0) {
        this.$message.success('成功了')
        window.sessionStorage.setItem('token',result.data.token)
        console.log('emmmmmmmmmmmmmmmmmm',result)
        window.sessionStorage.setItem('_id',result.data._id)
        this.$router.push('./home')
      } else {
        console.log('登录失败')
      }
    },
    submitForm (formName) {
      console.log(formName)
      this.$refs[formName].validate()
        .then(
          (value1,value2) =>{
            console.log(value1,value2,this.ruleForm)
            const {username,password} = this.ruleForm
            this.getRequestLogin(username,password)
            return
          },
          (error1) =>{
            return this.$message.error('错了哦,验证失败了')
          }
        )
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>
<style lang="less" scoped>
.login-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background: skyblue;
  .login-box {
    position: relative;
    width: 450px;
    height: 360px;
    background: #fff;
    border-radius: 10px 10px;
    .avatar-box {
      position: absolute;
      left: 150px;
      top: -85px;
      height: 130px;
      width: 130px;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px;
      .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: url(./avatar.jpg);
      }
    }
    .login-form {
      position: absolute;
      left: 0;
      top: 90px;
      .form-input {
        margin-bottom: 37px;
      }
      .el-form-item__error {
        min-height: 30px !important;
      }
      .form-submit {
        display: flex !important;
        flex-direction: row-reverse !important;
      }
    }
  }
}
</style>
