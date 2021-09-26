<template>
  <test7>
    <div @click="handelClick">无情的test7测试组件,点击了{{num}}次</div>
  </test7>
</template>

<script>
import test7 from './test7'
import { ref } from 'vue'
export default {
  name: 'test8',
  components: {
    test7
  },
  setup () {
    const num = ref(0)
    const handelClick = () => {
      console.log('test8组件被点击了')
      num.value += 1
    }
    return {
      num,
      handelClick
    }
  }
}
</script>

<style scoped>

</style>
