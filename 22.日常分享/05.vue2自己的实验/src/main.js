import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import $ from 'jquery'
import dialog from "./components/js/dialog";
Vue.prototype.$ = $
Vue.prototype.Dialog = dialog
Vue.config.productionTip = false

const vue = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

