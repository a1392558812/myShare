<script>
import list from '@/static/list.js'
import { reactive, ref } from 'vue'

export default {
  name: 'left-sidebar',
  props: {
    leftSidebarW: {
      type: String,
      default: '300px'
    },
    ifLarger: {
      type: Boolean,
      default: true
    },
    ifShowMenu: {
      type: Boolean,
      default: true
    }
  },
  setup (props) {
    const renderList = (list) => {
      return list.map(item => {
        if (item.children) {
          item.ifShow = false
          renderList(item.children)
        } else {
          item.itemActive = false
        }
        return item
      })
    }
    return {
      list: reactive(renderList(list)),
      nowActive: ref(null),
      sidebarClassName: () => {
        let classname = 'left-sidebar'
        if (!props.ifLarger) {
          classname = `${classname} absolute bg-white width-auto ${props.ifShowMenu ? 'translateX-0' : 'translateX-100'}`
        }
        console.log('classname', classname)
        return classname
      },
      handelClick: (index) => {
        console.log(index)
      }
    }
  },
  render () {
    const renderFun = ({ item, grade, list, firstLevelIndex, url, indexPage }) => {
      if (item) {
        grade++
        const renderList = item && item.children ? item.children : []
        // 列表点击
        const listClick = () => {
          item.ifShow = !item.ifShow
          this.nowActive = firstLevelIndex
        }
        // 子项点击
        const itemClick = () => {
          console.log('indexPage', indexPage)
          this.nowActive = firstLevelIndex
          list.map(child => {
            child.itemActive = false
            return child
          })
          item.itemActive = true
          this.$router.push({
            path: '/',
            query: { indexPage }
          })
          if (item.link) {
            this.$emit('linkClick', item.link)
          } else {
            this.$emit('itemClick', url)
          }
        }
        const className = () => {
          let className = 'pointer cell'
          if (item.link) {
            className = `${className} link-cell`
          } else {
            className = `${className} ${renderList.length ? 'list-cell' : 'item-cell'}`
          }
          if (item.itemActive) {
            className = `${className} item-active`
          }
          return className
        }
        return (<>
          <div
            className={className()}
            onclick={renderList.length ? () => { listClick() } : () => { itemClick() }}
            style={{ marginLeft: `${grade * 25}px` }}
            key={item.index}>
            { grade === 0 && this.nowActive === firstLevelIndex ? (<div className='list-active'></div>) : null }
            <div className='cell-item'>
              { item.link ? (<div class='cell-item-link'>链接</div>) : null}
              {item.name}
              { item.topping ? (<div className='topping'>置顶</div>) : null}
            </div>
          </div>
          {('ifShow' in item && item.ifShow) ? renderList.map((child, childIndex) => {
            return (<renderFun
              item={child}
              list={renderList}
              key={childIndex}
              firstLevelIndex={firstLevelIndex}
              indexPage={`${indexPage}-${childIndex}`}
              url={[...url, child.name]}
              grade={grade}></renderFun>)
          }) : null }
        </>
        )
      } else {
        return null
      }
    }
    console.log('this.ifLarger', this.ifLarger)

    return (
      <div className={this.sidebarClassName()}>
        {
          this.list.map((item, index) => {
            return <renderFun
              item={item}
              key={index}
              grade={-1}
              list={this.list}
              url={[item.name]}
              indexPage={index}
              firstLevelIndex={index}></renderFun>
          })
        }
      </div>
    )
  }
}
</script>

<style scoped lang="scss">
.left-sidebar{
  width: v-bind(leftSidebarW);
  height: 100%;
  overflow: scroll;
  border-right: 1px solid #eee;
  padding: 0 20px;
  z-index: 2;
  ::v-deep(.pointer){
    cursor: pointer;
  }
  ::v-deep(.cell){
    border-bottom: 1px solid #eee;
    line-height: 1.5;
    &-item{
      &-link{
        margin: 5px;
        height: 14px;
        border-radius: 5px;
        padding: 5px 10px;
        display: inline-block;
        font-size: 14px;
        line-height: 1;
        white-space:nowrap;
        background-color: skyblue;
        color: #fff;
      }
    }
    .topping{
      margin: 5px;
      height: 14px;
      border-radius: 5px;
      padding: 5px 10px;
      display: inline-block;
      font-size: 14px;
      line-height: 1;
      white-space:nowrap;
      background-color: #42b983;
      color: #fff;
    }
  }
  ::v-deep(.list-cell){
    position: relative;
    z-index: 0;
    color: #000;
    padding: 20px 0;
    font-size: 18px;
    font-weight: 600;
    .list-active{
      position: absolute;
      left: -10px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      border-radius: 200px;
      height: 20px;
      background-color: #42b983;
    }
  }
  ::v-deep(.item-cell){
    color: #505d6b;
    padding: 10px 0;
    font-size: 16px;
    font-weight: 400;
    &:hover{
      color: #42b983;
    }
  }
  ::v-deep(.link-cell){
    color: #006895;
  }
  ::v-deep(.item-active){
    color: #42b983;
  }
}
</style>
