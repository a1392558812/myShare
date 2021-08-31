<script>
  /* 测试resolveDirective的 */
  import { resolveDirective,h } from 'vue'
  export default {
    render () {
      const highlightDirective = resolveDirective('highlight')
      console.log('highlightDirective', highlightDirective)
      return h (
        'h1',   // 标签名称
        {},
        '奥利给，奥利给'
      )
    }
  }
</script>
