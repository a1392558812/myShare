<template>
  <div class="star" :class="'star-'+size">
    <span class="star-item" v-for="(starClass,index) in starClasses" :key="index" :class="starClass"></span>
  </div>

</template>
<script>
  const CLASSON = 'on'
  const CLASSHALF = 'half'
  const CLASSOFF = 'off'
  export default {
    props: {
      score: Number,
      size: Number,
    },
    data() { // 初始化数据
        return {}
    },
    computed: { // 计算属性
      starClasses () {
        const {score} = this
        const starClasses = []
        const onNum = +Math.floor(score)
        for (let i=0;i<onNum;i++){
          starClasses.push(CLASSON) // 向starClasses添加n个‘on’
        }
        if ((score-onNum)*10>=5) {
          starClasses.push(CLASSHALF)
        }
        for (let i=0;starClasses.length<5;i++) {
          starClasses.push(CLASSOFF)
        }
        return starClasses
      }
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
  @import "../../common/stylus/mixins.styl"
  .star
    float left
    font-size 0
    .star-item
      display inline-block
      background-repeat no-repeat
    &.star-48
      .star-item
        width 20px
        height 20px
        margin-right 22px
        background-size 20px 20px
        &:last-child
          margin-right: 0
        &.on
          bg-image('./images/star48_on')
        &.half
          bg-image('./images/star48_half')
        &.off
          bg-image('./images/star48_off')
    &.star-36
      .star-item
        width 15px
        height 15px
        margin-right 6px
        background-size 15px 15px
        &:last-child
          margin-right 0
        &.on
          bg-image('./images/star36_on')
        &.half
          bg-image('./images/star36_half')
        &.off
          bg-image('./images/star36_off')
    &.star-24
      .star-item
        width 10px
        height 10px
        margin-right 3px
        background-size 10px 10px
        &:last-child
          margin-right 0
        &.on
          bg-image('./images/star24_on')
        &.half
          bg-image('./images/star24_half')
        &.off
          bg-image('./images/star24_off')
</style>
