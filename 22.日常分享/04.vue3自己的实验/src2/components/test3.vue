<template>
  <div style="color: red">{{num}}</div>
</template>

<script>
import { ref } from 'vue'
export default {
  name: 'test3',
  setup () {
    const num = ref(2)
    /* setInterval(() => {
      num.value++
    }, 200) */
    return {
      num
    }
  }
}
</script>

<style scoped>

</style>
