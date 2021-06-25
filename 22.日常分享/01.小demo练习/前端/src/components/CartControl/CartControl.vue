<template>
  <div class="cartcontrol">
    <transition name="move">
      <div class="iconfont iconjian" v-if="food.count" @click.stop="updateFoodCount(false)"></div>
    </transition>
    <div class="cart-count" v-if="food.count">{{food.count}}</div>
    <div class="iconfont iconjia" @click.stop="updateFoodCount(true)"></div>
  </div>
</template>
<script>
  export default {
    props: {
      food: Object
    },
    data() { // 初始化数据
        return {}
    },
    computed: { // 计算属性

    },
    watch: { // 深度监视，数据一旦发生改变，立马更新保存数据

    },
    methods: {  // 定义函数
      updateFoodCount (ifAdd) {
        this.$store.dispatch('updateFoodCount',{food: this.food,ifAdd})
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
  .cartcontrol
    font-size: 0
    .cart-decrease
      display: inline-block
      padding: 6px
      line-height: 24px
      font-size: 24px
      color: rgb(0, 160, 220)

    .iconjian
      display: inline-block
      padding 6px
      line-height 20px
      font-size 20px
      color $pink
      &.move-enter-active, &.move-leave-active
        transition all .3s
      &.move-enter, &.move-leave-to
        opacity 0
        transform translateX(15px) rotate(90deg)
    .cart-count
      display: inline-block
      vertical-align: top
      width: 12px
      padding-top: 6px
      line-height: 24px
      text-align: center
      font-size: 10px
      color: rgb(147, 153, 159)
    .iconjia
      display: inline-block
      padding: 6px
      line-height: 20px
      font-size: 20px
      color $pink
</style>
