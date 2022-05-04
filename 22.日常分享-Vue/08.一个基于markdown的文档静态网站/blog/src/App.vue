<template>
  <div id="page" class="overflow-hidden">
    <layout-header
      v-if="ifShowHeaderComponent"
      :ifLarger="ifLarger"
      :headerH="headerH"
      :showNavLink="showNavLink"
      :ifShowHeaderPopupBtn="ifShowHeaderPopupBtn"
      @toggleMenu="toggleMenu"
      @toggleShowNavLink="toggleShowNavLink"
      @refreshView="refreshView"/>
    <div class="relative" :class="ifShowHeaderComponent ? 'content' : ''">
      <left-nav-link
        v-if="ifShowHeaderComponent"
        :showNavLink="showNavLink"
        :leftSidebarW="leftSidebarW"
        :ifLarger="ifLarger"
        @toggleShowNavLink="toggleShowNavLink"
        @refreshView="refreshView"/>
      <router-view
        :key="refreshViewKey"
        :ifLarger="ifLarger"
        :headerH="headerH"
        :ifShowMenu="ifShowMenu"
        :toggleMenu="toggleMenu"
        :leftSidebarW="leftSidebarW"/>
    </div>
  </div>
</template>
<script>

import { ref, watch } from 'vue'
import guid from '@/common/util/guid.js'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import { useRoute } from 'vue-router'
import leftNavLink from '@/components/left-nav-link/left-nav-link.vue'

import layoutHeader from '@/components/layout-header/layout-header.vue'

export default {
  components: {
    layoutHeader,
    leftNavLink
  },
  setup () {
    const ifShowMenu = ref(false) // 是否展示公用头部组件展开左侧抽屉（移动端）的控制按钮
    const showNavLink = ref(false) // 移动端的公用头部组件展开后的左侧【导航抽屉】显影
    const ifShowHeaderPopupBtn = ref(false) // 移动端的公用头部组件展开后的左侧【文章抽屉】显影
    const ifShowHeaderComponent = ref(true) // 是否展示公用头部组件
    const ifLarger = useBreakpoints(breakpointsTailwind).greater('sm')
    const leftSidebarW = ref('320px')
    const refreshViewKey = ref(guid())
    const route = useRoute()
    if (!ifLarger) {
      leftSidebarW.value = '100vw'
    }
    watch(route, (newV) => {
      const { ifShowHeaderComponent: flag } = newV.meta
      ifShowHeaderComponent.value = (flag !== undefined) ? flag : true
      ifShowHeaderPopupBtn.value = [
        '/'
      ].includes(newV.path)
    })
    return {
      headerH: ref('70px'),
      showNavLink,
      ifShowMenu,
      ifShowHeaderPopupBtn,
      leftSidebarW,
      ifLarger,
      ifShowHeaderComponent,
      refreshViewKey,
      // 切换菜单状态
      toggleMenu: state => {
        console.log('切换菜单状态')
        ifShowMenu.value = (state !== undefined) ? state : !ifShowMenu.value
        showNavLink.value = false
      },
      // 切换导航状态
      toggleShowNavLink: state => {
        console.log('切换导航状态')
        showNavLink.value = (state !== undefined) ? state : !showNavLink.value
        ifShowMenu.value = false
      },
      refreshView: () => {
        refreshViewKey.value = guid()
      }
    }
  }
}
</script>

<style scoped lang="scss">
#page{
  height: 100vh;
  position: relative;
  .content{
    height: calc(100vh - v-bind(headerH));
    margin-top: v-bind(headerH);
  }
}
</style>
