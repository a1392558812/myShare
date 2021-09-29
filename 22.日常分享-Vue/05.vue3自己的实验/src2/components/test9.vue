<template>
  <div>test9--{{doubled}}</div>
</template>

<script setup>
import { effectScope, computed, watch, watchEffect, ref } from 'vue'
const scope = effectScope()
const counter = ref(1)
const doubled = computed(() => counter.value * 10)
scope.run(() => {
  watch(doubled, () => console.log('watch监听', doubled.value))
  watchEffect(() => console.log('watchEffect监听', doubled.value))
})
let nowTimeSec = 0
const timer = setInterval(() => {
  // 处理该作用域内的所有 effect
  nowTimeSec++
  counter.value++
  if (nowTimeSec >= 5) {
    scope.stop()
  }
  if (nowTimeSec >= 10) {
    clearInterval(timer)
  }
}, 1000)
</script>

<style scoped>

</style>
