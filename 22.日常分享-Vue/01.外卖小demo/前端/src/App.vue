<template>
    <div id="app">
      <router-view/>
      <FooterGuide v-show="$route.meta.ifShowFooter"/><!-- 底部导航的显示与影藏，通过路由的meta -->
      <!--
        vue-router的理解与使用
          1.router-view/router-link/keep-alive
              -当组件在keep-alive内被切换时组件的activated、deactivated这两个生命周期钩子函数会被执行
                被包裹在keep-alive中的组件的状态将会被保留，例如我们将某个列表类组件内容滑动到第100条位置，
                那么我们在切换到一个组件后再次切换回到该组件，该组件的位置状态依旧会保持在第100条列表处
          2.
        -->
    </div>
</template>
<script>
  import {mapActions} from 'vuex'

  import FooterGuide from './components/FooterGuide/FooterGuide'

  export default {
    data() { // 初始化数据
        return {}
    },
    computed: { // 计算属性

    },
    watch: { // 深度监视，数据一旦发生改变，立马更新保存数据

    },
    methods: {  // 定义函数
      ...mapActions(['getAddress','getUserInfo'])
    },
    mounted() { //初始化完成后的回调函数
      // this.$store.dispatch('getAddress')
      this.getAddress()
      this.getUserInfo()
    },
    components: { // 解构映射到组件
      FooterGuide
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  .app
    width 100%
    height 100%
    background #f5f5f5
</style>
