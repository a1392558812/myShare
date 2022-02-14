<template>
  <div class="error">
    <div class="error-tip">你又进行了什么操作才进了这个页面</div>
    <router-link replace to="/">
      <img class="error-img" :src="imgSrc" alt="">
    </router-link>
    <router-link class="error-back" replace to="/">返回首页</router-link>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const imgSrc = ref(require('@/static/image/heishou.png'))
</script>
<style lang="scss" scoped>
  .error{
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    &-tip{
      font-size: 17px;
      padding: 15px 0;
    }
    &-img{
      border: 1px solid #000;
    }
    &-back{
      font-size: 17px;
      padding: 15px 0;
    }
  }
</style>
