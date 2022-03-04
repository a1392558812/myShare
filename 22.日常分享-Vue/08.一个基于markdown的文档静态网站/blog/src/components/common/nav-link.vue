<script>
import { useRouter } from 'vue-router'
import { readonly } from 'vue'
export default {
  name: 'nav-link',
  props: {
    ifLarger: {
      type: Boolean,
      default: true
    }
  },
  emits: ['goHome', 'toggleShowNavLink'],
  setup (props, { emit }) {
    const router = useRouter()
    const imageUrl = readonly(require('@/static/image/heishou2.jpg'))
    return {
      imageUrl,
      goHome: () => {
        emit('goHome')
      },
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
          <div
            className='go-home cursor-pointer nav-link-item flex align-items-center justify-content-start'
            onClick={() => { this.navigatorTo('/bookmarks') }}>书签</div>
          <div
            className='go-home cursor-pointer nav-link-item flex align-items-center justify-content-start'
            onClick={() => { this.navigatorTo('/bingDwenDwen') }}>冰墩墩</div>
          <div
            className="go-home cursor-pointer nav-link-item flex align-items-center justify-content-start"
            onClick={() => { this.goHome() }}>
            <img className="heishou" src={this.imageUrl}/>
            <p>首页</p>
          </div>
          <div
            className="my-info cursor-pointer nav-link-item flex align-items-center justify-content-start"
            onClick={() => { this.goHome() }}>

          </div>
        </div>
      </>
    )
  }
}
</script>

<style scoped lang="scss">
  .go-home{
    margin-right: 30px;
    min-height: 1.5em;
    color: #00aa88;
    text-decoration: none;
    .heishou{
      width: 1em;
      height: 1em;
    }
  }
  .nav-link-item{
    padding-top: 5px;
    padding-bottom: 5px;
    line-height: 1;
  }
</style>
