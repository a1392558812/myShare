<template>
    <div>
      <section class="search">
        <HeaderTop title="老八美食搜一搜"/>
        <form class="search_form" @submit.prevent="searchIt">
          <input type="search" placeholder="请输入商家名称" class="search_input" v-model="keyword">
          <input type="submit" class="search_submit">
        </form>
        <section class="list" v-if="!ifNoSearchResult">
          <ul class="list_container">
            <!--:to="'/shop?id='+item.id"-->
            <router-link tag="li"
                          v-for="(searchShop,index) in searchShops"
                          :to="{path:'/shop',query:{id:searchShop.id}}"
                          :key="searchShop.id+index"
                          class="list_li">
              <section class="item_left">
                <img :src="imgBaseUrl + searchShop.image_path" class="restaurant_img">
              </section>
              <section class="item_right">
                <div class="item_right_text">
                  <p>
                    <span>{{searchShop.name}}</span>
                  </p>
                  <p>月售 {{searchShop.month_sales||searchShop.recent_order_num}} 单</p>
                  <p>{{searchShop.delivery_fee||searchShop.float_minimum_order_amount}} 元起送 / 距离{{searchShop.distance}}</p>
                </div>
              </section>
            </router-link>
          </ul>
        </section>

        <div class="search_none" v-else>很抱歉！无搜索结果</div>
      </section>
    </div>
</template>
<script>
  import {mapState} from 'vuex'
  import HeaderTop from '../../components/HeaderTop/HeaderTop'
  export default {
    data() { // 初始化数据
        return {
          keyword: '',
          ifNoSearchResult: false,
          imgBaseUrl: 'http://cangdu.org:8001/img/',
        }
    },
    computed: { // 计算属性
      ...mapState(['searchShops'])
    },
    watch: { // 深度监视，数据一旦发生改变，立马更新保存数据
      searchShops (value) {
        if (!value.length) { // 没数据
          this.ifNoSearchResult = true
        } else { // 有数据
          this.ifNoSearchResult = false
        }
      }
    },
    methods: {  // 定义函数
      searchIt () { // 得到搜索关键字进行搜索
        const keyword = this.keyword.trim()
        if (keyword) { // 在输入关键字的前提下
          this.ifNoSearchResult = false
          this.$store.dispatch('getSearchShops',keyword)
        }
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
  .search
    width 100%
    height 100%
    overflow hidden
    .search_form
      clearFix()
      margin-top 45px
      background-color #fff
      padding 12px 8px
      input
        height 35px
        padding 0 4px
        border-radius 2px
        font-weight bold
        outline none
        &.search_input
          float left
          width 79%
          border 4px solid #f2f2f2
          font-size 14px
          color #333
          background-color #f2f2f2
        &.search_submit
          float right
          width 18%
          border 4px solid #fb7299
          font-size 16px
          color #fff
          background-color #fb7299

    .list
      .list_container
        background-color: #fff;
        .list_li
          display: flex;
          justify-content: center;
          padding: 10px
          border-bottom: 1px solid $bc;
          .item_left
            margin-right: 10px
            .restaurant_img
              width 50px
              height 50px
              display block
          .item_right
            font-size 12px
            flex 1
            .item_right_text
              p
                line-height 12px
                margin-bottom 6px
                &:last-child
                  margin-bottom 0
    .search_none
      margin: 0 auto
      color: #333
      background-color: #fff
      text-align: center
      margin-top: 0.125rem
</style>
