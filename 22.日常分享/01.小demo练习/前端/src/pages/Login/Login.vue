<template>
  <div>
    <section class="loginContainer">
      <div class="loginInner">
        <div class="login_header">
          <h2 class="login_logo">老八外卖</h2>
          <div class="login_header_title">
            <a href="javascript:;" :class="{on: loginWay}" @click="loginWay = true">短信登录</a>
            <a href="javascript:;" :class="{on: !loginWay}" @click="loginWay = false">密码登录</a>
          </div>
        </div>
        <div class="login_content">
          <form @submit.prevent="submitLogin">
            <div :class="{on: loginWay}">
              <section class="login_message">
                <input type="tel" maxlength="11" placeholder="手机号" v-model="phone">
                <button :disabled="!rightPhone"
                         class="get_verification"
                         :class="{right_phone: rightPhone&& !ifajaxing}"
                          @click.prevent="getCode">{{computeTime>0? `已发送(${computeTime})s` :'获取验证码'}}</button>
              </section>
              <section class="login_verification">
                <input type="tel" maxlength="8" placeholder="验证码" v-model="code">
              </section>
              <section class="login_hint">
                温馨提示：未注册老八外卖帐号的手机号，登录时将自动注册，且代表已同意
                <a href="javascript:;">《用户服务协议》</a>
              </section>
            </div>
            <div :class="{on: !loginWay}">
              <section>
                <section class="login_message">
                  <input type="text" maxlength="11" placeholder="手机/邮箱/用户名" v-model="name">
                </section>
                <section class="login_verification">
                  <input type="password" maxlength="8" placeholder="密码" v-if="!ifShowPwd" v-model="pwd">
                  <input type="text" maxlength="8" placeholder="密码" v-else v-model="pwd">
                  <div class="switch_button" @click="ifShowPwd = !ifShowPwd" :class="ifShowPwd? 'on': 'off'">
                    <div class="switch_circle" :class="{right: ifShowPwd}"></div>
                    <span class="switch_text">{{ifShowPwd? '🐴' : '👹'}}</span>
                  </div>
                </section>
                <section class="login_message">
                  <input type="text" maxlength="11" placeholder="验证码" v-model="captcha">
                  <img class="get_verification"
                        src="http://localhost:4000/captcha"
                        alt="captcha"
                        @click="getCaptcha"
                        ref="captcha">
                </section>
              </section>
            </div>
            <button class="login_submit">登录</button>
          </form>
          <a href="javascript:;" class="about_us">关于我们</a>
        </div>
        <a href="javascript:" class="go_back" @click="$router.back()">
          <i class="iconfont iconicon-test17"></i>
        </a>
      </div>
      <AlertTip :alertText="alertText" v-show="ifShowAlert" @closeTip="closeTip"/>
    </section>
  </div>
