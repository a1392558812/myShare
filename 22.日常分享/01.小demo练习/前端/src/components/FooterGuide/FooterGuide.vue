<template>
    <div class="footer_guide">
      <a href="javascript:;" class="guide_item" :class="{on: '/msite'===$route.path}" @click="goTo('/msite')">
        <span class="item_icon">
          <i class="iconfont iconintegral-fill"></i>
        </span>
        <span>外卖</span>
      </a>
      <a href="javascript:;" class="guide_item" :class="{on: '/search'===$route.path}" @click="goTo('/search')">
        <span class="item_icon">
          <i class="iconfont iconicon-test2"></i>
        </span>
        <span>搜索</span>
      </a>
      <a href="javascript:;" class="guide_item" :class="{on: '/order'===$route.path}" @click="goTo('/order')">
        <span class="item_icon">
          <i class="iconfont iconicon-test3"></i>
        </span>
        <span>订单</span>
      </a>
      <a href="javascript:;" class="guide_item" :class="{on: '/profile'===$route.path}" @click="goTo('/profile')">
        <span class="item_icon">
          <i class="iconfont iconbussiness-man-fill"></i>
        </span>
        <span>我的</span>
      </a>
    </div>
</template>
<script>
    export default {
        data() { // 初始化数据
            return {}
        },
        computed: { // 计算属性

        },
        watch: { // 深度监视，数据一旦发生改变，立马更新保存数据

        },
        methods: {  // 定义函数
          goTo (path) {
            this.$router.replace(path)
          }
        },
        mounted() { //初始化完成后的回调函数

        },
        components: { // 解构映射到组件

        }
    }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixins.styl"
  .footer_guide
    top-border-1px(#e5e5e5)
    position fixed
    z-index 10
    left 0
    right 0
    bottom 0
    background-color #FB7299
    width 100%
    height 57px
    display flex
    .guide_item
      display flex
      flex 1
      text-align center
      flex-direction column
      align-items center
      margin 5px
      color: #783939
      &.on
        color #fff0f0
      span
        font-size 12px
        margin-top 2px
        margin-bottom 2px
        .iconfont
          font-size 30px

</style>
