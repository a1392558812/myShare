<template>
  <header class="header">
    <slot name="left"></slot>
    <!--<span class="header_search">
      <i class="iconfont icon-sousuo"></i>
    </span>-->
    <span class="header_title">
      <span class="header_title_text ellipsis">{{title}}</span>
    </span>
    <slot name="right"></slot>
    <!--<span class="header_login">
      <span class="header_login_text">登录|注册</span>
    </span>-->
  </header>
</template>
<script>
  export default {
    props: {
      title: String
    },
    data() { // 初始化数据
      return {}
    },
    computed: { // 计算属性

    },
    watch: { // 深度监视，数据一旦发生改变，立马更新保存数据

    },
    methods: {  // 定义函数

    },
    mounted() { //初始化完成后的回调函数

    },
    components: { // 解构映射到组件

    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  .header
    background-color #FB7299
    position fixed
    z-index 100
    left 0
    top 0
    width 100%
    height 45px
    .header_search
      position absolute
      left 15px
      top 50%
      transform translateY(-50%)
      width 10%
      height 50%
      .iconsouyisou
        font-size 25px
        color #fff
    .header_title
      position absolute
      top 50%
      left 50%
      transform translate(-50%, -50%)
      width 50%
      color #fff
      text-align center
      .header_title_text
        font-size 16px
        color #fff
        display block
    .header_login
      font-size 14px
      color #fff
      position absolute
      right 15px
      top 50%
      transform translateY(-50%)
      .header_login_text
        color #fff
</style>
