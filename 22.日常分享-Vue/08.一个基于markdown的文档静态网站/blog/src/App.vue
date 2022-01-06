<template>
  <div id="page">
    <layout-header
      :ifLarger="ifLarger"
      @toggleMenu="toggleMenu"
      @refreshView="refreshView"
      :headerH="headerH"/>
    <div class="content">
      <router-view
        :key="refreshViewKey"
        :ifShowMenu="ifShowMenu"
        :leftSidebarW="leftSidebarW"
        :ifLarger="ifLarger"/>
    </div>
  </div>
</template>
<script>

import { ref } from 'vue'
import guid from '@/common/util/guid.js'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

import layoutHeader from '@/components/header.vue'

export default {
  components: {
    layoutHeader
  },
  setup () {
    const ifShowMenu = ref(false)
    const ifLarger = useBreakpoints(breakpointsTailwind).greater('sm')
    const leftSidebarW = ref('400px')
    const refreshViewKey = ref(guid())
    if (!ifLarger) {
      leftSidebarW.value = '100vw'
    }
    return {
      headerH: ref('70px'),
      leftSidebarW,
      ifLarger,
      ifShowMenu,
      refreshViewKey,
      // 切换菜单状态
      toggleMenu: () => {
        ifShowMenu.value = !ifShowMenu.value
      },
      refreshView: () => {
        refreshViewKey.value = guid()
      }
    }
  }
}
</script>

<style lang="scss">
#page{
  height: 100vh;
  position: relative;
  .content{
    height: calc(100vh - v-bind(headerH));
    padding-top: v-bind(headerH);
  }
}
</style>