</template>
<script>
  import AlertTip from '../../components/AlertTip/AlertTip'
  import {
    requestPwdLogin,
    requestSendCode,
    requestSmsLogin,
  } from '../../api/'
  export default {
    data() { // 初始化数据
      return {
        loginWay: true, // true为短信登录，false为密码登录
        phone: '', // 初始化手机号
        computeTime: 0, // 计时时间
        ifShowPwd: false, // 是否显示密码
        pwd: '',
        code: '', // 短信验证码🐴
        name: '', // 用户名
        captcha: '', // 图形验证码
        alertText: '', // 提示文本信息
        ifShowAlert: false, // 是否显示警告框
        ifajaxing: false,
      }
    },
    computed: { // 计算属性
      rightPhone () {
        return /^1(3|4|5|6|7|8|9)\d{9}$/.test(this.phone)
      }
    },
    watch: { // 深度监视，数据一旦发生改变，立马更新保存数据

    },
    methods: {  // 定义函数
      getCaptcha () { // 获取一个新的图片验证🐴
        this.$refs.captcha.src = 'http://localhost:4000/captcha?time='+Date.now()
      },
      async getCode () { // 异步获取短信验证码
        // 如果当时没有计时器，启动倒计时
        if (this.computeTime ===0) {
          this.computeTime = 30
          this.ifajaxing = true
          this.timer = setInterval(() => {
            this.computeTime--
            if (this.computeTime<=0) {
              // 清除定时器
              clearInterval(this.timer)
            }
          },1000)
          setTimeout(() =>{
            this.ifajaxing = false
          },30000)
          //发送ajax请求
          const result = await requestSendCode(this.phone)
          if (result.code===1) { // 请求失败，显示提示
            this.showAlert(result.msg)
            this.ifajaxing = false,
            this.computeTime = 0
            clearInterval(this.timer) // 停止倒计时
            this.timer = null
          }
        }
      },
      showAlert (alertText) {
        this.ifShowAlert = true
        this.alertText = alertText
      },
      async submitLogin () { // 异步登录的前台表单验证
        let result
        // 判断登录方式
        if (this.loginWay) { // true为短信登录，false为密码登录
          const {rightPhone,phone,code} = this
          if (!rightPhone) {
            // 提示手机号不正确
            this.showAlert('手机号不正确')
            return
          }else if (!/^\d{6}$/.test(code)) {
            // 提示短信验证🐴不正确
            this.showAlert('短信验证🐴不正确')
            return
          }
          result = await requestSmsLogin (phone,code) // 发送ajax请求，短信登录
        } else {
          const {name,pwd,captcha} = this
          if (!name) {
            // 用户名必须指定
            this.showAlert('用户名必须指定')
            return
          }else if (!pwd) {
            // 密码必须指定
            this.showAlert('密码必须指定')
            return
          }else if (!captcha) {
            // 验证码必须指定
            this.showAlert('验证码必须指定')
            return
          }
          result = await requestPwdLogin ({name,pwd,captcha})// 发送ajax请求，密码登录
        }
        // 停止定时器
        this.ifajaxing = false,
        this.computeTime = 0
        clearInterval(this.timer) // 停止倒计时
        this.timer = null
        // 根据结果数据处理
        if (result.code===0) {
          const user = result.data
          // 将user保存到vuex的state中
          this.$store.dispatch('recordUserInfo',user)
          // 跳转路由到个人中心
          this.$router.replace('/profile')
        } else {
          const message = result.msg
          this.showAlert(message) // 显示警告
          this.getCaptcha() // 显示新的图片验证🐴
        }
      },
      closeTip () {
        this.ifShowAlert = false
        this.alertText = ''
      }
    },
    mounted() { //初始化完成后的回调函数

    },
    components: { // 解构映射到组件
      AlertTip,
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixins.styl"
  .loginContainer
    width 100%
    height 100%
    background #fff
    .loginInner
      padding-top 60px
      width 80%
      margin 0 auto
      .login_header
        .login_logo
          font-size 40px
          font-weight bold
          color #FB7299
          text-align center
        .login_header_title
          display flex
          align-items space-around
          padding-top 40px
          text-align center
          >a
            text-decoration none!!important
            color #333
            margin auto
            font-size 14px
            padding-bottom 4px
            &:first-child
              margin-right 40px
            &.on
              color #FB7299
              font-weight 700
              border-bottom 2px solid #FB7299
      .login_content
        >form
          >div
            display none
            &.on
              display block
            input
              width 100%
              height 100%
              padding-left 10px
              box-sizing border-box
              border 1px solid #ddd
              border-radius 4px
              outline 0
              font 400 14px Arial
              &:focus
                border 1px solid #FB7299
            .login_message
              position relative
              margin-top 16px
              height 48px
              font-size 14px
              background #fff
              .get_verification
                position absolute
                top 50%
                right 10px
                transform translateY(-50%)
                border 0
                color #ccc
                font-size 14px
                background transparent
                &.right_phone
                  color black
            .login_verification
              position relative
              margin-top 16px
              height 48px
              font-size 14px
              background #fff
              .switch_button
                font-size 12px
                border 1px solid #ddd
                border-radius 8px
                transition background-color .3s,border-color .3s
                padding 0 6px
                width 30px
                height 16px
                line-height 16px
                color #fff
                position absolute
                top 50%
                right 10px
                transform translateY(-50%)
                &.off
                  background #fff
                  .switch_text
                    float right
                    color #ddd
                &.on
                  background #FB7299
                >.switch_circle
                  position absolute
                  top -1px
                  left -1px
                  width 16px
                  height 16px
                  border 1px solid #ddd
                  border-radius 50%
                  background #fff
                  box-shadow 0 2px 4px 0 rgba(0,0,0,.1)
                  transition transform .3s
                  &.right
                    transform translateX(30px)
            .login_hint
              margin-top 12px
              color #999
              font-size 14px
              line-height 20px
              >a
                color #FB7299
          .login_submit
            display block
            width 100%
            height 42px
            margin-top 30px
            border-radius 4px
            background #FB7299
            color #fff
            text-align center
            font-size 16px
            line-height 42px
            border 0
        .about_us
          display block
          font-size 12px
          margin-top 20px
          text-align center
          color #999
      .go_back
        position absolute
        top 5px
        left 5px
        width 35px
        height 35px
        >.iconfont
          font-size 32px
          color #999
</style>
