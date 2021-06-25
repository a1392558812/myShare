<template>
  <div>
    <div class="goods">
      <div class="menu-wrapper">
        <ul ref="foodsUl2">
          <!--current当前点击的li才有
:class="{current: index===computedIndex}"
          -->
          <li class="menu-item"
              v-for="(good,index) in goods"
              :key="index"
              :class="{current: index===((computedIndex === -1) ?0 : computedIndex)}"
              @click="fixedPosition(index)">
            <span class="text bottom-border-1px">
              <img class="icon" v-lazy="good.icon" v-if="good.icon">
              {{good.name}}
            </span>
          </li>
        </ul>
      </div>
      <div class="foods-wrapper">
        <ul ref="foodsUl">
          <li class="food-list-hook" v-for="(good,index) in goods" :key="index">
            <h1 class="title">{{good.name}}</h1>
            <ul>
              <li class="food-item bottom-border-1px"
                  v-for="(food,index) in good.foods"
                  :key="index"
                  @click="showFood(food)">
                <div class="icon">
                  <img width="57" height="57" v-lazy="food.icon">
                </div>
                <div class="content">
                  <h2 class="name">{{food.name}}</h2>
                  <p class="desc">{{food.description}}</p>
                  <div class="extra">
                    <span class="count">月售{{food.sellCount}}份</span>
                    <span>好评率{{food.rating}}%</span>
                  </div>
                  <div class="price">
                    <span class="now">￥{{food.price}}</span>
                    <span class="old" v-if="food.oldPrice">￥{{food.oldPrice}}</span>
                  </div>
                  <div class="cartcontrol-wrapper">
                    <CartControl :food="food"/>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <ShopCart></ShopCart>
    </div>
    <Food :food="food" ref="Food"/>
  </div>
</template>
<script>
  import BScroll from 'better-scroll'
  import {mapState} from 'vuex'

  import CartControl from '../../../components/CartControl/CartControl'
  import Food from '../../../components/Food/Food'
  import ShopCart from '../../../components/ShopCart/ShopCart'
  export default {
    data() { // 初始化数据
      return {
        scrollY: 0, // 右侧滑动的Y轴坐标，实时跟新
        tops: [], // 所有右侧li的top组成的数组
        food: {}, // 需要显示的food
      }
    },
    computed: { // 计算属性
      ...mapState(['goods']),
      computedIndex () {
        const {scrollY,tops} = this  // 得到条件数据
        const computedIndex = tops.findIndex((top, index) => {  // 根据条件数据进行计算
          if ((tops[index+1] > scrollY) && (scrollY >= top)) {
            return index
          }
        })
        return computedIndex
      }
    },
    watch: { // 深度监视，数据一旦发生改变，立马更新保存数据

    },
    methods: {  // 定义函数
      showFood (food) { // 显示点击的food
        // 设置food
        this.food = food
        // 显示Food组件(在父组件中调用子组件的方法)
        this.$refs.Food.toggleShow ()
      },
      fixedPosition (index) { // 使得右侧列表滑动到对应位置
        this.scrollY = this.tops[index]
        console.log(index)
        this.foodsScroll.scrollTo(0,-this.scrollY,500)
      },
      initScroll (callback) { // 初始化滚动条
        this.menuScroll = new BScroll('.menu-wrapper',{ // 在列表完成显示后创建Bscroll对象
          click: true
        })
        this.foodsScroll = new BScroll('.foods-wrapper',{
          probeType: 2, // 应为橡皮筋效果滑动不会触发
          click: true
        })
        // 给右侧列表绑定滚动监听
        this.foodsScroll.on('scroll',({x,y}) => {
          this.scrollY = Math.abs(y)
        })
        // 绑定滚动结束的监听
        this.foodsScroll.on('scrollEnd',({x,y}) => {
          this.scrollY = Math.abs(y)
          console.log('this.foodsScroll.on(scrollEnd)',this.scrollY)
        })
        callback && callback()
      },
      initTops () { // 初始化tops
        let tops = []
        let top = 0
        // 找到所有的li
        tops.push(top)
        let lis = this.$refs.foodsUl.querySelectorAll('.food-list-hook')
        Array.prototype.slice.call(lis).forEach(li => {
          console.log(li.clientHeight)
          top += li.clientHeight
          tops.push(top)
        })
        this.tops = tops
        console.log(tops)
      }
    },
    mounted() { //初始化完成后的回调函数
      this.$store.dispatch('getShopGoods',() => { // 该回调函数在数据更新后执行
        this.$nextTick(() => { // 更新DOM变化后执行
          this.initScroll(this.initTops)
          this.foodsScroll.refresh()
          this.menuScroll.refresh()
        })
        // 列表第一次显示收集tops的位置
      })
    },
    components: { // 解构映射到组件
      CartControl,
      Food,
      ShopCart
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../../common/stylus/mixins.styl"
  .goods
    display: flex
    position: absolute
    top: 195px
    bottom: 46px
    width: 100%
    background: #fff;
    overflow: hidden
    .menu-wrapper
      flex: 0 0 80px
      width: 80px
      background: #f3f5f7
      .menu-item
        display: table
        height: 70px
        width: 56px
        padding: 0 12px
        line-height: 14px
        &.current
          position: relative
          z-index: 10
          margin-top: -1px
          background: #fff
          color: $green
          font-weight: 700
          .text
            border-none()
        .icon
          display: inline-block
          vertical-align: top
          width: 12px
          height: 12px
          margin-right: 2px
          background-size: 12px 12px
          background-repeat: no-repeat
        .text
          display: table-cell
          width: 56px
          vertical-align: middle
          bottom-border-1px(rgba(7, 17, 27, 0.1))
          font-size: 12px
    .foods-wrapper
      flex: 1
      .title
        padding-left: 14px
        height: 26px
        line-height: 26px
        border-left: 2px solid #d9dde1
        font-size: 12px
        color: rgb(147, 153, 159)
        background: #f3f5f7
      .food-item
        display: flex
        margin: 18px
        padding-bottom: 18px
        bottom-border-1px(rgba(7, 17, 27, 0.1))
        &:last-child
          border-none()
          margin-bottom: 0
        .icon
          flex: 0 0 57px
          margin-right: 10px
        .content
          flex: 1
          .name
            margin: 2px 0 8px 0
            height: 14px
            line-height: 14px
            font-size: 14px
            color: rgb(7, 17, 27)
          .desc, .extra
            line-height: 10px
            font-size: 10px
            color: rgb(147, 153, 159)
          .desc
            line-height: 12px
            margin-bottom: 8px
          .extra
            display block
            white-space nowrap
            span
              display inline-block
            .count
              margin-right: 12px
          .price
            font-weight: 700
            line-height: 24px
            .now
              display inline-block
              margin-right: 8px
              font-size: 14px
              color: rgb(240, 20, 20)
            .old
              display inline-block
              text-decoration: line-through
              font-size: 10px
              color: rgb(147, 153, 159)
          .cartcontrol-wrapper
            position: absolute
            right: 0
            bottom: 12px
</style>
