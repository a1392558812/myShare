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
  emits: ['goHome', 'toggleShowNavLink'],
  setup (props, { emit }) {
    const router = useRouter()
    return {
      goHome: () => {
        emit('goHome')
      },
      navigatorTo: (item) => {
        if (item.newPage) return window.open(`./#${item.url}`)
        emit('toggleShowNavLink', false)
        router.push(item.url)
      }
    }
  },
  render () {
    const smallScreenClass = 'flex flex-direction-column'
    return (
      <>
        <div className={this.ifLarger ? 'flex' : smallScreenClass}>
          {
            [
              { name: 'listen music', url: '/music', newPage: true },
              { name: '书签', url: '/bookmarks' },
              { name: '冰墩墩', url: '/bingDwenDwen' }
            ].map(item => {
              return (
                <div
                  className='go-home cursor-pointer nav-link-item flex align-items-center justify-content-start'
                  key={item.url}
                  onClick={() => { this.navigatorTo(item) }}>{item.name}</div>
              )
            })
          }
          <div
            className="go-home cursor-pointer nav-link-item flex align-items-center justify-content-start"
            onClick={() => { this.goHome() }}>
            <img className="heishou" src={require('@/static/image/heishou2.jpg')}/>
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
