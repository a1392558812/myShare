import Vue from 'vue'
import VueRouter from 'vue-router'
/*import Login from '../components/login/login.vue'
import Home from '../components/home/home.vue'
import Welcome from '../components/container/welcome/welcome.vue'*/
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/login/login.vue')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/home/home.vue')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/container/welcome/welcome.vue')
/*import User from '../components/container/user/user.vue'
import Rights from '../components/container/rights/rights.vue'
import Roles from '../components/container/rights/roles.vue'*/
const User = () => import(/* webpackChunkName: "UserManagement" */ '../components/container/user/user.vue')
const Rights = () => import(/* webpackChunkName: "UserManagement" */ '../components/container/rights/rights.vue')
const Roles = () => import(/* webpackChunkName: "UserManagement" */ '../components/container/rights/roles.vue')
/*import ProductCategory from '../components/container/goods/prouctCategory/productCategory'
import ClassificationList from '../components/container/goods/classificationList/classificationList'*/
const ProductCategory = () => import(/* webpackChunkName: "GoodManagement" */ '../components/container/goods/prouctCategory/productCategory')
const ClassificationList = () => import(/* webpackChunkName: "GoodManagement" */ '../components/container/goods/classificationList/classificationList')
/*import GoodsList from '../components/container/goods/goodsList/goodsList'
import AddGood from '../components/container/goods/goodsList/goodsComponent/addGood'
import UpdateGood from '../components/container/goods/goodsList/goodsComponent/updateGood'*/
const GoodsList = () => import(/* webpackChunkName: "GoodModify" */ '../components/container/goods/goodsList/goodsList')
const AddGood = () => import(/* webpackChunkName: "GoodModify" */ '../components/container/goods/goodsList/goodsComponent/addGood')
const UpdateGood = () => import(/* webpackChunkName: "GoodModify" */ '../components/container/goods/goodsList/goodsComponent/updateGood')
/*import Order from '../components/container/order/order'
import Report from '../components/container/report/report'*/
const Order = () => import(/* webpackChunkName: "Order" */ '../components/container/order/order')
const Report = () => import(/* webpackChunkName: "GoodModify" */ '../components/container/report/report')

Vue.use(VueRouter)

const routes = [
  {path: '/',redirect: '/login'},
  {path: '/login',component: Login},
  {path: '/home',component: Home,redirect: '/welcome',children: [
      {path: '/welcome',component: Welcome,},
      {path: '/user',component: User,},
      {path: '/root',component: Rights},
      {path: '/roles',component: Roles},
      {path: '/productscategory',component: ProductCategory},
      {path: '/categorylist',component: ClassificationList},
      {path: '/productslist',component: GoodsList},
      {path: '/productslist/add',component: AddGood},
      {path: '/productslist/update',component: UpdateGood},
      {path: '/orderlist',component: Order},
      {path: '/datelist',component: Report},
    ]
  },
]

const router = new VueRouter({
  routes
})
// 挂在路由导航守卫
router.beforeEach((to, from, next) => {
  // to为将要访问的路径
  // from为从哪个路径跳转而来
  // next() 为一个函数，标识放行   next(''/路径)  表示强制跳转
  if (to.path !== '/login') {
    // 获取token
    const token = sessionStorage.getItem('token')
    if (!token) {
      return next('/login')
    } else {
      next()
    }
  } else {
    return next()
  }
})


export default router
