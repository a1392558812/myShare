<script>
import { useRouter } from 'vue-router'
export default {
  name: 'nav-link',
  props: {
    ifLarger: {
      type: Boolean,
      default: true
    }
  },
  setup (props, { emit }) {
    const router = useRouter()
    return {
      navigatorTo: (url) => {
        emit('toggleShowNavLink', false)
        router.push(url)
      }
    }
  },
  render () {
    const smallScreenClass = 'flex flex-direction-column'
    return (
      <>
        <div className={this.ifLarger ? 'flex' : smallScreenClass}>
          <div className='go-home cursor-pointer nav-link-item' onClick={() => { this.navigatorTo('/bookmarks') }}>书签</div>
          <div className='go-home cursor-pointer nav-link-item' onClick={() => { this.navigatorTo('/bingDwenDwen') }}>冰墩墩</div>
          <div className="go-home cursor-pointer nav-link-item" onClick={() => { this.$emit('goHome') }}>首页</div>
        </div>
      </>
    )
  }
}
</script>

<style scoped lang="scss">
  .go-home{
    margin-right: 30px;
    color: #00aa88;
    text-decoration: none;
  }
  .nav-link-item{
    padding-top: 5px;
    padding-bottom: 5px;
  }
</style>
