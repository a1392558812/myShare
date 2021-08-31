<template>
  <test3 ref="target"></test3>
  <div ref="target2">{{num}}</div>
</template>

<script>
import { templateRef, tryOnMounted } from '@vueuse/core'
import { onMounted, ref } from 'vue'

import test3 from './test3'
export default {
  name: 'test2',
  setup () {
    onMounted(() => {
      const target = templateRef('target')
      const target2 = templateRef('target2')
      console.log('👴target', target.value.num)
      console.log('👴target2', target2.value)
      tryOnMounted(() => {
        console.log('6666666666')
      }, true)
    })
    const num = ref(0)
    setInterval(() => {
      num.value++
    }, 1000)
    return {
      num
    }
  },
  components: {
    test3
  }
}
</script>

<style scoped>

</style>
