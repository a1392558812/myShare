import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import $ from 'jquery'
import dialog from "./components/js/dialog";
import loading from "./components/js/loading";
import vloading from "./components/js/vloading";
import "./static/common.css";
vloading()
Vue.use(loading)
Vue.prototype.$ = $
Vue.prototype.Dialog = dialog
Vue.prototype.$loading = loading
Vue.config.productionTip = false

const vue = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

