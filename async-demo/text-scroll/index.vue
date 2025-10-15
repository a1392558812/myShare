<template>
  <div class="text-scroll">
    <div class="text-scroll-content"></div>
    <div class="text-scroll-text">
      <div>滚动鼠标滚轮</div>
      <div class="animated-text-wrap">
        <span v-for="(char, index) in list" :key="index" class="animated-text" :style="{
          'animation-range-start': `${index * 100 / list.length}%`,
          'animation-range-end': `${(index + 1) * 100 / list.length}%`
        }">
          <!-- 动画何时开始，何时结束 -->
          {{ char }}
        </span>
      </div>
    </div>
    <div class="text-scroll-boll"></div>
    <div class="text-scroll-code">
      <codeContent />
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import baseConfig from '../static/hooks/extends.js'
defineOptions({
  extends: baseConfig(),
})

const str = ref('这是一条滚动的文本,用于演示animation-timeline，打开【F12】下载完整.vue文件')
const list = ref(str.value.split(''))

</script>
<style scoped lang="scss">
.text-scroll {
  height: 100vh;
  scroll-timeline: --square-timeline y;
  /* Firefox supports the older "vertical" syntax */
  scroll-timeline: --square-timeline vertical;
  overflow: auto;

  .text-scroll-content {
    height: 400vh;
    position: relative;
    z-index: 1;
  }

  .text-scroll-text {
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 0;

    animation-name: bgChange;
    animation-duration: 1ms;
    animation-timeline: --square-timeline;
    animation-fill-mode: both;
    transition: all;

    font-size: 30px;
    font-weight: bold;

    .animated-text-wrap {
      width: 800px;

      .animated-text {
        animation-name: fadeIn;
        animation-duration: 1ms;
        animation-timeline: --square-timeline;
        animation-fill-mode: both;
      }
    }
  }

  .text-scroll-boll {
    position: fixed;
    top: 50%;
    left: 50%;
    animation-name: ballChange;
    animation-duration: 1ms;
    animation-timeline: --square-timeline;
    animation-fill-mode: both;
  }

  .text-scroll-code {
    position: relative;
    z-index: 100;
  }
}

@keyframes fadeIn {
  0% {
    color: rgba(0, 0, 0, 0.1);
    transform: translateY(0);
  }

  50% {
    color: rgba(255, 101, 147, 0.55);
    transform: translateY(-0.3em) scale(1.4);
  }

  100% {
    color: rgb(255, 101, 147, 1);
    transform: translateY(0);
  }
}

@keyframes bgChange {
  0% {
    background: #ffffff;
  }

  100% {
    background: #f6d5fa;
  }
}

@keyframes ballChange {
  0% {
    width: 0;
    height: 0;
    transform: translate(-50%, -50%);
    border: 0px solid rgb(255, 101, 147, 1);
    border-radius: 0%;
  }

  25% {
    width: 365px;
    height: 365px;
    transform: translate(0%, 0%);
    border: 1px solid rgb(255, 101, 147, 1);
    border-radius: 0%;
  }

  50% {
    width: 365px;
    height: 365px;
    transform: translate(0%, 0%);
    border: 1px solid rgb(255, 101, 147, 1);
    border-radius: 50%;
  }

  100% {
    width: 450px;
    height: 450px;
    transform: translate(-50%, -50%);
    border: 1px solid rgb(255, 101, 147, 1);
    border-radius: 50%;
  }
}
</style>
