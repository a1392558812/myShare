<template>
  <div class="hello"></div>
  <div> sm:{{sm}}</div>
  <div> md:{{md}}</div>
  <div> lg:{{lg}}</div>
  <div> xl:{{xl}}</div>
  <div>2xl:{{xxl}}</div>
  <div>3xl:{{xxxl}}</div>
  <Receiver />
  <test2></test2>
  <div>---------------------------------</div>
  <test4></test4>
</template>

<script>
import { ref, provide } from 'vue'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import Receiver from './test.vue'
import test2 from './test2'
import test4 from './test4'
export const ArrayKey = Symbol(null)
export default {
  name: 'HelloWorld',
  setup () {
    const array = ref([])
    const breakpoints = useBreakpoints(breakpointsTailwind)
    const sm = breakpoints.smaller('sm')
    const md = breakpoints.between('sm', 'md')
    const lg = breakpoints.between('md', 'lg')
    const xl = breakpoints.between('lg', 'xl')
    const xxl = breakpoints.between('xl', '2xl')
    const xxxl = breakpoints.greater('2xl')
    const timer = setInterval(() => {
      if (array.value.length > 3) {
        clearInterval(timer)
      }
      array.value.push({ key: '🐮' })
    }, 600)
    provide(ArrayKey, array)
    return {
      sm,
      md,
      lg,
      xl,
      xxl,
      xxxl,
      array
    }
  },
  components: {
    Receiver,
    test2,
    test4
  }
}
</script>

<style scoped lang="scss">

</style>
