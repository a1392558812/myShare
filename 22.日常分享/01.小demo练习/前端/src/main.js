/* 入口js */
import Vue from 'vue'
import {Button} from 'mint-ui'
import VueLazyload from 'vue-lazyload'
import './filters/index' // 加载过滤器

import App from './App'
import router from './router/index'
import store from './store'

import './mock/mockServer' // 加载mockServer

import loading from './common/imgs/loading.gif'
import error from './common/imgs/error.jpg'

Vue.component(Button.name,Button) // 注册全局组件标签<mt-button>

Vue.use(VueLazyload,{ // 内部自定义了一个指令lazy
  preLoad: 1.3,
  error,
  loading,
  attempt: 1
})

new Vue({ // 配置对象的属性名都是一些固定的属性名不能随便修改
  el: '#app',
  render: h => h(App),
  router, // 使用vue-router
  store, // 使用vuex
})

