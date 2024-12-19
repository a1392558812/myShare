<template>
    <div class="cursor-pointer custom-div">
        <div>远程.vue文件加载成功！！！</div>
        <div>父级传入的inputValue: {{ inputValue }}</div>
        <div @click="handleClick">clicl-me触发事件: 【{{ count }}】</div>
        <div>在此输入emit到父组件的值：<input style="padding: 5px 10px" v-model="inputStr"/></div>
    </div>
</template>

<script>
import { ref, customRef } from 'vue'
export default {
  props: {
    inputValue: {
      type: String,
      default: ''
    }
  },
  emits: ['loadFileValue'],
  setup (props, { emit }) {
    const count = ref(0)
    const customRefInput = (value) => {
      return customRef((track, trigger) => {
        return {
          get () {
            track() // 追踪后续数据的变化
            return value
          },
          set (newValue) {
            value = newValue
            trigger() // 重新解析模板
            emit('loadFileValue', newValue)
          }
        }
      })
    }
    const inputStr = customRefInput('')
    const handleClick = () => {
      console.log('handleClick', count)
      count.value = count.value + 1
    }
    return {
      count,
      inputStr,
      handleClick
    }
  }
}

</script>
<style scoped>
.custom-div{
    font-size: 16px;
}
</style>
