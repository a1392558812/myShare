<template>
  <div
    :style="{padding: ifLarger ? '0 50px' : '0 20px'}"
    class="layout-header flex flex-direction-row-reverse justify-content-space-between align-items-center">
    <div class="relative flex align-items-center justify-content-center bg-white">
      <common-nav-link v-if="ifLarger" :ifLarger="ifLarger" @goHome="goHome"/>
      <commonm-btn class="nav" v-else :wave-active="true" @click="toggleShowNavLink">导航</commonm-btn>
      <div class="relative popup-wrap">
        <commonm-btn :wave-active="true" @btnClick="showPopup = !showPopup">通知</commonm-btn>
        <!-- 弹出层 -->
        <div v-if="showPopup" class="absolute popup">
          <div class="popup-inner flex flex-direction-column">
            <p class="title flex align-items-center justify-content-center">{{ noticeTitle }}</p>
            <p class="cell">如有疑问联系我QQ:1392558812</p>
            <p v-for="(item, index) in notice" :key="index" class="cell">{{index + 1}}.{{item}}</p>
          </div>
          <div class="mask" @click="showPopup = !showPopup"></div>
        </div>
      </div>
    </div>
    <!-- 移动端显示的切换菜单栏按钮 -->
    <commonm-btn v-if="!ifLarger && ifShowHeaderPopupBtn" :wave-active="true" @btnClick="menuOpen">
      <svg class="icon" style="width: 1em;height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2096"><path d="M170.667 170.667h682.666a42.667 42.667 0 0 1 0 85.333H170.667a42.667 42.667 0 1 1 0-85.333z m0 298.666h682.666a42.667 42.667 0 0 1 0 85.334H170.667a42.667 42.667 0 0 1 0-85.334z m0 298.667h682.666a42.667 42.667 0 0 1 0 85.333H170.667a42.667 42.667 0 0 1 0-85.333z" p-id="2097"></path></svg>
    </commonm-btn>
  </div>
</template>

<script>
import { ref, reactive, toRefs } from 'vue'

import { notice, noticeTitle } from '@/static/notice'
import commonmBtn from '@/components/button'
import commonNavLink from '@/components/common/nav-link'

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
    commonNavLink
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
      notice: reactive(notice),
      noticeTitle: ref(noticeTitle),
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
    .popup{
      right: 20px;
      top: calc(100% + 15px);
      background-color: #fff;
      border: 1px solid #eee;
      border-radius: 5px;
      .mask{
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        z-index: 999;
      }
      .popup-inner{
        position: relative;
        line-height: 1;
        padding: 0 10px;
        z-index: 10;
        .title{
          line-height: 1;
          padding: 15px 20px;
          font-weight: 600;
          margin: 0;
          border-bottom: 1px solid #eee;
          white-space:nowrap;
        }
        .cell{
          padding: 10px 15px;
          white-space:nowrap;
          margin: 0;
        }
      }
      &::after{
        display: block;
        content: '';
        position: absolute;
        width: 17px;
        height: 17px;
        top: 0;
        transform: translate(-20px, -50%) rotate(45deg);
        right: 0;
        background-color: #fff;
        border-top: 1px solid #eee;
        border-left: 1px solid #eee;
        z-index: 1;
      }
    }
  }
  .nav-link-small{
    width: 60%;
    background-color: red;
    border: 5px solid #000;
  }
}
</style>
