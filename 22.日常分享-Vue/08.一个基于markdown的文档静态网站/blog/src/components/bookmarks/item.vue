<script>
export default {
  name: 'item',
  props: {
    level: {
      type: Number,
      default: 0
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  setup (props) {
    const renderFun = () => ({ level, data, index = -1 }) => {
      const handelClick = (item) => {
        if (!level) return
        item.ifRender = true
        item.ifShow = !item.ifShow
      }
      const ifRender = () => {
        if (!level) return true
        return ('ifRender' in data) && data.ifRender && 'ifShow' in data
      }
      const vNode = renderFun()
      return (<>
        {
          data.href
            ? (
              <div className="link flex">
                { index !== -1 ? (<div className="link-item">{index + 1}-</div>) : null }
                {
                  data.icon
                    ? (<img className="link-img" src={data.icon}/>)
                    : (<div className="link-img flex align-items-center justify-content-space-between">🥵</div>)
                }
                <a className="link-item" href={data.href}>{data.name}</a>
              </div>
            )
            : (
              <div className="flex align-items-center">
                <div className="title-item" onClick={() => handelClick(data)}>
                  <span className="cursor-pointer ">{data.name}</span>
                </div>
                {
                  level ? (
                    <svg className="drop-down-icon"
                      style={{
                        width: '1em',
                        height: '1em',
                        verticalAlign: 'middle',
                        fill: 'currentColor',
                        overflow: 'hidden',
                        transition: 'all 0.5s',
                        transform: `rotate(${!level ? true : data.ifShow ? 0 : 180}deg)`
                      }}
                      viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5880">
                      <path
                        d="M878.592 250.88q29.696 0 48.128 11.264t24.576 29.696 0 41.472-26.624 45.568q-82.944 92.16-159.744 180.224t-148.48 164.864q-19.456 20.48-45.568 31.744t-53.76 11.776-53.248-8.704-43.008-28.672q-39.936-44.032-82.944-90.112l-88.064-92.16q-43.008-46.08-85.504-90.624t-79.36-86.528q-17.408-19.456-22.528-40.448t1.024-38.4 23.552-28.672 45.056-11.264q35.84 0 98.816-0.512t137.728-0.512l153.6 0 150.528 0 125.952 0 79.872 0z"
                        p-id="5881"></path>
                    </svg>
                  ) : null
                }
              </div>
            )
        }

        {
          (ifRender() && data.child && data.child.length)
            ? data.child.map((item, index) => {
              return (
                <div
                  style={{ marginLeft: '15px' }}
                  className={`content ${!level ? true : data.ifShow ? '' : 'display-none'}`}
                  key={index}>
                  <vNode level={level + 1} data={item} index={index}/>
                </div>
              )
            })
            : null
        }
      </>)
    }
    return {
      renderFun
    }
  },
  render () {
    const vNode = this.renderFun()
    return <div className="bookmarks-main">
      <vNode level={this.level} data={this.data}/>
    </div>
  }
}
</script>

<style scoped lang="scss">
  .bookmarks-main{
    ::v-deep(.link){
      padding: 5px;
      font-size: 15px;
      .link-img{
        margin: 0.25em;
        width: 1.25em;
        height: 1.25em;
        line-height: 1.25;
      }
      .link-item{
        display: inline-block;
        margin: 0 0 0 0.25em;
        line-height: 1.5;
        &:hover{
          color: #42b983;
        }
      }
    }
    ::v-deep(.title-item){
      display: inline-block;
      word-spacing: 0.04em;
      color: #42b983;
      font-weight: bold;
      padding: 5px;
      font-size: 18px;
    }
    ::v-deep(.drop-down-icon){
      display: block;
      background-color: yellow;
    }
  }
</style>
