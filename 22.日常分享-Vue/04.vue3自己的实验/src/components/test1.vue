<script>
  /* 测试withDirectives的 */
  import { resolveDirective,h,withDirectives } from 'vue'
  export default {
    render () { // highlight
      const highlight = resolveDirective('highlight')
      console.log('highlightDirective', highlight)
      return withDirectives(h('div',{},'👴乃常山赵子龙'), [
        [highlight, 'yellow'],
      ])
    }
  }
</script>
