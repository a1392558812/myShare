<template>
    <div>
      <section class="msite">
        <!-- 头部 -->
        <HeaderTop :title="address.name">
          <router-link class="header_search" slot="left" to="/search">
            <i class="iconfont iconsouyisou"></i>
          </router-link>
          <router-link class="header_login" slot="right" :to="userInfo._id ? '/userinfo': '/login'">
            <span class="header_login_text" v-if="!userInfo._id">
              登录|注册
            </span>
            <span class="header_login_text" v-else>
              <i class="iconfont iconzhanghucaozuo"></i>
            </span>
          </router-link>
        </HeaderTop>
        <!-- 首页导航 -->
        <nav class="msite_nav">
          <div class="swiper-container" v-if="categorysArr.length>0">
            <div class="swiper-wrapper">
              <div class="swiper-slide" v-for="(items,index) in categorysArr" :key="index">
                <a href="javascript:" class="link_to_food" v-for="(category,index) in items" :key="index">
                  <div class="food_container">
                    <img :src="baseImageUrl + category.image_url">
                  </div>
                  <span>{{category.title}}</span>
                </a>

              </div>
            </div> <!-- 多个滑块的包裹 -->
            <!-- Add Pagination -->
            <div class="swiper-pagination"></div> <!-- 如果需要分页器 -->
          </div>
          <img src="./images/msite_back.svg" alt="加载中..." v-else>
        </nav>
        <!-- 附近的商家 -->
        <div class="msite_shop_list">
          <div class="shop_header">
            <i class="iconfont icon-xuanxiang"></i>
            <span class="shop_header_title">附近商家</span>
          </div>
          <ShopList></ShopList>
        </div>
      </section>
    </div>
</template>
<script>
  import Swiper from 'swiper'
  import {mapState,mapActions} from 'vuex' // vuex的一个映射函数
  import 'swiper/css/swiper.min.css'

  import HeaderTop from '../../components/HeaderTop/HeaderTop'
  import ShopList from '../../components/ShopList/ShopList'
  export default {
    data() { // 初始化数据
        return {
          baseImageUrl : 'http://fuss10.elemecdn.com'
        }
    },
    computed: { // 计算属性
      ...mapState(['address','categorys','userInfo']), // 获取vuex中管理的address
      /* 根据categorys生成二维数组，二维数组内的每个数组的长度最大为8
         结构： [[a,b,c,d,e,f,g,h],[a,b,c,d,e,f,g,h],[a,b,c,d]]
         二维数组的每一个子项为一个轮播页面显示的图片
      */
      categorysArr () {
        const {categorys} = this
        // 准备一个空二维数组
        let categorysArr = []
        let childArr = []
        let changeArr = [] // 中间商数组
        // 遍历categorys
        categorys.forEach(category =>{
          childArr.push(category)
          if (childArr.length===8) {
            changeArr = childArr
            childArr = []
          }
          if (childArr.length===0) {
            categorysArr.push(changeArr)
          }
        })
        return categorysArr
      }
    },
    watch: { // 深度监视，数据一旦发生改变，立马更新保存数据
      categorys (value) { // categroys从后台获取数据，在异步更新界面之前显示
        // 需求：获取数据界面更新后，创建Swiper对象
        this.$nextTick(() => { // vue的一个方法，用于界面更新完成的回调，一旦界面更新就调用,此条语句要写在数据跟新之后
          new Swiper('.swiper-container',{  // 创建一个Swiper对象，来实现轮播
            loop: true, // 循环模式选项,无缝滑屏
            pagination: { // 如果需要分页器
              el: '.swiper-pagination',
            },
          })
        })
      },
    },
    methods: {  // 定义函数
      ...mapActions(['getCategorys'])
    },
    mounted() { //初始化完成后的回调函数
      this.getCategorys()// 发送请求
    },
    components: { // 解构映射到组件
      HeaderTop,
      ShopList
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixins.styl"
  .msite
    width 100%
    .msite_nav
      bottom-border-1px(#e4e4e4)
      margin-top 55px
      height 200px
      background #fff
      .swiper-container
        width 100%
        height 100%
        .swiper-wrapper
          width 100%
          height 100%
          .swiper-slide
            display flex
            justify-content center
            align-items flex-start
            flex-wrap wrap
            .link_to_food
              width 25%
              .food_container
                display block
                width 100%
                text-align center
                padding-bottom 10px
                font-size 0
                img
                  display inline-block
                  width 50px
                  height 50px
              span
                display block
                width 100%
                text-align center
                font-size 13px
                color #666
        .swiper-pagination
          >span.swiper-pagination-bullet-active
            background #FB7299
    .msite_shop_list
      top-border-1px(#e4e4e4)
      margin-top 10px
      background #fff
      .shop_header
        padding 10px 10px 0
        .shop_icon
          margin-left 5px
          color #999
        .shop_header_title
          color #999
          font-size 14px
          line-height 20px
</style>
