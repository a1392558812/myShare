<template>
  <div
    :style="{padding: ifLarger ? '0 50px' : '0 20px'}"
    class="layout-header flex flex-direction-row-reverse justify-content-space-between align-items-center">
    <div class="relative flex align-items-center justify-content-center bg-white">
      <common-nav-link v-if="ifLarger" :ifLarger="ifLarger" @goHome="goHome"/>
      <commonm-btn class="nav" v-else :wave-active="true" @click="toggleShowNavLink">导航</commonm-btn>
      <div class="relative popup-wrap">
        <commonm-btn :wave-active="true" @btnClick="showPopup = !showPopup">通知</commonm-btn>
        <!-- 通知栏 -->
        <notice-popup :ifLarger="ifLarger" v-model:showPopup="showPopup"></notice-popup>
      </div>
    </div>
    <!-- 移动端显示的切换菜单栏按钮 -->
    <commonm-btn v-if="!ifLarger && ifShowHeaderPopupBtn" :wave-active="true" @btnClick="menuOpen">
      <svg
        class="icon"
        style="width: 1em;height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="2096">
        <path d="M170.667 170.667h682.666a42.667 42.667 0 0 1 0 85.333H170.667a42.667 42.667 0 1 1 0-85.333z m0 298.666h682.666a42.667 42.667 0 0 1 0 85.334H170.667a42.667 42.667 0 0 1 0-85.334z m0 298.667h682.666a42.667 42.667 0 0 1 0 85.333H170.667a42.667 42.667 0 0 1 0-85.333z" p-id="2097"></path>
      </svg>
    </commonm-btn>
  </div>
</template>

<script>
import { ref, toRefs } from 'vue'

import commonmBtn from '@/components/button'
import commonNavLink from '@/components/common/nav-link'
import noticePopup from './notice'

import useGoHome from '@/hook/common/useGoHome'

export default {
  name: 'layout-header',
  props: {
    headerH: {
      type: String,
      default: '50px'
    },
    ifLarger: {
      type: Boolean,
      default: true
    },
    ifShowHeaderPopupBtn: {
      type: Boolean,
      default: true
    },
    showNavLink: {
      type: Boolean,
      default: false
    }
  },
  components: {
    commonmBtn,
    commonNavLink,
    noticePopup
  },
  setup (props, { emit }) {
    const showPopup = ref(false)
    const { showNavLink } = toRefs(props)
    const toggleShowNavLink = () => {
      emit('toggleShowNavLink', !showNavLink.value)
    }
    const { goHome } = useGoHome(emit)
    return {
      showPopup,
      goHome,
      toggleShowNavLink,
      menuOpen: () => {
        emit('toggleMenu')
      }
    }
  }
}
</script>

<style scoped lang="scss">
.layout-header{
  z-index: 3;
  padding: 0 50px;
  box-sizing: border-box;
  position: fixed;
  font-size: 16px;
  left: 0;
  top: 0;
  width: 100vw;
  height: v-bind(headerH);
  background-color: #fff;
  border-bottom: 1px solid #eee;
  .nav{
    margin-right: 20px;
  }
  .popup-wrap{
    box-sizing: border-box;
  }
  .nav-link-small{
    width: 60%;
    background-color: red;
    border: 5px solid #000;
  }
}
</style>
