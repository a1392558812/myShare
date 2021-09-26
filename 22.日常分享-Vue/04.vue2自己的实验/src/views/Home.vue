<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  data() {
    return {
      data1: {},
      data2: '',
      data3: []
    }
  },
  computed: {
    dataChange() {
      return `${this.data1}-${this.data2}-${this.data3}`;
    },
  },
  watch:{
    dataChange(newV, oldV) {

    }
  },
  components: {
    HelloWorld
  }
}
</script>
