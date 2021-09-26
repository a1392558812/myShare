
<script>
  /* 测试resolveDirective的 */
  import { h, mergeProps } from 'vue'
  export default {
    data() {
      return {
        name: '李老八'
      }
    },
    methods:{
      getName() {
        console.log('my name is 韩梅梅')
      }
    },
    render () {
      const props = mergeProps({
        // 该 class 将与 $attrs 中的其他 class 合并。
        class: 'active'
      }, this.$attrs)
      debugger
      console.log('this.$attrs',this, this.$attrs)
      return h (
        'h1',   // 标签名称
        props,
        '奥利给，奥利给'
      )
    }
  }
</script>
