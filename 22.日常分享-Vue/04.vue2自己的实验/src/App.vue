<template>
  <div id="app">
    <test8></test8>
    <test7></test7>
    <test4></test4>
    <test3></test3>
  </div>
</template>
<script>
  import test8 from './components/test8'
  import test7 from './components/test7'
  import test4 from './components/test4'
  import test3 from './components/test3'
export default {
  created(){

  },
  components: {
    test3,
    test4,
    test7,
    test8
  }
}
</script>
<style lang="scss">
  html,body,p{
    margin: 0;
    padding: 0;
  }
</style>
