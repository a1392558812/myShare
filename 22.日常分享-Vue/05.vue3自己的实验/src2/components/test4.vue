<template>
  <div ref="div"></div>
  <test3 ref="hello"></test3>
  <div v-for="i of 5" :key="i" :ref="refs.set">{{i}}</div>
  <div>朕的钱:{{money}}</div>
  <test5 :money="money" @update:money="doMoney"></test5>
  <div>Time Ago: {{ timeAgo }}</div>
  <input :ref="input" type="text" placeholder="Start typing to focus" />
  <div style="width: 100px;height: 75px;background: red; transform: translate3d(1px, 1px, 1px)" ref='container'></div>
  <div ref="el" style="width: 300px;height: 40px;background: orange;margin-top: 10px">
    Swipe here
    {{isSwiping}}
    {{direction}}
  </div>
  <div style="margin-top: 10px">
    <span style="margin-right: 10px" @click="numClick('+')">++</span>
    <span>{{num3}}</span>
    <span style="margin-left: 10px" @click="numClick('-')">--</span>
  </div>
</template>

<script>
import test3 from './test3'
import test5 from './test5'
import { ref, onMounted, reactive } from 'vue'
import {
  unrefElement,
  useTemplateRefsList,
  useTimeAgo,
  onStartTyping,
  useParallax,
  usePointerSwipe,
  and
} from '@vueuse/core'
export default {
  name: 'test4',
  setup () {
    const div = ref(null) // will be bind to the <div> element
    const hello = ref(null) // will be bind to the HelloWorld Component
    const refs = useTemplateRefsList()
    const timeAgo = useTimeAgo(new Date(2021, 0, 1))
    const money = ref(998)
    const input = ref(null)
    const container = ref(null)
    const parallax = reactive(useParallax(container))
    const el = ref(null)
    const { isSwiping, direction } = usePointerSwipe(el)
    const num1 = ref(2)
    const num2 = ref(2)
    const num3 = and(num1, num2)
    const numClick = (type) => {
      if (type === '+') {
        num1.value++
      } else {
        num1.value--
      }
    }
    console.log('parallax', parallax)
    onStartTyping((e) => {
      console.log('onStartTyping ->e', e)
    })
    console.log('timeAgo', timeAgo)
    const doMoney = (value) => {
      console.log('doMoney函数执行', value)
      money.value = +value
    }
    onMounted(() => {
      console.log('unrefElement div', div)
      console.log('unrefElement hello', hello)
      console.log('unrefElement div', unrefElement(div))
      console.log('unrefElement hello', unrefElement(hello))
    })
    return {
      refs,
      money,
      doMoney,
      input,
      timeAgo,
      container,
      el,
      isSwiping,
      direction,
      num3,
      numClick
    }
  },
  components: {
    test3,
    test5,
    useTimeAgo
  }
}
</script>

<style scoped>

</style>
