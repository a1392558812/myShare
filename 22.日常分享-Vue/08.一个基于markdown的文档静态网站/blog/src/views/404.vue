<template>
  <div style="font-size: 16px" class="flex flex-direction-column">
    <div class="not-find margin-top-50 flex justify-content-center">404</div>
    <router-link class="margin-top-50 flex justify-content-center" replace to="/">返回首页</router-link>
    <div class="margin-top-50 flex justify-content-center">假装这里有张404插画</div>

    <a class="margin-top-50 cursor-pointer flex justify-content-center" href="https://github.com/chokcoco/CSS-Inspiration">下面css动画来自大佬：chokcoco</a>
    <div class="flex justify-content-center">https://github.com/chokcoco/CSS-Inspiration</div>
    <div class="flex justify-content-center">觉得有意思，就拿来用了</div>

    <div class="margin-top-50 flex justify-content-center overflow-hidden">
      <div class="ananimationt-wrap relative">
        <div class="ananimationt"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: '404'
}
</script>

<style scoped lang="scss">
  .margin-top-50{
    margin-top: 50px;
  }
  .not-find{
    font-size: 90px;
  }
  .ananimationt-wrap{
    margin: -10px;
    padding: 50px 100px;
    display: flex;
    background: #000;
    filter: blur(3px) contrast(10);
    .ananimationt {
      position: relative;
      width: 80px;
      height: 120px;
      background:
        radial-gradient(circle at 60px 40px, #000, #000 7px, transparent 7px),
        radial-gradient(circle at 40px 40px, #000, #000 7px, transparent 7px),
        radial-gradient(circle at 50px 50px, #fff, #fff);
      background-size: 100% 100%;
      background-repeat: no-repeat;
      margin: auto;
      border-radius: 40px 40px 60px 20px;
      transform: skewX(-10deg);
      animation: moveMain 2s infinite ease-out;
    }

    .ananimationt::before,
    .ananimationt::after {
      content: "";
      position: absolute;
      background: #fff;
      border-radius: 50%;
    }

    .ananimationt::before {
      width: 20px;
      height: 20px;
      top: 50px;
      left: -10px;
      box-shadow: 0 0 0 1px #fff;
      animation: move 2s infinite ease-in;
    }

    .ananimationt::after {
      width: 30px;
      height: 25px;
      top: 95px;
      left: -10px;
      box-shadow: 0 0 0 1px #fff;
      animation: move2 2s infinite ease-in;
    }
  }

  @keyframes move {
    80%,
    100% {
      box-shadow: -60px 0 0 .5px rgba(255, 255, 255, .5);
    }
  }

  @keyframes move2 {
    80%,
    100% {
      box-shadow: -100px 0 0 .5px rgba(255, 255, 255, .2);
    }
  }

  @keyframes moveMain {
    42% {
      transform: skewX(-10deg) translate(40px, 0);
    }
  }
</style>
