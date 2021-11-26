<template>
  <div class="loading" v-if="showModal">
    <div class="loadEffect">
      <span
        v-for="(item, index) in list"
        :class="`loading-item loading-${index}`">
        {{item}}
      </span>
    </div>
  </div>
</template>

<script>
  export default {
    name: "test6",
    props:{
      showModal:{
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        list: [
          '🐮','🐴','🐮','🐴','🐮','🐴','🐮','🐴',
        ]
      }
    }
  }
</script>

<style scoped lang="scss">
  $scale: 1;
  .loading{
    position: absolute;
    left: 0;
    top: 0;
    z-index: 9999;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .loadEffect{
    width: 100px / $scale;
    height: 100px / $scale;
    position: relative;
    margin: 0 auto;
  }
  .loadEffect span{
    display: inline-block;
    position: absolute;
    -webkit-animation: load 1.04s ease infinite;
  }
  @-webkit-keyframes load{
    0%{
      -webkit-transform: scale(1.2);
      opacity: 1;
    }
    100%{
      -webkit-transform: scale(.3);
      opacity: 0.5;
    }
  }
  .loadEffect span:nth-child(1){
    left: 0;
    top: 50%;
    margin-top:-10px / $scale;
    -webkit-animation-delay:0.13s;
  }
  .loadEffect span:nth-child(2){
    left: 14px / $scale;
    top: 14px / $scale;
    -webkit-animation-delay:0.26s;
  }
  .loadEffect span:nth-child(3){
    left: 50%;
    top: 0;
    margin-left: -10px / $scale;
    -webkit-animation-delay:0.39s;
  }
  .loadEffect span:nth-child(4){
    top: 14px / $scale;
    right:14px / $scale;
    -webkit-animation-delay:0.52s;
  }
  .loadEffect span:nth-child(5){
    right: 0;
    top: 50%;
    margin-top: -10px / $scale;
    -webkit-animation-delay:0.65s;
  }
  .loadEffect span:nth-child(6){
    right: 14px / $scale;
    bottom: 14px / $scale;
    -webkit-animation-delay:0.78s;
  }
  .loadEffect span:nth-child(7){
    bottom: 0;
    left: 50%;
    margin-left: -10px / $scale;
    -webkit-animation-delay:0.91s;
  }
  .loadEffect span:nth-child(8){
    bottom: 14px / $scale;
    left: 14px / $scale;
    -webkit-animation-delay:1.04s;
  }
</style>
