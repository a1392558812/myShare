<template>
  <div class="ratings" ref="ratings">
    <div class="ratings-content">
      <div class="overview">
        <div class="overview-left">
          <h1 class="score">{{info.score}}</h1>
          <div class="title">综合评分</div>
          <div class="rank">高于周边商家99%</div>
        </div>
        <div class="overview-right">
          <div class="score-wrapper">
            <span class="title">服务态度</span>
           <Star :score="info.serviceScore" :size="36"/>
            <span class="score">{{info.serviceScore}}</span>
          </div>
          <div class="score-wrapper">
            <span class="title">商品评分</span>
            <Star  :score="info.foodScore" :size="36"/>
            <span class="score">{{info.foodScore}}</span>
          </div>
          <div class="delivery-wrapper">
            <span class="title">送达时间</span>
            <span class="delivery">{{info.deliveryTime}}分钟</span>
          </div>
        </div>
      </div>

      <div class="split"></div>

      <div class="ratingselect">
        <div class="rating-type border-1px">
          <span class="block positive" @click="setSelectType(2)" :class="{active: selectType===2}">
            全部<span class="count">{{ratings.length}}</span>
          </span>
          <span class="block positive" @click="setSelectType(0)" :class="{active: selectType===0}">
            满意<span class="count">{{positiveNum}}</span>
          </span>
          <span class="block negative" @click="setSelectType(1)" :class="{active: selectType===1}">
            不满意<span class="count">{{ratings.length-positiveNum}}</span>
          </span>
        </div>
        <div class="switch" :class="{on: ifShowNoContent}" @click="toggleIfShowNoContent">
          <span class="iconfont iconcheck"></span>
          <span class="text">只看有内容的评价</span>
        </div>
      </div>

      <div class="rating-wrapper">
        <ul>
          <li class="rating-item" v-for="(rating,index) in fillterRatings" :key="index">
            <div class="avatar">
              <img width="28" height="28" :src="rating.avatar">
            </div>
            <div class="content">
              <h1 class="name">{{rating.username}}</h1>
              <div class="star-wrapper">
                <Star :score="rating.score"/>
                <span class="delivery">{{rating.deliveryTime}}</span>
              </div>
              <p class="text">{{rating.text}}</p>
              <div class="recommend">
                <span class="iconfont" :class="rating.rateType === 0 ? 'iconzan' : 'iconbad-fill'"></span>
                <span class="item" v-for="(item,index) in rating.recommend" :key="index">{{item}}</span>
              </div>
              <div class="time">{{rating.rateTime | date-format}}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
  import {mapState,mapGetters} from 'vuex'
  import BScroll from 'better-scroll'

  import Star from '../../../components/Star/Star'
  export default {
    data() { // 初始化数据
        return {
          ifShowNoContent: false, // 是否只显示有文本内容的
          selectType: 2 ,// 显示的评价类型，0为满意的，1为不满意的，2为全部
        }
    },
    computed: { // 计算属性
      ...mapState(['info','ratings']),
      ...mapGetters(['positiveNum']),
      fillterRatings () {
        const {ratings,selectType,ifShowNoContent} = this
        // 产生一个新的数组
        let newRatings
        if (selectType===2) {
          newRatings= ratings
        } else if (selectType===0) {
          newRatings= ratings.filter(rating => rating.rateType===0)
        } else if (selectType===1) {
          newRatings= ratings.filter(rating => rating.rateType===1)
        }
        if (ifShowNoContent) {
          newRatings = newRatings.filter(rating => {
            return rating.text !== ''
          })
        }
        return newRatings
      },
    },
    watch: { // 深度监视，数据一旦发生改变，立马更新保存数据

    },
    methods: {  // 定义函数
      setSelectType (selectType) {
        this.selectType = selectType
      },
      toggleIfShowNoContent () {
        this.ifShowNoContent = !this.ifShowNoContent
      }
    },
    mounted() { //初始化完成后的回调函数
      this.$store.dispatch('getShopRatings',() => {
        this.$nextTick(() => {
          const scroll = new BScroll (this.$refs.ratings,{
            click: true
          })
          scroll.refresh()
        })
      })
    },
    components: { // 解构映射到组件
      Star
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../../common/stylus/mixins.styl"
  .ratings
    position: absolute
    top: 195px
    bottom: 0
    left: 0
    width: 100%
    overflow: hidden
    background: #fff
    .overview
      display: flex
      padding: 18px 0
      .overview-left
        flex: 0 0 137px
        padding: 6px 0
        width: 137px
        border-right: 1px solid rgba(7, 17, 27, 0.1)
        text-align: center
        @media only screen and (max-width: 320px)
          flex: 0 0 120px
          width: 120px
        .score
          margin-bottom: 6px
          line-height: 28px
          font-size: 24px
          color: rgb(255, 153, 0)
        .title
          margin-bottom: 8px
          line-height: 12px
          font-size: 12px
          color: rgb(7, 17, 27)
        .rank
          line-height: 10px
          font-size: 10px
          color: rgb(147, 153, 159)
      .overview-right
        flex: 1
        padding: 6px 0 6px 24px
        @media only screen and (max-width: 320px)
          padding-left: 6px
        .score-wrapper
          margin-bottom: 8px
          font-size: 0
          .title
            display: inline-block
            line-height: 18px
            vertical-align: top
            font-size: 12px
            color: rgb(7, 17, 27)
          .star
            display: inline-block
            margin: 0 12px
            vertical-align: top
          .score
            display: inline-block
            line-height: 18px
            vertical-align: top
            font-size: 12px
            color: rgb(255, 153, 0)
        .delivery-wrapper
          font-size: 0
          .title
            line-height: 18px
            font-size: 12px
            color: rgb(7, 17, 27)
          .delivery
            margin-left: 12px
            font-size: 12px
            color: rgb(147, 153, 159)
    .split
      width: 100%
      height: 16px
      border-top: 1px solid rgba(7, 17, 27, 0.1)
      border-bottom: 1px solid rgba(7, 17, 27, 0.1)
      background: #f3f5f7
    .ratingselect
      .rating-type
        padding: 18px 0
        margin: 0 18px
        border-1px(rgba(7, 17, 27, 0.1))
        font-size: 0
        .block
          display: inline-block
          padding: 8px 12px
          margin-right: 8px
          line-height: 16px
          border-radius: 1px
          font-size: 12px
          color: rgb(77, 85, 93)
          background: rgba(77, 85, 93, 0.2)
          &.active
            background: $pink
            color: #fff
          .count
            margin-left: 2px
            font-size: 8px
      .switch
        padding: 12px 18px
        line-height: 24px
        border-bottom: 1px solid rgba(7, 17, 27, 0.1)
        color: rgb(147, 153, 159)
        font-size: 0
        &.on
          .iconcheck
            color: $pink
        .iconcheck
          display: inline-block
          vertical-align: top
          margin-right: 4px
          font-size: 16px
        .text
          display: inline-block
          vertical-align: top
          font-size: 12px
    .rating-wrapper
      padding: 0 18px
      .rating-item
        display: flex
        padding: 18px 0
        bottom-border-1px(rgba(7, 17, 27, 0.1))
        .avatar
          flex: 0 0 28px
          width: 28px
          margin-right: 12px
          img
            border-radius: 50%
        .content
          position: relative
          flex: 1
          .name
            margin-bottom: 4px
            line-height: 12px
            font-size: 10px
            color: rgb(7, 17, 27)
          .star-wrapper
            margin-bottom: 6px
            font-size: 0
            .star
              display: inline-block
              margin-right: 6px
              vertical-align: top
            .delivery
              display: inline-block
              vertical-align: top
              line-height: 12px
              font-size: 10px
              color: rgb(147, 153, 159)
          .text
            margin-bottom: 8px
            line-height: 18px
            color: rgb(7, 17, 27)
            font-size: 12px
          .recommend
            line-height: 16px
            font-size: 0
            .iconzan, .iconbad-fill, .item
              display: inline-block
              margin: 0 8px 4px 0
              font-size: 9px
            .iconzan
              color: $yellow
              font-size: 16px
            .iconbad-fill
              color: rgb(147, 153, 159)
              font-size: 16px
            .item
              padding: 0 6px
              border: 1px solid rgba(7, 17, 27, 0.1)
              border-radius: 1px
              color: rgb(147, 153, 159)
              background: #fff
          .time
            position: absolute
            top: 0
            right: 0
            line-height: 12px
            font-size: 10px
            color: rgb(147, 153, 159)
</style>
