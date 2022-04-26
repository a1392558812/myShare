<template>
  <div id="page" class="overflow-hidden">
    <layout-header
      :style="headerStyle"
      :ifLarger="ifLarger"
      :headerH="headerH"
      :showNavLink="showNavLink"
      :ifShowHeaderPopupBtn="ifShowHeaderPopupBtn"
      @toggleMenu="toggleMenu"
      @toggleShowNavLink="toggleShowNavLink"
      @refreshView="refreshView"/>
    <div class="content relative">
      <left-nav-link
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

import { ref, watch, reactive } from 'vue'
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
    const ifShowMenu = ref(false)
    const headerStyle = reactive({}) // meta中给header额外携带的样式
    const showNavLink = ref(false)
    const ifLarger = useBreakpoints(breakpointsTailwind).greater('sm')
    const leftSidebarW = ref('320px')
    const refreshViewKey = ref(guid())
    const route = useRoute()
    const ifShowHeaderPopupBtn = ref(false) // 头部控制左侧Popup弹出层
    if (!ifLarger) {
      leftSidebarW.value = '100vw'
    }
    watch(route, (newV) => {
      Object.assign(headerStyle, newV.meta.headerStyle)
      ifShowHeaderPopupBtn.value = ![
        '/bookmarks'
      ].includes(newV.path)
    })
    return {
      headerStyle,
      headerH: ref('70px'),
      showNavLink,
      ifShowMenu,
      ifShowHeaderPopupBtn,
      leftSidebarW,
      ifLarger,
      refreshViewKey,
      // 切换菜单状态
      toggleMenu: state => {
        ifShowMenu.value = (state !== undefined) ? state : !ifShowMenu.value
        showNavLink.value = false
      },
      // 切换导航状态
      toggleShowNavLink: state => {
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
