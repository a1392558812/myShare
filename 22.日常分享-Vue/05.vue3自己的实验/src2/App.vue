<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
    <test6></test6>
    <div @click="test">6666</div>
    <div @click="test2">🐮🍺</div>
    <div @click="test3">老八秘制小汉堡</div>
    <div @click="test4">究极测试传入组件</div>
  </div>
  <router-view/>
  <div>test7分割线------------------------------------</div>
  <test8></test8>
</template>
<script>
import { inject } from 'vue'
import test5 from './components/test5'
import test6 from './components/test6'
import test8 from './components/test8'
export default {
  setup (props, context) {
    const $mountContent = inject('$mountContent')
    const test = () => {
      $mountContent({
        confirm: (callback) => {
          console.log('confirm回调要搞一些事情')
          callback()
        },
        close: (callback) => {
          console.log('close回调')
          callback()
        }
      })
    }
    const test2 = () => {
      $mountContent({
        content: '准备搞事情',
        confirm: (callback) => {
          console.log('test2-confirm回调要搞一些事情')
          callback()
        },
        close: (callback) => {
          console.log('test2-close回调')
          callback()
        }
      })
    }
    const test3 = () => { // emmmmmmm没实现
      $mountContent({
        title: '咱家的新标题',
        confirm: (callback) => {
          console.log('试一试confirm回调要搞一些事情')
          callback()
        },
        contentContent: test5
      })
    }
    const test4 = () => { // emmmmmmm没实现
      $mountContent({
        title: 'test4测试组件',
        showHeader: false,
        maskClose: false,
        confirm: (callback) => {
          console.log('test4测试组件confirm回调要搞一些事情')
          callback()
        },
        contentContent: test5
      })
    }
    return {
      test,
      test2,
      test3,
      test4
    }
  },
  components: {
    test6,
    test8
  }
}
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
  .component{
    background: skyblue;
  }
</style>
