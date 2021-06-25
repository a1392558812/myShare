<template>
    <div class="profileBody">
      <div>
        <section class="profile">
          <HeaderTop title="👴的信息"></HeaderTop>
          <section class="profile-number">
            <router-link :to="userInfo._id? '/userinfo' : '/login'" class="profile-link">
              <div class="profile_image">
                <i class="iconfont iconbussiness-man-fill"></i>
              </div>
              <div class="user-info">
                <p class="user-info-top" v-if="!userInfo.phone">{{userInfo.name || '登录/注册'}}</p>
                <p>
                <span class="user-icon">
                  <i class="iconfont icon55"></i>
                </span>
                  <span class="icon-mobile-number">{{userInfo.phone || '暂无绑定手机号'}}</span>
                </p>
              </div>
              <span class="arrow">
              <i class="iconfont iconicon-test19"></i>
            </span>
            </router-link>
          </section>
          <section class="profile_info_data border-1px">
            <ul class="info_data_list">
              <a href="javascript:" class="info_data_link">
                <span class="info_data_top"><span>0.00</span>元</span>
                <span class="info_data_bottom">我的余额</span>
              </a>
              <a href="javascript:" class="info_data_link">
                <span class="info_data_top"><span>0</span>个</span>
                <span class="info_data_bottom">我的优惠</span>
              </a>
              <a href="javascript:" class="info_data_link">
                <span class="info_data_top"><span>0</span>分</span>
                <span class="info_data_bottom">我的积分</span>
              </a>
            </ul>
          </section>
          <section class="profile_my_order border-1px">
            <!-- 我的订单 -->
            <a href='javascript:' class="my_order">
            <span>
              <i class="iconfont iconicon-test7"></i>
            </span>
              <div class="my_order_div">
                <span>👴的订单</span>
                <span class="my_order_icon">
                <i class="iconfont iconicon-test19"></i>
              </span>
              </div>
            </a>
            <!-- 积分商城 -->
            <a href='javascript:' class="my_order">
            <span>
              <i class="iconfont iconjifen"></i>
            </span>
              <div class="my_order_div">
                <span>积分商城</span>
                <span class="my_order_icon">
                <i class="iconfont iconicon-test19"></i>
              </span>
              </div>
            </a>
            <!-- 硅谷外卖会员卡 -->
            <a href="javascript:" class="my_order">
            <span>
              <i class="iconfont iconvip-fill"></i>
            </span>
              <div class="my_order_div">
                <span>超级VIP中P</span>
                <span class="my_order_icon">
                <i class="iconfont iconicon-test19"></i>
              </span>
              </div>
            </a>
          </section>
          <section class="profile_my_order border-1px">
            <!-- 服务中心 -->
            <a href="javascript:" class="my_order">
            <span>
              <i class="iconfont iconfuwuzhongxin searchIcon"></i>
            </span>
              <div class="my_order_div">
                <span>服务中心</span>
                <span class="my_order_icon">
                <i class="iconfont iconicon-test19"></i>
              </span>
              </div>
            </a>
          </section>
          <section class="profile_my_order border-1px">
            <mt-button type="danger"
                        style="width:100%"
                        v-if="userInfo._id"
                        @click="logout">退出登录</mt-button>
          </section>
        </section>
      </div>
    </div>
</template>
<script>
  import {mapState} from 'vuex'
  import {MessageBox,Toast} from 'mint-ui';

  import HeaderTop from '../../components/HeaderTop/HeaderTop'
  export default {
    data() { // 初始化数据
        return {}
    },
    computed: { // 计算属性
      ...mapState(['userInfo'])
    },
    watch: { // 深度监视，数据一旦发生改变，立马更新保存数据

    },
    methods: {  // 定义函数
      logout () {
        MessageBox.confirm('确定不享受🌈老八奥利给?')
          .then(
            action => {
              // 求情退出
              this.$store.dispatch('logout')
              Toast('奥利给么得恰！')
            },
            action => {
              console.log("点击了取消")
            },
          );
      }
    },
    mounted() { //初始化完成后的回调函数

    },
    components: { // 解构映射到组件
      HeaderTop
    }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixins.styl"
  .profileBody
    height 100%
    background-color #FAFAFA
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
      .icon-sousuo
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
        font-weight normal
        font-size 20px
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
  .profile
    width 100%
    overflow hidden
    .profile-number
      margin-top 45.5px
      .profile-link
        clearFix()
        position relative
        display block
        background #FB7299
        padding 20px 10px
        .profile_image
          float left
          width 60px
          height 60px
          border-radius 50%
          overflow hidden
          vertical-align top
          .iconbussiness-man-fill
            background #e4e4e4
            font-size 62px
        .user-info
          float left
          margin-top 8px
          margin-left 15px
          p
            font-weight: 700
            font-size 18px
            color #fff
            &.user-info-top
              padding-bottom 8px
            .user-icon
              display inline-block
              margin-left -2px
              width 20px
              height 20px
              .icon55
                font-size 18px
                vertical-align text-align
            .icon-mobile-number
              font-size 14px
              color #fff
        .arrow
          width 28px
          height 28px
          position absolute
          right 15px
          top 40%
          .iconicon-test19
            color #fff
            font-size 28px
    .profile_info_data
      bottom-border-1px(#e4e4e4)
      width 100%
      background #fff
      overflow hidden
      .info_data_list
        clearFix()
        .info_data_link
          float left
          width 33%
          text-align center
          border-right 1px solid #f1f1f1
          .info_data_top
            display block
            width 100%
            font-size 14px
            color #333
            padding 15px 5px 10px
            span
              display inline-block
              font-size 30px
              color #f90
              font-weight 700
              line-height 30px
          .info_data_bottom
            display inline-block
            font-size 14px
            color #666
            font-weight 400
            padding-bottom 10px
        .info_data_link:nth-of-type(2)
          .info_data_top
            span
              color #ff5f3e
        .info_data_link:nth-of-type(3)
          border 0
          .info_data_top
            span
              color #ffa4be
    .profile_my_order
      top-border-1px(#e4e4e4)
      margin-top 10px
      background #fff
      .my_order
        display flex
        align-items center
        padding-left 15px
        >span
          display flex
          align-items center
          width 20px
          height 20px
          >.iconfont
            margin-left -5px
            font-size 20px
          .iconicon-test7
            color #FB7299
          .iconjifen
            color #ff5f3e
          .iconvip-fill
            color #f90
          .iconfuwuzhongxin
            color #FB7299
        .my_order_div
          width 100%
          border-bottom 1px solid #f1f1f1
          padding 18px 10px 18px 0
          font-size 16px
          color #333
          display flex
          justify-content space-between
          span
            display block
          .my_order_icon
            display block
            margin-left: auto;
            width 21px
            height 21px
            .iconicon-test19
              display block
              color #bbb
              font-size 20px
</style>
