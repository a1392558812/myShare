import Vue from 'vue'
import App from './App.vue'
import store from './store/store'
import itemData from './model/itemData'
import cateEnum from './model/cateEnum'
import ActionHelp from './tools/ActionHelper'


Vue.config.productionTip = false;

const item1 = new itemData(1,cateEnum.Study,'还有这种操作？？？','奥里给！！！！！！！🍔');
const test = new ActionHelp();




new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
