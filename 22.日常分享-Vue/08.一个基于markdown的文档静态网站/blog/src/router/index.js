import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '../views/home.vue')
  },
  {
    path: '/bingDwenDwen',
    name: 'bingDwenDwen',
    component: () => import(/* webpackChunkName: "bingDwenDwen" */ '../views/bingDwenDwen.vue')
  },
  {
    path: '/search',
    name: 'search',
    component: () => import(/* webpackChunkName: "search" */ '../views/search.vue')
  },
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: () => import(/* webpackChunkName: "bookmarks" */ '../views/bookmarks.vue')
  },
  {
    path: '/music',
    name: 'music',
    component: () => import(/* webpackChunkName: "music" */ '../views/music.vue')
  },
  {
    path: '/404',
    name: '404',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "404" */ '../views/404.vue')
  },
  {
    path: '/error',
    name: 'Error',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "error" */ '../views/error.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
/**
 * 路由守卫
 */
router.beforeEach((guard) => {
  if (!routes.filter(item => item.path === guard.path).length) {
    router.replace('/404').then()
  }
})

export default router
