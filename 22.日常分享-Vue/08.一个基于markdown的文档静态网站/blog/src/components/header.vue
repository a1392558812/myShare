<template>
  <div :style="{padding: ifLarger ? '0 50px' : '0 20px'}" class="layout-header">
    <div class="popup-wrap">
      <commonm-btn :wave-active="true" @btnClick="showPopup = !showPopup">通知</commonm-btn>
      <div v-if="showPopup" class="popup">
        <div class="popup-inner">
          <p class="title">{{ noticeTitle }}</p>
          <p v-for="(item, index) in notice" :key="index" class="cell">{{index + 1}}.{{item}}</p>
        </div>
        <div class="mask" @click="showPopup = !showPopup"></div>
      </div>
    </div>
    <commonm-btn v-if="!ifLarger" :wave-active="true" @btnClick="menuOpen">
      <svg class="icon" style="width: 1em;height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2096"><path d="M170.667 170.667h682.666a42.667 42.667 0 0 1 0 85.333H170.667a42.667 42.667 0 1 1 0-85.333z m0 298.666h682.666a42.667 42.667 0 0 1 0 85.334H170.667a42.667 42.667 0 0 1 0-85.334z m0 298.667h682.666a42.667 42.667 0 0 1 0 85.333H170.667a42.667 42.667 0 0 1 0-85.333z" p-id="2097"></path></svg>
    </commonm-btn>
  </div>
</template>

<script>
import { notice, noticeTitle } from '@/static/notice'
import commonmBtn from '@/components/button'
import { ref, reactive } from 'vue'
export default {
  name: 'header',
  props: {
    headerH: {
      type: String,
      default: '50px'
    },
    ifLarger: {
      type: Boolean,
      default: true
    }
  },
  components: {
    commonmBtn
  },
  setup (props, { emit }) {
    const showPopup = ref(false)
    return {
      showPopup,
      notice: reactive(notice),
      noticeTitle: ref(noticeTitle),
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
  left: 0;
  top: 0;
  width: 100vw;
  height: v-bind(headerH);
  background-color: #fff;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  .popup-wrap{
    position: relative;
    box-sizing: border-box;
    .popup{
      position: absolute;
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
        display: flex;
        position: relative;
        flex-direction: column;
        line-height: 1;
        padding: 0 10px;
        z-index: 10;
        .title{
          display: flex;
          align-items: center;
          justify-content: center;
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
}
</style>
