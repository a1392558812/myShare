/* 路由器对象模块 */
import Vue from 'vue'
import VueRouter from 'vue-router'

/* 路由组件懒加载，我们一般只对一些特别大的路由进行懒加载，如果所有的路由都进行懒加载，则会发很多的不必要的请求，一般相对比较外层的
路由才会进行懒加载
import MSite from '../pages/MSite/MSite'
import Order from '../pages/Order/Order'
import Profile from '../pages/Profile/Profile'
import Search from '../pages/Search/Search'
import Login from '../pages/Login/Login'
import Shop from '../pages/Shop/Shop'
*/

const MSite = () => import('../pages/MSite/MSite')
const Order = () => import('../pages/Order/Order')
const Profile = () => import('../pages/Profile/Profile')
const Search = () => import('../pages/Search/Search')
const Login = () => import('../pages/Login/Login')
const Shop = () => import('../pages/Shop/Shop')

import ShopGoods from '../pages/Shop/ShopGoods/ShopGoods'
import ShopInfo from '../pages/Shop/ShopInfo/ShopInfo'
import ShopRatings from '../pages/Shop/ShopRatings/ShopRatings'

// 声明使用插件
Vue.use(VueRouter)
export default new VueRouter({
  // 配置所有的路由
  routes: [ // 设置路由与组件
    {path: '/msite',component: MSite,meta: {ifShowFooter: true}},
    // 此时component: MSite返回路由组件函数，只有执行此函数才会加载路由组件，这个函数请求对应的路由路径才会执行
    {path: '/order',component: Order,meta: {ifShowFooter: true}},
    {path: '/profile',component: Profile,meta: {ifShowFooter: true}},
    {path: '/search',component: Search,meta: {ifShowFooter: true}},
    {path: '/login',component: Login,meta: {ifShowFooter: false}},
    {path: '/shop',
      component: Shop,
      meta: {ifShowFooter: false},
      children: [
        {path: '/shop/goods',component: ShopGoods},
        {path: '/shop/ratings',component: ShopRatings},
        {path: '/shop/info',component: ShopInfo},
        {path: '',redirect: '/shop/goods'} // 设置默认路径
      ]},
    {path: '/',redirect: '/msite'} // 设置默认路径
  ]
})


