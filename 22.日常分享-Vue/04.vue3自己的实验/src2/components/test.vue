<template>
  <div>{{computedArray}}</div>
</template>

<script lang="ts">
import { computedInject } from '@vueuse/core'
import { ref } from 'vue'
import { ArrayKey } from './HelloWorld'
export default {
  name: 'test',
  setup () {
    const computedArray = computedInject(ArrayKey, (source) => {
      if (!source) {
        return ref([])
      } else {
        console.log('source', source)
        return [...source.value]
      }
    })
    return {
      computedArray
    }
  }
}
</script>

<style scoped>
</style>
