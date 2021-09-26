<template>
  <div style="background: yellow">
    <div>{{value1}}</div>
    <div>{{value2.name}}</div>
    <div>
      <text v-for="(item, index) in value3" :key="index">{{item}}--</text>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
export default {
  name: 'test6',
  setup () {
    const value1 = ref(1)
    const value2 = reactive({ name: '💉💧🐂🍺' })
    const value3 = reactive(['🐮🐎'])
    const promise = () => new Promise((resolve) => {
      setTimeout(() => {
        value1.value++
        value2.name = 'emmmmmmmmmmm'
        value3.push('噩梦')
        resolve()
      }, 2000)
    })
    promise().then(_ => {
      console.log('俩秒过后this')
    })
    return {
      value1,
      value2,
      value3
    }
  },
  data () {
    return {
      value4: 1,
      value5: { name: '💉💧🐂🍺' },
      value6: ['🐮🐎']
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      this.value4++
      this.value5.name = '666666666'
      this.value6.push('🐮啊')
      console.log(this.value4, this.value5, this.value6)
      setTimeout(() => {
        Object.assign(this.$data, this.$options.data())
        console.log(this.value4, this.value5, this.value6)
      }, 2000)
    }
  }
}
</script>

<style scoped>

</style>
