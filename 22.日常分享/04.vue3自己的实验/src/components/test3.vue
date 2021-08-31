<script>
  import { h, useCssModule } from 'vue'
  export default {
    setup () {
      debugger
      const style = useCssModule()
      console.log('style', style)
      return () => h('div', {
        class: style.success
      }, 'Task complete!')
    }
  }
</script>

