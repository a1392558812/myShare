<template>
  <div style="width: 100vw;height: 100vh;overflow: hidden">
    <div style="margin: 5px 0;text-indent: 2em">刷新重新改变item个数和div宽度，可以拖拽div右下角进行缩放演示</div>
    <div class="list">
      <textarea readonly="true" class="list-content" rows="30" :cols="cols"></textarea>
      <div class="content">
        <div
          class="item-wrap"
          v-for="item in num"
          :key="item"
          :style="style(item)">
          <div class="item">
            <p>第({{item}})项</p>
          </div>
        </div>
      </div>
      <object
        ref="objectRef"
        tabindex="-1"
        type="text/html"
        aria-hidden="true"
        data="about:blank"
        :style="objStyle"></object>
    </div>
  </div>
</template>
<script>
export default {
  name: 'test2',
  data () {
    return {
      objStyle: {
        display: 'block',
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: '100%',
        height: '100%',
        border: 'none',
        padding: '0px',
        margin: '0px',
        opacity: 0,
        zIndex: -1000,
        pointerEvents: 'none'
      },
      marginRight: 0,
      cols: parseInt((Math.random() * 15 + 10) * 10), // [100, 250) 随机数
      col: 0 // 一行应该有几个
    }
  },
  computed: {
    num () {
      return parseInt(Math.random() * 10 * 2.5 + 1) // 1 ~ 10随机数
    },
    style () {
      return (item) => {
        if (!(item % this.col)) { // 第n行最后一个，不需要marginRight
          return {
            marginRight: 0
          }
        } else {
          return {
            marginRight: this.marginRight + 'px'
          }
        }
      }
    }
  },
  mounted () {
    this.reset()
    // 此处可以做个防抖函数，实际操作中只需监听窗口大小改变即可，此处方便演示，监听div大小改变
    this.$refs.objectRef.contentDocument.defaultView.addEventListener('resize', this.reset)
  },
  methods: {
    reset () {
      const wrapWidth = this.$('.content').width()
      const itemWidth = this.$('.item-wrap').width()
      this.col = parseInt(wrapWidth / itemWidth)
      if (this.num >= this.col) { // 需要换行,或者刚好一列
        this.marginRight = (wrapWidth - itemWidth * this.col) / (this.col - 1)
        console.log('需要换行,或者刚好一列,一行应该多少列', wrapWidth, itemWidth, this.col)
      } else { // 不够一行
        this.marginRight = 0 // this.marginRight = 0防止之前的计算值一直保留影响布局
        console.log('不够一行,一行应该多少列', wrapWidth, itemWidth, this.col)
      }
      console.log(wrapWidth, itemWidth)
    }
  },
  beforeDestroy () {
    this.$refs.objectRef.contentDocument.defaultView.removeEventListener('resize', this.reset)
  }
}
</script>

<style scoped lang="scss">
  .item{
    flex-shrink: 0;
    margin: 10px;
    width: 80px;
    height: 80px;
    background: yellow;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: bold;
    color: #ff0000;
  }
  .list{
    display: inline-block;
    position: relative;
    border: 1px solid red;
  }
  .content{
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 10px;
    top: 10px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    background: #fff;
    justify-content: flex-start;
    // justify-content: space-between;
  }
  .list-content{
    display: block;
    background: orange;
  }
</style>
