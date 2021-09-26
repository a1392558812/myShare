<template>
  <div id="app">
    <test3></test3>
  </div>
</template>
<script>
import test3 from './components/test3'
console.log(test3)
export default {
  created(){

  },
  components: {
    test3
  }
}
</script>
<style lang="scss">
  html,body,p{
    margin: 0;
    padding: 0;
  }
</style>
