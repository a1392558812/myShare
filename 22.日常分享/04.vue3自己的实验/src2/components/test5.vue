<template>
  <input type="text" v-model="doMoney">
</template>

<script>
import { useVModel } from '@vueuse/core'
export default {
  name: 'test5',
  props: {
    money: Number
  },
  setup (props, { emit }) {
    const doMoney = useVModel(props, 'money', emit)
    console.log('doMoney', doMoney.value) // props.data
    return {
      doMoney
    }
  }
}
</script>

<style scoped>

</style>
